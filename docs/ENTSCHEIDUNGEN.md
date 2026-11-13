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
- 2026-11-12 · Meldungen kommen im Prototyp aus Erinnerungen 15 Minuten vor Terminen (über `holeTermine`); weitere Quellen (Mail, Fristen) melden sich später über `melde`. Kein neuer Vertrag.
- 2026-11-12 · Ebbe-Modus hält Meldungen aus 22:30–7:00 bis 7:00 zurück; Wichtiges (z. B. Fehler) kommt sofort. Ruhezeit fest, nicht einstellbar.
- 2026-11-12 · Kurve sichtbar je Seite und je Gerät; der Knopf „Gezeitenkurve ein/aus“ (Alt+K) schaltet die offene Seite still, Alt+Z nimmt es zurück.
- 2026-11-12 · Glocke sitzt rechts in der Kurve, „Zu jetzt“ links daneben; ist die Kurve aus, stehen Glocke und Hinweise unten rechts. Das Ebbe-Fenster steht oben in der Liste der Glocke.
- 2026-11-12 · Am Handy zeigt die Kurve ab Werk 6 Stunden (PC 4); Antippen einer freien Stelle macht sie groß (38,2 %) und wieder klein.
- 2026-11-12 · Vertrag: Einträge haben ein freiwilliges Feld `frist` („JJJJ-MM-TT“) und die Art `schicht` (Ja des Nutzers). „Braucht dich“ zählt offene Einträge mit Frist bis morgen; der Punkt am Menü-Knopf ebenso.
- 2026-11-12 · Heute: Gruß, Überschrift, Uhr und „Braucht dich“ stehen fest über den Kacheln (nicht verschiebbar), damit „Braucht dich“ aufklappen und verschwinden kann; am Handy also auch vor der Wochenleiste.
- 2026-11-12 · Heute: „Monat“ führt zu Kalender/Monat, „Notiz“ zu Notizen, der Wochenrückblick klappt in der Wochen-Kachel auf. Die Beispielliste ist weg; die Bausteine-Seite bleibt über `#bausteine` erreichbar.
- 2026-11-12 · Einstellungen kennen die Art „Text“ (erster Fall: „Dein Name“, ab Werk Moritz).
- 2026-11-12 · Kacheln: Bearbeiten nur über Einstellungen › Kacheln (Schalter je Gerät, Alt+B schaltet ihn); außerhalb kein langer Druck und kein Rechtsklick-Menü (langer Druck bleibt den Notizen). Im Modus bleibt der Inhalt bedienbar; PC zieht am Kopf oder Griff, Handy nach langem Druck.
- 2026-11-12 · Kacheln: Hintergrund je Kachel abschaltbar (Vertrag `ohneHintergrund` in der Anordnung); Werk kann eine Kachel je Gerät ausblenden (`werk: null`).
- 2026-11-12 · Heute: alles ist eine Kachel, kein fester Kopf, kein „Anpassen“-Knopf. Die drei PC-Knöpfe sind eine eigene Kachel unter Uhr und Wetter. Eine leere Kachel („Braucht dich“ ohne Punkte) bleibt unsichtbar an ihrem Platz, damit nichts nachrückt.
- 2026-11-12 · Heute: Wochenleiste nach Beispielbild; Wischen innerhalb des Monats, andere Monate über den Monatskalender. Wetter vorerst als Zeile aus den Stundenwerten (Regen statt Bewölkung, die liefert der Vertrag noch nicht).
- 2026-11-12 · Rand des Inhalts überall 8 px wie der Rand der Seitenleiste; gesetzt einmal im Gerüst (`seiten-rand`), Seiten haben keinen eigenen Rand. Am Handy hebt langer Druck im Bearbeiten-Modus auch Kacheln an, die nur aus einem Knopf bestehen.
- 2026-11-12 · Kacheln: freie Plätze ohne Nachrücken; im Weg liegende Kacheln weichen nach unten aus. Einstellung „Raster“ je Gerät: Einfach (12/2 Spalten) oder Doppelt (24/4); Anordnungen merken ihr Raster (Vertrag `fein`) und werden umgerechnet. Zeilenhöhe bleibt fest.
- 2026-11-12 · Abstände: zwei Werte für alles, Rand 8 px (zum Bildschirmrand) und Abstand 12 px (zwischen allem anderen), in `src/werte/abstaende.ts` und als `p-rand`/`gap-abstand` in werte.css.
- 2026-11-12 · Uhr und Wetter liegen im Gerüst; auf jeder Seite außer Heute klein links neben den belegbaren Knöpfen, ein Klick zeigt die volle Ansicht. Die Uhr zeigt außerhalb einer Schicht den Anteil des Tages, in einer Schicht den der Schicht; nur dann schaltet ein Klick um.
- 2026-11-12 · Regeln A (kein Umweg), B (kein Eigenbau ohne Suche) und C (alles nur einmal) stehen in CLAUDE.md über allen anderen.
- 2026-11-12 · Aufräumen nach `docs/PRUEFUNG.md` als eigene Scheiben vor `heute-uhr-und-wetter`, nicht alles auf einmal. Ja des Nutzers zu date-fns, Zod, TanStack Query, Zustand, shadcn DropdownMenu/Popover und jscpd.
- 2026-11-12 · Tastenkürzel bleiben ohne Bibliothek (Entscheidung vom 2026-11-11 gilt); PRUEFUNG E6 wird nur in `aufraeumen-waechter` neu angesehen.

