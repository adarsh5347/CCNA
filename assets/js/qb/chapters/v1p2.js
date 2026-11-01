import { mk } from "../build.js?v=78";

// ============================================================================
// v1c11: Perspectives on IPv4 Subnetting
// Domain: "Network Fundamentals", weight 20, topics: "Subnetting", "IPv4"
// ============================================================================
const c11 = mk("Network Fundamentals", 20, "v1c11");
const q11 = [
  c11.s("Subnetting", "Easy",
    "Why does the formula for usable host IPv4 addresses in a subnet (2^H - 2) subtract two addresses?",
    "To reserve the lowest subnet ID and highest directed broadcast address",
    [
      ["To reserve one address for the primary router and one for a standby gateway", "Default gateway addresses come out of the usable host range, not the two protocol-reserved numbers."],
      ["To set aside the first and last addresses for local DHCP server operations", "DHCP uses normal usable host addresses; it does not reserve the boundary values of a subnet."],
      ["To prevent collisions with the classful network ID and loopback range", "Every individual subnet reserves its own lowest and highest values regardless of classful boundaries."]
    ],
    "In every IPv4 subnet with H host bits, 2^H total numeric values exist, but the lowest value (all host bits 0) is reserved as the subnet ID and the highest value (all host bits 1) is reserved as the subnet broadcast address. All numbers strictly between those two are assignable to host interfaces.",
    "Lowest = subnet ID (all 0s in host field); highest = broadcast (all 1s in host field).",
    []
  ),

  c11.s("IPv4", "Easy",
    "According to RFC 1918, how many private Class B networks are reserved for internal enterprise use?",
    "16 networks (172.16.0.0 through 172.31.0.0)",
    [
      ["1 network (172.16.0.0 through 172.16.255.255)", "172.16.0.0 is only the first of the 16 contiguous Class B networks defined by RFC 1918."],
      ["32 networks (172.0.0.0 through 172.31.0.0)", "172.0.0.0 through 172.15.0.0 are public Class B networks, not RFC 1918 private space."],
      ["256 networks (172.16.0.0 through 172.255.0.0)", "256 is the count of RFC 1918 private Class C networks (192.168.0.0 to 192.168.255.0)."]
    ],
    "RFC 1918 sets aside 1 Class A network (10.0.0.0), 16 Class B networks (172.16.0.0 to 172.31.0.0), and 256 Class C networks (192.168.0.0 to 192.168.255.0) as private IPv4 address space that can be reused across organizations behind NAT.",
    "RFC 1918 counts: 1 Class A (10/8), 16 Class B (172.16-31), 256 Class C (192.168.0-255).",
    []
  ),

  c11.s("Subnetting", "Easy",
    "What is the primary operational benefit of choosing a single-size subnet (one subnet mask) across an entire classful network?",
    "Operational simplicity because engineers work with a single mask everywhere",
    [
      ["Maximum conservation of IPv4 address space on point-to-point WAN links", "Using one mask everywhere wastes addresses on small links such as two-host WAN connections."],
      ["Elimination of the need for a default gateway on branch office LAN segments", "Every LAN subnet still requires a router or Layer 3 switch interface as a default gateway."],
      ["Automatic translation of private IPv4 addresses to public Internet addresses", "Subnet mask uniformity does not perform Network Address Translation (NAT)."]
    ],
    "A one-size-subnet-fits-all design uses the same subnet mask across all subnets, which makes subnet math, documentation, and troubleshooting much simpler for staff, at the cost of wasting IP addresses in smaller subnets.",
    "Single mask = simple operations but wastes addresses; VLSM = saves addresses but adds complexity.",
    []
  ),

  c11.s("Subnetting", "Easy",
    "What term describes a subnetting design that uses more than one subnet mask within the same classful IPv4 network?",
    "Variable-Length Subnet Masking (VLSM)",
    [
      ["Classful Interdomain Routing (CFI)", "No such standard exists; CIDR is Classless Interdomain Routing."],
      ["Dynamic Host Configuration Protocol (DHCP)", "DHCP dynamically leases IP addresses to hosts rather than defining mask lengths."],
      ["Network Address Translation (NAT)", "NAT translates between private and public IPv4 addresses at the network edge."]
    ],
    "Variable-Length Subnet Masking (VLSM) assigns different subnet masks to different subnets of the same Class A, B, or C network (for example, /30 on point-to-point WAN links and /24 on LANs) to reduce wasted host addresses.",
    "More than one mask in the same classful network = VLSM.",
    []
  ),

  c11.s("Subnetting", "Medium",
    "An enterprise internetwork has a central site with 14 VLANs and 4 branch offices with 3 VLANs each. Each branch connects to the central site over its own dedicated point-to-point WAN link. How many total IPv4 subnets are required?",
    "30 subnets",
    [
      ["26 subnets", "26 counts the 14 central VLANs and 12 branch VLANs but forgets the 4 point-to-point WAN links."],
      ["21 subnets", "21 undercounts the branch VLANs; 4 branches with 3 VLANs each require 12 branch LAN subnets."],
      ["34 subnets", "34 overcounts by four subnets; there are 14 + (4 x 3) + 4 = 30 locations needing a subnet."]
    ],
    "Plan one subnet per VLAN and one subnet per point-to-point WAN link. The central site needs 14 subnets, the 4 branches need 4 x 3 = 12 LAN subnets, and the 4 WAN links need 4 subnets, totaling 14 + 12 + 4 = 30 subnets.",
    "Total subnets = sum of all VLANs at all sites + sum of all point-to-point WAN links.",
    []
  ),

  c11.s("Subnetting", "Medium",
    "A single-mask subnet design must support up to 300 host IP addresses in the largest LAN subnet. What is the minimum number of host bits (H) required in the subnet mask?",
    "9 host bits",
    [
      ["8 host bits", "8 host bits provide 2^8 - 2 = 254 usable addresses, which is fewer than the required 300 hosts."],
      ["10 host bits", "10 host bits provide 1022 usable addresses, which works but is not the minimum number of host bits needed."],
      ["7 host bits", "7 host bits provide only 2^7 - 2 = 126 usable host addresses per subnet."]
    ],
    "With H host bits, a subnet supports 2^H - 2 usable host addresses. Eight host bits yield 2^8 - 2 = 254 hosts (too small for 300), whereas 9 host bits yield 2^9 - 2 = 510 usable hosts, making 9 the minimum required.",
    "Check powers of two: 2^8 - 2 = 254, 2^9 - 2 = 510, 2^10 - 2 = 1022.",
    []
  ),

  c11.s("Subnetting", "Medium",
    "When an engineer borrows bits to subnet a Class B network, how do the sizes of the network (N), subnet (S), and host (H) parts change compared to the unsubnetted network?",
    "The 16-bit network part stays fixed while the host part shrinks by S subnet bits",
    [
      ["The network part shrinks by S bits while the host part remains fixed at 16 bits", "Classful network bits are locked by the address class (16 for Class B) and cannot be borrowed."],
      ["Both the network part and the host part shrink equally to form the subnet field", "Subnet bits are borrowed exclusively from the original host field, never from the network field."],
      ["The total address length increases beyond 32 bits to accommodate the S subnet bits", "IPv4 addresses are always 32 bits long, so N + S + H must always equal 32."]
    ],
    "In classful subnetting, the network field size N is fixed by the address class (8, 16, or 24 bits). Creating a subnet field of S bits borrows those bits from the original host field, shrinking H so that N + S + H = 32.",
    "Subnetting borrows from the host bits only; N is locked by Class A (8), B (16), or C (24).",
    []
  ),

  c11.s("Subnetting", "Medium",
    "An enterprise is subnetting private Class B network 172.20.0.0 with a single subnet mask and needs at least 180 subnets and at least 150 hosts per subnet. Which combination of network (N), subnet (S), and host (H) bits meets both requirements?",
    "N = 16, S = 8, H = 8",
    [
      ["N = 16, S = 7, H = 9", "S = 7 yields only 2^7 = 128 subnets, which fails the 180-subnet requirement."],
      ["N = 16, S = 9, H = 7", "H = 7 yields only 2^7 - 2 = 126 usable hosts per subnet, failing the 150-host requirement."],
      ["N = 8, S = 8, H = 16", "172.20.0.0 is a Class B network with N = 16 network bits, not a Class A network with N = 8."]
    ],
    "Class B network 172.20.0.0 fixes N = 16. Supporting 180 subnets requires 2^S >= 180, so S >= 8 (2^8 = 256). Supporting 150 hosts requires 2^H - 2 >= 150, so H >= 8 (2^8 - 2 = 254). Since 16 + 8 + 8 = 32, only N = 16, S = 8, H = 8 works.",
    "Verify three conditions: N matches class, 2^S >= needed subnets, and 2^H - 2 >= needed hosts.",
    []
  ),

  c11.m("IPv4", "Medium",
    "Which of the following IPv4 addresses belong to the RFC 1918 private address ranges?",
    ["172.31.250.10", "192.168.0.254"],
    [
      ["172.32.100.15", "The Class B private range stops at 172.31.255.255; 172.32.0.0/16 is a public network."],
      ["192.1.168.100", "Class C private networks must begin with 192.168 in the first two octets."],
      ["11.100.250.10", "Only Class A network 10.0.0.0/8 is private; 11.0.0.0/8 is a public Class A block."]
    ],
    "RFC 1918 defines private IPv4 ranges as 10.0.0.0–10.255.255.255, 172.16.0.0–172.31.255.255, and 192.168.0.0–192.168.255.255. Addresses starting with 172.32, 192.1, or 11 fall outside these ranges and are public.",
    "Watch the second octet carefully on 172.x (must be 16 through 31 inclusive) and 192.x (must be 168).",
    []
  ),

  c11.s("Subnetting", "Hard",
    "A Class B network is subnetted using a single mask to support 60 subnets while maximizing the number of usable host addresses per subnet. How many usable hosts per subnet does the resulting mask provide?",
    "1022 usable hosts per subnet",
    [
      ["510 usable hosts per subnet", "510 hosts corresponds to H = 9 and S = 7 (128 subnets), which borrows one more subnet bit than necessary."],
      ["2046 usable hosts per subnet", "2046 hosts corresponds to H = 11 and S = 5, which provides only 2^5 = 32 subnets (fewer than 60)."],
      ["254 usable hosts per subnet", "254 hosts corresponds to H = 8 and S = 8 (256 subnets), which does not maximize hosts per subnet."]
    ],
    "To maximize hosts per subnet, borrow the fewest subnet bits S such that 2^S >= 60. Since 2^5 = 32 and 2^6 = 64, S = 6 is the minimum needed. In a Class B network (N = 16), H = 32 - 16 - 6 = 10 host bits, giving 2^10 - 2 = 1022 usable hosts per subnet.",
    "To maximize hosts, minimize S; to maximize subnets, minimize H.",
    []
  ),

  c11.m("Subnetting", "Hard",
    "A network engineer is subdividing Class C network 192.168.50.0 with a single subnet mask so that it supports at least 5 subnets and at least 25 hosts per subnet. Which combinations of network (N), subnet (S), and host (H) bits are valid?",
    ["N = 24, S = 3, H = 5 — mask /27 or 255.255.255.224", "N = 24, S = 3, H = 5 — 8 subnets and 30 hosts each"],
    [
      ["N = 24, S = 2, H = 6 — 4 subnets and 62 hosts each", "S = 2 provides only 2^2 = 4 subnets, which is less than the required 5 subnets."],
      ["N = 24, S = 4, H = 4 — 16 subnets and 14 hosts each", "H = 4 provides only 2^4 - 2 = 14 usable hosts per subnet, failing the 25-host requirement."],
      ["N = 16, S = 10, H = 6 — mask /26 or 255.255.255.192", "192.168.50.0 is a Class C network with N = 24 network bits, not a Class B network."]
    ],
    "For Class C network 192.168.50.0, N = 24, leaving 8 bits to split between S and H. Requiring 5 subnets forces S >= 3 (2^3 = 8), and requiring 25 hosts forces H >= 5 (2^5 - 2 = 30). Since 3 + 5 = 8, N = 24, S = 3, H = 5 is the single workable split.",
    "In Class C, S + H must equal 8; check both 2^S >= subnets and 2^H - 2 >= hosts.",
    []
  ),

  c11.s("Subnetting", "Hard",
    "An administrator plans implementation for subnet 172.16.8.0/24 by reserving the lowest 40 usable IPv4 addresses for static assignment on routers, switches, and servers, and assigning the remaining usable addresses to a DHCP pool. What is the exact IPv4 address range for the DHCP pool?",
    "172.16.8.41 through 172.16.8.254",
    [
      ["172.16.8.40 through 172.16.8.255", "172.16.8.40 is the 40th static address (.1 to .40), and 172.16.8.255 is the reserved subnet broadcast address."],
      ["172.16.8.41 through 172.16.8.255", "172.16.8.255 is the subnet broadcast address and cannot be leased to a DHCP client."],
      ["172.16.8.40 through 172.16.8.254", "The first 40 usable addresses are 172.16.8.1 through 172.16.8.40, so the DHCP pool must start at .41."]
    ],
    "In 172.16.8.0/24, 172.16.8.0 is the subnet ID and 172.16.8.255 is the broadcast address, making the usable range 172.16.8.1 to 172.16.8.254. Reserving the first 40 usable addresses takes 172.16.8.1 through 172.16.8.40, leaving 172.16.8.41 through 172.16.8.254 for DHCP.",
    "Count inclusive ranges carefully: .1 through .40 is 40 addresses, so the next address is .41.",
    []
  ),

  c11.d("Subnetting", "Hard",
    "Order the three major phases of IPv4 subnet planning, design, and implementation from first to last, starting with requirement gathering.",
    [
      "Analyze subnetting and addressing needs (count subnets, count hosts per subnet, decide on single vs multiple sizes)",
      "Make subnet design choices (choose a classful network, choose the subnet mask, build the list of all subnets)",
      "Plan the implementation (assign subnets to network locations, choose static IP ranges and DHCP ranges)"
    ],
    "A structured subnetting workflow begins by analyzing network requirements (how many subnets and hosts are needed), proceeds to designing the addressing scheme (selecting the network and mask and listing the resulting subnets), and finishes by planning the deployment (mapping subnets to VLANs/WANs and splitting static vs DHCP ranges).",
    "Workflow order: Analyze Needs -> Design Subnets -> Plan Implementation.",
    []
  ),

  c11.t("IPv4", "Medium",
    "Match each technology or RFC 1918 mechanism introduced in the 1990s to how it helped extend the lifespan of IPv4.",
    [
      ["IPv6", "Replaces 32-bit addresses with 128-bit addresses to provide a vastly larger address space"],
      ["Classless Interdomain Routing (CIDR)", "Assigns variable-sized public address blocks instead of whole classful networks to reduce waste"],
      ["Network Address Translation (NAT)", "Translates many internal private IPv4 addresses into a small set of public IPv4 addresses"],
      ["RFC 1918 Private Networks", "Defines reusable non-routable Class A, B, and C blocks that shrink Internet routing tables"]
    ],
    "To combat IPv4 exhaustion in the 1990s, the Internet community introduced CIDR (allocating arbitrary-sized public blocks), NAT and RFC 1918 private addressing (allowing organizations to reuse 10/8, 172.16/12, and 192.168/16 internally), and IPv6 (a long-term 128-bit replacement).",
    "Short-term relief = NAT + RFC 1918 + CIDR; long-term replacement = IPv6.",
    []
  )
];

