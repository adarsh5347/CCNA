export const blueprint = [
  { name: "Network Fundamentals", weight: 20, topics: ["OSI", "TCP/IP", "IPv4", "IPv6", "Subnetting", "Ethernet", "ARP", "ICMP", "DNS", "DHCP"], count: 30 },
  { name: "Network Access", weight: 20, topics: ["VLANs", "Trunks", "STP", "EtherChannel", "Wireless"], count: 30 },
  { name: "IP Connectivity", weight: 25, topics: ["Routing", "OSPF", "Static Routes", "Route Selection"], count: 35 },
  { name: "IP Services", weight: 10, topics: ["DHCP", "NAT", "NTP", "Syslog", "SNMP"], count: 15 },
  { name: "Security Fundamentals", weight: 15, topics: ["ACLs", "SSH", "Port Security", "DHCP Snooping", "Wireless Security"], count: 25 },
  { name: "Automation and Programmability", weight: 10, topics: ["JSON", "REST APIs", "SDN", "DNA Center", "Ansible", "YANG", "NETCONF"], count: 15 }
];


const questionBank = [
  // ==========================================
  // NETWORK FUNDAMENTALS (1 - 25)
  // ==========================================
  {
    id: 1,
    domain: "Network Fundamentals",
    topic: "OSI Model",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "High",
    text: "At which layer of the OSI model does a network switch primarily operate to forward frames based on physical addresses?",
    options: [
      "Layer 1 (Physical)",
      "Layer 2 (Data Link)",
      "Layer 3 (Network)",
      "Layer 4 (Transport)"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "Standard Layer 2 switches operate at the Data Link layer, utilizing MAC addresses located in the Ethernet header to make forwarding decisions. Reference: IEEE 802.3.",
      wrong: [
        "Layer 1 deals with physical bits, cabling, and hubs, not frame forwarding.",
        "Layer 3 switches or routers forward packets based on IP addresses, not MAC addresses.",
        "Layer 4 processes segments using port numbers for TCP and UDP."
      ],
      tip: "Always remember: Switches forward frames based on MACs at Layer 2, while Routers forward packets based on IPs at Layer 3.",
      memory: "Data Link = MAC = Switch. Network = IP = Router.",
      real: "In a corporate LAN, when an access switch receives a frame from a PC, it looks up the destination MAC address at Layer 2 to determine the correct egress port.",
      commands: ["show mac address-table"]
    }
  },
  {
    id: 2,
    domain: "Network Fundamentals",
    topic: "TCP/IP Model",
    type: "dragdrop",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "Place the decapsulation steps of an incoming packet in the correct order, from receipt on physical media to application consumption.",
    order: [
      "Physical layer receives bits and converts them into an electrical/optical signal.",
      "Data Link layer verifies the FCS trailer and strips the Ethernet header.",
      "Network layer verifies the IP header destination and routes/strips it.",
      "Transport layer reassembles segments and delivers payload to application port."
    ],
    expl: {
      correct: "Correct Order",
      why: "Decapsulation moves from the bottom to the top of the protocol stack. The signal is received (L1), frame is verified and stripped (L2), packet is processed and stripped (L3), and the segment payload is delivered to the port (L4). Reference: RFC 1122.",
      wrong: [
        "Removing Layer 3 headers before Layer 2 is impossible because Layer 3 is encapsulated inside Layer 2.",
        "Delivering to the application before stripping the transport layer header breaks the OSI structure.",
        "Verifying the FCS trailer must happen first at the Data Link layer before any upper-layer headers are read."
      ],
      tip: "Encapsulation goes Top-Down (Data -> Segment -> Packet -> Frame -> Bits). Decapsulation goes Bottom-Up.",
      memory: "PDNTA: Please Do Not Take Away (Physical, Data Link, Network, Transport, Application).",
      real: "When a web browser receives data from a web server, the NIC first decapsulates the Layer 2 Ethernet frame before sending the Layer 3 IP packet up the OS stack.",
      commands: ["show interfaces"]
    }
  },
  {
    id: 3,
    domain: "Network Fundamentals",
    topic: "Ethernet",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "Medium",
    text: "A network topology consists of a single 24-port switch. Ports 1 through 10 are assigned to VLAN 10, ports 11 through 20 are assigned to VLAN 20, and ports 21 through 24 are unassigned in VLAN 1. How many broadcast domains exist on this switch?",
    options: [
      "1 broadcast domain",
      "2 broadcast domains",
      "3 broadcast domains",
      "24 broadcast domains"
    ],
    correct: [2],
    expl: {
      correct: "C",
      why: "A VLAN represents a distinct Layer 2 broadcast domain. Since there are three active VLANs (VLAN 10, VLAN 20, and the default VLAN 1 containing the unassigned ports), there are exactly 3 broadcast domains. Reference: Cisco VLAN design guides.",
      wrong: [
        "VLANs segment broadcast domains; they do not merge them into a single domain.",
        "There are three VLANs configured, not two (VLAN 1 still exists for the remaining ports).",
        "A switch has as many collision domains as there are active ports, but broadcast domains are defined by VLANs."
      ],
      tip: "One VLAN equals one subnet, which equals one broadcast domain.",
      memory: "VLAN = Broadcast Domain.",
      real: "Dividing a large network into VLAN 10 (Sales) and VLAN 20 (Finance) keeps broadcast traffic from one department from degrading the performance of the other.",
      commands: ["show vlan brief"]
    }
  },
  {
    id: 4,
    domain: "Network Fundamentals",
    topic: "Ethernet",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "High",
    text: "Which type of fiber-optic cabling is optimized for long-distance, high-bandwidth WAN applications by utilizing a very narrow core and a single ray of laser light?",
    options: [
      "Multimode Fiber (MMF)",
      "Single-mode Fiber (SMF)",
      "Unshielded Twisted Pair (UTP)",
      "Shielded Twisted Pair (STP)"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "Single-mode fiber (SMF) has a small core (typically 9 microns) and utilizes laser light to transmit data over tens of kilometers without significant dispersion. Reference: IEEE 802.3ae.",
      wrong: [
        "Multimode fiber (MMF) has a larger core and uses LEDs, which experience modal dispersion over long distances.",
        "UTP is copper-based cabling limited to 100 meters, not optical fiber.",
        "STP is shielded copper cabling, not optical fiber."
      ],
      tip: "Single-mode = Laser = Long distances. Multimode = LED = Short campus runs.",
      memory: "S in SMF stands for Single/Straight laser ray over long distances.",
      real: "Service providers run Single-mode fiber between metropolitan aggregation points, whereas they use Multimode fiber within a single datacenter rack layout.",
      commands: ["show interfaces transceiver"]
    }
  },
  {
    id: 5,
    domain: "Network Fundamentals",
    topic: "Ethernet",
    type: "multi",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "Medium",
    text: "Which two wire pairs are swapped between the T568A and T568B wiring standards for terminating RJ-45 Ethernet cables?",
    options: [
      "Green pair (Pins 1 and 2)",
      "Orange pair (Pins 3 and 6)",
      "Blue pair (Pins 4 and 5)",
      "Brown pair (Pins 7 and 8)"
    ],
    correct: [0, 1],
    expl: {
      correct: "A,B",
      why: "The primary difference between T568A and T568B is that the green pair (pins 1 & 2) and the orange pair (pins 3 & 6) are swapped. Pins 4 & 5 (blue) and 7 & 8 (brown) remain in the same positions. Reference: TIA/EIA-568.",
      wrong: [
        "The blue pair is centered on pins 4 and 5 in both T568A and T568B.",
        "The brown pair is always terminated on pins 7 and 8 in both standards.",
        "Only the orange and green pairs are swapped to configure straight-through vs crossover cables."
      ],
      tip: "Crossover cables originally swapped T568A on one end with T568B on the other.",
      memory: "GO (Green/Orange) is swapped. Blue and Brown stay home.",
      real: "Modern Cisco switches utilize Auto-MDIX to automatically resolve cabling mismatches, but structured cabling installations still strictly enforce either T568A or T568B.",
      commands: ["show controllers ethernet-controller"]
    }
  },
  {
    id: 6,
    domain: "Network Fundamentals",
    topic: "Ethernet",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "What does a Layer 2 switch do when it receives an Ethernet frame with a destination MAC address that is not present in its MAC address table?",
    options: [
      "It drops the frame immediately.",
      "It floods the frame out of all ports except the receiving port.",
      "It sends an ARP request to learn the destination port.",
      "It queries the DNS server for destination resolution."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "When a destination MAC is unknown (an unknown unicast), the switch floods the frame out of all ports within the ingress VLAN, except the port on which the frame was received. Reference: IEEE 802.1D.",
      wrong: [
        "Switches do not drop unknown unicast frames; they flood them to ensure delivery.",
        "Switches do not generate ARP requests; ARP is an end-host Layer 3 protocol.",
        "DNS resolves domain names to IP addresses and has no role in Layer 2 frame forwarding."
      ],
      tip: "Switches flood: 1) Broadcasts, 2) Multicasts, 3) Unknown Unicasts.",
      memory: "UUMB: Unknown Unicasts, Multicasts, Broadcasts are flooded.",
      real: "If a host has been silent and its MAC address has aged out of the switch's table, the switch will flood the next frame destined for it to locate its port.",
      commands: ["show mac address-table count"]
    }
  },
  {
    id: 7,
    domain: "Network Fundamentals",
    topic: "ARP",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "High",
    text: "Which destination MAC address is utilized in the Ethernet header of an ARP Request packet?",
    options: [
      "0000.0000.0000",
      "FFFF.FFFF.FFFF",
      "0100.5E00.0001",
      "The unicast MAC address of the target gateway"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "An ARP Request needs to reach all hosts on the local network segment to find the owner of the target IP address. Therefore, it is encapsulated in a Layer 2 broadcast frame with destination MAC FFFF.FFFF.FFFF. Reference: RFC 826.",
      wrong: [
        "0000.0000.0000 is an invalid address, not a broadcast MAC.",
        "0100.5E00.0001 is an IPv4 multicast MAC address range.",
        "The sender does not yet know the destination host's MAC address, which is the exact reason it is sending the ARP Request."
      ],
      tip: "ARP Requests are Broadcast (L2). ARP Replies are Unicast (L2).",
      memory: "Request = Everyone (Broadcast, FFFF). Reply = Only Me (Unicast).",
      real: "When you ping a local device for the first time, your system issues a broadcast ARP request asking 'Who has this IP? Tell me.'",
      commands: ["show arp", "clear arp-cache"]
    }
  },
  {
    id: 8,
    domain: "Network Fundamentals",
    topic: "IPv4",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "High",
    text: "Which IP address belongs to the private address ranges defined by RFC 1918?",
    options: [
      "127.0.0.1",
      "172.30.100.4",
      "169.254.1.1",
      "192.168.0.0/16 only (e.g. 192.169.1.5)"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "RFC 1918 defines three private IP ranges: 10.0.0.0/8, 172.16.0.0/12 (172.16.0.0 to 172.31.255.255), and 192.168.0.0/16. 172.30.100.4 falls within the Class B private range. Reference: RFC 1918.",
      wrong: [
        "127.0.0.1 is the local loopback address, not a routable private address.",
        "169.254.1.1 is an APIPA (Link-Local) address assigned when DHCP fails.",
        "192.169.1.5 falls outside the private Class C range (which ends at 192.168.255.255)."
      ],
      tip: "Memorize the RFC 1918 ranges: 10.x.x.x, 172.16.x.x to 172.31.x.x, and 192.168.x.x.",
      memory: "10, 172.16-31, 192.168 are internal-only addresses.",
      real: "When configuring a DHCP pool on an office router, you must use RFC 1918 private space to prevent routing conflicts on the public internet.",
      commands: ["show ip route"]
    }
  },
  {
    id: 9,
    domain: "Network Fundamentals",
    topic: "IPv6",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "Medium",
    text: "Which of the following is the most compressed correct representation of the IPv6 address: 2001:0db8:0000:0000:0008:0000:0000:4125?",
    options: [
      "2001:db8::8::4125",
      "2001:db8:0:0:8::4125",
      "2001:db8::8:0:0:4125",
      "2001:db8:0:0:8:0:0:4125"
    ],
    correct: [2],
    expl: {
      correct: "C",
      why: "Using the zero compression rule, a double colon (::) can replace the longest consecutive block of all-zero hextets, which is the first two all-zero hextets. Leading zeros are omitted (0db8 -> db8, 0008 -> 8). The second set of consecutive zeros cannot be replaced by :: because :: can only be used once in an IPv6 address. Reference: RFC 4291.",
      wrong: [
        "An IPv6 address can never have two double colons (::) as it creates routing ambiguity.",
        "While 2001:db8:0:0:8::4125 is mathematically correct, using :: for the first group of zeros results in 2001:db8::8:0:0:4125, which is more compressed.",
        "Leaving all zeros uncompressed fails to produce the most compressed representation."
      ],
      tip: "Rule 1: Drop leading zeros. Rule 2: Use double colon (::) once for the largest block of zeros.",
      memory: "Only use '::' once to keep the address size predictable at 128 bits.",
      real: "When configuring interface IPv6 addresses in Cisco IOS, you can type the compressed version directly to save time and prevent entry errors.",
      commands: ["show ipv6 interface brief"]
    }
  },
  {
    id: 10,
    domain: "Network Fundamentals",
    topic: "IPv6",
    type: "multi",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "Which two statements correctly describe the characteristics of IPv6 Link-Local addresses?",
    options: [
      "They are automatically generated using the prefix FE80::/10.",
      "They are globally routable across the internet.",
      "They are not forwarded past the local link by routers.",
      "They require a DHCPv6 server to be assigned."
    ],
    correct: [0, 2],
    expl: {
      correct: "A,C",
      why: "IPv6 Link-Local addresses use the prefix FE80::/10 (typically FE80::/64) and are intended for communication within a single local link segment. Routers never forward link-local packets to other networks. Reference: RFC 4291.",
      wrong: [
        "Link-local addresses are not globally routable; they are link-specific.",
        "They are generated automatically by hosts using SLAAC or static configuration, without needing a DHCPv6 server.",
        "IPv6 link-local addresses do not require manual subinterface configuration."
      ],
      tip: "IPv6 Link-Local = FE80::/10. Unique Local = FC00::/7. Global Unicast = 2000::/3.",
      memory: "FE80 is local to the interface, just like an internal link.",
      real: "OSPFv3 uses IPv6 link-local addresses as the next-hop IP when exchanging routing updates, keeping routing control traffic local to the physical link.",
      commands: ["show ipv6 route link-local"]
    }
  },
  {
    id: 11,
    domain: "Network Fundamentals",
    topic: "Subnetting",
    type: "single",
    difficulty: "Hard",
    examWeight: "20%",
    frequency: "High",
    text: "An administrator needs to identify the broadcast address for the subnet containing host 192.168.10.45/27. Which of the following is the correct broadcast address?",
    options: [
      "192.168.10.31",
      "192.168.10.47",
      "192.168.10.63",
      "192.168.10.255"
    ],
    correct: [2],
    expl: {
      correct: "C",
      why: "A /27 subnet mask has block increments of 32 (256 - 224 = 32). The subnets are 192.168.10.0, 192.168.10.32, 192.168.10.64, etc. Host 192.168.10.45 falls into the 192.168.10.32 subnet. The broadcast address is one less than the next subnet address: 64 - 1 = 63. Reference: RFC 4632.",
      wrong: [
        "192.168.10.31 is the broadcast address of the previous subnet (192.168.10.0/27).",
        "192.168.10.47 is within the subnet but is a usable host address, not the broadcast address.",
        "192.168.10.255 would be correct only if the subnet mask was /24."
      ],
      tip: "Find the block size (256 - mask octet), find the subnet start by finding the nearest multiple of the block size below the IP, and add (block size - 1) to get the broadcast.",
      memory: "Block size for /27 is 32. Multiples: 0, 32, 64. Broadcast is 64 - 1 = 63.",
      real: "Setting the correct broadcast address is essential; mismatched masks will cause communication failures on the local broadcast domain.",
      commands: ["show ip interface"]
    }
  },
  {
    id: 12,
    domain: "Network Fundamentals",
    topic: "Subnetting",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "How many usable host IP addresses are available in a single /28 IPv4 subnet?",
    options: [
      "14",
      "16",
      "30",
      "62"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "A /28 subnet leaves 4 bits for hosts (32 - 28 = 4). The formula for usable hosts is 2^h - 2, where h is host bits. 2^4 - 2 = 16 - 2 = 14 usable hosts. Reference: RFC 1878.",
      wrong: [
        "16 is the total number of addresses, but 2 are reserved for subnet and broadcast.",
        "30 is the number of usable hosts in a /27 subnet.",
        "62 is the number of usable hosts in a /26 subnet."
      ],
      tip: "Usable hosts is always 2^(32-prefix) - 2.",
      memory: "2^4 = 16. Subtract 2 for network and broadcast = 14.",
      real: "If a branch office needs to connect 12 VoIP phones and 1 printer, a /28 subnet is the most efficient choice because it provides exactly 14 usable IP addresses.",
      commands: ["show ip redirect"]
    }
  },
  {
    id: 13,
    domain: "Network Fundamentals",
    topic: "Subnetting",
    type: "single",
    difficulty: "Hard",
    examWeight: "20%",
    frequency: "High",
    text: "Host A is assigned the IP address 10.1.1.99/29 and Host B is assigned 10.1.1.105/29. They are connected to the same switch, but they cannot ping each other. What is the reason for this issue?",
    options: [
      "They are on the same subnet but require a default gateway to communicate.",
      "The IP addresses are in different subnets, preventing direct local Layer 2 communication.",
      "A /29 subnet mask only supports a maximum of 2 usable hosts, creating an address conflict.",
      "Host B is assigned the network ID of the subnet."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "A /29 subnet mask has a block size of 8. The subnets are 10.1.1.88, 10.1.1.96 (range .97-.102), and 10.1.1.104 (range .105-.110). Host A (.99) is in the .96 subnet, and Host B (.105) is in the .104 subnet. Since they are in different subnets, they cannot communicate directly without a router. Reference: RFC 4632.",
      wrong: [
        "Hosts in the same subnet do not need a gateway to communicate directly over a switch.",
        "A /29 supports 6 usable hosts (2^3 - 2), not 2.",
        "Host B (.105) is a valid usable host address in the 10.1.1.104/29 subnet (network ID is .104)."
      ],
      tip: "Always check if source and destination belong to the same subnet boundary when troubleshooting local connectivity.",
      memory: "Block size 8: .96 subnet ends at .103. .105 is in the next block.",
      real: "When configuring static IPs on network equipment, check the subnet boundaries. An incorrect mask will force local traffic to the gateway, causing dropouts.",
      commands: ["show ip route"]
    }
  },
  {
    id: 14,
    domain: "Network Fundamentals",
    topic: "ICMP",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "Medium",
    text: "Which ICMPv6 message type is sent by an IPv6 host to request the link-layer MAC address of a target neighbor node?",
    options: [
      "Router Solicitation (RS)",
      "Router Advertisement (RA)",
      "Neighbor Solicitation (NS)",
      "Neighbor Advertisement (NA)"
    ],
    correct: [2],
    expl: {
      correct: "C",
      why: "In IPv6, Neighbor Discovery Protocol (NDP) replaces ARP. A host sends a Neighbor Solicitation (NS) message to resolve a target IP address to a MAC address. The target responds with a Neighbor Advertisement (NA). Reference: RFC 4861.",
      wrong: [
        "Router Solicitation is sent by a host to locate local routers, not to resolve MAC addresses.",
        "Router Advertisement is sent by routers to advertise prefix and configuration options.",
        "Neighbor Advertisement is the response to an NS, not the initial request."
      ],
      tip: "NS is the IPv6 equivalent of an ARP Request; NA is the equivalent of an ARP Reply.",
      memory: "Solicitation = Asking/Requesting. Advertisement = Declaring/Replying.",
      real: "When you try to ping an IPv6 link-local address, your OS issues a Neighbor Solicitation multicast to locate the destination MAC address.",
      commands: ["show ipv6 neighbors"]
    }
  },
  {
    id: 15,
    domain: "Network Fundamentals",
    topic: "OSI Model",
    type: "matching",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "Match the network protocol characteristics to the correct transport protocol (TCP or UDP).",
    pairs: [
      ["Uses windowing and flow control", "TCP"],
      ["Provides low overhead connectionless delivery", "UDP"],
      ["Requires a three-way handshake", "TCP"],
      ["Used by real-time voice and video (VoIP)", "UDP"]
    ],
    expl: {
      correct: "Matching",
      why: "TCP provides connection-oriented, reliable delivery using windowing, flow control, and a three-way handshake. UDP provides low-overhead, connectionless delivery, which is ideal for real-time traffic like VoIP. Reference: RFC 793 and RFC 768.",
      wrong: [
        "UDP does not support windowing; it has no mechanism to adjust transmission speed based on receiver capability.",
        "TCP is not connectionless; it must establish a session before transmitting payload data.",
        "Handshakes are not used by UDP, which simply fires packets without verifying target state."
      ],
      tip: "TCP is chosen for reliability (HTTP, SSH); UDP is chosen for speed and low overhead (DNS, VoIP).",
      memory: "Handshake & Window = TCP. Fire & Forget = UDP.",
      real: "Web traffic (HTTPS) uses TCP to guarantee that files arrive intact, while voice streaming uses UDP to prevent delay from retransmissions.",
      commands: ["show tcp brief"]
    }
  },
  {
    id: 16,
    domain: "Network Fundamentals",
    topic: "DNS",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "High",
    text: "Which DNS resource record type is responsible for mapping a hostname to an IPv6 address?",
    options: [
      "A",
      "AAAA",
      "CNAME",
      "MX"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "The AAAA (quad-A) record maps a domain name to a 128-bit IPv6 address, whereas the A record maps to a 32-bit IPv4 address. Reference: RFC 3596.",
      wrong: [
        "The A record maps hostnames to IPv4 addresses.",
        "The CNAME record creates an alias pointing to another hostname.",
        "The MX record directs mail delivery servers to the domain's mail exchanger."
      ],
      tip: "AAAA is 'Quad-A' because an IPv6 address is four times larger than an IPv4 address.",
      memory: "A = IPv4. AAAA = IPv6 (4 times as many A's).",
      real: "When navigating to ipv6.google.com, your computer queries DNS for a AAAA record to establish an IPv6 session.",
      commands: ["nslookup"]
    }
  },
  {
    id: 17,
    domain: "Network Fundamentals",
    topic: "DHCP",
    type: "dragdrop",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "High",
    text: "Order the steps in the DHCPv4 DORA exchange process as they occur between a client and a server.",
    order: [
      "Discover: The client broadcasts a message to locate available DHCP servers.",
      "Offer: The server unicasts/broadcasts an IP address proposal to the client.",
      "Request: The client broadcasts a request to lease the proposed IP address.",
      "Acknowledge: The server confirms the lease and provides final parameters."
    ],
    expl: {
      correct: "Correct Order",
      why: "The DHCPv4 process follows the DORA sequence: Discover (broadcast by client), Offer (proposal by server), Request (selection by client), and Acknowledge (confirmation by server). Reference: RFC 2131.",
      wrong: [
        "The client cannot request an address before the server offers one.",
        "The server cannot acknowledge a lease before the client requests it.",
        "Discover must be the first step, as a client has no network settings initially."
      ],
      tip: "Remember the acronym DORA: Discover, Offer, Request, Acknowledge.",
      memory: "D-O-R-A: Client -> Server -> Client -> Server.",
      real: "When you boot your laptop on the office network, it sends a DHCP Discover broadcast to configure its IP configuration automatically.",
      commands: ["show ip dhcp binding"]
    }
  },
  {
    id: 18,
    domain: "Network Fundamentals",
    topic: "Ethernet",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "Medium",
    text: "What is the primary function of the Frame Check Sequence (FCS) field located in the Ethernet frame trailer?",
    options: [
      "To request retransmission of corrupt frames",
      "To perform error detection using a Cyclic Redundancy Check (CRC)",
      "To verify Layer 3 packet encapsulation integrity",
      "To specify frame forwarding priority"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "The FCS trailer contains a 32-bit CRC value. The receiving switch recalculates this value; if it matches the FCS header, the frame is processed. Otherwise, it is dropped as corrupt. Reference: IEEE 802.3.",
      wrong: [
        "Layer 2 switches do not request retransmission; that is handled by upper layers like TCP.",
        "FCS only validates the Layer 2 Ethernet frame, not upper-layer IP payloads.",
        "Frame priority is handled by 802.1Q PCP bits, not the FCS field."
      ],
      tip: "Layer 2 only performs error detection (via FCS). It does not perform error recovery.",
      memory: "FCS = Find Corrupt Signals.",
      real: "When checking switch interface statistics, incrementing CRC errors indicate physical cabling or interface issues detected by the FCS check.",
      commands: ["show interfaces gigabitethernet 0/1"]
    }
  },
  {
    id: 19,
    domain: "Network Fundamentals",
    topic: "Ethernet",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "High",
    text: "What is the standard Maximum Transmission Unit (MTU) size for a default Ethernet frame payload?",
    options: [
      "64 bytes",
      "512 bytes",
      "1500 bytes",
      "9000 bytes"
    ],
    correct: [2],
    expl: {
      correct: "C",
      why: "The default Ethernet MTU is 1500 bytes, which represents the maximum size of the Layer 3 packet payload encapsulated in the Layer 2 frame. Reference: IEEE 802.3.",
      wrong: [
        "64 bytes is the minimum Ethernet frame size, not the maximum payload.",
        "512 bytes is a common sector size, but not the standard MTU.",
        "9000 bytes is a jumbo frame size, which must be configured manually."
      ],
      tip: "Default Ethernet MTU = 1500 bytes. If traffic exceeds this, routers must fragment it unless DF is set.",
      memory: "1500 is the standard MTU limit for regular internet frames.",
      real: "Configuring VPN tunnels adds overhead, which requires reducing the IP MTU below 1500 to prevent fragmentation overhead.",
      commands: ["ip mtu 1400"]
    }
  },
  {
    id: 20,
    domain: "Network Fundamentals",
    topic: "IPv6",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "How does a host construct its 64-bit interface identifier from a 48-bit MAC address using the modified EUI-64 process?",
    options: [
      "By prepending FE80:: to the MAC address",
      "By inserting the hexadecimal value FFFE in the middle and flipping the 7th bit of the MAC address",
      "By appending FFFE to the end of the MAC address",
      "By applying a SHA-256 hash to the MAC address"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "The EUI-64 standard inserts FFFE in the middle of the MAC address (between the OUI and NIC extension) and flips the 7th bit (the Universal/Local bit) to form the 64-bit host portion of the IPv6 address. Reference: RFC 4291.",
      wrong: [
        "FE80:: is the prefix for Link-Local addresses, not the host interface ID.",
        "Appending FFFE to the end does not match EUI-64 rules.",
        "No hashing algorithm is used for standard EUI-64 address generation."
      ],
      tip: "EUI-64 steps: 1) Split MAC in half. 2) Insert FFFE. 3) Flip the 7th bit (2nd hex character).",
      memory: "FFFE in the middle, flip bit seven.",
      real: "A NIC with MAC 00-11-22-33-44-55 generates a host ID of 0211:22FF:FE33:4455 under the EUI-64 process.",
      commands: ["ipv6 address autoconfig"]
    }
  },
  {
    id: 21,
    domain: "Network Fundamentals",
    topic: "Subnetting",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "A subnet needs to accommodate exactly 60 host devices. Which subnet mask is the most efficient choice to meet this requirement without wasting IP addresses?",
    options: [
      "255.255.255.128 (/25)",
      "255.255.255.192 (/26)",
      "255.255.255.224 (/27)",
      "255.255.255.240 (/28)"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "A /26 mask (255.255.255.192) offers 6 host bits, yielding 2^6 - 2 = 62 usable host addresses. This efficiently accommodates 60 hosts. Reference: RFC 4632.",
      wrong: [
        "A /25 mask supports 126 usable hosts, which is less efficient and wastes IP addresses.",
        "A /27 mask only supports 30 usable hosts, which is insufficient.",
        "A /28 mask only supports 14 usable hosts, which is insufficient."
      ],
      tip: "Calculate the required host bits (h) where 2^h - 2 >= required hosts. For 60 hosts, h=6 (62 hosts). Mask prefix is 32 - 6 = /26.",
      memory: "/26 = 64 addresses = 62 hosts.",
      real: "When designing subnet layouts for corporate VLANs, choose a prefix size that allows for 20% host growth while keeping address wastage to a minimum.",
      commands: ["show ip interface brief"]
    }
  },
  {
    id: 22,
    domain: "Network Fundamentals",
    topic: "Network Fundamentals",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "Medium",
    text: "Which IEEE standard defines Power over Ethernet Plus (PoE+), and what is the maximum power it can deliver from a switch port?",
    options: [
      "IEEE 802.3af, delivering up to 15.4 Watts",
      "IEEE 802.3at, delivering up to 30 Watts",
      "IEEE 802.3bt, delivering up to 60 Watts",
      "IEEE 802.11ac, delivering up to 10 Watts"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "PoE+ is defined by IEEE 802.3at, which provides up to 30 Watts of DC power per port, supporting devices like pan-tilt-zoom cameras. Reference: IEEE 802.3at.",
      wrong: [
        "802.3af defines standard PoE (up to 15.4W), which is insufficient for newer hardware.",
        "802.3bt defines UPoE/PoE++ (up to 60W or 90W), not PoE+.",
        "802.11ac is a wireless communication standard and does not deliver wired power."
      ],
      tip: "PoE = 802.3af (15.4W). PoE+ = 802.3at (30W). PoE++ = 802.3bt (60-90W).",
      memory: "AT has more power than AF.",
      real: "When deploying high-power IP cameras or Wi-Fi 6 APs, verify that the access switch supports the 802.3at PoE+ standard to prevent power drops.",
      commands: ["show power inline"]
    }
  },
  {
    id: 23,
    domain: "Network Fundamentals",
    topic: "Ethernet",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "Medium",
    text: "What is the default aging time for MAC address table entries on a standard Cisco Catalyst switch?",
    options: [
      "60 seconds",
      "300 seconds",
      "600 seconds",
      "3600 seconds"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "Cisco Catalyst switches keep dynamically learned MAC addresses in the address table for a default of 300 seconds (5 minutes) of inactivity before purging them. Reference: Cisco switching guides.",
      wrong: [
        "60 seconds is too short, which would cause excessive unknown unicast flooding.",
        "600 seconds (10 minutes) is not the default configuration.",
        "3600 seconds (1 hour) is common for ARP cache timers, but not the switch MAC table."
      ],
      tip: "Switch MAC table default aging = 300 seconds. Router ARP cache default aging = 14400 seconds (4 hours).",
      memory: "300 seconds = 5 minutes of quiet time before a MAC is forgotten.",
      real: "If a host disconnects and moves to another port, the 300-second aging timer ensures the old table entry clears, preventing routing path mismatches.",
      commands: ["mac address-table aging-time 300"]
    }
  },
  {
    id: 24,
    domain: "Network Fundamentals",
    topic: "IPv4",
    type: "multi",
    difficulty: "Hard",
    examWeight: "20%",
    frequency: "Medium",
    text: "Which two fields are present in a standard IPv4 packet header but were removed or simplified in the IPv6 header?",
    options: [
      "Header Checksum",
      "TTL (Time to Live)",
      "Identification / Fragment Offset",
      "Source IP Address"
    ],
    correct: [0, 2],
    expl: {
      correct: "A,C",
      why: "The IPv6 header removes the Header Checksum (relying on Layer 2 and Layer 4 verification) and simplifies fragmentation by removing the Identification and Fragment Offset fields from the base header. Reference: RFC 8200.",
      wrong: [
        "TTL is renamed to Hop Limit in IPv6, but it is not removed.",
        "Source Address remains in the IPv6 header, though expanded to 128 bits.",
        "Version is still present in the IPv6 header, though the value is set to 6."
      ],
      tip: "IPv6 headers are simplified to 40 fixed bytes to speed up hardware forwarding.",
      memory: "Checksum and Fragmentation are gone from the basic IPv6 header.",
      real: "Because IPv6 removes the header checksum, routers do not have to recalculate a checksum at every hop, which reduces CPU overhead.",
      commands: ["show ipv6 traffic"]
    }
  },
  {
    id: 25,
    domain: "Network Fundamentals",
    topic: "ARP",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "High",
    text: "What is the destination MAC address used when an ARP reply is sent back to the requesting host?",
    options: [
      "FFFF.FFFF.FFFF",
      "The unicast MAC address of the requesting host",
      "0100.5E00.0002",
      "0000.0c07.ac01"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "An ARP Reply is unicast because the replying host already knows the requesting host's MAC address (which was included in the broadcast ARP Request). Reference: RFC 826.",
      wrong: [
        "FFFF.FFFF.FFFF is the broadcast MAC used for requests, not replies.",
        "0100.5E00.0002 is a multicast address, not a unicast MAC.",
        "0000.0c07.ac01 is an HSRP virtual MAC address, not an ARP reply."
      ],
      tip: "ARP Requests are Broadcast (FFFF). ARP Replies are Unicast (specific destination).",
      memory: "I know who asked, so I reply to them directly.",
      real: "When checking Wireshark captures, you will see a broadcast ARP Request followed by a unicast ARP Reply containing the requested hardware address.",
      commands: ["show arp"]
    }
  },

  // ==========================================
  // NETWORK ACCESS (26 - 50)
  // ==========================================
  {
    id: 26,
    domain: "Network Access",
    topic: "VLANs",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "High",
    text: "What is the default native VLAN on a Cisco Catalyst switch port configured as an 802.1Q trunk?",
    options: [
      "VLAN 0",
      "VLAN 1",
      "VLAN 99",
      "VLAN 100"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "By default, VLAN 1 is the native VLAN on all trunk interfaces on Cisco switches. Untagged traffic is assumed to belong to this native VLAN. Reference: IEEE 802.1Q.",
      wrong: [
        "VLAN 0 is reserved and cannot be configured.",
        "VLAN 99 is a common management VLAN used in training labs, but it is not the default native VLAN.",
        "VLAN 100 must be manually created and is not a default configuration."
      ],
      tip: "Security best practices recommend changing the native VLAN from the default VLAN 1 to an unused VLAN ID.",
      memory: "Default native is always 1.",
      real: "Leaving native VLAN on 1 exposes the network to VLAN hopping attacks. Security policies require moving native traffic to a non-routing VLAN.",
      commands: ["switchport trunk native vlan 999"]
    }
  },
  {
    id: 27,
    domain: "Network Access",
    topic: "VLANs",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "Medium",
    text: "What is the valid range of VLAN IDs for Normal Range VLANs configured on a Cisco Catalyst switch?",
    options: [
      "1 - 1005",
      "1 - 4094",
      "2 - 1024",
      "1006 - 4094"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "Normal range VLANs are numbered 1 to 1005. VLANs 1002 to 1005 are reserved for legacy networks like Token Ring and FDDI. Reference: Cisco VLAN guidelines.",
      wrong: [
        "1 to 4094 is the complete range of all configurable VLANs (normal and extended combined).",
        "2 to 1024 is an incorrect range.",
        "1006 to 4094 is the range for Extended VLANs, which are stored in running-config rather than vlan.dat."
      ],
      tip: "Normal VLANs: 1-1005 (stored in vlan.dat). Extended VLANs: 1006-4094 (stored in running-config).",
      memory: "Normal ends at 1005. Extended starts at 1006.",
      real: "When configuring small to medium networks, stick to normal range VLANs to ensure compatibility across older switch models.",
      commands: ["show vlan"]
    }
  },
  {
    id: 28,
    domain: "Network Access",
    topic: "Trunks",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "Switch port Gi0/1 on Switch A is configured as 'switchport mode dynamic desirable'. Gi0/1 on Switch B is configured as 'switchport mode dynamic auto'. What link state will be negotiated between the switches?",
    options: [
      "An access link in the default VLAN",
      "An 802.1Q trunk link",
      "A blocked link due to negotiation mismatch",
      "An EtherChannel bundle"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "DTP mode dynamic desirable actively attempts to negotiate a trunk link. Dynamic auto is willing to trunk if the other side requests it. Therefore, they will negotiate an 802.1Q trunk. Reference: Cisco DTP documentation.",
      wrong: [
        "An access link is formed only if both sides are dynamic auto, or if trunking is disabled.",
        "There is no mismatch; dynamic desirable and dynamic auto negotiate a trunk.",
        "EtherChannel requires manual configuration or PAgP/LACP negotiations."
      ],
      tip: "Dynamic Auto + Dynamic Auto = Access. Any other dynamic combination containing Dynamic Desirable = Trunk.",
      memory: "Desirable actively asks. Auto waits to be asked. If one asks, they trunk.",
      real: "Disable DTP in production using 'switchport nonegotiate' to prevent unauthorized devices from negotiating trunks.",
      commands: ["show dtp interface gigabitethernet 0/1"]
    }
  },
  {
    id: 29,
    domain: "Network Access",
    topic: "Trunks",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "Medium",
    text: "How many bytes does the IEEE 802.1Q tag add to a standard Ethernet frame header when encapsulating VLAN traffic?",
    options: [
      "2 bytes",
      "4 bytes",
      "8 bytes",
      "12 bytes"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "The 802.1Q standard inserts a 4-byte VLAN tag into the original Ethernet header between the Source MAC address and EtherType fields. Reference: IEEE 802.1Q.",
      wrong: [
        "2 bytes is the size of the TPID field inside the tag, not the entire tag.",
        "8 bytes is the size of the Ethernet preamble, not the VLAN tag.",
        "12 bytes is the size of the MAC address fields combined."
      ],
      tip: "The 802.1Q tag contains a 2-byte TPID (0x8100) and a 2-byte TCI (containing PCP, DEI, and the 12-bit VLAN ID).",
      memory: "Q Tag = 4 bytes.",
      real: "Because the tag adds 4 bytes, the maximum length of a tagged frame increases to 1522 bytes, which must be supported by switch hardware.",
      commands: ["show interfaces trunk"]
    }
  },
  {
    id: 30,
    domain: "Network Access",
    topic: "STP",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "If all switches in a spanning-tree topology are left with their default bridge priority of 32768, how does Spanning Tree Protocol (STP) determine which switch becomes the Root Bridge?",
    options: [
      "The switch with the highest IP address on its management loopback",
      "The switch with the lowest MAC address",
      "The switch that has been online the longest",
      "The switch with the highest MAC address"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "The Bridge ID (BID) consists of Bridge Priority and MAC Address. If the priorities are identical, the switch with the lowest MAC address becomes the root bridge. Reference: IEEE 802.1D.",
      wrong: [
        "IP addresses are not used in Spanning Tree calculations.",
        "System uptime does not affect STP Root elections.",
        "The highest MAC address loses the election."
      ],
      tip: "In STP, 'lowest' is almost always preferred: lowest bridge ID, lowest path cost, lowest port ID.",
      memory: "Equal Priority? Lowest MAC wins root.",
      real: "Leaving default priorities allows an older, slow access switch with a lower MAC address to become the root bridge, causing traffic bottlenecks.",
      commands: ["spanning-tree vlan 1 priority 4096"]
    }
  },
  {
    id: 31,
    domain: "Network Access",
    topic: "STP",
    type: "dragdrop",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "Order the states through which a standard 802.1D Spanning Tree port transitions when moving from a disabled state to an active forwarding state.",
    order: [
      "Blocking: The port discards data frames and does not learn MAC addresses.",
      "Listening: The port processes BPDUs but does not learn MAC addresses or forward data.",
      "Learning: The port begins building the MAC table but does not forward data.",
      "Forwarding: The port fully forwards data frames and continues learning MACs."
    ],
    expl: {
      correct: "Correct Order",
      why: "Standard STP ports transition through Blocking (immediately upon link up), Listening (15s Forward Delay to elect root and roles), Learning (15s Forward Delay to populate MAC table), and Forwarding. Reference: IEEE 802.1D.",
      wrong: [
        "A port cannot learn MAC addresses in the Listening state.",
        "Forwarding cannot occur before the learning phase concludes.",
        "Blocking is the initial state, not a transition state between Learning and Forwarding."
      ],
      tip: "The transition from Blocking to Forwarding takes 30 seconds by default (15 seconds Listening + 15 seconds Learning).",
      memory: "B-L-L-F: Block, Listen, Learn, Forward.",
      real: "Connecting a PC to an unconfigured port causes a 30-second delay before the PC gets an IP via DHCP, which can be resolved by enabling PortFast.",
      commands: ["spanning-tree portfast"]
    }
  },
  {
    id: 32,
    domain: "Network Access",
    topic: "STP",
    type: "matching",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "Match the Spanning Tree port roles to their correct operational definitions.",
    pairs: [
      ["Root Port", "The port on a non-root switch with the lowest path cost to the root bridge."],
      ["Designated Port", "The port on a segment that forwards traffic away from the root bridge."],
      ["Alternate Port", "A blocking port that acts as a backup path to the root bridge."]
    ],
    expl: {
      correct: "Matching",
      why: "Every non-root switch elects one Root Port. On each segment, a Designated Port is selected to forward traffic. Alternate ports (in Rapid PVST+) block traffic to prevent loops while standing by as backup paths. Reference: IEEE 802.1w.",
      wrong: [
        "A root bridge has designated ports, never root ports.",
        "Alternate ports do not forward traffic; they block it until a topology change occurs.",
        "Disabled ports do not send BPDUs or participate in any Spanning Tree operations."
      ],
      tip: "All active ports on a Root Bridge must be Designated Ports.",
      memory: "Root Port = Path to Root. Designated = Boss of the segment. Alternate = Backup.",
      real: "When debugging loops, verify which port is the Root Port to understand the switch's forwarding path to the core.",
      commands: ["show spanning-tree summary"]
    }
  },
  {
    id: 33,
    domain: "Network Access",
    topic: "STP",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "Which of the following lists the three port states utilized by Rapid Spanning Tree Protocol (RSTP / 802.1w)?",
    options: [
      "Blocking, Listening, Forwarding",
      "Discarding, Learning, Forwarding",
      "Disabled, Blocking, Learning",
      "Listening, Learning, Forwarding"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "RSTP simplifies port states by merging Disabled, Blocking, and Listening into a single state: Discarding. The other two active states are Learning and Forwarding. Reference: IEEE 802.1w.",
      wrong: [
        "Blocking and Listening are 802.1D states and do not exist in RSTP.",
        "Disabled and Blocking are legacy states merged into Discarding.",
        "RSTP does not use a separate Listening state."
      ],
      tip: "RSTP combines the three inactive states into 'Discarding' to simplify the protocol.",
      memory: "DLF: Discard, Learn, Forward.",
      real: "Deploying Rapid PVST+ reduces network convergence time from 30-50 seconds to under 2 seconds during link failures.",
      commands: ["spanning-tree mode rapid-pvst"]
    }
  },
  {
    id: 34,
    domain: "Network Access",
    topic: "STP",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "A port-level security feature is configured on an access port connected to an office desk. If BPDU Guard is enabled, what action does the switch take if it receives a Spanning Tree BPDU on that port?",
    options: [
      "It blocks the BPDU but keeps the port operational in access mode.",
      "It transitions the port into the err-disabled state, shutting it down.",
      "It changes the port role to a designated port.",
      "It disables Spanning Tree globally on the switch."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "BPDU Guard protects ports where no switches should be connected (like client ports with PortFast). If a BPDU is received, it assumes an unauthorized switch has been connected and puts the port in err-disabled state to prevent loops. Reference: Cisco STP security configuration guides.",
      wrong: [
        "The switch does not keep the port operational; it disables it to prevent loops.",
        "A port receiving unexpected BPDUs cannot safely become a designated port.",
        "BPDU Guard operates on a per-port basis and will not disable Spanning Tree globally."
      ],
      tip: "Configure BPDU Guard on all PortFast-enabled access ports to secure the edge network.",
      memory: "BPDU Guard = Guard the edge. Switch plugged in? Err-disable.",
      real: "If an employee plugs a home switch into a wall outlet, BPDU Guard will instantly disable the port and trigger a syslog warning.",
      commands: ["spanning-tree bpduguard enable", "show interfaces status err-disabled"]
    }
  },
  {
    id: 35,
    domain: "Network Access",
    topic: "EtherChannel",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "High",
    text: "Which open standard protocol is defined by IEEE 802.3ad/802.1AX to negotiate EtherChannel links between devices?",
    options: [
      "PAgP (Port Aggregation Protocol)",
      "LACP (Link Aggregation Control Protocol)",
      "DTP (Dynamic Trunking Protocol)",
      "VTP (VLAN Trunking Protocol)"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "LACP is the industry-standard link aggregation protocol. PAgP is Cisco proprietary. Reference: IEEE 802.1AX.",
      wrong: [
        "PAgP is Cisco proprietary, not an open standard.",
        "DTP is for negotiating trunk links, not bundling physical ports.",
        "VTP manages VLAN databases across switches, not link aggregation."
      ],
      tip: "LACP = Industry Standard (Active/Passive). PAgP = Cisco Proprietary (Desirable/Auto).",
      memory: "LACP: Link Aggregation Control Protocol = Standard.",
      real: "When bundling links between a Cisco switch and a virtualized server, configure LACP to ensure compatibility.",
      commands: ["channel-group 1 mode active"]
    }
  },
  {
    id: 36,
    domain: "Network Access",
    topic: "EtherChannel",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "Medium",
    text: "Switch A is configured with 'channel-group 1 mode auto'. Switch B is configured with 'channel-group 1 mode auto'. What is the status of the resulting PAgP EtherChannel?",
    options: [
      "The EtherChannel will form successfully.",
      "The EtherChannel will fail to form because both ports are in passive negotiation mode.",
      "The switches will negotiate LACP instead.",
      "The ports will shut down due to an err-disable state."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "The 'auto' mode under PAgP is a passive mode that waits for the other side to initiate negotiation. Since both sides are in passive 'auto' mode, neither initiates negotiation, and the bundle fails to form. Reference: Cisco EtherChannel guide.",
      wrong: [
        "An EtherChannel will not form if both sides are passive.",
        "Auto mode is specific to PAgP; switches cannot negotiate LACP unless the mode is changed to 'active' or 'passive'.",
        "Passive modes do not trigger an err-disabled state; they simply fail to bundle."
      ],
      tip: "At least one side of an EtherChannel must be in active negotiation mode (desirable for PAgP, active for LACP).",
      memory: "Auto + Auto = No Channel. Desirable + Auto = Channel.",
      real: "When configuring bundles, configure one side as 'desirable' and the other as 'auto' to ensure PAgP forms correctly.",
      commands: ["show etherchannel summary"]
    }
  },
  {
    id: 37,
    domain: "Network Access",
    topic: "EtherChannel",
    type: "multi",
    difficulty: "Hard",
    examWeight: "20%",
    frequency: "High",
    text: "Which three configuration parameters must match exactly on all physical interfaces to successfully form an EtherChannel bundle?",
    options: [
      "Speed and Duplex settings",
      "Allowed VLAN list on trunk ports",
      "Spanning Tree cost values",
      "Switchport access VLAN ID (on access ports)",
      "IP addresses of the physical interfaces"
    ],
    correct: [0, 1, 3],
    expl: {
      correct: "A,B,D",
      why: "Physical characteristics (speed, duplex) and Layer 2 settings (VLAN mode, access VLAN, allowed trunks) must match exactly on all member ports to form an EtherChannel. Reference: Cisco EtherChannel guides.",
      wrong: [
        "Spanning Tree costs are applied to the logical Port-Channel interface, not the physical interfaces.",
        "Physical interfaces bundled into a Layer 2 EtherChannel do not have individual IP addresses.",
        "The port-channel interface ID does not need to match on both switches."
      ],
      tip: "Configure settings directly on the Port-Channel interface rather than individual ports to avoid configuration drift.",
      memory: "SDS: Speed, Duplex, Switchport settings must match.",
      real: "If Gi0/1 is set to VLAN 10 and Gi0/2 is accidentally left in VLAN 1, the EtherChannel negotiation will fail and log a configuration mismatch error.",
      commands: ["show etherchannel port-channel"]
    }
  },
  {
    id: 38,
    domain: "Network Access",
    topic: "Wireless",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "High",
    text: "What protocol is utilized by lightweight access points (LAPs) to tunnel client traffic back to a centralized Wireless LAN Controller (WLC)?",
    options: [
      "LWAPP (Lightweight Access Point Protocol) only",
      "CAPWAP (Control and Provisioning of Wireless Access Points)",
      "HSRP (Hot Standby Router Protocol)",
      "IPsec (Internet Protocol Security)"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "CAPWAP is the standard protocol (based on LWAPP) used for communication and traffic encapsulation between LAPs and a WLC. Reference: RFC 5415.",
      wrong: [
        "LWAPP is the legacy Cisco-proprietary predecessor to CAPWAP.",
        "HSRP is a gateway redundancy protocol for routing, not wireless encapsulation.",
        "IPsec is a framework for VPNs, not default AP-to-WLC tunnels."
      ],
      tip: "CAPWAP uses UDP ports 5246 (Control) and 5247 (Data) to manage APs and tunnel traffic.",
      memory: "CAPWAP caps and wraps wireless traffic to the controller.",
      real: "In a centralized campus Wi-Fi deployment, all user data from APs is encapsulated in CAPWAP and sent to the WLC for security policy enforcement.",
      commands: ["show capwap client ip connection"]
    }
  },
  {
    id: 39,
    domain: "Network Access",
    topic: "Wireless",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "High",
    text: "In the 2.4 GHz wireless spectrum, which three channels are standard non-overlapping channels in North America?",
    options: [
      "1, 6, 11",
      "2, 7, 12",
      "3, 8, 13",
      "36, 40, 44"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "The 2.4 GHz band has 11 channels in North America, spaced 5 MHz apart. Because each channel requires 20-22 MHz of bandwidth, only channels 1, 6, and 11 do not overlap. Reference: IEEE 802.11.",
      wrong: [
        "Channels 2, 7, and 12 overlap with adjacent channels.",
        "Channels 3, 8, and 13 overlap, and channel 13 is restricted in some regions.",
        "Channels 36, 40, and 44 are located in the 5 GHz band, not 2.4 GHz."
      ],
      tip: "Always use channels 1, 6, and 11 when planning 2.4 GHz coverage to avoid co-channel interference.",
      memory: "1 - 6 - 11: The golden rule of 2.4 GHz.",
      real: "When installing APs in an office, space out their channels using 1, 6, and 11 to prevent interference between adjacent cells.",
      commands: ["show ap config general"]
    }
  },
  {
    id: 40,
    domain: "Network Access",
    topic: "Wireless",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "What cryptographic authentication protocol is introduced in WPA3 to replace the vulnerable Pre-Shared Key (PSK) handshake used in WPA2?",
    options: [
      "TKIP (Temporal Key Integrity Protocol)",
      "SAE (Simultaneous Authentication of Equals)",
      "WEP (Wired Equivalent Privacy)",
      "EAP-TLS"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "WPA3 replaces WPA2-PSK with Simultaneous Authentication of Equals (SAE), which uses a secure key exchange (Dragonfly handshake) to protect against offline dictionary attacks. Reference: Wi-Fi Alliance WPA3 specification.",
      wrong: [
        "TKIP was used in WPA to patch WEP and is now deprecated.",
        "WEP is a legacy algorithm with severe vulnerabilities.",
        "EAP-TLS is an enterprise certificate-based authentication method, not a PSK replacement."
      ],
      tip: "SAE prevents attackers from capturing a handshake and cracking it offline.",
      memory: "SAE: Secure Access for Everyone (or Equals) in WPA3.",
      real: "Upgrading home or small office networks to WPA3-Personal ensures that weak passwords cannot be easily cracked using packet captures.",
      commands: ["show wlan summary"]
    }
  },
  {
    id: 41,
    domain: "Network Access",
    topic: "Wireless",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "Medium",
    text: "What does a Basic Service Set Identifier (BSSID) represent in an 802.11 wireless network?",
    options: [
      "The user-friendly text name of the Wi-Fi network",
      "The physical MAC address of the access point's radio interface",
      "The IP address of the Wireless LAN Controller",
      "The security key used for WPA encryption"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "A BSSID is the unique MAC address of the wireless radio on the AP that serves the BSS. The SSID is the text name of the network. Reference: IEEE 802.11.",
      wrong: [
        "The user-friendly text name is the SSID.",
        "The WLC IP is used for AP management, not local cell identification.",
        "The security key is part of authentication, not AP identification."
      ],
      tip: "SSID is a text name (e.g., 'Guest-WiFi'). BSSID is a MAC address (e.g., 00:11:22:AA:BB:CC).",
      memory: "BSSID: B stands for Burned-in MAC address of the radio.",
      real: "When analyzing Wi-Fi issues with a wireless scanner, you will see multiple BSSIDs (MACs) broadcasting the same SSID (network name) across the building.",
      commands: ["show ap wlan connection"]
    }
  },
  {
    id: 42,
    domain: "Network Access",
    topic: "Wireless",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "Low",
    text: "On a Cisco Catalyst switch, what does a blinking green port status LED indicate during normal operation?",
    options: [
      "The port is disabled by an administrator.",
      "The port is actively sending or receiving network traffic.",
      "The port has experienced a link-down event.",
      "The port is undergoing Spanning Tree convergence."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "A blinking green LED indicates that the port is link-up and actively transmitting or receiving frame traffic. Reference: Cisco hardware installation guides.",
      wrong: [
        "A disabled port has its LED turned off.",
        "A link-down event has its LED turned off.",
        "A port in Spanning Tree convergence shows a solid amber LED."
      ],
      tip: "Solid Green = Link Up. Blinking Green = Activity. Solid Amber = Blocked/STP. Off = No Link.",
      memory: "Blinking Green = Traffic moving.",
      real: "During a physical patch panel check, look for blinking green lights to verify which links are active.",
      commands: ["show interfaces status"]
    }
  },
  {
    id: 43,
    domain: "Network Access",
    topic: "VLANs",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "What configuration command must be applied to a router subinterface to configure Router-on-a-Stick for VLAN 20?",
    options: [
      "switchport access vlan 20",
      "encapsulation dot1Q 20",
      "vlan 20",
      "ip address vlan 20"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "To enable Router-on-a-Stick, the router subinterface must be configured with 'encapsulation dot1Q <vlan-id>' to tag and receive traffic for that specific VLAN. Reference: Cisco IOS routing guides.",
      wrong: [
        "switchport access vlan 20 is a switch-port command, not a router subinterface command.",
        "vlan 20 creates a VLAN database entry on a switch, not a router subinterface.",
        "ip address vlan 20 is invalid syntax."
      ],
      tip: "Configure encapsulation on the subinterface before assigning its IP address, as the router requires encapsulation configuration to define IP parameters.",
      memory: "encapsulation dot1Q VLAN_ID links the subinterface to the tag.",
      real: "When configuring a router for Router-on-a-Stick, configure subinterfaces like Gi0/0.20 with 'encapsulation dot1Q 20' to route traffic for the client VLAN.",
      commands: ["encapsulation dot1Q 20"]
    }
  },
  {
    id: 44,
    domain: "Network Access",
    topic: "VLANs",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "What interface is configured on a Layer 3 switch to assign an IP address and act as a default gateway for a local VLAN?",
    options: [
      "An access port",
      "An SVI (Switch Virtual Interface)",
      "A loopback interface",
      "A subinterface"
    ],
    correct: [0], // Wait, the correct option is SVI. SVI is option B, which is index 1.
    options: [
      "An access port interface",
      "An SVI (Switch Virtual Interface)",
      "A loopback interface",
      "A trunk port subinterface"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "An SVI (e.g., interface Vlan 10) is a logical Layer 3 interface on a switch. Assigning an IP address to this interface allows it to route traffic for that VLAN. Reference: Cisco L3 switching guides.",
      wrong: [
        "Access ports are Layer 2 only and cannot host default gateway IP addresses.",
        "Loopback interfaces are virtual testing interfaces, not gateways for local VLAN hosts.",
        "Subinterfaces are used on routers for Router-on-a-Stick, not on Layer 3 switches."
      ],
      tip: "Enable 'ip routing' globally on a Cisco Layer 3 switch to activate routing between SVIs.",
      memory: "SVI = Switch Virtual Interface = Gateway on a Switch.",
      real: "In a collapsed core design, the core Layer 3 switch hosts SVIs for VLAN 10 and 20, routing traffic between them at wire speed.",
      commands: ["interface vlan 10", "ip address 10.1.10.1 255.255.255.0", "no shutdown"]
    }
  },
  {
    id: 45,
    domain: "Network Access",
    topic: "Wireless",
    type: "multi",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "Medium",
    text: "Which two statements correctly describe differences between Cisco Discovery Protocol (CDP) and Link Layer Discovery Protocol (LLDP)?",
    options: [
      "CDP is Cisco-proprietary, while LLDP is an open standard defined by IEEE 802.1AB.",
      "LLDP is enabled by default on all Cisco devices, while CDP must be manually activated.",
      "CDP operates at Layer 3, while LLDP operates at Layer 2.",
      "LLDP supports TLVs (Type-Length-Value) to share custom device attributes."
    ],
    correct: [0, 3],
    expl: {
      correct: "A,D",
      why: "CDP is Cisco proprietary; LLDP is an IEEE standard (802.1AB). Both operate at Layer 2. LLDP uses TLVs to extend its discovery features. Reference: IEEE 802.1AB.",
      wrong: [
        "CDP is enabled by default on Cisco switches, while LLDP often must be configured manually using 'lldp run'.",
        "Both protocols operate at Layer 2, not Layer 3.",
        "Neither protocol operates at Layer 4 or manages transport ports."
      ],
      tip: "Use 'cdp run' or 'lldp run' globally, and 'no cdp enable' on edge interfaces for security.",
      memory: "CDP = Cisco. LLDP = Link Standard (IEEE). Both L2.",
      real: "When configuring IP phones from another vendor, enable LLDP on the switchport to negotiate the voice VLAN.",
      commands: ["lldp run", "show lldp neighbors"]
    }
  },
  {
    id: 46,
    domain: "Network Access",
    topic: "Wireless",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "Low",
    text: "Which lightweight AP mode is designed to dedicate its radios to scanning the RF channels for rogue APs and wireless attacks without serving client traffic?",
    options: [
      "Local Mode",
      "Monitor Mode",
      "FlexConnect Mode",
      "Bridge Mode"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "Monitor mode configures the AP to act as a dedicated sensor. Its radios scan channels to collect IDS data, locate rogue devices, and measure RF interference, but it does not allow client connections. Reference: Cisco AP deployment models.",
      wrong: [
        "Local mode is the default state that serves wireless clients while performing minor scanning.",
        "FlexConnect mode allows APs to switch traffic locally when WLC connection is lost.",
        "Bridge mode links distant locations over point-to-point wireless connections."
      ],
      tip: "Use Monitor mode APs to build an intrusion detection system (WIDS/WIPS) without adding user load.",
      memory: "Monitor mode = Monitor only, no clients.",
      real: "A network design includes four local mode APs to provide office Wi-Fi, and one monitor mode AP to scan for rogue hotspots.",
      commands: ["show ap config general"]
    }
  },
  {
    id: 47,
    domain: "Network Access",
    topic: "Trunks",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "What is the primary operational issue caused by a native VLAN mismatch configuration on a trunk link between two switches?",
    options: [
      "The link will shut down due to an err-disable state.",
      "Traffic from one VLAN may leak into a different VLAN, creating a security and routing risk.",
      "The switches will automatically disable Spanning Tree.",
      "LACP negotiation will fail to bundle the links."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "If Switch A uses VLAN 10 as native and Switch B uses VLAN 20, untagged traffic sent by Switch A (VLAN 10) is received by Switch B and placed in VLAN 20. This leaks traffic between VLANs. Reference: Cisco STP and Trunking guidelines.",
      wrong: [
        "Native mismatch does not trigger err-disabled state directly, although CDP will log console warnings.",
        "Spanning Tree remains active but may experience loop issues due to misaligned topology information.",
        "Trunk configuration mismatches do not affect LACP negotiations directly."
      ],
      tip: "Always ensure the native VLAN configuration matches on both ends of a trunk link.",
      memory: "Native mismatch = VLAN leaking.",
      real: "During a network audit, check console logs for '%CDP-4-NATIVE_VLAN_MISMATCH' to identify trunk configuration errors.",
      commands: ["show interfaces trunk"]
    }
  },
  {
    id: 48,
    domain: "Network Access",
    topic: "Wireless",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "Medium",
    text: "Which Layer 2 port security action is the default violation mode on Cisco Catalyst switches?",
    options: [
      "Protect",
      "Restrict",
      "Shutdown",
      "Block"
    ],
    correct: [2],
    expl: {
      correct: "C",
      why: "Shutdown is the default violation mode. If a violation occurs, the port transitions to the err-disabled state, turning off the LED and generating a SNMP trap/syslog message. Reference: Cisco Port Security guidelines.",
      wrong: [
        "Protect drops traffic from unauthorized MACs but does not log a warning or disable the port.",
        "Restrict drops traffic, increments the violation counter, and generates a syslog, but keeps the port up.",
        "Block is not a port security violation mode."
      ],
      tip: "Shutdown mode requires manual intervention ('shutdown' then 'no shutdown') or errdisable recovery to re-enable the port.",
      memory: "Default = Shutdown = Err-disable.",
      real: "When a user plugs an unauthorized laptop into a port configured with default port security, the port shuts down instantly.",
      commands: ["switchport port-security violation shutdown"]
    }
  },
  {
    id: 49,
    domain: "Network Access",
    topic: "Trunks",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "High",
    text: "Which field in the 802.1Q header tag is used to identify the VLAN to which the frame belongs?",
    options: [
      "TPID (Tag Protocol Identifier)",
      "PCP (Priority Code Point)",
      "VID (VLAN Identifier)",
      "DEI (Drop Eligible Indicator)"
    ],
    correct: [2],
    expl: {
      correct: "C",
      why: "The VID (VLAN Identifier) is a 12-bit field that specifies the frame's VLAN. A 12-bit field supports up to 4096 unique VLAN IDs. Reference: IEEE 802.1Q.",
      wrong: [
        "TPID is set to 0x8100 to identify the frame as 802.1Q tagged.",
        "PCP is a 3-bit field used for Class of Service (CoS) priority tagging.",
        "DEI is a 1-bit field that indicates if a frame can be dropped during congestion."
      ],
      tip: "The 12-bit VID field is the reason why we can have a maximum of 4094 usable VLANs.",
      memory: "VID = VLAN ID.",
      real: "When sniffing a trunk port with Wireshark, check the 802.1Q tag header to verify that the VID field matches the expected configuration.",
      commands: ["show interfaces trunk"]
    }
  },
  {
    id: 50,
    domain: "Network Access",
    topic: "VLANs",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "Medium",
    text: "Which switch command assigns Voice VLAN 150 to a physical interface already configured for access VLAN 10?",
    options: [
      "switchport access vlan 150 voice",
      "switchport voice vlan 150",
      "switchport trunk allowed vlan 10,150",
      "voice-vlan 150 enable"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "To configure an IP phone and PC on the same port, configure the port for access VLAN 10 and apply 'switchport voice vlan 150' to carry voice traffic. Reference: Cisco IP Telephony guides.",
      wrong: [
        "switchport access vlan 150 voice is incorrect syntax.",
        "switchport trunk allowed vlan 10,150 is for trunk interfaces, not hybrid access/voice ports.",
        "voice-vlan 150 enable is invalid syntax."
      ],
      tip: "Voice VLANs allow switches to segregate data and voice traffic onto separate subnets, protecting voice traffic with Quality of Service (QoS).",
      memory: "switchport voice vlan VLAN_ID.",
      real: "Configure IP phones on a desktop port with 'switchport voice vlan' to separate voice traffic from the user's PC traffic.",
      commands: ["switchport voice vlan 150"]
    }
  },

  // ==========================================
  // IP CONNECTIVITY (51 - 80)
  // ==========================================
  {
    id: 51,
    domain: "IP Connectivity",
    topic: "Route Selection",
    type: "single",
    difficulty: "Hard",
    examWeight: "25%",
    frequency: "High",
    text: "A router receives a packet destined for IP address 172.16.5.37. The routing table contains four matching routes. Which route will the router select to forward the packet?",
    options: [
      "172.16.5.0/24 [110/20] via OSPF",
      "172.16.5.32/27 [90/3072] via EIGRP",
      "172.16.5.32/28 [1/0] via Static",
      "172.16.5.36/30 [110/50] via OSPF"
    ],
    correct: [3],
    expl: {
      correct: "D",
      why: "Routers select routes based on Longest Prefix Match (the most specific route with the longest subnet mask). Address 172.16.5.37 falls inside the 172.16.5.36/30 range (which contains addresses .36 through .39). Since /30 is the longest subnet mask, this route is selected regardless of Administrative Distance. Reference: Cisco route selection principles.",
      wrong: [
        "172.16.5.0/24 has a shorter prefix (/24 vs /30).",
        "172.16.5.32/27 has a shorter prefix (/27 vs /30).",
        "172.16.5.32/28 has a shorter prefix (/28 vs /30) and the IP falls outside the range (.32 to .47), though it is not the longest match."
      ],
      tip: "Longest prefix match is always evaluated first. Administrative distance is only compared when there is a tie in prefix length.",
      memory: "Longest mask wins, always.",
      real: "When troubleshooting routing, check the subnet masks. A more specific static route (/32) will override a default route (/0) or summary route.",
      commands: ["show ip route 172.16.5.37"]
    }
  },
  {
    id: 52,
    domain: "IP Connectivity",
    topic: "Route Selection",
    type: "matching",
    difficulty: "Easy",
    examWeight: "25%",
    frequency: "High",
    text: "Match the routing protocols to their default Administrative Distance (AD) values as defined in Cisco IOS.",
    pairs: [
      ["Static Route", "1"],
      ["Internal EIGRP Route", "90"],
      ["OSPF Route", "110"],
      ["RIP Route", "120"]
    ],
    expl: {
      correct: "Matching",
      why: "Cisco IOS uses default AD values to rate the trustworthiness of route sources: Static=1, EIGRP=90, OSPF=110, and RIP=120. Reference: Cisco Administrative Distance documentation.",
      wrong: [
        "OSPF does not have an AD of 90; 90 is reserved for EIGRP.",
        "Static routes have an AD of 1, making them more trusted than dynamic routing protocols.",
        "RIP has an AD of 120, making it the least trusted default protocol listed."
      ],
      tip: "Lower AD is more trusted. Directly connected routes have the lowest default AD of 0.",
      memory: "Static=1, EIGRP=90, OSPF=110, RIP=120.",
      real: "If a router learns the same route from both OSPF and EIGRP, it will install the EIGRP route in the routing table because of its lower AD (90 vs 110).",
      commands: ["show ip route"]
    }
  },
  {
    id: 53,
    domain: "IP Connectivity",
    topic: "Static Routes",
    type: "single",
    difficulty: "Easy",
    examWeight: "25%",
    frequency: "High",
    text: "What is the correct syntax to configure a default static route pointing to the next-hop IP address 192.168.1.1?",
    options: [
      "ip route 0.0.0.0 0.0.0.0 192.168.1.1",
      "ip route 255.255.255.255 255.255.255.255 192.168.1.1",
      "ip route 192.168.1.1 0.0.0.0 0.0.0.0",
      "ip route default-gateway 192.168.1.1"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "A default static route uses a prefix of 0.0.0.0 and a mask of 0.0.0.0, followed by the next-hop IP address or exit interface. Reference: Cisco static routing guidelines.",
      wrong: [
        "255.255.255.255 is a host broadcast address, not a default route.",
        "Listing the next-hop first is invalid syntax; the destination prefix must come first.",
        "ip route default-gateway is invalid Cisco IOS command syntax."
      ],
      tip: "The 0.0.0.0 0.0.0.0 route is called the quad-zero route and matches any destination address not present in the routing table.",
      memory: "ip route 0.0.0.0 0.0.0.0 NEXT_HOP.",
      real: "Configure a default route on an edge router pointing to the ISP gateway to forward outbound internet traffic.",
      commands: ["ip route 0.0.0.0 0.0.0.0 192.168.1.1"]
    }
  },
  {
    id: 54,
    domain: "IP Connectivity",
    topic: "Static Routes",
    type: "single",
    difficulty: "Medium",
    examWeight: "25%",
    frequency: "High",
    text: "An administrator wants to configure a floating static route as a backup to a primary OSPF routing path. What change must be made to the backup static route configuration?",
    options: [
      "Configure the static route with an Administrative Distance of 1.",
      "Configure the static route with an Administrative Distance higher than 110.",
      "Assign the static route a metric cost of 10.",
      "Configure the static route with a /32 host mask."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "OSPF has a default AD of 110. A floating static route acts as a backup and should only appear in the routing table when OSPF fails. Setting its AD higher than 110 (e.g., 120 or 250) keeps it inactive until the primary route drops. Reference: Cisco static routing guides.",
      wrong: [
        "Setting the AD to 1 (default) makes the static route primary, overriding OSPF.",
        "Static routes do not use routing metrics to compare against dynamic protocol metrics.",
        "A /32 host mask is for targeting a single host, not configuring a floating backup route."
      ],
      tip: "A floating static route is created by adding an administrative distance at the end of the 'ip route' command.",
      memory: "Float higher: AD must be higher than the primary protocol's AD.",
      real: "Configure a floating static route pointing to a backup LTE connection with an AD of 200, which will activate if the primary MPLS link (OSPF) goes down.",
      commands: ["ip route 10.0.0.0 255.0.0.0 172.16.1.1 200"]
    }
  },
  {
    id: 55,
    domain: "IP Connectivity",
    topic: "OSPF",
    type: "single",
    difficulty: "Easy",
    examWeight: "25%",
    frequency: "High",
    text: "What are the default OSPF Hello and Dead timer intervals on a standard Ethernet broadcast multi-access interface?",
    options: [
      "Hello: 10 seconds; Dead: 40 seconds",
      "Hello: 5 seconds; Dead: 20 seconds",
      "Hello: 30 seconds; Dead: 120 seconds",
      "Hello: 60 seconds; Dead: 180 seconds"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "On broadcast and point-to-point networks, OSPF defaults to a 10-second Hello interval and a 40-second Dead interval (which is 4 times the Hello timer). Reference: RFC 2328.",
      wrong: [
        "5s/20s is not a default Cisco OSPF timer value.",
        "30s/120s is the default for OSPF non-broadcast multi-access (NBMA) networks.",
        "60s/180s is not an OSPF default interval."
      ],
      tip: "OSPF Hello and Dead timers must match exactly between two adjacent routers to form a neighbor relationship.",
      memory: "Hello is 10, Dead is 4x Hello (40).",
      real: "When configuring OSPF across an IPsec tunnel, ensure that default timers have not been modified on one side, which would prevent neighbor adjacency.",
      commands: ["ip ospf hello-interval 10", "show ip ospf interface"]
    }
  },
  {
    id: 56,
    domain: "IP Connectivity",
    topic: "OSPF",
    type: "dragdrop",
    difficulty: "Medium",
    examWeight: "25%",
    frequency: "High",
    text: "Order the OSPF neighbor states in the sequence they occur as two routers establish a full adjacency on a multi-access link.",
    order: [
      "Init: The router receives a Hello packet containing its own Router ID.",
      "2-Way: Bidirectional communication is established, and DR/BDR election occurs.",
      "ExStart: Routers decide the Master/Slave relationship and initial database sequence number.",
      "Loading: Link-State Requests are sent to fetch missing update details.",
      "Full: Database synchronization is complete, and the routers are fully adjacent."
    ],
    expl: {
      correct: "Correct Order",
      why: "The OSPF state machine transitions through Down -> Init (hello received) -> 2-Way (bidirectional communication) -> ExStart (master/slave election) -> Exchange (LSA headers exchanged) -> Loading (LSAs requested and sent) -> Full (synchronized). Reference: RFC 2328.",
      wrong: [
        "The 2-Way state must occur before Master/Slave negotiation in ExStart.",
        "Loading cannot occur before the database exchange phase has completed.",
        "Database synchronization is verified in the Full state, which is the final step."
      ],
      tip: "The 2-Way state is the final stable state for routers that are not elected DR or BDR on a multi-access network.",
      memory: "I 2-Way ExStart Exchange Loading Full.",
      real: "If OSPF neighbors are stuck in the Exchange state, check for an MTU mismatch on the connecting interfaces.",
      commands: ["show ip ospf neighbor"]
    }
  },
  {
    id: 57,
    domain: "IP Connectivity",
    topic: "OSPF",
    type: "single",
    difficulty: "Medium",
    examWeight: "25%",
    frequency: "High",
    text: "How does OSPF select the Designated Router (DR) on an Ethernet multi-access segment if all router interface priorities are left at the default value of 1?",
    options: [
      "The router that has been online the longest is elected.",
      "The router with the highest OSPF Router ID is elected.",
      "The router with the lowest IP address on the interface is elected.",
      "A DR is not elected on Ethernet networks."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "The OSPF DR election first uses the highest interface priority. If there is a tie (e.g. all set to default priority 1), the router with the highest OSPF Router ID is elected. Reference: RFC 2328.",
      wrong: [
        "System uptime does not affect OSPF elections.",
        "The lowest IP address is not preferred; highest router ID breaks the tie.",
        "Ethernet is a broadcast multi-access network, which requires a DR/BDR election."
      ],
      tip: "To prevent a router from participating in a DR election, configure its OSPF interface priority to 0.",
      memory: "Default priority equal? Highest RID wins DR.",
      real: "In multi-access VLANs, configure your core router with 'ip ospf priority 255' to ensure it is always elected DR.",
      commands: ["ip ospf priority 255"]
    }
  },
  {
    id: 58,
    domain: "IP Connectivity",
    topic: "OSPF",
    type: "single",
    difficulty: "Medium",
    examWeight: "25%",
    frequency: "High",
    text: "What is the correct order of precedence used by an OSPF router to determine its Router ID (RID)?",
    options: [
      "Highest active physical IP, then highest active loopback IP, then manual router-id command",
      "Manual router-id command, then highest active loopback IP, then highest active physical IP",
      "Lowest active physical IP, then highest active loopback IP, then manual router-id command",
      "Manual router-id command, then lowest active loopback IP, then lowest active physical IP"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "The OSPF RID selection process first uses the manual 'router-id' configuration. If not configured, the router chooses the highest IP address among active loopback interfaces. If no loopbacks are active, it uses the highest IP address among active physical interfaces. Reference: RFC 2328.",
      wrong: [
        "Loopback interfaces are preferred over physical interfaces because they are virtual and never go down.",
        "The highest IP address is preferred, not the lowest.",
        "Manual configuration is always preferred over automatic discovery."
      ],
      tip: "Always manually configure the OSPF Router ID to keep it stable during interface state changes.",
      memory: "Manual -> Loopback -> Physical (Highest).",
      real: "If you configure a loopback interface with IP 10.99.99.99, it automatically becomes the OSPF RID upon reload, unless overridden by the 'router-id' command.",
      commands: ["router-id 1.1.1.1"]
    }
  },
  {
    id: 59,
    domain: "IP Connectivity",
    topic: "OSPF",
    type: "single",
    difficulty: "Medium",
    examWeight: "25%",
    frequency: "Medium",
    text: "What formula does OSPF use to calculate the cost metric of a physical interface by default on Cisco IOS routers?",
    options: [
      "Cost = 100,000,000 / Interface Bandwidth (in bps)",
      "Cost = Hop Count * 10",
      "Cost = Interface Delay + Bandwidth",
      "Cost = Reliability / Interface Bandwidth"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "Cisco OSPF uses a default reference bandwidth of 100 Mbps (10^8 bps). The interface cost is calculated as Reference Bandwidth / Interface Bandwidth. E.g., a 10 Mbps Ethernet link has a cost of 10 (100M / 10M). Reference: Cisco OSPF configuration guides.",
      wrong: [
        "Hop count is the metric for RIP, not OSPF.",
        "Bandwidth and Delay are used by EIGRP for its composite metric calculations.",
        "Reliability is not used in OSPF cost calculations."
      ],
      tip: "With a default reference bandwidth of 100 Mbps, FastEthernet (100M), GigabitEthernet (1G), and 10-Gigabit links all end up with a minimum cost of 1. You must increase the reference bandwidth to support links faster than 100 Mbps.",
      memory: "OSPF Cost = 10^8 / Bandwidth.",
      real: "Configure 'auto-cost reference-bandwidth 1000' globally to allow OSPF to distinguish between Gigabit (cost 1) and FastEthernet (cost 10) interfaces.",
      commands: ["auto-cost reference-bandwidth 1000"]
    }
  },
  {
    id: 60,
    domain: "IP Connectivity",
    topic: "OSPF",
    type: "single",
    difficulty: "Hard",
    examWeight: "25%",
    frequency: "High",
    text: "Which OSPF network command correctly matches the interface IP address 10.2.3.69/28 and assigns it to backbone Area 0?",
    options: [
      "network 10.2.3.69 0.0.0.0 area 0",
      "network 10.2.3.64 0.0.0.15 area 0",
      "network 10.2.3.0 0.0.0.255 area 0",
      "network 10.2.3.64 0.0.0.240 area 0"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "A /28 subnet has a wildcard mask of 0.0.0.15 (255.255.255.255 - 255.255.255.240 = 0.0.0.15). The subnet starting address is 10.2.3.64 (block size of 16; range is .64 to .79). Therefore, 'network 10.2.3.64 0.0.0.15 area 0' matches the subnet. Reference: Cisco OSPF configuration guides.",
      wrong: [
        "network 10.2.3.69 0.0.0.0 area 0 matches only the specific IP, which is functional but not the subnet definition.",
        "network 10.2.3.0 0.0.0.255 area 0 is a /24 wildcard, which is too broad.",
        "0.0.0.240 is not a valid wildcard mask for a /28 subnet."
      ],
      tip: "Calculate the wildcard mask by inverting the subnet mask (subtract each octet from 255).",
      memory: "Subnet mask 255.255.255.240 -> Wildcard 0.0.0.15.",
      real: "Using precise wildcard masks in OSPF prevents interfaces on other subnets from joining OSPF without authorization.",
      commands: ["network 10.2.3.64 0.0.0.15 area 0"]
    }
  },
  {
    id: 61,
    domain: "IP Connectivity",
    topic: "Routing",
    type: "single",
    difficulty: "Easy",
    examWeight: "25%",
    frequency: "Medium",
    text: "Which First Hop Redundancy Protocol (FHRP) is a Cisco-proprietary protocol that allows multiple routers to share a single virtual IP and MAC address?",
    options: [
      "HSRP (Hot Standby Router Protocol)",
      "VRRP (Virtual Router Redundancy Protocol)",
      "GLBP (Gateway Load Balancing Protocol)",
      "OSPF"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "HSRP is a Cisco-proprietary FHRP that provides default gateway redundancy. VRRP is an open standard. Reference: RFC 2281.",
      wrong: [
        "VRRP is an open standard protocol, not Cisco proprietary.",
        "GLBP is another Cisco protocol, but it performs active load balancing rather than active/standby redundancy.",
        "OSPF is a routing protocol, not a gateway redundancy protocol."
      ],
      tip: "HSRP uses the state terms Active and Standby. VRRP uses Master and Backup.",
      memory: "HSRP = Cisco Active/Standby.",
      real: "Configure HSRP on a pair of distribution switches to provide clients with a virtual default gateway address that remains active if one switch fails.",
      commands: ["standby 1 ip 192.168.1.254"]
    }
  },
  {
    id: 62,
    domain: "IP Connectivity",
    topic: "Static Routes",
    type: "single",
    difficulty: "Hard",
    examWeight: "25%",
    frequency: "Medium",
    text: "What is the disadvantage of configuring a static route using only an Ethernet exit interface (e.g. ip route 10.0.0.0 255.0.0.0 Gi0/0) instead of a next-hop IP address?",
    options: [
      "The router will drop all packets because the next-hop MAC cannot be resolved.",
      "The router assumes all destinations are directly connected and sends an ARP request for every packet destination, causing high CPU load and cache exhaustion.",
      "The route is automatically assigned an Administrative Distance of 255.",
      "OSPF will refuse to form adjacencies over that interface."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "When a static route points to a multi-access exit interface (like Ethernet) without a next-hop IP, the router treats the destination network as directly connected. It sends an ARP request for every destination IP, which can exhaust the ARP cache and trigger high CPU load. Reference: Cisco static routing guidelines.",
      wrong: [
        "The router will not drop packets immediately; it will attempt to resolve MACs using ARP.",
        "Using an exit interface does not change the default AD (which remains 1).",
        "OSPF operation is not affected by static route interface configurations."
      ],
      tip: "Always use the next-hop IP address when configuring static routes over multi-access interfaces like Ethernet.",
      memory: "Ethernet exit static route = Proxy ARP flood.",
      real: "If a static route points to an Ethernet interface, a scan targeting millions of IPs will cause the router to send millions of ARP requests, degrading performance.",
      commands: ["show ip arp", "show ip route"]
    }
  },
  {
    id: 63,
    domain: "IP Connectivity",
    topic: "OSPF",
    type: "single",
    difficulty: "Medium",
    examWeight: "25%",
    frequency: "High",
    text: "What is the effect of configuring the OSPF command 'passive-interface GigabitEthernet0/1'?",
    options: [
      "OSPF will not run on the interface, and its subnet will not be advertised.",
      "The interface will not send or receive OSPF Hellos, but its connected subnet will still be advertised to neighbors.",
      "OSPF will negotiate a static neighbor relationship on that port.",
      "The interface will block all incoming user data traffic."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "The passive-interface command stops the router from sending and receiving OSPF Hello packets on that interface, preventing neighbor relationships from forming. However, the interface's subnet is still advertised in LSAs to other routers. Reference: Cisco OSPF configuration guides.",
      wrong: [
        "The subnet is still advertised; it is not excluded from OSPF updates.",
        "Passive interface stops hello processing; it does not establish static neighbors.",
        "User data traffic is not blocked; only OSPF routing packets are stopped."
      ],
      tip: "Configure passive-interface on ports connected to loopbacks, computers, or printers to save bandwidth and improve security.",
      memory: "Passive interface: No hellos, but still advertised.",
      real: "When configuring a router, make the user LAN interfaces passive to prevent users from starting rogue OSPF routers and injecting bad routes.",
      commands: ["passive-interface GigabitEthernet0/1"]
    }
  },
  {
    id: 64,
    domain: "IP Connectivity",
    topic: "OSPF",
    type: "single",
    difficulty: "Medium",
    examWeight: "25%",
    frequency: "High",
    text: "An administrator runs the command 'show ip ospf neighbor' and notices that the neighbor state for a switch link is stuck in '2-Way'. What does this state indicate?",
    options: [
      "There is an MTU mismatch preventing database exchange.",
      "The routers have negotiated bidirectional communication, and both are DRothers on a multi-access segment, which is normal behavior.",
      "The router has failed to authenticate with its neighbor.",
      "The OSPF timer values are mismatched."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "On a multi-access network (like Ethernet), routers form full adjacencies only with the DR and BDR. DRothers (routers that are neither DR nor BDR) establish bidirectional communication (2-Way) and stop negotiating further. This is normal behavior. Reference: RFC 2328.",
      wrong: [
        "MTU mismatches cause neighbors to get stuck in ExStart or Exchange states.",
        "Authentication failures prevent neighbors from reaching even the Init state.",
        "Timer mismatches prevent the neighbor state machine from starting."
      ],
      tip: "DRothers will show a state of '2-WAY/DROTHER' when connected to each other.",
      memory: "2-Way/DROTHER is normal for non-DR/BDR neighbors on a shared segment.",
      real: "In a VLAN with 5 routers, only the DR and BDR will show 'FULL'. The other routers will show '2-WAY' with each other.",
      commands: ["show ip ospf neighbor"]
    }
  },
  {
    id: 65,
    domain: "IP Connectivity",
    topic: "OSPF",
    type: "multi",
    difficulty: "Hard",
    examWeight: "25%",
    frequency: "High",
    text: "Which three parameters must match exactly between two adjacent OSPFv2 routers to form an adjacency?",
    options: [
      "Hello and Dead Intervals",
      "Area ID",
      "Interface IP Subnet and Subnet Mask",
      "OSPF Process ID",
      "Router ID"
    ],
    correct: [0, 1, 2],
    expl: {
      correct: "A,B,C",
      why: "To form an adjacency, routers must agree on Hello/Dead timers, Area ID, interface IP subnet/mask, and authentication. Reference: RFC 2328.",
      wrong: [
        "The OSPF Process ID is locally significant and does not need to match between routers.",
        "The Router ID must be unique; duplicate Router IDs prevent adjacencies from forming.",
        "The interface IP address must belong to the same subnet, but host portions must be unique."
      ],
      tip: "Mismatched parameters (especially timers) are the most common cause of OSPF adjacency issues.",
      memory: "TAMS: Timers, Area, Mask, Subnet must match.",
      real: "If you configure Router A with a hello interval of 10s and Router B with 15s, they will never establish an OSPF adjacency.",
      commands: ["show ip ospf interface brief"]
    }
  },
  {
    id: 66,
    domain: "IP Connectivity",
    topic: "OSPF",
    type: "single",
    difficulty: "Easy",
    examWeight: "25%",
    frequency: "High",
    text: "Which command is used to display OSPF neighbor relationships, their state, and their interface IPs?",
    options: [
      "show ip route ospf",
      "show ip ospf neighbor",
      "show ip ospf database",
      "show ip ospf interface"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "'show ip ospf neighbor' displays details about OSPF neighbors, including their Router ID, state (e.g. FULL, 2-Way), address, and interface. Reference: Cisco OSPF command references.",
      wrong: [
        "show ip route ospf displays OSPF routes installed in the routing table, not neighbor details.",
        "show ip ospf database shows LSAs, link states, and network structure.",
        "show ip ospf interface displays OSPF configuration settings on local interfaces."
      ],
      tip: "Use 'show ip ospf neighbor' as your first step when troubleshooting OSPF routing issues.",
      memory: "neighbor = neighbor state.",
      real: "When verifying a newly configured WAN connection, run 'show ip ospf neighbor' to confirm the connection is in the 'FULL' state.",
      commands: ["show ip ospf neighbor"]
    }
  },
  {
    id: 67,
    domain: "IP Connectivity",
    topic: "OSPF",
    type: "single",
    difficulty: "Medium",
    examWeight: "25%",
    frequency: "Medium",
    text: "Why is it recommended to configure a Loopback interface on a router running OSPF?",
    options: [
      "Loopback interfaces speed up routing calculations.",
      "A loopback interface never goes down unless manually shut, providing a stable Router ID.",
      "OSPF requires at least one loopback interface to operate.",
      "Loopback interfaces encrypt routing updates automatically."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "Physical interfaces can flap (go up and down), which can force OSPF to recalculate the Router ID and cause routing disruption. Loopbacks are virtual interfaces that remain up, providing a stable Router ID. Reference: Cisco OSPF design guides.",
      wrong: [
        "Loopbacks do not affect the SPF algorithm's execution speed.",
        "OSPF does not require loopbacks to operate; it can use active physical IPs.",
        "Loopback interfaces do not provide encryption."
      ],
      tip: "Configure a loopback IP (like 10.255.255.1/32) to ensure a stable OSPF RID and management IP.",
      memory: "Loopback = Always Up = Stable Router ID.",
      real: "Configure loopbacks on your core switches to provide a stable destination for network management tools and OSPF RIDs.",
      commands: ["interface loopback 0", "ip address 1.1.1.1 255.255.255.255"]
    }
  },
  {
    id: 68,
    domain: "IP Connectivity",
    topic: "OSPF",
    type: "single",
    difficulty: "Medium",
    examWeight: "25%",
    frequency: "High",
    text: "Which command configures an OSPF router to advertise its local default static route to all other routers in the OSPF area?",
    options: [
      "ip route 0.0.0.0 0.0.0.0 interface",
      "default-information originate",
      "redistribute static subnets",
      "default-router originate"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "The 'default-information originate' command instructs OSPF to generate a default route (LSA Type 5) and advertise it to neighbors, provided a default static route is configured on the router. Reference: Cisco OSPF configuration guides.",
      wrong: [
        "ip route defines a static route, but does not advertise it to OSPF neighbors.",
        "redistribute static advertises all static routes, but is not the recommended way to advertise default routes.",
        "default-router originate is incorrect syntax."
      ],
      tip: "Use 'default-information originate always' to advertise the default route even if the router lacks a static default route in its table.",
      memory: "default-information originate = Send default route via OSPF.",
      real: "On the edge router connected to the ISP, run 'default-information originate' to configure internal routers to route outbound traffic through it.",
      commands: ["default-information originate always"]
    }
  },
  {
    id: 69,
    domain: "IP Connectivity",
    topic: "Route Selection",
    type: "single",
    difficulty: "Hard",
    examWeight: "25%",
    frequency: "Medium",
    text: "A router receives an IPv6 packet destined for 2001:db8:acad:1::55. The routing table contains three matching routes. Which route will the router use to forward the packet?",
    options: [
      "2001:db8:acad::/48 [110/10]",
      "2001:db8:acad:1::/64 [90/2000]",
      "2001:db8:acad:1::50/124 [1/0]",
      "2001:db8::/32 [110/100]"
    ],
    correct: [1], // Wait, let's verify if the IP fits: 2001:db8:acad:1::55.
    // The range for 2001:db8:acad:1::50/124 is from 2001:db8:acad:1::50 to 2001:db8:acad:1::5F.
    // Address 55 is between 50 and 5F.
    // So 2001:db8:acad:1::50/124 matches!
    // Wait, let's look at the options:
    // Option A: /48 (matches)
    // Option B: /64 (matches)
    // Option C: /124 (matches, because 55 fits in .50 to .5F block of 16 addresses).
    // Option D: /32 (matches)
    // The longest prefix match is /124!
    // Let's check: 55 in hex is 0101 0101.
    // 50 in hex is 0101 0000.
    // Mask /124 means the first 124 bits match.
    // An IPv6 address has 128 bits. The last 4 bits are for the host.
    // 124 bits covers up to the second-to-last hex character.
    // The last hex character is 5 (0101), and for 50 it is 0 (0000).
    // Wait! If the last 4 bits are host bits, then the network address is 2001:db8:acad:1::50.
    // The host bits can vary from 0 to F.
    // So the address range is 2001:db8:acad:1::50 to 2001:db8:acad:1::5F.
    // Since 55 falls within this range, Option C (/124) is a match and has the longest prefix!
    // Wait, option C is: "2001:db8:acad:1::50/124 [1/0] via Static".
    // Let's verify if index 2 is correct. Yes, index 2 corresponds to C.
    // Let's double check if we can make it simpler:
    // How about option C is /128? e.g., 2001:db8:acad:1::55/128?
    // Yes! /128 is even clearer as a host route and is definitely the longest match.
    // Let's use 2001:db8:acad:1::55/128 [1/0] to make it simple and unambiguous.
    options: [
      "2001:db8:acad::/48 [110/10]",
      "2001:db8:acad:1::/64 [90/2000]",
      "2001:db8:acad:1::55/128 [1/0]",
      "2001:db8::/32 [110/100]"
    ],
    correct: [2],
    expl: {
      correct: "C",
      why: "Like IPv4, IPv6 routing uses Longest Prefix Match. Address 2001:db8:acad:1::55 matches /128 (host route), /64, /48, and /32. The router selects the /128 host route because it is the most specific match. Reference: RFC 4291.",
      wrong: [
        "2001:db8:acad::/48 has a shorter prefix (/48 vs /128).",
        "2001:db8:acad:1::/64 has a shorter prefix (/64 vs /128).",
        "2001:db8::/32 has the shortest prefix match, which is less preferred."
      ],
      tip: "Host routes in IPv6 have a /128 prefix, whereas IPv4 host routes use /32.",
      memory: "Longest prefix always wins in both IPv4 and IPv6.",
      real: "Use a /128 host route when defining static routes to target virtual endpoints, like loopbacks or management portals.",
      commands: ["show ipv6 route"]
    }
  },
  {
    id: 70,
    domain: "IP Connectivity",
    topic: "Static Routes",
    type: "single",
    difficulty: "Easy",
    examWeight: "25%",
    frequency: "High",
    text: "Which command configures an IPv6 static default route pointing to the next-hop address 2001:db8:a::1?",
    options: [
      "ipv6 route ::/0 2001:db8:a::1",
      "ipv6 route 2001:db8:a::1 ::/0",
      "ipv6 route default 2001:db8:a::1",
      "ip route ::/0 2001:db8:a::1"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "In IPv6, the default route is represented by '::/0' (all zeros prefix with length 0). The command syntax is 'ipv6 route <prefix> <next-hop>'. Reference: Cisco IPv6 configuration guides.",
      wrong: [
        "Listing the next-hop before the destination is invalid syntax.",
        "The keyword 'default' is not used in static route commands.",
        "The 'ip route' command is for IPv4; IPv6 routes must use 'ipv6 route'."
      ],
      tip: "Ensure 'ipv6 unicast-routing' is enabled globally on the router before configuring IPv6 routing.",
      memory: "ipv6 route ::/0 NEXT_HOP.",
      real: "On an enterprise edge router, configure an IPv6 default route pointing to the ISP's IPv6 gateway interface.",
      commands: ["ipv6 unicast-routing", "ipv6 route ::/0 2001:db8:a::1"]
    }
  },
  {
    id: 71,
    domain: "IP Connectivity",
    topic: "OSPF",
    type: "single",
    difficulty: "Hard",
    examWeight: "25%",
    frequency: "Medium",
    text: "What is a key difference in configuration and behavior between OSPFv2 (IPv4) and OSPFv3 (IPv6)?",
    options: [
      "OSPFv3 utilizes Hop Count as its metric, whereas OSPFv2 uses bandwidth cost.",
      "OSPFv3 is configured directly on the interface, whereas OSPFv2 is traditionally configured under the router configuration process using network commands.",
      "OSPFv3 requires BGP to be configured as a prerequisite.",
      "OSPFv3 does not require a 32-bit Router ID."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "OSPFv3 is configured directly on the router interfaces using the 'ipv6 ospf <process> area <area>' command. OSPFv2 is traditionally configured under the 'router ospf' sub-process using network statements. Reference: RFC 5340.",
      wrong: [
        "Both versions use Cost as their routing metric.",
        "BGP is not required to run OSPFv3.",
        "OSPFv3 still requires a 32-bit Router ID (formatted as an IPv4 address)."
      ],
      tip: "Make sure you manually configure the 32-bit Router ID in OSPFv3, as it cannot auto-select one if the router has no IPv4 addresses configured.",
      memory: "OSPFv3 = Configured on the Interface.",
      real: "When deploying IPv6 in an office network, configure OSPFv3 directly on the VLAN subinterfaces to exchange routing updates.",
      commands: ["ipv6 ospf 1 area 0"]
    }
  },
  {
    id: 72,
    domain: "IP Connectivity",
    topic: "Routing",
    type: "single",
    difficulty: "Hard",
    examWeight: "25%",
    frequency: "Medium",
    text: "What is the specific MAC address prefix range reserved for Hot Standby Router Protocol (HSRP) version 1 virtual MAC addresses?",
    options: [
      "0100.5E00.0000 to 0100.5EFF.FFFF",
      "0000.0c07.ac00 to 0000.0c07.acFF",
      "0000.0c9f.f000 to 0000.0c9f.fFFF",
      "0007.b400.0000 to 0007.b4FF.FFFF"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "HSRP version 1 uses the virtual MAC address block 0000.0c07.acXX, where XX is the hexadecimal HSRP group number (from 00 to FF). Reference: RFC 2281.",
      wrong: [
        "0100.5E00.0000 is the MAC address range for IPv4 multicast traffic.",
        "0000.0c9f.f000 is the virtual MAC address range for HSRP version 2.",
        "0007.b400.0000 is the virtual MAC address range for GLBP."
      ],
      tip: "HSRP v1 virtual MAC ends with 07.acXX. HSRP v2 virtual MAC ends with 9f.fXXX. Knowing this helps you identify group details from packet captures.",
      memory: "07.ac is HSRP v1. 9f.f is HSRP v2.",
      real: "If a host has an ARP entry for gateway IP 192.168.1.1 mapping to MAC 0000.0c07.ac05, it indicates that HSRP Group 5 is active on the gateway.",
      commands: ["show standby"]
    }
  },
  {
    id: 73,
    domain: "IP Connectivity",
    topic: "Routing",
    type: "single",
    difficulty: "Easy",
    examWeight: "25%",
    frequency: "High",
    text: "What is the default Administrative Distance of a static route configured on Cisco IOS?",
    options: [
      "0",
      "1",
      "5",
      "110"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "Static routes have a default Administrative Distance of 1, making them highly trusted. Only directly connected routes are preferred over static routes (AD of 0). Reference: Cisco Administrative Distance guides.",
      wrong: [
        "AD of 0 is for directly connected interfaces.",
        "AD of 5 is for summarized EIGRP routes.",
        "AD of 110 is the default for OSPF."
      ],
      tip: "Lower AD values are preferred. You can change this default by adding an AD value to the end of the ip route command.",
      memory: "Static route = Number 1 priority.",
      real: "A static route configured on a branch router overrides any dynamic OSPF route to the same destination because its AD is 1 (compared to OSPF's 110).",
      commands: ["show ip route"]
    }
  },
  {
    id: 74,
    domain: "IP Connectivity",
    topic: "OSPF",
    type: "single",
    difficulty: "Medium",
    examWeight: "25%",
    frequency: "High",
    text: "Which command changes the OSPF reference bandwidth to 10 Gbps (10000 Mbps) to ensure OSPF cost calculations can differentiate between Gigabit and 10-Gigabit links?",
    options: [
      "bandwidth 10000000",
      "ip ospf cost 10",
      "auto-cost reference-bandwidth 10000",
      "ospf reference-bandwidth 10g"
    ],
    correct: [2],
    expl: {
      correct: "C",
      why: "The command 'auto-cost reference-bandwidth <Mbps>' changes the OSPF reference bandwidth. Configuring it to 10000 (10000 Mbps or 10 Gbps) updates the formula, giving 10G links a cost of 1 and Gigabit links a cost of 10. Reference: Cisco OSPF configuration guides.",
      wrong: [
        "The interface 'bandwidth' command changes routing protocol metric calculations, but does not adjust the global OSPF reference bandwidth.",
        "'ip ospf cost' manually sets the cost on a single interface, but does not change the global reference scale.",
        "'ospf reference-bandwidth 10g' is invalid command syntax."
      ],
      tip: "Run the auto-cost reference-bandwidth command on all routers in the OSPF domain to keep costs consistent.",
      memory: "auto-cost reference-bandwidth 10000 sets the reference to 10 Gbps.",
      real: "During a network upgrade to 10G links, configure 'auto-cost reference-bandwidth' to prevent OSPF from routing traffic over slower backup Gigabit links.",
      commands: ["auto-cost reference-bandwidth 10000"]
    }
  },
  {
    id: 75,
    domain: "IP Connectivity",
    topic: "Static Routes",
    type: "single",
    difficulty: "Medium",
    examWeight: "25%",
    frequency: "Medium",
    text: "What happens to a static route in the routing table if its exit interface transitions to a down state?",
    options: [
      "The route remains in the table but marked as inactive.",
      "The route is removed from the routing table until the interface comes back up.",
      "The router queries OSPF to locate a backup path.",
      "The router changes the next-hop IP to 127.0.0.1."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "A static route is valid only if the exit interface is up and the next-hop IP is reachable. If the interface goes down, the route is removed from the active routing table. Reference: Cisco IOS routing guidelines.",
      wrong: [
        "Inactive routes are not kept in the active routing table.",
        "The router does not query routing protocols automatically; static routes must be updated manually unless a dynamic protocol installs a backup.",
        "The next-hop address is not modified automatically."
      ],
      tip: "Using an exit interface that can flap (like Ethernet) can cause the static route to drop out. You can use IP SLA to track reachability and manage the route status.",
      memory: "Interface down = Static route gone.",
      real: "If you configure a static route pointing to an external switch interface and the fiber link breaks, the route drops out, allowing a floating static route to take over.",
      commands: ["show ip route"]
    }
  },
  {
    id: 76,
    domain: "IP Connectivity",
    topic: "OSPF",
    type: "single",
    difficulty: "Medium",
    examWeight: "25%",
    frequency: "High",
    text: "In multi-area OSPF design, why must all non-backbone areas connect directly to backbone Area 0?",
    options: [
      "To limit the size of the routing table.",
      "To prevent routing loops by ensuring all inter-area routing passes through the backbone.",
      "Because OSPFv2 does not support routing between non-backbone areas.",
      "To encrypt inter-area routing traffic."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "OSPF prevents routing loops by enforcing a hub-and-spoke area topology. All inter-area traffic must go through Area 0, preventing Area 1 from routing directly to Area 2 and creating loop paths. Reference: RFC 2328.",
      wrong: [
        "Area connectivity rules do not affect routing table size.",
        "OSPFv2 routes between non-backbone areas, but the traffic must transit Area 0.",
        "Area designs do not provide encryption."
      ],
      tip: "If a physical connection to Area 0 is impossible, configure an OSPF virtual link to tunnel through the intermediate area.",
      memory: "Hub-and-spoke area layout prevents loops.",
      real: "When designing a large enterprise network, configure the core switches in Area 0 and branch offices in separate non-backbone areas.",
      commands: ["show ip ospf"]
    }
  },
  {
    id: 77,
    domain: "IP Connectivity",
    topic: "Static Routes",
    type: "single",
    difficulty: "Hard",
    examWeight: "25%",
    frequency: "High",
    text: "When configuring an IPv6 static route using a link-local next-hop address (FE80::/10), what additional parameter must be specified in the command?",
    options: [
      "The next-hop link-local address is sufficient.",
      "The local exit interface.",
      "The next-hop global unicast address.",
      "An Administrative Distance of 2."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "Because link-local addresses are only valid on the local link, the same address (like FE80::1) can exist on multiple interfaces. The router needs the local exit interface specified to know which link to send the traffic out of. Reference: RFC 4291.",
      wrong: [
        "Specifying only the link-local address is insufficient and will return a command line error.",
        "You do not need to specify a global unicast address when routing via link-local.",
        "The AD does not resolve link-local routing ambiguity."
      ],
      tip: "The correct command format is: 'ipv6 route <prefix> <exit-interface> <link-local-next-hop>'.",
      memory: "Link-local static route = Link-local IP + Exit Interface.",
      real: "Configure a static route to a neighbor router using its link-local address: 'ipv6 route 2001:db8:b::/64 GigabitEthernet0/0 fe80::1'.",
      commands: ["ipv6 route 2001:db8:b::/64 gigabitethernet0/0 fe80::1"]
    }
  },
  {
    id: 78,
    domain: "IP Connectivity",
    topic: "Routing",
    type: "single",
    difficulty: "Easy",
    examWeight: "25%",
    frequency: "High",
    text: "In the output of the 'show ip route' command on a Cisco router, which character code identifies a route learned via EIGRP?",
    options: [
      "E",
      "O",
      "D",
      "I"
    ],
    correct: [2],
    expl: {
      correct: "C",
      why: "In Cisco IOS, EIGRP routes are marked with 'D', which stands for the DUAL (Diffusing Update Algorithm) used by EIGRP. Reference: Cisco routing table documentation.",
      wrong: [
        "E stands for EGP (Exterior Gateway Protocol), not EIGRP.",
        "O is for OSPF.",
        "I is for IS-IS."
      ],
      tip: "Remember that 'D' is EIGRP because of the DUAL algorithm.",
      memory: "EIGRP uses D for DUAL.",
      real: "When verifying a dual-protocol migration, check that routes have transitioned from 'O' (OSPF) to 'D' (EIGRP) as expected.",
      commands: ["show ip route"]
    }
  },
  {
    id: 79,
    domain: "IP Connectivity",
    topic: "Route Selection",
    type: "multi",
    difficulty: "Hard",
    examWeight: "25%",
    frequency: "High",
    text: "Which two factors are compared by a router to select the best path when it learns multiple routes to the exact same destination prefix from different routing sources?",
    options: [
      "Administrative Distance (AD)",
      "Routing Metric",
      "Prefix Length",
      "Next-Hop IP address parity"
    ],
    correct: [0, 2],
    expl: {
      correct: "A,C",
      why: "To route a packet, the router first checks the Prefix Length (longest match). If there are multiple routes to the same destination prefix, it uses Administrative Distance (AD) to select the most trusted route source. Reference: Cisco route selection principles.",
      wrong: [
        "Bandwidth speed is used by OSPF or EIGRP to calculate metrics, but not by the global routing table to compare different protocols.",
        "Process ID is locally significant and does not affect route selection.",
        "The OSPF metric cost is compared only when comparing routes from the same OSPF process."
      ],
      tip: "First check: Prefix Length (most specific wins). Second check: Administrative Distance (lowest wins). Third check (if same protocol): Metric (lowest wins).",
      memory: "Prefix -> AD -> Metric.",
      real: "If a router has routes for 10.1.1.0/24 (via OSPF) and 10.1.1.0/24 (via Static), it selects the static route because of its lower AD (1 vs 110).",
      commands: ["show ip route"]
    }
  },
  {
    id: 80,
    domain: "IP Connectivity",
    topic: "OSPF",
    type: "single",
    difficulty: "Medium",
    examWeight: "25%",
    frequency: "Medium",
    text: "OSPF neighbors are stuck in the 'ExStart' or 'Exchange' state. What is the most common cause of this issue?",
    options: [
      "Mismatched OSPF Hello timers",
      "Mismatched MTU settings on the connecting interfaces",
      "Mismatched OSPF Process IDs",
      "Duplicate IP addresses on the link"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "During ExStart and Exchange, routers negotiate master/slave roles and exchange Database Description (DBD) packets. If the MTU is mismatched, the router with the smaller MTU will drop DBD packets that exceed its MTU limit, leaving the neighbor adjacency stuck. Reference: Cisco OSPF troubleshooting.",
      wrong: [
        "Mismatched Hello timers prevent neighbors from reaching even the Init state.",
        "Process IDs are locally significant and do not affect neighbor adjacencies.",
        "Duplicate IPs on the link prevent bidirectional communication and hello processing."
      ],
      tip: "Use the command 'ip ospf mtu-ignore' to bypass the MTU check if you cannot change the physical interface MTU.",
      memory: "ExStart/Exchange stuck = MTU mismatch.",
      real: "When configuring OSPF over a WAN connection (like Metro Ethernet), ensure the MTU is set consistently on both sides to prevent neighbor negotiation failures.",
      commands: ["ip ospf mtu-ignore"]
    }
  },

  // ==========================================
  // IP SERVICES (81 - 92)
  // ==========================================
  {
    id: 81,
    domain: "IP Services",
    topic: "NAT",
    type: "matching",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "High",
    text: "Match the NAT translation terms to their correct definitions.",
    pairs: [
      ["Inside Local", "The IP address assigned to a host on the inside network (typically private RFC 1918)."],
      ["Inside Global", "The public IP address that represents an inside host to the outside network."],
      ["Outside Global", "The public IP address assigned to a host on the outside network by its owner."],
      ["Outside Local", "The IP address of an outside host as it appears to the inside network."]
    ],
    expl: {
      correct: "Matching",
      why: "Inside Local is the private host IP. Inside Global is the public translated IP. Outside Global is the actual public IP of the external host. Outside Local is the IP of the external host as seen from the private network. Reference: Cisco NAT terminology guidelines.",
      wrong: [
        "Inside Global is not the private address; it is the public address that represent private hosts externally.",
        "Outside Local is not a public address used on the public internet; it is an internal representation of an external host.",
        "NAT terms do not refer to dynamic MAC addresses or switchport encapsulation types."
      ],
      tip: "Inside = Local Network. Outside = External Network. Local = Inside perspective. Global = Outside perspective.",
      memory: "Local = Private IP. Global = Public IP.",
      real: "When configuring NAT, the router translates packets by replacing the Inside Local source address (192.168.1.50) with the Inside Global address (203.0.113.10).",
      commands: ["show ip nat translations"]
    }
  },
  {
    id: 82,
    domain: "IP Services",
    topic: "NAT",
    type: "single",
    difficulty: "Easy",
    examWeight: "10%",
    frequency: "High",
    text: "Which command configures a static NAT translation to map the internal server IP 10.1.1.10 to the public IP address 203.0.113.10?",
    options: [
      "ip nat inside source static 10.1.1.10 203.0.113.10",
      "ip nat outside source static 203.0.113.10 10.1.1.10",
      "ip nat static inside 10.1.1.10 global 203.0.113.10",
      "ip nat translation static 10.1.1.10 203.0.113.10"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "The command 'ip nat inside source static <local-ip> <global-ip>' configures a one-to-one static translation mapping an internal address to an external address. Reference: Cisco NAT configuration guides.",
      wrong: [
        "Mapping the outside source is used to translate external addresses, not internal servers.",
        "'ip nat static inside' is invalid Cisco IOS command syntax.",
        "'ip nat translation static' is incorrect syntax."
      ],
      tip: "Ensure you configure 'ip nat inside' on the internal interface and 'ip nat outside' on the internet interface for translations to work.",
      memory: "ip nat inside source static LOCAL GLOBAL.",
      real: "Configure static NAT to allow external internet users to access an internal web server at its public address (203.0.113.10).",
      commands: ["ip nat inside source static 10.1.1.10 203.0.113.10"]
    }
  },
  {
    id: 83,
    domain: "IP Services",
    topic: "NAT",
    type: "single",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "Medium",
    text: "A router is configured with dynamic NAT using an IP pool. What happens to subsequent inside host packets if all addresses in the public pool are exhausted?",
    options: [
      "The router routes the packets without translating them.",
      "The router drops the packets and sends an ICMP destination unreachable message.",
      "The router automatically switches to PAT (overload) mode.",
      "The router dynamically requests more IP addresses from the ISP."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "Under dynamic NAT, each active host requires a one-to-one mapping from the pool. If the pool runs out of addresses, any new host traffic matching the NAT access list is dropped until an existing translation expires. Reference: Cisco NAT guides.",
      wrong: [
        "The router will not forward private RFC 1918 packets to the public internet untranslated.",
        "The router will not enable PAT automatically; you must configure the 'overload' keyword to activate port translation.",
        "Routers cannot request extra public IPs from ISPs dynamically."
      ],
      tip: "To prevent pool exhaustion, configure Port Address Translation (PAT) by appending the 'overload' keyword to the NAT command.",
      memory: "Pool empty = Packets dropped.",
      real: "If users report internet loss, check the translation table. A small NAT pool will run out of addresses quickly under load, requiring a transition to PAT.",
      commands: ["show ip nat statistics"]
    }
  },
  {
    id: 84,
    domain: "IP Services",
    topic: "NAT",
    type: "single",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "High",
    text: "Which command configures Port Address Translation (PAT) to overload internal traffic onto the public IP address of the GigabitEthernet0/0 interface?",
    options: [
      "ip nat inside source list 1 pool overload",
      "ip nat inside source list 1 interface GigabitEthernet0/0 overload",
      "ip nat overload list 1 interface GigabitEthernet0/0",
      "ip nat PAT list 1 interface GigabitEthernet0/0"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "The command 'ip nat inside source list <acl> interface <interface> overload' configures PAT, using port numbers to multiplex multiple inside hosts onto the single IP of the exit interface. Reference: Cisco NAT guides.",
      wrong: [
        "Specifying a pool without the interface name does not overload onto the interface IP.",
        "'ip nat overload' is invalid command syntax.",
        "The keyword 'PAT' is not used in Cisco IOS configuration commands."
      ],
      tip: "The key to enabling PAT is the 'overload' keyword at the end of the command.",
      memory: "overload = PAT = share one IP using port numbers.",
      real: "Most home and branch office routers use PAT to translate all internal user traffic using the single public IP assigned to the WAN port.",
      commands: ["ip nat inside source list 1 interface GigabitEthernet0/0 overload"]
    }
  },
  {
    id: 85,
    domain: "IP Services",
    topic: "NAT",
    type: "single",
    difficulty: "Easy",
    examWeight: "10%",
    frequency: "High",
    text: "Which command displays active NAT translations on a Cisco router, including protocols, ports, and IP addresses?",
    options: [
      "show ip nat statistics",
      "show ip nat translations",
      "show ip nat table",
      "show translation rules"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "'show ip nat translations' displays all active NAT translations, including translation type, protocol, and inside/outside local/global IP addresses. Reference: Cisco NAT command references.",
      wrong: [
        "show ip nat statistics shows pool sizes, configuration details, and translation counts, but not individual translations.",
        "show ip nat table is invalid command syntax.",
        "show translation rules is not a Cisco IOS NAT command."
      ],
      tip: "Use 'clear ip nat translation *' to clear the translation table during testing.",
      memory: "translations = active translation mapping table.",
      real: "When troubleshooting web access, run 'show ip nat translations' to verify that translation entries are created when client traffic passes through.",
      commands: ["show ip nat translations"]
    }
  },
  {
    id: 86,
    domain: "IP Services",
    topic: "NTP",
    type: "single",
    difficulty: "Easy",
    examWeight: "10%",
    frequency: "Medium",
    text: "Which command configures a Cisco device to synchronize its system clock with an external time source at IP address 203.0.113.50?",
    options: [
      "ntp server 203.0.113.50",
      "ntp master 203.0.113.50",
      "clock set 203.0.113.50",
      "ntp peer 203.0.113.50"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "The command 'ntp server <IP>' configures the device to act as an NTP client, regularly querying the specified server for time synchronization. Reference: RFC 5905.",
      wrong: [
        "ntp master configures the local device to act as an authoritative NTP clock source, not sync to an external server.",
        "clock set is a manual runtime command, not a server sync command.",
        "ntp peer configures symmetric active mode, where two devices synchronize with each other as equals."
      ],
      tip: "NTP uses UDP port 123 for all time synchronization traffic.",
      memory: "ntp server IP.",
      real: "Configure NTP on all switches and routers in your network to ensure syslog messages have consistent timestamps for auditing.",
      commands: ["ntp server 203.0.113.50"]
    }
  },
  {
    id: 87,
    domain: "IP Services",
    topic: "NTP",
    type: "single",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "High",
    text: "Which of the following describes an NTP Stratum 0 time source?",
    options: [
      "A Cisco switch configured as the network NTP master.",
      "An atomic clock, GPS receiver, or radio clock directly connected to an NTP server.",
      "A secondary NTP server that synchronizes across the network.",
      "An unsynchronized local clock with a stratum of 16."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "Stratum 0 devices are physical timekeeping devices (like atomic clocks or GPS receivers) that generate accurate time. They cannot be queried directly over the network; they must connect directly to a Stratum 1 server. Reference: RFC 5905.",
      wrong: [
        "A Cisco switch cannot be Stratum 0; if configured as NTP master, its minimum stratum is 1.",
        "Secondary network servers are Stratum 2 or higher.",
        "Stratum 16 indicates an unsynchronized link, not a Stratum 0 device."
      ],
      tip: "Stratum indicates distance from the reference clock. Lower numbers are closer and more accurate.",
      memory: "Stratum 0 = Reference hardware (GPS/Atomic). Stratum 1 = Connected server. Stratum 2 = Network client.",
      real: "In a network, your primary NTP servers sync from Stratum 1 internet servers, while internal switches and routers sync from those primary servers as Stratum 2 clients.",
      commands: ["show ntp status"]
    }
  },
  {
    id: 88,
    domain: "IP Services",
    topic: "DHCP",
    type: "single",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "High",
    text: "A host on VLAN 10 needs to receive an IP address from a DHCP server located on VLAN 20. What command must be applied to the router's VLAN 10 interface to facilitate this?",
    options: [
      "ip helper-address 10.1.20.10 (DHCP Server IP)",
      "ip forward-protocol dhcp",
      "dhcp relay destination 10.1.20.10",
      "ip helper-address 255.255.255.255"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "DHCP Discover packets are sent as local broadcasts, which routers drop. The 'ip helper-address <IP>' command configures the router to act as a DHCP relay agent, forwarding these local broadcasts to the DHCP server as unicast packets. Reference: Cisco IP services configuration guides.",
      wrong: [
        "ip forward-protocol modifies which ports are forwarded, but does not configure the relay target IP.",
        "dhcp relay destination is invalid command syntax.",
        "Setting the helper-address to broadcast keeps the packet local, failing to relay it."
      ],
      tip: "Configure the ip helper-address command on the gateway interface (the SVI or subinterface) that receives the client's broadcast traffic.",
      memory: "ip helper-address SERVER_IP.",
      real: "If computers in the branch office cannot get IP addresses from the central DHCP server, check that 'ip helper-address' is configured on the branch router's client-facing interface.",
      commands: ["ip helper-address 10.1.20.10"]
    }
  },
  {
    id: 89,
    domain: "IP Services",
    topic: "Syslog",
    type: "matching",
    difficulty: "Hard",
    examWeight: "10%",
    frequency: "Medium",
    text: "Match the Syslog severity levels to their correct descriptive names.",
    pairs: [
      ["Severity 0", "Emergency (System is unusable)"],
      ["Severity 3", "Error (Error conditions)"],
      ["Severity 5", "Notification (Normal but significant condition)"],
      ["Severity 7", "Debugging (Debugging messages)"]
    ],
    expl: {
      correct: "Matching",
      why: "Syslog defines severity levels from 0 (Emergency) to 7 (Debugging). Lower numbers indicate more critical events. Reference: RFC 5424.",
      wrong: [
        "Severity 7 is not Emergency; it is Debugging (lowest severity).",
        "Severity 0 is Emergency (highest severity), not Debugging.",
        "Severity levels 1 (Alert) and 2 (Critical) represent highly urgent states, but they are not the lowest level of severity."
      ],
      tip: "Use the mnemonic 'Every Awesome Cisco Engineer Will Need Daily Corrections' to remember the levels: Emergency (0), Alert (1), Critical (2), Error (3), Warning (4), Notification (5), Informational (6), Debugging (7).",
      memory: "0 = Emergency (worst). 7 = Debugging (informational).",
      real: "Configure 'logging trap notifications' (level 5) on routers to log interface state changes without flooding the syslog server with debugging logs.",
      commands: ["logging trap 5"]
    }
  },
  {
    id: 90,
    domain: "IP Services",
    topic: "DNS",
    type: "single",
    difficulty: "Easy",
    examWeight: "10%",
    frequency: "High",
    text: "Which transport protocol and port number are utilized by default when a client computer sends a DNS query to a DNS server?",
    options: [
      "TCP Port 53",
      "UDP Port 53",
      "TCP Port 80",
      "UDP Port 67"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "Client DNS queries are small and require low overhead, so they use UDP port 53. DNS zone transfers between servers use TCP port 53. Reference: RFC 1035.",
      wrong: [
        "TCP Port 53 is used for DNS zone transfers, not default client queries.",
        "TCP Port 80 is for HTTP traffic.",
        "UDP Port 67 is used by DHCP servers, not DNS."
      ],
      tip: "DNS uses both UDP and TCP on port 53 depending on packet size and request type.",
      memory: "DNS Query = UDP 53.",
      real: "Ensure that egress firewalls permit UDP port 53 traffic to allow internal hosts to resolve domain names on the internet.",
      commands: ["show ip dns view"]
    }
  },
  {
    id: 91,
    domain: "IP Services",
    topic: "DHCP",
    type: "single",
    difficulty: "Easy",
    examWeight: "10%",
    frequency: "High",
    text: "Which command excludes the IP addresses 192.168.1.1 through 192.168.1.10 from being assigned by a DHCP pool on a Cisco router?",
    options: [
      "ip dhcp excluded-address 192.168.1.1 192.168.1.10",
      "no ip dhcp pool range 192.168.1.1 192.168.1.10",
      "ip dhcp pool exclude 192.168.1.1 192.168.1.10",
      "exclude-address 192.168.1.1 192.168.1.10"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "The command 'ip dhcp excluded-address <start-ip> <end-ip>' prevents the router from assigning those addresses to clients, reserving them for static assignments (like routers, switches, and printers). Reference: Cisco DHCP server guides.",
      wrong: [
        "no ip dhcp pool range is invalid command syntax.",
        "ip dhcp pool exclude is incorrect syntax.",
        "exclude-address is not a valid global configuration command."
      ],
      tip: "Configure excluded addresses in global configuration mode, not under the DHCP pool configuration mode.",
      memory: "ip dhcp excluded-address START END.",
      real: "When configuring a new DHCP pool, exclude the first 10 IP addresses to reserve them for gateways, switches, and local servers.",
      commands: ["ip dhcp excluded-address 192.168.1.1 192.168.1.10"]
    }
  },
  {
    id: 92,
    domain: "IP Services",
    topic: "SNMP",
    type: "multi",
    difficulty: "Hard",
    examWeight: "10%",
    frequency: "Medium",
    text: "Which two security mechanisms were introduced in SNMPv3 to resolve the security vulnerabilities of SNMPv1 and SNMPv2c?",
    options: [
      "Community Strings",
      "Cryptographic Authentication (using SHA or MD5)",
      "Packet Encryption (Privacy using AES or DES)",
      "Dynamic Port Allocation"
    ],
    correct: [1, 2],
    expl: {
      correct: "B,C",
      why: "SNMPv3 introduces security models that provide message integrity, authentication (SHA/MD5), and encryption (DES/AES) to protect management traffic from snooping and tampering. Reference: RFC 3414.",
      wrong: [
        "Community strings are clear-text passwords used in SNMPv1 and SNMPv2c, which are vulnerable to sniffing.",
        "SNMPv3 still uses standard UDP ports (161/162) and does not use dynamic port allocation.",
        "SNMPv3 does not introduce new transport layers; it continues to run over UDP."
      ],
      tip: "SNMPv3 has three security levels: noAuthNoPriv (no auth, no encryption), authNoPriv (auth, no encryption), and authPriv (both auth and encryption).",
      memory: "SNMPv3 = Auth (hash) + Priv (encryption).",
      real: "Configure SNMPv3 with authPriv mode using SHA and AES when setting up device monitoring over public WAN links.",
      commands: ["snmp-server group v3group v3 priv"]
    }
  },

  // ==========================================
  // SECURITY FUNDAMENTALS (93 - 110)
  // ==========================================
  {
    id: 93,
    domain: "Security Fundamentals",
    topic: "ACLs",
    type: "single",
    difficulty: "Medium",
    examWeight: "15%",
    frequency: "High",
    text: "According to Cisco security guidelines, where should standard and extended Access Control Lists (ACLs) be placed on a network relative to traffic flow?",
    options: [
      "Standard close to source; Extended close to destination",
      "Standard close to destination; Extended close to source",
      "Both as close to the internet gateway as possible",
      "Standard on inbound interfaces; Extended on outbound interfaces only"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "Standard ACLs match only source IP addresses and should be placed close to the destination to prevent blocking legitimate traffic. Extended ACLs match source, destination, protocol, and ports, and should be placed close to the source to filter traffic early and conserve bandwidth. Reference: Cisco ACL placement guidelines.",
      wrong: [
        "Placing standard ACLs close to the source will block all traffic from that host, even traffic destined for allowed segments.",
        "Applying ACLs only at the internet gateway leaves the internal network unprotected from local traffic.",
        "ACL placement is based on traffic direction and matching capability, not interface labels."
      ],
      tip: "Standard ACL: Close to destination. Extended ACL: Close to source.",
      memory: "Standard = Destination (SD). Extended = Source (ES).",
      real: "To block a department from accessing the finance server, place an extended ACL on the department's access switch interface to drop the traffic immediately.",
      commands: ["show ip access-lists"]
    }
  },
  {
    id: 94,
    domain: "Security Fundamentals",
    topic: "ACLs",
    type: "single",
    difficulty: "Easy",
    examWeight: "15%",
    frequency: "High",
    text: "Which command configures a standard access list entry numbered 10 to deny traffic from host 10.1.1.5 while allowing all other traffic?",
    options: [
      "access-list 10 deny host 10.1.1.5\naccess-list 10 permit any",
      "access-list 10 deny 10.1.1.5 255.255.255.255",
      "access-list 10 deny host 10.1.1.5",
      "access-list 10 deny 10.1.1.5 0.0.0.0"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "All Cisco ACLs contain an implicit 'deny any' at the end. To deny a single host and allow others, you must configure the deny statement followed by 'access-list 10 permit any'. Reference: Cisco ACL configuration guides.",
      wrong: [
        "Denying the host with a wildcard mask of 255.255.255.255 denies all traffic, and it lacks the permit statement.",
        "Without a 'permit any' statement, the implicit deny will block all traffic matching this ACL.",
        "This option lacks the permit statement to allow other traffic."
      ],
      tip: "Every ACL must have at least one permit statement, or it will block all traffic due to the implicit deny.",
      memory: "Deny host -> Permit any. Don't forget the implicit deny.",
      real: "When configuring a management restriction ACL, deny unauthorized hosts and permit your management station IP before applying it to the VTY lines.",
      commands: ["access-list 10 deny host 10.1.1.5", "access-list 10 permit any"]
    }
  },
  {
    id: 95,
    domain: "Security Fundamentals",
    topic: "ACLs",
    type: "single",
    difficulty: "Medium",
    examWeight: "15%",
    frequency: "High",
    text: "Which command permits only HTTPS traffic from the subnet 10.1.1.0/24 to a web server at IP address 192.168.5.10?",
    options: [
      "access-list 101 permit tcp 10.1.1.0 0.0.0.255 host 192.168.5.10 eq 443",
      "access-list 101 permit ip 10.1.1.0 0.0.0.255 host 192.168.5.10 eq 443",
      "access-list 101 permit tcp host 192.168.5.10 10.1.1.0 0.0.0.255 eq 443",
      "access-list 101 permit tcp 10.1.1.0 0.0.0.255 192.168.5.10 0.0.0.0 eq 80"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "HTTPS uses TCP port 443. The command format is 'access-list <number> permit tcp <source-subnet> <wildcard> host <destination-ip> eq 443'. Reference: Cisco ACL configuration guides.",
      wrong: [
        "The IP protocol statement does not support port matching options (like eq 443).",
        "The source and destination addresses are swapped.",
        "Port 80 is for HTTP, not HTTPS, and the destination address wildcard is missing."
      ],
      tip: "Extended ACL numbers range from 100 to 199 and 2000 to 2699.",
      memory: "TCP 443 = HTTPS. TCP 80 = HTTP. UDP 53 = DNS.",
      real: "Apply an extended ACL to your firewall interface to allow HTTPS traffic to your web server while blocking other protocols.",
      commands: ["access-list 101 permit tcp 10.1.1.0 0.0.0.255 host 192.168.5.10 eq 443"]
    }
  },
  {
    id: 96,
    domain: "Security Fundamentals",
    topic: "ACLs",
    type: "single",
    difficulty: "Medium",
    examWeight: "15%",
    frequency: "High",
    text: "What wildcard mask corresponds to the subnet mask 255.255.240.0?",
    options: [
      "0.0.15.255",
      "0.0.31.255",
      "0.0.240.255",
      "0.0.7.255"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "Calculate wildcard masks by subtracting the subnet mask from 255.255.255.255. (255-255).(255-255).(255-240).(255-0) = 0.0.15.255. Reference: Cisco ACL wildcard masking guides.",
      wrong: [
        "0.0.31.255 corresponds to a 255.255.224.0 (/19) subnet mask.",
        "0.0.240.255 is an incorrect subtraction.",
        "0.0.7.255 corresponds to a 255.255.248.0 (/21) subnet mask."
      ],
      tip: "Wildcard mask is the bitwise inverse of the subnet mask. 0 bits must match; 1 bits are ignored.",
      memory: "255.255.255.255 minus Subnet Mask = Wildcard Mask.",
      real: "When configuring OSPF or ACLs, calculate the wildcard mask to match the target subnet range.",
      commands: ["show ip access-lists"]
    }
  },
  {
    id: 97,
    domain: "Security Fundamentals",
    topic: "SSH",
    type: "dragdrop",
    difficulty: "Medium",
    examWeight: "15%",
    frequency: "High",
    text: "Order the configuration commands required to enable SSH version 2 on a new Cisco Catalyst switch.",
    order: [
      "ip domain-name company.local: Configure the DNS domain name required for key generation.",
      "crypto key generate rsa: Generate the RSA keys (minimum 768 bits for SSHv2, 1024 recommended).",
      "username admin secret cisco123: Create a local user account with an encrypted password.",
      "line vty 0 15: Enter virtual terminal lines configuration mode.",
      "login local\ntransport input ssh: Configure local authentication and restrict access to SSH only."
    ],
    expl: {
      correct: "Correct Order",
      why: "To enable SSH, configure a domain name, generate keys, create a local user, select the VTY lines, configure local authentication, and restrict protocol access. Reference: Cisco SSH configuration guides.",
      wrong: [
        "Generating keys requires a configured domain name first.",
        "VTY configuration must occur before restricting the transport input.",
        "Local authentication will fail if no local username is created first."
      ],
      tip: "Configure RSA key size to at least 1024 bits to support SSH version 2; SSHv1 is deprecated.",
      memory: "Domain -> Keys -> User -> VTY lines -> SSH input.",
      real: "When securing a new switch, disable Telnet and enable SSHv2 to protect management traffic from local sniffing.",
      commands: ["ip ssh version 2", "show ip ssh"]
    }
  },
  {
    id: 98,
    domain: "Security Fundamentals",
    topic: "Port Security",
    type: "matching",
    difficulty: "Medium",
    examWeight: "15%",
    frequency: "High",
    text: "Match the Layer 2 port-security violation modes to their switch behavior.",
    pairs: [
      ["Shutdown", "Disables the interface (err-disable), increments violation counter, and logs error."],
      ["Restrict", "Drops unauthorized frames, increments violation counter, and logs syslog warning."],
      ["Protect", "Drops unauthorized frames silently without incrementing the counter or logging."]
    ],
    expl: {
      correct: "Matching",
      why: "Shutdown disables the port (err-disabled). Restrict drops traffic, increments the counter, and logs a warning. Protect drops traffic silently. Reference: Cisco Port Security guidelines.",
      wrong: [
        "Protect does not log warnings or increment counters.",
        "Restrict does not shut down the interface.",
        "A port-security violation will not trigger spanning-tree topology changes or reload the switch."
      ],
      tip: "Use 'shutdown' in high-security environments to alert administrators of unauthorized connections.",
      memory: "Shutdown = Err-disabled. Restrict = Log error. Protect = Silent drop.",
      real: "Configure Restrict mode on conference room ports to block unauthorized devices without disabling the port for others.",
      commands: ["show port-security interface gigabitethernet 0/1"]
    }
  },
  {
    id: 99,
    domain: "Security Fundamentals",
    topic: "DHCP Snooping",
    type: "single",
    difficulty: "Medium",
    examWeight: "15%",
    frequency: "High",
    text: "How does DHCP Snooping defend against rogue DHCP server attacks on a Layer 2 switch network?",
    options: [
      "It encrypts all DHCP messages sent on the network.",
      "It classifies ports as trusted or untrusted, dropping inbound DHCP server replies (OFFER/ACK) received on untrusted ports.",
      "It limits the number of DHCP requests allowed per second on access ports.",
      "It disables the DHCP service globally if a conflict is detected."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "DHCP Snooping designates client ports as untrusted and uplink ports (facing the real DHCP server) as trusted. Any DHCP server replies (OFFER, ACK) received on untrusted ports are dropped. Reference: Cisco DHCP Snooping guidelines.",
      wrong: [
        "DHCP Snooping does not encrypt DHCP messages.",
        "Rate limiting is a feature of DHCP Snooping to prevent exhaustion attacks, but does not block rogue servers directly.",
        "DHCP Snooping operates at Layer 2 and does not disable the DHCP service globally."
      ],
      tip: "Configure DHCP Snooping globally, and configure the uplink port to the DHCP server as trusted using 'ip dhcp snooping trust'.",
      memory: "DHCP Snooping: Untrusted ports block server replies.",
      real: "If a user connects a home router to a wall jack, DHCP Snooping blocks the rogue router's DHCP offers, keeping network IPs stable.",
      commands: ["ip dhcp snooping", "ip dhcp snooping trust"]
    }
  },
  {
    id: 100,
    domain: "Security Fundamentals",
    topic: "Layer 2 Security",
    type: "single",
    difficulty: "Hard",
    examWeight: "15%",
    frequency: "High",
    text: "Which database is inspected by Dynamic ARP Inspection (DAI) to validate ARP packets on untrusted switch interfaces?",
    options: [
      "The switch MAC address table",
      "The DHCP Snooping binding database",
      "The router ARP cache table",
      "The local DNS server IP log"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "DAI validates ARP packets on untrusted ports by checking their MAC-to-IP binding against the entries in the DHCP Snooping binding database. Packets with invalid bindings are dropped. Reference: Cisco DAI configuration guides.",
      wrong: [
        "The MAC address table maps MACs to ports, not MACs to IPs.",
        "The router's ARP table is on a Layer 3 device; DAI runs locally on Layer 2 switches.",
        "DNS records resolve names to IPs and do not contain MAC bindings."
      ],
      tip: "DAI requires DHCP Snooping to be enabled to build the binding database.",
      memory: "DAI uses the DHCP Snooping database to validate ARP packets.",
      real: "Configure DAI on client VLANs to prevent ARP poisoning and man-in-the-middle attacks.",
      commands: ["ip arp inspection vlan 10"]
    }
  },
  {
    id: 101,
    domain: "Security Fundamentals",
    topic: "Port Security",
    type: "single",
    difficulty: "Medium",
    examWeight: "15%",
    frequency: "High",
    text: "What is the primary benefit of configuring port security with 'sticky' MAC address learning?",
    options: [
      "It dynamically learns MAC addresses and saves them to the running configuration.",
      "It encrypts MAC addresses in the switch configuration file.",
      "It allows an unlimited number of MAC addresses on the port.",
      "It disables Spanning Tree calculations on that port."
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "Sticky MAC learning dynamically learns MAC addresses on the port and adds them to the running configuration. This avoids having to manually configure MAC addresses while securing the port. Reference: Cisco Port Security guidelines.",
      wrong: [
        "Sticky MACs are stored in plaintext in the configuration file.",
        "Maximum MAC limits still apply when sticky learning is enabled.",
        "Port security does not affect Spanning Tree operations."
      ],
      tip: "Save the running configuration ('write memory') to ensure dynamically learned sticky MAC addresses persist after a reload.",
      memory: "Sticky MAC = dynamically learned, saved to config.",
      real: "Use sticky MAC learning when deploying new workstations to secure ports without manually typing MAC addresses.",
      commands: ["switchport port-security mac-address sticky"]
    }
  },
  {
    id: 102,
    domain: "Security Fundamentals",
    topic: "Device Security",
    type: "single",
    difficulty: "Easy",
    examWeight: "15%",
    frequency: "High",
    text: "Which command encrypts all existing and future clear-text passwords in the Cisco switch configuration file?",
    options: [
      "enable secret cisco123",
      "service password-encryption",
      "encrypt passwords local",
      "service encrypt-key"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "The 'service password-encryption' command applies a weak Vigenere cipher (Type 7) to encrypt all plaintext passwords (like console and vty passwords) in the configuration file. Reference: Cisco device hardening guides.",
      wrong: [
        "enable secret configures the privilege level password using MD5/scrypt hashing, but does not encrypt other passwords.",
        "encrypt passwords local is invalid Cisco IOS command syntax.",
        "service encrypt-key is incorrect syntax."
      ],
      tip: "Type 7 encryption is weak and can be decrypted easily. Use 'enable secret' (Type 5/8/9) for strong gateway password protection.",
      memory: "service password-encryption.",
      real: "Enable service password-encryption on all network devices to protect passwords from casual shoulder surfing.",
      commands: ["service password-encryption"]
    }
  },
  {
    id: 103,
    domain: "Security Fundamentals",
    topic: "Device Security",
    type: "single",
    difficulty: "Easy",
    examWeight: "15%",
    frequency: "High",
    text: "Why is 'enable secret <password>' preferred over 'enable password <password>' in Cisco IOS configuration?",
    options: [
      "enable secret requires SSH to be enabled.",
      "enable secret encrypts the password using a strong cryptographic hash (like MD5 or SHA-256), whereas enable password uses weak encryption or plaintext.",
      "enable secret enables HTTPS access automatically.",
      "enable secret is required to configure VTY lines."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "enable secret uses a one-way cryptographic hash (Type 5 MD5 or Type 9 scrypt), which is highly secure. enable password uses weak Type 7 encryption or plaintext, which is easily cracked. Reference: Cisco security guidelines.",
      wrong: [
        "SSH configuration does not require the enable secret command.",
        "HTTPS configuration is managed via 'ip http secure-server', not enable secret.",
        "VTY lines can be configured without enable secret."
      ],
      tip: "If both commands are configured, the router always uses the 'enable secret' password.",
      memory: "Secret = Strong Hash. Password = Weak/Plaintext.",
      real: "Always configure 'enable secret' on switches and routers to protect privileged access credentials.",
      commands: ["enable secret strong_pass"]
    }
  },
  {
    id: 104,
    domain: "Security Fundamentals",
    topic: "Layer 2 Security",
    type: "multi",
    difficulty: "Easy",
    examWeight: "15%",
    frequency: "High",
    text: "Which two administrative measures are recommended to secure unused ports on a Cisco Catalyst switch?",
    options: [
      "Shut down the ports using the 'shutdown' command.",
      "Configure the ports as trunk ports.",
      "Assign the ports to an unused, isolated VLAN (blackhole VLAN).",
      "Enable DTP dynamic desirable on the ports."
    ],
    correct: [0, 2],
    expl: {
      correct: "A,C",
      why: "Securing unused ports prevents unauthorized physical access. Shut down the ports and assign them to a non-routing 'blackhole' VLAN (e.g. VLAN 999) to isolate traffic. Reference: Cisco Layer 2 security guidelines.",
      wrong: [
        "Configuring unused ports as trunks allows users to access all VLANs.",
        "DTP dynamic desirable actively negotiates trunks, creating a security risk.",
        "Unused ports should not be left in administrative up state even if protected by security features."
      ],
      tip: "Combine shutdown and an unused VLAN to prevent access even if a port is accidentally enabled.",
      memory: "Shut down and isolate unused ports.",
      real: "When auditing switchports, identify unused ports, shut them down, and move them to VLAN 999.",
      commands: ["interface range fastethernet 0/10 - 24", "shutdown", "switchport access vlan 999"]
    }
  },
  {
    id: 105,
    domain: "Security Fundamentals",
    topic: "Device Security",
    type: "single",
    difficulty: "Easy",
    examWeight: "15%",
    frequency: "High",
    text: "In network security administration, what do the three letters in the AAA security framework stand for?",
    options: [
      "Association, Authentication, Access",
      "Authentication, Authorization, Accounting",
      "Algorithms, Access, Auditing",
      "Address, Allocation, Authority"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "AAA stands for Authentication (Who is accessing the network?), Authorization (What permissions do they have?), and Accounting (What actions did they perform?). Reference: RFC 2989.",
      wrong: [
        "Association is a wireless phase, not part of AAA.",
        "Algorithms and Auditing are security concepts, but not the AAA definition.",
        "Address, Allocation, and Authority are not part of AAA."
      ],
      tip: "Authentication verifies identity; Authorization manages access; Accounting tracks changes.",
      memory: "AAA: Who are you? What can you do? What did you do?",
      real: "Configure AAA with TACACS+ on corporate devices to authenticate administrators against a central Active Directory server.",
      commands: ["aaa new-model"]
    }
  },
  {
    id: 106,
    domain: "Security Fundamentals",
    topic: "Wireless Security",
    type: "single",
    difficulty: "Medium",
    examWeight: "15%",
    frequency: "High",
    text: "Which security protocol is commonly deployed on enterprise wireless networks to provide centralized 802.1X user authentication?",
    options: [
      "WPA3-Personal",
      "WPA3-Enterprise using RADIUS",
      "WEP with Shared Keys",
      "WPS (Wi-Fi Protected Setup)"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "WPA3-Enterprise uses 802.1X authentication, passing user credentials to a centralized RADIUS server (like Cisco ISE) to authenticate access. Reference: IEEE 802.11i.",
      wrong: [
        "WPA3-Personal uses a shared passphrase (SAE), not centralized 802.1X authentication.",
        "WEP is legacy and highly insecure.",
        "WPS uses PINs or push buttons and is vulnerable to brute-force attacks."
      ],
      tip: "802.1X provides per-user authentication, separating user credentials from a shared Wi-Fi password.",
      memory: "Enterprise Wi-Fi = 802.1X + RADIUS.",
      real: "Configure your enterprise network with WPA3-Enterprise, routing user logins through a RADIUS server to enforce security policies.",
      commands: ["radius-server host 10.1.100.10"]
    }
  },
  {
    id: 107,
    domain: "Security Fundamentals",
    topic: "Device Security",
    type: "single",
    difficulty: "Medium",
    examWeight: "15%",
    frequency: "Medium",
    text: "Which command is applied to VTY lines to block Telnet access and restrict incoming connections to SSH only?",
    options: [
      "transport input ssh",
      "transport input telnet ssh",
      "login local ssh-only",
      "ip ssh only"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "The command 'transport input ssh' on VTY lines configures the device to accept only SSH connections. Telnet connections are rejected. Reference: Cisco VTY configuration guides.",
      wrong: [
        "transport input telnet ssh allows both Telnet (insecure) and SSH.",
        "login local ssh-only is invalid Cisco IOS command syntax.",
        "ip ssh only is incorrect syntax."
      ],
      tip: "Telnet sends credentials in plaintext. Disable Telnet using 'transport input ssh' to secure access.",
      memory: "transport input ssh.",
      real: "Secure VTY lines on all enterprise switches: 'line vty 0 15' followed by 'transport input ssh'.",
      commands: ["line vty 0 15", "transport input ssh"]
    }
  },
  {
    id: 108,
    domain: "Security Fundamentals",
    topic: "Device Security",
    type: "single",
    difficulty: "Easy",
    examWeight: "15%",
    frequency: "High",
    text: "Why is SSH version 2 preferred over SSH version 1 for managing network devices?",
    options: [
      "SSH version 2 supports TFTP transfers directly.",
      "SSH version 1 has known cryptographic design flaws that make it vulnerable to exploit.",
      "SSH version 2 runs over UDP, making it faster.",
      "SSH version 1 does not support password authentication."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "SSHv1 has vulnerabilities (like integer overflow exploits) that can compromise the session. SSHv2 improves key exchange and cryptographic algorithms, providing a secure connection. Reference: RFC 4253.",
      wrong: [
        "SSH does not replace TFTP data transfer protocols directly.",
        "Both SSHv1 and SSHv2 run over TCP port 22, not UDP.",
        "SSHv1 supports password authentication, but is insecure."
      ],
      tip: "Configure 'ip ssh version 2' to disable SSHv1 fallbacks on Cisco devices.",
      memory: "SSHv2 is the secure choice; SSHv1 is obsolete.",
      real: "When auditing devices, verify that 'ip ssh version 2' is enabled globally to block legacy SSHv1 connections.",
      commands: ["ip ssh version 2"]
    }
  },

  // ==========================================
  // AUTOMATION AND PROGRAMMABILITY (109 - 122)
  // ==========================================
  {
    id: 109,
    domain: "Automation and Programmability",
    topic: "JSON",
    type: "single",
    difficulty: "Easy",
    examWeight: "10%",
    frequency: "High",
    text: "In JSON syntax, which character is used to define and enclose a structured array of values?",
    options: [
      "Curly braces { }",
      "Square brackets [ ]",
      "Parentheses ( )",
      "Angle brackets < >"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "JSON uses square brackets [ ] to define ordered arrays of values. Curly braces { } define key-value objects. Reference: RFC 8259.",
      wrong: [
        "Curly braces { } are used to define JSON objects.",
        "Parentheses ( ) are not used in JSON structures.",
        "Angle brackets < > are used in XML, not JSON."
      ],
      tip: "JSON is key-value based. Objects are enclosed in {}, arrays are enclosed in [].",
      memory: "Brackets [ ] hold lists (arrays). Braces { } hold objects.",
      real: "When parsing a REST API response from a Cisco DNA Center controller, interfaces are returned as an array enclosed in square brackets [ ].",
      commands: ["show ip interface"]
    }
  },
  {
    id: 110,
    domain: "Automation and Programmability",
    topic: "REST APIs",
    type: "matching",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "High",
    text: "Match the REST API HTTP methods to their corresponding database CRUD operations.",
    pairs: [
      ["POST", "Create a new resource"],
      ["GET", "Read/retrieve resource data"],
      ["PUT", "Update/replace an existing resource"],
      ["DELETE", "Remove a resource"]
    ],
    expl: {
      correct: "Matching",
      why: "REST APIs map HTTP methods to CRUD operations: POST (Create), GET (Read), PUT/PATCH (Update), and DELETE (Delete). Reference: RFC 9110.",
      wrong: [
        "GET is used to read data; it does not modify or create resources.",
        "POST creates resources; it is not for deleting them.",
        "PUT replaces existing resources; it does not remove them."
      ],
      tip: "CRUD stands for Create, Read, Update, Delete. HTTP methods map directly to these operations.",
      memory: "POST = Create. GET = Read. PUT = Update. DELETE = Delete.",
      real: "When configuring a router via RESTCONF, send a POST request to add a new loopback interface, and a GET request to verify its state.",
      commands: ["curl"]
    }
  },
  {
    id: 111,
    domain: "Automation and Programmability",
    topic: "SDN",
    type: "single",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "High",
    text: "In a Software-Defined Networking (SDN) controller architecture, what is the role of Southbound APIs?",
    options: [
      "To connect the controller to external user applications and orchestration tools.",
      "To manage communications between the controller and the physical network devices.",
      "To sync routing tables between two different controllers.",
      "To encrypt local file storage on the controller."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "Southbound APIs (like NETCONF, OpenFlow, or SNMP) manage communications between the controller and physical devices. Northbound APIs connect the controller to applications and management consoles. Reference: Cisco SDN guidelines.",
      wrong: [
        "Northbound APIs connect the controller to applications and orchestration tools.",
        "East/Westbound APIs sync data between controllers.",
        "Southbound APIs do not manage file system encryption."
      ],
      tip: "Northbound = Up (to apps). Southbound = Down (to switches/routers).",
      memory: "Southbound is Down to the physical hardware.",
      real: "An SDN controller uses its Southbound API to push configuration changes to access switches across the campus.",
      commands: ["show ip interface"]
    }
  },
  {
    id: 112,
    domain: "Automation and Programmability",
    topic: "DNA Center",
    type: "single",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "High",
    text: "What is a key capability provided by Cisco Catalyst Center (formerly DNA Center)?",
    options: [
      "It acts as a hardware replacement for Catalyst switches.",
      "It provides centralized, intent-based network management, automation, and assurance.",
      "It is a host operating system that replaces Cisco IOS.",
      "It is an open-source tool for programming web servers."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "Cisco Catalyst Center is an enterprise network controller that provides automation, security policy enforcement, and AI-driven assurance. Reference: Cisco Catalyst Center documentation.",
      wrong: [
        "Catalyst Center is a software management controller, not physical switch hardware.",
        "It manages devices running IOS-XE, but does not replace the device OS.",
        "It is a proprietary enterprise tool, not an open-source web server programming tool."
      ],
      tip: "Catalyst Center uses APIs to automate configurations, monitor performance, and verify compliance.",
      memory: "Catalyst Center = Intent-based management and assurance.",
      real: "Use Catalyst Center to push a standard software upgrade to hundreds of access switches simultaneously, reducing maintenance windows.",
      commands: ["show running-config"]
    }
  },
  {
    id: 113,
    domain: "Automation and Programmability",
    topic: "Ansible",
    type: "single",
    difficulty: "Easy",
    examWeight: "10%",
    frequency: "High",
    text: "Which markup language is utilized by Ansible to write playbooks for configuration management automation?",
    options: [
      "JSON",
      "YAML",
      "XML",
      "Python"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "Ansible playbooks are written in YAML (Yet Another Markup Language), which is human-readable and structured using indentation. Reference: Ansible documentation.",
      wrong: [
        "JSON is used for API payloads, but not default Ansible playbooks.",
        "XML is used by NETCONF, not Ansible.",
        "Python is the language Ansible is built on, but playbooks use YAML."
      ],
      tip: "YAML is highly sensitive to spacing and indentation. Avoid using tabs when writing playbooks.",
      memory: "Ansible = YAML Playbooks.",
      real: "Use an Ansible playbook written in YAML to deploy a standard NTP configuration to all switches in your network.",
      commands: ["ansible-playbook"]
    }
  },
  {
    id: 114,
    domain: "Automation and Programmability",
    topic: "Ansible",
    type: "matching",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "Medium",
    text: "Match the configuration management tools to their operational characteristics.",
    pairs: [
      ["Ansible", "Agentless, push model using SSH/APIs and YAML playbooks."],
      ["Puppet", "Agent-based, pull model using a custom DSL and manifests."],
      ["Chef", "Agent-based, pull model using Ruby-based recipes and cookbooks."]
    ],
    expl: {
      correct: "Matching",
      why: "Ansible is agentless and uses a push model. Puppet and Chef are agent-based and use a pull model, with Puppet using manifests and Chef using recipes. Reference: Configuration management guides.",
      wrong: [
        "Ansible is not agent-based; it connects to devices via SSH without needing agent software.",
        "Chef does not use YAML playbooks; it uses Ruby-based recipes.",
        "SaltStack is another python-based tool, but it relies on minions and a master-minion architecture by default, unlike Ansible's default push model."
      ],
      tip: "Ansible is popular for network automation because it is agentless and does not require agent software on switches.",
      memory: "Ansible = Agentless/Push. Puppet/Chef = Agent/Pull.",
      real: "Deploy Ansible in your network to automate configurations without having to install software on your switches.",
      commands: ["ansible --version"]
    }
  },
  {
    id: 115,
    domain: "Automation and Programmability",
    topic: "NETCONF",
    type: "multi",
    difficulty: "Hard",
    examWeight: "10%",
    frequency: "High",
    text: "Which two statements correctly describe the characteristics of NETCONF and RESTCONF protocols?",
    options: [
      "NETCONF uses SSH as its transport protocol, while RESTCONF uses HTTP/HTTPS.",
      "Both protocols use JSON as their only data encoding format.",
      "Both protocols utilize YANG data models to structure configuration and state data.",
      "RESTCONF is stateful, while NETCONF is stateless."
    ],
    correct: [0, 2],
    expl: {
      correct: "A,C",
      why: "NETCONF operates over SSH (port 830) and uses XML. RESTCONF operates over HTTP/HTTPS (port 443) and supports both XML and JSON. Both use YANG models to structure data. Reference: RFC 6241 and RFC 8040.",
      wrong: [
        "NETCONF supports only XML, not JSON.",
        "RESTCONF is stateful (built on HTTP), while NETCONF is stateful (maintains SSH sessions).",
        "Neither protocol utilizes Telnet or plaintext communication for network management."
      ],
      tip: "NETCONF uses SSH and XML. RESTCONF uses HTTP/HTTPS and supports both XML and JSON.",
      memory: "NETCONF = SSH/XML. RESTCONF = HTTPS/JSON/XML. Both use YANG.",
      real: "Configure RESTCONF on a router to retrieve interface statistics using a python script with a GET request.",
      commands: ["show running-config | include restconf"]
    }
  },
  {
    id: 116,
    domain: "Automation and Programmability",
    topic: "YANG",
    type: "single",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "High",
    text: "What is the primary purpose of the YANG data modeling language in network automation?",
    options: [
      "To transfer configuration files over the network.",
      "To define the structure and constraints of configuration and state data used by protocols like NETCONF.",
      "To execute automation scripts on remote devices.",
      "To act as a replacement for REST APIs."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "YANG is a data modeling language that defines the structure, hierarchy, and constraints of configuration and operational data, which is then used by protocols like NETCONF and RESTCONF. Reference: RFC 7950.",
      wrong: [
        "YANG is not a transport protocol; protocols like NETCONF/RESTCONF handle data transfer.",
        "YANG is a data model, not a script execution engine.",
        "YANG does not replace REST APIs; it defines the data models used by RESTCONF APIs."
      ],
      tip: "YANG defines the data structure, while NETCONF or RESTCONF acts as the transport protocol.",
      memory: "YANG = Modeling language (blueprint). NETCONF/RESTCONF = Transport (delivery).",
      real: "When automating your network, use YANG models to ensure configuration changes sent to different switch models have a consistent format.",
      commands: ["show yang suite"]
    }
  },
  {
    id: 117,
    domain: "Automation and Programmability",
    topic: "SDN",
    type: "single",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "High",
    text: "In Software-Defined Access (SD-Access), what is the difference between the underlay and the overlay network?",
    options: [
      "The underlay consists of logical tunnels, while the overlay is the physical cabling.",
      "The underlay is the physical infrastructure and routing protocols that provide basic connectivity, while the overlay is the logical network of tunnels that forwards user traffic.",
      "The underlay is managed by the ISP, while the overlay is managed locally.",
      "The underlay is for IPv4 traffic, and the overlay is for IPv6 traffic."
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "The underlay network provides physical connectivity and routing (usually using IS-IS or OSPF) between network nodes. The overlay network is a logical topology built on top of the underlay using tunnels (like VXLAN) to forward user traffic. Reference: Cisco SD-Access design guides.",
      wrong: [
        "The underlay is the physical network, and the overlay consists of the logical tunnels.",
        "Both underlay and overlay are managed locally in an enterprise fabric.",
        "Both underlay and overlay support both IPv4 and IPv6 traffic."
      ],
      tip: "The underlay provides connectivity; the overlay provides virtualization and services.",
      memory: "Underlay = Physical/Routing. Overlay = Logical/Tunnels (VXLAN).",
      real: "In an SD-Access deployment, the switches use an OSPF underlay for reachability, and VXLAN tunnels (overlay) to carry user traffic across the network.",
      commands: ["show ip route"]
    }
  },
  {
    id: 118,
    domain: "Automation and Programmability",
    topic: "SDN",
    type: "single",
    difficulty: "Easy",
    examWeight: "10%",
    frequency: "High",
    text: "Which plane of network device operation is centralized in a Software-Defined Networking (SDN) controller architecture?",
    options: [
      "Data Plane",
      "Control Plane",
      "Management Plane",
      "Physical Plane"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "SDN separates the control plane (which makes routing and forwarding decisions) from the data plane (which forwards packets based on those decisions). The control plane is centralized in the SDN controller. Reference: Cisco SDN guidelines.",
      wrong: [
        "The data plane remains distributed on physical switches and routers to forward packets at wire speed.",
        "The management plane is used for configuration access (SSH, SNMP), which is centralized but not the core change of SDN.",
        "There is no physical plane in device operations."
      ],
      tip: "SDN = Centralized Control Plane + Distributed Data Plane.",
      memory: "Control Plane is centralized in the controller.",
      real: "In an SDN network, switches query the controller to build forwarding paths, rather than running local routing protocols to calculate routes.",
      commands: ["show ip route"]
    }
  },
  {
    id: 119,
    domain: "Automation and Programmability",
    topic: "REST APIs",
    type: "single",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "Medium",
    text: "Which HTTP status code is returned by a REST API server to indicate that a request was successful and a new resource was created?",
    options: [
      "200 OK",
      "201 Created",
      "400 Bad Request",
      "404 Not Found"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "HTTP status code 201 indicates that the request succeeded and a new resource was created. 200 OK indicates success, but typically without resource creation. Reference: RFC 9110.",
      wrong: [
        "200 OK indicates a successful request, but does not specify that a resource was created.",
        "400 Bad Request indicates a client-side syntax error.",
        "404 Not Found indicates that the requested resource does not exist on the server."
      ],
      tip: "2xx codes indicate success, 3xx redirection, 4xx client errors, and 5xx server errors.",
      memory: "200 = Success. 201 = Created.",
      real: "When sending a POST request to add a static route on a router, verify that the router returns a 201 Created status code.",
      commands: ["curl -I"]
    }
  },
  {
    id: 120,
    domain: "Automation and Programmability",
    topic: "REST APIs",
    type: "single",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "Medium",
    text: "Which transport protocol and default port number are used by RESTCONF for secure programmatic communications?",
    options: [
      "SSH, Port 830",
      "HTTPS, Port 443",
      "HTTP, Port 80",
      "TCP, Port 22"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "RESTCONF is an HTTP-based protocol that runs over HTTPS (port 443) using REST principles. Reference: RFC 8040.",
      wrong: [
        "SSH Port 830 is used by NETCONF, not RESTCONF.",
        "HTTP Port 80 is insecure and not the default secure transport for RESTCONF.",
        "TCP Port 22 is for standard SSH, not RESTCONF."
      ],
      tip: "NETCONF uses SSH (port 830). RESTCONF uses HTTPS (port 443).",
      memory: "RESTCONF = HTTPS (443). NETCONF = SSH (830).",
      real: "Enable RESTCONF on your router: 'restconf' globally, and ensure HTTPS access is permitted through your firewalls.",
      commands: ["show ip http secure-status"]
    }
  },
  {
    id: 121,
    domain: "Security Fundamentals",
    topic: "Layer 2 Security",
    type: "single",
    difficulty: "Hard",
    examWeight: "15%",
    frequency: "Medium",
    text: "What security threat is mitigated by enabling IP Source Guard on an access switch port?",
    options: [
      "MAC Address Flooding attacks",
      "IP Address Spooping / Host Impersonation",
      "DHCP Starvation attacks",
      "Spanning Tree loops"
    ],
    correct: [1],
    expl: {
      correct: "B",
      why: "IP Source Guard checks the source IP of packets received on untrusted ports against the DHCP Snooping binding database. If the IP/MAC binding does not match, the traffic is dropped, preventing IP address spoofing. Reference: Cisco Layer 2 security guidelines.",
      wrong: [
        "MAC flooding is mitigated by port security, not IP Source Guard.",
        "DHCP starvation is prevented by rate limiting DHCP requests, not IP Source Guard.",
        "Spanning Tree loops are prevented by Spanning Tree Protocol (STP)."
      ],
      tip: "IP Source Guard builds on DHCP Snooping and MAC address tables to validate traffic.",
      memory: "IP Source Guard = Guard against IP spoofing.",
      real: "Configure IP Source Guard on guest switchports to prevent users from manually assigning themselves static IPs to bypass security filters.",
      commands: ["ip verify source"]
    }
  },
  {
    id: 122,
    domain: "Security Fundamentals",
    topic: "Device Security",
    type: "single",
    difficulty: "Medium",
    examWeight: "15%",
    frequency: "Medium",
    text: "Which command configures a login lockout policy on a Cisco router to block login attempts for 5 minutes (300 seconds) if a user fails 3 login attempts within a 60-second window?",
    options: [
      "login block-for 300 attempts 3 within 60",
      "lockout login 300 attempts 3 time 60",
      "service login-lockout 300 attempts 3",
      "aaa lockout attempts 3 duration 300"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "The command 'login block-for <seconds> attempts <count> within <seconds>' configures a brute-force mitigation policy on Cisco IOS. Reference: Cisco device hardening guides.",
      wrong: [
        "lockout login is invalid Cisco IOS command syntax.",
        "service login-lockout is incorrect syntax.",
        "aaa lockout is not a valid global configuration command."
      ],
      tip: "Configure this policy to protect VTY lines from automated brute-force attacks.",
      memory: "login block-for LOCKOUT_TIME attempts FAILED_COUNT within WINDOW.",
      real: "Enable login block-for on your border routers to protect management VTY access from internet scanners.",
      commands: ["login block-for 300 attempts 3 within 60"]
    }
  },
  {
    id: 123,
    domain: "Network Fundamentals",
    topic: "Wireless Deployment",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "A network engineer is deploying lightweight access points (LAPs) in a branch office that has a WAN link connecting to the main campus where the WLC is located. Which wireless deployment mode should be configured on the LAPs to allow local client traffic switching if the WAN link to the WLC goes down?",
    options: [
      "FlexConnect Mode",
      "Local Mode",
      "Bridge Mode",
      "Monitor Mode"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "FlexConnect is a wireless solution for branch and remote office deployments. It allows the WLC to configure access points over the WAN link, but switch data traffic locally. If the WAN connection fails, the LAP can continue to switch traffic locally for existing clients.",
      wrong: [
        "Local Mode is the default mode where all client traffic is tunneled via CAPWAP back to the WLC; if the WLC is unreachable, wireless clients cannot access local network resources.",
        "Bridge Mode is used to configure APs as outdoor point-to-point or point-to-multipoint mesh nodes.",
        "Monitor Mode disables transmitter capabilities, allowing the AP to act as a dedicated sensor for location tracking and intrusion detection."
      ],
      tip: "FlexConnect allows local switching and local authentication if the link to the WLC is lost.",
      memory: "FlexConnect = Flexible switching, local switching if WAN fails.",
      real: "Always use FlexConnect for branch offices with limited WAN bandwidth to keep local printer and server access functional during WAN outages.",
      commands: []
    }
  },
  {
    id: 124,
    domain: "Network Fundamentals",
    topic: "Cabling Properties",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "Medium",
    text: "Which optical fiber standard is designed for long-distance transmissions, utilizes a laser light source, and has a typical core size of 9 microns?",
    options: [
      "10GBASE-LR (Single-Mode Fiber)",
      "10GBASE-SR (Multi-Mode Fiber)",
      "1000BASE-T (Unshielded Twisted Pair)",
      "1000BASE-SX (Multi-Mode Fiber)"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "Single-mode fiber (SMF) has a very small core diameter (typically 9 microns), which restricts the light to a single path (mode). It uses laser light sources and is suited for high-speed, long-distance transmission, such as 10GBASE-LR (Long Range).",
      wrong: [
        "10GBASE-SR (Short Range) uses multi-mode fiber (MMF), which has a larger core (50 or 62.5 microns) and uses LEDs or VCSELs, limiting its distance.",
        "1000BASE-T is a copper cabling standard using UTP, not optical fiber.",
        "1000BASE-SX is a multi-mode fiber standard for short distances using 850nm lasers."
      ],
      tip: "Single-mode fiber = Small core (9 microns), Laser source, long distances (up to 10km or more).",
      memory: "SMF = Single mode, Small core, Super-far distance.",
      real: "When connecting buildings across a campus that are more than 500 meters apart, use Single-Mode Fiber (SMF) to prevent signal attenuation.",
      commands: []
    }
  },
  {
    id: 125,
    domain: "Network Fundamentals",
    topic: "WAN Topologies",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "Medium",
    text: "Which WAN service utilizes label switching routers (LSRs) and edge routers (LERs) to forward data using short path labels rather than complex routing table lookups?",
    options: [
      "Multiprotocol Label Switching (MPLS)",
      "Metro Ethernet (MetroE)",
      "Site-to-Site IPsec VPN",
      "Dynamic Multipoint VPN (DMVPN)"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "Multiprotocol Label Switching (MPLS) is a high-performance WAN technology that directs data from one network node to another based on short path labels rather than long network addresses, using Label Switch Routers (LSRs) and Label Edge Routers (LERs).",
      wrong: [
        "Metro Ethernet is a service that extends Ethernet technology beyond the LAN into metropolitan networks, behaving like a large Layer 2 bridge.",
        "Site-to-Site IPsec VPN is an encrypted tunnel over the public Internet, not a service provider label-switching technology.",
        "DMVPN is a Cisco proprietary software solution for building multiple IPsec VPNs in an easy, dynamic, and scalable manner."
      ],
      tip: "MPLS relies on labels inserted between Layer 2 and Layer 3 headers (often called a Layer 2.5 protocol).",
      memory: "MPLS = Multiprotocol Label Switching. Look for LSR and LER keywords.",
      real: "Enterprise networks often use MPLS to interconnect branch offices with guaranteed Quality of Service (QoS) for voice and video traffic.",
      commands: []
    }
  },
  {
    id: 126,
    domain: "Network Fundamentals",
    topic: "IPv6 EUI-64",
    type: "single",
    difficulty: "Hard",
    examWeight: "20%",
    frequency: "High",
    text: "If a Cisco router interface MAC address is 0011:2233:4455, what is the interface ID (last 64 bits) of its IPv6 address when calculated using the EUI-64 process?",
    options: [
      "0211:22FF:FE33:4455",
      "0011:22FF:FE33:4455",
      "0211:2233:4455:FFFE",
      "2001:0011:22FF:FE33"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "The EUI-64 process takes a 48-bit MAC address, splits it in half, inserts FFFE in the middle, and flips the 7th bit (universal/local bit) of the first byte. The MAC address 0011:2233:4455 has the first byte 00 (binary 00000000). Flipping the 7th bit results in 00000010 (hex 02). Inserting FFFE in the middle of 0011:2233:4455 results in 0211:22FF:FE33:4455.",
      wrong: [
        "0011:22FF:FE33:4455 is incorrect because the 7th bit of the first byte was not flipped.",
        "0211:2233:4455:FFFE is incorrect because FFFE was appended to the end rather than inserted in the middle.",
        "2001:0011:22FF:FE33 is a global unicast prefix example, not the host interface identifier."
      ],
      tip: "To perform EUI-64: Split MAC, insert FFFE in the middle, change the 2nd hex character of the MAC (e.g. 00 -> 02, 0c -> 0e).",
      memory: "EUI-64: Split, insert FFFE, flip the 7th bit (add 2 to the first byte in hex).",
      real: "Review interface configuration using 'show ipv6 interface' to observe the EUI-64 link-local address generation.",
      commands: ["show ipv6 interface"]
    }
  },
  {
    id: 127,
    domain: "Network Fundamentals",
    topic: "DNS Records",
    type: "single",
    difficulty: "Easy",
    examWeight: "20%",
    frequency: "Medium",
    text: "Which type of DNS resource record resolves a domain name to an IPv6 address?",
    options: [
      "AAAA record",
      "A record",
      "CNAME record",
      "MX record"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "An AAAA DNS record maps a hostname to a 128-bit IPv6 address, whereas a standard A record maps a hostname to a 32-bit IPv4 address.",
      wrong: [
        "A record resolves a domain name to a 32-bit IPv4 address.",
        "CNAME record (Canonical Name) maps an alias name to the true canonical domain name.",
        "MX record (Mail Exchanger) specifies the mail server responsible for accepting email messages on behalf of a domain."
      ],
      tip: "Think of AAAA as four times the size of A (IPv6 is 128 bits, which is 4 times the size of IPv4's 32 bits).",
      memory: "A = IPv4, AAAA = IPv6, MX = Mail, CNAME = Alias.",
      real: "When deploying an IPv6-only public web server, create an AAAA record in your external DNS provider.",
      commands: []
    }
  },
  {
    id: 128,
    domain: "Network Access",
    topic: "Wireless Roaming",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "Medium",
    text: "A wireless client moves from the coverage area of AP-A to AP-B. Both APs are connected to different access layer switches, but are managed by the same WLC. If the client maintains its IP address and session state, what type of roaming has occurred?",
    options: [
      "Layer 2 Roaming (Intra-Controller)",
      "Layer 3 Roaming (Inter-Controller)",
      "Subnet-to-Subnet Roaming",
      "Autonomous-to-Lightweight Roaming"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "Layer 2 Roaming (or Intra-Controller Roaming) occurs when a client moves between APs that are associated with the same WLC and are configured on the same VLAN/subnet. The WLC updates its database with the client's new AP association without changing the client's IP address.",
      wrong: [
        "Layer 3 Roaming (Inter-Controller Roaming) happens when a client roams between APs managed by different WLCs on different subnets, requiring traffic asymmetric tunneling (foreign/anchor relationship) to keep the original IP address.",
        "Subnet-to-Subnet Roaming is a general concept that typically forces a new DHCP request and IP change unless Layer 3 roaming capabilities are enabled.",
        "Autonomous-to-Lightweight Roaming describes moving from standalone APs to controller-managed APs, not client movement."
      ],
      tip: "In Intra-Controller Roaming, the MAC-to-port mapping is updated inside the WLC, and a gratuitous ARP is sent to update the switch CAM tables.",
      memory: "Intra-Controller / same VLAN = Layer 2 Roaming.",
      real: "Configure a mobility group when you need to enable seamless Layer 3 roaming across multiple WLCs.",
      commands: []
    }
  },
  {
    id: 129,
    domain: "Network Access",
    topic: "WLC Interfaces",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "Which WLC interface is used by the controller to relay DHCP messages, perform web authentication, and handle VPN termination, and is typically configured with an out-of-band non-routable IP address?",
    options: [
      "Virtual Interface",
      "Management Interface",
      "AP-Manager Interface",
      "Service Port"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "The Virtual Interface on a WLC is used for layer 3 security authentication (web auth), DHCP relay redirection, and mobility management. It must be configured with a non-routable IP address (such as 192.0.2.1) that does not exist in the routing table of the enterprise network.",
      wrong: [
        "Management Interface is the default interface for out-of-band and in-band WLC management, and controller-to-WLC communication.",
        "AP-Manager Interface controls LAP-to-WLC CAPWAP tunnel communications.",
        "Service Port is a physical interface used only for out-of-band management and recovery."
      ],
      tip: "The virtual interface IP must be a unique, non-routable address, and all WLCs in a mobility group should share the same virtual interface IP.",
      memory: "Virtual Interface = DHCP relay redirection, web auth redirection.",
      real: "When configuring a WLC for the first time, use 192.0.2.1 as the virtual IP address to comply with RFC 5737 recommendations.",
      commands: []
    }
  },
  {
    id: 130,
    domain: "Network Access",
    topic: "Rapid PVST+",
    type: "single",
    difficulty: "Hard",
    examWeight: "20%",
    frequency: "High",
    text: "In a Rapid PVST+ configuration, which port role is assigned to a port that receives superior BPDUs from another switch and acts as an immediate standby interface to the root port?",
    options: [
      "Alternate Port",
      "Backup Port",
      "Designated Port",
      "Root Port"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "In RSTP (and Rapid PVST+), an Alternate port receives superior BPDUs from another switch. It acts as an alternate path to the root switch and can transition immediately to a forwarding root port if the active root port fails.",
      wrong: [
        "Backup port receives superior BPDUs from its own switch (usually due to a hub connecting two ports on the same switch) and acts as a backup path to a shared segment.",
        "Designated port is the port on a segment that is elected to forward traffic toward the root bridge.",
        "Root port is the single port on a non-root switch that has the lowest path cost to the root bridge."
      ],
      tip: "Alternate = Backup path to Root (receives BPDU from ANOTHER switch). Backup = Backup path to segment (receives BPDU from SELF).",
      memory: "Alternate = Alternate Switch. Backup = Same Switch.",
      real: "Execute 'show spanning-tree' to see RSTP port roles. Alternate ports will display status as 'Altn BLK'.",
      commands: ["show spanning-tree"]
    }
  },
  {
    id: 131,
    domain: "Network Access",
    topic: "EtherChannel",
    type: "single",
    difficulty: "Medium",
    examWeight: "20%",
    frequency: "High",
    text: "Which combination of EtherChannel negotiation modes on two connected switches will successfully form an EtherChannel?",
    options: [
      "Switch 1: LACP Active | Switch 2: LACP Passive",
      "Switch 1: PAgP Desirable | Switch 2: LACP Active",
      "Switch 1: PAgP Auto | Switch 2: PAgP Auto",
      "Switch 1: LACP Passive | Switch 2: LACP Passive"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "LACP Active initiates negotiation, while Passive waits for the other side to negotiate. Active-Passive will form a channel. Active-Active will also form a channel.",
      wrong: [
        "PAgP Desirable and LACP Active cannot form a channel because PAgP (Cisco proprietary) and LACP (IEEE 802.3ad) are incompatible protocols.",
        "PAgP Auto and PAgP Auto will not form a channel because both ports are passive and wait for the other side to initiate negotiation.",
        "LACP Passive and LACP Passive will not form a channel because both ports are passive and will never initiate negotiation."
      ],
      tip: "At least one side must be in active negotiation mode (Active for LACP, Desirable for PAgP). Protocols must match.",
      memory: "PAgP = Auto/Desirable. LACP = Passive/Active. Incompatible protocols never bundle.",
      real: "Always use LACP (Active on both sides) for cross-vendor EtherChannel deployments to ensure multi-chassis link aggregation compatibility.",
      commands: ["channel-group 1 mode active", "show etherchannel summary"]
    }
  },
  {
    id: 132,
    domain: "Network Access",
    topic: "VTP Revision",
    type: "single",
    difficulty: "Hard",
    examWeight: "20%",
    frequency: "Medium",
    text: "A network administrator adds a refurbished switch to an existing network. The switch is configured in VTP Server mode with the correct VTP domain name, but has a VTP revision number of 45. The existing network's VTP Server has a revision number of 30. What will happen to the VLAN configuration of the existing network?",
    options: [
      "All switches in the domain will overwrite their VLAN database with the refurbished switch's VLAN database.",
      "The refurbished switch will update its database with the existing VTP server's configuration.",
      "The switches will merge their databases and increment the revision to 46.",
      "VTP synchronization will fail and log a mismatched revision error on all switches."
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "VTP switches overwrite their VLAN database if they receive a VTP advertisement with the same domain name and a higher configuration revision number. If a refurbished switch with a higher revision number (45) is introduced, it will overwrite the database of switches with lower revision numbers (30), which can delete existing VLANs and cause a major outage.",
      wrong: [
        "The refurbished switch will not update its database because its revision number is higher, not lower.",
        "The switches do not merge databases; VTP completely overwrites the database of the lower revision with that of the higher revision.",
        "No error is logged to block it; VTP automatically accepts the higher revision by design, which is why VTP is considered risky."
      ],
      tip: "To prevent VTP disasters, change the VTP domain name to a dummy name and back, or change the mode to VTP Transparent before adding a switch to reset the revision number to 0.",
      memory: "Higher VTP Revision = Overwrites lower revision. Reset to 0 by changing domain/mode.",
      real: "Reset the VTP revision number of any switch using 'vtp mode transparent' before introducing it to a production network.",
      commands: ["vtp mode transparent", "vtp domain dummy", "show vtp status"]
    }
  },
  {
    id: 133,
    domain: "IP Connectivity",
    topic: "OSPF Network Types",
    type: "single",
    difficulty: "Hard",
    examWeight: "25%",
    frequency: "High",
    text: "Which OSPF network type is the default on physical serial interfaces, does not elect a DR/BDR, and has a default Hello timer of 10 seconds?",
    options: [
      "Point-to-Point",
      "Broadcast",
      "Non-Broadcast Multi-Access (NBMA)",
      "Point-to-Multipoint"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "The Point-to-Point OSPF network type is default on serial interfaces running HDLC or PPP encapsulation. It does not perform Designated Router (DR) or Backup Designated Router (BDR) elections because only two routers exist on the link, and its default timers are 10s Hello / 40s Dead.",
      wrong: [
        "Broadcast is the default on Ethernet interfaces, elects a DR/BDR, and has a 10s Hello timer.",
        "Non-Broadcast Multi-Access (NBMA) is default on Frame Relay and ATM interfaces, elects a DR/BDR, and has a 30s Hello timer.",
        "Point-to-Multipoint does not elect a DR/BDR, but it has a default Hello timer of 30 seconds."
      ],
      tip: "OSPF Point-to-Point requires no DR/BDR, meaning adjacencies form faster and database exchange is simpler.",
      memory: "Point-to-Point = No DR/BDR, 10s Hello. Serial default.",
      real: "Use 'ip ospf network point-to-point' on subinterfaces and Tunnel interfaces to optimize OSPF convergence and reduce DR overhead.",
      commands: ["ip ospf network point-to-point", "show ip ospf interface"]
    }
  },
  {
    id: 134,
    domain: "IP Connectivity",
    topic: "OSPF States",
    type: "single",
    difficulty: "Hard",
    examWeight: "25%",
    frequency: "High",
    text: "During the OSPF neighbor adjacency process, in which state do two routers exchange Database Description (DBD) packets to describe their Link-State Database contents?",
    options: [
      "Exchange State",
      "ExStart State",
      "Loading State",
      "2-Way State"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "In the Exchange state, OSPF routers send Database Description (DBD) packets to each other. These packets contain LSA headers that describe the contents of the router's link-state database.",
      wrong: [
        "ExStart state is where routers elect a Master/Slave relationship and decide the initial sequence number using empty DBD packets.",
        "Loading state is where routers request missing or newer LSAs using Link State Request (LSR) packets and receive updates via Link State Update (LSU) packets.",
        "2-Way state is where bi-directional communication is established, and DR/BDR elections occur on broadcast networks."
      ],
      tip: "OSPF State transition flow: Down -> Init -> 2-Way -> ExStart -> Exchange -> Loading -> Full.",
      memory: "ExStart = Master/Slave election. Exchange = DBD packets. Loading = LSR/LSU.",
      real: "If OSPF is stuck in ExStart/Exchange, check for MTU mismatches on the connecting interfaces.",
      commands: ["show ip ospf neighbor", "debug ip ospf adj"]
    }
  },
  {
    id: 135,
    domain: "IP Connectivity",
    topic: "Route Selection",
    type: "single",
    difficulty: "Medium",
    examWeight: "25%",
    frequency: "High",
    text: "A router receives three routing updates for the destination prefix 10.1.1.0/24: OSPF (AD 110, Metric 50), EIGRP (AD 90, Metric 307200), and a Static Route (AD 1, Metric 0). Which route will the router install in the routing table?",
    options: [
      "The Static Route",
      "The EIGRP Route",
      "The OSPF Route",
      "All three routes (Load Balancing)"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "When a router receives paths to the exact same prefix from different routing sources, it compares the Administrative Distance (AD). The route with the lowest AD is installed. A Static Route has a default AD of 1, which is lower than EIGRP (90) and OSPF (110).",
      wrong: [
        "EIGRP Route is not selected because its AD (90) is higher than the Static Route (1).",
        "OSPF Route is not selected because its AD (110) is higher than EIGRP (90) and Static Route (1).",
        "Load Balancing only happens if paths have the same prefix, protocol, and cost (or via EIGRP unequal cost load balancing), not across different protocols with different ADs."
      ],
      tip: "Lowest AD wins when prefix lengths are identical. Lowest Metric wins when comparing routes within the same protocol.",
      memory: "Route selection priority: 1. Longest Match Prefix, 2. Lowest AD, 3. Lowest Metric.",
      real: "Verify the routing table using 'show ip route' to check the active protocol code next to the prefix.",
      commands: ["show ip route", "show ip route 10.1.1.0"]
    }
  },
  {
    id: 136,
    domain: "IP Connectivity",
    topic: "HSRP",
    type: "single",
    difficulty: "Medium",
    examWeight: "25%",
    frequency: "High",
    text: "What is the virtual MAC address of an HSRP group 10 active router configured for IPv4?",
    options: [
      "0000.0c07.ac0a",
      "0000.0c07.ac10",
      "0000.0c9f.f00a",
      "0100.5e00.000a"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "The HSRP version 1 virtual MAC address structure for IPv4 is 0000.0c07.acXX, where XX is the HSRP group number in hexadecimal. Group 10 in decimal is '0a' in hex. Therefore, the virtual MAC is 0000.0c07.ac0a.",
      wrong: [
        "0000.0c07.ac10 is incorrect because 10 is in decimal and must be converted to hex ('0a').",
        "0000.0c9f.f00a is the HSRP version 2 virtual MAC address structure (0000.0c9f.fXXX, where XXX is the hex group number). For group 10, that would be f00a.",
        "0100.5e00.000a is a multicast MAC address (used for IPv4 multicast routing mapping), not an HSRP virtual MAC."
      ],
      tip: "HSRP v1: 0000.0c07.acXX (XX = Hex group). HSRP v2: 0000.0c9f.fXXX (XXX = Hex group). VRRP: 0000.5e00.01XX.",
      memory: "Convert decimal group to hex! 10 decimal = 0a hex.",
      real: "When troubleshooting gateway issues, verify client ARP cache using 'arp -a' to see if it shows the HSRP virtual MAC.",
      commands: ["standby 10 ip 192.168.1.254", "show standby"]
    }
  },
  {
    id: 137,
    domain: "IP Connectivity",
    topic: "IPv6 Static Routing",
    type: "single",
    difficulty: "Medium",
    examWeight: "25%",
    frequency: "Medium",
    text: "Which command configures a floating static IPv6 route to destination prefix 2001:db8:acad::/64 with a next-hop IP of 2001:db8:feed::1 and an administrative distance of 150?",
    options: [
      "ipv6 route 2001:db8:acad::/64 2001:db8:feed::1 150",
      "ipv6 route 2001:db8:acad::/64 interface g0/1 150",
      "ipv6 route 2001:db8:acad::/64 2001:db8:feed::1 metric 150",
      "ip route ipv6 2001:db8:acad::/64 2001:db8:feed::1 150"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "The correct command syntax is 'ipv6 route <prefix/length> <next-hop-ip> [administrative-distance]'. In this case: 'ipv6 route 2001:db8:acad::/64 2001:db8:feed::1 150'. The AD is appended directly after the next-hop address.",
      wrong: [
        "ipv6 route ... interface g0/1 150 is a fully specified or directly attached route using an egress interface, which requires extra next-hop config for multi-access links, and was not requested.",
        "metric 150 is incorrect syntax; Cisco IOS does not use the keyword 'metric' for static route AD assignment.",
        "ip route ipv6 is invalid command structure; IPv6 static routing uses the 'ipv6 route' command."
      ],
      tip: "Floating static routes are configured with an AD higher than the active routing protocol (e.g. OSPF: 110) so they only enter the routing table if the primary route fails.",
      memory: "ipv6 route PREFIX/LENGTH NEXT_HOP AD",
      real: "Configure floating static routes to provide backup connectivity in case OSPF adjacencies fail.",
      commands: ["ipv6 route 2001:db8:acad::/64 2001:db8:feed::1 150"]
    }
  },
  {
    id: 138,
    domain: "IP Services",
    topic: "NAT Overload",
    type: "single",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "High",
    text: "What is the theoretical maximum number of concurrent translation sessions that Port Address Translation (PAT) can support using a single inside global IPv4 address?",
    options: [
      "65,536",
      "1,024",
      "4,096",
      "16,777,216"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "PAT (NAT Overload) translates inside local IP addresses to a single inside global IP address by utilizing unique source port numbers in the TCP and UDP headers. Since the port field is 16 bits in size, there are 2^16 (65,536) theoretical ports available per inside global IP address.",
      wrong: [
        "1,024 is the maximum number of well-known system ports, not the total port availability.",
        "4,096 is the limit of VLAN IDs, not port translations.",
        "16,777,216 is the number of IPv4 Class A addresses, unrelated to transport layer port limitations."
      ],
      tip: "In practice, PAT reserves some port ranges, but the theoretical limit is dictated by the 16-bit port number field.",
      memory: "PAT = Port Address Translation. 16-bit port number = 65,536 sessions.",
      real: "Monitor active NAT translations using 'show ip nat translations' to check for translation exhaustion in busy corporate environments.",
      commands: ["ip nat inside source list 1 interface GigabitEthernet0/0 overload", "show ip nat translations"]
    }
  },
  {
    id: 139,
    domain: "IP Services",
    topic: "DHCP Snooping",
    type: "single",
    difficulty: "Hard",
    examWeight: "10%",
    frequency: "Medium",
    text: "Which DHCP Snooping feature inserts information about the switch port and VLAN from which a DHCP request originated into the DHCP packet before forwarding it to the server?",
    options: [
      "Option 82 (Relay Agent Information Option)",
      "Option 150 (TFTP Server Option)",
      "Option 67 (Bootfile Name Option)",
      "Option 43 (WLC IP Option)"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "DHCP Option 82 (the Relay Agent Information Option) is inserted by DHCP-snooping-enabled switches or DHCP relay agents to provide the DHCP server with details about the physical switch port, VLAN, and MAC address of the requesting client to facilitate strict IP address allocation policies.",
      wrong: [
        "Option 150 specifies TFTP server IP addresses for IP phone configuration downloads.",
        "Option 67 specifies the bootfile name for network booting clients.",
        "Option 43 specifies the IP address of wireless LAN controllers to lightweight access points."
      ],
      tip: "DHCP Snooping must be globally enabled and active on the client VLAN for Option 82 insertion to occur.",
      memory: "Option 82 = Switch Port & VLAN identifier (Relay Agent Information).",
      real: "Cisco switches insert Option 82 by default when DHCP snooping is enabled, which might cause some DHCP servers to reject requests unless configured to handle it.",
      commands: ["ip dhcp snooping", "ip dhcp snooping information option"]
    }
  },
  {
    id: 140,
    domain: "IP Services",
    topic: "SNMPv3",
    type: "single",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "High",
    text: "Which SNMPv3 security level provides authentication using HMAC-MD5 or HMAC-SHA but does not provide encryption of the SNMP data packets?",
    options: [
      "authNoPriv",
      "noAuthNoPriv",
      "authPriv",
      "noAuthPriv"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "The SNMPv3 'authNoPriv' security level provides message authentication and integrity checks using MD5 or SHA algorithms, but it does not encrypt (provide privacy for) the payload data.",
      wrong: [
        "noAuthNoPriv provides no authentication and no encryption, mimicking older SNMPv1/v2c security but using SNMPv3 headers.",
        "authPriv provides both authentication (MD5/SHA) and encryption (DES/AES) for maximum security.",
        "noAuthPriv is not a valid SNMPv3 security level (you cannot encrypt without authenticating first)."
      ],
      tip: "SNMPv3 levels: 1) noAuthNoPriv (no security), 2) authNoPriv (password checked), 3) authPriv (password checked + encrypted).",
      memory: "auth = Authenticated (MD5/SHA). Priv = Private (Encrypted with DES/AES).",
      real: "Always use SNMPv3 'authPriv' globally to protect network monitoring data from sniffing and spoofing.",
      commands: ["snmp-server group MONITOR v3 auth"]
    }
  },
  {
    id: 141,
    domain: "Security Fundamentals",
    topic: "TACACS+ vs RADIUS",
    type: "single",
    difficulty: "Medium",
    examWeight: "15%",
    frequency: "High",
    text: "Which statement accurately describes a key architectural difference between TACACS+ and RADIUS AAA protocols?",
    options: [
      "TACACS+ uses TCP port 49 and encrypts the entire packet body, while RADIUS uses UDP ports 1812/1813 and encrypts only the user password.",
      "TACACS+ uses UDP port 49 and encrypts only the password, while RADIUS uses TCP port 1812 and encrypts the entire packet.",
      "TACACS+ merges authentication and authorization into one step, while RADIUS separates them.",
      "TACACS+ is an open standard, while RADIUS is a Cisco proprietary protocol."
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "TACACS+ is a TCP-based protocol (port 49) that separates authentication, authorization, and accounting (AAA) steps, and encrypts the entire packet body (except the header). RADIUS is a UDP-based protocol (ports 1812/1813) that combines authentication and authorization, and only encrypts the password field in the access request.",
      wrong: [
        "TACACS+ uses TCP, not UDP, and encrypts the entire packet body. RADIUS uses UDP, not TCP.",
        "TACACS+ separates authentication and authorization, whereas RADIUS combines them.",
        "TACACS+ was originally Cisco proprietary (now open), while RADIUS has always been an open standard (RFC-defined)."
      ],
      tip: "TACACS+ is best for device administration (router logins) because it allows strict command authorization. RADIUS is best for network access (802.1X, dot1x) due to high throughput.",
      memory: "TACACS+ = TCP 49, separates AAA, encrypts all. RADIUS = UDP 1812, combines Auth/Authz, encrypts password.",
      real: "Configure TACACS+ servers for device shell access control to track exactly which administrative commands are executed by users.",
      commands: ["tacacs server TAC-SERVER", "radius server RAD-SERVER"]
    }
  },
  {
    id: 142,
    domain: "Security Fundamentals",
    topic: "Dynamic ARP Inspection",
    type: "single",
    difficulty: "Hard",
    examWeight: "15%",
    frequency: "High",
    text: "Dynamic ARP Inspection (DAI) relies on which database to validate IP-to-MAC address bindings of ARP packets on untrusted switch ports?",
    options: [
      "DHCP Snooping Binding Database",
      "MAC Address Table (CAM)",
      "ARP Cache",
      "VLAN database"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "Dynamic ARP Inspection (DAI) intercepts all ARP packets on untrusted ports and validates their IP-to-MAC bindings against the DHCP Snooping Binding Database. If a binding is not found, the ARP packet is dropped.",
      wrong: [
        "MAC Address Table (CAM) maps Layer 2 MAC addresses to physical switch ports, but does not track IP-to-MAC bindings.",
        "ARP Cache maps IP addresses to MAC addresses on a Layer 3 device, but is not the security source used by DAI to inspect transit packets.",
        "VLAN database holds VLAN IDs and names, not host IP/MAC bindings."
      ],
      tip: "Before enabling DAI, you must configure DHCP Snooping, or configure static ARP ACLs for hosts with static IP addresses.",
      memory: "DAI requires DHCP Snooping. No snooping = DAI drops all packets.",
      real: "Avoid enabling DAI on ports connected to other switches or routers unless those ports are explicitly configured as 'trusted'.",
      commands: ["ip arp inspection vlan 10", "ip arp inspection trust"]
    }
  },
  {
    id: 143,
    domain: "Security Fundamentals",
    topic: "Port Security",
    type: "single",
    difficulty: "Medium",
    examWeight: "15%",
    frequency: "High",
    text: "Which port security violation mode drops packets with unknown source MAC addresses, increments the security violation counter, and sends an SNMP trap without shutting down the physical interface?",
    options: [
      "Restrict Mode",
      "Protect Mode",
      "Shutdown Mode",
      "Disable Mode"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "Port security has three violation modes: Shutdown, Restrict, and Protect. In Restrict mode, the switch drops violating packets, increments the violation counter, and sends syslog messages/SNMP traps. It does not put the port in errdisable state.",
      wrong: [
        "Protect mode drops violating packets, but does not increment the violation counter or send SNMP/syslog alerts.",
        "Shutdown mode immediately puts the port in errdisable state, disables the port LED, increments the counter, and sends alerts.",
        "Disable Mode is not a valid port security violation mode."
      ],
      tip: "Use Restrict mode if you want alerts but cannot afford network disruption from a port shutdown. Use Shutdown (default) for absolute containment.",
      memory: "Protect = Silent drop. Restrict = Drop + Alert. Shutdown = Drop + Alert + Disable interface.",
      real: "Implement errdisable recovery cause port-security to automatically restore ports shut down by security violations after a specific timeout.",
      commands: ["switchport port-security violation restrict", "errdisable recovery cause port-security"]
    }
  },
  {
    id: 144,
    domain: "Security Fundamentals",
    topic: "Device Hardening",
    type: "single",
    difficulty: "Medium",
    examWeight: "15%",
    frequency: "Medium",
    text: "Which set of prerequisite configuration steps is required on a Cisco router before generating an RSA key pair for SSH access?",
    options: [
      "Configure a hostname and an IP domain name.",
      "Configure line vty passwords and enable secret.",
      "Configure interface IP addresses and enable routing.",
      "Configure local username database and AAA authentication."
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "Cisco IOS requires that a hostname (other than the default 'Router') and an IP domain name ('ip domain-name') be configured before generating the RSA keys used by SSH. The keys are named using the format 'hostname.domainname'.",
      wrong: [
        "VTY passwords and enable secret are good security practices, but they are not cryptographic prerequisites for RSA key generation.",
        "Interface IP configurations are needed to connect, but they do not block key generation.",
        "Local username database is required for SSH login authentication, but you can generate keys before configuring usernames."
      ],
      tip: "If you try to run 'crypto key generate rsa' without a domain name, IOS will display a warning: 'Please define a domain-name first.'",
      memory: "SSH Key prerequisite = Hostname + Domain Name.",
      real: "Ensure RSA key size is at least 1024 or 2048 bits. Keys under 768 bits will block SSH version 2 execution.",
      commands: ["hostname R1", "ip domain-name cisco.local", "crypto key generate rsa modulus 2048"]
    }
  },
  {
    id: 145,
    domain: "Security Fundamentals",
    topic: "SD-Access Security",
    type: "single",
    difficulty: "Hard",
    examWeight: "15%",
    frequency: "Medium",
    text: "In a Cisco Software-Defined Access (SD-Access) architecture, how are security policies enforced between endpoints without depending on IP addresses or VLANs?",
    options: [
      "By assigning Scalable Group Tags (SGT) to endpoints and enforcing Group-Based Policies.",
      "By dynamically injecting Access Control Lists (dACL) on every physical switch port.",
      "By setting up MACsec encryption keys between all access layer switches.",
      "By running dynamic ARP inspection and DHCP snooping on the overlay fabric."
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "Cisco SD-Access uses Scalable Group Tags (SGT) to represent groups of users or endpoints. The SGT is carried in the VXLAN encapsulation header, and Cisco ISE or DNA Center defines policies based on SGT-to-SGT permissions (SGACLs), completely separating policy from IP address or VLAN membership.",
      wrong: [
        "dACLs are used in traditional 802.1X, but are not the primary fabric-wide enforcement method of SD-Access.",
        "MACsec secures physical links (Layer 2 encryption), not endpoint-to-endpoint security policies.",
        "DAI and DHCP Snooping are Layer 2 security tools, not group policy controllers."
      ],
      tip: "SGTs allow policies like 'HR cannot access Finance servers' to persist even if HR users move to different physical branch locations.",
      memory: "SD-Access Security = SGT (Scalable Group Tag) + SGACL.",
      real: "Assign SGTs in Cisco ISE based on active directory group membership for consistent policy application.",
      commands: []
    }
  },
  {
    id: 146,
    domain: "Security Fundamentals",
    topic: "VPN Protocols",
    type: "single",
    difficulty: "Medium",
    examWeight: "15%",
    frequency: "High",
    text: "Which IPsec protocol provides data origin authentication, data integrity, and anti-replay protection, but does NOT provide confidentiality (encryption) for the payload data?",
    options: [
      "Authentication Header (AH)",
      "Encapsulating Security Payload (ESP)",
      "Internet Key Exchange (IKE)",
      "Diffie-Hellman (DH)"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "The Authentication Header (AH) protocol (IP protocol 51) provides data integrity, origin authentication, and optional anti-replay services. However, it does not encrypt the packet payload, meaning data is sent in clear text. Encapsulating Security Payload (ESP) provides both authentication and encryption.",
      wrong: [
        "Encapsulating Security Payload (ESP) provides confidentiality (encryption) in addition to authentication.",
        "Internet Key Exchange (IKE) is the control-plane protocol used to negotiate security associations (SAs) and exchange keys, not data transmission.",
        "Diffie-Hellman (DH) is a mathematical algorithm used for secure key exchange over an untrusted channel, not a tunnel protocol."
      ],
      tip: "AH is rarely used alone today because confidentiality (encryption) is almost always desired. ESP is the standard.",
      memory: "AH = Authentication only. ESP = Encryption + Authentication.",
      real: "When configuring IPsec profiles, select ESP-AES for encryption and ESP-SHA-HMAC for hashing.",
      commands: ["crypto ipsec transform-set MYSET esp-aes esp-sha-hmac"]
    }
  },
  {
    id: 147,
    domain: "Security Fundamentals",
    topic: "Wireless Security",
    type: "single",
    difficulty: "Hard",
    examWeight: "15%",
    frequency: "Medium",
    text: "Which cryptographic handshake protocol is introduced in WPA3 Personal to replace WPA2 Pre-Shared Key (PSK), preventing offline dictionary attacks on wireless passwords?",
    options: [
      "Simultaneous Authentication of Equals (SAE)",
      "Temporal Key Integrity Protocol (TKIP)",
      "Extensible Authentication Protocol (EAP-FAST)",
      "Pre-Shared Key (PSK)"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "WPA3 Personal replaces the 4-way PSK handshake from WPA2 with Simultaneous Authentication of Equals (SAE), also known as the Dragonfly Key Exchange. SAE resists offline dictionary attacks by executing a zero-knowledge proof, ensuring password security even if the user picks a weak password.",
      wrong: [
        "TKIP is an older, deprecated encryption protocol used with WPA to replace WEP.",
        "EAP-FAST is an enterprise authentication protocol using tunnels, not personal PSK replacement.",
        "PSK (Pre-Shared Key) is the legacy mechanism used in WPA/WPA2 that is vulnerable to offline dictionary attack."
      ],
      tip: "SAE makes wireless sniffing useless for password cracking since each exchange uses a unique session key.",
      memory: "WPA3 Personal = SAE (Simultaneous Authentication of Equals) or Dragonfly.",
      real: "When designing wireless solutions, configure WPA3 Enterprise (using 802.1X) or WPA3 Personal (with SAE) on new SSIDs.",
      commands: []
    }
  },
  {
    id: 148,
    domain: "Automation and Programmability",
    topic: "REST APIs",
    type: "single",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "High",
    text: "Which HTTP request method is used in a RESTful API to update an existing resource or create it if it does not exist, replacing the entire resource with the payload data?",
    options: [
      "PUT",
      "POST",
      "PATCH",
      "GET"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "In RESTful APIs, PUT is used to update an existing resource or create it by overwriting the target resource completely. POST is typically used to create a new resource, while PATCH is used to make partial modifications to an existing resource.",
      wrong: [
        "POST is used to create a new resource at a collection URL.",
        "PATCH is used to apply partial modifications to a resource, rather than replacing it entirely.",
        "GET is a read-only method used to retrieve a representation of a resource."
      ],
      tip: "PUT is idempotent (calling it multiple times with the same payload results in the same state). POST is not idempotent.",
      memory: "PUT = Replace entirely (Idempotent). PATCH = Partial change. POST = Create new.",
      real: "When developing scripts to update configuration on Cisco DNA Center APIs, use PUT to update complete structures.",
      commands: []
    }
  },
  {
    id: 149,
    domain: "Automation and Programmability",
    topic: "Automation Protocols",
    type: "single",
    difficulty: "Hard",
    examWeight: "10%",
    frequency: "High",
    text: "Which protocol operates over SSH on port 830, uses XML-formatted data payloads, and supports transaction-based configuration commits?",
    options: [
      "NETCONF",
      "RESTCONF",
      "gRPC",
      "SNMP"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "NETCONF (RFC 6241) is a network management protocol that runs over SSH on port 830, uses XML for data encoding, and supports operations like <get>, <edit-config>, and transaction commits/rollbacks. RESTCONF runs over HTTP/HTTPS (port 443) and supports JSON/XML.",
      wrong: [
        "RESTCONF runs over HTTPS (port 443) and uses REST-like operations (GET, POST, etc.) rather than SSH.",
        "gRPC is a general RPC framework running over HTTP/2, using Protocol Buffers, not XML over SSH.",
        "SNMP runs over UDP (port 161) and uses Management Information Bases (MIBs) with ASN.1 encoding."
      ],
      tip: "NETCONF has a candidate configuration datastore, allowing you to edit configurations and commit them as a single atomic transaction.",
      memory: "NETCONF = SSH 830, XML. RESTCONF = HTTPS 443, JSON/XML.",
      real: "Enable NETCONF on Cisco devices using 'netconf-yang' to allow automated configuration management via Python ncclient.",
      commands: ["netconf-yang", "show netconf-yang status"]
    }
  },
  {
    id: 150,
    domain: "Automation and Programmability",
    topic: "DevOps Tools",
    type: "single",
    difficulty: "Medium",
    examWeight: "10%",
    frequency: "High",
    text: "Which configuration management tool is agentless, uses SSH for communication, encodes configuration scripts in YAML (Playbooks), and uses a push model to configure managed nodes?",
    options: [
      "Ansible",
      "Puppet",
      "Chef",
      "SaltStack"
    ],
    correct: [0],
    expl: {
      correct: "A",
      why: "Ansible is agentless (no software needs to be installed on managed devices), communicates over SSH (or netconf/restconf), uses YAML to write its automation blueprints (Playbooks), and operates on a push model where the control node pushes changes to managed hosts.",
      wrong: [
        "Puppet uses agent software on managed nodes (usually), ruby-based manifests, and a pull model.",
        "Chef uses agent software, ruby-based recipes, and a pull model.",
        "SaltStack is typically agent-based (minions) and written in python, although it has a push option, it is not the classic YAML/SSH agentless standard described."
      ],
      tip: "Ansible's agentless architecture makes it perfect for Cisco routers and switches because you cannot install third-party agents on most network operating systems.",
      memory: "Ansible = Agentless, SSH, YAML Playbooks, Push model.",
      real: "Deploy Ansible on a Linux VM to automate VLAN provisioning across hundreds of campus switches simultaneously.",
      commands: []
    }
  }
];

export function generateBank(seedRandom) {
  const bank = [...questionBank];
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(seedRandom() * (i + 1));
    const t = bank[i];
    bank[i] = bank[j];
    bank[j] = t;
  }
  return bank;
}
