#!/usr/bin/env python3
"""Baut die Web-App aus den claude.ai-Versionen.
Aufruf: python3 build.py <studio.html> <werkstatt.html> <zielordner>
- index.html: Studio Sommer_gram (Posten, Plan, Raster, Zahlen, Einstellungen)
- werkstatt.html: Reel-Werkstatt, gleiche Anmeldung und Datenbank, eigener Punkt „Reels“ in der Seitenleiste
Farben, Schrift und Logo kommen aus den claude.ai-Versionen (Logo „Horizont“, siehe logo/logo.md).
Die Quell-Dateien sind die Artifact-Dateien ohne Skelett (beginnen mit <title>)."""
import sys, re, pathlib

studio_src = pathlib.Path(sys.argv[1]).read_text()
werk_src = pathlib.Path(sys.argv[2]).read_text()
out = pathlib.Path(sys.argv[3])


def galerie(h):
    """Design „Galerie“ (06.11.2026): galerie.css und galerie.js liegen im Repo und kommen in beide Seiten."""
    if 'galerie.css' in h:
        return h
    i = h.index('</head>')
    h = h[:i] + '<link rel="stylesheet" href="galerie.css">\n<script>document.documentElement.classList.add("gx")</script>\n' + h[i:]
    j = h.rindex('</body>')
    return h[:j] + '<script src="galerie.js"></script>\n' + h[j:]


def rep(s, a, b, cnt=1):
    n = s.count(a)
    assert n == cnt, (a[:90], n)
    return s.replace(a, b)


def split(src):
    """Teilt eine Artifact-Datei in Kopf (Schrift-Link, Theme-Skript), Stil, Markup und Hauptskript."""
    i = src.index('<title>')
    src = src[i:]
    style_start = src.index('<style>'); style_end = src.index('</style>') + len('</style>')
    pre = src[:style_start]
    pre = re.sub(r'<title>.*?</title>\s*', '', pre)
    pre = re.sub(r'<meta name="claude:[^>]*>\s*', '', pre).strip()
    script_start = src.rindex('<script>'); script_end = src.rindex('</script>') + len('</script>')
    return pre, src[style_start:style_end], src[style_end:script_start], src[script_start:script_end]


def head(title, desc):
    return f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Studio">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#F7EFE4" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1E1B19" media="(prefers-color-scheme: dark)">
