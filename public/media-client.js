// ahmadkhan D1 media client
// Images: reject >5MB source, resize/re-encode to <=5MB.
// D1: Worker stores chunks because one D1 BLOB/row is limited to 2MB.
export async function compressImage(file, maxBytes=5*1024*1024){
  if(!file.type.startsWith("image/")) throw new Error("image_required");
  if(file.size>25*1024*1024) throw new Error("source_too_large");
  const bmp=await createImageBitmap(file);
  const canvas=document.createElement("canvas");
  let scale=Math.min(1,1600/Math.max(bmp.width,bmp.height));
  canvas.width=Math.max(1,Math.round(bmp.width*scale));
  canvas.height=Math.max(1,Math.round(bmp.height*scale));
  canvas.getContext("2d").drawImage(bmp,0,0,canvas.width,canvas.height);
  let quality=.86, blob=await new Promise(r=>canvas.toBlob(r,"image/jpeg",quality));
  while(blob.size>maxBytes && quality>.35){
    quality-=.07;
    blob=await new Promise(r=>canvas.toBlob(r,"image/jpeg",quality));
  }
  if(blob.size>maxBytes) throw new Error("cannot_compress_under_5mb");
  return new File([blob],file.name.replace(/\.[^.]+$/,"")+".jpg",{type:"image/jpeg"});
}
export async function uploadD1Media(file,fetcher=fetch){
  const init=await (await fetcher("/api/media/init",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:file.name,type:file.type,size:file.size})})).json();
  if(!init.media_id) throw new Error(init.error||"media_init_failed");
  const chunkSize=init.chunk_size||1500000;
  for(let part=0,offset=0;offset<file.size;part++,offset+=chunkSize){
    const buf=await file.slice(offset,offset+chunkSize).arrayBuffer();
    let s=""; const u=new Uint8Array(buf);
    for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode(...u.subarray(i,i+0x8000));
    const b64=btoa(s);
    const r=await fetcher("/api/media/chunk",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({media_id:init.media_id,part,data_b64:b64})});
    if(!r.ok) throw new Error("chunk_failed");
  }
  await fetcher("/api/media/complete",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({media_id:init.media_id})});
  return init.media_id;
}
