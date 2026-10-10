'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Campaign=require('../src/campaign.js');
const Staging=require('../src/scene-staging.js');

test('every scheduled character has a stable location anchor with room for distinct targets',()=>{
 for(const chapter of Campaign.chapters)for(const [place,ids]of Object.entries(chapter.people)){
  const actors=ids.map(id=>Staging.actor(place,id));
  for(const mode of ['desktop','mobile']){
   for(const a of actors){const [x,y,height]=a[mode];assert.ok(x>10&&x<95);assert.ok(y>=55&&y<=86);assert.ok(height>10&&height<=48);}
   const sorted=actors.map(a=>a[mode][0]).sort((a,b)=>a-b);
   assert.ok(sorted.every((x,i)=>!i||x-sorted[i-1]>=19),`${chapter.id} ${place} ${mode} anchors collide`);
   if(actors.length>1)assert.ok(new Set(actors.map(a=>a[mode][1])).size>1,`${place} repeats a horizontal row`);
  }
 }
});
test('location compositions differ and exploration activities preserve conversation portraits',()=>{
 const layouts=Object.keys(Campaign.places).map(p=>JSON.stringify(Staging.locations[p].slots));
 assert.equal(new Set(layouts).size,9);
 assert.equal(Object.keys(Staging.activities).length,12);
 assert.match(Staging.actor('apartment','ada').art,/characters\/scene\/ada\.png/);
 assert.equal(Staging.actor('apartment','kit').art,null);
 assert.throws(()=>Staging.actor('invented','ada'));
 assert.throws(()=>Staging.actor('apartment','invented'));
});
