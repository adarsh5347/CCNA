import { state, byId, playNetSound, gainXP, safeSetStorage, saveAnalytics, pick, rand, safeHTML } from "./core.js?v=78";

// IP Address Conversion Helpers
export function ipToNum(ip) {
  if (typeof ip !== "string") return null;
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  let acc = 0;
  for (const part of parts) {
    if (!/^(0|[1-9]\d{0,2})$/.test(part)) return null;
    const n = Number(part);
    if (n < 0 || n > 255) return null;
    acc = ((acc << 8) + n) >>> 0;
  }
  return acc;
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


  if (ipNum === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null;
  const maskNum = (prefix === 0 ? 0 : (prefix === 32 ? 0xFFFFFFFF : (0xFFFFFFFF << (32 - prefix)))) >>> 0;
  const wildcardNum = (~maskNum) >>> 0;
  const netNum = (ipNum & maskNum) >>> 0;
  const broadNum = (netNum | wildcardNum) >>> 0;

  let firstUsable, lastUsable, usableHosts;
  if (prefix <= 30) {
    firstUsable = numToIp((netNum + 1) >>> 0);
    lastUsable = numToIp((broadNum - 1) >>> 0);
    usableHosts = prefix === 0 ? 4294967294 : Math.pow(2, 32 - prefix) - 2;
  } else if (prefix === 31) {
    firstUsable = numToIp(netNum);
    lastUsable = numToIp(broadNum);
    usableHosts = 2;
  } else {
    firstUsable = numToIp(netNum);
    lastUsable = numToIp(netNum);
    usableHosts = 1;
  }
  
  return {
    ip: ipStr,
    prefix: prefix,
    mask: numToIp(maskNum),
    wildcard: numToIp(wildcardNum),
    network: numToIp(netNum),
    broadcast: numToIp(broadNum),
    firstUsable,
    lastUsable,
    totalHosts: prefix === 0 ? 4294967296 : Math.pow(2, 32 - prefix),
    usableHosts
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

const SUBNET_QTYPE_META = {
  mask: { label: "Subnet Mask", hint: "Convert /prefix into four 8-bit octets: each full octet = 255, partial octet sums powers from 128 downward." },
  wildcard: { label: "Wildcard Mask", hint: "Invert the subnet mask: subtract each subnet mask octet from 255 (255.255.255.255 - Subnet Mask)." },
  hosts: { label: "Usable Hosts", hint: "Host bits h = 32 - prefix. Standard subnets provide (2^h) - 2 usable host addresses." },
  network: { label: "Network ID", hint: "Keep full network octets unchanged; in the critical octet, find block size = 256 - maskOctet and pick the largest multiple <= IP octet." },
  broadcast: { label: "Broadcast IP", hint: "Find Network ID first, then set all host bits to 1 (Next subnet Network ID - 1, or Network ID + block size - 1)." },
  first: { label: "First Usable IP", hint: "For standard subnets (/0–/30), add +1 to the final octet of the Network ID." },
  last: { label: "Last Usable IP", hint: "For standard subnets (/0–/30), subtract 1 from the final octet of the Broadcast IP." }
};

function getOctetBinarySplitHtml(ipStr, maskStr, prefix) {
  const ipOctets = ipStr.split(".").map(Number);
  const maskOctets = maskStr.split(".").map(Number);
  const critIdx = prefix === 32 ? 3 : Math.min(3, Math.floor(prefix / 8));
  const netBitsInCrit = prefix === 32 ? 8 : (prefix % 8 === 0 && prefix > 0 ? 0 : prefix % 8);
  const showIdx = (prefix % 8 === 0 && prefix > 0 && prefix < 32) ? critIdx - 1 : critIdx;
  const activeNetBits = (prefix % 8 === 0 && prefix > 0) ? 8 : netBitsInCrit;
  const ipBin = ipOctets[showIdx].toString(2).padStart(8, "0");
  const maskBin = maskOctets[showIdx].toString(2).padStart(8, "0");
  const netSlice = ipBin.slice(0, activeNetBits);
  const hostSlice = ipBin.slice(activeNetBits);

  return `
    <div class="subnet-binary-breakdown">
      <span class="subnet-bd-tag">Octet ${showIdx + 1} (${ipOctets[showIdx]})</span>
      <span class="subnet-bd-bits"><span class="bd-net">${netSlice}</span>${hostSlice ? `<span class="bd-sep">|</span><span class="bd-host">${hostSlice}</span>` : ""}</span>
      <span class="subnet-bd-mask">Mask Octet: ${maskOctets[showIdx]} (${maskBin})</span>
    </div>
  `;
}

function renderSubnetRangeDiagram(details, headingLabel = "Example Anatomy (192.168.10.64/26)") {
  const diagram = byId("subnetRangeDiagram");
  if (!diagram) return;
  if (!details) {
    diagram.innerHTML = `<span class="subnet-diagram-placeholder">Submit an answer to visualize network ID, usable IP bounds, block increment, and broadcast boundaries.</span>`;
    return;
  }
  const blockSize = details.prefix === 0 ? "4,294,967,296" : Math.pow(2, 32 - details.prefix).toLocaleString();
  diagram.innerHTML = `
    <div class="subnet-diagram-banner">
      <span>${safeHTML(headingLabel)}</span>
      <strong>/${details.prefix}</strong>
    </div>
    <table class="subnet-diagram-table">
      <thead>
        <tr>
          <th>Boundary Property</th>
          <th>Calculated Value</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Network ID</td><td class="val-net">${safeHTML(details.network)}</td></tr>
        <tr><td>Usable Range</td><td>${safeHTML(details.firstUsable)} – ${safeHTML(details.lastUsable)}</td></tr>
        <tr><td>Broadcast IP</td><td class="val-bcast">${safeHTML(details.broadcast)}</td></tr>
        <tr><td>Subnet Mask</td><td>${safeHTML(details.mask)}</td></tr>
        <tr><td>Wildcard Mask</td><td class="val-wild">${safeHTML(details.wildcard)}</td></tr>
        <tr><td>Usable Hosts</td><td class="val-host">${safeHTML(String(details.usableHosts))} (${safeHTML(blockSize)} total)</td></tr>
      </tbody>
    </table>
  `;
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

  return { prompt, answer, note, details, qType, ip, prefix };
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
    container.innerHTML = `<span class="subnet-leaderboard-empty">No high scores registered yet. Complete a Timed Challenge!</span>`;
    return;
  }

  container.innerHTML = `<ol class="subnet-lb-list">${list.map((item, idx) => `
    <li class="subnet-lb-row">
      <span class="subnet-lb-rank">#${idx + 1}</span>
      <strong class="subnet-lb-score">${safeHTML(String(item.score))} correct</strong>
      <span class="subnet-lb-meta">${safeHTML(item.date)} · ${safeHTML(item.mode)}</span>
    </li>
  `).join("")}</ol>`;
}

function updateSubnetTelemetry() {
  const xpDisplay = byId("subnetXPDisplay");
  if (xpDisplay) xpDisplay.textContent = `XP: ${state.analytics.xp || 0}`;

  const attemptedEl = byId("subnetStatAttempted");
  const accEl = byId("subnetStatAccuracy");
  const bestEl = byId("subnetStatBestStreak");
  const attempts = state.subnet.attempts || 0;
  const correct = state.subnet.score || 0;
  const best = Math.max(state.analytics.subnetMaxStreak || 0, state.subnet.streak || 0);

  if (attemptedEl) attemptedEl.textContent = String(attempts);
  if (accEl) accEl.textContent = attempts > 0 ? `${Math.round((correct / attempts) * 100)}%` : "--";
  if (bestEl) bestEl.textContent = String(best);

  const mult = getSubnetMultiplier();
  state.subnet.multiplier = mult;
  const streakDisplay = byId("subnetStreakDisplay");
  if (streakDisplay) {
    streakDisplay.textContent = `Multiplier: x${mult} (Streak: ${state.subnet.streak || 0})`;
  }
}

function updateArcadeHud() {
  const mode = state.subnet.mode || "Easy";
  const hud = byId("subnetArcadeHud");
  const timerDisplay = byId("subnetTimerDisplay");
  const fill = byId("subnetTimerBarFill");
  const scoreEl = byId("subnetArcadeScore");
  const multEl = byId("subnetArcadeMult");

  if (!hud) return;
  if (mode !== "Timed") {
    hud.hidden = true;
    if (timerDisplay) timerDisplay.style.display = "none";
    return;
  }

  const left = Math.max(0, state.subnet.timeLeft ?? 30);
  hud.hidden = false;
  hud.classList.toggle("is-urgent", left > 0 && left <= 10);
  if (timerDisplay) {
    timerDisplay.style.display = "inline-block";
    timerDisplay.textContent = `Time Left: ${left}s`;
  }
  if (fill) {
    fill.style.width = `${Math.max(0, Math.min(100, (left / 30) * 100))}%`;
  }
  if (scoreEl) {
    scoreEl.textContent = `${state.subnet.score || 0} correct`;
  }
  if (multEl) {
    multEl.textContent = `x${getSubnetMultiplier()}`;
  }
}

function bindSubnetTrainerControls() {
  const hintBtn = byId("btnSubnetHint");
  const hintBox = byId("subnetHintBox");
  if (hintBtn && hintBox && !hintBtn.dataset.bound) {
    hintBtn.dataset.bound = "true";
    hintBtn.addEventListener("click", () => {
      const q = state.subnet.q;
      if (!q) return;
      const willOpen = hintBox.hidden;
      if (willOpen) {
        const meta = SUBNET_QTYPE_META[q.qType] || { label: "Calculation", hint: "Align IPv4 and subnet mask bits in binary." };
        const pfx = q.prefix ?? q.details?.prefix ?? 24;
        const hostBits = 32 - pfx;
        const critOctet = pfx === 32 ? 4 : (pfx === 0 ? 1 : Math.min(4, Math.floor(pfx / 8) + 1));
        const modBits = pfx % 8;
        const blockSize = modBits === 0 ? (pfx === 32 ? 1 : 256) : Math.pow(2, 8 - modBits);
        hintBox.innerHTML = `
          <div class="subnet-hint-header">
            <strong>${safeHTML(meta.label)} Formula (/ ${pfx})</strong>
            <span>Critical Octet #${critOctet} · Block Size ${blockSize} · Host Bits ${hostBits}</span>
          </div>
          <p>${safeHTML(meta.hint)}</p>
        `;
      }
      hintBox.hidden = !willOpen;
      hintBtn.setAttribute("aria-expanded", String(willOpen));
    });
  }

  const retryBtn = byId("btnRetryTimed");
  if (retryBtn && !retryBtn.dataset.bound) {
    retryBtn.dataset.bound = "true";
    retryBtn.addEventListener("click", () => {
      playNetSound("click");
      state.subnet.mode = "Timed";
      ensureSubnetQuestion(true);
    });
  }

  const outEl = byId("subnetOut");
  if (outEl && !outEl.dataset.vlsmInspectBound) {
    outEl.dataset.vlsmInspectBound = "true";
    outEl.addEventListener("click", (e) => {
      const inspectBtn = e.target.closest("#btnOpenInVlsm");
      if (!inspectBtn) return;
      const ipIn = byId("calcIp");
      const cidrIn = byId("calcCidr");
      const cidrNumIn = byId("calcCidrNum");
      const vlsmCard = byId("vlsmCalcCard");
      if (!ipIn || !cidrIn) return;
      if (inspectBtn.dataset.ip) ipIn.value = inspectBtn.dataset.ip;
      if (inspectBtn.dataset.prefix !== undefined) {
        cidrIn.value = inspectBtn.dataset.prefix;
        if (cidrNumIn) cidrNumIn.value = inspectBtn.dataset.prefix;
      }
      playNetSound("click");
      updateSubnetCalculator();
      if (vlsmCard) vlsmCard.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  document.querySelectorAll(".subnet-jump-pill[data-subnet-target]").forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => {
      document.querySelectorAll(".subnet-jump-pill").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const target = byId(btn.dataset.subnetTarget);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderQuestionPrompt(q, mode) {
  const promptEl = byId("subnetPrompt");
  if (!promptEl || !q) return;
  const meta = SUBNET_QTYPE_META[q.qType] || { label: "Subnetting Drill" };
  promptEl.innerHTML = `
    <div class="subnet-prompt-meta">
      <span class="subnet-prompt-badge">${safeHTML(mode)} Mode</span>
      <span class="subnet-prompt-type">${safeHTML(meta.label)}</span>
      ${q.prefix ? `<span class="subnet-prompt-cidr">/${q.prefix}</span>` : ""}
    </div>
    <div class="subnet-prompt-text"><strong>Task:</strong> ${safeHTML(q.prompt)}</div>
  `;
}

export function ensureSubnetQuestion(force) {
  bindSubnetTrainerControls();
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
      const isSelected = m === mode;
      btn.classList.toggle("primary", isSelected);
      btn.classList.toggle("secondary", !isSelected);
      btn.setAttribute("aria-selected", String(isSelected));
    }
  });

  const subnetSubmit = byId("subnetSubmit");
  const subnetSkip = byId("subnetSkip");
  const subnetAnswer = byId("subnetAnswer");
  const timedSummary = byId("subnetTimedSummary");

  if (mode === "Timed") {
    if (force) {
      state.subnet.timeLeft = 30;
      state.subnet.score = 0;
      state.subnet.attempts = 0;
      state.subnet.streak = 0;
      if (timedSummary) timedSummary.hidden = true;
      if (subnetSubmit) subnetSubmit.disabled = false;
      if (subnetSkip) subnetSkip.disabled = false;
      if (subnetAnswer) subnetAnswer.disabled = false;

      if (state.subnet.timerRef) clearInterval(state.subnet.timerRef);
      state.subnet.timerRef = setInterval(() => {
        const isSubnetPage = byId("subnet") && byId("subnet").classList.contains("active");
        if (isSubnetPage && state.subnet.mode === "Timed") {
          state.subnet.timeLeft = Math.max(0, state.subnet.timeLeft - 1);
          updateArcadeHud();
          if (state.subnet.timeLeft <= 0) {
            state.subnet.timeLeft = 0;
            clearInterval(state.subnet.timerRef);
            state.subnet.timerRef = null;

            playNetSound("block");
            if (subnetSubmit) subnetSubmit.disabled = true;
            if (subnetSkip) subnetSkip.disabled = true;
            if (subnetAnswer) subnetAnswer.disabled = true;

            if (timedSummary) {
              const finalScoreEl = byId("subnetTimedFinalScore");
              const noteEl = byId("subnetTimedSummaryNote");
              if (finalScoreEl) finalScoreEl.textContent = `${state.subnet.score} correct (${state.subnet.attempts} attempted)`;
              if (noteEl) noteEl.textContent = `Max streak multiplier reached: x${state.subnet.multiplier || 1}. Recorded in local leaderboard.`;
              timedSummary.hidden = false;
            }

            byId("subnetOut").innerHTML = `
              <div class="subnet-fb-head is-timeout">
                <strong>Challenge Ended!</strong>
                <span>${state.subnet.score} / ${state.subnet.attempts} correct</span>
              </div>
              <p class="subnet-fb-note">Max multiplier reached: <strong>x${state.subnet.multiplier || 1}</strong>. Start another 30-second sprint or inspect calculations below.</p>
            `;

            updateSubnetLeaderboard(state.subnet.score);

            if (state.subnet.score > (state.analytics.subnetMaxStreak || 0)) {
              state.analytics.subnetMaxStreak = state.subnet.score;
              saveAnalytics();
            }
            updateSubnetTelemetry();
          }
        } else {
          clearInterval(state.subnet.timerRef);
          state.subnet.timerRef = null;
        }
      }, 1000);
    }
    updateArcadeHud();
  } else {
    if (state.subnet.timerRef) {
      clearInterval(state.subnet.timerRef);
      state.subnet.timerRef = null;
    }
    if (timedSummary) timedSummary.hidden = true;
    updateArcadeHud();
    if (subnetSubmit) subnetSubmit.disabled = false;
    if (subnetSkip) subnetSkip.disabled = false;
    if (subnetAnswer) subnetAnswer.disabled = false;
  }

  updateSubnetTelemetry();

  if (force || !state.subnet.q) {
    state.subnet.q = makeSubnetQuestion(mode === "Timed" ? "Hard" : mode);
    renderQuestionPrompt(state.subnet.q, mode);
    state.subnet.answered = false;
    if (subnetSubmit) subnetSubmit.textContent = "Submit Answer";
    if (subnetAnswer) {
      subnetAnswer.disabled = false;
      subnetAnswer.value = "";
    }
    const hintBox = byId("subnetHintBox");
    const hintBtn = byId("btnSubnetHint");
    if (hintBox) hintBox.hidden = true;
    if (hintBtn) hintBtn.setAttribute("aria-expanded", "false");

    const outEl = byId("subnetOut");
    if (outEl) {
      outEl.innerHTML = `<span class="subnet-out-placeholder">Enter your calculation above or open <strong>Formula Hint</strong> for the bitwise method.</span>`;
    }
    renderSubnetRangeDiagram(null);
  }
}

export function submitSubnet() {
  const ansInput = byId("subnetAnswer");
  if (!ansInput) return;
  const submitBtn = byId("subnetSubmit");

  // If already answered, this click acts as "Next Question"
  if (state.subnet.answered) {
    state.subnet.q = null;
    state.subnet.answered = false;
    if (submitBtn) submitBtn.textContent = "Submit Answer";
    ansInput.disabled = false;
    ansInput.value = "";
    ensureSubnetQuestion(false);
    ansInput.focus();
    return;
  }

  const ans = ansInput.value.trim();
  if (!ans) return;

  const q = state.subnet.q;
  if (!q) return;

  const isCorrect = ans.toLowerCase() === q.answer.toLowerCase();
  state.subnet.attempts = (state.subnet.attempts || 0) + 1;
  state.subnet.answered = true;
  if (submitBtn) submitBtn.textContent = "Next Question";
  ansInput.disabled = true;

  let gainedXP = 0;

  if (isCorrect) {
    playNetSound("success");
    state.subnet.score = (state.subnet.score || 0) + 1;
    state.subnet.streak = (state.subnet.streak || 0) + 1;

    const mult = getSubnetMultiplier();
    const baseXP = state.subnet.mode === "Easy" ? 5 : state.subnet.mode === "Medium" ? 10 : 15;
    gainedXP = baseXP * mult;

    gainXP(gainedXP);

    if (window.triggerSuccessExplosion) {
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      if (submitBtn) {
        const rect = submitBtn.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
      window.triggerSuccessExplosion(x, y, "#0ea5e9");
    }

    if (state.subnet.mode === "Timed") {
      state.subnet.timeLeft = Math.min(30, state.subnet.timeLeft + 5);
    }
  } else {
    playNetSound("block");
    state.subnet.streak = 0;
  }

  const inspectIp = q.ip || q.details?.ip || "192.168.1.50";
  const inspectPrefix = q.prefix ?? q.details?.prefix ?? 24;
  const binaryHtml = q.details ? getOctetBinarySplitHtml(inspectIp, q.details.mask, inspectPrefix) : "";

  byId("subnetOut").innerHTML = `
    <div class="subnet-fb-head ${isCorrect ? "is-correct" : "is-incorrect"}">
      <strong>${isCorrect ? "Correct!" : "Incorrect."}</strong>
      <span>${isCorrect ? `+${gainedXP} XP` : `0 XP`}</span>
    </div>
    <div class="subnet-fb-compare">
      <div><small>Your Answer</small><code>${safeHTML(ans)}</code></div>
      <div><small>Expected</small><code class="is-expected">${safeHTML(q.answer)}</code></div>
    </div>
    <p class="subnet-fb-note">${safeHTML(q.note)}</p>
    ${binaryHtml}
    <div class="subnet-fb-actions">
      <button type="button" id="btnOpenInVlsm" class="secondary subnet-inspect-btn" data-ip="${safeHTML(inspectIp)}" data-prefix="${inspectPrefix}">Inspect in VLSM Calculator &rarr;</button>
    </div>
  `;

  if (q.details) {
    renderSubnetRangeDiagram(q.details, `${inspectIp}/${inspectPrefix}`);
  }

  ensureSubnetQuestion(false);
}

// Rapid Recall Flashcards Deck and Logic
let currentFlashcardIdx = 0;
let flashcardFlipped = false;

const ccnaFlashcards = [
  {
    topic: "Routing Protocols (Vol 1 Ch 16)",
    q: "What are the default Administrative Distances (AD) for Connected, Static, EIGRP, OSPF, and RIP?",
    a: "Connected: 0 | Static: 1 | EIGRP: 90 | OSPF: 110 | RIP: 120",
    note: "Lower AD wins when a router learns the exact same prefix/mask from multiple routing sources."
  },
  {
    topic: "OSPFv2 (Vol 1 Ch 19-21)",
    q: "What are the default OSPF Hello and Dead timers on Broadcast vs. Non-Broadcast/Multipoint networks?",
    a: "Broadcast / Point-to-Point: 10s Hello / 40s Dead | NBMA / Point-to-Multipoint: 30s Hello / 120s Dead",
    note: "Hello and Dead timers must match between OSPF neighbors or adjacency fails to form."
  },
  {
    topic: "OSPFv2 (Vol 1 Ch 19)",
    q: "What are the 7 OSPF neighbor states in order, and which two states are stable?",
    a: "Down → Attempt/Init → 2-Way → ExStart → Exchange → Loading → Full",
    note: "2-Way (DROther-to-DROther on broadcast links) and Full (with DR/BDR or point-to-point) are normal stable states."
  },
  {
    topic: "OSPFv2 (Vol 1 Ch 19)",
    q: "What are the OSPF multicast IPv4 addresses for AllSPFouters and AllDRouters?",
    a: "AllSPFouters: 224.0.0.5 | AllDRouters: 224.0.0.6",
    note: "DROthers send LSUs to 224.0.0.6 (DR/BDR), and the DR floods LSUs to 224.0.0.5 (all OSPF routers)."
  },
  {
    topic: "Spanning Tree Protocol (Vol 1 Ch 9)",
    q: "What are the IEEE 802.1D / RSTP default port costs for 10 Mbps, 100 Mbps, 1 Gbps, and 10 Gbps?",
    a: "10M: 100 | 100M: 19 | 1G: 4 | 10G: 2",
    note: "Root Port is elected based on lowest cumulative Root Path Cost, then lowest sender Bridge ID, then lowest sender Port ID."
  },
  {
    topic: "RSTP 802.1w (Vol 1 Ch 10)",
    q: "How do RSTP (802.1w) port states compare to classic 802.1D STP states?",
    a: "RSTP uses 3 states: Discarding (replaces Disabled/Blocking/Listening), Learning, and Forwarding.",
    note: "RSTP adds Alternate (backup to Root Port) and Backup (backup to Designated Port on shared media) port roles."
  },
  {
    topic: "EtherChannel (Vol 1 Ch 10)",
    q: "Which EtherChannel channel-group modes form an LACP (802.3ad) vs. PAgP bundle?",
    a: "LACP: active/active or active/passive | PAgP: desirable/desirable or desirable/auto | Static: on/on",
    note: "Both passive/passive (LACP) and auto/auto (PAgP) fail to form an EtherChannel because neither side initiates negotiation."
  },
  {
    topic: "VLANs & Trunking (Vol 1 Ch 8)",
    q: "Which DTP (Dynamic Trunking Protocol) switchport modes successfully negotiate an 802.1Q trunk?",
    a: "dynamic desirable + dynamic desirable | dynamic desirable + dynamic auto | dynamic desirable + trunk",
    note: "dynamic auto + dynamic auto results in an access port! Always disable DTP on production trunks with 'switchport nonegotiate'."
  },
  {
    topic: "Ethernet & Cabling (Vol 1 Ch 2)",
    q: "Which UTP wire pairs do 10BASE-T/100BASE-TX use vs. 1000BASE-T, and which pins transmit?",
    a: "10/100M uses 2 pairs (pins 1,2 & 3,6). 1000BASE-T uses all 4 pairs bidirectionally.",
    note: "NICs/Routers/APs transmit on pins 1&2 and receive on 3&6; Switches/Hubs transmit on 3&6 and receive on 1&2."
  },
  {
    topic: "IPv6 Addressing (Vol 1 Ch 22-23)",
    q: "What are the IPv6 address prefixes for Global Unicast, Unique Local, Link-Local, and Multicast?",
    a: "Global Unicast: 2000::/3 | Unique Local: FC00::/7 (FD00::/8) | Link-Local: FE80::/10 | Multicast: FF00::/8",
    note: "IPv6 has no broadcast addresses; it uses Link-Local (FE80::/10) for next-hop routing and NDP."
  },
  {
    topic: "IPv6 Neighbor Discovery (Vol 1 Ch 24)",
    q: "What are the 5 ICMPv6 Neighbor Discovery Protocol (NDP) message types and key multicast groups?",
    a: "RS (133), RA (134), NS (135), NA (136), Redirect (137) | All-Nodes: FF02::1 | All-Routers: FF02::2 | Solicited-Node: FF02::1:FFxx:xxxx",
    note: "SLAAC uses RS/RA to learn the /64 prefix and default gateway; DAD and MAC resolution use NS/NA sent to the Solicited-Node multicast."
  },
  {
    topic: "Wireless LANs (Vol 1 Ch 26-28)",
    q: "Which CAPWAP UDP ports are used between Lightweight APs (LAPs) and a Cisco WLC?",
    a: "UDP 5246 (CAPWAP Control - encrypted with DTLS) and UDP 5247 (CAPWAP Data)",
    note: "In FlexConnect mode, LAPs can switch traffic locally at a branch site even if the WAN link to the WLC fails."
  },
  {
    topic: "Wireless Security (Vol 1 Ch 28)",
    q: "What encryption/integrity protocols correspond to WPA, WPA2, and WPA3?",
    a: "WPA: TKIP/RC4 | WPA2: AES-CCMP | WPA3: AES-GCMP/CCMP + SAE (Simultaneous Authentication of Equals) + Mandatory PMF (802.11w)",
    note: "WPA3 replaces the vulnerable 4-way PSK handshake with SAE (Dragonfly) for forward secrecy and offline dictionary protection."
  },
  {
    topic: "TCP & UDP Ports (Vol 2 Ch 1)",
    q: "What are the well-known ports for FTP, SSH, Telnet, SMTP, DNS, DHCP, TFTP, HTTP, NTP, SNMP, and HTTPS?",
    a: "FTP: TCP 20/21 | SSH: TCP 22 | Telnet: TCP 23 | SMTP: TCP 25 | DNS: UDP/TCP 53 | DHCP: UDP 67/68 | TFTP: UDP 69 | HTTP: TCP 80 | NTP: UDP 123 | SNMP: UDP 161/162 | HTTPS: TCP 443",
    note: "DNS uses UDP 53 for standard queries and TCP 53 for zone transfers or responses > 512 bytes."
  },
  {
    topic: "IPv4 ACLs (Vol 2 Ch 2-3)",
    q: "What are the numbered ranges and placement rules for Standard vs. Extended IPv4 ACLs?",
    a: "Standard: 1–99, 1300–1999 (place near destination) | Extended: 100–199, 2000–2699 (place near source)",
    note: "Standard ACLs match ONLY source IPv4 address; placing them near the source could unintentionally block legitimate traffic to other subnets."
  },
  {
    topic: "Port Security (Vol 2 Ch 6)",
    q: "How do the three Switch Port Security violation modes (Protect, Restrict, Shutdown) differ?",
    a: "Protect: drops offending frames silently | Restrict: drops frames + increments counter + sends Syslog/SNMP | Shutdown (default): err-disables port + sends Syslog/SNMP",
    note: "Recover an err-disabled port using 'shutdown' followed by 'no shutdown' (or configure errdisable recovery)."
  },
  {
    topic: "DHCP Snooping & DAI (Vol 2 Ch 8)",
    q: "Which ports should be Trusted vs. Untrusted for DHCP Snooping and Dynamic ARP Inspection (DAI)?",
    a: "Trusted: uplinks/trunks toward legitimate DHCP servers and routers | Untrusted (default): all end-host access ports",
    note: "DHCP Snooping drops DHCPOFFER/DHCPACK on untrusted ports and builds the Binding Database used by DAI to validate ARP packets."
  },
  {
    topic: "Syslog (Vol 2 Ch 9)",
    q: "What are the 8 Syslog severity levels (0 through 7) in order?",
    a: "0: Emergencies | 1: Alerts | 2: Critical | 3: Errors | 4: Warnings | 5: Notifications | 6: Informational | 7: Debugging",
    note: "Memory mnemonic: 'Every Awesome Cisco Engineer Will Need Icecream Daily' (0 to 7). 'logging trap warnings' logs levels 0–4."
  },
  {
    topic: "NAT (Vol 2 Ch 10)",
    q: "Define Inside Local, Inside Global, Outside Local, and Outside Global NAT addresses.",
    a: "Inside Local: private host IP | Inside Global: public NAT IP of inside host | Outside Global: public IP of remote server | Outside Local: how inside host sees remote server",
    note: "PAT (NAT Overload) appends the keyword 'overload' and uses TCP/UDP source port numbers to multiplex thousands of inside hosts onto one Inside Global IP."
  },
  {
    topic: "QoS (Vol 2 Ch 11)",
    q: "What are the key DSCP Per-Hop Behaviors (EF, AF, CS) and their recommended traffic types?",
    a: "EF (DSCP 46 / binary 101110): Voice payload (LLQ priority queue) | AF41 (DSCP 34): Interactive Video | CS3 (DSCP 24): Voice signaling | Default (DSCP 0): Best Effort",
    note: "LLQ (Low Latency Queuing) provides strict priority scheduling with policing so voice never starves other queues during congestion."
  },
  {
    topic: "FHRP: HSRP, VRRP, GLBP (Vol 2 Ch 12)",
    q: "What are the virtual MAC address formats for HSRPv1, HSRPv2, VRRP, and GLBP?",
    a: "HSRPv1: 0000.0c07.acXX | HSRPv2: 0000.0c9f.fXXX | VRRP: 0000.5e00.01XX | GLBP: 0007.b400.XXYY",
    note: "HSRP default priority is 100 (Hello 3s / Hold 10s, multicast 224.0.0.2 v1 or 224.0.0.102 v2). Preemption is disabled by default in HSRP."
  },
  {
    topic: "AAA Security (Vol 2 Ch 4-5)",
    q: "How do TACACS+ and RADIUS compare in protocol, encryption, and AAA separation?",
    a: "TACACS+: Cisco-oriented, TCP 49, encrypts entire payload, separates Auth/Authz/Acct (ideal for device admin) | RADIUS: IETF standard, UDP 1812/1813 (or 1645/1646), encrypts password only, combines Auth+Authz",
    note: "Use TACACS+ for router/switch CLI command authorization; use RADIUS for 802.1X network access authentication."
  },
  {
    topic: "SDN & Cisco SDA (Vol 2 Ch 16-17)",
    q: "Which protocols operate in the Control Plane, Data Plane, and Policy Plane of Cisco SD-Access (SDA)?",
    a: "Control Plane: LISP (Location/ID Separation) | Data Plane: VXLAN (UDP 4789 fabric overlay) | Policy Plane: Cisco TrustSec SGTs (Scalable Group Tags)",
    note: "Northbound APIs (REST/JSON) connect applications to the controller; Southbound APIs (NETCONF, RESTCONF, OpenFlow, SSH/SNMP) connect the controller to network devices."
  },
  {
    topic: "Automation & Config Mgmt (Vol 2 Ch 18-19)",
    q: "Compare Ansible, Puppet, and Chef in architecture (Agent vs. Agentless), push/pull model, and language.",
    a: "Ansible: Agentless (SSH/NETCONF), Push model, YAML Playbooks | Puppet: Agent-based, Pull model, Puppet DSL Manifests | Chef: Agent-based, Pull model, Ruby Recipes/Cookbooks",
    note: "Remember: Ansible is the ONLY agentless push-based tool of the three on the CCNA blueprint."
  }
];

function getFlashcardDomain(topic) {
  if (/Routing|OSPF|FHRP/i.test(topic)) return "Routing & OSPF";
  if (/Spanning|RSTP|EtherChannel|VLAN|Ethernet/i.test(topic)) return "Switching & VLANs";
  if (/ACL|Port Security|DHCP|AAA|Wireless/i.test(topic)) return "Security & Wireless";
  return "IPv4/IPv6 & Services";
}

let subnetFlashCategory = "All";
let subnetFlashShuffled = false;
let subnetFlashOrder = ccnaFlashcards.map((_, i) => i);
let subnetFlashPos = 0;
let subnetFlashFlipped = false;

function rebuildSubnetFlashOrder() {
  const matching = ccnaFlashcards
    .map((card, i) => ({ card, i }))
    .filter(entry => subnetFlashCategory === "All" || getFlashcardDomain(entry.card.topic) === subnetFlashCategory)
    .map(entry => entry.i);
  if (subnetFlashShuffled && matching.length > 1) {
    for (let i = matching.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = matching[i];
      matching[i] = matching[j];
      matching[j] = tmp;
    }
  }
  subnetFlashOrder = matching;
  subnetFlashPos = 0;
  subnetFlashFlipped = false;
}

function updateSubnetFlashcardUI() {
  const total = subnetFlashOrder.length;
  const idx = subnetFlashOrder[subnetFlashPos] ?? 0;
  const card = ccnaFlashcards[idx];
  const inner = byId("subnetFlashInner");
  const countEl = byId("subnetFlashCount");
  const fillEl = byId("subnetFlashProgressFill");
  const topicEl = byId("subnetFlashTopic");
  const qEl = byId("subnetFlashQuestion");
  const aEl = byId("subnetFlashAnswer");
  const noteEl = byId("subnetFlashNote");

  if (inner) inner.classList.toggle("flipped", subnetFlashFlipped);
  if (countEl) countEl.textContent = total ? `Card ${subnetFlashPos + 1} / ${total}` : "Card 0 / 0";
  if (fillEl) fillEl.style.width = total ? `${((subnetFlashPos + 1) / total) * 100}%` : "0%";
  if (card) {
    if (topicEl) topicEl.textContent = card.topic;
    if (qEl) qEl.textContent = card.q;
    if (aEl) aEl.textContent = card.a;
    if (noteEl) noteEl.textContent = card.note;
  }

  document.querySelectorAll("#subnetRecallFilters .subnet-filter-chip").forEach(btn => {
    const active = btn.dataset.category === subnetFlashCategory;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });

  const shuffleBtn = byId("btnSubnetShuffleFlash");
  if (shuffleBtn) {
    shuffleBtn.textContent = subnetFlashShuffled ? "Ordered Deck" : "Shuffle Deck";
    shuffleBtn.classList.toggle("is-active", subnetFlashShuffled);
  }
}

export function updateFlashcardUI() {
  const card = ccnaFlashcards[currentFlashcardIdx];
  const countSpan = byId("flashcardCount");
  const topicSpan = byId("flashcardTopic");
  const questionSpan = byId("flashcardQuestion");
  const answerSpan = byId("flashcardAnswer");
  const noteSpan = byId("flashcardNote");
  const innerCard = byId("flashcardInner");

  if (innerCard) {
    innerCard.classList.toggle("flipped", flashcardFlipped);
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

  if (innerCard && !innerCard.dataset.bound) {
    innerCard.dataset.bound = "true";
    innerCard.addEventListener("click", () => {
      playNetSound("click");
      flashcardFlipped = !flashcardFlipped;
      updateFlashcardUI();
    });
  }

  if (btnFlip && !btnFlip.dataset.bound) {
    btnFlip.dataset.bound = "true";
    btnFlip.addEventListener("click", (e) => {
      e.stopPropagation();
      playNetSound("click");
      flashcardFlipped = !flashcardFlipped;
      updateFlashcardUI();
    });
  }

  if (btnPrev && !btnPrev.dataset.bound) {
    btnPrev.dataset.bound = "true";
    btnPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      playNetSound("click");
      flashcardFlipped = false;
      currentFlashcardIdx = (currentFlashcardIdx - 1 + ccnaFlashcards.length) % ccnaFlashcards.length;
      updateFlashcardUI();
    });
  }

  if (btnNext && !btnNext.dataset.bound) {
    btnNext.dataset.bound = "true";
    btnNext.addEventListener("click", (e) => {
      e.stopPropagation();
      playNetSound("click");
      flashcardFlipped = false;
      currentFlashcardIdx = (currentFlashcardIdx + 1) % ccnaFlashcards.length;
      updateFlashcardUI();
    });
  }

  // Mobile Touch Swipe Gesture Support for Home Flashcard Box
  let touchStartX = 0;
  let touchEndX = 0;
  const homeContainer = document.querySelector("#flashcardBox .flashcard-container");
  if (homeContainer && !homeContainer.dataset.swipeBound) {
    homeContainer.dataset.swipeBound = "true";
    homeContainer.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    homeContainer.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 50;
      if (touchEndX < touchStartX - swipeThreshold) {
        playNetSound("click");
        flashcardFlipped = false;
        currentFlashcardIdx = (currentFlashcardIdx + 1) % ccnaFlashcards.length;
        updateFlashcardUI();
      } else if (touchEndX > touchStartX + swipeThreshold) {
        playNetSound("click");
        flashcardFlipped = false;
        currentFlashcardIdx = (currentFlashcardIdx - 1 + ccnaFlashcards.length) % ccnaFlashcards.length;
        updateFlashcardUI();
      }
    }, { passive: true });
  }

  // Integrated #subnet Rapid Recall Deck
  const filterGroup = byId("subnetRecallFilters");
  if (filterGroup && !filterGroup.dataset.built) {
    filterGroup.dataset.built = "true";
    const cats = ["All", "Routing & OSPF", "Switching & VLANs", "IPv4/IPv6 & Services", "Security & Wireless"];
    filterGroup.innerHTML = cats.map(cat => {
      const count = cat === "All"
        ? ccnaFlashcards.length
        : ccnaFlashcards.filter(c => getFlashcardDomain(c.topic) === cat).length;
      return `<button type="button" class="subnet-filter-chip${cat === "All" ? " is-active" : ""}" data-category="${safeHTML(cat)}" aria-pressed="${cat === "All"}">${safeHTML(cat)} <span>(${count})</span></button>`;
    }).join("");

    filterGroup.addEventListener("click", (e) => {
      const chip = e.target.closest(".subnet-filter-chip");
      if (!chip) return;
      playNetSound("click");
      subnetFlashCategory = chip.dataset.category || "All";
      rebuildSubnetFlashOrder();
      updateSubnetFlashcardUI();
    });
  }

  const subInner = byId("subnetFlashInner");
  const subPrev = byId("btnSubnetPrevFlash");
  const subNext = byId("btnSubnetNextFlash");
  const subFlip = byId("btnSubnetFlipFlash");
  const subShuffle = byId("btnSubnetShuffleFlash");
  const subContainer = byId("subnetFlashContainer");

  const flipSub = () => {
    playNetSound("click");
    subnetFlashFlipped = !subnetFlashFlipped;
    updateSubnetFlashcardUI();
  };
  const stepSub = (delta) => {
    if (!subnetFlashOrder.length) return;
    playNetSound("click");
    subnetFlashFlipped = false;
    subnetFlashPos = (subnetFlashPos + delta + subnetFlashOrder.length) % subnetFlashOrder.length;
    updateSubnetFlashcardUI();
  };

  if (subInner && !subInner.dataset.bound) {
    subInner.dataset.bound = "true";
    subInner.addEventListener("click", flipSub);
  }
  if (subFlip && !subFlip.dataset.bound) {
    subFlip.dataset.bound = "true";
    subFlip.addEventListener("click", (e) => { e.stopPropagation(); flipSub(); });
  }
  if (subPrev && !subPrev.dataset.bound) {
    subPrev.dataset.bound = "true";
    subPrev.addEventListener("click", (e) => { e.stopPropagation(); stepSub(-1); });
  }
  if (subNext && !subNext.dataset.bound) {
    subNext.dataset.bound = "true";
    subNext.addEventListener("click", (e) => { e.stopPropagation(); stepSub(1); });
  }
  if (subShuffle && !subShuffle.dataset.bound) {
    subShuffle.dataset.bound = "true";
    subShuffle.addEventListener("click", () => {
      playNetSound("click");
      subnetFlashShuffled = !subnetFlashShuffled;
      rebuildSubnetFlashOrder();
      updateSubnetFlashcardUI();
    });
  }
  if (subContainer && !subContainer.dataset.swipeBound) {
    subContainer.dataset.swipeBound = "true";
    let subStartX = 0;
    subContainer.addEventListener("touchstart", (e) => {
      subStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    subContainer.addEventListener("touchend", (e) => {
      const endX = e.changedTouches[0].screenX;
      if (endX < subStartX - 50) stepSub(1);
      else if (endX > subStartX + 50) stepSub(-1);
    }, { passive: true });
  }

  updateFlashcardUI();
  updateSubnetFlashcardUI();
}

const cheatSheetMasks = [
  { cidr: 32, mask: "255.255.255.255", wildcard: "0.0.0.0", hosts: "1 (Host Route)", size: "1" },
  { cidr: 31, mask: "255.255.255.254", wildcard: "0.0.0.1", hosts: "2 (RFC 3021 P2P)", size: "2" },
  { cidr: 30, mask: "255.255.255.252", wildcard: "0.0.0.3", hosts: "2 (Usable)", size: "4" },
  { cidr: 29, mask: "255.255.255.248", wildcard: "0.0.0.7", hosts: "6 (Usable)", size: "8" },
  { cidr: 28, mask: "255.255.255.240", wildcard: "0.0.0.15", hosts: "14 (Usable)", size: "16" },
  { cidr: 27, mask: "255.255.255.224", wildcard: "0.0.0.31", hosts: "30 (Usable)", size: "32" },
  { cidr: 26, mask: "255.255.255.192", wildcard: "0.0.0.63", hosts: "62 (Usable)", size: "64" },
  { cidr: 25, mask: "255.255.255.128", wildcard: "0.0.0.127", hosts: "126 (Usable)", size: "128" },
  { cidr: 24, mask: "255.255.255.0", wildcard: "0.0.0.255", hosts: "254 (Usable)", size: "256" },
  { cidr: 23, mask: "255.255.254.0", wildcard: "0.0.1.255", hosts: "510 (Usable)", size: "512" },
  { cidr: 22, mask: "255.255.252.0", wildcard: "0.0.3.255", hosts: "1,022 (Usable)", size: "1,024" },
  { cidr: 21, mask: "255.255.248.0", wildcard: "0.0.7.255", hosts: "2,046 (Usable)", size: "2,048" },
  { cidr: 20, mask: "255.255.240.0", wildcard: "0.0.15.255", hosts: "4,094 (Usable)", size: "4,096" },
  { cidr: 19, mask: "255.255.224.0", wildcard: "0.0.31.255", hosts: "8,190 (Usable)", size: "8,192" },
  { cidr: 18, mask: "255.255.192.0", wildcard: "0.0.63.255", hosts: "16,382 (Usable)", size: "16,384" },
  { cidr: 17, mask: "255.255.128.0", wildcard: "0.0.127.255", hosts: "32,766 (Usable)", size: "32,768" },
  { cidr: 16, mask: "255.255.0.0", wildcard: "0.0.255.255", hosts: "65,534 (Usable)", size: "65,536" }
];

function renderCheatSheetRows(query = "", activeCidr = null) {
  const sheetBody = byId("cheatSheetBody");
  const countLabel = byId("cheatSheetCountLabel");
  if (!sheetBody) return;

  const q = query.trim().toLowerCase();
  const rows = cheatSheetMasks.filter(m => {
    if (!q) return true;
    const hay = `/${m.cidr} ${m.mask} ${m.wildcard} ${m.hosts} ${m.size}`.toLowerCase();
    return hay.includes(q);
  });

  if (countLabel) {
    countLabel.textContent = q
      ? `Showing ${rows.length} of ${cheatSheetMasks.length} prefixes matching "${query.trim()}"`
      : `Showing /32–/16 reference rows · Click any row to load prefix`;
  }

  if (rows.length === 0) {
    sheetBody.innerHTML = `<tr><td colspan="5" class="cheat-sheet-empty">No CIDR prefix entries match "${safeHTML(query.trim())}".</td></tr>`;
    return;
  }

  sheetBody.innerHTML = rows.map(m => {
    const isHl = Number.isInteger(activeCidr) && m.cidr === activeCidr ? " highlighted-row" : "";
    return `
      <tr class="cheat-sheet-row${isHl}" data-cidr="${m.cidr}" tabindex="0">
        <td><strong>/${m.cidr}</strong></td>
        <td>${m.mask}</td>
        <td>${m.wildcard}</td>
        <td class="cheat-val-hosts">${m.hosts}</td>
        <td class="cheat-val-size">${m.size}</td>
      </tr>
    `;
  }).join("");
}

export function setupSubnetCalculator() {
  const ipInput = byId("calcIp");
  const cidrInput = byId("calcCidr");
  const cidrNumInput = byId("calcCidrNum");
  const searchInput = byId("cidrSearchInput");
  const bitGrid = byId("calcBitGrid");
  const sheetBody = byId("cheatSheetBody");
  if (!ipInput || !cidrInput) return;

  if (!ipInput.dataset.bound) {
    ipInput.dataset.bound = "true";
    ipInput.addEventListener("input", () => updateSubnetCalculator("ip"));
  }
  if (!cidrInput.dataset.bound) {
    cidrInput.dataset.bound = "true";
    cidrInput.addEventListener("input", () => updateSubnetCalculator("range"));
  }
  if (cidrNumInput && !cidrNumInput.dataset.bound) {
    cidrNumInput.dataset.bound = "true";
    cidrNumInput.addEventListener("input", () => updateSubnetCalculator("num"));
  }

  document.querySelectorAll(".calc-preset-btn").forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => {
      playNetSound("click");
      cidrInput.value = btn.dataset.mask;
      if (cidrNumInput) cidrNumInput.value = btn.dataset.mask;
      updateSubnetCalculator("preset");
    });
  });

  if (bitGrid && !bitGrid.dataset.bound) {
    bitGrid.dataset.bound = "true";
    const applyBitClick = (cell) => {
      if (!cell || cell.dataset.bitIndex === undefined) return;
      const newCidr = Number(cell.dataset.bitIndex) + 1;
      if (!Number.isInteger(newCidr) || newCidr < 1 || newCidr > 32) return;
      playNetSound("click");
      cidrInput.value = String(newCidr);
      if (cidrNumInput) cidrNumInput.value = String(newCidr);
      updateSubnetCalculator("bit");
    };
    bitGrid.addEventListener("click", (e) => applyBitClick(e.target.closest(".bit-cell")));
    bitGrid.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const cell = e.target.closest(".bit-cell");
        if (cell) {
          e.preventDefault();
          applyBitClick(cell);
        }
      }
    });
  }

  if (sheetBody && !sheetBody.dataset.bound) {
    sheetBody.dataset.bound = "true";
    const selectRow = (row) => {
      if (!row || !row.dataset.cidr) return;
      playNetSound("click");
      cidrInput.value = row.dataset.cidr;
      if (cidrNumInput) cidrNumInput.value = row.dataset.cidr;
      updateSubnetCalculator("sheet");
    };
    sheetBody.addEventListener("click", (e) => selectRow(e.target.closest(".cheat-sheet-row")));
    sheetBody.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const row = e.target.closest(".cheat-sheet-row");
        if (row) {
          e.preventDefault();
          selectRow(row);
        }
      }
    });
  }

  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = "true";
    searchInput.addEventListener("input", () => {
      const currentCidr = Number(cidrInput.value);
      renderCheatSheetRows(searchInput.value, Number.isInteger(currentCidr) ? currentCidr : null);
    });
  }

  renderCheatSheetRows("", Number(cidrInput.value) || 24);
  updateSubnetCalculator();
}

