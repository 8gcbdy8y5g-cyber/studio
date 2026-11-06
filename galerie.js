/* Studio · Galerie (ab 6.11.2026)
   Ruhiges, fotografisches Layout: drei Bereiche (Feed, Plan, Zahlen), „Neuer Post“ als Hauptknopf,
   Einstellungen als Zahnrad. Wird nach dem Hauptskript geladen und überschreibt nur Darstellung:
   Daten, Speichern und Logik bleiben die aus index.html. */
(function () {
  const isWerk = typeof vPult === 'undefined';
  const SUN = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#1A1917"/><path d="M9 20a7 7 0 0 1 14 0z" fill="#E07A45"/><path d="M7 22.5h18" stroke="#FBFAF7" stroke-width="1.5" stroke-linecap="round"/></svg>';
  const ICO = {
    feed: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="8"/><rect x="14" y="3" width="7" height="8"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    plan: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    zahlen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    plus: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>'
  };

  /* ---------- Navigation ---------- */
  function buildNav() {
    const nav = document.querySelector('nav.side');
    if (!nav) return;
    const base = isWerk ? 'index.html' : '';
    nav.className = 'side gx-nav';
    nav.innerHTML =
      `<a href="${base}#pult" class="gx-brand" aria-label="Studio, zur Startseite">${SUN}<span>sommer_gram</span></a>` +
      `<a class="nv" href="${base}#pult" data-v="pult">${ICO.feed}<span>Feed</span></a>` +
      `<a class="nv" href="${base}#plan" data-v="plan">${ICO.plan}<span>Plan</span></a>` +
      `<a class="nv gx-new" href="${base}#posten" data-v="posten" aria-label="Neuer Post">${ICO.plus}<span>Neuer Post</span></a>` +
      `<a class="nv" href="${base}#analytics" data-v="analytics">${ICO.zahlen}<span>Zahlen</span></a>` +
      `<a class="nv gx-gear" href="${base}#einstellungen" data-v="einstellungen" aria-label="Einstellungen">${ICO.gear}</a>`;
    if (isWerk) { const a = nav.querySelector('.gx-new'); a.setAttribute('aria-current', 'page'); }
    if (!document.querySelector('.gx-mgear')) document.body.insertAdjacentHTML('beforeend', `<a class="gx-mgear" href="${base}#einstellungen" aria-label="Einstellungen">${ICO.gear}</a>`);
  }
  buildNav();
  document.documentElement.classList.add('gx');

  if (isWerk) { werkSteps(); return; }

  /* ---------- Hilfen ---------- */
  const MS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const WDL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const img = p => { const im = puFirstImg(p); return im && !(im.type || '').startsWith('video') ? imgSrc(im) : ''; };
  const nice = p => esc(p.title || p.ort || 'Post');
  try { TITLES.pult = 'Feed'; TITLES.posten = 'Neuer Post'; } catch (e) {}

  /* Warnung als eine Zeile statt roter Karte */
  const _warnCard = warnCard;
  warnCard = function () {
    const w = overdue();
    if (!w.length) return '';
    const names = w.map(x => `<b>${nice(x.p)}</b> (${esc(WD[parse(x.p.date).getDay()])})`);
    const list = names.length > 2 ? names.slice(0, 2).join(', ') + ' und ' + (names.length - 2) + ' weitere' : names.join(' und ');
    const n = w.length === 1 ? 'Ein Post ist' : (w.length === 2 ? 'Zwei' : w.length) + ' Posts sind';
    const open = S.gxWarnOpen;
    return `<div class="gx-warn" role="status"><span class="gx-dot" aria-hidden="true"></span><span class="gx-wt">${n} nicht sicher rausgegangen: ${list}.</span><button class="gx-link" id="gxWarnT" aria-expanded="${open ? 'true' : 'false'}">${open ? 'Zuklappen' : 'Ansehen'}</button></div>` +
      (open ? `<div class="gx-wlist">${_warnCard().replace(/^<section class="card warn">[\s\S]*?<\/div>/, '').replace(/<\/section>$/, '')}</div>` : '');
  };
  document.addEventListener('click', e => { if (e.target.closest('#gxWarnT')) { S.gxWarnOpen = !S.gxWarnOpen; render(); } });

  /* ---------- Feed (Startseite) ---------- */
  vPult = function () {
    const plan = puPlanned().filter(p => p.format !== 'STORY');
    const next = plan.find(p => plannedTs(p) > Date.now()) || null;
    const feed = puFeed(null);
    const free = nextSlots()[0];
    const goodTxt = goodTimes();
    let h = warnCard();

    if (next) {
      const d = parse(next.date);
      h += `<section class="gx-hero" aria-labelledby="gxNext">
        <button class="gx-hero-img" data-gxedit="${esc(next.id)}" aria-label="${nice(next)} bearbeiten">${img(next) ? `<img src="${esc(img(next))}" alt="">` : `<span class="gx-ph">${esc(FORMATS[next.format] || 'Post')}</span>`}</button>
        <div class="gx-hero-txt">
          <p class="gx-over">Als Nächstes · ${WDL[d.getDay()]}, ${d.getDate()}. ${MS[d.getMonth()]}${next.time ? ', ' + esc(next.time) : ''}</p>
          <h1 id="gxNext" class="gx-xl">${nice(next)}</h1>
          ${next.caption ? `<p class="gx-cap">${esc(next.caption)}</p>` : `<p class="gx-cap muted">Noch keine Caption</p>`}
          ${next.tags ? `<p class="gx-tags">${esc(next.tags)}</p>` : ''}
          <p class="gx-meta">${esc(FORMATS[next.format] || 'Foto')} · ${next.format === 'REEL' ? '9:16' : '4:5'} · ${esc((STATUS[next.status] || STATUS.geplant)[0])}</p>
          <div class="gx-acts"><button class="btn" id="gxCopy" ${next.caption || next.tags ? '' : 'disabled'}>Caption kopieren</button><button class="btn ghost" data-gxedit="${esc(next.id)}">Bearbeiten</button></div>
        </div></section>`;
    } else {
      h += `<section class="gx-hero gx-empty"><div class="gx-hero-txt"><p class="gx-over">Als Nächstes</p><h1 class="gx-xl">Nichts geplant</h1>
        <p class="gx-cap">${free ? `Der nächste freie Termin ist ${esc(fmtD(free[0]))} um ${esc(free[1])}.` : 'Leg einen neuen Post an.'}</p>
        <div class="gx-acts"><a class="btn" href="#posten">Neuer Post</a></div></div></section>`;
    }

    h += `<div class="gx-two">
      <section class="gx-feed" aria-labelledby="gxFeedH"><div class="gx-head"><h2 id="gxFeedH">Dein Feed</h2><span class="small muted">${plan.length ? (plan.length === 1 ? 'Der erste kommt noch' : 'Die ersten ' + Math.min(plan.length, 9) + ' kommen noch') : ''}</span></div>
        <div class="gx-grid">${feed.map(x => { const p = x.post; const s = x.im && !(x.im.type || '').startsWith('video') ? imgSrc(x.im) : '';
          return `<button class="gx-tile" ${p ? `data-gxedit="${esc(p.id)}"` : ''} aria-label="${p ? nice(p) : 'Vorschau'}">${s ? `<img src="${esc(s)}" alt="" loading="lazy">` : `<span class="gx-tl">${p ? esc(FORMATS[p.format] || '') : ''}</span>`}${x.plan && p ? `<span class="gx-chip">${esc(fmtD(p.date).replace(/^\w+,\s*/, ''))}</span>` : ''}</button>`; }).join('')}
          ${Array.from({ length: Math.max(0, 9 - feed.length) }).map(() => '<span class="gx-tile gx-blank"></span>').join('')}</div></section>
      <section class="gx-soon" aria-labelledby="gxSoonH"><h2 id="gxSoonH">Die nächsten Termine</h2><ol class="gx-list">
        ${plan.slice(0, 4).map(p => { const d = parse(p.date); return `<li><button data-gxedit="${esc(p.id)}"><span class="gx-th">${img(p) ? `<img src="${esc(img(p))}" alt="" loading="lazy">` : ''}</span><span class="gx-day"><b>${d.getDate()}</b><small>${WD[d.getDay()]}</small></span><span class="gx-what"><b>${nice(p)}</b><small>${esc(p.time || '')} · ${esc(FORMATS[p.format] || 'Foto')}${p.status === 'instagram' ? ' · in Instagram' : ''}</small></span></button></li>`; }).join('')}
        ${free ? (() => { const d = parse(free[0]); return `<li><button data-gxnew="${free[0]}|${free[1]}"><span class="gx-th gx-add">${ICO.plus}</span><span class="gx-day muted"><b>${d.getDate()}</b><small>${WD[d.getDay()]}</small></span><span class="gx-what"><b>Freier Termin, ${esc(free[1])}</b><small>Post hier anlegen</small></span></button></li>`; })() : ''}
      </ol>${goodTxt ? `<p class="gx-note">${esc(goodTxt)}</p>` : ''}</section></div>`;

    h += poolSection();
    V.innerHTML = `<div class="gx-page">${h}</div>`;
    bindFeed(next);
  };

  /* Gute Zeiten als Satz: je Wochentag die starken Stunden zusammengefasst */
  function goodTimes() {
    const bt = curBT(); if (!bt) return '';
    const mx = btMax(bt) || 1; const by = {};
    Object.entries(bt.grid).forEach(([k, v]) => { if (v < mx * .7) return; const [wd, h] = k.split('|').map(Number); (by[wd] = by[wd] || []).push(h); });
    const days = Object.keys(by).map(Number).map(wd => { const hs = by[wd].sort((a, b) => a - b); const best = Math.max(...hs.map(h => bt.grid[wd + '|' + h]));
      return { wd, best, txt: WDL[wd] + ' ' + (hs.length > 1 ? hs[0] + ' bis ' + hs[hs.length - 1] : hs[0]) + ' Uhr' }; }).sort((a, b) => b.best - a.best).slice(0, 2);
    if (!days.length) return '';
    return (bt.src === 'metricool' ? 'Gute Zeiten laut Metricool: ' : 'Gute Zeiten laut deinen bisherigen Posts: ') + days.map(d => d.txt).join(', ') + '.';
  }

  /* Material: deine Fotos ohne Termin, nach Ordnern */
  function poolSection() {
    const fs = (typeof folders === 'function' ? folders() : []).filter(f => f !== DRAFTS);
    const drafts = upcoming().drafts;
    const tabs = ['Alle', ...fs, ...(drafts.length ? [DRAFTS] : [])];
    if (!S.gxF || !tabs.includes(S.gxF)) S.gxF = 'Alle';
    let items;
    if (S.gxF === DRAFTS) items = drafts.map(p => ({ k: 'p:' + p.id, im: puFirstImg(p), post: p }));
    else items = S.pool.filter(x => S.gxF === 'Alle' || poolFolder(x) === S.gxF).map(x => ({ k: 'g:' + x.id, im: x.img, pool: x }));
    const sel = items.find(x => x.k === S.gxSel) || null;
    const free = nextSlots()[0];
    return `<section class="gx-pool" aria-labelledby="gxPoolH"><div class="gx-head"><h2 id="gxPoolH">Deine Fotos</h2>
      <div class="gx-tabs" role="group" aria-label="Ordner">${tabs.map(t => `<button data-gxf="${esc(t)}" aria-pressed="${t === S.gxF}">${esc(t)}</button>`).join('')}</div></div>
      <div class="gx-strip">${items.map(x => { const s = x.im && !(x.im.type || '').startsWith('video') ? imgSrc(x.im) : '';
        return `<button class="gx-ptile${sel && sel.k === x.k ? ' on' : ''}" data-gxsel="${esc(x.k)}" aria-pressed="${sel && sel.k === x.k ? 'true' : 'false'}" aria-label="${x.post ? nice(x.post) : 'Foto aus ' + esc(poolFolder(x.pool))}">${s ? `<img src="${esc(s)}" alt="" loading="lazy">` : ''}${x.post ? '<span class="gx-chip">Entwurf</span>' : ''}</button>`; }).join('')}
        <button class="gx-ptile gx-padd" id="gxPoolAdd" aria-label="Fotos hinzufügen">${ICO.plus}</button></div>
      ${sel ? `<div class="gx-pact">${sel.post
        ? `<span class="small muted">Entwurf · ${nice(sel.post)}</span><button class="btn" data-gxedit="${esc(sel.post.id)}">Weiter bearbeiten</button>`
        : `<span class="small muted">${esc(poolFolder(sel.pool))}</span><button class="btn" id="gxMake">${free ? `Post für ${esc(fmtD(free[0]))}, ${esc(free[1])}` : 'Post daraus machen'}</button><button class="btn ghost" id="gxAdd">Zum aktuellen Post</button><button class="gx-link" id="gxDel">Entfernen</button>`}</div>` : `<p class="gx-note">Tipp auf ein Foto, um daraus einen Post zu machen.</p>`}
    </section>`;
  }

  function bindFeed(next) {
    V.querySelectorAll('[data-gxedit]').forEach(b => b.onclick = () => editPost(b.dataset.gxedit));
    V.querySelectorAll('[data-gxnew]').forEach(b => b.onclick = () => { const [d, t] = b.dataset.gxnew.split('|'); S.draft = newDraft(d, t); S.cur = 0; S.suggest = null; location.hash = 'posten'; });
    const cp = document.getElementById('gxCopy'); if (cp && next) cp.onclick = () => puCopy(next);
    V.querySelectorAll('[data-gxf]').forEach(b => b.onclick = () => { S.gxF = b.dataset.gxf; S.gxSel = null; render(); });
    V.querySelectorAll('[data-gxsel]').forEach(b => b.onclick = () => { S.gxSel = S.gxSel === b.dataset.gxsel ? null : b.dataset.gxsel; render(); });
    const pa = document.getElementById('gxPoolAdd'); if (pa) pa.onclick = () => poolIn.click();
    const x = S.gxSel && S.gxSel[0] === 'g' ? S.pool.find(y => y.id === S.gxSel.slice(2)) : null;
    const asImg = () => x ? { id: x.img.id, url: null, type: x.img.type || 'image/jpeg', ratio: x.img.ratio || null, poolId: x.id } : null;
    const mk = document.getElementById('gxMake');
    if (mk) mk.onclick = () => { const im = asImg(); if (!im) return; const f = nextSlots()[0]; S.draft = newDraft(f ? f[0] : '', f ? f[1] : ''); S.draft.images = [im]; S.cur = 0; S.suggest = null; S.confirm = false; S.gxSel = null; location.hash = 'posten'; };
    const ad = document.getElementById('gxAdd');
    if (ad) ad.onclick = () => { const im = asImg(); if (!im) return; if (!S.draft.images.some(i => i.id === im.id)) S.draft.images.push(im); if (S.draft.images.length > 1 && S.draft.format === 'POST') S.draft.format = 'KARUSSELL'; toast('Zum aktuellen Post hinzugefügt'); };
    const dl = document.getElementById('gxDel');
    if (dl) dl.onclick = async () => { if (!x) return; S.gxSel = null; try { if (db) await db.collection('pool').doc(x.id).delete(); toast('Aus deinen Fotos entfernt'); } catch (e) { toast('Entfernen hat nicht geklappt'); } render(); };
  }

  /* ---------- Plan: Wärmekarte in Graustufen ---------- */
  const _btCard = btCard;
  btCard = function () { return _btCard().replace(/var\(--amber\)/g, 'var(--ink)').replace('<h2>Beste Zeiten</h2>', '<h2>Wann deine Leute schauen</h2>'); };

  /* ---------- Posten: Weg ins Reel-Studio ---------- */
  const _vPosten = vPosten;
  vPosten = function () {
    _vPosten.apply(this, arguments);
    const f = V.querySelector('[data-fmt]');
    const row = f && f.parentElement;
    if (row && !V.querySelector('.gx-reel')) row.insertAdjacentHTML('afterend', '<p class="gx-reel small muted">Reel selbst schneiden? <a href="werkstatt.html">Im Reel-Studio öffnen</a></p>');
  };

  /* ---------- Zahlen: erst die Aussage, dann die Zahlen ---------- */
  const _vAnalytics = vAnalytics;
  vAnalytics = function () {
    _vAnalytics.apply(this, arguments);
    const t = insight();
    if (t) V.insertAdjacentHTML('afterbegin', `<section class="gx-insight"><h1 class="gx-xl">${esc(t[0])}</h1><p>${esc(t[1])}</p></section>`);
  };
  function insight() {
    const feed = (S.media || []).filter(m => m.type !== 'Story' && m.reach && m.followerPct != null);
    const reels = feed.filter(m => m.type === 'Reel'), rest = feed.filter(m => m.type !== 'Reel');
    const share = a => { const r = a.reduce((s, m) => s + m.reach, 0); return r ? a.reduce((s, m) => s + m.reach * (100 - m.followerPct), 0) / r : null; };
    const sr = share(reels), so = share(rest);
    if (sr == null || so == null) return null;
    const frac = v => v >= 70 ? 'drei Viertel' : v >= 60 ? 'zwei Drittel' : v >= 45 ? 'die Hälfte' : v >= 30 ? 'ein Drittel' : v >= 20 ? 'ein Viertel' : v >= 10 ? 'weniger als ein Fünftel' : 'kaum etwas';
    if (sr - so > 15) return ['Reels holen neue Leute rein.', `Bei deinen Reels kam etwa ${frac(sr)} der Reichweite von Leuten, die dir noch nicht folgen. Bei Fotos und Karussells war es ${frac(so)}. Die erreichen vor allem deine Follower.`];
    if (so - sr > 15) return ['Fotos reichen weiter als Reels.', `Bei Fotos und Karussells kam etwa ${frac(so)} der Reichweite von Nicht-Followern, bei Reels nur ${frac(sr)}.`];
    return ['Reels und Fotos erreichen ähnlich viele neue Leute.', `Etwa ${frac((sr + so) / 2)} der Reichweite kam von Leuten, die dir noch nicht folgen.`];
  }

  /* Erste Darstellung mit dem neuen Feed */
  try { render(); } catch (e) { console.error(e); }

  /* ---------- Reel-Studio: sechs Schritte, einer nach dem anderen ---------- */
  function werkSteps() {
    document.body.classList.add('gx-werk');
    document.title = document.title.replace('Reel-Werkstatt', 'Reel-Studio');
    const h1 = document.querySelector('header.top h1'); if (h1) h1.textContent = 'Reel-Studio';
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
      if (i === 5) { const d = document.getElementById('f-date'), t = document.getElementById('f-time'); return d && d.value ? fmtDE(d.value) + (t && t.value ? ', ' + t.value : '') : 'noch offen'; }
    } catch (e) {} return ''; };
    const fmtDE = v => { const [y, m, d] = v.split('-'); return +d + '.' + +m + '.'; };

    const show = (i, scroll) => {
      cur = i; try { localStorage.setItem('gx-step', String(i)); } catch (e) {}
      cards.forEach(c => c.classList.toggle('gx-off', !STEPS[i].cards.includes(c)));
      rail.innerHTML = '<ol>' + STEPS.map((s, k) => `<li><button type="button" data-st="${k}" ${k === i ? 'aria-current="step"' : ''}><b>${k + 1}</b><span><span class="n">${E(s.name)}</span><span class="v">${E(val(k))}</span></span></button></li>`).join('') + '</ol>';
      rail.querySelectorAll('[data-st]').forEach(b => b.onclick = () => show(+b.dataset.st, true));
      next.innerHTML = (i > 0 ? `<button type="button" class="btn ghost" data-go="${i - 1}">Zurück</button>` : '<span></span>') +
        (i < 5 ? `<button type="button" class="btn" data-go="${i + 1}">Weiter zu ${E(STEPS[i + 1].name)} →</button>` : '');
      next.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(+b.dataset.go, true));
      if (scroll) scrollTo({ top: 0, behavior: 'smooth' });
      if (i >= 3 && (P.items || []).length) autoMusic();
    };
    let t = null; new MutationObserver(m => { if (m.every(x => rail.contains(x.target) || next.contains(x.target))) return; clearTimeout(t); t = setTimeout(() => { const vs = [...rail.querySelectorAll('.v')]; vs.forEach((v, k) => { const nv = val(k); if (v.textContent !== nv) v.textContent = nv; }); }, 200); }).observe(stack, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'value'] });
    document.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => rail.querySelectorAll('.v').forEach((v, k) => { v.textContent = val(k); }), 300); });

    /* ---------- Freie Musik von Openverse, automatisch passend zur Richtung ---------- */
    const TERMS = { ruhig: ['calm piano', 'ambient', 'lofi'], treibend: ['upbeat', 'energetic', 'lofi'], warm: ['acoustic guitar', 'ukulele', 'folk'] };
    const BAD = /(birthday|anthem|hymn|national|ode|speech|interview|lecture|thunder|rain|noise|field recording|test|demo-|sample|bartok|purcell|wagner|mozart|beethoven|bach|chopin|orchestra|symphon)/i;
    const box = document.createElement('div'); box.className = 'gx-free';
    if (by.music) { const tr = document.getElementById('tracks'); (tr || by.music.lastElementChild).insertAdjacentElement(tr ? 'beforebegin' : 'afterend', box); }
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
        (MS.list.length ? `<ol class="gx-flist">${MS.list.slice(0, 5).map((x, k) => `<li class="${k === MS.idx ? 'on' : ''}"><button type="button" class="gx-fplay" data-fp="${k}" aria-label="${E(x.title)} anhören">▶</button><span class="gx-fmeta"><b>${E(x.title)}</b><small>${E(x.creator || '')} · ${Math.round((x.duration || 0) / 1000)} s · ${E(lic(x))}</small></span>${k === MS.idx ? '<span class="small muted">gewählt</span>' : `<button type="button" class="btn ghost sm" data-ft="${k}">Nehmen</button>`}</li>`).join('')}</ol>` : '') +
        `<p class="small muted gx-fnote">Freie Musik aus Wikimedia Commons über Openverse, nur Lizenzen, die kommerzielle Nutzung erlauben. Songs aus den Instagram-Charts gibt es nur in der Instagram-App.</p>`;
      const alt = box.querySelector('#gxAlt'); if (alt) alt.onclick = async () => { if (!MS.list.length) { await search((typeof R !== 'undefined' && R.moodSel) || 'treibend'); } let k = MS.idx + 1; while (k < MS.list.length && !(await take(k))) {} };
      box.querySelectorAll('[data-ft]').forEach(b => b.onclick = () => take(+b.dataset.ft));
      box.querySelectorAll('[data-fp]').forEach(b => b.onclick = () => { const x = MS.list[+b.dataset.fp]; if (!x) return; if (MS.audio && MS.audio.dataset.k === b.dataset.fp && !MS.audio.paused) { MS.audio.pause(); b.textContent = '▶'; return; } if (MS.audio) MS.audio.pause(); box.querySelectorAll('[data-fp]').forEach(y => y.textContent = '▶'); if (window.__gxStopOthers) window.__gxStopOthers(); MS.audio = window.__gxAudio = new Audio(x.url); MS.audio.dataset.k = b.dataset.fp; MS.audio.onended = () => { b.textContent = '▶'; }; MS.audio.play().catch(() => {}); b.textContent = '❚❚'; });
    }
    document.addEventListener('click', e => { const m = e.target.closest('#moods [data-mood]'); if (m && cur === 3) setTimeout(() => { if (P.musicName && P.musicName === MS.ours) autoMusic(true); else search(m.dataset.mood); }, 50); });
    drawFree();
    oneSound();
    show(cur, false);
  }

  /* Immer nur ein Ton: Reel-Vorschau, Hörprobe der Richtung, Probe aus dem Ordner und freie Musik schließen sich aus */
  function oneSound() {
    const stopFree = () => { try { if (window.__gxAudio && !window.__gxAudio.paused) { window.__gxAudio.pause(); document.querySelectorAll('[data-fp]').forEach(y => y.textContent = '▶'); } } catch (e) {} };
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
