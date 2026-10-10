'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Engine=require('../src/engine.js');
const Campaign=require('../src/campaign.js');
const {first,routes}=require('../scripts/campaign-route.cjs');

function act(state,actions){
 for(const id of actions){
  const result=Campaign.places[id]?Engine.visit(state,id):Campaign.cast[id]?Engine.approach(state,id):Engine.choose(state,id);
  assert.equal(result.ok,true,`${state.chapter}: ${id}: ${result.reason}`);
  state=result.state;
 }
 return state;
}

test('specific follow-ups wait for the person to introduce their photographs or brother',()=>{
 const chapter2=Engine.nextChapter(act(Engine.newGame(),first)).state;
 let state=act(chapter2,['rooftop','patrick','patrick_account','market','owen']);
 assert.equal(state.flags.c2_photo,true,'the broad fund flag can come from an unrelated account');
 assert.equal(Engine.options(state).some(option=>option.id==='owen_help'),false,'Patrick did not introduce Owen’s photographs');
 state=act(state,['owen_photo']);
 assert.equal(Engine.options(state).some(option=>option.id==='owen_help'),true);
 assert.equal(Engine.choose(state,'owen_help').ok,true);
 state=act(Engine.nextChapter(act(chapter2,routes[2])).state,['street','marcus']);
 assert.equal(Engine.options(state).some(option=>option.id==='marcus_brother'),false);
 state=act(state,['marcus_route']);
 assert.equal(Engine.options(state).some(option=>option.id==='marcus_brother'),true);
 assert.equal(Engine.choose(state,'marcus_brother').ok,true);
});

test('topic prerequisites require every current-chapter exchange, including after restoring an older save',()=>{
 // The real work and meal topics recur across chapters. This temporary authored
 // follow-up isolates the prerequisite contract without changing campaign content.
 const topics=Campaign.chapter(2).conversations.keira.topics;
 const followup={id:'test_keira_followup',ask:'Ask about the meal after work.',answer:'The kitchen is quiet.',requiresTopics:['keira_work','keira_meal']};
 topics.push(followup);
 try{
  let state=act(Engine.newGame(),['diner','keira','keira_meal',...first]);
  state=Engine.restore(JSON.parse(JSON.stringify(Engine.nextChapter(state).state)));
  state=act(state,['diner','keira']);
  assert.equal(state.flags['used:keira_work'],true);
  assert.equal(state.flags['used:keira_meal'],true);
  assert.equal(Engine.options(state).some(option=>option.id===followup.id),false,'prior chapter exchanges do not satisfy this chapter');
  const rejected=Engine.choose(state,followup.id);
  assert.equal(rejected.ok,false);
  assert.deepEqual(rejected.state,state,'a locked choice spends no resources');
  state=act(state,['keira_work']);
  assert.equal(Engine.options(state).some(option=>option.id===followup.id),false,'one of two prerequisites is insufficient');
  state=act(state,['keira_meal']);
  assert.equal(Engine.options(state).some(option=>option.id===followup.id),true);
  assert.equal(Engine.choose(state,followup.id).ok,true);
 }finally{
  topics.splice(topics.indexOf(followup),1);
 }
});

test('Sense warns about the actual signature or crossing while ordinary senses reveal no danger',()=>{
 const completed=act(Engine.newGame(),first);
 const chapter2=Engine.nextChapter(completed).state;
 const awareChapter2=Engine.nextChapter(Engine.spend(completed,'sense').state).state;
 const debt=['clinic','mei','mei_missing','hotel','celia','celia_offer'];
 const crossing=['pier','jun','jun_passage'];
 const cases=[
  {id:'celia_blank',plain:act(chapter2,debt),aware:act(awareChapter2,debt),message:/debt|sign|acknowledgement/i},
  {id:'jun_aboard',plain:act(Engine.nextChapter(act(chapter2,routes[2])).state,crossing),aware:act(Engine.nextChapter(act(awareChapter2,routes[2])).state,crossing),message:/crossing|return|board|shore/i}
 ];
 for(const sample of cases){
  assert.equal(Engine.options(sample.plain).find(option=>option.id===sample.id).warning,null);
  const warning=Engine.options(sample.aware).find(option=>option.id===sample.id).warning;
  assert.match(warning,sample.message);
  assert.doesNotMatch(warning,/another name|possessed|is a demon/i);
 }
});
