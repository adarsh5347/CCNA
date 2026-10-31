import { mk } from "../build.js?v=76";

// ============================================================================
// v2c01: Introduction to TCP/IP Transport and Applications
// ============================================================================
const c01 = mk("Network Fundamentals", 20, "v2c01");
const c01s = mk("IP Services", 10, "v2c01");

const q01 = [
  c01.s("TCP/UDP", "Easy", "What is the standard byte length of a basic UDP header compared to a basic TCP header without options?",
    "UDP uses an 8-byte header, whereas TCP uses a 20-byte header.",
    [
      ["UDP uses a 12-byte header, whereas TCP uses a 24-byte header.", "Neither 12 bytes nor 24 bytes is the standard base header size for UDP or TCP."],
      ["UDP uses a 20-byte header, whereas TCP uses a 32-byte header.", "20 bytes is the base size of a TCP header, not a UDP header."],
      ["UDP uses a 4-byte header, whereas TCP uses a 16-byte header.", "A 4-byte header would only hold source and destination ports without length or checksum fields."]
    ],
    "Because UDP provides only multiplexing and optional checksum error detection without sequence numbers, acknowledgments, or windowing fields, its header is only 8 bytes long (Source Port, Destination Port, Length, Checksum). A basic TCP header without options requires 20 bytes.",
    "UDP header = 8 bytes (4 fields x 2 bytes); TCP base header = 20 bytes.",
    []),

  c01.s("TCP/UDP", "Easy", "According to RFC 6335 and IANA port assignments, which numerical range defines Ephemeral (Dynamic or Private) ports used temporarily by client applications?",
    "Ports 49152 to 65535",
    [
      ["Ports 0 to 1023", "Ports 0 to 1023 are Well-Known (System) ports assigned to standard server applications."],
      ["Ports 1024 to 49151", "Ports 1024 to 49151 are User (Registered) ports assigned by IANA for specific services."],
      ["Ports 32768 to 61000", "While some operating systems use subsets of this range, RFC 6335 defines 49152 to 65535 as the dynamic range."]
    ],
    "IANA divides transport layer port numbers into three ranges: Well-Known (System) ports from 0 to 1023, User (Registered) ports from 1024 to 49151, and Ephemeral (Dynamic/Private) ports from 49152 to 65535, which client hosts allocate dynamically when initiating connections.",
    "0-1023 = Well-Known; 1024-49151 = Registered; 49152-65535 = Dynamic/Ephemeral.",
    []),

  c01.s("OSI/TCP-IP", "Easy", "In the Uniform Resource Identifier (URI) http://www.example.org/docs/guide.html, which formal component name describes 'www.example.org'?",
    "Authority",
    [
      ["Scheme", "The scheme is the protocol identifier before the colon and slashes, which is 'http' in this URI."],
      ["Path", "The path identifies the specific web page or resource on the server, which is 'docs/guide.html'."],
      ["Fragment Identifier", "A fragment is an optional reference to a sub-section of a resource preceded by a '#' symbol."]
    ],
    "A standard web URI consists of three main parts: the Scheme (such as 'http') before '://', the Authority (such as 'www.example.org') between '//' and '/' identifying the server host name, and the Path (such as 'docs/guide.html') after '/' identifying the specific web page.",
    "URI structure = scheme://authority/path.",
    []),

  c01.s("TCP/UDP", "Easy", "Which transport layer function is performed by both TCP and UDP?",
    "Multiplexing application data streams using source and destination port numbers",
    [
      ["Flow control using a dynamic sliding window to prevent receiver buffer overflow", "Only TCP implements flow control with a Window field; UDP has no windowing mechanism."],
      ["Ordered data transfer and reassembly of out-of-order segments using sequence numbers", "Only TCP numbers bytes with Sequence numbers to reorder data; UDP does not reorder datagrams."],
      ["Error recovery and automatic retransmission of lost segments using acknowledgments", "Only TCP performs reliability and error recovery via ACKs; UDP discards or ignores lost messages."]
    ],
    "Both TCP and UDP support application multiplexing via source and destination port numbers in the Layer 4 header so the receiving host knows which local process should receive the data. Reliability, windowing, connection establishment, and ordered delivery are exclusive to TCP.",
    "Both TCP & UDP = port multiplexing + data transfer. Everything else (ACKs, windowing, ordering, handshake) = TCP only.",
    []),

  c01.s("TCP/UDP", "Medium", "A web browser sends three consecutive 1000-byte TCP segments to a web server with Sequence numbers 5000, 6000, and 7000. All three arrive without error. Using forward acknowledgment, what Acknowledgment number does the server return?",
    "8000",
    [
      ["7000", "7000 is the sequence number of the first byte in the third segment, not the next byte expected after it."],
      ["7999", "7999 is the sequence number of the last byte received in the third segment, whereas TCP uses forward acknowledgment."],
      ["3000", "TCP acknowledges the next expected sequence number in the stream, not the count of bytes received in the window."]
    ],
    "TCP uses forward acknowledgment, meaning the Acknowledgment field specifies the sequence number of the NEXT byte the receiver expects to receive. The three 1000-byte segments carry bytes 5000-5999, 6000-6999, and 7000-7999, so the next expected byte is 8000.",
    "Next Expected Byte = Last Segment's SEQ + Last Segment's Payload Size (7000 + 1000 = 8000).",
    []),

  c01.s("TCP/UDP", "Medium", "Which combination of parameters uniquely defines a single transport socket on a host?",
    "An IP address, a transport protocol (TCP or UDP), and a port number",
    [
      ["A source MAC address, a destination IP address, and an Ethernet Type code", "MAC addresses and EtherTypes operate at Layer 2 and are not part of a Layer 4 socket definition."],
      ["A source IP address, a destination IP address, and an IPv4 Protocol field value", "Those three fields are purely Layer 3 IP header attributes and omit the Layer 4 port number."],
      ["A TCP sequence number, an acknowledgment number, and a sliding window size", "Sequence, acknowledgment, and window fields manage reliability and flow control inside an existing TCP connection."]
    ],
    "A socket is the three-tuple consisting of (IP address, transport protocol, port number), such as (10.1.1.2, TCP, 80). A connection between two hosts is uniquely identified by the pair of sockets at the client and server endpoints.",
    "Socket = (IP address, Transport Protocol, Port Number).",
    []),

  c01.s("OSI/TCP-IP", "Medium", "An Ethernet frame carrying an HTTP request arrives at a web server. What exact values appear in the Ethernet Type field, the IPv4 Protocol field, and the TCP Destination Port field to identify the upper-layer process?",
    "Ethernet Type 0x0800, IPv4 Protocol 6, and TCP Destination Port 80",
    [
      ["Ethernet Type 0x0806, IPv4 Protocol 17, and UDP Destination Port 80", "EtherType 0x0806 identifies ARP, Protocol 17 identifies UDP, and standard HTTP uses TCP rather than UDP."],
      ["Ethernet Type 0x86DD, IPv4 Protocol 6, and TCP Destination Port 443", "EtherType 0x86DD identifies IPv6 rather than IPv4, and port 443 is used for HTTPS (SSL/TLS) rather than standard HTTP."],
      ["Ethernet Type 0x0800, IPv4 Protocol 1, and TCP Destination Port 53", "IPv4 Protocol 1 identifies ICMP, and port 53 is used for DNS rather than HTTP."]
    ],
    "To demultiplex an incoming frame up the stack, the NIC checks the Ethernet Type field (0x0800 indicates an IPv4 packet), the OS checks the IPv4 Protocol field (decimal 6 indicates TCP, whereas 17 indicates UDP), and TCP checks the Destination Port field (80 indicates HTTP).",
    "0x0800 = IPv4; Protocol 6 = TCP (17 = UDP); Port 80 = HTTP.",
    []),

  c01.s("TCP/UDP", "Medium", "How does TCP normally terminate an established connection between two endpoints?",
    "A four-way message exchange using segments with the FIN and ACK flag bits",
    [
      ["A three-way message exchange using segments with the SYN and FIN flag bits", "A three-way exchange with SYN and ACK establishes a connection; SYN is not used to close a connection."],
      ["A single unacknowledged segment transmitted with the FIN and URG flag bits set", "TCP requires bidirectional acknowledgment of connection teardown and does not use the Urgent (URG) bit to close sessions."],
      ["A two-way message exchange where each host sends a standalone FIN segment without ACKs", "Each FIN segment must be acknowledged by the peer, resulting in a four-step termination sequence."]
    ],
    "While TCP connection establishment uses a three-way handshake (SYN, SYN-ACK, ACK), normal TCP connection termination uses a four-way sequence (FIN/ACK, ACK, FIN/ACK, ACK) so that each endpoint can notify its local application process and acknowledge teardown in both directions.",
    "Setup = 3-way handshake (SYN); Teardown = 4-way exchange (FIN).",
    []),

  c01.s("TCP/UDP", "Hard", "A client sends three 1000-byte TCP segments with Sequence numbers 1000, 2000, and 3000. The second segment (SEQ=2000) is dropped in transit, while the first and third segments arrive intact. How does the server respond, and what happens after the client retransmits the missing segment?",
    "The server sends ACK 2000 for the missing segment, and after receiving bytes 2000-2999, sends ACK 4000.",
    [
      ["The server sends ACK 4000 immediately and relies on a negative acknowledgment header option to request bytes 2000-2999.", "Sending ACK 4000 would falsely tell the sender that all bytes through 3999 arrived, preventing retransmission."],
      ["The server discards the third segment (SEQ=3000), sends ACK 2000, and forces the client to retransmit both segment 2000 and segment 3000.", "The server buffers out-of-order segment 3000-3999 so that once bytes 2000-2999 arrive, it can acknowledge all bytes up to 4000."],
      ["The server sends ACK 1999 to indicate the last contiguous byte received, and after retransmission sends ACK 2999.", "TCP uses forward acknowledgment (the next expected byte, 2000 and then 4000), not the last byte received."]
    ],
    "When the server receives bytes 1000-1999 and 3000-3999, it sends a forward acknowledgment of 2000 because byte 2000 is the next contiguous byte needed. Once the client resends segment 2000 (bytes 2000-2999), the server already has 3000-3999 buffered and replies with ACK 4000.",
    "TCP buffers out-of-order segments and ACKs the lowest missing byte; once the gap is filled, the next ACK jumps past all buffered contiguous data.",
    []),

  c01.s("TCP/UDP", "Hard", "A server sends a TCP segment to a client with Acknowledgment = 1000 and Window = 3000. The client immediately transmits three 1000-byte segments (SEQ 1000, 2000, and 3000) before any reply arrives from the server. What must the client do next?",
    "Pause sending additional data segments until it receives a TCP segment from the server that advances the acknowledgment or increases the window.",
    [
      ["Continue transmitting segments up to 65,535 bytes unless the server sends an explicit TCP Reset (RST) segment.", "The client is strictly bound by the 3000-byte Window granted by the server and cannot exceed 3000 unacknowledged bytes."],
      ["Retransmit the first 1000-byte segment (SEQ 1000) immediately to force the server to open a larger sliding window.", "A sender only retransmits when the retransmission timer expires or duplicate ACKs indicate packet loss, not immediately upon filling the window."],
      ["Switch to connectionless UDP transport temporarily until the server's receive buffer space recovers.", "An application cannot dynamically switch a TCP socket to UDP mid-connection."]
    ],
    "The TCP Window field specifies the maximum number of unacknowledged bytes the sender is allowed to have in flight. After sending three 1000-byte segments (3000 bytes total), the client has exhausted the 3000-byte window and must wait for an ACK from the server before sending more data.",
    "Unacknowledged bytes in flight cannot exceed the receiver's advertised Window value.",
    []),

  c01.m("TCP/UDP", "Medium", "Which two application layer protocols use UDP as their transport layer protocol to minimize header overhead and avoid retransmission delays?",
    [
      "Trivial File Transfer Protocol (TFTP) on port 69",
      "Simple Network Management Protocol (SNMP) on port 161"
    ],
    [
      ["Simple Mail Transfer Protocol (SMTP) on port 25", "SMTP requires guaranteed reliable delivery of email messages and therefore uses TCP port 25."],
      ["Post Office Protocol version 3 (POP3) on port 110", "POP3 requires reliable transfer of mail messages and uses TCP port 110."],
      ["Secure Shell (SSH) on port 22", "SSH requires a reliable, ordered, connection-oriented session and uses TCP port 22."]
    ],
    "TFTP (UDP port 69) is designed with a minimal footprint for embedded network devices and implements its own simple acknowledgment logic, while SNMP (UDP port 161) uses UDP for lightweight network management queries. SMTP, POP3, and SSH all rely on TCP.",
    "UDP ports: DHCP (67/68), TFTP (69), SNMP (161), Syslog (514), DNS queries (53).",
    []),

  c01s.d("DNS", "Hard", "A client queries its enterprise recursive DNS server for 'www.cisco.com', which is not currently cached. Place the steps of the recursive DNS lookup in the exact chronological order.",
    [
      "The client sends a UDP port 53 DNS query for www.cisco.com to its configured enterprise DNS server.",
      "The enterprise DNS server queries a Root DNS server and receives a referral to the .com Top-Level Domain (TLD) DNS server.",
      "The enterprise DNS server queries the .com TLD DNS server and receives the IP address of the authoritative cisco.com DNS server.",
      "The enterprise DNS server queries the authoritative cisco.com DNS server and receives the IP address for www.cisco.com.",
      "The enterprise DNS server caches the result and sends a DNS reply containing the IP address back to the client."
    ],
    "When an enterprise recursive DNS server does not have a requested hostname in its cache, it iteratively queries the DNS hierarchy starting at a Root DNS server, followed by the Top-Level Domain (.com) server, and finally the domain's Authoritative DNS server before returning the answer to the client.",
    "Recursive DNS resolution order: Client -> Enterprise DNS -> Root -> TLD (.com) -> Authoritative (cisco.com) -> Client.",
    []),

  c01.t("TCP/UDP", "Easy", "Match each TCP/IP application with its well-known transport protocol and port number.",
    [
      ["FTP Control", "TCP port 21"],
      ["TFTP", "UDP port 69"],
      ["HTTP (WWW)", "TCP port 80"],
      ["SNMP", "UDP port 161"],
      ["Syslog", "UDP port 514"]
    ],
    "Standard IANA port assignments define TCP port 20 for FTP data, TCP port 21 for FTP control, UDP port 69 for TFTP, TCP port 80 for HTTP, UDP port 161 for SNMP, and UDP port 514 for Syslog.",
    "Memorize both the port number AND whether it uses TCP or UDP for ACL and security questions.",
    [])
];

// ============================================================================
// v2c02: Basic IPv4 Access Control Lists
// ============================================================================
const c02 = mk("Security Fundamentals", 15, "v2c02");

