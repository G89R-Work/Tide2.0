---
paths:
  - "src/bereiche/**"
---

# Bereiche

Jeder Bereich liegt in `src/bereiche/<name>/` und hat denselben Aufbau:

- `Seite.tsx` setzt die Seite aus Kacheln zusammen. Kein eigenes Gerüst.
- `kacheln/` enthält die Kacheln. Jede Kachel kennt zwei oder drei Darstellungen (klein, mittel, groß) und eine Mindestgröße.
- `ebene.ts` beschreibt die zweite Ebene für Seitenleiste und Handy-Menü.
- `aktionen.ts` trägt jede Funktion des Bereichs in die Aktionsliste ein: Name, Symbol, Tastenkürzel.
- `einstellungen.ts` trägt jede Option in die Einstellungsliste ein: Name, Art, Standardwert, Abschnitt.
- `werkszustand.ts` enthält die Anordnung der Kacheln ab Werk, je Geräteart.

Regeln:
- Ein Bereich greift nie in den Ordner eines anderen Bereichs. Gemeinsames gehört nach `src/bausteine/`, `src/logik/` oder `src/vertrag/`.
- Bezüge zwischen Bereichen (Termin fällt in Schicht, Rechnung wird To-do, Timer in der Kurve) sind reine Funktionen in `src/logik/bezuege/`.
- Große Arbeitsflächen (Postfach mit Liste und Leser, Kalender mit Monat und Tag) sind eine Kachel-Gruppe mit ziehbaren Trennlinien.
- Jede Liste hat einen gestalteten Leerzustand und einen Fehlerzustand.
- Was fertig bedeutet, steht in der Zeile der Scheibe in `docs/FAHRPLAN.md`. Mehr wird nicht gebaut.
