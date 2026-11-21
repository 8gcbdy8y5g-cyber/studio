# Umbau Studio Sommer_gram: Werkstatt, Archiv, Zahlen

Stand: 21.11.2026. Diese Datei ist der vollständige Auftrag für einen neuen Chat. Bruno hat entschieden, was bleibt und was wegfällt; die Design-Entscheidungen unten sind ebenfalls festgelegt. Wo etwas nicht eindeutig ist: Bruno fragen, nicht raten. Alles, was Bruno liest, auf Deutsch, jede Antwort an ihn beginnt mit „Bruno,“.

---

## 1. Ausgangslage

**Bisher:** Jeder Post lief so: Studio → Brunos Mac/Chrome → Downloads → GitHub-Branch `medien` → Metricool. Das war zu lang und zu anfällig.

**Ab jetzt:**
1. Bruno schickt Fotos oder ein fertiges Reel direkt in den Claude-Chat.
2. Claude schreibt drei Caption-Varianten, Hashtags und Alt-Text und zeigt eine Feed-Vorschau.
3. Nach „freigeben“ plant Claude über den Metricool-Connector ein.

Das Studio plant also nichts mehr. Es hat noch drei Aufgaben:

| Bereich | Wozu |
|---|---|
| **Werkstatt** | Reels bauen und das fertige MP4 aufs iPhone bzw. in den Chat bringen |
| **Archiv** | sehen, was online ist, so wie das Profil auf Instagram aussieht |
| **Zahlen** | lesen, wie es läuft, ohne Bedienung |

**Datenquelle für Archiv und Zahlen** ist die geplante Aufgabe **„Instagram-Abgleich abends (Studio-App)“** (`trig_01TsFE5vdNuUrtXtDb2fVFUp`, täglich 19:37). Sie liest die Instagram-Insights in Chrome und schreibt über `window.studioAPI` in Firestore:
- `ig_media/<igId>`: Felder `type`, `ts`, `views`, `reach`, `interactions`, `likes`, `comments`, `saves`, `shares`, `follows`, `profile` usw.
- `insights/<JJJJ-MM-TT>`: `followers`, `views30` und `periods.d7/d30/d90` mit `views`, `reach`, `interactions`, `engaged`, `profile`.
- `posts`: Was auf Instagram neu ist, legt sie als `ig-<igId>` an, mit Status `veroeffentlicht` und `source:"instagram"`. Zu Stories legt sie ein Standbild ab: Sie öffnet `#analytics-<igId>` und fügt das Bild per Einfügen ins Overlay ein.

**Alles, was diese Aufgabe braucht, muss weiter funktionieren** (siehe Abschnitt 6).

---

## 2. Design-Entscheidungen (festgelegt)

### Welt: die bestehende „Galerie“, aufgeräumt, keine neue Optik

Seit dem 6.11. liegt `galerie.css`/`galerie.js` als ruhige, fotografische Schicht über dem alten Logo-Design „Horizont“ (Creme, Orange-Verlauf) in `index.html`. Bruno hat die Galerie-Optik angenommen; sie bleibt die einzige sichtbare Welt. Der Umbau ist **Verdichten, kein Redesign**:

- **Farben:**
  - Hell: Grund `#FBFAF7`, Text `#1A1917`, Linien `#E8E5DF`.
  - Dunkel: Grund `#161514`, Text `#F3F0EA`.
  - Genau **ein** Akzent, Ziegelorange: `--accent` `#A8461A` hell, `#E8946A` dunkel.
  - Keine Verläufe, keine Schatten, keine farbigen Kästen.
- **Schrift:**
  - Überschriften in Instrument Serif, Gewicht 400.
  - Alles andere in Inter, nur 400 und 500 (600 nur noch für Zahlen in den Kennzahlen).
  - Zahlen mit `font-variant-numeric: tabular-nums`.
  - Seitentitel h1: 40 px mobil, 56 px am Mac.
