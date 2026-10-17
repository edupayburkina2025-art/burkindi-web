/* Burkindi — fonctionnement hors ligne (service worker), version 1.8.1.
   La nouvelle version s'installe en arrière-plan puis attend : l'application
   affiche « Nouvelle version disponible » et l'utilisateur choisit le moment
   (message MISE_A_JOUR). Le message VERSION renvoie le numéro de version. */
const VERSION="1.10";
const CACHE="burkindi-"+VERSION;
const FICHIERS=["./","index.html","manifest.webmanifest","icone-192.png","icone-512.png","icone-masquable-512.png","icone-apple-180.png"];

self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    return c.addAll(FICHIERS.map(function(f){ return new Request(f,{cache:"reload"}); }));
  }));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(l){
    return Promise.all(l.filter(function(k){ return k.indexOf("burkindi-")===0&&k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("message",function(e){
  const d=e.data||{};
  if(d.type==="MISE_A_JOUR") self.skipWaiting();
  else if(d.type==="VERSION"&&e.ports&&e.ports[0]) e.ports[0].postMessage(VERSION);
});
self.addEventListener("fetch",function(e){
  const r=e.request;
  if(r.method!=="GET") return;
  const u=new URL(r.url);
  if(u.origin!==location.origin) return;            /* WhatsApp, service SMS… : jamais mis en cache */
  if(r.mode==="navigate"){
    e.respondWith(caches.match("index.html").then(function(m){ return m||fetch(r); }));
    return;
  }
  e.respondWith(caches.match(r).then(function(m){ return m||fetch(r); }));
});
