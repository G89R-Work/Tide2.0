---
paths:
  - "src/**/*.tsx"
  - "src/**/*.css"
---

# Oberfläche

## Werte und Bausteine
- Keine Farbe, kein Abstand, keine Rundung, kein Schatten und keine Dauer steht direkt im Code. Alles kommt aus `src/werte/`.
- Erst in `src/bausteine/` nachsehen. Ein neuer gemeinsamer Baustein entsteht dort, mit Eintrag auf der Bausteine-Seite.
- Knopf: ein Baustein, vier Spielarten (Standard, Hauptaktion, Leise, Nur Symbol), zwei Größen. Keine weiteren.
- Fläche: drei Arten (Leiste, Kachel, Schwebend). Keine weiteren.
- Schrift ist Inter. Kleine Beschriftungen in Großbuchstaben kommen aus dem Beschriftungs-Baustein.

## Glas und Tempo
- Echter Weichzeichner nur auf: Seitenleiste, Gezeitenkurve, Leisten am Handy, schwebende Dialoge. Höchstens 4 sichtbar je Seite.
- Kacheln sind getönte Flächen ohne Weichzeichner. In einer Fläche liegt nie eine zweite Glasfläche.
- Text steht immer auf einer Fläche. Einzige Ausnahme: die große Überschrift auf Heute.
- Im Ruhezustand läuft keine Animation. Bewegung richtet sich nach der Stufe aus den Einstellungen: Aus, Rückmeldung (Standard), Sanft.
- Jeder Bereich wird erst beim Öffnen geladen. Listen mit mehr als 50 Zeilen zeichnen nur Sichtbares (TanStack Virtual).

## Bedienung
- Jede Seite funktioniert am Handy (ab 360 Pixel Breite) und am PC. Tablet und PC nutzen dieselbe Ansicht.
- Rechtsklick und langer Druck öffnen dasselbe Menü.
- Alles ist mit der Tastatur erreichbar und hat einen sichtbaren Fokus.
- Meldungen verdecken nie eine Überschrift. Sie erscheinen in der Kopfzeile der Gezeitenkurve und falten sich nach 6 Sekunden in die Glocke.
- Der linke Bildschirmrand bleibt frei von eigenen Gesten (Zurück-Geste von Android).
- Texte der Oberfläche sind deutsch, kurz und ohne Fachwörter.

## Nach jeder Änderung an der Oberfläche
`npm run sicht -- <seite>` ausführen und beide Bilder ansehen: nichts überlappt, nichts ist abgeschnitten, die Tempo-Werte liegen in den Grenzen.
