import { mk } from "../build.js?v=78";

// ============================================================================
// v2c11: Quality of Service (QoS)
// ============================================================================
const c11 = mk("IP Services", 10, "v2c11");
const q11 = [
  c11.s(
    "QoS",
    "Easy",
    "Which QoS traffic characteristic measures the variation in one-way delay between consecutive packets belonging to the same application flow?",
    "Packet jitter",
    [
      ["Average latency", "Latency (or delay) measures the total one-way or round-trip transit time of a packet rather than the variation between consecutive packets."],
      ["Link bandwidth", "Bandwidth measures the link capacity in bits per second rather than timing differences between consecutive packets."],
      ["Tail drop rate", "Tail drop is a packet loss condition caused by a full output queue rather than a measure of delay variation."]
    ],
    "Jitter is the variation in one-way delay between consecutive packets sent by the same application. If consecutive packets experience one-way delays of 120 ms, 135 ms, and 155 ms, the flow experiences 15 ms and then 20 ms of jitter.",
    "Remember: Delay is how long a packet takes; jitter is how much that delay changes from packet to packet.",
    []
  ),
  c11.s(
    "QoS",
    "Easy",
    "According to Cisco QoS design guidelines for interactive Voice over IP (VoIP) traffic, what are the maximum acceptable thresholds for one-way delay, jitter, and packet loss?",
    "150 ms one-way delay, 30 ms jitter, and 1% packet loss",
    [
      ["400 ms one-way delay, 50 ms jitter, and 1% packet loss", "A 200-400 ms one-way delay and 30-50 ms jitter range corresponds to video tolerances rather than interactive voice."],
      ["30 ms one-way delay, 150 ms jitter, and 0.1% packet loss", "This swaps the numerical values for one-way delay (150 ms) and jitter (30 ms)."],
      ["100 ms one-way delay, 10 ms jitter, and 5% packet loss", "A 5% packet loss rate causes severe audio dropouts; interactive voice requires 1% or less packet loss."]
    ],
    "Interactive voice calls are highly sensitive to latency, delay variation, and drops. Cisco's Enterprise QoS Solution Reference Network Design Guide specifies 150 ms or less one-way delay, 30 ms or less jitter, and 1% or less packet loss.",
    "Memorize the voice QoS triad for the exam: 150 ms delay, 30 ms jitter, 1% loss.",
    []
  ),
  c11.s(
    "QoS",
    "Easy",
    "Which QoS marking field consists of 3 bits located inside the IEEE 802.1Q header and is preserved only while frames traverse VLAN trunks?",
    "IEEE 802.1p Class of Service (CoS)",
    [
      ["Differentiated Services Code Point (DSCP)", "DSCP is a 6-bit field inside the IPv4 ToS byte and IPv6 Traffic Class byte that travels end-to-end with the IP header."],
      ["IPv4 Header IP Precedence (IPP)", "IP Precedence is a legacy 3-bit field inside the IPv4 header rather than the Ethernet 802.1Q trunking header."],
      ["MPLS Label Experimental Bits (EXP)", "MPLS EXP is a 3-bit field inside an MPLS label header used across MPLS WAN links rather than 802.1Q trunks."]
    ],
    "The Class of Service (CoS) field, also called Priority Code Point (PCP) in IEEE 802.1p, occupies 3 bits in the 4-byte 802.1Q tag. Because the 802.1Q header exists only on trunk links, CoS markings do not survive across non-trunked or routed hops.",
    "CoS = 3 bits in 802.1Q (Layer 2 trunk only); DSCP = 6 bits in IPv4/IPv6 (end-to-end Layer 3).",
    []
  ),
  c11.s(
    "QoS",
    "Easy",
    "By default, which DiffServ DSCP markings does a Cisco IP Phone apply to its own outbound voice payload packets and voice call signaling packets?",
    "EF (decimal 46) for voice payload and CS3 (decimal 24) for call signaling",
    [
      ["AF41 (decimal 34) for voice payload and EF (decimal 46) for call signaling", "AF41 is recommended for interactive video conferencing, whereas EF is used for real-time voice payload."],
      ["CS5 (decimal 40) for voice payload and AF21 (decimal 18) for call signaling", "AF21 is typically used for low-latency transactional data, while Cisco IP Phones default to EF and CS3."],
      ["CS7 (decimal 56) for voice payload and CS0 (decimal 0) for call signaling", "CS6 and CS7 are reserved for network control traffic, and CS0 is best-effort default data."]
    ],
    "Voice payload packets require strict low latency, low jitter, and low loss, so Cisco IP Phones mark them with Expedited Forwarding (EF, decimal 46) by default. Call setup and signaling packets do not carry real-time audio and are marked with Class Selector 3 (CS3, decimal 24).",
    "Voice payload = EF (46); Voice signaling = CS3 (24); Interactive video = AF41 (34).",
    []
  ),
  c11.s(
    "QoS",
    "Medium",
    "A campus access switch connects to a desktop PC that is daisy-chained through a Cisco IP Phone. Where should the QoS trust boundary typically be established on this access link?",
    "At the Cisco IP Phone, letting the phone mark or rewrite CoS and DSCP values on traffic from the attached PC",
    [
      ["At the desktop PC network interface card, trusting whatever DSCP and CoS values the user operating system sets", "End-user PCs are untrusted because users or applications could mark ordinary traffic as EF (46) to hijack priority queues."],
      ["At the distribution layer router interface, leaving all access layer frames unmarked across the campus trunks", "Best practice places the trust boundary as close to the ingress edge as possible so access and distribution switches can prioritize traffic."],
      ["At the WAN edge router egress interface to classify and mark all frames after they cross the campus LAN", "LAN switches support hardware QoS classification and marking, and waiting until the WAN edge leaves LAN trunks unprotected."]
    ],
    "The QoS trust boundary should sit at the first device under IT control. When a Cisco IP Phone is present at the access layer, the switch instructs the phone on how to mark voice traffic and overwrite untrusted markings coming from the attached PC.",
    "No IP Phone = trust boundary at the ingress access switch; With IP Phone = trust boundary at the IP Phone.",
    []
  ),
  c11.s(
    "QoS",
    "Medium",
    "Within the DiffServ Assured Forwarding (AF) model, how does a router treat packets marked with AF21 (decimal 18) compared to packets marked with AF23 (decimal 22)?",
    "Both are placed into the same AF2 class queue, but AF23 is given a higher WRED drop probability than AF21",
    [
      ["AF23 is placed into a higher-priority queue than AF21, while both share the exact same congestion drop probability", "In AFxy notation, X (2) identifies the queue and Y (1 vs 3) identifies the drop preference, not the queue number."],
      ["Both are placed into the same AF class queue (queue 2), but AF21 is dropped more aggressively than AF23", "A lower Y value in AFxy indicates a better (lower) drop probability, so AF21 is protected while AF23 is dropped first."],
      ["AF21 is scheduled using strict priority queuing (LLQ), whereas AF23 is scheduled using weighted round-robin", "Assured Forwarding defines four queues and three drop levels for congestion avoidance; EF is the marking associated with LLQ."]
    ],
    "Assured Forwarding (RFC 2597) defines 12 DSCP values formatted as AFxy, where X (1 to 4) specifies one of four queues and Y (1 to 3) specifies the drop preference within that queue. AF21 and AF23 share queue 2, with Y=1 receiving the lowest (best) drop probability and Y=3 receiving the highest (worst) drop probability.",
    "In AFxy (decimal 8x + 2y): X = Queue (1-4), Y = Drop probability (1 = lowest drop risk, 3 = highest drop risk).",
    []
  ),
  c11.s(
    "QoS",
    "Medium",
    "Which Cisco QoS classification feature inspects packet payloads and application signatures beyond Layer 3 and Layer 4 headers to distinguish traffic such as WebEx video from surveillance camera video?",
    "Network Based Application Recognition (NBAR2)",
    [
      ["Class-Based Weighted Fair Queuing (CBWFQ)", "CBWFQ is an egress queue scheduling mechanism that guarantees minimum bandwidth to traffic classes rather than a deep-packet classifier."],
      ["Extended IPv4 and IPv6 Access Control Lists (ACLs)", "Extended ACLs match only Layer 3 and Layer 4 header fields such as IP addresses and TCP/UDP ports, not application signatures."],
      ["Weighted Random Early Detection (WRED)", "WRED is a congestion avoidance drop mechanism that monitors queue depth rather than an application-layer packet classifier."]
    ],
    "Many modern applications dynamically negotiate ports or tunnel over HTTP/HTTPS, making standard 5-tuple ACL matching insufficient. Cisco NBAR2 (next-generation NBAR) uses deep packet inspection and application signatures to recognize over 1,000 application subcategories.",
    "When a question mentions matching specific applications (WebEx, FaceTime, Netflix, Cisco IP camera) rather than ports, think NBAR/NBAR2.",
    ["match protocol attribute category voice-and-video"]
  ),
  c11.s(
    "QoS",
    "Medium",
    "An enterprise router uses Class-Based Weighted Fair Queuing (CBWFQ) with Low Latency Queuing (LLQ) enabled on its voice queue. Why does LLQ apply an internal policer to the priority queue?",
    "To cap the priority queue bandwidth during congestion so excessive priority traffic cannot starve the remaining queues",
    [
      ["To buffer excess voice packets in a secondary shaping queue so that no voice packets are ever dropped", "Policing does not buffer or delay packets in a shaping queue; it drops or remarks traffic exceeding the policed rate."],
      ["To guarantee that the priority queue receives at least its configured minimum bandwidth and can borrow unused link capacity", "CBWFQ non-priority queues receive a minimum guarantee that can burst higher; LLQ policing enforces a strict maximum ceiling during congestion."],
      ["To trigger TCP window halving on voice streams whenever the priority queue depth crosses the minimum threshold", "Voice uses UDP/RTP rather than TCP windowing, and queue threshold drops describe congestion avoidance (WRED), not LLQ policing."]
    ],
    "Because an LLQ scheduler always services the priority queue before any round-robin queues, a flood of priority traffic could consume 100% of link capacity and cause queue starvation for all other traffic. LLQ polices the priority queue to a maximum bandwidth ceiling during congestion, discarding excess priority traffic.",
    "CBWFQ bandwidth = minimum guarantee; LLQ priority bandwidth = policed maximum ceiling (to prevent queue starvation).",
    []
  ),
  c11.s(
    "QoS",
    "Medium",
    "An enterprise WAN edge router connects via a 1-Gbps fiber Ethernet access link to a Metro Ethernet service provider that enforces a 200-Mbps Committed Information Rate (CIR). Where should shaping and policing be applied?",
    "Configure egress shaping to 200 Mbps on the enterprise router while the service provider polices ingress to 200 Mbps",
    [
      ["Configure ingress shaping to 200 Mbps on the enterprise router, while the service provider shapes egress traffic to 1 Gbps", "Shaping is an outbound (egress) queuing mechanism, not an inbound mechanism, and the CIR limit is 200 Mbps."],
      ["Configure egress policing to 200 Mbps on the enterprise router so excess packets are held in queues until bandwidth is free", "Policing immediately drops or remarks excess traffic rather than holding packets in queues."],
      ["Configure egress shaping to 1 Gbps on the enterprise router, while the service provider polices ingress traffic to 1 Gbps", "Setting the shaper and policer to the 1-Gbps physical line rate fails to enforce the contracted 200-Mbps CIR."]
    ],
    "Because the physical interface runs at 1 Gbps while the contracted CIR is 200 Mbps, the service provider polices incoming traffic from the customer at 200 Mbps (dropping or remarking excess packets). To avoid provider drops, the enterprise router shapes outbound traffic to 200 Mbps by queuing bursts and releasing them at the CIR.",
    "Enterprise egress = Shape to CIR (queues excess); Service Provider ingress = Police to CIR (drops/remarks excess).",
    []
  ),
  c11.s(
    "QoS",
    "Hard",
    "A router has a 1-Gbps WAN interface shaped to a 200-Mbps CIR. If the shaper time interval (Tc) is set to 10 ms to support real-time voice, how many bits does the shaper send per interval, and how long does the interface rest during each 10-ms interval?",
    "It sends 2 million bits at 1 Gbps for 2 ms, then rests for 8 ms",
    [
      ["It sends 20 million bits at 1 Gbps for 20 ms, then rests for 80 ms", "Sending for 20 ms and resting for 80 ms corresponds to a 100-ms time interval (Tc = 100 ms), which adds too much jitter for voice."],
      ["It sends 200 million bits at 1 Gbps for 200 ms, then rests for 800 ms", "Sending for 200 ms and resting for 800 ms corresponds to a 1-second (1000-ms) time interval."],
      ["It sends 2 million bits at 200 Mbps continuously for the entire 10 ms with 0 ms of rest", "A physical 1-Gbps interface always clocks bits onto the wire at 1 Gbps; shaping achieves a 200-Mbps average by sending at line rate for 20% of Tc and pausing for 80% of Tc."]
    ],
    "A shaper achieves a 200-Mbps rate over a 1-Gbps link by transmitting at line rate (1 Gbps) for 20% of each time interval (Tc) and pausing for 80% of Tc. With the recommended 10-ms Tc for voice and video, 20% of 10 ms is 2 ms of transmission (2 million bits) followed by 8 ms of silence.",
    "For voice/video over shaped links, keep Tc <= 10 ms so priority packets wait at most 8-10 ms between bursts.",
    []
  ),
  c11.s(
    "QoS",
    "Hard",
    "A WAN router uses CBWFQ with three round-robin queues and one LLQ priority queue:\n- LLQ Priority: Voice (UDP/RTP, DSCP EF)\n- Queue 1: Video streaming (UDP, DSCP AF31)\n- Queue 2: Enterprise ERP & Web (TCP, DSCP AF21/AF22/AF23)\n- Queue 3: Bulk file transfers (TCP, DSCP AF11/AF12/AF13)\nOn which queues should congestion avoidance (such as WRED) be enabled to prevent tail drop?",
    "Queue 2 and Queue 3 only, because they carry TCP flows that reduce their sending rate when individual segments are dropped",
    [
      ["LLQ Priority and Queue 1 only, because real-time UDP voice and video require aggressive early drops before queues fill", "Dropping UDP voice or video packets degrades call and video quality without slowing the sender because UDP lacks windowing flow control."],
      ["All four queues equally, because WRED reduces latency for every transport protocol whenever queue depth exceeds the minimum threshold", "Enabling congestion avoidance on an LLQ priority queue is unnecessary (it is serviced immediately) and harmful to UDP voice traffic."],
      ["Queue 3 only, because congestion avoidance cannot distinguish between different AF drop preferences inside transactional Queue 2", "WRED explicitly uses AF drop preferences (such as AF21, AF22, AF23) to drop higher drop-preference packets more aggressively within a queue."]
    ],
    "Congestion avoidance tools monitor average queue depth between a minimum and maximum threshold and preemptively drop a small percentage of packets. This triggers TCP receivers to shrink their TCP window size, slowing down TCP senders before catastrophic tail drop occurs. Because UDP has no windowing mechanism, congestion avoidance is effective only on queues carrying predominantly TCP traffic.",
    "Congestion avoidance (WRED) is for TCP data queues, never for LLQ voice or pure UDP queues.",
    []
  ),
  c11.m(
    "QoS",
    "Hard",
    "Which two statements accurately describe the backward-compatible Class Selector (CS) DSCP markings defined in DiffServ?",
    [
      "The 6-bit CSx binary value places the 3-bit IP Precedence value in the first three bits followed by three binary 0s",
      "The decimal DSCP value for any Class Selector marking CSx is equal to 8 multiplied by x (for example, CS3 equals 24)"
    ],
    [
      ["Class Selector markings define four queues and three drop probabilities per queue for a total of 12 CS values", "Four queues with three drop probabilities describes the 12 Assured Forwarding (AFxy) markings, whereas there are 8 Class Selector values (CS0-CS7)."],
      ["The 6-bit CSx binary value places three binary 0s in the high-order bits followed by the 3-bit IP Precedence value", "Placing zeros in the first three bits would yield decimal values 0 through 7 rather than preserving the high-order IPP bits (0, 8, 16, 24, 32, 40, 48, 56)."],
      ["Class Selector markings exist only inside the 802.1Q tag header and are stripped when packets cross a router", "CS0 through CS7 are 6-bit DSCP markings in the IPv4 ToS byte and IPv6 Traffic Class byte, so they remain with the IP header end-to-end."]
    ],
    "When DiffServ expanded QoS marking from the 3-bit IP Precedence (IPP) field to the 6-bit DSCP field, it defined eight Class Selector values (CS0-CS7) for backward compatibility. Each CSx value keeps the original 3-bit IPP value in the most significant 3 bits and sets the lower 3 bits to 000, producing decimal multiples of 8 (0, 8, 16, 24, 32, 40, 48, 56).",
    "CSx in binary is xxx000, so in decimal CSx = 8 * x (CS0=0, CS1=8, CS2=16, CS3=24, CS4=32, CS5=40, CS6=48, CS7=56).",
    []
  ),
  c11.d(
    "QoS",
    "Medium",
    "Place the four internal processing steps in the exact order a router performs them when forwarding a packet through an egress queuing system.",
    [
      "Make the Layer 3 forwarding (routing) decision to determine the outgoing interface",
      "Use output classification logic to match packet headers and assign the packet to an output queue",
      "Hold the packet in the assigned output queue while the outgoing physical interface is busy",
      "Use the queue scheduler (such as LLQ or CBWFQ) to select the next packet for physical transmission"
    ],
    "Output queuing happens after the router routes the packet to an egress interface. First, forwarding logic picks the egress interface; second, the classifier places the packet into the proper queue; third, the queue buffers the packet while the link is busy; and fourth, the scheduler selects the next packet to transmit.",
    "Remember the egress queuing pipeline: Forward -> Classify -> Queue -> Schedule -> Transmit.",
    []
  ),
  c11.t(
    "QoS",
    "Hard",
    "Match each RFC 4594 / Cisco QoS traffic category to its standard recommended DiffServ DSCP marking.",
    [
      ["Interactive voice payload (VoIP)", "DSCP EF (decimal 46)"],
      ["Interactive video conferencing", "DSCP AF4x (such as AF41, decimal 34)"],
      ["Streaming video", "DSCP AF3x (such as AF31, decimal 26)"],
      ["High-priority / low-latency transactional data", "DSCP AF2x (such as AF21, decimal 18)"],
      ["Best-effort standard data", "DSCP CS0 (decimal 0)"]
    ],
    "RFC 4594 and Cisco QoS design guides establish consistent DSCP marking conventions across enterprise networks: EF (46) for real-time voice payload, AF4x for interactive video, AF3x for streaming video, AF2x for low-latency business data, and CS0 (0) for default standard data.",
    "Keep the AF hierarchy straight: AF4x = Interactive Video, AF3x = Streaming Video, AF2x = Critical Data, CS0 = Default.",
    []
  )
];

