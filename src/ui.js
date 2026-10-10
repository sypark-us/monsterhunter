/* Presentation-only upgrade. The existing story and curse engine remain authoritative. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const Story=window.HundredStory,Engine=window.HundredEngine,Visuals=window.HundredVisuals;
  const SAVE_KEY='the-hundred-story-v2';
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  if(!Story||!Engine||!Visuals){
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
    const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(saved&&saved.version===Engine.VERSION){state=Engine.restore(saved);saveAvailable=true}
  }catch{}
  function apply(result){
    if(!result.ok){toast(result.reason||'That action is not available.');return}
    $('toast').classList.add('hidden');state=result.state;persist();render();
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
        backdrop.src=sources[index];backdrop.style.objectPosition=Visuals.photos[place].position;
        backdrop.dataset.place=place;backdrop.dataset.source='photograph';
        $('photoStatus').classList.add('hidden');
      };
      image.onerror=()=>attempt(index+1);
      image.src=sources[index];
    };
    attempt(0);
  }
  function render(){
    const view=Engine.publicState(state);
    $('clock').textContent=view.time;$('money').textContent='HK$'+view.cash;
    $('energy').textContent=view.energy+'/100';$('placeName').textContent=Story.places[view.place].name;
    setPhoto(view.place);
    $('locations').innerHTML=Object.entries(Story.places).map(([id,place])=>
      '<button type="button" data-place="'+id+'" aria-label="Go to '+escapeHtml(place.name)+'" class="'+(id===state.place?'active':'')+'" '+(state.outcome?'disabled':'')+'><img src="'+Visuals.photoSources(id)[0]+'" alt=""><span>'+escapeHtml(place.name)+'</span></button>').join('');
    $('locations').querySelectorAll('[data-place]').forEach(button=>{
      button.onclick=()=>apply(Engine.visit(state,button.dataset.place));
      const image=button.querySelector('img');let triedRemote=false;
      image.onerror=()=>{if(!triedRemote){triedRemote=true;image.src=Visuals.scenes[button.dataset.place]}else image.style.visibility='hidden'};
    });
    $('people').innerHTML=view.characters.map(id=>{
      const p=Story.cast[id],f=Visuals.frame(id),active=view.dialogue?.id===id;
      return '<button type="button" class="actor '+(active?'selected':'')+'" data-person="'+id+'" '+(state.outcome?'disabled':'')+' aria-label="Talk to '+escapeHtml(p.name)+'"><span class="portrait-crop"><img data-art="painted" src="'+Visuals.atlas+'" style="left:-'+f.column*100+'%;top:-'+f.row*100+'%" alt="" draggable="false"></span><span class="name">'+escapeHtml(p.name)+'</span></button>';
    }).join('');
    $('people').querySelectorAll('[data-person]').forEach(button=>{
      button.onclick=()=>apply(Engine.approach(state,button.dataset.person));
      button.querySelector('img').onerror=()=>toast('Character artwork did not decode. Please use a current browser and refresh.');
    });
    $('speaker').textContent=view.dialogue?.speaker||'THE CITY';
    $('line').textContent=view.dialogue?.line||view.sceneText||Story.places[view.place].description;
    $('choiceTitle').textContent=view.dialogue?'HOW DO YOU RESPOND?':'CLICK SOMEONE TO TALK';
    const options=$('options');
    if(view.dialogue){
      options.innerHTML=view.options.map((option,i)=>'<button type="button" data-choice="'+escapeHtml(option.id)+'"><span class="optionNum">'+(i+1)+'</span>'+escapeHtml(option.label)+(option.warning?'<span class="sub">'+escapeHtml(option.warning)+'</span>':'')+'</button>').join('')+'<button type="button" id="leave"><span class="optionNum">←</span>End conversation</button>';
      options.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>apply(Engine.choose(state,button.dataset.choice)));
      $('leave').onclick=()=>apply(Engine.leave(state));
    }else{
      options.innerHTML='<p class="muted">Choose anyone in the scene. No one is marked dangerous or safe.</p>'+(state.place==='apartment'?'<button type="button" id="rest">Rest for an hour (+32 energy)</button>':'');
      if($('rest'))$('rest').onclick=()=>apply(Engine.sleep(state));
    }
    $('whisper').textContent=view.whisper||'';$('whisper').classList.toggle('hidden',!view.whisper);
    renderEnding();
  }
  function renderEnding(){
    const panel=$('ending');panel.classList.toggle('hidden',!state.outcome);
    if(!state.outcome)return;
    const victory=state.outcome==='victory';
    panel.innerHTML='<span class="build">'+(victory?'CHAPTER COMPLETE':'GAME OVER')+'</span><h2>'+(victory?'THE FIRST DEMON FALLS':'YOUR HOST IS LOST')+'</h2><p>'+escapeHtml(victory?Story.text('victory'):state.sceneText)+'</p>'+(victory?'<p class="small">'+escapeHtml(state.cash>=state.rentDue?'You can cover tomorrow’s HK$'+state.rentDue+' rent. Your human life remains stable—for now.':'Your demon survived, but you still owe HK$'+state.rentDue+' rent tomorrow.')+'</p><p class="small">'+escapeHtml(Story.text('continueText'))+'</p><div class="upgrade">'+Object.keys(state.stats).map(key=>'<button type="button" data-stat="'+key+'" '+(state.points<=0?'disabled':'')+'>+ '+escapeHtml(key.toUpperCase())+'</button>').join('')+'</div><p class="small">Available points: '+state.points+'</p>':'')+'<button type="button" id="playAgain">Start another run</button>';
    panel.querySelectorAll('[data-stat]').forEach(button=>button.onclick=()=>apply(Engine.spend(state,button.dataset.stat)));
    $('playAgain').onclick=()=>{state=Engine.newGame();persist();render()};
  }
  const audio={on:false,ctx:null,timer:null};
  async function toggleSound(){
    if(audio.on){audio.on=false;clearInterval(audio.timer);audio.timer=null;$('audio').textContent='♫ Off';return}
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio)throw new Error('Unavailable audio');
      audio.ctx=audio.ctx||new Audio();await audio.ctx.resume();audio.on=true;
      let step=0;
      audio.timer=setInterval(()=>{
        if(!audio.on||document.hidden)return;
        const osc=audio.ctx.createOscillator(),gain=audio.ctx.createGain();
        osc.frequency.value=[110,164.81,196,146.83,130.81][step++%5];
        gain.gain.setValueAtTime(.01,audio.ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,audio.ctx.currentTime+1.55);
        osc.connect(gain).connect(audio.ctx.destination);osc.start();osc.stop(audio.ctx.currentTime+1.55);
      },1800);
      $('audio').textContent='♫ On';
    }catch{audio.on=false;toast('Audio could not start in this browser.');}
  }
  $('begin').onclick=()=>{state=Engine.newGame();persist();$('intro').classList.add('hidden');render()};
  $('resume').onclick=()=>{$('intro').classList.add('hidden');render()};
  $('save').onclick=()=>{if(persist())toast('Saved on this device.')};
  $('restart').onclick=()=>{if(window.confirm('Start a new chapter and replace the current save?')){state=Engine.newGame();persist();render()}};
  $('help').onclick=()=>toast('Visit a location and click anyone. Listen and choose your responses. Conversation, time, energy and cash matter. There is no clue inventory.');
  $('audio').onclick=toggleSound;$('retryPhoto').onclick=()=>setPhoto(state.place,true);
  $('toast').onclick=()=>$('toast').classList.add('hidden');
  window.addEventListener('keydown',event=>{
    if(!$('intro').classList.contains('hidden')||state.outcome||event.ctrlKey||event.altKey||event.metaKey)return;
    if(event.key==='Escape'&&state.dialogue){apply(Engine.leave(state));return}
    const n=Number(event.key);
    if(Number.isInteger(n)&&n>=1&&n<=9&&state.dialogue){const option=Engine.options(state)[n-1];if(option)apply(Engine.choose(state,option.id))}
  });
  if(saveAvailable)$('resume').classList.remove('hidden');
  // Real browser smoke tests verify these pixels, not just a mocked canvas.
  const proof=new Image();proof.src=Visuals.atlas;
  proof.onload=()=>{document.body.dataset.paintedCast=proof.naturalWidth+'x'+proof.naturalHeight};
  proof.onerror=()=>{document.body.dataset.paintedCast='error';toast('The painted cast could not be decoded.')};
  render();
})();