// ============================================================================
// v1c12: Analyzing Classful IPv4 Networks
// Domain: "Network Fundamentals", weight 20, topic: "IPv4"
// ============================================================================
const c12 = mk("Network Fundamentals", 20, "v1c12");
const q12 = [
  c12.s("IPv4", "Easy",
    "Which first-octet decimal range identifies a Class B unicast IPv4 network?",
    "128 to 191",
    [
      ["1 to 126", "First-octet values 1 through 126 identify Class A unicast networks."],
      ["192 to 223", "First-octet values 192 through 223 identify Class C unicast networks."],
      ["224 to 239", "First-octet values 224 through 239 identify Class D multicast addresses."]
    ],
    "IPv4 classful addressing determines the class from the first octet: Class A is 1–126 (with 0 and 127 reserved), Class B is 128–191, Class C is 192–223, Class D (multicast) is 224–239, and Class E (reserved) is 240–255.",
    "Memorize first octets: A = 1-126, B = 128-191, C = 192-223, D = 224-239, E = 240-255.",
    []
  ),

  c12.s("IPv4", "Easy",
    "What is the purpose of the Class D IPv4 address range (224.0.0.0 through 239.255.255.255)?",
    "Multicast delivery of a single packet to a joined group of hosts",
    [
      ["Unicast host addressing for small LANs of up to 254 hosts per site", "Unicast addressing for small networks is the role of Class C (192–223)."],
      ["Reserved address space designated for experimental or future needs", "Class E (240–255) is the reserved/experimental address range."],
      ["Loopback and local software testing on the host's TCP/IP stack", "Loopback testing uses the reserved 127.0.0.0/8 range (such as 127.0.0.1)."]
    ],
    "Classes A, B, and C are unicast address classes, whereas Class D (first octet 224–239) is dedicated to IPv4 multicast groups and Class E (240–255) is reserved for future or experimental use.",
    "Class D = Multicast (224-239); Class E = Reserved/Experimental (240-255).",
    []
  ),

  c12.s("IPv4", "Easy",
    "Why are there only 126 valid Class A networks (2^7 - 2) instead of 128?",
    "First-octet values 0 and 127 are reserved for special default and loopback use",
    [
      ["Addresses starting with 127 and 128 in the first octet belong to Class B instead", "128 is the start of Class B, whose first bit is 1; the 7-bit Class A space runs from 0 to 127."],
      ["Two Class A networks are subtracted for the subnet ID and directed broadcast", "The -2 in 2^H - 2 applies to hosts inside a network, whereas 0.0.0.0 and 127.0.0.0 are whole reserved networks."],
      ["IANA permanently retired networks 10.0.0.0 and 126.0.0.0 from the classful table", "Both 10.0.0.0 (private) and 126.0.0.0 (public) are counted among the 126 valid Class A networks."]
    ],
    "In Class A, the first bit of the first octet is locked to 0, leaving 7 bits (128 combinations: 0–127). However, 0.0.0.0/8 (originally reserved for broadcasting/default routing) and 127.0.0.0/8 (reserved for loopback testing) cannot be used as normal Class A networks, leaving 126 networks (1.0.0.0 to 126.0.0.0).",
    "0 and 127 are excluded from Class A, leaving 1 through 126.",
    []
  ),

  c12.s("IPv4", "Easy",
    "How many usable host IPv4 addresses exist in an unsubnetted Class B network?",
    "65,534 usable host addresses (2^16 - 2)",
    [
      ["16,384 usable host addresses (2^14)", "16,384 (2^14) is the total number of Class B networks that exist, not the hosts per network."],
      ["16,777,214 usable host addresses (2^24 - 2)", "16,777,214 is the number of usable host addresses in an unsubnetted Class A network."],
      ["254 usable host addresses (2^8 - 2)", "254 is the number of usable host addresses in an unsubnetted Class C network."]
    ],
    "An unsubnetted Class B network has a 2-octet (16-bit) network part and a 2-octet (16-bit) host part, with default mask 255.255.0.0. Using 2^H - 2 gives 2^16 - 2 = 65,534 usable host addresses per Class B network.",
    "Class B: 16,384 networks (2^14), each holding 65,534 hosts (2^16 - 2).",
    []
  ),

  c12.s("IPv4", "Medium",
    "Given the IPv4 address 150.199.0.14, what are its classful network ID and classful network broadcast address?",
    "Network ID 150.199.0.0 and broadcast address 150.199.255.255",
    [
      ["Network ID 150.0.0.0 and broadcast address 150.255.255.255", "150 is in the 128–191 Class B range (2 network octets), not the 1–126 Class A range."],
      ["Network ID 150.199.0.0 and broadcast address 150.199.0.255", "Setting only the fourth octet to 255 treats the address as Class C instead of Class B."],
      ["Network ID 150.199.0.1 and broadcast address 150.199.255.254", "150.199.0.1 and 150.199.255.254 are the first and last usable host addresses, not the ID and broadcast."]
    ],
    "Because 150 falls between 128 and 191, 150.199.0.14 is in a Class B network with 2 network octets (150.199) and 2 host octets. Setting the two host octets to 0 yields network ID 150.199.0.0, and setting both host octets to 255 yields network broadcast address 150.199.255.255.",
    "Determine the class from the first octet first, then zero out or 255-out the host octets.",
    []
  ),

  c12.s("IPv4", "Medium",
    "What are the first usable host address and last usable host address in the unsubnetted classful network containing 118.45.9.200?",
    "118.0.0.1 and 118.255.255.254",
    [
      ["118.45.0.1 and 118.45.255.254", "118 is in the Class A range (1–126), so only the first octet is the network part, not the first two."],
      ["118.0.0.0 and 118.255.255.255", "118.0.0.0 is the reserved network ID and 118.255.255.255 is the reserved network broadcast address."],
      ["118.45.9.1 and 118.45.9.254", "Keeping the first three octets fixed treats 118.45.9.200 as a Class C address rather than Class A."]
    ],
    "First octet 118 is in the Class A range (1–126), giving 1 network octet and 3 host octets. The network ID is 118.0.0.0 (add 1 to the fourth octet for first usable: 118.0.0.1) and the broadcast address is 118.255.255.255 (subtract 1 from the fourth octet for last usable: 118.255.255.254).",
    "Class A network ID = X.0.0.0 (+1 -> X.0.0.1); broadcast = X.255.255.255 (-1 -> X.255.255.254).",
    []
  ),

  c12.m("IPv4", "Medium",
    "Which of the following statements are true regarding the unsubnetted classful network that contains IPv4 address 128.0.5.99?",
    ["Its unsubnetted classful network address is 128.0.0.0", "Its default classful subnet mask is 255.255.0.0 or /16"],
    [
      ["It belongs to a Class A network since octet two is zero", "Class is determined solely by the first octet (128 is Class B), even when the second octet happens to be 0."],
      ["Its classful network broadcast address is 128.255.255.255", "Because 128.0.0.0 is Class B, the first two octets (128.0) stay fixed, making the broadcast 128.0.255.255."],
      ["It contains 24 host bits in the unsubnetted network", "Class B networks have 16 network bits and 16 host bits, not 24 host bits."]
    ],
    "Although 128.0.0.0 ends in three 0s and resembles a Class A network ID, its first octet is 128, which is the lowest Class B value (128–191). Therefore, its network part is two octets (128.0), its default mask is 255.255.0.0, its network ID is 128.0.0.0, and its broadcast address is 128.0.255.255.",
    "Never judge address class by trailing 0s or 255s; always look at the first octet!",
    []
  ),

  c12.s("IPv4", "Medium",
    "How many total Class C networks exist according to the classful IPv4 addressing rules?",
    "2,097,152 networks (2^21)",
    [
      ["16,384 networks (2^14)", "16,384 (2^14) is the total number of Class B networks."],
      ["16,777,216 networks (2^24)", "Although Class C uses 24 network bits, the first 3 bits are fixed to 110, leaving 21 bits (2^21) to number networks."],
      ["65,536 networks (2^16)", "65,536 is 2^16, which does not account for the 3-octet network part of Class C."]
    ],
    "Class C networks use 3 octets (24 bits) for the network field, but the first three bits of the first octet are always binary 110 (producing the decimal range 192–223). The remaining 24 - 3 = 21 network bits yield 2^21 = 2,097,152 Class C networks.",
    "Network counts: Class A = 2^7 - 2 (126), Class B = 2^14 (16,384), Class C = 2^21 (2,097,152).",
    []
  ),

  c12.s("IPv4", "Hard",
    "Examine the IPv4 address 192.0.0.17. What are the classful network ID and the classful network broadcast address for this address?",
    "Network ID 192.0.0.0 and broadcast address 192.0.0.255",
    [
      ["Network ID 192.0.0.0 and broadcast address 192.255.255.255", "Changing the second and third octets to 255 wrongly applies Class A rules to a Class C address."],
      ["Network ID 192.0.0.0 and broadcast address 192.0.255.255", "Changing the third and fourth octets to 255 wrongly applies Class B rules to a Class C address."],
      ["It is an invalid unicast address because the second and third octets are 0", "Zero is a completely valid number in the second and third network octets of a Class C network."]
    ],
    "A first octet of 192 places 192.0.0.17 at the lower boundary of Class C (192–223), which has 3 network octets (192.0.0) and 1 host octet. Setting only the fourth (host) octet to 0 gives network ID 192.0.0.0, and setting only the fourth octet to 255 gives broadcast address 192.0.0.255.",
    "Do not change 0s in the network octets to 255 when finding the broadcast; only change host octets!",
    []
  ),

  c12.s("IPv4", "Hard",
    "Examine the IPv4 address 191.255.14.88. What are its classful network ID, last usable host address, and classful network broadcast address?",
    "Network ID 191.255.0.0, last usable 191.255.255.254, broadcast 191.255.255.255",
    [
      ["Network ID 191.0.0.0, last usable 191.255.255.254, broadcast 191.255.255.255", "191 is in the Class B range (128–191), so the second octet (255) is part of the network ID, not a host octet."],
      ["Network ID 191.255.14.0, last usable 191.255.14.254, broadcast 191.255.14.255", "191 is the upper edge of Class B (2 network octets), whereas Class C begins at 192."],
      ["It is a reserved directed broadcast address since the second octet is already 255", "A value of 255 in a network octet is completely valid; 191.255.0.0 is the highest-numbered Class B network."]
    ],
    "First octet 191 is the top of the Class B range (128–191), so the first two octets (191.255) form the network part and the last two octets form the host part. Setting the two host octets to 0 gives network ID 191.255.0.0; setting them to 255 gives broadcast 191.255.255.255, and subtracting 1 gives last usable 191.255.255.254.",
    "191.255.0.0 is the highest Class B network ID; its broadcast 191.255.255.255 looks like Class A but is Class B.",
    []
  ),

  c12.s("IPv4", "Hard",
    "Which of the following IPv4 addresses is a valid classful network broadcast address for an unsubnetted Class A, B, or C network?",
    "223.223.0.255",
    [
      ["10.1.255.255", "10.0.0.0 is a Class A network, so its unsubnetted classful broadcast address is 10.255.255.255, not 10.1.255.255."],
      ["172.30.0.255", "172.30.0.0 is a Class B network, so its unsubnetted classful broadcast address is 172.30.255.255, not 172.30.0.255."],
      ["224.1.1.255", "First octet 224 belongs to Class D multicast, which does not have classful network IDs or broadcast addresses."]
    ],
    "For 223.223.0.255, the first octet 223 is in the Class C range (192–223), meaning the first three octets (223.223.0) identify the Class C network 223.223.0.0 and the fourth octet (255) is all 1s in the single host octet, making 223.223.0.255 its valid classful broadcast address.",
    "A valid classful broadcast must have 255 in every host octet determined by its class (3 for A, 2 for B, 1 for C).",
    []
  ),

  c12.m("IPv4", "Hard",
    "Which of the following values are valid unsubnetted classful network IDs?",
    ["191.255.0.0", "223.255.255.0"],
    [
      ["127.0.0.0", "All addresses beginning with 127 are reserved for loopback testing and are not a valid Class A network."],
      ["128.0.0.0 is Class A", "128.0.0.0 is a valid Class B network ID (first two octets 128.0), not a Class A network ID."],
      ["192.168.0.0", "192 is Class C (3 network octets), so 192.168.0.0 is a specific Class C network ID only when all 3 octets are considered, wait—let's check: 130.0.0.0 is Class B, whereas 0.0.0.0 is reserved."]
    ],
    "Class B network IDs span from 128.0.0.0 to 191.255.0.0, and Class C network IDs span from 192.0.0.0 to 223.255.255.0. Thus, both 191.255.0.0 (highest Class B network) and 223.255.255.0 (highest Class C network) are valid classful network IDs, whereas 127.0.0.0 is reserved for loopback.",
    "Class B network IDs: 128.0.0.0 to 191.255.0.0; Class C network IDs: 192.0.0.0 to 223.255.255.0.",
    []
  ),

  c12.d("IPv4", "Medium",
    "Place the six steps for deriving the classful network ID, broadcast address, and usable host address range from a given IPv4 address into their logical order.",
    [
      "Examine the first octet to determine the address class (A, B, or C)",
      "Mentally divide the four octets into the network part and host part based on the class",
      "Set all host octets of the IPv4 address to 0 to find the classful network ID",
      "Add 1 to the fourth octet of the network ID to find the first usable host address",
      "Set all host octets of the network ID to 255 to find the classful network broadcast address",
      "Subtract 1 from the fourth octet of the broadcast address to find the last usable host address"
    ],
    "Finding the four key numbers of an unsubnetted classful network starts by identifying the class from the first octet, splitting the network and host octets, zeroing the host octets for the network ID (+1 for first usable), and setting the host octets to 255 for the broadcast address (-1 for last usable).",
    "Class -> Split N/H -> Host=0 (Net ID) -> +1 (First) -> Host=255 (Broadcast) -> -1 (Last).",
    []
  ),

  c12.t("IPv4", "Easy",
    "Match each IPv4 unicast class to its default mask, network/host octet split, and valid first-octet range.",
    [
      ["Class A", "First octet 1–126, default mask 255.0.0.0 (/8), 1 network octet and 3 host octets"],
      ["Class B", "First octet 128–191, default mask 255.255.0.0 (/16), 2 network octets and 2 host octets"],
      ["Class C", "First octet 192–223, default mask 255.255.255.0 (/24), 3 network octets and 1 host octet"]
    ],
    "Each unicast class defines a fixed boundary between network and host octets: Class A (1–126) uses 1 network octet (255.0.0.0), Class B (128–191) uses 2 network octets (255.255.0.0), and Class C (192–223) uses 3 network octets (255.255.255.0).",
    "Octets of 255 in the default mask match the position of the letter in the alphabet: A=1, B=2, C=3.",
    []
  )
];

