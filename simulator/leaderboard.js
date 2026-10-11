(() => {
 'use strict';
 const tracks=['networking','sysadmin','cyber','cloud','integrated'];
 const dialog=document.createElement('dialog');dialog.className='leaderboard';dialog.setAttribute('aria-labelledby','leaderboardTitle');
 dialog.innerHTML='<header><h2 id="leaderboardTitle">Top 20 practice leaderboard</h2><button data-close aria-label="Close leaderboard">×</button></header><p>Rankings use saved lab completions: Level 1 = 100 points, Level 2 = 200, Level 3 = 300. Replays do not add points. These are practice results reported by the simulator.</p><label>Discipline<select data-track><option value="all">All disciplines</option>'+tracks.map(t=>'<option value="'+t+'">'+window.PrempehDesktopLab.getTrackLabel(t)+'</option>').join('')+'</select></label><section><h3>Your progress on this device</h3><p data-local></p></section><section><h3>Public rankings</h3><button data-refresh>Refresh rankings</button><p data-status role="status"></p><div class="leaderboard-table"><table><thead><tr><th>Rank</th><th>Display name</th><th>Points</th><th>L1</th><th>L2</th><th>L3</th></tr></thead><tbody data-rows></tbody></table></div></section><section><h3>Choose your public visibility</h3><p>Joining is optional. Only your chosen display name and completion totals appear publicly. Your email and account ID are never included in rankings.</p><form data-profile><label>Display name<input data-name minlength="3" maxlength="24" pattern="[A-Za-z0-9][A-Za-z0-9 _-]{2,23}" required autocomplete="off"></label><label><input data-consent type="checkbox" required> Publish my display name and practice totals</label><button type="submit">Join / update profile</button></form><button data-remove>Remove me from rankings</button><button data-account>Sign in / account</button><p data-profile-status role="status"></p></section>';
 document.body.append(dialog);
 const q=s=>dialog.querySelector(s);let request=0;
 function local(){
  let saved;try{saved=JSON.parse(localStorage.getItem('prempehtech-simulator-progress-v1')||'{}')}catch{saved={}}
  const completed=window.PrempehSecurity.progress(saved).completedLevels,track=q('[data-track]').value;
  const counts=[0,0,0];window.PrempehDesktopLab.getCatalog().filter(x=>track==='all'||x.track===track).forEach(x=>{if(completed[x.track+':'+x.id])counts[x.level-1]++});
  q('[data-local]').textContent=counts.reduce((sum,n,i)=>sum+n*(i+1)*100,0)+' points · Level 1: '+counts[0]+' · Level 2: '+counts[1]+' · Level 3: '+counts[2];
 }
 function errorMessage(error){
  if(['PGRST202','42883','42P01'].includes(error?.code))return 'Public rankings are not activated yet. Your progress remains saved; check back after setup is complete.';
  if(error?.code==='23505')return 'That display name is taken. Please choose another.';
  return 'Unable to reach the leaderboard. Check your connection and sign-in status, then retry.';
 }
 async function refresh(){
  local();const token=++request;q('[data-status]').textContent='Loading rankings…';q('[data-rows]').replaceChildren();
  try{
   const rows=await window.PrempehCloud.leaderboard(q('[data-track]').value);if(token!==request)return;
   for(const row of rows.slice(0,20)){
    const tr=document.createElement('tr');for(const key of ['place','display_name','points','level_one','level_two','level_three']){
     const td=document.createElement('td');td.textContent=String(row[key]??'');tr.append(td);
    }q('[data-rows]').append(tr);
   }q('[data-status]').textContent=rows.length?'Top '+Math.min(rows.length,20)+' opted-in learners. Equal scores and advanced totals share a rank.':'No ranked completions yet. Join voluntarily after completing a lab.';
  }catch(error){if(token===request)q('[data-status]').textContent=errorMessage(error)}
 }
 q('[data-close]').onclick=()=>dialog.close();q('[data-refresh]').onclick=refresh;q('[data-track]').onchange=refresh;
 q('[data-account]').onclick=()=>{dialog.close();window.PrempehCloud.openAccount()};
 q('[data-profile]').onsubmit=async e=>{
  e.preventDefault();const status=q('[data-profile-status]');
  if(!window.PrempehCloud.isSignedIn()){status.textContent='Sign in before joining.';return}
  const button=e.submitter;button.disabled=true;status.textContent='Saving your visibility preference…';
  try{await window.PrempehCloud.setLeaderboardProfile(q('[data-name]').value.trim(),q('[data-consent]').checked);saveName(q('[data-name]').value.trim());status.textContent='Your profile is public. You can remove it at any time.';await refresh()}
  catch(error){status.textContent=errorMessage(error)}finally{button.disabled=false}
 };
 q('[data-remove]').onclick=async()=>{
  const status=q('[data-profile-status]');
  if(!window.PrempehCloud.isSignedIn()){status.textContent='Sign in to remove your profile.';return}
  try{await window.PrempehCloud.setLeaderboardProfile('',false);q('[data-consent]').checked=false;status.textContent='Your public profile has been removed. Saved lab progress is unchanged.';await refresh()}
  catch(error){status.textContent=errorMessage(error)}
 };
 function open(){q('[data-name]').value=preferredName();dialog.showModal();refresh()}
 const validName=name=>typeof name==='string'&&/^[A-Za-z0-9][A-Za-z0-9 _-]{2,23}$/.test(name);
 const storageKey=()=> 'prempeh-player-name:'+window.PrempehCloud.playerKey();
 function preferredName(){try{const name=localStorage.getItem(storageKey());return validName(name)?name:''}catch{return ''}}
 let temporaryName='',temporaryKey='';
 function saveName(name){temporaryName=name;temporaryKey=storageKey();try{localStorage.setItem(storageKey(),name)}catch{}}
 const gate=document.createElement('dialog');gate.className='leaderboard';gate.setAttribute('aria-labelledby','playerNameTitle');
 gate.innerHTML='<header><h2 id="playerNameTitle">Choose your player name</h2><button data-cancel aria-label="Cancel lab start">×</button></header><p>Enter your preferred username before starting a lab. If you join the public top 20 leaderboard, this is the name other players will see.</p><form data-player-form><label>Preferred username<input data-player-name minlength="3" maxlength="24" pattern="[A-Za-z0-9][A-Za-z0-9 _-]{2,23}" required autocomplete="nickname"></label><p>Use 3–24 letters, numbers, spaces, underscores or hyphens. Do not enter your email address.</p><label><input type="checkbox" data-player-public> Publish this username and my practice totals on the leaderboard (requires sign-in)</label><button type="submit">Save name and start lab</button></form><button data-player-account>Sign in / account</button><p data-player-status role="status"></p>';
 document.body.append(gate);const g=s=>gate.querySelector(s);let pending=null,gateEdited=false;
 gate.addEventListener('input',()=>{gateEdited=true});
 function ensureName(start){
  if(preferredName()||(temporaryKey===storageKey()&&validName(temporaryName)))return true;
  pending=start;gateEdited=false;g('[data-player-name]').value='';g('[data-player-public]').checked=false;g('[data-player-status]').textContent='';
  if(!gate.open)gate.showModal();g('[data-player-name]').focus();
  const key=storageKey();
  if(window.PrempehCloud.isSignedIn())window.PrempehCloud.ownLeaderboardProfile().then(profile=>{
   if(!gate.open||gateEdited||storageKey()!==key||!profile)return;
   if(!g('[data-player-name]').value)g('[data-player-name]').value=profile.display_name;
   g('[data-player-public]').checked=profile.opted_in;
  }).catch(()=>{});
  return false;
 }
 g('[data-cancel]').onclick=()=>{pending=null;gate.close()};gate.addEventListener('cancel',()=>{pending=null});
 g('[data-player-account]').onclick=()=>{gate.close();window.PrempehCloud.openAccount()};
 g('[data-player-form]').onsubmit=async e=>{
  e.preventDefault();const name=g('[data-player-name]').value.trim(),status=g('[data-player-status]');
  if(!validName(name)){status.textContent='Enter a valid username of 3–24 characters.';return}
  gateEdited=true;const key=storageKey(),publish=g('[data-player-public]').checked;
  if(publish&&!window.PrempehCloud.isSignedIn()){status.textContent='Sign in to publish your name, or leave public participation unchecked to practise privately.';return}
  const button=e.submitter;button.disabled=true;
  try{
   if(window.PrempehCloud.isSignedIn()){
    if(publish)await window.PrempehCloud.setLeaderboardProfile(name,true);
    else {
     try{const profile=await window.PrempehCloud.ownLeaderboardProfile();if(profile)await window.PrempehCloud.setLeaderboardProfile(name,false)}
     catch(error){if(!['PGRST202','42883','42P01'].includes(error?.code))throw error}
    }
   }
   if(storageKey()!==key){status.textContent='Your account changed. Close this prompt and start the lab again.';return}
   saveName(name);gate.close();const start=pending;pending=null;start?.();
  }catch(error){status.textContent=errorMessage(error)}finally{button.disabled=false}
 };
 document.getElementById('leaderboardBtn').onclick=open;window.PrempehLeaderboard={open,ensureName};
})();
