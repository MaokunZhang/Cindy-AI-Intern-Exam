'use strict';
const channel=new BroadcastChannel('my-pr-dashboard-v1'),pending=new Map();
const labels={failure:'挂了',success:'过了',running:'在跑',unknown:'读取异常',none:'无检查',skipped:'已跳过',loading:'读取中'};
const relationLabels={author:'我发起的',assignee:'分配给我',review:'请我评审'};
let state={items:[],receipts:[],warnings:[]},filter='all',submitting=false;
const el=id=>document.getElementById(id);
function node(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
function request(action,value){return new Promise(async(resolve,reject)=>{
  const id=crypto.randomUUID(),message={type:'request',id,action,value};
  const receipt={resolve,reject,timer:null,deadline:null};pending.set(id,receipt);
  receipt.deadline=setTimeout(()=>{clearInterval(receipt.timer);pending.delete(id);reject(new Error('等待超时。提交任务时请重新点击同一个 PR 恢复回执；不要另建任务。'));},180000);
  try{const r=await fetch('/wake');if(!r.ok)throw new Error('无法唤醒看板');channel.postMessage(message);receipt.timer=setInterval(()=>channel.postMessage(message),600);}
  catch(error){clearTimeout(receipt.deadline);pending.delete(id);reject(error);}
});}
channel.onmessage=({data})=>{
  if(data?.type==='state'){state=data.state;render();return;}
  const p=pending.get(data?.id);if(!p)return;
  if(data.type==='ack'){clearInterval(p.timer);return;}
  if(data.type==='result'){clearInterval(p.timer);clearTimeout(p.deadline);pending.delete(data.id);data.ok?p.resolve(data.value):p.reject(new Error(data.error));}
};
function render(){
  el('account').textContent=state.login?`@${state.login} 的待处理 PR`:'连接 GitHub 后查看待处理 PR';
  el('refresh').disabled=!!state.busy;
  for(const [name,predicate] of [['total',()=>true],['failed',i=>i.ci==='failure'],['running',i=>i.ci==='running'],['passed',i=>i.ci==='success']])el(name).textContent=state.items.filter(predicate).length;
  el('warning').textContent=state.warnings.join('\n');
  if(state.busy)el('notice').textContent=state.progress;
  else if(el('notice').dataset.progress==='true')el('notice').textContent='';
  el('notice').dataset.progress=String(!!state.busy);
  el('updated').textContent=state.loadedAt?`更新于 ${new Date(state.loadedAt).toLocaleString('zh-CN')}`:'尚未完成刷新';
  el('list').replaceChildren();
  const items=state.items.filter(i=>filter==='all'||i.relations.includes(filter));
  if(!items.length)el('list').append(node('div',state.busy?'正在读取 GitHub…':state.warnings.length?'列表暂不完整，请先处理上方提示。':'这个范围暂时没有待处理 PR。','empty'));
  for(const item of items){
    const card=node('article',undefined,'pr'),top=node('div',undefined,'pr-top');
    top.append(node('span',`${item.repo} #${item.number}`,'repo'),node('span',labels[item.ci]||item.ci,`badge ${item.ci}`));
    card.append(top,node('h2',item.title),node('div',item.relations.map(r=>relationLabels[r]).join(' · ')+(item.draft?' · 草稿':''),'meta'));
    if(item.sha)card.append(node('div',`head ${item.sha.slice(0,7)} · ${item.checks.length+item.statuses.length} 项检查`,'meta'));
    if(item.errors?.length)card.append(node('div',item.errors.join('；'),'error'));
    const actions=node('div',undefined,'actions'),button=node('button','让 AI 排查 CI','analyze');
    button.disabled=submitting||!!state.busy;
    button.addEventListener('click',()=>analyze(item.key));
    const link=node('a','GitHub ↗');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';
    actions.append(button,link);card.append(actions);el('list').append(card);
  }
  el('tasks').replaceChildren();
  if(state.pending){const box=node('div',`待恢复提交：${state.pending.key}。再次点击此 PR 将沿用原请求键。`,'task');el('tasks').append(box);}
  for(const receipt of state.receipts.slice(0,4)){
    const box=node('div',undefined,'task');box.append(node('p',`已提交 · ${receipt.title}`),node('small','在 Cindy 左侧任务列表打开同名任务，查看或继续追问。'));
    const status=node('p',''),button=node('button','查看运行状态');button.onclick=async()=>{button.disabled=true;try{const r=await request('status',receipt.runId);status.textContent=`${r.status||r.state||'已受理'}${r.result?.outcome?' · '+r.result.outcome:''}`;}catch(e){status.textContent=e.message;}finally{button.disabled=false;}};
    box.append(button,status);el('tasks').append(box);
  }
}
async function analyze(key){submitting=true;el('notice').dataset.progress='false';el('notice').textContent='正在读取当前提交的 CI 证据并提交排查任务…';render();try{const r=await request('analyze',key);el('notice').textContent=`${r.reused?'已有同一提交的排查任务':'已提交 AI 排查'}：${r.receipt.title}。请在左侧任务列表查看。`;}catch(error){el('notice').textContent=error.message;}finally{submitting=false;render();}}
for(const button of document.querySelectorAll('[data-filter]'))button.onclick=()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();};
async function load(action){el('notice').textContent='正在连接看板…';try{state=await request(action);render();}catch(error){el('notice').textContent=error.message;}}
el('refresh').onclick=()=>load('refresh');void load('load');
