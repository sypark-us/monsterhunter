/* THE HUNDRED — deterministic conversation-combat engine.
 * No evidence notebook, suspect scores, clue markers, or investigation actions.
 * NPCs have ordinary public identities. Only the rules engine can determine
 * whether an intended victim is possessed.
 */
(function(root,factory){
 const story=(typeof module==="object"&&module.exports)?require("./story.js"):root.HundredStory;
 const engine=factory(story);
 if(typeof module==="object"&&module.exports)module.exports=engine;
 root.HundredEngine=engine;
})(typeof globalThis!=="undefined"?globalThis:this,function(Story){
 "use strict";
 const VERSION=2,DAWN=1560,START=1080,RENT=120;
 const HIDDEN_POSSESSION=Object.freeze({vincent:true,ada:false,keira:false,marcus:false,iris:false,daniel:false,yuen:false});
 const HUMAN_COST=Object.freeze({time:8,energy:2});
 function newGame(){
  return {version:VERSION,place:"apartment",time:START,cash:55,energy:74,rentDue:RENT,
    flags:{},visited:["apartment"],spokeTo:[],interactions:0,powerKnown:false,
    whisper:"",dialogue:null,sceneText:"",outcome:null,points:0,
    stats:{sense:1,intelligence:1,charisma:1,dominion:1},lastTarget:null};
 }
 const copy=s=>JSON.parse(JSON.stringify(s));
 const has=(s,flag)=>!!s.flags[flag];
 const t=(key,lang="en")=>Story.text(key,lang);
 const timestamp=s=>String(Math.floor(s.time/60)%24).padStart(2,"0")+":"+String(s.time%60).padStart(2,"0");
 function isValidPlace(place){return !!Story.places[place]}
 function isHere(s,id){return !!Story.places[s.place]?.people.includes(id)}
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
  next.dialogue={id,line:Story.conversations[id].greeting,speaker:Story.cast[id].name,replyId:null};
  next.sceneText="";
  return{ok:true,state:next};
 }
 function leave(s){const next=copy(s);next.dialogue=null;next.sceneText="";return{ok:true,state:next}}
 function topicVisible(s,topic){
  if(topic.requires&&!topic.requires.every(k=>has(s,k)))return false;
  if(topic.once!==false&&!topic.repeatable&&has(s,"used:"+topic.id))return false;
  if(topic.effect==="castVincent"&&!canCast(s,"vincent"))return false;
  if(topic.effect==="castKeira"&&!canCast(s,"keira"))return false;
  return true;
 }
 function options(s){
  if(!s.dialogue||s.outcome)return[];
  return Story.conversations[s.dialogue.id].topics.filter(topic=>topicVisible(s,topic))
    .map(topic=>({id:topic.id,label:topic.ask,warning:warning(s,topic)}));
 }
 function warning(s,topic){
  // Initial sense is deliberately unreliable and does not reveal identity.
  if(s.stats.sense<2)return null;
  if(topic.effect==="falseName")return "Your demon recoils from the request for another name.";
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
  s.sceneText=t("victory");s.dialogue=null;
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
  const id=next.dialogue.id,topic=Story.conversations[id].topics.find(x=>x.id===optionId);
  if(!topic||!topicVisible(next,topic))return{ok:false,state:next,reason:"not-available"};
  const monetary=topic.effect==="meal"?-20:topic.effect==="work"?120:0;
  const energy=topic.effect==="meal"?25:topic.effect==="work"?-23:topic.effect==="rest"?30:-HUMAN_COST.energy;
  if(!canPay(next,monetary,energy))
   return{ok:false,state:next,reason:next.cash+monetary<0?t("noMoney"):t("noEnergy")};
  next.interactions++;next.cash+=monetary;next.energy=Math.min(100,next.energy+energy);
  next.time+=topic.effect==="work"?85:topic.effect==="rest"?60:HUMAN_COST.time;
  next.flags["used:"+topic.id]=true;
  if(!next.spokeTo.includes(id))next.spokeTo.push(id);
  next.sceneText="";
  next.whisper="";next.dialogue={id,line:topic.answer,speaker:Story.cast[id].name,replyId:topic.id};
  switch(topic.effect){
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
    case "falseName":lose(next,"rival",id);break;
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
 function restore(saved){
  if(!saved || saved.version!==VERSION)return newGame();
  try{
   const s=copy(saved);
   if(!isValidPlace(s.place)||!Number.isFinite(s.time)||!Number.isFinite(s.cash)||
      !Number.isFinite(s.energy)||!s.flags||!Array.isArray(s.spokeTo))return newGame();
   return s;
  }catch{return newGame()}
 }
 function publicState(s){
  // The frontend only needs these names; no hidden demon truth is exported.
  return {place:s.place,time:timestamp(s),cash:s.cash,energy:s.energy,
    characters:Story.places[s.place].people.slice(),dialogue:s.dialogue,
    options:options(s),whisper:s.whisper,sceneText:s.sceneText,
    outcome:s.outcome,points:s.points,stats:{...s.stats},powerKnown:s.powerKnown};
 }
 return{VERSION,START,DAWN,newGame,restore,t,timestamp,visit,approach,leave,
   choose,options,sleep,spend,publicState};
});
