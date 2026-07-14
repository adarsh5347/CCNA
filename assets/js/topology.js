import { state, byId, playNetSound, gainXP, saveAnalytics, safeHTML } from "./core.js";
import { bugsData, cliOutputs } from "./cli.js";

// Global active topology state
export let activeTopology = 1;

export const deviceConfigs = {
  pc: `
<strong style="color: #00f2fe; font-size: 13px;">💻 Device: Host PC (End Station)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>IP Address:</strong> 192.168.1.10
<strong>Subnet Mask:</strong> 255.255.255.0
<strong>Default Gateway:</strong> 192.168.1.1 (R-1)
<strong>MAC Address:</strong> 0050.7966.6800
<strong>NIC Status:</strong> UP (1000BASE-T Full)
<strong>Active Connections:</strong> TCP 192.168.1.10:49152 -> 8.8.8.8:80 (ESTABLISHED)
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>ipconfig /all</code> to inspect network adapters, and <code>arp -a</code> to view the local ARP table.
  `,
  switch: `
<strong style="color: #00f2fe; font-size: 13px;">🎛️ Device: Switch SW-1 (Catalyst 2960)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>VLAN Database:</strong>
  - VLAN 10 (LAN Users): Ports Fa0/1, Fa0/2
  - VLAN 99 (Management): IP 192.168.1.250/24
<strong>Spanning Tree Protocol (STP):</strong>
  - Mode: PVST+ (Rapid)
  - Bridge ID Priority: 32768 (MAC: 00e0.f901.abcd)
  - Status: Root Bridge for VLAN 10
<strong>MAC Address Table:</strong>
  - 0050.7966.6800 -> Port Fa0/1 [Dynamic, Age: 42s]
  - 0011.2233.4455 -> Port Gi0/1 [Dynamic, Age: 120s]
  - 55aa.bbcc.ddee -> Port Gi0/2 [Dynamic, Age: 88s]
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>show mac address-table</code> to verify bridging learning, and <code>show vlan brief</code> to view port memberships.
  `,
  router: `
<strong style="color: #00f2fe; font-size: 13px;">🌐 Device: Router R-1 (Cisco ISR 4331)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>Interfaces:</strong>
  - Gi0/0/0 (LAN Gateway): 192.168.1.1/24 (UP) - <i>ip helper-address 10.10.10.1</i>
  - Gi0/0/1 (WAN Uplink): 192.168.1.2/30 (UP) - <i>ip nat outside</i>
<strong>Routing Table (OSPF Area 0):</strong>
  - C 192.168.1.0/24 is directly connected, Gi0/0/0
  - C 192.168.1.2/30 is directly connected, Gi0/0/1
  - O*E2 0.0.0.0/0 [110/1] via 192.168.1.2, 00:45:12, Gi0/0/1
<strong>Dynamic NAT Table:</strong>
  - Inside Local: 192.168.1.10:49152 <-> Inside Global: 192.168.1.2:1024
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>show ip route</code> to inspect routing decisions, and <code>show ip interface brief</code> to verify line protocol status.
  `,
  firewall: `
<strong style="color: #00f2fe; font-size: 13px;">🔒 Device: Firewall FW-1 (Cisco Secure Firewall 1010)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>Security Zones:</strong>
  - Inside (Gi1/1): Security Level 100 (Trust) - IP: 192.168.1.254/24
  - Outside (Gi1/2): Security Level 0 (Untrust) - IP: 192.168.1.3/30
<strong>Active Access-Control List (OUTSIDE_IN):</strong>
  - 10 permit tcp any host 192.168.1.10 eq 80 (HTTP)
  - 20 permit tcp any host 192.168.1.10 eq 443 (HTTPS)
  - 30 deny tcp any any eq 23 (Telnet block) [Matches: 14 hits]
  - 40 deny ip any any (Implicit Deny)
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>show access-list</code> to check rule hit-counts, and <code>show conn</code> to audit stateful sessions.
  `,
  wan: `
<strong style="color: #00f2fe; font-size: 13px;">☁️ WAN Cloud Server (Destination 8.8.8.8)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>Endpoint IP:</strong> 8.8.8.8 (Google DNS / Public Web Host)
<strong>Autonomous System:</strong> AS 15169 (Google LLC)
<strong>BGP Peerings:</strong> Established with ISP Edge Routers
<strong>Supported Protocols:</strong> ICMP (Echo), TCP (80, 443), UDP (53)
<strong>Route Path:</strong> 192.168.1.2 -> ISP Edge AS65001 -> Core WAN -> 8.8.8.8
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>tracert 8.8.8.8</code> to map the TTL-expired ICMP hops traversing Internet Autonomous Systems.
  `,
  "pc-sales": `
<strong style="color: #00f2fe; font-size: 13px;">💻 Device: Sales PC (VLAN 10 client)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>IP Address:</strong> 10.10.10.10
<strong>Subnet Mask:</strong> 255.255.255.0
<strong>Default Gateway:</strong> 10.10.10.1 (R-Branch subinterface Gi0/0.10)
<strong>MAC Address:</strong> 00aa.bbcc.1010
<strong>Active Port:</strong> SW-Branch port Fa0/1 (VLAN 10)
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
On Windows clients, use <code>route print</code> to verify default gateway settings, and <code>ipconfig /renew</code> to acquire fresh DHCP bindings.
  `,
  "ip-phone": `
<strong style="color: #00f2fe; font-size: 13px;">📞 Device: Voice IP Phone (VLAN 20 voice client)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>IP Address:</strong> 10.10.20.10
<strong>Subnet Mask:</strong> 255.255.255.0
<strong>Default Gateway:</strong> 10.10.20.1 (R-Branch subinterface Gi0/0.20)
<strong>MAC Address:</strong> 00bb.ccdd.2020
<strong>Active Port:</strong> SW-Branch port Fa0/2 (VLAN 20 - Voice VLAN)
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>show interface &lt;id&gt; switchport</code> on the switch to verify that a port has both a data VLAN and a voice VLAN tag assigned.
  `,
  "sw-branch": `
<strong style="color: #00f2fe; font-size: 13px;">🎛️ Device: Branch Switch SW-Branch (Catalyst 2960)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>Interface Configurations:</strong>
  - Fa0/1: Access VLAN 10 (Sales PC)
  - Fa0/2: Access VLAN 10, Voice VLAN 20 (IP Phone)
  - Gi0/1: 802.1Q Trunk to R-Branch (Allowed: 10,20)
<strong>802.1Q Native VLAN:</strong> VLAN 1 (Default)
<strong>VLAN Database:</strong>
  - VLAN 10: Sales (10.10.10.0/24)
  - VLAN 20: Voice (10.10.20.0/24)
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>switchport trunk allowed vlan add &lt;vlan&gt;</code> to specify active broadcast boundaries over trunks, protecting switch backplane performance.
  `,
  "r-branch": `
<strong style="color: #00f2fe; font-size: 13px;">🌐 Device: Branch Router R-Branch (ISR 4321)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>Router-on-a-Stick Subinterfaces:</strong>
  - Gi0/0.10 (VLAN 10): 10.10.10.1/24 (encapsulation dot1Q 10)
  - Gi0/0.20 (VLAN 20): 10.10.20.1/24 (encapsulation dot1Q 20)
<strong>EtherChannel LACP Config:</strong>
  - Port-Channel 1: Gi0/1, Gi0/2 (mode active)
  - IP Address Po1: 192.168.100.1/30
<strong>Crypto Map Config (VPN):</strong>
  - crypto map MYMAP 10 ipsec-isakmp
  - match address VPN_ACL (permit 10.10.10.0/24 to 172.16.100.0/24)
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>show interface port-channel 1</code> to audit bundle status, and <code>show crypto ipsec sa</code> to check active security tunnels.
  `,
  "hq-core": `
<strong style="color: #00f2fe; font-size: 13px;">🎛️ Device: HQ Core L3 Switch (Catalyst 3850)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>EtherChannel Config:</strong>
  - Port-Channel 1: Gi1/0/1, Gi1/0/2 (mode active - LACP)
  - IP Address: 192.168.100.2/30 (no switchport)
<strong>Routing Table (OSPF Area 0):</strong>
  - O 10.10.10.0/24 [110/2] via 192.168.100.1
  - C 172.16.100.0/24 is directly connected, Gi1/0/24
<strong>Inter-VLAN SVI Interfaces:</strong>
  - Interface VLAN 100: 172.16.100.1/24
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>show etherchannel summary</code> to audit LACP member ports. State code (P) means bundled, (D) means down/suspended.
  `,
  "fw-branch": `
<strong style="color: #00f2fe; font-size: 13px;">🔒 Device: HQ Firewall FW-Branch (ASA 5515)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>IPSec VPN Tunnel Configuration:</strong>
  - Crypto map outside_map 10 match VPN_ACL
  - Peer IP address: 192.0.2.1 (R-Branch outside IP)
  - Transform Set: ESP-AES-256 ESP-SHA-HMAC
<strong>Security Policies:</strong>
  - permit esp any any
  - permit udp any any eq 500 (ISAKMP)
  - permit udp any any eq 4500 (NAT Traversal)
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>show crypto isakmp sa</code> to inspect Phase 1 negotiation state (should read MM_ACTIVE).
  `,
  "hq-server": `
<strong style="color: #00f2fe; font-size: 13px;">🖥️ Device: HQ Server (Private Datacenter Host)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>IP Address:</strong> 172.16.100.5
<strong>Subnet Mask:</strong> 255.255.255.0
<strong>Default Gateway:</strong> 172.16.100.1 (HQ-Core switch)
<strong>Supported Services:</strong> HTTPS (443), SSH (22), Database (3306)
<strong>Access Policy:</strong> Private subnets only (VPN/Trunk routing required)
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Server hosting requires static routing or local gateway configuration. Audit with <code>netstat -ano</code> to view active listening ports.
  `
};