const VLSM_CLEAR_IDS = [
  "calcMask", "calcWildcard", "calcNetwork", "calcBroadcast",
  "calcRange", "calcHosts", "calcNetBits", "calcHostBits",
  "calcTotalAddrs", "calcFirstHost", "calcLastHost", "calcClass", "calcScope"
];

export function updateSubnetCalculator(source) {
  const ipInput = byId("calcIp");
  const cidrInput = byId("calcCidr");
  const cidrNumInput = byId("calcCidrNum");
  const calcCidrVal = byId("calcCidrVal");
  const errBanner = byId("calcValidationMsg");
  const specialNote = byId("calcSpecialPrefixNote");
  const progBar = byId("vlsmProgressionBar");
  const progSummary = byId("vlsmProgressionSummary");
  const boundarySummary = byId("calcBoundarySummary");
  if (!ipInput || !cidrInput) return;

  const ipStr = ipInput.value.trim();
  const ipNum = ipToNum(ipStr);
  const ipValid = ipNum !== null;

  let cidr;
  let cidrValid = true;
  if (source === "num" && cidrNumInput) {
    const raw = cidrNumInput.value.trim();
    if (!/^\d+$/.test(raw)) {
      cidrValid = false;
      cidr = NaN;
    } else {
      cidr = Number(raw);
      if (cidr < 0 || cidr > 32) cidrValid = false;
      else cidrInput.value = String(cidr);
    }
  } else {
    cidr = Number(cidrInput.value);
    cidrValid = Number.isInteger(cidr) && cidr >= 0 && cidr <= 32;
    if (cidrValid && cidrNumInput) cidrNumInput.value = String(cidr);
  }

  if (calcCidrVal) {
    calcCidrVal.textContent = cidrValid ? `/${cidr}` : "/--";
  }

  ipInput.classList.toggle("is-invalid", !ipValid);
  if (cidrNumInput) cidrNumInput.classList.toggle("is-invalid", !cidrValid);

  if (!ipValid || !cidrValid) {
    if (errBanner) {
      const reasons = [];
      if (!ipValid) reasons.push("Enter a valid IPv4 address (4 decimal octets 0–255, without leading zeros).");
      if (!cidrValid) reasons.push("Prefix length must be an integer between /0 and /32.");
      errBanner.textContent = reasons.join(" ");
      errBanner.hidden = false;
    }
    VLSM_CLEAR_IDS.forEach(id => {
      const el = byId(id);
      if (el) el.textContent = "--";
    });
    if (specialNote) specialNote.hidden = true;
    if (boundarySummary) boundarySummary.textContent = "Invalid address or prefix input";
    if (progSummary) progSummary.textContent = "Awaiting valid IPv4/CIDR inputs";
    if (progBar) progBar.innerHTML = `<div class="vlsm-prog-seg vlsm-prog-invalid" style="width:100%">Invalid input</div>`;
    const invalidGrid = byId("calcBitGrid");
    if (invalidGrid) invalidGrid.innerHTML = `<div class="calc-bit-invalid-msg">Awaiting valid IPv4 address (0–255 per octet) and CIDR prefix (/0–/32).</div>`;
    document.querySelectorAll(".cheat-sheet-row").forEach(r => r.classList.remove("highlighted-row"));
    document.querySelectorAll(".calc-preset-btn").forEach(b => b.classList.remove("is-active"));
    return;
  }

  if (errBanner) errBanner.hidden = true;

  const maskNum = cidr === 0 ? 0 : (cidr === 32 ? 0xFFFFFFFF : (~(0xFFFFFFFF >>> cidr)) >>> 0);
  const wildcardNum = (~maskNum) >>> 0;
  const netNum = (ipNum & maskNum) >>> 0;
  const broadNum = (netNum | wildcardNum) >>> 0;
  const totalAddrs = cidr === 0 ? 4294967296 : Math.pow(2, 32 - cidr);
  const netBits = cidr;
  const hostBits = 32 - cidr;

  const maskStr = numToIp(maskNum);
  const wildcardStr = numToIp(wildcardNum);
  const netStr = numToIp(netNum);
  const broadStr = numToIp(broadNum);

  let hosts = 0;
  let firstHostStr = netStr;
  let lastHostStr = broadStr;
  let rangeStr = netStr;

  if (cidr <= 30) {
    hosts = cidr === 0 ? 4294967294 : totalAddrs - 2;
    firstHostStr = numToIp((netNum + 1) >>> 0);
    lastHostStr = numToIp((broadNum - 1) >>> 0);
    rangeStr = `${firstHostStr} - ${lastHostStr}`;
  } else if (cidr === 31) {
    hosts = 2;
    firstHostStr = netStr;
    lastHostStr = broadStr;
    rangeStr = `${firstHostStr} - ${lastHostStr}`;
  } else {
    hosts = 1;
    firstHostStr = netStr;
    lastHostStr = netStr;
    rangeStr = netStr;
  }

  const setTxt = (id, val) => { const el = byId(id); if (el) el.textContent = val; };
  setTxt("calcMask", maskStr);
  setTxt("calcWildcard", wildcardStr);
  setTxt("calcNetwork", netStr);
  setTxt("calcBroadcast", broadStr);
  setTxt("calcHosts", hosts.toLocaleString());
  setTxt("calcRange", rangeStr);
  setTxt("calcNetBits", String(netBits));
  setTxt("calcHostBits", String(hostBits));
  setTxt("calcTotalAddrs", totalAddrs.toLocaleString());
  setTxt("calcFirstHost", firstHostStr);
  setTxt("calcLastHost", lastHostStr);

  const firstOctet = (ipNum >>> 24) & 255;
  let ipClass = "Class A";
  if (firstOctet >= 128 && firstOctet <= 191) ipClass = "Class B";
  else if (firstOctet >= 192 && firstOctet <= 223) ipClass = "Class C";
  else if (firstOctet >= 224 && firstOctet <= 239) ipClass = "Class D (Multicast)";
  else if (firstOctet >= 240) ipClass = "Class E (Experimental)";
  setTxt("calcClass", ipClass);

  let scope = "Public";
  if (firstOctet === 10) scope = "Private (RFC 1918)";
  else if (firstOctet === 172 && ((ipNum >>> 16) & 255) >= 16 && ((ipNum >>> 16) & 255) <= 31) scope = "Private (RFC 1918)";
  else if (firstOctet === 192 && ((ipNum >>> 16) & 255) === 168) scope = "Private (RFC 1918)";
  else if (firstOctet === 127) scope = "Loopback (Localhost)";
  else if (firstOctet === 169 && ((ipNum >>> 16) & 255) === 254) scope = "Link-Local (APIPA)";
  setTxt("calcScope", scope);

  if (specialNote) {
    if (cidr === 31) {
      specialNote.textContent = "RFC 3021 Point-to-Point Link (/31): Both addresses act as usable peer endpoints on router-to-router links (no broadcast wasted).";
      specialNote.hidden = false;
    } else if (cidr === 32) {
      specialNote.textContent = "Host Route (/32): Identifies a single IPv4 host interface (loopbacks, static host routes, ACL matches). Usable Hosts = 1.";
      specialNote.hidden = false;
    } else {
      specialNote.hidden = true;
    }
  }

  if (boundarySummary) {
    if (cidr === 32) boundarySummary.textContent = "32 Network Bits · 0 Host Bits · Exact Host Route";
    else if (cidr === 0) boundarySummary.textContent = "0 Network Bits · 32 Host Bits · Default Route 0.0.0.0/0";
    else if (cidr % 8 === 0) boundarySummary.textContent = `${netBits} Network Bits · ${hostBits} Host Bits · Classful Octet Boundary`;
    else boundarySummary.textContent = `${netBits} Network Bits · ${hostBits} Host Bits · Critical Octet #${Math.floor(cidr / 8) + 1}`;
  }

  // 4-Octet Interactive 32-Bit Grid (preserves 32 clickable <span> children)
  const bitGrid = byId("calcBitGrid");
  if (bitGrid) {
    const ipOctets = ipStr.split(".");
    const maskOctets = maskStr.split(".");
    let octetsHtml = "";
    for (let o = 0; o < 4; o++) {
      let cellsHtml = "";
      for (let b = 0; b < 8; b++) {
        const bitIdx = o * 8 + b;
        const isNetBit = bitIdx < cidr;
        const isBoundary = bitIdx === cidr - 1;
        const bitVal = (ipNum >>> (31 - bitIdx)) & 1;
        cellsHtml += `<span class="bit-cell ${isNetBit ? "net" : "host"}${isBoundary ? " is-boundary" : ""}" role="button" tabindex="0" data-bit-index="${bitIdx}" title="Bit ${bitIdx + 1}: Click to set /${bitIdx + 1}" aria-label="Bit ${bitIdx + 1}, value ${bitVal}, set /${bitIdx + 1}">${bitVal}</span>`;
      }
      octetsHtml += `
        <div class="calc-octet-block">
          <div class="calc-octet-head">
            <span>Octet ${o + 1}: <strong>${safeHTML(ipOctets[o])}</strong></span>
            <small>Mask ${safeHTML(maskOctets[o])}</small>
          </div>
          <div class="calc-bit-weights" aria-hidden="true">
            <i>128</i><i>64</i><i>32</i><i>16</i><i>8</i><i>4</i><i>2</i><i>1</i>
          </div>
          <div class="calc-octet-bits">${cellsHtml}</div>
        </div>
      `;
    }
    bitGrid.innerHTML = octetsHtml;
  }

  // Address Space Progression Diagram
  if (progSummary) {
    progSummary.textContent = `${totalAddrs.toLocaleString()} total addresses · ${hosts.toLocaleString()} usable host${hosts === 1 ? "" : "s"}`;
  }
  if (progBar) {
    if (cidr === 32) {
      progBar.innerHTML = `<div class="vlsm-prog-seg vlsm-prog-host" style="width:100%"><strong>Single Host IP (/32)</strong><span>${safeHTML(netStr)}</span></div>`;
    } else if (cidr === 31) {
      progBar.innerHTML = `
        <div class="vlsm-prog-seg vlsm-prog-host" style="width:50%"><strong>Peer A</strong><span>${safeHTML(netStr)}</span></div>
        <div class="vlsm-prog-seg vlsm-prog-host vlsm-prog-peer-b" style="width:50%"><strong>Peer B</strong><span>${safeHTML(broadStr)}</span></div>
      `;
    } else {
      progBar.innerHTML = `
        <div class="vlsm-prog-seg vlsm-prog-net"><strong>Network ID</strong><span>${safeHTML(netStr)}</span></div>
        <div class="vlsm-prog-seg vlsm-prog-host vlsm-prog-host-flex"><strong>Usable Hosts (${hosts.toLocaleString()})</strong><span>${safeHTML(firstHostStr)} &ndash; ${safeHTML(lastHostStr)}</span></div>
        <div class="vlsm-prog-seg vlsm-prog-bcast"><strong>Broadcast</strong><span>${safeHTML(broadStr)}</span></div>
      `;
    }
  }

  document.querySelectorAll(".calc-preset-btn").forEach(btn => {
    btn.classList.toggle("is-active", Number(btn.dataset.mask) === cidr);
  });

  // Highlight active row in CIDR cheat sheet without breaking active filters
  document.querySelectorAll(".cheat-sheet-row").forEach(row => {
    const rowCidr = Number(row.dataset.cidr);
    if (rowCidr === cidr) {
      row.classList.add("highlighted-row");
      if (byId("subnet")?.classList.contains("active") && source && source !== "sheet") {
        row.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    } else {
      row.classList.remove("highlighted-row");
    }
  });
}
