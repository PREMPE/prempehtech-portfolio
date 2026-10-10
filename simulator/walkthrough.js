/* Instructions are derived from the same fields and commands the learner operates. */
(() => {
  'use strict';
  const lab=window.PrempehDesktopLab;
  const services={compute:'EC2 / Auto Scaling',network:'VPC / Load Balancing',identity:'IAM',storage:'S3 / EBS',monitor:'CloudWatch',recovery:'Snapshots / Recovery'};
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const code=s=>'<code>'+esc(s)+'</code>';
  function steps(){
    const {current,APP_DEFS}=lab.getRuntime();
    const result=[];
    for(const t of current.data.tasks){
      const tool=APP_DEFS[t.app].label;
      const add=(text,action={})=>result.push({taskId:t.id,app:t.app,service:t.service,text,...action});
      add('Click the PT Start button at the bottom-left of the desktop.',{action:'start'});
      add('Click the Start search box and type '+code(tool)+'.',{action:'search'});
      add('Click the search result labelled '+code(tool)+'. The '+esc(tool)+' window opens. You can also right-click its desktop icon and click '+code('Open')+' in the context menu.',{action:'open'});
      if(t.service)add('In the console’s left service menu, click '+code(services[t.service])+'.',{action:'service'});
      if(t.evidence?.length)add('Scroll inside the '+esc(tool)+' window to '+code(t.title)+'. Read the evidence table above its controls: '+t.evidence.map(row=>row.map(esc).join(' — ')).join('; ')+'.',{action:'inspect'});
      if(t.type==='form'){
        add('Scroll inside the application window until you see the section '+code(t.title)+'. Use the controls in this section.',{action:'inspect'});
        for(const [key,label,type] of t.fields){
          if(!(key in t.expected))continue;
          add(type==='select'?'Click the '+code(label)+' dropdown and select '+code(t.expected[key])+'.':'Click the '+code(label)+' text box. Select its existing contents (Ctrl+A, or select all on your device), then type '+code(t.expected[key])+'.',
            {action:'field',key,value:t.expected[key],fieldType:type});
        }
        add('In the '+code(t.title)+' section, click '+code('Apply / Validate')+'. Expect '+code('Configuration accepted. Validation passed.')+'. If validation fails, check the entries above and complete any prerequisite named in the feedback before retrying.',{action:'apply'});
      }else{
        const commands=t.id==='n3switch'?[
          ['show vlan brief','Inspect the current VLAN table.'],['enable','Expect the prompt to change from SW1> to SW1#.'],
          ['configure terminal','Expect SW1(config)#.'],['vlan 10','Select VLAN 10; expect SW1(config-vlan)#.'],
          ['name users','Name VLAN 10 USERS.'],['exit','Return to SW1(config)#.'],['vlan 20','Select VLAN 20.'],['name servers','Name VLAN 20 SERVERS.'],
          ['exit','Return to global configuration mode.'],['interface gi0/24','Select the uplink; expect SW1(config-if)#.'],
          ['switchport mode trunk','Make the selected uplink a trunk.'],['switchport trunk allowed vlan 10,20','Allow VLANs 10 and 20 on the uplink.'],
          ['end','Return to SW1#.'],['show vlan brief','Check that VLAN 10 is USERS and VLAN 20 is SERVERS.'],
          ['show interfaces trunk','Check gi0/24 is trunking and the allowed VLAN list is 10,20.']
        ]:t.app==='switch'?[['enable','Enter privileged mode.'],['configure terminal','Enter global configuration mode.'],...t.required.map(c=>[c,t.responses?.[c]||'Read the command response.']),['end','Return to the privileged prompt.'],['show vlan brief','Check the configured VLAN and name.']]:t.required.map(c=>[c,t.responses?.[c]||'Inspect the returned resource state and confirm the required configuration.']);
        for(const [cmd,expected] of commands)add('Click the command input at the bottom of '+code(tool)+' (next to the prompt). Type '+code(cmd)+' and press Enter. '+esc(expected),{action:'command',command:cmd});
        add('Check the '+code(t.title)+' validation status. The project ticket should mark this task complete. If the console reports a missing prerequisite or rejected command, complete the named repair and re-enter the command.',{action:'verify'});
      }
      add('Click '+code('Project Ticket')+' on the desktop taskbar to bring these instructions back to the front. Use '+code('Next instruction →')+' to continue. Reading or advancing instructions does not validate a task.');
    }
    result.push({text:'After the final task passes, expect the '+code('PROJECT VALIDATED')+' completion dialog. Click '+code('Choose Another Project')+' to return to the catalogue, or '+code('Replay Project')+' to start a fresh attempt. Your completion is saved; replay does not award duplicate XP.',action:'finish'});
    return result;
  }
  function show(index){
    const step=steps()[index];if(!step?.app)return;
    if(step.action==='start'){document.getElementById('vmStart').focus();return;}
    if(step.action==='search'){
      if(document.getElementById('vmStartMenu').classList.contains('hidden'))document.getElementById('vmStart').click();
      document.querySelector('#vmStartMenu input')?.focus();return;
    }
    lab.openApp(step.app);
    const win=document.querySelector('.vm-window[data-app="'+step.app+'"]');if(!win)return;
    if(step.service)win.querySelector('[data-cloud-service="'+step.service+'"]')?.click();
    const target=step.action==='field'?win.querySelector('[data-field="'+step.taskId+':'+step.key+'"]'):
      step.action==='apply'?win.querySelector('[data-submit-task="'+step.taskId+'"]'):
      step.action==='command'?win.querySelector('form input'):
      win.querySelector('[data-task-form="'+step.taskId+'"]')||win.querySelector('[data-feedback="'+step.taskId+'"]');
    target?.scrollIntoView({block:'center'});target?.focus();
    target?.animate([{outline:'3px solid #0877b9',outlineOffset:'3px'},{outline:'3px solid transparent',outlineOffset:'3px'}],{duration:1800});
  }
  window.PrempehWalkthrough={steps,show};
})();
