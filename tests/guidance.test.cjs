'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Engine=require('../src/engine.js');
const Story=require('../src/campaign.js');
const {describe}=require('../src/guidance.js');
const {first,routes}=require('../scripts/campaign-route.cjs');
function state(chapter,flags={},extra={}){return {...Engine.newGame(),chapter,flags,...extra};}
function next(s){const lead=describe(s).next;assert.ok(lead.text&&lead.reason);return lead.text;}
function act(s,actions){for(const id of actions){const result=Story.places[id]?Engine.visit(s,id):Story.cast[id]?Engine.approach(s,id):Engine.choose(s,id);assert.equal(result.ok,true,id);s=result.state;}return s;}

test('all chapters retain their opening after conversation, travel and saved-state restore',()=>{
 let s=Engine.newGame();
 for(let chapter=1;chapter<=5;chapter++){
  if(chapter>1)s=Engine.nextChapter(s).state;
  s=act(s,['ada']);s=Engine.leave(s).state;
  const restored=Engine.restore(JSON.parse(JSON.stringify(s))),before=JSON.stringify(restored),view=describe(restored);
  assert.equal(view.opening,Story.chapter(chapter).opening);
  assert.ok(view.goal.length>30);assert.match(view.premise,/you/i);assert.match(view.premise,/demon/i);
  assert.ok(view.rules.length>=2);assert.ok(view.next.text&&view.next.reason);
  assert.equal(JSON.stringify(restored),before,'reading guidance does not spend resources or change the save');
  s=act(s,chapter===1?first:routes[chapter]);
 }
});

test('the First Vow recipe appears only after learning it and survives the transient whisper',()=>{
 let s=Engine.newGame();
 assert.doesNotMatch(describe(s).rules.join(' '),/willing refusal|speak the release/i);
 assert.doesNotMatch(describe(s).rules.join(' '),/I release you from your promise/);
 s=act(s,['shrine','yuen','yuen_oath']);
 assert.doesNotMatch(describe(s).rules.join(' '),/speak the release/i);
 assert.doesNotMatch(describe(s).rules.join(' '),/I release you from your promise/);
 s=act(s,['street','marcus','marcus_oaths','marcus_job']);
 assert.equal(s.whisper,'');assert.equal(s.powerKnown,true);
 const rules=describe(Engine.restore(JSON.parse(JSON.stringify(s)))).rules.join(' ');
 assert.match(rules,/First Vow/);assert.match(rules,/promise/i);assert.match(rules,/withdraw|refus/i);assert.match(rules,/release/i);
 assert.match(rules,/I release you from your promise\./);
 assert.match(describe({...s,chapter:3}).rules.join(' '),/First Vow/);
});

test('first-chapter leads advance through witnessed accounts to the current conversation',()=>{
 let s=Engine.newGame();assert.match(next(s),/Yuen.*Shrine/);
 s=act(s,['shrine','yuen','yuen_oath']);assert.match(next(s),/Marcus/);
 s=act(s,['street','marcus','marcus_oaths']);assert.match(next(s),/Keira/);
 s=act(s,['diner','keira','keira_guests']);assert.match(next(s),/Daniel/);
 s=act(s,['hotel','daniel','daniel_vincent']);assert.match(next(s),/Vincent/);
 s=act(s,['vincent','vincent_names','vincent_meeting','vincent_keira','vincent_daniel']);
 assert.match(next(s),/Vincent/);const before=next(s);
 s=act(s,['vincent_press']);assert.notEqual(next(s),before);
 assert.doesNotMatch(JSON.stringify(describe(s)),/Vincent is (?:a demon|possessed)|Vincent.*guilty/i);
});