- **Flächen:** keine Karten. Abschnitte trennt eine 1-px-Linie (`.gx .card` macht das schon). Fotos tragen die Seite.
- **Eine Quelle für das Aussehen:** `galerie.css`. In `index.html` und `werkstatt.html` die alten `:root`-Token-Blöcke **nicht** umschreiben (sie sind Rückfall, falls `galerie.css` nicht lädt). Aber CSS-Regeln, die nur zu entfernten Ansichten gehören, löschen, in beiden Dateien.
- **Modus:** Werkstatt und Zahlen sind Werkzeug (klar, schnell, gewohnt). Das Archiv ist Galerie (das Foto führt, die Oberfläche tritt zurück).

### Navigation

Drei Bereiche: **Archiv · Werkstatt · Zahlen**. Die Einstellungen sind ein Zahnrad.

- **iPhone (bis 760 px Breite):**
  - Feste Leiste **unten** mit drei Einträgen, Symbol über einem Wort.
  - Höhe 56 px plus `env(safe-area-inset-bottom)`.
  - Hintergrund `--bg` mit 1-px-Linie oben, keine Glas- oder Blur-Effekte.
  - Aktiver Eintrag in `--text`, die anderen in `--text-3`, keine Farbe.
  - Zahnrad oben rechts im Seitenkopf.
- **Mac/iPad (ab 761 px):** die bestehende obere Leiste von `galerie.js` (`buildNav`), Marke links, drei Einträge, Zahnrad rechts.
- **Startseite** ist das Archiv.
- **Wichtig:** Im Home-Bildschirm-Modus auf iOS liefert `env(safe-area-inset-top)` wegen eines offenen WebKit-Fehlers (Bug 301994, iOS 26.1 bis 27 Beta) manchmal 0. Deshalb nichts Wichtiges oben an den Rand kleben. Nur der untere Abstand verlässt sich auf `safe-area-inset-bottom`. Höhen mit `dvh`/`svh` statt `vh`.

### Archiv (Startseite, `#archiv`)

- **Kopf:**
  - Titel „Archiv“.
  - Darunter eine Zeile: „<Follower> Follower · <Anzahl> Beiträge“, aus dem neuesten `insights`-Dokument und der Zahl veröffentlichter Feed-Posts.
  - Rechts ein Knopf **„Neues Reel“**: dunkle Pille `--ink` auf `--on-ink`, Plus-Symbol. Er führt zu `werkstatt.html`.
- **Stories-Zeile** (nur wenn vorhanden):
  - Stories der letzten 14 Tage als waagrechte Reihe kleiner Hochkant-Bilder (9:16, 56 px breit), neueste links.
  - Antippen öffnet dasselbe Detail wie bei Posts.
  - Keine Kreise im Instagram-Look.
- **Raster:**
  - Wie das Instagram-Profil: **3 Spalten, Kacheln im Format 3:4** (Instagram nutzt seit Januar 2025 3:4 statt Quadrat), 2 px Abstand.
  - Auf dem iPhone randlos; am Mac zentriert, maximal 935 px breit.
  - Neueste oben links.
  - Inhalt: alle Posts mit `status === "veroeffentlicht"` und `format !== "STORY"`, sortiert nach `date` + `time` absteigend.
  - Bild über die vorhandenen Helfer (`puFirstImg`, `imgSrc`), `object-fit: cover`.
  - Reels und Karussells bekommen oben rechts ein kleines weißes Symbol mit leichtem dunklem Rand für den Kontrast.
  - **Keine Zahlen auf den Kacheln.**
- **Kachel ohne Bild** (Posts, die der Abgleich neu angelegt hat): Fläche `--field`, mittig Typ und Datum in `--text-2`, also „Reel · 14.11.“. Nie eine leere oder kaputte Kachel.
- **Leistung:**
  - `loading="lazy"` und `decoding="async"` an jedem Bild.
  - Am Raster `content-visibility: auto` mit `contain-intrinsic-size`.
  - Breite und Höhe setzen, damit nichts springt.