// ============================================================================
// v1c13: Analyzing Subnet Masks
// Domain: "Network Fundamentals", weight 20, topic: "Subnetting"
// ============================================================================
const c13 = mk("Network Fundamentals", 20, "v1c13");
const q13 = [
  c13.s("Subnetting", "Easy",
    "Which rule must every valid 32-bit binary IPv4 subnet mask follow?",
    "All binary 1s must be contiguous on the left, followed by all binary 0s on the right",
    [
      ["All binary 0s must be contiguous on the left side, followed by binary 1s on the right", "0s on the left and 1s on the right describes a wildcard mask, not a subnet mask."],
      ["Each of the four octets must contain an even number of binary 1s and binary 0s", "An octet in a valid subnet mask can have anywhere from zero to eight consecutive 1s."],
      ["Binary 1s and 0s may be interleaved as long as the total count of binary 1s is at least 8", "Interleaving 1s and 0s is strictly illegal in an IPv4 subnet mask."]
    ],
    "Because the prefix (network + subnet) part always precedes the host part in an IPv4 address, a binary subnet mask must consist of a single unbroken string of binary 1s starting on the left, followed by an unbroken string of binary 0s on the right.",
    "Valid subnet masks never interleave 1s and 0s: left side = all 1s (prefix), right side = all 0s (host).",
    []
  ),

  c13.s("Subnetting", "Easy",
    "What is the dotted-decimal notation (DDN) equivalent of the prefix mask /27?",
    "255.255.255.224",
    [
      ["255.255.255.240", "255.255.255.240 has 8 + 8 + 8 + 4 = 28 binary 1s, which corresponds to /28."],
      ["255.255.255.192", "255.255.255.192 has 8 + 8 + 8 + 2 = 26 binary 1s, which corresponds to /26."],
      ["255.255.255.248", "255.255.255.248 has 8 + 8 + 8 + 5 = 29 binary 1s, which corresponds to /29."]
    ],
    "A /27 mask has 27 binary 1s followed by 5 binary 0s: 11111111.11111111.11111111.11100000. The first three octets of eight 1s each equal 255, and the fourth octet 11100000 (128 + 64 + 32) equals 224, giving 255.255.255.224.",
    "Nine valid mask octet values for 0..8 ones: 0, 128, 192, 224, 240, 248, 252, 254, 255.",
    []
  ),

  c13.s("Subnetting", "Easy",
    "What is the prefix (CIDR) notation equivalent of the dotted-decimal subnet mask 255.255.252.0?",
    "/22",
    [
      ["/21", "A /21 mask has five 1s in the third octet (11111000), which is 255.255.248.0."],
      ["/23", "A /23 mask has seven 1s in the third octet (11111110), which is 255.255.254.0."],
      ["/20", "A /20 mask has four 1s in the third octet (11110000), which is 255.255.240.0."]
    ],
    "In 255.255.252.0, the first two octets each contain 8 binary 1s (8 + 8 = 16). In the third octet, decimal 252 is binary 11111100, which has 6 binary 1s, and the fourth octet has 0 binary 1s. Summing 8 + 8 + 6 + 0 yields /22.",
    "252 in binary is 11111100 (six 1s, two 0s); 8 + 8 + 6 = 22.",
    []
  ),

  c13.s("Subnetting", "Easy",
    "How does the classless view of an IPv4 address differ from the classful view?",
    "Classless addressing ignores Class A/B/C rules and splits the address into prefix and host",
    [
      ["Classless addressing divides the 32-bit address into three parts: network, subnet, and host", "Dividing the address into network, subnet, and host parts is the definition of classful addressing."],
      ["Classless addressing eliminates the subnet mask and relies only on the first octet value", "Classless addressing relies entirely on the subnet mask (prefix length) and ignores first-octet class rules."],
      ["Classless addressing applies only to IPv6 128-bit addresses and never to 32-bit IPv4 addresses", "Both classless and classful addressing views apply to 32-bit IPv4 addresses."]
    ],
    "Under classless addressing, an IPv4 address is viewed as having just two parts defined solely by the mask: the prefix (P bits, where the mask has binary 1s) and the host part (H bits, where the mask has binary 0s). Classful addressing applies Class A, B, or C rules to split the prefix into network (N) and subnet (S) fields.",
    "Classless = 2 parts (Prefix + Host); Classful = 3 parts (Network + Subnet + Host).",
    []
  ),

  c13.s("Subnetting", "Medium",
    "Which of the following dotted-decimal numbers is NOT a valid IPv4 subnet mask?",
    "255.255.244.0",
    [
      ["255.255.240.0", "240 is binary 11110000 (four contiguous 1s followed by four 0s), making 255.255.240.0 a valid /20 mask."],
      ["255.255.248.0", "248 is binary 11111000 (five contiguous 1s followed by three 0s), making 255.255.248.0 a valid /21 mask."],
      ["255.255.224.0", "224 is binary 11100000 (three contiguous 1s followed by five 0s), making 255.255.224.0 a valid /19 mask."]
    ],
    "Every octet of a valid DDN subnet mask must be one of the nine legal values: 0, 128, 192, 224, 240, 248, 252, 254, or 255. Decimal 244 converts to binary 11110100, which interleaves a 0 and a 1 and is therefore illegal in a subnet mask.",
    "Only 9 decimal numbers can ever appear in a subnet mask: 0, 128, 192, 224, 240, 248, 252, 254, 255.",
    []
  ),

  c13.s("Subnetting", "Medium",
    "A host is configured with IPv4 address 10.55.120.14 and subnet mask 255.255.248.0. Using classful addressing logic, what are the sizes of the network (N), subnet (S), and host (H) parts?",
    "N = 8, S = 13, H = 11",
    [
      ["N = 8, S = 16, H = 8", "S = 16 and H = 8 corresponds to a /24 mask (255.255.255.0), not 255.255.248.0 (/21)."],
      ["N = 16, S = 5, H = 11", "First octet 10 is in the Class A range (1–126), so N = 8, not 16."],
      ["N = 8, S = 12, H = 12", "248 has 5 binary 1s (not 4), so the prefix length is /21 (S = 13, H = 11), not /20."]
    ],
    "Mask 255.255.248.0 has 8 + 8 + 5 + 0 = 21 binary 1s (/21), so P = 21 and H = 32 - 21 = 11 host bits. Because 10.55.120.14 has first octet 10 (Class A), N = 8 network bits, and S = P - N = 21 - 8 = 13 subnet bits.",
    "Formulas: N = 8/16/24 (by class), S = P - N, and H = 32 - P.",
    []
  ),

  c13.s("Subnetting", "Medium",
    "A router interface is assigned 172.25.80.1/22. Assuming the same /22 mask is used throughout the entire Class B network, how many subnets and how many usable hosts per subnet exist?",
    "64 subnets and 1022 usable hosts per subnet",
    [
      ["62 subnets and 1024 usable hosts per subnet", "The -2 subtraction applies to usable hosts (2^H - 2), not to the number of subnets (2^S)."],
      ["16,384 subnets and 1022 usable hosts per subnet", "172.25.0.0 is Class B (N = 16), so S = 22 - 16 = 6 (2^6 = 64 subnets), not S = 14."],
      ["128 subnets and 510 usable hosts per subnet", "128 subnets and 510 hosts would result from a /23 mask (S = 7, H = 9), not a /22 mask."]
    ],
    "For 172.25.80.1/22, first octet 172 is Class B (N = 16) and P = 22. Thus S = 22 - 16 = 6 subnet bits, giving 2^6 = 64 subnets, and H = 32 - 22 = 10 host bits, giving 2^10 - 2 = 1022 usable hosts per subnet.",
    "Subnets = 2^S (no subtraction); Usable hosts = 2^H - 2.",
    []
  ),

  c13.s("Subnetting", "Medium",
    "What are the prefix format and dotted-decimal format for the binary mask 11111111 11111110 00000000 00000000?",
    "/15 and 255.254.0.0",
    [
      ["/14 and 255.252.0.0", "The second octet 11111110 has seven 1s (254), not six 1s (252)."],
      ["/15 and 255.255.254.0", "Only the first two octets contain 1s; the third octet is all 0s."],
      ["/17 and 255.255.128.0", "Counting 8 + 7 gives 15 binary 1s, not 17."]
    ],
    "The first octet has eight 1s (255), the second octet 11111110 has seven 1s (decimal 254), and the last two octets have zero 1s (0). Adding 8 + 7 + 0 + 0 gives 15 binary 1s (/15) and dotted-decimal 255.254.0.0.",
    "11111110 in binary = 254 in decimal (7 ones, 1 zero).",
    []
  ),

  c13.s("Subnetting", "Hard",
    "A workstation is configured with IPv4 address 203.0.113.45 and subnet mask 255.255.255.0. When analyzed using classful addressing rules, how many subnet bits (S) exist and what does this indicate?",
    "0 subnet bits, indicating the Class C network is unsubnetted with default mask",
    [
      ["8 subnet bits, indicating that the network has been divided into 256 subnets", "First octet 203 is Class C (N = 24), so a /24 mask has S = 24 - 24 = 0 subnet bits, not 8."],
      ["16 subnet bits, indicating that the network has been divided into 65,536 subnets", "S = 16 with a /24 mask only occurs when the address is in a Class A network (N = 8)."],
      ["8 subnet bits, indicating that 8 bits remain in the fourth octet for hosts", "The 8 remaining bits are host bits (H = 8), not subnet bits (S = 0)."]
    ],
    "First octet 203 is in the Class C range (192–223), so N = 24 network bits. The mask 255.255.255.0 converts to /24 (P = 24). Calculating S = P - N gives 24 - 24 = 0 subnet bits, showing that the Class C network uses its default mask and has not been subnetted.",
    "When P equals N (default mask), S = 0 and the classful network is not subnetted.",
    []
  ),

  c13.m("Subnetting", "Hard",
    "Which of the following subnet masks, if used as the single mask throughout a Class B network, provide at least 500 subnets AND at least 60 usable hosts per subnet?",
    ["255.255.255.128", "/26"],
    [
      ["255.255.255.0", "In a Class B network (N = 16), 255.255.255.0 (/24) has S = 8, providing only 2^8 = 256 subnets (fewer than 500)."],
      ["/27", "A /27 mask has H = 32 - 27 = 5 host bits, providing only 2^5 - 2 = 30 usable hosts per subnet (fewer than 60)."],
      ["255.255.254.0", "255.255.254.0 (/23) has S = 23 - 16 = 7, providing only 2^7 = 128 subnets."]
    ],
    "In a Class B network (N = 16), needing >= 500 subnets requires S >= 9 (2^9 = 512), so P >= 16 + 9 = 25. Needing >= 60 usable hosts requires H >= 6 (2^6 - 2 = 62), so P <= 32 - 6 = 26. Therefore, only /25 (255.255.255.128) and /26 (255.255.255.192) meet both criteria.",
    "Find the valid prefix window: N + S_min <= P <= 32 - H_min.",
    []
  ),

  c13.s("Subnetting", "Hard",
    "Two subnets in different parts of an enterprise use 10.20.4.0/26 and 192.168.4.0/26. If each classful network uses /26 as its only mask, how do the usable hosts per subnet and total subnets compare between the two networks?",
    "Both have 62 usable hosts per subnet, while 10.0.0.0 has 2^18 subnets and 192.168.4.0 has 4",
    [
      ["Both networks have 62 usable hosts per subnet and both have a total of 4 /26 subnets", "10.0.0.0 is Class A (N = 8), so a /26 mask borrows S = 26 - 8 = 18 subnet bits (2^18 subnets), not 2."],
      ["10.20.4.0/26 has many more usable hosts per subnet since 10.0.0.0 is a Class A network block", "The number of usable hosts per subnet (2^H - 2) depends only on the mask (/26 -> H = 6 -> 62 hosts), never on the class."],
      ["Both have 64 usable hosts per subnet, while 10.0.0.0 has 2^16 subnets and 192.168.4.0 has 2 subnets", "With H = 6, usable hosts is 2^6 - 2 = 62 (not 64), and S is 18 for Class A and 2 for Class C."]
    ],
    "Because both subnets use a /26 mask, both have H = 32 - 26 = 6 host bits and therefore 2^6 - 2 = 62 usable hosts per subnet. However, 10.0.0.0 is Class A (N = 8, so S = 26 - 8 = 18 and 2^18 = 262,144 subnets), whereas 192.168.4.0 is Class C (N = 24, so S = 26 - 24 = 2 and 2^2 = 4 subnets).",
    "Hosts per subnet depends ONLY on the mask (H = 32 - P); subnets in the network depends on both mask and class (S = P - N).",
    []
  ),

  c13.s("Subnetting", "Hard",
    "A point-to-point WAN link uses IPv4 address 198.51.100.17 with mask 255.255.255.252. What are the values of N, S, H, total subnets (assuming one mask across the classful network), and usable hosts per subnet?",
    "N = 24, S = 6, H = 2, 64 subnets, and 2 usable hosts per subnet",
    [
      ["N = 24, S = 5, H = 3, 32 subnets, and 6 usable hosts per subnet", "255.255.255.252 is /30 (S = 6, H = 2), whereas S = 5, H = 3 corresponds to 255.255.255.248 (/29)."],
      ["N = 16, S = 14, H = 2, 16,384 subnets, and 2 usable hosts per subnet", "First octet 198 is in the Class C range (192–223), so N = 24, not 16."],
      ["N = 24, S = 6, H = 2, 62 subnets, and 4 usable hosts per subnet", "The -2 subtraction belongs on the host formula (2^2 - 2 = 2 hosts), not the subnet formula (2^6 = 64 subnets)."]
    ],
    "Mask 255.255.255.252 has 8 + 8 + 8 + 6 = 30 binary 1s (/30). First octet 198 is Class C, so N = 24. That gives S = 30 - 24 = 6 subnet bits (2^6 = 64 subnets) and H = 32 - 30 = 2 host bits (2^2 - 2 = 2 usable hosts per subnet, ideal for point-to-point links).",
    "/30 (255.255.255.252) always leaves H = 2 host bits -> 2^2 - 2 = 2 usable hosts.",
    []
  ),

  c13.d("Subnetting", "Medium",
    "Order the six steps for analyzing an IPv4 address and DDN subnet mask to find N, S, H, usable hosts per subnet, and total subnets.",
    [
      "Convert the dotted-decimal subnet mask to prefix format (/P) by counting the binary 1s",
      "Examine the first octet of the IPv4 address to determine the class and number of network bits (N)",
      "Subtract N from P to calculate the number of subnet bits (S = P - N)",
      "Subtract P from 32 to calculate the number of host bits (H = 32 - P)",
      "Calculate the number of usable hosts per subnet using 2^H - 2",
      "Calculate the number of subnets in the classful network using 2^S"
    ],
    "Starting from an IPv4 address and DDN mask, first find /P from the mask and N from the first-octet class. From P and N, compute S = P - N and H = 32 - P, and then apply 2^H - 2 for hosts per subnet and 2^S for total subnets.",
    "Find P and N first -> derive S = P - N and H = 32 - P -> compute 2^H - 2 and 2^S.",
    []
  ),

  c13.t("Subnetting", "Easy",
    "Match each subnet mask octet value in dotted-decimal notation to its 8-bit binary form and count of binary 1s.",
    [
      ["192", "11000000 (2 binary 1s)"],
      ["224", "11100000 (3 binary 1s)"],
      ["240", "11110000 (4 binary 1s)"],
      ["248", "11111000 (5 binary 1s)"],
      ["252", "11111100 (6 binary 1s)"],
      ["254", "11111110 (7 binary 1s)"]
    ],
    "Each consecutive binary 1 added from left to right in an 8-bit mask octet adds the next power of 2 (128, +64=192, +32=224, +16=240, +8=248, +4=252, +2=254, +1=255).",
    "Add powers of 2 from left to right: 128, 192, 224, 240, 248, 252, 254, 255.",
    []
  )
];

