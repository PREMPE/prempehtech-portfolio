/* Original PrempehTech practice network. All devices and traffic are simulated. */
(() => {
  'use strict';
  const KEY = 'prempeh-enterprise-network-v1';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icons = {router:'⇄', switch:'⋈', server:'▥', workstation:'▣'};
  const defaults = () => ({version:1, devices:[
    {id:'gateway',name:'EDGE-01',kind:'router',ip:'10.24.0.1',on:true,x:50,y:16},
    {id:'switch',name:'CORE-01',kind:'switch',ip:'10.24.0.2',on:true,x:50,y:43},
    {id:'client',name:'DESK-01',kind:'workstation',ip:'10.24.0.20',on:true,x:18,y:78,gateway:'10.24.0.1',dns:'10.24.0.10'},
    {id:'directory',name:'NAME-01',kind:'server',ip:'10.24.0.10',on:true,x:50,y:78,dnsService:true,webService:false},
    {id:'web',name:'PORTAL-01',kind:'server',ip:'10.24.0.30',on:true,x:82,y:78,dnsService:false,webService:true}
  ],links:[['gateway','switch'],['switch','client'],['switch','directory'],['switch','web']],events:[],exercise:null});
  const ipv4 = s => typeof s === 'string' && /^(\d{1,3}\.){3}\d{1,3}$/.test(s) && s.split('.').every(n => Number(n)<=255);
  const valid = s => s?.version===1 && Array.isArray(s.devices) && s.devices.length>=5 && s.devices.length<=40 &&
    ['gateway','switch','client','directory','web'].every(id=>s.devices.some(d=>d.id===id)) &&
    new Set(s.devices.map(d=>d.id)).size===s.devices.length &&
    s.devices.every(d=>typeof d.id==='string' && /^[a-zA-Z0-9-]{1,64}$/.test(d.id) && typeof d.name==='string' && d.name.length<=32 && Object.hasOwn(icons,d.kind) && ipv4(d.ip) && typeof d.on==='boolean' && Number.isFinite(d.x) && d.x>=0 && d.x<=100 && Number.isFinite(d.y) && d.y>=0 && d.y<=100) &&
    Array.isArray(s.links) && s.links.length<=780 && s.links.every(l=>Array.isArray(l)&&l.length===2&&l.every(id=>s.devices.some(d=>d.id===id))) && Array.isArray(s.events) && s.events.length<=60 && s.events.every(e=>e&&typeof e.time==='string'&&typeof e.message==='string'&&e.message.length<=500) && s.devices.filter(d=>d.id==='client').every(d=>ipv4(d.gateway)&&ipv4(d.dns));
  let state;
  try { const stored=JSON.parse(localStorage.getItem(KEY)); if(valid(stored))state=stored; } catch {}
  state ||= defaults();
  const views = new Map();
  const device = id => state.devices.find(d=>d.id===id);
  function persist() {
    try { localStorage.setItem(KEY,JSON.stringify(state)); }
    catch { window.PrempehWorkspace.announce('Practice network changes are session-only: browser storage is unavailable.'); }
  }
  function change(message) {
    state.events.unshift({time:new Date().toISOString(),message});state.events=state.events.slice(0,60);
    persist(); redraw(); window.PrempehWorkspace.announce(message);
  }
  function path(from,to) {
    if(!device(from)?.on || !device(to)?.on)return null;
    const queue=[[from]],seen=new Set();
    while(queue.length){const route=queue.shift(),id=route.at(-1);if(id===to)return route;if(seen.has(id))continue;seen.add(id);
      if(id!==from && !['router','switch'].includes(device(id).kind))continue;
      state.links.forEach(([a,b])=>{const next=a===id?b:b===id?a:null;if(next&&device(next)?.on&&!seen.has(next))queue.push([...route,next]);});
    }return null;
  }
  function reachable(target) {
    const source=device('client');
    return target && source.ip.split('.').slice(0,3).join('.')===target.ip.split('.').slice(0,3).join('.') && path(source.id,target.id);
  }
  function resolve(host) {
    if(ipv4(host))return {target:state.devices.find(d=>d.ip===host)};
    const dns=state.devices.find(d=>d.ip===device('client').dns && d.kind==='server');
    if(!reachable(dns)||!dns.dnsService)return {error:'DNS unavailable. Check DESK-01 DNS settings, links, and the DNS service.'};
    const target=host.toLowerCase()==='portal.prempeh.lab'?device('web'):state.devices.find(d=>d.name.toLowerCase()+'.prempeh.lab'===host.toLowerCase());
    return target?{target}:{error:'Name not found in the practice DNS zone.'};
  }
  function diagnose(command) {
    const [verb,arg,...rest]=command.trim().split(/\s+/);const source=device('client');
    if(rest.length)return 'Use one destination. Type help for supported commands.';
    if(verb==='help')return 'Prempeh Operations Terminal\nhelp · clear · status · ipconfig\nping <IP or hostname> · lookup <hostname> · trace <IP or hostname>\nfetch portal.prempeh.lab\nTraffic is simulated from DESK-01. Local interfaces use /24 networks.';
    if(verb==='ipconfig')return `${source.name}\nIPv4: ${source.ip}/24\nGateway: ${source.gateway}\nDNS: ${source.dns}\nInterface: ${source.on?'Up':'Down'}`;
    if(verb==='status')return state.devices.map(d=>`${d.name.padEnd(16)} ${d.ip.padEnd(16)} ${d.on?'Online':'Powered off'}`).join('\n');
    if(!['ping','lookup','trace','fetch'].includes(verb))return 'Unknown command. Type help for supported commands.';
    if(!arg)return `Usage: ${verb} <destination>`;
    if(!source.on)return 'Source interface is down. Power on DESK-01.';
    const {target,error}=resolve(arg);if(error)return error;
    if(!target)return 'Destination not found in the practice network.';
    if(verb==='lookup')return `Name: ${arg}\nAddress: ${target.ip}\nDNS server: ${source.dns}`;
    const route=reachable(target);if(!route)return 'Destination unreachable. Check device power, physical links, and /24 subnet settings.';
    if(verb==='trace')return route.map((id,i)=>`${i+1}  ${device(id).name}  ${device(id).ip}`).join('\n');
    if(verb==='fetch')return target.kind==='server'&&target.webService?`HTTP 200 OK\nPrempehTech company portal\nServed by ${target.name} (${target.ip})`:'Connection refused: the destination web service is stopped.';
    return `Reply from ${target.ip}: bytes=32\n4 packets sent, 4 received, 0 lost (simulated)`;
  }
  const health = () => {
    const dns=state.devices.find(d=>d.ip===device('client').dns&&d.kind==='server');
    return [Boolean(reachable(dns)&&dns.dnsService),Boolean(reachable(device('web'))&&device('web').webService),Boolean(reachable(device('gateway'))&&device('client').gateway===device('gateway').ip)];
  };
  function redraw() { for(const [body,view] of views) {if(body.isConnected)draw(body,view);else views.delete(body);} }
  function render(body,tab='overview') { const view={tab,history:['Prempeh Operations Terminal — type help to begin.'],command:'',selected:'client'};views.set(body,view);draw(body,view); }
  function draw(body,view) {
    if(!device(view.selected))view.selected='client';
    // Preserve unfinished terminal input across changes made in another window.
    const old=$('[data-net-command]',body);if(old)view.command=old.value;
    body.classList.add('pt-enterprise-body');
    const tabs=[['overview','Overview'],['topology','Network Studio'],['servers','Server Console'],['terminal','Operations Terminal'],['activity','Activity']];
    body.innerHTML=`<div class="pt-os-head"><div><span class="pt-os-eyebrow">PREMPEHTECH / ENTERPRISE</span><h2>${tabs.find(t=>t[0]===view.tab)[1]}</h2></div><span class="pt-os-session">● Local practice network</span></div><div class="pt-os-layout"><nav aria-label="Enterprise tools">${tabs.map(([id,label])=>`<button data-net-tab="${id}" aria-current="${id===view.tab?'page':'false'}">${label}</button>`).join('')}<div class="pt-os-nav-note">One network.<br>Connected tools.<br><br>Changes saved in this browser.</div></nav><main class="pt-os-content"></main></div>`;
    $$('[data-net-tab]',body).forEach(b=>b.onclick=()=>{view.tab=b.dataset.netTab;draw(body,view);});
    const main=$('.pt-os-content',body);
    if(view.tab==='overview')overview(main);
    if(view.tab==='topology')topology(main,view);
    if(view.tab==='servers')servers(main);
    if(view.tab==='terminal')terminal(main,view);
    if(view.tab==='activity')activity(main);
  }
  function overview(main) {
    const checks=health();
    main.innerHTML=`<div class="pt-os-intro"><span>OPERATIONS DESK</span><h3>Your infrastructure, connected.</h3><p>Configure devices, follow traffic, and restore services in your own practice network.</p></div><div class="pt-os-metrics">${['Name resolution','Company portal','Gateway'].map((label,i)=>`<article><span>${label}</span><strong class="${checks[i]?'pt-good':'pt-bad'}">${checks[i]?'Available':'Needs attention'}</strong></article>`).join('')}</div><h3>Device inventory</h3><div class="pt-os-table-wrap"><table class="pt-os-table"><thead><tr><th>Device</th><th>Role</th><th>Address</th><th>Power</th><th>Configuration</th></tr></thead><tbody>${state.devices.map(d=>`<tr><td>${esc(d.name)}</td><td>${d.kind}</td><td>${esc(d.ip)}</td><td>${d.on?'On':'Off'}</td><td><button data-config="${esc(d.id)}">Properties</button></td></tr>`).join('')}</tbody></table></div><div class="pt-os-exercise"><h3>Practice incident: office outage</h3><p>Restore the switch, DNS service, and portal service. Verify name resolution and open the portal from the terminal.</p><button data-incident>Start outage exercise</button><button data-check>Validate recovery</button><p data-result role="status">${state.exercise?.complete?'Recovery validated.':state.exercise?'Incident active — inspect the network and services.':'Ready when you are. This practice network is separate from the 30 scored projects.'}</p></div><div class="pt-os-actions"><button data-snapshot>Save inventory to Documents</button><button data-reset>Reset practice network</button></div>`;
    bindProperties(main);
    $('[data-incident]',main).onclick=()=>{
      if(!confirm('Start an outage in the practice network? CORE-01, DNS, and the portal service will stop. Your scored projects are unchanged.'))return;
      device('switch').on=false;device('directory').dnsService=false;device('web').webService=false;state.exercise={complete:false};change('Practice incident started: office services unavailable.');
    };
    $('[data-check]',main).onclick=()=>{if(!state.exercise){$('[data-result]',main).textContent='Start the exercise first.';return;}if(health().every(Boolean)){state.exercise.complete=true;change('Practice incident resolved: DNS, portal, and gateway checks passed.');}else $('[data-result]',main).textContent='Recovery incomplete. Restore DNS, the portal, and the configured gateway path.';};
    $('[data-reset]',main).onclick=()=>{if(confirm('Reset practice devices, links, and incident history to defaults? Saved documents and scored projects are kept.')){state=defaults();change('Practice network reset.');}};
    $('[data-snapshot]',main).onclick=()=>{window.PrempehFiles.storeDocument('Network inventory.txt',JSON.stringify({devices:state.devices,links:state.links},null,2));window.PrempehWorkspace.announce('Inventory saved to File Explorer / Documents.');};
  }
  function bindProperties(main) {$$('[data-config]',main).forEach(b=>b.onclick=()=>properties(b.dataset.config));}
  function properties(id) {
    const d=device(id);if(!d)return;
    const dialog=document.createElement('dialog');dialog.className='workspace-dialog pt-os-dialog';
    dialog.innerHTML=`<form><span class="pt-os-eyebrow">DEVICE PROPERTIES / ${d.kind.toUpperCase()}</span><h2>${esc(d.name)}</h2><label>Device name<input name="name" required maxlength="32" value="${esc(d.name)}"></label><label>IPv4 address (/24)<input name="ip" required value="${esc(d.ip)}" inputmode="decimal"></label>${d.id==='client'?`<label>Default gateway<input name="gateway" required value="${esc(d.gateway)}"></label><label>DNS server<input name="dns" required value="${esc(d.dns)}"></label>`:''}<label class="pt-os-check"><input name="on" type="checkbox" ${d.on?'checked':''}> Power on</label><p data-error role="alert"></p><div><button type="button" data-cancel>Cancel</button><button type="submit">Apply changes</button></div></form>`;
    document.body.append(dialog);const close=()=>{dialog.close();dialog.remove();};$('[data-cancel]',dialog).onclick=close;dialog.oncancel=()=>dialog.remove();
    $('form',dialog).onsubmit=e=>{
      e.preventDefault();const f=new FormData(e.target),name=f.get('name').trim(),ip=f.get('ip').trim(),error=$('[data-error]',dialog);
      if(!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,31}$/.test(name)){error.textContent='Use letters, numbers, and hyphens for a device name.';return;}
      const addresses=[ip,...(id==='client'?[f.get('gateway').trim(),f.get('dns').trim()]:[])];
      if(addresses.some(a=>!ipv4(a)||a.split('.').some(n=>String(Number(n))!==n)||Number(a.split('.')[3])===0||Number(a.split('.')[3])===255)){error.textContent='Enter valid IPv4 host addresses (last octet 1–254).';return;}
      if(state.devices.some(other=>other.id!==id&&(other.ip===ip||other.name.toLowerCase()===name.toLowerCase()))){error.textContent='That device name or IP address is already in use.';return;}
      Object.assign(d,{name,ip,on:f.has('on')});if(id==='client'){d.gateway=f.get('gateway').trim();d.dns=f.get('dns').trim();}close();change(`${name}: configuration applied.`);
    };dialog.showModal();$('input',dialog).focus();
  }
  function topology(main,view) {
    main.innerHTML=`<div class="pt-os-actions"><label>Add device<select data-kind><option value="router">Router</option><option value="switch">Switch</option><option value="server">Server</option><option value="workstation">Workstation</option></select></label><button data-add>Add device</button><button data-properties>Selected properties</button><button data-power>Toggle selected power</button></div><p class="pt-os-caption">Drag devices to arrange. Select a device and use arrow keys to move it. Right-click for device actions.</p><div class="pt-os-topology" aria-label="Practice network topology"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${state.links.map(([a,b])=>`<line x1="${device(a).x}" y1="${device(a).y}" x2="${device(b).x}" y2="${device(b).y}" class="${device(a).on&&device(b).on?'':'offline'}"/>`).join('')}</svg>${state.devices.map(d=>`<button class="pt-os-device ${d.on?'':'offline'}" data-device="${esc(d.id)}" style="left:${d.x}%;top:${d.y}%" aria-pressed="${view.selected===d.id}" aria-label="${esc(d.name)}, ${d.kind}, ${d.on?'powered on':'powered off'}"><span>${window.PrempehIcons.html(d.kind)}</span><strong>${esc(d.name)}</strong><small>${esc(d.ip)}</small></button>`).join('')}</div><form class="pt-os-actions" data-connect><label>From<select name="from">${options()}</select></label><label>To<select name="to">${options()}</select></label><button>Connect devices</button><span data-link-error role="status"></span></form><h3>Physical links</h3><div class="pt-os-links">${state.links.map(([a,b],i)=>`<div><span>${esc(device(a).name)} ↔ ${esc(device(b).name)}</span><button data-disconnect="${i}">Disconnect</button></div>`).join('')||'<p>No links. Connect devices to restore traffic.</p>'}</div>`;
    $('[data-add]',main).onclick=()=>{if(state.devices.length>=40){window.PrempehWorkspace.announce('Practice network limit: 40 devices.');return;}const kind=$('[data-kind]',main).value;let n=40;while(state.devices.some(d=>d.ip===`10.24.0.${n}`))n++;let name=`${kind.toUpperCase()}-${n}`;while(state.devices.some(d=>d.name===name))name+='N';const id=crypto.randomUUID();state.devices.push({id,name,kind,ip:`10.24.0.${n}`,on:true,x:30,y:28,dnsService:false,webService:false});view.selected=id;change(`${name} added. Connect it to the network.`);};
    $('[data-properties]',main).onclick=()=>properties(view.selected);
    $('[data-power]',main).onclick=()=>togglePower(view.selected);
    $('[data-connect]',main).onsubmit=e=>{e.preventDefault();const data=new FormData(e.target),a=data.get('from'),b=data.get('to');const error=$('[data-link-error]',main);if(a===b){error.textContent='Choose two different devices.';return;}if(state.links.some(l=>l.includes(a)&&l.includes(b))){error.textContent='These devices are already connected.';return;}state.links.push([a,b]);change(`Connected ${device(a).name} to ${device(b).name}.`);};
    $$('[data-disconnect]',main).forEach(b=>b.onclick=()=>{const [a,c]=state.links.splice(Number(b.dataset.disconnect),1)[0];change(`Disconnected ${device(a).name} from ${device(c).name}.`);});
    $$('[data-device]',main).forEach(b=>{
      const id=b.dataset.device,d=device(id);
      const select=()=>{view.selected=id;$$('[data-device]',main).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));};
      b.onclick=select;b.ondblclick=()=>properties(id);
      b.oncontextmenu=e=>{e.preventDefault();e.stopPropagation();select();deviceMenu(e,id,b);};
      b.onkeydown=e=>{if(e.key==='ContextMenu'||e.shiftKey&&e.key==='F10'){e.preventDefault();const r=b.getBoundingClientRect();deviceMenu({clientX:r.left,clientY:r.bottom},id,b);return;}const moves={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]};if(!moves[e.key])return;e.preventDefault();select();d.x=Math.max(10,Math.min(90,d.x+moves[e.key][0]));d.y=Math.max(14,Math.min(85,d.y+moves[e.key][1]));const body=main.closest('.workspace-body');persist();redraw();$(`[data-device="${id}"]`,body)?.focus();};
      b.onpointerdown=e=>{if(e.button!==0)return;select();b.setPointerCapture(e.pointerId);const r=$('.pt-os-topology',main).getBoundingClientRect(),start={x:e.clientX,y:e.clientY,dx:d.x,dy:d.y};let moved=false;
        b.onpointermove=event=>{if(Math.hypot(event.clientX-start.x,event.clientY-start.y)<4&&!moved)return;moved=true;d.x=Math.max(10,Math.min(90,start.dx+(event.clientX-start.x)/r.width*100));d.y=Math.max(14,Math.min(85,start.dy+(event.clientY-start.y)/r.height*100));b.style.left=d.x+'%';b.style.top=d.y+'%';$$('line',main).forEach((line,i)=>{const [a,c]=state.links[i];line.setAttribute('x1',device(a).x);line.setAttribute('y1',device(a).y);line.setAttribute('x2',device(c).x);line.setAttribute('y2',device(c).y);});};
        const end=()=>{b.onpointermove=null;b.onpointerup=null;b.onpointercancel=null;if(moved){persist();redraw();}};b.onpointerup=end;b.onpointercancel=end;
      };
    });
  }
  function options(){return state.devices.map(d=>`<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');}
  function togglePower(id){const d=device(id);d.on=!d.on;change(`${d.name} powered ${d.on?'on':'off'}.`);}
  function deviceMenu(e,id,anchor) {
    $('#ptDeviceMenu')?.remove();const menu=document.createElement('div');menu.id='ptDeviceMenu';menu.className='pt-os-menu';menu.setAttribute('role','menu');
    const close=()=>{menu.remove();document.removeEventListener('pointerdown',outside);};const outside=e=>{if(!menu.contains(e.target))close();};
    [['Properties',()=>properties(id)],[device(id).on?'Power off':'Power on',()=>togglePower(id)],['Inspect connectivity',()=>{window.PrempehWorkspace.openUtility('opsterm');const body=$('[data-utility="opsterm"] .workspace-body'),view=views.get(body);view.tab='terminal';view.history.push(`> ping ${device(id).ip}`,diagnose(`ping ${device(id).ip}`));draw(body,view);}]].forEach(([label,action])=>{const b=document.createElement('button');b.textContent=label;b.setAttribute('role','menuitem');b.onclick=()=>{close();action();};menu.append(b);});
    document.body.append(menu);menu.style.left=Math.max(8,Math.min(e.clientX,innerWidth-menu.offsetWidth-8))+'px';menu.style.top=Math.max(8,Math.min(e.clientY,innerHeight-menu.offsetHeight-8))+'px';$('button',menu).focus();document.addEventListener('pointerdown',outside);
    menu.onkeydown=e=>{const buttons=$$('button',menu),index=buttons.indexOf(document.activeElement);if(e.key==='Escape'){close();anchor.focus();}if(e.key==='Tab')close();if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();buttons[(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();}};
  }
  function servers(main) {
    main.innerHTML=`<p>Manage services on generic PrempehTech servers. Service changes immediately affect terminal checks and the operations overview.</p><div class="pt-os-server-grid">${state.devices.filter(d=>d.kind==='server').map(d=>`<article><span class="pt-os-server-icon">${window.PrempehIcons.html("server")}</span><h3>${esc(d.name)}</h3><p>${esc(d.ip)} · ${d.on?'Powered on':'Powered off'}</p><button data-config="${esc(d.id)}">Properties</button>${[['dnsService','DNS resolver'],['webService','Web portal']].map(([key,label])=>`<div class="pt-os-service"><span>${label}<small>${!d.on?'Unavailable — server off':d[key]?'Running':'Stopped'}</small></span><button data-service="${key}" data-server="${esc(d.id)}" ${!d.on?'disabled':''}>${d[key]?'Stop':'Start'}</button></div>`).join('')}</article>`).join('')}</div><h3>Practice DNS zone</h3><p><code>portal.prempeh.lab → ${esc(device('web').ip)}</code></p><p>Running DNS servers resolve device names under <code>.prempeh.lab</code>. Configure DESK-01 to use an available DNS server.</p>`;
    bindProperties(main);$$('[data-service]',main).forEach(b=>b.onclick=()=>{const d=device(b.dataset.server),key=b.dataset.service;d[key]=!d[key];change(`${d.name}: ${key==='dnsService'?'DNS':'Web'} service ${d[key]?'started':'stopped'}.`);});
  }
  function terminal(main,view) {
    main.innerHTML='<p>Run diagnostics from DESK-01 against the current practice network.</p><div class="pt-os-terminal"><pre data-output role="log" aria-live="polite"></pre><form><label for="pt-command-'+main.closest('[data-utility]').dataset.utility+'">operator@desk ›</label><input id="pt-command-'+main.closest('[data-utility]').dataset.utility+'" data-net-command autocomplete="off" spellcheck="false" aria-label="Operations command"><button>Run</button></form></div><div class="pt-os-actions"><button data-run="ping 10.24.0.30">Ping portal</button><button data-run="lookup portal.prempeh.lab">Check DNS</button><button data-run="fetch portal.prempeh.lab">Open portal</button></div>';
    const out=$('[data-output]',main),input=$('input',main);out.textContent=view.history.join('\n\n');out.scrollTop=out.scrollHeight;input.value=view.command;
    const run=cmd=>{if(!cmd.trim())return;view.history=cmd.trim()==='clear'?[]:[...view.history,`> ${cmd}`,diagnose(cmd)].slice(-80);view.command='';input.value='';draw(body,view);$('[data-net-command]',body)?.focus();};
    const body=main.closest('.workspace-body'); // Capture before a redraw detaches this panel.
    $('form',main).onsubmit=e=>{e.preventDefault();const cmd=input.value;if(!cmd.trim())return;view.history=cmd.trim()==='clear'?[]:[...view.history,`> ${cmd}`,diagnose(cmd)].slice(-80);input.value='';view.command='';draw(body,view);$('[data-net-command]',body).focus();};
    $$('[data-run]',main).forEach(b=>b.onclick=()=>run(b.dataset.run));
  }
  function activity(main) {
    main.innerHTML=`<h3>Change history</h3><p>Device, link, and service changes from this browser workspace.</p><ol class="pt-os-events">${state.events.map(e=>`<li><time>${esc(new Date(e.time).toLocaleTimeString())}</time><span>${esc(e.message)}</span></li>`).join('')||'<li>No changes yet. Open Network Studio to configure a device.</li>'}</ol>`;
  }
  window.PrempehPracticeNetwork={render};
})();
