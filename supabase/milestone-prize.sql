-- Run LAST after verified-competition.sql and cybersecurity-beginners.sql.
-- Repeatable. No automatic payout or email sending. Existing CAD 50 prize is unchanged.
begin;
lock table public.simulator_competition_runs in share row exclusive mode;
create table if not exists public.simulator_milestone_settings (
 id boolean primary key default true check(id), starts_month date not null,
 activated_at timestamptz not null default clock_timestamp()
);
create table if not exists public.simulator_milestone_entries (
 sequence bigint generated always as identity unique,
 month date not null, user_id uuid not null references auth.users(id),
 reached_at timestamptz not null default clock_timestamp(), points integer not null check(points>=4000),
 contact_choice text not null default 'pending' check(contact_choice in ('pending','email','external','forfeited')),
 contact_email text check(contact_email is null or length(contact_email) between 3 and 254),
 contact_at timestamptz, review_state text not null default 'pending' check(review_state in ('pending','approved','rejected')),
 review_note text, reviewed_at timestamptz, fulfilled_at timestamptz,
 primary key(month,user_id),
 check(contact_email is null or contact_choice='email'),
 check(fulfilled_at is null or review_state='approved')
);
create unique index if not exists simulator_one_milestone_award_per_month
 on public.simulator_milestone_entries(month) where review_state='approved';
alter table public.simulator_milestone_settings enable row level security;
alter table public.simulator_milestone_entries enable row level security;
revoke all on public.simulator_milestone_settings,public.simulator_milestone_entries from public,anon,authenticated;
revoke all on sequence public.simulator_milestone_entries_sequence_seq from public,anon,authenticated;
-- Never invent a historical crossing time: if anyone is already at 4000, start next month.
insert into public.simulator_milestone_settings(id,starts_month)
select true, (date_trunc('month',clock_timestamp() at time zone 'America/Toronto')+
 case when exists(
 select 1 from public.simulator_competition_runs r
 join public.simulator_lab_task_catalog c on c.track=r.track and c.slot=r.slot
 join public.simulator_leaderboard_profiles p on p.user_id=r.user_id and p.opted_in
 where r.month=date_trunc('month',clock_timestamp() at time zone 'America/Toronto')::date
 group by r.user_id having sum(public.simulator_activity_points(r.slot,cardinality(r.validated_tasks),cardinality(c.task_ids),r.completed_at is not null))>=4000
 ) then interval '1 month' else interval '0 months' end)::date
on conflict(id) do nothing;

create or replace function public.simulator_milestone_points(p_user uuid,p_month date)
returns integer language sql stable security definer set search_path='' as $$
 select coalesce(sum(public.simulator_activity_points(r.slot,cardinality(r.validated_tasks),cardinality(c.task_ids),r.completed_at is not null)),0)::integer
 from public.simulator_competition_runs r join public.simulator_lab_task_catalog c on c.track=r.track and c.slot=r.slot
 where r.user_id=p_user and r.month=p_month;
$$;
create or replace function public.simulator_milestone_record()
returns void language plpgsql security definer set search_path='' as $$
declare m date:=date_trunc('month',clock_timestamp() at time zone 'America/Toronto')::date; score integer;
begin
 if auth.uid() is null or not exists(select 1 from public.simulator_milestone_settings where starts_month<=m)
 or not exists(select 1 from public.simulator_leaderboard_profiles where user_id=auth.uid() and opted_in) then return; end if;
 score:=public.simulator_milestone_points(auth.uid(),m);
 if score>=4000 then
 insert into public.simulator_milestone_entries(month,user_id,points) values(m,auth.uid(),score) on conflict(month,user_id) do nothing;
 end if;
end; $$;
-- Keep the existing evidence checks, but make all scoring commits take the same lock first.
do $$ begin
 if to_regprocedure('public.simulator_verify_before_milestone(uuid,jsonb)') is null then
  alter function public.simulator_competition_verify(uuid,jsonb) rename to simulator_verify_before_milestone;
 end if;
 if to_regprocedure('public.simulator_finish_before_milestone(uuid)') is null then
  alter function public.simulator_competition_finish(uuid) rename to simulator_finish_before_milestone;
 end if;