const q02 = [
  c02.s("ACLs", "Easy", "Which two numerical ranges are valid for configuring standard numbered IPv4 access control lists in Cisco IOS?",
    "1 to 99 and 1300 to 1999",
    [
      ["100 to 199 and 2000 to 2699", "Ranges 100-199 and 2000-2699 are reserved for extended numbered IPv4 ACLs, not standard ACLs."],
      ["1 to 199 and 1300 to 2699", "This combines both standard and extended ACL ranges; standard ACLs cannot use 100-199 or 2000-2699."],
      ["1 to 100 and 1000 to 1999", "Number 100 is an extended ACL, and numbers 1000-1299 are not valid IPv4 standard ACL numbers."]
    ],
    "Standard numbered IPv4 ACLs use numbers 1 through 99 in the original range and 1300 through 1999 in the expanded range. Extended numbered IPv4 ACLs use 100-199 and 2000-2699.",
    "Standard IPv4 ACL numbers = 1-99 and 1300-1999.",
    ["access-list 1 permit any"]),

  c02.s("ACLs", "Easy", "Which packet header field can a standard IPv4 ACL examine to determine whether a packet matches an access control entry?",
    "Source IPv4 address only",
    [
      ["Destination IPv4 address only", "Standard IPv4 ACLs only inspect the source IPv4 address (except when used with 'access-class out' on VTY lines)."],
      ["Both Source and Destination IPv4 addresses", "Inspecting both source and destination IPv4 addresses requires an extended IPv4 ACL."],
      ["Source IPv4 address and Layer 4 TCP/UDP port numbers", "Inspecting TCP or UDP port numbers requires an extended IPv4 ACL."]
    ],
    "Standard IPv4 ACLs use simple matching logic that compares only the packet's source IPv4 address (or a portion of it using a wildcard mask). Matching destination IP addresses, protocols, or transport ports requires an extended ACL.",
    "Standard ACL = Source IP only; place close to the destination.",
    []),

  c02.s("ACLs", "Easy", "Where does Cisco recommend placing a standard IPv4 ACL in a network topology, and why?",
    "As close to the destination as possible so it does not block traffic to other subnets",
    [
      ["As close as possible to the source, to conserve network bandwidth by dropping unwanted packets early", "Extended ACLs are placed close to the source; placing a standard ACL near the source blocks that source from reaching all destinations."],
      ["Inbound on the default gateway interface of the source host, to filter packets before routing occurs", "Inbound on the source host's default gateway is as close to the source as possible, which is the rule for extended ACLs."],
      ["Only on WAN serial interfaces between core routers, because LAN interfaces do not support outbound ACLs", "Both LAN and WAN interfaces support inbound and outbound IPv4 ACLs."]
    ],
    "Because a standard ACL can only match the packet's source IPv4 address, placing it near the source would filter that host's packets toward all destinations. Placing a standard ACL close to the intended destination ensures it only filters traffic heading toward that specific destination.",
    "Standard ACL = near Destination; Extended ACL = near Source.",
    []),

  c02.s("ACLs", "Easy", "What happens to an IPv4 packet entering an interface with an inbound ACL applied if the packet does not match any of the configured access-list statements?",
    "The router discards the packet because every IPv4 ACL ends with an implicit deny any action.",
    [
      ["The router forwards the packet normally because unmatched traffic is permitted by default.", "Firewalls and Cisco ACLs default to denying unmatched traffic via an implicit deny any at the end of the list."],
      ["The router holds the packet in a buffer and sends an ARP request to verify the source MAC address.", "ACLs operate at Layer 3/4 and never buffer unmatched packets for ARP verification."],
      ["The router forwards the packet but increments the implicit deny counter displayed in show ip access-lists.", "The packet is discarded, and IOS does not maintain or display a match counter for the implicit deny statement."]
    ],
    "Every Cisco IOS IPv4 ACL includes an implicit 'deny any' at the end of the list. If a packet is compared against every configured ACE from top to bottom without a match, the router automatically drops the packet.",
    "Every ACL ends with an unseen implicit 'deny any' (which has no match counter unless you configure an explicit 'deny any').",
    ["show ip access-lists"]),

  c02.s("ACLs", "Medium", "Which standard ACL command matches all packets sourced from hosts in subnet 172.16.8.0/22 and no other addresses?",
    "access-list 10 permit 172.16.8.0 0.0.3.255",
    [
      ["access-list 10 permit 172.16.8.0 255.255.252.0", "255.255.252.0 is the subnet mask for /22; ACL statements require a wildcard mask (0.0.3.255)."],
      ["access-list 10 permit 172.16.8.0 0.0.7.255", "Wildcard mask 0.0.7.255 matches a /21 block (172.16.8.0 through 172.16.15.255), which is twice as large as /22."],
      ["access-list 10 permit 172.16.8.0 0.0.1.255", "Wildcard mask 0.0.1.255 matches only a /23 block (172.16.8.0 through 172.16.9.255), missing half the /22 subnet."]
    ],
    "A /22 prefix corresponds to subnet mask 255.255.252.0. Subtracting 255.255.252.0 from 255.255.255.255 yields the wildcard mask 0.0.3.255, which matches addresses from 172.16.8.0 through 172.16.11.255.",
    "Wildcard Mask = 255.255.255.255 - Subnet Mask.",
    ["access-list 10 permit 172.16.8.0 0.0.3.255"]),

  c02.s("ACLs", "Medium", "What exact range of source IPv4 addresses is matched by the command 'access-list 45 permit 172.30.96.0 0.0.3.255'?",
    "172.30.96.0 through 172.30.99.255",
    [
      ["172.30.96.0 through 172.30.96.3", "A wildcard mask of 0.0.0.3 would match 172.30.96.0 through 172.30.96.3; here the 3 is in the third octet."],
      ["172.30.96.0 through 172.30.100.255", "Adding 0.0.3.255 to 172.30.96.0 gives 96 + 3 = 99 in the third octet, not 100."],
      ["172.30.0.0 through 172.30.99.255", "The low end of the matched range begins at the configured address 172.30.96.0, not 172.30.0.0."]
    ],
    "To find the range of IPv4 addresses matched by a contiguous wildcard mask, start with the base address in the command (172.30.96.0) and add the wildcard mask (0.0.3.255) octet by octet: 172.30.(96+3).(0+255) = 172.30.99.255.",
    "High Address = Base Address + Wildcard Mask.",
    ["show ip access-lists"]),

  c02.s("ACLs", "Medium", "An engineer enters 'access-list 21 permit 10.1.1.1 0.0.255.255' in global configuration mode. How does Cisco IOS store this statement in the running configuration?",
    "access-list 21 permit 10.1.0.0 0.0.255.255",
    [
      ["access-list 21 permit 10.1.1.1 0.0.255.255", "IOS automatically zeroes out any address bits/octets where the wildcard mask has binary 1s (decimal 255)."],
      ["access-list 21 permit host 10.1.1.1", "A wildcard mask of 0.0.255.255 was supplied, so IOS treats it as a /16 range rather than a single host."],
      ["IOS rejects the command and prints an inconsistent address and mask error message.", "IOS accepts the command without error and silently converts the ignored octets in the address to 0."]
    ],
    "When you configure an access-list statement with a wildcard mask, Cisco IOS applies the wildcard mask to the configured address and zeroes out any bit positions that are set to 1 (ignore) in the wildcard mask. Because the last two octets of the wildcard mask are 255.255, IOS stores 10.1.0.0 0.0.255.255.",
    "Any octet with 255 in the wildcard mask gets converted to 0 in the stored ACL address field.",
    ["show running-config", "show ip access-lists 21"]),

  c02.s("ACLs", "Medium", "A router has ACL 50 configured and applied outbound on interface GigabitEthernet0/0. If an administrator logged into the router's CLI pings a host out GigabitEthernet0/0, how does ACL 50 affect the router's ping packets?",
    "Outbound ACLs do not filter router-originated packets, so the ping exits GigabitEthernet0/0 unfiltered.",
    [
      ["ACL 50 compares the ping packet's source IP address and drops the packet if GigabitEthernet0/0's IP is not permitted.", "Outbound ACLs only filter packets that are routed through the device, not packets locally originated by the router."],
      ["ACL 50 filters the outgoing ICMP echo request only if the log keyword is appended to the deny statement.", "The log keyword generates syslog messages on matches; it does not make outbound ACLs filter local router traffic."],
      ["ACL 50 converts the standard ACL check to match the destination IP address of the ping target.", "Standard ACLs only match destination IP addresses when applied to VTY lines via 'access-class out', not on routed interfaces."]
    ],
    "Cisco IOS applies outbound interface ACLs only to packets being routed through the router. Packets created by the router itself—such as routing protocol messages or local ping and traceroute packets—bypass outbound interface ACLs (though return replies entering an interface with an inbound ACL ARE checked).",
    "Locally generated router packets bypass OUTBOUND interface ACLs.",
    ["ip access-group 50 out"]),

  c02.s("ACLs", "Hard", "Examine the ACL configuration on R1. A packet with source IP address 10.1.1.15 enters GigabitEthernet0/1. Which line of ACL 10 does the packet match, and what happens to the packet?",
    "It matches sequence 10 and is permitted because 10.1.1.15 is in 10.1.0.0/16.",
    [
      ["It matches sequence 30 and is denied because 10.1.1.15 is an exact match for host 10.1.1.15.", "ACLs use first-match (top-down) logic, not longest-prefix match like a routing table."],
      ["It matches sequence 20 and is denied because 10.1.1.0/24 is more specific than 10.1.0.0/16.", "Sequence 10 is evaluated before sequence 20 and matches all 10.1.x.x addresses, so sequence 20 is never reached."],
      ["It is dropped by the implicit deny any at the end of ACL 10.", "10.1.1.15 matches the very first statement (10.1.0.0 0.0.255.255) and is permitted."]
    ],
    "Unlike IP routing tables (which use longest-prefix match), Cisco ACLs strictly follow top-down, first-match logic. When a packet from 10.1.1.15 arrives, the router compares it to sequence 10 first (`permit 10.1.0.0 0.0.255.255`), which matches 10.1.0.0 through 10.1.255.255. The router immediately permits the packet and stops searching the ACL.",
    "Routing tables = longest prefix match; ACLs = top-down first match! Always put specific statements before general ones.",
    ["show ip access-lists 10"],
    { cli: "R1# show ip access-lists 10\nStandard IP access list 10\n    10 permit 10.1.0.0, wildcard bits 0.0.255.255\n    20 deny   10.1.1.0, wildcard bits 0.0.0.255\n    30 deny   10.1.1.15" }),

  c02.s("ACLs", "Hard", "Host A (10.1.1.1/24) is connected to R1 Gi0/0. R1 connects via Serial0/0/0 to R2 Serial0/0/1, and Server S1 (10.2.2.1/24) connects to R2 Gi0/0. An engineer configures 'access-list 5 deny 10.1.1.1' and 'access-list 5 permit any' on R2, and applies 'ip access-group 5 in' on R2 Gi0/0. Why can Host A still reach Server S1?",
    "Packets from Host A exit R2 Gi0/0 toward Server S1 rather than entering R2 Gi0/0, so the inbound ACL on R2 Gi0/0 only inspects packets sourced from Server S1's LAN.",
    [
      ["Standard ACLs cannot match single host addresses without the 'host' keyword explicitly shown in running-config.", "IOS accepts 'access-list 5 deny 10.1.1.1' (and actually strips the 'host' keyword in standard ACLs)."],
      ["The 'ip access-group 5 in' command only filters TCP traffic and allows ICMP pings to pass through.", "Standard IP ACLs filter all IPv4 packets regardless of upper-layer protocol (TCP, UDP, ICMP)."],
      ["ACL 5 must be applied to R2's VTY lines using 'access-class 5 in' before interface filtering activates.", "'access-class' only filters Telnet/SSH to the router itself; 'ip access-group' filters routed interface traffic."]
    ],
    "To filter packets travelling from Host A (10.1.1.1) to Server S1 on R2's Gi0/0 interface, the ACL must be applied OUTBOUND (`ip access-group 5 out`) because those packets exit Gi0/0 onto the server LAN. Applying it inbound on Gi0/0 checks packets coming FROM the server LAN (source 10.2.2.x), which match `permit any`.",
    "Always trace the packet direction relative to the router interface: entering the port = IN; leaving the port = OUT.",
    ["ip access-group 5 out", "show ip interface g0/0"]),

  c02.m("ACLs", "Medium", "An administrator wants to see how many packets are dropped at the end of ACL 15 and also generate syslog messages whenever a dropped packet occurs. Which two facts explain how to achieve this?",
    [
      "Configure 'access-list 15 deny any log' at the end of the ACL.",
      "The default implicit 'deny any' at the end of an ACL does not maintain a match counter in 'show ip access-lists'."
    ],
    [
      ["The 'show ip interface' command displays packet drop counters for each ACL statement.", "'show ip interface' only shows which ACL is applied inbound or outbound; 'show ip access-lists' shows match counters."],
      ["Adding the 'remark' keyword to the last permit statement automatically logs denied packets.", "The 'remark' keyword only adds a text comment to the configuration and has no effect on packet logging or counters."],
      ["Issuing 'logging trap 7' automatically enables per-packet ACL counters for the implicit deny statement.", "'logging trap' controls which severity levels are sent to an external syslog server, not ACL match counting."]
    ],
    "While every IPv4 ACL has an automatic implicit 'deny any' at the end, IOS does not display a packet match counter or generate syslog messages for hits against the implicit deny. Adding an explicit `access-list 15 deny any log` at the end provides both match statistics in `show ip access-lists` and `%SEC-6-IPACCESSLOGNP` syslog messages.",
    "Explicit 'deny any log' at the end of an ACL gives you visibility (match counters + syslog) into dropped traffic.",
    ["access-list 15 deny any log", "show ip access-lists 15"]),

  c02.t("ACLs", "Medium", "Match each subnet mask with the exact wildcard mask used to match that subnet in an IPv4 ACL.",
    [
      ["255.255.255.240 (/28)", "0.0.0.15"],
      ["255.255.255.192 (/26)", "0.0.0.63"],
      ["255.255.254.0 (/23)", "0.0.1.255"],
      ["255.255.248.0 (/21)", "0.0.7.255"]
    ],
    "Subtracting each octet of the subnet mask from 255 gives the corresponding wildcard mask: 255 - 240 = 15 (0.0.0.15); 255 - 192 = 63 (0.0.0.63); 255 - 254 = 1 in the third octet (0.0.1.255); and 255 - 248 = 7 in the third octet (0.0.7.255).",
    "255 - Subnet Mask Octet = Wildcard Mask Octet.",
    [])
];

// ============================================================================
// v2c03: Advanced IPv4 Access Control Lists
// ============================================================================
const c03 = mk("Security Fundamentals", 15, "v2c03");

const q03 = [
  c03.s("ACLs", "Easy", "Which two numerical ranges are valid for extended numbered IPv4 ACLs in Cisco IOS?",
    "100 to 199 and 2000 to 2699",
    [
      ["1 to 99 and 1300 to 1999", "Ranges 1-99 and 1300-1999 identify standard numbered IPv4 ACLs."],
      ["200 to 299 and 2700 to 2999", "Ranges 200-299 and 2700-2999 are not valid IPv4 extended ACL numbers."],
      ["100 to 1299 and 2000 to 4095", "Only 100-199 and 2000-2699 are valid for extended IPv4 ACLs."]
    ],
    "Extended numbered IPv4 ACLs use numbers 100 through 199 in the original range and 2000 through 2699 in the expanded range.",
    "Extended IPv4 ACL numbers = 100-199 and 2000-2699.",
    []),

  c03.s("ACLs", "Easy", "In an extended IPv4 ACL statement, what are the three mandatory matching fields that must always be specified after the permit or deny action?",
    "Protocol, source IPv4 address/wildcard, and destination IPv4 address/wildcard",
    [
      ["Source IPv4 address, source TCP/UDP port number, and destination IPv4 address", "TCP/UDP port numbers are optional parameters; the IP protocol keyword is mandatory."],
      ["Protocol, destination IPv4 address, and destination TCP/UDP port number", "Source IPv4 address is mandatory and comes before the destination IPv4 address; port numbers are optional."],
      ["Inbound interface name, source IPv4 address, and destination IPv4 address", "Interface names are never included inside an access-list statement; ACLs are bound to interfaces with 'ip access-group'."]
    ],
    "Every extended IPv4 ACE requires at minimum three matching parameters in order: the Protocol (such as `ip`, `tcp`, `udp`, or `icmp`), the Source IP address criteria, and the Destination IP address criteria. Layer 4 source and destination port operators are optional when `tcp` or `udp` is specified.",
    "Extended ACL order: permit|deny <protocol> <source-ip> [src-port] <dest-ip> [dst-port].",
    []),

  c03.s("ACLs", "Easy", "Where should an extended IPv4 ACL generally be placed in a network topology?",
    "As close as possible to the source of the traffic being filtered, to prevent unwanted packets from consuming bandwidth across the network",
    [
      ["As close as possible to the destination of the traffic, so other destinations are not accidentally blocked", "Because extended ACLs specify both source and destination IP addresses, placing them near the source does not accidentally block other destinations."],
      ["Only on the central core router's loopback interface, so all transit traffic is inspected in one place", "Loopback interfaces do not transit user traffic; extended ACLs belong on physical/SVI/subinterfaces near the traffic source."],
      ["Outbound on the destination server's LAN interface, to reduce CPU utilization on access routers", "Filtering outbound on the destination router allows unwanted packets to traverse the entire network before being dropped."]
    ],
    "Because extended ACLs can match both source and destination IP addresses, protocols, and ports, they can accurately identify unwanted traffic right at its origin. Placing extended ACLs as close as possible to the source drops disallowed traffic early and saves network bandwidth.",
    "Extended ACL = close to Source; Standard ACL = close to Destination.",
    []),

  c03.s("ACLs", "Medium", "Which extended ACL statement permits HTTP responses returning from web servers in subnet 172.16.5.0/24 to any web client?",
    "access-list 101 permit tcp 172.16.5.0 0.0.0.255 eq www any",
    [
      ["access-list 101 permit tcp 172.16.5.0 0.0.0.255 any eq www", "Putting 'eq www' at the end matches destination port 80, which describes packets going TO a web server, not returning FROM a web server."],
      ["access-list 101 permit ip 172.16.5.0 0.0.0.255 eq www any", "Port operators like 'eq www' are only valid when the protocol is 'tcp' or 'udp', not 'ip'."],
      ["access-list 101 permit tcp any eq www 172.16.5.0 0.0.0.255", "This matches packets sourced from any IP on port 80 going to 172.16.5.0/24, which reverses the source and destination."]
    ],
    "Packets sent FROM a web server to a client originate from the server's subnet (172.16.5.0 0.0.0.255) with a TCP SOURCE port of 80 (`eq www`) and travel to any client IP address (`any`) on an ephemeral destination port. Therefore, `eq www` must immediately follow the source address.",
    "Traffic TO a server = destination port (at the end); traffic FROM a server = source port (right after source IP).",
    ["access-list 101 permit tcp 172.16.5.0 0.0.0.255 eq www any"]),

  c03.s("ACLs", "Medium", "Which extended ACL command matches ICMP traffic sent from any host in the subnet containing 192.168.7.200/26 to any host in the subnet containing 192.168.7.14/29?",
    "access-list 103 permit icmp 192.168.7.192 0.0.0.63 192.168.7.8 0.0.0.7",
    [
      ["access-list 103 permit icmp 192.168.7.200 0.0.0.63 192.168.7.14 0.0.0.7", "192.168.7.200 and 192.168.7.14 are host addresses; the subnet IDs are 192.168.7.192 (/26) and 192.168.7.8 (/29)."],
      ["access-list 103 permit icmp 192.168.7.192 0.0.0.31 192.168.7.8 0.0.0.15", "A /26 mask (.192) requires wildcard 0.0.0.63, and a /29 mask (.248) requires wildcard 0.0.0.7."],
      ["access-list 103 permit ip 192.168.7.192 0.0.0.63 192.168.7.8 0.0.0.7 eq icmp", "ICMP is specified in the protocol field after permit/deny, not as a Layer 4 port with 'eq'."]
    ],
    "For 192.168.7.200/26 (mask 255.255.255.192, block size 64), the subnet ID is 192.168.7.192 and the wildcard mask is 0.0.0.63. For 192.168.7.14/29 (mask 255.255.255.248, block size 8), the subnet ID is 192.168.7.8 and the wildcard mask is 0.0.0.7.",
    "Always calculate the Subnet ID (multiple of block size) and Wildcard Mask (block size - 1) before writing the ACE.",
    ["access-list 103 permit icmp 192.168.7.192 0.0.0.63 192.168.7.8 0.0.0.7"]),

  c03.s("ACLs", "Medium", "An engineer configures a numbered ACL 24 using 'ip access-list standard 24', deletes sequence 20 with 'no 20', and inserts sequence 5 with '5 deny 10.1.1.1'. How does ACL 24 appear in the output of 'show running-config'?",
    "As global 'access-list 24 ...' commands ordered by sequence number, without the sequence numbers displayed",
    [
      ["Under an 'ip access-list standard 24' submode stanza with sequence numbers 5, 10, and 30 explicitly shown", "Named ACLs appear under 'ip access-list' in running-config, but numbered ACLs are always stored as global 'access-list' commands, and sequence numbers are only shown in 'show [ip] access-lists'."],
      ["In the exact chronological order the commands were typed, placing 'access-list 24 deny 10.1.1.1' at the bottom", "Sequence 5 places 'deny 10.1.1.1' at the top of ACL 24 in both 'show ip access-lists' and 'show running-config'."],
      ["The changes do not appear in 'show running-config' until the ACL is removed and reapplied to an interface.", "Edits made in ACL configuration mode take effect immediately in the running configuration."]
    ],
    "Even when you create or edit a numbered ACL using the named-style submode (`ip access-list standard 24`), Cisco IOS always stores numbered ACLs in `running-config` using traditional global `access-list 24 ...` statements, ordered by their sequence numbers (while hiding the sequence numbers themselves unless you run `show ip access-lists`).",
    "Sequence numbers show up in 'show ip access-lists' and 'show access-lists', NOT in 'show running-config'.",
    ["ip access-list standard 24", "show ip access-lists 24", "show running-config"]),

  c03.s("ACLs", "Medium", "Why does Cisco recommend disabling an active ACL on an interface with 'no ip access-group' before deleting and recreating or heavily editing that ACL?",
    "Because as soon as the first line of a recreated ACL is entered, IOS immediately filters live traffic using that incomplete one-line ACL plus the implicit deny any.",
    [
      ["Because Cisco IOS refuses to allow any changes to an ACL that is currently referenced by an 'ip access-group' command.", "IOS allows live editing of active ACLs without error, which is why operational caution is required."],
      ["Because deleting an ACL while 'ip access-group' is configured on an interface causes the interface to enter the err-disabled state.", "Deleting an ACL referenced by 'ip access-group' simply causes IOS to permit all traffic through that interface until a new statement is added."],
      ["Because modified ACL entries are ignored by the router hardware until 'ip access-group' is toggled off and back on.", "IOS applies new ACL entries immediately as soon as each line is entered."]
    ],
    "If you delete an ACL that is still enabled on an interface via `ip access-group`, IOS permits all packets while the ACL does not exist. However, the instant you enter the first line of the new ACL, IOS activates the list—meaning the first statement plus the implicit `deny any` immediately filters live traffic before you finish typing the rest of the ACL.",
    "Unbind the ACL ('no ip access-group') before rebuilding it so partial ACL rules don't blackhole production traffic.",
    ["no ip access-group"]),

  c03.s("ACLs", "Hard", "Examine the extended ACL configured on R1. A host at 10.1.1.5 sends a DNS query over UDP port 53 to a DNS server at 10.2.2.10. Which sequence number (or implicit action) processes this packet?",
    "Sequence 30 permits the packet because 'permit ip' matches all IPv4 packets regardless of whether the transport header is TCP, UDP, or ICMP.",
    [
      ["Sequence 10 denies the packet because it originates from host 10.1.1.5 and targets port 53 (domain).", "Sequence 10 specifies 'tcp', whereas the client's DNS query uses UDP, and all fields in an extended ACE must match."],
      ["Sequence 20 denies the packet because 10.1.1.5 is inside 10.1.1.0/24 and 10.2.2.10 is inside 10.2.2.0/24.", "Sequence 20 only matches UDP packets with destination port 69 (tftp), not UDP port 53."],
      ["The implicit deny any drops the packet because no UDP port 53 statement exists in the ACL.", "Sequence 30 uses protocol 'ip' with 'any' destination, which matches all IPv4 packets including UDP port 53."]
    ],
    "In an extended ACL statement, EVERY parameter must match for the line to match. Sequence 10 fails to match because the packet is UDP, not TCP (`domain` = port 53). Sequence 20 fails to match because the destination port is 53, not 69 (`tftp`). Sequence 30 matches because protocol `ip` matches any IPv4 packet (including UDP) from 10.1.1.0/24 to any destination.",
    "In an extended ACE, ALL parameters must match (Protocol + Source IP + Source Port + Dest IP + Dest Port); protocol 'ip' matches all IPv4 protocols.",
    ["show ip access-lists WEB-FILTER"],
    { cli: "R1# show ip access-lists WEB-FILTER\nExtended IP access list WEB-FILTER\n    10 deny tcp host 10.1.1.5 host 10.2.2.10 eq domain\n    20 deny udp 10.1.1.0 0.0.0.255 10.2.2.0 0.0.0.255 eq tftp\n    30 permit ip 10.1.1.0 0.0.0.255 any" }),

  c03.s("ACLs", "Hard", "Examine the named ACL in the CLI output. An engineer wants to block Telnet traffic from host 172.16.1.50 to 172.16.2.10 without disturbing existing rules. Which configuration sequence accomplishes this?",
    "Use 'ip access-list extended CORP-IN' and '15 deny tcp host 172.16.1.50 host 172.16.2.10 eq telnet'.",
    [
      ["Enter 'ip access-list extended CORP-IN' followed by 'deny tcp host 172.16.1.50 host 172.16.2.10 eq telnet'.", "Omitting a sequence number appends the new statement at the end (sequence 40), after sequence 20 has already permitted all TCP traffic from 172.16.1.0/24."],
      ["Enter 'access-list CORP-IN 15 deny tcp host 172.16.1.50 host 172.16.2.10 eq 23' in global configuration mode.", "Named ACLs cannot be edited with the global 'access-list' command; you must enter 'ip access-list extended CORP-IN'."],
      ["Enter 'ip access-list extended CORP-IN' followed by '25 deny tcp host 172.16.1.50 host 172.16.2.10 eq 23'.", "Sequence 25 comes after sequence 20 ('permit tcp 172.16.1.0 0.0.0.255 172.16.2.0 0.0.0.255'), so host 172.16.1.50 would already be permitted by line 20."]
    ],
    "Because sequence 20 already permits all TCP packets from 172.16.1.0/24 to 172.16.2.0/24, the more specific deny rule for host 172.16.1.50 must be inserted BEFORE sequence 20. Entering `ip access-list extended CORP-IN` and using sequence number 15 (or 11-19) places the deny statement before line 20.",
    "When inserting a specific exception into an existing ACL, pick a sequence number lower than the general rule that would otherwise match it.",
    ["ip access-list extended CORP-IN"],
    { cli: "R1# show ip access-lists CORP-IN\nExtended IP access list CORP-IN\n    10 deny tcp host 172.16.1.99 172.16.2.0 0.0.0.255 eq telnet\n    20 permit tcp 172.16.1.0 0.0.0.255 172.16.2.0 0.0.0.255\n    30 permit ip any any" }),

  c03.m("ACLs", "Medium", "An administrator wants to delete only line 20 ('20 deny udp any any eq tftp') from the extended named ACL 'BRANCH-ACL'. Which two commands entered inside 'ip access-list extended BRANCH-ACL' configuration mode will remove only that single statement?",
    [
      "no 20",
      "no deny udp any any eq tftp"
    ],
    [
      ["no ip access-list extended BRANCH-ACL", "Running 'no ip access-list extended BRANCH-ACL' deletes the entire ACL, not just line 20."],
      ["clear ip access-list BRANCH-ACL 20", "'clear ip access-list counters' resets match statistics; it does not delete configuration lines."],
      ["delete sequence 20", "Cisco IOS ACL submode uses 'no <sequence-number>', not a 'delete sequence' keyword."]
    ],
    "Inside named or numbered ACL configuration mode (`config-ext-nacl` or `config-std-nacl`), you can remove an individual ACE either by referencing its sequence number (`no 20`) or by negating the full permit/deny statement (`no deny udp any any eq tftp`).",
    "Inside ACL config mode: delete a single line with 'no <seq#>' or 'no <statement>'.",
    ["ip access-list extended", "no 20"]),

  c03.t("ACLs", "Easy", "Match each Cisco IOS extended ACL port keyword with its corresponding well-known port number and transport protocol.",
    [
      ["ftp-data", "TCP port 20"],
      ["telnet", "TCP port 23"],
      ["domain", "UDP or TCP port 53 (DNS)"],
      ["bootps", "UDP port 67 (DHCP Server)"],
      ["www", "TCP port 80 (HTTP)"]
    ],
    "Cisco IOS converts well-known port numbers into application keywords in extended ACLs: `ftp-data` (20), `ftp` (21), `telnet` (23), `smtp` (25), `domain` (53), `bootps` (67), `bootpc` (68), `tftp` (69), `www` (80), `pop3` (110), and `snmp` (161).",
    "Notice that IOS uses 'domain' for DNS (53), 'www' for HTTP (80), and 'bootps'/'bootpc' for DHCP (67/68)!",
    [])
];

