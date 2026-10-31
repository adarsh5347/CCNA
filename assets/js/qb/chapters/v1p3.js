import { mk } from "../build.js?v=76";

const c19 = mk("IP Connectivity", 25, "v1c19");
const q19 = [
  c19.s(
    "OSPF",
    "Easy",
    "Which multicast IPv4 destination address do OSPF routers use when sending Hello packets to discover neighbors on a broadcast link?",
    "224.0.0.5",
    [
      ["224.0.0.6", "224.0.0.6 is the All-SPF-DRs multicast address used by DROthers to send LSUs to the DR and BDR, not for general Hello discovery."],
      ["224.0.0.9", "224.0.0.9 is the multicast destination address reserved for RIP version 2 routing updates, not OSPF Hello packets."],
      ["224.0.0.10", "224.0.0.10 is the multicast destination address used by EIGRP routers to exchange Hello and update messages."]
    ],
    "OSPF routers send Hello packets to the All-SPF-Routers multicast address 224.0.0.5 so every OSPF-enabled router on the shared subnet receives neighbor discovery and keepalive messages. The multicast address 224.0.0.6 is reserved exclusively for Designated Routers (DRs) and Backup Designated Routers (BDRs).",
    "Remember 224.0.0.5 = All OSPF routers (.5 has 5 letters in 'Hello'), and 224.0.0.6 = DR and BDR only.",
    ["show ip ospf interface"]
  ),
  c19.s(
    "Routing table",
    "Easy",
    "A router learns about subnet 172.16.40.0/24 via four different sources using default Cisco IOS settings. Which route is installed in the IPv4 routing table?",
    "Internal EIGRP route (administrative distance 90)",
    [
      ["OSPF intra-area route (administrative distance 110)", "OSPF has a default administrative distance of 110, which is less trustworthy (higher value) than internal EIGRP's default of 90."],
      ["RIPv2 route (administrative distance 120)", "RIPv2 has a default administrative distance of 120, which loses to both internal EIGRP (90) and OSPF (110)."],
      ["External EIGRP route (administrative distance 170)", "External EIGRP routes have a default administrative distance of 170, which is higher than internal EIGRP, OSPF, and RIP."]
    ],
    "When a router learns the same prefix length from multiple routing protocols, it compares their administrative distance (AD) values before looking at metrics. Internal EIGRP has a default AD of 90, which is lower (more preferred) than OSPF (110), IS-IS (115), RIP (120), and external EIGRP (170).",
    "Memorize key default ADs: Connected=0, Static=1, eBGP=20, EIGRP internal=90, OSPF=110, RIP=120, EIGRP external=170.",
    ["show ip route", "show ip protocols"]
  ),
  c19.s(
    "OSPF",
    "Easy",
    "Which OSPF packet type sends condensed LSA headers during the Exchange state so a neighbor can determine which full LSAs it is missing?",
    "Database Description (DD)",
    [
      ["Link-State Request (LSR)", "An LSR packet is sent by a router during the Loading state to ask a neighbor for specific missing LSAs, not to summarize its own database."],
      ["Link-State Update (LSU)", "An LSU packet carries full LSA data structures during flooding or in response to an LSR, rather than just initial database headers."],
      ["Link-State Acknowledgment (LSAck)", "An LSAck packet confirms reliable receipt of LSU packets and does not advertise database contents during the Exchange state."]
    ],
    "Once two OSPF neighbors negotiate master/slave roles in the ExStart state, they transition to the Exchange state and swap Database Description (DD or DBD) packets. DD packets carry only LSA headers (identifiers and sequence numbers), allowing each router to compare headers against its local LSDB and send LSRs for any missing or newer LSAs.",
    "Match the OSPF state to the packet: Exchange = DD (headers only); Loading = LSR (ask) and LSU (full LSAs).",
    ["show ip ospf neighbor"]
  ),
  c19.s(
    "OSPF",
    "Easy",
    "Even when a network is completely stable and no topology changes occur, how often does an OSPF router reflood each LSA it originated and increment its sequence number?",
    "Every 30 minutes",
    [
      ["Every 10 seconds on broadcast links", "Ten seconds is the default OSPF Hello interval on broadcast and point-to-point links, not the periodic LSA reflood timer."],
      ["Every 40 seconds when the Dead timer expires", "Forty seconds is the default Dead interval on broadcast links, after which a silent neighbor is declared down."],
      ["Every 60 minutes when the MaxAge timer expires", "Sixty minutes (3600 seconds) is the LSA MaxAge limit; OSPF refreshes LSAs halfway through at 30 minutes to prevent expiration."]
    ],
    "OSPF does not flood periodic routing tables like distance vector protocols, but each originating router still refloods its own LSAs every 30 minutes (1800 seconds) by incrementing the LSA sequence number and resetting its age timer. This periodic refresh ensures all routers maintain identical databases before the 60-minute MaxAge timer expires.",
    "Don't confuse OSPF's 10-second Hello timer with its 30-minute per-LSA refresh timer.",
    ["show ip ospf database"]
  ),
  c19.s(
    "OSPF",
    "Medium",
    "Seven OSPF routers connect to the same Ethernet VLAN and elect one DR and one BDR. What neighbor state do the remaining five DROther routers maintain with one another?",
    "2-Way",
    [
      ["Full", "DROther routers only reach the Full state (full adjacency) with the DR and BDR, never with other DROther routers on the same shared subnet."],
      ["Init", "Init indicates a router received a Hello that did not list its own Router ID; mutually discovered DROthers advance past Init to 2-Way."],
      ["Exchange", "DROthers stop at the 2-Way state with each other and do not start ExStart or Exchange database synchronization directly with fellow DROthers."]
    ],
    "On an OSPF broadcast network, every DROther router exchanges databases and reaches the Full state with both the DR and the BDR. However, pairs of DROther routers do not exchange DD, LSR, or LSU packets directly with each other; they remain in the 2-Way neighbor state and rely on the DR to relay LSAs across the LAN.",
    "On broadcast LANs: DR/BDR to anyone = FULL; DROther to DROther = 2WAY/DROTHER.",
    ["show ip ospf neighbor"]
  ),
  c19.s(
    "OSPF",
    "Medium",
    "Six OSPF routers share an Ethernet segment where one DR and one BDR have been elected. How many total full OSPF adjacencies (Full state relationships) exist on this segment?",
    "9",
    [
      ["15", "Fifteen is the total number of neighbor pairs using the n(n-1)/2 mesh formula, which would occur only without a DR/BDR election."],
      ["6", "Six is only the number of routers on the segment; each of the four DROthers forms two adjacencies (one with DR, one with BDR) plus the DR-BDR adjacency."],
      ["12", "Twelve overcounts the adjacencies; with 4 DROthers, there are 4 adjacencies to the DR, 4 to the BDR, and 1 between the DR and BDR."]
    ],
    "With 6 routers on an Ethernet LAN, 1 is the DR, 1 is the BDR, and 4 are DROthers. Each of the 4 DROthers forms a Full adjacency with the DR (4 adjacencies) and a Full adjacency with the BDR (4 adjacencies), and the DR and BDR form 1 Full adjacency with each other, totaling 4 + 4 + 1 = 9 Full adjacencies instead of 6×5/2 = 15.",
    "For N routers on a broadcast LAN (N >= 2), total Full adjacencies = 2(N - 2) + 1 = 2N - 3.",
    ["show ip ospf neighbor"]
  ),
  c19.s(
    "OSPF",
    "Medium",
    "In a multiarea OSPFv2 domain, which router originates Type 2 (Network) LSAs, and how far are those Type 2 LSAs flooded?",
    "The Designated Router (DR) originates Type 2 LSAs, and they are flooded only within the originating area.",
    [
      ["Every internal router originates Type 2 LSAs for its serial links, and they are flooded across all areas.", "Point-to-point serial links do not elect a DR and do not generate Type 2 LSAs; they are represented inside Type 1 Router LSAs."],
      ["An Area Border Router (ABR) originates Type 2 LSAs to summarize subnets between Area 0 and nonbackbone areas.", "ABRs originate Type 3 Summary LSAs to advertise interarea subnets across area boundaries, whereas Type 2 LSAs are created by DRs."],
      ["The Backup Designated Router (BDR) originates Type 2 LSAs and floods them across Area 0 and attached areas.", "The BDR monitors the DR and takes over only if the DR fails; while the DR is active, only the DR originates the Type 2 LSA for the subnet."]
    ],
    "A Type 2 (Network) LSA represents a multiaccess subnet on which a DR has been elected. The DR originates one Type 2 LSA listing the subnet mask and the Router IDs of all routers attached to that transit network, and that Type 2 LSA remains confined inside the single OSPF area to which the subnet belongs.",
    "LSA Types 1..3: Type 1 = Router (every router, intra-area), Type 2 = Network (DR only, intra-area), Type 3 = Summary (ABR, interarea).",
    ["show ip ospf database", "show ip ospf database network"]
  ),
  c19.s(
    "OSPF",
    "Medium",
    "Router R1 in Area 1 calculates the OSPF cost to reach subnet 10.20.30.0/24 located in Area 2 across Backbone Area 0. How does R1 compute the total metric to that interarea destination?",
    "R1 adds its intra-area SPF cost to the ABR to the cost advertised by the ABR in the Type 3 Summary LSA.",
    [
      ["R1 runs the Dijkstra SPF algorithm across the Type 1 and Type 2 LSAs of Area 1, Area 0, and Area 2 simultaneously.", "Routers in Area 1 do not possess Type 1 or Type 2 LSAs from Area 0 or Area 2, because intra-area topology LSAs are never flooded past an ABR."],
      ["R1 counts the number of Area Border Routers between Area 1 and Area 2 and multiplies that hop count by the reference bandwidth.", "OSPF never uses router hop count as its metric; it always sums outgoing interface OSPF costs along the path."],
      ["R1 uses only the highest single outgoing interface cost between itself and the destination subnet in Area 2.", "OSPF metrics are cumulative sums of all outgoing interface costs along the end-to-end route, not the maximum link cost."]
    ],
    "In multiarea OSPF, an ABR blocks Type 1 and Type 2 LSAs from crossing area boundaries and instead injects a Type 3 Summary LSA containing the subnet ID, mask, and the ABR's cumulative cost to reach that subnet. An internal router in another area simply runs SPF within its own area to find the cost to reach the ABR and adds the cost listed inside the Type 3 LSA.",
    "ABRs hide remote area topologies: remote routers only see a Type 3 Summary LSA (subnet + cost from ABR) and add their intra-area cost to the ABR.",
    ["show ip ospf database summary", "show ip route ospf"]
  ),
  c19.s(
    "OSPF",
    "Medium",
    "R1 has path R1 -> R2 -> R3 -> Subnet X (10.1.1.0/24). On R1, outgoing G0/0 costs 10. On R2, incoming G0/0 costs 50 and outgoing G0/1 costs 20. On R3, incoming G0/1 costs 50 and outgoing G0/2 (connected to Subnet X) costs 5. What total OSPF cost does R1 calculate for 10.1.1.0/24?",
    "35",
    [
      ["135", "135 includes both incoming and outgoing interface costs (10 + 50 + 20 + 50 + 5), but OSPF sums only outgoing interface costs in the forwarding direction."],
      ["105", "105 sums the incoming interface costs on R2 and R3 plus R3's LAN cost (50 + 50 + 5), which reverses the direction OSPF uses to compute metric."],
      ["30", "30 omits R3's outgoing interface G0/2 cost of 5 where Subnet X is connected (10 + 20 = 30), which must be included in the forward path."]
    ],
    "An OSPF router calculates the metric of a path by summing the OSPF interface costs of all outgoing interfaces along the route from the local router to the destination subnet. Moving from R1 to Subnet X, packets exit R1's G0/0 (cost 10), R2's G0/1 (cost 20), and R3's G0/2 onto Subnet X (cost 5), for a total cost of 10 + 20 + 5 = 35.",
    "Always trace from the calculating router to the destination subnet and add ONLY the outgoing (exit) interface cost at each router, including the final router's LAN interface.",
    ["show ip route ospf", "show ip ospf interface brief"]
  ),
  c19.s(
    "OSPF",
    "Medium",
    "In a multiarea OSPF network consisting of Area 0, Area 10, and Area 20, how must interarea traffic and LSAs travel between Area 10 and Area 20?",
    "All interarea traffic and Type 3 LSAs must pass through Area 0 via Area Border Routers connected to Area 0.",
    [
      ["An ABR can directly connect Area 10 and Area 20 without an interface in Area 0 to exchange Type 3 LSAs directly.", "OSPF requires a hub-and-spoke area hierarchy around Backbone Area 0; nonbackbone areas cannot exchange interarea routes directly without Area 0."],
      ["Routers in Area 10 flood Type 1 Router LSAs directly into Area 20 whenever a backup serial link connects them.", "Type 1 LSAs are strictly intra-area and are never flooded across area boundaries under any circumstances."],
      ["OSPF automatically creates an eBGP peering session between Area 10 and Area 20 routers to exchange summary prefixes.", "OSPF is an Interior Gateway Protocol (IGP) and uses ABRs attached to Area 0, never automatic BGP sessions, for interarea routing."]
    ],
    "Multiarea OSPF mandates a two-tier hierarchical design in which every nonbackbone area must connect to Backbone Area 0 through at least one Area Border Router (ABR). Interarea routes (Type 3 Summary LSAs) are advertised from a nonbackbone area into Area 0 by one ABR and then from Area 0 into other nonbackbone areas by their respective ABRs.",
    "Every nonbackbone OSPF area must touch Area 0 (the backbone) via an ABR to prevent interarea routing loops.",
    ["show ip ospf", "show ip ospf border-routers"]
  ),
  c19.m(
    "OSPF",
    "Hard",
    "Which benefits are achieved by dividing a single large OSPF autonomous system of 300 routers into multiple smaller OSPF areas?",
    [
      "Faster and less CPU-intensive SPF calculations because each router runs Dijkstra's algorithm only on its own area's topology",
      "Smaller Link-State Databases (LSDBs) that consume less router memory because detailed Type 1 and Type 2 LSAs stay within each area",
      "Reduced flooding of link-state updates when an interface flaps because intra-area topology changes are summarized at the ABR"
    ],
    [
      ["Complete elimination of Designated Router (DR) elections on all broadcast Ethernet segments inside nonbackbone areas", "Broadcast links still elect a DR and BDR inside every OSPF area regardless of whether the design is single-area or multiarea."],
      ["Automatic reduction of the default OSPF administrative distance from 110 to 90 for all interarea Type 3 summary routes", "All OSPF routes—intra-area (O), interarea (O IA), and external—use the same default administrative distance of 110 in Cisco IOS."],
      ["Replacement of multicast Hello packets with unicast TCP keepalives across all routers attached to Backbone Area 0", "OSPF always encapsulates messages directly in IP protocol 89 and uses multicast Hello packets on broadcast and point-to-point links."]
    ],
    "Splitting a large OSPF domain (typically recommended once an area grows past roughly 50 routers) into multiple areas improves scalability in three main ways: routers store fewer detailed Type 1/2 LSAs (saving RAM), the shortest-path tree is smaller (saving CPU cycles and speeding convergence), and link-status changes inside one area do not force a full SPF recalculation in other areas.",
    "Remember the 3 multiarea OSPF advantages: smaller LSDB (memory), smaller SPF tree (CPU), and contained LSA flooding/fault isolation.",
    ["show ip ospf", "show ip ospf database"]
  ),
  c19.d(
    "OSPF",
    "Hard",
    "Order the first five OSPF neighbor states that two routers pass through on a point-to-point link from initial interface activation up to the beginning of DD packet exchange.",
    [
      "Down",
      "Init",
      "2-Way",
      "ExStart",
      "Exchange"
    ],
    "When OSPF starts on an interface, neighbors begin in the Down state. Upon receiving a Hello that does not yet list the local RID, a router enters Init. Once the neighbor replies with a Hello listing the local RID under Seen, the state becomes 2-Way. To synchronize databases, the routers enter ExStart to negotiate master/slave roles and DD sequence numbers, and then enter Exchange to swap DD headers (followed by Loading and Full).",
    "OSPF 7 states in order: Down -> Init -> 2-Way -> ExStart -> Exchange -> Loading -> Full.",
    ["show ip ospf neighbor", "debug ip ospf adj"]
  ),
  c19.t(
    "OSPF",
    "Hard",
    "Match each OSPFv2 Link-State Advertisement (LSA) or packet component with its accurate description.",
    [
      ["Type 1 (Router) LSA", "Originated by every OSPF router to list its RID, attached intra-area interfaces, costs, and neighbors"],
      ["Type 2 (Network) LSA", "Originated by the Designated Router on a multiaccess subnet to list the subnet mask and attached RIDs"],
      ["Type 3 (Summary) LSA", "Originated by an Area Border Router to advertise a subnet ID, mask, and metric into another area"],
      ["Link-State Request (LSR)", "Packet sent during the Loading state to ask an adjacent neighbor for full copies of specific missing LSAs"]
    ],
    "Understanding the building blocks of the OSPFv2 LSDB is critical for reading `show ip ospf database` output: every router generates one Type 1 Router LSA per area it belongs to; each broadcast segment with a DR generates one Type 2 Network LSA; each ABR generates Type 3 Summary LSAs for interarea prefixes; and LSR packets fetch missing LSAs during the Loading state.",
    "In `show ip ospf database`: Router Link States = Type 1, Net Link States = Type 2, Summary Net Link States = Type 3.",
    ["show ip ospf database"]
  ),
  c19.s(
    "OSPF",
    "Hard",
    "Examine the `show ip ospf database` output from router R1. What can be concluded about the OSPF network topology inside Area 0?",
    "Area 0 contains four OSPF routers, one multiaccess subnet with a DR at interface 10.1.1.4, and two interarea subnets advertised by ABR 1.1.1.1.",
    [
      ["Area 0 contains four ABRs, four broadcast segments with DRs, and two external routes redistributed from EIGRP.", "Only router 1.1.1.1 is advertising Summary Net Link States (Type 3 LSAs), and there is only one Net Link States (Type 2 LSA) entry."],
      ["Router 4.4.4.4 is an Area Border Router that is summarizing two /24 subnets from Area 1 into Backbone Area 0.", "Under Summary Net Link States, the ADV Router column lists 1.1.1.1 as the ABR originating both Type 3 LSAs, whereas 4.4.4.4 is the DR on 10.1.1.4."],
      ["All four routers connect exclusively via point-to-point serial links because only one Net Link States entry appears.", "Point-to-point serial links do not elect a DR and produce zero Net Link States (Type 2) entries; the presence of one Type 2 LSA proves a DR-elected multiaccess link exists."]
    ],
    "In `show ip ospf database`, the `Router Link States` section lists one Type 1 LSA per router in the area (four routers: 1.1.1.1, 2.2.2.2, 3.3.3.3, and 4.4.4.4). The `Net Link States` section lists one Type 2 LSA for each multiaccess network with a DR (Link ID 10.1.1.4 is the DR's interface IP, originated by ADV Router 4.4.4.4). The `Summary Net Link States` section lists Type 3 interarea LSAs originated by ABR 1.1.1.1.",
    "In `Net Link States` (Type 2), Link ID = DR's interface IP address, and ADV Router = DR's Router ID.",
    ["show ip ospf database"],
    {
      cli: "R1# show ip ospf database\n            OSPF Router with ID (1.1.1.1) (Process ID 1)\n\n                Router Link States (Area 0)\nLink ID         ADV Router      Age         Seq#       Checksum Link count\n1.1.1.1         1.1.1.1         412         0x80000005 0x004A12 1\n2.2.2.2         2.2.2.2         398         0x80000004 0x008B31 1\n3.3.3.3         3.3.3.3         405         0x80000004 0x001C90 1\n4.4.4.4         4.4.4.4         380         0x80000006 0x009F11 1\n\n                Net Link States (Area 0)\nLink ID         ADV Router      Age         Seq#       Checksum\n10.1.1.4        4.4.4.4         380         0x80000002 0x007E44\n\n                Summary Net Link States (Area 0)\nLink ID         ADV Router      Age         Seq#       Checksum\n172.16.1.0      1.1.1.1         210         0x80000001 0x003D18\n172.16.2.0      1.1.1.1         210         0x80000001 0x003222"
    }
  )
];

