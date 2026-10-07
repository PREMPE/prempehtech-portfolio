(() => {
"use strict";

const APP_DEFS = {
  network: { label:"Network Connections", glyph:"NET", kind:"settings" },
  cmd: { label:"Command Prompt", glyph:"C:\\", kind:"terminal" },
  powershell: { label:"Windows PowerShell", glyph:">_", kind:"terminal" },
  switch: { label:"Switch Console", glyph:"SW", kind:"terminal" },
  router: { label:"Router Console", glyph:"R1", kind:"terminal" },
  firewall: { label:"Windows Defender Firewall", glyph:"FW", kind:"mmc" },
  dhcp: { label:"DHCP Manager", glyph:"DH", kind:"mmc" },
  dns: { label:"DNS Manager", glyph:"DNS", kind:"mmc" },
  aduc: { label:"Active Directory Users and Computers", glyph:"AD", kind:"mmc" },
  gpmc: { label:"Group Policy Management", glyph:"GP", kind:"mmc" },
  services: { label:"Services", glyph:"SV", kind:"mmc" },
  server: { label:"Server Manager", glyph:"SRV", kind:"mmc" },
  event: { label:"Event Viewer", glyph:"EV", kind:"event" },
  siem: { label:"Security Operations Console", glyph:"SOC", kind:"siem" },
  endpoint: { label:"Endpoint Security", glyph:"EDR", kind:"siem" }
};

const SCENARIOS = {
networking:{
1:{title:"Bring the Office PC Online",role:"Junior IT Support Technician",ticket:"PC-01 was moved to a new desk and cannot reach the internal server. Configure its adapter and prove end-to-end connectivity.",apps:["network","cmd"],tags:["IPv4","Gateway","DNS","Ping"],tasks:[
{id:"n1cfg",app:"network",title:"Configure Ethernet adapter",type:"form",help:"Use a static address on the 192.168.10.0/24 user LAN.",fields:[["ip","IPv4 address","text"],["mask","Subnet mask","text"],["gateway","Default gateway","text"],["dns","Preferred DNS","text"]],expected:{ip:"192.168.10.10",mask:"255.255.255.0",gateway:"192.168.10.1",dns:"192.168.10.53"}},
{id:"n1ping",app:"cmd",title:"Verify the network path",type:"command",required:["ping 192.168.10.1","ping 10.0.0.10"],responses:{"ping 192.168.10.1":"Reply from 192.168.10.1: bytes=32 time<1ms TTL=64\nPackets: Sent = 4, Received = 4, Lost = 0","ping 10.0.0.10":"Reply from 10.0.0.10: bytes=32 time=2ms TTL=63\nPackets: Sent = 4, Received = 4, Lost = 0"}},
{id:"n1dns",app:"cmd",title:"Verify name resolution",type:"command",required:["nslookup intranet.corp.local"],responses:{"nslookup intranet.corp.local":"Server: dns01.corp.local\nAddress: 192.168.10.53\n\nName: intranet.corp.local\nAddress: 10.0.0.10"}}
]},
2:{title:"Repair DHCP and DNS for the Support VLAN",role:"Junior Network Technician",ticket:"Support workstations receive bad addresses and cannot resolve files.corp.local. Repair the DHCP scope and DNS record, then renew a client.",apps:["dhcp","dns","cmd"],tags:["DHCP","DNS","Client Renewal"],tasks:[
{id:"n2dhcp",app:"dhcp",title:"Correct the DHCP scope",type:"form",fields:[["start","Start IP","text"],["end","End IP","text"],["router","Router option","text"],["dns","DNS server option","text"]],expected:{start:"192.168.20.100",end:"192.168.20.200",router:"192.168.20.1",dns:"192.168.10.53"}},
{id:"n2dns",app:"dns",title:"Create the missing A record",type:"form",fields:[["name","Host name","text"],["address","IP address","text"]],expected:{name:"files",address:"10.0.0.20"}},
{id:"n2client",app:"cmd",title:"Renew and test the client",type:"command",required:["ipconfig /renew","nslookup files.corp.local"],responses:{"ipconfig /renew":"Windows IP Configuration\nEthernet adapter: 192.168.20.114 /24\nGateway: 192.168.20.1","nslookup files.corp.local":"Name: files.corp.local\nAddress: 10.0.0.20"}}
]},
3:{title:"Segment Users and Servers with VLANs",role:"Network Administrator",ticket:"A new server VLAN must be introduced without mixing user and server broadcast domains. Configure the switch and router-on-a-stick path.",apps:["switch","router","cmd"],tags:["VLANs","Trunking","Inter-VLAN Routing"],tasks:[
{id:"n3switch",app:"switch",title:"Build VLANs and trunk",type:"command",required:["vlan 10","vlan 20","switchport mode trunk"],responses:{"vlan 10":"VLAN 10 created: USERS","vlan 20":"VLAN 20 created: SERVERS","switchport mode trunk":"Gi0/24 changed to trunking mode"}},
{id:"n3router",app:"router",title:"Configure router subinterfaces",type:"form",fields:[["users","G0/0.10 address","text"],["servers","G0/0.20 address","text"],["encap10","VLAN for G0/0.10","text"],["encap20","VLAN for G0/0.20","text"]],expected:{users:"192.168.10.1",servers:"192.168.20.1",encap10:"10",encap20:"20"}},
{id:"n3test",app:"cmd",title:"Prove inter-VLAN routing",type:"command",required:["ping 192.168.20.10"],responses:{"ping 192.168.20.10":"Reply from 192.168.20.10: bytes=32 time=1ms TTL=127\nInter-VLAN routing verified."}}
]},
4:{title:"Diagnose an ACL Blocking Finance",role:"Network Operations Analyst",ticket:"Finance clients can reach their gateway and DNS, but the finance application at 10.40.0.25 is unreachable. Determine whether routing or policy is responsible and correct the access list.",apps:["router","cmd"],tags:["ACL","Traceroute","Troubleshooting"],tasks:[
{id:"n4trace",app:"cmd",title:"Locate where traffic stops",type:"command",required:["tracert 10.40.0.25"],responses:{"tracert 10.40.0.25":"1  172.16.20.1\n2  172.16.254.1\n3  * * * Request timed out."}},
{id:"n4acl",app:"router",title:"Correct the Finance ACL",type:"form",evidence:[["10","deny ip 172.16.20.0/24 10.40.0.0/24"],["20","permit ip any any"]],fields:[["action","Action","select",["permit","deny"]],["source","Source network","text"],["destination","Destination host","text"]],expected:{action:"permit",source:"172.16.20.0/24",destination:"10.40.0.25"}},
{id:"n4verify",app:"cmd",title:"Validate application reachability",type:"command",required:["ping 10.40.0.25"],responses:{"ping 10.40.0.25":"Reply from 10.40.0.25: bytes=32 time=4ms TTL=61\nFinance application path restored."}}
]},
5:{title:"Restore Branch-to-HQ Connectivity",role:"Mid-Level Network Engineer",ticket:"The branch office lost access to the HQ application network after a routing change. Restore the route and ensure private traffic is not translated before the VPN.",apps:["router","firewall","cmd"],tags:["Static Route","VPN Traffic","NAT Exemption"],tasks:[
{id:"n5route",app:"router",title:"Restore the HQ route",type:"form",fields:[["network","Destination network","text"],["mask","Prefix/mask","text"],["next","Next hop","text"]],expected:{network:"10.50.0.0",mask:"255.255.0.0",next:"172.16.254.2"}},
{id:"n5nat",app:"firewall",title:"Create VPN NAT exemption",type:"form",fields:[["source","Branch network","text"],["destination","HQ network","text"],["action","NAT action","select",["Do not NAT","Translate"]]],expected:{source:"172.16.30.0/24",destination:"10.50.0.0/16",action:"Do not NAT"}},
{id:"n5verify",app:"cmd",title:"Validate branch-to-HQ traffic",type:"command",required:["tracert 10.50.10.20","ping 10.50.10.20"],responses:{"tracert 10.50.10.20":"1 172.16.30.1\n2 172.16.254.2\n3 10.50.10.20","ping 10.50.10.20":"Reply from 10.50.10.20: time=8ms TTL=61\nHQ application reachable."}}
]}
},
sysadmin:{
1:{title:"Provision an Accounting Employee",role:"Junior Systems Technician",ticket:"HR approved Jordan Lee. Create the domain account, place it correctly, and grant Finance access using role-based permissions.",apps:["aduc","server"],tags:["AD Users","Groups","Permissions"],tasks:[
{id:"s1user",app:"aduc",title:"Create Jordan Lee",type:"form",fields:[["username","User logon name","text"],["display","Full name","text"],["ou","Organizational Unit","select",["Accounting","IT","HR"]]],expected:{username:"jlee",display:"Jordan Lee",ou:"Accounting"}},
{id:"s1group",app:"aduc",title:"Assign department membership",type:"form",fields:[["group","Security group","select",["Accounting","Domain Admins","Everyone"]]],expected:{group:"Accounting"}},
{id:"s1perm",app:"server",title:"Grant Finance folder access",type:"form",fields:[["principal","Principal","select",["Accounting","jlee","Everyone"]],["permission","Permission","select",["Read","Modify","Full Control"]]],expected:{principal:"Accounting",permission:"Modify"}}
]},
2:{title:"Repair a Failed Windows Service",role:"Junior Systems Technician",ticket:"The intranet server is online but users receive a service unavailable message. Investigate Services and validate the recovery from PowerShell.",apps:["services","powershell","event"],tags:["Services","Event Viewer","PowerShell"],tasks:[
{id:"s2event",app:"event",title:"Identify the failed service",type:"form",evidence:[["7031","World Wide Web Publishing Service terminated unexpectedly","SRV-WEB01"],["6005","Event log service started","SRV-WEB01"]],fields:[["service","Affected service","select",["W3SVC","Spooler","DNS Server"]]],expected:{service:"W3SVC"}},
{id:"s2svc",app:"services",title:"Restore the web service",type:"form",fields:[["service","Service","select",["W3SVC","Spooler","BITS"]],["startup","Startup type","select",["Automatic","Manual","Disabled"]],["action","Action","select",["Start","Stop","Disable"]]],expected:{service:"W3SVC",startup:"Automatic",action:"Start"}},
{id:"s2verify",app:"powershell",title:"Verify service health",type:"command",required:["get-service w3svc"],responses:{"get-service w3svc":"Status   Name    DisplayName\n------   ----    -----------\nRunning  W3SVC   World Wide Web Publishing Service"}}
]},
3:{title:"Deploy a Department Policy with Group Policy",role:"Systems Administrator",ticket:"Accounting needs a mapped Finance drive and a controlled desktop policy. Build and link the GPO to the Accounting OU.",apps:["gpmc","aduc","powershell"],tags:["GPO","OU","gpupdate"],tasks:[
{id:"s3ou",app:"aduc",title:"Confirm policy target",type:"form",fields:[["ou","Target OU","select",["Accounting","Domain Controllers","Users"]]],expected:{ou:"Accounting"}},
{id:"s3gpo",app:"gpmc",title:"Create and link the GPO",type:"form",fields:[["name","GPO name","text"],["drive","Drive letter","text"],["path","Share path","text"],["link","Link to OU","select",["Accounting","Domain Controllers","IT"]]],expected:{name:"Accounting Workstation Policy",drive:"F:",path:"\\\\FS01\\Finance",link:"Accounting"}},
{id:"s3apply",app:"powershell",title:"Apply and verify policy",type:"command",required:["gpupdate /force","gpresult /r"],responses:{"gpupdate /force":"Updating policy...\nComputer Policy update completed successfully.\nUser Policy update completed successfully.","gpresult /r":"Applied Group Policy Objects:\n    Accounting Workstation Policy"}}
]},
4:{title:"Recover Domain Authentication Services",role:"Infrastructure Administrator",ticket:"Clients intermittently fail domain logon. DC02 reports Netlogon errors. Diagnose service state and domain-controller health before restoring authentication.",apps:["event","services","powershell"],tags:["Netlogon","dcdiag","Authentication"],tasks:[
{id:"s4event",app:"event",title:"Correlate the authentication error",type:"form",evidence:[["5719","No domain controller is available","DC02"],["7036","Netlogon entered the stopped state","DC02"]],fields:[["root","Most likely root cause","select",["Netlogon service stopped","Disk quota","Print Spooler"]]],expected:{root:"Netlogon service stopped"}},
{id:"s4svc",app:"services",title:"Restore Netlogon",type:"form",fields:[["service","Service","select",["Netlogon","Spooler","BITS"]],["startup","Startup type","select",["Automatic","Manual","Disabled"]],["action","Action","select",["Start","Stop"]]],expected:{service:"Netlogon",startup:"Automatic",action:"Start"}},
{id:"s4health",app:"powershell",title:"Validate the domain controller",type:"command",required:["dcdiag /test:advertising","nltest /dsgetdc:corp.local"],responses:{"dcdiag /test:advertising":"DC02 passed test Advertising","nltest /dsgetdc:corp.local":"DC: \\DC02.corp.local\nThe command completed successfully"}}
]},
5:{title:"Resolve an Enterprise Policy and DNS Outage",role:"Mid-Level Systems Engineer",ticket:"Multiple workstations stopped applying policy after a DNS change. Repair name resolution, force policy, and prove clients can locate the domain.",apps:["dns","gpmc","powershell"],tags:["AD DNS","GPO","Root Cause"],tasks:[
{id:"s5dns",app:"dns",title:"Correct the domain-controller record",type:"form",fields:[["name","Host","text"],["address","Correct IP","text"]],expected:{name:"dc01",address:"172.16.10.10"}},
{id:"s5gpo",app:"gpmc",title:"Confirm GPO link state",type:"form",fields:[["gpo","Policy","select",["Workstation Security Baseline","Default Domain Controllers Policy"]],["link","Link enabled","select",["Yes","No"]]],expected:{gpo:"Workstation Security Baseline",link:"Yes"}},
{id:"s5verify",app:"powershell",title:"Validate DNS and Group Policy",type:"command",required:["nslookup dc01.corp.local","gpupdate /force","gpresult /r"],responses:{"nslookup dc01.corp.local":"Name: dc01.corp.local\nAddress: 172.16.10.10","gpupdate /force":"Policy update completed successfully.","gpresult /r":"Applied GPOs:\n Workstation Security Baseline"}}
]}
},
cyber:{
1:{title:"Investigate Repeated Failed Logins",role:"Security Operations Trainee",ticket:"The administrator account generated repeated failed logons. Determine the event, source, pattern, and safe response.",apps:["event","siem"],tags:["4625","Brute Force","Triage"],tasks:[
{id:"c1event",app:"event",title:"Identify the authentication pattern",type:"form",evidence:[["4624","jlee","10.20.30.21","Success"],["4625","administrator","10.20.30.77","Failed"],["4625","administrator","10.20.30.77","Failed"],["4625","administrator","10.20.30.77","Failed"]],fields:[["event","Event ID","select",["4624","4625","4688"]],["account","Target account","select",["administrator","jlee","guest"]],["source","Source IP","select",["10.20.30.21","10.20.30.77"]]],expected:{event:"4625",account:"administrator",source:"10.20.30.77"}},
{id:"c1class",app:"siem",title:"Classify the activity",type:"form",fields:[["activity","Activity","select",["Password brute force","Normal login","DNS outage"]]],expected:{activity:"Password brute force"}},
{id:"c1resp",app:"siem",title:"Choose the first response",type:"form",fields:[["response","Response","select",["Protect account, preserve logs, contain source","Delete logs","Ignore until success"]]],expected:{response:"Protect account, preserve logs, contain source"}}
]},
2:{title:"Triage Suspicious PowerShell",role:"Junior Security Technician",ticket:"Endpoint telemetry flagged encoded PowerShell on CLIENT-23. Determine whether the process is suspicious and contain the endpoint appropriately.",apps:["endpoint","event","powershell"],tags:["PowerShell","Process","Containment"],tasks:[
{id:"c2alert",app:"endpoint",title:"Review the endpoint alert",type:"form",evidence:[["CLIENT-23","powershell.exe -enc SQBFAFgA...","WINWORD.EXE","High"],["CLIENT-12","powershell.exe Get-Process","explorer.exe","Low"]],fields:[["host","Host","select",["CLIENT-23","CLIENT-12"]],["process","Suspicious process","select",["powershell.exe","explorer.exe"]],["severity","Severity","select",["High","Low"]]],expected:{host:"CLIENT-23",process:"powershell.exe",severity:"High"}},
{id:"c2process",app:"event",title:"Confirm process creation evidence",type:"form",evidence:[["4688","powershell.exe","WINWORD.EXE","CLIENT-23"],["4688","conhost.exe","powershell.exe","CLIENT-23"]],fields:[["event","Process creation Event ID","select",["4625","4688","4720"]],["parent","Parent process","select",["WINWORD.EXE","explorer.exe"]]],expected:{event:"4688",parent:"WINWORD.EXE"}},
{id:"c2contain",app:"endpoint",title:"Contain the endpoint",type:"form",fields:[["action","Action","select",["Isolate CLIENT-23","Delete all logs","Disable EDR"]]],expected:{action:"Isolate CLIENT-23"}}
]},
3:{title:"Harden Remote Administration Access",role:"Security Administrator",ticket:"A management server is exposed too broadly. Restrict RDP to the management subnet and disable a stale privileged account.",apps:["firewall","aduc","event"],tags:["Firewall","RDP","Privileged Accounts"],tasks:[
{id:"c3fw",app:"firewall",title:"Restrict RDP",type:"form",fields:[["port","Port","text"],["source","Allowed source","text"],["action","Action","select",["Allow","Block"]]],expected:{port:"3389",source:"172.16.30.0/24",action:"Allow"}},
{id:"c3acct",app:"aduc",title:"Disable stale privileged account",type:"form",fields:[["account","Account","select",["legacy-admin","administrator","jlee"]],["state","State","select",["Disabled","Enabled"]]],expected:{account:"legacy-admin",state:"Disabled"}},
{id:"c3audit",app:"event",title:"Confirm account change auditing",type:"form",fields:[["event","Relevant Event ID","select",["4725","4624","5156"]]],expected:{event:"4725"}}
]},
4:{title:"Correlate a Multi-Source SOC Alert",role:"Junior SOC Analyst",ticket:"The SIEM shows failed logins followed by suspicious PowerShell on the same workstation. Build the incident chain and contain the affected host.",apps:["siem","event","endpoint"],tags:["SIEM","Correlation","Incident Handling"],tasks:[
{id:"c4corr",app:"siem",title:"Correlate the timeline",type:"form",evidence:[["09:10","4625","CLIENT-44","10.20.30.88"],["09:12","4624","CLIENT-44","10.20.30.88"],["09:13","4688","CLIENT-44","powershell.exe -enc"],["09:14","Sysmon 3","CLIENT-44","185.20.55.14:443"]],fields:[["host","Affected host","select",["CLIENT-44","CLIENT-12"]],["initial","Initial activity","select",["Credential attack","Patch installation"]],["followon","Follow-on activity","select",["Encoded PowerShell","DNS query"]]],expected:{host:"CLIENT-44",initial:"Credential attack",followon:"Encoded PowerShell"}},
{id:"c4event",app:"event",title:"Identify process event evidence",type:"form",fields:[["event","Process event","select",["4688","4624","4720"]]],expected:{event:"4688"}},
{id:"c4contain",app:"endpoint",title:"Contain and preserve",type:"form",fields:[["action","Endpoint action","select",["Isolate CLIENT-44 and preserve telemetry","Reimage immediately and delete logs","Ignore"]]],expected:{action:"Isolate CLIENT-44 and preserve telemetry"}}
]},
5:{title:"Investigate Lateral Movement Across Hosts",role:"Mid-Level Security Analyst",ticket:"A privileged login, remote service creation, and outbound connection appear across three hosts. Scope the incident and choose a containment sequence.",apps:["siem","event","endpoint"],tags:["Lateral Movement","Multi-Host","Containment"],tasks:[
{id:"c5scope",app:"siem",title:"Scope the affected systems",type:"form",evidence:[["10:05","4624 Type 3","WS-17 → APP-02","svc-backup"],["10:06","7045","APP-02","RemoteUpdate"],["10:07","Sysmon 3","APP-02 → DB-01","445"],["10:08","4624 Type 3","APP-02 → DB-01","svc-backup"]],fields:[["origin","Likely origin","select",["WS-17","DB-01"]],["pivot","Pivot host","select",["APP-02","WS-17"]],["account","Account used","select",["svc-backup","jlee"]]],expected:{origin:"WS-17",pivot:"APP-02",account:"svc-backup"}},
{id:"c5tech",app:"event",title:"Identify lateral movement indicator",type:"form",fields:[["indicator","Strong indicator","select",["Remote service creation Event 7045","Normal interactive logon"]]],expected:{indicator:"Remote service creation Event 7045"}},
{id:"c5contain",app:"endpoint",title:"Choose containment order",type:"form",fields:[["action","Containment","select",["Disable svc-backup, isolate WS-17 and APP-02, preserve logs","Delete APP-02 logs","Restart DB-01 only"]]],expected:{action:"Disable svc-backup, isolate WS-17 and APP-02, preserve logs"}}
]}
},
integrated:{
1:{title:"Restore the Finance Office",role:"IT Support Technician",ticket:"Finance lost server access, a new employee needs the right folder permissions, and the administrator account shows repeated failed logins.",apps:["network","aduc","event","cmd"],tags:["Network","AD","Security"],tasks:[
{id:"i1net",app:"network",title:"Fix Finance workstation gateway",type:"form",fields:[["ip","IPv4 address","text"],["mask","Subnet mask","text"],["gateway","Default gateway","text"]],expected:{ip:"192.168.50.24",mask:"255.255.255.0",gateway:"192.168.50.1"}},
{id:"i1access",app:"aduc",title:"Grant Maya Finance access",type:"form",fields:[["group","Group","select",["Finance","Domain Admins","Everyone"]],["permission","Folder permission","select",["Read","Modify","Full Control"]]],expected:{group:"Finance",permission:"Modify"}},
{id:"i1sec",app:"event",title:"Triage administrator failures",type:"form",evidence:[["4625","administrator","10.50.20.99","Failed"],["4625","administrator","10.50.20.99","Failed"],["4625","administrator","10.50.20.99","Failed"]],fields:[["activity","Activity","select",["Credential brute force","Normal login"]],["response","Response","select",["Protect account and preserve logs","Delete logs"]]],expected:{activity:"Credential brute force",response:"Protect account and preserve logs"}}
]},
2:{title:"Onboard a New Branch Office",role:"Junior IT Technician",ticket:"A new branch needs working DHCP/DNS, a department account, and investigation of a suspicious email-launched process.",apps:["dhcp","dns","aduc","endpoint"],tags:["DHCP","Identity","Endpoint"],tasks:[
{id:"i2dhcp",app:"dhcp",title:"Create branch DHCP scope",type:"form",fields:[["start","Start IP","text"],["end","End IP","text"],["router","Gateway","text"]],expected:{start:"10.20.10.100",end:"10.20.10.200",router:"10.20.10.1"}},
{id:"i2user",app:"aduc",title:"Create branch employee access",type:"form",fields:[["username","Username","text"],["group","Group","select",["Branch-Users","Domain Admins"]]],expected:{username:"mcole",group:"Branch-Users"}},
{id:"i2alert",app:"endpoint",title:"Triage email-launched PowerShell",type:"form",evidence:[["BR-PC07","WINWORD.EXE → powershell.exe -enc","High"]],fields:[["classification","Classification","select",["Suspicious","Benign"]],["action","Action","select",["Isolate BR-PC07","Ignore"]]],expected:{classification:"Suspicious",action:"Isolate BR-PC07"}}
]},
3:{title:"Deploy a New Engineering Department",role:"Infrastructure Administrator",ticket:"Engineering needs a segmented VLAN, centralized identity policy, and a firewall rule that allows only the required application path.",apps:["switch","aduc","gpmc","firewall"],tags:["VLAN","GPO","Firewall"],tasks:[
{id:"i3vlan",app:"switch",title:"Create Engineering VLAN",type:"command",required:["vlan 30","name engineering"],responses:{"vlan 30":"VLAN 30 created.","name engineering":"VLAN 30 name set to ENGINEERING."}},
{id:"i3gpo",app:"gpmc",title:"Link Engineering security policy",type:"form",fields:[["name","GPO","text"],["ou","Link OU","select",["Engineering","Domain Controllers"]]],expected:{name:"Engineering Security Baseline",ou:"Engineering"}},
{id:"i3fw",app:"firewall",title:"Allow Engineering app access only",type:"form",fields:[["source","Source","text"],["destination","Destination","text"],["port","TCP port","text"],["action","Action","select",["Allow","Block"]]],expected:{source:"192.168.30.0/24",destination:"10.60.0.25",port:"443",action:"Allow"}}
]},
4:{title:"Recover Production While Handling an Intrusion",role:"IT & Security Analyst",ticket:"Users report production login failures while SIEM alerts show suspicious authentication activity. Restore the service and contain the security event.",apps:["event","services","siem","endpoint"],tags:["Availability","SIEM","Containment"],tasks:[
{id:"i4svc",app:"event",title:"Identify production service failure",type:"form",evidence:[["7031","APP-SVC terminated unexpectedly","PROD-APP01"],["4625","administrator","10.99.5.22","PROD-APP01"]],fields:[["serviceIssue","Service issue","select",["APP-SVC stopped","DNS record missing"]]],expected:{serviceIssue:"APP-SVC stopped"}},
{id:"i4restore",app:"services",title:"Restore production service",type:"form",fields:[["service","Service","select",["APP-SVC","Spooler"]],["action","Action","select",["Start","Disable"]]],expected:{service:"APP-SVC",action:"Start"}},
{id:"i4soc",app:"siem",title:"Contain the suspicious source",type:"form",fields:[["source","Source","select",["10.99.5.22","10.10.1.5"]],["action","Action","select",["Block source and preserve evidence","Delete logs"]]],expected:{source:"10.99.5.22",action:"Block source and preserve evidence"}}
]},
5:{title:"Enterprise Multi-System Incident",role:"Mid-Level IT Professional",ticket:"A site route is broken, a privileged group changed unexpectedly, and encoded PowerShell appears on an application server. Restore operations and scope the compromise.",apps:["router","aduc","siem","endpoint"],tags:["Routing","Identity","IR"],tasks:[
{id:"i5route",app:"router",title:"Restore application-site route",type:"form",fields:[["network","Destination","text"],["mask","Mask","text"],["next","Next hop","text"]],expected:{network:"10.80.0.0",mask:"255.255.0.0",next:"172.16.254.6"}},
{id:"i5identity",app:"aduc",title:"Reverse unauthorized privilege",type:"form",evidence:[["09:44","helpdesk-temp added to Domain Admins","admin-console"]],fields:[["account","Account","select",["helpdesk-temp","administrator"]],["action","Action","select",["Remove from Domain Admins and disable account","Leave unchanged"]]],expected:{account:"helpdesk-temp",action:"Remove from Domain Admins and disable account"}},
{id:"i5soc",app:"siem",title:"Scope encoded PowerShell activity",type:"form",evidence:[["APP-05","powershell.exe -enc","helpdesk-temp"],["APP-05","Outbound 185.40.20.8:443","Sysmon 3"]],fields:[["host","Affected host","select",["APP-05","DB-02"]],["action","Action","select",["Isolate APP-05, preserve logs, investigate credential use","Delete logs and reboot"]]],expected:{host:"APP-05",action:"Isolate APP-05, preserve logs, investigate credential use"}}
]}
}
};

let current=null;
let taskState={};
let terminalState={};
let z=10;
let dragState=null;

const $=id=>document.getElementById(id);
const norm=v=>String(v??"").trim().toLowerCase().replace(/\s+/g," ");

function scenario(track,level){return SCENARIOS[track]?.[Number(level)]||null}
function trackLabel(track){return ({networking:"Networking",sysadmin:"System Administration",cyber:"Cybersecurity",integrated:"All Together"})[track]||track}

function ensureShell(){
  if($("desktopLabShell")) return;
  const shell=document.createElement("section");
  shell.id="desktopLabShell"; shell.className="desktop-lab-shell hidden";
  shell.innerHTML=`
    <div class="desktop-lab-toolbar">
      <div class="desktop-lab-toolbar-left">
        <button class="desktop-back" id="desktopBack" type="button">← Exit Training VM</button>
        <div><strong id="desktopMissionTitle">Lab</strong><small id="desktopMissionMeta"></small></div>
      </div>
      <div class="desktop-lab-toolbar-actions">
        <button class="desktop-fullscreen" id="desktopFullscreen" type="button">Full Screen Workspace</button>
      </div>
    </div>
    <div class="vm-frame">
      <div class="vm-monitor-bar">
        <div class="vm-monitor-dots"><i></i><i></i><i></i></div>
        <strong>PrempehTech Training VM</strong>
        <div class="vm-monitor-status"><span>LAB-NET</span><span id="vmConnectionStatus">Connected</span></div>
      </div>
      <div class="vm-desktop" id="vmDesktop">
        <div class="vm-desktop-icons" id="vmDesktopIcons"></div>
        <aside class="vm-mission" id="vmMission"></aside>
        <div class="vm-windows" id="vmWindows"></div>
        <div class="vm-start-menu hidden" id="vmStartMenu"></div>
        <div class="vm-toast hidden" id="vmToast"></div>
        <div class="vm-complete hidden" id="vmComplete"></div>
        <div class="vm-taskbar">
          <button class="vm-start" id="vmStart" type="button" aria-label="Start">⊞</button>
          <div class="vm-taskbar-apps" id="vmTaskbarApps"></div>
          <div class="vm-clock" id="vmClock"></div>
        </div>
      </div>
    </div>`;
  const main=document.querySelector("main");
  main.appendChild(shell);
  $("desktopBack").addEventListener("click",closeLab);
  $("desktopFullscreen").addEventListener("click",()=>shell.classList.toggle("vm-fullscreen-active"));
  $("vmStart").addEventListener("click",()=>$("vmStartMenu").classList.toggle("hidden"));
  $("vmDesktop").addEventListener("mousedown",e=>{if(!e.target.closest(".vm-start-menu")&&!e.target.closest("#vmStart"))$("vmStartMenu").classList.add("hidden")});
  document.addEventListener("mousemove",dragMove);
  document.addEventListener("mouseup",()=>dragState=null);
  updateClock(); setInterval(updateClock,30000);
}

function updateClock(){
  const el=$("vmClock"); if(!el)return;
  const d=new Date(); el.innerHTML=d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})+"<br>"+d.toLocaleDateString();
}

