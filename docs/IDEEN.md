# Ideenspeicher

Hier landet alles, was nicht zur laufenden Scheibe gehört. Einmal im Monat wird sortiert: Die besten zwei oder drei Ideen werden Scheiben im Fahrplan.
Was umgesetzt ist, wandert beim Abschluss einer Scheibe nach „Erledigt“, mit Datum und Scheibe.

## Für später vorgemerkt
- Kassenbons vom Foto lesen, als Versuch hinter einem Schalter, mit Kontrolle über die Bonsumme
- Helle Designs als weitere Werte-Dateien
- Rezepte von Webseiten übernehmen
- Eigene Spracherkennung auf dem Homeserver
- Regeln in das genormte Mailfilter-Format Sieve exportieren
- Zusammenfassen und Entwerfen per KI, nur auf Knopfdruck
- Eigener LanguageTool-Server für die Rechtschreibprüfung (Server-Etappe S6)

## Neu
- 2026-11-13 · Handy, Heute am Morgen: die Sonne liegt über Wetter-Zahl und Regenzeile und macht sie schwer lesbar (gesehen bei aufraeumen-datum)
- 2026-11-12 · Kurve: Schildchen eines Termins und Beschriftung eines Bands weichen einander noch nicht aus (Termin in einer Schicht).
- 2026-11-12 · Buchstabe der Schicht auch am Handy in der Wochenleiste zeigen (z. B. als Farbe der Füllstands-Säule), dort fehlt der Platz neben dem Wochentag.
- 2026-11-12 · Quellenangabe für die Feiertags-Daten (date-holidays, CC-BY-SA 4.0) auf einer Seite „Über Tide“.
- Schalter „Namen im Menü“ (jetzt `tide.menue.namen`) in die Einstellungsliste übernehmen (Scheibe einstellungen-liste)
- Eigene und intelligente Ordner der zweiten Ebene aus dem Vertrag statt aus `src/logik/ebenen.ts` (postfach-ordner)
- Knopf-Belegung (`tide.knoepfe`) in die Einstellungsliste übernehmen und je Geräteart speichern (einstellungen-liste)
- Alt+Ziffer wechselt in Chrome unter Linux die Tabs; dort ggf. anderes Kürzel für Bereiche anbieten
- Langer Druck / Rechtsklick auf einen belegbaren Knopf öffnet direkt „Knöpfe belegen" für diesen Platz
- Ausgegraute Aktionen am Handy: kurzer Hinweis beim Antippen, sobald es Meldungen gibt
- Die Einstellungen wirken noch nicht (Design, Schriftgröße, Bewegung …); je Verbraucher `useEinstellung` aus `src/geruest/einstellungen.ts` anschließen, Design ohne Flackern beim Start (einstellungen-liste)
- Ort nach Namen suchen (Ortsliste oder Dienst) und „Standort vom Gerät übernehmen“ für Breite/Länge (hintergrund)
- Einstellung „Wellen“ (ab Werk an) passt nicht zum Konzept „Wellen bewegen sich“ (ab Werk aus); umbenennen, sobald Wellen sich bewegen können (hintergrund)
- MSW meldet beim Neuladen „GET / ohne Antwort“ als Warnung; `onUnhandledRequest: 'bypass'` für Seitenaufrufe prüfen (kacheln)
- Gruß in der Heute-Kachel („Guten Morgen“) folgt der gezeigten Uhrzeit der Kurve (kurve-grund)
- Hosting für Tablet und Handy nur für den Nutzer: Cloudflare Pages + Cloudflare Access (Code per Mail, kostenlos, Konto vorhanden); Alternative Tailscale über den Homeserver. Mit den Server-Etappen (kurve-grund)
- Zieh-Grenzen der Kurve: Termin über Mitternacht ziehen und am Rand der Sicht mitscrollen (kurve-eintraege)
- Rückgängig-Schritte auch in der Glocke auflisten; Glocke als eigene Aktion belegbar machen (kurve-ebbe-und-meldungen)
- Ruhezeit des Ebbe-Modus einstellbar machen (kurve-ebbe-und-meldungen)
- Bausteine-Seite wieder von der Oberfläche aus erreichbar machen, etwa in Einstellungen › Darstellung (heute)
- Wochenleiste: Tag antippen zeigt dessen Termine (heute)
- Die Knöpfe „Notiz“ und „Woche“ neben der Wochenleiste endgültig festlegen; heute: Sprung zu Notizen und Wochenrückblick (heute-kacheln)
- Wochenleiste: Buchstabe der Schicht aus der Schichtart statt aus dem ersten Buchstaben des Titels, sobald Arbeit die Schichtart kennt
- Höhe der Wellen in der Gezeitenkurve am Handy prüfen, vielleicht zu viel (heute-kacheln)
- Eigene Kacheln/Widgets anlegen und festlegen, auf welchen Seiten sie verfügbar sind (Wunsch des Nutzers, 2026-11-12)
- Regeln automatisch auf neu eingehende Mails anwenden, Reihenfolge der Regeln ändern, „Danach keine weiteren Regeln“ (postfach-regeln)
- Ordnerzeilen am PC dichter (Vorlage 34 px statt 44 px), damit „Einstellungen“ ohne Scrollen sichtbar ist (postfach-ordner)