const c20 = mk("IP Connectivity", 25, "v1c20");
const q20 = [
  c20.s(
    "OSPF",
    "Easy",
    "A router has no configured `router-id` command, Loopback0 is 10.99.1.1/32 (administratively down), Loopback1 is 10.5.1.1/32 (up/up), G0/0 is 192.168.50.1/24 (up/up), and G0/1 is 192.168.100.1/24 (up/up). Which OSPF Router ID does the process choose when starting?",
    "10.5.1.1",
    [
      ["10.99.1.1", "Loopback0 is administratively down; OSPF only considers loopback interfaces whose interface status is currently up."],
      ["192.168.100.1", "Although 192.168.100.1 is numerically higher than 10.5.1.1, OSPF always prefers an up loopback interface over any non-loopback physical interface."],
      ["192.168.50.1", "Physical interfaces are evaluated only when no active loopback interface with an IPv4 address exists on the router."]
    ],
    "When selecting its 32-bit OSPF Router ID, Cisco IOS checks three sources in strict priority order: (1) an explicitly configured `router-id` under `router ospf`, (2) the highest IPv4 address among all loopback interfaces that are currently in an `up` state, and (3) the highest IPv4 address among all non-loopback interfaces in an `up` state. Because Loopback1 (10.5.1.1) is up, it wins over Loopback0 (down) and over higher physical interface IPs.",
    "OSPF RID precedence: 1. `router-id` command -> 2. Highest UP loopback IP -> 3. Highest UP physical interface IP.",
    ["router-id", "show ip ospf", "clear ip ospf process"]
  ),
  c20.s(
    "OSPF",
    "Easy",
    "Using the default Cisco IOS OSPF reference bandwidth of 100 Mbps, what OSPF interface cost is assigned automatically to a 10-Gbps TenGigabitEthernet interface?",
    "1",
    [
      ["10", "A cost of 10 is assigned to a 10-Mbps Ethernet interface (100 Mbps / 10 Mbps = 10), not a 10-Gbps interface."],
      ["100", "A cost of 100 would require a 1-Mbps interface bandwidth unless the reference bandwidth was manually increased to 1,000,000 Mbps."],
      ["0", "OSPF interface cost is an integer from 1 to 65,535; any fractional result below 1 is rounded up to a minimum cost of 1."]
    ],
    "Cisco IOS calculates the default OSPF cost using the formula `Reference_Bandwidth / Interface_Bandwidth`, where the default reference bandwidth is 100 Mbps. Because OSPF cost must be a positive integer between 1 and 65,535, FastEthernet (100 Mbps), GigabitEthernet (1 Gbps), TenGigabitEthernet (10 Gbps), and faster ports all default to a cost of 1 until `auto-cost reference-bandwidth` is increased.",
    "By default (ref-bw = 100 Mbps), FastEthernet, GigabitEthernet, and 10GigE all tie at cost = 1!",
    ["auto-cost reference-bandwidth", "ip ospf cost", "show ip ospf interface brief"]
  ),
  c20.s(
    "OSPF",
    "Easy",
    "Which OSPF router subcommand causes an enterprise edge router to advertise a default route (0.0.0.0/0) into OSPF whenever a valid default route already exists in its IPv4 routing table?",
    "default-information originate",
    [
      ["ip route 0.0.0.0 0.0.0.0 null0", "Configuring a static route to Null0 creates a local discard route in the routing table but does not instruct OSPF to flood a default LSA without `default-information originate`."],
      ["network 0.0.0.0 255.255.255.255 area 0", "The `network 0.0.0.0 255.255.255.255 area 0` command enables OSPF on all local interfaces in Area 0; it does not advertise a 0.0.0.0/0 default route."],
      ["redistribute default-route metric 1", "Cisco IOS OSPF does not have a `redistribute default-route` syntax; default route origination requires `default-information originate`."]
    ],
    "Configuring `default-information originate` under `router ospf` causes the router to inject a default route (`0.0.0.0/0`, shown as `O*E2` with default metric 1 in other routers' tables) into the OSPF domain, provided the router currently has a default route in its own routing table. Adding the `always` keyword advertises `0.0.0.0/0` unconditionally even if no local default route exists.",
    "Use `default-information originate` (conditional on having a local 0.0.0.0/0 route) or `default-information originate always` (unconditional).",
    ["default-information originate", "show ip route ospf"]
  ),
  c20.s(
    "OSPF",
    "Easy",
    "What is the immediate effect of configuring `passive-interface GigabitEthernet0/2` under the OSPF routing process?",
    "OSPF stops sending and processing Hello packets on Gi0/2, so no neighbors form there, but the subnet on Gi0/2 is still advertised in LSAs.",
    [
      ["OSPF completely removes Gi0/2 from the routing process and stops advertising the connected subnet to other OSPF routers.", "A passive interface remains enabled for OSPF and continues to have its connected subnet advertised in the router's Type 1 LSA."],
      ["OSPF places Gi0/2 into an administrative shutdown state at Layer 1 and Layer 2 until `no passive-interface` is issued.", "The `passive-interface` subcommand affects only OSPF Hello processing and neighbor formation; normal data traffic continues to pass."],
      ["OSPF allows incoming LSAs from neighbors on Gi0/2 while blocking outgoing LSAs to conserve WAN bandwidth.", "Because OSPF suppresses Hello packets on a passive interface, no neighbor relationship or adjacency can form in either direction."]
    ],
    "Making an OSPF interface passive prevents the router from transmitting or accepting OSPF Hello messages on that port, which secures user-facing LANs against unauthorized OSPF peering and saves link overhead. However, OSPF still includes the passive interface's connected prefix and cost inside its Type 1 Router LSA so remote routers can route traffic to that subnet.",
    "`passive-interface` = NO Hellos, NO neighbors on that port, YES subnet is still advertised in OSPF!",
    ["passive-interface", "passive-interface default", "show ip ospf interface"]
  ),
  c20.s(
    "OSPF",
    "Medium",
    "A router has interfaces Gi0/0 (10.1.0.1/24), Gi0/1 (10.1.1.1/24), Gi0/2 (10.1.2.1/24), and Gi0/3 (10.1.4.1/24). Which single `network` command under `router ospf 1` matches ONLY Gi0/0 and Gi0/1 and places them into Area 0?",
    "network 10.1.0.0 0.0.1.255 area 0",
    [
      ["network 10.1.0.0 0.0.255.255 area 0", "A wildcard mask of 0.0.255.255 matches any value in the third octet, which would match all four interfaces (10.1.0.1, 10.1.1.1, 10.1.2.1, and 10.1.4.1)."],
      ["network 10.1.0.0 0.0.0.255 area 0", "A wildcard mask of 0.0.0.255 requires the third octet to equal 0, matching only Gi0/0 (10.1.0.1) and missing Gi0/1 (10.1.1.1)."],
      ["network 10.1.0.0 255.255.254.0 area 0", "255.255.254.0 is a subnet mask rather than an OSPF wildcard mask; OSPF wildcard bits use 0 for must-match and 1 for don't-care."]
    ],
    "The OSPF `network` command compares the configured address against each local interface's IPv4 address using an ACL-style wildcard mask (0 = bit must match, 1 = don't care). With `10.1.0.0 0.0.1.255`, the third octet can be 0 or 1 and the fourth octet can be 0–255, matching `10.1.0.1` and `10.1.1.1` while excluding `10.1.2.1` and `10.1.4.1`.",
    "Wildcard mask = 255.255.255.255 minus the block subnet mask. For two contiguous /24s (/23 = 255.255.254.0), wildcard = 0.0.1.255.",
    ["network", "show ip ospf interface brief"]
  ),
  c20.s(
    "OSPF",
    "Medium",
    "In global configuration mode under `router ospf 10`, someone enters `network 172.16.25.19 0.0.255.255 area 0`. How does Cisco IOS store and display this statement in `show running-config`?",
    "network 172.16.0.0 0.0.255.255 area 0",
    [
      ["network 172.16.25.19 0.0.255.255 area 0", "Cisco IOS automatically zeroes out any address bits in the `network` command that correspond to 1s ('don't care' bits) in the wildcard mask."],
      ["network 172.16.25.0 255.255.0.0 area 0", "Cisco IOS never converts an OSPF wildcard mask into a dotted-decimal subnet mask in the running configuration."],
      ["ip ospf 10 area 0 under interface configuration mode", "Entering an OSPF `network` statement under `router ospf` does not convert the configuration into interface-level `ip ospf` subcommands."]
    ],
    "When you enter an OSPF `network` command, Cisco IOS applies the wildcard mask to the IPv4 address you typed and sets every 'don't care' bit position (where the wildcard mask has binary 1s) to 0 before saving the line to `running-config`. Because the last two octets of the wildcard mask are `255.255`, IOS converts `172.16.25.19` into `172.16.0.0`.",
    "IOS normalizes the `network` command address by zeroing any octets where the wildcard mask is 255.",
    ["network", "show running-config"]
  ),
  c20.s(
    "OSPF",
    "Medium",
    "An engineer wants to migrate a router from traditional OSPF `network` statements to interface-level OSPF configuration on interface GigabitEthernet0/1 in Process 10 and Area 5. Which command accomplishes this under `interface GigabitEthernet0/1`?",
    "ip ospf 10 area 5",
    [
      ["ip router ospf 10 area 5", "`ip router ospf` is NX-OS syntax; on Cisco IOS routers, the interface subcommand is `ip ospf <process-id> area <area-id>`."],
      ["ospf 10 area 5", "Omitting the leading `ip` keyword is invalid in Cisco IOS interface configuration mode for OSPFv2."],
      ["ipv4 ospf 10 area 5", "Cisco IOS uses `ip ospf <process-id> area <area-id>` for IPv4 OSPF, not `ipv4 ospf`."]
    ],
    "Instead of using wildcard masks with the `network` command in router configuration mode, you can enable OSPF directly on an interface by entering `ip ospf <process-id> area <area-id>` in interface configuration mode. When configured this way, `show ip protocols` lists the interface under `Routing on Interfaces Configured Explicitly`, and `show ip ospf interface` displays `Attached via Interface Enable`.",
    "Interface-mode OSPF syntax: `ip ospf <process-id> area <area-id>`. Verify with `show ip ospf interface brief`.",
    ["ip ospf area", "show ip protocols", "show ip ospf interface"]
  ),
  c20.s(
    "OSPF",
    "Medium",
    "A campus network contains 40-Gbps uplinks, 10-Gbps distribution links, 1-Gbps access links, and 100-Mbps legacy links. What is the minimum value (in Mbps) that should be configured with `auto-cost reference-bandwidth` on every OSPF router so all four link speeds receive distinct default OSPF costs?",
    "40000",
    [
      ["40", "The `auto-cost reference-bandwidth` command takes its parameter in megabits per second (Mbps), so 40 sets a 40-Mbps reference bandwidth, not 40 Gbps."],
      ["1000", "A reference bandwidth of 1000 Mbps (1 Gbps) gives 1-Gbps, 10-Gbps, and 40-Gbps interfaces the exact same minimum OSPF cost of 1."],
      ["10000", "A reference bandwidth of 10000 Mbps (10 Gbps) still causes both 10-Gbps and 40-Gbps interfaces to tie with an OSPF cost of 1."]
    ],
    "The `auto-cost reference-bandwidth <mbps>` command specifies the reference bandwidth in megabits per second (Mbps). To differentiate 40-Gbps (40,000 Mbps) interfaces from 10-Gbps (10,000 Mbps) interfaces, the reference bandwidth must be set to at least `40000` (giving costs of 1 for 40G, 4 for 10G, 40 for 1G, and 400 for 100M) consistently across all OSPF routers.",
    "Remember that `auto-cost reference-bandwidth` is configured in Mbps: 1 Gbps = 1000, 10 Gbps = 10000, 40 Gbps = 40000, 100 Gbps = 100000.",
    ["auto-cost reference-bandwidth", "show ip ospf"]
  ),
  c20.s(
    "OSPF",
    "Medium",
    "Which statement accurately describes the order of precedence Cisco IOS uses to determine the OSPF cost of an interface?",
    "An explicit `ip ospf cost` overrides the reference-bandwidth formula, while `bandwidth` changes its denominator.",
    [
      ["The `bandwidth` interface subcommand directly sets both the physical line rate of the port and overrides any `ip ospf cost` setting.", "The `bandwidth` command neither changes the physical speed of an interface nor overrides an explicit `ip ospf cost` command."],
      ["The `auto-cost reference-bandwidth` router subcommand overrides any per-interface `ip ospf cost` commands across the entire OSPF process.", "A per-interface `ip ospf cost <value>` always takes top precedence over the `Ref_BW / Int_BW` formula on that interface."],
      ["Cisco IOS measures real-time link utilization every 10 seconds to dynamically recalculate the OSPF interface cost.", "OSPF cost is based purely on static configuration (`ip ospf cost` or `Ref_BW / Int_BW`), never on real-time interface load or utilization."]
    ],
    "Cisco IOS determines an interface's OSPF cost in two ways: if `ip ospf cost <1-65535>` is configured on the interface, IOS uses that exact value regardless of reference or interface bandwidth. Otherwise, IOS computes `Reference_Bandwidth / Interface_Bandwidth` using the `auto-cost reference-bandwidth` setting and the interface's default or configured `bandwidth <kbps>` value.",
    "`ip ospf cost` always wins over `Reference_BW / Interface_BW`. Never use `speed` vs `bandwidth` interchangeably: `bandwidth` is only a metric calculation value!",
    ["ip ospf cost", "bandwidth", "auto-cost reference-bandwidth"]
  ),
  c20.s(
    "OSPF",
    "Medium",
    "An OSPF router is already running with Router ID 192.168.1.1 and has active neighbors. You configure `router-id 10.0.0.1` under `router ospf 1`. When does the new Router ID actually take effect?",
    "Only after you run `clear ip ospf process` (and confirm) or reload the router",
    [
      ["Immediately upon pressing Enter, causing the router to send a Gratuitous Hello with the new RID", "OSPF locks in its Router ID when the process initializes; changing `router-id` does not take effect until the OSPF process restarts."],
      ["Automatically at the next 30-minute periodic LSA refresh cycle without dropping any neighbors", "Waiting 30 minutes does not change the active RID; Cisco IOS prints a message instructing you to reload or run `clear ip ospf process`."],
      ["As soon as you exit router configuration mode and save the configuration with `copy running-config startup-config`", "Saving the configuration to NVRAM does not restart the live OSPF process unless the router is subsequently reloaded."]
    ],
    "Because every LSA in the LSDB is tagged with the originating router's 32-bit Router ID, changing an active OSPF Router ID requires tearing down existing adjacencies and re-originating LSAs. When you configure a new `router-id`, IOS displays a console notice stating that you must reload the router or use `clear ip ospf process` for the new RID to take effect.",
    "Changing OSPF RID (`router-id` or adding a loopback) NEVER preempts an already running OSPF process until `clear ip ospf process` or reload.",
    ["router-id", "clear ip ospf process", "show ip ospf"]
  ),
  c20.m(
    "OSPF",
    "Hard",
    "An engineer wants R1 to form OSPF neighbors ONLY on GigabitEthernet0/0 (10.1.1.1/24) while still advertising the subnets connected to GigabitEthernet0/1 (10.1.2.1/24) and GigabitEthernet0/2 (10.1.3.1/24), and also securing any future interfaces from accidentally forming OSPF neighbors. Which two commands under `router ospf 1` (assuming `network 10.1.0.0 0.0.255.255 area 0` is already configured) best achieve this goal?",
    [
      "passive-interface default",
      "no passive-interface GigabitEthernet0/0"
    ],
    [
      ["passive-interface GigabitEthernet0/0", "Making Gi0/0 passive prevents OSPF Hellos on Gi0/0, which breaks the requirement to form neighbors on Gi0/0."],
      ["no network 10.1.2.0 0.0.1.255 area 0", "Removing the `network` statement stops OSPF from advertising the Gi0/1 and Gi0/2 subnets altogether."],
      ["default-information originate always", "`default-information originate always` injects a 0.0.0.0/0 default route into OSPF and has no effect on passive interfaces."]
    ],
    "When most interfaces on a router should be passive and future interfaces should default to safe behavior, best practice is to configure `passive-interface default` under `router ospf`, which makes all current and future OSPF interfaces passive. You then selectively enable Hello packets on router-to-router links using `no passive-interface GigabitEthernet0/0`.",
    "Pair `passive-interface default` with `no passive-interface <uplink>` to secure all access VLANs by default.",
    ["passive-interface default", "no passive-interface", "show ip protocols"]
  ),
  c20.s(
    "OSPF",
    "Hard",
    "Examine the output of `show ip protocols` on R1. Which statement accurately explains how OSPF was enabled on R1's interfaces and which interfaces send OSPF Hello packets?",
    "OSPF was enabled using interface-mode `ip ospf 1 area 0` commands on Gi0/0, Gi0/1, and Loopback0, and only Gi0/0 sends Hello packets.",
    [
      ["OSPF was enabled using `network 0.0.0.0 255.255.255.255 area 0`, and both Gi0/0 and Gi0/1 send OSPF Hello packets.", "The `Routing for Networks:` section is empty and `Routing on Interfaces Configured Explicitly` lists the interfaces, proving `ip ospf` interface commands were used; also Gi0/1 is listed under Passive Interface(s)."],
      ["OSPF is advertising only Gi0/0 into Area 0 because Gi0/1 and Loopback0 are listed under Passive Interface(s).", "Passive interfaces do not send Hellos, but their connected subnets are still advertised in OSPF LSAs for Area 0."],
      ["Router R1 has formed three OSPF neighbor adjacencies with router 10.10.10.1 across Gi0/0, Gi0/1, and Loopback0.", "10.10.10.1 is R1's own Router ID (`Router ID 10.10.10.1`), and Loopback0 and Gi0/1 cannot form neighbors because they are passive."]
    ],
    "In `show ip protocols`, when interfaces are configured with the interface subcommand `ip ospf <id> area <area>`, they appear under `Routing on Interfaces Configured Explicitly (Area 0)` rather than under `Routing for Networks:`. Additionally, the `Passive Interface(s):` section lists `GigabitEthernet0/1` and `Loopback0`, meaning only `GigabitEthernet0/0` actively sends and processes OSPF Hello packets.",
    "In `show ip protocols`: `Routing for Networks:` = `network` command; `Routing on Interfaces Configured Explicitly` = `ip ospf <id> area <area>` interface command.",
    ["show ip protocols", "ip ospf area", "passive-interface"],
    {
      cli: "R1# show ip protocols\n*** IP Routing is NSF aware ***\nRouting Protocol is \"ospf 1\"\n  Outgoing update filter list for all interfaces is not set\n  Incoming update filter list for all interfaces is not set\n  Router ID 10.10.10.1\n  Number of areas in this router is 1. 1 normal 0 stub 0 nssa\n  Maximum path: 4\n  Routing for Networks:\n  Routing on Interfaces Configured Explicitly (Area 0):\n    Loopback0\n    GigabitEthernet0/1\n    GigabitEthernet0/0\n  Passive Interface(s):\n    GigabitEthernet0/1\n    Loopback0\n  Routing Information Sources:\n    Gateway         Distance      Last Update\n    10.10.10.2           110      00:14:22\n  Distance: (default is 110)"
    }
  ),
  c20.s(
    "OSPF",
    "Hard",
    "Examine the `show ip route ospf` output on R2. Why do three separate next-hop entries appear under `10.100.50.0/24`, and how many equal-cost paths can OSPF install by default?",
    "R2 calculated three equal-cost OSPF paths (metric 20) to 10.100.50.0/24, and OSPF installs up to 4 equal-cost paths by default.",
    [
      ["R2 is keeping one primary route and two floating backup routes in the routing table, and OSPF supports up to 2 active paths by default.", "Only true equal-cost paths are installed simultaneously in the IPv4 routing table; backup routes with higher metrics remain in the LSDB, and the default maximum-paths is 4."],
      ["R2 learned 10.100.50.0/24 from three different routing protocols that all share an administrative distance of 20 and a metric of 110.", "Inside `[110/20]`, the first number (110) is OSPF's administrative distance and the second number (20) is the OSPF cost metric."],
      ["R2 is redistributing three external Type 2 default routes into Area 0 because the metric is fixed at 20 on all three interfaces.", "The route code is `O` (intra-area OSPF), not `O E2`, and 20 is the cumulative intra-area OSPF cost across each equal-cost path."]
    ],
    "When OSPF discovers multiple paths to the same prefix that tie with the exact same lowest total OSPF cost (here, cost 20 with administrative distance 110, shown as `[110/20]`), it installs up to `maximum-paths` routes into the routing table for equal-cost multipath (ECMP) load balancing. By default, Cisco IOS OSPF sets `maximum-paths` to 4.",
    "In `[110/20]`, 110 = Administrative Distance, 20 = OSPF Cost. Default `maximum-paths` = 4.",
    ["show ip route ospf", "maximum-paths"],
    {
      cli: "R2# show ip route ospf\nCodes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP\n       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area\n       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2\n       E1 - OSPF external type 1, E2 - OSPF external type 2\n\n      10.0.0.0/8 is variably subnetted, 6 subnets, 2 masks\nO        10.100.50.0/24 [110/20] via 10.1.3.2, 00:05:12, GigabitEthernet0/3\n                        [110/20] via 10.1.2.2, 00:05:12, GigabitEthernet0/2\n                        [110/20] via 10.1.1.2, 00:05:12, GigabitEthernet0/1"
    }
  ),
  c20.t(
    "OSPF",
    "Hard",
    "Match each OSPF configuration or verification element with its exact default value or behavior in Cisco IOS.",
    [
      ["Default OSPF reference bandwidth", "100 Mbps (configured via auto-cost reference-bandwidth in Mbps)"],
      ["Default OSPF cost of a T1 (1.544 Mbps) serial link", "64 (100,000 kbps divided by 1544 kbps, rounded down to integer)"],
      ["Default OSPF cost of a 10-Mbps Ethernet port", "10 (100 Mbps divided by 10 Mbps)"],
      ["Route code for an OSPF default route from default-information originate", "O*E2 0.0.0.0/0 (OSPF candidate default, external Type 2)"]
    ],
    "Knowing default OSPF interface costs and route codes speeds up troubleshooting: with the 100-Mbps default reference bandwidth, a T1 serial link (1544 kbps) has cost 64, a 10-Mbps Ethernet port has cost 10, and 100-Mbps or faster Ethernet ports have cost 1. A default route originated via `default-information originate` appears in downstream routing tables as `O*E2 0.0.0.0/0`.",
    "Default costs at 100-Mbps ref-bw: Serial T1 = 64, Ethernet (10M) = 10, FastEthernet/GigE/10GigE = 1.",
    ["show ip ospf interface brief", "show ip route ospf"]
  )
];

