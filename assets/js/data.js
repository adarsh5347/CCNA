export const blueprint = [
  {
    "name": "Network Fundamentals",
    "weight": 20,
    "topics": [
      "OSI",
      "TCP/IP",
      "IPv4",
      "IPv6",
      "Subnetting",
      "Ethernet",
      "ARP",
      "ICMP",
      "DNS",
      "DHCP"
    ],
    "count": 40
  },
  {
    "name": "Network Access",
    "weight": 20,
    "topics": [
      "VLANs",
      "Trunks",
      "STP",
      "EtherChannel",
      "Wireless"
    ],
    "count": 40
  },
  {
    "name": "IP Connectivity",
    "weight": 25,
    "topics": [
      "Routing",
      "OSPF",
      "Static Routes",
      "Route Selection"
    ],
    "count": 50
  },
  {
    "name": "IP Services",
    "weight": 10,
    "topics": [
      "DHCP",
      "NAT",
      "NTP",
      "Syslog",
      "SNMP"
    ],
    "count": 20
  },
  {
    "name": "Security Fundamentals",
    "weight": 15,
    "topics": [
      "ACLs",
      "SSH",
      "Port Security",
      "DHCP Snooping",
      "Wireless Security"
    ],
    "count": 30
  },
  {
    "name": "Automation and Programmability",
    "weight": 10,
    "topics": [
      "JSON",
      "REST APIs",
      "SDN",
      "DNA Center",
      "Ansible",
      "YANG",
      "NETCONF"
    ],
    "count": 20
  }
];

const questionBank = [
  {
    "id": 1,
    "domain": "Network Fundamentals",
    "topic": "OSI Model",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network administrator is analyzing frame propagation between two workstations on a corporate LAN. Workstation A transmits a unicast frame destined for Workstation B's MAC address. If the switch's MAC address table contains an active entry for Workstation B, at which OSI layer does the switch read the destination address, and what action does it take?",
    "options": [
      "Layer 2 (Data Link); it looks up the destination MAC address in the CAM table and forwards the frame out the corresponding port",
      "Layer 1 (Physical); it electrically regenerates the bits out of all active switch interfaces",
      "Layer 2 (Data Link); it floods the frame out of all active ports within the ingress VLAN",
      "Layer 3 (Network); it performs an IP routing table lookup to determine the outgoing interface"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Standard Layer 2 switches operate at the Data Link layer. They inspect the destination MAC address in the Ethernet header, look up the address in the Content Addressable Memory (CAM) table, and forward the frame out the specific matching interface. Reference: CCNA Volume 1, Chapter 5: Analyzing Ethernet LAN Switching.",
      "wrong": [
        "Layer 1 deals with physical signaling and media (like hubs); it does not read MAC addresses or make selective forwarding decisions.",
        "Layer 3 switches or routers forward packets based on IP addresses, not MAC addresses.",
        "Flooding only occurs if the destination MAC is a broadcast, multicast, or an unknown unicast address (not present in the CAM table)."
      ],
      "tip": "If a MAC address is known, the switch performs filter/forward. If it is unknown, it floods the frame.",
      "memory": "CAM Table = Layer 2 = Unicast Forwarding.",
      "real": "When a PC sends an IP packet to a local printer, the local switch inspects the Layer 2 header and forwards the frame directly to the printer's port without involving the router.",
      "commands": [
        "show mac address-table"
      ]
    }
  },
  {
    "id": 2,
    "domain": "Network Fundamentals",
    "topic": "TCP/IP Model",
    "type": "dragdrop",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Place the decapsulation steps of an incoming packet in the correct order, from receipt on physical media to application consumption.",
    "order": [
      "Physical layer receives bits and converts them into an electrical/optical signal.",
      "Data Link layer verifies the FCS trailer and strips the Ethernet header.",
      "Network layer verifies the IP header destination and routes/strips it.",
      "Transport layer reassembles segments and delivers payload to application port."
    ],
    "expl": {
      "correct": "Correct Order",
      "why": "Decapsulation moves from the bottom to the top of the protocol stack. The signal is received (L1), frame is verified and stripped (L2), packet is processed and stripped (L3), and the segment payload is delivered to the port (L4). Reference: RFC 1122.",
      "wrong": [
        "Removing Layer 3 headers before Layer 2 is impossible because Layer 3 is encapsulated inside Layer 2.",
        "Delivering to the application before stripping the transport layer header breaks the OSI structure.",
        "Verifying the FCS trailer must happen first at the Data Link layer before any upper-layer headers are read."
      ],
      "tip": "Encapsulation goes Top-Down (Data -> Segment -> Packet -> Frame -> Bits). Decapsulation goes Bottom-Up.",
      "memory": "PDNTA: Please Do Not Take Away (Physical, Data Link, Network, Transport, Application).",
      "real": "When a web browser receives data from a web server, the NIC first decapsulates the Layer 2 Ethernet frame before sending the Layer 3 IP packet up the OS stack.",
      "commands": [
        "show interfaces"
      ]
    }
  },
  {
    "id": 3,
    "domain": "Network Fundamentals",
    "topic": "Ethernet",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. A network topology consists of a single 24-port switch. Ports 1 through 10 are assigned to VLAN 10, ports 11 through 20 are assigned to VLAN 20, and ports 21 through 24 are unassigned in VLAN 1. How many broadcast domains exist on this switch?",
    "options": [
      "3 broadcast domains",
      "2 broadcast domains",
      "1 broadcast domain",
      "24 broadcast domains"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "A VLAN represents a distinct Layer 2 broadcast domain. Since there are three active VLANs (VLAN 10, VLAN 20, and the default VLAN 1 containing the unassigned ports), there are exactly 3 broadcast domains. Reference: Cisco VLAN design guides.",
      "wrong": [
        "VLANs segment broadcast domains; they do not merge them into a single domain.",
        "There are three VLANs configured, not two (VLAN 1 still exists for the remaining ports).",
        "A switch has as many collision domains as there are active ports, but broadcast domains are defined by VLANs."
      ],
      "tip": "One VLAN equals one subnet, which equals one broadcast domain.",
      "memory": "VLAN = Broadcast Domain.",
      "real": "Dividing a large network into VLAN 10 (Sales) and VLAN 20 (Finance) keeps broadcast traffic from one department from degrading the performance of the other.",
      "commands": [
        "show vlan brief"
      ]
    }
  },
  {
    "id": 4,
    "domain": "Network Fundamentals",
    "topic": "Ethernet",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which type of fiber-optic cabling is optimized for long-distance, high-bandwidth WAN applications by utilizing a very narrow core and a single ray of laser light?",
    "options": [
      "Single-mode Fiber (SMF)",
      "Multimode Fiber (MMF)",
      "Unshielded Twisted Pair (UTP)",
      "Shielded Twisted Pair (STP)"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Single-mode fiber (SMF) has a small core (typically 9 microns) and utilizes laser light to transmit data over tens of kilometers without significant dispersion. Reference: IEEE 802.3ae.",
      "wrong": [
        "Multimode fiber (MMF) has a larger core and uses LEDs, which experience modal dispersion over long distances.",
        "UTP is copper-based cabling limited to 100 meters, not optical fiber.",
        "STP is shielded copper cabling, not optical fiber."
      ],
      "tip": "Single-mode = Laser = Long distances. Multimode = LED = Short campus runs.",
      "memory": "S in SMF stands for Single/Straight laser ray over long distances.",
      "real": "Service providers run Single-mode fiber between metropolitan aggregation points, whereas they use Multimode fiber within a single datacenter rack layout.",
      "commands": [
        "show interfaces transceiver"
      ]
    }
  },
  {
    "id": 5,
    "domain": "Network Fundamentals",
    "topic": "Ethernet",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. Which two wire pairs are swapped between the T568A and T568B wiring standards for terminating RJ-45 Ethernet cables?",
    "options": [
      "Brown pair (Pins 7 and 8)",
      "Blue pair (Pins 4 and 5)",
      "Green pair (Pins 1 and 2)",
      "Orange pair (Pins 3 and 6)"
    ],
    "correct": [
      2,
      3
    ],
    "expl": {
      "correct": "C, D",
      "why": "The primary difference between T568A and T568B is that the green pair (pins 1 & 2) and the orange pair (pins 3 & 6) are swapped. Pins 4 & 5 (blue) and 7 & 8 (brown) remain in the same positions. Reference: TIA/EIA-568.",
      "wrong": [
        "The blue pair is centered on pins 4 and 5 in both T568A and T568B.",
        "The brown pair is always terminated on pins 7 and 8 in both standards.",
        "Only the orange and green pairs are swapped to configure straight-through vs crossover cables."
      ],
      "tip": "Crossover cables originally swapped T568A on one end with T568B on the other.",
      "memory": "GO (Green/Orange) is swapped. Blue and Brown stay home.",
      "real": "Modern Cisco switches utilize Auto-MDIX to automatically resolve cabling mismatches, but structured cabling installations still strictly enforce either T568A or T568B.",
      "commands": [
        "show controllers ethernet-controller"
      ]
    }
  },
  {
    "id": 6,
    "domain": "Network Fundamentals",
    "topic": "Ethernet",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. What does a Layer 2 switch do when it receives an Ethernet frame with a destination MAC address that is not present in its MAC address table?",
    "options": [
      "It drops the frame immediately.",
      "It sends an ARP request to learn the destination port.",
      "It queries the DNS server for destination resolution.",
      "It floods the frame out of all ports except the receiving port."
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "When a destination MAC is unknown (an unknown unicast), the switch floods the frame out of all ports within the ingress VLAN, except the port on which the frame was received. Reference: IEEE 802.1D.",
      "wrong": [
        "Switches do not drop unknown unicast frames; they flood them to ensure delivery.",
        "Switches do not generate ARP requests; ARP is an end-host Layer 3 protocol.",
        "DNS resolves domain names to IP addresses and has no role in Layer 2 frame forwarding."
      ],
      "tip": "Switches flood: 1) Broadcasts, 2) Multicasts, 3) Unknown Unicasts.",
      "memory": "UUMB: Unknown Unicasts, Multicasts, Broadcasts are flooded.",
      "real": "If a host has been silent and its MAC address has aged out of the switch's table, the switch will flood the next frame destined for it to locate its port.",
      "commands": [
        "show mac address-table count"
      ]
    }
  },
  {
    "id": 7,
    "domain": "Network Fundamentals",
    "topic": "ARP",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which destination MAC address is utilized in the Ethernet header of an ARP Request packet?",
    "options": [
      "FFFF.FFFF.FFFF",
      "0000.0000.0000",
      "The unicast MAC address of the target gateway",
      "0100.5E00.0001"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "An ARP Request needs to reach all hosts on the local network segment to find the owner of the target IP address. Therefore, it is encapsulated in a Layer 2 broadcast frame with destination MAC FFFF.FFFF.FFFF. Reference: RFC 826.",
      "wrong": [
        "0000.0000.0000 is an invalid address, not a broadcast MAC.",
        "0100.5E00.0001 is an IPv4 multicast MAC address range.",
        "The sender does not yet know the destination host's MAC address, which is the exact reason it is sending the ARP Request."
      ],
      "tip": "ARP Requests are Broadcast (L2). ARP Replies are Unicast (L2).",
      "memory": "Request = Everyone (Broadcast, FFFF). Reply = Only Me (Unicast).",
      "real": "When you ping a local device for the first time, your system issues a broadcast ARP request asking 'Who has this IP? Tell me.'",
      "commands": [
        "show arp",
        "clear arp-cache"
      ]
    }
  },
  {
    "id": 8,
    "domain": "Network Fundamentals",
    "topic": "IPv4",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "An engineer is configuring a new NAT pool and DHCP scopes for a private network segment. According to RFC 1918, which of the following IP addresses represents a valid host address that is reserved for private inside routing networks?",
    "options": [
      "10.256.1.1",
      "192.169.1.50",
      "172.31.254.1",
      "172.32.1.5"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "RFC 1918 defines three private address spaces: 10.0.0.0/8, 172.16.0.0/12 (which spans 172.16.0.0 to 172.31.255.255), and 192.168.0.0/16. 172.31.254.1 falls inside the 172.16.0.0/12 block. Reference: CCNA Volume 1, Chapter 11: Perspectives on IPv4 Subnetting.",
      "wrong": [
        "172.32.1.5 is outside the private 172.16.0.0/12 block and is a public IPv4 address.",
        "192.169.1.50 is outside the private 192.168.0.0/16 block and is a public IPv4 address.",
        "10.256.1.1 is invalid because the second octet value (256) exceeds the maximum limit of 255."
      ],
      "tip": "Private Class B block is 172.16.0.0 to 172.31.255.255.",
      "memory": "Class B private range has 16 blocks: 172.16 to 172.31.",
      "real": "To prevent direct internet exposure, corporate subnets are assigned 10.0.0.0/8 IPs, requiring NAT on the boundary firewall to access WAN resources.",
      "commands": []
    }
  },
  {
    "id": 9,
    "domain": "Network Fundamentals",
    "topic": "IPv6",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network systems engineer is configuring a global unicast address on a Cisco router interface. The design document specifies the IPv6 address as '2001:0db8:0000:0000:0008:0000:0000:4125'. Which of the following represents the most compressed and mathematically correct format of this IPv6 address according to RFC 5952?",
    "options": [
      "2001:db8::8:0:0:4125",
      "2001:db8:0:0:8::4125",
      "2001:db8::8::4125",
      "2001:0db8::8:0000:0000:4125"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "According to RFC 5952, IPv6 compression follows two primary rules: 1) Omit leading zeros within each hextet (e.g. 0db8 -> db8, 0008 -> 8). 2) Use double colons (::) to represent the longest consecutive block of all-zero hextets. In this address, the first consecutive zeros block is 2 hextets wide (positions 3 and 4), and the second is also 2 hextets wide (positions 6 and 7). When there is a tie, the double colon MUST be used to compress the first (leftmost) block of zeros. Thus, 2001:db8::8:0:0:4125 is the correct format. Reference: CCNA Volume 1, Chapter 12: IPv6 Addressing.",
      "wrong": [
        "Compressing the second block of zeros (2001:db8:0:0:8::4125) violates RFC 5952 because the leftmost block must be compressed in the event of a tie.",
        "Using double colons twice (2001:db8::8::4125) is mathematically invalid because it creates ambiguity regarding the original number of zero hextets, making it impossible to reconstruct the 128-bit address.",
        "Leaving leading zeros in '0db8' and uncompressed zeros fails to yield the most compressed format."
      ],
      "tip": "Rule 1: Drop leading zeros. Rule 2: Compress the longest consecutive run of zeros with '::'. Rule 3: If runs are equal length, compress the first run. '::' can only be used once.",
      "memory": ":: rules: Leftmost first, only once.",
      "real": "When configuring interfaces in Cisco IOS, you can enter the fully compressed IPv6 address to prevent typing mistakes and improve readability in output displays.",
      "commands": [
        "ipv6 address 2001:db8::8:0:0:4125/64",
        "show ipv6 interface brief"
      ]
    }
  },
  {
    "id": 10,
    "domain": "Network Fundamentals",
    "topic": "IPv6",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which two statements correctly describe the characteristics of IPv6 Link-Local addresses?",
    "options": [
      "They are automatically generated using the prefix FE80::/10.",
      "They require a DHCPv6 server to be assigned.",
      "They are globally routable across the internet.",
      "They are not forwarded past the local link by routers."
    ],
    "correct": [
      0,
      3
    ],
    "expl": {
      "correct": "A, D",
      "why": "IPv6 Link-Local addresses use the prefix FE80::/10 (typically FE80::/64) and are intended for communication within a single local link segment. Routers never forward link-local packets to other networks. Reference: RFC 4291.",
      "wrong": [
        "Link-local addresses are not globally routable; they are link-specific.",
        "They are generated automatically by hosts using SLAAC or static configuration, without needing a DHCPv6 server.",
        "IPv6 link-local addresses do not require manual subinterface configuration."
      ],
      "tip": "IPv6 Link-Local = FE80::/10. Unique Local = FC00::/7. Global Unicast = 2000::/3.",
      "memory": "FE80 is local to the interface, just like an internal link.",
      "real": "OSPFv3 uses IPv6 link-local addresses as the next-hop IP when exchanging routing updates, keeping routing control traffic local to the physical link.",
      "commands": [
        "show ipv6 route link-local"
      ]
    }
  },
  {
    "id": 11,
    "domain": "Network Fundamentals",
    "topic": "Subnetting",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "High",
    "text": "An administrator needs to identify the broadcast address for the subnet containing host 192.168.10.45/27. Which of the following is the correct broadcast address?",
    "options": [
      "192.168.10.31",
      "192.168.10.255",
      "192.168.10.63",
      "192.168.10.47"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "A /27 subnet mask has block increments of 32 (256 - 224 = 32). The subnets are 192.168.10.0, 192.168.10.32, 192.168.10.64, etc. Host 192.168.10.45 falls into the 192.168.10.32 subnet. The broadcast address is one less than the next subnet address: 64 - 1 = 63. Reference: RFC 4632.",
      "wrong": [
        "192.168.10.31 is the broadcast address of the previous subnet (192.168.10.0/27).",
        "192.168.10.47 is within the subnet but is a usable host address, not the broadcast address.",
        "192.168.10.255 would be correct only if the subnet mask was /24."
      ],
      "tip": "Find the block size (256 - mask octet), find the subnet start by finding the nearest multiple of the block size below the IP, and add (block size - 1) to get the broadcast.",
      "memory": "Block size for /27 is 32. Multiples: 0, 32, 64. Broadcast is 64 - 1 = 63.",
      "real": "Setting the correct broadcast address is essential; mismatched masks will cause communication failures on the local broadcast domain.",
      "commands": [
        "show ip interface"
      ]
    }
  },
  {
    "id": 12,
    "domain": "Network Fundamentals",
    "topic": "Subnetting",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network administrator needs to assign a subnet to a new workstation segment that requires at least 11 usable IP addresses. If the segment is allocated a block using a /28 subnet mask, how many host addresses are available, and what is the subnet mask?",
    "options": [
      "14 usable host addresses with a mask of 255.255.255.240",
      "30 usable host addresses with a mask of 255.255.255.224",
      "14 usable host addresses with a mask of 255.255.255.248",
      "16 usable host addresses with a mask of 255.255.255.240"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "A /28 prefix length leaves 4 host bits (32 - 28 = 4). The total number of addresses is 2^4 = 16. Subtracting 2 for the network address and broadcast address yields 14 usable host addresses. The subnet mask is 255.255.255.240. Reference: CCNA Volume 1, Chapter 13: Analyzing Subnet Masks.",
      "wrong": [
        "16 total addresses exist, but only 14 are usable because host bits all-zeros (network) and all-ones (broadcast) cannot be assigned to hosts.",
        "A mask of 255.255.255.248 corresponds to a /29 subnet, which only supports 6 usable host addresses.",
        "30 usable addresses with a mask of 255.255.255.224 corresponds to a /27 subnet."
      ],
      "tip": "Usable hosts = 2^H - 2. For /28, H=4, so 16 - 2 = 14.",
      "memory": "/28 = 16 addresses. 16 - 2 = 14 hosts.",
      "real": "When subnetting a WAN link, administrators allocate a /30 subnet (2 usable hosts) or a /31 subnet (point-to-point RFC 3021) to conserve address space.",
      "commands": []
    }
  },
  {
    "id": 13,
    "domain": "Network Fundamentals",
    "topic": "Subnetting",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Host A is assigned the IP address 10.1.1.99/29 and Host B is assigned 10.1.1.105/29. They are connected to the same switch, but they cannot ping each other. What is the reason for this issue?",
    "options": [
      "The IP addresses are in different subnets, preventing direct local Layer 2 communication.",
      "They are on the same subnet but require a default gateway to communicate.",
      "Host B is assigned the network ID of the subnet.",
      "A /29 subnet mask only supports a maximum of 2 usable hosts, creating an address conflict."
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "A /29 subnet mask has a block size of 8. The subnets are 10.1.1.88, 10.1.1.96 (range .97-.102), and 10.1.1.104 (range .105-.110). Host A (.99) is in the .96 subnet, and Host B (.105) is in the .104 subnet. Since they are in different subnets, they cannot communicate directly without a router. Reference: RFC 4632.",
      "wrong": [
        "Hosts in the same subnet do not need a gateway to communicate directly over a switch.",
        "A /29 supports 6 usable hosts (2^3 - 2), not 2.",
        "Host B (.105) is a valid usable host address in the 10.1.1.104/29 subnet (network ID is .104)."
      ],
      "tip": "Always check if source and destination belong to the same subnet boundary when troubleshooting local connectivity.",
      "memory": "Block size 8: .96 subnet ends at .103. .105 is in the next block.",
      "real": "When configuring static IPs on network equipment, check the subnet boundaries. An incorrect mask will force local traffic to the gateway, causing dropouts.",
      "commands": [
        "show ip route"
      ]
    }
  },
  {
    "id": 14,
    "domain": "Network Fundamentals",
    "topic": "ICMP",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. Which ICMPv6 message type is sent by an IPv6 host to request the link-layer MAC address of a target neighbor node?",
    "options": [
      "Router Solicitation (RS)",
      "Neighbor Solicitation (NS)",
      "Router Advertisement (RA)",
      "Neighbor Advertisement (NA)"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "In IPv6, Neighbor Discovery Protocol (NDP) replaces ARP. A host sends a Neighbor Solicitation (NS) message to resolve a target IP address to a MAC address. The target responds with a Neighbor Advertisement (NA). Reference: RFC 4861.",
      "wrong": [
        "Router Solicitation is sent by a host to locate local routers, not to resolve MAC addresses.",
        "Router Advertisement is sent by routers to advertise prefix and configuration options.",
        "Neighbor Advertisement is the response to an NS, not the initial request."
      ],
      "tip": "NS is the IPv6 equivalent of an ARP Request; NA is the equivalent of an ARP Reply.",
      "memory": "Solicitation = Asking/Requesting. Advertisement = Declaring/Replying.",
      "real": "When you try to ping an IPv6 link-local address, your OS issues a Neighbor Solicitation multicast to locate the destination MAC address.",
      "commands": [
        "show ipv6 neighbors"
      ]
    }
  },
  {
    "id": 15,
    "domain": "Network Fundamentals",
    "topic": "OSI Model",
    "type": "matching",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Match the network protocol characteristics to the correct transport protocol (TCP or UDP).",
    "pairs": [
      [
        "Uses windowing and flow control",
        "TCP"
      ],
      [
        "Provides low overhead connectionless delivery",
        "UDP"
      ],
      [
        "Requires a three-way handshake",
        "TCP"
      ],
      [
        "Used by real-time voice and video (VoIP)",
        "UDP"
      ]
    ],
    "expl": {
      "correct": "Matching",
      "why": "TCP provides connection-oriented, reliable delivery using windowing, flow control, and a three-way handshake. UDP provides low-overhead, connectionless delivery, which is ideal for real-time traffic like VoIP. Reference: RFC 793 and RFC 768.",
      "wrong": [
        "UDP does not support windowing; it has no mechanism to adjust transmission speed based on receiver capability.",
        "TCP is not connectionless; it must establish a session before transmitting payload data.",
        "Handshakes are not used by UDP, which simply fires packets without verifying target state."
      ],
      "tip": "TCP is chosen for reliability (HTTP, SSH); UDP is chosen for speed and low overhead (DNS, VoIP).",
      "memory": "Handshake & Window = TCP. Fire & Forget = UDP.",
      "real": "Web traffic (HTTPS) uses TCP to guarantee that files arrive intact, while voice streaming uses UDP to prevent delay from retransmissions.",
      "commands": [
        "show tcp brief"
      ]
    }
  },
  {
    "id": 16,
    "domain": "Network Fundamentals",
    "topic": "DNS",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which DNS resource record type is responsible for mapping a hostname to an IPv6 address?",
    "options": [
      "MX",
      "A",
      "CNAME",
      "AAAA"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "The AAAA (quad-A) record maps a domain name to a 128-bit IPv6 address, whereas the A record maps to a 32-bit IPv4 address. Reference: RFC 3596.",
      "wrong": [
        "The A record maps hostnames to IPv4 addresses.",
        "The CNAME record creates an alias pointing to another hostname.",
        "The MX record directs mail delivery servers to the domain's mail exchanger."
      ],
      "tip": "AAAA is 'Quad-A' because an IPv6 address is four times larger than an IPv4 address.",
      "memory": "A = IPv4. AAAA = IPv6 (4 times as many A's).",
      "real": "When navigating to ipv6.google.com, your computer queries DNS for a AAAA record to establish an IPv6 session.",
      "commands": [
        "nslookup"
      ]
    }
  },
  {
    "id": 17,
    "domain": "Network Fundamentals",
    "topic": "DHCP",
    "type": "dragdrop",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Order the steps in the DHCPv4 DORA exchange process as they occur between a client and a server.",
    "order": [
      "Discover: The client broadcasts a message to locate available DHCP servers.",
      "Offer: The server unicasts/broadcasts an IP address proposal to the client.",
      "Request: The client broadcasts a request to lease the proposed IP address.",
      "Acknowledge: The server confirms the lease and provides final parameters."
    ],
    "expl": {
      "correct": "Correct Order",
      "why": "The DHCPv4 process follows the DORA sequence: Discover (broadcast by client), Offer (proposal by server), Request (selection by client), and Acknowledge (confirmation by server). Reference: RFC 2131.",
      "wrong": [
        "The client cannot request an address before the server offers one.",
        "The server cannot acknowledge a lease before the client requests it.",
        "Discover must be the first step, as a client has no network settings initially."
      ],
      "tip": "Remember the acronym DORA: Discover, Offer, Request, Acknowledge.",
      "memory": "D-O-R-A: Client -> Server -> Client -> Server.",
      "real": "When you boot your laptop on the office network, it sends a DHCP Discover broadcast to configure its IP configuration automatically.",
      "commands": [
        "show ip dhcp binding"
      ]
    }
  },
  {
    "id": 18,
    "domain": "Network Fundamentals",
    "topic": "Ethernet",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. What is the primary function of the Frame Check Sequence (FCS) field located in the Ethernet frame trailer?",
    "options": [
      "To specify frame forwarding priority",
      "To verify Layer 3 packet encapsulation integrity",
      "To request retransmission of corrupt frames",
      "To perform error detection using a Cyclic Redundancy Check (CRC)"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "The FCS trailer contains a 32-bit CRC value. The receiving switch recalculates this value; if it matches the FCS header, the frame is processed. Otherwise, it is dropped as corrupt. Reference: IEEE 802.3.",
      "wrong": [
        "Layer 2 switches do not request retransmission; that is handled by upper layers like TCP.",
        "FCS only validates the Layer 2 Ethernet frame, not upper-layer IP payloads.",
        "Frame priority is handled by 802.1Q PCP bits, not the FCS field."
      ],
      "tip": "Layer 2 only performs error detection (via FCS). It does not perform error recovery.",
      "memory": "FCS = Find Corrupt Signals.",
      "real": "When checking switch interface statistics, incrementing CRC errors indicate physical cabling or interface issues detected by the FCS check.",
      "commands": [
        "show interfaces gigabitethernet 0/1"
      ]
    }
  },
  {
    "id": 19,
    "domain": "Network Fundamentals",
    "topic": "Ethernet",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. What is the standard Maximum Transmission Unit (MTU) size for a default Ethernet frame payload?",
    "options": [
      "1500 bytes",
      "9000 bytes",
      "512 bytes",
      "64 bytes"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "The default Ethernet MTU is 1500 bytes, which represents the maximum size of the Layer 3 packet payload encapsulated in the Layer 2 frame. Reference: IEEE 802.3.",
      "wrong": [
        "64 bytes is the minimum Ethernet frame size, not the maximum payload.",
        "512 bytes is a common sector size, but not the standard MTU.",
        "9000 bytes is a jumbo frame size, which must be configured manually."
      ],
      "tip": "Default Ethernet MTU = 1500 bytes. If traffic exceeds this, routers must fragment it unless DF is set.",
      "memory": "1500 is the standard MTU limit for regular internet frames.",
      "real": "Configuring VPN tunnels adds overhead, which requires reducing the IP MTU below 1500 to prevent fragmentation overhead.",
      "commands": [
        "ip mtu 1400"
      ]
    }
  },
  {
    "id": 20,
    "domain": "Network Fundamentals",
    "topic": "IPv6",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. How does a host construct its 64-bit interface identifier from a 48-bit MAC address using the modified EUI-64 process?",
    "options": [
      "By appending FFFE to the end of the MAC address",
      "By prepending FE80:: to the MAC address",
      "By inserting the hexadecimal value FFFE in the middle and flipping the 7th bit of the MAC address",
      "By applying a SHA-256 hash to the MAC address"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "The EUI-64 standard inserts FFFE in the middle of the MAC address (between the OUI and NIC extension) and flips the 7th bit (the Universal/Local bit) to form the 64-bit host portion of the IPv6 address. Reference: RFC 4291.",
      "wrong": [
        "FE80:: is the prefix for Link-Local addresses, not the host interface ID.",
        "Appending FFFE to the end does not match EUI-64 rules.",
        "No hashing algorithm is used for standard EUI-64 address generation."
      ],
      "tip": "EUI-64 steps: 1) Split MAC in half. 2) Insert FFFE. 3) Flip the 7th bit (2nd hex character).",
      "memory": "FFFE in the middle, flip bit seven.",
      "real": "A NIC with MAC 00-11-22-33-44-55 generates a host ID of 0211:22FF:FE33:4455 under the EUI-64 process.",
      "commands": [
        "ipv6 address autoconfig"
      ]
    }
  },
  {
    "id": 21,
    "domain": "Network Fundamentals",
    "topic": "Subnetting",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. A subnet needs to accommodate exactly 60 host devices. Which subnet mask is the most efficient choice to meet this requirement without wasting IP addresses?",
    "options": [
      "255.255.255.224 (/27)",
      "255.255.255.240 (/28)",
      "255.255.255.192 (/26)",
      "255.255.255.128 (/25)"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "A /26 mask (255.255.255.192) offers 6 host bits, yielding 2^6 - 2 = 62 usable host addresses. This efficiently accommodates 60 hosts. Reference: RFC 4632.",
      "wrong": [
        "A /25 mask supports 126 usable hosts, which is less efficient and wastes IP addresses.",
        "A /27 mask only supports 30 usable hosts, which is insufficient.",
        "A /28 mask only supports 14 usable hosts, which is insufficient."
      ],
      "tip": "Calculate the required host bits (h) where 2^h - 2 >= required hosts. For 60 hosts, h=6 (62 hosts). Mask prefix is 32 - 6 = /26.",
      "memory": "/26 = 64 addresses = 62 hosts.",
      "real": "When designing subnet layouts for corporate VLANs, choose a prefix size that allows for 20% host growth while keeping address wastage to a minimum.",
      "commands": [
        "show ip interface brief"
      ]
    }
  },
  {
    "id": 22,
    "domain": "Network Fundamentals",
    "topic": "Network Fundamentals",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an OSPFv2 neighbor adjacency issue between two routers. The command output on Router R1 shows the neighbor relationship is stuck in the EXSTART state. Based on the output below and Cisco best practices, what is the most likely cause of this issue?",
    "options": [
      "The OSPF hello and dead interval timers do not match between R1 and R2.",
      "The MTU on R2's connecting interface is configured with a different value (e.g., 1492 bytes) than R1's interface.",
      "The routers are configured with conflicting OSPF process IDs.",
      "The interface on R2 is configured with a different OSPF Area ID than R1."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "When OSPF neighbor adjacency is stuck in the EXSTART/EXCHANGE state, it indicates that the routers are attempting to exchange Database Description (DBD) packets, but one router is dropping the incoming DBD packets because the MTU sizes do not match. OSPF requires MTU matching by default to prevent large DBD packets from fragmenting. Reference: CCNA Volume 2, Chapter 4: OSPFv2 Troubleshooting.",
      "wrong": [
        "Mismatched hello/dead intervals will prevent the routers from even reaching the INIT or 2-WAY states (they will never form an adjacency).",
        "OSPF process IDs are locally significant and do not need to match for routers to establish adjacency.",
        "Mismatched OSPF Area IDs will cause OSPF to reject the hello packets, preventing the neighbor relationship from entering the INIT state."
      ],
      "tip": "EXSTART/EXCHANGE stuck = MTU mismatch. Use the command 'ip ospf mtu-ignore' under the interface if you must bypass this check (though fixing the MTU is the best practice).",
      "memory": "EXSTART = EXchanging DBDs = MTU check.",
      "real": "During a branch site deployment, a WAN link configured with PPPoE (MTU 1492) was connected to a LAN interface (MTU 1500). OSPF neighbors failed to establish past EXSTART until the MTU was adjusted to 1492 on the LAN switch interface.",
      "commands": [
        "show ip ospf neighbor",
        "show ip ospf interface",
        "ip ospf mtu-ignore"
      ]
    },
    "cli": "R1# show ip ospf neighbor\n\nNeighbor ID     Pri   State           Dead Time   Address         Interface\n2.2.2.2           1   EXSTART/  -     00:00:34    192.168.12.2    GigabitEthernet0/1\n\nR1# show interfaces gigabitEthernet 0/1\nGigabitEthernet0/1 is up, line protocol is up \n  Internet address is 192.168.12.1/24\n  MTU 1500 bytes, BW 1000000 Kbit/sec"
  },
  {
    "id": 23,
    "domain": "Network Fundamentals",
    "topic": "Ethernet",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A systems administrator is reviewing the Spanning Tree Protocol (STP) topology of a campus network. Based on the MAC addresses and configured bridge priorities of the three switches in the topology diagram, which switch will be elected as the Root Bridge, and what is its Bridge ID?",
    "options": [
      "Switch-A, because it has the alphabetically lowest MAC address.",
      "Switch-B, because it has the highest MAC address, which breaks the tie.",
      "Switch-C, because all switches share the default priority of 32768, and Switch-C has the lowest MAC address (0011.aa22.a).",
      "Switch-C, because it has the highest Priority when the priority value is combined with the system ID."
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "STP elects the Root Bridge based on the lowest Bridge ID (BID). The BID consists of Bridge Priority (2 bytes) + MAC Address (6 bytes). Since all three switches are configured with the default priority of 32768, the MAC address is used as a tie-breaker. Switch-C's MAC address (0011.aa22.a...) is the lowest value, so Switch-C is elected as the Root Bridge. Reference: CCNA Volume 1, Chapter 9: Spanning Tree Protocol Concepts.",
      "wrong": [
        "Switch-A does not have the lowest MAC address. 'a' is lower than 'b' in hexadecimal representation.",
        "STP selects the lowest MAC address to break ties, not the highest.",
        "The priority is the same (32768) on all switches, so priority does not break the tie; the MAC address does."
      ],
      "tip": "Spanning Tree always prefers the lowest value for Root Bridge elections. Default Bridge Priority is 32768.",
      "memory": "STP = Spanning Tree = Select the Smallest (lowest BID, lowest MAC, lowest cost).",
      "real": "In production, relying on default STP priorities is a hazard because the oldest switch with the lowest MAC address might automatically become the Root Bridge, routing all traffic through a slow backbone link.",
      "commands": [
        "show spanning-tree",
        "show spanning-tree detail",
        "spanning-tree vlan 1 root primary"
      ]
    },
    "topology": "      +------------------+\n      |  Switch-A        |\n      |  MAC: 0011.aa22.b|\n      |  Priority: 32768 |\n      +--------+---------+\n               |\n        +------+------+\n        |             |\n+-------+--------+  +--+-------------+\n|  Switch-B      |  |  Switch-C      |\n|  MAC: 0011.aa22.c|  |  MAC: 0011.aa22.a|\n|  Priority: 32768 |  |  Priority: 32768 |\n+----------------+  +----------------+"
  },
  {
    "id": 24,
    "domain": "Network Fundamentals",
    "topic": "IPv4",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting a loop-free path using Rapid Spanning Tree Protocol (RSTP / 802.1w). On Switch-B, a non-root switch, what will be the port roles and states for interfaces connected to Switch-A (Root Bridge) and Switch-C (designated path), given that Switch-B has an alternate backup link?",
    "options": [
      "Gi0/1 is the Root Port in Forwarding state; Gi0/2 is the Alternate Port in Blocking state.",
      "Gi0/1 is the Designated Port in Forwarding state; Gi0/2 is the Backup Port in Discarding state.",
      "Gi0/1 is the Root Port in Forwarding state; Gi0/2 is the Alternate Port in Discarding state.",
      "Gi0/1 is the Backup Port in Blocking state; Gi0/2 is the Alternate Port in Forwarding state."
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "In RSTP (802.1w), the Spanning Tree port states are Discarding, Learning, and Forwarding. The legacy 'Blocking' state is replaced by 'Discarding'. Gi0/1 is the Root Port (lowest cost to Root Bridge) and is Forwarding. Gi0/2 is an Alternate Port (backup path to the root) and is in the Discarding state. Reference: CCNA Volume 1, Chapter 10: RSTP and EtherChannel.",
      "wrong": [
        "RSTP does not use the 'Blocking' state; it uses the 'Discarding' state instead.",
        "Gi0/1 is the Root Port, not the Designated Port, because it is the port on a non-root switch closest to the Root Bridge.",
        "Gi0/1 cannot be a Backup Port because Backup Ports are only used when there are multiple links to the same collision domain (e.g., connected to a shared hub)."
      ],
      "tip": "RSTP States: Discarding, Learning, Forwarding. RSTP Roles: Root, Designated, Alternate, Backup.",
      "memory": "RSTP combines Blocking, Listening, and Disabled states into a single Discarding state.",
      "real": "RSTP achieves convergence in less than 2 seconds by utilizing a proposal-agreement handshake on point-to-point links, avoiding the 30-second delay found in legacy 802.1D Spanning Tree.",
      "commands": [
        "show spanning-tree",
        "show spanning-tree summary"
      ]
    },
    "cli": "Switch-B# show spanning-tree vlan 10\n\nVLAN0010\n  Spanning tree enabled protocol rstp\n  Root ID    Priority    32768\n             Address     0011.aa22.aaaa\n             Cost        4\n             Port        1 (GigabitEthernet0/1)\n             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec\n\n  Bridge ID  Priority    32768  (priority 32768 sys-id-ext 10)\n             Address     0011.aa22.bbbb\n             Aging Time  300 sec\n\nInterface           Role Sts Cost      Play   Type\n------------------- ---- --- --------- ------ --------------------------------\nGi0/1               Root FWD 4         128.1  P2p \nGi0/2               Altn BLK 4         128.2  P2p \nGi0/3               Desg FWD 4         128.3  P2p"
  },
  {
    "id": 25,
    "domain": "Network Fundamentals",
    "topic": "ARP",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. What is the destination MAC address used when an ARP reply is sent back to the requesting host?",
    "options": [
      "FFFF.FFFF.FFFF",
      "The unicast MAC address of the requesting host",
      "0000.0c07.ac01",
      "0100.5E00.0002"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "An ARP Reply is unicast because the replying host already knows the requesting host's MAC address (which was included in the broadcast ARP Request). Reference: RFC 826.",
      "wrong": [
        "FFFF.FFFF.FFFF is the broadcast MAC used for requests, not replies.",
        "0100.5E00.0002 is a multicast address, not a unicast MAC.",
        "0000.0c07.ac01 is an HSRP virtual MAC address, not an ARP reply."
      ],
      "tip": "ARP Requests are Broadcast (FFFF). ARP Replies are Unicast (specific destination).",
      "memory": "I know who asked, so I reply to them directly.",
      "real": "When checking Wireshark captures, you will see a broadcast ARP Request followed by a unicast ARP Reply containing the requested hardware address.",
      "commands": [
        "show arp"
      ]
    }
  },
  {
    "id": 26,
    "domain": "Network Access",
    "topic": "VLANs",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer has configured an EtherChannel bundle between Switch-A and Switch-B. However, traffic is not passing across the link, and the engineer issues the 'show etherchannel summary' command. Based on the output below, what is the status of Port-channel 1, and what action should be taken?",
    "options": [
      "The EtherChannel is functioning correctly. Gi0/1 and Gi0/2 are actively bundling traffic.",
      "The EtherChannel is down (SD) because the protocol negotiation failed. The engineer should verify that Switch-B is configured as 'active' or 'passive'.",
      "The channel is operational, but ports Gi0/1 and Gi0/2 are in standalone mode (I) because LACP is disabled globally.",
      "The bundle is operating as a Layer 3 channel (R) and needs an IP address assigned to Po1."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "In the command output, 'Po1(SD)' indicates that Port-channel 1 is a Layer 2 Spanning-tree channel (S) and is Down (D). The ports Gi0/1 and Gi0/2 are marked with flag '(I)', which means they are running in Standalone mode, indicating the LACP negotiation failed. This occurs if the opposite side switch ports are not configured to negotiate EtherChannel, or are using a different mode (e.g. static 'on' mode or dynamic PAgP). The engineer should verify the modes (e.g., active/active or active/passive). Reference: CCNA Volume 1, Chapter 10: RSTP and EtherChannel.",
      "wrong": [
        "The EtherChannel is down (D flag) and not operational, and ports are standalone, not bundled.",
        "LACP is not disabled globally; it is configured on the ports but failed to negotiate because the other side did not respond with LACP packets.",
        "The channel is configured as a Layer 2 channel (S), not Layer 3 (R)."
      ],
      "tip": "EtherChannel Status Flags: S = Layer 2, D = Down, P = Bundled in Port-channel, I = Stand-alone. Ensure negotiation modes are compatible (Active/Active or Active/Passive for LACP; Desirable/Desirable or Desirable/Auto for PAgP).",
      "memory": "Po1(SD) = Spanning-tree Down (Broken bundle). Gi0/1(I) = Independent/Standalone (Not bundled).",
      "real": "Mismatched configurations (such as configuring 'channel-group 1 mode active' on one side and 'channel-group 1 mode on' on the other) will cause packet drops and put ports in standalone mode.",
      "commands": [
        "show etherchannel summary",
        "show interfaces trunk",
        "channel-group 1 mode active"
      ]
    },
    "cli": "Switch-A# show etherchannel summary\nFlags:  D - down        P - bundled in port-channel\n        I - stand-alone s - suspended\n        H - Hot-standby (LACP only)\n        R - Layer3      S - Layer2\n        U - in use      N - not in use\nNumber of channel-groups in use: 1\nNumber of aggregators:            1\n\nGroup Port-channel  Protocol    Ports\n------+-------------+-----------+-----------------------------------------------\n1     Po1(SD)         LACP      Gi0/1(I)     Gi0/2(I)"
  },
  {
    "id": 27,
    "domain": "Network Access",
    "topic": "VLANs",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. What is the valid range of VLAN IDs for Normal Range VLANs configured on a Cisco Catalyst switch?",
    "options": [
      "2 - 1024",
      "1006 - 4094",
      "1 - 1005",
      "1 - 4094"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "Normal range VLANs are numbered 1 to 1005. VLANs 1002 to 1005 are reserved for legacy networks like Token Ring and FDDI. Reference: Cisco VLAN guidelines.",
      "wrong": [
        "1 to 4094 is the complete range of all configurable VLANs (normal and extended combined).",
        "2 to 1024 is an incorrect range.",
        "1006 to 4094 is the range for Extended VLANs, which are stored in running-config rather than vlan.dat."
      ],
      "tip": "Normal VLANs: 1-1005 (stored in vlan.dat). Extended VLANs: 1006-4094 (stored in running-config).",
      "memory": "Normal ends at 1005. Extended starts at 1006.",
      "real": "When configuring small to medium networks, stick to normal range VLANs to ensure compatibility across older switch models.",
      "commands": [
        "show vlan"
      ]
    }
  },
  {
    "id": 28,
    "domain": "Network Access",
    "topic": "Trunks",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A systems administrator is upgrading a corporate wireless network from WPA2-Personal to WPA3-Personal. What key security improvement does WPA3 introduce to replace the WPA2 Pre-Shared Key (PSK) 4-way handshake, and which protocol is used?",
    "options": [
      "Simultaneous Authentication of Equals (SAE) using a Dragonfly handshake, which protects against offline dictionary attacks.",
      "Temporal Key Integrity Protocol (TKIP), which dynamically changes encryption keys every few packets.",
      "Extensible Authentication Protocol (EAP-TLS), which replaces pre-shared passwords with client-side certificates.",
      "Wired Equivalent Privacy (WEP) RC4 hashing, which scrambles the pre-shared key over public airwaves."
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "WPA3-Personal replaces the Pre-Shared Key (PSK) authentication method with Simultaneous Authentication of Equals (SAE), which utilizes the Dragonfly key exchange handshake. SAE prevents attackers from capturing the wireless handshake over the air and performing offline brute-force/dictionary attacks to crack the password. It also provides forward secrecy, meaning compromised keys cannot be used to decrypt past traffic. Reference: CCNA Volume 1, Chapter 11: Wireless LANs.",
      "wrong": [
        "TKIP was introduced in WPA to temporarily patch vulnerable WEP hardware, and it is now deprecated due to security flaws.",
        "EAP-TLS is used in WPA2/WPA3 Enterprise (802.1X), not WPA3-Personal (which still relies on a single passphrase).",
        "WEP is the original, highly vulnerable wireless encryption standard that was deprecated in 2004."
      ],
      "tip": "WPA3 Personal = SAE / Dragonfly Handshake. WPA3 Enterprise = 802.1X / EAP.",
      "memory": "SAE = Simultaneous Authentication of Equals = WPA3 Personal Security.",
      "real": "WPA3-Personal helps secure guest networks at coffee shops and hotels. Even if the password is known to everyone, guests cannot decrypt each other's wireless packets.",
      "commands": [
        "wlan",
        "security wpa3"
      ]
    }
  },
  {
    "id": 29,
    "domain": "Network Access",
    "topic": "Trunks",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network architect is designing a multi-area OSPFv2 routing network. According to OSPF design rules, which statement correctly describes the requirement for inter-area routing and OSPF Area 0?",
    "options": [
      "All non-backbone areas must connect directly to the backbone area (Area 0), either physically or via a virtual link, to allow inter-area routing.",
      "Each non-backbone area must have a designated Area Border Router (ABR) that runs a separate OSPF process for each area.",
      "Area 0 must contain all physical links in the network, while other areas are configured as virtual interfaces.",
      "Area 0 is optional and is only required if the network uses RIPv2 or EIGRP redistribution."
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "OSPF utilizes a two-tier hierarchical routing design. Area 0 is the backbone area. All other areas (non-backbone areas) must connect directly to Area 0. All traffic moving between non-backbone areas must traverse Area 0. If a non-backbone area cannot connect physically to Area 0, a virtual link must be configured to bridge it. Reference: CCNA Volume 2, Chapter 3: Implementing OSPFv2.",
      "wrong": [
        "An ABR runs a single OSPF process but participates in multiple areas. It does not require a separate process per area.",
        "Area 0 does not need to contain all physical links. It only contains the backbone segment, while client segments reside in other areas.",
        "Area 0 is the core requirement of any multi-area OSPF network. It is not optional."
      ],
      "tip": "In OSPF, the backbone area is always Area 0 (or 0.0.0.0). Routers connecting Area 0 to other areas are called Area Border Routers (ABRs).",
      "memory": "All roads in OSPF lead through Area 0.",
      "real": "If Area 10 is connected to Area 20, but neither is connected to Area 0, they will build local databases but will not exchange inter-area routes (O IA) until one is connected to Area 0.",
      "commands": [
        "router ospf 10",
        "network 10.1.1.0 0.0.0.255 area 0",
        "show ip ospf database"
      ]
    }
  },
  {
    "id": 30,
    "domain": "Network Access",
    "topic": "STP",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network systems administrator is configuring a static route on a Cisco router to forward traffic destined for the IPv6 subnet '2001:db8:acad:2::/64' to the next-hop router's link-local address 'fe80::2' out interface GigabitEthernet0/0. Which command represents the correct syntax?",
    "options": [
      "ipv6 route 2001:db8:acad:2::/64 gigabitEthernet 0/0 fe80::2",
      "ipv6 route 2001:db8:acad:2::/64 fe80::2",
      "ip route ipv6 2001:db8:acad:2::/64 gigabitEthernet 0/0",
      "ipv6 route fe80::2 2001:db8:acad:2::/64 gigabitEthernet 0/0"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "In IPv6 static routing, if the next-hop address is a Link-Local address (FE80::/10), the outgoing exit interface MUST be specified in the routing command. This is because link-local addresses are non-routable and exist only on a specific link segment. Without specifying the exit interface, the router cannot determine which physical port to use to reach the next-hop. The syntax is: 'ipv6 route <prefix/length> <exit-interface> <next-hop-address>'. Reference: CCNA Volume 1, Chapter 17: IPv6 Routing.",
      "wrong": [
        "This command fails because it does not specify the exit interface, which is mandatory when using link-local next hops.",
        "The command prefix 'ip route ipv6' is invalid syntax in Cisco IOS.",
        "The parameters are reversed; the destination prefix must come before the next-hop address."
      ],
      "tip": "When configuring static routes with global unicast next-hops (e.g., 2001:db8::2), the interface is optional. When using link-local next-hops (e.g., fe80::2), the interface is mandatory.",
      "memory": "Link-Local next hop = Local link significance = Interface must be specified.",
      "real": "In production, link-local addresses are preferred for next-hops because they remain stable even if global unicast IPv6 prefixes are renumbered.",
      "commands": [
        "ipv6 route 2001:db8:acad:2::/64 gigabitEthernet 0/0 fe80::2",
        "show ipv6 route"
      ]
    }
  },
  {
    "id": 31,
    "domain": "Network Access",
    "topic": "STP",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network systems engineer is configuring two routers, R1 and R2, for High Availability using Hot Standby Router Protocol (HSRP). R1 is currently the Active router, and R2 is the Standby router. Based on the configurations below, what happens if R1 reboots and then comes back online?",
    "order": [
      "Blocking: The port discards data frames and does not learn MAC addresses.",
      "Listening: The port processes BPDUs but does not learn MAC addresses or forward data.",
      "Learning: The port begins building the MAC table but does not forward data.",
      "Forwarding: The port fully forwards data frames and continues learning MACs."
    ],
    "expl": {
      "correct": "B",
      "why": "HSRP Active router election is based on priority (highest priority wins; default is 100). R1 has a priority of 110 and R2 has 105. When R1 reboots, R2 becomes the Active router. Once R1 recovers, R1 will evaluate its priority against R2. Because R1's priority (110) is higher than R2's priority (105) and R1 has preemption enabled ('standby 1 preempt'), R1 will immediately takeover and reclaim the Active role. Reference: CCNA Volume 2, Chapter 11: First Hop Redundancy Protocols.",
      "wrong": [
        "R1 has preemption enabled in its configuration, so it will not remain standby indefinitely.",
        "HSRP state machines prevent both routers from staying Active together under normal conditions; they communicate via hello packets to establish Active/Standby.",
        "R2's preemption command allows R2 to takeover if its priority is higher than the active router, but it does not block R1 (which has a higher priority) from preempting."
      ],
      "tip": "Preemption is disabled by default in HSRP. If preemption is disabled, a router with a higher priority will NOT takeover once another router has already become Active.",
      "memory": "Preemption = Take back the crown when I'm healthy.",
      "real": "In production, it is common to delay preemption using the command 'standby 1 preempt delay minimum 60' to allow routing tables to stabilize before the router resumes forwarding traffic.",
      "commands": [
        "show standby",
        "show standby brief",
        "standby 1 preempt"
      ]
    },
    "cli": "R1# show running-config interface GigabitEthernet0/1\ninterface GigabitEthernet0/1\n ip address 10.1.1.2 255.255.255.0\n standby 1 ip 10.1.1.1\n standby 1 priority 110\n standby 1 preempt\n\nR2# show running-config interface GigabitEthernet0/1\ninterface GigabitEthernet0/1\n ip address 10.1.1.3 255.255.255.0\n standby 1 ip 10.1.1.1\n standby 1 priority 105\n standby 1 preempt",
    "options": [
      "R2 will remain the Active router indefinitely because preemption is disabled on R1.",
      "R2 will become Active when R1 goes down. Once R1 recovers, R1 will immediately reclaim the Active role because it has a higher priority (110) and preemption is enabled.",
      "Both routers will enter the Active state simultaneously, causing an IP address conflict on the virtual IP 10.1.1.1.",
      "R2 will become Active. When R1 recovers, R2 will remain Active because R2 is configured with preemption, which blocks R1 from taking over."
    ],
    "correct": [
      1
    ]
  },
  {
    "id": 32,
    "domain": "Network Access",
    "topic": "STP",
    "type": "matching",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Match the Spanning Tree port roles to their correct operational definitions.",
    "pairs": [
      [
        "Root Port",
        "The port on a non-root switch with the lowest path cost to the root bridge."
      ],
      [
        "Designated Port",
        "The port on a segment that forwards traffic away from the root bridge."
      ],
      [
        "Alternate Port",
        "A blocking port that acts as a backup path to the root bridge."
      ]
    ],
    "expl": {
      "correct": "Matching",
      "why": "Every non-root switch elects one Root Port. On each segment, a Designated Port is selected to forward traffic. Alternate ports (in Rapid PVST+) block traffic to prevent loops while standing by as backup paths. Reference: IEEE 802.1w.",
      "wrong": [
        "A root bridge has designated ports, never root ports.",
        "Alternate ports do not forward traffic; they block it until a topology change occurs.",
        "Disabled ports do not send BPDUs or participate in any Spanning Tree operations."
      ],
      "tip": "All active ports on a Root Bridge must be Designated Ports.",
      "memory": "Root Port = Path to Root. Designated = Boss of the segment. Alternate = Backup.",
      "real": "When debugging loops, verify which port is the Root Port to understand the switch's forwarding path to the core.",
      "commands": [
        "show spanning-tree summary"
      ]
    }
  },
  {
    "id": 33,
    "domain": "Network Access",
    "topic": "STP",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which of the following lists the three port states utilized by Rapid Spanning Tree Protocol (RSTP / 802.1w)?",
    "options": [
      "Disabled, Blocking, Learning",
      "Discarding, Learning, Forwarding",
      "Listening, Learning, Forwarding",
      "Blocking, Listening, Forwarding"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "RSTP simplifies port states by merging Disabled, Blocking, and Listening into a single state: Discarding. The other two active states are Learning and Forwarding. Reference: IEEE 802.1w.",
      "wrong": [
        "Blocking and Listening are 802.1D states and do not exist in RSTP.",
        "Disabled and Blocking are legacy states merged into Discarding.",
        "RSTP does not use a separate Listening state."
      ],
      "tip": "RSTP combines the three inactive states into 'Discarding' to simplify the protocol.",
      "memory": "DLF: Discard, Learn, Forward.",
      "real": "Deploying Rapid PVST+ reduces network convergence time from 30-50 seconds to under 2 seconds during link failures.",
      "commands": [
        "spanning-tree mode rapid-pvst"
      ]
    }
  },
  {
    "id": 34,
    "domain": "Network Access",
    "topic": "STP",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. A port-level security feature is configured on an access port connected to an office desk. If BPDU Guard is enabled, what action does the switch take if it receives a Spanning Tree BPDU on that port?",
    "options": [
      "It blocks the BPDU but keeps the port operational in access mode.",
      "It changes the port role to a designated port.",
      "It disables Spanning Tree globally on the switch.",
      "It transitions the port into the err-disabled state, shutting it down."
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "BPDU Guard protects ports where no switches should be connected (like client ports with PortFast). If a BPDU is received, it assumes an unauthorized switch has been connected and puts the port in err-disabled state to prevent loops. Reference: Cisco STP security configuration guides.",
      "wrong": [
        "The switch does not keep the port operational; it disables it to prevent loops.",
        "A port receiving unexpected BPDUs cannot safely become a designated port.",
        "BPDU Guard operates on a per-port basis and will not disable Spanning Tree globally."
      ],
      "tip": "Configure BPDU Guard on all PortFast-enabled access ports to secure the edge network.",
      "memory": "BPDU Guard = Guard the edge. Switch plugged in? Err-disable.",
      "real": "If an employee plugs a home switch into a wall outlet, BPDU Guard will instantly disable the port and trigger a syslog warning.",
      "commands": [
        "spanning-tree bpduguard enable",
        "show interfaces status err-disabled"
      ]
    }
  },
  {
    "id": 35,
    "domain": "Network Access",
    "topic": "EtherChannel",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which open standard protocol is defined by IEEE 802.3ad/802.1AX to negotiate EtherChannel links between devices?",
    "options": [
      "VTP (VLAN Trunking Protocol)",
      "LACP (Link Aggregation Control Protocol)",
      "DTP (Dynamic Trunking Protocol)",
      "PAgP (Port Aggregation Protocol)"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "LACP is the industry-standard link aggregation protocol. PAgP is Cisco proprietary. Reference: IEEE 802.1AX.",
      "wrong": [
        "PAgP is Cisco proprietary, not an open standard.",
        "DTP is for negotiating trunk links, not bundling physical ports.",
        "VTP manages VLAN databases across switches, not link aggregation."
      ],
      "tip": "LACP = Industry Standard (Active/Passive). PAgP = Cisco Proprietary (Desirable/Auto).",
      "memory": "LACP: Link Aggregation Control Protocol = Standard.",
      "real": "When bundling links between a Cisco switch and a virtualized server, configure LACP to ensure compatibility.",
      "commands": [
        "channel-group 1 mode active"
      ]
    }
  },
  {
    "id": 36,
    "domain": "Network Access",
    "topic": "EtherChannel",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. Switch A is configured with 'channel-group 1 mode auto'. Switch B is configured with 'channel-group 1 mode auto'. What is the status of the resulting PAgP EtherChannel?",
    "options": [
      "The EtherChannel will form successfully.",
      "The EtherChannel will fail to form because both ports are in passive negotiation mode.",
      "The switches will negotiate LACP instead.",
      "The ports will shut down due to an err-disable state."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "The 'auto' mode under PAgP is a passive mode that waits for the other side to initiate negotiation. Since both sides are in passive 'auto' mode, neither initiates negotiation, and the bundle fails to form. Reference: Cisco EtherChannel guide.",
      "wrong": [
        "An EtherChannel will not form if both sides are passive.",
        "Auto mode is specific to PAgP; switches cannot negotiate LACP unless the mode is changed to 'active' or 'passive'.",
        "Passive modes do not trigger an err-disabled state; they simply fail to bundle."
      ],
      "tip": "At least one side of an EtherChannel must be in active negotiation mode (desirable for PAgP, active for LACP).",
      "memory": "Auto + Auto = No Channel. Desirable + Auto = Channel.",
      "real": "When configuring bundles, configure one side as 'desirable' and the other as 'auto' to ensure PAgP forms correctly.",
      "commands": [
        "show etherchannel summary"
      ]
    }
  },
  {
    "id": 37,
    "domain": "Network Access",
    "topic": "EtherChannel",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which three configuration parameters must match exactly on all physical interfaces to successfully form an EtherChannel bundle?",
    "options": [
      "Spanning Tree cost values",
      "Speed and Duplex settings",
      "IP addresses of the physical interfaces",
      "Allowed VLAN list on trunk ports",
      "Switchport access VLAN ID (on access ports)"
    ],
    "correct": [
      1,
      3,
      4
    ],
    "expl": {
      "correct": "B, D, E",
      "why": "Physical characteristics (speed, duplex) and Layer 2 settings (VLAN mode, access VLAN, allowed trunks) must match exactly on all member ports to form an EtherChannel. Reference: Cisco EtherChannel guides.",
      "wrong": [
        "Spanning Tree costs are applied to the logical Port-Channel interface, not the physical interfaces.",
        "Physical interfaces bundled into a Layer 2 EtherChannel do not have individual IP addresses.",
        "The port-channel interface ID does not need to match on both switches."
      ],
      "tip": "Configure settings directly on the Port-Channel interface rather than individual ports to avoid configuration drift.",
      "memory": "SDS: Speed, Duplex, Switchport settings must match.",
      "real": "If Gi0/1 is set to VLAN 10 and Gi0/2 is accidentally left in VLAN 1, the EtherChannel negotiation will fail and log a configuration mismatch error.",
      "commands": [
        "show etherchannel port-channel"
      ]
    }
  },
  {
    "id": 38,
    "domain": "Network Access",
    "topic": "Wireless",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A systems administrator needs to secure access switch ports. The security policy requires that if an unauthorized MAC address is detected, the port must drop the traffic and immediately send an SNMP trap and log a syslog message, but the port should remain operational to prevent service tickets. Which Port Security violation mode should be configured?",
    "options": [
      "Restrict",
      "Protect",
      "Shutdown",
      "Disable"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Port Security supports three violation modes: 1) Shutdown: Disables the port (err-disabled), logs syslog, sends SNMP traps, and increments the violation counter. 2) Restrict: Drops offending traffic, logs syslog, sends SNMP traps, and increments the violation counter, but keeps the port up. 3) Protect: Drops offending traffic silently without logging, traps, or incrementing the counter. The policy requirements match 'Restrict' mode. Reference: CCNA Volume 2, Chapter 6: Port Security.",
      "wrong": [
        "Protect mode drops traffic silently and does not generate syslog messages or SNMP traps.",
        "Shutdown mode disables the port entirely, which violates the requirement that the port must remain operational.",
        "Disable is not a valid Port Security violation mode in Cisco IOS."
      ],
      "tip": "Port Security Modes:\n- Protect: Silent drop.\n- Restrict: Drop + log + SNMP trap + increment counter.\n- Shutdown: Disables port (default).",
      "memory": "Restrict = Restricts traffic, sends Alert. Protect = Protects silently.",
      "real": "Restrict mode is useful for shared access ports connected to printers where unauthorized users might occasionally plug in personal laptops; it blocks the laptops but does not disable the printer connection.",
      "commands": [
        "switchport port-security violation restrict",
        "show port-security interface"
      ]
    }
  },
  {
    "id": 39,
    "domain": "Network Access",
    "topic": "Wireless",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. In the 2.4 GHz wireless spectrum, which three channels are standard non-overlapping channels in North America?",
    "options": [
      "2, 7, 12",
      "3, 8, 13",
      "36, 40, 44",
      "1, 6, 11"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "The 2.4 GHz band has 11 channels in North America, spaced 5 MHz apart. Because each channel requires 20-22 MHz of bandwidth, only channels 1, 6, and 11 do not overlap. Reference: IEEE 802.11.",
      "wrong": [
        "Channels 2, 7, and 12 overlap with adjacent channels.",
        "Channels 3, 8, and 13 overlap, and channel 13 is restricted in some regions.",
        "Channels 36, 40, and 44 are located in the 5 GHz band, not 2.4 GHz."
      ],
      "tip": "Always use channels 1, 6, and 11 when planning 2.4 GHz coverage to avoid co-channel interference.",
      "memory": "1 - 6 - 11: The golden rule of 2.4 GHz.",
      "real": "When installing APs in an office, space out their channels using 1, 6, and 11 to prevent interference between adjacent cells.",
      "commands": [
        "show ap config general"
      ]
    }
  },
  {
    "id": 40,
    "domain": "Network Access",
    "topic": "Wireless",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. What cryptographic authentication protocol is introduced in WPA3 to replace the vulnerable Pre-Shared Key (PSK) handshake used in WPA2?",
    "options": [
      "WEP (Wired Equivalent Privacy)",
      "TKIP (Temporal Key Integrity Protocol)",
      "EAP-TLS",
      "SAE (Simultaneous Authentication of Equals)"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "WPA3 replaces WPA2-PSK with Simultaneous Authentication of Equals (SAE), which uses a secure key exchange (Dragonfly handshake) to protect against offline dictionary attacks. Reference: Wi-Fi Alliance WPA3 specification.",
      "wrong": [
        "TKIP was used in WPA to patch WEP and is now deprecated.",
        "WEP is a legacy algorithm with severe vulnerabilities.",
        "EAP-TLS is an enterprise certificate-based authentication method, not a PSK replacement."
      ],
      "tip": "SAE prevents attackers from capturing a handshake and cracking it offline.",
      "memory": "SAE: Secure Access for Everyone (or Equals) in WPA3.",
      "real": "Upgrading home or small office networks to WPA3-Personal ensures that weak passwords cannot be easily cracked using packet captures.",
      "commands": [
        "show wlan summary"
      ]
    }
  },
  {
    "id": 41,
    "domain": "Network Access",
    "topic": "Wireless",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. What does a Basic Service Set Identifier (BSSID) represent in an 802.11 wireless network?",
    "options": [
      "The IP address of the Wireless LAN Controller",
      "The physical MAC address of the access point's radio interface",
      "The security key used for WPA encryption",
      "The user-friendly text name of the Wi-Fi network"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "A BSSID is the unique MAC address of the wireless radio on the AP that serves the BSS. The SSID is the text name of the network. Reference: IEEE 802.11.",
      "wrong": [
        "The user-friendly text name is the SSID.",
        "The WLC IP is used for AP management, not local cell identification.",
        "The security key is part of authentication, not AP identification."
      ],
      "tip": "SSID is a text name (e.g., 'Guest-WiFi'). BSSID is a MAC address (e.g., 00:11:22:AA:BB:CC).",
      "memory": "BSSID: B stands for Burned-in MAC address of the radio.",
      "real": "When analyzing Wi-Fi issues with a wireless scanner, you will see multiple BSSIDs (MACs) broadcasting the same SSID (network name) across the building.",
      "commands": [
        "show ap wlan connection"
      ]
    }
  },
  {
    "id": 42,
    "domain": "Network Access",
    "topic": "Wireless",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Low",
    "text": "A network engineer is troubleshooting an issue. On a Cisco Catalyst switch, what does a blinking green port status LED indicate during normal operation?",
    "options": [
      "The port is actively sending or receiving network traffic.",
      "The port is disabled by an administrator.",
      "The port has experienced a link-down event.",
      "The port is undergoing Spanning Tree convergence."
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "A blinking green LED indicates that the port is link-up and actively transmitting or receiving frame traffic. Reference: Cisco hardware installation guides.",
      "wrong": [
        "A disabled port has its LED turned off.",
        "A link-down event has its LED turned off.",
        "A port in Spanning Tree convergence shows a solid amber LED."
      ],
      "tip": "Solid Green = Link Up. Blinking Green = Activity. Solid Amber = Blocked/STP. Off = No Link.",
      "memory": "Blinking Green = Traffic moving.",
      "real": "During a physical patch panel check, look for blinking green lights to verify which links are active.",
      "commands": [
        "show interfaces status"
      ]
    }
  },
  {
    "id": 43,
    "domain": "Network Access",
    "topic": "VLANs",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. What configuration command must be applied to a router subinterface to configure Router-on-a-Stick for VLAN 20?",
    "options": [
      "switchport access vlan 20",
      "ip address vlan 20",
      "vlan 20",
      "encapsulation dot1Q 20"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "To enable Router-on-a-Stick, the router subinterface must be configured with 'encapsulation dot1Q <vlan-id>' to tag and receive traffic for that specific VLAN. Reference: Cisco IOS routing guides.",
      "wrong": [
        "switchport access vlan 20 is a switch-port command, not a router subinterface command.",
        "vlan 20 creates a VLAN database entry on a switch, not a router subinterface.",
        "ip address vlan 20 is invalid syntax."
      ],
      "tip": "Configure encapsulation on the subinterface before assigning its IP address, as the router requires encapsulation configuration to define IP parameters.",
      "memory": "encapsulation dot1Q VLAN_ID links the subinterface to the tag.",
      "real": "When configuring a router for Router-on-a-Stick, configure subinterfaces like Gi0/0.20 with 'encapsulation dot1Q 20' to route traffic for the client VLAN.",
      "commands": [
        "encapsulation dot1Q 20"
      ]
    }
  },
  {
    "id": 44,
    "domain": "Network Access",
    "topic": "VLANs",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. What interface is configured on a Layer 3 switch to assign an IP address and act as a default gateway for a local VLAN?",
    "options": [
      "A loopback interface",
      "An SVI (Switch Virtual Interface)",
      "An access port interface",
      "A trunk port subinterface"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "An SVI (e.g., interface Vlan 10) is a logical Layer 3 interface on a switch. Assigning an IP address to this interface allows it to route traffic for that VLAN. Reference: Cisco L3 switching guides.",
      "wrong": [
        "Access ports are Layer 2 only and cannot host default gateway IP addresses.",
        "Loopback interfaces are virtual testing interfaces, not gateways for local VLAN hosts.",
        "Subinterfaces are used on routers for Router-on-a-Stick, not on Layer 3 switches."
      ],
      "tip": "Enable 'ip routing' globally on a Cisco Layer 3 switch to activate routing between SVIs.",
      "memory": "SVI = Switch Virtual Interface = Gateway on a Switch.",
      "real": "In a collapsed core design, the core Layer 3 switch hosts SVIs for VLAN 10 and 20, routing traffic between them at wire speed.",
      "commands": [
        "interface vlan 10",
        "ip address 10.1.10.1 255.255.255.0",
        "no shutdown"
      ]
    }
  },
  {
    "id": 45,
    "domain": "Network Access",
    "topic": "Wireless",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network systems engineer is capturing frames on a LAN segment to troubleshoot a gateway redundancy issue. The network uses HSRP version 1 for group 10. Which destination MAC address in the Ethernet frames indicates that traffic is being routed to the HSRP virtual gateway?",
    "options": [
      "0000.0c07.ac0a",
      "0000.0c9f.f00a",
      "0000.0c07.ac10",
      "0100.5e00.000a"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "HSRP version 1 utilizes a specific virtual MAC address format: '0000.0c07.acXX', where 'XX' represents the HSRP group number in hexadecimal. For group 10, decimal 10 is '0a' in hex, resulting in the virtual MAC address '0000.0c07.ac0a'. Reference: CCNA Volume 2, Chapter 11: First Hop Redundancy Protocols.",
      "wrong": [
        "0000.0c9f.f00a represents the virtual MAC address for HSRPv2 group 10 (which uses format 0000.0C9F.FXXX).",
        "0000.0c07.ac10 represents group 16 in HSRPv1 (hex 10 = decimal 16).",
        "0100.5e00.000a is an IPv4 multicast MAC address (mapping to 224.0.0.10, used by EIGRP), not a unicast MAC."
      ],
      "tip": "HSRPv1 Virtual MAC: 0000.0c07.acXX (XX = Group in hex). HSRPv2 Virtual MAC: 0000.0c9f.fXXX (XXX = Group in hex). HSRPv1 uses multicast 224.0.0.2; HSRPv2 uses 224.0.0.102.",
      "memory": "HSRPv1 = 0000.0c07.ac + Group in hex.",
      "real": "When troubleshooting HSRP, verifying that client ARP tables show the virtual MAC address mapping to the virtual gateway IP confirms that host traffic is targeting the logical gateway.",
      "commands": [
        "show standby",
        "arp -a"
      ]
    }
  },
  {
    "id": 46,
    "domain": "Network Access",
    "topic": "Wireless",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "Low",
    "text": "A network engineer is troubleshooting an issue. Which lightweight AP mode is designed to dedicate its radios to scanning the RF channels for rogue APs and wireless attacks without serving client traffic?",
    "options": [
      "FlexConnect Mode",
      "Bridge Mode",
      "Monitor Mode",
      "Local Mode"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "Monitor mode configures the AP to act as a dedicated sensor. Its radios scan channels to collect IDS data, locate rogue devices, and measure RF interference, but it does not allow client connections. Reference: Cisco AP deployment models.",
      "wrong": [
        "Local mode is the default state that serves wireless clients while performing minor scanning.",
        "FlexConnect mode allows APs to switch traffic locally when WLC connection is lost.",
        "Bridge mode links distant locations over point-to-point wireless connections."
      ],
      "tip": "Use Monitor mode APs to build an intrusion detection system (WIDS/WIPS) without adding user load.",
      "memory": "Monitor mode = Monitor only, no clients.",
      "real": "A network design includes four local mode APs to provide office Wi-Fi, and one monitor mode AP to scan for rogue hotspots.",
      "commands": [
        "show ap config general"
      ]
    }
  },
  {
    "id": 47,
    "domain": "Network Access",
    "topic": "Trunks",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is configuring Network Address Translation (NAT) on an edge router and checks the active translation table. Based on the output below, which IP address represents the Inside Global address, and what type of translation is taking place?",
    "options": [
      "Inside Global is 192.168.10.5; this represents static one-to-one NAT.",
      "Inside Global is 203.0.113.15; this represents Port Address Translation (PAT) / NAT Overload.",
      "Inside Global is 8.8.8.8; this represents destination NAT for inbound web servers.",
      "Inside Global is 203.0.113.15; this represents dynamic pool-based NAT without overloading."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Inside Global represents the public IP address assigned to internal hosts as they leave the inside network. In the translation table, '203.0.113.15' is the Inside Global address. Because multiple Inside Local IPs (192.168.10.5 and 192.168.10.6) are being mapped to the same Inside Global IP using different TCP port numbers (1024 and 1025), this is a Port Address Translation (PAT) / NAT Overload operation. Reference: CCNA Volume 2, Chapter 6: Network Address Translation.",
      "wrong": [
        "192.168.10.5 is the Inside Local address, which is the private IP address of the host inside the LAN.",
        "8.8.8.8 is the Outside Local/Global address (e.g. public DNS server).",
        "Dynamic NAT without overloading would assign unique public IP addresses from a pool to each inside host, rather than sharing a single IP via source ports."
      ],
      "tip": "Inside Local = Private inside host; Inside Global = Public inside host (post-translation); Outside Local = Private outside host (rarely modified); Outside Global = Public outside destination.",
      "memory": "Local = Private IP side. Global = Public Internet side.",
      "real": "PAT is the foundation of home and small business router configurations, allowing hundreds of internal devices (PCs, phones, IoT devices) to share a single public IPv4 address leased by the ISP.",
      "commands": [
        "show ip nat translations",
        "show ip nat statistics",
        "ip nat inside source list 1 interface Gi0/0 overload"
      ]
    },
    "cli": "EdgeRouter# show ip nat translations\nPro Inside global      Inside local       Outside local      Outside global\ntcp 203.0.113.15:1024  192.168.10.5:1024  8.8.8.8:80         8.8.8.8:80\ntcp 203.0.113.15:1025  192.168.10.6:1024  8.8.8.8:80         8.8.8.8:80"
  },
  {
    "id": 48,
    "domain": "Network Access",
    "topic": "Wireless",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. Which Layer 2 port security action is the default violation mode on Cisco Catalyst switches?",
    "options": [
      "Block",
      "Shutdown",
      "Protect",
      "Restrict"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Shutdown is the default violation mode. If a violation occurs, the port transitions to the err-disabled state, turning off the LED and generating a SNMP trap/syslog message. Reference: Cisco Port Security guidelines.",
      "wrong": [
        "Protect drops traffic from unauthorized MACs but does not log a warning or disable the port.",
        "Restrict drops traffic, increments the violation counter, and generates a syslog, but keeps the port up.",
        "Block is not a port security violation mode."
      ],
      "tip": "Shutdown mode requires manual intervention ('shutdown' then 'no shutdown') or errdisable recovery to re-enable the port.",
      "memory": "Default = Shutdown = Err-disable.",
      "real": "When a user plugs an unauthorized laptop into a port configured with default port security, the port shuts down instantly.",
      "commands": [
        "switchport port-security violation shutdown"
      ]
    }
  },
  {
    "id": 49,
    "domain": "Network Access",
    "topic": "Trunks",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which field in the 802.1Q header tag is used to identify the VLAN to which the frame belongs?",
    "options": [
      "DEI (Drop Eligible Indicator)",
      "TPID (Tag Protocol Identifier)",
      "PCP (Priority Code Point)",
      "VID (VLAN Identifier)"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "The VID (VLAN Identifier) is a 12-bit field that specifies the frame's VLAN. A 12-bit field supports up to 4096 unique VLAN IDs. Reference: IEEE 802.1Q.",
      "wrong": [
        "TPID is set to 0x8100 to identify the frame as 802.1Q tagged.",
        "PCP is a 3-bit field used for Class of Service (CoS) priority tagging.",
        "DEI is a 1-bit field that indicates if a frame can be dropped during congestion."
      ],
      "tip": "The 12-bit VID field is the reason why we can have a maximum of 4094 usable VLANs.",
      "memory": "VID = VLAN ID.",
      "real": "When sniffing a trunk port with Wireshark, check the 802.1Q tag header to verify that the VID field matches the expected configuration.",
      "commands": [
        "show interfaces trunk"
      ]
    }
  },
  {
    "id": 50,
    "domain": "Network Access",
    "topic": "VLANs",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. Which switch command assigns Voice VLAN 150 to a physical interface already configured for access VLAN 10?",
    "options": [
      "switchport trunk allowed vlan 10,150",
      "switchport access vlan 150 voice",
      "voice-vlan 150 enable",
      "switchport voice vlan 150"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "To configure an IP phone and PC on the same port, configure the port for access VLAN 10 and apply 'switchport voice vlan 150' to carry voice traffic. Reference: Cisco IP Telephony guides.",
      "wrong": [
        "switchport access vlan 150 voice is incorrect syntax.",
        "switchport trunk allowed vlan 10,150 is for trunk interfaces, not hybrid access/voice ports.",
        "voice-vlan 150 enable is invalid syntax."
      ],
      "tip": "Voice VLANs allow switches to segregate data and voice traffic onto separate subnets, protecting voice traffic with Quality of Service (QoS).",
      "memory": "switchport voice vlan VLAN_ID.",
      "real": "Configure IP phones on a desktop port with 'switchport voice vlan' to separate voice traffic from the user's PC traffic.",
      "commands": [
        "switchport voice vlan 150"
      ]
    }
  },
  {
    "id": 51,
    "domain": "IP Connectivity",
    "topic": "Route Selection",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. A router receives a packet destined for IP address 172.16.5.37. The routing table contains four matching routes. Which route will the router select to forward the packet?",
    "options": [
      "172.16.5.32/28 [1/0] via Static",
      "172.16.5.0/24 [110/20] via OSPF",
      "172.16.5.32/27 [90/3072] via EIGRP",
      "172.16.5.36/30 [110/50] via OSPF"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Routers select routes based on Longest Prefix Match (the most specific route with the longest subnet mask). Address 172.16.5.37 falls inside the 172.16.5.36/30 range (which contains addresses .36 through .39). Since /30 is the longest subnet mask, this route is selected regardless of Administrative Distance. Reference: Cisco route selection principles.",
      "wrong": [
        "172.16.5.0/24 has a shorter prefix (/24 vs /30).",
        "172.16.5.32/27 has a shorter prefix (/27 vs /30).",
        "172.16.5.32/28 has a shorter prefix (/28 vs /30) and the IP falls outside the range (.32 to .47), though it is not the longest match."
      ],
      "tip": "Longest prefix match is always evaluated first. Administrative distance is only compared when there is a tie in prefix length.",
      "memory": "Longest mask wins, always.",
      "real": "When troubleshooting routing, check the subnet masks. A more specific static route (/32) will override a default route (/0) or summary route.",
      "commands": [
        "show ip route 172.16.5.37"
      ]
    }
  },
  {
    "id": 52,
    "domain": "IP Connectivity",
    "topic": "Route Selection",
    "type": "matching",
    "difficulty": "Easy",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Match the routing protocols to their default Administrative Distance (AD) values as defined in Cisco IOS.",
    "pairs": [
      [
        "Static Route",
        "1"
      ],
      [
        "Internal EIGRP Route",
        "90"
      ],
      [
        "OSPF Route",
        "110"
      ],
      [
        "RIP Route",
        "120"
      ]
    ],
    "expl": {
      "correct": "Matching",
      "why": "Cisco IOS uses default AD values to rate the trustworthiness of route sources: Static=1, EIGRP=90, OSPF=110, and RIP=120. Reference: Cisco Administrative Distance documentation.",
      "wrong": [
        "OSPF does not have an AD of 90; 90 is reserved for EIGRP.",
        "Static routes have an AD of 1, making them more trusted than dynamic routing protocols.",
        "RIP has an AD of 120, making it the least trusted default protocol listed."
      ],
      "tip": "Lower AD is more trusted. Directly connected routes have the lowest default AD of 0.",
      "memory": "Static=1, EIGRP=90, OSPF=110, RIP=120.",
      "real": "If a router learns the same route from both OSPF and EIGRP, it will install the EIGRP route in the routing table because of its lower AD (90 vs 110).",
      "commands": [
        "show ip route"
      ]
    }
  },
  {
    "id": 53,
    "domain": "IP Connectivity",
    "topic": "Static Routes",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. What is the correct syntax to configure a default static route pointing to the next-hop IP address 192.168.1.1?",
    "options": [
      "ip route 255.255.255.255 255.255.255.255 192.168.1.1",
      "ip route 0.0.0.0 0.0.0.0 192.168.1.1",
      "ip route default-gateway 192.168.1.1",
      "ip route 192.168.1.1 0.0.0.0 0.0.0.0"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "A default static route uses a prefix of 0.0.0.0 and a mask of 0.0.0.0, followed by the next-hop IP address or exit interface. Reference: Cisco static routing guidelines.",
      "wrong": [
        "255.255.255.255 is a host broadcast address, not a default route.",
        "Listing the next-hop first is invalid syntax; the destination prefix must come first.",
        "ip route default-gateway is invalid Cisco IOS command syntax."
      ],
      "tip": "The 0.0.0.0 0.0.0.0 route is called the quad-zero route and matches any destination address not present in the routing table.",
      "memory": "ip route 0.0.0.0 0.0.0.0 NEXT_HOP.",
      "real": "Configure a default route on an edge router pointing to the ISP gateway to forward outbound internet traffic.",
      "commands": [
        "ip route 0.0.0.0 0.0.0.0 192.168.1.1"
      ]
    }
  },
  {
    "id": 54,
    "domain": "IP Connectivity",
    "topic": "Static Routes",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "An administrator wants to configure a floating static route as a backup to a primary OSPF routing path. What change must be made to the backup static route configuration?",
    "options": [
      "Assign the static route a metric cost of 10.",
      "Configure the static route with a /32 host mask.",
      "Configure the static route with an Administrative Distance of 1.",
      "Configure the static route with an Administrative Distance higher than 110."
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "OSPF has a default AD of 110. A floating static route acts as a backup and should only appear in the routing table when OSPF fails. Setting its AD higher than 110 (e.g., 120 or 250) keeps it inactive until the primary route drops. Reference: Cisco static routing guides.",
      "wrong": [
        "Setting the AD to 1 (default) makes the static route primary, overriding OSPF.",
        "Static routes do not use routing metrics to compare against dynamic protocol metrics.",
        "A /32 host mask is for targeting a single host, not configuring a floating backup route."
      ],
      "tip": "A floating static route is created by adding an administrative distance at the end of the 'ip route' command.",
      "memory": "Float higher: AD must be higher than the primary protocol's AD.",
      "real": "Configure a floating static route pointing to a backup LTE connection with an AD of 200, which will activate if the primary MPLS link (OSPF) goes down.",
      "commands": [
        "ip route 10.0.0.0 255.0.0.0 172.16.1.1 200"
      ]
    }
  },
  {
    "id": 55,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. What are the default OSPF Hello and Dead timer intervals on a standard Ethernet broadcast multi-access interface?",
    "options": [
      "Hello: 5 seconds; Dead: 20 seconds",
      "Hello: 60 seconds; Dead: 180 seconds",
      "Hello: 10 seconds; Dead: 40 seconds",
      "Hello: 30 seconds; Dead: 120 seconds"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "On broadcast and point-to-point networks, OSPF defaults to a 10-second Hello interval and a 40-second Dead interval (which is 4 times the Hello timer). Reference: RFC 2328.",
      "wrong": [
        "5s/20s is not a default Cisco OSPF timer value.",
        "30s/120s is the default for OSPF non-broadcast multi-access (NBMA) networks.",
        "60s/180s is not an OSPF default interval."
      ],
      "tip": "OSPF Hello and Dead timers must match exactly between two adjacent routers to form a neighbor relationship.",
      "memory": "Hello is 10, Dead is 4x Hello (40).",
      "real": "When configuring OSPF across an IPsec tunnel, ensure that default timers have not been modified on one side, which would prevent neighbor adjacency.",
      "commands": [
        "ip ospf hello-interval 10",
        "show ip ospf interface"
      ]
    }
  },
  {
    "id": 56,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "dragdrop",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Order the OSPF neighbor states in the sequence they occur as two routers establish a full adjacency on a multi-access link.",
    "order": [
      "Init: The router receives a Hello packet containing its own Router ID.",
      "2-Way: Bidirectional communication is established, and DR/BDR election occurs.",
      "ExStart: Routers decide the Master/Slave relationship and initial database sequence number.",
      "Loading: Link-State Requests are sent to fetch missing update details.",
      "Full: Database synchronization is complete, and the routers are fully adjacent."
    ],
    "expl": {
      "correct": "Correct Order",
      "why": "The OSPF state machine transitions through Down -> Init (hello received) -> 2-Way (bidirectional communication) -> ExStart (master/slave election) -> Exchange (LSA headers exchanged) -> Loading (LSAs requested and sent) -> Full (synchronized). Reference: RFC 2328.",
      "wrong": [
        "The 2-Way state must occur before Master/Slave negotiation in ExStart.",
        "Loading cannot occur before the database exchange phase has completed.",
        "Database synchronization is verified in the Full state, which is the final step."
      ],
      "tip": "The 2-Way state is the final stable state for routers that are not elected DR or BDR on a multi-access network.",
      "memory": "I 2-Way ExStart Exchange Loading Full.",
      "real": "If OSPF neighbors are stuck in the Exchange state, check for an MTU mismatch on the connecting interfaces.",
      "commands": [
        "show ip ospf neighbor"
      ]
    }
  },
  {
    "id": 57,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. How does OSPF select the Designated Router (DR) on an Ethernet multi-access segment if all router interface priorities are left at the default value of 1?",
    "options": [
      "A DR is not elected on Ethernet networks.",
      "The router with the lowest IP address on the interface is elected.",
      "The router with the highest OSPF Router ID is elected.",
      "The router that has been online the longest is elected."
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "The OSPF DR election first uses the highest interface priority. If there is a tie (e.g. all set to default priority 1), the router with the highest OSPF Router ID is elected. Reference: RFC 2328.",
      "wrong": [
        "System uptime does not affect OSPF elections.",
        "The lowest IP address is not preferred; highest router ID breaks the tie.",
        "Ethernet is a broadcast multi-access network, which requires a DR/BDR election."
      ],
      "tip": "To prevent a router from participating in a DR election, configure its OSPF interface priority to 0.",
      "memory": "Default priority equal? Highest RID wins DR.",
      "real": "In multi-access VLANs, configure your core router with 'ip ospf priority 255' to ensure it is always elected DR.",
      "commands": [
        "ip ospf priority 255"
      ]
    }
  },
  {
    "id": 58,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A systems administrator has configured an access list on a router to prevent Telnet and SSH access from the Guest network (192.168.50.0/24) to the Management subnet (10.10.10.0/24), while permitting other traffic. Based on the ACL output below, why are guests still able to establish SSH connections to the management servers?",
    "options": [
      "The access-list is processed sequentially from top to bottom. The first statement (10 permit ip any any) matches all traffic, allowing guest SSH connections to pass before line 20 is evaluated.",
      "The destination port number for SSH is configured incorrectly; SSH uses port 23, and Telnet uses port 22.",
      "The wildcard mask for the guest network (0.0.0.255) is configured incorrectly and matches all traffic.",
      "The access-list needs to be applied in the inbound direction on the virtual terminal lines (VTY) instead of the physical interface."
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Cisco IOS Access Control Lists (ACLs) are processed sequentially, line by line. Once a statement matches the packet, the router applies the action (permit/deny) and stops evaluating further lines. Because line 10 permits 'ip any any', all IP traffic is permitted immediately, rendering the subsequent deny rules (lines 20 and 30) completely unreachable and inactive. Reference: CCNA Volume 2, Chapter 2: Implementing IPv4 ACLs.",
      "wrong": [
        "SSH uses TCP port 22 and Telnet uses TCP port 23; the port numbers are correct.",
        "The wildcard mask 0.0.0.255 is correct for matching a /24 classful block.",
        "While applying ACLs to VTY lines restricts direct access to the router, applying an interface ACL is fully supported but fails here due to sequence order."
      ],
      "tip": "Always place more specific deny statements at the top of an ACL, and more general permit statements (like 'permit ip any any') at the very bottom.",
      "memory": "ACLs = First Match Wins. Specifics first, generals last.",
      "real": "During security audits, a misplaced 'permit ip any any' rule in the middle of a firewall rule base is one of the most common causes of unintended data exposure.",
      "commands": [
        "show access-lists",
        "ip access-list extended BLOCK_GUEST",
        "no 10"
      ]
    },
    "cli": "Router# show access-lists\nExtended IP access list BLOCK_GUEST\n    10 permit ip any any\n    20 deny tcp 192.168.50.0 0.0.0.255 10.10.10.0 0.0.0.255 eq 22\n    30 deny tcp 192.168.50.0 0.0.0.255 10.10.10.0 0.0.0.255 eq 23"
  },
  {
    "id": 59,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. What formula does OSPF use to calculate the cost metric of a physical interface by default on Cisco IOS routers?",
    "options": [
      "Cost = 100,000,000 / Interface Bandwidth (in bps)",
      "Cost = Reliability / Interface Bandwidth",
      "Cost = Hop Count * 10",
      "Cost = Interface Delay + Bandwidth"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Cisco OSPF uses a default reference bandwidth of 100 Mbps (10^8 bps). The interface cost is calculated as Reference Bandwidth / Interface Bandwidth. E.g., a 10 Mbps Ethernet link has a cost of 10 (100M / 10M). Reference: Cisco OSPF configuration guides.",
      "wrong": [
        "Hop count is the metric for RIP, not OSPF.",
        "Bandwidth and Delay are used by EIGRP for its composite metric calculations.",
        "Reliability is not used in OSPF cost calculations."
      ],
      "tip": "With a default reference bandwidth of 100 Mbps, FastEthernet (100M), GigabitEthernet (1G), and 10-Gigabit links all end up with a minimum cost of 1. You must increase the reference bandwidth to support links faster than 100 Mbps.",
      "memory": "OSPF Cost = 10^8 / Bandwidth.",
      "real": "Configure 'auto-cost reference-bandwidth 1000' globally to allow OSPF to distinguish between Gigabit (cost 1) and FastEthernet (cost 10) interfaces.",
      "commands": [
        "auto-cost reference-bandwidth 1000"
      ]
    }
  },
  {
    "id": 60,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer has configured Port Security on interface GigabitEthernet 0/10. A user connects a personal laptop through an unauthorized hub to the port, causing the interface to enter an error-disabled (err-disabled) state. Based on the port security output below, which violation mode is configured, and how must the engineer restore connectivity?",
    "options": [
      "The violation mode is 'Shutdown'. The engineer must issue 'shutdown' followed by 'no shutdown' on the interface, or configure 'errdisable recovery'.",
      "The violation mode is 'Restrict'. The port will automatically recover as soon as the unauthorized laptop is disconnected.",
      "The violation mode is 'Protect'. The engineer must reboot the switch to clear the dynamic MAC address database.",
      "The violation mode is 'Shutdown'. The interface will automatically recover in 300 seconds without administrative intervention."
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "The output shows the port is in 'Secure-shutdown' state and the violation mode is 'Shutdown'. When a port security violation occurs under the default shutdown mode, the switch immediately disables the port (err-disabled). To recover the port, an administrator must manually enter interface configuration mode, type 'shutdown' to administratively disable it, and then type 'no shutdown' to re-enable it. Alternatively, configuring global 'errdisable recovery cause psecure-violation' can automate this process. Reference: CCNA Volume 2, Chapter 6: Port Security.",
      "wrong": [
        "The violation mode is 'Shutdown', not 'Restrict'. Restrict mode drops offending frames and increments the violation counter but does not disable the port.",
        "The violation mode is 'Shutdown', not 'Protect'. Protect mode drops offending traffic silently without incrementing the counter or disabling the port.",
        "The port will not automatically recover without either manual shut/no-shut or configured 'errdisable recovery' commands."
      ],
      "tip": "Port Security violation modes: 1. Shutdown (err-disables port, logs syslog, increments counter), 2. Restrict (drops frames, logs syslog, increments counter), 3. Protect (drops frames silently, no counter increment).",
      "memory": "Shutdown = Shuts down the port completely. Restrict = Restricts access and alerts. Protect = Protects silently.",
      "real": "Port security is widely deployed in public areas (like conference rooms or reception desks) to prevent users from unplugging IP phones and connecting dynamic routing switches or hubs.",
      "commands": [
        "show port-security interface",
        "errdisable recovery cause psecure-violation",
        "shutdown",
        "no shutdown"
      ]
    },
    "cli": "Switch# show port-security interface gigabitEthernet 0/10\nPort Security              : Enabled\nPort State                 : Secure-shutdown\nViolation Mode             : Shutdown\nAging Time                 : 0 mins\nMax MAC Addresses          : 1\nTotal MAC Addresses        : 2\nConfigured MAC Addresses   : 0\nSticky MAC Addresses       : 0\nLast Source Address:Vlan   : 0011.22aa.bbcc:10\nSecurity Violation Count   : 1"
  },
  {
    "id": 61,
    "domain": "IP Connectivity",
    "topic": "Routing",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "A systems administrator has configured DHCP Snooping on an access switch. An untrusted user device attempts to reply to DHCP requests on interface GigabitEthernet 0/5. Based on the DHCP Snooping database and the interface status below, what action does the switch take?",
    "options": [
      "The switch forwards the DHCP server reply from Gi0/5 because DHCP snooping rate-limiting allows up to 15 packets per second.",
      "The switch drops the incoming DHCP server reply (such as a DHCP OFFER or ACK) on interface Gi0/5 because it is configured as an untrusted interface.",
      "The switch floods the DHCP server reply to all other ports in VLAN 10 to locate the true server.",
      "The switch automatically transitions Gi0/5 to a trusted state to prevent network service disruption."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "DHCP Snooping designates switch ports as trusted or untrusted. Trusted ports (typically uplinks to the core switch or DHCP server) are allowed to transmit all DHCP messages. Untrusted ports (typically downstream client access ports) are prohibited from sending DHCP server messages (such as OFFER, ACK, or Lease Active). If a DHCP server message is received on an untrusted port like Gi0/5, the switch immediately drops the frame to prevent rogue DHCP server attacks. Reference: CCNA Volume 2, Chapter 6: DHCP Snooping and DAI.",
      "wrong": [
        "The rate limit of 15 packets per second on Gi0/5 prevents DHCP starvation attacks, but it does not bypass the trust state checking for server messages.",
        "The switch does not flood the rogue DHCP reply; it drops it and generates a syslog message.",
        "The switch will not transition the port to trusted; it remains untrusted and will drop rogue server packets."
      ],
      "tip": "DHCP Snooping: Untrusted ports cannot send DHCP server packets (OFFER, ACK). Trusted ports can send any DHCP packets.",
      "memory": "DHCP Snooping: Clients connect to Untrusted ports, Servers connect to Trusted ports.",
      "real": "If a user brings a home Wi-Fi router to the office and plugs a LAN port into the wall outlet, DHCP Snooping prevents that router's DHCP server from hand-assigning invalid IP addresses to adjacent corporate clients.",
      "commands": [
        "show ip dhcp snooping",
        "show ip dhcp snooping binding",
        "ip dhcp snooping trust"
      ]
    },
    "cli": "Switch# show ip dhcp snooping\nSwitch DHCP snooping is enabled\nDHCP snooping is configured on following VLANs:\n10,20\nInsertion of option 82 is enabled\nInterface                  Trusted    Rate limit (pps)\n------------------------   -------    ----------------\nGigabitEthernet0/1         Yes        unlimited\nGigabitEthernet0/5         No         15"
  },
  {
    "id": 62,
    "domain": "IP Connectivity",
    "topic": "Static Routes",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "A systems administrator is deploying Dynamic ARP Inspection (DAI) on a corporate LAN to protect against ARP poisoning attacks. Given the switch configuration and current database states below, what happens when Switch-A receives a spoofed ARP response from a host on GigabitEthernet 0/4 claiming to own the router's IP address (10.1.1.1)?",
    "options": [
      "The switch forwards the ARP response because DAI does not validate IP addresses by default.",
      "The switch drops the ARP response because interface Gi0/4 is untrusted and there is no entry in the DHCP Snooping Binding database mapping Gi0/4 to IP 10.1.1.1.",
      "The switch updates its MAC address table and forwards the ARP packet to update client ARP caches.",
      "The switch forwards the packet but logs a warning message to the syslog server about a MAC mismatch."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Dynamic ARP Inspection (DAI) validates ARP packets on untrusted ports by comparing their IP-to-MAC mapping against the DHCP Snooping Binding Database. Since the host on Gi0/4 attempts to send an ARP packet with source IP 10.1.1.1 (the gateway router) but the DHCP snooping table has no active entry mapping Gi0/4 to 10.1.1.1 (the database only maps 00:11:22:33:44:55 to 10.1.1.99 on Gi0/3), the switch rejects and drops the invalid ARP packet. Reference: CCNA Volume 2, Chapter 6: DHCP Snooping and DAI.",
      "wrong": [
        "The switch does not forward the packet; DAI actively intercepts and drops mismatched IP-to-MAC ARP packets on untrusted ports.",
        "The switch does not update its MAC address table or forward the packet, which prevents the ARP poisoning attack from succeeding.",
        "The packet is dropped, not forwarded with a warning; the switch logs a security violation and discards the packet."
      ],
      "tip": "DAI depends on the DHCP Snooping database. Remember to configure 'ip arp inspection trust' on ports connected to other switches or routers.",
      "memory": "DAI = Protects ARP = Relies on DHCP Snooping Bindings.",
      "real": "DAI blocks tools like Ettercap or Cain & Abel from performing Man-in-the-Middle (MitM) attacks by spoofing the default gateway's MAC address.",
      "commands": [
        "ip arp inspection vlan 10",
        "ip arp inspection trust",
        "show ip arp inspection"
      ]
    },
    "cli": "Switch# show ip arp inspection vlan 10\nSource Mac Validation      : Disabled\nDestination Mac Validation : Disabled\nIP Address Validation      : Disabled\n\n VLAN Configuration    Status    Monitor Source\n ---- ---------------- --------- --------------\n   10 Active            DHCP-Snooping\n\nSwitch# show ip dhcp snooping binding\nMacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface\n------------------  ---------------  ----------  -------------  ----  ----------------\n00:11:22:33:44:55   10.1.1.99        86400       dhcp-snooping  10    GigabitEthernet0/3"
  },
  {
    "id": 63,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. What is the effect of configuring the OSPF command 'passive-interface GigabitEthernet0/1'?",
    "options": [
      "The interface will not send or receive OSPF Hellos, but its connected subnet will still be advertised to neighbors.",
      "OSPF will not run on the interface, and its subnet will not be advertised.",
      "The interface will block all incoming user data traffic.",
      "OSPF will negotiate a static neighbor relationship on that port."
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "The passive-interface command stops the router from sending and receiving OSPF Hello packets on that interface, preventing neighbor relationships from forming. However, the interface's subnet is still advertised in LSAs to other routers. Reference: Cisco OSPF configuration guides.",
      "wrong": [
        "The subnet is still advertised; it is not excluded from OSPF updates.",
        "Passive interface stops hello processing; it does not establish static neighbors.",
        "User data traffic is not blocked; only OSPF routing packets are stopped."
      ],
      "tip": "Configure passive-interface on ports connected to loopbacks, computers, or printers to save bandwidth and improve security.",
      "memory": "Passive interface: No hellos, but still advertised.",
      "real": "When configuring a router, make the user LAN interfaces passive to prevent users from starting rogue OSPF routers and injecting bad routes.",
      "commands": [
        "passive-interface GigabitEthernet0/1"
      ]
    }
  },
  {
    "id": 64,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "An administrator runs the command 'show ip ospf neighbor' and notices that the neighbor state for a switch link is stuck in '2-Way'. What does this state indicate?",
    "options": [
      "The router has failed to authenticate with its neighbor.",
      "The routers have negotiated bidirectional communication, and both are DRothers on a multi-access segment, which is normal behavior.",
      "The OSPF timer values are mismatched.",
      "There is an MTU mismatch preventing database exchange."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "On a multi-access network (like Ethernet), routers form full adjacencies only with the DR and BDR. DRothers (routers that are neither DR nor BDR) establish bidirectional communication (2-Way) and stop negotiating further. This is normal behavior. Reference: RFC 2328.",
      "wrong": [
        "MTU mismatches cause neighbors to get stuck in ExStart or Exchange states.",
        "Authentication failures prevent neighbors from reaching even the Init state.",
        "Timer mismatches prevent the neighbor state machine from starting."
      ],
      "tip": "DRothers will show a state of '2-WAY/DROTHER' when connected to each other.",
      "memory": "2-Way/DROTHER is normal for non-DR/BDR neighbors on a shared segment.",
      "real": "In a VLAN with 5 routers, only the DR and BDR will show 'FULL'. The other routers will show '2-WAY' with each other.",
      "commands": [
        "show ip ospf neighbor"
      ]
    }
  },
  {
    "id": 65,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which three parameters must match exactly between two adjacent OSPFv2 routers to form an adjacency?",
    "options": [
      "Interface IP Subnet and Subnet Mask",
      "Hello and Dead Intervals",
      "OSPF Process ID",
      "Router ID",
      "Area ID"
    ],
    "correct": [
      0,
      1,
      4
    ],
    "expl": {
      "correct": "A, B, E",
      "why": "To form an adjacency, routers must agree on Hello/Dead timers, Area ID, interface IP subnet/mask, and authentication. Reference: RFC 2328.",
      "wrong": [
        "The OSPF Process ID is locally significant and does not need to match between routers.",
        "The Router ID must be unique; duplicate Router IDs prevent adjacencies from forming.",
        "The interface IP address must belong to the same subnet, but host portions must be unique."
      ],
      "tip": "Mismatched parameters (especially timers) are the most common cause of OSPF adjacency issues.",
      "memory": "TAMS: Timers, Area, Mask, Subnet must match.",
      "real": "If you configure Router A with a hello interval of 10s and Router B with 15s, they will never establish an OSPF adjacency.",
      "commands": [
        "show ip ospf interface brief"
      ]
    }
  },
  {
    "id": 66,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which command is used to display OSPF neighbor relationships, their state, and their interface IPs?",
    "options": [
      "show ip route ospf",
      "show ip ospf neighbor",
      "show ip ospf interface",
      "show ip ospf database"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "'show ip ospf neighbor' displays details about OSPF neighbors, including their Router ID, state (e.g. FULL, 2-Way), address, and interface. Reference: Cisco OSPF command references.",
      "wrong": [
        "show ip route ospf displays OSPF routes installed in the routing table, not neighbor details.",
        "show ip ospf database shows LSAs, link states, and network structure.",
        "show ip ospf interface displays OSPF configuration settings on local interfaces."
      ],
      "tip": "Use 'show ip ospf neighbor' as your first step when troubleshooting OSPF routing issues.",
      "memory": "neighbor = neighbor state.",
      "real": "When verifying a newly configured WAN connection, run 'show ip ospf neighbor' to confirm the connection is in the 'FULL' state.",
      "commands": [
        "show ip ospf neighbor"
      ]
    }
  },
  {
    "id": 67,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. Why is it recommended to configure a Loopback interface on a router running OSPF?",
    "options": [
      "A loopback interface never goes down unless manually shut, providing a stable Router ID.",
      "OSPF requires at least one loopback interface to operate.",
      "Loopback interfaces encrypt routing updates automatically.",
      "Loopback interfaces speed up routing calculations."
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Physical interfaces can flap (go up and down), which can force OSPF to recalculate the Router ID and cause routing disruption. Loopbacks are virtual interfaces that remain up, providing a stable Router ID. Reference: Cisco OSPF design guides.",
      "wrong": [
        "Loopbacks do not affect the SPF algorithm's execution speed.",
        "OSPF does not require loopbacks to operate; it can use active physical IPs.",
        "Loopback interfaces do not provide encryption."
      ],
      "tip": "Configure a loopback IP (like 10.255.255.1/32) to ensure a stable OSPF RID and management IP.",
      "memory": "Loopback = Always Up = Stable Router ID.",
      "real": "Configure loopbacks on your core switches to provide a stable destination for network management tools and OSPF RIDs.",
      "commands": [
        "interface loopback 0",
        "ip address 1.1.1.1 255.255.255.255"
      ]
    }
  },
  {
    "id": 68,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which command configures an OSPF router to advertise its local default static route to all other routers in the OSPF area?",
    "options": [
      "ip route 0.0.0.0 0.0.0.0 interface",
      "default-router originate",
      "redistribute static subnets",
      "default-information originate"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "The 'default-information originate' command instructs OSPF to generate a default route (LSA Type 5) and advertise it to neighbors, provided a default static route is configured on the router. Reference: Cisco OSPF configuration guides.",
      "wrong": [
        "ip route defines a static route, but does not advertise it to OSPF neighbors.",
        "redistribute static advertises all static routes, but is not the recommended way to advertise default routes.",
        "default-router originate is incorrect syntax."
      ],
      "tip": "Use 'default-information originate always' to advertise the default route even if the router lacks a static default route in its table.",
      "memory": "default-information originate = Send default route via OSPF.",
      "real": "On the edge router connected to the ISP, run 'default-information originate' to configure internal routers to route outbound traffic through it.",
      "commands": [
        "default-information originate always"
      ]
    }
  },
  {
    "id": 69,
    "domain": "IP Connectivity",
    "topic": "Route Selection",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. A router receives an IPv6 packet destined for 2001:db8:acad:1::55. The routing table contains three matching routes. Which route will the router use to forward the packet?",
    "options": [
      "2001:db8:acad::/48 [110/10]",
      "2001:db8:acad:1::/64 [90/2000]",
      "2001:db8::/32 [110/100]",
      "2001:db8:acad:1::55/128 [1/0]"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Like IPv4, IPv6 routing uses Longest Prefix Match. Address 2001:db8:acad:1::55 matches /128 (host route), /64, /48, and /32. The router selects the /128 host route because it is the most specific match. Reference: RFC 4291.",
      "wrong": [
        "2001:db8:acad::/48 has a shorter prefix (/48 vs /128).",
        "2001:db8:acad:1::/64 has a shorter prefix (/64 vs /128).",
        "2001:db8::/32 has the shortest prefix match, which is less preferred."
      ],
      "tip": "Host routes in IPv6 have a /128 prefix, whereas IPv4 host routes use /32.",
      "memory": "Longest prefix always wins in both IPv4 and IPv6.",
      "real": "Use a /128 host route when defining static routes to target virtual endpoints, like loopbacks or management portals.",
      "commands": [
        "show ipv6 route"
      ]
    }
  },
  {
    "id": 70,
    "domain": "IP Connectivity",
    "topic": "Static Routes",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which command configures an IPv6 static default route pointing to the next-hop address 2001:db8:a::1?",
    "options": [
      "ipv6 route 2001:db8:a::1 ::/0",
      "ip route ::/0 2001:db8:a::1",
      "ipv6 route ::/0 2001:db8:a::1",
      "ipv6 route default 2001:db8:a::1"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "In IPv6, the default route is represented by '::/0' (all zeros prefix with length 0). The command syntax is 'ipv6 route <prefix> <next-hop>'. Reference: Cisco IPv6 configuration guides.",
      "wrong": [
        "Listing the next-hop before the destination is invalid syntax.",
        "The keyword 'default' is not used in static route commands.",
        "The 'ip route' command is for IPv4; IPv6 routes must use 'ipv6 route'."
      ],
      "tip": "Ensure 'ipv6 unicast-routing' is enabled globally on the router before configuring IPv6 routing.",
      "memory": "ipv6 route ::/0 NEXT_HOP.",
      "real": "On an enterprise edge router, configure an IPv6 default route pointing to the ISP's IPv6 gateway interface.",
      "commands": [
        "ipv6 unicast-routing",
        "ipv6 route ::/0 2001:db8:a::1"
      ]
    }
  },
  {
    "id": 71,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "A network automation engineer is writing a Python script to retrieve interface statistics from a Cisco IOS XE router using RESTCONF. Based on the RFC 8040 standard and RESTCONF conventions, which HTTP method, URL path, and headers are correct for retrieving the operational state of the Gig0/1 interface?",
    "options": [
      "GET to https://router/restconf/data/ietf-interfaces:interfaces-state/interface=GigabitEthernet1 with header 'Accept: application/yang-data+json'",
      "POST to https://router/restconf/operations/ietf-interfaces:interfaces/interface/GigabitEthernet1 with header 'Content-Type: application/xml'",
      "PUT to https://router/restconf/data/ietf-interfaces:interfaces-state/interface=GigabitEthernet1 with header 'Accept: application/json'",
      "GET to https://router/restconf/operational/ietf-interfaces:interfaces/interface/GigabitEthernet1 with header 'Accept: application/yang-data+xml'"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "RESTCONF uses HTTP GET requests to read data. Under RESTCONF (RFC 8040), the root resource path is '/restconf/data/'. Operational state data (like statistics) is modeled under the 'ietf-interfaces:interfaces-state' container, and key leaf elements are specified using the '=' syntax (e.g. 'interface=GigabitEthernet1'). The Accept header must specify 'application/yang-data+json' (or +xml) to return the payload in the correct format. Reference: CCNA Volume 2, Chapter 19: RESTCONF/NETCONF and YANG.",
      "wrong": [
        "POST is used to create resources or invoke operations, not to retrieve state statistics.",
        "PUT is used to replace/modify existing configuration resources, not to retrieve state.",
        "The path root '/restconf/operational' is invalid; RESTCONF uses '/restconf/data/' for both configuration and state data."
      ],
      "tip": "RESTCONF root path = /restconf/data/. Accept and Content-Type headers for RESTCONF must use 'application/yang-data+json' or 'application/yang-data+xml'.",
      "memory": "RESTCONF: GET = Read, POST = Create, PUT = Replace/Create, PATCH = Merge/Update, DELETE = Remove.",
      "real": "Automation scripts query operational paths to feed interface bandwidth data directly to Grafana dashboards or network monitoring engines.",
      "commands": [
        "restconf",
        "show running-config | i restconf"
      ]
    }
  },
  {
    "id": 72,
    "domain": "IP Connectivity",
    "topic": "Routing",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. What is the specific MAC address prefix range reserved for Hot Standby Router Protocol (HSRP) version 1 virtual MAC addresses?",
    "options": [
      "0000.0c9f.f000 to 0000.0c9f.fFFF",
      "0000.0c07.ac00 to 0000.0c07.acFF",
      "0007.b400.0000 to 0007.b4FF.FFFF",
      "0100.5E00.0000 to 0100.5EFF.FFFF"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "HSRP version 1 uses the virtual MAC address block 0000.0c07.acXX, where XX is the hexadecimal HSRP group number (from 00 to FF). Reference: RFC 2281.",
      "wrong": [
        "0100.5E00.0000 is the MAC address range for IPv4 multicast traffic.",
        "0000.0c9f.f000 is the virtual MAC address range for HSRP version 2.",
        "0007.b400.0000 is the virtual MAC address range for GLBP."
      ],
      "tip": "HSRP v1 virtual MAC ends with 07.acXX. HSRP v2 virtual MAC ends with 9f.fXXX. Knowing this helps you identify group details from packet captures.",
      "memory": "07.ac is HSRP v1. 9f.f is HSRP v2.",
      "real": "If a host has an ARP entry for gateway IP 192.168.1.1 mapping to MAC 0000.0c07.ac05, it indicates that HSRP Group 5 is active on the gateway.",
      "commands": [
        "show standby"
      ]
    }
  },
  {
    "id": 73,
    "domain": "IP Connectivity",
    "topic": "Static Routes",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "An engineer configures a static route on a Cisco router using the command 'ip route 10.0.0.0 255.255.255.0 192.168.1.2'. If no administrative distance is explicitly specified at the end of the statement, what is its default administrative distance, and how does it compare to OSPF?",
    "options": [
      "Administrative Distance of 110, which load-balances with OSPF paths",
      "Administrative Distance of 90, which is preferred over EIGRP",
      "Administrative Distance of 0, which is preferred over directly connected interfaces",
      "Administrative Distance of 1, which is preferred over OSPF (AD 110)"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "A static route defaults to an Administrative Distance (AD) of 1. Since 1 is lower than OSPF's AD of 110, the static route is more trusted and is preferred in the routing table. Reference: CCNA Volume 1, Chapter 16: Configuring IPv4 Addresses and Static Routes.",
      "wrong": [
        "Directly connected interfaces have an AD of 0; static routes cannot have an AD of 0.",
        "A static route does not default to AD 110, so it cannot load-balance with OSPF unless configured as a floating static route with AD 110.",
        "EIGRP has a default AD of 90; a default static route (AD 1) is preferred over EIGRP."
      ],
      "tip": "Administrative Distance order: Connected (0) < Static (1) < EIGRP (90) < OSPF (110) < RIP (120).",
      "memory": "Static route = AD 1.",
      "real": "If a dynamic route goes offline, a floating static route configured with AD 120 (backup for OSPF) automatically installs in the routing table.",
      "commands": [
        "ip route 10.0.0.0 255.255.255.0 192.168.1.2 120"
      ]
    }
  },
  {
    "id": 74,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which command changes the OSPF reference bandwidth to 10 Gbps (10000 Mbps) to ensure OSPF cost calculations can differentiate between Gigabit and 10-Gigabit links?",
    "options": [
      "auto-cost reference-bandwidth 10000",
      "bandwidth 10000000",
      "ospf reference-bandwidth 10g",
      "ip ospf cost 10"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "The command 'auto-cost reference-bandwidth <Mbps>' changes the OSPF reference bandwidth. Configuring it to 10000 (10000 Mbps or 10 Gbps) updates the formula, giving 10G links a cost of 1 and Gigabit links a cost of 10. Reference: Cisco OSPF configuration guides.",
      "wrong": [
        "The interface 'bandwidth' command changes routing protocol metric calculations, but does not adjust the global OSPF reference bandwidth.",
        "'ip ospf cost' manually sets the cost on a single interface, but does not change the global reference scale.",
        "'ospf reference-bandwidth 10g' is invalid command syntax."
      ],
      "tip": "Run the auto-cost reference-bandwidth command on all routers in the OSPF domain to keep costs consistent.",
      "memory": "auto-cost reference-bandwidth 10000 sets the reference to 10 Gbps.",
      "real": "During a network upgrade to 10G links, configure 'auto-cost reference-bandwidth' to prevent OSPF from routing traffic over slower backup Gigabit links.",
      "commands": [
        "auto-cost reference-bandwidth 10000"
      ]
    }
  },
  {
    "id": 75,
    "domain": "IP Connectivity",
    "topic": "Static Routes",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. What happens to a static route in the routing table if its exit interface transitions to a down state?",
    "options": [
      "The router changes the next-hop IP to 127.0.0.1.",
      "The router queries OSPF to locate a backup path.",
      "The route is removed from the routing table until the interface comes back up.",
      "The route remains in the table but marked as inactive."
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "A static route is valid only if the exit interface is up and the next-hop IP is reachable. If the interface goes down, the route is removed from the active routing table. Reference: Cisco IOS routing guidelines.",
      "wrong": [
        "Inactive routes are not kept in the active routing table.",
        "The router does not query routing protocols automatically; static routes must be updated manually unless a dynamic protocol installs a backup.",
        "The next-hop address is not modified automatically."
      ],
      "tip": "Using an exit interface that can flap (like Ethernet) can cause the static route to drop out. You can use IP SLA to track reachability and manage the route status.",
      "memory": "Interface down = Static route gone.",
      "real": "If you configure a static route pointing to an external switch interface and the fiber link breaks, the route drops out, allowing a floating static route to take over.",
      "commands": [
        "show ip route"
      ]
    }
  },
  {
    "id": 76,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "An administrator is reviewing a NETCONF session log between a Python script using ncclient and a Cisco IOS XE switch. The script transmits the XML payload shown below. Which NETCONF operation and data model structure are being used?",
    "options": [
      "A NETCONF <get-config> operation using the ietf-interfaces YANG data model.",
      "A NETCONF <edit-config> operation modifying the running configuration using the ietf-interfaces YANG data model.",
      "A RESTCONF POST operation modifying the interface description using XML formatting.",
      "A NETCONF <copy-config> operation copying files from a TFTP server using a custom XML parser."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "The XML payload uses the `<edit-config>` tag, which is the NETCONF operation used to modify a device configuration. The `<target>` specifies `<running/>`, indicating it is modifying the active running configuration. The configuration details use the namespace `urn:ietf:params:xml:ns:yang:ietf-interfaces`, which represents the standard IETF YANG data model for configuring interfaces. Reference: CCNA Volume 2, Chapter 19: RESTCONF/NETCONF and YANG.",
      "wrong": [
        "The XML payload uses `<edit-config>`, not `<get-config>`. `<get-config>` is used to retrieve configuration data.",
        "The payload represents a NETCONF transaction, not RESTCONF. RESTCONF does not wrap payloads in `<rpc>` tags.",
        "The payload is not performing a `<copy-config>` operation, which is used to copy an entire configuration to/from a target."
      ],
      "tip": "NETCONF uses SSH port 830 by default and transmits payloads wrapped in Remote Procedure Calls (RPC) using XML formatting. YANG defines the structure of the data inside the XML payload.",
      "memory": "NETCONF = SSH Port 830 = XML RPC. YANG = The blueprint/structure.",
      "real": "Engineers use NETCONF to automate configuration templates on core switches, ensuring that interface descriptions and VLAN assignments conform to standard configurations.",
      "commands": [
        "netconf-yang",
        "show netconf-yang sessions"
      ]
    },
    "cli": "<rpc message-id=\"101\" xmlns=\"urn:ietf:params:xml:ns:netconf:base:1.0\">\n  <edit-config>\n    <target>\n      <running/>\n    </target>\n    <config>\n      <interfaces xmlns=\"urn:ietf:params:xml:ns:yang:ietf-interfaces\">\n        <interface>\n          <name>GigabitEthernet1/0/1</name>\n          <description>Configured via NETCONF</description>\n          <enabled>true</enabled>\n        </interface>\n      </interfaces>\n    </config>\n  </edit-config>\n</rpc>"
  },
  {
    "id": 77,
    "domain": "IP Connectivity",
    "topic": "Static Routes",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. When configuring an IPv6 static route using a link-local next-hop address (FE80::/10), what additional parameter must be specified in the command?",
    "options": [
      "The next-hop link-local address is sufficient.",
      "The local exit interface.",
      "The next-hop global unicast address.",
      "An Administrative Distance of 2."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Because link-local addresses are only valid on the local link, the same address (like FE80::1) can exist on multiple interfaces. The router needs the local exit interface specified to know which link to send the traffic out of. Reference: RFC 4291.",
      "wrong": [
        "Specifying only the link-local address is insufficient and will return a command line error.",
        "You do not need to specify a global unicast address when routing via link-local.",
        "The AD does not resolve link-local routing ambiguity."
      ],
      "tip": "The correct command format is: 'ipv6 route <prefix> <exit-interface> <link-local-next-hop>'.",
      "memory": "Link-local static route = Link-local IP + Exit Interface.",
      "real": "Configure a static route to a neighbor router using its link-local address: 'ipv6 route 2001:db8:b::/64 GigabitEthernet0/0 fe80::1'.",
      "commands": [
        "ipv6 route 2001:db8:b::/64 gigabitethernet0/0 fe80::1"
      ]
    }
  },
  {
    "id": 78,
    "domain": "IP Connectivity",
    "topic": "Routing",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. In the output of the 'show ip route' command on a Cisco router, which character code identifies a route learned via EIGRP?",
    "options": [
      "E",
      "D",
      "O",
      "I"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "In Cisco IOS, EIGRP routes are marked with 'D', which stands for the DUAL (Diffusing Update Algorithm) used by EIGRP. Reference: Cisco routing table documentation.",
      "wrong": [
        "E stands for EGP (Exterior Gateway Protocol), not EIGRP.",
        "O is for OSPF.",
        "I is for IS-IS."
      ],
      "tip": "Remember that 'D' is EIGRP because of the DUAL algorithm.",
      "memory": "EIGRP uses D for DUAL.",
      "real": "When verifying a dual-protocol migration, check that routes have transitioned from 'O' (OSPF) to 'D' (EIGRP) as expected.",
      "commands": [
        "show ip route"
      ]
    }
  },
  {
    "id": 79,
    "domain": "IP Connectivity",
    "topic": "Route Selection",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which two factors are compared by a router to select the best path when it learns multiple routes to the exact same destination prefix from different routing sources?",
    "options": [
      "Routing Metric",
      "Administrative Distance (AD)",
      "Next-Hop IP address parity",
      "Prefix Length"
    ],
    "correct": [
      1,
      3
    ],
    "expl": {
      "correct": "B, D",
      "why": "To route a packet, the router first checks the Prefix Length (longest match). If there are multiple routes to the same destination prefix, it uses Administrative Distance (AD) to select the most trusted route source. Reference: Cisco route selection principles.",
      "wrong": [
        "Bandwidth speed is used by OSPF or EIGRP to calculate metrics, but not by the global routing table to compare different protocols.",
        "Process ID is locally significant and does not affect route selection.",
        "The OSPF metric cost is compared only when comparing routes from the same OSPF process."
      ],
      "tip": "First check: Prefix Length (most specific wins). Second check: Administrative Distance (lowest wins). Third check (if same protocol): Metric (lowest wins).",
      "memory": "Prefix -> AD -> Metric.",
      "real": "If a router has routes for 10.1.1.0/24 (via OSPF) and 10.1.1.0/24 (via Static), it selects the static route because of its lower AD (1 vs 110).",
      "commands": [
        "show ip route"
      ]
    }
  },
  {
    "id": 80,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. OSPF neighbors are stuck in the 'ExStart' or 'Exchange' state. What is the most common cause of this issue?",
    "options": [
      "Mismatched MTU settings on the connecting interfaces",
      "Mismatched OSPF Process IDs",
      "Duplicate IP addresses on the link",
      "Mismatched OSPF Hello timers"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "During ExStart and Exchange, routers negotiate master/slave roles and exchange Database Description (DBD) packets. If the MTU is mismatched, the router with the smaller MTU will drop DBD packets that exceed its MTU limit, leaving the neighbor adjacency stuck. Reference: Cisco OSPF troubleshooting.",
      "wrong": [
        "Mismatched Hello timers prevent neighbors from reaching even the Init state.",
        "Process IDs are locally significant and do not affect neighbor adjacencies.",
        "Duplicate IPs on the link prevent bidirectional communication and hello processing."
      ],
      "tip": "Use the command 'ip ospf mtu-ignore' to bypass the MTU check if you cannot change the physical interface MTU.",
      "memory": "ExStart/Exchange stuck = MTU mismatch.",
      "real": "When configuring OSPF over a WAN connection (like Metro Ethernet), ensure the MTU is set consistently on both sides to prevent neighbor negotiation failures.",
      "commands": [
        "ip ospf mtu-ignore"
      ]
    }
  },
  {
    "id": 81,
    "domain": "IP Services",
    "topic": "NAT",
    "type": "matching",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Match the NAT translation terms to their correct definitions.",
    "pairs": [
      [
        "Inside Local",
        "The IP address assigned to a host on the inside network (typically private RFC 1918)."
      ],
      [
        "Inside Global",
        "The public IP address that represents an inside host to the outside network."
      ],
      [
        "Outside Global",
        "The public IP address assigned to a host on the outside network by its owner."
      ],
      [
        "Outside Local",
        "The IP address of an outside host as it appears to the inside network."
      ]
    ],
    "expl": {
      "correct": "Matching",
      "why": "Inside Local is the private host IP. Inside Global is the public translated IP. Outside Global is the actual public IP of the external host. Outside Local is the IP of the external host as seen from the private network. Reference: Cisco NAT terminology guidelines.",
      "wrong": [
        "Inside Global is not the private address; it is the public address that represent private hosts externally.",
        "Outside Local is not a public address used on the public internet; it is an internal representation of an external host.",
        "NAT terms do not refer to dynamic MAC addresses or switchport encapsulation types."
      ],
      "tip": "Inside = Local Network. Outside = External Network. Local = Inside perspective. Global = Outside perspective.",
      "memory": "Local = Private IP. Global = Public IP.",
      "real": "When configuring NAT, the router translates packets by replacing the Inside Local source address (192.168.1.50) with the Inside Global address (203.0.113.10).",
      "commands": [
        "show ip nat translations"
      ]
    }
  },
  {
    "id": 82,
    "domain": "IP Services",
    "topic": "NAT",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which command configures a static NAT translation to map the internal server IP 10.1.1.10 to the public IP address 203.0.113.10?",
    "options": [
      "ip nat outside source static 203.0.113.10 10.1.1.10",
      "ip nat translation static 10.1.1.10 203.0.113.10",
      "ip nat inside source static 10.1.1.10 203.0.113.10",
      "ip nat static inside 10.1.1.10 global 203.0.113.10"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "The command 'ip nat inside source static <local-ip> <global-ip>' configures a one-to-one static translation mapping an internal address to an external address. Reference: Cisco NAT configuration guides.",
      "wrong": [
        "Mapping the outside source is used to translate external addresses, not internal servers.",
        "'ip nat static inside' is invalid Cisco IOS command syntax.",
        "'ip nat translation static' is incorrect syntax."
      ],
      "tip": "Ensure you configure 'ip nat inside' on the internal interface and 'ip nat outside' on the internet interface for translations to work.",
      "memory": "ip nat inside source static LOCAL GLOBAL.",
      "real": "Configure static NAT to allow external internet users to access an internal web server at its public address (203.0.113.10).",
      "commands": [
        "ip nat inside source static 10.1.1.10 203.0.113.10"
      ]
    }
  },
  {
    "id": 83,
    "domain": "IP Services",
    "topic": "NAT",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. A router is configured with dynamic NAT using an IP pool. What happens to subsequent inside host packets if all addresses in the public pool are exhausted?",
    "options": [
      "The router routes the packets without translating them.",
      "The router dynamically requests more IP addresses from the ISP.",
      "The router drops the packets and sends an ICMP destination unreachable message.",
      "The router automatically switches to PAT (overload) mode."
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "Under dynamic NAT, each active host requires a one-to-one mapping from the pool. If the pool runs out of addresses, any new host traffic matching the NAT access list is dropped until an existing translation expires. Reference: Cisco NAT guides.",
      "wrong": [
        "The router will not forward private RFC 1918 packets to the public internet untranslated.",
        "The router will not enable PAT automatically; you must configure the 'overload' keyword to activate port translation.",
        "Routers cannot request extra public IPs from ISPs dynamically."
      ],
      "tip": "To prevent pool exhaustion, configure Port Address Translation (PAT) by appending the 'overload' keyword to the NAT command.",
      "memory": "Pool empty = Packets dropped.",
      "real": "If users report internet loss, check the translation table. A small NAT pool will run out of addresses quickly under load, requiring a transition to PAT.",
      "commands": [
        "show ip nat statistics"
      ]
    }
  },
  {
    "id": 84,
    "domain": "IP Services",
    "topic": "NAT",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which command configures Port Address Translation (PAT) to overload internal traffic onto the public IP address of the GigabitEthernet0/0 interface?",
    "options": [
      "ip nat overload list 1 interface GigabitEthernet0/0",
      "ip nat inside source list 1 interface GigabitEthernet0/0 overload",
      "ip nat inside source list 1 pool overload",
      "ip nat PAT list 1 interface GigabitEthernet0/0"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "The command 'ip nat inside source list <acl> interface <interface> overload' configures PAT, using port numbers to multiplex multiple inside hosts onto the single IP of the exit interface. Reference: Cisco NAT guides.",
      "wrong": [
        "Specifying a pool without the interface name does not overload onto the interface IP.",
        "'ip nat overload' is invalid command syntax.",
        "The keyword 'PAT' is not used in Cisco IOS configuration commands."
      ],
      "tip": "The key to enabling PAT is the 'overload' keyword at the end of the command.",
      "memory": "overload = PAT = share one IP using port numbers.",
      "real": "Most home and branch office routers use PAT to translate all internal user traffic using the single public IP assigned to the WAN port.",
      "commands": [
        "ip nat inside source list 1 interface GigabitEthernet0/0 overload"
      ]
    }
  },
  {
    "id": 85,
    "domain": "IP Services",
    "topic": "NAT",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which command displays active NAT translations on a Cisco router, including protocols, ports, and IP addresses?",
    "options": [
      "show ip nat table",
      "show translation rules",
      "show ip nat statistics",
      "show ip nat translations"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "'show ip nat translations' displays all active NAT translations, including translation type, protocol, and inside/outside local/global IP addresses. Reference: Cisco NAT command references.",
      "wrong": [
        "show ip nat statistics shows pool sizes, configuration details, and translation counts, but not individual translations.",
        "show ip nat table is invalid command syntax.",
        "show translation rules is not a Cisco IOS NAT command."
      ],
      "tip": "Use 'clear ip nat translation *' to clear the translation table during testing.",
      "memory": "translations = active translation mapping table.",
      "real": "When troubleshooting web access, run 'show ip nat translations' to verify that translation entries are created when client traffic passes through.",
      "commands": [
        "show ip nat translations"
      ]
    }
  },
  {
    "id": 86,
    "domain": "IP Services",
    "topic": "NTP",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. Which command configures a Cisco device to synchronize its system clock with an external time source at IP address 203.0.113.50?",
    "options": [
      "ntp peer 203.0.113.50",
      "clock set 203.0.113.50",
      "ntp master 203.0.113.50",
      "ntp server 203.0.113.50"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "The command 'ntp server <IP>' configures the device to act as an NTP client, regularly querying the specified server for time synchronization. Reference: RFC 5905.",
      "wrong": [
        "ntp master configures the local device to act as an authoritative NTP clock source, not sync to an external server.",
        "clock set is a manual runtime command, not a server sync command.",
        "ntp peer configures symmetric active mode, where two devices synchronize with each other as equals."
      ],
      "tip": "NTP uses UDP port 123 for all time synchronization traffic.",
      "memory": "ntp server IP.",
      "real": "Configure NTP on all switches and routers in your network to ensure syslog messages have consistent timestamps for auditing.",
      "commands": [
        "ntp server 203.0.113.50"
      ]
    }
  },
  {
    "id": 87,
    "domain": "IP Services",
    "topic": "NTP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network engineer is configuring network time synchronization. Which of the following is a characteristic of an NTP Stratum 0 device, and how do downstream clients query it?",
    "options": [
      "It is an authoritative physical time source (such as an atomic clock or GPS receiver) that cannot be directly queried over a network",
      "It is a backup time source with a metric of 16, representing an unsynchronized state",
      "It is a Cisco router acting as a master NTP server with default stratum settings",
      "It is a network-attached time server that synchronizes clients directly via UDP port 123"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Stratum 0 devices are physical timekeeping instruments (atomic clocks, GPS systems). They cannot be queried directly over a network; instead, they are attached to servers that act as Stratum 1 servers. Reference: CCNA Volume 2, Chapter 9: Device Management Protocols.",
      "wrong": [
        "Stratum 1 servers, not Stratum 0, are network-attached and directly queried over the network via UDP port 123.",
        "Stratum 16 represents an unsynchronized/offline state in NTP.",
        "A Cisco router cannot act as a Stratum 0 device; it can only act as a stratum master (typically Stratum 1 or higher)."
      ],
      "tip": "Stratum 0 = Reference clock (GPS/Atomic). Stratum 1 = Server connected to Stratum 0. Stratum 2 = Client connected to Stratum 1.",
      "memory": "Stratum 0 = Earth-based clocks (zero network hops).",
      "real": "Local domain controllers synchronize with public Stratum 1 servers over the internet to distribute time to internal Stratum 2 clients.",
      "commands": [
        "show ntp status"
      ]
    }
  },
  {
    "id": 88,
    "domain": "IP Services",
    "topic": "DHCP",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. A host on VLAN 10 needs to receive an IP address from a DHCP server located on VLAN 20. What command must be applied to the router's VLAN 10 interface to facilitate this?",
    "options": [
      "ip helper-address 10.1.20.10 (DHCP Server IP)",
      "ip helper-address 255.255.255.255",
      "dhcp relay destination 10.1.20.10",
      "ip forward-protocol dhcp"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "DHCP Discover packets are sent as local broadcasts, which routers drop. The 'ip helper-address <IP>' command configures the router to act as a DHCP relay agent, forwarding these local broadcasts to the DHCP server as unicast packets. Reference: Cisco IP services configuration guides.",
      "wrong": [
        "ip forward-protocol modifies which ports are forwarded, but does not configure the relay target IP.",
        "dhcp relay destination is invalid command syntax.",
        "Setting the helper-address to broadcast keeps the packet local, failing to relay it."
      ],
      "tip": "Configure the ip helper-address command on the gateway interface (the SVI or subinterface) that receives the client's broadcast traffic.",
      "memory": "ip helper-address SERVER_IP.",
      "real": "If computers in the branch office cannot get IP addresses from the central DHCP server, check that 'ip helper-address' is configured on the branch router's client-facing interface.",
      "commands": [
        "ip helper-address 10.1.20.10"
      ]
    }
  },
  {
    "id": 89,
    "domain": "IP Services",
    "topic": "Syslog",
    "type": "matching",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. Match the Syslog severity levels to their correct descriptive names.",
    "pairs": [
      [
        "Severity 0",
        "Emergency (System is unusable)"
      ],
      [
        "Severity 3",
        "Error (Error conditions)"
      ],
      [
        "Severity 5",
        "Notification (Normal but significant condition)"
      ],
      [
        "Severity 7",
        "Debugging (Debugging messages)"
      ]
    ],
    "expl": {
      "correct": "Matching",
      "why": "Syslog defines severity levels from 0 (Emergency) to 7 (Debugging). Lower numbers indicate more critical events. Reference: RFC 5424.",
      "wrong": [
        "Severity 7 is not Emergency; it is Debugging (lowest severity).",
        "Severity 0 is Emergency (highest severity), not Debugging.",
        "Severity levels 1 (Alert) and 2 (Critical) represent highly urgent states, but they are not the lowest level of severity."
      ],
      "tip": "Use the mnemonic 'Every Awesome Cisco Engineer Will Need Daily Corrections' to remember the levels: Emergency (0), Alert (1), Critical (2), Error (3), Warning (4), Notification (5), Informational (6), Debugging (7).",
      "memory": "0 = Emergency (worst). 7 = Debugging (informational).",
      "real": "Configure 'logging trap notifications' (level 5) on routers to log interface state changes without flooding the syslog server with debugging logs.",
      "commands": [
        "logging trap 5"
      ]
    }
  },
  {
    "id": 90,
    "domain": "IP Services",
    "topic": "DNS",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which transport protocol and port number are utilized by default when a client computer sends a DNS query to a DNS server?",
    "options": [
      "UDP Port 67",
      "TCP Port 53",
      "TCP Port 80",
      "UDP Port 53"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Client DNS queries are small and require low overhead, so they use UDP port 53. DNS zone transfers between servers use TCP port 53. Reference: RFC 1035.",
      "wrong": [
        "TCP Port 53 is used for DNS zone transfers, not default client queries.",
        "TCP Port 80 is for HTTP traffic.",
        "UDP Port 67 is used by DHCP servers, not DNS."
      ],
      "tip": "DNS uses both UDP and TCP on port 53 depending on packet size and request type.",
      "memory": "DNS Query = UDP 53.",
      "real": "Ensure that egress firewalls permit UDP port 53 traffic to allow internal hosts to resolve domain names on the internet.",
      "commands": [
        "show ip dns view"
      ]
    }
  },
  {
    "id": 91,
    "domain": "IP Services",
    "topic": "DHCP",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A systems administrator is configuring a Cisco device. Which command excludes the IP addresses 192.168.1.1 through 192.168.1.10 from being assigned by a DHCP pool on a Cisco router?",
    "options": [
      "ip dhcp excluded-address 192.168.1.1 192.168.1.10",
      "no ip dhcp pool range 192.168.1.1 192.168.1.10",
      "ip dhcp pool exclude 192.168.1.1 192.168.1.10",
      "exclude-address 192.168.1.1 192.168.1.10"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "The command 'ip dhcp excluded-address <start-ip> <end-ip>' prevents the router from assigning those addresses to clients, reserving them for static assignments (like routers, switches, and printers). Reference: Cisco DHCP server guides.",
      "wrong": [
        "no ip dhcp pool range is invalid command syntax.",
        "ip dhcp pool exclude is incorrect syntax.",
        "exclude-address is not a valid global configuration command."
      ],
      "tip": "Configure excluded addresses in global configuration mode, not under the DHCP pool configuration mode.",
      "memory": "ip dhcp excluded-address START END.",
      "real": "When configuring a new DHCP pool, exclude the first 10 IP addresses to reserve them for gateways, switches, and local servers.",
      "commands": [
        "ip dhcp excluded-address 192.168.1.1 192.168.1.10"
      ]
    }
  },
  {
    "id": 92,
    "domain": "IP Services",
    "topic": "SNMP",
    "type": "multi",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "Medium",
    "text": "Which two security mechanisms were introduced in SNMPv3 to resolve the security vulnerabilities of SNMPv1 and SNMPv2c?",
    "options": [
      "Cryptographic Authentication (using SHA or MD5)",
      "Community Strings",
      "Packet Encryption (Privacy using AES or DES)",
      "Dynamic Port Allocation"
    ],
    "correct": [
      0,
      2
    ],
    "expl": {
      "correct": "A, C",
      "why": "SNMPv3 introduces security models that provide message integrity, authentication (SHA/MD5), and encryption (DES/AES) to protect management traffic from snooping and tampering. Reference: RFC 3414.",
      "wrong": [
        "Community strings are clear-text passwords used in SNMPv1 and SNMPv2c, which are vulnerable to sniffing.",
        "SNMPv3 still uses standard UDP ports (161/162) and does not use dynamic port allocation.",
        "SNMPv3 does not introduce new transport layers; it continues to run over UDP."
      ],
      "tip": "SNMPv3 has three security levels: noAuthNoPriv (no auth, no encryption), authNoPriv (auth, no encryption), and authPriv (both auth and encryption).",
      "memory": "SNMPv3 = Auth (hash) + Priv (encryption).",
      "real": "Configure SNMPv3 with authPriv mode using SHA and AES when setting up device monitoring over public WAN links.",
      "commands": [
        "snmp-server group v3group v3 priv"
      ]
    }
  },
  {
    "id": 93,
    "domain": "Security Fundamentals",
    "topic": "ACLs",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "According to Cisco security guidelines, where should standard and extended Access Control Lists (ACLs) be placed on a network relative to traffic flow?",
    "options": [
      "Standard on inbound interfaces; Extended on outbound interfaces only",
      "Standard close to destination; Extended close to source",
      "Both as close to the internet gateway as possible",
      "Standard close to source; Extended close to destination"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Standard ACLs match only source IP addresses and should be placed close to the destination to prevent blocking legitimate traffic. Extended ACLs match source, destination, protocol, and ports, and should be placed close to the source to filter traffic early and conserve bandwidth. Reference: Cisco ACL placement guidelines.",
      "wrong": [
        "Placing standard ACLs close to the source will block all traffic from that host, even traffic destined for allowed segments.",
        "Applying ACLs only at the internet gateway leaves the internal network unprotected from local traffic.",
        "ACL placement is based on traffic direction and matching capability, not interface labels."
      ],
      "tip": "Standard ACL: Close to destination. Extended ACL: Close to source.",
      "memory": "Standard = Destination (SD). Extended = Source (ES).",
      "real": "To block a department from accessing the finance server, place an extended ACL on the department's access switch interface to drop the traffic immediately.",
      "commands": [
        "show ip access-lists"
      ]
    }
  },
  {
    "id": 94,
    "domain": "Security Fundamentals",
    "topic": "ACLs",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "15%",
    "frequency": "High",
    "text": "A systems administrator is configuring a Cisco device. Which command configures a standard access list entry numbered 10 to deny traffic from host 10.1.1.5 while allowing all other traffic?",
    "options": [
      "access-list 10 deny 10.1.1.5 0.0.0.0",
      "access-list 10 deny host 10.1.1.5",
      "access-list 10 deny host 10.1.1.5\naccess-list 10 permit any",
      "access-list 10 deny 10.1.1.5 255.255.255.255"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "All Cisco ACLs contain an implicit 'deny any' at the end. To deny a single host and allow others, you must configure the deny statement followed by 'access-list 10 permit any'. Reference: Cisco ACL configuration guides.",
      "wrong": [
        "Denying the host with a wildcard mask of 255.255.255.255 denies all traffic, and it lacks the permit statement.",
        "Without a 'permit any' statement, the implicit deny will block all traffic matching this ACL.",
        "This option lacks the permit statement to allow other traffic."
      ],
      "tip": "Every ACL must have at least one permit statement, or it will block all traffic due to the implicit deny.",
      "memory": "Deny host -> Permit any. Don't forget the implicit deny.",
      "real": "When configuring a management restriction ACL, deny unauthorized hosts and permit your management station IP before applying it to the VTY lines.",
      "commands": [
        "access-list 10 deny host 10.1.1.5",
        "access-list 10 permit any"
      ]
    }
  },
  {
    "id": 95,
    "domain": "Security Fundamentals",
    "topic": "ACLs",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "A systems administrator is configuring a Cisco device. Which command permits only HTTPS traffic from the subnet 10.1.1.0/24 to a web server at IP address 192.168.5.10?",
    "options": [
      "access-list 101 permit ip 10.1.1.0 0.0.0.255 host 192.168.5.10 eq 443",
      "access-list 101 permit tcp 10.1.1.0 0.0.0.255 192.168.5.10 0.0.0.0 eq 80",
      "access-list 101 permit tcp 10.1.1.0 0.0.0.255 host 192.168.5.10 eq 443",
      "access-list 101 permit tcp host 192.168.5.10 10.1.1.0 0.0.0.255 eq 443"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "HTTPS uses TCP port 443. The command format is 'access-list <number> permit tcp <source-subnet> <wildcard> host <destination-ip> eq 443'. Reference: Cisco ACL configuration guides.",
      "wrong": [
        "The IP protocol statement does not support port matching options (like eq 443).",
        "The source and destination addresses are swapped.",
        "Port 80 is for HTTP, not HTTPS, and the destination address wildcard is missing."
      ],
      "tip": "Extended ACL numbers range from 100 to 199 and 2000 to 2699.",
      "memory": "TCP 443 = HTTPS. TCP 80 = HTTP. UDP 53 = DNS.",
      "real": "Apply an extended ACL to your firewall interface to allow HTTPS traffic to your web server while blocking other protocols.",
      "commands": [
        "access-list 101 permit tcp 10.1.1.0 0.0.0.255 host 192.168.5.10 eq 443"
      ]
    }
  },
  {
    "id": 96,
    "domain": "Security Fundamentals",
    "topic": "ACLs",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "An administrator is configuring a wildcard mask on an extended access control list statement to match a block of IP addresses with the subnet mask 255.255.240.0. What is the correct wildcard mask, and what is the equivalent CIDR prefix length?",
    "options": [
      "0.0.31.255, equivalent to a /20 network prefix length",
      "255.255.240.0, equivalent to a /20 network prefix length",
      "0.0.15.255, equivalent to a /21 network prefix length",
      "0.0.15.255, equivalent to a /20 network prefix length"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "To find the wildcard mask, subtract the subnet mask from 255.255.255.255: 255.255.255.255 - 255.255.240.0 = 0.0.15.255. A subnet mask of 255.255.240.0 corresponds to a /20 network prefix (8 + 8 + 4 = 20). Reference: CCNA Volume 2, Chapter 2: Basic IPv4 Access Control Lists.",
      "wrong": [
        "A /21 network prefix corresponds to a subnet mask of 255.255.248.0, which yields a wildcard mask of 0.0.7.255.",
        "A wildcard mask of 0.0.31.255 corresponds to a /19 prefix (subnet mask 255.255.224.0).",
        "255.255.240.0 is the subnet mask itself, not the wildcard mask used in ACLs."
      ],
      "tip": "Wildcard mask is the inverse of the subnet mask.",
      "memory": "Wildcard = 255.255.255.255 minus Subnet Mask.",
      "real": "When filtering web traffic, engineers apply: access-list 101 permit tcp 192.168.16.0 0.0.15.255 any eq 80.",
      "commands": [
        "access-list 101 permit tcp 192.168.16.0 0.0.15.255 any eq 80"
      ]
    }
  },
  {
    "id": 97,
    "domain": "Security Fundamentals",
    "topic": "SSH",
    "type": "dragdrop",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "Order the configuration commands required to enable SSH version 2 on a new Cisco Catalyst switch.",
    "order": [
      "ip domain-name company.local: Configure the DNS domain name required for key generation.",
      "crypto key generate rsa: Generate the RSA keys (minimum 768 bits for SSHv2, 1024 recommended).",
      "username admin secret cisco123: Create a local user account with an encrypted password.",
      "line vty 0 15: Enter virtual terminal lines configuration mode.",
      "login local\ntransport input ssh: Configure local authentication and restrict access to SSH only."
    ],
    "expl": {
      "correct": "Correct Order",
      "why": "To enable SSH, configure a domain name, generate keys, create a local user, select the VTY lines, configure local authentication, and restrict protocol access. Reference: Cisco SSH configuration guides.",
      "wrong": [
        "Generating keys requires a configured domain name first.",
        "VTY configuration must occur before restricting the transport input.",
        "Local authentication will fail if no local username is created first."
      ],
      "tip": "Configure RSA key size to at least 1024 bits to support SSH version 2; SSHv1 is deprecated.",
      "memory": "Domain -> Keys -> User -> VTY lines -> SSH input.",
      "real": "When securing a new switch, disable Telnet and enable SSHv2 to protect management traffic from local sniffing.",
      "commands": [
        "ip ssh version 2",
        "show ip ssh"
      ]
    }
  },
  {
    "id": 98,
    "domain": "Security Fundamentals",
    "topic": "Port Security",
    "type": "matching",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "Match the Layer 2 port-security violation modes to their switch behavior.",
    "pairs": [
      [
        "Shutdown",
        "Disables the interface (err-disable), increments violation counter, and logs error."
      ],
      [
        "Restrict",
        "Drops unauthorized frames, increments violation counter, and logs syslog warning."
      ],
      [
        "Protect",
        "Drops unauthorized frames silently without incrementing the counter or logging."
      ]
    ],
    "expl": {
      "correct": "Matching",
      "why": "Shutdown disables the port (err-disabled). Restrict drops traffic, increments the counter, and logs a warning. Protect drops traffic silently. Reference: Cisco Port Security guidelines.",
      "wrong": [
        "Protect does not log warnings or increment counters.",
        "Restrict does not shut down the interface.",
        "A port-security violation will not trigger spanning-tree topology changes or reload the switch."
      ],
      "tip": "Use 'shutdown' in high-security environments to alert administrators of unauthorized connections.",
      "memory": "Shutdown = Err-disabled. Restrict = Log error. Protect = Silent drop.",
      "real": "Configure Restrict mode on conference room ports to block unauthorized devices without disabling the port for others.",
      "commands": [
        "show port-security interface gigabitethernet 0/1"
      ]
    }
  },
  {
    "id": 99,
    "domain": "Security Fundamentals",
    "topic": "DHCP Snooping",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "How does DHCP Snooping defend against rogue DHCP server attacks on a Layer 2 switch network?",
    "options": [
      "It disables the DHCP service globally if a conflict is detected.",
      "It limits the number of DHCP requests allowed per second on access ports.",
      "It encrypts all DHCP messages sent on the network.",
      "It classifies ports as trusted or untrusted, dropping inbound DHCP server replies (OFFER/ACK) received on untrusted ports."
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "DHCP Snooping designates client ports as untrusted and uplink ports (facing the real DHCP server) as trusted. Any DHCP server replies (OFFER, ACK) received on untrusted ports are dropped. Reference: Cisco DHCP Snooping guidelines.",
      "wrong": [
        "DHCP Snooping does not encrypt DHCP messages.",
        "Rate limiting is a feature of DHCP Snooping to prevent exhaustion attacks, but does not block rogue servers directly.",
        "DHCP Snooping operates at Layer 2 and does not disable the DHCP service globally."
      ],
      "tip": "Configure DHCP Snooping globally, and configure the uplink port to the DHCP server as trusted using 'ip dhcp snooping trust'.",
      "memory": "DHCP Snooping: Untrusted ports block server replies.",
      "real": "If a user connects a home router to a wall jack, DHCP Snooping blocks the rogue router's DHCP offers, keeping network IPs stable.",
      "commands": [
        "ip dhcp snooping",
        "ip dhcp snooping trust"
      ]
    }
  },
  {
    "id": 100,
    "domain": "Security Fundamentals",
    "topic": "Layer 2 Security",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "15%",
    "frequency": "High",
    "text": "Which database is inspected by Dynamic ARP Inspection (DAI) to validate ARP packets on untrusted switch interfaces?",
    "options": [
      "The router ARP cache table",
      "The DHCP Snooping binding database",
      "The local DNS server IP log",
      "The switch MAC address table"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "DAI validates ARP packets on untrusted ports by checking their MAC-to-IP binding against the entries in the DHCP Snooping binding database. Packets with invalid bindings are dropped. Reference: Cisco DAI configuration guides.",
      "wrong": [
        "The MAC address table maps MACs to ports, not MACs to IPs.",
        "The router's ARP table is on a Layer 3 device; DAI runs locally on Layer 2 switches.",
        "DNS records resolve names to IPs and do not contain MAC bindings."
      ],
      "tip": "DAI requires DHCP Snooping to be enabled to build the binding database.",
      "memory": "DAI uses the DHCP Snooping database to validate ARP packets.",
      "real": "Configure DAI on client VLANs to prevent ARP poisoning and man-in-the-middle attacks.",
      "commands": [
        "ip arp inspection vlan 10"
      ]
    }
  },
  {
    "id": 101,
    "domain": "Security Fundamentals",
    "topic": "Port Security",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "A network engineer is analyzing a network segment. What is the primary benefit of configuring port security with 'sticky' MAC address learning?",
    "options": [
      "It disables Spanning Tree calculations on that port.",
      "It allows an unlimited number of MAC addresses on the port.",
      "It encrypts MAC addresses in the switch configuration file.",
      "It dynamically learns MAC addresses and saves them to the running configuration."
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Sticky MAC learning dynamically learns MAC addresses on the port and adds them to the running configuration. This avoids having to manually configure MAC addresses while securing the port. Reference: Cisco Port Security guidelines.",
      "wrong": [
        "Sticky MACs are stored in plaintext in the configuration file.",
        "Maximum MAC limits still apply when sticky learning is enabled.",
        "Port security does not affect Spanning Tree operations."
      ],
      "tip": "Save the running configuration ('write memory') to ensure dynamically learned sticky MAC addresses persist after a reload.",
      "memory": "Sticky MAC = dynamically learned, saved to config.",
      "real": "Use sticky MAC learning when deploying new workstations to secure ports without manually typing MAC addresses.",
      "commands": [
        "switchport port-security mac-address sticky"
      ]
    }
  },
  {
    "id": 102,
    "domain": "Security Fundamentals",
    "topic": "Device Security",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "15%",
    "frequency": "High",
    "text": "A systems administrator is configuring a Cisco device. Which command encrypts all existing and future clear-text passwords in the Cisco switch configuration file?",
    "options": [
      "service password-encryption",
      "service encrypt-key",
      "encrypt passwords local",
      "enable secret cisco123"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "The 'service password-encryption' command applies a weak Vigenere cipher (Type 7) to encrypt all plaintext passwords (like console and vty passwords) in the configuration file. Reference: Cisco device hardening guides.",
      "wrong": [
        "enable secret configures the privilege level password using MD5/scrypt hashing, but does not encrypt other passwords.",
        "encrypt passwords local is invalid Cisco IOS command syntax.",
        "service encrypt-key is incorrect syntax."
      ],
      "tip": "Type 7 encryption is weak and can be decrypted easily. Use 'enable secret' (Type 5/8/9) for strong gateway password protection.",
      "memory": "service password-encryption.",
      "real": "Enable service password-encryption on all network devices to protect passwords from casual shoulder surfing.",
      "commands": [
        "service password-encryption"
      ]
    }
  },
  {
    "id": 103,
    "domain": "Security Fundamentals",
    "topic": "Device Security",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "15%",
    "frequency": "High",
    "text": "Why is 'enable secret <password>' preferred over 'enable password <password>' in Cisco IOS configuration?",
    "options": [
      "enable secret encrypts the password using a strong cryptographic hash (like MD5 or SHA-256), whereas enable password uses weak encryption or plaintext.",
      "enable secret is required to configure VTY lines.",
      "enable secret requires SSH to be enabled.",
      "enable secret enables HTTPS access automatically."
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "enable secret uses a one-way cryptographic hash (Type 5 MD5 or Type 9 scrypt), which is highly secure. enable password uses weak Type 7 encryption or plaintext, which is easily cracked. Reference: Cisco security guidelines.",
      "wrong": [
        "SSH configuration does not require the enable secret command.",
        "HTTPS configuration is managed via 'ip http secure-server', not enable secret.",
        "VTY lines can be configured without enable secret."
      ],
      "tip": "If both commands are configured, the router always uses the 'enable secret' password.",
      "memory": "Secret = Strong Hash. Password = Weak/Plaintext.",
      "real": "Always configure 'enable secret' on switches and routers to protect privileged access credentials.",
      "commands": [
        "enable secret strong_pass"
      ]
    }
  },
  {
    "id": 104,
    "domain": "Security Fundamentals",
    "topic": "Layer 2 Security",
    "type": "multi",
    "difficulty": "Easy",
    "examWeight": "15%",
    "frequency": "High",
    "text": "Which two administrative measures are recommended to secure unused ports on a Cisco Catalyst switch?",
    "options": [
      "Assign the ports to an unused, isolated VLAN (blackhole VLAN).",
      "Configure the ports as trunk ports.",
      "Enable DTP dynamic desirable on the ports.",
      "Shut down the ports using the 'shutdown' command."
    ],
    "correct": [
      0,
      3
    ],
    "expl": {
      "correct": "A, D",
      "why": "Securing unused ports prevents unauthorized physical access. Shut down the ports and assign them to a non-routing 'blackhole' VLAN (e.g. VLAN 999) to isolate traffic. Reference: Cisco Layer 2 security guidelines.",
      "wrong": [
        "Configuring unused ports as trunks allows users to access all VLANs.",
        "DTP dynamic desirable actively negotiates trunks, creating a security risk.",
        "Unused ports should not be left in administrative up state even if protected by security features."
      ],
      "tip": "Combine shutdown and an unused VLAN to prevent access even if a port is accidentally enabled.",
      "memory": "Shut down and isolate unused ports.",
      "real": "When auditing switchports, identify unused ports, shut them down, and move them to VLAN 999.",
      "commands": [
        "interface range fastethernet 0/10 - 24",
        "shutdown",
        "switchport access vlan 999"
      ]
    }
  },
  {
    "id": 105,
    "domain": "Security Fundamentals",
    "topic": "Device Security",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "15%",
    "frequency": "High",
    "text": "In network security administration, what do the three letters in the AAA security framework stand for?",
    "options": [
      "Address, Allocation, Authority",
      "Authentication, Authorization, Accounting",
      "Algorithms, Access, Auditing",
      "Association, Authentication, Access"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "AAA stands for Authentication (Who is accessing the network?), Authorization (What permissions do they have?), and Accounting (What actions did they perform?). Reference: RFC 2989.",
      "wrong": [
        "Association is a wireless phase, not part of AAA.",
        "Algorithms and Auditing are security concepts, but not the AAA definition.",
        "Address, Allocation, and Authority are not part of AAA."
      ],
      "tip": "Authentication verifies identity; Authorization manages access; Accounting tracks changes.",
      "memory": "AAA: Who are you? What can you do? What did you do?",
      "real": "Configure AAA with TACACS+ on corporate devices to authenticate administrators against a central Active Directory server.",
      "commands": [
        "aaa new-model"
      ]
    }
  },
  {
    "id": 106,
    "domain": "Security Fundamentals",
    "topic": "Wireless Security",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "Which security protocol is commonly deployed on enterprise wireless networks to provide centralized 802.1X user authentication?",
    "options": [
      "WPA3-Personal",
      "WPS (Wi-Fi Protected Setup)",
      "WPA3-Enterprise using RADIUS",
      "WEP with Shared Keys"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "WPA3-Enterprise uses 802.1X authentication, passing user credentials to a centralized RADIUS server (like Cisco ISE) to authenticate access. Reference: IEEE 802.11i.",
      "wrong": [
        "WPA3-Personal uses a shared passphrase (SAE), not centralized 802.1X authentication.",
        "WEP is legacy and highly insecure.",
        "WPS uses PINs or push buttons and is vulnerable to brute-force attacks."
      ],
      "tip": "802.1X provides per-user authentication, separating user credentials from a shared Wi-Fi password.",
      "memory": "Enterprise Wi-Fi = 802.1X + RADIUS.",
      "real": "Configure your enterprise network with WPA3-Enterprise, routing user logins through a RADIUS server to enforce security policies.",
      "commands": [
        "radius-server host 10.1.100.10"
      ]
    }
  },
  {
    "id": 107,
    "domain": "Security Fundamentals",
    "topic": "Device Security",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "Medium",
    "text": "A systems administrator is configuring a Cisco device. Which command is applied to VTY lines to block Telnet access and restrict incoming connections to SSH only?",
    "options": [
      "transport input ssh",
      "transport input telnet ssh",
      "login local ssh-only",
      "ip ssh only"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "The command 'transport input ssh' on VTY lines configures the device to accept only SSH connections. Telnet connections are rejected. Reference: Cisco VTY configuration guides.",
      "wrong": [
        "transport input telnet ssh allows both Telnet (insecure) and SSH.",
        "login local ssh-only is invalid Cisco IOS command syntax.",
        "ip ssh only is incorrect syntax."
      ],
      "tip": "Telnet sends credentials in plaintext. Disable Telnet using 'transport input ssh' to secure access.",
      "memory": "transport input ssh.",
      "real": "Secure VTY lines on all enterprise switches: 'line vty 0 15' followed by 'transport input ssh'.",
      "commands": [
        "line vty 0 15",
        "transport input ssh"
      ]
    }
  },
  {
    "id": 108,
    "domain": "Security Fundamentals",
    "topic": "Device Security",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "15%",
    "frequency": "High",
    "text": "Why is SSH version 2 preferred over SSH version 1 for managing network devices?",
    "options": [
      "SSH version 2 supports TFTP transfers directly.",
      "SSH version 1 has known cryptographic design flaws that make it vulnerable to exploit.",
      "SSH version 1 does not support password authentication.",
      "SSH version 2 runs over UDP, making it faster."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "SSHv1 has vulnerabilities (like integer overflow exploits) that can compromise the session. SSHv2 improves key exchange and cryptographic algorithms, providing a secure connection. Reference: RFC 4253.",
      "wrong": [
        "SSH does not replace TFTP data transfer protocols directly.",
        "Both SSHv1 and SSHv2 run over TCP port 22, not UDP.",
        "SSHv1 supports password authentication, but is insecure."
      ],
      "tip": "Configure 'ip ssh version 2' to disable SSHv1 fallbacks on Cisco devices.",
      "memory": "SSHv2 is the secure choice; SSHv1 is obsolete.",
      "real": "When auditing devices, verify that 'ip ssh version 2' is enabled globally to block legacy SSHv1 connections.",
      "commands": [
        "ip ssh version 2"
      ]
    }
  },
  {
    "id": 109,
    "domain": "Automation and Programmability",
    "topic": "JSON",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "In JSON syntax, which character is used to define and enclose a structured array of values?",
    "options": [
      "Parentheses ( )",
      "Curly braces { }",
      "Angle brackets < >",
      "Square brackets [ ]"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "JSON uses square brackets [ ] to define ordered arrays of values. Curly braces { } define key-value objects. Reference: RFC 8259.",
      "wrong": [
        "Curly braces { } are used to define JSON objects.",
        "Parentheses ( ) are not used in JSON structures.",
        "Angle brackets < > are used in XML, not JSON."
      ],
      "tip": "JSON is key-value based. Objects are enclosed in {}, arrays are enclosed in [].",
      "memory": "Brackets [ ] hold lists (arrays). Braces { } hold objects.",
      "real": "When parsing a REST API response from a Cisco DNA Center controller, interfaces are returned as an array enclosed in square brackets [ ].",
      "commands": [
        "show ip interface"
      ]
    }
  },
  {
    "id": 110,
    "domain": "Automation and Programmability",
    "topic": "REST APIs",
    "type": "matching",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Match the REST API HTTP methods to their corresponding database CRUD operations.",
    "pairs": [
      [
        "POST",
        "Create a new resource"
      ],
      [
        "GET",
        "Read/retrieve resource data"
      ],
      [
        "PUT",
        "Update/replace an existing resource"
      ],
      [
        "DELETE",
        "Remove a resource"
      ]
    ],
    "expl": {
      "correct": "Matching",
      "why": "REST APIs map HTTP methods to CRUD operations: POST (Create), GET (Read), PUT/PATCH (Update), and DELETE (Delete). Reference: RFC 9110.",
      "wrong": [
        "GET is used to read data; it does not modify or create resources.",
        "POST creates resources; it is not for deleting them.",
        "PUT replaces existing resources; it does not remove them."
      ],
      "tip": "CRUD stands for Create, Read, Update, Delete. HTTP methods map directly to these operations.",
      "memory": "POST = Create. GET = Read. PUT = Update. DELETE = Delete.",
      "real": "When configuring a router via RESTCONF, send a POST request to add a new loopback interface, and a GET request to verify its state.",
      "commands": [
        "curl"
      ]
    }
  },
  {
    "id": 111,
    "domain": "Automation and Programmability",
    "topic": "SDN",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A router receives a packet with a destination IP address of 10.1.5.37. The router's routing table contains several routes that match this address. Based on the routing table output below, which route will the router select to forward the packet?",
    "options": [
      "The static route to 10.1.5.36/30, because it has the longest prefix match (/30).",
      "The static route to 10.1.5.0/24, because it has the lowest Administrative Distance (AD = 1) and is a static route.",
      "The EIGRP route to 10.1.5.32/27, because EIGRP has a lower Administrative Distance (AD = 90) than OSPF (AD = 110).",
      "The OSPF route to 10.1.5.32/28, because it has a lower Administrative Distance than RIP and matches the subnet boundary."
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "A router selects the forwarding path based on the Longest Prefix Match (the most specific route with the longest subnet mask). In this case, the destination address 10.1.5.37 falls inside the subnet ranges of 10.1.5.0/24 (.0 to .255), 10.1.5.32/27 (.32 to .63), 10.1.5.32/28 (.32 to .47), and 10.1.5.36/30 (.36 to .39). The longest matching prefix length is /30. Administrative Distance is only evaluated if there is a tie in prefix length. Reference: CCNA Volume 1, Chapter 16: Routing Table Decision-Making.",
      "wrong": [
        "Administrative Distance (AD) is not used first. The router always evaluates prefix length first.",
        "The EIGRP route has a /27 prefix, which is shorter (less specific) than the /30 prefix.",
        "The OSPF route has a /28 prefix, which is shorter (less specific) than the /30 prefix."
      ],
      "tip": "Route selection order: 1. Longest Prefix Match (always wins), 2. Lowest Administrative Distance (only if prefix length is a tie), 3. Lowest Metric (only if both prefix length and AD are ties).",
      "memory": "Prefix Length > Administrative Distance > Metric.",
      "real": "If you configure a static route `10.1.1.0/24` pointing to ISP-A, and a dynamic routing protocol learns `10.1.1.128/25` pointing to ISP-B, traffic destined to `10.1.1.130` will exit via ISP-B, regardless of the static route's administrative preference.",
      "commands": [
        "show ip route",
        "show ip route 10.1.5.37"
      ]
    },
    "cli": "Router# show ip route\nCodes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP\n       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area \n\nGateway of last resort is not set\n\n      10.0.0.0/8 is subnetted, 4 subnets\nS        10.1.5.0/24 [1/0] via 192.168.1.2, GigabitEthernet0/0\nO        10.1.5.32/28 [110/20] via 192.168.2.2, GigabitEthernet0/1\nD        10.1.5.32/27 [90/3072] via 192.168.3.2, GigabitEthernet0/2\nS        10.1.5.36/30 [1/0] via 192.168.4.2, GigabitEthernet0/3"
  },
  {
    "id": 112,
    "domain": "Automation and Programmability",
    "topic": "DNA Center",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network engineer is analyzing a network segment. What is a key capability provided by Cisco Catalyst Center (formerly DNA Center)?",
    "options": [
      "It is an open-source tool for programming web servers.",
      "It acts as a hardware replacement for Catalyst switches.",
      "It is a host operating system that replaces Cisco IOS.",
      "It provides centralized, intent-based network management, automation, and assurance."
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Cisco Catalyst Center is an enterprise network controller that provides automation, security policy enforcement, and AI-driven assurance. Reference: Cisco Catalyst Center documentation.",
      "wrong": [
        "Catalyst Center is a software management controller, not physical switch hardware.",
        "It manages devices running IOS-XE, but does not replace the device OS.",
        "It is a proprietary enterprise tool, not an open-source web server programming tool."
      ],
      "tip": "Catalyst Center uses APIs to automate configurations, monitor performance, and verify compliance.",
      "memory": "Catalyst Center = Intent-based management and assurance.",
      "real": "Use Catalyst Center to push a standard software upgrade to hundreds of access switches simultaneously, reducing maintenance windows.",
      "commands": [
        "show running-config"
      ]
    }
  },
  {
    "id": 113,
    "domain": "Automation and Programmability",
    "topic": "Ansible",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which markup language is utilized by Ansible to write playbooks for configuration management automation?",
    "options": [
      "JSON",
      "XML",
      "Python",
      "YAML"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Ansible playbooks are written in YAML (Yet Another Markup Language), which is human-readable and structured using indentation. Reference: Ansible documentation.",
      "wrong": [
        "JSON is used for API payloads, but not default Ansible playbooks.",
        "XML is used by NETCONF, not Ansible.",
        "Python is the language Ansible is built on, but playbooks use YAML."
      ],
      "tip": "YAML is highly sensitive to spacing and indentation. Avoid using tabs when writing playbooks.",
      "memory": "Ansible = YAML Playbooks.",
      "real": "Use an Ansible playbook written in YAML to deploy a standard NTP configuration to all switches in your network.",
      "commands": [
        "ansible-playbook"
      ]
    }
  },
  {
    "id": 114,
    "domain": "Automation and Programmability",
    "topic": "Ansible",
    "type": "matching",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "Medium",
    "text": "Match the configuration management tools to their operational characteristics.",
    "pairs": [
      [
        "Ansible",
        "Agentless, push model using SSH/APIs and YAML playbooks."
      ],
      [
        "Puppet",
        "Agent-based, pull model using a custom DSL and manifests."
      ],
      [
        "Chef",
        "Agent-based, pull model using Ruby-based recipes and cookbooks."
      ]
    ],
    "expl": {
      "correct": "Matching",
      "why": "Ansible is agentless and uses a push model. Puppet and Chef are agent-based and use a pull model, with Puppet using manifests and Chef using recipes. Reference: Configuration management guides.",
      "wrong": [
        "Ansible is not agent-based; it connects to devices via SSH without needing agent software.",
        "Chef does not use YAML playbooks; it uses Ruby-based recipes.",
        "SaltStack is another python-based tool, but it relies on minions and a master-minion architecture by default, unlike Ansible's default push model."
      ],
      "tip": "Ansible is popular for network automation because it is agentless and does not require agent software on switches.",
      "memory": "Ansible = Agentless/Push. Puppet/Chef = Agent/Pull.",
      "real": "Deploy Ansible in your network to automate configurations without having to install software on your switches.",
      "commands": [
        "ansible --version"
      ]
    }
  },
  {
    "id": 115,
    "domain": "Automation and Programmability",
    "topic": "NETCONF",
    "type": "multi",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which two statements correctly describe the characteristics of NETCONF and RESTCONF protocols?",
    "options": [
      "Both protocols utilize YANG data models to structure configuration and state data.",
      "RESTCONF is stateful, while NETCONF is stateless.",
      "NETCONF uses SSH as its transport protocol, while RESTCONF uses HTTP/HTTPS.",
      "Both protocols use JSON as their only data encoding format."
    ],
    "correct": [
      0,
      2
    ],
    "expl": {
      "correct": "A, C",
      "why": "NETCONF operates over SSH (port 830) and uses XML. RESTCONF operates over HTTP/HTTPS (port 443) and supports both XML and JSON. Both use YANG models to structure data. Reference: RFC 6241 and RFC 8040.",
      "wrong": [
        "NETCONF supports only XML, not JSON.",
        "RESTCONF is stateful (built on HTTP), while NETCONF is stateful (maintains SSH sessions).",
        "Neither protocol utilizes Telnet or plaintext communication for network management."
      ],
      "tip": "NETCONF uses SSH and XML. RESTCONF uses HTTP/HTTPS and supports both XML and JSON.",
      "memory": "NETCONF = SSH/XML. RESTCONF = HTTPS/JSON/XML. Both use YANG.",
      "real": "Configure RESTCONF on a router to retrieve interface statistics using a python script with a GET request.",
      "commands": [
        "show running-config | include restconf"
      ]
    }
  },
  {
    "id": 116,
    "domain": "Automation and Programmability",
    "topic": "YANG",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network engineer is analyzing a network segment. What is the primary purpose of the YANG data modeling language in network automation?",
    "options": [
      "To execute automation scripts on remote devices.",
      "To transfer configuration files over the network.",
      "To define the structure and constraints of configuration and state data used by protocols like NETCONF.",
      "To act as a replacement for REST APIs."
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "YANG is a data modeling language that defines the structure, hierarchy, and constraints of configuration and operational data, which is then used by protocols like NETCONF and RESTCONF. Reference: RFC 7950.",
      "wrong": [
        "YANG is not a transport protocol; protocols like NETCONF/RESTCONF handle data transfer.",
        "YANG is a data model, not a script execution engine.",
        "YANG does not replace REST APIs; it defines the data models used by RESTCONF APIs."
      ],
      "tip": "YANG defines the data structure, while NETCONF or RESTCONF acts as the transport protocol.",
      "memory": "YANG = Modeling language (blueprint). NETCONF/RESTCONF = Transport (delivery).",
      "real": "When automating your network, use YANG models to ensure configuration changes sent to different switch models have a consistent format.",
      "commands": [
        "show yang suite"
      ]
    }
  },
  {
    "id": 117,
    "domain": "Automation and Programmability",
    "topic": "SDN",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "In Software-Defined Access (SD-Access), what is the difference between the underlay and the overlay network?",
    "options": [
      "The underlay is managed by the ISP, while the overlay is managed locally.",
      "The underlay consists of logical tunnels, while the overlay is the physical cabling.",
      "The underlay is for IPv4 traffic, and the overlay is for IPv6 traffic.",
      "The underlay is the physical infrastructure and routing protocols that provide basic connectivity, while the overlay is the logical network of tunnels that forwards user traffic."
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "The underlay network provides physical connectivity and routing (usually using IS-IS or OSPF) between network nodes. The overlay network is a logical topology built on top of the underlay using tunnels (like VXLAN) to forward user traffic. Reference: Cisco SD-Access design guides.",
      "wrong": [
        "The underlay is the physical network, and the overlay consists of the logical tunnels.",
        "Both underlay and overlay are managed locally in an enterprise fabric.",
        "Both underlay and overlay support both IPv4 and IPv6 traffic."
      ],
      "tip": "The underlay provides connectivity; the overlay provides virtualization and services.",
      "memory": "Underlay = Physical/Routing. Overlay = Logical/Tunnels (VXLAN).",
      "real": "In an SD-Access deployment, the switches use an OSPF underlay for reachability, and VXLAN tunnels (overlay) to carry user traffic across the network.",
      "commands": [
        "show ip route"
      ]
    }
  },
  {
    "id": 118,
    "domain": "Automation and Programmability",
    "topic": "SDN",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which plane of network device operation is centralized in a Software-Defined Networking (SDN) controller architecture?",
    "options": [
      "Physical Plane",
      "Control Plane",
      "Management Plane",
      "Data Plane"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "SDN separates the control plane (which makes routing and forwarding decisions) from the data plane (which forwards packets based on those decisions). The control plane is centralized in the SDN controller. Reference: Cisco SDN guidelines.",
      "wrong": [
        "The data plane remains distributed on physical switches and routers to forward packets at wire speed.",
        "The management plane is used for configuration access (SSH, SNMP), which is centralized but not the core change of SDN.",
        "There is no physical plane in device operations."
      ],
      "tip": "SDN = Centralized Control Plane + Distributed Data Plane.",
      "memory": "Control Plane is centralized in the controller.",
      "real": "In an SDN network, switches query the controller to build forwarding paths, rather than running local routing protocols to calculate routes.",
      "commands": [
        "show ip route"
      ]
    }
  },
  {
    "id": 119,
    "domain": "Automation and Programmability",
    "topic": "REST APIs",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "Medium",
    "text": "Which HTTP status code is returned by a REST API server to indicate that a request was successful and a new resource was created?",
    "options": [
      "200 OK",
      "201 Created",
      "400 Bad Request",
      "404 Not Found"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "HTTP status code 201 indicates that the request succeeded and a new resource was created. 200 OK indicates success, but typically without resource creation. Reference: RFC 9110.",
      "wrong": [
        "200 OK indicates a successful request, but does not specify that a resource was created.",
        "400 Bad Request indicates a client-side syntax error.",
        "404 Not Found indicates that the requested resource does not exist on the server."
      ],
      "tip": "2xx codes indicate success, 3xx redirection, 4xx client errors, and 5xx server errors.",
      "memory": "200 = Success. 201 = Created.",
      "real": "When sending a POST request to add a static route on a router, verify that the router returns a 201 Created status code.",
      "commands": [
        "curl -I"
      ]
    }
  },
  {
    "id": 120,
    "domain": "Automation and Programmability",
    "topic": "REST APIs",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "Medium",
    "text": "Which transport protocol and default port number are used by RESTCONF for secure programmatic communications?",
    "options": [
      "SSH, Port 830",
      "HTTP, Port 80",
      "TCP, Port 22",
      "HTTPS, Port 443"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "RESTCONF is an HTTP-based protocol that runs over HTTPS (port 443) using REST principles. Reference: RFC 8040.",
      "wrong": [
        "SSH Port 830 is used by NETCONF, not RESTCONF.",
        "HTTP Port 80 is insecure and not the default secure transport for RESTCONF.",
        "TCP Port 22 is for standard SSH, not RESTCONF."
      ],
      "tip": "NETCONF uses SSH (port 830). RESTCONF uses HTTPS (port 443).",
      "memory": "RESTCONF = HTTPS (443). NETCONF = SSH (830).",
      "real": "Enable RESTCONF on your router: 'restconf' globally, and ensure HTTPS access is permitted through your firewalls.",
      "commands": [
        "show ip http secure-status"
      ]
    }
  },
  {
    "id": 121,
    "domain": "Security Fundamentals",
    "topic": "Layer 2 Security",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "15%",
    "frequency": "Medium",
    "text": "What security threat is mitigated by enabling IP Source Guard on an access switch port?",
    "options": [
      "IP Address Spooping / Host Impersonation",
      "MAC Address Flooding attacks",
      "DHCP Starvation attacks",
      "Spanning Tree loops"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "IP Source Guard checks the source IP of packets received on untrusted ports against the DHCP Snooping binding database. If the IP/MAC binding does not match, the traffic is dropped, preventing IP address spoofing. Reference: Cisco Layer 2 security guidelines.",
      "wrong": [
        "MAC flooding is mitigated by port security, not IP Source Guard.",
        "DHCP starvation is prevented by rate limiting DHCP requests, not IP Source Guard.",
        "Spanning Tree loops are prevented by Spanning Tree Protocol (STP)."
      ],
      "tip": "IP Source Guard builds on DHCP Snooping and MAC address tables to validate traffic.",
      "memory": "IP Source Guard = Guard against IP spoofing.",
      "real": "Configure IP Source Guard on guest switchports to prevent users from manually assigning themselves static IPs to bypass security filters.",
      "commands": [
        "ip verify source"
      ]
    }
  },
  {
    "id": 122,
    "domain": "Security Fundamentals",
    "topic": "Device Security",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "Medium",
    "text": "A systems administrator is configuring a Cisco device. Which command configures a login lockout policy on a Cisco router to block login attempts for 5 minutes (300 seconds) if a user fails 3 login attempts within a 60-second window?",
    "options": [
      "aaa lockout attempts 3 duration 300",
      "lockout login 300 attempts 3 time 60",
      "service login-lockout 300 attempts 3",
      "login block-for 300 attempts 3 within 60"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "The command 'login block-for <seconds> attempts <count> within <seconds>' configures a brute-force mitigation policy on Cisco IOS. Reference: Cisco device hardening guides.",
      "wrong": [
        "lockout login is invalid Cisco IOS command syntax.",
        "service login-lockout is incorrect syntax.",
        "aaa lockout is not a valid global configuration command."
      ],
      "tip": "Configure this policy to protect VTY lines from automated brute-force attacks.",
      "memory": "login block-for LOCKOUT_TIME attempts FAILED_COUNT within WINDOW.",
      "real": "Enable login block-for on your border routers to protect management VTY access from internet scanners.",
      "commands": [
        "login block-for 300 attempts 3 within 60"
      ]
    }
  },
  {
    "id": 123,
    "domain": "Network Fundamentals",
    "topic": "Wireless Deployment",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is deploying lightweight access points (LAPs) in a branch office that has a WAN link connecting to the main campus where the WLC is located. Which wireless deployment mode should be configured on the LAPs to allow local client traffic switching if the WAN link to the WLC goes down?",
    "options": [
      "Local Mode",
      "FlexConnect Mode",
      "Bridge Mode",
      "Monitor Mode"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "FlexConnect is a wireless solution for branch and remote office deployments. It allows the WLC to configure access points over the WAN link, but switch data traffic locally. If the WAN connection fails, the LAP can continue to switch traffic locally for existing clients.",
      "wrong": [
        "Local Mode is the default mode where all client traffic is tunneled via CAPWAP back to the WLC; if the WLC is unreachable, wireless clients cannot access local network resources.",
        "Bridge Mode is used to configure APs as outdoor point-to-point or point-to-multipoint mesh nodes.",
        "Monitor Mode disables transmitter capabilities, allowing the AP to act as a dedicated sensor for location tracking and intrusion detection."
      ],
      "tip": "FlexConnect allows local switching and local authentication if the link to the WLC is lost.",
      "memory": "FlexConnect = Flexible switching, local switching if WAN fails.",
      "real": "Always use FlexConnect for branch offices with limited WAN bandwidth to keep local printer and server access functional during WAN outages.",
      "commands": []
    }
  },
  {
    "id": 124,
    "domain": "Network Fundamentals",
    "topic": "Cabling Properties",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "Which optical fiber standard is designed for long-distance transmissions, utilizes a laser light source, and has a typical core size of 9 microns?",
    "options": [
      "1000BASE-SX (Multi-Mode Fiber)",
      "10GBASE-LR (Single-Mode Fiber)",
      "1000BASE-T (Unshielded Twisted Pair)",
      "10GBASE-SR (Multi-Mode Fiber)"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Single-mode fiber (SMF) has a very small core diameter (typically 9 microns), which restricts the light to a single path (mode). It uses laser light sources and is suited for high-speed, long-distance transmission, such as 10GBASE-LR (Long Range).",
      "wrong": [
        "10GBASE-SR (Short Range) uses multi-mode fiber (MMF), which has a larger core (50 or 62.5 microns) and uses LEDs or VCSELs, limiting its distance.",
        "1000BASE-T is a copper cabling standard using UTP, not optical fiber.",
        "1000BASE-SX is a multi-mode fiber standard for short distances using 850nm lasers."
      ],
      "tip": "Single-mode fiber = Small core (9 microns), Laser source, long distances (up to 10km or more).",
      "memory": "SMF = Single mode, Small core, Super-far distance.",
      "real": "When connecting buildings across a campus that are more than 500 meters apart, use Single-Mode Fiber (SMF) to prevent signal attenuation.",
      "commands": []
    }
  },
  {
    "id": 125,
    "domain": "Network Fundamentals",
    "topic": "WAN Topologies",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "Which WAN service utilizes label switching routers (LSRs) and edge routers (LERs) to forward data using short path labels rather than complex routing table lookups?",
    "options": [
      "Multiprotocol Label Switching (MPLS)",
      "Dynamic Multipoint VPN (DMVPN)",
      "Metro Ethernet (MetroE)",
      "Site-to-Site IPsec VPN"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Multiprotocol Label Switching (MPLS) is a high-performance WAN technology that directs data from one network node to another based on short path labels rather than long network addresses, using Label Switch Routers (LSRs) and Label Edge Routers (LERs).",
      "wrong": [
        "Metro Ethernet is a service that extends Ethernet technology beyond the LAN into metropolitan networks, behaving like a large Layer 2 bridge.",
        "Site-to-Site IPsec VPN is an encrypted tunnel over the public Internet, not a service provider label-switching technology.",
        "DMVPN is a Cisco proprietary software solution for building multiple IPsec VPNs in an easy, dynamic, and scalable manner."
      ],
      "tip": "MPLS relies on labels inserted between Layer 2 and Layer 3 headers (often called a Layer 2.5 protocol).",
      "memory": "MPLS = Multiprotocol Label Switching. Look for LSR and LER keywords.",
      "real": "Enterprise networks often use MPLS to interconnect branch offices with guaranteed Quality of Service (QoS) for voice and video traffic.",
      "commands": []
    }
  },
  {
    "id": 126,
    "domain": "Network Fundamentals",
    "topic": "IPv6 EUI-64",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "High",
    "text": "If a Cisco router interface MAC address is 0011:2233:4455, what is the interface ID (last 64 bits) of its IPv6 address when calculated using the EUI-64 process?",
    "options": [
      "2001:0011:22FF:FE33",
      "0211:2233:4455:FFFE",
      "0011:22FF:FE33:4455",
      "0211:22FF:FE33:4455"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "The EUI-64 process takes a 48-bit MAC address, splits it in half, inserts FFFE in the middle, and flips the 7th bit (universal/local bit) of the first byte. The MAC address 0011:2233:4455 has the first byte 00 (binary 00000000). Flipping the 7th bit results in 00000010 (hex 02). Inserting FFFE in the middle of 0011:2233:4455 results in 0211:22FF:FE33:4455.",
      "wrong": [
        "0011:22FF:FE33:4455 is incorrect because the 7th bit of the first byte was not flipped.",
        "0211:2233:4455:FFFE is incorrect because FFFE was appended to the end rather than inserted in the middle.",
        "2001:0011:22FF:FE33 is a global unicast prefix example, not the host interface identifier."
      ],
      "tip": "To perform EUI-64: Split MAC, insert FFFE in the middle, change the 2nd hex character of the MAC (e.g. 00 -> 02, 0c -> 0e).",
      "memory": "EUI-64: Split, insert FFFE, flip the 7th bit (add 2 to the first byte in hex).",
      "real": "Review interface configuration using 'show ipv6 interface' to observe the EUI-64 link-local address generation.",
      "commands": [
        "show ipv6 interface"
      ]
    }
  },
  {
    "id": 127,
    "domain": "Network Fundamentals",
    "topic": "DNS Records",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "Which type of DNS resource record resolves a domain name to an IPv6 address?",
    "options": [
      "A record",
      "AAAA record",
      "CNAME record",
      "MX record"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "An AAAA DNS record maps a hostname to a 128-bit IPv6 address, whereas a standard A record maps a hostname to a 32-bit IPv4 address.",
      "wrong": [
        "A record resolves a domain name to a 32-bit IPv4 address.",
        "CNAME record (Canonical Name) maps an alias name to the true canonical domain name.",
        "MX record (Mail Exchanger) specifies the mail server responsible for accepting email messages on behalf of a domain."
      ],
      "tip": "Think of AAAA as four times the size of A (IPv6 is 128 bits, which is 4 times the size of IPv4's 32 bits).",
      "memory": "A = IPv4, AAAA = IPv6, MX = Mail, CNAME = Alias.",
      "real": "When deploying an IPv6-only public web server, create an AAAA record in your external DNS provider.",
      "commands": []
    }
  },
  {
    "id": 128,
    "domain": "Network Access",
    "topic": "Wireless Roaming",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A wireless client moves from the coverage area of AP-A to AP-B. Both APs are connected to different access layer switches, but are managed by the same WLC. If the client maintains its IP address and session state, what type of roaming has occurred?",
    "options": [
      "Layer 3 Roaming (Inter-Controller)",
      "Autonomous-to-Lightweight Roaming",
      "Layer 2 Roaming (Intra-Controller)",
      "Subnet-to-Subnet Roaming"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "Layer 2 Roaming (or Intra-Controller Roaming) occurs when a client moves between APs that are associated with the same WLC and are configured on the same VLAN/subnet. The WLC updates its database with the client's new AP association without changing the client's IP address.",
      "wrong": [
        "Layer 3 Roaming (Inter-Controller Roaming) happens when a client roams between APs managed by different WLCs on different subnets, requiring traffic asymmetric tunneling (foreign/anchor relationship) to keep the original IP address.",
        "Subnet-to-Subnet Roaming is a general concept that typically forces a new DHCP request and IP change unless Layer 3 roaming capabilities are enabled.",
        "Autonomous-to-Lightweight Roaming describes moving from standalone APs to controller-managed APs, not client movement."
      ],
      "tip": "In Intra-Controller Roaming, the MAC-to-port mapping is updated inside the WLC, and a gratuitous ARP is sent to update the switch CAM tables.",
      "memory": "Intra-Controller / same VLAN = Layer 2 Roaming.",
      "real": "Configure a mobility group when you need to enable seamless Layer 3 roaming across multiple WLCs.",
      "commands": []
    }
  },
  {
    "id": 129,
    "domain": "Network Access",
    "topic": "WLC Interfaces",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "Which WLC interface is used by the controller to relay DHCP messages, perform web authentication, and handle VPN termination, and is typically configured with an out-of-band non-routable IP address?",
    "options": [
      "Management Interface",
      "Service Port",
      "Virtual Interface",
      "AP-Manager Interface"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "The Virtual Interface on a WLC is used for layer 3 security authentication (web auth), DHCP relay redirection, and mobility management. It must be configured with a non-routable IP address (such as 192.0.2.1) that does not exist in the routing table of the enterprise network.",
      "wrong": [
        "Management Interface is the default interface for out-of-band and in-band WLC management, and controller-to-WLC communication.",
        "AP-Manager Interface controls LAP-to-WLC CAPWAP tunnel communications.",
        "Service Port is a physical interface used only for out-of-band management and recovery."
      ],
      "tip": "The virtual interface IP must be a unique, non-routable address, and all WLCs in a mobility group should share the same virtual interface IP.",
      "memory": "Virtual Interface = DHCP relay redirection, web auth redirection.",
      "real": "When configuring a WLC for the first time, use 192.0.2.1 as the virtual IP address to comply with RFC 5737 recommendations.",
      "commands": []
    }
  },
  {
    "id": 130,
    "domain": "Network Access",
    "topic": "Rapid PVST+",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "High",
    "text": "In a Rapid PVST+ configuration, which port role is assigned to a port that receives superior BPDUs from another switch and acts as an immediate standby interface to the root port?",
    "options": [
      "Alternate Port",
      "Root Port",
      "Backup Port",
      "Designated Port"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "In RSTP (and Rapid PVST+), an Alternate port receives superior BPDUs from another switch. It acts as an alternate path to the root switch and can transition immediately to a forwarding root port if the active root port fails.",
      "wrong": [
        "Backup port receives superior BPDUs from its own switch (usually due to a hub connecting two ports on the same switch) and acts as a backup path to a shared segment.",
        "Designated port is the port on a segment that is elected to forward traffic toward the root bridge.",
        "Root port is the single port on a non-root switch that has the lowest path cost to the root bridge."
      ],
      "tip": "Alternate = Backup path to Root (receives BPDU from ANOTHER switch). Backup = Backup path to segment (receives BPDU from SELF).",
      "memory": "Alternate = Alternate Switch. Backup = Same Switch.",
      "real": "Execute 'show spanning-tree' to see RSTP port roles. Alternate ports will display status as 'Altn BLK'.",
      "commands": [
        "show spanning-tree"
      ]
    }
  },
  {
    "id": 131,
    "domain": "Network Access",
    "topic": "EtherChannel",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "Which combination of EtherChannel negotiation modes on two connected switches will successfully form an EtherChannel?",
    "options": [
      "Switch 1: LACP Passive | Switch 2: LACP Passive",
      "Switch 1: LACP Active | Switch 2: LACP Passive",
      "Switch 1: PAgP Desirable | Switch 2: LACP Active",
      "Switch 1: PAgP Auto | Switch 2: PAgP Auto"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "LACP Active initiates negotiation, while Passive waits for the other side to negotiate. Active-Passive will form a channel. Active-Active will also form a channel.",
      "wrong": [
        "PAgP Desirable and LACP Active cannot form a channel because PAgP (Cisco proprietary) and LACP (IEEE 802.3ad) are incompatible protocols.",
        "PAgP Auto and PAgP Auto will not form a channel because both ports are passive and wait for the other side to initiate negotiation.",
        "LACP Passive and LACP Passive will not form a channel because both ports are passive and will never initiate negotiation."
      ],
      "tip": "At least one side must be in active negotiation mode (Active for LACP, Desirable for PAgP). Protocols must match.",
      "memory": "PAgP = Auto/Desirable. LACP = Passive/Active. Incompatible protocols never bundle.",
      "real": "Always use LACP (Active on both sides) for cross-vendor EtherChannel deployments to ensure multi-chassis link aggregation compatibility.",
      "commands": [
        "channel-group 1 mode active",
        "show etherchannel summary"
      ]
    }
  },
  {
    "id": 132,
    "domain": "Network Access",
    "topic": "VTP Revision",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network administrator adds a refurbished switch to an existing network. The switch is configured in VTP Server mode with the correct VTP domain name, but has a VTP revision number of 45. The existing network's VTP Server has a revision number of 30. What will happen to the VLAN configuration of the existing network?",
    "options": [
      "VTP synchronization will fail and log a mismatched revision error on all switches.",
      "The refurbished switch will update its database with the existing VTP server's configuration.",
      "All switches in the domain will overwrite their VLAN database with the refurbished switch's VLAN database.",
      "The switches will merge their databases and increment the revision to 46."
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "VTP switches overwrite their VLAN database if they receive a VTP advertisement with the same domain name and a higher configuration revision number. If a refurbished switch with a higher revision number (45) is introduced, it will overwrite the database of switches with lower revision numbers (30), which can delete existing VLANs and cause a major outage.",
      "wrong": [
        "The refurbished switch will not update its database because its revision number is higher, not lower.",
        "The switches do not merge databases; VTP completely overwrites the database of the lower revision with that of the higher revision.",
        "No error is logged to block it; VTP automatically accepts the higher revision by design, which is why VTP is considered risky."
      ],
      "tip": "To prevent VTP disasters, change the VTP domain name to a dummy name and back, or change the mode to VTP Transparent before adding a switch to reset the revision number to 0.",
      "memory": "Higher VTP Revision = Overwrites lower revision. Reset to 0 by changing domain/mode.",
      "real": "Reset the VTP revision number of any switch using 'vtp mode transparent' before introducing it to a production network.",
      "commands": [
        "vtp mode transparent",
        "vtp domain dummy",
        "show vtp status"
      ]
    }
  },
  {
    "id": 133,
    "domain": "IP Connectivity",
    "topic": "OSPF Network Types",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "Which OSPF network type is the default on physical serial interfaces, does not elect a DR/BDR, and has a default Hello timer of 10 seconds?",
    "options": [
      "Non-Broadcast Multi-Access (NBMA)",
      "Broadcast",
      "Point-to-Multipoint",
      "Point-to-Point"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "The Point-to-Point OSPF network type is default on serial interfaces running HDLC or PPP encapsulation. It does not perform Designated Router (DR) or Backup Designated Router (BDR) elections because only two routers exist on the link, and its default timers are 10s Hello / 40s Dead.",
      "wrong": [
        "Broadcast is the default on Ethernet interfaces, elects a DR/BDR, and has a 10s Hello timer.",
        "Non-Broadcast Multi-Access (NBMA) is default on Frame Relay and ATM interfaces, elects a DR/BDR, and has a 30s Hello timer.",
        "Point-to-Multipoint does not elect a DR/BDR, but it has a default Hello timer of 30 seconds."
      ],
      "tip": "OSPF Point-to-Point requires no DR/BDR, meaning adjacencies form faster and database exchange is simpler.",
      "memory": "Point-to-Point = No DR/BDR, 10s Hello. Serial default.",
      "real": "Use 'ip ospf network point-to-point' on subinterfaces and Tunnel interfaces to optimize OSPF convergence and reduce DR overhead.",
      "commands": [
        "ip ospf network point-to-point",
        "show ip ospf interface"
      ]
    }
  },
  {
    "id": 134,
    "domain": "IP Connectivity",
    "topic": "OSPF States",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "During the OSPF neighbor adjacency process, in which state do two routers exchange Database Description (DBD) packets to describe their Link-State Database contents?",
    "options": [
      "2-Way State",
      "ExStart State",
      "Exchange State",
      "Loading State"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "In the Exchange state, OSPF routers send Database Description (DBD) packets to each other. These packets contain LSA headers that describe the contents of the router's link-state database.",
      "wrong": [
        "ExStart state is where routers elect a Master/Slave relationship and decide the initial sequence number using empty DBD packets.",
        "Loading state is where routers request missing or newer LSAs using Link State Request (LSR) packets and receive updates via Link State Update (LSU) packets.",
        "2-Way state is where bi-directional communication is established, and DR/BDR elections occur on broadcast networks."
      ],
      "tip": "OSPF State transition flow: Down -> Init -> 2-Way -> ExStart -> Exchange -> Loading -> Full.",
      "memory": "ExStart = Master/Slave election. Exchange = DBD packets. Loading = LSR/LSU.",
      "real": "If OSPF is stuck in ExStart/Exchange, check for MTU mismatches on the connecting interfaces.",
      "commands": [
        "show ip ospf neighbor",
        "debug ip ospf adj"
      ]
    }
  },
  {
    "id": 135,
    "domain": "IP Connectivity",
    "topic": "Route Selection",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A router receives three routing updates for the destination prefix 10.1.1.0/24: OSPF (AD 110, Metric 50), EIGRP (AD 90, Metric 307200), and a Static Route (AD 1, Metric 0). Which route will the router install in the routing table?",
    "options": [
      "All three routes (Load Balancing)",
      "The OSPF Route",
      "The EIGRP Route",
      "The Static Route"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "When a router receives paths to the exact same prefix from different routing sources, it compares the Administrative Distance (AD). The route with the lowest AD is installed. A Static Route has a default AD of 1, which is lower than EIGRP (90) and OSPF (110).",
      "wrong": [
        "EIGRP Route is not selected because its AD (90) is higher than the Static Route (1).",
        "OSPF Route is not selected because its AD (110) is higher than EIGRP (90) and Static Route (1).",
        "Load Balancing only happens if paths have the same prefix, protocol, and cost (or via EIGRP unequal cost load balancing), not across different protocols with different ADs."
      ],
      "tip": "Lowest AD wins when prefix lengths are identical. Lowest Metric wins when comparing routes within the same protocol.",
      "memory": "Route selection priority: 1. Longest Match Prefix, 2. Lowest AD, 3. Lowest Metric.",
      "real": "Verify the routing table using 'show ip route' to check the active protocol code next to the prefix.",
      "commands": [
        "show ip route",
        "show ip route 10.1.1.0"
      ]
    }
  },
  {
    "id": 136,
    "domain": "IP Connectivity",
    "topic": "HSRP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is analyzing a network segment. What is the virtual MAC address of an HSRP group 10 active router configured for IPv4?",
    "options": [
      "0000.0c9f.f00a",
      "0000.0c07.ac10",
      "0000.0c07.ac0a",
      "0100.5e00.000a"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "The HSRP version 1 virtual MAC address structure for IPv4 is 0000.0c07.acXX, where XX is the HSRP group number in hexadecimal. Group 10 in decimal is '0a' in hex. Therefore, the virtual MAC is 0000.0c07.ac0a.",
      "wrong": [
        "0000.0c07.ac10 is incorrect because 10 is in decimal and must be converted to hex ('0a').",
        "0000.0c9f.f00a is the HSRP version 2 virtual MAC address structure (0000.0c9f.fXXX, where XXX is the hex group number). For group 10, that would be f00a.",
        "0100.5e00.000a is a multicast MAC address (used for IPv4 multicast routing mapping), not an HSRP virtual MAC."
      ],
      "tip": "HSRP v1: 0000.0c07.acXX (XX = Hex group). HSRP v2: 0000.0c9f.fXXX (XXX = Hex group). VRRP: 0000.5e00.01XX.",
      "memory": "Convert decimal group to hex! 10 decimal = 0a hex.",
      "real": "When troubleshooting gateway issues, verify client ARP cache using 'arp -a' to see if it shows the HSRP virtual MAC.",
      "commands": [
        "standby 10 ip 192.168.1.254",
        "show standby"
      ]
    }
  },
  {
    "id": 137,
    "domain": "IP Connectivity",
    "topic": "IPv6 Static Routing",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "A systems administrator is configuring a Cisco device. Which command configures a floating static IPv6 route to destination prefix 2001:db8:acad::/64 with a next-hop IP of 2001:db8:feed::1 and an administrative distance of 150?",
    "options": [
      "ipv6 route 2001:db8:acad::/64 2001:db8:feed::1 150",
      "ip route ipv6 2001:db8:acad::/64 2001:db8:feed::1 150",
      "ipv6 route 2001:db8:acad::/64 2001:db8:feed::1 metric 150",
      "ipv6 route 2001:db8:acad::/64 interface g0/1 150"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "The correct command syntax is 'ipv6 route <prefix/length> <next-hop-ip> [administrative-distance]'. In this case: 'ipv6 route 2001:db8:acad::/64 2001:db8:feed::1 150'. The AD is appended directly after the next-hop address.",
      "wrong": [
        "ipv6 route ... interface g0/1 150 is a fully specified or directly attached route using an egress interface, which requires extra next-hop config for multi-access links, and was not requested.",
        "metric 150 is incorrect syntax; Cisco IOS does not use the keyword 'metric' for static route AD assignment.",
        "ip route ipv6 is invalid command structure; IPv6 static routing uses the 'ipv6 route' command."
      ],
      "tip": "Floating static routes are configured with an AD higher than the active routing protocol (e.g. OSPF: 110) so they only enter the routing table if the primary route fails.",
      "memory": "ipv6 route PREFIX/LENGTH NEXT_HOP AD",
      "real": "Configure floating static routes to provide backup connectivity in case OSPF adjacencies fail.",
      "commands": [
        "ipv6 route 2001:db8:acad::/64 2001:db8:feed::1 150"
      ]
    }
  },
  {
    "id": 138,
    "domain": "IP Services",
    "topic": "NAT Overload",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network engineer is analyzing a network segment. What is the theoretical maximum number of concurrent translation sessions that Port Address Translation (PAT) can support using a single inside global IPv4 address?",
    "options": [
      "16,777,216",
      "1,024",
      "4,096",
      "65,536"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "PAT (NAT Overload) translates inside local IP addresses to a single inside global IP address by utilizing unique source port numbers in the TCP and UDP headers. Since the port field is 16 bits in size, there are 2^16 (65,536) theoretical ports available per inside global IP address.",
      "wrong": [
        "1,024 is the maximum number of well-known system ports, not the total port availability.",
        "4,096 is the limit of VLAN IDs, not port translations.",
        "16,777,216 is the number of IPv4 Class A addresses, unrelated to transport layer port limitations."
      ],
      "tip": "In practice, PAT reserves some port ranges, but the theoretical limit is dictated by the 16-bit port number field.",
      "memory": "PAT = Port Address Translation. 16-bit port number = 65,536 sessions.",
      "real": "Monitor active NAT translations using 'show ip nat translations' to check for translation exhaustion in busy corporate environments.",
      "commands": [
        "ip nat inside source list 1 interface GigabitEthernet0/0 overload",
        "show ip nat translations"
      ]
    }
  },
  {
    "id": 139,
    "domain": "IP Services",
    "topic": "DHCP Snooping",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "Medium",
    "text": "Which DHCP Snooping feature inserts information about the switch port and VLAN from which a DHCP request originated into the DHCP packet before forwarding it to the server?",
    "options": [
      "Option 67 (Bootfile Name Option)",
      "Option 82 (Relay Agent Information Option)",
      "Option 43 (WLC IP Option)",
      "Option 150 (TFTP Server Option)"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "DHCP Option 82 (the Relay Agent Information Option) is inserted by DHCP-snooping-enabled switches or DHCP relay agents to provide the DHCP server with details about the physical switch port, VLAN, and MAC address of the requesting client to facilitate strict IP address allocation policies.",
      "wrong": [
        "Option 150 specifies TFTP server IP addresses for IP phone configuration downloads.",
        "Option 67 specifies the bootfile name for network booting clients.",
        "Option 43 specifies the IP address of wireless LAN controllers to lightweight access points."
      ],
      "tip": "DHCP Snooping must be globally enabled and active on the client VLAN for Option 82 insertion to occur.",
      "memory": "Option 82 = Switch Port & VLAN identifier (Relay Agent Information).",
      "real": "Cisco switches insert Option 82 by default when DHCP snooping is enabled, which might cause some DHCP servers to reject requests unless configured to handle it.",
      "commands": [
        "ip dhcp snooping",
        "ip dhcp snooping information option"
      ]
    }
  },
  {
    "id": 140,
    "domain": "IP Services",
    "topic": "SNMPv3",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which SNMPv3 security level provides authentication using HMAC-MD5 or HMAC-SHA but does not provide encryption of the SNMP data packets?",
    "options": [
      "noAuthNoPriv",
      "authNoPriv",
      "noAuthPriv",
      "authPriv"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "The SNMPv3 'authNoPriv' security level provides message authentication and integrity checks using MD5 or SHA algorithms, but it does not encrypt (provide privacy for) the payload data.",
      "wrong": [
        "noAuthNoPriv provides no authentication and no encryption, mimicking older SNMPv1/v2c security but using SNMPv3 headers.",
        "authPriv provides both authentication (MD5/SHA) and encryption (DES/AES) for maximum security.",
        "noAuthPriv is not a valid SNMPv3 security level (you cannot encrypt without authenticating first)."
      ],
      "tip": "SNMPv3 levels: 1) noAuthNoPriv (no security), 2) authNoPriv (password checked), 3) authPriv (password checked + encrypted).",
      "memory": "auth = Authenticated (MD5/SHA). Priv = Private (Encrypted with DES/AES).",
      "real": "Always use SNMPv3 'authPriv' globally to protect network monitoring data from sniffing and spoofing.",
      "commands": [
        "snmp-server group MONITOR v3 auth"
      ]
    }
  },
  {
    "id": 141,
    "domain": "Security Fundamentals",
    "topic": "TACACS+ vs RADIUS",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "Which statement accurately describes a key architectural difference between TACACS+ and RADIUS AAA protocols?",
    "options": [
      "TACACS+ uses TCP port 49 and encrypts the entire packet body, while RADIUS uses UDP ports 1812/1813 and encrypts only the user password.",
      "TACACS+ is an open standard, while RADIUS is a Cisco proprietary protocol.",
      "TACACS+ uses UDP port 49 and encrypts only the password, while RADIUS uses TCP port 1812 and encrypts the entire packet.",
      "TACACS+ merges authentication and authorization into one step, while RADIUS separates them."
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "TACACS+ is a TCP-based protocol (port 49) that separates authentication, authorization, and accounting (AAA) steps, and encrypts the entire packet body (except the header). RADIUS is a UDP-based protocol (ports 1812/1813) that combines authentication and authorization, and only encrypts the password field in the access request.",
      "wrong": [
        "TACACS+ uses TCP, not UDP, and encrypts the entire packet body. RADIUS uses UDP, not TCP.",
        "TACACS+ separates authentication and authorization, whereas RADIUS combines them.",
        "TACACS+ was originally Cisco proprietary (now open), while RADIUS has always been an open standard (RFC-defined)."
      ],
      "tip": "TACACS+ is best for device administration (router logins) because it allows strict command authorization. RADIUS is best for network access (802.1X, dot1x) due to high throughput.",
      "memory": "TACACS+ = TCP 49, separates AAA, encrypts all. RADIUS = UDP 1812, combines Auth/Authz, encrypts password.",
      "real": "Configure TACACS+ servers for device shell access control to track exactly which administrative commands are executed by users.",
      "commands": [
        "tacacs server TAC-SERVER",
        "radius server RAD-SERVER"
      ]
    }
  },
  {
    "id": 142,
    "domain": "Security Fundamentals",
    "topic": "Dynamic ARP Inspection",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "15%",
    "frequency": "High",
    "text": "Dynamic ARP Inspection (DAI) relies on which database to validate IP-to-MAC address bindings of ARP packets on untrusted switch ports?",
    "options": [
      "DHCP Snooping Binding Database",
      "MAC Address Table (CAM)",
      "VLAN database",
      "ARP Cache"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Dynamic ARP Inspection (DAI) intercepts all ARP packets on untrusted ports and validates their IP-to-MAC bindings against the DHCP Snooping Binding Database. If a binding is not found, the ARP packet is dropped.",
      "wrong": [
        "MAC Address Table (CAM) maps Layer 2 MAC addresses to physical switch ports, but does not track IP-to-MAC bindings.",
        "ARP Cache maps IP addresses to MAC addresses on a Layer 3 device, but is not the security source used by DAI to inspect transit packets.",
        "VLAN database holds VLAN IDs and names, not host IP/MAC bindings."
      ],
      "tip": "Before enabling DAI, you must configure DHCP Snooping, or configure static ARP ACLs for hosts with static IP addresses.",
      "memory": "DAI requires DHCP Snooping. No snooping = DAI drops all packets.",
      "real": "Avoid enabling DAI on ports connected to other switches or routers unless those ports are explicitly configured as 'trusted'.",
      "commands": [
        "ip arp inspection vlan 10",
        "ip arp inspection trust"
      ]
    }
  },
  {
    "id": 143,
    "domain": "Security Fundamentals",
    "topic": "Port Security",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "Which port security violation mode drops packets with unknown source MAC addresses, increments the security violation counter, and sends an SNMP trap without shutting down the physical interface?",
    "options": [
      "Disable Mode",
      "Shutdown Mode",
      "Restrict Mode",
      "Protect Mode"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "Port security has three violation modes: Shutdown, Restrict, and Protect. In Restrict mode, the switch drops violating packets, increments the violation counter, and sends syslog messages/SNMP traps. It does not put the port in errdisable state.",
      "wrong": [
        "Protect mode drops violating packets, but does not increment the violation counter or send SNMP/syslog alerts.",
        "Shutdown mode immediately puts the port in errdisable state, disables the port LED, increments the counter, and sends alerts.",
        "Disable Mode is not a valid port security violation mode."
      ],
      "tip": "Use Restrict mode if you want alerts but cannot afford network disruption from a port shutdown. Use Shutdown (default) for absolute containment.",
      "memory": "Protect = Silent drop. Restrict = Drop + Alert. Shutdown = Drop + Alert + Disable interface.",
      "real": "Implement errdisable recovery cause port-security to automatically restore ports shut down by security violations after a specific timeout.",
      "commands": [
        "switchport port-security violation restrict",
        "errdisable recovery cause port-security"
      ]
    }
  },
  {
    "id": 144,
    "domain": "Security Fundamentals",
    "topic": "Device Hardening",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "Medium",
    "text": "Which set of prerequisite configuration steps is required on a Cisco router before generating an RSA key pair for SSH access?",
    "options": [
      "Configure line vty passwords and enable secret.",
      "Configure a hostname and an IP domain name.",
      "Configure local username database and AAA authentication.",
      "Configure interface IP addresses and enable routing."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Cisco IOS requires that a hostname (other than the default 'Router') and an IP domain name ('ip domain-name') be configured before generating the RSA keys used by SSH. The keys are named using the format 'hostname.domainname'.",
      "wrong": [
        "VTY passwords and enable secret are good security practices, but they are not cryptographic prerequisites for RSA key generation.",
        "Interface IP configurations are needed to connect, but they do not block key generation.",
        "Local username database is required for SSH login authentication, but you can generate keys before configuring usernames."
      ],
      "tip": "If you try to run 'crypto key generate rsa' without a domain name, IOS will display a warning: 'Please define a domain-name first.'",
      "memory": "SSH Key prerequisite = Hostname + Domain Name.",
      "real": "Ensure RSA key size is at least 1024 or 2048 bits. Keys under 768 bits will block SSH version 2 execution.",
      "commands": [
        "hostname R1",
        "ip domain-name cisco.local",
        "crypto key generate rsa modulus 2048"
      ]
    }
  },
  {
    "id": 145,
    "domain": "Security Fundamentals",
    "topic": "SD-Access Security",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "15%",
    "frequency": "Medium",
    "text": "In a Cisco Software-Defined Access (SD-Access) architecture, how are security policies enforced between endpoints without depending on IP addresses or VLANs?",
    "options": [
      "By dynamically injecting Access Control Lists (dACL) on every physical switch port.",
      "By running dynamic ARP inspection and DHCP snooping on the overlay fabric.",
      "By assigning Scalable Group Tags (SGT) to endpoints and enforcing Group-Based Policies.",
      "By setting up MACsec encryption keys between all access layer switches."
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "Cisco SD-Access uses Scalable Group Tags (SGT) to represent groups of users or endpoints. The SGT is carried in the VXLAN encapsulation header, and Cisco ISE or DNA Center defines policies based on SGT-to-SGT permissions (SGACLs), completely separating policy from IP address or VLAN membership.",
      "wrong": [
        "dACLs are used in traditional 802.1X, but are not the primary fabric-wide enforcement method of SD-Access.",
        "MACsec secures physical links (Layer 2 encryption), not endpoint-to-endpoint security policies.",
        "DAI and DHCP Snooping are Layer 2 security tools, not group policy controllers."
      ],
      "tip": "SGTs allow policies like 'HR cannot access Finance servers' to persist even if HR users move to different physical branch locations.",
      "memory": "SD-Access Security = SGT (Scalable Group Tag) + SGACL.",
      "real": "Assign SGTs in Cisco ISE based on active directory group membership for consistent policy application.",
      "commands": []
    }
  },
  {
    "id": 146,
    "domain": "Security Fundamentals",
    "topic": "VPN Protocols",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "Which IPsec protocol provides data origin authentication, data integrity, and anti-replay protection, but does NOT provide confidentiality (encryption) for the payload data?",
    "options": [
      "Encapsulating Security Payload (ESP)",
      "Authentication Header (AH)",
      "Diffie-Hellman (DH)",
      "Internet Key Exchange (IKE)"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "The Authentication Header (AH) protocol (IP protocol 51) provides data integrity, origin authentication, and optional anti-replay services. However, it does not encrypt the packet payload, meaning data is sent in clear text. Encapsulating Security Payload (ESP) provides both authentication and encryption.",
      "wrong": [
        "Encapsulating Security Payload (ESP) provides confidentiality (encryption) in addition to authentication.",
        "Internet Key Exchange (IKE) is the control-plane protocol used to negotiate security associations (SAs) and exchange keys, not data transmission.",
        "Diffie-Hellman (DH) is a mathematical algorithm used for secure key exchange over an untrusted channel, not a tunnel protocol."
      ],
      "tip": "AH is rarely used alone today because confidentiality (encryption) is almost always desired. ESP is the standard.",
      "memory": "AH = Authentication only. ESP = Encryption + Authentication.",
      "real": "When configuring IPsec profiles, select ESP-AES for encryption and ESP-SHA-HMAC for hashing.",
      "commands": [
        "crypto ipsec transform-set MYSET esp-aes esp-sha-hmac"
      ]
    }
  },
  {
    "id": 147,
    "domain": "Security Fundamentals",
    "topic": "Wireless Security",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "15%",
    "frequency": "Medium",
    "text": "Which cryptographic handshake protocol is introduced in WPA3 Personal to replace WPA2 Pre-Shared Key (PSK), preventing offline dictionary attacks on wireless passwords?",
    "options": [
      "Temporal Key Integrity Protocol (TKIP)",
      "Extensible Authentication Protocol (EAP-FAST)",
      "Simultaneous Authentication of Equals (SAE)",
      "Pre-Shared Key (PSK)"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "WPA3 Personal replaces the 4-way PSK handshake from WPA2 with Simultaneous Authentication of Equals (SAE), also known as the Dragonfly Key Exchange. SAE resists offline dictionary attacks by executing a zero-knowledge proof, ensuring password security even if the user picks a weak password.",
      "wrong": [
        "TKIP is an older, deprecated encryption protocol used with WPA to replace WEP.",
        "EAP-FAST is an enterprise authentication protocol using tunnels, not personal PSK replacement.",
        "PSK (Pre-Shared Key) is the legacy mechanism used in WPA/WPA2 that is vulnerable to offline dictionary attack."
      ],
      "tip": "SAE makes wireless sniffing useless for password cracking since each exchange uses a unique session key.",
      "memory": "WPA3 Personal = SAE (Simultaneous Authentication of Equals) or Dragonfly.",
      "real": "When designing wireless solutions, configure WPA3 Enterprise (using 802.1X) or WPA3 Personal (with SAE) on new SSIDs.",
      "commands": []
    }
  },
  {
    "id": 148,
    "domain": "Automation and Programmability",
    "topic": "REST APIs",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which HTTP request method is used in a RESTful API to update an existing resource or create it if it does not exist, replacing the entire resource with the payload data?",
    "options": [
      "POST",
      "PUT",
      "PATCH",
      "GET"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "In RESTful APIs, PUT is used to update an existing resource or create it by overwriting the target resource completely. POST is typically used to create a new resource, while PATCH is used to make partial modifications to an existing resource.",
      "wrong": [
        "POST is used to create a new resource at a collection URL.",
        "PATCH is used to apply partial modifications to a resource, rather than replacing it entirely.",
        "GET is a read-only method used to retrieve a representation of a resource."
      ],
      "tip": "PUT is idempotent (calling it multiple times with the same payload results in the same state). POST is not idempotent.",
      "memory": "PUT = Replace entirely (Idempotent). PATCH = Partial change. POST = Create new.",
      "real": "When developing scripts to update configuration on Cisco DNA Center APIs, use PUT to update complete structures.",
      "commands": []
    }
  },
  {
    "id": 149,
    "domain": "Automation and Programmability",
    "topic": "Automation Protocols",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A company is deploying a new service. Which protocol operates over SSH on port 830, uses XML-formatted data payloads, and supports transaction-based configuration commits?",
    "options": [
      "gRPC",
      "SNMP",
      "RESTCONF",
      "NETCONF"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "NETCONF (RFC 6241) is a network management protocol that runs over SSH on port 830, uses XML for data encoding, and supports operations like <get>, <edit-config>, and transaction commits/rollbacks. RESTCONF runs over HTTP/HTTPS (port 443) and supports JSON/XML.",
      "wrong": [
        "RESTCONF runs over HTTPS (port 443) and uses REST-like operations (GET, POST, etc.) rather than SSH.",
        "gRPC is a general RPC framework running over HTTP/2, using Protocol Buffers, not XML over SSH.",
        "SNMP runs over UDP (port 161) and uses Management Information Bases (MIBs) with ASN.1 encoding."
      ],
      "tip": "NETCONF has a candidate configuration datastore, allowing you to edit configurations and commit them as a single atomic transaction.",
      "memory": "NETCONF = SSH 830, XML. RESTCONF = HTTPS 443, JSON/XML.",
      "real": "Enable NETCONF on Cisco devices using 'netconf-yang' to allow automated configuration management via Python ncclient.",
      "commands": [
        "netconf-yang",
        "show netconf-yang status"
      ]
    }
  },
  {
    "id": 150,
    "domain": "Automation and Programmability",
    "topic": "DevOps Tools",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which configuration management tool is agentless, uses SSH for communication, encodes configuration scripts in YAML (Playbooks), and uses a push model to configure managed nodes?",
    "options": [
      "Ansible",
      "Puppet",
      "SaltStack",
      "Chef"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Ansible is agentless (no software needs to be installed on managed devices), communicates over SSH (or netconf/restconf), uses YAML to write its automation blueprints (Playbooks), and operates on a push model where the control node pushes changes to managed hosts.",
      "wrong": [
        "Puppet uses agent software on managed nodes (usually), ruby-based manifests, and a pull model.",
        "Chef uses agent software, ruby-based recipes, and a pull model.",
        "SaltStack is typically agent-based (minions) and written in python, although it has a push option, it is not the classic YAML/SSH agentless standard described."
      ],
      "tip": "Ansible's agentless architecture makes it perfect for Cisco routers and switches because you cannot install third-party agents on most network operating systems.",
      "memory": "Ansible = Agentless, SSH, YAML Playbooks, Push model.",
      "real": "Deploy Ansible on a Linux VM to automate VLAN provisioning across hundreds of campus switches simultaneously.",
      "commands": []
    }
  },
  {
    "id": 151,
    "domain": "Network Fundamentals",
    "topic": "TCP/IP Model",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "During the TCP three-way handshake, which combination of flags is set in the header of the second packet sent between hosts?",
    "options": [
      "SYN and ACK",
      "RST and ACK",
      "ACK only",
      "SYN only"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "The second packet of the TCP handshake is sent from the server back to the client, carrying both the SYN flag (to synchronize sequence numbers) and the ACK flag (to acknowledge the client's initial SYN). Reference: RFC 793.",
      "wrong": [
        "SYN only is the flag set in the first packet sent by the initiator.",
        "ACK only is the flag set in the third packet of the handshake to finalize connection establishment.",
        "RST and ACK are used to abruptly terminate or refuse a connection, not during normal connection setup."
      ],
      "tip": "Handshake sequence: 1) SYN, 2) SYN-ACK, 3) ACK.",
      "memory": "S-SA-A (SYN, SYN-ACK, ACK).",
      "real": "When troubleshooting connection establishment issues using Wireshark, checking for a SYN-ACK response helps determine if the server is active on that port.",
      "commands": [
        "show tcp brief"
      ]
    }
  },
  {
    "id": 152,
    "domain": "Network Fundamentals",
    "topic": "IPv4",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "An engineer wants to summarize the following four subnets into a single advertisement: 192.168.4.0/24, 192.168.5.0/24, 192.168.6.0/24, and 192.168.7.0/24. What is the most specific summary route?",
    "options": [
      "192.168.4.0/22",
      "192.168.0.0/21",
      "192.168.4.0/21",
      "192.168.4.0/23"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Looking at the third octet of the subnets (4, 5, 6, 7), in binary these are: 4 = 00000100, 5 = 00000101, 6 = 00000110, 7 = 00000111. The first 6 bits are identical (000001). Since the first two octets are identical, we have 8 + 8 + 6 = 22 matching bits. The summary route is 192.168.4.0/22. Reference: RFC 4632.",
      "wrong": [
        "192.168.4.0/23 only summarizes 192.168.4.0/24 and 192.168.5.0/24.",
        "192.168.0.0/21 is a valid summary but is not the most specific (it encompasses subnets from 192.168.0.0 to 192.168.7.255).",
        "192.168.4.0/21 is an invalid subnet boundary because a /21 block starting at .4 is mathematically incorrect."
      ],
      "tip": "To find the summary route, list the boundary octets in binary and count the matching bits from left to right.",
      "memory": "A /22 summary block has size of 4 (e.g. 4, 5, 6, 7).",
      "real": "Configuring summary routes on corporate WAN routers reduces the routing table size and limits the query scope for routing protocols.",
      "commands": [
        "ip route 192.168.4.0 255.255.252.0 null0"
      ]
    }
  },
  {
    "id": 153,
    "domain": "Network Fundamentals",
    "topic": "IPv6",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "High",
    "text": "Which IPv6 address type is automatically generated based on the prefix FF02::1:FF00:0/104 and is used to resolve Layer 2 addresses on the local link?",
    "options": [
      "Link-Local Unicast address",
      "Anycast address",
      "Solicited-Node Multicast address",
      "Unique Local address"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "A Solicited-Node Multicast address is automatically created for every configured unicast address by appending the last 24 bits of the interface ID to the prefix FF02::1:FF00:0/104. It is used by NDP to perform MAC address resolution without broadcasting. Reference: RFC 4291.",
      "wrong": [
        "Anycast addresses are assigned to multiple interfaces and do not use a specific FF02::1:FF00:0/104 prefix.",
        "Unique Local addresses use the FC00::/7 prefix and represent private IPv6 addresses.",
        "Link-Local Unicast addresses use the FE80::/10 prefix, not a multicast prefix."
      ],
      "tip": "IPv6 completely eliminates Layer 2 broadcasts by using Solicited-Node Multicast addresses for MAC resolution.",
      "memory": "FF02::1:FF = Solicited-Node Multicast.",
      "real": "When configuring IPv6, switches use MLD snooping to forward NDP neighbor solicitations only to the ports interested in that Solicited-Node Multicast address.",
      "commands": [
        "show ipv6 interface"
      ]
    }
  },
  {
    "id": 154,
    "domain": "Network Fundamentals",
    "topic": "Subnetting",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is analyzing a network segment. What is the subnet ID and the broadcast address for the IP address 172.16.82.140/22?",
    "options": [
      "Subnet: 172.16.80.0, Broadcast: 172.16.83.255",
      "Subnet: 172.16.82.128, Broadcast: 172.16.82.255",
      "Subnet: 172.16.80.0, Broadcast: 172.16.81.255",
      "Subnet: 172.16.82.0, Broadcast: 172.16.82.255"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "A /22 subnet mask has a block increment of 4 in the third octet (256 - 252 = 4). The subnets in this range start at 172.16.80.0, 172.16.84.0, etc. Host 172.16.82.140 falls inside the 172.16.80.0 subnet. The broadcast address is one less than the next subnet: 172.16.84.0 - 1 = 172.16.83.255. Reference: RFC 4632.",
      "wrong": [
        "172.16.82.0/22 is not a valid subnet ID boundary (82 is not a multiple of 4).",
        "172.16.81.255 is the broadcast of the 172.16.80.0/23 subnet, not /22.",
        "172.16.82.128 is a subnet ID for a /25 or higher mask, not a /22 mask."
      ],
      "tip": "/22 has block size 4 in the 3rd octet. Multiples of 4: 0, 4, ..., 80, 84. The host is in the 80 block.",
      "memory": "/22 = block size of 4 in 3rd octet.",
      "real": "When configuring a router subinterface for inter-VLAN routing, verify the IP subnet ranges overlap to prevent address conflicts.",
      "commands": [
        "show ip route"
      ]
    }
  },
  {
    "id": 155,
    "domain": "Network Fundamentals",
    "topic": "Ethernet",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. Which of the following standards specifies 10 Gigabit Ethernet over single-mode fiber (SMF) with a maximum distance of up to 10 kilometers?",
    "options": [
      "10GBASE-SR",
      "10GBASE-ER",
      "10GBASE-T",
      "10GBASE-LR"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "10GBASE-LR (Long Range) is designed for single-mode fiber (SMF) using a 1310 nm laser source. It supports transmission distances up to 10 kilometers. Reference: IEEE 802.3ae.",
      "wrong": [
        "10GBASE-SR (Short Range) is designed for multimode fiber (MMF) with a maximum distance of ~300 meters.",
        "10GBASE-ER (Extended Range) supports distances up to 40 kilometers over SMF.",
        "10GBASE-T specifies copper twisted-pair cabling up to 100 meters, not fiber."
      ],
      "tip": "LR = Long Range = Single-mode (10 km). SR = Short Range = Multimode (300m).",
      "memory": "LR = Laser/Long Range. SR = Short Range.",
      "real": "When connecting aggregation switches between two campus buildings 3 km apart, choose 10GBASE-LR SFP+ transceivers on single-mode fiber.",
      "commands": [
        "show interfaces transceiver"
      ]
    }
  },
  {
    "id": 156,
    "domain": "Network Fundamentals",
    "topic": "TCP/IP Model",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "What are the default header sizes of TCP and UDP packets at the Transport Layer, assuming no optional fields are present?",
    "options": [
      "TCP: 8 bytes, UDP: 20 bytes",
      "TCP: 20 bytes, UDP: 20 bytes",
      "TCP: 20 bytes, UDP: 8 bytes",
      "TCP: 40 bytes, UDP: 16 bytes"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "A TCP header has a minimum size of 20 bytes (containing Source/Destination Ports, Sequence/ACK numbers, flags, window, checksum, etc.). A UDP header is fixed at 8 bytes (Source/Destination Ports, Length, and Checksum). Reference: RFC 793 and RFC 768.",
      "wrong": [
        "TCP has a larger header (20 bytes) than UDP (8 bytes) due to its reliability features.",
        "UDP has only 8 bytes of overhead, not 20.",
        "A 40-byte header is the size of the base IPv6 header, not TCP/UDP."
      ],
      "tip": "UDP's small 8-byte header makes it perfect for applications like DNS and VoIP that require low overhead.",
      "memory": "TCP = 20, UDP = 8.",
      "real": "When designing WAN networks, keep the 20-byte TCP overhead in mind when configuring maximum segment size (MSS) to prevent fragmentation.",
      "commands": []
    }
  },
  {
    "id": 157,
    "domain": "Network Fundamentals",
    "topic": "DHCP",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "What action does a router perform on a DHCP Discover broadcast when the command 'ip helper-address 10.1.1.5' is configured on the ingress interface?",
    "options": [
      "It drops the broadcast packet to prevent broadcast storms.",
      "It replies to the client directly with a leased IP address.",
      "It floods the DHCP Discover packet out of all interfaces in the routing table.",
      "It unicasts the DHCP Discover packet to 10.1.1.5, changing the source IP to its own interface IP."
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "The 'ip helper-address' command configures a router to act as a DHCP Relay Agent. It intercepts local DHCP broadcasts, encapsulates them into unicast UDP packets, changes the source IP to its local interface IP (giaddr), and forwards them to the specified DHCP server. Reference: RFC 2131.",
      "wrong": [
        "It does not drop the packet; it relays it.",
        "It does not flood it as a broadcast; it unicasts it directly to the helper address.",
        "It does not lease addresses itself; that is the DHCP server's role."
      ],
      "tip": "An ip helper-address redirects UDP broadcasts including DHCP (67/68), DNS (53), Time (37), TACACS (49), TFTP (69), and NetBIOS.",
      "memory": "Helper = Relay = Broadcast to Unicast.",
      "real": "In enterprise networks, DHCP servers are centralized in the server farm. Routers at the access layer must use helper addresses to relay requests from local users.",
      "commands": [
        "ip helper-address 10.1.1.5"
      ]
    }
  },
  {
    "id": 158,
    "domain": "Network Fundamentals",
    "topic": "ARP",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "Which feature allows a router to answer an ARP request on behalf of a remote destination host when the router knows how to route to that destination?",
    "options": [
      "Gratuitous ARP",
      "Proxy ARP",
      "ARP Snooping",
      "Reverse ARP (RARP)"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Proxy ARP (RFC 1027) allows a gateway device (like a router) to reply to local ARP queries for hosts on remote subnets, sending its own MAC address to the requester. This occurs if Proxy ARP is enabled and the router has a route to the target IP.",
      "wrong": [
        "RARP is used by hosts to learn their IP address from a MAC address, obsolete now.",
        "Gratuitous ARP is sent by a host to announce its own MAC/IP binding to the local link to prevent conflicts.",
        "ARP Snooping is not a routing protocol or standard ARP behavior."
      ],
      "tip": "Proxy ARP is enabled by default in Cisco IOS, but it is often disabled for security to prevent MAC table spoofing.",
      "memory": "Proxy = acting on behalf of someone else.",
      "real": "If a local host has an incorrect subnet mask, it may try to ARP for a remote IP. If the router has Proxy ARP enabled, it replies with its own MAC, making communication work anyway.",
      "commands": [
        "ip proxy-arp",
        "no ip proxy-arp"
      ]
    }
  },
  {
    "id": 159,
    "domain": "Network Fundamentals",
    "topic": "ICMP",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "When a router receives a packet that it cannot forward because no route exists in the routing table, which ICMP Type and Code does it send back to the source host?",
    "options": [
      "Type 11, Code 0 (TTL Expired)",
      "Type 3, Code 1 (Host Unreachable)",
      "Type 3, Code 0 (Net Unreachable)",
      "Type 3, Code 3 (Port Unreachable)"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "When a router lacks a route to the destination network, it discards the packet and sends an ICMP Destination Unreachable message back to the source, specified as Type 3, Code 0 (Net Unreachable). Reference: RFC 792.",
      "wrong": [
        "Code 1 (Host Unreachable) is sent when the router can reach the subnet but the host does not respond to ARP.",
        "Code 3 (Port Unreachable) is sent by a destination host when a UDP port is closed.",
        "Type 11, Code 0 is sent when a packet's TTL count reaches 0 to prevent routing loops."
      ],
      "tip": "ICMP Type 3 = Destination Unreachable. Code 0 = Network, Code 1 = Host, Code 3 = Port.",
      "memory": "Type 3 Code 0 = Network Unreachable.",
      "real": "When debugging network path outages, seeing 'Destination Net Unreachable' in your ping output indicates a missing route on an upstream gateway.",
      "commands": []
    }
  },
  {
    "id": 160,
    "domain": "Network Fundamentals",
    "topic": "DNS",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "In DNS resolution, what is the difference between a recursive query and an iterative query?",
    "options": [
      "A recursive query is sent over UDP; an iterative query is sent over TCP.",
      "A recursive query caches responses; an iterative query does not cache.",
      "A recursive query requires the DNS server to return the final IP address; an iterative query allows the server to return the address of another DNS server.",
      "A recursive query resolves external domains; an iterative query resolves local domains."
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "In a recursive query (typically sent by a client to its local DNS resolver), the server must return the resolved address or an error. In an iterative query (sent between DNS servers), a queried server returns the best answer it has or refers the requester to an authoritative server. Reference: RFC 1034.",
      "wrong": [
        "Both query types can use UDP or TCP (standard queries use port 53 UDP).",
        "The difference lies in resolution behavior, not whether the domain is local or external.",
        "Caching is supported in both models to speed up lookup times."
      ],
      "tip": "Clients send Recursive queries to their resolver. Resolvers send Iterative queries to root and TLD servers.",
      "memory": "Recursive = server does all the work. Iterative = server gives directions.",
      "real": "When configuring DNS servers, you can disable recursive queries to prevent open DNS resolver DDoS reflection attacks.",
      "commands": [
        "ip dns server"
      ]
    }
  },
  {
    "id": 161,
    "domain": "Network Access",
    "topic": "VLANs",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "An administrator configures a switch port connected to an IP Phone and a PC. How is the traffic from the IP Phone separated from the PC traffic at Layer 2?",
    "options": [
      "All voice packets are encrypted using WPA3 enterprise.",
      "The IP Phone traffic is tagged with an 802.1Q VLAN ID, while the PC traffic is sent untagged.",
      "Both device payloads are encapsulated in an ISL header.",
      "The switch port operates in full trunk mode and requires a subnet route."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "A Cisco switch port with a Voice VLAN configured (e.g. 'switchport voice vlan 50') operates in a special multi-VLAN access mode. The IP Phone sends its voice traffic tagged with the voice VLAN ID (using 802.1Q), while the PC sends its data traffic untagged (assumed to belong to the access VLAN). Reference: Cisco Voice VLAN designs.",
      "wrong": [
        "ISL is a legacy, proprietary Cisco encapsulation protocol that is obsolete.",
        "Trunk mode is not required for standard IP Phone attachments; access mode with a voice VLAN is preferred.",
        "WPA3 is a wireless security standard and does not apply to wired switch ports."
      ],
      "tip": "Voice VLAN configuration: 'switchport access vlan 10' and 'switchport voice vlan 20'.",
      "memory": "Voice VLAN = Tagged. Access VLAN = Untagged.",
      "real": "Configuring a voice VLAN separates IP phone traffic from PC traffic, allowing you to prioritize voice traffic using Class of Service (CoS) values.",
      "commands": [
        "switchport voice vlan 50"
      ]
    }
  },
  {
    "id": 162,
    "domain": "Network Access",
    "topic": "Trunks",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A switch port is configured with 'switchport mode dynamic desirable'. What state will the link negotiate to if the neighboring switch port is set to 'dynamic auto'?",
    "options": [
      "The link will negotiation an EtherChannel.",
      "The link will remain in a down state.",
      "The link will become an access link.",
      "The link will become an 802.1Q trunk link."
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Dynamic Desirable actively negotiates to become a trunk. Dynamic Auto only listens. Since one side is desirable (actively asking) and the other is auto (willing to respond), they will negotiate and establish an 802.1Q trunk. Reference: Cisco DTP specification.",
      "wrong": [
        "The link will only become an access link if both sides are set to 'dynamic auto' or configured as 'access'.",
        "The link will negotiate successfully, so it will not remain down.",
        "DTP negotiates trunking, not EtherChannel (which uses LACP/PAGP)."
      ],
      "tip": "Trunk negotiations: Desirable + Auto = Trunk. Desirable + Desirable = Trunk. Auto + Auto = Access.",
      "memory": "Desirable actively starts the trunk talk. Auto just waits.",
      "real": "Disable trunk negotiation on links to end devices using 'switchport nonegotiate' to prevent security breaches and unauthorized trunking.",
      "commands": [
        "switchport nonegotiate",
        "show dtp interface"
      ]
    }
  },
  {
    "id": 163,
    "domain": "Network Access",
    "topic": "STP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A switch port configured with PortFast receives a Bridge Protocol Data Unit (BPDU). What happens to the port if BPDU Guard is enabled globally on that port?",
    "options": [
      "The port transitions immediately to the forwarding state.",
      "The port is placed into the err-disabled state to prevent loops.",
      "The port ignores the BPDU and continues forwarding traffic.",
      "The port becomes the new root port."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "BPDU Guard protects the network from loops. If a BPDU is received on an edge port configured with PortFast and BPDU Guard, the switch assumes an unauthorized switch has been connected and disables the port, placing it in the 'err-disabled' state. Reference: IEEE 802.1D.",
      "wrong": [
        "PortFast allows ports to bypass learning/listening, but BPDU Guard shuts the port down if a BPDU is received.",
        "The BPDU is not ignored; receiving it triggers the loop protection shutdown.",
        "Edge ports cannot become root ports."
      ],
      "tip": "Always enable BPDU Guard on all access ports where PortFast is configured.",
      "memory": "BPDU Guard + BPDU = Err-disabled.",
      "real": "When a user connects a rogue switch to a wall jack, BPDU Guard detects the switch's BPDUs and shuts down the port, protecting the spanning tree.",
      "commands": [
        "spanning-tree portfast bpduguard default",
        "show interfaces status err-disabled"
      ]
    }
  },
  {
    "id": 164,
    "domain": "Network Access",
    "topic": "STP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network engineer is troubleshooting an issue. Which of the following ports states is present in IEEE 802.1D Spanning Tree Protocol but is merged into the Discarding state in 802.1w (RSTP)?",
    "options": [
      "Disabled and Forwarding",
      "Learning and Forwarding",
      "Listening and Learning",
      "Blocking and Listening"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "RSTP (802.1w) simplifies STP states by merging the Disabled, Blocking, and Listening states from 802.1D into a single 'Discarding' state. In this state, the port does not forward frames or learn MAC addresses. Reference: IEEE 802.1w.",
      "wrong": [
        "Learning and Forwarding are still distinct states in RSTP.",
        "Disabled is merged, but Forwarding is still a core state in RSTP.",
        "Listening is merged, but Learning remains a distinct transition state in RSTP."
      ],
      "tip": "STP States: Blocking, Listening, Learning, Forwarding. RSTP States: Discarding, Learning, Forwarding.",
      "memory": "BLD in 802.1D becomes Discarding in RSTP.",
      "real": "RSTP's simplified state model, combined with proposal-agreement handshakes, allows links to transition to forwarding in milliseconds instead of 30-50 seconds.",
      "commands": [
        "spanning-tree mode rapid-pvst"
      ]
    }
  },
  {
    "id": 165,
    "domain": "Network Access",
    "topic": "EtherChannel",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "Which port mode configuration is required to initiate an EtherChannel negotiation using the Link Aggregation Control Protocol (LACP)?",
    "options": [
      "Desirable",
      "Active",
      "Passive",
      "Auto"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "LACP is the industry-standard (IEEE 802.3ad) link aggregation protocol. The 'active' mode actively negotiates the port aggregation, while 'passive' only responds. The 'desirable' and 'auto' modes belong to PAgP (Port Aggregation Protocol), which is Cisco-proprietary. Reference: IEEE 802.3ad.",
      "wrong": [
        "Desirable and Auto are PAgP modes, not LACP.",
        "Passive is an LACP mode, but it does not initiate the negotiation (it only listens).",
        "The other option represents an incorrect parameter or protocol behavior."
      ],
      "tip": "LACP = Active / Passive. PAgP = Desirable / Auto.",
      "memory": "LACP Active/Passive. PAgP Desirable/Auto.",
      "real": "When configuring a multi-chassis link bundle to a non-Cisco server or switch, use LACP 'active' mode on the switch interfaces.",
      "commands": [
        "channel-group 1 mode active",
        "show etherchannel summary"
      ]
    }
  },
  {
    "id": 166,
    "domain": "Network Access",
    "topic": "Wireless",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A remote branch office has lightweight APs (LAPs) connected to the corporate WLC over a WAN link. If the WAN link fails, what happens to local client traffic if the APs are configured in FlexConnect mode?",
    "options": [
      "The APs switch to local switching mode, allowing local traffic to continue flowing normally.",
      "Clients lose all network access immediately.",
      "The APs coordinate with the local router to start DHCP service.",
      "The APs reboot and establish a standalone mesh network."
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "FlexConnect (formerly HREAP) is designed for branch office deployments. It allows lightweight APs to switch traffic locally on the branch switch, rather than tunneling it back to the WLC. If the WAN connection to the central WLC drops, the AP can continue to bridge local SSID traffic. Reference: Cisco FlexConnect configuration guides.",
      "wrong": [
        "Local client traffic does not fail if local switching is enabled.",
        "APs do not form a mesh network automatically.",
        "APs do not run DHCP services."
      ],
      "tip": "FlexConnect allows: 1) Central switching (default), 2) Local switching (survivable WAN).",
      "memory": "FlexConnect = Flexible branch connection that survives WAN failure.",
      "real": "Configure FlexConnect on remote warehouse APs to ensure local barcode scanners can communicate with the local server even if the main headquarters link is down.",
      "commands": [
        "show ap config general"
      ]
    }
  },
  {
    "id": 167,
    "domain": "Network Access",
    "topic": "STP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "Two switches have the default spanning-tree bridge priority of 32768. Which parameter is used as a tie-breaker to select the Spanning Tree Root Bridge?",
    "options": [
      "The switch with the highest MAC address",
      "The switch with the lowest MAC address",
      "The switch with the fastest physical interface speeds",
      "The switch with the longest uptime"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "The Spanning Tree Bridge ID consists of Priority + MAC Address. If the priorities match, the switch with the lowest MAC address wins the election and becomes the Root Bridge. Reference: IEEE 802.1D.",
      "wrong": [
        "The highest MAC address loses the Root Bridge election.",
        "Physical interface speeds and uptime are not included in the Bridge ID calculation.",
        "The other option represents an incorrect parameter or protocol behavior."
      ],
      "tip": "Bridge ID = Priority (2 bytes) + MAC (6 bytes). The lowest ID always wins.",
      "memory": "Lowest MAC is the tie-breaker.",
      "real": "To keep Root Bridge placement predictable, engineers manually lower the priority of core switches (e.g. to 4096 or 8192) to prevent a random edge switch from winning the election.",
      "commands": [
        "spanning-tree vlan 1 root primary",
        "spanning-tree vlan 1 priority 4096"
      ]
    }
  },
  {
    "id": 168,
    "domain": "Network Access",
    "topic": "EtherChannel",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A systems administrator is configuring a Cisco device. Which command must be executed on a Cisco switch interface before it can be configured as a member of a Layer 3 (routed) EtherChannel?",
    "options": [
      "ip routing",
      "channel-group 1 mode on",
      "switchport mode trunk",
      "no switchport"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "By default, switch ports are Layer 2 interfaces. To configure a Layer 3 EtherChannel, you must first turn off Layer 2 functionality on the physical member interfaces using the 'no switchport' command, and then assign the IP address directly to the logical port-channel interface. Reference: Cisco Layer 3 EtherChannel guides.",
      "wrong": [
        "Trunk mode is a Layer 2 configuration.",
        "ip routing enables routing globally on the switch, not on the individual interface interface.",
        "channel-group establishes the EtherChannel but does not convert the interface to Layer 3."
      ],
      "tip": "L3 EtherChannel steps: 1) 'no switchport' on physical member interfaces. 2) 'interface port-channel X' followed by 'no switchport' and the IP configuration.",
      "memory": "no switchport = Layer 3 routed interface.",
      "real": "Layer 3 EtherChannels are common between distribution and core switches to allow ECMP load balancing and eliminate spanning-tree loops on inter-switch links.",
      "commands": [
        "no switchport",
        "interface port-channel 1"
      ]
    }
  },
  {
    "id": 169,
    "domain": "Network Access",
    "topic": "Wireless",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which of the following channel selections represents the three non-overlapping channels available in the 2.4 GHz wireless band?",
    "options": [
      "Channels 36, 40, and 44",
      "Channels 1, 6, and 11",
      "Channels 6, 11, and 14",
      "Channels 1, 2, and 3"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "The 2.4 GHz Wi-Fi band has channels spaced 5 MHz apart, but each channel requires 20-22 MHz of bandwidth. Therefore, only channels 1, 6, and 11 have enough frequency separation to prevent adjacent-channel interference. Reference: IEEE 802.11 standards.",
      "wrong": [
        "Channels 1, 2, and 3 overlap heavily and cause co-channel interference.",
        "Channels 36, 40, and 44 are located in the 5 GHz band, not 2.4 GHz.",
        "Channel 14 is not allowed for commercial use in most countries, including the US."
      ],
      "tip": "Always design 2.4 GHz channel layouts using ONLY channels 1, 6, and 11.",
      "memory": "1-6-11 is the gold standard of 2.4 GHz Wi-Fi.",
      "real": "When configuring access points in an office floor plan, stagger channels 1, 6, and 11 to avoid overlapping coverage zones.",
      "commands": [
        "channel 6"
      ]
    }
  },
  {
    "id": 170,
    "domain": "Network Access",
    "topic": "VLANs",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A systems administrator is configuring a Cisco device. Which command is used to restrict a trunk link to forward traffic only for VLANs 10 and 20?",
    "options": [
      "switchport trunk allowed vlan add 10,20",
      "switchport trunk allowed vlan 10,20",
      "switchport access vlan 10,20",
      "switchport trunk native vlan 10"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "The command 'switchport trunk allowed vlan 10,20' sets the allowed VLAN list on the trunk port to exactly 10 and 20, filtering out all other VLAN traffic. Reference: Cisco IOS Command Reference.",
      "wrong": [
        "switchport access vlan configures an access port, not a trunk port.",
        "switchport trunk native vlan sets the untagged native VLAN, not the allowed list.",
        "Using the 'add' keyword adds those VLANs to the existing list, which might still contain other allowed VLANs (e.g. VLAN 1)."
      ],
      "tip": "Be careful! Running 'switchport trunk allowed vlan X' overwrites the previous list. Use the 'add' keyword to add a new VLAN without wiping the existing list.",
      "memory": "allowed vlan X,Y overrides the list.",
      "real": "Pruning unused VLANs from trunk lines is a security best practice that prevents broadcast propagation to parts of the network that don't host those devices.",
      "commands": [
        "switchport trunk allowed vlan 10,20"
      ]
    }
  },
  {
    "id": 171,
    "domain": "IP Connectivity",
    "topic": "Routing",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "An engineer wants to configure a floating static route to act as a backup to an OSPF route. OSPF has an administrative distance of 110. Which AD should be configured on the static route?",
    "options": [
      "1",
      "90",
      "115",
      "110"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "A floating static route is a backup route configured with a higher administrative distance (AD) than the primary routing source. Since the primary OSPF route has an AD of 110, the backup static route must have an AD greater than 110 (such as 115 or 120) to ensure it is only active if the OSPF route is lost. Reference: Cisco routing guides.",
      "wrong": [
        "An AD of 1 is the default for static routes. Since 1 < 110, the static route would override the OSPF route.",
        "90 is the AD of EIGRP, which would also override OSPF.",
        "Setting the AD to 110 creates AD parity, which can cause erratic routing table selections."
      ],
      "tip": "To float a static route, append the backup AD to the end of the route command (e.g., 'ip route 0.0.0.0 0.0.0.0 10.1.1.1 120').",
      "memory": "Floating route = Backup route = Higher AD.",
      "real": "Configure a floating static route pointing to an LTE modem gateway with an AD of 130 to ensure it only activates if the primary fiber link (OSPF/BGP) fails.",
      "commands": [
        "ip route 0.0.0.0 0.0.0.0 192.168.1.1 120"
      ]
    }
  },
  {
    "id": 172,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "dragdrop",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "Order the OSPF neighbor state transitions from Down to Full adjacency.",
    "order": [
      "Init: Hello packet received from neighbor, but sender ID is not in it.",
      "Two-Way: Bi-directional communication is established (DR/BDR elected here).",
      "ExStart: Neighbors determine master/slave roles and initial DD sequence numbers.",
      "Exchange: Neighbors exchange Database Description (DD) packets.",
      "Loading: Link-state request (LSR) and update (LSU) packets are exchanged.",
      "Full: Link-state databases are fully synchronized."
    ],
    "correct": [
      0,
      1,
      2,
      3,
      4,
      5
    ],
    "expl": {
      "correct": "A, B, C, D, E, F",
      "why": "OSPF neighbors transition through Down -> Init -> Two-Way -> ExStart -> Exchange -> Loading -> Full to establish a complete routing adjacency. Reference: RFC 2328.",
      "wrong": [
        "DR/BDR elections must happen at Two-Way before the database synchronization starts in ExStart.",
        "Exchange of DD packets must precede the Loading phase where actual link-state updates are requested."
      ],
      "tip": "Remember: ExStart comes before Exchange. ExStart decides who speaks first; Exchange actually sends the summaries.",
      "memory": "I-2-E-E-L-F (Init, Two-Way, ExStart, Exchange, Loading, Full).",
      "real": "When troubleshooting OSPF neighbor issues, a neighbor stuck in the 'Init' state indicates it is receiving hello packets but not seeing its own Router ID returned.",
      "commands": [
        "show ip ospf neighbor"
      ]
    }
  },
  {
    "id": 173,
    "domain": "IP Connectivity",
    "topic": "Route Selection",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A router has a packet destined for 10.1.1.37. The routing table contains three matching entries: 10.1.1.0/24 [110/20] via OSPF, 10.1.1.32/28 [110/30] via OSPF, and 10.1.1.32/27 [90/10] via EIGRP. Which route will be selected?",
    "options": [
      "10.1.1.32/27 via EIGRP because EIGRP has a lower AD (90) than OSPF (110).",
      "The router will load-balance across all three routes.",
      "10.1.1.0/24 via OSPF because it has the lowest metric (20).",
      "10.1.1.32/28 via OSPF because it has the longest prefix match (/28)."
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "When a router selects a route, it always evaluates matches in this order: 1) Longest Prefix Match (most specific subnet mask), 2) Lowest Administrative Distance, 3) Lowest Metric. The prefix /28 is longer and more specific than /27 and /24, so it is chosen first, regardless of AD or metric. Reference: Cisco route selection algorithm.",
      "wrong": [
        "AD is only evaluated if there is a prefix length tie.",
        "Metric is only evaluated if both the prefix length and the AD match.",
        "Load balancing only occurs between routes with identical prefix lengths, ADs, and metrics."
      ],
      "tip": "Longest Prefix Match (LPM) wins every time. Mask length is the ultimate tie-breaker.",
      "memory": "LPM -> AD -> Metric.",
      "real": "If a static default route (0.0.0.0/0) has AD 1, and an OSPF route (10.0.0.0/8) has AD 110, traffic to 10.1.1.1 will take the OSPF route because /8 is more specific than /0.",
      "commands": [
        "show ip route 10.1.1.37"
      ]
    }
  },
  {
    "id": 174,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "In OSPFv2, which method has the highest priority for selecting the Router ID (RID)?",
    "options": [
      "The highest IPv4 address on any active loopback interface",
      "The MAC address of the active native VLAN",
      "The manually configured router-id command value under the OSPF process",
      "The highest IPv4 address on any active physical interface"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "The OSPF Router ID selection priority is: 1) Manual configuration via the 'router-id' command, 2) Highest IPv4 address on an active loopback interface, 3) Highest IPv4 address on any active physical interface. Reference: RFC 2328.",
      "wrong": [
        "Loopback IP is used only if no manual router ID is configured.",
        "Physical interface IP is the last resort used if no manual RID or loopback exists.",
        "MAC addresses are not used to determine the OSPF Router ID."
      ],
      "tip": "Always manually configure the Router ID in OSPF to prevent it from changing if interfaces flap.",
      "memory": "Manual RID > Loopback IP > Physical IP.",
      "real": "When setting up a new OSPF area, standard practice is to configure the router ID to match the loopback address for network management tracking.",
      "commands": [
        "router-id 1.1.1.1",
        "show ip ospf"
      ]
    }
  },
  {
    "id": 175,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "Which OSPF network type is the default when OSPF is enabled on a standard Ethernet interface, and what is its default Hello timer value?",
    "options": [
      "Broadcast, Hello: 10 seconds",
      "Point-to-Point, Hello: 10 seconds",
      "Broadcast, Hello: 30 seconds",
      "Non-Broadcast Multi-Access (NBMA), Hello: 30 seconds"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Ethernet interfaces default to the Broadcast network type in OSPF. The default Hello timer for broadcast networks is 10 seconds (Dead timer is 40 seconds). Reference: RFC 2328.",
      "wrong": [
        "Point-to-Point is the default for serial interfaces, not Ethernet.",
        "Broadcast interfaces use a 10-second hello timer, not 30.",
        "NBMA is the default for Frame Relay interfaces, using a 30-second Hello timer."
      ],
      "tip": "Broadcast and Point-to-Point OSPF networks default to a 10-second Hello timer. NBMA and Point-to-Multipoint default to 30 seconds.",
      "memory": "Ethernet = Broadcast = 10s Hello.",
      "real": "Changing the OSPF network type to point-to-point on links where only two routers are connected speeds up convergence because it bypasses DR/BDR election.",
      "commands": [
        "ip ospf network point-to-point",
        "show ip ospf interface"
      ]
    }
  },
  {
    "id": 176,
    "domain": "IP Connectivity",
    "topic": "Routing",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "25%",
    "frequency": "High",
    "text": "Which destination subnet mask combination represents a default route (gateway of last resort) in an IPv4 routing table?",
    "options": [
      "127.0.0.1/8",
      "255.255.255.255/32",
      "0.0.0.0/0",
      "255.0.0.0/8"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "A default route matches all traffic that does not have a more specific destination route in the routing table. It is represented by 0.0.0.0 with mask 0.0.0.0 (or 0.0.0.0/0 in CIDR). Reference: RFC 1812.",
      "wrong": [
        "255.255.255.255/32 represents a host route for the local subnet broadcast.",
        "127.0.0.1/8 is the local host loopback subnet.",
        "255.0.0.0/8 is a Class A network mask."
      ],
      "tip": "The default route is the fallback route used when no other matching entry exists.",
      "memory": "0.0.0.0/0 = Default Route = Gateway of Last Resort.",
      "real": "Configure a default static route pointing out the internet-facing WAN interface to ensure branch hosts can reach external sites.",
      "commands": [
        "ip route 0.0.0.0 0.0.0.0 203.0.113.1"
      ]
    }
  },
  {
    "id": 177,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "A network engineer is analyzing a network segment. What is the result of configuring the command 'passive-interface GigabitEthernet 0/1' under the active OSPF process?",
    "options": [
      "The interface is configured to run OSPF over SSL.",
      "The interface advertises its network prefix, but stops sending and receiving OSPF Hello packets.",
      "The interface is disabled and no longer routes IP traffic.",
      "The interface continues to send hello packets but ignores incoming updates."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "A passive OSPF interface stops sending and receiving OSPF Hello packets, preventing adjacencies from forming on that port. However, OSPF still advertises the interface's subnet to other OSPF neighbors. Reference: RFC 2328.",
      "wrong": [
        "The interface still forwards standard IP traffic normally.",
        "Hello packets are completely blocked, preventing neighbor discovery.",
        "OSPF does not use SSL for interface security."
      ],
      "tip": "Use passive interfaces on LAN-facing ports to prevent users from connecting rogue OSPF routers.",
      "memory": "Passive interface = Advertised, but no Hellos.",
      "real": "When configuring OSPF on a branch router, set client-facing access interfaces as passive to secure the control plane.",
      "commands": [
        "passive-interface default",
        "no passive-interface gig0/0"
      ]
    }
  },
  {
    "id": 178,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "Why does multi-area OSPF design require all non-backbone areas to connect directly to Area 0 (Backbone Area)?",
    "options": [
      "Because Area 0 is the only area that supports OSPF MD5 authentication",
      "To prevent routing loops by enforcing a hub-and-spoke topology for inter-area updates",
      "To allow switches to run Rapid Spanning Tree Protocol across area boundaries",
      "To reduce the OSPF hello timer values"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "OSPF prevents inter-area routing loops by requiring a loop-free, logical hub-and-spoke topology. Area 0 acts as the hub, and all non-backbone areas must connect to it. Inter-area traffic must traverse the backbone to prevent loops. Reference: RFC 2328.",
      "wrong": [
        "Spanning Tree handles Layer 2 loops and does not cross Layer 3 OSPF area boundaries.",
        "MD5 authentication is supported in all OSPF areas.",
        "OSPF hello timers are configured per-interface and do not depend on backbone routing."
      ],
      "tip": "All OSPF inter-area traffic must pass through Area 0. Non-backbone areas cannot exchange routing updates directly.",
      "memory": "Area 0 = Hub = Loop Prevention.",
      "real": "If a physical connection to Area 0 is impossible, configure an OSPF virtual link across a transit area to restore routing paths.",
      "commands": [
        "area 1 virtual-link 2.2.2.2"
      ]
    }
  },
  {
    "id": 179,
    "domain": "IP Connectivity",
    "topic": "Routing",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which of the following lists the correct default administrative distances (AD) for connected, static, OSPF, and RIP routes in Cisco IOS?",
    "options": [
      "Connected: 0, Static: 1, OSPF: 90, RIP: 120",
      "Connected: 1, Static: 0, OSPF: 120, RIP: 110",
      "Connected: 10, Static: 20, OSPF: 110, RIP: 120",
      "Connected: 0, Static: 1, OSPF: 110, RIP: 120"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Cisco IOS default AD values are: Connected: 0, Static: 1, EIGRP: 90, OSPF: 110, and RIP: 120. Lower AD is preferred. Reference: Cisco Administrative Distance guides.",
      "wrong": [
        "Static has AD 1 and Connected has AD 0, not vice versa.",
        "90 is EIGRP's AD, not OSPF's.",
        "Connected routes have the highest trust level (AD 0)."
      ],
      "tip": "Memorize: Connected (0), Static (1), EIGRP (90), OSPF (110), RIP (120).",
      "memory": "C(0) -> S(1) -> E(90) -> O(110) -> R(120).",
      "real": "When comparing routing protocol behaviors on a core switch, OSPF routes will always override RIP routes because of OSPF's lower AD (110 vs 120).",
      "commands": [
        "show ip protocols"
      ]
    }
  },
  {
    "id": 180,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is analyzing a network segment. What is the default OSPF cost for a FastEthernet interface (100 Mbps) assuming the default reference bandwidth of 100 Mbps is configured?",
    "options": [
      "1",
      "1000",
      "10",
      "100"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "OSPF interface cost is calculated using the formula: Cost = Reference Bandwidth / Interface Bandwidth. The default reference bandwidth is 100 Mbps (10^8). For FastEthernet (100 Mbps), Cost = 100 / 100 = 1. Reference: RFC 2328.",
      "wrong": [
        "10 is the OSPF cost for a 10 Mbps interface (100 / 10 = 10).",
        "OSPF cost cannot be less than 1. FastEthernet and GigabitEthernet both default to a cost of 1 unless the reference bandwidth is increased.",
        "The other option represents an incorrect parameter or protocol behavior."
      ],
      "tip": "Because Gigabit and 10-Gigabit interfaces default to a cost of 1, you must increase the reference bandwidth to allow proper cost distinctions.",
      "memory": "Default cost of 100M interface = 1.",
      "real": "Configure 'auto-cost reference-bandwidth 100000' (100 Gbps) on all OSPF routers in modern fiber-optic LANs to prevent path calculation ties.",
      "commands": [
        "auto-cost reference-bandwidth 100000"
      ]
    }
  },
  {
    "id": 181,
    "domain": "IP Connectivity",
    "topic": "Routing",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "When configuring Inter-VLAN routing using a Router-on-a-Stick (ROAS) design, which command is required on each subinterface to enable proper trunk VLAN processing?",
    "options": [
      "ip routing",
      "encapsulation dot1q <vlan-id>",
      "switchport mode trunk",
      "switchport trunk allowed vlan"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "To route traffic for a VLAN on a router subinterface (e.g. g0/0.10), you must tell the router which VLAN tag to bind to the interface using the 'encapsulation dot1q <vlan-id>' command before assigning an IP address. Reference: Cisco ROAS configuration guides.",
      "wrong": [
        "Routers do not support Layer 2 'switchport' commands.",
        "ip routing is a global configuration command, not an interface-specific encapsulation command.",
        "allowed vlan is a switch configuration command."
      ],
      "tip": "Configure ROAS: 1) Create subinterface (e.g. g0/0.10). 2) Bind VLAN (e.g. 'encapsulation dot1q 10'). 3) Add IP address.",
      "memory": "Subinterface = encapsulation dot1q VLAN_ID.",
      "real": "When configuring a firewall for inter-VLAN routing, configure subinterfaces with 802.1Q tagging matching the switch trunk ports.",
      "commands": [
        "encapsulation dot1q 10",
        "interface gigabitethernet 0/0.10"
      ]
    }
  },
  {
    "id": 182,
    "domain": "IP Connectivity",
    "topic": "Routing",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "A network engineer is analyzing a network segment. What is the primary feature of Policy-Based Routing (PBR) compared to standard routing?",
    "options": [
      "It automatically disables OSPF neighbor state checks.",
      "It routes packets based on source IP and other matching criteria in access-lists, overriding destination-only routing.",
      "It uses Spanning Tree to forward Layer 3 frames.",
      "It uses MAC addresses instead of IP addresses to make forwarding decisions."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Policy-Based Routing (PBR) allows administrators to configure routing policies based on source IP addresses, protocol, or port numbers defined in route-maps, overriding default destination-based routing lookup. Reference: Cisco PBR configuration guides.",
      "wrong": [
        "Spanning Tree operates at Layer 2, while PBR is a Layer 3 routing policy tool.",
        "PBR does not affect OSPF neighbor adjacencies.",
        "Forwarding is still IP-based, not MAC-based."
      ],
      "tip": "PBR uses route-maps containing match statements (ACLs) and set statements (next-hop IPs).",
      "memory": "PBR = Policy routing based on Source IP.",
      "real": "Deploy PBR on a corporate border router to direct VoIP traffic over a high-speed lease line while forwarding guest internet traffic over a cheaper broadband link.",
      "commands": [
        "route-map PBR_POLICY permit 10",
        "set ip next-hop 10.1.1.1"
      ]
    }
  },
  {
    "id": 183,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which of the following interface configuration parameters must match exactly between two OSPFv2 routers to establish a neighbor relationship?",
    "options": [
      "Loopback IP addresses",
      "Hostnames and switch port priority",
      "Hello/Dead Timers and Subnet Mask/Area ID",
      "Router ID and OSPF Process ID"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "To establish an OSPFv2 adjacency, several interface parameters must match exactly: 1) Hello/Dead Timers, 2) Area ID, 3) Subnet Mask/Subnet ID, 4) Authentication credentials, and 5) Stub area flag. Reference: RFC 2328.",
      "wrong": [
        "Process ID is locally significant and does not need to match between routers. Router ID must be unique (if they match, neighbor relationship fails).",
        "Loopback IPs must be unique, not identical.",
        "Hostnames have no effect on routing adjacency negotiation."
      ],
      "tip": "Common OSPF troubleshooting areas: mismatched areas, mismatched hello/dead timers, and mismatched MTUs.",
      "memory": "TIMERS + AREA + SUBNET + AUTH = OSPF Adjacency.",
      "real": "If you change the OSPF Hello timer to 5 seconds on one side of a link to speed up convergence, you must change it to 5 seconds on the peer router to prevent the adjacency from dropping.",
      "commands": [
        "ip ospf hello-interval 5",
        "show ip ospf interface"
      ]
    }
  },
  {
    "id": 184,
    "domain": "IP Connectivity",
    "topic": "Routing",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "When configuring a static IPv6 route pointing to a next-hop Link-Local address, what additional parameter must be specified in the command?",
    "options": [
      "The local exit interface",
      "The global unicast prefix",
      "The destination MAC address",
      "The administrative distance"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Because IPv6 Link-Local addresses (FE80::/10) are link-specific and can exist on multiple interfaces of the same router, you must specify the local exit interface (e.g. Serial0/0 or GigabitEthernet0/0) alongside the next-hop Link-Local IP to resolve route ambiguity. Reference: RFC 4291.",
      "wrong": [
        "Administrative distance is optional, not mandatory for Link-Local resolution.",
        "Routing tables do not accept destination MAC addresses directly.",
        "The prefix is part of the destination network definition, but the exit interface is what must accompany the link-local next-hop."
      ],
      "tip": "Command format: 'ipv6 route <prefix> <exit-interface> <next-hop-link-local-ip>'.",
      "memory": "Link-Local next-hop needs exit interface.",
      "real": "When configuring static routes over point-to-point connections, using the exit interface and neighbor link-local address saves routing table memory.",
      "commands": [
        "ipv6 route 2001:db8::/64 gigabitethernet0/0 fe80::2"
      ]
    }
  },
  {
    "id": 185,
    "domain": "IP Connectivity",
    "topic": "Routing",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer deploys a Layer 3 Switch (Multilayer Switch) and configures several SVIs, but the switch fails to forward packets between the subnets. Which global command must be enabled?",
    "options": [
      "switchport mode trunk",
      "router ospf 1",
      "sdn enable",
      "ip routing"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "By default, Cisco multilayer switches operate as Layer 2 devices with IP routing disabled. To allow the switch to forward packets between SVIs or routed interfaces, you must enable the IP routing engine globally using the 'ip routing' command. Reference: Cisco switching guides.",
      "wrong": [
        "Trunk mode is a Layer 2 configuration.",
        "Dynamic routing (OSPF) is not required for basic inter-VLAN routing.",
        "SDN features are not required for standard multilayer routing."
      ],
      "tip": "To turn a switch into a router: 1) Enable global 'ip routing'. 2) Turn off Layer 2 on interfaces using 'no switchport'.",
      "memory": "ip routing = Switch acts as a router.",
      "real": "When setting up SVIs on a core campus switch, verify that 'ip routing' is in the running configuration to enable local routing paths.",
      "commands": [
        "ip routing",
        "show ip route"
      ]
    }
  },
  {
    "id": 186,
    "domain": "IP Services",
    "topic": "NAT",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which type of Network Address Translation (NAT) maps multiple private IP addresses to a single public IP address by utilizing unique Layer 4 source port numbers?",
    "options": [
      "Destination NAT",
      "Port Address Translation (PAT) / Overload",
      "Static NAT",
      "Dynamic NAT"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Port Address Translation (PAT), also known as NAT Overload, allows thousands of internal hosts to share a single public IP address by tracking translation sessions using unique source port numbers in the TCP/UDP headers. Reference: RFC 2663.",
      "wrong": [
        "Static NAT performs a fixed one-to-one mapping, which does not conserve IP addresses.",
        "Dynamic NAT maps private hosts to a pool of public IPs on a first-come, first-served basis, but still requires one public IP per active session.",
        "Destination NAT is used to map incoming traffic to internal servers (like Port Forwarding)."
      ],
      "tip": "NAT Overload uses the 'overload' keyword at the end of the NAT translation command.",
      "memory": "PAT = Port translation = Overload.",
      "real": "Home routers utilize PAT to allow all connected devices (phones, laptops, TVs) to share the single public IP address provided by the ISP.",
      "commands": [
        "ip nat inside source list 1 interface gig0/0 overload"
      ]
    }
  },
  {
    "id": 187,
    "domain": "IP Services",
    "topic": "NTP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "What does the Network Time Protocol (NTP) stratum level indicate about a time source?",
    "options": [
      "The precision of the local hardware clock",
      "The administrative distance of the time source",
      "The encryption level of the NTP packet",
      "The distance (hop count) the server is from the authoritative reference clock"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "NTP uses stratum levels to define the distance from the reference clock (Stratum 0: atomic clock or GPS receiver). A server connected directly to a Stratum 0 source is Stratum 1. A client syncing from a Stratum 1 server is Stratum 2, and so on. Reference: RFC 5905.",
      "wrong": [
        "Stratum does not measure physical clock precision directly, but rather network distance.",
        "Administrative distance belongs to routing protocols, not NTP.",
        "NTP stratum does not relate to cryptography or packet encryption."
      ],
      "tip": "Lower stratum numbers indicate a more reliable, closer time source. Stratum 16 is considered unsynchronized/invalid.",
      "memory": "Stratum 0 = Reference Clock. Stratum 1 = Connected to 0. Stratum 2 = Connected to 1.",
      "real": "When configuring switch clock synchronization, point to a local Stratum 2 or 3 NTP server to ensure consistent log timestamps across the network.",
      "commands": [
        "ntp server 10.1.1.5",
        "show ntp status"
      ]
    }
  },
  {
    "id": 188,
    "domain": "IP Services",
    "topic": "Syslog",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A router is configured with the command 'logging trap 4'. Which levels of syslog messages will be forwarded to the syslog server?",
    "options": [
      "All syslog messages",
      "Only messages with severity level 4",
      "Messages with severity levels 0 through 4",
      "Messages with severity levels 4 through 7"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "When a syslog logging level is configured, the device forwards all messages at that severity level and lower (more severe). Level 4 is 'Warning'. Therefore, the router will send levels 0 (Emergency), 1 (Alert), 2 (Critical), 3 (Error), and 4 (Warning). Reference: RFC 5424.",
      "wrong": [
        "Syslog filters are inclusive of all more-severe levels.",
        "Levels 5 (Notification), 6 (Informational), and 7 (Debugging) are less severe and will be filtered out.",
        "The other option represents an incorrect parameter or protocol behavior."
      ],
      "tip": "Syslog levels: 0: Emerg, 1: Alert, 2: Crit, 3: Error, 4: Warn, 5: Notice, 6: Info, 7: Debug.",
      "memory": "Every Awesome Cat Eats Wet Nice Individual Dinners (0 to 7).",
      "real": "Set 'logging trap warning' on switches to ensure you receive critical hardware alerts without flooding the monitoring server with informational link flaps.",
      "commands": [
        "logging trap 4",
        "show logging"
      ]
    }
  },
  {
    "id": 189,
    "domain": "IP Services",
    "topic": "SNMP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which security model configuration in SNMPv3 provides both packet source authentication and encryption of the SNMP data payload?",
    "options": [
      "authNoPriv",
      "authPriv",
      "privOnly",
      "noAuthNoPriv"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "SNMPv3 introduces security levels. 'authPriv' (Authentication and Privacy) is the highest level, requiring MD5/SHA for source authentication and DES/AES to encrypt the monitored data payload. Reference: RFC 3414.",
      "wrong": [
        "noAuthNoPriv has no authentication or encryption (uses username match only).",
        "authNoPriv provides MD5/SHA authentication, but does not encrypt packet data.",
        "privOnly is an invalid SNMPv3 security parameter."
      ],
      "tip": "SNMPv1 and v2c use cleartext 'community strings'. SNMPv3 introduces cryptographic usernames, authentication, and encryption.",
      "memory": "authPriv = Authentication + Privacy (encryption).",
      "real": "When configuring device monitoring over a public network, always use SNMPv3 authPriv to prevent attackers from intercepting interface data.",
      "commands": [
        "snmp-server group monitorGroup v3 priv"
      ]
    }
  },
  {
    "id": 190,
    "domain": "IP Services",
    "topic": "DHCP",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A systems administrator is configuring a Cisco device. Which command is used to reserve a block of IP addresses so they are not leased out by a Cisco IOS DHCP server?",
    "options": [
      "ip dhcp lease static",
      "ip dhcp reserved-address",
      "no ip dhcp pool",
      "ip dhcp excluded-address"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "The 'ip dhcp excluded-address' global command configures a Cisco IOS router to reserve specific IP addresses (like gateway and server static IPs) so they are not assigned to DHCP clients. Reference: Cisco DHCP server configuration guides.",
      "wrong": [
        "reserved-address is an invalid Cisco IOS command.",
        "no ip dhcp pool deletes the entire DHCP pool.",
        "lease static is used for static MAC bindings, not general address exclusions."
      ],
      "tip": "Always configure the excluded-address list BEFORE creating the DHCP pool to prevent immediate address conflicts.",
      "memory": "Excluded address = Excluded from the lease pool.",
      "real": "When configuring a DHCP scope for local clients, exclude the gateway address (.1) and printer addresses (.2 to .10) from the pool.",
      "commands": [
        "ip dhcp excluded-address 192.168.1.1 192.168.1.10"
      ]
    }
  },
  {
    "id": 191,
    "domain": "Security Fundamentals",
    "topic": "ACLs",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "A network engineer is analyzing a network segment. What is the correct configuration placement rule for standard and extended Access Control Lists (ACLs)?",
    "options": [
      "Both standard and extended ACLs should be placed only on outbound WAN interfaces.",
      "Standard ACLs should be placed close to the source; Extended ACLs should be placed close to the destination.",
      "Standard ACLs should be placed close to the destination; Extended ACLs should be placed close to the source.",
      "ACLs must be placed only on console lines."
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "Standard ACLs filter based on source IP only; placing them close to the source would filter traffic to other legitimate destinations. Thus, place them close to the destination. Extended ACLs filter based on source/destination IP, protocol, and port; placing them close to the source conserves bandwidth by dropping unwanted traffic immediately. Reference: Cisco ACL guidelines.",
      "wrong": [
        "Placing standard ACLs close to the source drops all traffic from that host, not just traffic to the blocked destination.",
        "Placing extended ACLs close to the destination wastes WAN link bandwidth.",
        "ACL placement is interface-specific, not restricted to WAN or console interfaces."
      ],
      "tip": "Standard = Close to Destination. Extended = Close to Source.",
      "memory": "S-D (Standard-Destination), E-S (Extended-Source).",
      "real": "When creating an ACL to block access to a finance server VLAN, apply an extended ACL on the access router interface closest to the user hosts.",
      "commands": [
        "ip access-group 101 in"
      ]
    }
  },
  {
    "id": 192,
    "domain": "Security Fundamentals",
    "topic": "Port Security",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "A switch port configured with Port Security experiences a security violation. If the violation mode is set to 'Restrict', what actions does the switch perform?",
    "options": [
      "The switch forwards the frame and alerts the destination host.",
      "The switch shuts down the interface immediately, placing it into the err-disabled state.",
      "The switch drops the violating traffic, increments the security violation counter, and generates a syslog message, but keeps the link up.",
      "The switch drops the violating traffic but does not increment the counter or send any log alerts."
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "The 'restrict' violation mode drops unauthorized frames, increments the violation counter, and sends SNMP trap/syslog alerts, keeping the port operational for authorized MACs. The 'shutdown' mode disables the port. The 'protect' mode drops traffic silently without logs or counter increments. Reference: Cisco Port Security guidelines.",
      "wrong": [
        "Shutdown mode disables the port into err-disabled state, not Restrict.",
        "Protect mode drops traffic silently without logs or incrementing the counter.",
        "Violating traffic is dropped, never forwarded."
      ],
      "tip": "Port security modes: Shutdown (disables interface, logs, counter), Restrict (drops traffic, logs, counter), Protect (drops traffic silently).",
      "memory": "Restrict = Restricts access, drops traffic, increments counter, logs. Shutdown = Shuts down port.",
      "real": "Use Restrict mode on public-facing access ports to prevent unauthorized MACs while keeping existing authorized devices (like IP phones) online.",
      "commands": [
        "switchport port-security violation restrict"
      ]
    }
  },
  {
    "id": 193,
    "domain": "Security Fundamentals",
    "topic": "DHCP Snooping",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "When configuring DHCP Snooping on a switch, which port type should be configured as 'trusted' to allow DHCP Offer and Acknowledge replies from the DHCP server?",
    "options": [
      "All ports on the access switch by default",
      "Ports connected to user workstations",
      "Ports connected to wireless access points",
      "Ports connected to the authorized DHCP server or uplink routers"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "DHCP Snooping blocks rogue DHCP servers by categorizing switch ports. Ports connected to downstream clients are 'untrusted' and block server messages (Offer, ACK). Ports connected to the authorized server or uplinks are configured as 'trusted' to allow server responses. Reference: Cisco DHCP Snooping security guides.",
      "wrong": [
        "Workstation ports are untrusted to prevent users from running rogue DHCP servers.",
        "All ports default to untrusted when DHCP snooping is enabled globally.",
        "AP ports are typically untrusted unless the AP is also acting as a DHCP server."
      ],
      "tip": "Configure 'ip dhcp snooping limit rate' on untrusted ports to prevent DHCP starvation exhaustion attacks.",
      "memory": "Trusted = Server/Uplinks. Untrusted = Clients.",
      "real": "When configuring access switches, run 'ip dhcp snooping trust' on the trunk ports linking back to the core routing layer.",
      "commands": [
        "ip dhcp snooping trust",
        "ip dhcp snooping vlan 10"
      ]
    }
  },
  {
    "id": 194,
    "domain": "Security Fundamentals",
    "topic": "Wireless Security",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "Which cryptographic handshake mechanism is introduced in WPA3 to replace the WPA2 Pre-Shared Key (PSK) exchange, protecting against offline dictionary brute-force attacks?",
    "options": [
      "Simultaneous Authentication of Equals (SAE)",
      "Temporal Key Integrity Protocol (TKIP)",
      "Pre-Shared Key Exchange (PSKE)",
      "Wired Equivalent Privacy (WEP)"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "WPA3 replaces WPA2 PSK with Simultaneous Authentication of Equals (SAE), which is a secure key exchange based on Dragonfly cryptography. SAE prevents offline dictionary attacks by making each handshake session unique. Reference: WPA3 Specification.",
      "wrong": [
        "TKIP is a legacy WPA1 protocol that is deprecated.",
        "WEP is an obsolete, insecure encryption standard.",
        "PSKE is not a standard security protocol."
      ],
      "tip": "SAE prevents attackers from capturing the wireless handshake and cracking the passphrase offline.",
      "memory": "SAE = WPA3 key exchange.",
      "real": "When upgrading an office network to WPA3-Personal, the authentication changes from WPA2 PSK to SAE to protect remote client sessions.",
      "commands": []
    }
  },
  {
    "id": 195,
    "domain": "Security Fundamentals",
    "topic": "SSH",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "An engineer is configuring a switch to allow management access via SSH. Which line-level command must be applied under the VTY lines to disable unencrypted Telnet access?",
    "options": [
      "transport input telnet ssh",
      "no privilege level",
      "transport input ssh",
      "login local"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "The command 'transport input ssh' restricts incoming VTY access to SSH only, disabling Telnet and other unencrypted cleartext management protocols on the virtual terminal lines. Reference: Cisco VTY configuration guides.",
      "wrong": [
        "login local enables local database authentication, but does not block Telnet packets.",
        "transport input telnet ssh allows BOTH SSH and Telnet, keeping Telnet vulnerabilities active.",
        "privilege level changes access rights, not protocol support."
      ],
      "tip": "Always run 'transport input ssh' on VTY lines to meet standard security audits.",
      "memory": "transport input ssh = SSH only.",
      "real": "Disable Telnet by applying 'transport input ssh' on VTY lines 0 to 15 to encrypt administrator credentials over the local network.",
      "commands": [
        "transport input ssh",
        "line vty 0 15"
      ]
    }
  },
  {
    "id": 196,
    "domain": "Automation and Programmability",
    "topic": "REST APIs",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network engineer is establishing a new OSPFv2 adjacency between two routers. During packet capture, the engineer observes that the routers have exchanged Hello packets and agreed on their router IDs, and are now exchanging Database Description (DBD) packets to summarize their link-state databases. What is the current OSPF neighbor state?",
    "options": [
      "EXCHANGE",
      "EXSTART",
      "LOADING",
      "2-WAY"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "During the OSPF adjacency process, after routers establish communication (2-WAY), they enter EXSTART state to elect a Master/Slave relationship using DBD packets. Once the master/slave relationship is decided, they transition to the EXCHANGE state, where they actively send and receive DBD packets summarizing their link-state databases. Reference: CCNA Volume 2, Chapter 3: Implementing OSPFv2.",
      "wrong": [
        "EXSTART is the initial negotiation state where routers decide who is master/slave and the starting sequence number; they do not exchange database summaries yet.",
        "LOADING is the state that follows EXCHANGE, where routers send Link State Requests (LSR) to retrieve detailed updates based on the DBD summaries.",
        "2-WAY is the state where bi-directional hello communication is confirmed, but database exchange has not yet started."
      ],
      "tip": "OSPF Adjacency States order: DOWN -> INIT -> 2-WAY -> EXSTART -> EXCHANGE -> LOADING -> FULL.",
      "memory": "I 2-WAY EXSTART EXCHANGE LOAD FULL (Init, 2-Way, Exstart, Exchange, Loading, Full).",
      "real": "Seeing a neighbor stuck in LOADING indicates that the router is requesting Link State Updates (LSUs) but not receiving them, often caused by a MTU mismatch or a corrupt database packet.",
      "commands": [
        "show ip ospf neighbor",
        "debug ip ospf adj"
      ]
    }
  },
  {
    "id": 197,
    "domain": "Automation and Programmability",
    "topic": "JSON",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network engineer is troubleshooting an issue. Which of the following character combinations is used to enclose a key-value dictionary (object) and a list (array) in a standard JSON file?",
    "options": [
      "Dictionary: Angle brackets < >, Array: Parentheses ( )",
      "Dictionary: Parentheses ( ), Array: Angle brackets < >",
      "Dictionary: Curly braces { }, Array: Square brackets [ ]",
      "Dictionary: Square brackets [ ], Array: Curly braces { }"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "JSON (JavaScript Object Notation) uses curly braces { } to define objects/dictionaries containing key-value pairs, and square brackets [ ] to define ordered arrays/lists of elements. Reference: RFC 8259.",
      "wrong": [
        "Square brackets define arrays, curly braces define objects (dictionaries), not vice versa.",
        "Parentheses and angle brackets are not used to structure JSON files.",
        "The other option represents an incorrect parameter or protocol behavior."
      ],
      "tip": "JSON objects use { } and key-value pairs. JSON arrays use [ ] and comma-separated lists.",
      "memory": "Curly { Object }, Square [ Array ].",
      "real": "When parsing configuration output from a Cisco router using a Python script, check that JSON structures start with { for dictionaries and [ for lists.",
      "commands": []
    }
  },
  {
    "id": 198,
    "domain": "Automation and Programmability",
    "topic": "SDN",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which API connection direction is utilized by an SDN controller to communicate with network management applications and orchestration scripts?",
    "options": [
      "Northbound APIs",
      "Southbound APIs",
      "Eastbound APIs",
      "Westbound APIs"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Northbound APIs connect the SDN controller to applications, scripts, and business logic tools, allowing programmers to automate network actions. Southbound APIs (like OpenFlow, NETCONF) connect the controller downwards to physical hardware. Reference: SDN architecture standards.",
      "wrong": [
        "Southbound APIs link the controller to the network devices.",
        "Eastbound and Westbound APIs are used for communication between multiple controller clusters to sync data.",
        "The other option represents an incorrect parameter or protocol behavior."
      ],
      "tip": "Northbound = Upwards to Apps (REST). Southbound = Downwards to Devices (NETCONF/OpenFlow).",
      "memory": "North = Up to Apps. South = Down to Switches.",
      "real": "When writing a Python script to request network health data from Cisco DNA Center, your script queries the controller's Northbound REST API.",
      "commands": []
    }
  },
  {
    "id": 199,
    "domain": "Automation and Programmability",
    "topic": "DevOps Tools",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which configuration management tool uses a pull-based model where managed nodes install local agent software that queries the server at regular intervals to download configuration states?",
    "options": [
      "Cisco NSO",
      "Puppet",
      "Terraform",
      "Ansible"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Puppet is a pull-based tool. It requires agents to be installed on managed devices. These agents pull configurations periodically from a master server. Ansible and Terraform use a push-based agentless model over SSH or APIs.",
      "wrong": [
        "Ansible is push-based and agentless.",
        "Terraform is agentless and uses a push model to provision cloud or network architecture.",
        "Cisco NSO is agentless, managing devices via CLI/NETCONF push."
      ],
      "tip": "Pull-based: Puppet, Chef. Push-based: Ansible, SaltStack (can do both).",
      "memory": "Puppet Agent pulls strings from the master.",
      "real": "In large virtual server farms, Puppet agents run on Linux VMs to pull updates from the central master server every 30 minutes, ensuring configuration consistency.",
      "commands": []
    }
  },
  {
    "id": 200,
    "domain": "Automation and Programmability",
    "topic": "DNA Center",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which area of the Cisco DNA Center dashboard allows network engineers to monitor network device health, client experiences, and troubleshoot connectivity issues using machine learning analytics?",
    "options": [
      "Provision",
      "Policy",
      "Assurance",
      "Design"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "Cisco DNA Center Assurance provides proactive monitoring, client health statistics, network health scores, and automated troubleshooting recommendations based on telemetry and AI analytics. Reference: Cisco DNA Center Assurance guides.",
      "wrong": [
        "Design is used to create site profiles, device templates, and IP pools.",
        "Policy is used to configure access control lists, QoS policies, and virtual networks.",
        "Provision is used to deploy configurations and assign devices to sites."
      ],
      "tip": "Assurance = Monitoring, Health, Analytics, Troubleshooting.",
      "memory": "Assurance assures the network health is optimal.",
      "real": "Open DNA Center Assurance to view a visual client experience graph showing why a specific user is experiencing slow DHCP response times in the building.",
      "commands": []
    }
  },
  {
    "id": 201,
    "domain": "Network Fundamentals",
    "topic": "virtualization",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network administrator needs to select a hypervisor type that runs directly on bare-metal hardware without a host operating system. Which hypervisor type should be selected, and what is a primary example?",
    "options": [
      "Type 1 hypervisor, such as VMware ESXi",
      "Type 1 hypervisor, such as Oracle VM VirtualBox",
      "Type 2 hypervisor, such as VMware Workstation",
      "Type 2 hypervisor, such as Microsoft Hyper-V"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Type 1 hypervisors run directly on the host physical hardware, providing better performance and efficiency. VMware ESXi is a classic Type 1 bare-metal hypervisor.",
      "wrong": [
        "VMware Workstation is a Type 2 hypervisor running on top of a host OS.",
        "Oracle VM VirtualBox is a Type 2 hypervisor, not Type 1.",
        "Microsoft Hyper-V operates as a Type 1 hypervisor, but the option pairs it incorrectly with Type 2."
      ],
      "tip": "Type 1 = Bare-metal (ESXi, Hyper-V). Type 2 = Hosted (Workstation, VirtualBox).",
      "memory": "Type 1 runs on the hardware. Type 2 runs on the OS.",
      "real": "In enterprise data centers, physical servers run VMware ESXi (Type 1) to host hundreds of customer virtual machines directly on physical CPU/RAM.",
      "commands": []
    }
  },
  {
    "id": 202,
    "domain": "Network Fundamentals",
    "topic": "Cloud models",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "Which cloud service model allows an organization to deploy customer-created or acquired applications onto the cloud infrastructure, without managing the underlying operating systems, servers, or storage?",
    "options": [
      "Software as a Service (SaaS)",
      "Infrastructure as a Service (IaaS)",
      "Platform as a Service (PaaS)",
      "Network as a Service (NaaS)"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "Platform as a Service (PaaS) provides the runtime environment, development tools, and database systems, allowing users to deploy applications without maintaining OS/virtual machines.",
      "wrong": [
        "IaaS requires the customer to manage the operating systems and virtual machines.",
        "SaaS provides complete ready-to-use software applications, not a platform for custom code deployment.",
        "NaaS deals with virtualized networking infrastructure, not application runtime environments."
      ],
      "tip": "PaaS = Developer focused (Heroku, AWS Elastic Beanstalk). IaaS = VM focused (AWS EC2). SaaS = End user focused (Office 365).",
      "memory": "PaaS = Platform for Applications.",
      "real": "A software development team deploys their web app to AWS Elastic Beanstalk (PaaS), allowing them to focus entirely on code updates without configuring Linux servers.",
      "commands": []
    }
  },
  {
    "id": 203,
    "domain": "Network Fundamentals",
    "topic": "Cabling Properties",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "An installer is running UTP cable near fluorescent light fixtures and high-voltage power conduits in a warehouse. What category of cable or shielding should be recommended to prevent Electromagnetic Interference (EMI)?",
    "options": [
      "Multimode Fiber Optic (MMF)",
      "Single-mode Fiber Optic (SMF)",
      "Standard UTP Category 6",
      "Shielded Twisted Pair (STP) Category 6A"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Shielded Twisted Pair (STP) uses protective copper/metallic shielding to block out external EMI and RF noise.",
      "wrong": [
        "UTP lacks any shielding elements, leaving packets vulnerable to corruption in high-EMI environments.",
        "Single-mode fiber avoids EMI entirely, but is not a twisted pair copper category.",
        "Multimode fiber is not a twisted pair copper category."
      ],
      "tip": "Fluorescent lights / machinery = Use STP copper or Fiber optic lines.",
      "memory": "S stands for Shielded, providing noise defense.",
      "real": "When installing Ethernet drops along factory conveyor systems, engineers run STP to prevent heavy electric motors from corrupting network packets.",
      "commands": []
    }
  },
  {
    "id": 204,
    "domain": "Network Fundamentals",
    "topic": "IPv6 Address Types",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is analyzing a network segment. What is the IPv6 equivalent of a private IPv4 address (RFC 1918) that is locally routable within an organization but not globally routable on the public Internet?",
    "options": [
      "Unique Local Address (FC00::/7)",
      "Loopback Address (::1/128)",
      "Global Unicast Address (2000::/3)",
      "Link-local address (FE80::/10)"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Unique Local Addresses (ULAs) in the block FC00::/7 are designed for local routing within an organization, matching RFC 1918 private IPv4 addresses.",
      "wrong": [
        "Link-local addresses are restricted to a single local link and cannot cross router boundaries.",
        "Global Unicast Addresses are public addresses routed globally on the WAN.",
        "Loopback address (::1) is equivalent to 127.0.0.1 and stays local to the host."
      ],
      "tip": "Unique Local = Private IPv6 (FC00::/7). Link-Local = APIPA IPv6 (FE80::/10).",
      "memory": "Unique Local starts with FC (think: Firm/Company private).",
      "real": "A corporate campus configures their internal active directory controllers using Unique Local Addresses (FC00::/7) to ensure they are isolated from direct WAN routing.",
      "commands": []
    }
  },
  {
    "id": 205,
    "domain": "Network Fundamentals",
    "topic": "TCP/IP Model",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "Which transport layer protocol features flow control via windowing and error recovery through sequence numbers and acknowledgments?",
    "options": [
      "Internet Control Message Protocol (ICMP)",
      "Simple Network Management Protocol (SNMP)",
      "User Datagram Protocol (UDP)",
      "Transmission Control Protocol (TCP)"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "TCP is a connection-oriented transport protocol that uses window sizes to control rate of transfer, and sequence/acknowledgment numbers to recover lost packets.",
      "wrong": [
        "UDP is connectionless and does not perform flow control or packet retransmissions.",
        "ICMP operates at Layer 3 (Network) to report errors and diagnostic information.",
        "SNMP is an application layer protocol, not transport."
      ],
      "tip": "Flow control, error recovery, windowing, sequence numbers = TCP.",
      "memory": "TCP = Traffic Control Protocol (Windowing).",
      "real": "When downloading a firmware image from an FTP site, TCP guarantees that every byte is verified and reassembled in order before presenting the file to the user.",
      "commands": []
    }
  },
  {
    "id": 206,
    "domain": "Network Fundamentals",
    "topic": "WAN Topologies",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A company connects 10 branch offices via WAN. They require the highest level of redundancy and fault tolerance, where every single node has a direct connection to every other node. Which topology should be selected?",
    "options": [
      "Full mesh topology",
      "Dual-homed star topology",
      "Hub-and-spoke topology",
      "Point-to-point topology"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "A full mesh topology provides direct point-to-point connections between every single node pair, yielding maximum redundancy at the cost of high interface and line expenses.",
      "wrong": [
        "Hub-and-spoke relies on a central hub, creating a single point of failure.",
        "Point-to-point connects exactly two nodes, not a multi-site WAN fabric.",
        "Dual-homed star connects hosts to two central points, but not all nodes together."
      ],
      "tip": "Full Mesh redundancy formula: N * (N - 1) / 2 connections.",
      "memory": "Full Mesh = Fully Connected.",
      "real": "Mission-critical data centers run full mesh WAN topologies over dedicated MPLS lines to prevent any single fiber cut from disrupting database sync operations.",
      "commands": []
    }
  },
  {
    "id": 207,
    "domain": "Network Fundamentals",
    "topic": "Subnetting",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "High",
    "text": "An administrator needs to segment the block 172.16.10.0/24 into subnets that can support up to 28 hosts each. Which subnet mask offers the maximum number of usable subnets while satisfying this host requirement?",
    "options": [
      "255.255.255.192 (/26)",
      "255.255.255.240 (/28)",
      "255.255.255.248 (/29)",
      "255.255.255.224 (/27)"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "A /27 subnet mask provides 32 addresses total, with 30 usable hosts (32 - 2). A /28 mask only provides 14 usable hosts, which is insufficient. /27 is the most efficient match.",
      "wrong": [
        "A /29 subnet mask only provides 6 usable hosts.",
        "A /28 subnet mask only provides 14 usable hosts.",
        "A /26 subnet mask provides 62 hosts, which is less efficient and yields fewer subnets."
      ],
      "tip": "Usable hosts formula: 2^H - 2. For 28 hosts, H must be at least 5 (30 hosts). 32 - 5 = 27.",
      "memory": "/27 = 32 addresses = 30 hosts.",
      "real": "An engineer subnets a class C space using /27 to assign dedicated IP subnets to different department floors, allowing up to 30 workstation hosts per floor.",
      "commands": []
    }
  },
  {
    "id": 208,
    "domain": "Network Fundamentals",
    "topic": "IPv6 EUI-64",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "High",
    "text": "During IPv6 SLAAC address generation, how does a host determine the 64-bit interface identifier when using the EUI-64 process?",
    "options": [
      "By inserting FFFE in the middle of the 48-bit MAC address and flipping the 7th bit (universal/local bit)",
      "By appending the MAC address to the link-local prefix and calculating a SHA-256 hash",
      "By concatenating the vendor ID with the system uptime timestamp",
      "By requesting a random 64-bit identifier from a nearby DHCPv6 server"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "EUI-64 splits the 48-bit MAC address in half, inserts FFFE in the middle, and flips the 7th bit (universal/local bit) of the first byte.",
      "wrong": [
        "SHA-256 hashes are not used in standard EUI-64 MAC conversions.",
        "SLAAC is stateless and does not consult DHCPv6 servers to obtain addresses.",
        "System uptime values are dynamic and are not used to generate static EUI-64 interface IDs."
      ],
      "tip": "EUI-64: Split MAC, insert FFFE, flip 7th bit.",
      "memory": "EUI = FFFE insertion + 7th bit flip.",
      "real": "When a Cisco router interface is configured with \"ipv6 address 2001:db8::/64 eui-64\", it auto-appends its modified MAC to complete the 128-bit unicast address.",
      "commands": [
        "show ipv6 interface"
      ]
    }
  },
  {
    "id": 209,
    "domain": "Network Fundamentals",
    "topic": "ARP",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "What type of ARP packet is broadcasted to the local network when a device wants to verify if another host is using its newly configured IP address?",
    "options": [
      "Dynamic ARP",
      "Proxy ARP",
      "Gratuitous ARP",
      "Reverse ARP"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "A Gratuitous ARP (GARP) is sent to update ARP tables of neighboring devices or to verify if an IP address is duplicate on the network.",
      "wrong": [
        "Proxy ARP allows a router to answer ARP requests on behalf of remote hosts.",
        "Reverse ARP (RARP) resolves MAC addresses to IP addresses, which is deprecated in favor of DHCP.",
        "Dynamic ARP is a reference to Dynamic ARP Inspection (DAI), which validates ARP packets."
      ],
      "tip": "IP conflict detection on startup = Gratuitous ARP broadcast.",
      "memory": "Gratuitous = Unsolicited ARP message.",
      "real": "When Windows starts up, it broadcasts a Gratuitous ARP. If a duplicate reply is received, the user sees an 'IP address conflict' error bubble.",
      "commands": []
    }
  },
  {
    "id": 210,
    "domain": "Network Fundamentals",
    "topic": "DNS Records",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "What DNS resource record type maps a hostname to an IPv6 address?",
    "options": [
      "AAAA record",
      "A record",
      "CNAME record",
      "MX record"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "AAAA records (Quad-A) map hostnames to IPv6 addresses, whereas standard A records map hostnames to IPv4 addresses.",
      "wrong": [
        "A records map hostnames to IPv4 addresses only.",
        "MX records direct mail server routing domains.",
        "CNAME records define canonical alias names mapping back to A or AAAA targets."
      ],
      "tip": "IPv4 = A record (32-bit). IPv6 = AAAA record (128-bit, 4x larger).",
      "memory": "AAAA has four As because IPv6 is four times larger than IPv4.",
      "real": "When configuring a public website on Cloudflare, you add an AAAA record pointing \"www.example.com\" to your server's public IPv6 address.",
      "commands": [
        "nslookup",
        "dig"
      ]
    }
  },
  {
    "id": 211,
    "domain": "Network Access",
    "topic": "Trunks",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "If a switch port configured for 802.1Q trunking receives an untagged frame, what action does it take?",
    "options": [
      "Forwards the frame to the configured Native VLAN",
      "Tags the frame with VLAN ID 1 before forwarding",
      "Broadcasts the frame to all trunk ports",
      "Drops the frame immediately"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "By default, standard 802.1Q trunk ports map untagged incoming traffic to the configured Native VLAN (VLAN 1 unless modified).",
      "wrong": [
        "Untagged frames are not dropped; they are assigned to the Native VLAN.",
        "The native VLAN can be changed; it is not hardcoded to tag as VLAN 1.",
        "Frames are only flooded if their destination MAC is unknown unicast or multicast/broadcast."
      ],
      "tip": "Native VLAN = Untagged traffic carrier over 802.1Q trunks.",
      "memory": "Native = Natural, untagged state.",
      "real": "To prevent native VLAN mismatch security warnings, network administrators change the default native VLAN 1 on all trunk links to a unused VLAN ID.",
      "commands": [
        "switchport trunk native vlan 99"
      ]
    }
  },
  {
    "id": 212,
    "domain": "Network Access",
    "topic": "Rapid PVST+",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is analyzing a network segment. What is the main convergence speed advantage of Rapid PVST+ (802.1w) over standard PVST+ (802.1D)?",
    "options": [
      "It disables port security checks during convergence",
      "It uses link state routing updates instead of BPDU exchanges",
      "It transitions ports to the forwarding state immediately via proposal-agreement handshakes without relying on forward delay timers",
      "It increases default STP priority metrics"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "Rapid PVST+ (based on 802.1w RSTP) utilizes active proposal/agreement handshake flags to transition point-to-point links directly to forwarding in milliseconds.",
      "wrong": [
        "STP is a Layer 2 loop-prevention protocol and does not use routing protocols.",
        "Priority metrics are configuration-driven, not protocol-dependent.",
        "Port security remains active and is not bypassed during STP convergence cycles."
      ],
      "tip": "802.1w (RSTP) convergence = milliseconds. 802.1D (STP) convergence = 30-50 seconds.",
      "memory": "Rapid PVST+ = Handshake proposal-agreement = Fast convergence.",
      "real": "When a redundant core switch trunk link fails, Rapid PVST+ switches converge in under 1 second, preventing dropped VOIP telephone calls.",
      "commands": [
        "spanning-tree mode rapid-pvst"
      ]
    }
  },
  {
    "id": 213,
    "domain": "Network Access",
    "topic": "EtherChannel",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A systems administrator is configuring a Cisco device. Which command can be used on a Cisco Catalyst switch to display the configured EtherChannel load-balancing method?",
    "options": [
      "show etherchannel load-balance",
      "show ip interface brief",
      "show interfaces status",
      "show etherchannel summary"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "The \"show etherchannel load-balance\" command displays the active frame distribution algorithm (such as src-mac, dest-ip, etc.).",
      "wrong": [
        "show interfaces status lists physical interface speed, duplex, and VLAN states.",
        "show ip interface brief displays IP status of Layer 3 interfaces.",
        "show etherchannel summary displays the status and member ports of channel groups."
      ],
      "tip": "Verification: load-balance checks distribution algorithm, summary checks interface states.",
      "memory": "load-balance command checks how load is balanced.",
      "real": "If users report slow speeds on an aggregated server link, engineers run \"show etherchannel load-balance\" to check if a bad algorithm is routing all traffic down a single physical line.",
      "commands": [
        "show etherchannel load-balance"
      ]
    }
  },
  {
    "id": 214,
    "domain": "Network Access",
    "topic": "Wireless",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "In a centralized CAPWAP wireless deployment, which device performs the real-time frame processing, traffic encryption, and client authentication policy enforcement?",
    "options": [
      "Core Distribution Switch",
      "Wireless LAN Controller (WLC)",
      "RADIUS AAA server",
      "Lightweight Access Point (LAP)"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Centralized CAPWAP architecture routes all wireless client traffic via a tunnel to the WLC, which acts as the brain handling policy, encryption, and routing.",
      "wrong": [
        "Lightweight APs are dumb antennas that forward raw radio frequency frames to the WLC.",
        "Core distribution switches forward packets but do not run CAPWAP endpoint logic.",
        "RADIUS servers check user credentials but do not route/process physical CAPWAP frames."
      ],
      "tip": "Centralized CAPWAP = Centralized brain on the WLC. LAP handles physical RF.",
      "memory": "Controller (WLC) = Controls everything.",
      "real": "In a corporate network, when a user roams between APs, the WLC maintains their authenticated IP session dynamically without requiring re-login.",
      "commands": []
    }
  },
  {
    "id": 215,
    "domain": "Network Access",
    "topic": "WLC Interfaces",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "Which type of WLC interface connects physical management ports to corporate LAN subnets for switch console access?",
    "options": [
      "Dynamic Interface",
      "Management Interface",
      "AP Manager Interface",
      "Virtual Interface"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "The WLC Management Interface handles out-of-band management, GUI Web access, CLI SSH logins, and general controller infrastructure traffic.",
      "wrong": [
        "AP Manager Interface controls connection and provisioning of Lightweight APs.",
        "Virtual Interface manages roaming and DHCP relay for wireless clients.",
        "Dynamic Interface maps client VLAN subnets to SSIDs."
      ],
      "tip": "Management Interface = Web GUI / SSH connection port.",
      "memory": "Management is for managing.",
      "real": "To upgrade WLC software, an administrator opens a browser to the WLC Management Interface IP address to upload the binary image.",
      "commands": []
    }
  },
  {
    "id": 216,
    "domain": "Network Access",
    "topic": "STP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "In which Spanning Tree state does a port receive BPDUs and build the MAC address table but NOT forward data frames?",
    "options": [
      "Blocking",
      "Learning",
      "Listening",
      "Forwarding"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "During the Learning state, the switch interface populates its CAM/MAC table from incoming frames, but does not forward client data traffic.",
      "wrong": [
        "Blocking ports discard user data and do not learn MAC addresses.",
        "Listening ports discard data and do not learn MAC addresses (they only process incoming BPDUs).",
        "Forwarding ports fully forward user traffic and learn MAC addresses."
      ],
      "tip": "Learning state: MAC table population = YES. User data forwarding = NO.",
      "memory": "Learning means learning MACs.",
      "real": "When you plug a workstation into a standard STP port, it waits in Listening then Learning for 15 seconds each to populate MAC tables before link becomes active.",
      "commands": [
        "show spanning-tree"
      ]
    }
  },
  {
    "id": 217,
    "domain": "Network Access",
    "topic": "STP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is analyzing a network segment. What is the security risk of enabling Spanning Tree PortFast on an interface connected to a downstream hub or switch?",
    "options": [
      "Formation of temporary or permanent Layer 2 network loops before STP can block the port",
      "Disabling of all 802.1Q tag headers",
      "Automatic assignment to the default Native VLAN",
      "High CPU processing latency on BPDUs"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "PortFast transitions interfaces directly to Forwarding. If a switch/loop is connected downstream, a loop will form instantly before the switch processes BPDUs to block it.",
      "wrong": [
        "PortFast doesn't increase CPU latency directly; it bypasses timer delays.",
        "802.1Q trunks are unrelated to PortFast port state transitions.",
        "PortFast does not change interface access VLAN assignments."
      ],
      "tip": "PortFast + Switch/Hub connection = Loop danger. Combine with BPDU Guard to protect ports.",
      "memory": "PortFast bypasses loop detection, leading to loops if mismatched.",
      "real": "To prevent loop threats in cubicles, switch templates apply \"spanning-tree portfast\" together with \"spanning-tree bpduguard enable\" on access ports.",
      "commands": [
        "spanning-tree portfast",
        "spanning-tree bpduguard enable"
      ]
    }
  },
  {
    "id": 218,
    "domain": "Network Access",
    "topic": "Wireless",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "Which AP mode is designed to run dedicated spectrum analysis to locate RF interference without serving active wireless clients?",
    "options": [
      "Local Mode",
      "FlexConnect Mode",
      "Sniffer Mode",
      "Monitor Mode"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Monitor mode turns the Lightweight AP into a dedicated sensor that scans channels, tracks clients, and reports RF noise without serving connections.",
      "wrong": [
        "Local Mode is the default mode that serves wireless clients on local channels.",
        "FlexConnect Mode allows local switching of user traffic if connection to WLC fails.",
        "Sniffer Mode captures and redirects raw wireless frames to a Wireshark capture server."
      ],
      "tip": "RF scanning sensor mode = Monitor Mode.",
      "memory": "Monitor monitors the spectrum.",
      "real": "Network engineers change a spare AP near a kitchen to Monitor Mode to isolate microwave oven RF interference that is dropping nearby client sessions.",
      "commands": []
    }
  },
  {
    "id": 219,
    "domain": "Network Access",
    "topic": "VLANs",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "What Cisco trunking feature dynamically limits broadcast traffic by removing idle VLANs from trunk paths?",
    "options": [
      "VTP Pruning",
      "VLAN Access Lists (VACLs)",
      "Port Security aging",
      "802.1Q Native trunk tagging"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "VTP Pruning dynamically removes VLAN broadcast traffic from trunk links if the downstream switch has no ports active in those VLANs.",
      "wrong": [
        "VACLs are access control filters, not dynamic broadcast limiters.",
        "Native VLAN tagging enforces encapsulation, not traffic pruning.",
        "Port Security aging drops MAC addresses, not VLAN broadcast groups."
      ],
      "tip": "Limiting broadcast traffic over trunk links dynamically = VTP Pruning.",
      "memory": "Pruning means cutting off unused paths.",
      "real": "In a campus network, configuring VTP Pruning prevents large broadcast floods from VLAN 10 from traversing inter-switch trunks to switches that do not use VLAN 10.",
      "commands": [
        "vtp pruning"
      ]
    }
  },
  {
    "id": 220,
    "domain": "Network Access",
    "topic": "CDP",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "Which Layer 2 Cisco proprietary protocol runs by default to discover adjacent directly-connected devices?",
    "options": [
      "PAgP",
      "LLDP",
      "VTP",
      "CDP"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Cisco Discovery Protocol (CDP) is enabled by default on Cisco devices to discover neighboring devices (names, IPs, hardware platforms).",
      "wrong": [
        "LLDP is the open standard equivalent, not Cisco proprietary.",
        "VTP is used to distribute VLAN database state, not discover hardware neighbors.",
        "PAgP negotiates EtherChannel port groupings, not peer hardware details."
      ],
      "tip": "Cisco default discovery = CDP. Open standard discovery = LLDP.",
      "memory": "CDP = Cisco Discovery Protocol.",
      "real": "When tracing an unlabeled cable patch panel, running \"show cdp neighbors\" on the switch displays the exact neighbor hostname and port ID plugged into the other end.",
      "commands": [
        "show cdp neighbors"
      ]
    }
  },
  {
    "id": 221,
    "domain": "IP Connectivity",
    "topic": "Route Selection",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A Cisco router receives three separate routing table advertisements for the destination prefix 10.0.0.0/24: RIP (AD 120), OSPF (AD 110), and a Static Route (AD 1). If all paths are functional, which route is installed in the global IP routing table?",
    "options": [
      "The Static route",
      "The OSPF route",
      "All three routes are installed and load-balanced",
      "The RIP route"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "The router selects the route with the lowest Administrative Distance (AD). Static routes have an AD of 1, which is preferred over OSPF (110) and RIP (120).",
      "wrong": [
        "RIP has a higher AD of 120 and is less trusted than static or OSPF paths.",
        "OSPF has an AD of 110 and is less trusted than static routes.",
        "Load-balancing only occurs if routes are learned from the same protocol with equal metrics."
      ],
      "tip": "Administrative Distance = Route source trustworthiness (lower is more trusted).",
      "memory": "Static route = AD 1. OSPF = AD 110. RIP = AD 120.",
      "real": "To override a dynamic OSPF route, an engineer configures a static route with AD 1, which takes precedence instantly.",
      "commands": [
        "show ip route"
      ]
    }
  },
  {
    "id": 222,
    "domain": "IP Connectivity",
    "topic": "OSPF States",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "In which OSPF neighbor state is the DR/BDR election completed, and link-state databases fully synchronized?",
    "options": [
      "Full state",
      "Init state",
      "2-Way state",
      "ExStart state"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "The \"Full\" state represents complete adjacency and synchronization of the link-state databases between OSPF routers.",
      "wrong": [
        "Init state indicates a Hello packet was received, but two-way communication is not verified.",
        "2-Way state indicates bidirectional communication is active, and DR/BDR election is complete, but databases are not synced (normal for DROTHERs).",
        "ExStart state initializes primary/secondary sequence numbering for database exchange."
      ],
      "tip": "OSPF Full State = Adjacency complete, databases fully synchronized.",
      "memory": "Full = Fully synchronized databases.",
      "real": "Running \"show ip ospf neighbor\" displays a state of \"FULL/DR\" indicating that the local router is fully synchronized with the Designated Router.",
      "commands": [
        "show ip ospf neighbor"
      ]
    }
  },
  {
    "id": 223,
    "domain": "IP Connectivity",
    "topic": "Static Routes",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "What parameter must be configured on a static route to make it act as a backup route that only appears in the routing table if the primary dynamic route fails?",
    "options": [
      "A route-map filtering statement",
      "A secondary next-hop gateway IP",
      "A lower metric value",
      "A higher administrative distance (floating static route)"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Configuring a static route with a higher Administrative Distance than the primary route (e.g., AD 120 backup for OSPF 110) creates a floating static route that only activates if primary path goes down.",
      "wrong": [
        "Metric values do not determine priority between different routing protocols.",
        "A secondary next-hop without AD modification will load-balance or replace primary routes.",
        "Route maps filter traffic but do not configure administrative backup parameters."
      ],
      "tip": "Floating Static Route = Backup route with administrative distance higher than dynamic route.",
      "memory": "Floating = Floats out of the routing table until needed.",
      "real": "To provide backup WAN routing, an administrator configures \"ip route 0.0.0.0 0.0.0.0 203.0.113.1 150\", creating a floating backup with AD 150.",
      "commands": [
        "ip route 0.0.0.0 0.0.0.0 203.0.113.1 150"
      ]
    }
  },
  {
    "id": 224,
    "domain": "IP Connectivity",
    "topic": "HSRP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "In HSRP, what is the default active state priority, and how do you ensure the primary router regains its active role after recovering from a failure?",
    "options": [
      "Priority 100, set standby timer to 10 seconds",
      "Priority 100, enable preempt",
      "Priority 200, disable preempt",
      "Priority 50, enable preempt"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "The default HSRP priority is 100. To force a recovered primary router with higher priority to take back the Active role from backup, you must configure the \"preempt\" command.",
      "wrong": [
        "Disabling preempt stops the primary router from taking back the active role, leaving the standby router active.",
        "Priority 50 is lower than default, preventing the router from being selected as active.",
        "Standby timers control hello/hold periods, not role reclamation."
      ],
      "tip": "HSRP active role reclamation requires: Higher priority + Preempt enabled.",
      "memory": "Preempt = Pre-emptively seize the active role.",
      "real": "When Switch-1 reboot completes, configuring \"standby 1 preempt\" ensures it immediately reclaims the active gateway gateway role.",
      "commands": [
        "standby 1 priority 110",
        "standby 1 preempt"
      ]
    }
  },
  {
    "id": 225,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "Which area designator must match between two OSPF neighbors for them to successfully form an adjacency?",
    "options": [
      "Area ID and Area Type (stub/transit)",
      "Interface IP address subnet mask",
      "OSPF Process ID",
      "Router ID"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "OSPF neighbors must be assigned to the same Area ID, and share matching Area Type flags (stub, NSSA, or backbone/transit) to form neighbor relationships.",
      "wrong": [
        "Router IDs must be unique; duplicate Router IDs block adjacencies.",
        "OSPF Process IDs are locally significant and do not need to match between neighbors.",
        "Subnet masks must match on ethernet links, but Area parameters are the core OSPF constraint check."
      ],
      "tip": "OSPF Adjacency matches: Area ID, Area Type, Subnet, Hello/Dead timers, Authentication.",
      "memory": "Same Area + Same Type = OSPF Neighbor.",
      "real": "If a neighbor link fails to form, verify that both interfaces are configured in Area 0 and neither is marked as a stub.",
      "commands": [
        "show ip ospf interface"
      ]
    }
  },
  {
    "id": 226,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "How does OSPF determine its Router ID if it is NOT configured manually via the \"router-id\" command?",
    "options": [
      "Randomly generated UUID",
      "Lowest IP address on physical interfaces",
      "Highest IP address on active loopback interfaces; if none, highest IP address on active physical interfaces",
      "MAC address of interface Gig0/0"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "OSPF selects the highest IP address of any active loopback interfaces. If none exist, it falls back to selecting the highest active IP address on physical interfaces.",
      "wrong": [
        "OSPF selects the highest IP, not the lowest IP.",
        "OSPF Router ID must be formatted as a 32-bit IPv4 address, not a UUID.",
        "MAC addresses are not used as Router IDs in OSPF."
      ],
      "tip": "Router ID Tiebreaker: Loopback IP > Physical IP (highest address wins).",
      "memory": "Router ID Selection: 1. Manual -> 2. Loopback -> 3. Physical.",
      "real": "To ensure stable OSPF behavior, administrators configure a static loopback interface \"interface loopback0\" with IP \"1.1.1.1\" as the Router ID.",
      "commands": [
        "interface loopback 0",
        "ip address 1.1.1.1 255.255.255.255"
      ]
    }
  },
  {
    "id": 227,
    "domain": "IP Connectivity",
    "topic": "Static Routes",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "25%",
    "frequency": "High",
    "text": "How is the gateway of last resort configured on a Cisco router using static routing?",
    "options": [
      "ip default-gateway 192.168.1.1",
      "router ospf 1 -> default-information originate",
      "ip route any any [next-hop-ip]",
      "ip route 0.0.0.0 0.0.0.0 [next-hop-ip]"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "The default static route \"ip route 0.0.0.0 0.0.0.0 [next-hop-ip]\" acts as the gateway of last resort, routing all unknown packets to the next-hop provider.",
      "wrong": [
        "ip default-gateway is used on Layer 2 switches, not Layer 3 routers.",
        "default-information originate advertises default routes to OSPF peers, but does not configure the local gateway itself.",
        "ip route any any is invalid Cisco IOS command syntax."
      ],
      "tip": "Gateway of last resort = Default static route (0.0.0.0 0.0.0.0).",
      "memory": "All zeros default route: 0.0.0.0 0.0.0.0.",
      "real": "To connect a branch office to the Internet, configure \"ip route 0.0.0.0 0.0.0.0 203.0.113.1\" directing all external traffic to the ISP.",
      "commands": [
        "ip route 0.0.0.0 0.0.0.0 203.0.113.1"
      ]
    }
  },
  {
    "id": 228,
    "domain": "IP Connectivity",
    "topic": "IPv6 Static Routing",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "25%",
    "frequency": "High",
    "text": "What IPv6 command enables routing of IPv6 unicast packets globally on a Cisco router?",
    "options": [
      "ipv6 routing enable",
      "ip routing ipv6",
      "ipv6 address unicast",
      "ipv6 unicast-routing"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "By default, IPv6 routing is disabled on Cisco routers. The command \"ipv6 unicast-routing\" must be configured globally to enable IPv6 packet forwarding.",
      "wrong": [
        "ipv6 routing enable is invalid syntax.",
        "ipv6 address unicast assigns addresses but does not enable global forwarding.",
        "ip routing ipv6 is invalid syntax."
      ],
      "tip": "Before configuring IPv6 OSPF or Static routes, always execute: ipv6 unicast-routing.",
      "memory": "unicast-routing enables forwarding.",
      "real": "If a router interface has IPv6 addresses configured but fails to ping interfaces on other subnets, check if \"ipv6 unicast-routing\" is missing.",
      "commands": [
        "ipv6 unicast-routing"
      ]
    }
  },
  {
    "id": 229,
    "domain": "IP Connectivity",
    "topic": "Route Selection",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A router has three route entries for 192.168.1.0/24, 192.168.1.0/25, and 192.168.1.128/26. An incoming packet is destined for 192.168.1.10. Which route will the router select to forward the packet?",
    "options": [
      "It will drop the packet due to routing collision",
      "192.168.1.128/26",
      "192.168.1.0/24",
      "192.168.1.0/25"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "The router selects the longest prefix match. The destination address 192.168.1.10 falls within both 192.168.1.0/24 and 192.168.1.0/25, but /25 is the longer prefix.",
      "wrong": [
        "192.168.1.0/24 is a match, but has a shorter subnet mask (/24 < /25) and is skipped.",
        "192.168.1.128/26 does not match 192.168.1.10 (range is 192.168.1.128 to .191).",
        "The router handles prefix matches without conflicts."
      ],
      "tip": "Longest prefix match rule: Subnet mask size (/25 > /24) takes precedence over AD or Metric.",
      "memory": "Longest mask wins.",
      "real": "When troubleshooting routing tables, the most specific route entry is always selected to determine the egress interface.",
      "commands": [
        "show ip route 192.168.1.10"
      ]
    }
  },
  {
    "id": 230,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is analyzing a network segment. What is the default reference bandwidth for OSPF cost calculation, and why is \"auto-cost reference-bandwidth\" recommended on modern networks?",
    "options": [
      "100 Gbps; links default to cost 1",
      "100 Mbps; default values cannot differentiate between FastEthernet, Gigabit, and 10-Gigabit links",
      "10 Mbps; links fail cost checks",
      "1 Gbps; modern interfaces are slower than the reference speed"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "The default OSPF reference bandwidth is 100 Mbps. Since OSPF cost is Reference / Interface speed, all links of 100 Mbps or faster get a cost of 1. Auto-cost reference-bandwidth must be configured to differentiate fast links.",
      "wrong": [
        "The default reference speed is 100 Mbps, not 1 Gbps.",
        "Reference speed does not default to 100 Gbps.",
        "10 Mbps is the speed of legacy Ethernet, not the reference bandwidth."
      ],
      "tip": "OSPF Cost = 100,000,000 / Interface Speed in bps. Minimum cost is 1.",
      "memory": "Default reference = 100 Mbps (Fast Ethernet). Adjust for Gig networks.",
      "real": "On a gigabit switch network, apply \"auto-cost reference-bandwidth 1000\" so OSPF assigns a cost of 1 to Gigabit and 10 to Fast Ethernet.",
      "commands": [
        "auto-cost reference-bandwidth 1000"
      ]
    }
  },
  {
    "id": 231,
    "domain": "IP Connectivity",
    "topic": "Route Selection",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "Match the administrative distances of RIP, OSPF, External EIGRP, and Internal EIGRP in order.",
    "options": [
      "120, 90, 110, 170",
      "120, 110, 170, 90",
      "90, 110, 120, 170",
      "110, 120, 90, 170"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "RIP has an AD of 120, OSPF is 110, External EIGRP is 170, and Internal EIGRP is 90.",
      "wrong": [
        "EIGRP internal is 90, dynamic OSPF is 110, which matches option A.",
        "Option B lists EIGRP internal first.",
        "Option C lists EIGRP internal second."
      ],
      "tip": "Lower AD = More trusted routing protocol.",
      "memory": "Int EIGRP (90) < OSPF (110) < RIP (120) < Ext EIGRP (170).",
      "real": "A corporate core router running both OSPF and EIGRP prefers internal EIGRP routes for the same prefix due to the lower AD (90 vs 110).",
      "commands": []
    }
  },
  {
    "id": 232,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is analyzing a network segment. What is the outcome of configuring \"passive-interface\" on an OSPF router interface?",
    "options": [
      "It encrypts OSPF hello packets",
      "It stops sending OSPF hellos on that interface, preventing neighbor adjacencies, but still advertises the subnet into OSPF",
      "It shuts down the physical interface completely",
      "It ignores all incoming static routes"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "The passive-interface command prevents the interface from sending or receiving OSPF Hellos, blocking neighbor adjacencies while still advertising the local subnet to other routers.",
      "wrong": [
        "It does not shut down the link; user traffic is still forwarded normally.",
        "It does not encrypt OSPF traffic.",
        "Static routes are unaffected by OSPF interface parameters."
      ],
      "tip": "OSPF Passive Interface = No Hello packets sent/received, subnet advertised.",
      "memory": "Passive = Advertised but silent.",
      "real": "To secure a LAN interface connected to user desktops, configure it as a passive interface so users cannot run rogue OSPF routers.",
      "commands": [
        "passive-interface GigabitEthernet0/0"
      ]
    }
  },
  {
    "id": 233,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "If OSPF neighbors have mismatched MTU sizes on their connecting interfaces, at which neighbor state will they get stuck?",
    "options": [
      "Down state",
      "Init state",
      "ExStart/Exchange state",
      "Loading state"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "OSPF neighbors exchange Database Description (DBD) packets in the ExStart/Exchange states. If MTU values mismatch, they cannot exchange large DBDs and hang in this state.",
      "wrong": [
        "Down state is the initial state prior to receiving hellos.",
        "Init state is reached when hellos are heard, but bi-directional validation is incomplete.",
        "Loading state requests link state updates after the exchange completes."
      ],
      "tip": "OSPF stuck in ExStart/Exchange = Verify matching interface MTU sizes.",
      "memory": "MTU mismatch = ExStart trap.",
      "real": "If a WAN interface is switched to MTU 1492 but the peer stays at 1500, the OSPF adjacency drops and gets stuck in EXSTART.",
      "commands": [
        "show ip ospf neighbor"
      ]
    }
  },
  {
    "id": 234,
    "domain": "IP Services",
    "topic": "NAT",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "How does PAT (NAT Overload) allow thousands of internal hosts to share a single public IP address?",
    "options": [
      "By allocating static blocks of MAC addresses",
      "By compressing the IP packet payload",
      "By assigning unique source TCP/UDP port numbers to each translation entry",
      "By rotating destination IP addresses dynamically"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "Port Address Translation (PAT) maps internal private IP addresses to a single public IP address by tracking translation entries using unique source port numbers.",
      "wrong": [
        "PAT translates source IP addresses, not destination addresses.",
        "MAC addresses are Layer 2 and are not translated by NAT (Layer 3).",
        "NAT does not compress packet payloads."
      ],
      "tip": "PAT = Port Address Translation = NAT Overload.",
      "memory": "PAT uses Port numbers to track users.",
      "real": "A home router uses PAT to connect smartphones, laptops, and smart TVs to the internet using the single public IP assigned by the ISP.",
      "commands": [
        "show ip nat translations"
      ]
    }
  },
  {
    "id": 235,
    "domain": "IP Services",
    "topic": "NTP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "What stratum value represents an NTP server that is directly attached to an authoritative reference clock (such as an atomic clock or GPS receiver)?",
    "options": [
      "Stratum 0",
      "Stratum 2",
      "Stratum 16",
      "Stratum 1"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "NTP Stratum values indicate distance to the reference clock. Stratum 0 is the high-precision reference clock itself. Devices directly synchronized to Stratum 0 are Stratum 1.",
      "wrong": [
        "Stratum 0 represents physical atomic clocks or GPS receivers, which cannot be queried over networks.",
        "Stratum 2 devices synchronize with Stratum 1 servers over the network.",
        "Stratum 16 represents an unsynchronized/offline state."
      ],
      "tip": "Stratum 1 = Directly connected to Stratum 0 clock. Lower stratum is more accurate.",
      "memory": "Stratum 1 is 1 hop from the clock source.",
      "real": "To provide stable network timestamps, local domain controllers sync time with stratum 1 internet NTP servers.",
      "commands": [
        "show ntp status"
      ]
    }
  },
  {
    "id": 236,
    "domain": "IP Services",
    "topic": "DHCP",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network engineer is analyzing a network segment. What is the sequence of client/server messages during a standard DHCP dynamic address allocation?",
    "options": [
      "Request, Offer, Discover, Acknowledge",
      "Discover, Request, Offer, Acknowledge",
      "Discover, Offer, Request, Acknowledge (DORA)",
      "Discover, Offer, Acknowledge, Request"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "The DHCP lease process uses four steps: Discover (client broadcast), Offer (server unicast/broadcast), Request (client broadcast), and Acknowledge (server).",
      "wrong": [
        "Request happens third, not first.",
        "Discover must start the sequence.",
        "Acknowledge completes the sequence, it cannot happen before Request."
      ],
      "tip": "DHCP allocation memory aid: D-O-R-A (Discover, Offer, Request, Acknowledge).",
      "memory": "DORA the Explorer finds IP addresses.",
      "real": "When a laptop boots on Wi-Fi, it sends a DHCP Discover. The WLC/Server responds with a DHCP Offer listing its assigned IP address.",
      "commands": [
        "ip dhcp pool"
      ]
    }
  },
  {
    "id": 237,
    "domain": "IP Services",
    "topic": "SNMP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which SNMP version introduced cryptographic authentication and encryption for manager-agent communications?",
    "options": [
      "SNMPv4",
      "SNMPv1",
      "SNMPv3",
      "SNMPv2c"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "SNMPv3 introduced robust security models supporting message integrity, authentication (SHA/MD5), and encryption (AES/DES).",
      "wrong": [
        "SNMPv1 sends community strings in cleartext without encryption.",
        "SNMPv2c improved packet formats but still uses cleartext community strings.",
        "SNMPv4 does not exist in standard networking specifications."
      ],
      "tip": "Secure SNMP version = SNMPv3.",
      "memory": "SNMPv3 = 3 security levels (NoAuthNoPriv, AuthNoPriv, AuthPriv).",
      "real": "Enterprise monitoring configurations require SNMPv3 AuthPriv to encrypt router telemetry data sent across the WAN.",
      "commands": [
        "snmp-server group MONITOR v3 priv"
      ]
    }
  },
  {
    "id": 238,
    "domain": "IP Services",
    "topic": "Syslog",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Match the Syslog severity levels for Emergency, Error, Warning, and Debugging in order.",
    "options": [
      "0, 3, 4, 7",
      "0, 4, 3, 7",
      "1, 2, 3, 4",
      "7, 4, 3, 0"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Syslog severity scales from 0 (Emergency, highest) to 7 (Debugging, lowest). Error is level 3, and Warning is level 4.",
      "wrong": [
        "Option B lists Debugging first.",
        "Option C lists Warning before Error.",
        "Option D is incorrect order."
      ],
      "tip": "Syslog severities memory tip: Every Awesome Cisco Engineer Will Need Ice Daily (Emergency, Alert, Critical, Error, Warning, Notification, Informational, Debug).",
      "memory": "Emergency = 0 (most critical). Debug = 7 (least critical).",
      "real": "To prevent syslog database saturation, logs are filtered at severity 4 (Warnings) so debug packets are omitted.",
      "commands": [
        "logging trap 4"
      ]
    }
  },
  {
    "id": 239,
    "domain": "Security Fundamentals",
    "topic": "Security Program Elements",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "An organization is designing a training program to mitigate social engineering attacks. Which type of social engineering attack involves an attacker establishing a physical presence at a facility by following an authorized employee through a secure badge-access door without scanning their own credential?",
    "options": [
      "Tailgating",
      "Phishing",
      "Spear phishing",
      "Watering hole attack"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Tailgating (or piggybacking) is a physical social engineering attack where an unauthorized person follows an authorized employee into a restricted area.",
      "wrong": [
        "Phishing is an email-based attack aimed at stealing credentials or sensitive information.",
        "Spear phishing is a highly targeted email phishing attempt directed at a specific individual or organization.",
        "A watering hole attack compromises a specific website frequented by target users to infect their systems."
      ],
      "tip": "Physical security breach by following behind someone = Tailgating.",
      "memory": "Tailgating = Closely following a vehicle (or person) in front of you.",
      "real": "To prevent tailgating, corporate facilities install physical turnstiles or security mantraps that allow only one person to pass per badge scan.",
      "commands": []
    }
  },
  {
    "id": 240,
    "domain": "Security Fundamentals",
    "topic": "AAA Security",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "15%",
    "frequency": "High",
    "text": "A network architect is choosing between TACACS+ and RADIUS for administrative access control. Which of the following correctly describes a fundamental difference between these two AAA protocols?",
    "options": [
      "TACACS+ combines authentication and authorization into a single service, while RADIUS separates them",
      "RADIUS is Cisco-proprietary, while TACACS+ is an open industry standard",
      "TACACS+ uses TCP port 49 and encrypts the entire packet body except the header, while RADIUS uses UDP and only encrypts the password",
      "RADIUS encrypts the entire packet body, while TACACS+ only encrypts the password field"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "TACACS+ uses TCP (port 49) for reliable delivery and encrypts the entire payload (except the standard header). RADIUS uses UDP (ports 1812/1813 or 1645/1646) and only encrypts the password field in access request packets.",
      "wrong": [
        "TACACS+ encrypts the entire packet body, not RADIUS.",
        "TACACS+ separates authentication, authorization, and accounting, while RADIUS combines authentication and authorization.",
        "RADIUS is an open standard (RFC 2865), whereas TACACS+ was originally Cisco-proprietary."
      ],
      "tip": "TACACS+ = TCP 49, Encrypts all, Separate AAA. RADIUS = UDP 1812/1813, Encrypts only password, Combines Auth/Authz.",
      "memory": "T in TACACS+ = TCP and Total encryption.",
      "real": "When configuring administrative login access for a fleet of enterprise switches, network engineers choose TACACS+ to enable command-by-command authorization tracking.",
      "commands": [
        "tacacs-server host 10.1.1.5 key Cisco123"
      ]
    }
  },
  {
    "id": 241,
    "domain": "Security Fundamentals",
    "topic": "VPNs",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "15%",
    "frequency": "High",
    "text": "During IPsec tunnel negotiations, which protocol is responsible for encrypting the data payload, and which IP protocol number does it use?",
    "options": [
      "Transport Layer Security (TLS), TCP port 443",
      "Encapsulating Security Payload (ESP), IP protocol 50",
      "Internet Key Exchange (IKE), UDP port 500",
      "Authentication Header (AH), IP protocol 51"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Encapsulating Security Payload (ESP) provides data confidentiality (encryption), integrity, and authentication. It runs directly over IP using IP protocol number 50.",
      "wrong": [
        "Authentication Header (AH) provides authentication and integrity but does NOT encrypt the payload. It uses IP protocol 51.",
        "IKE negotiates security associations (SAs) using UDP port 500 but does not encapsulate/encrypt the data traffic payload itself.",
        "TLS is a TCP-based secure socket layer, not the core protocol used in IPsec site-to-site tunnels."
      ],
      "tip": "ESP = Encryption (Confidentiality) + Authentication + Integrity. IP Protocol 50.",
      "memory": "ESP = Encryption Special Protection.",
      "real": "When auditing a firewall policy, an engineer must permit IP protocol 50 (ESP) and UDP port 500 (ISAKMP) to allow site-to-site VPN traffic to flow.",
      "commands": [
        "crypto ipsec transform-set ESP-AES-SHA esp-aes esp-sha-hmac"
      ]
    }
  },
  {
    "id": 242,
    "domain": "Security Fundamentals",
    "topic": "Port Security",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "15%",
    "frequency": "High",
    "text": "A switch port is configured with port security violation mode 'restrict'. Which of the following lists the exact actions the switch takes when an unauthorized MAC address sends a frame to this port?",
    "options": [
      "The frame is dropped, no notifications are sent, and the interface remains up",
      "The frame is forwarded but marked with a high priority tag, and an email warning is sent",
      "The frame is dropped, a syslog message and SNMP trap are generated, and the security violation counter increments",
      "The port is immediately transition to err-disabled state, a syslog message is generated, and the security violation counter increments"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "In 'restrict' mode, unauthorized frames are dropped, the violation counter increments, and syslog/SNMP notifications are generated, but the port remains up (unlike shutdown mode).",
      "wrong": [
        "Transitioning to err-disabled occurs in 'shutdown' mode, not restrict.",
        "Dropping the frame silently without generating notifications occurs in 'protect' mode.",
        "Frames are dropped, not forwarded, and email alerts are not natively sent by switch ASIC hardware."
      ],
      "tip": "Port Security modes: Protect = Silent Drop. Restrict = Drop + Log + Counter. Shutdown = Error-disable port.",
      "memory": "Restrict = Restricts traffic, raises alarm (Counter + Log).",
      "real": "To avoid constant administrative overhead of manually resetting err-disabled ports, security engineers apply 'restrict' mode on wall-jack interfaces.",
      "commands": [
        "switchport port-security violation restrict"
      ]
    }
  },
  {
    "id": 243,
    "domain": "Security Fundamentals",
    "topic": "Access Control Lists",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "An administrator needs to create an IPv4 access control list statement that matches only host addresses in the range 192.168.16.0 to 192.168.31.255. Which network block and wildcard mask should be configured?",
    "options": [
      "192.168.16.0 0.0.15.255",
      "192.168.16.0 255.255.240.0",
      "192.168.16.0 0.0.31.255",
      "192.168.16.0 0.0.0.15"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "The range spans 16 subnets of size 256 addresses (192.168.16.0/20). To calculate the wildcard mask: subtract the subnet mask (255.255.240.0) from 255.255.255.255, which yields 0.0.15.255.",
      "wrong": [
        "0.0.31.255 matches a range from 192.168.16.0 to 192.168.47.255 (32 subnets).",
        "0.0.0.15 matches only addresses from 192.168.16.0 to 192.168.16.15.",
        "255.255.240.0 is the standard subnet mask, not the wildcard mask."
      ],
      "tip": "Wildcard Mask = 255.255.255.255 minus Subnet Mask.",
      "memory": "Range size 16 = block of 16. Wildcard is block - 1 = 15.",
      "real": "To restrict accounting server access to a block of desks, an engineer configures: access-list 10 permit 192.168.16.0 0.0.15.255.",
      "commands": [
        "access-list 10 permit 192.168.16.0 0.0.15.255"
      ]
    }
  },
  {
    "id": 244,
    "domain": "Security Fundamentals",
    "topic": "DHCP Snooping",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "When implementing DHCP Snooping on a Cisco Catalyst switch, on which interfaces should you configure the port as 'trusted'?",
    "options": [
      "On interfaces connected to the DHCP server or uplinks leading to the server",
      "Only on interfaces configured with PortFast",
      "Only on interfaces connected to user workstations",
      "On all ports by default to maintain dynamic communications"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "DHCP Snooping blocks DHCP Offer/ACK messages on untrusted ports. Therefore, ports connected to legitimate DHCP servers or trunk uplinks leading to them must be configured as trusted.",
      "wrong": [
        "Workstation ports should be untrusted to prevent users from hosting rogue DHCP servers.",
        "If all ports are trusted, DHCP snooping protection is effectively disabled.",
        "PortFast ports connect to end hosts and should remain untrusted."
      ],
      "tip": "DHCP Snooping: Untrusted = Clients (block Offers). Trusted = Servers/Uplinks (allow Offers).",
      "memory": "Trust the server, distrust the client.",
      "real": "An administrator enables DHCP snooping on VLAN 10 and configures the core trunk link with 'ip dhcp snooping trust' to allow IPs to lease successfully.",
      "commands": [
        "ip dhcp snooping",
        "ip dhcp snooping vlan 10",
        "ip dhcp snooping trust"
      ]
    }
  },
  {
    "id": 245,
    "domain": "Security Fundamentals",
    "topic": "Wireless Security",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "Which security protocol was introduced in WPA3 to replace WPA2 Pre-Shared Key (PSK) authentication, preventing offline dictionary attacks via a zero-knowledge proof handshake?",
    "options": [
      "Temporal Key Integrity Protocol (TKIP)",
      "Extensible Authentication Protocol (EAP)",
      "Wired Equivalent Privacy (WEP)",
      "Simultaneous Authentication of Equals (SAE)"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Simultaneous Authentication of Equals (SAE) replaces PSK in WPA3. It establishes a secure session key using a handshake that is immune to offline password guessing (dictionary) attacks.",
      "wrong": [
        "TKIP is a legacy encryption protocol used in WPA, deprecated due to security vulnerabilities.",
        "WEP is an obsolete and highly insecure Layer 2 wireless security standard.",
        "EAP is an authentication framework used in WPA-Enterprise, not a direct PSK replacement protocol."
      ],
      "tip": "WPA3 Personal replacement for PSK = SAE (Simultaneous Authentication of Equals).",
      "memory": "SAE = Safe And Equal handshake.",
      "real": "When configuring a modern corporate guest Wi-Fi SSID, WPA3-Personal with SAE is chosen to protect client traffic from password crack attempts.",
      "commands": []
    }
  },
  {
    "id": 246,
    "domain": "Automation and Programmability",
    "topic": "REST APIs",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A software-defined network controller exposes APIs to allow external script automation and orchestration tools to manage the network. What type of API is this, and which transport protocol is typically used?",
    "options": [
      "Northbound API, using NETCONF",
      "Southbound API, using SSH",
      "Northbound API, using HTTP/HTTPS",
      "Southbound API, using OpenFlow"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "Northbound APIs connect the controller to applications and orchestration tools, typically using RESTful web services over HTTP/HTTPS. Southbound APIs connect the controller to network switches.",
      "wrong": [
        "Southbound APIs manage the switches below the controller (e.g. OpenFlow, SSH, NETCONF).",
        "SSH is a CLI transport, not the standard API standard.",
        "NETCONF is primarily a southbound protocol for direct device configuration."
      ],
      "tip": "Northbound = Up to applications (REST/HTTP). Southbound = Down to network devices (OpenFlow, NETCONF, SNMP).",
      "memory": "North = Up to management. South = Down to hardware.",
      "real": "A Python script queries a Cisco DNA Center controller using a Northbound REST API to retrieve the current inventory of Catalyst switches in JSON format.",
      "commands": []
    }
  },
  {
    "id": 247,
    "domain": "Automation and Programmability",
    "topic": "Data Formats",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Examine the following JSON representation of an interface configuration:\n\n{\n  \"interface\": \"GigabitEthernet0/1\",\n  \"description\": \"Uplink\",\n  \"enabled\": true,\n  \"vlans\": [10, 20]\n}\n\nWhat data type is the value of the key \"vlans\"?",
    "options": [
      "Object",
      "Array",
      "String",
      "Boolean"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "In JSON, values enclosed in square brackets `[ ... ]` represent arrays (ordered lists of values).",
      "wrong": [
        "Strings are enclosed in double quotes (e.g., \"Uplink\").",
        "Objects are enclosed in curly braces `{ ... }`.",
        "Booleans are unquoted literal values `true` or `false`."
      ],
      "tip": "JSON Syntax: { } = Object, [ ] = Array, \" \" = String.",
      "memory": "[ ] looks like shelves in a closet, holding an array of items.",
      "real": "When parsing API payloads from a Cisco Meraki controller, you iterate over arrays to process individual client configuration settings.",
      "commands": []
    }
  },
  {
    "id": 248,
    "domain": "Automation and Programmability",
    "topic": "Configuration Management",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network automation engineer is selecting a configuration management tool. They require an agentless architecture that communicates over standard SSH, using YAML files to define the desired state. Which tool meets these requirements?",
    "options": [
      "SaltStack",
      "Chef",
      "Ansible",
      "Puppet"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "Ansible is agentless, uses YAML-formatted 'playbooks' to describe system configurations, and pushes changes to devices using standard SSH.",
      "wrong": [
        "Puppet uses an agent-based model by default and uses its own Ruby-like declarative language.",
        "Chef uses an agent-based model and defines configurations in Ruby 'recipes'.",
        "SaltStack utilizes agents called 'minions' and zeroMQ for transport by default."
      ],
      "tip": "Ansible = Agentless, YAML playbooks, SSH connection.",
      "memory": "Ansible = Agentless (starts with A).",
      "real": "To push a banner update to 500 routers, an engineer runs an Ansible playbook. The playbook logs in via SSH and updates the configuration in minutes.",
      "commands": [
        "ansible-playbook site.yml"
      ]
    }
  },
  {
    "id": 249,
    "domain": "Automation and Programmability",
    "topic": "REST APIs",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which HTTP status code is returned by a REST API server to indicate that a POST request was successful and a new resource was successfully created?",
    "options": [
      "200 OK",
      "400 Bad Request",
      "401 Unauthorized",
      "201 Created"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "The HTTP status code 201 Created indicates that the request succeeded and led to the creation of a new resource on the server.",
      "wrong": [
        "200 OK indicates general success, but is typical for GET or PUT requests rather than resource creation.",
        "400 Bad Request indicates client-side syntax or payload validation failure.",
        "401 Unauthorized indicates that valid authentication credentials were not provided."
      ],
      "tip": "HTTP Codes: 2xx = Success (200=OK, 201=Created). 4xx = Client Error (401=Unauthorized, 403=Forbidden, 404=Not Found).",
      "memory": "201 = Created (1 represents the first created item).",
      "real": "When creating a new VLAN using a REST API, receiving a 201 status code confirms the VLAN database has been updated with the new ID.",
      "commands": []
    }
  },
  {
    "id": 250,
    "domain": "Automation and Programmability",
    "topic": "Overlay/Underlay",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "High",
    "text": "In a Cisco Software-Defined Access (SD-Access) design, which technology is used as the data plane overlay encapsulation to carry Layer 2/3 virtualized traffic across the physical underlay network?",
    "options": [
      "802.1Q",
      "OSPF",
      "VXLAN",
      "LISP"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "SD-Access uses VXLAN (Virtual Extensible LAN) as the data plane encapsulation overlay. LISP is used for the control plane (locating endpoints), and OSPF/IS-IS runs in the underlay.",
      "wrong": [
        "LISP is the control plane protocol, not the data plane encapsulation.",
        "802.1Q is standard local VLAN tagging, not an overlay encapsulation.",
        "OSPF is a routing protocol used in the physical underlay to establish routing connectivity."
      ],
      "tip": "SD-Access: Data Plane = VXLAN. Control Plane = LISP. Policy Plane = Cisco TrustSec.",
      "memory": "VXLAN = Virtual eXtensible LAN overlay.",
      "real": "SD-Access encapsulates campus traffic in VXLAN packets, allowing users to roam across floors while staying in the same Layer 2 security segment.",
      "commands": []
    }
  },
  {
    "id": 251,
    "domain": "Network Access",
    "topic": "Trunks",
    "type": "multi",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is configuring an 802.1Q trunk link between two switches. Which two configurations will prevent the trunk from forming or cause operational traffic failures? (Choose two.)",
    "options": [
      "A mismatched list of allowed VLANs on either end of the trunk link",
      "One switchport set to trunk mode and the other set to dynamic desirable mode",
      "Different native VLANs configured on each side of the link",
      "Both switchports configured in dynamic auto DTP negotiation mode"
    ],
    "correct": [
      2,
      3
    ],
    "expl": {
      "correct": "C, D",
      "why": "Different native VLANs cause traffic leaks and native VLAN mismatch warnings, preventing normal operation. If both ports are set to dynamic auto, they will both wait for the other to initiate trunk negotiation, causing them to stay in access mode.",
      "wrong": [
        "One port set to trunk mode and the other set to dynamic desirable will successfully form a trunk link.",
        "A mismatched allowed VLAN list does not prevent the trunk itself from forming; it only filters traffic."
      ],
      "tip": "DTP: auto + auto = access. auto + desirable = trunk. native VLANs must match on both ends.",
      "memory": "Both auto = no initiative = access link.",
      "real": "Mismatched native VLANs lead to CDPV2 warnings and packets from VLAN 10 showing up in VLAN 20 on the other switch.",
      "commands": [
        "show interfaces trunk"
      ]
    }
  },
  {
    "id": 252,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "multi",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "Which two conditions must be met for two OSPF routers to form a neighbor relationship? (Choose two.)",
    "options": [
      "The OSPF Process IDs of the two routers must be identical.",
      "The Area IDs of the connecting interfaces must be different.",
      "The Hello and Dead timers on the connecting interfaces must match.",
      "The OSPF Router IDs of the two routers must be unique."
    ],
    "correct": [
      2,
      3
    ],
    "expl": {
      "correct": "C, D",
      "why": "OSPF requires neighbor hello and dead timers to match exactly on connecting interfaces. Router IDs must also be unique; duplicate Router IDs prevent neighbor establishment.",
      "wrong": [
        "OSPF Process IDs are locally significant and do not need to match to form adjacencies.",
        "Area IDs on the connecting interfaces must match, not be different."
      ],
      "tip": "Must match for OSPF neighbor: Hello/Dead timers, Area ID, Subnet, MTU (for Full state), and Authentication.",
      "memory": "Hello timer & unique ID are absolute requirements.",
      "real": "A duplicate OSPF router-id causes routers to constantly reset neighbor relationships and drops route propagation.",
      "commands": [
        "show ip ospf neighbor"
      ]
    }
  },
  {
    "id": 253,
    "domain": "Network Access",
    "topic": "EtherChannel",
    "type": "multi",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A network engineer is configuring an LACP EtherChannel. Which two port mode combinations will successfully negotiate a port channel? (Choose two.)",
    "options": [
      "Desirable on Switch A and Auto on Switch B",
      "Passive on Switch A and Passive on Switch B",
      "Active on Switch A and Active on Switch B",
      "Active on Switch A and Passive on Switch B"
    ],
    "correct": [
      2,
      3
    ],
    "expl": {
      "correct": "C, D",
      "why": "LACP negotiates a channel when at least one side is in active mode. Thus, Active-Active and Active-Passive will form a channel.",
      "wrong": [
        "Passive-Passive will fail to form a channel because neither end will initiate the negotiation.",
        "Desirable and Auto are PAgP modes, not LACP modes."
      ],
      "tip": "LACP: Active/Passive. PAgP: Desirable/Auto. At least one side must actively negotiate.",
      "memory": "LACP Active starts negotiation. Passive waits.",
      "real": "Configuring LACP mode active on both core switches guarantees they negotiate the bundle even if one switch boots slower.",
      "commands": [
        "show etherchannel summary"
      ]
    }
  },
  {
    "id": 254,
    "domain": "IP Connectivity",
    "topic": "Route Selection",
    "type": "multi",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A router receives multiple routing updates for the destination prefix 172.16.1.0/24. Under which two conditions will the router choose the route with the lowest Administrative Distance? (Choose two.)",
    "options": [
      "The routes have different prefix lengths.",
      "The routes are learned via different routing protocols.",
      "The routes have identical prefix lengths.",
      "The routes are learned via the same routing protocol with different metrics."
    ],
    "correct": [
      1,
      2
    ],
    "expl": {
      "correct": "B, C",
      "why": "Administrative Distance is only compared when the router has to choose between routes to the exact same prefix length learned via different routing protocols.",
      "wrong": [
        "If prefix lengths differ (e.g. /24 vs /25), the router uses longest prefix match instead of comparing AD.",
        "If routes are from the same protocol, metric is compared, not AD."
      ],
      "tip": "Longest Prefix Match always wins first. AD is only compared for tie-breakers between different protocols.",
      "memory": "Prefix first, Protocol (AD) second, Metric third.",
      "real": "An OSPF route to 10.0.0.0/24 (AD 110) will be ignored in favor of a RIP route to 10.0.0.0/25 (AD 120) due to longest prefix match.",
      "commands": [
        "show ip route"
      ]
    }
  },
  {
    "id": 255,
    "domain": "Network Access",
    "topic": "Wireless",
    "type": "multi",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "Which two statements describe the characteristics of a split-MAC wireless architecture using CAPWAP? (Choose two.)",
    "options": [
      "The LAP processes Real-Time MAC functions such as beacons and probe responses.",
      "All client traffic is routed directly between LAPs without WLC tunnel encapsulations.",
      "The WLC manages client authentication and radio resource management.",
      "The LAP performs Layer 2 encryption and decryption of wireless WAN frames."
    ],
    "correct": [
      0,
      2
    ],
    "expl": {
      "correct": "A, C",
      "why": "In split-MAC CAPWAP architectures, the WLC handles management functions like client auth and RRM, while the LAP processes real-time MAC functions like beacons and probe responses.",
      "wrong": [
        "Encryption and decryption is managed at the control level (WLC or dynamic keys).",
        "Traffic is tunneled through CAPWAP to the WLC (or locally switched depending on FlexConnect)."
      ],
      "tip": "Split-MAC: LAP handles real-time (beacons, ACKs). WLC handles management (auth, RRM, associations).",
      "memory": "Real-time MAC = AP. Management = Controller.",
      "real": "Split-MAC allows centralizing security policies on a core WLC while lightweight APs focus on forwarding physical signals.",
      "commands": []
    }
  },
  {
    "id": 256,
    "domain": "IP Connectivity",
    "topic": "Static Routes",
    "type": "multi",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "Which two commands configure a floating static route that acts as a backup path when the primary route goes down? (Choose two.)",
    "options": [
      "ip route 0.0.0.0 0.0.0.0 10.1.1.2 1",
      "ip route 0.0.0.0 0.0.0.0 10.2.2.2 250",
      "ip route 0.0.0.0 0.0.0.0 10.1.1.2 200",
      "ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/1"
    ],
    "correct": [
      1,
      2
    ],
    "expl": {
      "correct": "B, C",
      "why": "A floating static route uses an administrative distance higher than the primary route (default static route has an AD of 1). Setting AD to 200 or 250 makes them floating static routes.",
      "wrong": [
        "Specifying GigabitEthernet0/1 without a distance creates a standard static route (AD = 1).",
        "Setting AD to 1 matches the standard static route default, and will not act as a backup."
      ],
      "tip": "Floating static route = static route + administrative distance metric > 1.",
      "memory": "AD > 1 floats behind the active route.",
      "real": "A backup DSL link is configured with a floating static route AD of 200, so it remains inactive until the primary fiber line fails.",
      "commands": [
        "ip route 0.0.0.0 0.0.0.0 10.2.2.2 250"
      ]
    }
  },
  {
    "id": 257,
    "domain": "Network Access",
    "topic": "STP",
    "type": "multi",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "High",
    "text": "In a legacy 802.1D Spanning Tree Protocol implementation, which two port states do NOT forward client data but still process BPDUs? (Choose two.)",
    "options": [
      "Listening",
      "Blocking",
      "Forwarding",
      "Disabled"
    ],
    "correct": [
      0,
      1
    ],
    "expl": {
      "correct": "A, B",
      "why": "Blocking and Listening states discard user traffic but process BPDUs. Forwarding state forwards client data. Disabled state ignores BPDUs.",
      "wrong": [
        "Forwarding state active forwards client data.",
        "Disabled state shuts down all BPDU and traffic processing."
      ],
      "tip": "Blocking: processes BPDUs, no MAC learning, no forwarding. Listening: processes BPDUs, no MAC learning, no forwarding.",
      "memory": "Blocking/Listening read BPDUs to find loops before learning MACs.",
      "real": "A newly connected switchport goes through Blocking -> Listening -> Learning -> Forwarding to ensure no loops are formed.",
      "commands": [
        "show spanning-tree"
      ]
    }
  },
  {
    "id": 258,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "multi",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "Which two methods can be used to manually alter OSPF interface cost metrics on a Cisco router? (Choose two.)",
    "options": [
      "Change the OSPF process ID using the 'router ospf <process-id>' command.",
      "Configure the OSPF Router ID using the 'router-id <ip-address>' command.",
      "Configure the command 'ip ospf cost <value>' on the interface.",
      "Modify the interface bandwidth using the 'bandwidth <kbps>' command."
    ],
    "correct": [
      2,
      3
    ],
    "expl": {
      "correct": "C, D",
      "why": "OSPF interface cost can be changed directly with 'ip ospf cost' or indirectly by changing the interface bandwidth using the 'bandwidth' command (cost = reference bandwidth / interface bandwidth).",
      "wrong": [
        "OSPF process ID is locally significant and does not alter cost metrics.",
        "OSPF router ID is for identification and does not alter interface cost metrics."
      ],
      "tip": "Interface cost = 10^8 / bandwidth. 'ip ospf cost' overrides this calculation.",
      "memory": "ip ospf cost or bandwidth modification.",
      "real": "An engineer sets 'ip ospf cost 10' on a backup link to discourage OSPF path selection unless the primary link goes down.",
      "commands": [
        "ip ospf cost 10"
      ]
    }
  },
  {
    "id": 259,
    "domain": "Network Access",
    "topic": "VLANs",
    "type": "multi",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "Which two benefits are achieved by configuring Virtual Local Area Networks (VLANs) on Layer 2 switch interfaces? (Choose two.)",
    "options": [
      "They eliminate the need for Layer 3 devices to route traffic between different departments.",
      "They allow logical grouping of devices based on department rather than physical location.",
      "They contain broadcast traffic within smaller logical boundaries.",
      "They automatically encrypt all frames transmitted between local switchports."
    ],
    "correct": [
      1,
      2
    ],
    "expl": {
      "correct": "B, C",
      "why": "VLANs provide segmentation by creating smaller broadcast domains and allow logical grouping of hosts based on function or department rather than physical location.",
      "wrong": [
        "VLANs do not encrypt Ethernet frames by default.",
        "Layer 3 devices (routers or L3 switches) are still required to route traffic between different VLANs."
      ],
      "tip": "VLAN = Broadcast boundary = Logical segmentation.",
      "memory": "VLAN = Virtual LAN = Small Broadcast Domain.",
      "real": "Creating VLAN 10 (Sales) and VLAN 20 (HR) keeps broadcast traffic from Sales PCs off HR computers.",
      "commands": [
        "show vlan brief"
      ]
    }
  },
  {
    "id": 260,
    "domain": "IP Connectivity",
    "topic": "Routing",
    "type": "multi",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "Which two statements describe the characteristics of IPv6 static routing? (Choose two.)",
    "options": [
      "Like IPv4, IPv6 static routes can be configured as floating static routes by increasing the administrative distance.",
      "IPv6 static routes are configured using the 'ipv6 route' global command.",
      "IPv6 static routes must always specify the link-local address as the next hop without an egress interface.",
      "IPv6 static routes require dynamic routing protocols (like OSPFv3) to be globally enabled first."
    ],
    "correct": [
      0,
      1
    ],
    "expl": {
      "correct": "A, B",
      "why": "IPv6 static routes are created using the global configuration command 'ipv6 route' and can be configured as floating static routes by specifying a higher administrative distance.",
      "wrong": [
        "IPv6 static routing does not require OSPFv3 or other dynamic protocols.",
        "If a link-local address is used as the next hop, the egress interface must also be specified."
      ],
      "tip": "IPv6 static command syntax: ipv6 route <destination-prefix> <next-hop-or-interface> [AD].",
      "memory": "ipv6 route + higher AD = floating static.",
      "real": "An engineer configures 'ipv6 route 2001:db8::/32 2001:db8:1::2 200' to set up a backup IPv6 static route.",
      "commands": [
        "ipv6 route 2001:db8::/32 2001:db8:1::2 200"
      ]
    }
  },
  {
    "id": 261,
    "domain": "IP Connectivity",
    "topic": "OSPF",
    "type": "dragdrop",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "Arrange the OSPF packet types in the correct order they are transmitted during adjacency negotiation, from neighbor discovery to database synchronization.",
    "order": [
      "Hello (Discover neighbors and establish bidirectionality)",
      "Database Description (DBD - Summarize database contents)",
      "Link State Request (LSR - Request specific updates)",
      "Link State Update (LSU - Flood detailed link records)",
      "Link State Acknowledgment (LSAck - Acknowledge receipt)"
    ],
    "expl": {
      "correct": "Correct Order",
      "why": "OSPF neighbors first discover each other using Hello packets, then negotiate master/slave and exchange DBD summaries, request missing details using LSRs, receive data via LSUs, and acknowledge using LSAck.",
      "wrong": [
        "Sending LSRs before exchanging DBDs is impossible as the router does not know what data is missing.",
        "Flood routing updates (LSU) before discovering neighbors (Hello) is not supported."
      ],
      "tip": "OSPF Exchange order: Hello -> DBD -> LSR -> LSU -> LSAck.",
      "memory": "HDDLA: Hello, DBD, LSR, LSU, LSAck.",
      "real": "If OSPF is stuck in Exchange state, the routers are stuck exchanging DBD packets, usually due to MTU size mismatches.",
      "commands": [
        "debug ip ospf adj"
      ]
    }
  },
  {
    "id": 262,
    "domain": "Network Access",
    "topic": "STP",
    "type": "dragdrop",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "High",
    "text": "Place the legacy Spanning Tree Protocol (STP) port states in the correct transition order when a port goes from a link-up event to active traffic forwarding.",
    "order": [
      "Blocking (Discard user frames, listen for BPDUs)",
      "Listening (Discard user frames, build topology, send/receive BPDUs)",
      "Learning (Discard user frames, populate MAC table, send/receive BPDUs)",
      "Forwarding (Forward user frames, populate MAC table, send/receive BPDUs)"
    ],
    "expl": {
      "correct": "Correct Order",
      "why": "Standard 802.1D transition cycles from Blocking to Listening (negotiating root), then Learning (building MAC table), and finally Forwarding data. Reference: IEEE 802.1D.",
      "wrong": [
        "Learning state must occur after Listening to ensure loops are verified before MAC learning is enabled.",
        "Forwarding is the final state and cannot occur before Learning."
      ],
      "tip": "Portfast bypasses Listening and Learning states, transitioning immediately to Forwarding.",
      "memory": "BLLF: Blocking, Listening, Learning, Forwarding.",
      "real": "A switchport takes 30 seconds (15s Listening, 15s Learning) to transition to Forwarding state to prevent network loops.",
      "commands": [
        "show spanning-tree interface"
      ]
    }
  },
  {
    "id": 263,
    "domain": "IP Connectivity",
    "topic": "Route Selection",
    "type": "dragdrop",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "Arrange the following routing sources in order of their default Administrative Distance (AD), from lowest AD (most trusted) to highest AD (least trusted).",
    "order": [
      "Connected interface (AD = 0)",
      "Static route (AD = 1)",
      "eBGP route (AD = 20)",
      "OSPF route (AD = 110)",
      "RIP route (AD = 120)"
    ],
    "expl": {
      "correct": "Correct Order",
      "why": "Cisco assigns Administrative Distances to evaluate trustworthiness: Connected is 0, Static is 1, eBGP is 20, OSPF is 110, and RIP is 120. Reference: Cisco AD routing manuals.",
      "wrong": [
        "Static route (1) cannot be trusted more than a Connected link (0).",
        "RIP (120) is less trusted than OSPF (110) due to hop count limitations."
      ],
      "tip": "Lower AD is preferred. Connected = 0, Static = 1, eBGP = 20, EIGRP = 90, OSPF = 110, RIP = 120, External EIGRP = 170, iBGP = 200.",
      "memory": "CS E O R: Connected, Static, eBGP, OSPF, RIP.",
      "real": "If OSPF (AD 110) and RIP (AD 120) advertise the same prefix, OSPF is installed in the routing table.",
      "commands": [
        "show ip route"
      ]
    }
  },
  {
    "id": 264,
    "domain": "Network Access",
    "topic": "Wireless",
    "type": "dragdrop",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "High",
    "text": "Arrange the phases of a Lightweight Access Point (LAP) joining a Wireless LAN Controller (WLC) in the correct operational sequence.",
    "order": [
      "LAP boots and requests an IP address via DHCP.",
      "LAP discovers WLC IP addresses via DNS, DHCP Option 43, or broadcast.",
      "LAP sends a CAPWAP Discovery Request to potential WLCs.",
      "LAP establishes a secure DTLS tunnel with the selected WLC.",
      "LAP downloads configuration settings and firmware from the WLC."
    ],
    "expl": {
      "correct": "Correct Order",
      "why": "LAPs follow this discovery sequence: IP allocation, WLC discovery, CAPWAP discovery request, DTLS encryption tunnel setup, and finally image/profile download.",
      "wrong": [
        "LAPs cannot download configurations before negotiating a secure DTLS tunnel.",
        "WLC discovery requires an active IP address first, so DHCP occurs first."
      ],
      "tip": "DHCP option 43 supplies the IP address of the WLC to the AP during startup.",
      "memory": "IP -> Discover WLC -> CAPWAP -> DTLS -> Download.",
      "real": "In corporate campus networks, configuring DHCP Option 43 allows newly installed APs to immediately find WLCs in different subnets.",
      "commands": []
    }
  },
  {
    "domain": "Network Access",
    "topic": "CDP/LLDP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network administrator needs to discover a non-Cisco switch connected to interface Gi0/1. Which command should be used?",
    "options": [
      "show cdp neighbors",
      "show lldp neighbors",
      "show mac address-table",
      "show arp"
    ],
    "correct": [
      1
    ],
    "expl": {
      "text": "LLDP is the vendor-neutral link layer discovery protocol, while CDP is Cisco proprietary.",
      "tip": "LLDP for non-Cisco, CDP for Cisco.",
      "correct": "B",
      "why": "LLDP is the vendor-neutral link layer discovery protocol, while CDP is Cisco proprietary.",
      "wrong": [
        "Option A represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option C represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option D represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax."
      ],
      "memory": "Associate this feature with its primary administrative value or RFC definition.",
      "real": "In production enterprise environments, verifying configurations using 'show' commands is critical before committing changes.",
      "commands": [
        "show running-config"
      ]
    },
    "id": 265
  },
  {
    "domain": "Network Access",
    "topic": "CDP/LLDP",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A systems administrator is configuring a Cisco device. Which command globally enables LLDP on a Cisco switch?",
    "options": [
      "lldp enable",
      "lldp run",
      "cdp run",
      "lldp start"
    ],
    "correct": [
      1
    ],
    "expl": {
      "text": "The 'lldp run' global configuration command enables LLDP on the device.",
      "tip": "LLDP requires 'lldp run' globally, and 'lldp transmit'/'lldp receive' per interface if modified.",
      "correct": "B",
      "why": "The 'lldp run' global configuration command enables LLDP on the device.",
      "wrong": [
        "Option A represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option C represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option D represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax."
      ],
      "memory": "Associate this feature with its primary administrative value or RFC definition.",
      "real": "In production enterprise environments, verifying configurations using 'show' commands is critical before committing changes.",
      "commands": [
        "show running-config"
      ]
    },
    "id": 266
  },
  {
    "domain": "Network Fundamentals",
    "topic": "IPv6",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "When an IPv6 address is generated using EUI-64, what is inserted into the middle of the MAC address to form the interface ID?",
    "options": [
      "FF:FF",
      "FE:FE",
      "FF:FE",
      "00:00"
    ],
    "correct": [
      2
    ],
    "expl": {
      "text": "EUI-64 inserts FF:FE in the middle of the 48-bit MAC address and inverts the 7th bit to create a 64-bit interface ID.",
      "tip": "EUI-64 = MAC halves + FFFE in middle + flip 7th bit.",
      "correct": "C",
      "why": "EUI-64 inserts FF:FE in the middle of the 48-bit MAC address and inverts the 7th bit to create a 64-bit interface ID.",
      "wrong": [
        "Option A represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option B represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option D represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax."
      ],
      "memory": "Associate this feature with its primary administrative value or RFC definition.",
      "real": "In production enterprise environments, verifying configurations using 'show' commands is critical before committing changes.",
      "commands": [
        "show running-config"
      ]
    },
    "id": 267
  },
  {
    "domain": "Network Fundamentals",
    "topic": "IPv6",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "An engineer configures an IPv6 address using EUI-64. The MAC address is 0011.2233.4455. What will be the generated Interface ID?",
    "options": [
      "0211:22FF:FE33:4455",
      "0011:22FF:FE33:4455",
      "0211:22FE:FF33:4455",
      "0011:22FE:FF33:4455"
    ],
    "correct": [
      0
    ],
    "expl": {
      "text": "Insert FF:FE in the middle (0011.22FF.FE33.4455) and invert the 7th bit (00 becomes 02 in hex).",
      "tip": "Always remember to flip the 7th bit of the first octet.",
      "correct": "A",
      "why": "Insert FF:FE in the middle (0011.22FF.FE33.4455) and invert the 7th bit (00 becomes 02 in hex).",
      "wrong": [
        "Option B represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option C represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option D represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax."
      ],
      "memory": "Associate this feature with its primary administrative value or RFC definition.",
      "real": "In production enterprise environments, verifying configurations using 'show' commands is critical before committing changes.",
      "commands": [
        "show running-config"
      ]
    },
    "id": 268
  },
  {
    "domain": "Security Fundamentals",
    "topic": "DHCP Snooping",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "A network engineer is analyzing a network segment. What is the default trust state of an interface when DHCP Snooping is enabled globally?",
    "options": [
      "Trusted",
      "Untrusted",
      "Disabled",
      "Enabled"
    ],
    "correct": [
      1
    ],
    "expl": {
      "text": "All interfaces are untrusted by default when DHCP snooping is enabled. You must explicitly configure trusted ports (usually uplinks to the actual DHCP server).",
      "tip": "Trust the ports facing your servers, not your users.",
      "correct": "B",
      "why": "All interfaces are untrusted by default when DHCP snooping is enabled. You must explicitly configure trusted ports (usually uplinks to the actual DHCP server).",
      "wrong": [
        "Option A represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option C represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option D represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax."
      ],
      "memory": "Associate this feature with its primary administrative value or RFC definition.",
      "real": "In production enterprise environments, verifying configurations using 'show' commands is critical before committing changes.",
      "commands": [
        "show running-config"
      ]
    },
    "id": 269
  },
  {
    "domain": "Security Fundamentals",
    "topic": "Dynamic ARP Inspection",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "15%",
    "frequency": "Medium",
    "text": "Which database does Dynamic ARP Inspection (DAI) rely on to validate ARP packets on untrusted ports?",
    "options": [
      "MAC Address Table",
      "Routing Table",
      "DHCP Snooping Binding Database",
      "ARP Cache"
    ],
    "correct": [
      2
    ],
    "expl": {
      "text": "DAI uses the DHCP snooping binding database to validate IP-to-MAC bindings for ARP packets received on untrusted ports.",
      "tip": "DAI depends on DHCP Snooping.",
      "correct": "C",
      "why": "DAI uses the DHCP snooping binding database to validate IP-to-MAC bindings for ARP packets received on untrusted ports.",
      "wrong": [
        "Option A represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option B represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option D represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax."
      ],
      "memory": "Associate this feature with its primary administrative value or RFC definition.",
      "real": "In production enterprise environments, verifying configurations using 'show' commands is critical before committing changes.",
      "commands": [
        "show running-config"
      ]
    },
    "id": 270
  },
  {
    "domain": "IP Services",
    "topic": "QoS",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network systems engineer is configuring Quality of Service (QoS) on a WAN edge router. The engineer needs to limit outbound traffic to the ISP-contracted rate of 100 Mbps, buffering any temporary bursts above this rate to avoid packet drops. Which QoS mechanism should be used?",
    "options": [
      "Traffic Shaping",
      "Traffic Policing",
      "Weighted Random Early Detection (WRED)",
      "Class-Based Marking"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Traffic Shaping limits traffic rates by buffering excess packets in memory queues when traffic exceeds the configured threshold. This smooths out bursts and prevents packet drops, though it introduces delay. Traffic Policing, on the other hand, drops or re-marks traffic immediately when it exceeds the rate, without buffering. Shaping is recommended for outbound interfaces facing WAN links. Reference: CCNA Volume 2, Chapter 10: Quality of Service.",
      "wrong": [
        "Traffic Policing drops or re-marks packets that exceed the rate rather than buffering them.",
        "WRED is a congestion avoidance mechanism that drops lower-priority TCP packets early to prevent global synchronization; it does not perform rate limiting or shaping.",
        "Class-Based Marking is used to write QoS values (like DSCP or CoS) into packet headers; it does not rate-limit traffic."
      ],
      "tip": "Shaping = Buffers traffic (smooths rate, introduces delay). Policing = Drops or re-marks traffic (causes drops, no delay).",
      "memory": "Shape = Smooth out using a buffer mold. Police = Stop and ticket (drop) immediately.",
      "real": "When purchasing a 100 Mbps MPLS circuit delivered over a 1 Gbps physical fiber handoff, you must configure a shaping rate of 100 Mbps on your edge router. Otherwise, the ISP's policer will drop your traffic as soon as you burst above 100 Mbps.",
      "commands": [
        "traffic-shape rate 100000000",
        "show policy-map interface"
      ]
    },
    "id": 271
  },
  {
    "domain": "IP Services",
    "topic": "QoS",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "Medium",
    "text": "Which DSCP value is recommended by Cisco for voice traffic (VoIP)?",
    "options": [
      "AF41",
      "EF (Expedited Forwarding)",
      "CS3",
      "Default (0)"
    ],
    "correct": [
      1
    ],
    "expl": {
      "text": "Cisco recommends DSCP EF (Expedited Forwarding), which equals decimal 46, for voice traffic due to its strict priority needs.",
      "tip": "EF = Voice = 46.",
      "correct": "B",
      "why": "Cisco recommends DSCP EF (Expedited Forwarding), which equals decimal 46, for voice traffic due to its strict priority needs.",
      "wrong": [
        "Option A represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option C represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option D represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax."
      ],
      "memory": "Associate this feature with its primary administrative value or RFC definition.",
      "real": "In production enterprise environments, verifying configurations using 'show' commands is critical before committing changes.",
      "commands": [
        "show running-config"
      ]
    },
    "id": 272
  },
  {
    "domain": "Automation and Programmability",
    "topic": "DNA Center",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "Medium",
    "text": "In a Cisco SD-Access architecture, which plane handles the mapping of endpoint IDs (EIDs) to routing locators (RLOCs)?",
    "options": [
      "Data Plane",
      "Control Plane",
      "Management Plane",
      "Policy Plane"
    ],
    "correct": [
      1
    ],
    "expl": {
      "text": "The Control Plane (LISP) is responsible for tracking endpoint locations and mapping EIDs to RLOCs.",
      "tip": "LISP = Control Plane, VXLAN = Data Plane, TrustSec = Policy Plane.",
      "correct": "B",
      "why": "The Control Plane (LISP) is responsible for tracking endpoint locations and mapping EIDs to RLOCs.",
      "wrong": [
        "Option A represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option C represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option D represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax."
      ],
      "memory": "Associate this feature with its primary administrative value or RFC definition.",
      "real": "In production enterprise environments, verifying configurations using 'show' commands is critical before committing changes.",
      "commands": [
        "show running-config"
      ]
    },
    "id": 273
  },
  {
    "domain": "Automation and Programmability",
    "topic": "SD-Access",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A company is deploying a new service. Which protocol provides the data plane encapsulation in Cisco SD-Access?",
    "options": [
      "LISP",
      "OSPF",
      "VXLAN",
      "BGP"
    ],
    "correct": [
      2
    ],
    "expl": {
      "text": "VXLAN is used for data plane encapsulation in Cisco SD-Access, allowing Layer 2 frames to be transported over a Layer 3 network.",
      "tip": "LISP = Control Plane, VXLAN = Data Plane.",
      "correct": "C",
      "why": "VXLAN is used for data plane encapsulation in Cisco SD-Access, allowing Layer 2 frames to be transported over a Layer 3 network.",
      "wrong": [
        "Option A represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option B represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option D represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax."
      ],
      "memory": "Associate this feature with its primary administrative value or RFC definition.",
      "real": "In production enterprise environments, verifying configurations using 'show' commands is critical before committing changes.",
      "commands": [
        "show running-config"
      ]
    },
    "id": 274
  },
  {
    "domain": "Network Fundamentals",
    "topic": "IOS Licensing",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "Low",
    "text": "A systems administrator is configuring a Cisco device. Which command allows an administrator to view the current active license level on a Cisco IOS XE device?",
    "options": [
      "show version",
      "show license udi",
      "show license summary",
      "show crypto key"
    ],
    "correct": [
      2
    ],
    "expl": {
      "text": "'show license summary' provides an overview of the Smart Licensing status and current active licenses.",
      "tip": "Smart Licensing is the standard for modern IOS XE.",
      "correct": "C",
      "why": "'show license summary' provides an overview of the Smart Licensing status and current active licenses.",
      "wrong": [
        "Option A represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option B represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option D represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax."
      ],
      "memory": "Associate this feature with its primary administrative value or RFC definition.",
      "real": "In production enterprise environments, verifying configurations using 'show' commands is critical before committing changes.",
      "commands": [
        "show running-config"
      ]
    },
    "id": 275
  },
  {
    "domain": "Network Fundamentals",
    "topic": "IOS Licensing",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Low",
    "text": "In Cisco Smart Licensing, how does a device typically report its license consumption?",
    "options": [
      "By mailing a text file to Cisco",
      "By registering with the Cisco Smart Software Manager (CSSM)",
      "By checking a local hardware dongle",
      "By contacting a TFTP server"
    ],
    "correct": [
      1
    ],
    "expl": {
      "text": "Devices connect directly or via a satellite proxy to the CSSM to report and manage license consumption.",
      "tip": "CSSM = Cisco Smart Software Manager.",
      "correct": "B",
      "why": "Devices connect directly or via a satellite proxy to the CSSM to report and manage license consumption.",
      "wrong": [
        "Option A represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option C represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option D represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax."
      ],
      "memory": "Associate this feature with its primary administrative value or RFC definition.",
      "real": "In production enterprise environments, verifying configurations using 'show' commands is critical before committing changes.",
      "commands": [
        "show running-config"
      ]
    },
    "id": 276
  },
  {
    "domain": "IP Services",
    "topic": "NTP",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which stratum number indicates a device is directly connected to a highly accurate time source (like an atomic clock)?",
    "options": [
      "Stratum 0",
      "Stratum 1",
      "Stratum 15",
      "Stratum 16"
    ],
    "correct": [
      1
    ],
    "expl": {
      "text": "Stratum 1 devices are directly connected to Stratum 0 time sources (atomic/GPS clocks). Stratum 16 means the clock is unsynchronized.",
      "tip": "Lower stratum is better. 1 is directly attached to the reference.",
      "correct": "B",
      "why": "Stratum 1 devices are directly connected to Stratum 0 time sources (atomic/GPS clocks). Stratum 16 means the clock is unsynchronized.",
      "wrong": [
        "Option A represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option C represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option D represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax."
      ],
      "memory": "Associate this feature with its primary administrative value or RFC definition.",
      "real": "In production enterprise environments, verifying configurations using 'show' commands is critical before committing changes.",
      "commands": [
        "show running-config"
      ]
    },
    "id": 277
  },
  {
    "domain": "IP Services",
    "topic": "NTP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "Medium",
    "text": "Which mode should be configured on a Cisco router to peer with another NTP server and allow both to synchronize with each other if needed?",
    "options": [
      "Client mode",
      "Server mode",
      "Symmetric active mode",
      "Broadcast mode"
    ],
    "correct": [
      2
    ],
    "expl": {
      "text": "Symmetric active mode (configured with 'ntp peer') allows two devices to synchronize time with each other.",
      "tip": "'ntp server' = client mode, 'ntp peer' = symmetric active.",
      "correct": "C",
      "why": "Symmetric active mode (configured with 'ntp peer') allows two devices to synchronize time with each other.",
      "wrong": [
        "Option A represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option B represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax.",
        "Option D represents an incorrect parameter, a deprecated protocol, or an invalid Cisco command syntax."
      ],
      "memory": "Associate this feature with its primary administrative value or RFC definition.",
      "real": "In production enterprise environments, verifying configurations using 'show' commands is critical before committing changes.",
      "commands": [
        "show running-config"
      ]
    },
    "id": 278
  },
  {
    "domain": "IP Services",
    "topic": "QoS",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "High",
    "text": "An administrator reviews the packet capture of voice signaling traffic and notices a DSCP value of CS3. Which Per-Hop Behavior (PHB) and decimal value correspond to this classification?",
    "options": [
      "AF31, decimal value 26",
      "CS3, decimal value 24",
      "AF33, decimal value 30",
      "CS3, decimal value 28"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Class Selector 3 (CS3) maps to the legacy IP Precedence value 3. In the DiffServ field, CS3 is represented as binary 011000, which translates to decimal value 24. Citing Vol2 Ch11.",
      "wrong": [
        "AF31 (Assured Forwarding 31) uses binary 011010, which corresponds to decimal value 26, not CS3.",
        "AF33 (Assured Forwarding 33) uses binary 011110, which corresponds to decimal value 30.",
        "CS3 corresponds to decimal 24. Decimal 28 corresponds to AF32 (binary 011100)."
      ],
      "tip": "CS values are simply IP Precedence values shifted left by 3 bits (multiplied by 8). CS3 = 3 * 8 = 24.",
      "memory": "Class Selectors are multiples of 8: CS1=8, CS2=16, CS3=24, CS4=32.",
      "real": "Voice signaling (SIP/H.323) is standardly marked CS3 to guarantee signaling priority over data traffic during call setup.",
      "commands": [
        "show policy-map interface"
      ]
    },
    "id": 279
  },
  {
    "domain": "Automation and Programmability",
    "topic": "YANG / NETCONF",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network engineer wants to configure programmatic access to a Cisco router using NETCONF. Which transport protocol and default TCP port number does NETCONF use?",
    "options": [
      "HTTPS, port 443",
      "SSH, port 22",
      "SSH, port 830",
      "HTTPS, port 830"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "NETCONF is standardly defined to use SSH as its transport protocol, listening on TCP port 830 by default. Citing Vol2 Ch19.",
      "wrong": [
        "HTTPS on port 443 is used by RESTCONF, not NETCONF.",
        "SSH on port 22 is used for standard CLI management access (vty lines), not the NETCONF subsystem interface.",
        "NETCONF utilizes SSH as its transport layer, not HTTPS. HTTPS port 830 is invalid."
      ],
      "tip": "NETCONF = SSH 830. RESTCONF = HTTPS 443.",
      "memory": "NETCONF needs security (SSH) and has its own workspace (830).",
      "real": "Enabling 'netconf-yang' on a Cisco IOS-XE router spawns a listener on port 830 for automation controllers like Cisco DNA Center.",
      "commands": [
        "netconf-yang"
      ]
    },
    "id": 280
  },
  {
    "domain": "Network Fundamentals",
    "topic": "WAN Technologies",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "A company is expanding its WAN to connect 10 branch offices to a central data center. The business requires high reliability between the branches and the data center, but wants to minimize cost by not connecting branches directly to one another. Which WAN topology is best suited for this requirement?",
    "options": [
      "Hub-and-spoke",
      "Full mesh",
      "Point-to-point",
      "Partial mesh"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "A hub-and-spoke WAN topology connects multiple remote branch routers (spokes) to a central location (hub). This minimizes WAN link costs because branches do not require direct links to one another. Citing Vol2 Ch14.",
      "wrong": [
        "Full mesh requires every site to connect to every other site, which dramatically increases link costs.",
        "Point-to-point connections only connect two endpoints directly and do not scale to connect 10 branch offices without multiple interfaces.",
        "Partial mesh connects some, but not all, remote sites together, incurring more link cost than a hub-and-spoke setup."
      ],
      "tip": "Hub-and-spoke = cheapest option for branch-to-HQ connectivity.",
      "memory": "Spokes point to the hub like a bicycle wheel.",
      "real": "DMVPN networks commonly deploy a hub-and-spoke architecture to link satellite branch offices to headquarters.",
      "commands": [
        "show tunnel destination"
      ]
    },
    "id": 281
  },
  {
    "domain": "IP Services",
    "topic": "QoS",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "Medium",
    "text": "A network engineer is configuring traffic conditioning on a WAN edge router. The service provider mandates that any egress traffic exceeding the contracted Information Rate (CIR) must be immediately dropped rather than buffered. Which QoS mechanism should the engineer implement?",
    "options": [
      "Traffic shaping",
      "Tail drop",
      "Weighted Random Early Detection (WRED)",
      "Traffic policing"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Traffic policing limits bandwidth by dropping or re-marking packets that exceed the configured rate threshold immediately, without buffering. Citing Vol2 Ch11.",
      "wrong": [
        "Traffic shaping buffers traffic exceeding the rate limit in queues to smooth out bursts, which violates the zero-buffering requirement.",
        "Tail drop is a queue management mechanism that drops newly arrived packets at the end of a queue when it becomes full, rather than enforcing a CIR.",
        "WRED is a congestion avoidance mechanism that drops random packets early to avoid TCP global synchronization."
      ],
      "tip": "Shaping = buffer and delay. Policing = drop or re-mark.",
      "memory": "Police officers drop the hammer; shapers smooth things out.",
      "real": "Service providers apply ingress policing at the carrier edge to enforce the bandwidth limits purchased by customers.",
      "commands": [
        "police 10000000 conform-action transmit exceed-action drop"
      ]
    },
    "id": 282
  },
  {
    "domain": "Automation and Programmability",
    "topic": "YANG / NETCONF",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which statement correctly describes the difference between a 'leaf' and a 'leaf-list' in a YANG data model schema?",
    "options": [
      "A leaf represents a container node, whereas a leaf-list represents a single value.",
      "A leaf contains exactly one value of a particular type, whereas a leaf-list contains an array of values of a particular type.",
      "A leaf-list can contain nested container structures, whereas a leaf is restricted to terminal values.",
      "A leaf represents a configuration property, whereas a leaf-list represents operational state data only."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "In YANG, a 'leaf' represents a single data node containing a single value of a specific type (e.g., host-name). A 'leaf-list' represents a sequence of leaf nodes, each containing a value of a specific type (e.g., list of DNS servers). Citing Vol2 Ch19.",
      "wrong": [
        "A leaf does not represent a container. Container nodes hold other nested data nodes, whereas leaf elements hold values.",
        "Neither leaf nor leaf-list contains nested containers; both are terminal nodes containing values.",
        "Both leaves and leaf-lists can represent configuration properties or operational data depending on their configuration flags."
      ],
      "tip": "Leaf = single variable. Leaf-list = array of variables.",
      "memory": "A single leaf is one item; a list of leaves is an array of items.",
      "real": "A device hostname is modeled as a YANG leaf, while a list of static NTP server IP addresses is modeled as a leaf-list.",
      "commands": [
        "show running-config"
      ]
    },
    "id": 283
  },
  {
    "domain": "Network Fundamentals",
    "topic": "WAN Technologies",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "Which role does a router play if it sits at the edge of the customer network and connects directly to the service provider's MPLS network edge device?",
    "options": [
      "Provider (P) router",
      "Provider Edge (PE) router",
      "Label Switch Router (LSR)",
      "Customer Edge (CE) router"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Customer Edge (CE) routers belong to the customer network and interface directly with the Provider Edge (PE) routers of the service provider MPLS core. Citing Vol2 Ch14.",
      "wrong": [
        "Provider (P) routers sit entirely within the MPLS provider core and do not connect directly to customer devices.",
        "Provider Edge (PE) routers reside on the boundary of the provider core and connect directly to CE devices.",
        "Label Switch Routers (LSR) perform label swapping inside the service provider core network."
      ],
      "tip": "CE = Customer Edge (belongs to customer). PE = Provider Edge (belongs to provider).",
      "memory": "C is for Customer, P is for Provider.",
      "real": "In an enterprise network connected via MPLS WAN, the router you manage on-site is the CE router.",
      "commands": [
        "show ip route"
      ]
    },
    "id": 284
  },
  {
    "domain": "IP Services",
    "topic": "QoS",
    "type": "multi",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A voice engineer is configuring Class-Based Weighted Fair Queuing (CBWFQ) on a serial interface. They need to ensure voice traffic is placed in a priority queue and given strict low-latency service. Which two actions must the engineer configure to enable Low-Latency Queuing (LLQ)? (Choose two.)",
    "options": [
      "Apply the 'priority' command inside the policy-map class block.",
      "Apply the 'bandwidth' command to reserve class bandwidth.",
      "Configure a maximum bandwidth limit for the priority class.",
      "Enable fair-queue on the interface directly."
    ],
    "correct": [
      0,
      2
    ],
    "expl": {
      "correct": "A, C",
      "why": "LLQ is configured by applying the 'priority' command inside a policy-map class. To prevent the priority queue from starving other queues, the priority command must be configured with a bandwidth allocation (which acts as a policing limit during congestion). Citing Vol2 Ch11.",
      "wrong": [
        "The 'bandwidth' command enables standard CBWFQ, which guarantees minimum bandwidth but does not provide strict low-latency priority service.",
        "Fair-queuing distributes interface bandwidth dynamically but does not support strict priority low-latency services."
      ],
      "tip": "LLQ = CBWFQ + Priority Queue.",
      "memory": "Priority means low latency.",
      "real": "Voice over IP (VoIP) payloads must be assigned to the strict priority queue using LLQ to avoid audio jitter.",
      "commands": [
        "priority 128"
      ]
    },
    "id": 285
  },
  {
    "domain": "Automation and Programmability",
    "topic": "YANG / NETCONF",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which statement correctly describes the encoding and protocol differences between NETCONF and RESTCONF?",
    "options": [
      "NETCONF uses JSON/HTTPS, whereas RESTCONF uses XML/SSH.",
      "NETCONF uses XML/SSH, whereas RESTCONF supports JSON or XML over SSH.",
      "NETCONF uses XML/SSH, whereas RESTCONF supports JSON or XML over HTTPS.",
      "NETCONF supports JSON/SSH, whereas RESTCONF only supports XML/HTTPS."
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "NETCONF uses XML encoding and transport over SSH (port 830). RESTCONF supports both JSON and XML encoding, transported over HTTP/HTTPS (port 443). Citing Vol2 Ch19.",
      "wrong": [
        "NETCONF does not support JSON or use HTTPS; RESTCONF does not use SSH.",
        "RESTCONF operates over HTTP/HTTPS, not SSH.",
        "NETCONF only supports XML encoding, not JSON."
      ],
      "tip": "NETCONF = XML + SSH. RESTCONF = JSON/XML + HTTPS.",
      "memory": "REST = Web APIs (HTTPS, JSON). NETCONF = Secure Configuration (SSH, XML).",
      "real": "Modern SDN controllers use RESTCONF to push JSON configurations to switches because it integrates with web developer tools.",
      "commands": [
        "ip http secure-server"
      ]
    },
    "id": 286
  },
  {
    "domain": "Network Fundamentals",
    "topic": "WAN Technologies",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A corporation is deploying a Metro Ethernet WAN to connect its headquarters and three regional warehouses. The network design requires the warehouses to communicate with the headquarters but prevents them from communicating directly with each other over the WAN. Which MEF Metro Ethernet service type should be implemented?",
    "options": [
      "E-Tree (Ethernet Private Tree)",
      "E-Line (Ethernet Private Line)",
      "E-LAN (Ethernet Private LAN)",
      "Point-to-Point Virtual Private Line"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "E-Tree (Ethernet Private Tree) is a hub-and-spoke architecture where the central hub (root) can communicate with all branches (leaves), but branches cannot communicate directly with one another. Citing Vol2 Ch14.",
      "wrong": [
        "E-Line provides a simple point-to-point connection between exactly two endpoints.",
        "E-LAN provides full multipoint-to-multipoint connectivity where all connected sites can communicate directly with all other sites.",
        "Point-to-Point Virtual Private Line is an E-Line service, not a hub-and-spoke setup."
      ],
      "tip": "E-Tree = Hub-and-Spoke. E-LAN = Full-Mesh. E-Line = Point-to-Point.",
      "memory": "Tree roots connect to leaves, but leaves don't connect to other leaves.",
      "real": "A bank branches network standardly uses E-Tree to direct all transaction traffic to the main office datacenter while isolating branches from each other.",
      "commands": [
        "show interface status"
      ]
    },
    "id": 287
  },
  {
    "domain": "IP Services",
    "topic": "QoS",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "In a modern network design, where is the most typical and optimal location to establish the QoS trust boundary for user endpoints?",
    "options": [
      "At the WAN router interface",
      "At the access switch port connected to the IP Phone",
      "At the core layer switch interfaces",
      "On the user endpoint workstation directly"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "The trust boundary should be set as close to the source of traffic as possible. In designs with IP phones, the access switch port is configured to trust the markings of the IP phone, establishing the trust boundary at the switch. Citing Vol2 Ch11.",
      "wrong": [
        "The WAN router is too far into the network; traffic should be classified before it crosses the access and distribution layers.",
        "The core layer is too deep; queuing and classification advantages would be lost in the access layer.",
        "Endpoints are generally not trusted because users could modify settings to prioritize their own traffic."
      ],
      "tip": "Place trust boundaries at the ingress access switch port.",
      "memory": "Trust the hardware (IP Phone/Switch), not the user's PC.",
      "real": "Configuring access ports with 'mls qos trust device cisco-phone' allows the switch to trust markings from the phone while resetting PC markings.",
      "commands": [
        "mls qos trust device cisco-phone"
      ]
    },
    "id": 288
  },
  {
    "domain": "Automation and Programmability",
    "topic": "YANG / NETCONF",
    "type": "matching",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Match the RESTCONF HTTP verb on the left to its corresponding NETCONF operation on the right.",
    "pairs": [
      [
        "GET",
        "get / get-config"
      ],
      [
        "POST",
        "create"
      ],
      [
        "PUT",
        "replace"
      ],
      [
        "PATCH",
        "merge"
      ]
    ],
    "expl": {
      "correct": "Matching",
      "why": "RESTCONF maps standard HTTP methods to NETCONF operations: GET maps to retrieve data, POST creates new resources, PUT replaces configurations, and PATCH merges changes. Citing Vol2 Ch19.",
      "wrong": [
        "Matching PUT to 'create' is incorrect because PUT replaces/overwrites the resource rather than creating a new instance."
      ],
      "tip": "POST = create, PUT = replace, PATCH = merge.",
      "memory": "PUT replaces, PATCH patches (merges).",
      "real": "A script using RESTCONF uses a PATCH request to edit an interface IP address without deleting the rest of the interface configurations.",
      "commands": [
        "ip http secure-server"
      ]
    },
    "id": 289
  },
  {
    "domain": "Network Fundamentals",
    "topic": "WAN Technologies",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "A network engineer is analyzing a network segment. What is the standardized transmission speed of an E1 synchronous leased line?",
    "options": [
      "1.544 Mbps",
      "44.736 Mbps",
      "34.368 Mbps",
      "2.048 Mbps"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "An E1 leased line (common in Europe) has a standardized synchronous transmission rate of 2.048 Mbps. Citing Vol2 Ch14.",
      "wrong": [
        "1.544 Mbps is the speed of a T1 leased line (common in North America).",
        "44.736 Mbps is the speed of a T3 leased line.",
        "34.368 Mbps is the speed of an E3 leased line."
      ],
      "tip": "T1 = 1.544 Mbps. E1 = 2.048 Mbps.",
      "memory": "E1 is slightly higher than T1 (E1 is ~2M, T1 is ~1.5M).",
      "real": "Legacy voice trunk systems connect to local telcos using physical E1 spans to transmit multiple active phone calls.",
      "commands": [
        "controller e1 0/0/0"
      ]
    },
    "id": 290
  },
  {
    "domain": "IP Services",
    "topic": "QoS",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "Medium",
    "text": "A technician notices that during periods of link congestion, multiple TCP connections experience dropouts and recover simultaneously. This causes cycles of high utilization followed by underutilization (global synchronization). Which QoS mechanism should be configured to prevent this behavior?",
    "options": [
      "Tail drop",
      "Weighted Random Early Detection (WRED)",
      "First-In, First-Out (FIFO) queuing",
      "Traffic shaping"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "WRED prevents TCP global synchronization by dropping packets randomly from different TCP streams before congestion peaks, forcing individual TCP flows to back off at different times. Citing Vol2 Ch11.",
      "wrong": [
        "Tail drop drops all packets arriving when a queue is full, which triggers global synchronization because all TCP flows drop packets and back off at the same time.",
        "FIFO queuing processes packets in arrival order and drops tail packets when full, which contributes to global synchronization.",
        "Traffic shaping buffers traffic to avoid drops but does not resolve synchronization behaviors once queues fill."
      ],
      "tip": "WRED resolves TCP global synchronization by dropping packets early and randomly.",
      "memory": "RED drop = Early Drop.",
      "real": "Deploying WRED on WAN interface policies ensures traffic flows steadily rather than oscillating between saturated and empty states.",
      "commands": [
        "random-detect"
      ]
    },
    "id": 291
  },
  {
    "domain": "Automation and Programmability",
    "topic": "YANG / NETCONF",
    "type": "multi",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "Medium",
    "text": "A network operations team is replacing SNMP polling with model-driven telemetry. Which two statements correctly describe model-driven telemetry dial-out connections? (Choose two.)",
    "options": [
      "Collector initiates session",
      "Device initiates outbound session",
      "Device pushes stream at intervals",
      "NETCONF SSH 830 push logs"
    ],
    "correct": [
      1,
      2
    ],
    "expl": {
      "correct": "B, C",
      "why": "In a dial-out configuration, the managed network device initiates the outbound connection to the telemetry collector. Once established, data is streamed continuously or at set intervals. Citing Vol2 Ch19.",
      "wrong": [
        "In dial-in configurations, the collector initiates the session, not in dial-out.",
        "Dial-out telemetry typically uses gRPC/HTTP2 transports rather than NETCONF SSH port 830."
      ],
      "tip": "Dial-out = Device pushes data. Dial-in = Collector pulls data.",
      "memory": "Dialing out means the device calls the collector.",
      "real": "Engineers configure dial-out telemetry to ensure firewall changes aren't needed to allow inbound control calls to critical devices.",
      "commands": [
        "telemetry ietf subscription 101"
      ]
    },
    "id": 292
  },
  {
    "domain": "Network Fundamentals",
    "topic": "WAN Technologies",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "High",
    "text": "Which three protocols combine to form a Dynamic Multipoint VPN (DMVPN) implementation?",
    "options": [
      "mGRE, NHRP, and IPsec",
      "GRE, OSPF, and IPsec",
      "L2TP, NHRP, and SSL",
      "mGRE, LACP, and IPsec"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "DMVPN uses multipoint GRE (mGRE) to manage tunnel interfaces, Next Hop Resolution Protocol (NHRP) to discover spoke public IP mapping, and IPsec to encrypt tunnel payload traffic. Citing Vol2 Ch15.",
      "wrong": [
        "Standard GRE does not support dynamic multipoint connections; OSPF is a routing protocol, not a DMVPN component.",
        "L2TP and SSL are not part of the standard DMVPN design.",
        "LACP is an EtherChannel control protocol, not a WAN encapsulation tunneling protocol."
      ],
      "tip": "DMVPN = mGRE + NHRP + IPsec.",
      "memory": "My Great Network Is Secure: mGRE, NHRP, IPsec.",
      "real": "DMVPN allows enterprise networks to build dynamic spoke-to-spoke tunnels over the public Internet for secure, direct communication.",
      "commands": [
        "ip nhrp network-id 1"
      ]
    },
    "id": 293
  },
  {
    "domain": "IP Services",
    "topic": "QoS",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Where is the 3-bit Class of Service (CoS) priority field located in an Ethernet frame?",
    "options": [
      "In the IPv4 Type of Service (ToS) byte",
      "In the preamble of the Ethernet frame",
      "In the 802.1Q VLAN tag",
      "In the IPv4 DSCP field"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "CoS is a Layer 2 priority field located inside the 2-byte 802.1Q tag inserted into an Ethernet header. It contains a 3-bit User Priority field (also known as 802.1p). Citing Vol2 Ch11.",
      "wrong": [
        "The ToS byte resides in the Layer 3 IPv4 header, not the Layer 2 Ethernet frame.",
        "The preamble does not contain QoS information.",
        "The DSCP field is a 6-bit field inside the Layer 3 IPv4 ToS byte."
      ],
      "tip": "CoS = Layer 2 (802.1Q). DSCP = Layer 3 (IPv4 ToS).",
      "memory": "CoS = Tag (Layer 2).",
      "real": "Access switches copy Layer 3 DSCP markings to Layer 2 CoS fields when forwarding frames across trunk links to adjacent switches.",
      "commands": [
        "switchport mode trunk"
      ]
    },
    "id": 294
  },
  {
    "domain": "Automation and Programmability",
    "topic": "Configuration Management",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which configuration management tool is agentless, uses YAML-based 'playbooks', and connects to managed nodes primarily via SSH?",
    "options": [
      "Puppet",
      "Ansible",
      "Chef",
      "SaltStack"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Ansible is agentless (requires no software installed on managed hosts), uses YAML files called Playbooks to define configuration states, and uses SSH to push updates. Citing Vol2 Ch19.",
      "wrong": [
        "Puppet is agent-based, uses manifests written in its own Ruby-like DSL, and runs on a pull model over HTTPS.",
        "Chef is agent-based, uses recipes/cookbooks written in Ruby, and operates on a pull model.",
        "SaltStack is typically agent-based (uses Minions) and uses a master/agent architecture."
      ],
      "tip": "Ansible = Agentless, YAML, Push, SSH.",
      "memory": "Ansible has no agents (Agentless) and pushes YAML.",
      "real": "Ansible is widely used by network engineers because it can automate legacy routers without installing additional software on them.",
      "commands": [
        "ansible-playbook -i hosts site.yml"
      ]
    },
    "id": 295
  },
  {
    "domain": "Network Fundamentals",
    "topic": "WAN Technologies",
    "type": "matching",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "High",
    "text": "Match the Cisco SD-WAN component on the left to its corresponding plane of operation on the right.",
    "pairs": [
      [
        "vManage",
        "Management Plane"
      ],
      [
        "vSmart",
        "Control Plane"
      ],
      [
        "vBond",
        "Orchestration Plane"
      ],
      [
        "vEdge / cEdge",
        "Data Plane"
      ]
    ],
    "expl": {
      "correct": "Matching",
      "why": "vManage provides GUI/NMS access (Management), vSmart controls policy/routing distribution (Control), vBond authenticates devices and handles NAT traversal (Orchestration), and vEdge/cEdge routers forward the data (Data). Citing Vol2 Ch15.",
      "wrong": [
        "Matching vSmart to the Data Plane is incorrect because vSmart distributes routing updates and policies, never forwarding data traffic."
      ],
      "tip": "vManage = Manage. vSmart = Control. vBond = Orchestrate. Edges = Data.",
      "memory": "Manage = Management. Smart = Control. Bond = Orchestrate. Edge = Data.",
      "real": "In Cisco SD-WAN, a new edge router contacts the vBond orchestrator to join the overlay fabric before getting controls from vSmart.",
      "commands": [
        "show sdwan control connections"
      ]
    },
    "id": 296
  },
  {
    "domain": "IP Services",
    "topic": "QoS",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A systems administrator is configuring a Cisco device. Which command is used to apply a policy map to an interface for egress traffic control?",
    "options": [
      "service-policy output <policy-name>",
      "policy-map <policy-name> out",
      "ip qos policy <policy-name> egress",
      "traffic-shape group <policy-name>"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "The command 'service-policy output <policy-name>' applies a configured MQC policy map to an interface for traffic leaving the router. Citing Vol2 Ch11.",
      "wrong": [
        "'policy-map' is used in global configuration mode to define policies, not to apply them to interfaces.",
        "'ip qos policy' is invalid syntax.",
        "'traffic-shape group' is legacy syntax and does not apply an MQC policy map."
      ],
      "tip": "Create class-map -> policy-map -> apply with service-policy.",
      "memory": "Service the policy on egress.",
      "real": "An engineer applies 'service-policy output WAN-SHAPING' to a WAN serial link to limit outgoing traffic and prioritize voice packets.",
      "commands": [
        "service-policy output voice-policy"
      ]
    },
    "id": 297
  },
  {
    "domain": "IP Connectivity",
    "topic": "FHRP",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is configuring HSRP on two routers. Router A is configured with priority 110, and Router B is configured with priority 120. Preemption is enabled on both routers. Initially, Router B is elected as the active router. If Router B's uplink interface fails, how will the HSRP routers coordinate failover if interface tracking is not configured?",
    "options": [
      "Router A immediately becomes active because its priority is higher than Router B's adjusted priority.",
      "Router B remains active because it has a higher configured priority and preemption does not apply to link failures.",
      "Router B remains active because it is still reachable via the LAN and its HSRP priority does not automatically decrement without interface tracking.",
      "Router A and Router B both transition to active state, causing a split-brain condition."
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "HSRP monitors LAN hello exchanges to negotiate active status. If Router B's uplink fails but its LAN interface remains up, it continues sending hellos with priority 120. Without interface tracking configured, its priority does not decrement, so Router A cannot preempt it. Citing Vol2 Ch11.",
      "wrong": [
        "Router B's priority does not decrement automatically, so Router A will not become active.",
        "Router B does remain active, but preemption *would* apply if its priority was lowered below Router A's.",
        "Split-brain only occurs if HSRP hello packets are blocked between the routers on the LAN segment."
      ],
      "tip": "Track interfaces to dynamically decrement HSRP priority when links fail.",
      "memory": "No tracking = no failover for uplinks.",
      "real": "Without interface tracking, a LAN host's traffic will still go to Router B, which will then blackhole the packets because its uplink is down.",
      "commands": [
        "standby 1 track GigabitEthernet0/0 decrement 20"
      ]
    },
    "id": 298
  },
  {
    "domain": "Security Fundamentals",
    "topic": "AAA",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "15%",
    "frequency": "High",
    "text": "Which statement correctly describes a protocol feature of TACACS+ compared to RADIUS?",
    "options": [
      "TACACS+ uses UDP port 49, whereas RADIUS uses TCP port 1812.",
      "TACACS+ encrypts only the password, whereas RADIUS encrypts the entire packet body.",
      "TACACS+ combines authentication and authorization, whereas RADIUS separates them.",
      "TACACS+ encrypts the entire packet payload, whereas RADIUS encrypts only the user password field."
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "TACACS+ encrypts the entire body of the packet during transmission, exposing only the header. RADIUS only encrypts the password field within the access-request packet. Citing Vol2 Ch6.",
      "wrong": [
        "TACACS+ uses TCP port 49, whereas RADIUS uses UDP ports 1812 and 1813.",
        "TACACS+ encrypts the entire packet body; RADIUS encrypts only the password.",
        "TACACS+ separates authentication and authorization, whereas RADIUS combines them."
      ],
      "tip": "TACACS+ = TCP (port 49), encrypts all, separates AA. RADIUS = UDP, encrypts password only, combines AA.",
      "memory": "T in TACACS+ is for TCP; R in RADIUS is for UDP (R-U-Ready?).",
      "real": "TACACS+ is preferred for device administration (CLI configuration commands) because it allows authorization of individual commands.",
      "commands": [
        "tacacs server MY_TACACS"
      ]
    },
    "id": 299
  },
  {
    "domain": "Security Fundamentals",
    "topic": "Device Hardening",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "15%",
    "frequency": "Medium",
    "text": "Which type of hash does a Cisco router use to represent a password configured with the 'username <name> secret' command?",
    "options": [
      "Type 7 Vigenere cipher",
      "Type 5 MD5 (or Type 8/9 SHA-256/scrypt) secure hash",
      "Cleartext representation",
      "Type 0 basic translation hash"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "The 'secret' keyword instructs the Cisco IOS to encrypt the password using a secure one-way hash (Type 5 MD5, Type 8 SHA-256, or Type 9 scrypt), which cannot be easily decrypted. Citing Vol2 Ch6.",
      "wrong": [
        "Type 7 ciphers (configured with 'password' command + password encryption) use a weak, reversible algorithm.",
        "The 'secret' command never stores passwords in cleartext.",
        "Type 0 is cleartext storage, not a secure hash."
      ],
      "tip": "Always use 'secret' instead of 'password' to secure device credentials.",
      "memory": "Secrets are secure hashes (Type 5/8/9). Passwords are weak ciphers (Type 7).",
      "real": "Using the 'username admin secret' command prevents unauthorized users from learning credentials if they copy the config file.",
      "commands": [
        "username admin secret Cisco12345"
      ]
    },
    "id": 300
  },
  {
    "domain": "IP Services",
    "topic": "SNMPv3",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "Medium",
    "text": "Which SNMPv3 security level provides authentication using MD5 or SHA, but does not provide packet payload encryption?",
    "options": [
      "noAuthNoPriv",
      "authPriv",
      "authNoPriv",
      "privNoAuth"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "The 'authNoPriv' security level in SNMPv3 requires authentication via username/password (hashed with MD5 or SHA) but does not encrypt the transmitted network management packets. Citing Vol2 Ch10.",
      "wrong": [
        "noAuthNoPriv provides no user authentication and no packet encryption.",
        "authPriv provides both secure MD5/SHA authentication and DES/3DES/AES packet payload encryption.",
        "privNoAuth is an invalid SNMPv3 security level combination."
      ],
      "tip": "SNMPv3 levels: noAuthNoPriv (none) -> authNoPriv (auth only) -> authPriv (auth + encryption).",
      "memory": "auth = authentication. priv = privacy (encryption). NoPriv = no encryption.",
      "real": "SNMPv3 authNoPriv is configured when authentication is needed but devices lack the processing capacity for continuous encryption.",
      "commands": [
        "snmp-server group v3group v3 auth"
      ]
    },
    "id": 301
  },
  {
    "domain": "Network Access",
    "topic": "Wireless Access",
    "type": "dragdrop",
    "difficulty": "Hard",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "Order the 802.11 wireless standards from the oldest release/lowest theoretical speed to the newest release/highest theoretical speed.",
    "order": [
      "802.11b (2.4 GHz, 11 Mbps)",
      "802.11g (2.4 GHz, 54 Mbps)",
      "802.11n (2.4/5 GHz, 600 Mbps)",
      "802.11ax (2.4/5/6 GHz, 9.6 Gbps)"
    ],
    "expl": {
      "correct": "Correct Order",
      "why": "802.11b was released in 1999 (11 Mbps), followed by 802.11g in 2003 (54 Mbps), 802.11n in 2009 (600 Mbps), and 802.11ax in 2021 (9.6 Gbps). Citing Vol1 Ch27.",
      "wrong": [
        "Swapping 802.11g and 802.11b breaks chronology because 802.11b is a legacy, slower standard than 802.11g."
      ],
      "tip": "Wireless timeline order: b -> g -> n -> ax.",
      "memory": "Alphabetical speeds: b is slow, g is medium, n is fast, ax is super fast.",
      "real": "Identifying client standard support helps planners decide when to deprecate legacy 2.4 GHz bands on local access points.",
      "commands": [
        "show wlan summary"
      ]
    },
    "id": 302
  },
  {
    "domain": "Network Access",
    "topic": "Wireless Access",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "20%",
    "frequency": "Medium",
    "text": "Which key exchange mechanism is introduced in WPA3-Personal to replace the vulnerable WPA2 Pre-Shared Key (PSK) handshake?",
    "options": [
      "Simultaneous Authentication of Equals (SAE)",
      "Temporal Key Integrity Protocol (TKIP)",
      "Counter Mode with Cipher Block Chaining Message Authentication Code Protocol (CCMP)",
      "Extensible Authentication Protocol (EAP)"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "WPA3 replaces the 4-way PSK handshake with Simultaneous Authentication of Equals (SAE), which protects against offline dictionary attacks even if users choose weak passwords. Citing Vol1 Ch27.",
      "wrong": [
        "TKIP was used with original WPA and is now deprecated due to security vulnerabilities.",
        "CCMP is the encryption protocol used in WPA2, not the WPA3 key exchange mechanism.",
        "EAP is used in enterprise mode authentication (802.1X), not personal pre-shared key exchanges."
      ],
      "tip": "WPA3 Personal = SAE key exchange.",
      "memory": "SAE saves personal keys from attacks.",
      "real": "Enabling WPA3-Personal (SAE) prevents attackers from capturing wireless handshakes over the air and crack passwords offline.",
      "commands": [
        "security wpa wpa3"
      ]
    },
    "id": 303
  },
  {
    "domain": "Automation and Programmability",
    "topic": "RESTCONF",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "High",
    "text": "An administrator is writing a Python script to retrieve interface configuration parameters from an IOS-XE router using RESTCONF. Which HTTP header must the script include to request JSON-formatted data encoded specifically according to the YANG schema?",
    "options": [
      "Accept: application/json",
      "Accept: application/yang-data+json",
      "Content-Type: application/yang+json",
      "Content-Type: application/xml"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "RESTCONF specifies the use of unique media types for YANG-modeled data payloads. To request JSON data structured according to the YANG model, the client must use the Accept header 'application/yang-data+json'. Citing Vol2 Ch19.",
      "wrong": [
        "application/json requests standard JSON data representation but does not explicitly request the YANG data schema-specific structure mandated by RESTCONF.",
        "application/yang+json is an invalid MIME type string.",
        "Content-Type specifies the encoding of the outbound request body, not the requested format for the incoming response, and XML is not JSON."
      ],
      "tip": "RESTCONF Accept media type = application/yang-data+json.",
      "memory": "YANG + JSON = yang-data+json.",
      "real": "RESTCONF scripts utilize yang-data+json headers to ensure API controllers parse interfaces, trunks, and ACL fields correctly.",
      "commands": [
        "ip http secure-server"
      ]
    },
    "id": 304
  },
  {
    "domain": "IP Connectivity",
    "topic": "FHRP",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer is analyzing a network segment. What is the specific Virtual MAC address used by HSRP version 1 for IPv4 standby group 10?",
    "options": [
      "0000.5E00.010A",
      "0000.0C07.AC10",
      "0000.0C07.AC0A",
      "0000.0C9F.F00A"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "HSRPv1 uses the virtual MAC prefix 0000.0C07.ACxx, where xx is the 2-digit hexadecimal representation of the HSRP group number. Group 10 in hexadecimal is 0A. Citing Vol2 Ch11.",
      "wrong": [
        "0000.5E00.010A is the virtual MAC for VRRP group 10 (decimal 10 = hex 0A).",
        "0000.0C07.AC10 uses the decimal value 10 instead of converting it to hexadecimal (0A).",
        "0000.0C9F.F00A is the virtual MAC for HSRP version 2 group 10."
      ],
      "tip": "HSRPv1 MAC ends with ACxx (hex group). HSRPv2 ends with F0xx (hex group).",
      "memory": "AC = Active Cisco (HSRPv1).",
      "real": "Access switch MAC tables record the HSRP virtual MAC pointing to the active physical gateway trunk port.",
      "commands": [
        "standby 10 ip 192.168.1.1"
      ]
    },
    "id": 305
  },
  {
    "domain": "Automation and Programmability",
    "topic": "Configuration Management",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network engineer wants to automate VLAN configuration across multiple access switches. They define the inventory of switches and write a text file containing tasks, hosts, and variables. Which tool and filename extension does this automation structure utilize?",
    "options": [
      "Ansible playbook, with a .yml or .yaml extension",
      "Puppet manifest, with a .pp extension",
      "Chef recipe, with a .rb extension",
      "Terraform configuration, with a .tf extension"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "Ansible uses text configuration files written in YAML syntax called 'playbooks' which standardly end with a .yml or .yaml file extension. Citing Vol2 Ch19.",
      "wrong": [
        "Puppet manifests define config states in .pp files using its own declarative language, not YAML playbooks.",
        "Chef uses Ruby-based (.rb) recipe configurations.",
        "Terraform uses HashiCorp Configuration Language (.tf files) to declare infrastructure variables."
      ],
      "tip": "Ansible configurations = Playbooks (.yml).",
      "memory": "Ansible hosts play YAML records.",
      "real": "Ansible playbooks are stored in Git repositories to enable version control over network VLAN database configurations.",
      "commands": [
        "ansible-playbook -i inventory config-vlans.yml"
      ]
    },
    "id": 306
  },
  {
    "domain": "Automation and Programmability",
    "topic": "RESTCONF",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which URI path represents the root resource directory for RESTCONF operations on a Cisco IOS-XE router configured for programmatic API access?",
    "options": [
      "/api/v1/restconf",
      "/restconf/config",
      "/api/restconf/data",
      "/restconf/data"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "The RESTCONF RFC specifies that all configuration and operational data resources are structured under the resource path root '/restconf/data'. Citing Vol2 Ch19.",
      "wrong": [
        "/api/v1/restconf is a non-standard API route and is not used by the RESTCONF RFC.",
        "/restconf/config is not the correct resource root endpoint name.",
        "/api/restconf/data adds an invalid '/api' prefix to the root URL path."
      ],
      "tip": "RESTCONF resource root = /restconf/data.",
      "memory": "RESTCONF is data-focused, so resources sit under /restconf/data.",
      "real": "To retrieve device configuration via RESTCONF, scripts send HTTP GET requests targeting https://<ip>/restconf/data.",
      "commands": [
        "restconf"
      ]
    },
    "id": 307
  },
  {
    "domain": "IP Connectivity",
    "topic": "FHRP",
    "type": "scenario",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A company's primary gateway router (Router A, configured with HSRP priority 120 and preemption) recovers from a power outage. The standby router (Router B) is currently active with priority 100. How does the network traffic pathway react once Router A finishes booting up and begins sending hello packets?",
    "options": [
      "Router B remains active because preemption is not triggered after a complete reboot cycle.",
      "Router A immediately assumes the active role because preemption is enabled and its priority is higher than Router B's.",
      "Router A waits for Router B's hold time to expire before taking over as the active gateway.",
      "Both routers run in active-active forwarding mode, load-balancing traffic until the standby timer expires."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "With preemption configured, a router that recovers and has a higher HSRP priority than the current active router immediately sends a coup message and assumes the active gateway role. Citing Vol2 Ch11.",
      "wrong": [
        "Router B does not remain active because Router A's preemption command allows it to actively take over.",
        "Router A does not wait for hold timers to expire; preemption triggers takeover immediately upon hello check.",
        "HSRP does not support active-active gateway operations; only one router forwards traffic for a group."
      ],
      "tip": "HSRP Preemption allows a higher priority router to actively take over.",
      "memory": "Preempt = takeover immediately.",
      "real": "Enabling preemption ensures your high-performance chassis router reassumes the primary gateway role once it recovers.",
      "commands": [
        "standby 1 preempt"
      ]
    },
    "id": 308
  },
  {
    "domain": "Automation and Programmability",
    "topic": "Configuration Management",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A network engineer is comparing configuration management tools for an enterprise campus deployment. Which protocol and default TCP port does a Puppet agent use to pull compiled manifests from the Puppet Master?",
    "options": [
      "SSH, port 22",
      "HTTPS, port 443",
      "SSH, port 830",
      "HTTPS, port 8140"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Puppet agents use HTTPS to communicate with the Puppet Master, listening on TCP port 8140 by default. Citing Vol2 Ch19.",
      "wrong": [
        "SSH on port 22 is used by Ansible for agentless config deployment.",
        "HTTPS on port 443 is not the default port used by the Puppet daemon architecture.",
        "SSH on port 830 is the transport connection port used by NETCONF."
      ],
      "tip": "Puppet Agent pulls over HTTPS port 8140.",
      "memory": "Puppet Master controls the strings on 8140.",
      "real": "Firewall administrators must permit outgoing TCP port 8140 traffic to allow branch nodes to retrieve updates from the central Puppet Master server.",
      "commands": [
        "show ip access-lists"
      ]
    },
    "id": 309
  },
  {
    "domain": "Automation and Programmability",
    "topic": "RESTCONF",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A developer needs to modify a specific leaf value in a YANG data model on a router. They want to avoid replacing the entire parent container database structure. Which HTTP method should they specify in the RESTCONF request header?",
    "options": [
      "POST",
      "PUT",
      "PATCH",
      "GET"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "RESTCONF maps the HTTP PATCH method to the NETCONF 'merge' operation, allowing developers to change or add specific fields within a container without overwriting other unmentioned variables. Citing Vol2 Ch19.",
      "wrong": [
        "POST maps to the NETCONF 'create' operation and fails if the resource already exists.",
        "PUT replaces the entire configuration at the target URI, deleting any omitted container child elements.",
        "GET retrieves data configurations but cannot perform modifications."
      ],
      "tip": "PUT = Replace. PATCH = Merge (Modify).",
      "memory": "PATCH patches a hole; PUT replaces the wall.",
      "real": "Using PATCH allows scripts to safely modify description fields on interfaces without deleting active IP addresses.",
      "commands": [
        "restconf"
      ]
    },
    "id": 310
  },
  {
    "domain": "IP Connectivity",
    "topic": "FHRP",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "Which virtual MAC address range is used by HSRP version 2 for IPv4 configurations?",
    "options": [
      "0000.0C9F.F000 to 0000.0C9F.FFFF",
      "0000.0C07.AC00 to 0000.0C07.ACFF",
      "0000.5E00.0100 to 0000.5E00.01FF",
      "0007.B400.0000 to 0007.B400.FFFF"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "HSRPv2 uses the virtual MAC range 0000.0C9F.F000 through 0000.0C9F.FFFF to support group numbers up to 4095. Citing Vol2 Ch11.",
      "wrong": [
        "0000.0C07.AC00 to 0000.0C07.ACFF is the MAC range reserved for HSRP version 1.",
        "0000.5E00.0100 to 0000.5E00.01FF is the MAC range reserved for VRRP for IPv4.",
        "0007.B400.0000 to 0007.B400.FFFF is the MAC range prefix utilized by GLBP."
      ],
      "tip": "HSRPv1 MAC prefix = 0000.0C07.ACxx. HSRPv2 MAC prefix = 0000.0C9F.Fxxx.",
      "memory": "V2 has more groups, so it needs a larger range (F000 to FFFF).",
      "real": "Inspecting access switch MAC address tables helps identify whether hosts are routing through an HSRPv1 or HSRPv2 gateway.",
      "commands": [
        "show standby"
      ]
    },
    "id": 311
  },
  {
    "domain": "Automation and Programmability",
    "topic": "Configuration Management",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which configuration management tool uses Ruby-based 'cookbooks' and 'recipes' to define host states on client agents?",
    "options": [
      "Ansible",
      "Chef",
      "Puppet",
      "Terraform"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Chef utilizes Ruby-based configuration structures organized into 'recipes' and 'cookbooks' to manage systems. Citing Vol2 Ch19.",
      "wrong": [
        "Ansible uses YAML-based playbooks, not Ruby cookbooks.",
        "Puppet uses its own Ruby DSL to build configuration manifests (.pp files).",
        "Terraform uses HashiCorp Configuration Language (HCL) to construct declarative models."
      ],
      "tip": "Chef = Cookbooks, Recipes, Ruby, Pull model.",
      "memory": "Chefs cook recipes using cookbooks.",
      "real": "Chef is commonly implemented in application delivery environments to synchronize configuration parameters across server pools.",
      "commands": [
        "chef-client"
      ]
    },
    "id": 312
  },
  {
    "domain": "IP Connectivity",
    "topic": "FHRP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "Which statement correctly describes a difference between the open-standard Virtual Router Redundancy Protocol (VRRP) and HSRP?",
    "options": [
      "VRRP load-balances traffic across multiple active forwarders by default, whereas HSRP does not.",
      "VRRP uses the virtual MAC address prefix 0000.0C07.ACxx, whereas HSRP uses 0000.5E00.01xx.",
      "VRRP is a Cisco-proprietary protocol, whereas HSRP is an IETF open standard.",
      "VRRP uses the terms Master and Backup to define router roles, whereas HSRP uses Active and Standby."
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "VRRP designates the forwarding gateway as the Master router and backup gateways as Backup routers. HSRP designates them as Active and Standby. Citing Vol2 Ch11.",
      "wrong": [
        "VRRP does not load-balance traffic by default; only GLBP load-balances natively across up to 4 virtual forwarders.",
        "VRRP uses 0000.5E00.01xx, while HSRP uses 0000.0C07.ACxx.",
        "VRRP is the IETF open standard, whereas HSRP is Cisco-proprietary."
      ],
      "tip": "VRRP = Master/Backup (Open). HSRP = Active/Standby (Cisco).",
      "memory": "Master Backup = Open VRRP. Active Standby = Cisco HSRP.",
      "real": "Deploying VRRP allows you to configure redundancy in multi-vendor environments containing both Cisco and non-Cisco routers.",
      "commands": [
        "vrrp 1 ip 192.168.1.1"
      ]
    },
    "id": 313
  },
  {
    "domain": "Automation and Programmability",
    "topic": "RESTCONF",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A script attempts to create a new loopback interface on a router using a RESTCONF POST request. The router rejects the request because the loopback interface resource already exists at that path. Which HTTP status code is returned by the router?",
    "options": [
      "200 OK",
      "409 Conflict",
      "404 Not Found",
      "201 Created"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "RESTCONF returns HTTP status code 409 Conflict if a POST request attempts to create a resource that already exists on the device. Citing Vol2 Ch19.",
      "wrong": [
        "200 OK indicates success but is not returned for rejected duplicate resource creation attempts.",
        "404 Not Found indicates the resource URI path does not exist, which is not the case for a duplicate resource error.",
        "201 Created is returned only when the resource is successfully created."
      ],
      "tip": "POST to existing resource = 409 Conflict.",
      "memory": "Duplicate resource = API database conflict (409).",
      "real": "Scripts check for HTTP 409 status returns to handle interface creation conflicts without crashing the script execution stream.",
      "commands": [
        "restconf"
      ]
    },
    "id": 314
  },
  {
    "domain": "Automation and Programmability",
    "topic": "Configuration Management",
    "type": "matching",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Match the configuration management tool on the left to its corresponding execution architecture properties on the right.",
    "pairs": [
      [
        "Ansible",
        "Agentless, Push model, YAML playbooks"
      ],
      [
        "Puppet",
        "Agent-based, Pull model, Ruby DSL manifests"
      ],
      [
        "Chef",
        "Agent-based, Pull model, Ruby cookbooks"
      ],
      [
        "Terraform",
        "Agentless, Push model, Declarative HCL state files"
      ]
    ],
    "expl": {
      "correct": "Matching",
      "why": "Ansible pushes YAML playbooks over SSH (agentless). Puppet pulls Ruby manifests over HTTPS (agent-based). Chef pulls Ruby cookbooks (agent-based). Terraform pushes HCL configurations to cloud APIs (agentless). Citing Vol2 Ch19.",
      "wrong": [
        "Matching Ansible to 'agent-based' is wrong because Ansible connects to target routers over standard SSH without installing agents."
      ],
      "tip": "Ansible/Terraform = Agentless, Push. Puppet/Chef = Agent-based, Pull.",
      "memory": "Ansible and Terraform push configurations without agents.",
      "real": "Ansible is commonly chosen for networks with older switches because it requires no on-device agent installation.",
      "commands": [
        "ansible --version"
      ]
    },
    "id": 315
  },
  {
    "domain": "IP Connectivity",
    "topic": "FHRP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "High",
    "text": "A network engineer wants to implement first-hop redundancy while load-balancing host traffic dynamically across three active gateway routers. Which protocol should the engineer configure?",
    "options": [
      "Gateway Load Balancing Protocol (GLBP)",
      "Hot Standby Router Protocol (HSRP)",
      "Virtual Router Redundancy Protocol (VRRP)",
      "Open Shortest Path First (OSPF)"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "GLBP is designed to load-balance outbound traffic across up to four active gateway routers within a single group, whereas HSRP and VRRP only use one active/master router for forwarding. Citing Vol2 Ch11.",
      "wrong": [
        "HSRP only forwards traffic through a single active router; other routers remain in standby mode.",
        "VRRP only forwards traffic through a single master router; backups remain idle.",
        "OSPF is a dynamic routing protocol used between routers, not an FHRP gateway load balancer for LAN hosts."
      ],
      "tip": "GLBP is the only FHRP that load-balances traffic across multiple gateways natively.",
      "memory": "GLBP = Gateway Load Balancing (load-balances natively).",
      "real": "Implementing GLBP allows a network to utilize the bandwidth of multiple core routers simultaneously without complex client grouping.",
      "commands": [
        "glbp 1 ip 192.168.1.1"
      ]
    },
    "id": 316
  },
  {
    "domain": "Automation and Programmability",
    "topic": "RESTCONF",
    "type": "multi",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which two data encoding formats are supported in RESTCONF requests and responses? (Choose two.)",
    "options": [
      "XML (Extensible Markup Language)",
      "YAML (YAML Ain't Markup Language)",
      "JSON (JavaScript Object Notation)",
      "Plain text configuration scripts"
    ],
    "correct": [
      0,
      2
    ],
    "expl": {
      "correct": "A, C",
      "why": "RESTCONF RFC states that APIs must support both XML and JSON data encodings for request payloads and returned responses. Citing Vol2 Ch19.",
      "wrong": [
        "YAML is not supported in the RESTCONF protocol standard.",
        "Plain text script commands are not parsed by RESTCONF YANG decoders."
      ],
      "tip": "RESTCONF supports JSON and XML formats. NETCONF only supports XML.",
      "memory": "REST = XML + JSON.",
      "real": "Python scripts query RESTCONF endpoints using JSON headers to obtain configuration structures that are easy to parse.",
      "commands": [
        "restconf"
      ]
    },
    "id": 317
  },
  {
    "domain": "Automation and Programmability",
    "topic": "Configuration Management",
    "type": "scenario",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "An administrator wants to deploy virtual network adapters in a public cloud environment using Terraform. They write the configuration file and want to dry-run the deployment to preview which resources will be created. Which Terraform command should the administrator run?",
    "options": [
      "terraform init",
      "terraform apply",
      "terraform plan",
      "terraform destroy"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "The 'terraform plan' command performs a dry-run of the configuration files, comparing them to the state file and outputting a list of resource creations, modifications, and deletions. Citing Vol2 Ch19.",
      "wrong": [
        "terraform init initializes the working directory by downloading provider plugins.",
        "terraform apply executes the configuration and builds the resources, altering infrastructure.",
        "terraform destroy deletes all active infrastructure declared in the Terraform workspace state."
      ],
      "tip": "Terraform plan = Preview changes. Terraform apply = Commit changes.",
      "memory": "Plan before you apply.",
      "real": "Running 'terraform plan' prevents configuration errors by allowing engineers to review changes before committing them to production.",
      "commands": [
        "terraform plan"
      ]
    },
    "id": 318
  },
  {
    "domain": "IP Connectivity",
    "topic": "FHRP",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "What are the default hello and hold timers configured for HSRP group communication?",
    "options": [
      "Hello: 1 second, Hold: 3 seconds",
      "Hello: 3 seconds, Hold: 10 seconds",
      "Hello: 10 seconds, Hold: 30 seconds",
      "Hello: 5 seconds, Hold: 15 seconds"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "By default, HSRP active routers broadcast hello packets every 3 seconds, and the standby router considers the active router down if hellos cease for 10 seconds (hold time). Citing Vol2 Ch11.",
      "wrong": [
        "1 and 3 seconds are default timers for VRRP.",
        "10 and 30 seconds are non-standard timers.",
        "5 and 15 seconds are timers used by GLBP by default."
      ],
      "tip": "HSRP default timers: Hello = 3s, Hold = 10s.",
      "memory": "HSRP = 3 and 10.",
      "real": "Optimizing HSRP failover speeds requires configuring subsecond hello and hold timers on core switch links.",
      "commands": [
        "standby 1 timers 3 10"
      ]
    },
    "id": 319
  },
  {
    "domain": "Automation and Programmability",
    "topic": "RESTCONF",
    "type": "dragdrop",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Arrange the RESTCONF HTTP methods in order of their operation type: Create a resource, Retrieve a resource, Replace a resource, and Delete a resource.",
    "order": [
      "POST (Create)",
      "GET (Retrieve)",
      "PUT (Replace)",
      "DELETE (Remove)"
    ],
    "expl": {
      "correct": "Correct Order",
      "why": "RESTCONF maps POST to creating new configuration resources, GET to retrieving them, PUT to replacing them entirely, and DELETE to removing them. Citing Vol2 Ch19.",
      "wrong": [
        "Placing PUT before POST breaks the sequence because PUT replaces an existing configuration rather than creating a new one."
      ],
      "tip": "HTTP verbs map directly to database CRUD operations.",
      "memory": "POST gets it there (create), GET views it (retrieve), PUT overwrites it (replace).",
      "real": "Understanding these mappings is essential when writing scripts that modify device parameters without breaking existing configs.",
      "commands": [
        "restconf"
      ]
    },
    "id": 320
  },
  {
    "domain": "Automation and Programmability",
    "topic": "Configuration Management",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Why is Ansible considered an 'agentless' configuration management tool?",
    "options": [
      "It requires a dedicated control workstation node.",
      "It operates exclusively using a pull model database.",
      "It does not support execution commands on managed nodes.",
      "It does not require a client software daemon to run on the managed routers and switches."
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Ansible is agentless because it connects to managed devices using SSH or APIs, executing tasks directly without requiring client software (agents) to be installed on target endpoints. Citing Vol2 Ch19.",
      "wrong": [
        "All configuration tools require a control station; this does not make Ansible agentless.",
        "Ansible operates on a push model, not a pull model.",
        "Ansible supports full command execution on remote hosts."
      ],
      "tip": "Agentless = No client software daemon required on target nodes.",
      "memory": "No agent = Agentless.",
      "real": "Ansible is favored for networking equipment because manufacturers rarely allow third-party agent software to run on device OS kernels.",
      "commands": [
        "ansible all -m ping"
      ]
    },
    "id": 321
  },
  {
    "domain": "IP Connectivity",
    "topic": "FHRP",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "A network engineer is analyzing a network segment. What is the specific Virtual MAC address prefix used by the Virtual Router Redundancy Protocol (VRRP) for IPv4?",
    "options": [
      "0000.5E00.01xx",
      "0000.0C07.ACxx",
      "0000.0C9F.F0xx",
      "0007.B400.01xx"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "VRRP for IPv4 configurations utilizes the virtual MAC prefix 0000.5E00.01xx, where xx is the hexadecimal representation of the VRRP group ID. Citing Vol2 Ch11.",
      "wrong": [
        "0000.0C07.ACxx is the virtual MAC prefix used by HSRPv1.",
        "0000.0C9F.F0xx is the virtual MAC prefix used by HSRPv2.",
        "0007.B400.01xx is a MAC prefix utilized by GLBP."
      ],
      "tip": "VRRP MAC prefix = 0000.5E00.01xx.",
      "memory": "5E = VRRP.",
      "real": "Engineers identify VRRP master devices in a multi-vendor core by examining the ARP table for MACs starting with 0000.5e.",
      "commands": [
        "show vrrp"
      ]
    },
    "id": 322
  },
  {
    "domain": "Automation and Programmability",
    "topic": "RESTCONF",
    "type": "single",
    "difficulty": "Easy",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which TCP port does RESTCONF use on a Cisco IOS-XE device configured for secure remote programmatic access?",
    "options": [
      "Port 830",
      "Port 22",
      "Port 443",
      "Port 80"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "RESTCONF operates over HTTP/HTTPS, utilizing the standard secure web port TCP 443. Citing Vol2 Ch19.",
      "wrong": [
        "Port 830 is the transport connection port utilized by NETCONF over SSH.",
        "Port 22 is used for standard CLI management access (SSH).",
        "Port 80 is the default port for unencrypted HTTP traffic, whereas RESTCONF uses secure HTTPS."
      ],
      "tip": "RESTCONF = HTTPS port 443.",
      "memory": "RESTCONF is a web API, so it runs on standard web port 443.",
      "real": "To query configurations, automation scripts target the HTTPS port 443 of the device API gateway.",
      "commands": [
        "ip http secure-server"
      ]
    },
    "id": 323
  },
  {
    "domain": "IP Connectivity",
    "topic": "FHRP",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "Medium",
    "text": "A network engineer wants to test gateway redundancy by pinging the HSRP Virtual IP address from a host workstation. If Router A is the active router and Router B is the standby router, how is the ICMP echo request frame handled on the network?",
    "options": [
      "The switch broadcasts the ICMP frame because the virtual MAC address is not stored in the MAC table.",
      "Router A processes the ICMP frame because it owns the active virtual MAC address mapping, while Router B discards its copy.",
      "Both Router A and Router B process the ICMP frame and return separate echo replies, causing host packet duplication.",
      "Router B intercepts and forwards the ICMP frame to Router A via the standby tunnel interface."
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "The active router (Router A) responds to all traffic sent to the virtual MAC and Virtual IP address. Although both routers receive the packet at Layer 2 if connected to a hub, Router B discards the frame because it is in standby mode. Citing Vol2 Ch11.",
      "wrong": [
        "The switch forwards the frame directly to the active router's interface port because the virtual MAC is learned dynamically in the MAC table.",
        "The standby router does not respond to virtual IP requests, preventing packet duplication.",
        "The standby router does not forward user traffic to the active router."
      ],
      "tip": "Only the HSRP active router responds to the virtual IP and MAC.",
      "memory": "Active router does all the work.",
      "real": "Pinging the virtual IP verifies that the currently active router is processing client gateway requests.",
      "commands": [
        "show standby brief"
      ]
    },
    "id": 324
  },
  {
    "domain": "Automation and Programmability",
    "topic": "Configuration Management",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which file does Ansible use to define the list of IP addresses, hostnames, and credentials of the network devices it will manage?",
    "options": [
      "site.yml",
      "ansible.cfg",
      "roles.yaml",
      "hosts inventory file"
    ],
    "correct": [
      3
    ],
    "expl": {
      "correct": "D",
      "why": "Ansible uses an inventory file (typically named hosts) to list and organize target managed hosts, IP addresses, and group variables. Citing Vol2 Ch19.",
      "wrong": [
        "site.yml is the main playbook file containing tasks and roles, not the device list.",
        "ansible.cfg holds execution parameters like defaults, timeout limits, and path declarations.",
        "roles.yaml is not a standard inventory configuration file."
      ],
      "tip": "Ansible inventory file = Hosts list.",
      "memory": "Inventory = list of hosts.",
      "real": "Engineers organize hosts into groups (like [routers] or [switches]) within the inventory file to target commands to specific roles.",
      "commands": [
        "ansible -i hosts all -m ping"
      ]
    },
    "id": 325
  },
  {
    "domain": "IP Connectivity",
    "topic": "FHRP",
    "type": "scenario",
    "difficulty": "Hard",
    "examWeight": "25%",
    "frequency": "High",
    "text": "An administrator is configuring GLBP on a core subnet. They notice that the Active Virtual Gateway (AVG) assigns virtual MAC addresses dynamically to client requests. The administrator wants to configure the load balancing algorithm so that host traffic is distributed evenly in a round-robin rotation. Which GLBP load-balancing algorithm is the default?",
    "options": [
      "Weighted load-balancing",
      "Host-dependent load-balancing",
      "Round-robin load-balancing",
      "Least-connection load-balancing"
    ],
    "correct": [
      2
    ],
    "expl": {
      "correct": "C",
      "why": "GLBP uses round-robin load-balancing by default. When hosts request the MAC address of the virtual IP gateway via ARP, the AVG rotates through the MAC addresses of all AVFs in order. Citing Vol2 Ch11.",
      "wrong": [
        "Weighted load-balancing determines the traffic share assigned to each AVF based on its configured weight value, which is not the default.",
        "Host-dependent load-balancing ensures a host always receives the same AVF MAC address when it requests it, which is not the default.",
        "Least-connection is a load-balancing algorithm used in load balancers (F5, etc.) but is not supported in GLBP."
      ],
      "tip": "GLBP default load-balancing = Round-robin.",
      "memory": "Round-robin rotates through gateways in order.",
      "real": "GLBP round-robin balancing ensures that adjacent user machines share bandwidth across different physical switches.",
      "commands": [
        "glbp 1 load-balancing round-robin"
      ]
    },
    "id": 326
  },
  {
    "domain": "Automation and Programmability",
    "topic": "RESTCONF",
    "type": "single",
    "difficulty": "Medium",
    "examWeight": "10%",
    "frequency": "High",
    "text": "A Python script sends an HTTP POST request to a router's RESTCONF API to create a new class-map. If the resource is successfully created, which HTTP status code does the router return?",
    "options": [
      "201 Created",
      "200 OK",
      "204 No Content",
      "301 Moved Permanently"
    ],
    "correct": [
      0
    ],
    "expl": {
      "correct": "A",
      "why": "HTTP status code 201 Created indicates that the request was successful and a new resource was created at the target path. Citing Vol2 Ch19.",
      "wrong": [
        "200 OK indicates a successful request but is typically returned for GET updates or modifications, not resource creation.",
        "204 No Content indicates success with no returned payload, commonly returned for DELETE requests.",
        "301 Moved Permanently is a redirect response, not a success creation code."
      ],
      "tip": "Successful resource creation = 201 Created.",
      "memory": "Create = 201 Created.",
      "real": "Script assertions verify a 201 status code response to confirm that interface configurations have successfully committed.",
      "commands": [
        "restconf"
      ]
    },
    "id": 327
  },
  {
    "domain": "Automation and Programmability",
    "topic": "Configuration Management",
    "type": "single",
    "difficulty": "Hard",
    "examWeight": "10%",
    "frequency": "High",
    "text": "Which syntax represents a valid Puppet resource declaration inside a manifest file targeting a service configuration?",
    "options": [
      "service: 'ntp' ensure => running",
      "service { 'ntp': ensure => running }",
      "service { ntp: ensure = running }",
      "service: ntp { ensure: running }"
    ],
    "correct": [
      1
    ],
    "expl": {
      "correct": "B",
      "why": "Puppet manifests declare resources using lowercase types, followed by curly braces, the resource title, a colon, and parameter declarations using '=>'. Citing Vol2 Ch19.",
      "wrong": [
        "This syntax lacks curly braces around resource parameters.",
        "This syntax fails because ntp is not quoted and uses '=' instead of '=>'.",
        "This syntax uses invalid colon-based structures instead of standard Puppet syntax."
      ],
      "tip": "Puppet Resource: type { 'title': parameter => value }.",
      "memory": "Puppet manifests declare resources in curly braces with hash rockets (=>).",
      "real": "Engineers deploy Puppet manifests to synchronize NTP and syslog client daemon states across server fields.",
      "commands": [
        "puppet apply manifest.pp"
      ]
    },
    "id": 328
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
