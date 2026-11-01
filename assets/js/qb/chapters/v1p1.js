import { mk } from "../build.js?v=78";

// ============================================================================
// v1c01 - Introduction to TCP/IP Networking (15 questions: 4 Easy, 7 Medium, 4 Hard)
// ============================================================================
const c01 = mk("Network Fundamentals", 20, "v1c01");
const q01 = [
  c01.s(
    "OSI/TCP-IP", "Easy",
    "Which protocol data unit (PDU) term specifically describes data encapsulated with a Transport layer header?",
    "Segment",
    [
      ["Frame", "A frame is a Layer 2 (Data Link) PDU that includes both a header and a trailer, not a Layer 4 PDU."],
      ["Packet", "A packet is a Layer 3 (Network) PDU created by encapsulating a segment inside an IP header."],
      ["Bit stream", "Bits represent the unencapsulated Layer 1 physical transmission stream rather than a Layer 4 PDU."]
    ],
    "In TCP/IP terminology, the Transport layer (Layer 4) encapsulates application data with a TCP or UDP header to form a segment (or L4PDU). The Network layer encapsulates segments into packets (L3PDUs), and the Data Link layer encapsulates packets into frames (L2PDUs).",
    "Remember the PDU order from Layer 4 down to Layer 2: Segment (L4) -> Packet (L3) -> Frame (L2).",
    []
  ),
  c01.s(
    "OSI/TCP-IP", "Easy",
    "In the original four-layer TCP/IP model defined by RFC 1122, which single layer combines the functions of the five-layer model's Physical and Data Link layers?",
    "The RFC 1122 Link layer",
    [
      ["The RFC 1122 Internet layer", "The Internet layer corresponds to the Network layer (Layer 3), not the combined Layer 1 and Layer 2 functions."],
      ["The Network Interface layer", "Network Interface is an informal name sometimes used for Layer 1/2, but RFC 1122 specifically names this combined lower layer the Link layer and never includes Transport or Network."],
      ["The RFC 1122 Session layer", "Session is Layer 5 of the seven-layer OSI reference model and does not exist in the RFC 1122 TCP/IP model."]
    ],
    "The original four-layer TCP/IP architecture defined in RFC 1122 consists of the Application, Transport, Internet, and Link layers. The Link layer encompasses both the Data Link and Physical layers shown in the newer five-layer TCP/IP model.",
    "4-layer TCP/IP = Application, Transport, Internet, Link; 5-layer splits Link into Data Link + Physical.",
    []
  ),
  c01.s(
    "OSI/TCP-IP", "Easy",
    "Which HTTP status code is returned in an HTTP reply header when a web server cannot locate the file requested by a browser's HTTP GET request?",
    "HTTP 404 Not Found",
    [
      ["HTTP 200 OK", "HTTP status code 200 (OK) indicates that the server found the file and is returning it in the response."],
      ["HTTP 301 Redirect", "HTTP status code 301 is a redirection status code rather than the standard Not Found error code."],
      ["HTTP 503 Service Unavailable", "HTTP status code 503 indicates a server-side service unavailability rather than a missing requested file."]
    ],
    "When an HTTP client sends a GET request for a URI that does not exist on the web server, the server replies with an HTTP header containing status code 404 (Not Found). When the file exists, the server responds with status code 200 (OK) followed by the file contents.",
    "HTTP 200 = OK (success); HTTP 404 = Not Found.",
    []
  ),
  c01.s(
    "OSI/TCP-IP", "Easy",
    "Which layer of the seven-layer OSI model sits immediately below the Application layer and focuses on data formatting and syntax negotiation?",
    "The OSI Presentation layer",
    [
      ["The OSI Session layer", "The Session layer is Layer 5 of the OSI model, sitting below the Presentation layer."],
      ["The OSI Transport layer", "The Transport layer is Layer 4 of the OSI model, sitting below the Session layer."],
      ["The OSI Data Link layer", "The Data Link layer is Layer 2 of the OSI model and handles local media framing rather than application data syntax."]
    ],
    "From top to bottom, the upper three layers of the OSI model are Application (Layer 7), Presentation (Layer 6), and Session (Layer 5). In the TCP/IP model, all three of these OSI layers are combined into the single Application layer.",
    "OSI Layers 7-6-5 (Application, Presentation, Session) all map to the TCP/IP Application layer.",
    []
  ),
  c01.s(
    "OSI/TCP-IP", "Medium",
    "How do adjacent-layer interaction and same-layer interaction differ within the TCP/IP networking model?",
    "Adjacent-layer interaction occurs vertically on one host as a lower layer serves the upper layer, whereas same-layer interaction occurs between matching layers on two hosts.",
    [
      ["Adjacent-layer interaction occurs between two directly connected routers over a cable, whereas same-layer interaction occurs between two processes inside the same operating system.", "Both routers communicating over a link use same-layer interaction at Layers 1-3; adjacent-layer interaction happens vertically within a single device's protocol stack."],
      ["Adjacent-layer interaction uses protocol trailers to verify frame integrity across a LAN, whereas same-layer interaction strips headers as frames move up the stack.", "Stripping headers up the stack on one device is part of de-encapsulation between adjacent layers, while trailers are only used by Layer 2 same-layer logic."],
      ["Adjacent-layer interaction requires matching TCP sequence numbers on both endpoints, whereas same-layer interaction passes raw payloads across hardware interfaces.", "Matching TCP sequence numbers between two endpoints is a classic example of Layer 4 same-layer interaction, not adjacent-layer interaction."]
    ],
    "Adjacent-layer interaction refers to vertical communication within a single computer, where a higher layer requests a service from the layer directly beneath it (such as IP asking Ethernet to transmit a packet). Same-layer interaction refers to logical horizontal communication between the same layer on two separate hosts via information stored in that layer's header.",
    "Adjacent-layer = vertical on one device; Same-layer = horizontal between two devices via headers.",
    []
  ),
  c01.s(
    "TCP/UDP", "Medium",
    "A web server transmits a large web page across four TCP segments labeled SEQ 1, SEQ 2, SEQ 3, and SEQ 4, but only SEQ 1, SEQ 2, and SEQ 4 arrive at the client. How do HTTP and TCP handle the missing third segment?",
    "The client's TCP process notices the gap in sequence numbers and requests that the server's TCP process retransmit SEQ 3.",
    [
      ["The client's browser sends a new HTTP GET request containing a byte-offset header to retrieve only the missing portion of the page.", "HTTP relies on TCP for reliable delivery and does not issue partial GET requests to recover lost transport segments."],
      ["The intermediate IP router that dropped SEQ 3 caches a copy of the packet and automatically resends it when the link clears.", "IP routers do not perform transport-layer retransmission or cache dropped packets for recovery."],
      ["The Data Link layer on the receiving host calculates an FCS repair mask to reconstruct SEQ 3 without requesting retransmission.", "The Ethernet FCS only detects corrupted frames so they can be discarded; it cannot reconstruct lost frames or segments."]
    ],
    "TCP provides reliable end-to-end delivery for upper-layer protocols like HTTP. By numbering segments with sequence numbers (SEQ), the receiving TCP layer detects missing segments and requests retransmission from the sender's TCP layer transparently to the application.",
    "TCP handles error recovery using sequence numbers and acknowledgments; IP and Ethernet do not retransmit lost packets.",
    []
  ),
  c01.s(
    "OSI/TCP-IP", "Medium",
    "When a web server returns a large image file that requires dozens of TCP segments, which segments contain an HTTP reply header?",
    "Only the first TCP segment contains the HTTP reply header, while all subsequent segments carry raw chunks of the image data.",
    [
      ["Every TCP segment must include a duplicate copy of the HTTP 200 OK header so the browser can reassemble the image in order.", "TCP sequence numbers handle segment reassembly, so repeating the HTTP header in every segment is unnecessary and not performed."],
      ["Only the first and last TCP segments contain an HTTP header to mark the start and end boundaries of the application stream.", "HTTP does not place a closing HTTP header in the final segment; it places the header only at the beginning of the response message."],
      ["None of the data segments contain an HTTP header because the server sends the HTTP status code over a separate UDP control channel.", "HTTP sends both the response header and the payload over the same TCP connection, starting with the header in the first segment."]
    ],
    "When transferring a large object over HTTP, the server places the HTTP reply header (such as 200 OK) at the beginning of the response message, which fits inside the first TCP segment. All following TCP segments for that transfer contain only chunks of the file data encapsulated in TCP, IP, and Data Link headers.",
    "One HTTP response = one HTTP header in the first chunk; subsequent chunks carry only payload data inside TCP/IP/L2 headers.",
    []
  ),
  c01.s(
    "OSI/TCP-IP", "Medium",
    "Which layer of the TCP/IP model is uniquely responsible for adding both a header in front of the payload and a trailer after the payload during encapsulation?",
    "The TCP/IP Data Link layer",
    [
      ["The TCP/IP Transport layer", "The TCP checksum is a field inside the TCP header, not a separate trailer appended to the end of the segment."],
      ["The TCP/IP Network layer", "The IPv4 checksum is located inside the 20-byte IPv4 header; IP does not use a trailer."],
      ["The TCP/IP Physical layer", "The Frame Check Sequence (FCS) trailer is a Data Link (Layer 2) structure, whereas the Physical layer transmits the resulting bits."]
    ],
    "During the five-step host encapsulation process, the Application, Transport, and Network layers prepend headers to the data. Only the Data Link layer (Layer 2) encapsulates the packet using both a leading Layer 2 header and a trailing Frame Check Sequence (FCS) trailer.",
    "Layer 2 (Data Link) is the only layer that adds both a header and a trailer.",
    []
  ),
  c01.s(
    "OSI/TCP-IP", "Medium",
    "When a router forwards an IPv4 packet from an Ethernet LAN interface onto a point-to-point WAN link, which OSI layers does the router actively process to forward the packet?",
    "OSI Layers 1, 2, and 3",
    [
      ["OSI Layers 1 and 2 only", "Layer 2 switches process only Layers 1 and 2, whereas routers must inspect the Layer 3 IP header to make forwarding decisions."],
      ["OSI Layers 1, 2, 3, and 4", "Standard IP routing examines only up to Layer 3 (the IP packet header) and leaves the Layer 4 segment untouched."],
      ["OSI Layers 1 through 7", "Routers only replace the Layer 2 frame header and trailer when moving a packet between links; Layers 4 through 7 remain unchanged."]
    ],
    "A router operates as a Layer 3 device. When forwarding a packet, it receives the bits at Layer 1, checks and removes the incoming Layer 2 frame header and trailer, inspects the Layer 3 IP destination address to choose the outgoing interface, and encapsulates the unaltered IP packet into a new Layer 2 frame for transmission at Layer 1.",
    "Switches process up to Layer 2; routers process up to Layer 3; end hosts process all layers (1-7).",
    []
  ),
  c01.d(
    "OSI/TCP-IP", "Medium",
    "Order the five steps of the TCP/IP host data encapsulation process from top to bottom as a web server prepares data for transmission.",
    [
      "Create and encapsulate the application data with any required Application layer headers",
      "Encapsulate the data supplied by the Application layer inside a Transport layer header",
      "Encapsulate the data supplied by the Transport layer inside a Network layer IP header",
      "Encapsulate the data supplied by the Network layer inside a Data Link layer header and trailer",
      "Transmit the framed bits onto the physical medium using electrical or optical encoding"
    ],
    "A sending host encapsulates data top-down through the five-layer TCP/IP stack: Application (data/message), Transport (segment), Network (packet), Data Link (frame with header and trailer), and Physical (bit transmission).",
    "Follow the 5-layer stack top-down: Application -> Transport -> Network -> Data Link (header + trailer) -> Physical (bits).",
    []
  ),
  c01.t(
    "OSI/TCP-IP", "Medium",
    "Match each protocol or specification to its corresponding layer in the five-layer TCP/IP networking model.",
    [
      ["HTTP", "Application Layer (Layer 7)"],
      ["TCP", "Transport Layer (Layer 4)"],
      ["IP", "Network Layer (Layer 3)"],
      ["Ethernet Data Link", "Data Link Layer (Layer 2)"],
      ["1000BASE-T encoding", "Physical Layer (Layer 1)"]
    ],
    "In the five-layer TCP/IP model, HTTP operates at the Application layer (Layer 7), TCP at the Transport layer (Layer 4), IP at the Network layer (Layer 3), Ethernet framing at the Data Link layer (Layer 2), and physical signaling standards like 1000BASE-T at the Physical layer (Layer 1).",
    "Keep Ethernet split in mind: Ethernet framing/MAC is Layer 2, while cabling and line encoding (like 1000BASE-T) are Layer 1.",
    []
  ),
  c01.m(
    "OSI/TCP-IP", "Hard",
    "Which statements accurately compare the OSI reference model with the five-layer TCP/IP networking model?",
    [
      "The TCP/IP Application layer encompasses the functions of the OSI Application, Presentation, and Session layers.",
      "Standard industry terminology uses OSI layer numbers (such as Layer 2 and Layer 3) when referring to TCP/IP layers."
    ],
    [
      ["The OSI model defines four layers in total, whereas the modern TCP/IP model expands the stack into seven distinct layers.", "It is the opposite: the OSI model has seven layers, while TCP/IP has four (RFC 1122) or five layers."],
      ["The TCP/IP Transport layer combines the functions of the OSI Session, Transport, and Network layers into a single header.", "The TCP/IP Transport layer maps directly to OSI Layer 4 (Transport); Session maps to Application and Network maps to Layer 3."],
      ["Modern enterprise networks run the complete seven-layer OSI protocol suite instead of TCP/IP protocols on production LANs.", "TCP/IP won the protocol wars and is used universally on modern networks, while the OSI model is used for terminology and layering concepts."]
    ],
    "Although TCP/IP is the universal protocol suite used in production networks, networking engineers routinely borrow OSI layer numbers—calling the Data Link layer 'Layer 2', the Network layer 'Layer 3', the Transport layer 'Layer 4', and the combined Application/Presentation/Session layer 'Layer 7'.",
    "In the 5-layer TCP/IP model, Layers 1-4 match OSI Layers 1-4, and TCP/IP Application maps to OSI Layers 5-7.",
    []
  ),
  c01.s(
    "OSI/TCP-IP", "Hard",
    "Host A sends an HTTP request to a web server located on a different IP subnet across one router. How many times is the IP packet encapsulated inside a Data Link frame along the path from Host A to the server?",
    "Twice: once by Host A for the local Ethernet LAN and once by the router for the destination server's LAN",
    [
      ["Once: Host A creates the Ethernet frame and the router forwards that exact frame header unchanged to the server", "Routers strip the incoming Layer 2 header and trailer and create a brand-new Layer 2 frame for the outgoing link."],
      ["Three times: once by Host A, once by the LAN switch, and once by the router before reaching the server", "Layer 2 LAN switches inspect and forward the existing Ethernet frame without stripping or replacing the Data Link header."],
      ["Four times: every network interface card and switch port along the path replaces the Data Link header and trailer", "Only Layer 3 devices (hosts and routers) originate or replace Data Link headers; Layer 2 switches pass the frame intact."]
    ],
    "Data Link frames are local to each individual link or LAN segment. Host A encapsulates the IP packet into a Data Link frame addressed to the router. When the router receives the frame, it discards the original Layer 2 header and trailer, makes a routing decision based on the IP header, and encapsulates the IP packet into a new Data Link frame for the destination LAN.",
    "Layer 2 frames change at every router hop, while the Layer 3 IP packet remains intact end-to-end.",
    []
  ),
  c01.s(
    "OSI/TCP-IP", "Hard",
    "Why is a router's forwarding operation described as 'IP routing' even though the physical interfaces send and receive Data Link frames?",
    "The router inspects the Layer 3 destination IP address to select the egress link and uses Layer 2 frames only hop by hop.",
    [
      ["The router encapsulates the entire Data Link frame inside an outer IP header before transmitting it across the WAN link.", "Data Link frames encapsulate IP packets (L2 wraps L3), never the other way around during standard IP routing."],
      ["The router translates Ethernet MAC addresses directly into IPv4 addresses by rewriting the Transport layer segment header.", "Routers do not rewrite Transport layer headers or translate MAC addresses into IP addresses; they look up the existing destination IP."],
      ["The router discards the IP header at each hop and forwards the payload based solely on the Data Link trailer checksum.", "The IP header is preserved end-to-end from source host to destination host; only the Layer 2 header and trailer are replaced at each hop."]
    ],
    "Although physical links always transmit Data Link frames, the forwarding intelligence of a router lives at Layer 3. A router strips off the incoming Layer 2 frame, examines the destination IP address in the Layer 3 packet header to determine the next hop, and then wraps the IP packet in a new Layer 2 frame appropriate for the egress link.",
    "Data Link delivers frames across a single link (hop-to-hop); IP delivers packets end-to-end across interconnected networks.",
    []
  ),
  c01.s(
    "OSI/TCP-IP", "Hard",
    "In OSI reference model terminology, why is the acronym L4PDU equivalent to a TCP/IP segment rather than a packet?",
    "Because Layer 4 of the seven-layer OSI model is the Transport layer, whose protocol data unit is a TCP/IP segment.",
    [
      ["Because the original RFC 1122 TCP/IP model only has four layers, making Layer 4 the topmost Application layer message.", "Even though RFC 1122 has four layers, OSI LxPDU numbering always follows the seven-layer OSI model where Layer 4 is Transport."],
      ["Because an IPv4 packet is classified as an L2PDU whenever it is carried over a point-to-point serial WAN connection.", "An IPv4 packet is always an L3PDU (Network layer PDU) regardless of whether the underlying Layer 2 link is Ethernet or WAN."],
      ["Because OSI counts layers from top to bottom, making the fourth layer from the top the Network layer packet.", "OSI layers are numbered from bottom (Layer 1 Physical) to top (Layer 7 Application), so Layer 4 is Transport from either direction."]
    ],
    "OSI defines the generic term Layer x Protocol Data Unit (LxPDU) to refer to the headers and data encapsulated by Layer x of the seven-layer OSI model. Since Layer 4 of the OSI model is the Transport layer, an L4PDU is a Transport segment, an L3PDU is a Network packet, and an L2PDU is a Data Link frame.",
    "L2PDU = Frame, L3PDU = Packet, L4PDU = Segment.",
    []
  )
];