export function showOsiLayerDetail(layerNum) {
  const descBox = byId("osiLayerDescBox");
  if (!descBox) return;
  
  if (!window.currentOsiData) {
    descBox.innerHTML = `<span style="color: var(--text-muted); font-style: italic;">No active packet simulation. Run a simulation to inspect layers.</span>`;
    return;
  }
  
  const layerKey = "l" + layerNum;
  const data = window.currentOsiData[layerKey];
  
  if (data && data.val !== "-") {
    descBox.innerHTML = `
      <strong style="color: #00f2fe;">Layer ${layerNum} details:</strong><br/>
      <div style="margin-top: 4px; font-family: var(--font-mono); color: #a7f3d0; font-size:12px;">Field Value: ${data.val}</div>
      <div style="margin-top: 6px;">${data.desc}</div>
    `;
  } else {
    descBox.innerHTML = `
      <strong style="color: var(--text-muted);">Layer ${layerNum} details:</strong><br/>
      <div style="margin-top: 4px; font-style: italic;">Not applicable / Not encapsulated at this hop.</div>
    `;
  }
}
window.showOsiLayerDetail = showOsiLayerDetail;

export function updateOsiLabels(osiData) {
  const l4Val = byId("osi-l4-val");
  const l3Val = byId("osi-l3-val");
  const l2Val = byId("osi-l2-val");
  const l1Val = byId("osi-l1-val");
  
  if (!osiData) {
    if (l4Val) l4Val.textContent = "-";
    if (l3Val) l3Val.textContent = "-";
    if (l2Val) l2Val.textContent = "-";
    if (l1Val) l1Val.textContent = "-";
    return;
  }
  
  if (l4Val) l4Val.textContent = osiData.l4 ? osiData.l4.val : "-";
  if (l3Val) l3Val.textContent = osiData.l3 ? osiData.l3.val : "-";
  if (l2Val) l2Val.textContent = osiData.l2 ? osiData.l2.val : "-";
  if (l1Val) l1Val.textContent = osiData.l1 ? osiData.l1.val : "-";
}
window.updateOsiLabels = updateOsiLabels;

export function highlightNode(nodeId, isBlocked = false) {
  const nodes = ["pc", "switch", "router", "firewall", "wan", "pc-sales", "ip-phone", "sw-branch", "r-branch", "hq-core", "fw-branch", "hq-server"];
  nodes.forEach(n => {
    const el = byId(`node-${n}`);
    if (el) {
      if (n === nodeId) {
        el.setAttribute("stroke-width", "4");
        if (isBlocked) {
          el.setAttribute("fill", "rgba(255, 94, 58, 0.25)");
          el.setAttribute("stroke", "var(--color-error)");
        } else {
          el.setAttribute("fill", "rgba(0, 242, 254, 0.2)");
          let origStroke = "#00f2fe";
          if (n === "router" || n === "wan" || n === "r-branch" || n === "hq-core" || n === "hq-server") {
            origStroke = "var(--color-ok)";
          } else if (n === "firewall" || n === "fw-branch") {
            origStroke = "var(--color-error)";
          }
          el.setAttribute("stroke", origStroke);
        }
      } else {
        el.setAttribute("stroke-width", "2");
        el.setAttribute("fill", "#060913");
        let origStroke = "#00f2fe";
        if (n === "router" || n === "wan" || n === "r-branch" || n === "hq-core" || n === "hq-server") {
          origStroke = "var(--color-ok)";
        } else if (n === "firewall" || n === "fw-branch") {
          origStroke = "var(--color-error)";
        }
        el.setAttribute("stroke", origStroke);
      }
    }
  });
}

