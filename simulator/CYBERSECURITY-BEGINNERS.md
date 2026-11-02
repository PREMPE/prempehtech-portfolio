# Cybersecurity foundations

Only the Cybersecurity curriculum changes. Level 1 now has ten beginner labs; the
other four disciplines retain their existing 15 assignments each. There are 80 active
assignments, plus five preserved original cybersecurity scenarios used as case studies.

## Beginner labs and their real experiments

1. Confidentiality, integrity, availability: deny visitor access, detect a changed file,
   and restore the original training content.
2. Assets, threats, vulnerabilities, risk: inspect public write access and remove it.
3. Hashing: calculate SHA-256, change one character, and reject a mismatched download.
4. Symmetric encryption: encrypt with AES-256-GCM, reject a wrong key, decrypt correctly.
5. Public/private keys: ECDSA P-256 signing, public-key verification and tamper rejection.
6. Password protection: compare lab passphrases; use PBKDF2-SHA-256 with 600,000
   iterations and random 128-bit salts; verify correct/incorrect samples.
7. MFA and recovery: simulate two independent factors and reject a reused recovery code.
8. Phishing: inspect a misleading hostname, explain HTTPS limits, and report safely.
9. Least privilege: grant read access while rejecting write/admin actions.
10. Updates and backups: simulate a patch, back up a training file, delete and restore it,
    and verify content and checksum.

Use PT Start → **Cybersecurity Learning Desk**. Each experiment has three numbered
buttons followed by three validation checkpoints. Procedure provides the exact button,
expected observation, field choice and validation action. Show Me highlights a control
without completing it. Experiments must be run before their checkpoints validate.
After resuming a saved lab, rerun the experiment from step 1 before unfinished checkpoints;
cryptographic keys deliberately stay in memory and are not serialized into backups.

## Preserved investigations

The original slots 1–5 and completion keys remain intact. Their complete evidence,
forms and supported command checks appear in **Case study** desktop controls and the
Procedure of related Level 2 and Level 3 assignments:

- Failed logins: MFA/session investigations (7, 13).
- Suspicious PowerShell: ransomware/software-update incidents (8, 12).
- Remote-access hardening: privilege/persistence and cloud-credential incidents (9, 15).
- Alert correlation: session, web-exploit and DNS-exfiltration investigations (6, 10, 14).
- Lateral movement: advanced identity-to-endpoint and cloud incidents (11, 15).

Cases run in isolation from the main graded incident and do not grant extra points.
Previously completed cases are labelled. Historical XP, completion keys and monthly
scores are retained; existing graded task sets in Levels 2 and 3 are unchanged.

## Required server migration

Run **supabase/cybersecurity-beginners.sql** LAST, after the previously supplied
verified-competition and player-services migrations. Do not rerun older scoring or
progress-constraint migrations afterward without rerunning this migration.

New stable IDs are `cyber:16` through `cyber:25`, displayed as Level 1 Labs 1–10. They
each award at most 100 monthly points, including partial validated-step credit. IDs are
not reused, so old completion records cannot accidentally complete new lessons.
The migration adds rules and expands the strict progress allowlist only for these IDs.
It changes no old rows and preserves existing rankings. New enrollment in retired
slots is blocked; previously enrolled current-month runs can still finish. Activity
includes retired labs only when that learner has a historical run.

Before migration, the new lessons can be opened explicitly as unranked practice; their
ranking enrollment shows an activation message. Existing disciplines still enroll and
score normally. Activate the migration before announcing new monthly ranked labs.

## Security scope

Experiments use assigned lab examples and Web Crypto. No uploads, real passwords,
private-key export, filesystem access, network probes, external links or executable
command input are introduced. Case commands are matched against a bounded allowlist,
never evaluated or executed. Outputs use DOM text nodes. Existing CSP, pinned SDK SRI,
account isolation, private-table RLS, verified evidence checks and duplicate-score
prevention remain in place. The progress and scoring allowlists reject other added slots.

This is educational simulation, not a production password vault or an attested exam.
Browser-visible answers can be scripted; server rules check the evidence and ownership,
not whether a human performed each click. Review prize eligibility and abuse flags.
Infrastructure protections such as Cloudflare WAF and account security are separate
from these static-site changes; no claim of complete immunity to attacks is made.

## Learning aids and usability preparation

The Learning Desk now groups each experiment with its checkpoint and offers three
hint stages: a clue, an explanation and the full procedure. Incorrect answers explain
the relevant concept. The original detailed Procedure remains available on the desktop.
Focused learning / phone view displays one checkpoint at a time with larger controls;
it uses the same actual validation and scoring events as the desktop.

Hashing, encryption and signature lessons include an optional editable sandbox. It
accepts up to 512 characters per lab message, renders all output as text and does
not save or upload messages. Fresh encryption keys/nonces and signing keys remain in
memory. Sandbox results do not change the guided example or its ranked answers.

Beginner capstone is optional, unranked practice, not an eleventh ranked Level 1 lab.
It varies the message and file-integrity evidence, requires four decisions, withholds
solutions until requested, and verifies the restored backup hash. Reports download
locally. It changes no monthly scores or completion records.

`BEGINNER-USABILITY-TEST.md` provides a session script and observation sheet for three
to five volunteers. The optional in-app feedback form downloads a private text report;
it does not send data. Real learner sessions remain pending participant recruitment.
No SQL migration is needed for these learning aids.