// ============================================================================
// v1c02 - Fundamentals of Ethernet LANs (15 questions: 4 Easy, 7 Medium, 4 Hard)
// ============================================================================
const c02 = mk("Network Fundamentals", 20, "v1c02");
const q02 = [
  c02.s(
    "Ethernet", "Easy",
    "Which IEEE standard and informal name correspond to Gigabit Ethernet operating over four pairs of Category 5e (or higher) unshielded twisted-pair copper cabling?",
    "1000BASE-T (IEEE 802.3ab)",
    [
      ["1000BASE-LX (IEEE 802.3z)", "1000BASE-LX (802.3z) is a fiber-optic Gigabit Ethernet standard rather than a four-pair UTP copper standard."],
      ["100BASE-TX (IEEE 802.3u)", "100BASE-T (802.3u) is Fast Ethernet (100 Mbps) over two pairs, not Gigabit Ethernet (1000 Mbps) over four pairs."],
      ["10GBASE-T (IEEE 802.3an)", "10GBASE-T (802.3an) is 10-Gigabit Ethernet rather than 1-Gigabit Ethernet."]
    ],
    "IEEE 802.3ab defines 1000BASE-T, which transmits at 1000 Mbps (1 Gbps) up to 100 meters using all four wire pairs (8 wires) in UTP cabling. By contrast, 802.3u defines 100BASE-T (Fast Ethernet), 802.3z defines 1000BASE-LX over fiber, and 802.3an defines 10GBASE-T.",
    "802.3 = 10BASE-T, 802.3u = 100BASE-T, 802.3z = 1000BASE-LX (fiber), 802.3ab = 1000BASE-T (copper), 802.3an = 10GBASE-T.",
    []
  ),
  c02.s(
    "Cabling", "Easy",
    "What is the maximum supported cable length for standard IEEE 10BASE-T, 100BASE-T, 1000BASE-T, and 10GBASE-T copper UTP Ethernet links?",
    "100 meters",
    [
      ["400 meters", "400 meters is the maximum distance for 10GBASE-S multimode fiber, not copper UTP cabling."],
      ["500 meters", "Copper Ethernet standards cap segment length at 100 meters regardless of UTP category; 500m is typical for multimode fiber."],
      ["5000 meters", "5000 meters (5 km) is the maximum distance for 1000BASE-LX fiber, not copper twisted-pair links."]
    ],
    "All common IEEE copper twisted-pair Ethernet standards—including 10BASE-T, 100BASE-T, 1000BASE-T, and 10GBASE-T—specify a maximum cable segment length of 100 meters due to signal attenuation over copper wires.",
    "Copper UTP Ethernet max distance is always 100 meters across 10M, 100M, 1G, and 10G standards.",
    []
  ),
  c02.s(
    "Ethernet", "Easy",
    "How many bits and bytes make up an Ethernet MAC address, and how is it structured?",
    "48 bits (6 bytes), divided into a 24-bit OUI and a 24-bit vendor-assigned value",
    [
      ["32 bits (4 bytes), divided into a variable-length network prefix and a host identifier", "A 32-bit (4-byte) address divided into network and host portions describes an IPv4 address, not a Layer 2 MAC address."],
      ["64 bits (8 bytes), divided into a 16-bit bridge priority and a 48-bit system identifier", "An 8-byte value combining a 2-byte priority and a 6-byte MAC address describes a Spanning Tree Bridge ID (BID), not a MAC address."],
      ["128 bits (16 bytes), divided into a 64-bit routing prefix and a 64-bit interface ID", "A 128-bit (16-byte) address describes an IPv6 address rather than an Ethernet MAC address."]
    ],
    "An Ethernet MAC address is a 48-bit (6-byte) binary number represented as 12 hexadecimal digits. The first 24 bits (3 bytes) are the Organizationally Unique Identifier (OUI) assigned to the manufacturer by the IEEE, and the last 24 bits (3 bytes) are uniquely assigned by that manufacturer to the NIC.",
    "MAC address = 48 bits = 6 bytes = 12 hex digits = 24-bit OUI + 24-bit vendor serial.",
    []
  ),
  c02.s(
    "Ethernet", "Easy",
    "Which hexadecimal value in the 2-byte IEEE 802.3 Ethernet Type (EtherType) field identifies that the encapsulated Data payload is an IPv4 packet?",
    "0x0800",
    [
      ["0x86DD", "0x86DD is the hexadecimal EtherType value for IPv6, whereas IPv4 uses 0x0800."],
      ["0x8100", "0x8100 indicates an 802.1Q VLAN tag header rather than a standard IPv4 payload."],
      ["0xFFFF", "FFFF.FFFF.FFFF is the 6-byte destination MAC broadcast address, not a 2-byte EtherType value."]
    ],
    "The 2-byte Ethernet Type (EtherType) field tells the receiving device which Layer 3 protocol is encapsulated inside the frame's data field. The IEEE assigns 0x0800 (decimal 2048) to IPv4 and 0x86DD to IPv6.",
    "EtherType 0x0800 = IPv4; EtherType 0x86DD = IPv6.",
    []
  ),
  c02.s(
    "Cabling", "Medium",
    "Whydo UTP Ethernet cables twist the two insulated copper wires within each pair around each other?",
    "Twisting the copper wire pairs cancels out electromagnetic interference (EMI) and reduces crosstalk on the cable.",
    [
      ["Twisting increases the physical cross-sectional area of the copper conductor so signals travel beyond 500 meters.", "Twisting does not change the wire gauge or extend copper UTP beyond its 100-meter maximum distance."],
      ["Twisting separates full-duplex transmit signals from half-duplex collision signals on the same physical conductor.", "10BASE-T and 100BASE-T use separate wire pairs for transmit and receive rather than relying on twisting to separate directions."],
      ["Twisting converts analog electrical voltage pulses into optical light reflections to prevent signal attenuation.", "UTP cables carry electrical signals over copper conductors; optical light reflections occur only in fiber-optic glass cores."]
    ],
    "When electrical current passes through a copper wire, it generates electromagnetic interference (EMI) that can induce noise on adjacent wire pairs (called crosstalk). Twisting the two wires of a circuit pair causes their magnetic fields to have opposite effects on nearby wires, effectively canceling out the EMI.",
    "Twisting copper pairs cancels EMI and prevents crosstalk between adjacent wire pairs.",
    []
  ),
  c02.s(
    "Cabling", "Medium",
    "A router's 100BASE-T FastEthernet port is connected directly to a PC's 100BASE-T network interface card, and neither device supports Auto-MDIX. Which UTP cable type is required and why?",
    "A crossover cable, because both the router port and the PC NIC transmit on pins 1 and 2 and receive on pins 3 and 6",
    [
      ["A straight-through cable, because routers act like LAN switches and transmit on pins 3 and 6 while PCs transmit on pins 1 and 2", "Switches and hubs transmit on pins 3 and 6, but routers, PCs, and wireless access points all transmit on pins 1 and 2."],
      ["A crossover cable, because both the router port and the PC NIC transmit on pins 3 and 6 and receive on pins 1 and 2", "Routers and PCs transmit on pins 1 and 2 (and receive on 3 and 6); only switches and hubs transmit on pins 3 and 6."],
      ["A rollover console cable, because connecting two Layer 3 endpoints directly requires reversing all eight RJ-45 pin positions", "Rollover cables reverse pins 1-8 to 8-1 for serial console management and cannot be used for Ethernet data links."]
    ],
    "In 10BASE-T and 100BASE-T Ethernet, endpoint devices—including PCs, servers, routers, and wireless APs—transmit on RJ-45 pins 1 and 2 and receive on pins 3 and 6. Switches and hubs use the opposite pinout (transmit on 3 and 6, receive on 1 and 2). Connecting two like-pinout devices (router to PC) without Auto-MDIX requires a crossover cable to swap pins 1,2 with pins 3,6.",
    "Transmit on 1,2: PCs, Routers, APs. Transmit on 3,6: Switches, Hubs. Like-to-like needs a crossover cable (unless Auto-MDIX is active).",
    []
  ),
  c02.s(
    "Cabling", "Medium",
    "How do multimode fiber (MMF) and single-mode fiber (SMF) compare regarding light source, core diameter, and maximum transmission distance?",
    "MMF uses an LED transmitter in a wider core for shorter distances, whereas SMF uses a laser in a much narrower core for distances up to tens of km.",
    [
      ["MMF uses a laser transmitter in a narrow core for distances up to 40 km, whereas SMF uses an LED transmitter in a wide core for distances up to 500 meters.", "This reverses the two fiber types: SMF uses a laser and narrow core for up to 40 km, while MMF uses an LED and wider core for ~300-500 meters."],
      ["Both MMF and SMF transmit bidirectional laser light over a single glass strand, eliminating the need for separate transmit and receive fibers.", "Standard Ethernet fiber links require two fiber cables (one connect Tx to Rx in each direction) for both MMF and SMF."],
      ["MMF cables are more expensive per port than SMF transceivers because LEDs require four pairs of glass strands per Gigabit link.", "SMF laser transceivers are more expensive than MMF LED transceivers, and both use two fiber strands (Tx and Rx), not four pairs."]
    ],
    "Multimode fiber (MMF) uses less expensive LED-based SFP/SFP+ transceivers that shine multiple angles (modes) of light into a wider core, supporting distances up to roughly 300-500 meters. Single-mode fiber (SMF) uses a fiberglass core around one-fifth the diameter of MMF and requires a more expensive laser transceiver, enabling distances up to tens of kilometers (10-40 km).",
    "MMF = LED, wider core, multiple light angles, shorter (~300-500m), cheaper transceivers. SMF = Laser, 1/5th core size, single mode, longer (10-40km), pricier transceivers.",
    []
  ),
  c02.s(
    "Ethernet", "Medium",
    " ignoring optional 802.1Q VLAN tags, what are the minimum and maximum sizes of the IEEE 802.3 Data and Pad field, and what is the resulting minimum total frame size from Destination MAC through FCS?",
    "Data field: 46 to 1500 bytes; minimum total frame size: 64 bytes including headers and FCS",
    [
      ["Data field: 64 to 1518 bytes; minimum total frame size: 72 bytes including Preamble and SFD", "64 to 1518 bytes is the total frame size (18 bytes of L2 header/trailer + 46 to 1500 bytes of data), not the Data field size alone."],
      ["Data field: 20 to 1480 bytes; minimum total frame size: 46 bytes excluding the 4-byte FCS", "20 bytes is the minimum IPv4 header size, not the minimum Ethernet Data field size (which pads anything under 46 bytes up to 46 bytes)."],
      ["Data field: 48 to 1522 bytes; minimum total frame size: 66 bytes for untagged Ethernet frames", "1522 bytes is the maximum total frame size when a 4-byte 802.1Q VLAN tag is added; untagged Data is 46-1500 bytes (64-1518 total)."]
    ],
    "The IEEE 802.3 header and trailer total 18 bytes: Destination MAC (6 bytes) + Source MAC (6 bytes) + Type (2 bytes) + FCS trailer (4 bytes) = 18 bytes (excluding the 7-byte Preamble and 1-byte SFD used for synchronization). Because the Data and Pad field must be between 46 and 1500 bytes, the total frame size ranges from 64 bytes (46 + 18) to 1518 bytes (1500 + 18).",
    "18 bytes of L2 overhead (6 Dest + 6 Src + 2 Type + 4 FCS) + 46..1500 bytes Data = 64..1518 bytes total frame size.",
    []
  ),
  c02.s(
    "Ethernet", "Medium",
    "What action does a receiving Ethernet switch or host take when a frame fails the Frame Check Sequence (FCS) mathematical check in the Ethernet trailer?",
    "It silently discards the corrupted frame immediately and does not attempt any Layer 2 retransmission or recovery.",
    [
      ["It sends a Layer 2 Negative Acknowledgment (NAK) frame back to the source MAC address to request retransmission.", "Ethernet is an unreliable, connectionless Layer 2 protocol and never sends Layer 2 ACKs or NAKs."],
      ["It uses the 4-byte FCS formula to flip the corrupted bits back to their original values before forwarding the frame.", "The Ethernet FCS is an error-detection mechanism only, not a forward error-correction mechanism."],
      ["It floods the damaged frame out all ports with a jam signal appended so the destination TCP stack knows a collision occurred.", "Switches never flood corrupted frames; they drop frames that fail the FCS check and increment their CRC/input error counters."]
    ],
    "The 4-byte Frame Check Sequence (FCS) in the Ethernet trailer is designed strictly for error detection, not error recovery. The sender applies a mathematical formula to the frame and stores the result in the FCS; if the receiver's calculation does not match, the frame was corrupted in transit and is silently discarded.",
    "Ethernet FCS = error detection only (discard bad frames); TCP handles error recovery at Layer 4.",
    []
  ),
  c02.d(
    "Ethernet", "Medium",
    "Order the fields of a standard IEEE 802.3 Ethernet frame from the first byte transmitted on the wire to the final byte of the trailer.",
    [
      "Preamble (7 bytes) for synchronization",
      "Start Frame Delimiter / SFD (1 byte)",
      "Destination MAC Address (6 bytes)",
      "Source MAC Address (6 bytes)",
      "Type / EtherType (2 bytes)",
      "Data and Pad (46 to 1500 bytes)",
      "Frame Check Sequence / FCS (4 bytes)"
    ],
    "An IEEE 802.3 frame begins with a 7-byte Preamble and 1-byte SFD, followed by the 14-byte header (6-byte Destination MAC, 6-byte Source MAC, 2-byte Type), the 46-to-1500-byte Data and Pad field, and finally the 4-byte FCS trailer.",
    "Order: Preamble (7) -> SFD (1) -> Dest MAC (6) -> Src MAC (6) -> Type (2) -> Data (46-1500) -> FCS (4).",
    []
  ),
  c02.t(
    "Cabling", "Medium",
    "Match each 10-Gigabit Ethernet IEEE 802.3 standard to its supported cabling type and maximum segment distance.",
    [
      ["10GBASE-T", "Copper UTP cabling up to 100 meters"],
      ["10GBASE-LX4", "Multimode fiber cabling up to 300 meters"],
      ["10GBASE-S", "Multimode fiber cabling up to 400 meters"],
      ["10GBASE-LR", "Single-mode fiber cabling up to 10 kilometers"],
      ["10GBASE-E", "Single-mode fiber cabling up to 30 kilometers"]
    ],
    "For 10-Gigabit Ethernet, 10GBASE-T runs up to 100m over copper UTP; 10GBASE-LX4 (300m) and 10GBASE-S (400m) run over multimode fiber; and 10GBASE-LR (10 km) and 10GBASE-E (30 km) run over single-mode fiber.",
    "Short/multimode 10G = S (400m) and LX4 (300m); Long/extended single-mode 10G = LR (10km) and E (30km); Copper 10G = T (100m).",
    []
  ),
  c02.m(
    "Switching", "Hard",
    "Which statements accurately describe CSMA/CD operation and duplex requirements on an Ethernet LAN when a Layer 1 hub is present?",
    [
      "All devices connected to the hub must operate in half-duplex mode and wait for the medium to be silent before transmitting.",
      "When two nodes transmit simultaneously and collide, both nodes send a jam signal and wait a randomized timer before retrying."
    ],
    [
      ["A modern Layer 2 switch port connected to a 100BASE-T hub can operate in full-duplex mode because the switch buffers frames in RAM.", "A switch port connected to a hub must use half-duplex mode because the hub itself is a shared half-duplex collision domain."],
      ["CSMA/CD assigns a deterministic priority token to the lowest MAC address on the hub so collisions cannot repeat.", "CSMA/CD uses randomized backoff timers after a collision rather than a deterministic token-passing or MAC-priority scheme."],
      ["Nodes operating in full-duplex mode on point-to-point switch links continue running CSMA/CD to prevent late collisions.", "Full-duplex point-to-point links have dedicated transmit and receive paths where collisions cannot occur, so CSMA/CD is completely disabled."]
    ],
    "Because a Layer 1 hub repeats incoming electrical signals out all other ports, two frames sent at the same time collide. Any device or switch port attached to a hub must use half-duplex logic and Carrier Sense Multiple Access with Collision Detection (CSMA/CD): listen until silent, transmit, and if a collision occurs, send a jam signal and wait a random time before trying again.",
    "Hubs force half-duplex + CSMA/CD; switch-to-switch or switch-to-host links allow full-duplex (CSMA/CD disabled).",
    []
  ),
  c02.s(
    "Cabling", "Hard",
    "Why does a 1000BASE-T crossover cable require crossing four wire pairs whereas a 100BASE-T crossover cable requires crossing only two wire pairs?",
    "1000BASE-T transmits and receives signals simultaneously on all four wire pairs, requiring all four copper pairs to be crossed.",
    [
      ["1000BASE-T reserves pins 4,5 and 7,8 exclusively for out-of-band Auto-MDIX clock synchronization signals between the two NICs.", "1000BASE-T uses all four pairs (pins 1,2, 3,6, 4,5, and 7,8) to carry data simultaneously in both directions, not for out-of-band clocking."],
      ["100BASE-T uses pins 4,5 and 7,8 for Power over Ethernet only, whereas 1000BASE-T uses those pairs as unidirectional backup links.", "In 1000BASE-T, all four pairs are active simultaneously for bidirectional data transmission, not kept as idle backup pairs."],
      ["1000BASE-T requires double the voltage of 100BASE-T, so two parallel wire pairs are bonded together for each transmit direction.", "1000BASE-T does not bond two pairs into a single two-pair pinout; it uses complex encoding to transmit and receive on all four pairs at once."]
    ],
    "Whereas 10BASE-T and 100BASE-T use only two wire pairs (pins 1,2 and 3,6), 1000BASE-T uses all four wire pairs simultaneously for both transmission and reception. Consequently, a Gigabit Ethernet crossover cable crosses both the standard pair set (pins 1,2 with 3,6) and the secondary pair set (pins 4,5 with 7,8).",
    "10/100BASE-T uses 2 pairs (pins 1,2 & 3,6); 1000BASE-T uses all 4 pairs (pins 1,2, 3,6, 4,5 & 7,8).",
    []
  ),
  c02.s(
    "Ethernet", "Hard",
    "A host sends a frame to destination MAC address 0100.5E0A.0101 on an Ethernet LAN. How is this destination MAC address classified, and what purpose does it serve?",
    "It is an Ethernet multicast MAC address that delivers frames to the subset of hosts subscribed to that multicast group.",
    [
      ["It is an Ethernet broadcast MAC address that forces every NIC on the subnet to pass the encapsulated packet up to Layer 3.", "The Ethernet broadcast MAC address is FFFF.FFFF.FFFF (all binary 1s), not 0100.5Exx.xxxx."],
      ["It is a burned-in unicast MAC address assigned by the IEEE to a single Cisco router interface as its default gateway MAC.", "Addresses beginning with 0100.5E have the multicast bit set in the first byte and represent IPv4 multicast MACs, never burned-in unicast MACs."],
      ["It is a loopback test MAC address used by switches to verify full-duplex fiber connectivity before enabling a port.", "0100.5Exx.xxxx is the standard IEEE prefix for Ethernet multicast frames carrying IPv4 multicast packets, not a physical loopback test address."]
    ],
    "Ethernet defines three categories of MAC addresses: unicast (a single NIC), broadcast (FFFF.FFFF.FFFF, all devices on the LAN), and multicast (a subset of devices volunteering to receive traffic for a specific application). Frames copied for IPv4 multicast use destination MAC addresses starting with the prefix 0100.5E.",
    "Unicast = 1 device; Broadcast = FFFF.FFFF.FFFF (all LAN devices); Multicast = subset of devices (e.g., 0100.5Exx.xxxx).",
    []
  ),
  c02.s(
    "Cabling", "Hard",
    "When installing a fiber-optic Ethernet link between two switches using SFP+ transceivers, how must the two strands of the duplex fiber cable be connected?",
    "The Transmit (Tx) port on each SFP+ transceiver must connect to the Receive (Rx) port on the remote switch's transceiver.",
    [
      ["The Transmit (Tx) port on Switch 1 must connect to the Transmit (Tx) port on Switch 2 so the laser wavelengths synchronize.", "Connecting Tx to Tx and Rx to Rx prevents communication because both lasers shine into each other while neither receiver gets light."],
      ["Only one fiber strand should be connected to the Tx port on both switches while the Rx port is capped as a cold spare.", "Standard fiber Ethernet standards (such as 1000BASE-LX and 10GBASE-S/LR) require two active strands—one transmitting in each direction."],
      ["Both fiber strands connect to the Tx ports when Auto-MDIX is enabled on the switch to optically reverse the light path.", "Auto-MDIX works only on copper UTP electrical pinouts; it cannot swap optical laser transmitters and receivers on fiber links."]
    ],
    "Fiber-optic Ethernet cables use two separate glass fiber strands to create a bidirectional link: one strand carries light in one direction and the second strand carries light in the opposite direction. Therefore, the Transmit (Tx) connector on one transceiver must always plug into the Receive (Rx) connector on the distant transceiver.",
    "On dual-strand fiber links, always cross Tx to Rx between the two transceivers (Auto-MDIX only works on copper).",
    []
  )
];

// ============================================================================
// v1c03 - Fundamentals of WANs and IP Routing (15 questions: 4 Easy, 7 Medium, 4 Hard)
// ============================================================================
const c03 = mk("IP Connectivity", 25, "v1c03");
const q03 = [
  c03.s(
    "WAN", "Easy",
    "What is the exact transmission speed of a standard T1 leased-line WAN circuit?",
    "1.544 Mbps (1544 kbps)",
    [
      ["2.048 Mbps (2048 kbps)", "2.048 Mbps is the speed of an E1 carrier circuit used outside North America, whereas a T1 runs at 1.544 Mbps."],
      ["10.00 Mbps (10,000 kbps)", "10 Mbps is the speed of original 10BASE-T Ethernet, not a telco T1 leased line."],
      ["44.736 Mbps (44,736 kbps)", "44.736 Mbps is the speed of a T3 (DS3) circuit rather than a single T1 line."]
    ],
    "A T1 leased line is a classic telco point-to-point serial circuit that provides dedicated full-duplex bandwidth at 1.544 Mbps (1544 kbps) between two sites.",
    "A T1 leased line runs at 1.544 Mbps.",
    []
  ),
  c03.s(
    "WAN", "Easy",
    "Which field did Cisco add to the standard ISO High-Level Data Link Control (HDLC) frame header to allow a serial leased line to carry multiple Network layer protocols?",
    "A 2-byte Type field to identify the encapsulated Network layer protocol",
    [
      ["A 4-byte Frame Check Sequence (FCS) field at the start of the header", "Standard HDLC already includes an FCS trailer for error detection; Cisco added a 2-byte Type field inside the header."],
      ["A 6-byte Source MAC Address field to identify the sending router interface", "HDLC is a point-to-point serial protocol and uses a 1-byte Address field rather than 6-byte Ethernet MAC addresses."],
      ["An 8-byte Preamble and Start Frame Delimiter field for clock recovery", "A 7-byte Preamble and 1-byte SFD belong to IEEE 802.3 Ethernet frames, whereas HDLC frames begin with a 1-byte Flag field."]
    ],
    "Original ISO HDLC included Flag (1 byte), Address (1 byte), Control (1 byte), Data, and FCS (2 bytes), assuming only a single Layer 3 protocol would ever traverse the link. Cisco created its proprietary HDLC by inserting a 2-byte Type field between Control and Data, serving the same protocol-identification purpose as the Ethernet Type field.",
    "Cisco HDLC = ISO HDLC + a proprietary 2-byte Type field.",
    []
  ),
  c03.s(
    "IP routing", "Easy",
    "How long is a standard IPv4 packet header (without optional headers), and how long are the source and destination IPv4 addresses inside it?",
    "20-byte header containing 32-bit (4-byte) source and destination IPv4 addresses",
    [
      ["18-byte header containing 48-bit (6-byte) source and destination hardware addresses", "18 bytes of overhead with 48-bit (6-byte) addresses describes an Ethernet Layer 2 frame, not a Layer 3 IPv4 header."],
      ["40-byte header containing 128-bit (16-byte) source and destination logical addresses", "A 40-byte fixed header with 128-bit (16-byte) addresses describes an IPv6 packet header, not an IPv4 header."],
      ["14-byte header containing 16-bit (2-byte) source and destination transport port numbers", "16-bit port numbers belong to the Layer 4 TCP/UDP header, whereas the IPv4 header is 20 bytes with 32-bit addresses."]
    ],
    "A standard IPv4 header is 20 bytes long and contains a 32-bit (4-byte) source IPv4 address and a 32-bit (4-byte) destination IPv4 address written in dotted-decimal notation (four octets from 0 to 255).",
    "IPv4 header = 20 bytes; IPv4 address = 32 bits (4 bytes) in dotted-decimal.",
    []
  ),
  c03.s(
    "IP routing", "Easy",
    "Which protocol uses a Layer 2 broadcast request on the local LAN to discover the hardware MAC address associated with a known IPv4 address?",
    "Address Resolution Protocol (ARP)",
    [
      ["Domain Name System (DNS) protocol", "DNS translates human-readable hostnames into IP addresses using unicast queries to a DNS server, not Layer 2 broadcast MAC lookups."],
      ["Internet Control Message Protocol (ICMP)", "ICMP Echo Request (ping) tests Layer 3 end-to-end connectivity after MAC resolution has already occurred."],
      ["Dynamic Host Configuration Protocol (DHCP)", "DHCP assigns an IP address, subnet mask, and default gateway to a booting host rather than resolving a neighbor's MAC address."]
    ],
    "Address Resolution Protocol (ARP) dynamically learns the Data Link MAC address of a device on the same LAN when its IPv4 address is already known. The sender broadcasts an ARP Request ('who has this IP?') and the target host replies with a unicast ARP Reply containing its MAC address.",
    "ARP Request = Layer 2 broadcast; ARP Reply = Layer 2 unicast.",
    ["arp -a"]
  ),
  c03.s(
    "IP routing", "Medium",
    "Host A (10.1.1.10/24) needs to send an IPv4 packet to a web server at 10.1.2.50/24, and Host A's default gateway is Router R1 at 10.1.1.1. Which destination IPv4 address and destination MAC address does Host A place in the frame?",
    "Destination IP: 10.1.2.50; Destination MAC: R1's LAN interface MAC address",
    [
      ["Destination IP: 10.1.1.1; Destination MAC: R1's LAN interface MAC address", "Host A never sets the destination IP address to its default gateway; the destination IP stays set to the final target (10.1.2.50)."],
      ["Destination IP: 10.1.2.50; Destination MAC: the web server's NIC MAC address", "Because the web server is on a remote subnet, Host A cannot send a Layer 2 frame directly to the server's MAC address; it must address the frame to R1's MAC."],
      ["Destination IP: 10.1.1.1; Destination MAC: FFFF.FFFF.FFFF broadcast address", "Data packets are encapsulated in unicast frames to the default gateway's MAC address, not broadcast frames to the gateway's IP."]
    ],
    "When a host sends a packet to a destination IP in a different subnet, it keeps the destination IP address set to the ultimate destination host (10.1.2.50), but encapsulates that packet in a Data Link frame addressed to the MAC address of its local default gateway router (10.1.1.1).",
    "Across routers: Source/Dest IP addresses stay end-to-end; Source/Dest MAC addresses change hop-by-hop.",
    []
  ),
  c03.s(
    "WAN", "Medium",
    "How does an Ethernet over MPLS (EoMPLS) or E-Line WAN service appear to the two customer routers (CPE) connected at each end of the service?",
    "It acts like a direct point-to-point Layer 2 Ethernet link so the two routers exchange standard IEEE 802.3 Ethernet frames.",
    [
      ["It requires the customer routers to encapsulate packets in Cisco HDLC frames before sending them over the fiber access link.", "Ethernet WAN links use standard IEEE 802.3 Ethernet framing (such as 1000BASE-LX), not serial HDLC framing."],
      ["It forces the two customer routers into different IP subnets separated by the service provider's Layer 3 default gateway.", "An E-Line / EoMPLS WAN emulates a direct Layer 2 Ethernet connection between the two CPE routers, placing their WAN interfaces in the same IP subnet."],
      ["It limits the WAN access link speed to 1.544 Mbps and requires an external CSU/DSU crossover cable at the telco demarcation point.", "Ethernet WANs use fiber or copper Ethernet standards running at hundreds or thousands of Mbps, not 1.544 Mbps T1 serial interfaces."]
    ],
    "The Metro Ethernet Forum (MEF) defines Ethernet Line (E-Line) services—often called Ethernet emulation or Ethernet over MPLS (EoMPLS)—that connect two customer premises equipment (CPE) routers through a service provider's PoP using fiber Ethernet access links. To the two routers, the cloud acts like a direct point-to-point Layer 2 Ethernet cable.",
    "E-Line / EoMPLS = point-to-point Layer 2 Ethernet WAN service connecting two CPE routers in the same subnet.",
    []
  ),
  c03.s(
    "IP routing", "Medium",
    "What rules determine how IPv4 subnets are assigned relative to Layer 2 switches and Layer 3 routers?",
    "Hosts connected directly through Layer 2 switches share the same IPv4 subnet, whereas Layer 3 routers separate different subnets.",
    [
      ["Every Layer 2 switch port creates a separate IP subnet, whereas routers bridge multiple hosts within a single shared subnet.", "This reverses the roles: Layer 2 switches connect devices within the same subnet (per VLAN), while routers separate different IP subnets."],
      ["Point-to-point WAN links between two routers do not require an IP subnet because routers communicate using only Layer 2 HDLC addresses.", "Two routers connected across a point-to-point WAN or Ethernet WAN still share an IP subnet on that link for next-hop routing."],
      ["All hosts inside a company must share a single IPv4 subnet prefix so routers can forward broadcast ARP requests between buildings.", "Routers do not forward Layer 2 broadcasts like ARP requests; each LAN connected to a different router interface uses its own distinct IP subnet."]
    ],
    "In IPv4 network design, devices that can reach each other directly through Layer 2 switches (without crossing a router) must be assigned IP addresses in the same subnet. Devices separated by one or more Layer 3 routers must be placed in different IP subnets.",
    "No router between devices = same IP subnet; at least one router between devices = different IP subnets.",
    []
  ),
  c03.s(
    "IP routing", "Medium",
    "How does a router initially populate its IP routing table before learning routes from neighboring routers via a dynamic routing protocol?",
    "It automatically adds a directly connected route for each IP subnet configured on an active, working interface.",
    [
      ["It broadcasts an ARP request out all interfaces and builds a /32 host route for every device that answers.", "ARP builds the Layer 2 ARP cache for local next-hop MAC resolution, not the Layer 3 subnet routes in the IP routing table."],
      ["It queries the configured DNS server to download the enterprise subnet list before enabling its routing protocol process.", "DNS resolves hostnames to IP addresses for applications and plays no role in populating a router's IP routing table."],
      ["It forwards all packets out its lowest-numbered interface until a neighbor router sends a routing update message.", "A router drops packets destined for unknown subnets; it only knows about its own directly connected working interfaces initially."]
    ],
    "In Step 1 of dynamic routing protocol operation, each router automatically adds a route to its IP routing table for every subnet directly connected to one of its active (up/up) interfaces, without needing any messages from a routing protocol. In Steps 2 and 3, routers exchange routing updates with neighbors and add the best routes learned to their routing tables.",
    "Connected routes are added automatically for working local interfaces; dynamic routing protocols then advertise and learn remote subnets.",
    []
  ),
  c03.s(
    "IP routing", "Medium",
    "When a user runs `ping 172.16.3.9` and receives replies, which protocol and messages are actually sent and what layers of the network are verified?",
    "ICMP Echo Request and ICMP Echo Reply messages are exchanged, verifying Layers 1, 2, and 3 between the two hosts.",
    [
      ["TCP SYN and TCP ACK segments are exchanged on port 80, verifying Layers 1 through 7 including the HTTP web server daemon.", "The ping utility uses Layer 3 ICMP Echo Request/Reply messages, not Layer 4 TCP port 80 or Layer 7 HTTP."],
      ["ARP Request and ARP Reply broadcasts are forwarded end-to-end across all routers to verify Layer 2 MAC table entries.", "ARP operates only on the local LAN link and never crosses routers end-to-end; ping uses Layer 3 ICMP packets."],
      ["UDP datagrams are sent to the DNS server to verify that hostname resolution and Transport layer port numbers are open.", "Ping to an IP address sends ICMP messages directly to that IP without involving UDP or DNS."]
    ],
    "The `ping` command sends an Internet Control Message Protocol (ICMP) Echo Request inside an IP packet to the destination IP address, and the target host responds with an ICMP Echo Reply. Because ICMP is a Layer 3 protocol encapsulated in IP and Data Link frames, a successful ping proves that Layers 1, 2, and 3 are functioning in both directions.",
    "Ping = ICMP Echo Request + Echo Reply; verifies Layers 1, 2, and 3.",
    ["ping"]
  ),
  c03.d(
    "IP routing", "Medium",
    "Order the four internal forwarding steps a router performs when a Data Link frame arrives on an interface carrying an IPv4 packet destined for another subnet.",
    [
      "Use the Data Link Frame Check Sequence (FCS) field to verify that the incoming frame had no transmission errors",
      "Strip and discard the old Data Link header and trailer, leaving the encapsulated IP packet",
      "Compare the packet's destination IP address to the routing table and select the best matching route's outgoing interface and next-hop IP",
      "Encapsulate the IP packet inside a new Data Link header and trailer appropriate for the outgoing interface and forward the frame"
    ],
    "When a frame enters a router port, the router first checks the Layer 2 FCS for errors (dropping the frame if corrupt), strips off the incoming Layer 2 header and trailer, matches the destination IP address in its routing table to find the egress interface and next-hop router, and encapsulates the IP packet in a new Layer 2 header and trailer.",
    "Router 4 steps: (1) Check L2 FCS -> (2) Strip old L2 header/trailer -> (3) Route lookup on Dest IP -> (4) Add new L2 header/trailer and forward.",
    []
  ),
  c03.t(
    "WAN", "Medium",
    "Match each leased-line WAN term to its matching definition or role.",
    [
      ["Customer Premises Equipment (CPE)", "Router and terminating hardware located at the customer site"],
      ["Central Office (CO)", "Telco building where local customer cables terminate into a WAN switch"],
      ["Serial Link", "WAN line over which bits are transmitted sequentially one after another"],
      ["Point-to-Point Line", "Circuit connecting exactly two endpoints with no intermediate host addressing needed"]
    ],
    "Telco leased lines go by several interchangeable names highlighting different features: CPE is the equipment at the customer site, CO is the telco switching facility, serial link indicates bits flow serially over the line, and point-to-point indicates the circuit connects exactly two devices.",
    "Leased line = circuit = serial link = point-to-point link = private line = T1 (1.544 Mbps).",
    []
  ),
  c03.m(
    "IP routing", "Hard",
    "A user at PC1 (192.168.1.10/24, gateway 192.168.1.1) opens a browser and visits `http://server1.example.com` (resolved to 192.168.2.50/24) for the very first time after booting. Which actions occur before the first HTTP GET packet leaves PC1?",
    [
      "PC1 sends a DNS query to its configured DNS server to learn that `server1.example.com` has IPv4 address 192.168.2.50.",
      "PC1 broadcasts an ARP Request on the 192.168.1.0/24 LAN to learn the MAC address of its default gateway (192.168.1.1)."
    ],
    [
      ["PC1 broadcasts an ARP Request asking for the MAC address of 192.168.2.50 so it can address the Ethernet frame directly to the web server.", "Because 192.168.2.50 is in a different subnet from PC1 (192.168.1.10/24), PC1 ARPs for its local default gateway (192.168.1.1), never for the remote server's IP."],
      ["PC1 sends a routing protocol update to 192.168.1.1 to download the full enterprise routing table before transmitting the packet.", "End hosts do not run dynamic routing protocols with routers; they simply compare the destination IP against their own subnet and use their default gateway."],
      ["PC1 encapsulates the DNS query inside a Cisco HDLC frame so the local LAN switch can forward it to the default gateway.", "PC1 is connected to an Ethernet LAN switch, so it encapsulates all frames in IEEE 802.3 Ethernet headers, not serial HDLC headers."]
    ],
    "When accessing a remote server by name with an empty ARP cache, a host first queries its DNS server to translate the hostname into an IP address (192.168.2.50). Recognizing that 192.168.2.50 is in a different subnet, the host must send the frame to its default gateway (192.168.1.1), so it broadcasts an ARP Request on the local LAN for 192.168.1.1's MAC address.",
    "Remote host communication requires DNS (name -> destination IP) + ARP for the local default gateway's MAC address.",
    ["arp -a"]
  ),
  c03.s(
    "IP routing", "Hard",
    "PC1 (10.10.1.5/24) sends an IPv4 packet to PC2 (10.10.3.5/24) across two routers: R1 and R2, which are connected by a Cisco HDLC leased line. Why does the frame crossing the link between R1 and R2 contain no Ethernet MAC addresses?",
    "R1 strips the incoming Ethernet header and trailer and encapsulates the IPv4 packet in a point-to-point Cisco HDLC frame.",
    [
      ["R1 leaves the original Ethernet MAC addresses inside the IPv4 header options field while the packet crosses the serial link.", "Ethernet MAC addresses exist only in the Layer 2 Ethernet header, which R1 completely discards before forwarding the packet onto the serial link."],
      ["R1 replaces the 6-byte MAC addresses with 32-bit IPv4 addresses inside the Ethernet frame header when transmitting over a T1 line.", "A T1 leased line running HDLC does not use an Ethernet frame header at all; it uses an HDLC header and trailer."],
      ["R1 translates the source and destination MAC addresses into TCP port numbers for point-to-point serial transmission.", "Layer 2 MAC addresses have no relationship to Layer 4 TCP port numbers and are never translated into transport headers."]
    ],
    "Each router hop uses the Data Link framing appropriate for its outgoing physical interface. When R1 receives an Ethernet frame on its LAN interface, it discards the Ethernet header (including the source and destination MAC addresses) and trailer, and encapsulates the IPv4 packet inside a Cisco HDLC header and trailer for transmission over the point-to-point serial link to R2.",
    "Layer 2 framing matches the physical link type: Ethernet on LANs (uses 6-byte MACs), HDLC on serial leased lines (no MACs).",
    []
  ),
  c03.s(
    "IP routing", "Hard",
    "Router R1 has three routes in its IPv4 routing table: `172.16.1.0/24` out Gi0/0 ( directly connected), `172.16.2.0/24` via 172.16.4.2 out Se0/0/0, and `172.16.3.0/24` via 172.16.5.2 out Gi0/1. When R1 forwards a packet destined for `172.16.3.99`, which IP address does R1 look up in its ARP table to build the outgoing Ethernet frame?",
    "172.16.5.2 — the next-hop router's IPv4 address on interface Gi0/1",
    [
      ["172.16.3.99 — the final destination host's IPv4 address in the header", "Because 172.16.3.99 is on a remote LAN beyond the next-hop router, R1 cannot ARP for 172.16.3.99 on Gi0/1; it must ARP for the next-hop router IP 172.16.5.2."],
      ["172.16.4.2 — the next-hop router's IPv4 address on the serial WAN link", "172.16.4.2 is the next hop for subnet 172.16.2.0/24 on a serial link, not for 172.16.3.99."],
      ["172.16.3.1 — the default gateway IPv4 address on the target LAN", "R1 only knows its immediate next-hop router IP (172.16.5.2) on the shared Gi0/1 subnet, not the distant LAN gateway address."]
    ],
    "When a router matches a non-connected route whose outgoing interface is a multiaccess Ethernet link (such as Gi0/1), the routing table entry provides both the outgoing interface and the next-hop router's IP address (172.16.5.2). R1 looks up the next-hop IP address 172.16.5.2 in its Gi0/1 ARP table to find the destination MAC address for the new Ethernet frame.",
    "When a router forwards out an Ethernet interface to a next-hop router, it uses ARP to find the next-hop IP's MAC address (while keeping the packet's destination IP unchanged).",
    []
  ),
  c03.s(
    "IP routing", "Hard",
    "Why does an ARP Request travel across all switches in a LAN whereas the resulting ARP Reply travels only along the path back to the requesting host?",
    "The ARP Request is sent to the broadcast MAC `FFFF.FFFF.FFFF`, whereas the ARP Reply is sent to the requester's unicast MAC.",
    [
      ["The ARP Request is encapsulated in a flooded IPv4 packet, whereas the ARP Reply is encapsulated in a TCP unicast segment.", "ARP messages are encapsulated directly inside Layer 2 Ethernet frames (EtherType 0x0806) without using IPv4 or TCP headers."],
      ["LAN switches intercept ARP Replies and convert them from Layer 2 broadcasts into unicast frames using their IP routing tables.", "Layer 2 switches do not modify ARP frames or consult IP routing tables; the target host itself sends the ARP Reply as a unicast frame."],
      ["The ARP Request uses multicast MAC address `0100.5E00.0001`, whereas the ARP Reply uses a point-to-point HDLC address.", "ARP Requests use the Layer 2 broadcast MAC address `FFFF.FFFF.FFFF` rather than a multicast or HDLC address."]
    ],
    "Because the sender of an ARP Request does not yet know the target's MAC address, it sends the ARP Request inside an Ethernet broadcast frame (`FFFF.FFFF.FFFF`), which switches flood to all ports in that LAN/VLAN. The target host reads the sender's IP and MAC from the ARP Request, adds them to its own ARP cache, and sends the ARP Reply directly back to the requester's unicast MAC address.",
    "ARP Request = broadcast (`FFFF.FFFF.FFFF`, flooded by switches); ARP Reply = unicast directly to the sender's MAC.",
    ["arp -a"]
  )
];

