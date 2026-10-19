// Exercise the actual cloud client with an isolated Auth transport; no public users created.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
async function fixture(existing=null, failure=false) {
  let calls=0;
  const nodes=new Map();
  const client={auth:{
    getSession:async()=>({data:{session:existing?{user:existing}:null}}),
    onAuthStateChange:()=>{},
    signInAnonymously:async()=>{
      calls++;
      await new Promise(resolve=>setTimeout(resolve,5));
      return failure?{error:{code:'anonymous_provider_disabled'}}:{data:{user:{id:'guest-id',is_anonymous:true},session:{access_token:'test-only'}}};
    }
  }};
  const context={setTimeout,clearTimeout,CustomEvent:class{},Event:class{},localStorage:{getItem:()=>null},document:{
    getElementById:id=>{if(!nodes.has(id))nodes.set(id,{classList:{add(){},remove(){},toggle(){}},addEventListener(){}});return nodes.get(id)},
    querySelectorAll:()=>[],addEventListener(){}
  }};
  context.window={PREMPEHTECH_CLOUD_CONFIG:{enabled:true,url:'https://example.invalid',anonKey:'test'},supabase:{createClient:()=>client},PrempehSecurity:{progress:x=>x||{}},dispatchEvent(){}};
  vm.runInNewContext(fs.readFileSync('simulator/cloud-save.js','utf8'),context);
  const cloud=context.window.PrempehCloud;
  await cloud.ready;
  return {cloud,calls:()=>calls};
}
(async()=>{
  const guest=await fixture();
  await Promise.all([guest.cloud.ensurePlayer(),guest.cloud.ensurePlayer()]);
  assert.equal(guest.calls(),1,'Concurrent enrollment shares one anonymous identity request');
  assert.equal(guest.cloud.playerKey(),'guest-id');
  await guest.cloud.ensurePlayer();assert.equal(guest.calls(),1);
  const signed=await fixture({id:'existing-id'});
  await signed.cloud.ensurePlayer();assert.equal(signed.calls(),0);assert.equal(signed.cloud.playerKey(),'existing-id');
  const disabled=await fixture(null,true);
  await assert.rejects(disabled.cloud.ensurePlayer(),e=>e.code==='anonymous_provider_disabled');
  assert.equal(disabled.cloud.playerKey(),'guest');
  await assert.rejects(disabled.cloud.ensurePlayer());assert.equal(disabled.calls(),2,'Failed requests can be retried');
  console.log('Guest Auth: concurrent creation, reuse, existing identity, disabled-provider handling and retry passed');
})().catch(error=>{console.error(error);process.exitCode=1});
