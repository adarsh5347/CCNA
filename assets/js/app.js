import { 
  state, 
  byId, 
  playNetSound, 
  gainXP, 
  saveAnalytics, 
  safeHTML, 
  pick, 
  rand, 
  shuffle, 
  STORE, 
  authReady, 
  authResolve, 
  safeSetStorage, 
  showToast, 
  createDefaultAnalytics, 
  loadAnalytics,
  persistSession
} from "./core.js";

import { 
  setupAuth, 
  updateHeaderProfile 
} from "./auth.js";

import { 
  submitSubnet, 
  ensureSubnetQuestion, 
  getSubnetMultiplier, 
  setupSubnetCalculator, 
  updateSubnetCalculator, 
  setupFlashcards, 
  renderSubnetLeaderboard, 
  updateSubnetLeaderboard,
  makeSubnetQuestion
} from "./subnetting.js";

import { 
  setupTraversalSimulator, 
  setupNodeConfigInspector, 
  renderCLI, 
  activeTopology, 
  switchTopology, 
  resetTopology2Links, 
  deviceConfigs,
  showOsiLayerDetail,
  updateOsiLabels,
  highlightNode
} from "./topology.js";

import { 
  setupCanvasConstellation, 
  startSession, 
  navToQuestion, 
  nextQuestion, 
  prevQuestion, 
  saveAndNext, 
  openReview, 
  submitSession, 
  renderNavigator, 
  renderQuestion, 
  wireQuestionInputs, 
  instantStudyFeedback, 
  applyQuestionTime, 
  explanationBlock, 
  answerEquals, 
  applyStats, 
  updateStreakOnAttempt, 
  renderAnalytics, 
  renderDomainChecks, 
  calcDomainAccuracy, 
  renderStatsCards, 
  renderHome, 
  readinessScore, 
  passProbability, 
  renderAchievements,
  toMMSS,
  markCurrent,
  startSessionTimer
} from "./quiz-engine.js";

import { generateBank, blueprint } from "./data.js";
import { labs } from "./labs.js";
import { ccnaVideos } from "./videos.js";

// Make sure other legacy files or script tags can find these methods on window
window.setPage = setPage;
window.renderHome = renderHome;
window.renderAnalytics = renderAnalytics;
window.renderAchievements = renderAchievements;
window.showOsiLayerDetail = showOsiLayerDetail;
window.updateOsiLabels = updateOsiLabels;
// Exposed for cross-module call from quiz-engine.js after renderQuestion
window.setupScrollCollapseHeader = setupScrollCollapseHeader;
window.syncHeaderHeight = syncHeaderHeight;

function handleEngineKeyDown(e) {
  if (!state.session || state.session.submitted) return;
  const tag = document.activeElement ? document.activeElement.tagName : "";
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const q = state.session.questions[state.session.idx];
  if (!q) return;

  const keyMap = { KeyA: 0, KeyB: 1, KeyC: 2, KeyD: 3 };

  if (e.code in keyMap && (q.type === "single" || q.type === "scenario" || q.type === "multi")) {
    e.preventDefault();
    const optIdx = keyMap[e.code];
    const opts = document.querySelectorAll(".opt input[type='radio'], .opt input[type='checkbox']");
    if (opts[optIdx]) {
      opts[optIdx].click();
      const labels = document.querySelectorAll(".opt");
      labels.forEach((l, i) => l.classList.toggle("selected", i === optIdx));
    }
    return;
  }

  switch (e.code) {
    case "ArrowRight":
    case "KeyN": {
      e.preventDefault();
      const nb = byId("nextQ") || byId("saveNext");
      if (nb && !nb.disabled) nb.click();
      break;
    }
    case "ArrowLeft":
    case "KeyP": {
      e.preventDefault();
      const pb = byId("prevQ");
      if (pb && !pb.disabled) pb.click();
      break;
    }
    case "KeyF": {
      e.preventDefault();
      const fb = byId("toggleMark");
      if (fb) {
        fb.click();
        const isFlagged = state.session.flagged[state.session.idx];
        showToast(isFlagged ? "Question flagged for review" : "Flag removed", "info", 1800);
      }
      break;
    }
  }
}

let _subnetInitialized = false;
let _videosInitialized = false;
let _labsInitialized = false;
let _traversalInitialized = false;

export function ensureSubnetInit() {
  if (_subnetInitialized) return;
  _subnetInitialized = true;
  renderSubnetLeaderboard();
  ensureSubnetQuestion(true);
  setupSubnetCalculator();
  setupFlashcards();
}

export function ensureVideosInit() {
  if (_videosInitialized) return;
  _videosInitialized = true;
  initVideos();
  renderVideos();
}

export function ensureLabsInit() {
  if (_labsInitialized) return;
  _labsInitialized = true;
  initLabSelector();
  initLabModes();
  if (typeof loadLab === "function") {
    loadLab(1);
  }
}

export function ensureTraversalInit() {
  if (_traversalInitialized) return;
  _traversalInitialized = true;
  setupTraversalSimulator();
}

