export const bugsData = {
  dhcp: {
    node: "router",
    failureHopIndex: 2,
    errorLog: "%DHCP_SND-4-NO_HELPER: DHCP broadcast received on Gi0/0/0, but no helper-address configured. Packet dropped.",
    desc: "DHCP Relay helper-address is missing on R-1 interface Gi0/0/0, preventing local broadcasts from reaching the DHCP server.",
    options: [
      { cmd: "interface GigabitEthernet0/0/0 \n ip helper-address 10.10.10.1", correct: true, label: "Add ip helper-address 10.10.10.1" },
      { cmd: "ip dhcp pool LAN_POOL", correct: false, label: "Recreate the DHCP pool" },
      { cmd: "ip dhcp excluded-address 192.168.1.1", correct: false, label: "Exclude gateway IP address" },
      { cmd: "interface GigabitEthernet0/0/0 \n shutdown", correct: false, label: "Shutdown interface Gi0/0/0" }
    ]
  },
  ping: {
    node: "router",
    failureHopIndex: 2,
    errorLog: "%IP-3-NO_ROUTE: Route lookup failed for 8.8.8.8. No gateway of last resort. Packet dropped.",
    desc: "Default gateway route is missing on R-1, leaving it unable to forward packets to public WAN servers.",
    options: [
      { cmd: "ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/0/1", correct: true, label: "Configure default route via Gi0/0/1" },
      { cmd: "router ospf 1 \n network 10.10.10.0 0.0.0.3 area 0", correct: false, label: "Advertise WAN interface in OSPF" },
      { cmd: "ip routing", correct: false, label: "Enable global IP routing" },
      { cmd: "clear ip route *", correct: false, label: "Clear IP routing table cache" }
    ]
  },
  nat: {
    node: "router",
    failureHopIndex: 2,
    errorLog: "%NAT-4-PAT_EXHAUSTION: NAT translation failed due to missing overload configuration. Source ports unavailable.",
    desc: "PAT/NAT Overload is configured without the 'overload' keyword, restricting internet translations to a single inside host.",
    options: [
      { cmd: "ip nat inside source list 1 interface GigabitEthernet0/1 overload", correct: true, label: "Configure NAT inside source list with overload" },
      { cmd: "ip nat inside", correct: false, label: "Re-enable inside NAT on LAN interface" },
      { cmd: "ip nat pool PUBLIC_IPS 192.168.1.2 192.168.1.2", correct: false, label: "Configure static NAT address pools" },
      { cmd: "access-list 1 permit any", correct: false, label: "Permit all traffic in NAT ACL" }
    ]
  },
  stp: {
    node: "switch",
    failureHopIndex: 1,
    errorLog: "%STP-3-LOOP_DETECTED: Loop detected on Fa0/2. Non-root switch holds root role. Root priority mismatch.",
    desc: "SW-1 is not the designated STP Root Bridge for VLAN 10, causing STP blocks on backup firewall links.",
    options: [
      { cmd: "spanning-tree vlan 10 priority 4096", correct: true, label: "Set SW-1 bridge priority to 4096" },
      { cmd: "spanning-tree mode pvst", correct: false, label: "Switch STP mode to legacy PVST" },
      { cmd: "interface FastEthernet0/2 \n spanning-tree portfast", correct: false, label: "Enable STP PortFast on Fa0/2 link" },
      { cmd: "spanning-tree vlan 10 priority 32768", correct: false, label: "Reset SW-1 priority to default 32768" }
    ]
  },
  arp: {
    node: "switch",
    failureHopIndex: 1,
    errorLog: "%ARP-4-VLAN_MISMATCH: ARP broadcast discarded. Port Fa0/1 is in VLAN 20, but gateway is in VLAN 10.",
    desc: "Switch port Fa0/1 connected to Host PC is incorrectly assigned to VLAN 20, blocking all traffic to VLAN 10 gateway.",
    options: [
      { cmd: "interface FastEthernet0/1 \n switchport mode access \n switchport access vlan 10", correct: true, label: "Assign Fa0/1 to VLAN 10 as access port" },
      { cmd: "vlan 20 \n name Sales", correct: false, label: "Rename VLAN 20 database name" },
      { cmd: "interface GigabitEthernet0/1 \n switchport mode trunk", correct: false, label: "Enable trunking on uplink Gi0/1" },
      { cmd: "switchport access vlan 20", correct: false, label: "Reset port access parameters" }
    ]
  },
  ospf: {
    node: "router",
    failureHopIndex: 2,
    errorLog: "%OSPF-5-ADJCHG: Neighbor 192.168.1.254 on Gi0/0/0 down: Area ID mismatch (Area 0 vs Area 1).",
    desc: "OSPF adjacency failed between R-1 and Firewall FW-1 because R-1's network is advertised in the wrong Area (Area 1 instead of Area 0).",
    options: [
      { cmd: "router ospf 1 \n network 192.168.1.0 0.0.0.255 area 0", correct: true, label: "Re-advertise network 192.168.1.0/24 in Area 0" },
      { cmd: "router-id 1.1.1.1", correct: false, label: "Reconfigure Router ID" },
      { cmd: "router ospf 1 \n network 192.168.1.0 0.0.0.255 area 1", correct: false, label: "Keep network in Area 1" },
      { cmd: "clear ip ospf process", correct: false, label: "Reset OSPF process database statistics" }
    ]
  },
  acl: {
    node: "firewall",
    failureHopIndex: 2,
    errorLog: "%SEC-6-ACL_DENIED: Packet from 192.168.1.10 to 8.8.8.8 denied by ACL 10 (rule 10 deny ip any any).",
    desc: "Firewall standard ACL 10 blocks all traffic due to an implicit deny or rule mismatch.",
    options: [
      { cmd: "access-list 10 permit any", correct: true, label: "Append permit any to override block" },
      { cmd: "no access-list 10", correct: false, label: "Delete security access list entirely" },
      { cmd: "interface GigabitEthernet1/1 \n no ip access-group 10 in", correct: false, label: "Remove ACL filter group from interface" },
      { cmd: "access-list 10 deny 192.168.20.0 0.0.0.255", correct: false, label: "Add deny rule for 192.168.20.0" }
    ]
  },
  roas: {
    node: "sw-branch",
    failureHopIndex: 1,
    errorLog: "%TRUNK-4-VLAN_NOT_ALLOWED: VLAN 20 is not allowed on trunk Gi0/1. Packet dropped.",
    desc: "Switch SW-Branch is blocking inter-VLAN routing because the trunk link to the router does not allow VLAN 20 traffic.",
    options: [
      { cmd: "interface GigabitEthernet0/1 \n switchport trunk allowed vlan add 10,20", correct: true, label: "Allow VLAN 10 and 20 on Trunk Gi0/1" },
      { cmd: "interface GigabitEthernet0/1 \n switchport mode access", correct: false, label: "Convert trunk uplink to access interface" },
      { cmd: "switchport trunk native vlan 99", correct: false, label: "Change trunk native management VLAN" },
      { cmd: "vlan 20 \n name Voice", correct: false, label: "Re-name Voice VLAN database" }
    ]
  },
  lacp: {
    node: "r-branch",
    failureHopIndex: 1,
    errorLog: "%ETHERCHANNEL-3-LACP_MISMATCH: LACP negotiation failed on Gi0/1. Partner mode is active, but local mode is set to off.",
    desc: "EtherChannel LACP negotiation failed between R-Branch and HQ-Core because R-Branch ports are configured in static mode 'on' instead of negotiating 'active' mode.",
    options: [
      { cmd: "interface range GigabitEthernet0/1 - 2 \n channel-group 1 mode active", correct: true, label: "Reconfigure channel group modes to active LACP" },
      { cmd: "interface range GigabitEthernet0/1 - 2 \n channel-group 1 mode on", correct: false, label: "Keep static etherchannel bundling on" },
      { cmd: "no interface port-channel 1", correct: false, label: "Delete logical Port-Channel interface" },
      { cmd: "interface range GigabitEthernet0/1 - 2 \n shutdown", correct: false, label: "Shut down physical bundling links" }
    ]
  },
  vpn: {
    node: "fw-branch",
    failureHopIndex: 1,
    errorLog: "%CRYPTO-4-IKMP_KEY_MISMATCH: ISAKMP Phase 1 failed: Pre-shared key mismatch with peer 192.0.2.1.",
    desc: "Site-to-Site VPN fails because the pre-shared key config on the branch firewall has a password mismatch with peer router.",
    options: [
      { cmd: "crypto isakmp key NetSec301 address 198.51.100.1", correct: true, label: "Set correct pre-shared key 'NetSec301' for peer 198.51.100.1" },
      { cmd: "crypto ipsec transform-set VPN_SET esp-aes esp-sha-hmac", correct: false, label: "Re-encrypt the transform set settings" },
      { cmd: "no crypto isakmp policy 10", correct: false, label: "Delete ISAKMP Phase 1 policy parameters" },
      { cmd: "crypto isakmp key WrongPassword address 198.51.100.1", correct: false, label: "Assign incorrect password key" }
    ]
  }
};

