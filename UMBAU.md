# Umbau Studio Sommer_gram: raus aus der Posting-Kette

Stand: 21.11.2026. Diese Anweisung ist für einen Chat, der das Studio umbaut. Bruno hat entschieden, was wegfällt und was bleibt. Bei Unklarheiten vorher Bruno fragen, nicht raten.

## Warum

Bisher lief jeder Post über eine lange Kette:

Studio → Brunos Mac und Chrome → Downloads-Ordner → GitHub-Zwischenablage → Metricool

Die Kette ist anfällig und hängt am Mac. Neuer Ablauf ab sofort:

1. Bruno schickt Fotos oder ein fertiges Reel in den Claude-Chat.
2. Claude wählt aus, schreibt Caption, Hashtags und Alt-Text und zeigt die Feed-Vorschau als Bild.
3. Bruno sagt „freigeben“, Claude plant direkt über den Metricool-Connector ein.

Das Studio wird dafür **nicht mehr gebraucht**. Es bleibt als Reel-Werkstatt und als Archiv mit Zahlen.

## Was bleibt

**1. Reel-Werkstatt (`werkstatt.html`)**
Sie bleibt komplett: Material, Stil, Look, Musik und Takt, Texte, Fertig. Am Ende steht ein großer Button **„Reel sichern“**:
- Er lädt das fertige MP4 und das Titelbild als JPG herunter.
- Auf dem iPhone öffnet er das Teilen-Menü, damit Bruno das Reel direkt in den Claude-Chat schicken kann.

Die Werkstatt legt **keinen Reel-Post** mehr im Plan an. Das betrifft die Stelle um Zeile 500, `var post={id:"reel_"+r.id,...}`.

Das Titelbild darf nicht automatisch das letzte Bild sein. Standard ist ein Bild aus der ersten Hälfte. Das bestehende „Titelbild übernehmen“ (`setCover`) bleibt.

**2. Zahlen** (`vAnalytics`, `vHistory`, Instagram-Insights)
- Bleiben **nur lesend**.
- Der Teil „Live aus Metricool“ mit Brückendaten (`S.mc.bridge`, `gallery/metricool`) fällt weg. Ohne Brücke werden diese Daten nicht mehr aktualisiert.

**3. Archiv, also das Raster der veröffentlichten Posts**
- Zeigt nur noch, was online ist, neuestes oben links. Reels mit Titelbild, wenn vorhanden.
- Ohne Kandidaten, ohne „Nächste zeigen“, ohne Ziehen zum Umsortieren.

**4. Einstellungen**
Bleiben, soweit sie Darstellung, Anmeldung oder Sicherung betreffen.

**5. Daten**
- Alle Firestore-Daten bleiben unangetastet: `posts`, `reels`, `bilder`, `dateien`, `ig_media`, `insights`, `pool`, `gallery`.
- Nichts löschen. Alte Posts mit Status `metricool`, `freigegeben` oder `entwurf` bleiben als Archiv.

## Was wegfällt

| Bereich | Wo im Code | Hinweis |
|---|---|---|
| Neuer Post / Posten-Editor mit Freigeben | `vPosten`, Button „Neuer Post“, `approve`-Handler | ganz raus |
| Plan (Kalender, freie Termine, Rhythmus) | `vPlan`, `nextSlots`, Termin-Logik | ganz raus |
| Material / Pool hochladen, Ordner, „Mögliche neue Posts“ | Pool-Upload, `folders()`, `gRank`, rechte Spalte in `vRaster` | raus; Fotos kommen per Chat |
| Pult „Als Nächstes“ | `vPult` | ersetzen durch einfache Startseite (siehe unten) |
| Metricool-Brücke | `bridgeMc`, `MC_LIMIT`, `mcCount`, `BRAND_FALLBACK`, Metricool-Status in `mcInfo`, `gallery/metricool`, `sendToMetricool`, `mcp`-Pfade über `window.claude` | raus; Metricool spricht nur noch Claude im Chat an |
| Status „Freigegeben, geht an Metricool“ | `STATUS` | raus aus der Oberfläche, alte Werte im Archiv nur anzeigen |
| `BRUECKE.md` | Repo | löschen, sobald der Umbau live ist |
| Branch `medien` | GitHub | löschen, sobald der Umbau live ist |

**Neue Navigation:** drei Punkte, **Werkstatt · Archiv · Zahlen**. Startseite ist das Archiv mit einem gut sichtbaren Einstieg „Neues Reel“ in die Werkstatt.

## Technische Hinweise

- **Code direkt im Repo bearbeiten** (`8gcbdy8y5g-cyber/studio`, Branch `main`, läuft über GitHub Pages). `build.py` und die claude.ai-Quellen unter `claude/studio-app/` sind veraltet und dürfen den aktuellen Stand nicht überschreiben.
- **Neugestaltung:** `galerie.js` und `galerie.css` liegen als Schicht über `index.html` und `werkstatt.html`. Wenn Ansichten wegfallen, dort die Verweise und Navigation mit anpassen.
- **Service Worker:** In `sw.js` die Cache-Version hochzählen, zurzeit `studio-v32`.
- **Prüfen vor dem Push:**
  - Alle `<script>`-Blöcke mit `node --check` testen.
  - Danach die Seite in Brunos Chrome öffnen. Er ist angemeldet; `window.studioAPI.who()` liefert seine Mail.
  - Werkstatt, Archiv und Zahlen durchklicken, ohne Fehler in der Konsole.
- **Nicht anfassen:** `firebase-config.js`, die Anmeldung, das Speichern in Firestore und `window.studioAPI`.
- **Commits auf Deutsch**, kurz und konkret.

## Geplante Aufgaben

- **„Studio → Metricool“** (täglich 19:42) ist **deaktiviert**. Nach dem Umbau kann sie gelöscht werden, vorher Bruno fragen.
- **„Monatsbericht sommer_gram“** (am 1. jedes Monats) bleibt. Sie hängt nicht am Studio.

## Fertig ist der Umbau, wenn

- [ ] Die Navigation nur noch Werkstatt, Archiv und Zahlen zeigt.
- [ ] Es keinen Weg mehr gibt, im Studio einen Post zu planen oder freizugeben.
- [ ] Ein fertiges Reel sich mit einem Tipp als MP4 sichern und auf dem iPhone teilen lässt.
- [ ] Das Archiv alle veröffentlichten Posts zeigt, keine Kandidaten.
- [ ] Im Code keine Metricool- oder Brücken-Reste mehr stehen (`grep -i "metricool\|bridge\|MC_LIMIT"` findet nichts Aktives).
- [ ] Die Seite auf iPhone und Mac ohne Konsolenfehler lädt.
- [ ] `BRUECKE.md` und der Branch `medien` gelöscht sind.
