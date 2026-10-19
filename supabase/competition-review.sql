-- Administrator-only: run in the Supabase SQL editor. Never expose as a public RPC.
-- Review flags are leads, not proof of cheating. Do not auto-disqualify fast learners.
select p.display_name,r.month,r.track,r.slot,r.started_at,r.completed_at,
 cardinality(r.verified_tasks) as verified_tasks,cardinality(r.validated_tasks) as credited_tasks,
 v.flags,v.attempts,v.reviewed_at,v.review_note,r.id as run_id
from public.simulator_competition_runs r
join public.simulator_leaderboard_profiles p on p.user_id=r.user_id
left join public.simulator_competition_review v on v.run_id=r.id
order by r.month desc,cardinality(v.flags) desc nulls last,p.display_name;
-- After reviewing evidence, record a decision using the chosen run_id:
-- update public.simulator_competition_review set reviewed_at=clock_timestamp(),
-- review_note='Reviewed with learner; eligibility decision and reasons here' where run_id='UUID';