// ============================================================================
// v1c04 - Using the Command-Line Interface (15 questions: 4 Easy, 7 Medium, 4 Hard)
// ============================================================================
const c04 = mk("Network Access", 20, "v1c04");
const q04 = [
  c04.s(
    "Switch CLI", "Easy",
    "Which command-line prompt indicates that a user is currently in Privileged EXEC (Enable) mode on a Cisco Catalyst switch named `SW1`?",
    "The switch displays the CLI prompt SW1#",
    [
      ["The switch displays the CLI prompt SW1>", "The `>` prompt indicates User EXEC mode, not Privileged EXEC (Enable) mode."],
      ["The switch displays the CLI prompt SW1(config)#", "The `(config)#` prompt indicates Global Configuration mode, entered from Privileged EXEC mode."],
      ["The switch displays the CLI prompt SW1(config-if)#", "The `(config-if)#` prompt indicates Interface Configuration mode rather than Privileged EXEC mode."]
    ],
    "Cisco IOS uses `Hostname>` to indicate User EXEC mode and `Hostname#` to indicate Privileged EXEC (Enable) mode. Moving into configuration modes appends parentheses before the `#`, such as `Hostname(config)#`.",
    "User EXEC = `>`; Privileged EXEC = `#`; Global Config = `(config)#`.",
    ["enable", "disable"]
  ),
  c04.s(
    "Switch CLI", "Easy",
    "Which UTP cable pinout and serial terminal emulator settings are used by default when connecting to a Cisco Catalyst switch's RJ-45 console port?",
    "Rollover cable (pins 1-8 reversed to 8-1) with 9600 bps, no hardware flow control, 8 data bits, no parity, and 1 stop bit",
    [
      ["Crossover cable (pins 1,2 swapped with 3,6) with 115200 bps, XON/XOFF flow control, 7 data bits, even parity, and 2 stop bits", "Ethernet crossover cables and 115200/7E2 settings do not work with a default Cisco RJ-45 serial console port."],
      ["Straight-through cable (pins 1-8 matched to 1-8) with 9600 bps, RTS/CTS hardware flow control, 8 data bits, odd parity, and 1 stop bit", "An RJ-45 serial console connection uses a rollover cable with no flow control and no parity, not a straight-through cable with odd parity."],
      ["Rollover cable (pins 1-8 reversed to 8-1) with 38400 bps, hardware flow control enabled, 8 data bits, even parity, and 2 stop bits", "Default Cisco console speed is 9600 bps with no flow control, no parity, and 1 stop bit (9600 8N1)."]
    ],
    "A classic RJ-45 serial console connection uses a rollover cable that reverses pin 1 to pin 8, pin 2 to pin 7, and so on across all eight pins. Terminal emulator software must match the default console settings: 9600 bits/second, no hardware flow control, 8 ASCII bits, no parity bits, and 1 stop bit (commonly abbreviated 9600 8N1).",
    "Default Cisco console settings: Rollover cable, 9600 bps, 8 data bits, No parity, 1 stop bit, No flow control (9600 8N1).",
    []
  ),
  c04.s(
    "Switch CLI", "Easy",
    "Which memory type in a Cisco Catalyst switch stores the active `running-config` file that changes immediately whenever configuration commands are entered?",
    "Volatile RAM (DRAM) memory",
    [
      ["Nonvolatile NVRAM memory", "NVRAM stores the `startup-config` file used at boot time, not the volatile `running-config` file."],
      ["Internal Flash storage memory", "Flash stores the Cisco IOS software image (and `vlan.dat`), whereas `running-config` resides in volatile RAM."],
      ["Read-Only Memory (ROM) chip", "ROM stores the low-level bootstrap firmware rather than active configuration files."]
    ],
    "Cisco switches use four primary memory types: RAM (also called DRAM) holds the working `running-config` and tables and loses its contents when powered off; NVRAM holds the persistent `startup-config`; Flash holds the Cisco IOS image; and ROM holds the bootstrap program.",
    "RAM = `running-config` (volatile); NVRAM = `startup-config` (nonvolatile); Flash = IOS image; ROM = bootstrap.",
    ["show running-config", "show startup-config"]
  ),
  c04.s(
    "Switch CLI", "Easy",
    "How many commands does the Cisco IOS CLI command history buffer store by default for the current session?",
    "10 commands by default",
    [
      ["5 commands by default", "5 minutes is the default `exec-timeout` value, whereas the default command history buffer size is 10 commands."],
      ["16 commands per session", "16 is the number of VTY lines (0 through 15) on a Catalyst switch, not the default history buffer size."],
      ["256 commands by default", "256 is the maximum configurable history size, whereas the default is 10 commands."]
    ],
    "By default, Cisco IOS retains the last 10 commands entered in the user's current EXEC session in the history buffer, which can be viewed with `show history` or recalled one at a time using the Up arrow (`Ctrl+P`) and Down arrow (`Ctrl+N`).",
    "Default CLI history buffer size = 10 commands.",
    ["show history"]
  ),
  c04.s(
    "Switch CLI", "Medium",
    "While in Global Configuration mode (`SW1(config)#`), an engineer types `show mac address-table` and receives an `% Invalid input detected` error. Why did this command fail?",
    "`show` commands belong to EXEC mode and cannot run directly in configuration mode without returning to EXEC or using `do`.",
    [
      ["The command syntax requires a hyphen between `mac` and `address` as `show mac-address-table` on all modern IOS versions.", "Modern Cisco IOS uses `show mac address-table`; the command failed because it was entered in Global Configuration mode instead of EXEC mode."],
      ["The `show mac address-table` command can only be executed from Interface Configuration mode `(config-if)#` for a specific port.", "`show` commands are executed in User or Privileged EXEC mode, not in Interface Configuration submode."],
      ["The switch must have an IPv4 address configured on VLAN 1 before any Layer 2 `show` commands are unlocked in the CLI.", "Layer 2 switches can display their MAC address table in EXEC mode without any IPv4 configuration."]
    ],
    "Each Cisco IOS CLI mode accepts only the commands defined for that mode. `show` commands belong to User EXEC and Privileged EXEC modes, so typing a `show` command directly at the `(config)#` prompt fails unless the user first exits back to EXEC mode (or prepends `do`).",
    "Most `show` commands run in User/Privileged EXEC mode, not directly inside `(config)#` mode.",
    ["show mac address-table", "end", "exit"]
  ),
  c04.s(
    "Switch CLI", "Medium",
    "An engineer is currently in Interface Configuration submode (`SW1(config-if)#`) and wants to return immediately to Privileged EXEC mode (`SW1#`) in a single step. Which action accomplishes this?",
    "Enter the `end` command or press `Ctrl+Z`",
    [
      ["Enter the `exit` command at the submode prompt", "From `(config-if)#`, typing `exit` moves up only one level to Global Configuration mode (`(config)#`), not to Privileged EXEC mode."],
      ["Enter the `disable` command in submode", "`disable` is a Privileged EXEC command that moves from Privileged EXEC (`#`) back to User EXEC (`>`), not a configuration exit command."],
      ["Enter the `logout` command at the submode prompt", "`logout` (or `exit` from EXEC mode) terminates the entire console or VTY login session rather than returning to `SW1#`."]
    ],
    "From any configuration submode (such as `(config-if)#`, `(config-line)#`, or `(config-vlan)#`), typing `end` or pressing the `Ctrl+Z` key sequence jumps directly back to Privileged EXEC mode (`#`). By contrast, typing `exit` moves back one configuration level to Global Configuration mode (`(config)#`).",
    "`end` or `Ctrl+Z` = jump straight to Privileged EXEC (`#`); `exit` from a submode = step back one level to `(config)#`.",
    ["end", "exit"]
  ),
  c04.s(
    "Switch CLI", "Medium",
    "How does `copy running-config startup-config` differ in behavior from `copy startup-config running-config` on a Cisco IOS device?",
    "`copy running-config startup-config` overwrites the file in NVRAM, whereas `copy startup-config running-config` merges in RAM.",
    [
      ["Both commands completely overwrite the destination file without rebooting the switch or merging existing lines.", "`copy startup-config running-config` does not overwrite `running-config`; it merges the startup-config commands into the active RAM configuration."],
      ["`copy running-config startup-config` merges changes into NVRAM, whereas `copy startup-config running-config` wipes RAM clean first.", "This is backwards: copying to `startup-config` overwrites the file in NVRAM, while copying to `running-config` performs a merge in RAM."],
      ["`copy startup-config running-config` automatically reloads the switch from Flash memory to restore factory defaults.", "Copying `startup-config` to `running-config` does not reload the switch; a clean restore to startup-config requires the `reload` command."]
    ],
    "Saving configuration with `copy running-config startup-config` erases the existing `startup-config` file in NVRAM and replaces it entirely with the current `running-config`. Conversely, copying any file into `running-config` (`copy startup-config running-config`) adds and merges commands into RAM rather than replacing `running-config` cleanly.",
    "Copy to `startup-config` = overwrite; copy to `running-config` = merge (use `reload` without saving if you want to discard unmerged RAM changes).",
    ["copy running-config startup-config", "copy startup-config running-config", "reload"]
  ),
  c04.s(
    "Switch CLI", "Medium",
    "At the `SW1#` prompt, what is the difference between typing `cl?` (with no space before the question mark) and typing `clear ?` (with a space before the question mark)?",
    "`cl?` lists all commands in the current mode starting with `cl`, whereas `clear ?` lists the parameters that follow `clear`.",
    [
      ["`cl?` automatically completes the word `clear` on the command line, whereas `clear ?` executes the command with default options.", "The `Tab` key performs command completion, whereas `?` always displays context-sensitive help without executing the command."],
      ["`cl?` searches Global Configuration mode for matching commands, whereas `clear ?` searches only User EXEC mode commands.", "Both help queries inspect only the commands available in the user's current CLI mode (`SW1#`)."],
      ["`cl?` displays the command syntax manual page for `clear`, whereas `clear ?` clears the terminal screen buffer.", "Neither command clears the screen; omitting the space lists matching command names, while including a space lists next-parameter options."]
    ],
    "Cisco IOS context-sensitive help reacts to whether a space precedes the `?`. Entering `cl?` immediately after characters with no space displays all commands available in that mode starting with `cl` (such as `clear` and `clock`). Entering `clear ?` with a space after a full command word lists the arguments or keywords that can follow `clear`.",
    "No space before `?` (`com?`) = words starting with `com`; space before `?` (`cmd ?`) = parameters that follow `cmd`.",
    []
  ),
  c04.s(
    "Switch CLI", "Medium",
    "How do the outputs of the `show` command and the `debug` command differ when troubleshooting a Cisco IOS switch?",
    "`show` outputs a one-time static status snapshot, whereas `debug` streams live event messages as the switch operates.",
    [
      ["`show` writes diagnostic logs exclusively to NVRAM, whereas `debug` displays output only on an external Syslog server.", "`show` always displays output to the current CLI session, and `debug` sends real-time messages to the console or terminal monitor."],
      ["`show` can be executed from Global Configuration mode, whereas `debug` can be executed from User EXEC mode (`>`).", "Neither statement is true: `show` runs in EXEC modes (`>` or `#`), and `debug` requires Privileged EXEC mode (`#`)."],
      ["`show` automatically resets interface error counters to zero after printing, whereas `debug` preserves the counters.", "`show` never clears counters (which requires `clear counters`); `show` simply prints current values at that instant."]
    ],
    "A `show` command outputs a one-time, static snapshot of the switch's current state and immediately returns the CLI prompt. A `debug` command acts like a live feed, generating console/log messages continuously whenever specific events occur until an administrator disables it with `no debug all` or `undebug all`.",
    "`show` = static snapshot now; `debug` = continuous live stream of events (turn off with `no debug all` or `undebug all`).",
    ["no debug all", "undebug all"]
  ),
  c04.t(
    "Switch CLI", "Medium",
    "Match each Cisco IOS CLI keyboard shortcut to its editing or history navigation action.",
    [
      ["Up Arrow or Ctrl+P", "Recall the previous (older) command from the history buffer"],
      ["Down Arrow or Ctrl+N", "Recall the next (more recent) command from the history buffer"],
      ["Left Arrow or Ctrl+B", "Move the cursor backward one character on the current line"],
      ["Right Arrow or Ctrl+F", "Move the cursor forward one character on the current line"],
      ["Tab key", "Complete a partially typed unambiguous command keyword"]
    ],
    "In the Cisco IOS CLI, `Ctrl+P` (Previous / Up arrow) steps backward through the command history, `Ctrl+N` (Next / Down arrow) steps forward through history, `Ctrl+B` (Back / Left arrow) moves the cursor left one character, `Ctrl+F` (Forward / Right arrow) moves the cursor right one character, and `Tab` auto-completes partial keywords.",
    "Ctrl+P = Previous (Up), Ctrl+N = Next (Down), Ctrl+B = Back (Left), Ctrl+F = Forward (Right).",
    []
  ),
  c04.d(
    "Switch CLI", "Medium",
    "Order the CLI steps to move from User EXEC mode (`SW1>`), configure the speed on interface FastEthernet 0/1, return directly to Privileged EXEC mode, and save the configuration to NVRAM.",
    [
      "Enter `enable` at the `SW1>` prompt to reach Privileged EXEC mode (`SW1#`)",
      "Enter `configure terminal` at the `SW1#` prompt to reach Global Configuration mode (`SW1(config)#`)",
      "Enter `interface FastEthernet 0/1` to enter Interface Configuration submode (`SW1(config-if)#`)",
      "Enter `speed 100` to set the interface speed and then `end` to return directly to `SW1#`",
      "Enter `copy running-config startup-config` to save the updated configuration to NVRAM"
    ],
    "Configuring an interface and saving the result follows the standard mode hierarchy: `enable` (`>` to `#`), `configure terminal` (`#` to `(config)#`), `interface FastEthernet 0/1` (`(config)#` to `(config-if)#`), apply the subcommand and `end` (`(config-if)#` to `#`), and `copy running-config startup-config`.",
    "Mode path: `>` -> `enable` -> `#` -> `configure terminal` -> `(config)#` -> `interface ...` -> `(config-if)#` -> `end` -> `#`.",
    ["enable", "configure terminal", "interface", "end", "copy running-config startup-config"]
  ),
  c04.m(
    "Switch CLI", "Hard",
    "Which Privileged EXEC commands can be used on a Cisco Catalyst switch to erase the initial configuration file stored in NVRAM?",
    [
      "Execute `write erase` in Privileged EXEC mode",
      "Execute `erase startup-config` in Privileged EXEC mode",
      "Execute `erase nvram:` in Privileged EXEC mode"
    ],
    [
      ["Execute `delete running-config` in Privileged EXEC mode", "There is no `delete running-config` command in Cisco IOS, and `running-config` is stored in RAM rather than NVRAM."],
      ["Execute `clear startup-config` in Privileged EXEC mode", "Cisco IOS uses `erase startup-config`, `write erase`, or `erase nvram:` rather than `clear startup-config`."],
      ["Execute `delete flash:startup-config` in Privileged EXEC mode", "`startup-config` is stored in NVRAM (`nvram:`), whereas Flash (`flash:`) holds the Cisco IOS image and `vlan.dat`."]
    ],
    "Cisco IOS provides three equivalent Privileged EXEC commands to erase the NVRAM contents where `startup-config` resides: `write erase`, `erase startup-config`, and `erase nvram:`. Doing so leaves the current `running-config` in RAM untouched until the switch is reloaded.",
    "All three erase NVRAM: `write erase`, `erase startup-config`, and `erase nvram:`.",
    ["write erase", "erase startup-config", "erase nvram:"]
  ),
  c04.s(
    "Switch CLI", "Hard",
    "On a Cisco Catalyst 2960-XR switch that has twenty-four 10/100/1000 Ethernet ports and two 1-Gbps/10-Gbps SFP+ uplink ports, how does Cisco IOS name those ports in the CLI?",
    "`GigabitEthernet` for the 10/100/1000 ports and `TenGigabitEthernet` for the SFP+ ports based on maximum port speed",
    [
      ["`FastEthernet` for any port currently negotiating 100 Mbps and `GigabitEthernet` when a 1000BASE-T device is plugged in", "Cisco IOS interface names are fixed in hardware based on the port's maximum supported speed and never change dynamically when link speed changes."],
      ["`Ethernet` for all twenty-six ports because they all comply with the IEEE 802.3 Ethernet family of standards", "Catalyst switches differentiate port types by maximum speed (`FastEthernet`, `GigabitEthernet`, `TenGigabitEthernet`) rather than naming all ports `Ethernet`."],
      ["`Serial` for the two SFP+ fiber uplink ports and `GigabitEthernet` for the twenty-four RJ-45 copper ports", "SFP+ fiber ports are Ethernet interfaces named `TenGigabitEthernet`, not WAN `Serial` interfaces."]
    ],
    "Cisco Catalyst switches always name physical Ethernet interfaces after the fastest speed the port hardware is capable of supporting, regardless of what speed is currently negotiated or what SFP transceiver is inserted. Thus, a 10/100/1000 port is always named `GigabitEthernet`, and a 1G/10G SFP+ port is always named `TenGigabitEthernet`.",
    "Cisco IOS names switch ports after their maximum capable speed (`FastEthernet` = 100M max, `GigabitEthernet` = 1G max, `TenGigabitEthernet` = 10G max).",
    []
  ),
  c04.s(
    "Switch CLI", "Hard",
    "An administrator enters the following sequence of commands on a Catalyst switch:\n`SW1# configure terminal`\n`SW1(config)# hostname EdgeSw`\n`EdgeSw(config)# line console 0`\n`EdgeSw(config-line)# exit`\n`EdgeSw(config)# interface vlan 1`\nWhat CLI prompt is displayed immediately after pressing Enter on `interface vlan 1`, and where is the new hostname currently stored?",
    "Prompt: `EdgeSw(config-if)#`; the new hostname `EdgeSw` is stored only in RAM `running-config` until explicitly saved to NVRAM.",
    [
      ["Prompt: `SW1(config-if)#`; the hostname change does not take effect in the prompt until `copy running-config startup-config` is run.", "Configuration commands take effect in RAM (`running-config`) immediately upon pressing Enter, updating the prompt to `EdgeSw` right away."],
      ["Prompt: `EdgeSw#`; typing `exit` from `line console 0` returned the user to Privileged EXEC mode where `interface vlan 1` is ignored.", "Typing `exit` from `(config-line)#` steps back one level to Global Configuration mode (`EdgeSw(config)#`), where `interface vlan 1` is valid."],
      ["Prompt: `EdgeSw(config-vlan)#`; the command `interface vlan 1` enters VLAN database mode and saves the hostname to `vlan.dat`.", "`interface vlan 1` enters Interface Configuration mode (`(config-if)#`) for the switch virtual interface, whereas `vlan 1` enters `(config-vlan)#`."]
    ],
    "In Cisco IOS, configuration commands take effect immediately in RAM (`running-config`), so `hostname EdgeSw` changes the prompt right away. Entering `exit` from `(config-line)#` returns to `(config)#`, and entering `interface vlan 1` transitions into Interface Configuration mode (`EdgeSw(config-if)#`). Because `copy running-config startup-config` has not been run, the change is only in RAM.",
    "`exit` from `(config-line)#` goes to `(config)#`; `interface vlan 1` goes to `(config-if)#` (`vlan 1` goes to `(config-vlan)#`).",
    ["hostname", "line console 0", "interface vlan 1"]
  ),
  c04.s(
    "Switch CLI", "Hard",
    "An engineer makes several mistaken edits to the running configuration on a lab switch and wants to revert the switch cleanly to the exact configuration stored in `startup-config` without leaving any leftover lines in RAM. Which action achieves this?",
    "Issue the `reload` command in Privileged EXEC mode and decline saving the configuration when prompted.",
    [
      ["Issue `copy startup-config running-config` from Privileged EXEC mode so the file in NVRAM overwrites RAM.", "`copy startup-config running-config` merges the two files in RAM and does not remove extra commands that were added to `running-config`."],
      ["Issue `write erase` followed by `copy running-config startup-config` to synchronize NVRAM with the original boot state.", "`write erase` deletes the good `startup-config`, and copying `running-config` over it would permanently save the mistaken edits."],
      ["Issue `clear running-config` from Global Configuration mode to reload the NVRAM file into DRAM without rebooting.", "There is no `clear running-config` command in Cisco IOS; cleanly replacing `running-config` with `startup-config` requires a `reload`."]
    ],
    "Because `copy startup-config running-config` merges configuration lines into RAM rather than overwriting RAM, any unwanted commands added during the current session would remain active. To discard all unsaved changes and return cleanly to the exact state of `startup-config`, you must execute `reload` in Privileged EXEC mode (and answer `no` if asked to save changes).",
    "To discard unsaved changes in `running-config` completely, use `reload` (do not use `copy startup-config running-config`, which only merges).",
    ["reload", "copy startup-config running-config"]
  )
];

