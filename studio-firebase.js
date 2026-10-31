// Studio Sommer_gram als Web-App: Anmeldung und Speicher über Firebase (dasselbe Projekt wie SommerHaus).
// Die Studio-Daten liegen in eigenen Sammlungen mit dem Präfix "studio_", damit sie sich nicht mit SommerHaus mischen.
// Bilder liegen als komprimiertes JPEG (Base64) in "studio_bilder", geschützt durch dieselbe Anmeldung.
// Größere Dateien (Reels, Musik der Reel-Werkstatt) liegen in Teilen zu 900 KB: Kopf in "studio_dateien",
// Teile in "studio_dateiteile" (<id>_0, <id>_1, …). Der Kopf wird zuletzt geschrieben, halbe Dateien sieht niemand.
import { firebaseConfig } from './firebase-config.js';

const V = '10.12.2';
const BASE = 'https://www.gstatic.com/firebasejs/' + V + '/';
const P = 'studio_';

const css = `
.stl{position:fixed;inset:0;z-index:200;background:var(--bg);display:grid;place-items:center;padding:24px 16px;overflow:auto;transition:opacity .35s ease}
.stl[hidden]{display:none!important}.stl.out{opacity:0;pointer-events:none}
.stl-box{width:100%;max-width:360px;display:grid;gap:16px;text-align:center}
.stl-box img{width:88px;height:88px;margin:0 auto;border-radius:22px;box-shadow:0 4px 14px rgba(0,0,0,.25)}
.stl-box h1{font-size:30px;margin:0}
.stl-box p{color:var(--text-2);font-size:15px;margin:0}
.stl-form{display:grid;gap:10px;text-align:left}
.stl-form input[type=email],.stl-form input[type=password]{font:inherit;font-size:16px;border:0;border-radius:12px;background:var(--field);color:var(--text);padding:14px 16px;min-height:50px;width:100%}
.stl-form .btn{justify-content:center;min-height:50px;font-size:16px}
.stl-keep{display:flex;align-items:center;gap:10px;font-size:15px;padding:4px}
.stl-keep input{width:22px;height:22px;accent-color:var(--amber)}
.stl-err{color:var(--bad)!important;font-weight:600}
.stl-wait{display:flex;gap:10px;align-items:center;justify-content:center;color:var(--text-2)}
.stl-wait[hidden]{display:none}
.stl-spin{width:18px;height:18px;border-radius:50%;border:2.5px solid var(--field-2);border-top-color:var(--amber);animation:stlspin .8s linear infinite}
@keyframes stlspin{to{transform:rotate(360deg)}}
.stl-link{border:0;background:none;color:var(--accent);font:inherit;font-size:14px;font-weight:600;cursor:pointer;min-height:40px}
.appfoot{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;align-items:center;font-size:13px;color:var(--text-3);padding:8px 0 calc(8px + env(safe-area-inset-bottom,0px))}
.appfoot button{border:0;background:none;color:var(--text-2);font:inherit;text-decoration:underline;cursor:pointer;min-height:40px}
`;
const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
const el = h => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstChild; };
const screen = el(`<div class="stl" id="stLogin"><div class="stl-box">
  <img src="icon-192.png" alt="">
  <h1>Studio Sommer_gram</h1>
  <div class="stl-wait" id="stWait" role="status"><span class="stl-spin" aria-hidden="true"></span><span id="stWaitT">Wird geöffnet …</span></div>
  <p id="stMsg" hidden>Bitte melde dich an, wie bei SommerHaus.</p>
  <form class="stl-form" id="stForm" autocomplete="on" hidden>
    <input id="stEmail" type="email" autocomplete="username" placeholder="E-Mail" required>
    <input id="stPass" type="password" autocomplete="current-password" placeholder="Passwort" required>
    <label class="stl-keep"><input type="checkbox" id="stKeep" checked> Angemeldet bleiben</label>
    <button type="submit" class="btn" id="stGo">Anmelden</button>
  </form>
  <button type="button" class="stl-link" id="stReset" hidden>Passwort vergessen?</button>
</div></div>`);
document.body.appendChild(screen);
const $ = id => document.getElementById(id);
const msg = (t, err) => { const m = $('stMsg'); m.hidden = false; m.textContent = t; m.className = err ? 'stl-err' : ''; };
function showForm() { $('stWait').hidden = true; $('stForm').hidden = false; $('stReset').hidden = false; screen.hidden = false; screen.classList.remove('out'); }
function leave() {
  if (screen.hidden) return;
  $('stWaitT').textContent = 'Angemeldet. Einen Moment …'; $('stWait').hidden = false;
  $('stForm').hidden = true; $('stReset').hidden = true; $('stMsg').hidden = true;
  requestAnimationFrame(() => screen.classList.add('out')); setTimeout(() => { screen.hidden = true; }, 380);
}

