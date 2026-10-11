(() => {
 'use strict';
 const cloud=()=>window.PrempehCloud;
 const tracks=['networking','sysadmin','cyber','cloud','integrated'];
 const validName=name=>typeof name==='string'&&/^[A-Za-z0-9][A-Za-z0-9 _-]{2,23}$/.test(name);
 const key=prefix=>prefix+':'+cloud().playerKey();
 const memoryStorage=new Map();
 const read=(name,fallback)=>{try{return JSON.parse(localStorage.getItem(key(name)))??memoryStorage.get(key(name))??fallback}catch{return memoryStorage.get(key(name))??fallback}};
 const write=(name,value)=>{memoryStorage.set(key(name),value);try{localStorage.setItem(key(name),JSON.stringify(value))}catch{}};
 let memoryName='',memoryAccount='';
 function preferredName(){try{const name=localStorage.getItem(key('prempeh-player-name'));return validName(name)?name:''}catch{return memoryAccount===cloud().playerKey()?memoryName:''}}
 function saveName(name){memoryName=name;memoryAccount=cloud().playerKey();try{localStorage.setItem(key('prempeh-player-name'),name)}catch{}}
 function errorMessage(error){
  if(['PGRST202','42883','42P01'].includes(error?.code))return 'The monthly competition is not activated yet. Practice progress is safe; monthly entry and prize points are unavailable until setup is complete.';
  if(error?.code==='23505')return 'That username is taken. Please choose another.';
  if(error?.code==='22023')return 'This entry has expired. Restart and complete the lab in the current month to earn points.';
  return 'The competition service is unavailable. Check your connection and account, then retry. No monthly points have been confirmed.';
 }
 const rules='The player with the most points earned this calendar month wins a CAD $50 Amazon voucher from PrempehTech. Level 1 = 100 points, Level 2 = 200, Level 3 = 300. Each lab counts once per month; you may complete it again next month. Months close at midnight on the first day of the next month, Toronto time. Equal points are ordered by most labs completed, then who reached that result first. One prize across all disciplines, not one per filter. Results are provisional until PrempehTech reviews the winner and arranges the voucher.';
 const dialog=document.createElement('dialog');dialog.className='leaderboard';dialog.setAttribute('aria-labelledby','leaderboardTitle');
 dialog.innerHTML='<header><h2 id="leaderboardTitle">Top 20 monthly leaderboard</h2><button data-close aria-label="Close leaderboard">×</button></header><p class="competition-prize"><strong>Monthly prize: CAD $50 Amazon voucher</strong></p><details><summary>Scoring and prize rules</summary><p>'+rules+'</p><p>Use one account per player. Lab results are reported by the simulator and reviewed before a prize is awarded.</p></details><p>Starting a lab while signed in automatically enrolls you under your preferred username. Your username and scores are public; your email and account ID are private.</p><label>Month<select data-month><option value="">Current month</option></select></label><label>Discipline<select data-track><option value="all">All disciplines — prize ranking</option>'+tracks.map(t=>'<option value="'+t+'">'+window.PrempehDesktopLab.getTrackLabel(t)+'</option>').join('')+'</select></label><section><h3>Monthly rankings</h3><p data-period></p><button data-refresh>Refresh rankings / retry pending points</button><p data-status role="status"></p><div class="leaderboard-table"><table><thead><tr><th>Rank</th><th>Username</th><th>Points</th><th>Labs</th><th>L1</th><th>L2</th><th>L3</th></tr></thead><tbody data-rows></tbody></table></div></section><section><h3>Lifetime practice progress on this device</h3><p data-local></p><p>Lifetime totals are separate from monthly competition points. Previous saved progress is not imported into a new month.</p></section><section><h3>Your player profile</h3><form data-profile><label>Preferred username<input data-name minlength="3" maxlength="24" pattern="[A-Za-z0-9][A-Za-z0-9 _-]{2,23}" required autocomplete="nickname"></label><button type="submit">Update public username</button></form><button data-remove>Withdraw from rankings</button><p>Withdrawal hides your profile and leaves learning progress intact. Starting another lab enrolls you again.</p><button data-account>Sign in / account</button><p data-profile-status role="status"></p></section>';
 document.body.append(dialog);const q=s=>dialog.querySelector(s);let request=0;
 function local(){
  let saved;try{saved=JSON.parse(localStorage.getItem('prempehtech-simulator-progress-v1')||'{}')}catch{saved={}}
  const completed=window.PrempehSecurity.progress(saved).completedLevels,track=q('[data-track]').value;
  const counts=[0,0,0];window.PrempehDesktopLab.getCatalog().filter(x=>track==='all'||x.track===track).forEach(x=>{if(completed[x.track+':'+x.id])counts[x.level-1]++});
  q('[data-local]').textContent=counts.reduce((sum,n,i)=>sum+n*(i+1)*100,0)+' lifetime practice points · Level 1: '+counts[0]+' · Level 2: '+counts[1]+' · Level 3: '+counts[2];
 }
 function setPeriods(month){
  if(q('[data-month]').dataset.current===month)return;
  const previous=q('[data-month]').value;const base=new Date(month+'T12:00:00Z');q('[data-month]').replaceChildren();
  for(let i=0;i<12;i++){
   const date=new Date(Date.UTC(base.getUTCFullYear(),base.getUTCMonth()-i,1,12));
   const option=document.createElement('option');option.value=date.toISOString().slice(0,10);option.textContent=date.toLocaleDateString('en-CA',{month:'long',year:'numeric',timeZone:'UTC'})+(i===0?' · current':' · closed');q('[data-month]').append(option);
  }
  q('[data-month]').dataset.current=month;
  if(Array.from(q('[data-month]').options).some(x=>x.value===previous))q('[data-month]').value=previous;
 }
 let flushing=null;
 async function flushPoints(){
  if(flushing){const previous=await flushing;return {...previous,...await flushPoints()}}
  if(!cloud().isSignedIn())return {};
  const account=cloud().playerKey();
  flushing=(async()=>{
   const queue=read('prempeh-monthly-pending',[]),results={};
   if(!Array.isArray(queue))return results;
   for(const id of queue){
    if(cloud().playerKey()!==account)return;
    try{results[id]=await cloud().finishCompetition(id)}catch(error){
     if(error?.code!=='22023')throw error;
     results[id]='expired';
     q('[data-profile-status]').textContent='A result from a closed month expired. Replay that lab in the current month to earn points.';
    }
    if(cloud().playerKey()!==account)return;
    write('prempeh-monthly-pending',read('prempeh-monthly-pending',[]).filter(x=>x!==id));
   }
   return results;
  })();
  try{return await flushing}finally{flushing=null}
 }
 async function refresh(){
  local();const token=++request;q('[data-status]').textContent='Loading monthly rankings…';q('[data-rows]').replaceChildren();
  try{
   const state=await cloud().competitionStatus();if(token!==request)return;setPeriods(state.month);
   let pendingError='';try{await flushPoints()}catch(error){pendingError=' Pending points: '+errorMessage(error)}
   const rows=await cloud().leaderboard(q('[data-track]').value,q('[data-month]').value);if(token!==request)return;
   for(const row of rows.slice(0,20)){
    const tr=document.createElement('tr');for(const name of ['place','display_name','points','labs','level_one','level_two','level_three']){const td=document.createElement('td');td.textContent=String(name==='labs'?Number(row.level_one||0)+Number(row.level_two||0)+Number(row.level_three||0):row[name]??'');tr.append(td)}q('[data-rows]').append(tr);
   }
   q('[data-period]').textContent=q('[data-month]').value===state.month?'Current competition closes '+new Date(state.closes_at).toLocaleString('en-CA',{timeZone:'America/Toronto'})+' (Toronto time).':'Closed month — provisional results for organizer review. A positive score is required to win.';
   q('[data-status]').textContent=(rows.length?'Top '+Math.min(rows.length,20)+' enrolled players. Results are provisional.':'No players enrolled in this month and discipline yet.')+pendingError;
  }catch(error){if(token===request)q('[data-status]').textContent=errorMessage(error)}
 }
 function open(){q('[data-name]').value=preferredName();dialog.showModal();refresh()}
 q('[data-close]').onclick=()=>dialog.close();q('[data-refresh]').onclick=refresh;q('[data-track]').onchange=refresh;q('[data-month]').onchange=refresh;
 q('[data-account]').onclick=()=>{dialog.close();cloud().openAccount()};
 q('[data-profile]').onsubmit=async e=>{
  e.preventDefault();const status=q('[data-profile-status]'),name=q('[data-name]').value.trim();
  if(!cloud().isSignedIn()){status.textContent='Sign in before updating your public username.';return}
  const account=cloud().playerKey(),button=e.submitter;button.disabled=true;
  try{await cloud().setLeaderboardProfile(name,true);if(cloud().playerKey()!==account)return;saveName(name);status.textContent='Your public username has been updated.';await refresh()}
  catch(error){status.textContent=errorMessage(error)}finally{button.disabled=false}
 };
 q('[data-remove]').onclick=async()=>{
  const status=q('[data-profile-status]');if(!cloud().isSignedIn()){status.textContent='Sign in to withdraw.';return}
  const account=cloud().playerKey();
  try{await cloud().setLeaderboardProfile('',false);if(cloud().playerKey()!==account)return;activeRun=null;write('prempeh-monthly-notice-v1',false);write('prempeh-monthly-pending',[]);status.textContent='You have withdrawn. Starting another lab enrolls you again.';await refresh()}
  catch(error){status.textContent=errorMessage(error)}
 };
 const gate=document.createElement('dialog');gate.className='leaderboard';gate.setAttribute('aria-labelledby','playerNameTitle');
 gate.innerHTML='<header><h2 id="playerNameTitle">Choose your player name</h2><button data-cancel aria-label="Cancel lab start">×</button></header><p><strong>Start a lab. Enter the monthly competition.</strong></p><p>Starting automatically enrolls your signed-in account in the public top 20 leaderboard under this username. The highest monthly score wins a CAD $50 Amazon voucher. Your email stays private.</p><form data-player-form><label>Preferred username<input data-player-name minlength="3" maxlength="24" pattern="[A-Za-z0-9][A-Za-z0-9 _-]{2,23}" required autocomplete="nickname"></label><p>Use 3–24 letters, numbers, spaces, underscores or hyphens. Do not enter your email address.</p><details><summary>Monthly scoring and prize rules</summary><p>'+rules+'</p><p>One account per player. Sign-in is required to register an entry and record prize points. Only labs started and completed during the same month count.</p></details><button type="submit">Enroll and start lab</button></form><button data-player-account>Sign in / account</button><p data-player-status role="status"></p><button data-practice-only hidden>Practise without competition points</button>';
 document.body.append(gate);const g=s=>gate.querySelector(s);let pending=null,generation=0,activeRun=null;
 function cancel(){generation++;pending=null;gate.close()}
 g('[data-cancel]').onclick=cancel;gate.addEventListener('cancel',cancel);
 g('[data-player-account]').onclick=()=>{cancel();cloud().openAccount()};
 async function enroll(){
  if(!pending)return;
  const name=g('[data-player-name]').value.trim(),status=g('[data-player-status]');
  if(!validName(name)){status.textContent='Choose a valid username before starting.';return}
  const token=generation,account=cloud().playerKey(),entry=pending,button=g('[data-player-form] button');button.disabled=true;g('[data-practice-only]').hidden=true;
  status.textContent='Registering your monthly entry…';
  try{
   try{await cloud().competitionStatus()}catch(error){if(token===generation){g('[data-practice-only]').hidden=false;status.textContent=errorMessage(error)}return}
   if(token!==generation)return;
   if(!cloud().isSignedIn()){status.textContent='Sign in, then start the lab to enter the monthly competition.';return}
   const id=await cloud().startCompetition(name,entry.track,entry.slot);
   if(token!==generation||cloud().playerKey()!==account)return;
   saveName(name);write('prempeh-monthly-notice-v1',true);activeRun={id,account,track:entry.track,slot:entry.slot};pending=null;gate.close();entry.start();
  }catch(error){if(token===generation)status.textContent=errorMessage(error)}finally{button.disabled=false}
 }
 function startLab(track,slot,start){
  generation++;pending={track,slot,start};g('[data-player-name]').value=preferredName();g('[data-player-status]').textContent='';g('[data-practice-only]').hidden=true;
  if(!gate.open)gate.showModal();
  if(validName(preferredName())&&read('prempeh-monthly-notice-v1',false))enroll();else g('[data-player-name]').focus();
 }
 g('[data-player-form]').onsubmit=e=>{e.preventDefault();enroll()};
 g('[data-practice-only]').onclick=()=>{
  const name=g('[data-player-name]').value.trim();if(!validName(name)||!pending){g('[data-player-status]').textContent='Choose a valid username before practising.';return}
  const entry=pending;saveName(name);activeRun=null;pending=null;generation++;gate.close();entry.start();
 };
 window.addEventListener('prempeh-desktop-complete',async event=>{
  const status=document.getElementById('vmCompetitionStatus'),entry=activeRun;
  const tell=text=>{if(status)status.textContent=text};
  if(!entry||entry.account!==cloud().playerKey()||entry.track!==event.detail.track||entry.slot!==Number(event.detail.level)){tell('Practice complete. This lab was not enrolled for monthly prize points.');return}
  const queue=read('prempeh-monthly-pending',[]);write('prempeh-monthly-pending',[...new Set([...(Array.isArray(queue)?queue:[]),entry.id])]);
  tell('Saving monthly competition points…');
  try{const results=await flushPoints();if(cloud().playerKey()!==entry.account){tell('Sign back into your entry account to retry saving monthly points.');return}tell(results?.[entry.id]==='expired'?'The month closed before this result was saved. Restart and complete the lab in the new month to earn points.':results?.[entry.id]>0?results[entry.id]+' monthly points saved. This lab counts once this month.': 'This lab already counted this month. Replays add no extra points. Open Leaderboard to see your score.')}
  catch(error){tell('Practice complete. Monthly result not saved: '+errorMessage(error)+' Open Leaderboard to retry.')}
 });
 window.addEventListener('online',()=>flushPoints().catch(()=>{}));
 document.getElementById('leaderboardBtn').onclick=open;window.PrempehLeaderboard={open,startLab};
})();
