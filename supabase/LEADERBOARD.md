# Activate the monthly competition

Deploying the static website does not install database functions. Use the Supabase project configured in `simulator/cloud-config.js` (`lgdjxwjwfpjpdbkljywn`). No service-role key belongs in the website or chat.

In that project's SQL Editor, review and run these files in order:

1. `security-progress-constraints.sql` expands the optional progress allowlist to all 75 labs. Existing rows are preserved; new writes must have the supported shape.
2. `leaderboard.sql` installs public usernames and owner-only profile management. The existing `simulator-progress.sql` table and policies are prerequisites.
3. `monthly-competition.sql` installs automatic enrollment, server-timed lab runs and the monthly top 20.

All three are repeatable and preserve learning progress. Use your normal backup process before changing the schema. A static-site deployment alone cannot activate the competition. The browser's publishable key cannot perform database administration.

After installation, open Leaderboard → Refresh rankings. It should report an empty monthly board rather than “not activated”. Sign in, choose a username and start a lab: the account should appear at zero points immediately. Complete the lab and verify its level's points appear. Replay it to check that no additional points are awarded for the same lab that month. Verify another account cannot finish that run or access private records.

## Rules displayed to players

- Starting a lab automatically enrolls the signed-in player using their chosen public username. The first start prompt explains this before the player presses **Enroll and start lab**. No separate opt-in checkbox is used.
- Sign-in is required for enrollment. If the competition service is unavailable, a player may explicitly choose unranked practice; the site does not claim that this creates an entry or earns prize points.
- The calendar month uses **America/Toronto** time. Both start and completion must be recorded by the server in the same month, before midnight on the first day of the next month.
- Level 1 earns **100 points**, Level 2 **200**, Level 3 **300**. Each distinct lab scores once per month. Replays can score again in a new month after a fresh start and completion. Lifetime progress is retained and is never imported into monthly results.
- Ranking order: most points, then most completed labs, then earliest time reaching that result. If server timestamps also tie exactly, earlier enrollment and a stable private account-ID sort produce a deterministic order.
- The monthly winner receives one **CAD $50 Amazon voucher from PrempehTech**, across all disciplines. Track filters do not create separate prizes. A positive score is required; a zero-score entrant cannot win.
- One account per player. Results are provisional until PrempehTech reviews the winner and arranges voucher delivery.
- The public board shows at most 20 real entrants, including players who have started but have not yet scored. Closed months can be viewed for review.
- Withdrawal hides the profile without erasing learning progress. Starting another lab enrolls the account again, retaining that month's already recorded scores.

## What is protected and what is not

The database controls enrollment time, completion receipt time, month boundaries, scoring weights and one-score-per-lab uniqueness. Players cannot write run rows directly, finish another player's run, choose a timestamp, backdate results or inflate monthly scores by editing lifetime XP. Public results expose only username, rank, points and completion counts. Emails, account IDs and raw run records stay private.

Lab execution still runs in the browser. An authenticated user can forge a completion request for their own started run; this is not tamper-proof assessment. Review the leading player's lab work and account activity before awarding the voucher. Server-side assessment validation would be required before unattended prize awards. The site does not buy, send or automatically award vouchers, and does not send prize emails.

Run `monthly-winner-review.sql` as the project administrator after month end to review the previous month's leading candidates and their private account contact information. Do not make this query an anonymous RPC. Verify results and record your fulfillment decision before sending the voucher. The public historical board remains provisional and can change if a player withdraws or renames their profile; it is not an immutable award ledger.

The automated PostgreSQL test checks repeatable migration installation, protected tables, anonymous restrictions, account isolation, automatic enrollment, replay protection, month reset, no lifetime import, all tie-break rules, Toronto daylight-saving boundaries, withdrawal and the 20-player cap. Browser tests cover name validation, sign-in, automatic enrollment, unavailable-service practice, score retries and every lab walkthrough.
