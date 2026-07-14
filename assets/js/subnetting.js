import { state, byId, playNetSound, gainXP, safeSetStorage, saveAnalytics, pick, rand } from "./core.js";

// IP Address Conversion Helpers
export function ipToNum(ip) {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

export function numToIp(num) {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join(".");
}

export function getSubnetMask(prefix) {
  const mask = [0, 0, 0, 0];
  let bits = prefix;
  for (let i = 0; i < 4; i++) {
    const use = Math.max(0, Math.min(8, bits));
    mask[i] = use === 0 ? 0 : 256 - Math.pow(2, 8 - use);
    bits -= use;
  }
  return mask.join(".");
}

export function getSubnetDetails(ipStr, prefix) {
  const ipNum = ipToNum(ipStr);
  const maskNum = (prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0);
  const netNum = (ipNum & maskNum) >>> 0;
  const broadNum = (netNum | ~maskNum) >>> 0;
  
  return {
    ip: ipStr,
    prefix: prefix,
    mask: numToIp(maskNum),
    wildcard: numToIp(~maskNum >>> 0),
    network: numToIp(netNum),
    broadcast: numToIp(broadNum),
    firstUsable: numToIp((netNum + 1) >>> 0),
    lastUsable: numToIp((broadNum - 1) >>> 0),
    totalHosts: Math.pow(2, 32 - prefix),
    usableHosts: prefix >= 31 ? 0 : Math.pow(2, 32 - prefix) - 2
  };
}

export function generateRandomIP() {
  const octets = [];
  const type = Math.random();
  if (type < 0.3) {
    octets.push(10);
    octets.push(Math.floor(Math.random() * 256));
    octets.push(Math.floor(Math.random() * 256));
    octets.push(Math.floor(Math.random() * 256));
  } else if (type < 0.6) {
    octets.push(172);
    octets.push(16 + Math.floor(Math.random() * 16));
    octets.push(Math.floor(Math.random() * 256));
    octets.push(Math.floor(Math.random() * 256));
  } else {
    octets.push(192);
    octets.push(168);
    octets.push(Math.floor(Math.random() * 256));
    octets.push(Math.floor(Math.random() * 256));
  }
  return octets.join(".");
}

export function makeSubnetQuestion(mode) {
  const prefixes = mode === "Easy" ? [24, 25, 26, 27, 28, 29, 30] :
                   mode === "Medium" ? [20, 21, 22, 23, 24, 25, 26, 27, 28] :
                   [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  const prefix = pick(prefixes);
  const qTypes = ["mask", "wildcard", "hosts", "network", "broadcast", "first", "last"];
  const qType = pick(qTypes);
  const ip = generateRandomIP();
  const details = getSubnetDetails(ip, prefix);

  let prompt = "";
  let answer = "";
  let note = "";

  switch (qType) {
    case "mask":
      prompt = `What subnet mask corresponds to /${prefix}?`;
      answer = details.mask;
      note = `For /${prefix}, the subnet mask is ${details.mask}.`;
      break;
    case "wildcard":
      prompt = `What wildcard mask corresponds to /${prefix}?`;
      answer = details.wildcard;
      note = `Wildcard mask is calculated as 255.255.255.255 minus subnet mask (${details.mask}), which is ${details.wildcard}.`;
      break;
    case "hosts":
      prompt = `How many usable hosts are in /${prefix}?`;
      answer = String(details.usableHosts);
      note = `Usable hosts formula: 2^(32 - prefix) - 2. For /${prefix}, 2^(32 - ${prefix}) - 2 = ${details.usableHosts}.`;
      break;
    case "network":
      prompt = `What is the Network ID (Subnet ID) for IP address ${ip}/${prefix}?`;
      answer = details.network;
      note = `Perform bitwise AND of IP ${ip} and mask ${details.mask} to get Network ID: ${details.network}.`;
      break;
    case "broadcast":
      prompt = `What is the Broadcast IP address for IP address ${ip}/${prefix}?`;
      answer = details.broadcast;
      note = `Broadcast IP is the last address in the subnet block (Network ID + block size - 1): ${details.broadcast}.`;
      break;
    case "first":
      prompt = `What is the first usable IP address for IP address ${ip}/${prefix}?`;
      answer = details.firstUsable;
      note = `First usable host IP is Network ID + 1: ${details.firstUsable}.`;
      break;
    case "last":
      prompt = `What is the last usable IP address for IP address ${ip}/${prefix}?`;
      answer = details.lastUsable;
      note = `Last usable host IP is Broadcast IP - 1: ${details.lastUsable}.`;
      break;
  }

  return { prompt, answer, note, details };
}

export function getSubnetMultiplier() {
  const streak = state.subnet.streak || 0;
  if (streak >= 9) return 5;
  if (streak >= 6) return 4;
  if (streak >= 3) return 2;
  return 1;
}

export function updateSubnetLeaderboard(score) {
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem("ccna_subnet_leaderboard")) || [];
  } catch (e) {
    list = [];
  }
  const dateStr = new Date().toLocaleDateString();
  list.push({ date: dateStr, score: score, mode: "Timed" });
  list.sort((a, b) => b.score - a.score);
  list = list.slice(0, 5); // top 5
  safeSetStorage(localStorage, "ccna_subnet_leaderboard", JSON.stringify(list));
  renderSubnetLeaderboard();
}