function launch(track,level){
  ensureShell();
  current={track,level:Number(level),data:scenario(track,level)};
  if(!current.data) return;
  taskState={}; terminalState={}; current.data.tasks.forEach(t=>taskState[t.id]=false);
  const old=$("labShell"); if(old)old.classList.add("hidden");
  $("desktopLabShell").classList.remove("hidden");
  $("desktopMissionTitle").textContent=current.data.title;
  $("desktopMissionMeta").textContent=trackLabel(track)+" · Level "+level+" · "+current.data.role;
  renderDesktop();
  $("desktopLabShell").scrollIntoView({behavior:"smooth",block:"start"});
}

function closeLab(){
  $("desktopLabShell")?.classList.add("hidden");
  $("desktopLabShell")?.classList.remove("vm-fullscreen-active");
  document.getElementById("tracks")?.scrollIntoView({behavior:"smooth",block:"start"});
}

function renderDesktop(){
  $("vmWindows").innerHTML="";
  $("vmTaskbarApps").innerHTML="";
  $("vmComplete").classList.add("hidden");
  renderIcons(); renderMission(); renderStart();
}

function renderIcons(){
  $("vmDesktopIcons").innerHTML=current.data.apps.map(id=>{
    const a=APP_DEFS[id];return `<button class="vm-desktop-icon" type="button" data-app="${id}">
      <span class="vm-icon-glyph">${a.glyph}</span><span>${a.label}</span></button>`
  }).join("");
  document.querySelectorAll("#vmDesktopIcons [data-app]").forEach(b=>b.addEventListener("dblclick",()=>openApp(b.dataset.app)));
  document.querySelectorAll("#vmDesktopIcons [data-app]").forEach(b=>b.addEventListener("click",()=>{clearTimeout(b._t);b._t=setTimeout(()=>openApp(b.dataset.app),220)}));
}

