/* Original scalable visual-novel art, inspired by rain-soaked Hong Kong
 * anime mystery illustrations. All SVG is generated locally. No outside images
 * or character badges encode whether anyone is possessed.
 */
(function(root,factory){
 const result=factory();
 if(typeof module==="object"&&module.exports)module.exports=result;
 root.HundredArt=result;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const W=1280,H=720;
 const hash=n=>{let x=Math.imul((n>>>0)^0x9e3779b9,0x85ebca6b);x=Math.imul(x^(x>>>13),0xc2b2ae35);return(x^(x>>>16))>>>0};
 const R=(x,y,w,h,fill,extra="")=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" '+extra+'/>';
 const P=(d,fill,more="")=>'<path d="'+d+'" fill="'+fill+'" '+more+'/>';
 const C=(x,y,r,fill,more="")=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" '+more+'/>';
 const L=(x,y,x2,y2,color,stroke=2)=>'<path d="M'+x+' '+y+' L'+x2+' '+y2+'" fill="none" stroke="'+color+'" stroke-width="'+stroke+'"/>';
 const TXT=(x,y,s,color,size=22,extra="")=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" font-family="sans-serif" font-size="'+size+'" font-weight="bold" '+extra+'>'+s+'</text>';
 const PRE='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice">';
 const defs=`<defs>
  <linearGradient id="sky" x2="0" y2="1"><stop stop-color="#090c22"/><stop offset=".52" stop-color="#192342"/><stop offset="1" stop-color="#36344b"/></linearGradient>
  <linearGradient id="road" x2="0" y2="1"><stop stop-color="#17293b"/><stop offset=".7" stop-color="#191f32"/><stop offset="1" stop-color="#0e1827"/></linearGradient>
  <linearGradient id="wall" x2="1" y2=".7"><stop stop-color="#222e4d"/><stop offset=".6" stop-color="#142238"/><stop offset="1" stop-color="#0b1424"/></linearGradient>
  <linearGradient id="warm" x2="0" y2="1"><stop stop-color="#c87867"/><stop offset=".5" stop-color="#995b5a"/><stop offset="1" stop-color="#302d3b"/></linearGradient>
  <linearGradient id="floor" x2="0" y2="1"><stop stop-color="#2e4057"/><stop offset=".62" stop-color="#2c3747"/><stop offset="1" stop-color="#0a1526"/></linearGradient>
  <radialGradient id="blueGlow"><stop stop-color="#6dbbcb" stop-opacity=".6"/><stop offset=".4" stop-color="#6dbbcb" stop-opacity=".13"/><stop offset="1" stop-color="#6dbbcb" stop-opacity="0"/></radialGradient>
  <radialGradient id="redGlow"><stop stop-color="#fe7a96" stop-opacity=".5"/><stop offset=".45" stop-color="#f37b88" stop-opacity=".11"/><stop offset="1" stop-color="#f37b88" stop-opacity="0"/></radialGradient>
  <radialGradient id="goldGlow"><stop stop-color="#ffd19b" stop-opacity=".55"/><stop offset=".5" stop-color="#f7a970" stop-opacity=".08"/><stop offset="1" stop-color="#f7a970" stop-opacity="0"/></radialGradient>
  <filter id="neon" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.5"/></filter>
  <pattern id="rain" width="74" height="94" patternUnits="userSpaceOnUse" patternTransform="skewX(-12)"><path d="M11 3v15 M49 33v27 M68 73v9" stroke="#b4dce9" stroke-opacity=".16" stroke-width="1.3"/></pattern>
 </defs>`;
 function windows(startX,startY,w,h,seed,stepX=32,stepY=38){
  let out="";
  for(let y=startY;y<startY+h;y+=stepY)for(let x=startX;x<startX+w;x+=stepX){
   const v=hash(seed+Math.floor(x)*17+Math.floor(y)*101);
   const lit=v%5<2;
   out+=R(x,y,Math.max(8,stepX*.39),Math.max(13,stepY*.51),lit?"#cfa97a":"#344862",'opacity="'+(lit?.87:.61)+'"');
   if(lit)out+=L(x+stepX*.22,y,x+stepX*.22,y+stepY*.51,"#684f51",1);
  }
  return out;
 }
 function groundFog(){return R(0,0,W,H,"url(#rain)")+R(0,0,W,H,"#040917",'opacity=".15"');}
 function skyline(){
  let out="";
  for(let i=0;i<26;i++){
   const x=i*57-30,ht=105+hash(i*917)%210;
   out+=R(x,358-ht,47,ht+110,["#18223a","#161e33","#212a45"][i%3]);
   out+=windows(x+8,370-ht,40,ht,91+i,17,22);
  }
  return out;
 }
 function street(){
  let out=R(0,0,W,H,"url(#sky)")+C(728,189,240,"url(#blueGlow)")+C(1005,210,280,"url(#redGlow)");
  out+=skyline();
  // Converging streets and dense balconies give a painted VN background
  out+=P("M0 0 H304 L498 448 L0 720Z","url(#wall)");
  out+=P("M1280 0 H966 L794 448 L1280 720Z","#20263c");
  out+=P("M490 421 L793 421 L1280 720 H0Z","url(#road)");
  out+=P("M0 0 H160 L390 445 L0 654Z","#283349");
  out+=P("M1280 0 H1126 L917 445 L1280 654Z","#3a293b");
  out+=windows(34,40,245,365,15,48,47)+windows(998,31,255,397,23,43,45);
  for(let k=0;k<6;k++){
   const y=65+k*61;
   out+=L(0,y,445,y+75,"#637087",3)+L(870,y+60,1280,y-40,"#635064",3);
  }
  // Rain canopies, shop windows, lanterns and vertical signs.
  out+=P("M0 347 L401 401 L424 434 L0 400Z","#a75f78");
  out+=L(0,355,415,425,"#f28c99",4);
  out+=P("M867 399 L1280 337 V392 L851 443Z","#b87165");
  out+=L(861,420,1280,359,"#ffb084",4);
  const signs=[
    [226,73,95,177,"茶","#f491ad"],[349,165,70,161,"館","#7dcfda"],[930,86,95,194,"夜","#f8879f"],
    [1061,215,74,165,"店","#ffd09d"],[414,231,48,117,"酒","#ab9cfd"]
  ];
  for(const [x,y,w,h,word,color] of signs){
   out+=R(x-12,y-14,w+24,h+28,color,'opacity=".29" filter="url(#neon)"');
   out+=R(x,y,w,h,"#172237",'stroke="'+color+'" stroke-width="3"');
   out+=TXT(x+w*.2,y+h*.52,word,color,Math.min(w*.7,52));
  }
  out+=TXT(540,174,"旺 角","#f3a2a8",68,'letter-spacing="8" opacity=".82"');
  out+=TXT(539,208,"MONG KOK","#b9d9e8",21,'letter-spacing="7"');
  for(let i=0;i<25;i++){
   const z=hash(i*809+445),x=z%1280,y=430+(z>>>13)%290;
   if(x>410&&x<820)out+=L(x,y,x+(z%4),y+6+(z%19),i%3?"#7dabb9":"#df738f",1.5);
  }
  for(let i=0;i<12;i++){
   const x=hash(i*367+13)%1280,y=515+hash(i*928+13)%210;
   out+=R(x,y,10+(i%4)*28,2,i%2?"#e17e98":"#7bbccd",'opacity=".5" filter="url(#soft)"');
  }
  // Pedestrians are non-interactive scenery, not suspect indicators.
  for(let i=0;i<15;i++){
   const x=476+i*22+(hash(i*12)%13),y=410+i*8.8,h=19+i*3.3;
   out+=C(x,y-h,3+i*.25,"#151b2b");
   out+=P(`M${x-4-i*.35} ${y-h+4}h${8+i*.7}v${h*.7}h-${8+i*.7}Z`,"#172337");
  }
  out+=C(999,122,255,"url(#redGlow)")+C(278,214,232,"url(#blueGlow)");
  return out+groundFog();
 }
 function diner(){
  let out=R(0,0,W,H,"#191b2b")+R(0,0,W,453,"url(#warm)");
  out+=R(150,43,980,384,"#202839")+R(162,55,958,365,"#111c2d");
  out+=skyline();
  out+=R(162,55,958,365,"#18223b",'opacity=".52"')+R(162,55,958,365,"url(#rain)");
  for(let i=0;i<5;i++)out+=R(155+i*194,50,10,379,"#6d5353");
  out+=R(150,421,980,15,"#a16f60");
  out+=P("M0 464 L1280 464 V720 H0Z","url(#floor)");
  for(let i=0;i<8;i++)out+=L(i*171,465,640+(i-4)*220,720,"#5e5960",2);
  // Counter and glass cases.
  out+=P("M0 505L500 469L620 561L0 639Z","#523c3b");
  out+=P("M0 513L485 480L511 506L0 563Z","#a97865");
  out+=R(48,539,337,76,"#704d4a");
  for(let k=0;k<5;k++)out+=R(61+k*62,548,43,51,"#3d363f",'stroke="#a17a60" stroke-width="2"');
  for(let k=0;k<4;k++){
   const x=710+k*146;
   out+=R(x,503,94,14,"#916955")+R(x+43,517,8,90,"#5c4845");
   out+=R(x+12,533,72,49,"#4a3942",'rx="15"');
  }
  for(let i=0;i<4;i++){
   const x=260+i*253;
   out+=L(x,0,x,124,"#816875",5)+C(x,138,58,"url(#goldGlow)");
   out+=P(`M${x-37} 115 Q${x} 161 ${x+37} 115 L${x+29} 148 Q${x} 165 ${x-29} 148Z`,"#ac6d61");
   out+=C(x,149,9,"#fff1bd");
  }
  out+=R(105,119,152,75,"#693d47")+TXT(131,166,"茶餐廳","#e5aa84",36);
  out+=R(828,303,217,59,"#6d3a4c")+TXT(848,340,"LATE NIGHT","#ffcfaf",26);
  return out+groundFog();
 }
 function hotel(){
  let out=R(0,0,W,H,"#151a2a")+R(0,0,W,490,"url(#wall)");
  out+=R(201,72,873,380,"#6c626b")+R(218,89,840,340,"#25334e");
  for(let i=0;i<5;i++){const x=231+i*165;out+=R(x,91,10,354,"#a1979c");}
  out+=P("M0 448 H1280 V720 H0Z","url(#floor)");
  for(let i=0;i<11;i++)out+=L(i*130,449,640+(i-5)*210,720,"#a79a9899",2);
  for(let i=0;i<8;i++)out+=L(0,454+i*i*4,1280,454+i*i*4,"#a9a0a022",3);
  for(let i=0;i<4;i++){
   const x=84+i*360;
   out+=R(x,73,60,405,"#5b5965")+R(x+6,73,11,402,"#b8a08d");
   out+=P(`M${x-18} 74 Q${x+27} 25 ${x+80} 74Z`,"#ad9997");
   out+=R(x-11,429,84,36,"#8a7d83");
  }
  out+=P("M393 468L877 468L1021 670H259Z","#2a2c38");
  out+=P("M390 474H874L893 543H364Z","#8b6262")+R(398,476,470,14,"#d2a77f");
  for(let i=0;i<5;i++)out+=R(435+i*83,520,53,99,"#2d333d",'stroke="#a58c76" stroke-width="3"');
  out+=R(517,153,243,74,"#302c42",'stroke="#e1b88c" stroke-width="3"');
  out+=TXT(543,202,"VICTORIA","#e5c29e",41,'letter-spacing="4"');
  for(let i=0;i<7;i++){
   const x=550+i*33;
   out+=L(x,0,x-1,71,"#968a8c",2)+C(x,74,7,"#f7d6ac");
  }
  out+=C(640,119,220,"url(#goldGlow)");
  return out+groundFog();
 }
 function shrine(){
  let out=R(0,0,W,H,"#111a27")+R(0,0,W,H,"url(#sky)");
  out+=skyline();
  out+=P("M0 468 L1280 468 V720 H0Z","#343e44");
  out+=P("M0 85 L1280 85 L1144 167 H134Z","#553841");
  out+=P("M0 126 L1280 126 L1210 150 H70Z","#a9665a");
  for(const x of [70,210,1050,1185]){
   out+=R(x,142,44,519,"#8c4c50");
   out+=R(x+7,144,12,515,"#b66f68");
   out+=P(`M${x-12} 140h68l-10 23h-49Z`,"#d4a078");
  }
  out+=R(319,180,651,329,"#302c34")+R(330,192,630,303,"#4b3e3e");
  out+=R(449,233,390,222,"#1f2732");
  out+=R(495,246,292,186,"#674750");
  out+=C(644,332,110,"url(#goldGlow)");
  out+=P("M500 415Q644 273 789 415Z","#b78a65");
  out+=P("M557 412Q644 345 732 412Z","#273940");
  out+=R(535,430,215,19,"#9a745b");
  for(const [x,y] of [[280,197],[1004,197],[163,270],[1110,270]]){
   out+=L(x,y-40,x,y,"#eed4a2",3)+C(x,y+11,30,"url(#redGlow)");
   out+=P(`M${x-23} ${y-9}Q${x} ${y-22} ${x+23} ${y-9}L${x+19} ${y+34}Q${x} ${y+45} ${x-19} ${y+34}Z`,"#be555d");
   out+=L(x-17,y-2,x+17,y-2,"#e7ac85",2);
  }
  for(let i=0;i<8;i++){const x=430+i*57,y=518+i%3*5;out+=L(x,y,x-8,y-62,"#b98d71",2);out+=C(x-8,y-62,8,"url(#goldGlow)");}
  out+=P("M0 615L1280 615V720H0Z","#504848");
  return out+groundFog();
 }
 function apartment(){
  let out=R(0,0,W,H,"#131d2e")+R(0,0,W,496,"url(#wall)");
  out+=R(495,49,511,392,"#665c62")+R(507,60,487,369,"#15243b");
  out+=skyline();
  out+=R(506,60,488,372,"url(#rain)")+R(491,52,19,387,"#a58d87")+R(752,51,15,389,"#b19b89");
  out+=R(496,427,506,22,"#b2948f");
  out+=P("M0 460H1280V720H0Z","url(#floor)");
  out+=R(0,502,432,150,"#3c3b4c")+R(0,488,463,39,"#635363");
  out+=P("M0 510L421 510L494 606H0Z","#88737a");
  out+=R(84,507,230,26,"#c6a9a0")+R(86,532,217,20,"#a4857e");
  out+=R(919,475,361,23,"#9c7768")+R(957,496,21,160,"#5b4848")+R(1211,496,18,160,"#594847");
  out+=R(1030,388,119,89,"#263b4d")+R(1052,402,81,53,"#6b88a0");
  out+=R(110,123,213,13,"#86646a")+R(115,137,17,252,"#6c4e5b")+R(301,137,14,252,"#6c4e5b");
  for(let i=0;i<5;i++)out+=R(141+i*31,145,20,36,["#8d5a66","#435e78","#b49b81"][i%3]);
  out+=L(1054,478,1097,359,"#c89c86",7)+C(1097,356,24,"#ffdfb5");
  out+=C(1108,345,160,"url(#goldGlow)");
  return out+groundFog();
 }
 function placeArt(id){
  const parts={street,diner,hotel,shrine,apartment};
  return PRE+defs+(parts[id]||street)()+'</svg>';
 }
 function portrait(id,cast){
  const d=cast[id],a=d?.appearance||{hair:"#282633",coat:"#61758e",skin:"#ddb198",style:1};
  const h=a.hair,coat=a.coat,skin=a.skin;
  const male=a.style>=3,older=id==="yuen",long=!male,eyeColor=id==="iris"?"#9d8fbd":"#758e97";
  const face=older?"M140 185Q150 106 244 117Q328 117 340 203Q335 319 245 365Q144 335 137 238Z":
    "M140 181Q160 100 244 111Q335 105 345 197Q341 311 248 362Q153 332 141 238Z";
  const hairBack=long?
    "M101 327Q97 180 113 117Q134 48 231 45Q361 37 385 173Q397 288 410 580Q355 637 321 590Q335 389 324 325Q226 402 140 331L142 609Q102 634 74 573Z":
    "M132 258Q106 173 128 103Q153 40 245 43Q348 33 375 151L350 254Q337 194 315 148Q235 174 158 158Z";
  const fringe=id==="keira"?
   "M126 170Q119 98 198 74Q274 30 352 111Q317 113 291 172Q272 112 230 121Q192 188 130 197Z":
   id==="iris"?"M125 175Q163 59 256 67Q328 73 364 154Q315 128 301 202Q280 145 246 133Q206 208 127 205Z":
   id==="ada"?"M124 181Q133 70 250 73Q331 71 367 172Q312 151 298 193Q254 139 223 163Q179 199 128 206Z":
   "M121 187Q119 77 251 60Q351 64 373 164Q324 141 294 156Q267 132 234 153Q188 186 134 190Z";
  const coatDark="#253547", shirt=male?"#eee6df":"#ece3e2";
  const mouth=older?'M228 311Q254 306 275 311':'M233 310Q253 322 275 308';
  const eyes=`<path d="M168 235Q192 214 222 232" fill="none" stroke="#362c38" stroke-width="6" stroke-linecap="round"/>
  <path d="M270 232Q302 210 325 233" fill="none" stroke="#362c38" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="196" cy="238" rx="12" ry="17" fill="#f6eee7"/>
  <ellipse cx="299" cy="238" rx="12" ry="17" fill="#f6eee7"/>
  <ellipse cx="196" cy="239" rx="8" ry="13" fill="${eyeColor}"/>
  <ellipse cx="299" cy="239" rx="8" ry="13" fill="${eyeColor}"/>
  <ellipse cx="195" cy="241" rx="4" ry="10" fill="#263642"/>
  <ellipse cx="299" cy="241" rx="4" ry="10" fill="#263642"/>
  <circle cx="192" cy="234" r="3" fill="#fff9ef"/><circle cx="296" cy="234" r="3" fill="#fff9ef"/>
  <path d="M166 220Q193 205 223 218 M269 215Q299 202 326 219" fill="none" stroke="${h}" stroke-width="4" stroke-linecap="round" opacity=".86"/>`;
  const individual= id==="vincent"?
    '<path d="M190 426L249 532L298 426" fill="#f8f4ed"/><path d="M245 447L264 459L255 543L235 540L225 464Z" fill="#9e677b"/><path d="M247 526l-9 16l12 17l12-17Z" fill="#a7a0bc"/>':
    id==="yuen"?
    '<path d="M149 415Q245 463 342 415L381 649H111Z" fill="#596a62"/><path d="M187 407Q248 457 302 408" fill="none" stroke="#c3b09a" stroke-width="9"/><path d="M167 274Q176 308 183 325 M312 271Q308 308 300 331" fill="none" stroke="#9f705f" stroke-width="2" opacity=".5"/>':
    id==="keira"?
    '<path d="M172 428L249 514L324 431" fill="#f3dbd8"/><path d="M187 488Q246 550 311 488L327 650H174Z" fill="#bd6b72"/><path d="M199 425L248 454L284 425" fill="none" stroke="#dbc5b9" stroke-width="5"/>':
    id==="iris"?
    '<path d="M173 434L244 510L319 432" fill="#eee6f2"/><path d="M160 540Q247 581 342 540L365 657H135Z" fill="#6d6f98"/>':
    id==="marcus"?
    '<path d="M181 422L250 510L315 422" fill="#d5dce1"/><path d="M121 501Q238 551 369 500" fill="none" stroke="#c59a6c" stroke-width="10"/>':
    '<path d="M176 434L250 516L323 436" fill="#ede7dd"/><path d="M204 444L250 480L292 446" fill="none" stroke="#b6a6a0" stroke-width="4"/>';
  const glasses=id==="daniel"||id==="yuen"?
    '<rect x="164" y="226" width="60" height="35" rx="13" fill="none" stroke="#443e45" stroke-width="4"/><rect x="270" y="226" width="57" height="35" rx="13" fill="none" stroke="#443e45" stroke-width="4"/><path d="M226 238Q247 229 269 238" stroke="#443e45" stroke-width="4" fill="none"/>':'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 660" preserveAspectRatio="xMidYMax meet">
  <defs>
    <linearGradient id="skin" x2=".2" y2="1"><stop stop-color="${skin}"/><stop offset=".65" stop-color="${skin}"/><stop offset="1" stop-color="#986b62"/></linearGradient>
    <linearGradient id="fabric" x2="1" y2=".9"><stop stop-color="${coat}"/><stop offset="1" stop-color="${coatDark}"/></linearGradient>
    <linearGradient id="hair" x2=".75" y2="1"><stop stop-color="${h}"/><stop offset="1" stop-color="#151723"/></linearGradient>
    <filter id="shadow"><feGaussianBlur stdDeviation="13"/></filter>
    <linearGradient id="faceShade"><stop stop-color="#fff8e4" stop-opacity=".15"/><stop offset="1" stop-color="#784958" stop-opacity=".2"/></linearGradient>
  </defs>
  <ellipse cx="249" cy="634" rx="174" ry="17" fill="#02030b" opacity=".35" filter="url(#shadow)"/>
  <path d="${hairBack}" fill="url(#hair)" stroke="#161928" stroke-width="6"/>
  <path d="M113 470Q141 397 197 390L244 406L291 386Q353 393 384 470L450 659H41Z" fill="url(#fabric)" stroke="#22303d" stroke-width="7"/>
  <path d="M209 339L207 403Q246 448 288 401L285 333Z" fill="url(#skin)"/>
  <path d="${face}" fill="url(#skin)" stroke="#bb8b7a" stroke-width="2.5"/>
  <path d="${face}" fill="url(#faceShade)" opacity=".6"/>
  <path d="M156 270Q165 283 183 285 M312 282Q329 281 336 267" fill="none" stroke="#ad796d" opacity=".45" stroke-width="3"/>
  ${eyes}
  <path d="M249 238Q244 270 240 277L252 281" fill="none" stroke="#a77971" stroke-width="2.5" stroke-linecap="round"/>
  <path d="${mouth}" fill="none" stroke="#a3686c" stroke-width="3.6" stroke-linecap="round"/>
  <path d="M236 316Q252 324 270 315" fill="none" stroke="#dca3a0" stroke-width="1.5" opacity=".6"/>
  <path d="${fringe}" fill="url(#hair)" stroke="#252232" stroke-width="3"/>
  <path d="M149 155Q139 235 150 301 M332 146Q345 233 333 306" fill="none" stroke="#62505a" stroke-width="3" opacity=".65"/>
  ${individual}${glasses}
  <path d="M155 447Q182 488 180 657 M341 443Q310 500 311 659" fill="none" stroke="#a6a3af" stroke-width="2" opacity=".4"/>
  <path d="M105 658H410" stroke="#101825" stroke-width="3"/>
 </svg>`;
 }
 const asURL=markup=>"data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(markup);
 const scenes={apartment:asURL(placeArt("apartment")),street:asURL(placeArt("street")),
  diner:asURL(placeArt("diner")),hotel:asURL(placeArt("hotel")),shrine:asURL(placeArt("shrine"))};
 const cache=new Map();
 function character(id,cast){
  if(!cache.has(id))cache.set(id,asURL(portrait(id,cast)));
  return cache.get(id);
 }
 return {scenes,character,portrait,placeArt};
});
