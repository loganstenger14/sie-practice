// Online: fetch the newest version and refresh the saved copy. Offline: use the saved copy.
const C = 'sie-v2';
const F = ['./', 'index.html', 'manifest.json', 'icon.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(C).then(c => c.addAll(F)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(res => {
    const cp = res.clone(); caches.open(C).then(c => c.put(e.request, cp)); return res;
  }).catch(() => caches.match(e.request, {ignoreSearch: true})));
});
