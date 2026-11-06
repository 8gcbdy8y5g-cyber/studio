// Studio Service Worker: App-Dateien zwischenspeichern, damit die App auch ohne Netz startet.
// Erst Netz (neue Version kommt sofort an), ohne Netz die gespeicherte Datei. Die Daten puffert Firebase selbst.
// v3 (31.10.2026): Logo „Horizont“, neue Icons und die Reel-Werkstatt (werkstatt.html).
// v4 (31.10.2026): iPad/iPhone ohne dauerhaften Datenbank-Zwischenspeicher (Safari hing beim Laden).
// v5 (04.11.2026): Schnittstil Kalyl mit Motiv-Erkennung im Browser (Modelle von jsDelivr und Google, u2netp im Ordner models).
// v6 (04.11.2026): Pro-Schnitt in der Werkstatt (Knopf PRO).
// v7 (04.11.2026): Freistellung Version 2, Stile Geschnitten und Gespiegelt.
// v8 (04.11.2026): Wasserzeichen standardmäßig aus.
// v11 (04.11.2026): Stil Futurist, Freistellung V3 mit ISNet. Modelle (models/) liegen in einem eigenen Speicher und werden nur einmal geladen.
// v12 (05.11.2026): Stil Recap für Monatsrückblicke.
// v13 (05.11.2026): Recap legt die Bilder auf die echten Schläge der gewählten Musik.
// v14 (05.11.2026): Schriften und Textfarbe wählbar (Werkstatt und Pro).
// v15 (05.11.2026): Flüssige Vorschau: eigener Abspieler je Einsatz, Freistellung pausiert beim Abspielen, schnellere Schatten.
// v16 (05.11.2026): Pro-Schnitt mit Ebenen (Bild im Bild, Polaroid, Kreis, Freisteller, Farbfläche, Verlauf) und Fehlerbehebungen
// v17 (05.11.2026): Vorschau hängt nicht mehr bei Videos, deren erstes Bild nicht bei 0 s liegt (schwarzes Bild im Pro-Schnitt); Wächter für hängende Videos
// v18 (05.11.2026): Stil Ortstitel (Streifen, Vorhang, Ort tippt sich ein, Flicker unten, harte Schnitte)
// v19 (06.11.2026): Stil Beschlagen (nasse Scheibe, Ort als Fenster, Pinsel legt frei)
// v20 (06.11.2026): Beschlagen ohne dunklen Rand um die Buchstaben
const CACHE = 'studio-v20';
const MODELLE = 'studio-modelle-1';
const DATEIEN = ['./', './index.html', './werkstatt.html', './studio-firebase.js', './firebase-config.js', './manifest.webmanifest',
  './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './favicon-32.png'];
const FREMD = ['https://www.gstatic.com', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net', 'https://storage.googleapis.com'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== MODELLE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const herkunft = new URL(r.url).origin;
  if (herkunft !== location.origin && !FREMD.includes(herkunft)) return;
  if (herkunft === location.origin && new URL(r.url).pathname.includes('/models/')) {
    e.respondWith(caches.open(MODELLE).then(c => c.match(r).then(g => g || fetch(r).then(a => { if (a.ok) c.put(r, a.clone()); return a; }))));
    return;
  }
  e.respondWith(fetch(r).then(a => { if (a.ok || a.type === 'opaque') { const k = a.clone(); caches.open(CACHE).then(c => c.put(r, k)); } return a; })
    .catch(() => caches.match(r, { ignoreSearch: true }).then(g => g || (r.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
