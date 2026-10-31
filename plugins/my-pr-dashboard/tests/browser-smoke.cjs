// Runs the real main/panel/settings with a local fake Host and GitHub fixtures.
// Screenshots produced here are labeled automated fixtures, not Cindy live evidence.
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const {chromium}=require(process.argv[2]||'playwright');
const out=path.resolve(process.argv[3]||'browser-results');
let kv={},saved=false,secretWrites=0,sendCount=0;
const sha='a'.repeat(40);
const names=['修复刷新后的任务回执','优化分页查询','同步看板设计说明'];
const issues=names.map((title,i)=>({title,number:i+1,repository_url:'https://api.github.com/repos/example/dashboard',pull_request:{},updated_at:'2026-10-31'}));
function github(url){const u=new URL(url),p=u.pathname;
  if(p==='/user')return {login:'example-user'};
  if(p==='/search/issues')return {total_count:3,items:issues};
  if(/\/pulls\/\d+$/.test(p))return {head:{sha:p.endsWith('/1')?sha:p.endsWith('/2')?'b'.repeat(40):'c'.repeat(40)},state:'open',title:names[Number(p.split('/').at(-1))-1]};
  if(p.endsWith('/statuses'))return [];
  if(p.endsWith('/files'))return [{filename:'src/cache.js',status:'modified',patch:'- sendTwice();\n+ sendOnce();'}];
  if(p.endsWith('/annotations'))return [{path:'src/cache.js',start_line:42,annotation_level:'failure',message:'Expected 1 call, received 2'}];
  if(p.endsWith('/check-runs'))return {check_runs:[{id:11,name:'unit-tests',status:p.includes(sha)?'completed':p.includes('b'.repeat(40))?'in_progress':'completed',conclusion:p.includes(sha)?'failure':'success',output:{summary:'Expected single dispatch, received two.',annotations_count:1}}]};
  throw new Error('Unexpected fixture URL');
}
const server=http.createServer(async(req,res)=>{try{
  const p=new URL(req.url,'http://localhost').pathname;let raw='';for await(const c of req)raw+=c;
  res.setHeader('Content-Type','application/json');
  if(p==='/kv'){if(req.method==='PUT'){assert.ok(!raw.includes('test-pat-'));kv=JSON.parse(raw);res.writeHead(204).end();}else res.end(JSON.stringify(kv));return;}
  if(p==='/wake'){res.end('{}');return;}
  if(p==='/secrets'){res.end(JSON.stringify([{key:'github_token',saved}]));return;}
  if(p==='/secrets/github_token'){saved=req.method==='PUT';if(saved)secretWrites++;res.writeHead(204).end();return;}
  if(p==='/proxy'){res.end(JSON.stringify({ok:true,status:200,body:JSON.stringify(github(JSON.parse(raw).url))}));return;}
  if(p==='/task-send'){sendCount++;assert.ok(!JSON.parse(raw).text.includes('PR 文件差异：'));res.end('{"runId":"run-test"}');return;}
  if(p==='/main.html'){res.setHeader('Content-Type','text/html');res.end('<script src="/bridge.js"></script><script src="/main.js"></script>');return;}
  if(p==='/bridge.js'){res.setHeader('Content-Type','text/javascript');res.end(`globalThis.cindy={fetch:async r=>(await fetch('/proxy',{method:'POST',body:JSON.stringify(r)})).json(),tasks:{capabilities:async()=>({operations:['create','send','getRun']}),create:async()=>({taskId:'task-test',revision:0}),send:async r=>(await fetch('/task-send',{method:'POST',body:JSON.stringify(r)})).json(),getRun:async()=>({status:'completed'})}};`);return;}
  if(!/^\/(panel|main|core|settings)\.(html|css|js)$/.test(p)){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[path.extname(p)]);
  res.end(await fs.readFile(path.join(root,p.slice(1))));
}catch(error){res.writeHead(500).end(String(error));}});
(async()=>{
 await fs.mkdir(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
 let browser;const errors=[];
 try{
  browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({viewport:{width:420,height:1060}});
  const brain=await context.newPage();brain.on('pageerror',e=>errors.push(e.message));await brain.goto(origin+'/main.html');
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/panel.html');
  await page.waitForFunction(()=>document.querySelectorAll('.pr').length===3&&!document.getElementById('refresh').disabled);
  assert.equal(await page.locator('.failure').count(),1);assert.equal(await page.locator('.running').count(),1);assert.equal(await page.locator('.success').count(),1);
  assert.equal(await page.locator('.actions a').first().getAttribute('target'),null);
  await page.screenshot({path:path.join(out,'fixture-light.png'),fullPage:true});
  await page.getByText('请我评审',{exact:true}).click();assert.equal(await page.locator('.pr').count(),3);
  await page.locator('.analyze').first().click();await page.waitForFunction(()=>document.querySelectorAll('#tasks .task').length===1);
  assert.equal(sendCount,1);await page.locator('.analyze').first().click();await page.waitForFunction(()=>document.getElementById('notice').textContent.includes('已有同一提交'));assert.equal(sendCount,1);
  await page.getByText('查看运行状态',{exact:true}).click();await page.getByText('completed',{exact:true}).waitFor();
  await page.setViewportSize({width:300,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.emulateMedia({colorScheme:'dark'});await page.addStyleTag({content:':root{--panel-bg:#171d1a;--surface:#202823;--text-primary:#e2ebe5;--text-secondary:#a4b7ab;--border-default:#38463d;color-scheme:dark}'});
  await page.screenshot({path:path.join(out,'fixture-dark-narrow.png'),fullPage:true});
  const settings=await context.newPage();await settings.goto(origin+'/settings.html');
  const manifest=JSON.parse(await fs.readFile(path.join(root,'ghost.json'),'utf8'));
  assert.equal(await settings.locator('a').getAttribute('target'),null);
  assert.equal(await settings.locator('a').getAttribute('href'),manifest.network.secrets[0].url);
  await settings.locator('#token').fill('test-pat-fixture-only');await settings.locator('#save').click();await settings.getByText('Token 已保存。刷新看板时将验证 GitHub 连接。',{exact:true}).waitFor();
  assert.equal(await settings.locator('#token').inputValue(),'');assert.equal(secretWrites,1);assert.equal(JSON.stringify(kv).includes('test-pat-'),false);
  assert.deepEqual(errors,[]);const result={checks:9,passed:true,sendCount,secretWrites,screenshotKind:'automated fixtures, not Cindy live screenshots'};
  await fs.writeFile(path.join(out,'browser-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
