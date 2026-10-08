(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const events=[];let mounted=false,restore=[];
  const workspace=()=>window.PrempehWorkspace;
  function notify(text){events.unshift({text,time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});if(events.length>30)events.pop();}
  function dismiss(){ $('#workspaceTrayPanel')?.remove(); }
  function panel(title){
    dismiss();const el=document.createElement('section');el.id='workspaceTrayPanel';el.setAttribute('aria-label',title);
    const head=document.createElement('div');head.className='workspace-toolbar';const strong=document.createElement('strong');strong.textContent=title;const close=document.createElement('button');close.textContent='×';close.setAttribute('aria-label','Close '+title);close.onclick=dismiss;head.append(strong,close);el.append(head);$('#vmDesktop').append(el);close.focus();return el;
  }
  function lock(){
    if($('#workspaceLock'))return;
    const overlay=document.createElement('div');overlay.id='workspaceLock';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Training session locked');
    overlay.innerHTML='<div><p>CORP / IT OPERATIONS</p><h2>Session locked</h2><p>Your lab remains open. This training lock does not secure your browser or device.</p><button>Resume session</button></div>';
    const desktop=$('#vmDesktop');const siblings=[...desktop.children];siblings.forEach(e=>e.inert=true);desktop.append(overlay);const button=$('button',overlay);button.onclick=()=>{siblings.forEach(e=>e.inert=false);overlay.remove();$('#vmStart').focus();};button.focus();overlay.onkeydown=e=>{if(e.key==='Tab'){e.preventDefault();button.focus();}};
  }
  function notifications(){const el=panel('Notification center');if(!events.length){const p=document.createElement('p');p.textContent='No notifications yet.';el.append(p);}events.forEach(event=>{const p=document.createElement('p');p.textContent=event.time+' · '+event.text;el.append(p);});}
  function tasks(){
    const el=panel('Task view');const wins=workspace().windows();
    if(!wins.length){const p=document.createElement('p');p.textContent='No applications open. Use Start to launch an app.';el.append(p);}
    wins.forEach(win=>{const b=document.createElement('button');b.className='workspace-task-tile';b.textContent=win.getAttribute('aria-label')||$('.vm-title-left',win)?.textContent||'Application';b.onclick=()=>{workspace().show(win);dismiss();};el.append(b);});
  }
  function calendar(){const el=panel('Date and time');const now=new Date(),label=document.createElement('p');label.textContent=now.toLocaleDateString([],{weekday:'long',month:'long',day:'numeric',year:'numeric'});el.append(label);const grid=document.createElement('div');grid.className='workspace-calendar';['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(day=>{const span=document.createElement('strong');span.textContent=day;grid.append(span);});const first=new Date(now.getFullYear(),now.getMonth(),1).getDay(),days=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();for(let i=0;i<first;i++)grid.append(document.createElement('span'));for(let day=1;day<=days;day++){const span=document.createElement('span');span.textContent=day;if(day===now.getDate())span.className='today';grid.append(span);}el.append(grid);}
  function showDesktop(){
    const visible=workspace().windows().filter(w=>!w.classList.contains('hidden'));
    if(visible.length){restore=visible;visible.forEach(w=>w.classList.add('hidden'));}
    else restore.filter(w=>w.isConnected).forEach(w=>workspace().show(w));
  }
  function mount(){
    dismiss();const bar=$('.vm-taskbar');
    if(!$('#workspaceTray')){
      const tray=document.createElement('div');tray.id='workspaceTray';
      [['Task view','▤',tasks],['Notifications','♧',notifications],['Lock session','▣',lock],['Show desktop','▏',showDesktop]].forEach(([label,glyph,action])=>{const b=document.createElement('button');b.textContent=glyph;b.title=label;b.setAttribute('aria-label',label);b.onclick=action;tray.append(b);});bar.insertBefore(tray,$('#vmClock'));
      const clock=$('#vmClock');clock.setAttribute('role','button');clock.tabIndex=0;clock.setAttribute('aria-label','Open calendar');clock.onclick=calendar;clock.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();calendar();}};
    }
    const footer=$('.workspace-start-foot');if(footer){
      const lockBtn=document.createElement('button');lockBtn.textContent='Lock';lockBtn.onclick=()=>{$('#vmStartMenu').classList.add('hidden');lock();};
      const restart=document.createElement('button');restart.textContent='Restart';restart.onclick=()=>{if(confirm('Restart the training desktop? In-progress lab configuration will reset. Saved files and completed projects are kept.'))window.PrempehDesktopLab.openWorkspace();};footer.prepend(lockBtn,restart);
    }
    if(!mounted){mounted=true;document.addEventListener('keydown',e=>{
      if(!document.body.classList.contains('vm-lab-active')||$('#workspaceLock'))return;
      if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()==='p'){e.preventDefault();workspace().openUtility('projects');}
      if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()==='l'){e.preventDefault();lock();}
      if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()==='t'){e.preventDefault();tasks();}
      if(e.key==='Escape')dismiss();
    });}
  }
  window.PrempehSession={mount,notify,lock};
})();