// ============================================================================
// v1c05 - Analyzing Ethernet LAN Switching (15 questions: 4 Easy, 7 Medium, 4 Hard)
// ============================================================================
const c05 = mk("Network Fundamentals", 20, "v1c05");
const c05na = mk("Network Access", 20, "v1c05");
const q05 = [
  c05.s(
    "Switching", "Easy",
    "Which address field in an incoming Ethernet frame does a Layer 2 switch examine to decide which egress port(s) should forward the frame?",
    "Destination MAC address field",
    [
      ["Source MAC address field", "The switch inspects the Source MAC address to learn where the sender is located, not to decide where to forward the frame."],
      ["Destination IPv4 address field", "A Layer 2 switch does not examine the Layer 3 IPv4 destination address when switching Ethernet frames."],
      ["Ethernet Type (EtherType) field", "The 2-byte EtherType field identifies the Layer 3 protocol (such as 0x0800 for IPv4), not the outgoing switch port."]
    ],
    "A Layer 2 Ethernet switch performs two distinct MAC lookups on every incoming frame: it checks the **Destination MAC address** in its MAC address table to make the forwarding or filtering decision, and it checks the **Source MAC address** to learn or refresh the sender's port entry.",
    "Forwarding decision = Destination MAC address; Learning = Source MAC address.",
    ["show mac address-table"]
  ),
  c05.s(
    "Switching", "Easy",
    "What is the default inactivity aging time for dynamic entries in a Cisco Catalyst switch's MAC address table?",
    "300 seconds (5 minutes) by default",
    [
      ["60 seconds (1 minute) by default", "Dynamic MAC table entries age out after 300 seconds (5 minutes) of inactivity, not 60 seconds."],
      ["180 seconds (3 minutes) by default", "180 seconds is the default CDP holdtime, whereas the MAC address table default aging timer is 300 seconds."],
      ["14,400 seconds (4 hours) by default", "4 hours (14,400 seconds) is the classic Cisco IOS ARP table timeout, whereas the Layer 2 MAC table ages out in 300 seconds."]
    ],
    "By default, a Cisco Catalyst switch removes a dynamic MAC address table entry if it does not receive any frames with that MAC address as the **source** MAC for 300 seconds (5 minutes). Every time a frame arrives from that source MAC, its inactivity timer resets to 0.",
    "Default dynamic MAC table aging time = 300 seconds (5 minutes); verify with `show mac address-table aging-time`.",
    ["show mac address-table aging-time", "mac address-table aging-time"]
  ),
  c05.s(
    "Switching", "Easy",
    "What term describes an Ethernet unicast frame whose destination MAC address is not currently listed in the switch's MAC address table?",
    "An unknown unicast Ethernet frame",
    [
      ["A Layer 2 broadcast Ethernet frame", "Although the switch floods an unknown unicast frame like a broadcast, the frame's destination MAC remains a unicast address and is called an unknown unicast."],
      ["A corrupted runt Ethernet frame", "A runt frame is a corrupted physical frame smaller than 64 bytes, unrelated to whether the destination MAC is in the MAC table."],
      ["A filtered known unicast LAN frame", "Switches never drop a valid frame simply because the destination MAC is unknown; they flood unknown unicasts out all other ports in the VLAN."]
    ],
    "A unicast frame is called a **known unicast** when its destination MAC address is found in the switch's MAC address table, and an **unknown unicast** when its destination MAC address is absent from the table. Switches flood unknown unicast frames out all ports in the same VLAN except the ingress port.",
    "Known unicast = forward out 1 port; Unknown unicast = flood out all ports in the VLAN except the incoming port.",
    ["show mac address-table"]
  ),
  c05na.s(
    "Switch CLI", "Easy",
    "Which Privileged EXEC command removes all dynamically learned MAC entries from a Catalyst switch's CAM table immediately?",
    "clear mac address-table dynamic",
    [
      ["erase mac address-table all", "Cisco IOS uses `clear mac address-table dynamic`, not `erase mac address-table`."],
      ["delete flash:mac-address-table.dat", "Dynamic MAC addresses are held in volatile CAM memory, not in a Flash file, and are cleared with `clear mac address-table dynamic`."],
      ["no mac address-table dynamic", "`clear mac address-table dynamic` is a Privileged EXEC action command, not a Global Configuration `no` command."]
    ],
    "To flush dynamically learned MAC addresses from the switch's Content Addressable Memory (CAM) table in Privileged EXEC mode, use `clear mac address-table dynamic` (optionally filtering by `address`, `interface`, or `vlan`).",
    "Use `clear mac address-table dynamic` in Privileged EXEC (`#`) mode to flush dynamic MAC entries.",
    ["clear mac address-table dynamic"]
  ),
  c05.s(
    "Switching", "Medium",
    "A switch with four active ports in VLAN 1 (Gi0/1, Gi0/2, Gi0/3, and Gi0/4) receives a frame on Gi0/1 with source MAC `0200.1111.1111` and destination MAC `0200.9999.9999`. The MAC table currently contains only `0200.2222.2222` on Gi0/2. What two actions does the switch take?",
    "It adds `0200.1111.1111` associated with port Gi0/1 to the MAC table and floods the frame out ports Gi0/2, Gi0/3, and Gi0/4.",
    [
      ["It adds `0200.9999.9999` associated with port Gi0/1 to the MAC table and drops the frame until an ARP reply arrives.", "Switches learn only from the Source MAC address (`0200.1111.1111`), never the Destination MAC, and they flood unknown unicasts rather than dropping them."],
      ["It adds `0200.1111.1111` associated with port Gi0/1 to the MAC table and floods the frame out all four ports including Gi0/1.", "A switch never floods a frame back out the same ingress port (`Gi0/1`) on which it arrived."],
      ["It forwards the frame only out Gi0/2 because Gi0/2 is the only port currently listed in the MAC address table.", "Because `0200.9999.9999` is not in the MAC table, the frame is an unknown unicast and must be flooded out all other active ports in VLAN 1 (Gi0/2, Gi0/3, and Gi0/4)."]
    ],
    "First, the switch inspects the source MAC (`0200.1111.1111`) arriving on Gi0/1 and adds that entry to its MAC address table. Second, it looks up the destination MAC (`0200.9999.9999`); finding no match, it floods the unknown unicast frame out every other port in the same VLAN (Gi0/2, Gi0/3, and Gi0/4), excluding the ingress port Gi0/1.",
    "Learn from Source MAC on ingress port; flood unknown Destination MAC out all other ports in the same VLAN (never the ingress port).",
    ["show mac address-table"]
  ),
  c05.s(
    "Switching", "Medium",
    "Both Host A (`0200.AAAA.AAAA`) and Host B (`0200.BBBB.BBBB`) are connected to a Layer 1 hub, and that hub is uplinks into port Gi0/1 of Switch SW1. SW1 already has both MAC addresses mapped to Gi0/1 in its MAC table. When Host A sends a frame to Host B, what does SW1 do when the copy of the frame from the hub arrives on Gi0/1?",
    "SW1 filters (discards) the frame because the destination MAC's egress port is the ingress port Gi0/1.",
    [
      ["SW1 forwards the frame back out Gi0/1 so the hub can repeat the frame a second time to ensure Host B received it.", "Forwarding a frame back out the port it arrived on would create duplicate frames and collisions; SW1 filters the frame instead."],
      ["SW1 floods the frame out all other switch ports except Gi0/1 in case Host B moved to another switch port.", "Because `0200.BBBB.BBBB` is already a known unicast mapped to Gi0/1 in SW1's MAC table, SW1 does not flood it."],
      ["SW1 places port Gi0/1 into the `err-disabled` state because two different source MAC addresses exist on the same port.", "Standard switch ports without port security enabled happily learn multiple MAC addresses on a single port (such as from a hub or another switch)."]
    ],
    "When Host A sends a frame to Host B through the hub, the hub repeats the frame to both Host B and SW1's Gi0/1 port. SW1 looks up the destination MAC (`0200.BBBB.BBBB`), sees that it maps to Gi0/1 (the exact same port the frame arrived on), and **filters** (discards) the frame knowing Host B already received it on that shared segment.",
    "When egress port == ingress port in the MAC table, the switch filters (drops) the frame.",
    ["show mac address-table"]
  ),
  c05.s(
    "Switching", "Medium",
    "If a switch's MAC address table becomes completely full of dynamic entries and a frame arrives from a brand-new source MAC address, how does the switch handle the new MAC address?",
    "It removes the oldest existing dynamic entry from the CAM table to make room for the newly learned MAC address.",
    [
      ["It stops learning any new MAC addresses until an existing entry naturally reaches its 300-second aging timer.", "Rather than refusing new entries until 300 seconds elapse, the switch preemptively purges the oldest dynamic entry to learn the new one."],
      ["It clears the entire dynamic MAC address table at once and floods all traffic while rebuilding the table from scratch.", "A full CAM table replaces the oldest dynamic entry rather than flushing the entire table."],
      ["It shuts down the ingress interface and logs a security violation because the hardware CAM capacity was exceeded.", "A full CAM table does not trigger an interface shutdown unless port security is explicitly configured with a maximum MAC limit."]
    ],
    "Cisco Catalyst switches store the MAC address table in Content Addressable Memory (CAM). If the table fills to capacity with dynamic entries, a newly arriving source MAC address pushes out the oldest entry in the table (the entry that has gone the longest without sending a frame).",
    "Dynamic MAC entries are removed either after 300 seconds of inactivity OR when the table is full and the oldest entry is evicted.",
    ["show mac address-table count"]
  ),
  c05na.s(
    "Switch CLI", "Medium",
    "Examine the `show mac address-table` output below. Which command displays ONLY the dynamically learned entries on port FastEthernet 0/1?\nWhat happens if an engineer runs `show mac address-table dynamic` vs `show mac address-table`?",
    "`show mac address-table dynamic interface fastethernet 0/1`",
    [
      ["`show mac address-table interface fastethernet 0/1 dynamic all`", "In Cisco IOS syntax, the `dynamic` keyword comes immediately after `show mac address-table`, before `interface`, `address`, or `vlan`."],
      ["`show interfaces fastethernet 0/1 mac-address-table`", "There is no `show interfaces ... mac-table` command; per-port MAC lookups use `show mac address-table [dynamic] interface <id>`."],
      ["`show mac address-table count interface fastethernet 0/1`", "`show mac address-table count` displays only summary numeric counts per VLAN and cannot filter individual MAC addresses by interface."]
    ],
    "The command `show mac address-table` includes both preconfigured `STATIC` entries destined for the switch `CPU` and `DYNAMIC` entries learned from LAN traffic. To view only dynamically learned entries on a specific port, use `show mac address-table dynamic interface <interface-id>`.",
    "Syntax order: `show mac address-table [dynamic] [address <mac> | interface <id> | vlan <id>]`.",
    ["show mac address-table dynamic", "show mac address-table"],
    {
      cli: "SW1# show mac address-table\n          Mac Address Table\n-------------------------------------------\nVlan    Mac Address       Type        Ports\n----    -----------       --------    -----\n All    0100.0ccc.cccc    STATIC      CPU\n   1    0200.aaaa.aaaa    DYNAMIC     Fa0/1\n   1    0200.bbbb.bbbb    DYNAMIC     Fa0/2"
    }
  ),
  c05.s(
    "Switching", "Medium",
    "In the two-switch topology `Host A (0200.AAAA.AAAA) --- [Gi0/1 SW1 Gi0/2] --- [Gi0/2 SW2 Gi0/1] --- Host B (0200.BBBB.BBBB)`, Host A sends a frame to Host B. After the frame reaches Host B, which port does SW2 associate with `0200.AAAA.AAAA` in SW2's MAC address table?",
    "Port Gi0/2 — the local inter-switch link port on SW2 where Host A's frame arrived from switch SW1",
    [
      ["Port Gi0/1 — the remote access port number on SW1 advertised to SW2 via CDP neighbor updates", "Each switch builds its own independent MAC table based on its own local ingress port; switches do not copy MAC table port numbers from neighbors."],
      ["Both Gi0/1 and Gi0/2 — the original edge access port on SW1 plus the local ingress trunk port on SW2", "A MAC address can be associated with only one port per VLAN in a switch's MAC address table—specifically the local port on which the frame arrived."],
      ["Neither port — switches only record source MAC addresses from directly connected end-host access ports", "Switches learn the source MAC address of every frame arriving on any port, including inter-switch links, mapping all distant hosts to the inter-switch port."]
    ],
    "Switches do not share MAC address tables with each other; each switch independently learns source MAC addresses based on which of its **own** ports received the frame. When Host A's frame travels from SW1 out Gi0/2 into SW2's Gi0/2, SW2 sees source MAC `0200.AAAA.AAAA` arriving on its local port Gi0/2 and records `0200.AAAA.AAAA -> Gi0/2`.",
    "On an inter-switch link, each switch maps all remote hosts' MAC addresses to the local inter-switch port where their frames enter.",
    ["show mac address-table dynamic"]
  ),
  c05.t(
    "Switching", "Medium",
    "Match each core Layer 2 switch function or hardware mechanism to its correct description.",
    [
      ["Address Learning", "Inspecting the frame's source MAC address and recording the ingress port in the MAC table"],
      ["Forwarding / Filtering", "Looking up the frame's destination MAC address in the CAM table to choose the egress port(s)"],
      ["Loop Avoidance", "Running Spanning Tree Protocol (STP) to block redundant paths and prevent broadcast storms"],
      ["Content Addressable Memory (CAM)", "Specialized hardware memory that performs instant exact-match lookups on MAC + VLAN"]
    ],
    "Layer 2 switches perform three primary functions: (1) deciding when to forward or filter frames based on the destination MAC address using fast CAM hardware lookups, (2) learning MAC addresses by examining the source MAC address of incoming frames, and (3) preventing Layer 2 loops using Spanning Tree Protocol (STP).",
    "Three switch functions: (1) Forward/filter (Dest MAC), (2) Learn (Src MAC), (3) Prevent loops (STP).",
    []
  ),
  c05na.d(
    "Switch CLI", "Medium",
    "Order the three Privileged EXEC commands used to completely wipe a lab Catalyst switch's configuration and VLAN database back to factory defaults.",
    [
      "Run `erase startup-config` (or `write erase`) to remove the startup configuration file from NVRAM",
      "Run `delete vlan.dat` to remove the normal-range VLAN database file from Flash memory",
      "Run `reload` (without saving the running configuration) to reboot the switch with clean defaults"
    ],
    "Because normal-range VLAN configurations are stored in `flash:vlan.dat` rather than `nvram:startup-config`, resetting a Catalyst switch to factory defaults requires erasing `startup-config`, deleting `vlan.dat` from Flash, and then executing `reload` without saving the running configuration.",
    "Factory reset a switch: (1) `erase startup-config`, (2) `delete vlan.dat`, (3) `reload`.",
    ["erase startup-config", "delete vlan.dat", "reload"]
  ),
  c05.m(
    "Switching", "Hard",
    "Which events reset the inactivity timer to 0 or alter an existing dynamic entry for MAC address `0200.1111.1111` in a switch's MAC address table?",
    [
      "A frame arrives on the switch with `0200.1111.1111` in the Source MAC Address field.",
      "The host with MAC `0200.1111.1111` is unplugged from Fa0/1, plugged into Fa0/5, and sends a frame from Fa0/5."
    ],
    [
      ["A frame arrives on another port with `0200.1111.1111` in the Destination MAC Address field.", "The switch's learning and timer-reset logic inspects only the **Source** MAC address of incoming frames; being the destination of a frame does not reset `0200.1111.1111`'s timer."],
      ["An administrator runs `show mac address-table dynamic address 0200.1111.1111` from the console.", "Viewing the MAC table with `show` commands is read-only and never resets the inactivity aging timer of learned entries."],
      ["The switch forwards a broadcast frame (`FFFF.FFFF.FFFF`) out the port associated with `0200.1111.1111`.", "Sending traffic out a port does not prove the attached host is still active; only frames arriving *from* `0200.1111.1111` reset its timer."]
    ],
    "A switch's MAC learning process is driven strictly by the **Source MAC Address** of incoming frames. Every time a frame arrives with `0200.1111.1111` as its source MAC, the switch resets that entry's inactivity timer back to 0 (and if the frame arrived on a different port like Fa0/5 because the PC moved, the switch updates the entry's port to Fa0/5 immediately).",
    "Only an incoming frame's **Source** MAC resets the 300-second aging timer or updates the learned port—never a Destination MAC.",
    ["show mac address-table dynamic"]
  ),
  c05na.s(
    "Switch CLI", "Hard",
    "Examine the CLI output below from `SW1`. Why are both dynamic MAC entries (`0200.1111.1111` and `0200.2222.2222`) still present if `0200.1111.1111` has not sent a frame in 250 seconds and `0200.2222.2222` has not sent a frame in 400 seconds?",
    "VLAN 10's aging time has been customized to 600 seconds, whereas VLAN 1 uses the global 300-second aging time.",
    [
      ["Dynamic MAC entries in higher-numbered VLANs never age out unless `clear mac address-table dynamic` is issued manually.", "All dynamic MAC entries age out once their VLAN's configured aging time is reached; VLAN 10 simply has a 600-second timer configured."],
      ["The global aging time of 300 seconds applies only to static CPU entries, while dynamic entries always wait double that duration.", "Static entries never age out; the 300-second global default applies to dynamic entries unless overridden per VLAN (as seen on VLAN 10)."],
      ["GigabitEthernet ports automatically double the configured MAC aging timer compared to FastEthernet ports.", "MAC table aging time is configured globally or per VLAN, never scaled automatically by interface speed."]
    ],
    "In the output of `show mac address-table aging-time`, the global aging time is 300 seconds, which applies to all VLANs except those with a per-VLAN override. Because VLAN 10 was configured with `mac address-table aging-time 600 vlan 10`, entries in VLAN 10 remain for up to 600 seconds of inactivity, explaining why a 400-second-old entry in VLAN 10 has not yet aged out.",
    "`mac address-table aging-time <seconds> [vlan <vlan-id>]` can override the 300-second default globally or for a specific VLAN.",
    ["show mac address-table aging-time", "mac address-table aging-time"],
    {
      cli: "SW1# show mac address-table aging-time\nGlobal Aging Time:  300\nVlan    Aging Time\n----    ----------\n  10      600\n\nSW1# show mac address-table dynamic\n          Mac Address Table\n-------------------------------------------\nVlan    Mac Address       Type        Ports\n----    -----------       --------    -----\n   1    0200.1111.1111    DYNAMIC     Gi0/1\n  10    0200.2222.2222    DYNAMIC     Gi0/2"
    }
  ),
  c05.s(
    "Switching", "Hard",
    "Switch SW1 has ports Gi0/1 and Gi0/2 in VLAN 10 and ports Gi0/3 and Gi0/4 in VLAN 20. A broadcast frame (`FFFF.FFFF.FFFF`) enters port Gi0/1. Out which port(s) does SW1 forward the broadcast frame, and why?",
    "Only out Gi0/2, because switches flood unknown frames strictly within the ingress port's VLAN 10.",
    [
      ["Out Gi0/2, Gi0/3, and Gi0/4, because Layer 2 broadcasts (`FFFF.FFFF.FFFF`) ignore VLAN boundaries on a single switch.", "VLANs create separate broadcast domains; a Layer 2 switch never floods broadcasts or unknown unicasts from VLAN 10 into VLAN 20."],
      ["Out Gi0/1 and Gi0/2, because every port in VLAN 10 must receive a copy of a VLAN-scoped broadcast frame.", "While flooding is scoped to VLAN 10, a switch never forwards a frame back out the ingress port (`Gi0/1`) on which it arrived."],
      ["Nowhere, because switches drop broadcast frames unless an IP default-gateway is configured for VLAN 10.", "Layer 2 switches flood broadcasts within the ingress VLAN purely at Layer 2 without needing any IP address or default gateway."]
    ],
    "Every entry in a switch's MAC address table—and every flooding decision for broadcasts, multicasts, and unknown unicasts—is scoped to the VLAN of the incoming port. Because Gi0/1 belongs to VLAN 10, SW1 floods the broadcast only out other active ports in VLAN 10 (Gi0/2) and never crosses into VLAN 20 (Gi0/3, Gi0/4) or sends the frame back out Gi0/1.",
    "Switches flood broadcasts, multicasts, and unknown unicasts only to other ports in the **same VLAN** (never the ingress port, never other VLANs).",
    ["show mac address-table"]
  ),
  c05na.s(
    "Switch CLI", "Hard",
    "Examine the `show interfaces Gi0/1 counters` output below. Given that Gi0/1 is the only port in VLAN 1 connected to a single PC and the switch has received 500 unicast frames and 20 broadcast frames from that PC, why does `UcastPkts` under `In` show 500 while `BcastPkts` shows 20?",
    "`show interfaces counters` separately counts incoming (`In`) and outgoing (`Out`) Layer 2 unicast, multicast, and broadcast frames.",
    [
      ["`UcastPkts` counts only unknown unicast frames that failed the CAM lookup, whereas known unicasts are omitted from counters.", "`UcastPkts` counts all valid unicast frames (both known and unknown) entering or leaving the port."],
      ["`BcastPkts` counts ARP Requests that were dropped by port security, whereas valid broadcasts are added to `UcastPkts`.", "`BcastPkts` counts all valid Layer 2 broadcast frames (`FFFF.FFFF.FFFF`), not dropped security violations."],
      ["The `In` table counts packets routed by the switch's Layer 3 CPU, whereas Layer 2 frames are only shown in `show mac address-table`.", "`show interfaces counters` reports Layer 2 frame counts (unicast, multicast, and broadcast) directly on physical switch ports."]
    ],
    "The `show interfaces [<id>] counters` command provides a breakdown of incoming (`InOctets`, `InUcastPkts`, `InMcastPkts`, `InBcastPkts`) and outgoing (`OutOctets`, `OutUcastPkts`, `OutMcastPkts`, `OutBcastPkts`) traffic per switch port, making it easy to verify whether unicast, multicast, or broadcast frames are entering and leaving an interface.",
    "Use `show interfaces [<id>] counters` to view per-port byte, unicast, multicast, and broadcast frame counts.",
    ["show interfaces counters"],
    {
      cli: "SW1# show interfaces Gi0/1 counters\nPort            InOctets    InUcastPkts    InMcastPkts    InBcastPkts\nGi0/1              64200            500              0             20\n\nPort           OutOctets   OutUcastPkts   OutMcastPkts   OutBcastPkts\nGi0/1              48100            380             15              5"
    }
  )
];