- 2026-11-12 · Ein Rückgängig-Speicher (`geruest/rueckgaengig.ts`): Einstellungen, Kacheln und Knöpfe-Belegung melden sich erst nach erfolgreichem Speichern mit `merke`; Korrektur des Nutzers: die Knöpfe einer Seite (Einstellungen, Bearbeiten-Leiste) wirken nur auf Schritte dieser Seite (`bereich`); Alt+Z und die Kopfzeile der Kurve auf den letzten Schritt von ganz Tide.
- 2026-11-12 · Wiederherstellen neben jedem Rückgängig (gemeinsamer Baustein `RueckgaengigKnoepfe`), Aktion „Wiederherstellen“ mit Alt+Y. Strg+U geht nicht: Browser öffnen damit den Quelltext. Ein neuer Schritt verwirft das Wiederherstellen nur im eigenen Bereich.
- 2026-11-12 · Ein- und Ausschalten des Bearbeiten-Modus (Alt+B, „Fertig“) ist kein Rückgängig-Schritt, damit Alt+Z nach „Fertig“ die letzte Kachel-Änderung zurücknimmt. Einstellungen nehmen beim Zurücknehmen nur ihre eigenen Einträge zurück.
- 2026-11-12 · Dauern, die das Programm braucht, stehen in `src/werte/bewegung.ts` (zuerst `MELDUNG_MS`, 6 s).

- 2026-11-12 · Bearbeiten-Modus sieht aus wie danach (Wunsch des Nutzers): keine Leiste über den Kacheln; das Bedienfeld („Bearbeiten aktiv“, ausgeblendete Kacheln, Rückgängig/Wiederherstellen, Zurücksetzen, Fertig) liegt am PC unten in der Seitenleiste, am Handy schwebend über der unteren Leiste. Rahmen und Griffpunkte liegen innerhalb der Kacheln.
- 2026-11-12 · Kachel-Raster (Wunsch des Nutzers, ersetzt „8/12 Zeilen je Bildschirm“): Am PC und Tablet ist eine Zeile überall gleich hoch, Ziel 48 px; die Zahl der Zeilen je Bildschirm wird gerundet (`zeilenZahl`), so weicht die Höhe nur 1–3 px ab und die letzte Zeile endet genau 12 px vor der Kurve. Am Handy bleiben 12 Zeilen je Bildschirm. Jede Kachel hängt oben oder unten (Vertrag: `unten: true`, `y` zählt dann vom unteren Rand; Ja des Nutzers); auf größeren Bildschirmen wächst nur der Himmel dazwischen. Andocken nach Lage der Kachelmitte.
- 2026-11-12 · Seitenleiste: Bereichsliste scrollt bei wenig Höhe; Bedienfeld und Zahnrad bleiben unten immer sichtbar.