const [{ initializeApp }, A, F] = await Promise.all([
  import(BASE + 'firebase-app.js'), import(BASE + 'firebase-auth.js'), import(BASE + 'firebase-firestore.js')
]);
const app = initializeApp(firebaseConfig);
const auth = A.getAuth(app);
let fs;
try { fs = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) }); }
catch (e) { fs = F.getFirestore(app); }

// Speicher im selben Format wie im Claude-Studio
const snapDocs = s => ({ docs: s.docs.map(d => ({ id: d.id, data: () => d.data() })) });
const snapDoc = d => ({ id: d.id, exists: d.exists(), data: () => d.data() });
function docApi(ref) {
  return { get: () => F.getDoc(ref).then(snapDoc), set: o => F.setDoc(ref, o), update: o => F.updateDoc(ref, o),
    delete: () => F.deleteDoc(ref), onSnapshot: (cb, err) => F.onSnapshot(ref, d => cb(snapDoc(d)), err) };
}
function colApi(name) {
  const ref = F.collection(fs, P + name);
  return { get: () => F.getDocs(ref).then(snapDocs), add: o => F.addDoc(ref, o), doc: id => docApi(F.doc(fs, P + name, id)),
    onSnapshot: (cb, err) => F.onSnapshot(ref, s => cb(snapDocs(s)), err) };
}
const db = Object.freeze({ collection: colApi });