// ============================================================================
// v1c06 - Configuring Basic Switch Management (15 questions: 4 Easy, 7 Medium, 4 Hard)
// ============================================================================
const c06 = mk("Network Access", 20, "v1c06");
const c06sec = mk("Security Fundamentals", 15, "v1c06");
const q06 = [
  c06.s(
    "Switch CLI", "Easy",
    "Which plane of a network device encompasses traffic sent directly to or from the device itself for administration—such as SSH, Telnet, and SNMP—rather than user traffic being forwarded through the device?",
    "The device Management plane",
    [
      ["The high-speed Data plane", "The data plane (forwarding plane) handles end-user frames and packets passing through the switch, not administrative sessions to the switch."],
      ["The dynamic Control plane", "The control plane runs dynamic protocols (STP, OSPF, ARP) that feed the data plane's tables, rather than interactive CLI management."],
      ["The chassis switching Backplane", "The backplane is internal switching hardware rather than one of the three logical networking planes (data, control, management)."]
    ],
    "Networking devices divide work across three logical planes: the **data plane** forwards user frames/packets through the device, the **control plane** runs protocols like STP, ARP, and OSPF to build forwarding tables, and the **management plane** handles traffic used by administrators to manage the device itself (SSH, Telnet, console, SNMP, Syslog).",
    "Data plane = forwarding user traffic; Control plane = protocols building tables (STP/OSPF/ARP); Management plane = managing the box (SSH/Telnet/Console).",
    []
  ),
  c06sec.s(
    "Device security", "Easy",
    "If both `enable password cisco` and `enable secret class` are configured in Global Configuration mode on a Catalyst switch, which password must an administrator enter after typing `enable`?",
    "Only `class`, because `enable secret` always overrides `enable password` when both are configured",
    [
      ["Either `cisco` or `class`, because Cisco IOS accepts both passwords as fallback options", "When `enable secret` is present, Cisco IOS completely ignores `enable password` and never accepts `cisco`."],
      ["Only `cisco`, because `enable password` is evaluated first for local console connections", "`enable secret` takes precedence over `enable password` for all console, Telnet, and SSH sessions."],
      ["Both `cisco` followed by `class`, because configuring both commands enables two-factor authentication", "Configuring both commands does not prompt for two passwords; `enable secret` simply replaces `enable password` in operation."]
    ],
    "The `enable secret` command stores the Privileged EXEC password as a strong cryptographic hash and is more secure than the legacy `enable password` command. If both commands exist in `running-config`, IOS always enforces the `enable secret` password (`class`) and ignores `enable password`.",
    "`enable secret` always takes precedence over `enable password`.",
    ["enable secret", "enable password"]
  ),
  c06.s(
    "Switch CLI", "Easy",
    "Which Global Configuration command prevents a Cisco switch from pausing the CLI for several seconds to broadcast a DNS query whenever an administrator mistypes an EXEC command?",
    "no ip domain-lookup",
    [
      ["no logging console", "`no logging console` disables Syslog messages on the console screen; it does not stop IOS from translating mistyped words via DNS."],
      ["no logging synchronous", "`logging synchronous` prevents log messages from splitting typed commands mid-line, not DNS lookups on typos."],
      ["exec-timeout 0 0", "`exec-timeout 0 0` stops the console from logging out due to inactivity rather than disabling DNS lookups."]
    ],
    "By default, when you type an unrecognized word in EXEC mode, Cisco IOS assumes it is a hostname you want to Telnet to and attempts a DNS lookup (`Translating \"...\"...domain server (255.255.255.255)`). Entering `no ip domain-lookup` in Global Configuration mode disables DNS resolution on the switch and immediately returns an error prompt on typos.",
    "Use `no ip domain-lookup` in lab switches so mistyped EXEC commands don't hang waiting for DNS.",
    ["no ip domain-lookup"]
  ),
  c06.s(
    "Switch CLI", "Easy",
    "Why does a Layer 2 Catalyst switch configure its management IPv4 address under `interface vlan <id>` (an SVI) rather than directly on a physical port like `interface GigabitEthernet 0/1`?",
    "A Layer 2 switch uses an internal SVI so administrators can reach its management IP through any active port in that VLAN.",
    [
      ["Physical GigabitEthernet ports on a Layer 2 switch can only be assigned IPv6 addresses, leaving IPv4 to VLAN interfaces.", "Layer 2 switch ports do not take IPv4 or IPv6 addresses directly; the switch's management IP (IPv4 or IPv6) is configured on a Switched Virtual Interface (SVI)."],
      ["Configuring an IP address on `interface vlan 1` turns the Layer 2 switch into a multi-subnet WAN router for all attached PCs.", "Configuring an SVI on a Layer 2 switch provides only a management IP for the switch itself (SSH/Telnet/ping), not inter-VLAN routing."],
      ["Physical switch ports delete their IP addresses whenever a connected PC reboots, whereas SVIs store their IP in ROM.", "SVIs store their IP configuration in `running-config` (RAM) and `startup-config` (NVRAM), not ROM; Layer 2 switch ports simply act as Layer 2 bridge ports."]
    ],
    "A Layer 2 switch does not route packets between interfaces; it needs just one IPv4 address for remote management (SSH, Telnet, ping). It assigns this IP to a logical Switched Virtual Interface (SVI), such as `interface vlan 1`, which acts like a virtual NIC connected internally to the switch fabric for that VLAN.",
    "A Layer 2 switch configures its management IP on an SVI (`interface vlan <x>`) and its default gateway globally (`ip default-gateway <ip>`).",
    ["interface vlan 1", "ip address", "ip default-gateway"]
  ),
  c06sec.s(
    "Device security", "Medium",
    "An engineer wants to configure a Catalyst switch so that both console and VTY lines prompt users for BOTH a username and a password stored locally on the switch (with the password hashed in `running-config`). Which configuration sequence accomplishes this?",
    "Configure `username <name> secret <pass>` in Global Configuration mode and `login local` under both console and VTY lines.",
    [
      ["Configure `password <pass>` and `login` under both `line console 0` and `line vty 0 15` without global `username` commands.", "Line `password` + `login` prompts only for a shared line password (no username) and stores that password in clear text by default."],
      ["Configure `enable secret <pass>` in global configuration mode and `login` under both `line console 0` and `line vty 0 15`.", "`enable secret` protects transition from User EXEC (`>`) to Privileged EXEC (`#`), not initial console/VTY login."],
      ["Configure `username <name> password <pass>` under `line vty 0 15` and `transport input ssh` under `line console 0`.", "`username` is a global command (and `password` leaves it clear-text instead of hashed with `secret`), and `transport input` is a VTY command, not a console command."]
    ],
    "To require both a username and a password using local switch credentials, create one or more global accounts with `username <name> secret <password>` (which hashes the password in the config) and replace the simple `login` command with `login local` under `line console 0` and `line vty 0 15`.",
    "`login` = shared line `password` only; `login local` = global `username <name> secret <pass>` (username + password).",
    ["username", "login local", "line console 0", "line vty 0 15"]
  ),
  c06sec.s(
    "Device security", "Medium",
    "What prerequisites must be configured on a Cisco Catalyst switch before generating the RSA key pair to enable SSH version 2 server support?",
    "Both a non-default switch `hostname` and an `ip domain-name` must be configured in Global Configuration mode beforehand.",
    [
      ["An SVI with a static IPv4 address and `ip default-gateway` must be in the `up/up` state before `crypto key generate rsa` will run.", "While an IP address is needed to connect via SSH over the network, `crypto key generate rsa` only checks for a hostname and IP domain name."],
      ["Telnet must first be disabled on all VTY lines using `transport input none` before the RSA key generator will unlock.", "`crypto key generate rsa` does not require `transport input` to be changed beforehand."],
      ["An external RADIUS or TACACS+ AAA server must be reachable because SSHv2 cannot use local usernames on a Layer 2 switch.", "SSHv2 commonly uses local credentials (`username ... secret` + `login local`) as well as AAA servers."]
    ],
    "The `crypto key generate rsa` command names the switch's RSA key pair by combining the switch's configured `hostname` and `ip domain-name` (for example, `SW1.example.com`). Without both a hostname and domain name configured, IOS refuses to generate the RSA keys. For SSHv2, the modulus length must also be at least 768 bits.",
    "SSH RSA key prerequisites: `hostname <name>` + `ip domain-name <domain>` -> `crypto key generate rsa` (>= 768 bits for SSHv2).",
    ["hostname", "ip domain-name", "crypto key generate rsa", "ip ssh version 2"]
  ),
  c06sec.s(
    "Device security", "Medium",
    "Which VTY line configuration command permits encrypted SSH connections into a switch while blocking unencrypted Telnet connections?",
    "`transport input ssh` under `line vty 0 15`",
    [
      ["`ip ssh version 2` under `line vty 0 15`", "`ip ssh version 2` restricts the SSH server to SSHv2 (disabling SSHv1), but it does not disable Telnet on the VTY lines if `transport input` allows Telnet."],
      ["`login local` configured under `line vty 0 15`", "`login local` specifies how users are authenticated (via local `username` accounts); both Telnet and SSH can use `login local`."],
      ["`transport output ssh` under `line vty 0 15`", "`transport output` controls outbound connections initiated *from* the switch CLI, whereas `transport input` controls inbound remote access *to* the switch."]
    ],
    "Under `line vty 0 15`, the `transport input` command controls which remote access protocols are allowed to connect into the switch's VTY lines. `transport input ssh` allows only SSH, `transport input telnet` allows only Telnet, `transport input all` (or `transport input telnet ssh`) allows both, and `transport input none` disables all inbound VTY access.",
    "Under `line vty 0 15`, use `transport input ssh` to allow only SSH and block Telnet.",
    ["transport input ssh", "line vty 0 15"]
  ),
  c06.s(
    "Switch CLI", "Medium",
    "Why does `show running-config` on a Catalyst switch often display VTY lines split into `line vty 0 4` and `line vty 5 15` even after the engineer typed `line vty 0 15`?",
    "Older IOS devices had only five VTY lines (`0 4`), so IOS still lists `0 4` and `5 15` separately for backward compatibility.",
    [
      ["Lines `0 4` are dedicated hardware ports for Telnet, whereas lines `5 15` are reserved exclusively for encrypted SSHv2 sessions.", "All 16 VTY lines (`0 15`) are identical virtual terminal lines that share whatever `transport input` protocols are configured on them."],
      ["Lines `0 4` authenticate against local `username` accounts, whereas lines `5 15` require an external TACACS+ server.", "Entering commands under `line vty 0 15` applies identical authentication settings to both the `0 4` and `5 15` stanzas."],
      ["A Catalyst Layer 2 switch only allows 5 concurrent VTY logins unless an enterprise routing license is installed to unlock `5 15`.", "All 16 VTY lines (`0` through `15`) are active on a Catalyst switch without needing an extra routing license."]
    ],
    "Historically, Cisco routers and switches supported only five simultaneous virtual terminal sessions (`line vty 0 4`), and later IOS versions added eleven more (`line vty 5 15`) for a total of 16. Even when you configure all 16 at once with `line vty 0 15`, `show running-config` displays them in two blocks (`line vty 0 4` and `line vty 5 15`).",
    "Configuring `line vty 0 15` applies settings to all 16 VTY lines, which `show running-config` displays as `line vty 0 4` and `line vty 5 15`.",
    ["line vty 0 15", "show running-config"]
  ),
  c06.s(
    "Switch CLI", "Medium",
    "While typing a command at the console prompt, an unsolicited `%LINK-3-UPDOWN` Syslog message prints in the middle of the line, splitting the engineer's typed characters. Which command prevents this interruption by holding log messages until a new prompt line is drawn?",
    "`logging synchronous` configured under `line console 0`",
    [
      ["`no logging console` configured in Global Configuration mode", "`no logging console` completely suppresses all console log messages rather than synchronizing them neatly with your typing."],
      ["`exec-timeout 0 0` configured under `line console 0`", "`exec-timeout 0 0` disables the 5-minute console inactivity logout timer; it has no effect on Syslog message display."],
      ["`terminal history size 50` configured in Privileged EXEC mode", "`terminal history size` changes how many past commands are remembered in the current session, not how Syslog messages print."]
    ],
    "Configuring `logging synchronous` in Line Configuration mode (`line console 0` or `line vty 0 15`) tells Cisco IOS to wait until command output finishes or, if a log message arrives while you are typing, to print the log message and then automatically redraw your prompt and any characters you had already typed on a fresh line.",
    "`logging synchronous` (line subcommand) keeps unsolicited console log messages from breaking up the command you are typing.",
    ["logging synchronous", "line console 0"]
  ),
  c06.t(
    "Switch CLI", "Medium",
    "Match each switch management verification command to the specific information it displays.",
    [
      ["show ip ssh", "Status of the switch's SSH server, including SSH version, authentication timeout, and retries"],
      ["show ssh", "Details of active incoming SSH client connections currently logged into the switch"],
      ["show dhcp lease", "Temporary IPv4 address, subnet mask, default gateway, and lease time learned via DHCP"],
      ["show interfaces vlan 1", "Layer 1/Layer 2 status (`up/up`) and configured IPv4 address/mask of SVI VLAN 1"],
      ["show crypto key mypubkey rsa", "The public and private RSA cryptographic keys generated on the switch for SSH"]
    ],
    "`show ip ssh` displays SSH server settings (version, timeout, retries), whereas `show ssh` lists active SSH user sessions. For SVI IPv4 verification, `show interfaces vlan 1` shows the interface status and IP/mask, and `show dhcp lease` shows dynamic DHCP lease details (since DHCP-learned IPs do not appear in `running-config`).",
    "Distinguish `show ip ssh` (SSH server config/version) from `show ssh` (currently connected SSH users).",
    ["show ip ssh", "show ssh", "show dhcp lease", "show interfaces vlan 1", "show crypto key mypubkey rsa"]
  ),
  c06.d(
    "Switch CLI", "Medium",
    "Order the Global and Interface Configuration steps to assign static IPv4 address `192.168.10.2/24` with default gateway `192.168.10.1` to a Layer 2 switch's VLAN 1 management interface.",
    [
      "Enter `interface vlan 1` from Global Configuration mode to access the SVI configuration submode",
      "Enter `ip address 192.168.10.2 255.255.255.0` to assign the IPv4 address and subnet mask to VLAN 1",
      "Enter `no shutdown` to administratively enable the VLAN 1 virtual interface",
      "Enter `exit` to return to Global Configuration mode (`(config)#`)",
      "Enter `ip default-gateway 192.168.10.1` to configure the switch's default gateway for remote subnets"
    ],
    "Configuring IPv4 management on a Layer 2 switch requires entering `interface vlan <x>`, configuring `ip address <ip> <mask>` (or `ip address dhcp`), issuing `no shutdown` (because `interface vlan 1` defaults to `administratively down`), and configuring `ip default-gateway <ip>` in Global Configuration mode.",
    "Don't forget `no shutdown` under `interface vlan 1`, and remember `ip default-gateway` is a Global Config command, not an interface command.",
    ["interface vlan 1", "ip address", "no shutdown", "ip default-gateway"]
  ),
  c06.m(
    "Switch CLI", "Hard",
    "An engineer configures a Catalyst switch SVI (`interface vlan 1`) with `ip address 10.1.1.5 255.255.255.0` and `no shutdown`, and configures `ip default-gateway 10.1.1.1`. However, `show interfaces vlan 1` reports `Vlan1 is up, line protocol is down`. Which conditions would cause this state?",
    [
      "VLAN 1 does not exist in the switch's active VLAN database (`show vlan brief`) or is shut down.",
      "No physical switch port assigned to VLAN 1 (or carrying VLAN 1 on a trunk) is currently in the `connected` (`up/up`) state."
    ],
    [
      ["The default gateway router at `10.1.1.1` is powered off or unreachable via ICMP ping.", "An SVI's Layer 1/Layer 2 state (`up/up`) depends on local VLAN existence and having at least one active physical port in that VLAN, not whether the default gateway IP responds to pings."],
      ["The engineer forgot to configure `crypto key generate rsa` before bringing up the VLAN 1 interface.", "SSH RSA keys are required only for SSH daemon operation and have no impact on whether an SVI comes up."],
      ["The `ip default-gateway` command was entered in Global Configuration mode instead of under `interface vlan 1`.", "`ip default-gateway` is supposed to be entered in Global Configuration mode; that is the correct syntax."]
    ],
    "For a Switched Virtual Interface (`interface vlan <x>`) to reach the `up/up` state, three requirements must be met: (1) `no shutdown` must be configured on the SVI (bringing Layer 1 status from `administratively down` to `up`), (2) the VLAN itself must exist and be active on the switch, and (3) at least one physical access or trunk port in that VLAN must be up/connected (bringing line protocol `up`).",
    "SVI `administratively down/down` = missing `no shutdown` on SVI; SVI `up/down` or `down/down` = VLAN missing or no active (`connected`) physical ports in that VLAN.",
    ["show interfaces vlan 1", "interface vlan 1", "no shutdown"]
  ),
  c06.s(
    "Switch CLI", "Hard",
    "Examine the CLI output below from `SW1`. An administrator on a remote subnet (`172.16.50.10`) tries to connect to `10.1.1.200` using both Telnet and SSH. What happens to each connection attempt?",
    "Neither succeeds because `SW1` is missing `ip default-gateway` to reach a remote subnet.",
    [
      ["SSH succeeds using username `admin`, while Telnet is rejected by `transport input ssh`.", "Although SSH is properly configured for same-subnet clients (`10.1.1.0/24`), the administrator is on a remote subnet (`172.16.50.10`) and `SW1` has no `ip default-gateway`, so return packets cannot be sent."],
      ["Both Telnet and SSH succeed because `Vlan1` is `up/up` with a valid /24 subnet mask.", "An `up/up` SVI with a subnet mask allows communication only within the local `10.1.1.0/24` subnet; replying to `172.16.50.10` requires `ip default-gateway`."],
      ["Both fail because `line vty 0 4` is missing the `password` command required by `login local`.", "`login local` uses the global `username admin secret ...` command and ignores the line `password` command."]
    ],
    "While `SW1` has a working SVI (`10.1.1.200/24` in `up/up` state) and valid SSH/VTY settings (`username admin secret ...`, `login local`, `transport input ssh`), `show ip default-gateway` (or the running-config) shows no default gateway is configured. Without `ip default-gateway 10.1.1.1`, the Layer 2 switch cannot send return packets to a management host on a different subnet (`172.16.50.10`).",
    "If a switch can be pinged/managed from the same subnet but not from a remote subnet, check `ip default-gateway`.",
    ["ip default-gateway", "show running-config", "show interfaces vlan 1"],
    {
      cli: "SW1# show interfaces vlan 1\nVlan1 is up, line protocol is up\n  Internet address is 10.1.1.200/24\n\nSW1# show running-config | include default-gateway|username|vty|login|transport\nusername admin secret 5 $1$mERr$hx5rVt7rPNoS4wqbXKX7m0\nline vty 0 4\n login local\n transport input ssh\nline vty 5 15\n login local\n transport input ssh"
    }
  ),
  c06.s(
    "Switch CLI", "Hard",
    "What is the difference between configuring `history size 50` under `line console 0` versus entering `terminal history size 50` in Privileged EXEC mode?",
    "`history size 50` is saved in `running-config` for that line, whereas `terminal history size 50` applies only to the current login session.",
    [
      ["`history size 50` changes the buffer for VTY lines only, whereas `terminal history size 50` changes the buffer for the physical console port.", "`history size` can be configured under either `line console 0` or `line vty 0 15`, while `terminal history size` applies to whichever session runs it."],
      ["`history size 50` requires a switch reload to take effect, whereas `terminal history size 50` takes effect immediately in NVRAM.", "Neither command requires a reload or writes to NVRAM automatically; `history size` goes into `running-config` while `terminal history size` is temporary for the current session."],
      ["`history size 50` stores the last 50 Syslog messages, whereas `terminal history size 50` stores the last 50 CLI commands.", "Both commands configure the CLI command recall buffer size (default 10), not the Syslog message buffer."]
    ],
    "In Cisco IOS, the Line Configuration command `history size <length>` modifies the `running-config` so that the specified line permanently uses that history buffer size across logins. By contrast, the EXEC command `terminal history size <length>` overrides the history buffer size strictly for the user's current login session and disappears as soon as the user logs out.",
    "`history size <x>` (line config) = permanent in `running-config`; `terminal history size <x>` (EXEC mode) = temporary for this login session only.",
    ["history size", "terminal history size", "show history"]
  ),
  c06sec.s(
    "Device security", "Hard",
    "An engineer configures a new Catalyst switch with `hostname SW1`, `ip domain-name corp.local`, `crypto key generate rsa` (1024-bit modulus), and `ip ssh version 2`, then erases `startup-config` and reloads the switch without saving `running-config`. After the reboot, what is the status of the RSA keys?",
    "The RSA keys remain intact because `crypto key generate rsa` stores them in a hidden Flash file independent of `startup-config`.",
    [
      ["The RSA keys are gone because they are stored as encrypted lines inside `running-config` and were never copied to `startup-config`.", "RSA keys are not stored inside `running-config` or `startup-config`; they are written directly to a hidden file in Flash memory when generated."],
      ["The RSA keys are gone because `write erase` automatically runs `crypto key zeroize rsa` on all Flash partitions.", "`write erase` clears only NVRAM (`startup-config`); deleting the RSA keys requires explicitly running `crypto key zeroize rsa`."],
      ["The RSA keys are moved to ROM bootstrap memory and automatically re-enable `ip ssh version 2` after the reload.", "RSA keys are stored in hidden Flash memory (not ROM), and the `running-config` commands (`hostname`, `ip ssh version 2`) are lost if unsaved."]
    ],
    "When you execute `crypto key generate rsa`, Cisco IOS immediately writes the generated public and private RSA keys into a hidden file in Flash memory rather than storing them inside `running-config` or `startup-config`. Even if the switch reloads without saving config, those keys remain in Flash (verifiable via `show crypto key mypubkey rsa`) until explicitly deleted with `crypto key zeroize rsa`.",
    "RSA keys are stored in a hidden file in Flash (not in `running-config`/`startup-config`) and persist across reloads.",
    ["crypto key generate rsa", "show crypto key mypubkey rsa"]
  )
];

// ============================================================================
// v1c07 - Configuring and Verifying Switch Interfaces (15 questions: 4 Easy, 7 Medium, 4 Hard)
// ============================================================================
const c07 = mk("Network Access", 20, "v1c07");
const q07 = [
  c07.s(
    "Switch interfaces", "Easy",
    "Which Global Configuration command allows an engineer to apply the same interface subcommands (such as `shutdown` or `description`) simultaneously to ports FastEthernet 0/11 through FastEthernet 0/20?",
    "interface range fastethernet 0/11 - 20",
    [
      ["interface group fastethernet 0/11 to 0/20", "Cisco IOS uses the keyword `interface range` with a hyphen (`-`), not `interface group ... to`."],
      ["interface multiple fastethernet 0/11 - 0/20", "Cisco IOS uses `interface range` (and after the hyphen, only the ending port number `20` is typed, not `multiple`)."],
      ["interface channel-group 11-20 mode on", "`channel-group` configures an EtherChannel bundle (up to 8 active ports) from within an existing interface mode, not a multi-port range prompt."]
    ],
    "The `interface range` Global Configuration command (for example, `interface range FastEthernet 0/11 - 20`) enters `(config-if-range)#` mode. Any interface subcommands entered in this mode are applied to every interface in the specified range and appear under each individual interface in `show running-config`.",
    "Use `interface range <type> <slot>/<first> - <last>` in Global Config mode to configure multiple ports at once.",
    ["interface range"]
  ),
  c07.s(
    "Switch interfaces", "Easy",
    "When viewing `show interfaces status` on a Catalyst switch, how can you tell whether port Gi0/1's speed and duplex were learned via IEEE 802.3u autonegotiation versus configured manually?",
    "Autonegotiated values display the `a-` prefix such as `a-full` and `a-100`, whereas manually configured values omit the `a-` prefix.",
    [
      ["Autonegotiated values are printed in lowercase letters, whereas manually configured values are printed in uppercase like `FULL` and `100M`.", "`show interfaces status` always uses lowercase (`full` vs `a-full`); the `a-` prefix is what indicates autonegotiation."],
      ["Autonegotiated ports show `connected` in the Status column, whereas manually configured ports show `static` in the Status column.", "The Status column shows `connected`, `notconnect`, `disabled`, or `err-disabled` regardless of whether speed/duplex are manual or automatic."],
      ["Autonegotiated ports display `auto` in the Duplex and Speed columns even after the link comes up and negotiates 1000 Mbps.", "`auto` is displayed only when the port is down (`notconnect` or `disabled`); once `connected`, negotiated values show `a-full`/`a-1000`."]
    ],
    "In `show interfaces status`, when a port is `connected`, the Duplex and Speed columns prefix values with `a-` (for example, `a-full`, `a-1000`) if the result was obtained through autonegotiation (including autonegotiation fallback rules). If `speed` or `duplex` was manually hardcoded on that switch port, the `a-` prefix is omitted (`full`, `100`).",
    "In `show interfaces status`: `a-full` / `a-100` = autonegotiated (or fallback); `full` / `100` = manually configured.",
    ["show interfaces status", "speed", "duplex"]
  ),
  c07.s(
    "Switch interfaces", "Easy",
    "What is the exact minimum size threshold that defines a **runt** frame and the maximum size threshold that defines a **giant** frame in Cisco switch interface error counters (excluding 802.1Q VLAN tags)?",
    "Runt: smaller than 64 bytes; Giant: larger than 1518 bytes",
    [
      ["Runt: smaller than 46 bytes; Giant: larger than 1500 bytes", "46 to 1500 bytes is the size range of the Ethernet Data payload alone; including the 18-byte L2 header and FCS trailer, valid frames are 64 to 1518 bytes."],
      ["Runt: smaller than 18 bytes; Giant: larger than 9000 bytes", "18 bytes is only the L2 header/trailer with zero data, and 9000 bytes refers to jumbo frames rather than standard IEEE 802.3 giants (>1518 bytes)."],
      ["Runt: smaller than 64 bits; Giant: larger than 1518 bits", "Ethernet frame sizes are measured in **bytes** (64 bytes = 512 bits, 1518 bytes = 12,144 bits), not bits."]
    ],
    "Including the 14-byte Ethernet header and 4-byte FCS trailer (18 bytes total), a valid untagged IEEE 802.3 frame must be at least 64 bytes and at most 1518 bytes. Frames smaller than 64 bytes (often caused by collisions) increment the **runts** counter, and frames larger than 1518 bytes increment the **giants** counter.",
    "Runts < 64 bytes; Giants > 1518 bytes (for untagged frames).",
    ["show interfaces"]
  ),
  c07.s(
    "Switch interfaces", "Easy",
    "Which interface subcommand administratively disables a switch port, and which command re-enables it?",
    "`shutdown` disables the port; `no shutdown` re-enables the port",
    [
      ["`disable` disables the port; `enable` re-enables the port", "`enable` and `disable` switch between User EXEC (`>`) and Privileged EXEC (`#`) modes, not interface administrative states."],
      ["`port down` disables the port; `port up` re-enables the port", "Cisco IOS uses `shutdown` and `no shutdown` in Interface Configuration mode rather than `port down`/`port up`."],
      ["`errdisable` disables the port; `clear errdisable` re-enables the port", "The `err-disabled` state is triggered automatically by IOS when a violation (like port security) occurs; administrative control uses `shutdown` / `no shutdown`."]
    ],
    "In Interface Configuration mode (`(config-if)#`), issuing `shutdown` administratively disables the port (`disabled` in `show interfaces status`, `administratively down, line protocol is down` in `show interfaces`). Issuing `no shutdown` brings the port back online.",
    "`shutdown` -> `disabled` (`administratively down/down`); `no shutdown` -> re-enables the interface (and clears `err-disabled` after shutting down first).",
    ["shutdown", "no shutdown"]
  ),
  c07.s(
    "Switch interfaces", "Medium",
    "Port Gi0/1 on Switch SW1 is left at its default settings (`speed auto`, `duplex auto`), while the attached PC's NIC has both speed and duplex manually hardcoded to `100` Mbps and `full` duplex (disabling autonegotiation on the PC). What speed and duplex will SW1's Gi0/1 port use, and what problem results?",
    "SW1 senses the 100 Mbps speed from electrical signals and defaults to `half` duplex (`a-half`, `a-100`), causing a duplex mismatch.",
    [
      ["SW1 fails to sense the speed and shuts the port down into the `notconnect` state because autonegotiation messages received no reply.", "A switch port set to `speed auto` can still sense the incoming electrical line speed (100 Mbps) even when the peer does not send autonegotiation messages."],
      ["SW1 defaults to its slowest supported speed of 10 Mbps and `full` duplex (`a-full`, `a-10`), causing a speed mismatch.", "SW1 successfully senses the 100 Mbps speed without falling back to 10 Mbps, and IEEE fallback rules for 10/100 Mbps always select **half** duplex, not full duplex."],
      ["SW1 detects the full-duplex transmissions on both wire pairs and automatically matches `100` Mbps and `full` duplex.", "Without IEEE 802.3u autonegotiation messages, a device cannot detect the neighbor's duplex setting and must apply the IEEE default (half duplex for 10/100 Mbps)."]
    ],
    "When one device manually configures both speed and duplex (which disables IEEE 802.3u autonegotiation on that device) and the other device uses `auto`, the `auto` device senses the speed from the electrical signal (100 Mbps) but must guess the duplex using IEEE fallback rules: **half duplex** for 10 or 100 Mbps, and **full duplex** for 1000 Mbps. This leaves SW1 at 100/half (`a-half`, `a-100`) and the PC at 100/full—a classic duplex mismatch.",
    "When autonegotiation fails on one side: Speed is sensed (or defaults to 10 Mbps); Duplex defaults to **half** for 10/100 Mbps and **full** for 1000 Mbps.",
    ["show interfaces status", "speed", "duplex"]
  ),
  c07.s(
    "Switch interfaces", "Medium",
    "In a link with a duplex mismatch (Switch SW1 at 100/half and Switch SW2 at 100/full), which interface error counter specifically increments on the half-duplex side (SW1) to reveal the duplex mismatch?",
    "Late collisions — incremented when collisions occur after 64 bytes alongside CRC errors",
    [
      ["Giants — incremented when full-duplex frames from SW2 exceed the 1518-byte frame limit", "Full-duplex and half-duplex Ethernet have the exact same 1518-byte maximum frame size; duplex mismatches do not create giant frames."],
      ["Administratively down — incremented when SW1 repeatedly disables the port with `shutdown`", "A duplex mismatch leaves both ports in the `connected` (`up/up`) state; it simply degrades performance via collisions and CRC errors."],
      ["Output drops on SW2 — incremented when the full-duplex port pauses for SW1 transmissions", "The full-duplex side (SW2) has CSMA/CD disabled and never pauses when SW1 transmits; instead, SW2 sends freely, causing late collisions on SW1."]
    ],
    "In a duplex mismatch, the full-duplex side transmits at any time without listening first, even when the half-duplex side is already halfway through sending a frame. When a collision occurs after the 64th byte of a frame has been transmitted, the half-duplex interface increments its **late collisions** counter—a telltale signature of a duplex mismatch.",
    "Rising **late collisions** (collisions occurring after 64 bytes) on a half-duplex port (`a-half` or `half`) is the classic sign of a duplex mismatch.",
    ["show interfaces"]
  ),
  c07.s(
    "Switch interfaces", "Medium",
    "A 10/100/1000 switch port with default settings (`speed auto`, `duplex auto`) is connected with a working cable to an old Layer 1 Ethernet hub. Because hubs do not forward or respond to IEEE 802.3u autonegotiation messages and send no idle link pulses before hosts transmit, what speed and duplex does the switch port choose?",
    "10 Mbps and half duplex — displayed as `a-half` and `a-10` in port status",
    [
      ["100 Mbps and half duplex — displayed as `a-half` and `a-100` in port status", "When a switch cannot sense the speed and receives no autonegotiation messages, IEEE rules require falling back to the **slowest** supported speed (10 Mbps)."],
      ["1000 Mbps and full duplex — displayed as `a-full` and `a-1000` in port status", "Without autonegotiation or speed sensing, a 10/100/1000 port falls back to its slowest speed (10 Mbps) and half duplex, not 1000/full."],
      ["Error-disabled state — displayed as `err-disabled` in interface status", "Connecting a single hub cable to a switch port does not trigger `err-disabled`; the port simply negotiates 10 Mbps and half duplex."]
    ],
    "LAN hubs do not participate in IEEE 802.3u autonegotiation and do not forward autonegotiation messages between attached devices. When a switch port with `speed auto` and `duplex auto` receives no autonegotiation messages and cannot sense the link speed, it defaults to its **slowest supported speed** (10 Mbps on a 10/100 or 10/100/1000 port) and uses the IEEE duplex rule for 10 Mbps (**half duplex**).",
    "No autonegotiation + cannot sense speed (e.g., connected to a hub) -> slowest speed (10 Mbps) + half duplex (`a-half`, `a-10`).",
    ["show interfaces status"]
  ),
  c07.s(
    "Switch interfaces", "Medium",
    "Port Fa0/1 on SW1 is manually configured with `speed 100` and `duplex full`, while the connected port Fa0/1 on SW2 is manually configured with `speed 10` and `duplex full`. What status will `show interfaces status` report on both switches?",
    "`notconnect` (`down, line protocol is down`), because a speed mismatch prevents Layer 1 link activation.",
    [
      ["`connected` (`up, line protocol is up`), with SW2 buffering the excess 90 Mbps of traffic in RAM.", "Unlike a duplex mismatch (where the link stays `connected`), a speed mismatch prevents the two interfaces from synchronizing at Layer 1, leaving both `notconnect` (`down/down`)."],
      ["`disabled` (`administratively down, line protocol is down`), because IOS automatically applies `shutdown` on speed mismatches.", "`disabled` (`administratively down`) occurs only when an administrator configures `shutdown` on the interface."],
      ["`err-disabled` (`down, line protocol is down (err-disabled)`), because manual speed mismatches trigger port security.", "A speed mismatch is a Layer 1 physical signaling mismatch and results in `notconnect` (`down/down`), not `err-disabled`."]
    ],
    "Whereas a duplex mismatch still allows both interfaces to come up (`connected` / `up/up`) and pass frames poorly, a **speed mismatch** prevents the two NICs from understanding each other's electrical clock encoding at Layer 1. Consequently, both ports remain in the `notconnect` (`down, line protocol is down`) state.",
    "Speed mismatch = link fails to come up (`notconnect` / `down/down`). Duplex mismatch = link comes up (`connected` / `up/up`) but suffers late collisions/CRC errors.",
    ["show interfaces status", "speed"]
  ),
  c07.s(
    "Switch interfaces", "Medium",
    "When troubleshooting fiber-optic cabling connected to a switch port that is stuck in `notconnect` (or suffering severe attenuation), what physical installation error is described by the term **macrobending**?",
    "Bending a fiber-optic cable tighter than its minimum bend radius so light leaks out of the core into the cladding.",
    [
      ["Plugging the two fiber strands into the wrong SFP slots so that Transmit (Tx) connects to Transmit (Tx) instead of Receive (Rx).", "Connecting Tx to Tx and Rx to Rx is a reversed fiber pair (pinout error), not macrobending."],
      ["Inserting a multimode LED SFP transceiver at one end of a link and a single-mode laser SFP transceiver at the other end.", "Mixing multimode and single-mode transceivers is a wavelength/transceiver mismatch rather than macrobending."],
      ["Untwisting copper UTP wire pairs more than half an inch from the RJ-45 connector clip during termination.", "Untwisting copper pairs causes near-end crosstalk (NEXT) on UTP cables, whereas macrobending applies specifically to fiber-optic cables."]
    ],
    "Fiber-optic cables rely on internal reflection to keep light beams bouncing inside the fiberglass core. If an installer bends a fiber cable at too sharp an angle (**macrobending**), the angle of incidence changes so that light escapes through the core-cladding boundary, causing high signal loss (attenuation) or complete link failure.",
    "Macrobending = bending a fiber-optic cable too tightly, causing light loss (attenuation) or `notconnect`.",
    []
  ),
  c07.t(
    "Switch interfaces", "Medium",
    "Match each `show interfaces status` port state to the corresponding two-part status displayed by `show interfaces <id>`.",
    [
      ["connected", "Interface is up, line protocol is up"],
      ["notconnect", "Interface is down, line protocol is down"],
      ["disabled", "Interface is administratively down, line protocol is down"],
      ["err-disabled", "Interface is down, line protocol is down (err-disabled)"]
    ],
    "Cisco switches report interface states in two formats: a single status word in `show interfaces status` and a dual status (`<line status>, line protocol is <protocol status>`) in `show interfaces`: `connected` = `up/up`, `notconnect` = `down/down`, `disabled` = `administratively down/down` (from `shutdown`), and `err-disabled` = `down/down (err-disabled)`.",
    "Memorize the 4 switch port state pairs: `connected` (`up/up`), `notconnect` (`down/down`), `disabled` (`administratively down/down`), `err-disabled` (`down/down (err-disabled)`).",
    ["show interfaces status", "show interfaces"]
  ),
  c07.d(
    "Switch interfaces", "Medium",
    "Order the steps an engineer must perform to recover a switch port (`Gi0/2`) that has been placed into the `err-disabled` state after fixing the underlying root cause.",
    [
      "Verify that `Gi0/2` is in the `err-disabled` state using `show interfaces status` or `show interfaces Gi0/2`",
      "Enter Global Configuration mode (`configure terminal`) and select the interface (`interface GigabitEthernet 0/2`)",
      "Issue the `shutdown` command to transition the port from `err-disabled` to `disabled` (`administratively down`)",
      "Issue the `no shutdown` command to re-enable the port and bring it back to `connected` (`up/up`)"
    ],
    "When Cisco IOS places an interface into the `err-disabled` state (for example, due to a port security violation or EtherChannel STP misconfiguration), simply typing `no shutdown` alone does not reset the port. After fixing the root problem, you must first issue `shutdown` on the interface and then follow it with `no shutdown`.",
    "Recovering an `err-disabled` port requires BOTH `shutdown` and then `no shutdown` under the interface.",
    ["show interfaces status", "shutdown", "no shutdown"]
  ),
  c07.m(
    "Switch interfaces", "Hard",
    "Examine the CLI output below from `SW1`. Based on the status and counters shown for `Fa0/1` and `Fa0/2`, which conclusions are accurate?",
    [
      "On `Fa0/1`, speed and duplex were manually set to `100` and `full`, while `Fa0/2` got `a-half` and `a-100` via fallback.",
      "`Fa0/2` has a duplex mismatch with its neighbor, shown by its `a-half` setting, 85 CRC errors, and 42 late collisions."
    ],
    [
      ["`Fa0/1` is connected to a legacy 10BASE-T hub because its speed and duplex values lack the `a-` prefix.", "Omitting the `a-` prefix on `Fa0/1` (`full` and `100`) means speed and duplex were manually configured on `Fa0/1`, not that it is attached to a 10BASE-T hub."],
      ["`Fa0/2` has an incorrect crossover copper cable pinout that prevented Layer 1 link signaling from synchronizing.", "A wrong cable pinout would keep `Fa0/2` in the `notconnect` state; `Fa0/2` is `connected` at `a-100` and `a-half` with late collisions, indicating a duplex mismatch."],
      ["`Fa0/3` was automatically shut down by port security and requires both `shutdown` and `no shutdown` to clear `err-disabled`.", "`Fa0/3` shows `disabled` (caused by an administrative `shutdown` command), not `err-disabled`; it requires only `no shutdown` to enable."]
    ],
    "In `show interfaces status`, `Fa0/1` displays `full` and `100` (no `a-`), proving its speed and duplex were hardcoded manually. `Fa0/2` displays `a-half` and `a-100` (`connected`) while `show interfaces Fa0/2` shows 85 input errors / 85 CRC errors and 42 late collisions—classic proof that `Fa0/2` fell back to half duplex because the remote peer disabled autonegotiation and hardcoded `100/full`.",
    "Look for `a-half` + `late collisions` + `CRC` errors in CLI output to spot a duplex mismatch on the half-duplex side.",
    ["show interfaces status", "show interfaces"],
    {
      cli: "SW1# show interfaces status\nPort      Name               Status       Vlan       Duplex  Speed Type\nFa0/1     Uplink-R1          connected    1          full    100   10/100BaseTX\nFa0/2     Server-NIC         connected    1          a-half  a-100 10/100BaseTX\nFa0/3     Unused             disabled     1          auto    auto  10/100BaseTX\n\nSW1# show interfaces Fa0/2 | include errors|collisions\n     85 input errors, 85 CRC, 0 frame, 0 overrun, 0 ignored\n     0 output errors, 110 collisions, 0 interface resets\n     42 late collision, 0 deferred, 0 lost carrier, 0 no carrier"
    }
  ),
  c07.s(
    "Switch interfaces", "Hard",
    "In the output of `show interfaces Fa0/2`, the line `85 input errors, 85 CRC, 0 frame, 0 overrun, 0 ignored` appears. How does the `input errors` counter relate to `runts`, `giants`, `CRC`, and `frame` counters?",
    "`input errors` is an umbrella counter that sums specific incoming error types including runts, giants, CRC, frame, overrun, and ignored.",
    [
      ["`input errors` counts only Physical layer voltage spikes, whereas `CRC` counts Data Link errors separately without adding to `input errors`.", "Every frame that fails the FCS check increments both the `CRC` counter and the umbrella `input errors` counter."],
      ["`input errors` counts frames dropped by outbound QoS hardware queues whenever the switch egress port becomes congested.", "Outbound congestion drops are counted under output drops/output errors, whereas `input errors` tracks corrupted or malformed incoming frames."],
      ["`input errors` is incremented only when a frame has an illegal byte alignment `frame` error, ignoring valid-length CRC failures.", "`frame` errors are just one subset of `input errors`; a standard CRC error (even with legal byte alignment) also increments `input errors`."]
    ],
    "On Cisco switches, `input errors` is an aggregate (umbrella) counter that sums multiple specific categories of received frame errors—including runts, giants, no buffer, CRC (failed FCS check), frame (illegal byte alignment ending on a partial byte), overrun, and ignored counts.",
    "`input errors` = total sum of incoming error types (runts + giants + CRC + frame + no buffer + overrun + ignored).",
    ["show interfaces"]
  ),
  c07.s(
    "Switch interfaces", "Hard",
    "An engineer configures `speed 100` and `duplex full` on interface `Gi0/1` of a Catalyst switch, and later decides to return both settings and the port's `description` back to their factory defaults. Which interface subcommands restore those defaults?",
    "`no speed`, `no duplex`, and `no description` on `Gi0/1`",
    [
      ["`speed default`, `duplex default`, and `description none`", "Cisco IOS reverts interface subcommands using the `no` prefix (`no speed`, `no duplex`, `no description`) rather than a `default` or `none` parameter."],
      ["`clear speed`, `clear duplex`, and `clear description`", "`clear` is an EXEC mode command used to reset dynamic tables or counters, not an interface configuration command."],
      ["`erase interface Gi0/1` in Interface Configuration mode", "There is no `erase interface` command in Cisco IOS; use `no speed`, `no duplex`, and `no description` under `interface Gi0/1`."]
    ],
    "In Cisco IOS Interface Configuration mode, prefixing `no` to `speed`, `duplex`, or `description` (`no speed`, `no duplex`, `no description`) removes the manual override and restores the default setting (`speed auto`, `duplex auto`, and an empty description).",
    "Revert interface speed, duplex, or description to defaults with `no speed`, `no duplex`, and `no description`.",
    ["no speed", "no duplex", "no description"]
  ),
  c07.s(
    "Switch interfaces", "Hard",
    "Switch port `Gi0/5` is administratively enabled (`no shutdown` is active), yet `show interfaces status` shows `notconnect` (`Gi0/5 is down, line protocol is down`). Which situation could NOT be the cause of this `notconnect` state?",
    "A duplex mismatch where `Gi0/5` is set to `100/full` and the connected PC is set to `100/half`",
    [
      ["The neighbor switch port at the far end of the cable has been administratively disabled with `shutdown`.", "When the remote neighbor port is `disabled` (`shutdown`), it stops sending Layer 1 electrical/optical signals, causing the local port (`Gi0/5`) to show `notconnect`."],
      ["A straight-through copper cable was used between two switches that both have Auto-MDIX disabled.", "Using the wrong cable pinout when Auto-MDIX is disabled prevents Layer 1 link pulses from reaching the receiver pins, resulting in `notconnect`."],
      ["`Gi0/5` is hardcoded to `speed 1000` while the attached device only supports 10/100 Mbps Fast Ethernet.", "A speed mismatch prevents Layer 1 link negotiation and leaves both interfaces in the `notconnect` (`down/down`) state."]
    ],
    "A `notconnect` (`down/down`) state indicates a Layer 1 failure: no cable, damaged cable, wrong cable pinout (without Auto-MDIX), speed mismatch, or a remote neighbor that is powered off, `shutdown` (`disabled`), or `err-disabled`. By contrast, a **duplex mismatch** with matching speeds (`100/full` vs `100/half`) does NOT cause `notconnect`—both ports come up (`connected` / `up/up`) and pass traffic poorly with collisions.",
    "`notconnect` can be caused by bad/missing cable, wrong pinout, speed mismatch, or remote port `shutdown`/`err-disabled`—NEVER by a pure duplex mismatch.",
    ["show interfaces status"]
  )
];

