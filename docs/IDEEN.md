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
- Wochenleiste: Buchstaben für Früh- und Spätschicht an den Tagen, sobald Arbeit die Schichtart kennt (heute-kacheln)
- Höhe der Wellen in der Gezeitenkurve am Handy prüfen, vielleicht zu viel (heute-kacheln)
- Monatskalender auf Heute klappt aus dem Knopf „Monat“ heraus statt mittig aufzugehen, und ist ein voll bedienbarer kleiner Kalender wie die Kalenderseite (heute-kacheln, Wunsch des Nutzers)
- Eigene Kacheln/Widgets anlegen und festlegen, auf welchen Seiten sie verfügbar sind (Wunsch des Nutzers, 2026-11-12)

## Erledigt
- 2026-11-12 · Jede Kachel zeigt je nach Größe eine Darstellung klein/mittel/groß: entfällt, Kachel-Raster entfernt (aussehen-heute)
- 2026-11-12 · Tablet im Hochformat mit 6 Spalten: entfällt, Kachel-Raster entfernt (aussehen-heute)
- 2026-11-12 · Bei 1 × 1-Kacheln deckt der Menü-Knopf „…“ im Bearbeiten-Modus den Inhalt: entfällt, Kachel-Raster entfernt (aussehen-heute)
- 2026-11-12 · Inhalt kleiner Kacheln passt nicht immer, z. B. „November“ im Monat: entfällt, Kachel-Raster entfernt (aussehen-heute)
- 2026-11-12 · Kacheln 12-px-genau: entfällt, Raster aus quadratischen Zellen (raster-zellen)
- 2026-11-12 · Nach dem langen Druck gleich weiterziehen, ohne den Finger abzusetzen (heute-kacheln)
- 2026-11-12 · Monat als aufklappbarer Kalender statt Sprung (heute-kacheln)
- 2026-11-12 · Jede bewegliche Kachel kann ohne Hintergrund stehen (heute-kacheln)
- 2026-11-12 · Kalenderwoche an der Wochenleiste (heute-kacheln)
