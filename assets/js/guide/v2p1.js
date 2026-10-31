export default [
  {
    id: "v2c01",
    volume: 2,
    chapter: 1,
    title: "Introduction to TCP/IP Transport and Applications",
    domain: "Network Fundamentals",
    pages: "4-31",
    examTopics: [
      "1.5 Compare TCP to UDP",
      "1.1 Explain the role and function of network components"
    ],
    summary: "This chapter examines Layer 4 Transport protocols (TCP and UDP) and how they multiplex application sessions using port numbers. It details TCP connection establishment (three-way handshake) and termination (four-way FIN/ACK exchange), sequence and acknowledgment numbers (forward acknowledgment), sliding window flow control, error recovery via retransmission, and well-known application protocols including HTTP, DNS, DHCP, SSH, FTP, TFTP, SNMP, and Syslog.",
    keyPoints: [
      "Transport layer protocols (TCP and UDP) multiplex traffic for multiple applications on the same host using 16-bit source and destination port numbers combined with Layer 3 IP addresses to form a socket (IP, Transport Protocol, Port).",
      "IANA divides the 16-bit port number range (0 to 65,535) into three categories: Well-Known/System ports (0 to 1023) used by standard servers, Registered/User ports (1024 to 49,151), and Ephemeral/Dynamic/Private ports (49,152 to 65,535) allocated dynamically by clients as source ports.",
      "TCP is a connection-oriented protocol with a 20-byte base header (up to 60 bytes with options) that provides multiplexing, connection establishment/termination, ordered data delivery, error recovery (reliability), and sliding-window flow control.",
      "UDP is a connectionless protocol with a fixed 8-byte header (Source Port, Destination Port, Length, Checksum) that provides low-overhead, low-latency multiplexing without acknowledgments, retransmissions, reordering, or windowing.",
      "TCP establishes a connection using a three-way handshake: (1) Client sends SYN with initial Sequence Number (SEQ=x), (2) Server replies with SYN, ACK (SEQ=y, ACK=x+1), and (3) Client sends ACK (SEQ=x+1, ACK=y+1).",
      "TCP terminates a connection using a four-step FIN/ACK exchange in which each side closes its half of the session independently with a FIN segment acknowledged by an ACK segment.",
      "TCP uses Forward Acknowledgment: the 32-bit Acknowledgment field in a TCP header indicates the NEXT byte sequence number the receiver expects to receive, implicitly acknowledging all earlier bytes.",
      "TCP flow control uses a dynamic 16-bit Window field advertised by the receiver to tell the sender the maximum number of unacknowledged bytes it may transmit before waiting for an ACK; the window grows when buffers are free and shrinks when congested.",
      "Voice over IP (VoIP) and real-time interactive video use UDP rather than TCP because retransmitting delayed voice packets arrives too late for human speech and TCP windowing slows down real-time streams.",
      "DNS uses UDP port 53 for standard name resolution queries and TCP port 53 for zone transfers or responses exceeding 512 bytes; DHCP uses UDP 67 (server) and UDP 68 (client); TFTP uses UDP 69; SNMP uses UDP 161/162; HTTP/HTTPS use TCP 80/443; SSH uses TCP 22; Telnet uses TCP 23."
    ],
    keyTerms: [
      { term: "Multiplexing", def: "The Layer 4 process of identifying which application process on a host should receive incoming data by inspecting the transport protocol and destination port number." },
      { term: "Socket", def: "The combination of an IP address, transport protocol (TCP or UDP), and 16-bit port number that uniquely identifies a communication endpoint." },
      { term: "Well-Known Ports", def: "Port numbers 0 through 1023 reserved by IANA for standard server applications such as HTTP (80), HTTPS (443), SSH (22), and DNS (53)." },
      { term: "Ephemeral Ports", def: "Dynamic/private port numbers 49,152 through 65,535 temporarily selected by client operating systems as source ports when initiating connections." },
      { term: "Three-Way Handshake", def: "The three-message TCP connection setup exchange (SYN -> SYN/ACK -> ACK) that initializes sequence numbers and establishes session state." },
      { term: "Forward Acknowledgment", def: "TCP's acknowledgment method where the ACK number specifies the next expected byte sequence number rather than the last byte received." },
      { term: "Sliding Window", def: "TCP's flow-control mechanism where the receiver dynamically adjusts the Window field in ACKs to regulate how many bytes the sender can transmit unacknowledged." },
      { term: "Uniform Resource Identifier (URI)", def: "A standard string format used to identify web resources, consisting of scheme/protocol (http://), authority/FQDN (www.example.com), and path (/page.html)." }
    ],
    commands: [
      { cmd: "netstat -an", desc: "Displays active TCP/UDP connections, listening sockets, and numeric IP addresses and port numbers on a host OS", mode: "host" },
      { cmd: "show tcp brief", desc: "Displays a concise summary of active TCP Transmission Control Blocks (endpoints, states, and sockets) on a Cisco IOS device", mode: "user" },
      { cmd: "show ip sockets", desc: "Displays open UDP sockets and listening ports on a Cisco IOS router or switch", mode: "user" },
      { cmd: "nslookup hostname", desc: "Queries a configured DNS server (UDP port 53) to resolve a domain name into an IPv4/IPv6 address", mode: "host" }
    ],
    tips: [
      "Memorize the TCP vs. UDP feature matrix cold: Both do multiplexing (port numbers) and checksums, but ONLY TCP does connection setup (SYN/ACK), sequence numbering/reordering, retransmission (error recovery), and windowing (flow control).",
      "Memorize IANA port ranges: 0–1023 = Well-Known (System), 1024–49151 = Registered (User), 49152–65535 = Dynamic/Private (Ephemeral). Remember that a web browser connecting to a web server uses a source port from 49152–65535 and a destination port of TCP 80 or 443!",
      "Know which protocols use UDP vs. TCP: UDP = DHCP (67/68), TFTP (69), NTP (123), SNMP (161/162), Syslog (514), VoIP/RTP; TCP = SSH (22), Telnet (23), SMTP (25), FTP (20/21), HTTP (80), POP3 (110), HTTPS (443); Both = DNS (53).",
      "In a TCP segment, if a sender transmits 1000 bytes starting at SEQ = 5000, the receiver's next ACK number is 6000 (Forward Acknowledgment = next expected byte)."
    ]
  },
  {
    id: "v2c02",
    volume: 2,
    chapter: 2,
    title: "Basic IPv4 Access Control Lists",
    domain: "Security Fundamentals",
    pages: "32-59",
    examTopics: [
      "5.6 Configure and verify access control lists"
    ],
    summary: "This chapter introduces IPv4 Access Control Lists (ACLs), focusing on standard numbered ACLs (ranges 1–99 and 1300–1999). It explains how routers filter transit packets inbound or outbound on interfaces, top-down first-match processing logic, the implicit deny all at the end of every ACL, wildcard mask binary matching (0 = match bit, 1 = ignore bit), the host and any keywords, and best practices for placing standard ACLs close to the destination.",
    keyPoints: [
      "An IPv4 Access Control List (ACL) is an ordered sequential list of permit and deny Access Control Entries (ACEs) applied inbound (in) or outbound (out) on a router interface using ip access-group <id> {in | out}.",
      "Standard IPv4 ACLs use numbers 1–99 and 1300–1999 (expanded range) and can match ONLY the source IPv4 address of the packet.",
      "IOS processes ACL statements top-down (sequentially); as soon as a packet matches an ACE, IOS takes the specified action (permit or deny) and stops checking any remaining statements in the ACL.",
      "Every IPv4 and IPv6 ACL ends with an unseen implicit deny all (deny any) statement; therefore, a valid ACL must contain at least one permit statement or it will block 100% of traffic.",
      "Wildcard masks (32-bit masks written in dotted-decimal) tell IOS which bits of the address to compare: binary 0 means the bit MUST match the ACL address bit, and binary 1 means 'don't care' (ignore the bit).",
      "For standard block-size subnets, you can quickly compute the wildcard mask by subtracting the subnet mask from 255.255.255.255 (e.g., /24 mask 255.255.255.0 -> wildcard 0.0.0.255; /26 mask 255.255.255.192 -> wildcard 0.0.0.63).",
      "Wildcard 0.0.0.0 requires all 32 bits to match (a single host) and is abbreviated with the keyword host <ip> (e.g., access-list 1 permit 10.1.1.1 replaces 10.1.1.1 0.0.0.0); wildcard 255.255.255.255 ignores all 32 bits and is abbreviated as any.",
      "Because standard ACLs filter solely on the source IPv4 address, they should be placed as close to the DESTINATION as possible so they do not accidentally block that source from reaching other legitimate destinations.",
      "When you type an ACE with non-zero bits in host positions where the wildcard mask has binary 1s (e.g., access-list 1 permit 10.1.1.1 0.0.0.255), Cisco IOS automatically converts the address to its canonical subnet ID (10.1.1.0 0.0.0.255) in running-config.",
      "Router-generated packets (such as local ping or Telnet originated by the router itself) are NOT filtered by outbound ACLs configured on the router's own egress interface."
    ],
    keyTerms: [
      { term: "Access Control List (ACL)", def: "A sequential list of permit and deny statements configured on a router to filter packets or classify traffic." },
      { term: "Access Control Entry (ACE)", def: "A single permit or deny rule statement inside an Access Control List, assigned a sequence number (10, 20, 30...)." },
      { term: "Standard IPv4 ACL", def: "An ACL numbered 1–99 or 1300–1999 (or named standard) that filters packets based solely on the source IPv4 address." },
      { term: "Wildcard Mask", def: "A 32-bit matching mask used in ACLs and OSPF where binary 0 requires an exact bit match and binary 1 ignores the bit." },
      { term: "First-Match Logic", def: "The top-down ACL processing rule where IOS acts on the very first ACE that matches a packet and ignores all subsequent ACEs." },
      { term: "Implicit Deny All", def: "The unseen default rule at the bottom of every ACL that drops any packet not matched by at least one explicit ACE above it." },
      { term: "Inbound ACL (in)", def: "An ACL applied with ip access-group <id> in that filters packets immediately as they enter an interface before the routing lookup." },
      { term: "Outbound ACL (out)", def: "An ACL applied with ip access-group <id> out that filters packets after the router makes its forwarding decision, just before exiting the interface." }
    ],
    commands: [
      { cmd: "access-list access-list-number {deny | permit} source [source-wildcard] [log]", desc: "Creates a numbered standard IPv4 ACL entry (1–99 or 1300–1999) matching a source IP/prefix", mode: "global" },
      { cmd: "access-list access-list-number remark text", desc: "Adds a human-readable descriptive comment inside a numbered ACL in running-config", mode: "global" },
      { cmd: "ip access-group {number | name} {in | out}", desc: "Applies an IPv4 ACL inbound or outbound on an interface to filter packets", mode: "interface" },
      { cmd: "show ip access-lists [number | name]", desc: "Displays all IPv4 ACLs, sequence numbers, and per-ACE packet match counters", mode: "user" },
      { cmd: "show ip interface [type number]", desc: "Displays IPv4 interface status including which inbound and outbound ACLs are currently applied", mode: "user" }
    ],
    tips: [
      "Remember the golden placement rule: Standard ACLs (1–99, 1300–1999) go close to the DESTINATION because they only see the source IP; Extended ACLs (100–199, 2000–2699) go close to the SOURCE.",
      "Think of each router interface as having only ONE inbound ACL slot and ONE outbound ACL slot per protocol (IPv4). Applying a second ip access-group in on the same interface overwrites the previous inbound ACL reference!",
      "Always check the order of ACEs! If `permit 10.1.1.0 0.0.0.255` appears at sequence 10 and `deny host 10.1.1.5` appears at sequence 20, host 10.1.1.5 WILL BE PERMITTED because of first-match logic.",
      "To convert a subnet mask to a wildcard mask in seconds, subtract each octet from 255: e.g., 255.255.252.0 (/22) -> (255-255).(255-255).(255-252).(255-0) = 0.0.3.255."
    ]
  },
  {
    id: "v2c03",
    volume: 2,
    chapter: 3,
    title: "Advanced IPv4 Access Control Lists",
    domain: "Security Fundamentals",
    pages: "60-90",
    examTopics: [
      "5.6 Configure and verify access control lists"
    ],
    summary: "This chapter covers extended numbered IPv4 ACLs (100–199 and 2000–2699), named standard and extended ACLs, editing ACLs using sequence numbers, and securing VTY lines with access-class. It details how extended ACLs match Layer 3 protocol (ip, icmp, tcp, udp, ospf), source IPv4 address, destination IPv4 address, and Layer 4 TCP/UDP port operators (eq, neq, lt, gt, range).",
    keyPoints: [
      "Extended numbered IPv4 ACLs use numbers 100–199 and 2000–2699 (expanded range) and should be placed as close to the SOURCE as possible to drop unwanted traffic early without wasting WAN/core bandwidth.",
      "Every extended ACE matches at least four parameters in order: (1) action (permit/deny), (2) Layer 3 protocol (ip for all IPv4 packets, or specific protocols like tcp, udp, icmp, ospf, gre), (3) source IP/wildcard, and (4) destination IP/wildcard.",
      "When the protocol is tcp or udp, an extended ACE can optionally match source port and/or destination port numbers right after the source IP and destination IP respectively, using operators: eq (equal), neq (not equal), lt (less than), gt (greater than), or range <start> <end>.",
      "Named ACLs are created in ACL configuration mode using ip access-list {standard | extended} <name>; inside this submode, statements start directly with sequence numbers or permit/deny rather than access-list <n>.",
      "Modern Cisco IOS treats both numbered and named ACLs identically under the hood: you can enter ip access-list extended 101 to edit numbered ACL 101 by sequence number (e.g., no 20 to delete line 20, or 15 deny ... to insert between 10 and 20).",
      "Using no access-list 101 in global configuration mode deletes the ENTIRE numbered ACL 101 immediately; to delete a single ACE without deleting the whole list, enter ip access-list {standard | extended} <id> submode and issue no <seq-num>.",
      "If you delete or edit an ACL that is currently applied to an interface with ip access-group, remember that an empty/nonexistent ACL reference permits all traffic until the first ACE is added, and once the first ACE is added, the implicit deny immediately takes effect!",
      "To restrict which administrative IP addresses can Telnet or SSH into a router's VTY lines, configure a standard or extended ACL and apply it under line vty 0 15 using access-class <id> in (not ip access-group).",
      "In show ip access-lists, IOS displays keyword names for well-known ports even if you typed port numbers (e.g., www for 80, telnet for 23, domain for 53, bootps for 67, bootpc for 68, tftp for 69, ntp for 123)."
    ],
    keyTerms: [
      { term: "Extended IPv4 ACL", def: "An ACL numbered 100–199 or 2000–2699 (or named extended) that filters on L3 protocol, source IP, destination IP, and L4 TCP/UDP ports." },
      { term: "Named ACL", def: "An IPv4 ACL identified by an alphanumeric string (configured via ip access-list standard|extended <name>) rather than a number." },
      { term: "ACL Sequence Number", def: "The line number (defaulting to 10, 20, 30...) assigned to each ACE inside an ACL, enabling targeted insertion and deletion of individual rules." },
      { term: "Port Operator", def: "Keywords in extended TCP/UDP ACLs (eq, neq, lt, gt, range) that specify which Layer 4 port numbers to match." },
      { term: "access-class", def: "The VTY line subcommand (access-class <acl> in) used to restrict inbound Telnet/SSH administrative sessions to permitted source IP addresses." },
      { term: "ACL Resequencing", def: "The command ip access-list resequence <acl-id> <start> <increment> that renumbers all ACEs in an ACL to restore clean spacing." },
      { term: "established Keyword", def: "A classic extended TCP ACL option that matches returning TCP segments having the ACK or RST flag bits set." },
      { term: "log Keyword", def: "An optional ACE suffix that generates an informational Syslog message showing packet headers whenever a packet matches that specific ACE." }
    ],
    commands: [
      { cmd: "access-list number {permit | deny} protocol source [src-port] destination [dst-port]", desc: "Creates a numbered extended IPv4 ACL statement (100–199 or 2000–2699)", mode: "global" },
      { cmd: "ip access-list {standard | extended} {name | number}", desc: "Enters named/numbered ACL configuration submode for adding, inserting, or deleting individual ACEs by sequence number", mode: "global" },
      { cmd: "[seq-num] {permit | deny} protocol source destination [eq port]", desc: "Adds or inserts an ACE at a specific sequence number inside ACL configuration submode", mode: "acl-config" },
      { cmd: "no sequence-number", desc: "Deletes a single ACE by its sequence number inside ACL configuration submode without removing the entire ACL", mode: "acl-config" },
      { cmd: "ip access-list resequence {id | name} start-seq increment", desc: "Renumbers the sequence numbers of all ACEs in an ACL starting at start-seq in steps of increment", mode: "global" },
      { cmd: "access-class {number | name} in", desc: "Applies an ACL to VTY lines (line vty 0 15) to filter incoming Telnet/SSH management connections", mode: "line" },
      { cmd: "clear ip access-list counters [id | name]", desc: "Resets the per-ACE packet match counters shown in show ip access-lists to zero", mode: "privileged" }
    ],
    tips: [
      "Watch the order of Source vs. Destination in extended ACLs! `permit tcp 10.1.1.0 0.0.0.255 host 172.16.1.10 eq 80` matches a client in 10.1.1.0/24 connecting TO web server 172.16.1.10 port 80. If the packet is returning FROM the web server to the client, 172.16.1.10 is the SOURCE and `eq 80` is the SOURCE port (`permit tcp host 172.16.1.10 eq 80 10.1.1.0 0.0.0.255`)!",
      "Don't confuse `ip access-group` (used on router interfaces to filter transit data plane traffic) with `access-class` (used under `line vty` to filter control/management plane Telnet/SSH logins).",
      "Know the IOS port keyword aliases that appear in `show running-config` and `show ip access-lists`: `www` = TCP 80, `ftp` = TCP 21, `ftp-data` = TCP 20, `domain` = 53, `bootps` = UDP 67, `bootpc` = UDP 68, `tftp` = UDP 69.",
      "Remember that `ip` as the protocol in an extended ACE (`permit ip ...`) matches ALL IPv4 packets (including TCP, UDP, ICMP, and OSPF), whereas `tcp` only matches TCP segments."
    ]
  },
  {
    id: "v2c04",
    volume: 2,
    chapter: 4,
    title: "Security Architectures",
    domain: "Security Fundamentals",
    pages: "92-113",
    examTopics: [
      "5.1 Define key security concepts (threats, vulnerabilities, exploits, and mitigation techniques)",
      "5.2 Describe security program elements (user awareness, training, and physical access control)",
      "5.5 Describe remote access and site-to-site VPNs",
      "5.8 Differentiate authentication, authorization, and accounting concepts"
    ],
    summary: "This chapter introduces foundational cybersecurity terminology, threat actor categories, common network attacks (reconnaissance, social engineering, DoS/DDoS, man-in-the-middle, spoofing, buffer overflow, malware), defense-in-depth mitigation, security program awareness and physical security controls, AAA (Authentication, Authorization, Accounting) concepts, and IPsec/TLS site-to-site and remote-access VPNs.",
    keyPoints: [
      "Core security definitions: a Vulnerability is a weakness in a system or design; a Threat is a potential danger that could exploit a vulnerability; an Exploit is the actual code/tool/technique used to take advantage of a vulnerability; Risk is the likelihood and impact of a threat exploiting a vulnerability; Mitigation is the countermeasure taken to reduce risk.",
      "Confidentiality ensures only authorized parties can read data (via encryption like AES); Integrity ensures data has not been altered in transit (via hashing/HMAC like SHA-256); Availability ensures authorized users have reliable, timely access to network resources (CIA triad).",
      "Reconnaissance attacks gather intelligence (port scans, ping sweeps, packet sniffers) before launching an access or DoS attack.",
      "Social engineering manipulates human psychology rather than technical bugs: Phishing (mass fraudulent emails), Spear Phishing (targeted at a specific group/organization), Whaling (targeted at executives), Vishing (voice/phone phishing), Tailgating/Piggybacking (following an authorized employee through a secure door), and Baiting (leaving infected USB drives).",
      "Denial of Service (DoS) and Distributed DoS (DDoS) attacks overwhelm a target's bandwidth, CPU, or session tables (e.g., TCP SYN flood, ICMP Smurf amplification) to deny service to legitimate users.",
      "Spoofing and Man-in-the-Middle (MitM) attacks impersonate trusted network infrastructure—such as ARP Poisoning/Spoofing, Rogue DHCP Server attacks, and MAC Flooding/Spoofing—so an attacker can intercept or modify traffic in transit.",
      "A comprehensive Security Program combines technical controls with human-focused elements: User Awareness, Role-Based Security Training, Acceptable Use Policies (AUP), Incident Response Plans, and Physical Access Controls (mantraps, badge readers, biometrics, video surveillance, cable locks).",
      "AAA stands for Authentication (Who are you? Verifying identity via username/password, MFA, or certificates), Authorization (What are you allowed to do? Assigning privilege levels or downloadable ACLs), and Accounting (What did you do? Logging commands and session duration for auditing).",
      "Virtual Private Networks (VPNs) provide confidentiality, integrity, authentication, and anti-replay protection over untrusted public networks (like the Internet): Site-to-Site VPNs typically use IPsec (IKE + ESP) tunnels between two routers/firewalls, whereas Remote-Access VPNs connect individual teleworkers using TLS/SSL VPN clients (like Cisco AnyConnect) or IPsec clients."
    ],
    keyTerms: [
      { term: "Vulnerability", def: "A flaw or weakness in hardware, software, configuration, or human procedures that could be exploited by a threat actor." },
      { term: "Exploit", def: "A specific software tool, script, or sequence of commands used to take advantage of a vulnerability to compromise a target." },
      { term: "Social Engineering", def: "Psychological manipulation of people into divulging confidential information or bypassing security controls (e.g., phishing, spear phishing, tailgating)." },
      { term: "Man-in-the-Middle (MitM)", def: "An attack where an adversary secretly positions themselves between two communicating parties (e.g., via ARP poisoning or rogue DHCP) to eavesdrop or alter traffic." },
      { term: "Authentication, Authorization, Accounting (AAA)", def: "The architectural security framework that verifies user identity (Authentication), enforces permissions (Authorization), and logs activity (Accounting)." },
      { term: "Site-to-Site VPN", def: "An encrypted tunnel (typically IPsec) permanently or dynamically connecting two fixed network sites (such as a branch office and HQ) over the Internet." },
      { term: "Remote-Access VPN", def: "An on-demand encrypted VPN tunnel (typically TLS/SSL or IPsec) initiated by an endpoint software client (e.g., Cisco AnyConnect) for mobile/remote workers." },
      { term: "Multifactor Authentication (MFA)", def: "Authentication requiring two or more independent factors: something you know (password), something you have (hardware token/phone), or something you are (biometric)." }
    ],
    commands: [
      { cmd: "aaa new-model", desc: "Globally enables the AAA security framework on a Cisco IOS router or switch", mode: "global" },
      { cmd: "show crypto isakmp sa", desc: "Displays Phase 1 IKE/ISAKMP security associations for site-to-site IPsec VPN tunnels", mode: "user" },
      { cmd: "show crypto ipsec sa", desc: "Displays Phase 2 IPsec security associations, encrypted/decrypted packet counters, and peer IP addresses", mode: "user" }
    ],
    tips: [
      "Clearly distinguish Vulnerability vs. Threat vs. Exploit vs. Mitigation: Unpatched IOS bug = Vulnerability; Attacker on the network = Threat; Packet crafted to trigger the bug = Exploit; Upgrading IOS or applying an ACL = Mitigation.",
      "Keep the three AAA pillars straight on exam scenario questions: checking a user's password/token = Authentication; restricting a user to privilege level 1 or read-only show commands = Authorization; recording every CLI command typed with a timestamp on a TACACS+ server = Accounting.",
      "Compare Site-to-Site vs. Remote-Access VPNs: Site-to-Site connects two edge routers/firewalls via IPsec without requiring VPN software on internal hosts; Remote-Access uses a client agent (e.g., AnyConnect over SSL/TLS or IPsec) on an individual laptop/phone."
    ]
  },
  {
    id: "v2c05",
    volume: 2,
    chapter: 5,
    title: "Securing Network Devices",
    domain: "Security Fundamentals",
    pages: "114-141",
    examTopics: [
      "5.3 Configure and verify device access control using local passwords",
      "5.4 Describe security password policies elements, such as management, complexity, and password alternatives (multifactor authentication, certificates, and biometrics)",
      "5.8 Differentiate authentication, authorization, and accounting concepts"
    ],
    summary: "This chapter covers hardening Cisco IOS routers and switches against unauthorized management access. It explains securing console, VTY, and privileged EXEC (enable) access, local username/password databases, password hashing Types 0, 5 (MD5), 7 (reversible Vigenere), 8 (PBKDF2-SHA256), and 9 (scrypt), configuring SSHv2 for encrypted remote CLI management, password policy best practices, and external AAA using RADIUS and TACACS+.",
    keyPoints: [
      "Cisco IOS management planes include the physical Console port (line console 0), virtual terminal lines for Telnet/SSH (line vty 0 4 on routers, line vty 0 15 on switches), and Privileged EXEC mode (enable).",
      "Using login under line console 0 or line vty 0 15 checks only a line-specific password <pw>; using login local instructs IOS to prompt for both a username and password and verify them against the global username <name> secret <pw> database.",
      "In running-config, password Encryption Types indicate how a password is stored: Type 0 = cleartext; Type 7 = weak reversible Cisco Vigenere cipher created by service password-encryption; Type 5 = MD5 hash created by enable secret or username secret; Type 8 = PBKDF2 with SHA-256; Type 9 = scrypt hash (strongest, configured with secret algorithm-type scrypt).",
      "If both enable password and enable secret are configured on a device, IOS ALWAYS uses enable secret and ignores enable password.",
      "To configure an IOS device as an SSH server: (1) configure a hostname, (2) configure a DNS domain name (ip domain-name <domain>), (3) generate RSA keys (crypto key generate rsa modulus 2048; minimum 768 bits required for SSHv2), (4) create local user credentials (username <name> secret <pw>), and (5) set login local and transport input ssh under line vty.",
      "Under line vty, transport input ssh allows ONLY inbound SSH and blocks insecure Telnet; transport input all allows both; transport input none disables all inbound VTY sessions.",
      "Enterprise password policies enforce minimum length, character complexity, password aging/rotation, account lockout after failed attempts, password history, and replacing static passwords with MFA, digital certificates (PKI), or biometrics.",
      "With aaa new-model enabled, administrators configure authentication method lists (e.g., aaa authentication login default group tacacs+ local) that query external TACACS+ or RADIUS servers first and fall back to the local username database ONLY if the AAA servers are unreachable.",
      "TACACS+ (TCP port 49) encrypts the entire AAA packet body and separates Authentication, Authorization, and Accounting (making it ideal for device CLI administration), whereas RADIUS (UDP ports 1812/1813 or 1645/1646) encrypts only the password field and combines Authentication and Authorization (commonly used for 802.1X/WLAN network access)."
    ],
    keyTerms: [
      { term: "service password-encryption", def: "A global IOS command that obfuscates cleartext Type 0 passwords in running-config into weak, easily reversible Type 7 cipher strings." },
      { term: "enable secret", def: "A global IOS command that stores the Privileged EXEC password using a strong one-way cryptographic hash (Type 5 MD5, Type 8 SHA-256, or Type 9 scrypt)." },
      { term: "login local", def: "A line configuration subcommand that requires users to authenticate with both a username and password defined in the device's local username database." },
      { term: "transport input ssh", def: "A VTY line subcommand that restricts inbound remote management connections strictly to SSH and rejects Telnet connections." },
      { term: "TACACS+", def: "A Cisco-developed AAA protocol using TCP port 49 that encrypts the entire payload and separates authentication, authorization, and accounting for device administration." },
      { term: "RADIUS", def: "An IETF standard AAA protocol using UDP ports 1812/1813 (or 1645/1646) that encrypts only the password attribute and combines authentication and authorization." },
      { term: "AAA Method List", def: "An ordered list of authentication sources (such as group tacacs+ followed by local) applied to login or enable access when aaa new-model is active." },
      { term: "exec-timeout", def: "A console/VTY line subcommand (exec-timeout <minutes> [seconds]) that automatically logs out an idle administrative CLI session (default 10 minutes)." }
    ],
    commands: [
      { cmd: "enable secret [algorithm-type {md5 | sha256 | scrypt}] password", desc: "Configures a cryptographically hashed password required to enter Privileged EXEC mode", mode: "global" },
      { cmd: "service password-encryption", desc: "Obfuscates all cleartext passwords in running-config using Type 7 encoding", mode: "global" },
      { cmd: "username name [privilege level] secret [algorithm-type {md5 | sha256 | scrypt}] password", desc: "Creates a local user account with a strongly hashed password (Type 5, 8, or 9)", mode: "global" },
      { cmd: "ip domain-name name", desc: "Configures the router/switch DNS domain name required to generate an FQDN label for RSA SSH keys", mode: "global" },
      { cmd: "crypto key generate rsa [modulus size]", desc: "Generates the public/private RSA key pair required by the IOS SSH server (use >= 2048 bits; >= 768 for SSHv2)", mode: "global" },
      { cmd: "ip ssh version 2", desc: "Forces the IOS SSH server to accept only SSH version 2 connections and reject vulnerable SSHv1", mode: "global" },
      { cmd: "login local", desc: "Configures a console or VTY line to authenticate users against the global username/secret database", mode: "line" },
      { cmd: "transport input {ssh | telnet | all | none}", desc: "Specifies which protocols are permitted for incoming connections on VTY lines", mode: "line" },
      { cmd: "show ip ssh", desc: "Displays the enabled SSH server version, authentication timeout, and retry limit", mode: "user" },
      { cmd: "show ssh", desc: "Displays active incoming SSH server sessions, encryption ciphers, and logged-in usernames", mode: "user" }
    ],
    tips: [
      "Remember the 5 steps to enable SSH on a fresh switch/router: (1) `hostname`, (2) `ip domain-name`, (3) `crypto key generate rsa modulus 2048`, (4) `username ... secret ...`, (5) `line vty 0 15` -> `login local` + `transport input ssh`.",
      "Know your Cisco password Type numbers: Type 0 = cleartext, Type 7 = weak reversible (`service password-encryption`), Type 5 = MD5 (`secret`), Type 8 = PBKDF2 SHA-256 (`secret algorithm-type sha256`), Type 9 = scrypt (`secret algorithm-type scrypt`).",
      "Understand AAA fallback behavior: in `aaa authentication login default group tacacs+ local`, if the TACACS+ server is UP and rejects a bad password, IOS does NOT check `local`; it only falls back to `local` if the TACACS+ server fails to respond (is unreachable)!"
    ]
  },
  {
    id: "v2c06",
    volume: 2,
    chapter: 6,
    title: "Implementing Switch Port Security",
    domain: "Security Fundamentals",
    pages: "142-167",
    examTopics: [
      "5.7 Configure and verify Layer 2 security features (DHCP snooping, dynamic ARP inspection, and port security)"
    ],
    summary: "This chapter details Cisco Catalyst Switch Port Security to prevent unauthorized devices and MAC flooding attacks at Layer 2. It explains how port security restricts which source MAC addresses may send frames into an interface and limits the maximum number of MAC addresses allowed, how static, dynamic, and sticky MAC learning work, and how the three violation modes (Shutdown, Restrict, and Protect) behave.",
    keyPoints: [
      "Switch Port Security restricts an access or trunk port so only frames from a limited number of allowed source MAC addresses are forwarded, mitigating both unauthorized rogue device connections and CAM/MAC table overflow attacks.",
      "Before enabling port security on an interface, the port MUST be statically configured as either an access port (switchport mode access) or a trunk port (switchport mode trunk); IOS rejects switchport port-security on a dynamic DTP port (default dynamic auto/desirable).",
      "Port security is enabled on the interface with the command switchport port-security (which by itself activates port security with all default settings: maximum = 1 MAC, violation mode = shutdown, dynamic learning).",
      "Three ways to define secure MAC addresses: (1) Static configuration (switchport port-security mac-address <mac>), (2) Dynamic learning (learned in RAM only and lost on reload), and (3) Sticky learning (switchport port-security mac-address sticky, which dynamically learns MACs and converts them into static entries in running-config).",
      "Sticky-learned MAC addresses are added to running-config immediately, so they survive interface flaps, but you must still run copy running-config startup-config for them to survive a switch reboot.",
      "A port security violation occurs in two cases: (1) when a port has already reached its configured maximum secure MAC count and a frame arrives with a new unknown source MAC, or (2) when a frame arrives whose source MAC is already configured/learned as a secure MAC on a DIFFERENT port in the same VLAN.",
      "Violation Mode Shutdown (the default): places the interface into the err-disabled (error-disabled) state (shutting down physical Layer 1/Layer 2), stops all traffic, sends a Syslog message and SNMP trap, and increments the security violation counter to 1.",
      "Violation Mode Restrict: keeps the port up and forwarding traffic for legitimate secure MACs, drops frames from offending unknown MACs, sends a Syslog message and SNMP trap, and increments the violation counter for every offending frame.",
      "Violation Mode Protect: keeps the port up and forwarding traffic for legitimate secure MACs and silently drops frames from offending unknown MACs, but does NOT send Syslog/SNMP alerts and does NOT increment the violation counter.",
      "To recover an err-disabled port manually after resolving the violation, an administrator must run shutdown followed by no shutdown under the interface (no shutdown alone does not work!)."
    ],
    keyTerms: [
      { term: "Port Security", def: "A Cisco Layer 2 security feature that limits the number and specific identity of source MAC addresses allowed to send frames into a switch port." },
      { term: "Sticky MAC Learning", def: "A port-security feature (switchport port-security mac-address sticky) that dynamically learns source MACs and writes them into running-config." },
      { term: "Shutdown Violation Mode", def: "The default port-security violation mode that immediately err-disables the port, sends Syslog/SNMP alerts, and sets the violation counter to 1." },
      { term: "Restrict Violation Mode", def: "A port-security violation mode that drops frames from unauthorized MACs, keeps the port up, logs Syslog/SNMP alerts, and increments the violation counter." },
      { term: "Protect Violation Mode", def: "A port-security violation mode that silently drops frames from unauthorized MACs while keeping the port up, without logging alerts or incrementing counters." },
      { term: "Err-Disabled State", def: "An operational state (shown as err-disabled in show interfaces status) where IOS disables a port due to a security or protocol violation." },
      { term: "MAC Flooding Attack", def: "An attack that floods a switch with thousands of bogus source MAC frames to fill the CAM table and force the switch to flood unicast traffic like a hub." },
      { term: "Errdisable Recovery", def: "An optional global IOS feature (errdisable recovery cause psecure-violation) that automatically re-enables an err-disabled port after a configurable timer." }
    ],
    commands: [
      { cmd: "switchport mode access", desc: "Statically configures the interface as an access port (required prerequisite before enabling port security)", mode: "interface" },
      { cmd: "switchport port-security", desc: "Enables port security on the interface (required even if other port-security subcommands are entered!)", mode: "interface" },
      { cmd: "switchport port-security maximum value", desc: "Sets the maximum number of secure MAC addresses allowed on the interface (default is 1)", mode: "interface" },
      { cmd: "switchport port-security violation {protect | restrict | shutdown}", desc: "Configures the action taken when a port-security MAC violation occurs (default is shutdown)", mode: "interface" },
      { cmd: "switchport port-security mac-address mac-address", desc: "Statically configures a specific allowed source MAC address on the interface", mode: "interface" },
      { cmd: "switchport port-security mac-address sticky", desc: "Enables sticky learning so dynamically learned MACs are added to running-config", mode: "interface" },
      { cmd: "show port-security interface type number", desc: "Displays port security status (Enabled/Disabled), Port Status (Secure-up/Secure-shutdown), violation mode, maximum/current MAC counts, and violation counter", mode: "user" },
      { cmd: "show port-security address", desc: "Displays the table of all secure MAC addresses across all ports, their types (SecureConfigured, SecureDynamic, SecureSticky), and ports", mode: "user" },
      { cmd: "show interfaces status err-disabled", desc: "Lists all switch ports currently in the err-disabled state along with the exact root cause (e.g., psecure-violation, bpduguard)", mode: "user" }
    ],
    tips: [
      "Exam trap #1: Typing `switchport port-security maximum 2` and `switchport port-security mac-address sticky` does NOT enable port security by itself! You MUST also configure `switchport port-security` on the interface.",
      "Exam trap #2: Memorize the exact comparison table for Protect vs. Restrict vs. Shutdown: All 3 discard offending traffic; Protect & Restrict keep the port UP while Shutdown err-disables it; Restrict & Shutdown send Syslog/SNMP messages and increment the violation counter while Protect does neither.",
      "Exam trap #3: When a port is placed in `err-disabled` (`Secure-shutdown` in `show port-security interface`), typing only `no shutdown` does nothing—you MUST issue `shutdown` and then `no shutdown`."
    ]
  },
  {
    id: "v2c07",
    volume: 2,
    chapter: 7,
    title: "Implementing DHCP",
    domain: "IP Services",
    pages: "168-193",
    examTopics: [
      "4.3 Explain the role of DHCP and DNS within the network",
      "4.6 Configure and verify DHCP client and relay"
    ],
    summary: "This chapter covers Dynamic Host Configuration Protocol (DHCP) concepts, the four-step DORA message exchange (Discover, Offer, Request, Acknowledge), DHCP allocation modes, configuring a Cisco IOS router as a DHCPv4 server (including address exclusions), configuring a router as a DHCP Relay Agent using ip helper-address when the DHCP server resides on a remote subnet, and configuring an IOS router interface as a DHCPv4 client.",
    keyPoints: [
      "DHCP dynamically assigns an IPv4 address, subnet mask, default gateway (default-router), DNS server IP addresses, and domain name to hosts using the four-step DORA process over UDP ports 67 (server) and 68 (client).",
      "The 4 DORA messages: (1) Client broadcasts DHCPDISCOVER (Src IP 0.0.0.0, Dst IP 255.255.255.255, UDP Src 68, Dst 67); (2) Server responds with DHCPOFFER; (3) Client broadcasts DHCPREQUEST (Src IP 0.0.0.0, Dst IP 255.255.255.255) to request the offered IP; (4) Server sends DHCPACK confirming the lease.",
      "DHCP supports three allocation methods: Dynamic allocation (leases an IP from a pool for a bounded time), Automatic allocation (permanently assigns an IP from a pool), and Static/Manual allocation (binds a reserved IP to a specific client MAC/client-identifier).",
      "Because DHCPDISCOVER and DHCPREQUEST are limited broadcasts (255.255.255.255) that routers do NOT forward by default, a LAN without a local DHCP server requires a DHCP Relay Agent configured on the local router's LAN interface using ip helper-address <dhcp-server-ip>.",
      "When a router interface with ip helper-address receives a client broadcast DHCP message, it (1) changes the source IP to its own LAN interface IP, (2) changes the destination IP from 255.255.255.255 to the unicast IP of the DHCP server, (3) sets the DHCP GIADDR (Gateway IP Address) field inside the payload to its own LAN interface IP so the server knows which subnet pool to allocate from, and (4) routes the unicast packet.",
      "To configure a Cisco IOS DHCPv4 server: (1) exclude static IPs (like router gateways, servers, printers) in global config mode using ip dhcp excluded-address <low-ip> [high-ip], and (2) create a pool with ip dhcp pool <name> and specify network <net-id> <mask>, default-router <ip>, dns-server <ip>, and optionally lease <days> [hours] [minutes].",
      "A Cisco router or switch SVI can act as a DHCPv4 client to obtain its own interface IP address and subnet mask from an ISP or upstream DHCP server by configuring ip address dhcp under the interface.",
      "When a router interface configured with ip address dhcp receives a DHCP lease that includes a default-router option, the router automatically installs a default static route (0.0.0.0/0) with an Administrative Distance of 254 (floating static route).",
      "If a Windows or macOS client fails to receive a response from any DHCP server, it automatically self-assigns an APIPA (Automatic Private IP Addressing / link-local) address from the 169.254.0.0/16 range (169.254.1.0 to 169.254.254.255) and cannot communicate past the local router."
    ],
    keyTerms: [
      { term: "DORA Process", def: "The four-message DHCPv4 lease acquisition sequence: DHCP Discover, DHCP Offer, DHCP Request, and DHCP Acknowledge." },
      { term: "DHCP Relay Agent", def: "A router interface configured with ip helper-address that intercepts client DHCP broadcasts and forwards them as unicasts to a remote DHCP server." },
      { term: "GIADDR (Gateway IP Address)", def: "A field inside the DHCP header populated by the DHCP relay agent with its own LAN interface IP so the remote DHCP server selects the correct subnet pool." },
      { term: "ip helper-address", def: "An interface subcommand configured on the router LAN interface facing the clients that relays UDP broadcast services (including DHCP port 67) as unicast packets." },
      { term: "APIPA (169.254.0.0/16)", def: "Automatic Private IP Addressing—the RFC 3927 link-local range from which a DHCP client self-assigns an IP when no DHCP server responds." },
      { term: "DHCP Excluded Address", def: "IPv4 addresses removed from DHCP pool allocation via ip dhcp excluded-address so the DHCP server never leases out static router/server IPs." },
      { term: "DHCP Lease", def: "The time duration (default 1 day on Cisco IOS) for which a client is authorized to use a dynamically assigned IPv4 address before renewing." },
      { term: "DHCP Conflict", def: "An address collision detected when the IOS DHCP server pings an IP before offering it (or a client sends a Gratuitous ARP) and receives a reply." }
    ],
    commands: [
      { cmd: "ip helper-address address", desc: "Configures a router LAN interface to relay client DHCP broadcasts as unicast packets to the specified remote DHCP server IP", mode: "interface" },
      { cmd: "ip dhcp excluded-address low-address [high-address]", desc: "Excludes a single IPv4 address or inclusive range of addresses from being leased by the IOS DHCP server (global config mode!)", mode: "global" },
      { cmd: "ip dhcp pool name", desc: "Creates a DHCPv4 server address pool on the router and enters DHCP pool configuration mode", mode: "global" },
      { cmd: "network network-number [mask | /prefix-length]", desc: "Defines the subnet and mask of addresses managed by the DHCP pool", mode: "dhcp-config" },
      { cmd: "default-router address [address2...]", desc: "Specifies the default gateway IPv4 address leased to DHCP clients in the pool", mode: "dhcp-config" },
      { cmd: "dns-server address [address2...]", desc: "Specifies the DNS server IPv4 address(es) leased to DHCP clients in the pool", mode: "dhcp-config" },
      { cmd: "ip address dhcp", desc: "Configures an IOS router interface or switch SVI to obtain its own IPv4 address and mask as a DHCP client", mode: "interface" },
      { cmd: "show ip dhcp binding", desc: "Displays active DHCPv4 leases mapping leased IPv4 addresses to client MAC addresses/client-IDs and expiration times", mode: "user" },
      { cmd: "show ip dhcp pool [name]", desc: "Displays DHCP pool ranges, total addresses, leased addresses, and excluded address counts", mode: "user" },
      { cmd: "show ip dhcp conflict", desc: "Displays IPv4 addresses that the DHCP server detected as already in use on the network via ping or Gratuitous ARP", mode: "user" }
    ],
    tips: [
      "Exam favorite: Where do you configure `ip helper-address <server-ip>`? ALWAYS on the router interface connected to the LAN with the DHCP CLIENTS (the interface receiving the broadcast DHCPDISCOVER), and the IP specified is the unicast IP of the DHCP SERVER!",
      "Notice the mode difference: `ip dhcp excluded-address` is configured in GLOBAL configuration mode (`Router(config)#`), NOT inside `Router(dhcp-config)#`!",
      "Remember the client source/destination IPs during DORA: a booting client has NO IP yet, so it uses Source IP `0.0.0.0` and Destination IP `255.255.255.255` (UDP 68 -> 67) for DHCPDISCOVER and DHCPREQUEST."
    ]
  },
  {
    id: "v2c08",
    volume: 2,
    chapter: 8,
    title: "DHCP Snooping and ARP Inspection",
    domain: "Security Fundamentals",
    pages: "194-223",
    examTopics: [
      "5.7 Configure and verify Layer 2 security features (DHCP snooping, dynamic ARP inspection, and port security)"
    ],
    summary: "This chapter details two critical Cisco Catalyst Layer 2 security features: DHCP Snooping and Dynamic ARP Inspection (DAI). It explains how DHCP Snooping blocks rogue DHCP servers and builds the DHCP Snooping Binding Database by categorizing ports as Trusted or Untrusted, how Option 82 insertion and rate limiting work, and how DAI uses the DHCP Snooping Binding Database (and ARP ACLs for static hosts) to prevent Man-in-the-Middle ARP poisoning attacks.",
    keyPoints: [
      "DHCP Snooping is a Layer 2 switch feature that inspects DHCP messages, drops server-originated messages (DHCPOFFER, DHCPACK, DHCPNAK) arriving on untrusted ports, and records legitimate client leases in the DHCP Snooping Binding Database (MAC, IP, VLAN, port, lease time).",
      "In DHCP Snooping, all switch ports default to UNTRUSTED; administrators configure ONLY ports leading toward legitimate DHCP servers or upstream routers/trunks as TRUSTED using ip dhcp snooping trust.",
      "On Untrusted ports, DHCP Snooping also verifies that a client's DHCPRELEASE or DHCPDECLINE message matches the port and MAC recorded in the binding table, and verifies that the Layer 2 source MAC matches the client hardware address (CHADDR) inside the DHCP header.",
      "To enable DHCP Snooping on a Catalyst switch, you must issue BOTH `ip dhcp snooping` AND `ip dhcp snooping vlan <vlan-list>` in global configuration mode! Also, on Cisco IOS switches that are NOT acting as DHCP relay agents, you must issue `no ip dhcp snooping information option` or the downstream IOS DHCP server will drop DHCP messages containing an all-zeros GIADDR with Option 82 attached.",
      "To prevent DHCP starvation DoS attacks from an untrusted host, configure `ip dhcp snooping limit rate <pps>` on access ports; if the rate (packets per second) is exceeded, the switch places the port into the err-disabled state.",
      "Dynamic ARP Inspection (DAI) prevents Man-in-the-Middle gratuitous/spoofed ARP poisoning attacks by intercepting ARP requests and replies on untrusted ports and validating that the sender IP-to-MAC mapping matches the DHCP Snooping Binding Database before forwarding the ARP frame.",
      "Like DHCP Snooping, DAI treats all switch ports as UNTRUSTED by default; inter-switch trunks and uplinks to routers that do not run DHCP Snooping should be configured as TRUSTED using `ip arp inspection trust`.",
      "For servers or routers with static IPv4 addresses (which do not appear in the DHCP Snooping Binding Database), configure an `arp access-list <name>` with static `permit ip host <ip> mac host <mac>` entries and apply it to the VLAN with `ip arp inspection filter <acl-name> vlan <vlan-id>`.",
      "DAI can also perform optional sanity checks on ARP headers (`ip arp inspection validate {[src-mac] [dst-mac] [ip]}`) to verify that the Ethernet header source/destination MACs match the ARP body sender/target MACs and that the ARP IP addresses are not invalid (such as 0.0.0.0, 255.255.255.255, or multicast)."
    ],
    keyTerms: [
      { term: "DHCP Snooping", def: "A Layer 2 switch security feature that filters untrusted DHCP messages (blocking rogue DHCP servers) and builds the DHCP Snooping Binding Database." },
      { term: "DHCP Snooping Binding Database", def: "The table created by DHCP Snooping that maps each legitimate DHCP client's MAC address, leased IPv4 address, VLAN, switch port, and lease time." },
      { term: "Trusted Port", def: "A switch port configured with ip dhcp snooping trust or ip arp inspection trust (typically uplinks/trunks) where DHCP server replies and ARP frames are permitted without filtering." },
      { term: "Untrusted Port", def: "The default state for all switch ports in DHCP Snooping and DAI (used for end-host access ports), where DHCP server offers are dropped and ARP replies are validated." },
      { term: "Dynamic ARP Inspection (DAI)", def: "A Layer 2 security feature that validates ARP packets on untrusted ports against the DHCP Snooping Binding Database (and ARP ACLs) to block ARP spoofing." },
      { term: "ARP Poisoning (ARP Spoofing)", def: "A Man-in-the-Middle attack where an attacker sends forged ARP replies claiming the MAC address for the default gateway's IP address." },
      { term: "DHCP Option 82", def: "The DHCP Relay Agent Information Option inserted by switches into client DHCP frames to identify the switch and port where the frame entered." },
      { term: "ARP ACL", def: "A static IP-to-MAC mapping list (arp access-list) used by DAI to validate ARP packets from devices with statically configured IP addresses." }
    ],
    commands: [
      { cmd: "ip dhcp snooping", desc: "Globally enables the DHCP Snooping service on the switch (must also enable per VLAN!)", mode: "global" },
      { cmd: "ip dhcp snooping vlan vlan-range", desc: "Enables DHCP Snooping on the specified VLANs", mode: "global" },
      { cmd: "no ip dhcp snooping information option", desc: "Disables insertion of DHCP Option 82 by a Layer 2 switch so downstream IOS DHCP servers do not drop untrusted client frames", mode: "global" },
      { cmd: "ip dhcp snooping trust", desc: "Configures an interface (uplink/trunk toward the legitimate DHCP server) as trusted for DHCP Snooping", mode: "interface" },
      { cmd: "ip dhcp snooping limit rate rate", desc: "Limits the maximum number of DHCP packets per second accepted on an interface before err-disabling the port", mode: "interface" },
      { cmd: "ip arp inspection vlan vlan-range", desc: "Enables Dynamic ARP Inspection (DAI) on the specified VLANs", mode: "global" },
      { cmd: "ip arp inspection trust", desc: "Configures an uplink/trunk interface as trusted for Dynamic ARP Inspection", mode: "interface" },
      { cmd: "ip arp inspection validate {[src-mac] [dst-mac] [ip]}", desc: "Enables additional DAI header consistency checks comparing Ethernet L2 MACs to ARP payload MACs and checking invalid IPs", mode: "global" },
      { cmd: "show ip dhcp snooping", desc: "Displays global DHCP Snooping status, Option 82 settings, configured VLANs, and interface trust/rate-limit states", mode: "user" },
      { cmd: "show ip dhcp snooping binding", desc: "Displays the DHCP Snooping Binding Database (MAC address, IP address, lease time, VLAN, and interface)", mode: "user" },
      { cmd: "show ip arp inspection [interfaces | vlan vlan-id]", desc: "Displays DAI configuration, trusted/untrusted port states, rate limits (default 15 pps on untrusted), and forwarded/dropped ARP counts", mode: "user" }
    ],
    tips: [
      "Remember the dependency: Dynamic ARP Inspection (DAI) relies on the **DHCP Snooping Binding Database** to know which IP belongs to which MAC on which port! For hosts with static IPs, you must configure an `arp access-list`.",
      "Know which ports are Trusted vs. Untrusted: ALL ports default to **Untrusted** in both DHCP Snooping and DAI. Keep end-user PC/phone ports **Untrusted**; configure uplinks to legitimate DHCP servers, routers, and inter-switch trunks as **Trusted**.",
      "Memorize the default DAI rate limit: Untrusted ports are rate-limited to **15 ARP packets per second** by default (trusted ports have no rate limit); exceeding the limit places the port into `err-disabled`!",
      "If DHCP Snooping is enabled on a pure Layer 2 access switch and an IOS router is the DHCP server, remember `no ip dhcp snooping information option`—otherwise Option 82 is added with GIADDR 0.0.0.0 and the IOS router drops the packet!"
    ]
  },
  {
    id: "v2c09",
    volume: 2,
    chapter: 9,
    title: "Device Management Protocols",
    domain: "IP Services",
    pages: "224-257",
    examTopics: [
      "2.3 Configure and verify Layer 2 discovery protocols (Cisco Discovery Protocol and LLDP)",
      "4.2 Configure and verify NTP operating in a client and server mode",
      "4.5 Describe the use of syslog features including facilities and levels"
    ],
    summary: "This chapter covers essential network management and neighbor discovery protocols on Cisco IOS devices: Syslog message formatting, severity levels (0–7), and logging destinations; Network Time Protocol (NTP) client, server, and stratum hierarchy; and Layer 2 neighbor discovery using Cisco Discovery Protocol (CDP) and IEEE 802.1AB Link Layer Discovery Protocol (LLDP).",
    keyPoints: [
      "Syslog sends system status and troubleshooting messages to the Console (`logging console`), VTY/Telnet/SSH sessions (`logging monitor` + `terminal monitor`), internal RAM buffer (`logging buffered`), and external Syslog servers over UDP port 514 (`logging host <ip>`).",
      "A standard Cisco IOS Syslog message has the format `seq: timestamp: %FACILITY-SEVERITY-MNEMONIC: description` (e.g., `%LINK-3-UPDOWN: Interface GigabitEthernet0/0, changed state to up`).",
      "The 8 Syslog severity levels from most severe (0) to least severe (7) are: 0 Emergencies, 1 Alerts, 2 Critical, 3 Errors, 4 Warnings, 5 Notifications, 6 Informational, and 7 Debugging.",
      "When you configure a Syslog severity threshold (such as `logging trap 4` or `logging trap warnings`), IOS sends messages of that numerical level AND ALL LOWER (more severe) numbers—so level 4 logs levels 0, 1, 2, 3, and 4!",
      "Network Time Protocol (NTP) synchronizes device clocks over UDP port 123 using a hierarchical stratum number (1 to 15): Stratum 0 is an atomic/GPS reference clock, Stratum 1 is a server directly attached to a Stratum 0 clock, Stratum 2 syncs to a Stratum 1 server, and Stratum 16 indicates an unsynchronized clock.",
      "A Cisco router can act as an NTP client (`ntp server <ip>`), an NTP server (automatically when synchronized), or both simultaneously, and can use an authoritative internal clock (`ntp master [stratum]`, default stratum 8) when no external reference exists.",
      "Configuring a Loopback interface as the NTP source (`ntp source Loopback0`) ensures NTP packets always use a stable source IP regardless of which physical path is up.",
      "Cisco Discovery Protocol (CDP) is a Cisco-proprietary Layer 2 discovery protocol (enabled by default; 60s timer, 180s holdtime) that advertises device ID, IP addresses, platform hardware, IOS version, capabilities, local/remote interface names, native VLAN, and duplex to directly connected Cisco neighbors.",
      "Link Layer Discovery Protocol (LLDP, IEEE 802.1AB) is a vendor-neutral Layer 2 discovery protocol (disabled by default on Cisco IOS; 30s timer, 120s holdtime) enabled globally with `lldp run` and per interface with `lldp transmit` and `lldp receive`."
    ],
    keyTerms: [
      { term: "Syslog", def: "The standard logging protocol (UDP port 514) used by network devices to send timestamped event messages to local buffers or central logging servers." },
      { term: "Syslog Facility", def: "A code inside a Syslog message (such as LINK, LINEPROTO, OSPF, SYS, or SEC) that identifies the hardware or software subsystem that generated the log." },
      { term: "Syslog Severity Level", def: "An integer from 0 (Emergencies, most severe) to 7 (Debugging, least severe) indicating the urgency of a Syslog event." },
      { term: "Network Time Protocol (NTP)", def: "An IETF protocol (UDP port 123) that synchronizes the time-of-day clocks of routers, switches, and hosts to a reference time source." },
      { term: "NTP Stratum", def: "A hop-count metric (1 to 15) indicating how many NTP servers lie between a device and the authoritative atomic/GPS reference clock (Stratum 0)." },
      { term: "Cisco Discovery Protocol (CDP)", def: "A Cisco-proprietary Layer 2 multicast protocol (0100.0CCC.CCCC) that discovers directly connected Cisco devices even before Layer 3 IP is working." },
      { term: "Link Layer Discovery Protocol (LLDP)", def: "The IEEE 802.1AB vendor-neutral Layer 2 neighbor discovery protocol (and LLDP-MED extension for VoIP phones)." },
      { term: "service timestamps", def: "A global IOS command (`service timestamps log datetime msec`) that prepends accurate date/time stamps to Syslog and debug messages." }
    ],
    commands: [
      { cmd: "logging host {ip-address | hostname}", desc: "Specifies an external Syslog server (UDP port 514) to receive log messages", mode: "global" },
      { cmd: "logging trap level", desc: "Sets the maximum severity level (0–7 or keyword; default informational = 6) sent to external Syslog servers", mode: "global" },
      { cmd: "logging buffered [level | size]", desc: "Enables logging to internal RAM (viewable with show logging) and sets the severity threshold", mode: "global" },
      { cmd: "service timestamps {log | debug} datetime [msec]", desc: "Configures IOS to include the current date and time (with milliseconds) on log or debug messages", mode: "global" },
      { cmd: "ntp server ip-address", desc: "Configures the device as an NTP client that synchronizes its clock to the specified NTP server IP", mode: "global" },
      { cmd: "ntp master [stratum]", desc: "Configures the router to act as an authoritative NTP primary clock using its own internal clock (default stratum 8)", mode: "global" },
      { cmd: "show ntp status", desc: "Displays whether the clock is synchronized, the local stratum level, and the reference server IP", mode: "user" },
      { cmd: "show ntp associations", desc: "Lists configured NTP servers/peers with status symbols (* = current sys.peer, # = selected, + = candidate)", mode: "user" },
      { cmd: "show cdp neighbors [detail]", desc: "Displays directly connected Cisco neighbors (or detailed IPv4 addresses, IOS versions, and duplex/native VLAN with detail)", mode: "user" },
      { cmd: "lldp run", desc: "Globally enables IEEE 802.1AB LLDP on the router or switch", mode: "global" },
      { cmd: "show lldp neighbors [detail]", desc: "Displays directly connected LLDP-enabled neighbors (and IP/software details with detail)", mode: "user" }
    ],
    tips: [
      "Use the classic mnemonic to recall Syslog levels 0 to 7 in order: **E**very **A**wesome **C**isco **E**ngineer **W**ill **N**eed **I**cecream **D**aily = **0** Emergencies, **1** Alerts, **2** Critical, **3** Errors, **4** Warnings, **5** Notifications, **6** Informational, **7** Debugging.",
      "Know the difference between `show cdp neighbors` (shows Device ID, Local Intf, Holdtme, Capability, Platform, Port ID—NO IP address!) and `show cdp neighbors detail` (adds the neighbor's Layer 3 **IPv4 address**, full IOS version, duplex, and native VLAN).",
      "Know how to disable CDP and LLDP globally vs. per-interface: CDP = `no cdp run` (global) / `no cdp enable` (interface); LLDP = `no lldp run` (global) / `no lldp transmit` & `no lldp receive` (interface)."
    ]
  },
  {
    id: "v2c10",
    volume: 2,
    chapter: 10,
    title: "Network Address Translation",
    domain: "IP Services",
    pages: "258-285",
    examTopics: [
      "4.1 Configure and verify inside source NAT using static and pools"
    ],
    summary: "This chapter explains IPv4 Network Address Translation (NAT) used to conserve public IPv4 address space and allow RFC 1918 private hosts to communicate over the public Internet. It covers the four Cisco NAT address terms (Inside Local, Inside Global, Outside Local, Outside Global), Static NAT, Dynamic NAT (pooled without overload), and Port Address Translation (PAT / NAT Overload), along with complete IOS configuration and verification commands.",
    keyPoints: [
      "Cisco defines four NAT address terms for inside source NAT: Inside Local (the private RFC 1918 IP assigned to the inside host), Inside Global (the public routable IP representing the inside host to the outside network), Outside Global (the real public IP of the destination host on the Internet), and Outside Local (the IP of the outside host as seen from the inside network; identical to Outside Global in standard source NAT).",
      "In inside source NAT, as a packet travels from the inside network to the outside network, the router translates the SOURCE IP address from the Inside Local IP to the Inside Global IP; when the reply packet returns from the outside, the router translates the DESTINATION IP address from the Inside Global IP back to the Inside Local IP.",
      "Every NAT configuration on a Cisco router requires marking each participating interface as either inside (`ip nat inside`) or outside (`ip nat outside`).",
      "Static NAT creates a permanent one-to-one mapping between one Inside Local IP and one Inside Global IP (`ip nat inside source static <inside-local> <inside-global>`), allowing outside hosts on the Internet to initiate inbound connections to an internal server.",
      "Dynamic NAT (without overload) uses a standard ACL to identify inside hosts allowed to be translated and dynamically allocates an available public IP one-to-one from a configured `ip nat pool`; if all public IPs in the pool are currently in use, additional inside hosts are dropped until an entry times out or is cleared.",
      "Port Address Translation (PAT), also called NAT Overload, translates thousands of Inside Local IPv4 addresses into a SINGLE Inside Global IPv4 address (either an interface IP or a pool) by tracking and translating both the source IPv4 address and the 16-bit Layer 4 TCP/UDP source port number.",
      "To configure PAT using the router's public outside interface IP: (1) mark `ip nat inside` and `ip nat outside` on interfaces, (2) create a standard ACL matching the inside private subnet(s), and (3) configure `ip nat inside source list <acl> interface <ext-intf> overload`.",
      "To configure Dynamic NAT or PAT using a pool of public IPs: (1) mark interfaces, (2) create the standard ACL, (3) define `ip nat pool <name> <start-ip> <end-ip> netmask <mask>`, and (4) link the ACL to the pool with `ip nat inside source list <acl> pool <name> [overload]`.",
      "Omitting the `overload` keyword on a pooled NAT command configures 1-to-1 Dynamic NAT; adding the `overload` keyword enables PAT (many-to-few or many-to-one)!",
      "In `show ip nat translations`, each active flow shows Protocol (`tcp`, `udp`, `icmp`, or `---` for a static 1-to-1 base entry), Inside Global (`ip:port`), Inside Local (`ip:port`), Outside Local (`ip:port`), and Outside Global (`ip:port`)."
    ],
    keyTerms: [
      { term: "Inside Local Address", def: "The private IPv4 address (RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) assigned to a host inside the enterprise network before translation." },
      { term: "Inside Global Address", def: "The public, globally routable IPv4 address that represents an inside host to the outside network (Internet) after NAT translation." },
      { term: "Outside Global Address", def: "The legitimate public IPv4 address assigned to a destination host or server on the outside network (Internet)." },
      { term: "Outside Local Address", def: "The IPv4 address of an outside host as it appears to the inside network (equal to the Outside Global address when only inside source NAT is used)." },
      { term: "Static NAT", def: "A permanent, manually configured 1-to-1 mapping between one Inside Local IP and one Inside Global IP, supporting inbound connections from the Internet." },
      { term: "Dynamic NAT", def: "An on-demand 1-to-1 translation that maps an Inside Local IP matched by an ACL to the next available public IP from an ip nat pool." },
      { term: "Port Address Translation (PAT / NAT Overload)", def: "Many-to-one NAT that maps multiple Inside Local IPs to a single Inside Global IP by multiplexing unique Layer 4 TCP/UDP port numbers." },
      { term: "NAT Pool", def: "A contiguous range of public Inside Global IPv4 addresses defined on a router via ip nat pool for dynamic NAT or PAT allocation." }
    ],
    commands: [
      { cmd: "ip nat inside", desc: "Marks a router interface as connected to the internal private network", mode: "interface" },
      { cmd: "ip nat outside", desc: "Marks a router interface as connected to the external public network (ISP/Internet)", mode: "interface" },
      { cmd: "ip nat inside source static local-ip global-ip", desc: "Configures a permanent 1-to-1 Static NAT mapping between an Inside Local IP and an Inside Global IP", mode: "global" },
      { cmd: "ip nat pool name start-ip end-ip {netmask mask | prefix-length len}", desc: "Defines a pool of public Inside Global IPv4 addresses for Dynamic NAT or PAT", mode: "global" },
      { cmd: "ip nat inside source list acl-id pool pool-name [overload]", desc: "Configures Dynamic NAT (without overload) or pooled PAT (with overload) for inside hosts matched by the ACL", mode: "global" },
      { cmd: "ip nat inside source list acl-id interface type number overload", desc: "Configures PAT (NAT Overload) sharing the public IPv4 address assigned to the specified outside interface", mode: "global" },
      { cmd: "show ip nat translations", desc: "Displays the active NAT/PAT translation table with Inside Global, Inside Local, Outside Local, and Outside Global columns", mode: "user" },
      { cmd: "show ip nat statistics", desc: "Displays summary counts of active translations, inside/outside interfaces, NAT hits/misses, and pool utilization", mode: "user" },
      { cmd: "clear ip nat translation *", desc: "Clears all dynamic NAT/PAT entries from the translation table", mode: "privileged" }
    ],
    tips: [
      "Memorize the 2x2 NAT matrix: **Inside** vs. **Outside** tells you WHO owns the host (Inside = our enterprise host; Outside = remote Internet server). **Local** vs. **Global** tells you WHERE you are standing when looking at the packet (**Local** = private LAN side of the NAT router; **Global** = public Internet side of the NAT router)!",
      "Check the 3 common NAT troubleshooting pitfalls on exam questions: (1) forgetting `ip nat inside` or `ip nat outside` (or swapping them), (2) the standard ACL used by `ip nat inside source list` missing a new internal subnet, and (3) forgetting the `overload` keyword when a pool has fewer public IPs than active inside hosts.",
      "Notice the order of IPs in `ip nat inside source static <inside-local> <inside-global>` (Local first, Global second), whereas in `show ip nat translations` the columns are displayed **Inside Global** first, **Inside Local** second!"
    ]
  }
];
