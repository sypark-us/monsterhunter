'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Story=require('../src/campaign.js');
const Engine=require('../src/engine.js');
const Guidance=require('../src/guidance.js');
const I18n=require('../src/i18n.js');
const {first,routes}=require('../scripts/campaign-route.cjs');
const fs=require('node:fs');
const crypto=require('node:crypto');
const hangul=/[가-힣]/;

test('Korean covers every authored chapter, character, place, conversation and ending',()=>{
 const strings=new Set(Object.values(Story.locale.en));
 for(const person of Object.values(Story.cast))for(const value of [person.name,person.role])strings.add(value);
 for(const place of Object.values(Story.places))for(const value of [place.name,place.description])strings.add(value);
 for(const chapter of Story.chapters){
  for(const key of ['title','objective','opening','reward'])strings.add(chapter[key]);
  for(const scene of Object.values(chapter.conversations)){
   strings.add(scene.greeting);if(scene.firstGreeting)strings.add(scene.firstGreeting);
   for(const topic of scene.topics){strings.add(topic.ask);strings.add(topic.answer)}
  }
 }
 for(const ending of Object.values(Story.endings)){strings.add(ending.title);strings.add(ending.text)}
 for(const source of strings){assert.match(I18n.translate(source,'ko'),hangul,source);assert.equal(I18n.translate(source,'en'),source)}
});

test('the bundled Korean font covers every translated character and matches its recorded integrity',()=>{
 const manifest=require('../assets/fonts/manifest.json'),covered=new Set(manifest.catalogCharacters);
 for(const file of ['ko-ui','ko-story','ko-campaign'])for(const text of Object.values(require('../src/locales/'+file+'.js')))for(const char of text)assert.ok(covered.has(char),'Font subset missing '+char);
 for(const font of manifest.fonts){const bytes=fs.readFileSync(require.resolve('../assets/fonts/'+font.file));assert.equal(bytes.subarray(0,4).toString(),'wOF2');assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),font.sha256)}
 assert.match(fs.readFileSync(require.resolve('../assets/fonts/OFL.txt'),'utf8'),/SIL OPEN FONT LICENSE/);
});

test('localization preserves progress and translates guidance, options and history throughout the campaign',()=>{
 let s=Engine.newGame();
 function check(){
  const before=JSON.stringify(s),g=Guidance.describe(s),view=Engine.publicState(s);
  for(const source of [g.premise,g.opening,g.goal,g.next.text,g.next.reason,...g.rules,view.sceneText,view.whisper,view.dialogue?.line,...view.options.flatMap(o=>[o.label,o.warning])].filter(Boolean))assert.match(I18n.translate(source,'ko'),hangul,source);
  for(const entry of view.history)for(const source of [entry.person,entry.ask,entry.answer])assert.match(I18n.translate(source,'ko'),hangul,source);
  assert.equal(JSON.stringify(s),before);
 }
 for(let chapter=1;chapter<=5;chapter++){
  if(chapter>1)s=Engine.nextChapter(s).state;check();
  for(const id of chapter===1?first:routes[chapter]){
   const result=Story.places[id]?Engine.visit(s,id):Story.cast[id]?Engine.approach(s,id):Engine.choose(s,id);
   assert.equal(result.ok,true,id);s=result.state;check();
  }
 }
 for(const ending of ['protect','ascend','sever'])assert.match(I18n.translate(Engine.finish(s,ending).state.sceneText,'ko'),hangul);
});

test('Korean preserves the ritual phrase and translates dynamic status, accessibility labels and costs',()=>{
 const s={...Engine.newGame(),powerKnown:true};
 assert.ok(I18n.translate(Guidance.describe(s).rules.find(rule=>rule.includes('I release')),'ko').includes('그 약속에서 당신을 풀어 드립니다.'));
 assert.ok(I18n.translate(Story.chapter(1).conversations.vincent.topics.find(t=>t.id==='vincent_cast').ask,'ko').includes('그 약속에서 당신을 풀어 드립니다.'));
 for(const source of ['CHAPTER 01','DAY 3 · AFTER DARK','Until 02:00','Next lead: '+Guidance.describe(s).next.text,'8 min · −2 energy','85 min · +HK$120 · −23 energy','Talk to Ada Leung — Reading on a stool','Go to Tin Hau Shrine','Chapter 2 · Borrowed Breath','Continue to The Last Crossing','Rest for 65 minutes (+32 energy)','SENSE 1 → 2'])assert.match(I18n.translate(source,'ko'),hangul,source);
 assert.equal(I18n.translate('An unknown future message','ko'),'An unknown future message');
 assert.equal(I18n.translate('Save','invalid'),'Save');
 assert.equal(I18n.translate('Close','ko'),'닫기');
 assert.equal(I18n.relationshipLabel(3,'ko'),'가까운 사이');
 assert.equal(I18n.relationshipLabel(3,'en'),'Close');
});