- **Detail** (Antippen einer Kachel):
  - Auf dem iPhone ein Blatt von unten, am Mac ein zentriertes Fenster, maximal 520 px breit.
  - Inhalt: großes Bild (bzw. Titelbild), Datum und Uhrzeit, Typ, Caption, falls vorhanden.
  - Darunter die Zahlen aus `ig_media` bzw. `stats`, in dieser Reihenfolge: Aufrufe, Betrachter, Interaktionen, Geteilt, Gespeichert, Neue Follower.
  - Fehlt ein Wert, „–“ zeigen, nie 0 erfinden.
  - Schließen mit ×, Wischen nach unten, Escape und Tippen daneben.
  - Nur lesen, keine Bearbeitung. **Ausnahme: das Bild-Einfügen für den Abgleich** (Abschnitt 6).
- **Leer** (noch nichts veröffentlicht): ein Satz „Hier erscheint, was auf Instagram online ist.“ und der Knopf „Neues Reel“.

### Werkstatt (`werkstatt.html`)

Bleibt mit allen Schritten: Material, Stil, Look, Musik/Takt, Texte, Fertig. Änderungen:

- **Letzter Schritt**: „Rendern und freigeben“ (`#outCard`) heißt jetzt **„Rendern und sichern“**.
- **Ablauf mit zwei Tipps.** Ein Rendern dauert länger als die Freigabe des Browsers für `navigator.share`, die nur wenige Sekunden nach einem Tipp gilt.
  1. Knopf **„Reel rendern“**: Er rendert wie bisher (1080 × 1920, 30 fps, H.264/AAC, MP4) und hält das Ergebnis als `File([...], "sommer_gram-reel-<JJJJ-MM-TT>.mp4", {type:"video/mp4"})` bereit.
  2. Danach erscheinen zwei große Knöpfe nebeneinander:
     - **„Reel teilen“** (primär): `navigator.canShare({files:[mp4]})`, dann direkt `navigator.share({files:[mp4]})`, ohne `await` davor. Auf dem iPhone öffnet sich das Teilen-Menü; dort „Video sichern“ (in Fotos) oder die Claude-App.
     - **„Titelbild teilen“**: dasselbe mit dem JPG, 1080 × 1920.
  3. Gibt es kein `navigator.share` (z. B. Firefox) oder schlägt `canShare` fehl, werden beide Knöpfe zu **„MP4 sichern“** und **„Titelbild sichern“** und laden per `<a download>` mit Blob-URL herunter.
  - `AbortError` (Bruno bricht ab) still ignorieren. Bei `NotAllowedError` den Hinweis „Noch einmal tippen“ zeigen.
- **Keine zwei Dateien in einem Teilen-Aufruf**, Video und Bild gemischt sind auf iOS nicht verlässlich.
- **Fortschritt beim Rendern:** Balken mit Prozent und geschätzter Restzeit. Ab 10 Sekunden steht darunter „Bildschirm anlassen“.
- **Kein Reel-Post mehr im Plan:** In `werkstatt.html` um Zeile 500 den Block mit `var post={id:"reel_"+r.id,...}` und das Speichern dieses Posts entfernen. Das Reel selbst (`reels/<id>` mit `videoAssetId`, `coverAssetId`, `coverT`) wird weiter gespeichert.
- **Titelbild:** `coverDefault(tl)` nimmt bisher 55 % des **letzten** Abschnitts. Neu: 55 % des Abschnitts, der bei 25 % der Gesamtlänge liegt (erste Hälfte). „Titelbild übernehmen“ (`setCover`) bleibt.
- **Titelbild-Vorschau:** Neben dem Titelbild einen 3:4-Rahmen zeigen (Bereich y = 240 bis 1680 von 1920). So sieht Bruno, was im Profilraster übrig bleibt.
- **Kein Umbau der Render-Technik.** `Mp4Muxer` und `VideoEncoder` bleiben, wie sie sind. Die Bibliothek mp4-muxer wird nicht mehr gepflegt (Nachfolger: Mediabunny), funktioniert aber. Ein Wechsel ist ein eigener Auftrag, nicht Teil dieses Umbaus.
- In der Werkstatt-Navigation (`galerie.js`, `werkSteps`/`buildNav`) dieselben drei Einträge wie im Studio; „Werkstatt“ ist dort aktiv.

