'use strict';
// Cindy 将 entry 当作普通 script 加载。动态 import 执行同源 core.js，不依赖 Node。
void import('./core.js').then(() => {
  const {createService,errorInfo}=globalThis.WordCards;
  const channel=new BroadcastChannel('daily-word-cards-v1');
  const service=createService({
    read:async()=>{const r=await fetch('/kv');if(!r.ok)throw new Error();return r.json();},
    write:async(value)=>{const r=await fetch('/kv',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});if(!r.ok)throw new Error();},
    send:request=>cindy.send(request)
  });
  const requests=new Map();
  channel.onmessage=({data})=>{
    if (!data || data.type!=='request' || typeof data.id!=='string' || data.id.length>80 || !['load','generate'].includes(data.action)) return;
    channel.postMessage({type:'ack',id:data.id});
    // 重发只会再次取得同一 Promise，不能重复花费模型额度。
    if (!requests.has(data.id)) {
      const task=Promise.resolve().then(()=>data.action==='load'?service.load():service.generate(data.context,data.force===true))
        .then(state=>({type:'result',id:data.id,ok:true,state}),error=>({type:'result',id:data.id,ok:false,error:errorInfo(error)}));
      requests.set(data.id,task);
      task.finally(()=>{
        // 保留最近回执，避免 ack/result 恰好丢失导致同请求重复执行。
        if(requests.size>32) requests.delete(requests.keys().next().value);
      });
    }
    requests.get(data.id).then(result=>channel.postMessage(result));
  };
});
