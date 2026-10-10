'use strict';
const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
for(let i=0;i<4;i++)require('../assets/cast-part-'+i+'.js');
const art=require('../src/visual-assets.js');
const directory=path.join(__dirname,'../assets/backgrounds');
async function download(place){
  const sources=art.photoSources(place).filter(url=>url.startsWith('https:'));
  let lastError;
  for(const source of sources){
    try{
      const response=await fetch(source,{signal:AbortSignal.timeout(35000),headers:{'User-Agent':'TheHundred-ArtBuild/0.3','Accept':'image/jpeg,image/*;q=0.8'}});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const type=response.headers.get('content-type')||'';
      if(!type.startsWith('image/'))throw new Error('Not an image: '+type);
      const bytes=Buffer.from(await response.arrayBuffer());
      if(bytes.length<1000||bytes.length>30000000)throw new Error('Unexpected image size '+bytes.length);
      await fs.writeFile(path.join(directory,place+'.jpg'),bytes);
      console.log('Downloaded '+place+': '+bytes.length+' bytes');
      return {place,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),source,author:art.photos[place].author,credit:art.photos[place].page};
    }catch(error){lastError=error;console.warn(place+' source failed: '+source+' ('+error.message+')');}
  }
  throw new Error('Could not obtain licensed '+place+' photograph: '+lastError?.message);
}
(async()=>{
  await fs.mkdir(directory,{recursive:true});
  const manifest=[];
  // Keep download concurrency modest; never publish incomplete photo assets.
  const places=Object.keys(art.photos);
  for(let i=0;i<places.length;i+=2){manifest.push(...await Promise.all(places.slice(i,i+2).map(download)));}
  await fs.writeFile(path.join(directory,'manifest.json'),JSON.stringify({version:art.VERSION,license:'https://www.pexels.com/license/',photos:manifest},null,2));
  const decoded=Buffer.from(art.encoded,'base64');
  if(crypto.createHash('sha256').update(decoded).digest('hex')!==art.atlasSha256)throw new Error('Painted atlas integrity failure');
  console.log('All five photos bundled; painted atlas integrity checked.');
})().catch(error=>{console.error(error);process.exitCode=1});