// ============================================================================
// v2c12: Miscellaneous IP Services
// ============================================================================
const c12f = mk("IP Connectivity", 25, "v2c12");
const c12s = mk("IP Services", 10, "v2c12");
const q12 = [
  c12f.s(
    "FHRP",
    "Easy",
    "Which First Hop Redundancy Protocol (FHRP) is an IETF open standard (RFC 5798) that uses an active/standby redundancy model?",
    "Virtual Router Redundancy Protocol (VRRP)",
    [
      ["Hot Standby Router Protocol (HSRP)", "HSRP uses an active/standby model, but it is a Cisco-proprietary protocol rather than an IETF open standard."],
      ["Cisco Gateway Load Balancing Protocol (GLBP)", "GLBP is a Cisco-proprietary protocol that uses an active/active model to load-balance traffic per host."],
      ["Rapid Spanning Tree Protocol (RSTP)", "RSTP is an IEEE 802.1w Layer 2 loop-prevention protocol for switches, not a Layer 3 default gateway redundancy protocol."]
    ],
    "The three primary FHRP options are HSRP (Cisco-proprietary, active/standby), VRRP (IETF RFC 5798 standard, active/standby), and GLBP (Cisco-proprietary, active/active load balancing per host).",
    "HSRP = Cisco active/standby; VRRP = IETF standard active/standby; GLBP = Cisco active/active.",
    []
  ),
  c12f.s(
    "FHRP",
    "Medium",
    "Routers R1 (10.1.10.2) and R2 (10.1.10.3) run HSRP on VLAN 10 with virtual IP address 10.1.10.1 and virtual MAC VMAC1. R1 is currently HSRP Active and R2 is HSRP Standby. If R1 loses power, what happens on the LAN switches and end hosts?",
    "R2 broadcasts a gratuitous ARP from VMAC1 to update switch MAC tables while hosts keep their gateway and ARP cache",
    [
      ["End hosts detect the failure via HSRP hello messages and update their default gateway IP from 10.1.10.2 to 10.1.10.3", "End hosts do not participate in HSRP messages and always point their default gateway to the virtual IP address (10.1.10.1)."],
      ["R2 sends an ICMP Redirect to all hosts instructing them to replace VMAC1 with R2's physical burned-in MAC address", "Both HSRP routers share the virtual MAC address (VMAC1), so the hosts' ARP tables continue mapping 10.1.10.1 to VMAC1."],
      ["The LAN switches flush all VLAN 10 VLAN IDs and re-run Spanning Tree Protocol before forwarding frames to R2", "HSRP failover does not trigger an STP topology change if physical switch links to R2 remain up; a gratuitous ARP updates the CAM table directly."]
    ],
    "During an HSRP failover, end hosts require zero changes because their default gateway remains the virtual IP (10.1.10.1) and their ARP entry remains the virtual MAC (VMAC1). The new active router (R2) sends a broadcast gratuitous ARP frame with VMAC1 as the source MAC so LAN switches immediately re-learn VMAC1 on the switch ports leading toward R2.",
    "HSRP failover is completely transparent to hosts (same VIP, same VMAC); switches learn the new path via gratuitous ARP.",
    []
  ),
  c12f.s(
    "FHRP",
    "Medium",
    "How can a network engineer achieve load balancing across two routers (R1 and R2) using HSRP when a site has two user VLANs (VLAN 10 and VLAN 20)?",
    "Configure HSRP so R1 acts as Active with R2 as Standby for VLAN 10, and R2 acts as Active with R1 as Standby for VLAN 20",
    [
      ["Configure a single HSRP group in VLAN 10 so R1 and R2 simultaneously reply to ARP requests with different virtual MAC addresses", "Replying to ARP requests for one virtual IP with multiple virtual MACs in the same group is how GLBP operates, not single-group HSRP."],
      ["Configure half the hosts in VLAN 10 to use R1's physical IP as their gateway and the other half to use R2's physical IP", "Pointing hosts to physical router IPs defeats FHRP automatic failover if either router fails."],
      ["Enable OSPF equal-cost multipath (ECMP) on the end-user PCs so hosts alternate packets between R1 and R2", "End-user PCs do not run OSPF or ECMP; they send all off-subnet traffic to a single configured default gateway."]
    ],
    "Because HSRP operates in an active/standby model per group/subnet, all hosts in a single HSRP group send traffic through the one active router. By making R1 active for Subnet/VLAN 10 and R2 active for Subnet/VLAN 20 (or using multiple HSRP groups), both routers and uplinks actively forward traffic while backing each other up.",
    "HSRP load balances per subnet/VLAN (or via multiple HSRP groups), whereas GLBP load balances per host within a single subnet.",
    []
  ),
  c12s.s(
    "SNMP",
    "Easy",
    "Which SNMP component is the hierarchical database of variables (identified by Object IDs such as 1.3.6.1.4.1.9.2.1.58.0) maintained locally on each managed router or switch?",
    "Management Information Base (MIB)",
    [
      ["Network Management Station (NMS) Console", "The NMS is the central server running SNMP manager software that polls devices and displays alerts to operators."],
      ["SNMP Unsolicited Trap Receiver", "A Trap Receiver is a process on the NMS that listens for unsolicited notifications rather than the database of variables on the managed device."],
      ["SNMP Security Community String", "A community string is a clear-text password used in SNMPv1 and SNMPv2c rather than a database of device variables."]
    ],
    "Every SNMP agent maintains a Management Information Base (MIB), which organizes thousands of operational, status, and counter variables into a standardized tree hierarchy of Object IDs (OIDs).",
    "Agent = software on the router/switch; MIB = database of OIDs on the device; Manager/NMS = central management server.",
    []
  ),
  c12s.s(
    "SNMP",
    "Easy",
    "Which UDP-based file transfer protocol operates on well-known port 69, requires no user authentication, and does not support listing or changing server directories?",
    "Trivial File Transfer Protocol (TFTP)",
    [
      ["Authenticated File Transfer Protocol (FTP)", "FTP uses TCP ports 21 and 20, requires authentication, and supports browsing, creating, and removing directories."],
      ["Encrypted Secure Copy Protocol (SCP)", "SCP runs over encrypted SSH (TCP port 22) and requires user authentication before transferring files."],
      ["File Transfer Protocol Secure (FTPS)", "FTPS runs FTP over TLS encryption using TCP (port 21 in explicit mode or ports 990/989 in implicit mode) and authenticates users."]
    ],
    "TFTP (UDP port 69) is intentionally lightweight ('trivial'). It supports only reading (Get) and writing (Put) a specifically named file, includes post-transfer checksum verification, and omits authentication and directory navigation commands.",
    "TFTP = UDP port 69, no authentication, no directory browsing, lightweight.",
    ["copy tftp flash"]
  ),
  c12s.s(
    "SNMP",
    "Medium",
    "How does an SNMP Inform message (introduced in SNMPv2) differ from an SNMP Trap message?",
    "Both are agent-to-NMS notifications sent over UDP port 162, but an Inform requires an acknowledgment from the NMS",
    [
      ["An Inform message is sent using TCP for reliable delivery, whereas a Trap message is sent using connectionless UDP", "Both SNMP Traps and SNMP Informs use UDP as their transport layer protocol; Informs add reliability at the application layer."],
      ["An Inform message is sent from the NMS to poll the agent, whereas a Trap message is sent from the agent to the NMS", "Both Traps and Informs are agent-initiated notifications sent to the NMS; polling from the NMS uses Get, GetNext, or GetBulk."],
      ["An Inform message modifies a configuration variable on the agent, whereas a Trap message only reads a variable", "Modifying aMIB variable on an agent is performed by an SNMP Set Request from the NMS, not an Inform."]
    ],
    "SNMP Traps and Informs both allow an SNMP agent on a router or switch to proactively notify the NMS when a threshold or state change occurs. While Traps are 'fire-and-forget' UDP messages, Informs add application-layer reliability over UDP by requiring the NMS to return an SNMP Response acknowledgment (retransmitting on timeout).",
    "Trap = unacknowledged ('fire and forget'); Inform = acknowledged by the NMS (reliable, higher overhead).",
    []
  ),
  c12s.s(
    "SNMP",
    "Medium",
    "A router running SNMPv2c is configured with read-only (RO) community string `MonOnly1` and read-write (RW) community string `CfgAdmin2`. Which community string(s) will the router accept to process an incoming SNMP Get Request versus an SNMP Set Request?",
    "Either `MonOnly1` or `CfgAdmin2` for a Get Request, but only `CfgAdmin2` for a Set Request",
    [
      ["Only `MonOnly1` for an incoming Get Request, and only `CfgAdmin2` for an incoming Set Request", "The read-write (RW) community string permits both reading (Get) and writing (Set) MIB variables, not just writing."],
      ["Either `MonOnly1` or `CfgAdmin2` for both incoming Get Requests and incoming Set Requests", "The read-only (RO) community string (`MonOnly1`) cannot be used to modify device variables with a Set Request."],
      ["Neither string in clear text since SNMPv2c requires hashed passwords and username authentication", "Username authentication with hashed passwords and optional encryption was introduced in SNMPv3; SNMPv2c uses clear-text community strings."]
    ],
    "In SNMPv1 and SNMPv2c, the read-only (RO) community string permits read operations (Get, GetNext, GetBulk), whereas the read-write (RW) community string permits both read operations (Get) and write operations (Set).",
    "RW community string works for BOTH Get and Set; RO community string works ONLY for Get.",
    []
  ),
  c12s.s(
    "SSH/TFTP",
    "Medium",
    "An enterprise FTP client sits behind a stateful firewall and connects to an external FTP server on the Internet. Why does FTP passive mode succeed through the firewall when FTP active mode fails?",
    "In passive mode, the FTP client sends PASV and initiates the outbound TCP data connection to the server's dynamic port",
    [
      ["In passive mode, all file data is transferred inside the existing TCP port 21 control connection without opening a second connection", "FTP always uses a separate TCP data connection in both active and passive modes."],
      ["In passive mode, the FTP server initiates the inbound TCP data connection from TCP port 20 to the client's dynamic port", "The server initiating the TCP data connection back to the client describes active mode, which firewalls typically block."],
      ["In passive mode, the FTP client automatically encrypts the control and data connections using TLS on TCP port 990", "Encrypting FTP with TLS on port 990 describes FTPS implicit mode, not standard FTP passive mode."]
    ],
    "In FTP active mode, the client sends a PORT command and the server initiates a new inbound TCP data connection to the client—which enterprise firewalls typically block. In FTP passive mode, the client sends a PASV command, the server replies with an IP and ephemeral port, and the client initiates the outbound TCP data connection through the firewall.",
    "Active mode = Server initiates TCP data connection to client; Passive mode (PASV) = Client initiates TCP data connection to server.",
    []
  ),
  c12s.s(
    "SSH/TFTP",
    "Hard",
    "Examine the following CLI session during an IOS image upgrade on router R2. What happens if the administrator types `y` and presses Enter at the prompt shown?",
    "The router copies the 104-MB IOS image into flash0: and names the destination file literally `y`",
    [
      ["The router confirms the default filename in brackets and saves the file as `c2900-universalk9-mz.SPA.154-3.M3.bin`", "Pressing Enter alone accepts the default filename in brackets; typing any characters replaces the destination filename with those characters."],
      ["The router aborts the TFTP transfer and returns an `%Error: Invalid confirmation response` message", "The prompt is asking for a destination filename string, not a yes/no confirmation."],
      ["The router erases all existing files in flash0: before saving the image with its original filename", "Typing `y` at the `Destination filename` prompt sets the filename to `y`; it does not trigger a flash erase confirmation."]
    ],
    "When the Cisco IOS `copy` command prompts `Destination filename [default-name]?`, any text typed before pressing Enter becomes the new filename. Typing `y` or `yes` instead of simply pressing Enter renames the copied IOS image to `y` or `yes`.",
    "At IOS bracketed prompts `[default]?`, press Enter with no text to accept the default—never type `y` or `yes` unless the prompt explicitly asks `[confirm]`.",
    ["copy tftp flash"]
  ,
    {
      cli: "R2# copy tftp flash\nAddress or name of remote host []? 10.1.1.100\nSource filename []? c2900-universalk9-mz.SPA.154-3.M3.bin\nDestination filename [c2900-universalk9-mz.SPA.154-3.M3.bin]?"
    }
  ),
  c12s.s(
    "SSH/TFTP",
    "Hard",
    "Examine the output of `show flash` and `dir flash0:` on router R4. If an engineer needs to copy a new 60,000,000-byte IOS image into `flash0:` without deleting existing files, what will happen and how do the two command outputs differ?",
    "The copy will fail because only 49,238,016 bytes are free; `show flash` reports bytes used whereas `dir flash0:` reports total capacity",
    [
      ["The copy will succeed because 207,249,408 bytes are available; `show flash` reports free bytes in parentheses while `dir flash0:` reports used bytes", "In `show flash`, 207,249,408 is `bytes used`, while only 49,238,016 bytes (~49.2 MB) are available."],
      ["The copy will succeed by automatically overwriting the oldest `.bin` file; both commands report identical summary totals on the last line", "Cisco IOS does not automatically delete existing `.bin` files when space is low, and the two summary lines report different totals (used vs total capacity)."],
      ["The copy will fail because `flash0:` is mounted read-only; `show flash` displays NVRAM whereas `dir flash0:` displays USB flash", "The `-rw-` flags in `dir flash0:` confirm read-write permissions on the same compact flash file system."]
    ],
    "Both outputs show 49,238,016 bytes (~49.2 MB) of available/free space, which is not enough for a 60,000,000-byte (~60 MB) image. Notice the subtle difference in the summary line: `show flash` lists `bytes available (bytes used)`, whereas `dir flash0:` lists `bytes total (bytes free)`.",
    "Compare the bottom lines: `show flash` shows Available + Used; `dir flash0:` shows Total + Free (where Total = Used + Free).",
    ["show flash", "dir flash0:"],
    {
      cli: "R4# show flash\n-#- --length-- -----date/time------ path\n1   104193476  Jul 21 2015 13:38:06 c2900-universalk9-mz.SPA.154-3.M3.bin\n9    97794040  Oct 10 2014 21:06:38 c2900-universalk9-mz.SPA.152-4.M1.bin\n49238016 bytes available (207249408 bytes used)\n\nR4# dir flash0:\nDirectory of flash0:/\n1  -rw-   104193476  Jul 21 2015 13:38:06  c2900-universalk9-mz.SPA.154-3.M3.bin\n9  -rw-    97794040  Oct 10 2014 21:06:38  c2900-universalk9-mz.SPA.152-4.M1.bin\n256487424 bytes total (49238016 bytes free)"
    }
  ),
  c12s.s(
    "SSH/TFTP",
    "Hard",
    "An engineer wants to copy an IOS image from an FTP server at 192.168.1.170 into default flash without being prompted for the username, password, or destination filename. Which global configuration and EXEC commands accomplish this?",
    "Configure `ip ftp username` and `ip ftp password` globally, then run `copy ftp://192.168.1.170/image.bin flash:image.bin`",
    [
      ["Configure `ftp-server username` and `ftp-server password` globally, then run `copy ftp://192.168.1.170/image.bin flash`", "Omitting the destination filename after `flash` causes IOS to prompt `Destination filename [image.bin]?`, and the global commands begin with `ip ftp`."],
      ["Configure `username` and `password` under `line vty 0 4`, then run `copy ftp 192.168.1.170 flash0:`", "VTY line credentials authenticate incoming Telnet/SSH users rather than outbound FTP client transfers, and `copy ftp` syntax requires interactive prompts or a URI."],
      ["Configure `ip tftp username` and `ip tftp password` globally, then run `copy tftp://192.168.1.170/image.bin flash:image.bin`", "TFTP does not support usernames or passwords, and cannot authenticate to an FTP server."]
    ],
    "To avoid interactive prompts when copying via FTP, you can either embed `username:password@host` inside the source URI or preconfigure `ip ftp username <name>` and `ip ftp password <pass>` in global configuration mode. Specifying the exact destination filename (`flash:image.bin`) suppresses the destination filename prompt.",
    "Use `ip ftp username` + `ip ftp password` or `ftp://user:pass@host/file`, and specify `flash:filename` to skip all prompts.",
    ["ip ftp username", "ip ftp password", "copy ftp flash"]
  ),
  c12s.m(
    "SNMP",
    "Easy",
    "Which three security enhancements did SNMPv3 introduce to replace the clear-text community strings used in SNMPv1 and SNMPv2c?",
    [
      "Message integrity verification to confirm that SNMP messages were not altered in transit",
      "Authentication using a username and a hashed password rather than clear text",
      "Encryption (privacy) of SNMP message payloads so attackers cannot read intercepted packets"
    ],
    [
      ["Mandatory migration from UDP transport to TLS over TCP port 443 for all SNMP polling", "SNMPv3 continues to use UDP as its transport protocol while providing built-in integrity, authentication, and encryption."],
      ["Automatic role-based read-only and read-write community string rotation every 24 hours", "SNMPv3 eliminates community strings entirely in favor of user-based security models."],
      ["Built-in MD5 verification of Cisco IOS `.bin` files stored in router compact flash memory", "Verifying IOS image integrity in flash is performed by the IOS `verify /md5` command, not by the SNMPv3 protocol."]
    ],
    "SNMPv3 eliminates clear-text community strings and introduces three core security capabilities: message integrity (ensuring packets are not tampered with in transit), authentication (verifying identity via username and hashed password), and encryption/privacy (hiding payload contents from eavesdroppers).",
    "SNMPv3 security = Integrity + Authentication (hashed password) + Encryption (Privacy).",
    []
  ),
  c12s.d(
    "SSH/TFTP",
    "Hard",
    "Place the four steps in the exact order they occur when an FTP client and FTP server establish an encrypted session using FTPS (FTP over TLS) in explicit mode.",
    [
      "The FTP client establishes a standard TCP control connection to the FTP server on well-known port 21",
      "The FTP client sends the FTP AUTH command over the control connection to initiate TLS encryption",
      "When a file transfer is requested, the FTP client establishes the TCP data connection with the server",
      "The FTP client sends the FTP AUTH command on the data connection to encrypt the data transfer with TLS"
    ],
    "In FTPS explicit mode, the client connects to standard TCP port 21 and explicitly requests TLS encryption using the `FTP AUTH` command on the control connection, followed by establishing the data connection and issuing `FTP AUTH` to secure the data channel. (By contrast, implicit mode requires TLS from the start on ports 990 and 989.)",
    "FTPS Explicit = connect on port 21, then issue `FTP AUTH` to start TLS; FTPS Implicit = immediate TLS on ports 990 (control) and 989 (data).",
    []
  ),
  c12s.t(
    "SSH/TFTP",
    "Hard",
    "Match each Cisco IOS File System (IFS) type or prefix from `show file systems` to its correct description.",
    [
      ["system: (opaque)", "Logical internal RAM file system that holds the active running-config file"],
      ["nvram:", "Non-volatile memory that stores the startup-config file across reboots"],
      ["flash0: (disk)", "Primary internal rewriteable flash memory that permanently stores the Cisco IOS `.bin` image"],
      ["usbflash0: (usbflash)", "External removable USB flash storage device inserted into a router USB slot"],
      ["tftp: / ftp: / scp: (network)", "External file system prefixes representing remote network servers used for copying files"]
    ],
    "Cisco IOS organizes both local storage and remote servers into IOS File Systems (IFS). `system:running-config` resides in RAM (opaque type), `nvram:startup-config` resides in NVRAM, `flash0:` (disk type) holds the IOS image in permanent flash, `usbflash0:` represents a USB drive, and `network` prefixes (`tftp:`, `ftp:`, `scp:`) reference remote file servers.",
    "Remember the formal IFS paths behind common commands: `show running-config` = `system:running-config`; `show startup-config` = `nvram:startup-config`.",
    ["show file systems", "verify /md5"]
  )
];

