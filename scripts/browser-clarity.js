async page => {
 const assert=(value,message)=>{if(!value)throw Error(message)};
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 assert((await page.locator('#intro').innerText()).includes('02:00'),'Opening must explain the actual deadline');
 await page.locator('#begin').click();
 assert((await page.locator('#deadline').innerText()).includes('02:00'),'Deadline stays visible during play');
 await page.locator('#help').click();
 assert(await page.locator('#playerPanel').isVisible(),'Story & Help must be rereadable');
 const unknown=await page.locator('#panelBody').innerText();
 assert(unknown.includes('The First Vow'),'Help must orient the player to this chapter');
 assert(!unknown.includes('I release you from your promise'),'Unlearned ritual answer must remain hidden');
 assert(!unknown.includes('Vincent'),'Opening guidance must not identify the rival');
 const before=await page.evaluate(()=>localStorage.getItem('the-hundred-story-v3'));
 await page.locator('#closePanel').click();await page.locator('#help').click();await page.locator('#closePanel').click();
 assert(await page.evaluate(()=>localStorage.getItem('the-hundred-story-v3'))===before,'Reading help must not consume time or change the save');
 await page.locator('[data-person=ada]').click();
 assert((await page.locator('#speakerRole').innerText()).includes('neighbor'),'Character role must introduce the speaker');
 assert((await page.locator('[data-choice=ada_strange] .action-cost').innerText()).includes('8 min'),'Replies must show their time cost');
 await page.locator('[data-choice=ada_strange]').click();await page.locator('#leave').click();
 for(const [place,id,choice] of [['street','marcus','marcus_oaths'],['shrine','yuen','yuen_oath']]){
  await page.locator('#locations [data-place='+place+']').click();
  const timeBefore=await page.evaluate(()=>JSON.parse(localStorage.getItem('the-hundred-story-v3')).time);
  await page.locator('[data-person='+id+']').click();
  if(id==='marcus'){
   await page.locator('#line').click();
   assert((await page.locator('#line').innerText()).includes('Marcus Yip. I deliver around here'),'A stranger must introduce himself before the first reply');
   assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('the-hundred-story-v3')).time)===timeBefore,'First introductions must not charge time');
   await page.setViewportSize({width:844,height:390});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const choices=await page.locator('.choices').boundingBox(),reply=await page.locator('[data-choice=marcus_job]').boundingBox();
   assert(reply.y>=choices.y&&reply.y+reply.height<=choices.y+choices.height,'A complete reply must be readable beneath or beside a first introduction on short landscape screens');
   await page.setViewportSize({width:1440,height:900});
  }
  await page.locator('[data-choice='+choice+']').click();await page.locator('#leave').click();
  if(id==='marcus'){
   await page.locator('[data-person=marcus]').click();await page.locator('#line').click();
   assert(!(await page.locator('#line').innerText()).includes('Marcus Yip. I deliver around here'),'Known people must not introduce themselves again');
   await page.locator('#leave').click();
  }
 }
 assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('the-hundred-story-v3')).powerKnown),'Trusted conversations must teach the ritual');
 await page.locator('[data-person=yuen]').click();await page.locator('[data-choice=yuen_city]').click();await page.locator('#leave').click();
 assert(await page.locator('#whisper').isHidden(),'Fixture must clear the transient lesson');
 await page.reload({waitUntil:'networkidle'});
 assert(await page.locator('#resumeContext').isVisible(),'Returning players must see their saved story context');
 assert(await page.locator('#firstLead').isHidden(),'Returning players must not see the fresh-campaign first step');
 await page.locator('#resume').click();await page.locator('#help').click();
 assert((await page.locator('#panelBody').innerText()).includes('I release you from your promise'),'Learned ritual must remain readable after reload and later conversations');
 for(const viewport of [{width:1440,height:900},{width:390,height:667},{width:844,height:390}]){
  await page.setViewportSize(viewport);
  const rect=await page.locator('#playerPanel').boundingBox();
  assert(rect.x>=0&&rect.y>=0&&rect.x+rect.width<=viewport.width+1&&rect.y+rect.height<=viewport.height+1,'Story panel must fit the viewport');
  await page.locator('#closePanel').click();await page.locator('#help').click();
 }
 await page.locator('#closePanel').click();
 await page.locator('#locations [data-place=hotel]').click();await page.locator('[data-person=daniel]').click();
 assert(await page.locator('[data-choice=daniel_human]').count()===0,'A personal question must wait until Daniel discusses his shift');
 await page.locator('[data-choice=daniel_shift]').click();
 assert(await page.locator('[data-choice=daniel_human]').count()===1,'Daniel’s shift opens a natural personal follow-up');
 await page.locator('#leave').click();await page.locator('[data-person=vincent]').click();
 assert(await page.locator('[data-choice=vincent_false]').count()===0,'An invitation cannot be accepted before it is offered');
 await page.locator('[data-choice=vincent_private]').click();
 assert(await page.locator('[data-choice=vincent_false]').count()===1,'Vincent’s actual invitation opens its reply');
 await page.locator('#leave').click();
 assert(errors.length===0,'No JavaScript errors: '+errors.join('; '));
 return{passed:true,persistentRules:true,deadline:true,roles:true,firstIntroductions:true,conversationProgression:true,actionCosts:true,helpDoesNotAdvanceTime:true,pageErrors:errors};
}
