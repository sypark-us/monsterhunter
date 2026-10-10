/* Presentation-only upgrade. The existing story and curse engine remain authoritative. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const Story=window.HundredCampaign,Engine=window.HundredEngine,Visuals=window.HundredVisuals,Staging=window.HundredStaging,Guidance=window.HundredGuidance;
  const SAVE_KEY='the-hundred-story-v3';
  const audio=window.HundredAudio.create();
  let preferences={music:.35,ambience:.18,speed:0};
  try{preferences={...preferences,...JSON.parse(localStorage.getItem('hundred-settings')||'{}')}}catch{}
  audio.setVolumes(preferences.music,preferences.ambience);
  let typing=null,lastLine='';
  function showLine(text){
    if(text===lastLine)return;lastLine=text;clearInterval(typing);
    if(!preferences.speed){$('line').textContent=text;return}
    let index=0;$('line').textContent='';typing=setInterval(()=>{
      index++;$('line').textContent=text.slice(0,index);if(index>=text.length)clearInterval(typing);
    },1000/preferences.speed);
  }
  let explorationPanelHeight=125;
  function reserveDialogueSpace(){
    document.querySelector('.viewport').style.height='calc(100dvh - '+document.querySelector('header').offsetHeight+'px)';
    const stage=document.querySelector('.stage').getBoundingClientRect();
    const panel=document.querySelector('.dialogue').getBoundingClientRect(),people=$('people');
    const inScene=people.dataset.mode==='scene';
    people.style.bottom=inScene?'0px':Math.ceil(stage.bottom-panel.top+16)+'px';
    if(!people.dataset.place||stage.width<=0||stage.height<=0)return;
    if(inScene)explorationPanelHeight=stage.bottom-panel.top;
    const heading=document.querySelector('.location').getBoundingClientRect();
    const objective=$('objective').getBoundingClientRect();
    const top=Math.max(heading.bottom,inScene?objective.bottom:heading.bottom+35)-stage.top+10;
    const bottom=stage.height-Math.min(explorationPanelHeight,stage.height*.45)-10;
    if(bottom<=top)return;
    const camera=Staging.projection(people.dataset.place,{width:stage.width,height:stage.height,top,bottom});
    const backdrop=$('backdrop');
    Object.assign(backdrop.style,{left:camera.x+'px',top:camera.y+'px',width:camera.width+'px',height:camera.height+'px'});
    backdrop.dataset.sceneScale=String(camera.scale);
    for(const el of people.querySelectorAll('[data-person]')){
      const placement=Staging.actor(people.dataset.place,el.dataset.person),projected=Staging.project(placement,camera);
      el.style.setProperty('--scene-x',projected.x+'px');el.style.setProperty('--scene-top',projected.top+'px');
      el.style.setProperty('--scene-width',projected.width+'px');
    }
  }
  const layoutObserver=new ResizeObserver(reserveDialogueSpace);
  layoutObserver.observe(document.querySelector('.dialogue'));layoutObserver.observe(document.querySelector('header'));
  window.addEventListener('resize',reserveDialogueSpace);
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  if(!Story||!Engine||!Visuals||!Staging||!Guidance){
    $('fatal').classList.remove('hidden');
    $('fatal').textContent='Some game files could not be loaded. Please refresh this page.';
    return;
  }
  let state=Engine.newGame(),saveAvailable=false,currentPlace=null,photoRequest=0;
  const toast=message=>{$('toast').textContent=message;$('toast').classList.remove('hidden')};
  function persist(){
    try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));saveAvailable=true;return true}
    catch{toast('This browser cannot save locally. The current game can still be played.');return false}
  }
  try{
    const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||localStorage.getItem('the-hundred-story-v2')||'null');
    if(saved&&[2,Engine.VERSION].includes(saved.version)){state=Engine.restore(saved);saveAvailable=true}
  }catch{}
  function apply(result){
    if(!result.ok){toast(result.reason||'That action is not available.');return}
    $('toast').classList.add('hidden');state=result.state;audio.cue();persist();render();
  }
  function setPhoto(place,force=false){
    if(currentPlace===place&&!force)return;
    currentPlace=place;
    const token=++photoRequest,sources=Visuals.photoSources(place),backdrop=$('backdrop');
    $('photoStatus').classList.remove('hidden');$('photoMessage').textContent='Loading scene…';
    $('retryPhoto').classList.add('hidden');
    const attempt=index=>{
      if(token!==photoRequest)return;
      if(index>=sources.length){
        $('photoMessage').textContent='The scene photo could not load. Check your connection.';
        $('retryPhoto').classList.remove('hidden');return;
      }
      const image=new Image();
      image.onload=()=>{
        if(token!==photoRequest)return;
        backdrop.src=sources[index];backdrop.style.objectPosition=Visuals.generatedPlaces.includes(place)?'50% 50%':Visuals.photos[place]?.position||'50% 50%';
        backdrop.dataset.place=place;backdrop.dataset.source='photograph';
        $('photoStatus').classList.add('hidden');
      };
      image.onerror=()=>attempt(index+1);
      image.src=sources[index];
    };
    attempt(0);
  }
  function render(){
    const view=Engine.publicState(state),guide=Guidance.describe(state);
    $('chapterLabel').textContent='CHAPTER '+String(view.chapter).padStart(2,'0');
    $('chapterTitle').textContent=view.chapterTitle.toUpperCase();
    $('dayLabel').textContent='DAY '+view.chapter+' · AFTER DARK';
    $('objective').textContent='Next lead: '+guide.next.text;
    audio.setScene(view.place,!!view.dialogue);
    $('clock').textContent=view.time;$('money').textContent='HK$'+view.cash;
    $('deadline').textContent='Until '+view.deadline;
    $('deadline').title=view.remainingMinutes+' minutes remain. Reading does not advance time.';
    $('energy').textContent=view.energy+'/100';$('placeName').textContent=Story.places[view.place].name;
    setPhoto(view.place);
    $('locations').innerHTML=Object.entries(Story.places).filter(([id])=>Story.chapter(state.chapter).people[id]).map(([id,place])=>
      '<button type="button" data-place="'+id+'" aria-label="Go to '+escapeHtml(place.name)+'" class="'+(id===state.place?'active':'')+'" '+(state.outcome?'disabled':'')+'><img src="'+Visuals.photoSources(id)[0]+'" alt=""><span>'+escapeHtml(place.name)+'</span></button>').join('');
    $('locations').querySelectorAll('[data-place]').forEach(button=>{
      button.onclick=()=>apply(Engine.visit(state,button.dataset.place));
      const image=button.querySelector('img');let triedRemote=false;
      image.onerror=()=>{if(!triedRemote){triedRemote=true;image.src=Visuals.scenes[button.dataset.place]||Visuals.photoSources(button.dataset.place)[0]}else image.style.visibility='hidden'};
    });
    $('people').dataset.mode=view.dialogue?'conversation':'scene';
    $('people').dataset.place=view.place;
    $('people').innerHTML=view.characters.map(id=>{
      const p=Story.cast[id],active=view.dialogue?.id===id;
      const placement=Staging.actor(view.place,id),crop=placement.crop;
      const art=view.dialogue?Visuals.portrait(id):(placement.art||Visuals.portrait(id));
      const activity=!view.dialogue&&placement.activity?' — '+placement.activity:'';
      return '<button type="button" class="actor '+(active?'selected':'')+'" data-person="'+id+'" data-pose="'+(!view.dialogue&&placement.art?'activity':'portrait')+'" style="--scene-order:'+placement.depth+';--scene-aspect:'+(crop.width/crop.height)+';--crop-width:'+(1024/crop.width*100)+'%;--crop-height:'+(1536/crop.height*100)+'%;--crop-left:'+(-crop.x/crop.width*100)+'%;--crop-top:'+(-crop.y/crop.height*100)+'%;--scene-depth:0px;--actor-width:23%" '+(view.dialogue&&!active?'hidden ':'')+(state.outcome?'disabled':'')+' aria-label="Talk to '+escapeHtml(p.name+activity)+'"><span class="portrait-crop"><img data-art="individual" src="'+art+'" alt="" draggable="false"></span><span class="name">'+escapeHtml(p.name)+'</span></button>';
    }).join('');
    $('people').querySelectorAll('[data-person]').forEach(button=>{
      button.onclick=()=>apply(Engine.approach(state,button.dataset.person));
      button.querySelector('img').onerror=()=>toast('Character artwork did not decode. Please use a current browser and refresh.');
    });
    $('speaker').textContent=view.dialogue?.speaker||'THE CITY';
    $('speakerRole').textContent=view.dialogue?Story.cast[view.dialogue.id].role:'';
    showLine(view.dialogue?.line||view.sceneText||Story.places[view.place].description);
    $('choiceTitle').textContent=view.dialogue?'HOW DO YOU RESPOND?':'CLICK SOMEONE TO TALK';
    const options=$('options');
    if(view.dialogue){
      options.innerHTML=view.options.map((option,i)=>'<button type="button" data-choice="'+escapeHtml(option.id)+'"><span class="optionNum">'+(i+1)+'</span>'+escapeHtml(option.label)+'<span class="action-cost">'+escapeHtml(costLabel(option.cost))+'</span>'+(option.warning?'<span class="sub">'+escapeHtml(option.warning)+'</span>':'')+'</button>').join('')+(view.options.length?'':'<p class="muted">Nothing more to ask for now. Conversations elsewhere may open new replies here.</p>')+'<button type="button" id="leave"><span class="optionNum">←</span>End conversation <span class="action-cost">No time cost</span></button>';
      options.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>apply(Engine.choose(state,button.dataset.choice)));
      $('leave').onclick=()=>apply(Engine.leave(state));
    }else{
      options.innerHTML='<p class="muted">Click a person to speak. New information can open replies with people you have already met.</p>'+(state.place==='apartment'?'<button type="button" id="rest">Rest for 65 minutes (+'+Math.min(32,100-state.energy)+' energy)</button>':'');
      if($('rest'))$('rest').onclick=()=>apply(Engine.sleep(state));
    }
    $('whisper').textContent=view.whisper||'';$('whisper').classList.toggle('hidden',!view.whisper);
    renderEnding();
    reserveDialogueSpace();
  }
  function renderEnding(){
    const panel=$('ending');panel.classList.toggle('hidden',!state.outcome);
    if(!state.outcome)return;
    const victory=state.outcome==='victory',final=state.outcome?.startsWith('ending:');
    const ending=final?Story.endings[state.outcome.slice(7)]:null;
    const title=ending?.title||(victory?(state.chapter===5?'THE CONTEST IS BROKEN':'CHAPTER COMPLETE'):'YOUR LIFE IS LOST');
    panel.innerHTML='<span class="build">'+(final?'CAMPAIGN COMPLETE':victory?'CHAPTER '+state.chapter+' COMPLETE':'GAME OVER')+'</span><h2>'+escapeHtml(title)+'</h2><p>'+escapeHtml(ending?.text||state.sceneText)+'</p>'+
      (victory?'<p class="small">'+escapeHtml(state.cash>=state.rentDue?'Tomorrow’s rent is covered.':'Tomorrow’s rent is not covered. Continuing will strain your human life.')+'</p><p class="small">Choose how the absorbed power changes you.</p><div class="upgrade">'+Object.keys(state.stats).map(key=>'<button type="button" data-stat="'+key+'" '+(state.points<=0?'disabled':'')+'>'+escapeHtml(key.toUpperCase())+' '+state.stats[key]+' → '+(state.stats[key]+1)+'</button>').join('')+'</div><p class="small">Available points: '+state.points+'</p>'+ (state.chapter<5?'<button type="button" id="continueChapter">Continue to '+escapeHtml(Story.chapter(state.chapter+1).title)+'</button>':'<div class="final-choices">'+Object.entries(Story.endings).map(([id,e])=>'<button type="button" data-ending="'+id+'" '+(!Engine.finish(state,id).ok?'disabled':'')+'>'+escapeHtml(e.title)+'</button>').join('')+'</div>'):'')+
      '<button type="button" id="playAgain">Start a new campaign</button>';
    panel.querySelectorAll('[data-stat]').forEach(button=>button.onclick=()=>apply(Engine.spend(state,button.dataset.stat)));
    if($('continueChapter'))$('continueChapter').onclick=()=>apply(Engine.nextChapter(state));
    panel.querySelectorAll('[data-ending]').forEach(button=>button.onclick=()=>apply(Engine.finish(state,button.dataset.ending)));
    $('playAgain').onclick=()=>{state=Engine.newGame();persist();render()};
  }
  function openPanel(title,body){$('panelTitle').textContent=title;$('panelBody').innerHTML=body;$('playerPanel').showModal()}
  function costLabel(cost){
    const parts=[cost.minutes+' min'];
    if(cost.cash)parts.push((cost.cash>0?'+':'−')+'HK$'+Math.abs(cost.cash));
    if(cost.energy)parts.push((cost.energy>0?'+':'−')+Math.abs(cost.energy)+' energy');
    return parts.join(' · ');
  }
  function storyHelp(){
    const guide=Guidance.describe(state),view=Engine.publicState(state);
    const time=Math.floor(view.remainingMinutes/60)+'h '+view.remainingMinutes%60+'m';
    openPanel('Story & Help',`
      <p class="story-chapter">Chapter ${view.chapter} · ${escapeHtml(view.chapterTitle)}</p>
      <p>${escapeHtml(guide.goal)}</p>
      <section class="story-lead"><h3>A useful next conversation</h3><p>${escapeHtml(guide.next.text)}</p><p>${escapeHtml(guide.next.reason)}</p></section>
      <h3>This chapter</h3><p>${escapeHtml(guide.opening)}</p>
      <details class="story-controls"><summary>Your situation</summary><p>${escapeHtml(guide.premise)}</p></details>
      <h3>What your voice remembers</h3><ul class="story-rules">${guide.rules.map(rule=>'<li>'+escapeHtml(rule)+'</li>').join('')}</ul>
      <h3>Time and your ordinary life</h3>
      <p>${time} remains until ${view.deadline}. The clock waits while you read, look around, or open this panel. Talking to someone and ending a conversation are free. Choosing a reply normally takes 8 minutes and 2 energy; each reply shows its exact cost. Travel takes 15 minutes and 1 energy.</p>
      <p>Rest at the apartment or buy food at Keira’s Tea Stall to recover energy. Work at her stall for money. HK$120 rent is collected between chapters; falling short strains your connection to ordinary life.</p>
      <p>What you hear can open new replies with people you have already met. History lets you reread their exact words. A new option means you can say something new; it does not prove someone is dangerous.</p>
      <details class="story-controls"><summary>Controls and abilities</summary><p>Choose a location, then click a person in the scene. Choose a reply or press its number. End conversation or press Escape to return to the location. Click dialogue text to reveal it immediately.</p><p>After completing a chapter, spend your demon point: Sense notices warnings and hidden sounds; Intelligence reveals contradictions and clauses; Charisma opens persuasive approaches; Dominion enables forceful supernatural choices. Relationships can unlock different conversations too.</p></details>`);
  }
  function saveMenu(){
    openPanel('Save & Resume','<p>Autosave follows your current story. Keep a separate slot before a difficult choice.</p>'+[1,2,3].map(slot=>{
      let saved;try{saved=JSON.parse(localStorage.getItem('hundred-slot-'+slot)||'null')}catch{}
      const label=saved?'Chapter '+saved.chapter+' · '+(Story.places[saved.place]?.name||'Unknown location'):'Empty';
      return '<div class="save-slot"><strong>Slot '+slot+'</strong><span>'+escapeHtml(label)+'</span><button type="button" data-save-slot="'+slot+'">Save here</button><button type="button" data-load-slot="'+slot+'" '+(!saved?'disabled':'')+'>Resume</button></div>';
    }).join(''));
    $('panelBody').querySelectorAll('[data-save-slot]').forEach(button=>button.onclick=()=>{
      const key='hundred-slot-'+button.dataset.saveSlot;
      try{if(localStorage.getItem(key)&&!confirm('Replace this saved story?'))return;localStorage.setItem(key,JSON.stringify(state));$('playerPanel').close();toast('Saved in slot '+button.dataset.saveSlot)}catch{toast('This browser could not save the slot.')}
    });
    $('panelBody').querySelectorAll('[data-load-slot]').forEach(button=>button.onclick=()=>{
      try{const saved=JSON.parse(localStorage.getItem('hundred-slot-'+button.dataset.loadSlot));if(!saved)return;if(!confirm('Resume this slot and replace the current autosave?'))return;state=Engine.restore(saved);persist();$('playerPanel').close();$('intro').close();$('intro').classList.add('hidden');render()}catch{toast('That saved story could not be read.')}
    });
  }
  $('closePanel').onclick=()=>$('playerPanel').close();
  $('history').onclick=()=>openPanel('Conversation History',state.history.length?state.history.map(entry=>'<article class="history-entry"><h3>'+escapeHtml(entry.person)+' <small>Chapter '+entry.chapter+'</small></h3><p class="history-question">'+escapeHtml(entry.ask)+'</p><p>'+escapeHtml(entry.answer)+'</p></article>').join(''):'<p>Your conversations will appear here as you play.</p>');
  $('progress').onclick=()=>openPanel('Your Life','<p>Chapter '+state.chapter+' · '+escapeHtml(Story.chapter(state.chapter).title)+'</p><p>Human connection: '+state.humanity+' / 10 · Rent paid: '+state.rentPaid+' nights</p><h3>Abilities</h3><p>'+Object.entries(state.stats).map(([id,value])=>escapeHtml(id)+': '+value).join(' · ')+'</p><h3>Relationships</h3>'+Object.entries(state.relationships).map(([id,value])=>'<p>'+escapeHtml(Story.cast[id].name)+' · '+['Unfamiliar','Acquainted','Trusted','Close','Steadfast','Deeply connected'][value]+'</p>').join('')+'<p>Abilities unlock different approaches. Relationships carry into later chapters.</p>');
  $('settings').onclick=()=>{
    openPanel('Settings','<label>Music volume <input id="musicVolume" type="range" min="0" max="1" step="0.05" value="'+preferences.music+'"></label><label>Rain ambience <input id="ambienceVolume" type="range" min="0" max="1" step="0.05" value="'+preferences.ambience+'"></label><label>Text speed <select id="textSpeed"><option value="0">Instant</option><option value="25">Slow</option><option value="45">Standard</option><option value="75">Fast</option></select></label><p>Click the dialogue text to reveal the complete line. Audio starts when you turn music on.</p>');
    $('textSpeed').value=preferences.speed;
    for(const id of ['musicVolume','ambienceVolume','textSpeed'])$(id).oninput=()=>{preferences={music:Number($('musicVolume').value),ambience:Number($('ambienceVolume').value),speed:Number($('textSpeed').value)};audio.setVolumes(preferences.music,preferences.ambience);try{localStorage.setItem('hundred-settings',JSON.stringify(preferences))}catch{}};
  };
  $('line').onclick=()=>{clearInterval(typing);$('line').textContent=lastLine};
  $('line').onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();$('line').click()}};
  $('intro').oncancel=event=>event.preventDefault();
  async function toggleSound(){try{$('audio').textContent=(await audio.toggle())?'♫ On':'♫ Off'}catch{toast('Audio could not start in this browser.')}}
  $('begin').onclick=()=>{state=Engine.newGame();persist();$('intro').close();$('intro').classList.add('hidden');render()};
  $('resume').onclick=()=>{$('intro').close();$('intro').classList.add('hidden');render()};
  $('save').onclick=()=>{persist();saveMenu()};
  $('restart').onclick=()=>{if(window.confirm('Start a new chapter and replace the current save?')){state=Engine.newGame();persist();render()}};
  $('help').onclick=storyHelp;
  $('audio').onclick=toggleSound;$('retryPhoto').onclick=()=>setPhoto(state.place,true);
  $('toast').onclick=()=>$('toast').classList.add('hidden');
  window.addEventListener('keydown',event=>{
    if($('intro').open||$('playerPanel').open||event.target.closest('input,select,textarea')||state.outcome||event.ctrlKey||event.altKey||event.metaKey)return;
    if(event.key==='Escape'&&state.dialogue){apply(Engine.leave(state));return}
    const n=Number(event.key);
    if(Number.isInteger(n)&&n>=1&&n<=9&&state.dialogue){const option=Engine.options(state)[n-1];if(option)apply(Engine.choose(state,option.id))}
  });
  if(saveAvailable){
    const guide=Guidance.describe(state),view=Engine.publicState(state);
    $('resume').classList.remove('hidden');$('resumeContext').classList.remove('hidden');
    $('firstLead').hidden=true;$('introStakes').hidden=true;
    $('begin').textContent='Start a New Campaign';
    $('resumeContext').innerHTML='<h3>Your saved story · Chapter '+view.chapter+'</h3><p>'+escapeHtml(view.chapterTitle)+' · '+view.time+' / '+view.deadline+'</p><p>'+escapeHtml(guide.next.text)+'</p><p class="intro-hint">Resume to keep your progress. Story &amp; Help contains this chapter’s context and the rules you have learned.</p>';
  }
  // Decode an individual sprite before declaring the artwork ready.
  const proof=new Image();proof.src=Visuals.portrait('ada');
  proof.onload=()=>{document.body.dataset.paintedCast=proof.naturalWidth+'x'+proof.naturalHeight;document.body.dataset.build='0.4.3'};
  proof.onerror=()=>{document.body.dataset.paintedCast='error';toast('The character artwork could not be decoded.')};
  render();
  $('intro').showModal();
})();
