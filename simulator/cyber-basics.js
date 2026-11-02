/* Browser-only teaching experiments. No real secrets, uploads, external URLs or executable input. */
(() => {
 'use strict';
 const lab=window.PrempehDesktopLab, rt=()=>lab.getRuntime(),bytes=s=>new TextEncoder().encode(s),hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
 const hash=async s=>hex(await crypto.subtle.digest('SHA-256',bytes(s)));
 const sample='Meet at the training room';
 let model={done:[],output:[],busy:false};
 for(let id=1;id<=5;id++)lab.getScenario('cyber',id).archived=true;
 for(const item of window.PrempehCyberBeginnerCatalog)lab.registerScenario('cyber',item.slot,item);
 const cases={6:[4],7:[1],8:[2],9:[3],10:[4],11:[5],12:[2],13:[1],14:[4],15:[3,5]};
 for(const [slot,ids] of Object.entries(cases))lab.getScenario('cyber',Number(slot)).caseStudies=ids;
 const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e};
 function button(text,fn){const b=node('button',text);b.type='button';b.className='vm-native-btn';b.onclick=fn;return b;}
 async function derive(password,salt){const key=await crypto.subtle.importKey('raw',bytes(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',iterations:600000,salt},key,256));}
 async function experiment(n,step,s){
  switch(n){
   case 1:
    if(step===0){s.file='Training records';s.original=s.file;s.fingerprint=await hash(s.file);return 'Visitor has no permission. Access denied. Confidentiality protects the file.';}
    if(step===1){s.file+=' changed';return 'Original SHA-256: '+s.fingerprint+'\nChanged SHA-256: '+await hash(s.file)+'\nIntegrity mismatch.';}
    s.file=s.original;return 'Backup restored. File available: '+s.file;
   case 2:
    if(step===0){s.publicWrite=true;return 'Asset: Customer training records\nOwner: Training team\nPublic write permission: enabled\nImpact: records could be altered.';}
    if(step===1)return s.publicWrite?'An unauthorized visitor changed a record. Threat: unauthorized modification. Vulnerability: public write permission.':'Write blocked.';
    s.publicWrite=false;return 'Public write permission removed. Unauthorized write now denied. Records retained.';
   case 3:
    if(step===0){s.file=sample;s.expected=await hash(s.file);return 'Original file: '+s.file+'\nTrusted SHA-256: '+s.expected+'\nLength: '+s.expected.length+' hexadecimal characters.';}
    if(step===1){s.file=sample+'!';s.actual=await hash(s.file);return 'Edited file: '+s.file+'\nSHA-256: '+s.actual+'\nChanged character produces a different hash.';}
    return s.actual===s.expected?'Trusted checksum matched.':'Checksum mismatch. Reject changed file. You cannot decrypt a hash to recover this file.';
   case 4:
    if(step===0){s.key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);s.iv=crypto.getRandomValues(new Uint8Array(12));s.cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv:s.iv},s.key,bytes(sample));return 'Fresh AES-256-GCM key and 96-bit nonce generated. Key stays in memory.\nCiphertext and authentication tag (hex): '+hex(s.cipher)+'\nEncoding bytes as hex does not itself provide encryption.';}
    if(step===1){const wrong=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);try{await crypto.subtle.decrypt({name:'AES-GCM',iv:s.iv},wrong,s.cipher);throw new Error('Unexpected authentication success')}catch(e){if(e.name!=='OperationError')throw e;return 'Authentication failed. The wrong key cannot decrypt the message.';}}
    return 'Original key decrypted: '+new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:s.iv},s.key,s.cipher));
   case 5:
    if(step===0){s.pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},false,['sign','verify']);s.signature=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},s.pair.privateKey,bytes(sample));const ok=await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},s.pair.publicKey,s.signature,bytes(sample));return 'Private key signed the message. Public key verified: '+ok+'\nSignature (hex): '+hex(s.signature);}
    if(step===1){const ok=await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},s.pair.publicKey,s.signature,bytes(sample+'!'));if(ok)throw new Error('Unexpected tampered signature acceptance');return 'Tampered-message signature verification: rejected.';}
    return 'Original verification: '+await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},s.pair.publicKey,s.signature,bytes(sample))+'\nMessage is still readable. Signatures provide integrity and signer authenticity, not confidentiality.';
   case 6:
    if(step===0)return 'Passphrase review: password123 (predictable); Cedar-River-Orbit-Lantern (longer sample, now public). Never reuse these examples. Generate a unique passphrase per account with a password manager; length alone does not make a known sample secret.';
    if(step===1){s.salt=crypto.getRandomValues(new Uint8Array(16));s.salt2=crypto.getRandomValues(new Uint8Array(16));s.digest=await derive('lab-password',s.salt);s.digest2=await derive('lab-password',s.salt2);return 'Same lab password; two random salts.\nSalt A: '+hex(s.salt)+'\nHash A: '+s.digest+'\nSalt B: '+hex(s.salt2)+'\nHash B: '+s.digest2+'\nDifferent stored hashes. Salts may be stored alongside hashes.';}
    return 'Correct sample accepted: '+(await derive('lab-password',s.salt)===s.digest)+'\nIncorrect sample accepted: '+(await derive('incorrect-password',s.salt)===s.digest)+'\nUse purpose-built password hashing, not a fast unsalted SHA-256 hash.';
   case 7:
    if(step===0){s.factor=false;s.recoveryUnused=true;return 'Training sign-in: password accepted, second factor required. Access denied until a second factor is presented.';}
    if(step===1){s.factor=true;return 'Lab authenticator presented. Knowledge (password) + possession (authenticator). Lab account sign-in accepted.';}
    {const first=s.recoveryUnused;s.recoveryUnused=false;return 'Recovery code first use accepted: '+first+'\nReplay accepted: '+s.recoveryUnused+'\nStore unused recovery codes privately. Report unexpected MFA prompts.';}
   case 8:
    if(step===0)return 'Sample sender: support@signin-review.invalid\nSubject: URGENT — enter your password or lose access\nClaimed link text: training.example.invalid\nUnexpected urgency and a credential request are warning signs.';
    if(step===1){const url=new URL('https://training.example.invalid.signin-review.invalid/login');return 'Actual hostname: '+url.hostname+'\nProtocol: '+url.protocol+'\nThis is not training.example.invalid. HTTPS does not make this destination trustworthy. No link was opened.';}
    return 'Message reported to the lab help desk. No credentials entered. Navigate using a known trusted address, not the message link.';
   case 9:
    if(step===0){s.permissions={visitor:[],analyst:[]};return 'Visitor write: '+(s.permissions.visitor.includes('write')?'allowed':'denied');}
    if(step===1){s.permissions.analyst=['read'];return 'Assigned analyst permission: read only. No write or administration permission granted.';}
    return ['read','write','admin'].map(action=>'Analyst '+action+': '+(s.permissions.analyst.includes(action)?'allowed':'denied')).join('\n');
   case 10:
    if(step===0){s.version=2;s.file='Quarterly training notes';return 'Lab application updated to version '+s.version+'.';}
    if(step===1){s.backup=String(s.file);s.expected=await hash(s.backup);return 'Separate session backup created. Backup hash: '+s.expected;}
    s.file=null;s.file=String(s.backup);return 'Working copy deleted, then restored from backup.\nRestored content: '+s.file+'\nRestored hash: '+await hash(s.file)+'\nContent and hash match: '+(await hash(s.file)===s.expected);
  }
 }
 function mount(win){
  if(!rt().current.data.beginner||win.dataset.app!=='basics'||win.querySelector('[data-cyber-experiment]'))return;
  const data=rt().current.data,s=model,section=node('section');section.className='cyber-experiment';section.dataset.cyberExperiment='';
  section.append(node('h3','Hands-on experiment'),node('p',data.intro),node('p','Use lab data only; do not enter personal information or account passwords. Session keys and files reset when this workspace is reloaded. After resuming a saved attempt, rerun the experiment from step 1 before continuing an unfinished checkpoint.'));
  data.actions.forEach((action,i)=>{const out=node('pre',s.output[i]||'Not run yet.');out.dataset.experimentOutput=i;out.setAttribute('aria-live','polite');const b=button((i+1)+'. '+action,async()=>{if(s.busy||s.done[i])return;if(i&&!s.done[i-1]){out.textContent='Run experiment step '+i+' first.';return;}s.busy=true;b.disabled=true;try{const result=await experiment(data.displayNumber,i,s);if(s!==model)return;s.output[i]=result;s.done[i]=true;out.textContent=result;}catch{out.textContent='The experiment could not finish. Refresh and retry in a browser with Web Crypto support.';}finally{s.busy=false;b.disabled=!!s.done[i];}});b.dataset.experimentStep=i;b.disabled=!!s.done[i];section.append(b,out);});
  win.querySelector('.vm-app-body').prepend(section);
  window.PrempehBeginnerLearning?.enhance(win);
 }
 function block(id){const {current,taskState}=rt(),t=current.data.tasks.find(x=>x.id===id);if(!current.data.beginner||!t)return null;if((t.dependencies||[]).some(x=>!taskState[x]))return 'Validate the earlier checkpoint first.';return model.done[t.experiment]?null:'Run experiment step '+(t.experiment+1)+' and read its result before validating this checkpoint.';}
 function openCase(id){
  const data=lab.getScenario('cyber',id),d=node('dialog');d.className='lab-environment-dialog';d.setAttribute('aria-label','Integrated case study');d.append(node('h2',data.title),node('p',data.ticket),node('p','Retained from the original cybersecurity foundation course. Practice these investigation steps before continuing the current incident. Historical completions and points remain unchanged; this case adds no separate monthly points.'));
  let saved={};try{saved=PrempehSecurity.progress(JSON.parse(localStorage.getItem('prempehtech-simulator-progress-v1')||'{}'))}catch{}
  if(saved.completedLevels?.['cyber:'+id])d.append(node('p','Previously completed in the original curriculum ✓'));
  const passed=new Set();
  for(const [i,t] of data.tasks.entries()){
   const form=node('form');form.append(node('h3',t.title));if(t.evidence)form.append(node('pre',t.evidence.map(r=>r.join(' | ')).join('\n')));
   if(t.type==='command'){
    const directions=node('details');directions.append(node('summary','Show exact steps'),node('p','Type each command below into Case command, then click Run case command after each.'));for(const command of t.required)directions.append(node('pre',command));
    const input=node('input');input.type='text';input.maxLength=256;input.setAttribute('aria-label','Case command');const out=node('pre'),status=node('p');status.setAttribute('role','status');const run=node('button','Run case command');run.type='submit';form.append(directions,input,run,out,status);const seen=new Set();
    form.onsubmit=e=>{e.preventDefault();if(i&&!passed.has(data.tasks[i-1].id)){status.textContent='Complete the preceding case step first.';return;}const raw=input.value.trim().toLowerCase().replace(/\s+/g,' '),command=t.required.find(c=>c.toLowerCase().replace(/\s+/g,' ')===raw);if(!command){out.textContent='Unsupported command for this case. Open Show exact steps to see supported checks.';return;}seen.add(command);out.textContent+=(out.textContent?'\n':'')+command+'\n'+(t.responses?.[command]||t.title+' — PASS (isolated case simulation)');if(seen.size===t.required.length){passed.add(t.id);status.textContent=passed.size===data.tasks.length?'Case study complete. Return to your current incident and apply these investigation skills.':'Case step validated. Continue to the next step.';}};d.append(form);continue;
   }
   const directions=node('details');directions.append(node('summary','Show exact steps'));t.fields.forEach(([key,label,type])=>directions.append(node('p',(type==='select'?'Select ':'Enter ')+t.expected[key]+' in '+label+'.')));directions.append(node('p','Click Validate case step, then continue to the next section.'));form.append(directions);
   const fields={};for(const [key,label,type,options] of t.fields){const row=node('label',label),f=node(type==='select'?'select':'input');f.setAttribute('aria-label',label);if(type==='select'){f.append(new Option('Select…',''));for(const option of options)f.append(new Option(option,option));}else{f.type='text';f.maxLength=256;}row.append(f);fields[key]=f;form.append(row);}
   const status=node('p');status.setAttribute('role','status');const submit=node('button','Validate case step');submit.type='submit';form.append(submit,status);form.onsubmit=e=>{e.preventDefault();if(i&&!passed.has(data.tasks[i-1].id)){status.textContent='Complete the preceding case step first.';return;}const ok=Object.entries(t.expected).every(([k,v])=>fields[k].value.trim().toLowerCase()===String(v).trim().toLowerCase());status.textContent=ok?'Case step validated. Continue to the next step.':'Review the evidence and your choices.';if(ok)passed.add(t.id);if(passed.size===data.tasks.length)status.textContent='Case study complete. Return to your current incident and apply these investigation skills.';};d.append(form);
  }
  d.append(button('Return to current lab',()=>d.close()));d.addEventListener('close',()=>d.remove());document.body.append(d);d.showModal();
 }
 function caseButton(){const {current}=rt();if(current.track!=='cyber'||!cases[current.level])return;for(const id of cases[current.level]){const b=button('Case study: '+lab.getScenario('cyber',id).title,()=>openCase(id));b.className='vm-desktop-icon';b.dataset.cyberCase=id;document.getElementById('vmDesktopIcons').append(b);}}
 window.PrempehCyberBasics={mount,block,reset:()=>{window.PrempehBeginnerLearning?.closeFocus();model={done:[],output:[],busy:false}},caseButton,openCase};
})();
