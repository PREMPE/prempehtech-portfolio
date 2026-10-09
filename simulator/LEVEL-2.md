# Level 2 labs

Open Enterprise Desktop → Project Center, choose a track, then open Level 2.

| Track | Assignment | Acceptance tasks |
| --- | --- | --- |
| Networking | Repair DHCP and DNS for the Support VLAN | 5 |
| System Administration | Repair a Failed Windows Service | 4 |
| Cybersecurity | Triage Suspicious PowerShell | 5 |
| Cloud | Repair a Private Cloud Application Network | 5 |
| Integrated | Onboard a New Branch Office | 13 |

## Workflow

The project ticket contains the approved addresses, service settings, and case references. Use the Procedure / Hint / Show Me guide for the active task. Open the named application from Start or the project ticket. Incorrect values fail validation; prerequisite tasks must be completed before a dependent task can pass. Reading a command's output does not itself complete an unfinished repair.

- Networking: identify the scope fault, correct DHCP and the file-server A record, renew the client, then test DNS and reachability. `ipconfig /all` stays at the initial APIPA address until renewal passes. Replay resets the lease.
- Systems: correlate Event 7031, restore W3SVC, configure service recovery, then check service status, TCP 443, and HTTP health. Updated service state and recovery settings appear in Services.
- Cybersecurity: compare suspicious and benign process evidence, preserve the case record, isolate the affected endpoint, then validate isolation and evidence retention. `Get-LabEndpoint` and `Get-LabEvidence` are simulator-specific helpers, not native PowerShell commands or a real forensic collection service.
- Cloud: diagnose public exposure, configure the private subnet/NAT/database rule, then inspect route tables, subnets, and security groups independently. Returned API-style data reflects accepted configuration.
- Integrated: configure branch DHCP/DNS, least-privilege identity and share access, preserve and contain endpoint evidence, complete the private-cloud workstream, and verify a healthy branch client before handover. The suspicious endpoint remains isolated.

All work is browser simulation. No commands touch a real endpoint or cloud account. Each scored lab has its own state; the separate Network Studio practice network is unchanged. Existing completion records are retained. Replay starts a fresh attempt without awarding repeat-completion XP.

## Implementation and verification

`level-two.js` extends only the Level 2 scenario catalogue after the base engines load. Form and native-console acceptance checks consult its prerequisites. CloudShell retains its own prerequisite checking. The console renderer preserves input/feedback while refreshing state so enrichment cannot erase partially entered answers.

`tests/test_level_two.py` verifies all five labs fail verification before repair, complete through their real form/terminal controls, save completion, and reset transient networking state on replay. The normal suite also checks the other 20 project launches, text contrast, browser security policy, desktop features, and account handling.
