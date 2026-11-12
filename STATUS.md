# Status
Etappe: 2 Gezeitenkurve und Heute
Nächste Scheibe: `aufraeumen-datum` (Zwischenetappe Aufräumen, danach `heute-uhr-und-wetter`)

## Stand
Das Gerüst steht am PC und am Handy mit Seitenleiste, zweiter Ebene, belegbaren Knöpfen, Einstellungsliste, Kacheln und Hintergrund. Die Gezeitenkurve zeigt den Beispieltag (PC unten über die volle Breite, Handy über der unteren Leiste; Einstellung „Lage“ je Gerät), scrollt endlos, folgt der Uhr und steuert beim Scrollen den Hintergrund. Termine liegen als Punkte (mit Karte, Bündel, Überschneidung) oder Bänder auf ihr, lassen sich ziehen und zurücknehmen; dazu Treibgut und Wetterzeile. Die Kurve ist je Seite und Gerät abschaltbar; Meldungen fließen an der Jetzt-Linie ein und falten sich in die Glocke. Heute besteht nur aus Kacheln (Gruß, Als Nächstes, Uhr, Wetter, Knöpfe, Braucht dich, Monat, Woche, Notiz, Rückblick), Text ohne Hintergrund; bearbeitet wird nur über Einstellungen › Kacheln. **Aufräumen:** `docs/PRUEFUNG.md` wird in acht Scheiben `aufraeumen-*` abgearbeitet (siehe Fahrplan). Bausteine dafür sind freigegeben.

## Zuletzt erledigt
- aufraeumen-rueckgaengig: ein Rückgängig-Speicher für Einstellungen, Kacheln, Belegung; `useKannRueckgaengig`; `src/werte/bewegung.ts` (`MELDUNG_MS`)
- heute-kacheln (Nachtrag): freie Plätze und Raster „Doppelt“ (`src/logik/kacheln.ts`), Abstände Rand/Abstand (`src/werte/abstaende.ts`, `src/logik/freierPlatz.ts`), Uhr/Wetter im Gerüst und in der Kopfzeile, KW an der Wochenleiste
- heute-kacheln: `src/logik/kacheln.ts` (Werk je Gerät null, `titel`, `hintergrund`/`ohneHintergrund`), Raster ohne langen Druck, Menü-Knopf, `bearbeiten.ts` als Einstellung, Heute neu in `src/bereiche/heute/kacheln/`, `format.ts`
- heute: `src/logik/heute.ts` (Als Nächstes, Tag/Schicht, Woche, Füllstand, Braucht dich, KW, Rückblick), `src/bereiche/heute/` (Himmel, BrauchtDich, kacheln/Woche, useTermine), Vertrag `frist` und Art `schicht`, Einstellung Art „text“ (Name) und „Uhr“
- kurve-ebbe-und-meldungen: `src/logik/meldungen.ts`, `src/geruest/meldungen.ts` (`melde`), `Glocke.tsx`, Einstellungen `kurve-zeigen-<bereich>` und `standardHandy`, Aktion „Gezeitenkurve ein/aus“ als Befehl, Antippen am Handy

