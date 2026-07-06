export const ccnaVideos = [
  // Network Fundamentals
  {
    id: 1,
    title: "Day 1: Network Devices (Routers, Switches, Firewalls)",
    youtubeId: "i8Q-w8fSg_U",
    domain: "Network Fundamentals",
    topic: "OSI",
    duration: "34:10",
    description: "Introduction to routers, switches, firewalls, and network architectures."
  },
  {
    id: 2,
    title: "Day 2: Interfaces, Cables and the OSI Model",
    youtubeId: "Ak2h526U2P4",
    domain: "Network Fundamentals",
    topic: "TCP/IP",
    duration: "28:45",
    description: "Ethernet cabling, UTP/STP, single-mode/multi-mode fiber, and Layer 1/2 interfaces."
  },
  {
    id: 3,
    title: "Day 3: OSI Model & TCP/IP Suite",
    youtubeId: "W7N6N9H4J1s",
    domain: "Network Fundamentals",
    topic: "OSI",
    duration: "25:30",
    description: "Deep dive into the 7 layers of the OSI model and 4 layers of the TCP/IP stack."
  },
  {
    id: 4,
    title: "Day 4: IPv4 Addressing Fundamentals",
    youtubeId: "s_N9H4J1sW7",
    domain: "Network Fundamentals",
    topic: "IPv4",
    duration: "31:12",
    description: "IPv4 headers, classful addressing (Classes A, B, C, D, E), and private IP spaces."
  },
  {
    id: 5,
    title: "Day 13: Subnetting Part 1 (Introduction)",
    youtubeId: "d7L_f8P_W2g",
    domain: "Network Fundamentals",
    topic: "Subnetting",
    duration: "35:45",
    description: "Understanding network prefixes, hosts, subnet masks, and binary math basics."
  },
  {
    id: 6,
    title: "Day 14: Subnetting Part 2 (FLSM & VLSM)",
    youtubeId: "G7dF8m1Pz8w",
    domain: "Network Fundamentals",
    topic: "Subnetting",
    duration: "42:10",
    description: "Designing Fixed-Length Subnet Masks (FLSM) and Variable-Length Subnet Masks (VLSM)."
  },
  {
    id: 7,
    title: "Day 36: IPv6 Addressing & Routing Fundamentals",
    youtubeId: "X7Y8Z9W0V1U",
    domain: "Network Fundamentals",
    topic: "IPv6",
    duration: "29:50",
    description: "IPv6 format, compression rules, link-local vs global unicast addresses, and SLAAC."
  },
  {
    id: 8,
    title: "Day 6: Address Resolution Protocol (ARP) & ICMP",
    youtubeId: "Ak2h526U2P5",
    domain: "Network Fundamentals",
    topic: "ARP",
    duration: "24:18",
    description: "How ARP resolves IP addresses to MAC addresses and how ping/traceroute use ICMP."
  },

  // Network Access
  {
    id: 9,
    title: "Day 16: VLANs Part 1 (Virtual LANs & Trunks)",
    youtubeId: "v_45_Vf_d_8",
    domain: "Network Access",
    topic: "VLANs",
    duration: "38:20",
    description: "Creating virtual broadcast domains and configuring 802.1Q trunking links."
  },
  {
    id: 10,
    title: "Day 17: VLANs Part 2 (Inter-VLAN Routing & ROAS)",
    youtubeId: "G7dF8m1Pz8w",
    domain: "Network Access",
    topic: "VLANs",
    duration: "33:15",
    description: "Configuring Router-on-a-Stick (ROAS) and Layer 3 Switch Switch Virtual Interfaces (SVIs)."
  },
  {
    id: 11,
    title: "Day 20: Spanning Tree Protocol (STP) Introduction",
    youtubeId: "d7L_f8P_W2i",
    domain: "Network Access",
    topic: "STP",
    duration: "40:55",
    description: "Understanding Root Bridge election, Port Roles (Root, Designated, Blocked), and STP timers."
  },
  {
    id: 12,
    title: "Day 21: Rapid STP (802.1w) & EtherChannel",
    youtubeId: "Ak2h526U2P6",
    domain: "Network Access",
    topic: "EtherChannel",
    duration: "34:40",
    description: "Configuring LACP, PAgP, and static EtherChannels to bundle multiple physical links."
  },
  {
    id: 13,
    title: "Day 23: Cisco Wireless Architectures & WLCs",
    youtubeId: "W7N6N9H4J1t",
    domain: "Network Access",
    topic: "Wireless",
    duration: "30:22",
    description: "Autonomous APs vs Lightweight APs, CAPWAP tunnels, and WLC central deployments."
  },

  // IP Connectivity
  {
    id: 14,
    title: "Day 10: Routing Table & Static Routes",
    youtubeId: "s_N9H4J1sW8",
    domain: "IP Connectivity",
    topic: "Static Routes",
    duration: "32:45",
    description: "Understanding administrative distance, metric, next-hops, and floating static routes."
  },
  {
    id: 15,
    title: "Day 26: OSPF Part 1 (Single Area Configuration)",
    youtubeId: "W7N6N9H4J1s",
    domain: "IP Connectivity",
    topic: "OSPF",
    duration: "41:12",
    description: "OSPF Link State Database (LSDB), neighborhood states, and Router ID election."
  },
  {
    id: 16,
    title: "Day 27: OSPF Part 2 (Multi-Area & Cost Tuning)",
    youtubeId: "W6K5cZ9S7A8",
    domain: "IP Connectivity",
    topic: "OSPF",
    duration: "36:50",
    description: "Multi-area OSPF design, reference bandwidth, interfaces cost, and passive interfaces."
  },

  // IP Services
  {
    id: 17,
    title: "Day 31: Dynamic Host Configuration Protocol (DHCP)",
    youtubeId: "Ak2h526U2P7",
    domain: "IP Services",
    topic: "DHCP",
    duration: "27:15",
    description: "The DORA process, configuring Cisco IOS DHCP Server pools, and DHCP Relay agents."
  },
  {
    id: 18,
    title: "Day 33: Network Address Translation (NAT & PAT)",
    youtubeId: "d7L_f8P_W2j",
    domain: "IP Services",
    topic: "NAT",
    duration: "39:30",
    description: "Static NAT, Dynamic NAT, and Port Address Translation (PAT/NAT Overload) configs."
  },
  {
    id: 19,
    title: "Day 34: NTP, Syslog & SNMP Management",
    youtubeId: "G7dF8m1Pz8x",
    domain: "IP Services",
    topic: "NTP",
    duration: "35:10",
    description: "Syncing time with Network Time Protocol and aggregating device logs with Syslog."
  },

  // Security Fundamentals
  {
    id: 20,
    title: "Day 29: Access Control Lists (Standard ACLs)",
    youtubeId: "W7N6N9H4J1u",
    domain: "Security Fundamentals",
    topic: "ACLs",
    duration: "36:12",
    description: "Creating numbered and named Standard Access Lists to filter traffic based on source IP."
  },
  {
    id: 21,
    title: "Day 30: Extended Access Control Lists (Extended ACLs)",
    youtubeId: "W6K5cZ9S7A9",
    domain: "Security Fundamentals",
    topic: "ACLs",
    duration: "40:05",
    description: "Filtering traffic by source, destination, protocol (TCP/UDP/ICMP), and port number."
  },
  {
    id: 22,
    title: "Day 42: Layer 2 Attack Mitigation & Port Security",
    youtubeId: "X7Y8Z9W0V1V",
    domain: "Security Fundamentals",
    topic: "Port Security",
    duration: "33:45",
    description: "Configuring static/sticky MAC limits and handling violations (Protect, Restrict, Shutdown)."
  },
  {
    id: 23,
    title: "Day 43: DHCP Snooping & Dynamic ARP Inspection (DAI)",
    youtubeId: "Ak2h526U2P8",
    domain: "Security Fundamentals",
    topic: "DHCP Snooping",
    duration: "31:50",
    description: "Mitigating rogue DHCP servers and ARP poisoning attacks using trusted interface rules."
  },

  // Automation and Programmability
  {
    id: 24,
    title: "Day 56: Introduction to Network Automation & Python",
    youtubeId: "d7L_f8P_W2k",
    domain: "Automation and Programmability",
    topic: "SDN",
    duration: "28:15",
    description: "Traditional device management vs controller-based Software-Defined Networking (SDN)."
  },
  {
    id: 25,
    title: "Day 57: JSON Data Format & REST APIs",
    youtubeId: "G7dF8m1Pz8y",
    domain: "Automation and Programmability",
    topic: "JSON",
    duration: "26:40",
    description: "Parsing JSON objects, arrays, and keys. Interacting with REST APIs via GET and POST requests."
  },
  {
    id: 26,
    title: "Day 58: NETCONF, RESTCONF & YANG Modeling",
    youtubeId: "W7N6N9H4J1v",
    domain: "Automation and Programmability",
    topic: "NETCONF",
    duration: "34:20",
    description: "Analyzing XML/JSON schemas via YANG models and querying RESTCONF resources."
  },
  {
    id: 27,
    title: "Day 59: Ansible, Puppet & Chef Configuration Management",
    youtubeId: "W6K5cZ9S7A0",
    domain: "Automation and Programmability",
    topic: "Ansible",
    duration: "29:10",
    description: "Agent vs agentless orchestration architectures. Running Ansible playbooks on network nodes."
  }
];