// ============================================================================
// v2c13: LAN Architecture
// ============================================================================
const c13 = mk("Network Fundamentals", 20, "v2c13");
const q13 = [
  c13.s(
    "Network architecture",
    "Easy",
    "In a Cisco enterprise campus LAN, why is a two-tier campus topology also referred to as a collapsed core design?",
    "It combines the distribution and core layers into a single collapsed tier rather than deploying a separate core tier",
    [
      ["It collapses the access and distribution layers into a single tier so end-user PCs plug directly into core switches", "End-user devices always connect to access switches; a two-tier design keeps the access and distribution tiers while omitting the core tier."],
      ["It replaces all physical switches with a single SOHO wireless router that integrates switching, routing, and firewalling", "An all-in-one wireless router describes a Small Office/Home Office (SOHO) network rather than a two-tier campus LAN."],
      ["It eliminates all redundant uplinks between switches so Spanning Tree Protocol never blocks any switch ports", "Two-tier campus designs still use redundant uplinks (a partial mesh) between each access switch and two distribution switches."]
    ],
    "A two-tier campus LAN consists of the access layer and the distribution layer. Because it lacks a dedicated third tier of core switches—with the distribution switches handling aggregation and backbone forwarding—it is commonly called a collapsed core design.",
    "2-tier = Access + Distribution (Collapsed Core); 3-tier = Access + Distribution + Core.",
    []
  ),
  c13.s(
    "Network architecture",
    "Easy",
    "In a three-tier campus LAN architecture, what is the primary role of the core layer switches?",
    "To interconnect distribution blocks across buildings and switch transit packets at high speed",
    [
      ["To provide direct Ethernet port connections and Power over Ethernet (PoE) to end-user PCs and IP phones", "Connecting end-user devices and supplying PoE is the role of the access layer, not the core layer."],
      ["To interconnect access layer switches directly to one another within the same wiring closet", "Access switches do not connect to each other, and aggregating access switches is the role of the distribution layer."],
      ["To convert 802.11 wireless frames into 802.3 Ethernet frames without using a Wireless LAN Controller", "Converting 802.11 to 802.3 autonomously is the function of an autonomous AP in a SOHO network."]
    ],
    "In large multi-building campuses, interconnecting every building's distribution switches in a mesh consumes too many expensive inter-building fiber links and ports. Core switches sit at the third tier solely to interconnect distribution switches with high-speed forwarding.",
    "Access = connects endpoints; Distribution = aggregates access switches; Core = aggregates distribution switches.",
    []
  ),
  c13.s(
    "Network architecture",
    "Easy",
    "In Power over Ethernet (PoE) terminology, what are the roles of the LAN switch that supplies DC power over the UTP cable and the IP phone or AP that receives that power?",
    "The LAN switch is the Power Sourcing Equipment (PSE) and the IP phone or AP is the Powered Device (PD)",
    [
      ["The LAN switch is the Powered Device (PD) and the IP phone or AP is the Power Sourcing Equipment (PSE)", "This reverses the two terms: the PSE sources (supplies) power, while the PD is powered by that current."],
      ["The LAN switch is the AC Power Brick (APB) and the IP phone or AP is the Inline Power Endpoint (IPE)", "PoE eliminates external AC-to-DC power bricks by delivering DC power directly from the PSE to the PD."],
      ["The LAN switch is the PoE Distribution Node (PDN) and the IP phone or AP is the PoE Client Terminal (PCT)", "The IEEE 802.3 PoE standards formally define the supplier as PSE and the consumer as PD."]
    ],
    "Under IEEE PoE standards, the device that injects DC electrical power onto the Ethernet UTP cable (typically a PoE-capable LAN switch) is called Power Sourcing Equipment (PSE), and the device drawing power from the cable (such as an IP phone, wireless AP, or IP camera) is called a Powered Device (PD).",
    "PSE = Power Sourcing Equipment (the switch); PD = Powered Device (the phone, AP, or camera).",
    []
  ),
  c13.s(
    "Network architecture",
    "Easy",
    "How does the wireless access point (AP) inside a typical Small Office/Home Office (SOHO) wireless router operate compared to an enterprise campus AP?",
    "It operates as an autonomous AP that converts between 802.11 and 802.3 frames locally without using CAPWAP or a WLC",
    [
      ["It operates as a lightweight AP in split-MAC mode, tunneling all home user traffic through a cloud WLC via CAPWAP", "SOHO wireless routers contain a standalone (autonomous) AP and do not use split-MAC architecture or CAPWAP tunnels."],
      ["It requires four separate physical appliances for the Ethernet switch, wireless AP, IP router, and stateful firewall", "A SOHO wireless router integrates the Ethernet switch, autonomous AP, router, and firewall into a single consumer appliance."],
      ["It forwards 802.11 wireless frames directly onto the UTP Ethernet switch ports without translating the Layer 2 headers", "Wired Ethernet requires 802.3 headers, so the autonomous AP must translate between 802.11 and 802.3 frame headers."]
    ],
    "In a SOHO network, a single multifunction consumer device typically integrates a multi-port Ethernet switch, an autonomous wireless AP, an IP router, and a firewall. Because there is no Wireless LAN Controller (WLC), the AP handles all WLAN functions locally and translates between 802.11 and 802.3 frames without CAPWAP encapsulation.",
    "SOHO = single integrated box (router + switch + firewall + autonomous AP, no CAPWAP/WLC).",
    []
  ),
  c13.s(
    "Network architecture",
    "Medium",
    "Why is a standard two-tier or three-tier enterprise campus LAN considered a hybrid topology?",
    "It combines a star topology from access switches to endpoints with a partial mesh interconnecting the switch tiers",
    [
      ["It combines a full mesh of links between all access switches with a ring topology between all distribution switches", "Access switches do not connect to each other, and enterprise campus tiers use partial meshes rather than rings."],
      ["It combines coaxial bus segments in the wiring closets with point-to-point serial links between the core switches", "Modern campus LANs use point-to-point twisted-pair and fiber Ethernet links in star and mesh arrangements, not coaxial buses."],
      ["It connects every switch in the campus to every other switch using N(N - 1)/2 links while connecting PCs in a daisy chain", "Campus LANs avoid full meshes across all switches because of the excessive port and cabling cost, using a partial mesh instead."]
    ],
    "Each access switch sits at the center of a star topology with cables radiating out to connected endpoints. Meanwhile, the uplinks connecting access switches to pairs of distribution switches (and distribution switches to core switches) form a partial mesh. Combining star and partial-mesh topologies creates a hybrid topology.",
    "Campus LAN hybrid topology = Star at the access layer + Partial mesh at the distribution/core layers.",
    []
  ),
  c13.s(
    "Network architecture",
    "Medium",
    "An engineer is comparing a partial mesh against a full mesh for a campus with 18 access switches and 2 distribution switches (20 switches total). If every access switch connects only to both distribution switches (1 link to each) and the 2 distribution switches connect to each other with 1 link, how many links are used compared to a full mesh of all 20 switches?",
    "37 links in the partial mesh versus 190 links in a 20-switch full mesh",
    [
      ["36 links in the partial mesh versus 380 links in a 20-switch full mesh", "380 is the number of switch ports consumed in a 20-switch full mesh (20 * 19), while the number of links is 20 * 19 / 2 = 190 (and the partial mesh includes 1 link between the distribution switches for 37 total)."],
      ["20 links in the partial mesh versus 400 links in a 20-switch full mesh", "18 access switches with 2 uplinks each plus 1 link between distribution switches equals 37 links, and a full mesh is N(N - 1)/2 = 190."],
      ["37 links in the partial mesh versus 95 links in a 20-switch full mesh", "95 is half of 190; for N = 20 switches, N(N - 1)/2 = (20 * 19) / 2 = 190 links."]
    ],
    "In a full mesh of N = 20 switches, the formula N(N - 1) / 2 yields (20 * 19) / 2 = 190 links (consuming 380 switch ports). In the partial mesh, each of the 18 access switches has 2 uplinks (18 * 2 = 36 links) plus 1 link between the 2 distribution switches = 37 links (74 ports).",
    "Full mesh links = N(N - 1) / 2; Full mesh switch ports = N(N - 1).",
    []
  ),
  c13.s(
    "Network architecture",
    "Medium",
    "How does a PoE-capable switch (PSE) prevent electrical damage to a non-PoE laptop when the laptop is plugged into a PoE switch port?",
    "It keeps power disabled initially and uses low-power autonegotiation signaling to detect a PD and its required PoE power class",
    [
      ["It immediately applies 15.4 watts of AC current and relies on the laptop's internal circuit breaker to trip if PoE is unsupported", "PoE supplies DC power (not AC), and applying full power before detection would damage non-PoE NIC circuitry."],
      ["It waits for the attached device to boot up and send a CDP or LLDP frame requesting initial power before energizing the cable", "A Powered Device (PD) without an external power cord cannot boot or send CDP/LLDP frames until the switch supplies initial PoE power."],
      ["It requires the network engineer to manually configure the exact wattage on every switch port before any power is transmitted", "PoE dynamically detects PDs and their power classes via IEEE autonegotiation without requiring manual per-port wattage commands."]
    ],
    "To protect non-PoE devices, a PSE keeps power off until it uses low-power IEEE autonegotiation signaling to detect whether the attached device is a Powered Device (PD) and identify its initial PoE power class. Once initial power allows the PD to boot, CDP and LLDP can later negotiate fine-tuned power adjustments.",
    "Initial PoE detection = IEEE autonegotiation (before the PD boots); Post-boot power adjustment = autonegotiation + CDP/LLDP.",
    []
  ),
  c13.s(
    "Network architecture",
    "Medium",
    "Which IEEE standard and maximum wattage at the PSE correspond to PoE+ and UPoE, respectively?",
    "PoE+ is IEEE 802.3at (30 W over 2 pairs) and UPoE is IEEE 802.3bt (60 W over 4 pairs)",
    [
      ["PoE+ is IEEE 802.3af (15 W over 2 pairs) and UPoE is IEEE 802.3at (30 W over 4 pairs)", "IEEE 802.3af is original PoE (15 W over 2 pairs), and 802.3at is PoE+ (30 W over 2 pairs)."],
      ["PoE+ is IEEE 802.3bt (60 W over 2 pairs) and UPoE is IEEE 802.3bt (100 W over 4 pairs)", "60 W and 100 W over 4 pairs are UPoE and UPoE+ under 802.3bt; PoE+ supplies 30 W over 2 wire pairs."],
      ["PoE+ is Cisco Inline Power (7 W over 2 pairs) and UPoE is IEEE 802.3af (15 W over 4 pairs)", "Cisco Inline Power was Cisco's prestandard 7-W implementation over 2 pairs."]
    ],
    "Original PoE (802.3af) supplies up to 15 W over 2 wire pairs, and PoE+ (802.3at) doubles that to 30 W over 2 wire pairs. IEEE 802.3bt uses all 4 wire pairs in the UTP cable to deliver 60 W for UPoE and 100 W for UPoE+.",
    "2 wire pairs: ILP (7W), PoE 802.3af (15W), PoE+ 802.3at (30W). All 4 wire pairs: UPoE 802.3bt (60W), UPoE+ 802.3bt (100W).",
    []
  ),
  c13.s(
    "Network architecture",
    "Hard",
    "A campus LAN connects three buildings, each containing 2 distribution switches (6 distribution switches total across the campus). If the engineer migrates the inter-building connections from a full mesh between all 6 distribution switches to a three-tier design with 2 core switches (where every distribution switch connects to both core switches), how many inter-building links are required in each design?",
    "15 links in the 6-switch full mesh versus 12 links with the 2 core switches",
    [
      ["30 links in the 6-switch full mesh versus 24 links with the 2 core switches", "30 and 24 are the numbers of switch ports consumed on the ends of those links (two ports per link), not the number of links."],
      ["18 links in the 6-switch full mesh versus 6 links with the 2 core switches", "A full mesh of 6 switches requires 6 * 5 / 2 = 15 links, and connecting 6 distribution switches to 2 core switches requires 6 * 2 = 12 links."],
      ["12 links in the 6-switch full mesh versus 15 links with the 2 core switches", "This reverses the two numbers; adding a core layer reduces the required inter-building links from 15 down to 12 (and saves even more as buildings are added)."]
    ],
    "A full mesh among 6 distribution switches requires N(N - 1) / 2 = (6 * 5) / 2 = 15 links (30 switch ports). Introducing 2 core switches where each of the 6 distribution switches connects to both core switches requires 6 * 2 = 12 links (24 switch ports), saving expensive outdoor fiber runs and ports—a savings that grows rapidly as more buildings are added.",
    "Adding a Core tier replaces an N(N-1)/2 distribution mesh with 2*N links to a pair of core switches.",
    []
  ),
  c13.s(
    "Network architecture",
    "Hard",
    "A wiring closet needs to power 20 PoE+ wireless access points (each requiring a maximum of 20 W in actual operation) and 20 PoE IP phones (each requiring 7 W in actual operation). If the switch itself consumes 150 W to run its internal hardware, what is the minimum total switch power supply wattage required vs. if the engineer mistakenly budgets the full IEEE standard maximum per port?",
    "690 W based on actual PD draw versus 1050 W when budgeted at full 30 W / 15 W class maximums",
    [
      ["540 W based on actual PD draw versus 900 W if budgeted at full standard maximums", "540 W and 900 W account only for the PoE power budget (400 + 140 = 540 W; 600 + 300 = 900 W) and forget the 150 W needed to run the switch itself."],
      ["1050 W based on actual PD draw versus 1350 W if budgeted at full standard maximums", "The PoE+ APs actually draw 20 W each (20 * 20 = 400 W) and the phones draw 7 W each (20 * 7 = 140 W), which plus 150 W for the switch equals 690 W."],
      ["690 W based on actual PD draw versus 1950 W if budgeted at full 60 W / 30 W standard maximums", "60 W is the UPoE (802.3bt) maximum; PoE+ (802.3at) is 30 W and PoE (802.3af) is 15 W."]
    ],
    "When designing a PoE power budget, the switch power supplies must power the switch hardware itself (150 W) plus the connected PDs. Budgeting for actual device consumption requires 150 + (20 * 20 W) + (20 * 7 W) = 690 W, whereas reserving the maximum standard rating for PoE+ (30 W) and PoE (15 W) would require 150 + (20 * 30 W) + (20 * 15 W) = 1050 W.",
    "Switch Power Supply Budget = Switch Base Power + Sum of Actual PD Wattage (which is often less than the 15W/30W standard max).",
    []
  ),
  c13.m(
    "Network architecture",
    "Medium",
    "Which two statements accurately describe the physical design and device roles in a standard Cisco two-tier or three-tier campus LAN?",
    [
      "Access layer switches connect directly to end-user devices and normally do not connect directly to other access layer switches",
      "Distribution layer switches aggregate connections from access switches and do not connect directly to end-user PCs"
    ],
    [
      ["Every access layer switch connects to every other access layer switch in the same building to form a full mesh", "Access switches connect upward to two distribution switches for redundancy, never directly to all other access switches."],
      ["Core layer switches connect directly to high-bandwidth end-user workstations and PoE security cameras", "End-user workstations and PoE cameras connect to the access layer; the core layer connects only to distribution switches and campus edge routers."],
      ["Distribution layer switches must sit in a purpose-built outdoor vault at the exact geographic center of the office park", "Physical switch placement follows building wiring closets and equipment rooms; even core switches typically sit in the same room as a building's distribution switches."]
    ],
    "In Cisco hierarchical campus design, each tier has a strict role: access switches provide endpoint connectivity and PoE (star topology) without interconnecting directly to other access switches, while distribution switches aggregate access switch uplinks (partial mesh) without connecting directly to user endpoints.",
    "Keep layer roles clean: Endpoints -> Access -> Distribution -> Core.",
    []
  ),
  c13.m(
    "Network architecture",
    "Hard",
    "Which two statements accurately describe Power over Ethernet (PoE) operation and cabling characteristics?",
    [
      "UPoE (60 W) and UPoE+ (100 W) under IEEE 802.3bt deliver DC power over all four wire pairs in the Ethernet UTP cable",
      "Because PoE delivers DC electrical power over the same wire pairs used for data, the powered device does not need an external AC-to-DC power brick"
    ],
    [
      ["PoE (802.3af) and PoE+ (802.3at) require a separate dedicated 2-pair copper power cable run alongside the Ethernet data cable", "All PoE standards transmit DC power and Ethernet data simultaneously over the same UTP Ethernet cable."],
      ["PoE (802.3af) and PoE+ (802.3at) deliver power across all four wire pairs, whereas UPoE uses only two wire pairs", "This is backwards: PoE and PoE+ power only 2 wire pairs, whereas UPoE and UPoE+ (802.3bt) power all 4 wire pairs."],
      ["PoE switches transmit 110V/220V alternating current (AC) over the UTP cable so standard wall-outlet appliances can plug into RJ-45 ports", "PoE supplies low-voltage direct current (DC) over UTP cabling to IEEE-compliant Powered Devices (PDs), never high-voltage AC."]
    ],
    "PoE transmits DC electrical power over the same UTP cable and wire pairs used for Ethernet data, eliminating the need for an AC power outlet and AC-to-DC power brick at the endpoint. While 802.3af (PoE) and 802.3at (PoE+) use 2 wire pairs, 802.3bt (UPoE and UPoE+) uses all 4 wire pairs to reach 60 W and 100 W.",
    "PoE sends DC power over the data UTP cable: 2 pairs for PoE/PoE+ (802.3af/at), 4 pairs for UPoE/UPoE+ (802.3bt).",
    []
  ),
  c13.d(
    "Network architecture",
    "Hard",
    "Place the five operational steps in the exact order a PoE switch (PSE) performs them when a Powered Device (PD) is connected to a port.",
    [
      "Keep PoE power disabled on the port until negotiation confirms a powered device is attached",
      "Send low-power IEEE autonegotiation signals and monitor the return signal to identify the PD and its initial PoE power class",
      "Supply DC power over the UTP cable according to the detected power class so the PD can boot up",
      "Monitor the booted PD for power class changes using both autonegotiation and incoming CDP or LLDP messages",
      "Adjust the DC power level supplied on the port if a new power class is negotiated"
    ],
    "A PSE never applies power blindly. It leaves power off, uses low-power IEEE autonegotiation pulses to detect a PD and its initial power class, applies that power so the PD can boot, and then monitors autonegotiation and CDP/LLDP messages from the running PD to adjust power levels dynamically.",
    "Remember the PoE sequence: Off -> Autonegotiate class -> Apply power to boot -> Monitor CDP/LLDP -> Adjust power.",
    []
  ),
  c13.t(
    "Network architecture",
    "Medium",
    "Match each Power over Ethernet (PoE) standard name to its IEEE standard, maximum wattage at the PSE, and number of powered wire pairs.",
    [
      ["Cisco Inline Power (ILP)", "Cisco prestandard — 7 W at PSE over 2 wire pairs"],
      ["PoE", "IEEE 802.3af — 15 W at PSE over 2 wire pairs"],
      ["PoE+", "IEEE 802.3at — 30 W at PSE over 2 wire pairs"],
      ["UPoE", "IEEE 802.3bt — 60 W at PSE over 4 wire pairs"],
      ["UPoE+", "IEEE 802.3bt — 100 W at PSE over 4 wire pairs"]
    ],
    "Each generation of PoE increased the maximum wattage supplied by the PSE: Cisco Inline Power (7 W, 2 pairs), IEEE 802.3af PoE (15 W, 2 pairs), IEEE 802.3at PoE+ (30 W, 2 pairs), IEEE 802.3bt UPoE (60 W, 4 pairs), and IEEE 802.3bt UPoE+ (100 W, 4 pairs).",
    "Wattage progression: 7W (ILP) -> 15W (af) -> 30W (at) -> 60W (bt UPoE) -> 100W (bt UPoE+).",
    []
  )
];

// ============================================================================
// v2c14: WAN Architecture
// ============================================================================
const c14w = mk("IP Connectivity", 25, "v2c14");
const c14v = mk("Security Fundamentals", 15, "v2c14");
const q14 = [
  c14w.s(
    "WAN",
    "Easy",
    "In Metro Ethernet WAN architecture, what do the terms Point of Presence (PoP) and User Network Interface (UNI) describe?",
    "PoP is the service provider facility housing the Ethernet switch, and UNI is the customer-to-provider access demarcation",
    [
      ["PoP is the customer wiring closet housing the CPE router, and UNI is the Layer 3 routing protocol run inside the provider core", "The PoP belongs to the service provider rather than the customer, and UNI defines the customer-to-provider access link rather than internal SP routing."],
      ["PoP is the virtual circuit identifier in an 802.1Q tag, and UNI is the encryption key shared between two IPsec VPN peers", "A virtual connection in MetroE is called an Ethernet Virtual Connection (EVC), not a PoP."],
      ["PoP is the DSL splitter at a residential home, and UNI is the Multiprotocol BGP table on an MPLS provider edge router", "A residential DSL connection uses a DSL modem and a telco DSLAM, whereas PoP and UNI are Metro Ethernet architecture terms."]
    ],
    "To deliver Metro Ethernet services, a service provider places Ethernet switches close to customer locations inside a facility called a Point of Presence (PoP). The Ethernet access link connecting the customer router/switch to the provider switch is governed by the User Network Interface (UNI) specifications.",
    "PoP = Service Provider facility where the access link terminates; UNI = interface/standards demarcation between Customer (User) and SP (Network).",
    []
  ),
  c14w.s(
    "WAN",
    "Easy",
    "Which MEF Metro Ethernet service type creates a point-to-multipoint (hub-and-spoke) topology where leaf sites can exchange frames with the root site but cannot send frames directly to other leaf sites?",
    "Ethernet Tree Service (E-Tree)",
    [
      ["Ethernet Line Service (E-Line)", "E-Line creates a simple point-to-point Ethernet Virtual Connection (EVC) between exactly two customer devices."],
      ["Ethernet LAN Service (E-LAN)", "E-LAN creates a full-mesh (any-to-any) topology where all connected customer sites can send Ethernet frames directly to one another."],
      ["Multiprotocol Label Switching VPN (MPLS VPN)", "MPLS VPN is a Layer 3 routed WAN service rather than a Layer 2 MEF Metro Ethernet service."]
    ],
    "MEF defines three primary Metro Ethernet service types: E-Line (point-to-point between two sites), E-LAN (full mesh acting like a single LAN switch across all sites), and E-Tree (hub-and-spoke / partial mesh where remote leaf sites communicate only with the central root site).",
    "E-Line = Point-to-Point; E-LAN = Full Mesh (any-to-any); E-Tree = Hub-and-Spoke (root and leaves).",
    []
  ),
  c14w.s(
    "WAN",
    "Easy",
    "Why is Multiprotocol Label Switching (MPLS) sometimes referred to as a Layer 2.5 protocol even though an MPLS Layer 3 VPN provides a Layer 3 IP routing service to customers?",
    "Edge routers insert an MPLS label header between the Layer 2 data-link header and the Layer 3 IP packet header",
    [
      ["MPLS routers forward Ethernet frames using MAC addresses across half the WAN and IP addresses across the other half", "MPLS core routers switch packets based on the label field inside the MPLS header rather than Ethernet MAC addresses."],
      ["MPLS links support only Layer 2 Ethernet access links and cannot use Layer 1 serial TDM, DSL, or cable access links", "Because PE routers strip the Layer 2 frame header at ingress, MPLS supports almost any Layer 1/Layer 2 access link technology."],
      ["MPLS encrypts the Layer 2 header while leaving the Layer 3 IP header in clear text across the public Internet", "MPLS VPNs do not encrypt customer traffic; they isolate customer routing tables and forwarding paths over a private provider network."]
    ],
    "When a customer packet enters the service provider's MPLS network at a Provider Edge (PE) router, the PE removes the incoming Layer 2 frame header and pushes an MPLS header between the new Layer 2 header and the Layer 3 IP header. Because the MPLS label sits between Layer 2 and Layer 3, it is nicknamed Layer 2.5.",
    "MPLS header sits between L2 (Data Link) and L3 (IP) = 'Layer 2.5', and MPLS VPNs keep traffic separate without encrypting it.",
    []
  ),
  c14v.s(
    "VPN",
    "Easy",
    "Which four core security services does an IPsec VPN provide when transporting enterprise packets across the public Internet?",
    "Confidentiality (encryption), authentication, data integrity, and anti-replay protection",
    [
      ["Bandwidth reservation, low-latency queuing, traffic shaping, and congestion avoidance", "Bandwidth, queuing, shaping, and congestion avoidance are Quality of Service (QoS) features, which the public Internet does not provide."],
      ["Dynamic IP address assignment, DNS hostname resolution, NTP time synchronization, and SNMP trapping", "DHCP, DNS, NTP, and SNMP are general IP infrastructure services rather than cryptographic VPN security guarantees."],
      ["802.1Q VLAN tagging, Spanning Tree loop prevention, MAC address learning, and gratuitous ARP", "These are Layer 2 Ethernet switching mechanisms rather than Layer 3 IPsec tunnel security services."]
    ],
    "An Internet VPN secures traffic over untrusted public networks by providing four security guarantees: confidentiality (encrypting payloads so eavesdroppers cannot read them), authentication (verifying peer identity), data integrity (detecting any in-transit bit modifications), and anti-replay (rejecting captured and resent packets).",
    "Remember the 4 IPsec VPN pillars: Confidentiality, Authentication, Data Integrity, and Anti-replay.",
    []
  ),
  c14w.s(
    "WAN",
    "Medium",
    "An enterprise connects its headquarters router and 14 branch office routers (15 routers total) to a single Metro Ethernet E-LAN service and configures OSPF on all WAN interfaces. How many IPv4 subnets are used on the WAN, and how many OSPF neighbors does each branch router form?",
    "1 IPv4 subnet shared across the E-LAN, and each branch router forms 14 OSPF neighbor relationships with peer sites",
    [
      ["14 IPv4 subnets across the E-LAN, and each branch router forms 1 OSPF neighbor relationship with headquarters", "14 point-to-point subnets with 1 neighbor per branch describes a hub-and-spoke design using 14 separate E-Line EVCs (or an E-Tree), not a single E-LAN."],
      ["15 IPv4 subnets across the E-LAN, and each branch router forms 1 OSPF neighbor relationship with the provider switch", "In a Layer 2 Metro Ethernet service, the service provider switch does not have an IP address in the customer subnet or form OSPF adjacencies."],
      ["1 IPv4 subnet shared across the E-LAN, and each branch router forms 1 OSPF neighbor relationship with the MPLS PE router", "MetroE E-LAN is a Layer 2 full-mesh service with no MPLS PE router participating in customer OSPF."]
    ],
    "An E-LAN service behaves like a single large Layer 2 Ethernet switch connecting all 15 routers into one broadcast domain (full mesh). Therefore, all 15 routers share a single WAN IP subnet, and each router can communicate directly at Layer 2 with the other 14 customer routers, forming 14 OSPF neighbor relationships.",
    "E-LAN with N customer routers = 1 shared IP subnet, and each router sees N - 1 customer routers on that LAN segment.",
    []
  ),
  c14w.s(
    "WAN",
    "Medium",
    "An enterprise connects 1 headquarters site and 10 remote branch sites (11 sites total) to an MPLS Layer 3 VPN service using one router per site and OSPF on all WAN links. How many WAN subnets are required, and with which device does each branch Customer Edge (CE) router form an OSPF adjacency?",
    "At least 11 WAN subnets with one per PE-CE link, and each branch CE router forms 1 OSPF adjacency with its local PE",
    [
      ["1 shared WAN subnet across all 11 sites, and each branch CE router forms 10 OSPF adjacencies directly with the other CE routers", "Sharing 1 subnet and forming direct CE-to-CE adjacencies describes a Layer 2 MetroE E-LAN service, not a Layer 3 MPLS VPN."],
      ["At least 11 WAN subnets, and each branch CE router forms 1 OSPF adjacency directly with the headquarters CE router", "In an MPLS Layer 3 VPN, CE routers peer at Layer 3 with the service provider's PE router on the other end of their access link, never directly with other CE routers."],
      ["No WAN IP subnets are required because MPLS switches Ethernet frames using 802.1Q VLAN tags between CE routers", "MPLS VPN is a Layer 3 routed service requiring an IP subnet on every PE-CE access link."]
    ],
    "Because an MPLS VPN is a Layer 3 routed service, each site's access link connects a Customer Edge (CE) router to a Service Provider Edge (PE) router as a separate point-to-point Layer 3 subnet (11 links = 11 subnets). Each CE router forms an OSPF neighbor relationship only with its directly connected PE router.",
    "Compare carefully: E-LAN (N sites) = 1 subnet, N-1 customer neighbors; MPLS L3 VPN (N sites) = N subnets, 1 PE neighbor per CE.",
    []
  ),
  c14w.s(
    "WAN",
    "Medium",
    "How does an MPLS VPN service provider exchange customer OSPF routes between Provider Edge (PE) routers across its core while keeping overlapping private IPv4 subnets (such as 10.0.0.0/8) isolated between different enterprise customers?",
    "The PE routers redistribute customer OSPF routes into Multiprotocol BGP (MP-BGP) using separate per-customer routing tables",
    [
      ["The PE routers run a single shared OSPF Area 0 instance across all customers and use NAT to translate overlapping 10.0.0.0/8 subnets", "MPLS VPNs allow customers to use overlapping private IP addresses without NAT by keeping routing tables logically separated."],
      ["The PE routers encapsulate customer OSPF Hello packets inside GRE tunnels so CE routers form direct OSPF adjacencies", "In an MPLS Layer 3 VPN, CE routers peer with PE routers rather than tunneling OSPF hellos through GRE to other CE routers."],
      ["The PE routers block all dynamic routing protocols and require customers to configure static default routes pointing to a central DSLAM", "MPLS VPNs support dynamic PE-CE routing protocols including OSPF, EIGRP, RIPv2, and eBGP."]
    ],
    "When a customer uses OSPF (or EIGRP/RIP) on the PE-CE link, the ingress PE router learns the customer's routes and redistributes them into Multiprotocol BGP (MP-BGP). MP-BGP advertises those routes to the other PE routers with customer-specific identifiers so overlapping private address spaces remain completely isolated.",
    "PE routers use Route Redistribution between the customer routing protocol (OSPF/EIGRP/RIP) and MP-BGP inside the provider network.",
    []
  ),
  c14w.s(
    "WAN",
    "Medium",
    "In a residential or small-business Digital Subscriber Line (DSL) Internet connection, what is the function of the DSL Access Multiplexer (DSLAM) located at the telephone company's Central Office (CO)?",
    "It splits high-frequency digital DSL data streams toward an ISP router from low-frequency analog voice toward the PSTN",
    [
      ["It converts fiber-optic light pulses from a Metro Ethernet PoP into coaxial CATV television channels inside the customer home", "A DSLAM sits at the telco Central Office (CO) terminating copper telephone local loops, not coaxial CATV cables inside the home."],
      ["It encrypts customer IP packets with a shared session key before forwarding them over a 4G/5G cellular radio tower", "Encrypting packets with a session key is performed by an IPsec VPN device, and cellular towers are used in wireless WANs."],
      ["It assigns 802.1Q VLAN tags to multiple E-Line virtual circuits multiplexed onto a single 10GBASE-LR fiber access link", "Multiplexing E-Line EVCs with 802.1Q tags occurs on a Metro Ethernet UNI, not on a telco DSLAM."]
    ],
    "DSL transmits high-frequency digital data and traditional analog voice simultaneously over the same copper telephone line (local loop). At the telco Central Office (CO), the DSLAM splits the digital data stream out to a router connected to the Internet and sends the analog voice signal to the PSTN voice switch.",
    "Home side = DSL modem on the phone line; Telco Central Office (CO) side = DSLAM (splits data to router and voice to PSTN switch).",
    []
  ),
  c14w.s(
    "WAN",
    "Hard",
    "Central headquarters router R1 connects to three remote branch routers (R2, R3, and R4) using three Metro Ethernet E-Line services multiplexed over a single 10-Gbps physical fiber access link on R1's `GigabitEthernet0/1` interface. Examined on R3, the routing table shows:\n`O 10.1.2.0/24 [110/20] via 10.1.13.1, 02:14:09, GigabitEthernet0/1.13`\nWhy does R3 use 10.1.13.1 as its next-hop IP address to reach R2's LAN subnet (10.1.2.0/24)?",
    "Each E-Line is a separate point-to-point EVC to R1, so R3 has no direct Layer 2 path to R2 and routes packets via R1",
    [
      ["R3 and R2 share WAN subnet 10.1.13.0/24, and OSPF elected R1 at 10.1.13.1 as the Designated Router to relay all packets", "Even when OSPF elects a DR on a shared LAN, next-hop IP addresses point directly to the advertising router on that subnet; here, R2 and R3 are on completely different point-to-point E-Line subnets."],
      ["The `.13` subinterface indicates an MPLS label of 13 assigned by the Provider Edge (PE) router at 10.1.13.1", "Metro Ethernet E-Line is a Layer 2 service where `.13` is an 802.1Q VLAN subinterface between customer routers R1 and R3, not an MPLS PE router."],
      ["R2's WAN interface failed, causing R3 to fall back from its direct E-Line with R2 to a backup E-Tree leaf connection through R1", "With three E-Lines terminating at central router R1 (R1-R2, R1-R3, R1-R4), there is no direct E-Line between R2 and R3."]
    ],
    "When a central site uses multiple E-Line services over a single physical access link, 802.1Q trunking assigns each point-to-point E-Line EVC a separate VLAN ID and IP subnet (such as `10.1.12.0/24` for R1-R2 and `10.1.13.0/24` for R1-R3). Because R3 only has an E-Line to R1, R3 forms an OSPF adjacency only with R1 (10.1.13.1) and routes branch-to-branch traffic through R1.",
    "Multiple E-Lines on one physical access link use 802.1Q subinterfaces and separate IP subnets per E-Line.",
    [],
    {
      cli: "R3# show ip route ospf\nO     10.1.1.0/24 [110/11] via 10.1.13.1, 02:14:09, GigabitEthernet0/1.13\nO     10.1.2.0/24 [110/20] via 10.1.13.1, 02:14:09, GigabitEthernet0/1.13\nO     10.1.12.0/24 [110/12] via 10.1.13.1, 02:14:09, GigabitEthernet0/1.13"
    }
  ),
  c14v.s(
    "VPN",
    "Hard",
    "Host PC1 (`10.2.2.2`) at a branch office sends a packet to Server S1 (`10.1.1.1`) at headquarters. Branch router BR1 (`64.100.9.9`) and headquarters firewall FW1 (`128.107.1.1`) connect the two sites using an IPsec site-to-site VPN tunnel over the Internet. What are the source and destination IP addresses visible in the outer IP header while the packet traverses the Internet, and what happens to the original IP header?",
    "The outer IP header has source `64.100.9.9` and destination `128.107.1.1`, and the entire original IP packet is encrypted inside",
    [
      ["The outer IP header has source `10.2.2.2` and destination `10.1.1.1`, while only the TCP/UDP payload is encrypted by IPsec", "Private RFC 1918 addresses (`10.x.x.x`) cannot be routed across the public Internet; the VPN tunnel encapsulates the encrypted packet in a new outer IP header with public tunnel endpoint IPs."],
      ["The outer IP header has source `64.100.9.9` and destination `10.1.1.1` after BR1 performs PAT on the source IP prior to encryption", "In a site-to-site VPN tunnel, the outer destination IP must be the public IP of the remote VPN peer (`128.107.1.1`), not the private server IP."],
      ["The outer IP header has source `10.2.2.2` and destination `128.107.1.1`, and FW1 uses unencrypted GRE headers to hide the payload", "GRE alone performs encapsulation without encryption; IPsec encrypts the entire original packet and encapsulates it with public source and destination IPs."]
    ],
    "In an IPsec site-to-site VPN tunnel, the sending VPN gateway (`64.100.9.9`) encrypts the entire original IP packet (including its private `10.2.2.2` source and `10.1.1.1` destination header) using a shared session key, prepends VPN headers, and encapsulates it inside a new outer IP header addressed from `64.100.9.9` to `128.107.1.1`.",
    "Site-to-site IPsec VPN: Original private IP packet is encrypted inside; new outer IP header uses public IPs of the two VPN gateways.",
    []
  ),
  c14v.s(
    "VPN",
    "Hard",
    "How does a remote user connecting from a coffee shop with the Cisco AnyConnect Secure Mobility Client differ from a user simply opening an HTTPS (`https://`) web application in a standard browser tab?",
    "AnyConnect uses a TLS VPN tunnel to encrypt all enterprise IP traffic from the PC, whereas HTTPS encrypts only that browser tab",
    [
      ["AnyConnect uses unencrypted GRE tunnels over UDP port 69, whereas browser HTTPS uses IPsec with pre-shared session keys", "Both AnyConnect remote access VPNs and HTTPS web browsing commonly use TLS encryption (typically over TCP port 443), not UDP port 69."],
      ["AnyConnect establishes a permanent hardware site-to-site VPN for everyone in the coffee shop, whereas HTTPS is on-demand for one PC", "AnyConnect is an on-demand software client installed on a single endpoint device to protect only that one device's traffic."],
      ["AnyConnect relies on the deprecated SSL 2.0 protocol, whereas browser HTTPS uses Multiprotocol Label Switching (MPLS) labels", "SSL has been deprecated (RFC 7568) and replaced by TLS for both HTTPS web sessions and AnyConnect remote access VPNs."]
    ],
    "While both HTTPS web browsing and the Cisco AnyConnect Secure Mobility Client use Transport Layer Security (TLS) to authenticate and encrypt traffic, an HTTPS browser session secures only the HTTP traffic inside that browser tab. The AnyConnect client creates a remote-access TLS VPN tunnel to an enterprise firewall or router that encrypts packets for all enterprise applications running on the PC.",
    "Remote Access VPN = TLS (on-demand, single device, via AnyConnect or browser); Site-to-Site VPN = IPsec/GRE (permanent, many devices).",
    []
  ),
  c14w.m(
    "WAN",
    "Medium",
    "Which two statements accurately describe physical access link options for Metro Ethernet and MPLS VPN WANs?",
    [
      "Metro Ethernet access links typically use long-range fiber standards like 1000BASE-LX (5 km), 10GBASE-LR (10 km), or 1000BASE-ZX (100 km)",
      "MPLS VPNs support almost any Layer 1/Layer 2 access link—such as serial TDM, MetroE, cable, or cellular—since PE routers strip the L2 header"
    ],
    [
      ["Metro Ethernet access links are limited to 100-meter copper UTP cables (1000BASE-T) between the customer site and the service provider PoP", "Because the provider PoP is typically kilometers away from the customer site, MetroE access links use long-distance single-mode fiber Ethernet standards rather than 100m UTP."],
      ["MPLS VPNs require every site in an enterprise to use the exact same physical Layer 1 access link technology so Layer 2 frames remain intact end-to-end", "Because MPLS is a Layer 3 routed service that strips and rebuilds Layer 2 headers at each PE router, different sites can mix Ethernet, serial, cable, and cellular access links."],
      ["Both Metro Ethernet and MPLS VPNs require a telco DSLAM at the customer premises to split analog voice from digital MPLS labels", "A DSLAM is located at the telco Central Office (CO) and is used only for DSL copper local loops."]
    ],
    "Metro Ethernet requires an Ethernet physical link from the customer to the provider's PoP, typically using long-reach fiber standards (such as 100BASE-LX10, 1000BASE-LX, 1000BASE-ZX, 10GBASE-LR, or 10GBASE-ER). By contrast, MPLS is a Layer 3 service whose PE routers strip incoming data-link headers, allowing an enterprise to mix MetroE, serial TDM, cable, DSL, and 4G/5G links across different sites.",
    "MetroE = Ethernet access links (usually long-range fiber); MPLS = any Layer 1/Layer 2 access link.",
    []
  ),
  c14v.d(
    "VPN",
    "Medium",
    "Place the four steps of the IPsec encryption and decryption process in the exact chronological order they occur as a packet travels between two site-to-site VPN routers.",
    [
      "The sending VPN router feeds the original clear-text IP packet and the shared session key into the encryption algorithm to produce encrypted data",
      "The sending VPN router encapsulates the encrypted data by adding a VPN header and a new outer IP header addressed to the remote VPN peer",
      "The sending VPN router forwards the encapsulated VPN packet across the public Internet to the destination VPN device",
      "The receiving VPN device strips the outer headers and runs the matching decryption algorithm using the encrypted data and the same shared session key to recover the original IP packet"
    ],
    "IPsec encryption uses a matched pair of mathematical formulas and a shared secret encryption key (session key). The sender encrypts the original IP packet with the session key, encapsulates the ciphertext with a VPN header and outer public IP header, routes it over the Internet, and the receiver uses the matching decryption formula and identical session key to reconstruct the original clear-text packet.",
    "Remember: Encrypt(Original Packet + Session Key) -> Add VPN & Outer IP Headers -> Route over Internet -> Decrypt(Ciphertext + Session Key).",
    []
  ),
  c14w.t(
    "WAN",
    "Hard",
    "Match each WAN technology or IEEE fiber Ethernet access standard to its correct characteristic or maximum distance.",
    [
      ["1000BASE-LX", "1 Gbps fiber Ethernet standard supporting distances up to 5 km"],
      ["1000BASE-ZX", "1 Gbps fiber Ethernet standard supporting distances up to 100 km"],
      ["10GBASE-LR", "10 Gbps fiber Ethernet standard supporting distances up to 10 km"],
      ["10GBASE-ER", "10 Gbps fiber Ethernet standard supporting distances up to 40 km"],
      ["Cable Internet & DSL", "Asymmetric consumer broadband technologies offering faster downstream speeds than upstream speeds over existing CATV or phone wiring"]
    ],
    "Long-reach fiber Ethernet standards enable Metro Ethernet access links to span city distances to a provider PoP: 1000BASE-LX (1 Gbps, 5 km), 1000BASE-LX10 (1 Gbps, 10 km), 1000BASE-ZX (1 Gbps, 100 km), 10GBASE-LR (10 Gbps, 10 km), and 10GBASE-ER (10 Gbps, 40 km). Meanwhile, DSL and Cable Internet leverage existing telephone and CATV copper plants with asymmetric speeds.",
    "Distance memory aid: 1000BASE-LX = 5 km, 10GBASE-LR = 10 km, 10GBASE-ER = 40 km, 1000BASE-ZX = 100 km.",
    []
  )
];

