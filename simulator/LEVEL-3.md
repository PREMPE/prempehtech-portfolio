# Level 3 · Advanced

The catalog contains 75 assignments: the original 25 Level 1 labs, 25 Level 2 labs, and 25 new Level 3 labs (five per discipline). Existing slots 1–10 and completion keys are preserved; Level 3 uses slots 11–15.

Choose Level 3 on the landing page or in Project Center. Each advanced incident has 11 validated tasks: evidence scope, recovery plan, primary repairs, baseline verification, an isolated failure exercise, standby repairs, resilience verification, boundary verification, and handover. Repair prerequisites prevent verification from passing early. The Procedure tab gives exact application navigation, fields, values, commands, and validation actions throughout.

Networking covers route leaks, asymmetric paths, overlay MTU, DHCP failover and fabric segmentation. Systems covers directory recovery, quorum, certificate trust, federation keys and storage integrity. Cyber covers lateral movement, supply-chain compromise, OAuth persistence, DNS exfiltration and cloud privilege escalation. Cloud covers regional recovery, workloads, private endpoints, encryption recovery and idempotent queues. Integrated incidents cover hospitals, mergers, payments, zero-trust access and manufacturing boundaries.

These are simulated enterprise workflows, not real operating systems or packet emulation. The PowerShell command `get-advanced-state` reports DEGRADED → RESTORED → DISRUPTED → RECOVERED as validated dependencies change. Each scenario provides explicit `test-advanced` commands for its three verification stages.

Tests launch all 75 projects and follow every generated walkthrough through its actual controls to completion. Separate advanced tests reject premature verification and check fault/recovery state transitions.
