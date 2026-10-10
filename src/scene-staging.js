/* Locations and actors share the background image coordinate system. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HundredStaging=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const frame={width:1672,height:941};
 // Visual calibrations against doors, counters, and chairs. These are effective
 // perspective guides for the painted environments, not measured camera intrinsics.
 const locations={
  apartment:{"horizon":22,"perspective":1.05,"slots":[[35,73],[61,64],[84,82]],"people":{"ada":0,"kit":1,"fong":2,"aaron":2,"ruth":1}},
  street:{"horizon":50,"perspective":1.4,"slots":[[32,83],[76,67],[54,75]],"people":{"marcus":0,"iris":1,"anita":2,"bo":1,"lily":2,"daniel":1}},
  diner:{"horizon":25,"perspective":1.1,"slots":[[75,69],[34,82],[54,62]],"people":{"keira":0,"marcus":1,"mei":1,"eunice":2}},
  hotel:{"horizon":42,"perspective":1.7,"slots":[[34,76],[79,64],[55,83]],"people":{"vincent":0,"celia":0,"daniel":1,"tessa":2}},
  shrine:{"horizon":44,"perspective":1.35,"slots":[[56,63],[82,81],[31,73]],"people":{"yuen":0,"iris":1,"cheng":2}},
  clinic:{"horizon":20,"perspective":1,"slots":[[74,65],[34,80],[54,73]],"people":{"mei":0,"ada":1,"leung":2,"henry":1,"nora":2}},
  market:{"horizon":50,"perspective":1.5,"slots":[[36,82],[76,73],[57,73]],"people":{"owen":0,"marcus":1,"wai":2,"sam":1,"ming":1}},
  pier:{"horizon":45,"perspective":1.7,"slots":[[72,64],[31,81],[52,73]],"people":{"jun":0,"iris":1,"grace":2,"daniel":0}},
  rooftop:{"horizon":42,"perspective":1.55,"slots":[[69,75],[34,65],[87,83]],"people":{"sora":0,"iris":1,"patrick":1}}
 };
 // Alpha-content bounds in original 1024×1536 sprites. Crop margins, never stretch bodies.
 const contentBounds={"aaron":[300,10,723,1522],"ada":[336,12,725,1521],"anita":[277,6,740,1527],"bo":[237,5,736,1517],"celia":[303,15,732,1522],"cheng":[313,11,796,1527],"daniel":[301,9,772,1525],"eunice":[290,7,724,1526],"fong":[286,12,720,1517],"grace":[280,5,729,1533],"henry":[261,9,708,1516],"iris":[275,14,747,1518],"jun":[303,15,759,1513],"keira":[290,20,745,1516],"kit":[339,13,704,1514],"leung":[293,14,745,1519],"lily":[257,4,725,1531],"marcus":[258,16,725,1504],"mei":[324,21,749,1503],"ming":[282,11,739,1522],"nora":[322,6,733,1517],"owen":[252,15,749,1510],"patrick":[272,8,735,1526],"ruth":[265,11,710,1525],"sam":[254,10,764,1516],"sora":[266,18,744,1512],"tessa":[330,11,719,1507],"vincent":[273,7,743,1516],"wai":[289,8,776,1516],"yuen":[279,16,705,1515],"scene/ada":[161,24,855,1482],"scene/celia":[154,13,846,1492],"scene/daniel":[221,13,766,1504],"scene/iris":[60,47,924,1482],"scene/jun":[269,21,837,1513],"scene/keira":[142,31,981,1481],"scene/marcus":[262,24,769,1482],"scene/mei":[312,27,794,1483],"scene/owen":[90,85,1006,1374],"scene/sora":[89,38,1006,1473],"scene/vincent":[63,53,983,1486],"scene/yuen":[193,38,905,1469]};
 const activities={"ada":{"label":"Reading on a stool","scale":0.7},"keira":{"label":"Preparing tea","scale":1},"marcus":{"label":"Checking a delivery message","scale":1},"iris":{"label":"Sitting with a takeaway cup","scale":0.72},"vincent":{"label":"Reading in an armchair","scale":0.72},"daniel":{"label":"Checking the register","scale":1},"yuen":{"label":"Tending the incense","scale":0.57},"mei":{"label":"Reviewing patient notes","scale":1},"celia":{"label":"Writing in a ledger","scale":0.93},"owen":{"label":"Checking his camera","scale":0.6},"jun":{"label":"Checking the timetable","scale":1},"sora":{"label":"Sorting documents","scale":0.72}};
 function actor(place,id){
  const location=locations[place];
  if(!location||!Object.hasOwn(location.people,id))throw new Error('Unknown scene placement: '+place+'/'+id);
  const [x,y]=location.slots[location.people[id]],activity=activities[id];
  const [left,top,right,bottom]=contentBounds[(activity?'scene/':'')+id];
  const crop={x:left,y:top,width:right-left,height:bottom-top};
  const height=(y-location.horizon)/100*frame.height*location.perspective*(activity?.scale||1);
  return{world:{x:x/100*frame.width,y:y/100*frame.height,height,width:height*crop.width/crop.height},crop,
   activity:activity?.label||'',art:activity?'assets/characters/scene/'+id+'.png?v=0.4.2':null,depth:Math.round(y)};
 }
 function projection(place,{width,height,top=0,bottom=height}){
  if(!locations[place]||![width,height,top,bottom].every(Number.isFinite)||width<=0||height<=0||bottom<=top)throw new Error('Invalid scene viewport');
  // Frame the entire location consistently across chapters. If controls need more
  // room, reframe background and every actor together; no actor-only size caps.
  const all=Object.keys(locations[place].people).map(id=>actor(place,id).world);
  const head=Math.min(...all.map(a=>a.y-a.height)),foot=Math.max(...all.map(a=>a.y));
  const scale=Math.min(width/frame.width,height/frame.height,(bottom-top)/(foot-head));
  const projectedWidth=frame.width*scale,projectedHeight=frame.height*scale;
  const minY=top-head*scale,maxY=bottom-foot*scale;
  return{scale,x:(width-projectedWidth)/2,y:Math.max(minY,Math.min(maxY,(height-projectedHeight)/2)),width:projectedWidth,height:projectedHeight};
 }
 function project(a,camera){
  const height=a.world.height*camera.scale,foot=camera.y+a.world.y*camera.scale;
  return{x:camera.x+a.world.x*camera.scale,foot,top:foot-height,width:a.world.width*camera.scale,height};
 }
 return Object.freeze({frame,locations,activities,actor,projection,project});
});