// ============================================================================
// v1c08 - Implementing Ethernet Virtual LANs (15 questions: 4 Easy, 7 Medium, 4 Hard)
// ============================================================================
const c08 = mk("Network Access", 20, "v1c08");
const q08 = [
  c08.s(
    "VLANs", "Easy",
    "What is the total usable range of VLAN IDs supported by the 12-bit VLAN ID field in an IEEE 802.1Q header, and how is it split between normal-range and extended-range VLANs?",
    "Total usable: 1 to 4094; Normal range: 1 to 1005; Extended range: 1006 to 4094",
    [
      ["Total usable: 0 to 4095; Normal range: 0 to 1023; Extended range: 1024 to 4095", "Although \(2^{12} = 4096\) values (0 to 4095), VLANs 0 and 4095 are reserved, and the normal/extended boundary is at 1005/1006, not 1023/1024."],
      ["Total usable: 1 to 1005; Normal range: 1 to 1001; Extended range: 1002 to 1005", "VLANs 1002 to 1005 are default reserved FDDI/Token Ring VLANs inside the normal range (1-1005), whereas the extended range is 1006 to 4094."],
      ["Total usable: 1 to 65534; Normal range: 1 to 4094; Extended range: 4095 to 65534", "The 802.1Q VLAN ID field is 12 bits long (not 16 bits), so the maximum usable VLAN ID is 4094."]
    ],
    "The IEEE 802.1Q trunking header uses a 12-bit VLAN ID field (\(2^{12} = 4096\) values). Because 0 and 4095 are reserved, switches support 4094 usable VLANs (1 to 4094), divided into the **normal range** (1 to 1005, where 1 and 1002-1005 are precreated defaults) and the **extended range** (1006 to 4094).",
    "12-bit VLAN ID = 1..4094 usable (0 and 4095 reserved); Normal = 1..1005; Extended = 1006..4094.",
    ["show vlan brief"]
  ),
  c08.s(
    "Trunking", "Easy",
    "How does IEEE 802.1Q trunking handle frames belonging to the trunk's **native VLAN** (default VLAN 1)?",
    "It sends native VLAN frames across the trunk without adding a 4-byte 802.1Q tag.",
    [
      ["It encapsulates native VLAN frames inside a 26-byte ISL header and 4-byte ISL trailer.", "ISL is an obsolete Cisco proprietary trunking protocol; 802.1Q never uses ISL encapsulation."],
      ["It tags native VLAN frames with reserved VLAN ID 0 inside the 4-byte 802.1Q header.", "802.1Q leaves native VLAN frames completely untagged (no 4-byte 802.1Q header is inserted)."],
      ["It blocks native VLAN frames from crossing the trunk unless VTP pruning is disabled.", "The native VLAN is allowed and forwarded across an 802.1Q trunk by default; its frames simply travel untagged."]
    ],
    "For all non-native VLANs, IEEE 802.1Q inserts a 4-byte VLAN tag header (after the Source MAC field) and recalculates the FCS trailer. However, for one designated VLAN per trunk—the **native VLAN** (which defaults to VLAN 1)—802.1Q does not insert a 4-byte tag, allowing both ends of the trunk to assume any untagged frame belongs to the native VLAN.",
    "802.1Q inserts a 4-byte tag for all VLANs except the native VLAN (default VLAN 1), which travels untagged.",
    ["switchport trunk native vlan", "show interfaces trunk"]
  ),
  c08.s(
    "DTP/VTP", "Easy",
    "Which VTP mode is required on a Catalyst switch if an engineer needs to configure extended-range VLANs (VLAN IDs 1006 through 4094)?",
    "VTP transparent mode or VTP off mode",
    [
      ["Default VTP server operating mode", "Switches in VTP server mode (using VTPv1 or VTPv2) can configure only normal-range VLANs (1 to 1005), not extended-range VLANs (1006 to 4094)."],
      ["VTP client mode synchronized to a server", "Switches in VTP client mode cannot create, modify, or delete any VLANs locally from the CLI."],
      ["VTP dynamic desirable negotiation mode", "`dynamic desirable` is a Dynamic Trunking Protocol (DTP) interface mode, not a VLAN Trunking Protocol (VTP) switch mode."]
    ],
    "Catalyst switches running in VTP `server` or `client` mode (in VTPv1/v2) support only normal-range VLANs (1 to 1005). To create or modify extended-range VLANs (1006 to 4094), the switch must first be set to `vtp mode transparent` (or `vtp mode off`).",
    "Extended-range VLANs (1006-4094) require `vtp mode transparent` (or `vtp mode off`).",
    ["vtp mode transparent", "vtp mode off", "show vtp status"]
  ),
  c08.s(
    "VLANs", "Easy",
    "How do VLANs, Layer 2 broadcast domains, and IPv4 subnets relate to one another in standard enterprise campus LAN design?",
    "Each VLAN forms a separate Layer 2 broadcast domain and maps one-to-one to its own unique IPv4 subnet across the LAN.",
    [
      ["All VLANs on a single physical switch share one IPv4 subnet and one default gateway, separated only by MAC filtering.", "Hosts in different VLANs cannot communicate at Layer 2 and must be placed in separate IP subnets routed by a Layer 3 device."],
      ["A single VLAN typically spans four or five IPv4 subnets so that Layer 2 switches can route packets between departments.", "Layer 2 switches cannot route between subnets; best practice maps one VLAN to one broadcast domain and one IP subnet."],
      ["Broadcast frames flooded in VLAN 10 are automatically forwarded into VLAN 20 whenever both VLANs traverse an 802.1Q trunk.", "An 802.1Q trunk keeps VLAN broadcast domains strictly separate by tagging each frame with its VLAN ID."]
    ],
    "A VLAN is a logical Layer 2 broadcast domain: frames flooded in VLAN 10 reach only ports in VLAN 10. Because devices in different VLANs cannot reach each other directly at Layer 2 and require a router (or Layer 3 switch) to communicate, every VLAN must be assigned its own separate IP subnet (1 VLAN = 1 broadcast domain = 1 subnet).",
    "1 VLAN = 1 Layer 2 broadcast domain = 1 IP subnet (inter-VLAN traffic requires routing).",
    []
  ),
  c08.s(
    "VLANs", "Medium",
    "An engineer enters `interface Gi0/4`, `switchport mode access`, and `switchport access vlan 50` on a switch where VLAN 50 has never been created. What does Cisco IOS do?",
    "It automatically creates VLAN 50 in the VLAN database and assigns interface Gi0/4 to VLAN 50.",
    [
      ["It rejects the command with an error and leaves Gi0/4 assigned to default VLAN 1 until `vlan 50` is created globally.", "Cisco IOS automatically creates the missing VLAN when you assign an access port to it with `switchport access vlan 50`."],
      ["It places Gi0/4 into the `err-disabled` state until a VTP server advertises VLAN 50 across a trunk port.", "Assigning a nonexistent VLAN to an access port on a VTP server/transparent switch simply auto-creates the VLAN rather than err-disabling the port."],
      ["It converts Gi0/4 into an 802.1Q trunk port so that VLAN 50 can be dynamically negotiated via DTP.", "`switchport access vlan 50` never changes an access port into a trunk; it creates VLAN 50 and assigns the access port to it."]
    ],
    "While you can explicitly create a VLAN in Global Configuration mode using `vlan 50` (and optionally name it with `name ...`), assigning an access port to a nonexistent VLAN using `switchport access vlan 50` causes Cisco IOS to automatically create VLAN 50 with its default name (`VLAN0050`).",
    "`switchport access vlan <x>` automatically creates VLAN `<x>` if it does not already exist on the switch.",
    ["switchport mode access", "switchport access vlan", "show vlan brief"]
  ),
  c08.s(
    "VLANs", "Medium",
    "A desk PC is plugged into a Cisco IP Phone, and the IP Phone is connected by a single UTP patch cable to switch port `Gi0/2`. How is `Gi0/2` configured and how are frames carried across that single cable?",
    "`Gi0/2` is an access port with `switchport access vlan` and `switchport voice vlan`; PC frames are untagged and voice frames use 802.1Q.",
    [
      ["`Gi0/2` is configured with `switchport mode trunk` and `switchport nonegotiate` so the PC's NIC can tag its own data frames.", "A port connected to an IP Phone + PC is configured with `switchport mode access` (plus `switchport voice vlan`), not `switchport mode trunk`, and the PC sends untagged frames."],
      ["`Gi0/2` uses two wire pairs for the PC's VLAN and the other two wire pairs for the phone's VLAN without using any 802.1Q tags.", "Both the PC and the phone share the same physical Ethernet link through the phone's internal 3-port switch; separation is achieved via 802.1Q tagging of the voice VLAN."],
      ["Both the PC's data frames and the IP Phone's voice frames travel untagged across `Gi0/2`, and the switch separates them by TCP port number.", "Layer 2 switches do not assign VLANs by TCP port number; the IP Phone learns the voice VLAN via CDP and tags its voice frames with an 802.1Q header."]
    ],
    "A Cisco IP Phone contains an integrated 3-port mini-switch (uplink to the Catalyst switch, internal port to the phone CPU, and access port to the attached PC). You configure the Catalyst switch port as an access port (`switchport mode access`, `switchport access vlan <data-vlan>`) and add `switchport voice vlan <voice-vlan>`. Using CDP, the switch tells the phone to send its voice traffic tagged with an 802.1Q header for the voice VLAN while passing the PC's frames untagged in the data access VLAN.",
    "Access port with IP Phone + PC: configure `switchport mode access`, `switchport access vlan <D>`, and `switchport voice vlan <V>` (requires CDP enabled).",
    ["switchport mode access", "switchport access vlan", "switchport voice vlan", "show interfaces switchport"]
  ),
  c08.s(
    "VLANs", "Medium",
    "An engineer configures `switchport voice vlan 20` on access port `Gi0/2` (which has `switchport access vlan 10`). Which statement is true when verifying `Gi0/2` with `show` commands?",
    "`Gi0/2` is omitted from `show interfaces trunk` and listed under both VLAN 10 and VLAN 20 in `show vlan brief`.",
    [
      ["`Gi0/2` is listed as an `802.1q` trunk in `show interfaces trunk` because it sends 802.1Q-tagged frames for VLAN 20.", "Cisco IOS still treats an access port with a voice VLAN as an access port, so it is NEVER listed in `show interfaces trunk`."],
      ["`Gi0/2` is removed from VLAN 10 in `show vlan brief` and listed only under VLAN 20 once the IP Phone boots.", "`show vlan brief` lists `Gi0/2` under BOTH the data access VLAN (VLAN 10) and the voice VLAN (VLAN 20)."],
      ["`show interfaces Gi0/2 switchport` reports `Administrative Mode: trunk` and `Operational Mode: trunk`.", "`show interfaces Gi0/2 switchport` still reports `Administrative Mode: static access` and `Operational Mode: static access` (with `Voice VLAN: 20`)."]
    ],
    "Even though an access port configured with `switchport voice vlan 20` carries untagged frames for the data VLAN (10) and 802.1Q-tagged frames for the voice VLAN (20), Cisco IOS classifies it as a static access port rather than a trunk. Therefore, `show interfaces trunk` omits `Gi0/2`, `show vlan brief` lists `Gi0/2` in both VLAN 10 and VLAN 20, and `show interfaces Gi0/2 switchport` (or `show interfaces Gi0/2 trunk`) shows the details.",
    "An access port with a voice VLAN does NOT appear in `show interfaces trunk`, but DOES appear under both the data and voice VLANs in `show vlan brief`.",
    ["show interfaces switchport", "show vlan brief", "show interfaces trunk"]
  ),
  c08.s(
    "DTP/VTP", "Medium",
    "Two Cisco Catalyst switches are connected on port `Gi0/1`. If both switches are left at their default DTP administrative mode (`switchport mode dynamic auto`), what operational mode results on the link?",
    "Both ports operate as static access ports because neither `dynamic auto` interface actively initiates DTP trunk negotiation.",
    [
      ["Both ports operate as **802.1Q trunks** since Cisco switches default to trunking whenever connected to another switch.", "When both ends are `dynamic auto`, neither end actively initiates DTP trunk negotiation, so the link settles into an access port (`static access`)."],
      ["The link stays in the `notconnect` state until at least one side is configured with `switchport trunk encapsulation dot1q`.", "Two `dynamic auto` ports come up (`connected`) and pass traffic in VLAN 1 as access ports without needing manual trunk configuration."],
      ["The switch with the lower Spanning Tree Bridge ID forces the link into a trunk while the higher BID switch becomes an access port.", "DTP does not use Spanning Tree Bridge IDs; `dynamic auto` + `dynamic auto` always results in both sides operating as access ports."]
    ],
    "Dynamic Trunking Protocol (DTP) has two dynamic modes: `dynamic desirable` (actively initiates trunking) and `dynamic auto` (passively waits for the neighbor to ask to trunk). If both ends of a link are set to `dynamic auto` (the default on many Catalyst switches), neither side initiates trunking and both ports become access ports. If at least one side is `dynamic desirable` (or `trunk`), the link becomes a trunk.",
    "DTP combinations: `auto` + `auto` = **access**; `auto` + `desirable` = **trunk**; `desirable` + `desirable` = **trunk**.",
    ["switchport mode dynamic auto", "switchport mode dynamic desirable", "show interfaces switchport"]
  ),
  c08.s(
    "Trunking", "Medium",
    "On a Catalyst switch that supports both ISL and 802.1Q trunking, an engineer enters `switchport mode trunk` on `Gi0/1` and receives the error `Command rejected: An interface whose trunk encapsulation is \"Auto\" can not be configured to \"trunk\" mode`. Which command must be entered first?",
    "`switchport trunk encapsulation dot1q` under `Gi0/1`",
    [
      ["`switchport nonegotiate` under interface `Gi0/1`", "`switchport nonegotiate` can only be applied *after* the interface is already placed into `switchport mode trunk` or `switchport mode access`."],
      ["`vtp mode transparent` in Global Configuration mode", "VTP mode controls VLAN database synchronization and extended VLAN creation, not whether a port's trunk encapsulation is set."],
      ["`switchport trunk native vlan 1` under interface `Gi0/1`", "Setting the native VLAN does not change the trunk encapsulation type from `negotiate`/`auto` to `dot1q`."]
    ],
    "On switches that support only 802.1Q (such as the Catalyst 2960), `switchport mode trunk` works immediately. However, on multilayer switches that support both ISL and 802.1Q, the default encapsulation is `negotiate` (`Auto`), so you must first specify `switchport trunk encapsulation dot1q` before IOS will accept `switchport mode trunk`.",
    "If `switchport mode trunk` is rejected due to `Auto` encapsulation, run `switchport trunk encapsulation dot1q` first.",
    ["switchport trunk encapsulation dot1q", "switchport mode trunk"]
  ),
  c08.t(
    "Trunking", "Medium",
    "Match each `switchport trunk allowed vlan` subcommand option to its exact effect on an 802.1Q trunk's allowed VLAN list.",
    [
      ["switchport trunk allowed vlan 10,20", "Overwrites the entire allowed list so that ONLY VLANs 10 and 20 are permitted on the trunk"],
      ["switchport trunk allowed vlan add 30", "Appends VLAN 30 to the currently configured allowed VLAN list without removing existing VLANs"],
      ["switchport trunk allowed vlan remove 10", "Deletes VLAN 10 from the currently configured allowed VLAN list while keeping all other allowed VLANs"],
      ["switchport trunk allowed vlan all", "Resets the trunk to allow all usable VLANs (1 through 4094)"],
      ["switchport trunk allowed vlan except 99", "Allows all VLANs from 1 through 4094 except VLAN 99"]
    ],
    "When modifying the allowed VLAN list on a trunk, omitting `add`/`remove`/`except`/`all` (`switchport trunk allowed vlan 10,20`) completely replaces the existing allowed list—a frequent operational pitfall if you only meant to add a VLAN (which requires `switchport trunk allowed vlan add <id>`).",
    "Watch out for `switchport trunk allowed vlan <list>` without `add`—it overwrites the entire allowed VLAN list!",
    ["switchport trunk allowed vlan", "no switchport trunk allowed vlan"]
  ),
  c08.d(
    "VLANs", "Medium",
    "Order the CLI steps to create VLAN 30 named `Engineering` in Global Configuration mode and then statically assign ports Gi0/1 through Gi0/4 to VLAN 30 as access ports with DTP disabled.",
    [
      "Enter `vlan 30` in Global Configuration mode to create VLAN 30 and enter VLAN configuration submode (`(config-vlan)#`)",
      "Enter `name Engineering` and then `exit` back to Global Configuration mode (`(config)#`)",
      "Enter `interface range GigabitEthernet 0/1 - 4` to select the four switch ports",
      "Enter `switchport mode access` and `switchport access vlan 30` to make the ports static access ports in VLAN 30",
      "Enter `switchport nonegotiate` to disable Dynamic Trunking Protocol (DTP) negotiation frames on those ports"
    ],
    "Creating a named VLAN and assigning access ports follows a clean sequence: `vlan <id>` -> `name <text>` -> `exit` -> `interface range ...` -> `switchport mode access` -> `switchport access vlan <id>` -> `switchport nonegotiate` (which disables DTP once the port is statically set to `access` or `trunk`).",
    "CISCO best practice for access/trunk ports: statically set `switchport mode {access | trunk}` and disable DTP with `switchport nonegotiate`.",
    ["vlan", "name", "interface range", "switchport mode access", "switchport access vlan", "switchport nonegotiate"]
  ),
  c08.m(
    "Trunking", "Hard",
    "Examine the `show interfaces trunk` output below from `SW1`. Why does VLAN 10 appear in the first list (`Vlans allowed on trunk`), why is VLAN 20 missing from the second list (`Vlans allowed and active in management domain`), and why is VLAN 30 missing from the third list (`Vlans in spanning tree forwarding state and not pruned`)?",
    [
      "VLAN 20 is permitted by the allowed VLAN list, but it either does not exist in `SW1`'s VLAN database or is shut down.",
      "VLAN 30 exists and is active on `SW1`, but STP currently has `Gi0/1` in a blocking state or VTP pruned for VLAN 30."
    ],
    [
      ["VLAN 20 was manually removed from the trunk using `switchport trunk allowed vlan remove 20` under interface `Gi0/1`.", "If VLAN 20 had been removed by `switchport trunk allowed vlan`, it would not appear in the first list (`Vlans allowed on trunk: 1,10,20,30`)."],
      ["VLAN 30 was deleted from `flash:vlan.dat` so IOS removes it from the third trunk list while keeping it in the second.", "A deleted VLAN is removed from the second list (`Vlans allowed and active in management domain`) as well as the third list."],
      ["VLAN 10 is omitted from `show vlan brief` output because it is configured as the untagged native VLAN on port `Gi0/1`.", "The output shows `Native vlan` is `1`, and VLAN 10 is present in all three trunk lists, meaning it is allowed, active in `show vlan brief`, and STP forwarding."]
    ],
    "`show interfaces trunk` builds three progressive VLAN lists: (1) **Vlans allowed on trunk** reflects only the `switchport trunk allowed vlan` command (`1,10,20,30`); (2) **Vlans allowed and active in management domain** keeps only VLANs from list 1 that are currently defined and active (not `shutdown`) on the switch (`1,10,30`—so VLAN 20 is missing or shut down); and (3) **Vlans in spanning tree forwarding state and not pruned** keeps only VLANs from list 2 whose STP port state on `Gi0/1` is currently Forwarding (`1,10`—so VLAN 30 is STP blocking or VTP pruned).",
    "3 lists in `show interfaces trunk`: (1) Allowed by config -> (2) Allowed + exists & not shutdown -> (3) Allowed + active + STP Forwarding & not VTP pruned.",
    ["show interfaces trunk", "show vlan brief"],
    {
      cli: "SW1# show interfaces trunk\nPort        Mode             Encapsulation  Status        Native vlan\nGi0/1       on               802.1q         trunking      1\n\nPort        Vlans allowed on trunk\nGi0/1       1,10,20,30\n\nPort        Vlans allowed and active in management domain\nGi0/1       1,10,30\n\nPort        Vlans in spanning tree forwarding state and not pruned\nGi0/1       1,10"
    }
  ),
  c08.s(
    "Trunking", "Hard",
    "On an 802.1Q trunk between `SW1` and `SW2`, `SW1` has `switchport trunk native vlan 10` configured on its trunk port, while `SW2` has `switchport trunk native vlan 20` configured on its trunk port. What happens when a host in VLAN 10 on `SW1` sends a broadcast frame?",
    "`SW1` sends the frame untagged over the trunk, and `SW2` receives the untagged frame and floods it into **VLAN 20**.",
    [
      ["`SW1` tags the frame with VLAN ID 10, and `SW2` drops the frame because its native VLAN does not match.", "`SW1` does NOT tag frames in its native VLAN (VLAN 10); it sends them untagged, and `SW2` accepts untagged frames into its own native VLAN (VLAN 20)."],
      ["DTP immediately places both trunk ports into the `err-disabled` state as soon as CDP detects the native VLAN mismatch.", "While CDP logs a `%CDP-4-NATIVE_VLAN_MISMATCH` warning message, neither CDP nor DTP places the port into `err-disabled` for a native VLAN mismatch."],
      ["Both switches fall back to tagging all frames on the trunk using default VLAN 1 until the mismatch is resolved.", "802.1Q has no automatic fallback to tag the native VLAN; each switch simply treats untagged frames on that trunk as belonging to its locally configured native VLAN."]
    ],
    "Because 802.1Q sends native VLAN frames **untagged**, a native VLAN mismatch between two switches causes traffic from `SW1`'s native VLAN (VLAN 10, sent untagged) to arrive untagged at `SW2`, which assumes any untagged frame belongs to `SW2`'s native VLAN (VLAN 20). This merges the two broadcast domains and causes unintended VLAN hopping.",
    "A native VLAN mismatch causes untagged frames from one switch's native VLAN to cross into the neighbor's native VLAN.",
    ["switchport trunk native vlan", "show interfaces trunk"]
  ),
  c08.s(
    "VLANs", "Hard",
    "Examine the `show vlan brief` output below. Why does `Fa0/3` NOT appear next to VLAN 1, VLAN 10, or VLAN 20, and what does `act/lshut` mean next to VLAN 20?",
    "`Fa0/3` is operating as a trunk port omitted from `show vlan brief`, and `act/lshut` means VLAN 20 is locally shut down.",
    [
      ["`Fa0/3` is in the `notconnect` state hidden from `show vlan brief`, and `act/lshut` means all ports in VLAN 20 are unplugged.", "`show vlan brief` still lists access ports that are `notconnect` or `disabled`; it omits only operational **trunk** ports, and `act/lshut` means `shutdown vlan 20` was configured."],
      ["`Fa0/3` was assigned to an extended-range VLAN above 1005, and `act/lshut` means VLAN 20 was automatically pruned by VTP.", "`show vlan brief` displays extended-range VLANs and their access ports too; only trunk ports are omitted from `show vlan brief`."],
      ["`Fa0/3` has `switchport voice vlan 20` configured, and `act/lshut` means the voice VLAN requires CDP to activate.", "Access ports with a voice VLAN DO appear in `show vlan brief` (under both the data and voice VLANs); only trunk ports are hidden."]
    ],
    "`show vlan brief` lists only **access** ports assigned to each VLAN; any interface currently operating as a **trunk** (`trunking` in `show interfaces trunk`) is omitted from `show vlan brief`. Additionally, the status `act/lshut` indicates that VLAN 20 was administratively disabled using `shutdown vlan 20` (global) or `shutdown` inside `(config-vlan)#` mode.",
    "`show vlan brief` NEVER lists operational trunk ports (use `show interfaces trunk`), and `act/lshut` means the VLAN itself is `shutdown`.",
    ["show vlan brief", "shutdown vlan"],
    {
      cli: "SW1# show vlan brief\nVLAN Name                             Status    Ports\n---- -------------------------------- --------- -------------------------------\n1    default                          active    Fa0/1, Fa0/2, Gi0/1, Gi0/2\n10   Sales                            active    Fa0/4\n20   Engineering                      act/lshut Fa0/5, Fa0/6\n1002 fddi-default                     act/unsup\n1003 token-ring-default               act/unsup"
    }
  ),
  c08.s(
    "VLANs", "Hard",
    "Access ports `Fa0/1` and `Fa0/2` are currently assigned to VLAN 10 on `SW1`. If an administrator deletes VLAN 10 using `no vlan 10` in Global Configuration mode (without reassigning `Fa0/1` and `Fa0/2` to another VLAN), what happens to `Fa0/1` and `Fa0/2`?",
    "Both ports stay assigned to nonexistent VLAN 10, vanish from `show vlan brief`, and stop forwarding until reassigned to an active VLAN.",
    [
      ["Cisco IOS automatically moves `Fa0/1` and `Fa0/2` back into default VLAN 1 so attached hosts do not lose connectivity.", "Deleting a VLAN with `no vlan 10` does NOT return its access ports to VLAN 1; those ports stay mapped to missing VLAN 10 and become inactive."],
      ["Cisco IOS refuses to execute `no vlan 10` until every access port in VLAN 10 has been manually reconfigured with `no switchport access vlan`.", "IOS allows `no vlan 10` immediately without requiring access ports to be moved first, stranding those ports in an inactive state."],
      ["`Fa0/1` and `Fa0/2` automatically convert into 802.1Q trunk ports to search for VLAN 10 on neighboring switches.", "Deleting a VLAN never converts access ports into trunk ports."]
    ],
    "When you delete a VLAN (`no vlan <id>`) while access ports are still configured with `switchport access vlan <id>`, Cisco IOS does not move those ports back to VLAN 1. Instead, those access ports remain bound to the deleted VLAN, vanish from `show vlan brief` output, and stop forwarding frames until either the VLAN is recreated or the ports are assigned to an existing VLAN.",
    "Deleting a VLAN (`no vlan <x>`) orphans its access ports (they do NOT revert to VLAN 1 and stop passing traffic until reassigned).",
    ["no vlan", "switchport access vlan", "show vlan brief"]
  )
];

