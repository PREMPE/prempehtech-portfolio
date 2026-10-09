/* Virtual files never access the visitor's real filesystem. */
(() => {
  'use strict';
  const KEY='prempeh-workspace-files-v1';
  const $=(s,r=document)=>r.querySelector(s);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let files;
  try{files=JSON.parse(localStorage.getItem(KEY));}catch{}
  if(!Array.isArray(files))files=[
    {id:'documents',parent:'root',name:'Documents',type:'folder'},
    {id:'desktop',parent:'root',name:'Desktop',type:'folder'},
    {id:'readme',parent:'documents',name:'Welcome.txt',type:'text',content:'Welcome to CORP IT Operations.\n\nOpen Project Center for 25 practical assignments. Use Operations notes to record your work.\n\nFiles in this workspace are simulated and stored in this browser. Export important notes before clearing browser data.'}
  ];
  const views=new Map();let activeBody=null;
  const workspace=()=>window.PrempehWorkspace;
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(files));return true;}catch{workspace().announce('File could not be saved to browser storage. Export it to keep a copy.');return false;}};
  function ask(title,initial,accept){
    const dialog=document.createElement('dialog');dialog.className='workspace-dialog';dialog.innerHTML=`<form><h2>${esc(title)}</h2><label>Name<input required maxlength="80" value="${esc(initial)}" autocomplete="off"></label><p data-error role="alert"></p><div><button type="button" data-cancel>Cancel</button><button type="submit">Save</button></div></form>`;
    document.body.append(dialog);const input=$('input',dialog);const close=()=>{dialog.close();dialog.remove();};
    $('[data-cancel]',dialog).onclick=close;dialog.oncancel=()=>dialog.remove();
    $('form',dialog).onsubmit=e=>{e.preventDefault();const name=input.value.trim();if(!name||/[\\/]/.test(name)){ $('[data-error]',dialog).textContent='Enter a name without slashes.';return; }const error=accept(name);if(error){$('[data-error]',dialog).textContent=error;return;}close();};
    dialog.showModal();input.select();
  }
  function duplicate(parent,name,except){return files.some(f=>!f.deleted&&f.parent===parent&&f.name.toLowerCase()===name.toLowerCase()&&f.id!==except);}
  function create(body,type){
    const view=views.get(body);if(!view||view.folder==='recycle')return;
    ask(type==='folder'?'New folder':'New text document',type==='folder'?'New folder':'Untitled.txt',name=>{
      if(duplicate(view.folder,name))return 'A file with this name already exists.';
      const file={id:crypto.randomUUID(),parent:view.folder,name,type,content:''};files.push(file);save();refreshViews();if(type==='text')openFile(file);
    });
  }
  function refreshViews(){for(const [body] of views){if(body.isConnected)draw(body);else views.delete(body);}}
  function openFile(file){
    workspace().openUtility('notepad');const body=$('[data-utility="notepad"] .workspace-body');
    body.innerHTML=`<div class="workspace-toolbar"><span>Documents / ${esc(file.name)}</span><button data-export>Download .txt</button></div><label class="workspace-note-label">${esc(file.name)}<textarea class="workspace-notes" spellcheck="false"></textarea></label><p role="status" data-save>Saved on this browser</p>`;
    const input=$('textarea',body);input.value=file.content||'';
    input.oninput=()=>{file.content=input.value;$('[data-save]',body).textContent=save()?'Saved on this browser':'Not saved — export a copy';};
    $('[data-export]',body).onclick=()=>{const url=URL.createObjectURL(new Blob([input.value],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  }
  function removeTree(id,deleted){
    const file=files.find(f=>f.id===id);if(!file)return;file.deleted=deleted;
    files.filter(f=>f.parent===id).forEach(f=>removeTree(f.id,deleted));
  }
  function draw(body){
    const view=views.get(body),recycle=view.folder==='recycle';const current=files.find(f=>f.id===view.folder);
    const list=files.filter(f=>recycle?f.deleted&&!files.find(p=>p.id===f.parent)?.deleted:!f.deleted&&f.parent===view.folder).sort((a,b)=>a.type===b.type?a.name.localeCompare(b.name):a.type==='folder'?-1:1);
    body.innerHTML=`<div class="workspace-toolbar"><button data-up ${view.folder==='root'||recycle?'disabled':''}>↑ Up</button><span>${recycle?'Recycle Bin':'This PC / '+esc(current?.name||'CORP Workspace')}</span><button data-refresh>↻ Refresh</button></div>${recycle?'<p>Deleted virtual files can be restored here.</p>':'<div class="workspace-file-actions"><button data-new-folder>New folder</button><button data-new-text>New text document</button><button data-projects>Project Center</button></div>'}<div class="workspace-file-list" aria-label="Files"></div><p>${list.length} item${list.length===1?'':'s'} · stored in this browser</p>`;
    const container=$('.workspace-file-list',body);
    if(!list.length)container.innerHTML='<p>This folder is empty.</p>';
    list.forEach(file=>{
      const row=document.createElement('div');row.className='workspace-file-row';row.innerHTML=`<button data-open ${recycle?'disabled':''}>${file.type==='folder'?'▤':'▧'} ${esc(file.name)}</button><span>${file.type==='folder'?'Folder':'Text document'}</span><div>${recycle?'<button data-restore>Restore</button>':'<button data-rename>Rename</button><button data-delete>Delete</button>'}</div>`;container.append(row);
      $('[data-open]',row).onclick=()=>{activeBody=body;if(file.type==='folder'){view.folder=file.id;draw(body);}else openFile(file);};
      if(recycle){$('[data-restore]',row).onclick=()=>{if(duplicate(file.parent,file.name,file.id)){workspace().announce('Restore conflict: a file with this name already exists. Rename that file first.');return;}removeTree(file.id,false);save();refreshViews();workspace().announce('Restored '+file.name);};}
      else {
        $('[data-rename]',row).onclick=()=>ask('Rename',file.name,name=>{if(duplicate(file.parent,name,file.id))return 'A file with this name already exists.';file.name=name;save();refreshViews();});
        $('[data-delete]',row).onclick=()=>{removeTree(file.id,true);save();refreshViews();workspace().announce('Moved '+file.name+' to Recycle Bin.');};
      }
      row.oncontextmenu=e=>{
        e.preventDefault();e.stopPropagation();$('#workspaceContext')?.remove();
        const menu=document.createElement('div');menu.id='workspaceContext';menu.setAttribute('role','menu');menu.setAttribute('aria-label','File actions');
        [...row.querySelectorAll('button:not(:disabled)')].forEach(source=>{const button=document.createElement('button');button.setAttribute('role','menuitem');button.textContent=source.hasAttribute('data-open')?'Open':source.textContent;button.onclick=()=>{menu.remove();source.click();};menu.append(button);});
        const desktop=$('#vmDesktop'),rect=desktop.getBoundingClientRect();desktop.append(menu);menu.style.left=Math.max(0,Math.min(e.clientX-rect.left,desktop.clientWidth-menu.offsetWidth-8))+'px';menu.style.top=Math.max(0,Math.min(e.clientY-rect.top,desktop.clientHeight-menu.offsetHeight-54))+'px';$('button',menu).focus();
        menu.onkeydown=event=>{const items=[...menu.querySelectorAll('button')],i=items.indexOf(document.activeElement);if(event.key==='Escape'){menu.remove();$('[data-open]',row).focus();}if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();items[(i+(event.key==='ArrowDown'?1:-1)+items.length)%items.length].focus();}};
      };
    });
    $('[data-up]',body).onclick=()=>{view.folder=current?.parent||'root';draw(body);};$('[data-refresh]',body).onclick=()=>{draw(body);workspace().announce('Folder refreshed.');};
    if(!recycle){$('[data-new-folder]',body).onclick=()=>create(body,'folder');$('[data-new-text]',body).onclick=()=>create(body,'text');$('[data-projects]',body).onclick=()=>workspace().openUtility('projects');}
  }
  function render(body,folder='root'){views.set(body,{folder});activeBody=body;draw(body);}
  function storeDocument(name,content){
    let folder=files.find(f=>f.id==='documents'&&!f.deleted)||files.find(f=>f.parent==='root'&&f.name==='Network reports'&&f.type==='folder'&&!f.deleted);
    if(!folder){folder={id:crypto.randomUUID(),parent:'root',name:'Network reports',type:'folder'};files.push(folder);}
    let unique=name,index=2;while(duplicate(folder.id,unique))unique=name.replace(/(?:\.txt)?$/,` (${index++}).txt`);
    files.push({id:crypto.randomUUID(),parent:folder.id,name:unique,type:'text',content});save();refreshViews();
  }
  window.PrempehFiles={render,storeDocument,newFolder:()=>{const body=$('[data-utility="explorer"] .workspace-body');if(body)create(body,'folder');}};
})();