## Stolpersteine
- Stil prüft oxlint, nicht ESLint. Warnungen zählen als Fehler. Freie Tailwind-Werte wie `data-[…]` verbietet die Werte-Prüfung.
- `npm run pruefen` steckt in `skripte/pruefen.mjs`; neue Prüfung = eine Zeile. Neue Seiten hinten an die Zeile „Tempo" hängen, dann wird auch der Wechsel gemessen.
- Tempo-Grenzen nur in `src/logik/tempoGrenzen.ts`; `skripte/sicht.mjs` liest die Datei direkt (Node streicht die Typen).
- `npm run sicht` meldet Konsolen-Fehler und -Warnungen der Seite als Fehler. Seiten mit Unterpunkt: `npm run sicht -- postfach/gesendet`.
- Neue Anfrage: Typ und Funktion in `src/vertrag/`, Antwort in `src/attrappe/<bereich>.ts`, in `src/attrappe/start.ts` eintragen. Gespeichert wird unter `tide.attrappe.*` im localStorage.
- In `node_modules` nur `.d.ts`, `README.md` und `package.json` lesen (Programmcode ist gesperrt); Schnittstellen dort nachlesen, nicht über Typfehler erraten. jsdelivr bleibt gesperrt.
- react-resizable-panels 4: Größen als Text mit Einheit (`'64px'`); Breiten der Leiste in `src/werte/leiste.ts`, Breite gemerkt unter `tide.leiste`. `isCollapsed()` ist nach dem Neuladen veraltet; die Breite kommt aus `onResize`.
- Neuer Bereich: Eintrag in `src/logik/bereiche.ts`, zweite Ebene in `src/logik/ebenen.ts`, Lader und Symbol in `src/geruest/seiten.ts`.
- Handy-Ansicht unter `leiste.schmalUnter` (768 px), umgeschaltet live über `useSchmal`. Die Kopfzeile am Handy hat rechts Platz für die drei belegbaren Knöpfe.
- Neues Design = Kopie von `src/werte/tinte.css`. Neue Farbe: beide Designs, `werte.css` (@theme inline), `src/bausteine/cn.ts`.
- Glas nur über `flaeche-leiste`, `flaeche-kachel`, `flaeche-schwebend`; Drück-Rückmeldung über `drueck`.
- Neue Aktion: Zeile in `src/logik/aktionen.ts`, Symbol in `src/geruest/aktionSymbole.ts`. Aktion ohne `ziel` braucht `kommt` oder `befehl: true` plus Zeile in `src/geruest/befehle.ts`.
- Neue Einstellung = eine Zeile in `einstellungen` (`src/logik/einstellungen.ts`); lesen mit `useEinstellung(e)` aus `src/geruest/einstellungen.ts`.
- Hintergrund: Farben `--sonne`, `--welle-1…5`, `--nacht` je Design, Maße in `werte.css`, Wellenhöhe über `data-wellen` → `--horizont`; Lage kommt als `--x`/`--y` (0–1). Die Uhrzeit fest stellen für Bilder: Playwright `page.clock.setFixedTime`, Bahn über `localStorage['tide.attrappe.einstellungen']`.
- Bedienung im Browser testen: Playwright (Finger über CDP `Input.dispatchTouchEvent`, langer Druck 700 ms); Bearbeiten erst über den Schalter in Einstellungen › Kacheln. Animationen ohne `both`, sonst zählt `sicht` sie als laufend.
- Gezeitenkurve: Rechnung in `src/logik/gezeiten.ts`, Oberfläche `src/geruest/Gezeitenkurve.tsx`, Farben `kurve-*` in `werte.css`, Größen in `src/werte/kurve.ts`; Lage, Höhe und Breite in `src/geruest/MitKurve.tsx`. Termine über `holeTermine` (Attrappe `src/attrappe/termine.ts`).
- Gezeigte Uhrzeit der Kurve teilt `src/geruest/gezeigteZeit.ts` (null = folgt der Uhr); der Hintergrund liest sie.
- Zieh-Griffe nur über den Baustein `Trenner` (`src/bausteine/Trenner.tsx`), nie direkt `Separator`.
- Seitenleiste am PC: Panel „leiste“ ist nur die Spalte (Breite); die Leiste selbst liegt darüber (`leiste-lage` in `werte.css`), Ende oben/unten aus `leisteLage`, Platz der Kurve kommt über `MitKurve onPlatz`.
- Meldungen: `melde({id, text, ankunft, wichtig?})` aus `src/geruest/meldungen.ts`; gleiche id kommt nur einmal. Kopfzeile zeigt `useMeldungen().frisch`, Falten läuft einmal im Gerüst.
- Rückgängig: nur `geruest/rueckgaengig.ts`. Jede Änderung ruft nach erfolgreichem Speichern `merke(text, zurueck, still?)`; Knöpfe nutzen `rueckgaengig()` und `useKannRueckgaengig()`. `einstellungenAendern(neu, text | null, still?)`: `null` für Modi. `useFrischerSchritt` zeigt den Schritt `MELDUNG_MS` lang (`src/werte/bewegung.ts`).
- Inhalt liegt in `MitKurve` als eigene Lage über die volle Höhe; Kurve, Griff und `fuss` (untere Leiste am Handy) liegen darüber mit `pointer-events-none` außer auf den Flächen. Neue Scrollbereiche bekommen `inhalt-frei`.
- Kurve: Lage nur über die Reihenfolge (Wasser, Bänder, `linie`, Rest), nie über z-index. Einträge liegen in jeder der drei Kopien; bedienbar per Tastatur nur die Kopie in der Mitte (`kopie`). Beim Ziehen darf sich die Reihenfolge der Elemente nicht ändern, sonst geht der Finger (Pointer-Capture) verloren.
- Attrappe: Termine des Beispieltags (id `t-…`) ändert `src/attrappe/termine.ts` (gemerkt unter `tide.attrappe.termine`); diese Antworten stehen in `start.ts` vor den Einträgen.
- Kacheln: `<Raster seite kacheln={werkszustand} inhalt={{id: …}} />`, `werkszustand` als Konstante im einfachen Raster; freie Plätze, nichts rückt nach. `inhalt: null` = unsichtbar, Platz bleibt. Abstände nur `rand`/`abstand` (`src/werte/abstaende.ts`), Platz oben/unten setzt `freierPlatz`. Uhr, Wetter, `format.ts`, `useTermine` liegen in `src/geruest/`.