- 2026-11-13 · Wochenrückblick (`Rueckblick.tsx`) noch als natives Popover: auf `Aufklapp` umstellen, damit es nur einen Weg für schwebende Karten gibt (heute-uhr-und-wetter)
- 2026-11-13 · Attrappe: Regenwahrscheinlichkeit je Tag variieren, damit die 7-Tage-Vorschau nicht überall 90 % zeigt (heute-uhr-und-wetter)
- Wird ein eigener Ordner gelöscht, bleiben seine Mails ohne Ordner unsichtbar: beim Löschen fragen, wohin sie gehen (Posteingang oder Archiv) (postfach-liste)
- Nach Archivieren oder Löschen der offenen Mail gleich die nächste öffnen, wie in Mail-Programmen üblich (postfach-leser)
- Entwurf auch beim Neuladen mitten im Tippen sichern: mit dem echten Server Änderungen beim Verlassen per `keepalive` senden (mit der Attrappe nicht prüfbar, sie verschwindet mit der Seite) (postfach-schreiben)
- Geplant und Gesendet sofort neu laden, wenn die Rückholzeit einer gesendeten Mail vorbei ist (jetzt erst beim nächsten Holen) (postfach-schreiben)

- Kategorie umbenennen, dabei die Mails mitnehmen (postfach-erkannt-und-handy)
- Absender aus dem Rechtsklick auf eine Mail blockieren (postfach-erkannt-und-handy)
- Termin aus dem Erkannt-Kasten in den Kalender eintragen, sobald es den Kalender gibt (postfach-erkannt-und-handy)

- Termine in der Tages-Kachel bearbeiten (Titel, Zeit), nicht nur löschen (kalender-monat)
- Startcode wieder unter 200 KB: Handy-Gerüst (MitKurve mit react-resizable-panels) nur am Handy nachladen (kalender-monat)

## Erledigt
- 2026-11-13 · Tempo: erster Wechsel zu Postfach und Wechsel zu Heute am PC liegen schon auf dem Stand vor `aufraeumen-datum` bei 93–111 ms (Grenze 100); `npm run pruefen` wird dadurch zufällig rot. Erledigt 2026-11-13 in `aufraeumen-daten` (Zwischenspeicher, jetzt 10–40 ms).
- 2026-11-12 · Jede Kachel zeigt je nach Größe eine Darstellung klein/mittel/groß: entfällt, Kachel-Raster entfernt (aussehen-heute)
- 2026-11-12 · Tablet im Hochformat mit 6 Spalten: entfällt, Kachel-Raster entfernt (aussehen-heute)
- 2026-11-12 · Bei 1 × 1-Kacheln deckt der Menü-Knopf „…“ im Bearbeiten-Modus den Inhalt: entfällt, Kachel-Raster entfernt (aussehen-heute)
- 2026-11-12 · Inhalt kleiner Kacheln passt nicht immer, z. B. „November“ im Monat: entfällt, Kachel-Raster entfernt (aussehen-heute)
- 2026-11-12 · Kacheln 12-px-genau: entfällt, Raster aus quadratischen Zellen (raster-zellen)
- 2026-11-12 · Nach dem langen Druck gleich weiterziehen, ohne den Finger abzusetzen (heute-kacheln)
- 2026-11-12 · Monat als aufklappbarer Kalender statt Sprung (heute-kacheln)
- 2026-11-12 · Jede bewegliche Kachel kann ohne Hintergrund stehen (heute-kacheln)
- 2026-11-12 · Kalenderwoche an der Wochenleiste (heute-kacheln)
- 2026-11-12 · Monatskalender klappt aus dem Knopf „Monat“ nach oben auf, kleiner Kalender mit Walze und Feiertagen (aussehen-wochenleiste)
- 2026-11-12 · Buchstaben der Schicht an den Tagen der Wochenleiste, vorerst aus dem Titel (aussehen-wochenleiste)
- 2026-11-13 · Termine auf der Kurve mit `useDrag` von @use-gesture/react ziehen statt Pointer-Capture von Hand, damit es nur einen Weg zum Ziehen gibt (PRUEFUNG E8, aufraeumen-waechter)
- 2026-11-14 · Regeln in der Ordnerleiste verlinkt: Knopf „Regeln“ neben „Einstellungen“ (postfach-regeln)