export function renderSubnetLeaderboard() {
  const container = byId("subnetLeaderboard");
  if (!container) return;
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem("ccna_subnet_leaderboard")) || [];
  } catch (e) {}
  
  if (list.length === 0) {
    container.innerHTML = `<span style="font-style: italic;">No high scores registered yet. Complete a Timed Challenge!</span>`;
    return;
  }
  
  let html = `<ol style="margin: 0; padding-left: 20px; color: var(--text-muted);">`;
  list.forEach((item) => {
    html += `<li style="margin-bottom: 4px;"><strong>${item.score} correct</strong> - ${item.date} (${item.mode})</li>`;
  });
  html += `</ol>`;
  container.innerHTML = html;
}

export function ensureSubnetQuestion(force) {
  const mode = state.subnet.mode || "Easy";
  
  const btns = {
    Easy: byId("btnSubnetEasy"),
    Medium: byId("btnSubnetMedium"),
    Hard: byId("btnSubnetHard"),
    Timed: byId("btnSubnetTimed")
  };
  Object.keys(btns).forEach(m => {
    const btn = btns[m];
    if (btn) {
      if (m === mode) {
        btn.classList.add("primary");
        btn.classList.remove("secondary");
      } else {
        btn.classList.remove("primary");
        btn.classList.add("secondary");
      }
    }
  });

  const timerDisplay = byId("subnetTimerDisplay");
  const streakDisplay = byId("subnetStreakDisplay");
  const xpDisplay = byId("subnetXPDisplay");
  const subnetSubmit = byId("subnetSubmit");
  const subnetSkip = byId("subnetSkip");
  const subnetAnswer = byId("subnetAnswer");

  if (xpDisplay) {
    xpDisplay.textContent = `XP: ${state.analytics.xp || 0}`;
  }

  if (mode === "Timed") {
    if (timerDisplay) {
      timerDisplay.style.display = "block";
      timerDisplay.textContent = `Time Left: ${state.subnet.timeLeft || 30}s`;
    }
    if (force) {
      state.subnet.timeLeft = 30;
      state.subnet.score = 0;
      state.subnet.attempts = 0;
      state.subnet.streak = 0;
      if (subnetSubmit) subnetSubmit.disabled = false;
      if (subnetSkip) subnetSkip.disabled = false;
      if (subnetAnswer) subnetAnswer.disabled = false;
      if (timerDisplay) timerDisplay.textContent = `Time Left: 30s`;
      
      if (state.subnet.timerRef) clearInterval(state.subnet.timerRef);
      state.subnet.timerRef = setInterval(() => {
        const isSubnetPage = byId("subnet") && byId("subnet").classList.contains("active");
        if (isSubnetPage && state.subnet.mode === "Timed") {
          state.subnet.timeLeft = Math.max(0, state.subnet.timeLeft - 1);
          if (state.subnet.timeLeft <= 0) {
            state.subnet.timeLeft = 0;
            clearInterval(state.subnet.timerRef);
            state.subnet.timerRef = null;
            
            playNetSound("block");
            if (subnetSubmit) subnetSubmit.disabled = true;
            if (subnetSkip) subnetSkip.disabled = true;
            if (subnetAnswer) subnetAnswer.disabled = true;
            
            byId("subnetOut").innerHTML = `
              <strong style="color: #ff5e3a;">Challenge Ended!</strong><br/>
              Your Score: <strong>${state.subnet.score}</strong> correct out of <strong>${state.subnet.attempts}</strong> attempts.<br/>
              Streak Max Multiplier reached: <strong>x${state.subnet.multiplier || 1}</strong>
            `;
            
            updateSubnetLeaderboard(state.subnet.score);
            
            if (state.subnet.score > (state.analytics.subnetMaxStreak || 0)) {
              state.analytics.subnetMaxStreak = state.subnet.score;
              saveAnalytics();
            }
          }
          if (timerDisplay) {
            timerDisplay.textContent = `Time Left: ${state.subnet.timeLeft}s`;
          }
        } else {
          clearInterval(state.subnet.timerRef);
          state.subnet.timerRef = null;
        }
      }, 1000);
    }
  } else {
    if (state.subnet.timerRef) {
      clearInterval(state.subnet.timerRef);
      state.subnet.timerRef = null;
    }
    if (timerDisplay) {
      timerDisplay.style.display = "none";
    }
    if (subnetSubmit) subnetSubmit.disabled = false;
    if (subnetSkip) subnetSkip.disabled = false;
    if (subnetAnswer) subnetAnswer.disabled = false;
  }

  const mult = getSubnetMultiplier();
  state.subnet.multiplier = mult;
  if (streakDisplay) {
    streakDisplay.textContent = `Multiplier: x${mult} (Streak: ${state.subnet.streak})`;
  }

  if (force || !state.subnet.q) {
    state.subnet.q = makeSubnetQuestion(mode === "Timed" ? "Hard" : mode);
    byId("subnetPrompt").innerHTML = `<strong>Question:</strong> ${state.subnet.q.prompt}`;
    if (force) {
      byId("subnetOut").innerHTML = "";
      const diagram = byId("subnetRangeDiagram");
      if (diagram) {
        diagram.innerHTML = `<span style="font-style: italic;">Submit an answer to visualize host ranges, network ID, and broadcast boundaries.</span>`;
      }
    }
  }
}

