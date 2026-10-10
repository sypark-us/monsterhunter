"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const Story=require("../src/story.js");
const Engine=require("../src/engine.js");
const Art=require("../src/art.js");
const fs=require("node:fs");
const path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");

function play(actions){
 let s=Engine.newGame();
 for(const action of actions){
  let result;
  if(Story.places[action])result=Engine.visit(s,action);
  else if(Story.cast[action])result=Engine.approach(s,action);
  else result=Engine.choose(s,action);
  assert.equal(result.ok,true,"Action must be playable: "+action+" ("+result.reason+")");
  s=result.state;
 }
 return s;
}
const discovery=["diner","keira","keira_family","keira_guests","keira_oath",
  "street","marcus","marcus_oaths","shrine","yuen","yuen_oath"];
const confrontation=["hotel","daniel","daniel_vincent","vincent","vincent_names",
 "vincent_meeting","vincent_keira","vincent_daniel","vincent_press"];

test("all approachable characters start without identity indicators",()=>{
 const s=Engine.newGame();
 const p=Engine.publicState(s);
 assert.equal(p.powerKnown,false);
 assert.ok(!("possessed" in Story.cast.vincent));
 assert.ok(!("cursed" in Story.cast.keira));
 assert.ok(!("suspicion" in p));
 assert.ok(!("evidence" in s));
 assert.ok(!("notebook" in s));
 assert.deepEqual(p.characters,["ada"]);
 assert.ok(Story.cast.vincent.role);
});
test("the rule begins fragmented and is learned through conversation",()=>{
 const s=play(discovery);
 assert.equal(s.powerKnown,true);
 assert.match(s.whisper,/promise/i);
 assert.ok(s.spokeTo.includes("yuen"));
 assert.ok(s.spokeTo.includes("marcus"));
 assert.ok(!s.outcome);
});
test("you cannot defeat the rival merely by guessing who is possessed",()=>{
 const s=play(["hotel","vincent","vincent_names","vincent_meeting"]);
 assert.equal(s.powerKnown,false);
 assert.equal(Engine.options(s).some(x=>x.id==="vincent_cast"),false);
});
test("conversations can be replayed as a deterministic chain to victory",()=>{
 const s=play([...discovery,...confrontation,"vincent_cast"]);
 assert.equal(s.outcome,"victory");
 assert.equal(s.points,1);
 assert.equal(s.lastTarget,"vincent");
 assert.ok(s.time<Engine.DAWN);
 const spent=Engine.spend(s,"sense");
 assert.equal(spent.ok,true);
 assert.equal(spent.state.stats.sense,2);
});
test("the false-name conversation trap is deadly",()=>{
 const s=play(["hotel","vincent","vincent_private","vincent_false"]);
 assert.equal(s.outcome,"rival");
 assert.match(s.sceneText,/false name/i);
});
test("killing an innocent human kills your host, even when the ritual succeeds",()=>{
 const s=play([...discovery,"diner","keira","keira_renounce","keira_cast"]);
 assert.equal(s.outcome,"civilian");
 assert.equal(s.lastTarget,"keira");
});
test("ordinary dialogue topics cannot repeatedly provide unlimited resources",()=>{
 const s=play(["diner","keira","keira_work"]);
 assert.equal(s.cash,175);
 assert.equal(Engine.options(s).some(x=>x.id==="keira_work"),false);
 assert.equal(Engine.options(s).some(x=>x.id==="keira_meal"),true);
});
test("being too exhausted or too poor prevents an action",()=>{
 const s=play(["diner","keira"]);
 const lowCash={...s,cash:0};
 const meal=Engine.choose(lowCash,"keira_meal");
 assert.equal(meal.ok,false);
 assert.equal(meal.state.cash,0);
 const empty={...s,energy:0};
 assert.equal(Engine.choose(empty,"keira_guests").ok,false);
});
test("a deadline without a rival killed ends the run",()=>{
 const s=Engine.newGame();
 const almost={...s,time:Engine.DAWN-5};
 const a=Engine.visit(almost,"street");
 assert.equal(a.state.outcome,"deadline");
});
test("a story snapshot can be restored without showing hidden identities",()=>{
 const s=play(["street","iris","iris_promises","shrine","yuen","yuen_oath"]);
 const clone=Engine.restore(JSON.parse(JSON.stringify(s)));
 assert.deepEqual(clone.flags,s.flags);
 assert.equal(Engine.restore({version:-1}).place,"apartment");
 assert.ok(!JSON.stringify(Engine.publicState(clone)).includes("possessed"));
});
test("UI features full-size anime portraits and conversation choices, not pixel movement or a clue panel",()=>{
 assert.match(html,/id="people"/);
 assert.match(html,/id="backdrop"/);
 assert.match(html,/id="options"/);
 assert.doesNotMatch(html,/id="notes"|id="notebook"|id="investigate"|<canvas/);
 for(const place of Object.keys(Story.places)){
  const svg=Art.placeArt(place);
  assert.match(svg,/<svg/);
  assert.match(svg,/<linearGradient/);
  assert.ok(svg.length>1000);
 }
 for(const id of Object.keys(Story.cast)){
  const svg=Art.portrait(id,Story.cast);
  assert.match(svg,/<svg/);
  assert.match(svg,/<path/);
  assert.match(svg,/<ellipse/);
  assert.ok(svg.length>2500);
 }
});

test("a conversation started too close to dawn cannot complete a kill afterward",()=>{
 const ready=play([...discovery,...confrontation]);
 const almost={...ready,time:Engine.DAWN-3};
 const result=Engine.choose(almost,"vincent_cast");
 assert.equal(result.ok,true);
 assert.equal(result.state.outcome,"deadline");
});