// ============================================================================
// v2c15: Cloud Architecture
// ============================================================================
const c15 = mk("Network Fundamentals", 20, "v2c15");
const q15 = [
  c15.s(
    "Virtualization",
    "Easy",
    "In server virtualization, which software layer runs on the physical host server to manage and allocate physical CPU, RAM, storage, and network resources to individual Virtual Machines (VMs)?",
    "Server Hypervisor (VMM)",
    [
      ["Virtual Switch (vSwitch)", "A vSwitch provides Layer 2 Ethernet switching between virtual NICs (vNICs) and physical NICs, but it does not allocate CPU, RAM, or disk storage."],
      ["Cloud Services Catalog", "A cloud services catalog is a self-service web portal where users request cloud resources via APIs rather than the host-level hardware manager."],
      ["Container Orchestrator", "The software layer shown managing and allocating host hardware directly to full virtual machine OS instances is the hypervisor (such as VMware ESXi, Microsoft Hyper-V, Citrix XenServer, or Red Hat KVM)."]
    ],
    "A hypervisor decouples operating system instances (VMs) from the underlying physical server hardware (host). It allocates virtual CPUs (vCPUs), RAM, storage, and virtual NICs to each VM so multiple independent OS instances can run concurrently on a single physical host.",
    "Physical server = Host; Software managing hardware allocation = Hypervisor; Virtualized OS instance = VM.",
    []
  ),
  c15.s(
    "Cloud",
    "Easy",
    "Which cloud computing service model provides the consumer with pre-installed software development environments, continuous integration tools (such as Jenkins), and IDEs (such as Eclipse) on top of an OS?",
    "Platform as a Service (PaaS)",
    [
      ["Infrastructure as a Service (IaaS)", "IaaS provides virtualized computing hardware (vCPU, RAM, storage) and a base OS where the customer must install their own applications and tools."],
      ["Software as a Service (SaaS)", "SaaS provides a complete, ready-to-use end-user application (such as Office 365 Exchange Online or Dropbox) while hiding the OS and hardware."],
      ["Network as a Service (NaaS)", "An intercloud exchange provides private WAN connectivity between enterprises and multiple public cloud providers, not a software development platform."]
    ],
    "Platform as a Service (PaaS) targets software developers by providing virtual machines preloaded with an operating system plus development platforms, IDEs, and continuous integration tools (such as Google App Engine, Eclipse, and Jenkins).",
    "IaaS = VM + OS (you install apps); PaaS = Development platform/tools for coders; SaaS = Ready-to-use application for end users.",
    []
  ),
  c15.s(
    "Cloud",
    "Easy",
    "In CCNA exam terminology, how do the terms 'on-premises' and 'cloud' map to traditional cloud deployment models?",
    "On-premises refers to an internal company-owned private cloud, whereas cloud refers to an external public cloud",
    [
      ["On-premises refers to unvirtualized physical desktop PCs only, whereas cloud refers to any server running a hypervisor", "An enterprise can run a fully virtualized data center with self-service catalog automation on-premises as a private cloud."],
      ["On-premises refers to Software as a Service (SaaS), whereas cloud refers to Infrastructure as a Service (IaaS)", "IaaS, PaaS, and SaaS are service models that can be deployed in either a private (on-premises) or public cloud."],
      ["On-premises refers to a Top-of-Rack switch, whereas cloud refers to an End-of-Row switch in the same room", "Top-of-Rack (ToR) and End-of-Row (EoR) are physical data center switch placement designs, not cloud deployment models."]
    ],
    "A private cloud is built and owned by an enterprise to deliver cloud services (meeting the five NIST criteria) to its own internal departments, which the CCNA blueprint refers to as 'on-premises.' A public cloud is owned by an external provider (like AWS, Azure, or Google Cloud) that sells cloud services to many external customers.",
    "Private Cloud = On-premises (internal company provider & consumer); Public Cloud = Cloud (external provider selling to many enterprises).",
    []
  ),
  c15.s(
    "Virtualization",
    "Easy",
    "In a traditional data center rack layout, how are Top of Rack (ToR) switches and End of Row (EoR) switches connected to provide redundancy for physical host servers?",
    "Each server connects its two physical NICs to two ToR access switches that uplink to redundant EoR distribution switches",
    [
      ["Each server connects directly to two EoR switches first and those switches downlink to ToR switches acting as core routers", "Servers connect to the Top of Rack (ToR) switches in their rack, and the ToR switches uplink to End of Row (EoR) distribution switches."],
      ["Every ToR switch connects only to other ToR switches in a daisy-chain ring without using any distribution layer switches", "ToR switches act as access switches and uplink to EoR distribution switches rather than forming a daisy-chain ring."],
      ["Each server uses a single physical NIC connected to one ToR switch because virtual switches cannot support redundant uplinks", "Virtualized hosts typically have two or more physical NICs cabled to two separate ToR switches for hardware and link redundancy."]
    ],
    "In a traditional data center LAN, Top of Rack (ToR) switches sit at the top of each server rack and function as access layer switches, while End of Row (EoR) switches function as distribution layer switches aggregating the ToR switches. Dual-homing each server's physical NICs to two ToR switches eliminates single points of failure at the rack level.",
    "ToR (Top of Rack) = Data center Access layer; EoR (End of Row) = Data center Distribution layer.",
    []
  ),
  c15.s(
    "Virtualization",
    "Medium",
    "A physical server host contains two CPU sockets. Each CPU chip has 8 cores and supports multithreading with 2 concurrent threads per core. How many virtual CPUs (vCPUs) can the hypervisor allocate across the VMs on this host?",
    "32 vCPUs",
    [
      ["16 vCPUs", "16 threads is the capacity of a single 8-core chip with 2 threads per core; with two CPU chips installed, the total is 2 * 16 = 32 vCPUs."],
      ["8 vCPUs", "8 is the number of cores in a single CPU socket, ignoring both the second CPU socket and multithreading."],
      ["64 vCPUs", "With 2 sockets * 8 cores * 2 threads per core, the hardware supports 32 concurrent execution threads (vCPUs), not 64."]
    ],
    "A hypervisor treats each concurrent hardware execution thread as a virtual CPU (vCPU). With 2 CPU chips * 8 cores per chip * 2 threads per core (multithreading), the host provides 32 concurrent threads, or 32 vCPUs.",
    "vCPUs = (Number of CPU chips) * (Cores per chip) * (Threads per core).",
    []
  ),
  c15.s(
    "Virtualization",
    "Medium",
    "Six Virtual Machines (VMs) run on a single physical host server that has only two physical Ethernet NICs. How do all six VMs communicate on the network and get assigned to different VLANs?",
    "Each VM has a virtual NIC (vNIC) connected to an internal virtual switch (vSwitch) that trunks over the host's two physical NICs",
    [
      ["Four of the VMs must remain powered off at any given time because each running VM requires a dedicated physical Ethernet NIC", "A virtual switch (vSwitch) allows dozens of VMs with vNICs to share two physical NICs simultaneously."],
      ["All six VMs share a single MAC address and IP address on Physical NIC 1 while Physical NIC 2 is reserved for the hypervisor BIOS", "Each VM has its own independent OS, its own vNIC with a unique MAC address, and its own IP address."],
      ["The hypervisor encapsulates all VM traffic inside CAPWAP tunnels and sends it to a Wireless LAN Controller for VLAN assignment", "CAPWAP is used by lightweight wireless access points to communicate with a WLC, not by server hypervisors."]
    ],
    "Inside a virtualized host, each VM is given at least one virtual NIC (vNIC). All vNICs connect internally to a software virtual switch (vSwitch), such as the Cisco Nexus 1000VE. The vSwitch assigns each vNIC port to its appropriate VLAN and uses 802.1Q VLAN trunking over the host's two physical NICs to reach the external Top-of-Rack switches.",
    "VM -> vNIC -> vSwitch (assigns VLANs & trunks) -> Physical NICs -> External physical switch (ToR).",
    []
  ),
  c15.s(
    "Cloud",
    "Medium",
    "A company operates a fully virtualized data center where developers submit a ticket to the virtualization team whenever they need new VMs, and an engineer runs a script the next day to create them. Which NIST cloud computing criterion is missing from this workflow?",
    "On-demand self-service, because provisioning requires manual IT tickets instead of automated self-service",
    [
      ["Resource pooling, because running multiple VMs on shared physical servers is prohibited in a cloud environment", "Virtualizing servers into shared capacity is the exact definition of resource pooling, which this data center already has."],
      ["Broad network access, because scripts can only be executed from a local KVM console cable attached to the server blade", "Cisco UCS blades and virtualized servers operate headless (no KVM) and are accessed over the network."],
      ["Hardware decoupling, because an operating system in a virtualized data center is permanently tied to one physical CPU chip", "VMs in a virtualized data center are already decoupled from the hardware and can be migrated between hosts."]
    ],
    "Server virtualization alone does not equal cloud computing. According to the NIST definition, a cloud service must provide on-demand self-service—typically via a web-based cloud services catalog integrated with virtualization APIs—so consumers can provision and stop services automatically in minutes without waiting for a human engineer.",
    "Virtualization != Cloud. Cloud requires the 5 NIST traits: On-demand self-service, Broad network access, Resource pooling, Rapid elasticity, and Measured service.",
    []
  ),
  c15.s(
    "Cloud",
    "Medium",
    "An enterprise wants to run a Cisco router inside a public cloud provider's IaaS environment so the enterprise can control its own IPsec VPN termination and routing policies in the cloud. Which Cisco product fulfills this role?",
    "Cisco Cloud Services Router (CSR) 1000V, deployed as a virtual router VM in the cloud environment",
    [
      ["Cisco Unified Computing System (UCS) B-Series Blade Chassis, installed at the enterprise branch office", "Cisco UCS B-Series is physical blade server hardware for a data center rack, not a virtual router VM running inside a public cloud."],
      ["Cisco Nexus 1000VE, deployed as a physical core router appliance at the ISP's Central Office", "The Nexus 1000VE is a software virtual switch (vSwitch) for hypervisors, not a physical WAN router appliance."],
      ["Cisco AnyConnect Secure Mobility Client, installed on the public cloud provider's Top-of-Rack switch", "AnyConnect is an endpoint remote-access VPN client for user PCs and mobile devices, not a cloud router VM."]
    ],
    "The Cisco Cloud Services Router (CSR) is a virtual router that runs as a VM inside a public or private cloud environment. It allows the enterprise cloud consumer to configure familiar Cisco IOS routing and VPN termination features directly inside the public cloud.",
    "Cisco CSR (Cloud Services Router) = virtual router running as a VM in the cloud; Cisco UCS = physical server hardware; Nexus 1000VE = virtual switch.",
    []
  ),
  c15.s(
    "Cloud",
    "Hard",
    "An enterprise requires a WAN connection to a public cloud provider that guarantees data privacy, supports end-to-end QoS markings for voice/video, and allows easy migration to a different public cloud provider in the future without ordering new physical WAN circuits. According to the public cloud WAN comparison, which WAN option meets all three requirements?",
    "Connecting the enterprise via a private WAN circuit to a multi-provider Intercloud Exchange",
    [
      ["Connecting directly to the public cloud provider using an MPLS VPN or Metro Ethernet WAN circuit", "Direct MPLS or MetroE circuits provide privacy and QoS, but migrating to a new cloud provider requires ordering and installing new private WAN circuits."],
      ["Connecting to the public cloud provider over the public Internet using an IPsec VPN tunnel", "An Internet VPN provides privacy and easy provider migration, but it cannot provide QoS because it traverses the public Internet."],
      ["Connecting to the public cloud provider over the public Internet without a VPN tunnel", "The unencrypted Internet provides neither data privacy nor QoS guarantees."]
    ],
    "An Intercloud Exchange connects to enterprise customers via private WAN circuits on one side and maintains pre-built private WAN connections to multiple public cloud providers on the other side. This delivers the privacy and QoS benefits of a private WAN (MPLS/MetroE) while allowing rapid software-defined migration from one cloud provider to another.",
    "Compare cloud WAN options: Internet VPN = Private + Easy Migration (No QoS); Direct MPLS/MetroE = Private + QoS (Hard Migration); Intercloud Exchange = Private + QoS + Easy Migration.",
    []
  ),
  c15.s(
    "Cloud",
    "Hard",
    "An enterprise with 50 branch offices connected via private WAN links to a central headquarters (where the company's only Internet circuits reside) migrates its internal headquarters Exchange email servers to a public cloud SaaS email service (Office 365). What happens to WAN traffic when a branch user emails a 20-MB attachment to a coworker sitting at the next desk in the same branch office?",
    "Private WAN usage remains unchanged while HQ Internet link usage increases because the 20-MB email hairpins via HQ to the cloud and back",
    [
      ["Private WAN usage drops to zero because the two branch PCs automatically transfer the 20-MB SaaS email directly across their local branch LAN switch", "Email clients send and retrieve messages via the cloud SaaS email servers, not peer-to-peer between desktop PCs."],
      ["Central Internet link usage drops by 50% because moving email servers to the public cloud keeps all internal company emails inside the private MPLS WAN", "Once email moves to a public cloud SaaS provider reached via the Internet, 100% of branch email traffic must traverse the enterprise's Internet circuits."],
      ["Both private WAN and central Internet link usage drop because SaaS applications compress all attachments into 64-byte metadata pointers", "The full 20-MB attachment must be uploaded to the cloud email server by the sender and downloaded by the recipient."]
    ],
    "When branch offices lack local Internet breakouts and route all traffic through a central site, migrating an internal headquarters app to a public cloud SaaS offering does not reduce private WAN traffic—branch traffic still traverses the private WAN to reach HQ—and it adds 100% of that application's traffic onto HQ's Internet links in both directions.",
    "Migrating HQ apps to public SaaS without local branch Internet breakouts keeps private WAN load the same AND increases HQ Internet load.",
    []
  ),
  c15.s(
    "Cloud",
    "Hard",
    "To solve the bandwidth bottleneck caused by backhauling branch SaaS traffic through headquarters, an enterprise installs local broadband Internet connections at each branch office. What is the primary trade-off introduced by adding direct Internet access at every branch?",
    "It offloads cloud traffic from the private WAN, but requires Internet security controls at each branch",
    [
      ["It eliminates the need for any capacity planning on the new branch Internet links because public cloud traffic uses zero bandwidth", "Capacity planning is required for every WAN option (Internet, VPN, MPLS, MetroE, and Intercloud) when migrating workloads to the cloud."],
      ["It guarantees strict end-to-end QoS SLAs from consumer broadband ISPs for all interactive voice and video traffic", "Public Internet connections do not provide end-to-end QoS or WAN performance SLAs across the Internet."],
      ["It prevents remote salespeople outside the branch from accessing the SaaS application over the Internet", "Public cloud SaaS applications remain accessible over the Internet to distributed and mobile users anywhere."]
    ],
    "Adding local Internet connections at branch offices allows cloud-bound traffic (such as SaaS email) to exit directly to the Internet, saving private WAN and central site Internet bandwidth. However, instead of concentrating firewalls and security monitoring at a few central Internet edge links, the enterprise must now secure Internet edges at every branch.",
    "Direct branch Internet breakout = better path & lower central WAN cost, but distributed security footprint at every branch.",
    []
  ),
  c15.m(
    "Cloud",
    "Medium",
    "Which three characteristics are part of the five essential cloud computing criteria defined by the US National Institute of Standards and Technology (NIST)?",
    [
      "On-demand self-service, allowing consumers to provision services automatically without human interaction with the provider",
      "Resource pooling and rapid elasticity, allowing shared provider capacity to scale up and down quickly on demand",
      "Measured service and broad network access, allowing usage metering/billing and access over diverse networks and devices"
    ],
    [
      ["Dedicated single-tenant physical servers that are manually cabled and bolted into a rack for each individual request", "Cloud computing relies on resource pooling of virtualized capacity rather than manually cabling dedicated hardware per request."],
      ["Mandatory use of Multiprotocol Label Switching (MPLS) as the sole network access method to reach the data center", "Broad network access means the cloud service is reachable over many network types (especially the Internet) and from diverse client devices."],
      ["Permanent keyboard, video display, and mouse (KVM) terminals attached to every virtual machine in the catalog", "Data center servers operate without permanent KVMs, and VMs are accessed remotely over the network."]
    ],
    "The five NIST cloud computing characteristics are: (1) On-demand self-service, (2) Broad network access, (3) Resource pooling, (4) Rapid elasticity, and (5) Measured service.",
    "Memorize the 5 NIST cloud traits: On-demand self-service, Broad network access, Resource pooling, Rapid elasticity, Measured service.",
    []
  ),
  c15.d(
    "Cloud",
    "Medium",
    "Place the steps of the automated private cloud workflow in the exact order they occur when an internal developer provisions a new VM.",
    [
      "The cloud engineering team builds the virtualized resource pool and publishes pre-tested offerings in the cloud services catalog",
      "The developer logs into the self-service cloud services catalog web portal and selects the desired VM service",
      "The cloud services catalog software automatically calls the northbound API of the data center virtualization software",
      "The virtualization software instantiates (spins up) the requested VM on a physical host and programs the virtual switch (vSwitch) automatically"
    ],
    "In a private cloud, the cloud team pre-builds the resource pool and catalog offerings. When a developer requests a VM from the self-service catalog, no human ticket handling is needed: the catalog software uses APIs to instruct the virtualization system to spin up the VM and configure its vSwitch networking automatically.",
    "Private cloud workflow: Cloud team builds catalog -> User clicks self-service catalog -> Catalog calls Virtualization API -> VM & vSwitch spin up automatically.",
    []
  ),
  c15.t(
    "Cloud",
    "Medium",
    "Match each cloud or data center virtualization term to its correct role or example.",
    [
      ["Infrastructure as a Service (IaaS)", "Cloud model delivering virtualized CPU, RAM, storage, and an optional base OS where the customer installs their own apps"],
      ["Platform as a Service (PaaS)", "Cloud model delivering an OS preloaded with software development environments and continuous integration tools"],
      ["Software as a Service (SaaS)", "Cloud model delivering a complete working application (such as Google Drive, Dropbox, or Office 365) over the network"],
      ["Cisco Unified Computing System (UCS)", "Cisco's data center physical server hardware product line, including rack-mountable B-Series blade chassis"],
      ["Cisco Nexus 1000VE / ACI Virtual Edge", "Software virtual switch (vSwitch) running inside a virtualized host to connect VM vNICs to physical NICs"]
    ],
    "Understanding cloud architecture requires distinguishing physical server hardware (Cisco UCS), host-level virtual networking (vNICs and vSwitches like Nexus 1000VE), and the three '-aaS' cloud service models (IaaS for raw VM infrastructure, PaaS for developer platforms, and SaaS for turnkey software applications).",
    "Match the layer: Hardware = UCS; Virtual Switch = Nexus 1000VE; VM+OS = IaaS; Dev Tools = PaaS; Full App = SaaS.",
    []
  )
];

