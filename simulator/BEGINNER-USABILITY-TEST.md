# Beginner usability test — ready for three to five participants

Status: test materials prepared. No human sessions or findings have been claimed.
Automated browser checks are separate from real-user observation.

## Before the session

Recruit three to five consenting adults with no, or very little, cybersecurity training.
Use labels P1–P5 rather than names. Allow about 20 minutes per person. Ask at least two
participants to use a phone and at least one to use a laptop. Participation is optional;
they may stop at any time. Use lab messages and do not ask for real passwords.

Tell the participant: “We are testing the website, not you. Please say what you expect
and what confuses you. You can use hints, but tell me when you do.” Do not demonstrate
the answers first. Start in Cybersecurity Level 1 and record whether the learner finds
the Learning Desk and focused view without assistance.

## Tasks to read aloud (do not read the answer key)

1. Open Hashing and File Integrity. Complete the first guided checkpoint. Explain what
   its fingerprint tells you and what it cannot tell you.
2. Expand “Test your own lab messages.” Compare two identical messages,
   then change one character. Explain why the fingerprints behave differently.
3. Use the encryption or signature sandbox. Predict what will happen before clicking.
   Explain whether a signature hides the message.
4. Enter focused learning / phone view. Give a wrong checkpoint answer deliberately.
   Read the feedback and try again. Tell us whether the explanation helped. Request
   hints one at a time, noting when the answer becomes obvious.
5. Open Beginner capstone. Try the four decisions without revealing solutions. Explain
   your reasoning about the message, checksum, permissions and backup.
6. Open “Help improve these labs.” Complete and download the optional feedback report.
   Explain whether you think it was sent anywhere. It is local until you choose to share it.

## Observer worksheet

For each participant, record locally:

| Item | Record |
|---|---|
| Participant code | P1–P5, no name or email |
| Device | Phone or laptop; browser family if known |
| Experience | None / a little |
| Task completion | Independent / with a hint / with observer help / not completed |
| Time | Approximate minutes per task |
| Hesitations | Exact control or instruction that caused a pause |
| Errors and recovery | What they tried and whether feedback helped |
| Hints | Clue / explanation / full procedure |
| Understanding | Their explanation, not just the selected answer |
| Accessibility | Small text, scrolling, focus, contrast or tap-target problems |

Ask “What did you expect?” before giving help. If a participant is stuck for two minutes,
offer one clue and record the assistance. Do not take over their mouse or phone.

## Debrief and next revision

Ask what was clearest, what was most confusing, and what they would change first.
Participants may choose to share their downloaded feedback with the site owner.
Do not upload recordings or personal data without separate informed consent.

Prioritize a problem when two or more participants encounter it, or when one person
cannot recover from it. Fix the highest-impact issues and repeat the affected tasks
with a new beginner. Three to five sessions are formative feedback, not statistical
proof that the course works for everyone.

## Facilitator-only answer key

Hashes are fingerprints, not encryption; identical inputs produce identical SHA-256
hashes and changed inputs produce different hashes. Authenticated encryption conceals
content and checks its authenticity. Digital signatures check integrity and signer
authenticity with a trusted public key, but do not conceal plaintext.

The capstone varies its message and candidate file each time. Inspect the displayed
scenario rather than memorizing a fixed answer. Report suspicious credential requests;
a routine training notice uses the saved portal without asking for a password reply.
Accept a candidate only if its entire hash matches the trusted reference. The reviewer
needs read-only access. Restore the backup whose fingerprint matches the trusted original.

## Implemented improvements to evaluate

- Editable, bounded crypto examples separate from the ranked guided checkpoints.
- Explanation of incorrect answers, without subtracting points.
- Three stages of hints; full procedure appears only when requested in this control.
- A focused view with large controls, one checkpoint at a time and clear next-step unlocking.
- An unranked four-part capstone with optional hints and a downloadable local report.
- A voluntary feedback form that downloads locally rather than silently transmitting data.
