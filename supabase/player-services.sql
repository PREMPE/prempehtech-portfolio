-- Run LAST, after verified-competition.sql. Repeatable. No public contact details.
begin;
create table if not exists public.simulator_recovery (
 user_id uuid primary key references auth.users(id) on delete cascade,
 code_hash text not null unique, created_at timestamptz not null default now()
);
create table if not exists public.simulator_prize_awards (
 month date primary key check(month=date_trunc('month',month)::date),
 user_id uuid not null references auth.users(id),
 approved_at timestamptz not null default now(),
 review_note text not null,
 fulfilled_at timestamptz
);
create table if not exists public.simulator_prize_claims (
 month date primary key references public.simulator_prize_awards(month),
 user_id uuid not null references auth.users(id),
 contact_email text not null check(length(contact_email) between 3 and 254),
 submitted_at timestamptz not null default now()
);
alter table public.simulator_recovery enable row level security;
alter table public.simulator_prize_awards enable row level security;
alter table public.simulator_prize_claims enable row level security;
revoke all on public.simulator_recovery,public.simulator_prize_awards,public.simulator_prize_claims from public,anon,authenticated;

create or replace function public.simulator_recovery_create(p_code text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from auth.users where id=auth.uid() and is_anonymous) then raise exception 'Recovery codes are for guest players' using errcode='42501'; end if;
 perform 1 from auth.users where id=auth.uid() for update;
 if p_code is null or p_code !~ '^[a-f0-9]{64}$' then raise exception 'Invalid recovery code'; end if;
 insert into public.simulator_recovery(user_id,code_hash) values(auth.uid(),encode(sha256(convert_to(p_code,'UTF8')),'hex'))
 on conflict(user_id) do update set code_hash=excluded.code_hash,created_at=now();
end; $$;

create or replace function public.simulator_recovery_redeem(p_code text)
returns text language plpgsql security definer set search_path='' as $$
declare source_id uuid; player_name text;
begin
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
 delete from public.simulator_recovery where user_id in (source_id,auth.uid());
 return coalesce(player_name,'');
end; $$;

create or replace function public.simulator_my_prizes()
returns table(month date,fulfilled boolean,claimed boolean)
language sql stable security definer set search_path='' as $$
 select a.month,a.fulfilled_at is not null,exists(select 1 from public.simulator_prize_claims c where c.month=a.month and c.user_id=auth.uid())
 from public.simulator_prize_awards a where a.user_id=auth.uid() order by a.month desc;
$$;
create or replace function public.simulator_prize_claim(p_month date,p_email text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'No player session' using errcode='42501'; end if;
 perform 1 from public.simulator_prize_awards where month=p_month and user_id=auth.uid() and fulfilled_at is null for update;
 if not found then raise exception 'No approved unfulfilled award for this player' using errcode='42501'; end if;
 if p_email is null or length(p_email)>254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Enter a valid email'; end if;
 insert into public.simulator_prize_claims(month,user_id,contact_email) values(p_month,auth.uid(),p_email)
 on conflict(month) do update set contact_email=excluded.contact_email,submitted_at=now();
end; $$;
revoke all on function public.simulator_recovery_create(text),public.simulator_recovery_redeem(text),public.simulator_my_prizes(),public.simulator_prize_claim(date,text) from public,anon;
grant execute on function public.simulator_recovery_create(text),public.simulator_recovery_redeem(text),public.simulator_my_prizes(),public.simulator_prize_claim(date,text) to authenticated;
commit;