function renderStart(){
  $("vmStartMenu").innerHTML=`<div class="vm-start-rail"><span>⚙</span><span>⏻</span></div><div class="vm-start-main"><h4>Applications</h4>${
    current.data.apps.map(id=>{const a=APP_DEFS[id];return `<div class="vm-start-app" data-start-app="${id}"><span class="vm-icon-glyph">${a.glyph}</span><span>${a.label}</span></div>`}).join("")
  }</div>`;
  document.querySelectorAll("[data-start-app]").forEach(x=>x.addEventListener("click",()=>{openApp(x.dataset.startApp);$("vmStartMenu").classList.add("hidden")}));
}

function renderMission(){
  const done=Object.values(taskState).filter(Boolean).length,total=current.data.tasks.length;
  $("vmMission").innerHTML=`<div class="vm-mission-head"><div><span>PROJECT TICKET · LEVEL ${current.level}</span><h3>${current.data.title}</h3></div><span>${done}/${total}</span></div>
    <div class="vm-ticket"><strong>Assigned role:</strong> ${current.data.role}<br><br>${current.data.ticket}</div>
    <ul class="vm-task-list">${current.data.tasks.map((t,i)=>`<li class="vm-task-item ${taskState[t.id]?"done":""}"><span class="vm-task-check">${taskState[t.id]?"✓":i+1}</span><span><strong>${t.title}</strong><br>Open ${APP_DEFS[t.app].label}</span></li>`).join("")}</ul>
    <div class="vm-progress-wrap"><div class="vm-progress-line"><span style="width:${total?done/total*100:0}%"></span></div><div class="vm-progress-copy"><span>Project progress</span><strong>${Math.round(done/total*100)}%</strong></div></div>`;
}