test('relief-fund guidance accepts supporting witnesses and the intelligence alternative',()=>{
 assert.match(next(state(2)),/Ada/);
 assert.match(next(state(2,{c2_anita:true})),/Mei/);
 assert.match(next(state(2,{c2_missing:true})),/Celia/);
 assert.match(next(state(2,{c2_missing:true,c2_accepted:true})),/Mei/);
 assert.match(next(state(2,{c2_missing:true,c2_accepted:true,c2_help:true})),/Keira/);
 assert.match(next(state(2,{c2_missing:true,c2_accepted:true,c2_paid:true})),/Owen/);
 assert.match(next(state(2,{c2_missing:true,c2_accepted:true,c2_paid:true,c2_photo:true})),/Celia/);
 assert.match(next(state(2,{c2_missing:true,c2_accepted:true},{stats:{...Engine.newGame().stats,intelligence:2}})),/Celia/);
 assert.match(next(state(2,{c2_released:true,c2_accepted:true,c2_missing:true})),/Celia/);
});

test('ferry guidance does not send completed witnesses back and respects the sense shortcut',()=>{
 assert.match(next(state(3)),/Grace.*Pier/);
 assert.match(next(state(3,{c3_manifest:true})),/Jun/);
 const passage={c3_manifest:true,c3_passage:true};
 assert.match(next(state(3,passage)),/Marcus/);
 assert.match(next(state(3,{...passage,c3_route:true})),/Yuen/);
 assert.match(next(state(3,{...passage,c3_route:true,c3_rule:true})),/Jun/);
 assert.match(next(state(3,passage,{stats:{...Engine.newGame().stats,sense:2}})),/Jun/);
 const returned=next(state(3,{...passage,c3_return:true}));
 assert.match(returned,/Jun/);
 assert.notEqual(next(state(3,{...passage,c3_return:true,c3_refused:true})),returned);
 assert.match(next(state(3,{c3_manifest:true,c3_return:true,c3_refused:true})),/Jun/,'a promise is still needed when sense bypassed the manifest conversation');
});

test('memory guidance handles supporting witnesses and Dominion without requesting completed accounts',()=>{
 assert.match(next(state(4)),/Sora.*Rooftop/);
 assert.match(next(state(4,{c4_offer:true})),/Mei/);
 const witnessed={c4_offer:true,c4_witness:true};
 assert.match(next(state(4,witnessed)),/Ada/);
 assert.match(next(state(4,{...witnessed,c4_memory:true})),/Owen/);
 assert.match(next(state(4,{...witnessed,c4_memory:true,c4_negative:true})),/Sora/);
 assert.match(next(state(4,witnessed,{stats:{...Engine.newGame().stats,dominion:2}})),/Sora/);
 const challenged=next(state(4,{...witnessed,c4_challenged:true}));
 assert.notEqual(next(state(4,{...witnessed,c4_challenged:true,c4_renounced:true})),challenged);
});

test('final-chapter guidance handles trust rebuilding and alternate reasoning without revealing the keeper early',()=>{
 assert.match(next(state(5)),/Yuen/);
 assert.doesNotMatch(JSON.stringify(describe(state(5))),/Iris is|Iris.*keeper|keeper.*Iris/);
 assert.match(next(state(5,{c5_origin:true})),/Iris/);
 const introduced={c5_origin:true,c5_names:true};
 const unfamiliar=next(state(5,introduced));assert.match(unfamiliar,/Ada/);
 assert.notEqual(next(state(5,introduced,{relationships:{ada:1}})),unfamiliar);
 assert.match(next(state(5,{...introduced,c5_home:true})),/Keira/);
 assert.match(next(state(5,{...introduced,c5_home:true,c5_anchor:true})),/Iris/);
 assert.match(next(state(5,introduced,{stats:{...Engine.newGame().stats,intelligence:3}})),/Iris/);
 const heard=next(state(5,{...introduced,c5_hosts:true}));
 assert.notEqual(next(state(5,{...introduced,c5_hosts:true,c5_refused:true})),heard);
});

test('terminal guidance describes available continuation instead of giving impossible travel instructions',()=>{
 assert.match(next(state(2,{}, {outcome:'victory'})),/chapter|Continue/i);
 assert.match(next(state(5,{}, {outcome:'victory'})),/ending|future/i);
 assert.match(next(state(3,{}, {outcome:'rival'})),/save|new/i);
 assert.match(next(state(5,{}, {outcome:'ending:protect'})),/complete/i);
});
