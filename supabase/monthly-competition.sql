-- Run after leaderboard.sql. Repeatable; existing learning progress is unchanged.
begin;
create table if not exists public.simulator_competition_runs (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 month date not null,
 track text not null check(track in ('networking','sysadmin','cyber','cloud','integrated')),
 slot integer not null check(slot between 1 and 15),
 started_at timestamptz not null default clock_timestamp(),
 completed_at timestamptz,
 unique(user_id,month,track,slot)
);
alter table public.simulator_competition_runs enable row level security;
revoke all on public.simulator_competition_runs from public,anon,authenticated;
create index if not exists simulator_competition_month on public.simulator_competition_runs(month,user_id);

create or replace function public.simulator_competition_status()
returns table(month date,closes_at timestamptz,time_zone text)
language sql stable security definer set search_path='' as $$
 select date_trunc('month',now() at time zone 'America/Toronto')::date,
 (date_trunc('month',now() at time zone 'America/Toronto')+interval '1 month') at time zone 'America/Toronto',
 'America/Toronto'::text;
$$;

create or replace function public.simulator_competition_start(p_name text,p_track text,p_slot integer)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_month date; v_id uuid;
begin
 if auth.uid() is null then raise exception 'Sign in before entering' using errcode='42501'; end if;
 if p_track is null or p_track not in ('networking','sysadmin','cyber','cloud','integrated') or p_slot is null or p_slot not between 1 and 15 then
  raise exception 'Unknown lab' using errcode='22023';
 end if;
 -- Starting is enrollment. Public name disclosure is shown before the Start action.
 perform public.simulator_leaderboard_profile(p_name,true);
 v_month:=date_trunc('month',clock_timestamp() at time zone 'America/Toronto')::date;
 insert into public.simulator_competition_runs(user_id,month,track,slot)
 values(auth.uid(),v_month,p_track,p_slot)
 on conflict(user_id,month,track,slot) do nothing;
 select r.id into v_id from public.simulator_competition_runs r
 where r.user_id=auth.uid() and r.month=v_month and r.track=p_track and r.slot=p_slot;
 return v_id;
end; $$;

create or replace function public.simulator_competition_finish(p_run uuid)
returns integer language plpgsql security definer set search_path='' as $$
declare r public.simulator_competition_runs; v_now timestamptz:=clock_timestamp();
begin
 if auth.uid() is null then raise exception 'Sign in first' using errcode='42501'; end if;
 select * into r from public.simulator_competition_runs x where x.id=p_run and x.user_id=auth.uid() for update;
 if not found then raise exception 'Start this lab before recording completion' using errcode='42501'; end if;
 if r.month<>date_trunc('month',v_now at time zone 'America/Toronto')::date then
  raise exception 'Month closed. Restart and complete the lab for the new month.' using errcode='22023';
 end if;
 if not exists(select 1 from public.simulator_leaderboard_profiles p where p.user_id=auth.uid() and p.opted_in) then
  raise exception 'Entry withdrawn. Start a lab to enroll again.' using errcode='42501';
 end if;
 if r.completed_at is not null then return 0; end if;
 update public.simulator_competition_runs set completed_at=v_now where id=r.id;
 return ((r.slot-1)/5+1)*100;
end; $$;

create or replace function public.simulator_monthly_leaderboard(p_track text default 'all',p_month date default null)
returns table(place bigint,display_name text,points bigint,level_one bigint,level_two bigint,level_three bigint)
language plpgsql stable security definer set search_path='' as $$
declare v_month date:=coalesce(p_month,date_trunc('month',now() at time zone 'America/Toronto')::date);
begin
 if p_track is null or p_track not in ('all','networking','sysadmin','cyber','cloud','integrated') then raise exception 'Unknown discipline'; end if;
 if v_month<>date_trunc('month',v_month)::date or v_month>date_trunc('month',now() at time zone 'America/Toronto')::date then raise exception 'Invalid month'; end if;
 return query
 with totals as (
  select r.user_id,p.display_name,
   coalesce(sum(((r.slot-1)/5+1)*100) filter(where r.completed_at is not null),0)::bigint as score,
   count(*) filter(where r.completed_at is not null and r.slot<=5) as l1,
   count(*) filter(where r.completed_at is not null and r.slot between 6 and 10) as l2,
   count(*) filter(where r.completed_at is not null and r.slot>=11) as l3,
   max(r.completed_at) as reached_at,min(r.started_at) as joined_at
  from public.simulator_competition_runs r
  join public.simulator_leaderboard_profiles p on p.user_id=r.user_id and p.opted_in
  where r.month=v_month and (p_track='all' or r.track=p_track)
  group by r.user_id,p.display_name
 )
 select row_number() over(order by t.score desc,(t.l1+t.l2+t.l3) desc,t.reached_at asc nulls last,t.joined_at,t.user_id),
 t.display_name,t.score,t.l1,t.l2,t.l3
 from totals t order by t.score desc,(t.l1+t.l2+t.l3) desc,t.reached_at asc nulls last,t.joined_at,t.user_id limit 20;
end; $$;
-- Scores are server-timed but lab execution remains client-reported. Review prize eligibility before fulfillment.
revoke all on function public.simulator_competition_status() from public;
grant execute on function public.simulator_competition_status() to anon,authenticated;
revoke all on function public.simulator_competition_start(text,text,integer) from public,anon;
grant execute on function public.simulator_competition_start(text,text,integer) to authenticated;
revoke all on function public.simulator_competition_finish(uuid) from public,anon;
grant execute on function public.simulator_competition_finish(uuid) to authenticated;
revoke all on function public.simulator_monthly_leaderboard(text,date) from public;
grant execute on function public.simulator_monthly_leaderboard(text,date) to anon,authenticated;
commit;
