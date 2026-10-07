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
 const titles=qa('.vm-task-item strong',m).map(x=>x.textContent.trim());
 qa('.vm-task-item',m).forEach(li=>{const s=li.querySelector('span:last-child');if(s){const st=s.querySelector('strong');s.innerHTML='';s.appendChild(st)}});
 const g=document.createElement('div');g.className='enterprise-guide';g.innerHTML='<div class="enterprise-guide-tabs"><button class="active" data-pane="steps">Steps</button><button data-pane="hints">Hints</button></div><div class="enterprise-guide-pane" data-guide-pane="steps"><ol>'+titles.map(x=>'<li><b>'+x+'</b><br>'+guidanceFor(x)+'</li>').join('')+'</ol></div><div class="enterprise-guide-pane" data-guide-pane="hints" hidden><div class="enterprise-hint"><b>Hint 1 — Orient yourself</b><br>Start from the Windows Start menu or Search. Think about which real administrative application owns the evidence or setting.</div><div class="enterprise-hint"><b>Hint 2 — Investigate before changing</b><br>Open the relevant console and inspect its navigation tree, logs, objects, or current configuration first.</div><div class="enterprise-hint"><b>Hint 3 — Stuck?</b><br>The project steps above tell you the outcome required, not the click path. Use the application names in Windows Search if you cannot locate a tool.</div></div>';
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
 enhanceTicket();enhanceIcons();enhanceStart();enhanceTaskbar();contextMenu();
}
const obs=new MutationObserver(()=>setTimeout(enhance,0));obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('DOMContentLoaded',enhance);setInterval(enhance,1200);
})();