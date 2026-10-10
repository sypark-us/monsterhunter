async page=>{
 const assert=(value,message)=>{if(!value)throw Error(message)},hangul=/[가-힣]/;
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 // Play the Korean campaign in short landscape, where hints overlap scene actors.
 await page.setViewportSize({width:844,height:390});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 await page.evaluate(()=>localStorage.clear());await page.reload({waitUntil:'networkidle'});
 await page.locator('#introLanguage').selectOption('ko');
 assert(await page.locator('html').getAttribute('lang')==='ko','Opening language selection must set document language');
 assert((await page.locator('#begin').innerText())==='이야기 시작','Opening controls must translate');
 assert(hangul.test(await page.locator('#introStakes').innerText()),'Opening explanation must translate');
 await page.locator('#begin').click();await page.locator('[data-person=ada]').click();
 const snapshot=await page.evaluate(()=>localStorage.getItem('the-hundred-story-v3'));
 const koreanLine=await page.locator('#line').innerText();
 assert(hangul.test(koreanLine),'Existing character dialogue must translate');
 assert((await page.locator('[data-choice=ada_work]').innerText()).includes('기력'),'Korean choice costs must translate');
 await page.locator('#audio').click();
 assert((await page.locator('#audio').innerText())==='♫ 켜짐','Audio control must translate after its asynchronous update');
 await page.locator('#language').selectOption('en');
 assert((await page.locator('#audio').innerText())==='♫ On','Audio must switch back to English');
 assert(await page.evaluate(()=>localStorage.getItem('the-hundred-story-v3'))===snapshot,'Changing language must not change the saved story');
 assert((await page.locator('#line').innerText()).includes('You look exhausted'),'Switching back must restore the exact English line');
 await page.locator('#language').selectOption('ko');
 assert((await page.locator('#line').innerText())===koreanLine,'Repeated switches must preserve the original source');
 await page.locator('[data-choice=ada_work]').click();
 await page.locator('#history').click();
 assert(hangul.test(await page.locator('.history-question').innerText()),'English-backed history must display in Korean');
 assert(!(await page.locator('#panelBody').innerText()).includes('How is everything'),'History must not leave the English question visible');
 await page.locator('#closePanel').click();
 await page.locator('#settings').click();
 await page.locator('#textSpeed').selectOption('25');await page.locator('#closePanel').click();
 await page.locator('[data-choice=ada_strange]').click();
 await page.locator('#language').selectOption('en');await page.locator('#line').click();
 assert((await page.locator('#line').innerText()).includes('My mother says'),'Language changes must reset a running typewriter');
 await page.locator('#language').selectOption('ko');await page.locator('#line').click();
 assert(hangul.test(await page.locator('#line').innerText()),'Korean typewriter must reveal the complete localized line');
 await page.locator('#settings').click();await page.locator('#textSpeed').selectOption('0');await page.locator('#closePanel').click();
 await page.locator('#save').click();await page.locator('[data-save-slot="1"]').click();
 const saved=await page.evaluate(()=>localStorage.getItem('hundred-slot-1'));
 await page.reload({waitUntil:'networkidle'});
 assert(await page.locator('html').getAttribute('lang')==='ko','Korean preference must survive reload');
 assert(hangul.test(await page.locator('#resumeContext').innerText()),'Returning-save context must translate');
 await page.locator('#resume').click();
 assert(await page.evaluate(()=>localStorage.getItem('hundred-slot-1'))===saved,'Language persistence must preserve save slots');
 await page.locator('#help').click();
 assert(hangul.test(await page.locator('#panelBody').innerText()),'Chapter Help must translate');
 assert(!(await page.locator('#panelBody').innerText()).includes('I release'),'Unknown ritual must stay hidden in Korean');
 await page.locator('#closePanel').click();await page.locator('#leave').click();
 const routes={
  1:['diner','keira','keira_family','keira_guests','keira_oath','keira_work','street','marcus','marcus_oaths','shrine','yuen','yuen_oath','hotel','daniel','daniel_vincent','vincent','vincent_names','vincent_meeting','vincent_keira','vincent_daniel','vincent_press','vincent_cast'],
  2:['clinic','mei','mei_missing','mei_help','market','owen','owen_photo','diner','keira','keira_support','hotel','celia','celia_offer','celia_receipt','celia_release'],
  3:['pier','jun','jun_passage','jun_manifest','street','marcus','marcus_route','shrine','yuen','yuen_crossing','pier','jun','jun_return','jun_refuse','jun_release'],
  4:['rooftop','sora','sora_price','apartment','ada','ada_memory','clinic','mei','mei_witness','market','owen','owen_negative','rooftop','sora','sora_challenge','sora_renounce','sora_release'],
  5:['apartment','ada','ada_future','diner','keira','keira_future','shrine','yuen','yuen_origin','rooftop','iris','iris_names','iris_host','iris_refuse','iris_release']
 };
 const finalStates=[];
 for(let chapter=1;chapter<=5;chapter++){
  for(const id of routes[chapter]){
   const place=page.locator('#locations [data-place="'+id+'"]'),person=page.locator('[data-person="'+id+'"]');
   if(await place.count())await place.click();else if(await person.count()){
    if(!await person.isVisible()&&await page.locator('#leave').count())await page.locator('#leave').click();
    await person.click();
   }else await page.locator('[data-choice="'+id+'"]').click();
   const line=await page.locator('#line').innerText();
   assert(hangul.test(line),'Korean narrative must cover action '+id);
  }
  assert(await page.locator('#ending').isVisible(),'Korean chapter '+chapter+' must complete');
  assert(hangul.test(await page.locator('#ending').innerText()),'Chapter completion must translate');
  if(chapter<5){await page.locator('[data-stat=sense]').click();await page.locator('#continueChapter').click()}
 }
 for(const id of ['protect','ascend','sever']){
  const text=await page.locator('[data-ending="'+id+'"]').innerText();assert(hangul.test(text),'Every ending choice must translate');finalStates.push(text);
 }
 await page.locator('[data-ending=protect]').click();
 assert((await page.locator('#ending h2').innerText())==='당신 자신의 삶','Selected ending must be rendered in Korean');
 await page.locator('#playAgain').click();await page.locator('#locations [data-place=street]').click();await page.locator('[data-person=marcus]').click();
 for(const viewport of [{width:1440,height:900},{width:390,height:667},{width:844,height:390}]){
  await page.setViewportSize(viewport);
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const choices=await page.locator('.choices').boundingBox(),reply=await page.locator('[data-choice=marcus_job]').boundingBox();
  assert(reply.y>=choices.y&&reply.y+reply.height<=choices.y+choices.height,'First Korean reply must fit the visible options area at '+viewport.width+'×'+viewport.height);
  const panel=await page.locator('.dialogue').boundingBox();assert(panel.y+panel.height<=viewport.height+1,'Korean dialogue must fit the viewport');
  assert(await page.locator('.actor.selected .name').evaluate(el=>getComputedStyle(el).fontFamily.includes('Hundred Korean')),'Actor name must use the bundled Korean font');
  await page.screenshot({path:'screenshots/korean-'+viewport.width+'x'+viewport.height+'.png'});
 }
 await page.goto('http://127.0.0.1:4173/credits.html',{waitUntil:'networkidle'});
 assert(await page.locator('html').getAttribute('lang')==='ko','Credits must preserve Korean preference');
 assert(hangul.test(await page.locator('h2').innerText()),'Credits must translate');
 assert(errors.length===0,'Korean run must have no JavaScript errors: '+errors.join('; '));
 return{passed:true,chapters:5,endingChoices:finalStates,persistentLanguage:true,saveUnchanged:true,history:true,typewriter:true,viewports:3,pageErrors:errors};
}
