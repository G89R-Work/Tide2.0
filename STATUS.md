# Status

Etappe: 1 Gerüst
Nächste Scheibe: `aktionen-und-knoepfe`

## Stand
Das Gerüst steht am PC und am Handy. PC: Seitenleiste mit ziehbarer Breite, daneben die zweite Ebene des Bereichs. Handy: oben Menü-Knopf mit Punkt, darin zwei Spalten (Bereiche, zweite Ebene), Schalter für Namen.

## Zuletzt erledigt
- fundament: Projekt, `npm run dev` (auch im WLAN), `npm run pruefen`, erste Logik mit Test
- werte-und-bausteine: `src/werte/`, Knopf, Fläche, Bausteine-Seite (`#bausteine`), Prüfung „Werte", `npm run sicht`
- attrappe-und-tempo: `src/vertrag/eintrag.ts`, `src/attrappe/`, Beispielliste, Tempo-Grenzen im Prüfbefehl
- geruest-seitenleiste: `src/geruest/` (Gerüst, Seitenleiste, Seitenkopf, LeereSeite), `src/logik/bereiche.ts`, Seiten unter `src/bereiche/<id>/Seite.tsx`
- geruest-zweite-ebene: `src/logik/ebenen.ts` (Marke `#bereich/unter`), `ZweiteEbene`, `HandyMenue`, `useSchmal`, `useBrauchtDich`

## Stolpersteine
- Stil prüft oxlint, nicht ESLint. Warnungen zählen als Fehler.
- `npm run pruefen` steckt in `skripte/pruefen.mjs`; neue Prüfung = eine Zeile. Neue Seiten hinten an die Zeile „Tempo" hängen, dann wird auch der Wechsel gemessen.
- Tempo-Grenzen nur in `src/logik/tempoGrenzen.ts`; `skripte/sicht.mjs` liest die Datei direkt (Node streicht die Typen).
- `npm run sicht` meldet Konsolen-Fehler und -Warnungen der Seite als Fehler. Seiten mit Unterpunkt: `npm run sicht -- postfach/gesendet`.
- Neue Anfrage: Typ und Funktion in `src/vertrag/`, Antwort in `src/attrappe/<bereich>.ts`, in `src/attrappe/start.ts` eintragen. Gespeichert wird unter `tide.attrappe.*` im localStorage.
- `public/mockServiceWorker.js` stammt von `npx msw init public`; bei MSW-Update neu erzeugen.
- Lesen in `node_modules` und jsdelivr sind gesperrt. Schnittstellen klärt man über die Typprüfung: `const x: keyof ComponentProps<typeof Panel> = 'zzz'` zeigt in der Fehlermeldung alle Props.
- react-resizable-panels 4: Größen als Text mit Einheit (`'64px'`); Breiten der Leiste in `src/werte/leiste.ts`. Breite gemerkt unter `tide.leiste`.
- Neuer Bereich: Eintrag in `src/logik/bereiche.ts`, zweite Ebene in `src/logik/ebenen.ts`, Lader und Symbol in `src/geruest/seiten.ts`.
- Handy-Ansicht unter `leiste.schmalUnter` (768 px), umgeschaltet live über `useSchmal`. Die Kopfzeile am Handy hat rechts Platz für die drei belegbaren Knöpfe.
- Das Handy-Menü ist ein natives `<dialog>` (Esc und Zurück schließen); Einblenden über `menue-links` in `werte.css`.
- Freie Tailwind-Werte wie `data-[…]` verbietet die Werte-Prüfung.
- Neues Design = Kopie von `src/werte/tinte.css`. Neue Farbe: beide Designs, `werte.css` (@theme inline), `src/bausteine/cn.ts`.
- Glas nur über `flaeche-leiste`, `flaeche-kachel`, `flaeche-schwebend`; Drück-Rückmeldung über `drueck`.
- Programmcode gepackt beim Start: 100 KB von erlaubten 200 KB.
