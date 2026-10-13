# Activate the monthly competition

Deploying the static website does not install database functions. Use the Supabase project configured in `simulator/cloud-config.js` (`lgdjxwjwfpjpdbkljywn`). Run the activity migration last when repeating the setup, because it upgrades the monthly ranking calculation. No service-role key belongs in the website or chat.

In that project's SQL Editor, review and run these files in order:

1. `security-progress-constraints.sql` expands the optional progress allowlist to all 75 labs. Existing rows are preserved; new writes must have the supported shape.
2. `leaderboard.sql` installs public usernames and owner-only profile management. The existing `simulator-progress.sql` table and policies are prerequisites.
3. `monthly-competition.sql` installs automatic enrollment, server-timed lab runs and the monthly top 20.

4. `monthly-activity.sql` installs per-lab activity tracking and the task allowlist for all 75 labs. If you already installed the first three files, run only this new file.

All four are repeatable and preserve learning progress. Use your normal backup process before changing the schema. A static-site deployment alone cannot activate the competition. The browser's publishable key cannot perform database administration.

After installation, open Leaderboard → Refresh rankings. It should report an empty monthly board rather than “not activated”. Sign in, choose a username and start a lab: the account should appear at zero points immediately. Validate one task and check that proportional points appear before completion. Complete the lab and check that its total reaches the level's maximum without double counting. Replay it to check that no additional points are awarded for the same lab that month. Verify another account cannot finish that run or access private records.

## Rules displayed to players

- Starting a lab automatically enrolls the signed-in player using their chosen public username. The first start prompt explains this before the player presses **Enroll and start lab**. No separate opt-in checkbox is used.
- Sign-in is required for enrollment. If the competition service is unavailable, a player may explicitly choose unranked practice; the site does not claim that this creates an entry or earns prize points.
- The calendar month uses **America/Toronto** time. Enrollment and each scoring activity must be recorded by the server in the same month, before midnight on the first day of the next month.
- Level 1 earns up to **100 points**, Level 2 **200**, Level 3 **300**. Points accrue as tasks are validated: `floor(lab maximum × distinct validated tasks / total tasks)`. Completing the lab earns its full value, including points already earned; it does not award an additional bonus. Each task contributes once per lab per month. Replays can score again in a new month after a fresh start and completion. Lifetime progress is retained and is never imported into monthly results.
- Ranking order: most points, then most completed labs, then earliest time reaching that result. If server timestamps also tie exactly, earlier enrollment and a stable private account-ID sort produce a deterministic order.
- The monthly winner receives one **CAD $50 Amazon voucher from PrempehTech**, across all disciplines. Track filters do not create separate prizes. A positive score is required; a zero-score entrant cannot win.
- One account per player. Results are provisional until PrempehTech reviews the winner and arranges voucher delivery.
- The public board shows at most 20 real entrants, including players who have started but have not yet scored. Closed months can be viewed for review.
- Withdrawal hides the profile without erasing learning progress. Starting another lab enrolls the account again, retaining that month's already recorded scores.

## What is protected and what is not

The database controls enrollment time, completion receipt time, month boundaries, scoring weights and one-score-per-lab uniqueness. Players cannot write run rows directly, finish another player's run, choose a timestamp, backdate results or inflate monthly scores by editing lifetime XP. Public results expose username, rank, points, completion counts and the per-lab status, validated count and activity timestamps. Emails, account IDs and raw run records stay private.

Lab execution still runs in the browser. An authenticated user can forge a completion request for their own started run; this is not tamper-proof assessment. Review the leading player's lab work and account activity before awarding the voucher. Server-side assessment validation would be required before unattended prize awards. The site does not buy, send or automatically award vouchers, and does not send prize emails.

Run `monthly-winner-review.sql` as the project administrator after month end to review the previous month's leading candidates and their private account contact information. Do not make this query an anonymous RPC. Verify results and record your fulfillment decision before sending the voucher. The public historical board remains provisional and can change if a player withdraws or renames their profile; it is not an immutable award ledger.

The automated PostgreSQL test checks repeatable migration installation, protected tables, anonymous restrictions, account isolation, automatic enrollment, replay protection, month reset, no lifetime import, all tie-break rules, Toronto daylight-saving boundaries, withdrawal and the 20-player cap. Browser tests cover name validation, sign-in, automatic enrollment, unavailable-service practice, score retries and every lab walkthrough.

## Activity across every lab

On the top-20 board, choose **View labs** next to any player. **My activity across all labs** also works for a player outside the top 20. The selected month and discipline apply to the breakdown: all disciplines shows all 75 labs; one discipline shows its 15 labs. Each row shows its level/title, Not started / In progress / Completed, distinct validated tasks and monthly points earned so far.

The browser sends task IDs only after validation passes, with pending updates kept for retry on refresh or reconnection. The database checks the run owner, current month, profile visibility and the lab-specific task allowlist. Repeating a task does not inflate its validated count. Incomplete labs earn proportional points as tasks are validated. All 75 labs contribute; completed-lab count remains the first tie-break after points. Historical completions show full task progress even if recorded before this upgrade.

New starts disclose that usernames, scores and lab progress are public. Withdrawing hides both the leaderboard and activity view. These remain browser-reported validations, not tamper-proof assessment. Raw commands, field values, account IDs and emails are not returned by the activity API.
