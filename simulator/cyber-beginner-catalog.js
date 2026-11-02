/* Original beginner curriculum; stable slots preserve historical credit. */
window.PrempehCyberBeginnerCatalog=[
  {
    "slot": 16,
    "title": "Security Fundamentals: Protect a Training File",
    "role": "Cybersecurity beginner",
    "curriculumLevel": 1,
    "displayNumber": 1,
    "beginner": true,
    "ticket": "Confidentiality keeps information private. Integrity detects unwanted changes. Availability keeps information usable. Work with a fictional training file. Open Cybersecurity Learning Desk. Run the three experiment actions in order, inspect the results, and validate each checkpoint. Only fictional training data is used.",
    "tags": [
      "Confidentiality",
      "Integrity",
      "Availability"
    ],
    "apps": [
      "basics"
    ],
    "tasks": [
      {
        "id": "cb16_1",
        "app": "basics",
        "title": "Checkpoint 1: Visitor result",
        "type": "form",
        "fields": [
          [
            "answer",
            "Visitor result",
            "select",
            [
              "Access denied",
              "Access allowed"
            ]
          ]
        ],
        "expected": {
          "answer": "Access denied"
        },
        "dependencies": [],
        "experiment": 0,
        "experimentAction": "Try visitor access",
        "why": "Confidentiality keeps information private. Integrity detects unwanted changes. Availability keeps information usable. Work with a fictional training file."
      },
      {
        "id": "cb16_2",
        "app": "basics",
        "title": "Checkpoint 2: Changed-file check",
        "type": "form",
        "fields": [
          [
            "answer",
            "Changed-file check",
            "select",
            [
              "Integrity mismatch",
              "No change detected"
            ]
          ]
        ],
        "expected": {
          "answer": "Integrity mismatch"
        },
        "dependencies": [
          "cb16_1"
        ],
        "experiment": 1,
        "experimentAction": "Change the training file",
        "why": "Confidentiality keeps information private. Integrity detects unwanted changes. Availability keeps information usable. Work with a fictional training file."
      },
      {
        "id": "cb16_3",
        "app": "basics",
        "title": "Checkpoint 3: Restored service",
        "type": "form",
        "fields": [
          [
            "answer",
            "Restored service",
            "select",
            [
              "File available",
              "File unavailable"
            ]
          ]
        ],
        "expected": {
          "answer": "File available"
        },
        "dependencies": [
          "cb16_2"
        ],
        "experiment": 2,
        "experimentAction": "Restore the training file",
        "why": "Confidentiality keeps information private. Integrity detects unwanted changes. Availability keeps information usable. Work with a fictional training file."
      }
    ],
    "actions": [
      "Try visitor access",
      "Change the training file",
      "Restore the training file"
    ],
    "intro": "Confidentiality keeps information private. Integrity detects unwanted changes. Availability keeps information usable. Work with a fictional training file."
  },
  {
    "slot": 17,
    "title": "Assets, Threats, Vulnerabilities and Risk",
    "role": "Cybersecurity beginner",
    "curriculumLevel": 1,
    "displayNumber": 2,
    "beginner": true,
    "ticket": "An asset is something valuable. A threat can cause harm; a vulnerability is a weakness. Risk considers likelihood and impact. Inspect a fictional shared folder. Open Cybersecurity Learning Desk. Run the three experiment actions in order, inspect the results, and validate each checkpoint. Only fictional training data is used.",
    "tags": [
      "Assets",
      "Risk",
      "Safeguards"
    ],
    "apps": [
      "basics"
    ],
    "tasks": [
      {
        "id": "cb17_1",
        "app": "basics",
        "title": "Checkpoint 1: Asset to protect",
        "type": "form",
        "fields": [
          [
            "answer",
            "Asset to protect",
            "select",
            [
              "Customer training records",
              "The attacker"
            ]
          ]
        ],
        "expected": {
          "answer": "Customer training records"
        },
        "dependencies": [],
        "experiment": 0,
        "experimentAction": "Inspect the shared folder",
        "why": "An asset is something valuable. A threat can cause harm; a vulnerability is a weakness. Risk considers likelihood and impact. Inspect a fictional shared folder."
      },
      {
        "id": "cb17_2",
        "app": "basics",
        "title": "Checkpoint 2: Weakness observed",
        "type": "form",
        "fields": [
          [
            "answer",
            "Weakness observed",
            "select",
            [
              "Public write permission",
              "A strong password"
            ]
          ]
        ],
        "expected": {
          "answer": "Public write permission"
        },
        "dependencies": [
          "cb17_1"
        ],
        "experiment": 1,
        "experimentAction": "Try unauthorized access",
        "why": "An asset is something valuable. A threat can cause harm; a vulnerability is a weakness. Risk considers likelihood and impact. Inspect a fictional shared folder."
      },
      {
        "id": "cb17_3",
        "app": "basics",
        "title": "Checkpoint 3: Control applied",
        "type": "form",
        "fields": [
          [
            "answer",
            "Control applied",
            "select",
            [
              "Remove public write access",
              "Delete the records"
            ]
          ]
        ],
        "expected": {
          "answer": "Remove public write access"
        },
        "dependencies": [
          "cb17_2"
        ],
        "experiment": 2,
        "experimentAction": "Remove public sharing",
        "why": "An asset is something valuable. A threat can cause harm; a vulnerability is a weakness. Risk considers likelihood and impact. Inspect a fictional shared folder."
      }
    ],
    "actions": [
      "Inspect the shared folder",
      "Try unauthorized access",
      "Remove public sharing"
    ],
    "intro": "An asset is something valuable. A threat can cause harm; a vulnerability is a weakness. Risk considers likelihood and impact. Inspect a fictional shared folder."
  },
  {
    "slot": 18,
    "title": "Hashing and File Integrity",
    "role": "Cybersecurity beginner",
    "curriculumLevel": 1,
    "displayNumber": 3,
    "beginner": true,
    "ticket": "SHA-256 creates a fixed-size fingerprint, not encryption. Compare a file with a trusted checksum. An attacker can also replace an untrusted checksum. Open Cybersecurity Learning Desk. Run the three experiment actions in order, inspect the results, and validate each checkpoint. Only fictional training data is used.",
    "tags": [
      "SHA-256",
      "Checksums",
      "Integrity"
    ],
    "apps": [
      "basics"
    ],
    "tasks": [
      {
        "id": "cb18_1",
        "app": "basics",
        "title": "Checkpoint 1: SHA-256 output length",
        "type": "form",
        "fields": [
          [
            "answer",
            "SHA-256 output length",
            "select",
            [
              "64 hexadecimal characters",
              "Same length as the file"
            ]
          ]
        ],
        "expected": {
          "answer": "64 hexadecimal characters"
        },
        "dependencies": [],
        "experiment": 0,
        "experimentAction": "Hash the original file",
        "why": "SHA-256 creates a fixed-size fingerprint, not encryption. Compare a file with a trusted checksum. An attacker can also replace an untrusted checksum."
      },
      {
        "id": "cb18_2",
        "app": "basics",
        "title": "Checkpoint 2: After changing one character",
        "type": "form",
        "fields": [
          [
            "answer",
            "After changing one character",
            "select",
            [
              "Different hash",
              "Identical hash"
            ]
          ]
        ],
        "expected": {
          "answer": "Different hash"
        },
        "dependencies": [
          "cb18_1"
        ],
        "experiment": 1,
        "experimentAction": "Change one character and hash",
        "why": "SHA-256 creates a fixed-size fingerprint, not encryption. Compare a file with a trusted checksum. An attacker can also replace an untrusted checksum."
      },
      {
        "id": "cb18_3",
        "app": "basics",
        "title": "Checkpoint 3: Decision for changed download",
        "type": "form",
        "fields": [
          [
            "answer",
            "Decision for changed download",
            "select",
            [
              "Reject changed file",
              "Install anyway"
            ]
          ]
        ],
        "expected": {
          "answer": "Reject changed file"
        },
        "dependencies": [
          "cb18_2"
        ],
        "experiment": 2,
        "experimentAction": "Check the download",
        "why": "SHA-256 creates a fixed-size fingerprint, not encryption. Compare a file with a trusted checksum. An attacker can also replace an untrusted checksum."
      }
    ],
    "actions": [
      "Hash the original file",
      "Change one character and hash",
      "Check the download"
    ],
    "intro": "SHA-256 creates a fixed-size fingerprint, not encryption. Compare a file with a trusted checksum. An attacker can also replace an untrusted checksum."
  },
  {
    "slot": 19,
    "title": "Symmetric Encryption: Lock and Unlock a Message",
    "role": "Cybersecurity beginner",
    "curriculumLevel": 1,
    "displayNumber": 4,
    "beginner": true,
    "ticket": "AES-GCM encrypts and authenticates a message with a shared secret key. This experiment uses a fresh browser-only key and nonce. Base64 represents bytes; it does not encrypt them. Never enter real secrets. Open Cybersecurity Learning Desk. Run the three experiment actions in order, inspect the results, and validate each checkpoint. Only fictional training data is used.",
    "tags": [
      "AES-GCM",
      "Encryption",
      "Authentication"
    ],
    "apps": [
      "basics"
    ],
    "tasks": [
      {
        "id": "cb19_1",
        "app": "basics",
        "title": "Checkpoint 1: Protection method",
        "type": "form",
        "fields": [
          [
            "answer",
            "Protection method",
            "select",
            [
              "Authenticated encryption",
              "Base64 encoding alone"
            ]
          ]
        ],
        "expected": {
          "answer": "Authenticated encryption"
        },
        "dependencies": [],
        "experiment": 0,
        "experimentAction": "Generate a key and encrypt",
        "why": "AES-GCM encrypts and authenticates a message with a shared secret key. This experiment uses a fresh browser-only key and nonce. Base64 represents bytes; it does not encrypt them. Never enter real secrets."
      },
      {
        "id": "cb19_2",
        "app": "basics",
        "title": "Checkpoint 2: Wrong-key result",
        "type": "form",
        "fields": [
          [
            "answer",
            "Wrong-key result",
            "select",
            [
              "Authentication failed",
              "Original message returned"
            ]
          ]
        ],
        "expected": {
          "answer": "Authentication failed"
        },
        "dependencies": [
          "cb19_1"
        ],
        "experiment": 1,
        "experimentAction": "Try a different key",
        "why": "AES-GCM encrypts and authenticates a message with a shared secret key. This experiment uses a fresh browser-only key and nonce. Base64 represents bytes; it does not encrypt them. Never enter real secrets."
      },
      {
        "id": "cb19_3",
        "app": "basics",
        "title": "Checkpoint 3: Recovered message",
        "type": "form",
        "fields": [
          [
            "answer",
            "Recovered message",
            "select",
            [
              "Meet at the training room",
              "Message permanently lost"
            ]
          ]
        ],
        "expected": {
          "answer": "Meet at the training room"
        },
        "dependencies": [
          "cb19_2"
        ],
        "experiment": 2,
        "experimentAction": "Decrypt with the original key",
        "why": "AES-GCM encrypts and authenticates a message with a shared secret key. This experiment uses a fresh browser-only key and nonce. Base64 represents bytes; it does not encrypt them. Never enter real secrets."
      }
    ],
    "actions": [
      "Generate a key and encrypt",
      "Try a different key",
      "Decrypt with the original key"
    ],
    "intro": "AES-GCM encrypts and authenticates a message with a shared secret key. This experiment uses a fresh browser-only key and nonce. Base64 represents bytes; it does not encrypt them. Never enter real secrets."
  },
  {
    "slot": 20,
    "title": "Public Keys and Digital Signatures",
    "role": "Cybersecurity beginner",
    "curriculumLevel": 1,
    "displayNumber": 5,
    "beginner": true,
    "ticket": "Sign with a private ECDSA key and verify with its public key. A signature detects tampering and authenticates the signer when the public key is trusted. It does not hide the message. Open Cybersecurity Learning Desk. Run the three experiment actions in order, inspect the results, and validate each checkpoint. Only fictional training data is used.",
    "tags": [
      "Public keys",
      "Digital signatures",
      "Trust"
    ],
    "apps": [
      "basics"
    ],
    "tasks": [
      {
        "id": "cb20_1",
        "app": "basics",
        "title": "Checkpoint 1: Signing key",
        "type": "form",
        "fields": [
          [
            "answer",
            "Signing key",
            "select",
            [
              "Private key",
              "Public key"
            ]
          ]
        ],
        "expected": {
          "answer": "Private key"
        },
        "dependencies": [],
        "experiment": 0,
        "experimentAction": "Sign and verify the message",
        "why": "Sign with a private ECDSA key and verify with its public key. A signature detects tampering and authenticates the signer when the public key is trusted. It does not hide the message."
      },
      {
        "id": "cb20_2",
        "app": "basics",
        "title": "Checkpoint 2: Tampered-message verification",
        "type": "form",
        "fields": [
          [
            "answer",
            "Tampered-message verification",
            "select",
            [
              "Rejected",
              "Accepted"
            ]
          ]
        ],
        "expected": {
          "answer": "Rejected"
        },
        "dependencies": [
          "cb20_1"
        ],
        "experiment": 1,
        "experimentAction": "Tamper with the message",
        "why": "Sign with a private ECDSA key and verify with its public key. A signature detects tampering and authenticates the signer when the public key is trusted. It does not hide the message."
      },
      {
        "id": "cb20_3",
        "app": "basics",
        "title": "Checkpoint 3: What the signature provides",
        "type": "form",
        "fields": [
          [
            "answer",
            "What the signature provides",
            "select",
            [
              "Integrity and signer authenticity",
              "Message confidentiality"
            ]
          ]
        ],
        "expected": {
          "answer": "Integrity and signer authenticity"
        },
        "dependencies": [
          "cb20_2"
        ],
        "experiment": 2,
        "experimentAction": "Verify the original again",
        "why": "Sign with a private ECDSA key and verify with its public key. A signature detects tampering and authenticates the signer when the public key is trusted. It does not hide the message."
      }
    ],
    "actions": [
      "Sign and verify the message",
      "Tamper with the message",
      "Verify the original again"
    ],
    "intro": "Sign with a private ECDSA key and verify with its public key. A signature detects tampering and authenticates the signer when the public key is trusted. It does not hide the message."
  },
  {
    "slot": 21,
    "title": "Passphrases, Password Managers and Salted Hashes",
    "role": "Cybersecurity beginner",
    "curriculumLevel": 1,
    "displayNumber": 6,
    "beginner": true,
    "ticket": "Use long unique passphrases and a password manager. Store password-verification hashes, not plaintext. Random salts prevent identical passwords from producing identical stored values. This demo uses PBKDF2-SHA-256 with 600,000 iterations and fictional samples. Open Cybersecurity Learning Desk. Run the three experiment actions in order, inspect the results, and validate each checkpoint. Only fictional training data is used.",
    "tags": [
      "Passphrases",
      "Password managers",
      "Salted hashing"
    ],
    "apps": [
      "basics"
    ],
    "tasks": [
      {
        "id": "cb21_1",
        "app": "basics",
        "title": "Checkpoint 1: Account practice",
        "type": "form",
        "fields": [
          [
            "answer",
            "Account practice",
            "select",
            [
              "Unique passphrase per account",
              "Reuse one password everywhere"
            ]
          ]
        ],
        "expected": {
          "answer": "Unique passphrase per account"
        },
        "dependencies": [],
        "experiment": 0,
        "experimentAction": "Compare sample passphrases",
        "why": "Use long unique passphrases and a password manager. Store password-verification hashes, not plaintext. Random salts prevent identical passwords from producing identical stored values. This demo uses PBKDF2-SHA-256 with 600,000 iterations and fictional samples."
      },
      {
        "id": "cb21_2",
        "app": "basics",
        "title": "Checkpoint 2: Same password with different salts",
        "type": "form",
        "fields": [
          [
            "answer",
            "Same password with different salts",
            "select",
            [
              "Different stored hashes",
              "Identical stored hashes"
            ]
          ]
        ],
        "expected": {
          "answer": "Different stored hashes"
        },
        "dependencies": [
          "cb21_1"
        ],
        "experiment": 1,
        "experimentAction": "Hash the same sample with two salts",
        "why": "Use long unique passphrases and a password manager. Store password-verification hashes, not plaintext. Random salts prevent identical passwords from producing identical stored values. This demo uses PBKDF2-SHA-256 with 600,000 iterations and fictional samples."
      },
      {
        "id": "cb21_3",
        "app": "basics",
        "title": "Checkpoint 3: Salt purpose",
        "type": "form",
        "fields": [
          [
            "answer",
            "Salt purpose",
            "select",
            [
              "Prevent identical-password hash reuse",
              "Keep the salt secret"
            ]
          ]
        ],
        "expected": {
          "answer": "Prevent identical-password hash reuse"
        },
        "dependencies": [
          "cb21_2"
        ],
        "experiment": 2,
        "experimentAction": "Verify correct and incorrect samples",
        "why": "Use long unique passphrases and a password manager. Store password-verification hashes, not plaintext. Random salts prevent identical passwords from producing identical stored values. This demo uses PBKDF2-SHA-256 with 600,000 iterations and fictional samples."
      }
    ],
    "actions": [
      "Compare sample passphrases",
      "Hash the same sample with two salts",
      "Verify correct and incorrect samples"
    ],
    "intro": "Use long unique passphrases and a password manager. Store password-verification hashes, not plaintext. Random salts prevent identical passwords from producing identical stored values. This demo uses PBKDF2-SHA-256 with 600,000 iterations and fictional samples."
  },
  {
    "slot": 22,
    "title": "Multi-Factor Authentication and Recovery",
    "role": "Cybersecurity beginner",
    "curriculumLevel": 1,
    "displayNumber": 7,
    "beginner": true,
    "ticket": "MFA combines independent factors; two passwords are one factor type. Never approve unexpected prompts. Recovery codes grant access: store them privately and use each only once. These are simulated credentials, not your website account. Open Cybersecurity Learning Desk. Run the three experiment actions in order, inspect the results, and validate each checkpoint. Only fictional training data is used.",
    "tags": [
      "MFA",
      "Recovery",
      "Account safety"
    ],
    "apps": [
      "basics"
    ],
    "tasks": [
      {
        "id": "cb22_1",
        "app": "basics",
        "title": "Checkpoint 1: Password-only result",
        "type": "form",
        "fields": [
          [
            "answer",
            "Password-only result",
            "select",
            [
              "Second factor required",
              "Signed in"
            ]
          ]
        ],
        "expected": {
          "answer": "Second factor required"
        },
        "dependencies": [],
        "experiment": 0,
        "experimentAction": "Try password-only sign-in",
        "why": "MFA combines independent factors; two passwords are one factor type. Never approve unexpected prompts. Recovery codes grant access: store them privately and use each only once. These are simulated credentials, not your website account."
      },
      {
        "id": "cb22_2",
        "app": "basics",
        "title": "Checkpoint 2: Two independent factor types",
        "type": "form",
        "fields": [
          [
            "answer",
            "Two independent factor types",
            "select",
            [
              "Knowledge and possession",
              "Two passwords"
            ]
          ]
        ],
        "expected": {
          "answer": "Knowledge and possession"
        },
        "dependencies": [
          "cb22_1"
        ],
        "experiment": 1,
        "experimentAction": "Present the training second factor",
        "why": "MFA combines independent factors; two passwords are one factor type. Never approve unexpected prompts. Recovery codes grant access: store them privately and use each only once. These are simulated credentials, not your website account."
      },
      {
        "id": "cb22_3",
        "app": "basics",
        "title": "Checkpoint 3: Replayed recovery code",
        "type": "form",
        "fields": [
          [
            "answer",
            "Replayed recovery code",
            "select",
            [
              "Rejected after first use",
              "Reusable forever"
            ]
          ]
        ],
        "expected": {
          "answer": "Rejected after first use"
        },
        "dependencies": [
          "cb22_2"
        ],
        "experiment": 2,
        "experimentAction": "Use and replay a recovery code",
        "why": "MFA combines independent factors; two passwords are one factor type. Never approve unexpected prompts. Recovery codes grant access: store them privately and use each only once. These are simulated credentials, not your website account."
      }
    ],
    "actions": [
      "Try password-only sign-in",
      "Present the training second factor",
      "Use and replay a recovery code"
    ],
    "intro": "MFA combines independent factors; two passwords are one factor type. Never approve unexpected prompts. Recovery codes grant access: store them privately and use each only once. These are simulated credentials, not your website account."
  },
  {
    "slot": 23,
    "title": "Phishing, URLs and Safe Browsing",
    "role": "Cybersecurity beginner",
    "curriculumLevel": 1,
    "displayNumber": 8,
    "beginner": true,
    "ticket": "Inspect the destination hostname, not just link text. HTTPS encrypts a connection; malicious domains can also use it. Example addresses are reserved and non-clickable. Open Cybersecurity Learning Desk. Run the three experiment actions in order, inspect the results, and validate each checkpoint. Only fictional training data is used.",
    "tags": [
      "Phishing",
      "URLs",
      "HTTPS"
    ],
    "apps": [
      "basics"
    ],
    "tasks": [
      {
        "id": "cb23_1",
        "app": "basics",
        "title": "Checkpoint 1: Warning sign",
        "type": "form",
        "fields": [
          [
            "answer",
            "Warning sign",
            "select",
            [
              "Unexpected urgent credential request",
              "Use of a greeting"
            ]
          ]
        ],
        "expected": {
          "answer": "Unexpected urgent credential request"
        },
        "dependencies": [],
        "experiment": 0,
        "experimentAction": "Inspect the sample email",
        "why": "Inspect the destination hostname, not just link text. HTTPS encrypts a connection; malicious domains can also use it. Example addresses are reserved and non-clickable."
      },
      {
        "id": "cb23_2",
        "app": "basics",
        "title": "Checkpoint 2: Meaning of HTTPS",
        "type": "form",
        "fields": [
          [
            "answer",
            "Meaning of HTTPS",
            "select",
            [
              "Encrypted connection, not proof of legitimacy",
              "Website must be trustworthy"
            ]
          ]
        ],
        "expected": {
          "answer": "Encrypted connection, not proof of legitimacy"
        },
        "dependencies": [
          "cb23_1"
        ],
        "experiment": 1,
        "experimentAction": "Inspect the real destination",
        "why": "Inspect the destination hostname, not just link text. HTTPS encrypts a connection; malicious domains can also use it. Example addresses are reserved and non-clickable."
      },
      {
        "id": "cb23_3",
        "app": "basics",
        "title": "Checkpoint 3: Safe response",
        "type": "form",
        "fields": [
          [
            "answer",
            "Safe response",
            "select",
            [
              "Report and use a known trusted address",
              "Enter credentials to check"
            ]
          ]
        ],
        "expected": {
          "answer": "Report and use a known trusted address"
        },
        "dependencies": [
          "cb23_2"
        ],
        "experiment": 2,
        "experimentAction": "Report through a trusted channel",
        "why": "Inspect the destination hostname, not just link text. HTTPS encrypts a connection; malicious domains can also use it. Example addresses are reserved and non-clickable."
      }
    ],
    "actions": [
      "Inspect the sample email",
      "Inspect the real destination",
      "Report through a trusted channel"
    ],
    "intro": "Inspect the destination hostname, not just link text. HTTPS encrypts a connection; malicious domains can also use it. Example addresses are reserved and non-clickable."
  },
  {
    "slot": 24,
    "title": "Permissions and Least Privilege",
    "role": "Cybersecurity beginner",
    "curriculumLevel": 1,
    "displayNumber": 9,
    "beginner": true,
    "ticket": "Give people only the permissions they need. A reader can open a document but should not modify it or grant administrator access. This is an in-memory permissions model. Open Cybersecurity Learning Desk. Run the three experiment actions in order, inspect the results, and validate each checkpoint. Only fictional training data is used.",
    "tags": [
      "Permissions",
      "Least privilege",
      "Access checks"
    ],
    "apps": [
      "basics"
    ],
    "tasks": [
      {
        "id": "cb24_1",
        "app": "basics",
        "title": "Checkpoint 1: Visitor write attempt",
        "type": "form",
        "fields": [
          [
            "answer",
            "Visitor write attempt",
            "select",
            [
              "Denied",
              "Allowed"
            ]
          ]
        ],
        "expected": {
          "answer": "Denied"
        },
        "dependencies": [],
        "experiment": 0,
        "experimentAction": "Test the visitor permissions",
        "why": "Give people only the permissions they need. A reader can open a document but should not modify it or grant administrator access. This is an in-memory permissions model."
      },
      {
        "id": "cb24_2",
        "app": "basics",
        "title": "Checkpoint 2: Minimum analyst permission",
        "type": "form",
        "fields": [
          [
            "answer",
            "Minimum analyst permission",
            "select",
            [
              "Read only",
              "Administrator"
            ]
          ]
        ],
        "expected": {
          "answer": "Read only"
        },
        "dependencies": [
          "cb24_1"
        ],
        "experiment": 1,
        "experimentAction": "Grant the analyst read access",
        "why": "Give people only the permissions they need. A reader can open a document but should not modify it or grant administrator access. This is an in-memory permissions model."
      },
      {
        "id": "cb24_3",
        "app": "basics",
        "title": "Checkpoint 3: Final allowed action",
        "type": "form",
        "fields": [
          [
            "answer",
            "Final allowed action",
            "select",
            [
              "Read the assigned document",
              "Modify permissions"
            ]
          ]
        ],
        "expected": {
          "answer": "Read the assigned document"
        },
        "dependencies": [
          "cb24_2"
        ],
        "experiment": 2,
        "experimentAction": "Test read, write and admin actions",
        "why": "Give people only the permissions they need. A reader can open a document but should not modify it or grant administrator access. This is an in-memory permissions model."
      }
    ],
    "actions": [
      "Test the visitor permissions",
      "Grant the analyst read access",
      "Test read, write and admin actions"
    ],
    "intro": "Give people only the permissions they need. A reader can open a document but should not modify it or grant administrator access. This is an in-memory permissions model."
  },
  {
    "slot": 25,
    "title": "Updates, Backups and File Recovery",
    "role": "Cybersecurity beginner",
    "curriculumLevel": 1,
    "displayNumber": 10,
    "beginner": true,
    "ticket": "Updates fix known weaknesses. Backups must be separate and tested. Back up a training file, lose the working copy, restore it and compare its hash. This does not change your operating system. Open Cybersecurity Learning Desk. Run the three experiment actions in order, inspect the results, and validate each checkpoint. Only fictional training data is used.",
    "tags": [
      "Updates",
      "Backups",
      "Restore testing"
    ],
    "apps": [
      "basics"
    ],
    "tasks": [
      {
        "id": "cb25_1",
        "app": "basics",
        "title": "Checkpoint 1: Update result",
        "type": "form",
        "fields": [
          [
            "answer",
            "Update result",
            "select",
            [
              "Patched training version",
              "Real operating system changed"
            ]
          ]
        ],
        "expected": {
          "answer": "Patched training version"
        },
        "dependencies": [],
        "experiment": 0,
        "experimentAction": "Apply the simulated update",
        "why": "Updates fix known weaknesses. Backups must be separate and tested. Back up a training file, lose the working copy, restore it and compare its hash. This does not change your operating system."
      },
      {
        "id": "cb25_2",
        "app": "basics",
        "title": "Checkpoint 2: Backup type",
        "type": "form",
        "fields": [
          [
            "answer",
            "Backup type",
            "select",
            [
              "Separate copy",
              "Shortcut to the original"
            ]
          ]
        ],
        "expected": {
          "answer": "Separate copy"
        },
        "dependencies": [
          "cb25_1"
        ],
        "experiment": 1,
        "experimentAction": "Create a separate backup",
        "why": "Updates fix known weaknesses. Backups must be separate and tested. Back up a training file, lose the working copy, restore it and compare its hash. This does not change your operating system."
      },
      {
        "id": "cb25_3",
        "app": "basics",
        "title": "Checkpoint 3: Restore check",
        "type": "form",
        "fields": [
          [
            "answer",
            "Restore check",
            "select",
            [
              "Content and hash match",
              "File name alone matches"
            ]
          ]
        ],
        "expected": {
          "answer": "Content and hash match"
        },
        "dependencies": [
          "cb25_2"
        ],
        "experiment": 2,
        "experimentAction": "Delete, restore and verify the working copy",
        "why": "Updates fix known weaknesses. Backups must be separate and tested. Back up a training file, lose the working copy, restore it and compare its hash. This does not change your operating system."
      }
    ],
    "actions": [
      "Apply the simulated update",
      "Create a separate backup",
      "Delete, restore and verify the working copy"
    ],
    "intro": "Updates fix known weaknesses. Backups must be separate and tested. Back up a training file, lose the working copy, restore it and compare its hash. This does not change your operating system."
  }
];
