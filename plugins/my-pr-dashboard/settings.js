'use strict';
const input=document.getElementById('token'),status=document.getElementById('status');
async function readStatus(){try{const r=await fetch('/secrets');if(!r.ok)throw new Error('读取失败');const saved=(await r.json()).find(s=>s.key==='github_token')?.saved;status.textContent=saved?'Token 已保存。刷新看板时将验证 GitHub 连接。':'尚未配置 Token。';}catch{status.textContent='读取凭证状态失败，请重新打开设置。';}}
document.getElementById('save').onclick=async()=>{
  if(!input.value.trim()){status.textContent='请先填写 Token。';return;}
  try{const r=await fetch('/secrets/github_token',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({value:input.value.trim()})});input.value='';if(r.status!==204)throw new Error('保存失败');await readStatus();}catch{input.value='';status.textContent='保存失败，请重新填写并保存。';}
};
document.getElementById('clear').onclick=async()=>{try{const r=await fetch('/secrets/github_token',{method:'DELETE'});if(!r.ok)throw new Error();input.value='';await readStatus();}catch{status.textContent='清除失败，请重试。';}};
void readStatus();
