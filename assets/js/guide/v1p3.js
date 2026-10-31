export default [
  {
    id: "v1c19",
    volume: 1,
    chapter: 19,
    title: "Understanding OSPF Concepts",
    domain: "IP Connectivity",
    pages: "440-467",
    examTopics: [
      "3.2.b Administrative distance",
      "3.2.c Routing protocol metric",
      "3.4.a Neighbor adjacencies",
      "3.4.b Point-to-point",
      "3.4.c Broadcast (DR/BDR selection)",
      "3.4.d Router ID"
    ],
    summary: "This chapter introduces dynamic routing protocol fundamentals and explores how Open Shortest Path First version 2 (OSPFv2) operates as a link-state interior gateway protocol. It contrasts distance vector, advanced distance vector, and link-state algorithms while explaining how routers use administrative distance and metrics to select optimal routes. Finally, it details OSPF neighbor states, link-state database (LSDB) exchange, Designated Router (DR) elections, Shortest Path First (SPF) route calculation, and multiarea OSPF design with Type 1, Type 2, and Type 3 LSAs.",
    keyPoints: [
      "Interior Gateway Protocols (IGPs) exchange routes inside a single autonomous system (AS), whereas Exterior Gateway Protocols (EGPs) like BGP route between different autonomous systems.",
      "Classless routing protocols (RIPv2, EIGRP, OSPF) include subnet masks in routing updates to support VLSM and manual route summarization, and they transmit updates using IP multicast addresses.",
      "When multiple routing protocols provide a route to the same prefix, Cisco IOS compares Administrative Distance (AD) first; lower AD wins (Connected=0, Static=1, eBGP=20, EIGRP=90, OSPF=110, IS-IS=115, RIP=120, EIGRP external=170, iBGP=200).",
      "OSPF routers progress through three main operational phases: becoming neighbors on shared data links, exchanging Link-State Advertisements (LSAs) to synchronize their Link-State Databases (LSDBs), and running the Dijkstra SPF algorithm to compute best routes.",
      "OSPFv2 encapsulates messages directly in IP headers using IP protocol number 89 and sends periodic Hello packets to the All-SPF-Routers multicast address 224.0.0.5.",
      "Each OSPF router identifies itself with a 32-bit Router ID (RID) formatted in dotted-decimal notation, derived from an explicit configuration, an active loopback IP, or an active physical interface IP.",
      "Two routers reach the 2-Way state once each sees its own RID listed in the neighbor's Hello packet and verifies that all Hello parameters match.",
      "Database synchronization begins with Database Description (DD) packets acting as LSA checklists during the Exchange state, followed by Link-State Request (LSR) and Link-State Update (LSU) packets in the Loading state until reaching the Full state.",
      "Routers maintain their adjacencies and LSDBs by sending Hellos every Hello Interval, monitoring neighbor silence against the Dead Interval (default 4x Hello), flooding updated LSAs immediately on topology changes, and reflooding unchanged LSAs every 30 minutes.",
      "On multiaccess broadcast networks (Ethernet), OSPF elects a Designated Router (DR) and Backup DR (BDR); DROther routers send updates to 224.0.0.6, the DR relays them to 224.0.0.5, and DROther-to-DROther pairs remain in the 2-Way state.",
      "OSPF calculates a route's metric (cost) by summing the OSPF interface costs of all outgoing interfaces along the path from the local router to the destination subnet.",
      "Dividing a large OSPF network (typically over 50 routers) into areas connected via Area Border Routers (ABRs) to Backbone Area 0 reduces LSDB memory usage, shrinks SPF CPU time, and confines SPF recalculations from link flaps to a single area.",
      "Type 1 (Router) LSAs describe a router's links and RID within an area, Type 2 (Network) LSAs are originated by the DR on broadcast links with at least one neighbor, and Type 3 (Summary) LSAs are advertised by ABRs for prefixes in other areas."
    ],
    keyTerms: [
      { term: "Administrative Distance (AD)", def: "A locally significant trustworthiness rating (0 to 255) used by a router to choose between routes to the same prefix learned from different routing sources." },
      { term: "Link-State Advertisement (LSA)", def: "A data structure stored in the LSDB and carried inside LSU packets that describes a piece of the OSPF network topology or subnet reachability." },
      { term: "Link-State Database (LSDB)", def: "The complete collection of LSAs known to an OSPF router, which is identical across all routers within the same OSPF area." },
      { term: "Shortest Path First (SPF)", def: "The Dijkstra mathematical algorithm that each OSPF router runs independently against its local LSDB to build a loop-free shortest-path tree to every subnet." },
      { term: "Router ID (RID)", def: "A unique 32-bit dotted-decimal identifier assigned to each OSPF router to identify it in Hello packets and LSAs." },
      { term: "2-Way State", def: "The stable OSPF neighbor state indicating bidirectional Hello visibility and matching parameters; DROther pairs remain in this state on broadcast links." },
      { term: "Full State", def: "The OSPF neighbor state indicating that two routers have completely synchronized their LSDBs and formed a full adjacency." },
      { term: "Designated Router (DR)", def: "The router elected on a broadcast or multiaccess segment to centralize LSA flooding and originate the Type 2 Network LSA for that subnet." },
      { term: "Backup Designated Router (BDR)", def: "The router elected on a broadcast segment to form full adjacencies with all routers, monitor the DR, and immediately assume DR duties if the DR fails." },
      { term: "Area Border Router (ABR)", def: "An OSPF router that has interfaces attached to the backbone area (Area 0) and at least one nonbackbone area, generating Type 3 Summary LSAs between them." },
      { term: "Backbone Area (Area 0)", def: "The core OSPF area to which all nonbackbone areas must physically or logically connect via an ABR to exchange interarea routing information." },
      { term: "Link-State Update (LSU)", def: "The OSPF packet type used during database exchange and flooding to transport one or more LSAs between neighboring routers." }
    ],
    commands: [
      { cmd: "show ip ospf neighbor", desc: "Displays OSPF neighbors, their RID, priority, neighbor state, dead timer, IPv4 address, and local interface.", mode: "user" },
      { cmd: "show ip route", desc: "Displays the IPv4 routing table, including administrative distance and metric in brackets for each route.", mode: "user" },
      { cmd: "show ip ospf database", desc: "Lists a summary of all LSAs in the router's Link-State Database organized by area and LSA type.", mode: "user" },
      { cmd: "ip route prefix mask next-hop ad", desc: "Configures an IPv4 static route with a custom administrative distance (such as a floating static route).", mode: "global" },
      { cmd: "bandwidth kbps", desc: "Sets the informational interface bandwidth in Kbps used by IOS to calculate default OSPF interface cost.", mode: "interface" }
    ],
    tips: [
      "Remember the two OSPF IPv4 multicast addresses: 224.0.0.5 is All-SPF-Routers (used by Hellos and by the DR sending to everyone), while 224.0.0.6 is All-SPF-DRs (used by DROthers sending updates to the DR and BDR).",
      "When calculating end-to-end OSPF route cost from a diagram, sum ONLY the outgoing interface costs along the path from the source router to the destination subnet; ignore incoming interfaces.",
      "Two DROther routers on the same Ethernet LAN normally settle in the 2WAY/DROTHER state—this is expected behavior, not a configuration error.",
      "Type 1 LSAs exist for every router in an area; Type 2 LSAs exist only on subnets where a DR is elected and has at least one neighbor; Type 3 LSAs do not exist in a single-area OSPF network."
    ]
  },
  {
    id: "v1c20",
    volume: 1,
    chapter: 20,
    title: "Implementing OSPF",
    domain: "IP Connectivity",
    pages: "468-497",
    examTopics: [
      "3.2.b Administrative distance",
      "3.2.c Routing protocol metric",
      "3.4.a Neighbor adjacencies",
      "3.4.b Point-to-point",
      "3.4.c Broadcast (DR/BDR selection)",
      "3.4.d Router ID"
    ],
    summary: "This chapter covers the practical configuration and verification of single-area and multiarea OSPFv2 on Cisco IOS routers. It compares traditional router-mode network statements using wildcard masks against explicit interface-mode configuration with ip ospf process-id area area-id. Additionally, it details how to control the OSPF Router ID, secure links with passive interfaces, advertise default routes using default-information originate, tune interface costs via ip ospf cost or auto-cost reference-bandwidth, and configure equal-cost load balancing.",
    keyPoints: [
      "The router ospf process-id global command starts an OSPF process using a locally significant process ID between 1 and 65,535 that does not need to match across neighboring routers.",
      "The network ip-address wildcard-mask area area-id router subcommand matches local interfaces whose IPv4 addresses fit the address and wildcard mask (0 = match bit/octet, 255 = ignore) and enables OSPF on them in the specified area.",
      "Alternatively, OSPF can be enabled directly on an interface without wildcard masks using the ip ospf process-id area area-id interface subcommand.",
      "When interface configuration is used, show ip protocols displays 'Routing on Interfaces Configured Explicitly' and show ip ospf interface displays 'Attached via Interface Enable' instead of 'Attached via Network Statement'.",
      "Cisco IOS selects the OSPF Router ID at process startup in strict order: (1) configured router-id value, (2) highest IPv4 address on any loopback interface in an up state, (3) highest IPv4 address on any non-loopback interface whose first status code (line status) is up.",
      "Changing the router-id or loopback address after OSPF is running does not take effect until the router reloads or an engineer runs clear ip ospf process in privileged EXEC mode.",
      "Configuring an interface as passive (via passive-interface or passive-interface default) stops OSPF from sending or processing Hello messages on that link while still advertising the connected subnet's prefix in the router's Type 1 LSA.",
      "The default-information originate router subcommand causes OSPF to advertise a default route (0.0.0.0/0, shown as O*E2) into OSPF if the router already has a working default route in its routing table; adding the always keyword advertises it unconditionally.",
      "Default OSPF interface cost is calculated as Reference_Bandwidth / Interface_Bandwidth (rounded down to a minimum integer of 1); because the default reference bandwidth is 100 Mbps, FastEthernet (100 Mbps), GigabitEthernet (1 Gbps), and 10G links all default to cost 1.",
      "Engineers can tune OSPF interface costs in three ways: directly on the interface with ip ospf cost (1 to 65,535), globally across the OSPF process with auto-cost reference-bandwidth (in Mbps), or indirectly via the interface bandwidth command (in Kbps, discouraged).",
      "By default, OSPF installs up to 4 equal-cost paths to the same destination subnet and load-balances traffic per destination IP address; the path limit can be adjusted with the maximum-paths router subcommand."
    ],
    keyTerms: [
      { term: "Process ID", def: "A locally significant integer (1 to 65,535) that identifies a specific OSPF routing process instance on a single Cisco router." },
      { term: "Wildcard Mask", def: "A 32-bit mask used in OSPF network commands where binary 0 bits require an exact match against local interface IP addresses and binary 1 bits are ignored." },
      { term: "Loopback Interface", def: "A virtual software interface in IOS that remains in an up/up state unless administratively shut down, often used to provide a stable OSPF Router ID." },
      { term: "Passive Interface", def: "An OSPF-enabled interface that does not send or process OSPF Hello packets and forms no neighbors, but whose connected subnet is still advertised by OSPF." },
      { term: "Reference Bandwidth", def: "The numerator value (default 100 Mbps) in OSPF's automatic cost formula (Reference Bandwidth / Interface Bandwidth)." },
      { term: "Interface Bandwidth", def: "The configurable informational speed setting on an IOS interface (in Kbps) used as the denominator when calculating default routing metrics." },
      { term: "Equal-Cost Multi-Path (ECMP)", def: "The routing table behavior of installing multiple routes to the same prefix when their calculated metrics tie, controlled by maximum-paths." },
      { term: "Default Route Origination", def: "The injection of a 0.0.0.0/0 external Type 2 route into an OSPF domain by an edge router using the default-information originate command." }
    ],
    commands: [
      { cmd: "router ospf process-id", desc: "Enters OSPF router configuration mode for the specified locally significant process ID (1–65535).", mode: "global" },
      { cmd: "network ip-address wildcard-mask area area-id", desc: "Enables OSPF on local interfaces matched by the address/wildcard pair and assigns them to the given area.", mode: "router" },
      { cmd: "ip ospf process-id area area-id", desc: "Directly enables OSPF on the interface and assigns it to the specified process and area.", mode: "interface" },
      { cmd: "router-id id", desc: "Explicitly configures the 32-bit dotted-decimal OSPF Router ID for the routing process.", mode: "router" },
      { cmd: "clear ip ospf process", desc: "Resets the OSPF process, tearing down adjacencies and forcing OSPF to re-evaluate and apply a new Router ID.", mode: "privileged" },
      { cmd: "passive-interface type number", desc: "Disables sending and receiving OSPF Hellos on the specified interface while still advertising its connected subnet.", mode: "router" },
      { cmd: "passive-interface default", desc: "Makes all OSPF interfaces passive by default; combine with 'no passive-interface' on links facing OSPF neighbors.", mode: "router" },
      { cmd: "default-information originate [always]", desc: "Advertises a 0.0.0.0/0 default route into OSPF when a default route exists locally (or unconditionally with 'always').", mode: "router" },
      { cmd: "ip ospf cost cost", desc: "Directly sets the OSPF cost (1–65535) of an interface, overriding the reference-bandwidth formula.", mode: "interface" },
      { cmd: "auto-cost reference-bandwidth mbps", desc: "Changes the OSPF reference bandwidth (in Mbps) used to calculate default interface costs.", mode: "router" },
      { cmd: "maximum-paths number", desc: "Sets the maximum number of equal-cost OSPF routes (default 4) that can be installed in the IPv4 routing table.", mode: "router" },
      { cmd: "show ip protocols", desc: "Displays active routing protocols, process ID, Router ID, network statements or explicit interfaces, passive interfaces, and AD.", mode: "user" },
      { cmd: "show ip ospf interface brief", desc: "Displays a one-line summary per OSPF-enabled interface including PID, Area, IP/mask, Cost, DR/BDR state, and neighbor counts.", mode: "user" },
      { cmd: "show ip ospf interface [type number]", desc: "Shows detailed OSPF interface parameters including network type, timers, DR/BDR RIDs, attachment method, and passive status.", mode: "user" },
      { cmd: "show ip ospf", desc: "Displays global OSPF process information including the active Router ID, area details, and SPF execution statistics.", mode: "user" },
      { cmd: "show ip route ospf", desc: "Displays only OSPF-learned routes currently installed in the IPv4 routing table.", mode: "user" }
    ],
    tips: [
      "Watch the units when tuning OSPF cost: auto-cost reference-bandwidth uses Megabits per second (Mbps), whereas the interface bandwidth command uses Kilobits per second (Kbps).",
      "For an unconfigured physical interface to be chosen as the OSPF RID in Step 3, only the first status code (line status) must be 'up'—even an 'up/down' interface qualifies!",
      "If Simlet access blocks 'show running-config', use 'show ip protocols' to see network statements and passive interfaces, and 'show ip ospf interface brief' to see which interfaces are in which areas.",
      "Passive interfaces still appear in 'show ip ospf interface brief'; run 'show ip ospf interface <id>' and look for 'No Hellos (Passive interface)' to verify passive status."
    ]
  },
  {
    id: "v1c21",
    volume: 1,
    chapter: 21,
    title: "OSPF Network Types and Neighbors",
    domain: "IP Connectivity",
    pages: "498-519",
    examTopics: [
      "3.4.a Neighbor adjacencies",
      "3.4.b Point-to-point",
      "3.4.c Broadcast (DR/BDR selection)",
      "3.4.d Router ID"
    ],
    summary: "This chapter examines OSPF broadcast and point-to-point network types, DR/BDR election mechanics, and troubleshooting OSPF neighbor adjacencies. It explains how priority and Router ID determine the DR and BDR without preemption, and how converting two-router Ethernet WAN links to point-to-point eliminates DR/BDR elections and Type 2 LSAs. Finally, it categorizes every OSPF neighbor requirement into issues that prevent neighbor formation entirely versus issues (like MTU or network-type mismatches) that allow neighbor states to form while preventing route installation.",
    keyPoints: [
      "Both the broadcast (default on Ethernet) and point-to-point (default on serial links) OSPF network types dynamically discover neighbors via multicast Hellos to 224.0.0.5, default to a 10-second Hello and 40-second Dead interval, and differ primarily in whether a DR/BDR is elected.",
      "During a DR/BDR election on a broadcast network, the router with the highest OSPF interface priority (1 to 255, default 1) wins; if priorities tie, the router with the highest Router ID wins. A priority of 0 prevents a router from ever becoming DR or BDR.",
      "OSPF DR/BDR elections are non-preemptive: if a router with a higher priority or RID joins an active broadcast segment, it becomes a DROther until the existing DR or BDR fails or the process is reset.",
      "When the DR fails, the current BDR is immediately promoted to DR, and a new election is held among the remaining eligible DROther routers to choose a new BDR.",
      "In 'show ip ospf interface brief', the State column shows the local router's role on that link (DR, BDR, DROTH, P2P, or DOWN), and the 'Nbrs F/C' column lists Full (adjacent) neighbors over Total discovered (2-Way or higher) neighbors.",
      "Configuring 'ip ospf network point-to-point' on both ends of a two-router Ethernet WAN link disables DR/BDR election, avoids generating a Type 2 Network LSA, and displays the neighbor state as 'FULL/ -' and the interface state as 'P2P'.",
      "For two OSPF routers to become neighbors (reach 2-Way state and appear in 'show ip ospf neighbor'), they must be up/up, reside in the same IPv4 subnet, belong to the same OSPF area, have matching Hello and Dead timers, have unique Router IDs, pass authentication, not be passive, and not have OSPF shut down.",
      "The OSPF Process ID is locally significant and does NOT need to match between neighboring routers, nor do OSPF interface priorities or OSPF interface costs need to match.",
      "Issuing 'shutdown' under router ospf tears down all neighbors, empties the LSDB, and removes OSPF routes while preserving configuration and showing interfaces in a 'DOWN' state in 'show ip ospf interface brief'.",
      "If two neighboring interfaces have mismatched IPv4 MTU settings, they still appear in 'show ip ospf neighbor' and reach 2-Way/ExStart, but database exchange fails and the adjacency resets.",
      "If one router interface is set to 'broadcast' and the other to 'point-to-point' (and timers match), both routers reach the FULL state and exchange LSAs, but SPF fails to install any OSPF routes through that link because one router expects a Type 2 LSA and the other does not."
    ],
    keyTerms: [
      { term: "Broadcast Network Type", def: "The default OSPF network type on Ethernet interfaces that dynamically discovers neighbors, elects a DR and BDR, and uses 10/40-second Hello/Dead timers." },
      { term: "Point-to-Point Network Type", def: "The OSPF network type for two-router links that dynamically discovers neighbors without electing a DR or BDR and uses 10/40-second timers." },
      { term: "DROther", def: "An OSPF router on a broadcast network that is neither the DR nor the BDR; it forms Full adjacencies with the DR/BDR and stays 2-Way with other DROthers." },
      { term: "OSPF Interface Priority", def: "A per-interface integer (0 to 255, default 1) used as the primary criterion when electing a Designated Router and Backup Designated Router." },
      { term: "Non-Preemptive Election", def: "The OSPF DR/BDR behavior in which an existing DR or BDR retains its role even when a router with a higher priority or RID joins the subnet." },
      { term: "Hello Interval", def: "The per-interface timer (default 10 seconds on broadcast and point-to-point links) defining how often an OSPF router sends Hello packets." },
      { term: "Dead Interval", def: "The per-interface timer (default 40 seconds, or 4x Hello) defining how long a router waits without hearing a neighbor's Hello before declaring it down." },
      { term: "MTU Mismatch", def: "A condition where neighboring interfaces have different IP MTU sizes, allowing OSPF neighbor discovery but causing DD/LSDB exchange to fail." },
      { term: "Network Type Mismatch", def: "A condition where one neighbor uses broadcast and the other uses point-to-point, resulting in a FULL adjacency that fails to calculate or install IPv4 routes." }
    ],
    commands: [
      { cmd: "ip ospf network {broadcast | point-to-point}", desc: "Configures the OSPF network type on an interface to either elect a DR/BDR (broadcast) or skip DR/BDR election (point-to-point).", mode: "interface" },
      { cmd: "ip ospf priority value", desc: "Sets the OSPF priority (0–255, default 1) on an interface to influence DR/BDR elections; 0 disqualifies the interface.", mode: "interface" },
      { cmd: "ip ospf hello-interval seconds", desc: "Configures the interval in seconds between OSPF Hello packets sent out the interface (automatically sets Dead interval to 4x unless manually set).", mode: "interface" },
      { cmd: "ip ospf dead-interval seconds", desc: "Configures the time in seconds that a router waits without receiving a Neighbor's Hello before declaring the neighbor down.", mode: "interface" },
      { cmd: "shutdown", desc: "Disables the OSPF routing process, dropping neighbors, clearing the LSDB and OSPF routes while keeping the configuration intact.", mode: "router" },
      { cmd: "no shutdown", desc: "Re-enables a previously shut down OSPF routing process.", mode: "router" },
      { cmd: "ip mtu bytes", desc: "Sets the maximum IPv4 packet size (in bytes) that can be forwarded out the interface without fragmentation.", mode: "interface" },
      { cmd: "show interfaces", desc: "Displays detailed interface status, MAC address, bandwidth, and configured MTU.", mode: "user" }
    ],
    tips: [
      "Contrast STP and OSPF elections: STP Root Bridge election prefers the LOWEST priority/MAC and DOES preempt; OSPF DR/BDR election prefers the HIGHEST priority/RID and DOES NOT preempt.",
      "In 'show ip ospf neighbor', the State column shows the NEIGHBOR's role (e.g., FULL/DR means the neighbor is DR); in 'show ip ospf interface brief', the State column shows the LOCAL router's role.",
      "If two routers reach FULL state in 'show ip ospf neighbor' (one showing FULL/- and the other FULL/DR or FULL/BDR) but no OSPF routes are installed in 'show ip route', suspect an OSPF network type mismatch (broadcast vs. point-to-point).",
      "On a broadcast LAN with N routers (where N >= 3), a DROther router will always show '2/(N-1)' in the 'Nbrs F/C' column of 'show ip ospf interface brief' because it only forms Full adjacencies with the DR and BDR."
    ]
  },
  {
    id: "v1c22",
    volume: 1,
    chapter: 22,
    title: "Fundamentals of IP Version 6",
    domain: "Network Fundamentals",
    pages: "522-539",
    examTopics: [
      "1.8 Configure and verify IPv6 addressing and prefix"
    ],
    summary: "This chapter explains the motivation behind migrating from IPv4 to IPv6 and introduces the core protocols, header structure, routing behavior, and hexadecimal addressing conventions of IPv6. It covers how short-term measures like NAT and CIDR slowed IPv4 exhaustion while IPv6 provides a permanent 128-bit address space. Finally, it teaches the exact rules for compressing and expanding 32-digit hexadecimal IPv6 addresses and calculating the IPv6 prefix (subnet ID) from any address and prefix length.",
    keyPoints: [
      "IPv4 address exhaustion drove the creation of short-term remedies (NAT/PAT and CIDR) and the long-term replacement protocol IPv6, which expands addresses from 32 bits to 128 bits (3.4 x 10^38 addresses).",
      "The IPv6 base header is a fixed 40 bytes long (including 16-byte Source and Destination IPv6 Address fields) and is intentionally simplified compared to IPv4 so routers can process packets faster.",
      "Migrating to IPv6 requires updated companion protocols: OSPFv3 replaces OSPFv2, EIGRPv6 replaces EIGRPv4, RIPng replaces RIPv2, MP-BGP4 extends BGP, ICMPv6 replaces ICMPv4, and Neighbor Discovery Protocol (NDP) replaces ARP.",
      "Dual-stack operation allows routers and hosts to run both IPv4 and IPv6 simultaneously during long-term network migrations, forwarding each protocol using its own separate routing table.",
      "An unabbreviated IPv6 address consists of 32 hexadecimal digits grouped into 8 quartets (hextets) of 4 hex digits each (16 bits per quartet, 4 bits per hex digit), separated by colons.",
      "Rule 1 for abbreviating an IPv6 address: within each quartet, remove any leading (leftmost) zeros, leaving at least a single '0' if all four digits in that quartet are zero (never remove trailing zeros!).",
      "Rule 2 for abbreviating an IPv6 address: replace the single longest contiguous sequence of two or more all-zero quartets with a double colon (::); '::' can appear at most once in any IPv6 address.",
      "To expand an abbreviated IPv6 address back to 32 hex digits, pad every existing quartet with leading zeros to 4 digits and replace '::' with enough '0000' quartets to bring the total quartet count to 8.",
      "IPv6 represents masks exclusively using slash prefix-length notation (/0 through /128), which specifies how many leftmost bits form the IPv6 prefix (subnet ID).",
      "To calculate the IPv6 prefix from an address and a prefix length /P that is a multiple of 4, divide P by 4 to find the number of hex digits to copy unchanged, zero out all remaining hex digits to the right, and apply standard IPv6 abbreviation rules."
    ],
    keyTerms: [
      { term: "IPv4 Address Exhaustion", def: "The depletion of unallocated public IPv4 address blocks at IANA and the five Regional Internet Registries (RIRs)." },
      { term: "Dual Stack", def: "A migration and coexistence strategy in which network devices and hosts run both IPv4 and IPv6 protocol stacks concurrently." },
      { term: "Quartet (Hextet)", def: "One group of four hexadecimal digits (representing 16 binary bits) separated by colons in an IPv6 address." },
      { term: "Double Colon (::)", def: "The IPv6 abbreviation symbol that replaces one contiguous block of two or more all-zero quartets, usable only once per address." },
      { term: "Prefix Length", def: "An integer from 0 to 128 written after a forward slash (e.g., /64) that indicates how many leading bits of an IPv6 address identify the subnet prefix." },
      { term: "IPv6 Prefix (Subnet ID)", def: "The network/subnet identifier calculated by keeping the first P bits of an IPv6 address (per the /P prefix length) and setting the remaining host bits to zero." },
      { term: "OSPFv3", def: "Version 3 of the Open Shortest Path First link-state routing protocol, designed to advertise IPv6 prefixes." },
      { term: "Neighbor Discovery Protocol (NDP)", def: "An ICMPv6-based protocol suite in IPv6 that replaces IPv4 ARP and provides router discovery, prefix discovery, SLAAC, and DAD." }
    ],
    commands: [],
    tips: [
      "Never drop trailing zeros inside a quartet! For example, 'FE00' stays 'FE00', and zeroing the last two hex digits of '9ABC' under a /56 mask produces '9A00', NOT '9A'.",
      "If an IPv6 address has two separate runs of all-zero quartets, RFC 5952 states you should compress the longest run with '::' (or the leftmost run if they are equal in length) and write the other run as ':0:0:'.",
      "When finding the prefix for non-quartet boundaries like /56 (14 hex digits), /60 (15 hex digits), /40 (10 hex digits), or /36 (9 hex digits), first expand any '::' so you count the exact hex digit positions before zeroing the remaining digits."
    ]
  },
  {
    id: "v1c23",
    volume: 1,
    chapter: 23,
    title: "IPv6 Addressing and Subnetting",
    domain: "Network Fundamentals",
    pages: "540-553",
    examTopics: [
      "1.8 Configure and verify IPv6 addressing and prefix",
      "1.9.a Global unicast",
      "1.9.b Unique local"
    ],
    summary: "This chapter compares public IPv6 Global Unicast Addresses (GUAs) and private IPv6 Unique Local Addresses (ULAs) and walks through the mechanics of IPv6 subnetting. It explains how IANA, RIRs, and ISPs allocate global routing prefixes to organizations, and how engineers subdivide a /48 block into 65,536 /64 subnets using a 16-bit Subnet ID field and a 64-bit Interface ID field. It also covers the structure of RFC 4193 Unique Local Addresses beginning with FD00::/8 and why a pseudo-random 40-bit Global ID prevents address collisions during corporate mergers.",
    keyPoints: [
      "Global Unicast Addresses (GUAs) function like public IPv4 addresses: they are globally unique, routable on the public IPv6 Internet, and originally allocated from the 2000::/3 block (addresses starting with hex 2 or 3).",
      "In the GUA hierarchy, IANA allocates large blocks (such as /16 or /12) to Regional Internet Registries (RIRs), RIRs allocate blocks (such as /32) to ISPs, and ISPs assign a Global Routing Prefix (commonly a /48) to each enterprise customer.",
      "A subnetted IPv6 Global Unicast Address has three parts: the ISP-assigned Global Routing Prefix (P bits, often 48 bits), the locally managed Subnet ID field (S bits, often 16 bits), and the Interface ID (host) field (I bits, almost always 64 bits).",
      "Using a /48 Global Routing Prefix and a standard /64 prefix length for all subnets provides a 16-bit Subnet ID field (the entire fourth quartet), yielding 2^16 = 65,536 subnets with 2^64 interface addresses per subnet.",
      "Just like IPv4, a separate IPv6 subnet is required for each VLAN, each point-to-point WAN link, and each routed point-to-point connection.",
      "The all-zeros address at the base of an IPv6 subnet (the subnet ID itself, with all 0s in the Interface ID) is reserved as the Subnet Router Anycast address and should not be assigned to an individual host.",
      "Unique Local Addresses (ULAs, defined in RFC 4193) act as private IPv6 addresses that do not require registration with IANA/RIRs and are not routable on the public Internet.",
      "Although IANA reserved FC00::/7 for ULAs, RFC 4193 requires the 8th bit (the L bit) to be set to 1 for locally assigned prefixes, meaning all practical ULA addresses begin with the hex digits 'FD' (FD00::/8).",
      "A ULA address consists of 8 bits set to 'FD' (11111101), a 40-bit (10-hex-digit) pseudo-randomly generated Global ID, a 16-bit Subnet ID field (the 4th quartet), and a 64-bit Interface ID.",
      "Organizations should use RFC 4193's pseudo-random algorithm to generate the 40-bit Global ID (rather than picking a sequential value like FD00:1:1::/48) so that two companies merging their networks later will not suffer private address overlap."
    ],
    keyTerms: [
      { term: "Global Unicast Address (GUA)", def: "A publicly routable, globally unique IPv6 unicast address allocated from public registry space (traditionally 2000::/3, starting with hex 2 or 3)." },
      { term: "Global Routing Prefix", def: "The leftmost prefix block (typically /48 or /32) assigned to an organization by an ISP or RIR that identifies all subnets belonging to that organization." },
      { term: "Subnet ID Field", def: "The middle field of a subnetted IPv6 unicast address (typically bits 49–64, the fourth quartet) used by an enterprise engineer to number individual subnets." },
      { term: "Interface ID (IID)", def: "The rightmost 64 bits (four quartets) of an IPv6 unicast address that uniquely identify an individual host or router interface on a subnet." },
      { term: "Unique Local Address (ULA)", def: "An unregistered private IPv6 unicast address (beginning with FD00::/8 in practice) used inside an enterprise and not routed on the public Internet." },
      { term: "Global ID (ULA)", def: "The 40-bit (10-hex-digit) pseudo-random field immediately following 'FD' in a Unique Local Address that makes an organization's /48 ULA prefix statistically unique." },
      { term: "Subnet Router Anycast Address", def: "A reserved address equal to the subnet ID (prefix with all binary zeros in the Interface ID) that targets any router attached to that subnet." },
      { term: "Stateless Address Autoconfiguration (SLAAC)", def: "A built-in IPv6 mechanism that lets hosts dynamically form their own global unicast address from a router's advertised /64 prefix without a DHCP server." }
    ],
    commands: [],
    tips: [
      "Memorize the first hex digits of IPv6 address types: 2 or 3 = Global Unicast (2000::/3), FD (or FC) = Unique Local (FC00::/7), FE80 = Link-Local (FE80::/10), FF = Multicast (FF00::/8).",
      "To find the Global ID of a Unique Local Address like FD00:1234:5678:9ABC::1, strip off the first two hex digits ('FD') and take the next 10 hex digits (40 bits): '00:1234:5678'—the fourth quartet ('9ABC') is the Subnet field!",
      "In a /48 enterprise allocation subnetted to /64, the first three quartets are locked as the Global Routing Prefix, the 4th quartet is the Subnet ID (0000 to FFFF), and quartets 5 through 8 are the Interface ID."
    ]
  },
  {
    id: "v1c24",
    volume: 1,
    chapter: 24,
    title: "Implementing IPv6 Addressing on Routers",
    domain: "Network Fundamentals",
    pages: "554-579",
    examTopics: [
      "1.9.a Global unicast",
      "1.9.b Unique local",
      "1.9.c Link local",
      "1.9.d Anycast",
      "1.9.e Multicast",
      "1.9.f Modified EUI-64"
    ],
    summary: "This chapter covers configuring and verifying IPv6 unicast, anycast, link-local, and multicast addresses on Cisco IOS routers. It explains how to enable IPv6 packet forwarding globally with ipv6 unicast-routing, assign static full 128-bit addresses or Modified EUI-64 addresses, and configure dynamic addressing via DHCPv6 or SLAAC. It also explores automatic and manual link-local addresses (FE80::/10), multicast address scopes, reserved protocol multicasts, solicited-node multicast address calculation (FF02::1:FFxx:xxxx), and special addresses (:: and ::1).",
    keyPoints: [
      "Unlike IPv4 routing, IPv6 routing is disabled by default on Cisco IOS routers; you must configure the global command 'ipv6 unicast-routing' in addition to interface IPv6 addresses to route IPv6 traffic.",
      "Modified EUI-64 generates a 64-bit Interface ID from a 48-bit MAC address in three steps: (1) split the 12-hex-digit MAC into two 6-digit halves, (2) insert 'FFFE' in the middle, and (3) invert the 7th bit of the first byte (the universal/local bit).",
      "When 'ipv6 address prefix/64 eui-64' is configured, if a custom MAC address is set with 'mac-address', IOS uses that configured MAC; on serial interfaces without a MAC, IOS borrows the MAC of the lowest-numbered router interface.",
      "Router interfaces can dynamically acquire an IPv6 address using 'ipv6 address dhcp' (stateful DHCPv6) or 'ipv6 address autoconfig' (SLAAC).",
      "Every IPv6-enabled interface automatically generates a Link-Local unicast address (in FE80::/10, starting with FE80:0000:0000:0000) using EUI-64 rules, or an engineer can statically set it with 'ipv6 address address link-local'.",
      "Link-local addresses have a link-local forwarding scope (routers never forward packets with a link-local destination off the local link) and are used by NDP, routing protocols, and as next-hop addresses in IPv6 routing tables.",
      "Configuring 'ipv6 enable' on an interface enables IPv6 and generates a link-local address without requiring a global unicast or unique local address.",
      "IPv6 eliminates Layer 2 and Layer 3 broadcasts, replacing them with Layer 3 multicast addresses (FF00::/8) such as FF02::1 (All-Nodes), FF02::2 (All-Routers), FF02::5 (All-OSPFv3-Routers), FF02::6 (All-OSPFv3-DRs), FF02::9 (RIPng), FF02::A (EIGRPv6), and FF02::1:2 (DHCPv6 Relay Agents).",
      "The fourth hex digit of an IPv6 multicast address defines its forwarding scope: 1 = Interface-Local (FF01::), 2 = Link-Local (FF02::), 5 = Site-Local (FF05::), 8 = Organization-Local (FF08::), and E = Global (FF0E::).",
      "For every unicast address on an interface, the device automatically joins a Solicited-Node Multicast address formed by taking the 104-bit prefix 'FF02:0:0:0:0:1:FF00::/104' (abbreviated FF02::1:FF) and appending the last 6 hex digits (24 bits) of the unicast address.",
      "The unspecified address '::' (all 128 bits zero) is used as a source address by hosts during initialization/DAD before they have an address, while '::1' is the 128-bit loopback address equivalent to IPv4's 127.0.0.1.",
      "An Anycast address is configured on multiple routers with 'ipv6 address addr/len anycast' so packets sent to that address are routed to the topologically nearest router sharing the address."
    ],
    keyTerms: [
      { term: "Modified EUI-64", def: "The algorithm that converts a 48-bit MAC address into a 64-bit IPv6 Interface ID by inserting FFFE in the middle and inverting the 7th bit." },
      { term: "Link-Local Address", def: "A unicast IPv6 address in the FE80::/10 range (starting with FE80::) that is valid only on a single data link and never forwarded by routers." },
      { term: "Solicited-Node Multicast Address", def: "A link-local multicast address (FF02::1:FFxx:xxxx) formed from the last 6 hex digits of each unicast address and used by NDP for efficient MAC resolution and DAD." },
      { term: "Anycast Address", def: "An IPv6 address taken from the unicast range and assigned to multiple router interfaces so client traffic is routed to the nearest interface." },
      { term: "Multicast Scope", def: "The forwarding boundary of an IPv6 multicast packet indicated by the 4th hex digit of the FF0x:: address (e.g., 2=link-local, 5=site-local, 8=org-local, E=global)." },
      { term: "Unspecified Address (::)", def: "The all-zeros 128-bit IPv6 address (0:0:0:0:0:0:0:0) used as a source address by a device before it has been assigned a valid IPv6 address." },
      { term: "Loopback Address (::1)", def: "The IPv6 host loopback address (0:0:0:0:0:0:0:1/128) used to test the local TCP/IPv6 stack without sending traffic onto a physical link." },
      { term: "All-Nodes Multicast (FF02::1)", def: "The reserved link-local multicast address that reaches all IPv6-enabled hosts and routers on the local link, replacing IPv4 local broadcast." },
      { term: "All-Routers Multicast (FF02::2)", def: "The reserved link-local multicast address that reaches all IPv6 routers on the local link (used by NDP Router Solicitations)." }
    ],
    commands: [
      { cmd: "ipv6 unicast-routing", desc: "Globally enables the forwarding (routing) of IPv6 unicast packets on a Cisco router.", mode: "global" },
      { cmd: "ipv6 address address/prefix-length", desc: "Statically configures a full 128-bit global unicast or unique local IPv6 address on an interface.", mode: "interface" },
      { cmd: "ipv6 address prefix/prefix-length eui-64", desc: "Configures an IPv6 prefix on an interface and instructs the router to generate the 64-bit Interface ID using EUI-64 rules.", mode: "interface" },
      { cmd: "ipv6 address address link-local", desc: "Manually configures a static link-local IPv6 address (must be within FE80::/10) on the interface, overriding EUI-64 generation.", mode: "interface" },
      { cmd: "ipv6 address address/prefix-length anycast", desc: "Configures an IPv6 unicast address on an interface to function as an anycast address (flagged as [ANY] in show ipv6 interface).", mode: "interface" },
      { cmd: "ipv6 address dhcp", desc: "Configures the router interface to dynamically obtain an IPv6 address from a stateful DHCPv6 server.", mode: "interface" },
      { cmd: "ipv6 address autoconfig", desc: "Configures the router interface to dynamically generate an IPv6 address using SLAAC from received NDP Router Advertisements.", mode: "interface" },
      { cmd: "ipv6 enable", desc: "Enables IPv6 on an interface and automatically generates an EUI-64 link-local address without configuring a GUA or ULA.", mode: "interface" },
      { cmd: "show ipv6 interface brief [type number]", desc: "Lists all interfaces, their line/protocol status, link-local address, and configured unicast/anycast IPv6 addresses (without prefix lengths).", mode: "user" },
      { cmd: "show ipv6 interface [type number]", desc: "Displays detailed IPv6 interface information including link-local address, global unicast addresses with prefix lengths, and joined multicast groups.", mode: "user" }
    ],
    tips: [
      "Fast EUI-64 7th-bit flip shortcut for the 2nd hex digit of the MAC address: 0<->2, 1<->3, 4<->6, 5<->7, 8<->A, 9<->B, C<->E, D<->F.",
      "Watch out for leading zeros in the last 6 hex digits when forming a Solicited-Node Multicast address! For 2001:DB8::1, the last 6 hex digits are '00:0001', so the solicited-node multicast is FF02::1:FF00:1 (NOT FF02::1:FF:1).",
      "Unlike 'show interfaces' in IPv4, 'show interfaces' does NOT display IPv6 addresses; you must use 'show ipv6 interface' or 'show ipv6 interface brief'.",
      "If you configure a full 128-bit static unicast address (without 'eui-64') and do not manually configure a link-local address, Cisco IOS STILL uses EUI-64 based on the interface MAC address to generate the automatic FE80:: link-local address!"
    ]
  },
  {
    id: "v1c25",
    volume: 1,
    chapter: 25,
    title: "Implementing IPv6 Routing",
    domain: "IP Connectivity",
    pages: "580-607",
    examTopics: [
      "3.3 Configure and verify IPv4 and IPv6 static routing",
      "3.3.a Default route",
      "3.3.b Network route",
      "3.3.c Host route",
      "3.3.d Floating static"
    ],
    summary: "This chapter covers connected, local, and static IPv6 routing as well as the ICMPv6 Neighbor Discovery Protocol (NDP). It explains how routers automatically create connected (/64) and local (/128) routes for working GUA/ULA interfaces while ignoring link-local addresses in the routing table. It then details configuring and troubleshooting static network, default (::/0), host (/128), and floating static IPv6 routes using outgoing interfaces, global unicast next hops, and link-local next hops, before concluding with how NDP uses RS/RA and NS/NA messages for router discovery, prefix discovery, SLAAC, MAC resolution, and Duplicate Address Detection (DAD).",
    keyPoints: [
      "For each working (up/up) interface configured with a GUA or ULA address, a Cisco router adds two routes with AD 0 to the IPv6 routing table: a Connected ('C') route for the subnet prefix (e.g., /64) and a Local ('L') host route (/128) for the exact interface IPv6 address.",
      "Cisco routers do NOT create Connected ('C') or Local ('L') IPv6 routing table entries for interface link-local (FE80::) addresses, though they do install a default local route 'L FF00::/8 via Null0' for multicast processing.",
      "An IPv6 static route can specify a point-to-point outgoing interface alone, a global unicast (or ULA) next-hop address alone, or both an outgoing interface and a next-hop address.",
      "When configuring a static IPv6 route that uses a link-local address (FE80::) as the next hop, you MUST also specify the local router's outgoing interface (e.g., 'ipv6 route prefix/len interface fe80::x'); otherwise IOS rejects the command with '% Interface has to be specified for a link-local nexthop'.",
      "On multiaccess Ethernet interfaces, an IPv6 static route should always include a next-hop IPv6 address (either GUA/ULA alone, or outgoing Ethernet interface + GUA/ULA/link-local next hop).",
      "A static default IPv6 route uses the prefix '::/0', a static IPv6 host route uses a '/128' prefix length for a single host address, and a floating static IPv6 route appends an administrative distance higher than the primary dynamic routing protocol (e.g., > 110 for OSPFv3).",
      "IOS only installs a syntactically valid 'ipv6 route' into the IPv6 routing table if the specified outgoing interface is up/up, any GUA/ULA next-hop address is reachable via an existing route, and no competing route for the exact same prefix/length has a lower administrative distance.",
      "NDP Router Discovery and Prefix Discovery use ICMPv6 Router Solicitation (RS) messages sent by hosts to FF02::2 (All-Routers) and Router Advertisement (RA) messages returned by routers to FF02::1 (All-Nodes) containing the router's link-local address and on-link /64 prefixes.",
      "NDP Neighbor MAC Discovery replaces ARP using Neighbor Solicitation (NS) messages sent to the target's Solicited-Node Multicast address (FF02::1:FFxx:xxxx) and Neighbor Advertisement (NA) messages returned via unicast with the target's MAC address.",
      "Stateless Address Autoconfiguration (SLAAC) enables a host to learn the local prefix/length from an NDP RA message, generate its own 64-bit Interface ID (via EUI-64 or random privacy extension), and verify uniqueness using DAD.",
      "Duplicate Address Detection (DAD) occurs on every unicast address (including link-local) before use: the host sends an NDP NS with its own tentative IPv6 address as the target; if another node replies with an NA, the address is marked as a duplicate and not used."
    ],
    keyTerms: [
      { term: "Connected Route (C)", def: "An IPv6 routing table entry (AD 0) automatically created for the subnet prefix of an active (up/up) interface configured with a GUA or ULA." },
      { term: "Local Route (L)", def: "An IPv6 host route with a /128 prefix length (AD 0) automatically created for the exact GUA or ULA configured on an active router interface." },
      { term: "Static Host Route (/128)", def: "A manually configured ipv6 route with a /128 prefix length that matches traffic destined to a single specific IPv6 host address." },
      { term: "Floating Static Route", def: "A static route configured with a custom administrative distance higher than a dynamic routing protocol so it serves as a backup path." },
      { term: "Router Solicitation (RS)", def: "An ICMPv6 NDP message sent by a host to FF02::2 to request immediate Router Advertisements from all local IPv6 routers." },
      { term: "Router Advertisement (RA)", def: "An ICMPv6 NDP message sent periodically by routers to FF02::1 (or in reply to an RS) advertising the router's link-local address and local IPv6 prefixes." },
      { term: "Neighbor Solicitation (NS)", def: "An ICMPv6 NDP message sent to a target's solicited-node multicast address to resolve its MAC address or perform Duplicate Address Detection." },
      { term: "Neighbor Advertisement (NA)", def: "An ICMPv6 NDP message sent in response to an NS (or unsolicited to FF02::1) supplying the sender's MAC address and confirming IPv6 address ownership." },
      { term: "Duplicate Address Detection (DAD)", def: "The NDP process in which a node sends an NS for its own tentative IPv6 address before using it to verify that no other node on the link claims it." }
    ],
    commands: [
      { cmd: "ipv6 route prefix/length next-hop-address [ad]", desc: "Configures a static IPv6 route using a global unicast or unique local next-hop address and optional administrative distance.", mode: "global" },
      { cmd: "ipv6 route prefix/length outgoing-interface [ad]", desc: "Configures a static IPv6 route specifying only the local outgoing interface (used on point-to-point serial links).", mode: "global" },
      { cmd: "ipv6 route prefix/length outgoing-interface next-hop-address [ad]", desc: "Configures a static IPv6 route specifying both the local outgoing interface and the next-hop IPv6 address (required for link-local next hops).", mode: "global" },
      { cmd: "ipv6 route ::/0 {next-hop | interface [next-hop]} [ad]", desc: "Configures a static default IPv6 route matching all traffic when no more-specific route exists.", mode: "global" },
      { cmd: "ipv6 address autoconfig [default]", desc: "Enables SLAAC on an interface and, with the 'default' keyword, installs a default route pointing to the router that sent the RA.", mode: "interface" },
      { cmd: "show ipv6 route [connected | local | static]", desc: "Displays the IPv6 routing table, optionally filtered to show only connected, local (/128), or static routes.", mode: "user" },
      { cmd: "show ipv6 route address", desc: "Displays the specific IPv6 routing table entry that the router uses to forward packets to the given destination address or prefix.", mode: "user" },
      { cmd: "show ipv6 neighbors", desc: "Displays the IPv6 NDP neighbor table mapping neighbor IPv6 addresses to Layer 2 MAC addresses, state (e.g., REACH), and local interface.", mode: "user" }
    ],
    tips: [
      "Remember why link-local next hops require an outgoing interface in 'ipv6 route': every interface on a router is in the FE80::/10 range, so the router cannot look up FE80::2 in its routing table to deduce which interface leads to that neighbor!",
      "Keep the four NDP message types straight: Routers are discovered with RS (to FF02::2) and RA (to FF02::1); Neighbors and DAD use NS (to FF02::1:FFxx:xxxx) and NA.",
      "When troubleshooting a static route that IS in 'show ipv6 route' but traffic fails, check whether the engineer configured the local router's own IPv6 address as the next hop instead of the neighbor's IPv6 address."
    ]
  },
  {
    id: "v1c26",
    volume: 1,
    chapter: 26,
    title: "Fundamentals of Wireless Networks",
    domain: "Network Fundamentals",
    pages: "610-631",
    examTopics: [
      "1.1.d Access Points",
      "1.11.a Nonoverlapping Wi-Fi channels",
      "1.11.b SSID",
      "1.11.c RF"
    ],
    summary: "This chapter introduces IEEE 802.11 wireless LAN fundamentals, service sets, special wireless topologies, radio frequency (RF) propagation, frequency bands, nonoverlapping channels, and 802.11 standards. It explains why Wi-Fi operates in half-duplex mode and how an Access Point (AP) forms a Basic Service Set (BSS) identified by a BSSID (radio MAC) and SSID while bridging traffic to the wired Distribution System (DS). It also details Extended Service Sets (ESS) for roaming, IBSS (ad hoc), repeaters, workgroup bridges, outdoor bridges, mesh networks, and the 2.4-GHz and 5-GHz bands and IEEE 802.11a/b/g/n/ac/ax amendments.",
    keyPoints: [
      "Unlike full-duplex switched Ethernet (IEEE 802.3), IEEE 802.11 wireless LANs operate in half-duplex mode because stations on the same channel share the unbound RF medium and only one device can transmit at a time without causing collisions.",
      "A Basic Service Set (BSS) consists of a single Access Point (AP) operating in infrastructure mode on one wireless channel and its associated wireless stations (STAs) within a coverage cell called the Basic Service Area (BSA).",
      "Every BSS is uniquely identified at Layer 2 by a machine-readable Basic Service Set Identifier (BSSID) equal to the AP's radio MAC address, and advertised to users by a human-readable Service Set Identifier (SSID) text string.",
      "Once a wireless client associates with a BSS, all frames to and from the client (even to another client in the same BSS) must pass through the AP using the BSSID as a source or destination address.",
      "The wired Ethernet network connected to an AP is called the Distribution System (DS); an AP acts as a translational bridge mapping 802.1Q wired VLANs to wireless SSIDs, incrementing the last hex digit of its radio MAC to create a unique BSSID for each SSID.",
      "An Extended Service Set (ESS) interconnects multiple APs via a switched Distribution System sharing the same SSID (but using different BSSIDs and nonoverlapping channels) so clients can seamlessly roam from cell to cell.",
      "An Independent Basic Service Set (IBSS), or ad hoc network, allows two or more wireless stations (up to about 8–10 devices) to communicate directly peer-to-peer without an AP.",
      "Special non-BSS wireless topologies include Wireless Repeaters (retransmit signals to extend coverage), Workgroup Bridges (connect wired-only devices as wireless clients; uWGB connects 1 wired host, Cisco WGB connects multiple), Outdoor Bridges (point-to-point with directional antennas or point-to-multipoint with a central omnidirectional antenna), and Mesh APs (daisy-chain wireless backhaul to the wired LAN).",
      "Radio Frequency (RF) electromagnetic waves consist of electric and magnetic fields traveling at right angles and are measured in Hertz (cycles per second), spanning roughly 3 kHz to 300 GHz.",
      "Wi-Fi primarily uses two microwave frequency bands: the 2.4-GHz band (2.400–2.4835 GHz, offering longer range and better wall penetration but only three nonoverlapping channels: 1, 6, and 11) and the 5-GHz band (5.150–5.825 GHz across four U-NII sub-bands, where all 20-MHz channels such as 36, 40, 44, 48 are nonoverlapping).",
      "IEEE 802.11 amendments define band support and max data rates: 802.11-1997 (2.4 GHz, 2 Mbps), 802.11b (2.4 GHz, 11 Mbps), 802.11g (2.4 GHz, 54 Mbps), 802.11a (5 GHz, 54 Mbps), 802.11n (both 2.4 and 5 GHz, 600 Mbps), 802.11ac (5 GHz only, 6.93 Gbps), and 802.11ax / Wi-Fi 6 (both 2.4 and 5 GHz, ~4x 802.11ac)."
    ],
    keyTerms: [
      { term: "Basic Service Set (BSS)", def: "A fundamental 802.11 building block consisting of a single Access Point and all associated wireless client stations operating on one channel." },
      { term: "Basic Service Set Identifier (BSSID)", def: "The 48-bit Layer 2 identifier of a specific BSS on an AP, derived from the AP's radio MAC address." },
      { term: "Service Set Identifier (SSID)", def: "A human-readable text string (up to 32 characters) that names a wireless network and is mapped to a wired VLAN." },
      { term: "Distribution System (DS)", def: "The upstream wired Ethernet switched infrastructure that interconnects APs and bridges wireless BSSs to the rest of the network." },
      { term: "Extended Service Set (ESS)", def: "Two or more BSS cells interconnected by a common Distribution System advertising the same SSID to allow seamless client roaming." },
      { term: "Independent Basic Service Set (IBSS)", def: "An impromptu peer-to-peer (ad hoc) wireless network formed directly between two or more wireless stations without an AP." },
      { term: "Roaming", def: "The process by which a mobile wireless client moves physically from one AP's cell to another and re-associates to a new BSSID/channel within an ESS." },
      { term: "Workgroup Bridge (WGB)", def: "A wireless device that associates as a client to an AP's BSS in order to bridge one (uWGB) or multiple (Cisco WGB) wired-only Ethernet devices onto the WLAN." },
      { term: "Mesh Network", def: "A wireless topology in which APs without wired Ethernet links relay client traffic from AP to AP over a dedicated wireless backhaul radio channel." },
      { term: "Nonoverlapping Channels", def: "RF channels whose frequency allocations do not overlap or interfere with each other, specifically channels 1, 6, and 11 in the 2.4-GHz band and standard 20-MHz channels in 5 GHz." }
    ],
    commands: [],
    tips: [
      "Memorize which 802.11 standards use which bands: 2.4 GHz only = 802.11b, 802.11g; 5 GHz only = 802.11a, 802.11ac; Both 2.4 GHz and 5 GHz = 802.11n, 802.11ax (Wi-Fi 6).",
      "In the 2.4-GHz band, only channels 1, 6, and 11 are nonoverlapping in North America; in the 5-GHz band, adjacent 20-MHz channels (like 36, 40, 44, 48) are already spaced 4 channel numbers apart and do NOT overlap.",
      "Do not confuse uWGB and Cisco WGB: a Universal Workgroup Bridge (uWGB) bridges only a SINGLE wired device to a WLAN, whereas a Cisco-proprietary WGB bridges MULTIPLE wired devices."
    ]
  },
  {
    id: "v1c27",
    volume: 1,
    chapter: 27,
    title: "Analyzing Cisco Wireless Architectures",
    domain: "Network Access",
    pages: "632-649",
    examTopics: [
      "2.6 Compare Cisco Wireless Architectures and AP modes"
    ],
    summary: "This chapter compares autonomous, cloud-based (Cisco Meraki), and split-MAC (lightweight AP plus Wireless LAN Controller) wireless architectures. It explains how CAPWAP control (UDP 5246) and data (UDP 5247) tunnels connect lightweight APs to a WLC over Layer 3 without requiring trunk links to each AP. Finally, it contrasts the four WLC deployment models (Unified, Cloud-based VM, Embedded, and Mobility Express) along with the eight operational modes of a Cisco lightweight AP.",
    keyPoints: [
      "Autonomous APs are self-contained devices that perform all real-time 802.11 MAC functions and all management/security functions locally, requiring an 802.1Q trunk link at the access switch to carry data VLANs and a management VLAN to every AP.",
      "Cloud-based APs (Cisco Meraki) are autonomous APs that switch client traffic locally onto the wired LAN (data plane) while being centrally configured, monitored, and managed from the Cisco Meraki cloud dashboard (control plane).",
      "In a Split-MAC architecture, real-time 802.11 duties (RF transmit/receive, beacons, probes, MAC management, per-packet encryption) remain on the Lightweight AP (LAP), while management duties (RF/channel/power management, roaming, authentication, security, QoS) move to a centralized Wireless LAN Controller (WLC).",
      "Lightweight APs and WLCs mutually authenticate using preinstalled X.509 digital certificates and communicate via two Control and Provisioning of Wireless Access Points (CAPWAP) tunnels over IP: CAPWAP Control (UDP port 5246, always authenticated and DTLS-encrypted) and CAPWAP Data (UDP port 5247, unencrypted by default, optionally DTLS-encrypted).",
      "Because a Lightweight AP in default Local mode encapsulates all client VLAN traffic inside Layer 3 CAPWAP packets to the WLC, the AP connects to the access switch using a single access port and a single IP address rather than a trunk link.",
      "Centralized WLC functions include Dynamic Channel Assignment, Transmit Power Optimization, Self-Healing coverage (increasing neighbor power when an AP radio fails), fast client roaming, client load balancing, RF monitoring, centralized authentication, and Wireless Intrusion Protection System (WIPS).",
      "Unified (Centralized) WLC deployments place physical controllers near the network core/data center and scale up to 6000 APs and 64,000 clients for large enterprises.",
      "Cloud-based WLC deployments run the controller as a virtual machine in a private data center cloud and support up to 3000 APs and 32,000 clients.",
      "Embedded WLC deployments integrate the controller inside access-layer switch stacks for small campuses, supporting up to 200 APs and 4000 clients.",
      "Cisco Mobility Express deployments co-locate the WLC software inside a capable AP at a branch site without dedicated controller hardware, supporting up to 100 APs and 2000 clients.",
      "A Cisco Lightweight AP operates in one of eight mutually exclusive modes: Local (default, serves client BSSs and scans other channels when idle), Monitor (dedicated receive-only IDS/rogue/location sensor), FlexConnect (locally switches traffic at a branch if CAPWAP to WLC fails), Sniffer (captures 802.11 packets and forwards to Wireshark/OmniPeek), Rogue Detector (correlates wired and wireless MAC addresses), Bridge (point-to-point/multipoint or mesh), Flex+Bridge (FlexConnect on mesh AP), and SE-Connect (dedicated RF spectrum analysis on all channels for Chanalyzer/Spectrum Expert)."
    ],
    keyTerms: [
      { term: "Autonomous AP", def: "A standalone access point that contains full control and data planes locally, bridging SSIDs directly onto 802.1Q trunked VLANs." },
      { term: "Lightweight Access Point (LAP)", def: "A stripped-down access point in a split-MAC architecture that handles real-time 802.11 MAC functions and relies on a WLC via CAPWAP tunnels." },
      { term: "Split-MAC Architecture", def: "A wireless architecture that divides 802.11 MAC and management functions between lightweight APs (real-time operations) and a WLC (management/control)." },
      { term: "CAPWAP", def: "Control and Provisioning of Wireless Access Points (RFC 5415); the tunneling protocol using UDP 5246 (Control) and UDP 5247 (Data) to link LAPs and WLCs." },
      { term: "Unified WLC Deployment", def: "A centralized physical WLC architecture located in the core/data center supporting up to 6000 APs and 64,000 clients." },
      { term: "Embedded WLC Deployment", def: "A controller architecture embedded within an access-layer switch stack supporting up to 200 APs and 4000 clients." },
      { term: "Mobility Express", def: "A branch WLC deployment model where the controller function runs directly inside an AP, supporting up to 100 APs and 2000 clients." },
      { term: "Local Mode", def: "The default operational mode of a Cisco lightweight AP in which it provides client BSSs on its assigned channel and scans other channels during idle times." },
      { term: "FlexConnect Mode", def: "A lightweight AP mode for remote branches that allows the AP to locally switch traffic between an SSID and VLAN if its CAPWAP tunnel to the WLC goes down." },
      { term: "SE-Connect Mode", def: "A lightweight AP mode that dedicates the AP's radios to full-time RF spectrum analysis across all channels for external tools like Cisco Spectrum Expert." }
    ],
    commands: [],
    tips: [
      "Remember the CAPWAP UDP port numbers and encryption defaults: Control = UDP 5246 (encrypted by default), Data = UDP 5247 (NOT encrypted by default, uses DTLS when enabled).",
      "Memorize the WLC deployment scale ladder (APs / Clients): Unified = 6000 / 64,000; Cloud VM = 3000 / 32,000; Embedded = 200 / 4000; Mobility Express = 100 / 2000.",
      "Whenever a lightweight AP is placed into Monitor, Sniffer, Rogue Detector, or SE-Connect mode, its Local mode BSSs are disabled and no wireless clients can associate with that AP.",
      "Distinguish Monitor, Rogue Detector, Sniffer, and SE-Connect: Monitor = receive-only IDS/rogue/location sensor; Rogue Detector = correlates wired and wireless MACs; Sniffer = forwards 802.11 packet captures to Wireshark; SE-Connect = spectrum analysis for non-802.11 RF interference."
    ]
  },
  {
    id: "v1c28",
    volume: 1,
    chapter: 28,
    title: "Securing Wireless Networks",
    domain: "Security Fundamentals",
    pages: "650-665",
    examTopics: [
      "1.11.d Encryption",
      "5.9 Describe wireless security protocols (WPA, WPA2, and WPA3)"
    ],
    summary: "This chapter explains the core pillars of wireless LAN security: client and AP authentication, message privacy (encryption), and message integrity (MIC). It traces the evolution of wireless authentication from Open and WEP to 802.1X/EAP methods including LEAP, EAP-FAST, PEAP, and EAP-TLS. It then compares the TKIP, CCMP, and GCMP encryption/integrity suites and details how the Wi-Fi Alliance's WPA, WPA2, and WPA3 certifications combine Personal (PSK/SAE) and Enterprise (802.1X) authentication with strong encryption.",
    keyPoints: [
      "Securing a wireless link requires mutual authentication (verifying both the client and the AP to prevent rogue AP man-in-the-middle attacks), message privacy via encryption (a unique per-client key plus a shared group key for broadcasts), and a Message Integrity Check (MIC) to detect frame tampering.",
      "The original 802.11 standard offered only Open Authentication (validates only that the client speaks 802.11 with no credentials, often paired with captive-portal web authentication) and Wired Equivalent Privacy (WEP, a vulnerable and deprecated shared-key RC4 scheme using 40-bit/10-hex or 104-bit/26-hex static keys).",
      "IEEE 802.1X port-based access control uses the Extensible Authentication Protocol (EAP) framework across three entities: the Supplicant (wireless client), the Authenticator (WLC/AP, which blocks network access until authentication succeeds), and the Authentication Server (AS, typically a RADIUS server).",
      "LEAP (Lightweight EAP) is a deprecated Cisco-proprietary EAP method that used mutual challenge hashes and dynamic WEP keys, but remains vulnerable to password dictionary attacks.",
      "EAP-FAST (Flexible Authentication by Secure Tunneling) is a Cisco method designed for environments without certificates that uses a RADIUS-generated Protected Access Credential (PAC) across Phase 0 (PAC provisioning), Phase 1 (outer auth and TLS tunnel creation), and Phase 2 (inner user authentication).",
      "PEAP (Protected EAP) requires a CA-signed digital certificate only on the Authentication Server (not on clients) to authenticate the server and build an outer TLS tunnel, inside which the client authenticates using MSCHAPv2 or a Generic Token Card (GTC).",
      "EAP-TLS is the most secure EAP method because it requires CA-signed digital certificates on BOTH the Authentication Server and every wireless client device for mutual authentication, requiring a Public Key Infrastructure (PKI).",
      "TKIP (Temporal Key Integrity Protocol, used in original WPA and deprecated in 2012) wrapped legacy WEP RC4 hardware with a 'Michael' MIC, timestamp, sender MAC, sequence counter, per-frame key mixing, and a doubled 48-bit Initialization Vector (IV).",
      "CCMP (Counter/CBC-MAC Protocol, mandatory in WPA2 / 802.11i) pairs Advanced Encryption Standard (AES) counter-mode encryption with Cipher Block Chaining Message Authentication Code (CBC-MAC) for message integrity.",
      "GCMP (Galois/Counter Mode Protocol, used in WPA3) pairs AES counter-mode encryption with Galois Message Authentication Code (GMAC) for faster and stronger authenticated encryption.",
      "WPA, WPA2, and WPA3 all support two authentication modes: Personal mode (Pre-Shared Key / passphrase for small networks) and Enterprise mode (802.1X/EAP with a RADIUS server).",
      "WPA3 enhances security over WPA2 by replacing vulnerable 4-way handshake PSK exchanges with Simultaneous Authentication of Equals (SAE) in WPA3-Personal, providing forward secrecy, using AES-GCMP, and requiring Protected Management Frames (PMF)."
    ],
    keyTerms: [
      { term: "Message Integrity Check (MIC)", def: "A cryptographic hash appended to a wireless frame before encryption to allow the receiver to detect any in-transit data tampering." },
      { term: "Wired Equivalent Privacy (WEP)", def: "An original, deprecated 802.11 security protocol using static 40-bit or 104-bit shared keys and the vulnerable RC4 stream cipher." },
      { term: "IEEE 802.1X", def: "A port-based network access control standard involving a Supplicant, Authenticator (WLC), and Authentication Server (RADIUS) using EAP." },
      { term: "EAP-FAST", def: "A Cisco EAP method that establishes a TLS tunnel using a shared Protected Access Credential (PAC) instead of digital certificates." },
      { term: "Protected EAP (PEAP)", def: "An EAP method that uses a server-side digital certificate on the AS to build a TLS tunnel, authenticating the client inside via MSCHAPv2 or GTC." },
      { term: "EAP-TLS", def: "The most secure 802.1X EAP method, requiring digital certificates on both the Authentication Server and every wireless client (supplicant)." },
      { term: "Temporal Key Integrity Protocol (TKIP)", def: "A deprecated WPA transition cipher suite that augmented legacy WEP hardware with a 48-bit IV, per-packet key mixing, sequence counters, and Michael MIC." },
      { term: "CCMP", def: "Counter/CBC-MAC Protocol; the WPA2 (802.11i) privacy and integrity suite combining AES counter-mode encryption with CBC-MAC integrity." },
      { term: "GCMP", def: "Galois/Counter Mode Protocol; the WPA3 privacy and integrity suite combining AES counter-mode encryption with GMAC integrity." },
      { term: "Simultaneous Authentication of Equals (SAE)", def: "The WPA3-Personal key-exchange handshake that replaces the WPA2 4-way PSK handshake to resist offline dictionary attacks and provide forward secrecy." },
      { term: "Protected Management Frames (PMF)", def: "An 802.11w feature mandated in WPA3 that authenticates and protects management frames against forged deauthentication/disassociation attacks." }
    ],
    commands: [],
    tips: [
      "Keep the four EAP methods clear by their credentials: LEAP = usernames + dynamic WEP (deprecated); EAP-FAST = PAC (no certificates required); PEAP = Certificate on Server ONLY (+ MSCHAPv2/GTC for client); EAP-TLS = Certificates on BOTH Server and Client.",
      "Match the privacy/integrity suite to the WPA generation: WPA = TKIP (RC4 + Michael MIC); WPA2 = CCMP (AES + CBC-MAC); WPA3 = GCMP (AES + GMAC) + SAE + PMF.",
      "Remember the three 802.1X roles in a Cisco split-MAC wireless network: Supplicant = Wireless Client; Authenticator = WLC; Authentication Server (AS) = RADIUS Server."
    ]
  },
  {
    id: "v1c29",
    volume: 1,
    chapter: 29,
    title: "Building a Wireless LAN",
    domain: "Network Access",
    pages: "666-688",
    examTopics: [
      "2.7 Describe physical infrastructure connections of WLAN components (AP, WLC, access/trunk ports, and LAG)",
      "2.8 Describe AP and WLC management access connections (Telnet, SSH, HTTP, HTTPS, console, and TACACS+/RADIUS)",
      "2.9 Configure the components of a wireless LAN access for client connectivity using GUI only, such as WLAN creation, security settings, QoS profiles, and advanced WLAN settings",
      "5.10 Configure WLAN using WPA2 PSK using the GUI"
    ],
    summary: "This chapter covers the physical cabling, logical interfaces, management access methods, and step-by-step GUI configuration of a Cisco Wireless LAN Controller (WLC). It distinguishes between physical WLC ports (Service, Distribution System, Console, Redundancy, and LAG bundles) and internal logical WLC interfaces (Management, Redundancy Management, Virtual, Service Port, and Dynamic). Finally, it walks through configuring a RADIUS server, creating a VLAN-mapped Dynamic Interface, and building a new WLAN with WPA2-Personal (PSK) or WPA2-Enterprise security, QoS profiles, and advanced session/exclusion timers in the WLC GUI.",
    keyPoints: [
      "An Autonomous AP connects to an access switch via an 802.1Q trunk port to carry multiple data VLANs, whereas a Lightweight AP (in default local mode) connects to an access switch via a single access port because CAPWAP tunnels carry all VLAN traffic over IP to the WLC.",
      "Cisco Autonomous APs can be managed via console port, Telnet, SSH, HTTP, or HTTPS; Cisco WLCs support management via console port (9600 8N1), SSH (CLI), and HTTP/HTTPS (GUI, requiring clicking 'Login' then 'Advanced'), authenticating administrators locally or via TACACS+/RADIUS.",
      "On a Cisco WLC, 'ports' are physical hardware connections to the wired network, while 'interfaces' are internal logical Layer 3 terminations configured with an IP address, mask, gateway, DHCP server, and VLAN ID.",
      "Physical WLC ports include the Service Port (out-of-band management and recovery, always connects to a switch access port), Distribution System Ports (normal AP CAPWAP, client data, and in-band management traffic, always connect to 802.1Q trunk switch ports), Console Port, and Redundancy Port (HA peer connection).",
      "Multiple WLC Distribution System ports can be bundled into a single Link Aggregation Group (LAG); because Cisco WLCs do NOT support LACP or PAgP negotiation, the neighboring switch ports must be configured as an unconditional ('channel-group X mode on') 802.1Q trunk EtherChannel.",
      "Internal WLC logical interfaces include the Management Interface (in-band management, RADIUS requests, WLC-to-WLC traffic, and CAPWAP tunnel termination), Redundancy Management Interface (standby HA WLC IP), Service Port Interface (out-of-band management), Virtual Interface (client-facing nonroutable IP for DHCP relay, web auth, and mobility groups), and Dynamic Interfaces (map each WLAN to a wired VLAN).",
      "Although a Cisco WLC supports up to 512 configured WLANs and an AP can actively advertise up to 16 WLANs, best practice limits an AP to 3–5 WLANs because every active WLAN sends beacons every 100 ms (10 times/second) at the lowest mandatory data rate, consuming airtime.",
      "To build a new WLAN in the WLC GUI: (1) optionally configure RADIUS servers under Security > AAA > RADIUS > Authentication, (2) create a Dynamic Interface mapped to a VLAN ID with IP/mask/gateway/DHCP under Controller > Interfaces, and (3) create the WLAN under WLANs > Create New > Go, binding the SSID to the Dynamic Interface under the General tab and checking 'Status: Enabled'.",
      "To configure WPA2-Personal in the WLAN Security > Layer 2 tab, select 'WPA+WPA2' from the Layer 2 Security drop-down, check 'WPA2 Policy' with 'AES' encryption, and under Authentication Key Management check 'PSK' and enter the ASCII/hex pre-shared key.",
      "Under the WLAN QoS tab, traffic can be assigned one of four Cisco WLC QoS profiles: Platinum (Voice), Gold (Video), Silver (Best Effort, the default), or Bronze (Background).",
      "Under the WLAN Advanced tab, the default client Session Timeout is 1800 seconds (30 minutes) and Client Exclusion blocks offending clients for 60 seconds by default; management access to the WLC from wireless clients is disabled by default and enabled globally under Management > Mgmt Via Wireless."
    ],
    keyTerms: [
      { term: "Distribution System Port", def: "A physical WLC port that carries all normal in-band management, CAPWAP tunnel, and multi-VLAN client traffic over an 802.1Q trunk link." },
      { term: "Service Port", def: "A dedicated physical WLC port connected to an access switch port for out-of-band management, initial boot configuration, and system recovery." },
      { term: "Link Aggregation Group (LAG)", def: "A bundle of multiple physical WLC distribution system ports into a single logical trunk link that pairs with an unconditional ('mode on') switch EtherChannel." },
      { term: "Management Interface", def: "The internal logical WLC interface used for in-band management, RADIUS communication, and terminating CAPWAP tunnels with lightweight APs." },
      { term: "Virtual Interface", def: "An internal logical WLC interface assigned a nonroutable IP address to face wireless clients for DHCP relay, web authentication, and mobility group roaming." },
      { term: "Dynamic Interface", def: "A user-created logical Layer 3 interface on a WLC that maps a specific wired VLAN ID (and IP subnet/DHCP server) to a wireless LAN (WLAN)." },
      { term: "Beacon Frame", def: "An 802.11 management frame broadcast by an AP 10 times per second (every 100 ms) per active BSS/WLAN to announce the SSID and radio capabilities." },
      { term: "WLC QoS Profiles", def: "The four traffic priority levels available on a Cisco WLC WLAN: Platinum (Voice), Gold (Video), Silver (Best Effort - default), and Bronze (Background)." },
      { term: "Client Exclusion", def: "A WLC security feature (enabled by default for 60 seconds) that temporarily blocks wireless clients after authentication/association failures or IP theft." }
    ],
    commands: [],
    tips: [
      "Switch port mode rule for wireless devices: Lightweight AP = Access port; WLC Service Port = Access port; Autonomous AP (multiple SSIDs) = 802.1Q Trunk port; WLC Distribution System Port / LAG = 802.1Q Trunk port (with 'mode on' for EtherChannel).",
      "Know which WLC interface does what: Management Interface terminates CAPWAP tunnels and talks to RADIUS; Virtual Interface handles client DHCP relay, web auth, and mobility (must match across WLCs in a mobility group); Dynamic Interface maps a WLAN to a wired VLAN.",
      "Memorize the four WLC QoS profiles in descending order: Platinum = Voice, Gold = Video, Silver = Best Effort (default), Bronze = Background.",
      "When creating a new WLAN in the WLC GUI, remember that a newly created WLAN is disabled by default until you check the 'Status: Enabled' box on the General tab and bind it to the right Dynamic Interface (it defaults to the Management interface!)."
    ]
  }
];