export function submitSubnet() {
  const ansInput = byId("subnetAnswer");
  if (!ansInput) return;
  const ans = ansInput.value.trim();
  if (!ans) return;

  const q = state.subnet.q;
  if (!q) return;

  const isCorrect = ans.toLowerCase() === q.answer.toLowerCase();
  state.subnet.attempts = (state.subnet.attempts || 0) + 1;

  const diagram = byId("subnetRangeDiagram");

  if (isCorrect) {
    playNetSound("success");
    state.subnet.score = (state.subnet.score || 0) + 1;
    state.subnet.streak = (state.subnet.streak || 0) + 1;
    
    const mult = getSubnetMultiplier();
    const baseXP = state.subnet.mode === "Easy" ? 5 : state.subnet.mode === "Medium" ? 10 : 15;
    const gainedXP = baseXP * mult;
    
    gainXP(gainedXP);

    const submitBtn = byId("subnetSubmit");
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (submitBtn) {
      const rect = submitBtn.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
    if (window.triggerSuccessExplosion) {
      window.triggerSuccessExplosion(x, y, "#00f2fe");
    }
    
    if (state.subnet.mode === "Timed") {
      state.subnet.timeLeft = Math.min(30, state.subnet.timeLeft + 5);
      const timerDisplay = byId("subnetTimerDisplay");
      if (timerDisplay) {
        timerDisplay.textContent = `Time Left: ${state.subnet.timeLeft}s`;
      }
    }

    byId("subnetOut").innerHTML = `
      <span style="color:#10b981; font-weight:bold;">✔ Correct!</span> (+${gainedXP} XP)<br />
      Expected: <strong>${q.answer}</strong><br />
      ${q.note}
    `;

    if (diagram && q.details) {
      const d = q.details;
      diagram.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 11px;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: #00f2fe;">
              <th style="padding: 4px;">Property</th>
              <th style="padding: 4px;">IP Address Details</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="padding: 4px; color: #a7f3d0;">Network ID</td><td style="padding: 4px; font-weight:bold;">${d.network}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Usable Range</td><td style="padding: 4px;">${d.firstUsable} - ${d.lastUsable}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Broadcast IP</td><td style="padding: 4px; font-weight:bold;">${d.broadcast}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Subnet Mask</td><td style="padding: 4px;">${d.mask}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Wildcard Mask</td><td style="padding: 4px;">${d.wildcard}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Usable Hosts</td><td style="padding: 4px;">${d.usableHosts}</td></tr>
          </tbody>
        </table>
      `;
    }
  } else {
    playNetSound("block");
    state.subnet.streak = 0;
    
    byId("subnetOut").innerHTML = `
      <span style="color:#ff5e3a; font-weight:bold;">❌ Incorrect</span><br />
      Expected: <strong>${q.answer}</strong><br />
      ${q.note}
    `;

    if (diagram && q.details) {
      const d = q.details;
      diagram.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 11px;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: #00f2fe;">
              <th style="padding: 4px;">Property</th>
              <th style="padding: 4px;">IP Address Details</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="padding: 4px; color: #a7f3d0;">Network ID</td><td style="padding: 4px; font-weight:bold;">${d.network}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Usable Range</td><td style="padding: 4px;">${d.firstUsable} - ${d.lastUsable}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Broadcast IP</td><td style="padding: 4px; font-weight:bold;">${d.broadcast}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Subnet Mask</td><td style="padding: 4px;">${d.mask}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Wildcard Mask</td><td style="padding: 4px;">${d.wildcard}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Usable Hosts</td><td style="padding: 4px;">${d.usableHosts}</td></tr>
          </tbody>
        </table>
      `;
    }
  }

  ansInput.value = "";
  ensureSubnetQuestion(false);
}

// Rapid Recall Flashcards Deck and Logic
let currentFlashcardIdx = 0;
let flashcardFlipped = false;

const ccnaFlashcards = [
  {
    topic: "Routing Protocols",
    q: "What is the default Administrative Distance (AD) of OSPF?",
    a: "110",
    note: "OSPF relies on path cost (bandwidth) to determine the best path, with an AD of 110."
  },
  {
    topic: "Routing Protocols",
    q: "What is the default Administrative Distance (AD) of EIGRP?",
    a: "90",
    note: "EIGRP uses a composite metric (bandwidth and delay by default) and has an AD of 90."
  },
  {
    topic: "Routing Protocols",
    q: "What is the default Administrative Distance (AD) of RIP?",
    a: "120",
    note: "RIP uses hop count as its metric (maximum 15 hops) and has an AD of 120."
  },
  {
    topic: "IP Services",
    q: "Which port does SSH use, and what layer does it operate on?",
    a: "TCP Port 22 (Layer 4)",
    note: "SSH provides secure command-line access. Telnet uses unencrypted TCP Port 23."
  },
  {
    topic: "IP Services",
    q: "Which port does DHCP Server listen on, and which port does DHCP Client use?",
    a: "Server: UDP Port 67, Client: UDP Port 68",
    note: "DHCP processes use UDP packets to dynamically allocate network parameters to hosts."
  },
  {
    topic: "Security Fundamentals",
    q: "What range of numbers represents Standard IP Access Control Lists (ACLs)?",
    a: "1 - 99 and 1300 - 1999",
    note: "Standard ACLs filter traffic based *only* on source IP address and should be applied close to destination."
  },
  {
    topic: "Security Fundamentals",
    q: "What range of numbers represents Extended IP Access Control Lists (ACLs)?",
    a: "100 - 199 and 2000 - 2699",
    note: "Extended ACLs filter by source, destination, protocol type (TCP/UDP), and port number."
  },
  {
    topic: "Network Access",
    q: "What is the default bridge priority value for Spanning Tree Protocol (STP)?",
    a: "32768",
    note: "Bridge ID consists of Priority (default 32768) + System ID Extension (VLAN ID) + MAC Address."
  },
  {
    topic: "Network Access",
    q: "What is the destination MAC address for an ARP Request frame?",
    a: "FF:FF:FF:FF:FF:FF",
    note: "ARP Requests are broadcast frames sent to all devices on the local segment to resolve an IP to MAC."
  },
  {
    topic: "IP Connectivity",
    q: "What is the OSPFv2 link-state multicast destination IP address for all SPF routers?",
    a: "224.0.0.5",
    note: "All OSPF routers listen on 224.0.0.5. DR/BDR routers also listen on 224.0.0.6."
  },
  {
    topic: "IP Connectivity",
    q: "What is the default Administrative Distance (AD) of a Static Route?",
    a: "1",
    note: "Static routes are highly trusted and have a default AD of 1. Directly connected networks have AD of 0."
  },
  {
    topic: "IP Services",
    q: "Which port does NTP (Network Time Protocol) use?",
    a: "UDP Port 123",
    note: "NTP synchronizes clocks across networking devices for accurate log timestamps."
  },
  {
    topic: "IP Connectivity",
    q: "What IPv6 address prefix represents Link-Local addresses?",
    a: "FE80::/10",
    note: "Link-local addresses are auto-configured on every IPv6-enabled interface and are only routable locally."
  },
  {
    topic: "IP Connectivity",
    q: "What IPv6 multicast address represents the All-Nodes multicast group?",
    a: "FF02::1",
    note: "FF02::1 acts as the local broadcast equivalent for all IPv6 hosts on the link segment."
  },
  {
    topic: "Network Access",
    q: "What is the default priority value for HSRP (Hot Standby Router Protocol)?",
    a: "100",
    note: "HSRP priority default is 100. The router with the highest HSRP priority is elected as the Active router."
  }
];

export function updateFlashcardUI() {
  const card = ccnaFlashcards[currentFlashcardIdx];
  const countSpan = byId("flashcardCount");
  const topicSpan = byId("flashcardTopic");
  const questionSpan = byId("flashcardQuestion");
  const answerSpan = byId("flashcardAnswer");
  const noteSpan = byId("flashcardNote");
  const innerCard = byId("flashcardInner");
  
  if (innerCard) {
    if (flashcardFlipped) {
      innerCard.classList.add("flipped");
    } else {
      innerCard.classList.remove("flipped");
    }
  }
  
  if (countSpan) countSpan.textContent = `Card ${currentFlashcardIdx + 1} / ${ccnaFlashcards.length}`;
  if (topicSpan) topicSpan.textContent = card.topic;
  if (questionSpan) questionSpan.textContent = card.q;
  if (answerSpan) answerSpan.textContent = card.a;
  if (noteSpan) noteSpan.textContent = card.note;
}

export function setupFlashcards() {
  const innerCard = byId("flashcardInner");
  const btnPrev = byId("btnPrevFlashcard");
  const btnNext = byId("btnNextFlashcard");
  const btnFlip = byId("btnFlipFlashcard");
  
  if (innerCard) {
    innerCard.addEventListener("click", () => {
      playNetSound("click");
      flashcardFlipped = !flashcardFlipped;
      updateFlashcardUI();
    });
  }
  
  if (btnFlip) {
    btnFlip.addEventListener("click", (e) => {
      e.stopPropagation();
      playNetSound("click");
      flashcardFlipped = !flashcardFlipped;
      updateFlashcardUI();
    });
  }
  
  if (btnPrev) {
    btnPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      playNetSound("click");
      flashcardFlipped = false;
      currentFlashcardIdx = (currentFlashcardIdx - 1 + ccnaFlashcards.length) % ccnaFlashcards.length;
      updateFlashcardUI();
    });
  }
  
  if (btnNext) {
    btnNext.addEventListener("click", (e) => {
      e.stopPropagation();
      playNetSound("click");
      flashcardFlipped = false;
      currentFlashcardIdx = (currentFlashcardIdx + 1) % ccnaFlashcards.length;
      updateFlashcardUI();
    });
  }

  // Mobile Touch Swipe Gesture Support
  let touchStartX = 0;
  let touchEndX = 0;
  const container = document.querySelector(".flashcard-container");
  if (container) {
    container.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    container.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 50;
      if (touchEndX < touchStartX - swipeThreshold) {
        // Swiped Left -> Next Card
        playNetSound("click");
        flashcardFlipped = false;
        currentFlashcardIdx = (currentFlashcardIdx + 1) % ccnaFlashcards.length;
        updateFlashcardUI();
      } else if (touchEndX > touchStartX + swipeThreshold) {
        // Swiped Right -> Prev Card
        playNetSound("click");
        flashcardFlipped = false;
        currentFlashcardIdx = (currentFlashcardIdx - 1 + ccnaFlashcards.length) % ccnaFlashcards.length;
        updateFlashcardUI();
      }
    }, { passive: true });
  }
  
  updateFlashcardUI();
}

