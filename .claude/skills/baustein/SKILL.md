---
name: baustein
description: Vor einem Eigenbau nach einem fertigen Baustein suchen und das Ergebnis in docs/BAUSTEINE.md festhalten.
argument-hint: "[aufgabe in wenigen worten]"
disable-model-invocation: true
---

Aufgabe: $ARGUMENTS

1. Suche mit Grep in `docs/konzept/30-bausteine.md` und `docs/BAUSTEINE.md`, ob für diese Aufgabe schon ein Baustein feststeht. Wenn ja, nenne ihn und halte an.
2. Suche im Netz nach höchstens drei Kandidaten. Lies je Kandidat nur die Übersichtsseite.
3. Prüfe jeden Kandidaten:
   - wird gepflegt (letzte Veröffentlichung, offene Fehlerberichte)
   - Lizenz erlaubt die Nutzung
   - Größe im fertigen Paket
   - funktioniert mit Finger am Handy und mit Tastatur
   - passt zu React und TypeScript
   - nimmt die Design-Werte von Tide an, ohne dass man gegen ihn arbeitet
4. Trage das Ergebnis in `docs/BAUSTEINE.md` ein: Datum, Aufgabe, Kandidaten mit je einer Zeile, Empfehlung, Grund, Link.
5. Antworte in höchstens 8 Zeilen mit der Empfehlung. Gibt es nichts Passendes, sag das und schätze den Eigenbau in Scheiben.
6. Installiere nichts, bevor der Nutzer Ja sagt.

Gilt als Eigenbau erlaubt ohne Suche: alles unter etwa 50 Zeilen Logik.