### Zahlen (`#zahlen`, intern weiter `analytics`)

Nur lesen, keine Eingaben außer dem Zeitraum.

- **Kopf:** Titel „Zahlen“, Zeile „Stand: <Wochentag>, <Datum>, <Uhrzeit>“ aus `checkedAt` des neuesten `insights`-Dokuments, rechts der Zeitraum **7 · 30 · 90 Tage** als Segmentschalter (Standard 30).
- **Sechs Kennzahlen** als Raster: 2 Spalten am iPhone, 3 am Mac. Jede Kennzahl hat die Zahl groß (32 px, Inter 600), darunter den Namen (13 px, `--text-2`) und die Veränderung zum vorigen gleich langen Zeitraum (▲/▼ mit Prozent, nur wenn beide Werte da sind).
  1. **Aufrufe**: `periods.dN.views`
  2. **Betrachter**: `periods.dN.reach`. So heißt „Reichweite“ seit August 2025 in der deutschen Instagram-App; mit dem Zusatz „(Reichweite)“ in kleiner Schrift.
  3. **Follower**: Veränderung im Zeitraum aus den täglichen `insights`-Dokumenten (vorhandene Logik in `vAnalytics`, `fd`), darunter der aktuelle Stand.
  4. **Geteilt pro 100 Betrachter**: Summe `shares` der Feed-Posts im Zeitraum ÷ Summe `reach` × 100, eine Nachkommastelle. Instagram nennt Teilen als stärkstes Signal, um neue Leute zu erreichen.
  5. **Gespeichert pro 100 Betrachter**: genauso mit `saves`.
  6. **Interaktionen**: `periods.dN.interactions`.
- **Verlauf:** eine einfache Linie für Follower und eine für „Aufrufe 30 Tage“, umschaltbar. Das ist die vorhandene `vHistory`. Keine Achsenwand, nur Anfangs- und Endwert beschriftet, Linie in `--text`, letzter Punkt im Akzent.
- **Beiträge im Zeitraum:**
  - Liste mit kleinem Bild (3:4, 48 px), Datum, Typ, Aufrufe und Geteilt.
  - Sortierbar nach Aufrufe und Datum, Standard Aufrufe.
  - Antippen öffnet das Detail-Overlay (vorhandenes `openMO`).
- **Nicht zeigen** (gibt es bei Instagram nicht mehr oder führt in die Irre):
  - Impressionen, Plays, Profilaufrufe als Kennzahl, Website-Klicks
  - Story-Antworten (in der EU immer 0)
  - eine Summe aus Tages-Reichweiten
  - Ø Wiedergabezeit (der Abgleich liefert sie nicht; nichts erfinden)
- **Wegfallen:** der Bereich „Live aus Metricool“ und alles, was `S.mc`, `bridge` oder `gallery/metricool` liest. Das „Zahlen von Hand nachtragen“ in `vHistory` bleibt, zugeklappt.

### Einstellungen (`#einstellungen`)

Es bleiben:
- **Darstellung:** Hell, Dunkel, Automatisch. Beschreibungen neu: „Hell, ruhig wie Papier“ und „Dunkel, die Fotos leuchten mehr“; das Wort „Logo“ und „Creme“ fallen weg.
- **Speichern** (Sync-Status).
- **„Instagram-Zahlen: Stand …, kommen jeden Abend automatisch“.**
- **Anmeldung/Abmelden.**

Raus: die Zeilen „Metricool“ und „Posting-Rhythmus“.

### Bewegung

Nach Emil Kowalskis Regeln: wenig, schnell, mit Sinn.

| Element | Bewegung |
|---|---|
| Wechsel zwischen den drei Bereichen | **keine Animation** (passiert dutzendfach am Tag) |
| Detail-Blatt | rein 240 ms `transform: translateY(100%) → 0` mit `cubic-bezier(0.32,0.72,0,1)`, raus 180 ms; Hintergrund blendet auf `rgba(0,0,0,.4)` |
| Fenster am Mac | rein `opacity 0 → 1` und `scale(.97) → 1` in 200 ms `cubic-bezier(0.23,1,0.32,1)`, Ursprung Mitte |
| Knöpfe und Kacheln | `:active { transform: scale(.97) }`, 120 ms |
| Hover | nur in `@media (hover:hover) and (pointer:fine)` |
| Render-Balken | linear |

