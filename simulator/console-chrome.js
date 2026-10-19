/* Shared console controls; configuration and scoring remain owned by each lab. */
(() => {
  'use strict';
  const sessions=new WeakMap();
  const runtime=()=>window.PrempehDesktopLab.getRuntime();
  function update(win){
    const {current,taskState}=runtime();
    const tasks=current.data.tasks.filter(t=>t.app===win.dataset.app);
    const done=tasks.filter(t=>taskState[t.id]).length;
    const session=sessions.get(win);
    if(session){
      tasks.filter(t=>!taskState[t.id]).forEach(t=>session.validated.delete(t.id));
      tasks.forEach(t=>{if(taskState[t.id]&&!session.validated.has(t.id)){session.validated.add(t.id);session.dirty.delete(t.id);session.entries.push({time:new Date(),message:'Validated: '+t.title});}});
      const picker=win.querySelector('.console-task-nav select');
      tasks.forEach(t=>{const option=[...picker.options].find(o=>o.value===t.id);if(option)option.textContent=(taskState[t.id]?'✓ ':'')+t.title;});
    }
    win.querySelector('[data-console-status]').textContent=`${done} of ${tasks.length} tasks validated · ${session?.dirty.size?'Unvalidated changes':done===tasks.length?'Configuration verified':'Configuration requires verification'}`;
  }
  function install(win){
    if(win.querySelector('.console-location'))return;
    const {current,APP_DEFS}=runtime(),id=win.dataset.app,label=APP_DEFS[id].label;
    sessions.set(win,{dirty:new Set(),validated:new Set(current.data.tasks.filter(t=>runtime().taskState[t.id]).map(t=>t.id)),entries:[{time:new Date(),message:'Opened '+label}]});
    const menu=win.querySelector('.vm-menubar');menu.replaceChildren();
    const location=document.createElement('div');location.className='console-location';
    const path=document.createElement('span');path.textContent=`PrempehTech / ${label}`;location.append(path);
    const refresh=()=>{
      // Terminal history is a session record, so refreshing must not erase it.
      if(!win.querySelector('[data-terminal-output]'))window.PrempehEnterprise?.prepareWindow(win);
      sessions.get(win).entries.push({time:new Date(),message:'Refreshed console view'});update(win);stamp.textContent='Refreshed '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    };
    const button=(text,action)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=action;return b;};
    for(const [title,items] of [
      ['File',[['Minimize',()=>win.querySelector('.vm-min').click()],['Close',()=>win.querySelector('.vm-close').click()]]],
      ['View',[['Refresh',refresh],['Maximize / Restore',()=>win.querySelector('.vm-max').click()]]],
      ['Help',[['Project procedure',()=>{window.PrempehWorkspace.showTicket();document.querySelector('[data-pane="procedure"]')?.click();document.querySelector('.enterprise-guide')?.scrollIntoView({block:'start'});}]]]
    ]){
      const details=document.createElement('details'),summary=document.createElement('summary'),list=document.createElement('div');summary.textContent=title;list.className='console-menu';
      items.forEach(([name,action])=>list.append(button(name,()=>{details.open=false;action();})));
      details.append(summary,list);menu.append(details);
      details.addEventListener('toggle',()=>{if(details.open)menu.querySelectorAll('details').forEach(other=>{if(other!==details)other.open=false;});});
    }
    location.append(button('↻ Refresh',refresh),button('Activity log',()=>{
      const dialog=document.createElement('dialog');dialog.className='console-properties';dialog.setAttribute('aria-label','Console activity log');
      const title=document.createElement('h2');title.textContent=label+' — Activity log';
      const note=document.createElement('p');note.textContent='This console session. Entries record actual actions and task validations.';
      const list=document.createElement('ol');sessions.get(win).entries.forEach(entry=>{const item=document.createElement('li');item.textContent=entry.time.toLocaleTimeString()+' · '+entry.message;list.append(item);});
      dialog.append(title,note,list,button('Close',()=>dialog.close()));dialog.addEventListener('close',()=>dialog.remove());document.body.append(dialog);dialog.showModal();
    }));
    const nav=document.createElement('label');nav.className='console-task-nav';nav.append('Configuration section ');
    const picker=document.createElement('select');picker.setAttribute('aria-label','Go to configuration section');
    picker.append(new Option('Choose a section…',''));
    current.data.tasks.filter(t=>t.app===id).forEach(t=>picker.append(new Option(t.title,t.id)));
    picker.onchange=()=>{
      const task=current.data.tasks.find(t=>t.id===picker.value);if(!task)return;
      if(task.service)win.querySelector(`[data-cloud-service="${task.service}"]`)?.click();
      const target=win.querySelector(`[data-field^="${task.id}:"]`)||win.querySelector('form input')||win.querySelector(`[data-feedback="${task.id}"]`);
      target?.scrollIntoView({block:'center'});target?.focus();
    };
    nav.append(picker);menu.after(location,nav);
    const status=document.createElement('div');status.className='console-status';
    const state=document.createElement('span');state.dataset.consoleStatus='';state.setAttribute('role','status');
    const stamp=document.createElement('span');stamp.textContent='Training session';status.append(state,stamp);win.append(status);update(win);
    win.addEventListener('keydown',e=>{
      if(e.key==='F5'){e.preventDefault();e.stopPropagation();refresh();}
      if(e.key==='Escape')menu.querySelectorAll('details').forEach(d=>d.open=false);
    });
    const body=win.querySelector('.vm-app-body');
    body.addEventListener('input',e=>{
      if(!e.target.matches('[data-field]'))return;
      const taskId=e.target.dataset.field.split(':')[0],session=sessions.get(win);
      if(!session.dirty.has(taskId))session.entries.push({time:new Date(),message:'Editing: '+(runtime().current.data.tasks.find(t=>t.id===taskId)?.title||'Configuration')});
      session.dirty.add(taskId);update(win);
    });
    function properties(e){
      const row=e.target.closest('tr');if(!row||!row.querySelector('td')||e.target.closest('button,input,select,textarea,a'))return;
      e.preventDefault();
      const dialog=document.createElement('dialog');dialog.className='console-properties';dialog.setAttribute('aria-label','Record properties');
      const heading=document.createElement('h2');heading.textContent='Record properties';
      const source=document.createElement('p');source.textContent=label+' · Current lab evidence';
      const list=document.createElement('dl'),headers=[...row.closest('table').querySelectorAll('tr:first-child th')];
      [...row.cells].forEach((cell,i)=>{const term=document.createElement('dt'),value=document.createElement('dd');term.textContent=headers[i]?.textContent||`Field ${i+1}`;value.textContent=cell.textContent;list.append(term,value);});
      dialog.append(heading,source,list,button('Close',()=>dialog.close()));dialog.addEventListener('close',()=>dialog.remove());document.body.append(dialog);dialog.showModal();
    }
    body.addEventListener('click',e=>{
      const submit=e.target.closest('[data-submit-task]');if(!submit)return;
      const id=submit.dataset.submitTask;
      const feedback=body.querySelector(`[data-feedback="${id}"]`);
      if(feedback?.classList.contains('ok')){sessions.get(win).dirty.delete(id);update(win);}
    });
    body.addEventListener('dblclick',properties);body.addEventListener('contextmenu',properties);
  }
  document.addEventListener('pointerdown',e=>document.querySelectorAll('.vm-menubar details[open]').forEach(d=>{if(!d.contains(e.target))d.open=false;}));
  window.addEventListener('prempeh-desktop-activity',()=>document.querySelectorAll('.vm-window[data-app]').forEach(win=>{if(win.querySelector('[data-console-status]'))update(win);}));
  window.addEventListener('prempeh-environment-change',()=>document.querySelectorAll('.vm-window[data-app]').forEach(win=>{if(win.querySelector('[data-console-status]'))update(win);}));
  window.PrempehConsoleChrome={install};
})();
