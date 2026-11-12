---
name: scheibe
description: Die nächste Scheibe von Tide von Anfang bis Abschluss bauen - Stand lesen, Konzept lesen, bauen, prüfen, sichern.
argument-hint: "[name-der-scheibe, leer = nächste]"
disable-model-invocation: true
---

Scheibe: $ARGUMENTS

Ein Paket sind drei Scheiben nacheinander. Arbeite für jede Scheibe die Schritte 1 bis 9 der Reihe nach ab, ohne zwischendurch auf Bestätigung zu warten, und beginne danach die nächste Scheibe bei Schritt 1, als wäre `/clear` gekommen (nichts aus der vorigen Scheibe voraussetzen, Stand neu aus `STATUS.md`). Halte nur dort an, wo es unten steht. Ein angegebener Name gilt für die erste Scheibe des Pakets.

1. **Stand.** Lies `STATUS.md`. Steht dort „In Arbeit", war eine Sitzung (vielleicht in einem anderen Konto) mittendrin: Nimm diese Scheibe, sieh mit `git log --oneline -15` und `git diff --stat main` nach, was schon da ist, und mach dort weiter. Sonst nimm den angegebenen Namen oder „Nächste Scheibe". Meldet der Start einen Hinweis zum Stand aus GitHub, kläre das zuerst.
2. **Auftrag.** Suche in `docs/FAHRPLAN.md` mit Grep die Zeile dieser Scheibe. Lies nur diese Zeile. Gibt es sie nicht, nenne die drei ähnlichsten Namen und halte an.
3. **Konzept.** Lies genau die Dateien aus `docs/konzept/`, die in der Zeile hinter „liest" stehen. Keine weiteren Konzeptdateien.
4. **Offenes.** Suche in `docs/ENTSCHEIDUNGEN.md` im Abschnitt „Offen" nach Punkten für diese Scheibe. Entscheide nach der Empfehlung dort und notiere es für den Abschluss.
5. **Plan.** Trag in `STATUS.md` die Zeile `In Arbeit: <name>` ein und darunter den Plan in höchstens 6 Zeilen. Zeig den Plan und fang direkt an.
   Halte nur an und frag, wenn der Plan eine neue Abhängigkeit braucht, den Vertrag in `src/vertrag/` ändert, vom Konzept abweicht oder schwer umkehrbar ist. Stell dann alle Fragen auf einmal, je mit deiner Empfehlung.
6. **Bauen.** Erst Logik mit Test, dann Oberfläche aus vorhandenen Bausteinen.
7. **Prüfen.** `npm run pruefen` ausführen, bis nichts mehr gemeldet wird.
8. **Ansehen.** Hat sich die Oberfläche geändert: `npm run sicht -- <seite>` ausführen, beide Bilder ansehen, Messwerte mit `docs/konzept/02-tempo.md` vergleichen. Fehler beheben, erneut prüfen.
9. **Abschluss.** Führe die Schritte aus `.claude/skills/abschluss/SKILL.md` aus.
10. **Weiter oder Bericht.** Sind noch nicht drei Scheiben dieses Pakets fertig: eine Zeile „✅ <name> fertig, weiter mit <nächste>“ und zurück zu Schritt 1. Nach der dritten: Bericht, höchstens 6 Zeilen je Scheibe:  was gebaut wurde, 3 bis 5 Dinge zum Ausprobieren, was offen blieb, welche offenen Punkte du nach Empfehlung entschieden hast. Letzte Zeile: „✅ Paket fertig. Tippe jetzt /clear und dann /scheibe." Danach nichts mehr tun, kein neues Paket beginnen.

Grenzen:
- Nichts außerhalb der Scheibe umbauen. Fällt etwas auf, kommt eine Zeile nach `docs/IDEEN.md`.
- „Fertig, wenn" aus der Fahrplan-Zeile ist der Maßstab. Mehr wird nicht gebaut.
- Schlägt derselbe Ansatz zweimal fehl, halte an und beschreibe das Hindernis in drei Zeilen mit zwei Auswegen.