- 2026-11-12 · Bearbeiten starten (Wunsch des Nutzers, ergänzt „nur über die Einstellungen“): Knopf neben dem Zahnrad in der Seitenleiste mit Rückfrage „Bearbeiten starten“, damit nichts aus Versehen verrutscht. Alt+B und die Einstellung bleiben.
- 2026-11-12 · Gezeitenkurve: Höhe und Breite lassen sich nur noch im Bearbeiten-Modus ziehen, dort mit sichtbaren Griffen (`Trenner griff`); außerhalb ist sie fest.
- 2026-11-12 · Rückfrage als Popover des Browsers (wie das Kachel-Menü), nicht Radix Popover: die Installation wurde in dieser Sitzung nicht freigegeben; der Wechsel aller Menüs bleibt bei `aufraeumen-menues`.

- 2026-11-12 · Ein Raster für alles (Nutzer): Raster aus 12-px-Linien, jede Kachel mit 6 px unsichtbarem Rand (sichtbarer Abstand immer 12 px); kleinste Kachel 24 × 24, Standard 48 × 48, Größen in 12er-Schritten, keine Mindestgrößen (passt der Text nicht, entscheidet der Nutzer). 48er-Zellen mit halben Schritten (kleinste 18) und 24er-Zellen (Standard 60) wurden verworfen. Kacheln docken oben/unten und links/rechts an.
- 2026-11-12 · Gezeitenkurve und Seitenleiste (mit zweiter Ebene) werden am PC und Tablet Kacheln je Seite. Seitenleiste mit zwei einstellbaren Breiten (nur Symbole / mit Namen), Ziehen rastet auf eine davon ein. Handy-Ansicht bleibt wie sie ist.
- 2026-11-12 · Reihenfolge: `raster-12`, `raster-kurve`, `raster-seitenleiste` vor den übrigen Aufräum-Scheiben, je eine frische Sitzung.
- 2026-11-12 · Ziehen wie bei One UI (Nutzer): Andere Kacheln weichen erst nach Verweilen aus, vorher schwebt die gezogene Kachel; an Grenzen eine dezente rote gestrichelte Linie; weniger empfindlich. Kacheln docken an Kurve und Seitenleiste und wandern mit, wenn diese ihre Größe ändern; dahinter wird nichts umsortiert. Neue Scheibe `raster-ziehen` vor `raster-kurve`.
- 2026-11-12 · raster-12 (nach Konzept entschieden): Linien gerundet, darum weichen Kacheln je Bildschirm um bis zu 1 px ab. Der Rand von 6 px liegt als Innenabstand in jeder Kachel, das Raster ragt dafür 6 px über den Inhalt. Anordnungen aus dem alten Spalten-Raster (`fein`) gelten als Werk. Auch am Handy gibt es keine Mindestgröße je Kachel mehr (kleinste 1 × 1). Feste Größen: Klein = Standard 48 × 48, Breit = ganze Breite.
- 2026-11-12 · Kacheln ziehen (raster-ziehen): kein Umweg, wenn der Baustein nur bei Bewegung neu ordnet. Kleines Zittern bis 16 px zählt als Verweilen (Wunsch des Nutzers: Absicht erkennen). Nach 650 ms weichen die anderen bei der nächsten Regung oder beim Loslassen aus. Weiterziehen über den Umkreis bringt sie zurück.
- 2026-11-12 · Loslassen über einer anderen Kachel vor dem Verweilen: Die anderen weichen nach unten aus (wie bei den Pfeiltasten), nichts springt zurück.
- 2026-11-12 · Grenze beim Ziehen in eigener Farbe `--grenze` (rot) in beiden Designs, auch in Tinte.
- 2026-11-12 · Kacheln 1:1 wie Samsung One UI: quadratische Zellen, nur ganze Zellen, Einstellung „Spalten“ je Gerät (16, Handy 4), Reihen aus der Höhe, Abstand ein Fünftel der Zelle; Loslassen auf Besetztem ohne Verweilen → nächste freie Lücke, sonst zurück; „Braucht dich“ eine Reihe hoch und zweizeilig. Seitenleiste (schmal/breit), Kurve (1–3 Reihen) und Kopfzeile (Uhr, Wetter) fest im Raster; Einstellung, ob unten Leiste oder Kurve Vorrang hat (Nutzer). Ersetzt die 12-px-Linien und die Scheiben `raster-kurve`, `raster-seitenleiste`.
- 2026-11-12 · Arbeit in Paketen aus drei Scheiben nacheinander, danach `/clear` (Nutzer).
- 2026-11-12 · Gerüst: Kurve ab Werk 2 Reihen, Leiste ab Werk breit (Namen), Vorrang ab Werk Kurve; „Lage oben/unten“ der Kurve bleibt auch am PC; Uhr und Wetter fest in einer schmalen Kopfzeile, nicht mehr im Seitenkopf (raster-geruest).
- 2026-11-12 · Aussehen nach Prototyp 3 (Nutzer, berichtigt): Vorlage ist `docs/vorlage-aussehen/prototyp3.html` (persönliche Namen und Adressen durch Platzhalter ersetzt). Sie darf als Bild angesehen und gezielt nach Werten durchsucht werden, Code wird nie übernommen (Regel 10 gilt weiter für `vorlage/`). Aus der Vorlage: Gezeitenkurve, Wochenleiste (verfeinert), kleiner Kalender (verfeinert, klappt am PC aus dem Monats-Knopf nach oben auf), die Sonne, „Braucht dich“ als Reiter statt To-dos, Postfach (Funktionen und Sortierung), Sortierung der mittleren Einstellungs-Spalte, Logo und schmale Breite der Seitenleiste. Aus Tide 2.0: Gruß, Datum, nächster Termin, Uhr und Wetter auf Heute, die drei belegbaren Knöpfe (auf Heute unter der Uhr), Seitenleiste (breit per Wischen nach rechts, schmal nach links), Wellen-Hintergrund und Bahnen, rechte Einstellungs-Spalte, alle Funktionen und Seiten.
- 2026-11-12 · Heute hat kein Kachel-Raster mehr, sondern einen festen Aufbau (Nutzer). Ersetzt für Heute „Alle Seiten bestehen aus Kacheln“ und `heute-kacheln`.
- 2026-11-12 · Kopfzeile (Nutzer): nicht auf Heute; auf den übrigen Seiten Uhr, Wetter und die drei belegbaren Knöpfe nebeneinander. Die Seitenleiste reicht von ganz oben bis unten, nur Inhalt und Kurve beginnen unter der Kopfzeile.
- 2026-11-12 · Reihenfolge: zuerst die sieben Scheiben `aussehen-*`, danach die Aufräum-Scheiben, weil sie sonst Code ordnen würden, der wegfällt (Empfehlung, ohne Widerspruch des Nutzers).
- 2026-11-12 · Bilder des Nutzers in `docs/vorlage-aussehen/bilder/` zeigen genau, was aus der Vorlage kommt: Gezeitenkurve, Sonne und Mond, Wochenleiste mit Notiz und Woche, Ordnerleiste des Postfachs, mittlere Einstellungs-Spalte. Die Kurve klappt per Hoch-/Runterwischen auf und ein, eingeklappt guckt ein Rand hervor.
- 2026-11-12 · Keine Erklär-Texte in der Oberfläche (Nutzer); neue Regel 11 in CLAUDE.md, Aufräumen in `aussehen-ohne-erklaerungen`.
- 2026-11-12 · Heute bekommt einen festen Aufbau ohne Kacheln (Nutzer am Anfang: „Rasterlogik ignorieren“); „Braucht dich“ als Reiter bleibt im Plan (nach Empfehlung, ohne neue Antwort).
- 2026-11-12 · Pixelgenau (Nutzer): Alles aus den Bildern sieht genau aus wie die Vorlage, Werte aus ihren Stilen; nur Glas bleibt wie Tide 2.0. Aufbau und Sortierung (Einstellungen, Ordner) erst gleich, ändern später. Die Gezeitenkurve übernimmt auch die Funktionen der Vorlage; was Tide 2.0 darüber hinaus kann, bleibt.
- 2026-11-12 · Raster fällt komplett weg (Nutzer, ersetzt das Zellraster des Gerüsts vom 12.11.): Gerüst am PC und Tablet in Pixeln wie die Vorlage. Seitenleiste 66 px schmal (156 px breit, mit Namen) und zweite Ebene laufen von ganz oben bis unten; rechts daneben Kopfzeile, Inhalt, Kurve (fest 150 px). Einstellungen „Höhe“ der Kurve in Reihen und „Am Rand der Kurve“ entfallen; Leiste ab Werk schmal. Das Kachel-Raster verschwindet mit `aussehen-heute`.
- 2026-11-12 · Kopfzeile am PC: Wetter, Uhr und die drei belegbaren Knöpfe in einer Zeile über Inhalt und Kurve (nicht mehr im Seitenkopf); auf Heute keine Kopfzeile. Einträge der Leiste bleiben 44 px (zwei Knopf-Größen), Logo wie Vorlage (Wellen mit Sonne auf Akzent-Verlauf, 50 px).
- 2026-11-12 · Wischen über @use-gesture/react (Ja des Nutzers, auch für weitere Gesten): Wischen nach rechts macht die Leiste breit, nach links schmal, mit Rückgängig.
- 2026-11-12 · Offen Nr. 3 nach Empfehlung: Bahn ab Werk „Bogen“, „Echt“ bleibt als Auswahl in den Einstellungen.
- 2026-11-12 · Himmel nach Vorlage: Sonne groß (8,5 rem) mit weitem Lichthof, Mond als Sichel (6 rem) mit schwachem Schein nach Phase, nur nachts. Helligkeit über `himmelsLicht`: Mittag immer am hellsten (Sonnenhöhe geteilt durch Mittagshöhe des Tages), am Horizont 30 %, Dämmerung bis 6° darunter; Wärme am größten bei 1° Sonnenhöhe, neue Farbe `--daemmerung` je Design.
- 2026-11-12 · Heute fest aufgebaut (aussehen-heute): Kachel-Raster ganz entfernt samt Bearbeiten-Modus, Vertrag und Attrappe `kacheln`, Aktionen „Kacheln bearbeiten/zurücksetzen“, Einstellungen › Kacheln und react-grid-layout (Folge der Nutzer-Entscheidung „Raster fällt komplett weg“). Am Handy bleibt oben die Leiste mit Menü und Knöpfen; die Knöpfe stehen dort statt unter der Uhr. Die Höhe der Kurve am Handy lässt sich jetzt immer am Rand ziehen (vorher nur im Bearbeiten-Modus). Die Einstellung „Uhr“ auf Heute wirkt wieder.
- 2026-11-12 · „Braucht dich“ als Reiter wie die Vorlage (`.remc`); Schließen blendet ihn bis zum Neuladen aus (mit Rückgängig); „Ansehen“ klappt die Liste über `bausteine/Aufklapp.tsx` (shadcn-Popover, Radix) nach oben am Reiter auf.
- 2026-11-12 · Feiertage über date-holidays (Nutzer; feiertagejs war die Empfehlung), nur gesetzliche (`public`), nachgeladen.
- 2026-11-12 · Kleiner Kalender wie die Vorlage: 6 Wochen, Punkte für Termine, Feiertage, Fuß mit Feiertagen des Monats und „Heute“; Jahr und Monat als Walze (Aufklapp), Bundesland-Kürzel ändert die bestehende Einstellung mit Rückgängig; Blättern im Kalender ändert die Wochenleiste erst beim Wählen eines Tags.
- 2026-11-12 · Wochenleiste am Handy wie die Vorlage in einer Reihe mit schmalen Knöpfen (kurzer Monatsname); Buchstabe der Schicht nur am PC und Tablet.
- 2026-11-12 · Vertrag Wetter: je Stunde zusätzlich `regenChance` (0–100 %), für „12° · 20 % Regen“ über der Kurve wie in der Vorlage (Ja des Nutzers).
- 2026-11-12 · Kurve wie Vorlage: Kopfzeile ab 120 px Höhe (PC, Handy groß) mit Flut/Ebbe-Text („Gerade Flut · Ebbe ab …“, „Gerade Ebbe · Nächste Flut …“), Knopf „Ebbe-Modus“ (schaltet die Einstellung, mit Rückgängig), „Ansicht hh:mm“, „Zu jetzt“ und Glocke; Schildchen mittig am Punkt (darunter, wenn er oben liegt), in der kleinen Handy-Kurve keine Schildchen.
- 2026-11-12 · Ein- und Ausklappen der Kurve per senkrechtem Wischen (oder 40 px ziehen), eingeklappt ein Rand von 18 px zum Hochwischen oder Antippen; neue Einstellung „Eingeklappt“ je Gerät; Handy-Groß per Antippen bleibt.
- 2026-11-13 · Reihenfolge (Nutzer): erst alle Aussehen-Scheiben aus der Vorlage (`aussehen-einstellungen`, `aussehen-ohne-erklaerungen`, neu `aussehen-postfach-ordner`), danach Aufräumen, dann Etappe 3 Postfach.
- 2026-11-13 · Einstellungen: Gruppen wie die Vorlage (Allgemein, Bereiche, Schreiben, Personen, Daten und Kosten); „Grundlegendes“ steht oben unter Allgemein, „Privat und Arbeit“ unter Daten und Kosten. Die Suche steht oben in der mittleren Spalte (Breite 300 px wie die Vorlage); die Seite zeigt die Treffer.
- 2026-11-13 · Ohne Erklärtexte: Einstellungen haben kein Feld `hilfe` mehr, Aktionen statt `kommt` (Text) nur `spaeter: true` (ausgegraut). Der Typ selbst verhindert neue Erklärtexte, eine eigene Prüfung in `pruefen` braucht es nicht. Auch „Gilt für den PC/das Handy“ entfällt.
- 2026-11-13 · Postfach-Ordner kommen ganz über den Vertrag (`holeOrdner` in `src/vertrag/postfach.ts`: id, name, art, eltern, zahl, wichtig); Systemordner wie das Vorlagen-Bild (Posteingang, Braucht dich, Entwürfe, Gesendet, Mit Erinnerung, Archiv, Papierkorb). Entschieden vom Nutzer.
- 2026-11-13 · Datum mit date-fns: Rechnung direkt mit date-fns (`startOfDay`, `addDays`, `differenceInCalendarDays`, `getISOWeek`, `startOfWeek`, `set`), eigene Zusammensetzungen (`uhrzeit`, `tagSchluessel`, `ausSchluessel`, `monatsTage`) nur in `logik/zeit.ts`; Anzeige-Formate in `geruest/format.ts`, das `uhrzeit` von dort weiterreicht. Glocke zeigt „bis 07:00“ (aus `RUHE_BIS`, zweistellig wie alle Uhrzeiten).
- 2026-11-13 · Einstellungen mit festen Namen: Liste `as const satisfies`, `einstellung('name')` liefert die genaue Art, `WertVon` den Werttyp (Auswahl nur ihre Werte). Der Test für den falschen Namen nutzt `@ts-expect-error` (schlägt fehl, wenn kein Typfehler kommt); das ist kein Umgehen, sondern der Prüfer.
- 2026-11-13 · Tempo (Nutzer: Messung prüfen und Seiten schneller): Messung ist in Ordnung (Vergleich 0,4 ms je Bild) und bleibt; Grenze bleibt 100 ms. Ursache ist Neuladen der Daten bei jedem Wechsel, daher `aufraeumen-daten` vor `aufraeumen-schema` gezogen. Gleich mit erledigt: Wochenleiste liest Termine nur einmal (`tagesBelegung`), `tagSchluessel` über `formatISO`.
- 2026-11-13 · Daten über TanStack Query: alle Hooks in `geruest/daten.ts` (Einträge, Termine, Wetter, Ordner, Einstellungen, Feiertage), gespeichert 1 Minute, ein zweiter Versuch. Ändern über `MutationObserver` (geht auch außerhalb von React, etwa beim Rückgängig), Fehler der letzten Änderung über `useMutationState`. Eine „Anordnung“ gibt es im Code nicht mehr, daher kein Hook dafür. Erinnerungen holen die Termine von heute und morgen und filtern die nächsten 24 Stunden selbst (statt jede Minute eine neue Anfrage).
- 2026-11-13 · Schemas mit Zod 4: Vertrag-Typen entstehen per `z.infer` aus den Schemas in `src/vertrag/` (Inhalt unverändert, nur strenger: Zeitpunkte ISO, `frist` als Datum, `zahl` ganz und nicht negativ, `regenChance` 0–100). Ein Weg zum Server `anfrage(schema, was, adresse, methode?, daten?)` in `vertrag/anfrage.ts`; Fehlermeldungen deutsch (`z.config(de())`) mit Feld (`→ at [1].titel`). Einstellungen: Schema je Einstellung aus der Liste, Ungültiges fällt weg (Standard gilt), kein Objekt ist ein Fehler. Attrappe prüft Anfragen (400 mit Grund) und Gemerktes (`attrappe/pruefen.ts`). Belegung: Schema mit Werkseinstellung je Platz. Startcode wuchs auf 189 KB (Grenze 200).
- 2026-11-13 · Speicher mit Zustand 5: Rückgängig, Meldungen, gezeigte Zeit, Einstellungs-Suche und „Braucht dich“ zu sind `create`-Speicher; Gemerktes über `persist` (Belegung `tide.knoepfe` mit Prüfung über `belegungAus` in `merge`, Glocke `tide.glocke` nur `gelesenBis`, Menü-Namen `tide.menue.namen`). Das Speicherformat ist jetzt `{state, version}`: alte gemerkte Belegung und Menü-Namen fallen einmal auf Werk zurück. Belegung bleibt im Browser (nach Empfehlung: die Einstellungsliste kennt keine Listen, der Umzug wäre nicht einfacher). Die Attrappe behält ihren Speicher, sie spielt den Server. `useSchmal` bleibt (hört auf den Browser, keine eigene Hörer-Liste).

## Offen

Sechs Punkte sind offen. Bei jedem steht meine Empfehlung. Ohne Antwort gilt die Empfehlung.

| Nr. | Frage | Empfehlung | Wann nötig |
| --- | --- | --- | --- |
| 6 | Belegung am Handy ab Werk | Oben: Kurve, Suche, Einstellungen. Unten: Heute, Postfach, Plus, Kalender, To-dos | In Etappe 1 |
| 7 | Notizen für die Arbeit | Derselbe Baustein im Raum Arbeit | Vor Etappe 4 |
| 8 | Bons vom Foto | Später als Versuch hinter einem Schalter | Nach dem Prototyp |
| 9 | Diktat-Knopf im Prototyp | Ja, mit Hinweis, wohin der Ton geht | Vor Etappe 8 |
| 10 | Rechtschreibprüfung | Eigener Server auf dem Homeserver | Server-Etappe S6 |
| 11 | Helle Designs | Nach dem Prototyp | Später |
| 12 | Was „Notiz“ und „Woche“ auf Heute öffnen | Notiz: schnelle Notiz in Notizen; Woche: Wochenrückblick als aufklappende Karte | Vor Etappe 5 |