<meta name="color-scheme" content="light dark">
<meta name="description" content="{desc}">
<title>{title}</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/svg+xml" href="icon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
<link rel="apple-touch-icon" href="icon-180.png">
'''


# Gemeinsamer Start: Speicher und Bilder kommen aus studio-firebase.js (Firebase) statt aus Claude.
BOOT_STUDIO = '''<script>
/* Web-App: Speicher und Bilder kommen aus studio-firebase.js (Firebase) statt aus Claude. */
(function(){
  var res,p=new Promise(function(r){res=r;});window.__studioResolve=res;window.__STUDIO_APP=true;window.__studioApi=p;
  window.claude={use:function(n){return p.then(function(api){return api[n]||null;});}};
  var T="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",cache=new Map(),pend=new Set();
  window.__bildSet=function(id,url){cache.set(id,url);};
  window.__bild=function(id){var u=cache.get(id);if(u)return u;if(!pend.has(id)){pend.add(id);
    p.then(function(api){return api.loadBild(id);}).then(function(url){if(!url)return;cache.set(id,url);
      document.querySelectorAll('img[src$="#bid='+id+'"]').forEach(function(i){i.src=url;});}).catch(function(){}).then(function(){pend.delete(id);});}
    return T+"#bid="+id;};
  if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});
})();
</script>
<script type="module" src="studio-firebase.js"></script>
'''

EXTRA_CSS = ('<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
             'body{margin:0;min-height:100dvh}html{overscroll-behavior-y:none}img{max-width:100%}[hidden]{display:none!important}</style>\n')

FILM_ICON = ('<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2.5"/>'
             '<path d="M10 9.2v5.6l4.6-2.8z"/><path d="M5 6.5h2M5 17.5h2M17 6.5h2M17 17.5h2"/></svg>')

# ---------------- Studio ----------------
pre, style, markup, script = split(studio_src)
script = rep(script, 'const imgSrc=im=>im&&(im.local||im.url||(im.id?"/_blob/"+im.id:""));',
  'const imgSrc=im=>{if(!im)return "";if(im.local)return im.local;const id=im.id||((im.url||"").match(/_blob\\/([^/?#]+)/)||[])[1];if(window.__bild&&id)return window.__bild(id);return im.url||(id?"/_blob/"+id:"")};')
script = rep(script, '"Vorschläge gehen nur im geöffneten Studio auf claude.ai."', '"Caption-Vorschläge schreibt dir Claude im Chat."')
# Reels-Punkt in der Seitenleiste (zwischen Raster und Zahlen)
markup = rep(markup, '  <a class="nv" href="#analytics" data-v="analytics">',
  f'  <a class="nv" href="werkstatt.html" data-v="reels">{FILM_ICON}Reels</a>\n  <a class="nv" href="#analytics" data-v="analytics">')
# Reel-Posts aus der Werkstatt: Änderungen an Termin, Text und Status gehen zurück an das Reel
script = rep(script, 'if(db){await db.collection("posts").doc(p.id).set(clean)}',
  'if(db){await db.collection("posts").doc(p.id).set(clean);if(p.reelId){const rs={freigegeben:1,instagram:1,veroeffentlicht:1};'
  'db.collection("reels").doc(p.reelId).update({caption:p.caption||"",tags:p.tags||"",ort:p.ort||"",date:p.date||"",time:p.time||"",'
  'status:rs[p.status]?p.status:"fertig",updatedAt:p.updatedAt}).catch(()=>{})}}')
# Im Posten-Bereich: Reel aus der Werkstatt öffnen
script = rep(script, '<div class="row">${d.id?statusHTML(d.status):""}',
  '<div class="row">${d.reelId?`<a class="btn ghost sm" href="werkstatt.html#reel=${esc(d.reelId)}">In der Werkstatt öffnen</a>`:""}${d.id?statusHTML(d.status):""}')
html = (head('Studio Sommer_gram', 'Planen, posten und auswerten für sommer_gram') + pre + '\n' + style + '\n' + EXTRA_CSS +
        '</head>\n<body>\n' + markup.strip() + '\n' + BOOT_STUDIO + script + '\n</body>\n</html>\n')
html = re.sub(r'<meta name="claude:[^>]*>\n?', '', html)
(out / 'index.html').write_text(galerie(html))
print('index.html', len(html))

# Seitenleiste aus dem Studio für die Werkstatt übernehmen (Links zurück ins Studio)
nav = re.search(r'<nav class="side".*?</nav>', markup, re.S).group(0)
nav = nav.replace('href="#posten" id="home"', 'href="index.html#posten"')
nav = re.sub(r'class="nv" href="#(\w+)"', r'class="nv" href="index.html#\1"', nav)
nav = nav.replace('href="werkstatt.html" data-v="reels"', 'href="werkstatt.html" data-v="reels" aria-current="page"')
nav = nav.replace('id="lgAs"', 'id="wkAs"').replace('url(#lgAs)', 'url(#wkAs)').replace('id="lgAc"', 'id="wkAc"').replace('url(#lgAc)', 'url(#wkAc)')
side_css = style[style.index('/* Seitenleiste */'):style.index('/* Als Nächstes */')]

# ---------------- Werkstatt ----------------
wpre, wstyle, wmarkup, wscript = split(werk_src)
# Hell/Dunkel wie im Studio (Einstellung „sg-theme“, ohne Wahl dunkel)
theme_js = ('<script>(function(){var t="dark";try{t=localStorage.getItem("sg-theme")||"dark"}catch(e){}'
            'if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)})()</script>')
werk_css = ('<style>\n/* In der App: Seitenleiste wie im Studio */\n'
            ':root{--side-w:92px;--side:#F1E7DA;--amber:#D9612E;--on-amber:#2A2420}\n'
            '@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--side:#181513;--amber:#E9875A;--on-amber:#1E1B19}}\n'
            ':root[data-theme="dark"]{--side:#181513;--amber:#E9875A;--on-amber:#1E1B19}\n'
            'body{padding-left:calc(var(--side-w) + env(safe-area-inset-left,0px))}\n'
            '.wrap{max-width:1240px}\n'
            '@media (min-width:701px){.brand .mark{display:none}}\n'
            + side_css +
            '@media (max-width:700px){:root{--side-w:0px}body{padding-bottom:calc(72px + env(safe-area-inset-bottom,0px))}'
            'nav.side{top:auto;right:0;width:auto;height:auto;flex-direction:row;justify-content:space-around;padding:6px max(8px,env(safe-area-inset-right,0px)) calc(6px + env(safe-area-inset-bottom,0px)) max(8px,env(safe-area-inset-left,0px));border-right:0;border-top:1px solid var(--line)}'
            '.side .logo,.side .sp{display:none}.side a.nv{width:auto;flex:1;padding:6px 0;font-size:10px}}\n'
            '.side a.nv svg{fill:none}\n</style>\n')

BOOT_WERK = '''<script>
/* Reel-Werkstatt in der App: Datenbank und Anmeldung wie im Studio (studio-firebase.js).
   Videos, Titelbilder und Musik liegen in Firebase. Statt der claude.ai-Adressen /_blob/<id>
   lädt die Seite die Dateien selbst und hält sie als Objekt-URL bereit. */