export function renderCLI(nodeName) {
  const container = byId("nodeConfigContent");
  if (!container) return;

  const isTrouble = byId("chkTroubleshooting")?.checked;
  const currentPacketType = byId("simPacketType")?.value;
  const bug = bugsData[currentPacketType];

  if (isTrouble && bug && bug.node === nodeName && !state.simBugsFixed[currentPacketType]) {
    let optionsHtml = bug.options.map((opt, idx) => `
      <option value="${idx}">${opt.label}</option>
    `).join("");

    container.innerHTML = `
      <div style="background:#090d16; border:1px solid #ff5e3a; padding:12px; border-radius:8px;">
        <div style="color:#ff5e3a; font-weight:bold; margin-bottom:6px; font-size:13px; text-transform:uppercase;">⚠ TROUBLESHOOTING INJECTOR - ${nodeName.toUpperCase()}</div>
        <p style="margin:0 0 10px 0; color:#cbd5e1; font-size:12.5px;">${bug.desc}</p>
        <div style="background:#000; padding:8px; border-radius:4px; font-family:var(--font-mono); color:#f87171; font-size:11px; margin-bottom:12px; white-space:pre-wrap;">% Error Log: ${bug.errorLog}</div>
        
        <div style="display:flex; flex-direction:column; gap:8px;">
          <label style="font-size:11px; color:#94a3b8; font-weight:bold;">Select correct Cisco configuration to apply:</label>
          <select id="cliTroubleFixSelect" style="width:100%; font-family:var(--font-mono); font-size:11px; background:#111827; border:1px solid #374151; color:#fff; padding:6px; border-radius:6px;">
            ${optionsHtml}
          </select>
          <button id="btnApplyTroubleFix" class="primary" style="align-self:flex-start; margin-top:4px; padding:6px 14px; font-size:11.5px; border-radius:6px;">Apply Configuration</button>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:14px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:12px;">
          <label style="font-size:11px; color:#94a3b8; font-weight:bold;">Or type the exact Cisco configuration command manually (supports aliases like "int gi0/0"):</label>
          <input type="text" id="cliTroubleTypedInput" placeholder="e.g. interface GigabitEthernet0/0/0" style="width:100%; font-family:var(--font-mono); font-size:11px; background:#111827; border:1px solid #374151; color:#fff; padding:6px; border-radius:6px;" />
          <button id="btnApplyTypedTroubleFix" class="secondary" style="align-self:flex-start; padding:6px 14px; font-size:11.5px; border-radius:6px;">Submit Command</button>
        </div>
        
        <div id="cliTroubleResult" style="margin-top:12px; font-family:var(--font-mono); font-size:11px; white-space:pre-wrap; display:none;"></div>
      </div>
    `;

    const btnApply = byId("btnApplyTroubleFix");
    if (btnApply) {
      btnApply.addEventListener("click", () => {
        const select = byId("cliTroubleFixSelect");
        const selectedIdx = select.value;
        const option = bug.options[selectedIdx];
        const resultDiv = byId("cliTroubleResult");

        if (option.correct) {
          playNetSound("success");
          state.simBugsFixed[currentPacketType] = true;
          
          if (resultDiv) {
            resultDiv.style.display = "block";
            resultDiv.style.color = "#10b981";
            resultDiv.innerHTML = `
${nodeName.toUpperCase()}# configure terminal
Enter configuration commands, one per line. End with CNTL/Z.
${nodeName.toUpperCase()}(config)# ${option.cmd.trim().replace(/\n/g, '\n' + nodeName.toUpperCase() + '(config)# ')}
${nodeName.toUpperCase()}(config)# end
${nodeName.toUpperCase()}# write memory
% Building configuration...
% [OK] Configuration applied successfully. Status: synchronized.
✔ Bug resolved! +30 XP rewarded.
            `;
          }
          
          gainXP(30);
          
          setTimeout(() => {
            renderCLI(nodeName);
          }, 2500);
        } else {
          playNetSound("block");
          if (resultDiv) {
            resultDiv.style.display = "block";
            resultDiv.style.color = "#ff5e3a";
            resultDiv.innerHTML = `
${nodeName.toUpperCase()}# configure terminal
${nodeName.toUpperCase()}(config)# ${option.cmd.trim().replace(/\n/g, '\n' + nodeName.toUpperCase() + '(config)# ')}
% Invalid command configuration. Rejected by Cisco IOS CLI syntax analyzer.
            `;
          }
        }
      });
    }

    const btnApplyTyped = byId("btnApplyTypedTroubleFix");
    if (btnApplyTyped) {
      btnApplyTyped.addEventListener("click", () => {
        const typedInput = byId("cliTroubleTypedInput");
        const val = typedInput.value.trim().toLowerCase();
        const resultDiv = byId("cliTroubleResult");
        if (!val) return;
        
        const correctOption = bug.options.find(o => o.correct);
        if (!correctOption) return;
        
        const cleanTyped = val.replace(/\s+/g, " ")
                            .replace(/^interface\s/, "int ")
                            .replace(/^gigabitethernet/, "gi")
                            .replace(/^fastethernet/, "fa")
                            .replace(/^ethernet/, "eth")
                            .replace(/^shutdown/, "shut")
                            .replace(/^no shutdown/, "no shut");
                            
        const cleanCorrect = correctOption.cmd.toLowerCase().replace(/\s+/g, " ")
                            .replace(/^interface\s/, "int ")
                            .replace(/^gigabitethernet/, "gi")
                            .replace(/^fastethernet/, "fa")
                            .replace(/^ethernet/, "eth")
                            .replace(/^shutdown/, "shut")
                            .replace(/^no shutdown/, "no shut");
                            
        const typedLines = cleanTyped.split(/\s*\\n\s*|\s*\n\s*/);
        const correctLines = cleanCorrect.split(/\s*\\n\s*|\s*\n\s*/);
        
        let allMatch = typedLines.length === correctLines.length && typedLines.every((line, idx) => {
          return line.trim() === correctLines[idx].trim();
        });
        
        if (allMatch) {
          playNetSound("success");
          state.simBugsFixed[currentPacketType] = true;
          if (resultDiv) {
            resultDiv.style.display = "block";
            resultDiv.style.color = "#10b981";
            resultDiv.innerHTML = `
${nodeName.toUpperCase()}# configure terminal
Enter configuration commands, one per line. End with CNTL/Z.
${nodeName.toUpperCase()}(config)# ${correctOption.cmd.trim().replace(/\n/g, '\n' + nodeName.toUpperCase() + '(config)# ')}
${nodeName.toUpperCase()}(config)# end
${nodeName.toUpperCase()}# write memory
% Building configuration...
% [OK] Configuration applied successfully. Status: synchronized.
✔ Bug resolved! +30 XP rewarded.
            `;
          }
          gainXP(30);
          setTimeout(() => { renderCLI(nodeName); }, 2500);
        } else {
          playNetSound("block");
          if (resultDiv) {
            resultDiv.style.display = "block";
            resultDiv.style.color = "#ff5e3a";
            resultDiv.innerHTML = `% Invalid command: "${safeHTML(typedInput.value)}"\nRejected by Cisco IOS CLI parser. (Hint: check correct command syntax/options)`;
          }
        }
      });
    }
  } else {
    const cmdList = cliOutputs[nodeName];
    if (!cmdList) {
      container.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
          <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:12px; border-radius:8px;">
            ${deviceConfigs[nodeName] || 'No configuration data available.'}
          </div>
          <div style="background:#090d16; border:1px solid rgba(255,255,255,0.08); padding:12px; border-radius:8px; display:flex; justify-content:center; align-items:center; color:var(--text-muted); font-style:italic; font-size:11.5px;">
            CLI terminal access disabled / not supported on WAN endpoints.
          </div>
        </div>
      `;
      return;
    }

    const commandOptions = Object.keys(cmdList).map(cmd => `
      <option value="${cmd}">${cmd}</option>
    `).join("");

    container.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
        <!-- Left: Static Config Info -->
        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:12px; border-radius:8px; font-size:11.5px; line-height:1.5; color:#94a3b8;">
          ${deviceConfigs[nodeName] || 'No configuration data available.'}
        </div>
        
        <!-- Right: Interactive CLI Console -->
        <div style="background:#090d16; border:1px solid rgba(255,255,255,0.08); padding:12px; border-radius:8px; display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:#00f2fe; font-size:12px;">Cisco IOS CLI - ${nodeName.toUpperCase()}</strong>
            <span style="font-family:var(--font-mono); font-size:10.5px; color:#10b981;">STATUS: Online</span>
          </div>
          
          <div style="display:flex; gap:8px; align-items:center;">
            <span style="font-family:var(--font-mono); font-size:11px; color:#cbd5e1;">${nodeName.toUpperCase()}#</span>
            <select id="cliCommandSelect" style="flex:1; font-family:var(--font-mono); font-size:11px; background:#111827; border:1px solid #374151; color:#fff; padding:6px; border-radius:6px;">
              <option value="">-- Run show command --</option>
              ${commandOptions}
            </select>
          </div>

          <div id="cliOutputTerminal" style="background:#000; border:1px solid rgba(255,255,255,0.05); padding:10px; border-radius:6px; font-family:var(--font-mono); color:#a7f3d0; font-size:11px; height:120px; overflow-y:auto; white-space:pre-wrap;">${nodeName.toUpperCase()}# </div>
        </div>
      </div>
    `;

    const select = byId("cliCommandSelect");
    const terminal = byId("cliOutputTerminal");
    if (select && terminal) {
      select.addEventListener("change", () => {
        const cmd = select.value;
        if (!cmd) {
          terminal.innerHTML = `${nodeName.toUpperCase()}# `;
          return;
        }
        playNetSound("click");
        const output = cmdList[cmd];
        terminal.innerHTML = `${nodeName.toUpperCase()}# ${cmd}\n${output}`;
        terminal.scrollTop = terminal.scrollHeight;
      });
    }
  }
}

export function setupNodeConfigInspector() {
  const nodes = document.querySelectorAll(".topo-node");
  if (!nodes) return;

  nodes.forEach(node => {
    node.addEventListener("click", () => {
      playNetSound("click");
      const nodeName = node.getAttribute("data-node");
      state.inspectedNode = nodeName;
      
      document.querySelectorAll(".topo-node").forEach(el => {
        el.classList.remove("inspected");
      });
      node.classList.add("inspected");
      setTimeout(() => {
        node.classList.remove("inspected");
      }, 1500);

      renderCLI(nodeName);
    });
  });
}

export function resetTopology2Links() {
  const link1 = byId("link-rbranch-hq1");
  const link2 = byId("link-rbranch-hq2");
  if (link1) {
    link1.setAttribute("stroke", "#10b981");
    link1.setAttribute("stroke-width", "2");
  }
  if (link2) {
    link2.setAttribute("stroke", "#10b981");
    link2.setAttribute("stroke-width", "2");
  }
  const statusLink1 = byId("status-lacp-link1");
  if (statusLink1) {
    statusLink1.setAttribute("fill", "#10b981");
  }
}

export function switchTopology(topoNum) {
  activeTopology = topoNum;
  playNetSound("click");
  
  const btnStart = byId("btnStartSim");
  const btnTopo1 = byId("btnTopo1");
  const btnTopo2 = byId("btnTopo2");
  const svg1 = byId("topoSvg");
  const svg2 = byId("topoSvg2");
  const logContent = byId("simLogContent");

  if (btnStart) btnStart.disabled = false;
  const pkt1 = byId("simPacket");
  const pkt2 = byId("simPacket2");
  if (pkt1) pkt1.style.opacity = "0";
  if (pkt2) pkt2.style.opacity = "0";
  
  if (logContent) logContent.innerHTML = "<div>System Ready. Select a packet simulation and click 'Run Simulation'.</div>";
  window.currentOsiData = null;
  window.updateOsiLabels?.(null);
  const descBox = byId("osiLayerDescBox");
  if (descBox) {
    descBox.innerHTML = `<span style="color: var(--text-muted); font-style: italic;">Run a simulation and click any OSI layer tab above to inspect the active hop encapsulation details.</span>`;
  }
  document.querySelectorAll(".osi-layer").forEach(el => el.classList.remove("active"));
  highlightNode(null);
  resetTopology2Links();

  if (activeTopology === 1) {
    if (svg1) svg1.style.display = "block";
    if (svg2) svg2.style.display = "none";
    if (btnTopo1) { btnTopo1.className = "primary"; }
    if (btnTopo2) { btnTopo2.className = "secondary"; }
  } else {
    if (svg1) svg1.style.display = "none";
    if (svg2) svg2.style.display = "block";
    if (btnTopo1) { btnTopo1.className = "secondary"; }
    if (btnTopo2) { btnTopo2.className = "primary"; }
  }
  
  updatePacketTypeSelect();
}

function updatePacketTypeSelect() {
  const select = byId("simPacketType");
  if (!select) return;
  select.innerHTML = "";
  
  if (activeTopology === 1) {
    select.innerHTML = `
      <option value="dhcp">DHCP Request (Broadcast Drill)</option>
      <option value="ping">ICMP Echo Request (Ping to 8.8.8.8)</option>
      <option value="nat">HTTP Web Request (NAT Overload PAT)</option>
      <option value="stp">STP BPDU Frame (Switch STP Election)</option>
      <option value="arp">ARP Request/Reply (MAC Address Resolution)</option>
      <option value="ospf">OSPF Hello Adjacency (Link State Update)</option>
      <option value="acl">Firewall ACL Block (Telnet Access Denied)</option>
    `;
  } else {
    select.innerHTML = `
      <option value="roas">Router-on-a-Stick (ROAS Inter-VLAN Routing)</option>
      <option value="lacp">LACP EtherChannel (Link Bundling & Failover)</option>
      <option value="vpn">IPSec VPN Tunnel (Site-to-Site Encapsulation)</option>
    `;
  }
}

export function setupTraversalSimulator() {
  const btnStart = byId("btnStartSim");
  const btnReset = byId("btnResetSim");
  const logContent = byId("simLogContent");
  
  const btnTopo1 = byId("btnTopo1");
  const btnTopo2 = byId("btnTopo2");
  const svg1 = byId("topoSvg");
  const svg2 = byId("topoSvg2");

  if (!btnStart || !btnReset || !logContent) return;

  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  setupNodeConfigInspector();

  // OSI Stack click handlers
  document.querySelectorAll(".osi-layer").forEach(layerEl => {
    layerEl.addEventListener("click", () => {
      playNetSound("click");
      document.querySelectorAll(".osi-layer").forEach(el => el.classList.remove("active"));
      layerEl.classList.add("active");
      const layerNum = layerEl.getAttribute("data-layer");
      if (window.showOsiLayerDetail) window.showOsiLayerDetail(layerNum);
    });
  });

  if (btnTopo1) btnTopo1.addEventListener("click", () => switchTopology(1));
  if (btnTopo2) btnTopo2.addEventListener("click", () => switchTopology(2));

  btnStart.addEventListener("click", async () => {
    btnStart.disabled = true;
    const type = byId("simPacketType").value;
    const activePkt = activeTopology === 1 ? byId("simPacket") : byId("simPacket2");
    if (!activePkt) return;

    resetTopology2Links();

    const isTrouble = byId("chkTroubleshooting")?.checked;
    const bug = bugsData[type];
    const isBugActive = isTrouble && bug && !state.simBugsFixed[type];

    let path = [];
    if (type === "dhcp") {
      path = [
        {
          node: "pc", x: 80, y: 140, name: "Host PC", color: "#00f2fe",
          headers: "L2: Broadcast | L3: 0.0.0.0 -> 255.255.255.255 | UDP: 68 -> 67",
          desc: "Host PC has no IP address yet. It broadcasts a <strong>DHCPDISCOVER</strong> packet out of its interface to request local configurations.",
          osi: {
            l4: { val: "UDP 68 -> 67", desc: "UDP Transport layer: Client port 68 communicates with server port 67." },
            l3: { val: "0.0.0.0 -> 255.255.255.255", desc: "IP Network layer: Source is 0.0.0.0 (DHCP client holds no IP) and Destination is 255.255.255.255 (local broadcast)." },
            l2: { val: "0050.7966.6800 -> FFFF.FFFF.FFFF", desc: "Ethernet Data Link layer: Frame carries source MAC address and targets the broadcast address FFFF.FFFF.FFFF." },
            l1: { val: "Copper Ethernet (Fa0/1)", desc: "Physical Layer: Electrical signals travel through Cat6 Twisted Pair copper wiring at 100 Mbps (Full Duplex)." }
          }
        },
        {
          node: "switch", x: 240, y: 140, name: "Switch SW-1", color: "#00f2fe",
          headers: "L2: Broadcast MAC | VLAN: Tag 10",
          desc: "SW-1 receives the Layer 2 broadcast. Since it is a broadcast MAC destination, the switch floods the frame out all active access ports within VLAN 10.",
          osi: {
            l4: { val: "UDP 68 -> 67", desc: "UDP segment remains encapsulated inside the IP packet." },
            l3: { val: "0.0.0.0 -> 255.255.255.255", desc: "Layer 3 payload is not examined by the Layer 2 switch." },
            l2: { val: "0050.7966.6800 -> FFFF.FFFF.FFFF", desc: "SW-1 checks its MAC table. Finding a broadcast destination, it floods the frame to all active ports on VLAN 10." },
            l1: { val: "Trunk Link (Gi0/1)", desc: "Trunk connection transmits frame with an 802.1Q tag identifying it as VLAN 10." }
          }
        },
        {
          node: "router", x: 400, y: 80, name: "Core Router R-1", color: "#10b981",
          headers: "L2: Router Interface -> Unicast Gateway | L3: 192.168.1.1 -> 10.10.10.1",
          desc: "R-1 intercepts the broadcast. Since <code>ip helper-address 10.10.10.1</code> is configured, R-1 decapsulates the L2 broadcast, updates Src/Dst IPs, and routes it to the WAN as a unicast packet.",
          osi: {
            l4: { val: "UDP 67 -> 67", desc: "UDP layer: R-1 decapsulates the packet and acts as a DHCP Relay agent (helper address)." },
            l3: { val: "192.168.1.1 -> 10.10.10.1", desc: "R-1 updates the Source IP to its gateway IP (192.168.1.1) and unicasts the packet to the DHCP Server (10.10.10.1)." },
            l2: { val: "0011.2233.4455 -> WAN MAC", desc: "Data Link Layer: Re-encapsulated with WAN interface Source MAC and WAN Gateway Destination MAC." },
            l1: { val: "Gigabit WAN (Gi0/2)", desc: "Physical transmission: Fiber/Copper carrier link towards WAN Gateway." }
          }
        },
        {
          node: "wan", x: 600, y: 140, name: "WAN Gateway", color: "#10b981",
          headers: "L2: Unicast WAN | L3: 10.10.10.1 -> 10.10.10.10 | UDP: 67 -> 68",
          desc: "The DHCP server receives the request, reserves an IP, and replies back with a <strong>DHCPOFFER</strong>. The configuration returns back along the path.",
          osi: {
            l4: { val: "UDP 67 -> 68", desc: "The DHCP server processes the request, reserves an IP config, and replies with a DHCPOFFER segment." },
            l3: { val: "10.10.10.10 -> 192.168.1.1", desc: "IP Layer: Source is Server (10.10.10.10) and Destination is R-1's relay IP (192.168.1.1)." },
            l2: { val: "WAN MAC -> 0011.2233.4455", desc: "WAN Layer 2 encapsulation handles unicast forwarding back to the router's outside WAN interface." },
            l1: { val: "WAN Carrier", desc: "Physical: Transit across public WAN infrastructure." }
          }
        }
      ];
    } else if (type === "ping") {
      path = [
        {
          node: "pc", x: 80, y: 140, name: "Host PC", color: "#00f2fe",
          headers: "L2: Unicast Gateway | L3: 192.168.1.10 -> 8.8.8.8 | ICMP: Type 8 Code 0",
          desc: "Host PC initiates an ICMP Echo Request (Ping) to Google DNS. Since the destination is on a foreign subnet, the PC targets the default gateway MAC address.",
          osi: {
            l4: { val: "ICMP Type 8 Code 0", desc: "ICMP Protocol: Echo Request packet created to verify end-to-end IP reachability." },
            l3: { val: "192.168.1.10 -> 8.8.8.8", desc: "IP Layer: Dest IP (8.8.8.8) is outside local subnet; routing table targets default gateway 192.168.1.1." },
            l2: { val: "0050.7966.6800 -> 0011.2233.4455", desc: "Ethernet Frame: Source MAC is Host, Destination MAC is R-1's gateway interface (resolved via ARP)." },
            l1: { val: "Copper Ethernet (Fa0/1)", desc: "Physical Layer: Tx over copper Cat5e cabling." }
          }
        },
        {
          node: "switch", x: 240, y: 140, name: "Switch SW-1", color: "#00f2fe",
          headers: "L2: Forwarding to R-1 Uplink",
          desc: "SW-1 queries its MAC address table. It finds R-1's MAC address on the uplink trunk interface and forwards the frame directly.",
          osi: {
            l4: { val: "ICMP Type 8 Code 0", desc: "ICMP payload is carried transparently." },
            l3: { val: "192.168.1.10 -> 8.8.8.8", desc: "Layer 3 IP headers are unread by the bridge." },
            l2: { val: "0050.7966.6800 -> 0011.2233.4455", desc: "SW-1 checks its MAC table. Finds R-1's MAC on Gi0/1 and forwards the frame directly." },
            l1: { val: "Trunk Link (Gi0/1)", desc: "Physical: Gigabit Ethernet uplink trunk." }
          }
        },
        {
          node: "router", x: 400, y: 80, name: "Core Router R-1", color: "#10b981",
          headers: "L3: Route Lookup LPM | WAN Interface",
          desc: "R-1 decapsulates Layer 2. It performs a Routing Table lookup. Finding a route for 8.8.8.8/32 via OSPF/Static towards WAN, it re-encapsulates the frame and sends it.",
          osi: {
            l4: { val: "ICMP Type 8 Code 0", desc: "ICMP payload is carried transparently." },
            l3: { val: "192.168.1.10 -> 8.8.8.8", desc: "R-1 decapsulates L2, performs LPM route lookup, matches default route 0.0.0.0/0 via Gi0/1 WAN interface." },
            l2: { val: "0011.2233.4455 -> ISP MAC", desc: "L2 header rewritten: Source is R-1 WAN MAC, Destination is next-hop ISP gateway MAC." },
            l1: { val: "Fiber WAN (Gi0/1)", desc: "Physical: WAN optical transceiver conversion." }
          }
        },
        {
          node: "wan", x: 600, y: 140, name: "WAN Server", color: "#10b981",
          headers: "L3: 8.8.8.8 -> 192.168.1.10 | ICMP: Type 0 Code 0 (Echo Reply)",
          desc: "Google Server processes the ping request and replies back with an <strong>ICMP Echo Reply</strong>, returning the expected <code>!!!!!</code> output in the console.",
          osi: {
            l4: { val: "ICMP Type 0 Code 0", desc: "ICMP Protocol: Server receives Echo Request and responds with an Echo Reply." },
            l3: { val: "8.8.8.8 -> 192.168.1.10", desc: "IP Layer: Source is 8.8.8.8, Destination is the PC IP (returning back through NAT/PAT router)." },
            l2: { val: "ISP MAC -> 0011.2233.4455", desc: "Data Link: Framed for return delivery to the Router's WAN interface." },
            l1: { val: "WAN Fiber", desc: "Physical: Optical link transit." }
          }
        }
      ];
    } else if (type === "nat") {
      path = [
        {
          node: "pc", x: 80, y: 140, name: "Host PC", color: "#00f2fe",
          headers: "L3: 192.168.1.10 -> 8.8.8.8 | TCP Src Port 49152 -> Dst Port 80 (HTTP)",
          desc: "PC requests a webpage. It allocates a random private source port (49152) and initiates a TCP handshake request.",
          osi: {
            l4: { val: "TCP 49152 -> 80", desc: "TCP Layer: Random high-source port 49152 initiates a 3-way handshake (SYN) to HTTP port 80." },
            l3: { val: "192.168.1.10 -> 8.8.8.8", desc: "IP Layer: Private inside source IP targeted to public web server." },
            l2: { val: "0050.7966.6800 -> 0011.2233.4455", desc: "Ethernet Frame directed to default gateway." },
            l1: { val: "Copper Ethernet (Fa0/1)", desc: "Physical Layer: Local LAN copper cabling." }
          }
        },
        {
          node: "switch", x: 240, y: 140, name: "Switch SW-1", color: "#00f2fe",
          headers: "L2: Forwarding to R-1",
          desc: "SW-1 forwards the frame directly towards the Core Router gateway port.",
          osi: {
            l4: { val: "TCP 49152 -> 80", desc: "TCP segment encapsulated." },
            l3: { val: "192.168.1.10 -> 8.8.8.8", desc: "IP header untouched." },
            l2: { val: "0050.7966.6800 -> 0011.2233.4455", desc: "Forwarded via MAC table entry for R-1." },
            l1: { val: "Uplink trunk", desc: "Physical: LAN uplink." }
          }
        },
        {
          node: "router", x: 400, y: 80, name: "Core Router R-1", color: "#10b981",
          headers: "L3 NAT Translation: 192.168.1.10:49152 -> 192.168.1.2:1024 | TCP Src Port translated to 1024",
          desc: "R-1 performs <strong>Network Address Translation (NAT Overload/PAT)</strong>. It translates the private source IP to the public WAN IP, and maps the port to 1024 to support multiple internal hosts.",
          osi: {
            l4: { val: "TCP 1024 -> 80", desc: "TCP Layer: Source Port translated from 49152 to 1024 (PAT) to uniquely map the local host." },
            l3: { val: "192.168.1.2 -> 8.8.8.8", desc: "IP Layer: Source IP translated from Private (192.168.1.10) to Router WAN Public IP (192.168.1.2)." },
            l2: { val: "0011.2233.4455 -> ISP MAC", desc: "Ethernet: Rewritten with WAN Source MAC." },
            l1: { val: "WAN Uplink", desc: "Physical: WAN transmission." }
          }
        },
        {
          node: "wan", x: 600, y: 140, name: "WAN Web Server", color: "#10b981",
          headers: "L3: 8.8.8.8 -> 192.168.1.2 | L4: TCP Src 80 -> Dst 1024",
          desc: "The public server receives the request, processes the TCP segment, and responds back to public gateway IP 192.168.1.2. R-1 will translate this back to the private host.",
          osi: {
            l4: { val: "TCP 80 -> 1024", desc: "TCP Layer: Web Server replies with TCP SYN-ACK segment to translated port 1024." },
            l3: { val: "8.8.8.8 -> 192.168.1.2", desc: "IP Layer: Destined to the Router's public IP address. R-1 will translate it back to the PC." },
            l2: { val: "ISP MAC -> WAN MAC", desc: "Data Link: Unicast delivery to router's outside MAC." },
            l1: { val: "WAN Carrier", desc: "Physical: Public WAN transit." }
          }
        }
      ];
    } else if (type === "stp") {
      path = [
        {
          node: "pc", x: 80, y: 140, name: "Host PC", color: "#ff5e3a",
          headers: "STP Status: Edge Port (PortFast)",
          desc: "PC does not process Spanning Tree BPDUs. The switch port is configured with PortFast to transition immediately to the forwarding state.",
          osi: {
            l4: { val: "-", desc: "Not applicable: Spanning Tree operates at Layer 2." },
            l3: { val: "-", desc: "Not applicable: STP does not use Layer 3 IP routing." },
            l2: { val: "-", desc: "STP PortFast: Host PC interface immediately bypasses Listening/Learning states to prevent DHCP timeouts." },
            l1: { val: "Ethernet copper", desc: "Physical: Link remains active." }
          }
        },
        {
          node: "switch", x: 240, y: 140, name: "Switch SW-1", color: "#00f2fe",
          headers: "L2 BPDU Multicast: 0180.C200.0000 | STP Role: ROOT BRIDGE",
          desc: "SW-1 periodically generates STP BPDUs. Having the lowest Bridge ID, SW-1 is elected as the Root Bridge for VLAN 10.",
          osi: {
            l4: { val: "-", desc: "Not applicable." },
            l3: { val: "-", desc: "Not applicable." },
            l2: { val: "BPDU Bridge Priority 32768", desc: "SW-1 transmits Configuration Bridge Protocol Data Units (BPDUs) to multicast MAC 0180.C200.0000. It claims to be Root Bridge." },
            l1: { val: "Trunk link (Gi0/2)", desc: "Physical: BPDU frames broadcasted out trunk interface." }
          }
        },
        {
          node: "firewall", x: 400, y: 200, name: "Firewall FW-1", color: "#ff5e3a",
          headers: "STP Role: Blocking Port / Non-Root Port",
          desc: "FW-1's backup interface receives the BPDU. To prevent a physical loop in the network, STP transitions this interface to the <strong>Blocking</strong> state.",
          osi: {
            l4: { val: "-", desc: "Not applicable." },
            l3: { val: "-", desc: "Not applicable." },
            l2: { val: "BPDU Blocked", desc: "FW-1's backup interface receives the BPDU. To prevent a physical loop, the interface transitions to the BLOCKING state." },
            l1: { val: "Trunk link", desc: "Physical: Blocking applied logically at port interface." }
          }
        }
      ];
    } else if (type === "arp") {
      path = [
        {
          node: "pc", x: 80, y: 140, name: "Host PC", color: "#00f2fe",
          headers: "L2: MAC Broadcast | L3: ARP Request",
          desc: "Host PC needs to send a packet to a remote address, but doesn't know its gateway's MAC address. It broadcasts an **ARP Request**.",
          osi: {
            l4: { val: "-", desc: "Not applicable: ARP handles IP-to-MAC resolution and has no L4 transport header." },
            l3: { val: "ARP Request (Target IP: 192.168.1.1)", desc: "ARP Protocol: Query payload asking for the MAC address associated with gateway IP 192.168.1.1." },
            l2: { val: "0050.7966.6800 -> FFFF.FFFF.FFFF", desc: "Data Link: Frame sent to Broadcast MAC (FFFF.FFFF.FFFF) to reach all nodes in the local broadcast domain." },
            l1: { val: "Copper Ethernet (Fa0/1)", desc: "Physical: Electrical signals transmitted over Cat6 copper wire." }
          }
        },
        {
          node: "switch", x: 240, y: 140, name: "Switch SW-1", color: "#00f2fe",
          headers: "L2: Flood Broadcast | VLAN: Tag 10",
          desc: "SW-1 receives the broadcast frame, learns Host's MAC on port Fa0/1, and floods the frame out all ports in VLAN 10.",
          osi: {
            l4: { val: "-", desc: "Not applicable." },
            l3: { val: "ARP Request (Target IP: 192.168.1.1)", desc: "ARP request payload unchanged." },
            l2: { val: "0050.7966.6800 -> FFFF.FFFF.FFFF", desc: "SW-1 receives the broadcast frame, learns Host's MAC on port Fa0/1, and floods the frame out all ports in VLAN 10." },
            l1: { val: "Trunk Link (Gi0/1)", desc: "Trunk link transmits frame with VLAN 10 802.1Q header tag." }
          }
        },
        {
          node: "router", x: 400, y: 80, name: "Core Router R-1", color: "#10b981",
          headers: "L2: MAC Unicast Reply | L3: ARP Reply",
          desc: "R-1 identifies itself as the owner of 192.168.1.1 and replies back with an **ARP Reply** containing its MAC address.",
          osi: {
            l4: { val: "-", desc: "Not applicable." },
            l3: { val: "ARP Reply (Sender IP: 192.168.1.1)", desc: "ARP Protocol: R-1 identifies itself as the owner of 192.168.1.1 and compiles an ARP Reply payload." },
            l2: { val: "0011.2233.4455 -> 0050.7966.6800", desc: "Data Link: Frame is unicast directly back to the Host PC MAC address since its location is now known." },
            l1: { val: "Gigabit Ethernet (Gi0/0)", desc: "Physical: Fast transmission over router copper interface." }
          }
        },
        {
          node: "switch", x: 240, y: 140, name: "Switch SW-1", color: "#10b981",
          headers: "L2: Forwarding Unicast Reply",
          desc: "SW-1 checks its MAC table, finds the PC on Fa0/1, and forwards the ARP Reply directly to the PC.",
          osi: {
            l4: { val: "-", desc: "Not applicable." },
            l3: { val: "ARP Reply (Sender IP: 192.168.1.1)", desc: "ARP payload remains encapsulated." },
            l2: { val: "0011.2233.4455 -> 0050.7966.6800", desc: "SW-1 checks its MAC table. Finds 0050.7966.6800 is on port Fa0/1, and forwards the frame only to that port." },
            l1: { val: "Access Link (Fa0/1)", desc: "Physical: Sent down local port Fa0/1 towards Host." }
          }
        },
        {
          node: "pc", x: 80, y: 140, name: "Host PC", color: "#10b981",
          headers: "ARP Cache Updated",
          desc: "The Host PC decapsulates the reply and updates its local ARP table. It can now send unicast packets.",
          osi: {
            l4: { val: "-", desc: "Not applicable." },
            l3: { val: "ARP Reply Processed", desc: "ARP Protocol: PC decapsulates the reply and updates its local ARP Cache table (associates 192.168.1.1 with 0011.2233.4455)." },
            l2: { val: "0011.2233.4455 -> 0050.7966.6800", desc: "Data Link: Unicast frame successfully received and verified." },
            l1: { val: "Copper Ethernet", desc: "Physical: Host NIC receives electrical signals." }
          }
        }
      ];
    } else if (type === "ospf") {
      path = [
        {
          node: "router", x: 400, y: 80, name: "Core Router R-1", color: "#10b981",
          headers: "L2: Multicast MAC | L3: Multicast 224.0.0.5 | OSPF Hello",
          desc: "R-1 multicasts an **OSPF Hello** packet to discover potential neighbors on the local segment. It uses multicast IP 224.0.0.5.",
          osi: {
            l4: { val: "OSPF Protocol 89", desc: "Transport Layer: OSPF runs directly over IP (IP Protocol 89). Sends an OSPF Hello packet." },
            l3: { val: "192.168.1.1 -> 224.0.0.5", desc: "IP Layer: Source IP is R-1, Destination is multicast 224.0.0.5 (All OSPF Routers)." },
            l2: { val: "0011.2233.4455 -> 0100.5E00.0005", desc: "Data Link: IP multicast 224.0.0.5 maps to OSPF multicast MAC 0100.5E00.0005." },
            l1: { val: "Trunk Link (Gi0/1)", desc: "Physical: Gigabit uplink interface." }
          }
        },
        {
          node: "switch", x: 240, y: 140, name: "Switch SW-1", color: "#10b981",
          headers: "L2: OSPF Multicast Forwarding",
          desc: "SW-1 forwards the OSPF multicast packet out all ports participating in OSPF Area 0.",
          osi: {
            l4: { val: "OSPF Protocol 89", desc: "OSPF payload remains encapsulated." },
            l3: { val: "192.168.1.1 -> 224.0.0.5", desc: "IP header untouched." },
            l2: { val: "0011.2233.4455 -> 0100.5E00.0005", desc: "SW-1 forwards OSPF multicast frames to all ports participating in OSPF Area 0." },
            l1: { val: "Trunk Link (Gi0/2)", desc: "Physical: Forwarded out the interface leading to FW-1." }
          }
        },
        {
          node: "firewall", x: 400, y: 200, name: "Firewall FW-1", color: "#ff5e3a",
          headers: "L3: OSPF Adjacency Established",
          desc: "FW-1 validates area configuration parameters, and replies with its Hello packet. Bidirectional relationship (2-WAY state) is established.",
          osi: {
            l4: { val: "OSPF Hello Reply", desc: "OSPF Protocol: FW-1 processes the Hello packet, validates area configurations, and replies with its Hello packet." },
            l3: { val: "192.168.1.254 -> 224.0.0.5", desc: "IP Layer: FW-1 sends OSPF Hello back to multicast address 224.0.0.5." },
            l2: { val: "55aa.bbcc.ddee -> 0100.5E00.0005", desc: "Data Link: Multicast MAC addressing is used to target all neighboring OSPF routers." },
            l1: { val: "Gigabit Link", desc: "Physical: Signals travel over firewall interface." }
          }
        }
      ];
    } else if (type === "acl") {
      path = [
        {
          node: "pc", x: 80, y: 140, name: "Host PC", color: "#00f2fe",
          headers: "L3: 192.168.1.10 -> 8.8.8.8 | TCP Dst Port 23 (Telnet)",
          desc: "Host PC attempts to open a Telnet session (port 23) to a remote server. The packet goes through SW-1.",
          osi: {
            l4: { val: "TCP Src 51234 -> Dst 23", desc: "TCP Layer: Host attempts a connection to Telnet port 23 (unencrypted administration)." },
            l3: { val: "192.168.1.10 -> 8.8.8.8", desc: "IP Layer: Unicast packet targeted to remote server 8.8.8.8." },
            l2: { val: "0050.7966.6800 -> 55aa.bbcc.ddee", desc: "Data Link: Framed to FW-1's inside interface MAC address." },
            l1: { val: "Copper Ethernet (Fa0/1)", desc: "Physical: Data converted into copper Ethernet signals." }
          }
        },
        {
          node: "switch", x: 240, y: 140, name: "Switch SW-1", color: "#00f2fe",
          headers: "L2: Forwarding to FW-1",
          desc: "SW-1 forwards the frame directly towards the default gateway FW-1 based on MAC table mapping.",
          osi: {
            l4: { val: "TCP Src 51234 -> Dst 23", desc: "TCP segment remains encapsulated." },
            l3: { val: "192.168.1.10 -> 8.8.8.8", desc: "IP routing data unread." },
            l2: { val: "0050.7966.6800 -> 55aa.bbcc.ddee", desc: "SW-1 forwards unicast frame directly towards FW-1's interface based on MAC lookup." },
            l1: { val: "Trunk Link (Gi0/2)", desc: "Physical: Gigabit link transit." }
          }
        },
        {
          node: "firewall", x: 400, y: 200, name: "Firewall FW-1", color: "#ff5e3a", isBlocked: true,
          headers: "ACL Denied Rule 30 | PACKET DROPPED",
          desc: "FW-1 inspects the incoming traffic. The rule <code>deny tcp any any eq 23</code> matches. <strong>The packet is dropped immediately.</strong>",
          osi: {
            l4: { val: "TCP Src 51234 -> Dst 23", desc: "TCP segment is inspected. Destination Port 23 matches deny policy." },
            l3: { val: "192.168.1.10 -> 8.8.8.8", desc: "IP Layer: Firewall denies traffic from inside network to outside for Telnet." },
            l2: { val: "0050.7966.6800 -> 55aa.bbcc.ddee", desc: "Data Link: Frame is discarded immediately. No Layer 2 transmission occurs on the WAN uplink." },
            l1: { val: "No Transmission", desc: "Physical Layer: The packet is dropped in memory; no electrical signals are sent on the egress interface." }
          }
        }
      ];
    } else if (type === "roas") {
      path = [
        {
          node: "pc-sales", x: 60, y: 180, name: "Sales PC (VLAN 10)", color: "#00f2fe",
          headers: "L2: Tag 10 | L3: 10.10.10.10 -> 10.10.20.10 | TCP: 51000 -> 80",
          desc: "PC-Sales (VLAN 10) targets a web service on IP-Phone (VLAN 20). Since they are on different subnets, the PC targets its gateway IP 10.10.10.1.",
          osi: {
            l4: { val: "TCP Src 51000 -> Dst 80", desc: "TCP Layer: Client initiates HTTP connection request to voice device." },
            l3: { val: "10.10.10.10 -> 10.10.20.10", desc: "IP Layer: Source IP is Sales client (10.10.10.10), Destination is Phone (10.10.20.10)." },
            l2: { val: "00aa.bbcc.1010 -> Gateway MAC", desc: "Data Link: Frame matches PC-Sales source MAC and targets default gateway interface." },
            l1: { val: "Copper Ethernet (Fa0/1)", desc: "Physical Layer: Tx over Category 6 copper access cable." }
          }
        },
        {
          node: "sw-branch", x: 200, y: 130, name: "SW-Branch Switch", color: "#00f2fe",
          headers: "L2 Trunk: VLAN Tag 10",
          desc: "SW-Branch receives the frame on access port Fa0/1, adds an 802.1Q tag for VLAN 10, and forwards it over the Trunk Gi0/1 uplink towards the router.",
          osi: {
            l4: { val: "TCP Src 51000 -> Dst 80", desc: "Payload remains encapsulated." },
            l3: { val: "10.10.10.10 -> 10.10.20.10", desc: "IP header untouched." },
            l2: { val: "802.1Q Tag: VLAN 10", desc: "SW-Branch inserts the VLAN 10 tag to identify traffic source across shared trunk trunks." },
            l1: { val: "Trunk Link (Gi0/1)", desc: "Physical: Gigabit Trunk fiber transceiver." }
          }
        },
        {
          node: "r-branch", x: 360, y: 130, name: "R-Branch Router", color: "#10b981",
          headers: "L3 Routing: Gi0/0.10 -> Gi0/0.20 | Tag rewritten to VLAN 20",
          desc: "R-Branch processes the tagged frame on subinterface Gi0/0.10. It strips the VLAN tag, decapsulates L2, routes the packet to virtual subinterface Gi0/0.20, and re-encapsulates it with a VLAN 20 tag.",
          osi: {
            l4: { val: "TCP Src 51000 -> Dst 80", desc: "Payload remains encapsulated." },
            l3: { val: "10.10.10.10 -> 10.10.20.10", desc: "R-Branch performs routing lookup, forwarding packets between subnet subinterfaces Gi0/0.10 and Gi0/0.20." },
            l2: { val: "802.1Q Tag: VLAN 20", desc: "Data Link: Re-encapsulated with R-Branch interface MAC as source and a VLAN 20 trunk tag." },
            l1: { val: "Trunk Link (Gi0/1)", desc: "Physical: Sent back down the same physical port channel (Router-on-a-Stick loop)." }
          }
        },
        {
          node: "sw-branch", x: 200, y: 130, name: "SW-Branch Switch", color: "#10b981",
          headers: "L2 Access: VLAN tag stripped",
          desc: "SW-Branch receives the VLAN 20 tagged frame. It checks its MAC table, finds the IP-Phone on access port Fa0/2, strips the 802.1Q tag, and forwards the standard frame.",
          osi: {
            l4: { val: "TCP Src 51000 -> Dst 80", desc: "Payload remains encapsulated." },
            l3: { val: "10.10.10.10 -> 10.10.20.10", desc: "IP header untouched." },
            l2: { val: "Untagged Access Frame", desc: "SW-Branch strips the VLAN 20 tag prior to final delivery to access port Fa0/2." },
            l1: { val: "Access Link (Fa0/2)", desc: "Physical: Downlink FastEthernet cable." }
          }
        },
        {
          node: "ip-phone", x: 60, y: 80, name: "Voice IP Phone", color: "#10b981",
          headers: "L3: Connection Accepted",
          desc: "The IP-Phone (VLAN 20) receives the frame, decapsulates the TCP segment, and processes the HTTP request. ROAS traversal successful!",
          osi: {
            l4: { val: "TCP Dst 80", desc: "TCP Layer: Service accepts connection on port 80." },
            l3: { val: "10.10.10.10 -> 10.10.20.10", desc: "IP Layer: Destination matches voice IP address." },
            l2: { val: "00bb.ccdd.2020 MAC Match", desc: "Data Link: Unicast frame matches target device NIC MAC address." },
            l1: { val: "Copper Ethernet", desc: "Physical: NIC converts electrical pulses." }
          }
        }
      ];
    } else if (type === "lacp") {
      path = [
        {
          node: "r-branch", x: 360, y: 130, name: "R-Branch Router", color: "#10b981",
          headers: "L2 LACP: Channel-Group 1 Active",
          desc: "R-Branch load-balances outbound traffic to the Core network over bundled Port-Channel 1. Traffic exits Member Link 1.",
          osi: {
            l4: { val: "TCP Src 50123 -> Dst 443", desc: "Transport Layer: TCP HTTPS traffic." },
            l3: { val: "10.10.10.10 -> 172.16.100.5", desc: "IP Layer: Destination is HQ Server." },
            l2: { val: "Port-Channel 1 (LACP)", desc: "Data Link: LACP bundles multiple physical interfaces into a logical Port-Channel to increase bandwidth and redundancy." },
            l1: { val: "Gigabit Link 1", desc: "Physical Layer: Traffic is hash-balanced to Member Interface Gi0/2." }
          }
        },
        {
          node: "r-branch", x: 360, y: 130, name: "R-Branch (LACP Member Failure)", color: "#ff5e3a",
          headers: "LACP Alert: Member Link 1 DOWN | Egress switchover",
          desc: "Member Link 1 experiences a physical failure. LACP immediately redirects all traffic to active Member Link 2. Transmission continues seamlessly without session drops.",
          osi: {
            l4: { val: "TCP Src 50123 -> Dst 443", desc: "TCP session remains alive without timeouts." },
            l3: { val: "10.10.10.10 -> 172.16.100.5", desc: "Routing table path remains unchanged." },
            l2: { val: "LACP Dynamic Failover", desc: "LACP removes Member Link 1 from the channel bundle and immediately redirects traffic to active Member Link 2." },
            l1: { val: "Gigabit Link 2 (Failover)", desc: "Physical Layer: Egress traffic shifts dynamically to Member Interface Gi0/3." }
          }
        },
        {
          node: "hq-core", x: 520, y: 80, name: "HQ Core L3 Switch", color: "#10b981",
          headers: "L2: Port-Channel 1 Received | Forwarding to Server",
          desc: "HQ-Core receives the packet on Port-Channel 1. The LACP failover was transparent to the routing layer, avoiding any packet drops.",
          osi: {
            l4: { val: "TCP Src 50123 -> Dst 443", desc: "TCP session remains fully established." },
            l3: { val: "10.10.10.10 -> 172.16.100.5", desc: "HQ-Core acts as L3 router for core subnets." },
            l2: { val: "Port-Channel 1 (LACP)", desc: "LACP processes logical incoming frame; MAC database resolves destination on local Gi0/24." },
            l1: { val: "Gigabit Link 2", desc: "Physical: Incoming signals processed on Gi0/2." }
          }
        },
        {
          node: "hq-server", x: 640, y: 80, name: "HQ Server", color: "#10b981",
          headers: "L3: Destination Reached",
          desc: "HQ Server receives the packet. EtherChannel ensured high availability even during a physical fiber link break.",
          osi: {
            l4: { val: "TCP Dst 443", desc: "TCP Layer: HTTPS handshake completed." },
            l3: { val: "10.10.10.10 -> 172.16.100.5", desc: "IP Layer: Matches datacenter host." },
            l2: { val: "Unicast Frame", desc: "Data Link: Datacenter standard frame." },
            l1: { val: "Copper Ethernet", desc: "Physical Layer: Server NIC reception." }
          }
        }
      ];
    } else if (type === "vpn") {
      path = [
        {
          node: "r-branch", x: 360, y: 130, name: "R-Branch Router", color: "#00f2fe",
          headers: "L3: Crypto Map Match | IPSec Encapsulation",
          desc: "R-Branch inspects outbound packet. Traffic matches the Crypto ACL (10.10.10.0/24 to 172.16.100.0/24). R-Branch initiates IPSec Tunnel Mode encryption.",
          osi: {
            l4: { val: "IPSec ESP (Protocol 50)", desc: "Transport Layer: Original TCP header is encrypted and encapsulated inside an Encapsulating Security Payload (ESP) header." },
            l3: { val: "WAN IP 192.0.2.1 -> 198.51.100.1", desc: "IP Layer: Private source/destination IPs are encrypted. A new public IP header is prepended (R-Branch WAN to FW-Branch WAN)." },
            l2: { val: "WAN MAC Gateway", desc: "Data Link: Unicast frame directed to outside ISP router." },
            l1: { val: "WAN Carrier", desc: "Physical: Sent over public ISP uplink." }
          }
        },
        {
          node: "fw-branch", x: 520, y: 180, name: "FW-Branch Firewall (VPN Peer)", color: "#10b981",
          headers: "L3: IPSec Decapsulation",
          desc: "The VPN Gateway (FW-Branch) intercepts the ESP packet. Finding a valid Security Association (SA), it decapsulates the ESP wrapper, decrypts the payload, and reveals the original private IP headers.",
          osi: {
            l4: { val: "TCP Src 50123 -> Dst 443", desc: "Transport Layer: Original TCP header decrypted and exposed." },
            l3: { val: "10.10.10.10 -> 172.16.100.5", desc: "IP Layer: Original private IP headers are revealed and routed to internal interface." },
            l2: { val: "Internal MAC Rewrite", desc: "Data Link: Framed for core forwarding." },
            l1: { val: "Gigabit Link", desc: "Physical: Decoded packet routed internally." }
          }
        },
        {
          node: "hq-server", x: 640, y: 80, name: "HQ Server", color: "#10b981",
          headers: "L3: Destination Reached | Private Session Secured",
          desc: "HQ Server receives the decrypted private packet. Site-to-site IPSec VPN secured the transaction across the untrusted public Internet.",
          osi: {
            l4: { val: "TCP Dst 443", desc: "TCP Layer: Secure web service receives transaction." },
            l3: { val: "10.10.10.10 -> 172.16.100.5", desc: "IP Layer: Datacenter Server private destination match." },
            l2: { val: "Unicast Frame", desc: "Data Link: Private LAN framing." },
            l1: { val: "Copper Ethernet", desc: "Physical Layer: NIC reception." }
          }
        }
      ];
    }

    activePkt.style.opacity = "1";
    logContent.innerHTML = "";
    let blocked = false;

    for (let i = 0; i < path.length; i++) {
      const step = path[i];
      
      const isBlockedHop = isBugActive && (i === bug.failureHopIndex);
      if (isBlockedHop) {
        step.isBlocked = true;
        step.headers = `L3: ERROR | ${bug.errorLog}`;
        step.desc = `<strong>[DROPPED]</strong> Packet dropped at ${step.name}. Reason: ${bug.desc}`;
      }

      window.currentOsiData = step.osi || null;
      updateOsiLabels(step.osi);

      let highestLayer = 1;
      if (step.osi) {
        if (step.osi.l4 && step.osi.l4.val !== "-") highestLayer = 4;
        else if (step.osi.l3 && step.osi.l3.val !== "-") highestLayer = 3;
        else if (step.osi.l2 && step.osi.l2.val !== "-") highestLayer = 2;
      }
      
      document.querySelectorAll(".osi-layer").forEach(el => {
        if (el.getAttribute("data-layer") == highestLayer) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      });
      showOsiLayerDetail(highestLayer);

      highlightNode(step.node, step.isBlocked);

      // Check for special LACP member link failure styling
      if (type === "lacp" && activeTopology === 2) {
        if (i === 1) {
          const link1 = byId("link-rbranch-hq1");
          if (link1) {
            link1.setAttribute("stroke", "var(--color-error)");
            link1.setAttribute("stroke-width", "3");
          }
          const link2 = byId("link-rbranch-hq2");
          if (link2) {
            link2.setAttribute("stroke", "var(--color-ok)");
            link2.setAttribute("stroke-width", "3");
          }
          const statusLink1 = byId("status-lacp-link1");
          if (statusLink1) {
            statusLink1.setAttribute("fill", "var(--color-error)");
          }
        }
      }

      activePkt.setAttribute("cx", step.x);
      activePkt.setAttribute("cy", step.y);
      if (step.isBlocked) {
        activePkt.setAttribute("fill", "var(--color-error)");
        activePkt.style.filter = "drop-shadow(0 0 8px #ff5e3a)";
        playNetSound("block");
      } else {
        activePkt.setAttribute("fill", step.color || "#00f2fe");
        activePkt.style.filter = `drop-shadow(0 0 8px ${step.color || "#00f2fe"})`;
        playNetSound("hop");
      }

      const stepDiv = document.createElement("div");
      stepDiv.style.borderLeft = `3px solid ${step.isBlocked ? "var(--color-error)" : step.color}`;
      stepDiv.style.paddingLeft = "8px";
      stepDiv.style.marginBottom = "6px";
      stepDiv.innerHTML = `
        <strong style="color:${step.isBlocked ? "var(--color-error)" : step.color};">[HOP ${i + 1}: ${step.name}]</strong><br/>
        <span style="font-size:11px; color:#94a3b8; font-family:var(--font-mono);">${step.headers}</span><br/>
        <span>${step.desc}</span>
      `;
      logContent.appendChild(stepDiv);

      const logPanel = byId("simLogPanel");
      if (logPanel) logPanel.scrollTop = logPanel.scrollHeight;

      if (step.isBlocked) {
        blocked = true;
        break;
      }

      const speed = Number(byId("simSpeed")?.value || 2200);
      await sleep(speed);
    }

    if (blocked) {
      const finishDiv = document.createElement("div");
      finishDiv.style.textAlign = "center";
      finishDiv.style.marginTop = "8px";
      finishDiv.style.color = "var(--color-error)";
      finishDiv.style.fontWeight = "bold";
      finishDiv.innerHTML = `❌ Traversal Blocked by Security Policy.`;
      logContent.appendChild(finishDiv);
    } else {
      playNetSound("success");
      const finishDiv = document.createElement("div");
      finishDiv.style.textAlign = "center";
      finishDiv.style.marginTop = "8px";
      finishDiv.style.color = "var(--color-ok)";
      finishDiv.style.fontWeight = "bold";
      finishDiv.innerHTML = `✔ Traversal Completed Successfully.`;
      logContent.appendChild(finishDiv);

      if (type === "ospf" || type === "roas") {
        state.analytics.simPathsRun = state.analytics.simPathsRun || { ospf: false, roas: false };
        state.analytics.simPathsRun[type] = true;
        saveAnalytics();
        if (window.renderAchievements) window.renderAchievements();
      }
    }

    await sleep(1000);
    highlightNode(null);
    btnStart.disabled = false;
  });

  btnReset.addEventListener("click", () => {
    btnStart.disabled = false;
    const pkt1 = byId("simPacket");
    const pkt2 = byId("simPacket2");
    if (pkt1) {
      pkt1.style.opacity = "0";
      pkt1.setAttribute("cx", "80");
      pkt1.setAttribute("cy", "140");
    }
    if (pkt2) {
      pkt2.style.opacity = "0";
      pkt2.setAttribute("cx", "60");
      pkt2.setAttribute("cy", "180");
    }
    logContent.innerHTML = "<div>System Ready. Select a packet simulation and click 'Run Simulation'.</div>";
    window.currentOsiData = null;
    updateOsiLabels(null);
    const descBox = byId("osiLayerDescBox");
    if (descBox) {
      descBox.innerHTML = `<span style="color: var(--text-muted); font-style: italic;">Run a simulation and click any OSI layer tab above to inspect the active hop encapsulation details.</span>`;
    }
    document.querySelectorAll(".osi-layer").forEach(el => el.classList.remove("active"));
    highlightNode(null);
    resetTopology2Links();
  });
}
