-- ADMINISTRATOR-ONLY review query for the previous calendar month.
-- Do not expose this through a public RPC or publish its output: it includes account email.
-- Results remain provisional until the organizer reviews lab work and account activity.
with period as (
 select (date_trunc('month',now() at time zone 'America/Toronto')-interval '1 month')::date as month
), totals as (
 select r.user_id,p.display_name,
 sum(((r.slot-1)/5+1)*100) filter(where r.completed_at is not null) as points,
 count(*) filter(where r.completed_at is not null) as labs,
 max(r.completed_at) as reached_at,min(r.started_at) as joined_at
 from public.simulator_competition_runs r
 join public.simulator_leaderboard_profiles p on p.user_id=r.user_id and p.opted_in
 join period on r.month=period.month
 group by r.user_id,p.display_name
)
select row_number() over(order by t.points desc,t.labs desc,t.reached_at,t.joined_at,t.user_id) as candidate_rank,
 (select month from period) as month,t.display_name,t.points,t.labs,t.reached_at,t.user_id,u.email
from totals t join auth.users u on u.id=t.user_id
where t.points>0
order by t.points desc,t.labs desc,t.reached_at,t.joined_at,t.user_id limit 20;