// ============================================================================
// v2c16: Introduction to Controller-Based Networking
// ============================================================================
const c16 = mk("Automation and Programmability", 10, "v2c16");
const q16 = [
  c16.s(
    "SDN",
    "Easy",
    "Which plane of a networking device is responsible for per-packet or per-frame forwarding actions such as matching the MAC address table, matching the IP routing table, performing NAT, and discarding packets filtered by an ACL?",
    "Data or Forwarding Plane",
    [
      ["Distributed Control Plane", "The control plane runs protocols like OSPF, STP, and ARP to build and populate the forwarding tables, rather than forwarding individual user packets."],
      ["Device Management Plane", "The management plane handles device administration and monitoring protocols such as SSH, Telnet, SNMP, and Syslog."],
      ["Northbound Interface Plane", "Northbound refers to the API interface between an SDN controller and external automation applications, not a plane inside a router or switch."]
    ],
    "The data plane (also called the forwarding plane) encompasses every action a router or switch performs on user traffic as it enters, is processed, and exits the device—including table lookups, encapsulation/de-encapsulation, 802.1Q tagging, NAT translation, VPN encryption, and ACL filtering.",
    "Data plane = processes and forwards every user packet; Control plane = builds the tables; Management plane = SSH/Telnet/SNMP/Syslog.",
    []
  ),
  c16.s(
    "SDN",
    "Easy",
    "Which group of protocols and processes operates exclusively within the control plane of traditional routers and switches?",
    "OSPF, EIGRP, BGP, STP, IPv4 ARP, IPv6 NDP, and switch source-MAC table learning",
    [
      ["SSH, Telnet, SNMP, Syslog, and TFTP configuration file backups", "SSH, Telnet, SNMP, and Syslog belong to the management plane because they allow engineers to manage and monitor the device."],
      ["IPv4 destination routing table lookups, NAT IP address translation, and 802.1Q VLAN tag insertion", "Lookup, translation, and frame tagging performed on transit user packets belong to the data plane."],
      ["JSON serialization, YAML playbook formatting, and Postman REST client requests", "These are software automation and data modeling tools rather than device control plane protocols."]
    ],
    "The control plane includes any protocol or process that controls how the data plane behaves, primarily by learning network topology and populating forwarding tables (such as the IP routing table, ARP/NDP cache, and MAC address table) or blocking loops (STP).",
    "If a protocol builds a table (OSPF, EIGRP, RIP, BGP, ARP, NDP, MAC learning) or controls port forwarding state (STP), it is Control Plane.",
    []
  ),
  c16.s(
    "SDN",
    "Easy",
    "Inside a Cisco LAN switch, why are data plane frame forwarding and table lookups performed by an ASIC and TCAM rather than by the general-purpose CPU and RAM?",
    "Switches forward millions of frames per second, and TCAM provides instant hardware table lookups for the ASIC",
    [
      ["ASICs and TCAM are used only to store the Cisco IOS `.bin` image and NVRAM `startup-config` when power is removed", "Flash and NVRAM store the IOS image and startup-config; ASICs and TCAM handle high-speed real-time frame forwarding."],
      ["The general-purpose CPU and RAM cannot run control plane protocols like STP or management protocols like SSH", "Cisco IOS runs in the general-purpose CPU and RAM to handle control plane protocols (like STP/OSPF) and management plane protocols (like SSH/SNMP)."],
      ["TCAM encrypts management plane Telnet packets while the ASIC compiles Python scripts into YAML files", "ASIC (Application-Specific Integrated Circuit) executes hardware switching logic and TCAM (Ternary Content-Addressable Memory) performs ultra-fast hardware table lookups."]
    ],
    "Even a 24-port 1-Gbps switch can receive tens of millions of frames per second at line rate—far faster than a general-purpose CPU can process in software. Switches use purpose-built ASIC chips for data plane logic and TCAM memory for instantaneous hardware table lookups without algorithmic search loops.",
    "CPU + RAM = IOS, Control plane, Management plane; ASIC + TCAM = Hardware Data plane (and hardware source-MAC learning).",
    []
  ),
  c16.s(
    "Controllers",
    "Easy",
    "In a controller-based network architecture, what is the difference between a Southbound Interface (SBI) and a Northbound Interface (NBI)?",
    "The SBI connects the controller downward to network devices, whereas the NBI connects the controller upward to applications",
    [
      ["The SBI connects the controller upward to Python automation scripts, whereas the NBI connects the controller downward to switches via OpenFlow", "This reverses north and south: on architecture diagrams, applications sit above (north of) the controller and network devices sit below (south of) the controller."],
      ["The SBI is the physical RJ-45 console port on a router, whereas the NBI is the fiber-optic SFP uplink port on a switch", "In SDN architecture, NBI and SBI refer to software/protocol interfaces (APIs and protocols) on the controller, not physical cable ports."],
      ["The SBI is used exclusively for unencrypted HTTP GET requests, whereas the NBI is used exclusively for SNMPv1 Traps", "NBIs typically use REST APIs (HTTP/HTTPS with JSON/XML), while SBIs use protocols like OpenFlow, OpFlex, NETCONF, SSH, or SNMP."]
    ],
    "In SDN diagrams, the controller sits in the middle: its Southbound Interface (SBI) communicates downward with the networking devices (using protocols like OpenFlow, OpFlex, NETCONF, or SSH/SNMP), while its Northbound Interface (NBI) provides APIs (typically REST APIs) upward to automation scripts and management applications.",
    "Northbound (NBI) = Controller <-> Applications (REST API); Southbound (SBI) = Controller <-> Network Devices (OpenFlow, OpFlex, NETCONF, SSH/SNMP).",
    []
  ),
  c16.s(
    "Controllers",
    "Medium",
    "In a single-site Cisco Application Centric Infrastructure (ACI) spine-and-leaf topology, how must the spine switches, leaf switches, and endpoints (such as servers and routers) be cabled?",
    "Every leaf switch connects to every spine switch, endpoints connect only to leaf switches, and no spine-to-spine or leaf-to-leaf links are allowed",
    [
      ["Every spine switch connects to every other spine switch in a full mesh, and high-speed Cisco UCS servers connect directly to the spine switches", "In ACI spine-leaf (Clos) architecture, spine switches never connect to each other and endpoints never connect to spine switches."],
      ["Every leaf switch connects to two neighboring leaf switches in a ring, and WAN routers connect directly to the APIC controller for data forwarding", "Leaf switches do not connect to each other, and the APIC controller is not in the data path for user packets."],
      ["Each leaf switch connects to only one spine switch in a star topology, while the APIC controller acts as the central core switch", "Each leaf switch must connect to every spine switch (and vice versa), while the APIC connects to leaf switches as a controller endpoint."]
    ],
    "Cisco ACI uses a strict spine-and-leaf (Clos) physical topology: every leaf switch connects to every spine switch, neither spines nor leaves connect to switches of the same role, and all endpoints (servers, hypervisors, external routers, and APIC controllers) connect only to leaf switches.",
    "ACI Spine-Leaf rules: Leaf <-> All Spines; Spine <-> All Leaves; NO Spine-to-Spine; NO Leaf-to-Leaf; Endpoints -> Leaf ONLY.",
    []
  ),
  c16.s(
    "Controllers",
    "Medium",
    "How does Cisco Application Centric Infrastructure (ACI) use Endpoint Groups (EPGs) and policies with its APIC controller to implement intent-based networking in a data center?",
    "Engineers define EPGs and security policies on the APIC, and the APIC uses OpFlex to push forwarding policies to the leaf switches",
    [
      ["Engineers manually configure VLAN IDs, 802.1Q trunks, and extended IP ACLs on each Nexus 9000 switch CLI before the APIC can discover the servers", "ACI replaces manual per-port VLAN, trunk, and ACL CLI configuration with application-centric EPGs and policies defined centrally on the APIC."],
      ["The APIC removes all control plane software from the Nexus switches and uses OpenFlow to program every individual MAC address entry", "OpenFlow is used by the ONF/OpenDaylight model; Cisco ACI uses the OpFlex SBI protocol and retains a partial control plane on the Nexus 9000 switches."],
      ["The APIC uses Telnet and SNMPv2c to configure Spanning Tree Protocol root bridges across Top-of-Rack and End-of-Row switches", "Telnet and SNMPv2c over traditional topologies describes APIC-EM, whereas ACI uses Nexus 9000 spine-leaf switches and the OpFlex protocol."]
    ],
    "In Cisco ACI, instead of configuring VLANs and ACLs per switch port, administrators or orchestration tools define Endpoint Groups (EPGs)—such as External, Web, App, and Database—and policies stating which EPGs can communicate. The APIC controller translates that intent and pushes policy to the switches via the OpFlex southbound protocol.",
    "Cisco ACI = Data Center SDN, Nexus 9000 Spine-Leaf, APIC controller, OpFlex SBI, Endpoint Groups (EPGs) + Policies.",
    []
  ),
  c16.s(
    "Controllers",
    "Medium",
    "How do the three SDN examples—OpenFlow (OpenDaylight), Cisco ACI (APIC), and Cisco APIC-EM—differ in the degree to which they centralize the control plane?",
    "OpenFlow mostly centralizes the control plane, Cisco ACI partially centralizes it, and APIC-EM leaves it distributed on the devices",
    [
      ["All three architectures completely remove the control plane from the switches and program the TCAM directly using OpenFlow", "Only the OpenFlow model mostly centralizes the control plane; ACI keeps partial control plane functions in the switches, and APIC-EM leaves traditional distributed control planes untouched."],
      ["APIC-EM mostly centralizes the control plane, OpenFlow partially centralizes it, and Cisco ACI leaves the control plane 100% distributed", "This reverses the architectures: APIC-EM uses SSH/Telnet/SNMP to manage traditional routers and switches that keep their distributed control planes."],
      ["Cisco ACI and APIC-EM both centralize the data plane inside the controller, whereas OpenFlow keeps the data plane distributed on switches", "None of the three architectures centralize the data plane; the switches and routers always perform data plane forwarding."]
    ],
    "Different SDN models centralize control to different degrees: OpenFlow/OpenDaylight mostly centralizes the control plane (programming device forwarding tables directly via OpenFlow); Cisco ACI partially centralizes control (APIC pushes policy intent via OpFlex to switch control planes); and APIC-EM leaves traditional distributed control/data planes intact, configuring devices via management plane protocols (CLI/SSH/Telnet and SNMP).",
    "Control plane centralization spectrum: OpenFlow = Mostly; Cisco ACI = Partially (OpFlex); APIC-EM = None (Management plane SSH/SNMP).",
    []
  ),
  c16.s(
    "SDN",
    "Medium",
    "A 48-port Gigabit Ethernet switch operates at 1 Gbps full-duplex on all 48 ports. Assuming an average frame size of 125 bytes (1,000 bits), how many frames per second (fps) must the switch's hardware data plane be capable of processing across all ports simultaneously?",
    "48 million frames per second (1,000,000 fps per port across 48 ports)",
    [
      ["1 million frames per second (shared across all 48 ports)", "In full-duplex mode, all 48 ports can receive at 1 Gbps simultaneously, so 1 million fps per port * 48 ports = 48 million fps."],
      ["6 million frames per second (125,000 fps per port across 48 ports)", "1,000,000,000 bits/sec divided by 1,000 bits/frame equals 1,000,000 frames/sec per port, not 125,000 fps."],
      ["384 million frames per second (8,000,000 fps per port across 48 ports)", "125 bytes * 8 bits/byte = 1,000 bits per frame, so 1 Gbps / 1,000 bits = 1 million fps per port, not 8 million."]
    ],
    "At 1 Gbps (1,000,000,000 bits per second), a 125-byte frame (125 * 8 = 1,000 bits) arrives at a rate of 1,000,000 frames per second on a single port. With 48 ports operating in full-duplex mode simultaneously, the switch ASIC and TCAM must handle 48 * 1,000,000 = 48 million frames per second.",
    "fps per port = Port speed (bps) / Frame size (bits). High fps is why switches use hardware ASICs and TCAM!",
    []
  ),
  c16.s(
    "SDN",
    "Hard",
    "An engineer wants to write a Python script to verify whether a switch port is administratively set to `dynamic auto` and operationally `static access`. How does querying a controller's Northbound REST API compare to running `show interfaces gigabit 0/1 switchport` via SSH on the switch?",
    "The controller's NBI returns structured JSON data that converts into Python dictionaries, whereas SSH returns unstructured CLI text to parse",
    [
      ["The controller's NBI returns a raw screenshot image of the CLI output, whereas SSH returns a pre-parsed Python dictionary of key:value pairs", "SSH CLI commands return unstructured multi-line text strings designed for human eyes, whereas controller REST APIs return structured data (JSON/XML)."],
      ["Both methods require the Python script to log into every switch individually via Telnet and run regular expressions against the show output", "With a controller NBI, the script makes a single API call to the controller and receives structured variables without logging into individual switches."],
      ["The controller's NBI can only modify configuration and cannot read operational port status, so SSH screen-scraping is required for verification", "Controllers collect both configuration state and operational state into formal data models accessible via Northbound API GET requests."]
    ],
    "Traditional CLI `show` commands produce blocks of formatted text meant for humans to read, forcing automation scripts to parse text strings line by line. A centralized controller organizes network state into formal data models and returns structured data (such as JSON) via its Northbound API, which converts directly into programming variables like `{'trunk-config': 'dynamic auto', 'trunk-status': 'static access'}`.",
    "Controller NBI advantage: Model-driven structured data (JSON -> Python dict) instead of fragile CLI text parsing ('screen scraping').",
    ["show interfaces switchport"]
  ),
  c16.s(
    "Controllers",
    "Hard",
    "Why is implementing an application like Path Trace (which maps the exact hop-by-hop forwarding path and ACL decisions between two IP hosts) much simpler using a Cisco controller (APIC-EM or DNA Center) than writing a standalone script against traditional devices?",
    "One northbound API call passes the flow parameters to the controller so it can analyze its centralized topology database and return the path",
    [
      ["The controller sends thousands of live ICMP echo broadcast packets across all VLANs and waits for every switch ASIC to reply with an SNMP Trap", "Path Trace does not flood live broadcasts; the controller calculates the forwarding path by analyzing its collected topology, routing, MAC, and ACL data."],
      ["Traditional devices do not store IP routing tables or MAC address tables locally, so only a controller has access to forwarding information", "Traditional routers and switches do store their own tables locally, but without a controller your script would have to poll every device and reconstruct the path logic itself."],
      ["Path Trace requires replacing all enterprise routers with OpenFlow switches because traditional routers cannot report their ACL configurations", "Both APIC-EM and DNA Center support Path Trace across traditional Cisco routers and switches using their existing tables and configurations."]
    ],
    "Without a controller, a program would need to query every device's running-config, MAC table, ARP table, and routing table and then write complex logic to simulate packet forwarding and ACL matching at each hop. Because the controller already gathers network-wide state and includes built-in path analysis, an app can make one NBI call with the 5-tuple parameters and receive the complete path.",
    "Built-in controller apps across APIC-EM and DNA Center: Topology Map, Path Trace, Plug and Play (Day 0), and EasyQoS.",
    []
  ),
  c16.m(
    "SDN",
    "Medium",
    "Which two statements accurately compare controller-based networking and automation against traditional per-device network management?",
    [
      "Controller-based networking shifts operations from per-device CLI changes to network-wide policy, yielding consistent configs and fewer errors",
      "Centralized collection of operational data at the controller enables modern data analytics and faster project completion compared to manual per-device workflows"
    ],
    [
      ["Traditional networking requires a single centralized control plane server, whereas controller-based networking distributes all control plane logic across isolated switches", "This is backwards: traditional networking uses a distributed control plane on every device, while controller-based networking centralizes control plane or management functions."],
      ["Controller-based networking eliminates the data plane from physical switches so that every Ethernet frame must be routed through the controller's CPU", "Physical switches always retain their high-speed hardware data plane (ASIC and TCAM); the controller is in the control/management path, not the user data plane."],
      ["Controller-based networking prohibits external cloud orchestration platforms or third-party scripts from interacting with the network via APIs", "Northbound APIs on controllers explicitly enable cloud, virtualization, and third-party orchestration software to program the network automatically."]
    ],
    "Controller-based networking centralizes network visibility and policy control, allowing engineers and applications (via Northbound APIs) to configure the network as a whole rather than typing CLI commands box by box. Through Southbound APIs, the controller pushes consistent, error-free configurations and applies analytics to network-wide operational data.",
    "Controller benefits: Network-wide policy (not per-box CLI), consistent config, fewer errors, faster changes, NBI automation, and centralized analytics.",
    []
  ),
  c16.m(
    "Controllers",
    "Hard",
    "Which two statements accurately describe the OpenDaylight (ODL) controller and Cisco's SDN controller evolution?",
    [
      "OpenDaylight is a Linux Foundation open-source SDN controller supporting southbound protocols like OpenFlow, NETCONF, and OVSDB",
      "Cisco moved from its commercial OpenDaylight controller toward intent-based controllers like APIC for ACI and DNA Center for SDA"
    ],
    [
      ["OpenDaylight is a Cisco-proprietary closed-source controller that supports only Telnet and SNMPv1 as its southbound interfaces", "OpenDaylight is a multi-vendor open-source project under the Linux Foundation that supports modern SBIs like OpenFlow and NETCONF."],
      ["Cisco APIC-EM is the current next-generation replacement for Cisco DNA Center in enterprise Software-Defined Access deployments", "This is backwards: APIC-EM reached end of marketing around 2019, and its features (like Path Trace, EasyQoS, and PnP) were succeeded by Cisco DNA Center."],
      ["OpenFlow switches require no ASIC or TCAM hardware because OpenFlow performs all frame switching inside a Java virtual machine", "OpenFlow defines a standard switch abstraction specifically designed around the match/action capabilities of switch hardware ASICs and TCAMs."]
    ],
    "OpenDaylight (ODL) emerged as a collaborative Linux Foundation open-source controller supporting OpenFlow as well as NETCONF, PCEP, BGP-LS, and OVSDB. While Cisco initially sold a commercial ODL derivative (Cisco OSC) and an early enterprise controller (APIC-EM), Cisco's strategic focus shifted to Intent-Based Networking (IBN) with APIC for ACI data centers and DNA Center for SDA campuses.",
    "Controller lineage: OpenDaylight (Linux Foundation open-source) -> Cisco OSC (retired); APIC-EM (retired) -> Cisco DNA Center (current campus IBN); APIC (current ACI data center IBN).",
    []
  ),
  c16.d(
    "Controllers",
    "Easy",
    "Place the three steps in the exact order they occur when an external automation application retrieves network device data from a controller using a Northbound REST API.",
    [
      "The application sends an HTTP GET request over the network to a specific URI on the controller's REST API",
      "The controller processes the request and returns an HTTP GET response containing the requested object formatted as structured data (such as JSON or XML)",
      "The application parses the structured JSON or XML payload into native programming variables for analysis and logic decisions"
    ],
    "When an automation application runs on a separate host from the controller, it uses the controller's Northbound REST API by sending an HTTP request (such as GET) to a resource URI, receiving an HTTP response carrying structured JSON or XML data, and converting that structured payload into native program variables.",
    "REST NBI flow: App sends HTTP Request (URI) -> Controller replies with HTTP Response (JSON/XML) -> App converts JSON/XML to variables.",
    []
  ),
  c16.t(
    "Controllers",
    "Medium",
    "Match each SDN architecture or hardware component from Chapter 16 to its primary characteristic.",
    [
      ["OpenFlow / OpenDaylight (ONF)", "Mostly centralized control plane that programs switch forwarding tables directly via the OpenFlow SBI"],
      ["Cisco ACI / APIC", "Data center intent-based SDN using Nexus 9000 spine-leaf switches, Endpoint Groups (EPGs), and the OpFlex SBI"],
      ["Cisco APIC-EM", "Early enterprise controller that left device control planes distributed and configured devices via CLI (SSH/Telnet) and SNMP"],
      ["ASIC (Application-Specific Integrated Circuit)", "Purpose-built hardware chip that executes high-speed data plane frame processing in switches"],
      ["TCAM (Ternary Content-Addressable Memory)", "Specialized hardware memory that returns exact forwarding/ACL table matches in a single lookup without search loops"]
    ],
    "Each SDN controller model uses different southbound mechanisms and control-plane centralization levels, while physical switches rely on ASICs and TCAMs to execute high-speed data plane forwarding.",
    "Match the SBI & role: OpenDaylight = OpenFlow (mostly centralized); APIC = OpFlex (partially centralized, spine-leaf); APIC-EM = SSH/Telnet/SNMP (distributed control plane).",
    []
  )
];