// ============================================================================
// v2c04: Security Architectures
// ============================================================================
const c04 = mk("Security Fundamentals", 15, "v2c04");

const q04 = [
  c04.s("Threats", "Easy", "In security terminology, which term describes an inherent weakness in a system or design, and which term describes the specific tool or mechanism used to take advantage of that weakness?",
    "A vulnerability is a flaw, and an exploit is the tool used against that flaw.",
    [
      ["A threat is the weakness, and a mitigation is the tool used against that weakness.", "A threat is the potential for an attacker to use an exploit against a vulnerability, while a mitigation is a countermeasure."],
      ["An exploit is the weakness, and a threat is the tool used against that weakness.", "This reverses exploit and vulnerability; the weakness itself is the vulnerability."],
      ["A risk is the weakness, and a reconnaissance scan is the tool used to compromise it.", "Reconnaissance gathers information without exploiting a weakness, and a weakness is specifically called a vulnerability."]
    ],
    "A vulnerability is any weakness that can compromise the security or integrity of a system. An exploit is the specific tool or mechanism designed to take advantage of a targeted vulnerability, while a threat exists when a malicious actor possesses an exploit and intends to use it against a vulnerability.",
    "Vulnerability = Weakness (locked door); Exploit = Tool (pry bar); Threat = Attacker with the pry bar; Mitigation = Stronger lock/alarm.",
    []),

  c04.s("AAA", "Easy", "Within the AAA security framework, what are the distinct roles of Authentication, Authorization, and Accounting?",
    "Authentication verifies identity, Authorization enforces permissions, and Accounting logs user activity.",
    [
      ["Authentication determines what commands a user can run, Authorization verifies the user's password, and Accounting encrypts the session.", "Authentication verifies identity (credentials), whereas Authorization controls permitted actions and privileges."],
      ["Authentication logs user session timestamps, Authorization verifies digital certificates, and Accounting assigns VLAN memberships.", "Logging session activity is Accounting, and verifying digital certificates is Authentication."],
      ["Authentication encrypts management traffic, Authorization assigns IP addresses via DHCP, and Accounting monitors CPU utilization.", "AAA does not replace DHCP or CPU monitoring; it governs identity verification, access rights, and audit logging."]
    ],
    "AAA stands for Authentication ('Who are you?'), Authorization ('What are you permitted to do?'), and Accounting ('What actions did you perform while connected?').",
    "Authentication = Who; Authorization = What allowed; Accounting = What was done.",
    []),

  c04.s("Threats", "Easy", "What distinguishes a computer worm from a virus and a Trojan horse?",
    "A worm self-replicates and spreads across network vulnerabilities without requiring user action.",
    [
      ["A worm must be packaged inside legitimate-looking software and requires a user to install it.", "Malware hidden inside seemingly legitimate software that relies on user installation is a Trojan horse."],
      ["A worm injects its code into an existing executable file and waits for a user to copy that file to another system.", "Malware that injects itself into another application and relies on users transporting the infected file is a virus."],
      ["A worm only gathers reconnaissance data using ping sweeps and cannot modify or damage target systems.", "Worms are self-propagating malware that infect systems and can carry destructive payloads or create botnets."]
    ],
    "Trojan horses disguise themselves inside legitimate software and require user interaction to install. Viruses inject themselves into host applications and require user action to spread. Worms self-replicate and propagate automatically across the network by exploiting system vulnerabilities.",
    "Trojan = disguised package; Virus = self-injects into app (needs user to spread); Worm = propagates automatically over the network.",
    []),

  c04.s("Threats", "Medium", "An attacker sends small DNS or NTP requests to multiple public servers while spoofing the victim's IP address as the source IP, causing those servers to flood the victim with massive responses. What type of attack is this?",
    "An amplification (and reflection) attack",
    [
      ["A man-in-the-middle ARP poisoning attack", "Man-in-the-middle ARP poisoning occurs on a local Layer 2 broadcast domain so an attacker can eavesdrop on or modify traffic."],
      ["A reconnaissance port-scanning attack", "Port scanning probes open TCP/UDP ports to discover running services rather than flooding a victim with amplified responses."],
      ["A dictionary brute-force password attack", "Dictionary and brute-force attacks attempt to guess user credentials rather than reflecting large responses toward a spoofed IP."]
    ],
    "In a reflection attack, an attacker sends packets with a spoofed source IP (the victim's IP) to third-party servers (reflectors) so the replies flood the victim. When the attacker exploits protocols like DNS or NTP so that a tiny request generates a much larger reply, it becomes an amplification attack.",
    "Spoofed Victim Source IP + Third-Party Server = Reflection; Small Request -> Huge Reply = Amplification.",
    []),

  c04.s("Threats", "Medium", "How does an attacker execute a Layer 2 man-in-the-middle attack on a local subnet using ARP?",
    "By sending spoofed ARP replies mapping the legitimate target's IP to the attacker's MAC address",
    [
      ["By flooding the router with TCP SYN segments containing random source IP addresses until the TCP connection table fills", "Flooding a server with half-open TCP SYN segments is a TCP SYN flood Denial-of-Service (DoS) attack, not a man-in-the-middle attack."],
      ["By querying DNS servers with nslookup, whois, and dig to discover the organization's registered public IP blocks", "Using nslookup, whois, and dig to gather domain information is a reconnaissance attack."],
      ["By overflowing a memory buffer on the Ethernet switch ASIC so all frames are broadcast out every switch port", "ARP poisoning compromises the ARP tables of endpoints and routers by sending gratuitous/spoofed ARP replies, not by overflowing switch RAM."]
    ],
    "In an ARP poisoning man-in-the-middle attack, the attacker sends spoofed ARP replies claiming that the default gateway's (or server's) IP address belongs to the attacker's MAC address. Victims update their ARP tables with the poisoned mapping and send their frames to the attacker, who inspects or modifies the data before relaying it to the real destination.",
    "ARP Poisoning = Spoofed ARP Reply mapping Target's IP to Attacker's MAC -> Man-in-the-Middle.",
    []),

  c04.s("Threats", "Medium", "An attacker compromises a DNS server (or modifies a client's local hosts file) so that when users enter the legitimate URL of their bank, name resolution directs them to a fraudulent server. Which attack has occurred?",
    "Pharming",
    [
      ["Spear phishing", "Spear phishing sends targeted emails containing deceptive links to a specific group of users rather than corrupting DNS resolution."],
      ["Whaling", "Whaling is a phishing attack specifically aimed at senior executives or high-profile individuals via deceptive messages."],
      ["Watering hole attack", "A watering hole attack infects a legitimate website frequented by a target group with malware rather than redirecting DNS lookups."]
    ],
    "Unlike phishing—which relies on tricking a user into clicking a disguised link in an email, voice call (vishing), or text message (smishing)—pharming compromises the name resolution infrastructure (such as DNS or a local hosts file) so users typing the real URL are silently redirected to a malicious site.",
    "Phishing = fake link/message (Spear = group, Whaling = executives, Vishing = voice, Smishing = SMS); Pharming = poisoned DNS/hosts redirect.",
    []),

  c04.s("AAA", "Medium", "Which statement accurately contrasts the TACACS+ and RADIUS protocols used between a Network Access Device (NAD) and a AAA server?",
    "TACACS+ uses TCP port 49, encrypts the full AAA body, and separates Auth, Authz, and Accounting.",
    [
      ["TACACS+ is an open IETF standard, uses UDP ports 1812 and 1813, and combines authentication and authorization into one process.", "Those characteristics describe RADIUS (open standard, UDP 1812/1813, combined authentication/authorization)."],
      ["RADIUS is Cisco-proprietary, uses TCP port 49, and encrypts the entire packet payload between the switch and the AAA server.", "RADIUS is standards-based, uses UDP ports 1812 and 1813, and only encrypts the password attribute rather than the whole packet."],
      ["Both TACACS+ and RADIUS use TCP port 443 and require digital certificates on every end-user workstation.", "Neither protocol uses TCP 443; TACACS+ uses TCP 49 and RADIUS uses UDP 1812/1813."]
    ],
    "TACACS+ is a Cisco-proprietary AAA protocol that runs over TCP port 49, encrypts the entire packet payload, and keeps Authentication, Authorization, and Accounting as separate modular processes. RADIUS is an open standard running over UDP ports 1812 and 1813 that combines authentication and authorization and does not encrypt the entire packet.",
    "TACACS+ = Cisco, TCP 49, full encryption, separate AAA. RADIUS = Standard, UDP 1812/1813, partial encryption, combined AuthN/AuthZ.",
    []),

  c04.s("Security architecture", "Hard", "A company implements multifactor authentication requiring an employee to enter a secret PIN on a keypad, insert a USB cryptographic token containing a CA-signed digital certificate, and scan a fingerprint. How are these three credential types categorized?",
    "The PIN is 'something you know', the USB certificate token is 'something you have', and the fingerprint is 'something you are'.",
    [
      ["The PIN is 'something you have', the USB certificate token is 'something you know', and the fingerprint is 'something you are'.", "A memorized PIN or password is 'something you know', while a possessed token or certificate is 'something you have'."],
      ["Both the PIN and USB certificate token are 'something you know', and the fingerprint is 'something you have'.", "A cryptographic token/certificate is a possessed object ('something you have'), and a fingerprint is a biometric trait ('something you are')."],
      ["The PIN is 'something you know', and both the USB certificate token and fingerprint are 'something you are'.", "Only physical biometric characteristics (fingerprints, iris, voice, face) represent 'something you are'."]
    ],
    "Multifactor authentication combines credentials from distinct categories: 'something you know' (a password or PIN), 'something you have' (a hardware token, smartcard, smartphone OTP, or digital certificate with private key proof of possession), and 'something you are' (biometrics such as fingerprints, retina/iris scans, or facial recognition).",
    "Know = Password/PIN; Have = Token/Phone/Certificate; Are = Biometric.",
    []),

  c04.s("Threats", "Hard", "An attacker sends specially crafted input data to a network service that exceeds the size of the temporary memory space allocated by the application, overwriting adjacent memory locations with executable shellcode. What type of attack is this, and what is its potential impact?",
    "A buffer overflow attack, which can crash the target or execute arbitrary attacker code",
    [
      ["A TCP SYN flood attack, which fills the server's half-open connection table until legitimate clients are denied access", "A TCP SYN flood exhausts the TCP state table with incomplete handshakes rather than overwriting memory buffers with oversized data."],
      ["A dictionary offline attack, which extracts password hashes from RAM so they can be cracked on an external computer", "An offline dictionary attack cracks stolen password hashes against a word list rather than overflowing application memory boundaries."],
      ["A watering hole attack, which injects a Trojan horse into a third-party website visited by corporate engineers", "A watering hole attack compromises a frequently visited website rather than overflowing an application's memory buffer."]
    ],
    "When an application fails to validate the length of incoming data before writing it into a fixed-size memory buffer, a buffer overflow vulnerability exists. By sending oversized input containing crafted instructions, an attacker can overwrite adjacent memory and either crash the service/OS or force the system to execute the injected malicious code.",
    "Oversized input overwriting adjacent RAM to crash or run injected code = Buffer Overflow.",
    []),

  c04.m("Security architecture", "Easy", "Which two elements are fundamental components of an enterprise security program focused on human and facility protection?",
    [
      "User awareness and periodic formal training on security policies, phishing recognition, and data handling",
      "Physical access control such as locked wiring closets and electronic badge access with audit trails for data centers"
    ],
    [
      ["Allowing employees to store confidential corporate files on personal cloud drives and USB flash drives for backup", "User awareness guidelines strictly prohibit storing sensitive corporate data on unauthorized cloud services or removable drives."],
      ["Sharing a single anonymous console and VTY password among all IT administrators to simplify management", "Shared passwords prevent individual accountability; AAA with individual usernames and audit trails should be used."],
      ["Leaving distribution wiring closets unlocked during business hours so technicians can quickly replace patch cables", "Network closets and data centers must remain securely locked with controlled badge access at all times."]
    ],
    "An effective corporate security program combines user awareness (educating staff on data confidentiality, phishing/social engineering, and incident reporting), formal periodic user training on security policies, and physical access controls (locking network closets and data centers with badge access that logs identities and timestamps).",
    "Security program pillars = User Awareness + Formal Training + Physical Access Control (badge access/locked closets).",
    []),

  c04.t("Threats", "Medium", "Match each social engineering or password attack term with its accurate description.",
    [
      ["Spear phishing", "Sending deceptive emails with malicious links targeted at a specific group of users with a common trait"],
      ["Whaling", "Targeting high-profile executives or senior officials with deceptive phishing communications"],
      ["Vishing", "Using voice phone calls to deceive victims into revealing sensitive credentials"],
      ["Dictionary attack", "Automated software testing words from a precompiled list to guess a user's password"],
      ["Brute-force attack", "Automated software testing every possible combination of characters, numbers, and symbols to crack a password"]
    ],
    "Phishing variants include spear phishing (targeted group), whaling (executives), vishing (voice calls), and smishing (SMS texts). Password guessing attacks include dictionary attacks (word lists) and brute-force attacks (every possible character combination).",
    "Spear = specific group; Whaling = big fish (executives); Vishing = Voice; Smishing = SMS.",
    [])
];

// ============================================================================
// v2c05: Securing Network Devices
// ============================================================================
const c05 = mk("Security Fundamentals", 15, "v2c05");
const c05s = mk("IP Services", 10, "v2c05");

