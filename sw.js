// Studio Service Worker: App-Dateien zwischenspeichern, damit die App auch ohne Netz startet.
// Erst Netz (neue Version kommt sofort an), ohne Netz die gespeicherte Datei. Die Daten puffert Firebase selbst.
const CACHE = 'studio-v2';
const DATEIEN = ['./', './index.html', './studio-firebase.js', './firebase-config.js', './manifest.webmanifest',
  './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './favicon-32.png'];
const FREMD = ['https://www.gstatic.com', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const herkunft = new URL(r.url).origin;
  if (herkunft !== location.origin && !FREMD.includes(herkunft)) return;
  e.respondWith(fetch(r).then(a => { if (a.ok || a.type === 'opaque') { const k = a.clone(); caches.open(CACHE).then(c => c.put(r, k)); } return a; })
    .catch(() => caches.match(r, { ignoreSearch: true }).then(g => g || (r.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