function openApp(appId){
  const existing=document.querySelector('.vm-window[data-app="'+appId+'"]');
  if(existing){focusWindow(existing);return}
  const app=APP_DEFS[appId]; if(!app)return;
  const win=document.createElement("section");
  win.className="vm-window";win.dataset.app=appId;win.style.zIndex=++z;
  const offset=document.querySelectorAll(".vm-window").length*24;
  win.style.left=(230+offset)+"px";win.style.top=(55+offset)+"px";
  win.innerHTML=`<div class="vm-titlebar"><div class="vm-title-left"><span class="vm-title-icon">${app.glyph}</span><span>${app.label}</span></div>
    <div class="vm-window-controls"><button class="vm-min" type="button">—</button><button class="vm-max" type="button">□</button><button class="vm-close" type="button">×</button></div></div>
    <div class="vm-menubar">File Action View Help</div><div class="vm-app-body">${renderAppContent(appId)}</div>`;
  $("vmWindows").appendChild(win);
  addTaskbarButton(appId);
  win.addEventListener("mousedown",()=>focusWindow(win));
  win.querySelector(".vm-close").addEventListener("click",()=>closeWindow(win));
  win.querySelector(".vm-min").addEventListener("click",()=>{win.classList.add("hidden");taskButton(appId)?.classList.remove("active")});
  win.querySelector(".vm-max").addEventListener("click",()=>win.classList.toggle("maximized"));
  win.querySelector(".vm-titlebar").addEventListener("mousedown",e=>startDrag(e,win));
  bindApp(win,appId);
}

