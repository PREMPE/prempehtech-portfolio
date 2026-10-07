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
        "Run ping 10.0.0.10. A successful reply proves the physical path and Layer 3 configuration are working."
      ],
      hints: [
        "Start at the physical layer. A workstation normally connects to a switch before reaching a router.",
        "PC-01 belongs to 192.168.10.0/24. Its default gateway must be the router interface on that same subnet.",
        "Use 192.168.10.10 / 255.255.255.0 / 192.168.10.1, then ping the server at 10.0.0.10."
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
    }
  };

  let progress = loadProgress();
  let activeTrack = "networking";
  let activeLab = null;
  let score = 100;
  let hintIndex = 0;
  let mode = "challenge";
  let missionFinished = false;

  let network = { selected: null, links: [], ipGood: false, pingGood: false };
  let sys = { user: false, group: false, permission: false, access: false };
  let cyber = { done: false };

  function loadProgress() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        completed: stored.completed || {},
        xp: Number(stored.xp) || 0
      };
    } catch (_) {
      return { completed: {}, xp: 0 };
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function updateProgressUI() {
    const completedCount = Object.keys(progress.completed).filter((k) => progress.completed[k]).length;
    $("xpValue").textContent = progress.xp;
    $("completedValue").textContent = completedCount;
    $("progressFill").style.width = Math.min(100, (completedCount / 3) * 100) + "%";
    $("rankValue").textContent =
      completedCount === 0 ? "Foundation" :
      completedCount < 3 ? "Junior Technician" : "Junior Technician ✓";

    ["networking", "sysadmin", "cyber"].forEach((key) => {
      const badge = document.querySelector('[data-complete-badge="' + key + '"]');
      if (!badge) return;
      const done = Boolean(progress.completed[key]);
      badge.textContent = done ? "Completed ✓" : "Not completed";
      badge.classList.toggle("done", done);
    });

    $("continueBtn").textContent = completedCount ? "Continue Learning" : "Start Learning";
  }

  function setTrack(track) {
    activeTrack = track;
    $$(".track-tab").forEach((btn) => {
      const active = btn.dataset.track === track;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    $$(".activity-card").forEach((card) => card.classList.toggle("active-track", card.dataset.cardTrack === track));
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
    ["networkingLab", "sysadminLab", "cyberLab"].forEach((id) => $(id).classList.add("hidden"));
    $(key === "networking" ? "networkingLab" : key === "sysadmin" ? "sysadminLab" : "cyberLab").classList.remove("hidden");
    $("missionComplete").classList.add("hidden");
    $("labShell").classList.remove("hidden");
    feedback("Mission ready.", data.objective, "normal");
    $("labShell").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetState(key) {
    if (key === "networking") {
      network = { selected: null, links: [], ipGood: false, pingGood: false };
      $$(".device").forEach((d) => d.classList.remove("selected", "connected"));
      $("ipAddress").value = "";
      $("subnetMask").value = "";
      $("defaultGateway").value = "";
      $("terminalOutput").innerHTML = "Microsoft Windows [Version 10.0]\nType a command to test the network.\n\nC:\\Users\\student&gt;";
      $("topologyStatus").textContent = "Incomplete"; $("topologyStatus").classList.remove("good");
      $("ipStatus").textContent = "Incomplete"; $("ipStatus").classList.remove("good");
      renderConnections();
    }
    if (key === "sysadmin") {
      sys = { user: false, group: false, permission: false, access: false };
      $("newUsername").value = ""; $("displayName").value = "";
      $("groupSelect").value = ""; $("principalSelect").value = ""; $("permissionSelect").value = "";
      ["userStatus", "groupStatus", "permissionStatus"].forEach((id) => { $(id).textContent = "Incomplete"; $(id).classList.remove("good"); });
      $("accessStatus").textContent = "Not tested"; $("accessStatus").classList.remove("good");
      $("accessResult").textContent = "No access test has been run.";
    }
    if (key === "cyber") {
      cyber = { done: false };
      $("sourceSelect").value = ""; $("attackSelect").value = ""; $("responseSelect").value = "";
      $("evidenceStatus").textContent = "Awaiting analysis"; $("evidenceStatus").classList.remove("good");
      $("triageStatus").textContent = "Incomplete"; $("triageStatus").classList.remove("good");
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
    out.innerHTML += "\n\n" + text;
    out.scrollTop = out.scrollHeight;
  }

  function runCommand(raw) {
    const command = raw.trim().toLowerCase();
    if (!command) return;
    terminalAppend("C:\\Users\\student&gt;" + raw.trim());

    if (command === "help") {
      terminalAppend("Useful commands: ipconfig, ping 192.168.10.1, ping 10.0.0.10, cls");
      return;
    }
    if (command === "cls") {
      $("terminalOutput").innerHTML = "";
      return;
    }
    if (command === "ipconfig") {
      if (network.ipGood) {
        terminalAppend("Ethernet adapter Ethernet:\n   IPv4 Address. . . . . . : 192.168.10.10\n   Subnet Mask . . . . . . : 255.255.255.0\n   Default Gateway . . . . : 192.168.10.1");
      } else {
        terminalAppend("Ethernet adapter Ethernet:\n   IPv4 Address. . . . . . : 169.254.23.18\n   Subnet Mask . . . . . . : 255.255.0.0\n   Default Gateway . . . . :");
      }
      return;
    }
    if (command.startsWith("ping ")) {
      const target = command.slice(5).trim();
      const topologyGood = updateTopologyState();
      if (target === "192.168.10.1") {
        if (topologyGood && network.ipGood) {
          terminalAppend("Reply from 192.168.10.1: bytes=32 time<1ms TTL=64\nReply from 192.168.10.1: bytes=32 time<1ms TTL=64\n\nPackets: Sent = 2, Received = 2, Lost = 0 (0% loss)");
          feedback("Gateway reachable.", "Layer 1/2 connectivity and local IPv4 settings look good. Now test the server.", "success");
        } else {
          terminalAppend("Request timed out.\nRequest timed out.\n\nPackets: Sent = 2, Received = 0, Lost = 2 (100% loss)");
          penalize(5, "Ping failed.", !topologyGood ? "Check your physical topology first." : "Check PC-01's IPv4 configuration.");
        }
        return;
      }
      if (target === "10.0.0.10") {
        if (topologyGood && network.ipGood) {
          terminalAppend("Reply from 10.0.0.10: bytes=32 time=2ms TTL=63\nReply from 10.0.0.10: bytes=32 time=1ms TTL=63\nReply from 10.0.0.10: bytes=32 time=2ms TTL=63\n\nPackets: Sent = 3, Received = 3, Lost = 0 (0% loss)");
          network.pingGood = true;
          feedback("End-to-end connectivity confirmed.", "PC-01 can reach SRV-01 through the switch and router.", "success");
          completeLab();
        } else {
          terminalAppend("Destination host unreachable.\nDestination host unreachable.\n\nPackets: Sent = 2, Received = 0, Lost = 2 (100% loss)");
          penalize(5, "Server unreachable.", !topologyGood ? "The physical path is incomplete." : "The workstation IP settings are not valid yet.");
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
    if (username === "jlee" && display === "jordan lee") {
      sys.user = true;
      $("userStatus").textContent = "Created ✓"; $("userStatus").classList.add("good");
      feedback("Account created.", "jlee now exists. Next, assign the correct department group.", "success");
    } else {
      penalize(8, "Account details do not match the standard.", "Use first initial + surname and the employee's full approved name.");
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
    const source = $("sourceSelect").value;
    const attack = $("attackSelect").value;
    const response = $("responseSelect").value;
    const correctResponse = "Validate the source, protect the targeted account, and contain the source if unauthorized";

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
      ? "Your progress has been saved in this browser. You earned XP based on your final score."
      : "You completed this lab again. XP is awarded only on the first completion.";
    $("finalScore").textContent = score;
    $("xpEarned").textContent = "+" + earned;
    $("missionComplete").classList.remove("hidden");
    setTimeout(() => $("missionComplete").scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }

  function nextLab() {
    const order = ["networking", "sysadmin", "cyber"];
    const index = order.indexOf(activeLab);
    const next = order[(index + 1) % order.length];
    setTrack(next);
    launchLab(next);
  }

  $("showHowBtn").addEventListener("click", () => $("howPanel").classList.toggle("hidden"));
  $("continueBtn").addEventListener("click", () => {
    const next = ["networking", "sysadmin", "cyber"].find((key) => !progress.completed[key]) || "networking";
    setTrack(next);
    document.querySelector('[data-card-track="' + next + '"]').scrollIntoView({ behavior: "smooth", block: "center" });
  });

  $$(".track-tab").forEach((btn) => btn.addEventListener("click", () => setTrack(btn.dataset.track)));
  $$("[data-launch]").forEach((btn) => btn.addEventListener("click", () => launchLab(btn.dataset.launch)));
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

  $("nextLabBtn").addEventListener("click", nextLab);
  $("returnTracksBtn").addEventListener("click", () => {
    $("labShell").classList.add("hidden");
    $("tracks").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("resetProgress").addEventListener("click", () => {
    if (!window.confirm("Reset all simulator completion and XP saved in this browser?")) return;
    progress = { completed: {}, xp: 0 };
    saveProgress();
    updateProgressUI();
    feedback("Progress reset.", "All locally saved simulator progress has been cleared.", "normal");
  });

  updateProgressUI();
  setTrack("networking");
})();