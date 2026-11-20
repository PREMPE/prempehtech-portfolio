/* Prize decisions use server-recorded points and private owner-only contact endpoints. */
(() => {
 'use strict';
 const cloud=()=>window.PrempehCloud,node=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el};
 const button=(text,fn)=>{const el=node('button',text);el.type='button';el.onclick=fn;return el};
 const rules='Additional monthly prize: CAD $200 for the first eligible player to reach 4,000 server-recorded points across all disciplines. Months use Toronto time. The CAD $50 Amazon voucher for the monthly leader remains separate; the same player may win both. At 4,000 points, provide a private email or email prempehtech.ca@gmail.com with a screenshot of your username and points. Explicitly declining both contact options permanently forfeits only that month’s $200 prize. All awards require identity, eligibility and server-evidence review. If the first candidate forfeits or is disqualified, the next eligible crossing is reviewed. No threshold reached means no $200 award that month.';
 let currentDialog=null,checking=false;
 function message(error){return ['PGRST202','42883','42P01'].includes(error?.code)?'The additional prize is awaiting database activation. Existing monthly points and the CAD $50 prize are unchanged.':'The prize service is unavailable. Your contact choice has not been changed; please retry.';}
 async function open(){
  if(currentDialog?.open){currentDialog.focus();return;}
  const d=node('dialog');d.className='lab-environment-dialog';d.setAttribute('aria-label','4,000-point prize and contact');currentDialog=d;
  const state=node('p'),body=node('section'),status=node('p');status.setAttribute('role','status');
  const details=node('details');details.append(node('summary','Full prize rules and forfeiture'),node('p',rules));
  d.append(node('h2','CAD $200 · First to 4,000 points'),node('p','Choose a contact option at 4,000 monthly points. Only the first eligible player wins after review. The CAD $50 monthly-leader voucher remains separate.'),details,state,body,status,button('Close prize details',()=>d.close()));document.body.append(d);d.showModal();
  d.addEventListener('close',()=>{body.replaceChildren();d.remove();if(currentDialog===d)currentDialog=null;});
  const account=cloud().playerKey();d.dataset.owner=account;const valid=()=>d.open&&cloud().playerKey()===account;
  try{
   const pub=await cloud().milestonePublic();if(!valid())return;
   state.textContent=!pub.active?'Starts '+pub.starts_month+' (Toronto calendar month).':pub.candidate?(pub.candidate.display_name||'A player')+' · '+(pub.candidate.state==='pending'?'first eligible crossing recorded; review pending':pub.candidate.state)+'.':'Active this month. No eligible crossing recorded yet.';
   if(!pub.active)return;
   if(!cloud().isSignedIn()){body.append(node('p','Start a lab with your username to earn monthly points.'));return;}
   const mine=await cloud().milestonePrivate();if(!valid())return;
   body.append(node('p',mine.points+' server-recorded points this month.'));
   if(!mine.reached){body.append(node('p','Your private prize-contact prompt becomes available at 4,000 points.'));return;}
   if(mine.contact_choice==='forfeited'){body.append(node('p','You forfeited this month’s CAD $200 prize. This does not affect your monthly points or the separate CAD $50 prize.'));return;}
   if(mine.review_state!=='pending'){body.append(node('p','Prize review: '+mine.review_state+'. Contact prempehtech.ca@gmail.com for any changes.'));return;}
   if(mine.contact_choice!=='pending')body.append(node('p',mine.contact_choice==='email'?'Your private contact email is saved. It has not been independently verified.':'You chose to email prempehtech.ca@gmail.com. Remember to send your screenshot; selecting this option does not send an email.'));
   body.append(node('h3','Choose how we can contact you if you win'));
   const form=node('form'),label=node('label','Private contact email'),email=node('input');email.type='email';email.maxLength=254;email.autocomplete='email';email.required=true;label.append(email);
   const consentLabel=node('label'),consent=node('input');consent.type='checkbox';consent.required=true;consentLabel.append(consent,document.createTextNode(' Use this email only to contact me about this month’s prize. It will not appear on the leaderboard.'));
   const save=node('button','Save private prize email');save.type='submit';form.append(label,consentLabel,save);body.append(form);
   const external=button('I will email PrempehTech with my screenshot',()=>submit('external'));
   const forfeit=button('Decline both options and forfeit the $200 prize',()=>{confirmation.hidden=false;confirmButton.focus();});
   const confirmation=node('section');confirmation.hidden=true;confirmation.append(node('p','Confirm forfeiture: you will permanently lose eligibility for this month’s CAD $200 prize. Your points and CAD $50 monthly-leader eligibility stay unchanged.'));
   const confirmButton=button('Confirm: forfeit this month’s $200 prize',()=>submit('forfeited'));
   confirmation.append(confirmButton,button('Keep my eligibility',()=>{confirmation.hidden=true;forfeit.focus();}));body.append(external,forfeit,confirmation);
   let busy=false;
   async function submit(choice){
    if(busy||!valid())return;busy=true;[save,external,forfeit,confirmButton].forEach(b=>b.disabled=true);status.textContent='Saving your choice…';
    try{
     await cloud().milestoneContact(choice,choice==='email'?email.value.trim():null);if(!valid())return;
     email.value='';consent.checked=false;body.replaceChildren();
     status.textContent=choice==='forfeited'?'Your CAD $200 eligibility for this month has been forfeited.':choice==='email'?'Your private prize email is saved. This is not a winner confirmation.':'Contact option saved. Email your username and points screenshot to prempehtech.ca@gmail.com. This is not a winner confirmation.';
     if(choice==='external'){
      const link=node('a','Open an email to prempehtech.ca@gmail.com');link.href='mailto:prempehtech.ca@gmail.com?subject='+encodeURIComponent('PrempehTech CAD $200 prize — '+mine.month)+'&body='+encodeURIComponent('Username:\nMonthly points:\n\nI will attach a screenshot showing my username and points.');body.append(link);
     }
    }catch(error){if(valid())status.textContent=message(error);}finally{busy=false;[save,external,forfeit,confirmButton].forEach(b=>b.disabled=false);}
   }
   form.onsubmit=e=>{e.preventDefault();submit('email');};
  }catch(error){if(valid())status.textContent=message(error);}
 }
 async function check(){
  if(checking||!cloud()?.isSignedIn()||currentDialog?.open)return;
  checking=true;const account=cloud().playerKey();
  try{
   const mine=await cloud().milestonePrivate();
   if(account!==cloud().playerKey()||!mine.reached||mine.contact_choice!=='pending')return;
   if(document.querySelector('dialog[open]')){setTimeout(check,5000);return;}
   await open();
  }catch{}finally{checking=false;}
 }
 window.addEventListener('prempeh-cloud-progress',()=>{if(currentDialog?.open&&currentDialog.dataset.owner!==cloud().playerKey())currentDialog.close();});
 let timer;window.addEventListener('prempeh-monthly-points-synced',()=>{clearTimeout(timer);timer=setTimeout(check,300);});
 cloud()?.ready?.then(check);
 window.PrempehMilestone={open,check,rules};
})();
