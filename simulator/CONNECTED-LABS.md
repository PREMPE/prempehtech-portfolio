# Connected lab environment

All 75 existing assignments retain their IDs, field requirements, procedures and monthly point limits.

## Native tool workflows

Open a lab application, choose a resource in **Resource properties**, and click **Properties** (DNS: **New / Edit host (A)**). In consoles with a navigation tree, right-click the tree to open the resource action menu. The dialog uses the task's actual fields; it does not fill in the answers.

**Apply changes** commits the entered values, including incorrect values, to the running training configuration. **Validate configuration** applies and checks them. The existing guided controls remain available. Changing a previously verified configuration invalidates its dependent tasks and diagnostic results in the current attempt. Monthly credit already earned is historical and is not duplicated or removed.

## Connected diagnostics and recovery

Open **Lab Environment** on the desktop. Its topology shows the workstation, access switch, router and scenario consoles. Device cards open their console, expose the running values, and support power off/on and restart. Power faults block diagnostics; restarts retain configuration and require rechecking results for the affected resource. Applied addressing, route, VLAN, policy, service and cloud configuration mistakes block corresponding required checks. DNS lookups return the configured record, including a wrong address. An IP-only connectivity test can succeed independently of a bad DNS record once the client's lease is verified.

**Create configuration backup** snapshots the current configuration, validation state, command state, device power, enterprise resource state and cloud state. **Restore backup** restores that snapshot and closes stale console views. Backups and the environment log last for the current attempt only. Replaying starts a clean environment. The separate free-practice Network Studio remains available; its saved network is not used as the graded lab state.

The topology is an intentionally simplified training model, not an emulator of every OS, protocol or vendor feature. Commands outside the supported scenario remain unsupported.

## Guided and assessment modes

In Project Ticket, select **Guided / Show Me** for the full walkthrough or **Assessment · ticket and evidence only** to hide procedures, hints, explanations and command-answer guides. Assessment retains the incident ticket, acceptance criteria, evidence, configuration tools and notes. Switching modes does not add points or bypass verification. This is a learning mode, not a proctored examination; source code remains inspectable.

## Server verification

Run `supabase/verified-competition.sql` **after** `monthly-activity.sql`. The client sends configuration values and observed required-command evidence. Supabase checks ownership, month, allowed tasks, expected values, required commands and prerequisites before recording credit. The old task-ID-only endpoint is closed and finishing a new run requires all tasks to have server-verified evidence. Retries are deduplicated and completion waits for evidence upload.

Until activation, evidence stays in the player's device/account retry queue; practice works and previous scores remain. Old queued task IDs without evidence require replay. Do not clear browser data before syncing.

Use `supabase/competition-review.sql` in the SQL Editor to inspect legacy unverified runs, rejected submissions, rate-limit flags and unusually rapid completion. Flags are review leads, not automatic disqualification. Review the monthly candidates before issuing the voucher. No voucher purchasing or delivery is automated.

Server checks reject unsupported claims; they do not prove human execution in a trusted browser. A person can still script correct known answers. Prize review remains necessary. Raw configuration evidence is evaluated but is not retained in the server review table; it stores a digest and review metadata. The rules and review tables are not accessible to public or signed-in browser roles.

## Saved attempts, reports, and operational evidence

Open **Save attempt**, **Evidence & incidents**, **Progress report**, or **Player dashboard**
from the lab desktop. Attempts autosave every ten seconds, when a task is validated,
when leaving the lab, and when the page is hidden. Reopening the same lab offers
**Resume attempt** or **Start fresh**. Saving includes running configuration, command
state, validated evidence, ticket notes, window layout and draft form values. Storage
is scoped to the player, lab and Toronto calendar month. Completed attempts replay
fresh; new months start fresh so old task evidence cannot automatically claim new credit.
Unfinished attempts are stored on this device, not synced across devices. A browser
crash may lose changes since the last save. Storage failures display an error; do not
clear site data if you need local work. Recovery codes restore server records, not these files.

Reports list passed and pending checks, skill tags and recorded form-validation mistakes.
They download as text and do not certify server points. Evidence shows the ticket,
changing monitoring state, environment events and a clearly labelled simulated diagnostic
trace. These are observations of the finite lab model, not real packet captures.
Level 3 offers optional switch, gateway and application outages. These disable actual
simulated devices and block diagnostics. Restore power in Lab Environment and recheck
results, or end the challenge to restore its snapshot. Challenges award no extra points.

## Player recovery and private prize claims

Run **supabase/player-services.sql** last in the SQL Editor. Until then, existing labs,
rankings and the points dashboard work, but recovery codes and private claims show an
activation message. There is no need to change anonymous Auth settings again.

In **Player dashboard**, a guest can generate a 256-bit recovery code. Only its SHA-256
hash is stored on the server. Save the code privately: it grants control of the guest's
server records. Creating another code replaces the old one. In a fresh browser, before
enrolling, open Player dashboard and recover with the code. The transaction moves the
profile, runs, cloud progress and approved awards to the new guest identity, consumes
the code, and removes the old session's access to those records. It refuses to merge
existing enrolled identities. Create a new recovery code after recovery. Registered
accounts continue using their existing account sign-in.

The dashboard shows current-month per-lab points and a Toronto month-end countdown.
Prize claims require a manually approved award. Review results, then use the commented
approval template in **supabase/prize-fulfillment.sql**. The approved winner can submit
an email privately in Player dashboard. Only administrators can read contact details;
public rankings and profile RPCs never return them. Arrange the CAD 50 voucher manually,
mark fulfilled, and remove private contact when no longer needed. Recovery and claims
have no public table access. Codes and local report evidence do not prove one person
has only one guest identity: monthly prize review remains necessary.
