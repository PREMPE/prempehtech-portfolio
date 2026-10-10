/* Additional intermediate cases. Stable slots 7–10 preserve all prior completions. */
(() => {
  'use strict';
  const cases = [
  {
    "track": "networking",
    "slot": 7,
    "title": "Recover DHCP Across a Routed Branch",
    "ticket": "BRANCH-22 clients receive APIPA addresses after the relay and scope changed. Restore the relay to 10.10.0.15. Scope 10.22.0.10–10.22.0.199 must use gateway 10.22.0.1 and DNS 10.10.0.53. Exclude 10.22.0.10–10.22.0.50 for infrastructure. Renew the client only after all three changes. The guest scope must remain separate.",
    "cause": "Relay target and scope options disagree with the approved branch design",
    "evidence": [
      [
        "Client",
        "BR22-PC06",
        "169.254.8.6"
      ],
      [
        "Relay",
        "VLAN 22",
        "10.10.0.99 retired"
      ],
      [
        "Scope",
        "Router / DNS",
        "10.22.0.254 / 8.8.8.8"
      ],
      [
        "Reservation audit",
        "Infrastructure range",
        "No exclusion configured"
      ]
    ],
    "fixes": [
      {
        "app": "server",
        "title": "Repair the router DHCP relay",
        "values": {
          "interface": "VLAN22",
          "relay": "10.10.0.15"
        }
      },
      {
        "app": "dhcp",
        "title": "Repair the branch address pool and options",
        "values": {
          "start": "10.22.0.10",
          "end": "10.22.0.199",
          "gateway": "10.22.0.1",
          "dns": "10.10.0.53"
        }
      },
      {
        "app": "dhcp",
        "title": "Protect infrastructure addresses",
        "values": {
          "excludeStart": "10.22.0.10",
          "excludeEnd": "10.22.0.50"
        }
      }
    ],
    "positive": "BR22-PC06 renewed: 10.22.0.106/24; gateway 10.22.0.1; DNS 10.10.0.53. DNS and gateway tests pass.",
    "negative": "Infrastructure addresses are never leased. Guest clients still receive the guest scope, with no branch access.",
    "tags": [
      "DHCP relay",
      "Scope options",
      "Exclusions"
    ]
  },
  {
    "track": "networking",
    "slot": 8,
    "title": "Repair a Site VPN Without Translating Private Traffic",
    "ticket": "Branch 10.28.0.0/24 must reach HQ 10.80.0.0/16 through tunnel-02. Route HQ via 172.30.0.2, exempt the branch-to-HQ pair from NAT, and match both prefixes in the tunnel policy. Internet traffic must still use normal NAT. Avoid widening either protected network.",
    "cause": "The HQ route, NAT treatment and tunnel selectors are inconsistent",
    "evidence": [
      [
        "Route",
        "10.80.0.0/16",
        "via Internet edge"
      ],
      [
        "NAT",
        "10.28.0.0/24 to HQ",
        "Translated"
      ],
      [
        "Selector",
        "Remote network",
        "10.8.0.0/16"
      ],
      [
        "Tunnel",
        "tunnel-02",
        "Established, no payload bytes"
      ]
    ],
    "fixes": [
      {
        "app": "server",
        "title": "Repair the HQ route",
        "values": {
          "destination": "10.80.0.0/16",
          "nextHop": "172.30.0.2"
        }
      },
      {
        "app": "firewall",
        "title": "Exempt only VPN traffic from NAT",
        "values": {
          "source": "10.28.0.0/24",
          "destination": "10.80.0.0/16",
          "translation": "None"
        }
      },
      {
        "app": "firewall",
        "title": "Correct the protected tunnel networks",
        "values": {
          "tunnel": "tunnel-02",
          "local": "10.28.0.0/24",
          "remote": "10.80.0.0/16"
        }
      }
    ],
    "positive": "Branch-to-HQ traffic crosses tunnel-02 with private source intact; application TCP 443 succeeds.",
    "negative": "Internet traffic remains translated; destinations outside 10.80.0.0/16 are not admitted by the VPN policy.",
    "tags": [
      "VPN",
      "Routing",
      "NAT exemption"
    ]
  },
  {
    "track": "networking",
    "slot": 9,
    "title": "Restore Dual-Stack Access Without Disabling IPv6",
    "ticket": "IPv4 works but IPv6 clients stall on reports.corp.local. Publish AAAA 2001:db8:44::20. Advertise router lifetime 1800 seconds and prefix 2001:db8:44::/64 on VLAN44. Permit ICMPv6 Packet Too Big so path MTU discovery works. Preserve the existing IPv4 path and block unsolicited inbound application ports.",
    "cause": "Stale AAAA, withdrawn default router and blocked path MTU feedback",
    "evidence": [
      [
        "IPv4 probe",
        "reports",
        "HTTP 200"
      ],
      [
        "AAAA answer",
        "reports",
        "2001:db8:44::99 retired"
      ],
      [
        "Router advertisement",
        "VLAN44",
        "Lifetime 0"
      ],
      [
        "Firewall",
        "ICMPv6 type 2",
        "Dropped"
      ]
    ],
    "fixes": [
      {
        "app": "dns",
        "title": "Correct the IPv6 host record",
        "values": {
          "name": "reports",
          "type": "AAAA",
          "address": "2001:db8:44::20"
        }
      },
      {
        "app": "server",
        "title": "Repair the router advertisement",
        "values": {
          "interface": "VLAN44",
          "prefix": "2001:db8:44::/64",
          "lifetime": "1800"
        }
      },
      {
        "app": "firewall",
        "title": "Allow required path MTU feedback",
        "values": {
          "protocol": "ICMPv6",
          "type": "2",
          "action": "Allow"
        }
      }
    ],
    "positive": "IPv6 default route installed; reports resolves correctly; large HTTPS response succeeds without fragmentation black holes.",
    "negative": "IPv4 HTTPS still works. Unsolicited inbound TCP 3389 remains denied.",
    "tags": [
      "IPv6",
      "Router advertisements",
      "Path MTU"
    ]
  },
  {
    "track": "networking",
    "slot": 10,
    "title": "Separate Corporate Wi-Fi From Guest Access",
    "ticket": "Managed laptops on CorpWiFi land on the guest VLAN. Restore RADIUS server 10.10.0.25, assign authenticated managed devices to VLAN60, and restrict GuestWiFi VLAN90 to Internet-only access. Use EAP-TLS with certificate validation for corporate authentication; do not use a shared password or disable server validation.",
    "cause": "Corporate RADIUS and VLAN assignment are wrong and guest isolation is missing",
    "evidence": [
      [
        "SSID",
        "CorpWiFi",
        "RADIUS 10.10.0.99 timeout"
      ],
      [
        "Fallback",
        "Managed laptop",
        "VLAN90"
      ],
      [
        "Guest probe",
        "Internal 10.60.0.20:443",
        "Unexpectedly permitted"
      ],
      [
        "Approved identity",
        "Managed devices",
        "Enterprise certificates"
      ]
    ],
    "fixes": [
      {
        "app": "server",
        "title": "Restore corporate authentication",
        "values": {
          "ssid": "CorpWiFi",
          "radius": "10.10.0.25",
          "method": "EAP-TLS",
          "certificateValidation": "Enabled"
        }
      },
      {
        "app": "server",
        "title": "Assign the managed-device VLAN",
        "values": {
          "policy": "Managed devices",
          "vlan": "60"
        }
      },
      {
        "app": "firewall",
        "title": "Enforce the guest boundary",
        "values": {
          "source": "VLAN90",
          "destination": "Internal networks",
          "action": "Deny"
        }
      }
    ],
    "positive": "A valid managed-device certificate authenticates on CorpWiFi and receives VLAN60; internal HTTPS succeeds.",
    "negative": "An untrusted certificate is rejected. GuestWiFi reaches the Internet but cannot reach internal networks.",
    "tags": [
      "Wireless access",
      "EAP-TLS",
      "Segmentation"
    ]
  },
  {
    "track": "sysadmin",
    "slot": 7,
    "title": "Deploy a Patch Through a Canary Ring",
    "ticket": "Update KB-PT204 caused APP-CANARY01 health failures. Export its event evidence, roll back only this update on APP-CANARY01, and pause deployment to Production-Ring until the canary passes. Retain other security updates and configure a 30-minute observation window. Do not reboot all servers.",
    "cause": "The new patch is correlated with the canary application regression",
    "evidence": [
      [
        "Before update",
        "APP-CANARY01 /health",
        "HTTP 200"
      ],
      [
        "After KB-PT204",
        "Application event 1000",
        "Repeated crash"
      ],
      [
        "Control server",
        "APP-PROD02",
        "HTTP 200"
      ],
      [
        "Rollout",
        "Production-Ring",
        "Queued"
      ]
    ],
    "fixes": [
      {
        "app": "event",
        "title": "Preserve patch and application evidence",
        "values": {
          "host": "APP-CANARY01",
          "evidence": "Application and servicing logs"
        }
      },
      {
        "app": "server",
        "title": "Roll back the failing canary patch",
        "values": {
          "host": "APP-CANARY01",
          "remove": "KB-PT204",
          "retainOtherUpdates": "Yes"
        }
      },
      {
        "app": "gpmc",
        "title": "Pause the rollout pending observation",
        "values": {
          "ring": "Production-Ring",
          "status": "Paused",
          "observationMinutes": "30"
        }
      }
    ],
    "positive": "Canary /health returns HTTP 200 and application smoke tests pass after the targeted rollback.",
    "negative": "Production-Ring remains paused; unrelated updates remain installed; no other server was rebooted.",
    "tags": [
      "Patch rings",
      "Rollback",
      "Change control"
    ]
  },
  {
    "track": "sysadmin",
    "slot": 8,
    "title": "Restore Directory Replication and Kerberos Time",
    "ticket": "DC02 is using a public resolver and is seven minutes ahead. Set preferred DNS to DC01 at 10.10.0.10, synchronize DC02 with the domain hierarchy, and restart Netlogon with Automatic startup only after repairing DNS and time. Verify replication and a Kerberos logon without relaxing clock-skew policy.",
    "cause": "Public DNS and excessive clock skew prevent domain authentication and replication",
    "evidence": [
      [
        "DC02 DNS",
        "Preferred resolver",
        "8.8.8.8"
      ],
      [
        "SRV lookup",
        "Domain controllers",
        "Not found"
      ],
      [
        "Clock",
        "DC02 relative to DC01",
        "+420 seconds"
      ],
      [
        "Netlogon",
        "DC02",
        "Stopped"
      ]
    ],
    "fixes": [
      {
        "app": "network",
        "title": "Repair DC02 resolver configuration",
        "values": {
          "host": "DC02",
          "dns": "10.10.0.10"
        }
      },
      {
        "app": "server",
        "title": "Restore domain time synchronization",
        "values": {
          "host": "DC02",
          "timeSource": "Domain hierarchy"
        }
      },
      {
        "app": "services",
        "title": "Restore domain registration",
        "values": {
          "service": "Netlogon",
          "startup": "Automatic",
          "state": "Running"
        }
      }
    ],
    "positive": "Domain SRV lookup succeeds; skew is 2 seconds; replication has zero failures; Kerberos test logon succeeds.",
    "negative": "Clock-skew policy remains unchanged and public DNS is not used by DC02 for domain records.",
    "tags": [
      "Directory replication",
      "DNS",
      "Kerberos time"
    ]
  },
  {
    "track": "sysadmin",
    "slot": 9,
    "title": "Restore a Deleted Department Folder Safely",
    "ticket": "Finance deleted Budget-2026 from FIN-DATA. Restore backup FIN-0200 to D:\\Restore\\Budget-2026 first, verify its checksum manifest and Payroll-Staff Modify ACL, then promote the verified folder to D:\\Finance\\Budget-2026. Preserve newer unrelated folders and deny Sales-Staff access.",
    "cause": "A deleted folder requires a staged restore with integrity and ACL validation",
    "evidence": [
      [
        "Backup",
        "FIN-0200",
        "Completed at 02:00; manifest present"
      ],
      [
        "Live folder",
        "Budget-2026",
        "Deleted at 09:12"
      ],
      [
        "Unrelated folder",
        "Forecast-2027",
        "Modified at 10:05; retain"
      ],
      [
        "Approved access",
        "Budget-2026",
        "Payroll-Staff Modify"
      ]
    ],
    "fixes": [
      {
        "app": "server",
        "title": "Stage the approved backup",
        "values": {
          "backup": "FIN-0200",
          "destination": "D:\\Restore\\Budget-2026"
        }
      },
      {
        "app": "server",
        "title": "Verify staged integrity and permissions",
        "values": {
          "manifest": "SHA-256 verified",
          "group": "Payroll-Staff",
          "permission": "Modify"
        }
      },
      {
        "app": "server",
        "title": "Promote only the recovered folder",
        "values": {
          "destination": "D:\\Finance\\Budget-2026",
          "preserveUnrelated": "Yes"
        }
      }
    ],
    "positive": "Restored budget files match the approved manifest; Payroll-Staff can open and update them.",
    "negative": "Sales-Staff is denied. Forecast-2027 retains its newer content and timestamps.",
    "tags": [
      "Staged restore",
      "Integrity",
      "ACL recovery"
    ]
  },
  {
    "track": "sysadmin",
    "slot": 10,
    "title": "Delegate Helpdesk Administration Without Domain Admins",
    "ticket": "Helpdesk-L2 must reset passwords and unlock standard users only in OU=Branch-Staff. Remove its Domain Admins membership, delegate those two operations on Branch-Staff, and link audit policy Branch-Account-Audit there with Success and Failure enabled. Do not delegate privileged-account administration.",
    "cause": "Helpdesk privileges exceed the approved OU-scoped responsibilities",
    "evidence": [
      [
        "Membership",
        "Helpdesk-L2",
        "Domain Admins"
      ],
      [
        "Approved scope",
        "Branch-Staff OU",
        "Standard users only"
      ],
      [
        "Audit policy",
        "Branch-Account-Audit",
        "Not linked"
      ],
      [
        "Privileged accounts",
        "Tier0 OU",
        "Outside approved scope"
      ]
    ],
    "fixes": [
      {
        "app": "aduc",
        "title": "Remove excessive membership",
        "values": {
          "group": "Helpdesk-L2",
          "removeFrom": "Domain Admins"
        }
      },
      {
        "app": "aduc",
        "title": "Delegate only approved OU operations",
        "values": {
          "group": "Helpdesk-L2",
          "ou": "Branch-Staff",
          "rights": "Reset password and unlock"
        }
      },
      {
        "app": "gpmc",
        "title": "Audit delegated account changes",
        "values": {
          "policy": "Branch-Account-Audit",
          "link": "Branch-Staff",
          "auditing": "Success and Failure"
        }
      }
    ],
    "positive": "Helpdesk-L2 resets a test standard-user password and unlocks that account; both actions are audited.",
    "negative": "Helpdesk-L2 cannot modify Tier0 accounts or group membership and has no Domain Admins membership.",
    "tags": [
      "Delegation",
      "Least privilege",
      "Audit policy"
    ]
  },
  {
    "track": "cyber",
    "slot": 7,
    "title": "Investigate MFA Fatigue and Revoke Stolen Sessions",
    "ticket": "User nmensah reported repeated MFA prompts followed by a login from 198.51.100.73. Preserve sign-in and MFA logs for IR-207, revoke nmensah sessions and require credential reset, then enable number matching for the affected authentication policy. An approved service identity must remain operational.",
    "cause": "MFA fatigue led to an unauthorized interactive session",
    "evidence": [
      [
        "09:00–09:04",
        "nmensah",
        "18 declined prompts"
      ],
      [
        "09:05",
        "nmensah",
        "Accepted prompt; unfamiliar source"
      ],
      [
        "09:06",
        "User report",
        "Did not initiate login"
      ],
      [
        "Baseline",
        "svc-report",
        "Approved scheduled activity"
      ]
    ],
    "fixes": [
      {
        "app": "event",
        "title": "Preserve identity evidence",
        "values": {
          "case": "IR-207",
          "logs": "Sign-in and MFA logs"
        }
      },
      {
        "app": "aduc",
        "title": "Revoke the affected user sessions",
        "values": {
          "user": "nmensah",
          "response": "Revoke sessions and require credential reset"
        }
      },
      {
        "app": "server",
        "title": "Harden interactive MFA prompts",
        "values": {
          "policy": "Workforce MFA",
          "numberMatching": "Enabled"
        }
      }
    ],
    "positive": "Captured nmensah sessions are rejected; the next interactive sign-in requires the reset and number-matching MFA.",
    "negative": "svc-report remains operational; no global account lockout or evidence deletion occurred.",
    "tags": [
      "MFA fatigue",
      "Session containment",
      "Identity evidence"
    ]
  },
  {
    "track": "cyber",
    "slot": 8,
    "title": "Contain Ransomware Before Testing Recovery",
    "ticket": "ENG-PC16 creates encrypted files and contacts 203.0.113.88. Preserve process and file telemetry under IR-208, isolate ENG-PC16 while retaining management telemetry, and block its SMB access to FILE-02. Validate backup ENG-0100 in an isolated recovery sandbox without reconnecting the suspect host.",
    "cause": "Active encryption on ENG-PC16 threatens the file share",
    "evidence": [
      [
        "10:11",
        "ENG-PC16",
        "High-rate rename to .locked"
      ],
      [
        "10:12",
        "Network",
        "203.0.113.88:443"
      ],
      [
        "10:12",
        "SMB",
        "ENG-PC16 → FILE-02"
      ],
      [
        "Backup",
        "ENG-0100",
        "Offline immutable copy available"
      ]
    ],
    "fixes": [
      {
        "app": "event",
        "title": "Preserve ransomware telemetry",
        "values": {
          "case": "IR-208",
          "package": "Process and file telemetry"
        }
      },
      {
        "app": "endpoint",
        "title": "Isolate the source and restrict SMB",
        "values": {
          "host": "ENG-PC16",
          "mode": "Isolate with telemetry",
          "blockedShare": "FILE-02"
        }
      },
      {
        "app": "server",
        "title": "Validate recovery in isolation",
        "values": {
          "backup": "ENG-0100",
          "target": "Isolated recovery sandbox",
          "integrity": "SHA-256 verified"
        }
      }
    ],
    "positive": "ENG-PC16 is isolated; share writes stop; isolated backup restore passes integrity and sample-file checks.",
    "negative": "The suspect host stays disconnected. No unverified files are restored to production; unrelated hosts retain authorized access.",
    "tags": [
      "Ransomware",
      "Evidence retention",
      "Isolated recovery"
    ]
  },
  {
    "track": "cyber",
    "slot": 9,
    "title": "Remove Unauthorized Privilege and Persistence",
    "ticket": "Audit logs show temp-support added itself to Local Administrators on APP-07 and created task UpdateCheck outside the change window. Preserve Security and TaskScheduler logs under IR-209. Remove temp-support from Local Administrators and disable UpdateCheck after evidence collection. Keep the approved BackupAgent task running.",
    "cause": "Unauthorized local privilege escalation and scheduled-task persistence",
    "evidence": [
      [
        "4732",
        "APP-07",
        "temp-support → Local Administrators"
      ],
      [
        "4698",
        "APP-07",
        "UpdateCheck executes unsigned payload"
      ],
      [
        "Change calendar",
        "APP-07",
        "No approved change"
      ],
      [
        "Baseline",
        "BackupAgent",
        "Signed approved task"
      ]
    ],
    "fixes": [
      {
        "app": "event",
        "title": "Preserve account and task evidence",
        "values": {
          "case": "IR-209",
          "logs": "Security and TaskScheduler logs"
        }
      },
      {
        "app": "aduc",
        "title": "Remove the unauthorized local privilege",
        "values": {
          "host": "APP-07",
          "account": "temp-support",
          "removeFrom": "Local Administrators"
        }
      },
      {
        "app": "server",
        "title": "Disable only the malicious persistence",
        "values": {
          "host": "APP-07",
          "task": "UpdateCheck",
          "state": "Disabled"
        }
      }
    ],
    "positive": "temp-support has no local administrative token after session renewal; UpdateCheck cannot run; collected evidence is retained.",
    "negative": "BackupAgent remains enabled and completes its scheduled job; unrelated accounts are unchanged.",
    "tags": [
      "Privilege escalation",
      "Persistence",
      "Audit correlation"
    ]
  },
  {
    "track": "cyber",
    "slot": 10,
    "title": "Scope a Web Exploit Attempt Before Containment",
    "ticket": "The WAF recorded encoded path traversal against WEB-03. Correlate reverse-proxy, application and file-access logs for IR-210. One request returned a sensitive-file marker, so treat this as confirmed access rather than only a blocked scan. Preserve those logs, disable the vulnerable /export endpoint, and revoke the exposed api-export credential. Keep /health and the main site available.",
    "cause": "A traversal request reached the application and exposed an export credential",
    "evidence": [
      [
        "WAF",
        "203.0.113.61",
        "Mixed blocked and allowed requests"
      ],
      [
        "Proxy",
        "/export traversal",
        "HTTP 200"
      ],
      [
        "File audit",
        "WEB-03",
        "Credential file read"
      ],
      [
        "Health",
        "WEB-03 /health",
        "HTTP 200"
      ]
    ],
    "fixes": [
      {
        "app": "event",
        "title": "Preserve correlated web evidence",
        "values": {
          "case": "IR-210",
          "logs": "Proxy, application and file-access logs"
        }
      },
      {
        "app": "firewall",
        "title": "Contain only the vulnerable endpoint",
        "values": {
          "host": "WEB-03",
          "path": "/export",
          "action": "Disable"
        }
      },
      {
        "app": "aduc",
        "title": "Revoke the exposed credential",
        "values": {
          "identity": "api-export",
          "credential": "Revoked"
        }
      }
    ],
    "positive": "Traversal requests cannot reach /export and the exposed credential is rejected; incident timeline is preserved.",
    "negative": "The main site and /health remain available. A WAF block alone is not recorded as proof that no access occurred.",
    "tags": [
      "Web incident",
      "Credential exposure",
      "Scoping"
    ]
  },
  {
    "track": "cloud",
    "slot": 7,
    "title": "Replace Static Keys With a Scoped Workload Role",
    "ticket": "The invoice worker uses a static key with storage-wide access. Configure role invoice-reader trusted only by compute.prempeh.lab, allowing GetObject on invoices/approved/*. Attach it to invoice-worker, then disable static key invoice-old. Block public access on the invoices bucket and retain encryption. The worker must not list or read private-payroll/*.",
    "cause": "Static credentials and overly broad storage access expose unrelated data",
    "evidence": [
      [
        "Worker",
        "invoice-worker",
        "Static key invoice-old"
      ],
      [
        "Permission",
        "Storage",
        "All actions, all objects"
      ],
      [
        "Bucket",
        "invoices",
        "Public access possible"
      ],
      [
        "Required workload",
        "Invoice processor",
        "Read approved invoices only"
      ]
    ],
    "fixes": [
      {
        "app": "server",
        "title": "Create the scoped workload role",
        "values": {
          "role": "invoice-reader",
          "trust": "compute.prempeh.lab",
          "action": "GetObject",
          "resource": "invoices/approved/*"
        }
      },
      {
        "app": "server",
        "title": "Switch the workload identity and retire its key",
        "values": {
          "workload": "invoice-worker",
          "role": "invoice-reader",
          "disableKey": "invoice-old"
        }
      },
      {
        "app": "server",
        "title": "Protect bucket access and encryption",
        "values": {
          "bucket": "invoices",
          "blockPublic": "Enabled",
          "encryption": "Enabled"
        }
      }
    ],
    "positive": "invoice-worker reads approved invoice objects using temporary role credentials; invoice-old is rejected.",
    "negative": "Public reads and private-payroll access are denied. Bucket encryption remains enabled.",
    "tags": [
      "Workload identity",
      "Object storage",
      "Least privilege"
    ]
  },
  {
    "track": "cloud",
    "slot": 8,
    "title": "Recover a Database Into an Alternate Zone",
    "ticket": "DB-ORDERS in zone-a failed. Restore verified snapshot orders-0215 into zone-b on a private subnet. Attach security group sg-orders-db allowing TCP 5432 only from sg-orders-app. After integrity validation, move orders-db.corp.local to restored endpoint orders-db-b.internal. Keep the old database isolated and public addressing disabled.",
    "cause": "Database zone failure requires a verified private restore and controlled cutover",
    "evidence": [
      [
        "DB-ORDERS",
        "zone-a",
        "Unavailable"
      ],
      [
        "Snapshot",
        "orders-0215",
        "Verified; 02:15 recovery point"
      ],
      [
        "Alternate capacity",
        "zone-b",
        "Available"
      ],
      [
        "DNS",
        "orders-db.corp.local",
        "Failed primary"
      ]
    ],
    "fixes": [
      {
        "app": "server",
        "title": "Restore the approved database copy",
        "values": {
          "snapshot": "orders-0215",
          "zone": "zone-b",
          "subnet": "Private",
          "publicAddress": "Disabled"
        }
      },
      {
        "app": "server",
        "title": "Scope database ingress and verify integrity",
        "values": {
          "group": "sg-orders-db",
          "port": "5432",
          "source": "sg-orders-app",
          "integrity": "Verified"
        }
      },
      {
        "app": "dns",
        "title": "Cut over the database name",
        "values": {
          "name": "orders-db.corp.local",
          "target": "orders-db-b.internal",
          "oldPrimary": "Isolated"
        }
      }
    ],
    "positive": "Orders application resolves the restored database and completes a read/write transaction at the approved recovery point.",
    "negative": "Direct Internet database access is denied and the failed primary cannot accept writes, avoiding split-brain operation.",
    "tags": [
      "Database recovery",
      "Zone failover",
      "DNS cutover"
    ]
  },
  {
    "track": "cloud",
    "slot": 9,
    "title": "Control Log Costs Without Destroying Audit Evidence",
    "ticket": "Debug telemetry in app-debug has unlimited retention, but audit-security must be preserved for 365 days. Set app-debug retention to 14 days, move audit-security to archive after 30 days while retaining it for 365, and configure monthly budget cloud-ops-1200 with warning at 80 percent to finops-alerts. No resource shutdown automation is approved.",
    "cause": "Unbounded debug retention raises costs while audit data requires a separate retention policy",
    "evidence": [
      [
        "Storage",
        "app-debug",
        "900 GB; no expiration"
      ],
      [
        "Compliance",
        "audit-security",
        "365-day retention required"
      ],
      [
        "Budget",
        "Cloud operations",
        "No alert"
      ],
      [
        "Approval",
        "Cost controls",
        "Alerts only; no shutdown"
      ]
    ],
    "fixes": [
      {
        "app": "server",
        "title": "Bound debug retention",
        "values": {
          "dataset": "app-debug",
          "retentionDays": "14"
        }
      },
      {
        "app": "server",
        "title": "Preserve and tier security audit data",
        "values": {
          "dataset": "audit-security",
          "archiveAfterDays": "30",
          "retainDays": "365"
        }
      },
      {
        "app": "server",
        "title": "Configure a non-destructive budget alert",
        "values": {
          "budget": "cloud-ops-1200",
          "monthlyLimit": "1200",
          "warningPercent": "80",
          "topic": "finops-alerts",
          "shutdown": "Disabled"
        }
      }
    ],
    "positive": "Lifecycle preview expires only debug data older than 14 days and archives audit data at day 30; simulated budget warning reaches finops-alerts.",
    "negative": "Audit records remain retrievable for 365 days; no live workload is stopped by the budget policy.",
    "tags": [
      "Cost management",
      "Lifecycle",
      "Audit retention"
    ]
  },
  {
    "track": "cloud",
    "slot": 10,
    "title": "Rotate a Leaked Application Secret Without Downtime",
    "ticket": "Credential payments-v1 appeared in deployment logs. Prepare payments-v2 in the secret store, update payments-api to use its workload role and reference secrets/payments/current, then revoke payments-v1 after the new-version health check. Remove secret values from deployment logging by enabling redaction. Preserve the incident logs with restricted access.",
    "cause": "A deployment log exposed the active payment credential",
    "evidence": [
      [
        "Deployment",
        "payments-api",
        "Credential value printed"
      ],
      [
        "Secret store",
        "payments-v2",
        "Prepared, inactive"
      ],
      [
        "Workload",
        "payments-api",
        "Still references v1"
      ],
      [
        "Health",
        "Current service",
        "HTTP 200"
      ]
    ],
    "fixes": [
      {
        "app": "server",
        "title": "Activate the replacement secret through workload identity",
        "values": {
          "workload": "payments-api",
          "role": "payments-role",
          "secretReference": "secrets/payments/current",
          "version": "payments-v2"
        }
      },
      {
        "app": "server",
        "title": "Validate the replacement before revocation",
        "values": {
          "health": "HTTP 200 with payments-v2",
          "revoke": "payments-v1"
        }
      },
      {
        "app": "server",
        "title": "Prevent recurring secret exposure",
        "values": {
          "redaction": "Enabled",
          "incidentLogs": "Restricted and preserved"
        }
      }
    ],
    "positive": "Payment authorization smoke test succeeds with v2; the retired v1 credential is rejected; secret values are absent from new logs.",
    "negative": "Anonymous secret-store reads are denied and service remains available throughout the controlled rotation.",
    "tags": [
      "Secret rotation",
      "Workload roles",
      "Safe deployment"
    ]
  },
  {
    "track": "integrated",
    "slot": 7,
    "title": "Fail Over a Clinic Application With Access Boundaries",
    "ticket": "Clinic primary APP-CLINIC-A failed but APP-CLINIC-B is healthy. Publish clinic.corp.local at 10.85.2.20, grant Clinic-Staff Modify on Clinic-Documents, and allow only clinic VLAN85 10.85.0.0/24 to TCP 443 on the standby. Keep guest access denied and the failed primary isolated.",
    "cause": "Primary failure needs coordinated DNS, access and network failover",
    "evidence": [
      [
        "APP-CLINIC-A",
        "Health",
        "Unavailable"
      ],
      [
        "APP-CLINIC-B",
        "10.85.2.20",
        "HTTP 200"
      ],
      [
        "Share",
        "Clinic-Staff",
        "Read only"
      ],
      [
        "Firewall",
        "Clinic VLAN → standby",
        "Denied"
      ]
    ],
    "fixes": [
      {
        "app": "dns",
        "title": "Move the clinic service name",
        "values": {
          "name": "clinic",
          "address": "10.85.2.20",
          "oldPrimary": "Isolated"
        }
      },
      {
        "app": "server",
        "title": "Restore staff document permissions",
        "values": {
          "share": "Clinic-Documents",
          "group": "Clinic-Staff",
          "permission": "Modify"
        }
      },
      {
        "app": "firewall",
        "title": "Allow the clinic application path",
        "values": {
          "source": "10.85.0.0/24",
          "destination": "10.85.2.20",
          "port": "443"
        }
      }
    ],
    "positive": "Clinic staff resolves the standby, loads the application and updates a test document.",
    "negative": "Guest access is denied and the failed primary remains isolated; no broad administrative access was granted.",
    "tags": [
      "Business continuity",
      "DNS failover",
      "Permissions"
    ]
  },
  {
    "track": "integrated",
    "slot": 8,
    "title": "Provision Secure Remote Access for a New Analyst",
    "ticket": "Onboard eboateng on managed device LAP-AN42. Place the user in Analytics-Staff only, require MFA and compliant-device status for the Analytics-Remote policy, and allow VPN pool 10.96.0.0/24 to analytics service 10.90.2.15 on TCP 443 only. The analyst must not reach database port 5432 or receive administrator membership.",
    "cause": "Remote onboarding lacks scoped identity, device compliance and application policy",
    "evidence": [
      [
        "Identity",
        "eboateng",
        "Created without department group"
      ],
      [
        "Device",
        "LAP-AN42",
        "Managed; compliance pending"
      ],
      [
        "Remote policy",
        "Analytics-Remote",
        "MFA not required"
      ],
      [
        "Requested access",
        "Analytics portal",
        "HTTPS only"
      ]
    ],
    "fixes": [
      {
        "app": "aduc",
        "title": "Assign the approved department membership",
        "values": {
          "user": "eboateng",
          "group": "Analytics-Staff",
          "administrator": "No"
        }
      },
      {
        "app": "endpoint",
        "title": "Enforce device and authentication requirements",
        "values": {
          "device": "LAP-AN42",
          "compliance": "Compliant",
          "policy": "Analytics-Remote",
          "mfa": "Required"
        }
      },
      {
        "app": "firewall",
        "title": "Scope VPN application access",
        "values": {
          "source": "10.96.0.0/24",
          "destination": "10.90.2.15",
          "port": "443"
        }
      }
    ],
    "positive": "eboateng signs in with MFA on LAP-AN42 and reaches the analytics portal through VPN.",
    "negative": "An unmanaged device is rejected; TCP 5432 and administrator operations are denied.",
    "tags": [
      "Remote access",
      "Device compliance",
      "Identity provisioning"
    ]
  },
  {
    "track": "integrated",
    "slot": 9,
    "title": "Connect an Acquired Team Without Flattening Trust",
    "ticket": "The acquired design team needs the render portal only. Add acquired.design.local conditional forwarding to 10.110.0.53, map approved Acquired-Design identities to Render-Users without domain-wide trust, and permit source 10.110.20.0/24 to render service 10.100.4.30 TCP 443. Preserve the finance and management network boundaries.",
    "cause": "Scoped name resolution, identity mapping and application access are missing",
    "evidence": [
      [
        "DNS",
        "acquired.design.local",
        "No conditional forwarder"
      ],
      [
        "Identity",
        "Acquired-Design",
        "No portal entitlement"
      ],
      [
        "Firewall",
        "Acquired design → render",
        "Denied"
      ],
      [
        "Security requirement",
        "Finance and management",
        "No acquired-team access"
      ]
    ],
    "fixes": [
      {
        "app": "dns",
        "title": "Add scoped conditional resolution",
        "values": {
          "zone": "acquired.design.local",
          "forwarder": "10.110.0.53"
        }
      },
      {
        "app": "aduc",
        "title": "Map only approved portal identities",
        "values": {
          "sourceGroup": "Acquired-Design",
          "targetGroup": "Render-Users",
          "domainWideTrust": "Disabled"
        }
      },
      {
        "app": "firewall",
        "title": "Permit the render application only",
        "values": {
          "source": "10.110.20.0/24",
          "destination": "10.100.4.30",
          "port": "443"
        }
      }
    ],
    "positive": "An approved acquired-team identity resolves the required names and submits a render test job.",
    "negative": "Finance, management and unapproved identities remain blocked; no domain-wide trust was created.",
    "tags": [
      "Integration planning",
      "Conditional DNS",
      "Trust boundaries"
    ]
  },
  {
    "track": "integrated",
    "slot": 10,
    "title": "Recover Business Services After Endpoint Compromise",
    "ticket": "OPS-PC31 encrypted the dispatch share and abused svc-legacy. Preserve endpoint and identity evidence under OPS-210, isolate OPS-PC31 with telemetry retained, and disable svc-legacy with session revocation. Restore dispatch snapshot DSP-0300 into an isolated staging area, verify SHA-256 integrity, and cut over only after validation. Run dispatch as corp\\svc-dispatch-clean; keep the compromised host isolated.",
    "cause": "Endpoint encryption and abused service credentials require containment before recovery",
    "evidence": [
      [
        "OPS-PC31",
        "File activity",
        "Mass encryption"
      ],
      [
        "svc-legacy",
        "Authentication",
        "Unexpected remote session"
      ],
      [
        "Snapshot",
        "DSP-0300",
        "Verified immutable source"
      ],
      [
        "Business service",
        "Dispatch",
        "Unavailable"
      ]
    ],
    "fixes": [
      {
        "app": "endpoint",
        "title": "Contain and preserve the incident",
        "values": {
          "case": "OPS-210",
          "host": "OPS-PC31",
          "response": "Isolate with telemetry",
          "evidence": "Endpoint and identity logs preserved"
        }
      },
      {
        "app": "aduc",
        "title": "Retire the abused identity",
        "values": {
          "account": "svc-legacy",
          "action": "Disable and revoke sessions"
        }
      },
      {
        "app": "server",
        "title": "Stage and validate business recovery",
        "values": {
          "snapshot": "DSP-0300",
          "staging": "Isolated",
          "integrity": "SHA-256 verified",
          "runAs": "corp\\svc-dispatch-clean"
        }
      }
    ],
    "positive": "Verified staged dispatch data is promoted; a test order completes under svc-dispatch-clean.",
    "negative": "OPS-PC31 remains isolated, svc-legacy sessions are rejected and unverified data is never promoted.",
    "tags": [
      "Incident recovery",
      "Identity rotation",
      "Business validation"
    ]
  }
];
  const lab=window.PrempehDesktopLab;
  for(const c of cases){
    const prefix=c.track+c.slot,caseId=prefix.toUpperCase();
    const form=(suffix,app,title,values,dependencies,evidence)=>({id:prefix+suffix,app,title,type:'form',
      fields:Object.keys(values).map(key=>[key,key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase()),'text']),expected:values,dependencies,evidence,
      why:'Compare the observed evidence with the approved design. Make scoped changes and validate both the recovered service and the boundary that must remain protected.'});
    const tasks=[{
      id:prefix+'diagnose',app:'event',title:'Correlate the incident evidence',type:'form',
      fields:[['cause','Evidence-supported finding','select',[c.cause,'All systems require a complete rebuild','The evidence shows no problem']]],
      expected:{cause:c.cause},evidence:c.evidence,why:'Correlate the independent observations before deciding which systems to change.'
    },form('plan','server','Record the change scope and rollback checkpoint',{
      case:caseId,scope:'Affected resources only',rollback:'Preserve current configuration and evidence'
    },[prefix+'diagnose'])];
    c.fixes.forEach((f,i)=>tasks.push(form('fix'+i,f.app,f.title,f.values,[prefix+(i?'fix'+(i-1):'plan')])));
    const command=(suffix,title,result,deps)=>{
      const cmd='test-labcase '+prefix+' '+suffix;
      return {id:prefix+suffix,app:'powershell',title,type:'command',required:[cmd],responses:{[cmd]:result+' PASS (simulation).'},dependencies:deps};
    };
    tasks.push(command('recovery','Verify the recovered business function',c.positive,[prefix+'fix2']),
      command('boundary','Verify restrictions and unaffected services',c.negative,[prefix+'recovery']),
      form('handover','server','Document the validated handover',{
        case:caseId,outcome:'Recovery and boundary checks passed',followUp:'Monitor for 30 minutes'
      },[prefix+'recovery',prefix+'boundary']));
    lab.registerScenario(c.track,c.slot,{title:c.title,role:'Intermediate '+lab.getTrackLabel(c.track)+' Operator',curriculumLevel:2,
      ticket:c.ticket+' Change record '+caseId+': scope = Affected resources only; rollback = Preserve current configuration and evidence. After both checks, record outcome = Recovery and boundary checks passed; followUp = Monitor for 30 minutes. Get-LabState shows accepted changes. Test-LabCase commands are simulated checks, available in the PowerShell Command Guide.',
      tags:c.tags,apps:[...new Set(tasks.map(t=>t.app))],tasks});
  }
})();
