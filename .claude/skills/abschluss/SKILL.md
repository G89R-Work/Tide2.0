---
name: abschluss
description: Eine Scheibe abschließen - Stand und Entscheidungen festhalten, in den Hauptstand übernehmen, hochladen.
disable-model-invocation: true
---

Schließe die laufende Scheibe ab. `/scheibe` ruft diese Schritte selbst auf; von Hand nur nötig, wenn eine Sitzung abgebrochen wurde.

1. `npm run pruefen` ausführen. Meldet es etwas, behebe es. Ohne grünen Lauf gibt es keinen Abschluss.
2. In `docs/FAHRPLAN.md` das Kästchen der Scheibe auf `[x]` setzen.
3. `STATUS.md` neu schreiben, höchstens 40 Zeilen:
   - Etappe und nächste Scheibe (die Zeile „In Arbeit" und der Plan fallen weg)
   - Stand in ein bis zwei Sätzen
   - Zuletzt erledigt: die letzten fünf Scheiben, je eine Zeile
   - Stolpersteine: nur, was die nächste Sitzung wissen muss
4. Jede Entscheidung dieser Sitzung, auch nach Empfehlung entschiedene offene Punkte, als eine Zeile mit Datum in `docs/ENTSCHEIDUNGEN.md` unter „Entschieden" eintragen und aus „Offen" entfernen.
5. Sichern: alles aufnehmen, Nachricht `Scheibe <name>: <was entstanden ist>`.
6. In den Hauptstand übernehmen, damit das nächste Konto ihn vorfindet:
   - Bist du auf `main`: hochladen.
   - Bist du auf einem anderen Zweig (in Cloud-Sitzungen üblich): neuesten `main` holen, den Zweig in `main` zusammenführen, `main` hochladen.
   - Lässt sich `main` nicht direkt hochladen: Pull Request vom Zweig nach `main` anlegen und mit `gh pr merge` zusammenführen.
   - Klappt auch das nicht: halte an und sag dem Nutzer in einem Satz, wo er auf GitHub „Merge" drücken muss.
7. Prüfe mit `git status` und einem Vergleich mit `origin/main`, dass nichts ungesichert ist.

Schreibe nichts in `STATUS.md`, was im Fahrplan oder im Konzept schon steht.