const q05 = [
  c05.s("Device security", "Easy", "A switch has both 'enable password oak' and 'enable secret pine' configured in global configuration mode. What password must an administrator enter to access privileged EXEC mode?",
    "pine",
    [
      ["oak", "When both 'enable password' and 'enable secret' are configured, IOS always uses 'enable secret' and ignores 'enable password'."],
      ["oak followed by pine", "IOS only prompts for a single enable password and checks it against the 'enable secret' hash."],
      ["Either oak or pine will be accepted", "Only the password defined by 'enable secret' is accepted when both commands exist."]
    ],
    "Whenever both `enable password` and `enable secret` are configured on a Cisco IOS device, IOS exclusively uses the more secure `enable secret` password and completely ignores `enable password`.",
    "enable secret always overrides enable password.",
    ["enable secret"]),

  c05.s("Device security", "Easy", "What happens by default when neither 'enable secret' nor 'enable password' is configured on a Cisco switch, and users attempt to enter privileged EXEC mode?",
    "Console users enter privileged mode without a password, while VTY users are denied privileged mode.",
    [
      ["Both console users and Telnet/SSH users enter privileged mode immediately without a password prompt.", "IOS blocks remote VTY (Telnet/SSH) users from entering privileged mode if no enable password or secret is configured."],
      ["Both console users and Telnet/SSH users are prompted for the default password 'cisco'.", "Cisco IOS does not use a default password 'cisco' for privileged mode; VTY users are simply rejected."],
      ["Console users are denied access to privileged mode, while SSH users are allowed in using their VTY line password.", "Console users are allowed in without a prompt, whereas Telnet/SSH users are rejected until an enable secret/password is configured."]
    ],
    "When neither `enable secret` nor `enable password` is configured, a user connected via the physical console port moves directly into privileged EXEC mode without a password prompt, whereas remote Telnet or SSH users are rejected with an error stating no password is set.",
    "No enable password set = Console gets in free; VTY (Telnet/SSH) is locked out of enable mode.",
    ["enable secret"]),

  c05.s("Device security", "Easy", "Why is storing passwords with 'enable secret' or 'username secret' far more secure than encrypting clear-text passwords with 'service password-encryption'?",
    "Type 7 passwords are easily reversible, whereas 'secret' commands use one-way hashes (Type 5, 8, or 9).",
    [
      ["'service password-encryption' only encrypts VTY passwords and leaves 'enable password' in clear text.", "'service password-encryption' encrypts console, VTY, 'enable password', and 'username password' values as Type 7."],
      ["Issuing 'no service password-encryption' immediately converts all Type 7 passwords back into clear text in the running configuration.", "Running 'no service password-encryption' does NOT decrypt existing Type 7 passwords; they stay Type 7 until changed."],
      ["'enable secret' encrypts passwords using a reversible symmetric key stored in NVRAM.", "'enable secret' does not use reversible encryption; it computes a one-way hash (MD5 or SHA-256/scrypt) and never stores the clear text."]
    ],
    "The `service password-encryption` command obscures clear-text passwords using a weak, easily reversible Type 7 cipher. In contrast, `enable secret` and `username secret` compute a one-way cryptographic hash (Type 5 MD5, Type 8 PBKDF2/SHA-256, or Type 9 scrypt) that cannot be decrypted; IOS hashes the password typed by a user at login and compares the two hashes.",
    "Type 0 = clear text; Type 7 = weak reversible encryption; Type 5 (MD5), Type 8 (SHA-256), Type 9 (scrypt) = one-way hashes.",
    ["service password-encryption", "enable secret", "username secret"]),

  c05.s("Device security", "Medium", "An administrator configures 'service password-encryption' on a router, which converts the console password to Type 7. Later, the administrator enters 'no service password-encryption'. What is the immediate effect on the console password in 'show running-config'?",
    "The existing console password stays encrypted as Type 7 until a new password is set.",
    [
      ["The console password immediately reverts to clear text (Type 0) in the running configuration.", "Disabling 'service password-encryption' does not automatically decrypt passwords that were already encrypted."],
      ["The console password is deleted, and console logins are disabled until a new password is set.", "Turning off password encryption never deletes existing passwords or disables login authentication."],
      ["The console password is automatically upgraded from Type 7 encryption to a Type 5 MD5 hash.", "Line passwords ('password <value>') only support clear text (Type 0) or Type 7, never Type 5 hashes."]
    ],
    "While `service password-encryption` immediately encrypts all clear-text passwords in the running configuration into Type 7 strings, issuing `no service password-encryption` only stops IOS from encrypting future passwords. Existing Type 7 passwords remain encrypted until they are reconfigured.",
    "Encryption with 'service password-encryption' is immediate; decryption after 'no service password-encryption' waits until you change the password.",
    ["service password-encryption", "no service password-encryption"]),

  c05.s("Device security", "Medium", "Which password encoding type number is displayed in 'show running-config' when a user is configured with 'username admin algorithm-type scrypt secret StrongPass1'?",
    "Type 9",
    [
      ["Type 5", "Type 5 represents the default MD5 hash algorithm ('algorithm-type md5' or default 'secret')."],
      ["Type 7", "Type 7 represents weak Vigenere encryption applied by 'service password-encryption' to 'password' commands."],
      ["Type 8", "Type 8 represents PBKDF2 with SHA-256 configured via 'algorithm-type sha256'."]
    ],
    "Cisco IOS supports three hash algorithms for `enable secret` and `username ... secret`: MD5 (default, shown as Type 5), SHA-256/PBKDF2 (`algorithm-type sha256`, shown as Type 8), and scrypt (`algorithm-type scrypt`, shown as Type 9).",
    "Secret hash types: Type 5 = MD5 (default), Type 8 = sha256, Type 9 = scrypt.",
    ["username admin algorithm-type scrypt secret StrongPass1", "enable algorithm-type scrypt secret"]),

  c05.s("Device security", "Medium", "An administrator configures 'access-list 10 permit 10.10.10.0 0.0.0.255' and applies 'access-class 10 out' under 'line vty 0 4'. How does the router use ACL 10?",
    "When a VTY user initiates an outbound Telnet/SSH session, ACL 10 filters the destination IP against 10.10.10.0/24.",
    [
      ["When an external client attempts to Telnet or SSH into the router, ACL 10 checks the client's source IPv4 address against 10.10.10.0/24.", "Filtering incoming Telnet/SSH connections by client source IP requires 'access-class 10 in', not 'out'."],
      ["When a user logged into the router via VTY initiates an outbound Telnet or SSH session, ACL 10 checks the router's own source IPv4 address.", "Uniquely in IOS, 'access-class <acl> out' compares the standard ACL against the DESTINATION IP address of the remote host being contacted."],
      ["The router filters all transit packets exiting physical interfaces unless their source IP is in 10.10.10.0/24.", "'access-class' under 'line vty' only affects VTY management sessions, never transit packets on routed interfaces."]
    ],
    "While `access-class 10 in` on VTY lines filters incoming Telnet/SSH connections based on the client's source IP address, `access-class 10 out` filters outbound Telnet/SSH connections initiated by a CLI user on the router. Uniquely, `access-class out` compares the standard ACL's address field against the target's DESTINATION IP address.",
    "'access-class in' checks client Source IP; 'access-class out' on VTY lines checks target Destination IP!",
    ["access-class 10 in", "access-class 10 out"]),

  c05.s("Security architecture", "Medium", "How does a traditional firewall use security zones (Inside, Outside, and DMZ) to protect an enterprise network?",
    "It allows Inside hosts to initiate connections to the Outside and DMZ, allows Outside hosts to initiate connections only to public servers in the DMZ, and blocks Outside hosts from initiating connections to the Inside.",
    [
      ["It allows Outside hosts to initiate connections to Inside hosts, while blocking Inside hosts from accessing the DMZ.", "Allowing outside Internet hosts to initiate connections to internal enterprise hosts would expose the internal network to attacks."],
      ["It places all internal user workstations inside the DMZ so they can browse the Internet without stateful inspection.", "The DMZ (Demilitarized Zone) holds public-facing servers (such as web or email servers), never internal user workstations."],
      ["It uses stateless router ACLs that ignore which zone initiated the TCP three-way handshake.", "Stateful firewalls track connection state and security zones specifically to enforce which zone is permitted to initiate a session."]
    ],
    "Stateful firewalls group interfaces into security zones. Typical enterprise zone policy allows Inside users to initiate outbound sessions to the Internet (Outside) and DMZ, permits Outside Internet users to initiate connections to public servers in the DMZ (on allowed ports like 80/443), and blocks Outside users from initiating connections into the Inside zone.",
    "Inside -> Outside/DMZ (Yes); Outside -> DMZ public servers (Yes); Outside -> Inside (No!).",
    []),

  c05.s("Security architecture", "Hard", "An attacker runs a port scan against a company's firewall, discovers that TCP port 8443 is open, and tunnels an unauthorized peer-to-peer file-sharing application over TCP port 8443. Which Next-Generation Firewall (NGFW) capability detects and blocks this traffic?",
    "Application Visibility and Control (AVC), which performs deep packet inspection of application layer data rather than relying on TCP/UDP port numbers",
    [
      ["Stateful packet inspection, which tracks TCP SYN, SYN-ACK, and ACK flags in the connection table", "A traditional stateful firewall sees a valid TCP handshake on an allowed port (8443) and permits the traffic without knowing the true application."],
      ["Cisco Talos URL reputation filtering, which blocks HTTP GET requests to low-reputation domain names", "URL filtering inspects web URIs and domain reputations rather than identifying non-web applications disguised on nonstandard ports."],
      ["Network Address Translation (NAT) overload, which translates internal private IP addresses to an outside global address", "NAT/PAT translates IP addresses and transport port numbers but performs no application identification or security inspection."]
    ],
    "Traditional firewalls identify applications primarily by static well-known TCP/UDP ports, which attackers can evade by running applications over nonstandard open ports. A Cisco NGFW uses Application Visibility and Control (AVC) to inspect deep into the Layer 7 payload and headers to identify and filter the actual application regardless of port number.",
    "AVC = Deep Packet Inspection at Layer 7 to identify applications even when using nonstandard ports.",
    []),

  c05.s("Security architecture", "Hard", "A security team is overwhelmed by thousands of daily alerts from a traditional Intrusion Prevention System (IPS) for Linux and macOS server exploits on a VLAN that contains only patched Windows 10 client PCs. How does a Cisco Next-Generation IPS (NGIPS) solve this problem?",
    "Through Contextual Awareness, which gathers host OS, patch level, and running application data to de-emphasize irrelevant signatures and reduce false-positive event logs",
    [
      ["By disabling the exploit signature database entirely and relying solely on Layer 3 source IP access control lists", "An NGIPS still uses exploit signatures; disabling signatures would eliminate core IPS functionality."],
      ["By placing all switch ports in the VLAN into an err-disabled state whenever any signature is triggered", "NGIPS sits inline to discard or redirect malicious packets; it does not err-disable access switch ports like Port Security."],
      ["By encrypting all internal VLAN traffic with MD5 hashes so the IPS no longer needs to inspect packet payloads", "Encrypting traffic with MD5 is impossible (MD5 is a one-way hash), and an IPS must inspect payloads to detect exploits."]
    ],
    "While a traditional IPS compares every packet against its entire exploit signature database and generates massive log volume, a Cisco NGIPS uses Contextual Awareness to collect information about connected hosts (OS, versions, patches, open ports). It then correlates events against actual host vulnerabilities and assigns Event Impact Levels so engineers can focus on real threats.",
    "NGIPS Contextual Awareness = knows host OS/patches/apps to filter out irrelevant signature alerts.",
    []),

  c05s.m("SSH/TFTP", "Medium", "Examine the switch configuration. An administrator wants to configure the switch so that remote CLI connections are only permitted via SSH (blocking Telnet) and are authenticated using the local username database. Which three additional commands are required? (Choose three.)",
    [
      "crypto key generate rsa",
      "login local (under line vty 0 15)",
      "transport input ssh (under line vty 0 15)"
    ],
    [
      ["transport input all (under line vty 0 15)", "'transport input all' allows both unencrypted Telnet and SSH, failing the requirement to block Telnet."],
      ["login (under line vty 0 15)", "The 'login' command alone checks a line password ('password <val>') rather than the local 'username' database."],
      ["service password-encryption", "'service password-encryption' encrypts clear-text passwords in running-config; it does not generate RSA keys or enable SSH."]
    ],
    "To enable SSH on a Cisco IOS device, you must configure a hostname (`hostname`), a domain name (`ip domain-name`), and generate RSA cryptographic keys (`crypto key generate rsa`). On the VTY lines, `login local` tells IOS to authenticate against global `username` entries, and `transport input ssh` restricts remote access to SSH only.",
    "SSH checklist: hostname + ip domain-name + crypto key generate rsa + username/secret + VTY (login local + transport input ssh).",
    ["ip domain-name", "crypto key generate rsa", "login local", "transport input ssh"],
    { cli: "hostname SW1\nip domain-name corp.local\nusername netadmin algorithm-type sha256 secret C1sco123!\nenable secret C1scoEn!\n!\nline vty 0 15" }),

  c05.t("Device security", "Easy", "Match each Cisco IOS password or security configuration command with its accurate behavior.",
    [
      ["enable password <pw>", "Stores the privileged mode password in clear text (Type 0) unless encrypted to Type 7"],
      ["enable secret <pw>", "Stores the privileged mode password as an MD5 hash (Type 5) by default"],
      ["enable algorithm-type sha256 secret <pw>", "Stores the privileged mode password as a PBKDF2 SHA-256 hash (Type 8)"],
      ["service password-encryption", "Encrypts all Type 0 clear-text passwords in the configuration into reversible Type 7 strings"],
      ["access-class <acl> in", "Restricts which client source IP addresses can establish Telnet or SSH connections to VTY lines"]
    ],
    "Cisco IOS uses Type 0 for clear text, Type 7 for `service password-encryption`, Type 5 for default MD5 secrets, Type 8 for SHA-256 secrets, and Type 9 for scrypt secrets. The `access-class` command applies an ACL to VTY lines.",
    "Type 0 = clear, Type 5 = MD5, Type 7 = reversible Vigenere, Type 8 = SHA-256, Type 9 = scrypt.",
    [])
];

// ============================================================================
// v2c06: Implementing Switch Port Security
// ============================================================================
const c06 = mk("Security Fundamentals", 15, "v2c06");