// ============================================================================
// v1c09 - Spanning Tree Protocol Concepts (15 questions: 4 Easy, 7 Medium, 4 Hard)
// ============================================================================
const c09 = mk("Network Access", 20, "v1c09");
const q09 = [
  c09.s(
    "STP", "Easy",
    "What are the default IEEE 802.1D short-method Spanning Tree port costs for 10 Mbps, 100 Mbps, 1 Gbps, and 10 Gbps Ethernet interfaces?",
    "10 Mbps = 100; 100 Mbps = 19; 1 Gbps = 4; 10 Gbps = 2",
    [
      ["10 Mbps = 1000; 100 Mbps = 100; 1 Gbps = 10; 10 Gbps = 1", "Cisco switches use the non-linear IEEE 1998 short cost values (100, 19, 4, 2) by default, not simple powers of 10."],
      ["10 Mbps = 2,000,000; 100 Mbps = 200,000; 1 Gbps = 20,000; 10 Gbps = 2,000", "Those are the IEEE 2004 **long-method** port costs (`spanning-tree pathcost method long`), not the default short-method costs."],
      ["10 Mbps = 50; 100 Mbps = 15; 1 Gbps = 4; 10 Gbps = 1", "50, 15, and 1 are not IEEE STP port cost defaults; the default short costs are 100 (10M), 19 (100M), 4 (1G), and 2 (10G)."]
    ],
    "By default, Cisco Catalyst switches use the 1998 IEEE short-method STP port costs: 10 Mbps = 100, 100 Mbps = 19, 1 Gbps = 4, and 10 Gbps = 2. (The 2004 long method—2,000,000 / 200,000 / 20,000 / 2,000—is only used if `spanning-tree pathcost method long` is configured.)",
    "Memorize default STP short port costs: 10M = **100**, 100M = **19**, 1G = **4**, 10G = **2**.",
    []
  ),
  c09.s(
    "STP", "Easy",
    "What are the default IEEE 802.1D STP timer values for Hello time, MaxAge, and Forward Delay?",
    "Hello = 2 seconds; MaxAge = 20 seconds; Forward Delay = 15 seconds",
    [
      ["Hello = 2 seconds; MaxAge = 6 seconds; Forward Delay = 10 seconds", "A MaxAge of 6 seconds (3 x Hello) belongs to Rapid STP (802.1w), whereas classic 802.1D STP uses MaxAge = 20 seconds (10 x Hello) and Forward Delay = 15 seconds."],
      ["Hello = 5 seconds; MaxAge = 15 seconds; Forward Delay = 30 seconds", "30 seconds is the combined Listening (15s) + Learning (15s) delay, while Hello is 2 seconds and MaxAge is 20 seconds."],
      ["Hello = 10 seconds; MaxAge = 40 seconds; Forward Delay = 15 seconds", "10 seconds and 40 seconds are default OSPF Hello and Dead timers on Ethernet, not STP timers."]
    ],
    "The root switch dictates the STP timers for the entire spanning tree inside its Hello BPDUs. By default in classic 802.1D STP, the **Hello** timer is 2 seconds, **MaxAge** is 20 seconds (10x Hello), and **Forward Delay** is 15 seconds (spent in Listening and again in Learning, yielding up to \(20 + 15 + 15 = 50\) seconds for convergence).",
    "802.1D STP default timers: Hello = 2s, MaxAge = 20s (10x Hello), Forward Delay = 15s (Listening 15s + Learning 15s). RSTP MaxAge = 6s (3x Hello).",
    []
  ),
  c09.s(
    "STP", "Easy",
    "In Rapid Spanning Tree Protocol (RSTP, IEEE 802.1w), which transitional 802.1D port state is completely eliminated, leaving only three operational port states?",
    "Listening state is eliminated; RSTP uses only Discarding, Learning, and Forwarding states.",
    [
      ["Learning state is eliminated; RSTP transitions ports straight from Blocking to Forwarding without learning MACs.", "RSTP retains the Learning state and replaces Blocking/Disabled with **Discarding**; it is the **Listening** state that is eliminated."],
      ["Blocking state is retained alongside Listening, while the Disabled state is renamed Standby.", "RSTP combines classic STP's Blocking and Disabled states into the **Discarding** state and eliminates Listening."],
      ["Forwarding state is renamed Active, leaving Blocking, Listening, and Active as the three RSTP states.", "RSTP keeps the Learning and Forwarding state names and merges Disabled + Blocking into Discarding."]
    ],
    "Classic 802.1D STP had five port states: Disabled, Blocking, Listening, Learning, and Forwarding. RSTP (802.1w) streamlines these into three port states—**Discarding** (which combines Disabled and Blocking), **Learning**, and **Forwarding**—eliminating the 15-second Listening state entirely.",
    "RSTP (802.1w) has only 3 port states: **Discarding**, **Learning**, and **Forwarding** (no Listening state).",
    []
  ),
  c09.s(
    "STP", "Easy",
    "What port role is assigned to every working interface on the elected STP **root switch**?",
    "Designated Port (DP) — remains in the active STP Forwarding port state",
    [
      ["Root Port (RP) — originates periodic Hello BPDUs out every root interface", "A Root Switch NEVER has a Root Port (RP); every nonroot switch has exactly one RP pointing toward the root, while all ports on the root switch are Designated Ports (DPs)."],
      ["Alternate Port (AP) — backs up the primary uplink if a neighbor fails", "Alternate Ports exist only on nonroot switches in RSTP to back up a Root Port."],
      ["Backup Port (BP) — blocks redundant connections attached to shared hubs", "A root switch port only becomes a Backup/non-designated port in the rare case where two ports of the root switch plug into the same shared hub; normally all working ports on the root switch are Designated Ports."]
    ],
    "Because the root switch advertises a root cost of 0 in its outgoing Hello BPDUs, it always has the lowest advertised root cost on every attached LAN segment. Consequently, every working port on the root switch wins the Designated Port (DP) election on its segment and is placed in the Forwarding state.",
    "Root switch has NO Root Ports—all working ports on the root switch are **Designated Ports (DPs)**.",
    []
  ),
  c09.s(
    "STP", "Medium",
    "Without Spanning Tree Protocol (STP), what three specific problems occur when redundant Layer 2 links create a switching loop?",
    "Broadcast storms, MAC address table flapping, and multiple copies of frames arriving at end hosts",
    [
      ["IPv4 Time-to-Live (TTL) expiration drops, duplicate OSPF router IDs, and automatic VLAN database erasure", "Layer 2 Ethernet frames have no TTL field (unlike Layer 3 IPv4 packets), which is precisely why broadcast storms loop endlessly without STP."],
      ["Late collisions on full-duplex fiber trunks, DHCP pool exhaustion, and SSH RSA key corruption", "Full-duplex links do not experience collisions; Layer 2 loops cause broadcast storms, MAC table flapping, and duplicate frame delivery."],
      ["Native VLAN hopping, automatic DTP fallback to access mode, and CAM aging timers resetting to zero", "Layer 2 loops do not alter DTP modes or cause native VLAN hopping; they cause endless broadcast flooding, MAC table instability, and duplicate frames."]
    ],
    "Because Layer 2 Ethernet headers lack a Time-to-Live (TTL) field, a Layer 2 switching loop causes three catastrophic symptoms: (1) **broadcast storms** (broadcasts, multicasts, and unknown unicasts loop infinitely until links saturate), (2) **MAC table instability** (switches constantly overwrite source MAC port entries as frames loop in from different ports), and (3) **multiple frame transmission** (end hosts receive duplicate copies of the same frame).",
    "3 Layer 2 loop symptoms prevented by STP: (1) Broadcast storms, (2) MAC table instability, (3) Multiple frame copies delivered to hosts.",
    []
  ),
  c09.s(
    "STP", "Medium",
    "How do switches elect the Spanning Tree **root switch**, and how are ties broken?",
    "The switch with the numerically lowest Bridge ID wins: lowest 2-byte priority first, then lowest MAC address.",
    [
      ["The switch with the numerically highest 2-byte priority value wins, and if tied, highest 6-byte MAC address.", "In Spanning Tree Protocol, **lower** is always better (unlike OSPF DR/BDR election): lowest priority wins, then lowest MAC address."],
      ["The switch with the fastest uplink port speed and lowest cost wins, and if tied, lowest management IPv4 address.", "Root switch election inspects only the 8-byte Bridge ID (2-byte priority + 6-byte MAC); port speeds and IP addresses play no role."],
      ["The switch that has been powered on the longest wins so that existing forwarding paths are never pre-empted.", "STP root election is preemptive: any switch advertising a superior (lower) BID immediately takes over as the root switch regardless of uptime."]
    ],
    "Every switch in an STP topology has an 8-byte Bridge ID (BID) consisting of a 2-byte priority field followed by a 6-byte system MAC address. Switches compare BIDs in Hello BPDUs and elect the switch with the **lowest** numerical BID as the root switch—comparing the 2-byte priority first, and if the priorities are equal, choosing the switch with the lowest 6-byte MAC address.",
    "In STP, **lower is always better**: Lowest BID (lowest priority -> lowest MAC) wins Root Switch.",
    []
  ),
  c09.s(
    "STP", "Medium",
    "How does a nonroot switch calculate its **root path cost** out a candidate interface when choosing its Root Port (RP)?",
    "It adds its own local STP port cost on that interface to the root cost received in the Hello BPDU.",
    [
      ["It adds the neighbor switch's outgoing port cost to the neighbor's Bridge ID priority value.", "Root cost is the sum of STP port costs along the path to the root (advertised root cost in incoming BPDU + local ingress port cost), never involving the neighbor's outgoing cost or BID."],
      ["It counts the number of Layer 2 switch hops to the root switch, assigning a cost of 1 per switch regardless of link speed.", "STP weights links by interface bandwidth (port cost), not simple hop count."],
      ["It uses only the advertised root cost inside the incoming BPDU without adding the cost of its own receiving interface.", "A switch always adds the STP port cost of its own **receiving** (ingress) interface to the root cost advertised in the incoming BPDU."]
    ],
    "As a Hello BPDU travels away from the root switch (which advertises cost 0), each switch calculates its root cost on a receiving port by taking the **root cost advertised inside the incoming BPDU** and adding its **own local STP port cost** for that receiving interface. The port with the lowest total root cost becomes that switch's single Root Port (RP).",
    "My Root Cost on Port X = (Root Cost inside BPDU arriving on Port X) + (My STP Port Cost of Port X).",
    []
  ),
  c09.s(
    "STP", "Medium",
    "In Rapid Spanning Tree Protocol (RSTP, 802.1w), what is the difference between an **Alternate port** and a **Backup port**?",
    "An Alternate port backs up the Root Port via another switch, whereas a Backup port backs up a Designated Port connected to a shared hub.",
    [
      ["An Alternate port forwards user frames on even-numbered VLANs, whereas a Backup port forwards user frames on odd-numbered VLANs.", "Both Alternate and Backup ports are in the **Discarding** state for that VLAN's spanning tree and do not forward user traffic unless the primary port fails."],
      ["An Alternate port backs up a Designated Port on a point-to-point link, whereas a Backup port backs up a Root Port across a WAN.", "This reverses the roles: **Alternate** backs up the **Root Port (RP)**, and **Backup** backs up a **Designated Port (DP)** on a shared medium (hub)."],
      ["An Alternate port requires waiting 30 seconds of Forward Delay before forwarding, whereas a Backup port transitions instantly on full-duplex links.", "It is the **Alternate port** that transitions to Forwarding immediately (without waiting for timers) if the Root Port fails; Backup ports apply only to half-duplex shared hubs."]
    ],
    "Both RSTP Alternate ports and Backup ports stay in the **Discarding** state during normal operation. An **Alternate port** receives useful BPDUs from another switch and serves as a ready replacement for the switch's **Root Port (RP)**—if the RP fails, the Alternate port transitions immediately to Forwarding without waiting for timers. A **Backup port** occurs only when two ports of the *same* switch connect to the same shared hub (collision domain), acting as a backup for that switch's **Designated Port (DP)**.",
    "RSTP roles: **Alternate port** backs up the **Root Port (RP)** (fast switchover!); **Backup port** backs up a **Designated Port (DP)** on a shared hub.",
    []
  ),
  c09.s(
    "STP", "Medium",
    "What problem do **PortFast** and **BPDU Guard** solve when configured together on access ports connected to end-user PCs?",
    "PortFast puts the port straight into Forwarding, and BPDU Guard places the port into `err-disabled` if any BPDU arrives.",
    [
      ["PortFast bundles multiple PC links into an EtherChannel, and BPDU Guard encrypts STP Hello messages using local SSHv2 keys.", "Bundling links is the job of EtherChannel (not PortFast), and BPDU Guard disables a port upon receiving a BPDU rather than encrypting BPDUs."],
      ["PortFast lowers the port's STP cost to 1 so the PC becomes the Root Port, and BPDU Guard filters out broadcast storms.", "End-user PCs do not participate in STP or become Root Ports; PortFast simply skips transitional delays on edge ports where no switches are attached."],
      ["PortFast disables MAC address learning on the port for 300 seconds, and BPDU Guard blocks untagged native VLAN frames.", "PortFast enables immediate forwarding and MAC learning on edge ports, while BPDU Guard watches for incoming STP BPDUs and err-disables the port."]
    ],
    "Enabling **PortFast** on an edge/access port connected to a single endpoint (never another switch) allows the port to jump straight to the STP **Forwarding** state as soon as the link comes up, avoiding the 30-second Listening/Learning delay (so DHCP on booting PCs doesn't time out). **BPDU Guard** protects PortFast ports: if an unauthorized switch is plugged in and sends a BPDU, BPDU Guard immediately shuts the port down into the `err-disabled` state to prevent a topology loop or rogue root takeover.",
    "PortFast = instant Forwarding on edge/access ports; BPDU Guard = `err-disabled` if any BPDU arrives on that port.",
    []
  ),
  c09.t(
    "STP", "Medium",
    "Match each classic 802.1D Spanning Tree port state to its exact behavior regarding user frame forwarding, MAC learning, and permanence.",
    [
      ["Blocking", "Stable state for non-RP/non-DP ports; discards user frames and does not learn MAC addresses"],
      ["Listening", "Transitional 15-second state; discards user frames, does not learn MACs, and times out stale MAC entries"],
      ["Learning", "Transitional 15-second state; discards user frames but begins learning source MAC addresses from arriving frames"],
      ["Forwarding", "Stable active state for Root Ports and Designated Ports; forwards user frames and learns source MAC addresses"],
      ["Disabled", "Stable non-working state for ports that are administratively shut down or physically disconnected (`notconnect`)"]
    ],
    "In 802.1D STP, only the **Forwarding** state forwards user frames. Both **Learning** and **Forwarding** learn source MAC addresses. **Listening** (15s) and **Learning** (15s) are temporary transitional states (governed by the 15-second Forward Delay timer) when moving a port from **Blocking** to **Forwarding**.",
    "802.1D states: Blocking -> Listening (15s, no MAC learning) -> Learning (15s, learns MACs, no forwarding) -> Forwarding (learns MACs + forwards).",
    []
  ),
  c09.d(
    "STP", "Medium",
    "Order the sequence of tiebreakers a nonroot switch uses when two or more of its ports tie for the lowest total root path cost during Root Port (RP) election.",
    [
      "Compare the total root path cost on each candidate port (lowest cost wins)",
      "If root path costs tie, choose the port connected to the neighbor switch with the lowest Bridge ID (BID)",
      "If both ports connect to the exact same neighbor switch (tying on neighbor BID), choose the port receiving the lowest neighbor STP port priority",
      "If the neighbor's STP port priorities also tie, choose the port connected to the neighbor's lowest internal port number"
    ],
    "When a nonroot switch evaluates multiple paths to the root switch, it first selects the port with the **lowest root path cost**. If two ports tie on root cost, it applies three tiebreakers in order based on the upstream neighbor's BPDU fields: (1) **lowest neighbor BID**, (2) **lowest neighbor port priority** (default 128), and (3) **lowest neighbor internal port number**.",
    "RP tiebreakers (after root cost ties): (1) Lowest neighbor BID -> (2) Lowest neighbor port priority -> (3) Lowest neighbor port number.",
    []
  ),
  c09.m(
    "STP", "Hard",
    "Four switches are connected in a square: `SW1` (BID `4096.0200.0001.0001`), `SW2` (BID `32768.0200.0002.0002`), `SW3` (BID `32768.0200.0003.0003`), and `SW4` (BID `32768.0200.0004.0004`). `SW1` connects to `SW2` (1 Gbps) and `SW3` (1 Gbps). `SW4` connects to `SW2` on Gi0/1 (1 Gbps) and to `SW3` on Gi0/2 (1 Gbps). All STP port costs use default short values. Which statements are true about `SW4`'s ports?",
    [
      "`SW4` has a root path cost of 8 on both Gi0/1 and Gi0/2, and selects Gi0/1 as its Root Port because `SW2` has a lower BID than `SW3`.",
      "On the link between `SW3` and `SW4`, `SW3`'s port becomes the Designated Port (Forwarding) and `SW4`'s Gi0/2 becomes Blocking/Discarding."
    ],
    [
      ["`SW4` selects Gi0/2 as its Root Port because `SW3` has a higher MAC address (`0200.0003.0003`) than `SW2` (`0200.0002.0002`).", "In STP tiebreakers, **lower** BID is always preferred; because `SW2` and `SW3` tie on priority 32768, `SW2`'s lower MAC (`0200.0002.0002`) beats `SW3`."],
      ["`SW4` places both Gi0/1 and Gi0/2 into Forwarding as dual Root Ports to load-balance traffic across the two equal-cost 8 paths.", "Each nonroot switch can elect only **one** Root Port (RP) per spanning tree; the losing port cannot also be an RP."],
      ["On the link between `SW3` and `SW4`, `SW4`'s Gi0/2 wins the Designated Port role because `SW4` is two hops away from `SW1`.", "On the `SW3`-`SW4` link, `SW3` advertises a root cost of 4 while `SW4` has a root cost of 8; because 4 < 8, `SW3`'s port is the Designated Port and `SW4`'s Gi0/2 blocks."]
    ],
    "`SW1` is the root switch (lowest priority 4096). `SW2` and `SW3` each have a root cost of 4 (one 1-Gbps link from `SW1`). `SW4` receives a BPDU advertising cost 4 from `SW2` on Gi0/1 (total cost \(4 + 4 = 8\)) and a BPDU advertising cost 4 from `SW3` on Gi0/2 (total cost \(4 + 4 = 8\)). Because the costs tie at 8, `SW4` compares the neighbor BIDs: `SW2` (`32768.0200.0002.0002`) is lower than `SW3` (`32768.0200.0003.0003`), so `SW4` chooses **Gi0/1 as its RP**. On the `SW3`-`SW4` segment, `SW3`'s advertised root cost (4) beats `SW4`'s root cost (8), making `SW3`'s port the **DP** and `SW4`'s Gi0/2 **Blocking/Discarding**.",
    "Trace STP in 3 steps: (1) Elect Root Switch (lowest BID), (2) Elect 1 Root Port per nonroot switch (lowest root path cost; tiebreak on neighbor BID), (3) Elect 1 Designated Port per segment (lowest advertised root cost; tiebreak on sender BID).",
    []
  ),
  c09.s(
    "STP", "Hard",
    "Why does RSTP (802.1w) classify full-duplex inter-switch links as **Point-to-Point** port types and half-duplex links as **Shared** port types?",
    "Point-to-Point links connect two switches and handshake to transition into Forwarding without waiting for STP timers.",
    [
      ["Full-duplex Point-to-Point links disable BPDU transmission completely, whereas Shared links send BPDUs every 2 seconds.", "Both Point-to-Point and Shared ports exchange RSTP BPDUs; Point-to-Point links use those BPDUs to handshake and converge within milliseconds."],
      ["Shared half-duplex links automatically enable PortFast on both ends because Layer 1 hubs cannot create Layer 2 loops.", "Hubs can easily create loops (requiring Backup ports), and Shared links must fall back to slower timer-based convergence rather than PortFast."],
      ["Point-to-Point links use IEEE 2004 long port costs by default, whereas Shared links use 1998 short port costs.", "Both Point-to-Point and Shared links use the switch's configured pathcost method (short by default); the distinction controls RSTP convergence handshakes."]
    ],
    "RSTP achieves sub-second convergence by distinguishing link media types. When a link operates in **full-duplex** mode, RSTP knows it is a direct **Point-to-Point** connection between two devices (not a shared hub) and can actively handshake with the neighbor switch to place a new Designated Port into Forwarding immediately without waiting for Forward Delay timers. Half-duplex ports are assumed to be connected to a hub (**Shared** port type) and must use slower timer-based transitions.",
    "RSTP link types: Full-duplex = **Point-to-Point** (fast handshake convergence); Half-duplex = **Shared** (hub); Access/PortFast = **Point-to-Point Edge**.",
    []
  ),
  c09.s(
    "STP", "Hard",
    "In a classic 802.1D STP network with default timers, a nonroot switch (`SW3`) stops receiving Hello BPDUs on its Root Port (`Gi0/1`) while the physical link itself remains `up/up` (an indirect failure). How long does `SW3` wait before transitioning its blocked port (`Gi0/2`) into the Forwarding state?",
    "50 seconds: 20 seconds for MaxAge to expire, plus 15 seconds in Listening, plus 15 seconds in Learning",
    [
      ["30 seconds: 15 seconds in the Listening state followed immediately by 15 seconds in the Learning state", "30 seconds applies only when the Root Port physically goes down immediately; when BPDUs simply stop arriving on an `up` link, `SW3` first waits **MaxAge (20s)** before starting Listening (15s) + Learning (15s)."],
      ["6 seconds: 3 missed 2-second Hello BPDUs before the Alternate port transitions immediately to Forwarding", "6 seconds (3 x Hello) with an immediate Alternate port transition describes **RSTP (802.1w)**, not classic **802.1D STP**."],
      ["300 seconds: `SW3` must wait for the default CAM table aging timer to flush before unblocking `Gi0/2`", "STP uses the 15-second Listening/Forward Delay timer to flush stale CAM entries during topology changes, not the 300-second normal aging timer."]
    ],
    "In classic 802.1D STP, when a switch stops receiving Hello BPDUs from the root switch without a physical link-down event, it waits **MaxAge (20 seconds)** before declaring the current root path invalid. It then moves the replacement port from Blocking into **Listening (15 seconds)** and **Learning (15 seconds)** before reaching **Forwarding**, taking a total of \(20 + 15 + 15 = 50\) seconds.",
    "802.1D max convergence = 50s: MaxAge (20s) + Listening (15s) + Learning (15s).",
    []
  ),
  c09.s(
    "STP", "Hard",
    "Why does a switch port transitioning from Blocking to Forwarding in 802.1D STP spend 15 seconds in the **Listening** state and then another 15 seconds in the **Learning** state before forwarding user frames?",
    "Listening lets temporary loops subside and flushes stale MACs, while Learning populates the MAC table before forwarding frames.",
    [
      ["Listening negotiates DTP trunk encapsulation with the neighbor, while Learning downloads the VTP VLAN database.", "DTP and VTP operate independently of STP's 15-second Forward Delay states."],
      ["Listening learns source MAC addresses from incoming frames, while Learning forwards only broadcast ARP frames to test the loop.", "No MAC addresses are learned during **Listening**, and no user frames (not even ARP broadcasts) are forwarded during **Learning**."],
      ["Listening waits for the root switch to assign an IP address via DHCP, while Learning generates RSA keys for BPDU authentication.", "STP is a purely Layer 2 protocol that does not use IP addresses, DHCP, or RSA keys."]
    ],
    "During a topology change, different switches may not block old ports and unblock new ports at the exact same millisecond. Waiting 15 seconds in **Listening** (no frame forwarding, no MAC learning) ensures old forwarding ports have finished blocking so temporary loops cannot form, while timing out stale MAC entries. Waiting 15 seconds in **Learning** (learning source MACs without forwarding frames) populates the CAM table so the switch won't have to flood every unicast frame as an unknown unicast the moment the port enters **Forwarding**.",
    "Listening (15s) = prevent temporary loops + flush stale MACs; Learning (15s) = learn MACs before forwarding to minimize unknown-unicast flooding.",
    []
  )
];

