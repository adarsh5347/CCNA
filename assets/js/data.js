export const blueprint = [
  { name: "Network Fundamentals", weight: 20, topics: ["OSI", "TCP/IP", "IPv4", "IPv6", "Subnetting", "Ethernet", "ARP", "ICMP"], count: 108 },
  { name: "Network Access", weight: 20, topics: ["VLANs", "Trunks", "STP", "EtherChannel", "Wireless"], count: 108 },
  { name: "IP Connectivity", weight: 25, topics: ["Routing", "OSPF", "Static Routes", "Route Selection"], count: 135 },
  { name: "IP Services", weight: 10, topics: ["DHCP", "NAT", "NTP", "Syslog", "SNMP"], count: 54 },
  { name: "Security Fundamentals", weight: 15, topics: ["ACLs", "SSH", "Port Security", "DHCP Snooping", "Wireless Security"], count: 81 },
  { name: "Automation and Programmability", weight: 10, topics: ["JSON", "REST APIs", "SDN", "DNA Center", "Ansible", "YANG", "NETCONF"], count: 54 }
];

export const ranks = [
  { xp: 0, title: "Network Intern" },
  { xp: 300, title: "Help Desk" },
  { xp: 700, title: "Network Technician" },
  { xp: 1300, title: "Junior Network Engineer" },
  { xp: 2000, title: "Network Engineer" },
  { xp: 3000, title: "Senior Engineer" },
  { xp: 4200, title: "CCNA Ready" }
];

const coreLibrary = {
  OSI: ["Transport supports reliability", "Data Link does routing", "Physical adds TCP headers", "Session computes routes"],
  TCPIP: ["TCP provides sequencing", "UDP guarantees reliability", "IP is session layer", "ARP is Layer 4"],
  IPv4: ["CIDR allows variable prefixes", "IPv4 has no broadcast", "IPv4 header is fixed 64 bytes", "Default gateway is never needed"],
  IPv6: ["FE80::/10 is link-local", "NAT is mandatory", "IPv6 is 32-bit", "ARP is used in IPv6"],
  Subnetting: ["/27 has 30 usable hosts", "/30 has 254 hosts", "Wildcard equals subnet mask", "CIDR removes prefixes"],
  Ethernet: ["Switches use MAC tables", "Hubs segment traffic", "Ethernet cannot trunk", "Full duplex needs CSMA/CD"],
  ARP: ["ARP resolves IPv4 to MAC", "ARP resolves DNS names", "ARP is routed WAN wide", "ARP replaces ICMP"],
  ICMP: ["ICMP helps troubleshooting", "ICMP carries HTTPS", "ICMP is a routing protocol", "ICMP encrypts packets"],
  VLANs: ["Access ports carry one VLAN", "VLANs reduce segmentation", "VLAN ID max is 255", "Trunks do not carry VLANs"],
  Trunks: ["802.1Q tags VLAN frames", "Trunk carries one VLAN only", "ISL is universal standard", "Trunks disable STP"],
  STP: ["Root is lowest bridge ID", "Blocking forwards user traffic", "STP creates loops", "PortFast is for trunks"],
  EtherChannel: ["LACP is standard", "PAgP is standard", "Different speed links can bundle", "Port-channel removes redundancy"],
  Wireless: ["WPA3 is strongest", "WEP is strongest", "5 GHz has less capacity", "SSID is encryption algorithm"],
  Routing: ["Longest prefix wins", "Highest AD always wins", "First learned route wins", "Prefix is ignored"],
  OSPF: ["OSPF AD is 110", "OSPF metric is hops", "Area 0 always optional", "DR election on point-to-point"],
  StaticRoutes: ["ip route 0.0.0.0 0.0.0.0 next-hop", "Static needs OSPF", "ip default-gateway on router routes traffic", "Static cannot use interfaces"],
  RouteSelection: ["Lower AD is preferred", "Higher metric always preferred", "Newest route wins", "LPM is optional"],
  DHCP: ["DORA starts with Discover", "DORA starts with ACK", "Client unicasts discover", "DHCP cannot assign DNS"],
  NAT: ["PAT maps many users to one public IP", "Static NAT uses pool by default", "NAT replaces ACLs", "NAT required for local VLAN traffic"],
  NTP: ["Stratum 1 syncs from reference", "Stratum 16 is best", "NTP uses TCP 443", "NTP is wireless only"],
  Syslog: ["Lower number means higher severity", "Severity 7 is emergency", "Syslog is local only", "Syslog replaces SNMP"],
  SNMP: ["SNMPv3 supports auth and privacy", "SNMPv1 uses AES", "SNMP cannot monitor links", "Traps require polling"],
  ACLs: ["Extended ACL can match ports", "Standard ACL matches ports", "ACLs are stateful", "No implicit deny exists"],
  SSH: ["ip ssh version 2 enables SSHv2", "SSH sends cleartext", "transport input telnet is secure default", "RSA keys not needed"],
  PortSecurity: ["Sticky MAC learns addresses", "Port security blocks rogue DHCP directly", "Violation shutdown forwards traffic", "Requires routed port"],
  DHCPSnooping: ["Untrusted ports block rogue server responses", "Trusted blocks all DHCP", "Runs only on routers", "Breaks VLANs"],
  WirelessSecurity: ["802.1X enables enterprise auth", "PSK is enterprise identity method", "WPA2 is weaker than WEP", "RADIUS does packet switching"],
  JSON: ["JSON is key-value data format", "JSON requires XML", "JSON cannot store arrays", "JSON is a routing protocol"],
  RESTAPIs: ["GET retrieves resources", "POST only reads", "REST requires Telnet", "REST has no HTTP status codes"],
  SDN: ["SDN can centralize control plane", "SDN removes data plane", "SDN blocks automation", "SDN is wireless only"],
  DNACenter: ["DNA Center supports intent automation", "DNA Center replaces IOS", "DNA Center has no APIs", "DNA Center is only firewall software"],
  Ansible: ["Playbooks automate config", "Agents mandatory on Cisco devices", "Ansible supports no YAML", "Ansible is Windows-only"],
  YANG: ["YANG models structured data", "YANG is transport protocol", "YANG replaces SSH", "YANG can model only ACLs"],
  NETCONF: ["NETCONF commonly runs over SSH", "NETCONF is UDP only", "NETCONF cannot edit config", "NETCONF has no RPC replies"]
};