const q06 = [
  c06.s("Port security", "Easy", "What are the default settings on a Cisco Catalyst switch interface immediately after configuring 'switchport mode access' and 'switchport port-security'?",
    "Maximum MAC addresses = 1, violation mode = shutdown, and sticky MAC learning = disabled",
    [
      ["Maximum MAC addresses = 2, violation mode = restrict, and sticky MAC learning = enabled", "The default maximum is 1 (not 2), the default violation mode is shutdown (not restrict), and sticky learning is disabled by default."],
      ["Maximum MAC addresses = 1, violation mode = protect, and sticky MAC learning = enabled", "The default violation mode is shutdown (not protect), and sticky learning must be explicitly enabled."],
      ["Maximum MAC addresses = 8, violation mode = shutdown, and sticky MAC learning = disabled", "The default maximum allowed secure MAC address count is 1, not 8."]
    ],
    "Enabling port security with the `switchport port-security` interface subcommand activates three key defaults: a maximum of 1 allowed MAC address, the `shutdown` violation mode, and dynamic learning of that 1 MAC address (without sticky configuration saving).",
    "Port security defaults: Max MACs = 1; Violation mode = shutdown; Sticky = off.",
    ["switchport port-security", "show port-security interface"]),

  c06.s("Port security", "Easy", "Why does a Cisco switch reject the 'switchport port-security' command on an interface that is still using its factory default switchport mode?",
    "Because the interface defaults to dynamic desirable (or dynamic auto) DTP negotiation, and port security requires a static access or static trunk port.",
    [
      ["Because port security can only be enabled on routed Layer 3 ports configured with 'no switchport'.", "Port security is a Layer 2 switchport feature and cannot be configured on routed ('no switchport') interfaces."],
      ["Because the administrator must first configure at least one static MAC address before enabling port security.", "Configuring static MAC addresses is optional; port security can dynamically learn secure MAC addresses."],
      ["Because the interface must first be administratively shut down with 'shutdown' before port security commands are accepted.", "You do not need to shut down an interface to configure port security; you only need 'switchport mode access' or 'switchport mode trunk'."]
    ],
    "Port security cannot be enabled on a port that dynamically negotiates trunking via DTP (`dynamic auto` or `dynamic desirable`). You must first statically configure the port with `switchport mode access` or `switchport mode trunk` before entering `switchport port-security`.",
    "Prerequisite for 'switchport port-security': static 'switchport mode access' or 'switchport mode trunk'.",
    ["switchport mode access", "switchport port-security"]),

  c06.s("Port security", "Easy", "Which port security violation mode discards offending frames, keeps the interface up/up (Secure-up) to forward legitimate frames, increments the violation counter, and generates syslog/SNMP messages?",
    "Restrict",
    [
      ["Protect", "Protect mode discards offending frames and keeps the port Secure-up, but it does NOT increment the violation counter or send syslog/SNMP messages."],
      ["Shutdown", "Shutdown mode places the port into the err-disabled (Secure-shutdown) state, stopping all traffic including legitimate frames."],
      ["Err-disable", "Err-disable is the operational interface state caused by Shutdown mode, not a configurable violation mode keyword."]
    ],
    "Port security supports three violation modes: `protect` (drops offending frames silently; no log, no counter increment, port stays up), `restrict` (drops offending frames, logs syslog/SNMP alerts, increments violation counter, port stays up), and `shutdown` (puts port into err-disabled/Secure-shutdown state, logs alert, increments counter to 1).",
    "Protect = drop only (silent); Restrict = drop + log + count (port stays up); Shutdown = err-disable + log + count.",
    ["switchport port-security violation restrict"]),

  c06.s("Port security", "Medium", "An access port connects to a Cisco IP Phone that has a desktop PC plugged into the phone's access port. If port security is enabled on the switch port, what is the minimum value required in 'switchport port-security maximum <value>'?",
    "2 secure MAC addresses minimum (one for the Cisco IP Phone and one for the attached PC)",
    [
      ["1, because the IP phone uses Network Address Translation (NAT) to hide the PC's MAC address", "IP phones bridge Layer 2 frames from the PC over the access VLAN; the switch sees both the phone's MAC and the PC's MAC."],
      ["8, because Cisco switches require a minimum maximum of 8 whenever a voice VLAN is configured", "There is no requirement to set the maximum to 8 for a single phone and PC."],
      ["0, which tells port security to allow unlimited MAC addresses on voice-enabled switch ports", "The maximum value must be at least 1; setting at least 2 allows both the phone's MAC address and the attached PC's MAC address."]
    ],
    "When a PC connects through an IP phone to a single switch port, the switch receives frames sourced from both the IP phone's MAC address and the PC's MAC address. Therefore, port security on a voice switchport requires `switchport port-security maximum 2` (or higher).",
    "Voice port with PC behind IP Phone = set 'switchport port-security maximum' to at least 2.",
    ["switchport port-security maximum 2"]),

  c06.s("Port security", "Medium", "An engineer configures 'switchport port-security mac-address sticky' on interface Gi0/5. After a PC sends frames into Gi0/5, the switch reboots unexpectedly. What happens to the learned MAC address after the reboot?",
    "The sticky MAC is lost unless 'copy running-config startup-config' was run before rebooting.",
    [
      ["The sticky MAC address is preserved automatically because sticky learning writes directly to NVRAM startup-config.", "Sticky learning only adds 'switchport port-security mac-address sticky <mac>' to RAM (running-config), not NVRAM (startup-config)."],
      ["The sticky MAC address is preserved in the VLAN database file (vlan.dat) in flash memory.", "The vlan.dat file stores VLAN IDs, names, and VTP settings, never port security MAC addresses."],
      ["The interface enters the err-disabled state upon bootup because a sticky MAC address was not saved to NVRAM.", "After rebooting without saving, Gi0/5 simply has 'switchport port-security mac-address sticky' and learns the first MAC that arrives."]
    ],
    "When `switchport port-security mac-address sticky` is enabled, the switch dynamically learns the source MAC address and inserts `switchport port-security mac-address sticky <mac>` into `running-config`. However, it does NOT automatically copy `running-config` to `startup-config`; you must manually save the configuration to persist sticky MACs across reboots.",
    "Sticky MACs stick to running-config ONLY—you must 'copy run start' to make them survive a reload!",
    ["switchport port-security mac-address sticky", "copy running-config startup-config"]),

  c06.s("Port security", "Medium", "A switch port has port security enabled and has dynamically learned a host's MAC address (without sticky learning). Which command will display this MAC address entry in the switch's MAC address table?",
    "show mac address-table secure (or show mac address-table static)",
    [
      ["show mac address-table dynamic", "Once port security is enabled on an interface, IOS classifies all secure MACs on that port as STATIC entries and omits them from 'show mac address-table dynamic'."],
      ["show mac address-table aging-time", "'show mac address-table aging-time' displays the inactivity timer for dynamic MAC entries, not the secure MAC addresses."],
      ["show port-security interface status", "There is no 'show port-security interface status' command; use 'show mac address-table secure' or 'show port-security address'."]
    ],
    "As soon as port security is enabled on an interface, Cisco IOS treats all MAC addresses associated with that port—even those learned dynamically—as static secure entries in the MAC address table (`STATIC`). Consequently, they do NOT appear in `show mac address-table dynamic`, but DO appear in `show mac address-table secure`, `show mac address-table static`, and `show mac address-table`.",
    "Port security MACs (even dynamically learned ones) show as STATIC in the MAC table; view them with 'show mac address-table secure'.",
    ["show mac address-table secure", "show mac address-table static"]),

  c06.s("Port security", "Medium", "Interface Fa0/12 was placed into the err-disabled state due to a port security violation. After unplugging the unauthorized device, how can an administrator manually bring Fa0/12 back to an operational state?",
    "Enter interface Fa0/12 configuration mode and issue 'shutdown' followed by 'no shutdown'.",
    [
      ["Enter interface Fa0/12 configuration mode and issue 'no shutdown' only.", "Issuing 'no shutdown' alone does not clear the err-disabled state; you must issue 'shutdown' first and then 'no shutdown'."],
      ["Issue 'clear port-security all' in privileged EXEC mode.", "'clear port-security' removes dynamic secure MAC addresses from the table, but it does not bring an err-disabled port back up."],
      ["Enter interface Fa0/12 configuration mode and issue 'no switchport port-security violation shutdown'.", "Changing the violation mode does not recover an interface that has already transitioned to the err-disabled state."]
    ],
    "When a port enters the `err-disabled` state (Port Status: `Secure-shutdown`), it remains disabled until either automatic errdisable recovery triggers (`errdisable recovery cause psecure-violation`) or an engineer manually resets the interface by issuing `shutdown` followed by `no shutdown`.",
    "Manual err-disabled recovery always requires BOTH 'shutdown' and then 'no shutdown'.",
    ["shutdown", "no shutdown", "errdisable recovery cause psecure-violation"]),

  c06.s("Port security", "Hard", "Examine the output of 'show port-security interface fa0/13'. Which statement accurately explains the current state and history of interface FastEthernet0/13?",
    "The port is operational (up/up) in Restrict mode, has dropped 97 violating frames without shutting down, and the most recent violating frame came from MAC 0200.3333.3333 in VLAN 1.",
    [
      ["The port is currently in the err-disabled state and has been manually reset 97 times by an administrator.", "Port Status is 'Secure-up' and Violation Mode is 'Restrict', meaning the port never enters the err-disabled state."],
      ["The port allows up to 97 concurrent MAC addresses, and 0200.3333.3333 is the currently authorized sticky MAC address.", "Maximum MAC Addresses is 1, Sticky MAC Addresses is 0, and 97 is the Security Violation Count."],
      ["The port is dropping all frames from every device on Fa0/13 until 'shutdown' and 'no shutdown' are executed.", "In Restrict mode, the port stays 'Secure-up' and continues forwarding frames from the 1 authorized MAC while dropping frames from unauthorized MACs."]
    ],
    "In `Restrict` violation mode, the interface remains `Secure-up` (operational for the 1 configured secure MAC address) while discarding any frames from other source MAC addresses. Each violating frame increments the `Security Violation Count` (currently 97), logs a `%PORT_SECURITY-2-PSECURE_VIOLATION` message, and updates `Last Source Address:Vlan` (`0200.3333.3333:1`).",
    "Secure-up + high Security Violation Count = Restrict mode actively dropping unauthorized frames while keeping the port up.",
    ["show port-security interface"],
    { cli: "SW1# show port-security interface fa0/13\nPort Security              : Enabled\nPort Status                : Secure-up\nViolation Mode             : Restrict\nAging Time                 : 0 mins\nAging Type                 : Absolute\nSecureStatic Address Aging : Disabled\nMaximum MAC Addresses      : 1\nTotal MAC Addresses        : 1\nConfigured MAC Addresses   : 1\nSticky MAC Addresses       : 0\nLast Source Address:Vlan   : 0200.3333.3333:1\nSecurity Violation Count   : 97" }),

  c06.s("Port security", "Hard", "An engineer configures a switch port with 'switchport mode access', 'switchport port-security', 'switchport port-security maximum 3', and 'switchport port-security mac-address 0200.1111.1111'. How does this interface behave when frames arrive?",
    "It allows static MAC 0200.1111.1111 plus 2 dynamic MACs before a 4th MAC triggers a shutdown violation.",
    [
      ["It allows only MAC 0200.1111.1111 and triggers a violation if any other MAC address arrives, because static and dynamic learning cannot be mixed.", "Port security allows mixing preconfigured static MACs and dynamically learned MACs up to the configured maximum (3)."],
      ["It allows up to 3 dynamically learned MAC addresses in addition to the 1 static MAC address, for a total of 4 MAC addresses.", "'switchport port-security maximum 3' sets the TOTAL limit of all secure MACs (static + sticky + dynamic) on the port to 3, not 3 plus static."],
      ["It automatically saves the next 2 dynamically learned MAC addresses into the running configuration as sticky MACs.", "Sticky learning is not enabled unless 'switchport port-security mac-address sticky' is explicitly configured."]
    ],
    "The `switchport port-security maximum 3` command limits the total number of secure MAC addresses on the interface to 3. Because 1 address (`0200.1111.1111`) is statically configured, the switch can dynamically learn 2 more MAC addresses (1 + 2 = 3). If a frame with a 4th unique source MAC arrives, a violation occurs and the port enters `err-disabled` (`Secure-shutdown`).",
    "Total Allowed MACs = Maximum setting (Static + Sticky + Dynamic combined).",
    ["switchport port-security maximum 3", "switchport port-security mac-address"]),

  c06.m("Port security", "Medium", "An administrator wants ports that are err-disabled by port security violations to automatically recover after 60 seconds. Which two global configuration commands are required?",
    [
      "errdisable recovery cause psecure-violation",
      "errdisable recovery interval 60"
    ],
    [
      ["errdisable recovery cause dhcp-rate-limit", "'dhcp-rate-limit' enables automatic recovery for DHCP Snooping rate-limit violations, not port security violations."],
      ["switchport port-security aging time 60", "'switchport port-security aging time' ages out learned secure MAC addresses; it does not recover an err-disabled interface."],
      ["errdisable recovery cause arp-inspection", "'arp-inspection' enables automatic recovery for Dynamic ARP Inspection rate-limit violations, not port security."]
    ],
    "To automate recovery of ports placed into the `err-disabled` state by port security (`shutdown` mode), configure `errdisable recovery cause psecure-violation` in global configuration mode and set the timer in seconds using `errdisable recovery interval 60` (default interval is 300 seconds).",
    "Port security auto-recovery cause keyword = 'psecure-violation'.",
    ["errdisable recovery cause psecure-violation", "errdisable recovery interval 60"]),

  c06.t("Port security", "Easy", "Match each port security violation mode with its exact combination of actions when a violating frame arrives.",
    [
      ["protect", "Discards offending frames only; port stays up, no syslog message, violation counter stays at 0"],
      ["restrict", "Discards offending frames, sends syslog/SNMP messages, increments violation counter; port stays up"],
      ["shutdown", "Puts port into err-disabled (Secure-shutdown) state discarding all traffic, sends syslog/SNMP, increments counter"]
    ],
    "All three violation modes discard the violating traffic. `protect` does nothing else; `restrict` adds logging and counter increments while keeping the port up; and `shutdown` (the default) places the port into `err-disabled` (`Secure-shutdown`), logs the event, and increments the counter.",
    "Protect = silent drop; Restrict = noisy drop; Shutdown = err-disable port.",
    [])
];

// ============================================================================
// v2c07: Implementing DHCP
// ============================================================================
const c07 = mk("IP Services", 10, "v2c07");
const c07n = mk("Network Fundamentals", 20, "v2c07");

const q07 = [
  c07.s("DHCP", "Easy", "Which four DHCP messages are exchanged in order between a DHCP client and a DHCP server when a host leases an IPv4 address for the first time, and which two of those messages are sent by the client?",
    "Discover, Offer, Request, Acknowledgment (DORA); the client sends Discover and Request.",
    [
      ["Discover, Offer, Request, Acknowledgment (DORA); the client sends Discover and Offer.", "The DHCP server sends the Offer and Acknowledgment messages; the client sends Discover and Request."],
      ["Request, Offer, Discover, Acknowledgment (RODA); the client sends Request and Acknowledgment.", "The process begins with Discover (DORA), and Acknowledgment is sent by the server, not the client."],
      ["Discover, Request, Offer, Acknowledgment (DROA); the client sends Offer and Request.", "The server sends Offer before the client sends Request, and Offer is never sent by a client."]
    ],
    "The four-step DHCP lease process follows the DORA sequence: the client broadcasts a DHCP Discover, the server responds with a DHCP Offer, the client broadcasts a DHCP Request asking to lease the offered IP, and the server finalizes the lease with a DHCP Acknowledgment (ACK).",
    "DORA: Client sends D (Discover) and R (Request); Server sends O (Offer) and A (Ack).",
    []),

  c07.s("DHCP", "Easy", "When a DHCP client without an IPv4 address sends a DHCP Discover packet on its local LAN, what source IPv4 address and destination IPv4 address does it place in the IPv4 header?",
    "Source IP 0.0.0.0 and Destination IP 255.255.255.255",
    [
      ["Source IP 169.254.0.1 and Destination IP 224.0.0.1", "0.0.0.0 is the reserved source IP for unconfigured hosts during DHCP, and 255.255.255.255 is the local broadcast address."],
      ["Source IP 255.255.255.255 and Destination IP 0.0.0.0", "This reverses the source and destination addresses; 255.255.255.255 is never a valid source IP."],
      ["Source IP 127.0.0.1 and Destination IP 255.255.255.255", "127.0.0.1 is the local host loopback address and is never used as a source IP on a physical LAN."]
    ],
    "A host that does not yet have an IPv4 address uses the reserved source IPv4 address `0.0.0.0` and sends the DHCP Discover to the limited local broadcast destination address `255.255.255.255` (which routers do not forward by default).",
    "Unconfigured DHCP client packet = Source 0.0.0.0, Destination 255.255.255.255.",
    []),

  c07n.s("IPv4", "Easy", "On a Windows workstation, which command displays the IPv4 address, subnet mask, default gateway, MAC address, DHCP server address, and DNS server addresses?",
    "ipconfig /all",
    [
      ["ipconfig", "The basic 'ipconfig' command without '/all' displays only the IP address, subnet mask, and default gateway, omitting DNS and DHCP server addresses."],
      ["ifconfig /all", "'ifconfig' is used on macOS and Linux (and does not support a '/all' switch), not on Windows."],
      ["netstat -rn", "'netstat -rn' displays the local host IP routing table, not the DNS servers or DHCP lease details."]
    ],
    "On Windows, `ipconfig` lists only the IPv4 address, subnet mask, and default gateway for each adapter. Adding the `/all` switch (`ipconfig /all`) also reveals the physical MAC address, whether DHCP is enabled, the DHCP server IP, lease timestamps, and the configured DNS server IP addresses.",
    "Windows: 'ipconfig' = IP/Mask/GW; 'ipconfig /all' = adds MAC, DHCP Server, Lease times, and DNS Servers.",
    []),

  c07.s("DHCP", "Medium", "Which DHCP address allocation mode dynamically assigns an IPv4 address from a pool to a client but sets the lease time to infinite so the address stays permanently associated with that client?",
    "Automatic allocation",
    [
      ["Dynamic lease allocation", "Dynamic allocation leases an IPv4 address from a pool for a finite, temporary lease period so unused addresses can be reclaimed."],
      ["Static allocation", "Static allocation requires an administrator to manually preconfigure a specific MAC-to-IP mapping on the DHCP server."],
      ["Relay allocation", "'Relay' refers to a router forwarding DHCP messages via 'ip helper-address', not a DHCP server allocation mode."]
    ],
    "DHCP defines three allocation mechanisms: dynamic allocation (temporary time-limited leases from a pool), automatic allocation (assigns an address from a pool with an infinite lease so the client keeps it permanently), and static allocation (administratively preconfigured IP-to-MAC reservation).",
    "Dynamic = temporary lease from pool; Automatic = infinite lease from pool; Static = hardcoded MAC-to-IP mapping.",
    []),

  c07.s("DHCP", "Medium", "Host A (on R1's Gi0/0 LAN, 172.16.1.1/24) broadcasts a DHCP Discover packet (Src 0.0.0.0, Dst 255.255.255.255). R1 Gi0/0 is configured with 'ip helper-address 172.16.2.11'. How does R1 modify the IPv4 header before routing the packet toward the DHCP server?",
    "R1 sets the Source IP to 172.16.1.1 (Gi0/0) and the Destination IP to 172.16.2.11 (DHCP server).",
    [
      ["R1 leaves the Source IP as 0.0.0.0 and changes only the Destination IP to 172.16.2.11.", "If the source IP remained 0.0.0.0, the remote DHCP server wouldn't know which subnet pool to allocate from or where to route the reply."],
      ["R1 changes the Source IP to its outbound WAN interface IP and leaves the Destination IP as 255.255.255.255.", "Packets addressed to 255.255.255.255 cannot be routed across subnets, and the source/giaddr must identify the client's LAN interface (172.16.1.1)."],
      ["R1 encapsulates the broadcast inside an 802.1Q trunk frame and floods it out all router interfaces.", "A router acting as a DHCP relay converts the broadcast into a unicast IP packet addressed to the helper address."]
    ],
    "When a router interface configured with `ip helper-address 172.16.2.11` receives a client's broadcast DHCP message (`Src 0.0.0.0, Dst 255.255.255.255`), the relay agent rewrites the packet's source IP to the router's own incoming LAN interface IP (`172.16.1.1`, also recorded as `giaddr`) and rewrites the destination IP to the unicast DHCP server address (`172.16.2.11`), then routes the packet.",
    "ip helper-address changes Src IP -> router's inbound LAN IP, and Dst IP -> DHCP server unicast IP.",
    ["ip helper-address 172.16.2.11", "show ip interface g0/0"]),

  c07.s("DHCP", "Medium", "A Layer 2 switch is configured with 'interface vlan 1', 'ip address dhcp', and 'no shutdown', and successfully leases IP 192.168.1.101/24 and default gateway 192.168.1.1. Which two commands verify the DHCP lease details (such as lease time and DHCP server IP) and the learned default gateway?",
    "show dhcp lease and show ip default-gateway",
    [
      ["show running-config and show ip route", "A Layer 2 switch does not store DHCP-learned IP addresses or gateways in 'running-config' and does not use 'show ip route'."],
      ["show interfaces vlan 1 and show ip dhcp binding", "'show interfaces vlan 1' shows the IP/mask but not lease timers or server IP, and 'show ip dhcp binding' is a DHCP server command."],
      ["show ip interface brief and show arp", "Neither command shows DHCP lease timers, the DHCP server address, or the switch's default gateway setting."]
    ],
    "When a Cisco switch acts as a DHCP client (`ip address dhcp`), it does not write the leased IP or default gateway into `running-config`. While `show interfaces vlan 1` shows the current IP address and mask, `show dhcp lease` displays the temporary IP, mask, DHCP lease server, and lease/renewal timers, and `show ip default-gateway` verifies the learned default gateway.",
    "Switch DHCP client verification: 'show dhcp lease' (timers/server/IP) and 'show ip default-gateway'.",
    ["ip address dhcp", "show dhcp lease", "show ip default-gateway"]),

  c07.s("DHCP", "Hard", "Examine the routing table output on router R1. How was this default route learned, and why does it have an administrative distance of 254?",
    "R1's Internet-facing interface is configured as a DHCP client ('ip address dhcp'), and IOS automatically installs a static default route using the DHCP-supplied default gateway with AD 254.",
    [
      ["An administrator manually configured 'ip route 0.0.0.0 0.0.0.0 192.0.2.1', which defaults to an administrative distance of 254.", "A manually configured static route ('ip route') has a default administrative distance of 1, not 254."],
      ["R1 learned the default route dynamically from an ISP router via OSPF default-information originate.", "OSPF routes are marked with code 'O' or 'O*E2' and have an administrative distance of 110, not 'S*' with AD 254."],
      ["R1 is acting as a DHCP relay agent ('ip helper-address 192.0.2.1'), which automatically creates a floating static route.", "Configuring 'ip helper-address' forwards client DHCP broadcasts; it never installs a default route in the routing table."]
    ],
    "When a Cisco router interface is configured with `ip address dhcp` (common on ISP connections), the router uses the default gateway IP address supplied in the DHCP ACK to install a default static route (`S* 0.0.0.0/0`) in its routing table with a default administrative distance of 254.",
    "Router 'ip address dhcp' turns the DHCP default-gateway option into 'S* 0.0.0.0/0 [254/0]'.",
    ["ip address dhcp", "show ip route static"],
    { cli: "R1# show ip route static\nGateway of last resort is 192.0.2.1 to network 0.0.0.0\nS*    0.0.0.0/0 [254/0] via 192.0.2.1" }),

  c07n.s("IPv4", "Hard", "Examine the macOS terminal output. What are the host's IPv4 address and dotted-decimal subnet mask on interface en0, and which additional macOS command is needed to display the DNS server IP addresses?",
    "IP 172.16.4.2, mask 255.255.255.0, and 'networksetup -getdnsservers Ethernet' shows DNS.",
    [
      ["IPv4 address 172.16.4.255, subnet mask 255.255.0.0, and 'ifconfig /all' displays the DNS servers.", "172.16.4.255 is the broadcast address, 0xffffff00 equals 255.255.255.0 (not 255.255.0.0), and 'ifconfig' has no '/all' option."],
      ["IPv4 address 172.16.4.2, subnet mask 255.255.255.240, and 'ipconfig /all' displays the DNS servers.", "Hexadecimal 0xffffff00 converts to 255.255.255.0 (/24), and 'ipconfig /all' is a Windows command, not macOS."],
      ["IPv4 address 172.16.4.2, subnet mask 255.255.255.0, and 'netstat -rn' displays the DNS servers.", "'netstat -rn' displays the host IP routing table (including the default gateway), not DNS server addresses."]
    ],
    "In macOS `ifconfig en0` output, `inet 172.16.4.2` is the host IPv4 address and `netmask 0xffffff00` is the subnet mask in hexadecimal (`0xff` = 255, so `255.255.255.0`). Because `ifconfig` does not show default gateways or DNS servers, macOS uses `networksetup -getinfo <service>` for the router/IP/mask and `networksetup -getdnsservers <service>` for DNS servers.",
    "macOS 'ifconfig' shows netmask in hex (0xffffff00 = 255.255.255.0) and omits Gateway/DNS; use 'networksetup' for DNS/Router.",
    [],
    { cli: "MacHost$ ifconfig en0\nen0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500\n    ether 00:6d:e7:b1:9a:11\n    inet 172.16.4.2 netmask 0xffffff00 broadcast 172.16.4.255\n    status: active" }),

  c07.m("DHCP", "Medium", "Which two conditions must be true about a subnet connected to a router interface for that interface to require the 'ip helper-address' command?",
    [
      "DHCP client hosts reside in the connected subnet.",
      "No DHCP server resides locally in that connected subnet."
    ],
    [
      ["A centralized DHCP server resides directly inside that connected subnet.", "If the DHCP server is on the same local subnet as the clients, broadcasts reach the server directly without a relay agent."],
      ["The router interface itself obtains its IPv4 address dynamically via 'ip address dhcp'.", "A router interface with a static IP address acts as a DHCP relay agent for LAN clients."],
      ["All hosts in the connected subnet are servers configured exclusively with static IPv4 addresses.", "If no DHCP clients exist in the subnet, DHCP relay is not needed on that interface."]
    ],
    "A router interface needs `ip helper-address <server-ip>` if and only if (1) DHCP clients exist in the subnet connected to that interface, and (2) the DHCP server serving those clients is located on a different (remote) subnet.",
    "Use 'ip helper-address' on router LAN interfaces that have DHCP clients but NO local DHCP server.",
    ["ip helper-address"]),

  c07n.t("IPv4", "Medium", "Match each host operating system networking command with its function and OS family.",
    [
      ["ipconfig /all", "Windows command that lists IP address, mask, default gateway, MAC address, DHCP server, and DNS servers"],
      ["networksetup -getinfo Ethernet", "macOS command that lists DHCP configuration, IP address, subnet mask, and default router"],
      ["ip address", "Modern Linux iproute2 command (replacing ifconfig) that lists interface MAC and IPv4/IPv6 addresses with prefix lengths"],
      ["ip route", "Modern Linux iproute2 command (replacing netstat -rn) that lists the host's kernel routing table and default gateway"],
      ["netstat -rn", "Cross-platform command (Windows, macOS, and Linux net-tools) that displays the host IPv4/IPv6 routing table"]
    ],
    "On Linux, the legacy `net-tools` commands (`ifconfig` and `netstat -rn`) have been replaced by the `iproute2` suite (`ip address` and `ip route`). Windows uses `ipconfig` / `ipconfig /all`, while macOS uses `ifconfig`, `netstat -rn`, and `networksetup`.",
    "Linux net-tools vs iproute2: 'ifconfig' -> 'ip address'; 'netstat -rn' -> 'ip route'.",
    [])
];