// ============================================================================
// v2c17: Cisco Software-Defined Access (SDA)
// ============================================================================
const c17 = mk("Automation and Programmability", 10, "v2c17");
const q17 = [
  c17.s(
    "Controllers",
    "Easy",
    "In Cisco Software-Defined Access (SDA), how are the terms 'underlay', 'overlay', and 'fabric' defined?",
    "The underlay provides physical links and L3 IP reachability, the overlay tunnels traffic via VXLAN, and the fabric combines both layers",
    [
      ["The overlay provides physical cabling and IS-IS routing, the underlay uses VXLAN tunnels for endpoints, and the fabric is the DNA Center GUI", "This swaps underlay and overlay: the underlay is the physical/IP foundation, while the overlay is the virtual VXLAN tunneling layer on top."],
      ["The underlay is the Northbound REST API, the overlay is the Southbound SNMP interface, and the fabric is the Cisco Prime server", "Underlay, overlay, and fabric all sit south of the DNA Center controller to deliver user data across the campus."],
      ["The underlay is Layer 2 Spanning Tree Protocol, the overlay is Hot Standby Router Protocol (HSRP), and the fabric is an IPsec site-to-site VPN", "Greenfield SDA routed access designs eliminate STP and HSRP in the underlay and use VXLAN (with LISP) in the overlay."]
    ],
    "In Cisco SDA architecture, the underlay consists of the physical switches, links, and IP connectivity (such as IS-IS routing) between fabric nodes; the overlay consists of the virtual VXLAN tunnels and LISP location mappings that carry endpoint traffic; and the fabric is the union of the underlay and overlay working together.",
    "Underlay = physical switches/links + IP reachability (IS-IS); Overlay = VXLAN tunnels + LISP; Fabric = Underlay + Overlay.",
    []
  ),
  c17.s(
    "Controllers",
    "Easy",
    "Within the Cisco SDA overlay, which protocol operates in the control plane to track Endpoint Identifiers (EIDs) and map them to Routing Locators (RLOCs), and which protocol operates in the data plane to encapsulate endpoint frames?",
    "LISP operates in the overlay control plane, and VXLAN operates in the overlay data plane",
    [
      ["VXLAN operates in the overlay control plane, and LISP operates in the overlay data plane", "This reverses the two protocols: LISP is the control plane map-and-encap location protocol, whereas VXLAN is the data plane tunneling encapsulation."],
      ["OSPF operates in the overlay control plane, and GRE operates in the overlay data plane", "SDA uses LISP (not OSPF) for overlay endpoint location and VXLAN (not GRE) for overlay frame encapsulation."],
      ["OpFlex operates in the overlay control plane, and CAPWAP operates in the overlay data plane", "OpFlex is the southbound protocol used in Cisco ACI data centers, whereas SDA uses LISP and VXLAN across the campus fabric."]
    ],
    "Cisco SDA separates the overlay control plane from the overlay data plane: Locator/ID Separation Protocol (LISP) acts as the control plane database mapping Endpoint IDs (EIDs) to fabric edge node Routing Locators (RLOCs), while Virtual Extensible LAN (VXLAN) acts as the data plane tunneling protocol that encapsulates whole Layer 2 frames across the fabric.",
    "SDA Overlay pair: LISP = Control Plane (EID-to-RLOC mapping); VXLAN = Data Plane (frame encapsulation with VNID & SGT).",
    []
  ),
  c17.s(
    "Controllers",
    "Easy",
    "In a Cisco SDA campus network, what are the distinct functions of a Fabric Edge Node, a Fabric Border Node, and a Fabric Control Node?",
    "Edge nodes connect to user endpoints, Border nodes connect to external networks, and Control nodes run the LISP map server",
    [
      ["Edge nodes connect to the WAN, Border nodes connect to desktop PCs and IP phones, and Control nodes terminate IPsec VPNs", "This swaps Edge and Border nodes: Fabric Edge nodes are equivalent to access switches connecting endpoints, while Border nodes connect outside the SDA fabric."],
      ["Edge nodes act as spine switches, Border nodes act as leaf switches, and Control nodes act as Top-of-Rack virtual switches", "Spine, leaf, and ToR vSwitch are data center (ACI) roles rather than campus SDA fabric node roles."],
      ["Edge nodes run Cisco Prime Infrastructure, Border nodes run the DNA Center GUI, and Control nodes supply PoE to wireless APs", "Fabric Edge nodes supply PoE and endpoint access, while DNA Center runs on a dedicated controller appliance."]
    ],
    "Cisco SDA defines three primary device roles inside the fabric: Fabric Edge Nodes connect directly to wired endpoints and APs (like access switches); Fabric Border Nodes connect the SDA fabric to external non-SDA networks (such as WAN routers or an ACI data center); and Fabric Control Nodes host the LISP map server database tracking EID-to-RLOC mappings.",
    "Edge = connects endpoints; Border = connects outside the fabric; Control = runs the LISP map server.",
    []
  ),
  c17.s(
    "Controllers",
    "Easy",
    "Which northbound and southbound interfaces are supported by the Cisco DNA Center controller?",
    "A Northbound REST API and Southbound SSH, SNMP, NETCONF, and RESTCONF APIs",
    [
      ["A Northbound OpenFlow interface and a Southbound OpFlex interface exclusively", "OpenFlow is used by OpenDaylight and OpFlex is used by Cisco APIC in ACI; DNA Center uses a REST NBI and SSH/Telnet/SNMP/NETCONF/RESTCONF SBIs."],
      ["A Northbound SNMPv2c interface and a Southbound Ansible playbook interface", "SNMP is a southbound protocol from DNA Center to devices, and Ansible is an external configuration management tool, not a DNA Center SBI."],
      ["A Northbound EIGRP routing interface and a Southbound TFTP file interface", "EIGRP is a routing protocol and TFTP is a file transfer protocol; DNA Center uses REST northbound and SSH/SNMP/NETCONF/RESTCONF southbound."]
    ],
    "Cisco DNA Center exposes a comprehensive Northbound REST API (and web GUI) for humans and automation scripts, and supports both traditional Southbound protocols (Telnet, SSH, SNMP) for legacy devices and modern Southbound programmatic protocols (NETCONF, RESTCONF) for newer IOS-XE platforms.",
    "DNA Center NBI = REST API; DNA Center SBI = Legacy (Telnet, SSH, SNMP) + Modern (NETCONF, RESTCONF).",
    []
  ),
  c17.s(
    "Controllers",
    "Medium",
    "When Cisco DNA Center automatically configures a greenfield (all-new hardware) SDA underlay, why are Spanning Tree Protocol (STP/RSTP) and HSRP no longer needed?",
    "DNA Center builds a routed access layer using IS-IS over Layer 3 links with each Edge node as the default gateway",
    [
      ["DNA Center places all switch ports into a single flat Layer 2 VLAN and uses VTP pruning to block broadcast loops", "A greenfield SDA underlay uses Layer 3 routed links between all switches rather than Layer 2 trunks, eliminating Layer 2 loops and STP."],
      ["DNA Center disables all redundant physical links between access and distribution switches so only a single path exists", "SDA keeps redundant physical links between switches and uses the IS-IS routing protocol to route across all links without STP blocking."],
      ["DNA Center requires every connected desktop PC to run OSPF and BGP directly with the campus WAN edge routers", "End-user PCs still use a standard default gateway IP address, which is hosted directly on their connected Fabric Edge node (anycast gateway)."]
    ],
    "In a greenfield SDA deployment, DNA Center configures a routed access layer design: every switch acts as a Layer 3 switch, every inter-switch link is a Layer 3 routed link running the IS-IS routing protocol (eliminating Layer 2 loops and STP/RSTP), and every Fabric Edge switch acts as the default gateway for its attached endpoints (eliminating HSRP between distribution switches).",
    "Greenfield SDA Underlay = Routed Access Layer (L3 switches + L3 links + IS-IS routing = NO STP and NO HSRP!).",
    []
  ),
  c17.s(
    "Controllers",
    "Medium",
    "Why does Cisco recommend manually configuring the SDA underlay (rather than letting DNA Center automate the underlay configuration) when deploying SDA on existing switches that are already carrying live production traffic?",
    "Because automated underlay provisioning could overwrite existing configurations and disrupt live production network traffic",
    [
      ["Because DNA Center's Southbound interface only supports wireless access points and cannot configure wired Catalyst switches", "DNA Center fully configures wired Catalyst switches in greenfield deployments via its southbound interfaces."],
      ["Because existing switches cannot use VXLAN in hardware and must have their ASICs replaced with software virtual switches", "Existing switches used for SDA must already be on the SDA hardware compatibility list (such as Catalyst 3650/3850/9000 with capable ASICs)."],
      ["Because DNA Center cannot run on-premises when existing switches are present and must be replaced by Cisco Prime Infrastructure", "DNA Center is required for SDA operation in both brownfield (existing gear) and greenfield (new gear) deployments."]
    ],
    "When migrating an existing production campus (brownfield) to SDA, the switches must first be verified against the SDA hardware and software compatibility lists (for example, Catalyst 9300/9400/9500 and 3850/3650 are supported as edge nodes, whereas 2960X/XR are not). Engineers manually configure the underlay on live production switches so automated provisioning does not accidentally disrupt active traffic.",
    "Brownfield (existing production gear) = check compatibility list + configure underlay manually; Greenfield (new gear) = DNA Center automates underlay.",
    []
  ),
  c17.s(
    "Controllers",
    "Medium",
    "How do Cisco SDA and DNA Center use Scalable Groups and Scalable Group Tags (SGTs) to overcome the maintenance problems of traditional IP-based Access Control Lists (ACLs)?",
    "DNA Center and ISE assign users to Scalable Groups and enforce SGT-to-SGT matrix policies via VXLAN headers instead of IPs",
    [
      ["DNA Center automatically converts every user's MAC address into a 500-line numbered standard IPv4 ACL on every router interface", "SDA replaces complex IP-based ACLs with group-based policies using Scalable Group Tags (SGTs) carried in the VXLAN header."],
      ["SGTs are 3-bit QoS markings placed inside the 802.1Q CoS field to prioritize voice packets over FTP file transfers", "3-bit markings in the 802.1Q header are Class of Service (CoS) bits for QoS, whereas SGTs identify security groups in the VXLAN header."],
      ["Scalable Groups require each department to be physically cabled to a separate air-gapped switch stack with no uplinks", "SDA allows endpoints in different Scalable Groups to connect to any Fabric Edge port while enforcing group-to-group access policies across the fabric."]
    ],
    "Traditional IP ACLs grow long, overlapping, and risky to edit or remove over time because one ACE may serve multiple historical requirements. In SDA, DNA Center works with Cisco Identity Services Engine (ISE) to assign authenticated users to Scalable Groups (each with an SGT). Engineers simply click permit/deny cells in a group-to-group matrix, and the fabric carries source and destination SGTs (and VNIDs) inside the VXLAN header.",
    "SDA Security = DNA Center + Cisco ISE + Scalable Group Tags (SGTs) carried in the VXLAN header (topology- and IP-independent).",
    []
  ),
  c17.s(
    "Controllers",
    "Medium",
    "Which network management capabilities are shared by BOTH traditional management platforms (such as Cisco Prime Infrastructure) AND Cisco DNA Center?",
    "Device discovery, topology mapping, wired/wireless management, Day 0/1/N lifecycle provisioning, and SWIM image updates",
    [
      ["Full configuration and operation of Cisco Software-Defined Access (SDA) VXLAN fabrics and Scalable Group Tags", "Only Cisco DNA Center acts as the controller for SDA fabrics; traditional platforms like Cisco Prime Infrastructure do not support SDA."],
      ["Encrypted Traffic Analysis (ETA), Network Time Travel client playback, and Path Trace with hop-by-hop ACL permit/deny analysis", "Encrypted Traffic Analysis, Network Time Travel, Device/Client 360, and ACL-aware Path Trace are advanced capabilities unique to Cisco DNA Center."],
      ["Replacing all switch ASICs with centralized controller software forwarding so switches no longer need IOS images", "Both Prime Infrastructure and DNA Center manage IOS images on switches via SWIM, and switches always forward frames in their local ASICs."]
    ],
    "Cisco DNA Center incorporates traditional network management features found in Cisco Prime Infrastructure (PI)—including single-pane-of-glass GUI, discovery/inventory/topology maps (via SNMP, SSH, Telnet, CDP, LLDP), Day 0/1/N lifecycle management, Plug-and-Play, and Software Image Management (SWIM)—while adding SDA controller capabilities and advanced analytics.",
    "Both PI & DNA Center do: Discovery/Topology, Day 0 PnP, Day 1/N config, SWIM, Wired/Wireless. Only DNA Center does: SDA, Path Trace w/ ACLs, ETA, Time Travel, 360 views.",
    []
  ),
  c17.s(
    "Controllers",
    "Hard",
    "In an SDA campus where the enterprise endpoint address space (overlay) is `10.0.0.0/8` and the SDA underlay address space is `172.16.0.0/16`, Host A (`10.1.1.1`) connected to Fabric Edge SW1 (`RLOC 172.16.1.1`) sends a frame to Host B (`10.1.3.1`) connected to Fabric Edge SW3 (`RLOC 172.16.3.3`). After SW1 queries the LISP map server, what are the destination IP addresses in the inner (original) IP header and the outer VXLAN tunnel IP header as the packet crosses the fabric?",
    "The inner original IP header has destination `10.1.3.1` (EID), and the outer VXLAN tunnel IP header has destination `172.16.3.3` (RLOC)",
    [
      ["The inner original IP header has destination `172.16.3.3`, and the outer VXLAN tunnel IP header has destination `10.1.3.1`", "This swaps the inner and outer headers: the underlay routes the outer IP header to SW3's RLOC (`172.16.3.3`), while the inner frame preserves Host B's EID (`10.1.3.1`)."],
      ["Both the inner and outer IP headers use destination `10.1.3.1` because VXLAN encapsulates only the TCP segment without adding an outer IP header", "VXLAN encapsulates the entire original Ethernet frame inside VXLAN, UDP, and a new outer IP header addressed to the egress RLOC."],
      ["The inner IP header is stripped by SW1 and replaced with the IP address of the LISP map server until SW3 runs ARP", "SW1 preserves the entire original Ethernet frame (including the inner IP header) inside the VXLAN payload, and the LISP map server is only queried in the control plane."]
    ],
    "In SDA, the underlay uses a dedicated IP space (`172.16.0.0/16`) for RLOCs while endpoints use the enterprise overlay space (`10.0.0.0/8`) for EIDs. Ingress Tunnel Router (ITR) SW1 queries the LISP map server for EID `10.1.3.1`, learns SW3's RLOC (`172.16.3.3`), and encapsulates the entire original Ethernet frame (inner destination `10.1.3.1`) inside a VXLAN/UDP/IP tunnel packet whose outer destination IP is `172.16.3.3`.",
    "SDA VXLAN packet on the wire: [Outer IP (Src/Dst RLOCs in Underlay)] [UDP] [VXLAN (VNID + SGTs)] [Original L2 Frame (Src/Dst EIDs in Overlay)].",
    []
  ),
  c17.s(
    "Controllers",
    "Hard",
    "Why must Cisco SDA encapsulate the entire original Layer 2 Ethernet frame inside a VXLAN header (performed in the switch ASIC) rather than simply encapsulating the Layer 3 IP packet inside a traditional GRE tunnel?",
    "Because VXLAN encapsulates full Layer 2 frames for L2/L3 fabric forwarding and carries VNIDs and SGTs at line rate in switch ASICs",
    [
      ["Because VXLAN encrypts the entire Ethernet frame using a 256-bit IPsec session key, whereas GRE leaves the payload in clear text", "VXLAN is a tunneling encapsulation protocol (not an encryption protocol) that carries VNIDs, SGTs, and the original Layer 2 frame."],
      ["Because traditional switches cannot route IPv4 packets in hardware and must send all Layer 3 packets to the DNA Center appliance over TCP", "Multilayer switches route IPv4 packets in hardware ASICs; VXLAN is chosen to preserve Layer 2 frames and carry SGT/VNID metadata in hardware."],
      ["Because VXLAN eliminates the need for IP addresses in the underlay network by forwarding frames using Spanning Tree Protocol", "VXLAN requires an IP underlay network (carrying VXLAN inside UDP and outer IP headers between RLOC IP addresses)."]
    ],
    "Cisco selected VXLAN for the SDA overlay data plane for three reasons: (1) encapsulating the entire Layer 2 frame supports both Layer 2 switching and Layer 3 routing across the fabric, (2) the VXLAN header provides fields for Virtual Network IDs (VNIDs) and source/destination Scalable Group Tags (SGTs), and (3) modern Catalyst switch ASICs perform VXLAN encapsulation/de-encapsulation in hardware with zero performance penalty.",
    "Why VXLAN in SDA? 1) Hardware ASIC speed, 2) Extensible header (carries SGTs + VNIDs), 3) Encapsulates full L2 frame (supports both L2 and L3).",
    []
  ),
  c17.m(
    "Controllers",
    "Medium",
    "Which two features are unique to Cisco DNA Center when compared against traditional campus network management tools like Cisco Prime Infrastructure?",
    [
      "Encrypted Traffic Analysis (ETA) to detect malware and security threats hidden inside encrypted network flows",
      "Device 360, Client 360, and Network Time Travel for full health dashboards and historical client playback"
    ],
    [
      ["Discovering network devices via SNMP and CDP/LLDP to render an interactive topology map in the web GUI", "Both Cisco Prime Infrastructure and Cisco DNA Center discover devices and render interactive topology maps."],
      ["Automating Cisco IOS software image distribution and upgrades using Software Image Management (SWIM)", "Both Cisco Prime Infrastructure and Cisco DNA Center include Software Image Management (SWIM) and Day 0 Plug-and-Play."],
      ["Requiring engineers to type manual CLI access-list commands on every switch port to filter traffic between user groups", "DNA Center eliminates manual per-box ACL typing by using intent-based Scalable Group Tags (SGTs) and policies."]
    ],
    "While DNA Center shares core lifecycle tools (Discovery, Topology, PnP, SWIM) with Cisco Prime Infrastructure, DNA Center uniquely adds SDA fabric control, EasyQoS, Encrypted Traffic Analysis (ETA), Device 360 / Client 360 health dashboards, Network Time Travel historical timelines, and ACL-aware Path Trace.",
    "Remember DNA Center's unique differentiators: SDA controller, EasyQoS, Encrypted Traffic Analysis, Device/Client 360, Network Time Travel, and ACL-aware Path Trace.",
    []
  ),
  c17.m(
    "Controllers",
    "Hard",
    "Examine the SDA Scalable Group access policy matrix below:\n- Source Employee -> Dest Employee: N/A | Dest Internet: Permit | Dest Partner: Permit | Dest Guest: Deny\n- Source Guest -> Dest Employee: Deny | Dest Internet: Permit | Dest Partner: Deny | Dest Guest: N/A\nWhich two actions occur when a Guest endpoint tries to send packets to an Employee endpoint versus to the Internet?",
    [
      "When the Guest endpoint sends packets toward the Internet, DNA Center and ISE verify the Permit policy and allow VXLAN forwarding across the fabric",
      "When the Guest endpoint sends packets to an Employee endpoint, DNA Center enforces the Deny policy between their SGTs and blocks fabric delivery"
    ],
    [
      ["The ingress Fabric Edge switch must first inspect a 200-line IPv4 extended ACL in software to check whether the Guest IP subnet overlaps with the Employee IP subnet", "SDA enforces security based on source and destination Scalable Group Tags (SGTs) rather than IP subnet ranges in legacy ACLs."],
      ["Removing the Guest-to-Partner Deny rule requires auditing and reordering all Employee ACE sequence numbers so Employee-to-Internet traffic is not accidentally blocked", "Unlike traditional ACLs where rule order and overlapping ACEs make deletions risky, each SGT matrix cell is independent and can be changed safely."],
      ["The Guest endpoint must first establish a CAPWAP tunnel to Cisco Prime Infrastructure before the fabric can assign its Scalable Group Tag", "DNA Center works with Cisco Identity Services Engine (ISE) to authenticate users and assign SGTs, not Cisco Prime Infrastructure."]
    ],
    "In SDA group-based security, DNA Center integrates with Cisco Identity Services Engine (ISE) to map authenticated users/endpoints to Scalable Group Tags (SGTs). Each cell in the source-to-destination SGT matrix is independent—allowing Guest-to-Internet traffic while blocking Guest-to-Employee traffic without relying on IP subnet ACLs or rule ordering.",
    "SGT matrix policies are independent cells (no ACL sequence-number dependencies) enforced via DNA Center + Cisco ISE.",
    []
  ),
  c17.d(
    "Controllers",
    "Hard",
    "Place the five LISP and VXLAN steps in the exact chronological order they occur when an SDA endpoint sends its first frame to a destination subnet attached to remote Fabric Edge switch SW3.",
    [
      "Egress Fabric Edge node SW3 learns its local endpoint subnet (EID) and registers that EID along with SW3's underlay IP address (RLOC) in the LISP map server",
      "An Ethernet frame addressed to the destination EID arrives at ingress Fabric Edge node SW1 (the Ingress Tunnel Router), which does not yet know where to send it",
      "Ingress node SW1 sends a control plane query to the LISP map server asking which RLOC can reach the destination EID",
      "The LISP map server looks up the EID-to-RLOC mapping, coordinates with SW3, and informs SW1 that the destination EID is reachable via SW3's RLOC",
      "Ingress node SW1 encapsulates the original Ethernet frame inside VXLAN, UDP, and an outer IP header addressed to SW3's RLOC and forwards it across the underlay"
    ],
    "In SDA, edge nodes first register their reachable Endpoint IDs (EIDs) and their own underlay Routing Locator (RLOC) IP addresses with the LISP map server (running on a Fabric Control node). When an Ingress Tunnel Router (SW1) receives a frame for an unknown EID, it queries the LISP map server, learns the egress node's RLOC (SW3), and encapsulates the frame in a VXLAN tunnel addressed to SW3's RLOC.",
    "LISP/VXLAN flow: Egress node registers (EID -> RLOC) -> Frame hits ITR -> ITR queries LISP Map Server -> Map Server/ETR replies with RLOC -> ITR encapsulates in VXLAN to RLOC.",
    []
  ),
  c17.t(
    "Controllers",
    "Medium",
    "Match each Cisco SDA or network management component to its exact function.",
    [
      ["LISP Map Server (Fabric Control Node)", "Control plane database that maps Endpoint Identifiers (EIDs) to fabric edge node Routing Locators (RLOCs)"],
      ["VXLAN (Overlay Data Plane)", "ASIC-accelerated tunneling protocol that encapsulates full Layer 2 frames along with VNIDs and SGTs"],
      ["IS-IS (Greenfield Underlay)", "Layer 3 routing protocol configured automatically by DNA Center on routed access links between SDA switches"],
      ["Cisco Identity Services Engine (ISE)", "Security platform that works with DNA Center to identify users and assign them to Scalable Group Tags (SGTs)"],
      ["Path Trace (DNA Center App)", "Tool that maps the exact hop-by-hop forwarding path between two hosts and evaluates whether ACLs in the path permit or deny the flow"]
    ],
    "Cisco SDA combines several protocols and platforms into a cohesive architecture: IS-IS provides underlay IP reachability, LISP provides overlay EID-to-RLOC control plane mapping, VXLAN provides hardware-accelerated overlay data plane tunneling with SGTs, ISE provides identity-to-SGT mapping, and DNA Center provides centralized orchestration and apps like Path Trace.",
    "Keep the SDA protocol stack straight: Underlay = IS-IS; Overlay Control = LISP; Overlay Data = VXLAN; Identity/SGT = ISE; Controller = DNA Center.",
    []
  )
];

