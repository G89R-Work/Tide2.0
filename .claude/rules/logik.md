---
paths:
  - "src/logik/**"
  - "src/**/*.test.ts"
  - "src/**/*.test.tsx"
---

# Logik und Tests

- Logik ist eine reine Funktion: gleiche Eingabe, gleiche Ausgabe. Kein Zugriff auf Bildschirm, Netz oder Speicher.
- Die aktuelle Zeit wird als Wert übergeben, nie in der Funktion abgefragt. So sind Tests für jeden Tag und jede Uhrzeit möglich.
- Zeiten gelten in deutscher Zeit. Tests decken die Umstellung auf Sommer- und Winterzeit und den Wechsel über Mitternacht ab.
- Der Test entsteht vor dem Code. Jeder Fall aus dem Konzept bekommt einen Test, zum Beispiel jede Zeile der Rhythmus-Tabelle in `docs/konzept/17-arbeit.md`.
- Testnamen sind deutsche Sätze: „Termin in der Schicht wird als Überschneidung gemeldet".
- Beispieldaten für Tests liegen neben dem Test und sind erfunden.
- Erkennung aus Text (Fristen, Beträge, Zeitangaben) arbeitet mit Mustern, nie mit KI. Jedes Muster hat Beispiele für Treffer und für Nicht-Treffer.
- Ist ein Ergebnis unsicher, liefert die Funktion „nicht erkannt". Raten ist ein Fehler.
- Während der Arbeit nur die betroffenen Tests laufen lassen. Vor dem Abschluss läuft `npm run pruefen` ganz.
