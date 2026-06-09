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
  OSI: {
    options: ["Transport-layer TCP can provide reliable delivery", "The data-link layer handles local framing and MAC addressing", "The physical layer adds TCP headers", "The session layer computes IP routes"],
    why: "TCP reliability belongs to the transport layer, while Ethernet framing and MAC addressing are data-link functions. Reference: Cisco CCNA exam topics and RFC 9293."
  },
  TCPIP: {
    options: ["TCP provides sequencing and acknowledgments", "UDP provides connectionless transport without reliability guarantees", "IP is a network-layer protocol", "ARP is a Layer 4 transport protocol"],
    why: "TCP is reliable and connection oriented; UDP is connectionless and does not guarantee delivery. Reference: RFC 9293 and RFC 768."
  },
  IPv4: {
    options: ["CIDR supports variable-length prefixes", "IPv4 uses ARP to resolve local next-hop MAC addresses", "The IPv4 header is always fixed at 64 bytes", "A default gateway is never needed outside the local subnet"],
    why: "CIDR allows prefix-based aggregation, and IPv4 hosts use ARP for local link-layer resolution. Reference: RFC 4632 and RFC 826."
  },
  IPv6: {
    options: ["FE80::/10 is reserved for IPv6 link-local addresses", "IPv6 Neighbor Discovery replaces ARP functions", "NAT is mandatory for IPv6 operation", "IPv6 addresses are 32 bits long"],
    why: "IPv6 link-local addresses use FE80::/10, and Neighbor Discovery performs address resolution without ARP. Reference: RFC 4291 and RFC 4861."
  },
  Subnetting: {
    options: ["/27 provides 30 usable IPv4 host addresses", "A wildcard mask is the inverse of the subnet mask", "/30 provides 254 usable host addresses", "CIDR removes the need for prefixes"],
    why: "A /27 leaves 5 host bits, giving 2^5 - 2 usable IPv4 host addresses; wildcard masks invert subnet masks. Reference: RFC 4632 and Cisco IOS ACL/OSPF configuration practice."
  },
  Ethernet: {
    options: ["Switches learn source MAC addresses into a MAC address table", "Full-duplex Ethernet does not use CSMA/CD", "Hubs segment collision domains per port", "Ethernet cannot carry VLAN trunks"],
    why: "Switches forward by learned MAC address, and full-duplex links eliminate collision detection. Reference: IEEE 802.3 Ethernet behavior and Cisco switching fundamentals."
  },
  ARP: {
    options: ["ARP resolves IPv4 addresses to MAC addresses on a local network", "ARP requests are broadcast on the local Layer 2 segment", "ARP resolves DNS names", "ARP is routed unchanged across WAN links"],
    why: "ARP maps IPv4 protocol addresses to local hardware addresses and operates within the local broadcast domain. Reference: RFC 826."
  },
  ICMP: {
    options: ["ICMP supports troubleshooting messages such as echo and unreachable", "IPv4 ICMP is carried directly by IP rather than TCP or UDP", "ICMP carries HTTPS application data", "ICMP is a routing protocol"],
    why: "ICMP reports errors and diagnostics, including echo messages used by ping, and is encapsulated in IP. Reference: RFC 792."
  },
  VLANs: {
    options: ["An access port carries traffic for one VLAN by default", "VLANs create separate Layer 2 broadcast domains", "The normal VLAN ID range ends at 255", "Trunks do not carry VLAN traffic"],
    why: "Access ports are assigned to a single VLAN, and VLANs segment broadcast domains. Reference: Cisco CCNA exam topics and IEEE 802.1Q."
  },
  Trunks: {
    options: ["802.1Q tags Ethernet frames to identify VLANs on trunks", "A trunk can carry traffic for multiple VLANs", "ISL is the current universal trunking standard", "Trunks disable STP"],
    why: "802.1Q is the standard VLAN tagging method, and trunks carry multiple VLANs between network devices. Reference: IEEE 802.1Q and Cisco switching configuration guides."
  },
  STP: {
    options: ["The root bridge is selected by the lowest bridge ID", "Blocking ports prevent Layer 2 forwarding loops", "STP intentionally creates switching loops", "PortFast is intended for switch-to-switch trunk links"],
    why: "STP elects the lowest bridge ID as root and blocks redundant paths to prevent loops. Reference: IEEE 802.1D and Cisco STP configuration guidance."
  },
  EtherChannel: {
    options: ["LACP is an IEEE standard negotiation protocol", "Bundled ports should have compatible speed, duplex, trunking, and VLAN settings", "PAgP is an IEEE standard", "EtherChannel removes link redundancy"],
    why: "LACP is standardized as part of IEEE link aggregation, and member interfaces must have compatible settings. Reference: IEEE 802.1AX and Cisco EtherChannel configuration guidance."
  },
  Wireless: {
    options: ["WPA3 provides stronger WLAN security than WEP", "5 GHz generally offers more non-overlapping channels than 2.4 GHz", "WEP is the strongest common WLAN security option", "An SSID is an encryption algorithm"],
    why: "WPA3 improves wireless authentication and encryption, while 5 GHz has more channel capacity than 2.4 GHz. Reference: Wi-Fi Alliance WPA3 material and Cisco wireless fundamentals."
  },
  Routing: {
    options: ["Routers prefer the longest prefix match for a destination", "Administrative distance compares routes learned from different sources", "The highest administrative distance is always preferred", "The first learned route always wins"],
    why: "Forwarding first uses the most specific matching prefix, then administrative distance and metric help choose among candidates. Reference: Cisco administrative distance documentation."
  },
  OSPF: {
    options: ["OSPF has a default Cisco administrative distance of 110", "OSPF uses cost as its route metric", "OSPF metric is hop count", "A DR election is required on point-to-point OSPF links"],
    why: "Cisco lists OSPF administrative distance as 110, and OSPF calculates path preference with cost. Reference: Cisco OSPF command and configuration guides."
  },
  StaticRoutes: {
    options: ["A default static route can use ip route 0.0.0.0 0.0.0.0 next-hop", "A static route can point to a next-hop IP address or an exit interface", "Static routes require OSPF to be enabled", "ip default-gateway makes an IOS router route transit traffic"],
    why: "Static routes are manually configured with a destination, mask, and next hop or exit interface; the all-zero route is the default route. Reference: Cisco IOS IP routing configuration guidance."
  },
  RouteSelection: {
    options: ["Lower administrative distance is preferred when route sources differ", "Lower metric is preferred among routes from the same protocol", "Higher metric is always preferred", "Longest prefix matching is optional"],
    why: "Cisco route selection uses longest prefix match first; administrative distance and metric then break ties by source and protocol. Reference: Cisco administrative distance documentation."
  },
  DHCP: {
    options: ["The DHCP DORA process starts with Discover", "DHCP can provide options such as DNS server and default gateway", "DHCP Discover is normally sent as a unicast from a client with no address", "DHCP cannot assign DNS server information"],
    why: "Clients begin with Discover, and Cisco DHCP pools can assign DNS and default-router options. Reference: RFC 2131 and Cisco IOS XE DHCP server guide."
  },
  NAT: {
    options: ["PAT can map many inside hosts to one public IPv4 address", "Static NAT creates a fixed inside-local to inside-global mapping", "Static NAT uses a pool by default", "NAT is required for traffic between local VLANs"],
    why: "PAT overloads translations by port number, while static NAT creates one-to-one mappings. Reference: Cisco IOS XE NAT configuration guidance."
  },
  NTP: {
    options: ["Stratum 1 servers synchronize directly from a reference clock", "NTP commonly uses UDP port 123", "Stratum 16 is the best synchronized stratum", "NTP uses TCP 443 by default"],
    why: "NTP strata indicate distance from a reference clock, and NTP uses UDP/123. Reference: RFC 5905."
  },
  Syslog: {
    options: ["Lower syslog severity numbers indicate more severe events", "Severity 0 is Emergency and severity 7 is Debugging", "Severity 7 is Emergency", "Syslog replaces SNMP monitoring"],
    why: "Syslog severity values run from 0 for Emergency to 7 for Debugging in the common facility/severity model. Reference: RFC 5424."
  },
  SNMP: {
    options: ["SNMPv3 supports authentication and privacy", "SNMP managers can receive traps without polling first", "SNMPv1 uses AES privacy", "SNMP cannot monitor interface state"],
    why: "SNMPv3 adds security services, and traps are asynchronous notifications from agents. Reference: RFC 3411 and RFC 3414."
  },
  ACLs: {
    options: ["Extended IPv4 ACLs can match Layer 4 ports", "ACLs have an implicit deny at the end", "Standard IPv4 ACLs match TCP and UDP ports", "IOS ACLs are stateful by default"],
    why: "Extended ACLs can match protocol and ports, and IOS ACL processing includes an implicit deny if no entry matches. Reference: Cisco IOS access control list configuration guidance."
  },
  SSH: {
    options: ["ip ssh version 2 enables SSHv2 on Cisco IOS", "SSH encrypts remote management traffic", "SSH sends passwords in clear text like Telnet", "transport input telnet is the secure default for VTY lines"],
    why: "SSHv2 is the recommended encrypted management protocol for IOS devices. Reference: Cisco IOS Secure Shell configuration guidance."
  },
  PortSecurity: {
    options: ["Sticky MAC learning can add learned addresses to the running configuration", "The default port-security violation action is shutdown", "Port security is configured on routed ports", "A shutdown violation continues forwarding user traffic"],
    why: "Port security is a Layer 2 access-port feature; sticky learning records MAC addresses, and shutdown is the default violation mode. Reference: Cisco port security configuration guidance."
  },
  DHCPSnooping: {
    options: ["Untrusted ports block unauthorized DHCP server messages", "Trusted ports are typically used toward legitimate DHCP servers or uplinks", "Trusted ports block all DHCP messages", "DHCP snooping runs only on routers"],
    why: "DHCP snooping classifies ports as trusted or untrusted to stop rogue DHCP server replies. Reference: Cisco Layer 2 security and DHCP snooping configuration guidance."
  },
  WirelessSecurity: {
    options: ["802.1X enables enterprise authentication for WLANs", "WPA2/WPA3 Enterprise commonly uses RADIUS for centralized authentication", "PSK is the enterprise per-user identity method", "WEP is stronger than WPA2"],
    why: "Enterprise WLANs commonly use 802.1X with RADIUS, while PSK is shared-key authentication. Reference: IEEE 802.1X and Cisco wireless security guidance."
  },
  JSON: {
    options: ["JSON represents data with objects, arrays, and name/value pairs", "JSON is commonly used by REST APIs", "JSON requires XML syntax", "JSON is a routing protocol"],
    why: "JSON is a lightweight structured data format commonly used for API payloads. Reference: RFC 8259."
  },
  RESTAPIs: {
    options: ["GET retrieves a resource representation", "HTTP status codes communicate request outcomes", "POST only reads resources", "REST requires Telnet"],
    why: "REST-style APIs commonly use HTTP methods and status codes; GET is used to retrieve representations. Reference: RFC 9110."
  },
  SDN: {
    options: ["SDN can centralize control-plane decisions", "SDN separates control and data-plane concerns", "SDN removes the data plane", "SDN blocks network automation"],
    why: "SDN architectures logically centralize control while network devices still forward traffic in the data plane. Reference: Cisco SDN and CCNA automation topics."
  },
  DNACenter: {
    options: ["Cisco DNA Center supports intent-based automation", "Cisco DNA Center exposes APIs for network automation", "Cisco DNA Center replaces IOS on routers", "Cisco DNA Center is only firewall software"],
    why: "Cisco DNA Center is a controller platform for assurance, automation, and APIs; it does not replace device operating systems. Reference: Cisco Catalyst Center/DNA Center documentation."
  },
  Ansible: {
    options: ["Ansible playbooks automate configuration tasks", "Ansible commonly uses YAML playbooks", "Agents are mandatory on Cisco IOS devices", "Ansible is Windows-only"],
    why: "Ansible is agentless for many network devices and uses YAML playbooks for automation workflows. Reference: Ansible network automation documentation."
  },
  YANG: {
    options: ["YANG models structured configuration and operational data", "YANG data models can be used with NETCONF", "YANG is a transport protocol", "YANG can model only ACLs"],
    why: "YANG defines data models that management protocols such as NETCONF can use. Reference: RFC 7950."
  },
  NETCONF: {
    options: ["NETCONF commonly runs over SSH", "NETCONF supports retrieving and editing configuration datastores", "NETCONF is UDP only", "NETCONF has no RPC replies"],
    why: "NETCONF uses RPC operations over secure transports such as SSH to retrieve and edit configuration. Reference: RFC 6241 and RFC 6242."
  }
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
      const lib = coreLibrary[keyFromTopic(topic)] || {
        options: ["Correct statement", "Also correct statement", "Wrong statement 1", "Wrong statement 2"],
        why: `The selected answer matches the CCNA-level objective for ${topic}.`
      };

      const q = {
        id: id++,
        domain: domain.name,
        topic,
        type,
        difficulty,
        examWeight: `${domain.weight}%`,
        frequency: freqByDifficulty(difficulty),
        scenario: `You are the network engineer responsible for a production migration involving ${topic}.`,
        text: `Which ${topic} statement is correct for a CCNA-level network?`,
        topology: "[Core]---[Distribution]---[Access]\n   |           |\n [R1]       [R2]",
        cli: `R1# show run | section ${topic.toLowerCase().replace(/\s+/g, "-")}\nR1# show ip interface brief`,
        packet: `SRC=10.${i % 10}.${i % 20}.10 DST=10.${(i + 1) % 10}.${(i + 3) % 20}.20 PROTO=TCP`
      };

      if (type === "single" || type === "scenario") {
        q.options = [...lib.options];
        q.correct = [0];
      } else if (type === "multi") {
        q.text = `Which two ${topic} statements are correct for a CCNA-level network?`;
        q.options = [...lib.options];
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
        why: lib.why,
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
