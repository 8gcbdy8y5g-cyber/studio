# Brücke Studio → Metricool

Claude plant freigegebene Posts aus dem Studio bei Metricool ein und schreibt Zahlen und beste Zeiten zurück.
Läuft jeden Abend als geplante Aufgabe und auf Zuruf („schick raus“). Brunos Mac muss an sein, Chrome mit Claude in Chrome offen, im Studio angemeldet.

Feste Werte:
- Metricool-Marke: BS Photography, brandId/blogId `7258133`, Zeitzone `Europe/Berlin`, Instagram `sommer_gram`
- Studio: https://8gcbdy8y5g-cyber.github.io/studio/ (in Chrome angemeldet; `window.studioAPI` ist da, `studioAPI.who()` liefert die Mail)
- Downloads am Mac: `/Volumes/Samsung SSD 990 Pro 2TB/Downloads` (Ordnerfreigabe nötig)
- Öffentliche Zwischenablage für Medien: Branch `medien` im Repo `8gcbdy8y5g-cyber/studio`, URL `https://raw.githubusercontent.com/8gcbdy8y5g-cyber/studio/medien/<datei>`

## Ablauf

1. Studio in Chrome öffnen (neuer Tab), 4 s warten, `studioAPI.who()` prüfen. Ist niemand angemeldet: abbrechen und Bruno Bescheid geben, nicht selbst anmelden.
2. Wartende Posts holen: `(await studioAPI.list('posts')).filter(p => p.status === 'freigegeben')`.
   - Termin liegt in der Vergangenheit oder weniger als 15 Minuten in der Zukunft: nicht senden, im Bericht nennen (Bruno muss neu planen).
   - Keine Bilder und keine `mediaUrl`: nicht senden, im Bericht nennen.
3. Medien je Post in die Downloads legen: für jedes `p.images[i]` → `await studioAPI.sichern(id, 'studio-mc-<postId>-<i>.<jpg|mp4>')` (Endung nach `type`). Steht in `p.mediaUrl` schon ein öffentlicher Link, den nehmen.
4. Dateien mit `device_stage_files` holen, in einen frischen Klon des Branches `medien` legen und als **einzelnen Orphan-Commit** force-pushen (so bleibt nichts in der Historie liegen).
5. Pro Post `createScheduledPost` (blogId `7258133`):
   - `date`: `<date>T<time>:00<Offset Berlin>`; `publicationDate`: `{dateTime:"<date>T<time>:00", timezone:"Europe/Berlin"}`
   - `media`: die raw-Links in der Reihenfolge von `p.images`
   - `instagramData.type`: REEL bei Reel, STORY bei Story, sonst POST (Karussell = POST mit mehreren Medien)
   - `text`: Caption + Leerzeile + Hashtags; bei STORY leer
   - `autoPublish:true`, `draft:false`, `providers:[{network:"instagram"}]`, übrige Felder leer wie im Tool beschrieben
   Metricool kopiert die Medien sofort auf seinen eigenen Server (`static.metricool.com`).
6. Zurückschreiben: `studioAPI.update('posts', id, {status:'metricool', plannerUrl, updatedAt:new Date().toISOString()})`.
   Bei Fehler Status lassen und im Bericht nennen.
7. Zwischenablage leeren: Branch `medien` wieder auf einen leeren Orphan-Commit (nur README) force-pushen.
8. Zahlen und beste Zeiten: `getBestTimeToPostByNetwork` (heute bis +6 Tage, instagram) und `getAnalyticsDataByMetrics` (letzte 30 Tage, `IGEV01, IGEV05, IGEV06, IGEV38`).
   In `gallery/metricool` schreiben: `{brandId:'7258133', instagram:'sommer_gram', lastSync:<ISO>, kpis:[{l:'Follower',v:<letzter Tag>},{l:'Aufrufe',v:<Summe>},{l:'Reichweite',v:<Summe>},{l:'Interaktionen',v:<Summe>}], bestTimes:{'<wochentag 0=So>|<stunde>':wert}}`.
   Firestore erlaubt keine verschachtelten Listen.
9. Eigenen Tab schließen. Kurzer Bericht an Bruno: was eingeplant wurde (Datum, Uhrzeit, Titel), was nicht und warum.

Die heruntergeladenen Dateien `studio-mc-*` bleiben in den Downloads liegen, solange kein Löschrecht erteilt ist; dann nach `_to_delete/` verschieben.
