export default [
  {
    id: "v1c01",
    volume: 1,
    chapter: 1,
    title: "Introduction to TCP/IP Networking",
    domain: "Network Fundamentals",
    pages: "12-31",
    examTopics: [
      "1.3.a Compare physical interface and cabling types: Single-mode fiber, multimode fiber, copper",
      "1.3.b Compare physical interface and cabling types: Connections (Ethernet shared media and point-to-point)"
    ],
    summary: "This chapter introduces the architecture of computer networks through the lens of the five-layer TCP/IP networking model and compares it to the seven-layer OSI reference model. It explains how protocols at each layer cooperate through same-layer interaction across hosts and adjacent-layer services on a single device. Finally, it details the five-step data encapsulation process and compares TCP/IP message names (segment, packet, frame) with OSI protocol data units (L4PDU, L3PDU, L2PDU).",
    keyPoints: [
      "A networking model (architecture or blueprint) is a collection of standards and protocols categorized into functional layers so hardware and software from different vendors can interoperate.",
      "The TCP/IP model originated from a U.S. Department of Defense effort with university researchers and defines protocols in public documents called Requests For Comments (RFCs).",
      "Rather than reinventing physical and data-link standards, TCP/IP references existing standards created by organizations like the IEEE (such as 802.3 Ethernet and 802.11 Wi-Fi).",
      "The modern five-layer TCP/IP model consists of Physical (Layer 1), Data Link (Layer 2), Network (Layer 3), Transport (Layer 4), and Application (Layer 5/7), whereas the original RFC 1122 model had four layers by combining Data Link and Physical into the Link layer.",
      "Application layer protocols such as HTTP, SMTP, and POP3 provide services to application software rather than being the end-user applications themselves.",
      "In HTTP web transfers, a client sends an HTTP GET request for a file and the server responds with an HTTP header containing a status code (such as 200 OK or 404 Not Found) plus data; subsequent data chunks omit the repeated HTTP header.",
      "TCP provides reliable transport with error recovery to upper-layer protocols by numbering segments with sequence numbers (SEQ) and requesting retransmission when a segment is lost.",
      "Adjacent-layer interaction occurs on a single computer when a lower layer provides a service requested by the layer immediately above it, whereas same-layer interaction occurs between matching layers on two different computers using protocol headers.",
      "The Network layer (primarily IP) provides logical end-to-end host addressing and packet routing across interconnected networks, analogous to how the postal service routes letters between post offices.",
      "The Data Link and Physical layers work together to deliver packets across a single physical hop by encapsulating the IP packet into a frame, transmitting bits over the medium, and de-encapsulating the frame at the receiving node.",
      "Host data encapsulation follows five steps: (1) create application data and headers, (2) add a transport header (segment), (3) add a network IP header (packet), (4) add a data-link header and trailer (frame), and (5) transmit the physical bits.",
      "The seven-layer OSI model splits the TCP/IP Application layer into Application (Layer 7), Presentation (Layer 6), and Session (Layer 5), and uses the generic term Layer x Protocol Data Unit (LxPDU) for encapsulated messages."
    ],
    keyTerms: [
      { term: "Networking Model", def: "A comprehensive framework of layered standards and protocols that defines how network devices and software communicate." },
      { term: "Request For Comments (RFC)", def: "The numbered standards documents used to define protocols in the TCP/IP networking model." },
      { term: "Same-Layer Interaction", def: "Logical communication between the corresponding networking layer on two different computers using information stored in that layer's protocol header." },
      { term: "Adjacent-Layer Interaction", def: "On a single device, the process in which a lower networking layer provides a service to the layer directly above it." },
      { term: "Encapsulation", def: "The process of wrapping data supplied by a higher layer behind a protocol header (and for Layer 2, a trailer) before transmission." },
      { term: "De-encapsulation", def: "The process of removing and discarding outer protocol headers and trailers as a received message moves up the networking stack." },
      { term: "Segment", def: "The TCP/IP transport layer message (L4PDU) consisting of a transport header (such as TCP) and its encapsulated payload." },
      { term: "Packet", def: "The TCP/IP network layer message (L3PDU) consisting of an IP header and its encapsulated transport segment." },
      { term: "Frame", def: "The data-link layer message (L2PDU) consisting of a link-layer header, the encapsulated network packet, and a link-layer trailer." },
      { term: "Protocol Data Unit (PDU)", def: "The OSI terminology for the encapsulated message at a specific layer, denoted as LxPDU where x is the OSI layer number." },
      { term: "Dotted-Decimal Notation (DDN)", def: "The format used to represent 32-bit IPv4 addresses as four decimal numbers separated by periods." },
      { term: "IP Host", def: "Any endpoint device, regardless of size, that is assigned an IP address and communicates over a TCP/IP network." }
    ],
    commands: [
      { cmd: "ping ip-address", desc: "Tests basic end-to-end IP network connectivity across Layers 1 through 3", mode: "user" },
      { cmd: "show interfaces", desc: "Displays physical (Layer 1) and data-link (Layer 2) status and framing counters on an interface", mode: "user" },
      { cmd: "show ip route", desc: "Displays the router's Layer 3 IP routing table used to forward packets toward destination groups", mode: "user" },
      { cmd: "show arp", desc: "Displays the mapping table between Layer 3 IPv4 addresses and Layer 2 Ethernet MAC addresses", mode: "user" },
      { cmd: "show version", desc: "Displays Cisco IOS software version and hardware platform details", mode: "user" },
      { cmd: "show running-config", desc: "Displays the active configuration file stored in RAM", mode: "privileged" },
      { cmd: "show ip interface brief", desc: "Displays a concise summary of Layer 3 IP addresses and Layer 1/Layer 2 status for all interfaces", mode: "user" },
      { cmd: "traceroute ip-address", desc: "Traces the hop-by-hop Layer 3 router path taken by packets to reach a destination host", mode: "user" }
    ],
    tips: [
      "Always use OSI layer numbers (Layers 1 to 7) even when referring to TCP/IP protocols: Application layer protocols are called Layer 7 (or Layer 5-7), Transport is Layer 4, Network is Layer 3, Data Link is Layer 2, and Physical is Layer 1.",
      "Only Layer 2 (Data Link) adds both a header and a trailer during encapsulation; Layers 3, 4, and 7 add headers only.",
      "Memorize the PDU-to-term mapping cold: L4PDU = Segment, L3PDU = Packet, L2PDU = Frame.",
      "Distinguish same-layer vs. adjacent-layer interaction by checking how many devices are involved: one device = adjacent-layer; two devices exchanging headers = same-layer."
    ]
  },
  {
    id: "v1c02",
    volume: 1,
    chapter: 2,
    title: "Fundamentals of Ethernet LANs",
    domain: "Network Fundamentals",
    pages: "32-57",
    examTopics: [
      "1.1.b Explain the role and function of L2 and L3 switches",
      "1.2.e Describe characteristics of small office/home office (SOHO) architectures",
      "1.3.a Compare single-mode fiber, multimode fiber, and copper cabling",
      "1.3.b Compare Ethernet shared media and point-to-point connections"
    ],
    summary: "This chapter covers the physical and data-link layer foundations of IEEE 802.3 Ethernet LANs. It compares copper UTP cabling (including 10BASE-T, 100BASE-T, and 1000BASE-T pinouts for straight-through and crossover cables) with multimode and single-mode fiber-optic cabling. It then examines the IEEE 802.3 Ethernet frame format, 48-bit MAC addressing, EtherType values, FCS error detection, and the operational differences between half-duplex CSMA/CD shared media (hubs) and full-duplex point-to-point switched links.",
    keyPoints: [
      "IEEE 802.3 Ethernet defines many Physical layer cabling standards (UTP and fiber at speeds from 10 Mbps to 400 Gbps) but uses one common Data Link layer frame format across all of them.",
      "UTP cables twist pairs of copper wires together to cancel out electromagnetic interference (EMI) and crosstalk between wire pairs in the same cable.",
      "10BASE-T (802.3) and 100BASE-T (802.3u) use two wire pairs (pins 1,2 and pins 3,6) with a 100-meter maximum distance, whereas 1000BASE-T (802.3ab) uses all four wire pairs (pins 1,2; 3,6; 4,5; and 7,8) for simultaneous bidirectional transmission over 100 meters.",
      "PC NICs, routers, and wireless access point Ethernet ports transmit on pins 1 and 2 and receive on pins 3 and 6; LAN switches and hubs transmit on pins 3 and 6 and receive on pins 1 and 2.",
      "Connect devices that transmit on different pin pairs (such as PC to switch, or router to switch) with a straight-through cable, and devices that transmit on the same pin pairs (such as switch to switch, or PC to router) with a crossover cable (unless Auto-MDIX is active).",
      "Multimode fiber (MMF) uses a wider glass core with LED transmitters reflecting light at multiple angles for distances up to 300-500 meters, while single-mode fiber (SMF) uses a narrow core (about one-fifth the diameter of MMF) with laser transmitters for distances of tens of kilometers.",
      "Dual-fiber Ethernet connections require two fiber strands so that the transmit (Tx) port on one transceiver connects to the receive (Rx) port on the opposite transceiver.",
      "An IEEE 802.3 Ethernet frame consists of a 7-byte Preamble, 1-byte Start Frame Delimiter (SFD), 6-byte Destination MAC, 6-byte Source MAC, 2-byte Type (EtherType), 46-to-1500-byte Data and Pad field, and a 4-byte Frame Check Sequence (FCS) trailer.",
      "A 48-bit (6-byte, 12-hex-digit) unicast MAC address consists of a 24-bit (3-byte) Organizationally Unique Identifier (OUI) assigned by the IEEE and a 24-bit vendor-assigned identifier; group addresses include the broadcast address (FFFF.FFFF.FFFF) and multicast addresses.",
      "The 2-byte EtherType field identifies the encapsulated Layer 3 protocol, most commonly 0x0800 for IPv4 and 0x86DD for IPv6.",
      "The 4-byte FCS trailer provides error detection only (not error recovery): if the receiver's CRC calculation does not match the FCS, the receiver silently discards the errored frame.",
      "Layer 1 LAN hubs repeat electrical signals out all other ports, creating a shared-media collision domain that requires half-duplex operation and the CSMA/CD algorithm, whereas Layer 2 switches buffer and forward frames per port, enabling collision-free full-duplex point-to-point operation."
    ],
    keyTerms: [
      { term: "Unshielded Twisted Pair (UTP)", def: "Copper cabling containing twisted pairs of insulated wires without metallic shielding, terminated with 8-pin RJ-45 connectors." },
      { term: "Crosstalk", def: "Electromagnetic interference (EMI) caused by electrical signals on one wire pair bleeding into an adjacent wire pair within the same cable." },
      { term: "Straight-Through Cable", def: "A UTP cable wired pin-for-pin (pin 1 to 1, 2 to 2, etc.) used to connect devices that transmit on opposite pin pairs." },
      { term: "Crossover Cable", def: "A UTP cable that swaps transmit and receive pairs (pins 1,2 to 3,6, and for Gigabit also 4,5 to 7,8) to connect like devices." },
      { term: "Auto-MDIX", def: "A Cisco switch feature that automatically detects when the wrong UTP cable pinout is attached and swaps its internal transmit/receive logic." },
      { term: "Multimode Fiber (MMF)", def: "Fiber-optic cabling with a relatively wide fiberglass core that carries multiple light waves from an LED source over campus distances (up to ~400-500 m)." },
      { term: "Single-Mode Fiber (SMF)", def: "Fiber-optic cabling with a narrow core that carries a single laser light wave over long distances (up to 10-40+ km)." },
      { term: "Organizationally Unique Identifier (OUI)", def: "The first 3 bytes (24 bits / 6 hex digits) of a unicast MAC address, assigned by the IEEE to uniquely identify the hardware manufacturer." },
      { term: "Burned-In Address (BIA)", def: "The permanent globally unique 6-byte MAC address encoded into a NIC's ROM chip by the manufacturer." },
      { term: "EtherType", def: "The 2-byte Type field in the Ethernet header that identifies the Layer 3 protocol encapsulated in the frame (e.g., 0800 for IPv4, 86DD for IPv6)." },
      { term: "Frame Check Sequence (FCS)", def: "The 4-byte field in the Ethernet trailer used by the receiving node to detect bit errors and discard corrupted frames." },
      { term: "CSMA/CD", def: "Carrier Sense Multiple Access with Collision Detection; the media access algorithm used on half-duplex shared Ethernet to listen before sending, detect collisions, send a jam signal, and back off randomly." }
    ],
    commands: [
      { cmd: "show interfaces", desc: "Displays detailed Layer 1 and Layer 2 interface status, MAC address (BIA), MTU, and FCS/CRC error counters", mode: "user" },
      { cmd: "show interfaces status", desc: "Displays one-line status per switch port including speed, duplex, VLAN, and media type", mode: "user" },
      { cmd: "duplex {auto | full | half}", desc: "Configures the duplex operating mode on a physical Ethernet interface", mode: "interface" },
      { cmd: "speed {10 | 100 | 1000 | auto}", desc: "Configures the operating speed on a copper Ethernet interface", mode: "interface" },
      { cmd: "mdix auto", desc: "Enables automatic medium-dependent interface crossover (Auto-MDIX) detection on a switch port", mode: "interface" },
      { cmd: "show mac address-table", desc: "Displays the switch's Layer 2 MAC forwarding table", mode: "user" },
      { cmd: "show interfaces counters", desc: "Displays incoming and outgoing unicast, multicast, and broadcast frame counts per port", mode: "user" },
      { cmd: "show inventory", desc: "Displays installed hardware modules and pluggable transceivers (SFP/SFP+)", mode: "user" }
    ],
    tips: [
      "Group devices into two pinout teams for 10/100BASE-T: Team 1,2 = PC, Router, Wireless AP; Team 3,6 = Switch, Hub. Same team = crossover; different teams = straight-through.",
      "Minimum Ethernet Data field is 46 bytes and maximum is 1500 bytes (IP MTU). Counting the 14-byte header (Dest MAC 6 + Src MAC 6 + Type 2) and 4-byte FCS trailer (18 bytes total), legal Ethernet frames range from 64 to 1518 bytes (excluding the 8-byte Preamble/SFD).",
      "Memorize the two EtherType hex codes shown in the chapter: 0x0800 = IPv4 and 0x86DD = IPv6.",
      "Any switch port or PC NIC connected directly to a Layer 1 hub must operate in half duplex using CSMA/CD; connections between switches, routers, and PCs use full duplex."
    ]
  },
  {
    id: "v1c03",
    volume: 1,
    chapter: 3,
    title: "Fundamentals of WANs and IP Routing",
    domain: "IP Connectivity",
    pages: "58-79",
    examTopics: [
      "1.1.a Explain the role and function of routers",
      "1.2.d Describe characteristics of WAN topology architectures"
    ],
    summary: "This chapter introduces wide-area network (WAN) technologies—specifically point-to-point serial leased lines using Cisco HDLC and Layer 2 Ethernet WAN services (E-Line/EoMPLS)—and explains how routers forward IPv4 packets across LANs and WANs. It details host default-gateway forwarding logic, the four-step router packet-forwarding and re-encapsulation process, subnet grouping rules, the 20-byte IPv4 header, dynamic route learning via routing protocols, and supporting network protocols (DNS, ARP, and ICMP ping).",
    keyPoints: [
      "A leased line (also called a serial link, point-to-point link, circuit, private line, or T1 at 1.544 Mbps) is a Layer 1 telco service that provides full-duplex bit transmission between two routers.",
      "Standard ISO HDLC lacks a Type field, so Cisco routers default to a proprietary HDLC frame format on serial links that adds a 2-byte Type field alongside the Flag, Address, Control, and FCS fields.",
      "Ethernet WAN services such as Ethernet Line Service (E-Line) or Ethernet over MPLS (EoMPLS) connect a customer premise equipment (CPE) router via fiber Ethernet to a service provider Point of Presence (PoP), emulating a point-to-point Layer 2 Ethernet link between remote routers.",
      "When an IP host sends a packet, it checks whether the destination IP address is in its own local subnet: if yes, it sends the frame directly to the destination host's MAC address; if no, it sends the frame to its default gateway (default router) MAC address.",
      "When a router receives a frame, it performs four steps: (1) check the FCS to verify no transmission errors occurred, (2) strip and discard the incoming data-link header and trailer, (3) match the destination IP address against its routing table to find the outgoing interface and next-hop IP, and (4) encapsulate the packet in a new data-link frame for the outgoing link.",
      "During end-to-end IP routing (without NAT), the Layer 2 data-link headers and trailers are replaced at every router hop, whereas the Layer 3 source and destination IP addresses in the 20-byte IPv4 header remain unchanged from source host to destination host.",
      "IP subnetting follows two core grouping rules: IP addresses not separated by a router must belong to the same subnet, and IP addresses separated by at least one router must belong to different subnets.",
      "Dynamic routing protocols learn routes in three steps: (1) each router adds directly connected subnets to its routing table, (2) each router advertises known routes to neighboring routers in routing updates, and (3) routers add the best learned routes (based on lowest metric) to their routing tables with the advertising neighbor as the next-hop IP.",
      "Domain Name System (DNS) resolves human-readable hostnames into IP addresses via a DNS query/reply exchange before the host sends application packets to the destination IP.",
      "Address Resolution Protocol (ARP) resolves a known local-subnet IPv4 address (either the destination host or the next-hop/default router) into its Layer 2 MAC address by sending an Ethernet broadcast ARP Request and receiving an Ethernet unicast ARP Reply, storing the result in the ARP cache.",
      "The ping command tests Layers 1 through 3 connectivity without relying on upper-layer applications by sending an ICMP Echo Request to a target IP address and listening for an ICMP Echo Reply."
    ],
    keyTerms: [
      { term: "Leased Line", def: "A point-to-point Layer 1 WAN circuit leased from a telco that provides predetermined full-duplex bandwidth between two sites." },
      { term: "High-Level Data Link Control (HDLC)", def: "The default Layer 2 data-link encapsulation protocol on Cisco synchronous serial interfaces, enhanced by Cisco with a 2-byte Type field." },
      { term: "Ethernet over MPLS (EoMPLS)", def: "A service provider WAN technology (an example of E-Line) that emulates a point-to-point Layer 2 Ethernet link between customer routers." },
      { term: "Point of Presence (PoP)", def: "The service provider facility where the customer's access fiber or copper link terminates into the provider's WAN switch." },
      { term: "Default Gateway (Default Router)", def: "The router on the local LAN subnet to which an IP host forwards packets destined for IP addresses outside its own subnet." },
      { term: "Routing Table", def: "A table maintained by a router that maps destination IP networks/subnets to outgoing interfaces and next-hop router IP addresses." },
      { term: "Routing Protocol", def: "A protocol (such as OSPF) used by routers to dynamically exchange routing updates and populate their IP routing tables." },
      { term: "Address Resolution Protocol (ARP)", def: "An Internet layer protocol that dynamically discovers the Layer 2 MAC address corresponding to a known Layer 3 IPv4 address on the same LAN." },
      { term: "ARP Cache (ARP Table)", def: "A temporary table on a host or router that stores learned IPv4-to-MAC address mappings until they age out." },
      { term: "Domain Name System (DNS)", def: "A distributed client/server system that translates human-friendly hostnames (FQDNs) into numerical IP addresses." },
      { term: "Internet Control Message Protocol (ICMP)", def: "A TCP/IP network layer control protocol used to report errors and test reachability via messages such as Echo Request and Echo Reply." }
    ],
    commands: [
      { cmd: "ping ip-address", desc: "Sends ICMP Echo Request packets to verify Layer 3 reachability to a destination IP address", mode: "user" },
      { cmd: "arp -a", desc: "Displays the current ARP cache entries on a PC operating system command prompt", mode: "other" },
      { cmd: "show ip arp", desc: "Displays the IPv4 ARP table on a Cisco router or switch", mode: "user" },
      { cmd: "show ip route", desc: "Displays the IPv4 routing table on a Cisco router", mode: "user" },
      { cmd: "encapsulation hdlc", desc: "Configures Cisco HDLC data-link framing on a router serial interface (default)", mode: "interface" },
      { cmd: "encapsulation ppp", desc: "Configures Point-to-Point Protocol (PPP) data-link framing on a router serial interface", mode: "interface" },
      { cmd: "show interfaces serial number", desc: "Displays Layer 1 status and Layer 2 encapsulation (such as HDLC) on a serial WAN interface", mode: "user" },
      { cmd: "ip address ip-address mask", desc: "Assigns an IPv4 address and subnet mask to a router interface", mode: "interface" }
    ],
    tips: [
      "When a packet crosses a router from PC1 to PC2, the source and destination IP addresses never change (unless NAT is configured), but the source and destination Layer 2 addresses change on every link.",
      "Over an EoMPLS WAN link between R1 and R2, the frame uses standard 802.3 Ethernet headers with R1's WAN interface MAC as source and R2's WAN interface MAC as destination.",
      "Remember the ARP cast types: ARP Request = Ethernet Broadcast (FFFF.FFFF.FFFF); ARP Reply = Ethernet Unicast back to the requester.",
      "Connected routes are added to a router's routing table automatically when an interface is up with an IP address—no routing protocol is needed for directly connected subnets."
    ]
  },
  {
    id: "v1c04",
    volume: 1,
    chapter: 4,
    title: "Using the Command-Line Interface",
    domain: "Network Access",
    pages: "84-104",
    examTopics: [
      "Foundational Cisco IOS CLI navigation, EXEC and configuration modes, and configuration file management"
    ],
    summary: "This chapter covers how to access and navigate the Cisco IOS Command-Line Interface (CLI) on Catalyst switches. It explains physical console cabling (RJ-45 rollover and USB Mini-B) and default serial terminal settings (9600 8N1), compares Telnet and SSH remote access, and details navigation between User EXEC, Privileged EXEC (Enable), Global Configuration, and configuration submodes. Finally, it describes the four switch memory types (RAM, Flash, ROM, NVRAM) and the commands to view, copy, and erase configuration files.",
    keyPoints: [
      "Cisco Catalyst switches name physical interfaces after their fastest supported speed (e.g., a 10/100/1000 port is always named GigabitEthernet) using two-part (0/1) or three-part (1/0/1) numbering.",
      "The CLI can be accessed out-of-band via the physical console port (RJ-45 using a rollover cable where pin 1 rolls to 8, 2 to 7, etc., or a USB Type Mini-B port) or in-band over the TCP/IP network via Telnet or SSH.",
      "Terminal emulator software connecting to a Cisco console port must match the default serial settings: 9600 bps, no hardware flow control, 8 data bits, no parity, and 1 stop bit (9600 8N1).",
      "Telnet transmits all traffic including login passwords in clear text, whereas Secure Shell (SSH) encrypts all session traffic and credentials.",
      "User EXEC mode (Hostname>) allows non-disruptive viewing commands; Privileged EXEC or Enable mode (Hostname#), entered via the enable command, allows all show commands plus disruptive commands like reload, debug, and copy.",
      "Interactive CLI help includes ? (list commands/parameters), prefix? without a space (list commands/keywords starting with prefix), command ? with a space (list next parameters), and the Tab key (autocomplete a uniquely abbreviated word).",
      "The CLI history buffer stores the last 10 commands by default; Ctrl+P (or Up arrow) recalls the previous command, Ctrl+N (or Down arrow) recalls the next command, and Ctrl+B / Ctrl+F move the cursor backward/forward.",
      "The configure terminal command moves from Privileged EXEC mode to Global Configuration mode (Hostname(config)#), from which context-setting commands enter submodes such as interface (config-if), line (config-line), and vlan (config-vlan).",
      "From any configuration submode, exit steps back one level toward global config mode, while end or Ctrl+Z jumps directly back to Privileged EXEC mode; you can also jump directly from one config submode to another.",
      "Cisco switches use four memory types: RAM (DRAM) for working storage and running-config, NVRAM for startup-config, Flash for the Cisco IOS software image and vlan.dat, and ROM for the bootstrap program.",
      "Commands typed in configuration mode take effect immediately in RAM (running-config) but are lost upon reload unless saved to NVRAM (startup-config) with copy running-config startup-config.",
      "Whereas copy running-config startup-config overwrites NVRAM, copy startup-config running-config merges the two configurations in RAM; to clear the running-config cleanly, erase NVRAM (write erase, erase startup-config, or erase nvram:) and reload."
    ],
    keyTerms: [
      { term: "Rollover Cable", def: "An 8-wire console cable that reverses pin positions end-to-end (pin 1 to 8, 2 to 7, 3 to 6, 4 to 5) to connect a serial adapter to an RJ-45 console port." },
      { term: "User EXEC Mode", def: "The initial, limited CLI mode (indicated by a > prompt) where users can view basic status but cannot change configuration or reboot the device." },
      { term: "Privileged EXEC Mode (Enable Mode)", def: "The administrative EXEC mode (indicated by a # prompt) entered with the enable command, allowing full verification, file management, and access to configuration mode." },
      { term: "Global Configuration Mode", def: "The primary configuration context (Hostname(config)#) entered via configure terminal where device-wide settings are applied." },
      { term: "running-config", def: "The active configuration file stored in volatile RAM that dynamically updates as configuration commands are entered." },
      { term: "startup-config", def: "The initial configuration file stored in nonvolatile NVRAM that IOS loads into RAM when the switch boots or reloads." },
      { term: "Flash Memory", def: "Nonvolatile solid-state memory (chip or card) that stores the full Cisco IOS operating system image and VLAN database file." },
      { term: "ROM (Read-Only Memory)", def: "Permanent memory that holds the bootstrap (boothelper) program responsible for finding and loading the IOS image into RAM at power-on." },
      { term: "NVRAM (Nonvolatile RAM)", def: "Persistent memory that retains the startup-config file across power cycles and reloads." }
    ],
    commands: [
      { cmd: "enable", desc: "Moves the CLI session from User EXEC mode (>) to Privileged EXEC mode (#)", mode: "user" },
      { cmd: "disable", desc: "Moves the CLI session from Privileged EXEC mode (#) back to User EXEC mode (>)", mode: "privileged" },
      { cmd: "configure terminal", desc: "Enters Global Configuration mode from Privileged EXEC mode", mode: "privileged" },
      { cmd: "hostname name", desc: "Sets the device's administrative hostname and CLI prompt prefix", mode: "global" },
      { cmd: "line console 0", desc: "Enters console line configuration mode (config-line)", mode: "global" },
      { cmd: "interface type number", desc: "Enters interface configuration mode (config-if) for the specified port", mode: "global" },
      { cmd: "exit", desc: "Moves back one level from a configuration submode to Global Configuration mode (or from global config to privileged EXEC)", mode: "other" },
      { cmd: "end", desc: "Exits any configuration mode or submode directly back to Privileged EXEC mode (same as Ctrl+Z)", mode: "other" },
      { cmd: "copy running-config startup-config", desc: "Saves the active configuration in RAM to NVRAM, overwriting the startup-config file", mode: "privileged" },
      { cmd: "copy startup-config running-config", desc: "Merges the startup-config file in NVRAM into the active running-config in RAM", mode: "privileged" },
      { cmd: "show running-config", desc: "Displays the active configuration currently in RAM", mode: "privileged" },
      { cmd: "show startup-config", desc: "Displays the saved initial configuration stored in NVRAM", mode: "privileged" },
      { cmd: "erase startup-config", desc: "Erases the startup configuration file in NVRAM (synonymous with write erase and erase nvram:)", mode: "privileged" },
      { cmd: "reload", desc: "Reboots Cisco IOS software, loading startup-config from NVRAM into RAM", mode: "privileged" },
      { cmd: "no debug all", desc: "Disables all active real-time debug feeds (synonymous with undebug all)", mode: "privileged" }
    ],
    tips: [
      "Remember the difference between exit and end inside a submode like (config-if)# or (config-line)#: exit goes one step up to (config)#, while end (or Ctrl+Z) goes all the way back to Privileged EXEC (#).",
      "Know what happens when you type reload in User EXEC mode (>): IOS rejects it (or tries to translate 'reload' as a Telnet hostname) because reload is a Privileged EXEC (#) command.",
      "Memorize the four memory locations: RAM = running-config, NVRAM = startup-config, Flash = IOS image, ROM = Bootstrap.",
      "All three erase commands—write erase, erase startup-config, and erase nvram:—accomplish the exact same task of wiping NVRAM."
    ]
  },
  {
    id: "v1c05",
    volume: 1,
    chapter: 5,
    title: "Analyzing Ethernet LAN Switching",
    domain: "Network Fundamentals",
    pages: "106-125",
    examTopics: [
      "1.1.b Explain the role and function of L2 and L3 switches",
      "1.13.a Describe MAC learning and aging",
      "1.13.b Describe frame switching",
      "1.13.c Describe frame flooding",
      "1.13.d Describe the MAC address table",
      "2.5 Describe the need for and basic operations of Rapid PVST+ Spanning Tree Protocol"
    ],
    summary: "This chapter explains the three core functions of a Layer 2 Ethernet LAN switch: learning MAC addresses from incoming source MACs, deciding whether to forward, flood, or filter frames based on destination MACs, and preventing Layer 2 loops using Spanning Tree Protocol (STP). It also demonstrates how to verify and manage the Content-Addressable Memory (CAM) MAC address table, interface statuses, and aging timers on Cisco Catalyst switches.",
    keyPoints: [
      "A Layer 2 Ethernet switch performs three primary actions: (1) forwarding or filtering frames based on destination MAC address, (2) learning MAC addresses based on source MAC address, and (3) preventing Layer 2 loops using STP.",
      "The switch's MAC address table (also called the switching table, bridging table, or CAM table after the Content-Addressable Memory hardware) maps MAC addresses to local switch ports and VLAN IDs.",
      "When a Known Unicast frame arrives (its destination MAC is in the MAC table for that VLAN), the switch forwards it out only the single matched port—unless the matched port is the same port the frame arrived on, in which case the switch filters (ignores/drops) the frame.",
      "Switches dynamically learn MAC addresses by inspecting the Source MAC address of every incoming frame: if not present, the switch adds the source MAC and incoming port to the table; if already present, it resets the 300-second inactivity aging timer to 0.",
      "When an Unknown Unicast frame (destination MAC not in the table) or a Broadcast frame (FFFF.FFFF.FFFF) arrives, the switch floods a copy out all ports in that same VLAN except the incoming port.",
      "In a multi-switch topology, each switch independently learns MAC addresses and makes forwarding decisions using its own local port numbers; inter-switch trunk/uplink ports will have multiple remote MAC addresses associated with them.",
      "Without Spanning Tree Protocol (STP) in a redundant Layer 2 topology, flooded unknown unicast and broadcast frames loop endlessly; STP blocks selected redundant ports so only one active path exists between any two LAN segments.",
      "Cisco Catalyst switches work out of the box because by default all ports are enabled (no shutdown), assigned to VLAN 1, set to autonegotiate speed/duplex, and run MAC learning and STP automatically.",
      "Dynamic MAC table entries age out after 300 seconds of inactivity by default (configurable globally or per VLAN via mac address-table aging-time); if the CAM table fills completely, the switch removes the oldest entry to make room.",
      "To completely reset a lab switch to factory defaults, erase NVRAM (erase startup-config), delete the VLAN database file in Flash (delete vlan.dat), and reload the switch."
    ],
    keyTerms: [
      { term: "Known Unicast Frame", def: "A frame whose unicast destination MAC address is currently listed in the switch's MAC address table." },
      { term: "Unknown Unicast Frame", def: "A frame whose unicast destination MAC address is not currently present in the switch's MAC address table, causing the switch to flood it." },
      { term: "Broadcast Frame", def: "An Ethernet frame addressed to FFFF.FFFF.FFFF, which switches flood out all ports in the same VLAN except the ingress port." },
      { term: "Flooding", def: "The switch process of forwarding copies of an incoming frame out all interfaces in the same VLAN except the interface on which it was received." },
      { term: "Filtering", def: "The switch decision to not forward a frame out a port, including dropping a frame when its destination MAC resides on the same port it entered." },
      { term: "Content-Addressable Memory (CAM)", def: "Specialized high-speed memory used by Cisco switches to store and perform rapid lookups in the MAC address table." },
      { term: "Inactivity Timer (Aging Time)", def: "A per-entry timer in the MAC address table that counts up and removes dynamic entries if no frames arrive from that source MAC within 300 seconds (default)." },
      { term: "Spanning Tree Protocol (STP)", def: "A Layer 2 protocol that prevents infinite frame loops in redundant switched topologies by placing selected ports into a blocking state." }
    ],
    commands: [
      { cmd: "show mac address-table", desc: "Displays all static and dynamic entries in the switch's MAC address table", mode: "user" },
      { cmd: "show mac address-table dynamic", desc: "Displays only dynamically learned MAC address table entries", mode: "user" },
      { cmd: "show mac address-table dynamic address mac-address", desc: "Displays the dynamic MAC table entry for one specific MAC address", mode: "user" },
      { cmd: "show mac address-table dynamic interface interface-id", desc: "Displays all dynamic MAC addresses learned on a specific switch port", mode: "user" },
      { cmd: "show mac address-table dynamic vlan vlan-id", desc: "Displays all dynamic MAC addresses learned within a specific VLAN", mode: "user" },
      { cmd: "show mac address-table count", desc: "Displays the number of dynamic/static MAC entries per VLAN and remaining available CAM table space", mode: "user" },
      { cmd: "show mac address-table aging-time", desc: "Displays the global (default 300 sec) and per-VLAN MAC table aging timeout values", mode: "user" },
      { cmd: "mac address-table aging-time seconds [vlan vlan-id]", desc: "Configures the inactivity timeout for dynamic MAC entries globally or for a specific VLAN", mode: "global" },
      { cmd: "clear mac address-table dynamic [vlan id | interface id | address mac]", desc: "Removes all or a filtered subset of dynamically learned entries from the MAC address table", mode: "privileged" },
      { cmd: "show interfaces status", desc: "Displays one-line port summary showing Port, Name, Status (connected/notconnect), Vlan, Duplex, Speed, and Type", mode: "user" },
      { cmd: "show interfaces interface-id counters", desc: "Displays in/out byte (octet) and unicast, multicast, and broadcast packet counters", mode: "user" },
      { cmd: "delete vlan.dat", desc: "Deletes the normal-range VLAN configuration file stored in Flash memory", mode: "privileged" }
    ],
    tips: [
      "Never confuse learning with forwarding: a switch ALWAYS learns from the Source MAC address + incoming port, and ALWAYS forwards/floods/filters based on the Destination MAC address.",
      "If show mac address-table dynamic lists three MAC addresses on Gi0/1, that does not mean three PCs are plugged directly into Gi0/1—it usually means Gi0/1 connects to another switch (or hub/AP) that reaches those three devices.",
      "Note the CLI mode difference: show mac address-table works in both User (>) and Privileged (#) EXEC modes, whereas clear mac address-table dynamic requires Privileged EXEC (#) mode.",
      "Remember that switches flood three types of frames within the ingress VLAN: Broadcasts, Unknown Unicasts, and Multicasts (often remembered as BUM traffic)."
    ]
  },
  {
    id: "v1c06",
    volume: 1,
    chapter: 6,
    title: "Configuring Basic Switch Management",
    domain: "Network Access",
    pages: "126-149",
    examTopics: [
      "1.6 Configure and verify IPv4 addressing and subnetting",
      "4.6 Configure and verify DHCP client and relay",
      "4.8 Configure network devices for remote access using SSH",
      "5.3 Configure device access control using local passwords"
    ],
    summary: "This chapter focuses on the switch management plane: securing CLI access and enabling IPv4 connectivity for remote administration. It covers simple line passwords, local username/password authentication (login local), external AAA servers (RADIUS/TACACS+), and full SSHv2 configuration using RSA keys. It also details configuring a Switched Virtual Interface (SVI) with a static or DHCP-learned IPv4 address and default gateway, plus lab productivity commands (logging synchronous, exec-timeout, no ip domain-lookup, and history size).",
    keyPoints: [
      "Networking device operations divide into three planes: the data plane (forwarding user frames), the control plane (protocols like STP that control forwarding tables), and the management plane (managing the device itself via CLI/SSH/SNMP).",
      "By default, a Cisco Catalyst switch requires no password on the console port and blocks all incoming Telnet/SSH connections on vty lines until authentication is configured.",
      "Simple shared password security uses password <value> and login under line console 0 or line vty 0 15, plus the global command enable secret <value> to protect Privileged EXEC mode.",
      "If both enable secret and the older, weaker enable password are configured, IOS always enforces the enable secret password and ignores enable password.",
      "Local username authentication requires global username <name> secret <password> commands coupled with the login local subcommand under console and/or vty lines (replacing the simple login command).",
      "External AAA servers centralize user credentials using RADIUS or TACACS+ between the switch and the AAA server while the user connects to the switch via Telnet or SSH.",
      "Configuring SSH requires: (1) a hostname and ip domain-name (forming the FQDN used to name the keys), (2) crypto key generate rsa (at least 768 bits for SSHv2), (3) local usernames and login local on vty lines, and optionally ip ssh version 2 and transport input ssh.",
      "The vty subcommand transport input {all | none | telnet | ssh} restricts which remote protocols are accepted; Catalyst switches default to allowing both Telnet and SSH, whereas Cisco routers often default to transport input none.",
      "A Layer 2 switch does not need an IP address to switch frames, but requires an IPv4 address on one Switched Virtual Interface (SVI, such as interface vlan 1), no shutdown on that SVI, and a global ip default-gateway to be managed remotely from other subnets.",
      "For an SVI (interface vlan x) to reach the up/up state, VLAN x must exist and be active on the switch AND at least one physical port in VLAN x (or a trunk allowing VLAN x) must be in a connected/forwarding state.",
      "A switch SVI can dynamically obtain its IPv4 address, subnet mask, and default gateway as a DHCP client using ip address dhcp under interface vlan x, verified with show dhcp lease.",
      "Useful CLI productivity commands include no ip domain-lookup (global, stops ~1-minute DNS timeouts on typos), logging synchronous (line, prevents syslog messages from interrupting typed commands), exec-timeout <min> <sec> (line, default 5 min; 0 0 disables timeout), and history size <n> (line, default 10)."
    ],
    keyTerms: [
      { term: "Data Plane", def: "The hardware and software processes of a network device that receive, process, and forward user traffic frames or packets." },
      { term: "Control Plane", def: "Protocols and logic (such as STP or routing protocols) that build and control the tables used by the data plane." },
      { term: "Management Plane", def: "Protocols and features (such as SSH, Telnet, Console, and SNMP) used by engineers to monitor and configure the network device itself." },
      { term: "Virtual Teletype (VTY) Lines", def: "Logical interfaces (numbered 0 through 15 on Catalyst switches) that handle incoming remote CLI sessions over Telnet or SSH." },
      { term: "Switched Virtual Interface (SVI)", def: "A logical internal VLAN interface (e.g., interface vlan 1) that acts as the switch's own virtual NIC for management IP traffic." },
      { term: "AAA Server", def: "An external Authentication, Authorization, and Accounting server that centrally validates login credentials via RADIUS or TACACS+." },
      { term: "Fully Qualified Domain Name (FQDN)", def: "The combination of a device's hostname and domain name (e.g., sw1.example.com) used by IOS to label generated RSA keys for SSH." },
      { term: "Logging Synchronous", def: "A console/vty line setting that buffers unsolicited syslog messages until command output finishes or the user presses Enter." }
    ],
    commands: [
      { cmd: "enable secret password", desc: "Sets an MD5/scrypt-hashed password required for any user to enter Privileged EXEC mode", mode: "global" },
      { cmd: "line vty 0 15", desc: "Enters line configuration mode for all 16 virtual terminal (Telnet/SSH) lines on a switch", mode: "global" },
      { cmd: "password password", desc: "Defines the simple shared password on a console or vty line when used with the login command", mode: "line" },
      { cmd: "login", desc: "Enables simple password-only authentication on a console or vty line", mode: "line" },
      { cmd: "login local", desc: "Enables authentication on a console or vty line using locally configured username/secret pairs", mode: "line" },
      { cmd: "username name secret password", desc: "Creates a local user account with a securely hashed password in global configuration mode", mode: "global" },
      { cmd: "ip domain-name domain", desc: "Configures the DNS domain name used to build the switch's FQDN for RSA key generation", mode: "global" },
      { cmd: "crypto key generate rsa [modulus 360-2048]", desc: "Generates the matched public/private RSA key pair required by the SSH server", mode: "global" },
      { cmd: "ip ssh version 2", desc: "Restricts the IOS SSH server to accept only more secure SSH version 2 connections", mode: "global" },
      { cmd: "transport input {telnet | ssh | all | none}", desc: "Specifies which remote access protocols are permitted on the vty lines", mode: "line" },
      { cmd: "interface vlan number", desc: "Enters interface configuration mode for the specified Switched Virtual Interface (SVI)", mode: "global" },
      { cmd: "ip address ip-address mask", desc: "Statically assigns an IPv4 address and subnet mask to a VLAN interface", mode: "interface" },
      { cmd: "ip address dhcp", desc: "Configures a VLAN interface to acquire its IPv4 address, mask, and default gateway via DHCP", mode: "interface" },
      { cmd: "ip default-gateway ip-address", desc: "Configures the default gateway IPv4 address for a Layer 2 switch in global configuration mode", mode: "global" },
      { cmd: "ip name-server ip1 [ip2 ...]", desc: "Configures one or more DNS server IPv4 addresses for hostname resolution from the switch CLI", mode: "global" },
      { cmd: "no ip domain-lookup", desc: "Disables DNS hostname translation on the CLI so mistyped commands fail immediately", mode: "global" },
      { cmd: "logging synchronous", desc: "Synchronizes unsolicited syslog messages with CLI prompts and show output on a console/vty line", mode: "line" },
      { cmd: "exec-timeout minutes seconds", desc: "Sets the inactivity logout timer on a console or vty line (0 0 means never time out)", mode: "line" },
      { cmd: "history size length", desc: "Sets the default command history buffer size for users connecting on that console or vty line", mode: "line" },
      { cmd: "terminal history size length", desc: "Temporarily changes the command history buffer size for the current EXEC session only", mode: "user" },
      { cmd: "show ip ssh", desc: "Displays the SSH server version, authentication timeout, and retry settings", mode: "user" },
      { cmd: "show ssh", desc: "Displays active incoming and outgoing SSH client connections, encryption ciphers, and usernames", mode: "user" },
      { cmd: "show dhcp lease", desc: "Displays the IPv4 address, mask, default gateway, and lease timers acquired via DHCP", mode: "user" },
      { cmd: "show ip default-gateway", desc: "Displays the configured IPv4 default gateway address on the switch", mode: "user" }
    ],
    tips: [
      "SSH does NOT support simple line passwords (login + password); you MUST configure local usernames (username ... secret ...) with login local (or an external AAA server).",
      "Watch the configuration modes carefully on exam questions: ip address is configured in interface vlan x mode, whereas ip default-gateway is configured in global configuration mode!",
      "Don't forget no shutdown on interface vlan 1! Unlike physical switch ports (which default to no shutdown), SVIs default to administratively down (shutdown).",
      "Distinguish show ip ssh (shows SSH server status/version/retries) from show ssh (shows currently logged-in SSH user sessions)."
    ]
  },
  {
    id: "v1c07",
    volume: 1,
    chapter: 7,
    title: "Configuring and Verifying Switch Interfaces",
    domain: "Network Access",
    pages: "150-170",
    examTopics: [
      "1.1.b Explain the role and function of L2 and L3 switches",
      "1.4 Identify interface and cable issues (collisions, errors, mismatch duplex, and/or speed)"
    ],
    summary: "This chapter covers configuring physical switch interface parameters (speed, duplex, description, and administrative state via shutdown/no shutdown), using the interface range macro, and troubleshooting Layer 1/Layer 2 interface problems. It explains IEEE 802.3u autonegotiation rules, what happens when one side disables autonegotiation, how to spot a duplex mismatch in show interfaces status, and how to interpret interface error counters such as runts, giants, CRC, input errors, collisions, and late collisions.",
    keyPoints: [
      "Multi-speed copper switch ports (10/100 and 10/100/1000) default to speed auto and duplex auto, using IEEE 802.3u autonegotiation out-of-band electrical pulses to agree on the fastest common speed and best common duplex (full over half).",
      "The interface range <type> <start> - <end> command applies subsequent interface subcommands to a contiguous group of same-type ports, expanding the commands under each individual interface in running-config.",
      "To revert an interface setting to default, use no speed (reverts to speed auto), no duplex (reverts to duplex auto), no description (removes description), and no shutdown (enables the port).",
      "Configuring BOTH speed and duplex manually on a Cisco switch port disables IEEE autonegotiation on that port.",
      "When one node enables autonegotiation but its link partner disables autonegotiation, a Cisco switch (1) senses the electrical signal to match the speed (or falls back to the IEEE default slowest speed, 10 Mbps, if sensing fails), and (2) applies the IEEE default duplex rule: half duplex if speed is 10 or 100 Mbps, or full duplex if speed is 1000 Mbps.",
      "A classic duplex mismatch occurs when one side is manually hardcoded to 100/full (disabling autonegotiation) and the other side is set to auto/auto (senses 100 Mbps and falls back to half duplex); the link stays connected (up/up) but suffers severe performance degradation.",
      "LAN hubs do not participate in or forward IEEE autonegotiation messages, causing attached auto-negotiating ports to fall back to 10 Mbps and half duplex.",
      "In show interfaces status, autonegotiated speed and duplex values display with an 'a-' prefix (e.g., a-full, a-100), whereas manually configured values lack the prefix (e.g., full, half, 100); show interfaces <id> omits the 'a-' prefix.",
      "Single-word status codes in show interfaces status map directly to two-part (Line/Protocol) codes in show interfaces: connected = up/up, notconnect = down/down (or up/down), disabled = administratively down/down, and err-disabled = down/down (err-disabled).",
      "A speed mismatch, unplugged cable, damaged cable, wrong cable pinout (without Auto-MDIX), macrobending on fiber, or a shutdown neighbor port places the interface into down/down (notconnect).",
      "Key interface error counters in show interfaces: Runts (<64 bytes, often from collisions), Giants (>1518 bytes), CRC (failed FCS check due to EMI or collisions), Frame (illegal framing/non-integer bytes), and Input Errors (sum of runts, giants, no buffer, CRC, frame, overrun, and ignored).",
      "Late collisions are collisions detected after the 64th byte of a frame has been transmitted; an incrementing late collisions counter on the half-duplex side of a link is the textbook indicator of a duplex mismatch."
    ],
    keyTerms: [
      { term: "IEEE Autonegotiation (802.3u)", def: "An out-of-band signaling protocol on UTP links that allows two Ethernet nodes to advertise capabilities and select the highest shared speed and duplex." },
      { term: "Duplex Mismatch", def: "A condition where one end of an Ethernet link operates at full duplex and the other at half duplex, leaving the link up/up but causing late collisions and poor throughput." },
      { term: "Macrobending", def: "Excessive bending of a fiber-optic cable beyond its minimum bend radius, causing light to escape the core and the link to fail." },
      { term: "Runts", def: "Received Ethernet frames smaller than the 64-byte minimum frame size (including the 18-byte header/trailer), commonly caused by collisions." },
      { term: "Giants", def: "Received Ethernet frames larger than the 1518-byte standard maximum frame size." },
      { term: "CRC Error", def: "A counter incremented when a received frame fails the Frame Check Sequence (FCS) mathematical verification due to EMI, bad cabling, or collisions." },
      { term: "Late Collision", def: "A collision that occurs after the first 64 bytes of a frame have been transmitted, strongly indicating a duplex mismatch (or a cable exceeding maximum length)." },
      { term: "err-disabled State", def: "An operational state (down/down err-disabled) where IOS automatically disables a port due to a security violation (like port security) or configuration error." }
    ],
    commands: [
      { cmd: "speed {10 | 100 | 1000 | auto}", desc: "Sets the interface operating speed or enables speed autonegotiation", mode: "interface" },
      { cmd: "duplex {auto | full | half}", desc: "Sets the interface duplex mode or enables duplex autonegotiation", mode: "interface" },
      { cmd: "description text", desc: "Attaches an informational text label to the interface configuration", mode: "interface" },
      { cmd: "shutdown", desc: "Administratively disables an interface, placing it in disabled (administratively down/down) state", mode: "interface" },
      { cmd: "no shutdown", desc: "Administratively enables an interface", mode: "interface" },
      { cmd: "interface range type start - end", desc: "Enters interface range configuration mode to apply subcommands to multiple consecutive ports at once", mode: "global" },
      { cmd: "show interfaces [type number] status", desc: "Lists one line per port with description, single-word status, VLAN, and duplex/speed (with 'a-' prefix if negotiated)", mode: "user" },
      { cmd: "show interfaces [type number]", desc: "Displays two-part line/protocol status, speed/duplex, and detailed error counters (runts, giants, CRC, collisions, late collisions)", mode: "user" },
      { cmd: "show interfaces description", desc: "Displays one line per interface with two-part line/protocol status and the full configured description", mode: "user" },
      { cmd: "show running-config interface type number", desc: "Displays only the running-configuration stanza for the specified interface", mode: "privileged" }
    ],
    tips: [
      "Memorize the fallback rule when autonegotiation fails on one side: Cisco switches sense the speed, then pick Half duplex for 10 or 100 Mbps, and Full duplex for 1000 Mbps! Thus, 1000/Full manual vs. Auto/Auto results in 1000/Full on BOTH sides (no mismatch!), whereas 100/Full manual vs. Auto/Auto results in 100/Half on the auto side (duplex mismatch!).",
      "A speed mismatch causes the link to go down/down (notconnect), whereas a duplex mismatch leaves the link up/up (connected).",
      "On a duplex mismatch, the HALF-duplex side sees late collisions and deferred transmissions because it obeys CSMA/CD while the full-duplex side transmits at any time; the FULL-duplex side sees CRC/input errors when incoming frames overlap.",
      "If CRC and input errors increment on a full-duplex link while collisions remain 0, suspect physical Layer 1 interference (EMI) or a damaged cable/connector."
    ]
  },
  {
    id: "v1c08",
    volume: 1,
    chapter: 8,
    title: "Implementing Ethernet Virtual LANs",
    domain: "Network Access",
    pages: "176-208",
    examTopics: [
      "1.13 Describe switching concepts (MAC learning, switching, flooding, MAC table)",
      "2.1.a Configure and verify access ports (data and voice)",
      "2.1.b Configure and verify default VLAN",
      "2.1.c Configure and verify VLAN connectivity",
      "2.2.a Configure and verify trunk ports",
      "2.2.b Configure and verify 802.1Q encapsulation",
      "2.2.c Configure and verify native VLAN"
    ],
    summary: "This chapter explains how Virtual LANs (VLANs) logically segment a switched network into separate broadcast domains (each mapped to its own IP subnet) and how IEEE 802.1Q trunking carries traffic for multiple VLANs over a single interswitch link. It covers normal vs. extended VLAN ranges, VTP modes, static access port and voice VLAN configuration, DTP administrative trunking modes, allowed VLAN filtering, and troubleshooting mismatched native VLANs, shut-down VLANs, and mismatched trunk states.",
    keyPoints: [
      "Each VLAN is a separate Layer 2 broadcast domain and maps 1-to-1 to a unique Layer 3 IP subnet; Layer 2 switches never forward frames directly between different VLANs, requiring a router or Layer 3 switch for inter-VLAN routing.",
      "IEEE 802.1Q trunking inserts a 4-byte tag into the Ethernet header (after Source MAC) containing a 12-bit VLAN ID field that supports 4094 usable VLANs (1-4094, with 0 and 4095 reserved) and recalculates the FCS; Cisco's legacy ISL protocol is obsolete.",
      "802.1Q defines one native VLAN per trunk (VLAN 1 by default) whose frames are sent across the trunk untagged (without the 4-byte 802.1Q header); both ends of a trunk must configure the same native VLAN to avoid VLAN hopping/traffic merging.",
      "Cisco divides VLAN IDs into normal-range VLANs (1-1005, where 1 is the undeletable default VLAN and 1002-1005 are undeletable legacy FDDI/Token Ring VLANs) and extended-range VLANs (1006-4094, which require VTP transparent or off mode).",
      "Assigning an access port to a nonexistent VLAN with switchport access vlan <id> automatically creates that VLAN with a default name (e.g., VLAN0003).",
      "In VTP server or client mode, normal-range VLANs are stored only in flash:vlan.dat (not in running-config), and clients cannot create/modify VLANs; in VTP transparent or off mode, normal and extended VLANs can be configured and appear in running-config.",
      "Dynamic Trunking Protocol (DTP) administrative modes (switchport mode): trunk (always trunks, sends DTP), dynamic desirable (actively initiates DTP), dynamic auto (passively waits for DTP; default on 2960 switches), and access (always access, disables DTP).",
      "Two connected ports both set to dynamic auto result in an operational static access link (no trunk forms); pairing trunk + switchport nonegotiate on one end with dynamic desirable or dynamic auto on the other creates a broken trunk/access mismatch where only native VLAN traffic passes.",
      "A port connected to a Cisco IP phone and a PC attached behind the phone's 3-port internal switch is configured as an access port with a Data VLAN (switchport access vlan <x>) and a Voice VLAN (switchport voice vlan <y>), requiring CDP to inform the phone to tag voice traffic with 802.1Q.",
      "An IP telephony access port does NOT appear in show interfaces trunk, shows Operational Mode: static access and Voice VLAN: <y> in show interfaces <id> switchport, and lists both the data and voice VLANs in show interfaces <id> trunk.",
      "A VLAN can be disabled locally on a switch (status act/lshut in show vlan brief) using either the global command shutdown vlan <id> or the VLAN submode command shutdown.",
      "The command show interfaces trunk displays three progressive VLAN lists: (1) Vlans allowed on trunk (1-4094 minus switchport trunk allowed vlan restrictions), (2) Vlans allowed and active in management domain (List 1 minus undefined or act/lshut VLANs), and (3) Vlans in spanning tree forwarding state and not pruned (List 2 minus STP-blocked or VTP-pruned VLANs)."
    ],
    keyTerms: [
      { term: "Virtual LAN (VLAN)", def: "A logical grouping of switch ports across one or more switches that forms an isolated Layer 2 broadcast domain." },
      { term: "IEEE 802.1Q", def: "The IEEE standard trunking protocol that inserts a 4-byte VLAN tag (with a 12-bit VLAN ID) into Ethernet frames and leaves native VLAN frames untagged." },
      { term: "Native VLAN", def: "The single VLAN on an 802.1Q trunk (VLAN 1 by default) whose frames are transmitted across the trunk without an 802.1Q tag." },
      { term: "Default VLAN", def: "VLAN 1 on Cisco Catalyst switches, to which all switch ports are assigned as their access VLAN by default." },
      { term: "Normal-Range VLANs", def: "VLAN IDs 1 through 1005, usable in all VTP modes (with 1 and 1002-1005 created by default and undeletable)." },
      { term: "Extended-Range VLANs", def: "VLAN IDs 1006 through 4094, which can only be configured when the switch is in VTP transparent or VTP off mode." },
      { term: "Dynamic Trunking Protocol (DTP)", def: "A Cisco-proprietary protocol that negotiates whether a link between switches becomes a trunk and which trunk encapsulation to use." },
      { term: "Data VLAN", def: "On a switch port connected to an IP phone and PC, the access VLAN used to carry untagged traffic to and from the PC." },
      { term: "Voice VLAN", def: "On a switch port connected to an IP phone, the auxiliary VLAN used to carry 802.1Q-tagged voice traffic to and from the IP phone." },
      { term: "VLAN Hopping", def: "An unintended security and forwarding issue caused by mismatched native VLANs on an 802.1Q trunk, where untagged frames sent in one VLAN arrive in a different VLAN." }
    ],
    commands: [
      { cmd: "vlan vlan-id", desc: "Creates a VLAN and enters VLAN configuration mode (config-vlan)", mode: "global" },
      { cmd: "name vlan-name", desc: "Assigns a descriptive name to a VLAN in VLAN configuration mode", mode: "other" },
      { cmd: "shutdown vlan vlan-id", desc: "Administratively disables a VLAN on the local switch (status becomes act/lshut)", mode: "global" },
      { cmd: "switchport mode access", desc: "Statically configures a port to always operate as a nontrunking access port and disables DTP", mode: "interface" },
      { cmd: "switchport access vlan vlan-id", desc: "Assigns an access port (or data VLAN on a phone port) to the specified VLAN", mode: "interface" },
      { cmd: "switchport voice vlan vlan-id", desc: "Assigns the voice VLAN for 802.1Q-tagged IP phone traffic on an access port", mode: "interface" },
      { cmd: "switchport mode trunk", desc: "Statically configures a port to always operate as a VLAN trunk", mode: "interface" },
      { cmd: "switchport mode dynamic desirable", desc: "Configures a port to actively initiate DTP trunking negotiation with the neighbor", mode: "interface" },
      { cmd: "switchport mode dynamic auto", desc: "Configures a port to passively wait for DTP trunking negotiation from the neighbor", mode: "interface" },
      { cmd: "switchport nonegotiate", desc: "Disables DTP frame transmission on a statically configured trunk or access port", mode: "interface" },
      { cmd: "switchport trunk encapsulation {dot1q | isl | negotiate}", desc: "Selects the trunking encapsulation protocol on switches that support both ISL and 802.1Q", mode: "interface" },
      { cmd: "switchport trunk native vlan vlan-id", desc: "Changes the untagged 802.1Q native VLAN on a trunk interface from the default of VLAN 1", mode: "interface" },
      { cmd: "switchport trunk allowed vlan {vlan-list | add | remove | except | all}", desc: "Restricts or modifies the list of VLANs permitted to cross a trunk interface", mode: "interface" },
      { cmd: "vtp mode {server | client | transparent | off}", desc: "Configures the VLAN Trunking Protocol (VTP) operating mode on the switch", mode: "global" },
      { cmd: "show vlan brief", desc: "Displays all known VLANs, their status (active, act/lshut, act/unsup), and assigned access ports", mode: "user" },
      { cmd: "show vlan id vlan-id", desc: "Displays detailed status and all assigned access AND operational trunk ports for a specific VLAN", mode: "user" },
      { cmd: "show interfaces interface-id switchport", desc: "Displays administrative and operational trunking modes, encapsulations, access VLAN, native VLAN, and voice VLAN", mode: "user" },
      { cmd: "show interfaces [interface-id] trunk", desc: "Displays operational trunks, native VLAN, and the three progressive lists of allowed/active/forwarding VLANs", mode: "user" },
      { cmd: "show vtp status", desc: "Displays VTP mode, domain name, version, and configuration revision number", mode: "user" }
    ],
    tips: [
      "Remember that show vlan brief ONLY lists access ports—it never lists operational trunk ports! In contrast, show vlan id <x> lists both access ports and active trunk ports carrying VLAN x.",
      "Memorize the DTP combination table: Auto + Auto = Access; Auto + Desirable = Trunk; Desirable + Desirable = Trunk; Trunk + Auto/Desirable = Trunk (unless switchport nonegotiate is used!).",
      "Be very careful with switchport trunk allowed vlan: using switchport trunk allowed vlan 10 without the 'add' keyword overwrites the entire allowed list so ONLY VLAN 10 is allowed!",
      "Learn the three lists in show interfaces trunk in order: List 1 = Allowed by config; List 2 = Allowed AND exists/active (not shutdown); List 3 = List 2 AND STP forwarding (not blocked/pruned)."
    ]
  },
  {
    id: "v1c09",
    volume: 1,
    chapter: 9,
    title: "Spanning Tree Protocol Concepts",
    domain: "Network Access",
    pages: "210-237",
    examTopics: [
      "2.4 Configure and verify (Layer 2/Layer 3) EtherChannel (LACP)",
      "2.5.a Describe root port, root bridge (primary/secondary), and other port names",
      "2.5.b Describe port states (forwarding/blocking)",
      "2.5.c Describe PortFast benefits"
    ],
    summary: "This chapter explains the concepts and operation of IEEE 802.1D Spanning Tree Protocol (STP) and IEEE 802.1w Rapid Spanning Tree Protocol (RSTP). It details the three problems caused by Layer 2 loops (broadcast storms, MAC table instability, and multiple frame delivery), the Spanning Tree Algorithm (root switch election, root port selection, and designated port selection with tiebreakers), IEEE short vs. long port costs, STP timers and transitional states, RSTP port roles (Alternate and Backup), RSTP port types (Edge, Point-to-Point, Shared), and optional features (EtherChannel, PortFast, and BPDU Guard).",
    keyPoints: [
      "Without STP/RSTP in a redundant Layer 2 network, flooded frames loop infinitely, causing three fatal problems: broadcast storms, MAC address table instability, and multiple copies of frames delivered to destination hosts.",
      "The Spanning Tree Algorithm (STA) elects one Root Switch per tree: the switch with the numerically lowest 8-byte Bridge ID (2-byte priority first; if tied, lowest 6-byte burned-in MAC address). All working ports on the Root Switch become Designated Ports (DPs) and forward traffic.",
      "Every nonroot switch selects exactly one Root Port (RP)—the single interface with the lowest total path cost to reach the root switch, calculated by adding the local receiving port's STP cost to the root cost advertised in the incoming Hello BPDU (inbound port costs only; outbound costs are ignored).",
      "If a nonroot switch has a tie for lowest root path cost across multiple paths, it breaks the tie in order: (1) lowest neighbor Bridge ID, (2) lowest neighbor port priority, and (3) lowest neighbor internal port number.",
      "On each LAN segment (collision domain), the switch advertising the lowest root path cost onto that segment becomes the Designated Switch and its port becomes the Designated Port (DP, which forwards); ties are broken by lowest sender Bridge ID (then port priority and port number).",
      "Default Cisco STP port costs (1998 IEEE 802.1D short method, based on current operating speed, not max speed): 10 Mbps = 100, 100 Mbps = 19, 1 Gbps = 4, 10 Gbps = 2. The 2004 IEEE long method (spanning-tree pathcost method long) uses: 10 Mbps = 2,000,000; 100 Mbps = 200,000; 1 Gbps = 20,000; 10 Gbps = 2,000.",
      "In classic 802.1D STP, only the root switch originates Hello BPDUs (every 2 seconds by default) and nonroot switches relay them out DPs; timers are Hello (2s), MaxAge (20s = 10x Hello), and Forward Delay (15s), which can cause up to 50 seconds of convergence delay (20s MaxAge + 15s Listening + 15s Learning).",
      "Classic STP has five port states: Blocking (stable, no forwarding/learning), Listening (transitory 15s, no forwarding/learning, times out stale MAC entries), Learning (transitory 15s, learns MACs but does not forward), Forwarding (stable, learns and forwards), and Disabled.",
      "IEEE 802.1w RSTP uses the same election rules for Root Switch, RP, and DP, but merges Blocking and Disabled into the Discarding state, eliminates Listening, keeps Learning and Forwarding, generates Hellos independently on every switch, and uses a shorter MaxAge (3x Hello = 6 seconds).",
      "RSTP adds two discarding port roles for instant timer-free failover: an Alternate port (receives useful BPDUs from another switch and backs up the Root Port) and a Backup port (receives BPDUs from the same local switch on a shared hub segment and backs up a Designated Port).",
      "RSTP classifies links into three port types: Point-to-Point (full-duplex link between two switches, enabling fast proposal/agreement convergence), Point-to-Point Edge (PortFast-enabled access port to an endpoint), and Shared (half-duplex link connected to a hub, which converges slowly).",
      "PortFast allows access ports connected to end-user devices to bypass Listening and Learning and transition immediately to Forwarding; BPDU Guard protects PortFast ports (and the root election) by placing a port into err-disabled if any BPDU arrives on it."
    ],
    keyTerms: [
      { term: "Broadcast Storm", def: "The continuous looping of broadcast, multicast, or unknown unicast frames around a redundant LAN without STP, saturating link bandwidth." },
      { term: "MAC Table Instability", def: "Continual flapping of a switch's MAC address table entries as copies of looping frames with the same source MAC arrive on different ports." },
      { term: "Bridge ID (BID)", def: "The unique 8-byte identifier of a switch in STP/RSTP, composed of a 2-byte priority field followed by a 6-byte system ID (MAC address)." },
      { term: "Bridge Protocol Data Unit (BPDU)", def: "Control messages (most commonly Hello BPDUs) exchanged between switches to elect the root switch and determine STP port roles." },
      { term: "Root Switch (Root Bridge)", def: "The single switch elected with the lowest numeric Bridge ID that serves as the logical center of the spanning tree, with a root cost of 0." },
      { term: "Root Port (RP)", def: "On each nonroot switch, the single port that offers the lowest cumulative STP cost path from that switch to the root switch." },
      { term: "Designated Port (DP)", def: "On each LAN segment, the switch port that advertises the lowest root path cost onto that segment and is placed in the forwarding state." },
      { term: "Alternate Port", def: "An RSTP port role (in Discarding state) that provides an alternate path to the root switch via another switch and immediately replaces the Root Port if it fails." },
      { term: "Backup Port", def: "An RSTP port role (in Discarding state) on a shared hub segment where two ports on the same switch connect to the same collision domain, backing up the Designated Port." },
      { term: "Discarding State", def: "The RSTP port state that replaces both Blocking and Disabled from 802.1D STP; the port neither forwards user frames nor learns MAC addresses." },
      { term: "PortFast", def: "An STP/RSTP feature enabled on access (edge) ports connected to end hosts that immediately transitions the port to Forwarding when the link comes up." },
      { term: "BPDU Guard", def: "A security feature that immediately places a switch port into the err-disabled state if it receives an STP/RSTP BPDU." }
    ],
    commands: [
      { cmd: "show spanning-tree", desc: "Displays STP/RSTP root bridge ID, local bridge ID, timers, and port roles/states across all active VLANs", mode: "user" },
      { cmd: "show spanning-tree vlan vlan-id", desc: "Displays STP/RSTP topology details and interface states for one specific VLAN", mode: "user" },
      { cmd: "spanning-tree pathcost method long", desc: "Configures the switch to use 32-bit IEEE 2004 default port costs (e.g., 1 Gbps = 20,000)", mode: "global" },
      { cmd: "spanning-tree portfast", desc: "Enables PortFast (RSTP edge port behavior) on an access interface so it transitions immediately to forwarding", mode: "interface" },
      { cmd: "spanning-tree bpduguard enable", desc: "Enables BPDU Guard on an interface, placing it into err-disabled if a BPDU is received", mode: "interface" },
      { cmd: "spanning-tree portfast default", desc: "Globally enables PortFast on all nontrunking access ports", mode: "global" },
      { cmd: "spanning-tree portfast bpduguard default", desc: "Globally enables BPDU Guard on all PortFast-enabled ports", mode: "global" },
      { cmd: "spanning-tree cost cost", desc: "Manually sets the STP/RSTP port cost on an interface", mode: "interface" }
    ],
    tips: [
      "In STP/RSTP, LOWEST always wins: lowest Bridge ID becomes Root Switch; lowest root path cost becomes Root Port; lowest advertised cost on a segment becomes Designated Port; lowest neighbor BID -> lowest neighbor port priority -> lowest neighbor port number breaks ties!",
      "Memorize the 1998 IEEE default port costs cold: 10 Mbps = 100, 100 Mbps = 19, 1 Gbps = 4, 10 Gbps = 2. Remember that cost is based on current OPERATING speed, not maximum port capability!",
      "Don't confuse Alternate and Backup ports in RSTP: Alternate = backup to the Root Port (two paths to the root via different switches); Backup = backup to a Designated Port (two ports on the same switch plugged into a shared hub).",
      "Know what happens in each STP state: Blocking/Listening/Discarding do NOT learn MACs and do NOT forward data; Learning learns MACs but does NOT forward data; Forwarding BOTH learns MACs and forwards data."
    ]
  },
  {
    id: "v1c10",
    volume: 1,
    chapter: 10,
    title: "RSTP and EtherChannel Configuration",
    domain: "Network Access",
    pages: "238-259",
    examTopics: [
      "2.4 Configure and verify (Layer 2/Layer 3) EtherChannel (LACP)",
      "2.5.a Identify root port, root bridge (primary/secondary), and other port names",
      "2.5.b Identify port states (forwarding/blocking)",
      "2.5.c Identify PortFast benefits"
    ],
    summary: "This chapter covers configuring Cisco Rapid PVST+ (RPVST+) and Layer 2 EtherChannels. It explains per-VLAN spanning tree load balancing, the 16-bit Bridge ID priority split into a 4-bit priority (increments of 4096) and 12-bit System ID Extension (VLAN ID), root primary/secondary macros, and how RPVST+ differs from standard 802.1w RSTP. It then details configuring manual (on), PAgP (desirable/auto), and LACP (active/passive) Layer 2 EtherChannels, physical port compatibility requirements, and EtherChannel load distribution hashing.",
    keyPoints: [
      "Cisco Catalyst switches support three STP modes (spanning-tree mode): pvst (Cisco PVST+, 802.1D per VLAN), rapid-pvst (Cisco Rapid PVST+, 802.1w per VLAN; modern default), and mst (IEEE 802.1s Multiple Spanning Tree).",
      "To avoid allocating a separate MAC address per VLAN, the 2-byte (16-bit) STP Priority field is split into a 4-bit configurable priority (0 to 61,440 in increments of 4096; default 32,768) and a 12-bit System ID Extension that holds the VLAN ID (so VLAN 9 with default priority displays as 32,768 + 9 = 32,777).",
      "The command spanning-tree vlan <x> root primary sets the switch's base priority to 24,576 (or 4096 less than the current root's base priority if the current root is already <= 24,576); spanning-tree vlan <x> root secondary always sets the base priority to 28,672. Both macros write a static spanning-tree vlan <x> priority <value> line into running-config.",
      "Cisco RPVST+ differs from IEEE 802.1w RSTP by creating one tree per VLAN, sending BPDUs per VLAN to Cisco multicast MAC 0100.0CCC.CCCD (vs. IEEE 0180.C200.0000), tagging BPDUs with 802.1Q on trunks, adding a VLAN TLV to the BPDU, and placing the VLAN ID in the 12-bit System ID Extension.",
      "A Layer 2 EtherChannel (also referred to as a PortChannel or Channel-group) bundles up to 8 active parallel physical links between two switches into one logical interface (Port-channel <n> or Po<n>) so STP treats the bundle as a single link and does not block redundant member links.",
      "EtherChannel can be configured in three ways using channel-group <n> mode <keyword>: Manual (on + on, no negotiation protocol), Cisco-proprietary PAgP (desirable + desirable, or desirable + auto; max 8 links), or IEEE 802.3ad LACP (active + active, or active + passive; up to 16 links with 8 active and 8 hot-standby).",
      "The channel-group number <n> is locally significant to each switch (SW1 can use channel-group 1 while SW2 uses channel-group 2 on the same link), and creates logical interface Port-channel <n>.",
      "Mixing mode on with any dynamic mode (active/passive/desirable/auto), or pairing passive + passive or auto + auto, prevents the EtherChannel from forming.",
      "All physical member ports in a Layer 2 EtherChannel must have identical settings on the local switch and (except STP settings) on the neighbor: speed, duplex, access vs. trunk mode, access VLAN (if access), allowed VLAN list and native VLAN (if trunk), and local STP port settings.",
      "If physical ports in an EtherChannel have mismatched STP costs, IOS detects a channel-misconfig (STP) error and places the member ports and PortChannel into the err-disabled state (shown as Po1(SD) and Gi0/1(D) in show etherchannel summary).",
      "In show etherchannel summary, flag S means Layer 2 (R = Layer 3), U means in use (D = down), P on a member port means bundled in port-channel, I means stand-alone, and s means suspended.",
      "EtherChannel load distribution (port-channel load-balance <method>) hashes low-order bits of header fields (such as src-mac, dst-mac, src-dst-mac, src-ip, dst-ip, src-dst-ip, or L4 ports) so all frames in a single application flow traverse the same physical link, preventing packet reordering."
    ],
    keyTerms: [
      { term: "Rapid PVST+ (RPVST+)", def: "Cisco's per-VLAN implementation of IEEE 802.1w RSTP (configured with spanning-tree mode rapid-pvst) that runs a separate RSTP instance for each VLAN." },
      { term: "System ID Extension", def: "The low-order 12 bits of the 16-bit STP Bridge ID priority field, used to carry the VLAN ID and force base priorities to be multiples of 4096." },
      { term: "Port Aggregation Protocol (PAgP)", def: "A Cisco-proprietary EtherChannel negotiation protocol configured with the desirable and auto keywords (supporting up to 8 links)." },
      { term: "Link Aggregation Control Protocol (LACP)", def: "The IEEE 802.3ad standard EtherChannel negotiation protocol configured with the active and passive keywords (supporting up to 8 active and 8 standby links)." },
      { term: "PortChannel", def: "The logical virtual interface (e.g., Port-channel1 or Po1) created automatically when physical ports are assigned to a channel-group." },
      { term: "EtherChannel Load Distribution", def: "The hardware ASIC hashing algorithm that selects which physical member link forwards each frame based on configured L2, L3, or L4 header fields." },
      { term: "Layer 3 EtherChannel", def: "A routed PortChannel bundle configured with 'no switchport' and an IPv4/IPv6 address directly on the Port-channel logical interface." },
      { term: "channel-misconfig (STP) Guard", def: "A Cisco IOS safety check that err-disables member ports and the PortChannel when inconsistent STP parameters are detected across member links." }
    ],
    commands: [
      { cmd: "spanning-tree mode {pvst | rapid-pvst | mst}", desc: "Configures the Spanning Tree Protocol mode on the switch", mode: "global" },
      { cmd: "spanning-tree vlan vlan-id priority priority", desc: "Sets the switch's base STP priority (0 to 61440 in increments of 4096) for the specified VLAN", mode: "global" },
      { cmd: "spanning-tree vlan vlan-id root primary", desc: "Macro that sets the switch's priority to 24576 (or 4096 below the current root) to make it root for the VLAN", mode: "global" },
      { cmd: "spanning-tree vlan vlan-id root secondary", desc: "Macro that sets the switch's base STP priority to 28672 so it becomes backup root for the VLAN", mode: "global" },
      { cmd: "spanning-tree [vlan vlan-id] cost cost", desc: "Configures the STP/RSTP port cost on an interface (globally or per VLAN)", mode: "interface" },
      { cmd: "spanning-tree [vlan vlan-id] port-priority priority", desc: "Configures the STP port priority (0 to 240 in increments of 16; default 128) on an interface", mode: "interface" },
      { cmd: "channel-group number mode {on | active | passive | desirable | auto}", desc: "Assigns a physical interface to an EtherChannel bundle using manual, LACP, or PAgP mode", mode: "interface" },
      { cmd: "port-channel load-balance method", desc: "Configures the header-field hashing method (e.g., src-mac, src-dst-ip) used for EtherChannel load distribution", mode: "global" },
      { cmd: "show etherchannel [number] summary", desc: "Displays a concise summary of PortChannels, negotiation protocol, status flags (SU/SD), and member port states (P/D/I)", mode: "user" },
      { cmd: "show etherchannel [number] port-channel", desc: "Displays detailed status of the PortChannel logical interface, protocol (LACP/PAgP/-), and member ports", mode: "user" },
      { cmd: "show etherchannel load-balance", desc: "Displays the currently configured EtherChannel load-balancing hashing method", mode: "user" },
      { cmd: "test etherchannel load-balance interface po-number {mac | ip} src dst", desc: "Simulates and displays which physical member port would be chosen to forward a frame with the given addresses", mode: "privileged" }
    ],
    tips: [
      "Always decompose a Bridge ID priority from show spanning-tree by subtracting the VLAN ID! For example, Priority 24585 in VLAN 9 means configured base priority = 24585 - 9 = 24576 (which is 6 * 4096, or the default root primary value).",
      "Memorize the EtherChannel mode keywords and protocols: LACP = active (initiates) / passive (waits); PAgP = desirable (initiates) / auto (waits); Manual = on (no protocol). Never mix 'on' with LACP or PAgP!",
      "Decode show etherchannel summary flags instantly: S = Layer 2, R = Layer 3, U = In Use (up), D = Down; for member ports, P = Bundled (working), D = Down, I = Stand-alone, s = Suspended.",
      "Remember that channel-group numbers are locally significant (SW1 Po1 can bundle with SW2 Po2), but all member ports on both switches must match speed, duplex, trunk/access mode, native VLAN, and allowed VLANs."
    ]
  }
];
