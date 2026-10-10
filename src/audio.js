/* Original eight-theme instrumental score, arranged and synthesized locally. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HundredAudio=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const tracks={
  apartment:{name:'A Light Left On',bpm:66,root:45,melody:[69,0,72,71,69,64,0,67,69,0,76,74,72,71,0,64],chords:[[0,3,7],[5,8,12],[3,7,10],[7,10,14]]},
  street:{name:'Rain Between Signs',bpm:84,root:42,melody:[66,69,0,73,71,69,66,0,64,66,69,0,73,71,0,66],chords:[[0,3,7],[8,12,15],[5,8,12],[7,10,14]]},
  diner:{name:'The Last Kettle',bpm:72,root:48,melody:[72,76,79,0,77,76,74,0,72,0,69,72,74,76,0,72],chords:[[0,4,7],[5,9,12],[9,12,16],[7,11,14]]},
  hotel:{name:'Names in the Ledger',bpm:60,root:38,melody:[62,0,65,0,69,68,0,62,61,0,65,0,68,69,0,61],chords:[[0,3,7],[1,5,8],[5,8,12],[7,10,14]]},
  shrine:{name:'Promises in Smoke',bpm:58,root:43,melody:[67,0,70,0,74,0,72,70,67,0,65,0,62,65,0,67],chords:[[0,3,7],[3,7,10],[5,8,12],[0,3,7]]},
  clinic:{name:'Borrowed Breath',bpm:64,root:40,melody:[64,0,67,71,0,69,67,0,64,66,0,67,71,0,66,64],chords:[[0,3,7],[5,8,12],[8,12,15],[7,10,14]]},
  pier:{name:'No Passage Without Return',bpm:62,root:41,melody:[65,0,68,72,0,75,72,0,68,0,65,63,65,0,72,0],chords:[[0,3,7],[8,12,15],[3,7,10],[5,8,12]]},
  rooftop:{name:'The Hundredth Name',bpm:70,root:45,melody:[69,72,76,0,79,76,74,72,69,0,67,64,67,69,72,0],chords:[[0,3,7],[3,7,10],[5,9,12],[7,11,14]]}
 };
 function create(){
  let ctx=null,music=null,ambience=null,timer=null,noise=null,scene='apartment',step=0,next=0,on=false,duck=false;
  let musicVolume=.35,ambienceVolume=.18;const voices=new Set();
  const midi=n=>440*2**((n-69)/12);
  function tone(note,time,duration,volume,type='sine'){
   const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.value=midi(note);
   gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(volume,time+.04);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
   osc.connect(gain).connect(music);osc.start(time);osc.stop(time+duration+.04);voices.add(osc);osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect()};
  }
  function mix(){if(!ctx)return;music.gain.setTargetAtTime(on?musicVolume*(duck?.65:1):0,ctx.currentTime,.12);ambience.gain.setTargetAtTime(on?ambienceVolume:0,ctx.currentTime,.2)}
  function schedule(){
   if(!on||document.hidden)return;
   if(next<ctx.currentTime-.1)next=ctx.currentTime+.05;
   const track=tracks[scene==='market'?'street':scene]||tracks.apartment,beat=60/track.bpm;
   while(next<ctx.currentTime+.35){
    const index=step%track.melody.length,note=track.melody[index];
    if(note)tone(note,next,beat*.9,.045,'sine');
    if(step%4===0){const chord=track.chords[Math.floor(step/4)%4];for(const interval of chord)tone(track.root+interval,next,beat*4,.018,'triangle');tone(track.root-12,next,beat*3.6,.015)}
    if(step%2===0)tone(track.root+12+(step%4===0?7:3),next,beat*1.4,.012,'sine');
    next+=beat/2;step++;
   }
  }
  async function toggle(){
   if(on){on=false;clearInterval(timer);timer=null;mix();return false}
   const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)throw new Error('Audio unavailable');
   if(!ctx){
    ctx=new Audio();music=ctx.createGain();ambience=ctx.createGain();music.connect(ctx.destination);ambience.connect(ctx.destination);
    const buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),data=buffer.getChannelData(0);let seed=17;
    for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;data[i]=(seed/2147483647*2-1)*.09}
    noise=ctx.createBufferSource();noise.buffer=buffer;noise.loop=true;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=900;noise.connect(filter).connect(ambience);noise.start();
   }
   await ctx.resume();on=true;step=0;next=ctx.currentTime+.05;mix();schedule();timer=setInterval(schedule,100);return true;
  }
  function setScene(place,conversation=false){if(scene!==place){scene=place;step=0;if(ctx)next=ctx.currentTime+.05;for(const voice of voices){try{voice.stop()}catch{}}}duck=conversation;mix()}
  function setVolumes(m,a){musicVolume=Math.max(0,Math.min(1,Number(m)));ambienceVolume=Math.max(0,Math.min(1,Number(a)));mix()}
  function cue(){if(on&&ctx)tone(84,ctx.currentTime,.16,.015)}
  function status(){return{on,context:ctx?.state||'uninitialized',track:(tracks[scene==='market'?'street':scene]||tracks.apartment).name,musicVolume,ambienceVolume,voices:voices.size}}
  document.addEventListener('visibilitychange',()=>{if(ctx&&on){if(document.hidden)ctx.suspend();else ctx.resume().then(()=>{next=ctx.currentTime+.05})}});
  return{toggle,setScene,setVolumes,cue,status};
 }
 return{tracks,create};
});
