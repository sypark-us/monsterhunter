/* THE HUNDRED v0.3: real photographs + the generated painted cast.
 * Artwork selection never reads possession, suspicion, or story flags.
 * Photo originals and license attribution are in credits.html.
 */
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.HundredVisuals=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const VERSION='0.3';
  const photos={
    apartment:{id:20434544,author:'terry narcissan tsui',title:'Stairs on a Staircase in Shadow',page:'https://www.pexels.com/photo/stairs-on-a-staircase-in-shadow-20434544/',position:'50% 52%',download:'https://images.pexels.com/photos/20434544/pexels-photo-20434544.jpeg?cs=srgb&dl=pexels-narcissan-20434544.jpg&fm=jpg'},
    street:{id:7287145,author:'Jimmy Chan',title:'Neon Signs on the Street at Night',page:'https://www.pexels.com/photo/neon-signs-on-the-street-at-night-7287145/',position:'50% 46%',download:'https://images.pexels.com/photos/7287145/pexels-photo-7287145.jpeg?cs=srgb&dl=pexels-jimbear-7287145.jpg&fm=jpg'},
    diner:{id:26837033,author:'Jonas F',title:'Stylish Restaurant',page:'https://www.pexels.com/photo/stylish-restaurant-26837033/',position:'50% 50%'},
    hotel:{id:38820595,author:'Guillaume Kremer',title:'Luxurious Hotel Lobby with Golden Details',page:'https://www.pexels.com/photo/luxurious-hotel-lobby-with-golden-details-38820595/',position:'50% 62%',download:'https://images.pexels.com/photos/38820595/pexels-photo-38820595/free-photo-of-luxurious-hotel-lobby-with-golden-details.jpeg?auto=compress&dpr=1&h=750&w=1260'},
    shrine:{id:6531108,author:'John Lee',title:'Traditional Asian Temple',page:'https://www.pexels.com/photo/traditional-asian-temple-with-hieroglyphs-and-decorative-elements-6531108/',position:'50% 48%',download:'https://images.pexels.com/photos/6531108/pexels-photo-6531108.jpeg?cs=srgb&dl=pexels-john-6531108.jpg&fm=jpg'}
  };
  const frames=Object.freeze({ada:{column:0,row:0},keira:{column:1,row:0},iris:{column:2,row:0},vincent:{column:3,row:0},marcus:{column:0,row:1},daniel:{column:1,row:1},yuen:{column:2,row:1}});
  const expectedLengths=[9000,9000,9000,1840];
  const parts=root.HundredCastParts||[];
  if(expectedLengths.some((length,i)=>typeof parts[i]!=='string'||parts[i].length!==length)){
    throw new Error('Painted character artwork did not load completely. Refresh the page.');
  }
  const encoded=parts.join('');
  const atlas='data:image/avif;base64,'+encoded;
  const scenes=Object.fromEntries(Object.entries(photos).map(([key,p])=>[key,'https://images.pexels.com/photos/'+p.id+'/pexels-photo-'+p.id+'.jpeg?auto=compress&cs=tinysrgb&w=1600']));
  function frame(id){
    if(!Object.prototype.hasOwnProperty.call(frames,id))throw new Error('Unknown portrait: '+id);
    return frames[id];
  }
  function photoSources(place){
    if(!photos[place])throw new Error('Unknown scene: '+place);
    const p=photos[place];
    // Pages builds bundle photographs locally. Direct checkouts can use the CDN.
    return Array.from(new Set(['assets/backgrounds/'+place+'.jpg?v='+VERSION,scenes[place],p.download||'https://images.pexels.com/photos/'+p.id+'/pexels-photo-'+p.id+'.jpeg']));
  }
  return Object.freeze({VERSION,photos,scenes,frames,atlas,encoded,frame,photoSources,atlasWidth:1152,atlasHeight:768,atlasSha256:'a3daf89c9e373f907ce9adeadd169b60cf37530b3abbaa259d168ea74b2fa5e8'});
});