function closeWindow(win){const id=win.dataset.app;win.remove();taskButton(id)?.remove()}
function focusWindow(win){win.classList.remove("hidden");win.style.zIndex=++z;document.querySelectorAll(".vm-task-app").forEach(b=>b.classList.toggle("active",b.dataset.taskApp===win.dataset.app))}
function addTaskbarButton(id){
  const a=APP_DEFS[id],b=document.createElement("button");b.className="vm-task-app active";b.dataset.taskApp=id;b.textContent=a.glyph+" "+a.label;
  b.addEventListener("click",()=>{const w=document.querySelector('.vm-window[data-app="'+id+'"]');if(!w)return;if(w.classList.contains("hidden"))focusWindow(w);else if(Number(w.style.zIndex)===z){w.classList.add("hidden");b.classList.remove("active")}else focusWindow(w)});
  $("vmTaskbarApps").appendChild(b);
}
function taskButton(id){return document.querySelector('.vm-task-app[data-task-app="'+id+'"]')}
function startDrag(e,win){if(e.target.closest(".vm-window-controls")||win.classList.contains("maximized"))return;const r=win.getBoundingClientRect(),d=$("vmDesktop").getBoundingClientRect();dragState={win,dx:e.clientX-r.left,dy:e.clientY-r.top,baseLeft:d.left,baseTop:d.top}}
function dragMove(e){if(!dragState)return;dragState.win.style.left=Math.max(0,e.clientX-dragState.baseLeft-dragState.dx)+"px";dragState.win.style.top=Math.max(0,e.clientY-dragState.baseTop-dragState.dy)+"px"}

