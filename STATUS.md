# Status

Etappe: 1 Gerüst
Nächste Scheibe: `geruest-seitenleiste`

## Stand
Fundament steht: Werte, Knopf, Fläche, Vertrag für Einträge, Attrappe mit Mock Service Worker und automatisch geprüfte Tempo-Grenzen. Die Startseite zeigt eine Beispielliste aus der Attrappe; Abhaken übersteht das Neuladen.

## Zuletzt erledigt
- fundament: Projekt, `npm run dev` (auch im WLAN), `npm run pruefen`, erste Logik mit Test
- werte-und-bausteine: `src/werte/`, Knopf, Fläche, Bausteine-Seite (`#bausteine`), Prüfung „Werte", `npm run sicht`
- attrappe-und-tempo: `src/vertrag/eintrag.ts`, `src/attrappe/`, Beispielliste auf der Startseite, Tempo-Grenzen im Prüfbefehl

## Stolpersteine
- Stil prüft oxlint, nicht ESLint. Warnungen zählen als Fehler.
- `npm run pruefen` steckt in `skripte/pruefen.mjs`; neue Prüfung = eine Zeile. Neue Seiten hinten an die Zeile „Tempo" hängen (`sicht.mjs start bausteine …`), dann wird auch der Wechsel gemessen.
- Tempo-Grenzen nur in `src/logik/tempoGrenzen.ts`; `skripte/sicht.mjs` liest die Datei direkt (Node streicht die Typen).
- `npm run sicht` meldet Konsolen-Fehler und -Warnungen der Seite als Fehler.
- Neue Anfrage: Typ und Funktion in `src/vertrag/`, Antwort in `src/attrappe/<bereich>.ts`, in `src/attrappe/start.ts` eintragen. Gespeichert wird unter `tide.attrappe.*` im localStorage.
- `public/mockServiceWorker.js` stammt von `npx msw init public`; bei MSW-Update neu erzeugen.
- Lesen in `node_modules` ist in dieser Umgebung gesperrt; Schnittstellen über die Typprüfung klären.
- Neues Design = Kopie von `src/werte/tinte.css`. Neue Farbe: beide Designs, `werte.css` (@theme inline), `src/bausteine/cn.ts`.
- Glas nur über `flaeche-leiste`, `flaeche-kachel`, `flaeche-schwebend`; Drück-Rückmeldung über `drueck`.
- Programmcode gepackt beim Start: 79 KB von erlaubten 200 KB.
