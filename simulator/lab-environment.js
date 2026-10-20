/* Connected, reversible lab configuration. No host OS or real devices are accessed. */
(() => {
 'use strict';
 const rt=()=>PrempehDesktopLab.getRuntime(),copy=x=>JSON.parse(JSON.stringify(x)),norm=x=>String(x).trim().toLowerCase().replace(/\s+/g,' ');
 let configs={},proof={},power={},backups=[],events=[],mode='guided';
 const note=message=>{events.unshift({time:new Date().toISOString(),message});events=events.slice(0,100);};
 const task=id=>rt().current.data.tasks.find(t=>t.id===id);
 const deps=t=>t.dependencies||[];
 function reset(){configs={};proof={};power={};backups=[];events=[];note('Lab environment started');}
 function invalidate(id){
  const {current,taskState,terminalState}=rt(),affected=new Set([id]);
  let changed=true;while(changed){changed=false;current.data.tasks.forEach(t=>{if(!affected.has(t.id)&&deps(t).some(d=>affected.has(d))){affected.add(t.id);changed=true;}});}
  // Foundation command checks sometimes declare prerequisites in their validator, not in data.
  current.data.tasks.filter(t=>t.type==='command').forEach(t=>affected.add(t.id));
  affected.forEach(key=>{taskState[key]=false;delete proof[key];Object.values(terminalState).forEach(s=>Object.keys(s.seen||{}).filter(k=>k.startsWith(key+'|')).forEach(k=>delete s.seen[k]));});
  PrempehDesktopLab.refreshMission();window.dispatchEvent(new Event('prempeh-environment-change'));document.getElementById('vmComplete')?.classList.add('hidden');
 }
 function record(t,values){note('Validation passed: '+t.title);configs[t.id]=copy(values);proof[t.id]={id:t.id,values:copy(values)};}
 function evidence(){
  const {current,taskState,terminalState}=rt();
  return current.data.tasks.filter(t=>taskState[t.id]).map(t=>t.type==='form'?proof[t.id]:{id:t.id,commands:t.required.filter(c=>terminalState[t.app]?.seen?.[t.id+'|'+norm(c)])}).filter(Boolean);
 }
 function apply(t,values,win){
  if(power[t.app]===false)return 'Device is powered off. Restore power in Lab Environment before applying changes.';
  invalidate(t.id);configs[t.id]=copy(values);
  for(const [key,value] of Object.entries(values)){const f=win.querySelector(`[data-field="${t.id}:${key}"]`);if(f)f.value=value;}
  PrempehEnterprise?.beforeValidate?.(t.id,win);PrempehCloudLab?.validated?.(t,values);
  note('Applied configuration: '+t.title);return 'Changes applied to the lab. Run validation and diagnostics to check the result.';
 }
 function block(raw){
  if(!/^(ping|tracert|nslookup|test-|get-service|invoke-webrequest|aws )/i.test(raw.trim()))return null;
  const off=Object.keys(power).filter(k=>power[k]===false);
  if(off.length)return 'Connection failed: '+off.map(k=>rt().APP_DEFS[k]?.label||k).join(', ')+' is powered off. Open Lab Environment to restore power.';
  const tasks=rt().current.data.tasks,command=norm(raw),required=tasks.find(t=>t.required?.some(c=>norm(c)===command));
  const broken=tasks.filter(t=>t.type==='form'&&configs[t.id]&&Object.entries(t.expected).some(([k,v])=>norm(configs[t.id][k])!==norm(v)));
  if(command.startsWith('nslookup ')){
   const name=command.split(' ')[1],dns=tasks.find(t=>t.app==='dns'&&configs[t.id]&&[configs[t.id].name,configs[t.id].name+'.corp.local'].includes(name));
   if(dns&&(!rt().taskState[dns.id]||!required))return 'DNS answer from current configuration:\nName: '+name+'\nAddress: '+(configs[dns.id].address||'No A record')+'\nThis diagnostic reads the running record; validate the approved address before claiming recovery.';
  }
  const ipProbe=/^(ping|tracert) (\d+\.\d+\.\d+\.\d+)$/.exec(command);
  if(ipProbe){
   const networkFaults=broken.filter(t=>['network','dhcp','router','switch','firewall'].includes(t.app));
   if(networkFaults.length)return 'Request timed out. Path fault: '+networkFaults.map(t=>t.title).join('; ')+'.';
   const known=tasks.some(t=>Object.values(t.expected||{}).includes(ipProbe[2]));
   const lease=tasks.find(t=>t.required?.includes('ipconfig /renew'));
   if(known&&broken.length&&broken.every(t=>t.app==='dns')&&(!lease||rt().taskState[lease.id]))return 'Reply from '+ipProbe[2]+': bytes=32 time=2ms TTL=127\nIP connectivity works; name resolution is a separate check. Validation remains pending.';
  }
  if(required&&broken.length)return 'Verification failed. Active configuration differs from the approved design: '+broken.map(t=>t.title).join('; ')+'. Inspect the configured values in Lab Environment.';
  return null;
 }
 function dialog(title){const d=document.createElement('dialog');d.className='lab-environment-dialog';d.setAttribute('aria-label',title);const h=document.createElement('h2');h.textContent=title;d.append(h);d.addEventListener('close',()=>d.remove());document.body.append(d);return d;}
 function button(text,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;return b;}
 function paragraph(parent,text){const p=document.createElement('p');p.textContent=text;parent.append(p);return p;}
 function properties(t,win){
  const d=dialog(t.app==='dns'?'Host record properties':t.title+' — Properties'),form=document.createElement('form');
  paragraph(d,'Apply saves the configuration, including incorrect settings. Validate checks the ticket requirements.');
  t.fields.forEach(([key,label,type,options])=>{const row=document.createElement('label');row.textContent=label;const f=document.createElement(type==='select'?'select':'input');f.name=key;
   if(type==='select'){f.append(new Option('Select…',''));(options||[]).forEach(o=>f.append(new Option(o,o)));}
   else f.type='text';f.value=configs[t.id]?.[key]??win.querySelector(`[data-field="${t.id}:${key}"]`)?.value??'';row.append(f);form.append(row);
  });
  const status=paragraph(d,'');status.setAttribute('role','status');
  const save=()=>{const values=Object.fromEntries(new FormData(form));status.textContent=apply(t,values,win);};
  form.onsubmit=e=>{e.preventDefault();save();};d.insertBefore(form,status);
  d.append(button('Apply changes',save),button('Validate configuration',()=>{save();win.querySelector(`[data-submit-task="${t.id}"]`).click();status.textContent=win.querySelector(`[data-feedback="${t.id}"]`).textContent;}),button('Close',()=>d.close()));d.showModal();
 }
 function tools(win){
  if(win.querySelector('[data-native-properties]'))return;
  const tasks=rt().current.data.tasks.filter(t=>t.app===win.dataset.app&&t.type==='form');if(!tasks.length)return;
  const bar=document.createElement('div');bar.className='lab-tools';bar.dataset.nativeProperties='';
  const select=document.createElement('select');select.setAttribute('aria-label','Resource properties');tasks.forEach(t=>select.append(new Option(t.title,t.id)));
  const open=()=>properties(task(select.value),win);
  bar.append(select,button(win.dataset.app==='dns'?'New / Edit host (A)…':'Properties…',open));
  win.querySelector('.console-task-nav').after(bar);
  // A real context menu on the console tree opens the selected resource's property dialog.
  win.addEventListener('contextmenu',e=>{if(!e.target.closest('.pt-tree'))return;e.preventDefault();document.getElementById('lab-resource-menu')?.remove();const menu=document.createElement('div');menu.id='lab-resource-menu';menu.className='lab-resource-menu';menu.style.left=Math.min(e.clientX,innerWidth-240)+'px';menu.style.top=Math.min(e.clientY,innerHeight-120)+'px';menu.setAttribute('role','menu');
   tasks.forEach(t=>{const b=button((t.app==='dns'?'New host (A): ':'Properties: ')+t.title,()=>{menu.remove();properties(t,win);});b.setAttribute('role','menuitem');menu.append(b);});menu.append(button('Cancel',()=>menu.remove()));document.body.append(menu);menu.querySelector('button').focus();menu.onkeydown=e=>{if(e.key==='Escape')menu.remove();};
  });
 }
 function snapshot(){return {events:copy(events),configs:copy(configs),proof:copy(proof),power:copy(power),tasks:copy(rt().taskState),terminals:copy(rt().terminalState),enterprise:PrempehEnterprise.capture(),cloud:PrempehCloudLab.capture()};}
 function restore(saved){
  events=copy(saved.events||[]);configs=copy(saved.configs);proof=copy(saved.proof);power=copy(saved.power);
  Object.keys(rt().taskState).forEach(k=>rt().taskState[k]=!!saved.tasks[k]);
  Object.keys(rt().terminalState).forEach(k=>delete rt().terminalState[k]);Object.assign(rt().terminalState,copy(saved.terminals));
  PrempehEnterprise.restore(saved.enterprise);PrempehCloudLab.restore(saved.cloud);
  document.querySelectorAll('.vm-window[data-app] .vm-close').forEach(b=>b.click());PrempehDesktopLab.refreshMission();window.dispatchEvent(new Event('prempeh-environment-change'));document.getElementById('vmComplete')?.classList.add('hidden');note('Configuration backup restored');
 }
 function open(){
  const d=dialog('Lab Environment'),{current,APP_DEFS}=rt();
  paragraph(d,current.data.title+' · Connected training environment');
  paragraph(d,'Select a device to open its console. Power and configuration changes affect diagnostic checks. Backups restore this attempt; earned monthly points are not duplicated or removed.');
  const topology=document.createElement('div');topology.className='lab-network-path';topology.setAttribute('aria-label','Network path: workstation through access switch and router to application services');
  topology.textContent='Workstation ↔ Access switch ↔ Router / policy ↔ Application services';d.append(topology);
  const diagram=document.createElementNS('http://www.w3.org/2000/svg','svg');diagram.classList.add('lab-network-diagram');diagram.setAttribute('role','group');diagram.setAttribute('aria-label','Interactive lab topology');d.append(diagram);
  const map=document.createElement('div');map.className='lab-topology';d.append(map);
  const refresh=()=>{
   const ids=[...new Set(['cmd','switch','router',...current.data.apps])];
   const openConsole=id=>{if(power[id]===false){status.textContent='Power on this device first.';return;}d.close();PrempehDesktopLab.openApp(id);};
   diagram.replaceChildren();const height=Math.max(230,(ids.length-3)*90+20);diagram.setAttribute('viewBox','0 0 920 '+height);
   const positions=ids.map((id,i)=>({id,x:i<3?20+i*230:710,y:i<3?height/2-30:20+(i-3)*90}));
   const shape=(tag,attrs)=>{const e=document.createElementNS(diagram.namespaceURI,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e;};
   positions.slice(1).forEach((node,i)=>{const from=positions[i<2?i:2];diagram.append(shape('path',{d:`M ${from.x+180} ${from.y+30} H ${node.x-15} V ${node.y+30} H ${node.x}`,fill:'none',stroke:power[node.id]===false||power[from.id]===false?'#b64040':'#41819b','stroke-width':3}));});
   positions.forEach(node=>{const g=shape('g',{role:'button',tabindex:0,'aria-label':'Open '+APP_DEFS[node.id].label});
    g.append(shape('rect',{x:node.x,y:node.y,width:180,height:60,rx:8,fill:power[node.id]===false?'#fbe7e7':'#e7f2fa',stroke:'#587c94'}));
    const name=shape('text',{x:node.x+90,y:node.y+25,'text-anchor':'middle',fill:'#173b53','font-size':12});name.textContent=APP_DEFS[node.id].label.length>25?APP_DEFS[node.id].label.slice(0,23)+'…':APP_DEFS[node.id].label;
    const state=shape('text',{x:node.x+90,y:node.y+44,'text-anchor':'middle',fill:'#36586f','font-size':11});state.textContent=power[node.id]===false?'OFFLINE':'LINK UP';g.append(name,state);g.onclick=()=>openConsole(node.id);g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openConsole(node.id);}};diagram.append(g);
   });
   map.replaceChildren();ids.forEach(id=>{
    const tasks=current.data.tasks.filter(t=>t.app===id),card=document.createElement('article');card.className='lab-device';
    const title=document.createElement('h3');title.textContent=APP_DEFS[id].label;card.append(title);
    paragraph(card,power[id]===false?'Powered off':!tasks.length?'Online · infrastructure':tasks.every(t=>rt().taskState[t.id])?'Online · verified':'Online · requires verification');
    card.append(button('Open console',()=>openConsole(id)),button(power[id]===false?'Power on':'Power off',()=>{power[id]=power[id]===false;tasks.forEach(t=>invalidate(t.id));note((power[id]?'Powered on: ':'Powered off: ')+APP_DEFS[id].label);refresh();}),button('Restart',()=>{power[id]=true;tasks.forEach(t=>invalidate(t.id));note('Restarted: '+APP_DEFS[id].label);status.textContent='Restart complete. Configuration retained; rerun validation.';refresh();}));
    tasks.filter(t=>configs[t.id]).forEach(t=>{const info=document.createElement('details'),sum=document.createElement('summary'),pre=document.createElement('pre');sum.textContent=t.title+' — running configuration';pre.textContent=Object.entries(configs[t.id]).map(([k,v])=>k+': '+v).join('\n');info.append(sum,pre);card.append(info);});map.append(card);
   });
  };
  const status=paragraph(d,'');status.setAttribute('role','status');
  const select=document.createElement('select');select.setAttribute('aria-label','Configuration backup');
  const fill=()=>{select.replaceChildren();backups.forEach((b,i)=>select.append(new Option(b.name,String(i))));};fill();
  d.append(button('Create configuration backup',()=>{backups.push({name:'Backup '+(backups.length+1)+' · '+new Date().toLocaleTimeString(),data:snapshot()});fill();select.value=String(backups.length-1);status.textContent='Backup saved for this attempt.';}),select,button('Restore backup',()=>{const b=backups[Number(select.value)];if(!b){status.textContent='Create a backup first.';return;}restore(b.data);status.textContent='Restored '+b.name;refresh();}));
  const log=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Environment event log';log.append(summary);events.forEach(e=>paragraph(log,e.time+' · '+e.message));d.append(log,button('Close',()=>d.close()));refresh();d.showModal();
 }
 function mount(){const desktop=document.getElementById('vmDesktopIcons');if(!desktop||!rt().current.level)return;const b=button('Lab Environment',open);b.className='vm-desktop-icon';b.dataset.labEnvironment='';b.innerHTML='<span class="vm-icon-glyph">'+PrempehIcons.html('netstudio')+'</span><span>Lab Environment</span>';desktop.append(b);}
 document.addEventListener('DOMContentLoaded',()=>{PrempehDesktopLab.getCatalog().forEach(l=>{const ids=new Set(l.data.tasks.map(t=>t.id));l.data.tasks.forEach(t=>t.dependencies=[...new Set([...(t.dependencies||[]),...(PrempehEnterprise.prerequisites[t.id]||[])])].filter(id=>ids.has(id)));});});
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('#lab-resource-menu'))document.getElementById('lab-resource-menu')?.remove();});
 window.PrempehLabEnvironment={snapshot,restore,events:()=>copy(events),power:()=>copy(power),incident:app=>{power[app]=false;const all=rt().current.data.tasks,affected=all.filter(t=>t.app===app);(affected.length?affected:all.filter(t=>t.type==='command').length?all.filter(t=>t.type==='command'):all).forEach(t=>invalidate(t.id));note("Incident injected: "+app+" offline");},reset,record,evidence,tools,mount,open,block,isPowered:app=>power[app]!==false,configs:()=>copy(configs),commandEdit:(app,raw)=>{if(/^(vlan |name |switchport |ip route |no )/i.test(raw.trim()))rt().current.data.tasks.filter(t=>t.app===app&&t.type==='command'&&rt().taskState[t.id]).forEach(t=>invalidate(t.id));},assessment:()=>mode==='assessment',setMode:value=>{mode=value;document.getElementById('vmDesktop')?.classList.toggle('lab-assessment',mode==='assessment');}};
})();