// ============================================================================
// v2c08: DHCP Snooping and ARP Inspection
// ============================================================================
const c08 = mk("Security Fundamentals", 15, "v2c08");

const q08 = [
  c08.s("DHCP snooping/DAI", "Easy", "What is the default DHCP Snooping and Dynamic ARP Inspection trust state on all Cisco switch interfaces, and which ports should be configured as trusted?",
    "All ports default to untrusted; ports connecting to legitimate DHCP servers, routers (relay agents), and uplink switches should be configured as trusted.",
    [
      ["All ports default to trusted; access ports connecting to end-user PCs must be manually configured as untrusted.", "Both DHCP Snooping and DAI default all switch interfaces to untrusted so end-user ports are protected by default."],
      ["Trunk ports default to trusted and access ports default to untrusted automatically when DHCP Snooping is enabled.", "IOS sets every port (both access and trunk) to untrusted by default; you must explicitly configure 'ip dhcp snooping trust' on trunks/uplinks."],
      ["All ports default to untrusted; end-user PC ports should be configured as trusted so clients can send DHCP Discover packets.", "End-user PC ports must remain untrusted; untrusted ports allow legitimate client DHCP Discover/Request messages while blocking rogue server offers."]
    ],
    "For both DHCP Snooping and Dynamic ARP Inspection (DAI), all switch interfaces default to **untrusted**. Access ports connected to end-user hosts remain untrusted, while ports connected to legitimate DHCP servers, routers, or neighboring switches must be explicitly configured as **trusted** (`ip dhcp snooping trust` and `ip arp inspection trust`).",
    "Default trust state = Untrusted everywhere! Trust uplinks/servers/routers; leave access ports untrusted.",
    ["ip dhcp snooping trust", "ip arp inspection trust"]),

  c08.s("DHCP snooping/DAI", "Easy", "How does DHCP Snooping treat a DHCP Offer or DHCP ACK message that arrives on an untrusted switch port?",
    "It unconditionally discards the message, preventing a rogue (spurious) DHCP server on an access port from leasing addresses or false default gateways.",
    [
      ["It forwards the message only if the Ethernet source MAC address matches the DHCP chaddr field.", "The source MAC vs. chaddr check applies to client messages (Discover/Request); server messages (Offer/ACK) are ALWAYS dropped on untrusted ports."],
      ["It places the untrusted switch port into the err-disabled state immediately upon receiving a single DHCP Offer.", "Receiving a server message on an untrusted port drops the packet without err-disabling the port (unless the rate limit is exceeded)."],
      ["It records the rogue server's offered IP address in the DHCP Snooping binding table and alerts the legitimate server.", "DHCP Snooping only builds binding table entries from valid DHCP ACKs arriving on trusted ports."]
    ],
    "DHCP Snooping categorizes DHCP messages into server messages (such as DHCPOFFER, DHCPACK, DHCPNAK) and client messages. Any DHCP server message arriving on an untrusted port is immediately and unconditionally discarded, stopping rogue DHCP servers from handing out bogus default gateways for man-in-the-middle attacks.",
    "Server messages (Offer/ACK) on an untrusted port = ALWAYS discarded.",
    ["show ip dhcp snooping"]),

  c08.s("DHCP snooping/DAI", "Easy", "What are the characteristics of a gratuitous ARP message, and how do attackers abuse it?",
    "It is an unprompted ARP reply sent to the Ethernet broadcast address; attackers use it to poison the ARP caches of routers and hosts with a spoofed IP-to-MAC mapping.",
    [
      ["It is an ARP request sent to a unicast MAC address; attackers use it to exhaust the DHCP server's address pool.", "A gratuitous ARP is an ARP reply (not request) sent to the broadcast MAC address, and it poisons ARP tables rather than DHCP pools."],
      ["It is an ICMP redirect encapsulated inside an ARP frame; attackers use it to change a host's subnet mask.", "Gratuitous ARP is a pure Layer 2 ARP reply message, not an ICMP packet, and cannot alter a host's subnet mask."],
      ["It is a DHCP Release frame broadcast by a switch; attackers use it to disconnect legitimate clients.", "Gratuitous ARP is an ARP reply announcing an IP-to-MAC mapping without a prior ARP request."]
    ],
    "A gratuitous ARP is an ARP reply sent without having received an ARP request, encapsulated in an Ethernet broadcast frame (`FFFF.FFFF.FFFF`) so all hosts in the VLAN receive it. While legitimate hosts use it when their MAC address changes, attackers send spoofed gratuitous ARPs listing another host's IP with the attacker's MAC to poison ARP tables and launch a man-in-the-middle attack.",
    "Gratuitous ARP = unsolicited broadcast ARP Reply; used by attackers to poison ARP tables.",
    []),

  c08.s("DHCP snooping/DAI", "Medium", "Which two checks does DHCP Snooping perform on client-originated DHCP messages arriving on an untrusted port?",
    "For Discover/Request messages, it verifies that the Ethernet source MAC matches the DHCP chaddr field; for Release/Decline messages, it verifies that the IP and incoming port match the DHCP Snooping binding table.",
    [
      ["For Discover/Request messages, it checks the source IP against the binding table; for Release/Decline messages, it inserts Option 82 and floods the frame.", "Discover/Request messages have source IP 0.0.0.0 and are not in the binding table yet; they are checked for Ethernet source MAC == chaddr."],
      ["It compares all client DHCP messages against configured ARP ACLs and drops any packet without a static ARP entry.", "ARP ACLs are used by Dynamic ARP Inspection (DAI) for static-IP hosts, not by DHCP Snooping."],
      ["It discards all DHCP Discover and Request messages arriving on untrusted ports unless 'ip dhcp snooping trust' is enabled.", "Untrusted ports are meant for DHCP clients and must allow valid Discover and Request messages."]
    ],
    "On untrusted ports, DHCP Snooping inspects client messages in two ways: (1) for `DISCOVER` and `REQUEST` messages, it compares the Ethernet frame's source MAC address against the client hardware address (`chaddr`) inside the DHCP header to stop DHCP starvation attacks; and (2) for `RELEASE` and `DECLINE` messages, it checks the DHCP Snooping binding table to ensure the IP address being released actually belongs to that specific switch port.",
    "Untrusted Client checks: Discover/Request -> Ethernet Src MAC == chaddr; Release/Decline -> Port & IP match binding table.",
    ["show ip dhcp snooping binding"]),

  c08.s("DHCP snooping/DAI", "Medium", "An administrator configures 'ip dhcp snooping' and 'ip dhcp snooping vlan 11' on a Layer 2 access switch, and sets the uplink trunk as trusted. Suddenly, no PCs in VLAN 11 can obtain an IP address from the router's DHCP server. Which command fixes this issue and why?",
    "'no ip dhcp snooping information option', because by default the switch inserts Option 82 into client DHCP messages with a zero giaddr, causing the DHCP server or relay agent to drop them.",
    [
      ["'ip dhcp snooping trust' on all PC access ports, because untrusted ports drop client DHCP Discover messages by default.", "Trusting PC access ports would disable DHCP Snooping protection; untrusted ports permit valid Discover messages."],
      ["'no ip dhcp snooping verify mac-address', because Windows PCs always use a different MAC in chaddr than in the Ethernet header.", "Normal hosts use the same MAC address in both the Ethernet header and the DHCP chaddr field."],
      ["'ip helper-address' on the Layer 2 switch's VLAN 11 interface, because DHCP Snooping disables broadcast flooding in the VLAN.", "A Layer 2 switch does not route or relay DHCP packets; the issue is Option 82 insertion by default."]
    ],
    "By default, enabling DHCP Snooping also enables `ip dhcp snooping information option`, which inserts DHCP Option 82 (relay agent information) into client DHCP messages. When a Layer 2 switch that is NOT acting as a Layer 3 DHCP relay agent inserts Option 82 (leaving `giaddr` set to `0.0.0.0`), downstream routers or DHCP servers reject the packets. Configuring `no ip dhcp snooping information option` disables Option 82 insertion.",
    "On a pure Layer 2 switch running DHCP Snooping, always add 'no ip dhcp snooping information option' (disables Option 82)!",
    ["no ip dhcp snooping information option", "show ip dhcp snooping"]),

  c08.s("DHCP snooping/DAI", "Medium", "How does Dynamic ARP Inspection (DAI) validate an incoming ARP message on an untrusted port by default, and how are hosts with static IP addresses supported?",
    "DAI validates the ARP sender IP and sender MAC against the DHCP Snooping binding table and ARP ACLs.",
    [
      ["DAI compares the ARP target IP and target MAC addresses against the switch's Layer 2 MAC address table (`show mac address-table`).", "DAI checks the ARP sender's (origin) IP and MAC against the DHCP Snooping binding table and ARP ACLs, not the target fields or Layer 2 MAC table."],
      ["DAI sends a unicast ICMP echo request to the ARP origin IP address and waits for a reply before forwarding the ARP frame.", "DAI does not ping hosts; it performs a table lookup in the DHCP Snooping binding database or ARP ACLs."],
      ["DAI compares the Ethernet destination MAC address against the ARP origin hardware address on all trusted and untrusted ports.", "Trusted ports bypass DAI checks completely, and destination MAC validation is an optional check for ARP replies."]
    ],
    "When an ARP request or reply arrives on a DAI-untrusted interface, DAI always compares the ARP body's **origin IP address** (sender IP) and **origin hardware address** (sender MAC) against the switch's DHCP Snooping binding table (for DHCP clients) and any configured ARP ACLs (for statically addressed hosts). If no match is found, the ARP frame is dropped.",
    "DAI core check = ARP Origin IP + Origin MAC vs. DHCP Snooping Binding Table (or ARP ACLs for static IPs).",
    ["ip arp inspection vlan", "show ip arp inspection", "show ip dhcp snooping binding"]),

  c08.s("DHCP snooping/DAI", "Medium", "How do the default message rate limits and configuration options compare between DHCP Snooping and Dynamic ARP Inspection (DAI)?",
    "DHCP Snooping has no rate limit by default (unlimited), whereas DAI defaults to 15 pps on untrusted ports (with a 1-second burst interval) and supports a configurable 'burst interval' parameter.",
    [
      ["Both DHCP Snooping and DAI default to 15 pps on untrusted ports and unlimited on trusted ports.", "DHCP Snooping defaults to unlimited rate on all ports until 'ip dhcp snooping limit rate' is configured."],
      ["DHCP Snooping defaults to 10 pps with a configurable burst interval, whereas DAI has no default rate limit.", "This reverses the two features: DAI has default rate limiting (15 pps) and burst intervals, whereas DHCP Snooping has neither by default."],
      ["Exceeding the rate limit in DHCP Snooping drops only the excess packets, whereas exceeding the DAI rate limit shuts down the entire VLAN.", "Exceeding the configured rate limit in EITHER DHCP Snooping or DAI places the individual switch interface into the err-disabled state."]
    ],
    "Because both DHCP Snooping and DAI inspect packets in the switch's CPU, both support per-port rate limiting that places an offending interface into `err-disabled` if exceeded. However, DHCP Snooping defaults to **no rate limit** (`unlimited`) and only measures messages per 1 second (`ip dhcp snooping limit rate <pps>`), whereas DAI defaults to **rate limiting enabled** (15 pps over a 1-second burst on untrusted ports) and allows configuring multi-second intervals (`ip arp inspection limit rate <pps> [burst interval <sec>]`).",
    "DHCP Snooping default rate = unlimited (no burst option); DAI default rate = 15 pps on untrusted ports (supports 'burst interval').",
    ["ip dhcp snooping limit rate", "ip arp inspection limit rate", "show ip arp inspection interfaces"]),

  c08.s("DHCP snooping/DAI", "Hard", "Examine the CLI output from SW2. Host PC2 connected to Gi1/0/4 is manually configured with static IP address 172.16.2.101 (MAC 0200.2222.2222) and sends an ARP request for the default gateway. What happens and why?",
    "DAI drops the ARP request and increments 'DHCP Drops' because VLAN 11 has DAI active and Gi1/0/4's binding entry maps 0200.2222.2222 to 172.16.2.102, not 172.16.2.101.",
    [
      ["DAI forwards the ARP request because 'Source Mac Validation' and 'IP Address Validation' are both shown as Disabled.", "'Source Mac Validation' and 'IP Address Validation' are optional header checks; DAI's core check against the DHCP Snooping binding table is always active when Operation is Active."],
      ["DAI drops the ARP request and increments 'ACL Drops' because Static ACL is blank for VLAN 11.", "Because no ARP ACL is configured, the drop is counted under 'DHCP Drops' (mismatch against the DHCP Snooping binding table), not 'ACL Drops'."],
      ["DHCP Snooping places interface Gi1/0/4 into the err-disabled state because PC2 used a duplicate IP address.", "DHCP Snooping only inspects DHCP messages, not ARP messages, and a single invalid ARP does not err-disable the port."]
    ],
    "Even when optional validations (`Source Mac`, `Destination Mac`, `IP Address`) are disabled, DAI always compares the ARP origin MAC and origin IP against the DHCP Snooping binding table on untrusted ports. In the binding table, `02:00:22:22:22:22` on Gi1/0/4 is leased `172.16.2.102`, while `172.16.2.101` belongs to `02:00:11:11:11:11` on Gi1/0/3. DAI drops the spoofed ARP from PC2 and increments `Dropped` and `DHCP Drops`.",
    "DAI always checks Origin IP + Origin MAC against 'show ip dhcp snooping binding'; optional 'ip arp inspection validate' checks are extra.",
    ["show ip arp inspection", "show ip dhcp snooping binding"],
    { cli: "SW2# show ip arp inspection\nSource Mac Validation      : Disabled\nDestination Mac Validation : Disabled\nIP Address Validation      : Disabled\n Vlan     Configuration    Operation   ACL Match          Static ACL\n ----     -------------    ---------   ---------          ----------\n   11     Enabled          Active\n\nSW2# show ip dhcp snooping binding\nMacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface\n------------------  ---------------  ----------  -------------  ----  --------------------\n02:00:11:11:11:11   172.16.2.101     86110       dhcp-snooping  11    GigabitEthernet1/0/3\n02:00:22:22:22:22   172.16.2.102     86399       dhcp-snooping  11    GigabitEthernet1/0/4" }),

  c08.s("DHCP snooping/DAI", "Hard", "An engineer configures 'ip arp inspection validate src-mac dst-mac' on a switch, and later enters 'ip arp inspection validate ip' in global configuration mode. Which optional DAI validations are now active on the switch?",
    "Only 'ip' validation is active because each 'ip arp inspection validate' command overwrites the prior one.",
    [
      ["All three optional validations ('src-mac', 'dst-mac', and 'ip') are active because validate commands are cumulative.", "Unlike ACL lines, 'ip arp inspection validate' is a single global command that replaces any previously configured validate options."],
      ["Only 'src-mac' and 'dst-mac' remain active because 'ip' must be configured under interface configuration mode.", "'ip arp inspection validate' is a global command, and the latest entry replaces the old one."],
      ["No optional validations are active because all three keywords must always be typed together for the command to take effect.", "You can enable any one, two, or all three keywords, but you must type all desired keywords on a single command line."]
    ],
    "The `ip arp inspection validate {[src-mac] [dst-mac] [ip]}` global configuration command is not cumulative—entering it a second time completely replaces the previous command. To enable multiple optional checks at the same time, you must specify all desired options on the same command line (e.g., `ip arp inspection validate src-mac dst-mac ip`).",
    "Want multiple DAI optional checks? Put them all on ONE line: 'ip arp inspection validate src-mac dst-mac ip'!",
    ["ip arp inspection validate src-mac dst-mac ip", "show ip arp inspection"]),

  c08.m("DHCP snooping/DAI", "Medium", "An administrator wants to enable DHCP Snooping on VLAN 20 only. Which two global configuration commands are both required before DHCP Snooping becomes operational on VLAN 20?",
    [
      "ip dhcp snooping",
      "ip dhcp snooping vlan 20"
    ],
    [
      ["ip arp inspection vlan 20", "Dynamic ARP Inspection (DAI) uses only 'ip arp inspection vlan 20', whereas DHCP Snooping requires both 'ip dhcp snooping' and 'ip dhcp snooping vlan 20'."],
      ["interface vlan 20 followed by ip dhcp snooping enable", "DHCP Snooping is enabled globally per VLAN, not inside SVI interface configuration mode."],
      ["service dhcp snooping", "The global command is 'ip dhcp snooping', not 'service dhcp snooping'."]
    ],
    "To activate DHCP Snooping on a switch, you must configure **both** the global master switch `ip dhcp snooping` and the per-VLAN activation command `ip dhcp snooping vlan <vlan-list>`. Configuring only one of the two leaves DHCP Snooping inactive. (In contrast, DAI requires only `ip arp inspection vlan <vlan-list>` with no separate master enable command.)",
    "DHCP Snooping needs TWO global commands ('ip dhcp snooping' + 'ip dhcp snooping vlan X'); DAI needs only ONE ('ip arp inspection vlan X').",
    ["ip dhcp snooping", "ip dhcp snooping vlan 20"]),

  c08.t("DHCP snooping/DAI", "Medium", "Match each optional DAI validation keyword or errdisable recovery cause with its exact function.",
    [
      ["ip arp inspection validate src-mac", "Compares the Ethernet frame source MAC address against the ARP body origin hardware address"],
      ["ip arp inspection validate dst-mac", "In ARP replies, compares the Ethernet frame destination MAC address against the ARP body target hardware address"],
      ["ip arp inspection validate ip", "Checks the ARP body IP fields for invalid or unexpected IPv4 addresses (such as 0.0.0.0, 255.255.255.255, or multicast)"],
      ["errdisable recovery cause dhcp-rate-limit", "Automatically recovers ports err-disabled by exceeding 'ip dhcp snooping limit rate'"],
      ["errdisable recovery cause arp-inspection", "Automatically recovers ports err-disabled by exceeding 'ip arp inspection limit rate'"]
    ],
    "DAI supports three optional header validation checks via `ip arp inspection validate`: `src-mac` (Ethernet Src MAC == ARP Origin MAC), `dst-mac` (Ethernet Dst MAC == ARP Target MAC on ARP replies), and `ip` (invalid IP addresses in the ARP body). Automatic err-disabled recovery uses `dhcp-rate-limit` for DHCP Snooping and `arp-inspection` for DAI.",
    "Remember the 3 errdisable recovery causes across Ch 6 & 8: 'psecure-violation', 'dhcp-rate-limit', and 'arp-inspection'.",
    [])
];

