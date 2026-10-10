/* Translate presentation only: saves, topic IDs and game rules stay in English. */
(function(root,factory){
 const node=typeof module==='object'&&module.exports;
 const api=factory(node?require('./locales/ko-ui.js'):root.HundredKoUI,node?require('./locales/ko-story.js'):root.HundredKoStory,node?require('./locales/ko-campaign.js'):root.HundredKoCampaign);
 if(node)module.exports=api;root.HundredI18n=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(ui,story,campaign){
 'use strict';
 const dictionary={...ui,...story,...campaign};
 const normalize=s=>s.replace(/’/g,"'").replace(/\s+/g,' ').trim().toLowerCase();
 const messages=new Map(Object.entries(dictionary).map(([en,ko])=>[normalize(en),ko.trim()]));
 const originals=new WeakMap();
 function translate(value,language='en'){
  if(language!=='ko'||typeof value!=='string'||!value.trim())return value;
  const source=value.trim(),known=messages.get(normalize(source));
  const result=known||compose(source);
  return value.slice(0,value.indexOf(source))+result+value.slice(value.indexOf(source)+source.length);
 }
 const ko=s=>translate(s,'ko');
 function compose(s){
  let match;
  if((match=s.match(/^(?:CHAPTER|Chapter) (\d+) COMPLETE$/)))return '제'+Number(match[1])+'장 완료';
  if((match=s.match(/^(?:CHAPTER|Chapter) (\d+)$/)))return '제'+Number(match[1])+'장';
  if((match=s.match(/^DAY (\d+) · AFTER DARK$/)))return match[1]+'일째 · 해가 진 뒤';
  if(s.startsWith('Next lead: '))return '다음 실마리: '+ko(s.slice(11));
  if(s.startsWith('Until '))return s.slice(6)+'까지';
  if(s.startsWith('Go to '))return '이동: '+ko(s.slice(6));
  if(s.startsWith('Talk to '))return ko(s.slice(8))+'에게 말 걸기';
  if(s.startsWith('Continue to '))return '다음 장: '+ko(s.slice(12));
  if((match=s.match(/^v([\d.]+) · THE CAMPAIGN$/)))return 'v'+match[1]+' · 이야기';
  if((match=s.match(/^Your saved story · Chapter (\d+)$/)))return '저장한 이야기 · 제'+match[1]+'장';
  if((match=s.match(/^Rest for (\d+) minutes \(\+(\d+) energy\)$/)))return match[1]+'분 쉬기 (기력 +'+match[2]+')';
  if((match=s.match(/^(\d+) minutes remain\. Reading does not advance time\.$/)))return match[1]+'분 남았습니다. 읽는 동안에는 시간이 흐르지 않습니다.';
  if((match=s.match(/^(\d+)h (\d+)m remains until (\d\d:\d\d)\./)))return match[3]+'까지 '+match[1]+'시간 '+match[2]+'분 남았습니다. 읽거나 장면을 살피거나 도움말을 보는 동안에는 시간이 흐르지 않습니다. 말을 걸거나 대화를 마칠 때도 시간이 들지 않습니다. 대답을 선택하면 보통 8분과 기력 2가 소모되며, 각 선택지에 정확한 비용이 표시됩니다. 이동에는 15분과 기력 1이 듭니다.';
  if((match=s.match(/^Available points: (\d+)$/)))return '남은 포인트: '+match[1];
  if((match=s.match(/^Slot (\d+)$/)))return '슬롯 '+match[1];
  if((match=s.match(/^Saved in slot (\d+)$/)))return '슬롯 '+match[1]+'에 저장했습니다.';
  if((match=s.match(/^Human connection: (\d+) \/ 10$/)))return '일상과의 연결: '+match[1]+' / 10';
  if((match=s.match(/^Rent paid: (\d+) nights$/)))return '월세 납부: '+match[1]+'일';
  if((match=s.match(/^(sense|intelligence|charisma|dominion): (\d+)$/)))return ko(match[1])+': '+match[2];
  if((match=s.match(/^(SENSE|INTELLIGENCE|CHARISMA|DOMINION) (\d+) → (\d+)$/)))return ko(match[1])+' '+match[2]+' → '+match[3];
  if((match=s.match(/^(\d+) min$/)))return match[1]+'분';
  if((match=s.match(/^([+−-]?\d+) energy$/)))return '기력 '+match[1];
  for(const suffix of [' Your signature gives the ledger a debt it can never finish collecting. You lose your last breath.',' You accepted a crossing with no promise of return. The boat carries you beyond the living shore.'])if(s.endsWith(suffix))return ko(s.slice(0,-suffix.length))+' '+ko(suffix).trim();
  const fallback=' The city keeps moving. For a moment, there is nothing urgent to say.';
  if(s.endsWith(fallback))return ko(s.slice(0,-fallback.length))+' '+ko(fallback).trim();
  if(s.includes(' · '))return s.split(' · ').map(ko).join(' · ');
  if(s.includes(' — '))return s.split(' — ').map(ko).join(' — ');
  if(s.endsWith(':'))return ko(s.slice(0,-1))+':';
  return s;
 }
 // Remember English nodes across switches. Newly rendered nodes supply new source copy.
 function localizeDOM(root,language){
  const doc=root.ownerDocument||root;
  const walker=doc.createTreeWalker(root,4);let node;
  while((node=walker.nextNode())){
   if(node.parentElement?.closest('script,style,[data-no-localize],#line'))continue;
   let record=originals.get(node);
   if(!record||node.nodeValue!==record.rendered)record={source:node.nodeValue};
   record.rendered=translate(record.source,language);node.nodeValue=record.rendered;originals.set(node,record);
  }
  for(const el of root.querySelectorAll('[aria-label],[title]')){
   if(el.closest('[data-no-localize]'))continue;
   let record=originals.get(el);if(!record)record={};
   for(const name of ['aria-label','title']){
    if(!el.hasAttribute(name))continue;
    const value=el.getAttribute(name);let attr=record[name];
    if(!attr||value!==attr.rendered)attr={source:value};
    attr.rendered=translate(attr.source,language);el.setAttribute(name,attr.rendered);record[name]=attr;
   }
   originals.set(el,record);
  }
 }
 function relationshipLabel(value,language='en'){
  const labels=['Unfamiliar','Acquainted','Trusted','Close','Steadfast','Deeply connected'];
  return language==='ko'&&value===3?ko('Close relationship'):translate(labels[value],language);
 }
 return {translate,localizeDOM,relationshipLabel};
});
