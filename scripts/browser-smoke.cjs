// 独立浏览器验收夹具：运行真实 panel/main/core，只有 Cindy 模型响应和 /kv 由本机测试服务器模拟。
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const [pluginArg,outputArg,moduleArg]=process.argv.slice(2);
const plugin=path.resolve(pluginArg),output=path.resolve(outputArg);
const {chromium}=moduleArg?require(path.resolve(moduleArg,'playwright')):require('playwright');
let kv={},calls=0,mode='success';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const server=http.createServer(async(req,res)=>{
  try {
    const pathname=new URL(req.url,'http://localhost').pathname;
    if(pathname==='/kv') {
      res.setHeader('Content-Type','application/json');
      if(req.method==='PUT'){let raw='';for await(const chunk of req)raw+=chunk;kv=JSON.parse(raw);res.writeHead(204).end();}
      else res.end(JSON.stringify(kv));return;
    }
    if(pathname==='/wake'){res.setHeader('Content-Type','application/json');res.end('{"state":"running"}');return;}
    if(pathname==='/main.html'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><script src="/test-bridge.js"></script><script src="/main.js"></script>');return;}
    if(pathname==='/test-bridge.js'){res.setHeader('Content-Type','text/javascript');res.end('globalThis.cindy={send:async request=>(await fetch("/model",{method:"POST",body:JSON.stringify(request)})).json()};');return;}
    if(pathname==='/model') {
      calls++;let raw='';for await(const chunk of req)raw+=chunk;
      const request=JSON.parse(raw);assert.equal(request.kind,'oneshot_text');
      const data=JSON.parse(request.prompt.split('\n')[3]);
      res.setHeader('Content-Type','application/json');
      if(mode==='failure'){res.end('{"ok":false,"errorCode":"TIMEOUT"}');return;}
      const cards=data.words.map(word=>({word,example:`We discuss ${word} during our weekly engineering review.`,translation:`我们在每周工程评审中讨论 ${word}。`}));
      if(mode==='xss')cards[0].example+=' <img src=x onerror="window.injected=true">';
      res.end(JSON.stringify({ok:true,model:'模拟模型（自动化测试）',text:JSON.stringify({cards})}));return;
    }
    if(!['/panel.html','/panel.css','/panel.js','/core.js','/main.js'].includes(pathname)){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',mime[path.extname(pathname)]);
    // 生产插件同样只能加载同源脚本和资源。
    res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https:");
    res.end(await fs.readFile(path.join(plugin,pathname.slice(1))));
  }catch(error){res.writeHead(500).end(String(error));}
});
(async()=>{
  await fs.mkdir(output,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  let browser;
  try {
    browser=await chromium.launch({channel:'chrome',headless:true});
    const context=await browser.newContext({viewport:{width:1100,height:1050},timezoneId:'Australia/Sydney'});
    const brain=await context.newPage();await brain.goto(origin+'/main.html');
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));brain.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+'/panel.html');
    await page.waitForFunction(()=>document.querySelectorAll('#cards .card').length===10);
    assert.equal(calls,0);
    await page.locator('#generate').click();
    await page.waitForFunction(()=>document.querySelectorAll('#cards .example').length===10);
    await page.waitForFunction(()=>!document.querySelector('#generate').disabled);
    assert.equal(calls,1);
    await page.locator('#generate').click();
    await page.waitForFunction(()=>!document.querySelector('#generate').disabled);
    assert.equal(calls,1);
    await page.reload();await page.waitForFunction(()=>document.querySelectorAll('#cards .example').length===10);
    assert.equal(calls,1);
    await page.evaluate(()=>{const p=document.createElement('p');p.textContent='自动化测试 · 模拟模型响应';p.style='text-align:center;font-size:12px';document.body.prepend(p);});
    await page.screenshot({path:path.join(output,'daily-words-light-test.png'),fullPage:true});
    await page.evaluate(()=>{const s=document.documentElement.style;s.setProperty('--panel-bg','#191d1b');s.setProperty('--surface','#232925');s.setProperty('--text-primary','#ecf0e9');s.setProperty('--text-secondary','#abb6a8');s.setProperty('--border-default','#3b453d');s.colorScheme='dark';});
    await page.screenshot({path:path.join(output,'daily-words-dark-test.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
    await page.screenshot({path:path.join(output,'daily-words-narrow-test.png'),fullPage:true});
    const previous=JSON.stringify(kv);
    mode='failure';await page.locator('#context').fill('设计产品界面');await page.locator('#generate').click();
    await page.locator('#error').waitFor({state:'visible'});assert.match(await page.locator('#error').innerText(),/超时/);
    assert.equal(JSON.stringify(kv),previous);assert.equal(await page.locator('#cards .example').count(),10);
    mode='xss';await page.locator('#generate').click();await page.waitForFunction(()=>!document.querySelector('#generate').disabled);
    assert.equal(await page.locator('#cards .example img').count(),0);assert.equal(await page.evaluate(()=>window.injected),undefined);
    assert.equal(errors.length,0,errors.join('\n'));
    console.log(JSON.stringify({ok:true,cases:['初次十词','批量生成','当日缓存','重新打开','深浅主题','窄屏无横溢','失败保留缓存','模型文本不执行HTML'],model:'模拟响应，未调用真实模型',requests:calls,screenshots:output},null,2));
  }finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