const c21 = mk("IP Connectivity", 25, "v1c21");
const q21 = [
  c21.s(
    "OSPF",
    "Easy",
    "What is the default OSPF interface priority on a Cisco IOS broadcast Ethernet interface, and what priority value disqualifies a router from ever becoming the DR or BDR?",
    "Default priority is 1; a priority of 0 prevents the router from becoming DR or BDR.",
    [
      ["Default priority is 100; a priority of 255 prevents the router from becoming DR or BDR.", "A priority of 255 is the highest possible OSPF priority (most likely to win DR), and the default priority is 1, not 100."],
      ["Default priority is 0; a priority of 255 prevents the router from becoming DR or BDR.", "If the default priority were 0, no router on an Ethernet LAN could ever be elected DR or BDR without manual configuration."],
      ["Default priority is 64; a priority of 1 prevents the router from becoming DR or BDR.", "64 is the default OSPF cost of a T1 serial interface, whereas default OSPF interface priority is 1."]
    ],
    "On multiaccess broadcast networks, Cisco IOS assigns a default OSPF priority of 1 (`ip ospf priority <0-255>`). During DR/BDR election, the router with the highest priority (1 to 255) becomes the DR, and ties are broken by the highest Router ID. Setting `ip ospf priority 0` forces the router to remain a DROther permanently.",
    "OSPF priority range is 0..255: default = 1, higher is better, 0 = never become DR/BDR (DROther only).",
    ["ip ospf priority", "show ip ospf interface"]
  ),
  c21.s(
    "OSPF",
    "Easy",
    "Which interface subcommand changes an Ethernet link between two routers so OSPF does not elect a DR/BDR and does not generate a Type 2 Network LSA?",
    "ip ospf network point-to-point",
    [
      ["ip ospf priority 0", "Setting `ip ospf priority 0` on both routers leaves the network type as broadcast and prevents any DR from being elected, which stalls adjacency formation."],
      ["ip ospf network broadcast", "Ethernet interfaces already default to the `broadcast` OSPF network type, which always requires a DR election and a Type 2 LSA."],
      ["passive-interface GigabitEthernet0/0", "Making the interface passive disables OSPF Hello packets completely so the two routers cannot form any neighbor relationship."]
    ],
    "When only two routers connect over an Ethernet link (such as a fiber point-to-point Metro Ethernet circuit), configuring `ip ospf network point-to-point` on both interfaces eliminates the DR/BDR election wait time and removes the extra Type 2 Network LSA from the LSDB while keeping the 10-second Hello and 40-second Dead timers.",
    "On 2-router Ethernet links, `ip ospf network point-to-point` on BOTH ends speeds convergence and eliminates Type 2 LSAs.",
    ["ip ospf network point-to-point", "show ip ospf interface brief"]
  ),
  c21.s(
    "OSPF",
    "Easy",
    "When you configure `ip ospf hello-interval 5` on an Ethernet interface, what happens to the OSPF Dead interval on that interface by default?",
    "Cisco IOS automatically sets the Dead interval to 20 seconds (four times the Hello interval).",
    [
      ["The Dead interval remains at its default of 40 seconds unless you also configure `ip ospf dead-interval 20`.", "Changing `ip ospf hello-interval` on Cisco IOS automatically updates the Dead interval to 4x the new Hello value unless Dead was explicitly set."],
      ["Cisco IOS automatically sets the Dead interval to 15 seconds (three times the Hello interval).", "OSPF multiplies the Hello interval by 4 (not 3, which is EIGRP's hold-time multiplier) to compute the automatic Dead interval."],
      ["The OSPF interface enters a down state until you manually configure a matching Dead interval on the local interface.", "The local interface stays up and automatically adjusts its Dead timer to 4x the Hello timer; however, the neighbor must also match both timers."]
    ],
    "In Cisco IOS, the default OSPF Dead interval is four times the Hello interval (40 seconds for a 10-second Hello). Whenever you change `ip ospf hello-interval <seconds>`, IOS automatically recalculates the Dead interval on that interface to `4 × Hello` unless you manually override it with `ip ospf dead-interval`.",
    "OSPF Dead interval automatically adjusts to 4 × Hello when you change `ip ospf hello-interval`.",
    ["ip ospf hello-interval", "ip ospf dead-interval", "show ip ospf interface"]
  ),
  c21.s(
    "OSPF",
    "Easy",
    "In the output of `show ip ospf neighbor`, R1 lists neighbor 2.2.2.2 with State `FULL/ -` on interface GigabitEthernet0/0. What does the hyphen (`-`) after the slash indicate?",
    "GigabitEthernet0/0 is using an OSPF network type (such as point-to-point) that does not use a DR or BDR.",
    [
      ["Neighbor 2.2.2.2 has `ip ospf priority 0` configured and is therefore operating as a DROther router.", "A neighbor acting as a DROther on a broadcast network displays `FULL/DROTHER` or `2WAY/DROTHER`, never `FULL/ -`."],
      ["The two routers have mismatched OSPF network types and are unable to elect a Designated Router.", "If one side were broadcast and waiting for a DR, the broadcast side would show `FULL/DR` or `FULL/BDR`, while `-` specifically means no DR/BDR concept on the local link."],
      ["Neighbor 2.2.2.2 is currently a passive interface that accepts LSAs without participating in DR elections.", "Passive interfaces do not send or process Hellos and never appear in `show ip ospf neighbor`."]
    ],
    "In `show ip ospf neighbor`, the `State` column displays `<neighbor-state>/<neighbor-DR-role>`. On broadcast networks, the second part is `DR`, `BDR`, or `DROTHER`. On network types that do not elect a DR or BDR—such as `point-to-point`—the router displays a hyphen (`FULL/ -`) to indicate no DR role applies.",
    "`FULL/ -` in `show ip ospf neighbor` = no DR/BDR election on this link (e.g., point-to-point network type).",
    ["show ip ospf neighbor", "show ip ospf interface brief"]
  ),
  c21.s(
    "OSPF",
    "Medium",
    "Four routers on an Ethernet LAN boot simultaneously with default OSPF priority 1: R1 (RID 10.1.1.1), R2 (RID 10.1.1.2), R3 (RID 10.1.1.3), and R4 (RID 10.1.1.4). After the election completes, R5 boots onto the same LAN with `ip ospf priority 255` and RID 10.1.1.5. Subsequently, R4 fails. What are the DR and BDR roles immediately after R4 fails?",
    "R3 becomes the DR, and R5 becomes the BDR.",
    [
      ["R5 preempts immediately upon booting to become the DR, and R3 remains the BDR when R4 fails.", "OSPF DR/BDR elections are non-preemptive; when R5 joins an already-elected segment, it becomes a DROther regardless of its priority 255."],
      ["R5 jumps directly from DROther to DR when R4 fails because R5 has priority 255, and R3 stays BDR.", "When the current DR fails, OSPF always promotes the existing BDR (R3) to DR first, and then holds an election among DROthers for the vacant BDR role."],
      ["R2 becomes the DR and R1 becomes the BDR because OSPF prefers the lowest Router ID.", "OSPF breaks priority ties using the highest Router ID, not the lowest Router ID."]
    ],
    "Initially, R4 (highest RID 10.1.1.4) is elected DR and R3 (second-highest RID 10.1.1.3) is elected BDR. Because OSPF DR/BDR elections do not allow preemption, R5 joins as a DROther despite having priority 255. When the DR (R4) fails, the current BDR (R3) is automatically promoted to DR, and an election among the remaining DROthers (R1, R2, R5) elects R5 (priority 255) as the new BDR.",
    "No DR preemption! If the DR fails: 1) BDR promotes to DR, 2) remaining DROthers elect a new BDR.",
    ["show ip ospf neighbor", "ip ospf priority"]
  ),
  c21.s(
    "OSPF",
    "Medium",
    "Examine the `show ip ospf interface brief` output on R1. Which statement accurately describes R1's OSPF interfaces?",
    "On Gi0/0, R1 is a DROther with 3 adjacent (Full) neighbors out of 5 total neighbors; on Gi0/1, R1 uses point-to-point mode with 1 Full neighbor.",
    [
      ["On Gi0/0, R1 has formed Full adjacencies with all 5 neighbors and 3 of them are Backup Designated Routers.", "In the `Nbrs F/C` column, `2/5` means 2 neighbors are in the Full state (the DR and BDR) out of 5 discovered neighbors total."],
      ["On Gi0/0, R1's neighbor is a DROther, and on Gi0/1, R1's neighbor is a point-to-point router.", "In `show ip ospf interface brief`, the `State` column shows the LOCAL router's role on that interface (`DROTH`, `DR`, `BDR`, `P2P`), not the neighbor's role."],
      ["Gi0/0 is in Area 64 with OSPF process 1, and Gi0/1 is in Area 1 with OSPF process 10.", "The `Area` column shows both interfaces are in Area 0, while the `Cost` column shows costs of 1 and 10."]
    ],
    "In `show ip ospf interface brief`, the `State` column reports the local router's interface state/role: `DROTH` on Gi0/0 (meaning R1 is a DROther) and `P2P` on Gi0/1 (point-to-point). The `Nbrs F/C` column shows Full adjacencies over total discovered neighbors: `2/5` on Gi0/0 means R1 knows 5 neighbors on that LAN (1 DR, 1 BDR, and 3 other DROthers) and is Full with 2 of them (the DR and BDR).",
    "In `show ip ospf interface brief`: `State` = LOCAL router's role (DR/BDR/DROTH/P2P); `Nbrs F/C` = Full neighbors / Count of all neighbors.",
    ["show ip ospf interface brief"],
    {
      cli: "R1# show ip ospf interface brief\nInterface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C\nGi0/0        1     0               10.1.1.1/24        1     DROTH 2/5\nGi0/1        1     0               10.1.2.1/30        10    P2P   1/1"
    }
  ),
  c21.s(
    "OSPF",
    "Medium",
    "R1 and R2 connect over GigabitEthernet0/0. On R1, Gi0/0 is configured with `ip ospf network broadcast` (the default), while on R2, Gi0/0 is configured with `ip ospf network point-to-point`. What is the result?",
    "R1 and R2 reach the FULL neighbor state and exchange LSAs, but SPF fails to install any OSPF routes learned across that link.",
    [
      ["R1 and R2 never discover each other in `show ip ospf neighbor` because the OSPF network type field is checked inside Hello packets.", "OSPF Hello packets do not carry an explicit network-type code; because both broadcast and point-to-point default to 10/40 timers, they become FULL neighbors."],
      ["R1 and R2 become stuck permanently in the ExStart/Exchange state due to a Database Description packet size mismatch.", "Stalling in ExStart/Exchange is the classic symptom of an IP MTU mismatch (`ip mtu`), not an OSPF network type mismatch."],
      ["R1 and R2 operate normally and install all OSPF routes, but R2 logs an informational warning about missing BDR elections.", "Because R1 uses a Type 2 LSA (expecting a DR on a broadcast subnet) while R2 models a point-to-point link without a Type 2 LSA, the SPF graph check fails and zero routes are installed."]
    ],
    "Both `broadcast` and `point-to-point` OSPF network types use the same default 10-second Hello and 40-second Dead intervals, so R1 and R2 form a FULL neighbor relationship (with R1 showing `FULL/DR` and R2 showing `FULL/ -`) and exchange LSAs. However, because R1 expects a Type 2 Network LSA for the transit link while R2 does not use Type 2 LSAs, the SPF topology check fails (`%OSPF-4-NET_TYPE_MISMATCH`), and neither router adds OSPF routes across that link.",
    "Broadcast vs. Point-to-Point mismatch = Neighbors ARE FULL (`FULL/DR` on one side, `FULL/ -` on the other), but ZERO OSPF routes are installed!",
    ["show ip ospf neighbor", "show ip ospf interface brief", "ip ospf network"]
  ),
  c21.s(
    "OSPF",
    "Medium",
    "R1 has `ip mtu 1500` on Gi0/0, while directly connected neighbor R2 has `ip mtu 1400` on Gi0/0. All other OSPF parameters match. What symptom occurs when OSPF starts between R1 and R2?",
    "The routers exchange Hellos, but the adjacency fails in ExStart/Exchange and no OSPF routes are learned.",
    [
      ["The routers do not appear in `show ip ospf neighbor` at all because Hello packets are dropped when IP MTU values differ.", "Small Hello packets pass easily over both 1400-byte and 1500-byte MTUs, so the neighbors appear in `show ip ospf neighbor` before failing in ExStart."],
      ["The routers reach the FULL state and exchange their LSDBs, but SPF refuses to calculate routes across the link.", "Reaching FULL state with zero routes installed is the symptom of a broadcast/point-to-point network type mismatch, whereas an MTU mismatch prevents reaching FULL."],
      ["R1 automatically fragments its Database Description packets down to 1400 bytes and completes the FULL adjacency.", "OSPF checks the interface IP MTU field inside Database Description (DD) packets during ExStart and rejects neighbor DD packets that advertise a different MTU."]
    ],
    "During the ExStart state, OSPF neighbors include their outgoing interface's IP MTU inside the Database Description (DD) packet header. If one neighbor advertises a different MTU than the local interface, the routers reject the DD exchange, log `%OSPF-4-ADJCHG ... from EXSTART to DOWN, Neighbor Down: Too many retransmissions`, and fail to reach the FULL state.",
    "MTU mismatch (`ip mtu`) = Neighbors appear in `show ip ospf neighbor` but get stuck/flap in EXSTART/EXCHANGE.",
    ["ip mtu", "show ip ospf neighbor", "show ip interface"]
  ),
  c21.s(
    "OSPF",
    "Medium",
    "Which parameter does NOT need to match between two directly connected routers on an Ethernet link for them to become OSPF neighbors and successfully install OSPF routes?",
    "OSPF process ID and OSPF interface cost",
    [
      ["OSPF Hello interval and OSPF Dead interval", "Both the Hello interval and Dead interval carried in Hello packets must match exactly between two routers or they will never become neighbors."],
      ["OSPF Area ID and primary IPv4 subnet/mask", "Connected interfaces must belong to the exact same OSPF Area ID and share the same primary IPv4 subnet and mask to form a neighbor relationship."],
      ["Unique OSPF Router IDs and matching authentication settings", "Duplicate Router IDs or mismatched OSPF authentication keys prevent two routers from forming an OSPF neighbor relationship."]
    ],
    "The OSPF process ID (`router ospf <process-id>`) is strictly locally significant to each router, and OSPF interface cost (`ip ospf cost`) and priority (`ip ospf priority`, as long as at least one router on a broadcast link has priority > 0) can differ between neighbors without preventing adjacency formation or route calculation.",
    "Locally significant / allowed to differ between OSPF neighbors: Process ID, Interface Cost, and Interface Priority.",
    ["router ospf", "ip ospf cost", "ip ospf priority"]
  ),
  c21.s(
    "OSPF",
    "Hard",
    "Two routers, R1 and R2, are connected via interface Gi0/1 in Area 0 with matching IP subnet 10.1.12.0/30 and matching 10/40 timers. However, `show ip ospf neighbor` is completely empty on both routers, and R1's console periodically displays `%OSPF-4-DUP_RTRID_NBR: OSPF detected duplicate router-id 10.0.0.1 from 10.1.12.2 on interface GigabitEthernet0/1`. How do you fix this issue?",
    "Configure a unique `router-id` under `router ospf` on one of the routers and run `clear ip ospf process`.",
    [
      ["Configure `ip ospf network point-to-point` on Gi0/1 on both routers so they stop comparing Router IDs for DR election.", "Every OSPF router in a domain must have a unique 32-bit Router ID regardless of whether the link is point-to-point or broadcast."],
      ["Change the OSPF process ID on R2 from `router ospf 1` to `router ospf 2` so the two processes no longer collide.", "The OSPF process ID is locally significant and is not carried in OSPF packets; changing the process ID does not change a router's 32-bit OSPF Router ID."],
      ["Configure `no passive-interface GigabitEthernet0/1` on R1 because duplicate RID messages occur when an interface is passive.", "The syslog message proves R1 is already receiving Hello packets on Gi0/1 from 10.1.12.2; a passive interface would ignore Hellos completely."]
    ],
    "OSPF requires every router in the routing domain to have a unique 32-bit Router ID so Type 1 LSAs and SPF tree nodes can be uniquely identified. If two directly connected routers use the same Router ID, they reject each other's Hello packets, log `%OSPF-4-DUP_RTRID_NBR`, and refuse to form a neighbor relationship. Assigning a distinct `router-id` and running `clear ip ospf process` resolves the conflict.",
    "Duplicate RIDs between direct neighbors = empty `show ip ospf neighbor` + `%OSPF-4-DUP_RTRID_NBR` syslog.",
    ["router-id", "clear ip ospf process", "show ip ospf"]
  ),
  c21.m(
    "OSPF",
    "Hard",
    "R1 and R2 are directly connected on GigabitEthernet0/0 (172.16.1.1/24 and 172.16.1.2/24), and `ping 172.16.1.2` from R1 succeeds. However, `show ip ospf neighbor` on R1 is completely blank. Which two misconfigurations could cause this symptom?",
    [
      "R1 has Gi0/0 assigned to Area 0 while R2 has Gi0/0 assigned to Area 1.",
      "R1 has `ip ospf hello-interval 10` on Gi0/0 while R2 has `ip ospf hello-interval 5` on Gi0/0."
    ],
    [
      ["R1 has `ip ospf network broadcast` on Gi0/0 while R2 has `ip ospf network point-to-point` on Gi0/0.", "A broadcast-to-point-to-point network type mismatch still allows both routers to appear in `show ip ospf neighbor` in the FULL state."],
      ["R1 has `ip mtu 1500` on Gi0/0 while R2 has `ip mtu 1450` on Gi0/0.", "An IP MTU mismatch still allows both routers to appear in `show ip ospf neighbor` (failing later during ExStart/Exchange)."],
      ["R1 uses `router ospf 10` while R2 uses `router ospf 20` on Gi0/0.", "OSPF process IDs are locally significant and do not prevent neighbors from forming."]
    ],
    "For two routers to pass the Hello check and appear in `show ip ospf neighbor`, their Hello packet headers must agree on the Area ID, Hello interval, Dead interval, subnet mask, authentication, and stub-area flags, and they must have distinct Router IDs. By contrast, an MTU mismatch or a broadcast/point-to-point network type mismatch still allows the neighbor to appear in `show ip ospf neighbor`.",
    "Blank `show ip ospf neighbor` (when ping works) = check Area ID, Hello/Dead timers, passive-interface, duplicate RID, or ACL blocking 224.0.0.5 / IP proto 89.",
    ["show ip ospf interface", "show ip ospf neighbor"]
  ),
  c21.s(
    "OSPF",
    "Hard",
    "Examine the output from R1 and R2 below. Both routers are up/up on Gi0/0 and can ping each other, and `show ip ospf neighbor` shows they are FULL neighbors. Why is R1's OSPF routing table missing R2's Loopback0 subnet (10.2.2.2/32)?",
    "R1's Gi0/0 is using the BROADCAST network type (`FULL/DR`) while R2's Gi0/0 is using POINT_TO_POINT (`FULL/ -`), causing an SPF topology mismatch.",
    [
      ["R1 and R2 have different OSPF process IDs (`PID 1` vs `PID 2`), which prevents SPF from importing LSAs.", "Both outputs show `PID 1`, and even if the process IDs differed, OSPF process IDs are locally significant."],
      ["R2's Loopback0 interface has an OSPF cost of 1, which creates an equal-cost metric loop with Gi0/0.", "Having a cost of 1 on a loopback interface is normal and simply adds 1 to the cumulative path cost."],
      ["R2 is configured as a DROther with `ip ospf priority 0`, so it refuses to send Type 1 LSAs to R1.", "R1's output shows R2's role as `DR` (`FULL/DR`), whereas R2's output shows `State P2P` and `FULL/ -`, proving a network type mismatch."]
    ],
    "Looking closely at `show ip ospf neighbor` and `show ip ospf interface brief`, R1's Gi0/0 is in `State BDR` and sees R2 as `FULL/DR` (meaning R1 is using `broadcast` mode), while R2's Gi0/0 is in `State P2P` and sees R1 as `FULL/ -` (meaning R2 is using `point-to-point` mode). Because both modes use 10/40 timers, the adjacency reaches `FULL`, but SPF cannot reconcile a broadcast network with a point-to-point network and installs zero OSPF routes.",
    "Spot the mismatch in CLI output: one router shows `FULL/DR` or `State BDR/DR`, while the other shows `FULL/ -` or `State P2P`!",
    ["show ip ospf neighbor", "show ip ospf interface brief", "ip ospf network"],
    {
      cli: "R1# show ip ospf interface brief\nInterface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C\nGi0/0        1     0               10.1.12.1/30       1     BDR   1/1\nR1# show ip ospf neighbor\nNeighbor ID     Pri   State           Dead Time   Address         Interface\n2.2.2.2           1   FULL/DR         00:00:36    10.1.12.2       GigabitEthernet0/0\n\nR2# show ip ospf interface brief\nInterface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C\nLo0          1     0               10.2.2.2/32        1     LOOP  0/0\nGi0/0        1     0               10.1.12.2/30       1     P2P   1/1\nR2# show ip ospf neighbor\nNeighbor ID     Pri   State           Dead Time   Address         Interface\n1.1.1.1           0   FULL/  -        00:00:34    10.1.12.1       GigabitEthernet0/0"
    }
  ),
  c21.d(
    "OSPF",
    "Hard",
    "Order the sequence of events that occurs on an OSPF broadcast LAN when an existing Designated Router (DR) fails and a new router with priority 200 had joined the LAN after the original election.",
    [
      "The original DR and BDR are elected at initial startup based on highest priority and highest Router ID",
      "The new router with priority 200 joins the active LAN and becomes a DROther because OSPF does not preempt",
      "The original DR fails and its Dead timer expires on the attached routers",
      "The existing BDR is immediately promoted to become the new DR",
      "The remaining DROthers hold an election and choose the priority-200 router as the new BDR"
    ],
    "OSPF's DR/BDR architecture avoids unnecessary database re-flooding by making elections non-preemptive. A router that arrives after a DR and BDR already exist must wait as a DROther even if it has a higher priority. Only when the DR fails does the BDR step up to DR, opening a vacancy for BDR that the high-priority DROther then wins.",
    "A late-arriving high-priority router becomes BDR only after the current DR or BDR fails; it takes TWO failures to become DR.",
    ["show ip ospf neighbor", "ip ospf priority"]
  ),
  c21.t(
    "OSPF",
    "Hard",
    "Match each OSPF misconfiguration between two directly connected routers with its resulting neighbor state and routing table behavior.",
    [
      ["Mismatched Hello or Dead timers", "Neighbors never form (show ip ospf neighbor is empty) and no routes are learned"],
      ["Mismatched IP MTU settings", "Neighbors discover each other via Hellos but fail in ExStart/Exchange and learn no routes"],
      ["Broadcast on one side, Point-to-Point on the other", "Neighbors reach the FULL state, but SPF fails and installs no OSPF routes"],
      ["Mismatched OSPF interface costs", "Neighbors reach the FULL state and install OSPF routes (with asymmetric path metrics)"]
    ],
    "Separating OSPF issues into three buckets makes exam troubleshooting straightforward: (1) issues that prevent neighbor formation completely (timers, area ID, subnet, passive, duplicate RID, shutdown), (2) issues where neighbors form and reach FULL yet install zero routes (broadcast vs. point-to-point network type mismatch), or fail in ExStart (MTU mismatch), and (3) harmless differences (process ID, cost, priority > 0).",
    "Categorize every OSPF setting: Blocks Neighbor? Blocks ExStart (MTU)? Reaches FULL but blocks SPF (Net Type)? Or Allowed to differ?",
    ["show ip ospf neighbor", "show ip ospf interface"]
  )
];

const c22 = mk("Network Fundamentals", 20, "v1c22");
const q22 = [
  c22.s(
    "IPv6",
    "Easy",
    "How many total bits, hexadecimal digits, and 16-bit quartets compose a standard IPv6 address?",
    "128 bits, written as 32 hex digits grouped into 8 quartets of 4 hex digits each",
    [
      ["64 bits, written as 16 hexadecimal digits grouped into 4 quartets of 4 hex digits each", "64 bits is only half of an IPv6 address (such as the standard /64 interface ID or prefix), not the entire 128-bit address."],
      ["128 bits, written as 16 hexadecimal digits grouped into 8 octets of 2 hex digits each", "Each hexadecimal digit represents 4 bits, so 128 bits requires 32 hex digits (8 quartets of 4 hex digits), not 16 hex digits."],
      ["320 bits, written as 40 hexadecimal digits grouped into 8 blocks of 5 hex digits each", "40 bytes (320 bits) is the size of the fixed IPv6 packet header, whereas the IPv6 address itself is 16 bytes (128 bits)."]
    ],
    "Every IPv6 address is 128 bits (16 bytes) long. Because each hexadecimal digit encodes 4 binary bits, an unabbreviated IPv6 address consists of 32 hexadecimal digits divided by colons into 8 four-digit groups called quartets (or hextets), where each quartet represents 16 bits.",
    "1 hex digit = 4 bits; 1 quartet (4 hex digits) = 16 bits; 8 quartets (32 hex digits) = 128 bits.",
    ["show ipv6 interface brief"]
  ),
  c22.s(
    "IPv6",
    "Easy",
    "In an IPv6 network, which protocol replaces IPv4's Address Resolution Protocol (ARP) for discovering the Layer 2 MAC address of a neighbor on the same link?",
    "Neighbor Discovery Protocol (NDP) using ICMPv6 messages",
    [
      ["Reverse Address Resolution Protocol (RARP) using UDP broadcast frames", "IPv6 eliminates broadcast frames entirely and does not use RARP or ARP."],
      ["OSPFv3 using Link-State Request (LSR) packets to 224.0.0.5", "OSPFv3 is an interior routing protocol that uses IPv6 multicast FF02::5; it does not resolve host Layer 2 MAC addresses for end stations."],
      ["DHCPv6 using Solicit and Advertise messages to FF02::1:2", "DHCPv6 assigns IPv6 addresses and DNS settings to hosts, whereas NDP handles Layer 2 neighbor MAC address resolution."]
    ],
    "IPv6 eliminates ARP and broadcast frames altogether. Instead, IPv6 uses the Neighbor Discovery Protocol (NDP), which is defined as a set of ICMPv6 messages (specifically Neighbor Solicitation and Neighbor Advertisement messages sent to solicited-node multicast addresses) to discover the Layer 2 MAC addresses of neighbors on the local link.",
    "IPv6 has NO ARP and NO broadcast! NDP (built on ICMPv6) replaces ARP.",
    ["show ipv6 neighbors"]
  ),
  c22.s(
    "IPv6",
    "Easy",
    "Which enterprise migration strategy runs both IPv4 and IPv6 simultaneously on all routers, switches, and end hosts so devices can communicate using either protocol during the transition?",
    "Dual stack",
    [
      ["NAT64 stateless translation", "NAT64 translates headers between IPv6-only and IPv4-only nodes rather than running both protocol stacks natively on all devices."],
      ["GRE IPv6-over-IPv4 tunneling", "Tunneling encapsulates IPv6 packets inside IPv4 headers across an IPv4-only transit network rather than running both stacks natively everywhere."],
      ["Classless Inter-Domain Routing (CIDR)", "CIDR and IPv4 NAT were short-term measures to slow IPv4 address exhaustion, not an IPv4/IPv6 coexistence method."]
    ],
    "Running dual stack is the primary migration strategy for adding IPv6 to an existing enterprise network. Every router interface and end host is configured with both an IPv4 address and an IPv6 address and forwards both IPv4 and IPv6 packets natively until IPv4 can eventually be retired.",
    "Dual stack = running IPv4 and IPv6 side by side on the same interfaces and hosts.",
    ["ipv6 unicast-routing", "show ipv6 interface brief"]
  ),
  c22.s(
    "IPv6",
    "Easy",
    "Which routing protocols were updated specifically to route IPv6 prefixes in a modern network?",
    "OSPFv3, EIGRP for IPv6, RIPng, and MP-BGP4",
    [
      ["OSPFv2, EIGRPv4, RIPv2, and IS-ISv4 for IPv4", "OSPFv2, RIPv2, and IGRP support only IPv4 addressing and cannot carry 128-bit IPv6 prefixes."],
      ["CDP, LLDP, STP, and VTPv3", "CDP, LLDP, STP, and VTP are Layer 2 discovery and switching protocols, not IPv6 routing protocols."],
      ["ICMPv6, NDP, SLAAC, and DAD", "ICMPv6, NDP, SLAAC, and DAD are local control and address-assignment mechanisms, not dynamic routing protocols that flood prefixes across routers."]
    ],
    "Because IPv6 increases the address size to 128 bits and changes packet headers, interior and exterior routing protocols required protocol updates to advertise IPv6 prefixes and next-hop addresses: OSPF version 3 (OSPFv3), EIGRP for IPv6, RIP next generation (RIPng), and Multiprotocol BGP-4 (MP-BGP4).",
    "Know the IPv6 routing protocol counterparts: OSPFv2 -> OSPFv3; RIPv2 -> RIPng; BGP-4 -> MP-BGP4.",
    ["show ipv6 protocols", "show ipv6 route"]
  ),
  c22.s(
    "IPv6",
    "Medium",
    "What is the shortest valid abbreviation of the IPv6 address `2001:0db8:0000:0000:0400:0000:0000:0050`?",
    "2001:db8::400:0:0:50",
    [
      ["2001:db8::400::50", "The double colon (`::`) can appear at most once in any abbreviated IPv6 address because multiple `::` symbols make expansion ambiguous."],
      ["2001:db8::4:0:0:5", "Only leading zeros inside a quartet may be dropped; removing trailing zeros changes `0400` (1024) into `4` and `0050` (80) into `5`."],
      ["2001:0db8:0:0:400::50", "While valid to use `::` for the second pair of zero quartets, leaving `0db8` unabbreviated fails to drop the leading zero in the second quartet."]
    ],
    "To abbreviate an IPv6 address: (1) remove leading zeros inside each quartet (`0db8` -> `db8`, `0400` -> `400`, `0050` -> `50`, `0000` -> `0`), while never removing trailing zeros; and (2) replace one contiguous run of two or more all-zero quartets with `::`. When two runs of all-zero quartets have the same length (two quartets each here), RFC 5952 compresses the first run (`2001:db8::400:0:0:50`).",
    "Two rules for IPv6 compression: 1) Drop LEADING zeros per quartet (never trailing zeros!), 2) Use `::` at most ONCE for consecutive all-zero quartets.",
    ["show ipv6 interface brief"]
  ),
  c22.s(
    "IPv6",
    "Medium",
    "What is the shortest valid abbreviation of the IPv6 address `fd00:0000:0000:0010:0000:0000:0000:0100`?",
    "fd00:0:0:10::100",
    [
      ["fd00::10:0:0:0:100", "When an address contains two separate runs of all-zero quartets of unequal length (2 quartets vs. 3 quartets), `::` should compress the longer 3-quartet run."],
      ["fd00::10::100", "Using `::` twice in the same IPv6 address is illegal because a parser cannot tell how many zero quartets belong to each `::`."],
      ["fd:0:0:10::1", "Dropping trailing zeros from `fd00` and `0100` corrupts the hexadecimal values of the first and eighth quartets."]
    ],
    "In `fd00:0000:0000:0010:0000:0000:0000:0100`, quartets 2–3 form a run of two all-zero quartets, while quartets 5–7 form a run of three all-zero quartets. To achieve the shortest representation, replace the longer three-quartet run with `::`, shorten the two-quartet run to `:0:0:`, and remove leading zeros from `0010` (`10`) and `0100` (`100`), producing `fd00:0:0:10::100`.",
    "Always apply `::` to the LONGEST contiguous string of all-zero quartets to get the shortest valid IPv6 address.",
    ["show ipv6 interface brief"]
  ),
  c22.s(
    "IPv6",
    "Medium",
    "When expanding the abbreviated IPv6 address `fe80::21a:bad:ffff:1` back into its complete 32-hex-digit (8-quartet) representation, what is the full unabbreviated address?",
    "fe80:0000:0000:0000:021a:0bad:ffff:0001",
    [
      ["fe80:0000:0000:021a:0bad:ffff:0001:0000", "That expansion contains only two zero quartets at `::` and appends an extra `0000` at the end, changing the eighth quartet."],
      ["fe80:0000:0000:0000:21a0:bad0:ffff:1000", "When restoring omitted digits inside a quartet, zeros must be prepended as leading zeros on the left (`021a`, `0bad`, `0001`), never appended on the right."],
      ["fe80:0000:0000:0000:0000:021a:0bad:ffff", "That expansion inserts four zero quartets and drops the final `:1` quartet completely."]
    ],
    "The abbreviated address `fe80::21a:bad:ffff:1` explicitly shows 5 quartets (`fe80`, `21a`, `bad`, `ffff`, and `1`). Since every IPv6 address has 8 quartets total, the `::` stands for 8 − 5 = 3 all-zero quartets (`0000:0000:0000`). Prepending leading zeros to each quartet with fewer than 4 digits gives `fe80:0000:0000:0000:021a:0bad:ffff:0001`.",
    "To expand `::`: count the visible quartets, subtract from 8, and insert that many `0000` quartets where `::` sits; then pad each quartet on the LEFT with zeros to 4 digits.",
    ["show ipv6 interface"]
  ),
  c22.s(
    "IPv6",
    "Medium",
    "A host is configured with the IPv6 address and prefix length `2001:db8:cafe:1200:5a3b:90ff:fe12:3456/64`. What is the abbreviated IPv6 prefix (subnet ID) for this host's subnet?",
    "2001:db8:cafe:1200::/64",
    [
      ["2001:db8:cafe::/64", "Zeroing out the fourth quartet (`1200`) changes bits 49–64, which are part of the `/64` subnet prefix."],
      ["2001:db8:cafe:12::/64", "Dropping the trailing zeros from `1200` changes the fourth quartet from `0x1200` to `0x0012`."],
      ["2001:db8:cafe:1200:5a3b::/64", "A `/64` prefix includes only the first 4 quartets (64 bits); the fifth quartet (`5a3b`) belongs to the 64-bit interface ID and must be zeroed."]
    ],
    "Because each quartet holds 16 bits, a `/64` prefix boundary falls cleanly after the fourth quartet (4 × 16 = 64 bits). To find the IPv6 prefix (subnet ID), keep the first 4 quartets intact (`2001:db8:cafe:1200`), set the remaining 4 quartets (bits 65–128) to zero, and compress the trailing four zero quartets as `::/64`.",
    "Quartet boundaries are multiples of 16: /16 = 1 quartet, /32 = 2 quartets, /48 = 3 quartets, /64 = 4 quartets, /80 = 5 quartets, /96 = 6 quartets.",
    ["show ipv6 route"]
  ),
  c22.s(
    "IPv6",
    "Medium",
    "An enterprise site is assigned the IPv6 address `2001:db8:1111:abcd:9876:5432:10fe:dcba/48`. What is the abbreviated `/48` prefix representing this block?",
    "2001:db8:1111::/48",
    [
      ["2001:db8:1111:abcd::/48", "Including the fourth quartet (`abcd`) keeps 64 bits instead of 48 bits; a `/48` prefix keeps only the first 3 quartets (3 × 16 = 48 bits)."],
      ["2001:db8::/48", "Keeping only the first 2 quartets preserves just 32 bits instead of the first 48 bits."],
      ["2001:db8:1111:a000::/48", "48 bits is an exact multiple of 16 (3 quartets), so all four hex digits of the fourth quartet (`abcd`) are zeroed out."]
    ],
    "A `/48` prefix length equals 48 / 16 = 3 full quartets (12 hex digits). Keeping the first three quartets (`2001:db8:1111`), setting quartets 4 through 8 to all zeros, and compressing the five trailing zero quartets with `::` yields `2001:db8:1111::/48`.",
    "/48 = keep the first 3 quartets, zero out the last 5 quartets (`::/48`).",
    ["show ipv6 route"]
  ),
  c22.s(
    "IPv6",
    "Hard",
    "A router interface is configured with the IPv6 address `2001:db8:abcd:5678:1234:5678:9abc:def0/56`. Because `/56` is a multiple of 4 bits (14 hex digits), what is the abbreviated IPv6 prefix (subnet ID) for this `/56` block?",
    "2001:db8:abcd:5600::/56",
    [
      ["2001:db8:abcd:56::/56", "Writing `:56::` in the fourth quartet means `0056` (because omitted digits inside a quartet are always leading zeros), whereas the first two hex digits must remain in the high-order positions (`5600`)."],
      ["2001:db8:abcd:5670::/56", "Keeping `5670` preserves 15 hex digits (15 × 4 = 60 bits, a `/60` prefix) instead of 14 hex digits (56 bits)."],
      ["2001:db8:abcd:5000::/56", "Keeping `5000` preserves only 13 hex digits (13 × 4 = 52 bits, a `/52` prefix) instead of 14 hex digits (56 bits)."]
    ],
    "Each hexadecimal digit represents 4 bits, so a `/56` prefix length corresponds to the first 56 / 4 = 14 hex digits. The first 3 quartets account for 12 hex digits (`2001:db8:abcd`), and the next 2 hex digits in the fourth quartet (`56`) remain unchanged while the remaining 2 hex digits in the fourth quartet (`78`) and all of quartets 5–8 become zeros. Because trailing zeros inside a quartet (`5600`) can never be omitted, the abbreviated prefix is `2001:db8:abcd:5600::/56`.",
    "For prefix lengths that are multiples of 4: Prefix_Length / 4 = number of hex digits to keep from the left; zero all remaining hex digits, and never drop trailing zeros in the boundary quartet!",
    ["show ipv6 route"]
  ),
  c22.s(
    "IPv6",
    "Hard",
    "A branch router receives the IPv6 address assignment `2001:db8:8000:1a2b:3c4d:5e6f:7000:1/60`. What is the abbreviated `/60` prefix for this subnet?",
    "2001:db8:8000:1a20::/60",
    [
      ["2001:db8:8000:1a2::/60", "Omitting the trailing zero turns the fourth quartet into `01a2` instead of `1a20`, shifting the bits 4 positions to the right."],
      ["2001:db8:8000:1a00::/60", "`1a00` keeps only 14 hex digits (56 bits, `/56`) instead of 15 hex digits (60 bits, `/60`)."],
      ["2001:db8:8000:1a2b::/60", "`1a2b` keeps all 16 hex digits of the first four quartets (64 bits, `/64`) without zeroing the last 4 bits of the fourth quartet."]
    ],
    "Dividing the `/60` prefix length by 4 bits per hex digit shows that the prefix consists of the first 60 / 4 = 15 hexadecimal digits. In `2001:0db8:8000:1a2b:...`, the first 15 hex digits are `2001:0db8:8000:1a2`. Setting the 16th hex digit (`b`) and quartets 5–8 to zero produces `2001:db8:8000:1a20::/60`.",
    "60 bits / 4 = 15 hex digits (3 full quartets + first 3 hex digits of quartet 4, followed by a 0 in quartet 4).",
    ["show ipv6 route"]
  ),
  c22.m(
    "IPv6",
    "Hard",
    "Which two IPv6 address strings are VALID abbreviated representations of `2001:0000:0000:00a0:0000:0000:0000:0001`?",
    [
      "2001:0:0:a0::1",
      "2001::a0:0:0:0:1"
    ],
    [
      ["2001::a0::1", "An IPv6 address can never contain more than one `::` double colon because its expansion would be ambiguous."],
      ["2001:0:0:a::1", "Dropping the trailing zero in `00a0` changes the fourth quartet from `0x00a0` (160) to `0x000a` (10)."],
      ["2001::00a0:0000:0000:1", "That string contains only 5 explicit quartets plus `::` (which would expand to 3 quartets), misplacing the `00a0` quartet into the fifth position instead of the fourth."]
    ],
    "The unabbreviated address `2001:0000:0000:00a0:0000:0000:0000:0001` has two separate runs of all-zero quartets (quartets 2–3 and quartets 5–7). While `2001:0:0:a0::1` is the shortest canonical form (compressing the 3-quartet run), `2001::a0:0:0:0:1` (compressing the 2-quartet run and reducing the 3-quartet run to `:0:0:0:`) is also a valid unambiguous representation of the exact same 128-bit address.",
    "Only one `::` is allowed, and trailing zeros in a quartet (`00a0` -> `a0`) must never be removed.",
    ["show ipv6 interface"]
  ),
  c22.d(
    "IPv6",
    "Hard",
    "Order the steps to expand a compressed IPv6 address (such as `2001:db8::50:1`) and find its `/64` subnet prefix.",
    [
      "Count the explicitly written quartets in the compressed address and subtract from 8 to find how many all-zero quartets `::` represents",
      "Replace `::` with the calculated number of `0000` quartets and pad each remaining quartet on the left with leading zeros to 4 hex digits",
      "Keep the first 4 quartets (64 bits) unchanged and replace the last 4 quartets (bits 65 to 128) with `0000`",
      "Re-apply IPv6 abbreviation rules (drop leading zeros and compress trailing `0000` quartets to `::`) and append `/64`"
    ],
    "Expanding first before masking avoids off-by-one quartet mistakes when `::` appears inside the prefix portion of an address (as in `2001:db8::50:1`, where `::` expands to four `0000` quartets across both the prefix and interface ID, resulting in the `/64` prefix `2001:db8::/64`).",
    "When `::` sits to the left of the prefix boundary, always expand `::` first so you know which quartets belong to the first 64 bits!",
    ["show ipv6 interface", "show ipv6 route"]
  ),
  c22.t(
    "IPv6",
    "Hard",
    "Match each IPv6 prefix length with the exact number of hexadecimal digits and quartets contained in the network prefix portion.",
    [
      ["/32 prefix length", "8 hexadecimal digits (exactly 2 full quartets)"],
      ["/48 prefix length", "12 hexadecimal digits (exactly 3 full quartets)"],
      ["/56 prefix length", "14 hexadecimal digits (3 full quartets plus the first 2 hex digits of quartet 4)"],
      ["/64 prefix length", "16 hexadecimal digits (exactly 4 full quartets)"]
    ],
    "Because 1 hex digit = 4 bits and 1 quartet = 16 bits, converting between prefix lengths and hex digits is simple division: `/32` = 8 hex digits (2 quartets, common ISP allocation), `/48` = 12 hex digits (3 quartets, typical enterprise site global routing prefix), `/56` = 14 hex digits (small site allocation), and `/64` = 16 hex digits (4 quartets, standard LAN subnet prefix).",
    "Divide prefix length by 4 to get hex digits; divide by 16 to get full quartets.",
    ["show ipv6 route"]
  )
];

