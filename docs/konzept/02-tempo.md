# Tempo

Stand 2026-11-11 · Teil des Gesamtkonzepts. „Deine Version" meint den alten Prototyp 3, „meine Beispielseite" die Beispielseite vom 10.11.

Dein Prototyp ist langsam, weil der Browser in jedem Bild viele Glasflächen neu weichzeichnen muss, während dahinter dauernd etwas läuft. Am Programmcode liegt es kaum.

## Was ich gemessen habe

Gemessen auf der Heute-Seite im Ruhezustand, ohne dass jemand etwas anfasst. Der Testrechner hat keine Grafikkarte, die absoluten Zahlen sind auf deinen Geräten also besser. Das Verhältnis zählt.

| Messwert | Dein Prototyp 3 | Meine Beispielseite |
| --- | --- | --- |
| Sichtbare Glasflächen mit Weichzeichner | 18 | 3 |
| Glasflächen insgesamt auf der Seite | 91 | 4 |
| Dauernd laufende Animationen | 23 | 0 |
| Bilder pro Sekunde im Ruhezustand | 23 | 60 |
| Elemente auf der Seite | 1.750 | 626 |

Dazu kommt der Aufbau der Datei: 634 Kilobyte in einer Datei, 28 nachträglich angehängte Stilblöcke, 12 Skriptblöcke und 153 Stellen, an denen eine spätere Regel eine frühere mit Gewalt überschreibt. Das ist die Spur von mindestens 59 Runden Nachbessern. Es erklärt, warum bei dir nichts mehr einheitlich aussieht.

## Die Ursache in einem Satz

Eine Glasfläche kostet nichts, solange sich dahinter nichts bewegt. Bei dir bewegt sich dahinter immer etwas, also rechnet der Browser 18 Flächen 60-mal pro Sekunde neu.

## Sechs Tempo-Regeln

1. **Höchstens vier Flächen mit echtem Weichzeichner:** Seitenleiste, Gezeitenkurve, die Leisten am Handy und schwebende Dialoge. Kacheln bekommen eine durchscheinende Tönung ohne Weichzeichner. Über dem weichen Hintergrund sieht das fast gleich aus.
2. **Der Hintergrund steht still.** Sonne und Mond rücken einmal pro Minute ein Stück weiter. Das wirkt lebendig und kostet nichts. Bewegte Wellen sind ein Schalter und ab Werk aus.
3. **Keine Animation ohne Anlass.** Im Ruhezustand läuft keine einzige.
4. **Jeder Bereich lädt erst, wenn du ihn öffnest.** Beim Start kommen nur das Gerüst und Heute.
5. **Lange Listen zeichnen nur, was sichtbar ist.** Dafür gibt es den Baustein [TanStack Virtual](https://tanstack.com/virtual/latest).
6. **Kein Glas in Glas.** Das war bei dir auch der Grund für durchscheinende Zahlen.

## Die Grenzen, automatisch geprüft

Der Prüfbefehl misst bei jedem Lauf dasselbe wie ich oben. Überschreitet eine Seite eine Grenze, schlägt er fehl.

| Grenze | Wert |
| --- | --- |
| Sichtbare Flächen mit Weichzeichner je Seite | höchstens 4 |
| Laufende Animationen im Ruhezustand | 0 |
| Wechsel zwischen zwei Bereichen | unter 0,1 Sekunden |
| Erstes Laden des Gerüsts, gepackt | unter 210 Kilobyte Programmcode (bis 14.11.2026: 200) |

So kann das Problem nicht unbemerkt zurückkommen.
