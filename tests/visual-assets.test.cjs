'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
for(let i=0;i<4;i++)require('../assets/cast-part-'+i+'.js');
const Visuals=require('../src/visual-assets.js');
const Story=require('../src/story.js');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
test('painted character atlas is complete and byte-identical to the approved artwork',()=>{
  assert.deepEqual(globalThis.HundredCastParts.map(p=>p.length),[9000,9000,9000,1840]);
  const bytes=Buffer.from(Visuals.encoded,'base64');
  assert.equal(bytes.length,21629);
  assert.equal(bytes.subarray(4,12).toString(),'ftypavif');
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),Visuals.atlasSha256);
});
test('seven different characters map to the correct individual sheet cells',()=>{
  const coords=Object.keys(Story.cast).map(id=>{const f=Visuals.frame(id);assert.ok(f.column>=0&&f.column<4&&f.row>=0&&f.row<2);return f.column+','+f.row;});
  assert.equal(new Set(coords).size,7);
  assert.deepEqual(Visuals.frame('keira'),{column:1,row:0});
  assert.deepEqual(Visuals.frame('vincent'),{column:3,row:0});
  assert.deepEqual(Visuals.frame('yuen'),{column:2,row:1});
  assert.throws(()=>Visuals.frame('unknown'));
});
test('every location has a credited photograph with a bundled local first choice',()=>{
  for(const place of Object.keys(Story.places)){
    assert.ok(Visuals.photos[place].author);
    assert.match(Visuals.photos[place].page,/^https:\/\/www\.pexels\.com\/photo\//);
    assert.match(Visuals.photoSources(place)[0],new RegExp('^assets/backgrounds/'+place+'\\.jpg'));
    assert.match(Visuals.scenes[place],/^https:\/\/images\.pexels\.com\//);
  }
});
test('live game loads real raster art and no longer calls the vector character generator',()=>{
  const html=read('index.html'),ui=read('src/ui.js'),css=read('src/visual-novel.css');
  assert.match(html,/PHOTO \+ PAINTED/);
  for(let i=0;i<4;i++)assert.ok(html.includes('assets/cast-part-'+i+'.js?v=0.3'));
  assert.ok(html.indexOf('cast-part-3.js')<html.indexOf('src/visual-assets.js'));
  assert.match(ui,/Visuals\.atlas/);assert.match(ui,/Visuals\.photoSources/);
  assert.doesNotMatch(ui,/Art\.character|Art\.scenes|data:image\/svg/);
  assert.match(css,/width:400%;height:200%/);
  assert.doesNotMatch(html,/id="notes"|id="investigate"|<canvas/);
});
test('visual selection has no hidden possession or suspicion lookup',()=>{
  const source=read('src/visual-assets.js');
  assert.doesNotMatch(source,/\.possessed|\.cursed|HIDDEN_POSSESSION|\.flags/);
});
