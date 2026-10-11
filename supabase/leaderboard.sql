-- Run once in the site's Supabase SQL editor. No email addresses are published.
begin;
create table if not exists public.simulator_leaderboard_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (display_name ~ '^[A-Za-z0-9][A-Za-z0-9 _-]{2,23}$'),
 opted_in boolean not null default false
);
create unique index if not exists simulator_leaderboard_name_unique
 on public.simulator_leaderboard_profiles (lower(display_name));
alter table public.simulator_leaderboard_profiles enable row level security;
revoke all on public.simulator_leaderboard_profiles from anon, authenticated;
-- Only narrow RPCs can publish a profile or return aggregate practice rankings.
create or replace function public.simulator_leaderboard_profile(p_name text, p_opt_in boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Sign in first' using errcode='42501'; end if;
 if p_opt_in is null then raise exception 'Choose a visibility preference'; end if;
 if not p_opt_in then
  delete from public.simulator_leaderboard_profiles where user_id=auth.uid();
  return;
 end if;
 if p_name is null or btrim(p_name) !~ '^[A-Za-z0-9][A-Za-z0-9 _-]{2,23}$' then
  raise exception 'Use 3–24 letters, numbers, spaces, underscores or hyphens';
 end if;
 insert into public.simulator_leaderboard_profiles(user_id,display_name,opted_in)
 values(auth.uid(),btrim(p_name),true)
 on conflict(user_id) do update set display_name=excluded.display_name,opted_in=true;
end; $$;
create or replace function public.simulator_leaderboard(p_track text default 'all')
returns table(place bigint,display_name text,points bigint,level_one bigint,level_two bigint,level_three bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
 if p_track is null or p_track not in ('all','networking','sysadmin','cyber','cloud','integrated') then
  raise exception 'Unknown discipline';
 end if;
 return query
 with valid as (
  select lp.display_name, split_part(k.key,':',1) as track,
   split_part(k.key,':',2)::integer as slot
  from public.simulator_leaderboard_profiles lp
  join public.simulator_progress sp on sp.user_id=lp.user_id
  cross join lateral jsonb_each(case when jsonb_typeof(sp.progress->'completedLevels')='object'
    then sp.progress->'completedLevels' else '{}'::jsonb end) k
  where lp.opted_in and k.value='true'::jsonb
    and k.key ~ '^(networking|sysadmin|cyber|cloud|integrated):([1-9]|1[0-5])$'
    and (p_track='all' or split_part(k.key,':',1)=p_track)
 ), counts as (
  select v.display_name,
   count(*) filter(where slot<=5) as l1,
   count(*) filter(where slot between 6 and 10) as l2,
   count(*) filter(where slot>=11) as l3
  from valid v group by v.display_name
 ), scores as (
  select c.*,c.l1*100+c.l2*200+c.l3*300 as score from counts c
 )
 select rank() over(order by s.score desc,s.l3 desc),s.display_name,s.score,s.l1,s.l2,s.l3
 from scores s order by s.score desc,s.l3 desc,lower(s.display_name) limit 20;
end; $$;
revoke all on function public.simulator_leaderboard_profile(text,boolean) from public,anon;
grant execute on function public.simulator_leaderboard_profile(text,boolean) to authenticated;
revoke all on function public.simulator_leaderboard(text) from public;
grant execute on function public.simulator_leaderboard(text) to anon,authenticated;
create or replace function public.simulator_my_leaderboard_profile()
returns table(display_name text,opted_in boolean)
language sql stable security definer set search_path = '' as $$
 select p.display_name,p.opted_in from public.simulator_leaderboard_profiles p where p.user_id=auth.uid();
$$;
revoke all on function public.simulator_my_leaderboard_profile() from public,anon;
grant execute on function public.simulator_my_leaderboard_profile() to authenticated;
commit;