export function setPage(page, push = true) {
  if (push) {
    history.pushState({ page }, "", "?page=" + page);
  }

  // Clear active subnetting challenge timer unconditionally
  if (state.subnet) {
    clearInterval(state.subnet.timerRef);
    state.subnet.timerRef = null;
  }

  // Clear active study/exam session if navigating away from engine page
  if (page !== "engine" && state.session && !state.session.submitted) {
    if (!confirm("You have an active quiz session. Are you sure you want to leave? Your progress will be lost.")) return;
    if (state.session.timer) clearInterval(state.session.timer);
    const headerTimerEl = byId("headerTimer");
    if (headerTimerEl) headerTimerEl.classList.add("hidden");
    state.session = null;
    persistSession();
  }

  // Bind/unbind keydown listener dynamically to prevent performance degradation on other pages
  document.removeEventListener("keydown", handleEngineKeyDown);
  if (page === "engine") {
    document.addEventListener("keydown", handleEngineKeyDown);
  }

  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  const targetPage = byId(page);
  if (targetPage) targetPage.classList.add("active");
  document.body.dataset.activePage = page;

  // Update nav buttons active highlight
  document.querySelectorAll("[data-page]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  if (page === "analytics") {
    renderAnalytics();
    renderAchievements();
  }
  if (page === "subnet") ensureSubnetInit();
  if (page === "videos") ensureVideosInit();
  if (page === "labs") ensureLabsInit();
  window.scrollTo(0, 0);
}

function restoreSession() {
  const raw = sessionStorage.getItem("ccna_session");
  if (!raw) return false;
  try {
    const saved = JSON.parse(raw);
    if (saved && !saved.submitted) {
      if (saved.answers && !Array.isArray(saved.answers)) {
        const arr = new Array(saved.questions.length).fill(null);
        Object.keys(saved.answers).forEach(key => {
          const idx = Number(key);
          if (!isNaN(idx) && idx >= 0 && idx < arr.length) {
            arr[idx] = saved.answers[key];
          }
        });
        saved.answers = arr;
      }
      state.session = saved;
      startSessionTimer();
      
      setPage("engine");
      byId("reviewArea").classList.add("hidden");
      byId("resultArea").classList.add("hidden");
      byId("questionArea").classList.remove("hidden");
      const examFooter = byId("examFooter") || document.querySelector(".exam-footer");
      if (examFooter) examFooter.style.display = "flex";
      renderNavigator();
      renderQuestion();
      return true;
    }
  } catch (e) {
    console.error("Failed to restore session:", e);
  }
  return false;
}

function navSetup() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-page]");
    if (btn) {
      setPage(btn.dataset.page);
    }
  });
}

function updateMuteButton() {
  const btn = byId("btnMuteToggle");
  if (btn) {
    btn.textContent = state.muted ? "🔇" : "🔊";
    btn.setAttribute("title", state.muted ? "Unmute Sound" : "Mute Sound");
  }
}

function updateContrastButton() {
  document.body.classList.toggle("high-contrast", state.highContrast);
  const btn = byId("btnToggleContrast");
  if (btn) {
    btn.setAttribute("title", state.highContrast ? "Disable High Contrast" : "Enable High Contrast");
  }
}

