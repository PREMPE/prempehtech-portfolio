/* Enterprise desktop shell. Lab validation remains in desktop-lab.js. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const runtime = () => window.PrempehDesktopLab.getRuntime();
  const apps = {
    operations: ['◈', 'Operations Center'], netstudio: ['⋈', 'Network Studio'],
    serverops: ['▥', 'Server Console'], opsterm: ['›_', 'Operations Terminal'],
    projects: ['▦', 'Project Center'], explorer: ['▤', 'File Explorer'],
    notepad: ['▧', 'Notepad'], taskmgr: ['▥', 'Task Manager'],
    control: ['⚙', 'Settings'], edge: ['◎', 'Company Portal'],
    calc: ['▩', 'Calculator'], recycle: ['♲', 'Recycle Bin'], system: ['▣', 'System Information'], admin: ['◈', 'Admin Center']
  };
  const wallpapers = [
    ['mountain-peaks','Mountain Peaks'], ['forest-canopy','Forest Reflections'],
    ['tropical-beach','Tropical Sunset'], ['alpine-lake','Alpine Lake'], ['sunlit-valley','Golden Valley']
  ];
  const tracks = ['networking', 'sysadmin', 'cyber', 'cloud', 'integrated'];
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const storedPrefs = read('prempeh-workspace-preferences', {});
  const allowedWallpapers = ['blue','slate','green',...wallpapers.map(([file])=>'nature-'+file)];
  const prefs = {wallpaper:allowedWallpapers.includes(storedPrefs?.wallpaper)?storedPrefs.wallpaper:'blue',icons:storedPrefs?.icons!==false};
  let top = 20, contextReturn = null;
  const windows = () => $$('.vm-window,.workspace-window', $('#vmDesktop'));
  function announce(message) {
    const status = $('#workspaceStatus'); if (status) status.textContent = message; window.PrempehSession?.notify(message);
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { announce('Browser storage is unavailable. Changes will last for this session only.'); return false; }
  }
  function focus(win) {
    $("#vmMission")?.classList.remove("workspace-ticket-front");
    windows().forEach(w => w.classList.toggle('workspace-focused', w === win));
    win.style.zIndex = ++top;
  }
  function show(win) { win.classList.remove('hidden'); win.hidden = false; focus(win); }
  function close(win) { const id = win.dataset.utility; win.remove(); if (id) $(`[data-workspace-task="${id}"]`)?.remove(); }
  function toggleMax(win) { win.classList.remove('workspace-snap-left','workspace-snap-right'); win.classList.toggle('maximized'); }
  function manage(win) {
    if (win.dataset.workspaceManaged) return;
    win.dataset.workspaceManaged = 'true'; focus(win);
    const title = $('.vm-titlebar', win); title.tabIndex = 0;
    title.setAttribute('aria-label', `${win.getAttribute('aria-label') || $('.vm-title-left',win)?.textContent || 'Application'} window. Double-click to maximize.`);
    win.addEventListener('pointerdown', () => focus(win));
    title.addEventListener('dblclick', e => { if (!e.target.closest('button')) toggleMax(win); });
    title.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button') || win.classList.contains('maximized')) return;
      e.preventDefault(); title.setPointerCapture(e.pointerId);
      win.classList.remove('workspace-snap-left','workspace-snap-right');
      const start = { x:e.clientX, y:e.clientY, left:win.offsetLeft, top:win.offsetTop };
      const move = event => {
        const parent = win.parentElement;
        win.style.left = Math.max(0, Math.min(parent.clientWidth - 80, start.left + event.clientX - start.x)) + 'px';
        win.style.top = Math.max(0, Math.min(parent.clientHeight - 50, start.top + event.clientY - start.y)) + 'px';
      };
      const end = () => { title.removeEventListener('pointermove',move); title.removeEventListener('pointerup',end); title.removeEventListener('pointercancel',end); };
      title.addEventListener('pointermove',move); title.addEventListener('pointerup',end); title.addEventListener('pointercancel',end);
    });
    title.addEventListener('keydown', e => {
      if (!e.altKey || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      if (e.key === 'ArrowUp') { win.classList.remove('workspace-snap-left','workspace-snap-right'); win.classList.add('maximized'); return; }
      if (e.key === 'ArrowDown') { win.classList.remove('maximized','workspace-snap-left','workspace-snap-right'); return; }
      win.classList.remove('maximized','workspace-snap-left','workspace-snap-right');
      win.classList.add(e.key === 'ArrowLeft' ? 'workspace-snap-left' : 'workspace-snap-right');
    });
    const names = {'.vm-min':'Minimize window','.vm-max':'Maximize or restore window','.vm-close':'Close window'};
    Object.entries(names).forEach(([selector,label]) => $(selector,win)?.setAttribute('aria-label',label));
  }
  function makeWindow(id) {
    const existing = $(`[data-utility="${id}"]`); if (existing) { show(existing); return null; }
    const [glyph,label] = apps[id];
    const win = document.createElement('section'); win.className = 'workspace-window'; win.dataset.utility = id; win.setAttribute('aria-label',label);
    const offset = windows().length * 20;
    win.style.left = (160 + offset) + 'px'; win.style.top = (40 + offset) + 'px';
    win.innerHTML = `<div class="vm-titlebar"><div class="vm-title-left">${window.PrempehIcons.html(id)} ${label}</div><div class="vm-window-controls"><button class="vm-min">—</button><button class="vm-max">□</button><button class="vm-close">×</button></div></div><div class="workspace-body"></div>`;
    $('#vmWindows').append(win);
    const task = document.createElement('button'); task.dataset.workspaceTask = id; task.innerHTML = `${window.PrempehIcons.html(id)}<span>${label}</span>`; task.className = 'vm-task-app';
    task.onclick = () => { if (win.classList.contains('hidden') || !win.classList.contains('workspace-focused')) show(win); else win.classList.add('hidden'); };
    $('#vmTaskbarApps').append(task);
    $('.vm-min',win).onclick = () => win.classList.add('hidden');
    $('.vm-max',win).onclick = () => toggleMax(win); $('.vm-close',win).onclick = () => close(win);
    manage(win); return win;
  }
  function openUtility(id) {
    id = ({thispc:'explorer',computer:'control'})[id] || id;
    if (!apps[id]) return;
    const win = makeWindow(id); if (!win) return;
    const body = $('.workspace-body',win);
    if (id === 'projects') renderProjects(body);
    const enterpriseTabs = {operations:'overview', netstudio:'topology', serverops:'servers', opsterm:'terminal'};
    if (enterpriseTabs[id]) window.PrempehPracticeNetwork.render(body, enterpriseTabs[id]);
    if (id === 'notepad') {
      body.innerHTML = '<div class="workspace-toolbar"><span>Documents / Operations notes.txt</span><button data-export>Download .txt</button></div><label class="workspace-note-label">Operations notes<textarea class="workspace-notes" spellcheck="false" placeholder="Record your diagnosis, changes, and validation results…"></textarea></label><p class="workspace-save-status" role="status">Saved on this browser</p>';
      const note = $('textarea',body); note.value = read('prempeh-workspace-notes','');
      note.oninput = () => { $('.workspace-save-status',body).textContent = save('prempeh-workspace-notes',note.value) ? 'Saved on this browser' : 'Not saved — browser storage unavailable'; };
      $('[data-export]',body).onclick = () => { const url = URL.createObjectURL(new Blob([note.value],{type:'text/plain'})); const a=document.createElement('a');a.href=url;a.download='operations-notes.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); };
    }
    if (id === 'explorer' && window.PrempehFiles) window.PrempehFiles.render(body);
    else if (id === 'explorer') {
      body.innerHTML = '<div class="workspace-toolbar"><span>This PC / CORP Workspace</span><button data-refresh>Refresh</button></div><h2>Quick access</h2><div class="workspace-tiles"><button data-open="projects">▦<br>All projects</button><button data-open="notepad">▧<br>Operations notes.txt</button><button data-open="edge">◎<br>Company portal</button><button data-open="recycle">♲<br>Recycle Bin</button></div><p>Training documents and applications stored in this browser workspace.</p>';
      $('[data-refresh]',body).onclick = () => announce('File Explorer refreshed. Your notes and lab state are unchanged.');
    }
    if (id === 'edge') {
      body.innerHTML = '<div class="workspace-toolbar"><span>◎ intranet.corp.local / IT Operations</span><button data-refresh>↻ Refresh</button></div><h2>CORP IT Operations</h2><p class="workspace-subtitle">Enterprise training portal</p><div class="workspace-tiles"><button data-open="projects">Service desk<br>25 project tickets</button><button data-open="notepad">Knowledge base<br>Operations notes</button><a href="/" target="_blank" rel="noopener">PrempehTech portfolio ↗</a><a href="/youtube-videos/" target="_blank" rel="noopener">Training videos ↗</a></div><p data-context></p>';
      const update = () => { $('[data-context]',body).textContent = runtime().current.level ? `Current assignment: ${runtime().current.data.title}` : 'No project selected. Open Project Center to begin.'; };
      $('[data-refresh]',body).onclick=update;update();
    }
    if (id === 'control') {
      body.innerHTML = '<h2>Workspace settings</h2><label>Desktop background<select data-wallpaper><option value="blue">Enterprise blue</option><option value="slate">Graphite</option><option value="green">Forest</option></select></label><div class="workspace-wallpapers" role="group" aria-label="Nature backgrounds"></div><p class="workspace-wallpaper-credit">Photography from <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a></p><label class="workspace-check"><input type="checkbox" data-icons> Show desktop icons</label><h3>Administrative tools</h3><div class="workspace-tools"></div><p>Tools are available for the active project. Settings apply to this browser.</p>';
      const photoOptions=document.createElement('optgroup');photoOptions.label='Nature photography';
      wallpapers.forEach(([file,label])=>{
        const id='nature-'+file,option=document.createElement('option');option.value=id;option.textContent=label;photoOptions.append(option);
        const button=document.createElement('button');button.type='button';button.className='workspace-wallpaper-choice';button.dataset.wallpaperChoice=id;button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(prefs.wallpaper===id));
        button.innerHTML=`<img src="/assets/wallpapers/${file}-thumb.webp" alt="" width="400" height="240" loading="lazy"><span>${label}</span>`;
        button.onclick=()=>{prefs.wallpaper=id;applyPrefs();};$('.workspace-wallpapers',body).append(button);
      });
      $('select[data-wallpaper]',body).append(photoOptions);
      $('[data-wallpaper]',body).value=prefs.wallpaper; $('[data-icons]',body).checked=prefs.icons;
      $('[data-wallpaper]',body).onchange=e=>{prefs.wallpaper=e.target.value;applyPrefs();};
      $('[data-icons]',body).onchange=e=>{prefs.icons=e.target.checked;applyPrefs();};
      $('.workspace-tools',body).innerHTML=runtime().current.data.apps.map(app=>`<button data-tool="${app}">${escape(runtime().APP_DEFS[app].label)}</button>`).join('') || '<button data-open="projects">Choose a project</button>';
      $$('[data-tool]',body).forEach(b=>b.onclick=()=>window.PrempehDesktopLab.openApp(b.dataset.tool));
    }
    if (id === 'taskmgr') {
      body.innerHTML = '<div class="workspace-toolbar"><span>Applications in this training workspace</span><button data-refresh>Refresh</button></div><div data-processes></div><p>Ending an app closes its window. Completed lab tasks are retained.</p>';
      const update = () => {
        $('[data-processes]',body).innerHTML=windows().filter(w=>w!==win).map((w,i)=>`<div class="workspace-process"><span>${escape(w.getAttribute('aria-label') || $('.vm-title-left',w)?.textContent || 'Application')}</span><span>${w.classList.contains('hidden')?'Minimized':'Running'}</span><button data-end="${i}">End task</button></div>`).join('') || '<p>No other applications are open.</p>';
        const targets=windows().filter(w=>w!==win);$$('[data-end]',body).forEach(b=>b.onclick=()=>{const w=targets[Number(b.dataset.end)];$('.vm-close',w).click();update();});
      }; $('[data-refresh]',body).onclick=update;update();
    }
    if (id === 'admin') {
      body.innerHTML='<div class="workspace-toolbar"><span>CORP / Administration</span><button data-refresh>Refresh status</button></div><h2>Admin Center</h2><div data-admin></div>';
      const update=()=>{
        const {current,taskState,APP_DEFS}=runtime();
        $('[data-admin]',body).innerHTML=current.level?`<h3>${escape(current.data.title)}</h3><p>${escape(current.data.role)}</p><div class="workspace-admin-tasks">${current.data.tasks.map(t=>`<article><span class="workspace-health ${taskState[t.id]?'good':''}">${taskState[t.id]?'Validated':'Needs attention'}</span><h3>${escape(t.title)}</h3><button data-admin-tool="${t.app}">Open ${escape(APP_DEFS[t.app].label)}</button></article>`).join('')}</div>`:'<p>Select a project to inspect its services, policies, and validation status.</p><button data-choose>Open Project Center</button>';
        $$('[data-admin-tool]',body).forEach(b=>b.onclick=()=>window.PrempehDesktopLab.openApp(b.dataset.adminTool));$('[data-choose]',body)?.addEventListener('click',()=>openUtility('projects'));
      };$('[data-refresh]',body).onclick=update;update();
    }
    if (id === 'calc') calculator(body);
    if (id === 'system') body.innerHTML=`<h2>CORP Training Workstation</h2><p>Browser-based enterprise simulation</p><dl><dt>Workspace</dt><dd>PrempehTech Enterprise Desktop</dd><dt>Project catalogue</dt><dd>25 assignments across 5 tracks</dd><dt>Current assignment</dt><dd>${escape(runtime().current.data.title)}</dd><dt>Storage</dt><dd>Local browser storage for files, notes and completed progress</dd><dt>Window shortcuts</dt><dd>Alt + arrow keys on a title bar: snap, maximize or restore</dd><dt>Desktop shortcuts</dt><dd>F5: refresh · Ctrl + Alt + P: projects · Ctrl + Alt + L: lock</dd></dl>`;
    if (id === 'recycle' && window.PrempehFiles) window.PrempehFiles.render(body, 'recycle');
    else if (id === 'recycle') body.innerHTML='<h2>Recycle Bin</h2><p>The Recycle Bin is empty. Project records cannot be deleted from this workspace.</p>';
    $$('[data-open]',body).forEach(b=>{if(b.dataset.open)b.onclick=()=>openUtility(b.dataset.open);});
  }
  function renderProjects(body) {
    body.innerHTML = '<div class="workspace-project-header"><p>IT OPERATIONS / SERVICE DESK</p><h2>Project Center</h2><p>Pick an assignment. Every project opens its own enterprise tools and validation tasks.</p><div class="workspace-filters"><label>Search projects<input type="search" placeholder="Search DNS, cloud, incident…" data-project-search></label><label>Track<select data-project-track><option value="all">All tracks</option>'+tracks.map(t=>`<option value="${t}">${window.PrempehDesktopLab.getTrackLabel(t)}</option>`).join('')+'</select></label></div></div><div class="workspace-practice-launch"><div><strong>PrempehTech practice network</strong><span>Build connections, manage services, and troubleshoot a live simulation.</span></div><button data-practice="operations">Operations Center</button><button data-practice="netstudio">Network Studio</button></div><p data-project-count role="status"></p><div class="workspace-projects"></div>';
    const update = () => {
      const query=$('[data-project-search]',body).value.toLowerCase(),track=$('[data-project-track]',body).value;
      const completed=read('prempehtech-simulator-progress-v1',{}).completedLevels || {};let count=0;
      $('.workspace-projects',body).innerHTML=tracks.flatMap(t=>[1,2,3,4,5].map(level=>{
        const s=window.PrempehDesktopLab.getScenario(t,level);
        if(track!=='all'&&track!==t || !`${s.title} ${s.tags.join(' ')} ${s.ticket}`.toLowerCase().includes(query))return '';
        count++;return `<article><span>${window.PrempehDesktopLab.getTrackLabel(t)} · Level ${level}</span><h3>${escape(s.title)}</h3><p>${escape(s.role)}</p><small>${s.tasks.length} validation tasks · ${completed[`${t}:${level}`]?'Completed ✓':'Available'}</small><button data-project="${t}" data-project-level="${level}">Open project →</button></article>`;
      })).join('');
      $('[data-project-count]',body).textContent=`${count} project${count===1?'':'s'}${count?'':' — try another search'}`;
      $$('[data-project]',body).forEach(b=>b.onclick=()=>{
        if(runtime().current.level && !Object.values(runtime().taskState).every(Boolean) && !confirm('Open a new project? Current in-progress lab configuration will restart. Completed projects and saved Operations notes are kept.'))return;
        window.PrempehDesktopLab.launch(b.dataset.project,Number(b.dataset.projectLevel));
      });
    };
    $$('[data-practice]',body).forEach(b=>b.onclick=()=>openUtility(b.dataset.practice));
    $('[data-project-search]',body).oninput=update;$('[data-project-track]',body).onchange=update;update();
  }
  function calculator(body) {
    body.innerHTML='<h2>Calculator</h2><output class="workspace-calculator" aria-live="polite">0</output><div class="workspace-keypad">'+['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','='].map(k=>`<button>${k}</button>`).join('')+'</div>';
    let value='0',previous=null,operator=null,fresh=false;
    const calculate=()=>{const a=Number(previous),b=Number(value);return operator==='+'?a+b:operator==='−'?a-b:operator==='×'?a*b:b===0?NaN:a/b;};
    $$('button',body).forEach(b=>b.onclick=()=>{
      const k=b.textContent;
      if(k==='C'){value='0';previous=null;operator=null;fresh=false;}
      else if(k==='±')value=String(-Number(value));
      else if(k==='%')value=String(Number(value)/100);
      else if(['+','−','×','÷','='].includes(k)){
        if(operator!==null&&!fresh){const result=calculate();value=Number.isFinite(result)?String(Number(result.toPrecision(12))):'Error';}
        previous=value;operator=k==='='?null:k;fresh=true;
      } else { if(fresh||value==='Error'){value='0';fresh=false;} if(k!=='.'||!value.includes('.'))value=k==='.'?value+'.':value==='0'?k:value+k; }
      $('output',body).textContent=value;
    });
  }
  function applyPrefs() {
    const desktop=$('#vmDesktop');desktop.dataset.wallpaper=prefs.wallpaper;
    $$('[data-wallpaper-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.wallpaperChoice===prefs.wallpaper)));
    const picker=$('select[data-wallpaper]');if(picker)picker.value=prefs.wallpaper;
    $('#vmDesktopIcons').hidden=!prefs.icons;save('prempeh-workspace-preferences',prefs);
  }
  function refresh() {
    applyPrefs();const center=$('[data-utility="projects"] .workspace-body');if(center)renderProjects(center);
    announce('Desktop refreshed. Open applications and project work have been preserved.');
    const desktop=$('#vmDesktop');desktop.classList.remove('workspace-refreshing');void desktop.offsetWidth;desktop.classList.add('workspace-refreshing');
  }
  function dismissMenu() { $('#workspaceContext')?.remove(); }
  function menu(event) {
    const desktop=$('#vmDesktop');
    if(!desktop.contains(event.target) || event.target.closest('input,textarea,select,.workspace-body,.vm-app-body,.vm-mission,.vm-titlebar,.vm-taskbar'))return;
    event.preventDefault();dismissMenu();contextReturn=document.activeElement;
    const icon=event.target.closest('[data-workspace-app],[data-app]');
    const actions=[];
    if(icon)actions.push(['Open',()=>icon.dataset.workspaceApp?openUtility(icon.dataset.workspaceApp):window.PrempehDesktopLab.openApp(icon.dataset.app)]);
    actions.push(['Project Center',()=>openUtility('projects')],['Refresh',refresh],['Sort icons by name',()=>$$('.vm-desktop-icon',$('#vmDesktopIcons')).sort((a,b)=>a.textContent.localeCompare(b.textContent)).forEach(e=>$('#vmDesktopIcons').append(e))],['New text note',()=>openUtility('notepad')],['New folder',()=>{openUtility('explorer');window.PrempehFiles?.newFolder();}],['Show desktop',()=>windows().forEach(w=>w.classList.add('hidden'))],['Display settings',()=>openUtility('control')]);
    const el=document.createElement('div');el.id='workspaceContext';el.setAttribute('role','menu');el.setAttribute('aria-label','Desktop actions');
    actions.forEach(([label,action])=>{const b=document.createElement('button');b.setAttribute('role','menuitem');b.textContent=label;b.onclick=()=>{dismissMenu();action();};el.append(b);});
    desktop.append(el);const r=desktop.getBoundingClientRect();
    el.style.left=Math.max(0,Math.min(event.clientX-r.left,desktop.clientWidth-el.offsetWidth-8))+'px';
    el.style.top=Math.max(0,Math.min(event.clientY-r.top,desktop.clientHeight-el.offsetHeight-52))+'px';
    $('button',el).focus();
    el.onkeydown=e=>{const list=$$('button',el),index=list.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();list[e.key==='Home'?0:e.key==='End'?list.length-1:(index+(e.key==='ArrowDown'?1:-1)+list.length)%list.length].focus();}if(e.key==='Escape'){e.preventDefault();dismissMenu();contextReturn?.focus();}if(e.key==='Tab')dismissMenu();};
  }
  function mount() {
    top=20;dismissMenu();
    const desktop=$('#vmDesktop');desktop.classList.add('enterprise-workspace');desktop.tabIndex=0;
    $('#vmMission').classList.remove('ticket-minimized','workspace-ticket-front');
    const icons=$('#vmDesktopIcons');
    Object.entries(apps).forEach(([id,[glyph,name]])=>{const b=document.createElement('button');b.className='vm-desktop-icon';b.dataset.workspaceApp=id;b.innerHTML=`<span class="vm-icon-glyph">${window.PrempehIcons.html(id)}</span><span>${name}</span>`;b.onclick=()=>{openUtility(id);};icons.append(b);});
    const start=$('#vmStartMenu');start.dataset.enterprise='1';
    start.innerHTML='<div class="workspace-start-head"><strong>PrempehTech · Enterprise Desktop</strong><label>Search applications<input type="search" placeholder="Find an app…"></label></div><div class="workspace-start-apps"></div><div class="workspace-start-foot"><span>Training workspace</span><button data-exit>Exit desktop</button></div>';
    const items=$('.workspace-start-apps',start);
    const options=[...Object.entries(apps).map(([id,[icon,label]])=>({id,label,icon,run:()=>openUtility(id)})),...runtime().current.data.apps.map(id=>({id,label:runtime().APP_DEFS[id].label,icon:runtime().APP_DEFS[id].glyph,run:()=>window.PrempehDesktopLab.openApp(id)}))];
    const search=()=>{items.replaceChildren();const filtered=options.filter(a=>a.label.toLowerCase().includes($('input',start).value.toLowerCase()));filtered.forEach(a=>{const b=document.createElement('button');b.innerHTML=`${window.PrempehIcons.html(a.id)}<span>${escape(a.label)}</span>`;b.onclick=()=>{start.classList.add('hidden');a.run();};items.append(b);});if(!filtered.length)items.textContent='No applications found.';};$('input',start).oninput=search;search();
    $('[data-exit]',start).onclick=()=>window.PrempehDesktopLab.close();
    if(!$('#workspaceStatus')){const status=document.createElement('div');status.id='workspaceStatus';status.setAttribute('role','status');desktop.append(status);}
    if(!desktop.dataset.workspaceBound){
      desktop.dataset.workspaceBound='true';desktop.addEventListener('contextmenu',menu);
      desktop.addEventListener('keydown',e=>{if(e.key==='F5'){e.preventDefault();refresh();}if(e.key==='Escape')dismissMenu();if(e.key==='ContextMenu'||e.shiftKey&&e.key==='F10'){const r=e.target.getBoundingClientRect();menu({target:e.target,clientX:r.left+20,clientY:r.top+20,preventDefault:()=>e.preventDefault()});}});
      document.addEventListener('pointerdown',e=>{if(!e.target.closest('#workspaceContext'))dismissMenu();});
    }
    $('#vmStart').textContent='PT';$('#vmStart').setAttribute('aria-label','Open Start menu');$('#vmStart').onclick=()=>setTimeout(()=>{if(!start.classList.contains('hidden'))$('input',start).focus();},0);
    applyPrefs();window.PrempehSession?.mount();
  }
  window.PrempehWorkspace={mount,manage,focus,openUtility,refresh,announce,windows,show,showTicket:()=>{windows().forEach(w=>w.classList.remove("workspace-focused"));$("#vmMission").classList.add("workspace-ticket-front");}};
  document.addEventListener('DOMContentLoaded',()=>$('#openWorkspaceBtn')?.addEventListener('click',()=>window.PrempehDesktopLab.openWorkspace()));
})();