// ============================================================================
// v1c14: Analyzing Existing Subnets
// Domain: "Network Fundamentals", weight 20, topic: "Subnetting"
// ============================================================================
const c14 = mk("Network Fundamentals", 20, "v1c14");
const q14 = [
  c14.s("Subnetting", "Easy",
    "In binary, what is the value of the host part of any subnet ID and any subnet broadcast address?",
    "All binary 0s for the subnet ID and all binary 1s for the subnet broadcast address",
    [
      ["All binary 1s for the subnet ID and all binary 0s for the subnet broadcast address", "All 0s is the lowest value (subnet ID) and all 1s is the highest value (subnet broadcast), not vice versa."],
      ["All binary 0s except the last bit is 1 for the subnet ID, and all binary 1s for the broadcast", "All 0s with the last bit set to 1 is the first usable host IP address, not the subnet ID."],
      ["Equal to the subnet mask in the subnet ID and inverted in the subnet broadcast address", "The prefix part matches the IP address, while the host bits are set to all 0s (ID) or all 1s (broadcast)."]
    ],
    "Every number in a subnet shares the exact same binary value in the prefix part. Because the subnet ID is the numerically lowest number in the subnet, its host bits are all binary 0s; because the subnet broadcast address is the highest number, its host bits are all binary 1s.",
    "Binary host field: all 0s = subnet ID, all 1s = broadcast, anything in between = usable host.",
    []
  ),

  c14.s("Subnetting", "Easy",
    "When using the decimal method to analyze a difficult mask, how is the 'magic number' calculated in the interesting octet?",
    "256 minus the dotted-decimal mask value in the interesting octet",
    [
      ["255 minus the dotted-decimal subnet mask value in the interesting octet", "Subtracting from 255 is off by one; subtracting from 256 gives the exact power-of-2 block size."],
      ["256 minus the host IPv4 address value in the interesting octet", "The magic number depends only on the subnet mask octet, never on the IP address octet."],
      ["32 minus the total prefix length (/P) of the configured subnet mask", "32 - P calculates the total number of host bits (H), not the decimal block increment in the interesting octet."]
    ],
    "In the interesting octet (the single octet where the DDN mask is neither 255 nor 0), the magic number is calculated as 256 - mask. Adjacent subnet IDs increment by multiples of this magic number in the interesting octet.",
    "Magic number = 256 - mask (in the interesting octet).",
    []
  ),

  c14.s("Subnetting", "Easy",
    "What is the resident subnet ID and subnet broadcast address for 10.77.55.19 with subnet mask 255.255.0.0?",
    "Subnet ID 10.77.0.0 and broadcast address 10.77.255.255",
    [
      ["Subnet ID 10.0.0.0 and broadcast address 10.255.255.255", "10.0.0.0 is the unsubnetted Class A network ID (/8), but the mask 255.255.0.0 (/16) copies the first two octets."],
      ["Subnet ID 10.77.55.0 and broadcast address 10.77.55.255", "Copying three octets applies a 255.255.255.0 (/24) mask rather than 255.255.0.0 (/16)."],
      ["Subnet ID 10.77.0.1 and broadcast address 10.77.255.254", "10.77.0.1 and 10.77.255.254 are the first and last usable host addresses in the subnet."]
    ],
    "Mask 255.255.0.0 is an 'easy mask' containing only 255s and 0s. Where the mask is 255 (first two octets), copy the IP address (10.77); where the mask is 0 (last two octets), write 0 for the subnet ID (10.77.0.0) and 255 for the broadcast address (10.77.255.255).",
    "For mask octets of 255 -> copy the IP octet; for mask octets of 0 -> 0 for ID, 255 for broadcast.",
    []
  ),

  c14.s("Subnetting", "Easy",
    "Which bitwise Boolean operation do computers perform between an IPv4 address and its subnet mask to calculate the subnet ID?",
    "A bitwise Boolean AND of the IPv4 address and the subnet mask",
    [
      ["A bitwise Boolean OR of the IPv4 address and the subnet mask", "ORing with the mask would turn all prefix bits to 1 rather than zeroing out the host bits."],
      ["A bitwise Boolean XOR of the IPv4 address and the inverted subnet mask", "XORing with the inverted mask flips the host bits instead of setting them all to 0."],
      ["A bitwise Boolean AND of the IPv4 address and the inverted subnet mask", "ANDing with the inverted mask zeroes out the prefix part and keeps only the host part."]
    ],
    "Because 1 AND x = x and 0 AND x = 0, performing a bitwise Boolean AND between the 32-bit IPv4 address and the 32-bit subnet mask copies all prefix bits (where the mask is 1) and forces all host bits (where the mask is 0) to 0, producing the subnet ID.",
    "IP AND Mask = Subnet ID; IP OR (NOT Mask) = Broadcast Address.",
    []
  ),

  c14.s("Subnetting", "Medium",
    "What is the resident subnet ID for the IPv4 address 172.22.149.73/20?",
    "172.22.144.0",
    [
      ["172.22.128.0", "128 is a multiple of 16, but 144 (9 x 16) is closer to 149 without going over."],
      ["172.22.148.0", "148 is a multiple of 4 (/22 mask), not a multiple of 16 (/20 mask, 255.255.240.0)."],
      ["172.22.160.0", "160 goes over 149; 172.22.160.0 is the next subnet ID after 172.22.144.0."]
    ],
    "A /20 mask is 255.255.240.0, making the third octet the interesting octet with magic number 256 - 240 = 16. The multiples of 16 near 149 are 128, 144, and 160. The multiple closest to 149 without going over is 144, and the fourth octet (mask 0) becomes 0, giving 172.22.144.0.",
    "/20 = 255.255.240.0 -> magic number 16 in the 3rd octet.",
    []
  ),

  c14.s("Subnetting", "Medium",
    "What is the subnet broadcast address for the subnet that contains 192.168.14.197/27?",
    "192.168.14.223",
    [
      ["192.168.14.224", "192.168.14.224 is the subnet ID of the next /27 subnet; the broadcast address is one less (.223)."],
      ["192.168.14.255", "192.168.14.255 would be the broadcast for a /24 or /26 subnet at the top of the octet, not 192.168.14.192/27."],
      ["192.168.14.207", "207 would be the broadcast if the magic number were 16 (/28), but /27 has a magic number of 32."]
    ],
    "Mask /27 is 255.255.255.224, so the fourth octet is interesting with magic number 256 - 224 = 32. Multiples of 32 are 0, 32, 64, 96, 128, 160, 192, 224. For .197, the subnet ID is 192.168.14.192, and the broadcast is ID + magic - 1 = 192 + 32 - 1 = 223 (192.168.14.223).",
    "Broadcast in interesting octet = Subnet ID + Magic Number - 1.",
    []
  ),

  c14.s("Subnetting", "Medium",
    "What is the range of usable unicast IPv4 addresses for the subnet containing 172.18.67.200 with mask 255.255.252.0?",
    "172.18.64.1 through 172.18.67.254",
    [
      ["172.18.64.0 through 172.18.67.255", "172.18.64.0 is the subnet ID and 172.18.67.255 is the subnet broadcast address; neither is usable by a host."],
      ["172.18.67.1 through 172.18.67.254", "That range assumes a /24 mask; with 255.255.252.0 (/22), the subnet spans four third-octet values (64 to 67)."],
      ["172.18.66.1 through 172.18.67.254", "66 to 67 is a block size of 2 (mask 255.255.254.0, /23), whereas 255.255.252.0 has a magic number of 4."]
    ],
    "In 255.255.252.0 (/22), the third octet is interesting with magic number 256 - 252 = 4. The multiple of 4 closest to 67 without going over is 64, so the subnet ID is 172.18.64.0 and the broadcast is 172.18.67.255 (64 + 4 - 1 = 67 in the third octet, 255 in the fourth). Adding 1 to the ID and subtracting 1 from the broadcast gives 172.18.64.1 through 172.18.67.254.",
    "When the interesting octet is octet 2 or 3, always remember +1 and -1 happen in the 4th octet!",
    []
  ),

  c14.s("Subnetting", "Medium",
    "What is the resident subnet ID for IPv4 address 10.120.251.19/13?",
    "10.120.0.0",
    [
      ["10.120.248.0", "10.120.248.0 treats the third octet as the interesting octet (/21), but /13 has the interesting octet in the second octet."],
      ["10.112.0.0", "112 is a multiple of 8, but 120 (15 x 8) is an exact multiple of 8 and does not go over 120."],
      ["10.120.251.16", "10.120.251.16 treats the fourth octet as the interesting octet (/29) instead of the second octet (/13)."]
    ],
    "A /13 mask has 8 + 5 + 0 + 0 binary 1s, which is 255.248.0.0 in DDN. The second octet is the interesting octet with magic number 256 - 248 = 8. Since 120 is itself an exact multiple of 8 (8 x 15 = 120), the second octet stays 120 and the last two octets (mask 0) become 0, yielding 10.120.0.0.",
    "If the IP address value in the interesting octet is already a multiple of the magic number, keep that exact value!",
    []
  ),

  c14.s("Subnetting", "Hard",
    "Why can the configuration command `ip address 192.168.9.143 255.255.255.248` NOT be assigned to a router interface?",
    "192.168.9.143 is the subnet broadcast address for subnet 192.168.9.136/29",
    [
      ["192.168.9.143 is the subnet ID for subnet 192.168.9.143/29", "Subnet IDs for a /29 mask (magic number 8) must be even multiples of 8 (136, 144), never an odd number like 143."],
      ["192.168.9.143 is a valid usable host address, so the router will accept it without error", "With magic number 8, the subnet starting at .136 ends at broadcast .143, so IOS rejects it as a host IP."],
      ["The mask 255.255.255.248 interleaves binary 1s and 0s and is rejected as an invalid mask", "255.255.255.248 (/29) has 29 contiguous 1s followed by three 0s and is a completely legal mask."]
    ],
    "With mask 255.255.255.248 (/29), the fourth octet has magic number 256 - 248 = 8. The multiples of 8 around 143 are 136 (8 x 17) and 144 (8 x 18). Thus, the subnet ID is 192.168.9.136, the usable host range is .137 through .142, and 192.168.9.143 (136 + 8 - 1) is the reserved subnet broadcast address.",
    "Always check whether an odd-looking fourth octet is actually (Subnet ID + Magic - 1) = Broadcast!",
    ["ip address"]
  ),

  c14.s("Subnetting", "Hard",
    "A DHCP server is configured to lease the last 50 usable IPv4 addresses in subnet 172.29.112.0/21. Which of the following IPv4 addresses falls within that DHCP pool?",
    "172.29.119.220",
    [
      ["172.29.112.220", "172.29.112.220 is in the very first /24 portion of the /21 subnet, nowhere near the last 50 usable addresses."],
      ["172.29.115.240", "A /21 mask has a magic number of 8 (spanning 112 through 119 in the third octet), not 4 (112 through 115)."],
      ["172.29.120.210", "172.29.120.0/21 is the next subnet; 172.29.112.0/21 ends at broadcast 172.29.119.255."]
    ],
    "For subnet 172.29.112.0/21 (mask 255.255.248.0), the third octet has magic number 256 - 248 = 8. Thus, the broadcast address is 172.29.119.255 (112 + 8 - 1 = 119) and the last usable address is 172.29.119.254. The last 50 usable addresses are 172.29.119.205 through 172.29.119.254, which includes 172.29.119.220.",
    "In a /21 subnet starting at .112.0, the third octet runs from 112 to 119; the highest addresses are in 172.29.119.x.",
    []
  ),

  c14.m("Subnetting", "Hard",
    "Which two of the following IPv4 addresses reside in the same /26 subnet as 10.14.88.211/26?",
    ["10.14.88.193", "10.14.88.254"],
    [
      ["10.14.88.192", "10.14.88.192 is the subnet ID itself, though if asking about usable host addresses—wait: 10.14.88.190 is in the preceding subnet 10.14.88.128/26, so let's check: 10.14.88.192 is the subnet ID, 10.14.88.190 is in 10.14.88.128/26, and 10.14.89.195 has a different third octet."],
      ["10.14.88.190", "10.14.88.190 falls in the previous subnet (10.14.88.128/26, usable range .129 to .190)."],
      ["10.14.89.200", "The third octet is 89 instead of 88, which places it in a completely different subnet."]
    ],
    "A /26 mask is 255.255.255.192, giving a magic number of 256 - 192 = 64 in the fourth octet. Multiples of 64 are 0, 64, 128, 192. Address 10.14.88.211 resides in subnet 10.14.88.192/26, whose usable host addresses span from 10.14.88.193 (first usable) through 10.14.88.254 (last usable), with .255 as the broadcast.",
    "/26 splits the fourth octet into four blocks of 64: 0..63, 64..127, 128..191, and 192..255.",
    []
  ),

  c14.s("Subnetting", "Hard",
    "An engineer needs to list all subnet IDs of Class B network 172.16.0.0 when subnetted with a single mask of 255.255.224.0 (/19). How many subnets exist and what are the first four subnet IDs?",
    "8 subnets; first four are 172.16.0.0, 172.16.32.0, 172.16.64.0, and 172.16.96.0",
    [
      ["8 subnets; first four are 172.16.32.0, 172.16.64.0, 172.16.96.0, and 172.16.128.0", "Counting multiples of the magic number must always start at 0 (the zero subnet 172.16.0.0)."],
      ["4 subnets; first four are 172.16.0.0, 172.16.64.0, 172.16.128.0, and 172.16.192.0", "Multiples of 64 (4 subnets) correspond to a /18 mask (255.255.192.0), not /19 (255.255.224.0)."],
      ["16 subnets; first four: 172.16.0.0, 172.16.16.0, 172.16.32.0, and 172.16.48.0", "Multiples of 16 (16 subnets) correspond to a /20 mask (255.255.240.0), not /19."]
    ],
    "For Class B network 172.16.0.0 with mask 255.255.224.0 (/19), S = 19 - 16 = 3 subnet bits, creating 2^3 = 8 subnets. In the third (interesting) octet, the magic number is 256 - 224 = 32, so the subnet IDs increment by 32 starting at 0: 172.16.0.0, 172.16.32.0, 172.16.64.0, 172.16.96.0, 172.16.128.0, 172.16.160.0, 172.16.192.0, and 172.16.224.0.",
    "Always start multiples of the magic number at 0 (the zero subnet is valid and used!).",
    []
  ),

  c14.d("Subnetting", "Medium",
    "Order the steps of the binary process for finding the subnet ID of a given IPv4 address and mask.",
    [
      "Convert the subnet mask to prefix format (/P) to identify the P prefix bits and 32 - P host bits",
      "Convert the 4-octet dotted-decimal IPv4 address into its 32-bit binary equivalent",
      "Copy the first P prefix bits from the binary IPv4 address unchanged",
      "Set all remaining 32 - P host bits on the right to binary 0",
      "Convert the resulting 32-bit binary number back to dotted-decimal notation 8 bits at a time"
    ],
    "To find a subnet ID in binary, determine the prefix/host dividing line from /P, write the IP address in binary, copy the P prefix bits, replace all host bits with binary 0s, and convert each 8-bit octet back to decimal.",
    "When converting back from binary to decimal, always convert a full 8-bit octet at a time!",
    []
  ),

  c14.t("Subnetting", "Medium",
    "Match each IPv4 address and prefix length to its resident subnet ID and subnet broadcast address.",
    [
      ["10.85.190.44/19", "Subnet ID 10.85.160.0, Broadcast 10.85.191.255"],
      ["192.168.73.110/28", "Subnet ID 192.168.73.96, Broadcast 192.168.73.111"],
      ["10.44.17.130/25", "Subnet ID 10.44.17.128, Broadcast 10.44.17.255"],
      ["172.30.99.4/18", "Subnet ID 172.30.64.0, Broadcast 172.30.127.255"]
    ],
    "Using magic numbers: /19 (third octet magic 32) puts 190 into 160..191; /28 (fourth octet magic 16) puts 110 into 96..111; /25 (fourth octet magic 128) puts 130 into 128..255; /18 (third octet magic 64) puts 99 into 64..127.",
    "Quick magic numbers: /18 or /26 -> 64; /19 or /27 -> 32; /20 or /28 -> 16; /25 -> 128.",
    []
  )
];

// ============================================================================
// v1c15: Operating Cisco Routers
// Domain: "IP Connectivity", weight 25, topic: "Router CLI"
// ============================================================================
const c15 = mk("IP Connectivity", 25, "v1c15");
const q15 = [
  c15.s("Router CLI", "Easy",
    "What do the two interface status codes (first column and second column) in `show ip interface brief` represent on a Cisco router?",
    "Physical line status (Layer 1) first, and protocol state (Layer 2) second",
    [
      ["Protocol status (Layer 2) first, and physical line status (Layer 1) second", "The first status code is the physical layer line status, and the second is the data-link protocol status."],
      ["Administrative state first, and IPv4 routing protocol neighbor state second", "Neither status column reports routing protocol neighbor state; they reflect Layer 1 and Layer 2 operation."],
      ["Duplex negotiation state first, and speed autonegotiation state second", "Duplex and speed are shown in `show interfaces`, not as the two up/down status columns in `show ip interface brief`."]
    ],
    "Every Cisco router interface reports two status codes: the first is the line status, which indicates whether the physical layer (Layer 1) is working, and the second is the protocol status, which indicates whether the data-link layer protocol (Layer 2) is functioning.",
    "First status = Line status (Layer 1); Second status = Protocol status (Layer 2).",
    ["show ip interface brief", "show interfaces"]
  ),

  c15.s("Router CLI", "Easy",
    "Which interface status combination appears when a router interface has the `shutdown` command applied in its configuration?",
    "administratively down / down — interface disabled by shutdown",
    [
      ["down / down — interface enabled but physical Layer 1 is down", "A status of down/down means the interface is enabled (`no shutdown`) but has a Layer 1 physical problem."],
      ["up / down — physical Layer 1 is up but Layer 2 protocol fails", "A status of up/down means Layer 1 is working but Layer 2 has a data-link configuration mismatch or keepalive failure."],
      ["administratively down / up — Layer 1 disabled while Layer 2 is up", "The protocol status (second code) can never be up when the line status (first code) is down."]
    ],
    "When an interface has `shutdown` configured (which is the default state on most Cisco enterprise router interfaces), its line status is listed as `administratively down` and its protocol status is `down`. Issuing `no shutdown` transitions it out of the administratively down state.",
    "administratively down = `shutdown` command is active on the local interface.",
    ["shutdown", "no shutdown", "show ip interface brief"]
  ),

  c15.s("Router CLI", "Easy",
    "Which physical port is commonly found on Cisco enterprise routers for out-of-band dial-in access via an external analog modem, but is absent on Cisco Catalyst switches?",
    "RJ-45 Auxiliary (Aux) port",
    [
      ["RJ-45 Serial Console port", "Both Cisco routers and Cisco Catalyst switches include an RJ-45 console port."],
      ["USB Mini-B Console port", "Many modern Cisco routers and Catalyst switches both provide a USB console port."],
      ["SFP fiber-optic uplink port", "Both enterprise routers and Catalyst switches commonly include SFP ports for fiber Ethernet uplinks."]
    ],
    "Most Cisco enterprise routers include an Auxiliary (Aux) port configured under `line aux 0` that connects to an external analog modem and telephone line for remote dial-in CLI administration. Cisco Catalyst LAN switches do not have an Aux port.",
    "Routers have `line aux 0` (Auxiliary port) and a power on/off switch; Catalyst switches typically have neither.",
    ["line aux 0"]
  ),

  c15.s("Router CLI", "Easy",
    "What is the default `transport input` setting under `line vty` on a typical Cisco router, and how does it affect remote CLI connections?",
    "`transport input none`, which blocks incoming Telnet and SSH connections by default",
    [
      ["`transport input all`, which permits both incoming Telnet and SSH sessions by default", "Catalyst switches often default to allowing Telnet/SSH, whereas modern router IOS defaults to `transport input none`."],
      ["`transport input ssh`, which permits only encrypted SSH sessions by default", "SSH requires generating RSA keys, configuring credentials, and explicitly enabling `transport input ssh`."],
      ["`transport input telnet`, which permits only cleartext Telnet connections by default", "Router IOS defaults to `transport input none` on vty lines, disallowing Telnet until configured."]
    ],
    "Unlike many Catalyst switches, Cisco router IOS typically defaults to `transport input none` in vty line configuration mode, preventing any incoming Telnet or SSH connections until an administrator configures `transport input ssh`, `transport input telnet`, or `transport input all`.",
    "Router vty default = `transport input none` (no Telnet or SSH allowed until configured).",
    ["transport input ssh", "transport input telnet", "transport input all"]
  ),

  c15.s("Router CLI", "Medium",
    "A Cisco 4321 Integrated Services Router (ISR) has both an RJ-45 copper port and an SFP fiber cage labeled `Gi0/0`. How can an administrator use these two physical connectors?",
    "Either the RJ-45 port or the SFP port can be active for Gi0/0, but never both at once",
    [
      ["Both physical ports can be used at the same time by configuring Gi0/0.1 and Gi0/0.2", "Subinterfaces divide a single physical link into logical VLANs; they do not activate both dual-purpose connectors."],
      ["Both physical ports can be bundled together into a two-link Layer 3 EtherChannel", "Both connectors map to the single logical interface Gi0/0, so only one physical medium can be active."],
      ["The RJ-45 port is used exclusively for console access while the SFP port carries WAN traffic", "Gi0/0 is a normal routed Gigabit Ethernet interface; the console port is a separate dedicated port."]
    ],
    "On many Cisco ISR routers, an interface such as Gi0/0 provides dual-media hardware: one RJ-45 jack for UTP copper cabling and one SFP slot for fiber-optic transceivers. Because both share the single logical interface `GigabitEthernet0/0`, only one connector can be used at a time.",
    "Dual-purpose Gi0/0 port (RJ-45 + SFP) = one logical interface, use one connector or the other.",
    ["interface gigabitethernet 0/0"]
  ),

  c15.s("Router CLI", "Medium",
    "Which command displays a brief one- or two-line summary per interface that includes both the interface status codes AND the subnet mask (in prefix `/P` format)?",
    "`show protocols` in privileged EXEC mode",
    [
      ["`show ip interface brief` in privileged EXEC", "`show ip interface brief` lists the IPv4 address and status codes on one line, but it omits the subnet mask."],
      ["`show interfaces` in privileged EXEC mode", "`show interfaces` includes the address, `/P` mask, and status, but outputs dozens of lines of statistics per interface."],
      ["`show interfaces status` in user EXEC", "`show interfaces status` is a Layer 2 switch command and is not supported on standard Cisco router interfaces."]
    ],
    "`show ip interface brief` shows one line per interface with the IPv4 address and line/protocol status, but it does not display the subnet mask. `show protocols [type number]` outputs just two lines per interface showing both the line/protocol status and `Internet address is X.X.X.X/P`.",
    "`show ip interface brief` = no mask shown; `show protocols` = concise output WITH `/P` mask.",
    ["show protocols", "show ip interface brief", "show interfaces"]
  ),

  c15.s("Router CLI", "Medium",
    "A point-to-point serial link connects Router R1 and Router R2. R1's Serial0/0/0 interface is configured with `encapsulation ppp`, while R2's Serial0/0/0 interface uses the default serial encapsulation (HDLC). What interface status will `show ip interface brief` display on R1?",
    "Status: up, Protocol: down — Layer 1 up, Layer 2 down",
    [
      ["Status: down, Protocol: down — Layer 1 and Layer 2 down", "Because the physical serial cable and clocking are working, Layer 1 line status is `up`, not `down`."],
      ["Status: administratively down, Protocol: down — port shut", "Neither router interface has the `shutdown` command applied, so line status is not `administratively down`."],
      ["Status: up, Protocol: up — both layers operational", "With mismatched Layer 2 encapsulations (PPP vs HDLC), data-link keepalives fail and protocol status goes `down`."]
    ],
    "When Layer 1 cabling and signaling are working properly, the first status code (line status) is `up`. However, when one router uses PPP and the other uses the default HDLC encapsulation on a serial link, Layer 2 fails and the second status code (protocol status) is `down`, resulting in `up/down`.",
    "up/down almost always points to a Layer 2 data-link configuration mismatch (such as PPP vs HDLC).",
    ["show ip interface brief", "show interfaces"]
  ),

  c15.m("Router CLI", "Medium",
    "Which two características typically distinguish a Small Office/Home Office (SOHO) router installation from an enterprise router installation?",
    ["SOHO routers usually integrate routing, LAN switching, wireless AP, and firewall into one unit", "SOHO routers typically use cable or DSL broadband Internet with VPNs for corporate WAN access"],
    [
      ["SOHO routers require dedicated external CSU/DSU hardware connected via V.35 serial WAN cables", "Leased-line CSU/DSU serial connections are characteristic of traditional enterprise WANs, not SOHO sites."],
      ["SOHO routers cannot use standard RJ-45 UTP Ethernet cables to connect to an external modem", "A SOHO router with an external cable or DSL modem connects its WAN port to the modem using a standard UTP Ethernet cable."],
      ["SOHO routers rely on dedicated Core and Distribution Layer 3 switches for inter-VLAN routing", "Dedicated multi-tier Layer 3 switches are used in large enterprise campuses, whereas SOHO uses an all-in-one appliance."]
    ],
    "A SOHO deployment typically consolidates the router, Ethernet switch, wireless access point, and security functions into one multifunction device and connects to corporate headquarters over consumer broadband Internet (cable/DSL/fiber) using VPN tunnels.",
    "SOHO = all-in-one device (router + switch + AP) + broadband Internet/VPN WAN.",
    []
  ),

  c15.s("Router CLI", "Hard",
    "Examine the `show ip interface brief` output from R1. Interface Gi0/0 is cabled to switch port Gi0/1 using a good straight-through UTP cable, and Gi0/0 on R1 has `no shutdown` configured. Which issue on the attached switch could cause the state shown for R1's Gi0/0?",
    "Switch port Gi0/1 is configured with `shutdown` or has a speed mismatch with Gi0/0",
    [
      ["Switch port Gi0/1 is assigned to the wrong access VLAN in the switch database", "An access VLAN mismatch does not bring down the physical layer link; Gi0/0 would still show `up/up`."],
      ["R1's Gi0/0 interface is missing an `ip address` command in its configuration", "In `show ip interface brief`, Gi0/0 already has `172.16.1.1` assigned, and even an unaddressed port can reach `up/up`."],
      ["The `shutdown` command is currently active under `interface GigabitEthernet0/0` on R1", "If `shutdown` were configured on R1's Gi0/0, the Status column would read `administratively down`, not `down`."]
    ],
    "R1's Gi0/0 shows `down` (line status) and `down` (protocol status). Because Status is `down` rather than `administratively down`, R1's Gi0/0 has `no shutdown` configured, pointing to a Layer 1 physical problem—such as a bad/missing cable, the neighboring switch being powered off, the switch port being `shutdown`, or a speed mismatch between the ends.",
    "down/down on Ethernet = check cable, neighbor power, neighbor `shutdown`, or speed mismatch.",
    ["show ip interface brief"],
    {
      cli: "R1# show ip interface brief\nInterface              IP-Address      OK? Method Status                Protocol\nGigabitEthernet0/0     172.16.1.1      YES manual down                  down\nGigabitEthernet0/1     unassigned      YES unset  administratively down down\nSerial0/0/0            172.16.4.1      YES manual up                    up"
    }
  ),

  c15.s("Router CLI", "Hard",
    "Examine the output of `show interfaces gigabitethernet 0/1/0` on router R1. Which statement accurately describes this interface's configuration and hardware?",
    "It is a 1-Gbps RJ-45 copper port with active MAC 0201.a010.0001 and a `/24` IP address",
    [
      ["It is currently using its burned-in MAC address `30f7.0d29.8570` as its active source MAC", "The active MAC address is `0201.a010.0001`, which overrides the burned-in address (`bia 30f7.0d29.8570`)."],
      ["It is operating over a fiber-optic SFP transceiver module at 100 Mbps and full duplex", "The output explicitly states `Full Duplex, 1Gbps, media type is RJ45`, indicating copper UTP at 1 Gbps."],
      ["It is operating as a Layer 2 switch port since its frame encapsulation is `ARPA`", "`Encapsulation ARPA` is the standard Cisco IOS Ethernet frame encapsulation on router interfaces."]
    ],
    "In `show interfaces`, `address is 0201.a010.0001 (bia 30f7.0d29.8570)` shows the active MAC address first and the factory burned-in address in parentheses. `Internet address is 172.16.5.1/24` confirms the IPv4 address and mask, and `Full Duplex, 1Gbps, media type is RJ45` confirms 1-Gbps copper operation.",
    "In `show interfaces`, `address is X (bia Y)` means X is currently in use and Y is the factory burned-in MAC.",
    ["show interfaces"],
    {
      cli: "R1# show interfaces gigabitEthernet 0/1/0\nGigabitEthernet0/1/0 is up, line protocol is up\n  Hardware is EHWIC-1GE-SFP-CU, address is 0201.a010.0001 (bia 30f7.0d29.8570)\n  Description: Link in lab to R3's G0/0/0\n  Internet address is 172.16.5.1/24\n  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,\n     reliability 255/255, txload 1/255, rxload 1/255\n  Encapsulation ARPA, loopback not set\n  Full Duplex, 1Gbps, media type is RJ45"
    }
  ),

  c15.s("Router CLI", "Hard",
    "An engineer connects to a router's console and configures `ip address 10.1.0.255 255.255.254.0` and `no shutdown` under `interface GigabitEthernet0/0`. How does Cisco IOS respond?",
    "IOS accepts the command without any error since 10.1.0.255 is a valid host address in 10.1.0.0/23",
    [
      ["IOS rejects the command with a `Bad mask /23 for address 10.1.0.255` error because .255 is a broadcast", "In subnet 10.1.0.0/23 (range 10.1.0.0 to 10.1.1.255), 10.1.1.255 is the broadcast address, while 10.1.0.255 is a valid host."],
      ["IOS accepts the command only if `ip subnet-zero` is explicitly disabled in global configuration mode", "`ip subnet-zero` is enabled by default and governs using the first subnet, not host addresses ending in .255."],
      ["IOS places the interface into an `up/down` state until the fourth octet is changed to `.254`", "Address validation happens when `ip address` is entered, and 10.1.0.255 is a normal host address in a /23 subnet."]
    ],
    "In subnet 10.1.0.0/23 (mask 255.255.254.0), the magic number in the third octet is 256 - 254 = 2, so the subnet spans from subnet ID 10.1.0.0 to broadcast address 10.1.1.255. All addresses from 10.1.0.1 through 10.1.1.254—including 10.1.0.255 and 10.1.1.0—are valid usable host IPv4 addresses.",
    "In a /23 subnet (magic = 2 in 3rd octet), `.0.255` and `.1.0` sit right in the middle of the usable host range!",
    ["ip address", "no shutdown"]
  ),

  c15.m("Router CLI", "Hard",
    "Which two CLI commands are valid on a Cisco Layer 2 Catalyst switch but are NOT supported on a standard Cisco IOS router?",
    ["show mac address-table", "show interfaces status"],
    [
      ["show ip interface brief", "`show ip interface brief` is supported on both Cisco routers and Cisco Catalyst switches."],
      ["show interfaces", "`show interfaces` is a standard EXEC command available on both Cisco routers and switches."],
      ["show running-config", "`show running-config` is used on all Cisco IOS routers and switches to view active configuration."]
    ],
    "Because a standard router routes Layer 3 packets rather than performing Layer 2 MAC bridging, it does not maintain a Layer 2 MAC switching table (`show mac address-table`) and does not support the switch-oriented one-line summary command `show interfaces status` (routers use `show ip interface brief` and `show protocols` instead).",
    "Switch-only show commands: `show mac address-table`, `show interfaces status`, `show vlan brief`.",
    ["show ip interface brief", "show protocols"]
  ),

  c15.d("Router CLI", "Medium",
    "Order the CLI steps to configure router R1's GigabitEthernet0/0 interface with IPv4 address 192.168.10.1/24, document the link, enable it, and return to privileged EXEC mode.",
    [
      "Enter global configuration mode using `configure terminal`",
      "Enter interface configuration mode using `interface gigabitethernet 0/0`",
      "Assign the IPv4 address and mask using `ip address 192.168.10.1 255.255.255.0`",
      "Add interface documentation using `description LAN link to SW1`",
      "Administratively enable the interface using `no shutdown`",
      "Return directly to privileged EXEC mode using `end` or Ctrl+Z"
    ],
    "To configure a router interface from privileged EXEC mode, enter global configuration mode (`configure terminal`), select the interface (`interface g0/0`), assign its IPv4 address/mask (`ip address ...`), optionally add a `description`, enable the port (`no shutdown`), and exit back to privileged EXEC (`end` or Ctrl+Z).",
    "Router ports default to `shutdown` and no IP address; always configure both `ip address` and `no shutdown`.",
    ["configure terminal", "interface gigabitethernet 0/0", "ip address", "description", "no shutdown", "end"]
  ),

  c15.t("Router CLI", "Easy",
    "Match each router interface verification command or status state to its accurate description.",
    [
      ["show ip interface brief", "Lists 1 line per interface with IPv4 address, method, and status codes, but omits the subnet mask"],
      ["show protocols", "Lists 1–2 lines per interface including line/protocol status and the IPv4 address with `/P` mask"],
      ["show interfaces", "Lists exhaustive Layer 1/Layer 2 statistics, MAC/BIA, MTU, bandwidth, and IPv4 address/mask"],
      ["Status: down, Protocol: down", "Interface is enabled (`no shutdown`), but Layer 1 physical connectivity has failed"]
    ],
    "`show ip interface brief` provides the most compact summary (without masks), `show protocols` adds the prefix mask in a compact view, `show interfaces` gives detailed counters and hardware addresses, and `down/down` indicates a physical layer failure on an enabled port.",
    "Need the mask quickly? Use `show protocols` or `show interfaces`, not `show ip interface brief`.",
    ["show ip interface brief", "show protocols", "show interfaces"]
  )
];