- Nie `transition: all`, nur `transform` und `opacity` animieren.
- Die vorhandene Regel `prefers-reduced-motion: reduce` (alles aus) bleibt.

### Texte in der Oberfläche

Kurz, sachlich, ohne Ausrufezeichen und ohne Emojis, Sie-frei (du). Beispiele: „Neues Reel“, „Reel rendern“, „Reel teilen“, „Noch nichts online“, „Stand: Samstag, 21.11., 19:41“.

---

## 3. Was wegfällt

| Bereich | Wo im Code | Hinweis |
|---|---|---|
| Neuer Post / Posten-Editor mit Freigeben | `vPosten`, alle `location.hash="posten"`, Knopf „Neuer Post“ (`.gx-new`), `approve`-Handler, `editPost` | ganz raus |
| Plan (Kalender, freie Termine, Rhythmus) | `vPlan`, `nextSlots`, `goodTimes`, `S.weekStart`, Termin-Logik | ganz raus |
| Pult / Feed-Startseite | `vPult` (in `index.html` und die Überschreibung in `galerie.js`) | ersetzt durch Archiv |
| Raster mit Kandidaten | `vRaster`, `prevN`, „Nächste zeigen“, Ziehen zum Umsortieren, rechte Spalte „Mögliche neue Posts“, `gRank`, `poolSection`, `bindFeed` | ersetzt durch Archiv |
| Material / Pool hochladen, Ordner | Pool-Upload, `folders()`, `S.poolSel` | raus; Fotos kommen per Chat |
| Warnung „nicht sicher rausgegangen“ | `overdue()`, `warnCard`, `.gx-warn` | raus, es gibt keine geplanten Posts mehr |
| Metricool-Brücke | `bridgeMc`, `MC_LIMIT`, `mcCount`, `BRAND_FALLBACK`, `mcInfo`, `S.mc`, `gallery/metricool`, `sendToMetricool`, der Aufruf `use("mcp")` in `index.html` | raus. **`window.claude` selbst bleibt**: Es ist der Speicher-Adapter für `db`, `assets`, `sample` und `downloads` in beiden Dateien |
| Freigabe in der Werkstatt | `renderApprove`, `#approveBox`, Knöpfe „Für Instagram freigeben“ und „Freigabe zurücknehmen“, Status `freigegeben`/`instagram` am Reel | raus; das Reel endet bei „fertig“ |
| Status-Texte für die Planung | in `STATUS`: `geplant`, `freigegeben`, `instagram`, `metricool` | im Archiv nur noch `veroeffentlicht` anzeigen; alte Werte bleiben in den Daten |
| `BRUECKE.md`, `build.py` | Repo | `BRUECKE.md` löschen; `build.py` ist veraltet → löschen |
| Branch `medien` | GitHub | löschen, wenn der Umbau live ist |

**Alte Adressen umleiten:** `#pult`, `#plan`, `#posten`, `#raster` und leere Hashes führen auf `#archiv`. `#zahlen` und `#analytics` zeigen Zahlen.

Neue Liste der Ansichten:
```js
VIEWS = ["archiv","analytics","einstellungen"]
TITLES = {archiv:"Archiv", analytics:"Zahlen", einstellungen:"Einstellungen"}
```

---

## 4. Daten

- Firestore bleibt unangetastet: `posts`, `reels`, `bilder`, `dateien`, `ig_media`, `insights`, `pool`, `gallery`. **Nichts löschen, nichts umbenennen, keine Migration.**
- Alte Posts mit Status `entwurf`, `geplant`, `freigegeben`, `metricool` werden nirgends mehr angezeigt, bleiben aber gespeichert.

---

## 5. Technik

