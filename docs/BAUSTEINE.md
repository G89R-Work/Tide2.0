# Bausteine

Die Ausgangsliste steht in `docs/konzept/30-bausteine.md`. Hier kommt jede spätere Suche dazu, auch wenn sie mit „selbst bauen" endet. So wird nichts zweimal gesucht.

Muster für einen Eintrag:

```
## <Datum> · <Aufgabe>
- Kandidaten: <Name> (<eine Zeile>), <Name> (<eine Zeile>)
- Entscheidung: <Name> oder „selbst bauen"
- Grund: <ein Satz>
- Link: <Adresse>
- Eingebaut in Scheibe: <name>
```

## Einträge

## 2026-11-11 · Tests
- Kandidaten: Vitest (Standard bei Vite, ohne eigene Einrichtung), Jest (braucht Umwege für Vite)
- Entscheidung: Vitest
- Grund: nutzt dieselbe Einrichtung wie Vite, schnell.
- Link: https://vitest.dev
- Eingebaut in Scheibe: fundament

## 2026-11-11 · Stilprüfung
- Kandidaten: oxlint (steckt heute in der Vite-Vorlage, sehr schnell), ESLint (früherer Standard der Vorlage)
- Entscheidung: oxlint
- Grund: Die Vite-Vorlage liefert inzwischen oxlint statt ESLint; gleiche Aufgabe, weniger Einrichtung.
- Link: https://oxc.rs/docs/guide/usage/linter
- Eingebaut in Scheibe: fundament

## 2026-11-11 · Gestaltung
- Kandidaten: Tailwind 4 mit @tailwindcss/vite
- Entscheidung: Tailwind 4 über das Vite-Plugin
- Grund: steht im Konzept; das Plugin braucht keine eigene Einstellungsdatei.
- Link: https://tailwindcss.com/docs/installation/using-vite
- Eingebaut in Scheibe: fundament

## 2026-11-11 · Schrift Inter
- Kandidaten: @fontsource-variable/inter (lokal, ohne Google), Google Fonts (Aufruf bei jedem Start)
- Entscheidung: @fontsource-variable/inter
- Grund: läuft ohne Netz und ohne Drittanbieter; Ja des Nutzers.
- Link: https://fontsource.org/fonts/inter
- Eingebaut in Scheibe: werte-und-bausteine

## 2026-11-11 · Knopf
- Kandidaten: shadcn/ui Button (cva, clsx, tailwind-merge, @radix-ui/react-slot), eigener Knopf
- Entscheidung: shadcn-Muster
- Grund: steht im Konzept; Dialoge und Menüs brauchen dieselben Teile; Ja des Nutzers.
- Link: https://ui.shadcn.com/docs/components/button
- Eingebaut in Scheibe: werte-und-bausteine

## 2026-11-11 · Bilder und Tempo-Messung (npm run sicht)
- Kandidaten: Playwright (in der Cloud vorinstalliert), Puppeteer
- Entscheidung: Playwright, ohne Eintrag in package.json
- Grund: ist schon da; das Skript nennt den Grund, falls es fehlt.
- Link: https://playwright.dev
- Eingebaut in Scheibe: werte-und-bausteine

## 2026-11-11 · Attrappen-Daten
- Kandidaten: Mock Service Worker (fängt Anfragen im Browser ab, Oberfläche merkt nichts), eigene Attrappen-Funktionen (müssten später ausgebaut werden)
- Entscheidung: Mock Service Worker 3
- Grund: steht im Konzept und in der Technik-Liste; der spätere Server ersetzt ihn ohne Änderung an der Oberfläche.
- Link: https://mswjs.io
- Eingebaut in Scheibe: attrappe-und-tempo

## 2026-11-11 · Seitenleiste mit ziehbarer Breite
- Kandidaten: react-resizable-panels (Mindestbreite, Einklappen, gemerkte Breite), eigener Zieh-Griff
- Entscheidung: react-resizable-panels 4
- Grund: steht im Konzept als geprüft; Einrasten und Merken bringt er mit; Ja des Nutzers.
- Link: https://github.com/bvaughn/react-resizable-panels
- Eingebaut in Scheibe: geruest-seitenleiste
- Stand 2026-11-12 (raster-geruest): am PC und Tablet ersetzt durch das Zellraster (react-grid-layout rechnet die Kacheln, das Gerüst eine reine Funktion); weiter genutzt für die Höhe der Kurve am Handy (`Trenner`).

## 2026-11-12 · Zellraster des Gerüsts
- Geprüft: react-grid-layout (schon im Projekt) für Leiste und Kurve, CSS Grid.
- Entscheidung: kein neuer Baustein. Leiste, Kurve und Inhalt sind feste Felder; ihre Lage ist eine kleine reine Rechnung (`src/logik/geruestRaster.ts`) aus `zellRaster`, die Kacheln darin verschiebt weiter react-grid-layout.
- Stand 2026-11-12 (aussehen-kopfzeile): entfallen, das Gerüst ist ein einfaches Flex-Layout in Pixeln wie die Vorlage.