(function(){
  var res,p=new Promise(function(r){res=r;});window.__studioResolve=res;window.__STUDIO_APP=true;
  var urls=new Map(),blobs=new Map(),pend=new Map(),refreshT=null;
  function put(id,b){blobs.set(id,b);if(!urls.has(id))urls.set(id,URL.createObjectURL(b));}
  function load(id){if(blobs.has(id))return Promise.resolve(blobs.get(id));if(pend.has(id))return pend.get(id);
    var q=p.then(function(api){return api.files.load(id);}).then(function(b){pend.delete(id);if(!b)throw new Error("Datei fehlt: "+id);put(id,b);return b;},
      function(e){pend.delete(id);throw e;});pend.set(id,q);return q;}
  function refresh(){clearTimeout(refreshT);refreshT=setTimeout(function(){
    try{renderResult()}catch(e){}try{renderList()}catch(e){}},60);}
  window.__bl=function(id){return load(id).then(function(){return urls.get(id);});};
  window.__bs=function(id){if(!id)return "";var u=urls.get(id);if(u)return u;load(id).then(refresh,function(){});return "";};
  window.__bf=function(id){return load(id).then(function(b){return {blob:function(){return Promise.resolve(b);}};});};
  var downloads={save:function(o){var data=o.data,name=o.filename||"reel.mp4";
    var file=new File([data],name,{type:data.type||"video/mp4"});
    var touch=("ontouchend" in document)&&navigator.maxTouchPoints>0;
    if(touch&&navigator.canShare&&navigator.canShare({files:[file]}))return navigator.share({files:[file]}).catch(function(e){if(e&&e.name==="AbortError"){var x=new Error("abgebrochen");x.code="declined";throw x;}throw e;});
    var a=document.createElement("a");a.href=URL.createObjectURL(file);a.download=name;document.body.appendChild(a);a.click();
    setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},4000);return Promise.resolve();}};
  function assetsOf(api){return {upload:function(blob,o){var type=(o&&o.type)||blob.type||"";
    if(/^image\\//.test(type)){var f=blob instanceof File?blob:new File([blob],"bild.jpg",{type:type});
      return api.assets.upload(f).then(function(r){put(r.id,blob);return r;});}
    return api.files.save(blob,{type:type}).then(function(id){put(id,blob);return {id:id,url:null};});}};}
  window.claude={use:function(n){return p.then(function(api){
    if(n==="db")return api.db;if(n==="assets")return assetsOf(api);if(n==="downloads")return downloads;if(n==="user")return api.user||null;return null;});}};
  /* Fertige Reels erscheinen als Reel-Post im Plan des Studios. Termin, Text und Status lassen sich dort weiterplanen. */
  window.__mirrorReel=function(r){if(!r||!r.videoAssetId)return;p.then(function(api){
    var st={freigegeben:"freigegeben",instagram:"instagram",veroeffentlicht:"veroeffentlicht"}[r.status]||(r.date&&r.time?"geplant":"entwurf");
    var post={id:"reel_"+r.id,title:r.title||r.hook||"Reel",format:"REEL",images:r.coverAssetId?[{id:r.coverAssetId,type:"image/jpeg",ratio:0.5625}]:[],
      ort:r.ort||"",caption:r.caption||"",tags:r.tags||"",date:r.date||"",time:r.time||"",mediaUrl:"",status:st,reelId:r.id,
      video:{id:r.videoAssetId,dur:r.dur||0,size:r.sizeBytes||0},updatedAt:new Date().toISOString()};
    return api.db.collection("posts").doc(post.id).set(post);}).catch(function(e){console.warn("Reel-Post",e);});};
  /* Belegte Tage aus dem Plan des Studios (ohne Entwürfe und ohne den eigenen Reel-Post) */
  p.then(function(api){api.db.collection("posts").onSnapshot(function(snap){var t=new Set();
    snap.docs.forEach(function(d){var x=d.data();var mine=typeof P!=="undefined"&&x.reelId===P.id;if(x.date&&x.status!=="entwurf"&&x.format!=="STORY"&&!mine)t.add(x.date);});
    window.__taken=t;try{renderSlots()}catch(e){}},function(){});});
  var m=location.hash.match(/reel=([\\w-]+)/);window.__wantReel=m?m[1]:null;
  if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});
})();
</script>
<script type="module" src="studio-firebase.js"></script>
'''

# claude.ai-Adressen ersetzen
wscript = rep(wscript, 'function playTrackPreview(t){if(!t)return;', 'async function playTrackPreview(t){if(!t)return;try{await __bl(t.assetId)}catch(e){toast("Das Stück lädt gerade nicht");return}')
wscript = re.sub(r'fetch\("/_blob/"\+([\w.]+)\)', r'__bf(\1)', wscript)
wscript = re.sub(r'"/_blob/"\+([\w.]+)', r'__bs(\1)', wscript)
assert '/_blob/' not in wscript, 'noch /_blob/ übrig'
# Texte, die auf claude.ai verweisen
wscript = rep(wscript, 'Die Stücke aus deinem Ordner erscheinen hier, wenn die Werkstatt auf claude.ai läuft.', 'Noch keine Stücke im Studio. Claude lädt sie aus deinem Musik-Ordner hoch.')
wscript = rep(wscript, 'Sichern geht nur im geöffneten Studio auf claude.ai.', 'Sichern geht hier gerade nicht.')
wscript = rep(wscript, 'Gespeichert wird nur im geöffneten Studio auf claude.ai', 'Gespeichert wird erst nach der Anmeldung')
wscript = rep(wscript, 'Hier erscheinen deine Reels, wenn die Werkstatt auf claude.ai läuft.', 'Hier erscheinen deine Reels nach der Anmeldung.')
wscript = rep(wscript, '"Vorschläge gehen nur im geöffneten Studio auf claude.ai."', '"Caption-Vorschläge schreibt dir Claude im Chat."')
wscript = rep(wscript, 'Gerade ohne Speicher: Reels bleiben nur in diesem Fenster. Öffne die Werkstatt auf claude.ai, damit sie im Studio landen.', 'Gerade ohne Speicher: Reels bleiben nur in diesem Fenster.')
# Termin-Vorschläge: Tage, an denen im Studio schon etwas geplant ist, überspringen (wie im Studio)
wscript = rep(wscript, 'if(i===0&&t&&t<=now)continue;if(t)out.push([iso(x),t])}', 'if(i===0&&t&&t<=now)continue;if(t&&!(window.__taken&&window.__taken.has(iso(x))))out.push([iso(x),t])}')
# Nach dem Speichern: Reel-Post im Studio anlegen oder aktualisieren
wscript = rep(wscript, 'await db.collection("reels").doc(P.id).set(body);R.dirty=false}', 'await db.collection("reels").doc(P.id).set(body);R.dirty=false;window.__mirrorReel&&window.__mirrorReel(body)}')
# Direkt ein bestimmtes Reel öffnen (Link aus dem Studio: werkstatt.html#reel=<id>)
wscript = rep(wscript, 'if(mine&&!R.dirty&&mine.status!==P.status){P.status=mine.status;renderHeader();renderApprove()}renderList()},',
  'if(mine&&!R.dirty&&mine.status!==P.status){P.status=mine.status;renderHeader();renderApprove()}renderList();'
  'if(window.__wantReel&&R.list.some(x=>x.id===window.__wantReel)){const id=window.__wantReel;window.__wantReel=null;openReel(id)}},')

wmarkup = wmarkup.replace('<div class="wrap">', nav + '\n<div class="wrap">', 1)
whtml = (head('Reel-Werkstatt · Studio Sommer_gram', 'Reels schneiden für sommer_gram') + theme_js + '\n' + wpre + '\n' + wstyle + '\n' +
         werk_css + EXTRA_CSS + '</head>\n<body>\n' + wmarkup.strip() + '\n' + BOOT_WERK + wscript + '\n</body>\n</html>\n')
whtml = re.sub(r'<meta name="claude:[^>]*>\n?', '', whtml)
(out / 'werkstatt.html').write_text(galerie(whtml))
print('werkstatt.html', len(whtml))