// ============================================================================
// v2c18: Understanding REST and JSON
// ============================================================================
const c18 = mk("Automation and Programmability", 10, "v2c18");
const q18 = [
  c18.s(
    "REST/JSON",
    "Easy",
    "Which four actions are represented by the software development acronym CRUD, and which HTTP verbs typically perform them in a REST API?",
    "Create (POST), Read (GET), Update (PUT/PATCH), and Delete (DELETE)",
    [
      ["Connect (SYN), Request (GET), Upload (PUSH), and Disconnect (FIN)", "CRUD stands for Create, Read, Update, and Delete, not TCP connection flags like SYN and FIN."],
      ["Create (GET), Read (POST), Update (DELETE), and Delete (PATCH)", "This scrambles the HTTP verbs: GET is used for Read, POST for Create, PUT/PATCH for Update, and DELETE for Delete."],
      ["Compile (MAKE), Run (EXEC), Upgrade (COPY), and Debug (SHOW)", "CRUD refers to data manipulation operations (Create, Read, Update, Delete) over an API, not CLI commands."]
    ],
    "In software development, CRUD stands for the four fundamental operations on data variables: Create, Read, Update, and Delete. HTTP-based REST APIs map these directly to HTTP request verbs: POST (Create), GET (Read), PUT or PATCH (Update), and DELETE (Delete)—noting that POST, PUT, and PATCH can sometimes be used for both create and update depending on the API.",
    "CRUD <-> HTTP Verbs: Create = POST, Read = GET, Update = PUT / PATCH, Delete = DELETE.",
    []
  ),
  c18.s(
    "REST/JSON",
    "Easy",
    "What does it mean that a REST-based API operates as a 'stateless' architecture?",
    "Each REST request is independent, and the server stores no client session state between API calls",
    [
      ["The REST API cannot use TCP as its transport protocol and must always run over connectionless UDP port 69", "Most REST APIs run over HTTP/HTTPS, which uses stateful TCP at Layer 4; 'stateless' in REST refers to the application/API layer not retaining session history between calls."],
      ["The REST server is prohibited from returning operational interface state variables to a client script", "REST APIs routinely return device operational and configuration state variables; stateless means the API exchange itself does not rely on prior API calls."],
      ["Every REST API response is permanently banned from being cached by the client application", "REST explicitly requires responses to be clearly marked as either cacheable or non-cacheable to improve performance when appropriate."]
    ],
    "One of Roy Fielding's six foundational constraints for REST is stateless operation: the server does not keep client context between requests. Every REST request from a client must contain all the information needed to process it, without relying on stored history from earlier API exchanges.",
    "Stateless REST = no memory of previous API calls kept by the server between requests; Cacheable = responses clearly state if/how long they can be cached.",
    []
  ),
  c18.s(
    "REST/JSON",
    "Easy",
    "In JSON syntax, which punctuation characters enclose a JSON object, which enclose a JSON array, and which character separates a key from its value?",
    "Curly braces `{ }` enclose an object, square brackets `[ ]` enclose an array, and a colon `:` separates a key from its value",
    [
      ["Square brackets `[ ]` enclose an object, curly braces `{ }` enclose an array, and an equals sign `=` separates a key from its value", "This swaps `{ }` and `[ ]`, and JSON always uses a colon (`:`), never an equals sign (`=`), for key:value pairs."],
      ["Angle brackets `< >` enclose an object, parentheses `( )` enclose an array, and a semicolon `;` separates a key from its value", "Angle brackets `<tag></tag>` are used in XML markup, not in JSON."],
      ["Double curly braces `{{ }}` enclose an object, triple dashes `---` start an array, and a slash `/` separates a key from its value", "Double curly braces `{{ }}` and leading `---` are used in Jinja2 templates and YAML files (such as in Ansible), not in JSON."]
    ],
    "In JSON (RFC 8259), a matched pair of curly braces `{ }` defines a JSON object (which maps to a Python dictionary), a matched pair of square brackets `[ ]` defines a JSON array (which maps to a Python list), and every colon `:` separates a double-quoted key on the left from its value on the right.",
    "JSON syntax essentials: `{ }` = Object (Python dict); `[ ]` = Array (Python list); `\"key\": value` = Key:Value pair separated by commas.",
    []
  ),
  c18.s(
    "REST/JSON",
    "Easy",
    "Why do REST APIs use a data serialization language (such as JSON or XML) instead of copying the server's raw internal RAM bytes for a variable directly over the network to the client?",
    "Different programming languages store variables in RAM using incompatible internal binary formats",
    [
      ["Raw RAM bytes cannot be encapsulated inside TCP segments or Ethernet frames without first being converted into HTML web pages", "TCP and Ethernet can carry any binary payload, and REST APIs exchange JSON/XML data structures rather than HTML web pages."],
      ["Data serialization languages automatically encrypt all variable values using TLS so that HTTP can be used instead of HTTPS", "JSON, XML, and YAML are plain-text data modeling/serialization formats; encryption is provided by HTTPS (TLS), not by JSON."],
      ["Copying raw RAM bytes deletes the variables from the REST server, violating the CRUD Read rule", "Reading RAM does not erase it, but raw internal memory representations are language- and version-specific and cannot be interpreted by another language."]
    ],
    "A REST server (for example, written in Java) and a REST client (for example, written in Python) use completely different internal memory layouts to store integers, strings, lists, and dictionaries in RAM—even different versions of the same language can differ. Data serialization languages like JSON convert internal variables into a standardized text representation for transit, which the client then parses into its own native variables.",
    "Data serialization (JSON, XML, YAML) bridges different programming languages by representing variables and data structures in standardized text.",
    []
  ),
  c18.s(
    "REST/JSON",
    "Medium",
    "Examine the following Cisco DNA Center REST API URI:\n`https://dnac.example.com/dna/intent/api/v1/network-device?hostname=cat_9k_1&role=ACCESS`\nHow are the four components of this URI categorized?",
    "`https` is the protocol, `dnac.example.com` is the host, `dna/intent/api/v1/network-device` is the path, and `hostname=cat_9k_1&role=ACCESS` is the query",
    [
      ["`https://dnac.example.com` is the resource path, `dna/intent/api/v1` is the query parameter, and `network-device?hostname=cat_9k_1` is the HTTP verb", "The HTTP verb (such as GET or POST) sits in the HTTP header outside the URI, and the query parameters begin after the `?` character."],
      ["`https` is the CRUD action, `dnac.example.com/dna/intent` is the server hostname, and `api/v1/network-device?hostname=cat_9k_1&role=ACCESS` is the JSON array", "The hostname ends at the first single slash `/`, the path (resource) runs from the first `/` to the `?`, and the query parameters follow the `?`."],
      ["`dnac.example.com` is the protocol, `dna/intent/api/v1/network-device` is the server IP address, and `role=ACCESS` is the HTTP return status code", "The HTTP return status code (such as `200 OK`) is returned by the server in the HTTP response message, not sent in the request URI."]
    ],
    "A REST URI consists of: (1) the protocol (`https`) before `://`, (2) the server hostname or IP address (`dnac.example.com`) between `//` and the first `/`, (3) the path (`dna/intent/api/v1/network-device`) after the first `/` that uniquely identifies the API resource, and (4) optional query parameters after the `?` (`hostname=cat_9k_1&role=ACCESS`) that filter or customize the request.",
    "URI breakdown: `protocol://hostname/path-to-resource?query-parameters`.",
    []
  ),
  c18.s(
    "REST/JSON",
    "Medium",
    "An engineer uses the Postman API development tool to test a REST `GET` request against Cisco DevNet's sandbox DNA Center (`sandboxdnac2.cisco.com`) and receives status code `200 OK`. Beyond testing API calls interactively, what feature of Postman helps speed up writing a Python automation script?",
    "Postman can generate ready-to-copy Python code snippets for the tested REST API call to paste in scripts",
    [
      ["Postman acts as an agent on Cisco IOS switches to replace SSH and NETCONF with proprietary Postman tunnels", "Postman is a client-side API development environment tool that runs on the engineer's workstation, not an agent installed on switches."],
      ["Postman automatically converts traditional Layer 2 access switches into Spine-and-Leaf Nexus 9000 hardware", "Postman tests REST API calls and inspects JSON/XML responses; it does not change physical switch hardware."],
      ["Postman compiles XML and YAML files into Cisco IOS `.bin` images and flashes them via UDP port 69", "Postman is used to build, test, save, and share REST API requests and generate client code in languages like Python."]
    ],
    "API development tools like Postman allow engineers to experiment with REST URIs, headers, authentication, and JSON payloads without writing code first. Once a request works (returning `200 OK` and the desired JSON payload), Postman can generate the exact code in Python (or another language) to copy and paste into an automation script.",
    "Postman = free GUI tool to test REST APIs, inspect JSON responses (e.g., status `200 OK`), and generate Python code snippets.",
    []
  ),
  c18.s(
    "REST/JSON",
    "Medium",
    "How do JSON, XML, and YAML compare in terms of syntax and typical use cases in network automation?",
    "JSON uses `{ }` and `[ ]` for REST APIs, XML uses `<tag></tag>` markup, and YAML uses clean indentation for Ansible playbooks",
    [
      ["JSON uses `<tag></tag>` markup, XML uses `[ ]` and `{ }`, and YAML is a binary-only format that cannot be read by humans", "This swaps JSON and XML syntax, and YAML ('YAML Ain't Markup Language') is actually the most human-readable text format of the three."],
      ["JSON is defined by the W3C for web page fonts, XML is defined by RFC 8259 for JavaScript, and YAML is used exclusively by SNMPv1", "JSON is standardized in IETF RFC 8259 (derived from JavaScript), whereas XML is defined by the W3C."],
      ["All three languages require every string and number to be enclosed inside double curly brackets `{{ }}` to be valid", "Double curly brackets `{{ }}` are used inside YAML/Jinja2 templates to reference variable substitution in Ansible, not for every value in JSON or XML."]
    ],
    "JSON (RFC 8259) uses curly braces, square brackets, and key:value pairs and is the most common format for REST APIs. XML (W3C) uses opening and closing angle-bracket tags (`<role>ACCESS</role>`) for both markup and data serialization. YAML (YAML.org) avoids heavy punctuation in favor of clean indentation and is widely used in Ansible playbooks and variable files.",
    "JSON = `{ \"k\": \"v\" }` (REST APIs); XML = `<k>v</k>` (W3C markup/REST); YAML = indentation + `k: v` (Ansible).",
    []
  ),
  c18.s(
    "REST/JSON",
    "Medium",
    "What is the difference between 'beautified' (pretty) JSON and 'minified' (raw) JSON?",
    "Beautified JSON adds line breaks and indentation for humans, whereas minified JSON strips extra whitespace to save bandwidth",
    [
      ["Beautified JSON encloses keys in double quotes, whereas minified JSON removes all double quotes, colons, and curly braces", "Both beautified and minified JSON must strictly follow JSON syntax rules (including curly braces, colons, and double-quoted keys)."],
      ["Beautified JSON is used exclusively for HTTP POST requests, whereas minified JSON is used exclusively for HTTP DELETE requests", "Whitespace formatting does not change the meaning of JSON data or restrict which HTTP verb can carry it."],
      ["Beautified JSON converts all JSON arrays into XML tags, whereas minified JSON converts all JSON objects into Python bytecode", "Both formats are valid plain-text JSON representing the exact same objects, arrays, and key:value pairs."]
    ],
    "JSON ignores insignificant whitespace outside of quoted strings. Beautified (pretty/spaced) JSON adds newlines and aligned indentation so humans can easily match opening and closing braces, whereas minified (raw) JSON removes extra spaces and line breaks (for example, `{\"a\":1,\"b\":2}`) to save bytes when stored in a file or sent across a network.",
    "Beautified/Pretty JSON = formatted with whitespace for humans; Minified/Raw JSON = whitespace stripped for network/files.",
    []
  ),
  c18.s(
    "REST/JSON",
    "Hard",
    "Examine the JSON data shown in the exhibit. How many total JSON objects, how many total JSON arrays, and how many key:value pairs inside the outer object exist in this snippet?",
    "3 JSON objects total including the outer object, 1 JSON array, and 2 direct key:value pairs in the outer object",
    [
      ["1 JSON object total including the outer object, 3 JSON arrays, and 6 total key:value pairs in the outer object", "Each matched pair of curly braces `{ }` is a JSON object (there are 3 pairs of `{ }`), and only `" + "vlans" + "` uses square brackets `[ ]` for an array."],
      ["2 JSON objects total including the outer object, 2 JSON arrays, and 5 direct key:value pairs in the outer object", "Counting the outer `{ }` plus the two inner `{ }` blocks yields 3 JSON objects, and the outer object has only 2 direct keys (`\"switch\"` and `\"uplink\"`)."],
      ["3 JSON objects total including the outer object, 0 JSON arrays, and 7 direct key:value pairs in the outer object", "The value `[10, 20, 30]` enclosed in square brackets `[ ]` is a JSON array containing three numeric values."]
    ],
    "Count the matched curly-brace pairs `{ }`: there is 1 outer object enclosing the entire payload, plus 2 inner objects (the values for keys `\"switch\"` and `\"uplink\"`), totaling 3 JSON objects. The outer object contains 2 key:value pairs (`\"switch\": {...}` and `\"uplink\": {...}`). Inside `\"switch\"`, the key `\"vlans\"` has a JSON array `[10, 20, 30]` enclosed in square brackets `[ ]`.",
    "Count `{ }` pairs for total JSON objects; count `[ ]` pairs for total JSON arrays; count colons `:` at a given level for key:value pairs.",
    [],
    {
      cli: "{\n  \"switch\": {\n    \"hostname\": \"SW1\",\n    \"vlans\": [10, 20, 30]\n  },\n  \"uplink\": {\n    \"interface\": \"Gi0/1\",\n    \"speed\": 1000,\n    \"trunk\": true\n  }\n}"
    }
  ),
  c18.s(
    "REST/JSON",
    "Hard",
    "Examine the four JSON snippets below. According to RFC 8259 JSON syntax rules, which snippet is completely valid JSON?",
    "`{\"hostname\": \"R1\", \"ospf_pid\": 1, \"interfaces\": [\"Gi0/0\", \"Gi0/1\"]}`",
    [
      ["`{hostname: \"R1\", ospf_pid: 1, interfaces: [\"Gi0/0\", \"Gi0/1\"]}`", "In JSON, every key before a colon must be enclosed in double quotes (`\"hostname\"`, not `hostname`)."],
      ["`{\"hostname\": \"R1\", \"ospf_pid\": 1, \"interfaces\": [\"Gi0/0\", \"Gi0/1\"],}`", "JSON prohibits a trailing comma after the last key:value pair in an object."],
      ["`{\"hostname\" = \"R1\", \"ospf_pid\" = 1, \"interfaces\" = {\"Gi0/0\", \"Gi0/1\"}}`", "JSON uses colons (`:`) rather than equals signs (`=`), and a list of values without keys must be enclosed in square brackets `[ ]`, not curly braces `{ }`."]
    ],
    "Valid JSON requires: (1) an outer object `{ }` or array `[ ]`, (2) all keys enclosed in double quotes followed by a colon `:`, (3) text values in double quotes and numeric values without quotes (`1`), (4) arrays of values enclosed in square brackets `[ ]`, and (5) commas separating multiple items with no trailing comma after the last item.",
    "Watch for common exam JSON syntax traps: unquoted keys, single quotes instead of double quotes, trailing commas, or `{ }` used around a simple list instead of `[ ]`.",
    []
  ),
  c18.s(
    "REST/JSON",
    "Hard",
    "Examine the JSON response from a Cisco DNA Center REST API call shown in the exhibit. Which statement accurately identifies the keys, values, and data types in this JSON structure?",
    "`\"response\"` is a key with a nested object value, `\"ACCESS\"` is a string value for `\"role\"`, and `41` is a numeric value for `\"interfaceCount\"`",
    [
      ["`\"response\"` is a JSON array, `\"role\"` is a text value for the key `\"ACCESS\"`, and `41` is an invalid syntax error because all JSON values must be in quotes", "In `\"role\": \"ACCESS\"`, the string before the colon (`\"role\"`) is the key and `\"ACCESS\"` is the value; numeric values like `41` do not use quotes in JSON."],
      ["`\"Cisco Catalyst 9300 Switch\"` and `\"10.10.22.66\"` are JSON keys, whereas `\"type\"` and `\"managementIpAddress\"` are their JSON values", "In every `\"key\": \"value\"` pair, the item to the left of the colon is the key and the item to the right of the colon is the value."],
      ["The snippet contains five separate nested JSON objects because there are five key:value colons inside the inner curly-brace block", "There are five key:value pairs inside the inner object (and six colons total), but only two pairs of curly braces `{ }`, meaning two JSON objects total."]
    ],
    "In JSON, every colon `:` separates a key on the left from its value on the right. Here, the outer object has one key (`\"response\"`) whose value is a second JSON object `{...}`. Inside that inner object, `\"type\"`, `\"role\"`, `\"interfaceCount\"`, and `\"managementIpAddress\"` are keys; `\"ACCESS\"` is a text string value (in double quotes); and `41` is a numeric value (unquoted).",
    "Left of `:` = Key (always in `\" \"`); Right of `:` = Value (`\"text\"`, unquoted number, `[array]`, or `{object}`).",
    [],
    {
      cli: "{\n  \"response\": {\n    \"type\": \"Cisco Catalyst 9300 Switch\",\n    \"role\": \"ACCESS\",\n    \"interfaceCount\": 41,\n    \"managementIpAddress\": \"10.10.22.66\",\n    \"softwareType\": \"IOS-XE\"\n  }\n}"
    }
  ),
  c18.m(
    "REST/JSON",
    "Medium",
    "Which three attributes are among the six foundational architectural constraints of a RESTful API as defined by Roy Fielding?",
    [
      "Client/server architecture paired with stateless client-to-server requests",
      "Explicit marking of API responses as either cacheable or non-cacheable",
      "Uniform interface and layered system with optional code-on-demand support"
    ],
    [
      ["Mandatory use of XML angle-bracket tags transported over SSH TCP port 22", "REST does not mandate XML or SSH (in fact, HTTP is not even strictly required by Fielding's definition, though HTTP and JSON are most common)."],
      ["Stateful per-session sequence tracking stored in the REST server memory", "REST is strictly stateless at the API level; each request stands on its own without server-side session history."],
      ["Direct binary dumps of server RAM variables into client memory over UDP", "REST uses standardized resource representations (such as JSON or XML serialization) rather than raw binary RAM dumps."]
    ],
    "Roy Fielding defined six constraints that make an API RESTful: (1) Client/server architecture, (2) Stateless operation, (3) Cacheable/uncacheable marking of responses, (4) Uniform interface, (5) Layered system, and (6) Code-on-demand (optional).",
    "Memorize the 6 REST attributes: Client/Server, Stateless, Cacheable, Uniform Interface, Layered, Code-on-demand.",
    []
  ),
  c18.d(
    "REST/JSON",
    "Easy",
    "Place the four steps of exchanging variables using a data serialization language (JSON) over a REST API in the exact order they occur.",
    [
      "The REST server collects the requested internal variables from its memory and passes them to its API code",
      "The server's API code serializes (converts) the internal variables into a standardized JSON text string",
      "The server transmits the JSON string across the network inside the HTTP response message to the REST client",
      "The REST client parses (converts) the received JSON string into native variables (such as Python dictionaries and lists) in its own memory"
    ],
    "To exchange structured variables between programs running on different hosts and written in different languages, the server converts its internal variables into a JSON string, sends the JSON text over the network in the REST response, and the client converts the JSON string into native client-side variables.",
    "Serialization pipeline: Server Internal Vars -> JSON String -> Network (HTTP Response) -> Client JSON Parser -> Client Internal Vars.",
    []
  ),
  c18.t(
    "REST/JSON",
    "Medium",
    "Match each JSON or Python data structure term to its equivalent partner or syntax representation.",
    [
      ["JSON Object `{ \"k\": \"v\" }`", "Converts to a Python `dict` (dictionary) of key:value pairs (called an associative array in Java)"],
      ["JSON Array `[ \"a\", \"b\", \"c\" ]`", "Converts to a Python `list` of ordered elements (called an array in Java)"],
      ["HTTP POST verb", "Maps to the CRUD Create action to instantiate new data structures on the REST server"],
      ["HTTP PUT / PATCH verbs", "Map to the CRUD Update action to replace or modify existing variable values on the REST server"],
      ["URI Query `?key=value`", "Passes filtering parameters to the REST server at the end of the URI after the resource path"]
    ],
    "When Python parses JSON data from a REST API, JSON objects `{ }` become Python dictionaries (`dict`) and JSON arrays `[ ]` become Python lists (`list`). Meanwhile, REST over HTTP uses POST for Create, GET for Read, PUT/PATCH for Update, DELETE for Delete, and `?` in the URI for query parameters.",
    "Python <-> JSON mapping: JSON Object `{}` = Python `dict`; JSON Array `[]` = Python `list`.",
    []
  )
];