## 2026-11-12 · Wischen
- Kandidaten: @use-gesture/react 10 (Ziehen und Wischen mit Richtung, Schwelle und Tempo, klein, MIT), eigene Zeiger-Rechnung
- Entscheidung: @use-gesture/react 10.3
- Grund: bewährt, erkennt Wischen (`swipe`) samt Schwellen; Ja des Nutzers, auch für weitere Gesten (Kurve auf- und zuklappen).
- Link: https://use-gesture.netlify.app
- Eingebaut in Scheibe: aussehen-kopfzeile

## 2026-11-11 · Symbole
- Kandidaten: lucide-react (Standard bei shadcn/ui, nur genutzte Symbole im Paket), eigene SVGs
- Entscheidung: lucide-react
- Grund: passt zu shadcn/ui, einheitliche Linien; Ja des Nutzers.
- Link: https://lucide.dev
- Eingebaut in Scheibe: geruest-seitenleiste

## 2026-11-11 · Sonne und Mond
- Kandidaten: SunCalc 2 (Auf-/Untergang, Lage, Mondphase und Neigung, ohne Abhängigkeiten, MIT), eigene Formeln
- Entscheidung: SunCalc 2
- Grund: steht im Konzept, bewährt und klein; die alten Formeln liegen in `vorlage/`; Ja des Nutzers.
- Link: https://github.com/mourner/suncalc
- Eingebaut in Scheibe: hintergrund

## 2026-11-11 · Kacheln verschieben und Größe ändern
- Kandidaten: react-grid-layout 2 (für React gebaut, Anordnung als Daten, Nachrücken und Kollisionen eingebaut), gridstack.js 14 (Finger-Bedienung eingebaut, greift selbst in die Seite ein, 2,2 MB)
- Entscheidung: react-grid-layout 2.3
- Grund: Empfehlung im Konzept; Ja des Nutzers ohne eigenen Handy-Versuch. Langer Druck, Griffpunkte, Menü, Tastatur und Speichern sind selbst gebaut.
- Link: https://github.com/react-grid-layout/react-grid-layout
- Eingebaut in Scheibe: kacheln
- Stand 2026-11-12 (aussehen-heute): entfernt, das Kachel-Raster fällt ganz weg (Nutzer).

## 2026-11-11 · Rechtsklick-Menü der Kacheln
- Kandidaten: shadcn/ui Context Menu (@radix-ui/react-context-menu, neue Abhängigkeit), natives Popover
- Entscheidung: natives Popover (`popover="manual"`) mit eigenem Schließen
- Grund: keine neue Abhängigkeit; muss auch beim langen Druck aufgehen, das kann Radix' Kontextmenü auf iOS nicht.
- Link: https://developer.mozilla.org/docs/Web/API/Popover_API
- Eingebaut in Scheibe: kacheln
- Stand 2026-11-12 (aussehen-heute): entfällt mit dem Kachel-Raster.

## 2026-11-11 · Glatte Gezeitenkurve
- Kandidaten: d3-shape (bewährte Kurvenformen für SVG-Pfade, klein), eigene Spline-Rechnung
- Entscheidung: d3-shape
- Grund: bewährte Bibliothek statt Eigenbau; Ja des Nutzers.
- Link: https://d3js.org/d3-shape
- Eingebaut in Scheibe: kurve-grund

## 2026-11-12 · Aufklappende Karte am Knopf (Braucht dich)
- Kandidaten: shadcn/ui Popover (@radix-ui/react-popover: Lage am Rand, Esc, Klick daneben, Fokus), natives Popover (keine Lage am Anker ohne CSS Anchor Positioning)
- Entscheidung: shadcn/ui Popover als `bausteine/Aufklapp.tsx`
- Grund: Ja des Nutzers vom 2026-11-12; Lage und Breite am Anker fertig, `aufraeumen-menues` stellt die übrigen Menüs darauf um.
- Link: https://ui.shadcn.com/docs/components/popover
- Eingebaut in Scheibe: aussehen-braucht-dich

## 2026-11-12 · Feiertage je Bundesland
- Kandidaten: date-holidays (alle Länder, 12 MB, Daten CC-BY-SA 4.0, vier Unterpakete), feiertagejs (nur Deutschland, MIT, 0,24 MB)
- Entscheidung: date-holidays (Nutzer, wie im Konzept)
- Grund: Wahl des Nutzers; wird erst bei Bedarf nachgeladen (`geruest/useFeiertage.ts`), der Startcode bleibt klein. `npm audit` meldet drei schwache Lücken in deepmerge (nur interne Daten, kein Eingang von außen).
- Link: https://github.com/commenthol/date-holidays
- Eingebaut in Scheibe: aussehen-wochenleiste

