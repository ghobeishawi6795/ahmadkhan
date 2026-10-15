const CACHE='ahmadkhan-static-v29';
const CORE=['/','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png','/icons/icon-maskable-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url);
 if(u.pathname==='/share'&&event.request.method==='POST'){event.respondWith((async()=>{try{const fd=await event.request.formData(),files=fd.getAll('media').filter(f=>f&&f.size),text=[fd.get('title'),fd.get('text'),fd.get('url')].filter(Boolean).join('\n'),c=await caches.open('ak-share');for(const k of await c.keys())await c.delete(k);let i=0;for(const f of files)await c.put('/_share/'+(i++),new Response(f,{headers:{'content-type':f.type||'application/octet-stream','x-name':encodeURIComponent(f.name||'file')}}));await c.put('/_share/meta',new Response(JSON.stringify({n:i,text})))}catch{}return Response.redirect('/?share=1',303)})());return}
 if(u.pathname.startsWith('/api/')||event.request.method!=='GET'||u.origin!==location.origin) return;
 event.respondWith(caches.open(CACHE).then(async c=>{const cached=await c.match(event.request);const net=fetch(event.request).then(r=>{if(r&&r.ok)c.put(event.request,r.clone());return r}).catch(()=>null);if(cached){event.waitUntil(net);return cached}const r=await net;return r||(await c.match('/'))||Response.error()}));
});

self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(l=>l[0]?l[0].focus():clients.openWindow('/')))});

self.addEventListener('push',e=>e.waitUntil((async()=>{
 const cs=await clients.matchAll({type:'window',includeUncontrolled:true});if(cs.some(c=>c.visibilityState==='visible'))return;
 let items=[];try{const r=await fetch('/api/push/pending',{credentials:'include'});if(r.ok)items=await r.json()}catch{}
 if(!items.length)items=[{id:'x',name:'ahmadkhan',last:'پیام جدید'}];
 for(const it of items)await self.registration.showNotification(it.name,{body:it.last,icon:'/icons/icon-192.png',badge:'/icons/icon-192.png',tag:'chat'+it.id,renotify:true,dir:'rtl',lang:'fa'})
})()));