function tasksFor(appId){return current.data.tasks.filter(t=>t.app===appId)}
function renderAppContent(appId){
  const app=APP_DEFS[appId],tasks=tasksFor(appId);
  if(app.kind==="terminal")return renderTerminal(appId,tasks);
  if(app.kind==="settings")return renderSettings(appId,tasks);
  if(app.kind==="event")return renderEvent(appId,tasks);
  if(app.kind==="siem")return renderSiem(appId,tasks);
  return renderMMC(appId,tasks);
}

function taskForm(t){
  if(t.type==="command")return `<div class="vm-form-panel"><h5>${t.title}</h5><p style="font-size:.7rem;color:#555">Use the console above. Required validation commands: ${t.required.length}.</p><div class="vm-task-feedback" data-feedback="${t.id}"></div></div>`;
  const ev=t.evidence?evidenceTable(t.evidence):"";
  return `<div class="vm-form-panel" data-task-form="${t.id}"><h5>${t.title}</h5>${ev}<div class="vm-form-grid">${t.fields.map(f=>fieldHtml(t.id,f)).join("")}</div>
  <div class="vm-action-row"><button class="vm-native-btn help" type="button" data-why="${t.id}">Why this matters</button><button class="vm-native-btn primary" type="button" data-submit-task="${t.id}">Apply / Validate</button></div><div class="vm-task-feedback" data-feedback="${t.id}"></div></div>`
}
function fieldHtml(taskId,f){
  const [key,label,type,opts]=f;
  if(type==="select")return `<label>${label}<select data-field="${taskId}:${key}"><option value="">Select...</option>${opts.map(o=>`<option>${o}</option>`).join("")}</select></label>`;
  return `<label>${label}<input type="text" data-field="${taskId}:${key}" autocomplete="off"></label>`
}
function evidenceTable(rows){
  return `<table class="vm-grid-table"><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`
}