## 2026-11-13 · Datum und Uhrzeit
- Kandidaten: date-fns 4 (einzelne Funktionen, MIT, deutsche Sprache `de`), Day.js (Plugins für ISO-Woche), Temporal (noch nicht in allen Browsern)
- Entscheidung: date-fns
- Grund: Ja des Nutzers vom 2026-11-12 (PRUEFUNG E3); bewährt bei Sommerzeit und Jahreswechsel, nur genutzte Funktionen landen im Code. Rechnungen in `logik/zeit.ts`, Anzeige über `geruest/format.ts`.
- Link: https://date-fns.org
- Eingebaut in Scheibe: aufraeumen-datum

## 2026-11-13 · Daten holen und ändern
- Kandidaten: TanStack Query 5 (Zwischenspeicher, doppelte Anfragen fallen weg, sofort zeigen mit Zurückrollen, MIT), SWR (kein eingebautes Zurückrollen bei Änderungen), eigener Speicher (sieben Kopien im Code, PRUEFUNG E1)
- Entscheidung: TanStack Query (`@tanstack/react-query`)
- Grund: Ja des Nutzers vom 2026-11-12 (PRUEFUNG E1); ein Hook je Anfrage in `geruest/daten.ts`, Seitenwechsel zeigen Gespeichertes sofort.
- Link: https://tanstack.com/query
- Eingebaut in Scheibe: aufraeumen-daten

## 2026-11-13 · Daten prüfen
- Kandidaten: Zod 4 (Schemas mit Typen, deutsche Meldungen, `.catch()` für Ersatzwerte, MIT), Valibot (kleiner, aber zweite Schreibweise je Schema), eigene `typeof`-Ketten (PRUEFUNG E5)
- Entscheidung: Zod (`zod`)
- Grund: Ja des Nutzers vom 2026-11-12 (PRUEFUNG E5); ein Schema je Vertrag prüft Server, Attrappe und Gemerktes gleich, Typen entstehen daraus.
- Link: https://zod.dev
- Eingebaut in Scheibe: aufraeumen-schema

## 2026-11-13 · Speicher für Zustand der Oberfläche
- Kandidaten: Zustand 5 (kleiner Speicher mit Hook, `persist` für den Browser, MIT), Jotai (Atome, für wenige große Speicher umständlicher), eigene Hörer-Listen (sechs Kopien, PRUEFUNG E2)
- Entscheidung: Zustand (`zustand`)
- Grund: Ja des Nutzers vom 2026-11-12 (PRUEFUNG E2); ein Muster für alle Speicher, Merken im Browser samt Fehlerbehandlung fertig.
- Link: https://zustand.docs.pmnd.rs
- Eingebaut in Scheibe: aufraeumen-speicher

## 2026-11-13 · Doppelten Code finden
- Kandidaten: jscpd 5 (viele Sprachen, Grenze in Prozent, Ausgabe mit Datei und Zeile, MIT), eigene Suche (keine Erkennung von Kopien mit anderen Namen)
- Entscheidung: jscpd (Entwicklungs-Abhängigkeit)
- Grund: Ja des Nutzers vom 2026-11-12 (Regel C); Zeile „Doppelt“ in `npm run pruefen`, Grenze 0 %, Einstellungen in `.jscpd.json`.
- Link: https://github.com/kucherenko/jscpd
- Eingebaut in Scheibe: aufraeumen-waechter

## 2026-11-13 · Ordner ziehen
- Kandidaten: Pragmatic drag and drop 4 mit Hitbox „list-item“ (davor, danach, hinein fertig; klein; Apache 2.0), dnd-kit (gute Fingerbedienung, Baum-Logik selbst), kein Ziehen
- Entscheidung: `@atlaskit/pragmatic-drag-and-drop` und `@atlaskit/pragmatic-drag-and-drop-hitbox` (Nutzer)
- Grund: Baum-Ablage ohne Eigenbau; gezogen wird am Link der Zeile. Für Tastatur und Finger zusätzlich „Verschieben nach“ im Menü.
- Link: https://atlassian.design/components/pragmatic-drag-and-drop
- Eingebaut in Scheibe: postfach-ordner

## 2026-11-13 · Menü per Rechtsklick und langem Druck
- Kandidaten: shadcn Context Menu (@radix-ui/react-context-menu: Rechtsklick, langer Druck, Menütaste, Untermenüs), shadcn Dropdown Menu (nur am Knopf)
- Entscheidung: `@radix-ui/react-context-menu` als `bausteine/Menue.tsx` (Nutzer)
- Grund: dieselbe Familie wie `Aufklapp`; ein Menü für Maus, Finger und Tastatur.
- Link: https://ui.shadcn.com/docs/components/context-menu
- Eingebaut in Scheibe: postfach-ordner
