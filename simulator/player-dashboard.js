(() => {
 'use strict';
 const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e};
 const button=(text,fn)=>{const b=node('button',text);b.type='button';b.onclick=fn;return b};
 const cloud=()=>PrempehCloud;
 function error(e){return ['PGRST202','42883','42P01'].includes(e?.code)?'Recovery and private prize claims need the player-services SQL migration. Lab enrollment and points remain available.':e?.message||'Service unavailable. Please retry.';}
 async function open(){
  const d=node('dialog');d.className='lab-environment-dialog';d.setAttribute('aria-label','Player dashboard');d.append(button('Close dashboard',()=>d.close()),node('h2','Player dashboard'));
  const status=node('p');status.setAttribute('role','status');
  const clock=node('p','Loading competition period…'),summary=node('p'),activity=node('div'),prizes=node('section');
  d.append(clock,node('p','Monthly prize: CAD $50 Amazon voucher. Most points wins; ties use completed labs, then earliest result. Results remain provisional until manual review.'),summary,activity);
  const recovery=node('section');recovery.append(node('h3','Guest recovery'),node('p','Keep a private recovery code to restore your public username and server-saved points in a fresh browser. It does not move unfinished attempts saved on another device. A used code is invalidated, and the old browser loses access to the recovered records.'));
  const output=node('textarea');output.readOnly=true;output.hidden=true;output.setAttribute('aria-label','Private recovery code');
  const create=button('Create / replace recovery code',async()=>{create.disabled=true;try{await cloud().ensurePlayer();if(!cloud().isGuest())throw new Error('Use your existing account sign-in to recover this player. Guest codes are only for guest identities.');const bytes=crypto.getRandomValues(new Uint8Array(32)),code=[...bytes].map(n=>n.toString(16).padStart(2,'0')).join('');await cloud().playerService('createRecovery',{p_code:code});output.value=code;output.hidden=false;status.textContent='Save this code privately now. It replaces any previous code. Anyone holding it can recover this guest player.';}catch(e){status.textContent=error(e)}finally{create.disabled=false}});
  recovery.append(create,output);
  const form=node('form'),label=node('label','Recover a guest player'),input=node('input');input.type='password';input.autocomplete='off';input.required=true;input.minLength=64;input.maxLength=64;label.append(input);const submit=node('button','Recover with code');submit.type='submit';form.append(label,submit);
  form.onsubmit=async e=>{e.preventDefault();submit.disabled=true;try{await cloud().ensurePlayer();const name=await cloud().playerService('redeemRecovery',{p_code:input.value.trim().toLowerCase()});input.value='';try{localStorage.setItem('prempeh-player-name:'+cloud().playerKey(),name)}catch{}status.textContent='Player recovered. Create a new recovery code, then reopen the dashboard. Unfinished device-only attempts are not transferred.';await cloud().syncFromCloud();}catch(e){status.textContent=error(e)}finally{submit.disabled=false}};
  recovery.append(form);prizes.append(node('h3','Private prize claim'));d.append(recovery,prizes,status,button('Refresh dashboard',()=>{d.close();open();}),button('Close',()=>d.close()));document.body.append(d);d.showModal();
  let timer;d.addEventListener('close',()=>{clearInterval(timer);output.value='';input.value='';d.remove()});
  try{
   await cloud().ready;const period=await cloud().competitionStatus();if(!d.open)return;
   const tick=()=>{const seconds=Math.max(0,Math.floor((new Date(period.closes_at)-Date.now())/1000));clock.textContent=`Month ${period.month} · ${Math.floor(seconds/86400)}d ${Math.floor(seconds%86400/3600)}h ${Math.floor(seconds%3600/60)}m remaining · closes at midnight Toronto time`;};tick();timer=setInterval(tick,30000);
   const profile=await cloud().ownLeaderboardProfile();if(!profile){summary.textContent='Enter your username and start a lab to join. Recover an existing guest before enrolling in a new lab.';return;}
   const rows=await cloud().labActivity(profile.display_name,period.month);summary.textContent=profile.display_name+' · '+rows.reduce((n,r)=>n+Number(r.points),0)+' points · '+rows.filter(r=>r.completed).length+' completed labs';
   const table=node('table'),head=node('tr');['Lab','Points','Validated steps','State'].forEach(x=>head.append(node('th',x)));table.append(head);
   rows.forEach(r=>{const lab=PrempehDesktopLab.getCatalog().find(l=>l.track===r.track&&l.id===Number(r.slot)),tr=node('tr');[lab?.data.title||r.track+' '+r.slot,r.points,r.validated+'/'+r.total,r.completed?'Complete':r.started_at?'In progress':'Not started'].forEach(x=>tr.append(node('td',String(x))));table.append(tr)});activity.className='leaderboard-table';const details=node('details');details.append(node('summary','Points by lab ('+rows.length+' labs)'),table);activity.append(details);
   try{const awards=await cloud().playerService('prizes');if(!awards.length)prizes.append(node('p','No approved prize yet. The site owner reviews the monthly winner before enabling a claim.'));
    for(const award of awards){prizes.append(node('p',award.month+' · '+(award.fulfilled?'Voucher fulfilled':award.claimed?'Contact submitted; awaiting fulfillment':'Approved — submit your private contact email')));if(award.fulfilled)continue;
     const f=node('form'),l=node('label','Contact email (visible only to the site owner)'),email=node('input');email.type='email';email.required=true;email.maxLength=254;l.append(email);const send=node('button',award.claimed?'Update private contact':'Submit private claim');send.type='submit';f.append(l,send);f.onsubmit=async e=>{e.preventDefault();send.disabled=true;try{await cloud().playerService('claim',{p_month:award.month,p_email:email.value.trim()});email.value='';status.textContent='Private contact submitted. The site owner will arrange the voucher.';}catch(e){status.textContent=error(e)}finally{send.disabled=false}};prizes.append(f);}
   }catch(e){prizes.append(node('p',error(e)))}
  }catch(e){status.textContent=error(e)}
 }
 const launch=button('Player dashboard',open);launch.className='account-btn';document.getElementById('leaderboardBtn')?.after(launch);
 window.PrempehPlayerDashboard={open};
})();
