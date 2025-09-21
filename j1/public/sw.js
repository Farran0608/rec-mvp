const CACHE='rec-mvp-v1',ASSETS=['/','/index.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url); if(u.pathname==='/'||u.pathname.startsWith('/sw.js')){e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))}})
