# Intermediate Level 2

The catalogue has 50 assignments across five tracks. All 25 previously published assignments, including the expanded investigation workflows, are preserved as **Level 1**. Level 2 contains 25 intermediate assignments: five per discipline, including the five previously published Level 2 labs.

Open Enterprise Desktop → Project Center and filter by Level 2. On the landing page, choose a track and Level 2. The assignment dropdown exposes all five assignments for the selected track and level.

| Track | New intermediate assignment | Tasks |
| --- | --- | --- |
| Networking | Restore a Segmented Application Path | 8 |
| Systems | Recover Payroll Access Without Excess Privilege | 8 |
| Cybersecurity | Contain a Stolen Session and Preserve the Timeline | 8 |
| Cloud | Recover a Private Cloud Workload Across Zones | 8 |
| Integrated | Recover a Warehouse During an Identity Incident | 10 |
| Networking | Recover DHCP Across a Routed Branch | 8 |
| Networking | Repair a Site VPN Without Translating Private Traffic | 8 |
| Networking | Restore Dual-Stack Access Without Disabling IPv6 | 8 |
| Networking | Separate Corporate Wi-Fi From Guest Access | 8 |
| Systems | Deploy a Patch Through a Canary Ring | 8 |
| Systems | Restore Directory Replication and Kerberos Time | 8 |
| Systems | Restore a Deleted Department Folder Safely | 8 |
| Systems | Delegate Helpdesk Administration Without Domain Admins | 8 |
| Cybersecurity | Investigate MFA Fatigue and Revoke Stolen Sessions | 8 |
| Cybersecurity | Contain Ransomware Before Testing Recovery | 8 |
| Cybersecurity | Remove Unauthorized Privilege and Persistence | 8 |
| Cybersecurity | Scope a Web Exploit Attempt Before Containment | 8 |
| Cloud | Replace Static Keys With a Scoped Workload Role | 8 |
| Cloud | Recover a Database Into an Alternate Zone | 8 |
| Cloud | Control Log Costs Without Destroying Audit Evidence | 8 |
| Cloud | Rotate a Leaked Application Secret Without Downtime | 8 |
| Integrated | Fail Over a Clinic Application With Access Boundaries | 8 |
| Integrated | Provision Secure Remote Access for a New Analyst | 8 |
| Integrated | Connect an Acquired Team Without Flattening Trust | 8 |
| Integrated | Recover Business Services After Endpoint Compromise | 8 |

Each assignment requires evidence correlation, scoped repair or containment, prerequisite-gated checks, a negative test (access that must remain denied or an unaffected service that must remain available), and handover. Approved designs and case references appear in the ticket; evidence is in the relevant console. Incorrect values and out-of-order steps fail validation. The Procedure guide names the next tool; Command Guide lists the simulation checks.

`Get-LabState` in PowerShell reports the current attempt's accepted settings and pending checks. `Test-Lab*` commands are PrempehTech simulation helpers. They check validated prerequisites and produce scenario results; they do not execute on a real operating system, export actual forensic evidence, deliver real notifications, or provision cloud infrastructure. Generic cloud resource dialogs use Server Manager. The separate Network Studio practice network remains independent.

## Compatibility

Existing completion keys `track:1` through `track:5` are preserved, with no storage reset or remapping. They identify assignments, not displayed curriculum levels. Intermediate assignments use `track:6` through `track:10`; each has `curriculumLevel: 2`. `getCatalog()` exposes the display level separately from the stable assignment ID. The historical `level-two.js` module still supplies the preserved assignment-2 workflows described in `FOUNDATION-WORKFLOWS.md`.

The progress sanitizer and cloud-save payload support all 50 assignment keys. Replay resets transient lab configuration without awarding duplicate completion XP. The optional SQL allowlist now includes all intermediate keys and replaces the earlier optional constraint atomically; this migration is **not applied by static-site deployment**.

## Verification

`test_intermediate_labs.py` covers preservation of all 30 previously available completions, both catalogue filters, all old launches labelled Level 1, both landing-page levels, rejected early checks and invalid submissions, all 202 intermediate acceptance tasks, persisted new completions, state reset and duplicate-XP prevention. Existing desktop, foundation-workflow, and security tests remain in the suite.

`intermediate-catalog.js` registers the additional 20 authored cases. Each has case-specific evidence and three sequential configuration changes, recovery and boundary checks, and a recorded handover. Show Me provides an explicit guided reference for the current step.
