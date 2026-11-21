/* Studio · Galerie (ab 6.11.2026, verdichtet am 21.11.2026)
   Drei Bereiche: Archiv, Werkstatt, Zahlen. Einstellungen als Zahnrad.
   iPhone: feste Leiste unten. Mac und iPad: Leiste oben. Wird nach dem Hauptskript geladen
   und baut nur die Navigation; Daten und Ansichten kommen aus index.html bzw. werkstatt.html. */
(function () {
  const isWerk = typeof vArchiv === 'undefined';
  const SUN = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#1A1917"/><path d="M9 20a7 7 0 0 1 14 0z" fill="#E07A45"/><path d="M7 22.5h18" stroke="#FBFAF7" stroke-width="1.5" stroke-linecap="round"/></svg>';
  const ICO = {
    archiv: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="8"/><rect x="13.5" y="3.5" width="7" height="8"/><rect x="3.5" y="14.5" width="7" height="6"/><rect x="13.5" y="14.5" width="7" height="6"/></svg>',
    werkstatt: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="2.5" width="13" height="19" rx="2.5"/><path d="M10.2 9.2v5.6l4.4-2.8z"/></svg>',
    zahlen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V11M12 20V5M19 20v-7"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>'
  };

  /* ---------- Navigation ---------- */
  function buildNav() {
    const nav = document.querySelector('nav.side');
    if (!nav) return;
    const base = isWerk ? 'index.html' : '';
    nav.className = 'side gx-nav';
    nav.innerHTML =
      `<a href="${base}#archiv" class="gx-brand" aria-label="Studio, zum Archiv">${SUN}<span>sommer_gram</span></a>` +
      `<a class="nv" href="${base}#archiv" data-v="archiv">${ICO.archiv}<span>Archiv</span></a>` +
      `<a class="nv" href="werkstatt.html" data-v="werkstatt">${ICO.werkstatt}<span>Werkstatt</span></a>` +
      `<a class="nv" href="${base}#zahlen" data-v="analytics">${ICO.zahlen}<span>Zahlen</span></a>` +
      `<a class="nv gx-gear" href="${base}#einstellungen" data-v="einstellungen" aria-label="Einstellungen">${ICO.gear}</a>`;
    if (isWerk) {
      nav.querySelector('[data-v="werkstatt"]').setAttribute('aria-current', 'page');
      const row = document.querySelector('header.top');
      if (row && !row.querySelector('.gx-hgear')) row.insertAdjacentHTML('beforeend', `<a class="gx-hgear" href="index.html#einstellungen" aria-label="Einstellungen">${ICO.gear}</a>`);
    }
  }
  buildNav();
  document.documentElement.classList.add('gx');

  if (isWerk) { werkSteps(); return; }

  try { render(); } catch (e) { console.error(e); }
  const syncNav = () => document.querySelectorAll('nav.gx-nav a[data-v]').forEach(a => { if (a.dataset.v === S.view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  syncNav(); addEventListener('hashchange', () => setTimeout(syncNav, 0));

  /* ---------- Reel-Studio: sechs Schritte, einer nach dem anderen ---------- */
  function werkSteps() {
    document.body.classList.add('gx-werk');
    const h1 = document.querySelector('header.top h1'); if (h1) h1.textContent = 'Werkstatt';
    const layout = document.querySelector('.layout'); const stack = layout && layout.querySelector(':scope > .stack');
    if (!layout || !stack) return;
    const E = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const cards = [...stack.querySelectorAll(':scope > section.card')];
    const has = (c, sel) => !!c.querySelector(sel);
    const by = {
      media: document.getElementById('mediaCard'), style: document.getElementById('styleCard'), edit: document.getElementById('editCard'),
      music: document.getElementById('musicCard'), out: document.getElementById('outCard'),
      takt: cards.find(c => has(c, '#bpmRow')), text: cards.find(c => has(c, '#f-hook')), post: cards.find(c => has(c, '#f-cap'))
    };
    const STEPS = [
      { name: 'Material', cards: [by.media] },
      { name: 'Stil', cards: [by.style] },
      { name: 'Look', cards: [by.edit] },
      { name: 'Musik und Takt', cards: [by.music, by.takt] },
      { name: 'Texte', cards: [by.text] },
      { name: 'Fertig', cards: [by.post, by.out] }
    ];
    STEPS.forEach(s => s.cards = s.cards.filter(Boolean));
    tidyReel(by);
    STEPS[3].cards = STEPS[3].cards.filter(c => c !== by.takt);
    let cur = 0; try { cur = Math.min(5, Math.max(0, +(localStorage.getItem('gx-step') || 0))); } catch (e) {}

    const rail = document.createElement('nav'); rail.className = 'gx-rail'; rail.setAttribute('aria-label', 'Schritte');
    layout.insertBefore(rail, layout.firstChild);
    const next = document.createElement('div'); next.className = 'gx-nextrow'; stack.appendChild(next);

    const val = i => { try {
      if (i === 0) { const n = (P.items || []).length; return n ? n + (n === 1 ? ' Stück' : ' Stücke') : 'noch leer'; }
      if (i === 1) return (STYLES[P.style] && STYLES[P.style].name) || '';
      if (i === 2) { const l = LOOKS.find(x => x.id === (P.edit && P.edit.look)); return l ? l.name : ''; }
      if (i === 3) { const m = P.musicName || (P.music && P.music.title) || (P.sound ? 'Originalton' : 'ohne Ton'); return m.replace(/\.(mp3|ogg|wav|m4a)$/i, '') + ' · ' + (P.bpm || 120) + ' BPM'; }
      if (i === 4) return P.hook || 'ohne Text';
      if (i === 5) return P.renderSig ? (sigSame(P.renderSig) ? 'gerendert' : 'neu rendern') : 'noch nicht gerendert';
    } catch (e) {} return ''; };

    const show = (i, scroll) => {
      cur = i; try { localStorage.setItem('gx-step', String(i)); } catch (e) {}
      cards.forEach(c => c.classList.toggle('gx-off', !STEPS[i].cards.includes(c)));
      rail.innerHTML = `<div class="gx-mini"><button type="button" data-st="${Math.max(0, i - 1)}" aria-label="Schritt zurück" ${i ? '' : 'disabled'}>‹</button><span>Schritt ${i + 1} von 6 · <b>${E(STEPS[i].name)}</b></span><button type="button" data-st="${Math.min(5, i + 1)}" aria-label="Nächster Schritt" ${i < 5 ? '' : 'disabled'}>›</button></div>` + '<ol>' + STEPS.map((s, k) => `<li><button type="button" data-st="${k}" ${k === i ? 'aria-current="step"' : ''}><b>${k + 1}</b><span><span class="n">${E(s.name)}</span><span class="v">${E(val(k))}</span></span></button></li>`).join('') + '</ol>';
      rail.querySelectorAll('[data-st]').forEach(b => b.onclick = () => show(+b.dataset.st, true));
      next.innerHTML = (i > 0 ? `<button type="button" class="btn ghost" data-go="${i - 1}">Zurück</button>` : '<span></span>') +
        (i < 5 ? `<button type="button" class="btn" data-go="${i + 1}">Weiter zu ${E(STEPS[i + 1].name)}${GI_().next}</button>` : '');
      next.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(+b.dataset.go, true));
      if (scroll) scrollTo({ top: 0, behavior: 'smooth' });
      if (i >= 3 && (P.items || []).length) autoMusic();
    };
    let t = null; new MutationObserver(m => { if (m.every(x => rail.contains(x.target) || next.contains(x.target))) return; clearTimeout(t); t = setTimeout(() => { suggest(); const vs = [...rail.querySelectorAll('.v')]; vs.forEach((v, k) => { const nv = val(k); if (v.textContent !== nv) v.textContent = nv; }); }, 200); }).observe(stack, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'value'] });
    document.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => rail.querySelectorAll('.v').forEach((v, k) => { v.textContent = val(k); }), 300); });

    /* ---------- Freie Musik von Openverse, automatisch passend zur Richtung ---------- */
    const TERMS = { ruhig: ['calm piano', 'ambient', 'lofi'], treibend: ['upbeat', 'energetic', 'lofi'], warm: ['acoustic guitar', 'ukulele', 'folk'] };
    const BAD = /(birthday|anthem|hymn|national|ode|speech|interview|lecture|thunder|rain|noise|field recording|test|demo-|sample|bartok|purcell|wagner|mozart|beethoven|bach|chopin|orchestra|symphon)/i;
    const box = document.createElement('div'); box.className = 'gx-free';
    if (by.music) { const fine = by.music.querySelector('.gx-fine'); fine ? fine.insertAdjacentElement('beforebegin', box) : by.music.appendChild(box); }
    const MS = { list: [], idx: -1, mood: null, busy: false, err: '' };
    const lic = r => { const l = (r.license || '').toLowerCase(); return l === 'cc0' ? 'CC0, frei' : l === 'pdm' ? 'gemeinfrei' : 'CC ' + l.toUpperCase() + ' ' + (r.license_version || ''); };
    const needsCredit = r => !['cc0', 'pdm'].includes((r.license || '').toLowerCase());
    const reelLen = () => { const m = ((document.getElementById('time') || {}).textContent || '').match(/\/\s*([\d,]+)/); const v = m ? parseFloat(m[1].replace(',', '.')) : 0; return v > 3 ? v : 15; };
    async function search(mood) {
      MS.busy = true; MS.err = ''; drawFree();
      const seen = new Set(), out = [];
      for (const q of TERMS[mood] || TERMS.treibend) {
        try {
          const u = 'https://api.openverse.org/v1/audio/?q=' + encodeURIComponent(q) + '&license_type=commercial&source=wikimedia_audio&page_size=20';
          const r = await fetch(u); if (!r.ok) continue; const j = await r.json();
          for (const x of j.results || []) { const d = (x.duration || 0) / 1000; if (!x.url || seen.has(x.id) || d < Math.max(20, reelLen()) || d > 600 || BAD.test(x.title || '')) continue; seen.add(x.id); out.push(x); }
        } catch (e) {}
        if (out.length >= 8) break;
      }
      out.sort((a, b) => (needsCredit(a) - needsCredit(b)) || ((a.source === 'wikimedia_audio' ? 0 : 1) - (b.source === 'wikimedia_audio' ? 0 : 1)));
      MS.list = out.slice(0, 8); MS.mood = mood; MS.busy = false; MS.idx = -1;
      if (!MS.list.length) MS.err = 'Gerade nichts Passendes gefunden. Später noch mal, oder eigene Musikdatei nehmen.';
      drawFree();
    }
    async function take(k, silent) {
      const r = MS.list[k]; if (!r) return false;
      MS.busy = true; drawFree();
      try {
        const res = await fetch(r.url, { mode: 'cors' }); if (!res.ok) throw new Error('http');
        const blob = await res.blob(); const ext = (r.filetype || 'mp3').replace('mp32', 'mp3');
        const f = new File([blob], (r.title || 'Musik').replace(/[\\/:*?"<>|]/g, '').slice(0, 60) + '.' + ext, { type: blob.type || 'audio/mpeg' });
        const inp = document.getElementById('musicIn'); const dt = new DataTransfer(); dt.items.add(f); inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true }));
        const orig = document.getElementById('snd-orig'); if (orig && orig.getAttribute('aria-pressed') === 'true') orig.click();
        credit(r); MS.idx = k; MS.ours = f.name; MS.busy = false; drawFree();
        if (!silent) toast0('Musik: ' + (r.title || 'Stück'));
        return true;
      } catch (e) { MS.busy = false; MS.failed = (MS.failed || 0) + 1; MS.list.splice(k, 1); if (!MS.list.length) MS.err = 'Die gefundenen Stücke ließen sich gerade nicht laden. Später noch mal, oder eigene Musikdatei nehmen.'; drawFree(); return false; }
    }
    function credit(r) {
      const cap = document.getElementById('f-cap'); if (!cap) return;
      let v = cap.value.replace(/\n*Musik: .*$/s, '');
      if (needsCredit(r)) v = (v.trim() ? v.trim() + '\n\n' : '') + 'Musik: ' + (r.title || '') + ' von ' + (r.creator || 'unbekannt') + ' (' + lic(r) + ')';
      if (v !== cap.value) { cap.value = v; cap.dispatchEvent(new Event('input', { bubbles: true })); }
    }
    async function autoMusic(force) {
      const mood = (typeof R !== 'undefined' && R.moodSel) || 'treibend';
      let key = ''; try { key = 'gx-auto-' + P.id; } catch (e) {}
      const own = (typeof R !== 'undefined' && R.mlist && R.mlist.length) ? R.mlist.length : 0;
      if (!force && own) { if (!MS.list.length || MS.mood !== mood) search(mood); return; }
      if (!force) { if (P.musicName || P.music) { if (!MS.list.length || MS.mood !== mood) search(mood); return; } try { if (localStorage.getItem(key)) { if (MS.mood !== mood) search(mood); return; } } catch (e) {} }
      if (MS.mood !== mood || !MS.list.length) await search(mood);
      for (let k = 0; k < MS.list.length; k++) { if (await take(k, true)) { try { localStorage.setItem(key, '1'); } catch (e) {} toast0('Musik ausgesucht: ' + (MS.list[MS.idx].title || 'Stück')); return; } k--; }
    }
    const toast0 = m => { try { toast(m); } catch (e) {} };
    function drawFree() {
      const r = MS.list[MS.idx];
      box.innerHTML = `<div class="gx-fhead"><span class="gx-ftitle">Freie Musik passend zu „${E((MS.mood || 'treibend').replace(/^./, c => c.toUpperCase()))}“</span>${MS.busy ? '<span class="small muted">Sucht …</span>' : `<button type="button" class="gx-link" id="gxAlt">${r ? 'Anderes Stück' : 'Stück aussuchen'}</button>`}</div>` +
        (r ? `<p class="small">Läuft unter deinem Reel: <b>${E(r.title)}</b> von ${E(r.creator || 'unbekannt')} · ${E(lic(r))}${needsCredit(r) ? ' · Nennung steht schon in der Caption' : ''}</p>` : '') +
        (MS.err ? `<p class="small muted">${E(MS.err)}</p>` : '') +
        (MS.list.length ? `<ol class="gx-flist">${MS.list.slice(0, 5).map((x, k) => `<li class="${k === MS.idx ? 'on' : ''}"><button type="button" class="gx-fplay" data-fp="${k}" aria-label="${E(x.title)} anhören">${GI_().play}</button><span class="gx-fmeta"><b>${E(x.title)}</b><small>${E(x.creator || '')} · ${Math.round((x.duration || 0) / 1000)} s · ${E(lic(x))}</small></span>${k === MS.idx ? '<span class="small muted">gewählt</span>' : `<button type="button" class="btn ghost sm" data-ft="${k}">Nehmen</button>`}</li>`).join('')}</ol>` : '') +
        `<p class="small muted gx-fnote">Freie Musik aus Wikimedia Commons über Openverse, nur Lizenzen, die kommerzielle Nutzung erlauben. Songs aus den Instagram-Charts gibt es nur in der Instagram-App.</p>`;
      const alt = box.querySelector('#gxAlt'); if (alt) alt.onclick = async () => { if (!MS.list.length) { await search((typeof R !== 'undefined' && R.moodSel) || 'treibend'); } let k = MS.idx + 1; while (k < MS.list.length && !(await take(k))) {} };
      box.querySelectorAll('[data-ft]').forEach(b => b.onclick = () => take(+b.dataset.ft));
      box.querySelectorAll('[data-fp]').forEach(b => b.onclick = () => { const x = MS.list[+b.dataset.fp]; if (!x) return; if (MS.audio && MS.audio.dataset.k === b.dataset.fp && !MS.audio.paused) { MS.audio.pause(); b.innerHTML = GI_().play; return; } if (MS.audio) MS.audio.pause(); box.querySelectorAll('[data-fp]').forEach(y => y.innerHTML = GI_().play); if (window.__gxStopOthers) window.__gxStopOthers(); MS.audio = window.__gxAudio = new Audio(x.url); MS.audio.dataset.k = b.dataset.fp; MS.audio.onended = () => { b.innerHTML = GI_().play; }; MS.audio.play().catch(() => {}); b.innerHTML = GI_().pause; });
    }
    document.addEventListener('click', e => { const m = e.target.closest('#moods [data-mood]'); if (m && cur === 3) setTimeout(() => { if (P.musicName && P.musicName === MS.ours) autoMusic(true); else search(m.dataset.mood); }, 50); });
    drawFree();
    oneSound();
    reelDelete();
    playFix();
    proPolish();
    show(cur, false);
  }


  /* Kleine Strich-Icons statt Unicode-Zeichen */
  function GI_() {
    const S = (d, f) => `<svg class="gx-i" viewBox="0 0 24 24" aria-hidden="true"${f ? ' data-fill' : ''}>${d}</svg>`;
    return window.__gxGI || (window.__gxGI = {
      play: S('<path d="M8 5.5v13l10.5-6.5z"/>', 1), pause: S('<rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/>', 1),
      undo: S('<path d="M9 7 4.5 11.5 9 16"/><path d="M5 11.5h9.5a5 5 0 0 1 0 10H12"/>'), redo: S('<path d="m15 7 4.5 4.5L15 16"/><path d="M19 11.5H9.5a5 5 0 0 0 0 10H12"/>'),
      back: S('<path d="M14.5 6 8.5 12l6 6"/>'), next: S('<path d="M5 12h13"/><path d="m13 7 5 5-5 5"/>'),
      trash: S('<path d="M4.5 7h15"/><path d="M9.5 7V4.8h5V7"/><path d="M6.5 7l.9 12.2a1.8 1.8 0 0 0 1.8 1.6h5.6a1.8 1.8 0 0 0 1.8-1.6L17.5 7"/>'),
      tr: S('<rect x="3.5" y="6" width="10" height="12" rx="2"/><rect x="10.5" y="6" width="10" height="12" rx="2"/>'), plus: S('<path d="M12 6v12M6 12h12"/>'),
      kf: S('<path d="m12 5 7 7-7 7-7-7z"/>', 1)
    });
  }


  /* Play/Pause: der Knopf wurde jedes Bild neu beschrieben, dabei ging der Tipp verloren.
     Jetzt ändert sich sein Inhalt nur beim Wechsel, und Pause greift auch, während die Musik noch lädt. */
  function steadyPlay(btn, act) {
    if (!btn || btn.dataset.gxSteady) return; btn.dataset.gxSteady = '1';
    const draw = () => { const want = (R.playing || (R.waitMusic && !R.gxCancel)) ? 'pause' : 'play'; if (btn.dataset.st !== want) { btn.dataset.st = want; btn.innerHTML = GI_()[want]; } };
    Object.defineProperty(btn, 'textContent', { configurable: true, get: () => (btn.dataset.st === 'pause' ? '❚❚' : '▶'), set: draw });
    // Schalten schon beim Aufsetzen des Fingers, der spätere click wird verschluckt
    let ate = -1e9;
    btn.addEventListener('pointerdown', e => { if (e.button || btn.disabled) return; e.preventDefault(); ate = e.timeStamp; (act || btn.onclick).call(btn); draw(); });
    btn.addEventListener('click', e => { if (e.isTrusted && e.timeStamp - ate < 1500) { ate = -1e9; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
    draw();
  }
  function playFix() {
    steadyPlay(document.getElementById('play'));
    steadyPlay(document.getElementById('mplay'), () => document.getElementById('play').onclick());
    const sp = window.setPlaying, now = window.setPlayingNow;
    if (typeof sp !== 'function' || typeof now !== 'function') return;
    window.setPlaying = function (on) {
      if (R.waitMusic) { R.gxCancel = on ? !R.gxCancel : true; /* während des Ladens zeigt der Knopf schon Pause: Tippen bricht ab */ try { updateTransport(); if (typeof proTimeLabel === 'function') proTimeLabel(); } catch (e) {} return; }
      R.gxCancel = false; const r = sp.apply(this, arguments);
      try { updateTransport(); if (typeof proTimeLabel === 'function') proTimeLabel(); } catch (e) {} return r;
    };
    window.setPlayingNow = function (on) { if (on && R.gxCancel) { R.gxCancel = false; try { updateTransport(); } catch (e) {} return; } return now.apply(this, arguments); };
  }

  /* Deine Reels: einzeln löschen, mit Rückfrage direkt am Bild */
  function reelDelete() {
    const orig = window.renderList; if (typeof orig !== 'function') return;
    let armed = null, timer = null, emptyArmed = false;
    const disarm = () => { armed = null; emptyArmed = false; clearTimeout(timer); };
    const arm = () => { clearTimeout(timer); timer = setTimeout(() => { disarm(); window.renderList(); }, 5000); };
    async function kill(ids) {
      for (const id of ids) {
        const r = R.list.find(x => x.id === id);
        if (id === P.id) { R.dirty = false; const nb = document.getElementById('newReel'); if (nb) await nb.onclick(); }
        try { await db.collection('reels').doc(id).delete(); } catch (e) { toast('Löschen hat nicht geklappt. Bist du online?'); continue; }
        try { localStorage.removeItem('gx-sug-' + id); } catch (e) {}
        R.list = R.list.filter(x => x.id !== id);
      }
      disarm(); window.renderList();
      toast(ids.length > 1 ? ids.length + ' Entwürfe gelöscht' : 'Reel gelöscht');
    }
    window.renderList = function () {
      const out = orig.apply(this, arguments);
      try {
        const box = document.getElementById('reels'); if (!box || typeof db === 'undefined' || !db) return out;
        box.querySelectorAll('.rc[data-open]').forEach(b => {
          const id = b.dataset.open, r = R.list.find(x => x.id === id) || {};
          const w = document.createElement('div'); w.className = 'gx-rcw'; b.replaceWith(w); w.appendChild(b);
          const name = r.title || r.hook || r.ort || 'Ohne Titel';
          const d = document.createElement('button'); d.type = 'button'; d.className = 'gx-rcdel';
          if (armed === id) { w.classList.add('gx-armed'); d.classList.add('gx-on'); d.innerHTML = GI_().trash + '<span>Wirklich löschen</span>'; d.setAttribute('aria-label', '„' + name + '“ endgültig löschen'); }
          else { d.innerHTML = GI_().trash; d.setAttribute('aria-label', '„' + name + '“ löschen'); d.title = 'Löschen'; }
          d.onclick = e => { e.stopPropagation(); if (armed === id) kill([id]); else { armed = id; emptyArmed = false; arm(); window.renderList(); const n = document.querySelector('.gx-rcdel.gx-on'); if (n) n.focus(); } };
          w.appendChild(d);
          if (!(r.items || []).length) { const t = b.querySelector('.tx > span:last-child'); if (t) t.textContent = 'leer'; }
        });
        const empty = R.list.filter(x => !(x.items || []).length && x.id !== P.id).map(x => x.id);
        const meta = document.getElementById('listMeta'); let eb = document.getElementById('gxEmpty');
        if (meta && empty.length > 1) {
          if (!eb) { eb = document.createElement('button'); eb.id = 'gxEmpty'; eb.type = 'button'; eb.className = 'gx-emptybtn'; meta.after(eb); }
          eb.classList.toggle('gx-on', emptyArmed);
          eb.textContent = emptyArmed ? `Alle ${empty.length} leeren Entwürfe löschen?` : `${empty.length} leere Entwürfe entfernen`;
          eb.onclick = () => { if (emptyArmed) kill(empty); else { emptyArmed = true; armed = null; arm(); window.renderList(); } };
        } else if (eb) eb.remove();
      } catch (e) { console.warn('gx reels', e); }
      return out;
    };
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && (armed || emptyArmed)) { disarm(); window.renderList(); } });
    try { window.renderList(); } catch (e) {}
  }

  /* Pro-Schnitt: ruhiger Kopf, Transport unter dem Bild, Werkzeuge nach Bedarf */
  function proPolish() {
    const wrap = (n, after) => { const o = window[n]; if (typeof o !== 'function') return; window[n] = function () { const r = o.apply(this, arguments); try { after.apply(this, arguments); } catch (e) { console.warn('gx pro', n, e); } return r; }; };
    const $$ = id => document.getElementById(id);
    function build() {
      const d = $$('pro'); if (!d || d.dataset.gx) return; d.dataset.gx = '1'; d.classList.add('gx-pro');
      const head = d.querySelector('.qph'), g = GI_();
      const badge = head.querySelector('.qbadge'); if (badge) badge.remove();
      head.querySelectorAll('.qsp').forEach(x => x.remove());
      const close = $$('proClose'); close.innerHTML = g.back + '<span>Fertig</span>';
      const h2 = head.querySelector('h2'); h2.textContent = 'Schnitt';
      const sub = document.createElement('span'); sub.className = 'gx-prosub'; sub.id = 'gxProSub';
      const left = document.createElement('div'); left.className = 'gx-pl'; left.append(close, h2, sub);
      const right = document.createElement('div'); right.className = 'gx-pr';
      const ren = $$('proRender'); ren.textContent = 'Rendern'; right.append(ren);
      const tb = document.createElement('div'); tb.className = 'gx-ptb'; tb.setAttribute('role', 'group'); tb.setAttribute('aria-label', 'Wiedergabe');
      const undo = $$('proUndo'), redo = $$('proRedo'), play = $$('proPlay'), tm = $$('proTime');
      undo.innerHTML = g.undo; redo.innerHTML = g.redo; play.classList.add('gx-play'); steadyPlay(play);
      const tl = document.createElement('div'); tl.className = 'gx-ptl'; tl.append(tm);
      const tc = document.createElement('div'); tc.className = 'gx-ptc'; tc.append(play);
      const tr = document.createElement('div'); tr.className = 'gx-ptr'; tr.append(undo, redo);
      tb.append(tl, tc, tr);
      head.innerHTML = ''; head.append(left, right);
      d.insertBefore(tb, d.querySelector('.qptl'));
    }
    wrap('proMount', build);
    wrap('proFit', () => { const st = $$('proStage'), b = $$('proCvBox'); if (!st || !b) return; const pd = innerWidth > 700 ? 48 : 20; const w = st.clientWidth - pd, h = st.clientHeight - pd; let ch = h, cw = ch * 9 / 16; if (cw > w) { cw = w; ch = cw * 16 / 9; } b.style.width = Math.max(60, cw) + 'px'; b.style.height = Math.max(100, ch) + 'px'; });
    wrap('proTimeLabel', () => {
      const el = $$('proTime'); if (el && el.textContent.includes(' / ')) { const [a, z] = el.textContent.split(' / '); el.innerHTML = `<b>${a}</b><span>/ ${z} s</span>`; }
      const sub = $$('gxProSub'); if (sub && P.pro && P.pro.clips) { const t = `${P.pro.clips.length} Clips`; if (sub.textContent !== t) sub.textContent = t; }
    });
    wrap('proRenderLane', () => {
      const lane = $$('proLane'); if (!lane) return; const g = GI_();
      lane.querySelectorAll('.qjoin').forEach(j => { const on = j.classList.contains('qon'); const k = on ? 'tr' : 'plus'; if (j.dataset.ic !== k) { j.dataset.ic = k; j.innerHTML = g[k]; } j.setAttribute('aria-label', on ? 'Übergang bearbeiten' : 'Übergang hinzufügen'); });
      lane.querySelectorAll('.qclip .qcap').forEach(c => { if (c.textContent.includes('◆')) c.innerHTML = c.innerHTML.replace(/◆+/, m => `<span class="gx-kf">${g.kf}${m.length > 1 ? m.length : ''}</span>`); });
    });
    wrap('proRenderTools', () => {
      const el = $$('proTools'); if (!el) return;
      const btn = a => el.querySelector(`[data-act="${a}"]`);
      const prim = ['add', 'layer', 'text'].map(btn).filter(Boolean);
      const end = btn('beat');
      const ctx = [...el.querySelectorAll('[data-act]')].filter(b => !prim.includes(b) && b !== end);
      const live = ctx.filter(b => !b.disabled);
      el.innerHTML = '';
      const grp = (cls, list) => { const g = document.createElement('div'); g.className = 'gx-tg ' + cls; list.forEach(x => g.append(x)); return g; };
      el.append(grp('gx-tg1', prim));
      if (live.length) el.append(grp('gx-tg2', live));
      else { const h = document.createElement('p'); h.className = 'gx-thint'; h.textContent = 'Clip antippen für Schneiden, Tempo und Ausschnitt'; el.append(h); }
      if (end) el.append(grp('gx-tg3', [end]));
    });
    wrap('proRenderIns', () => {
      const el = $$('proIns'), d = $$('pro'); if (!el || !d) return;
      const none = !PRO.sel; const was = d.classList.contains('gx-nosel'); d.classList.toggle('gx-nosel', none);
      if (was !== none && typeof proFit === 'function') requestAnimationFrame(() => proFit());
      if (!none) return;
      const tot = R.tl ? R.tl.total : 0;
      const notes = [...el.querySelectorAll('.qnote')];
      const from = P.pro && P.pro.from ? ((STYLES[P.pro.from] || {}).name || P.pro.from) : '';
      const h3 = el.querySelector('h3');
      const stats = document.createElement('dl'); stats.className = 'gx-pstats';
      stats.innerHTML = `<div><dt>Clips</dt><dd>${P.pro.clips.length}</dd></div><div><dt>Länge</dt><dd>${de(tot)} s</dd></div>${from ? `<div><dt>Aus Stil</dt><dd>${E(from)}</dd></div>` : ''}`;
      if (h3) h3.after(stats);
      notes.forEach(n => { const g = n.closest('.qg'); (g || n).remove(); });
      const chips = el.querySelector('.qchips'); if (chips) chips.classList.add('gx-pacts');
      const tips = document.createElement('details'); tips.className = 'gx-ptips';
      const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
      const K = (k, t) => `<li><span>${t}</span><span>${k.map(x => `<kbd>${x}</kbd>`).join('')}</span></li>`;
      tips.innerHTML = fine
        ? `<summary>Tastenkürzel</summary><ul>${K(['Leertaste'], 'Abspielen')}${K(['S'], 'Teilen')}${K(['T'], 'Text')}${K(['E'], 'Ebene')}${K(['Entf'], 'Löschen')}${K(['⌘', 'Z'], 'Rückgängig')}${K(['←', '→'], 'Ein Bild')}${K(['+', '−'], 'Zoom')}</ul>`
        : `<summary>So bedienst du den Schnitt</summary><p>Antippen wählt aus. Wischen bewegt die Timeline, zwei Finger zoomen. Kanten eines gewählten Clips ziehen kürzt ihn, gedrückt halten und ziehen sortiert um.</p>`;
      el.append(tips);
      function E(t) { return String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
    });
    if (document.getElementById('pro')) build();
  }

  /* Reel-Studio aufräumen: ruhiger Kopf, weniger Auswahl, Feinheiten eingeklappt */
  function REC_STYLES_() { return ['takt', 'nahtlos', 'film', 'galerie', 'dump']; }
  function REC_LOOKS_() { return ['none', 'klar', 'portra', 'sw']; }
  function UI_() { return window.__gxUI || (window.__gxUI = { moreStyles: false, moreLooks: false }); }
  function E(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function sugStyle() {
    const it = (P.items || []), n = it.length, v = it.filter(x => x.kind === 'video').length;
    if (n && n <= 3) return 'galerie'; if (v >= 2) return 'takt'; if (n >= 8) return 'dump'; return 'takt';
  }
  function recStyles() { const s = sugStyle(); let l = [s, ...REC_STYLES_().filter(x => x !== s)].slice(0, 4); if (P.style && !l.includes(P.style)) l[3] = P.style; return l; }
  function recLooks() { const l = REC_LOOKS_(); const cur = P.edit && P.edit.look; if (cur && !l.includes(cur)) l[3] = cur; return l; }
  function suggest() {
    try {
      if (!(P.items || []).length) return;
      const k = 'gx-sug-' + P.id; if (localStorage.getItem(k)) return; localStorage.setItem(k, '1');
      if (P.style && P.style !== 'takt') return;
      const s = sugStyle(); if (s !== P.style) chooseStyle(s);
      const e = ED(); if (!e.look || e.look === 'none') { e.look = 'klar'; editChanged(); renderEdit(); }
      const m = (STYLE_MOOD[s] || ['treibend'])[0]; if (R.moodSel !== m) { R.moodSel = m; renderMoods(); renderTracks(); }
    } catch (e) {}
  }
  function markMore(box, sel, keep, open, label, key) {
    if (!box) return; const tiles = [...box.querySelectorAll(sel)];
    tiles.forEach(b => b.classList.toggle('gx-hide', !open && !keep.includes(b.dataset.style || b.dataset.look)));
    let t = box.parentElement.querySelector(':scope > .gx-more[data-k="' + key + '"]');
    if (!t) { t = document.createElement('button'); t.type = 'button'; t.className = 'gx-link gx-more'; t.dataset.k = key; box.insertAdjacentElement('afterend', t); t.onclick = () => { UI_()[key] = !UI_()[key]; key === 'moreStyles' ? renderStyles() : renderEdit(); }; }
    const n = tiles.length - keep.length; t.textContent = open ? 'Weniger zeigen' : label + ' (' + n + ')'; t.hidden = n <= 0;
  }
  function headLine(card, id, txt, btnTxt, onClick) {
    if (!card) return; let el = card.querySelector('#' + id);
    if (!el) { el = document.createElement('div'); el.id = id; el.className = 'gx-sug'; card.querySelector('.cardhead').insertAdjacentElement('afterend', el); }
    el.innerHTML = `<span>${txt}</span><button type="button" class="btn ghost sm">${btnTxt}</button>`; el.querySelector('button').onclick = onClick;
  }
  function tidyReel(by) {
    // Kopf: eine ruhige Zeile
    const pro = document.getElementById('proBtn'); if (pro) { pro.textContent = 'Pro-Schnitt'; pro.className = 'gx-link'; }
    const nr = document.getElementById('newReel'); if (nr) nr.className = 'gx-link';
    // Stil: vier Vorschläge, Rest einklappbar
    const _rs = window.renderStyles;
    window.renderStyles = function () {
      const r = _rs.apply(this, arguments);
      const box = document.getElementById('styles'); const rec = recStyles();
      if (box) { const tiles = [...box.querySelectorAll('[data-style]')]; rec.slice().reverse().forEach(k => { const b = tiles.find(x => x.dataset.style === k); if (b) box.prepend(b); }); }
      markMore(box, '[data-style]', rec, UI_().moreStyles, 'Mehr Stile', 'moreStyles');
      const s = sugStyle(), cur = STYLES[P.style] ? P.style : 'takt';
      headLine(by.style, 'gxSugStyle', cur === s ? `Vorschlag für dein Material: <b>${E(STYLES[s].name)}</b>` : `Gewählt: <b>${E(STYLES[cur].name)}</b>`, 'Anderer Stil', () => { const l = recStyles(); const i = l.indexOf(P.style); chooseStyle(l[(i + 1) % l.length]); });
      return r;
    };
    // Look: vier Vorschläge
    const _re = window.renderEdit;
    window.renderEdit = function () {
      const r = _re.apply(this, arguments);
      const box = document.getElementById('looks'); const rec = recLooks();
      if (box) { const tiles = [...box.querySelectorAll('[data-look]')]; rec.slice().reverse().forEach(k => { const b = tiles.find(x => x.dataset.look === k); if (b) box.prepend(b); }); }
      markMore(box, '[data-look]', rec, UI_().moreLooks, 'Mehr Looks', 'moreLooks');
      const cur = (P.edit && P.edit.look) || 'none'; const L = LOOKS.find(x => x.id === cur) || LOOKS[0];
      headLine(by.edit, 'gxSugLook', `Gewählt: <b>${E(L.name)}</b>`, 'Anderer Look', () => { const l = recLooks(); const i = l.indexOf(cur); const e = ED(); e.look = l[(i + 1) % l.length]; editChanged(); renderEdit(); });
      return r;
    };
    if (by.edit) { const h = by.edit.querySelector('.cardhead h2'); if (h) h.textContent = 'Look'; const sm = by.edit.querySelector('.cardhead .small'); if (sm) sm.remove(); }
    // Stil: Schrift, Textfarbe und Variante einklappen
    if (by.style) {
      const d2 = document.createElement('details'); d2.className = 'gx-fine'; d2.innerHTML = '<summary>Schrift, Textfarbe und Variante</summary><div class="gx-fine-in"></div>';
      const in2 = d2.querySelector('.gx-fine-in'); const ts = document.getElementById('tsel'); const rr = document.getElementById('reroll');
      [ts, rr && rr.closest('.row')].forEach(n => n && in2.appendChild(n)); by.style.appendChild(d2);
    }
    // Richtungen ohne „0 Stücke“
    const _rm = window.renderMoods;
    if (typeof _rm === 'function') window.renderMoods = function () { const r = _rm.apply(this, arguments); document.querySelectorAll('#moods small, #moods span').forEach(s => { s.innerHTML = s.innerHTML.replace(/^0 Stücke\s*·\s*/, ''); }); return r; };
    try { renderMoods(); } catch (e) {}
    // Musik: Takt und Feinheiten einklappen
    if (by.music) {
      const det = document.createElement('details'); det.className = 'gx-fine'; det.innerHTML = '<summary>Tempo, Hörprobe und eigene Musik</summary><div class="gx-fine-in"></div>';
      const inn = det.querySelector('.gx-fine-in');
      const sp = by.music.querySelector('.spanel'); const auto = document.getElementById('musicAuto'); const orig = document.getElementById('snd-orig');
      const tr = document.getElementById('tracks');
      [sp, auto && auto.closest('.row'), tr, orig && orig.closest('.row'), ...[...by.music.querySelectorAll(':scope > span.small.muted')]].forEach(n => n && inn.appendChild(n));
      if (by.takt) { [...by.takt.children].forEach(n => { if (!n.classList.contains('cardhead')) inn.appendChild(n); }); by.takt.classList.add('gx-off'); }
      by.music.appendChild(det);
      const h2 = by.music.querySelector('.cardhead h2'); if (h2) h2.textContent = 'Musik und Takt';
      const hs = by.music.querySelector('.cardhead .small'); if (hs) hs.remove();
    }
    // Unter der Vorschau: ein Satz statt Schildchen
    const _rc = window.renderChips;
    if (typeof _rc === 'function') window.renderChips = function () {
      const tl = R.tl; const el = document.getElementById('chips'); if (!el) return;
      if (!tl || !tl.segs.length) { el.innerHTML = ''; return; }
      const tot = tl.total, ok = tot >= 7 && tot <= 15; const nm = tl.style === 'pro' ? 'Pro-Schnitt' : (STYLES[tl.style] || {}).name || '';
      el.innerHTML = `<p class="gx-chipline">${E(nm)} · ${String(tot.toFixed(1)).replace('.', ',')} s${ok ? '' : ' <span class="gx-warnword">· ideal sind 8 bis 15 s</span>'} · ${tl.segs.length} Bilder · ${P.bpm} BPM</p>`;
    };
    try { renderStyles(); renderEdit(); renderChips(); } catch (e) {}
  }

  /* Immer nur ein Ton: Reel-Vorschau, Hörprobe der Richtung, Probe aus dem Ordner und freie Musik schließen sich aus */
  function oneSound() {
    const stopFree = () => { try { if (window.__gxAudio && !window.__gxAudio.paused) { window.__gxAudio.pause(); document.querySelectorAll('[data-fp]').forEach(y => y.innerHTML = GI_().play); } } catch (e) {} };
    const stopReel = () => { try { if (typeof R !== 'undefined' && R.playing && typeof setPlaying === 'function') _setPlaying(false); } catch (e) {} };
    const stopProbe = () => { try { if (typeof R !== 'undefined' && (R.ex || R.tp) && typeof stopExample === 'function') _stopExample(); } catch (e) {} };
    const _setPlaying = window.setPlaying, _stopExample = window.stopExample;
    if (typeof _setPlaying === 'function') window.setPlaying = function (on) { if (on) { stopFree(); stopProbe(); } return _setPlaying.apply(this, arguments); };
    ['playExample', 'playTrackPreview'].forEach(n => { const o = window[n]; if (typeof o === 'function') window[n] = function () { stopFree(); stopReel(); return o.apply(this, arguments); }; });
    window.__gxStopOthers = () => { stopReel(); stopProbe(); };
    addEventListener('pagehide', () => { stopFree(); stopReel(); stopProbe(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { stopFree(); stopProbe(); } });
  }
})();
