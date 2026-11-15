-- Run after cybersecurity-beginners.sql. Preserves all scores and existing API compatibility.
-- 50 displayed rows plus one lookahead row. Only public profile fields are returned.
begin;
create or replace function public.simulator_monthly_leaderboard_page(p_track text default 'all',p_month date default null,p_offset integer default 0)
returns table(place bigint,display_name text,points bigint,level_one bigint,level_two bigint,level_three bigint)
language plpgsql stable security definer set search_path='' as $$
declare v_month date:=coalesce(p_month,date_trunc('month',now() at time zone 'America/Toronto')::date);
begin
 if p_offset is null or p_offset<0 then raise exception 'Invalid page offset' using errcode='22023'; end if;
 if p_track is null or p_track not in ('all','networking','sysadmin','cyber','cloud','integrated') then raise exception 'Unknown discipline'; end if;
 if v_month<>date_trunc('month',v_month)::date or v_month>date_trunc('month',now() at time zone 'America/Toronto')::date then raise exception 'Invalid month'; end if;
 return query
 with totals as (
  select r.user_id,p.display_name,
   sum(public.simulator_activity_points(r.slot,cardinality(r.validated_tasks),cardinality(c.task_ids),r.completed_at is not null))::bigint as score,
   count(*) filter(where r.completed_at is not null and (r.slot<=5 or r.slot between 16 and 25)) as l1,
   count(*) filter(where r.completed_at is not null and r.slot between 6 and 10) as l2,
   count(*) filter(where r.completed_at is not null and r.slot between 11 and 15) as l3,
   max(greatest(r.completed_at,r.last_activity_at)) as reached_at,min(r.started_at) as joined_at
  from public.simulator_competition_runs r
  join public.simulator_lab_task_catalog c on c.track=r.track and c.slot=r.slot
  join public.simulator_leaderboard_profiles p on p.user_id=r.user_id and p.opted_in
  where r.month=v_month and (p_track='all' or r.track=p_track)
  group by r.user_id,p.display_name
 )
 select row_number() over(order by t.score desc,(t.l1+t.l2+t.l3) desc,t.reached_at asc nulls last,t.joined_at,t.user_id),
 t.display_name,t.score,t.l1,t.l2,t.l3
 from totals t order by t.score desc,(t.l1+t.l2+t.l3) desc,t.reached_at asc nulls last,t.joined_at,t.user_id limit 51 offset p_offset;
end; $$;

revoke all on function public.simulator_monthly_leaderboard_page(text,date,integer) from public;
grant execute on function public.simulator_monthly_leaderboard_page(text,date,integer) to anon,authenticated;
commit;