const c23 = mk("Network Fundamentals", 20, "v1c23");
const q23 = [
  c23.s(
    "IPv6",
    "Easy",
    "Which IPv6 address category is the functional equivalent of IPv4 RFC 1918 private addresses—usable inside an organization without public registration and not routable on the public Internet?",
    "Unique Local Address (ULA)",
    [
      ["Global Unicast Address (GUA)", "Global Unicast Addresses are public, globally unique IPv6 addresses assigned through IANA, RIRs, and ISPs for Internet routing."],
      ["Link-Local Address (LLA)", "Link-Local Addresses (`FE80::/10`) are never forwarded by routers beyond a single Layer 2 subnet, whereas ULAs can be routed across internal enterprise subnets."],
      ["Solicited-Node Multicast Address", "Solicited-Node Multicast Addresses (`FF02::1:FF00:0/104`) are link-local multicast addresses used by NDP, not unicast host addresses."]
    ],
    "IPv6 Unique Local Addresses (ULAs, defined in RFC 4193) serve the same role as IPv4 private addresses (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`). Organizations generate ULAs locally without registering with an RIR or ISP, route them across internal enterprise sites and subnets, and do not route them on the public Internet.",
    "GUA = Public IPv4 equivalent; ULA (`FD00::/8`) = Private RFC 1918 IPv4 equivalent; Link-Local (`FE80::/10`) = single-link only.",
    ["show ipv6 interface brief"]
  ),
  c23.s(
    "IPv6",
    "Easy",
    "Although RFC 4193 reserves the `/7` block `FC00::/7` for Unique Local Addresses, why must locally generated enterprise ULA prefixes always begin with the two hexadecimal digits `FD` (`FD00::/8`)?",
    "The 8th bit (the L bit) must be set to binary 1 to indicate that the Global ID was locally assigned.",
    [
      ["The prefix `FC00::/8` is reserved exclusively for IPv6 multicast traffic inside a single enterprise site.", "IPv6 multicast addresses always begin with `FF` (`FF00::/8`), never `FC`."],
      ["Routers automatically drop any packet beginning with `FC` as an invalid loopback or unspecified address.", "`FC00::/8` is reserved by IETF for future central assignment definitions, not for loopback (`::1`) or unspecified (`::`)."],
      ["The 8th bit must be set to 1 to match the EUI-64 universal/local bit inversion rule in the first quartet.", "The EUI-64 7th-bit inversion applies only to the 64-bit Interface ID (starting at bit 65), never to the first quartet of an IPv6 prefix."]
    ],
    "The `FC00::/7` range matches first-octet binary values `1111 110x` (`0xFC` and `0xFD`). RFC 4193 specifies that the 8th bit must be set to `1` for locally generated pseudo-random Global IDs, which makes the first byte `1111 1101` (`0xFD`). Consequently, all locally generated ULAs used in enterprise networks today start with `FD` (`FD00::/8`).",
    "In practice, every locally created IPv6 Unique Local Address (ULA) starts with `FD` (followed by a 40-bit / 10-hex-digit random Global ID).",
    ["show ipv6 interface brief"]
  ),
  c23.s(
    "IPv6",
    "Easy",
    "In standard IPv6 subnetting design for LANs using Stateless Address Autoconfiguration (SLAAC) or EUI-64, what prefix length is assigned to each individual subnet?",
    "/64",
    [
      ["/48", "A `/48` prefix is typically the Global Routing Prefix assigned to an entire enterprise or site, which is then subdivided into `/64` subnets."],
      ["/128", "A `/128` prefix length identifies a single individual host address (such as a loopback or local route), not a multi-host LAN subnet."],
      ["/96", "A `/96` leaves only 32 bits for the Interface ID, which breaks standard SLAAC and EUI-64 that require a 64-bit Interface ID."]
    ],
    "Standard IPv6 subnetting divides every unicast address into a 64-bit network prefix (`/64`, combining the Global Routing Prefix and Subnet ID field) and a 64-bit Interface ID (host portion). Using `/64` on every subnet is required for EUI-64 and SLAAC and leaves 2^64 possible interface IDs per subnet.",
    "Standard IPv6 LAN subnet = `/64` (64 bits for prefix = Global Routing Prefix + Subnet ID; 64 bits for Interface ID).",
    ["ipv6 address", "show ipv6 interface"]
  ),
  c23.s(
    "IPv6",
    "Easy",
    "Originally, IANA reserved which `/3` IPv6 address block for Global Unicast Addresses (matching first hex digits `2` or `3`)?",
    "2000::/3",
    [
      ["FE80::/10", "`FE80::/10` is the reserved range for IPv6 Link-Local unicast addresses, not Global Unicast Addresses."],
      ["FD00::/8", "`FD00::/8` is the range used for locally assigned IPv6 Unique Local Addresses (ULAs)."],
      ["FF00::/8", "`FF00::/8` is the reserved range for all IPv6 multicast addresses."]
    ],
    "IANA originally carved out `2000::/3` (binary `001x`, meaning addresses whose first hex digit is `2` or `3`, such as `2001:...` or `2600:...`) for Global Unicast Addresses, and later expanded GUA eligibility to all unreserved unicast space while continuing to allocate primarily from `2000::/3`.",
    "First hex digit `2` or `3` (`2000::/3`) = classic Global Unicast Address (GUA).",
    ["show ipv6 interface brief"]
  ),
  c23.s(
    "IPv6",
    "Medium",
    "An ISP assigns a company the Global Routing Prefix `2001:db8:acad::/48`. If the network architect uses standard `/64` prefixes for all subnets, how many bits are in the Subnet ID field and how many `/64` subnets can the company create?",
    "16 bits (1 full quartet), allowing 65,536 (2^16) subnets",
    [
      ["8 bits (2 hex digits), allowing 256 (2^8) subnets", "An 8-bit subnet field would occur only if the company received a `/56` global routing prefix (64 − 56 = 8 bits = 256 subnets)."],
      ["4 bits (1 hex digit), allowing 16 (2^4) subnets", "A 4-bit subnet field would occur only if the company received a `/60` global routing prefix (64 − 60 = 4 bits = 16 subnets)."],
      ["32 bits (2 full quartets), allowing 4,294,967,296 (2^32) subnets", "A 32-bit subnet field would require the company to be assigned an ISP-scale `/32` block rather than a `/48` block."]
    ],
    "In the three-part Global Unicast Address structure (`P` bits for Global Routing Prefix + `S` bits for Subnet ID + `64` bits for Interface ID = 128 bits), a `/48` Global Routing Prefix leaves `64 − 48 = 16` bits (the entire fourth quartet) for the Subnet ID field. With 16 subnet bits, the company can number `2^16 = 65,536` distinct `/64` subnets (`0000` through `ffff` in the fourth quartet).",
    "With a `/48` Global Routing Prefix and `/64` subnets, the entire 4th quartet (16 bits) is the Subnet ID = 65,536 subnets.",
    ["show ipv6 route"]
  ),
  c23.s(
    "IPv6",
    "Medium",
    "A small branch office is assigned a `/56` Global Routing Prefix (`2001:db8:1234:ab00::/56`) by its ISP and uses standard `/64` prefixes for all LANs. How many `/64` subnets can be created from this `/56` block?",
    "256 subnets (using the 8-bit Subnet ID field in the last two hex digits of the fourth quartet)",
    [
      ["65,536 subnets (using all 16 bits of the fourth quartet)", "65,536 `/64` subnets require a `/48` Global Routing Prefix; a `/56` leaves only 64 − 56 = 8 bits for subnetting."],
      ["16 subnets (using the last single hex digit of the fourth quartet)", "16 `/64` subnets correspond to a `/60` Global Routing Prefix (64 − 60 = 4 bits = 16 subnets)."],
      ["8 subnets (because 64 minus 56 equals 8)", "8 is the number of bits (`S = 8`) in the Subnet ID field; the number of resulting subnets is `2^S = 2^8 = 256`."]
    ],
    "When an organization receives a `/56` Global Routing Prefix and subnets to `/64`, the Subnet ID field is `64 − 56 = 8` bits long (the last 2 hex digits of the fourth quartet, from `00` to `ff`). That 8-bit Subnet ID supports `2^8 = 256` `/64` subnets (`2001:db8:1234:ab00::/64` through `2001:db8:1234:abff::/64`).",
    "Number of `/64` subnets = `2^(64 - Global_Routing_Prefix_Length)`. For `/56`, `2^(64 - 56) = 2^8 = 256`.",
    ["show ipv6 route"]
  ),
  c23.s(
    "IPv6",
    "Medium",
    "Why does RFC 4193 require organizations to generate a pseudo-random 40-bit (10-hex-digit) Global ID when creating a Unique Local Address (`FDxx:xxxx:xxxx::/48`) rather than simply using `FD00:0000:0000::/48` or `FD00:0001:0001::/48`?",
    "To make address prefix collisions statistically improbable if two companies merge or interconnect their private networks later",
    [
      ["To encrypt the IPv6 source and destination addresses inside the 40-byte IPv6 header using IPsec", "The 40-bit Global ID in a ULA is a plaintext routing prefix, not an encryption key or IPsec security parameter."],
      ["To allow ISP border routers on the public Internet to aggregate ULA routes into a single BGP summary", "Unique Local Addresses (`FD00::/8`) are private addresses and are never advertised or routed across the public Internet."],
      ["To embed the router's 48-bit burned-in Ethernet MAC address directly inside the first three quartets", "Embedding a MAC address (with `FFFE` and bit inversion) is how EUI-64 builds the 64-bit Interface ID in quartets 5–8, not the ULA Global ID."]
    ],
    "In IPv4, nearly every company chooses easy-to-remember private prefixes like `10.0.0.0/8` or `192.168.1.0/24`, causing painful overlapping-subnet conflicts whenever two companies merge or connect via VPN. By requiring a pseudo-random 40-bit Global ID right after `FD` (producing a `/48` ULA prefix such as `FD8A:2B9C:4E11::/48`), IPv6 ensures that two merging companies almost certainly have distinct internal `/48` prefixes.",
    "Random 40-bit Global ID in ULA (`FD` + 10 random hex digits = `/48`) prevents overlapping private address space during company mergers!",
    ["show ipv6 interface brief"]
  ),
  c23.s(
    "IPv6",
    "Medium",
    "Within the `/64` subnet `2001:db8:10:20::/64`, what is the special significance of the exact address `2001:db8:10:20:0000:0000:0000:0000` (`2001:db8:10:20::`)?",
    "It is the reserved Subnet Router Anycast address (all-zero Interface ID) and should not be assigned as a regular unicast host address.",
    [
      ["It is the IPv6 subnet broadcast address used to send frames to all hosts on the `2001:db8:10:20::/64` link.", "IPv6 completely eliminates broadcast addresses; `FF02::1` is the link-local all-nodes multicast address instead."],
      ["It is the solicited-node multicast address used by Neighbor Discovery Protocol for Duplicate Address Detection.", "Solicited-node multicast addresses always begin with `FF02::1:FF` followed by the last 6 hex digits of a unicast address."],
      ["It is the unspecified IPv6 address used by DHCPv6 clients before they receive a valid lease.", "The unspecified IPv6 address is `::/128` (all 128 bits set to zero), not a `/64` subnet prefix with a zero interface ID."]
    ],
    "Every `/64` IPv6 subnet reserves the address whose 64-bit Interface ID is all binary zeros (so the address looks identical to the subnet prefix itself, e.g., `2001:db8:10:20::`) as the **Subnet Router Anycast** address. Packets sent to that address are delivered to the nearest router attached to that subnet, so engineers avoid assigning the all-zeros Interface ID (`::0`) to hosts.",
    "Inside any `/64` subnet, the address with all 0s in the 64-bit Interface ID is reserved as the Subnet Router Anycast address.",
    ["show ipv6 interface"]
  ),
  c23.s(
    "IPv6",
    "Medium",
    "An enterprise is assigned the ULA global prefix `fd12:3456:789a::/48` and uses a 16-bit Subnet ID field to create `/64` subnets. Which address below is a valid host unicast address on subnet `000f`?",
    "fd12:3456:789a:f::1/64",
    [
      ["fd12:3456:789a:f000::1/64", "Placing `f000` in the fourth quartet selects subnet `0xf000` (61,440) instead of subnet `0x000f` (15) because trailing zeros cannot be omitted."],
      ["fc12:3456:789a:f::1/64", "Changing `fd12` to `fc12` clears the 8th bit (the L bit) of the ULA prefix and alters the assigned `/48` block."],
      ["fd12:3456:789a:f::/64", "`fd12:3456:789a:f::` has all zeros in the 64-bit Interface ID, which is the reserved Subnet Router Anycast address rather than host `::1`."]
    ],
    "With the `/48` ULA prefix `fd12:3456:789a::/48`, the fourth quartet is the 16-bit Subnet ID. Subnet `000f` abbreviates to `f` (dropping the three leading zeros), and a host with Interface ID `0000:0000:0000:0001` compresses the three zero quartets in quartets 5–7 with `::`, resulting in `fd12:3456:789a:f::1/64`.",
    "In quartet 4, subnet `000f` abbreviates to `:f:`, whereas `:f000:` is subnet 61,440!",
    ["ipv6 address", "show ipv6 interface brief"]
  ),
  c23.s(
    "IPv6",
    "Hard",
    "Examine the Global Unicast Address allocation hierarchy from IANA down to an end user's LAN subnet. Which sequence represents a typical prefix-length delegation chain from largest block to smallest?",
    "IANA assigns `/12` to an RIR -> RIR assigns `/32` to an ISP -> ISP assigns `/48` to a site -> Site assigns `/64` per subnet",
    [
      ["IANA assigns `/48` to an RIR -> RIR assigns `/64` to an ISP -> ISP assigns `/96` to a customer -> Customer assigns `/128` to each VLAN", "A `/128` is a single host address and `/48` is a single enterprise site allocation, not an entire Regional Internet Registry block."],
      ["IANA assigns `/8` to an enterprise -> Enterprise assigns `/24` to an ISP -> ISP assigns `/48` to a branch -> Branch assigns `/64` to each host", "Enterprises receive their Global Routing Prefix from an ISP or RIR (typically `/48`), not a `/8` directly from IANA."],
      ["IANA assigns `/64` to an RIR -> RIR assigns `/48` to an ISP -> ISP assigns `/32` to a customer -> Customer assigns `/16` to each VLAN", "Smaller prefix numbers (`/16`, `/32`) represent LARGER address blocks because fewer prefix bits are fixed; this option reverses the hierarchy."]
    ],
    "Just as in IPv4 CIDR, a smaller prefix length in IPv6 means fewer fixed network bits and a larger block of addresses. Typically, IANA delegates a large block (such as `/12` or `/16`) to a Regional Internet Registry (ARIN, RIPE, APNIC), the RIR delegates a `/32` (or similar) to an ISP, the ISP assigns a `/48` Global Routing Prefix to a business customer, and the customer subnets that `/48` into up to 65,536 `/64` LAN subnets.",
    "Smaller `/prefix` number = LARGER block: RIR (~`/16`) -> ISP (`~ /32`) -> Company (`/48`) -> Subnet (`/64`) -> Host (`/128`).",
    ["show ipv6 route"]
  ),
  c23.m(
    "IPv6",
    "Hard",
    "An enterprise architect is comparing IPv6 Global Unicast Addresses (GUAs) and IPv6 Unique Local Addresses (ULAs). Which two statements are true regarding how both address types are structured and used?",
    [
      "Both GUAs (with a `/48` global routing prefix) and ULAs use a 48-bit site prefix plus a 16-bit Subnet ID field to create `/64` subnets.",
      "Both GUAs and ULAs can be routed across multiple internal routers and VLANs inside an enterprise using OSPFv3 or static routes."
    ],
    [
      ["Both GUAs and ULAs are globally routable across the public Internet without requiring Network Address Translation.", "Only Global Unicast Addresses (GUAs) are routable on the public Internet; Unique Local Addresses (`FD00::/8`) are private and filtered by ISPs."],
      ["Both GUAs and ULAs require registration and an annual fee with a Regional Internet Registry such as ARIN or RIPE.", "ULAs are self-generated by the enterprise using a pseudo-random 40-bit Global ID and never require registration with an RIR or ISP."],
      ["Both GUAs and ULAs are restricted to a single Layer 2 broadcast domain and are dropped by any router interface.", "Only Link-Local Addresses (`FE80::/10`) are restricted to a single Layer 2 link; both GUAs and ULAs are routable across internal routers."]
    ],
    "GUAs (assigned a `/48` by an ISP) and ULAs (`FD` + 40-bit random Global ID = `/48`) share the exact same 48-bit prefix + 16-bit Subnet ID + 64-bit Interface ID subnetting structure and are both fully routable across internal enterprise routers. They differ in how the first 48 bits are obtained (ISP-assigned public prefix vs. locally generated `FDxx:xxxx:xxxx::/48`) and whether public Internet routers forward them.",
    "Both `/48` GUAs and `/48` ULAs give you a 16-bit Subnet ID (quartet 4) and are routable inside your enterprise; only GUAs route on the Internet.",
    ["show ipv6 route", "show ipv6 interface brief"]
  ),
  c23.t(
    "IPv6",
    "Hard",
    "Match each component of a locally assigned IPv6 Unique Local Address (ULA) `/64` subnet with its exact bit length and purpose.",
    [
      ["First 8 bits (`FD`)", "Fixed `11111100` (`FC00::/7`) prefix with the 8th bit (`L` bit) set to 1 for local assignment"],
      ["Bits 9 to 48 (40 bits / 10 hex digits)", "Pseudo-randomly generated Global ID that uniquely identifies the organization or site"],
      ["Bits 49 to 64 (16 bits / 4 hex digits)", "Subnet ID field used by the network engineer to number up to 65,536 internal subnets"],
      ["Bits 65 to 128 (64 bits / 16 hex digits)", "Interface ID field identifying the unique host interface on the `/64` subnet"]
    ],
    "A Unique Local Address (ULA) mirrors the `/48` GUA structure: the first 8 bits are `FD` (`1111 1101`), followed by a 40-bit (10-hex-digit) pseudo-random Global ID, which together form a `/48` site prefix. The fourth quartet (bits 49–64, 16 bits) is the Subnet ID field, and the final 4 quartets (bits 65–128, 64 bits) form the Interface ID.",
    "ULA bit breakdown: 8 bits (`FD`) + 40 bits (Random Global ID) + 16 bits (Subnet ID) + 64 bits (Interface ID) = 128 bits.",
    ["show ipv6 interface"]
  ),
  c23.s(
    "IPv6",
    "Hard",
    "A company receives the Global Routing Prefix `2001:db8:5000::/52` for a regional office and wants to create standard `/64` subnets. What is the valid range of abbreviated `/64` subnet prefixes available in this `/52` allocation?",
    "2001:db8:5000::/64 through 2001:db8:5000:fff::/64 (4,096 subnets)",
    [
      ["2001:db8:5000::/64 through 2001:db8:5000:ffff::/64 (65,536 subnets)", "In a `/52` prefix, the first 52 / 4 = 13 hex digits (`2001:0db8:5000:0`) are fixed by the ISP, so the first hex digit of the fourth quartet must remain `0`."],
      ["2001:db8:5000::/64 through 2001:db8:5000:ff::/64 (256 subnets)", "`0000` through `00ff` uses only the last 2 hex digits (8 bits) of the fourth quartet, which corresponds to a `/56` allocation rather than a `/52`."],
      ["2001:db8:5000::/64 through 2001:db8:5fff:ffff::/64 (268,435,456 subnets)", "Modifying the third quartet (`5000` to `5fff`) alters bits 37–48, which would require a `/36` ISP allocation."]
    ],
    "A `/52` Global Routing Prefix fixes the first 52 bits (52 / 4 = 13 hex digits: `2001:0db8:5000:0`), leaving `64 − 52 = 12` bits (the last 3 hex digits of the fourth quartet) for the Subnet ID field. Those 3 hex digits range from `000` to `fff`, providing `2^12 = 4,096` `/64` subnets from `2001:db8:5000:0000::/64` (`2001:db8:5000::/64`) through `2001:db8:5000:0fff::/64` (`2001:db8:5000:fff::/64`).",
    "With `/52` -> `/64`, you have `64 - 52 = 12` subnet bits (3 hex digits in quartet 4: `0000`..`0fff`, abbreviated `0`..`fff`) = 4,096 subnets.",
    ["show ipv6 route"]
  ),
  c23.d(
    "IPv6",
    "Hard",
    "Order the following IPv6 address blocks from the MOST specific (smallest number of addresses) to the LEAST specific (largest number of addresses).",
    [
      "Single host interface route (/128)",
      "Standard LAN subnet prefix (/64)",
      "Small branch site prefix (/56)",
      "Enterprise Global Routing Prefix (/48)",
      "ISP regional allocation block (/32)"
    ],
    "In prefix notation, a larger prefix length (`/128`) fixes more bits and represents fewer addresses (1 single address for `/128`), whereas a smaller prefix length (`/32`) fixes fewer bits and represents a much larger block of subnets (`2^32` `/64` subnets in a `/32`).",
    "More prefix bits (`/128`) = MORE specific (smaller block); fewer prefix bits (`/32`) = LESS specific (larger block).",
    ["show ipv6 route"]
  )
];

