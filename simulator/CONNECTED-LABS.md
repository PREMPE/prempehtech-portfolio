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
