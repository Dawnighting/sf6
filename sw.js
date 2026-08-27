/* 街霸6 服务站 Service Worker：离线缓存 */
var CACHE = "sf6-v4.1";
var ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/config.js",
  "./js/pricing.js",
  "./js/app.js",
  "./manifest.webmanifest",
  "./images/icon-192.png",
  "./images/icon-512.png",
  "./images/apple-touch-icon.png",
  "./images/cq-avatar.png",
  "./images/cy-avatar.jpg",
  "./images/bb06-avatar.jpg",
  "./images/bluebird-avatar.jpg",
  "./images/daji-avatar.png",
  "./images/daosikesi-avatar.png",
  "./images/dible-avatar.jfif",
  "./images/gaowang-avatar.jfif",
  "./images/langgou-avatar.jfif",
  "./images/langgou-avatar.jpg",
  "./images/lovebanana-avatar.png",
  "./images/neo-avatar.jpg",
  "./images/shi-qu-avatar.jfif",
  "./images/shi-qu-avatar.jpg",
  "./images/xialuote-avatar.jfif",
  "./images/xinyuan-avatar.jfif",
  "./images/xinyuan-avatar.jpg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (cache) { return cache.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(e.request, copy); });
        return res;
      }).catch(function () {
        return caches.match("./index.html");
      });
    })
  );
});
