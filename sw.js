const CACHE='registro-bagno-v11';
const FILES=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    // File dell'app: prima la rete (cosi' gli aggiornamenti arrivano subito), cache solo se offline
    e.respondWith(fetch(r).then(res=>{
      if(res&&res.ok){const copia=res.clone();caches.open(CACHE).then(c=>c.put(r,copia));}
      return res;
    }).catch(()=>caches.match(r,{ignoreSearch:true}).then(x=>x||caches.match('./index.html'))));
  }else if(u.hostname==='www.gstatic.com'){
    // Librerie Firebase: dalla cache se ci sono, altrimenti rete e poi salvate
    e.respondWith(caches.match(r).then(x=>x||fetch(r).then(res=>{
      const copia=res.clone();caches.open(CACHE).then(c=>c.put(r,copia));return res;
    })));
  }
  // tutto il resto (database in tempo reale) passa direttamente, senza cache
});
