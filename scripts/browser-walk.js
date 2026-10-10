async page => {
 const assert=(ok,message)=>{if(!ok)throw new Error(message)};
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const Native=window.AudioContext;window.__audioContexts=[];window.AudioContext=new Proxy(Native,{construct(target,args){const ctx=Reflect.construct(target,args);window.__audioContexts.push(ctx);return ctx}})});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 await page.evaluate(()=>localStorage.clear());await page.reload({waitUntil:'networkidle'});
 await page.setViewportSize({width:1440,height:900});
 await page.waitForFunction(()=>document.body.dataset.build==='0.4');
 await page.locator('#begin').click();
 const snapshots={1:await page.evaluate(()=>JSON.parse(localStorage.getItem('the-hundred-story-v3')))};
 const first=['diner','keira','keira_family','keira_guests','keira_oath','keira_work','street','marcus','marcus_oaths','shrine','yuen','yuen_oath','hotel','daniel','daniel_vincent','vincent','vincent_names','vincent_meeting','vincent_keira','vincent_daniel','vincent_press','vincent_cast'];
 const routes={
  2:['clinic','mei','mei_missing','mei_help','market','owen','owen_photo','diner','keira','keira_support','hotel','celia','celia_offer','celia_receipt','celia_release'],
  3:['pier','jun','jun_passage','jun_manifest','street','marcus','marcus_route','shrine','yuen','yuen_crossing','pier','jun','jun_return','jun_refuse','jun_release'],
  4:['rooftop','sora','sora_price','apartment','ada','ada_memory','clinic','mei','mei_witness','market','owen','owen_negative','rooftop','sora','sora_challenge','sora_renounce','sora_release'],
  5:['apartment','ada','ada_future','diner','keira','keira_future','shrine','yuen','yuen_origin','rooftop','iris','iris_names','iris_host','iris_refuse','iris_release']
 };
 async function action(id){
  if(await page.locator('#locations [data-place="'+id+'"]').count())await page.locator('#locations [data-place="'+id+'"]').click();
  else if(await page.locator('#people [data-person="'+id+'"]').count()){if(!await page.locator('#people [data-person="'+id+'"]').isVisible())await page.locator('#leave').click();await page.locator('#people [data-person="'+id+'"]').click();}
  else await page.locator('[data-choice="'+id+'"]').click();
 }
 for(let chapter=1;chapter<=5;chapter++){
  for(const id of chapter===1?first:routes[chapter])await action(id);
  assert(await page.locator('#ending').isVisible(),'Chapter '+chapter+' must complete');
  assert((await page.locator('#ending').innerText()).includes(chapter===5?'CONTEST IS BROKEN':'CHAPTER COMPLETE'),'Chapter '+chapter+' must win');
  if(chapter<5){await page.locator('[data-stat="sense"]').click();await page.locator('#continueChapter').click();snapshots[chapter+1]=await page.evaluate(()=>JSON.parse(localStorage.getItem('the-hundred-story-v3')))}
 }
 const final=await page.evaluate(()=>JSON.parse(localStorage.getItem('the-hundred-story-v3')));
 for(const ending of ['protect','ascend','sever']){
  await page.evaluate(s=>localStorage.setItem('the-hundred-story-v3',JSON.stringify(s)),final);
  await page.reload({waitUntil:'networkidle'});await page.locator('#resume').click();await page.locator('[data-ending="'+ending+'"]').click();
  assert(await page.locator('#ending').isVisible(),'Final ending must display');
  assert((await page.evaluate(()=>JSON.parse(localStorage.getItem('the-hundred-story-v3')))).outcome==='ending:'+ending,'Ending saved correctly');
 }
 // Authentic chapter-start snapshots from the golden path are layout fixtures.
 const cases=[['apartment',1],['street',1],['diner',1],['hotel',1],['shrine',1],['apartment',2],['street',2],['diner',2],['hotel',2],['rooftop',2],['clinic',2],['market',2],['apartment',3],['street',3],['shrine',3],['market',3],['clinic',3],['pier',3],['apartment',4],['street',4],['clinic',4],['market',4],['rooftop',4]];
 const seen=new Set();
 for(const viewport of [{width:1440,height:900},{width:768,height:1024},{width:390,height:667}]){
  await page.setViewportSize(viewport);
  for(const [place,chapter] of cases){
   await page.evaluate(s=>localStorage.setItem('the-hundred-story-v3',JSON.stringify(s)),snapshots[chapter]);
   await page.reload({waitUntil:'networkidle'});await page.locator('#resume').click();await page.locator('#locations [data-place="'+place+'"]').click();
   await page.waitForFunction(p=>{const i=document.querySelector('#backdrop');return i.dataset.place===p&&i.complete&&i.naturalWidth>100},place);
   await page.waitForFunction(()=>[...document.querySelectorAll('#people img')].every(i=>i.complete&&i.naturalWidth>=1024&&i.naturalHeight>=1536));
   const people=await page.locator('#people [data-person]').evaluateAll(xs=>xs.map(x=>x.dataset.person));
   assert(people.length>0,'Scene must contain people');
   for(const id of people){
    seen.add(id);const idle=await page.locator('[data-person="'+id+'"] img').boundingBox();
    await page.locator('[data-person="'+id+'"]').click();
    await page.waitForTimeout(50);
    const geometry=await page.locator('.actor.selected').evaluate(el=>{
     const r=el.getBoundingClientRect(),p=el.parentElement.getBoundingClientRect(),d=document.querySelector('.dialogue').getBoundingClientRect();
     return{centered:Math.abs(r.x+r.width/2-p.x-p.width/2)<2,above:r.bottom<=d.top-8,width:el.querySelector("img").getBoundingClientRect().width,dialogueVisible:d.bottom<=window.innerHeight+1,inside:r.left>=p.left&&r.right<=p.right&&r.top>=p.top-1,others:[...el.parentElement.children].filter(x=>!x.hidden).length};
    });
    assert(geometry.centered,'Speaker must be centered: '+id);assert(geometry.above,'Speaker must clear dialogue: '+id);assert(geometry.dialogueVisible,'Dialogue fits viewport: '+id);
    assert(geometry.inside,'Speaker must fit scene: '+id);assert(geometry.others===1,'Only selected speaker visible');
    assert(geometry.width>idle.width,'Speaker must become larger: '+id);
    await page.locator('#leave').click();assert(await page.locator('#people [data-person]:visible').count()===people.length,'Leaving restores cast');
   }
   const boxes=await page.locator('#people [data-person]').evaluateAll(xs=>xs.map(x=>x.getBoundingClientRect().toJSON()));
   boxes.sort((a,b)=>a.left-b.left);assert(boxes.every((box,i)=>i===0||boxes[i-1].right<=box.left),'Scene portraits must not overlap: '+place+' chapter '+chapter+' viewport '+viewport.width);
   if(place==='hotel'||place==='rooftop')await page.screenshot({path:'screenshots/'+place+'-'+viewport.width+'-scene.png'});
  }
 }
 assert(seen.size===30,'Every illustrated character must decode and be selectable');
 await page.setViewportSize({width:1440,height:900});
 await page.evaluate(s=>localStorage.setItem('the-hundred-story-v3',JSON.stringify(s)),snapshots[2]);await page.reload({waitUntil:'networkidle'});await page.locator('#resume').click();
 await page.locator('#save').click();await page.locator('[data-save-slot="1"]').click();
 assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('hundred-slot-1')).chapter===2),'Save slot stores chapter');
 await page.locator('#locations [data-place=street]').click();await page.locator('#save').click();page.once('dialog',d=>d.accept());await page.locator('[data-load-slot="1"]').click();assert((await page.locator('#placeName').innerText())==='Old Apartment','Slot restoration returns to saved location');
 await page.locator('#history').click();assert(await page.locator('.history-entry').count()>10,'History survives chapters');await page.locator('#closePanel').click();
 await page.locator('[data-person="ada"]').click();await page.locator('#settings').click();await page.locator('#musicVolume').press('Home');for(let i=0;i<4;i++)await page.locator('#musicVolume').press('ArrowRight');await page.locator('#ambienceVolume').press('Home');for(let i=0;i<2;i++)await page.locator('#ambienceVolume').press('ArrowRight');await page.locator('#textSpeed').selectOption('45');const before=await page.evaluate(()=>localStorage.getItem('the-hundred-story-v3'));await page.locator('#textSpeed').press('1');assert(await page.evaluate(()=>localStorage.getItem('the-hundred-story-v3'))===before,'Settings keys must not advance story');await page.locator('#closePanel').click();
 await page.reload({waitUntil:'networkidle'});await page.locator('#resume').click();await page.locator('#settings').click();assert(await page.locator('#textSpeed').inputValue()==='45','Text speed persists after reload');await page.locator('#closePanel').click();
 await page.locator('#line').press('Enter');assert((await page.locator('#line').innerText()).length>50,'Click reveals full line');
 await page.locator('#audio').click();assert((await page.locator('#audio').innerText()).includes('On'),'Music can start');
 assert(await page.evaluate(()=>window.__audioContexts.some(c=>c.state==='running')),'Real audio context running');
 await page.locator('#audio').click();assert((await page.locator('#audio').innerText()).includes('Off'),'Music can stop');
 await page.screenshot({path:'screenshots/campaign-desktop-focus.png'});
 await page.setViewportSize({width:390,height:667});await page.screenshot({path:'screenshots/campaign-mobile-focus.png',fullPage:true});
 assert(errors.length===0,'No JavaScript errors: '+errors.join('; '));
 return{passed:true,chapters:5,endings:3,locations:9,characters:seen.size,viewports:3,saveSlots:true,history:true,textSpeed:true,audioContext:true,pageErrors:errors};
}