// Bilder: verkleinern, als JPEG speichern, beim Anzeigen wieder laden
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
function b64ToBlob(b64, type) { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: type || 'image/jpeg' }); }
async function shrink(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    let max = 1600, q = .86, out = null;
    for (let k = 0; k < 6; k++) {
      const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', q));
      out = { blob, w: c.width, h: c.height };
      if (blob.size < 680000) break;
      max = Math.round(max * .85); q = Math.max(.7, q - .04);
    }
    return out;
  } finally { URL.revokeObjectURL(url); }
}
const toB64 = blob => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(String(fr.result).split(',')[1]); fr.readAsDataURL(blob); });
const assets = Object.freeze({
  async upload(file) {
    if (!/^image\//.test(file.type)) { const e = new Error('Nur Fotos'); e.code = 'too_large'; throw e; }
    const s = await shrink(file); const b64 = await toB64(s.blob); const id = uid();
    await F.setDoc(F.doc(fs, P + 'bilder', id), { b64, type: 'image/jpeg', w: s.w, h: s.h, at: new Date().toISOString() });
    window.__bildSet && window.__bildSet(id, URL.createObjectURL(s.blob));
    return { id, url: null };
  }
});
async function loadBild(id) {
  const ref = F.doc(fs, P + 'bilder', id);
  let d = null;
  try { d = await F.getDocFromCache(ref); if (!d.exists()) d = null; } catch (e) { d = null; }
  if (!d) d = await F.getDoc(ref);
  if (!d.exists()) return null;
  const x = d.data(); return URL.createObjectURL(b64ToBlob(x.b64, x.type));
}

// Dateien in Teilen (Videos, Musik): speichern, laden, löschen
const TEIL = 900000;
async function saveDatei(blob, o = {}) {
  const id = o.id || uid(); const type = o.type || blob.type || 'application/octet-stream';
  const u8 = new Uint8Array(await blob.arrayBuffer()); const n = Math.max(1, Math.ceil(u8.length / TEIL));
  for (let i = 0; i < n; i += 3) {
    const ks = []; for (let k = i; k < Math.min(n, i + 3); k++) ks.push(k);
    await Promise.all(ks.map(k => F.setDoc(F.doc(fs, P + 'dateiteile', id + '_' + k), { d: F.Bytes.fromUint8Array(u8.subarray(k * TEIL, (k + 1) * TEIL)), i: k, f: id })));
    if (o.progress) o.progress(Math.min(n, i + 3) / n);
  }
  await F.setDoc(F.doc(fs, P + 'dateien', id), { type, size: u8.length, n, name: o.name || '', at: new Date().toISOString() });
  DCACHE.set(id, Promise.resolve(new Blob([u8], { type })));
  return id;
}
const DCACHE = new Map();
function loadDatei(id) {
  if (DCACHE.has(id)) return DCACHE.get(id);
  const p = (async () => {
    const m = await F.getDoc(F.doc(fs, P + 'dateien', id));
    if (!m.exists()) { const url = await loadBild(id); return url ? await (await fetch(url)).blob() : null; }
    const x = m.data();
    const parts = await Promise.all(Array.from({ length: x.n }, (_, k) => F.getDoc(F.doc(fs, P + 'dateiteile', id + '_' + k))));
    if (parts.some(d => !d.exists())) throw new Error('Datei unvollständig');
    return new Blob(parts.map(d => d.data().d.toUint8Array()), { type: x.type });
  })();
  DCACHE.set(id, p); p.then(b => { if (!b) DCACHE.delete(id); }, () => DCACHE.delete(id));
  return p;
}
async function deleteDatei(id) {
  const m = await F.getDoc(F.doc(fs, P + 'dateien', id)); if (!m.exists()) return;
  const n = m.data().n || 0; await F.deleteDoc(F.doc(fs, P + 'dateien', id));
  for (let k = 0; k < n; k++) await F.deleteDoc(F.doc(fs, P + 'dateiteile', id + '_' + k));
  DCACHE.delete(id);
}
const files = Object.freeze({ save: saveDatei, load: loadDatei, del: deleteDatei });

// Für Claude (Morgen-Check, Einplanen in Instagram): Lesen und Schreiben über die angemeldete Seite
window.studioAPI = Object.freeze({
  list: async c => (await F.getDocs(F.collection(fs, P + c))).docs.map(d => { const x = { id: d.id, ...d.data() }; if (c === 'bilder') delete x.b64; return x; }),
  get: async (c, id) => { const d = await F.getDoc(F.doc(fs, P + c, id)); return d.exists() ? { id: d.id, ...d.data() } : null; },
  set: (c, id, o) => F.setDoc(F.doc(fs, P + c, id), o).then(() => 'ok'),
  update: (c, id, o) => F.updateDoc(F.doc(fs, P + c, id), o).then(() => 'ok'),
  del: (c, id) => F.deleteDoc(F.doc(fs, P + c, id)).then(() => 'ok'),
  who: () => auth.currentUser && auth.currentUser.email,
  // Reel-Video für das Einplanen in Instagram auf den Rechner laden (landet im Download-Ordner)
  datei: async id => { const d = await F.getDoc(F.doc(fs, P + 'dateien', id)); return d.exists() ? { id, ...d.data() } : null; },
  sichern: async (id, name) => { const b = await loadDatei(id); if (!b) return 'fehlt'; const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name || (id + '.mp4'); document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); return 'ok ' + b.size; }
});