const cheatSheetMasks = [
  { cidr: 32, mask: "255.255.255.255", wildcard: "0.0.0.0", hosts: "1", size: "1" },
  { cidr: 31, mask: "255.255.255.254", wildcard: "0.0.0.1", hosts: "2", size: "2" },
  { cidr: 30, mask: "255.255.255.252", wildcard: "0.0.0.3", hosts: "2 (Usable)", size: "4" },
  { cidr: 29, mask: "255.255.255.248", wildcard: "0.0.0.7", hosts: "6 (Usable)", size: "8" },
  { cidr: 28, mask: "255.255.255.240", wildcard: "0.0.0.15", hosts: "14 (Usable)", size: "16" },
  { cidr: 27, mask: "255.255.255.224", wildcard: "0.0.0.31", hosts: "30 (Usable)", size: "32" },
  { cidr: 26, mask: "255.255.255.192", wildcard: "0.0.0.63", hosts: "62 (Usable)", size: "64" },
  { cidr: 25, mask: "255.255.255.128", wildcard: "0.0.0.127", hosts: "126 (Usable)", size: "128" },
  { cidr: 24, mask: "255.255.255.0", wildcard: "0.0.0.255", hosts: "254 (Usable)", size: "256" },
  { cidr: 23, mask: "255.255.254.0", wildcard: "0.0.1.255", hosts: "510 (Usable)", size: "512" },
  { cidr: 22, mask: "255.255.252.0", wildcard: "0.0.3.255", hosts: "1,022 (Usable)", size: "1,024" }
];

