# Entscheidungen

Eine Zeile je Entscheidung, neueste unten. Was hier steht, gilt und wird nicht neu verhandelt.

## Entschieden
- 2026-11-10 · Tide wird von Grund auf neu gebaut. Aus dem alten Prototyp wird kein Code übernommen.
- 2026-11-10 · Tide läuft später online über die eigene Domain, mit mehreren Nutzern und Teilen über Räume. Das gehört in die Server-Etappen.
- 2026-11-11 · Grundgerüst der Seiten ist die Beispielseite. Funktionen, Farben (Glut), Schrift (Inter), Kacheln und Gezeitenkurve kommen aus Prototyp 3.
- 2026-11-11 · Zuerst entsteht der Prototyp als echtes Frontend mit Attrappen-Daten, danach der Server.
- 2026-11-11 · Knopf-Belegung wird wie die Leistenbreite im Browser gemerkt (`tide.knoepfe`), nicht über den Vertrag; Umzug in die Einstellungsliste mit `einstellungen-liste`.
- 2026-11-11 · Tastenkürzel ohne neue Bibliothek: Alt+1…0 für die Bereiche, Alt+Buchstabe für Aktionen, Strg+K für die Suche; gelesen wird die Taste, nicht das Zeichen.
- 2026-11-11 · Noch nicht gebaute Aktionen (Kurve, Suche, Diktat) stehen in der Liste, sind aber ausgegraut mit Hinweis, wann sie kommen. „Neue Mail" u. ä. öffnen bis dahin ihren Bereich.
- 2026-11-11 · Tide läuft ohne KI. Statt „Kurz gesagt" gibt es den Erkannt-Kasten per Regel.
- 2026-11-11 · Tempo geht vor Effekt. Bewegung steht ab Werk auf „Rückmeldung" und ist je Nutzer einstellbar.
- 2026-11-11 · Die Gezeitenkurve ist auf jeder Seite eingeblendet, je Seite abschaltbar und nimmt am PC unten die volle Breite ein. Beim Ausblenden kommt keine Meldung.
- 2026-11-11 · Kein ECC. Die eigenen Regeln in CLAUDE.md und `.claude/rules/` reichen und sparen Tokens. Nach jeder Scheibe `/clear`.
- 2026-11-11 · Werkzeuge: Vitest für Tests, oxlint für Stil (statt ESLint, weil die Vite-Vorlage es so liefert), Tailwind 4 über das Vite-Plugin.
- 2026-11-11 · Jeder Bereich hat zwei Ebenen. Handy: zweispaltiges Menü oben links, drei belegbare Knöpfe oben rechts, untere Leiste mit vier Plätzen und Plus.
- 2026-11-11 · Alle Seiten bestehen aus Kacheln, die sich wie Widgets in One UI verschieben und in der Größe ändern lassen.
- 2026-11-11 · Designs im Prototyp: Glut als Standard und Tinte. Helle Designs kommen später.
- 2026-11-11 · Heute folgt Prototyp 3, ohne To-do-Liste. „Braucht dich" ist eine schmale Kachel. Die Uhrzeile gibt es nur auf Heute.
- 2026-11-11 · Postfach mit allen Funktionen aus Prototyp 3. Regeln mit react-querybuilder und JsonLogic. Konten werden nur in den Einstellungen verwaltet.
- 2026-11-11 · Kalender: links Monat oder Woche, rechts der Tag. Die Kalenderwoche ist sichtbar.
- 2026-11-11 · To-dos sind die früheren Erinnerungen, mit Suche und Archiv.
- 2026-11-11 · Einkauf und Kochen bleiben getrennt. Es gibt einen Einkaufsmodus. Ein Vorrat wird nicht geführt.
- 2026-11-11 · Finanzen übernimmt den Aufbau der Beispielseite.
- 2026-11-11 · Arbeit bekommt den Rhythmus-Baukasten. Der Urlaubsplaner ist eine kleine Kachel.
- 2026-11-11 · Die Einstellungen sind eine eigene Seite. Aktionen und Einstellungen stehen je in einer zentralen Liste.
- 2026-11-11 · Architektur, Mail-Abgleich und Sicherheit aus dem ersten Konzept gelten weiter und werden nach dem Prototyp gebraucht.
- 2026-11-11 · Es baut immer nur ein Claude-Konto gleichzeitig. Beim Start wird der Stand automatisch geholt, nach jeder Antwort automatisch gesichert.
- 2026-11-11 · Claude arbeitet eine Scheibe ohne Zwischenfragen ab und fragt nur bei wichtigen Entscheidungen. Offene Punkte entscheidet es nach der Empfehlung.
- 2026-11-11 · Tinte-Farben nach den Werten der Beispielseite (vom Nutzer). Eigene Ergänzungen: Himmel aus Grund und Stufe 1, dritter Raum #A9A9A6; Glut-Regen #8fbcb6.
- 2026-11-11 · Inter liegt lokal über @fontsource-variable/inter, ohne Aufruf bei Google.
- 2026-11-11 · Knopf nach shadcn-Muster mit class-variance-authority, clsx, tailwind-merge und @radix-ui/react-slot.
- 2026-11-11 · Tailwinds eigene Farben sind abgeschaltet; es gibt nur die Farben aus src/werte/. Abstände nur aus der Skala (p-4 usw.).
- 2026-11-11 · Ein Eintrag hat die Grundfelder id, art, titel, erledigt, erstellt, geaendert. Ändern über PATCH, nur titel und erledigt.
- 2026-11-11 · Die Attrappe speichert Änderungen im Browser (localStorage) und wird nachgeladen, damit sie nicht im Startpaket steckt.
- 2026-11-11 · Tempo-Grenzen stehen einmal in `src/logik/tempoGrenzen.ts`; `npm run pruefen` misst sie auf Start und Bausteine.
- 2026-11-11 · Neun Bereiche und die Einstellungen (offener Punkt 1, nach Empfehlung).
- 2026-11-11 · Seitenleiste mit react-resizable-panels, Symbole aus lucide-react; Ja des Nutzers.
- 2026-11-11 · Bereiche sind über Sprungmarken (#heute, #postfach …) erreichbar; Zurück im Browser macht den Wechsel rückgängig.
- 2026-11-11 · Zweite Ebene: feste Liste je Bereich in `src/logik/ebenen.ts`, erreichbar unter `#bereich/unterpunkt`; ohne Unterpunkt gilt der erste. Eigene Ordner kommen später über den Vertrag.
- 2026-11-11 · Handy-Menü ist ein natives `<dialog>` statt einer neuen Abhängigkeit; Handy-Ansicht unter 768 px.
- 2026-11-11 · Punkt am Menü-Knopf zählt vorerst die offenen Einträge aus dem Vertrag; „Braucht dich“ ersetzt das später.
- 2026-11-11 · Einstellungen: zentrale Liste in `src/logik/einstellungen.ts`; gespeichert über den Vertrag (`/api/einstellungen`), nur Abweichungen vom Standard, je Geräteart unter `<id>@pc`/`<id>@handy`. Geräteart = Handy-Ansicht (unter 768 px).
- 2026-11-11 · Die zweite Ebene der Einstellungen kommt aus den Abschnitten des Konzepts, davor „Grundlegendes“ (Zeilen mit `wichtig`). „Über Tide“ entfällt.
- 2026-11-11 · Schalter ist ein natives Kästchen mit `role="switch"`, keine neue Abhängigkeit. Ab-Werk-Werte für Bahn, Stunden und Lage am Handy folgen den Empfehlungen zu Nr. 3–5, die selbst offen bleiben.
- 2026-11-11 · Wunsch des Nutzers: Seitenleiste am PC: Standard- und Mindestbreite so breit wie „Finanzen“ (147 px, links und rechts gleicher Abstand), breiter ziehbar bis 360 px; „Einstellungen“ immer nur als Zahnrad, mittig. Obere Leiste am Handy ohne Fläche, nur freie Knöpfe. Auswahlfelder in den Einstellungen gleich breit, „Auf Standard“ je Zeile immer sichtbar (ausgegraut, solange der Standard gilt). Jede Einstellungszeile ist gleich hoch (64 px), höchstens zwei Textzeilen.
- 2026-11-11 · Sonne und Mond rechnet SunCalc 2 (Ja des Nutzers). Ort weltweit frei über die Einstellungen „Ort: Breite“ und „Ort: Länge“ (0,01°), ab Werk Mitte Deutschlands (51,31° N, 9,49° O). Bogen folgt Auf- und Untergang, „Echt“ legt Nordost bis Nordwest auf die Bildbreite und 0–90° Höhe auf die Himmelshöhe. Bei Polartag/-nacht zeigt der Bogen die Höhe, Mittag in der Mitte.

## Offen

Zehn Punkte sind offen. Bei jedem steht meine Empfehlung. Ohne Antwort gilt die Empfehlung.

| Nr. | Frage | Empfehlung | Wann nötig |
| --- | --- | --- | --- |
| 2 | Kachel-Baustein | react-grid-layout, sofern der Versuch auf deinem Handy besteht | In Etappe 1 |
| 3 | Bahn von Sonne und Mond ab Werk | Bogen, „Echt“ als Schalter | In Etappe 2 am Bildschirm |
| 4 | Lage der Gezeitenkurve am Handy | Unten über der Leiste | In Etappe 2 |
| 5 | Sichtbare Stunden ab Werk | 4 | In Etappe 2 |
| 6 | Belegung am Handy ab Werk | Oben: Kurve, Suche, Einstellungen. Unten: Heute, Postfach, Plus, Kalender, To-dos | In Etappe 1 |
| 7 | Notizen für die Arbeit | Derselbe Baustein im Raum Arbeit | Vor Etappe 4 |
| 8 | Bons vom Foto | Später als Versuch hinter einem Schalter | Nach dem Prototyp |
| 9 | Diktat-Knopf im Prototyp | Ja, mit Hinweis, wohin der Ton geht | Vor Etappe 8 |
| 10 | Rechtschreibprüfung | Eigener Server auf dem Homeserver | Server-Etappe S6 |
| 11 | Helle Designs | Nach dem Prototyp | Später |
