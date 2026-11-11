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
