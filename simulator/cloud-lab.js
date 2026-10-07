(() => {
  'use strict';
  const region='ca-central-1';
  const targetArn='arn:aws:elasticloadbalancing:ca-central-1:123456789012:targetgroup/corp-web/73e2d6bc24d8a067';
  const form=(id,service,title,fields,expected,why)=>({id,app:'cloudconsole',service,title,type:'form',fields,expected,why});
  const select=(key,label,options)=>[key,label,'select',options];
  const text=(key,label)=>[key,label,'text'];
  const verify=(id,required,dependencies)=>({id,app:'cloudshell',title:'Verify the deployed cloud state',type:'command',required,dependencies});
  const scenarios={
    1:{title:'Launch a Secure Cloud Web Server',role:'Cloud Foundations',ticket:'Deploy WEB-01 in Canada Central. Use Amazon Linux 2023, t3.micro, subnet-public-a, and an encrypted 8 GiB root disk. Allow public HTTPS on TCP 443; do not open SSH to the Internet. Validate the running instance and its encrypted disk from CloudShell.',apps:['cloudconsole','cloudshell'],tags:['EC2','Security Groups','EBS','AWS CLI'],tasks:[
      form('cl1vm','compute','Launch WEB-01',[text('name','Instance name'),select('image','AMI',['Amazon Linux 2023','Windows Server']),select('size','Instance type',['t3.micro','t3.large']),select('subnet','Subnet',['subnet-public-a','subnet-private-a'])],{name:'WEB-01',image:'Amazon Linux 2023',size:'t3.micro',subnet:'subnet-public-a'},'The AMI supplies the operating system; instance type selects compute capacity. The subnet determines the network placement. Validate the region and resource names before launching.'),
      form('cl1sg','network','Configure the web security group',[text('port','Inbound TCP port'),text('source','Source CIDR'),select('ssh','Internet SSH',['Blocked','Allowed'])],{port:'443',source:'0.0.0.0/0',ssh:'Blocked'},'A public HTTPS service needs TCP 443 from its users. Administrative SSH should not be opened to all Internet addresses. Security groups control allowed instance traffic.'),
      form('cl1disk','storage','Configure the root volume',[text('size','Volume size (GiB)'),select('encryption','Encryption',['Enabled','Disabled'])],{size:'8',encryption:'Enabled'},'EBS provides the instance block storage. Encryption protects stored data; volume size must match the approved deployment specification.'),
      verify('cl1verify',['aws ec2 describe-instances --region ca-central-1','aws ec2 describe-volumes --region ca-central-1'],['cl1vm','cl1sg','cl1disk'])
    ]},
    2:{title:'Repair a Private Cloud Application Network',role:'Junior Cloud Technician',ticket:'APP-01 belongs in subnet-private-a (10.20.2.0/24) with public IP assignment disabled. Its default route must use nat-01 for outbound access. Permit PostgreSQL TCP 5432 only from sg-web. Inspect the VPC route table before and after repair.',apps:['cloudconsole','cloudshell'],tags:['VPC','Private Subnet','NAT Gateway','Segmentation'],tasks:[
      form('cl2subnet','network','Configure the private subnet',[text('name','Subnet name'),text('cidr','IPv4 CIDR'),select('publicIp','Auto-assign public IPv4',['Disabled','Enabled'])],{name:'subnet-private-a',cidr:'10.20.2.0/24',publicIp:'Disabled'},'A private application subnet avoids direct public addressing. A NAT gateway supplies outbound access without allowing unsolicited inbound Internet connections.'),
      form('cl2route','network','Repair the private default route',[text('destination','Destination CIDR'),select('target','Route target',['nat-01','igw-01'])],{destination:'0.0.0.0/0',target:'nat-01'},'A route selects the egress target. The private subnet uses NAT; the public subnet containing the NAT gateway uses an Internet gateway.'),
      form('cl2sg','network','Restrict database access',[text('port','TCP port'),select('source','Source security group',['sg-web','0.0.0.0/0'])],{port:'5432',source:'sg-web'},'Restrict database traffic to the authorized application security group rather than exposing PostgreSQL to the Internet.'),
      verify('cl2verify',['aws ec2 describe-route-tables --region ca-central-1'],['cl2subnet','cl2route','cl2sg'])
    ]},
    3:{title:'Secure Cloud Storage and Workload Identity',role:'Cloud Administrator',ticket:'The EC2 report processor must assume role report-reader and read only s3:GetObject on arn:aws:s3:::corp-reports/reports/*. Trust ec2.amazonaws.com. For corp-reports, enable all four Block Public Access settings, SSE-S3 encryption, and versioning. Avoid static application access keys.',apps:['cloudconsole','cloudshell'],tags:['IAM Roles','Least Privilege','S3','Versioning'],tasks:[
      form('cl3role','identity','Create the workload role',[text('name','Role name'),select('trust','Trusted service',['ec2.amazonaws.com','lambda.amazonaws.com']),select('action','Allowed action',['s3:GetObject','s3:*']),text('resource','Resource ARN')],{name:'report-reader',trust:'ec2.amazonaws.com',action:'s3:GetObject',resource:'arn:aws:s3:::corp-reports/reports/*'},'A service role separates workload identity from human credentials. Scope the permission to the required object prefix and action, and trust the service that assumes the role.'),
      form('cl3public','storage','Block public bucket access',[text('bucket','Bucket name'),select('block','All four Block Public Access settings',['Enabled','Disabled'])],{bucket:'corp-reports',block:'Enabled'},'Block Public Access guards against public ACLs and bucket policies. These reports are private business data, so all four controls are enabled.'),
      form('cl3storage','storage','Protect stored reports',[select('encryption','Default encryption',['SSE-S3','SSE-KMS']),select('versioning','Versioning',['Enabled','Suspended'])],{encryption:'SSE-S3',versioning:'Enabled'},'Default encryption protects objects at rest. Versioning retains prior object versions for recovery; it does not replace an access-control policy.'),
      verify('cl3verify',['aws s3api get-public-access-block --bucket corp-reports','aws s3api get-bucket-versioning --bucket corp-reports'],['cl3role','cl3public','cl3storage'])
    ]},
    4:{title:'Scale and Monitor a Cloud Web Application',role:'Cloud Operations Analyst',ticket:'corp-web must span ca-central-1a and ca-central-1b. Set Auto Scaling minimum 2, desired 2, maximum 4. Use HTTPS health checks on port 443 at /health. Create alarm corp-web-cpu for CPUUtilization > 70% over two 60-second periods, notifying topic ops-alerts.',apps:['cloudconsole','cloudshell'],tags:['Auto Scaling','CloudWatch','Load Balancer','Availability Zones'],tasks:[
      form('cl4scale','compute','Configure multi-zone capacity',[text('min','Minimum capacity'),text('desired','Desired capacity'),text('max','Maximum capacity'),select('zones','Availability Zones',['ca-central-1a,ca-central-1b','ca-central-1a'])],{min:'2',desired:'2',max:'4',zones:'ca-central-1a,ca-central-1b'},'Minimum and desired capacity keep two instances available; maximum limits scale-out. Distributing capacity across zones reduces dependence on one zone.'),
      form('cl4health','network','Correct target health checks',[select('protocol','Health check protocol',['HTTPS','HTTP']),text('port','Health check port'),text('path','Health check path')],{protocol:'HTTPS',port:'443',path:'/health'},'A load balancer sends traffic only to healthy targets. Its protocol, port and path must match the application readiness endpoint.'),
      form('cl4alarm','monitor','Create the CPU alarm',[text('name','Alarm name'),text('threshold','Threshold (%)'),text('period','Period (seconds)'),text('evaluations','Evaluation periods'),select('topic','Notification topic',['ops-alerts','None'])],{name:'corp-web-cpu',threshold:'70',period:'60',evaluations:'2',topic:'ops-alerts'},'CloudWatch evaluates metric periods and invokes configured notification actions. A threshold without the correct period or an action can delay operational response.'),
      verify('cl4verify',['aws cloudwatch describe-alarms --alarm-names corp-web-cpu --region ca-central-1','aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names corp-web --region ca-central-1'],['cl4scale','cl4health','cl4alarm'])
    ]},
    5:{title:'Recover a Cloud Application and Contain Access Abuse',role:'Mid-Level Cloud Engineer',ticket:'The cloud application is down after a disk and target-group change. Restore APP-DATA from snapshot snap-approved-01 in ca-central-1a. Its HTTPS health endpoint is /health on port 443; allow traffic only from sg-alb. Audit evidence shows legacy-deploy used an unexpected source. Disable that access key and preserve CloudTrail evidence before validating both targets and the restored volume.',apps:['cloudconsole','cloudshell'],tags:['EBS Recovery','CloudTrail','IAM Containment','Service Restoration'],tasks:[
      form('cl5restore','recovery','Restore the application volume',[select('snapshot','Recovery snapshot',['snap-approved-01','snap-unverified-02']),select('zone','Availability Zone',['ca-central-1a','ca-central-1b']),text('name','Volume name')],{snapshot:'snap-approved-01',zone:'ca-central-1a',name:'APP-DATA'},'Recover from the approved snapshot in the instance Availability Zone. Validate the source before restoring and retain the original incident evidence.'),
      form('cl5health','network','Restore target-group health',[text('port','HTTPS port'),text('path','Health path'),select('source','Allowed security group',['sg-alb','0.0.0.0/0'])],{port:'443',path:'/health',source:'sg-alb'},'The application instances should accept load-balancer traffic from its security group. Correct the health endpoint without opening the application directly to the Internet.'),
      form('cl5contain','identity','Contain the compromised deployment key',[select('identity','IAM principal',['legacy-deploy','report-reader']),select('key','Access key status',['Inactive','Active']),select('evidence','Audit handling',['Preserve CloudTrail logs','Delete logs'])],{identity:'legacy-deploy',key:'Inactive',evidence:'Preserve CloudTrail logs'},'Deactivate the abused access key to stop further use of that credential. Preserve CloudTrail records for scope and timeline; do not erase audit evidence during recovery.'),
      verify('cl5verify',['aws elbv2 describe-target-health --target-group-arn '+targetArn+' --region ca-central-1','aws ec2 describe-volumes --region ca-central-1'],['cl5restore','cl5health','cl5contain'])
    ]}
  };
  const services={compute:'EC2 / Auto Scaling',network:'VPC / Load Balancing',identity:'IAM',storage:'S3 / EBS',monitor:'CloudWatch',recovery:'Snapshots / Recovery'};
  let state=null,tab='compute';
  const runtime=()=>window.PrempehDesktopLab.getRuntime();
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const json=x=>JSON.stringify(x,null,2);
  const sim=()=>state||(state={compute:{name:'WEB-01',status:'Not deployed'},network:{destination:'0.0.0.0/0',target:'igw-01'},identity:{name:'legacy-deploy',key:'Active'},storage:{encryption:'Disabled',versioning:'Suspended'},monitor:{name:'corp-web-cpu',status:'Not configured'},recovery:{status:'Not restored'}});
  const summary=service=>{
    const data=sim()[service];
    return '<table class="cloud-resource-table"><thead><tr><th>Resource setting</th><th>Current state</th></tr></thead><tbody>'+Object.entries(data).map(([k,v])=>'<tr><td>'+escape(k)+'</td><td>'+escape(v)+'</td></tr>').join('')+'</tbody></table>';
  };
  function render(tasks,taskForm){
    const available=[...new Set(tasks.map(t=>t.service))];if(!available.includes(tab))tab=available[0];
    return '<div class="cloud-console"><div class="cloud-top"><b>AWS-style Training Console</b><span>Canada (Central) · '+region+'</span></div><div class="cloud-banner">Simulated resources · no AWS account required · no cloud charges</div><div class="cloud-layout"><nav aria-label="Cloud services">'+Object.entries(services).map(([id,name])=>'<button type="button" data-cloud-service="'+id+'" class="'+(id===tab?'active':'')+'">'+name+'</button>').join('')+'</nav><div class="cloud-service-body">'+Object.entries(services).map(([id,name])=>'<section data-cloud-pane="'+id+'" '+(id!==tab?'hidden':'')+'><h3>'+name+'</h3><div data-cloud-summary="'+id+'">'+summary(id)+'</div>'+tasks.filter(t=>t.service===id).map(taskForm).join('')+(tasks.some(t=>t.service===id)?'':'<p>No changes are assigned to this service in the current project. Inspect the other service tabs.</p>')+'</section>').join('')+'</div></div></div>';
  }
  function bind(win){
    win.querySelectorAll('[data-cloud-service]').forEach(b=>b.onclick=()=>{tab=b.dataset.cloudService;win.querySelectorAll('[data-cloud-service]').forEach(x=>x.classList.toggle('active',x===b));win.querySelectorAll('[data-cloud-pane]').forEach(x=>x.hidden=x.dataset.cloudPane!==tab)});
  }
  function validated(task,values){
    if(!task.service)return;Object.assign(sim()[task.service],values,{status:'Configured'});
    if(task.id==='cl1vm')sim().compute.status='running';
    document.querySelectorAll('[data-cloud-summary="'+task.service+'"]').forEach(e=>e.innerHTML=summary(task.service));
  }
  function response(command){
    const s=sim(),done=runtime().taskState,cmd=command.toLowerCase();
    if(cmd.includes('describe-instances'))return json({Reservations:[{Instances:[{InstanceId:'i-0123456789abcdef0',InstanceType:s.compute.size||'t3.micro',State:{Name:s.compute.status==='running'?'running':'stopped'},SubnetId:s.compute.subnet||'subnet-public-a',PrivateIpAddress:'10.20.1.10',Tags:[{Key:'Name',Value:s.compute.name}]}]}]});
    if(cmd.includes('describe-volumes'))return json({Volumes:[{VolumeId:'vol-0123456789abcdef0',AvailabilityZone:s.recovery.zone||'ca-central-1a',Encrypted:s.storage.encryption==='Enabled'||!!done.cl5restore,Size:Number(s.storage.size)||8,State:done.cl5restore||done.cl1disk?'in-use':'available',SnapshotId:s.recovery.snapshot||'',Tags:[{Key:'Name',Value:s.recovery.name||'WEB-01-root'}]}]});
    if(cmd.includes('describe-route-tables'))return json({RouteTables:[{RouteTableId:'rtb-private-a',Associations:[{SubnetId:'subnet-private-a'}],Routes:[{DestinationCidrBlock:'10.20.0.0/16',GatewayId:'local'},{DestinationCidrBlock:s.network.destination,...(s.network.target==='nat-01'?{NatGatewayId:'nat-01'}:{GatewayId:'igw-01'}),State:'active'}]}]});
    if(cmd.includes('get-public-access-block'))return json({PublicAccessBlockConfiguration:{BlockPublicAcls:!!done.cl3public,IgnorePublicAcls:!!done.cl3public,BlockPublicPolicy:!!done.cl3public,RestrictPublicBuckets:!!done.cl3public}});
    if(cmd.includes('get-bucket-versioning'))return json({Status:s.storage.versioning});
    if(cmd.includes('describe-alarms'))return json({MetricAlarms:done.cl4alarm?[{AlarmName:s.monitor.name,Namespace:'AWS/EC2',MetricName:'CPUUtilization',Threshold:Number(s.monitor.threshold),Period:Number(s.monitor.period),EvaluationPeriods:Number(s.monitor.evaluations),ComparisonOperator:'GreaterThanThreshold',AlarmActions:['arn:aws:sns:ca-central-1:123456789012:ops-alerts']}]:[]});
    if(cmd.includes('describe-auto-scaling-groups'))return json({AutoScalingGroups:[{AutoScalingGroupName:'corp-web',MinSize:Number(s.compute.min)||1,DesiredCapacity:Number(s.compute.desired)||1,MaxSize:Number(s.compute.max)||1,AvailabilityZones:(s.compute.zones||'ca-central-1a').split(',')}]});
    if(cmd.includes('describe-target-health'))return json({TargetHealthDescriptions:['i-0123456789abcdef0','i-0fedcba9876543210'].map(id=>({Target:{Id:id,Port:443},TargetHealth:{State:done.cl5health&&done.cl5restore?'healthy':'unhealthy'}}))});
    return null;
  }
  function shell(raw){
    const cmd=raw.trim().toLowerCase(),tasks=runtime().current.data.tasks.filter(t=>t.app==='cloudshell'),task=tasks.find(t=>t.required.some(r=>r.toLowerCase()===cmd));
    if(cmd==='aws --version')return 'aws-cli/2.x training shell (simulated)';
    if(cmd==='help')return 'Use Command Guide for the AWS CLI commands assigned to this project. Commands run only against simulated resources.';
    if(!task)return 'Unsupported command in this training shell. Use the exact command and resource names in the project Command Guide.';
    const result=response(raw),ready=task.dependencies.every(id=>runtime().taskState[id]);
    if(!ready)return result+'\n\nVerification not passed: one or more required cloud configuration tasks remain incomplete. Inspect the current resource state, repair it, then rerun the command.';
    const ts=runtime().terminalState.cloudshell;ts.seen[task.id+'|'+cmd]=true;
    if(task.required.every(r=>ts.seen[task.id+'|'+r.toLowerCase()]))window.PrempehDesktopLab.acceptTask(task.id);
    return result;
  }
  function guide(){return scenarios[runtime().current.level].tasks.flatMap(t=>t.type==='command'?t.required.map(cmd=>'Open AWS CloudShell and run '+cmd+'. Inspect the returned resource state.'):['Open the AWS-style Training Console → '+services[t.service]+'. '+t.title+'. '+Object.entries(t.expected).map(([k,v])=>k+' = '+v).join('; ')+'. Apply / Validate, then inspect the updated resource table.'])}
  window.PrempehCloudLab={scenarios,render,bind,validated,shell,guide,reset:()=>{state=null;tab='compute'},explain:id=>runtime().current.data.tasks.find(t=>t.id===id)?.why};
})();