function wireEvents() {
  byId("startStudy").addEventListener("click", () => startSession("study"));
  byId("startQuiz").addEventListener("click", () => startSession("quiz"));
  byId("startSmartQuiz").addEventListener("click", () => startSession("smart"));
  byId("startExam").addEventListener("click", () => startSession("exam"));

  const btnLaunchStudy = byId("btnLaunchStudy");
  const btnLaunchExam = byId("btnLaunchExam");
  const btnLaunchLabs = byId("btnLaunchLabs");

  if (btnLaunchStudy) {
    btnLaunchStudy.addEventListener("click", () => {
      setPage("engine");
      startSession("study");
    });
  }
  if (btnLaunchExam) {
    btnLaunchExam.addEventListener("click", () => {
      setPage("engine");
      startSession("exam");
    });
  }
  if (btnLaunchLabs) {
    btnLaunchLabs.addEventListener("click", () => {
      setPage("labs");
    });
  }

  const btnMute = byId("btnMuteToggle");
  if (btnMute) {
    btnMute.addEventListener("click", () => {
      state.muted = !state.muted;
      safeSetStorage(localStorage, "ccna_muted", state.muted);
      updateMuteButton();
      playNetSound("click");
    });
  }

  const btnContrast = byId("btnToggleContrast");
  if (btnContrast) {
    btnContrast.addEventListener("click", () => {
      state.highContrast = !state.highContrast;
      safeSetStorage(localStorage, "ccna_high_contrast", state.highContrast);
      updateContrastButton();
      playNetSound("click");
      showToast(state.highContrast ? "High contrast mode on" : "High contrast mode off", "info", 2000);
    });
  }


  const chkTrouble = byId("chkTroubleshooting");
  if (chkTrouble) {
    chkTrouble.addEventListener("change", () => {
      playNetSound("click");
      state.simBugsFixed = {};
      if (state.inspectedNode) {
        renderCLI(state.inspectedNode);
      }
    });
  }

  const selectPacket = byId("simPacketType");
  if (selectPacket) {
    selectPacket.addEventListener("change", () => {
      if (state.inspectedNode) {
        renderCLI(state.inspectedNode);
      }
    });
  }

  const btnEasy = byId("btnSubnetEasy");
  const btnMedium = byId("btnSubnetMedium");
  const btnHard = byId("btnSubnetHard");
  const btnTimed = byId("btnSubnetTimed");

  if (btnEasy) btnEasy.addEventListener("click", () => { playNetSound("click"); state.subnet.mode = "Easy"; ensureSubnetQuestion(true); });
  if (btnMedium) btnMedium.addEventListener("click", () => { playNetSound("click"); state.subnet.mode = "Medium"; ensureSubnetQuestion(true); });
  if (btnHard) btnHard.addEventListener("click", () => { playNetSound("click"); state.subnet.mode = "Hard"; ensureSubnetQuestion(true); });
  if (btnTimed) btnTimed.addEventListener("click", () => { playNetSound("click"); state.subnet.mode = "Timed"; ensureSubnetQuestion(true); });

  const subSubmit = byId("subnetSubmit");
  if (subSubmit) subSubmit.addEventListener("click", submitSubnet);
  
  const subSkip = byId("subnetSkip");
  if (subSkip) {
    subSkip.addEventListener("click", () => {
      playNetSound("click");
      state.subnet.q = null;
      ensureSubnetQuestion(false);
    });
  }

  const ansInput = byId("subnetAnswer");
  if (ansInput) {
    ansInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        submitSubnet();
      }
    });
  }

  const openReviewBtn = byId("openReview");
  if (openReviewBtn) openReviewBtn.addEventListener("click", openReview);

  const toggleMarkBtn = byId("toggleMark");
  if (toggleMarkBtn) toggleMarkBtn.addEventListener("click", markCurrent);

  const exitBtn = byId("exitSession");
  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      if (state.session?.timer) clearInterval(state.session.timer);
      const timerEl = byId("timer");
      if (timerEl) timerEl.classList.add("hidden");
      setPage("home");
    });
  }

  const prevQBtn = byId("prevQ");
  if (prevQBtn) prevQBtn.addEventListener("click", prevQuestion);

  const nextQBtn = byId("nextQ");
  if (nextQBtn) nextQBtn.addEventListener("click", nextQuestion);

  const saveNextBtn = byId("saveNext");
  if (saveNextBtn) saveNextBtn.addEventListener("click", saveAndNext);

  const submitSessionBtn = byId("submitSession");
  if (submitSessionBtn) submitSessionBtn.addEventListener("click", () => submitSession(false));

  const btnFullScreen = byId("btnToggleFullScreen");
  if (btnFullScreen) {
    btnFullScreen.addEventListener("click", () => {
      playNetSound("click");
      const shell = document.querySelector(".exam-shell");
      if (!document.fullscreenElement) {
        shell?.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable full-screen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    });
  }

  const btnMissed = byId("startMissedQuiz");
  if (btnMissed) {
    btnMissed.addEventListener("click", () => startSession("missed"));
  }

  const sidebarNav = byId("examNavigator");
  const btnToggleNav = byId("btnToggleSidebar");
  const btnCloseNav = byId("btnCloseSidebar");
  if (sidebarNav && btnToggleNav && btnCloseNav) {
    btnToggleNav.addEventListener("click", () => {
      sidebarNav.classList.add("active");
    });
    btnCloseNav.addEventListener("click", () => {
      sidebarNav.classList.remove("active");
    });
  }

  const btnReset = byId("btnResetProgress");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all your progress statistics? This action cannot be undone.")) {
        state.analytics = createDefaultAnalytics();
        saveAnalytics(true);
        renderHome();
        renderAnalytics();
        showToast("Progress statistics reset successfully.", "info", 4000);
      }
    });
  }

  const onboarding = byId("onboardingModal");
  const dismissBtn = byId("btnOnboardingDismiss");
  if (onboarding && dismissBtn) {
    if (!localStorage.getItem("ccna_onboarded")) {
      onboarding.classList.remove("hidden");
    }
    dismissBtn.addEventListener("click", () => {
      playNetSound("success");
      onboarding.classList.add("hidden");
      safeSetStorage(localStorage, "ccna_onboarded", "true");
    });
  }

  const btnGeneratePlan = byId("btnGeneratePlan");
  if (btnGeneratePlan) {
    btnGeneratePlan.addEventListener("click", () => {
      playNetSound("click");
      const targetDateStr = byId("studyExamDate").value;
      const dailyHours = Number(byId("studyDailyHours").value);
      const outBox = byId("studyPlanOutput");
      if (!outBox) return;

      if (!targetDateStr) {
        showToast("Please select a target exam date.", "warn");
        return;
      }

      const targetDate = new Date(targetDateStr);
      const today = new Date();
      const diffTime = targetDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        showToast("Target exam date must be in the future!", "warn");
        return;
      }

      const totalStudyVolume = 120;
      const currentXP = state.analytics.xp || 0;
      const progressXPFactor = Math.min(0.9, currentXP / 5000);
      const remainingHours = Math.max(10, Math.round(totalStudyVolume * (1 - progressXPFactor)));
      const requiredHoursPerDay = remainingHours / diffDays;

      outBox.style.display = "block";

      let planHtml = `
        <h4 style="color:#00f2fe; margin-top:0; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">📋 Generated Study Route</h4>
        <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-weight:bold; font-size:12.5px;">
          <span>Days Remaining: ${diffDays}</span>
          <span>Estimated Hours Needed: ${remainingHours}h</span>
        </div>
      `;

      if (dailyHours < requiredHoursPerDay) {
        planHtml += `
          <div style="background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.25); color:#f87171; padding:8px 12px; border-radius:6px; margin-bottom:12px; font-size:11.5px;">
            <strong>⚠ Schedule Alert:</strong> Your target of ${dailyHours} hours/day is insufficient to cover the remaining ${remainingHours} hours. Increase daily target to <strong>${requiredHoursPerDay.toFixed(1)}</strong> hours or push back exam date.
          </div>
        `;
      } else {
        planHtml += `
          <div style="background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.25); color:#34d399; padding:8px 12px; border-radius:6px; margin-bottom:12px; font-size:11.5px;">
            <strong>✔ Target Achievable:</strong> You are fully on track! A study pace of ${dailyHours} hours/day exceeds the required ${requiredHoursPerDay.toFixed(1)} hours/day.
          </div>
        `;
      }

      const weakDomains = state.weakDomains || [];
      planHtml += `
        <div style="margin-bottom:10px;">
          <strong>Target Practice Metrics:</strong><br />
          • Solve at least <strong>${Math.max(5, Math.round(15 / dailyHours))}</strong> questions per day.<br />
          • Practice 1 CLI lab configurations twice a week.
        </div>
      `;

      if (weakDomains.length > 0) {
        planHtml += `
          <div style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.05); padding-top:8px;">
            <strong>Domain Focus Recommendations:</strong> Use Spaced Repetition or Smart Adaptive practice filters focusing on your weakest domains: 
            <span style="color:#f59e0b; font-weight:bold;">${weakDomains.join(", ")}</span>.
          </div>
        `;
      }

      outBox.innerHTML = planHtml;
    });
  }
}

