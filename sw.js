// Offline-Betrieb: Seite und Icons werden beim Besuch gespeichert. Online gilt immer die neueste Fassung, offline die gespeicherte.
var C = "italo-v1";
var START = ["./", "./index.html", "./italienisch-trainer.html", "./manifest.webmanifest", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(C).then(function (c) { return Promise.all(START.map(function (u) { return c.add(u).catch(function () {}); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var r = e.request; if (r.method !== "GET") return;
  var u = new URL(r.url); if (u.origin !== location.origin) return;
  if (u.search.indexOf("chk=") !== -1) return; // Versionsabfrage nie aus dem Speicher
  if (!(r.mode === "navigate" || /\.(html|webmanifest|png)$/.test(u.pathname) || /\/$/.test(u.pathname))) return;
  var key = u.origin + u.pathname;
  e.respondWith(
    fetch(r, { cache: "no-cache" }).then(function (res) {
      if (res && res.ok) { var cp = res.clone(); caches.open(C).then(function (c) { c.put(key, cp); }); }
      return res;
    }).catch(function () {
      return caches.match(key).then(function (m) { return m || caches.match(u.origin + u.pathname.replace(/[^\/]*$/, "") + "index.html") || caches.match(u.origin + u.pathname.replace(/[^\/]*$/, "")); });
    })
  );
});
