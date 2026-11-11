# Status

Etappe: 1 Gerüst
Nächste Scheibe: `kacheln`

## Stand
Das Gerüst steht am PC und am Handy, mit Seitenleiste, zweiter Ebene, belegbaren Knöpfen und zentraler Einstellungsliste. Hinter der ganzen App liegt der Hintergrund mit Sonne, Mond (echte Phase, geneigte Sichel) und fünf Wellenlagen (Höhe einstellbar, ab Werk Goldener Schnitt); Bahn Bogen oder Echt, Ort über Breite/Länge.

## Zuletzt erledigt
- geruest-seitenleiste: `src/geruest/` (Gerüst, Seitenleiste, Seitenkopf, LeereSeite), `src/logik/bereiche.ts`, Seiten unter `src/bereiche/<id>/Seite.tsx`
- geruest-zweite-ebene: `src/logik/ebenen.ts` (Marke `#bereich/unter`), `ZweiteEbene`, `HandyMenue`, `useSchmal`, `useBrauchtDich`
- aktionen-und-knoepfe: `src/logik/aktionen.ts` (Aktionsliste, Plätze, Kürzel), `src/geruest/belegung.ts` (gemerkt, Rückgängig), `AktionKnopf`, `Auswahl`, Einstellungen › Navigation
- hintergrund: `src/logik/himmel.ts` (SunCalc, Bogen/Echt, Mondpfad), `src/geruest/Hintergrund.tsx`, `useMinute`, Einstellungen „Ort: Breite/Länge“
- einstellungen-liste: `src/logik/einstellungen.ts` (Liste, Suche, Zurücksetzen), Vertrag und Attrappe `einstellungen`, `src/geruest/einstellungen.ts`, Bausteine `Schalter`, `Eingabe`

## Stolpersteine
- Stil prüft oxlint, nicht ESLint. Warnungen zählen als Fehler.
- `npm run pruefen` steckt in `skripte/pruefen.mjs`; neue Prüfung = eine Zeile. Neue Seiten hinten an die Zeile „Tempo" hängen, dann wird auch der Wechsel gemessen.
- Tempo-Grenzen nur in `src/logik/tempoGrenzen.ts`; `skripte/sicht.mjs` liest die Datei direkt (Node streicht die Typen).
- `npm run sicht` meldet Konsolen-Fehler und -Warnungen der Seite als Fehler. Seiten mit Unterpunkt: `npm run sicht -- postfach/gesendet`.
- Neue Anfrage: Typ und Funktion in `src/vertrag/`, Antwort in `src/attrappe/<bereich>.ts`, in `src/attrappe/start.ts` eintragen. Gespeichert wird unter `tide.attrappe.*` im localStorage.
- `public/mockServiceWorker.js` stammt von `npx msw init public`; bei MSW-Update neu erzeugen.
- Lesen in `node_modules` und jsdelivr sind gesperrt. Schnittstellen klärt man über die Typprüfung: `const x: keyof ComponentProps<typeof Panel> = 'zzz'` zeigt in der Fehlermeldung alle Props.
- react-resizable-panels 4: Größen als Text mit Einheit (`'64px'`); Breiten der Leiste in `src/werte/leiste.ts`, Breite gemerkt unter `tide.leiste`. `isCollapsed()` ist nach dem Neuladen veraltet; die Breite kommt aus `onResize`.
- Neuer Bereich: Eintrag in `src/logik/bereiche.ts`, zweite Ebene in `src/logik/ebenen.ts`, Lader und Symbol in `src/geruest/seiten.ts`.
- Handy-Ansicht unter `leiste.schmalUnter` (768 px), umgeschaltet live über `useSchmal`. Die Kopfzeile am Handy hat rechts Platz für die drei belegbaren Knöpfe.
- Das Handy-Menü ist ein natives `<dialog>` (Esc und Zurück schließen); Einblenden über `menue-links` in `werte.css`.
- Freie Tailwind-Werte wie `data-[…]` verbietet die Werte-Prüfung.
- Neues Design = Kopie von `src/werte/tinte.css`. Neue Farbe: beide Designs, `werte.css` (@theme inline), `src/bausteine/cn.ts`.
- Glas nur über `flaeche-leiste`, `flaeche-kachel`, `flaeche-schwebend`; Drück-Rückmeldung über `drueck`.
- Neue Aktion: Zeile in `src/logik/aktionen.ts`, Symbol in `src/geruest/aktionSymbole.ts`. Aktion ohne `ziel` braucht `kommt` (Test prüft das).
- Neue Einstellung = eine Zeile in `einstellungen` (`src/logik/einstellungen.ts`); lesen mit `useEinstellung(e)` aus `src/geruest/einstellungen.ts`. Wirken bisher nur im Hintergrund (Bahn, Ort, Mond nur nachts, folgt der Tageszeit).
- Hintergrund: Farben `--sonne`, `--welle-1…5`, `--nacht` je Design, Maße in `werte.css`, Wellenhöhe über `data-wellen` → `--horizont`; Lage kommt als `--x`/`--y` (0–1). Die Uhrzeit fest stellen für Bilder: Playwright `page.clock.setFixedTime`, Bahn über `localStorage['tide.attrappe.einstellungen']`.
- Zahl-Einstellungen mit Nachkommastellen: `schritt` angeben.
- Programmcode gepackt beim Start: 110 KB von erlaubten 200 KB.
