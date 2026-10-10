/* THE HUNDRED — deterministic rule engine for the scripted prologue.
 * Story content can be localized independently. Hidden possession is checked
 * only by the rule engine, never by a conversation-choice label.
 */
(function(root,factory){
  "use strict";
  const story=(typeof module==="object"&&module.exports)?require("./story.js"):root.HundredStory;
  const api=factory(story);
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.HundredEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(Story){
  "use strict";
  const STORY_VERSION=1;
  const START=1080,DAWN=1800;
  const T=(key,lang="en")=>Story.text(key,lang);
  const scenes=["apartment","street","market","shrine","hotel","talk","private","ending","lost"];
  const action=(id,scene,labelKey,options={})=>({id,scene,labelKey,minutes:options.minutes||0,
    money:options.money||0,energy:options.energy||0,needs:options.needs||null,
    visit:options.visit||null,once:options.once||false,note:options.note||null,
    effect:options.effect||null,warning:options.warning||null});
  const ACTIONS=[
    action("dream","apartment","action.dream",{minutes:25,energy:-3,once:true,note:"evidence.dream",effect:"dream"}),
    action("rent","apartment","action.rent",{once:true,note:"evidence.rent",effect:"rent"}),
    action("leave","apartment","action.leave",{minutes:20,visit:"street"}),
    action("rest","apartment","action.rest",{minutes:65,energy:35,once:true,effect:"rest"}),
    action("work","street","action.work",{minutes:115,energy:-25,money:170,once:true,effect:"work"}),
    action("market","street","action.market",{minutes:20,visit:"market"}),
    action("shrine","street","action.shrine",{minutes:25,visit:"shrine"}),
    action("hotel","street","action.hotel",{minutes:30,visit:"hotel"}),
    action("home","street","action.home",{minutes:20,visit:"apartment"}),
    action("wait","street","action.wait",{effect:"wait"}),
    action("eat","market","action.eat",{minutes:25,money:-20,energy:28,effect:"eat"}),
    action("witness","market","action.witness",{minutes:35,once:true,note:"evidence.witness",effect:"witness"}),
    action("keiraPromise","market","action.keiraPromise",{minutes:20,once:true,effect:"keiraPromise"}),
    action("keiraBreak","market","action.keiraBreak",{minutes:25,needs:["keiraPromise"],once:true,effect:"keiraBreak"}),
    action("castKeira","market","action.castKeira",{effect:"castKeira",warning:"label.civilianWarning"}),
    action("marketStreet","market","action.street",{minutes:20,visit:"street"}),
    action("ritual","shrine","action.ritual",{minutes:35,once:true,note:"evidence.shrine",effect:"ritual"}),
    action("mural","shrine","action.mural",{minutes:25,once:true,note:"evidence.mural",effect:"mural"}),
    action("shrineStreet","shrine","action.street",{minutes:25,visit:"street"}),
    action("guestbook","hotel","action.guestbook",{minutes:35,money:-20,once:true,note:"evidence.guestbook",effect:"guestbook"}),
    action("vincent","hotel","action.vincent",{minutes:15,visit:"talk",effect:"vincent"}),
    action("private","hotel","action.private",{minutes:15,effect:"private",warning:"label.risk"}),
    action("privateTrue","hotel","action.privateTrue",{minutes:15,visit:"private",effect:"trueName",warning:"label.risk"}),
    action("hotelStreet","hotel","action.street",{minutes:30,visit:"street"}),
    action("alibi","talk","action.alibi",{minutes:20,once:true,note:"evidence.vincentAlibi",effect:"alibi"}),
    action("warning","talk","action.warning",{minutes:15,once:true,note:"evidence.private",effect:"warning"}),
    action("vincentPromise","talk","action.vincentPromise",{minutes:25,once:true,effect:"vincentPromise"}),
    action("press","talk","action.press",{minutes:20,needs:["vincentPromise"],effect:"press"}),
    action("castVincent","talk","action.castVincent",{effect:"castVincent"}),
    action("withdraw","talk","action.withdraw",{minutes:5,visit:"hotel"}),
    action("returnLobby","private","action.returnLobby",{minutes:10,visit:"hotel"})
  ];
  const byId=Object.fromEntries(ACTIONS.map(a=>[a.id,a]));
  const humanNames=Object.keys(Story.characters);
  function startState(){
    return {
      version:STORY_VERSION,chapter:1,scene:"apartment",
      minutes:START,money:45,energy:65,rentDue:120,
      stats:{sense:1,intelligence:1,charisma:1,dominion:1},points:0,
      fragments:[],evidence:[],flags:{},oaths:{
        vincent:{bound:false,renounced:false},keira:{bound:false,renounced:false}
      },
      selectedTarget:null,knownAbility:false,
      eliminated:0,cursedRemaining:100,life:"alive",outcome:null,
      journal:[{key:"scene.prelude",minute:START}],lastAction:null
    };
  }
  function clone(s){return JSON.parse(JSON.stringify(s))}
  function hasEvidence(s,k){return s.evidence.includes(k)}
  function hasFlag(s,k){return s.flags[k]===true}
  function fragment(s,k){if(!s.fragments.includes(k))s.fragments.push(k);s.knownAbility=Story.rules.playerCurse.fragments.every(f=>s.fragments.includes(f))}
  function evidence(s,key){if(!s.evidence.includes(key))s.evidence.push(key)}
  function say(s,key){s.journal.unshift({key,minute:s.minutes});s.journal=s.journal.slice(0,32)}
  function clock(s){const hh=Math.floor(s.minutes/60)%24,mm=s.minutes%60;return String(hh).padStart(2,"0")+":"+String(mm).padStart(2,"0")}
  function disableReason(s,a){
    if(s.outcome||s.scene==="ending"||s.scene==="lost")return "label.noMore";
    if(a.scene!==s.scene)return "label.noMore";
    if(a.once&&hasFlag(s,"done:"+a.id))return "label.noMore";
    if(a.needs&&a.needs.some(f=>!hasFlag(s,f)))return "label.noMore";
    if(s.money+a.money<0)return "event.noMoney";
    if(s.energy+a.energy<0)return "event.noEnergy";
    if(a.id==="castVincent"&&!canCast(s,"vincent").ok)return canCast(s,"vincent").reason;
    if(a.id==="castKeira"&&!canCast(s,"keira").ok)return canCast(s,"keira").reason;
    if(a.id==="press"&&s.oaths.vincent.renounced)return "label.noMore";
    if(a.id==="eat"&&s.energy>=99)return "label.noMore";
    return null;
  }
  function dangerHint(s,a){
    if(a.id==="private"||a.id==="privateTrue"){
      if(s.stats.sense>=2 || hasEvidence(s,"evidence.mural"))
        return "evidence.mural";
      return "label.risk";
    }
    if(a.id==="castKeira"&&(s.stats.sense>=2 || hasEvidence(s,"evidence.keira")))return "label.civilianWarning";
    if(a.id==="press"&&!caseReady(s))return "label.requiresProof";
    return a.warning&&s.stats.sense>=2?a.warning:null;
  }
  function choices(s){return (s.outcome?[]:ACTIONS.filter(a=>a.scene===s.scene)).map(a=>({
    id:a.id,labelKey:a.labelKey,disabled:!!disableReason(s,a),
    reason:disableReason(s,a),warning:dangerHint(s,a),
    minutes:a.minutes,money:a.money,energy:a.energy
  }))}
  function caseReady(s){return hasEvidence(s,"evidence.witness")&&hasEvidence(s,"evidence.guestbook")&&hasEvidence(s,"evidence.vincentAlibi")}
  function canCast(s,targetId){
    if(!humanNames.includes(targetId))return{ok:false,reason:"event.noTarget"};
    if(!s.knownAbility)return{ok:false,reason:"event.noPower"};
    const oath=s.oaths[targetId];
    if(!oath?.bound||!oath.renounced)return{ok:false,reason:"event.noTarget"};
    if(s.scene!==(targetId==="vincent"?"talk":"market"))return{ok:false,reason:"event.noTarget"};
    return {ok:true};
  }
  function ending(s,result,entry){
    s.life=result==="victory"?"alive":"dead";
    s.outcome=result;s.scene=result==="victory"?"ending":"lost";
    if(result==="victory"){
      s.eliminated++;s.cursedRemaining--;s.points+=1;s.flags.rentPaid=s.money>=s.rentDue;
    }
    say(s,entry);s.lastAction=entry;
  }
  function invoke(s,targetId){
    const check=canCast(s,targetId);
    if(!check.ok){say(s,check.reason);return false}
    // A wrong target is lethal: there is no immunity shortcut or free identity scan.
    if(!Story.characters[targetId].possessed){
      ending(s,"civilian_backfire","event.civilianDeath");return true;
    }
    ending(s,"victory","event.win");return true;
  }
  function apply(s,a){
    const next=clone(s),reason=disableReason(next,a);
    if(reason)return {state:next,accepted:false,reason};
    next.money+=a.money;next.energy=Math.max(0,Math.min(100,next.energy+a.energy));
    next.minutes+=a.minutes;next.flags["done:"+a.id]=true;
    if(a.visit)next.scene=a.visit;
    if(a.note)evidence(next,a.note);
    switch(a.effect){
      case "dream":fragment(next,"dream");say(next,"event.dream");break;
      case "rent":say(next,"event.rent");break;
      case "rest":say(next,"event.rest");break;
      case "work":say(next,"event.work");break;
      case "eat":say(next,"event.eat");break;
      case "witness":evidence(next,"evidence.keira");say(next,"event.witness");break;
      case "keiraPromise":next.oaths.keira.bound=true;next.flags.keiraPromise=true;say(next,"event.keiraPromise");break;
      case "keiraBreak":next.oaths.keira.renounced=true;say(next,"event.keiraBreak");break;
      case "ritual":fragment(next,"shrine");say(next,"event.ritual");break;
      case "mural":say(next,"event.mural");break;
      case "guestbook":say(next,"event.guestbook");break;
      case "vincent":say(next,"event.vincent");break;
      case "trueName":say(next,"event.trueName");break;
      case "private":
        // Rival's condition must be validated, not inferred from dialogue alone.
        if(Story.characters.june.possessed &&
          Story.rules.rivalCurse.condition.invitationAccepted&&
          Story.rules.rivalCurse.condition.falseNameGiven&&
          Story.rules.rivalCurse.condition.privateRoomEntered){
          ending(next,"rival_trap","event.rivalTrap");
        }break;
      case "alibi":say(next,"event.alibi");if(caseReady(next))evidence(next,"evidence.contradiction");break;
      case "warning":say(next,"event.warning");break;
      case "vincentPromise":next.oaths.vincent.bound=true;next.flags.vincentPromise=true;say(next,"event.vincentPromise");break;
      case "press":
        if(caseReady(next)){
          next.oaths.vincent.renounced=true;
          evidence(next,"evidence.contradiction");
          say(next,"event.press");
        }else say(next,"event.pressFail");
        break;
      case "castKeira":invoke(next,"keira");break;
      case "castVincent":invoke(next,"vincent");break;
      case "wait":next.minutes=DAWN;break;
    }
    // Natural travel is not itself proof or an action by a rival demon.
    if(next.minutes>=DAWN&&!next.outcome)ending(next,"deadline","event.dawn");
    if(!next.lastAction)next.lastAction=a.effect?"event."+a.effect:null;
    return {state:next,accepted:true,reason:null};
  }
  function perform(s,id){
    const a=byId[id];if(!a||a.scene!==s.scene)return{state:clone(s),accepted:false,reason:"label.noMore"};
    return apply(s,a);
  }
  function spendPoint(s,stat){
    if(s.outcome!=="victory"||s.points<=0||!(stat in s.stats))
      return{state:clone(s),accepted:false,reason:"label.noMore"};
    const n=clone(s);n.stats[stat]++;n.points--;say(n,"event.level");
    return{state:n,accepted:true,reason:null};
  }
  function hydrate(snapshot){
    if(!snapshot||snapshot.version!==STORY_VERSION||!scenes.includes(snapshot.scene))
      return startState();
    try{
      const base=startState();
      // Only import expected fields; don't accept arbitrary extra game state.
      for(const key of Object.keys(base))if(Object.prototype.hasOwnProperty.call(snapshot,key))
        base[key]=clone(snapshot[key]);
      if(!Number.isFinite(base.minutes)||!Number.isFinite(base.money)||!Array.isArray(base.evidence)||!base.oaths?.vincent)
        return startState();
      return base;
    }catch{return startState()}
  }
  return {STORY_VERSION,START,DAWN,T,scenes,ACTIONS,startState,clock,choices,hasFlag,
    hasEvidence,caseReady,canCast,perform,spendPoint,hydrate};
});
