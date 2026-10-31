'use strict';
void import('./core.js').then(()=>{
  const channel=new BroadcastChannel('my-pr-dashboard-v1');
  const {createClient,createService,errorText}=globalThis.PrDashboard;
  const service=createService({client:createClient(request=>cindy.fetch(request)),tasks:cindy.tasks,
    read:async()=>{const r=await fetch('/kv');if(!r.ok)throw new Error('读取看板状态失败');return r.json();},
    write:async value=>{const r=await fetch('/kv',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});if(!r.ok)throw new Error('保存任务回执失败，请重试原 PR');},
    publish:state=>channel.postMessage({type:'state',state})});
  const requests=new Map();
  channel.onmessage=({data})=>{
    if(!data||data.type!=='request'||typeof data.id!=='string'||data.id.length>80||!['load','refresh','analyze','status'].includes(data.action))return;
    channel.postMessage({type:'ack',id:data.id});
    if(!requests.has(data.id)){
      const result=Promise.resolve().then(()=>service[data.action](data.value))
        .then(value=>({type:'result',id:data.id,ok:true,value}),error=>({type:'result',id:data.id,ok:false,error:errorText(error)}));
      requests.set(data.id,result);
      result.finally(()=>{if(requests.size>64)requests.delete(requests.keys().next().value);});
    }
    requests.get(data.id).then(result=>channel.postMessage(result));
  };
});