export function setupSubnetCalculator() {
  const ipInput = byId("calcIp");
  const cidrInput = byId("calcCidr");
  if (!ipInput || !cidrInput) return;

  ipInput.addEventListener("input", updateSubnetCalculator);
  cidrInput.addEventListener("input", updateSubnetCalculator);

  document.querySelectorAll(".calc-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      playNetSound("click");
      cidrInput.value = btn.dataset.mask;
      updateSubnetCalculator();
    });
  });

  const sheetBody = byId("cheatSheetBody");
  if (sheetBody) {
    sheetBody.innerHTML = cheatSheetMasks.map(m => `
      <tr class="cheat-sheet-row" data-cidr="${m.cidr}">
        <td style="padding: 6px;">/${m.cidr}</td>
        <td style="padding: 6px;">${m.mask}</td>
        <td style="padding: 6px;">${m.wildcard}</td>
        <td style="padding: 6px; color: #10b981;">${m.hosts}</td>
        <td style="padding: 6px; color: #00f2fe;">${m.size}</td>
      </tr>
    `).join("");
  }

  updateSubnetCalculator();
}

export function updateSubnetCalculator() {
  const ipInput = byId("calcIp");
  const cidrInput = byId("calcCidr");
  if (!ipInput || !cidrInput) return;

  const ipStr = ipInput.value.trim();
  const cidr = Number(cidrInput.value);

  const calcCidrVal = byId("calcCidrVal");
  if (calcCidrVal) calcCidrVal.textContent = `/${cidr}`;

  // Validate IP
  const parts = ipStr.split('.').map(p => p.trim());
  let isValid = true;
  if (parts.length !== 4) {
    isValid = false;
  } else {
    for (const p of parts) {
      const n = Number(p);
      if (p === "" || isNaN(n) || n < 0 || n > 255 || n.toString() !== p) {
        isValid = false;
        break;
      }
    }
  }

  if (!isValid) {
    ipInput.style.borderColor = "var(--color-error)";
    ipInput.style.boxShadow = "0 0 10px rgba(255, 94, 58, 0.25)";
    return;
  }

  ipInput.style.borderColor = "";
  ipInput.style.boxShadow = "";

  const ipNum = ipToNum(ipStr);
  if (ipNum === null) return;
  
  const maskNum = cidr === 32 ? 0xFFFFFFFF : (~(0xFFFFFFFF >>> cidr)) >>> 0;
  const wildcardNum = (~maskNum) >>> 0;
  const netNum = (ipNum & maskNum) >>> 0;
  const broadNum = (netNum | wildcardNum) >>> 0;

  byId("calcMask").textContent = numToIp(maskNum);
  byId("calcWildcard").textContent = numToIp(wildcardNum);
  byId("calcNetwork").textContent = numToIp(netNum);
  byId("calcBroadcast").textContent = numToIp(broadNum);

  let hosts = 0;
  let rangeStr = "N/A";
  if (cidr <= 30) {
    hosts = Math.pow(2, 32 - cidr) - 2;
    rangeStr = `${numToIp(netNum + 1)} - ${numToIp(broadNum - 1)}`;
  } else if (cidr === 31) {
    hosts = 2;
    rangeStr = `${numToIp(netNum)} - ${numToIp(broadNum)}`;
  } else {
    hosts = 1;
    rangeStr = numToIp(netNum);
  }

  byId("calcHosts").textContent = hosts.toLocaleString();
  byId("calcRange").textContent = rangeStr;

  const firstOctet = (ipNum >>> 24) & 255;
  let ipClass = "Class A";
  if (firstOctet >= 128 && firstOctet <= 191) ipClass = "Class B";
  else if (firstOctet >= 192 && firstOctet <= 223) ipClass = "Class C";
  else if (firstOctet >= 224 && firstOctet <= 239) ipClass = "Class D (Multicast)";
  else if (firstOctet >= 240) ipClass = "Class E (Experimental)";
  byId("calcClass").textContent = ipClass;

  let scope = "Public";
  if (firstOctet === 10) scope = "Private (RFC 1918)";
  else if (firstOctet === 172 && ((ipNum >>> 16) & 255) >= 16 && ((ipNum >>> 16) & 255) <= 31) scope = "Private (RFC 1918)";
  else if (firstOctet === 192 && ((ipNum >>> 16) & 255) === 168) scope = "Private (RFC 1918)";
  else if (firstOctet === 127) scope = "Loopback (Localhost)";
  else if (firstOctet === 169 && ((ipNum >>> 16) & 255) === 254) scope = "Link-Local (APIPA)";
  byId("calcScope").textContent = scope;

  // Highlight active row in the CIDR cheat sheet
  document.querySelectorAll(".cheat-sheet-row").forEach(row => {
    const rowCidr = Number(row.dataset.cidr);
    if (rowCidr === cidr) {
      row.classList.add("highlighted-row");
      row.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      row.classList.remove("highlighted-row");
    }
  });
}
