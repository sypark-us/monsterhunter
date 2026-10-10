/* Authored exploration blocking. Coordinates describe a location's floor, never story identity. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HundredStaging=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 // Each slot contains desktop and phone [horizontal %, ground %, standing height cqh].
 // Ground and height change together to establish perspective; activity scales preserve body proportions.
 const locations={
  apartment:{slots:[[[35,73,34],[22,68,29]],[[61,64,27],[55,58,23]],[[84,82,41],[83,73,31]]],people:{ada:0,kit:1,fong:2,aaron:2,ruth:1}},
  street:{slots:[[[32,83,43],[20,73,32]],[[76,67,29],[80,59,24]],[[54,75,35],[50,68,28]]],people:{marcus:0,iris:1,anita:2,bo:1,lily:2,daniel:1}},
  diner:{slots:[[[75,69,30],[78,62,25]],[[34,82,41],[20,73,31]],[[54,62,25],[49,57,22]]],people:{keira:0,marcus:1,mei:1,eunice:2}},
  hotel:{slots:[[[34,76,35],[21,71,30]],[[79,64,27],[80,59,24]],[[55,83,42],[50,73,31]]],people:{vincent:0,celia:0,daniel:1,tessa:2}},
  shrine:{slots:[[[56,63,28],[49,59,25]],[[82,81,40],[82,73,31]],[[31,73,33],[18,67,27]]],people:{yuen:0,iris:1,cheng:2}},
  clinic:{slots:[[[74,65,29],[80,61,25]],[[34,80,39],[20,72,30]],[[54,73,33],[49,68,27]]],people:{mei:0,ada:1,leung:2,henry:1,nora:2}},
  market:{slots:[[[36,82,41],[21,73,32]],[[79,65,28],[81,59,24]],[[57,73,34],[52,67,27]]],people:{owen:0,marcus:1,wai:2,sam:1,ming:1}},
  pier:{slots:[[[72,64,28],[77,59,24]],[[31,81,40],[18,73,31]],[[52,73,33],[48,68,28]]],people:{jun:0,iris:1,grace:2,daniel:0}},
  rooftop:{slots:[[[69,75,35],[71,69,29]],[[34,65,29],[25,59,24]],[[87,83,41],[88,73,31]]],people:{sora:0,iris:1,patrick:1}}
 };
 // Source-pixel foot lines trim transparent canvas padding without distorting the artwork.
 const footLines={ada:1482,keira:1481,marcus:1482,iris:1482,vincent:1486,daniel:1504,yuen:1469,mei:1483,celia:1492,owen:1374,jun:1513,sora:1473};
 const activities={
  ada:{label:'Reading on a stool',scale:.70},
  keira:{label:'Preparing tea',scale:1},
  marcus:{label:'Checking a delivery message',scale:1},
  iris:{label:'Sitting with a takeaway cup',scale:.72},
  vincent:{label:'Reading in an armchair',scale:.72},
  daniel:{label:'Checking the register',scale:1},
  yuen:{label:'Tending the incense',scale:.57},
  mei:{label:'Reviewing patient notes',scale:1},
  celia:{label:'Writing in a ledger',scale:.93},
  owen:{label:'Checking his camera',scale:.60},
  jun:{label:'Checking the timetable',scale:1},
  sora:{label:'Sorting documents',scale:.72}
 };
 function actor(place,id){
  const location=locations[place];
  if(!location||!Object.hasOwn(location.people,id))throw new Error('Unknown scene placement: '+place+'/'+id);
  const [desktop,mobile]=location.slots[location.people[id]],activity=activities[id];
  const scale=activity?.scale||1;
  return{desktop:[desktop[0],desktop[1],desktop[2]*scale],mobile:[mobile[0],mobile[1],mobile[2]*scale],aspect:activity?1024/footLines[id]:2/3,activity:activity?.label||'',art:activity?'assets/characters/scene/'+id+'.png?v=0.4.1':null,depth:Math.round(desktop[1])};
 }
 return Object.freeze({locations,activities,actor});
});
