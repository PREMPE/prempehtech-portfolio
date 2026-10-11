# Activate the public top-20 leaderboard

Deploying the static website does not install database functions. Use the Supabase project already configured in `simulator/cloud-config.js` (project reference `lgdjxwjwfpjpdbkljywn`). No service-role key belongs in the website or chat.

1. In the Supabase dashboard, open that project → SQL Editor → New query.
2. Review and run `security-progress-constraints.sql`. This expands the optional progress allowlist to all 75 labs and replaces earlier narrower constraints without deleting progress. Existing rows are preserved with NOT VALID; new writes must have the supported shape.
3. In another query, review and run `leaderboard.sql` in full. The existing `simulator-progress.sql` table and owner-only policies are prerequisites (already used by cloud saves).
4. Open the simulator → Leaderboard → Refresh rankings. A new board will say no ranked completions yet, not “not activated”.
5. Sign in with a test learner, choose a preferred username, explicitly opt in, complete a lab, and refresh rankings after cloud sync. Check removal hides the profile while cloud progress remains.

Both migrations are repeatable. Neither deletes lab progress. Take your normal database backup before schema changes. The automated SQL test uses an isolated PostgreSQL container and checks repeated installation, access restrictions, unique names, scoring, the 20-player cap and opt-out.

## Player behavior

Every scored lab launch requires a valid preferred username, remembered per account (or guest browser). Public participation is optional and requires sign-in. Public names are unique without regard to letter case, 3–24 characters, and may contain letters, numbers, spaces, underscores and hyphens. Email addresses are rejected. Existing public names can be changed in Leaderboard → Join / update profile.

Only opted-in learners with saved completions appear. At most 20 real learners are displayed; fewer are shown until more qualify. There are no placeholder players. Each distinct completed lab earns 100/200/300 ranking points for Level 1/2/3. Replays add nothing. Higher advanced completion totals break equal-point ties; otherwise learners share a rank. Discipline filters apply before ranking. These practice rankings use client-reported completion, not independently verified assessment results.

Public results contain only rank, chosen name, points and completion counts. Emails, account IDs and private progress JSON are not returned. Only the signed-in owner can update/remove a profile or read their own visibility preference. Opt-out deletes the public profile, leaving progress intact.

The browser handles an uninstalled backend explicitly and still permits private labs. Database administration cannot be performed with the website's publishable browser key.
