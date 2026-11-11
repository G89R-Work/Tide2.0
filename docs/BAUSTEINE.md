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
