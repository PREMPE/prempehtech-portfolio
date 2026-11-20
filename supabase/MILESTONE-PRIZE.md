# Additional CAD $200 monthly prize

Run `milestone-prize.sql` LAST in the Supabase SQL Editor, after the current verified
competition and cybersecurity beginner migrations. It is repeatable and preserves
existing points, enrollments, rankings and the separate CAD $50 monthly-leader voucher.
It works without the optional player-services migration. If guest recovery is installed
later, rerun this migration afterward to preserve prize identity during recovery.

The first eligible player to reach **4,000 server-recorded points across all disciplines**
in a Toronto calendar month is the first candidate for the CAD $200 prize. Both prizes
can go to the same player. No player reaches the target: no milestone prize that month.
The administrator reviews identity and evidence before approval and manually arranges
payment. Nothing buys, sends or automatically pays a prize.

## Activation

The public prize details show whether activation is pending, active, or scheduled for a
later month. If nobody has reached 4,000 when the migration runs, it starts in the current
month and existing monthly points count. If anyone has already reached the target, the
new prize starts next month: historical exact crossing times cannot be reconstructed
from current totals. Rerunning the script does not move an existing activation date.

## Contact at 4,000 points

Only the signed-in owner's server-recorded crossing unlocks the prompt. Players choose:

- Save a private contact email for this month's prize, with a clear purpose statement.
- Email **prempehtech.ca@gmail.com** with a screenshot showing their username and points.
  Selecting this option saves their choice; it does not send an email. A mailto link is
  supplied. The player must send the message and attachment themselves.
- Explicitly decline both options and confirm permanent forfeiture of that month's
  CAD $200 eligibility. This does not remove points or the CAD $50 prize eligibility.

Closing a detail window or losing a network connection does not silently forfeit a prize.
A pending contact choice keeps the earliest candidate pending. No unannounced response
deadline is enforced. Later eligible candidates are considered only after an explicit
forfeiture or a documented administrator rejection. Email fields are not shown publicly,
not returned by the public status API, and not copied to browser storage. Saved addresses
are not independently verified. Do not use them for marketing.

## Administrator review (SQL Editor only)

```sql
select e.month, e.sequence, p.display_name, e.user_id, e.reached_at, e.points,
       e.contact_choice, e.contact_email, e.review_state, e.fulfilled_at
from public.simulator_milestone_entries e
left join public.simulator_leaderboard_profiles p on p.user_id=e.user_id
order by e.month desc, e.sequence;
```

Review the earliest entry for the month that is neither forfeited nor rejected.
Check `competition-review.sql`, raw server evidence flags, identity and eligibility.
A screenshot, email address or public username alone is not proof of account ownership.
For an external claim, verify control of the winning session and the server-recorded
crossing before approval; note how verification was performed. If the player emails after the
month closes without first choosing the external option in the simulator, the administrator
can record that verified external contact on the specific entry before using the review
function. Never reverse an explicit forfeiture. Do not publish this query's
output or expose it through a public RPC. The protected tables contain private contact data.

After that review, replace the placeholders and run one decision:

```sql
select public.simulator_milestone_review(
  'YYYY-MM-01'::date, 'REVIEWED-PLAYER-UUID'::uuid, 'approved',
  'Describe identity, contact and server-evidence verification here'
);
-- To disqualify the earliest candidate after review, use 'rejected' with the reason.
```

The review function is administrator-only, requires the earliest eligible candidate,
requires a contact choice for approval, and prevents a second approval in the same month.
Record manual payment only after it has actually occurred:

```sql
update public.simulator_milestone_entries
set fulfilled_at=now()
where month='YYYY-MM-01' and review_state='approved' and fulfilled_at is null;
```

Retain private contact only as long as needed for prize administration. After fulfillment
and any dispute period, remove it using an appropriate retention process. To clear a
stored email while preserving the award, set `contact_email=null` for the specific
fulfilled row after the retention period and document the retention action. Do not alter crossing sequence or timestamps.

## Integrity and operational notes

The existing evidence-verification and completion functions retain their checks behind
private helpers. Both scoring paths take the same transaction lock before changing
scores, then record the first crossing once per user/month. A sequence orders simultaneous
crossings by serialized server acceptance; browser clocks and lifetime XP are not used.
Private helpers and prize tables cannot be called or edited by visitors. Recovery moves
the entry with its identity, preserving order, contact choice and any forfeiture.

A browser can still automate correct lab answers. This is evidence validation and order
recording, not proof of a unique human learner; manual prize review remains required.
Do not rerun older scoring migrations after this one without reviewing and reapplying the
wrappers. When changing the underlying verification functions in future, update their
private milestone helpers too; the repeatable migration preserves the existing helpers.
