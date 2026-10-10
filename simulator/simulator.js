(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const STORAGE_KEY = "prempehtech-simulator-progress-v1";

  const labs = {
    networking: {
      track: "NETWORKING",
      title: "Bring the Office PC Online",
      objective: "Connect the topology, configure PC-01, then prove connectivity to SRV-01.",
      guided: [
        "Connect PC-01 to SW1. End-user devices normally reach the LAN through an access switch.",
        "Connect SW1 to R1. The router is the default gateway that moves traffic between different IP networks.",
        "Connect R1 to SRV-01. In this lab the server lives on a separate 10.0.0.0/24 network.",
        "Configure PC-01 as 192.168.10.10 with mask 255.255.255.0 and gateway 192.168.10.1.",
        "Run ipconfig to inspect the workstation configuration.",
        "Run ping 10.0.0.10. A successful reply proves the physical path and Layer 3 routing are working.",
        "Run tracert 10.0.0.10 and arp -a to inspect the path and Layer 2 neighbor information.",
        "Run nslookup intranet.corp.local. DNS should resolve it to 10.0.0.10 before the lab is complete."
      ],
      hints: [
        "Start at the physical layer. A workstation normally connects to a switch before reaching a router.",
        "PC-01 belongs to 192.168.10.0/24. Its default gateway must be the router interface on that same subnet.",
        "Use 192.168.10.10 / 255.255.255.0 / 192.168.10.1, ping 10.0.0.10, then resolve intranet.corp.local with nslookup."
      ]
    },
    sysadmin: {
      track: "SYSTEM ADMINISTRATION",
      title: "Provision a New Employee",
      objective: "Create Jordan Lee's account and provide only the access required for Accounting work.",
      guided: [
        "Create the username jlee and set the display name to Jordan Lee.",
        "Add jlee to the Accounting security group instead of granting elevated administrator membership.",
        "Assign the Finance folder permission to the Accounting group. Group-based access is easier to manage than one-off user permissions.",
        "Choose Modify. It allows reading, creating, changing, and deleting files without allowing ownership or permission changes.",
        "Run the access test to confirm Jordan can edit Finance content without receiving Full Control."
      ],
      hints: [
        "The username standard is first initial + surname.",
        "Do not use Domain Admins or Everyone. Think about Jordan's department.",
        "Grant the permission to the Accounting group and choose Modify, not Full Control."
      ]
    },
    cyber: {
      track: "CYBERSECURITY",
      title: "Investigate Failed Logins",
      objective: "Find the suspicious authentication pattern, classify it, and choose a safe first response.",
      guided: [
        "Compare successful Event ID 4624 entries with failed Event ID 4625 entries.",
        "Notice that 10.20.30.77 generates repeated failures against the administrator account within seconds.",
        "Classify the activity as a password brute-force attempt. The rapid repeated failures are the key indicator.",
        "Choose a response that validates the source, protects the targeted account, and contains the source if it is unauthorized.",
        "Do not destroy systems, disable logging, or ignore repeated privileged-account failures."
      ],
      hints: [
        "Look for repeated events from the same source rather than focusing on one failed login.",
        "Event ID 4625 means a failed Windows logon. Which source repeats it against administrator?",
        "Select 10.20.30.77, classify it as a password brute-force attempt, then choose the validate/protect/contain response."
      ]
    },
    integrated: {
      track: "INTEGRATED IT CHALLENGE",
      title: "Restore the Finance Office",
      objective: "Repair connectivity, correct least-privilege access, and respond to a credential attack in one incident.",
      guided: [
        "Networking: compare FIN-PC01's gateway with R1's Finance interface and correct it to 192.168.50.1.",
        "System administration: place Maya Cole in Finance and grant Modify permission, not Full Control.",
        "Cybersecurity: recognize repeated Event ID 4625 failures against administrator from 10.50.20.99 as credential brute force.",
        "Protect the account, preserve logs, and block the unauthorized source.",
        "Complete all three phases before closing the incident."
      ],
      hints: [
        "A host's default gateway should be the router interface on its own subnet.",
        "Use the Finance group and the least permission that still allows editing.",
        "Repeated 4625 events against administrator from one source indicate credential brute force."
      ]
    }
  };

  const difficultyLevels = Object.fromEntries(
    ['networking','sysadmin','cyber','cloud','integrated'].map(track=>
      [track,{name:window.PrempehDesktopLab.getTrackLabel(track)}]));

  const explanations = {
    ipconfig: {
      category: "NETWORKING COMMAND",
      title: "ipconfig",
      summary: "Shows the TCP/IP configuration assigned to a Windows computer.",
      does: "Displays interface details such as IPv4 address, subnet mask, default gateway, and DNS configuration.",
      means: "It tells you how the workstation currently sees itself on the network and which router or DNS server it will try to use.",
      why: "It is one of the first commands to run when a Windows machine cannot communicate. A wrong IP, mask, or gateway can explain the failure immediately.",
      example: "ipconfig"
    },
    ping: {
      category: "NETWORKING COMMAND",
      title: "ping",
      summary: "Tests whether an IP host can respond across the network using ICMP echo messages.",
      does: "Sends echo requests to a destination and reports replies, delay, and packet loss.",
      means: "A successful reply proves some path exists between the two hosts. A failure does not automatically tell you which layer is broken.",
      why: "Ping helps you test the troubleshooting chain in stages: local interface, gateway, remote server, then other destinations.",
      example: "ping 10.0.0.10"
    },
    tracert: {
      category: "NETWORKING COMMAND",
      title: "tracert",
      summary: "Shows the Layer 3 path traffic takes toward a destination.",
      does: "Lists the routers or hops encountered as Windows sends packets with increasing TTL values.",
      means: "Each hop represents a routing step. If the trace stops at a particular point, that area becomes a strong troubleshooting lead.",
      why: "It helps distinguish a local workstation problem from a routing or upstream network problem.",
      example: "tracert 10.0.0.10"
    },
    arp: {
      category: "NETWORKING COMMAND",
      title: "arp -a",
      summary: "Displays the computer's local IPv4-to-MAC address neighbor mappings.",
      does: "Shows ARP cache entries learned while communicating with devices on the local network.",
      means: "An entry connects a Layer 3 IPv4 address to the Layer 2 MAC address used to deliver the Ethernet frame locally.",
      why: "It helps verify local Layer 2 neighbor discovery and can expose wrong, missing, or unexpected MAC mappings.",
      example: "arp -a"
    },
    nslookup: {
      category: "NETWORKING COMMAND",
      title: "nslookup",
      summary: "Queries DNS to translate a hostname into an IP address or inspect DNS answers.",
      does: "Sends a DNS query and shows the DNS server used plus the returned record.",
      means: "If pinging an IP works but a hostname fails, DNS becomes a likely cause rather than routing.",
      why: "Users normally access services by names, not raw IP addresses. A network can be reachable while the application still appears broken because DNS is wrong.",
      example: "nslookup intranet.corp.local"
    },
    ou: {
      category: "SYSTEM ADMINISTRATION CONCEPT",
      title: "Organizational Unit (OU)",
      summary: "An Active Directory container used to organize users, computers, and other directory objects.",
      does: "Groups directory objects into a manageable structure where administration and Group Policy can be scoped.",
      means: "Putting an account in the correct OU is about management structure and policy scope, not simply giving it permissions.",
      why: "A well-designed OU structure makes policy application, delegation, and troubleshooting more predictable.",
      example: "corp.local / Departments / Accounting / Users"
    },
    securityGroup: {
      category: "SYSTEM ADMINISTRATION CONCEPT",
      title: "Security Group",
      summary: "A reusable identity group used to assign permissions to multiple users or computers.",
      does: "Lets administrators grant a resource permission once to a group instead of separately to every employee.",
      means: "The user's access comes from role or membership. Moving a person into or out of the group changes access consistently.",
      why: "Group-based access scales better, reduces mistakes, and makes audits much easier than individual one-off permissions.",
      example: "Accounting group → Finance folder → Modify"
    },
    modifyPermission: {
      category: "SYSTEM ADMINISTRATION CONCEPT",
      title: "Modify vs Full Control",
      summary: "Modify allows normal file work; Full Control also allows changing permissions and ownership.",
      does: "Modify generally permits read, write, create, change, and delete. Full Control adds administrative control over the security of the object.",
      means: "A user who only needs to work with documents usually does not need authority to change who else can access them.",
      why: "Choosing the minimum required permission follows least privilege and limits damage from mistakes or compromised accounts.",
      example: "Finance staff: Modify ✓   Full Control ✕"
    },
    leastPrivilege: {
      category: "SECURITY PRINCIPLE",
      title: "Least Privilege",
      summary: "Give an account only the access required to perform its job.",
      does: "Limits permissions, roles, and administrative rights to the minimum necessary scope.",
      means: "Being able to do more is not automatically better. Extra rights create extra paths for mistakes and attackers.",
      why: "Least privilege reduces blast radius and is central to secure identity and systems administration.",
      example: "Accounting user → Accounting group, not Domain Admins"
    },
    event4625: {
      category: "CYBERSECURITY CONCEPT",
      title: "Windows Event ID 4625",
      summary: "A Windows Security log event recording a failed account logon.",
      does: "Captures details about a failed authentication attempt, often including account, logon type, source information, and failure reason.",
      means: "One failure may be harmless. Repeated 4625 events against the same account from one source can form a suspicious pattern.",
      why: "SOC analysts use these events to detect password guessing, brute force, misconfigured services, or account abuse.",
      example: "4625 · administrator · 10.20.30.77 · Failed"
    },
    bruteForce: {
      category: "CYBERSECURITY CONCEPT",
      title: "Password Brute Force",
      summary: "Repeated attempts to discover or guess valid credentials.",
      does: "An attacker tries many passwords or credentials against an account until one works or defenses stop the activity.",
      means: "Rapid repeated failures are more important as a pattern than any single failed login.",
      why: "Detecting brute force early can prevent account compromise, privilege escalation, and later movement through the environment.",
      example: "4625 → 4625 → 4625 → same account + same source"
    },
    preserveLogs: {
      category: "INCIDENT RESPONSE PRINCIPLE",
      title: "Preserve the Logs",
      summary: "Keep the evidence needed to understand what happened before making destructive changes.",
      does: "Protects authentication, endpoint, firewall, SIEM, and system records from deletion or unnecessary alteration.",
      means: "Containment should stop the threat without erasing the timeline investigators need.",
      why: "Good evidence supports root-cause analysis, scoping, recovery decisions, and defensible incident documentation.",
      example: "Contain source ✓   Protect account ✓   Delete logs ✕"
    }
  };

  function openExplanation(key) {
    const data = explanations[key];
    if (!data) return;
    $("explainCategory").textContent = data.category;
    $("explainTitle").textContent = data.title;
    $("explainSummary").textContent = data.summary;
    $("explainDoes").textContent = data.does;
    $("explainMeans").textContent = data.means;
    $("explainWhy").textContent = data.why;
    $("explainExample").textContent = data.example || "";
    $("explainExampleWrap").classList.toggle("hidden", !data.example);
    $("explainOverlay").classList.remove("hidden");
  }

  function closeExplanation() {
    $("explainOverlay").classList.add("hidden");
  }

  let selectedLevel = 1;
  const selectedProject=()=>Number($("foundationAssignment").value||(selectedLevel===2?6:1));
  $("foundationAssignment").addEventListener("change",()=>setDifficultyLevel(selectedLevel));

  function setDifficultyLevel(level) {
    const value = Number(level);
    const trackConfig = difficultyLevels[activeTrack] || difficultyLevels.networking;
    let projectId=Number($("foundationAssignment").value||1);
    const entries=window.PrempehDesktopLab.getCatalog().filter(x=>x.track===activeTrack&&x.level===value);
    if(!entries.some(x=>x.id===projectId))projectId=entries[0].id;
    $("foundationAssignment").innerHTML=entries.map((x,i)=>`<option value="${x.id}">Lab ${i+1} · ${x.data.title}</option>`).join('');
    $("foundationAssignment").value=String(projectId);
    $("assignmentLabel").textContent="Level "+value+" assignment";
    const data={label:"LEVEL "+value+(value===1?" · FOUNDATIONS":" · INTERMEDIATE"),title:value===1?"Level 1 — all current labs":"Level 2 — intermediate operations",description:value===1?"All five original assignments in this track are preserved. Choose an assignment below or browse Project Center.":"Choose one of five intermediate assignments. Investigate evidence, make controlled changes, verify recovery, and document the handover.",topics:value===1?["Five preserved assignments","Saved progress retained"]:["Evidence correlation","Change control","Recovery checks","Handover"]};
    selectedLevel = value;

    $$(".level-btn").forEach((btn) => {
      const btnLevel = Number(btn.dataset.level);
      const active = btnLevel === value;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
      const strong = btn.querySelector("strong");
      if (strong) strong.textContent = btnLevel===1?"Foundations":"Intermediate";
    });

    $("levelSelectorTrackLabel").textContent = trackConfig.name.toUpperCase() + " LEVELS · ALL UNLOCKED";
    $("levelSelectorTitle").textContent = activeTrack === "integrated" ? "Choose a combined-track difficulty level" : "Choose a " + trackConfig.name + " difficulty level";
    $("levelLabel").textContent = data.label;
    $("levelTitle").textContent = data.title;
    $("levelDescription").textContent = data.description;
    $("levelTopics").innerHTML = data.topics.map((topic) => "<span>" + topic + "</span>").join("");
    $("levelJumpBtn").textContent = "Open Level " + value + " Project";

    if (window.PrempehDesktopLab) {
      const scenario = window.PrempehDesktopLab.getScenario(activeTrack, projectId);
      const card = document.querySelector('[data-card-track="' + activeTrack + '"]');
      if (scenario && card) {
        const title = card.querySelector("h3");
        const desc = card.querySelector("p");
        const difficulty = card.querySelector(".difficulty");
        const skills = card.querySelector(".skills");
        const launch = card.querySelector("[data-launch]");
        if (title) title.textContent = scenario.title;
        if (desc) desc.textContent = scenario.ticket;
        if (difficulty) difficulty.textContent = "LEVEL " + value;
        if (skills) skills.innerHTML = scenario.tags.map((tag) => "<span>" + tag + "</span>").join("");
        if (launch) launch.textContent = "Launch Level " + value + " Project";
      }
    }
  }

  let progress = loadProgress();
  let activeTrack = "networking";
  let activeLab = null;
  let score = 100;
  let hintIndex = 0;
  let mode = "challenge";
  let missionFinished = false;

  let network = { selected: null, links: [], ipGood: false, gatewayGood: false, pingGood: false, dnsGood: false };
  let sys = { user: false, group: false, permission: false, access: false };
  let cyber = { done: false };
  let integrated = { network: false, admin: false, cyber: false };

  function loadProgress() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return window.PrempehSecurity.progress(stored);
    } catch (_) {
      return { completed: {}, completedLevels: {}, xp: 0 };
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    if (window.PrempehCloud && window.PrempehCloud.isSignedIn()) {
      window.PrempehCloud.saveProgress(progress).catch(() => {
        // Local save remains authoritative if cloud sync is temporarily unavailable.
      });
    }
  }

  function updateProgressUI() {
    const completedLevels = progress.completedLevels || {};
    const completedCount = Object.keys(completedLevels).filter((k) => completedLevels[k]).length;
    $("xpValue").textContent = progress.xp;
    $("completedValue").textContent = completedCount;
    $("progressFill").style.width = Math.min(100, (completedCount / (Object.keys(difficultyLevels).length * 10)) * 100) + "%";
    $("rankValue").textContent =
      completedCount === 0 ? "Foundation" :
      completedCount < 5 ? "Junior Technician" :
      completedCount < 10 ? "Administrator" :
      completedCount < 15 ? "Junior Analyst" : "Mid-Level Professional";

    ["networking", "sysadmin", "cyber", "cloud", "integrated"].forEach((key) => {
      const badge = document.querySelector('[data-complete-badge="' + key + '"]');
      if (!badge) return;
      const count = [1,2,3,4,5,6,7,8,9,10].filter((level) => completedLevels[key + ":" + level]).length;
      badge.textContent = count === 10 ? "10/10 completed ✓" : count + "/10 completed";
      badge.classList.toggle("done", count === 10);
    });

    $("continueBtn").textContent = "Choose a Lab";
  }

  function setTrack(track) {
    activeTrack = track;
    $$(".track-tab").forEach((btn) => {
      const active = btn.dataset.track === track;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    $$(".activity-card").forEach((card) => card.classList.toggle("active-track", card.dataset.cardTrack === track));
    setDifficultyLevel(selectedLevel);
  }

  function launchLab(key) {
    activeLab = key;
    score = 100;
    hintIndex = 0;
    mode = "challenge";
    missionFinished = false;
    resetState(key);
    const data = labs[key];
    $("labTrackLabel").textContent = data.track;
    $("labTitle").textContent = data.title;
    $("labObjective").textContent = data.objective;
    $("scoreValue").textContent = score;
    $("guidedTitle").textContent = data.title + " — complete walkthrough";
    $("guidedSteps").innerHTML = data.guided.map((step) => "<li>" + step + "</li>").join("");
    $("guidedPanel").classList.add("hidden");
    $$(".mode-btn").forEach((b) => b.classList.toggle("active", b.dataset.mode === "challenge"));
    ["networkingLab", "sysadminLab", "cyberLab", "integratedLab"].forEach((id) => $(id).classList.add("hidden"));
    const labIds = { networking: "networkingLab", sysadmin: "sysadminLab", cyber: "cyberLab", integrated: "integratedLab" };
    $(labIds[key]).classList.remove("hidden");
    $("missionComplete").classList.add("hidden");
    $("labShell").classList.remove("hidden");
    feedback("Mission ready.", data.objective, "normal");
    $("labShell").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetState(key) {
    if (key === "networking") {
      network = { selected: null, links: [], ipGood: false, gatewayGood: false, pingGood: false, dnsGood: false };
      $$(".device").forEach((d) => d.classList.remove("selected", "connected"));
      $("ipAddress").value = "";
      $("subnetMask").value = "";
      $("defaultGateway").value = "";
      $("terminalOutput").innerHTML = "Microsoft Windows [Version 10.0]\nType a command to test the network.\n\nC:\\Users\\student&gt;";
      $("topologyStatus").textContent = "Incomplete"; $("topologyStatus").classList.remove("good");
      $("ipStatus").textContent = "Incomplete"; $("ipStatus").classList.remove("good");
      $("dnsStatus").textContent = "Incomplete"; $("dnsStatus").classList.remove("good");
      renderConnections();
    }
    if (key === "sysadmin") {
      sys = { user: false, group: false, permission: false, access: false };
      $("newUsername").value = ""; $("displayName").value = ""; $("departmentSelect").value = "";
      $("groupSelect").value = ""; $("principalSelect").value = ""; $("permissionSelect").value = "";
      ["userStatus", "groupStatus", "permissionStatus"].forEach((id) => { $(id).textContent = "Incomplete"; $(id).classList.remove("good"); });
      $("accessStatus").textContent = "Not tested"; $("accessStatus").classList.remove("good");
      $("accessResult").textContent = "No access test has been run.";
    }
    if (key === "cyber") {
      cyber = { done: false };
      $("eventIdSelect").value = ""; $("targetUserSelect").value = ""; $("sourceSelect").value = ""; $("attackSelect").value = ""; $("responseSelect").value = "";
      $("evidenceStatus").textContent = "Awaiting analysis"; $("evidenceStatus").classList.remove("good");
      $("triageStatus").textContent = "Incomplete"; $("triageStatus").classList.remove("good");
    }
    if (key === "integrated") {
      integrated = { network: false, admin: false, cyber: false };
      ["integratedNetworkCause","integratedNetworkFix","integratedGroup","integratedPermission","integratedActivity","integratedResponse"].forEach((id) => $(id).value = "");
      ["integratedNetworkStatus","integratedAdminStatus","integratedCyberStatus"].forEach((id) => { $(id).textContent = "Incomplete"; $(id).classList.remove("good"); });
    }
  }

  function restartLab() {
    if (!activeLab) return;
    score = 100;
    hintIndex = 0;
    missionFinished = false;
    resetState(activeLab);
    $("scoreValue").textContent = score;
    $("missionComplete").classList.add("hidden");
    feedback("Lab restarted.", "Your score and lab state have been reset.", "normal");
  }

  function feedback(title, text, type) {
    const box = $("feedbackBox");
    box.className = "feedback" + (type && type !== "normal" ? " " + type : "");
    $("feedbackTitle").textContent = title;
    $("feedbackText").textContent = text;
  }

  function penalize(amount, title, text) {
    score = Math.max(25, score - amount);
    $("scoreValue").textContent = score;
    feedback(title, text, "error");
  }

  function getHint() {
    if (!activeLab || missionFinished) return;
    const hints = labs[activeLab].hints;
    const index = Math.min(hintIndex, hints.length - 1);
    if (hintIndex < hints.length) {
      score = Math.max(25, score - 5);
      $("scoreValue").textContent = score;
      hintIndex++;
    }
    feedback("Hint " + (index + 1) + " of " + hints.length, hints[index], "hint");
  }

  function setMode(nextMode) {
    mode = nextMode;
    $$(".mode-btn").forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
    const guided = mode === "guided";
    $("guidedPanel").classList.toggle("hidden", !guided);
    if (guided) {
      score = Math.min(score, 80);
      $("scoreValue").textContent = score;
      feedback("Guided mode enabled.", "The full process is shown above. Follow each step and complete the actions yourself.", "hint");
    } else {
      feedback("Challenge mode enabled.", "The walkthrough is hidden. Use hints only when you need them.", "normal");
    }
  }

  function normalizedLink(a, b) {
    return [a, b].sort().join("-");
  }

  function renderConnections() {
    const box = $("connectionList");
    if (!network.links.length) {
      box.innerHTML = "<span>No cables connected.</span>";
    } else {
      box.innerHTML = network.links.map((link) => {
        const names = link.split("-");
        return '<button class="connection-chip" type="button" data-link="' + link + '">' + names[0].toUpperCase() + " ↔ " + names[1].toUpperCase() + " ×</button>";
      }).join("");
      box.querySelectorAll("[data-link]").forEach((btn) => btn.addEventListener("click", () => {
        network.links = network.links.filter((x) => x !== btn.dataset.link);
        updateTopologyState();
        renderConnections();
        feedback("Cable removed.", "Rebuild the topology as needed.", "normal");
      }));
    }
    $$(".device").forEach((device) => {
      const id = device.dataset.device;
      device.classList.toggle("connected", network.links.some((l) => l.split("-").includes(id)));
    });
  }

  function updateTopologyState() {
    const needed = ["pc-switch", "router-switch", "router-server"];
    const good = needed.every((l) => network.links.includes(l));
    $("topologyStatus").textContent = good ? "Connected ✓" : "Incomplete";
    $("topologyStatus").classList.toggle("good", good);
    return good;
  }

  function handleDeviceClick(device) {
    if (activeLab !== "networking" || missionFinished) return;
    const id = device.dataset.device;
    if (!network.selected) {
      network.selected = id;
      $$(".device").forEach((d) => d.classList.toggle("selected", d.dataset.device === id));
      feedback("Cable tool armed.", "Now select the device you want to connect to " + id.toUpperCase() + ".", "normal");
      return;
    }
    if (network.selected === id) {
      network.selected = null;
      device.classList.remove("selected");
      feedback("Selection cleared.", "Choose two different devices to create a cable.", "normal");
      return;
    }

    const link = normalizedLink(network.selected, id);
    const validPhysicalPairs = ["pc-switch", "router-switch", "router-server"];
    if (network.links.includes(link)) {
      penalize(3, "That cable already exists.", "Choose a different pair or remove the existing connection.");
    } else if (!validPhysicalPairs.includes(link)) {
      penalize(8, "That connection does not match this topology.", "Think about the normal path from an end-user workstation toward a server on another network.");
    } else {
      network.links.push(link);
      feedback("Ethernet connected.", network.selected.toUpperCase() + " is now linked to " + id.toUpperCase() + ".", "success");
    }
    network.selected = null;
    $$(".device").forEach((d) => d.classList.remove("selected"));
    updateTopologyState();
    renderConnections();
  }

  function applyIp() {
    const ip = $("ipAddress").value.trim();
    const mask = $("subnetMask").value.trim();
    const gateway = $("defaultGateway").value.trim();
    if (ip === "192.168.10.10" && mask === "255.255.255.0" && gateway === "192.168.10.1") {
      network.ipGood = true;
      $("ipStatus").textContent = "Configured ✓"; $("ipStatus").classList.add("good");
      feedback("IPv4 configuration applied.", "PC-01 now has a valid address and default gateway for this lab.", "success");
    } else {
      network.ipGood = false;
      $("ipStatus").textContent = "Check settings"; $("ipStatus").classList.remove("good");
      let clue = "At least one value is incorrect. Confirm the host address, /24 mask, and router address.";
      if (ip && !/^192\.168\.10\./.test(ip)) clue = "PC-01 must be on the 192.168.10.0/24 LAN.";
      penalize(8, "Configuration rejected.", clue);
    }
  }

  function terminalAppend(text) {
    const out = $("terminalOutput");
    out.appendChild(document.createTextNode("\n\n" + text));
    out.scrollTop = out.scrollHeight;
  }

  function runCommand(raw) {
    const command = raw.trim().toLowerCase();
    if (!command) return;
    terminalAppend("C:\\Users\\student>" + raw.trim());

    if (command === "help") {
      terminalAppend("Useful commands: ipconfig, ping 192.168.10.1, ping 10.0.0.10, tracert 10.0.0.10, arp -a, nslookup intranet.corp.local, cls");
      return;
    }
    if (command === "cls") {
      $("terminalOutput").innerHTML = "";
      return;
    }
    if (command === "ipconfig") {
      if (network.ipGood) {
        terminalAppend("Ethernet adapter Ethernet:\n   IPv4 Address. . . . . . : 192.168.10.10\n   Subnet Mask . . . . . . : 255.255.255.0\n   Default Gateway . . . . : 192.168.10.1\n   DNS Servers . . . . . . : 192.168.10.53");
      } else {
        terminalAppend("Ethernet adapter Ethernet:\n   IPv4 Address. . . . . . : 169.254.23.18\n   Subnet Mask . . . . . . : 255.255.0.0\n   Default Gateway . . . . :");
      }
      return;
    }

    const topologyGood = updateTopologyState();

    if (command === "arp -a") {
      if (topologyGood && network.ipGood) {
        terminalAppend("Interface: 192.168.10.10\n  Internet Address      Physical Address      Type\n  192.168.10.1          00-50-56-aa-10-01     dynamic\n  192.168.10.53         00-50-56-aa-10-35     dynamic");
        feedback("ARP table reviewed.", "Local Layer 2 neighbors are present. Continue validating routing and DNS.", "success");
      } else {
        terminalAppend("No useful dynamic entries. Verify the physical link and IPv4 configuration first.");
        penalize(3, "ARP data is incomplete.", "Layer 2 neighbor discovery depends on a working local configuration.");
      }
      return;
    }

    if (command === "tracert 10.0.0.10") {
      if (topologyGood && network.ipGood) {
        terminalAppend("Tracing route to 10.0.0.10\n  1   <1 ms   192.168.10.1\n  2    2 ms   10.0.0.10\nTrace complete.");
        feedback("Route verified.", "Traffic leaves through R1 and reaches the server network.", "success");
      } else {
        terminalAppend("Unable to trace the route. Check local addressing and the gateway path.");
        penalize(4, "Trace failed.", !topologyGood ? "The physical topology is incomplete." : "The workstation addressing is invalid.");
      }
      return;
    }

    if (command === "nslookup intranet.corp.local") {
      if (topologyGood && network.ipGood && network.pingGood) {
        terminalAppend("Server:  dns01.corp.local\nAddress: 192.168.10.53\n\nName:    intranet.corp.local\nAddress: 10.0.0.10");
        network.dnsGood = true;
        $("dnsStatus").textContent = "Verified ✓"; $("dnsStatus").classList.add("good");
        feedback("DNS resolution confirmed.", "Physical connectivity, addressing, routing, and name resolution are all verified.", "success");
        completeLab();
      } else {
        terminalAppend("*** DNS validation cannot complete yet.");
        penalize(4, "DNS validation failed.", "First establish the topology, correct IPv4 settings, and prove IP connectivity to 10.0.0.10.");
      }
      return;
    }

    if (command.startsWith("ping ")) {
      const target = command.slice(5).trim();
      if (target === "192.168.10.1") {
        if (topologyGood && network.ipGood) {
          network.gatewayGood = true;
          terminalAppend("Reply from 192.168.10.1: bytes=32 time<1ms TTL=64\nReply from 192.168.10.1: bytes=32 time<1ms TTL=64\n\nPackets: Sent = 2, Received = 2, Lost = 0 (0% loss)");
          feedback("Gateway reachable.", "Local switching and IPv4 settings are working. Test the server next.", "success");
        } else {
          terminalAppend("Request timed out.\nRequest timed out.\n\nPackets: Sent = 2, Received = 0, Lost = 2 (100% loss)");
          penalize(5, "Ping failed.", !topologyGood ? "Check your physical topology first." : "Check PC-01's IPv4 configuration.");
        }
        return;
      }
      if (target === "10.0.0.10") {
        if (topologyGood && network.ipGood) {
          network.pingGood = true;
          terminalAppend("Reply from 10.0.0.10: bytes=32 time=2ms TTL=63\nReply from 10.0.0.10: bytes=32 time=1ms TTL=63\nReply from 10.0.0.10: bytes=32 time=2ms TTL=63\n\nPackets: Sent = 3, Received = 3, Lost = 0 (0% loss)");
          feedback("End-to-end IP connectivity confirmed.", "The server is reachable. Finish by inspecting the path and resolving intranet.corp.local.", "success");
        } else {
          terminalAppend("Destination host unreachable.\nDestination host unreachable.\n\nPackets: Sent = 2, Received = 0, Lost = 2 (100% loss)");
          penalize(5, "Server unreachable.", !topologyGood ? "The physical path is incomplete." : "The workstation IP settings are invalid.");
        }
        return;
      }
      terminalAppend("Ping request could not find host " + target + ". Check the address and try again.");
      penalize(3, "Unknown target.", "For this mission the server address is 10.0.0.10.");
      return;
    }

    terminalAppend("'" + raw.trim() + "' is not recognized by this training terminal. Type help for available commands.");
  }

  function createUser() {
    const username = $("newUsername").value.trim().toLowerCase();
    const display = $("displayName").value.trim().toLowerCase();
    const department = $("departmentSelect").value;
    if (username === "jlee" && display === "jordan lee" && department === "Accounting") {
      sys.user = true;
      $("userStatus").textContent = "Created ✓"; $("userStatus").classList.add("good");
      feedback("Account created.", "jlee now exists. Next, assign the correct department group.", "success");
    } else {
      penalize(8, "Account details do not match the standard.", "Use jlee, Jordan Lee, and place the account in the Accounting department / OU.");
    }
  }

  function addGroup() {
    if (!sys.user) {
      penalize(5, "Create the user first.", "Group membership cannot be assigned until jlee exists.");
      return;
    }
    const group = $("groupSelect").value;
    if (group === "Accounting") {
      sys.group = true;
      $("groupStatus").textContent = "Assigned ✓"; $("groupStatus").classList.add("good");
      feedback("Correct group assigned.", "Jordan inherits Accounting access without receiving unnecessary administrative privileges.", "success");
    } else if (group === "Domain Admins") {
      penalize(12, "Excessive privilege.", "A new Accounting employee should not receive Domain Admin rights. Apply least privilege.");
    } else if (group === "Everyone") {
      penalize(8, "Group is too broad.", "Use the department security group so access can be managed by role.");
    } else {
      penalize(6, "Wrong department group.", "Jordan works in Accounting.");
    }
  }

  function applyPermission() {
    if (!sys.group) {
      penalize(5, "Assign the department group first.", "Build access through the Accounting security group.");
      return;
    }
    const principal = $("principalSelect").value;
    const permission = $("permissionSelect").value;
    if (principal === "Accounting" && permission === "Modify") {
      sys.permission = true;
      $("permissionStatus").textContent = "Applied ✓"; $("permissionStatus").classList.add("good");
      feedback("Least-privilege access applied.", "Accounting can modify Finance files without receiving ownership or permission-control rights.", "success");
    } else if (permission === "Full Control") {
      penalize(12, "Permission is too powerful.", "Full Control includes changing permissions and ownership. Jordan only needs to work with the files.");
    } else if (principal === "Everyone") {
      penalize(10, "Scope is too broad.", "Grant access to the Accounting group, not every user.");
    } else if (principal === "jlee") {
      penalize(5, "This works poorly at scale.", "Use group-based permissions so future Accounting staff inherit the same access consistently.");
    } else {
      penalize(6, "Access is not correct yet.", "The Accounting group needs Modify permission.");
    }
  }

  function testAccess() {
    if (sys.user && sys.group && sys.permission) {
      sys.access = true;
      $("accessStatus").textContent = "Passed ✓"; $("accessStatus").classList.add("good");
      $("accessResult").textContent = "PASS — jlee can read, create, edit, and delete Finance files. Permission and ownership changes are blocked.";
      feedback("Access test passed.", "Jordan has the access needed for the job without excessive privilege.", "success");
      completeLab();
    } else {
      $("accessStatus").textContent = "Failed"; $("accessStatus").classList.remove("good");
      $("accessResult").textContent = "FAIL — one or more account, group, or folder permission requirements are missing.";
      penalize(5, "Access test failed.", "Review the account, group membership, and Finance folder permission.");
    }
  }

  function submitTriage() {
    const eventId = $("eventIdSelect").value;
    const targetUser = $("targetUserSelect").value;
    const source = $("sourceSelect").value;
    const attack = $("attackSelect").value;
    const response = $("responseSelect").value;
    const correctResponse = "Validate the source, protect the targeted account, and contain the source if unauthorized";

    if (eventId !== "4625") {
      penalize(6, "Wrong event type.", "The repeated records are failed Windows logons: Event ID 4625.");
      return;
    }
    if (targetUser !== "administrator") {
      penalize(6, "Wrong targeted account.", "The repeated failures are targeting the privileged administrator account.");
      return;
    }
    if (source !== "10.20.30.77") {
      penalize(8, "Wrong source selected.", "Compare which source generates repeated failed logons against the privileged account.");
      return;
    }
    $("evidenceStatus").textContent = "Pattern identified ✓"; $("evidenceStatus").classList.add("good");

    if (attack !== "Password brute-force attempt") {
      penalize(8, "Classification does not fit the evidence.", "Rapid repeated password failures against one account are characteristic of a brute-force attempt.");
      return;
    }
    if (response !== correctResponse) {
      penalize(10, "Unsafe or ineffective response.", "Preserve visibility, validate the source, protect the account, and contain unauthorized activity.");
      return;
    }

    cyber.done = true;
    $("triageStatus").textContent = "Triage complete ✓"; $("triageStatus").classList.add("good");
    feedback("Incident correctly triaged.", "You identified the source, recognized the brute-force pattern, and selected a proportionate defensive response.", "success");
    completeLab();
  }

  function checkIntegratedComplete() {
    if (integrated.network && integrated.admin && integrated.cyber) {
      feedback("Integrated incident resolved.", "Connectivity is restored, least privilege is enforced, and the credential attack is contained without destroying evidence.", "success");
      completeLab();
    }
  }

  function submitIntegratedNetwork() {
    const cause = $("integratedNetworkCause").value;
    const fix = $("integratedNetworkFix").value;
    if (cause === "Wrong default gateway" && fix === "Set PC gateway to 192.168.50.1") {
      integrated.network = true;
      $("integratedNetworkStatus").textContent = "Resolved ✓"; $("integratedNetworkStatus").classList.add("good");
      feedback("Network phase complete.", "FIN-PC01 now uses the router interface on its own subnet as the default gateway.", "success");
      checkIntegratedComplete();
    } else {
      penalize(8, "Network diagnosis is not correct.", "Compare the workstation subnet with R1's Finance interface before choosing the fix.");
    }
  }

  function submitIntegratedAdmin() {
    const group = $("integratedGroup").value;
    const permission = $("integratedPermission").value;
    if (group === "Finance" && permission === "Modify") {
      integrated.admin = true;
      $("integratedAdminStatus").textContent = "Resolved ✓"; $("integratedAdminStatus").classList.add("good");
      feedback("Access phase complete.", "Maya receives role-based Modify access without permission-control rights.", "success");
      checkIntegratedComplete();
    } else if (permission === "Full Control" || group === "Domain Admins") {
      penalize(12, "Excessive privilege.", "Use the Finance group and Modify permission rather than administrative access.");
    } else {
      penalize(7, "Access design is incomplete.", "Use the Finance group and the least permission that still allows editing.");
    }
  }

  function submitIntegratedCyber() {
    const activity = $("integratedActivity").value;
    const response = $("integratedResponse").value;
    if (activity === "Credential brute-force" && response === "Disable affected account, preserve logs, and block the source") {
      integrated.cyber = true;
      $("integratedCyberStatus").textContent = "Contained ✓"; $("integratedCyberStatus").classList.add("good");
      feedback("Security phase complete.", "The response protects the account, preserves evidence, and contains the source.", "success");
      checkIntegratedComplete();
    } else {
      penalize(10, "Security response is not defensible.", "Repeated 4625 failures against administrator are a credential attack. Preserve the logs while protecting the account and containing the source.");
    }
  }

  function completeLab() {
    if (missionFinished || !activeLab) return;
    missionFinished = true;
    const firstCompletion = !progress.completed[activeLab];
    const earned = firstCompletion ? score : 0;
    progress.completed[activeLab] = true;
    progress.xp += earned;
    saveProgress();
    updateProgressUI();

    $("completeTitle").textContent = labs[activeLab].title + " completed";
    $("completeSummary").textContent = firstCompletion
      ? (window.PrempehCloud && window.PrempehCloud.isSignedIn() ? "Your progress and XP have been saved to your cloud account." : "Your progress has been saved on this device. Sign in to sync it across devices.")
      : "You completed this lab again. XP is awarded only on the first completion.";
    $("finalScore").textContent = score;
    $("xpEarned").textContent = "+" + earned;
    $("missionComplete").classList.remove("hidden");
    setTimeout(() => $("missionComplete").scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }


  $("showHowBtn").addEventListener("click", () => $("howPanel").classList.toggle("hidden"));
  $("continueBtn").addEventListener("click", () => {
    document.querySelector(".track-tabs").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  $$(".track-tab").forEach((btn) => btn.addEventListener("click", () => setTrack(btn.dataset.track)));
  $$(".level-btn").forEach((btn) => btn.addEventListener("click", () => setDifficultyLevel(btn.dataset.level)));
  $("levelJumpBtn").addEventListener("click", () => {
    if (window.PrempehDesktopLab) {
      window.PrempehDesktopLab.launch(activeTrack, selectedProject());
    }
  });
  $$("[data-launch]").forEach((btn) => btn.addEventListener("click", () => {
    const track = btn.dataset.launch;
    if (window.PrempehDesktopLab) {
      window.PrempehDesktopLab.launch(track, selectedProject());
    }
  }));
  $$(".mode-btn").forEach((btn) => btn.addEventListener("click", () => setMode(btn.dataset.mode)));
  $$(".device").forEach((device) => device.addEventListener("click", () => handleDeviceClick(device)));

  $("hintBtn").addEventListener("click", getHint);
  $("resetLabBtn").addEventListener("click", restartLab);
  $("closeLabBtn").addEventListener("click", () => {
    $("labShell").classList.add("hidden");
    $("tracks").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("applyIpBtn").addEventListener("click", applyIp);
  $("terminalForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const raw = $("terminalInput").value;
    $("terminalInput").value = "";
    runCommand(raw);
  });

  $("createUserBtn").addEventListener("click", createUser);
  $("addGroupBtn").addEventListener("click", addGroup);
  $("applyPermissionBtn").addEventListener("click", applyPermission);
  $("testAccessBtn").addEventListener("click", testAccess);
  $("submitTriageBtn").addEventListener("click", submitTriage);

  $("replayLabBtn").addEventListener("click", () => {
    if (activeLab) launchLab(activeLab);
  });
  $("integratedNetworkBtn").addEventListener("click", submitIntegratedNetwork);
  $("integratedAdminBtn").addEventListener("click", submitIntegratedAdmin);
  $("integratedCyberBtn").addEventListener("click", submitIntegratedCyber);
  $("returnTracksBtn").addEventListener("click", () => {
    $("labShell").classList.add("hidden");
    $("tracks").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("resetProgress").addEventListener("click", () => {
    if (!window.confirm("Reset all simulator completion and XP saved in this browser?")) return;
    progress = { completed: {}, completedLevels: {}, xp: 0 };
    saveProgress();
    updateProgressUI();
    feedback("Progress reset.", "All locally saved simulator progress has been cleared.", "normal");
  });

  window.addEventListener("prempeh-cloud-progress", (event) => {
    if (!event.detail || typeof event.detail !== "object") return;
    progress = window.PrempehSecurity.progress(event.detail);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    updateProgressUI();
  });

  window.addEventListener("prempeh-desktop-complete", (event) => {
    const detail = event.detail || {};
    const track = detail.track;
    const level = Number(detail.level);
    if (!track || !level) return;
    progress.completedLevels = progress.completedLevels || {};
    const key = track + ":" + level;
    const firstCompletion = !progress.completedLevels[key];
    progress.completedLevels[key] = true;
    const trackCount = [1,2,3,4,5,6,7,8,9,10].filter((n) => progress.completedLevels[track + ":" + n]).length;
    progress.completed[track] = trackCount === 10;
    if (firstCompletion) progress.xp += Number(detail.score) || 100;
    saveProgress();
    updateProgressUI();
  });

  $$(".explain-btn").forEach((btn) => btn.addEventListener("click", () => openExplanation(btn.dataset.explain)));
  $("explainClose").addEventListener("click", closeExplanation);
  $("explainOverlay").addEventListener("click", (event) => {
    if (event.target === $("explainOverlay")) closeExplanation();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("explainOverlay").classList.contains("hidden")) closeExplanation();
  });

  updateProgressUI();
  setTrack("networking");
  setDifficultyLevel(1);
})();