const c24 = mk("Network Fundamentals", 20, "v1c24");
const q24 = [
  c24.s(
    "IPv6",
    "Easy",
    "Which global configuration command must be enabled on a Cisco IOS router so it routes IPv6 packets between interfaces and sends ICMPv6 Router Advertisement messages?",
    "ipv6 unicast-routing",
    [
      ["ip routing", "`ip routing` is enabled by default for IPv4 forwarding, but it does not enable IPv6 packet forwarding on a Cisco IOS router."],
      ["ipv6 enable", "`ipv6 enable` is an interface subcommand that generates a link-local IPv6 address on a single port, not the global routing switch."],
      ["ipv6 unicast-forwarding enable", "Starting an OSPFv3 process without `ipv6 unicast-routing` fails or produces a console warning because IPv6 forwarding is still disabled globally."]
    ],
    "By default, Cisco IOS routers have IPv4 routing (`ip routing`) enabled, but IPv6 packet forwarding is disabled. Entering `ipv6 unicast-routing` in global configuration mode enables the router to forward IPv6 unicast packets between subnets, populate the IPv6 routing table, and transmit ICMPv6 Router Advertisements.",
    "Always check for `ipv6 unicast-routing` in global config—without it, a Cisco router acts only as an IPv6 host, not an IPv6 router!",
    ["ipv6 unicast-routing", "show ipv6 interface"]
  ),
  c24.s(
    "IPv6",
    "Easy",
    "Which reserved IPv6 prefix defines Link-Local Addresses, and what are the first four hexadecimal quartets of every Link-Local Address used on a Cisco router?",
    "Prefix FE80::/10, with the first four quartets always equal to FE80:0000:0000:0000",
    [
      ["Prefix FD00::/8, with the first four quartets always equal to FD00:0000:0000:0000", "`FD00::/8` defines Unique Local Addresses (ULAs) with a 40-bit random Global ID, not Link-Local Addresses."],
      ["Prefix FF02::/16, with the first four quartets always equal to FF02:0000:0000:0000", "`FF02::/16` defines link-local multicast addresses, whereas `FE80::/10` defines link-local unicast addresses."],
      ["Prefix 2000::/3, with the first four quartets always equal to 2001:0DB8:0000:0000", "`2000::/3` is the Global Unicast Address space, and `2001:DB8::/32` is reserved solely for documentation examples."]
    ],
    "RFC 4291 reserves `FE80::/10` (first 10 bits `1111 1110 10`) for Link-Local unicast addresses and requires the subsequent 54 bits (bits 11 through 64) to be set to binary 0. As a result, every valid Link-Local Address begins with `FE80:0000:0000:0000` (abbreviated `FE80::`) followed by a 64-bit Interface ID.",
    "Link-Local = `FE80::/10` on paper, and ALWAYS `FE80:0:0:0:...` (`FE80::/64`) in actual addresses!",
    ["show ipv6 interface brief", "ipv6 enable"]
  ),
  c24.s(
    "IPv6",
    "Easy",
    "Which two IPv6 special addresses represent the unspecified address (used as a source address during DAD/DHCPv6 initialization) and the loopback address, respectively?",
    "Unspecified address is ::/128, and loopback address is ::1/128.",
    [
      ["Unspecified address is 0.0.0.0/0, and loopback address is ::127.0.0.1/128.", "`0.0.0.0` and `127.0.0.1` are IPv4 addresses; IPv6 uses `::` for unspecified and `::1` for loopback."],
      ["Unspecified address is FE80::/10, and loopback address is FF01::1/128.", "`FE80::/10` is the link-local unicast block and `FF01::1` is an interface-local multicast address."],
      ["Unspecified address is ::1/128, and loopback address is ::/0.", "This reverses the two addresses and confuses `/128` with the default route prefix length `/0` (`::/0`)."]
    ],
    "In IPv6, the all-zeros address `0:0:0:0:0:0:0:0` (abbreviated `::` or `::/128`) is the unspecified address, used as the source IPv6 address by a node before it has verified its own address via Duplicate Address Detection (DAD) or DHCPv6. The address `0:0:0:0:0:0:0:1` (abbreviated `::1/128`) is the IPv6 loopback address, equivalent to IPv4's `127.0.0.1`.",
    "`::` (`/128`) = Unspecified address (like 0.0.0.0); `::1` (`/128`) = Loopback address (like 127.0.0.1); `::/0` = Default route.",
    ["show ipv6 interface"]
  ),
  c24.s(
    "IPv6",
    "Easy",
    "Which interface subcommand dynamically assigns a Global Unicast Address to a Cisco router interface using Stateless Address Autoconfiguration (SLAAC) based on ICMPv6 Router Advertisements received on that link?",
    "ipv6 address autoconfig",
    [
      ["ipv6 address dhcp", "`ipv6 address dhcp` tells the interface to request its IPv6 address from a stateful DHCPv6 server rather than using SLAAC."],
      ["ipv6 enable", "`ipv6 enable` creates only a Link-Local Address (`FE80::...`) and does not configure the interface to generate a GUA via SLAAC."],
      ["ipv6 address dhcp-slaac", "`eui-64` is a keyword appended after a manually typed `/64` prefix (`ipv6 address <prefix>/64 eui-64`), not a standalone SLAAC command."]
    ],
    "Entering `ipv6 address autoconfig` under an interface instructs the Cisco IOS router to listen for ICMPv6 Router Advertisement (RA) messages on that link, learn the advertised `/64` prefix, and automatically form a Global Unicast Address using SLAAC (in addition to its automatic Link-Local Address).",
    "Distinguish dynamic router interface commands: `ipv6 address autoconfig` = SLAAC (via RAs); `ipv6 address dhcp` = stateful DHCPv6 client.",
    ["ipv6 address autoconfig", "ipv6 address dhcp", "show ipv6 interface"]
  ),
  c24.s(
    "IPv6",
    "Medium",
    "Router R1's GigabitEthernet0/0 interface has the burned-in MAC address `001a.2b3c.4d5e` and is configured with `ipv6 address 2001:db8:1:1::/64 eui-64`. What Global Unicast Address does R1 assign to Gi0/0?",
    "2001:db8:1:1:21a:2bff:fe3c:4d5e",
    [
      ["2001:db8:1:1:1a:2bff:fe3c:4d5e", "That address forgot to invert the 7th bit (the universal/local bit) of the first MAC byte from `00` (`0000 0000`) to `02` (`0000 0010`)."],
      ["2001:db8:1:1:21a:2b3c:fffe:4d5e", "`FFFE` must be inserted squarely in the middle between the first 3 bytes (`001a2b`) and the last 3 bytes (`3c4d5e`), not between bytes 4 and 5."],
      ["2001:db8:1:1:201a:2bff:fe3c:4d5e", "Inverting the 7th bit from the left in `00` (`0000 0000`) changes the second hex digit to `2` (`021a`, abbreviated `21a`), not the first hex digit (`201a`)."]
    ],
    "To compute the modified EUI-64 Interface ID from MAC `001a.2b3c.4d5e`: (1) split the 6-byte MAC into two 3-byte halves (`001a2b` and `3c4d5e`), (2) insert `fffe` in the middle (`001a:2bff:fe3c:4d5e`), and (3) invert the 7th bit from the left in the first byte (`00` = `0000 0000` -> `0000 0010` = `02`), producing `021a:2bff:fe3c:4d5e`. Dropping the leading zero in `021a` yields `2001:db8:1:1:21a:2bff:fe3c:4d5e`.",
    "EUI-64 3 steps: 1) Split MAC in half (3 bytes | 3 bytes), 2) Insert `FFFE` in the middle, 3) Flip the 7th bit (add/subtract 2 in the 2nd hex digit of the first quartet)!",
    ["ipv6 address eui-64", "show ipv6 interface"]
  ),
  c24.s(
    "IPv6",
    "Medium",
    "An interface has the MAC address `06c0.ffee.1234` and is configured with `ipv6 enable`. What automatic Link-Local Address is generated on this interface?",
    "FE80::4c0:ffee:feee:1234",
    [
      ["FE80::6c0:ffee:feee:1234", "In `06` (`0000 0110`), the 7th bit is already `1`, so EUI-64 must flip it to `0` (`0000 0100` = `04`), changing `06c0` into `04c0` (`4c0`)."],
      ["FE80::8c0:ffee:feee:1234", "Flipping the 7th bit of `06` (`0000 0110`) clears the `2` bit (`6 - 2 = 4`) rather than adding 2 (`6 + 2 = 8`)."],
      ["FE80::4c0:ffff:feee:1234", "Splitting `06c0.ffee.1234` into two 3-byte halves gives `06c0ff` and `ee1234`; inserting `fffe` between them produces `04c0:ffee:feee:1234`."]
    ],
    "Splitting MAC `06c0.ffee.1234` into two 3-byte halves gives `06c0ff` and `ee1234`. Inserting `fffe` in the middle produces `06c0:ffee:feee:1234`. Next, write the first byte `06` in binary: `0000 0110`. The 7th bit is `1`; flipping it to `0` produces `0000 0100` (`04`). Prepending `FE80::` and dropping the leading zero in `04c0` gives `FE80::4c0:ffee:feee:1234`.",
    "Watch out when the 2nd hex digit of the MAC already has the '2' bit set (2, 3, 6, 7, A, B, E, F): flipping the 7th bit SUBTRACTS 2 (e.g., 6 -> 4, 2 -> 0, A -> 8, E -> C)!",
    ["ipv6 enable", "show ipv6 interface"]
  ),
  c24.s(
    "IPv6",
    "Medium",
    "A router interface is configured with the single unicast address `2001:db8:10:1::abcd:5678/64`. Which Solicited-Node Multicast Address does the router automatically join for this unicast address?",
    "FF02::1:FFCD:5678",
    [
      ["FF02::1:FF00:5678", "The Solicited-Node Multicast Address appends the last 24 bits (last 6 hex digits: `CD:5678`), not just the last 16 bits (`5678`)."],
      ["FF02::1:ABCD:5678", "Solicited-Node Multicast Addresses always use the fixed 104-bit prefix `FF02::1:FF00:0/104`, so `FF` must precede the last 6 hex digits (`FFCD:5678`)."],
      ["FF02::2:FFCD:5678", "The 7th quartet of a Solicited-Node Multicast Address is always `0001` (`:1:`), never `:2:`."]
    ],
    "For every unicast (and anycast) IPv6 address on an interface, the device automatically joins a corresponding Solicited-Node Multicast Address used by NDP for neighbor MAC discovery and Duplicate Address Detection (DAD). The address is formed by taking the fixed 104-bit prefix `FF02::1:FF00:0/104` and replacing the last 24 bits (6 hex digits) with the last 6 hex digits of the unicast address (`cd:5678`), yielding `FF02::1:FFCD:5678`.",
    "Solicited-Node Multicast = `FF02::1:FF` + last 6 hex digits of the unicast/anycast IPv6 address.",
    ["show ipv6 interface"]
  ),
  c24.s(
    "IPv6",
    "Medium",
    "An engineer configures a static Link-Local Address `FE80::1` and a GUA `2001:db8:1:1::1/64` on interface GigabitEthernet0/0. Which pair of interface subcommands is required?",
    "`ipv6 address FE80::1 link-local` and `ipv6 address 2001:db8:1:1::1/64`",
    [
      ["`ipv6 address FE80::1/64` and `ipv6 address 2001:db8:1:1::1/64`", "Configuring a static Link-Local Address in Cisco IOS requires the `link-local` keyword without a `/prefix-length` parameter."],
      ["`ipv6 link-local FE80::1` and `ipv6 address 2001:db8:1:1::1 255.255.255.0`", "Cisco IOS does not have an `ipv6 link-local` command and never uses dotted-decimal subnet masks for IPv6 addresses."],
      ["`ipv6 enable FE80::1` and `ipv6 address 2001:db8:1:1::1/64 anycast`", "`ipv6 enable` takes no address argument, and adding `anycast` marks the address as an anycast address rather than a standard router GUA."]
    ],
    "When manually overriding the EUI-64 Link-Local Address on a Cisco IOS interface, you use `ipv6 address <fe80-address> link-local` (with no `/64` prefix length). When configuring a static Global Unicast or Unique Local Address, you use `ipv6 address <address>/<prefix-length>`.",
    "Static Link-Local syntax: `ipv6 address FE80::1 link-local` (NO `/64`, MUST have `link-local` keyword).",
    ["ipv6 address link-local", "ipv6 address", "show ipv6 interface brief"]
  ),
  c24.s(
    "IPv6",
    "Medium",
    "In an IPv6 multicast address `FF0s:...`, what do the fourth hexadecimal digit `2` (`FF02::`) and `8` (`FF08::`) indicate about the packet's forwarding scope?",
    "`FF02::` is link-local scope (never forwarded off the local subnet), and `FF08::` is organization-local scope.",
    [
      ["`FF02::` is global Internet scope, and `FF08::` is interface-local loopback scope.", "Interface-local scope is `FF01::` and global scope is `FF0E::`; `FF02::` is strictly link-local."],
      ["`FF02::` is reserved for OSPFv2 routers, and `FF08::` is reserved for EIGRPv6 routers.", "The fourth hex digit represents multicast scope, whereas the trailing digits (`::5`, `::6`, `::A`) identify the specific protocol group."],
      ["`FF02::` indicates a permanent well-known multicast group, and `FF08::` indicates a transient multicast group.", "The third hex digit (`0` or `1` in `FFfl:...`) indicates flags such as permanent (`0`) vs. transient (`1`), whereas the fourth hex digit specifies scope."]
    ],
    "In an IPv6 multicast address (`FF00::/8`), the fourth hexadecimal digit defines the administrative scope over which routers may forward the multicast packet: `1` (`FF01::`) = interface-local, `2` (`FF02::`) = link-local, `5` (`FF05::`) = site-local, `8` (`FF08::`) = organization-local, and `E` (`FF0E::`) = global scope.",
    "Multicast scopes (4th hex digit): `FF01` = Interface-local, `FF02` = Link-local, `FF05` = Site-local, `FF08` = Org-local, `FF0E` = Global.",
    ["show ipv6 interface"]
  ),
  c24.m(
    "IPv6",
    "Hard",
    "On router R1, an engineer enters the following commands on GigabitEthernet0/1 (which has burned-in MAC `0011.2233.4455`): `ipv6 address 2001:db8:1:1::9999/64 eui-64` and `ipv6 address fd00:1:1:1::1/64`. Which two statements accurately describe the resulting IPv6 configuration on Gi0/1?",
    [
      "Both the `2001:db8:1:1::/64` GUA and the `fd00:1:1:1::1/64` ULA remain active simultaneously on Gi0/1, along with a single Link-Local Address.",
      "In `show running-config`, Cisco IOS normalizes the first command to `ipv6 address 2001:db8:1:1::/64 eui-64` and assigns address `2001:db8:1:1:211:22ff:fe33:4455`."
    ],
    [
      ["Entering `ipv6 address fd00:1:1:1::1/64` overwrites the `2001:db8:1:1::/64` address unless the `secondary` keyword is appended.", "Unlike IPv4 (which overwrites the primary IP unless `secondary` is used), IPv6 interfaces natively support multiple unicast addresses on the same interface without any `secondary` keyword."],
      ["Gi0/1 generates two separate Link-Local Addresses—one derived from the GUA and a second derived from the ULA.", "An IPv6 interface maintains only one Link-Local Address (`FE80::211:22FF:FE33:4455`), shared across all GUAs and ULAs on that port."],
      ["Cisco IOS rejects `ipv6 address 2001:db8:1:1::9999/64 eui-64` with a syntax error because host bits (`::9999`) were typed with `eui-64`.", "Cisco IOS accepts the command, zeroes out the host bits (`::9999` -> `::`), saves `ipv6 address 2001:db8:1:1::/64 eui-64` in running-config, and computes the EUI-64 Interface ID."]
    ],
    "IPv6 interfaces routinely hold multiple unicast addresses (such as a GUA and a ULA, or multiple GUAs) at the same time while sharing a single Link-Local Address. Furthermore, if you accidentally type non-zero bits in the last 64 bits when using the `eui-64` keyword, Cisco IOS automatically strips those host bits, stores the clean `/64` prefix in `running-config`, and calculates the EUI-64 Interface ID from the interface MAC.",
    "IPv6 interfaces can have multiple GUAs/ULAs simultaneously (no `secondary` keyword needed!) and share ONE Link-Local Address.",
    ["ipv6 address", "show ipv6 interface", "show running-config"]
  ),
  c24.s(
    "IPv6",
    "Hard",
    "Examine the `show ipv6 interface GigabitEthernet0/0` output on R1. Why are two different Solicited-Node Multicast groups (`FF02::1:FF00:1` and `FF02::1:FF00:100`) listed under `Joined group address(es)`?",
    "R1's Link-Local Address (`FE80::1`) and GUA (`2001:DB8:1:1::100`) have different low-order 24 bits.",
    [
      ["Every IPv6 router interface always joins `FF02::1:FF00:1` for OSPFv3 and `FF02::1:FF00:100` for DHCPv6 relay.", "OSPFv3 uses `FF02::5` and `FF02::6`, and DHCPv6 uses `FF02::1:2`; `FF02::1:FFxx:xxxx` groups are Solicited-Node Multicast addresses derived from the last 6 hex digits of each unicast/anycast address."],
      ["The first group (`FF02::1:FF00:1`) is for IPv4 ARP compatibility and the second group (`FF02::1:FF00:100`) is for IPv6 NDP.", "IPv4 ARP never uses IPv6 multicast addresses; both groups are IPv6 Solicited-Node Multicast addresses."],
      ["`2001:DB8:1:1::/64 [ANY]` is a Subnet Router Anycast address that ends in `0100` in hexadecimal.", "The Subnet Router Anycast address `2001:DB8:1:1::` ends in `00:0000` (which would join `FF02::1:FF00:0` if listed), whereas `2001:DB8:1:1::100` ends in `00:0100`."]
    ],
    "An interface joins one Solicited-Node Multicast group (`FF02::1:FF` + last 6 hex digits) for each distinct 24-bit suffix among its configured unicast and anycast addresses. Here, `FE80::1` ends in `00:0001` (joining `FF02::1:FF00:1`), while `2001:DB8:1:1::100` ends in `00:0100` (joining `FF02::1:FF00:100`). Note also that `FF02::2` (all-routers) is joined because `ipv6 unicast-routing` is enabled.",
    "If an interface's LLA and GUA have the SAME last 6 hex digits (e.g., both EUI-64 or both `::1`), you see only ONE `FF02::1:FFxx:xxxx` group; if their last 6 hex digits differ, you see TWO!",
    ["show ipv6 interface"],
    {
      cli: "R1# show ipv6 interface GigabitEthernet0/0\nGigabitEthernet0/0 is up, line protocol is up\n  IPv6 is enabled, link-local address is FE80::1\n  No Virtual Link-local address(es):\n  Global unicast address(es):\n    2001:DB8:1:1::/64 [ANY]\n    2001:DB8:1:1::100, subnet is 2001:DB8:1:1::/64\n  Joined group address(es):\n    FF02::1\n    FF02::2\n    FF02::1:FF00:1\n    FF02::1:FF00:100"
    }
  ),
  c24.t(
    "IPv6",
    "Hard",
    "Match each well-known link-local IPv6 multicast address with the exact set of devices that listen to it.",
    [
      ["FF02::1", "All IPv6 nodes (hosts and routers) on the local link"],
      ["FF02::2", "All IPv6 routers on the local link (joined when ipv6 unicast-routing is enabled)"],
      ["FF02::5 and FF02::6", "All OSPFv3 routers and all OSPFv3 Designated/Backup Designated Routers"],
      ["FF02::A and FF02::1:2", "All EIGRPv6 routers and all DHCPv6 relay agents/servers on the link"]
    ],
    "Memorizing the well-known `FF02::` link-local multicast addresses is essential for CCNA exam questions: `FF02::1` = All nodes, `FF02::2` = All routers, `FF02::5` = OSPFv3 all routers (like 224.0.0.5), `FF02::6` = OSPFv3 DR/BDR (like 224.0.0.6), `FF02::9` = RIPng (like 224.0.0.9), `FF02::A` = EIGRPv6 (`A` = 10 in hex, like 224.0.0.10!), and `FF02::1:2` = DHCPv6 servers/relays.",
    "Notice the IPv4 -> IPv6 multicast parallels: OSPF `.5`/`.6` -> `FF02::5`/`FF02::6`; RIP `.9` -> `FF02::9`; EIGRP `.10` -> `FF02::A` (`0xA = 10`)!",
    ["show ipv6 interface"]
  ),
  c24.d(
    "IPv6",
    "Hard",
    "Order the steps a router performs to construct an EUI-64 IPv6 Global Unicast Address on an Ethernet interface configured with `ipv6 address 2001:db8:5:5::/64 eui-64`.",
    [
      "Take the 64-bit subnet prefix (`2001:0db8:0005:0005`) from the command as the first four quartets",
      "Read the interface's 48-bit (6-byte) MAC address and split it into two 24-bit (3-byte) halves",
      "Insert the 16-bit hexadecimal value `FFFE` between the two 24-bit MAC halves to form a 64-bit value",
      "Invert the 7th bit from the left (the universal/local bit) in the first byte of the 64-bit Interface ID and append to the prefix"
    ],
    "EUI-64 constructs the 64-bit Interface ID (quartets 5–8) from a 48-bit Ethernet MAC address by splitting the MAC into two 3-byte halves, inserting `FFFE` in the center to stretch 48 bits to 64 bits, and flipping the 7th bit of the first byte (the U/L bit). Note that if a custom MAC is configured on the interface (`mac-address`), EUI-64 uses that configured MAC.",
    "Look for `FF:FE` in the middle of quartets 6 and 7 (`...xxff:fexx...`) to immediately spot an EUI-64-generated IPv6 address!",
    ["ipv6 address eui-64", "show ipv6 interface"]
  ),
  c24.s(
    "IPv6",
    "Hard",
    "Router R1 has `ipv6 unicast-routing` enabled, and Serial0/0/0 (which has no burned-in MAC address of its own) is configured with `ipv6 enable`. How does Cisco IOS generate the Link-Local Address for Serial0/0/0?",
    "IOS borrows the MAC address of the lowest-numbered LAN interface on the router and runs the EUI-64 process to build Serial0/0/0's Link-Local Address.",
    [
      ["IOS refuses to enable IPv6 on Serial0/0/0 until a manual `ipv6 address FE80::x link-local` command is entered.", "Serial interfaces support automatic Link-Local Address generation without requiring a manual `link-local` address command."],
      ["IOS generates a random 64-bit privacy extension Interface ID that changes every time Serial0/0/0 flaps.", "Cisco IOS routers do not use temporary RFC 4941 privacy addresses on serial interfaces; they derive EUI-64 from the router's lowest interface MAC."],
      ["IOS uses the HDLC/PPP Data Link Connection Identifier (DLCI) padded with zeros as the 64-bit Interface ID.", "Cisco IOS uses the MAC address of the router's first (lowest-numbered) Ethernet interface to compute EUI-64 for serial ports."]
    ],
    "Because serial interfaces do not have their own IEEE 48-bit MAC addresses, a Cisco IOS router borrows the MAC address of its lowest-numbered Ethernet interface (such as GigabitEthernet0/0) and applies the standard EUI-64 calculation (`FFFE` insertion and 7th-bit inversion) to create the serial interface's Link-Local Address—meaning Gi0/0 and S0/0/0 can legitimately have the exact same Link-Local Address on different links.",
    "Because Link-Local Addresses only need to be unique per link, a router's Serial0/0/0 borrows Gi0/0's MAC to form the exact same EUI-64 `FE80::` address!",
    ["ipv6 enable", "show ipv6 interface brief"]
  )
];


