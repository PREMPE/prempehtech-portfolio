(function(){
'use strict';
const EXTRA=[
{id:'explorer',name:'File Explorer',icon:'📁'},{id:'thispc',name:'This PC',icon:'🖥️'},{id:'edge',name:'Microsoft Edge',icon:'🌐'},
{id:'notepad',name:'Notepad',icon:'📝'},{id:'taskmgr',name:'Task Manager',icon:'▦'},{id:'control',name:'Control Panel',icon:'⚙️'},
{id:'computer',name:'Computer Management',icon:'🗄️'},{id:'calc',name:'Calculator',icon:'🧮'},{id:'recycle',name:'Recycle Bin',icon:'♻️'}
];
let ez=900;
function q(s,r=document){return r.querySelector(s)}
function qa(s,r=document){return [...r.querySelectorAll(s)]}
function injectStyle(){
 if(document.getElementById('enterpriseShellStyle'))return;
 const s=document.createElement('style');s.id='enterpriseShellStyle';s.textContent=`
.vm-desktop{background:linear-gradient(145deg,#0b3960 0%,#0d5b8e 48%,#083352 100%)!important;background-image:radial-gradient(circle at 70% 28%,rgba(84,181,235,.22),transparent 28%),linear-gradient(145deg,#0b3960,#0d5b8e 48%,#083352)!important}
.vm-desktop-icons{grid-template-columns:repeat(2,86px)!important;gap:8px 6px!important;padding:16px!important;align-content:start!important}
.vm-desktop-icon{width:82px!important;min-height:78px!important;background:transparent!important;border:1px solid transparent!important;color:#fff!important;text-shadow:0 1px 3px #000;padding:6px 3px!important}
.vm-desktop-icon:hover,.vm-desktop-icon:focus{background:rgba(150,210,255,.18)!important;border-color:rgba(210,238,255,.45)!important}
.vm-icon-glyph{width:38px!important;height:38px!important;border-radius:5px!important;box-shadow:0 2px 6px #0005;font-size:12px!important}
.vm-mission{width:300px!important;right:14px!important;top:14px!important;max-height:calc(100% - 70px)!important;overflow:auto!important;box-shadow:0 8px 28px #0006!important;border:1px solid #aebdca!important}
.vm-mission.ticket-minimized{display:none!important}
.enterprise-ticket-controls{display:flex;gap:4px;position:absolute;right:7px;top:7px}
.enterprise-ticket-controls button{width:24px;height:22px;border:0;background:#e7edf2;border-radius:3px;cursor:pointer;font-weight:800;color:#263746}
.vm-mission-head{padding-right:55px!important;position:relative}
.vm-task-item>span:last-child br,.vm-task-item>span:last-child br+*{display:none}
.enterprise-guide{border-top:1px solid #ccd6df;background:#f7fafc}
.enterprise-guide-tabs{display:flex;border-bottom:1px solid #ccd6df}
.enterprise-guide-tabs button{flex:1;border:0;background:#e8eef3;padding:8px;font-weight:800;cursor:pointer}
.enterprise-guide-tabs button.active{background:#fff;color:#0c5f99}
.enterprise-guide-pane{padding:10px 12px;font-size:12px;line-height:1.45;color:#263746}
.enterprise-guide-pane ol{padding-left:20px;margin:4px 0}.enterprise-guide-pane li{margin:7px 0}
.enterprise-hint{padding:8px;border-left:3px solid #1687d2;background:#eef7fd;margin:7px 0}
.ticket-reopen{height:32px!important;margin:4px!important;padding:0 10px!important;background:#e7eef5!important;border:1px solid #9fb2c3!important;border-radius:4px!important;font-weight:800!important;cursor:pointer!important}
.enterprise-search-btn{width:38px;height:38px;border:0;background:transparent;color:white;font-size:18px;cursor:pointer}
.enterprise-start-search{padding:10px;background:#f4f6f8;border-bottom:1px solid #c8d2db}
.enterprise-start-search input{width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #8da0b1;border-radius:3px;font:13px Segoe UI,Arial}
.enterprise-extra-list{padding:5px 0}.enterprise-start-item{display:flex;align-items:center;gap:10px;padding:8px 14px;cursor:pointer;font:13px Segoe UI,Arial}.enterprise-start-item:hover{background:#dfeaf3}
.enterprise-start-item b{width:25px;text-align:center;font-size:17px}
.enterprise-window{position:absolute;left:260px;top:70px;width:min(720px,70%);height:480px;background:#fff;border:1px solid #60798c;box-shadow:0 12px 40px #0008;z-index:901;color:#1e2a33;font:13px 'Segoe UI',Arial;display:flex;flex-direction:column}
.enterprise-window.max{inset:0 0 42px 0!important;width:auto!important;height:auto!important}
.enterprise-title{height:34px;background:#f5f7f9;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #cad4dc;padding-left:10px;user-select:none}
.enterprise-title strong{font-weight:600}.enterprise-win-controls{display:flex;height:100%}.enterprise-win-controls button{width:42px;border:0;background:transparent;font-size:16px}.enterprise-win-controls button:hover{background:#dbe5ec}.enterprise-win-controls .x:hover{background:#c42b1c;color:#fff}
.enterprise-body{flex:1;overflow:auto;background:#fff}.enterprise-toolbar{padding:7px 10px;background:#f7f8fa;border-bottom:1px solid #d6dee5;display:flex;gap:8px;align-items:center}.enterprise-toolbar button{padding:5px 9px}
.explorer-layout{display:grid;grid-template-columns:170px 1fr;height:100%}.explorer-nav{background:#f6f8fa;border-right:1px solid #d8e0e6;padding:10px}.explorer-nav div{padding:7px;border-radius:3px}.explorer-nav div:hover{background:#e5eef5}.explorer-main{padding:18px}.file-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:12px}.file-tile{padding:14px 8px;text-align:center;border:1px solid transparent}.file-tile:hover{background:#eaf4fb;border-color:#b8d7ec}
.fake-browser-bar{display:flex;gap:7px;padding:8px;background:#edf1f4}.fake-browser-bar input{flex:1;padding:7px;border:1px solid #aebbc5;border-radius:4px}.browser-page{padding:30px}.browser-page h1{color:#0b5c8d}
.task-table{width:100%;border-collapse:collapse}.task-table th,.task-table td{padding:8px 12px;border-bottom:1px solid #e1e6ea;text-align:left}.task-table th{background:#f5f7f8}
.notepad-area{width:100%;height:100%;border:0;resize:none;outline:none;padding:12px;box-sizing:border-box;font:14px Consolas,monospace}
.calc{width:260px;margin:20px auto;background:#eef2f5;padding:8px}.calc input{width:100%;box-sizing:border-box;font-size:28px;text-align:right;padding:12px}.calc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:5px}.calc-grid button{height:48px;font-size:17px}
.enterprise-context{position:absolute;z-index:3000;background:#fff;border:1px solid #aaa;box-shadow:0 5px 18px #0005;width:190px;padding:5px 0;color:#222;font:13px Segoe UI}.enterprise-context div{padding:7px 18px}.enterprise-context div:hover{background:#e8f2fa}
@media(max-width:800px){.vm-mission{width:260px!important}.enterprise-window{left:8%!important;width:88%!important}.vm-desktop-icons{grid-template-columns:82px!important}}
`;document.head.appendChild(s)
}
const GUIDE_MAP={
 networking:{
 1:{target:"Bring PC-01 online with correct IPv4 settings, working gateway access, server connectivity, and DNS resolution.",steps:["Inspect the workstation's current Ethernet configuration and determine what is missing or incorrect.","Configure the workstation for the assigned user LAN without changing unrelated settings.","Test the local gateway first, then test the internal server to separate local from routed connectivity.","Verify that the internal service name resolves to the expected server.","Record what you changed and how you proved the repair."]},
 2:{target:"Restore DHCP and DNS for the Support VLAN so a client receives a valid lease and resolves files.corp.local.",steps:["Inspect the affected client's addressing symptoms before changing infrastructure.","Open DHCP administration and inspect the Support scope, address pool, gateway option, and DNS option.","Correct only the DHCP settings that do not match the network design.","Inspect the corp.local DNS zone and determine why the file server name cannot resolve.","Renew the client lease, test name resolution, and document the root cause."]},
 3:{target:"Separate users and servers with VLANs while preserving controlled inter-VLAN connectivity.",steps:["Inspect the current switch VLAN and trunk state before making changes.","Create the required user and server VLANs and verify their presence.","Configure the link that must carry multiple VLANs as a trunk.","Configure the Layer 3 gateway interfaces for both VLANs.","Test traffic between the required endpoints and verify segmentation still exists."]},
 4:{target:"Find why Finance cannot reach its application, correct the responsible policy, and prove service restoration.",steps:["Reproduce the failure and determine how far traffic travels.","Inspect routing and access-control policy at the point where traffic stops.","Identify the rule affecting Finance without changing unrelated policy.","Make the narrowest change that restores only the required access.","Retest the application path and document evidence and change."]},
 5:{target:"Restore Branch-to-HQ application access while preserving correct VPN and NAT behavior.",steps:["Establish the scope of the outage from the branch before changing routing.","Inspect routes, next hops, VPN-related traffic policy, and NAT behavior.","Determine which routing change caused the HQ network to become unreachable.","Repair the route and ensure private VPN traffic is exempt from translation.","Validate the complete path and document root cause, changes, and verification."]}
 },
 sysadmin:{
 1:{target:"Provision Jordan Lee correctly using role-based access and least privilege.",steps:["Locate the correct organizational unit and review existing naming conventions.","Create Jordan's domain account in the correct OU.","Add the account to the appropriate department security group instead of granting excessive privilege.","Grant Finance folder access through the role/group where possible.","Verify the effective access and record what was provisioned."]},
 2:{target:"Restore the intranet service and prove the Windows service remains correctly configured.",steps:["Review relevant Windows events and identify the service associated with the outage.","Open Services and inspect the service's current state and startup configuration.","Restore the affected service without changing unrelated services.","Use PowerShell to independently verify service health.","Document the failure evidence and recovery action."]},
 3:{target:"Deploy the Accounting workstation policy to the correct OU and prove that clients receive it.",steps:["Confirm the users/computers that should receive the policy and their OU placement.","Create the required Group Policy Object using an enterprise-readable name.","Configure the required drive mapping and policy settings.","Link the GPO only to the intended Accounting scope.","Refresh policy on a client and verify the resulting applied policy."]},
 4:{target:"Restore reliable domain authentication on DC02 and verify domain-controller discovery.",steps:["Correlate authentication and service events on DC02.","Determine whether the failure is service, DNS, network, or directory related.","Restore the responsible Windows service with the correct startup state.","Run domain-controller health and discovery checks.","Verify clients can locate authentication services and document the root cause."]},
 5:{target:"Repair the DNS/policy dependency causing enterprise Group Policy failures and prove client recovery.",steps:["Confirm the policy failure from the client perspective before changing infrastructure.","Inspect AD-integrated DNS records required for domain-controller discovery.","Correct the faulty record while preserving unrelated DNS data.","Confirm the required GPO is linked and enabled at the correct scope.","Force policy refresh, verify DNS/domain discovery, and document the dependency that failed."]}
 },
 cyber:{
 1:{target:"Determine whether the failed administrator logons are malicious and choose a safe first response.",steps:["Open the available security logs and identify the failed-logon event type.","Establish the targeted account, source, frequency, and time pattern.","Separate normal successful activity from the suspicious failures.","Classify the behavior based on evidence rather than the alert name alone.","Choose a response that protects the account and preserves evidence."]},
 2:{target:"Investigate encoded PowerShell on CLIENT-23, corroborate the alert, and contain the endpoint if warranted.",steps:["Find the endpoint alert and inspect host, process, severity, command line, and parent process.","Corroborate the endpoint alert with Windows process-creation evidence.","Determine whether the process chain is consistent with normal administration or suspicious execution.","Contain CLIENT-23 only after the evidence supports containment.","Verify isolation and record the evidence that justified your decision."]},
 3:{target:"Reduce remote-administration exposure and remove stale privileged access without disrupting legitimate management.",steps:["Inspect the current RDP exposure and identify the approved management network.","Create or correct the narrow firewall rule required for authorized administration.","Locate the stale privileged identity and verify it is the intended account.","Disable the stale account and preserve auditability.","Confirm the account change and validate that legitimate management access remains possible."]},
 4:{target:"Build a defensible incident timeline from multiple telemetry sources and contain the affected host.",steps:["Search authentication telemetry and identify the host involved in the suspicious sequence.","Correlate successful/failed logons with process creation and network activity by time.","Use host logs to confirm the suspicious process evidence.","Decide whether the events form one incident and identify the affected endpoint.","Contain the host while preserving telemetry and document the attack chain."]},
 5:{target:"Scope lateral movement across hosts, identify the abused account and pivot system, then contain without destroying evidence.",steps:["Build a chronological timeline across WS-17, APP-02, and DB-01.","Identify the account used for remote authentication and determine the likely origin.","Correlate remote service creation and network connections to establish the pivot host.","Determine which systems are confirmed affected versus merely contacted.","Contain the account and confirmed hosts in a defensible order, preserve evidence, and document scope."]}
 },
 integrated:{
 1:{target:"Restore Finance access, provision correct permissions, and safely triage the simultaneous authentication issue.",steps:["Restore the Finance workstation's network configuration and verify server reachability.","Grant the employee only the Finance access required for the job.","Review administrator authentication failures and identify the suspicious source/pattern.","Apply a safe security response without disrupting the restored business service.","Verify all three outcomes and record the work completed."]},
 2:{target:"Bring the new branch online, provision its employee, and investigate the suspicious endpoint activity.",steps:["Configure and verify branch DHCP addressing and gateway delivery.","Provision the approved branch user with least-privilege group membership.","Find the endpoint alert associated with the email-launched process.","Decide whether the activity is suspicious based on process evidence and contain if justified.","Verify branch operations and security state, then document the handoff."]},
 3:{target:"Deploy Engineering with network segmentation, centralized policy, and only the required application access.",steps:["Create and verify the Engineering VLAN before attaching policy dependencies.","Confirm the Engineering identity/OU scope and deploy its security baseline.","Inspect the required application flow and implement the narrow firewall allowance.","Test permitted application traffic and confirm unrelated access is not unintentionally opened.","Document the network, identity, and security controls as one deployment."]},
 4:{target:"Restore production availability while independently investigating and containing suspicious authentication activity.",steps:["Separate the service outage symptoms from the security alert instead of assuming one cause.","Use Windows events and service state to identify and restore the failed production service.","Investigate the suspicious authentication source in the security telemetry.","Contain the security threat while preserving evidence and keeping production available.","Verify both service recovery and containment, then document each root cause/action."]},
 5:{target:"Restore enterprise operations and scope a multi-system compromise involving routing, privilege, and PowerShell.",steps:["Establish a timeline and determine which operational and security symptoms may be connected.","Diagnose and restore the broken application-site route without masking security evidence.","Investigate the unauthorized privileged-group change and reverse unsafe access.","Scope encoded PowerShell and outbound activity on the affected application server.","Contain confirmed compromise, validate restored operations, and submit complete incident/resolution notes."]}
 }
};
function guideForCurrent(){return GUIDE_MAP[current?.track]?.[Number(current?.level)]||{target:current?.data?.ticket||"Complete the assigned project.",steps:(current?.data?.tasks||[]).map(t=>t.title)}}
function guidanceFor(title){
 const t=title.toLowerCase();
 if(t.includes('alert'))return 'Open the security tooling available on the workstation. Find the alert for the affected endpoint and inspect host, process, parent process, severity, and time.';
 if(t.includes('process'))return 'Use Windows logging to corroborate the alert. Look for process-creation evidence and compare the parent/child relationship.';
 if(t.includes('contain'))return 'After confirming suspicious activity, return to the endpoint security console and choose an action that stops network communication without destroying evidence.';
 if(t.includes('dhcp'))return 'Find the DHCP administration console, inspect the affected scope, and compare the lease range and options with the ticket.';
 if(t.includes('dns'))return 'Find the DNS administration console. Inspect the relevant zone and record rather than changing unrelated records.';
 if(t.includes('service'))return 'Use Windows administrative tools to inspect service state and startup type. Verify the change after recovery.';
 if(t.includes('group')||t.includes('account')||t.includes('user'))return 'Use the appropriate Active Directory administration console. Confirm the correct object and scope before making a change.';
 if(t.includes('vlan')||t.includes('route')||t.includes('acl'))return 'Open the network device console and inspect the current configuration before changing it. Validate after the change.';
 return 'Read the ticket, identify which Windows or network tool would normally expose this evidence, open it yourself, inspect first, then make the smallest justified change.';
}
function enhanceTicket(){
 const m=q('#vmMission');if(!m||m.dataset.enterprise==='1')return;
 m.dataset.enterprise='1';
 const head=q('.vm-mission-head',m);if(head){
   const c=document.createElement('div');c.className='enterprise-ticket-controls';c.innerHTML='<button title="Minimize ticket" data-ticket-min>—</button><button title="Close ticket" data-ticket-close>×</button>';head.appendChild(c);
   c.onclick=e=>{if(e.target.closest('button')){m.classList.add('ticket-minimized');ensureTicketButton()}}
 }
 const titles=qa('.vm-task-item strong',m).map(x=>x.textContent.trim()),guide=guideForCurrent();
 qa('.vm-task-item',m).forEach(li=>{const s=li.querySelector('span:last-child');if(s){const st=s.querySelector('strong');s.innerHTML='';s.appendChild(st)}});
 const ticket=q('.vm-ticket',m);if(ticket)ticket.innerHTML='<strong>Assigned role:</strong> '+current.data.role+'<br><br><strong>INCIDENT / REQUEST</strong><br>'+current.data.ticket+'<div style="margin-top:10px;padding:10px;background:#eaf4fb;border-left:4px solid #0877b9"><strong>TARGET</strong><br>'+guide.target+'</div>';
 const g=document.createElement('div');g.className='enterprise-guide';g.innerHTML='<div class="enterprise-guide-tabs"><button class="active" data-pane="steps">Steps</button><button data-pane="hints">Hints</button><button data-pane="notes">Notes</button></div><div class="enterprise-guide-pane" data-guide-pane="steps"><ol>'+guide.steps.map((x,i)=>'<li><b>Step '+(i+1)+'</b><br>'+x+'</li>').join('')+'</ol></div><div class="enterprise-guide-pane" data-guide-pane="hints" hidden><div class="enterprise-hint"><b>Hint 1 — Orient yourself</b><br>Start from Windows Start or Search. Decide which real application owns the evidence or setting you need.</div><div class="enterprise-hint"><b>Hint 2 — Investigate before changing</b><br>Inspect current state first. Do not change a setting merely because it appears in the project.</div><div class="enterprise-hint"><b>Hint 3 — Need stronger guidance?</b><br>'+titles.map(x=>'<b>'+x+':</b> '+guidanceFor(x)).join('<br><br>')+'</div></div><div class="enterprise-guide-pane" data-guide-pane="notes" hidden><label><b>Root cause / finding</b><textarea data-lab-note="root" style="width:100%;height:58px;box-sizing:border-box;margin:4px 0 8px"></textarea></label><label><b>Changes / response</b><textarea data-lab-note="change" style="width:100%;height:58px;box-sizing:border-box;margin:4px 0 8px"></textarea></label><label><b>Verification / evidence</b><textarea data-lab-note="verify" style="width:100%;height:58px;box-sizing:border-box;margin:4px 0 8px"></textarea></label></div>';
 m.appendChild(g);
 g.addEventListener('click',e=>{const b=e.target.closest('[data-pane]');if(!b)return;qa('[data-pane]',g).forEach(x=>x.classList.toggle('active',x===b));qa('[data-guide-pane]',g).forEach(x=>x.hidden=x.dataset.guidePane!==b.dataset.pane)});
 ensureTicketButton();
}
function ensureTicketButton(){
 const bar=q('#vmTaskbarApps');if(!bar||q('.ticket-reopen',bar))return;
 const b=document.createElement('button');b.className='ticket-reopen';b.textContent='▤ Project Ticket';b.onclick=()=>q('#vmMission')?.classList.remove('ticket-minimized');bar.prepend(b);
}
function enhanceIcons(){
 const box=q('#vmDesktopIcons');if(!box)return;
 EXTRA.forEach(a=>{if(q('[data-enterprise-app="'+a.id+'"]',box))return;const b=document.createElement('button');b.className='vm-desktop-icon';b.dataset.enterpriseApp=a.id;b.innerHTML='<span class="vm-icon-glyph">'+a.icon+'</span><span>'+a.name+'</span>';b.addEventListener('dblclick',()=>openExtra(a.id));box.appendChild(b)});
}
function enhanceStart(){
 const menu=q('#vmStartMenu');if(!menu||menu.dataset.enterprise==='1')return;menu.dataset.enterprise='1';
 const search=document.createElement('div');search.className='enterprise-start-search';search.innerHTML='<input type="search" placeholder="Type here to search">';
 menu.prepend(search);
 const list=document.createElement('div');list.className='enterprise-extra-list';list.innerHTML=EXTRA.map(a=>'<div class="enterprise-start-item" data-extra="'+a.id+'"><b>'+a.icon+'</b><span>'+a.name+'</span></div>').join('');menu.appendChild(list);
 list.onclick=e=>{const x=e.target.closest('[data-extra]');if(x){openExtra(x.dataset.extra);menu.classList.add('hidden')}};
 const input=q('input',search);input.addEventListener('input',()=>{const v=input.value.toLowerCase();qa('.vm-start-app,.enterprise-start-item',menu).forEach(x=>x.style.display=x.textContent.toLowerCase().includes(v)?'':'none')});
}
function enhanceTaskbar(){
 const start=q('#vmStart');if(!start)return;
 if(!q('.enterprise-search-btn')){
   const b=document.createElement('button');b.className='enterprise-search-btn';b.title='Search';b.textContent='⌕';start.after(b);b.onclick=()=>{const m=q('#vmStartMenu');m?.classList.remove('hidden');setTimeout(()=>q('.enterprise-start-search input',m)?.focus(),20)}
 }
}
function appBody(id){
 if(id==='notepad')return '<div class="enterprise-toolbar">File &nbsp; Edit &nbsp; Format &nbsp; View &nbsp; Help</div><textarea class="notepad-area" placeholder="Untitled - Notepad"></textarea>';
 if(id==='explorer'||id==='thispc')return '<div class="enterprise-toolbar"><button>←</button><button>→</button><button>↑</button><span>This PC &gt; Local Disk (C:)</span></div><div class="explorer-layout"><div class="explorer-nav"><b>Quick access</b><div>Desktop</div><div>Downloads</div><div>Documents</div><div>This PC</div><div>Network</div></div><div class="explorer-main"><h3>Folders</h3><div class="file-grid"><div class="file-tile">📁<br>Users</div><div class="file-tile">📁<br>Program Files</div><div class="file-tile">📁<br>Windows</div><div class="file-tile">📁<br>Logs</div></div></div></div>';
 if(id==='edge')return '<div class="fake-browser-bar"><button>←</button><button>↻</button><input value="https://intranet.corp.local"></div><div class="browser-page"><h1>CORP Intranet</h1><p>Internal company portal</p><hr><h3>Service status</h3><p>Directory Services: Online</p><p>File Services: Online</p><p>Help Desk: ext. 4400</p></div>';
 if(id==='taskmgr')return '<div class="enterprise-toolbar">Processes &nbsp; Performance &nbsp; Users &nbsp; Details &nbsp; Services</div><table class="task-table"><tr><th>Name</th><th>CPU</th><th>Memory</th></tr><tr><td>System</td><td>1.2%</td><td>18 MB</td></tr><tr><td>explorer.exe</td><td>0.4%</td><td>96 MB</td></tr><tr><td>svchost.exe</td><td>0.8%</td><td>72 MB</td></tr><tr><td>MsMpEng.exe</td><td>1.6%</td><td>184 MB</td></tr></table>';
 if(id==='control')return '<div class="explorer-main"><h2>Control Panel</h2><p>Adjust your computer settings</p><div class="file-grid"><div class="file-tile">🛡️<br>System and Security</div><div class="file-tile">🌐<br>Network and Internet</div><div class="file-tile">👤<br>User Accounts</div><div class="file-tile">🕒<br>Clock and Region</div><div class="file-tile">🧰<br>Administrative Tools</div></div></div>';
 if(id==='computer')return '<div class="explorer-layout"><div class="explorer-nav"><b>Computer Management</b><div>System Tools</div><div>Event Viewer</div><div>Shared Folders</div><div>Local Users and Groups</div><div>Device Manager</div><div>Storage</div><div>Services and Applications</div></div><div class="explorer-main"><h2>Computer Management (Local)</h2><p>Select an item in the console tree to view administrative information.</p></div></div>';
 if(id==='calc')return '<div class="calc"><input value="0" readonly><div class="calc-grid">'+['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','=','+'].map(x=>'<button>'+x+'</button>').join('')+'</div></div>';
 return '<div class="explorer-main"><h2>Recycle Bin</h2><p>This folder is empty.</p></div>';
}
function openExtra(id){
 const a=EXTRA.find(x=>x.id===id);if(!a)return;
 let w=q('.enterprise-window[data-extra-window="'+id+'"]');if(w){w.style.display='flex';w.style.zIndex=++ez;return}
 w=document.createElement('section');w.className='enterprise-window';w.dataset.extraWindow=id;w.style.zIndex=++ez;w.innerHTML='<div class="enterprise-title"><strong>'+a.icon+' &nbsp;'+a.name+'</strong><div class="enterprise-win-controls"><button data-min>—</button><button data-max>□</button><button class="x" data-close>×</button></div></div><div class="enterprise-body">'+appBody(id)+'</div>';
 q('#vmDesktop')?.appendChild(w);
 q('[data-close]',w).onclick=()=>w.remove();q('[data-min]',w).onclick=()=>w.style.display='none';q('[data-max]',w).onclick=()=>w.classList.toggle('max');
 const title=q('.enterprise-title',w);let drag=null;title.onmousedown=e=>{if(e.target.closest('button')||w.classList.contains('max'))return;drag={x:e.clientX-w.offsetLeft,y:e.clientY-w.offsetTop};w.style.zIndex=++ez};document.addEventListener('mousemove',e=>{if(drag){w.style.left=Math.max(0,e.clientX-drag.x)+'px';w.style.top=Math.max(0,e.clientY-drag.y)+'px'}});document.addEventListener('mouseup',()=>drag=null,{once:true});
}
function contextMenu(){
 const d=q('#vmDesktop');if(!d||d.dataset.ctx)return;d.dataset.ctx='1';d.addEventListener('contextmenu',e=>{if(e.target.closest('.vm-window,.enterprise-window,.vm-mission,.vm-taskbar'))return;e.preventDefault();q('.enterprise-context')?.remove();const m=document.createElement('div');m.className='enterprise-context';m.style.left=e.offsetX+'px';m.style.top=e.offsetY+'px';m.innerHTML='<div>View</div><div>Sort by</div><div>Refresh</div><hr><div>New</div><div>Display settings</div><div>Personalize</div>';d.appendChild(m);setTimeout(()=>document.addEventListener('click',()=>m.remove(),{once:true}),0)})}
function enhance(){
 injectStyle();
 if(!q('#desktopLabShell')||q('#desktopLabShell').classList.contains('hidden'))return;
 enhanceTicket();installProcedureCoach();enhanceIcons();enhanceStart();enhanceTaskbar();contextMenu(); qa('.vm-window').forEach(w=>{if(!w.dataset.enterpriseWired){w.dataset.enterpriseWired='1';wireEnterprise(w,w.dataset.app)}});
}
const obs=new MutationObserver(()=>setTimeout(enhance,0));obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('DOMContentLoaded',enhance);setInterval(enhance,1200);

/* ===== Stateful Enterprise Simulation Engine ===== */
const PT_SIM={state:null};
function seedState(){
 const lvl=Number(current?.level||1),track=current?.track||"networking";
 return {
  network:{ip:"169.254.22.41",mask:"255.255.0.0",gateway:"",dns:"",dhcp:true},
  dhcp:{start:"192.168.20.10",end:"192.168.20.50",router:"192.168.20.254",dns:"8.8.8.8",active:true,leases:[["PC-14","192.168.20.114"],["PC-18","192.168.20.118"],["PC-22","192.168.20.122"]]},
  dns:{records:{dc01:"172.16.10.99",intranet:"10.0.0.10",printer01:"10.0.0.31",hrportal:"10.0.0.42"}},
  services:{W3SVC:{status:"Stopped",startup:"Manual"},Netlogon:{status:"Stopped",startup:"Manual"},Spooler:{status:"Running",startup:"Automatic"},BITS:{status:"Running",startup:"Manual"},DNS:{status:"Running",startup:"Automatic"}},
  users:{jlee:{name:"Jordan Lee",ou:"Users",enabled:true,groups:["Domain Users"]},"legacy-admin":{name:"Legacy Admin",ou:"IT",enabled:true,groups:["Domain Admins"]},"helpdesk-temp":{name:"Helpdesk Temp",ou:"IT",enabled:true,groups:["Domain Admins"]},mcole:{name:"Maya Cole",ou:"Users",enabled:true,groups:["Domain Users"]}},
  gpos:[["Default Domain Policy","corp.local","Enabled"],["Workstation Security Baseline","corp.local","Disabled"],["Password Policy","corp.local","Enabled"]],
  endpoints:[["CLIENT-12","Healthy","Low","Connected"],["CLIENT-23","Alerted","High","Connected"],["CLIENT-44","Alerted","High","Connected"],["WS-17","Alerted","High","Connected"],["APP-02","Alerted","High","Connected"],["DB-01","Healthy","Low","Connected"],["APP-05","Alerted","High","Connected"]],
  routes:[["0.0.0.0/0","172.16.30.1"],["10.40.0.0/16","172.16.254.1"],["10.50.0.0/16","172.16.254.9"],["10.80.0.0/16","172.16.254.9"]],
  notes:{},track,lvl
 };
}
function sim(){if(!PT_SIM.state)PT_SIM.state=seedState();return PT_SIM.state}
function noiseEvents(){
 const a=[["6005","EventLog","Information","Event log service started","SRV-WEB01"],["7036","Service Control Manager","Information","BITS entered running state","SRV-WEB01"],["4624","Microsoft-Windows-Security","Information","Successful logon: jlee from 10.20.30.21","DC01"],["4672","Microsoft-Windows-Security","Information","Special privileges assigned to SYSTEM","DC01"],["5156","Filtering Platform","Information","Connection permitted","CLIENT-12"],["4688","Microsoft-Windows-Security","Information","chrome.exe parent explorer.exe","CLIENT-12"],["4625","Microsoft-Windows-Security","Warning","Failed logon: administrator from 10.20.30.77","DC01"],["4625","Microsoft-Windows-Security","Warning","Failed logon: administrator from 10.20.30.77","DC01"],["4688","Microsoft-Windows-Security","Warning","powershell.exe -enc SQBFAFgA... parent WINWORD.EXE","CLIENT-23"],["7045","Service Control Manager","Warning","RemoteUpdate service installed","APP-02"],["5719","NETLOGON","Error","No domain controller is available","DC02"],["7031","Service Control Manager","Error","World Wide Web Publishing Service terminated unexpectedly","SRV-WEB01"]];
 return a;
}
function enterpriseContent(id){
 const s=sim();
 if(id==="dhcp")return '<div class="pt-console"><div class="pt-tree"><b>DHCP</b><span>▾ DHCP01.corp.local</span><span>　▾ IPv4</span><span class="sel">　　▾ Support Scope [192.168.20.0]</span><span>　　　Address Pool</span><span>　　　Address Leases</span><span>　　　Reservations</span><span>　　　Scope Options</span><span>　Server Options</span></div><div class="pt-work"><h3>Support Scope</h3><div class="pt-tabs">Address Pool　Address Leases　Reservations　Scope Options</div><p><b>Status:</b> '+(s.dhcp.active?"Active":"Inactive")+'</p><table><tr><th>Setting</th><th>Current value</th></tr><tr><td>Address range</td><td>'+s.dhcp.start+' — '+s.dhcp.end+'</td></tr><tr><td>003 Router</td><td>'+s.dhcp.router+'</td></tr><tr><td>006 DNS Servers</td><td>'+s.dhcp.dns+'</td></tr></table><h4>Recent leases</h4><table>'+s.dhcp.leases.map(x=>'<tr><td>'+x[0]+'</td><td>'+x[1]+'</td><td>Active</td></tr>').join('')+'</table><p class="pt-tip">Use the project controls below to change configuration. The console above shows the environment state you are changing.</p></div></div>';
 if(id==="dns")return '<div class="pt-console"><div class="pt-tree"><b>DNS Manager</b><span>▾ DNS01</span><span>　▾ Forward Lookup Zones</span><span class="sel">　　corp.local</span><span>　Reverse Lookup Zones</span><span>　Conditional Forwarders</span></div><div class="pt-work"><h3>corp.local</h3><table><tr><th>Name</th><th>Type</th><th>Data</th></tr>'+Object.entries(s.dns.records).map(([k,v])=>'<tr><td>'+k+'</td><td>Host (A)</td><td>'+v+'</td></tr>').join('')+'</table></div></div>';
 if(id==="services")return '<div class="pt-work"><h3>Services (Local)</h3><table><tr><th>Name</th><th>Description</th><th>Status</th><th>Startup Type</th></tr>'+Object.entries(s.services).map(([k,v])=>'<tr><td>'+k+'</td><td>Windows service</td><td>'+v.status+'</td><td>'+v.startup+'</td></tr>').join('')+'</table></div>';
 if(id==="aduc")return '<div class="pt-console"><div class="pt-tree"><b>Active Directory Users and Computers</b><span>▾ corp.local</span><span>　Builtin</span><span>　Computers</span><span>　Domain Controllers</span><span class="sel">　Accounting</span><span>　HR</span><span>　IT</span><span>　Users</span></div><div class="pt-work"><h3>Directory Objects</h3><table><tr><th>Name</th><th>OU</th><th>State</th><th>Membership</th></tr>'+Object.entries(s.users).map(([k,v])=>'<tr><td>'+v.name+' ('+k+')</td><td>'+v.ou+'</td><td>'+(v.enabled?"Enabled":"Disabled")+'</td><td>'+v.groups.join(", ")+'</td></tr>').join('')+'</table></div></div>';
 if(id==="gpmc")return '<div class="pt-console"><div class="pt-tree"><b>Group Policy Management</b><span>▾ Forest: corp.local</span><span>　▾ Domains</span><span>　　▾ corp.local</span><span>　　　Accounting</span><span>　　　Engineering</span><span class="sel">　　　Group Policy Objects</span><span>　Group Policy Results</span></div><div class="pt-work"><h3>Group Policy Objects</h3><table><tr><th>GPO</th><th>Linked scope</th><th>Status</th></tr>'+s.gpos.map(x=>'<tr><td>'+x[0]+'</td><td>'+x[1]+'</td><td>'+x[2]+'</td></tr>').join('')+'</table></div></div>';
 if(id==="event")return '<div class="pt-console"><div class="pt-tree"><b>Event Viewer</b><span>Custom Views</span><span>▾ Windows Logs</span><span>　Application</span><span class="sel">　Security</span><span>　Setup</span><span>　System</span><span>Applications and Services Logs</span></div><div class="pt-work"><div class="pt-search"><input data-pt-filter placeholder="Filter Event ID, host, source, details"><button data-pt-filter-btn>Filter</button></div><table data-pt-events><tr><th>ID</th><th>Source</th><th>Level</th><th>Details</th><th>Host</th></tr>'+noiseEvents().map(r=>'<tr>'+r.map(x=>'<td>'+x+'</td>').join('')+'</tr>').join('')+'</table></div></div>';
 if(id==="siem"||id==="endpoint"){
  if(id==="endpoint")return '<div class="pt-work"><h3>Endpoint Security — Devices</h3><div class="pt-search"><input data-pt-edr-filter placeholder="Search device"><button data-pt-edr-search>Search</button></div><table><tr><th>Device</th><th>Health</th><th>Risk</th><th>Network state</th></tr>'+s.endpoints.map(x=>'<tr data-device="'+x[0]+'"><td><button class="pt-link" data-pt-device="'+x[0]+'">'+x[0]+'</button></td><td>'+x[1]+'</td><td>'+x[2]+'</td><td>'+x[3]+'</td></tr>').join('')+'</table><div data-pt-device-detail></div></div>';
  const rows=noiseEvents().concat([["09:13","EDR","High","CLIENT-44 powershell.exe -enc","CLIENT-44"],["09:14","Sysmon 3","High","185.20.55.14:443","CLIENT-44"],["10:05","4624 Type 3","Medium","WS-17 → APP-02 svc-backup","APP-02"],["10:08","4624 Type 3","High","APP-02 → DB-01 svc-backup","DB-01"]]);
  return '<div class="pt-work"><h3>Security Operations Console</h3><div class="pt-search"><input data-pt-siem-q placeholder="Search host, event, IP, process, account..."><button data-pt-siem-search>Search</button></div><p>Open alerts: 7　 High severity: 2　 Hosts reporting: 14</p><table data-pt-siem-table><tr><th>Time/Event</th><th>Source</th><th>Severity</th><th>Details</th><th>Host</th></tr>'+rows.map(r=>'<tr>'+r.map(x=>'<td>'+x+'</td>').join('')+'</tr>').join('')+'</table></div>';
 }
 if(id==="router")return '<div class="pt-work"><h3>R1 Routing & Policy State</h3><table><tr><th>Destination</th><th>Next hop</th></tr>'+s.routes.map(x=>'<tr><td>'+x[0]+'</td><td>'+x[1]+'</td></tr>').join('')+'</table><p>Interfaces: G0/0 UP · G0/0.10 UP · G0/0.20 UP · Tunnel0 UP</p></div>';
 return null;
}
function wireEnterprise(win,id){
 const body=win.querySelector('.vm-app-body');if(!body)return;
 const rich=enterpriseContent(id);if(rich){
  const old=body.innerHTML; body.innerHTML=rich+'<div class="pt-project-actions"><details><summary>Project change / verification controls</summary>'+old+'</details></div>';
 }
 const filt=win.querySelector('[data-pt-filter]');if(filt)win.querySelector('[data-pt-filter-btn]').onclick=()=>{const q=filt.value.toLowerCase();win.querySelectorAll('[data-pt-events] tr').forEach((r,i)=>{if(i)r.style.display=!q||r.textContent.toLowerCase().includes(q)?"":"none"})};
 const sq=win.querySelector('[data-pt-siem-q]');if(sq)win.querySelector('[data-pt-siem-search]').onclick=()=>{const q=sq.value.toLowerCase();win.querySelectorAll('[data-pt-siem-table] tr').forEach((r,i)=>{if(i)r.style.display=!q||r.textContent.toLowerCase().includes(q)?"":"none"})};
 win.querySelectorAll('[data-pt-device]').forEach(b=>b.onclick=()=>{const h=b.dataset.ptDevice,ep=sim().endpoints.find(x=>x[0]===h),d=win.querySelector('[data-pt-device-detail]');d.innerHTML='<div class="pt-device"><h3>'+h+'</h3><p><b>Network:</b> '+ep[3]+'　 <b>Risk:</b> '+ep[2]+'</p><h4>Recent process timeline</h4><p>'+((h==="CLIENT-23"||h==="CLIENT-44"||h==="APP-05")?"WINWORD.EXE → powershell.exe -enc SQBFAFgA...":"explorer.exe → chrome.exe")+'</p><button class="vm-native-btn" data-isolate="'+h+'">Isolate device</button></div>';d.querySelector('[data-isolate]').onclick=()=>{ep[3]="Isolated";toast(h+" isolated from network","good");wireEnterprise(win,id)}});
}
function syncEnterpriseState(taskId,win){
 const t=current?.data?.tasks?.find(x=>x.id===taskId);if(!t)return;
 const val=k=>win.querySelector('[data-field="'+taskId+':'+k+'"]')?.value||"";
 const s=sim();
 if(t.app==="network"){s.network.ip=val("ip")||s.network.ip;s.network.mask=val("mask")||s.network.mask;s.network.gateway=val("gateway")||s.network.gateway;s.network.dns=val("dns")||s.network.dns}
 if(t.app==="dhcp"){s.dhcp.start=val("start")||s.dhcp.start;s.dhcp.end=val("end")||s.dhcp.end;s.dhcp.router=val("router")||val("gateway")||s.dhcp.router;s.dhcp.dns=val("dns")||s.dhcp.dns}
 if(t.app==="dns"&&val("name"))s.dns.records[val("name").toLowerCase()]=val("address");
 if(t.app==="services"&&val("service")){let x=s.services[val("service")]||(s.services[val("service")]={status:"Stopped",startup:"Manual"});if(val("startup"))x.startup=val("startup");if(val("action")==="Start")x.status="Running";if(val("action")==="Stop")x.status="Stopped"}
 if(t.app==="aduc"){const u=val("username")||val("account");if(u){s.users[u]=s.users[u]||{name:val("display")||u,ou:val("ou")||"Users",enabled:true,groups:["Domain Users"]};if(val("ou"))s.users[u].ou=val("ou");if(val("group")&&!s.users[u].groups.includes(val("group")))s.users[u].groups.push(val("group"));if(val("state")==="Disabled"||String(val("action")).includes("disable"))s.users[u].enabled=false}}
}


function commandFromState(app,raw){
 const cmd=String(raw||"").trim().toLowerCase(),s=sim();
 if(cmd==="hostname")return "LAB-"+String(current?.track||"workstation").toUpperCase()+"01";
 if(cmd==="whoami")return "corp\\student";
 if(cmd==="ipconfig"||cmd==="ipconfig /all")return "Ethernet adapter Ethernet:\n   IPv4 Address . . . . . : "+s.network.ip+"\n   Subnet Mask  . . . . . : "+s.network.mask+"\n   Default Gateway . . . .: "+(s.network.gateway||"(none)")+"\n   DNS Servers . . . . . .: "+(s.network.dns||"(none)");
 if(cmd==="route print")return "IPv4 Route Table\n"+s.routes.map(x=>x[0]+"  via  "+x[1]).join("\n");
 if(cmd==="arp -a")return "Interface: "+s.network.ip+"\n  192.168.20.1     00-50-56-aa-10-01 dynamic\n  192.168.20.53    00-50-56-aa-10-53 dynamic";
 if(cmd==="show ip route")return "Codes: C - connected, S - static\n"+s.routes.map(x=>"S  "+x[0]+" via "+x[1]).join("\n");
 if(cmd==="show ip interface brief")return "Interface       IP-Address       Status Protocol\nG0/0            172.16.30.1      up     up\nG0/0.10         192.168.10.1     up     up\nG0/0.20         192.168.20.1     up     up\nTunnel0         172.16.254.1     up     up";
 if(cmd==="show vlan brief")return "VLAN Name             Status Ports\n1    default          active Gi0/1-23\n10   USERS            active Gi0/2-10\n20   SERVERS          active Gi0/11-20";
 if(cmd==="show interfaces trunk")return "Port    Mode   Encapsulation Status Native vlan\nGi0/24  on     802.1q        trunking 1";
 if(cmd==="show mac address-table")return "Vlan Mac Address       Type       Ports\n10   0050.56aa.1001    DYNAMIC    Gi0/3\n20   0050.56aa.2001    DYNAMIC    Gi0/12";
 if(cmd==="netstat -ano")return "Proto Local Address        Foreign Address       State       PID\nTCP   172.16.20.23:49712    185.20.55.14:443     ESTABLISHED 4312";
 return null;
}
const _ptOldRunTerminal=typeof runTerminal==="function"?runTerminal:null;
if(_ptOldRunTerminal){
 runTerminal=function(appId,raw,win){
  const out=commandFromState(appId,raw);
  if(out!==null){
   const box=win.querySelector("[data-terminal-output]"),prompt=appId==="powershell"?"PS C:\\Users\\Administrator>":appId==="switch"?"SW1#":appId==="router"?"R1#":"C:\\Users\\student>";
   box.textContent+=(box.textContent?"\n":"")+prompt+" "+raw+"\n"+out+"\n"+prompt;box.scrollTop=box.scrollHeight;return;
  }
  return _ptOldRunTerminal(appId,raw,win);
 }
}
const _ptOldValidate=typeof validateFormTask==="function"?validateFormTask:null;
if(_ptOldValidate){
 validateFormTask=function(taskId,win){syncEnterpriseState(taskId,win);const r=_ptOldValidate(taskId,win);setTimeout(()=>{const id=win.dataset.app;if(["dhcp","dns","services","aduc","gpmc","event","siem","endpoint","router"].includes(id)){win.dataset.enterpriseWired="";const body=win.querySelector(".vm-app-body");if(body){const rich=enterpriseContent(id);if(rich){const actions=body.querySelector(".pt-project-actions");if(actions){const saved=actions.innerHTML;body.innerHTML=rich+'<div class="pt-project-actions">'+saved+'</div>'}}}wireEnterprise(win,id)}},0);return r}
}
const _ptOldLaunch=typeof launch==="function"?launch:null;
if(_ptOldLaunch)launch=function(track,level){PT_SIM.state=null;return _ptOldLaunch(track,level)};


/* ===== Contextual Procedure Coach ===== */
function exactProcedure(){
 const g=guideForCurrent(),apps=(current?.data?.apps||[]),tasks=current?.data?.tasks||[];
 const open=id=>APP_DEFS[id]?.label||id;
 const procedures={
 networking:{
 1:["Click Start, search Network Connections, and open the network adapter settings.","Open Ethernet properties, select Internet Protocol Version 4 (TCP/IPv4), and open Properties.","Enter the assigned IPv4 address, subnet mask, default gateway, and DNS server, then apply the settings.","Open Command Prompt from Start/Search and run ipconfig /all to confirm the adapter configuration.","Run ping against the default gateway, then the required internal server.","Run nslookup for the required internal hostname and confirm the returned address."],
 2:["Click Start, search DHCP, and open DHCP Manager.","Expand the DHCP server, expand IPv4, and open the Support scope.","Open Address Pool and inspect the configured start and end addresses.","Open Scope Options and inspect option 003 Router and option 006 DNS Servers; correct values that do not match the project network.","Click Start, search DNS, open DNS Manager, expand Forward Lookup Zones, and open corp.local.","Inspect the files host A record and correct or create it for the required server address.","Return to the client, open Command Prompt, run ipconfig /renew, then run ipconfig /all.","Run nslookup files.corp.local and ping the required destination to verify service."],
 3:["Open the switch console and run show vlan brief.","Create/verify VLAN 10 and VLAN 20 using the required names.","Run show interfaces trunk and identify the uplink that must carry both VLANs.","Configure the uplink as an 802.1Q trunk and allow the required VLANs.","Open the router console and run show ip interface brief.","Configure the required gateway subinterfaces for VLAN 10 and VLAN 20.","Run ping tests between the required endpoints and recheck VLAN/trunk state."],
 4:["Open Command Prompt and reproduce the Finance failure with ping and tracert.","Open the router console and run show ip route to confirm the destination route.","Inspect the active access-control policy and locate the rule matching Finance traffic.","Compare source, destination, protocol, and action with the project requirement.","Correct only the responsible ACL entry and apply it.","Repeat tracert and ping to verify the path is restored."],
 5:["From the branch workstation, run ping and tracert toward the HQ application network.","Open the router console and run show ip route and show ip interface brief.","Identify the incorrect or missing route for the HQ destination and correct its next hop.","Open the firewall/VPN policy and inspect NAT treatment for branch-to-HQ private traffic.","Create or correct the NAT exemption required for VPN traffic.","Repeat tracert and ping, then verify the route table still contains the intended path."]},
 sysadmin:{
 1:["Click Start, search Active Directory Users and Computers, and open it.","Expand corp.local and open the Accounting organizational unit.","Right-click the correct OU, choose New → User, and create Jordan Lee using the required logon name.","Open Jordan Lee Properties → Member Of → Add and add the required Finance security group.","Open Server Manager/File Services and locate the Finance share permissions.","Grant access through the approved group/role and verify Jordan's effective access."],
 2:["Click Start, search Event Viewer, and open Windows Logs → System.","Filter/find the service failure event and identify the affected service name.","Click Start, search Services, and open Services.","Locate W3SVC, open Properties, set the required startup type, and start the service.","Open PowerShell and run Get-Service W3SVC.","Confirm Status is Running and compare it with the original event evidence."],
 3:["Click Start, search Group Policy Management, and open it.","Expand Forest → Domains → corp.local and identify the Accounting OU.","Right-click Group Policy Objects, create the required GPO, then edit it.","Navigate to the appropriate User Configuration preference/policy and configure the Finance F: drive mapping to \\\\FS01\\Finance.","Return to GPMC and link the GPO to the Accounting OU.","On the client, open PowerShell/Command Prompt and run gpupdate /force, then gpresult to verify application."],
 4:["Open Event Viewer and review System/Directory-related errors on DC02.","Open Services and inspect Netlogon and other required domain services.","Open Netlogon Properties, set the required startup state, and start the service.","Open PowerShell and run the required domain health check such as dcdiag.","Run nltest/domain-controller discovery to verify DC location.","Confirm the error condition no longer reproduces and domain authentication works."],
 5:["On the affected client, run nslookup dc01.corp.local and record the incorrect result.","Open DNS Manager → Forward Lookup Zones → corp.local.","Locate the dc01 Host (A) record and correct it to the required address.","Open Group Policy Management and verify the required GPO is linked/enabled at the intended OU.","On the client run ipconfig /flushdns, then nslookup again.","Run gpupdate /force and gpresult to verify policy recovery."]},
 cyber:{
 1:["Open Event Viewer/Security monitoring and locate Event ID 4625 failed logons.","Filter the events by the administrator account and review the source address and timestamps.","Count/compare repeated failures and check nearby successful logons for context.","Record the suspicious source and classify the pattern from the evidence.","Use the available response control to protect the account/source while preserving logs.","Verify the response and record the event IDs, account, source, and reasoning."],
 2:["Open Start/Search, launch Endpoint Security, and open Devices/Alerts.","Search for CLIENT-23 and open its device page.","Open the process timeline and inspect powershell.exe, its encoded command line, and parent WINWORD.EXE.","Open Event Viewer → Security and find the corresponding process-creation Event 4688.","Compare the endpoint process chain with the Windows event evidence.","Return to CLIENT-23 in Endpoint Security, choose Isolate device, and confirm.","Verify the device Network state changes from Connected to Isolated and record the evidence."],
 3:["Open the firewall/security console and inspect inbound Remote Desktop rules.","Locate TCP 3389 exposure and restrict the source to the approved management subnet.","Open Active Directory Users and Computers and locate legacy-admin.","Open the account properties and disable the stale privileged account.","Open Event Viewer/Security and verify the account-disable audit event.","Test/verify that approved management access remains permitted while other sources are denied."],
 4:["Open the SIEM and search for CLIENT-44 authentication activity.","Refine the search around the incident time and identify failed/successful logons.","Search CLIENT-44 process telemetry for powershell.exe and inspect its command line.","Search network/Sysmon telemetry for outbound connections from CLIENT-44.","Correlate the timestamps into one incident timeline.","Open Endpoint Security, locate CLIENT-44, isolate it, and verify isolation.","Record the authentication, process, and network evidence used for containment."],
 5:["Open the SIEM and search WS-17, APP-02, and DB-01 across the incident window.","Identify Type 3 network logons and the account used between systems.","Search APP-02 for service-creation Event 7045 and inspect the service details.","Search network telemetry for APP-02 connections to DB-01 on SMB/445.","Build the order WS-17 → APP-02 → DB-01 and distinguish confirmed compromise from contact.","Contain the abused account and confirmed affected endpoints using the available identity/EDR controls.","Verify containment states and document origin, pivot, account, affected systems, and preserved evidence."]},
 integrated:{
 1:["Open Network Connections and correct the Finance workstation's IPv4/gateway settings.","Open Command Prompt and verify gateway and Finance-server reachability.","Open Active Directory Users and Computers and grant the employee the required Finance group membership.","Verify Finance resource access using the corrected identity/network state.","Open security logs and investigate the administrator failed-logon source.","Apply the required response, then verify both business access and security state."],
 2:["Open DHCP Manager, create/correct the branch scope, and configure router/DNS scope options.","On the branch client run ipconfig /renew and verify the lease.","Open Active Directory Users and Computers and create the approved branch employee in the correct OU/group.","Open Endpoint Security and find the suspicious email-launched PowerShell alert.","Inspect the process chain, corroborate evidence, and isolate the endpoint if justified.","Verify branch addressing, user access, and endpoint containment."],
 3:["Open the switch/router tools and create/configure VLAN 30 for Engineering.","Verify VLAN/trunk/gateway state using the relevant show commands.","Open Group Policy Management, create/configure the Engineering policy, and link it to the Engineering OU.","Refresh policy on an Engineering client and verify application.","Open the firewall console and create the narrow HTTPS/443 application rule required by Engineering.","Test the permitted application flow and confirm unrelated traffic was not broadly allowed."],
 4:["Open Event Viewer and identify the production service failure on the affected server.","Open Services, restore the failed service, and verify it from PowerShell.","Open the SIEM and investigate the suspicious authentication source independently of the outage.","Correlate account, host, source, and time before deciding containment.","Use Endpoint Security/identity controls to contain the confirmed threat.","Verify production remains available after containment and document both workstreams."],
 5:["Open Command Prompt/router tools and reproduce the application-site network failure.","Inspect the route table, correct the responsible route, and verify connectivity.","Open Active Directory Users and Computers/Security logs and investigate the unauthorized Domain Admin membership.","Remove the unauthorized membership or disable the abused identity while preserving evidence.","Open the SIEM and scope APP-05 encoded PowerShell and outbound network activity.","Open Endpoint Security and contain confirmed affected systems.","Retest business connectivity and document routing root cause, privilege change, PowerShell evidence, containment, and verification."]}
 };
 return procedures[current?.track]?.[Number(current?.level)]||g.steps;
}
function procedureProgress(){
 const p=exactProcedure(),done=Object.values(taskState||{}).filter(Boolean).length,total=Math.max(1,Object.keys(taskState||{}).length);
 return Math.min(p.length-1,Math.floor(done/total*p.length));
}
function procedureHint(step){
 const p=exactProcedure(),txt=p[step]||p[0],low=txt.toLowerCase();
 if(low.includes("dhcp"))return "You are working on DHCP. Use Start/Search to find DHCP Manager, then work down the server → IPv4 → scope tree. Inspect before changing anything.";
 if(low.includes("dns")||low.includes("nslookup"))return "This step is about name resolution. DNS Manager changes records; nslookup tests what DNS actually returns.";
 if(low.includes("event"))return "Use Event Viewer filtering or Find. Event ID, host, account, source and timestamp are usually faster than reading every row.";
 if(low.includes("endpoint")||low.includes("isolate"))return "Open the device itself before taking action. Review its process/network evidence, then use the device action to isolate it.";
 if(low.includes("active directory")||low.includes("account")||low.includes("user"))return "Use Active Directory Users and Computers. Navigate the domain/OU tree first, then open the specific object or create it in the correct OU.";
 if(low.includes("group policy")||low.includes("gpo")||low.includes("gpupdate"))return "Use Group Policy Management for configuration/linking and gpupdate/gpresult on the client for verification.";
 if(low.includes("route")||low.includes("tracert")||low.includes("vlan")||low.includes("trunk"))return "Use the CLI to inspect current network state before configuring it. Show/display commands are safe investigation tools.";
 if(low.includes("command prompt")||low.includes("powershell")||low.includes("run "))return "Open the requested terminal from Start/Search and type the command exactly. Read the output before moving on.";
 return "Complete only this current procedure step. Use Start/Search to locate the named Windows or network tool, inspect the current state, then perform the stated action.";
}
function showMeText(step){
 const p=exactProcedure(),txt=p[step]||p[0];
 return "<b>Exact procedure</b><br>"+txt+"<br><br><b>Why it matters</b><br>This action changes or verifies the simulated system state required by the project. Read the resulting state/output before continuing.";
}
function installProcedureCoach(){
 const m=q("#vmMission");if(!m||m.dataset.procedureCoach)return;m.dataset.procedureCoach="1";
 const guide=q(".enterprise-guide",m);if(!guide)return;
 const steps=exactProcedure(),idx=procedureProgress();
 guide.innerHTML='<div class="enterprise-guide-tabs"><button class="active" data-pane="procedure">Procedure</button><button data-pane="hint">Hint</button><button data-pane="showme">Show Me / Explain</button><button data-pane="notes">Notes</button></div>'+
 '<div class="enterprise-guide-pane" data-guide-pane="procedure"><div style="padding:8px;background:#eaf4fb;border-left:4px solid #0877b9;margin-bottom:8px"><b>CURRENT STEP '+(idx+1)+' OF '+steps.length+'</b><br>'+steps[idx]+'</div><ol>'+steps.map((x,i)=>'<li style="'+(i===idx?'font-weight:700;background:#eef7ff;padding:5px':'')+'">'+x+'</li>').join("")+'</ol></div>'+
 '<div class="enterprise-guide-pane" data-guide-pane="hint" hidden><div class="enterprise-hint"><b>Hint for Step '+(idx+1)+'</b><br>'+procedureHint(idx)+'</div></div>'+
 '<div class="enterprise-guide-pane" data-guide-pane="showme" hidden><div class="enterprise-hint">'+showMeText(idx)+'</div></div>'+
 '<div class="enterprise-guide-pane" data-guide-pane="notes" hidden><label><b>Root cause / finding</b><textarea style="width:100%;height:55px"></textarea></label><label><b>Changes / response</b><textarea style="width:100%;height:55px"></textarea></label><label><b>Verification / evidence</b><textarea style="width:100%;height:55px"></textarea></label></div>';
 qa("[data-pane]",guide).forEach(b=>b.onclick=()=>{qa("[data-pane]",guide).forEach(x=>x.classList.remove("active"));b.classList.add("active");qa("[data-guide-pane]",guide).forEach(x=>x.hidden=x.dataset.guidePane!==b.dataset.pane)});
}

/* ===== End Stateful Enterprise Simulation Engine ===== */
})();