- **Repo:** `8gcbdy8y5g-cyber/studio`, Branch `main`, läuft über GitHub Pages unter https://8gcbdy8y5g-cyber.github.io/studio/. Mit `add_repo` (access push) anhängen und direkt im Repo bearbeiten. Die alten claude.ai-Quellen unter `claude/studio-app/` sind veraltet und werden nicht benutzt.
- **Schichten:** `index.html` (Logik, Daten, alte Grundoptik), `galerie.js` (überschreibt Ansichten und baut Navigation), `galerie.css` (Optik), `werkstatt.html` (Reel-Werkstatt), `studio-firebase.js` (Anmeldung, Speichern, `studioAPI`).
  - Die neue Archiv-Ansicht kommt als `vArchiv` nach `index.html`.
  - Navigation und Darstellung kommen nach `galerie.js`/`galerie.css`.
  - Überschreibungen für gelöschte Ansichten in `galerie.js` mit entfernen.
- **Service Worker:** in `sw.js` die Cache-Version hochzählen (zurzeit `studio-v32`, also `studio-v33`) und die Dateiliste prüfen.
- **Manifest:** `description` auf „Reels bauen, Archiv und Zahlen für sommer_gram“, gleiche Zeile als `<meta name="description">`.
- **Vor jedem Push prüfen:**
  1. Jeden `<script>`-Block und jede JS-Datei mit `node --check` prüfen.
  2. `grep -niE "metricool|bridge|MC_LIMIT|vPlan|vPosten|nextSlots|gRank" index.html galerie.js werkstatt.html` findet nichts Aktives mehr.
  3. Lokal mit Playwright (Chromium und WebKit, Größe 390 × 844 und 1440 × 900) öffnen, ohne Anmeldung: Die Seite darf ohne Konsolenfehler bis zum Anmeldefenster laden.
  4. Danach in Brunos Chrome (Claude in Chrome, vorher Skill `chrome-browser` lesen) die echte Seite öffnen, `studioAPI.who()` muss seine Mail liefern. Dann prüfen: Archiv, Detail, Zahlen in allen drei Zeiträumen, Einstellungen, Werkstatt bis „Reel rendern“ mit einem kurzen Test-Reel aus vorhandenem Material, ohne es zu speichern. Konsole muss frei von Fehlern sein. Screenshots davon an Bruno schicken.
- **Nicht anfassen:** `firebase-config.js`, Anmeldung, Speichern in Firestore, `window.studioAPI` (Namen und Verhalten), der Adapter `window.claude.use("db"|"assets"|"sample"|"downloads")`, Icons.
- **Commits auf Deutsch**, kurz und konkret, ein Commit pro Schritt (z. B. „Planung und Posten entfernt“, „Archiv als Startseite“, „Werkstatt: Reel teilen in zwei Tipps“, „Zahlen aufgeräumt“).

---

## 6. Was für den Instagram-Abgleich weiter gehen muss

Die geplante Aufgabe „Instagram-Abgleich abends“ ist die einzige Datenquelle. Diese Dinge im Code bleiben:

1. `window.studioAPI` mit `who`, `list`, `get`, `set`, `update`.
2. Die Adresse **`#analytics-<igId>`** (auch `#analytics/m/<igId>`) öffnet das Detail-Overlay dieses Elements (`S.pendingMO`, `openMO`), auch wenn die Ansicht jetzt anders aussieht.
3. Im offenen Overlay muss **Einfügen (Cmd+V) eines Bildes** dieses Bild an den Post hängen. Das ist der `paste`-Handler um Zeile 1342 mit `[data-sbfile]`. Das Ziel `[data-sbfile]` muss im neuen Detail vorhanden sein, darf aber unsichtbar sein (z. B. ein verstecktes Datei-Feld).
4. Das Overlay zeigt den Typ („Story“, „Reel“, „Beitrag“) und das Datum als Text. Der Abgleich prüft das per Screenshot.