const distractorCommands = {
  1: ["vlan 999", "switchport mode trunk", "interface FastEthernet0/24", "no switchport"],
  2: ["encapsulation dot1Q 99", "ip address 10.10.10.1 255.0.0.0", "interface GigabitEthernet0/0", "no ip routing"],
  3: ["router ospf 100", "router-id 2.2.2.2", "network 192.168.1.0 0.0.0.0 area 0", "ip route 0.0.0.0 0.0.0.0 10.10.10.1"],
  4: ["access-list 10 permit 192.168.20.0 0.0.0.255", "ip access-group 10 out", "access-list 10 deny any", "interface GigabitEthernet0/1"],
  5: ["ip dhcp pool WAN_POOL", "default-router 192.168.1.254", "dns-server 1.1.1.1", "ip dhcp excluded-address 192.168.1.1 192.168.1.254"],
  6: ["ip nat outside", "ip nat inside", "access-list 1 permit any", "ip nat inside source static 192.168.1.10 192.168.1.2"],
  7: ["spanning-tree vlan 10 priority 4000", "spanning-tree mode pvst", "no spanning-tree vlan 10", "spanning-tree root primary"],
  8: ["interface range GigabitEthernet0/1 - 2", "channel-group 1 mode passive", "channel-group 1 mode on", "no channel-group 1"],
  9: ["wlan Corporate_WiFi 1", "security wpa wpa2 key-mgmt wpa", "security wpa wpa2 akm psk set-key ascii WrongPassword", "wlan Corporate_WiFi 2 shutdown"],
  10: ["crypto isakmp policy 1", "encryption aes 128", "crypto ipsec transform-set MY_SET esp-3des esp-sha-hmac", "crypto isakmp key WrongKey address 198.51.100.1"]
};

function initLabSelector() {
  const sel = byId("labSelector");
  if (!sel) return;
  sel.innerHTML = labs.map((l) => `<option value="${l.id}">Lab ${l.id}: ${l.title}</option>`).join("");
  sel.addEventListener("change", () => {
    state.lab.currentLabId = Number(sel.value);
    loadLab(state.lab.currentLabId);
  });
}

function initLabModes() {
  const modes = [
    { id: "btnModeStep", mode: "step" },
    { id: "btnModeChallenge", mode: "challenge" },
    { id: "btnModeExam", mode: "exam" }
  ];
  modes.forEach(m => {
    const btn = byId(m.id);
    if (btn) {
      btn.addEventListener("click", () => {
        playNetSound("click");
        modes.forEach(o => {
          const b = byId(o.id);
          if (b) b.className = "ghost";
        });
        btn.className = "primary";
        state.lab.mode = m.mode;
        loadLab(state.lab.currentLabId);
      });
    }
  });
}

function drawLabTopology(lab) {
  const container = byId("labTopologyContainer");
  if (!container) return;
  
  let svg = `
    <svg viewBox="0 0 500 160" width="100%" height="100%" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
      <line x1="100" y1="80" x2="250" y2="80" stroke="#00f2fe" stroke-width="2" />
      <line x1="250" y1="80" x2="400" y2="80" stroke="var(--color-ok)" stroke-width="2" />
      
      <g transform="translate(100, 80)">
        <circle r="16" fill="#060913" stroke="#00f2fe" stroke-width="2" />
        <text y="4" font-family="Space Grotesk" font-size="8" fill="#fff" text-anchor="middle">💻 Host</text>
      </g>
      
      <g transform="translate(250, 80)">
        <rect x="-18" y="-12" width="36" height="24" rx="4" fill="#060913" stroke="#00f2fe" stroke-width="2" />
        <text y="4" font-family="Space Grotesk" font-size="8" fill="#fff" text-anchor="middle">🎛️ SW-1</text>
      </g>
      
      <g transform="translate(400, 80)">
        <circle r="16" fill="#060913" stroke="var(--color-ok)" stroke-width="2" />
        <text y="4" font-family="Space Grotesk" font-size="8" fill="#fff" text-anchor="middle">🌐 R-1</text>
      </g>
    </svg>
  `;
  container.innerHTML = svg;
}

function renderLabObjectives(lab) {
  const list = byId("labObjectivesList");
  if (!list) return;
  
  list.innerHTML = lab.objectives.map((obj, idx) => {
    const done = state.lab.completedSteps[idx];
    const icon = done ? "✔" : "⏳";
    const color = done ? "var(--color-ok)" : "var(--text-muted)";
    return `
      <div style="display: flex; align-items: flex-start; gap: 8px; color: ${color};">
        <span>${icon}</span>
        <span>${obj}</span>
      </div>
    `;
  }).join("");
}