// ============================================================================
// v2c09: Device Management Protocols
// ============================================================================
const c09 = mk("IP Services", 10, "v2c09");
const c09n = mk("Network Access", 20, "v2c09");

const q09 = [
  c09.s("Syslog", "Easy", "In the Cisco IOS syslog message '*Oct 21 20:07:24.312: %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to up', what do 'LINK', '3', and 'UPDOWN' represent?",
    "Facility = LINK, Severity level = 3 (Error), and Mnemonic = UPDOWN",
    [
      ["Mnemonic = LINK, Severity level = 3 (Warning), and Facility = UPDOWN", "LINK is the facility and UPDOWN is the mnemonic; also, severity level 3 is Error, whereas level 4 is Warning."],
      ["Facility = LINK, Sequence number = 3, and Severity level = UPDOWN", "The number 3 between the hyphens is the numeric severity level (0-7), not a sequence number."],
      ["Process ID = LINK, Interface slot = 3, and Status code = UPDOWN", "The '%FACILITY-SEVERITY-MNEMONIC' header identifies the IOS facility, syslog severity (0-7), and short event mnemonic."]
    ],
    "Every standard Cisco IOS log message includes a header formatted as `%FACILITY-SEVERITY-MNEMONIC: description`, preceded by an optional timestamp and/or sequence number. Here, `LINK` is the facility, `3` is the severity level (Error), and `UPDOWN` is the mnemonic.",
    "Syslog header format = %FACILITY-SEVERITY-MNEMONIC (0=Emergency .. 3=Error, 4=Warning, 5=Notification, 6=Informational, 7=Debugging).",
    ["show logging"]),

  c09.s("Syslog", "Easy", "An administrator configures 'logging trap 4' (or 'logging trap warnings') and 'logging host 172.16.3.9' on a router. Which syslog severity levels will the router send to the external syslog server at 172.16.3.9?",
    "Severity levels 0, 1, 2, 3, and 4 (Emergency, Alert, Critical, Error, and Warning)",
    [
      ["Severity level 4 (Warning) only", "Specifying a severity level in a logging command includes that level AND all more severe levels (lower numbers 0 through 4)."],
      ["Severity levels 4, 5, 6, and 7 (Warning, Notification, Informational, and Debugging)", "Lower numbers are more severe (0 is Emergency, 7 is Debugging); 'logging trap 4' includes 0-4, not 4-7."],
      ["None, because 'logging trap' only controls SNMP traps and does not affect UDP port 514 syslog messages", "Despite the historical keyword 'trap', 'logging trap <level>' sets the severity threshold for messages sent to external syslog servers."]
    ],
    "Cisco IOS syslog severity levels run from 0 (Emergency, most severe) to 7 (Debugging, least severe). Configuring any logging destination with level N tells IOS to log messages of severity N **and all more severe levels (0 through N)**. Also note that `logging trap <level>` sets the severity threshold for external syslog servers (`logging host`).",
    "Logging level N means levels 0 through N! And 'logging trap' sets the level for the external syslog server.",
    ["logging host 172.16.3.9", "logging trap warnings"]),

  c09.s("Syslog", "Medium", "An engineer connects to a router via SSH and runs 'debug ip ospf hello', but no debug output appears on the screen even though 'logging monitor debugging' is configured. What command must the engineer run to see the messages in this SSH session?",
    "terminal monitor (in privileged EXEC mode)",
    [
      ["logging console debugging (in global configuration mode)", "'logging console' only affects the physical console port, not remote VTY (SSH/Telnet) sessions."],
      ["service sequence-numbers (in global configuration mode)", "'service sequence-numbers' adds sequence numbers to log messages; it does not enable log display on VTY lines."],
      ["terminal monitor (in VTY line configuration mode)", "'terminal monitor' is an EXEC command run per session, not a configuration mode command."]
    ],
    "While console users see log messages automatically by default (`logging console`), remote Telnet and SSH (VTY) users require two things to see real-time log and debug messages: the global configuration command `logging monitor` (enabled by default) AND the per-session EXEC command `terminal monitor`.",
    "SSH/Telnet users need 'terminal monitor' in EXEC mode to see live syslog/debug output.",
    ["terminal monitor", "logging monitor"]),

  c09.s("NTP", "Easy", "In Network Time Protocol (NTP), what does the stratum level indicate, and what happens if a device's stratum reaches 16?",
    "Stratum indicates how many NTP hops a device is from an authoritative reference clock (lower is better); stratum 16 is considered unsynchronized and unusable.",
    [
      ["Stratum indicates the polling interval in seconds; stratum 16 means the device polls its NTP server every 16 seconds.", "Polling interval is measured in seconds (such as 64s) separately from stratum; stratum measures accuracy/distance from the reference clock."],
      ["Stratum indicates the priority of the NTP server where higher numbers (up to 16) are preferred over lower numbers.", "Lower stratum numbers represent more accurate time sources (Stratum 1 is best, connected directly to an atomic/GPS clock)."],
      ["Stratum indicates the timezone offset from UTC; stratum 16 represents 16 hours ahead of UTC.", "Timezone offset is configured via 'clock timezone'; stratum 1 to 15 measures distance/accuracy of the reference clock."]
    ],
    "NTP uses **stratum** (1 to 15) to measure the accuracy of a time source and its distance (in NTP hops) from an authoritative reference clock (such as an atomic clock at Stratum 1). Each downstream NTP client adds 1 to the stratum of its upstream server and prefers the server with the lowest stratum. Stratum 16 indicates that the clock is unsynchronized and untrusted.",
    "NTP Stratum: 1 = best (atomic/primary clock); each hop adds +1; 15 = max usable; 16 = unsynchronized/unusable.",
    ["show ntp status", "show ntp associations"]),

  c09.s("NTP", "Medium", "What is the functional difference between configuring 'ntp master 4' and configuring 'ntp server 172.16.2.2' on a Cisco router?",
    "'ntp master 4' puts the router in NTP server-only mode using its own internal hardware clock (127.127.1.1) at stratum 4, whereas 'ntp server 172.16.2.2' puts the router in client/server mode.",
    [
      ["'ntp master 4' configures the router as a client of four upstream servers, whereas 'ntp server 172.16.2.2' makes the router a Stratum 1 atomic clock.", "'ntp master 4' uses the local internal clock at stratum 4, while 'ntp server' tells the router to synchronize as a client of 172.16.2.2."],
      ["'ntp master 4' synchronizes the router with an external server at 4.4.4.4, whereas 'ntp server 172.16.2.2' disables NTP client mode.", "The number after 'ntp master' is the local clock's stratum level (default 8), not an IP address."],
      ["Both commands configure the router as an NTP client only, requiring 'ntp broadcast' before the router can serve time to other devices.", "A Cisco router configured with 'ntp server' automatically acts as both an NTP client and (once synchronized) an NTP server."]
    ],
    "`ntp master [stratum]` configures the device in NTP server mode using its internal hardware clock (`127.127.1.1`, `.LOCL.`) at the specified stratum (default 8). `ntp server <ip>` configures the device in NTP client/server mode: it acts as a client to synchronize its clock with `<ip>`, and once synchronized, it can also act as an NTP server to downstream clients at `stratum + 1`.",
    "ntp master [st] = Server using local clock (127.127.1.1, default stratum 8); ntp server <ip> = Client AND Server (once synced).",
    ["ntp master", "ntp server"]),

  c09.s("NTP", "Hard", "Examine the 'show ntp status' and 'show ntp associations' outputs from router R1. What is R1's own stratum level, what is the IP address and stratum of R1's upstream NTP server, and what is that server's reference clock?",
    "R1 is Stratum 4, syncing to Stratum 3 server 172.16.2.2, which syncs to reference clock 172.16.3.3.",
    [
      ["R1 is Stratum 3; its upstream NTP server is 172.16.3.3 (which is Stratum 4); and 172.16.3.3 synchronizes to 172.16.2.2.", "'show ntp status' shows R1's own stratum is 4 and its server ('reference') is 172.16.2.2; in 'show ntp associations', 'st 3' and 'ref clock 172.16.3.3' describe the server 172.16.2.2."],
      ["R1 is Stratum 4; it is synchronized to two NTP servers (172.16.2.2 and 172.16.3.3) simultaneously for load balancing.", "R1 has only one configured association (*~172.16.2.2); 172.16.3.3 is the upstream reference clock used by 172.16.2.2."],
      ["R1 is acting as an NTP master using its internal hardware clock at 172.16.2.2 with a polling interval of 377 seconds.", "An internal hardware clock shows as 127.127.1.1 (.LOCL.), and 377 is the octal reachability register, while 64 is the poll interval."]
    ],
    "In `show ntp status`, `stratum 4, reference is 172.16.2.2` indicates R1's own stratum (4) and the upstream server it is synced to (`172.16.2.2`). In `show ntp associations`, the row for `172.16.2.2` lists THAT server's reference clock (`ref clock` = `172.16.3.3`) and THAT server's stratum (`st` = `3`). Because R1 syncs to a Stratum 3 server, R1 becomes Stratum 4 (3 + 1).",
    "In 'show ntp associations', the 'ref clock' and 'st' columns belong to the UPSTREAM server, so the local router's stratum is st + 1!",
    ["show ntp status", "show ntp associations"],
    { cli: "R1# show ntp status\nClock is synchronized, stratum 4, reference is 172.16.2.2\nnominal freq is 250.0000 Hz, actual freq is 250.0000 Hz, precision is 2**21\n\nR1# show ntp associations\n  address         ref clock       st   when   poll reach  delay  offset   disp\n*~172.16.2.2      172.16.3.3       3     50     64   377  1.223   0.090  4.469\n * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured" }),

  c09.s("NTP", "Hard", "An enterprise border router R1 is configured with 'ntp server 198.51.100.1', 'ntp server 198.51.100.2' (both Stratum 1 Internet servers), and 'ntp master 7'. How does R1 behave during normal Internet connectivity versus during an Internet outage?",
    "Normally R1 syncs to one of the Stratum 1 Internet servers (becoming Stratum 2); if both Internet servers become unreachable, R1 falls back to its internal clock at Stratum 7 so internal clients stay synced.",
    [
      ["R1 always uses its local internal clock at Stratum 7 because 'ntp master' overrides any configured 'ntp server' commands.", "NTP always selects the association with the lowest (best) stratum level; Stratum 1 beats the local Stratum 7 clock."],
      ["R1 averages the timestamps of both Stratum 1 servers and the Stratum 7 internal clock resulting in a Stratum 3 clock.", "NTP selects the best stratum source (Stratum 1 -> R1 becomes Stratum 2) and only uses Stratum 7 if the Stratum 1 peers fail."],
      ["R1 rejects the 'ntp master 7' command because a router cannot have both 'ntp server' and 'ntp master' configured simultaneously.", "Cisco IOS supports configuring both 'ntp server' and 'ntp master <high-stratum>' specifically to provide local fallback redundancy."]
    ],
    "Configuring both `ntp server` (pointing to external Stratum 1 clocks) and `ntp master 7` creates associations with both the external servers and the local internal clock (`127.127.1.1`). Because NTP chooses the reference source with the lowest stratum, R1 normally syncs to a Stratum 1 server (making R1 Stratum 2). If the WAN fails, R1 falls back to its internal clock at Stratum 7 so it can continue serving time to internal enterprise devices.",
    "Combine 'ntp server <external>' + 'ntp master <higher-stratum>' for automatic local fallback if the WAN goes down.",
    ["ntp server", "ntp master 7"]),

  c09n.s("CDP/LLDP", "Easy", "How do the default activation state and timers compare between Cisco Discovery Protocol (CDP) and Link Layer Discovery Protocol (LLDP) on Cisco IOS devices?",
    "CDP is enabled by default (60s/180s timers), while LLDP is disabled by default (30s/120s timers).",
    [
      ["Both CDP and LLDP are enabled by default with a 60-second advertisement timer and a 180-second holdtime.", "LLDP is disabled by default on Cisco devices (`no lldp run`) and uses 30s/120s timers when enabled."],
      ["CDP is disabled by default (30s timer, 120s holdtime), whereas LLDP is enabled by default (60s timer, 180s holdtime).", "This reverses CDP and LLDP completely."],
      ["CDP is enabled on routers only and LLDP is enabled on switches only by default.", "Both routers and switches enable CDP by default and disable LLDP by default."]
    ],
    "Cisco-proprietary CDP (`0100.0CCC.CCCC`) is enabled globally and on all interfaces by default, sending advertisements every 60 seconds with a 180-second holdtime. IEEE 802.1AB LLDP (`0180.C200.000E`) is disabled by default; when enabled via `lldp run`, it sends advertisements every 30 seconds with a 120-second holdtime.",
    "CDP = ON by default (60s / 180s); LLDP = OFF by default (30s / 120s).",
    ["show cdp", "show lldp"]),

  c09n.s("CDP/LLDP", "Medium", "Switch SW1 connects to Switch SW2, and SW2 connects to Router R1. You are logged into SW2 and want to view the IOS version and IPv4 management address of R1 ONLY (without displaying details for SW1). Which two commands accomplish this?",
    "show cdp entry R1 (or show lldp entry R1)",
    [
      ["show cdp neighbors and show lldp neighbors", "'show cdp neighbors' and 'show lldp neighbors' display a one-line summary per neighbor that omits the IOS version and IP address."],
      ["show cdp neighbors detail and show lldp neighbors detail", "The 'neighbors detail' commands show IOS version and IP addresses for ALL connected neighbors (both SW1 and R1), not just R1."],
      ["show cdp interface R1 and show lldp interface R1", "'show cdp/lldp interface' takes a local interface name (like Gi1/0/2) and displays timer/enable status, not neighbor details."]
    ],
    "While `show cdp neighbors` (and `show lldp neighbors`) lists a one-line summary (Device ID, Local Intf, Holdtime, Capability, Platform, Port ID) without IP addresses or IOS versions, `show cdp neighbors detail` lists full details for all neighbors. To see that same detailed output (including IP address and IOS version) for a single named neighbor only, use `show cdp entry <name>` or `show lldp entry <name>` (note that the neighbor name is case-sensitive in CDP).",
    "'show cdp/lldp neighbors' = 1-line summary (no IP/IOS version); 'neighbors detail' = all neighbors; 'entry <Name>' = 1 neighbor's details!",
    ["show cdp entry", "show lldp entry", "show cdp neighbors detail"]),

  c09n.s("CDP/LLDP", "Medium", "An administrator wants a switch with default LLDP settings to receive and process LLDP frames on interface Gi1/0/10, but never transmit LLDP frames on Gi1/0/10 or any other port. How should the switch be configured?",
    "Keep 'no lldp run' globally, and configure 'lldp receive' on interface Gi1/0/10.",
    [
      ["Configure 'lldp run' globally, and configure 'no lldp enable' under interface Gi1/0/10.", "Enabling 'lldp run' globally turns on transmit and receive on all other ports, and LLDP uses 'lldp transmit/receive' rather than 'lldp enable'."],
      ["Configure 'cdp run' globally, and configure 'lldp receive' under interface Gi1/0/10.", "CDP settings have no effect on LLDP operation."],
      ["Configure 'lldp receive' in global configuration mode and 'switchport lldp port Gi1/0/10'.", "'lldp receive' and 'lldp transmit' are interface subcommands, not global commands."]
    ],
    "Unlike CDP (`[no] cdp enable` per interface, which toggles both directions together), LLDP separates transmission (`[no] lldp transmit`) and reception (`[no] lldp receive`) per interface, and interface-level commands override the global `[no] lldp run` setting. With LLDP globally disabled by default, configuring `lldp receive` on Gi1/0/10 enables receiving LLDP frames on that single port while keeping transmit disabled everywhere.",
    "CDP per-port = 'cdp enable' (both Tx & Rx); LLDP per-port = separate 'lldp transmit' and 'lldp receive'.",
    ["lldp run", "lldp transmit", "lldp receive", "show lldp interface"]),

  c09.m("Syslog", "Medium", "Which two statements accurately describe how Cisco IOS handles timestamps, sequence numbers, and debug messages in system logging?",
    [
      "By default, IOS includes timestamps ('service timestamps') and omits sequence numbers ('no service sequence-numbers') on log messages.",
      "An enabled 'debug' command continues running and consuming CPU even after the administrator logs out, until 'no debug' (or 'undebug all') is issued."
    ],
    [
      ["Closing an SSH or console session automatically turns off all active 'debug' commands started during that session.", "Active debugs remain enabled in IOS background processes even after the user logs out, continuing to consume CPU."],
      ["By default, 'logging buffered' sends log messages over UDP port 514 to an external syslog server.", "'logging buffered' stores log messages locally in router RAM (viewed with 'show logging'); 'logging host' sends them via UDP 514."],
      ["Severity level 0 is used for 'debug' command output, while severity level 7 is used for system emergencies.", "Severity 0 is Emergency (most severe) and Severity 7 is Debugging (least severe)."]
    ],
    "Cisco IOS enables timestamps on log messages by default (`service timestamps`) and disables sequence numbers by default (`service sequence-numbers` enables them). Also, `debug` commands generate level 7 log messages and remain active even after the user logs out until explicitly disabled with `no debug ...` or `undebug all`.",
    "Debugs stay ON after logout! And remember: 0 = Emergency, 7 = Debugging.",
    ["service timestamps", "service sequence-numbers", "show logging"]),

  c09.t("Syslog", "Easy", "Match each Cisco IOS syslog severity level number with its official keyword name.",
    [
      ["Level 0", "emergencies (System unusable)"],
      ["Level 1", "alerts (Immediate action needed)"],
      ["Level 2", "critical (Critical conditions)"],
      ["Level 3", "errors (Error conditions, such as physical interface down)"],
      ["Level 4", "warnings (Warning conditions)"],
      ["Level 5", "notifications (Normal but significant conditions, such as line protocol up/down)"]
    ],
    "The eight syslog severity levels from 0 to 7 are: 0 `emergencies`, 1 `alerts`, 2 `critical`, 3 `errors`, 4 `warnings`, 5 `notifications`, 6 `informational`, and 7 `debugging`.",
    "Mnemonic for 0-7: Every Awesome Cisco Engineer Will Need Icecream Daily (Emergencies, Alerts, Critical, Errors, Warnings, Notifications, Informational, Debugging).",
    [])
];