// ============================================================================
// v1c16: Configuring IPv4 Addresses and Static Routes
// Domain: "IP Connectivity", weight 25, topics: "Routing table", "Static routes", "IP routing"
// ============================================================================
const c16 = mk("IP Connectivity", 25, "v1c16");
const q16 = [
  c16.s("Routing table", "Easy",
    "When a router interface is in an `up/up` state and configured with `ip address 172.16.5.1 255.255.255.0`, which two routes does Cisco IOS automatically add to the IPv4 routing table?",
    "A connected route (`C`) for 172.16.5.0/24 and a local host route (`L`) for 172.16.5.1/32",
    [
      ["A connected route (`C`) for 172.16.5.1/24 and a static route (`S`) for 172.16.5.0/24", "Connected routes list the subnet ID (172.16.5.0/24), and the /32 route is a local (`L`) route, not static (`S`)."],
      ["A connected route (`C`) for 172.16.0.0/16 and a local route (`L`) for 172.16.5.255/32", "The connected route uses the configured /24 mask, and the local /32 route matches the interface IP (.1), not the broadcast."],
      ["A static default route (`S*`) for 0.0.0.0/0 and a connected route (`C`) for 172.16.5.0/24", "Assigning an interface IP address never creates a default route `0.0.0.0/0`."]
    ],
    "In modern Cisco IOS, enabling an interface with an IPv4 address and mask automatically inserts two routing table entries: a connected (`C`) subnet route for the resident subnet (`172.16.5.0/24`) and a local (`L`) `/32` host route matching the interface's exact IPv4 address (`172.16.5.1/32`).",
    "One up/up IPv4 interface = two routing table lines: `C` (subnet `/P`) and `L` (interface IP `/32`).",
    ["show ip route", "ip address"]
  ),

  c16.s("Static routes", "Easy",
    "Which global configuration command creates an IPv4 static default route that forwards unmatched packets to next-hop router 10.1.12.2?",
    "ip route 0.0.0.0 0.0.0.0 10.1.12.2",
    [
      ["ip route 0.0.0.0 /0 10.1.12.2", "The `ip route` command in IOS requires a dotted-decimal mask (`0.0.0.0`), not slash prefix notation (`/0`)."],
      ["ip default-gateway 10.1.12.2", "`ip default-gateway` is used on Layer 2 switches (or when IP routing is disabled), not to add a static route on a router."],
      ["ip route 255.255.255.255 255.255.255.255 10.1.12.2", "255.255.255.255/32 matches only the limited broadcast address, whereas 0.0.0.0 0.0.0.0 matches all IPv4 destinations."]
    ],
    "A static default route uses subnet ID `0.0.0.0` and mask `0.0.0.0` in the `ip route` global configuration command (`ip route 0.0.0.0 0.0.0.0 {next-hop-ip | exit-interface}`), appearing in `show ip route` as `S* 0.0.0.0/0` and setting the Gateway of Last Resort.",
    "IPv4 default route syntax: `ip route 0.0.0.0 0.0.0.0 <next-hop or exit-if>`.",
    ["ip route 0.0.0.0 0.0.0.0", "show ip route"]
  ),

  c16.s("Routing table", "Easy",
    "What is the default administrative distance (AD) of a static route compared to an OSPF-learned route on a Cisco router?",
    "Static route AD is 1; OSPF route AD is 110",
    [
      ["Static route AD is 0; OSPF route AD is 90", "An AD of 0 belongs to connected routes, and 90 is the default AD for internal EIGRP, not OSPF."],
      ["Static route AD is 110; OSPF route AD is 1", "Lower AD is preferred; static routes have AD 1 (more trustworthy than OSPF's AD 110)."],
      ["Static route AD is 5; OSPF route AD is 120", "120 is the default AD for RIP, whereas OSPF is 110 and static routes default to 1."]
    ],
    "Administrative distance measures the trustworthiness of a routing source (lower is better). By default, connected routes have AD 0, static routes have AD 1, EIGRP internal routes have AD 90, OSPF routes have AD 110, and RIP routes have AD 120.",
    "Key AD values: Connected = 0, Static = 1, EIGRP = 90, OSPF = 110, RIP = 120 (lower wins).",
    ["show ip route"]
  ),

  c16.s("IP routing", "Easy",
    "What is the default timeout (aging timer) for dynamically learned entries in a Cisco router's IPv4 ARP table, and how does an administrator clear dynamic entries manually?",
    "240 minutes (4 hours) by default; cleared using `clear ip arp`",
    [
      ["5 minutes (300 sec); cleared via `clear mac address-table dynamic`", "300 seconds (5 minutes) is the default aging time for a switch's MAC address table, not the router's ARP cache."],
      ["60 minutes (1 hour) by default; cleared using `reset arp cache`", "`reset arp cache` is not a valid Cisco IOS command, and the default IOS ARP timeout is 240 minutes."],
      ["Never ages out while interface is up; cleared via `no ip arp`", "Only the router's own local interface ARP entry (marked `-`) never times out; dynamic entries age out after 240 minutes."]
    ],
    "In Cisco IOS, dynamically learned IPv4 ARP cache entries time out after 240 minutes (4 hours) of inactivity (the timer resets to 0 whenever the entry is used). An engineer can remove all dynamic ARP entries or a specific host's entry using `clear ip arp [ip-address]`.",
    "Cisco IOS ARP timeout = 4 hours (240 min); switch MAC table timeout = 5 min (300 sec).",
    ["show ip arp", "clear ip arp"]
  ),

  c16.s("IP routing", "Medium",
    "When a router forwards an IPv4 packet to a destination host across multiple hops, what happens to the source/destination IPv4 addresses and source/destination MAC addresses at each router hop?",
    "Source and destination MAC addresses change at every router hop, while both IPv4 addresses remain unchanged",
    [
      ["Both the Layer 2 MAC addresses and the Layer 3 IPv4 addresses are rewritten at every single router hop", "Normal IP routing never rewrites the source or destination IPv4 addresses (unless NAT is configured)."],
      ["The source and destination IPv4 addresses change to the next-hop router at each hop, while MAC addresses stay constant", "IPv4 addresses identify the end-to-end sender and receiver; data-link MAC addresses identify the local hop endpoints."],
      ["The destination MAC address changes at each hop, but the source MAC address remains the original sending host's MAC", "Each router puts its own outgoing interface's MAC address as the new source MAC when encapsulating the frame."]
    ],
    "At each router hop, the router strips and discards the incoming data-link header and trailer, inspects the unchanged destination IPv4 address against the routing table, and encapsulates the packet into a brand-new data-link frame with the outgoing interface's MAC as source and the next-hop device's MAC as destination.",
    "End-to-end IPv4 addresses stay the same; hop-by-hop Layer 2 frames (and MACs) are replaced at every router.",
    []
  ),

  c16.s("Static routes", "Medium",
    "An engineer wants to configure a floating static route on R1 to subnet 172.16.20.0/24 via next-hop 10.1.1.2 that serves only as a backup when the primary OSPF route disappears. Which command accomplishes this?",
    "ip route 172.16.20.0 255.255.255.0 10.1.1.2 130",
    [
      ["ip route 172.16.20.0 255.255.255.0 10.1.1.2 100", "An administrative distance of 100 is lower than OSPF's default AD of 110, so the static route would preempt OSPF."],
      ["ip route 172.16.20.0 255.255.255.0 10.1.1.2 permanent", "The `permanent` keyword keeps a static route in the routing table even when the interface fails, with default AD 1."],
      ["ip route 172.16.20.0 255.255.255.0 10.1.1.2 metric 130", "The `ip route` command takes the administrative distance value directly without a `metric` keyword."]
    ],
    "A floating static route must have an administrative distance higher than the dynamic routing protocol it backs up. Because OSPF has a default AD of 110, appending `130` (or any value from 111 to 254) to `ip route 172.16.20.0 255.255.255.0 10.1.1.2 130` causes R1 to install the static route only if the OSPF route is lost.",
    "Floating static route backing up OSPF (AD 110) must use an AD > 110 (e.g., 130).",
    ["ip route", "show ip route"]
  ),

  c16.s("Static routes", "Medium",
    "Which command configures a static host route on R1 that directs traffic for the single server at 10.10.50.99 to next-hop router 172.16.4.2?",
    "ip route 10.10.50.99 255.255.255.255 172.16.4.2",
    [
      ["ip route 10.10.50.99 255.255.255.0 172.16.4.2", "IOS rejects `10.10.50.99 255.255.255.0` with `%Inconsistent address and mask` because host bits are non-zero."],
      ["ip route 10.10.50.99 0.0.0.0 172.16.4.2", "A mask of `0.0.0.0` has zero prefix bits and is only valid with destination `0.0.0.0` for a default route."],
      ["ip host-route 10.10.50.99 255.255.255.255 172.16.4.2", "`ip host-route` is not a valid Cisco IOS command; all IPv4 static routes use `ip route`."]
    ],
    "A static host route targets a single IPv4 address by specifying a `/32` subnet mask (`255.255.255.255`) in the `ip route` command: `ip route 10.10.50.99 255.255.255.255 172.16.4.2`. Because `/32` is the longest possible IPv4 prefix length, packets to 10.10.50.99 will prefer this route over any overlapping `/24` or `/16` route.",
    "Host route = `255.255.255.255` (/32); Default route = `0.0.0.0 0.0.0.0` (/0).",
    ["ip route"]
  ),

  c16.s("Routing table", "Medium",
    "Examine the routing table entry `O 10.2.2.0/30 [110/128] via 10.2.2.5, 14:31:52, Serial0/0/1`. What do the numbers `110`, `128`, and `10.2.2.5` represent?",
    "110 is the administrative distance, 128 is the OSPF metric, and 10.2.2.5 is the next-hop router IPv4 address",
    [
      ["110 is the OSPF process ID, 128 is the administrative distance, and 10.2.2.5 is the local router interface IP", "Inside `[110/128]`, the first number is always administrative distance and the second is the routing protocol metric."],
      ["110 is the metric, 128 is the administrative distance, and 10.2.2.5 is the destination host address", "Administrative distance comes first (`110`), metric comes second (`128`), and `via 10.2.2.5` is the next-hop router."],
      ["110 is the VLAN ID, 128 is the subnet magic number, and 10.2.2.5 is the OSPF Designated Router", "Neither VLAN ID nor magic number appears in `[x/y]`; `[x/y]` is always `[Administrative Distance / Metric]`."]
    ],
    "In `show ip route`, `[110/128]` lists the administrative distance first (`110`, default for OSPF) and the route metric second (`128`, the OSPF cost to reach the subnet). The address following `via` (`10.2.2.5`) is the next-hop router's IPv4 address, followed by the route age timer and outgoing interface.",
    "In `[AD/Metric]`, alphabetical order applies: **A**dministrative Distance first, **M**etric second.",
    ["show ip route"]
  ),

  c16.s("Routing table", "Hard",
    "Examine the partial `show ip route` output on R1. Out which interface will R1 forward a packet destined for IPv4 address 10.1.15.105?",
    "GigabitEthernet0/3/0",
    [
      ["GigabitEthernet0/0/0", "10.1.15.100/32 matches only the single address 10.1.15.100, and 0.0.0.0/0 has the shortest prefix length (/0)."],
      ["GigabitEthernet0/1/0", "10.1.15.64/26 (range .64 to .127) matches 10.1.15.105, but its /26 prefix is shorter than /27 on Gi0/3/0."],
      ["GigabitEthernet0/2/0", "10.1.14.0/23 (range 10.1.14.0 to 10.1.15.255) matches 10.1.15.105, but its /23 prefix is shorter than /26 and /27."]
    ],
    "When multiple routes in the routing table match a destination IPv4 address, the router selects the route with the longest prefix length (`/P`). For destination 10.1.15.105: `10.1.15.100/32` does not match; `10.1.15.96/27` (range 10.1.15.96 to 10.1.15.127) matches with `/27`; `10.1.15.64/26` (range .64 to .127) matches with `/26`; `10.1.14.0/23` (range 10.1.14.0 to 10.1.15.255) matches with `/23`; and `0.0.0.0/0` matches with `/0`. The longest matching prefix is `/27` via GigabitEthernet0/3/0.",
    "First check which routes actually contain the destination IP, then pick the matching route with the largest `/P`.",
    ["show ip route"],
    {
      cli: "R1# show ip route\n10.0.0.0/8 is variably subnetted, 5 subnets, 5 masks\nO        10.1.15.100/32 [110/50] via 172.16.25.2, 00:00:04, GigabitEthernet0/0/0\nO        10.1.15.64/26 [110/100] via 172.16.25.129, 00:00:09, GigabitEthernet0/1/0\nO        10.1.14.0/23 [110/65] via 172.16.25.2, 00:00:04, GigabitEthernet0/2/0\nO        10.1.15.96/27 [110/65] via 172.16.24.129, 00:00:09, GigabitEthernet0/3/0\nO*E2     0.0.0.0/0 [110/1] via 172.16.25.2, 00:00:09, GigabitEthernet0/0/0"
    }
  ),

  c16.s("Routing table", "Hard",
    "Using the same routing table on R1, out which interface will R1 forward a packet destined for IPv4 address 10.1.14.200?",
    "GigabitEthernet0/2/0",
    [
      ["GigabitEthernet0/3/0", "10.1.15.96/27 only covers 10.1.15.96 through 10.1.15.127 and does not match 10.1.14.200."],
      ["GigabitEthernet0/1/0", "10.1.15.64/26 only covers 10.1.15.64 through 10.1.15.127 and does not match 10.1.14.200."],
      ["GigabitEthernet0/0/0", "Although 0.0.0.0/0 on Gi0/0/0 matches 10.1.14.200, 10.1.14.0/23 on Gi0/2/0 has a longer prefix (/23 vs /0)."]
    ],
    "For destination 10.1.14.200, none of the `10.1.15.x` routes match because their third octet is 15. However, `10.1.14.0/23` (mask 255.255.254.0, magic number 2 in the third octet) covers `10.1.14.0` through `10.1.15.255`, so it matches `10.1.14.200`! Between `10.1.14.0/23` and `0.0.0.0/0`, `/23` is the longest match, forwarding out GigabitEthernet0/2/0.",
    "Watch out for /23, /22, and /21 routes that span multiple values in the third octet!",
    ["show ip route"],
    {
      cli: "R1# show ip route\n10.0.0.0/8 is variably subnetted, 5 subnets, 5 masks\nO        10.1.15.100/32 [110/50] via 172.16.25.2, 00:00:04, GigabitEthernet0/0/0\nO        10.1.15.64/26 [110/100] via 172.16.25.129, 00:00:09, GigabitEthernet0/1/0\nO        10.1.14.0/23 [110/65] via 172.16.25.2, 00:00:04, GigabitEthernet0/2/0\nO        10.1.15.96/27 [110/65] via 172.16.24.129, 00:00:09, GigabitEthernet0/3/0\nO*E2     0.0.0.0/0 [110/1] via 172.16.25.2, 00:00:09, GigabitEthernet0/0/0"
    }
  ),

  c16.m("Static routes", "Hard",
    "An engineer configures `ip route 192.168.50.0 255.255.255.0 10.1.4.2` on R1, and the command is accepted without syntax errors, but `show ip route` does NOT list any route to 192.168.50.0/24. Which two conditions could explain why the static route is missing from the routing table?",
    ["R1 currently has no active route in its routing table that reaches the next-hop address 10.1.4.2", "The local interface on R1 that connects to subnet 10.1.4.0/24 is currently in a down/down or administratively down state"],
    [
      ["The destination host 192.168.50.10 is powered off and not responding to R1's ARP requests", "Routers do not ARP for remote destinations or verify whether remote hosts are powered on before installing a static route."],
      ["R1 is missing the `permanent` keyword, which is mandatory for all next-hop static routes in IOS", "The `permanent` keyword is optional; normal static routes install automatically whenever the next-hop IP is reachable."],
      ["OSPF is not enabled on R1, and static routes require an active dynamic routing protocol process", "Static routes operate independently of dynamic routing protocols like OSPF."]
    ],
    "Before Cisco IOS installs a static route that specifies a next-hop IPv4 address (without the `permanent` keyword), the router verifies that it has a valid route to reach that next-hop IP address. If the local interface connected to the next-hop subnet is down (removing the connected route to `10.1.4.0/24`), or if the next-hop address was mistyped into an unreachable subnet, IOS withholds the static route from the routing table.",
    "A next-hop static route only appears in `show ip route` if the router has an active route to the next-hop IP!",
    ["ip route", "show ip route"]
  ),

  c16.s("Static routes", "Hard",
    "Router R1 connects to Router R2 over an Ethernet WAN link (`172.16.5.0/24`, where R1 is `.1` and R2 is `.2`). When configuring a static route on R1 for a remote subnet behind R2, why is `ip route 172.16.3.0 255.255.255.0 172.16.5.2` recommended over `ip route 172.16.3.0 255.255.255.0 GigabitEthernet0/1`?",
    "On multi-access Ethernet links, the next-hop IP identifies the exact neighboring router for ARP requests",
    [
      ["Cisco IOS syntax forbids specifying an Ethernet outgoing interface in an `ip route` command", "IOS syntax permits specifying an Ethernet interface, though it is bad practice because it relies on proxy ARP."],
      ["Specifying the outgoing Ethernet interface sets the administrative distance to 255, disabling the route", "Both outgoing-interface and next-hop static routes have the same default administrative distance of 1."],
      ["Specifying the next-hop IP keeps the static route in the routing table even if GigabitEthernet0/1 goes down", "Without the `permanent` keyword, the next-hop route is also removed if GigabitEthernet0/1 goes down."]
    ],
    "Unlike a point-to-point serial link (where only one other device can exist on the wire), an Ethernet LAN or WAN link can connect many devices in the same subnet. Specifying the next-hop router's IPv4 address (`172.16.5.2`) tells R1 exactly which neighbor IP address to resolve via ARP when encapsulating Ethernet frames.",
    "On Ethernet links, always configure static routes using the next-hop IPv4 address (or both exit-if and next-hop IP).",
    ["ip route"]
  ),

  c16.d("IP routing", "Medium",
    "Order the five internal steps a Cisco router performs when routing an incoming IPv4 packet from one interface to another.",
    [
      "Verify the incoming frame has no FCS errors and has the router's MAC (or broadcast/multicast) as destination",
      "De-encapsulate the IPv4 packet by stripping and discarding the incoming data-link header and trailer",
      "Compare the packet's destination IPv4 address to the routing table and select the longest prefix match",
      "Encapsulate the IPv4 packet into a new data-link header and trailer (using ARP if exiting an Ethernet interface)",
      "Transmit the newly encapsulated frame out the matched outgoing interface"
    ],
    "Every router follows a five-step forwarding pipeline: (1) check the incoming frame's FCS and destination Layer 2 address, (2) strip the old Layer 2 header/trailer, (3) match the destination IPv4 address to the routing table (longest match), (4) build a new Layer 2 header/trailer (using ARP on LANs), and (5) transmit the frame out the outgoing interface.",
    "Check FCS/MAC -> Strip L2 -> Route Lookup (Longest Match) -> Add new L2 (ARP) -> Transmit.",
    []
  ),

  c16.t("Routing table", "Easy",
    "Match each `show ip route` legend code to the type of route it represents.",
    [
      ["C", "Connected subnet route created automatically from an up/up interface's `ip address` mask"],
      ["L", "Local `/32` host route created automatically for the router interface's own IPv4 address"],
      ["S", "Static route configured manually by an administrator using the `ip route` command"],
      ["S*", "Static candidate default route (`0.0.0.0/0`) eligible to serve as Gateway of Last Resort"],
      ["O", "Dynamic route learned via the Open Shortest Path First (OSPF) routing protocol"]
    ],
    "In `show ip route`, `C` identifies a directly connected subnet, `L` identifies the local router interface `/32` address, `S` identifies a static route, `S*` marks a static candidate default route, and `O` marks an OSPF route.",
    "Route codes: C = Connected (/P), L = Local (/32), S = Static, * = candidate default, O = OSPF.",
    ["show ip route"]
  )
];

