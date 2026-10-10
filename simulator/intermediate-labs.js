/* Stable project slot 6 is Level 2. Slots 1–5 remain the unchanged Level 1 catalogue. */
(() => {
  'use strict';
  const lab=window.PrempehDesktopLab;
  const text=(key,label)=>[key,label,'text'];
  const choice=(key,label,options)=>[key,label,'select',options];
  const form=(id,app,title,fields,expected,dependencies=[],evidence=[])=>({id,app,title,type:'form',fields,expected,dependencies,evidence,
    why:'Use the observed evidence and approved design to make the smallest effective change. Prerequisites must pass before downstream checks count.'});
  const check=(id,title,cmd,response,dependencies)=>({id,app:'powershell',title,type:'command',required:[cmd],responses:{[cmd]:response},dependencies});
  const approval=(prefix,dependency)=>form(prefix+'change','server','Record a controlled change and rollback plan',[
    choice('scope','Change scope',['Affected resources only','All production resources']),
    choice('rollback','Rollback plan',['Export current configuration before changes','Overwrite without a backup'])
  ],{scope:'Affected resources only',rollback:'Export current configuration before changes'},[dependency]);
  const handover=(prefix,deps,summary)=>form(prefix+'handover','server','Record operational handover',[
    text('case','Ticket reference'),choice('result','Evidence-based outcome',[summary,'Close without checking recovery']),
    choice('monitor','Follow-up',['Monitor for 30 minutes and attach validation results','No follow-up required'])
  ],{case:prefix.toUpperCase()+'-204',result:summary,monitor:'Monitor for 30 minutes and attach validation results'},deps);
  const register=(track,title,ticket,tags,tasks)=>lab.registerScenario(track,6,{
    title,role:'Intermediate '+lab.getTrackLabel(track)+' Operator',curriculumLevel:2,
    ticket:ticket+' Record ticket '+({networking:'NET',sysadmin:'SYS',cyber:'IR',cloud:'CLD',integrated:'OPS'}[track])+'-204 at handover. Use PowerShell command Get-LabState to inspect validated changes. Test-Lab* commands are PrempehTech simulation helpers, not operating-system commands. Export the current configuration before changes; monitor for 30 minutes and attach validation results after recovery.',
    tags,apps:[...new Set(tasks.map(t=>t.app))],tasks
  });
  register('networking','Restore a Segmented Application Path',
    'Finance VLAN 40 can reach its gateway but cannot use ledger.corp.local over HTTPS. The approved design is ledger → 10.60.8.20, with only TCP 443 permitted from 10.40.0.0/24; guest VLAN 90 must remain blocked. Correlate DNS, route, and firewall evidence. Preserve the existing route and all unrelated rules. Repair the stale DNS record and scoped policy, then prove both allowed and denied traffic.',
    ['DNS','Segmentation','Negative testing','Change control'],[
      form('netdiagnose','event','Correlate the failing network layers',[
        choice('cause','Root cause',['Stale DNS record and missing Finance HTTPS rule','Default gateway unavailable','Application service stopped'])
      ],{cause:'Stale DNS record and missing Finance HTTPS rule'},[],[
        ['Probe','FIN-PC24 → 10.40.0.1','Gateway','4 replies'],['DNS','ledger.corp.local','Resolver','10.60.8.99 (retired)'],
        ['Route','10.60.8.0/24 via 172.16.254.1','Edge','Active'],['Policy','Finance → 10.60.8.20:443','Firewall','Implicit deny'],['Health','10.60.8.20 /health','Server','HTTP 200']]),
      approval('net','netdiagnose'),
      form('netdns','dns','Correct the application record',[text('name','Host record'),text('address','IPv4 address')],{name:'ledger',address:'10.60.8.20'},['netchange']),
      form('netpolicy','firewall','Permit only the approved application path',[text('source','Source CIDR'),text('destination','Destination IPv4'),text('port','TCP destination port'),choice('action','Action',['Allow','Deny'])],{source:'10.40.0.0/24',destination:'10.60.8.20',port:'443',action:'Allow'},['netchange']),
      check('netresolve','Verify the repaired DNS answer','test-labdns ledger.corp.local','Resolver 192.168.10.53: ledger.corp.local → 10.60.8.20. PASS',['netdns']),
      check('netpositive','Verify Finance HTTPS end to end','test-labpath finance ledger 443','FIN-PC24 → gateway → active route → Finance HTTPS rule → ledger:443. HTTP 200. PASS',['netresolve','netpolicy']),
      check('netnegative','Verify guest isolation remains intact','test-labpath guest ledger 443','GUEST-PC09 → ledger:443 denied by guest isolation policy. Expected denial: PASS',['netpositive']),
      handover('net',['netpositive','netnegative'],'Finance restored; guest access remains blocked')
    ]);
  register('sysadmin','Recover Payroll Access Without Excess Privilege',
    'After a migration, payroll users receive Access denied and the scheduled export fails. Payroll-Staff needs Modify at both share and NTFS layers on PAYROLL-DATA. The export service must run as corp\\svc-payroll with Log on as a service, Automatic startup, and restart after 60 seconds on first failure. Do not grant Domain Admins or Everyone Full Control. Verify an authorized write and an unauthorized denial.',
    ['Effective permissions','Service identity','Recovery policy','Least privilege'],[
      form('sysdiagnose','event','Separate permission and service failures',[choice('cause','Root cause',['NTFS permission and service logon right are missing','Disk full','Domain controller offline'])],{cause:'NTFS permission and service logon right are missing'},[],[
        ['ACL','PAYROLL-DATA share','Payroll-Staff','Modify'],['ACL','PAYROLL-DATA NTFS','Payroll-Staff','Read'],['7038','PayrollExport','corp\\svc-payroll','Missing Log on as a service'],['Disk','PAYROLL-DATA','Free space','78%']]),
      approval('sys','sysdiagnose'),
      form('sysacl','server','Align share and NTFS permissions',[text('group','Security group'),choice('share','Share permission',['Read','Modify','Full Control']),choice('ntfs','NTFS permission',['Read','Modify','Full Control'])],{group:'Payroll-Staff',share:'Modify',ntfs:'Modify'},['syschange']),
      form('sysidentity','gpmc','Grant the service logon right',[text('account','Service account'),choice('right','Assigned right',['Log on as a service','Domain Admins membership'])],{account:'corp\\svc-payroll',right:'Log on as a service'},['syschange']),
      form('sysservice','services','Restore the export service with recovery',[choice('startup','Startup',['Automatic','Manual']),choice('status','State',['Running','Stopped']),choice('recovery','First failure',['Restart after 60 seconds','Restart the server'])],{startup:'Automatic',status:'Running',recovery:'Restart after 60 seconds'},['sysidentity']),
      check('syspositive','Verify payroll write and export','test-labpayroll authorized','Payroll-Staff: create/update file allowed. PayrollExport: Running as corp\\svc-payroll. Scheduled export: completed. PASS',['sysacl','sysservice']),
      check('sysnegative','Verify unauthorized access is denied','test-labpayroll unauthorized','Sales-Staff: payroll write denied. svc-payroll: no administrative membership. Expected restrictions: PASS',['syspositive']),
      handover('sys',['syspositive','sysnegative'],'Payroll write and export restored with least privilege')
    ]);
  register('cyber','Contain a Stolen Session and Preserve the Timeline',
    'Investigate IR-204 across identity, endpoint, and proxy evidence. At 08:40 a valid session for aowusu appeared from 198.51.100.24 without a new MFA prompt; FIN-LT08 then accessed a suspicious document and contacted 203.0.113.77. An approved scanner also generated a high-volume alert. Preserve the correlated timeline with a SHA-256 manifest, revoke the affected user sessions, isolate the affected laptop while retaining management telemetry, and block only the malicious destination. Verify both containment and the scanner exception.',
    ['Session revocation','Evidence correlation','Endpoint containment','False positives'],[
      form('irdiagnose','siem','Scope the affected identity and endpoint',[text('identity','Affected identity'),text('host','Affected host'),choice('scanner','Scanner alert assessment',['Approved scanner; retain evidence','Isolate all scan targets'])],{identity:'aowusu',host:'FIN-LT08',scanner:'Approved scanner; retain evidence'},[],[
        ['08:40','Session reuse','aowusu','198.51.100.24; no new MFA'],['08:42','Document child process','FIN-LT08','powershell from document viewer'],['08:43','Outbound connection','FIN-LT08','203.0.113.77:443'],['08:44','Port scan','SCAN-01','Approved change CHG-118']]),
      form('irevidence','event','Preserve the correlated case evidence',[text('case','Case reference'),choice('export','Evidence package',['Identity, process and proxy logs with SHA-256 manifest','Screenshots only','Delete the source logs'])],{case:'IR-204',export:'Identity, process and proxy logs with SHA-256 manifest'},['irdiagnose']),
      form('iridentity','aduc','Revoke the stolen session',[text('user','Identity'),choice('action','Identity response',['Revoke all active sessions and require credential reset','Reset password only'])],{user:'aowusu',action:'Revoke all active sessions and require credential reset'},['irevidence']),
      form('irisolate','endpoint','Isolate the affected endpoint',[text('host','Host'),choice('mode','Containment',['Isolate with management telemetry retained','Disconnect every endpoint'])],{host:'FIN-LT08',mode:'Isolate with management telemetry retained'},['irevidence']),
      form('irblock','firewall','Block the malicious destination',[text('destination','Destination IPv4'),choice('action','Action',['Block','Allow'])],{destination:'203.0.113.77',action:'Block'},['irevidence']),
      check('irverify','Verify coordinated containment','test-labincident ir-204','aowusu: old sessions rejected. FIN-LT08: isolated; management telemetry retained. 203.0.113.77: blocked. Evidence manifest retained. PASS',['iridentity','irisolate','irblock']),
      check('irnegative','Verify the approved scanner stays available','test-labscanner scan-01','SCAN-01: approved scanning operational. Unrelated accounts unchanged. No blanket isolation. PASS',['irverify']),
      handover('ir',['irverify','irnegative'],'Containment verified; preserved evidence escalated')
    ]);
  register('cloud','Recover a Private Cloud Workload Across Zones',
    'The private claims API lost one zone and clients see intermittent 503 errors. The remaining target listens on HTTPS 8443 at /ready but the load balancer checks HTTP 80 at /. Restore capacity across ca-central-1a and ca-central-1b with minimum/desired 2 and maximum 4. Permit 8443 only from sg-claims-alb, use the correct readiness endpoint, and alert ops-alerts after two 60-second periods with fewer than two healthy targets. Validate healthy service and no direct Internet ingress. Use Server Manager for the generic PrempehTech cloud resource dialogs.',
    ['Multi-zone recovery','Readiness checks','Private ingress','Monitoring'],[
      form('clddiagnose','event','Correlate capacity and readiness evidence',[choice('cause','Cause',['Single-zone capacity and wrong readiness check','Public DNS failure','Expired user password'])],{cause:'Single-zone capacity and wrong readiness check'},[],[
        ['Capacity','claims-api','ca-central-1a','1 target; zone degraded'],['Health check','HTTP 80 /','Load balancer','Connection refused'],['Local probe','HTTPS 8443 /ready','Application','HTTP 200'],['Ingress','TCP 8443','Instance group','0.0.0.0/0']]),
      approval('cld','clddiagnose'),
      form('cldcapacity','server','Restore resilient private capacity',[choice('zones','Zones',['ca-central-1a,ca-central-1b','ca-central-1a']),text('min','Minimum'),text('desired','Desired'),text('max','Maximum'),choice('public','Public IPs',['Disabled','Enabled'])],{zones:'ca-central-1a,ca-central-1b',min:'2',desired:'2',max:'4',public:'Disabled'},['cldchange']),
      form('cldhealth','server','Repair readiness and scoped ingress',[choice('protocol','Protocol',['HTTPS','HTTP']),text('port','Port'),text('path','Readiness path'),text('source','Allowed source group')],{protocol:'HTTPS',port:'8443',path:'/ready',source:'sg-claims-alb'},['cldchange']),
      form('cldalarm','server','Create a service availability alarm',[text('threshold','Healthy targets below'),text('period','Period seconds'),text('evaluations','Consecutive periods'),text('topic','Notification topic')],{threshold:'2',period:'60',evaluations:'2',topic:'ops-alerts'},['cldcapacity','cldhealth']),
      check('cldverify','Verify service readiness across zones','test-labcloud claims-api readiness','Two healthy targets in ca-central-1a and ca-central-1b. HTTPS 8443 /ready: HTTP 200. ops-alerts notification test delivered in simulation. PASS',['cldcapacity','cldhealth','cldalarm']),
      check('cldnegative','Verify direct Internet traffic is rejected','test-labcloud claims-api exposure','Public addressing disabled. Direct Internet → 8443: denied. sg-claims-alb → 8443: permitted. PASS',['cldverify']),
      handover('cld',['cldverify','cldnegative'],'Private multi-zone service recovered and monitored')
    ]);
  register('integrated','Recover a Warehouse During an Identity Incident',
    'Warehouse staff cannot use dispatch while a service identity is being abused. The service owner confirms dispatch-api should run as corp\\svc-dispatch-v2; retired svc-dispatch is no longer used by legitimate workloads. DNS must map dispatch.corp.local to 10.72.4.20 and warehouse VLAN 72 (10.72.0.0/24) may reach only TCP 443 on that host. Collect identity and proxy evidence, disable the retired identity and revoke its sessions, restore the approved application path, then verify dispatch and containment together. Preserve guest isolation. Coordinate rollback before service changes.',
    ['Cross-team incident','Identity containment','DNS','Scoped access','Business validation'],[
      form('opsdiagnose','siem','Identify the independent operational and security faults',[choice('fault','Incident scope',['Stale DNS plus missing warehouse rule and retired identity abuse','Whole domain compromised','Warehouse clients need administrator rights'])],{fault:'Stale DNS plus missing warehouse rule and retired identity abuse'},[],[
        ['DNS','dispatch.corp.local','Resolver','10.72.4.99 retired'],['Policy','10.72.0.0/24 → 10.72.4.20:443','Firewall','Denied'],['Identity','svc-dispatch','External session','203.0.113.44'],['Owner confirmation','dispatch-api','Approved account','corp\\svc-dispatch-v2']]),
      form('opsevidence','event','Preserve the combined incident timeline',[text('case','Case reference'),choice('package','Evidence package',['Identity and proxy logs with SHA-256 manifest','Clear logs'])],{case:'OPS-204',package:'Identity and proxy logs with SHA-256 manifest'},['opsdiagnose']),
      approval('ops','opsevidence'),
      form('opsidentity','aduc','Contain the retired service identity',[text('account','Retired identity'),choice('action','Action',['Disable and revoke sessions','Disable only'])],{account:'svc-dispatch',action:'Disable and revoke sessions'},['opschange']),
      form('opsdns','dns','Publish the approved dispatch address',[text('name','Host record'),text('address','IPv4 address')],{name:'dispatch',address:'10.72.4.20'},['opschange']),
      form('opspolicy','firewall','Restore the scoped warehouse rule',[text('source','Source CIDR'),text('destination','Destination IPv4'),text('port','TCP port')],{source:'10.72.0.0/24',destination:'10.72.4.20',port:'443'},['opschange']),
      form('opsservice','services','Confirm the replacement workload identity',[text('account','Service account'),choice('status','dispatch-api state',['Running','Stopped'])],{account:'corp\\svc-dispatch-v2',status:'Running'},['opsidentity']),
      check('opsbusiness','Validate the warehouse transaction','test-labdispatch transaction','dispatch.corp.local → 10.72.4.20. Warehouse HTTPS: permitted. Test order created and read back using svc-dispatch-v2. PASS',['opsdns','opspolicy','opsservice']),
      check('opssecurity','Validate containment and segmentation','test-labdispatch security','svc-dispatch: disabled; prior sessions rejected. Guest → dispatch: denied. Evidence manifest retained. PASS',['opsbusiness','opsevidence','opsidentity']),
      handover('ops',['opsbusiness','opssecurity'],'Dispatch recovered; retired identity contained; guests blocked')
    ]);
  const runtime=()=>lab.getRuntime();
  const active=()=>runtime().current.data?.curriculumLevel===2;
  const block=id=>{
    if(!active())return null;
    const {current,taskState}=runtime(),task=current.data.tasks.find(t=>t.id===id);
    const missing=(task?.dependencies||[]).filter(key=>!taskState[key]);
    return missing.length?'Not validated. Complete first: '+missing.map(key=>current.data.tasks.find(t=>t.id===key).title).join('; ')+'. Repeat this check after repair.':null;
  };
  const base=window.PrempehEnterprise.commandFromState;
  window.PrempehEnterprise.commandFromState=(app,raw)=>{
    if(!active())return base(app,raw);
    if(app==='powershell'&&raw.trim().toLowerCase()==='get-labstate'){
      const {current,taskState}=runtime();
      return 'PrempehTech simulated change ledger\n'+current.data.tasks.map(t=>`${taskState[t.id]?'VALIDATED':'PENDING'}: ${t.title}${taskState[t.id]&&t.expected?' — '+Object.entries(t.expected).map(([k,v])=>k+'='+v).join('; '):''}`).join('\n');
    }
    // Required commands fall through to the core validator, which enforces dependencies.
    return null;
  };
  window.PrempehIntermediate={block,procedure:()=>runtime().current.data.tasks.map(t=>
    `Open ${runtime().APP_DEFS[t.app].label}. ${t.title}. `+(t.type==='command'?'Run '+t.required.join('; ')+'.':'Use the ticket and evidence, then Apply / Validate.'))};
})();
