# Status
Etappe: 2 Gezeitenkurve und Heute
Nächste Scheibe: `aufraeumen-daten` (vorgezogen vor `aufraeumen-schema`)
## Stand
Das Gerüst steht am PC (wie die Vorlage, ohne Zellraster: Leiste mit Logo von oben bis unten, Kopfzeile mit Uhr, Wetter und Knöpfen außer auf Heute) und am Handy mit Seitenleiste, zweiter Ebene, belegbaren Knöpfen, Einstellungsliste, Kacheln und Hintergrund. Die Gezeitenkurve zeigt den Beispieltag (PC unten über die volle Breite, Handy über der unteren Leiste; Einstellung „Lage“ je Gerät), scrollt endlos, folgt der Uhr und steuert beim Scrollen den Hintergrund. Der Himmel folgt dem Sonnenstand (Lichthof, Dämmerung, Mondschein nach Phase). Termine liegen als Punkte (mit Karte, Bündel, Überschneidung) oder Bänder auf ihr, lassen sich ziehen und zurücknehmen; dazu Treibgut und Wetterzeile. Die Kurve ist je Seite und Gerät abschaltbar; Meldungen fließen an der Jetzt-Linie ein und falten sich in die Glocke. Heute hat einen festen Aufbau (Gruß, Als Nächstes, Wetter, Uhr, Knöpfe, Braucht dich als Reiter mit aufklappender Liste, Wochenleiste wie die Vorlage mit kleinem Kalender samt Feiertagen, Notiz, Rückblick), Text ohne Hintergrund. **Aufräumen:** `docs/PRUEFUNG.md` wird in acht Scheiben `aufraeumen-*` abgearbeitet (siehe Fahrplan). Bausteine dafür sind freigegeben.
## Zuletzt erledigt
- aufraeumen-einstellungen-typen: `einstellung('name')` mit festen Namen und Werttyp (`WertVon`), `find(…)!` und `as` weg; dazu `tagesBelegung` (Termine einmal lesen) und `tagSchluessel` über `formatISO`
- aufraeumen-datum: date-fns; Rechnung und Uhrzeit in `logik/zeit.ts` (mit Tests), Anzeige `geruest/format.ts`; eigene Hilfen gelöscht, „bis 07:00“ aus `RUHE_BIS`
- aussehen-postfach-ordner: Ordnerleiste wie Vorlage (`geruest/PostfachOrdner.tsx`), Ordner über Vertrag `holeOrdner` + `useOrdner`, Baum in `logik/ordner.ts`, gemeinsame Zeile `geruest/EbenenZeile.tsx`
- aussehen-einstellungen: mittlere Spalte mit Suche oben (`geruest/EinstellungenSuchfeld.tsx`, Speicher `einstellungenSuche.ts`), Gruppen der Vorlage, Zeilen mit Symbol (`geruest/ebenenSymbole.ts`), Breite `leiste.ebeneEinstellungenPx`
- aussehen-kurve: Kopfzeile, Wetter „12° · 20 % Regen“ (Vertrag `regenChance`), Jetzt-Punkt mit Treibgut, Schildchen, „10:00“-Stunden, Einklappen per Wischen (`KurveRand`, `klappeKurve`)
## Stolpersteine
- Tempo-Messung im Testrechner ohne Grafikkarte: jedes Bild mit Glas kostet 20–25 ms. Wechsel zu Postfach/Heute schwanken um 100 ms, weil Wetter (Kopfzeile, „Lädt …“) bei jedem Wechsel neu geholt wird; behebt `aufraeumen-daten` (Zwischenspeicher).
- Datum und Uhrzeit: rechnen mit date-fns direkt, Zusammengesetztes nur aus `logik/zeit.ts`, Anzeige über `geruest/format.ts`. `addDays` behält die Uhrzeit (anders als das alte `plusTage`): für Tagesgrenzen erst `startOfDay`.
- Stil prüft oxlint, nicht ESLint. Warnungen zählen als Fehler. Freie Tailwind-Werte wie `data-[…]` verbietet die Werte-Prüfung.
- `npm run pruefen` steckt in `skripte/pruefen.mjs`; neue Prüfung = eine Zeile. Neue Seiten hinten an die Zeile „Tempo" hängen, dann wird auch der Wechsel gemessen. Tempo-Grenzen nur in `src/logik/tempoGrenzen.ts`; `skripte/sicht.mjs` liest die Datei direkt (Node streicht die Typen).
- `npm run sicht` meldet Konsolen-Fehler und -Warnungen der Seite als Fehler. Seiten mit Unterpunkt: `npm run sicht -- postfach/gesendet`.
- Neue Anfrage: Typ und Funktion in `src/vertrag/`, Antwort in `src/attrappe/<bereich>.ts`, in `src/attrappe/start.ts` eintragen. Gespeichert wird unter `tide.attrappe.*` im localStorage.
- In `node_modules` nur `.d.ts`, `README.md` und `package.json` lesen (Programmcode ist gesperrt); Schnittstellen dort nachlesen, nicht über Typfehler erraten. jsdelivr bleibt gesperrt. `.d.ts` unter `node_modules/*/dist` sperrt `Read(./dist/**)` mit; dann README und tsc.
- react-resizable-panels 4 nur noch für die Kurvenhöhe am Handy (`Trenner`); Größen als Text mit Einheit.
- Unterpunkte aus Daten (Postfach-Ordner): `ausDaten` in `logik/ebenen.ts`, dort gilt jeder Unterpunkt; Namen für die Seite über `LeereSeite namen=…`.
- Neuer Bereich: Eintrag in `src/logik/bereiche.ts`, zweite Ebene in `src/logik/ebenen.ts`, Lader und Symbol in `src/geruest/seiten.ts`.
- Handy-Ansicht unter `leiste.schmalUnter` (768 px), umgeschaltet live über `useSchmal`. Die Kopfzeile am Handy hat rechts Platz für die drei belegbaren Knöpfe.
- Neues Design = Kopie von `src/werte/tinte.css`. Neue Farbe: beide Designs, `werte.css` (@theme inline), `src/bausteine/cn.ts`.
- Glas nur über `flaeche-leiste`, `flaeche-kachel`, `flaeche-schwebend`; Drück-Rückmeldung über `drueck`.
- Neue Aktion: Zeile in `src/logik/aktionen.ts`, Symbol in `src/geruest/aktionSymbole.ts`. Aktion ohne `ziel` braucht `spaeter: true` oder `befehl: true` plus Zeile in `src/geruest/befehle.ts`.
- Neue Einstellung = eine Zeile in `liste` (`src/logik/einstellungen.ts`); holen mit `einstellung('name')`, lesen mit `useEinstellung(e)` (liefert schon den richtigen Typ, kein `as`, kein `=== true`).
- Hintergrund: Farben `--sonne`, `--welle-1…5`, `--nacht` je Design, Maße in `werte.css`, Wellenhöhe über `data-wellen` → `--horizont`; Lage kommt als `--x`/`--y` (0–1), Licht als `--licht`/`--waerme`/`--mond-licht`. Die Uhrzeit fest stellen für Bilder: Playwright `page.clock.setFixedTime`, Bahn über `localStorage['tide.attrappe.einstellungen']`.
- Bedienung im Browser testen: Playwright (Finger über CDP `Input.dispatchTouchEvent`, langer Druck 700 ms). Animationen ohne `both`, sonst zählt `sicht` sie als laufend.
- Gezeitenkurve: Rechnung in `src/logik/gezeiten.ts`, Oberfläche `src/geruest/Gezeitenkurve.tsx`, Farben `kurve-*` in `werte.css`, Größen in `src/werte/kurve.ts`; am Handy Lage und Höhe in `src/geruest/MitKurve.tsx`. Termine über `holeTermine` (Attrappe `src/attrappe/termine.ts`).
- Gezeigte Uhrzeit der Kurve teilt `src/geruest/gezeigteZeit.ts` (null = folgt der Uhr); der Hintergrund liest sie.
- Feiertage nur über `useFeiertage(jahr, land)` (lädt date-holidays nach, eigener großer Teil im Bau); nie `logik/feiertage` direkt in die Oberfläche importieren.
- Schwebende Karte am Knopf: `Aufklapp`, `AufklappKnopf`, `AufklappAnker`, `AufklappInhalt` aus `bausteine/Aufklapp.tsx` (`breite="anker"` ab Werk, `"inhalt"` mit eigener Breite; scrollt bei wenig Platz).
- Zieh-Griffe nur über den Baustein `Trenner` (`src/bausteine/Trenner.tsx`), nie direkt `Separator`.
- PC und Tablet: Gerüst als Flex-Layout in `Geruest.tsx` (`Pc`), Maße in `src/werte/leiste.ts` und `kurve.hoehePc`. Wischen: `useDrag` von @use-gesture/react; scrollbare Kinder brauchen `touch-pan-y`, sonst bricht der Browser die Finger-Geste ab. `node_modules/@use-gesture/*/dist` ist gesperrt, Schnittstelle über tsc prüfen.
- Meldungen: `melde({id, text, ankunft, wichtig?})` aus `src/geruest/meldungen.ts`; gleiche id kommt nur einmal. Kopfzeile zeigt `useMeldungen().frisch`, Falten läuft einmal im Gerüst.
- Rückgängig: nur `geruest/rueckgaengig.ts` (Rechnung in `logik/rueckgaengig.ts`). Jede Änderung ruft nach erfolgreichem Speichern `merke({text, zurueck, vor, bereich?, still?})`; Knöpfe nur über `RueckgaengigKnoepfe bereich=…` (wirken nur auf ihre Seite), Alt+Z/Alt+Y auf alles. `einstellungenAendern(neu, schritt | null)`: `null` für Modi.
- Handy: Inhalt liegt in `MitKurve` als eigene Lage über die volle Höhe; Kurve, Griff und `fuss` liegen darüber mit `pointer-events-none` außer auf den Flächen. Neue Scrollbereiche am Handy bekommen `inhalt-frei`.
- Kurve: Lage nur über die Reihenfolge (Wasser, Bänder, `linie`, Rest), nie über z-index. Einträge liegen in jeder der drei Kopien; bedienbar per Tastatur nur die Kopie in der Mitte (`kopie`). Beim Ziehen darf sich die Reihenfolge der Elemente nicht ändern, sonst geht der Finger (Pointer-Capture) verloren.
- Attrappe: Termine des Beispieltags (id `t-…`) ändert `src/attrappe/termine.ts` (gemerkt unter `tide.attrappe.termine`); diese Antworten stehen in `start.ts` vor den Einträgen.