function loadLab(labId) {
  const lab = labs.find(l => l.id === labId);
  if (!lab) return;
  
  state.lab.currentLabId = labId;
  state.lab.completedSteps = {};
  state.lab.userCommands = [];
  state.lab.currentPrompt = (labId === 1 || labId === 7 || labId === 8) ? "Switch(config)#" : "Router(config)#";
  
  drawLabTopology(lab);
  renderLabObjectives(lab);
  
  const output = byId("labCliOutput");
  const prompt = byId("labCliPrompt");
  const inputs = byId("labInteractiveInputs");
  const feedback = byId("labFeedbackBox");
  
  if (feedback) feedback.style.display = "none";
  const btnLabAskAI = byId("btnLabAskAI");
  if (btnLabAskAI) btnLabAskAI.style.display = "block";
  
  const initialHost = (labId === 1 || labId === 7 || labId === 8) ? "Switch" : "Router";
  
  if (state.lab.mode === "step" || state.lab.mode === "challenge") {
    if (output) {
      output.textContent = `Cisco IOS Software, Catalyst L3 Switch Software, Version 15.2...\n\n${initialHost}# configure terminal\nEnter configuration commands, one per line. End with CNTL/Z.\n`;
    }
    if (prompt) prompt.textContent = `${initialHost}(config)#`;
    
    let cmds = lab.commands.map((c, i) => ({ cmd: c.cmd, idx: i, correct: true }));
    if (state.lab.mode === "challenge") {
      const dists = distractorCommands[lab.id] || [];
      dists.forEach(d => {
        cmds.push({ cmd: d, idx: -1, correct: false });
      });
    }
    cmds = shuffle(cmds);
    
    if (inputs) {
      inputs.innerHTML = cmds.map(c => `
        <button class="secondary btn-lab-cmd" data-cmd="${c.cmd}" style="padding: 4px 8px; font-size: 11px; font-family: var(--font-mono); text-transform: none; margin: 2px;">${c.cmd}</button>
      `).join("");
      
      inputs.querySelectorAll(".btn-lab-cmd").forEach(btn => {
        btn.addEventListener("click", () => {
          handleLabCommandClick(btn.dataset.cmd, lab);
        });
      });
    }
  } else if (state.lab.mode === "exam") {
    if (output) {
      output.innerHTML = `<div style="font-size:12px; color:#fff; font-style:italic; margin-bottom:8px;">Match each configuration objective to its correct Cisco IOS command. Click an objective, then click its matching command below.</div>`;
    }
    if (prompt) prompt.textContent = "Exam Mode";
    
    renderExamMatchInterface(lab);
  }
}

function handleLabCommandClick(cmd, lab) {
  const nextExpectedIdx = state.lab.userCommands.length;
  const nextExpectedCmd = lab.commands[nextExpectedIdx].cmd;
  const output = byId("labCliOutput");
  const prompt = byId("labCliPrompt");
  const feedback = byId("labFeedbackBox");
  
  if (feedback) feedback.style.display = "none";
  
  const currentHost = (lab.id === 1 || lab.id === 7 || lab.id === 8) ? "Switch" : "Router";
  
  if (cmd === nextExpectedCmd) {
    playNetSound("hop");
    state.lab.userCommands.push(cmd);
    
    if (cmd.startsWith("interface") || cmd.startsWith("int ")) {
      state.lab.currentPrompt = `${currentHost}(config-if)#`;
    } else if (cmd.startsWith("router ospf") || cmd.startsWith("router rip")) {
      state.lab.currentPrompt = `${currentHost}(config-router)#`;
    } else if (cmd.startsWith("vlan ")) {
      state.lab.currentPrompt = `${currentHost}(config-vlan)#`;
    } else if (cmd.startsWith("wlan ")) {
      state.lab.currentPrompt = `${currentHost}(config-wlan)#`;
    } else if (cmd.startsWith("crypto isakmp") || cmd.startsWith("crypto ipsec")) {
      state.lab.currentPrompt = `${currentHost}(config-crypto)#`;
    } else if (cmd.startsWith("exit")) {
      state.lab.currentPrompt = `${currentHost}(config)#`;
    }
    
    if (output) {
      output.textContent += `${prompt.textContent} ${cmd}\n`;
      output.scrollTop = output.scrollHeight;
    }
    if (prompt) prompt.textContent = state.lab.currentPrompt;
    
    const completedCount = state.lab.userCommands.length;
    lab.objectives.forEach((obj, idx) => {
      const threshold = Math.min(lab.commands.length, Math.ceil((idx + 1) * (lab.commands.length / lab.objectives.length)));
      if (completedCount >= threshold) {
        if (!state.lab.completedSteps[idx]) {
          state.lab.completedSteps[idx] = true;
          playNetSound("success");
        }
      }
    });
    
    renderLabObjectives(lab);
    
    if (state.lab.userCommands.length === lab.commands.length) {
      playNetSound("success");
      if (output) {
        output.textContent += `\n%CONFIG-5-SUCCESS: Laboratory configuration completed successfully. All objectives met.\n`;
        output.scrollTop = output.scrollHeight;
      }
      if (feedback) {
        feedback.style.display = "block";
        feedback.style.background = "var(--color-ok)";
        feedback.style.color = "#000";
        feedback.textContent = `✔ Lab Completed! +50 XP Awarded.`;
      }
      gainXP(50);
      
      state.analytics.labsCompleted = Math.min(10, (state.analytics.labsCompleted || 0) + 1);
      saveAnalytics();
      renderHome();
      
      const inputs = byId("labInteractiveInputs");
      if (inputs) inputs.innerHTML = `<span style="color:var(--color-ok); font-weight:bold;">✔ Lab Passed!</span>`;
    }
  } else {
    playNetSound("block");
    if (output) {
      output.textContent += `${prompt.textContent} ${cmd}\n% Invalid input detected or command mismatch.\n`;
      output.scrollTop = output.scrollHeight;
    }
    if (feedback) {
      feedback.style.display = "block";
      feedback.style.background = "var(--color-error)";
      feedback.style.color = "#fff";
      feedback.textContent = `❌ Incorrect command sequence. Try again.`;
    }
  }
}