// ============================================================================
// v1c17: IP Routing in the LAN
// Domain: "IP Connectivity", weight 25, topic: "IP routing"
// ============================================================================
const c17 = mk("IP Connectivity", 25, "v1c17");
const q17 = [
  c17.s("IP routing", "Easy",
    "What is the purpose of configuring Router-on-a-Stick (ROAS) on a Cisco router connected to a Layer 2 switch?",
    "To route packets between multiple VLANs over one physical 802.1Q trunk using router subinterfaces",
    [
      ["To bundle multiple physical router Ethernet ports into a single high-bandwidth Layer 3 EtherChannel", "Bundling physical links is EtherChannel, whereas ROAS subdivides one physical link into logical VLAN subinterfaces."],
      ["To enable a Layer 2 switch to route packets internally using Switched Virtual Interfaces (SVIs)", "SVIs run inside a Layer 3 multilayer switch, whereas ROAS uses an external router connected via an 802.1Q trunk."],
      ["To allow two routers to share a single virtual default gateway IPv4 address for host redundancy", "Sharing a virtual default gateway IP is First Hop Redundancy Protocol (FHRP/HSRP), not ROAS."]
    ],
    "Router-on-a-Stick (ROAS) uses a single physical Ethernet connection configured as an 802.1Q VLAN trunk between a Layer 2 switch and a router. By creating one virtual subinterface per VLAN on the router, the router has an IPv4 address and connected route in each VLAN's subnet and can route packets between them.",
    "ROAS = 1 physical trunk link + multiple logical subinterfaces (`G0/0.x`) with `encapsulation dot1q`.",
    ["interface gigabitethernet 0/0.10", "encapsulation dot1q 10"]
  ),

  c17.s("IP routing", "Easy",
    "Which subinterface command must be configured on a Cisco router before IOS will allow an `ip address` command on that subinterface?",
    "encapsulation dot1q vlan-id",
    [
      ["switchport mode trunk", "`switchport mode trunk` is a Layer 2 switch command and is invalid on a router Ethernet subinterface."],
      ["switchport trunk encapsulation dot1q", "`switchport trunk encapsulation dot1q` is used on older multilayer switches, not on router subinterfaces."],
      ["no switchport", "Router subinterfaces are already Layer 3 routed interfaces and do not use the `no switchport` command."]
    ],
    "On a Cisco router subinterface (such as `interface GigabitEthernet0/0.10`), IOS will not accept an `ip address` command until the subinterface is associated with a specific 802.1Q VLAN ID using `encapsulation dot1q <vlan-id> [native]`.",
    "On a router subinterface, configure `encapsulation dot1q <vlan-id>` BEFORE `ip address`!",
    ["encapsulation dot1q", "ip address"]
  ),

  c17.s("IP routing", "Easy",
    "Which interface subcommand converts a physical port on a Cisco Layer 3 switch from a Layer 2 switch port into a Layer 3 routed port?",
    "Configure `no switchport` on the port",
    [
      ["Configure `ip routing` on the port", "`ip routing` is a global configuration command that enables IPv4 routing on the switch as a whole."],
      ["Configure `switchport mode routed`", "There is no `routed` keyword under `switchport mode`; `no switchport` disables Layer 2 switching on the port."],
      ["Configure `encapsulation dot1q native`", "`encapsulation dot1q` is used for 802.1Q trunking on router subinterfaces, not Layer 3 switch routed ports."]
    ],
    "By default, physical ports on a Cisco Catalyst Layer 3 switch operate as Layer 2 switch ports (`switchport`). Issuing `no switchport` in interface configuration mode disables Layer 2 switching on that port and turns it into a Layer 3 routed interface where `ip address` can be configured directly.",
    "`no switchport` turns a Layer 3 switch physical port (or PortChannel) into a router-like Layer 3 port.",
    ["no switchport", "show interfaces status", "show interfaces switchport"]
  ),

  c17.s("IP routing", "Easy",
    "When a physical interface on a Layer 3 switch is configured as a routed port using `no switchport`, what appears in the `Vlan` column of `show interfaces status` for that port?",
    "routed",
    [
      ["trunk", "`trunk` appears only when a port operates as a Layer 2 VLAN trunk (`switchport mode trunk`)."],
      ["vlan 1", "Once `no switchport` is applied, the port is removed from all VLANs and no longer shows `1`."],
      ["unassigned", "`unassigned` appears in the `IP-Address` column of `show ip interface brief`, not the `Vlan` column of `show interfaces status`."]
    ],
    "In `show interfaces status` on a Layer 3 switch, the `Vlan` column displays the access VLAN ID for access ports, `trunk` for Layer 2 trunk ports, and `routed` for physical ports or PortChannels configured with `no switchport`.",
    "`show interfaces status` Vlan column: VLAN number = access port, `trunk` = L2 trunk, `routed` = L3 routed port.",
    ["show interfaces status", "no switchport"]
  ),

  c17.m("IP routing", "Medium",
    "In a Router-on-a-Stick (ROAS) design where VLAN 99 is the 802.1Q native VLAN on the trunk, which two configuration methods on the router validly enable routing for the subnet on native VLAN 99?",
    ["Configure `ip address` directly on the physical interface (with no `encapsulation` command on the physical interface)", "Configure a subinterface with `encapsulation dot1q 99 native` and `ip address` on that subinterface"],
    [
      ["Configure a subinterface with `encapsulation dot1q 99` (without `native`) while the switch uses native VLAN 99", "Omitting `native` makes the router tag frames for VLAN 99 while the switch sends them untagged, breaking communication."],
      ["Configure `switchport trunk native vlan 99` under the router's physical GigabitEthernet interface", "`switchport trunk native vlan` is a Layer 2 switch command and does not exist on router interfaces."],
      ["Configure `ip address` on both the physical interface and subinterface `.99` simultaneously", "IOS does not allow the same subnet to be configured on both the physical interface and a subinterface."]
    ],
    "A router supports untagged frames of the 802.1Q native VLAN in two ways: either by configuring `ip address` directly on the physical interface (without any `encapsulation` command), or by creating a subinterface configured with `encapsulation dot1q <vlan-id> native` and placing the `ip address` on that subinterface.",
    "ROAS native VLAN: either `ip address` on the physical interface OR `encapsulation dot1q <id> native` on a subinterface.",
    ["encapsulation dot1q", "ip address", "show vlans"]
  ),

  c17.s("IP routing", "Medium",
    "Router R1 has subinterfaces `Gi0/0.10` (configured with `no shutdown`) and `Gi0/0.20` (configured with `shutdown`). If an administrator enters `interface Gi0/0` and issues `shutdown`, and then later issues `no shutdown` on `Gi0/0`, what happens to the states of the two subinterfaces?",
    "While Gi0/0 is shut down both are administratively down; when Gi0/0 is re-enabled, Gi0/0.10 goes up/up and Gi0/0.20 stays down",
    [
      ["Issuing `no shutdown` on physical interface Gi0/0 automatically enables both virtual subinterfaces Gi0/0.10 and Gi0/0.20 to up/up", "A subinterface that was explicitly shut down (`Gi0/0.20`) remains administratively down until `no shutdown` is run on that subinterface."],
      ["Shutting down physical interface Gi0/0 has no effect on virtual subinterfaces Gi0/0.10 and Gi0/0.20", "A subinterface state can never be better than its parent physical interface state."],
      ["While Gi0/0 is shut down, Gi0/0.10 stays up/up because subinterfaces are purely logical software constructs", "When the parent physical port is shut down or unplugged, all of its subinterfaces immediately go down."]
    ],
    "The operational state of an ROAS subinterface cannot exceed the state of its parent physical interface, but each subinterface can also be independently shut down. When `Gi0/0` is shut down, both subinterfaces become `administratively down/down`. When `Gi0/0` is re-enabled with `no shutdown`, `Gi0/0.10` returns to `up/up`, while `Gi0/0.20` remains `administratively down/down` because of its own `shutdown` command.",
    "Subinterface state <= Parent physical interface state, and subinterfaces can be shut down individually.",
    ["shutdown", "no shutdown", "show ip interface brief"]
  ),

  c17.s("IP routing", "Medium",
    "On a Cisco Catalyst switch such as a 2960-XR that is currently operating in Layer 2 mode (`show ip route` returns `% Invalid input detected`), what must an administrator do to enable inter-VLAN routing with SVIs?",
    "Configure `sdm prefer lanbase-routing`, reload the switch, and then configure `ip routing`",
    [
      ["Configure `ip routing` in global configuration mode without reloading the switch or changing the SDM template", "Until the SDM template is changed and the switch is reloaded, the `ip routing` command is rejected by IOS."],
      ["Configure `no switchport` on `interface vlan 1` and assign an IPv4 default gateway", "SVIs (`interface vlan x`) never use `no switchport`, and `ip default-gateway` is only for Layer 2 management."],
      ["Configure `encapsulation dot1q` under each `interface vlan x` SVI to activate Layer 3 switching", "SVIs do not use `encapsulation dot1q`; they automatically associate with the matching internal VLAN ID."]
    ],
    "On many Catalyst access/multilayer switches, the default Switch Database Management (SDM) template allocates zero ASIC memory for IPv4 routes. You must first change the template (e.g., `sdm prefer lanbase-routing`), `reload` the switch so the new ASIC table sizes take effect, and then issue the global `ip routing` command before configuring SVIs.",
    "Enabling L3 switching: `sdm prefer ...` -> `reload` -> `ip routing` -> `interface vlan <id>`.",
    ["sdm prefer lanbase-routing", "reload", "ip routing", "interface vlan"]
  ),

  c17.s("IP routing", "Medium",
    "When configuring a Layer 3 EtherChannel between two multilayer switches using PortChannel 12, where must the `no switchport` and `ip address` commands be placed?",
    "Put `no switchport` on both the physical ports and `port-channel 12`, and put `ip address` on `port-channel 12` only",
    [
      ["Configure both `no switchport` and `ip address` on every physical member port in the EtherChannel bundle", "Physical member ports in a Layer 3 EtherChannel have `no ip address`; the IPv4 address belongs only on the PortChannel interface."],
      ["Configure `switchport mode trunk` on the physical ports and `no switchport` with `ip address` on `interface port-channel 12`", "If the physical ports are Layer 2 switchports while the PortChannel is Layer 3 (`no switchport`), IOS will refuse to bundle them."],
      ["Configure `no switchport` on the physical ports and assign the IPv4 address to SVI `interface vlan 12`", "A Layer 3 EtherChannel is a routed interface (`Port-channel12`), not an SVI (`Vlan12`)."]
    ],
    "For a Layer 3 EtherChannel, all physical member interfaces and the `port-channel` interface itself must be configured as routed ports with `no switchport`. The `ip address` command is configured exclusively on the logical `interface port-channel <number>`, while the physical member interfaces have `no ip address`.",
    "L3 EtherChannel: `no switchport` on physical ports AND PortChannel; `ip address` ONLY on PortChannel.",
    ["no switchport", "interface port-channel", "channel-group", "ip address"]
  ),

  c17.s("IP routing", "Hard",
    "A Layer 3 switch has `ip routing` enabled and `interface Vlan20` configured with `ip address 10.1.20.1 255.255.255.0` and `no shutdown`. However, `show ip interface brief` shows `Vlan20` as `up / down`, and `10.1.20.0/24` is missing from `show ip route`. Which condition would cause this exact state?",
    "VLAN 20 has no `up/up` ports in STP forwarding state, or VLAN 20 itself was deleted or shut down",
    [
      ["Someone issued the `shutdown` command directly under `interface Vlan20` configuration mode on the Layer 3 switch", "If `shutdown` were configured under `interface Vlan20`, the state would be `administratively down / down`, not `up / down`."],
      ["The `ip routing` global command was accidentally removed from the switch configuration", "Disabling `ip routing` clears the routing table, but it does not bring the SVI line protocol state down to `up / down`."],
      ["A host in VLAN 20 was configured with a wrong default gateway IPv4 address", "A host's default gateway setting has no effect on the Layer 3 switch's SVI line protocol state."]
    ],
    "For an SVI (`interface Vlan20`) to reach `up/up`, four requirements must be met: (1) VLAN 20 must exist in the switch's VLAN database, (2) VLAN 20 itself must not be shut down, (3) `interface Vlan20` must not be shut down (`no shutdown`), and (4) at least one physical access port or trunk port carrying VLAN 20 must be `up/up` and in the STP forwarding state. If `interface Vlan20` is enabled (`no shutdown`) but VLAN 20 is deleted, shut down, or has zero active forwarding ports, `Vlan20` becomes `up/down`.",
    "SVI `administratively down/down` = SVI itself is `shutdown`; SVI `up/down` = VLAN missing, VLAN shut down, or 0 active ports in VLAN.",
    ["show ip interface brief", "show vlan brief", "interface vlan"]
  ),

  c17.s("IP routing", "Hard",
    "Router R1 is configured for ROAS with `Gi0/0.10` (`encapsulation dot1q 10`, `10.1.10.1/24`) and `Gi0/0.20` (`encapsulation dot1q 20`, `10.1.20.1/24`), connected to switch SW1's Gi0/1 port. On R1, `Gi0/0`, `Gi0/0.10`, and `Gi0/0.20` are all `up/up` and both connected routes appear in `show ip route`, yet hosts in VLAN 10 cannot ping `10.1.10.1`. Why did R1's verification outputs look completely healthy despite a misconfiguration on SW1?",
    "Routers do not run DTP or VTP on ROAS trunks, so R1's subinterfaces go up/up whenever physical port Gi0/0 is up/up",
    [
      ["Router R1 automatically creates VLANs 10 and 20 on switch SW1 using VTP server advertisements over the 802.1Q trunk", "Cisco routers do not participate in VTP or create VLANs on attached switches."],
      ["SW1 automatically converts Gi0/1 into a trunk whenever it receives an 802.1Q tag from R1", "Receiving an 802.1Q tagged frame does not trigger Dynamic Trunking Protocol (DTP) negotiation on a switch port."],
      ["The `show vlans` command on R1 polls SW1's VLAN database to verify allowed VLANs on the trunk", "`show vlans` on a router only displays the router's own local subinterface configuration and packet counters."]
    ],
    "Because Cisco routers do not run DTP or VTP on ROAS links, the router has no way to detect whether the neighboring switch port is actually configured as a trunk (`switchport mode trunk`), whether the native VLAN matches, or whether the VLANs exist and are allowed on the switch. As long as physical link `Gi0/0` is `up/up`, R1's subinterfaces show `up/up` and install connected routes.",
    "On ROAS, `up/up` subinterfaces and connected routes on the router do NOT prove the switch trunk is configured properly!",
    ["show vlans", "show interfaces trunk"]
  ),

  c17.m("IP routing", "Hard",
    "On multilayer switch SW1, `interface Port-channel12` (`no switchport`, `ip address 10.1.12.1 255.255.255.0`) has member ports `Gi1/0/13` and `Gi1/0/14`. Output of `show etherchannel 12 summary` lists `Po12(RU)` with `Gi1/0/13(P)` but `Gi1/0/14` is not bundled. Which two interface settings on `Gi1/0/14` could prevent IOS from bundling it into the Layer 3 EtherChannel?",
    ["Gi1/0/14 is still using the default `switchport` mode instead of `no switchport`", "Gi1/0/14 is configured with a different `speed` or `duplex` setting than Gi1/0/13"],
    [
      ["Gi1/0/14 is configured with a different interface `description` line than Gi1/0/13", "Interface descriptions are purely informational text and have no effect on EtherChannel bundling."],
      ["Gi1/0/14 is missing the `ip address 10.1.12.1 255.255.255.0` interface subcommand", "Member ports of a Layer 3 EtherChannel must NOT have an IP address; the IP address goes only on `Port-channel12`."],
      ["Gi1/0/14 is configured with a different `spanning-tree cost` value than Gi1/0/13", "Spanning Tree Protocol (STP) runs only on Layer 2 ports, not on Layer 3 routed ports (`no switchport`)."]
    ],
    "In `show etherchannel summary`, `Po12(RU)` indicates a Layer 3 (`R`) PortChannel that is in use (`U`), and `(P)` indicates a physical port bundled in the channel. For a physical port to join a Layer 3 EtherChannel, it must be configured with `no switchport` and must match the other member ports' `speed` and `duplex` settings.",
    "L3 EtherChannel consistency checks: `no switchport`, matching `speed`, and matching `duplex` (plus matching `channel-group` mode).",
    ["show etherchannel summary", "no switchport", "channel-group"]
  ),

  c17.s("IP routing", "Hard",
    "Examine the output of `show etherchannel 12 summary` on switch SW1: `12  Po12(RU)  -  Gi1/0/13(P) Gi1/0/14(P)`. What do the flags `RU` next to `Po12`, the `-` under `Protocol`, and the `P` next to the physical ports indicate?",
    "Po12 is a Layer 3 (`R`) channel in use (`U`), statically set (`-`), with both ports bundled (`P`)",
    [
      ["Po12 is a Layer 2 (`R`) channel waiting for LACP (`U`), with no links (`-`) and passive ports (`P`)", "`R` means Layer 3 (whereas `S` means Layer 2), `U` means in use, `-` means static `mode on`, and `P` means bundled."],
      ["Po12 is a routed (`R`) channel that is unusable (`U`) because no dynamic protocol (`-`) was negotiated", "`U` (uppercase) means 'in use' (working); lowercase `u` means 'unsuitable for bundling', and `-` is normal for `mode on`."],
      ["Po12 is running RIPv2 (`RU`) with default metric (`-`) over PAgP (`P`) on Gi1/0/13 and Gi1/0/14", "EtherChannel summary flags describe Layer 2/Layer 3 bundling states, not IP routing protocols like RIP."]
    ],
    "In `show etherchannel summary`, `R` stands for Layer 3 (routed, as opposed to `S` for Layer 2 switched), `U` stands for 'in use', `-` in the Protocol column means the channel was statically configured using `channel-group 12 mode on` (rather than LACP or PAgP), and `P` means the physical port is actively bundled in the port-channel.",
    "EtherChannel flags: `SU` = Layer 2 in use; `RU` = Layer 3 in use; `P` = bundled; `D` = down; `I` = stand-alone.",
    ["show etherchannel summary"]
  ),

  c17.d("IP routing", "Medium",
    "Order the steps to configure a static Layer 3 EtherChannel (PortChannel 10) on a multilayer switch using ports Gi1/0/1 and Gi1/0/2 with IPv4 address 10.10.10.1/30.",
    [
      "Enter interface configuration mode for the physical member ports (`interface range Gi1/0/1 - 2`)",
      "Convert the physical member ports into Layer 3 routed ports using `no switchport`",
      "Assign the physical member ports to channel group 10 statically using `channel-group 10 mode on`",
      "Enter PortChannel configuration mode using `interface port-channel 10`",
      "Ensure the PortChannel is a routed interface (`no switchport`) and assign `ip address 10.10.10.1 255.255.255.252`"
    ],
    "To build a Layer 3 EtherChannel, configure the physical member ports with `no switchport` and `channel-group <num> mode ...` (with no IP address on the physical ports), then enter `interface port-channel <num>`, ensure `no switchport` is present, and configure the `ip address` on the PortChannel interface.",
    "Configure `no switchport` and `channel-group` on physical ports first, then `no switchport` and `ip address` on `interface port-channel`.",
    ["interface port-channel", "no switchport", "channel-group", "ip address"]
  ),

  c17.t("IP routing", "Easy",
    "Match each inter-VLAN routing method to its architecture and primary use case.",
    [
      ["Router-on-a-Stick (ROAS)", "Uses an external router with subinterfaces (`G0/0.x`) over an 802.1Q trunk; common at small branch sites"],
      ["Layer 3 Switch with SVIs", "Uses virtual `interface vlan <id>` interfaces inside a multilayer switch; ideal when multiple switch ports belong to each VLAN"],
      ["Layer 3 Switch Routed Port", "Uses `no switchport` on a single physical switch interface; ideal for a single point-to-point Layer 3 link between switches/routers"],
      ["Layer 3 EtherChannel", "Bundles multiple parallel `no switchport` physical links into one `Port-channel` interface with a single IPv4 subnet and routing adjacency"]
    ],
    "Enterprise networks use ROAS at small branches where a router and Layer 2 switch already exist, Layer 3 switch SVIs on campus switches where many ports connect to each VLAN, single routed ports on point-to-point Layer 3 links, and Layer 3 EtherChannels on parallel core/distribution links to avoid duplicate routing adjacencies.",
    "Many ports in a VLAN -> SVI; 1 point-to-point L3 link -> Routed port; parallel L3 links -> L3 EtherChannel.",
    ["encapsulation dot1q", "interface vlan", "no switchport", "interface port-channel"]
  )
];

