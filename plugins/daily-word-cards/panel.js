'use strict';
(() => {
  const api=globalThis.WordCards;
  const $=id=>document.getElementById(id);
  const channel=new BroadcastChannel('daily-word-cards-v1');
  const pending=new Map();
  let state=null,busy=false,rolloverTimer=null,scrollTimer=null;
  const showError=e=>{$('error').textContent=e.message;$('error').hidden=false;};
  function request(action,extra={}) {
    return new Promise(async(resolve,reject)=>{
      const id=crypto.randomUUID();
      const message={type:'request',id,action,...extra};
      let acknowledged=false,interval;
      const timeout=setTimeout(()=>finish(false,{code:'CONNECTION_TIMEOUT'}),80000);
      const ackTimeout=setTimeout(()=>{if(!acknowledged)finish(false,{code:'CONNECTION_TIMEOUT'});},10000);
      function finish(ok,result){clearInterval(interval);clearTimeout(timeout);clearTimeout(ackTimeout);pending.delete(id);ok?resolve(result):reject(result.message?result:api.errorInfo(result));}
      pending.set(id,{ack:()=>{acknowledged=true;clearTimeout(ackTimeout);},finish});
      try {
        const wake=await fetch('/wake');
        if(!wake.ok)throw new Error();
        if(!pending.has(id))return;
        channel.postMessage(message);
        interval=setInterval(()=>{if(!acknowledged)channel.postMessage(message);},300);
      } catch {finish(false,{code:'HOST_UNAVAILABLE'});}
    });
  }
  channel.onmessage=({data})=>{
    const job=pending.get(data?.id);
    if(!job)return;
    if(data.type==='ack')job.ack();
    if(data.type==='result')job.finish(data.ok,data.ok?data.state:data.error);
  };
  function renderCards(target,words) {
    target.replaceChildren(...words.map((word,index)=>{
      const card=document.createElement('article');card.className='card';
      const row=document.createElement('div');row.className='word-row';
      const number=document.createElement('span');number.className='index';number.textContent=String(index+1).padStart(2,'0');
      const heading=document.createElement('h2');heading.textContent=word.word;row.append(number,heading);card.append(row);
      for(const [cls,text]of [['meaning',word.meaning],['example',word.example],['translation',word.translation]]) {
        if(text){const p=document.createElement('p');p.className=cls;p.textContent=text;card.append(p);}
      }
      if(!word.example){const p=document.createElement('p');p.className='empty';p.textContent='例句待生成';card.append(p);}
      return card;
    }));
  }
  function render(next) {
    state=next;
    $('date').textContent=next.date+' · 今天的 10 个单词';
    renderCards($('cards'),next.current?next.cache.cards:next.words);
    $('regenerate').hidden=!next.current;
    $('status').textContent=next.current?'今日例句已保存'+(next.cache.model?' · 模型：'+next.cache.model:''):'填写工作场景，为今天的 10 个单词生成例句。';
    $('previous').hidden=!next.cache||next.current;
    if(next.cache&&!next.current){$('previous-label').textContent=next.cache.date+' · '+next.cache.context;renderCards($('previous-cards'),next.cache.cards);}
    clearTimeout(rolloverTimer);
    const now=new Date(),midnight=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
    rolloverTimer=setTimeout(refresh,midnight-now+1000);
  }
  function setBusy(value){busy=value;$('generate').disabled=value;$('regenerate').disabled=value;$('context').disabled=value;}
  async function generate(force=false) {
    if(busy)return;
    $('error').hidden=true;
    try {
      const context=api.normalizeContext($('context').value);
      setBusy(true);$('status').textContent='正在通过 Cindy 生成 10 条工作例句…';
      render(await request('generate',{context,force}));
    } catch(e) {if(state)render(state);showError(e.message&&e.code?api.errorInfo(e):api.errorInfo({code:'INTERNAL'}));}
    finally {setBusy(false);}
  }
  async function refresh() {
    if(busy)return;
    const first=state===null;
    try {
      const next=await request('load');
      if(first)$('context').value=next.context;
      render(next);
      if(next.configured&&!next.current&&$('context').value.trim()===next.context)await generate();
    } catch(e){showError(e);$('status').textContent='学习记录未加载。请在 Cindy 中重新打开插件。';}
  }
  $('generate').addEventListener('click',()=>generate());
  $('regenerate').addEventListener('click',()=>generate(true));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state?.date!==api.localDate())refresh();});
  window.addEventListener('focus',()=>{if(state?.date!==api.localDate())refresh();});
  window.addEventListener('scroll',()=>{document.documentElement.classList.add('is-scrolling');clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>document.documentElement.classList.remove('is-scrolling'),2000);},{passive:true});
  window.addEventListener('pagehide',()=>{clearTimeout(rolloverTimer);for(const job of pending.values())job.finish(false,{code:'CONNECTION_TIMEOUT'});channel.close();});
  void refresh();
})();
