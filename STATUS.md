# Status

Etappe: 0 Fundament
Nächste Scheibe: `attrappe-und-tempo`

## Stand
Werte-Dateien für Glut und Tinte, Inter und die Bausteine Knopf und Fläche stehen. Die Bausteine-Seite unter `#bausteine` zeigt alles in beiden Designs.

## Zuletzt erledigt
- fundament: Projekt, `npm run dev` (auch im WLAN), `npm run pruefen`, erste Logik `src/logik/tageszeit.ts` mit Test
- werte-und-bausteine: `src/werte/` (glut.css, tinte.css, werte.css), Knopf, Fläche, Bausteine-Seite, Prüfung „Werte", `npm run sicht`

## Stolpersteine
- Stil prüft oxlint, nicht ESLint. Warnungen zählen als Fehler.
- `npm run pruefen` steckt in `skripte/pruefen.mjs`; neue Prüfungen dort als eine Zeile anhängen.
- `npm run sicht` gibt es schon (`skripte/sicht.mjs`): misst Weichzeichner, Animationen, Bilder/s und Programmcode. Für die nächste Scheibe fehlen nur noch die Tempo-Grenzen im Prüfbefehl.
- Neues Design = Kopie von `src/werte/tinte.css` mit denselben Variablen. Neue Farbe: in beiden Designs, in `werte.css` (@theme inline) und in `src/bausteine/cn.ts` eintragen.
- Glas nur über `flaeche-leiste`, `flaeche-kachel`, `flaeche-schwebend`; Drück-Rückmeldung über `drueck`.
- Programmcode gepackt: 78 KB von erlaubten 200 KB.
