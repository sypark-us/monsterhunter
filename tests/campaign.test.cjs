'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Engine=require('../src/engine.js');
const Campaign=require('../src/campaign.js');
const {first,routes}=require('../scripts/campaign-route.cjs');
function act(s,actions){for(const id of actions){let r=Campaign.places[id]?Engine.visit(s,id):Campaign.cast[id]?Engine.approach(s,id):Engine.choose(s,id);assert.equal(r.ok,true,`${s.chapter}: ${id}: ${r.reason}`);s=r.state;}return s;}
function toFinal(finalChoice='iris_release'){let s=act(Engine.newGame(),first);for(let chapter=2;chapter<=5;chapter++){const r=Engine.nextChapter(s);assert.equal(r.ok,true);const route=routes[chapter].slice();if(chapter===5)route[route.length-1]=finalChoice;s=act(r.state,route);}return s;}
test('campaign has five authored chapters, thirty illustrated characters, nine locations and eighteen supporting people',()=>{assert.equal(Campaign.chapters.length,5);assert.equal(Object.keys(Campaign.cast).length,30);assert.equal(Object.keys(Campaign.places).length,9);assert.equal(Campaign.supportingCast.length,18);for(const ch of Campaign.chapters){assert.ok(ch.title&&ch.opening&&ch.objective);for(const [id,c] of Object.entries(ch.conversations||{})){assert.ok(Campaign.cast[id]);assert.ok(c.greeting&&c.topics.length);}}});
test('chapter transition carries choices and upgrades and charges rent',()=>{let s=act(Engine.newGame(),first);s=Engine.spend(s,'charisma').state;const oldCash=s.cash;const r=Engine.nextChapter(s);assert.equal(r.ok,true);assert.equal(r.state.chapter,2);assert.equal(r.state.stats.charisma,2);assert.equal(r.state.cash,Math.max(0,oldCash-120));assert.ok(r.state.flags.heardKeira);assert.equal(r.state.outcome,null);assert.equal(Engine.nextChapter(r.state).ok,false);});
test('the complete legal campaign route reaches all five chapters without guessing',()=>{const s=toFinal();assert.equal(s.chapter,5);assert.equal(s.outcome,'victory');assert.equal(s.defeated.length,5);assert.ok(s.relationships.keira>=1);assert.ok(s.history.length>30);});
test('three final resolutions are reachable and terminal',()=>{const s=toFinal();for(const ending of ['protect','ascend','sever']){const r=Engine.finish(s,ending);assert.equal(r.ok,true);assert.equal(r.state.outcome,'ending:'+ending);assert.equal(Engine.nextChapter(r.state).ok,false);assert.equal(Engine.finish(r.state,ending).ok,false);}assert.equal(Engine.finish(s,'invented').ok,false);});
test('later chapters retain deadlines and rival conversational traps',()=>{let s=Engine.nextChapter(act(Engine.newGame(),first)).state;s=act(s,['clinic','mei','mei_missing','hotel','celia','celia_offer']);const r=Engine.choose(s,'celia_blank');assert.equal(r.state.outcome,'rival');const near={...s,time:Engine.DAWN-2};assert.equal(Engine.visit(near,'clinic').state.outcome,'deadline');});
test('saved campaign progress restores and malformed progression is rejected',()=>{const s=toFinal();assert.deepEqual(Engine.restore(JSON.parse(JSON.stringify(s))),s);assert.equal(Engine.restore({...s,chapter:99}).chapter,1);assert.equal(Engine.restore({...s,stats:{sense:-10}}).chapter,1);});
test('public conversation options never reveal hidden possession',()=>{let s=Engine.nextChapter(act(Engine.newGame(),first)).state;s=act(s,['hotel','celia']);const publicState=Engine.publicState(s);assert.ok(!JSON.stringify(publicState).includes('possessed'));assert.equal(publicState.chapter,2);assert.ok(publicState.chapterTitle);});
module.exports={first,routes,act,toFinal};

test('relationship trust unlocks later promises and carries across chapter boundaries',()=>{
 let s=toFinal();s={...s,outcome:null,dialogue:null,relationships:{},flags:{}};
 s=act(s,['apartment','ada']);assert.ok(!Engine.options(s).some(o=>o.id==='ada_future'));
 s=act(s,['ada_apology']);assert.ok(Engine.options(s).some(o=>o.id==='ada_future'));
});
test('accepting the throne commits the player to the ascension ending',()=>{
 const s=toFinal('iris_throne');
 assert.equal(Engine.finish(s,'protect').ok,false);assert.equal(Engine.finish(s,'sever').ok,false);assert.equal(Engine.finish(s,'ascend').ok,true);
});
test('malformed saved travel state cannot crash a restored game',()=>{
 const invalid={...Engine.newGame(),visited:null};const restored=Engine.restore(invalid);
 assert.equal(Engine.visit(restored,'street').ok,true);assert.deepEqual(restored.visited,['apartment']);
});
test('eight score arrangements have distinct melodies and playable pitch ranges',()=>{
 const {tracks}=require('../src/audio.js');assert.equal(Object.keys(tracks).length,8);
 assert.equal(new Set(Object.values(tracks).map(t=>t.melody.join(','))).size,8);
 for(const t of Object.values(tracks)){assert.ok(t.bpm>=50&&t.bpm<=100);assert.ok(t.melody.every(n=>Number.isInteger(n)&&n>=0&&n<=127));}
});

test('all eighteen supporting characters have reachable scenes and single-use care rewards',()=>{
 let s=act(Engine.newGame(),first);const starts={};
 for(let chapter=2;chapter<=4;chapter++){s=Engine.nextChapter(s).state;starts[chapter]=s;s=act(s,routes[chapter]);}
 const leads=new Set(['ada','keira','marcus','iris','vincent','daniel','yuen','mei','celia','owen','jun','sora']);let count=0;
 for(let chapter=2;chapter<=4;chapter++)for(const [place,ids]of Object.entries(Campaign.chapter(chapter).people))for(const id of ids){
  if(leads.has(id))continue;count++;
  let scene=act(starts[chapter],[place,id,id+'_account',id+'_care']);
  assert.equal(Engine.choose(scene,id+'_care').ok,false,id+' cannot repeat its care reward');
  assert.ok(scene.relationships[id]>=1,id+' records relationship');
  scene=act(scene,routes[chapter]);assert.equal(scene.outcome,'victory',id+' scene preserves chapter progression');
 }
 assert.equal(count,18);
 assert.ok(Campaign.chapter(4).people.clinic.includes('henry'));assert.ok(!Campaign.chapter(3).people.clinic?.includes('henry'));
});
