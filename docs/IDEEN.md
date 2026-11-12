# Ideenspeicher

Hier landet alles, was nicht zur laufenden Scheibe gehört. Einmal im Monat wird sortiert: Die besten zwei oder drei Ideen werden Scheiben im Fahrplan.

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
- Nach dem langen Druck gleich weiterziehen können, ohne den Finger abzusetzen (wie One UI) (kacheln)
- Jede Kachel zeigt je nach Größe eine Darstellung klein/mittel/groß; kommt mit den echten Kacheln der Bereiche (kacheln)
- MSW meldet beim Neuladen „GET / ohne Antwort“ als Warnung; `onUnhandledRequest: 'bypass'` für Seitenaufrufe prüfen (kacheln)
- Gruß in der Heute-Kachel („Guten Morgen“) folgt der gezeigten Uhrzeit der Kurve (kurve-grund)
- Hosting für Tablet und Handy nur für den Nutzer: Cloudflare Pages + Cloudflare Access (Code per Mail, kostenlos, Konto vorhanden); Alternative Tailscale über den Homeserver. Mit den Server-Etappen (kurve-grund)
- Zieh-Grenzen der Kurve: Termin über Mitternacht ziehen und am Rand der Sicht mitscrollen (kurve-eintraege)
