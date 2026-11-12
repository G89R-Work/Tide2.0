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
- 2026-11-12 · Wunsch des Nutzers: Wellen größer, länger und höher geschwungen. Ihre Höhe ist einstellbar (Viertel, Drittel, Goldener Schnitt, Hälfte der Seite), ab Werk Goldener Schnitt (38,2 %). Die Wellen werden nie schmaler als 3,9 : 1 (Form am PC beim Goldenen Schnitt); am Handy und bei „Hälfte“ werden sie seitlich abgeschnitten statt gestaucht.
- 2026-11-11 · Kachel-Baustein ist react-grid-layout 2.3 (offener Punkt 2, nach Empfehlung; Ja des Nutzers, ohne eigenen Versuch auf dem Handy). Raster 12 Spalten am PC, 2 am Handy; Tablet nutzt die PC-Ansicht (Regel „Tablet und PC nutzen dieselbe Ansicht“).
- 2026-11-11 · Bearbeiten-Modus: langer Druck (450 ms) öffnet Modus und dasselbe Menü wie der Rechtsklick; außerdem Knopf „Anpassen“, Aktion „Kacheln anpassen“ (Alt+B) und F2 auf einer Kachel. Am PC zieht man an der Kopfzeile, am Handy an der ganzen Kachel; Griffpunkte rechts, unten und an der Ecke. Pfeiltasten verschieben, Umschalt und Pfeiltasten ändern die Größe, Eingabe/Esc/„Fertig“ beenden. Inhalte sind im Modus nicht bedienbar.
- 2026-11-11 · Feste Größen im Menü (PC/Handy in Spalten × Zeilen): Klein 3×2/1×2, Mittel 4×3/2×2, Groß 6×4/2×4, Breit 12×2/2×2, Hoch 3×5/1×4; nie unter der Mindestgröße der Kachel. Ausgeblendete Kacheln holt man in der Leiste des Modus zurück.
- 2026-11-11 · Vertrag `/api/kacheln/<seite>/<geraet>`: GET liefert die gemerkte Anordnung oder null (Werkszustand), PUT speichert, DELETE setzt zurück. Gleich dem Werk wird nichts gemerkt.
- 2026-11-11 · Aktionen kennen neben `ziel` und `kommt` jetzt `befehl` (Ausführung in `src/geruest/befehle.ts`).
- 2026-11-11 · Vertrag: Eintrag hat die freiwilligen Felder `beginn`/`ende`, neue Anfrage `holeTermine(von, bis)`; die Attrappe legt den Beispieltag auf jeden angefragten Tag. Ja des Nutzers.
- 2026-11-11 · Gezeitenkurve glättet mit d3-shape (`curveBasis`) nach zweifachem Mittel über ±30 Minuten (die weiche Form, Wunsch des Nutzers).
- 2026-11-11 · Gezeitenkurve: Die Mitte des Sichtfelds ist die gezeigte Uhrzeit; ab „Ganzer Tag“ zeigt sie 24 Stunden. Am PC liegt sie unten über die volle Breite, die Seitenleiste endet darüber (Wunsch des Nutzers). Einstellung „Lage“ (oben/unten) gilt je Gerät.
- 2026-11-11 · Lage der Gezeitenkurve am Handy ab Werk unten über der Leiste (offener Punkt 4, nach Empfehlung).
- 2026-11-11 · Sichtbare Stunden ab Werk 4, einstellbar 3 bis 8 (offener Punkt 5, nach Empfehlung).
- 2026-11-11 · Gezeitenkurve in Höhe (PC und Handy, höchstens Goldener Schnitt = 38,2 %) und Breite (PC) ziehbar wie die Seitenleiste, gemerkt je Geräteart im Browser (`tide.kurve-hoehe@…`, `tide.kurve-breite`), Doppelklick stellt zurück. Wunsch des Nutzers. Lage oben/unten für beide Geräte in einer Hülle `MitKurve`.
- 2026-11-11 · Seitenleiste am PC wächst bis zum Rand, sobald die Kurve links Platz für sie lässt (`src/logik/leisteLage.ts`); dafür liegt sie als eigene Lage über ihrer Spalte, die Spalte gibt weiter die ziehbare Breite vor. Wunsch des Nutzers.
- 2026-11-12 · Ausschlag der Gezeitenkurve von Ebbe bis Flut nur 38,2 % der Höhe (Goldener Schnitt) statt 54 %. Wunsch des Nutzers.
- 2026-11-12 · Vertrag: Änderung eines Eintrags darf Beginn und Ende enthalten (nur zusammen, Ende nach Beginn); neue Anfrage `holeWetter(von, bis)` je Stunde mit Grad und Regen in mm. Ja des Nutzers.
- 2026-11-12 · Gezeitenkurve: Termine ab 3 Stunden sind Bänder hinter der Kurve, kürzere Punkte; Punkte näher als eine Fingerbreite (44 px) werden gebündelt; Treibgut = offene Aufgaben ohne Uhrzeit als Zähler an der Jetzt-Linie.
- 2026-11-12 · Rückgängig für ganz Tide als Aktion „Rückgängig" (Alt+Z, nicht Strg+Z, damit Textfelder ihr eigenes Rückgängig behalten); Speicher in `src/geruest/rueckgaengig.ts`. Karte mit „15 Min. früher/später" als Weg ohne Ziehen (Tastatur).
- 2026-11-12 · Einstellung „Wetter" (Zeile über der Kurve, ab Werk an); die Zeile lässt Beschriftungen der Punkte frei.
- 2026-11-12 · Band der Gezeitenkurve als Streifen mit runden Ecken, senkrecht mittig und hinter der Linie (`kurve-band-lage`); Höhe als Einstellung „Höhe der Bänder“ (ab Werk 76 %, 20–100 %, je Gerät); farblos grau aus `--text-blass` und `--linie-stark`, weil ein Band nur belegte Zeit zeigt; an den Enden ziehbar (Beginn/Ende, mindestens 15 Minuten), in der Karte „15 Min. länger/kürzer". Wunsch des Nutzers.
- 2026-11-12 · Inhalt läuft über die ganze Höhe hinter Gezeitenkurve und unterer Leiste (Handy) durch; beide liegen als Lage darüber, der verdeckte Platz kommt als `--frei-oben/--frei-unten` (`inhalt-frei`). Wunsch des Nutzers.
- 2026-11-12 · Gezeigte Uhrzeit in der Mitte der Kurve ohne eigenen Hintergrund; die Wetterzeile lässt ihr den Platz frei (vorher deckte ein Hintergrund die Wetterzahl ab).
- 2026-11-12 · Ebenen der Gezeitenkurve allein durch die Reihenfolge im Code: Wasser, Bänder, Linie mit Jetzt-Linie und Stundenzahlen, dann Punkte, Beschriftungen, Treibgut, Wetter. Keine Ebenen-Rangfolge (z-index). Wunsch des Nutzers.
- 2026-11-12 · Obere Zeile der Kurve als echte Zeile: Beschriftungen stehen dort über ihrem Punkt und enden vor Treibgut-Zähler und gezeigter Uhrzeit (links der Mitte); Wetter weicht aus; eine Meldung oder ein Fehler hat die Zeile allein, ohne eigenen Hintergrund.
- 2026-11-12 · „Zu jetzt" gleitet nur, wenn der Browser `scrollend` kennt und keine reduzierte Bewegung gewünscht ist, sonst springt es; das nachgeschobene künstliche Ende-Ereignis ist entfernt.
- 2026-11-12 · „Termin fällt in Schicht" liegt als Bezug in `src/logik/bezuege/terminInSchicht.ts` (Regel aus .claude/rules/bereiche.md).

## Offen

Sieben Punkte sind offen. Bei jedem steht meine Empfehlung. Ohne Antwort gilt die Empfehlung.

| Nr. | Frage | Empfehlung | Wann nötig |
| --- | --- | --- | --- |
| 3 | Bahn von Sonne und Mond ab Werk | Bogen, „Echt“ als Schalter | In Etappe 2 am Bildschirm |
| 6 | Belegung am Handy ab Werk | Oben: Kurve, Suche, Einstellungen. Unten: Heute, Postfach, Plus, Kalender, To-dos | In Etappe 1 |
| 7 | Notizen für die Arbeit | Derselbe Baustein im Raum Arbeit | Vor Etappe 4 |
| 8 | Bons vom Foto | Später als Versuch hinter einem Schalter | Nach dem Prototyp |
| 9 | Diktat-Knopf im Prototyp | Ja, mit Hinweis, wohin der Ton geht | Vor Etappe 8 |
| 10 | Rechtschreibprüfung | Eigener Server auf dem Homeserver | Server-Etappe S6 |
| 11 | Helle Designs | Nach dem Prototyp | Später |
