'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Engine=require('../src/engine.js');
const Campaign=require('../src/campaign.js');
const {first,routes}=require('../scripts/campaign-route.cjs');

function act(state,actions){
 for(const id of actions){
  const result=Campaign.places[id]?Engine.visit(state,id):Campaign.cast[id]?Engine.approach(state,id):Engine.choose(state,id);
  assert.equal(result.ok,true,`${id}: ${result.reason}`);
  state=result.state;
 }
 return state;
}

test('choice previews report the exact resource change, including capped recovery',()=>{
 const cases=[
  {path:['ada'],id:'ada_work',cost:{minutes:8,cash:0,energy:-2}},
  {path:['diner','keira'],id:'keira_work',cost:{minutes:85,cash:120,energy:-23}},
  {path:['diner','keira'],id:'keira_meal',cost:{minutes:8,cash:-20,energy:25}},
  {path:['ada'],id:'ada_sleep',cost:{minutes:60,cash:0,energy:26}},
  {path:['ada'],id:'ada_sleep',energy:50,cost:{minutes:60,cash:0,energy:30}},
  {path:['diner','keira'],id:'keira_meal',energy:95,cost:{minutes:8,cash:-20,energy:5}},
  {path:['ada'],id:'ada_sleep',energy:100,cost:{minutes:60,cash:0,energy:0}}
 ];
 for(const sample of cases){
  const state=act(Engine.newGame(),sample.path);
  if(sample.energy!==undefined)state.energy=sample.energy;
  const option=Engine.publicState(state).options.find(option=>option.id===sample.id);
  assert.deepEqual(option.cost,sample.cost,sample.id);
  const result=Engine.choose(state,sample.id);
  assert.equal(result.ok,true,sample.id);
  assert.deepEqual({minutes:result.state.time-state.time,cash:result.state.cash-state.cash,energy:result.state.energy-state.energy},option.cost,sample.id);
 }
});

test('visible choices remain truthful along all five legal chapter routes',()=>{
 let state=Engine.newGame(),checked=0;
 function verifyOptions(){
  const before=JSON.stringify(state);
  for(const option of Engine.publicState(state).options){
   const result=Engine.choose(state,option.id);
   if(!result.ok)continue;
   assert.deepEqual(option.cost,{minutes:result.state.time-state.time,cash:result.state.cash-state.cash,energy:result.state.energy-state.energy},`${state.chapter}: ${option.id}`);
   checked++;
  }
  assert.equal(JSON.stringify(state),before,'cost previews and hypothetical choices must not mutate the current state');
 }
 for(let chapter=1;chapter<=5;chapter++){
  if(chapter>1)state=Engine.nextChapter(state).state;
  for(const action of chapter===1?first:routes[chapter]){
   state=act(state,[action]);
   verifyOptions();
  }
 }
 assert.equal(state.outcome,'victory');
 assert.ok(checked>100,'exercise unlocked choices throughout the campaign');
});

test('the public deadline counts through midnight and never reports negative time',()=>{
 const cases=[
  {time:1080,clock:'18:00',remaining:480},
  {time:1439,clock:'23:59',remaining:121},
  {time:1440,clock:'00:00',remaining:120},
  {time:1559,clock:'01:59',remaining:1},
  {time:1560,clock:'02:00',remaining:0},
  {time:1570,clock:'02:10',remaining:0}
 ];
 for(const sample of cases){
  const state=Engine.publicState({...Engine.newGame(),time:sample.time});
  assert.equal(state.deadline,'02:00');
  assert.equal(state.time,sample.clock);
  assert.equal(state.remainingMinutes,sample.remaining);
 }
 const near=act(Engine.newGame(),['ada']);
 near.time=1552;
 const expired=Engine.choose(near,'ada_work').state;
 assert.equal(expired.outcome,'deadline');
 assert.equal(Engine.publicState(expired).remainingMinutes,0);
});

test('the debt trap explains the signed obligation that killed the host',()=>{
 let state=Engine.nextChapter(act(Engine.newGame(),first)).state;
 state=act(state,['clinic','mei','mei_missing','hotel','celia','celia_offer','celia_blank']);
 assert.equal(state.outcome,'rival');
 assert.equal(state.lastTarget,'celia');
 assert.match(state.sceneText,/sign(?:ed|ature)|acknowledgement/i);
 assert.match(state.sceneText,/breath|debt/i);
 assert.doesNotMatch(state.sceneText,/false name/i);
});

test('the ferry trap explains the irreversible crossing the player accepted',()=>{
 let state=Engine.nextChapter(act(Engine.newGame(),first)).state;
 state=Engine.nextChapter(act(state,routes[2])).state;
 state=act(state,['pier','jun','jun_passage','jun_aboard']);
 assert.equal(state.outcome,'rival');
 assert.equal(state.lastTarget,'jun');
 assert.match(state.sceneText,/boat|pier|gangway/i);
 assert.match(state.sceneText,/return|crossing|shore/i);
 assert.doesNotMatch(state.sceneText,/false name/i);
});
