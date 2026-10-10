/* THE HUNDRED — English-first, handcrafted visual novel.
 * All NPCs appear ordinary. Nothing in the UI identifies a possessed human.
 * Dialogue and the resulting choices ARE the mystery; there is no clue ledger.
 */
(function(root,factory){
 const result=factory();
 if(typeof module==="object"&&module.exports)module.exports=result;
 root.HundredStory=result;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const cast={
  ada:{name:"Ada Leung",role:"Your next-door neighbor",appearance:{hair:"#3b252b",coat:"#7085a2",skin:"#e5ae8e",style:2}},
  keira:{name:"Keira Ho",role:"Tea stall owner",appearance:{hair:"#251c26",coat:"#ae566d",skin:"#edbe9e",style:0}},
  marcus:{name:"Marcus Yip",role:"Delivery courier",appearance:{hair:"#2c262c",coat:"#557d82",skin:"#d29c7a",style:3}},
  iris:{name:"Iris Cheng",role:"Night-shift student",appearance:{hair:"#483344",coat:"#8e78aa",skin:"#edc5ac",style:1}},
  vincent:{name:"Vincent Lau",role:"Hotel consultant",appearance:{hair:"#24262d",coat:"#4f667f",skin:"#ddaa8a",style:4}},
  daniel:{name:"Daniel Ko",role:"Front desk clerk",appearance:{hair:"#2d282d",coat:"#8a6a62",skin:"#d7a486",style:3}},
  yuen:{name:"Mr. Yuen",role:"Shrine caretaker",appearance:{hair:"#bcb6ad",coat:"#55675f",skin:"#c18e73",style:4}}
 };
 const places={
  apartment:{name:"Old Apartment",people:["ada"],description:"Your building is quiet except for the rain on the metal awnings. Life continues, even after something entered your body."},
  street:{name:"Mong Kok Street",people:["marcus","iris"],description:"Rain turns the street into a river of neon. Everyone seems to be going somewhere important to them."},
  diner:{name:"Keira's Tea Stall",people:["keira","marcus"],description:"Kettles hiss beneath warm pendant lamps. Conversations overlap and dissolve into the clatter of porcelain."},
  hotel:{name:"Victoria Hotel",people:["vincent","daniel"],description:"The lobby smells of polish and rain-soaked wool. A bell sounds each time someone enters."},
  shrine:{name:"Tin Hau Shrine",people:["yuen","iris"],description:"A small shrine shelters a few visitors from the storm. Red lanterns sway beneath an aging roof."}
 };
 const conversations={
  ada:{
   greeting:"You look exhausted. I heard you walking around at three in the morning. Are you all right?",
   topics:[
    {id:"ada_work",ask:"How is everything in the building?",answer:"The landlord came by again. He says your rent is due tomorrow. I told him you were working late.",effect:"rent"},
    {id:"ada_sleep",ask:"Can you help me get some sleep?",answer:"You can use my spare blanket. Just don't miss your shift again.",effect:"rest",once:false},
    {id:"ada_strange",ask:"Have you had any strange dreams lately?",answer:"My mother says the whole neighborhood is having nightmares. It could just be stress.",effect:"strange"},
    {id:"ada_people",ask:"Do you know anyone at the hotel?",answer:"Only people from work. Everyone looks ordinary until you know them."}
   ]
  },
  keira:{
   greeting:"Coffee? Tea? You look like you've walked all night. Sit for a minute if you want.",
   topics:[
    {id:"keira_daily",ask:"How has your evening been?",answer:"Busy. People come here to avoid the rain and pretend they aren't waiting for someone.",effect:"daily"},
    {id:"keira_guests",ask:"Anyone interesting come through tonight?",answer:"A man from the Victoria Hotel brought someone here. They argued about using a real name. I didn't hear what came next.",effect:"heardKeira"},
    {id:"keira_family",ask:"Why are you working so late?",answer:"My father is ill. If I close early, the bills keep coming anyway. A promise to someone you love can become a burden.",effect:"family"},
    {id:"keira_oath",ask:"Can you promise you'll be here tomorrow?",answer:"All right. I promise to open the stall tomorrow, if you need somewhere to sit.",effect:"boundKeira",requires:["family"]},
    {id:"keira_renounce",ask:"If your father needs you tomorrow, would you cancel our promise?",answer:"Yes. I take it back. I won't be here tomorrow. I need to look after him.",effect:"renouncedKeira",requires:["boundKeira"]},
    {id:"keira_cast",ask:"Tell her: 'I release you from your promise.'",answer:"Your demon reaches for the oath.",effect:"castKeira",requires:["renouncedKeira","powerKnown"]},
    {id:"keira_meal",ask:"Could I get something hot to eat? (HK$20)",answer:"Here you go. Eat before it gets cold.",effect:"meal",repeatable:true},
    {id:"keira_work",ask:"Do you need an extra hand tonight? (+HK$120)",answer:"If you help me close up, I'll pay you in cash.",effect:"work",once:true}
   ]
  },
  marcus:{
   greeting:"Deliveries don't stop just because the streets are flooded. You looking for an address?",
   topics:[
    {id:"marcus_job",ask:"Is there work tonight?",answer:"There always is. But the pay barely keeps up with transport and rent.",effect:"daily"},
    {id:"marcus_people",ask:"Do you ever feel like someone is following you?",answer:"Sure. Half the city's looking over its shoulder lately. Doesn't mean they're criminals.",effect:"strange"},
    {id:"marcus_hotel",ask:"Have you delivered to the Victoria Hotel?",answer:"A few times. Staff always seem nervous when the consultant is around. Could just be a terrible boss.",effect:"rumor"},
    {id:"marcus_oaths",ask:"Would you trust a stranger's promise?",answer:"If a promise meant something, they wouldn't need to keep saying it.",effect:"oathEcho"}
   ]
  },
  iris:{
   greeting:"The rain won't stop. I'm waiting for a friend who said she'd meet me, but her phone's dead.",
   topics:[
    {id:"iris_friend",ask:"Who are you waiting for?",answer:"A friend from university. She's been disappearing for hours at a time. Maybe she just needs space.",effect:"daily"},
    {id:"iris_voices",ask:"Have you heard voices that aren't yours?",answer:"My grandmother used to say some dreams belonged to people who had already died. I never took her seriously.",effect:"strange"},
    {id:"iris_promises",ask:"Do you think people should keep their promises?",answer:"Usually. But if keeping a promise hurts someone, maybe breaking it is the right thing to do.",effect:"oathEcho"},
    {id:"iris_hotel",ask:"Do you know anyone at the hotel?",answer:"Only the front desk clerk. He helped me find my way when I was lost.",effect:"daily"}
   ]
  },
  vincent:{
   greeting:"Good evening. The hotel is nearly full, but there's always room for a conversation.",
   topics:[
    {id:"vincent_work",ask:"What do you do here?",answer:"Consulting. Mostly guest relations. People prefer discretion.",effect:"daily"},
    {id:"vincent_late",ask:"Were you working here late yesterday?",answer:"No. I left at nine fifty-five. Never went upstairs after that.",effect:"vincentAlibi"},
    {id:"vincent_names",ask:"Why are some guests unwilling to use their real names?",answer:"People are entitled to privacy. I don't ask questions that might embarrass them.",effect:"vincentPrivacy"},
    {id:"vincent_private",ask:"What did you want to discuss upstairs?",answer:"Something best kept between us. If you come up, give the receptionist a different name.",effect:"privateOffer"},
    {id:"vincent_false",ask:"Accept the private invitation under a false name.",answer:"Vincent guides you through a locked door. The name you gave him feels suddenly heavy.",effect:"falseName",requires:["privateOffer"]},
    {id:"vincent_true",ask:"Accept the invitation using your real name.",answer:"He hesitates when you refuse to use a false name. 'Never mind,' he says, and leaves the door open.",effect:"trueName",requires:["privateOffer"]},
    {id:"vincent_meeting",ask:"Promise to meet me here, in public, at midnight.",answer:"Very well. I promise to meet you here, in this lobby, at midnight.",effect:"boundVincent",requires:["vincentPrivacy"]},
    {id:"vincent_keira",ask:"Keira mentioned an argument about names.",answer:"She shouldn't listen to private guests. You should be careful about repeating gossip.",effect:"challengedKeira",requires:["heardKeira"]},
    {id:"vincent_daniel",ask:"Daniel says you were here after ten.",answer:"Daniel is mistaken. I told you when I left.",effect:"challengedDaniel",requires:["heardDaniel"]},
    {id:"vincent_press",ask:"If you're lying, do you still intend to honor your promise?",answer:"Enough. I withdraw my promise. I won't meet you at midnight. Stay away from me.",effect:"renouncedVincent",requires:["boundVincent","challengedKeira","challengedDaniel"]},
    {id:"vincent_cast",ask:"Tell him: 'I release you from your promise.'",answer:"A cold syllable escapes your mouth. His smile fractures.",effect:"castVincent",requires:["renouncedVincent","powerKnown"]}
   ]
  },
  daniel:{
   greeting:"Welcome to the Victoria Hotel. Please let me know if I can help.",
   topics:[
    {id:"daniel_shift",ask:"Long shift?",answer:"Long enough. The night manager keeps changing the rota, but someone's always waiting at the desk.",effect:"daily"},
    {id:"daniel_vincent",ask:"Does the consultant often work after hours?",answer:"Mr. Lau? He says he leaves early. But I saw him speaking with someone at ten ten last night.",effect:"heardDaniel"},
    {id:"daniel_private",ask:"Why do guests use different names?",answer:"I don't know. Some of them ask for private rooms but never sign the public book.",effect:"rumor"},
    {id:"daniel_human",ask:"Are you afraid of anyone here?",answer:"I'm afraid of losing my job, if that's what you mean.",effect:"daily"}
   ]
  },
  yuen:{
   greeting:"Shelter from the rain is free. Answers rarely are, although I have nothing to sell.",
   topics:[
    {id:"yuen_city",ask:"Has anything unusual happened around here?",answer:"Only the usual things. People lie, keep secrets, make promises and forget them.",effect:"daily"},
    {id:"yuen_voice",ask:"What if a voice inside someone isn't their own?",answer:"Then perhaps its language is older than theirs. Such voices rarely speak plainly.",effect:"demonLanguage"},
    {id:"yuen_oath",ask:"What do you know about promises and spirits?",answer:"The old stories say a vow must be offered freely. A forced oath is only noise. When the speaker rejects it, something can enter.",effect:"oathTeaching"},
    {id:"yuen_morality",ask:"Could a spirit take an innocent life?",answer:"Power used on the wrong soul consumes the one who carries it. Do not mistake confidence for certainty.",effect:"warning"}
   ]
  }
 };
 const en={
  appName:"THE HUNDRED",subtitle:"HONG KONG · A SUPERNATURAL VISUAL NOVEL",
  chapter:"CHAPTER 01 — THE FIRST VOW",version:"PROLOGUE 0.2",
  begin:"ENTER THE NIGHT",newGame:"New game",save:"Save",sound:"Sound",
  time:"TIME",money:"CASH",energy:"ENERGY",day:"DAY 1",
  scene:"LOCATION",move:"GO TO",back:"Leave conversation",
  speak:"SELECT SOMEONE TO TALK TO",choose:"HOW DO YOU RESPOND?",
  introTitle:"ONE HUNDRED",
  intro1:"One hundred demons have entered one hundred human hosts. The last survivor will ascend.",
  intro2:"The presence inside you remembers almost nothing. You have your own life to maintain, and no way to identify the others by sight.",
  intro3:"Travel between places. Click anyone to speak. What matters is what you say—and what they say back.",
  introButton:"Begin the first night",
  idleHint:"Choose any person. No one is marked as special, dangerous, or safe.",
  idleSpeaker:"THE CITY",
  interior:"Inside your mind",
  whisper1:"A choice... freely given...",
  whisper2:"A promise is a doorway. The one who breaks it turns the key...",
  whisper3:"I remember. A willing promise. A willing refusal. Then speak the release.",
  noMoney:"You don't have enough cash.",
  noEnergy:"You need to rest before doing that.",
  repeated:"You've already pursued that conversation.",
  late:"Dawn approaches. The tournament will not wait for you.",
  deathTitle:"YOUR HOST IS LOST",
  innocentDeath:"She was innocent. The spell kills her—and immediately consumes your host as well.",
  rivalDeath:"The false name locks you inside his curse. By the time you understand, it is too late.",
  deadlineDeath:"The night ends without a rival's death. Your demon consumes the human carrying it.",
  victoryTitle:"THE FIRST DEMON FALLS",
  victory:"Vincent recoils. For one heartbeat, a second face appears beneath his skin. Your demon laughs, and the oath takes him. One of the hundred is gone.",
  continueTitle:"CHAPTER COMPLETE",
  continueText:"The real tournament has only begun. This is the end of the playable prologue.",
  costMeal:"You spend HK$20. Warm food restores your energy.",
  costWork:"You help close the stall, earning HK$120, but the work is exhausting.",
  sleep:"You sleep for an hour. The voice within you grows quieter.",
  rent:"Your rent is due tomorrow. You will need at least HK$120.",
  rumor:"You hear nothing you can verify.",
  ruleNotKnown:"The demon doesn't understand the ritual yet.",
  cannotCast:"You have no completed oath to invoke.",
  upgradeTitle:"ABSORBED DEMON",
  upgrade:"You have earned your first demon point. Sense, Intelligence, Charisma and Dominion will become relevant in later chapters.",
  musicOn:"Music On",musicOff:"Music Off"
 };
 const locale={en};
 function text(key,lang="en"){return locale[lang]?.[key]||en[key]||key}
 return {cast,places,conversations,locale,text};
});
