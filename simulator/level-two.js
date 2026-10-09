/* Level 2: evidence-led repairs with prerequisite-gated acceptance checks. */
(() => {
  'use strict';
  const lab=window.PrempehDesktopLab;
  const get=track=>lab.getScenario(track,2);
  const task=(track,id)=>get(track).tasks.find(t=>t.id===id);
  const text=(key,label)=>[key,label,'text'];
  const select=(key,label,values)=>[key,label,'select',values];
  const form=(id,app,title,fields,expected,dependencies=[],evidence=[])=>({id,app,title,type:'form',fields,expected,dependencies,evidence});
  const command=(id,app,title,responses,dependencies)=>({id,app,title,type:'command',required:Object.keys(responses),responses,dependencies});
  const n=get('networking');
  n.ticket='Support VLAN 20 cannot reach the file service. Approved design: DHCP 192.168.20.100–192.168.20.200 /24, gateway 192.168.20.1, DNS 192.168.10.53. files.corp.local must resolve to 10.0.0.20. Identify the scope fault, repair DHCP and DNS, renew PC-14, then prove name resolution and file-server reachability. A configured scope does not update an existing lease until renewal.';
  n.tasks.unshift(form('n2inspect','dhcp','Diagnose the incorrect scope options',[
    select('fault','Fault indicated by the evidence',['Wrong gateway and DNS options','File server powered off','Duplicate host record'])
  ],{fault:'Wrong gateway and DNS options'},[],[['PC-14 address','169.254.22.41 /16'],['Scope router','192.168.20.254'],['Scope DNS','8.8.8.8'],['Approved gateway / DNS','192.168.20.1 / 192.168.10.53']]));
  task('networking','n2dhcp').dependencies=['n2inspect'];
  task('networking','n2dns').dependencies=['n2inspect'];
  const client=n.tasks.pop();
  n.tasks.push(command('n2lease','cmd','Renew the client lease',{'ipconfig /renew':'Lease renewed for PC-14.\nIPv4: 192.168.20.114 /24\nGateway: 192.168.20.1\nDNS: 192.168.10.53'},['n2dhcp']));
  Object.assign(client,{title:'Verify DNS and file-server reachability',dependencies:['n2lease','n2dns'],required:['nslookup files.corp.local','ping 10.0.0.20'],responses:{'nslookup files.corp.local':'Server: 192.168.10.53\nName: files.corp.local\nAddress: 10.0.0.20','ping 10.0.0.20':'Reply from 10.0.0.20: bytes=32 time=2ms TTL=127\nPackets: Sent = 4, Received = 4, Lost = 0'}});n.tasks.push(client);

  const s=get('sysadmin');
  s.ticket='SRV-WEB01 responds on the network, but https://intranet.corp.local/health returns HTTP 503. Correlate Event 7031 with W3SVC, restore Automatic startup and start the service. Configure first-failure recovery to Restart the service after 60 seconds. Verify the running service, TCP 443, and HTTP 200 before handing the incident back.';
  task('sysadmin','s2svc').dependencies=['s2event'];
  s.tasks.splice(2,0,form('s2recovery','services','Configure service recovery',[
    select('first','First failure',['Restart the service','Take no action','Restart the computer']),text('delay','Restart delay (seconds)')
  ],{first:'Restart the service',delay:'60'},['s2svc']));
  Object.assign(task('sysadmin','s2verify'),{dependencies:['s2svc','s2recovery'],required:['get-service w3svc','test-netconnection intranet.corp.local -port 443','invoke-webrequest https://intranet.corp.local/health -usebasicparsing'],responses:{'get-service w3svc':'Status   Name    DisplayName\nRunning  W3SVC   World Wide Web Publishing Service','test-netconnection intranet.corp.local -port 443':'ComputerName: intranet.corp.local\nRemotePort: 443\nTcpTestSucceeded: True','invoke-webrequest https://intranet.corp.local/health -usebasicparsing':'StatusCode: 200\nContent: {"status":"healthy","server":"SRV-WEB01"}'}});

  const c=get('cyber');
  c.ticket='IR-2026-023: CLIENT-23 launched encoded PowerShell from WINWORD.EXE and contacted 185.20.55.14:443. CLIENT-12 ran an approved interactive Get-Process command. Correlate process evidence, preserve the case telemetry with a SHA-256 integrity record, and isolate CLIENT-23 without deleting evidence. Verify isolation and evidence retention using the simulated Get-LabEndpoint and Get-LabEvidence PowerShell helpers.';
  task('cyber','c2process').dependencies=['c2alert'];
  c.tasks.splice(2,0,form('c2evidence','event','Preserve incident evidence',[
    text('case','Case reference'),select('handling','Evidence handling',['Export telemetry and record SHA-256','Delete logs after review','Reimage before collecting evidence'])
  ],{case:'IR-2026-023',handling:'Export telemetry and record SHA-256'},['c2process'],[['09:13','CLIENT-23','4688','WINWORD.EXE → powershell.exe -enc'],['09:14','CLIENT-23','Sysmon 3','185.20.55.14:443'],['09:15','CLIENT-12','4688','Approved interactive Get-Process']]));
  task('cyber','c2contain').dependencies=['c2evidence'];
  c.tasks.push(command('c2verify','powershell','Verify containment and evidence',{'get-labendpoint client-23':'CLIENT-23: Isolated\nExternal sessions: Blocked\nManagement telemetry: Retained','get-labevidence ir-2026-023':'Case: IR-2026-023\nProcess and network telemetry: Preserved\nSHA-256 integrity record: Recorded\nStatus: Ready for escalation'},['c2contain','c2evidence']));

  const cl=get('cloud');
  cl.ticket+=' The current route points to igw-01 and the database rule permits 0.0.0.0/0. Diagnose this exposure first, then verify the subnet, route, and database rule independently from CloudShell.';
  const diagnosis=form('cl2inspect','cloudconsole','Diagnose private-network exposure',[
    select('fault','Configuration fault',['Internet gateway route and public database rule','Insufficient disk capacity','Missing object versioning'])
  ],{fault:'Internet gateway route and public database rule'},[],[['APP-01 subnet','10.20.2.0/24'],['Default route','0.0.0.0/0 → igw-01'],['Database ingress','TCP 5432 from 0.0.0.0/0']]);diagnosis.service='network';cl.tasks.unshift(diagnosis);
  ['cl2subnet','cl2route','cl2sg'].forEach(id=>task('cloud',id).dependencies=['cl2inspect']);
  task('cloud','cl2verify').required.push('aws ec2 describe-subnets --region ca-central-1','aws ec2 describe-security-groups --group-ids sg-db --region ca-central-1');

  const i=get('integrated');
  i.apps.push('cmd','server');
  i.ticket='Commission the branch without granting excess privileges. Approved scope: 10.20.10.100–10.20.10.200 /24, gateway 10.20.10.1, DNS 192.168.10.53. branchportal.corp.local resolves to 10.20.2.20. Create mcole in Branch-Users and grant that group Modify access to Branch-Share. Isolate suspicious BR-PC07 and preserve its telemetry. Complete the private cloud network workstream, then renew and test a healthy branch client before handover. '+cl.ticket;
  i.tasks=i.tasks.filter(t=>!t.id.startsWith('cl2'));
  task('integrated','i2dhcp').fields.push(text('dns','DNS server option'));task('integrated','i2dhcp').expected.dns='192.168.10.53';
  i.tasks.splice(1,0,form('i2dns','dns','Publish the branch portal record',[text('name','Host name'),text('address','IPv4 address')],{name:'branchportal',address:'10.20.2.20'}));
  i.tasks.splice(3,0,form('i2share','server','Grant branch share access',[select('principal','Principal',['Branch-Users','Everyone','mcole']),select('permission','Branch-Share permission',['Read','Modify','Full Control'])],{principal:'Branch-Users',permission:'Modify'},['i2user']));
  task('integrated','i2alert').fields.push(select('evidence','Telemetry handling',['Preserve telemetry','Delete telemetry']));task('integrated','i2alert').expected.evidence='Preserve telemetry';
  i.tasks.push(...cl.tasks,command('i2lease','cmd','Renew the healthy branch client',{'ipconfig /renew':'BR-PC01 renewed: 10.20.10.114 /24\nGateway: 10.20.10.1\nDNS: 192.168.10.53'},['i2dhcp']),command('i2client','cmd','Verify branch services and membership',{'nslookup branchportal.corp.local':'Name: branchportal.corp.local\nAddress: 10.20.2.20','ping 10.20.2.20':'Reply from 10.20.2.20: 4 packets received, 0 lost','whoami /groups':'User: corp\\mcole\nGroups: Domain Users, Branch-Users\nBranch-Share effective access: Modify'},['i2lease','i2dns','i2user','i2share','cl2verify']));
  i.tasks.push(form('i2handover','endpoint','Complete the branch handover',[select('status','Handover status',['Branch ready; BR-PC07 remains isolated','Reconnect BR-PC07 without review','Grant all staff Domain Admins'])],{status:'Branch ready; BR-PC07 remains isolated'},['i2client','i2alert']));

  task('networking','n2inspect').why='Compare the observed DHCP options with the approved VLAN design before changing them. A wrong gateway or resolver breaks different parts of the client path.';
  task('sysadmin','s2recovery').why='Starting a service restores availability now. A bounded restart action helps recover a later failure without restarting the entire server; investigate the original crash as well.';
  task('cyber','c2evidence').why='Preserve process and network telemetry with a case reference and integrity record before destructive remediation. Isolation limits exposure while retaining evidence.';
  task('integrated','i2share').why='Grant Modify to the approved department group. Group-based permissions avoid individual ACL sprawl and do not require administrator membership.';
  const runtime=()=>lab.getRuntime();
  const active=()=>runtime().current.level===2;
  const block=(id,cmd='')=>{
    if(!active())return null;
    const {current,taskState}=runtime(),t=current.data.tasks.find(t=>t.id===id);
    const missing=(t?.dependencies||[]).filter(d=>!taskState[d]);
    if(!missing.length)return null;
    const names=missing.map(id=>current.data.tasks.find(t=>t.id===id)?.title||id).join('; ');
    const state=id==='s2verify'&&!taskState.s2svc?'W3SVC is stopped; HTTP 503. ':id==='c2verify'&&!taskState.c2contain?'Containment has not passed project validation. ':'';
    return state+'Not validated. Complete first: '+names+'. Then repeat this check.';
  };
  const base=window.PrempehEnterprise.commandFromState;
  window.PrempehEnterprise.commandFromState=(app,raw)=>{
    if(active()){
      const {current,taskState:done}=runtime(),cmd=raw.trim().toLowerCase();
      if((app==='cmd'||app==='powershell')&&['ipconfig','ipconfig /all'].includes(cmd)&&['networking','integrated'].includes(current.track)){
        const branch=current.track==='integrated',renewed=done[branch?'i2lease':'n2lease'];
        return renewed?`Ethernet adapter ${branch?'BR-PC01':'PC-14'}\nIPv4: ${branch?'10.20.10.114':'192.168.20.114'}\nSubnet mask: 255.255.255.0\nGateway: ${branch?'10.20.10.1':'192.168.20.1'}\nDNS: 192.168.10.53`:'Ethernet adapter\nIPv4: 169.254.22.41\nSubnet mask: 255.255.0.0\nGateway: (none)\nDNS: (none)\nRepair DHCP and run ipconfig /renew.';
      }
    }
    return base(app,raw);
  };
  window.PrempehLevelTwo={block,procedure:()=>runtime().current.data.tasks.map(t=>{
    const tool=runtime().APP_DEFS[t.app].label;
    return `Open ${tool}. ${t.title}. `+(t.type==='command'?'Run '+t.required.join('; ')+'.':Object.entries(t.expected).map(([k,v])=>k+' = '+v).join('; ')+'. Apply / Validate.');
  })};
})();
