/* Attempt recovery and evidence are training aids; server verification still controls points. */
(() => {
 'use strict';
 const rt=()=>PrempehDesktopLab.getRuntime(),env=()=>PrempehLabEnvironment;
 let active=null,started='',mistakes=[],incident=null,skip=false,paused=false;
 const month=()=>new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',timeZone:'America/Toronto'}).format(new Date());
 const key=()=>`prempeh-attempt-v1:${PrempehCloud.playerKey()}:${rt().current.track}:${rt().current.level}:${month()}`;
 const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e};
 const btn=(text,fn)=>{const b=node('button',text);b.type='button';b.onclick=fn;return b};
 function modal(title){const d=node('dialog');d.className='lab-environment-dialog';d.setAttribute('aria-label',title);d.append(node('h2',title));document.body.append(d);d.addEventListener('close',()=>d.remove());return d;}
 function save(){
  if(paused||!active||active!==key()||!rt().current.level)return;
  try{const windows=[...document.querySelectorAll('.vm-window[data-app]')].map(w=>({app:w.dataset.app,style:w.getAttribute('style'),classes:['maximized','hidden','workspace-snap-left','workspace-snap-right'].filter(c=>w.classList.contains(c)),fields:[...w.querySelectorAll('[data-field]')].map(f=>[f.dataset.field,f.value])}));
   localStorage.setItem(active,JSON.stringify({version:1,started,mistakes,incident,snapshot:env().snapshot(),windows}));
  }catch{const status=document.querySelector('[data-attempt-status]');if(status)status.textContent='Could not save: browser storage is unavailable or full.';}
 }
 function discard(){if(active)localStorage.removeItem(active);active=null;skip=true;}
 function launched(){
  paused=false;active=key();started=new Date().toISOString();mistakes=[];incident=null;
  let saved;try{saved=JSON.parse(localStorage.getItem(active))}catch{}
  const mount=()=>{const desktop=document.getElementById('vmDesktopIcons');for(const [title,icon,fn] of [['Save attempt','files',save],['Evidence & incidents','netstudio',evidence],['Progress report','notepad',report],['Player dashboard','edge',()=>PrempehPlayerDashboard.open()]]){const b=btn(title,fn);b.className='vm-desktop-icon';b.replaceChildren();const glyph=node('span');glyph.className='vm-icon-glyph';glyph.innerHTML=PrempehIcons.html(icon);b.append(glyph,node('span',title));desktop.append(b);}const status=node('p');status.dataset.attemptStatus='';desktop.append(status);};
  mount();
  if(skip){skip=false;return;}
  if(!saved||saved.version!==1||Object.values(saved.snapshot?.tasks||{}).every(Boolean))return;
  paused=true;const d=modal('Resume saved lab');d.addEventListener('cancel',e=>e.preventDefault());d.append(node('p','Restore your configuration, notes, checks and windows from this browser, or start a fresh attempt. Monthly credit is still checked by the server.'));
  d.append(btn('Resume attempt',()=>{try{env().restore(saved.snapshot);started=saved.started;mistakes=saved.mistakes||[];incident=saved.incident;for(const w of saved.windows||[]){if(!rt().APP_DEFS[w.app])continue;PrempehDesktopLab.openApp(w.app);const el=document.querySelector(`.vm-window[data-app="${w.app}"]`);if(!el)continue;for(const c of w.classes||[])if(['maximized','hidden','workspace-snap-left','workspace-snap-right'].includes(c))el.classList.add(c);for(const [id,value] of w.fields||[]){const f=[...el.querySelectorAll('[data-field]')].find(x=>x.dataset.field===id);if(f)f.value=value;} // Geometry is applied as individual bounded properties, never as arbitrary saved CSS.
    const geometry=document.createElement('div');geometry.setAttribute('style',w.style||'');for(const prop of ['left','top','width','height']){const v=geometry.style[prop];if(/^\d+(\.\d+)?(px|%)$/.test(v))el.style[prop]=v;}
   }paused=false;d.close();save();}catch{d.append(node('p','This saved attempt cannot be restored. Start fresh.'));}}),btn('Start fresh',()=>{localStorage.removeItem(active);paused=false;d.close();save();}));d.showModal();
 }
 function evidence(){
  const d=modal('Operations evidence & incident challenges');
  const draw=()=>{
   d.replaceChildren(node('h2','Operations evidence & incident challenges'));
   const {current,taskState,APP_DEFS}=rt(),power=env().power();
   d.append(node('h3','Support ticket'),node('p',current.data.ticket),node('h3','Live monitoring and diagnostic trace'));
   d.append(node('p','Simulated observations from this attempt, not traffic captured from a real network. Refresh after making changes.'));
   for(const t of current.data.tasks){const state=power[t.app]===false?'CRITICAL · device offline':taskState[t.id]?'OK · acceptance check passed':'WARNING · check pending';d.append(node('p',APP_DEFS[t.app].label+' → '+t.title+': '+state));}
   const running=env().configs();
   const trace=node('pre');trace.textContent='SIMULATED PACKET TRACE · '+new Date().toISOString()+'\n';
   for(const t of current.data.tasks.filter(t=>t.app==='dns'&&running[t.id])){const c=running[t.id];trace.textContent+='UDP/53 client → DNS: query '+(c.name||c.host||'configured host')+'\nDNS → client: '+(power.dns===false?'timeout':c.address?'A '+c.address:'record requires inspection')+'\n';}
   trace.textContent+='ICMP client → gateway: '+(power.switch===false?'no access link':power.router===false?'timeout':'link reachable')+'\nTCP client → application: '+(current.data.apps.some(app=>power[app]===false)?'connection timeout':'run application acceptance checks');d.append(trace);
   const offline=Object.keys(power).filter(k=>power[k]===false);d.append(node('pre',offline.length?'PROBE client → gateway → service\nDROP: '+offline.join(', ')+' offline\nRESPONSE: timeout':'PROBE client → gateway → service\nLINK: up\nAPPLICATION: '+(current.data.tasks.every(t=>taskState[t.id])?'verified':'awaiting acceptance checks')));
   d.append(node('h3','Event log'));for(const e of env().events())d.append(node('p',e.time+' · '+e.message));
   if(incident)d.append(node('p','Incident: '+incident.title+' · '+(power[incident.app]===false?'Active — open Lab Environment, power on the affected device, then rerun its checks.':'Power restored — rerun affected acceptance checks.')));
   if((current.data.curriculumLevel||1)===3){d.append(node('h3','Optional incident challenge'),node('p','Introduces a real fault in this simulated environment. No extra competition points. A backup is captured so you can end the challenge.'));
    if(!incident)for(const [title,app] of [['Access switch outage','switch'],['Gateway outage','router'],['Application server outage',current.data.apps[0]]])d.append(btn(title,()=>{incident={title,app,before:env().snapshot()};env().incident(app);save();draw();}));
    else d.append(btn('End challenge / restore configuration',()=>{env().restore(incident.before);incident=null;save();draw();}));
   }
   d.append(btn('Refresh evidence',draw),btn('Open Lab Environment',()=>{d.close();env().open();}),btn('Close',()=>d.close()));
  };draw();d.showModal();
 }
 function report(){const {current,taskState}=rt(),d=modal('Lab progress report');const lines=[current.data.title,'Started: '+started,'Report: '+new Date().toISOString(),'Skills: '+(current.data.tags||[]).join(', '),'Checks passed: '+current.data.tasks.filter(t=>taskState[t.id]).length+'/'+current.data.tasks.length,...current.data.tasks.map(t=>(taskState[t.id]?'PASS: ':'PENDING: ')+t.title),'Recorded form-validation mistakes: '+mistakes.length,...mistakes.map(x=>x.time+' · '+x.title),'Verified configuration and commands:',JSON.stringify(env().evidence(),null,2),'This report is local training evidence. Monthly points and prize eligibility require server verification.'];d.append(node('pre',lines.join('\n')),btn('Download report',()=>{const a=node('a');const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain'}));a.href=url;a.download='prempehtech-lab-report.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}),btn('Close',()=>d.close()));d.showModal();}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-submit-task]');if(!b)return;const id=b.dataset.submitTask;setTimeout(()=>{if(!rt().taskState[id])mistakes.push({time:new Date().toISOString(),title:rt().current.data.tasks.find(t=>t.id===id)?.title||id});save();},0);});
 window.addEventListener('prempeh-desktop-activity',save);window.addEventListener('pagehide',save);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
 window.addEventListener('prempeh-desktop-complete',()=>{save();const actions=document.querySelector('.vm-complete-actions');actions?.append(btn('Completion report',report));});
 setInterval(save,10000);
 window.PrempehLabPlus={save,launched,discard,report,evidence};
})();
