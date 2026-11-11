# Bausteine

Stand 2026-11-11 · Teil des Gesamtkonzepts. „Deine Version" meint den alten Prototyp 3, „meine Beispielseite" die Beispielseite vom 10.11.

Fast alles, was in deinem Prototyp von Hand gebaut ist, gibt es fertig. Selbst gebaut wird nur, was Tide ausmacht.

## Fertig einbinden

„Geprüft“ heißt: Ich habe die verlinkte Seite für dieses Konzept gelesen. „Bekannt“ heißt: Ich kenne den Baustein, er wird in seiner Etappe am echten Fall geprüft, bevor er eingebaut wird.

| Aufgabe | Baustein | Stand |
| --- | --- | --- |
| Grundgerüst | React, TypeScript, Vite, Tailwind | Bekannt, aus dem ersten Konzept |
| Dialoge, Menüs, Auswahlfelder | shadcn/ui | Bekannt |
| Kacheln verschieben und Größe ändern | [react-grid-layout](https://socket.dev/npm/package/react-grid-layout/overview/2.0.0), ersatzweise [gridstack.js](https://cdn.jsdelivr.net/npm/gridstack@13.0.0/README.md) | Geprüft, Versuch in Etappe 1 |
| Breite von Seitenleiste und Spalten ziehen | [react-resizable-panels](https://cdn.jsdelivr.net/npm/react-resizable-panels@4.7.6/README.md) | Geprüft |
| Sortieren per Ziehen: Bereiche, Ordner, Listen | [dnd-kit](https://github.com/clauderic/dnd-kit) | Bekannt |
| Suchfeld mit Aktionen | [cmdk](https://awesome.ecosyste.ms/projects/github.com%2Fpacocoursey%2Fcmdk) | Bekannt |
| Suche im Prototyp | [MiniSearch](https://www.github.com/lucaong/minisearch) | Bekannt |
| Lange Listen | [TanStack Virtual](https://tanstack.com/virtual/latest) | Bekannt |
| Regel-Editor | [react-querybuilder](https://react-querybuilder.js.org/docs/utils/export) | Geprüft |
| Regeln auswerten | [json-logic-js](https://npmjs.com/package/json-logic-js) | Bekannt |
| Feiertage je Bundesland | [date-holidays](https://cdn.jsdelivr.net/npm/date-holidays@3.28.0/README.md) | Geprüft; die Daten verlangen eine Quellenangabe |
| Wochenansicht im Kalender | [Schedule-X](https://v2.schedule-x.dev) | Bekannt, Versuch in Etappe 4 |
| Attrappen-Daten | [Mock Service Worker](https://github.com/mswjs/mswjs.io/blob/f089c360f7b5b9b9a89cc6fad0f08f8c1223fe39/src/content/docs/integrations/browser.mdx) | Geprüft |
| Rechtschreibprüfung | [LanguageTool](https://dev.languagetool.org/public-http-api) auf dem eigenen Server | Geprüft |
| Diktat | Spracherkennung des Browsers, [auf dem Gerät](https://developer.mozilla.org/docs/Web/API/SpeechRecognition/processLocally) | Geprüft, Unterstützung je Gerät offen |
| Text aus Bon-Fotos | Tesseract.js | Später |
| Sonne und Mond | Deine Formeln aus Version 3 oder [SunCalc](https://github.com/mourner/suncalc) | Bekannt |
| Wetter | [Open-Meteo](https://open-meteo.com/), [Bright Sky](https://brightsky.dev/), MET Norway | Geprüft im Produktkonzept |
| Mail-Inhalt gefahrlos anzeigen | Eine fertige Reinigungs-Bibliothek | Bekannt |
| Text-Editor für Mail und Notiz | Ein fertiger Editor mit Markdown | Bekannt, Auswahl in Etappe 3 |

Für den späteren Server gelten die Bausteine aus dem ersten Konzept weiter: Mail-Abgleich, Kalender-Protokoll, Datenbank mit Volltextsuche, Anmeldung per Passkey.

## Selbst bauen

Das ist die vollständige Liste dessen, was wirklich neu entsteht:

| Teil | Warum es keinen Baustein gibt |
| --- | --- |
| Gezeitenkurve | Deine Erfindung |
| Hintergrund mit Sonne, Mond und Wellen | Dein Aussehen |
| Bearbeiten-Modus der Kacheln | Die Klammer um den Raster-Baustein: langer Druck, Griffpunkte, Rechtsklick-Menü |
| Zweispaltiges Menü und belegbare Knöpfe | Dein Bedienkonzept |
| Liste der Aktionen und Liste der Einstellungen | Die zwei zentralen Verzeichnisse, aus denen Knöpfe, Suche und Einstellungsseite entstehen |
| Schicht-Rhythmus und Hinweise zum Plan | Wenige Zeilen Logik, mit Tests |
| Urlaubsplaner | Deine Rechnung aus Version 3 |
| Erkennung in Mails | Die Stufen aus dem Produktkonzept, zusammengesetzt aus fertigen Teilen |
| Lernende Reihenfolge im Einkaufsmodus | Wenige Zeilen Logik |
| Bezüge zwischen den Bereichen | Termin in Schicht, Rechnung wird To-do, Timer in der Kurve |

## Die Regel für alles Weitere

Bevor etwas gebaut wird, das größer als ein halber Tag ist, wird nach einem Baustein gesucht. Das Ergebnis steht in einer Datei im Projekt: Aufgabe, gefundene Bausteine, Entscheidung, Grund. Im Startpaket gibt es dafür einen eigenen Befehl.