const c25 = mk("IP Connectivity", 25, "v1c25");
const q25 = [
  c25.s(
    "IPv6 routing",
    "Easy",
    "Which ICMPv6 Neighbor Discovery Protocol (NDP) message do IPv6 hosts send to FF02::2 upon bootup to locate local IPv6 default routers and learn the /64 prefix for SLAAC?",
    "Router Solicitation (ICMPv6 Type 133)",
    [
      ["Router Advertisement (ICMPv6 Type 134) sent periodically by hosts to all local nodes", "Router Advertisements (Type 134) are sent by IPv6 routers to FF02::1, not by hosts searching for a router."],
      ["Neighbor Solicitation (ICMPv6 Type 135) sent to the all-DHCP-servers multicast group", "Neighbor Solicitation (Type 135) resolves known neighbor IPv6 addresses to MACs and runs DAD, rather than discovering routers."],
      ["Neighbor Advertisement (ICMPv6 Type 136) broadcasted across the local Ethernet VLAN", "Neighbor Advertisement (Type 136) is the reply to a Neighbor Solicitation, and IPv6 never uses Layer 2 broadcast." ]
    ],
    "When an IPv6 host initializes an interface, it sends an ICMPv6 Router Solicitation (RS, Type 133) message to the All-IPv6-Routers link-scoped multicast address FF02::2 asking local routers to reply immediately with a Router Advertisement (RA, Type 134) containing the router's Link-Local default gateway address and the local /64 prefix.",
    "Remember the 2 pairs of NDP messages: RS (133, host -> FF02::2) / RA (134, router -> FF02::1), and NS (135, -> Solicited-Node multicast) / NA (136).",
    ["show ipv6 routers"]
  ),
  c25.s(
    "IPv6 routing",
    "Easy",
    "What route code appears in the output of `show ipv6 route` on a Cisco router to represent the /128 host route for the router's own Global Unicast Address configured on an up/up interface?",
    "L (Local /128 host route)",
    [
      ["C (Connected /64 subnet route for the attached link)", "Code C identifies the connected subnet prefix (such as /64), whereas L identifies the router's own exact /128 interface IPv6 address."],
      ["S (Static host route manually entered by an engineer)", "Code S indicates a manually configured `ipv6 route` entry, whereas IOS automatically installs L routes for local interface addresses."],
      ["ND (Neighbor Discovery learned route from SLAAC)", "Code ND appears for default routes or prefixes learned via ICMPv6 Router Advertisements on a host-mode interface, not the router's own GUA."]
    ],
    "Just like IPv4 in modern IOS, enabling an IPv6 Global Unicast Address on an up/up interface installs two entries in the IPv6 routing table: a Connected (`C`) route for the subnet prefix (e.g., `2001:db8:1:1::/64`) and a Local (`L`) host route with a `/128` mask for the router's own exact interface address (e.g., `2001:db8:1:1::1/128`).",
    "Connected (`C`) = the subnet prefix (`/64`); Local (`L`) = the router's own exact interface IPv6 address (`/128`).",
    ["show ipv6 route", "show ipv6 route connected"]
  ),
  c25.s(
    "IPv6 routing",
    "Easy",
    "Which command syntax configures a default static IPv6 route on Router R1 forwarding all unmatched IPv6 traffic out Serial0/0/0?",
    "ipv6 route ::/0 Serial0/0/0",
    [
      ["ip route ::/0 ::/0 Serial0/0/0", "`ip route` is the IPv4 static route command and does not accept IPv6 prefix `::/0`."],
      ["ipv6 route 0.0.0.0/0 Serial0/0/0", "`0.0.0.0/0` is the IPv4 default prefix; the IPv6 default route prefix is written `::/0`."],
      ["ipv6 default-gateway ::/0 Serial0/0/0", "There is no `ipv6 default-gateway` command for routing transit IPv6 packets; routers use `ipv6 route ::/0`."]
    ],
    "In IPv6, the all-zeros default prefix and zero prefix length are represented as `::/0`. Therefore, `ipv6 route ::/0 <exit-interface | next-hop-ipv6>` configures a default static IPv6 route.",
    "IPv4 default static route = `ip route 0.0.0.0 0.0.0.0 ...`; IPv6 default static route = `ipv6 route ::/0 ...`.",
    ["ipv6 route ::/0", "show ipv6 route static"]
  ),
  c25.s(
    "IPv6 routing",
    "Medium",
    "An engineer configures a static IPv6 route using a neighbor's Link-Local Address as the next-hop: `ipv6 route 2001:db8:1:2::/64 FE80::2`. Why does Cisco IOS reject this command as incomplete?",
    "Because Link-Local Addresses (`FE80::/10`) can exist on every interface, the command must also specify the local outgoing interface BEFORE the Link-Local next-hop address.",
    [
      ["Cisco IOS does not support using Link-Local Addresses as next-hop addresses in static IPv6 routes under any circumstances.", "Cisco IOS fully supports Link-Local next-hop addresses as long as the local outgoing interface is also specified (making it a fully specified static route)."],
      ["A static route using a Link-Local next-hop requires appending the keyword `unicast-local` at the end of the `ipv6 route` command.", "There is no `unicast-local` keyword; IOS requires the local egress interface name/number between the destination prefix and the Link-Local next-hop."],
      ["The prefix `2001:db8:1:2::/64` must be written in uncompressed 32-digit hexadecimal format when paired with a Link-Local next-hop.", "Compressed IPv6 prefix notation (`::`) is always valid in `ipv6 route`; the error occurs because a Link-Local next-hop alone is ambiguous across multiple interfaces."]
    ],
    "Because every IPv6-enabled interface on a router uses the exact same `FE80::/10` Link-Local subnet (and a router cannot use its routing table to determine which interface reaches `FE80::2`), any static IPv6 route that uses a Link-Local next-hop address MUST include the local outgoing interface: `ipv6 route 2001:db8:1:2::/64 GigabitEthernet0/0 FE80::2`.",
    "Global Unicast next-hop = outgoing interface optional; Link-Local (`FE80::`) next-hop = outgoing interface MANDATORY (`ipv6 route <prefix> <out-intf> FE80::x`)!",
    ["ipv6 route", "show ipv6 route"]
  ),
  c25.s(
    "IPv6 routing",
    "Medium",
    "Host PC1 (`2001:db8:1:1::10/64`) needs to learn the Layer 2 MAC address of its local default gateway (`FE80::1`). Which ICMPv6 message does PC1 send, and what destination IPv6 address does it use?",
    "Neighbor Solicitation (NS) sent to the Solicited-Node multicast address `FF02::1:FF00:1`",
    [
      ["ARP Request frame broadcasted to destination MAC `FFFF.FFFF.FFFF` and target IP `FE80::1`", "IPv6 completely replaces ARP and Layer 2 broadcasts with ICMPv6 Neighbor Discovery Protocol (NDP) using multicast."],
      ["Router Solicitation (RS) sent to the All-IPv6-Routers multicast address `FF02::2`", "Router Solicitation (`FF02::2`) discovers local routers and prefixes during SLAAC; Neighbor Solicitation resolves a known IPv6 address's MAC."],
      ["Neighbor Solicitation (NS) sent to the All-IPv6-Nodes multicast address `FF02::1`", "To avoid interrupting every host on the subnet, NS messages for MAC resolution use the target's Solicited-Node multicast (`FF02::1:FFxx:xxxx`), not `FF02::1`."]
    ],
    "IPv6 replaces IPv4 ARP with ICMPv6 Neighbor Solicitation (NS, Type 135) and Neighbor Advertisement (NA, Type 136). Instead of broadcasting to every device on the LAN, the sender sends the NS to the target's Solicited-Node multicast address—formed by appending the last 6 hex digits of the target IPv6 address (`00:0001` for `FE80::1`) to `FF02::1:FF00:0/104`, yielding `FF02::1:FF00:1`.",
    "Solicited-Node multicast prefix is ALWAYS `FF02::1:FF` + the last 6 hex digits (24 bits) of the target unicast IPv6 address.",
    ["show ipv6 neighbors"]
  ),
  c25.s(
    "IPv6 routing",
    "Medium",
    "How does an IPv6 host perform Duplicate Address Detection (DAD) before assigning a newly configured or SLAAC-generated unicast IPv6 address to its interface?",
    "It sends an ICMPv6 Neighbor Solicitation (NS) querying its own tentative IPv6 address; if no Neighbor Advertisement (NA) reply arrives, the address is unique.",
    [
      ["It sends an ICMPv6 Echo Request (ping) to `FF02::1` using its tentative address as the source IP and waits 5 seconds.", "DAD uses an ICMPv6 Neighbor Solicitation (NS) with an unspecified `::` source IP sent to the tentative address's Solicited-Node multicast, not a ping to `FF02::1`."],
      ["It queries the local router's Neighbor Discovery cache via UDP port 546 to ask whether the address is already registered.", "UDP port 546/547 is used by DHCPv6, whereas DAD operates via serverless link-local ICMPv6 Neighbor Solicitation messages."],
      ["It broadcasts a Gratuitous ARP frame containing the 128-bit IPv6 address and listens for a collision jam signal.", "IPv6 does not use ARP or broadcast frames; it uses ICMPv6 Neighbor Solicitation and Neighbor Advertisement for DAD."]
    ],
    "Before using a unicast IPv6 address (whether static, SLAAC, or DHCPv6), a host runs Duplicate Address Detection (DAD) by sending an ICMPv6 Neighbor Solicitation (NS) to the Solicited-Node multicast of its tentative address asking if any node already owns that address. If another host already uses it, that host replies with a Neighbor Advertisement (NA) and the new host marks the address as duplicate.",
    "NDP NS/NA serves two jobs in IPv6: (1) MAC address resolution (replacing ARP) and (2) Duplicate Address Detection (DAD).",
    ["show ipv6 interface"]
  ),
  c25.m(
    "IPv6 routing",
    "Medium",
    "An engineer wants to configure a floating static IPv6 route on R1 that serves as a backup to an OSPFv3 route (default AD 110) for prefix `2001:db8:99::/64` via next-hop `2001:db8:1:12::2`. Which statements are true about this configuration?",
    [
      "The command `ipv6 route 2001:db8:1:99::/64 2001:db8:1:12::2 130` (with an administrative distance > 110) configures the floating static route.",
      "The floating static route stays out of `show ipv6 route` while the OSPFv3 route is active and is automatically installed if the OSPFv3 route fails."
    ],
    [
      ["The administrative distance parameter on `ipv6 route` must be set to a value between 2 and 109 so it is lower than OSPFv3's AD of 110.", "Setting AD lower than 110 would make the static route beat OSPFv3 immediately instead of acting as a backup floating static route."],
      ["Both the OSPFv3 route and the floating static route appear simultaneously in `show ipv6 route` to load-balance traffic.", "A router only installs the route source with the lowest Administrative Distance into the active IPv6 routing table."],
      ["IPv6 static routes have a default Administrative Distance of 120, so no AD parameter is needed to back up OSPFv3.", "Just like IPv4, IPv6 static routes have a default Administrative Distance of 1 (and Connected routes have AD 0), which beats OSPFv3 (110) unless raised."]
    ],
    "A floating static IPv6 route is configured by appending an Administrative Distance (AD) value higher than the primary dynamic routing protocol's AD (e.g., `130` > OSPFv3's default `110`) to the end of the `ipv6 route` command. While OSPFv3 learns the prefix, only the OSPFv3 route (AD 110) is placed in the IPv6 routing table; if the OSPF route disappears, IOS immediately activates the floating static route.",
    "Default IPv6 ADs match IPv4: Connected = 0, Static = 1, EIGRP = 90, OSPFv3 = 110. A floating static route backing up OSPF needs AD >= 111.",
    ["ipv6 route", "show ipv6 route"]
  ),
  c25.s(
    "IPv6 routing",
    "Hard",
    "In the output of `show ipv6 neighbors` on a Cisco router, an entry for neighbor `2001:db8:1:1::50` shows state `REACH` and another entry for `2001:db8:1:1::51` shows state `STALE`. What is the difference between these two NDP neighbor states?",
    "`REACH` means the neighbor was recently confirmed reachable within the reachable timer; `STALE` means the timer expired without traffic confirmation, though the cached MAC can still be used.",
    [
      ["`REACH` indicates a statically configured neighbor MAC, whereas `STALE` indicates a duplicate IPv6 address blocked by DAD.", "Both `REACH` and `STALE` are normal dynamic NDP neighbor cache states; neither indicates a DAD conflict."],
      ["`STALE` means the neighbor failed to respond to three consecutive NS probes and all packets to that host are dropped.", "When an entry is `STALE`, the router still forwards packets using the cached MAC while transitioning through `DELAY`/`PROBE` to verify reachability."],
      ["`REACH` applies only to Global Unicast Addresses, whereas `STALE` is the permanent state used for Link-Local (`FE80::`) addresses.", "Both Global Unicast and Link-Local neighbors transition between `INCMP`, `REACH`, `STALE`, `DELAY`, and `PROBE` based on traffic activity."]
    ],
    "In the IPv6 NDP neighbor table (`show ipv6 neighbors`), `REACH` (Reachable) means bidirectional reachability was positively confirmed within the last reachable time window (default 30 seconds). Once that timer expires without positive confirmation, the entry moves to `STALE`—meaning IOS still retains and uses the cached MAC address if a packet needs to be sent, at which point it verifies reachability (`DELAY` -> `PROBE`).",
    "In `show ipv6 neighbors`: `INCMP` = waiting for NA reply; `REACH` = recently verified reachable; `STALE` = cached MAC older than 30s but still usable.",
    ["show ipv6 neighbors"]
  ),
  c25.s(
    "IPv6 routing",
    "Hard",
    "Router R1 has GigabitEthernet0/0 (`2001:db8:1:1::1/64`) connected to a multi-access Ethernet switch with 50 IPv6 hosts. Why is configuring a static route pointing only to the multi-access outgoing interface (`ipv6 route 2001:db8:2:2::/64 GigabitEthernet0/0`) discouraged on Ethernet links?",
    "It forces R1 to perform ICMPv6 Neighbor Discovery for every individual destination IPv6 host in `2001:db8:2:2::/64` as if those hosts were directly attached to Gi0/0, relying on Proxy ND.",
    [
      ["Cisco IOS automatically shuts down any Ethernet interface referenced in a static IPv6 route that lacks a next-hop address.", "IOS accepts the command without shutting down the interface, though it warns or relies on neighbor discovery per destination IP."],
      ["Ethernet interfaces only support OSPFv3 dynamic routing in IPv6 and drop packets matched by static routes.", "Ethernet interfaces fully support static IPv6 routes when configured with a next-hop IPv6 address (`ipv6 route <prefix> <next-hop-ip>`)."],
      ["Specifying an outgoing Ethernet interface in `ipv6 route` changes the interface's Administrative Distance to 255 (unreachable).", "The default Administrative Distance remains 1 as long as Gi0/0 is up/up; the issue is excessive Neighbor Discovery table overhead on multi-access links."]
    ],
    "On a point-to-point serial link, specifying only the outgoing interface in `ipv6 route` works cleanly because there is no Layer 2 MAC addressing. On a multi-access Ethernet LAN, specifying only the outgoing interface without a next-hop IPv6 address causes the router to treat every destination address in the remote prefix as directly connected on that LAN and send an ICMPv6 NS for every destination host.",
    "On Ethernet LANs, always specify a next-hop IPv6 address (either a GUA next-hop, or `<out-intf> <link-local-next-hop>`).",
    ["ipv6 route", "show ipv6 route static"]
  ),
  c25.s(
    "IPv6 routing",
    "Hard",
    "An engineer configures `ipv6 route 2001:db8:10::/64 2001:db8:1:12::2` on R1, and `show running-config` shows the command, yet the route does NOT appear in `show ipv6 route`. Assuming no dynamic routing protocol is running, what is the most likely cause?",
    "R1 has no active route in its IPv6 routing table to reach the next-hop address `2001:db8:1:12::2` (or the local interface for that subnet is down).",
    [
      ["The engineer forgot to add the `permanent` keyword, which is required for all IPv6 static routes to enter the routing table.", "The `permanent` keyword is optional and not required; IOS installs any static route whose next-hop IPv6 address is reachable via an up/up interface."],
      ["IPv6 static routes are only displayed in `show ip route` and never appear in `show ipv6 route`.", "IPv4 and IPv6 use separate routing tables; `show ipv6 route` is the exact command that displays IPv6 static (`S`) routes."],
      ["Static IPv6 routes require configuring `ipv6 ospf 1 area 0` on the egress interface before IOS activates the static route.", "Static routes operate independently of OSPFv3; however, `ipv6 unicast-routing` must be enabled and the next-hop must be resolvable."]
    ],
    "Before Cisco IOS installs a static IPv6 route (`S`) into `show ipv6 route`, two conditions must be met: (1) `ipv6 unicast-routing` must be enabled globally, and (2) the local outgoing interface must be `up/up` (or the specified next-hop IPv6 address must be resolvable through an active route in the IPv6 routing table).",
    "If a static route is in `running-config` but missing from `show ipv6 route`, check: (1) `ipv6 unicast-routing`, (2) `show ipv6 interface brief` (is the egress interface up/up?), and (3) is the next-hop IP in a known connected/routed subnet?",
    ["show ipv6 route", "show ipv6 interface brief"]
  )
];

const c26 = mk("Network Fundamentals", 20, "v1c26");
const q26 = [
  c26.s(
    "Wireless",
    "Easy",
    "Which wireless topology mode uses at least one Access Point (AP) connected to a wired Ethernet distribution system so wireless clients communicate through the AP?",
    "Infrastructure mode (Basic or Extended Service Set)",
    [
      ["Ad hoc mode (Independent Basic Service Set / IBSS)", "IBSS (ad hoc mode) connects two or more wireless devices directly peer-to-peer without using an Access Point."],
      ["Wi-Fi Direct personal mesh tether mode", "Wi-Fi Direct and Bluetooth piconets are peer-to-peer connections rather than AP-based infrastructure LANs."],
      ["Point-to-Point Workgroup Bridge (WGB) repeater mode", "A Workgroup Bridge connects a wired device to a wireless network; standard client-to-AP WLAN operation is called Infrastructure mode."]
    ],
    "The IEEE 802.11 standard defines two primary operational modes: Ad hoc mode (Independent Basic Service Set, IBSS), where wireless stations communicate directly peer-to-peer without an AP, and Infrastructure mode, where stations associate to an Access Point (forming a Basic Service Set, BSS, or multiple APs forming an Extended Service Set, ESS) bridged to the wired Ethernet LAN.",
    "IBSS = Ad hoc (no AP); BSS = 1 AP in Infrastructure mode (identified by BSSID = AP radio MAC); ESS = 2+ APs sharing the same SSID for roaming.",
    []
  ),
  c26.s(
    "Wireless",
    "Easy",
    "Which three channels in the 2.4-GHz ISM frequency band (out of channels 1 through 11 in North America) are completely non-overlapping?",
    "Channels 1, 6, and 11",
    [
      ["Channels 1, 5, and 9, spaced four channel numbers apart", "Adjacent 2.4-GHz channels are spaced only 5 MHz apart while each channel is 22 MHz wide, so channels 1, 5, and 9 overlap slightly in 802.11b/g/n."],
      ["Channels 2, 7, and 11, leaving guard bands at both edges", "Channel 7 (2.442 GHz) overlaps with Channel 11 (2.462 GHz) because their centers are only 20 MHz apart; only 1, 6, and 11 have full 25-MHz separation."],
      ["Channels 36, 40, and 44 in the lower UNII-1 band", "Channels 36, 40, and 44 are non-overlapping channels in the 5-GHz UNII-1 band, not the 2.4-GHz band."]
    ],
    "In the 2.4-GHz band, each channel center is separated by only 5 MHz (Channel 1 = 2.412 GHz, Channel 6 = 2.437 GHz, Channel 11 = 2.462 GHz), while an 802.11 signal occupies 20–22 MHz of bandwidth. Consequently, channels must be at least 5 channel numbers (25 MHz) apart to avoid overlapping—leaving only Channels 1, 6, and 11 as non-overlapping in a 11-channel regulatory domain.",
    "In 2.4 GHz, ALWAYS assign neighboring APs exclusively to Channels **1, 6, and 11** to prevent adjacent-channel interference!",
    []
  ),
  c26.s(
    "Wireless",
    "Easy",
    "Why do 802.11 wireless LANs use CSMA/CA (Carrier Sense Multiple Access with Collision Avoidance) and explicit Layer 2 Acknowledgments instead of Ethernet's CSMA/CD?",
    "Because wireless radios operate in half-duplex mode and cannot transmit and listen simultaneously on the same channel to detect collisions.",
    [
      ["Because 802.11 frames do not contain a Frame Check Sequence (FCS) trailer to verify bit integrity.", "802.11 frames DO include a 4-byte FCS trailer; they require explicit Layer 2 ACKs because RF interference and hidden nodes cause high frame loss that the sender cannot sense while transmitting."],
      ["Because wireless Access Points forward frames at Layer 3 using IP routing tables rather than Layer 2 MAC addresses.", "Access Points are Layer 2 bridges translating between 802.11 wireless frames and 802.3 Ethernet frames."],
      ["Because 5-GHz radio waves travel faster than electrical signals in copper, preventing backoff timers from synchronizing.", "Propagation speed is not the reason; a wireless transceiver's own transmitted signal overwhelms its receiver on the same frequency, making collision detection impossible."]
    ],
    "A wireless transceiver is half-duplex: when transmitting RF energy on a channel, its local signal completely blinds its receiver on that channel, making it impossible to hear if another station transmitted at the same time (so CSMA/CD cannot work). Therefore, 802.11 uses CSMA/CA (listen-before-talk with random backoff and optional RTS/CTS) and requires the receiver to send an immediate Layer 2 802.11 ACK for every unicast frame.",
    "Wired Ethernet = CSMA/CD (no L2 ACK); 802.11 Wireless = half-duplex + CSMA/CA + mandatory Layer 2 ACK for every unicast frame.",
    []
  ),
  c26.s(
    "Wireless",
    "Medium",
    "How do the Basic Service Set Identifier (BSSID) and Service Set Identifier (SSID) differ in an IEEE 802.11 wireless LAN?",
    "The SSID is the human-readable WLAN name (up to 32 characters), whereas the BSSID is the 48-bit hardware MAC address of the specific AP radio serving that cell.",
    [
      ["The BSSID is the human-readable network name broadcasted in beacons, whereas the SSID is the AP's IPv4 management address.", "This reverses the terms: SSID is the human-readable text name of the WLAN, and BSSID is the Layer 2 radio MAC address of the AP."],
      ["All Access Points in an Extended Service Set (ESS) must use the exact same BSSID MAC address so clients can roam.", "In an ESS, all APs share the same human-readable SSID, but each AP radio MUST have its own unique BSSID MAC address."],
      ["The SSID identifies the 5-GHz channel width, whereas the BSSID identifies the WPA2 pre-shared encryption key.", "Neither term refers to channel width or encryption keys; SSID is the logical WLAN name and BSSID is the unique Layer 2 MAC of the BSS radio."]
    ],
    "In an 802.11 Basic Service Set (BSS), the SSID (Service Set Identifier) is the logical, human-readable ASCII name of the wireless network (which can be shared across many APs in an Extended Service Set, ESS), whereas the BSSID (Basic Service Set Identifier) is the unique 48-bit MAC address of the individual AP radio for that specific cell and WLAN.",
    "SSID = human-readable WLAN name (same across all APs in an ESS); BSSID = unique 48-bit radio MAC address of one specific AP cell.",
    []
  ),
  c26.s(
    "Wireless",
    "Medium",
    "When designing an Extended Service Set (ESS) with multiple Access Points to support seamless client roaming without drops, how should adjacent AP cells be configured?",
    "Adjacent APs should share the same SSID with 10%–15% cell overlap on DIFFERENT non-overlapping channels.",
    [
      ["Adjacent APs should advertise the same SSID and operate on the EXACT SAME RF channel so roaming clients never retune their radios.", "Putting adjacent APs on the same channel causes severe co-channel contention (all clients and APs must take turns in one shared half-duplex domain)."],
      ["Adjacent APs should advertise different SSIDs per floor with 50% RF cell overlap on Channel 1.", "To roam seamlessly within an ESS, APs must advertise the same SSID on non-overlapping channels (e.g., 1, 6, 11) with 10–15% cell overlap."],
      ["Adjacent APs should have a 5-meter dead-zone gap between cells so signals from two APs never collide at a client.", "A dead zone drops the client's connection before it can associate to the next AP; Cisco recommends 10–15% cell overlap at the target data rate."]
    ],
    "For smooth Layer 2/Layer 3 roaming across an Extended Service Set (ESS), all APs must share the same SSID and security settings, their physical coverage cells should overlap by 10% to 15%, and neighboring APs must use different non-overlapping channels (such as 1, 6, and 11 in 2.4 GHz) so each cell operates as an independent collision domain without co-channel interference.",
    "ESS Roaming design rule: Same SSID + 10–15% cell overlap + DIFFERENT non-overlapping channels on adjacent APs!",
    []
  ),
  c26.t(
    "Wireless",
    "Medium",
    "Match each IEEE 802.11 amendment standard to its operating frequency band(s) and Wi-Fi generation characteristics.",
    [
      ["802.11b", "2.4 GHz only, DSSS modulation, up to 11 Mbps"],
      ["802.11a", "5 GHz only, OFDM modulation, up to 54 Mbps"],
      ["802.11g", "2.4 GHz only, OFDM modulation, up to 54 Mbps"],
      ["802.11n (Wi-Fi 4)", "2.4 GHz and 5 GHz, MIMO and 40-MHz channel bonding, up to 600 Mbps"],
      ["802.11ac (Wi-Fi 5)", "5 GHz only, MU-MIMO and 80/160-MHz channels, up to 6.9 Gbps"],
      ["802.11ax (Wi-Fi 6)", "2.4 GHz and 5 GHz (and 6 GHz in 6E), OFDMA and bidirectional MU-MIMO"]
    ],
    "IEEE 802.11b (11 Mbps) and 802.11g (54 Mbps) run in 2.4 GHz only; 802.11a (54 Mbps) and 802.11ac / Wi-Fi 5 run in 5 GHz only; and 802.11n (Wi-Fi 4) and 802.11ax (Wi-Fi 6) operate in both 2.4 GHz and 5 GHz.",
    "Frequency shortcut: `b` and `g` = 2.4 GHz only; `a` and `ac` = 5 GHz only; `n` and `ax` = BOTH 2.4 GHz and 5 GHz!",
    []
  ),
  c26.s(
    "Wireless",
    "Medium",
    "In 5-GHz UNII-2 and UNII-2 Extended bands, what regulatory mechanism requires an Access Point to monitor its channel for weather or military radar pulses and automatically switch channels if radar is detected?",
    "Dynamic Frequency Selection (DFS) paired with Transmit Power Control (TPC)",
    [
      ["Clear Channel Assessment (CCA) with Network Allocation Vector (NAV) reservation", "CCA and NAV are standard 802.11 CSMA/CA collision-avoidance mechanisms on all channels, not the radar-avoidance rule for UNII-2."],
      ["Orthogonal Frequency Division Multiple Access (OFDMA) subcarrier puncturing", "OFDMA is an 802.11ax multi-user modulation technique, not the regulatory radar-detection mechanism."],
      ["Radio Resource Management (RRM) Coverage Hole Detection (CHD)", "RRM Coverage Hole Detection increases AP transmit power when clients have weak RSSI, whereas DFS evacuates a 5-GHz UNII-2 channel upon detecting radar."]
    ],
    "Regulatory agencies require 802.11 devices operating in the 5-GHz UNII-2 (channels 52–64) and UNII-2 Extended (channels 100–144) bands to implement Dynamic Frequency Selection (DFS) and Transmit Power Control (TPC) so Wi-Fi APs never interfere with incumbent military, satellite, or Doppler weather radar systems.",
    "DFS = Dynamic Frequency Selection (mandatory radar detection and channel evacuation on 5-GHz UNII-2 / UNII-2e channels).",
    []
  ),
  c26.s(
    "Wireless",
    "Hard",
    "What happens when an engineer bonds two adjacent 20-MHz channels into a 40-MHz channel (or four into an 80-MHz channel) in 802.11n/ac/ax?",
    "Peak data throughput roughly doubles per spatial stream, but the number of independent non-overlapping channels decreases and the noise floor increases by 3 dB.",
    [
      ["The RF cell coverage range doubles while the number of non-overlapping channels remains unchanged.", "Doubling channel width actually slightly reduces effective SNR range (adding ~3 dB of thermal noise) and cuts the number of non-overlapping channels in half."],
      ["Channel bonding is restricted exclusively to the 2.4-GHz band because 5-GHz channels cannot be bonded above 20 MHz.", "The opposite is true: channel bonding (40/80/160 MHz) is heavily used in 5 GHz, whereas bonding in 2.4 GHz is strongly discouraged because only three 20-MHz channels exist."],
      ["Bonding channels eliminates the need for CSMA/CA by dedicating one 20-MHz channel to transmit and the second 20-MHz channel to receive.", "Channel bonding combines adjacent channels into a single wider half-duplex pipe for higher data rates; it does not make 802.11 full-duplex."]
    ],
    "Channel bonding combines two 20-MHz channels into a 40-MHz channel (or four into 80 MHz, eight into 160 MHz), more than doubling maximum throughput. However, in high-density enterprise deployments, wide channels reduce the number of reusable non-overlapping channels in the 5-GHz band and increase the noise floor by 3 dB per doubling.",
    "Channel bonding tradeoff: wider channels (40/80 MHz) = higher single-client speed, but FEWER non-overlapping channels for multi-AP reuse.",
    []
  ),
  c26.s(
    "Wireless",
    "Hard",
    "As a wireless signal propagates from an AP to a client, it reflects off metal lockers and arrives at the receiver via multiple paths at slightly different times. How do legacy 802.11b systems vs. modern 802.11n/ac/ax MIMO systems react to this phenomenon?",
    "In legacy 802.11b, multipath causes destructive phase cancellation and fading; in 802.11n/ac/ax, MIMO exploits multipath to carry multiple spatial streams.",
    [
      ["Both legacy 802.11b and modern MIMO systems drop all reflected signals using a physical polarizing filter on the antenna.", "Reflected RF signals are not blocked by a polarizing filter; MIMO digital signal processors actively combine or separate multipath reflections."],
      ["Legacy 802.11b uses multipath to double throughput, whereas 802.11ac requires strict line-of-sight with zero reflections.", "This is backwards: multipath hurt legacy single-stream 802.11a/b/g systems, whereas 802.11n/ac/ax MIMO uses multipath decorrelation to send parallel spatial streams."],
      ["Multipath only occurs on 2.4-GHz channels and cannot occur on 5-GHz channels due to shorter wavelengths.", "Multipath reflection, refraction, diffraction, and scattering occur in both 2.4-GHz and 5-GHz bands."]
    ],
    "Multipath occurs when reflected copies of an RF wave take longer paths and arrive out of phase with the main signal. In older 802.11a/b/g networks, multipath caused signal fading/nulling (mitigated only by antenna diversity). Starting with 802.11n (MIMO), multiple transmit and receive chains use multipath propagation to distinguish multiple simultaneous Spatial Streams on the same channel.",
    "MIMO turns multipath from an enemy into an advantage by sending multiple parallel Spatial Streams over distinct reflection paths.",
    []
  ),
  c26.s(
    "Wireless",
    "Hard",
    "While a wireless client is transmitting a frame to an AP at +15 dBm, the signal experiences 80 dB of free-space path loss and wall attenuation before reaching the AP antenna. What is the Received Signal Strength Indicator (RSSI) at the AP?",
    "-65 dBm",
    [
      ["-95 dBm, calculated by adding the transmit power to the negative attenuation value", "Adding +15 dBm and -80 dB yields +15 - 80 = -65 dBm, not -95 dBm."],
      ["+65 dBm, because RSSI is always expressed as a positive decibel ratio above 1 milliwatt", "Received wireless signals are tiny fractions of a milliwatt (0 dBm = 1 mW), so enterprise Wi-Fi RSSI values are always negative dBm numbers (typically -30 dBm to -85 dBm)."],
      ["-40 dBm, because every 3 dB of attenuation halves the decibel number directly", "Every 3 dB loss halves the milliwatt power, but in logarithmic dB/dBm math you simply add gains and subtract losses (+15 dBm - 80 dB = -65 dBm)."]
    ],
    "In RF decibel math (`dBm` = decibels relative to 1 milliwatt, where `0 dBm = 1 mW`), antenna gains (`+dBi`) and path/cable losses (`-dB`) are added and subtracted linearly: `+15 dBm` transmit power `- 80 dB` path loss = `-65 dBm` received signal strength (which is a healthy enterprise Wi-Fi signal, better than the typical `-67 dBm` voice design threshold).",
    "Remember: `0 dBm = 1 mW`, and for negative dBm numbers, closer to zero is STRONGER (`-50 dBm` is much stronger than `-80 dBm`)!",
    []
  )
];