**Danach die Aufgabe selbst anpassen** (`update_trigger`, nur den Prompt). Bisher holt Schritt 5 nur für **Stories** ein Standbild, deshalb hätten neue Feed-Posts im Archiv kein Bild.
- In Schritt 5 „Für jede Story aus Schritt 2, deren Studio-Post (igId == id) noch keine images hat“ ändern in **„Für jedes Element aus Schritt 2 (Story, Bild, Karussell, Reel), dessen Studio-Post (igId == id) noch keine images hat“**.
- Bei Bild und Karussell nimmt das Snippet schon das größte Bild, bei Reels das Videostandbild. Am Snippet selbst nichts ändern.
- Die Aufgabe danach einmal mit `fire_trigger` starten. Prüfen, dass die Posts der letzten 30 Tage ein Bild haben.
- In Schritt 3c bleibt alles; der Fall „passender geplanter Studio-Post“ kommt nur nicht mehr vor.
- **Vorher Bruno kurz fragen**, ob die Aufgabe so geändert werden darf.

Die Aufgabe **„Studio → Metricool“** (`trig_01APUXjgbAKiEqhPSYD6mRHr`, deaktiviert) nach dem Umbau löschen, vorher Bruno fragen. „Monatsbericht sommer_gram“ bleibt, sie hängt nicht am Studio.

---

## 7. Reihenfolge

1. Repo anhängen, klonen, diese Datei, `index.html`, `galerie.js`, `galerie.css` und `werkstatt.html` lesen.
2. Ansichten und Code aus Abschnitt 3 entfernen, Umleitungen setzen, Prüfen (Abschnitt 5, Punkte 1–2).
3. Archiv bauen (`vArchiv`, Raster, Stories-Zeile, Detail mit `[data-sbfile]`).
4. Navigation unten (iPhone) und oben (Mac) für Studio und Werkstatt.
5. Zahlen aufräumen.
6. Werkstatt: Reel-Post entfernen, Titelbild-Standard, 3:4-Rahmen, „Rendern und sichern“ mit zwei Tipps.
7. Einstellungen, Manifest, `sw.js`, `BRUECKE.md` und `build.py` löschen.
8. Komplett prüfen (Abschnitt 5, Punkte 1–4), pushen, Pages-Build abwarten, in Brunos Chrome prüfen.
9. Bruno fragen, dann: Abgleich anpassen und einmal starten, Aufgabe „Studio → Metricool“ löschen, Branch `medien` löschen.
10. Bruno eine kurze Meldung mit Screenshots (iPhone-Größe und Mac) schicken.

---

## 8. Fertig ist der Umbau, wenn

- [ ] Die Navigation nur Archiv, Werkstatt und Zahlen zeigt, unten am iPhone und oben am Mac, das Zahnrad separat.
- [ ] Die Startseite das Archiv ist: 3 Spalten, 3:4, neueste oben links, keine Zahlen auf den Kacheln, Kacheln ohne Bild zeigen Typ und Datum.
- [ ] Ein Tipp auf eine Kachel das Detail mit Bild, Caption und Zahlen öffnet; „–“ für fehlende Werte.
- [ ] Es keinen Weg mehr gibt, im Studio einen Post anzulegen, zu planen oder freizugeben; alte Adressen landen im Archiv.
- [ ] Ein fertiges Reel sich mit „Reel rendern“ und dann „Reel teilen“ auf dem iPhone ins Teilen-Menü bringen lässt, am Mac per Download.
- [ ] Die Werkstatt keinen Post mehr anlegt und das Titelbild standardmäßig aus der ersten Hälfte nimmt.
- [ ] Zahlen genau die sechs Kennzahlen, den Verlauf und die Beitragsliste zeigt, ohne Metricool-Reste.
- [ ] `#analytics-<igId>` das Overlay öffnet und Einfügen dort ein Bild an den Post hängt.
- [ ] `grep -niE "metricool|bridge|MC_LIMIT"` in den drei Code-Dateien nichts Aktives findet.
- [ ] Die Seite auf iPhone und Mac ohne Konsolenfehler lädt, in hell und dunkel.
- [ ] `BRUECKE.md`, `build.py` und der Branch `medien` gelöscht sind, die Abgleich-Aufgabe angepasst ist (nach Brunos Ja).