function renderSettings(id,tasks){
  return `<div class="vm-settings"><div class="vm-settings-nav"><strong>Settings</strong><span>Status</span><span class="active">Ethernet</span><span>Proxy</span><span>Advanced settings</span></div><div class="vm-settings-main"><h2>Ethernet</h2><p>Configure IP settings for the active adapter.</p>${tasks.map(taskForm).join("")}</div></div>`
}
function renderMMC(id,tasks){
  const a=APP_DEFS[id];
  return `<div class="vm-mmc"><div class="vm-tree"><div class="vm-tree-node">▾ Console Root</div><div class="vm-tree-node active">  ▸ ${a.label}</div><div class="vm-tree-node">  ▸ CORP.LOCAL</div><div class="vm-tree-node">  ▸ Properties</div></div><div class="vm-detail"><h4>${a.label}</h4><p>Administrative console · CORP lab environment</p>${tasks.map(taskForm).join("")}</div></div>`
}
function renderEvent(id,tasks){
  const rows=tasks.flatMap(t=>t.evidence||[]);
  return `<div class="vm-event-app"><div class="vm-event-nav"><strong>Event Viewer</strong><div>Custom Views</div><div class="active">Windows Logs</div><div>Application</div><div>Security</div><div>System</div></div><div class="vm-event-main"><div class="vm-event-toolbar">Actions · Filter Current Log · Find · Refresh</div>
  ${rows.length?`<table class="vm-event-table"><thead><tr><th>Event ID</th><th>Details</th><th>Source / Host</th><th>Result</th></tr></thead><tbody>${rows.map(r=>`<tr class="${String(r).includes("Failed")?"suspicious":""}">${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`:""}
  ${tasks.map(taskForm).join("")}</div></div>`
}
function renderSiem(id,tasks){
  const rows=tasks.flatMap(t=>t.evidence||[]);
  return `<div class="vm-siem-app"><div class="vm-siem-top"><h3>${APP_DEFS[id].label}</h3><span>Live telemetry · CORP</span></div><div class="vm-siem-kpis"><div class="vm-siem-kpi"><span>Open alerts</span><strong>7</strong></div><div class="vm-siem-kpi"><span>High severity</span><strong>2</strong></div><div class="vm-siem-kpi"><span>Hosts reporting</span><strong>14</strong></div></div>
  ${rows.length?`<table class="vm-grid-table" style="color:#dce7ef"><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`:""}${tasks.map(taskForm).join("")}</div>`
}
function renderTerminal(appId,tasks){
  terminalState[appId]=terminalState[appId]||{seen:{}};
  const prompt=appId==="powershell"?"PS C:\\Users\\Administrator>":appId==="switch"?"SW1#":appId==="router"?"R1#":"C:\\Users\\student>";
  return `<div class="vm-terminal-app"><div class="vm-terminal-toolbar"><button type="button" data-terminal-help="${appId}">Command Guide</button><button type="button" data-terminal-clear="${appId}">Clear</button></div><div class="vm-terminal-output" data-terminal-output="${appId}">PrempehTech Training Console\n${prompt}</div><form class="vm-terminal-input" data-terminal-form="${appId}"><span>${prompt}</span><input autocomplete="off" spellcheck="false" placeholder="Type a command"><button class="vm-native-btn" type="submit">Enter</button></form>${tasks.map(taskForm).join("")}</div>`
}

function bindApp(win,appId){
  win.querySelectorAll("[data-submit-task]").forEach(b=>b.addEventListener("click",()=>validateFormTask(b.dataset.submitTask,win)));
  win.querySelectorAll("[data-why]").forEach(b=>b.addEventListener("click",()=>showWhy(b.dataset.why)));
  const form=win.querySelector("[data-terminal-form]");
  if(form)form.addEventListener("submit",e=>{e.preventDefault();const input=form.querySelector("input"),raw=input.value;input.value="";runTerminal(appId,raw,win)});
  win.querySelectorAll("[data-terminal-clear]").forEach(b=>b.addEventListener("click",()=>{win.querySelector("[data-terminal-output]").textContent=""}));
  win.querySelectorAll("[data-terminal-help]").forEach(b=>b.addEventListener("click",()=>showTerminalGuide(appId)));
}

function validateFormTask(taskId,win){
  const t=current.data.tasks.find(x=>x.id===taskId);if(!t||taskState[taskId])return;
  const values={};Object.keys(t.expected).forEach(k=>{const el=win.querySelector('[data-field="'+taskId+':'+k+'"]');values[k]=el?el.value:""});
  const ok=Object.entries(t.expected).every(([k,v])=>norm(values[k])===norm(v));
  const fb=win.querySelector('[data-feedback="'+taskId+'"]');
  if(ok){taskState[taskId]=true;fb.className="vm-task-feedback ok";fb.textContent="Configuration accepted. Validation passed.";toast("Task completed: "+t.title,"good");afterTask()}
  else{fb.className="vm-task-feedback bad";fb.textContent="Validation failed. One or more values do not match the required project configuration.";toast("Configuration rejected. Review the project ticket and evidence.","bad")}
}

function runTerminal(appId,raw,win){
  const cmd=norm(raw),out=win.querySelector("[data-terminal-output]"),prompt=appId==="powershell"?"PS C:\\Users\\Administrator>":appId==="switch"?"SW1#":appId==="router"?"R1#":"C:\\Users\\student>";
  out.textContent+="\n"+prompt+raw;
  let matched=false;
  tasksFor(appId).filter(t=>t.type==="command").forEach(t=>{
    const match=t.required.find(r=>norm(r)===cmd);
    if(match){matched=true;terminalState[appId].seen[taskIdKey(t.id,match)]=true;out.textContent+="\n"+(t.responses?.[match]||"Command completed successfully.");
      const all=t.required.every(r=>terminalState[appId].seen[taskIdKey(t.id,r)]);
      const fb=win.querySelector('[data-feedback="'+t.id+'"]');
      if(all&&!taskState[t.id]){taskState[t.id]=true;if(fb){fb.className="vm-task-feedback ok";fb.textContent="Required command validation completed."}toast("Task completed: "+t.title,"good");afterTask()}
      else if(fb){fb.className="vm-task-feedback";fb.textContent="Command accepted. Continue the required checks."}
    }
  });
  if(!matched){
    if(cmd==="help"||cmd==="?"){out.textContent+="\nAvailable commands are based on the current project. Use Command Guide for context."}
    else if(cmd){out.textContent+="\nThe training console did not recognize that command for this project. Check spelling and the ticket."}
  }
  out.scrollTop=out.scrollHeight;
}

function taskIdKey(id,cmd){return id+"|"+norm(cmd)}
function afterTask(){renderMission();if(Object.values(taskState).every(Boolean))completeProject()}
function toast(msg,type=""){const t=$("vmToast");t.textContent=msg;t.className="vm-toast "+type;clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.add("hidden"),3200)}
function showWhy(taskId){const t=current.data.tasks.find(x=>x.id===taskId);if(!t)return;toast("Why it matters: "+t.title+" is required to prove the project works, not just to change a setting.","")}
function showTerminalGuide(appId){
  const req=tasksFor(appId).filter(t=>t.type==="command").flatMap(t=>t.required);
  toast(req.length?"Project command guide: "+req.join("  ·  "):"No command task is required in this console.","");
}
function completeProject(){
  const score=100;
  $("vmComplete").innerHTML=`<div class="vm-complete-card"><span style="color:#1687d2;font-weight:900;font-size:.72rem">PROJECT VALIDATED</span><h2>${current.data.title}</h2><p>You completed the Level ${current.level} ${trackLabel(current.track)} project in the training VM. The configuration and validation steps passed.</p><div class="vm-complete-actions"><button class="vm-native-btn primary" id="vmReplay" type="button">Replay Project</button><button class="vm-native-btn" id="vmChoose" type="button">Choose Another Level</button></div></div>`;
  $("vmComplete").classList.remove("hidden");
  window.dispatchEvent(new CustomEvent("prempeh-desktop-complete",{detail:{track:current.track,level:current.level,score}}));
  $("vmReplay").addEventListener("click",()=>launch(current.track,current.level));
  $("vmChoose").addEventListener("click",closeLab);
}

window.PrempehDesktopLab={
  launch,
  close:closeLab,
  getScenario:(track,level)=>scenario(track,level),
  getTrackLabel:trackLabel
};
})();