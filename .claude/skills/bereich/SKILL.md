---
name: bereich
description: Einen Bereich von Tide nach Schablone anlegen - Seite, Kacheln, zweite Ebene, Aktionen, Einstellungen, Vertrag und Attrappe.
argument-hint: "[name-des-bereichs]"
disable-model-invocation: true
---

Bereich: $0

Lege das leere Gerüst für diesen Bereich an. Inhalte kommen später in eigenen Scheiben.

1. Lies in `docs/konzept/03-geruest.md` nur die Zeile der Tabelle „Die zwei Ebenen" für diesen Bereich (Grep).
2. Lege an, jeweils nach dem Vorbild eines vorhandenen Bereichs:
   - `src/bereiche/$0/Seite.tsx` mit einer Platzhalter-Kachel
   - `src/bereiche/$0/kacheln/`
   - `src/bereiche/$0/ebene.ts` mit den Einträgen der zweiten Ebene
   - `src/bereiche/$0/aktionen.ts` mit der Aktion „Bereich öffnen"
   - `src/bereiche/$0/einstellungen.ts`, zunächst nur „Gezeitenkurve auf dieser Seite"
   - `src/bereiche/$0/werkszustand.ts`
   - `src/vertrag/$0.ts` mit den Typen des Bereichs
   - `src/attrappe/$0.ts` mit Antworten und zehn erfundenen Beispieleinträgen
3. Melde den Bereich im Gerüst an, so dass er erst beim Öffnen geladen wird.
4. `npm run pruefen`, bis nichts mehr gemeldet wird.
5. Antworte in 3 Zeilen: angelegt, erreichbar unter welchem Pfad, nächster Schritt.

Gibt es noch keinen Bereich als Vorbild, halte an: Dann ist zuerst die Scheibe `geruest-seitenleiste` dran.
