const {test}=require('node:test');
const assert=require('node:assert/strict');
const c=require('../core.js');
const date=new Date(2026,9,31,13,0,0);
function responseFor(request) {
  const data=JSON.parse(request.prompt.split('\n')[3]);
  return {ok:true,model:'test-model',text:JSON.stringify({cards:data.words.map(word=>({word,example:`We discuss ${word} in our code review.`,translation:`我们在代码审查中讨论 ${word}。`}))})};
}
function fixture(options={}) {
  let stored=options.initial??{},calls=0,writes=0,instant=date;
  const service=c.createService({read:async()=>structuredClone(stored),
    write:async v=>{writes++;if(options.writeFails)throw new Error();stored=structuredClone(v);},
    send:async req=>{calls++;return options.send?options.send(req):responseFor(req);},now:()=>instant});
  return {service,get stored(){return stored;},get calls(){return calls;},get writes(){return writes;},setDate:v=>instant=v};
}
test('local calendar date follows host timezone, including Sydney midnight',()=>{
  assert.equal(c.localDate(new Date(2026,9,31,0,1)),'2026-10-31');
  assert.equal(c.localDate(new Date(2026,10,1,0,1)),'2026-11-01');
  assert.equal(c.localDate(new Date(2026,9,4,3,1)),'2026-10-04');
});
test('seven days contain exactly 70 distinct words; reopening is stable',()=>{
  const week=Array.from({length:7},(_,i)=>c.wordsForDate(`2026-10-${String(i+1).padStart(2,'0')}`));
  assert.ok(week.every(day=>day.length===10));
  assert.equal(new Set(week.flat().map(w=>w.word)).size,70);
  assert.deepEqual(c.wordsForDate('2026-10-01'),c.wordsForDate('2026-10-08'));
  assert.throws(()=>c.wordsForDate('2026-02-30'),{code:'INVALID_DATE'});
});
test('accept reordered output and restore authoritative word order / meaning',()=>{
  const words=c.wordsForDate('2026-10-31');
  const body=JSON.parse(responseFor({prompt:c.promptFor(words,'代码审查')}).text);
  body.cards.reverse();body.cards[0].meaning='不可信释义';
  assert.deepEqual(c.validateCards(body,words).map(x=>x.word),words.map(x=>x.word));
  assert.deepEqual(c.validateCards(body,words).map(x=>x.meaning),words.map(x=>x.meaning));
});
test('reject incomplete, duplicate, wrong, blank, overlong and missing-word examples',()=>{
  const words=c.wordsForDate('2026-10-31');
  const valid=()=>JSON.parse(responseFor({prompt:c.promptFor(words,'工作')}).text);
  const mutations=[b=>b.cards.pop(),b=>b.cards[1]=b.cards[0],b=>b.cards[0].word='invented',b=>b.cards[0].example=' ',b=>b.cards[0].translation=null,b=>b.cards[0].translation='文'.repeat(601),b=>b.cards[0].example='No required vocabulary here.'];
  for(const mutate of mutations){const body=valid();mutate(body);assert.throws(()=>c.validateCards(body,words),{code:'BAD_MODEL_OUTPUT'});}
});
test('one batch uses Cindy oneshot; identical date/context reuses persisted cache',async()=>{
  let request;
  const f=fixture({send:r=>{request=r;return responseFor(r);}});
  const result=await f.service.generate('插件开发');
  assert.equal(result.cache.cards.length,10);assert.equal(request.kind,'oneshot_text');
  assert.equal(request.type,'cindy-request');assert.equal(request.expectJson,true);
  assert.equal(Object.hasOwn(request,'callId'),false);
  assert.equal((await f.service.generate(' 插件开发 ')).cached,true);
  assert.equal(f.calls,1);assert.equal(f.writes,1);
  const reopen=fixture({initial:f.stored});
  assert.equal((await reopen.service.load()).current,true);
  await reopen.service.generate('插件开发');assert.equal(reopen.calls,0);
});
test('context/date/explicit refresh invalidate cache; next day chooses another set',async()=>{
  const f=fixture();const first=await f.service.generate('开发');
  await f.service.generate('设计');await f.service.generate('设计',true);
  f.setDate(new Date(2026,10,1,0,1));
  const next=await f.service.generate('设计');
  assert.equal(f.calls,4);assert.notDeepEqual(first.words,next.words);
  assert.equal(next.cache.date,'2026-11-01');
});
test('identical concurrent requests share one model call; different context is busy',async()=>{
  let finish;
  const f=fixture({send:req=>new Promise(resolve=>{finish=()=>resolve(responseFor(req));})});
  const first=f.service.generate('开发');const duplicate=f.service.generate('开发');
  await assert.rejects(f.service.generate('设计'),{code:'BUSY'});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(f.calls,1);finish();await Promise.all([first,duplicate]);assert.equal(f.writes,1);
});
test('model failures keep previous valid batch untouched and allow manual retry',async()=>{
  const good=fixture();await good.service.generate('开发');
  for(const errorCode of ['NO_CANDIDATE','TIMEOUT','PERMISSION_DENIED','RATE_LIMITED']) {
    let failed=true;
    const f=fixture({initial:good.stored,send:req=>failed?{ok:false,errorCode}:responseFor(req)});
    await assert.rejects(f.service.generate('新场景'),{code:errorCode});
    assert.deepEqual(f.stored,good.stored);assert.equal(f.writes,0);
    failed=false;await f.service.generate('新场景');assert.equal(f.calls,2);
  }
});
test('malformed JSON and schema do not replace successful cache',async()=>{
  const good=fixture();await good.service.generate('开发');
  for(const text of ['not json','{"cards":[]}']){
    const f=fixture({initial:good.stored,send:()=>({ok:true,text})});
    await assert.rejects(f.service.generate('新场景'),{code:'BAD_MODEL_OUTPUT'});
    assert.deepEqual(f.stored,good.stored);
  }
});
test('storage failures are visible and do not claim successful persistence',async()=>{
  const f=fixture({writeFails:true});
  await assert.rejects(f.service.generate('开发'),{code:'STORAGE_ERROR'});
  assert.deepEqual(f.stored,{});
  const broken=c.createService({read:async()=>{throw new Error();},write:async()=>{},send:async()=>{throw new Error('must not call');}});
  await assert.rejects(broken.generate('开发'),{code:'STORAGE_ERROR'});
});
test('a request crossing midnight is never labeled as the new day',async()=>{
  let f;
  f=fixture({send:req=>{f.setDate(new Date(2026,10,1,0,1));return responseFor(req);}});
  const result=await f.service.generate('开发');
  assert.equal(result.date,'2026-11-01');assert.equal(result.cache.date,'2026-10-31');assert.equal(result.current,false);
});
test('corrupt cache is ignored, context is bounded, storage stays well below 64 KiB',async()=>{
  const f=fixture();await f.service.generate('工'.repeat(500));
  assert.ok(Buffer.byteLength(JSON.stringify(f.stored),'utf8')<65536);
  const bad=structuredClone(f.stored);bad.cache.cards=[];
  assert.equal((await fixture({initial:bad}).service.load()).cache,null);
  assert.throws(()=>c.normalizeContext(' '),{code:'INVALID_CONTEXT'});
  assert.throws(()=>c.normalizeContext('工'.repeat(501)),{code:'INVALID_CONTEXT'});
});
