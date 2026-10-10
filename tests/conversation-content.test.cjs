'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Story=require('../src/campaign.js');
const Engine=require('../src/engine.js');

test('strangers introduce themselves without charging for an extra introductory choice',()=>{
 let s=Engine.newGame();s=Engine.visit(s,'hotel').state;
 const before={time:s.time,energy:s.energy},first=Story.conversation(s,'vincent');
 assert.match(first.greeting,/Vincent Lau/);
 s=Engine.approach(s,'vincent').state;
 assert.equal(s.dialogue.line,first.greeting);assert.equal(s.time,before.time);assert.equal(s.energy,before.energy);
 assert.equal(Story.conversation(Engine.leave(s).state,'vincent').greeting,first.greeting,'looking alone does not complete an introduction');
 s=Engine.choose(s,'vincent_work').state;
 assert.notEqual(Story.conversation(s,'vincent').greeting,first.greeting);
 assert.equal(Story.conversation(s,'vincent').greeting,Story.chapter(1).conversations.vincent.greeting);
});

test('later first meetings use introductions while known people and neighbors retain familiarity',()=>{
 for(const [chapter,id,name]of [[2,'mei','Mei Wong'],[2,'owen','Owen Chan'],[3,'jun','Jun Mak'],[4,'sora','Sora Lam'],[4,'nora','Nora Wong']]){
  const fresh=Story.conversation({chapter},id);
  assert.match(fresh.greeting,new RegExp(name));
  assert.notEqual(fresh.greeting,Story.conversation({chapter,spokeTo:[id]},id).greeting);
  assert.doesNotMatch(fresh.greeting,/I am (?:a demon|possessed)|I’m (?:a demon|possessed)|keeper of the contest/i);
 }
 assert.equal(Story.conversation({chapter:1},'ada').greeting,Story.chapter(1).conversations.ada.greeting);
 assert.equal(Story.conversation({chapter:2},'fong').greeting,Story.chapter(2).conversations.fong.greeting);
 assert.ok(Story.conversation({chapter:3},'unknown').greeting);
 assert.ok(Story.conversation({chapter:2},'marcus').topics.length);
});

test('first-meeting wording does not presume offers, photographs, earlier actions or conversations',()=>{
 const topic=(chapter,id,key)=>Story.chapter(chapter).conversations[id].topics.find(t=>t.id===key);
 assert.doesNotMatch(topic(1,'vincent','vincent_private').ask,/What did you want to discuss upstairs/);
 assert.match(topic(1,'vincent','vincent_private').answer,/upstairs/);
 assert.doesNotMatch(topic(1,'vincent','vincent_daniel').answer,/I told you/);
 assert.doesNotMatch(Story.chapter(2).conversations.keira.greeting,/you’ve been helping/);
 assert.match(topic(2,'celia','celia_offer').answer,/blank.*acknowledg/i);
 assert.doesNotMatch(topic(3,'jun','jun_manifest').ask,/tomorrow/);
 assert.match(topic(3,'jun','jun_manifest').answer,/tomorrow/);
 assert.doesNotMatch(Story.chapter(3).conversations.keira.greeting,/Iris called ahead|whole ferry coming/);
 assert.doesNotMatch(topic(3,'jun','jun_return').answer,/what Yuen told you/);
 assert.doesNotMatch(topic(4,'sora','sora_challenge').answer,/Ada’s story|Mei’s witness/);
 assert.doesNotMatch(topic(5,'iris','iris_names').ask,/waiting at the shrine/);
 assert.doesNotMatch(topic(5,'iris','iris_throne').ask,/voice’s offer/);
 assert.doesNotMatch(Story.chapter(5).conversations.mei.greeting,/put your name/);
});

test('supporting people introduce the subject before the player asks a specific follow-up',()=>{
 const account=(chapter,id)=>Story.chapter(chapter).conversations[id].topics[0].ask;
 assert.doesNotMatch(account(2,'eunice'),/bills were paid/);
 assert.doesNotMatch(account(3,'cheng'),/she told Iris/);
 assert.doesNotMatch(account(3,'grace'),/until Iris returns/);
 assert.doesNotMatch(account(2,'patrick'),/release clause/);
 assert.doesNotMatch(account(4,'nora'),/recorded Lily/);
 assert.doesNotMatch(account(2,'kit'),/Tell her where/);
 assert.doesNotMatch(account(3,'aaron'),/at the pier/);
});

test('Patrick’s account does not make the player assume Owen has described his photographs',()=>{
 let s={...Engine.newGame(),chapter:2};
 s=Engine.visit(s,'rooftop').state;s=Engine.approach(s,'patrick').state;
 s=Engine.choose(s,'patrick_account').state;assert.equal(s.flags.c2_photo,true);
 s=Engine.visit(s,'market').state;s=Engine.approach(s,'owen').state;
 assert.ok(!Engine.options(s).some(option=>option.id==='owen_negative'));
 s=Engine.choose(s,'owen_photo').state;
 assert.ok(Engine.options(s).some(option=>option.id==='owen_negative'));
});

test('personal questions follow the opening exchange and remain available after restore',()=>{
 for(const [place,id,opening,followup]of [['hotel','daniel','daniel_shift','daniel_human'],['street','iris','iris_friend','iris_voices']]){
  let s=Engine.visit(Engine.newGame(),place).state;s=Engine.approach(s,id).state;
  assert.ok(!Engine.options(s).some(option=>option.id===followup),id+' has not opened the personal subject');
  const blocked=Engine.choose(s,followup);assert.equal(blocked.ok,false);assert.deepEqual(blocked.state,s);
  const response=Engine.choose(s,opening);assert.equal(response.ok,true);s=response.state;
  s=Engine.restore(JSON.parse(JSON.stringify(s)));
  assert.ok(Engine.options(s).some(option=>option.id===followup),id+' has opened the subject');
  assert.equal(Engine.choose(s,followup).ok,true);
 }
});
