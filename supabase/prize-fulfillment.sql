-- Administrator only: run in the Supabase SQL Editor. Never publish results.
-- First review monthly-winner-review.sql and competition-review.sql.
-- Approve a CLOSED month only after confirming eligibility and suspicious-activity flags.
-- Copy the reviewed player's user_id into this template (remove the comment to execute):
-- insert into public.simulator_prize_awards(month,user_id,review_note)
-- values ('YYYY-MM-01','REVIEWED-PLAYER-UUID','Reviewed evidence and eligibility; CAD 50 Amazon voucher approved');

select a.month,p.display_name,a.user_id,a.review_note,a.approved_at,
 c.contact_email,c.submitted_at,a.fulfilled_at
from public.simulator_prize_awards a
left join public.simulator_leaderboard_profiles p on p.user_id=a.user_id
left join public.simulator_prize_claims c on c.month=a.month and c.user_id=a.user_id
order by a.month desc;

-- After personally arranging delivery (no automated purchase or delivery):
-- update public.simulator_prize_awards set fulfilled_at=now() where month='YYYY-MM-01';
-- Delete private contact after fulfillment when no longer needed:
-- delete from public.simulator_prize_claims where month='YYYY-MM-01';
