// Online: fetch the newest version (giving up after 4 seconds) and refresh the saved copy.
// Offline or slow: use the saved copy.
const C = 'sie-v3';
const F = ['./', 'index.html', 'manifest.json', 'icon.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(C).then(c => c.addAll(F)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
function fromCache(req) {
  return caches.match(req, {ignoreSearch: true}).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : undefined));
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(new Promise(resolve => {
    let done = false;
    const fallback = () => { if (!done) { done = true; fromCache(req).then(r => resolve(r || Response.error())); } };
    const timer = setTimeout(fallback, 4000);
    fetch(req.url, {cache: 'no-cache'}).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(req.url, cp)); }
      clearTimeout(timer);
      if (!done) { done = true; resolve(res); }
    }).catch(() => { clearTimeout(timer); fallback(); });
  }));
});