// ============================================================================
// v2c10: Network Address Translation
// ============================================================================
const c10 = mk("IP Services", 10, "v2c10");

const q10 = [
  c10.s("NAT", "Easy", "Which three IPv4 address ranges are reserved for private internets according to RFC 1918?",
    "10.0.0.0 - 10.255.255.255, 172.16.0.0 - 172.31.255.255, and 192.168.0.0 - 192.168.255.255",
    [
      ["10.0.0.0 - 10.255.255.255, 172.16.0.0 - 172.32.255.255, and 192.168.0.0 - 192.168.255.255", "The Class B private range stops at 172.31.255.255 (16 Class B networks: 172.16.0.0 through 172.31.0.0); 172.32.x.x is public."],
      ["10.0.0.0 - 10.255.255.255, 169.254.0.0 - 169.254.255.255, and 192.168.0.0 - 192.168.255.255", "169.254.0.0/16 is the APIPA link-local range, not an RFC 1918 routable private internet range."],
      ["10.0.0.0 - 10.255.255.255, 172.16.0.0 - 172.31.255.255, and 191.168.0.0 - 191.168.255.255", "The Class C private range begins with 192.168, not 191.168."]
    ],
    "RFC 1918 defines three private IPv4 address blocks that are never routed on the public Internet: 1 Class A network (`10.0.0.0` to `10.255.255.255`), 16 Class B networks (`172.16.0.0` to `172.31.255.255`), and 256 Class C networks (`192.168.0.0` to `192.168.255.255`).",
    "RFC 1918 Private Ranges: 10.0.0.0/8 (1 Class A), 172.16.0.0/12 (172.16-172.31, 16 Class Bs), 192.168.0.0/16 (256 Class Cs).",
    []),

  c10.s("NAT", "Easy", "An enterprise host with private IP 10.1.1.1 sends a packet through a NAT router (which translates the source IP to 200.1.1.1) to a public web server at 170.1.1.1. In Cisco NAT terminology, what are 10.1.1.1, 200.1.1.1, and 170.1.1.1 called?",
    "10.1.1.1 is the Inside Local address, 200.1.1.1 is the Inside Global address, and 170.1.1.1 is the Outside Global address.",
    [
      ["10.1.1.1 is the Inside Global address, 200.1.1.1 is the Inside Local address, and 170.1.1.1 is the Outside Local address.", "'Local' means the address used inside the private enterprise, while 'Global' means the public address seen on the global Internet."],
      ["10.1.1.1 is the Inside Local address, 200.1.1.1 is the Outside Local address, and 170.1.1.1 is the Outside Global address.", "200.1.1.1 still represents the INSIDE enterprise host when viewed from the global Internet, so it is the Inside Global address."],
      ["10.1.1.1 is the Private Local address, 200.1.1.1 is the Public Global address, and 170.1.1.1 is the Outside Local address.", "Cisco IOS NAT uses 'Inside local', 'Inside global', 'Outside local', and 'Outside global'."]
    ],
    "In Cisco source NAT, 'Inside' vs. 'Outside' identifies where the host permanently resides, while 'Local' (inside the enterprise) vs. 'Global' (on the public Internet) identifies where the address is seen. Thus, the enterprise host's private IP (`10.1.1.1`) is the **Inside Local** address, its translated public IP (`200.1.1.1`) is the **Inside Global** address, and the public server's IP (`170.1.1.1`) is the **Outside Global** address.",
    "Inside = our host; Outside = remote server; Local = private/enterprise view; Global = public Internet view.",
    ["show ip nat translations"]),

  c10.s("NAT", "Easy", "How does Port Address Translation (PAT, or NAT Overload) allow thousands of internal private hosts to share a single public Inside Global IPv4 address simultaneously?",
    "By translating both the source IPv4 address and the Layer 4 TCP/UDP source port number so each flow has a unique Inside Global IP and port combination",
    [
      ["By embedding the host's private Ethernet MAC address into the IPv4 Options field of every outbound packet", "Layer 2 MAC addresses are stripped at every router hop and are never placed into IPv4 Options by PAT."],
      ["By assigning each internal host a 10-millisecond time slot to use the single public IPv4 address in round-robin order", "PAT does not time-slice IP addresses; thousands of flows remain active concurrently using unique 16-bit TCP/UDP port numbers."],
      ["By using Classless Interdomain Routing (CIDR) to aggregate all internal private subnets into a single /8 public route", "CIDR aggregates public routes in Internet routing tables; it does not translate private RFC 1918 addresses."]
    ],
    "PAT (NAT Overload) maps each internal flow's `(Inside Local IP, Source Port)` pair to `(Inside Global IP, Unique Source Port)`. Because the 16-bit TCP/UDP port field supports over 65,000 port numbers per IP address, a single public IPv4 address can multiplex tens of thousands of concurrent sessions.",
    "PAT (NAT Overload) = translates IP + TCP/UDP Port (>65,000 sessions per public IP).",
    ["ip nat inside source list 1 interface serial0/0/0 overload"]),

  c10.s("NAT", "Medium", "Which global configuration command creates a static source NAT mapping for an internal server with private IP 10.1.1.2 so it appears to the Internet as public IP 200.1.1.2?",
    "ip nat inside source static 10.1.1.2 200.1.1.2",
    [
      ["ip nat inside source static 200.1.1.2 10.1.1.2", "The syntax requires the Inside Local (private) IP address first, followed by the Inside Global (public) IP address second."],
      ["ip nat outside source static 10.1.1.2 200.1.1.2", "Translating an internal enterprise host's address uses 'ip nat inside source', not 'ip nat outside source'."],
      ["ip nat pool static 10.1.1.2 200.1.1.2 netmask 255.255.255.0", "'ip nat pool' defines a range of Inside Global addresses for dynamic NAT, not a static one-to-one mapping."]
    ],
    "To configure static inside source NAT, mark the internal and external interfaces with `ip nat inside` and `ip nat outside`, and configure `ip nat inside source static <inside-local-ip> <inside-global-ip>`. Note that in the command syntax, `inside-local` comes first and `inside-global` comes second (even though `show ip nat translations` displays `Inside global` in the left column and `Inside local` next to it).",
    "Command order: 'ip nat inside source static <Inside-Local> <Inside-Global>' (Private first, Public second!).",
    ["ip nat inside source static 10.1.1.2 200.1.1.2", "ip nat inside", "ip nat outside"]),

  c10.s("NAT", "Medium", "An administrator attempts to configure a dynamic NAT pool on a Cisco router with the command 'ip nat pool PUBLIC 200.1.1.1 200.1.1.6 netmask 255.255.255.252', but IOS rejects the command. Why?",
    "Because with mask 255.255.255.252 (/30), start address 200.1.1.1 (subnet 200.1.1.0/30) and end address 200.1.1.6 (subnet 200.1.1.4/30) do not reside in the same subnet.",
    [
      ["Because 'ip nat pool' requires a wildcard mask (0.0.0.3) instead of a dotted-decimal subnet mask (255.255.255.252).", "Unlike ACLs, 'ip nat pool' uses a standard subnet mask ('netmask 255.255.255.x' or 'prefix-length'), not a wildcard mask."],
      ["Because a dynamic NAT pool must contain at least 8 public IPv4 addresses to be accepted by Cisco IOS.", "A dynamic NAT pool can contain as few as 1 or 2 IPv4 addresses (for example, 200.1.1.1 to 200.1.1.2 with /30)."],
      ["Because the 'overload' keyword must be included at the end of the 'ip nat pool' command.", "The 'overload' keyword is placed at the end of 'ip nat inside source list ...', never on 'ip nat pool'."]
    ],
    "When you configure `ip nat pool <name> <start-ip> <end-ip> netmask <mask>`, Cisco IOS verifies that `<start-ip>` and `<end-ip>` belong to the **same subnet** under `<mask>`. A `255.255.255.252` (`/30`) mask has a block size of 4, putting `200.1.1.1` in `200.1.1.0/30` and `200.1.1.6` in `200.1.1.4/30`, so IOS rejects the pool unless a mask like `255.255.255.248` (`/29`) is used.",
    "IOS verifies that the start-ip and end-ip of an 'ip nat pool' fall inside the same subnet defined by the 'netmask' parameter.",
    ["ip nat pool"]),

  c10.s("NAT", "Medium", "A router interface Gi0/1 has Both an inbound ACL ('ip access-group 101 in') and an outbound ACL ('ip access-group 102 out'), and is also involved in NAT. In what order does Cisco IOS process ACLs relative to NAT translation?",
    "Inbound packets are checked by the ACL before NAT; outbound packets undergo NAT before the ACL.",
    [
      ["IOS always performs NAT translation before checking both inbound and outbound ACLs.", "Inbound ACLs are evaluated as packets enter the interface, before inside-to-outside or outside-to-inside NAT occurs."],
      ["IOS always checks both inbound and outbound ACLs using the private Inside Local IP address.", "Because NAT occurs before the outbound ACL on the outside interface, an outbound ACL on the outside interface sees the translated Inside Global IP."],
      ["For inbound packets, IOS performs NAT before the inbound ACL; for outbound packets, IOS checks the outbound ACL before NAT.", "This is backwards: Inbound = ACL then NAT; Outbound = NAT then ACL."]
    ],
    "Inside a Cisco router, the order of operations is: **Inbound ACL -> Routing/NAT -> Outbound ACL**. Therefore, an inbound ACL on an inside interface must match the private **Inside Local** source IP (before NAT translates it), whereas an outbound ACL on an outside interface would see the translated **Inside Global** source IP (after NAT translates it).",
    "Order of operations: Inbound ACL -> NAT -> Outbound ACL.",
    []),

  c10.s("NAT", "Hard", "Examine the 'show ip nat statistics' output. Internal users report intermittent failures when trying to browse the Internet. What is the root cause of the issue, and how can it be fixed without acquiring more public IP addresses?",
    "Dynamic NAT without PAT has allocated all 7 addresses in pool 'fred' (100% allocated, 965 pool misses); adding the 'overload' keyword to 'ip nat inside source list 1 pool fred' enables PAT.",
    [
      ["ACL 1 is blocking 965 packets; changing ACL 1 to 'permit ip any any' will allow all users to reach the Internet.", "The 965 misses appear on the NAT pool line ('allocated 7 (100%), misses 965'), meaning ACL 1 matched the packets, but the pool ran out of IP addresses."],
      ["The inside and outside interfaces are reversed; swapping 'ip nat inside' and 'ip nat outside' will clear the misses.", "Total active translations is 7 and Hits is 45,210, proving that inside/outside interfaces are working for the first 7 hosts."],
      ["The NAT translation table is corrupted; running 'clear ip nat translation *' permanently fixes the capacity limit.", "Clearing translations only temporarily kicks off the current 7 hosts; without 'overload', the 8th concurrent host will still fail."]
    ],
    "In `show ip nat statistics`, there are two `misses` counters: the top-level `Misses` counter simply counts initial packets of new flows that triggered dynamic NAT creation, whereas the pool-level `misses 965` (along with `total addresses 7, allocated 7 (100%)`) proves that 965 translation requests failed because all 7 public IPs in pool `fred` were already in use by 1-to-1 dynamic NAT. Appending `overload` (`ip nat inside source list 1 pool fred overload`) enables PAT so all hosts can share the pool.",
    "Pool 'allocated 100%' + high pool 'misses' = Dynamic NAT pool exhaustion (forgot the 'overload' keyword for PAT!).",
    ["ip nat inside source list 1 pool fred overload", "show ip nat statistics"],
    { cli: "NAT# show ip nat statistics\nTotal active translations: 7 (0 static, 7 dynamic; 0 extended)\nOutside interfaces:\n  Serial0/0/0\nInside interfaces:\n  GigabitEthernet0/0\nHits: 45210  Misses: 972\nExpired translations: 0\nDynamic mappings:\n-- Inside Source\n[id 1] access-list 1 pool fred refcount 7\n pool fred: netmask 255.255.255.240\n    start 200.1.1.1 end 200.1.1.7\n    type generic, total addresses 7, allocated 7 (100%), misses 965" }),

  c10.s("NAT", "Hard", "Examine the router configuration. Why are hosts in subnet 10.1.1.0/24 unable to reach the Internet, even though 'ip nat inside', 'ip nat outside', and the 'overload' keyword are all present?",
    "ACL 1 matches the public IP subnet (200.1.1.0/24) instead of the private Inside Local subnet (10.1.1.0/24) that packets have before NAT translation.",
    [
      ["The 'ip nat inside source' command cannot reference an interface ('Serial0/0/0') and must always use an 'ip nat pool'.", "PAT commonly uses 'interface Serial0/0/0 overload' when sharing a single public interface IP address."],
      ["Interface GigabitEthernet0/0 must be configured with 'ip access-group 1 in' before NAT will evaluate ACL 1.", "Binding the NAT ACL to an interface with 'ip access-group' is not required and would actually filter traffic instead of just selecting it for NAT."],
      ["A standard ACL cannot be used with NAT overload; an extended ACL matching TCP and UDP ports is required.", "Standard ACLs (1-99) are the most common way to match Inside Local source addresses for NAT/PAT."]
    ],
    "In dynamic NAT and PAT, the ACL referenced by `ip nat inside source list <acl>` identifies which packets entering an `ip nat inside` interface should have their source IP translated. Because NAT checks this ACL **before** translating the source IP, the ACL must permit the private **Inside Local** addresses (`access-list 1 permit 10.1.1.0 0.0.0.255`), not the public Inside Global address.",
    "The NAT ACL must match the private INSIDE LOCAL addresses (before translation), never the public Inside Global addresses!",
    ["access-list 1 permit 10.1.1.0 0.0.0.255", "ip nat inside source list 1 interface Serial0/0/0 overload"],
    { cli: "interface GigabitEthernet0/0\n ip address 10.1.1.1 255.255.255.0\n ip nat inside\n!\ninterface Serial0/0/0\n ip address 200.1.1.249 255.255.255.252\n ip nat outside\n!\nip nat inside source list 1 interface Serial0/0/0 overload\n!\naccess-list 1 permit 200.1.1.0 0.0.0.255" }),

  c10.m("NAT", "Medium", "Which two benefits are provided by Classless Interdomain Routing (CIDR, RFC 4632) to address IPv4 scalability?",
    [
      "Route aggregation (summarization) of contiguous public IP blocks into a single route to reduce the size of Internet routing tables",
      "Allocating variable-sized subnet blocks (such as /27 or /28) to customer organizations instead of wasting entire Class A, B, or C networks"
    ],
    [
      ["Allowing multiple organizations to reuse the 10.0.0.0/8 address space internally without coordinating with IANA", "Reusing unregistered internal addresses is Private Addressing (RFC 1918) combined with NAT, not CIDR."],
      ["Expanding the IPv4 header address field from 32 bits to 128 bits to provide 10^38 unique addresses", "128-bit addressing is IPv6, not IPv4 CIDR."],
      ["Multiplexing up to 65,000 internal TCP/UDP sessions onto a single public IPv4 address using port translation", "Multiplexing flows via port numbers is Port Address Translation (PAT / NAT Overload, RFC 3022), not CIDR."]
    ],
    "CIDR (RFC 4632) helped extend the life of IPv4 in two ways: (1) route aggregation, which allows ISPs to summarize thousands of customer networks (e.g., all `198.x.x.x` networks as `198.0.0.0/8`) into a single Internet routing table entry, and (2) classless block assignment, which lets ISPs assign appropriately sized prefixes (like `/28` or `/27`) to customers instead of whole classful networks.",
    "Three IPv4 life-extenders: CIDR (route summarization + right-sized public blocks), RFC 1918 (private IPs), and NAT/PAT (65k flows per public IP).",
    []),

  c10.d("NAT", "Medium", "Place the events in the exact chronological order when an internal host (10.1.1.1) sends its very first packet to an external server (170.1.1.1) through a router configured for dynamic NAT (without static entries).",
    [
      "Host 10.1.1.1 sends an IPv4 packet with Source IP 10.1.1.1 and Destination IP 170.1.1.1 into the router's 'ip nat inside' interface.",
      "The router checks its NAT ACL to verify that source IP 10.1.1.1 is eligible for translation and increments the initial NAT 'Misses' counter.",
      "The router allocates the first available Inside Global IP address (200.1.1.1) from the configured 'ip nat pool' and creates a dynamic NAT table entry.",
      "The router rewrites the packet's Source IP from 10.1.1.1 to 200.1.1.1 and routes the packet out the 'ip nat outside' interface toward 170.1.1.1.",
      "When the server's reply arrives at the 'ip nat outside' interface destined to 200.1.1.1, the router looks up the NAT table entry, rewrites the Destination IP to 10.1.1.1, and forwards it out the inside interface."
    ],
    "Unlike static NAT (where entries exist in `show ip nat translations` immediately upon configuration), dynamic NAT entries are created on demand when user traffic arrives on an `ip nat inside` interface, matches the configured ACL, allocates an unused IP from the `ip nat pool`, translates the source IP on egress, and reverses the translation (destination IP) on return traffic.",
    "Dynamic NAT table starts empty; inside-to-outside traffic matching the NAT ACL triggers the dynamic table entry.",
    ["show ip nat translations", "show ip nat statistics"]),

  c10.t("NAT", "Easy", "Match each Cisco IOS NAT configuration or verification command with its specific purpose.",
    [
      ["ip nat inside source static <local-ip> <global-ip>", "Creates a permanent 1-to-1 NAT table mapping between a private Inside Local IP and a public Inside Global IP"],
      ["ip nat inside source list <acl> pool <name>", "Enables dynamic 1-to-1 NAT (without PAT), mapping hosts matched by <acl> to available IPs in <name>"],
      ["ip nat inside source list <acl> interface <intf> overload", "Enables PAT (NAT Overload) so all hosts matched by <acl> share the single public IP of <intf>"],
      ["show ip nat translations", "Displays active static and dynamic entries in the NAT translation table (Inside Global, Inside Local, Outside Local/Global)"],
      ["clear ip nat translation *", "Removes all dynamic entries from the NAT translation table without deleting static entries"]
    ],
    "Static NAT uses `ip nat inside source static`, dynamic 1-to-1 NAT uses `ip nat inside source list <acl> pool <name>`, and PAT adds the `overload` keyword (using either a `pool <name> overload` or `interface <type/num> overload`). `show ip nat translations` views the table and `clear ip nat translation *` flushes dynamic entries.",
    "No 'overload' keyword = 1-to-1 Dynamic NAT; with 'overload' keyword = PAT!",
    [])
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