// Einmaliger Umzug aus dem Claude-Studio: JSON-Dateien {collections:{name:{id:doc}}, bilder:{id:{b64,type,w,h}}}
async function importFiles(files) {
  let docs = 0, imgs = 0;
  for (const f of files) {
    const data = JSON.parse(await f.text());
    for (const [id, b] of Object.entries(data.bilder || {})) { await F.setDoc(F.doc(fs, P + 'bilder', id), b); imgs++; }
    for (const [id, b] of Object.entries(data.dateien || {})) { await saveDatei(b64ToBlob(b.b64, b.type), { id, type: b.type, name: b.name || '' }); imgs++; }
    // Große Dateien in Teilen über mehrere Import-Dateien: erst alle Teile, zuletzt die Köpfe
    for (const [id, k, b64] of (data.teile || [])) { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      await F.setDoc(F.doc(fs, P + 'dateiteile', id + '_' + k), { d: F.Bytes.fromUint8Array(u), i: k, f: id }); }
    for (const [id, m] of Object.entries(data.koepfe || {})) { await F.setDoc(F.doc(fs, P + 'dateien', id), m); DCACHE.delete(id); imgs++; }
    const writes = [];
    for (const [c, m] of Object.entries(data.collections || {})) for (const [id, o] of Object.entries(m)) writes.push([c, id, o]);
    for (let i = 0; i < writes.length; i += 300) {
      const b = F.writeBatch(fs); writes.slice(i, i + 300).forEach(([c, id, o]) => b.set(F.doc(fs, P + c, id), o)); await b.commit();
    }
    docs += writes.length;
  }
  return { docs, imgs };
}
window.__studioUser = null;
function addFooter(user) {
  window.__studioUser = user.email || '';
  if ($('stFoot')) return;
  const foot = el(`<footer class="appfoot" id="stFoot"><span>Angemeldet als <span id="stWho"></span></span>
    <button type="button" id="stImport">Daten importieren</button><button type="button" id="stOut">Abmelden</button>
    <input type="file" id="stFile" accept="application/json,.json" multiple hidden aria-label="Import-Dateien"><span id="stImpMsg" role="status"></span></footer>`);
  (document.querySelector('.wrap') || document.body).appendChild(foot);
  $('stWho').textContent = user.email || '';
  $('stOut').onclick = () => A.signOut(auth).then(() => location.reload());
  $('stImport').onclick = () => $('stFile').click();
  $('stFile').onchange = async ev => {
    const files = [...(ev.target.files || [])]; if (!files.length) return;
    $('stImpMsg').textContent = 'Import läuft …';
    try { const r = await importFiles(files); $('stImpMsg').textContent = `Import fertig: ${r.docs} Einträge, ${r.imgs} Bilder und Dateien`; }
    catch (e) { $('stImpMsg').textContent = 'Import fehlgeschlagen: ' + (e.code || e.message || 'Fehler'); }
    ev.target.value = '';
  };
}

try { if (localStorage.getItem('studio-keep') === '0') $('stKeep').checked = false; } catch (e) {}
let resolved = false;
A.onAuthStateChanged(auth, user => {
  if (user) {
    leave(); addFooter(user);
    if (!resolved) { resolved = true; window.__studioResolve({ db, assets, loadBild, files, user: { email: user.email } }); }
  } else { showForm(); msg('Bitte melde dich an, wie bei SommerHaus.'); }
});
$('stForm').addEventListener('submit', async ev => {
  ev.preventDefault(); const go = $('stGo'); go.disabled = true; msg('Anmeldung läuft …');
  try {
    const keep = $('stKeep').checked; try { localStorage.setItem('studio-keep', keep ? '1' : '0'); } catch (e) {}
    await A.setPersistence(auth, keep ? A.browserLocalPersistence : A.browserSessionPersistence);
    await A.signInWithEmailAndPassword(auth, $('stEmail').value.trim(), $('stPass').value);
  } catch (e) {
    const c = e.code || '';
    msg(c.includes('invalid') || c.includes('wrong') || c.includes('user-not-found') ? 'E-Mail oder Passwort stimmt nicht.'
      : c.includes('network') ? 'Keine Verbindung. Prüf das Internet und versuch es nochmal.'
      : c.includes('too-many') ? 'Zu viele Versuche. Warte ein paar Minuten.' : 'Anmeldung fehlgeschlagen (' + c + ').', true);
  }
  go.disabled = false;
});
$('stReset').addEventListener('click', async () => {
  const mail = $('stEmail').value.trim(); if (!mail) { msg('Trag zuerst deine E-Mail ein.', true); return; }
  try { await A.sendPasswordResetEmail(auth, mail); msg('Mail zum Zurücksetzen ist unterwegs an ' + mail + '.'); }
  catch (e) { msg('Konnte keine Mail senden (' + (e.code || 'Fehler') + ').', true); }
});