export const cliOutputs = {
  pc: {
    "ipconfig /all": `FastEthernet0 Connection-specific DNS Suffix: local
Physical Address. . . . . . . . . . . . : 0050.7966.6800
DHCP Enabled. . . . . . . . . . . . . . : Yes
IP Address. . . . . . . . . . . . . . . : 192.168.1.10
Subnet Mask . . . . . . . . . . . . . . : 255.255.255.0
Default Gateway . . . . . . . . . . . . : 192.168.1.1
DNS Servers . . . . . . . . . . . . . . : 8.8.8.8`,
    "arp -a": `Internet Address      Physical Address      Type
192.168.1.1           0011.2233.4455        dynamic
192.168.1.250         00e0.f901.abcd        dynamic`,
    "ping 8.8.8.8": `Pinging 8.8.8.8 with 32 bytes of data:
Reply from 8.8.8.8: bytes=32 time=12ms TTL=118
Reply from 8.8.8.8: bytes=32 time=12ms TTL=118
Reply from 8.8.8.8: bytes=32 time=13ms TTL=118
Reply from 8.8.8.8: bytes=32 time=12ms TTL=118

Ping statistics for 8.8.8.8:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 12ms, Maximum = 13ms, Average = 12ms`
  },
  switch: {
    "show mac address-table": `          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       ----        -----
  10    0050.7966.6800    DYNAMIC     Fa0/1
  10    0011.2233.4455    DYNAMIC     Gi0/1
  10    55aa.bbcc.ddee    DYNAMIC     Gi0/2`,
    "show vlan brief": `VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/3, Fa0/4, Fa0/5, Fa0/6
                                                Fa0/7, Fa0/8, Fa0/9, Fa0/10
10   Sales                            active    Fa0/1
20   Finance                          active    Fa0/2
99   Management                       active    `,
    "show spanning-tree vlan 10": `VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    4096
             Address     00e0.f901.abcd
             This bridge is the root
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Interface           Role Sts Cost      Prio.Nbr Type
  ------------------- ---- --- --------- -------- ------------------------
  Fa0/1               Desg FWD 19        128.1    Shr Edge
  Gi0/1               Desg FWD 4         128.25   P2p
  Gi0/2               Desg FWD 4         128.26   P2p`
  },
  router: {
    "show ip route": `Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area 
       N1 - OSPF NSSA external 1, N2 - OSPF NSSA external 2
       E1 - OSPF external 1, E2 - OSPF external 2
Gateway of last resort is 192.168.1.2 to network 0.0.0.0

O*E2  0.0.0.0/0 [110/1] via 192.168.1.2, 00:45:12, GigabitEthernet0/0/1
C     192.168.1.0/24 is directly connected, GigabitEthernet0/0/0
L     192.168.1.1/32 is directly connected, GigabitEthernet0/0/0
C     192.168.1.2/30 is directly connected, GigabitEthernet0/0/1
L     192.168.1.3/32 is directly connected, GigabitEthernet0/0/1`,
    "show ip interface brief": `Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   192.168.1.1     YES manual up                    up      
GigabitEthernet0/0/1   192.168.1.2     YES manual up                    up      
GigabitEthernet0/0/2   unassigned      YES unset  administratively down down`,
    "show ip ospf neighbor": `Neighbor ID     Pri   State           Dead Time   Address         Interface
192.168.1.254     1   FULL/DR         00:00:36    192.168.1.254   GigabitEthernet0/0/0`,
    "show ip nat translations": `Pro Inside global      Inside local       Outside local      Outside global
tcp 192.168.1.2:1024   192.168.1.10:49152 8.8.8.8:80         8.8.8.8:80`
  },
  firewall: {
    "show access-list": `access-list OUTSIDE_IN; 4 elements; name hash: 0x8a9b2c3d
access-list OUTSIDE_IN line 1 extended permit tcp any host 192.168.1.10 eq www (hitcnt=1542)
access-list OUTSIDE_IN line 2 extended permit tcp any host 192.168.1.10 eq https (hitcnt=859)
access-list OUTSIDE_IN line 3 extended deny tcp any any eq telnet (hitcnt=14)
access-list OUTSIDE_IN line 4 extended deny ip any any (hitcnt=45)`,
    "show interfaces ip brief": `Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet1/1         192.168.1.254   YES manual up                    up      
GigabitEthernet1/2         192.168.1.3     YES manual up                    up      `,
    "show conn": `2 Total Active Connections
TCP OUTSIDE 8.8.8.8:80 INSIDE 192.168.1.10:49152, idle 0:00:12, bytes 4104, flags UIO`
  },
  wan: {
    "ping 192.168.1.10": `Sending 5, 100-byte ICMP Echos to 192.168.1.10, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 12/12/13 ms`,
    "show ip bgp summary": `BGP router identifier 8.8.8.8, local AS number 15169
BGP table version is 142312, main routing table version 142312
Neighbor        V      AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
192.168.1.2     4   65001   14523   14510   142312    0    0 02:14:55        8`
  },
  "pc-sales": {
    "ipconfig /all": `FastEthernet0 Connection-specific DNS Suffix: office
Physical Address. . . . . . . . . . . . : 00aa.bbcc.1010
DHCP Enabled. . . . . . . . . . . . . . : Yes
IP Address. . . . . . . . . . . . . . . : 10.10.10.10
Subnet Mask . . . . . . . . . . . . . . : 255.255.255.0
Default Gateway . . . . . . . . . . . . : 10.10.10.1`,
    "arp -a": `Internet Address      Physical Address      Type
10.10.10.1            0011.2233.4455        dynamic`,
    "ping 10.10.20.10": `Pinging 10.10.20.10 with 32 bytes of data:
Reply from 10.10.20.10: bytes=32 time=4ms TTL=254
Reply from 10.10.20.10: bytes=32 time=3ms TTL=254
Reply from 10.10.20.10: bytes=32 time=4ms TTL=254
Reply from 10.10.20.10: bytes=32 time=4ms TTL=254`
  },
  "ip-phone": {
    "show voice port": `Voice Port 0/0/0 state is UP, connection is voice-mail
Voice Port 0/0/1 state is DOWN`,
    "ping 10.10.10.10": `Sending 5 ICMP Echos to 10.10.10.10, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5)`
  },
  "sw-branch": {
    "show switchport trunk": `Name: Gi0/1
Switchport: Enabled
Administrative Mode: trunk
Operational Mode: trunk
Trunking Native Mode VLAN: 1 (default)
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: dot1q
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)
Trunking VLANs Enabled: 10,20`,
    "show vlan brief": `VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/3, Fa0/4, Fa0/5
10   Sales                            active    Fa0/1
20   Voice                            active    Fa0/2`,
    "show mac address-table": `          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       ----        -----
  10    00aa.bbcc.1010    DYNAMIC     Fa0/1
  20    00bb.ccdd.2020    DYNAMIC     Fa0/2`
  },
  "r-branch": {
    "show ip interface brief": `Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0.10  10.10.10.1      YES manual up                    up
GigabitEthernet0/0.20  10.10.20.1      YES manual up                    up
Port-Channel 1         192.168.100.1   YES manual up                    up`,
    "show ip route": `C  10.10.10.0/24 is directly connected, GigabitEthernet0/0.10
C  10.10.20.0/24 is directly connected, GigabitEthernet0/0.20
C  192.168.100.0/30 is directly connected, Port-Channel 1
O  172.16.100.0/24 [110/2] via 192.168.100.2, Port-Channel 1`,
    "show etherchannel summary": `Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
Group Port-channel Protocol    Ports
-----+------------+-----------+-----------------------------------------------
1     Po1(RU)      LACP        Gi0/1(P)    Gi0/2(P)`,
    "show crypto ipsec sa": `interface: Port-Channel 1
    Crypto map tag: MYMAP, local addr 192.168.100.1
   protected vrf: (none)
   local  ident (addr/mask/prot/port): (10.10.10.0/255.255.255.0/0/0)
   remote ident (addr/mask/prot/port): (172.16.100.0/255.255.255.0/0/0)
   #pkts encaps: 452, #pkts encrypt: 452, #pkts digest: 452
   #pkts decaps: 421, #pkts decrypt: 421, #pkts verify: 421`
  },
  "hq-core": {
    "show etherchannel summary": `Flags:  D - down        P - bundled in port-channel
Group Port-channel Protocol    Ports
-----+------------+-----------+-----------------------------------------------
1     Po1(RU)      LACP        Gi1/0/1(P)  Gi1/0/2(P)`,
    "show ip route": `C  172.16.100.0/24 is directly connected, GigabitEthernet1/0/24
C  192.168.100.0/30 is directly connected, Port-Channel 1
O  10.10.10.0/24 [110/2] via 192.168.100.1, Port-Channel 1
O  10.10.20.0/24 [110/2] via 192.168.100.1, Port-Channel 1`,
    "show mac address-table": `          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       ----        -----
 100    0011.2233.4455    DYNAMIC     Gi1/0/24`
  },
  "fw-branch": {
    "show crypto isakmp sa": `IPv4 Phone Security Association:
Active SA: 1
Dst             Src             State          Connection ID   Status
198.51.100.1    192.0.2.1       MM_ACTIVE      215324          ACTIVE`,
    "show crypto ipsec sa": `interface: GigabitEthernet0/0
    Crypto map tag: outside_map, local addr 198.51.100.1
   #pkts encaps: 421, #pkts encrypt: 421, #pkts decaps: 452, #pkts decrypt: 452`,
    "show ip interface brief": `Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0         198.51.100.1    YES manual up                    up
GigabitEthernet0/1         172.16.100.254  YES manual up                    up`
  },
  "hq-server": {
    "ipconfig /all": `Ethernet adapter Local Area Connection:
Physical Address. . . . . . . . . . . . : 0011.2233.4455
IP Address. . . . . . . . . . . . . . . : 172.16.100.5
Subnet Mask . . . . . . . . . . . . . . : 255.255.255.0
Default Gateway . . . . . . . . . . . . : 172.16.100.1`,
    "ping 10.10.10.10": `Pinging 10.10.10.10 with 32 bytes of data:
Reply from 10.10.10.10: bytes=32 time=4ms TTL=254
Reply from 10.10.10.10: bytes=32 time=4ms TTL=254`
  }
};