function keyFromTopic(topic) {
  return topic.replace(/\s+/g, "").replace(/\//g, "");
}

function typeByIndex(i) {
  const m = i % 20;
  if (m < 11) return "single";
  if (m < 15) return "multi";
  if (m < 17) return "scenario";
  if (m < 19) return "matching";
  return "dragdrop";
}

function diffByIndex(i, total) {
  const r = i / total;
  if (r < 0.4) return "Easy";
  if (r < 0.8) return "Medium";
  return "Hard";
}

function freqByDifficulty(d) {
  return d === "Hard" ? "High" : d === "Medium" ? "Medium" : "Low";
}

export function generateBank(seedRandom) {
  const bank = [];
  let id = 1;

  blueprint.forEach((domain) => {
    for (let i = 0; i < domain.count; i++) {
      const topic = domain.topics[i % domain.topics.length];
      const type = typeByIndex(i);
      const difficulty = diffByIndex(i, domain.count);
      const lib = coreLibrary[keyFromTopic(topic)] || ["Correct statement", "Wrong statement 1", "Wrong statement 2", "Wrong statement 3"];

      const q = {
        id: id++,
        domain: domain.name,
        topic,
        type,
        difficulty,
        examWeight: `${domain.weight}%`,
        frequency: freqByDifficulty(difficulty),
        scenario: `You are the network engineer responsible for a production migration involving ${topic}.`,
        text: `Which option best addresses the ${topic} objective under ${difficulty} conditions?`,
        topology: "[Core]---[Distribution]---[Access]\n   |           |\n [R1]       [R2]",
        cli: `R1# show run | section ${topic.toLowerCase().replace(/\s+/g, "-")}\nR1# show ip interface brief`,
        packet: `SRC=10.${i % 10}.${i % 20}.10 DST=10.${(i + 1) % 10}.${(i + 3) % 20}.20 PROTO=TCP`
      };

      if (type === "single" || type === "scenario") {
        q.options = [...lib];
        q.correct = [0];
      } else if (type === "multi") {
        q.options = [...lib];
        q.correct = [0, 1];
      } else if (type === "matching") {
        q.pairs = [
          [`${topic} control`, "Defines behavior and policy"],
          [`${topic} verification`, "Confirms expected operation"],
          [`${topic} hardening`, "Reduces attack surface"],
          [`${topic} monitoring`, "Measures runtime state"]
        ];
      } else {
        q.order = [
          `Assess baseline for ${topic}`,
          "Apply configuration",
          "Validate with show commands",
          "Document and monitor"
        ];
      }

      const labels = q.options ? q.correct.map((n) => String.fromCharCode(65 + n)).join(",") : "Simulation";
      q.expl = {
        correct: labels,
        why: `The selected answer aligns with Cisco blueprint intent for ${topic}.`,
        wrong: [
          "Distractors often mix protocol scope and layer behavior.",
          "Some options use incorrect command syntax or defaults.",
          "Others fail because they ignore operational state and verification."
        ],
        tip: "Read keywords like first, best, most specific, and default before evaluating options.",
        memory: "Use Scope -> Syntax -> State for rapid elimination.",
        real: "In production, engineers baseline, implement, verify, and document changes.",
        commands: ["show ip route", "show vlan brief", "show spanning-tree", "show etherchannel summary"]
      };

      bank.push(q);
    }
  });

  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(seedRandom() * (i + 1));
    const t = bank[i];
    bank[i] = bank[j];
    bank[j] = t;
  }

  return bank;
}
