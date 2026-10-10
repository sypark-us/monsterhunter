/* Re-readable orientation from public conversations; never a list of suspects. */
(function(root,factory){
 const story=typeof module==='object'&&module.exports?require('./campaign.js'):root.HundredCampaign;
 const api=factory(story);if(typeof module==='object'&&module.exports)module.exports=api;root.HundredGuidance=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Story){
 'use strict';
 const goals=[
  'Understand the voice inside you and survive your first night without taking an innocent life.',
  'Find out what the relief fund is asking of the people it helped, and how to free them from that claim.',
  'Find out why Henry has not returned from the ferry and help the waiting passengers get home.',
  'Understand why people are losing their memories and whether the archivist can be persuaded to return them.',
  'Understand the promise behind the contest, then decide what future you want for yourself and the other hosts.'
 ];
 const lead=(text,reason)=>({text,reason});
 function firstVow(s,has){
  if(!has('oathTeaching'))return lead('Ask Mr. Yuen at Tin Hau Shrine about spirits and promises.','The shrine caretaker knows the old stories. Your voice does not yet understand its power.');
  if(!s.powerKnown)return lead('Ask Marcus on Mong Kok Street what a promise means to him.','Yuen has described a freely given vow. Another person’s view may help the voice make sense of it.');
  if(has('renouncedVincent'))return lead('Return to Vincent at Victoria Hotel and consider your response to his withdrawal.','You heard him reject his promise. Remember the First Vow rule and the cost of using it on an innocent person.');
  if(!has('heardKeira'))return lead('Ask Keira at her tea stall about tonight’s customers.','She hears the city’s conversations while she works.');
  if(!has('heardDaniel'))return lead('Ask Daniel at Victoria Hotel about the consultant’s hours.','Keira mentioned an argument involving someone from the hotel. Daniel works at its front desk.');
  if(!has('vincentPrivacy'))return lead('Talk with Vincent at Victoria Hotel about guests and their names.','You have heard other accounts of the hotel. Vincent can give his own.');
  if(!has('boundVincent'))return lead('Ask Vincent at Victoria Hotel about meeting you in public.','He has spoken about privacy. You can ask him what he is willing to commit to.');
  if(!has('challengedKeira')||!has('challengedDaniel'))return lead('Discuss Keira’s and Daniel’s accounts with Vincent at Victoria Hotel.','You have heard accounts he has not fully addressed.');
  return lead('Ask Vincent at Victoria Hotel whether he still intends to keep his promise.','You have heard his replies to both accounts, but he has not answered what they mean for his commitment.');
 }
 function borrowedBreath(s,has){
  if(has('c2_released'))return lead('Continue your conversation with Celia at Victoria Hotel.','She has said she has no further claim on the help you offered. Consider what that allows you to say.');
  if(!has('c2_missing'))return has('c2_anita')?
   lead('Ask Mei at the Night Clinic about patients who have stopped coming.','Ada connected your receipt to Anita’s experience with the fund.'):
   lead('Ask Ada at the Old Apartment about the receipt under your door.','She has already seen it. Begin with someone who knows your ordinary life.');
  if(!has('c2_accepted'))return lead('Speak with Celia at Victoria Hotel about the relief fund’s accounts.','People who dealt with the fund have described trouble. Its administrator can explain her side.');
  if((s.stats?.intelligence||1)>=2)return lead('Read Celia’s ledger closely at Victoria Hotel.','Your Intelligence opens a way to question the agreement in her own records.');
  if(!has('c2_paid'))return has('c2_help')?
   lead('Ask Keira at her tea stall whether accepting help creates a debt.','You have helped Mei. Keira has her own experience of caring for someone.'):
   lead('Speak with Mei at the Night Clinic about helping her patients.','You have heard about the missing patients, but there is more to understand about the help they received.');
  if(!has('c2_photo'))return lead('Ask Owen at Temple Street Market about the fund.','The photographer may offer another account of its work.');
  return lead('Return to Celia at Victoria Hotel and discuss when help is finished.','You have heard about the paid bills and another account of the fund. Her claim deserves an answer.');
 }
 function lastCrossing(s,has){
  if(!has('c3_manifest'))return lead('Speak with Grace at the Ferry Pier about Henry.','Iris’s message says Grace is still waiting for her brother.');
  if(!has('c3_passage'))return lead('Speak with Jun at the Ferry Pier about crossing together.','You know Henry has not returned. The dispatcher can explain what she is offering; speaking is different from boarding.');
  if(has('c3_refused'))return lead('Continue speaking with Jun at the Ferry Pier after her withdrawal.','She has rejected the promise to cross together. Consider your response while you are still ashore.');
  if(has('c3_return'))return lead('Discuss with Jun at the Ferry Pier whether to make the crossing.','You have questioned the journey’s return. You can decide whether to go with her.');
  if((s.stats?.sense||1)>=2)return lead('Listen closely to the announcement while speaking with Jun at the Ferry Pier.','Your Sense offers another way to understand what this crossing promises.');
  if(!has('c3_route'))return lead('Ask Marcus on Mong Kok Street about deliveries to the pier.','A courier’s account may help explain what has happened on the route.');
  if(!has('c3_rule'))return lead('Ask Mr. Yuen at Tin Hau Shrine about spirits and crossings.','You have heard troubling accounts of the journey. The caretaker may know how such a passage binds people.');
  return lead('Ask Jun at the Ferry Pier about the return journey.','Compare what the dispatcher offers with the accounts you have heard and Yuen’s teaching.');
 }
 function cityKeeps(s,has){
  if(has('c4_renounced'))return lead('Continue speaking with Sora on Kowloon Rooftop after her withdrawal.','She has rejected the trust she accepted. Consider what you can now say about the memories.');
  if(has('c4_challenged'))return lead('Talk with Sora on Kowloon Rooftop about returning the memories.','You have challenged her claim to keep them. She has not yet said whether she will give them back.');
  if(!has('c4_offer'))return lead('Ask Sora on Kowloon Rooftop what she offers in exchange for memories.','People close to you are forgetting. The archivist has been buying what people can no longer bear to keep.');
  if(!has('c4_witness'))return lead('Ask Mei at the Night Clinic about the missing memories.','She works with people affected by memory loss and may have heard another account.');
  if(has('c4_memory')&&has('c4_negative'))return lead('Discuss with Sora on Kowloon Rooftop what survives outside her archive.','You have heard personal memories and accounts of copies that still exist.');
  if((s.stats?.dominion||1)>=2)return lead('Return to Sora on Kowloon Rooftop and consider your approaches to the archive.','Your Dominion opens a forceful approach. Using it can strain your human connection; you can still hear other accounts.');
  if(!has('c4_memory'))return lead('Speak with Ada at the Old Apartment about how you first met.','She has forgotten why she trusted you. Your shared life may matter to her.');
  return lead('Ask Owen at Temple Street Market about the photographs his family kept.','His mother has been affected too. His photographs may have survived differently from her memories.');
 }
 function hundredthName(s,has){
  if(has('c5_refused'))return lead('Continue your conversation with Iris on Kowloon Rooftop.','You heard her withdraw the promise. Your response will decide what comes next.');
  if(has('c5_hosts'))return lead('Ask Iris on Kowloon Rooftop what can change about the contest.','She has heard your argument about the hosts. The conversation is not finished.');
  if(!has('c5_origin'))return lead('Ask Mr. Yuen at Tin Hau Shrine who made the contest’s rules.','Iris has invited you to the roof. The caretaker’s knowledge may help you understand what is at stake before you answer her.');
  if(!has('c5_names'))return lead('Meet Iris on Kowloon Rooftop and ask about her place in the story.','She asked you to come. You now know how the contest’s promise began.');
  if((s.stats?.intelligence||1)>=3)return lead('Discuss the contest’s own rules with Iris on Kowloon Rooftop.','Your Intelligence opens a way to question whether its promise is consistent.');
  if(!has('c5_home'))return (s.relationships?.ada||0)>=1?
   lead('Ask Ada at the Old Apartment what you can return to after tonight.','You have built trust with her. Your life outside the contest deserves a place in this decision.'):
   lead('Reconnect with Ada at the Old Apartment before discussing your future.','Trust grows through conversation. She is more than someone who lives next door.');
  if(!has('c5_anchor'))return (s.relationships?.keira||0)>=1?
   lead('Talk with Keira at her tea stall about what might happen to you tonight.','You have earned her trust. Hear what she wants for your future.'):
   lead('Reconnect with Keira at her tea stall and ask about her family.','Your relationship can grow before you discuss what tonight means to you.');
  return lead('Return to Iris on Kowloon Rooftop and discuss the lives affected by the contest.','Ada and Keira have spoken about a future with you in it. Bring your own life into the conversation.');
 }
 const chapters=[firstVow,borrowedBreath,lastCrossing,cityKeeps,hundredthName];
 function describe(state){
  const number=state.chapter||1,has=flag=>!!state.flags?.[flag];
  const rules=[
   'Time advances when you travel or choose an action, not while you read.',
   'What you hear can open new replies with people you have already met.',
   'Using a ritual on an innocent person can take your life too. Appearance alone tells you nothing.'
  ];
  if(state.powerKnown)rules.push('Learned in The First Vow: someone must freely make a promise, then freely withdraw it. Only then can you say: “I release you from your promise.” Later encounters may bind people through different agreements.');
  else if(has('oathTeaching'))rules.push('Yuen’s First Vow teaching: a promise must be offered freely. The voice has not yet understood the whole ritual.');
  else rules.push('The voice does not yet understand its power. You can learn through conversations about spirits and promises.');
  if(has('c3_rule'))rules.push('Learned about crossings: a passage promises a return. You can refuse it while your feet are still on the shore.');
  if(has('c5_origin'))rules.push('Learned about the contest: its participants freely made a promise. Its keeper must reject that promise before it can be released.');
  let next=chapters[number-1](state,has);
  if(state.outcome==='victory')next=number<5?
   lead('Continue to the next chapter when you are ready.','This chapter is complete. You can choose an ability upgrade before continuing.'):
   lead('Choose the future you want from the available endings.','Your final conversation is complete. The choices you made determine which resolutions are available.');
  else if(state.outcome?.startsWith('ending:'))next=lead('Your campaign is complete.','You can reread your conversations or start a new story to make different choices.');
  else if(state.outcome)next=lead('Load an earlier save or begin a new story.','This attempt has ended. Reading your past conversations can help you choose a different approach.');
  return {premise:'You are a Hong Kong resident carrying a demon, one of a hundred drawn into a contest. The voice inside you demands survival, but your human life and the people around you still matter.',opening:Story.chapter(number).opening,goal:goals[number-1],next,rules};
 }
 return {describe};
});
