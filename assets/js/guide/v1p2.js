export default [
  {
    id: "v1c11",
    volume: 1,
    chapter: 11,
    title: "Perspectives on IPv4 Subnetting",
    domain: "Network Fundamentals",
    pages: "264-287",
    examTopics: [
      "1.6 Configure and verify IPv4 addressing and subnetting",
      "1.7 Describe the need for private IPv4 addressing"
    ],
    summary: "This chapter introduces the end-to-end design and planning workflow for IPv4 subnetting. It explains how engineers determine the required number of subnets and hosts per subnet, compare single-mask designs against Variable-Length Subnet Masking (VLSM), select between public and RFC 1918 private networks, borrow host bits to form a subnet mask, and plan static versus DHCP address ranges.",
    keyPoints: [
      "Subnetting subdivides a single large Class A, B, or C IPv4 network into smaller, consecutive groups of addresses called subnets so routing works efficiently across LANs and WANs.",
      "Addresses in the same subnet are not separated by a router, whereas addresses in different subnets are separated by at least one router (or Layer 3 switch routing function).",
      "When counting required subnets from a topology, plan for one subnet per VLAN, one subnet per point-to-point serial link, and one subnet per Ethernet WAN link.",
      "When counting required hosts per subnet, remember to include end-user devices, servers, router interface IP addresses (default gateways), and switch management IP addresses.",
      "With H host bits defined by the subnet mask, a subnet contains 2^H total numbers, but only 2^H - 2 are usable host addresses because the lowest value (subnet ID) and highest value (subnet broadcast address) are reserved.",
      "A single-size subnet design uses one subnet mask across the entire classful network, maximizing operational simplicity at the expense of wasted IP addresses on smaller LANs and two-host WAN links.",
      "Variable-Length Subnet Masking (VLSM) uses multiple subnet masks within the same classful network (such as /24 on LANs and /30 on point-to-point WANs) to conserve address space.",
      "To prevent public IPv4 address exhaustion in the 1990s, the Internet community introduced CIDR (allocating smaller public blocks), NAT with RFC 1918 private networks (reusing internal addresses), and IPv6 (128-bit addresses).",
      "RFC 1918 defines three private IPv4 address blocks: 1 Class A network (10.0.0.0), 16 Class B networks (172.16.0.0 through 172.31.0.0), and 256 Class C networks (192.168.0.0 through 192.168.255.0).",
      "In a classful subnetting design, the network part (N bits: 8 for Class A, 16 for Class B, 24 for Class C) is locked; the engineer borrows S subnet bits from the original host field, leaving H host bits such that N + S + H = 32.",
      "When a single mask is used across a classful network, the mask must satisfy both 2^S >= required subnets and 2^H - 2 >= required hosts in the largest subnet.",
      "During implementation planning, engineers typically assign static IPv4 addresses (routers, switches, servers, printers) from one end of a subnet's usable range and configure the DHCP pool at the opposite end."
    ],
    keyTerms: [
      { term: "Subnet", def: "A subdivided portion of a Class A, B, or C IPv4 network containing consecutive IP addresses that share the same prefix bits." },
      { term: "Classful IP Network", def: "An unsubnetted Class A, B, or C IPv4 network whose network field size (8, 16, or 24 bits) is determined by the first octet." },
      { term: "Subnet ID (Subnet Number)", def: "The numerically lowest number in a subnet (all host bits set to binary 0), reserved to identify the subnet itself." },
      { term: "Subnet Broadcast Address", def: "The numerically highest number in a subnet (all host bits set to binary 1), reserved for sending packets to all hosts in that subnet." },
      { term: "Variable-Length Subnet Masks (VLSM)", def: "The use of more than one subnet mask in different subnets of the same Class A, B, or C network to reduce wasted host addresses." },
      { term: "Public IP Network", def: "A globally unique IPv4 network block assigned by an Internet registry (RIR/IANA) so packets can be routed across the public Internet." },
      { term: "Private IP Network (RFC 1918)", def: "Reserved IPv4 networks (10.0.0.0/8, 172.16.0.0–172.31.0.0, 192.168.0.0–192.168.255.0) reusable inside enterprise networks behind NAT." },
      { term: "Network Address Translation (NAT)", def: "A mechanism that translates private internal IPv4 addresses into public IPv4 addresses when packets traverse the Internet edge." },
      { term: "Network Part (N)", def: "The leading 8, 16, or 24 bits of a classful IPv4 address fixed by its Class A, B, or C assignment." },
      { term: "Subnet Part (S)", def: "The middle bits borrowed from the original host field to uniquely number individual subnets within a classful network." },
      { term: "Host Part (H)", def: "The trailing bits of an IPv4 address (corresponding to binary 0s in the subnet mask) used to uniquely number hosts within a subnet." },
      { term: "Subnet Mask", def: "A 32-bit value with contiguous binary 1s on the left (prefix) and contiguous binary 0s on the right (host) that defines subnet structure." }
    ],
    commands: [],
    tips: [
      "Always count one subnet per VLAN (not per switch!) plus one subnet per point-to-point WAN link when totaling required subnets.",
      "Do not forget to subtract 2 for usable hosts per subnet (2^H - 2), whereas the number of subnets uses 2^S with no subtraction.",
      "Watch RFC 1918 boundaries carefully on the exam: 172.16.0.0 through 172.31.255.255 is private, so 172.15.x.x and 172.32.x.x are PUBLIC!",
      "In a single-mask design, size H based on the LARGEST subnet in the enterprise, and check that N + S + H equals 32.",
      "Grouping contiguous subnet blocks by geographic region or site during implementation planning makes future route summarization much easier."
    ]
  },
  {
    id: "v1c12",
    volume: 1,
    chapter: 12,
    title: "Analyzing Classful IPv4 Networks",
    domain: "Network Fundamentals",
    pages: "288-300",
    examTopics: [
      "1.6 Configure and verify IPv4 addressing and subnetting"
    ],
    summary: "This chapter details the rules and numeric properties of classful IPv4 networks (Classes A, B, C, D, and E). It teaches how to inspect any IPv4 address's first octet to determine its class, default mask, network and host octet counts, usable host capacity, classful network ID, network broadcast address, and usable host address range.",
    keyPoints: [
      "IPv4 defines five address classes based on the first octet: Class A (1–126), Class B (128–191), and Class C (192–223) are unicast; Class D (224–239) is multicast; Class E (240–255) is reserved/experimental.",
      "First-octet values 0 (0.0.0.0/8, originally reserved for broadcasting/default routing) and 127 (127.0.0.0/8, reserved for local loopback software testing such as 127.0.0.1) are excluded from Class A.",
      "Class A has 2^7 - 2 = 126 networks (1.0.0.0 to 126.0.0.0), each with 1 network octet (8 bits), 3 host octets (24 bits), default mask 255.0.0.0, and 2^24 - 2 = 16,777,214 usable hosts.",
      "Class B has 2^14 = 16,384 networks (128.0.0.0 to 191.255.0.0), each with 2 network octets (16 bits), 2 host octets (16 bits), default mask 255.255.0.0, and 2^16 - 2 = 65,534 usable hosts.",
      "Class C has 2^21 = 2,097,152 networks (192.0.0.0 to 223.255.255.0), each with 3 network octets (24 bits), 1 host octet (8 bits), default mask 255.255.255.0, and 2^8 - 2 = 254 usable hosts.",
      "All IPv4 addresses within an unsubnetted classful network have identical values in their network octets and distinct values in their host octets.",
      "To find the classful network ID from any IPv4 address, keep the network octets (1 for A, 2 for B, 3 for C) unchanged and set all host octets to decimal 0.",
      "To find the classful network broadcast address, keep the network octets unchanged and set all host octets to decimal 255.",
      "The first usable host IPv4 address is found by adding 1 to the fourth octet of the network ID; the last usable host IPv4 address is found by subtracting 1 from the fourth octet of the broadcast address.",
      "Boundary network numbers such as 128.0.0.0 (Class B), 191.255.0.0 (Class B), 192.0.0.0 (Class C), and 223.255.255.0 (Class C) can look deceptive because of extra 0s or 255s in the network octets—always trust the first octet."
    ],
    keyTerms: [
      { term: "Unicast Address", def: "An IPv4 address (Classes A, B, and C) that identifies a single unique host interface." },
      { term: "Multicast Address (Class D)", def: "An IPv4 address in the range 224.0.0.0 to 239.255.255.255 used to deliver a single packet to a subscribed group of hosts." },
      { term: "Class E Address", def: "An IPv4 address with a first octet of 240 through 255 reserved for future or experimental use." },
      { term: "Loopback Address (127.0.0.1)", def: "A special reserved address in the 127.0.0.0/8 range used to test a host's own local TCP/IP stack without sending frames on a link." },
      { term: "Default Mask", def: "The implicit mask of an unsubnetted classful network: 255.0.0.0 (/8) for Class A, 255.255.0.0 (/16) for Class B, and 255.255.255.0 (/24) for Class C." },
      { term: "Network ID (Network Number)", def: "The numerically lowest address in an unsubnetted classful network, formed by setting all host octets to 0." },
      { term: "Network Broadcast Address", def: "The numerically highest address in an unsubnetted classful network, formed by setting all host octets to 255." },
      { term: "Prefix (Network Part)", def: "The leading portion of an IPv4 address that is identical across all addresses in the same network." },
      { term: "Host Part", def: "The trailing octets of an unsubnetted classful IPv4 address (3 octets for Class A, 2 for B, 1 for C) that uniquely identify hosts." },
      { term: "First Octet Rule", def: "The classification rule that determines an IPv4 address's class (A: 1–126, B: 128–191, C: 192–223) strictly from its first decimal octet." }
    ],
    commands: [],
    tips: [
      "Commit the first-octet numbers to instant recall: A = 1–126, B = 128–191, C = 192–223, D = 224–239, E = 240–255 (127 = loopback, 0 = reserved).",
      "Never assume trailing zeros mean Class A or trailing 255s mean a Class A broadcast: 192.0.0.0 is a Class C network whose broadcast is 192.0.0.255!",
      "Similarly, 191.255.0.0 is a valid Class B network ID (even with 255 in the second octet), and its broadcast is 191.255.255.255.",
      "When finding the broadcast address, do NOT 'change all 0s in the network ID to 255s'—only change the HOST octets to 255."
    ]
  },
  {
    id: "v1c13",
    volume: 1,
    chapter: 13,
    title: "Analyzing Subnet Masks",
    domain: "Network Fundamentals",
    pages: "302-318",
    examTopics: [
      "1.6 Configure and verify IPv4 addressing and subnetting"
    ],
    summary: "This chapter covers converting IPv4 subnet masks between binary, dotted-decimal notation (DDN), and prefix (/P) formats, and explains how to analyze an address and mask pair under both classless (prefix + host) and classful (network + subnet + host) rules to determine the number of subnets and usable hosts per subnet.",
    keyPoints: [
      "A 32-bit binary subnet mask must contain an unbroken string of binary 1s on the left followed by an unbroken string of binary 0s on the right; interleaving 1s and 0s is illegal.",
      "Because binary 1s and 0s cannot interleave, any single octet of a dotted-decimal subnet mask can only be one of nine decimal values: 0, 128, 192, 224, 240, 248, 252, 254, or 255.",
      "Prefix (CIDR or slash) notation writes `/` followed by the count of binary 1s in the 32-bit mask (from /0 through /32, for 33 possible legal masks).",
      "To convert between prefix (/P) and DDN formats quickly, express the prefix as the count of 1s in each of the four octets (for example, /18 = 8 + 8 + 2 + 0 -> 255.255.192.0).",
      "The subnet mask divides every address in a subnet into two parts (classless view): the prefix part (P bits where mask = 1, equal in all addresses in the subnet) and the host part (H bits where mask = 0, unique per host).",
      "Combining the subnet mask with Class A, B, and C rules divides an address into three parts (classful view): Network (N = 8, 16, or 24 bits), Subnet (S = P - N bits), and Host (H = 32 - P bits).",
      "Regardless of whether you use the two-part classless view (P + H = 32) or the three-part classful view (N + S + H = 32), the host field size H is identical (H = 32 - P).",
      "The number of usable host IPv4 addresses in any subnet is always 2^H - 2, which depends only on the mask (/P) and never on the address class.",
      "Assuming a single subnet mask is used across the entire classful network, the number of subnets created in that network is 2^S, where S = P - N.",
      "If P equals N (for example, a Class C address with a /24 mask), then S = 0, meaning the default mask is in use and the classful network has not been subnetted."
    ],
    keyTerms: [
      { term: "Binary Mask", def: "A 32-bit representation of a subnet mask consisting of P contiguous binary 1s on the left and 32 - P binary 0s on the right." },
      { term: "Dotted-Decimal Notation (DDN) Mask", def: "A subnet mask written as four decimal numbers (0–255) separated by periods, each representing one 8-bit octet." },
      { term: "Prefix Mask (CIDR / Slash Mask)", def: "A concise mask format written as `/P`, where P is the total number of binary 1s in the 32-bit subnet mask." },
      { term: "Classless Addressing", def: "Viewing an IPv4 address as having two parts—prefix (P) and host (H)—defined solely by the mask while ignoring Class A, B, and C rules." },
      { term: "Classful Addressing", def: "Viewing an IPv4 address as having three parts—network (N), subnet (S), and host (H)—defined by both the mask and Class A, B, and C rules." },
      { term: "Prefix Part (P)", def: "The combined network and subnet bits (P = N + S) corresponding to the contiguous binary 1s in the subnet mask." },
      { term: "Network Bits (N)", def: "The number of bits in the classful network field (8 for Class A, 16 for Class B, or 24 for Class C)." },
      { term: "Subnet Bits (S)", def: "The number of bits borrowed from the default host field to create subnets, calculated as S = P - N." },
      { term: "Host Bits (H)", def: "The number of binary 0s on the right side of the subnet mask, calculated as H = 32 - P." },
      { term: "Default Subnet Mask", def: "The unsubnetted classful mask (/8 for Class A, /16 for Class B, /24 for Class C) where S = 0 subnet bits are borrowed." }
    ],
    commands: [],
    tips: [
      "Memorize the 9 legal mask octet values and their count of 1s: 0(0), 128(1), 192(2), 224(3), 240(4), 248(5), 252(6), 254(7), 255(8).",
      "Any other decimal number in a mask octet (such as 244, 200, or 160) is immediately an invalid subnet mask.",
      "Remember that `classless` vs `classful` has three distinct contexts in networking: addressing (2-part vs 3-part), routing protocols, and router forwarding behavior.",
      "A /30 mask (255.255.255.252) leaves H = 2 host bits (2^2 - 2 = 2 hosts) and is the classic choice for point-to-point WAN links."
    ]
  },
  {
    id: "v1c14",
    volume: 1,
    chapter: 14,
    title: "Analyzing Existing Subnets",
    domain: "Network Fundamentals",
    pages: "320-342",
    examTopics: [
      "1.6 Configure and verify IPv4 addressing and subnetting"
    ],
    summary: "This chapter teaches both binary and fast decimal methods for taking any given IPv4 address and subnet mask and calculating its resident subnet ID, subnet broadcast address, and range of usable unicast IPv4 addresses—a core operational skill for reading routing tables and troubleshooting IPv4 networks.",
    keyPoints: [
      "Every subnet is defined by four boundary numbers: the subnet ID (lowest value, all host bits 0), first usable IP (subnet ID + 1), last usable IP (broadcast - 1), and subnet broadcast address (highest value, all host bits 1).",
      "The subnet ID (also called resident subnet, subnet number, subnet address, or prefix) paired with its mask succinctly represents the subnet in `show ip route` outputs and network diagrams.",
      "In the binary method, convert the IPv4 address to binary, copy the first P prefix bits, and set all 32 - P host bits to 0 (for the subnet ID) or to 1 (for the subnet broadcast), then convert back to decimal 8 bits at a time.",
      "Computers calculate the subnet ID by performing a bitwise Boolean AND of the IPv4 address and subnet mask, and calculate the broadcast address via a bitwise Boolean OR of the IPv4 address and the inverted mask.",
      "Three 'easy masks' (255.0.0.0, 255.255.0.0, and 255.255.255.0) contain only 255s and 0s: where the mask octet is 255, copy the IP octet; where the mask octet is 0, write 0 for the subnet ID or 255 for the broadcast address.",
      "With 'difficult masks' (any mask other than /8, /16, /24), exactly one octet has a mask value that is neither 255 nor 0; this octet is called the 'interesting octet'.",
      "In the decimal method, calculate the 'magic number' in the interesting octet as `256 - mask`. All subnet IDs in that octet are multiples of the magic number starting at 0 (0, M, 2M, 3M, ...).",
      "To find the resident subnet ID in the interesting octet, pick the multiple of the magic number that is closest to the IP address's value in that octet without going over (less than or equal to the IP octet).",
      "To find the subnet broadcast address in the interesting octet, take the subnet ID's value in that octet, add the magic number, and subtract 1 (`ID + magic - 1`), while setting any trailing octets (where mask = 0) to 255.",
      "Once the subnet ID and subnet broadcast address are known, always add 1 to the FOURTH octet of the subnet ID for the first usable host IP and subtract 1 from the FOURTH octet of the broadcast address for the last usable host IP."
    ],
    keyTerms: [
      { term: "Resident Subnet", def: "The specific subnet (identified by its subnet ID) in which a given IPv4 address resides." },
      { term: "Directed Broadcast Address", def: "Another term for the subnet broadcast address—the highest numeric value in a subnet, used to send a packet to all hosts in that subnet." },
      { term: "Easy Mask", def: "One of the three subnet masks (255.0.0.0, 255.255.0.0, 255.255.255.0) whose octets consist exclusively of 255 and 0." },
      { term: "Difficult Mask", def: "Any subnet mask that contains one octet whose decimal value is neither 255 nor 0 (i.e., 128, 192, 224, 240, 248, 252, or 254)." },
      { term: "Interesting Octet", def: "The single octet in a difficult mask whose decimal mask value is neither 255 nor 0, where the prefix/host boundary falls inside the octet." },
      { term: "Magic Number", def: "The decimal block size (`256 - mask` in the interesting octet) by which consecutive subnet IDs increment in that octet." },
      { term: "Boolean AND", def: "A bitwise operation (1 AND 1 = 1; all other combinations = 0) used by devices to mask off host bits and compute the subnet ID." },
      { term: "Zero Subnet", def: "The first subnet of a classful network, whose subnet bits are all binary 0s and whose subnet ID equals the classful network ID." },
      { term: "Broadcast Subnet", def: "The numerically highest subnet of a classful network, whose subnet bits are all binary 1s and whose broadcast address equals the classful network broadcast address." },
      { term: "Usable Host Address Range", def: "The consecutive unicast IPv4 addresses between the subnet ID + 1 (first usable) and the subnet broadcast address - 1 (last usable)." }
    ],
    commands: [
      { cmd: "show ip route", desc: "Displays the router's IPv4 routing table, listing subnet IDs (prefixes) and masks", mode: "privileged" }
    ],
    tips: [
      "When counting multiples of the magic number (0, M, 2M, ...), if the IP address octet equals an exact multiple of M, that exact multiple IS the subnet ID (do not drop to the previous multiple!).",
      "When the interesting octet is the 2nd or 3rd octet, do NOT add 1 or subtract 1 in the interesting octet to find the usable host range—always add 1 to the 4th octet of the ID and subtract 1 from the 4th octet of the broadcast!",
      "In a /23 (magic=2 in 3rd octet) or /22 (magic=4 in 3rd octet) subnet, addresses ending in `.0` or `.255` in the middle of the range (like `10.1.4.255` and `10.1.5.0` inside `10.1.4.0/23`) are valid usable host addresses!",
      "Quick magic number table for prefixes: /9,/17,/25 -> 128; /10,/18,/26 -> 64; /11,/19,/27 -> 32; /12,/20,/28 -> 16; /13,/21,/29 -> 8; /14,/22,/30 -> 4; /15,/23 -> 2."
    ]
  },
  {
    id: "v1c15",
    volume: 1,
    chapter: 15,
    title: "Operating Cisco Routers",
    domain: "IP Connectivity",
    pages: "348-364",
    examTopics: [
      "1.1.a Explain the role and function of network components: Routers",
      "1.2.e Describe characteristics of network topology architectures: Small office/home office (SOHO)",
      "1.6 Configure and verify IPv4 addressing and subnetting"
    ],
    summary: "This chapter covers the physical installation, hardware interfaces, and CLI operation of Cisco enterprise routers (Integrated Services Routers) and SOHO routers. It compares the router CLI to the Catalyst switch CLI, explains how to configure and enable IPv4 addresses on router interfaces, and details how to interpret Layer 1 line status and Layer 2 protocol status codes.",
    keyPoints: [
      "Enterprise routers (such as the Cisco 4321 ISR) often provide built-in Gigabit Ethernet ports, modular Network Interface Module (NIM) slots for WAN cards, RJ-45 and USB console ports, an Auxiliary (Aux) port, and a physical power on/off switch.",
      "Some ISR Ethernet interfaces (such as Gi0/0 on a 4321) provide both an RJ-45 copper port and an SFP fiber cage for the same logical interface; you can use one or the other at a time, but not both simultaneously.",
      "Serial WAN links terminate at a CSU/DSU, which can be either an external standalone box (connected to the router via a serial cable) or an internal card integrated into the router's serial interface (using an RJ-48 connector).",
      "SOHO routers typically combine a router, LAN switch, wireless access point, and firewall into one integrated appliance and use consumer broadband (CATV cable or DSL) with VPNs for enterprise WAN access.",
      "Unlike Catalyst switches, Cisco routers have an Auxiliary port (`line aux 0` for dial-in modem access), default to `transport input none` under `line vty` (blocking Telnet/SSH by default), and configure IP addresses on each routed interface rather than a single management VLAN.",
      "Standard Layer 2 switches support `show mac address-table` and `show interfaces status` (which routers do not), whereas routers support `show ip route` (which Layer 2 switches do not).",
      "By default, Cisco router interfaces have no IPv4 address assigned and are administratively disabled (`shutdown`); to route IPv4 packets on an interface, configure `ip address <address> <mask>` and `no shutdown`.",
      "Every router interface reports two status codes: the first is Line Status (Layer 1 physical state) and the second is Protocol Status (Layer 2 data-link state). Both must be `up` (`up/up`) for the interface to forward IPv4 packets.",
      "`administratively down / down` means the `shutdown` command is configured on the interface; `down / down` means the interface is enabled (`no shutdown`) but has a Layer 1 physical issue (unplugged cable, neighbor shut down/powered off, or speed mismatch).",
      "`up / down` means Layer 1 is working but Layer 2 has failed, typically due to a data-link encapsulation mismatch (such as PPP on one router and HDLC on the other) or keepalive failure.",
      "`show ip interface brief` displays 1 line per interface with its IPv4 address and line/protocol status (but omits the subnet mask); `show protocols [type num]` displays 1–2 lines per interface including both status and the `/P` subnet mask."
    ],
    keyTerms: [
      { term: "Integrated Services Router (ISR)", def: "Cisco's family of enterprise branch routers that support routing along with modular voice, security, wireless, and switching services." },
      { term: "Network Interface Module (NIM)", def: "A small expansion card installed into a modular slot on a Cisco ISR router to add serial, Ethernet, or other interfaces." },
      { term: "CSU/DSU", def: "Channel Service Unit/Data Service Unit hardware (internal or external to the router) that terminates a digital leased-line serial WAN link." },
      { term: "SOHO Router", def: "A Small Office/Home Office multifunction device integrating routing, switching, wireless, and broadband WAN/VPN connectivity." },
      { term: "Auxiliary (Aux) Port", def: "A physical port on Cisco routers (`line aux 0`) designed to connect to an external dial-up modem for out-of-band CLI administration." },
      { term: "Line Status", def: "The first interface status code in IOS output, indicating whether Layer 1 (physical layer) is functional." },
      { term: "Protocol Status", def: "The second interface status code in IOS output, indicating whether the Layer 2 data-link protocol is operational." },
      { term: "Small Form-Factor Pluggable (SFP)", def: "A hot-swappable optical or copper transceiver inserted into an SFP slot on a router or switch to support fiber-optic Ethernet standards." },
      { term: "Administratively Down", def: "The interface line status indicating that the `shutdown` configuration command is currently applied to the interface." },
      { term: "Dual-Purpose Port (Combo Port)", def: "A single logical router Ethernet interface (such as Gi0/0) providing both an RJ-45 copper connector and an SFP cage, of which only one may be active at a time." }
    ],
    commands: [
      { cmd: "interface type number", desc: "Enters interface configuration mode for the specified router interface (e.g., interface gigabitethernet 0/0)", mode: "global" },
      { cmd: "ip address address mask", desc: "Assigns an IPv4 address and dotted-decimal subnet mask to the interface", mode: "interface" },
      { cmd: "no shutdown", desc: "Administratively enables a router interface (reversing the default shutdown state)", mode: "interface" },
      { cmd: "shutdown", desc: "Administratively disables an interface, placing it into administratively down / down state", mode: "interface" },
      { cmd: "description text", desc: "Attaches an informational text string to document the interface in config and show interfaces output", mode: "interface" },
      { cmd: "speed {10 | 100 | 1000 | auto}", desc: "Configures the transmission speed or enables autonegotiation on a router Ethernet interface", mode: "interface" },
      { cmd: "duplex {full | half | auto}", desc: "Configures duplex mode or autonegotiation on a router Ethernet interface", mode: "interface" },
      { cmd: "line aux 0", desc: "Enters line configuration mode for the router's Auxiliary port", mode: "global" },
      { cmd: "show ip interface brief", desc: "Displays a one-line summary per interface with IPv4 address, method, line status, and protocol status", mode: "privileged" },
      { cmd: "show protocols [type number]", desc: "Displays global routing status and 1–2 lines per interface including line/protocol status and IPv4 address with /P mask", mode: "privileged" },
      { cmd: "show interfaces [type number]", desc: "Displays detailed Layer 1/2 status, MAC/BIA addresses, IPv4 address/mask, MTU, bandwidth, and packet/error counters", mode: "privileged" }
    ],
    tips: [
      "Remember that `show ip interface brief` does NOT show the subnet mask; use `show protocols` or `show interfaces` (or `show running-config`) when you need to verify an interface's mask.",
      "Memorize the four status combinations: `administratively down/down` (`shutdown` configured), `down/down` (Layer 1 problem), `up/down` (Layer 2 encapsulation/keepalive problem), and `up/up` (working).",
      "Router interfaces default to `shutdown` (administratively down), whereas Catalyst switch ports default to `no shutdown` (enabled).",
      "Router vty lines default to `transport input none`, so remote Telnet/SSH into a router fails until `transport input` is explicitly configured."
    ]
  },
  {
    id: "v1c16",
    volume: 1,
    chapter: 16,
    title: "Configuring IPv4 Addresses and Static Routes",
    domain: "IP Connectivity",
    pages: "366-391",
    examTopics: [
      "1.6 Configure and verify IPv4 addressing and subnetting",
      "3.1 Interpret the components of routing table (3.1.a Routing protocol code, 3.1.b Prefix, 3.1.c Network mask, 3.1.d Next hop, 3.1.e Administrative distance, 3.1.f Metric, 3.1.g Gateway of last resort)",
      "3.2 Determine how a router makes a forwarding decision by default (3.2.a Longest match, 3.2.b Administrative distance)",
      "3.3 Configure and verify IPv4 and IPv6 static routing (3.3.a Default route, 3.3.b Network route, 3.3.c Host route, 3.3.d Floating static)"
    ],
    summary: "This chapter details the five-step IPv4 router forwarding process, connected and local routes, the IPv4 ARP table, and all four types of IPv4 static routes (network, host, floating static, and default routes). It also explains how routers select between competing routes using administrative distance and longest prefix match, and how to interpret every field of `show ip route`.",
    keyPoints: [
      "When a host sends an IPv4 packet, it checks whether the destination IP is in its own local subnet: if local, it uses ARP to get the destination host's MAC and sends directly; if remote, it uses ARP to get its default gateway's MAC and sends the frame to the default gateway.",
      "A router forwards each packet in five steps: (1) verify the incoming frame's FCS and destination MAC address, (2) de-encapsulate (strip) the incoming Layer 2 header/trailer, (3) match the destination IPv4 address to the routing table, (4) encapsulate the packet into a new Layer 2 frame (using ARP on Ethernet links), and (5) transmit out the outgoing interface.",
      "When a router interface is `up/up` with an IPv4 address configured, IOS automatically adds two routes to `show ip route`: a connected route (`C`) for the subnet (`/P`) and a local host route (`L`) for the exact interface IP address (`/32`).",
      "The router's IPv4 ARP table (`show ip arp`) maps local subnet IPv4 addresses to MAC addresses; dynamic ARP entries age out after 240 minutes (4 hours) of inactivity and can be cleared with `clear ip arp`.",
      "Static routes are configured with `ip route <prefix> <mask> {<next-hop-ip> | <exit-interface>} [distance] [permanent]`. On multi-access Ethernet links, specifying the `next-hop-ip` is best practice so the router knows which neighbor IP to ARP for.",
      "Four types of static routes are tested on CCNA: network routes (match a subnet or classful network), host routes (use mask `255.255.255.255` `/32` to match one host), default routes (use `0.0.0.0 0.0.0.0` `/0` to match any destination), and floating static routes.",
      "Administrative distance (AD) determines trustworthiness when a router learns routes to the exact same prefix/mask from multiple routing sources (lower wins): Connected = 0, Static = 1, EIGRP = 90, OSPF = 110, RIP = 120.",
      "A floating static route is configured with an administrative distance higher than the primary dynamic routing protocol (e.g., AD 130 when backing up OSPF AD 110) so it stays inactive until the dynamic route fails.",
      "IOS removes a static route from the routing table if its outgoing interface goes down or if the router loses its route to the next-hop IP address, unless the `permanent` keyword is configured.",
      "When a packet's destination IPv4 address matches multiple routes in the routing table (for example, `/32`, `/27`, `/24`, `/16`, and `/0`), the router always forwards using the route with the longest prefix match (largest `/P`)."
    ],
    keyTerms: [
      { term: "Connected Route (C)", def: "A route automatically added to the routing table for the subnet attached to an `up/up` router interface." },
      { term: "Local Route (L)", def: "A `/32` host route automatically added to the routing table for the exact IPv4 address configured on an `up/up` router interface." },
      { term: "Static Network Route", def: "A manually configured route (`ip route`) whose destination prefix and mask represent a subnet or classful network." },
      { term: "Static Host Route", def: "A manually configured route with mask `255.255.255.255` (`/32`) that matches only a single destination IPv4 host address." },
      { term: "Floating Static Route", def: "A static route configured with a higher administrative distance than a dynamic routing protocol so it serves as an on-demand backup route." },
      { term: "Default Route (Gateway of Last Resort)", def: "A route (`0.0.0.0/0`, marked with `*`) that matches all packets when no more-specific route in the routing table matches." },
      { term: "Administrative Distance (AD)", def: "A number from 0 to 255 indicating the trustworthiness of a routing source (lower is better; Static = 1, OSPF = 110)." },
      { term: "Longest Prefix Match", def: "The forwarding rule stating that when a packet's destination IP matches multiple routes in the routing table, the route with the largest `/P` mask wins." },
      { term: "Next-Hop Router", def: "The IPv4 address of the neighboring router to which a packet should be forwarded next along its path." },
      { term: "ARP Table", def: "A table on hosts and routers mapping IPv4 addresses in directly connected subnets to their corresponding Ethernet MAC addresses." }
    ],
    commands: [
      { cmd: "ip route prefix mask {ip-address | interface-type interface-number} [distance] [permanent]", desc: "Configures an IPv4 static route (network, host, default, or floating static)", mode: "global" },
      { cmd: "ip route 0.0.0.0 0.0.0.0 {ip-address | interface}", desc: "Configures an IPv4 static default route (sets Gateway of Last Resort)", mode: "global" },
      { cmd: "ip routing", desc: "Enables IPv4 routing globally (enabled by default on routers; required on Layer 3 switches)", mode: "global" },
      { cmd: "show ip route", desc: "Displays the full IPv4 routing table including legend codes, prefixes, AD/metric, next hops, and outgoing interfaces", mode: "privileged" },
      { cmd: "show ip route {connected | static | ospf}", desc: "Displays only the specified subset of routes from the IPv4 routing table", mode: "privileged" },
      { cmd: "show ip route ip-address", desc: "Displays the exact route entry (including AD and metric) that the router matches for the specified IPv4 address", mode: "privileged" },
      { cmd: "show ip arp", desc: "Displays the router's IPv4 ARP table (IP address, age in minutes, MAC address, and interface)", mode: "privileged" },
      { cmd: "clear ip arp [ip-address]", desc: "Removes all dynamic entries (or one specific IP entry) from the router's IPv4 ARP table", mode: "privileged" }
    ],
    tips: [
      "Do not confuse Administrative Distance with Longest Prefix Match: AD decides which route enters the routing table when two protocols advertise the EXACT SAME prefix/mask; Longest Prefix Match (`/P`) decides which route is used to forward a packet among routes ALREADY in the routing table!",
      "In `show ip route` brackets `[110/65]`, the first number is Administrative Distance (`110`) and the second is Metric (`65`).",
      "A static route configured with an outgoing interface (e.g., `S0/0/0`) misleadingly prints `is directly connected` in `show ip route`, even though its legend code is `S` and its AD is 1 (or the configured floating AD, visible via `show ip route <subnet>`).",
      "Before picking a route in a 'which interface will the router use' exam question, verify that the destination IP actually falls inside each candidate route's address range first, then pick the longest `/P` among those that match."
    ]
  },
  {
    id: "v1c17",
    volume: 1,
    chapter: 17,
    title: "IP Routing in the LAN",
    domain: "IP Connectivity",
    pages: "392-416",
    examTopics: [
      "1.6 Configure and verify IPv4 addressing and subnetting",
      "2.4 Configure and verify (Layer 2/Layer 3) EtherChannel (LACP)"
    ],
    summary: "This chapter explains the three main methods for routing IPv4 packets between VLANs in a campus or branch LAN: Router-on-a-Stick (ROAS) using 802.1Q trunk subinterfaces on a router, Layer 3 switching using Switched Virtual Interfaces (SVIs), and Layer 3 switching using routed physical ports and Layer 3 EtherChannels.",
    keyPoints: [
      "Because Layer 2 switches only forward frames within the same VLAN, inter-VLAN communication requires a Layer 3 routing function (either an external router via ROAS or a multilayer switch) with an IP address in each VLAN's subnet.",
      "Router-on-a-Stick (ROAS) uses a single physical Ethernet link between a router and a Layer 2 switch configured as an 802.1Q trunk, with one virtual router subinterface (`interface type number.subint`) created per VLAN.",
      "Each ROAS subinterface requires two commands: `encapsulation dot1q <vlan-id> [native]` (which must be entered first) and `ip address <address> <mask>`. Subinterface numbers do not have to match the VLAN ID, though matching them is best practice.",
      "To route the native VLAN in ROAS, either configure `ip address` directly on the physical interface (with no `encapsulation` command) or configure `encapsulation dot1q <vlan-id> native` and `ip address` on a subinterface.",
      "A ROAS subinterface's state cannot exceed its parent physical interface's state (if the physical port is `shutdown` or `down/down`, all subinterfaces go down), and individual subinterfaces can also be shut down independently.",
      "Cisco routers do not run DTP or VTP on ROAS trunks, so a router's subinterfaces will still show `up/up` and install connected routes even if the attached switch port is misconfigured as an access port or missing the VLANs.",
      "To enable inter-VLAN routing on a Layer 3 switch using SVIs, ensure an appropriate SDM template is active (`sdm prefer lanbase-routing` followed by `reload` on switches like the 2960-XR), enable `ip routing` globally, and configure `interface vlan <vlan-id>` with `ip address` and `no shutdown`.",
      "For an SVI (`interface vlan X`) to reach `up/up` state, four conditions must hold: (1) VLAN X exists on the switch, (2) VLAN X itself is not shut down, (3) `interface vlan X` is not shut down, and (4) at least one access or trunk port in VLAN X is `up/up` and STP forwarding. Otherwise, the SVI drops to `up/down`.",
      "Configuring `no switchport` on a Layer 3 switch physical port converts it from a Layer 2 switchport into a Layer 3 routed port that accepts an `ip address` directly and displays `routed` in the `Vlan` column of `show interfaces status`.",
      "A Layer 3 EtherChannel bundles parallel routed links between Layer 3 switches into a single logical Layer 3 interface (`interface port-channel X`) so routing protocols form a single neighbor adjacency and learn one route over the bundle.",
      "To configure a Layer 3 EtherChannel, configure `no switchport` and `channel-group <num> mode ...` (with `no ip address`) on the physical member ports, and configure `no switchport` and `ip address <ip> <mask>` on `interface port-channel <num>`.",
      "For physical ports to bundle into a Layer 3 EtherChannel (`RU` and `(P)` in `show etherchannel summary`), all member ports and the PortChannel must be configured with `no switchport` and must have matching `speed` and `duplex` settings."
    ],
    keyTerms: [
      { term: "Router-on-a-Stick (ROAS)", def: "An inter-VLAN routing design where a single physical router interface connects via an 802.1Q trunk to a switch and uses subinterfaces to route between VLANs." },
      { term: "Subinterface", def: "A virtual router interface (`G0/0.x`) associated with a single 802.1Q VLAN tag on a physical router Ethernet interface." },
      { term: "Layer 3 Switch (Multilayer Switch)", def: "A switch capable of performing both Layer 2 Ethernet frame switching within VLANs and Layer 3 IP packet routing between subnets." },
      { term: "Switched Virtual Interface (SVI)", def: "A virtual Layer 3 interface (`interface vlan <id>`) inside a multilayer switch that connects the switch's routing engine to an internal VLAN." },
      { term: "Routed Port", def: "A physical port on a Layer 3 switch configured with `no switchport` so it acts like a dedicated router interface rather than a Layer 2 switch port." },
      { term: "Layer 3 EtherChannel", def: "An EtherChannel bundle of physical routed ports (`no switchport`) represented by a single routed `Port-channel` interface with one IPv4 address/mask." },
      { term: "Switch Database Management (SDM)", def: "A Catalyst switch feature (`sdm prefer`) that partitions hardware forwarding ASIC memory (TCAM) among Layer 2 MAC tables, IPv4/IPv6 routes, and ACLs." },
      { term: "IEEE 802.1Q Encapsulation", def: "The industry-standard VLAN trunking protocol configured via `encapsulation dot1q <vlan-id>` on router subinterfaces to tag and untag inter-VLAN traffic." },
      { term: "Autostate", def: "The default IOS feature that automatically brings an SVI (`interface vlan X`) down (`up/down`) when no Layer 2 ports in that VLAN are up and STP forwarding." },
      { term: "PortChannel Interface", def: "The virtual interface (`interface port-channel <num>`) that represents an EtherChannel bundle and holds the IPv4 address on a Layer 3 EtherChannel." }
    ],
    commands: [
      { cmd: "interface type number.subint", desc: "Creates a router subinterface and enters subinterface configuration mode (e.g., interface g0/0.10)", mode: "global" },
      { cmd: "encapsulation dot1q vlan-id [native]", desc: "Enables 802.1Q VLAN tagging for the specified VLAN ID (and optionally marks it as the untagged native VLAN) on a router subinterface", mode: "interface" },
      { cmd: "sdm prefer lanbase-routing", desc: "Reallocates switch forwarding ASIC memory to support IPv4 routing on switches that default to Layer 2 only (requires reload)", mode: "global" },
      { cmd: "ip routing", desc: "Enables the IPv4 routing process and routing commands on a Layer 3 switch", mode: "global" },
      { cmd: "interface vlan vlan-id", desc: "Creates a Switched Virtual Interface (SVI) for the specified VLAN and enters interface configuration mode", mode: "global" },
      { cmd: "no switchport", desc: "Converts a Layer 3 switch physical port or PortChannel from Layer 2 switching mode to Layer 3 routed mode", mode: "interface" },
      { cmd: "interface port-channel channel-number", desc: "Creates or enters configuration mode for a logical PortChannel interface", mode: "global" },
      { cmd: "channel-group channel-number mode {auto | desirable | active | passive | on}", desc: "Assigns a physical switch interface to an EtherChannel group", mode: "interface" },
      { cmd: "show vlans", desc: "Displays 802.1Q VLAN subinterface mappings, native VLAN status, IP addresses, and packet counters on a Cisco router", mode: "privileged" },
      { cmd: "show interfaces status", desc: "Displays switch port status; lists `routed` under the Vlan column for Layer 3 routed ports", mode: "privileged" },
      { cmd: "show interfaces type number switchport", desc: "Displays `Switchport: Disabled` when a port has been converted into a Layer 3 routed port", mode: "privileged" },
      { cmd: "show etherchannel [number] summary", desc: "Displays EtherChannel status flags (`RU` = Layer 3 in use, `SU` = Layer 2 in use, `P` = bundled in port-channel)", mode: "privileged" }
    ],
    tips: [
      "On a router subinterface, IOS rejects `ip address` until you configure `encapsulation dot1q <vlan-id>` first!",
      "Distinguish `show vlan brief` (a Switch command listing Layer 2 VLANs and access ports) from `show vlans` (a Router command listing ROAS 802.1Q subinterfaces and traffic counters).",
      "If an SVI (`interface Vlan10`) shows `up/down`, check whether VLAN 10 exists in `show vlan brief`, whether VLAN 10 is shut down, and whether at least one physical port in VLAN 10 is `connected` (`up/up`) and STP forwarding.",
      "In a Layer 3 EtherChannel, put `ip address` on `interface port-channel X` ONLY, and put `no switchport` on BOTH the physical ports and the `port-channel` interface."
    ]
  },
  {
    id: "v1c18",
    volume: 1,
    chapter: 18,
    title: "Troubleshooting IPv4 Routing",
    domain: "IP Connectivity",
    pages: "418-435",
    examTopics: [
      "1.6 Configure and verify IPv4 addressing and subnetting",
      "3.3 Configure and verify IPv4 and IPv6 static routing (3.3.a Default route, 3.3.b Network route, 3.3.c Host route, 3.3.d Floating static)"
    ],
    summary: "This chapter focuses on isolating end-to-end IPv4 routing problems using standard and extended `ping`, standard and extended `traceroute`, and the Cisco IOS `telnet` and `ssh` clients. It explains what a working or failing test proves about forward routes, reverse routes, default gateways, ARP/MAC tables, DNS, and ACLs.",
    keyPoints: [
      "`ping` tests Layer 3 connectivity using Internet Control Message Protocol (ICMP) Echo Request and ICMP Echo Reply messages encapsulated directly in IPv4 packets (without TCP or UDP).",
      "By default, Cisco IOS `ping` sends 5 100-byte ICMP Echo Requests with a 2-second timeout; `!` indicates a successful reply and `.` indicates a timeout (an initial `.!!!!` 80% success rate is normal when ARP resolution is needed on the first packet).",
      "A standard `ping <dest-ip>` issued from a router uses the IPv4 address of the router's outgoing interface (selected by the routing table lookup) as the source IPv4 address of the Echo Request.",
      "Because a standard router ping uses the outgoing WAN interface IP as source, it only tests whether remote routers can route replies back to that WAN subnet—it does NOT test the reverse route back to the router's LAN subnet.",
      "An extended ping from a router (`ping` interactive prompts or `ping <dest-ip> source <lan-ip>`) uses the router's LAN interface IP as source, forcing Echo Replies to travel back to the LAN subnet and testing both forward and reverse routing.",
      "Even an extended ping from a router (`source <lan-ip>`) cannot test the LAN segment between the actual host and the router, the host's default gateway setting, switch port security on the host's port, or router ACLs/routes that match only the host's specific IP.",
      "If a standard `ping` from a router to a local LAN host succeeds (using the router's LAN IP in the same subnet), but an extended `ping` from the same router to that same LAN host (using a different router interface IP as source) fails, the LAN host's default gateway setting is missing or incorrect.",
      "If `ping <ip-address>` succeeds from a host, but `ping <hostname>` to the same target fails, Layer 1–3 routing is working and the problem is with Domain Name System (DNS) name resolution.",
      "`traceroute` maps the router hops along a forward path by sending probe packets with `TTL = 1`, then `TTL = 2`, then `TTL = 3`, etc. Each router that decrements TTL to 0 discards the probe and returns an ICMP Time Exceeded (TTL Exceeded) message sourced from its incoming interface IPv4 address.",
      "Host operating systems (such as Windows `tracert`) typically send ICMP Echo Request probes, whereas Cisco IOS `traceroute` sends UDP probes (default destination port 33434+), which means an ACL can block one while permitting the other.",
      "When end-to-end routing is broken and you cannot Telnet/SSH directly from your PC to a distant router, you can Telnet/SSH to the local router and hop router-to-router (`telnet <neighbor-ip>` or `ssh -l <user> <neighbor-ip>`) across working connected subnets."
    ],
    keyTerms: [
      { term: "ICMP Echo Request / Echo Reply", def: "The pair of Layer 3 Internet Control Message Protocol messages sent and received by the `ping` utility to verify two-way IP reachability." },
      { term: "Standard Ping", def: "A `ping <destination>` command that automatically uses the outgoing interface's IPv4 address as the packet's source IP address." },
      { term: "Extended Ping", def: "An enhanced IOS `ping` mode that allows specifying parameters such as the source IPv4 address/interface, packet size, timeout, and repeat count." },
      { term: "Forward Route", def: "The sequence of routing table entries on routers along the path from the sending host toward the destination host." },
      { term: "Reverse Route", def: "The sequence of routing table entries on routers along the return path from the destination host back to the sending host's subnet." },
      { term: "Time to Live (TTL)", def: "An 8-bit field in the IPv4 header decremented by 1 by every forwarding router to prevent infinite routing loops." },
      { term: "ICMP Time Exceeded (TTL Exceeded)", def: "An ICMP error message sent back to the source host by a router when it decrements an IPv4 packet's TTL field to 0 and drops the packet." },
      { term: "ICMP Unreachable", def: "An ICMP error family (`U` in IOS ping output) returned by a router when a destination network, host, protocol, or port cannot be reached or is filtered." },
      { term: "Extended Traceroute", def: "An interactive or parameterized `traceroute` mode in Cisco IOS that lets the user choose the source IPv4 address, timeout, probe count, and UDP port." },
      { term: "Default Gateway", def: "The router IPv4 address in a host's local subnet to which the host sends frames whenever a packet's destination IP is outside the local subnet." }
    ],
    commands: [
      { cmd: "ping {host | ip-address}", desc: "Sends 5 100-byte ICMP Echo Requests (2-sec timeout) sourced from the outgoing interface IP", mode: "privileged" },
      { cmd: "ping ip-address source {source-ip | interface}", desc: "Executes an extended ping on one line using the specified router IP address or interface as source", mode: "privileged" },
      { cmd: "ping", desc: "Enters interactive extended ping prompts when issued without arguments in privileged EXEC mode", mode: "privileged" },
      { cmd: "traceroute {host | ip-address}", desc: "Traces the hop-by-hop forward path to a destination using UDP probes with incrementing TTL values", mode: "privileged" },
      { cmd: "traceroute", desc: "Enters interactive extended traceroute prompts (allowing custom source IP, timeout, probe count, and UDP port)", mode: "privileged" },
      { cmd: "telnet {host | ip-address}", desc: "Opens a Telnet client session from the router/switch CLI to a remote IP address or hostname", mode: "privileged" },
      { cmd: "ssh -l username {host | ip-address}", desc: "Opens an SSH client session from the router/switch CLI to a remote device using the specified login username", mode: "privileged" }
    ],
    tips: [
      "Classic exam diagnostic pattern #1: From Router R1, standard `ping <HostA>` works, but extended `ping <HostA> source <R1-WAN-IP>` fails -> Host A has a bad/missing default gateway!",
      "Classic exam diagnostic pattern #2: `ping <IP>` works, but `ping <hostname>` fails -> DNS problem (not a routing or default gateway problem).",
      "In `traceroute` output, if Hop 2 (`172.16.4.2`) replies and Hop 3 shows `* * *`, both the forward path to Hop 2 AND Hop 2's reverse path back to the source are working—start investigating at Hop 2's forward route and Hop 3's reverse route.",
      "Remember the IOS SSH client syntax uses `-l` (lowercase L for login name): `ssh -l <username> <ip-address>`."
    ]
  }
];
