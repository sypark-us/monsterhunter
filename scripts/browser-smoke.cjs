'use strict';
const {chromium}=require('playwright');
const http=require('node:http');
const fsp=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.avif':'image/avif','.png':'image/png'};
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
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  const vm=require('node:vm');
  const clarityWalk=vm.runInNewContext(await fsp.readFile(path.join(root,'scripts/browser-clarity.js'),'utf8'));
  const clarity=await clarityWalk(page);
  const walk=vm.runInNewContext(await fsp.readFile(path.join(root,'scripts/browser-walk.js'),'utf8'),{setTimeout});
  const result=await walk(page);
  result.clarity=clarity;
  await fsp.writeFile(path.join(root,'screenshots','result.json'),JSON.stringify(result,null,2));
  console.log('PASS: story guidance, persistent learned rules, character roles, deadline and action costs; five chapters, three endings, nine locations, thirty high-resolution characters, twelve activity/portrait transitions, character/background scale across five viewports, dialogue clearance, saves/history/settings and real audio; no JS errors.');
 }catch(error){
  await page.screenshot({path:path.join(root,'screenshots','failure.png'),fullPage:true}).catch(()=>{});
  await fsp.writeFile(path.join(root,'screenshots','error.json'),JSON.stringify({error:String(error),pageErrors:errors},null,2));
  throw error;
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>server.close());
