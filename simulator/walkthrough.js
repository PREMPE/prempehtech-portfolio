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
      add('Click '+code('PT Start')+', search for '+code(tool)+', and open '+code(tool)+'.',{action:'open'});
      if(t.service)add('In the left service menu, click '+code(services[t.service])+'.',{action:'service'});
      const prerequisites=(t.dependencies||[]).map(id=>current.data.tasks.find(task=>task.id===id)?.title).filter(Boolean);
      const evidenceText=t.evidence?.length?' Read the evidence table above the controls first.':'';
      const prerequisiteText=prerequisites.length?' First complete '+prerequisites.map(code).join(' and ')+'.':'';
      if(t.type==='form'){
        const fields=t.fields.filter(([key])=>key in t.expected).map(([key,label,type])=>({key,label,fieldType:type,value:t.expected[key]}));
        const entries=fields.map(f=>'<li><strong>'+esc(f.label)+':</strong> '+(f.fieldType==='select'?'select ':'')+code(f.value)+(t.id==='n2dns'&&f.key==='name'?' — enter just this, without '+code('.corp.local')+'.':'')+'</li>').join('');
        add('Under '+code(t.title)+', enter or select the following values. Replace any existing text.'+evidenceText+prerequisiteText+'<ul>'+entries+'</ul>',{action:'fields',fields});
        const unlocks=current.data.tasks.filter(task=>task.dependencies?.includes(t.id)).map(task=>code(task.title));
        add('Click '+code('Apply / Validate')+'. You should see '+code('Configuration accepted. Validation passed.')+(unlocks.length?' This satisfies the prerequisite for '+unlocks.join(' and ')+'.':'')+' If validation fails, check each value above and the feedback before continuing.',{action:'apply'});
      }else{
        add('In '+code(tool)+', find the command input next to the prompt. Type each command below and press Enter after each. Wait for its response before continuing.'+prerequisiteText,{action:'inspect'});
        const commands=t.id==='n3switch'?[
          ['show vlan brief','Inspect the current VLAN table.'],['enable','Expect the prompt to change from SW1> to SW1#.'],
          ['configure terminal','Expect SW1(config)#.'],['vlan 10','Select VLAN 10; expect SW1(config-vlan)#.'],
          ['name users','Name VLAN 10 USERS.'],['exit','Return to SW1(config)#.'],['vlan 20','Select VLAN 20.'],['name servers','Name VLAN 20 SERVERS.'],
          ['exit','Return to global configuration mode.'],['interface gi0/24','Select the uplink; expect SW1(config-if)#.'],
          ['switchport mode trunk','Make the selected uplink a trunk.'],['switchport trunk allowed vlan 10,20','Allow VLANs 10 and 20 on the uplink.'],
          ['end','Return to SW1#.'],['show vlan brief','Check that VLAN 10 is USERS and VLAN 20 is SERVERS.'],
          ['show interfaces trunk','Check gi0/24 is trunking and the allowed VLAN list is 10,20.']
        ]:t.app==='switch'?[['enable','Enter privileged mode.'],['configure terminal','Enter global configuration mode.'],...t.required.map(c=>[c,t.responses?.[c]||'Read the command response.']),['end','Return to the privileged prompt.'],['show vlan brief','Check the configured VLAN and name.']]:t.required.map(c=>[c,t.responses?.[c]||'Inspect the returned resource state and confirm the required configuration.']);
        for(const [cmd,expected] of commands)add('In '+code(tool)+', type:<pre>'+code(cmd)+'</pre>Press Enter. Expected result: '+esc(expected),{action:'command',command:cmd});
        add('Check the '+code(t.title)+' validation status. The project ticket should mark this task complete. If the console reports a missing prerequisite or rejected command, complete the named repair and re-enter the command.',{action:'verify'});
      }
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
    const target=step.action==='fields'?win.querySelector('[data-field="'+step.taskId+':'+step.fields[0]?.key+'"]'):
      step.action==='apply'?win.querySelector('[data-submit-task="'+step.taskId+'"]'):
      step.action==='command'?win.querySelector('form input'):
      win.querySelector('[data-task-form="'+step.taskId+'"]')||win.querySelector('[data-feedback="'+step.taskId+'"]');
    target?.scrollIntoView({block:'center'});target?.focus();
    target?.animate([{outline:'3px solid #0877b9',outlineOffset:'3px'},{outline:'3px solid transparent',outlineOffset:'3px'}],{duration:1800});
  }
  window.PrempehWalkthrough={steps,show};
})();
