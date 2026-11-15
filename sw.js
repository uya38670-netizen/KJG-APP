// 오프라인 실행용 서비스워커 (설비이상 등록대장)
// 앱을 수정해 올릴 때 VERSION 숫자를 올리면 폰에 새 버전이 확실히 반영됩니다.
var VERSION = "v5.0-1";
var CACHE = "fault-reg-" + VERSION;
var FILES = ["./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k.indexOf("fault-reg-") === 0 && k !== CACHE; })
      .map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
// 온라인이면 최신 파일 우선, 오프라인이면 저장된 파일 사용
self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, { cache: "no-cache" }).then(function(res){
      if(res && res.ok){ var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); }
      return res;
    }).catch(function(){
      return caches.match(req, { ignoreSearch: true }).then(function(m){ return m || caches.match("./index.html"); });
    })
  );
});