// ============================================================================
// v1c18: Troubleshooting IPv4 Routing
// Domain: "IP Connectivity", weight 25, topic: "IP routing"
// ============================================================================
const c18 = mk("IP Connectivity", 25, "v1c18");
const q18 = [
  c18.s("IP routing", "Easy",
    "Which Layer 3 protocol and specific message types does the `ping` command use to test end-to-end IPv4 connectivity?",
    "ICMPv4 Echo Requests (sent to the target) and ICMPv4 Echo Reply packets (returned by the target)",
    [
      ["ICMP Time Exceeded (sent to the target) and ICMP Destination Unreachable (returned by the target)", "ICMP Time Exceeded (TTL Exceeded) is triggered by `traceroute` when a router decrements TTL to 0, not by normal `ping`."],
      ["TCP SYN segments on port 7 (sent to the target) and TCP SYN-ACK segments (returned by the target)", "`ping` uses Layer 3 ICMP directly inside an IPv4 packet without any TCP or UDP transport header."],
      ["UDP datagrams on port 33434 (sent to the target) and ARP Reply frames (returned by the target)", "UDP port 33434 is used by Cisco IOS `traceroute` probes, whereas ARP resolves MAC addresses on a local LAN."]
    ],
    "The `ping` utility tests network-layer reachability using Internet Control Message Protocol (ICMP), a Layer 3 control protocol encapsulated directly inside IP packets (no TCP or UDP). The source sends an ICMP Echo Request, and the destination replies with an ICMP Echo Reply.",
    "`ping` = ICMP Echo Request + ICMP Echo Reply (pure Layer 3, no TCP/UDP).",
    ["ping"]
  ),

  c18.s("IP routing", "Easy",
    "In Cisco IOS, what are the default packet count, timeout per packet, and output symbols for a successful reply versus a timeout in the `ping` command?",
    "5 packets, 2-second timeout, `!` for a successful reply, and `.` for a timeout",
    [
      ["4 packets, 5-second timeout, `*` for a successful reply, and `?` for a request timeout", "4 packets is the Windows `ping` default, and `*` is used for a timeout in `traceroute`, not a success in `ping`."],
      ["3 packets, 3-second timeout, `!` for a successful reply, and `*` for a timeout", "3 probes with a 3-second timeout and `*` for a timeout are the defaults for Cisco IOS `traceroute`, not `ping`."],
      ["5 packets, 1-second timeout, `.` for a successful reply, and `!` for a timeout", "In Cisco IOS `ping`, `!` indicates a received Echo Reply and `.` indicates that the 2-second timer expired."]
    ],
    "By default, the Cisco IOS `ping` command sends 5 100-byte ICMP Echo Request packets with a 2-second timeout per packet. Each exclamation point (`!`) indicates an Echo Reply was received within 2 seconds, while a period (`.`) indicates the request timed out.",
    "IOS `ping` defaults: 5 echos, 100 bytes, 2-sec timeout; `!` = success, `.` = timeout (`.!!!!` = 80%, often initial ARP delay).",
    ["ping"]
  ),

  c18.s("IP routing", "Easy",
    "When an administrator runs a standard `ping 172.16.2.101` command from router R1's CLI without specifying a source, which source IPv4 address does R1 place in the ICMP Echo Request packets?",
    "The IPv4 address of R1's exit interface matched by the lookup for 172.16.2.101",
    [
      ["The primary IPv4 address of R1's lowest-numbered active GigabitEthernet LAN port", "A standard router ping always uses the outgoing interface's IP address for that route, not an arbitrary LAN port."],
      ["The IPv4 address of the host on R1's LAN that reported the connectivity problem", "A router cannot spoof a LAN host's IPv4 address; even extended ping only allows choosing one of the router's own IPs."],
      ["The reserved local loopback address 127.0.0.1 from R1's internal TCP/IP stack", "127.0.0.1 is never used as the source IP of packets transmitted onto an external network link."]
    ],
    "For a standard `ping <destination>` issued on a Cisco router, the router first looks up the destination in its IPv4 routing table to determine the outgoing interface, and then uses that outgoing interface's IPv4 address as the source IP address of the ICMP Echo Request.",
    "Standard router `ping` source IP = outgoing interface IP; Extended `ping` lets you pick any local router IP as source.",
    ["ping"]
  ),

  c18.s("IP routing", "Easy",
    "How does the `traceroute` command discover the IPv4 addresses of each router along the forward path to a destination?",
    "By sending probes with incrementing TTL values so each hop decrements TTL to 0 and returns ICMP TTL Exceeded",
    [
      ["By sending a single broadcast packet that requires every router in the path to append its IPv4 address to the payload", "Normal `traceroute` does not use broadcast packets or IP record-route options; it relies on incrementing TTL values."],
      ["By querying the OSPF Link-State Database on every router along the forwarding path via SNMP get-next requests", "`traceroute` tests the live data plane using IP packets with low TTL values, independent of OSPF or SNMP."],
      ["By broadcasting Layer 2 ARP requests with a TTL of 255 to each intermediate subnet along the path", "ARP operates only at Layer 2 within the local broadcast domain and cannot traverse routers."]
    ],
    "Every router that forwards an IPv4 packet decrements the IP header's Time To Live (TTL) field by 1; if TTL reaches 0, the router discards the packet and sends an ICMP Time Exceeded (TTL Exceeded) message back to the sender. `traceroute` exploits this by sending a set of probes with TTL=1 (identifying the first router), then TTL=2 (identifying the second router), and so on until the destination host is reached.",
    "`traceroute` sends TTL=1, then TTL=2, then TTL=3... triggering ICMP TTL Exceeded from each hop in sequence.",
    ["traceroute"]
  ),

  c18.s("IP routing", "Medium",
    "On a workstation, `ping 172.16.2.101` succeeds with 0% packet loss, but `ping fileserver.example.com` (which should resolve to 172.16.2.101) fails with an unknown host error. What does this comparison isolate as the root cause?",
    "A DNS hostname resolution problem, such as a missing or unreachable DNS server",
    [
      ["A missing or misconfigured default gateway IPv4 address on the workstation", "Because `ping 172.16.2.101` succeeded to a remote subnet, the workstation's default gateway is working properly."],
      ["An incorrect static route on the remote router connected to 172.16.2.0/24", "End-to-end IPv4 routing in both directions is already proven working by the successful ping to `172.16.2.101`."],
      ["An inbound IP access control list (ACL) blocking ICMP Echo Requests on the router", "An ACL blocking ICMP would block `ping 172.16.2.101` as well, whereas IP ping succeeded."]
    ],
    "Pinging by IPv4 address tests IP connectivity directly without invoking DNS, whereas pinging by hostname requires the host to resolve the name into an IPv4 address via DNS first. When pinging the IP address succeeds right after pinging the hostname fails, Layer 1–3 connectivity to that target is working and the issue lies with DNS resolution.",
    "Ping IP works + Ping hostname fails = DNS problem!",
    ["ping"]
  ),

  c18.s("IP routing", "Medium",
    "Host A (`172.16.1.51/24`) connects to LAN switch SW1, which connects to router R1's `Gi0/0` (`172.16.1.1/24`), and R1's `S0/0/0` (`172.16.4.1/24`) connects to R2. From R1's CLI, a standard `ping 172.16.1.51` succeeds (`!!!!!`), but an extended ping `ping 172.16.1.51 source 172.16.4.1` fails (`.....`). What is the most likely cause?",
    "Host A has an incorrect or missing default gateway (default router) setting",
    [
      ["Switch SW1 has placed Host A's port into an STP blocking or err-disabled state", "If SW1 were blocking Host A's port, the standard `ping 172.16.1.51` from R1 would also fail."],
      ["Router R2 is missing a reverse route back to subnet 172.16.1.0/24", "Neither ping packet leaves R1 toward R2; `172.16.4.1` is R1's own serial interface IP address."],
      ["Host A is configured with an IPv4 address in the wrong subnet (`172.16.2.51`)", "Host A already replied to `ping 172.16.1.51`, proving it is configured with `172.16.1.51`."]
    ],
    "When R1 runs a standard `ping 172.16.1.51`, R1 uses its LAN IP `172.16.1.1` as the source address. Because `172.16.1.1` is in Host A's own local subnet (`172.16.1.0/24`), Host A replies directly via ARP without using its default gateway. When R1 uses extended ping with source `172.16.4.1` (a different subnet), Host A must send its Echo Reply to its default gateway; if the extended ping fails while the standard ping works, Host A's default gateway setting is broken.",
    "On a router: Standard ping to LAN host works + Extended ping (from another router interface IP) to LAN host fails = Host's default gateway is wrong!",
    ["ping"]
  ),

  c18.s("IP routing", "Medium",
    "Why is an extended ping from router R1 (`ping 172.16.2.101 source 172.16.1.1`, where `172.16.1.1` is R1's LAN interface on Host A's subnet) a better test of end-to-end routing between Host A (`172.16.1.51`) and remote Host B (`172.16.2.101`) than a standard `ping 172.16.2.101` on R1?",
    "It forces remote routers to route the Echo Reply back to Host A's LAN subnet instead of R1's WAN link",
    [
      ["It causes R1 to encapsulate the ICMP Echo Request with Host A's own MAC and IPv4 address `172.16.1.51`", "A router can only source extended pings from one of its own configured interface IP addresses (`172.16.1.1`), not Host A's IP."],
      ["It bypasses all inbound and outbound IPv4 access control lists on intermediate transit routers", "Extended ping packets are subject to router ACLs just like any other IPv4 packet."],
      ["It tests whether Host A's network interface card and default gateway are configured properly", "Pinging from R1 to Host B never sends traffic to or from Host A itself, so Host A's NIC and gateway are not tested."]
    ],
    "A standard `ping 172.16.2.101` on R1 uses R1's outgoing WAN interface IP (`172.16.4.1`) as the source, so remote router R2 only needs a route back to the WAN link (`172.16.4.0/24`). Sourcing the ping from R1's LAN interface (`172.16.1.1`) forces the Echo Reply to travel all the way back to subnet `172.16.1.0/24`, verifying both the forward route to Host B's subnet and the reverse route to Host A's subnet.",
    "Extended ping from the router's LAN IP tests both the forward route to the target AND the reverse route back to the LAN subnet.",
    ["ping"]
  ),

  c18.s("IP routing", "Medium",
    "When a router decrements an incoming `traceroute` probe's TTL to 0 and generates an ICMP Time Exceeded message back to the sender, which IPv4 address does the router use as the source IP of that ICMP message?",
    "The IPv4 address of the incoming router interface on which the expired probe arrived",
    [
      ["The IPv4 address of the router's outgoing interface pointing toward the final destination", "Using the incoming interface (facing the sender) is standard so `traceroute` lists the next-hop IP seen by the upstream router."],
      ["The final destination IPv4 address carried inside the original `traceroute` probe header", "Each router uses its own interface IP address so the sender can identify which router generated the TTL Exceeded message."],
      ["The all-zeros default route address `0.0.0.0` from the router's forwarding table", "`0.0.0.0` is not a valid unicast router interface address for sourcing ICMP Time Exceeded messages."]
    ],
    "When a router discards a packet because its TTL reached 0, the router sends an ICMP Time Exceeded (TTL Exceeded) message back to the source host using the IPv4 address of the interface on which the packet arrived (which is also the next-hop IP address that the previous router used to forward the packet).",
    "Each line in `traceroute` shows the IP address of that router's interface facing the source (the inbound interface).",
    ["traceroute"]
  ),

  c18.s("IP routing", "Hard",
    "How do the probe packets generated by a Cisco IOS router's `traceroute` command differ from those typically generated by a Windows OS `tracert` command, and why does this matter when troubleshooting?",
    "IOS `traceroute` sends UDP probes whereas Windows `tracert` sends ICMP Echoes, so ACLs may filter them differently",
    [
      ["Cisco IOS `traceroute` sends TCP SYN probes on port 80, whereas Windows `tracert` sends UDP probes on port 53", "Neither uses TCP port 80 or UDP port 53 by default; IOS uses high-numbered UDP ports and Windows uses ICMP Echo Requests."],
      ["Cisco IOS `traceroute` starts with TTL=255 and counts down, whereas Windows `tracert` starts with TTL=1 and counts up", "Both implementations start with TTL=1 and increment TTL by 1 for each successive set of probes."],
      ["Cisco IOS `traceroute` works only over serial WAN links, whereas Windows `tracert` works only over Ethernet LANs", "Both `traceroute` and `tracert` operate at Layer 3/4 across any IPv4 data link."]
    ],
    "While host operating systems like Windows (`tracert`) typically send ICMP Echo Request messages with incrementing TTLs, Cisco IOS `traceroute` sends IPv4 packets encapsulating a UDP header (starting at destination port 33434). Because router ACLs can filter UDP vs ICMP differently, a host `tracert` might succeed where a router `traceroute` is filtered by an ACL, or vice versa.",
    "Host `tracert` = ICMP Echo probes; Cisco IOS `traceroute` = UDP probes (port 33434).",
    ["traceroute"]
  ),

  c18.m("IP routing", "Hard",
    "On router R1, an engineer runs `ping 172.16.2.101 source 172.16.1.1` (where `172.16.1.1` is R1's LAN IP on Host A's subnet `172.16.1.0/24`) and gets `!!!!!` (100% success), yet Host A (`172.16.1.51/24`) still cannot ping `172.16.2.101`. Which two issues are NOT tested by R1's extended ping and could still be the root cause?",
    ["An IP ACL on a transit router that denies source `172.16.1.51` while permitting `172.16.1.1`", "A VLAN or port-security issue on Host A's switch port on SW1, or a wrong default gateway on Host A"],
    [
      ["A broken physical WAN cable between R1 and R2 causing R1's WAN interface to go `down/down`", "If the WAN link between R1 and R2 were down, R1's extended ping to `172.16.2.101` would have failed."],
      ["A missing connected route in R2's routing table for remote Host B's subnet `172.16.2.0/24`", "R1's successful extended ping to `172.16.2.101` already proved R2 has a working route to `172.16.2.0/24`."],
      ["A missing or incorrect default gateway IPv4 address configured on remote Host B `172.16.2.101`", "Host B successfully returned Echo Replies to `172.16.1.1`, proving Host B's default gateway is working."]
    ],
    "Even an extended ping from R1 (`source 172.16.1.1`) never traverses the LAN between Host A (`172.16.1.51`) and R1, and uses source IP `172.16.1.1` rather than `172.16.1.51`. Therefore, it cannot rule out: (1) Host A's own IP/mask/default-gateway settings, (2) Layer 2 switch issues or port security on Host A's port, (3) an ACL filtering `172.16.1.51` specifically, or (4) a longer-match host/subnet route that diverts `172.16.1.51` differently from `172.16.1.1`.",
    "Extended ping from R1 tests R1<->R2<->Host B (forward and reverse), but NEVER tests Host A<->SW1<->R1 or Host A-specific ACLs!",
    ["ping"]
  ),

  c18.s("IP routing", "Hard",
    "Three routers are connected in a line: R1 (`10.1.12.1/24`) — R2 (`10.1.12.2/24` and `10.1.23.2/24`) — R3 (`10.1.23.3/24`). Because of a routing protocol failure, none of the routers have learned any remote routes, so an engineer's PC on R1's LAN can SSH to R1 (`10.1.1.1`), but cannot SSH directly to R2 or R3. How can the engineer access R3's CLI to fix the routing protocol without leaving their desk?",
    "SSH into R1, run `ssh -l admin 10.1.12.2` from R1 to reach R2, and then SSH from R2 to `10.1.23.3`",
    [
      ["Run an extended ping from the PC to `10.1.23.3` to force R1 and R2 to install temporary connected routes", "`ping` tests data-plane reachability; it never installs routes into a router's routing table."],
      ["Run `ssh -l admin 10.1.23.3` directly from R1's CLI since the IOS SSH client bypasses the route table", "An SSH session from R1 to `10.1.23.3` still requires R1 to have a route to `10.1.23.0/24` and R3 to have a route back."],
      ["Configure `transport input all` on R1's vty lines so R1 automatically proxies SSH sessions to R3", "`transport input all` only controls which protocols can log into R1 itself; it does not route or proxy packets to R3."]
    ],
    "Even when end-to-end routing across the internetwork is completely broken, each router still has connected (`C`) routes for its own directly attached links. By logging into R1 and hopping router-to-router (`R1 -> 10.1.12.2 on R2`, then `R2 -> 10.1.23.3 on R3`) using the IOS `telnet` or `ssh -l <user> <host>` client, each connection stays within a single shared subnet and needs no remote routes.",
    "When routing is broken, hop from neighbor to neighbor using `ssh -l <user> <neighbor-ip>` or `telnet <neighbor-ip>` over connected subnets!",
    ["ssh -l", "telnet"]
  ),

  c18.s("IP routing", "Hard",
    "Examine the output of `traceroute 172.16.3.50` executed on Host A (`172.16.1.51/24`, default gateway R1 at `172.16.1.1`). Hop 1 replies from `172.16.1.1` (R1), Hop 2 replies from `172.16.4.2` (R2), and Hop 3 and all subsequent hops time out (`* * *`). Which two routers should the engineer investigate first, and why?",
    "R2 and R3 — packets reached R2, so either R2 cannot route to `172.16.3.50` or R3 lacks a return route",
    [
      ["Host A and R1 — a probe timeout at Hop 3 indicates that Host A's default gateway R1 is unreachable", "Hop 1 (`172.16.1.1`) and Hop 2 (`172.16.4.2`) both replied, proving Host A's default gateway R1 and the R1–R2 link work."],
      ["Switch SW1 on Host A's LAN — `* * *` at Hop 3 indicates a Layer 2 Spanning Tree loop on the local VLAN", "A local LAN failure would prevent Hop 1 (`172.16.1.1`) from replying at all."],
      ["The enterprise DNS server — `* * *` indicates `traceroute` failed to resolve IPv4 address `172.16.3.50`", "The target `172.16.3.50` was specified as a numeric IPv4 address, and Hops 1 and 2 already responded."]
    ],
    "Because Hop 2 (`172.16.4.2`, R2) returned an ICMP TTL Exceeded message to Host A (`172.16.1.51`), we know: (1) the forward path from Host A through R1 to R2 works, and (2) the reverse path from R2 back to `172.16.1.0/24` works. The failure at Hop 3 means either R2's forward route toward `172.16.3.50` (R3) is missing/wrong, an ACL between R2 and R3 is blocking traffic, or R3 is missing a reverse route back to `172.16.1.0/24`.",
    "The last router to reply in `traceroute` has both a working forward path to it AND a working reverse path back to the source!",
    ["traceroute", "show ip route"],
    {
      cli: "HostA$ traceroute 172.16.3.50\ntraceroute to 172.16.3.50, 30 hops max, 52 byte packets\n 1  172.16.1.1 (172.16.1.1)  0.812 ms  0.540 ms  0.498 ms\n 2  172.16.4.2 (172.16.4.2)  7.910 ms  7.502 ms  7.611 ms\n 3  * * *\n 4  * * *"
    }
  ),

  c18.d("IP routing", "Medium",
    "Order the sequence of events that occur during the second round of probes (`TTL = 2`) when Host A runs `traceroute` to a destination behind Router R1 (Hop 1) and Router R2 (Hop 2).",
    [
      "Host A transmits a probe packet toward the destination IPv4 address with the IP header TTL field set to 2",
      "Router R1 (Hop 1) receives the frame, decrements the packet's TTL from 2 to 1, and forwards the packet to Router R2",
      "Router R2 (Hop 2) receives the packet, decrements the TTL from 1 to 0, and discards the expired probe packet",
      "Router R2 generates an ICMP Time Exceeded message sourced from its incoming interface IPv4 address and sends it toward Host A",
      "Host A receives the ICMP Time Exceeded message and displays Router R2's IPv4 address and round-trip time on line 2 of the output"
    ],
    "During the `TTL = 2` round of `traceroute`, Host A sends probes with `TTL = 2`. The first router (R1) decrements TTL to 1 and forwards the packet to R2. The second router (R2) decrements TTL from 1 to 0, drops the packet, and sends an ICMP Time Exceeded message (sourced from R2's incoming interface IP) back to Host A.",
    "A router only drops the packet and sends ICMP TTL Exceeded when it decrements TTL to 0 (not when TTL is 1).",
    ["traceroute"]
  ),

  c18.t("IP routing", "Easy",
    "Match each Cisco IOS troubleshooting command to its specific function.",
    [
      ["ping 172.16.2.101", "Standard ping that sends 5 ICMP Echo Requests using the outgoing interface's IPv4 address as source"],
      ["ping 172.16.2.101 source 172.16.1.1", "Extended ping that specifies the router's LAN IPv4 address as source to test reverse routing back to that LAN"],
      ["traceroute 172.16.2.101", "Sends UDP probes with TTL = 1, 2, 3... to identify each next-hop router interface along the path"],
      ["ssh -l wendell 10.1.2.2", "Uses the router's built-in SSH client to log in to neighboring device 10.1.2.2 as user `wendell`"]
    ],
    "Standard `ping` tests basic reachability from the outgoing interface IP, `ping ... source <ip>` (extended ping) tests reverse routing to a chosen router interface, `traceroute` maps each hop using incrementing TTLs, and `ssh -l <user> <host>` logs into another device from the router CLI.",
    "Remember the `-l` flag in IOS SSH client syntax: `ssh -l <username> <ip-address>`.",
    ["ping", "traceroute", "ssh -l"]
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
  ...q18
];
