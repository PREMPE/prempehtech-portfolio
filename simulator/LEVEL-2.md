# Intermediate Level 2

The catalogue has 30 assignments across five tracks. All 25 previously published assignments, including the expanded investigation workflows, are preserved as **Level 1**. Level 2 contains five separate new intermediate assignments.

Open Enterprise Desktop → Project Center and filter by Level 2. On the landing page, choose a track and Level 2. The Level 1 assignment dropdown exposes all five preserved assignments per track.

| Track | New intermediate assignment | Tasks |
| --- | --- | --- |
| Networking | Restore a Segmented Application Path | 8 |
| Systems | Recover Payroll Access Without Excess Privilege | 8 |
| Cybersecurity | Contain a Stolen Session and Preserve the Timeline | 8 |
| Cloud | Recover a Private Cloud Workload Across Zones | 8 |
| Integrated | Recover a Warehouse During an Identity Incident | 10 |

Each assignment requires evidence correlation, scoped repair or containment, prerequisite-gated checks, a negative test (access that must remain denied or an unaffected service that must remain available), and handover. Approved designs and case references appear in the ticket; evidence is in the relevant console. Incorrect values and out-of-order steps fail validation. The Procedure guide names the next tool; Command Guide lists the simulation checks.

`Get-LabState` in PowerShell reports the current attempt's accepted settings and pending checks. `Test-Lab*` commands are PrempehTech simulation helpers. They check validated prerequisites and produce scenario results; they do not execute on a real operating system, export actual forensic evidence, deliver real notifications, or provision cloud infrastructure. Generic cloud resource dialogs use Server Manager. The separate Network Studio practice network remains independent.

## Compatibility

Existing completion keys `track:1` through `track:5` are preserved, with no storage reset or remapping. They identify assignments, not displayed curriculum levels. New assignments use `track:6`; each has `curriculumLevel: 2`. `getCatalog()` exposes the display level separately from the stable assignment ID. The historical `level-two.js` module still supplies the preserved assignment-2 workflows described in `FOUNDATION-WORKFLOWS.md`.

The progress sanitizer and cloud-save payload support all 30 assignment keys. Replay resets transient lab configuration without awarding duplicate completion XP. The optional SQL allowlist now includes the five new keys and replaces the earlier optional constraint atomically; this migration is **not applied by static-site deployment**.

## Verification

`test_intermediate_labs.py` covers preservation of all 25 old completions, both catalogue filters, all old launches labelled Level 1, both landing-page levels, rejected early checks and invalid submissions, all 42 new acceptance tasks, persisted new completions, state reset and duplicate-XP prevention. Existing desktop, foundation-workflow, and security tests remain in the suite.
