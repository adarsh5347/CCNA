export default [
  {
    id: "v2c11",
    volume: 2,
    chapter: 11,
    title: "Quality of Service (QoS)",
    domain: "IP Services",
    pages: "286-319",
    examTopics: [
      "4.7 Explain the forwarding per-hop behavior (PHB) for QoS, such as classification, marking, queuing, congestion, policing, and shaping"
    ],
    summary: "This chapter explains Quality of Service (QoS) mechanisms used to manage bandwidth, delay (latency), jitter (delay variation), and packet loss across converged networks carrying voice, video, and data. It details the Per-Hop Behavior (PHB) actions—Classification and Marking (802.1p CoS, IP Precedence, DSCP EF/AF/CS), Trust Boundaries, Queuing and Congestion Management (CBWFQ and LLQ), Congestion Avoidance (WRED), and Traffic Policing vs. Traffic Shaping.",
    keyPoints: [
      "QoS manages four traffic characteristics across network links: Bandwidth (link capacity in bps), Delay/Latency (one-way transit time; keep <= 150 ms for interactive voice/video), Jitter (variation in delay between consecutive packets; keep <= 30 ms for voice), and Loss (percentage of dropped packets; keep <= 1% for voice).",
      "Voice over IP (VoIP) traffic consists of small, constant-bitrate UDP/RTP packets sensitive to delay and jitter; interactive video is bursty and high-bandwidth while also requiring low latency, jitter, and loss; TCP data applications tolerate delay and recover from loss via retransmission.",
      "Classification inspects incoming frames/packets (by ACL, NBAR2 application recognition, or incoming QoS header) to group traffic into classes; Marking sets QoS priority bits inside frame/packet headers so downstream switches and routers can identify traffic priority without deep packet inspection.",
      "Layer 2 Ethernet 802.1Q trunk headers contain a 3-bit Priority Code Point (PCP) field called Class of Service (CoS, values 0 to 7; CoS 5 is used for voice). Non-802.1Q untagged Ethernet frames have NO CoS field!",
      "Layer 3 IPv4 (Type of Service byte) and IPv6 (Traffic Class byte) headers use the first 6 bits for the Differentiated Services Code Point (DSCP, values 0 to 63), which replaced the legacy 3-bit IP Precedence (IPP, values 0 to 7) field.",
      "Standard DiffServ Per-Hop Behavior (PHB) DSCP markings: Default / Best Effort = DSCP 0 (000000); Class Selector (CS0–CS7, binary xxx000) provides backward compatibility with IP Precedence; Assured Forwarding (AFxy, 4 classes x=1..4 and 3 drop precedences y=1..3 where higher y = higher drop probability; formula decimal DSCP = 8x + 2y); Expedited Forwarding (EF = DSCP 46, binary 101110) is reserved for low-latency real-time voice payload.",
      "The QoS Trust Boundary defines where switches/routers begin trusting incoming CoS/DSCP markings: in enterprise networks, the trust boundary is typically at the Cisco IP Phone or access switch (using `mls qos trust cos` or `mls qos trust cisco-phone`), never trusting unauthenticated end-user PCs directly.",
      "Queuing manages outbound congestion when packets arrive faster than an egress interface can serialize them: Class-Based Weighted Fair Queuing (CBWFQ) guarantees a minimum bandwidth percentage to each queue during congestion, and Low Latency Queuing (LLQ) adds a strict-priority queue (always serviced first to minimize delay and jitter for voice/video) combined with an internal policer so priority traffic cannot starve non-priority queues.",
      "Weighted Random Early Detection (WRED) avoids TCP global synchronization and tail drop by randomly dropping a small percentage of lower-priority (higher AF drop-precedence) TCP packets as queue depth rises before the queue becomes 100% full.",
      "Traffic Shaping buffers excess packets in a queue to smooth out bursts to a contracted rate (CIR), introducing delay instead of loss (used outbound on customer WAN routers); Traffic Policing immediately drops (or remarks down) excess traffic above the rate limit without buffering (used inbound by ISPs or inside LLQ priority queues)."
    ],
    keyTerms: [
      { term: "Per-Hop Behavior (PHB)", def: "The QoS forwarding treatment (queuing, scheduling, dropping, policing, shaping) applied to a packet at an individual router or switch hop based on its marking." },
      { term: "Class of Service (CoS)", def: "The 3-bit IEEE 802.1p Priority Code Point field (values 0–7) inside a 4-byte 802.1Q VLAN tag used for Layer 2 QoS marking." },
      { term: "Differentiated Services Code Point (DSCP)", def: "The 6-bit Layer 3 QoS field (values 0–63) in the IPv4 ToS / IPv6 Traffic Class byte used to classify and mark packets." },
      { term: "Expedited Forwarding (EF)", def: "The DiffServ PHB marking (DSCP 46, binary 101110, mapping to CoS 5) assigned to real-time interactive voice payload for strict-priority queuing." },
      { term: "Assured Forwarding (AFxy)", def: "Four DiffServ PHB queue classes (AF1x to AF4x) each with three drop preference levels (y=1 low drop, y=2 medium drop, y=3 high drop)." },
      { term: "Low Latency Queuing (LLQ)", def: "Cisco's queuing scheduler that combines CBWFQ bandwidth guarantees with one or more policed strict-priority queues for voice and interactive video." },
      { term: "Traffic Shaping", def: "A QoS rate-limiting tool that queues and delays excess traffic bursts so outbound transmission conforms smoothly to a target rate." },
      { term: "Traffic Policing", def: "A QoS rate-limiting tool that immediately drops or remarks traffic exceeding a configured bitrate contract rather than buffering it." },
      { term: "Trust Boundary", def: "The perimeter in the network (typically the access switch port or Cisco IP Phone) where devices accept or overwrite incoming CoS/DSCP markings." }
    ],
    commands: [
      { cmd: "class-map [match-all | match-any] class-name", desc: "Creates a Modular QoS CLI (MQC) traffic class map to classify packets by ACL, protocol, DSCP, or CoS", mode: "global" },
      { cmd: "policy-map policy-name", desc: "Creates an MQC QoS policy map that binds traffic classes to PHB actions (marking, bandwidth, priority, shaping, policing)", mode: "global" },
      { cmd: "service-policy {input | output} policy-name", desc: "Applies a QoS policy-map inbound or outbound on a router or switch interface", mode: "interface" },
      { cmd: "mls qos trust {cos | dscp | ip-precedence}", desc: "Configures a Catalyst switch port as part of the QoS trust boundary, trusting incoming CoS or DSCP markings", mode: "interface" },
      { cmd: "show policy-map interface [type number]", desc: "Displays active QoS service-policy queue depths, matched packet counters, priority policing drops, and WRED statistics", mode: "user" }
    ],
    tips: [
      "Memorize Cisco's voice/video QoS standards: Voice max one-way latency = **150 ms**, max jitter = **30 ms**, max packet loss = **1%**; Voice payload marking = **EF (DSCP 46)** at Layer 3 and **CoS 5** at Layer 2; Interactive Video = **AF41 (DSCP 34)** and **CoS 4**.",
      "Compute any AFxy decimal DSCP value instantly with the formula **8x + 2y**: e.g., AF31 = 8(3) + 2(1) = **26**; AF41 = 8(4) + 2(1) = **34**; AF13 = 8(1) + 2(3) = **14**. And remember: within a class, **AFx3 is dropped BEFORE AFx1** (higher `y` = WORSE / higher drop probability)!",
      "Compare Shaping vs. Policing: **Shaping** = queues excess packets -> adds **delay/jitter** -> used **outbound** toward a slower WAN circuit; **Policing** = drops/remarks excess packets -> causes **packet loss** (and TCP window shrinkage) -> used **inbound** or inside LLQ."
    ]
  },
  {
    id: "v2c12",
    volume: 2,
    chapter: 12,
    title: "Miscellaneous IP Services",
    domain: "IP Connectivity",
    pages: "320-347",
    examTopics: [
      "3.5 Describe the purpose, functions, and concepts of first hop redundancy protocols",
      "4.4 Explain the function of SNMP in network operations",
      "4.9 Explain the capabilities and functions of TFTP/FTP in the network"
    ],
    summary: "This chapter covers three vital enterprise network services: First Hop Redundancy Protocols (FHRPs: HSRP, VRRP, and GLBP) that provide default-gateway failover for LAN hosts; Simple Network Management Protocol (SNMPv1, v2c, and v3) for device monitoring via MIBs, polling, and traps; and IOS file management using FTP and TFTP to back up configurations and upgrade Cisco IOS images.",
    keyPoints: [
      "First Hop Redundancy Protocols (FHRPs) allow two or more routers on the same subnet to share a single Virtual IP address and Virtual MAC address as the default gateway for hosts, providing transparent gateway failover without changing host IP settings.",
      "Hot Standby Router Protocol (HSRP) is Cisco-proprietary and elects one Active router (forwards all traffic sent to the virtual MAC) and one Standby router (monitors Active via UDP port 1985 Hello packets every 3 seconds, holdtime 10 seconds, and takes over if Active fails).",
      "In HSRP, router election uses the highest HSRP priority (default 100; range 0–255), with the highest configured interface IPv4 address breaking ties. By default, HSRP Preemption is DISABLED (`standby <grp> preempt` is required for a higher-priority router to take back the Active role).",
      "HSRP version 1 uses multicast 224.0.0.2, group numbers 0–255, and virtual MAC `0000.0c07.acXX` (where XX is the 2-digit hex group number). HSRP version 2 (`standby version 2`) uses multicast 224.0.0.102, group numbers 0–4095, and virtual MAC `0000.0c9f.fXXX` (where XXX is the 3-digit hex group number).",
      "Virtual Router Redundancy Protocol (VRRP) is an IETF standard (RFC 5798) similar to HSRP (Active/Standby model called Master/Backup, multicast 224.0.0.18, virtual MAC `0000.5e00.01XX`, preemption enabled by default); Gateway Load Balancing Protocol (GLBP) is Cisco-proprietary and load-balances host traffic across up to 4 active routers simultaneously (1 AVG assigns up to 4 AVF virtual MACs `0007.b400.XXYY` via ARP replies).",
      "Simple Network Management Protocol (SNMP) consists of an SNMP Manager (NMS software), an SNMP Agent running on each router/switch, and a Management Information Base (MIB) database of Object Identifiers (OIDs).",
      "SNMP Managers poll Agents on UDP port 161 using Get, GetNext, GetBulk (v2c/v3), and Set messages; Agents send unsolicited asynchronous alerts to the Manager on UDP port 162 using Trap (unacknowledged) or Inform (acknowledged by Manager) messages.",
      "SNMPv1 and SNMPv2c authenticate using cleartext Community Strings (Read-Only `RO` for Get polling; Read-Write `RW` for Set configuration changes); SNMPv3 adds strong security via User-Based Security Model (USM) with three levels: `noAuthNoPriv` (username only), `authNoPriv` (MD5/SHA integrity authentication), and `authPriv` (MD5/SHA authentication + DES/3DES/AES encryption).",
      "TFTP (UDP port 69) is a simple, unauthenticated, connectionless file transfer protocol ideal for quick LAN transfers of IOS images and configs (`copy tftp: flash:`); FTP (TCP port 21 control, TCP port 20 active data) provides username/password authentication, directory browsing, and reliable TCP transport (`copy ftp: flash:`)."
    ],
    keyTerms: [
      { term: "First Hop Redundancy Protocol (FHRP)", def: "A protocol family (HSRP, VRRP, GLBP) that enables multiple routers on a LAN to present a single shared virtual default-gateway IP and MAC to hosts." },
      { term: "Hot Standby Router Protocol (HSRP)", def: "Cisco's FHRP that elects one Active router and one Standby backup router sharing virtual MAC 0000.0c07.acXX (v1) or 0000.0c9f.fXXX (v2)." },
      { term: "Virtual Router Redundancy Protocol (VRRP)", def: "The IETF standard Active/Standby FHRP (electing one Master and one or more Backups with virtual MAC 0000.5e00.01XX)." },
      { term: "Gateway Load Balancing Protocol (GLBP)", def: "Cisco's Active/Active FHRP where an Active Virtual Gateway (AVG) distributes up to four virtual MACs across Active Virtual Forwarders (AVFs)." },
      { term: "Management Information Base (MIB)", def: "The hierarchical tree of operational variables (identified by numeric OIDs like 1.3.6.1...) maintained by an SNMP Agent on a network device." },
      { term: "SNMP Trap vs. Inform", def: "Unsolicited notifications sent from an SNMP Agent to the NMS on UDP 162; Traps are unacknowledged whereas Informs require an NMS acknowledgment." },
      { term: "SNMPv3 authPriv", def: "The highest SNMPv3 security level, providing both HMAC-MD5/SHA message authentication and AES/3DES payload encryption." },
      { term: "TFTP vs. FTP", def: "TFTP uses connectionless UDP port 69 without login credentials; FTP uses reliable TCP ports 21 (control) and 20 (data) with username/password authentication." }
    ],
    commands: [
      { cmd: "standby group-number ip virtual-ip", desc: "Enables HSRP on a router interface and assigns the shared virtual default-gateway IPv4 address", mode: "interface" },
      { cmd: "standby group-number priority value", desc: "Sets the HSRP priority (0–255, default 100) used to elect the Active router", mode: "interface" },
      { cmd: "standby group-number preempt", desc: "Enables HSRP preemption so a router with a higher priority immediately takes over the Active role", mode: "interface" },
      { cmd: "standby version {1 | 2}", desc: "Configures the HSRP protocol version on the interface (v1 default or v2)", mode: "interface" },
      { cmd: "show standby [brief]", desc: "Displays HSRP state (Active/Standby), virtual IP, virtual MAC, priority, preemption status, and active/standby peer IPs", mode: "user" },
      { cmd: "snmp-server community string {ro | rw} [acl]", desc: "Configures an SNMPv1/v2c read-only (RO) or read-write (RW) community string, optionally restricted by an ACL", mode: "global" },
      { cmd: "snmp-server host ip-address [version {1 | 2c | 3}] community", desc: "Specifies the NMS server IP address (UDP 162) to receive SNMP traps or informs", mode: "global" },
      { cmd: "copy {tftp: | ftp:} flash:", desc: "Downloads a Cisco IOS image or file from a TFTP or FTP server into the device's flash memory", mode: "privileged" },
      { cmd: "verify /md5 flash:filename", desc: "Computes the MD5 hash of an IOS image file in flash to verify its integrity after transfer", mode: "privileged" }
    ],
    tips: [
      "Memorize the FHRP Virtual MAC prefixes—they are tested constantly: **HSRPv1** = `0000.0c07.acXX`; **HSRPv2** = `0000.0c9f.fXXX`; **VRRP** = `0000.5e00.01XX`; **GLBP** = `0007.b400.XXYY`. For HSRPv1 Group 10, 10 in hex is `0a`, so the MAC ends in `.ac0a`!",
      "Compare HSRP vs. VRRP vs. GLBP: **HSRP** (Cisco, Active/Standby) and **VRRP** (IETF standard, Master/Backup) forward traffic through only ONE router per group at a time (though you can load-balance across two groups for different VLANs); **GLBP** (Cisco) automatically load-balances traffic from a single subnet across up to 4 routers simultaneously.",
      "Memorize the 3 SNMPv3 security levels: **noAuthNoPriv** (username, no hash, no encryption), **authNoPriv** (MD5/SHA hash, no encryption), **authPriv** (MD5/SHA hash + DES/3DES/AES encryption)."
    ]
  },
  {
    id: "v2c13",
    volume: 2,
    chapter: 13,
    title: "LAN Architecture",
    domain: "Network Fundamentals",
    pages: "348-375",
    examTopics: [
      "1.2 Describe characteristics of network topology architectures: Two-tier, Three-tier, Spine-leaf, Small office/home office (SOHO)",
      "1.3.c Describe PoE"
    ],
    summary: "This chapter analyzes enterprise campus LAN architectures and Power over Ethernet (PoE). It compares two-tier (Collapsed Core) and three-tier (Access, Distribution, Core) hierarchical campus designs, Small Office/Home Office (SOHO) networks, and Data Center Spine-and-Leaf (Clos) topologies, and details IEEE 802.3af (PoE), 802.3at (PoE+), and 802.3bt (UPoE/PoE++) power delivery over copper twisted-pair cabling.",
    keyPoints: [
      "Enterprise Campus LANs use a hierarchical modular design with three functional layers: Access Layer (connects end devices, APs, IP phones; enforces port security, 802.1X, PoE, QoS marking, VLAN assignment), Distribution Layer (aggregates access switches; provides Layer 3 routing/SVIs, FHRP, ACL policy enforcement, and STP root bridge placement), and Core Layer (high-speed Layer 3 backbone interconnect between distribution blocks with minimal latency and no slow packet filtering).",
      "A Two-Tier Campus LAN (also called a Collapsed Core design) merges the Distribution and Core layers into a single layer of redundant multilayer switches, reducing hardware cost for small-to-medium campuses while preserving access-to-distribution redundancy.",
      "A Three-Tier Campus LAN adds a dedicated Core layer when multiple buildings or distribution blocks must be interconnected at high speed without full-mesh cabling between every distribution pair.",
      "Moving the Layer 2/Layer 3 boundary down to the Distribution layer (with Layer 2 access trunks) is the traditional enterprise design; Routed Access design moves Layer 3 routing all the way to the Access switches to eliminate Spanning Tree Protocol blocking loops entirely.",
      "Data Center Spine-and-Leaf (Clos) Architecture replaces three-tier trees to optimize East-West server-to-server traffic: every Leaf switch connects to EVERY Spine switch (and never Leaf-to-Leaf or Spine-to-Spine), guaranteeing a predictable two-hop path and equal latency between any two servers via Layer 3 ECMP.",
      "A Small Office / Home Office (SOHO) LAN typically integrates a broadband WAN modem, router, NAT firewall, DHCP server, 4-port Ethernet switch, and wireless AP into a single multifunction consumer/branch appliance.",
      "Power over Ethernet (PoE) supplies DC electrical power from Power Sourcing Equipment (PSE, usually an access switch or midspan PoE injector) to Powered Devices (PDs, such as VoIP phones, wireless APs, and PTZ cameras) over standard copper UTP Ethernet cabling.",
      "PoE negotiates power requirements before applying voltage using hardware resistor detection (IEEE 802.3) and Layer 2 discovery protocols (CDP or LLDP-MED) so non-PoE devices are never damaged.",
      "PoE standards and maximum PSE port power output: Cisco Inline Power (7W, 2 pairs), IEEE 802.3af PoE (15.4W, 2 pairs), IEEE 802.3at PoE+ (30W, 2 pairs), Cisco UPoE (60W, 4 pairs), IEEE 802.3bt Type 3 / UPoE (60W, 4 pairs), and IEEE 802.3bt Type 4 / UPoE+ (90–100W, 4 pairs)."
    ],
    keyTerms: [
      { term: "Three-Tier Architecture", def: "The hierarchical enterprise campus LAN design consisting of distinct Access, Distribution, and Core switch layers." },
      { term: "Two-Tier (Collapsed Core) Architecture", def: "A campus LAN design that combines the Distribution and Core layers into a single Collapsed Core tier above the Access layer." },
      { term: "Spine-and-Leaf Architecture", def: "A two-tier Data Center topology where every Leaf (top-of-rack) switch connects to every Spine switch via Layer 3 links for low-latency East-West traffic." },
      { term: "Power over Ethernet (PoE)", def: "Technology that delivers DC electrical power alongside data over standard twisted-pair copper Ethernet cables to power IP phones, APs, and cameras." },
      { term: "Power Sourcing Equipment (PSE)", def: "A PoE-capable Ethernet switch or inline PoE injector that supplies DC power onto the UTP cable." },
      { term: "Powered Device (PD)", def: "An endpoint device (such as a VoIP phone, wireless AP, or IP camera) that draws electrical power from the Ethernet cable via PoE." },
      { term: "IEEE 802.3af / 802.3at / 802.3bt", def: "IEEE PoE standards supplying up to 15.4W (802.3af PoE), 30W (802.3at PoE+), 60W (802.3bt Type 3), and 90-100W (802.3bt Type 4) from the PSE." },
      { term: "East-West vs. North-South Traffic", def: "East-West traffic flows horizontally between servers inside a data center; North-South traffic flows vertically into or out of the data center to clients." }
    ],
    commands: [
      { cmd: "power inline {auto | never | static} [max milliwatts]", desc: "Configures PoE operation on a switch port (auto negotiates power; never disables PoE; static pre-allocates power)", mode: "interface" },
      { cmd: "show power inline [interface]", desc: "Displays PoE power budget (Available, Used, Remaining watts) and per-port PD status, class, and power draw", mode: "user" }
    ],
    tips: [
      "Memorize the Spine-and-Leaf wiring rule for exam questions: **Leaf switches ONLY connect to Spine switches** (and servers/endpoints). Spine switches NEVER connect to other Spine switches, and Leaf switches NEVER connect directly to other Leaf switches!",
      "Know which functions belong to each Campus tier: **Access** = PoE, port security, 802.1X, QoS marking, VLANs; **Distribution** = L3 routing/SVIs, FHRP (HSRP), ACL policy filtering, route summarization; **Core** = pure high-speed L3 packet switching (avoid ACLs or CPU-heavy inspection here).",
      "Memorize the IEEE PoE wattage numbers at the PSE port: **802.3af (PoE)** = **15.4W**; **802.3at (PoE+)** = **30W**; **802.3bt (UPoE / PoE++)** = **60W** (Type 3) and **90–100W** (Type 4)."
    ]
  },
  {
    id: "v2c14",
    volume: 2,
    chapter: 14,
    title: "WAN Architecture",
    domain: "IP Connectivity",
    pages: "376-403",
    examTopics: [
      "1.2.d Describe WAN topology architectures",
      "5.5 Describe remote access and site-to-site VPNs"
    ],
    summary: "This chapter explores Wide Area Network (WAN) technologies used to interconnect enterprise branches, headquarters, and cloud data centers. It compares Layer 2 Metro Ethernet (MEF E-Line, E-LAN, E-Tree), Layer 3 Multiprotocol Label Switching (MPLS L3VPN), broadband Internet access (DSL, Cable, Fiber, Cellular 4G/5G, PPPoE), and VPN overlays (GRE tunnels, IPsec Site-to-Site VPNs, DMVPN, and SSL/TLS Remote-Access VPNs).",
    keyPoints: [
      "Metro Ethernet Forum (MEF) services provide Layer 2 Ethernet WAN connectivity across a service provider network: E-Line (Point-to-Point Ethernet Virtual Private Line connecting two customer routers), E-LAN (Multipoint-to-Multipoint full-mesh Layer 2 switch emulation connecting 3+ sites in a single subnet), and E-Tree (Hub-and-Spoke Point-to-Multipoint rooted multipoint service).",
      "Multiprotocol Label Switching (MPLS) L3VPN is a managed Layer 3 WAN service where Customer Edge (CE) routers peer at Layer 3 (via eBGP, OSPF, EIGRP, or static routes) with Service Provider Edge (PE) routers; the provider switches packets through its core using 32-bit MPLS labels while isolating each customer's routing table.",
      "Unlike Metro Ethernet (where customer routers are Layer 2 neighbors in the same subnet), MPLS L3VPN places each CE-to-PE access link in a separate IP subnet and allows any-to-any site communication without customer-managed full-mesh tunnels.",
      "Broadband Internet WAN links (Cable, DSL, FTTH/GPON, 4G/5G LTE cellular) offer high bandwidth at low cost compared to MPLS or Metro Ethernet, but lack end-to-end provider QoS SLAs and inherent privacy.",
      "DSL (Digital Subscriber Line) and some fiber ISPs use Point-to-Point Protocol over Ethernet (PPPoE), which encapsulates PPP frames (providing CHAP/PAP authentication and IPv4/IPv6 CP address assignment) inside Ethernet frames using a virtual `Dialer` interface (`ip mtu 1492` due to the 8-byte PPPoE/PPP header overhead).",
      "Enterprise WAN designs frequently combine a primary MPLS L3VPN circuit (for SLA-backed voice/critical traffic) with a secondary broadband Internet link running an IPsec VPN (Dual-WAN / Hybrid WAN, the foundation of SD-WAN).",
      "Generic Routing Encapsulation (GRE) is a Cisco-created tunneling protocol that encapsulates almost any Layer 3 protocol (including IPv4, IPv6, and multicast OSPF/EIGRP routing updates) inside IP unicast packets across the Internet, but GRE provides NO encryption.",
      "IPsec VPNs provide strong encryption (AES), data integrity (SHA HMAC), origin authentication (Pre-Shared Keys or RSA certificates), and anti-replay protection using IKE (Internet Key Exchange) and ESP (Encapsulating Security Payload), and are often combined with GRE (GRE over IPsec) or Dynamic Multipoint VPN (DMVPN) to support encrypted dynamic routing over the Internet."
    ],
    keyTerms: [
      { term: "E-Line / E-LAN / E-Tree", def: "Metro Ethernet Layer 2 WAN topologies: E-Line (point-to-point), E-LAN (multipoint full mesh), and E-Tree (hub-and-spoke rooted multipoint)." },
      { term: "MPLS L3VPN", def: "A service provider Layer 3 WAN where Customer Edge (CE) routers exchange routes with Provider Edge (PE) routers across a label-switched core." },
      { term: "Customer Edge (CE) vs. Provider Edge (PE)", def: "In MPLS WANs, the CE is the customer's router at the site, and the PE is the ISP's edge router to which the CE connects." },
      { term: "PPPoE (Point-to-Point Protocol over Ethernet)", def: "A WAN protocol commonly used on DSL/fiber broadband links that embeds PPP authentication and IP assignment inside Ethernet frames (reducing MTU to 1492)." },
      { term: "Generic Routing Encapsulation (GRE)", def: "A tunneling protocol that encapsulates multicast/broadcast routing protocols and IPv4/IPv6 packets inside unicast IP packets without encryption." },
      { term: "IPsec", def: "The IETF cryptographic protocol suite (IKE + ESP/AH) that provides confidentiality, integrity, authentication, and anti-replay for VPN tunnels." },
      { term: "Dynamic Multipoint VPN (DMVPN)", def: "A Cisco VPN architecture combining multipoint GRE (mGRE), Next-Hop Resolution Protocol (NHRP), and IPsec for dynamic spoke-to-spoke tunnels." },
      { term: "Cisco AnyConnect (TLS/SSL VPN)", def: "A remote-access VPN client that uses Transport Layer Security (TLS) or DTLS over TCP/UDP port 443 to connect remote users to an enterprise firewall." }
    ],
    commands: [
      { cmd: "interface Tunnelnumber", desc: "Creates a logical point-to-point GRE or IPsec virtual tunnel interface on a router", mode: "global" },
      { cmd: "tunnel source {ip-address | interface}", desc: "Specifies the local physical interface or public IPv4 address used as the outer header source for tunnel packets", mode: "interface" },
      { cmd: "tunnel destination ip-address", desc: "Specifies the remote peer's public IPv4 address used as the outer header destination for a point-to-point GRE tunnel", mode: "interface" },
      { cmd: "pppoe-client dial-pool-number number", desc: "Enables a physical Ethernet WAN interface to initiate a PPPoE session bound to a logical Dialer interface", mode: "interface" },
      { cmd: "show interfaces tunnel number", desc: "Displays tunnel interface status (up/up), tunnel source/destination IPs, transport protocol (GRE/IP), and keepalive settings", mode: "user" }
    ],
    tips: [
      "Contrast **Metro Ethernet** vs. **MPLS L3VPN**: In Metro Ethernet (Layer 2 WAN), CE routers connect directly to each other in the same IP subnet and form OSPF adjacencies with each other; in MPLS L3VPN (Layer 3 WAN), each CE router peers with the ISP's **PE router**!",
      "Contrast **GRE** vs. **IPsec**: GRE supports **multicast/dynamic routing protocols** (OSPF, EIGRP) and multiple L3 protocols, but is **unencrypted**; pure IPsec encrypts unicast IP traffic, so enterprises run **GRE over IPsec** (or DMVPN) to get both encryption AND dynamic routing.",
      "Remember why PPPoE interfaces often need `ip mtu 1492` and `ip tcp adjust-mss 1452`: the 6-byte PPPoE header + 2-byte PPP header consumes **8 bytes** of the 1500-byte Ethernet payload!"
    ]
  },
  {
    id: "v2c15",
    volume: 2,
    chapter: 15,
    title: "Cloud Architecture",
    domain: "Network Fundamentals",
    pages: "404-431",
    examTopics: [
      "1.2.e Describe on-premises and cloud network topology architectures",
      "1.12 Explain virtualization fundamentals (server virtualization, containers, and VRFs)"
    ],
    summary: "This chapter explains server virtualization, containers, Virtual Routing and Forwarding (VRF), and Cloud Computing architectures. It compares physical servers to hypervisor-based Virtual Machines (Type 1 bare-metal vs. Type 2 hosted hypervisors, vSwitches, and live migration), contrasts VMs with lightweight OS containers (Docker/Kubernetes), and compares cloud service models (IaaS, PaaS, SaaS), deployment models (Public, Private, Hybrid, Community), and cloud WAN connectivity options.",
    keyPoints: [
      "Server virtualization uses a Hypervisor (Virtual Machine Monitor) to abstract physical CPU, RAM, storage, and NIC hardware so multiple isolated Virtual Machines (VMs), each running its own full Guest OS, can run on one physical host server.",
      "A Type 1 (Bare-Metal / Native) Hypervisor (such as VMware ESXi, Microsoft Hyper-V, KVM, or Citrix XenServer) installs directly on the physical server hardware without an underlying host OS; a Type 2 (Hosted) Hypervisor (such as VMware Workstation, Fusion, or Oracle VirtualBox) runs as an application on top of an existing desktop OS.",
      "Inside a virtualized host, each VM has virtual NICs (vNICs) connected to a software Virtual Switch (vSwitch, such as Open vSwitch or Cisco Nexus 1000v) that maps VLANs to the server's physical NICs (pNICs) connected via 802.1Q trunks to top-of-rack Leaf switches.",
      "Containers (such as Docker orchestrated by Kubernetes) package an application and its dependencies while sharing the host OS kernel through a container engine, making containers far more lightweight, faster to boot, and less memory-intensive than full VMs.",
      "Virtual Routing and Forwarding (VRF) virtualizes a single Layer 3 router into multiple independent virtual routers, each with its own isolated IP routing table, CEF forwarding table, and assigned interfaces—allowing overlapping IPv4 subnets across different tenants or departments without MPLS or multiple physical routers.",
      "NIST defines three primary Cloud Service Models based on how much of the stack the provider manages: Infrastructure as a Service (IaaS—provider manages hardware/hypervisor; customer manages Guest OS, middleware, apps, and data), Platform as a Service (PaaS—provider also manages OS and runtime environment; customer deploys code/apps), and Software as a Service (SaaS—provider manages the entire stack; customer consumes a ready-to-use web/cloud app like Microsoft 365, Webex, or Salesforce).",
      "Cloud Deployment Models: Private Cloud (dedicated to a single organization on-premises or in a colocation facility), Public Cloud (shared multi-tenant infrastructure owned by a cloud provider like AWS, Azure, or GCP), Hybrid Cloud (combines Private and Public clouds connected via WAN/VPN so workloads can span both), and Community Cloud (shared by organizations with common regulatory requirements).",
      "Enterprises connect campus/branch networks to Public Cloud VPCs/VNets using three WAN methods: (1) Internet with IPsec VPN (lowest cost, encrypted, no bandwidth SLA), (2) Private WAN (MPLS/MetroE) via Direct Cloud Interconnect (such as AWS Direct Connect or Azure ExpressRoute at an Equinix colocation facility for deterministic QoS/bandwidth), or (3) Intercloud Exchange."
    ],
    keyTerms: [
      { term: "Hypervisor (Type 1 vs. Type 2)", def: "Software that creates and runs Virtual Machines; Type 1 runs directly on bare-metal server hardware whereas Type 2 runs atop a host OS." },
      { term: "Virtual Switch (vSwitch)", def: "A software Layer 2 switch running inside the hypervisor that connects VM vNICs to each other and to the physical server's pNICs." },
      { term: "Containers", def: "Lightweight application execution environments (e.g., Docker) that share the host OS kernel instead of booting a separate guest OS per instance." },
      { term: "Virtual Routing and Forwarding (VRF)", def: "A router virtualization feature that creates multiple isolated Layer 3 routing and forwarding tables on a single physical router." },
      { term: "Infrastructure as a Service (IaaS)", def: "A cloud service model providing virtualized computing, storage, and networking resources where the customer manages the OS and applications." },
      { term: "Platform as a Service (PaaS)", def: "A cloud service model providing a managed OS, database, and runtime development environment so developers only manage their application code." },
      { term: "Software as a Service (SaaS)", def: "A cloud service model delivering complete, provider-managed applications (e.g., Webex, Office 365, Gmail) over the Internet." },
      { term: "Hybrid Cloud", def: "A cloud architecture that integrates an enterprise's on-premises Private Cloud with one or more Public Clouds over encrypted WAN interconnects." }
    ],
    commands: [
      { cmd: "vrf definition vrf-name", desc: "Creates a protocol-independent Virtual Routing and Forwarding (VRF-Lite) instance on a Cisco IOS XE router", mode: "global" },
      { cmd: "vrf forwarding vrf-name", desc: "Assigns a router interface to a specific VRF routing table (note: removes any existing IPv4/IPv6 address on the interface!)", mode: "interface" },
      { cmd: "show ip route vrf vrf-name", desc: "Displays the isolated IPv4 routing table belonging to the specified VRF instance", mode: "user" }
    ],
    tips: [
      "Clearly distinguish **Type 1** vs. **Type 2** hypervisors and **VMs** vs. **Containers**: Type 1 = bare-metal (VMware ESXi, Hyper-V, KVM) used in data centers; Type 2 = runs on a host OS (VirtualBox, VMware Workstation). VMs include a full **Guest OS** per instance; Containers share the **Host OS kernel**.",
      "Know the customer vs. provider responsibility line for **IaaS / PaaS / SaaS**: In **IaaS**, the customer patches the Guest OS; in **PaaS**, the provider manages the OS/runtime and the customer only writes application code; in **SaaS**, the customer just logs in and uses the software.",
      "Remember what **VRF** virtualizes: VLANs virtualize a Layer 2 switch into multiple broadcast domains; **VRFs** virtualize a Layer 3 router into multiple independent **routing tables**!"
    ]
  },
  {
    id: "v2c16",
    volume: 2,
    chapter: 16,
    title: "Introduction to Controller-Based Networking",
    domain: "Automation and Programmability",
    pages: "434-459",
    examTopics: [
      "6.1 Explain how automation impacts network management",
      "6.2 Compare traditional networks with controller-based networking",
      "6.3 Describe controller-based, software defined architecture (overlay, underlay, and fabric): Separation of control plane and data plane, Northbound and Southbound APIs"
    ],
    summary: "This chapter introduces Software-Defined Networking (SDN) and controller-based architectures. It defines the three functional planes of networking devices (Data Plane, Control Plane, and Management Plane), compares traditional distributed control planes with centralized SDN controllers, explains Southbound Interfaces (SBIs: OpenFlow, OpFlex, NETCONF, RESTCONF, SSH/SNMP) and Northbound Interfaces (NBIs: REST APIs), and summarizes OpenDaylight, Cisco APIC (ACI), and Cisco APIC-EM / DNA Center.",
    keyPoints: [
      "Every network device operates across three logical planes: the Data Plane (Forwarding Plane—ASIC hardware that processes, encapsulates, and forwards transit user frames/packets at line rate), the Control Plane (CPU software protocols like OSPF, EIGRP, STP, ARP, and LISP that build the forwarding tables used by the data plane), and the Management Plane (CLI/SSH, SNMP, Syslog, NETCONF used by engineers or controllers to configure and monitor the device).",
      "In Traditional Networking, every router and switch runs its own independent distributed Control Plane and requires box-by-box CLI management, which can lead to configuration drift and slow manual provisioning.",
      "In Controller-Based / Software-Defined Networking (SDN), a centralized SDN Controller maintains a network-wide view and interacts directly with network devices through a Southbound Interface (SBI) and exposes programmable APIs to applications through a Northbound Interface (NBI).",
      "The Southbound Interface (SBI) connects the SDN controller down to the network switches and routers using protocols such as OpenFlow, Cisco OpFlex, NETCONF (TCP 830 / XML / YANG), RESTCONF (HTTPS / JSON or XML / YANG), or legacy CLI/SSH and SNMP.",
      "The Northbound Interface (NBI) connects the SDN controller up to network automation scripts, orchestration tools, and business intent applications using RESTful APIs over HTTPS (carrying JSON or XML data).",
      "In pure OpenFlow SDN (centralized control plane), the controller computes forwarding rules and programs the flow tables of every switch directly via the OpenFlow SBI, removing traditional distributed routing protocols from the switches.",
      "In Cisco Application Centric Infrastructure (ACI) for data centers, Spine-and-Leaf Nexus 9000 switches are managed by the Cisco APIC (Application Policy Infrastructure Controller) using the declarative OpFlex SBI and an Application Network Profile (ANP) policy model of Endpoint Groups (EPGs) and Contracts.",
      "An SDN Fabric consists of an Underlay network (the physical switches, routers, cables, and IGP routing protocol like IS-IS or OSPF that provide IP reachability between fabric nodes) and an Overlay network (virtual tunnels like VXLAN or GRE/IPsec that encapsulate user traffic flexibly on top of the underlay)."
    ],
    keyTerms: [
      { term: "Data Plane (Forwarding Plane)", def: "The hardware ASIC-driven plane of a network device responsible for receiving, match-lookup forwarding, and encapsulating transit user traffic." },
      { term: "Control Plane", def: "The intelligence plane of a network (routing protocols like OSPF/BGP, STP, ARP, LISP) that populates the tables used by the data plane." },
      { term: "Management Plane", def: "The administrative plane (SSH, Telnet, Console, SNMP, NETCONF, RESTCONF) used to configure, monitor, and manage network devices." },
      { term: "Southbound Interface (SBI)", def: "The API/protocol interface between an SDN controller and the underlying physical/virtual network devices (e.g., OpenFlow, OpFlex, NETCONF, SNMP)." },
      { term: "Northbound Interface (NBI)", def: "The API interface (typically a REST API over HTTPS) at the top of an SDN controller that allows applications and scripts to program the network." },
      { term: "Underlay Network", def: "The physical infrastructure of switches, routers, links, and IP routing protocols that provides transport reachability between fabric endpoints." },
      { term: "Overlay Network", def: "A logical virtual network built using encapsulation tunnels (such as VXLAN or IPsec) across the physical underlay network." },
      { term: "Cisco APIC (ACI)", def: "The Application Policy Infrastructure Controller that manages Cisco ACI Spine-and-Leaf data center fabrics using Endpoint Groups (EPGs) and OpFlex." }
    ],
    commands: [
      { cmd: "netconf-yang", desc: "Enables the YANG-modeled NETCONF southbound management interface (TCP port 830 over SSH) on a Cisco IOS XE device", mode: "global" },
      { cmd: "restconf", desc: "Enables the YANG-modeled RESTCONF HTTPS southbound API on a Cisco IOS XE device", mode: "global" },
      { cmd: "show platform software yang-management process", desc: "Verifies the operational status of NETCONF/RESTCONF YANG management daemons on IOS XE", mode: "user" }
    ],
    tips: [
      "Always distinguish the three planes on exam questions: **Data Plane** = forwarding user packets in ASICs/TCAM (CEF, MAC table lookup, NAT translation, ACL dropping); **Control Plane** = OSPF/EIGRP/BGP/STP/ARP messages building tables; **Management Plane** = SSH, SNMP, Syslog, NETCONF.",
      "Keep **Northbound** vs. **Southbound** APIs straight by picturing the SDN Controller in the middle: **Northbound (NBI)** = above the controller (Controller <-> Apps/Scripts via **REST/JSON**); **Southbound (SBI)** = below the controller (Controller <-> Switches/Routers via **OpenFlow, OpFlex, NETCONF, SNMP, SSH**).",
      "Know the difference between **Underlay** (physical cables, switches, and IS-IS/OSPF IP transport) and **Overlay** (logical VXLAN tunnels carrying tenant traffic across the fabric)."
    ]
  },
  {
    id: "v2c17",
    volume: 2,
    chapter: 17,
    title: "Cisco Software-Defined Access (SDA)",
    domain: "Automation and Programmability",
    pages: "460-487",
    examTopics: [
      "6.3 Describe controller-based, software defined architecture (overlay, underlay, and fabric)",
      "6.4 Compare traditional campus device management with Cisco DNA Center enabled device management"
    ],
    summary: "This chapter details Cisco Software-Defined Access (SD-Access / SDA) and Cisco DNA Center (now Catalyst Center) for intent-based enterprise campus networks. It explains the SDA Underlay, Overlay, and Fabric node roles (Fabric Edge, Fabric Border, Fabric Control Plane), the three SDA fabric protocols—LISP (Control Plane), VXLAN (Data Plane), and Cisco TrustSec Scalable Group Tags / SGTs (Policy Plane)—and how Cisco DNA Center automates Design, Policy, Provisioning (PnP/LAN Automation), and Assurance compared to traditional campus management.",
    keyPoints: [
      "Cisco Software-Defined Access (SD-Access / SDA) is Cisco's Intent-Based Networking (IBN) campus fabric managed by Cisco DNA Center (Catalyst Center), delivering automated end-to-end segmentation and policy enforcement across wired and wireless users.",
      "The SDA Underlay is a routed Layer 3 access network (no Spanning Tree Protocol blocking links!) typically provisioned automatically by DNA Center's LAN Automation feature using IS-IS to provide IP reachability between all switches.",
      "The SDA Overlay uses three protocols working together: (1) LISP (Location/ID Separation Protocol) in the Control Plane, (2) VXLAN (Virtual Extensible LAN, UDP port 4789) in the Data Plane, and (3) Cisco TrustSec Scalable Group Tags (SGTs) in the Policy Plane.",
      "LISP replaces huge traditional routing tables on edge switches with a centralized Host Tracking Database on the Fabric Control Plane node that maps each endpoint's EID (Endpoint Identifier—the host's IP/MAC address, which stays the same as the user roams) to its current RLOC (Routing Locator—the Loopback IP of the Fabric Edge switch where the host is currently attached).",
      "VXLAN encapsulates the original Layer 2 Ethernet frame (along with the Virtual Network / VRF Instance ID [VNID] and the 16-bit Scalable Group Tag [SGT]) inside an outer UDP/IP packet (destination UDP port 4789) addressed from the ingress RLOC to the egress RLOC across the Layer 3 underlay.",
      "Cisco TrustSec coupled with Cisco Identity Services Engine (ISE) assigns each authenticated user/device to a Scalable Group with a 16-bit Scalable Group Tag (SGT); security policies (Contracts) are enforced based on SGT-to-SGT group identity rather than brittle IP-based ACLs!",
      "SDA Fabric Node Roles: Fabric Edge Node (access switch connecting wired endpoints/APs; registers EIDs and encapsulates/decapsulates VXLAN), Fabric Control Plane Node (maintains the LISP EID-to-RLOC mapping database), and Fabric Border Node (connects the SDA fabric to external networks, data centers, or the Internet).",
      "Cisco DNA Center provides four core workflow areas in its GUI: Design (network hierarchy, sites, golden IOS images, IP pools), Policy (Virtual Networks/macro-segmentation and SGT Group-Based Access Control/micro-segmentation), Provision (Plug-and-Play zero-touch onboarding and fabric deployment), and Assurance (AI/ML telemetry, client/network 360 health scores, and Path Trace).",
      "Compared to traditional campus management (manual box-by-box CLI, VLAN/ACL sprawl, reactive ping/traceroute troubleshooting), Cisco DNA Center translates business intent into device configurations via Southbound NETCONF/SNMP/SSH and ingests streaming telemetry for proactive Assurance."
    ],
    keyTerms: [
      { term: "Cisco DNA Center (Catalyst Center)", def: "Cisco's centralized enterprise controller and management platform for Intent-Based Networking, SD-Access, and AI/ML Assurance." },
      { term: "LISP (Location/ID Separation Protocol)", def: "The SDA Control Plane protocol that separates an endpoint's identity (EID) from its physical switch attachment point (RLOC)." },
      { term: "EID vs. RLOC", def: "In LISP, the Endpoint ID (EID) is the host's IP/MAC address, and the Routing Locator (RLOC) is the Loopback IP of the Fabric Edge switch serving that host." },
      { term: "VXLAN (Virtual Extensible LAN)", def: "The SDA Data Plane encapsulation protocol (UDP port 4789) that tunnels Layer 2 frames, VRF VNIDs, and SGT tags across the Layer 3 underlay." },
      { term: "Scalable Group Tag (SGT)", def: "A 16-bit Cisco TrustSec security group identifier carried inside the VXLAN header to enforce IP-agnostic micro-segmentation policies." },
      { term: "Fabric Edge / Control / Border Nodes", def: "SDA switch roles: Edge connects endpoints, Control Plane runs the LISP EID-to-RLOC map server, and Border connects the fabric to external networks." },
      { term: "Macro- vs. Micro-Segmentation", def: "In SDA, Macro-segmentation isolates traffic into separate Virtual Networks (VRFs), while Micro-segmentation filters between SGT groups within the same VRF." },
      { term: "Intent-Based Networking (IBN)", def: "A closed-loop networking model consisting of Translation (business intent to policy), Activation (provisioning across devices), and Assurance (continuous telemetry verification)." }
    ],
    commands: [
      { cmd: "show lisp session", desc: "Displays active LISP control-plane peering sessions between Fabric Edge/Border nodes and the Control Plane node", mode: "user" },
      { cmd: "show vxlan", desc: "Displays VXLAN tunnel interface status and VNI mappings on an SD-Access fabric switch", mode: "user" },
      { cmd: "show cts role-based permissions", desc: "Displays Cisco TrustSec Scalable Group Tag (SGT) security policies enforced on the switch", mode: "user" }
    ],
    tips: [
      "Memorize the 3 SD-Access Fabric plane protocols cold—this is a guaranteed CCNA 200-301 exam topic: **Control Plane = LISP** (maps EID to RLOC); **Data Plane = VXLAN** (encapsulates L2 frames + VNID + SGT over UDP 4789); **Policy Plane = Cisco TrustSec / SGTs** (with Cisco ISE).",
      "Memorize the 4 main tabs/pillars of Cisco DNA Center: **Design**, **Policy**, **Provision**, and **Assurance**.",
      "Understand why **VXLAN** is used in the SDA data plane instead of standard GRE or 802.1Q: VXLAN carries full Layer 2 Ethernet frames over a Layer 3 routed underlay AND includes header fields for both the 24-bit Virtual Network ID (VNID) and the 16-bit Scalable Group Tag (SGT)!"
    ]
  },
  {
    id: "v2c18",
    volume: 2,
    chapter: 18,
    title: "Understanding REST and JSON",
    domain: "Automation and Programmability",
    pages: "488-515",
    examTopics: [
      "6.5 Describe characteristics of REST-based APIs (CRUD, HTTP verbs, and data encoding)",
      "6.7 Interpret JSON encoded data"
    ],
    summary: "This chapter explains REST (Representational State Transfer) APIs and data serialization formats—focusing on JSON (JavaScript Object Notation) alongside XML and YAML. It details the six architectural constraints of RESTful APIs, how CRUD operations map to HTTP verbs (POST, GET, PUT/PATCH, DELETE) and HTTP status codes (2xx, 4xx, 5xx), URI structure and query parameters, API authentication tokens, and how to read and validate JSON objects, arrays, key/value pairs, and data types.",
    keyPoints: [
      "An Application Programming Interface (API) allows one software program to exchange variables and data structures directly with another program without scraping human-oriented CLI text output.",
      "REST (Representational State Transfer) is an API architecture defined by Roy Fielding with six constraints: (1) Client/Server architecture, (2) Stateless operation (each request contains all necessary context; no client session state stored on server), (3) Cacheable responses (explicitly marked cacheable or non-cacheable), (4) Layered System, (5) Uniform Interface, and (6) Code-on-Demand (optional).",
      "REST APIs perform CRUD (Create, Read, Update, Delete) operations on resources identified by URIs using standard HTTP/HTTPS verbs: Create = `POST`, Read = `GET`, Update (replace) = `PUT`, Update (partial modify) = `PATCH`, and Delete = `DELETE`.",
      "Common HTTP Response Status Codes in REST APIs: `200 OK` (successful GET/PUT/DELETE), `201 Created` (successful POST resource creation), `400 Bad Request` (malformed syntax/JSON), `401 Unauthorized` (missing or invalid authentication credentials/token), `403 Forbidden` (authenticated user lacks permission for the resource), `404 Not Found` (URI resource does not exist), and `500 Internal Server Error` (server-side failure).",
      "A REST API request URI consists of `<scheme>://<authority>/<path>?<query>` (e.g., `https://dnac.example.com/dna/intent/api/v1/network-device?hostname=R1`), accompanied by HTTP Headers (such as `Content-Type: application/json`, `Accept: application/json`, and `X-Auth-Token` or `Authorization: Bearer <token>`) and an optional Request Body.",
      "JSON (JavaScript Object Notation) is the most widely used data serialization format for REST APIs because it is human-readable and maps directly to Python dictionaries/lists and JavaScript objects/arrays.",
      "JSON syntax rules: Objects are enclosed in curly braces `{ }` and contain comma-separated `\"key\": value` pairs; every key MUST be a double-quoted string (`\"key\"`), separated from its value by a colon `:`. Single quotes (`'key'`) and trailing commas after the last item in an object or array are INVALID in strict JSON!",
      "JSON Arrays are ordered lists of values enclosed in square brackets `[ ]`, separated by commas (e.g., `[\"Gi0/0\", \"Gi0/1\", \"Gi0/2\"]`).",
      "Valid JSON value data types are: String (always in double quotes `\"text\"`), Number (integer or floating-point without quotes, e.g., `100` or `15.4`), Boolean (`true` or `false` in lowercase without quotes), `null` (lowercase without quotes), Object (`{ ... }`), and Array (`[ ... ]`).",
      "Compared to JSON: XML uses angle-bracket opening and closing tags (`<ip>10.1.1.1</ip>`); YAML uses whitespace indentation and hyphens (`-`) for lists without braces or brackets (and is a superset of JSON commonly used in Ansible playbooks)."
    ],
    keyTerms: [
      { term: "REST (Representational State Transfer)", def: "A stateless client-server API architecture that uses standard HTTP/HTTPS verbs and URIs to manipulate data resources." },
      { term: "CRUD Operations", def: "The four basic data actions—Create (POST), Read (GET), Update (PUT/PATCH), and Delete (DELETE)—performed via REST APIs." },
      { term: "Stateless Constraint", def: "The REST requirement that every HTTP request from a client must contain all information needed to process it, without relying on stored server session state." },
      { term: "JSON Object", def: "An unordered collection of comma-separated \"key\": value pairs enclosed in curly braces { }." },
      { term: "JSON Array", def: "An ordered sequence of comma-separated values enclosed in square brackets [ ]." },
      { term: "Data Serialization", def: "Converting structured in-memory variables (objects, lists, dictionaries) into a standard text/byte stream (JSON, XML, YAML) for network transmission." },
      { term: "HTTP Status Code", def: "A 3-digit numeric code returned by an HTTP/REST server indicating success (2xx), redirection (3xx), client error (4xx), or server error (5xx)." },
      { term: "Curl & Postman", def: "Developer tools used to craft, send, and inspect HTTP/REST API requests and JSON responses from the command line (curl) or a GUI (Postman)." }
    ],
    commands: [
      { cmd: "curl -X GET -H \"Accept: application/json\" -H \"X-Auth-Token: token\" https://controller/api/v1/resource", desc: "Sends an authenticated HTTP GET request to a REST API endpoint requesting JSON-formatted output", mode: "host" },
      { cmd: "curl -X POST -H \"Content-Type: application/json\" -d '{\"name\":\"VLAN10\"}' https://controller/api/v1/vlan", desc: "Sends an HTTP POST request with a JSON payload body to create a new resource via REST API", mode: "host" }
    ],
    tips: [
      "Memorize the **CRUD <-> HTTP Verb** mapping cold: **C**reate = **POST**, **R**ead = **GET**, **U**pdate = **PUT** (full replacement) / **PATCH** (partial update), **D**elete = **DELETE**.",
      "Memorize the 5 ways CCNA exam questions try to sneak invalid JSON past you: (1) missing double quotes around a key (`{ip: \"10.1.1.1\"}` is INVALID), (2) using single quotes (`{'ip': '10.1.1.1'}` is INVALID), (3) using `=` instead of `:` (`{\"ip\" = \"10.1.1.1\"}` is INVALID), (4) capitalizing booleans (`True` or `False` is INVALID in JSON—must be lowercase `true` or `false`), and (5) mismatched `{}` vs `[]`.",
      "Distinguish HTTP **401 Unauthorized** (you didn't authenticate or your token expired) vs. **403 Forbidden** (you authenticated successfully, but your account role is not allowed to perform that action)."
    ]
  },
  {
    id: "v2c19",
    volume: 2,
    chapter: 19,
    title: "Understanding Ansible, Puppet, and Chef",
    domain: "Automation and Programmability",
    pages: "516-539",
    examTopics: [
      "6.6 Recognize the capabilities of configuration management mechanisms Puppet, Chef, and Ansible"
    ],
    summary: "This chapter compares the three configuration management and network automation tools tested on the CCNA 200-301 exam: Ansible, Puppet, and Chef. It explains configuration drift, Infrastructure as Code (IaC), imperative vs. declarative configuration, Agentless (Push) vs. Agent-Based (Pull) architectures, and the exact file names, data languages (YAML, Puppet DSL, Ruby), and transport protocols used by each tool.",
    keyPoints: [
      "Configuration management tools solve Configuration Drift (where manual box-by-box CLI changes over time cause devices to deviate from the organization's standardized baseline configuration) and automate bulk provisioning, compliance auditing, and remediation.",
      "All three tools support Infrastructure as Code (IaC), storing network configuration files and templates in version-control repositories (like Git) so changes are peer-reviewed, repeatable, and auditable.",
      "Ansible (owned by Red Hat) uses an **Agentless** architecture and a **Push** model: no software agent is installed on Cisco routers/switches; instead, an Ansible Control Node pushes changes to devices defined in its **Inventory** file over **SSH / CLI** or **NETCONF**.",
      "Ansible uses human-readable **YAML** files called **Playbooks** (which contain Plays and Tasks invoking modules like `ios_config` or `ios_command`) and **Jinja2** templates to generate device-specific configurations using variables.",
      "Puppet uses an **Agent-Based** architecture (or proxy agent on an external host for switches that cannot run a native agent) and a **Pull** model: managed devices periodically poll the central **Puppet Master** (Server) over HTTPS (TCP port 8140) to pull their compiled catalog and enforce the desired state.",
      "Puppet configurations are written in a declarative, Puppet-specific Domain-Specific Language (Ruby-based **Puppet DSL**) stored in files called **Manifests** (`.pp` extension), organized into reusable **Modules**, **Classes**, and **Resources**.",
      "Chef uses an **Agent-Based** architecture and a **Pull** model: **Chef Client** agents running on managed nodes periodically check in with the central **Chef Server** over HTTPS (created by an engineer from a **Chef Workstation** using the `knife` CLI tool) to pull and execute configurations.",
      "Chef configurations are written in procedural/imperative **Ruby** DSL stored in files called **Recipes**, which are grouped together into **Cookbooks** (along with attributes, files, and templates)."
    ],
    keyTerms: [
      { term: "Ansible", def: "An agentless, push-model configuration management tool that uses YAML Playbooks, Inventory files, and Jinja2 templates over SSH or NETCONF." },
      { term: "Puppet", def: "An agent-based, pull-model configuration management tool that uses declarative Puppet DSL Manifests (.pp) served by a Puppet Master over TCP 8140." },
      { term: "Chef", def: "An agent-based, pull-model configuration management tool that uses Ruby-based Recipes grouped into Cookbooks managed via a Chef Workstation and Chef Server." },
      { term: "Agentless vs. Agent-Based", def: "Agentless tools (Ansible) connect over existing SSH/NETCONF without installing device software; Agent-based tools (Puppet, Chef) run client software on or for managed nodes." },
      { term: "Push vs. Pull Model", def: "In a Push model (Ansible), the control server initiates connections to push configs; in a Pull model (Puppet, Chef), managed agents poll the server to pull configs." },
      { term: "Configuration Drift", def: "The gradual inconsistency that develops across network devices when engineers make manual ad-hoc CLI changes outside a central automation system." },
      { term: "Playbook / Manifest / Recipe & Cookbook", def: "The core configuration files of each tool: Ansible = Playbook (YAML); Puppet = Manifest (Puppet DSL); Chef = Recipe inside a Cookbook (Ruby)." },
      { term: "Ansible Inventory", def: "The file (INI or YAML format) on an Ansible control node that lists the IP addresses/hostnames and logical groups of managed network devices." }
    ],
    commands: [
      { cmd: "ansible-playbook playbook.yml -i inventory.ini", desc: "Executes an Ansible YAML playbook against the target network devices listed in the inventory file", mode: "host" },
      { cmd: "puppet agent --test", desc: "Manually triggers a Puppet agent node to pull and apply its compiled catalog from the Puppet Master", mode: "host" },
      { cmd: "knife cookbook upload cookbook-name", desc: "Uploads a Chef cookbook from the engineer's Chef Workstation to the central Chef Server", mode: "host" }
    ],
    tips: [
      "Memorize the **Ansible vs. Puppet vs. Chef** comparison table—it is one of the highest-yield tables in Volume 2: **Ansible** = Agentless + Push + YAML + **Playbooks/Inventory/Templates** (SSH/NETCONF); **Puppet** = Agent + Pull + Puppet DSL + **Manifests/Modules** (Puppet Master, TCP 8140); **Chef** = Agent + Pull + Ruby + **Recipes/Cookbooks** (Chef Server + Workstation + `knife`).",
      "Use word association for Chef: a **Chef** works at a **Workstation**, reads a **Cookbook** full of **Recipes**, and uses a **knife** tool!",
      "Remember why **Ansible** is so popular for Cisco IOS routers and switches: traditional IOS devices cannot easily install a Linux Ruby agent, whereas Ansible is **agentless** and connects over standard **SSH** or **NETCONF**."
    ]
  }
];