end $$;
create or replace function public.simulator_competition_verify(p_run uuid,p_evidence jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null then raise exception 'Player session required' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(4000,200);
 result:=public.simulator_verify_before_milestone(p_run,p_evidence);
 if result->>'accepted'='true' then perform public.simulator_milestone_record(); end if;
 return result;
end; $$;
create or replace function public.simulator_competition_finish(p_run uuid)
returns integer language plpgsql security definer set search_path='' as $$
declare result integer;
begin
 if auth.uid() is null then raise exception 'Player session required' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(4000,200);
 result:=public.simulator_finish_before_milestone(p_run);
 perform public.simulator_milestone_record();return result;
end; $$;

create or replace function public.simulator_milestone_status()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare m date:=date_trunc('month',now() at time zone 'America/Toronto')::date; starts date; first_entry record;
begin
 select starts_month into starts from public.simulator_milestone_settings where id;
 select e.review_state,e.fulfilled_at,p.display_name into first_entry from public.simulator_milestone_entries e
 left join public.simulator_leaderboard_profiles p on p.user_id=e.user_id and p.opted_in
 where e.month=m and e.contact_choice<>'forfeited' and e.review_state<>'rejected'
 order by e.sequence limit 1;
 return jsonb_build_object('month',m,'starts_month',starts,'active',starts<=m,'threshold',4000,'amount',200,'currency','CAD',
 'candidate',case when found then jsonb_build_object('display_name',first_entry.display_name,'state',case when first_entry.fulfilled_at is not null then 'fulfilled' else first_entry.review_state end) else null end);
end; $$;
create or replace function public.simulator_my_milestone()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare m date:=date_trunc('month',now() at time zone 'America/Toronto')::date; entry public.simulator_milestone_entries;
begin
 if auth.uid() is null then raise exception 'Player session required' using errcode='42501'; end if;
 select * into entry from public.simulator_milestone_entries where month=m and user_id=auth.uid();
 return jsonb_build_object('month',m,'points',public.simulator_milestone_points(auth.uid(),m),
 'reached',entry.user_id is not null,'contact_choice',coalesce(entry.contact_choice,'pending'),'review_state',coalesce(entry.review_state,'pending'));
end; $$;
create or replace function public.simulator_milestone_contact(p_choice text,p_email text default null)
returns void language plpgsql security definer set search_path='' as $$
declare m date:=date_trunc('month',clock_timestamp() at time zone 'America/Toronto')::date; entry public.simulator_milestone_entries;
begin
 if auth.uid() is null then raise exception 'Player session required' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(4000,200);
 select * into entry from public.simulator_milestone_entries where month=m and user_id=auth.uid() for update;
 if not found then raise exception 'Reach 4000 server-recorded points first' using errcode='42501'; end if;
 if entry.contact_choice='forfeited' then raise exception 'This month’s CAD 200 prize was forfeited' using errcode='42501'; end if;
 if entry.review_state<>'pending' then raise exception 'Prize already reviewed; contact the organizer' using errcode='42501'; end if;
 if p_choice is null or p_choice not in ('email','external','forfeited') then raise exception 'Invalid contact choice'; end if;
 if p_choice='email' and (p_email is null or length(p_email)>254 or btrim(p_email)!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') then raise exception 'Enter a valid email'; end if;
 update public.simulator_milestone_entries set contact_choice=p_choice,
 contact_email=case when p_choice='email' then btrim(p_email) else null end,contact_at=clock_timestamp()
 where month=m and user_id=auth.uid();
end; $$;

-- Administrator-only approval. A screenshot is supporting evidence, not proof of ownership.
create or replace function public.simulator_milestone_review(p_month date,p_user uuid,p_decision text,p_note text)
returns void language plpgsql security definer set search_path='' as $$
declare candidate uuid; choice text;
begin
 perform pg_advisory_xact_lock(4000,200);
 if p_decision is null or p_decision not in ('approved','rejected') or p_note is null or length(btrim(p_note))<10 then raise exception 'Document the eligibility, identity and evidence review'; end if;
 if exists(select 1 from public.simulator_milestone_entries where month=p_month and review_state='approved') then raise exception 'This month already has an approved winner'; end if;
 select user_id,contact_choice into candidate,choice from public.simulator_milestone_entries
 where month=p_month and contact_choice<>'forfeited' and review_state<>'rejected' order by sequence limit 1;
 if candidate is null or candidate is distinct from p_user then raise exception 'Review the earliest eligible crossing first'; end if;
 if p_decision='approved' and choice not in ('email','external') then raise exception 'Prize contact is required'; end if;
 update public.simulator_milestone_entries set review_state=p_decision,review_note=p_note,reviewed_at=clock_timestamp() where month=p_month and user_id=p_user;
end; $$;
revoke all on function public.simulator_milestone_points(uuid,date),public.simulator_milestone_record(),public.simulator_verify_before_milestone(uuid,jsonb),public.simulator_finish_before_milestone(uuid),public.simulator_milestone_review(date,uuid,text,text) from public,anon,authenticated;
revoke all on function public.simulator_competition_verify(uuid,jsonb),public.simulator_competition_finish(uuid),public.simulator_my_milestone(),public.simulator_milestone_contact(text,text) from public,anon;
grant execute on function public.simulator_competition_verify(uuid,jsonb),public.simulator_competition_finish(uuid),public.simulator_my_milestone(),public.simulator_milestone_contact(text,text) to authenticated;
revoke all on function public.simulator_milestone_status() from public;
grant execute on function public.simulator_milestone_status() to anon,authenticated;

-- Preserve milestone identity when the optional guest recovery service is installed.
do $hook$ begin
 if to_regprocedure('public.simulator_recovery_redeem(text)') is not null then
 execute $definition$create or replace function public.simulator_recovery_redeem(p_code text)
returns text language plpgsql security definer set search_path='' as $$
declare source_id uuid; player_name text;
begin
 perform pg_advisory_xact_lock(4000,200);
 if auth.uid() is null or not exists(select 1 from auth.users where id=auth.uid() and is_anonymous) then raise exception 'Use a new guest session to recover' using errcode='42501'; end if;
 perform 1 from auth.users where id=auth.uid() for update;
 if p_code is null or p_code !~ '^[a-f0-9]{64}$' then raise exception 'Invalid or used code'; end if;
 select user_id into source_id from public.simulator_recovery where code_hash=encode(sha256(convert_to(p_code,'UTF8')),'hex') for update;
 if source_id is null or source_id=auth.uid() then raise exception 'Invalid, used, or current identity code'; end if;
 if exists(select 1 from public.simulator_competition_runs where user_id=auth.uid()) or exists(select 1 from public.simulator_leaderboard_profiles where user_id=auth.uid()) then raise exception 'Recover in a fresh browser session before enrolling. Existing players cannot be merged.'; end if;
 -- Transfer ownership, not a copy; the previous guest session loses access to these records.
 update public.simulator_leaderboard_profiles set user_id=auth.uid() where user_id=source_id returning display_name into player_name;
 update public.simulator_competition_runs set user_id=auth.uid() where user_id=source_id;
 delete from public.simulator_progress where user_id=auth.uid();
 update public.simulator_progress set user_id=auth.uid() where user_id=source_id;
 update public.simulator_prize_awards set user_id=auth.uid() where user_id=source_id;
 update public.simulator_prize_claims set user_id=auth.uid() where user_id=source_id;
 update public.simulator_milestone_entries set user_id=auth.uid() where user_id=source_id;
 delete from public.simulator_recovery where user_id in (source_id,auth.uid());
 return coalesce(player_name,'');
end; $$;
$definition$;
 end if;
end $hook$;
commit;
