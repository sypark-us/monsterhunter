/* THE HUNDRED — deterministic conversation-combat engine.
 * No evidence notebook, suspect scores, clue markers, or investigation actions.
 * NPCs have ordinary public identities. Only the rules engine can determine
 * whether an intended victim is possessed.
 */
(function(root,factory){
 const story=(typeof module==="object"&&module.exports)?require("./campaign.js"):root.HundredCampaign;
 const engine=factory(story);
 if(typeof module==="object"&&module.exports)module.exports=engine;
 root.HundredEngine=engine;
})(typeof globalThis!=="undefined"?globalThis:this,function(Story){
 "use strict";
 const VERSION=3,DAWN=1560,START=1080,RENT=120;
 const HIDDEN_POSSESSION=Object.freeze({vincent:true,ada:false,keira:false,marcus:false,iris:false,daniel:false,yuen:false});
 const HUMAN_COST=Object.freeze({time:8,energy:2});
 function newGame(){
  return {version:VERSION,chapter:1,relationships:{},history:[],defeated:[],humanity:5,rentPaid:0,place:"apartment",time:START,cash:55,energy:74,rentDue:RENT,
    flags:{},visited:["apartment"],spokeTo:[],interactions:0,powerKnown:false,
    whisper:"",dialogue:null,sceneText:"",outcome:null,points:0,
    stats:{sense:1,intelligence:1,charisma:1,dominion:1},lastTarget:null};
 }
 const copy=s=>JSON.parse(JSON.stringify(s));
 const has=(s,flag)=>!!s.flags[flag];
 const t=(key,lang="en")=>Story.text(key,lang);
 const timestamp=s=>String(Math.floor(s.time/60)%24).padStart(2,"0")+":"+String(s.time%60).padStart(2,"0");
 function isValidPlace(place){return Object.hasOwn(Story.places,place)}
 function isHere(s,id){return !!Story.occupants(s,s.place).includes(id)}
 function canPay(s,cash,energy){return s.cash+cash>=0&&s.energy+energy>=0}
 function expire(s){
  if(s.time>=DAWN && !s.outcome){
   s.outcome="deadline";s.dialogue=null;s.sceneText=t("deadlineDeath");
  }
 }
 function visit(s,place){
  const next=copy(s);
  if(next.outcome||!isValidPlace(place))return{ok:false,state:next,reason:"invalid-location"};
  if(place!==next.place){
   next.place=place;next.dialogue=null;next.sceneText="";
   next.time+=15;next.energy=Math.max(0,next.energy-1);
   if(!next.visited.includes(place))next.visited.push(place);
   expire(next);
  }
  return {ok:true,state:next};
 }
 function approach(s,id){
  const next=copy(s);
  if(next.outcome||!Story.cast[id]||!isHere(next,id))return{ok:false,state:next,reason:"not-here"};
  next.dialogue={id,line:Story.conversation(next,id).greeting,speaker:Story.cast[id].name,replyId:null};
  next.sceneText="";
  return{ok:true,state:next};
 }
 function leave(s){const next=copy(s);next.dialogue=null;next.sceneText="";return{ok:true,state:next}}
 function usedKey(s,id){return "used:"+(s.chapter===1?"":s.chapter+":")+id}
 function topicVisible(s,topic){
  if(topic.requiresTrust&&Object.entries(topic.requiresTrust).some(([id,min])=>(s.relationships[id]||0)<min))return false;
  if(topic.check && s.stats[topic.check.stat]<topic.check.min)return false;
  if(topic.requires&&!topic.requires.every(k=>has(s,k)))return false;
  if(topic.requiresTopics&&!topic.requiresTopics.every(id=>has(s,usedKey(s,id))))return false;
  if(topic.once!==false&&!topic.repeatable&&has(s,usedKey(s,topic.id)))return false;
  if(topic.effect==="castVincent"&&!canCast(s,"vincent"))return false;
  if(topic.effect==="castKeira"&&!canCast(s,"keira"))return false;
  return true;
 }
 function options(s){
  if(!s.dialogue||s.outcome)return[];
  return Story.conversation(s,s.dialogue.id).topics.filter(topic=>topicVisible(s,topic))
    .map(topic=>({id:topic.id,label:topic.ask,warning:warning(s,topic),cost:actionCost(s,topic)}));
 }
 function actionCost(s,topic){
  const cash=topic.effect==="meal"?-20:topic.effect==="work"?120:0;
  const energy=topic.effect==="meal"?25:topic.effect==="work"?-23:topic.effect==="rest"?30:-HUMAN_COST.energy;
  const minutes=topic.effect==="work"?85:topic.effect==="rest"?60:HUMAN_COST.time;
  return {minutes,cash,energy:Math.min(100,s.energy+energy)-s.energy};
 }
 function warning(s,topic){
  // Initial sense is deliberately unreliable and does not reveal identity.
  if(s.stats.sense<2)return null;
  if(topic.effect==="falseName"){
   if(topic.id==="celia_blank")return "Your demon recoils from signing a debt with no stated limit.";
   if(topic.id==="jun_aboard")return "Your demon recoils from a crossing with no promise of return.";
   return "Your demon recoils from the request for another name.";
  }
  if(topic.effect==="castKeira")return "The presence inside her feels ordinary. This may be fatal.";
  if(topic.effect==="press"&&(!has(s,"challengedKeira")||!has(s,"challengedDaniel")))
    return "Your words may not be strong enough to provoke an answer.";
  return null;
 }
 function canCast(s,id){return s.powerKnown && has(s,"bound"+capitalize(id))&&has(s,"renounced"+capitalize(id))}
 function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1)}
 function updateWhisper(s){
  if(!s.powerKnown && has(s,"oathTeaching") && (has(s,"oathEcho")||has(s,"boundKeira")||has(s,"boundVincent"))){
   s.powerKnown=true;s.flags.powerKnown=true;s.whisper=t("whisper3");
  }else if(!s.powerKnown && has(s,"oathTeaching")){
   s.whisper=t("whisper2");
  }else if(!s.powerKnown&&s.interactions>=2&&!has(s,"heardWhisper")){
   s.flags.heardWhisper=true;s.whisper=t("whisper1");
  }
 }
 function win(s,target){
  s.outcome="victory";s.lastTarget=target;s.points+=1;
  s.sceneText=s.chapter===1?t("victory"):Story.chapter(s.chapter).reward;s.dialogue=null;
  if(!s.defeated.includes(target))s.defeated.push(target);
 }
 function lose(s,cause,target){
  s.outcome=cause;s.lastTarget=target;s.dialogue=null;
  s.sceneText=t(cause==="civilian"?"innocentDeath":cause==="rival"?"rivalDeath":"deadlineDeath");
 }
 function cast(s,target){
  if(!canCast(s,target))return false;
  if(HIDDEN_POSSESSION[target])win(s,target);
  else lose(s,"civilian",target);
  return true;
 }
 function choose(s,optionId){
  const next=copy(s);
  if(!next.dialogue||next.outcome)return{ok:false,state:next,reason:"no-conversation"};
  const id=next.dialogue.id,topic=Story.conversation(next,id).topics.find(x=>x.id===optionId);
  if(!topic||!topicVisible(next,topic))return{ok:false,state:next,reason:"not-available"};
  const cost=actionCost(next,topic);
  if(!canPay(next,cost.cash,cost.energy))
   return{ok:false,state:next,reason:next.cash+cost.cash<0?t("noMoney"):t("noEnergy")};
  next.interactions++;next.cash+=cost.cash;next.energy+=cost.energy;
  next.time+=cost.minutes;
  if(next.time>=DAWN){expire(next);return{ok:true,state:next};}
  next.flags[usedKey(next,topic.id)]=true;
  if(!next.spokeTo.includes(id))next.spokeTo.push(id);
  next.sceneText="";
  next.whisper="";next.dialogue={id,line:topic.answer,speaker:Story.cast[id].name,replyId:topic.id};
  for(const flag of topic.set||[])next.flags[flag]=true;
  if(topic.trust)next.relationships[id]=Math.max(0,Math.min(5,(next.relationships[id]||0)+topic.trust));
  if(topic.humanity)next.humanity=Math.max(0,Math.min(10,next.humanity+topic.humanity));
  next.history.push({chapter:next.chapter,person:Story.cast[id].name,ask:topic.ask,answer:topic.answer});
  next.history=next.history.slice(-200);
  switch(topic.effect){
    case "campaignCast":
      if(({2:"celia",3:"jun",4:"sora",5:"iris"})[next.chapter]===topic.target)win(next,topic.target);
      else lose(next,"civilian",topic.target);
      break;
    case "rent":next.sceneText=t("rent");break;
    case "rest":next.sceneText=t("sleep");break;
    case "meal":next.sceneText=t("costMeal");break;
    case "work":next.sceneText=t("costWork");break;
    case "heardKeira":case "heardDaniel":case "boundKeira":case "renouncedKeira":
    case "boundVincent":case "renouncedVincent":case "vincentAlibi":case "vincentPrivacy":
    case "challengedKeira":case "challengedDaniel":case "oathTeaching":case "oathEcho":
    case "family":case "strange":case "privateOffer":case "trueName":case "demonLanguage":
    case "daily":case "rumor":case "warning":
      next.flags[topic.effect]=true;break;
    case "falseName":
      lose(next,"rival",id);
      if(topic.id==="celia_blank")next.sceneText=topic.answer+" Your signature gives the ledger a debt it can never finish collecting. You lose your last breath.";
      else if(topic.id==="jun_aboard")next.sceneText=topic.answer+" You accepted a crossing with no promise of return. The boat carries you beyond the living shore.";
      break;
    case "castKeira":cast(next,"keira");break;
    case "castVincent":cast(next,"vincent");break;
  }
  if(!next.outcome)updateWhisper(next);
  expire(next);
  return{ok:true,state:next};
 }
 function sleep(s){
  const next=copy(s);
  if(next.outcome||next.place!=="apartment")return{ok:false,state:next,reason:"not-home"};
  next.time+=65;next.energy=Math.min(100,next.energy+32);
  next.sceneText=t("sleep");next.dialogue=null;
  expire(next);return{ok:true,state:next};
 }
 function spend(s,stat){
  const next=copy(s);
  if(next.outcome!=="victory"||next.points<=0||!(stat in next.stats))return{ok:false,state:next};
  next.points--;next.stats[stat]++;return{ok:true,state:next};
 }
 function nextChapter(s){
  const next=copy(s);
  if(next.outcome!=="victory"||next.chapter>=Story.chapters.length)return{ok:false,state:next,reason:"chapter-not-complete"};
  if(next.cash>=RENT){next.cash-=RENT;next.rentPaid++}
  else {next.cash=0;next.humanity=Math.max(0,next.humanity-1);next.flags.rentStrain=true}
  next.chapter++;next.time=START;next.energy=80;next.place="apartment";
  next.outcome=null;next.dialogue=null;next.whisper="";next.lastTarget=null;
  next.sceneText=Story.chapter(next.chapter).opening;
  return{ok:true,state:next};
 }
 function finish(s,ending){
  const next=copy(s);
  if(next.chapter!==5||next.outcome!=="victory"||!Object.hasOwn(Story.endings,ending))return{ok:false,state:next};
  if(has(next,"c5_throne")&&ending!=="ascend")return{ok:false,state:next,reason:"You accepted the keeper’s throne."};
  if(ending==="protect"&&(!has(next,"c5_hosts")||next.humanity<2))return{ok:false,state:next,reason:"Your host needs a stronger connection to the living."};
  if(ending==="sever"&&!has(next,"c5_refused"))return{ok:false,state:next,reason:"The keeper must renounce the contest first."};
  next.outcome="ending:"+ending;next.sceneText=Story.endings[ending].text;next.dialogue=null;
  return{ok:true,state:next};
 }
 function restore(saved){
  const fresh=newGame();
  if(!saved||![2,VERSION].includes(saved.version))return fresh;
  try{
   const s={...fresh,...copy(saved),version:VERSION};
   if(!isValidPlace(s.place)||!Number.isInteger(s.chapter)||s.chapter<1||s.chapter>Story.chapters.length||
      !Number.isFinite(s.time)||s.time<START||!Number.isFinite(s.cash)||s.cash<0||
      !Number.isFinite(s.energy)||s.energy<0||s.energy>100||!s.flags||typeof s.flags!=="object"||Array.isArray(s.flags)||
      !Array.isArray(s.visited)||s.visited.some(place=>!isValidPlace(place))||!Array.isArray(s.spokeTo)||!Array.isArray(s.history)||!Array.isArray(s.defeated)||
      !s.relationships||typeof s.relationships!=="object"||Array.isArray(s.relationships)||
      !Number.isFinite(s.humanity)||s.humanity<0||s.humanity>10||
      !Number.isInteger(s.points)||s.points<0||!s.stats||
      Object.keys(fresh.stats).some(key=>!Number.isInteger(s.stats[key])||s.stats[key]<1||s.stats[key]>10))return fresh;
   const outcomes=[null,"victory","civilian","rival","deadline","ending:protect","ending:ascend","ending:sever"];
   if(!outcomes.includes(s.outcome))return fresh;
   if(s.defeated.some(id=>!Story.cast[id])||Object.entries(s.relationships).some(([id,value])=>!Story.cast[id]||!Number.isInteger(value)||value<0||value>5))return fresh;
   if(s.dialogue&&(!Story.cast[s.dialogue.id]||!isHere(s,s.dialogue.id)||typeof s.dialogue.line!=="string"))return fresh;
   if(saved.version===2&&s.outcome==="victory"&&!s.defeated.includes("vincent"))s.defeated.push("vincent");
   return s;
  }catch{return fresh}
 }
 function publicState(s){
  // The frontend only needs these names; no hidden demon truth is exported.
  return {chapter:s.chapter,chapterTitle:Story.chapter(s.chapter).title,objective:Story.chapter(s.chapter).objective,relationships:{...s.relationships},humanity:s.humanity,history:s.history.slice(),place:s.place,time:timestamp(s),deadline:timestamp({time:DAWN}),remainingMinutes:Math.max(0,DAWN-s.time),cash:s.cash,energy:s.energy,
    characters:Story.occupants(s,s.place),dialogue:s.dialogue,
    options:options(s),whisper:s.whisper,sceneText:s.sceneText,
    outcome:s.outcome,points:s.points,stats:{...s.stats},powerKnown:s.powerKnown};
 }
 return{VERSION,START,DAWN,newGame,restore,t,timestamp,visit,approach,leave,
   choose,options,sleep,spend,nextChapter,finish,publicState};
});