const c27 = mk("Network Access", 20, "v1c27");
const q27 = [
  c27.s(
    "WLAN",
    "Easy",
    "In a Cisco Unified Wireless Network (split-MAC architecture), which protocol encapsulates and tunnels control and data messages between a Lightweight Access Point (LAP) and a Wireless LAN Controller (WLC)?",
    "CAPWAP (Control and Provisioning of Wireless Access Points)",
    [
      ["LWAPP over TCP port 22 and UDP port 69", "CAPWAP uses UDP ports 5246 and 5247 (replacing the older Cisco-proprietary LWAPP protocol), not SSH/TFTP ports."],
      ["802.1Q VLAN Trunking Protocol (VTP) over Layer 2 multicast", "Lightweight APs in local mode connect to a single access VLAN and tunnel WLAN traffic inside Layer 3 UDP CAPWAP packets, not VTP frames."],
      ["LISP and VXLAN over UDP port 4789 directly from the AP radio", "LISP and VXLAN are Cisco SD-Access fabric protocols; standard WLC-to-LAP communication uses CAPWAP over UDP 5246 and 5247."]
    ],
    "A Cisco Unified Wireless Network splits 802.11 functions between the Lightweight Access Point (LAP, which handles real-time RF, beacons, probe responses, and encryption) and the Wireless LAN Controller (WLC, which handles authentication, roaming, RRM, and QoS/security policy) using two CAPWAP tunnels over IP: CAPWAP Control (UDP port 5246, DTLS encrypted) and CAPWAP Data (UDP port 5247).",
    "Memorize CAPWAP ports: **UDP 5246** = CAPWAP Control (DTLS encrypted by default); **UDP 5247** = CAPWAP Data (unencrypted by default unless DTLS data encryption is enabled).",
    []
  ),
  c27.s(
    "WLAN",
    "Easy",
    "How should a Catalyst switch port be configured when connecting a Cisco Lightweight Access Point (LAP) operating in default Local Mode?",
    "As a Layer 2 access port (`switchport mode access`) assigned to the AP management VLAN",
    [
      ["As an 802.1Q trunk port (`switchport mode trunk`) carrying all wireless client VLANs to the AP", "An Autonomous AP or FlexConnect AP doing local switching uses an 802.1Q trunk, whereas a Local Mode LAP tunnels all traffic to the WLC over a single access VLAN!"],
      ["As a Layer 3 routed port (`no switchport`) running OSPFv2 with the Access Point", "Lightweight APs are Layer 2/IP endpoints that obtain a single IP address via DHCP on an access VLAN, not OSPF routers."],
      ["As a dynamic desirable DTP port with Port Security maximum set to 1 MAC address", "Even in Local Mode (where client frames are tunneled to the WLC), trunks are not used, and setting Port Security max=1 can break if local switching is ever used."]
    ],
    "Because a Lightweight AP (LAP) operating in Local Mode encapsulates all wireless client traffic inside a single IP/UDP CAPWAP Data tunnel (UDP 5247) back to the WLC, the switch port connected to the LAP only ever sees the LAP's own MAC and IP address. Therefore, the switch port is configured as a normal Layer 2 access port (`switchport mode access`) with PoE enabled.",
    "Exam classic: **Autonomous AP** or **FlexConnect AP** -> Switch port = **802.1Q Trunk**; **Local Mode Lightweight AP** -> Switch port = **Access Port**! (And the **WLC** itself connects to the switch via an **802.1Q Trunk**.)",
    []
  ),
  c27.s(
    "WLAN",
    "Easy",
    "Which Lightweight AP operational mode is designed for remote branch offices with no local WLC, allowing the AP to switch wireless client traffic locally onto the branch LAN even if the WAN link to the central WLC goes down?",
    "FlexConnect mode",
    [
      ["Local mode (the default CAPWAP AP mode)", "In Local mode, all wireless client data must traverse the CAPWAP tunnel to the WLC; if the WAN link to the WLC fails, the AP stops servicing clients."],
      ["Monitor mode (dedicated IDS/WIPS scanning mode)", "Monitor mode dedicates the AP radios to scanning for rogue APs and security threats without servicing any wireless clients."],
      ["Sniffer mode (remote wireless packet capture mode)", "Sniffer mode captures 802.11 frames on a channel and forwards them to a machine running Wireshark/OmniPeek for protocol analysis."]
    ],
    "FlexConnect (formerly H-REAP) allows a Lightweight AP at a remote branch office to be managed by a central WLC across a WAN while locally switching client data traffic between 802.11 SSIDs and branch 802.1Q VLANs (`FlexConnect Local Switching`), and surviving WAN outages (`FlexConnect Standalone`) for locally switched/authenticated WLANs.",
    "Know the key LAP modes: **Local** (default, tunnels all data to WLC), **FlexConnect** (branch office, local switching across WAN), **Monitor** (rogue/IDS scanning), **Rogue Detector** (listens on wired trunk for rogue MACs), **Sniffer** (Wireshark packet capture), **SE-Connect** (spectrum analysis).",
    []
  ),
  c27.m(
    "WLAN",
    "Medium",
    "A newly unboxed Cisco Lightweight Access Point (LAP) boots up on a subnet that has no WLC directly attached. Which methods can the LAP use to dynamically discover the IPv4 address of a Cisco WLC?",
    [
      "Receiving DHCP Option 43 inside the DHCPv4 lease offer from the DHCP server",
      "Resolving the hostname `CISCO-CAPWAP-CONTROLLER.localdomain` via a DNS server"
    ],
    [
      ["Listening for OSPF Type 1 Router LSAs flooded by the WLC on multicast `224.0.0.5`", "WLCs and Lightweight APs do not run OSPF to discover CAPWAP controllers."],
      ["Receiving DHCP Option 150 from a Cisco Catalyst switch running DHCP Snooping", "DHCP Option 150 supplies the TFTP server IP to Cisco IP Phones; Lightweight APs use **DHCP Option 43** to learn WLC Management IPs!"],
      ["Sending an ICMPv6 Router Solicitation to `FF02::2` to extract the WLC's CAPWAP tunnel ID", "ICMPv6 Router Solicitations discover default gateway routers, not CAPWAP Wireless LAN Controllers."]
    ],
    "During the WLC Discovery phase, a Lightweight AP tries multiple mechanisms to build a list of candidate WLC Management IP addresses: (1) local subnet Layer 3 broadcast (`255.255.255.255`), (2) previously learned WLC IPs stored in NVRAM (`primed` AP), (3) **DHCP Option 43** returned by the DHCP server, (4) **DNS resolution** of `CISCO-CAPWAP-CONTROLLER.<domain>`, and (5) Over-the-Air provisioning from neighboring APs.",
    "Don't mix up DHCP Options on the exam: **Option 43** = WLC Discovery for Lightweight APs; **Option 150** = TFTP Server for Cisco VoIP Phones; **Option 82** = DHCP Snooping Relay Agent Info.",
    []
  ),
  c27.d(
    "WLAN",
    "Medium",
    "Place the phases a Cisco Lightweight Access Point (LAP) goes through from initial power-on until it begins servicing wireless clients in the correct chronological order.",
    [
      "Boot the local IOS/ClickOS image from flash and initialize hardware",
      "Request and obtain an IPv4 address, subnet mask, default gateway, and options via DHCP",
      "Perform WLC Discovery (broadcast, NVRAM, DHCP Option 43, DNS) to find candidate WLCs",
      "Establish a DTLS-encrypted CAPWAP tunnel to the selected WLC and download mismatching firmware if needed",
      "Download the provisioning configuration (SSIDs, RF channel/power, security) from the WLC and enable radios"
    ],
    "When a Lightweight AP powers up (via PoE), it boots its local image, acquires an IPv4 address via DHCP, discovers candidate WLCs, joins a WLC over CAPWAP (UDP 5246/5247, upgrading its firmware image and rebooting if its code version doesn't match the WLC's version), and finally downloads its RF/WLAN configuration to enter the `Registered` state.",
    "LAP lifecycle: Boot -> DHCP -> WLC Discovery -> CAPWAP Join (& Image Download if mismatched) -> Config Download -> Registered!",
    []
  ),
  c27.s(
    "WLAN",
    "Medium",
    "In an Autonomous AP deployment with three WLANs (Employees in VLAN 10, Voice in VLAN 20, and Guests in VLAN 30), how does the Autonomous AP map wireless traffic onto the wired switch?",
    "Each SSID is mapped to its VLAN on the AP, which connects to the switch over an 802.1Q trunk.",
    [
      ["The Autonomous AP encapsulates all three SSIDs inside a single CAPWAP UDP 5247 tunnel to the default gateway router.", "Autonomous APs are standalone devices with no WLC and no CAPWAP tunnels; they bridge each SSID directly to a wired 802.1Q VLAN."],
      ["The Autonomous AP requires three separate physical copper Ethernet cables—one access port per SSID.", "Instead of running separate physical cables per SSID, an Autonomous AP uses subinterfaces bridged to 802.1Q VLANs over a single trunk link."],
      ["The Autonomous AP uses VTP Server mode to push wireless SSID names into the Catalyst switch's `vlan.dat` file.", "VTP does not carry wireless SSIDs; the switch trunk simply carries standard 802.1Q-tagged Ethernet frames for VLANs 10, 20, and 30."]
    ],
    "An Autonomous AP contains both the data plane and control/management plane locally inside the AP. When multiple WLANs (SSIDs) are configured on an Autonomous AP, each SSID is mapped to a specific wired VLAN (via virtual Radio/Ethernet subinterfaces and Bridge Groups), requiring the connected Catalyst switch port to be configured as an **802.1Q trunk** allowing those VLANs.",
    "Autonomous AP = self-contained (no WLC, no CAPWAP), needs an **802.1Q trunk** on the switch port to carry multiple SSID VLANs.",
    []
  ),
  c27.s(
    "WLAN",
    "Medium",
    "How does a Cisco Mobility Express deployment provide centralized WLC management for a small-to-medium site without purchasing a dedicated physical WLC appliance or VM?",
    "One capable Cisco Access Point runs a virtual WLC software image internally alongside its AP radio functions to manage itself and up to 100 other APs.",
    [
      ["Every AP at the site connects directly to Cisco Meraki Cloud over TCP port 443 without any local controller logic.", "Connecting APs to a Cisco cloud dashboard describes the **Cisco Meraki Cloud-Based AP** architecture, whereas **Mobility Express** embeds the WLC function inside a master AP on the local LAN."],
      ["A Catalyst 2960 Layer 2 access switch acts as the CAPWAP controller for up to 500 APs across the WAN.", "Layer 2 Catalyst 2960 switches cannot terminate CAPWAP tunnels; Mobility Express runs the WLC controller process on a master AP."],
      ["Clients download a Mobility Express agent that coordinates channel assignments peer-to-peer without any controller.", "Mobility Express does not use client agents; it runs a real WLC software instance on one master AP (with automatic failover to a backup AP)."]
    ],
    "Cisco Mobility Express embeds the Wireless LAN Controller (WLC) function directly inside a capable Cisco Aironet/Catalyst Access Point. That master AP simultaneously services wireless clients AND acts as the CAPWAP controller for other Lightweight APs on the LAN, while another AP can act as a redundant standby controller if the master AP fails.",
    "Compare small-site wireless options: **Autonomous** = every AP managed separately; **Mobility Express** = WLC runs inside one local master AP; **Meraki Cloud** = WLC runs in Cisco's public cloud.",
    []
  ),
  c27.s(
    "WLAN",
    "Hard",
    "A wireless client roams from AP-1 (connected to WLC-1 in Subnet A, VLAN 10) to AP-2 (connected to WLC-2 in Subnet B, VLAN 20), and the client's application requires keeping its original VLAN 10 IPv4 address without interruption. How do WLC-1 and WLC-2 handle this Layer 3 Inter-Controller Roam?",
    "WLC-2 (the Foreign WLC) forms an Ethernet-over-IP (EoIP) or CAPWAP mobility tunnel back to WLC-1 (the Anchor WLC) so the client's traffic continues to egress on VLAN 10.",
    [
      ["WLC-2 forces the client to release its VLAN 10 IP address and run DHCP Discover on VLAN 20 while using NAT to preserve sessions.", "Releasing and changing the client's IP address breaks active TCP/VoIP sessions; Layer 3 roaming uses an Anchor-to-Foreign WLC tunnel to keep the original IP."],
      ["WLC-1 uses OSPF to inject a `/32` host route for the roaming client into the enterprise core pointing to WLC-2.", "Cisco WLCs do not inject per-client `/32` OSPF host routes on roams; they use Foreign-to-Anchor mobility tunneling."],
      ["AP-2 disconnects from WLC-2 and re-registers its CAPWAP tunnel across the WAN to WLC-1 for as long as the client is associated.", "AP-2 stays registered to its own controller (WLC-2); the two WLCs tunnel the roaming client's traffic between each other."]
    ],
    "In a Layer 3 Inter-Controller roam (where the new WLC's WLAN maps to a different IP subnet than the original WLC), the original controller (WLC-1) becomes the **Anchor WLC** and the new controller (WLC-2) becomes the **Foreign WLC**. WLC-2 tunnels the client's frames back to WLC-1 (via an EoIP or CAPWAP mobility tunnel) so the client keeps its original IP address and default gateway seamlessly.",
    "Layer 2 Roam = same VLAN/subnet (fast < 10 ms); Layer 3 Roam = different VLAN/subnet across WLCs -> uses **Foreign WLC** tunneling back to **Anchor WLC** so the client keeps its original IP!",
    []
  ),
  c27.s(
    "WLAN",
    "Hard",
    "Which Lightweight AP special-purpose mode disables both the 2.4-GHz and 5-GHz wireless radios completely and instead listens on a wired 802.1Q trunk port to correlate ARP packets with suspected rogue AP MAC addresses?",
    "Rogue Detector mode",
    [
      ["Monitor mode, which scans all 2.4-GHz and 5-GHz RF channels over the air without transmitting", "Monitor mode uses the AP's wireless radios to listen over the air and connects to an access port; Rogue Detector mode turns off the radios and listens on a wired trunk."],
      ["SE-Connect (Spectrum Expert Connect) mode, which detects non-802.11 RF interferers like microwaves", "SE-Connect uses the AP's CleanAir spectrum hardware to analyze RF interference over the air, not wired trunk ARP packets."],
      ["Bridge / Mesh mode, which dedicates the 5-GHz radio to wireless backhaul between buildings", "Bridge/Mesh mode uses the radios to form a wireless bridge between sites rather than monitoring a wired trunk for rogue ARP frames."]
    ],
    "A Lightweight AP placed in **Rogue Detector mode** turns off its wireless radios and connects to a wired **802.1Q trunk port** so it can hear wired ARP broadcasts across all VLANs. By comparing the MAC addresses heard on the wired network against the over-the-air rogue AP MAC addresses reported by Monitor/Local APs, the WLC determines whether a rogue AP is physically plugged into the company's wired LAN!",
    "Don't confuse **Monitor mode** (radios ON listening over the air for rogues/IDS; wired access port) with **Rogue Detector mode** (radios OFF; listens on a wired **trunk** port to see if a rogue AP is plugged into the enterprise LAN).",
    []
  ),
  c27.s(
    "WLAN",
    "Hard",
    "Where does a Cisco Embedded Wireless Controller (EWC) or Cloud-Based Meraki AP place the Wireless LAN Controller control plane compared to a traditional centralized WLC deployment?",
    "An Embedded WLC integrates the controller inside a Catalyst 9000 switch (or 9100 AP), while a Cloud-Based AP moves the management/control plane to Cisco's public cloud over TLS.",
    [
      ["Both architectures require a physical Cisco 5520/8540 WLC appliance in the data center to terminate all client data tunnels.", "Neither Embedded WLC nor Meraki Cloud APs require a dedicated physical 5520/8540 WLC appliance."],
      ["A Cloud-Based Meraki AP tunnels all local user data traffic through the Internet to the cloud controller before reaching local LAN servers.", "Cloud-managed Meraki APs keep only the management/control plane in the cloud; user data traffic is bridged locally at the AP directly onto the local LAN!"],
      ["An Embedded WLC requires every access switch port connected to an AP to run BGP peering with the WLC.", "Embedded WLCs use standard CAPWAP discovery and tunnels just like appliance/virtual WLCs, not BGP to APs."]
    ],
    "In an **Embedded WLC** architecture, the WLC software runs inside a Catalyst switch stack (or Catalyst 9100 AP) on the campus LAN. In a **Cloud-Based AP** (Cisco Meraki) architecture, the management/control plane lives in the Cisco Meraki Cloud (reached via HTTPS/TLS over the Internet), while the data plane stays local at the AP so client traffic goes straight onto the local wired LAN.",
    "Remember: Meraki Cloud APs send **management/control** traffic to the cloud, but switch **user data** traffic locally on the LAN!",
    []
  )
];

const c28 = mk("Security Fundamentals", 15, "v1c28");
const q28 = [
  c28.s(
    "Wireless security",
    "Easy",
    "How do WPA2-Personal (PSK) and WPA2-Enterprise (802.1X/EAP) differ in how wireless clients authenticate to the WLAN?",
    "WPA2-Personal authenticates all devices using a shared passphrase (PSK), whereas WPA2-Enterprise authenticates each user/device individually against a central AAA/RADIUS server using 802.1X/EAP.",
    [
      ["WPA2-Personal uses AES-CCMP encryption, whereas WPA2-Enterprise uses unencrypted cleartext frames after login.", "Both WPA2-Personal and WPA2-Enterprise use strong AES-CCMP encryption for data privacy; they differ in how authentication and key generation are performed."],
      ["WPA2-Personal requires a Cisco ISE RADIUS server, whereas WPA2-Enterprise stores a single static password on the AP.", "This is backwards: WPA2-Personal uses a static Pre-Shared Key (PSK) on the AP/WLC, while WPA2-Enterprise requires an 802.1X RADIUS server (such as Cisco ISE)."],
      ["WPA2-Personal operates only on 2.4-GHz channels, whereas WPA2-Enterprise operates only on 5-GHz channels.", "Both WPA2-Personal and WPA2-Enterprise work identically across 2.4-GHz and 5-GHz bands."]
    ],
    "Every Wi-Fi security generation (WPA, WPA2, WPA3) offers two authentication modes: **Personal** mode (also called Pre-Shared Key or PSK, where all clients and the AP/WLC share a single passphrase) and **Enterprise** mode (also called 802.1X mode, where the WLC acts as an authenticator forwarding Extensible Authentication Protocol [EAP] credentials to a central RADIUS server like Cisco ISE).",
    "Personal = Pre-Shared Key (PSK, home/small office); Enterprise = IEEE 802.1X + EAP + RADIUS server (corporate networks).",
    []
  ),
  c28.s(
    "Wireless security",
    "Easy",
    "Which encryption and message integrity protocol is mandated by the Wi-Fi Alliance for **WPA2**?",
    "AES-CCMP (Advanced Encryption Standard with Counter Mode CBC-MAC)",
    [
      ["TKIP (Temporal Key Integrity Protocol) with RC4 stream cipher", "TKIP with RC4 was the transitional encryption mechanism created for original **WPA** (and deprecated due to security weaknesses), whereas WPA2 mandates AES-CCMP."],
      ["WEP (Wired Equivalent Privacy) with a static 24-bit Initialization Vector", "WEP is a broken legacy 802.11 standard easily cracked in seconds due to its short 24-bit RC4 Initialization Vector (IV)."],
      ["DES-CBC with MD5 message authentication hashes", "Wi-Fi standards never used DES-CBC/MD5; WPA used TKIP/MIC, WPA2 uses AES-CCMP, and WPA3 uses AES-CCMP/GCMP."]
    ],
    "While legacy WEP used a vulnerable static RC4 key and original WPA used TKIP (Temporal Key Integrity Protocol, still based on RC4 with per-packet key mixing and a Michael MIC), **WPA2** (IEEE 802.11i) replaced RC4/TKIP entirely with **AES-CCMP** (Advanced Encryption Standard with Counter Mode plus Cipher Block Chaining Message Authentication Code Protocol).",
    "Memorize the encryption evolution: **WEP** = static RC4 (broken) -> **WPA** = TKIP/RC4 + MIC -> **WPA2** = **AES-CCMP** -> **WPA3** = **AES-CCMP / GCMP-256 + SAE + PMF**.",
    []
  ),
  c28.s(
    "Wireless security",
    "Easy",
    "In an IEEE 802.1X (WPA2/WPA3-Enterprise) wireless architecture, what are the formal 802.1X role names for the **Wireless Client**, the **WLC/AP**, and the **RADIUS Server**?",
    "Client = Supplicant; WLC/AP = Authenticator; RADIUS Server = Authentication Server",
    [
      ["Client = Authenticator; WLC/AP = Supplicant; RADIUS Server = Certificate Authority", "The client requesting access is always the **Supplicant**, and the WLC/switch controlling the port is the **Authenticator**."],
      ["Client = Enrollee; WLC/AP = Registrar; RADIUS Server = Supplicant", "Enrollee and Registrar are Wi-Fi Protected Setup (WPS) terms, not IEEE 802.1X roles."],
      ["Client = Relying Party; WLC/AP = Key Distribution Center; RADIUS Server = Broker", "In IEEE 802.1X, the three roles are strictly Supplicant (client), Authenticator (WLC/switch), and Authentication Server (RADIUS/ISE)."]
    ],
    "IEEE 802.1X port-based access control defines three distinct architectural roles: the **Supplicant** (the wireless client laptop/phone requesting network access), the **Authenticator** (the WLC—or Autonomous AP/switch—that blocks general data traffic until authentication succeeds and relays EAP frames), and the **Authentication Server** (the AAA RADIUS server, such as Cisco ISE, that validates credentials).",
    "802.1X Triad: **Supplicant** = Client; **Authenticator** = WLC / Switch; **Authentication Server** = RADIUS Server (Cisco ISE).",
    []
  ),
  c28.s(
    "Wireless security",
    "Medium",
    "What key security improvement does **WPA3-Personal** introduce to replace the vulnerable 4-way Pre-Shared Key (PSK) handshake of WPA2-Personal?",
    "Simultaneous Authentication of Equals (SAE), which prevents offline dictionary attacks and provides forward secrecy",
    [
      ["Protected Extensible Authentication Protocol (PEAP) with mandatory Active Directory integration", "PEAP is an 802.1X Enterprise authentication method, whereas SAE is the replacement for PSK in **WPA3-Personal**."],
      ["Rotating 40-bit WEP keys exchanged via Diffie-Hellman over UDP port 5246", "WPA3 never uses WEP or CAPWAP ports on client links; it uses SAE (Dragonfly key exchange) with 128-bit AES-CCMP."],
      ["Mandatory MAC address filtering stored in the WLC's local bridge table", "MAC filtering is trivial to spoof and is not part of WPA3; WPA3-Personal uses SAE and mandatory Protected Management Frames (PMF)."]
    ],
    "In WPA2-Personal, an attacker who captures the initial 4-way handshake can run an offline brute-force dictionary attack against the Pre-Shared Key (PSK) and decrypt all captured session traffic. **WPA3-Personal** replaces PSK with **Simultaneous Authentication of Equals (SAE)** (a Diffie-Hellman Dragonfly exchange) so each authentication generates a unique session key with **forward secrecy** and resists offline dictionary cracking.",
    "WPA3-Personal = **SAE** (Simultaneous Authentication of Equals) instead of PSK + mandatory **PMF (802.11w)**!",
    []
  ),
  c28.s(
    "Wireless security",
    "Medium",
    "Which IEEE 802.11 security feature—optional in WPA2 and **mandatory in WPA3**—prevents an attacker from disconnecting legitimate wireless clients by forging spoofed Deauthentication or Disassociation frames?",
    "Protected Management Frames (PMF / IEEE 802.11w)",
    [
      ["Temporal Key Integrity Protocol (TKIP) Sequence Counter (TSC)", "TKIP Sequence Counters protected data frames against replay in WPA, not unencrypted 802.11 management frames."],
      ["Wi-Fi Protected Setup (WPS) PIN verification", "WPS was a consumer push-button/PIN onboarding feature notorious for brute-force vulnerabilities, not management frame protection."],
      ["Opportunistic Wireless Encryption (OWE) for open guest portals", "OWE (Enhanced Open) encrypts data frames on open guest networks without a password, whereas **802.11w PMF** protects management frames like Deauth/Disassoc."]
    ],
    "Historically, 802.11 management frames (such as Deauthentication, Disassociation, and Action frames) were sent completely unencrypted and unauthenticated, allowing attackers to launch trivial deauth DoS or evil-twin attacks. **IEEE 802.11w Protected Management Frames (PMF)** encrypts and authenticates unicast and broadcast management frames after association, and is **mandatory in WPA3**.",
    "IEEE **802.11w = Protected Management Frames (PMF)** -> stops spoofed Deauth/Disassoc attacks (optional in WPA2, mandatory in WPA3).",
    []
  ),
  c28.t(
    "Wireless security",
    "Medium",
    "Match each 802.1X Extensible Authentication Protocol (EAP) method to its certificate requirements and credential mechanism.",
    [
      ["EAP-TLS", "Industry-standard method requiring digital certificates on BOTH the RADIUS server and every wireless client (mutual TLS)"],
      ["PEAP (Protected EAP)", "Uses a server-side digital certificate to build an outer TLS tunnel, then authenticates the client inside using MS-CHAPv2 username/password"],
      ["EAP-FAST", "Cisco-created method that uses Protected Access Credentials (PACs) instead of certificates to establish a TLS tunnel"],
      ["LEAP (Legacy Cisco)", "Deprecated Cisco method using vulnerable MS-CHAPv2 challenge/response without an outer TLS tunnel"]
    ],
    "In 802.1X wireless security, **LEAP** is obsolete because its MS-CHAPv2 exchange lacks a protective TLS tunnel; **EAP-FAST** uses PACs (Protected Access Credentials) for sites without a PKI; **PEAP** requires a digital certificate only on the Authentication Server (RADIUS) and uses username/password for clients inside the TLS tunnel; and **EAP-TLS** is the most secure method because it requires client AND server PKI certificates.",
    "EAP certificate rule: **EAP-TLS** = certificates on BOTH Server & Client (most secure); **PEAP** = certificate on Server ONLY + client password inside TLS; **EAP-FAST** = PACs (no certificates required).",
    []
  ),
  c28.s(
    "Wireless security",
    "Medium",
    "How does **WPA3-Enterprise** enhance cryptographic strength when its optional **192-bit security mode** is enabled for high-security government or financial networks?",
    "It enforces 256-bit GCMP (Galois/Counter Mode Protocol) encryption, 384-bit HMAC-SHA-384 key derivation, and 384-bit elliptic curve (ECDSA) TLS authentication.",
    [
      ["It combines three sequential 64-bit DES keys (3DES) with MD5 message integrity checks on every frame.", "3DES and MD5 are legacy algorithms; WPA3-Enterprise 192-bit mode uses modern Suite-B cryptography (AES-GCMP-256 and SHA-384)."],
      ["It requires clients to enter three separate Pre-Shared Keys (64 bits each) before joining the SSID.", "WPA3-Enterprise uses 802.1X/EAP-TLS authentication, not Pre-Shared Keys."],
      ["It disables encryption at Layer 2 and relies exclusively on an IPsec VPN client running on the endpoint.", "WPA3-Enterprise 192-bit mode provides native Layer 2 802.11 encryption using GCMP-256."]
    ],
    "WPA3-Enterprise uses AES-CCMP-128 by default (with mandatory 802.11w PMF), and offers an optional **192-bit minimum-strength cryptographic suite** aligned with CNSA / Suite B standards—using **GCMP-256** (Galois/Counter Mode Protocol with 256-bit AES keys) for data encryption and **384-bit SHA/ECDH/ECDSA** for key management and EAP-TLS authentication.",
    "WPA3 adds two modes worth knowing: **GCMP-256** (in WPA3-Enterprise 192-bit mode) and **OWE / Enhanced Open** (unauthenticated Diffie-Hellman encryption for open public Wi-Fi).",
    []
  ),
  c28.m(
    "Wireless security",
    "Hard",
    "An enterprise deploys an Open Guest WLAN with WebAuth (captive portal login page) alongside a corporate WPA2-Enterprise WLAN. Which statements accurately compare the Layer 2 wireless security of these two WLANs?",
    [
      "On a traditional Open + WebAuth WLAN, 802.11 association uses no Layer 2 encryption, so data frames sent over the air after web login are still unencrypted at Layer 2 unless OWE or HTTPS is used.",
      "On the WPA2-Enterprise WLAN, each client negotiates a unique Pairwise Transient Key (PTK) after 802.1X authentication so other authenticated clients on the same SSID cannot decrypt its unicast frames."
    ],
    [
      ["Completing a WebAuth captive portal login over HTTPS automatically enables AES-CCMP Layer 2 wireless encryption for all subsequent frames.", "WebAuth is a Layer 3/7 authentication gate on the WLC; if the WLAN has Layer 2 security set to None (Open), 802.11 frames over the air remain unencrypted at Layer 2!"],
      ["In WPA2-Enterprise, all clients associated to the same AP share a single encryption key for unicast frames, allowing any logged-in employee to sniff coworkers' traffic.", "Even in WPA2-Personal (and certainly in WPA2-Enterprise), the 4-way handshake derives a unique per-client **Pairwise Transient Key (PTK)** for unicast traffic; only broadcast/multicast uses the shared Group Temporal Key (GTK)."],
      ["WPA2-Enterprise transmits the user's Active Directory password in cleartext inside 802.11 beacon frames before the RADIUS server responds.", "802.1X methods like PEAP and EAP-TLS encapsulate credentials inside a TLS tunnel over EAPOL frames, never in beacons or cleartext."]
    ],
    "Traditional WebAuth (Layer 3 web policy) redirects a new client's browser to a login portal before permitting transit IP traffic, but does NOT turn on Layer 2 802.11 encryption (unless WPA3 **OWE / Enhanced Open** is used). Conversely, WPA2/WPA3-Enterprise authenticates via 802.1X/RADIUS and derives a unique per-client **PTK** for AES-CCMP unicast encryption and a shared **GTK** for broadcast/multicast.",
    "Remember: **PTK (Pairwise Transient Key)** encrypts unicast frames uniquely per client; **GTK (Group Temporal Key)** encrypts broadcast/multicast frames for all clients on that BSS.",
    []
  ),
  c28.s(
    "Wireless security",
    "Hard",
    "Why was Temporal Key Integrity Protocol (TKIP) introduced in original WPA instead of moving directly from WEP to AES-CCMP, and why is TKIP now disallowed on 802.11n/ac/ax high-throughput rates?",
    "TKIP was designed as a firmware-upgradeable wrapper around legacy WEP RC4 hardware, whereas AES-CCMP required new crypto coprocessor hardware.",
    [
      ["TKIP provided 512-bit encryption that was too CPU-intensive for modern gigabit Wi-Fi 6 Access Points.", "TKIP was actually weaker (128-bit RC4-based) than AES-CCMP and was deprecated by the IEEE due to cryptographic vulnerabilities."],
      ["AES-CCMP could not encrypt broadcast frames, so TKIP was created to encrypt multicast OSPF packets over Wi-Fi.", "AES-CCMP encrypts both unicast (via PTK) and broadcast/multicast (via GTK) frames."],
      ["TKIP was only compatible with 5-GHz 802.11a radios and could not run on 2.4-GHz 802.11b/g hardware.", "TKIP ran on both 2.4-GHz and 5-GHz legacy hardware via firmware updates."]
    ],
    "When WEP was broken in the early 2000s, existing Wi-Fi NICs and APs had hardware built specifically for the RC4 cipher and could not run AES without complete hardware replacement. The Wi-Fi Alliance created **WPA with TKIP** (adding a 48-bit IV/TSC, per-packet key mixing, and a 64-bit Michael Message Integrity Check) so existing hardware could be patched via firmware until **WPA2 (AES-CCMP)** hardware became universal.",
    "Never select TKIP or WEP when configuring a modern WLAN on the CCNA exam—always choose **WPA2 (AES)** or **WPA3 (AES/SAE)**!",
    []
  ),
  c28.s(
    "Wireless security",
    "Hard",
    "What is the purpose of **Opportunistic Wireless Encryption (OWE)**, also marketed as **Wi-Fi Certified Enhanced Open**, introduced alongside WPA3?",
    "It provides individualized AES wireless encryption on open public/guest networks without requiring users to enter a password, using an unauthenticated Diffie-Hellman key exchange.",
    [
      ["It allows a WPA2-Enterprise network to fall back to static WEP whenever the corporate RADIUS server is unreachable.", "OWE never falls back to WEP; it encrypts open guest networks using Diffie-Hellman and AES."],
      ["It shares a single public Pre-Shared Key printed in the AP's beacon frame so every client derives the same encryption key.", "If all clients derived the same key from a public beacon, anyone could decrypt everyone's traffic; OWE performs a per-client Diffie-Hellman exchange so each client gets its own unique encryption key!"],
      ["It replaces 802.1X certificates in government networks with biometric fingerprint scans on the WLC.", "OWE is specifically for open/public networks (coffee shops, airports, guest Wi-Fi) where no authentication credentials exist."]
    ],
    "On traditional Open Wi-Fi networks, all over-the-air traffic is sent in cleartext. **Opportunistic Wireless Encryption (OWE / Enhanced Open)** solves passive eavesdropping on public/guest networks by performing an automatic, unauthenticated Diffie-Hellman key exchange during association (plus Protected Management Frames), giving each client its own unique AES-encrypted Layer 2 session without prompting for any password.",
    "**OWE (Enhanced Open)** = passwordless open Wi-Fi that STILL encrypts each client's wireless traffic over the air via Diffie-Hellman!",
    []
  )
];