// ============================================================================
// v2c19: Understanding Ansible, Puppet, and Chef
// ============================================================================
const c19 = mk("Automation and Programmability", 10, "v2c19");
const q19 = [
  c19.s(
    "Config management",
    "Easy",
    "In network operations, what does the term 'configuration drift' describe?",
    "Unintended differences that accumulate over time between a device's running-config and its central baseline config",
    [
      ["The gradual slowing of a router's hardware clock when Network Time Protocol (NTP) servers become unreachable", "Clock skew is managed by NTP; configuration drift refers to device configuration lines diverging from the intended standard."],
      ["The automatic migration of Virtual Machines (VMs) from one physical Cisco UCS blade server to another during maintenance", "Moving VMs between physical hosts is VM live migration managed by a hypervisor, not configuration drift."],
      ["The delay added to Voice over IP (VoIP) packets when a WAN edge router shapes outbound traffic to match a provider's CIR", "Delay added by traffic shaping is shaping delay (or jitter), not configuration drift."]
    ],
    "Configuration drift occurs when engineers make ad-hoc manual changes on individual routers or switches (for example, during late-night troubleshooting) without updating the standard baseline, causing a device's configuration to drift away from the intended configuration shared by other devices in the same role.",
    "Configuration drift = a device's config straying from the intended standard/baseline (creating unique 'snowflake' devices).",
    []
  ),
  c19.s(
    "Config management",
    "Easy",
    "Which configuration management tool uses an agentless architecture, connects to Cisco network devices via SSH or NETCONF, and uses a push model driven by Playbooks?",
    "Ansible Automation",
    [
      ["Puppet Enterprise", "Puppet typically uses a pull model with an on-device or external proxy agent and defines desired state in Manifests."],
      ["Progress Chef Infra", "Chef uses an agent-based pull model where Chef nodes pull Recipes and Runlists from a Chef server."],
      ["GitHub Enterprise", "GitHub (using Git) is a version control repository service for tracking file changes rather than a push/pull device configuration engine."]
    ],
    "Ansible uses an agentless architecture (requiring no special agent software on Cisco routers or switches) and a push model. When an engineer runs an Ansible Playbook on the control node, Ansible pushes configuration changes to the target devices using SSH or NETCONF.",
    "Ansible = Agentless + Push model + Playbooks/Inventory/Jinja2/YAML + SSH/NETCONF.",
    []
  ),
  c19.s(
    "Config management",
    "Easy",
    "In Puppet and Chef, what are the names of the primary files that define configuration actions or desired state, and which operational model (push or pull) do both tools use?",
    "Puppet uses Manifests and Chef uses Recipes/Cookbooks/Runlists; both tools use a pull model",
    [
      ["Puppet uses Playbooks and Chef uses Manifests; both tools use an agentless push model", "Playbooks and the agentless push model belong to Ansible, whereas Puppet uses Manifests and Chef uses Recipes in a pull model."],
      ["Puppet uses Cookbooks and Chef uses Inventories; Puppet uses a push model while Chef uses a pull model", "Cookbooks/Recipes belong to Chef, Inventories/Playbooks belong to Ansible, and both Puppet and Chef use a pull model."],
      ["Puppet uses Jinja2 files and Chef uses YANG models; both tools push changes using Telnet and TFTP", "Jinja2 templates are used by Ansible, and both Puppet and Chef use HTTP (REST) in a pull model rather than Telnet/TFTP."]
    ],
    "Both Puppet and Chef use a pull model (over HTTP/REST) in which an agent polls the central server (Puppet Master or Chef Server) to pull configuration instructions and enforce the desired state. Puppet stores desired state in Manifests (composed of modules, classes, and resources), while Chef uses Recipes (grouped into Cookbooks and ordered in Runlists).",
    "Puppet = Manifests (Pull); Chef = Recipes, Cookbooks, Runlists (Pull); Ansible = Playbooks (Push).",
    []
  ),
  c19.s(
    "Config management",
    "Easy",
    "When a network engineering team stores centralized router configuration files in a version control system such as Git (or GitHub), which two problems does version control directly solve?",
    "It records who changed a file and when, and shows exact line-by-line additions (`+`) and removals (`-`)",
    [
      ["It automatically logs into every branch router via SSH every 5 minutes to overwrite manual CLI changes", "Polling running-configs and overwriting drift is performed by a configuration monitoring/enforcement tool (like Ansible, Puppet, or Chef), not by Git alone."],
      ["It encrypts unencrypted FTP file transfers and converts SNMPv2c community strings into SNMPv3 hashes", "Git is a software version control system for tracking file history, not a network transport encryption or SNMP protocol tool."],
      ["It dynamically calculates OSPF shortest-path trees and populates the TCAM tables on Cisco Nexus spine switches", "Routing calculations and TCAM programming are control/data plane switch functions unrelated to Git version control."]
    ],
    "Saving configurations on routers alone provides no history of who changed what or when. Storing centralized configuration files (and templates/variables) in a version control system like Git/GitHub records the author and timestamp of every commit and displays exact character- and line-level diffs (`-` for removed lines, `+` for added lines).",
    "Version control (Git/GitHub) answers WHO changed the central file, WHEN it changed, and WHAT exact lines changed (`+` / `-`).",
    []
  ),
  c19.s(
    "Config management",
    "Medium",
    "What is the difference between 'configuration provisioning' and 'configuration monitoring' (also called configuration enforcement) in an automated configuration management tool?",
    "Provisioning pushes intended config changes to devices, whereas monitoring compares live `running-config` files to detect or fix drift",
    [
      ["Provisioning backs up IOS `.bin` images to a TFTP server, whereas monitoring uses SNMP Traps to check power supply fan speeds", "Configuration management tools focus on device configuration state (`running-config` vs ideal config) rather than environmental fan traps."],
      ["Provisioning requires an on-device agent using a pull model, whereas monitoring can only be performed manually by a human typing `show running-config`", "All three tools (Ansible, Puppet, and Chef) can automate both configuration provisioning and configuration monitoring/enforcement."],
      ["Provisioning deletes the `startup-config` in NVRAM, whereas monitoring prevents engineers from logging in via the console port", "Provisioning applies intended changes (and can optionally save `running-config` to `startup-config`), while monitoring detects and remediates configuration drift."]
    ],
    "When treating centralized configuration files as the 'single source of truth,' configuration provisioning pushes or pulls intentional edits from the central repository out to the network devices. Configuration monitoring (enforcement) retrieves the current `running-config` from each device, compares it against the central ideal configuration to spot unauthorized manual changes (drift), and either alerts staff or automatically reconfigures the device.",
    "Provisioning = deploying intended config changes to devices; Monitoring/Enforcement = comparing live `running-config` to ideal config to catch/fix drift.",
    []
  ),
  c19.s(
    "Config management",
    "Medium",
    "How do Ansible Playbooks and Puppet Manifests differ in using an 'imperative' (procedural) language versus a 'declarative' language?",
    "Ansible Playbooks use an imperative approach listing step-by-step tasks, whereas Puppet Manifests declare the desired end-state config",
    [
      ["Ansible Playbooks use a declarative approach where devices decide how to configure themselves, whereas Puppet Manifests list step-by-step SSH CLI commands", "This reverses the two tools: Ansible playbooks list explicit tasks/steps (imperative), whereas Puppet manifests declare the target end state (declarative)."],
      ["Imperative languages require an agent installed on every router, whereas declarative languages work only without agents", "Ansible is imperative and agentless, whereas Puppet is declarative and uses agents (internal or external proxy)."],
      ["Imperative languages can only read operational data via SNMP, whereas declarative languages can only delete configurations", "Both imperative playbooks and declarative manifests can provision and enforce full device configurations."]
    ],
    "Ansible Playbooks use an imperative (procedural) style: the engineer defines the exact sequence of tasks and conditional actions Ansible should execute. Puppet Manifests use a declarative style: the engineer declares what the final configuration state of the device should be, and Puppet determines what changes (if any) are needed to reach that state.",
    "Ansible Playbook = Imperative (specifies the step-by-step tasks); Puppet Manifest = Declarative (specifies the desired final state).",
    []
  ),
  c19.s(
    "Config management",
    "Medium",
    "Many Cisco IOS routers and switches cannot run an internal on-device Puppet agent or Chef client. How does Puppet overcome this limitation to manage those Cisco devices, and how does this compare to Ansible and Chef?",
    "Puppet runs an external proxy agent over SSH, whereas Ansible is natively agentless via SSH/NETCONF and Chef needs a local agent",
    [
      ["Puppet requires replacing the Cisco IOS image with Linux Ubuntu, whereas Chef uses TFTP to push configurations without an agent", "Chef requires an on-device Chef client (limiting its use on Cisco gear), while Puppet supports an external proxy agent over SSH."],
      ["Puppet uses OpenFlow to bypass Cisco IOS completely, whereas Ansible requires installing a Python agent inside every switch's TCAM", "Ansible is completely agentless on network devices (running on a control node over SSH/NETCONF), and Puppet uses HTTP/REST to an internal or external proxy agent."],
      ["All three tools require a Cisco DNA Center appliance in the middle because none of them can communicate with Cisco IOS directly", "Ansible (via SSH/NETCONF) and Puppet (via internal agent or external SSH proxy agent) can manage Cisco IOS devices directly without DNA Center."]
    ],
    "Chef requires an on-device Chef client agent, which many Cisco network OSs do not support. Puppet supports both an on-device agent (where supported) and an 'agentless' proxy mode where an external Puppet agent on a Linux host pulls the manifest from the Puppet Master via HTTP/REST and configures the Cisco router over SSH. Ansible is natively agentless, pushing configs directly from the control node over SSH or NETCONF.",
    "Cisco device support ranking: Ansible (natively agentless via SSH/NETCONF) & Puppet (internal agent or external SSH proxy agent) > Chef (requires on-device agent).",
    []
  ),
  c19.s(
    "Config management",
    "Medium",
    "In Ansible, which two file types and languages are combined to generate standardized configurations for 100 branch routers that share the same role but have unique hostnames, IP addresses, and OSPF router IDs?",
    "A single shared Jinja2 template using `{{variable}}` syntax and per-device YAML variable files using `---`",
    [
      ["A single shared template file written in XML with `<variable>` tags and per-device variable files written in Java", "Ansible uses the Jinja2 language for configuration templates and YAML for variable files and playbooks, not XML or Java."],
      ["100 separate Playbook files written in C++ and a single central Manifest file written in Puppet DSL", "Ansible uses YAML Playbooks, Inventory files, Jinja2 Templates, and YAML Variable files; Manifests belong to Puppet."],
      ["A single Runlist file written in Ruby and per-device Cookbook files formatted as minified JSON arrays", "Runlists and Cookbooks (using Ruby DSL) are Chef constructs, not Ansible constructs."]
    ],
    "To prevent 'snowflake' configurations across devices in the same role, Ansible separates the common configuration structure into one Jinja2 template file (where placeholders are written inside double curly brackets like `hostname {{hostname}}`) and stores each device's unique values in a YAML variables file. Ansible merges the template and YAML variables to produce each router's exact ideal configuration.",
    "Ansible templating pair: Template = Jinja2 (`{{var}}` syntax); Variables & Playbooks = YAML (`---` and `key: value` syntax).",
    []
  ),
  c19.s(
    "Config management",
    "Hard",
    "Examine the Ansible Jinja2 template and YAML variables file for router BR5 shown in the exhibit. When Ansible processes these two files, what exact IOS configuration lines are generated for `GigabitEthernet0/0` and the OSPF router-id?",
    "`ip address 10.5.1.1 255.255.255.0`, `ip ospf 10 area 5`, and `router-id 10.5.255.1`",
    [
      ["`ip address {{lan_ip}} {{lan_mask}}`, `ip ospf {{pid}} area {{area_id}}`, and `router-id {{rid}}`", "Ansible substitutes the values from the YAML file in place of every `{{variable}}` placeholder rather than pushing literal curly braces to IOS."],
      ["`ip address 10.5.12.1 255.255.255.252`, `ip ospf 5 area 10`, and `router-id BR5`", "10.5.12.1/30 is `wan_ip`/`wan_mask` (used on Gi0/1/0), and `pid` is `10` while `area_id` is `5`."],
      ["The template fails with a syntax error because `'5'` and `'10'` are enclosed in single quotes in the YAML file", "Single-quoted strings in YAML (such as `area_id: '5'`) are valid and substitute cleanly into the Jinja2 template as `ip ospf 10 area 5`."]
    ],
    "Ansible's Jinja2 processor replaces each `{{variable_name}}` placeholder in the template with the matching value from the device's YAML file: `{{lan_ip}}` becomes `10.5.1.1`, `{{lan_mask}}` becomes `255.255.255.0`, `{{pid}}` becomes `10`, `{{area_id}}` becomes `5`, and `{{rid}}` becomes `10.5.255.1`.",
    "Read Jinja2 + YAML carefully: match each `{{key}}` in the template to `key: value` in the YAML file.",
    [],
    {
      cli: "! --- Jinja2 Template (branch.j2) ---\nhostname {{hostname}}\ninterface GigabitEthernet0/0\n ip address {{lan_ip}} {{lan_mask}}\n ip ospf {{pid}} area {{area_id}}\ninterface GigabitEthernet0/1/0\n ip address {{wan_ip}} {{wan_mask}}\n ip ospf {{pid}} area {{area_id}}\nrouter ospf {{pid}}\n router-id {{rid}}\n\n# --- YAML Variables (BR5.yml) ---\n---\nhostname: BR5\nlan_ip: 10.5.1.1\nlan_mask: 255.255.255.0\nwan_ip: 10.5.12.1\nwan_mask: 255.255.255.252\nrid: 10.5.255.1\narea_id: '5'\npid: '10'"
    }
  ),
  c19.s(
    "Config management",
    "Hard",
    "An enterprise uses centralized configuration files in Git as the 'single source of truth' and provisions changes with an automated tool. At 2:00 a.m., an engineer logs directly into branch router BR22 via SSH and adds a static route to `running-config` and `startup-config`, without updating the central Git repository. What is the risk of this action, and how does the configuration management tool handle it?",
    "It causes configuration drift, and the next enforcement cycle will detect the mismatch and overwrite the manual route or alert the team",
    [
      ["The router's IOS CLI automatically commits and pushes the new static route back into the central GitHub repository with a `+` diff marker", "Cisco IOS `copy running-config startup-config` does not automatically commit changes to an external Git repository."],
      ["The manual change permanently updates the Jinja2 template for all other branch routers, causing every branch router to install BR22's static route", "Logging into one router via SSH only alters that single router's local config; it does not modify central Jinja2 templates."],
      ["Version control software blocks all direct SSH logins on Cisco routers unless the administrator authenticates with a Chef Recipe", "Engineers can still log into devices via SSH if they have credentials, which is why configuration monitoring/enforcement is needed to catch drift."]
    ],
    "When the central repository is the single source of truth, making direct manual CLI changes on a device causes configuration drift. Not only is the change untracked in version control, but the next time the configuration management tool runs provisioning or configuration enforcement, it compares the router's `running-config` against the central ideal file and either overwrites the manual change or flags the drift.",
    "If the central repo is the 'single source of truth,' manual on-box CLI edits cause drift and will be flagged or overwritten by config enforcement!",
    []
  ),
  c19.m(
    "Config management",
    "Medium",
    "Which two advantages come from separating device configurations into a shared role-based Template file and per-device Variable files?",
    [
      "It prevents unique 'snowflake' configurations by enforcing one standard configuration structure across all devices sharing a role",
      "It simplifies adding new devices via small variable files and separates template history from per-device edits for troubleshooting"
    ],
    [
      ["It eliminates the need for SSH, NETCONF, or HTTP network connectivity between the configuration server and the managed routers", "Templates and variables generate the intended configuration on the server/control node, which still must be pushed or pulled over the network."],
      ["It allows a single IPv4 address and OSPF router-id to be assigned identically to every branch router in the enterprise without conflict", "Every router still requires unique IP addresses and OSPF router-ids, which is the exact purpose of the per-device YAML variable files."],
      ["It converts imperative Ansible Playbooks into hardware ASIC microcode so routers no longer need a `running-config` file in RAM", "Routers still use their standard `running-config` in RAM; templates simply automate generating and maintaining those configurations consistently."]
    ],
    "Separating configurations into a role template (common to all branch routers, for example) and per-device variable files (unique IPs, hostnames, router-IDs) eliminates ad-hoc 'snowflake' configs, makes adding a new branch router as simple as creating a short YAML variable file, and lets engineers troubleshoot whether an issue came from a template change or a device-specific variable change.",
    "Templates + Variables = No 'snowflakes', fast new-device rollout, and clean separation of role changes vs. device-specific variable changes.",
    []
  ),
  c19.m(
    "Config management",
    "Hard",
    "Which three capabilities are standard configuration provisioning features provided by automated configuration management tools (such as Ansible, Puppet, and Chef)?",
    [
      "Selecting device subsets by inventory role and scheduling configuration changes to execute unattended in maintenance windows",
      "Validating whether proposed changes will be accepted before applying them and verifying the final configuration state afterward",
      "Detecting whether any configuration command was rejected by a device and automatically rolling back to the original configuration"
    ],
    [
      ["Replacing damaged physical Ethernet cabling between Top-of-Rack and End-of-Row switches automatically whenever a fiber link fails", "Configuration management tools automate software configuration provisioning and monitoring; they cannot physically recable racks."],
      ["Providing a dedicated public cloud Intercloud Exchange circuit with guaranteed voice QoS SLAs between AWS and Microsoft Azure", "Intercloud Exchanges are WAN service provider offerings for cloud connectivity, not device configuration management features."],
      ["Requiring a human engineer to sit at the console port and press Enter manually after every single IOS configuration line is sent", "Configuration management tools automate logic, error handling, rollback, and `running-config` to `startup-config` saves so changes can run unattended."]
    ],
    "Automated configuration provisioning goes far beyond pasting text into a terminal: tools can target subsets of devices by role, dry-run/validate changes beforehand, schedule unattended execution, detect rejected commands, automatically roll back partial changes on failure, verify post-change compliance, and conditionally save `running-config` to `startup-config`.",
    "Provisioning power features: Subset targeting, dry-run validation, scheduled unattended runs, automatic rollback on error, and post-check verification.",
    []
  ),
  c19.d(
    "Config management",
    "Medium",
    "Place the four steps of Puppet's pull-model workflow in the exact chronological order they occur to configure a managed router.",
    [
      "The network engineer creates and edits the Manifest, Template, and Variable files on the central Puppet Master server",
      "The network engineer configures and starts the on-device Puppet agent (or external proxy agent) for the target router",
      "The Puppet agent initiates an HTTP (REST) connection to pull Manifest details from the Puppet Master to check what the router's configuration state should be",
      "If the router's current configuration does not match the desired state, the Puppet agent pulls the required configuration details and updates the router's configuration"
    ],
    "In Puppet's pull model, the engineer defines the desired end-state in a Manifest on the Puppet Master and enables the Puppet agent (on-device or external proxy). The agent periodically polls (pulls from) the Puppet Master over HTTP/REST to compare the router's state against the Manifest, pulling additional details and reconfiguring the router whenever changes are needed.",
    "Puppet Pull sequence: Engineer builds Manifest on Puppet Master -> Agent starts -> Agent pulls Manifest state via HTTP/REST -> Agent pulls config & updates device.",
    []
  ),
  c19.t(
    "Config management",
    "Medium",
    "Match each Ansible, Puppet, or Chef term to its correct tool and definition.",
    [
      ["Playbook & Inventory (Ansible)", "Files that define imperative automation tasks/logic and list managed device hostnames/roles for agentless push over SSH/NETCONF"],
      ["Jinja2 Template (Ansible)", "Text file using `{{variable}}` placeholders that Ansible combines with YAML variables to build a device's configuration"],
      ["Manifest, Module, Class, Resource (Puppet)", "Declarative files and hierarchical components on a Puppet Master that define the desired configuration state of a device"],
      ["Cookbook, Recipe, Runlist (Chef)", "Grouped sets of configuration logic and ordered execution lists pulled via HTTP (REST) by an on-device Chef client agent"],
      ["Configuration Enforcement (Monitoring)", "Automated process that compares a device's live `running-config` against the central ideal config to detect and remediate configuration drift"]
    ],
    "Each tool has distinct terminology: Ansible uses Playbooks, Inventories, Jinja2 Templates (`{{ }}`), and YAML Variables in an agentless push model over SSH/NETCONF; Puppet uses Manifests (modules, classes, resources) in an agent/proxy pull model over HTTP (REST); and Chef uses Cookbooks, Recipes, Runlists, and Resources in an on-device agent pull model over HTTP (REST).",
    "Lock in Table 19-2: Ansible = Playbook / SSH, NETCONF / Agentless / Push; Puppet = Manifest / HTTP (REST) / Agent or Proxy / Pull; Chef = Recipe, Runlist / HTTP (REST) / Agent / Pull.",
    []
  )
];

export default [
  ...q11,
  ...q12,
  ...q13,
  ...q14,
  ...q15,
  ...q16,
  ...q17,
  ...q18,
  ...q19
];