// ============================================================================
// v1c10 - RSTP and EtherChannel Configuration (15 questions: 4 Easy, 7 Medium, 4 Hard)
// ============================================================================
const c10 = mk("Network Access", 20, "v1c10");
const q10 = [
  c10.s(
    "STP", "Easy",
    "Which Global Configuration command enables Rapid Per-VLAN Spanning Tree Plus (RPVST+) on a Cisco Catalyst switch?",
    "`spanning-tree mode rapid-pvst` in Global Config mode",
    [
      ["`spanning-tree mode rstp` in Global Configuration mode", "Cisco IOS uses the keyword `rapid-pvst` (`spanning-tree mode rapid-pvst`), not `rstp`."],
      ["`spanning-tree mode pvst` in Global Configuration mode", "`spanning-tree mode pvst` enables traditional 802.1D Per-VLAN Spanning Tree Plus (PVST+), not Rapid PVST+."],
      ["`spanning-tree mode mst` in Global Config mode", "`spanning-tree mode mst` enables Multiple Spanning Tree (802.1s), which maps multiple VLANs into a few configurable instances rather than RPVST+."]
    ],
    "Cisco Catalyst switches support three STP modes configured via `spanning-tree mode`: `pvst` (traditional 802.1D PVST+), `rapid-pvst` (Rapid PVST+ based on 802.1w, the default on modern Catalyst switches), and `mst` (Multiple Spanning Tree based on 802.1s).",
    "CLI keywords for `spanning-tree mode`: `pvst` (802.1D), `rapid-pvst` (802.1w RPVST+), `mst` (802.1s MSTP).",
    ["spanning-tree mode rapid-pvst", "spanning-tree mode pvst", "spanning-tree mode mst"]
  ),
  c10.s(
    "STP", "Easy",
    "With the 12-bit System ID Extension enabled, what is the default base priority value, valid range, and required increment when configuring `spanning-tree vlan <x> priority <y>`?",
    "Default: 32768; Range: 0 to 61440 in increments of 4096",
    [
      ["Default: 128; Range: 0 to 240 in increments of 16", "Default 128 with a range of 0 to 240 in increments of 16 describes per-interface **port priority** (`spanning-tree port-priority`), not switch bridge priority."],
      ["Default: 32768; Range: 1 to 65535 in increments of 1", "Because the lower 12 bits of the 16-bit priority field hold the VLAN ID (System ID Extension), the configurable 4-bit base priority must be a multiple of \(2^{12} = 4096\) (0 to 61440)."],
      ["Default: 4096; Range: 4096 to 65536 in increments of 1024", "The default base priority is 32768, the lowest valid value is 0, and increments are 4096 (0, 4096, 8192, ..., 61440)."]
    ],
    "Because the 16-bit Bridge ID priority field reserves its low-order 12 bits for the System ID Extension (which holds the VLAN ID), only the upper 4 bits are configurable. Each increment of the upper 4 bits equals \(2^{12} = 4096\), giving 16 valid base priority values from **0 to 61440 in increments of 4096** (with a default of **32768**).",
    "Switch bridge priority: default **32768**, range **0..61440** in steps of **4096** (plus VLAN ID). Port priority: default **128**, range **0..240** in steps of **16**.",
    ["spanning-tree vlan priority"]
  ),
  c10.s(
    "EtherChannel", "Easy",
    "What is the maximum number of active physical links that can be bundled into a single EtherChannel, and how many additional hot-standby links does LACP support?",
    "Up to 8 active physical links in a bundle, with up to 8 additional hot-standby links when using LACP",
    [
      ["Up to 4 active physical links in a bundle, with 4 additional standby links supported by PAgP", "Both PAgP and LACP support up to **8** active links in a bundle, and only LACP supports an extra 8 standby links (16 total)."],
      ["Up to 16 active physical links simultaneously forwarding traffic when using `channel-group <n> mode on`", "An EtherChannel can have at most **8 active** forwarding links at a time; LACP's 9th through 16th links remain in hot-standby mode."],
      ["Up to 2 active physical links on FastEthernet switches and up to 10 active links on GigabitEthernet switches", "The 8-active-link maximum applies across FastEthernet, GigabitEthernet, and 10-GigabitEthernet EtherChannels."]
    ],
    "An EtherChannel bundle can combine between 2 and **8 active physical links** for simultaneous load distribution. Manual (`on`) and Cisco PAgP (`desirable`/`auto`) support up to 8 links total, while IEEE 802.3ad LACP (`active`/`passive`) allows up to 16 links to be assigned to the `channel-group`—with up to 8 active and up to 8 waiting in hot-standby mode.",
    "Max active links in an EtherChannel = **8** (LACP allows up to 16 configured: 8 active + 8 standby).",
    ["channel-group", "show etherchannel summary"]
  ),
  c10.s(
    "EtherChannel", "Easy",
    "Which pair of `channel-group` keywords configures an EtherChannel to use the standard **IEEE 802.3ad Link Aggregation Control Protocol (LACP)**?",
    "`active` and `passive` (where at least one side must be `active`)",
    [
      ["`desirable` and `auto` (where at least one side must be `desirable`)", "`desirable` and `auto` configure Cisco proprietary **Port Aggregation Protocol (PAgP)**, not IEEE 802.3ad LACP."],
      ["`on` and `auto` (where one side forces LACP without sending negotiation frames)", "`mode on` enables manual static EtherChannel with **no** negotiation protocol (neither LACP nor PAgP), and cannot pair with `auto`."],
      ["`dynamic desirable` and `dynamic auto` (configured with `switchport mode`)", "`dynamic desirable` and `dynamic auto` are Dynamic Trunking Protocol (DTP) keywords for 802.1Q trunking, not EtherChannel keywords."]
    ],
    "In the `channel-group <n> mode <keyword>` interface subcommand, `active` and `passive` enable **LACP** (IEEE 802.3ad), `desirable` and `auto` enable Cisco proprietary **PAgP**, and `on` enables static manual EtherChannel with no negotiation protocol. For LACP to form a channel, both sides must use LACP keywords and at least one side must be `active`.",
    "LACP = `active` / `passive` (need >=1 `active`); PAgP = `desirable` / `auto` (need >=1 `desirable`); Manual = `on` + `on`.",
    ["channel-group", "show etherchannel summary"]
  ),
  c10.s(
    "STP", "Medium",
    "Switch `SW1` executes `spanning-tree vlan 10 root primary` in Global Configuration mode. How does Cisco IOS determine what base priority value to write into `SW1`'s configuration?",
    "It sets `SW1`'s base priority to `24576` if the current root exceeds `24576`, or `4096` below the current root priority.",
    [
      ["It always sets `SW1`'s base priority to `0` so that no other switch can ever preempt `SW1` as the root switch.", "`root primary` never sets priority to 0; it sets 24576 (or 4096 below the current root if the current root is already at or below 24576, failing if the root is at 0)."],
      ["It sets `SW1`'s base priority to `28672` and dynamically monitors BPDUs to lower the priority if a new switch joins later.", "`28672` is the value set by `spanning-tree vlan 10 root secondary`, and both `root primary` and `root secondary` are one-time configuration macros that do not dynamically adjust later."],
      ["It lowers `SW1`'s STP port costs to `1` across all trunk interfaces while leaving the Bridge ID priority at `32768`.", "`root primary` modifies the switch's Bridge ID priority (`spanning-tree vlan 10 priority <x>`), not interface port costs."]
    ],
    "`spanning-tree vlan <x> root primary` is a one-time IOS configuration macro that inspects the current root switch's priority at the moment you press Enter. If the current root has a base priority greater than 24576 (such as the default 32768), the switch writes `spanning-tree vlan <x> priority 24576` into `running-config`. If the current root is already 24576 or lower, it subtracts 4096 from the current root's base priority. By contrast, `root secondary` always sets a base priority of **28672**.",
    "`root primary` = sets **24576** (or 4096 less than current root if current root <= 24576); `root secondary` = always sets **28672**.",
    ["spanning-tree vlan root primary", "spanning-tree vlan root secondary"]
  ),
  c10.s(
    "STP", "Medium",
    "Wait—how does Cisco's **Rapid PVST+ (RPVST+)** differ from standard **IEEE 802.1w RSTP** regarding spanning tree instances and BPDU destination MAC addresses?",
    "Standard RSTP runs one common tree with MAC `0180.C200.0000`, while RPVST+ runs one tree per VLAN with MAC `0100.0CCC.CCCD`.",
    [
      ["Standard RSTP creates one tree per VLAN using 802.1Q tags, whereas RPVST+ groups all VLANs into odd and even instances.", "Standard IEEE 802.1w RSTP runs only a single Common Spanning Tree (CST) across all VLANs; Cisco added per-VLAN instances in RPVST+."],
      ["Standard RSTP sends BPDUs to broadcast MAC `FFFF.FFFF.FFFF`, whereas RPVST+ sends BPDUs as unicast frames to the root switch.", "Neither protocol uses broadcast or unicast MACs; IEEE RSTP uses multicast `0180.C200.0000` and Cisco RPVST+ uses multicast `0100.0CCC.CCCD`."],
      ["Standard RSTP sets the 12-bit System ID Extension to the VLAN ID, whereas RPVST+ sets those 12 bits to all binary zeros.", "It is the exact opposite: IEEE RSTP sets the 12-bit System ID Extension to `000000000000`, whereas Cisco RPVST+ places the **VLAN ID** inside the 12-bit System ID Extension."]
    ],
    "IEEE 802.1w RSTP defines a single Common Spanning Tree (CST) for the entire bridged network, sends untagged BPDUs to IEEE multicast MAC `0180.C200.0000`, and sets the 12-bit System ID Extension to 0. Cisco's RPVST+ runs an independent RSTP instance **per VLAN**, places the VLAN ID in the 12-bit System ID Extension, adds a VLAN TLV, and sends trunk BPDUs tagged with 802.1Q to Cisco multicast MAC `0100.0CCC.CCCD`.",
    "IEEE RSTP = 1 tree (CST), MAC `0180.C200.0000`, SysID Ext = 0; Cisco RPVST+ = 1 tree per VLAN, MAC `0100.0CCC.CCCD`, SysID Ext = VLAN ID, 802.1Q-tagged BPDUs.",
    ["show spanning-tree vlan"]
  ),
  c10.s(
    "EtherChannel", "Medium",
    "Switch `SW1` configures ports Gi0/1 and Gi0/2 with `channel-group 1 mode desirable`, while the neighbor switch `SW2` configures its connected ports Gi0/1 and Gi0/2 with `channel-group 2 mode active`. Will the EtherChannel form, and why?",
    "No — `channel-group` numbers are locally significant, but `desirable` (PAgP) and `active` (LACP) are incompatible protocols.",
    [
      ["No — both switches must configure the exact same `channel-group` number `1` on both ends for the PortChannel interfaces to bundle.", "The `channel-group` number is **locally significant** to each switch (`Po1` on `SW1` can happily connect to `Po2` on `SW2`); the failure here is mixing PAgP (`desirable`) with LACP (`active`)."],
      ["Yes — both `desirable` and `active` actively initiate negotiation and automatically fall back to static `mode on`.", "PAgP (`desirable`) and LACP (`active`) are completely separate protocols that do not interoperate or fall back to `mode on`."],
      ["Yes — Cisco Catalyst switches automatically prioritize LACP `active` whenever a neighbor sends PAgP `desirable` frames.", "A switch port configured with `mode desirable` runs only PAgP and ignores LACP frames from an `active` neighbor, leaving the ports unbundled."]
    ],
    "The `channel-group` number (which creates `interface Port-channel <n>`) is **locally significant** only to that switch, so `SW1` using group `1` and `SW2` using group `2` is completely valid. However, `mode desirable` uses Cisco proprietary **PAgP** whereas `mode active` uses IEEE **LACP**—because the two ends are running different negotiation protocols, the EtherChannel will not form.",
    "`channel-group <n>` number is locally significant (can differ between switches), but the mode protocol must match (`active`/`passive` LACP, `desirable`/`auto` PAgP, or `on`/`on`).",
    ["channel-group", "show etherchannel summary"]
  ),
  c10.s(
    "EtherChannel", "Medium",
    "Why does EtherChannel load distribution hash header fields (such as `src-dst-ip` or `src-dst-mac`) to keep all frames of a single application flow on the same physical link instead of sending packets round-robin across all links in the bundle?",
    "Sending packets of a single TCP/UDP flow over different links can deliver packets out of order and degrade performance.",
    [
      ["Spanning Tree Protocol blocks all links in an EtherChannel except one unless flow hashing is enabled.", "STP treats the entire PortChannel interface (`Po1`) as a single logical link regardless of the load-balancing algorithm."],
      ["Round-robin forwarding violates IEEE 802.1Q rules by stripping the VLAN tag from every second frame.", "Load distribution operates below 802.1Q tagging and does not strip VLAN tags."],
      ["Cisco switches can only learn a MAC address on one physical wire, so sending a host's frames on two wires triggers `err-disabled`.", "The switch's MAC address table maps learned MAC addresses to the logical `Po1` interface, not the individual physical member ports."]
    ],
    "An EtherChannel treats all bundled links as one logical interface (`Port-channel <x>`) for STP and MAC learning. When forwarding traffic out a PortChannel, the switch hashes the low-order bits of the configured header fields (`port-channel load-balance <method>`) so that all packets belonging to a single conversation follow the exact same physical link—preventing packets within a flow from arriving out of order while distributing different flows across the member links.",
    "EtherChannel balances per-flow (via XOR hashing of MAC/IP/port bits) rather than per-packet round-robin so packets in a single flow never arrive out of order.",
    ["port-channel load-balance", "show etherchannel load-balance", "test etherchannel load-balance"]
  ),
  c10.s(
    "EtherChannel", "Medium",
    "An engineer already bundled `Gi0/1` and `Gi0/2` into working Layer 2 EtherChannel `Port-channel 1` (`Po1(SU)`). Now the engineer wants to convert the link into an 802.1Q trunk with native VLAN 99. Where should the trunking commands be entered?",
    "Under `interface port-channel 1`, which automatically propagates settings to `Gi0/1` and `Gi0/2`",
    [
      ["Under `interface Gi0/1` only, while leaving `Gi0/2` as an access port so `Po1` can carry both tagged and untagged frames", "Changing trunk mode or native VLAN on only one physical member port causes a configuration mismatch and breaks the EtherChannel (`channel-misconfig`)."],
      ["Under `vlan 99` in Global Configuration mode, because PortChannel interfaces cannot accept `switchport` subcommands", "Layer 2 PortChannel interfaces (`interface port-channel <n>`) accept all standard `switchport` and `spanning-tree` subcommands."],
      ["In Privileged EXEC mode using `etherchannel trunk 1 native 99` so the bundle does not flap", "There is no `etherchannel trunk` EXEC command; configuration changes are applied under `interface port-channel 1` in `(config-if)#` mode."]
    ],
    "Once physical interfaces are bundled into a `Port-channel` interface, you should apply any new `switchport` (trunking, access VLAN, allowed VLANs, native VLAN) or `spanning-tree` commands directly to `interface port-channel <n>`. Cisco IOS automatically copies those commands to all physical member interfaces in `running-config`, preventing member mismatches.",
    "Configure `switchport` and `spanning-tree` settings under `interface port-channel <n>` so IOS applies them identically to all member ports.",
    ["interface port-channel", "switchport mode trunk", "switchport trunk native vlan"]
  ),
  c10.t(
    "EtherChannel", "Medium",
    "Match each status flag from `show etherchannel summary` to its exact meaning.",
    [
      ["S", "PortChannel is operating at Layer 2 (Switching)"],
      ["R", "PortChannel is operating at Layer 3 (Routing)"],
      ["U", "PortChannel is in use (up and working)"],
      ["D", "PortChannel or physical member port is down"],
      ["P", "Physical member port is actively bundled in the PortChannel"]
    ],
    "In `show etherchannel summary`, a working Layer 2 EtherChannel shows `Po1(SU)` (`S` = Layer 2, `U` = in use/working) with member ports showing `(P)` (`P` = bundled in port-channel). A broken Layer 2 EtherChannel shows `Po1(SD)` (`D` = down), while a Layer 3 routed EtherChannel shows `(RU)`.",
    "Healthy L2 EtherChannel = `Po1(SU)` with members `(P)`. Broken L2 EtherChannel = `Po1(SD)` with members `(D)`, `(I)` (stand-alone), or `(s)` (suspended).",
    ["show etherchannel summary"]
  ),
  c10.d(
    "EtherChannel", "Medium",
    "Order the steps a switch performs when physical interfaces `Gi0/1` and `Gi0/2` are configured with `channel-group 1 mode on`, but `Gi0/1` has `spanning-tree cost 10` while `Gi0/2` has default STP cost 4.",
    [
      "The switch checks the physical member ports (`Gi0/1` and `Gi0/2`) and detects mismatched local Spanning Tree settings",
      "STP consistency checking triggers a `channel-misconfig (STP)` error on the switch",
      "The switch places physical ports `Gi0/1` and `Gi0/2` into the `err-disabled` state (`Gi0/1(D)`, `Gi0/2(D)`)",
      "The logical `Port-channel 1` interface transitions to down (`Po1(SD)` in `show etherchannel summary`)",
      "After the engineer equalizes the STP cost on the ports, the engineer runs `shutdown` and `no shutdown` to recover the `err-disabled` interfaces"
    ],
    "Even when using `channel-group <n> mode on` (which skips PAgP/LACP negotiation), a switch verifies that all physical member ports have matching speed, duplex, access/trunk mode, VLAN settings, and local STP settings. If local STP settings differ between member ports, `channel-misconfig (STP)` places the ports into `err-disabled` (`D`) and brings down `Po1(SD)`.",
    "Physical member ports in an EtherChannel must match: speed, duplex, access/trunk mode, access/native/allowed VLANs, and STP settings.",
    ["show etherchannel summary", "show interfaces status", "shutdown", "no shutdown"]
  ),
  c10.m(
    "STP", "Hard",
    "Examine the `show spanning-tree vlan 10` output below from `SW2`. Which three facts can be determined directly from this output?",
    [
      "`SW2` is not the root switch for VLAN 10; the root switch has base priority `24576` and MAC address `0200.0001.0001`.",
      "`SW2`'s local Bridge ID priority is `32778` from base `32768` plus VLAN `10`, and its elected Root Port is `Gi0/1`.",
      "The neighbor on `Gi0/1` advertised a root cost of `0` since `Gi0/1`'s port cost is `4` and `SW2`'s total Root Cost is `4`."
    ],
    [
      ["`SW2` is the root switch for VLAN 10 because `Gi0/2` is listed as a Designated (`Desg`) port in the `FWD` state.", "If `SW2` were the root switch, the `Root ID` section would state `This bridge is the root`, and `SW2` would have no `Root` port (`Gi0/1`)."],
      ["Interface `Gi0/3` is currently in the 802.1D `Listening` state waiting 15 seconds to become a second Root Port.", "The top line shows `Spanning tree enabled protocol rstp` (RPVST+), where `Altn BLK` means `Gi0/3` is an RSTP **Alternate** port in the **Discarding** state."],
      ["The STP port priority of interface `Gi0/1` was manually changed to `1` using the `spanning-tree port-priority 1` command.", "`128.1` shows the default port priority of `128` combined with internal port number `1` (and port-priority can only be set in increments of 16)."]
    ],
    "In `show spanning-tree vlan 10`, the **Root ID** block describes the elected root switch (`Priority 24586` = base `24576` + sys-id-ext `10`, MAC `0200.0001.0001`, total Root Path `Cost 4`, via Root Port `Gi0/1`), while the **Bridge ID** block describes `SW2` itself (`Priority 32778` = base `32768` + sys-id-ext `10`, MAC `0200.0002.0002`). Because `Gi0/1` has a local port cost of `4` and `SW2`'s total root path cost is also `4`, `Gi0/1` must be connected directly to the root switch (which advertised cost `0`).",
    "In `show spanning-tree`: **Root ID** = the Root Switch (and *my* total cost/RP to reach it); **Bridge ID** = *this* local switch.",
    ["show spanning-tree vlan"],
    {
      cli: "SW2# show spanning-tree vlan 10\nVLAN0010\n  Spanning tree enabled protocol rstp\n  Root ID    Priority    24586\n             Address     0200.0001.0001\n             Cost        4\n             Port        1 (GigabitEthernet0/1)\n             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec\n\n  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)\n             Address     0200.0002.0002\n             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec\n\nInterface           Role Sts Cost      Prio.Nbr Type\n------------------- ---- --- --------- -------- --------------------------------\nGi0/1               Root FWD 4         128.1    P2p\nGi0/2               Desg FWD 4         128.2    P2p\nGi0/3               Altn BLK 4         128.3    P2p"
    }
  ),
  c10.s(
    "EtherChannel", "Hard",
    "Examine the `show etherchannel summary` and `show spanning-tree vlan 1` output below from `SW1`. When physical ports `Gi0/1` and `Gi0/2` are bundled into `Port-channel 1` (`Po1`), how does Spanning Tree Protocol treat the bundle?",
    "STP treats `Po1` as a single logical interface with lower port cost `3` and forwards traffic across both links without blocking.",
    [
      ["STP places `Gi0/1` into Forwarding and `Gi0/2` into Alternating/Discarding inside `Po1` to prevent a Layer 2 loop between the two wires.", "EtherChannel prevents Layer 2 loops across parallel links specifically by hiding the individual physical wires from STP so both links forward simultaneously."],
      ["STP adds the individual port costs of `Gi0/1` (4) and `Gi0/2` (4) together, giving `Po1` a higher STP cost of `8`.", "Bundling two 1-Gbps links increases bandwidth to 2 Gbps, which *lowers* the STP port cost of `Po1` (from 4 down to 3), never raising it to 8."],
      ["STP disables RPVST+ on `Po1` completely and relies on LACP keepalives to detect multi-switch topology loops.", "STP still runs on `Po1` to prevent loops across the wider multi-switch topology; it simply treats `Po1` as one logical link."]
    ],
    "Without EtherChannel, STP sees two parallel links between switches as a loop and blocks one of them. When bundled into an EtherChannel (`Po1(SU)`), STP operates strictly on the logical `Po1` interface (listing `Po1` instead of `Gi0/1` and `Gi0/2` in `show spanning-tree`), lowers the port cost because the aggregated bandwidth is higher, and allows both physical links (`P`) to forward traffic simultaneously.",
    "STP sees an EtherChannel (`Po1`) as ONE logical interface with higher bandwidth (lower STP cost), so all bundled links forward without STP blocking.",
    ["show etherchannel summary", "show spanning-tree"],
    {
      cli: "SW1# show etherchannel summary\nGroup  Port-channel  Protocol    Ports\n------+-------------+-----------+-----------------------------------------------\n1      Po1(SU)         LACP      Gi0/1(P)   Gi0/2(P)\n\nSW1# show spanning-tree vlan 1 | begin Interface\nInterface           Role Sts Cost      Prio.Nbr Type\n------------------- ---- --- --------- -------- --------------------------------\nPo1                 Root FWD 3         128.65   P2p"
    }
  ),
  c10.s(
    "EtherChannel", "Hard",
    "Switch `SW1` and Switch `SW2` have two 1-Gbps cables connecting `Gi0/1`-to-`Gi0/1` and `Gi0/2`-to-`Gi0/2`. On `SW1`, the administrator configures `channel-group 1 mode on` on both `Gi0/1` and `Gi0/2`, but forgets to configure `channel-group` on `SW2` (leaving `SW2`'s `Gi0/1` and `Gi0/2` as two independent switch ports). Why is this a dangerous misconfiguration?",
    "`SW1` bundles both ports unconditionally while `SW2` keeps them separate, causing Layer 2 loops and MAC table flapping.",
    [
      ["`SW1` automatically detects that `SW2` is not sending LACP frames and places `Po1` into the `suspended (s)` state.", "Because `SW1` was configured with `mode on`, it disables both PAgP and LACP negotiation and blindly forces `Po1` up (`SU`) without checking the neighbor."],
      ["`SW2` automatically adopts `channel-group 1 mode on` via CDP advertisements so the bundle forms safely anyway.", "CDP never configures EtherChannel bundles; without PAgP or LACP configured on both switches, `SW2` treats `Gi0/1` and `Gi0/2` as separate links."],
      ["Both switches shut down `Gi0/1` and `Gi0/2` into `disabled` because manual EtherChannels require fiber-optic SFP+ ports.", "Manual (`mode on`) EtherChannels work on both copper and fiber ports, which is why using `mode on` on only one switch creates a dangerous forwarding loop."]
    ],
    "Configuring `channel-group <n> mode on` disables PAgP and LACP entirely, forcing the local switch (`SW1`) to bundle the ports unconditionally (`Po1(SU)`). If the neighbor switch (`SW2`) is not also configured for `mode on`, `SW1` treats the two links as one logical interface (sending single STP BPDUs and load-balancing frames across both links), while `SW2` treats them as two separate physical links—creating unexpected loops, STP inconsistencies, and MAC flapping. This is why dynamic LACP (`active`/`passive`) or PAgP (`desirable`/`auto`) is preferred in production.",
    "Never configure `mode on` on only one end of a link—because `mode on` sends no negotiation packets, the one-sided bundle causes loops/traffic blackholes.",
    ["channel-group", "show etherchannel summary"]
  ),
  c10.s(
    "STP", "Hard",
    "Switch `SW1` (the root switch) is connected directly to `SW2` by two separate parallel GigabitEthernet links: `SW1 Gi0/1` connects to `SW2 Gi0/1`, and `SW1 Gi0/2` connects to `SW2 Gi0/2` (no EtherChannel is configured). Currently `SW2 Gi0/1` is `SW2`'s Root Port (`FWD`) and `SW2 Gi0/2` is `Altn BLK`. An engineer wants `SW2` to prefer `Gi0/2` as its Root Port specifically for **VLAN 20** (while keeping `Gi0/1` for VLAN 10) by changing **port priority** rather than port cost. Where must the `spanning-tree vlan 20 port-priority 64` command be configured?",
    "On upstream switch `SW1`'s interface `Gi0/2` since `SW2` breaks Root Port ties using the neighbor's advertised port priority",
    [
      ["On downstream switch `SW2`'s interface `Gi0/2` since `SW2` compares its own local port priorities when breaking Root Port ties", "In STP Root Port tiebreakers (cost -> neighbor BID -> neighbor port priority -> neighbor port number), `SW2` compares the **upstream neighbor's (`SW1`'s)** port priority sent in the BPDU, not `SW2`'s own local port priority."],
      ["Under `interface vlan 20` on `SW2` since per-VLAN port priority is configured on the local Switched Virtual Interface", "STP port-priority is configured on the physical switch port (`interface Gi0/2`), not on the Layer 3 management SVI (`interface vlan 20`)."],
      ["In Global Configuration mode on `SW2` using `spanning-tree vlan 20 priority 64` to lower the switch priority", "Global `spanning-tree vlan 20 priority` requires increments of 4096 and changes the whole switch's Bridge ID, not which parallel port becomes the Root Port."]
    ],
    "On `SW2`, both `Gi0/1` and `Gi0/2` tie on root path cost (4) and tie on neighbor BID (both connect to `SW1`). According to the STP Root Port tiebreaker rules, `SW2` breaks the tie by examining the **neighbor's port priority** advertised inside the BPDUs arriving from `SW1` (default `128.1` vs `128.2`). Therefore, to influence `SW2` via port-priority, you must lower the port priority on **upstream switch `SW1`'s `Gi0/2`** (`spanning-tree vlan 20 port-priority 64`), whereas to influence `SW2` locally on `SW2` itself, you would lower `SW2`'s local **port cost** (`spanning-tree vlan 20 cost 2` on `SW2 Gi0/2`).",
    "To change which parallel link becomes the Root Port: change **port cost** on the *local downstream* switch, OR change **port-priority** on the *upstream neighbor* switch.",
    ["spanning-tree vlan port-priority", "spanning-tree vlan cost"]
  )
];

export default [
  ...q01,
  ...q02,
  ...q03,
  ...q04,
  ...q05,
  ...q06,
  ...q07,
  ...q08,
  ...q09,
  ...q10
];
