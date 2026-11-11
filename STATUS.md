# Status

Etappe: 1 Gerüst
Nächste Scheibe: `geruest-zweite-ebene`

## Stand
Das Gerüst steht am PC: Seitenleiste mit ziehbarer, gemerkter Breite (rastet auf Symbole ein, Doppelklick = Standard), Logo führt zu Heute, zehn Bereiche als Seiten, jede lädt erst beim Öffnen. Heute zeigt die Beispielliste aus der Attrappe.

## Zuletzt erledigt
- fundament: Projekt, `npm run dev` (auch im WLAN), `npm run pruefen`, erste Logik mit Test
- werte-und-bausteine: `src/werte/`, Knopf, Fläche, Bausteine-Seite (`#bausteine`), Prüfung „Werte", `npm run sicht`
- attrappe-und-tempo: `src/vertrag/eintrag.ts`, `src/attrappe/`, Beispielliste, Tempo-Grenzen im Prüfbefehl
- geruest-seitenleiste: `src/geruest/` (Gerüst, Seitenleiste, Seitenkopf, LeereSeite), `src/logik/bereiche.ts`, Seiten unter `src/bereiche/<id>/Seite.tsx`

## Stolpersteine
- Stil prüft oxlint, nicht ESLint. Warnungen zählen als Fehler.
- `npm run pruefen` steckt in `skripte/pruefen.mjs`; neue Prüfung = eine Zeile. Neue Seiten hinten an die Zeile „Tempo" hängen, dann wird auch der Wechsel gemessen.
- Tempo-Grenzen nur in `src/logik/tempoGrenzen.ts`; `skripte/sicht.mjs` liest die Datei direkt (Node streicht die Typen).
- `npm run sicht` meldet Konsolen-Fehler und -Warnungen der Seite als Fehler.
- Neue Anfrage: Typ und Funktion in `src/vertrag/`, Antwort in `src/attrappe/<bereich>.ts`, in `src/attrappe/start.ts` eintragen. Gespeichert wird unter `tide.attrappe.*` im localStorage.
- `public/mockServiceWorker.js` stammt von `npx msw init public`; bei MSW-Update neu erzeugen.
- Lesen in `node_modules` und jsdelivr sind gesperrt. Schnittstellen klärt man über die Typprüfung: `const x: keyof ComponentProps<typeof Panel> = 'zzz'` zeigt in der Fehlermeldung alle Props.
- react-resizable-panels 4: Größen als Text mit Einheit (`'64px'`); Breiten der Leiste in `src/werte/leiste.ts`. Breite gemerkt unter dem Schlüssel `tide.leiste`.
- Neuer Bereich: Eintrag in `src/logik/bereiche.ts`, Lader und Symbol in `src/geruest/seiten.ts`.
- Am Handy startet die Leiste schmal, bis das zweispaltige Menü kommt.
- Freie Tailwind-Werte wie `data-[…]` verbietet die Werte-Prüfung.
- Neues Design = Kopie von `src/werte/tinte.css`. Neue Farbe: beide Designs, `werte.css` (@theme inline), `src/bausteine/cn.ts`.
- Glas nur über `flaeche-leiste`, `flaeche-kachel`, `flaeche-schwebend`; Drück-Rückmeldung über `drueck`.
- Programmcode gepackt beim Start: 97 KB von erlaubten 200 KB.