const c29 = mk("Network Access", 20, "v1c29");
const q29 = [
  c29.s(
    "WLAN",
    "Easy",
    "On a Cisco Wireless LAN Controller (WLC), which logical interface is used for normal in-band management traffic (such as GUI/HTTPS, SSH, SNMP, and RADIUS communication) and for terminating CAPWAP tunnels?",
    "Management interface",
    [
      ["Service-Port interface, which carries CAPWAP tunnels and RADIUS traffic over the main trunk", "The Service-Port is a dedicated out-of-band recovery/management Ethernet port on a separate subnet and CANNOT carry CAPWAP or 802.1Q dynamic VLAN traffic."],
      ["Virtual interface, which terminates SSH and SNMP sessions for the WLC administrator", "The Virtual interface (typically a fictitious IP like `192.0.2.1`) is used solely for client DHCP relay and WebAuth mobility redirects, not administrator SSH/GUI access."],
      ["Redundancy Management interface, which maps each WLAN SSID to a wired client VLAN", "Dynamic Interfaces map WLANs to wired client VLANs; the Management interface handles in-band WLC administration and CAPWAP termination."]
    ],
    "A Cisco WLC (AirOS) defines five primary logical interface types: (1) **Management Interface** (used for in-band GUI/SSH/SNMP management, WLC-to-WLC mobility, RADIUS authentication, and terminating CAPWAP tunnels in modern IOS/AirOS), (2) **Redundancy Management**, (3) **Service-Port** (out-of-band management port), (4) **Virtual Interface** (used for client DHCP relay and WebAuth redirect), and (5) **Dynamic Interfaces** (VLAN interfaces mapping WLANs to wired subnets).",
    "Know the 3 most-tested WLC interfaces: **Management** = in-band admin + CAPWAP + RADIUS; **Service-Port** = out-of-band admin; **Dynamic Interface** = maps a WLAN (SSID) to a wired 802.1Q VLAN!",
    []
  ),
  c29.s(
    "WLAN",
    "Easy",
    "In the Cisco WLC GUI, what must an administrator create under **Controller > Interfaces** before creating a new Employee WLAN that places wireless clients onto wired VLAN 20?",
    "A Dynamic Interface configured with VLAN Identifier 20, an IPv4 address/mask in VLAN 20, and VLAN 20's DHCP server IP",
    [
      ["A new Virtual Interface assigned to VLAN 20 with port security enabled", "A WLC has only one fixed Virtual Interface; each client VLAN requires its own **Dynamic Interface** under Controller > Interfaces."],
      ["A static route pointing `0.0.0.0/0` to the Lightweight AP's access VLAN", "Mapping an SSID to a wired client VLAN on a WLC is done by creating a Dynamic Interface for that VLAN and binding the WLAN to it."],
      ["A new Service-Port subinterface tagged with 802.1Q VLAN 20", "The physical Service-Port does not support 802.1Q trunking or client VLANs; Dynamic Interfaces are bound to the WLC's distribution system **Ports** (1, 2, or LAG)."]
    ],
    "On a Cisco WLC, each wireless LAN (SSID) is connected to a wired enterprise VLAN by binding the WLAN to a **Dynamic Interface** (created under `Controller > Interfaces`). Each Dynamic Interface specifies its physical Port (or LAG), **VLAN ID** (e.g., 20), **IP Address/Netmask/Gateway** on that subnet, and **Primary/Secondary DHCP Server** IP addresses.",
    "On a Cisco WLC: 1 wired client VLAN = 1 **Dynamic Interface** (with VLAN ID + IP + Gateway + DHCP Server IP); then bind the **WLAN** to that Dynamic Interface!",
    []
  ),
  c29.s(
    "WLAN",
    "Easy",
    "When configuring Link Aggregation (LAG) across multiple physical distribution ports on a Cisco WLC connected to a Catalyst switch, how must the WLC and Catalyst switch be configured?",
    "Enable LAG globally on the WLC (which uses static `mode on` bundling and requires a WLC reboot) and configure an 802.1Q trunk EtherChannel (`channel-group <n> mode on`) on the switch.",
    [
      ["Configure PAgP `mode desirable` on the WLC and `mode auto` on the Catalyst switch ports", "Cisco WLCs (AirOS) do not support Cisco-proprietary PAgP negotiation on their distribution ports; they use unconditional `mode on` LAG."],
      ["Configure each WLC physical port in a separate access VLAN without creating a PortChannel on the switch", "When WLC LAG is enabled, all participating WLC distribution ports bundle into a single logical trunk and MUST connect to an matching 802.1Q trunk PortChannel on the switch."],
      ["Assign a separate Management IP address to each physical port on the WLC before enabling LAG", "Enabling LAG on a WLC combines all physical distribution ports into one logical port (Port 1 / LAG), so all Dynamic and Management interfaces automatically bind to the single LAG."]
    ],
    "A Cisco WLC supports bundling its physical distribution system ports into a single **Link Aggregation Group (LAG)** for high availability and load balancing. Enabling LAG on an AirOS WLC (`Controller > General > LAG Mode on next reboot`) requires a WLC reboot, automatically assigns all WLC logical interfaces to the single LAG, and requires the connected Catalyst switch ports to be bundled in an 802.1Q trunk EtherChannel (`mode on`).",
    "WLC LAG facts: (1) bundles all WLC distribution ports into ONE logical trunk, (2) requires a **WLC reboot** when toggled, and (3) pairs with `channel-group <n> mode on` + `switchport mode trunk` on the switch!",
    []
  ),
  c29.s(
    "WLAN",
    "Medium",
    "In the Cisco WLC GUI (`WLANs > Create New`), an engineer configures a new WLAN with Profile Name `Corp_Emp`, SSID `CorpWiFi`, and ID `2`, and clicks Apply. Why can't wireless clients see or connect to `CorpWiFi` yet?",
    "Newly created WLANs on a Cisco WLC have their **Status** checkbox unchecked (Disabled) by default and must be explicitly checked (Enabled) on the General tab.",
    [
      ["The Profile Name and the SSID must be 100% identical character-for-character or the WLC suppresses beacons.", "Profile Name (internal label for the admin) and SSID (broadcast network name for clients) can be completely different strings."],
      ["A WLC can only broadcast one WLAN SSID per physical distribution port unless LAG is disabled.", "A single WLC distribution port or LAG trunk can carry dozens of WLANs mapped to different Dynamic Interface VLANs."],
      ["Only WLAN ID 1 is allowed to broadcast its SSID; WLAN IDs 2 through 16 are restricted to hidden SSIDs.", "WLAN IDs 1 through 16 (and up to 512 on large WLCs) can all broadcast their SSIDs once enabled."]
    ],
    "When you create a new WLAN on a Cisco WLC (`WLANs > Create New > Go`), the WLC initially leaves the WLAN **Status** unchecked (`Disabled`) and `Broadcast SSID` enabled so you can finish configuring the Interface mapping (`General` tab), Security (`Security` tab), and QoS (`QoS` tab) before turning the radio signal live on APs by checking **Status: Enabled**.",
    "Classic WLC GUI troubleshooting question: if a WLAN has the right SSID, Dynamic Interface, and WPA2 settings in a screenshot, look at the top of the **General** tab—is **Status: [ ] Enabled** unchecked (or is **Broadcast SSID** unchecked)?",
    []
  ),
  c29.s(
    "WLAN",
    "Medium",
    "Before configuring a WLAN on a Cisco WLC to use **WPA2-Enterprise (802.1X)** security, where in the WLC GUI must the administrator first define the IPv4 address, UDP port (1812), and shared secret of the external RADIUS server?",
    "Under **Security > AAA > RADIUS > Authentication**, then select it on the WLAN's **Security > AAA Servers** tab.",
    [
      ["Under **Controller > Interfaces > Virtual**, by typing the RADIUS server IP into the Primary DHCP Server field.", "The Virtual and Dynamic interfaces configure DHCP servers for IP leases, not RADIUS authentication servers."],
      ["Under **Wireless > Access Points > Global Configuration**, by entering the RADIUS key directly into the AP's flash memory.", "In a centralized WLC deployment, the WLC (Authenticator) communicates with the RADIUS server centrally under **Security > AAA > RADIUS > Authentication**."],
      ["Under **Management >HTTP-HTTPS**, by uploading the RADIUS server's pre-shared key as a web admin SSL certificate.", "Management > HTTP-HTTPS controls administrative GUI access to the WLC itself, not WLAN client 802.1X authentication."]
    ],
    "To enable WPA2/WPA3-Enterprise on a Cisco WLC WLAN: (1) navigate to **Security > AAA > RADIUS > Authentication** and add the RADIUS server's IP address, shared secret, and port (1812), (2) edit the WLAN (`WLANs > <id>`) on the **Security > Layer 2** tab to select `WPA+WPA2`, check `WPA2 Policy` + `AES`, and check **`802.1X`** under Authentication Key Management, and (3) on the WLAN's **Security > AAA Servers** tab, select the configured RADIUS server.",
    "Know the WLC Security tab difference: **WPA2-Personal** = check `PSK` under Authentication Key Management and type the ASCII pre-shared key; **WPA2-Enterprise** = check `802.1X` and select the RADIUS server on the **AAA Servers** sub-tab!",
    []
  ),
  c29.t(
    "WLAN",
    "Medium",
    "Match each Cisco WLC QoS Profile level (configured on a WLAN's **QoS** tab) to its intended traffic class and maximum 802.1p/DSCP priority.",
    [
      ["Platinum", "Voice over IP (VoIP) — highest priority (Expedited Forwarding / CoS 5-6)"],
      ["Gold", "Interactive & Streaming Video — high priority (Assured Forwarding / CoS 4)"],
      ["Silver", "Best Effort (Default) — standard corporate data traffic (CoS 0 / DSCP 0)"],
      ["Bronze", "Background — lowest priority (guest Wi-Fi, bulk backups, scavengers; CoS 1)"]
    ],
    "A Cisco WLC abstracts complex QoS markings on each WLAN into four metal-themed QoS profiles on the WLAN's **QoS** tab: **Platinum** (Voice, highest priority), **Gold** (Video), **Silver** (Best Effort data, the default for new WLANs), and **Bronze** (Background/Guest, lowest priority).",
    "Memorize the 4 WLC QoS profiles from highest to lowest priority: **Platinum = Voice**, **Gold = Video**, **Silver = Best Effort (Default)**, **Bronze = Background**!",
    []
  ),
  c29.m(
    "WLAN",
    "Medium",
    "An administrator wants to configure a WLAN on a Cisco WLC to support **WPA3-Personal** security. Which configuration requirements must be met in the WLC GUI under the WLAN's **Security > Layer 2** tab?",
    [
      "Enable `WPA3 Policy` with `AES` encryption and set Protected Management Frames (**PMF / 802.11w**) to **Required**.",
      "Under Authentication Key Management, enable **SAE** (Simultaneous Authentication of Equals) and configure the ASCII passphrase."
    ],
    [
      ["Enable `TKIP` encryption alongside `WPA3 Policy` and set PMF (802.11w) to `Disabled`.", "WPA3 strictly forbids legacy TKIP and requires AES along with mandatory (`Required`) 802.11w Protected Management Frames (PMF)."],
      ["Check `802.1X` under Authentication Key Management and leave `SAE` unchecked.", "`802.1X` is used for WPA2/WPA3-**Enterprise**; WPA3-**Personal** uses **SAE**."],
      ["Set Layer 2 Security to `None` and configure a Pre-Shared Key on the Layer 3 Web Policy tab.", "Setting Layer 2 Security to `None` creates an unencrypted Open WLAN, not a WPA3-Personal WLAN."]
    ],
    "Configuring **WPA3-Personal** on a Cisco WLC (`WLANs > <id> > Security > Layer 2`) requires three specific settings: (1) Layer 2 Security = `WPA2+WPA3` (or `WPA3`), with `WPA3 Policy` and `AES` checked, (2) **PMF (802.11w)** set to `Required` (or `Optional` if running transition mode `WPA2+WPA3` with both `PSK` and `SAE`), and (3) **SAE** checked under Authentication Key Management with the passphrase entered.",
    "WPA3-Personal on WLC GUI checklist: `WPA3 Policy` + `AES` + `PMF = Required` + `Auth Key Mgmt = SAE`!",
    []
  ),
  c29.s(
    "WLAN",
    "Hard",
    "An engineer connects a Cisco WLC's Port 1 to Catalyst Switch SW1's GigabitEthernet1/0/1. The WLC has a Management interface in VLAN 10 (`10.10.10.5/24`), a Staff Dynamic interface in VLAN 20 (`10.10.20.5/24`), and a Guest Dynamic interface in VLAN 30 (`10.10.30.5/24`). How must SW1's GigabitEthernet1/0/1 interface be configured?",
    "As an 802.1Q trunk port (`switchport mode trunk`) allowing VLANs 10, 20, and 30 (matching the WLC Management interface's untagged/tagged VLAN setting)",
    [
      ["As a Layer 2 access port (`switchport mode access`, `switchport access vlan 10`) since CAPWAP tunnels carry VLANs 20 and 30.", "While the **AP-to-switch** port is an access port, the **WLC-to-switch** port must carry tagged traffic for VLANs 10, 20, and 30 onto the wired network and MUST be an **802.1Q trunk**!"],
      ["As a Layer 3 routed port (`no switchport`) with secondary IP addresses in VLANs 10, 20, and 30.", "A WLC bridges each WLAN to its corresponding 802.1Q VLAN tag on the distribution port, requiring a Layer 2 802.1Q trunk on the connected switch."],
      ["As a PortFast-enabled access port with `spanning-tree bpduguard enable` in VLAN 1.", "Configuring the WLC port as an access port in VLAN 1 prevents tagged frames for VLANs 10, 20, and 30 from reaching their respective subnets and default gateways."]
    ],
    "When a Lightweight AP in Local Mode forwards wireless client frames inside a CAPWAP tunnel to the WLC, the WLC decapsulates the 802.11 frame, translates it to an 802.3 Ethernet frame, tags it with the **802.1Q VLAN ID** of the WLAN's **Dynamic Interface** (VLAN 20 or VLAN 30), and sends it out the WLC's distribution port onto the Catalyst switch. Therefore, the switch port connected to the **WLC** MUST be configured as an **802.1Q Trunk** allowing the WLC Management VLAN and all Dynamic Interface VLANs!",
    "Never confuse the two switch ports in a WLC topology: Switch port to **Local Mode AP** = **Access Port**; Switch port to **WLC** = **802.1Q Trunk Port**!",
    ["switchport mode trunk", "switchport trunk allowed vlan"]
  ),
  c29.s(
    "WLAN",
    "Hard",
    "On the **Advanced** tab of a WLAN configuration in the Cisco WLC GUI, what is the effect of checking **FlexConnect Local Switching** and **FlexConnect Local Auth**?",
    "APs in FlexConnect mode bridge wireless client traffic for that WLAN directly onto the local branch VLAN instead of tunneling it back to the central WLC over the WAN.",
    [
      ["It converts all Lightweight APs in the enterprise into standalone Autonomous APs and deletes the WLC configuration.", "FlexConnect APs remain centrally managed by the WLC via CAPWAP Control (UDP 5246); only client data for that WLAN is switched locally at the branch."],
      ["It forces all wireless client traffic on that WLAN to be encrypted with DTLS inside the CAPWAP Data tunnel to HQ.", "Enabling FlexConnect Local Switching bypasses the CAPWAP Data tunnel to HQ so branch traffic stays on the local branch LAN."],
      ["It disables 802.11 beacons on 2.4-GHz radios so clients can only associate on 5-GHz channels.", "Steering clients to 5 GHz is called **Band Select**; FlexConnect Local Switching controls whether client data is switched locally at the branch AP or centrally at the WLC."]
    ],
    "For each WLAN on a Cisco WLC (`WLANs > <id> > Advanced`), **FlexConnect Local Switching** is disabled by default (meaning traffic is centrally switched at the WLC). Checking **FlexConnect Local Switching** instructs FlexConnect-mode APs at remote branches to bridge client traffic for that SSID directly onto the local branch switch trunk VLAN—and checking **FlexConnect Local Auth** allows those APs to continue authenticating clients locally if the WAN link to the WLC goes down.",
    "On a WLAN's **Advanced** tab: Default = **Central Switching** (traffic goes to WLC); Checked = **FlexConnect Local Switching** (branch AP switches traffic locally onto the branch LAN).",
    []
  ),
  c29.s(
    "WLAN",
    "Hard",
    "An administrator wants to secure administrative access to a Cisco WLC itself so network engineers can manage the WLC ONLY via encrypted HTTPS (GUI) and SSH (CLI), while blocking unencrypted HTTP and Telnet. Where are these settings configured in the WLC GUI?",
    "Under the **Management** menu (`Management > HTTP-HTTPS` and `Management > Telnet-SSH`)",
    [
      ["Under **WLANs > Security > Layer 3**, by selecting HTTPS and SSH in the Web Policy drop-down", "The `WLANs` menu configures wireless network access for end-user Wi-Fi clients, whereas the **`Management`** menu controls administrative access to the WLC itself!"],
      ["Under **Wireless > 802.11a/n/ac > Network**, by disabling unencrypted management frames", "The `Wireless` menu configures AP radio parameters and 802.11 data rates, not administrative HTTP/HTTPS/Telnet/SSH access to the WLC."],
      ["Under **Controller > Mobility Management > Mobility Group**, by enabling DTLS management encryption", "Mobility Groups configure inter-WLC roaming, whereas administrative GUI/CLI protocols (HTTP, HTTPS, Telnet, SSH) are configured under the **Management** tab."]
    ],
    "In the Cisco WLC GUI, keep the top-level menu tabs distinct: **Monitor** displays dashboards and client statistics; **WLANs** configures SSIDs and client security; **Controller** configures WLC interfaces, DHCP, and mobility; **Wireless** configures APs and radios; **Security** configures RADIUS/TACACS+ AAA servers and ACLs; and **Management** configures administrative access to the WLC itself (`HTTP-HTTPS`, `Telnet-SSH`, `SNMP`, `Local Management Users`).",
    "Memorize the WLC GUI top-bar tabs: **WLANs** = SSIDs; **Controller** = Dynamic/Mgmt Interfaces; **Wireless** = APs & 802.11a/b radios; **Security** = RADIUS/TACACS+ servers; **Management** = WLC Admin (HTTP/HTTPS, Telnet/SSH, SNMP)!",
    []
  )
];

export default [
  ...q19,
  ...q20,
  ...q21,
  ...q22,
  ...q23,
  ...q24,
  ...q25,
  ...q26,
  ...q27,
  ...q28,
  ...q29
];
