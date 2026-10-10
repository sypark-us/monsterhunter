'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Campaign=require('../src/campaign.js');
const Staging=require('../src/scene-staging.js');
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<.001,`${actual} != ${expected}`);

test('every scheduled character occupies an authored point on the location floor',()=>{
 for(const chapter of Campaign.chapters)for(const [place,ids]of Object.entries(chapter.people)){
  const actors=ids.map(id=>Staging.actor(place,id));
  for(const a of actors){assert.ok(a.world.x>0&&a.world.x<Staging.frame.width);assert.ok(a.world.y>0&&a.world.y<Staging.frame.height);assert.ok(a.world.height>0);}
  if(actors.length>1)assert.ok(new Set(actors.map(a=>a.world.y)).size>1,`${place} repeats a horizontal row`);
 }
});
test('camera reframing preserves each character scale and floor point relative to the background',()=>{
 for(const place of Object.keys(Campaign.places))for(const viewport of [{width:1440,height:824,top:120,bottom:720},{width:768,height:924,top:120,bottom:790},{width:390,height:526,top:170,bottom:380},{width:667,height:330,top:90,bottom:225}]){
  const camera=Staging.projection(place,viewport);assert.ok(camera.scale>0);
  near(camera.width/Staging.frame.width,camera.height/Staging.frame.height);
  for(const id of Object.keys(Staging.locations[place].people)){
   const a=Staging.actor(place,id),p=Staging.project(a,camera);
   near((p.x-camera.x)/camera.scale,a.world.x);near((p.foot-camera.y)/camera.scale,a.world.y);
   near(p.height/camera.scale,a.world.height);near(p.width/camera.scale,a.world.width);
   assert.ok(p.top>=viewport.top-.001);assert.ok(p.foot<=viewport.bottom+.001);
  }
 }
});
test('interior adult scale matches authored counter and doorway references',()=>{
 const clinic=Staging.actor('clinic','mei');
 // Reception is about 24% of source height: an adult must stand substantially taller.
 assert.ok(clinic.world.height/(Staging.frame.height*.24)>1.6);
 const diner=Staging.actor('diner','keira');assert.ok(diner.world.height>Staging.frame.height*.45);
 assert.equal(Staging.actor('market','marcus').world.y,Staging.frame.height*.73);
});
test('exploration crops preserve source proportions and keep the separate dialogue portraits',()=>{
 assert.equal(Object.keys(Staging.activities).length,12);
 for(const place of Object.keys(Campaign.places))for(const id of Object.keys(Staging.locations[place].people)){
  const a=Staging.actor(place,id);near(a.world.width/a.world.height,a.crop.width/a.crop.height);
 }
 assert.match(Staging.actor('apartment','ada').art,/characters\/scene\/ada\.png/);
 assert.equal(Staging.actor('apartment','kit').art,null);
 assert.throws(()=>Staging.actor('invented','ada'));assert.throws(()=>Staging.actor('apartment','invented'));
});
