'use strict';
const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const fsp=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.avif':'image/avif'};
const server=http.createServer(async(req,res)=>{
 try{
  const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(relative==='/'?'/index.html':relative));
  if(!file.startsWith(root+path.sep))throw new Error('Forbidden');
  const data=await fsp.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found')}
});
(async()=>{
 await new Promise(resolve=>server.listen(4173,'127.0.0.1',resolve));
 await fsp.mkdir(path.join(root,'screenshots'),{recursive:true});
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.body.dataset.paintedCast==='1152x768',{},{timeout:15000});
  await page.locator('#begin').click();
  for(const place of ['apartment','street','diner','hotel','shrine']){
    await page.locator('[data-place="'+place+'"]').click();
    await page.waitForFunction(p=>{const im=document.querySelector('#backdrop');return im.dataset.place===p&&im.complete&&im.naturalWidth>100},place,{timeout:20000});
    const images=await page.locator('#people img').evaluateAll(imgs=>imgs.map(i=>({ready:i.complete,w:i.naturalWidth,h:i.naturalHeight,art:i.dataset.art})));
    assert.ok(images.length>0);assert.ok(images.every(i=>i.ready&&i.w===1152&&i.h===768&&i.art==='painted'));
    await page.locator('[data-person]').first().click();
    assert.ok((await page.locator('#speaker').innerText())!=='THE CITY');
    assert.ok(await page.locator('[data-choice]').count()>0);
    if(place==='diner'){
      await page.locator('[data-choice="keira_daily"]').click();
      assert.match(await page.locator('#line').innerText(),/Busy/);
    }
    await page.screenshot({path:path.join(root,'screenshots',place+'-desktop.png')});
    await page.locator('#leave').click();
  }
  await page.locator('[data-place="diner"]').click();await page.locator('[data-person="keira"]').click();
  await page.locator('#save').click();
  const snapshot=await page.evaluate(()=>localStorage.getItem('the-hundred-story-v2'));
  assert.ok(snapshot&&JSON.parse(snapshot).place==='diner');
  await page.reload({waitUntil:'networkidle'});await page.locator('#resume').click();
  assert.match(await page.locator('#placeName').innerText(),/Keira/);
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(root,'screenshots','diner-mobile.png'),fullPage:true});
  assert.deepEqual(errors,[]);
  await fsp.writeFile(path.join(root,'screenshots','result.json'),JSON.stringify({browser:'Chromium',passed:true,scenes:5,portraitDecode:'1152x768',dialogue:true,saveResume:true,pageErrors:errors},null,2));
  console.log('PASS: 5 real photo scenes; painted cast decoded; dialogue and save/resume; desktop/mobile screenshots; no JS page errors.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>server.close());
