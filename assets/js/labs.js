// CCNA Virtual Lab Center Database (10 Interactive Configuration Labs)

export const labs = [
  {
    id: 1,
    title: "VLAN Creation & Switchport Access Configuration",
    domain: "Network Access",
    difficulty: "Easy",
    scenario: "Configure access ports on a branch switch to isolate department traffic. Place host terminals in VLAN 10 (Sales) and VLAN 20 (Finance).",
    objectives: [
      "Create VLAN 10 and name it 'Sales'",
      "Create VLAN 20 and name it 'Finance'",
      "Assign switchport FastEthernet 0/1 to VLAN 10 as an access port",
      "Assign switchport FastEthernet 0/2 to VLAN 20 as an access port"
    ],
    commands: [
      { cmd: "vlan 10", desc: "Enter VLAN 10 database configuration" },
      { cmd: "name Sales", desc: "Assign name 'Sales' to VLAN 10" },
      { cmd: "vlan 20", desc: "Enter VLAN 20 database configuration" },
      { cmd: "name Finance", desc: "Assign name 'Finance' to VLAN 20" },
      { cmd: "interface FastEthernet0/1", desc: "Enter interface configuration mode for Fa0/1" },
      { cmd: "switchport mode access", desc: "Configure port as an access interface" },
      { cmd: "switchport access vlan 10", desc: "Assign interface to VLAN 10" },
      { cmd: "interface FastEthernet0/2", desc: "Enter interface configuration mode for Fa0/2" },
      { cmd: "switchport mode access", desc: "Configure port as an access interface" },
      { cmd: "switchport access vlan 20", desc: "Assign interface to VLAN 20" }
    ],
    verification: [
      "show vlan brief",
      "show interface FastEthernet0/1 switchport"
    ],
    explanation: "VLANs partition a physical switch into distinct logical broadcast domains. Assigning ports to specific VLANs prevents network broadcasts from crossing department boundaries at Layer 2."
  },
  {
    id: 2,
    title: "Inter-VLAN Routing via Router-on-a-Stick (ROAS)",
    domain: "Network Access",
    difficulty: "Medium",
    scenario: "Configure 802.1Q subinterfaces on a branch router to allow communication between hosts in VLAN 10 and VLAN 20 using a shared trunk link.",
    objectives: [
      "Enable subinterface GigabitEthernet 0/0.10",
      "Configure dot1Q encapsulation on subinterface 0/0.10 for VLAN 10",
      "Assign IP address 10.10.10.1/24 to subinterface GigabitEthernet 0/0.10",
      "Enable subinterface GigabitEthernet 0/0.20",
      "Configure dot1Q encapsulation on subinterface 0/0.20 for VLAN 20",
      "Assign IP address 10.10.20.1/24 to subinterface GigabitEthernet 0/0.20"
    ],
    commands: [
      { cmd: "interface GigabitEthernet0/0.10", desc: "Create and enter subinterface 0/0.10" },
      { cmd: "encapsulation dot1Q 10", desc: "Configure 802.1Q encapsulation for VLAN 10" },
      { cmd: "ip address 10.10.10.1 255.255.255.0", desc: "Assign gateway IP address to subinterface" },
      { cmd: "interface GigabitEthernet0/0.20", desc: "Create and enter subinterface 0/0.20" },
      { cmd: "encapsulation dot1Q 20", desc: "Configure 802.1Q encapsulation for VLAN 20" },
      { cmd: "ip address 10.10.20.1 255.255.255.0", desc: "Assign gateway IP address to subinterface" }
    ],
    verification: [
      "show ip interface brief",
      "show route"
    ],
    explanation: "Router-on-a-Stick routes packets between VLANs by using virtual subinterfaces on a single physical link. The router tags egress frames with 802.1Q tags to allow the switch to identify target VLAN destinations."
  },
  {
    id: 3,
    title: "Single-Area OSPFv2 Dynamic Routing",
    domain: "IP Connectivity",
    difficulty: "Medium",
    scenario: "Configure OSPFv2 on R-1 to dynamically advertise inside LAN subnets and WAN interfaces within OSPF Area 0.",
    objectives: [
      "Enable OSPF process ID 1 on R-1",
      "Configure Router ID 1.1.1.1",
      "Advertise inside network 192.168.1.0/24 in Area 0",
      "Advertise WAN network 10.10.10.0/30 in Area 0"
    ],
    commands: [
      { cmd: "router ospf 1", desc: "Enable OSPF routing process 1" },
      { cmd: "router-id 1.1.1.1", desc: "Set unique router ID to identify neighbors" },
      { cmd: "network 192.168.1.0 0.0.0.255 area 0", desc: "Advertise inside LAN using wildcard mask" },
      { cmd: "network 10.10.10.0 0.0.0.3 area 0", desc: "Advertise WAN using wildcard mask" }
    ],
    verification: [
      "show ip protocols",
      "show ip ospf neighbor",
      "show ip route ospf"
    ],
    explanation: "OSPFv2 uses wildcard masks (the inverse of subnet masks) to define which local interfaces participate in OSPF database exchanges. Interfaces in the same Area form adjacencies to exchange Link-State Advertisements (LSAs)."
  },
  {
    id: 4,
    title: "Standard Access Control List (ACL) Traffic Filtering",
    domain: "Security Fundamentals",
    difficulty: "Medium",
    scenario: "Secure R-1 by deploying a standard Access Control List to block traffic from a specific subnet (192.168.20.0/24) while permitting all other traffic.",
    objectives: [
      "Create standard access-list 10 to deny source network 192.168.20.0/24",
      "Configure permit statement to allow all other traffic through ACL 10",
      "Apply access-list 10 inbound on interface GigabitEthernet 0/0"
    ],
    commands: [
      { cmd: "access-list 10 deny 192.168.20.0 0.0.0.255", desc: "Block source network using wildcard mask" },
      { cmd: "access-list 10 permit any", desc: "Permit all other packets (override implicit deny)" },
      { cmd: "interface GigabitEthernet0/0", desc: "Enter interface configuration for inside LAN" },
      { cmd: "ip access-group 10 in", desc: "Apply ACL inbound to filter ingress frames" }
    ],
    verification: [
      "show access-lists",
      "show ip interface GigabitEthernet0/0"
    ],
    explanation: "Standard ACLs (IDs 1-99) only filter traffic based on source IP addresses. Applying an ACL inbound filters traffic before it reaches the routing engine, conserving processor cycles."
  },
  {
    id: 5,
    title: "DHCP Server Pool and Helper Configurations",
    domain: "IP Services",
    difficulty: "Medium",
    scenario: "Configure R-1 to dynamically hand out IP configurations to LAN clients on VLAN 10. Exclude gateway IPs to prevent IP duplication conflicts.",
    objectives: [
      "Exclude IP range 192.168.1.1 to 192.168.1.10 from dynamic allocation",
      "Create a DHCP pool named 'LAN_POOL'",
      "Define subnet network 192.168.1.0/24 inside the pool",
      "Set Default Gateway to 192.168.1.1",
      "Set DNS Server to 8.8.8.8"
    ],
    commands: [
      { cmd: "ip dhcp excluded-address 192.168.1.1 192.168.1.10", desc: "Reserve gateway IP addresses from pool" },
      { cmd: "ip dhcp pool LAN_POOL", desc: "Create new DHCP server pool" },
      { cmd: "network 192.168.1.0 255.255.255.0", desc: "Define pool subnet range" },
      { cmd: "default-router 192.168.1.1", desc: "Specify default gateway handed to clients" },
      { cmd: "dns-server 8.8.8.8", desc: "Specify DNS server handed to clients" }
    ],
    verification: [
      "show ip dhcp binding",
      "show ip dhcp pool LAN_POOL"
    ],
    explanation: "Dynamic Host Configuration Protocol (DHCP) pools assign IP addresses, lease duration, default gateway router parameters, and DNS details. Excluded ranges shield static devices from IP address conflicts."
  },
  {
    id: 6,
    title: "NAT Overload (PAT) Configurations",
    domain: "IP Services",
    difficulty: "Hard",
    scenario: "Configure NAT Overload (PAT) on the branch gateway router to translate inside private addresses to a single public IP, enabling WAN access.",
    objectives: [
      "Define inside NAT interface on LAN link GigabitEthernet 0/0",
      "Define outside NAT interface on WAN link GigabitEthernet 0/1",
      "Create standard access-list 1 to permit inside source range 192.168.1.0/24",
      "Create dynamic NAT translation mapping to translate access-list 1 to interface GigabitEthernet 0/1 with overload translation enabled"
    ],
    commands: [
      { cmd: "interface GigabitEthernet0/0", desc: "Enter inside LAN gateway interface" },
      { cmd: "ip nat inside", desc: "Designate interface as inside NAT boundary" },
      { cmd: "interface GigabitEthernet0/1", desc: "Enter outside WAN interface" },
      { cmd: "ip nat outside", desc: "Designate interface as outside NAT boundary" },
      { cmd: "exit", desc: "Return to global configuration mode" },
      { cmd: "access-list 1 permit 192.168.1.0 0.0.0.255", desc: "Identify inside source networks to translate" },
      { cmd: "ip nat inside source list 1 interface GigabitEthernet0/1 overload", desc: "Establish port address translation mapping" }
    ],
    verification: [
      "show ip nat translations",
      "show ip nat statistics"
    ],
    explanation: "NAT Overload (Port Address Translation) maps multiple private RFC 1918 inside IP addresses to a single public IP address by assigning unique source TCP/UDP port values to keep track of outbound WAN sessions."
  },
  {
    id: 7,
    title: "Spanning Tree (STP) Bridge Priority Tuning",
    domain: "Network Access",
    difficulty: "Easy",
    scenario: "Tune switchport spanning-tree priority settings on SW-1 to manually elect it as the Root Bridge for VLAN 10, preventing suboptimal routing.",
    objectives: [
      "Configure SW-1 to be the primary root switch for VLAN 10 by setting bridge priority to 4096",
      "Configure SW-1 spanning-tree mode to Rapid PVST+"
    ],
    commands: [
      { cmd: "spanning-tree mode rapid-pvst", desc: "Configure Rapid Per-VLAN Spanning Tree mode" },
      { cmd: "spanning-tree vlan 10 priority 4096", desc: "Set bridge priority (multiples of 4096) below default 32768" }
    ],
    verification: [
      "show spanning-tree vlan 10",
      "show spanning-tree summary"
    ],
    explanation: "STP elects the Root Bridge based on the lowest Bridge ID (Priority + MAC). Setting bridge priority below the default 32768 forces the election, ensuring core switches handle frame forwarding loops."
  },
  {
    id: 8,
    title: "EtherChannel Bundling via LACP Configuration",
    domain: "Network Access",
    difficulty: "Medium",
    scenario: "Bundle Gigabit interfaces 0/1 and 0/2 on R-Branch into an active LACP EtherChannel bundle to increase inter-switch link capacity and provide immediate link redundancy.",
    objectives: [
      "Enter interface range configuration for GigabitEthernet 0/1 and GigabitEthernet 0/2",
      "Assign interfaces to Channel Group 1 utilizing active LACP negotiation"
    ],
    commands: [
      { cmd: "interface range GigabitEthernet0/1 - 2", desc: "Enter interface range configuration" },
      { cmd: "channel-group 1 mode active", desc: "Bundle ports into Channel-Group 1 using active LACP" }
    ],
    verification: [
      "show etherchannel summary",
      "show interface port-channel 1"
    ],
    explanation: "Link Aggregation Control Protocol (LACP) dynamically bundles multiple physical interfaces into a single logical link. The channel-group mode active setting forces negotiations, resolving spanning-tree port blockages."
  },
  {
    id: 9,
    title: "WLAN WPA2 Wireless Network Configuration",
    domain: "Network Access",
    difficulty: "Easy",
    scenario: "Configure a basic wireless network parameters on a campus WLC to support secure corporate access.",
    objectives: [
      "Configure WLAN profile with ID 2",
      "Set SSID name to 'Corporate_WiFi'",
      "Enable WPA2 security encryption on WLAN 2",
      "Configure pre-shared key (PSK) authentication password to 'Cisco123'"
    ],
    commands: [
      { cmd: "wlan Corporate_WiFi 2 Corporate_WiFi", desc: "Create WLAN profile ID 2 with SSID name" },
      { cmd: "security wpa wpa2", desc: "Enable WPA2 security encryption protocol" },
      { cmd: "security wpa wpa2 ciphers aes", desc: "Specify AES cipher suite encryption" },
      { cmd: "security wpa wpa2 akm psk", desc: "Configure pre-shared key key management" },
      { cmd: "security wpa wpa2 akm psk set-key ascii Cisco123", desc: "Set wireless network access password" }
    ],
    verification: [
      "show wlan summary",
      "show wlan 2"
    ],
    explanation: "WLAN configuration requires establishing SSIDs, security parameters, and encryption types. WPA2-Personal (PSK) uses pre-shared keys and AES encryption to protect local frames from dynamic sniffing."
  },
  {
    id: 10,
    title: "Site-to-Site IPSec VPN Tunnel Configurations",
    domain: "Security Fundamentals",
    difficulty: "Hard",
    scenario: "Configure an IPSec VPN tunnel on the gateway router R-Branch to establish a secure, encrypted tunnel to the HQ Peer Firewall.",
    objectives: [
      "Create ISAKMP policy ID 10",
      "Configure 256-bit AES encryption on ISAKMP policy 10",
      "Configure pre-shared authentication key 'NetSec301' for peer gateway IP 198.51.100.1",
      "Create dynamic IPSec transform set named 'VPN_SET' utilizing ESP-AES and ESP-SHA-HMAC authentication"
    ],
    commands: [
      { cmd: "crypto isakmp policy 10", desc: "Enter Phase 1 ISAKMP policy configuration" },
      { cmd: "encryption aes 256", desc: "Specify AES 256-bit encryption algorithm" },
      { cmd: "exit", desc: "Return to global configuration mode" },
      { cmd: "crypto isakmp key NetSec301 address 198.51.100.1", desc: "Assign Phase 1 pre-shared key and peer IP address" },
      { cmd: "crypto ipsec transform-set VPN_SET esp-aes esp-sha-hmac", desc: "Create dynamic Phase 2 IPSec transform set parameters" }
    ],
    verification: [
      "show crypto isakmp sa",
      "show crypto ipsec sa"
    ],
    explanation: "IPSec VPN tunnels secure public WAN traffic via ISAKMP Phase 1 (establishing administrative security keys) and IPSec Phase 2 (defining transport encryption parameters via transform-sets)."
  }
];