function renderExamMatchInterface(lab) {
  const output = byId("labCliOutput");
  const inputs = byId("labInteractiveInputs");
  if (!output || !inputs) return;
  
  state.lab.selectedObjIdx = null;
  state.lab.selectedCmdText = null;
  state.lab.matches = {};
  
  const shuffledCmds = shuffle(lab.commands.map((c, i) => ({ text: c.cmd, originalIdx: i })));
  
  output.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%;">
      <div>
        <h5 style="color: #00f2fe; margin-top: 0; margin-bottom: 6px;">Objectives / Steps</h5>
        <div id="examObjColumn" style="display: flex; flex-direction: column; gap: 4px; overflow-y:auto; max-height:160px;">
          ${lab.commands.map((c, i) => `
            <div class="exam-item exam-obj-item" data-obj-idx="${i}" style="border: 1px solid var(--border-color); padding: 4px; border-radius: 4px; font-size: 10px; cursor: pointer; background: rgba(255,255,255,0.02); min-height: 36px;">
              ${i+1}. ${c.desc}
              <div class="matched-val" id="matchedVal-${i}" style="color: var(--color-ok); font-weight: bold; font-family: var(--font-mono); font-size: 9.5px; margin-top: 2px;"></div>
            </div>
          `).join("")}
        </div>
      </div>
      <div>
        <h5 style="color: #00f2fe; margin-top: 0; margin-bottom: 6px;">IOS Commands</h5>
        <div id="examCmdColumn" style="display: flex; flex-direction: column; gap: 4px; overflow-y:auto; max-height:160px;">
          ${shuffledCmds.map((c, i) => `
            <div class="exam-item exam-cmd-item" data-cmd-text="${c.text}" style="border: 1px solid var(--border-color); padding: 4px; border-radius: 4px; font-size: 10px; cursor: pointer; font-family: var(--font-mono); background: rgba(255,255,255,0.02); min-height: 36px; display:flex; align-items:center;">
              ${c.text}
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
  
  inputs.innerHTML = `
    <button id="btnSubmitExamMatches" class="primary" style="width: 100%; height: 32px; font-size: 12px;">Submit Configuration Matches</button>
  `;
  
  const objItems = output.querySelectorAll(".exam-obj-item");
  const cmdItems = output.querySelectorAll(".exam-cmd-item");
  
  objItems.forEach(item => {
    item.addEventListener("click", () => {
      playNetSound("click");
      objItems.forEach(el => el.style.borderColor = "var(--border-color)");
      item.style.borderColor = "#00f2fe";
      state.lab.selectedObjIdx = Number(item.dataset.objIdx);
      checkAndApplyMatch();
    });
  });
  
  const handleCmdClick = (item) => {
    playNetSound("click");
    cmdItems.forEach(el => el.style.borderColor = "var(--border-color)");
    item.style.borderColor = "#00f2fe";
    state.lab.selectedCmdText = item.dataset.cmdText;
    checkAndApplyMatch();
  };

  cmdItems.forEach(item => {
    item.addEventListener("click", () => handleCmdClick(item));
  });
  
  function checkAndApplyMatch() {
    if (state.lab.selectedObjIdx !== null && state.lab.selectedCmdText !== null) {
      const objIdx = state.lab.selectedObjIdx;
      const cmdText = state.lab.selectedCmdText;
      
      state.lab.matches[objIdx] = cmdText;
      
      const matchLabel = byId(`matchedVal-${objIdx}`);
      if (matchLabel) {
        matchLabel.textContent = `Matched: ${cmdText}`;
      }
      
      objItems.forEach(el => el.style.borderColor = "var(--border-color)");
      cmdItems.forEach(el => el.style.borderColor = "var(--border-color)");
      state.lab.selectedObjIdx = null;
      state.lab.selectedCmdText = null;
    }
  }
  
  const btnSubmit = byId("btnSubmitExamMatches");
  if (btnSubmit) {
    btnSubmit.addEventListener("click", () => {
      let correctCount = 0;
      lab.commands.forEach((c, idx) => {
        if (state.lab.matches[idx] === c.cmd) {
          correctCount++;
        }
      });
      
      const total = lab.commands.length;
      const feedback = byId("labFeedbackBox");
      
      if (correctCount === total) {
        playNetSound("success");
        if (feedback) {
          feedback.style.display = "block";
          feedback.style.background = "var(--color-ok)";
          feedback.style.color = "#000";
          feedback.textContent = `✔ Exam passed! ${correctCount}/${total} correct matches. +50 XP Awarded.`;
        }
        gainXP(50);
        
        lab.objectives.forEach((_, i) => {
          state.lab.completedSteps[i] = true;
        });
        renderLabObjectives(lab);
        
        state.analytics.labsCompleted = Math.min(10, (state.analytics.labsCompleted || 0) + 1);
        saveAnalytics();
        renderHome();
        
        inputs.innerHTML = `<span style="color:var(--color-ok); font-weight:bold;">✔ Lab Passed!</span>`;
      } else {
        playNetSound("block");
        if (feedback) {
          feedback.style.display = "block";
          feedback.style.background = "var(--color-error)";
          feedback.style.color = "#fff";
          feedback.textContent = `❌ Exam failed. ${correctCount}/${total} correct matches. Try again.`;
        }
      }
    });
  }
}

document.addEventListener("click", (e) => {
  const videoBtn = e.target.closest(".btn-video-watch");
  if (videoBtn) {
    const yid = videoBtn.dataset.youtubeId;
    const title = videoBtn.dataset.videoTitle;
    const vidId = Number(videoBtn.dataset.videoId);
    playVideo(yid, title, vidId);
  }
});

// ─── Phase 3: Dynamically sync --header-height from actual rendered header ───
// Uses ResizeObserver so the variable stays accurate if fontlet _lastHeaderHeight = 0;
function syncHeaderHeight() {
  if (window.innerWidth > 760) return; // desktop untouched
  const header = document.querySelector(".exam-header");
  if (!header) return;
  const h = Math.ceil(header.getBoundingClientRect().height);
  if (h > 0 && h !== _lastHeaderHeight) {
    _lastHeaderHeight = h;
    document.documentElement.style.setProperty("--header-height", `${h}px`);
  }
}

function watchHeaderHeight() {
  if (window.innerWidth > 760) return;
  const header = document.querySelector(".exam-header");
  if (!header) return;
  if (_headerResizeObserver) _headerResizeObserver.disconnect();
  _headerResizeObserver = new ResizeObserver(() => syncHeaderHeight());
  _headerResizeObserver.observe(header);
  syncHeaderHeight(); // initial sync
}

// ─── Phase 2: IntersectionObserver scroll-collapse header ────────────────────
// Adds .collapsed to .exam-header once user scrolls past a sentinel div placed
// at the very top of #questionArea content. Smooth transition via CSS.
let _scrollCollapseObserver = null;

function setupScrollCollapseHeader() {
  if (window.innerWidth > 760) return; // desktop untouched

  // Clean up previous observer if navigating between questions
  if (_scrollCollapseObserver) {
    _scrollCollapseObserver.disconnect();
    _scrollCollapseObserver = null;
  }

  const questionArea = byId("questionArea");
  const examHeader = document.querySelector(".exam-header");
  if (!questionArea || !examHeader) return;

  // Remove any stale sentinel
  const stale = questionArea.querySelector(".scroll-sentinel");
  if (stale) stale.remove();

  // Re-expand header when navigating to a new question (scroll reset)
  examHeader.classList.remove("collapsed");
  syncHeaderHeight();

  // Inject sentinel as first child of questionArea
  const sentinel = document.createElement("div");
  sentinel.className = "scroll-sentinel";
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;";
  questionArea.insertBefore(sentinel, questionArea.firstChild);

  // Observe: when sentinel leaves viewport top, collapse header; when re-enters, expand
  _scrollCollapseObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const shouldCollapse = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        examHeader.classList.toggle("collapsed", shouldCollapse);
        // Update --header-height immediately after collapse/expand
        requestAnimationFrame(syncHeaderHeight);
      });
    },
    {
      root: questionArea,
      rootMargin: "0px",
      threshold: 0,
    }
  );
  _scrollCollapseObserver.observe(sentinel);
}

function init() {
  state.bank = [];
  state.analytics = loadAnalytics();
  navSetup();
  renderDomainChecks();
  renderHome();
  wireEvents();
  setupAuth();
  setupCanvasConstellation();
  
  updateMuteButton();
  updateContrastButton();

  // Defer all non-critical page initializations until idle microtask after landing page paint
  const initNonCritical = () => {
    ensureTraversalInit();
    setupSupportDesk();
    ensureVideosInit();
    ensureSubnetInit();
    ensureLabsInit();

    if (!state.bank || state.bank.length === 0) {
      state.bank = generateBank(rand);
      renderHome();
    }
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(initNonCritical);
  } else {
    setTimeout(initNonCritical, 50);
  }

  // Phase 3: Start watching header height with ResizeObserver
  watchHeaderHeight();

  // Re-sync header height on orientation/resize
  window.addEventListener("resize", syncHeaderHeight, { passive: true });
  
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      persistSession();
    }
  });

  window.addEventListener("beforeunload", (e) => {
    if (state.session && !state.session.submitted) {
      e.preventDefault();
      e.returnValue = "You have an active CCNA quiz session. Are you sure you want to leave?";
      return e.returnValue;
    }
    if (state.subnet && state.subnet.timerRef) {
      e.preventDefault();
      e.returnValue = "You have an active subnetting challenge running. Are you sure you want to leave?";
      return e.returnValue;
    }
  });

  window.addEventListener("popstate", (e) => {
    if (state.session && !state.session.submitted) {
      if (!confirm("You have an active CCNA quiz session. Are you sure you want to leave? Your progress will be lost.")) {
        history.pushState({ page: "engine" }, "", "?page=engine");
        return;
      }
    }
    const page = (e.state && e.state.page) ? e.state.page : "home";
    setPage(page, false);
  });
}


function setupSupportDesk() {
  const btn = byId("btnSubmitSupport");
  const out = byId("supportOut");
  if (!btn || !out) return;

  btn.addEventListener("click", () => {
    const name = byId("supportName").value.trim();
    const email = byId("supportEmail").value.trim();
    const priority = byId("supportPriority").value;
    const desc = byId("supportDesc").value.trim();

    if (!name || !email || !desc) {
      showToast("Please fill in all required fields.", "warn");
      return;
    }

    showToast("Incident ticket successfully logged ✓", "ok", 3000);
    const safePriority = priority.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    out.innerHTML = `
      <strong style="color: var(--color-ok);">Incident Logged Successfully!</strong><br />
      <strong>Ticket ID:</strong> INC-${Math.floor(100000 + Math.random() * 900000)}<br />
      <strong>Severity:</strong> ${safePriority}<br />
      <strong>Status:</strong> Assigned to Platform Admin<br />
      <span style="font-size: 12px; color: var(--text-muted);">Your incident has been logged. The admin team will follow up via the email address you provided.</span>
    `;
    out.classList.remove("hidden");

    byId("supportName").value = "";
    byId("supportEmail").value = "";
    byId("supportDesc").value = "";
  });
}

function initVideos() {
  const filtersContainer = byId("videoFiltersContainer");
  if (filtersContainer) {
    filtersContainer.querySelectorAll(".video-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        filtersContainer.querySelectorAll(".video-filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        playNetSound("click");
        renderVideos();
      });
    });
  }

  const btnCloseVideo = byId("btnCloseVideoModal");
  if (btnCloseVideo) {
    btnCloseVideo.addEventListener("click", closeVideoPlayer);
  }
  const videoModal = byId("videoModal");
  if (videoModal) {
    videoModal.addEventListener("click", (e) => {
      if (e.target === videoModal) closeVideoPlayer();
    });
  }
}

function renderVideos() {
  const container = byId("videoLessonsGrid");
  if (!container) return;

  const currentDomain = document.querySelector(".video-filter-btn.active")?.dataset.domain || "all";
  
  if (!state.analytics.watchedVideos) {
    state.analytics.watchedVideos = [];
  }

  const filtered = ccnaVideos.filter(v => currentDomain === "all" || v.domain === currentDomain);

  container.innerHTML = filtered.map(v => {
    const isWatched = state.analytics.watchedVideos.includes(v.id);
    return `
      <article class="card video-card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 16px; border: 1.5px solid ${isWatched ? "rgba(16, 185, 129, 0.3)" : "var(--border-color)"}; background: rgba(13, 19, 36, 0.4); position: relative; transition: border-color 0.2s;">
        <div>
          <div class="video-thumbnail-container" data-video-id="${v.id}" style="position: relative; width: 100%; padding-bottom: 56.25%; background: rgba(0,0,0,0.6); border-radius: 8px; margin-bottom: 12px; cursor: pointer; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; display: flex; align-items: center; justify-content: center;">
            <img src="https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg" alt="${v.title}" loading="lazy" decoding="async" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.75; transition: transform 0.3s;" />
            <div class="play-icon-overlay" style="position: absolute; font-size: 32px; color: var(--accent-color); opacity: 0.85; filter: drop-shadow(0 0 10px rgba(0,242,254,0.5)); transition: transform 0.2s;">▶</div>
            <span style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.85); color: #fff; font-size: 11px; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono);">${v.duration}</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <span style="font-size: 11px; color: var(--accent-color); font-weight: bold; background: rgba(0, 242, 254, 0.08); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(0,242,254,0.15);">${v.topic}</span>
            <label style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted); cursor: pointer;">
              <input type="checkbox" class="video-watch-checkbox" data-video-id="${v.id}" ${isWatched ? "checked" : ""} style="cursor: pointer;" />
              Watched
            </label>
          </div>
          <h4 style="margin: 6px 0 8px 0; font-size: 14px; line-height: 1.4; color: #fff;">${v.title}</h4>
          <p style="margin: 0 0 12px 0; font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">${v.description}</p>
        </div>
        <button class="primary btn-watch-video" data-youtube-id="${v.youtubeId}" data-video-title="${v.title}" data-video-id="${v.id}" style="width: 100%; font-size: 12px; padding: 8px;">Watch Lesson</button>
      </article>
    `;
  }).join("");

  updateVideoProgress();

  container.querySelectorAll(".btn-watch-video, .video-thumbnail-container").forEach(el => {
    el.addEventListener("click", () => {
      const yid = el.dataset.youtubeId || el.closest(".video-card").querySelector(".btn-watch-video").dataset.youtubeId;
      const title = el.dataset.videoTitle || el.closest(".video-card").querySelector(".btn-watch-video").dataset.videoTitle;
      const vidId = el.dataset.videoId || el.closest(".video-card").querySelector(".btn-watch-video").dataset.videoId;
      playVideo(yid, title, Number(vidId));
    });
  });

  container.querySelectorAll(".video-watch-checkbox").forEach(chk => {
    chk.addEventListener("change", () => {
      const vidId = Number(chk.dataset.videoId);
      toggleVideoWatchedState(vidId, chk.checked);
    });
  });
}

function toggleVideoWatchedState(vidId, isWatched) {
  if (!state.analytics.watchedVideos) {
    state.analytics.watchedVideos = [];
  }
  
  if (isWatched) {
    if (!state.analytics.watchedVideos.includes(vidId)) {
      state.analytics.watchedVideos.push(vidId);
      playNetSound("success");
    }
  } else {
    state.analytics.watchedVideos = state.analytics.watchedVideos.filter(id => id !== vidId);
    playNetSound("click");
  }

  saveAnalytics(true);
  renderVideos();
}

function updateVideoProgress() {
  const progressPercentBar = byId("videoProgressPercentageBar");
  const progressLabel = byId("videoProgressLabel");
  const progressPercentage = byId("videoProgressPercentage");

  if (!progressPercentBar) return;

  const total = ccnaVideos.length;
  const watched = state.analytics.watchedVideos ? state.analytics.watchedVideos.length : 0;
  const pct = total > 0 ? Math.round((watched / total) * 100) : 0;

  progressPercentBar.style.width = `${pct}%`;
  if (progressLabel) progressLabel.textContent = `${watched}/${total} Watched`;
  if (progressPercentage) progressPercentage.textContent = `${pct}%`;
}

function playVideo(youtubeId, title, vidId) {
  const modal = byId("videoModal");
  const iframe = byId("videoIFrame");
  const modalTitle = byId("videoModalTitle");

  if (!modal || !iframe) return;

  modalTitle.textContent = title;
  iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
  modal.classList.remove("hidden");
  playNetSound("success");

  if (vidId && state.analytics.watchedVideos && !state.analytics.watchedVideos.includes(vidId)) {
    toggleVideoWatchedState(vidId, true);
  }
}

function closeVideoPlayer() {
  const modal = byId("videoModal");
  const iframe = byId("videoIFrame");
  if (!modal || !iframe) return;

  iframe.src = "";
  modal.classList.add("hidden");
  playNetSound("click");
}

init();
