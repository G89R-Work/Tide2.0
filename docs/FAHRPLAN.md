# Fahrplan

Eine Zeile je Scheibe. `/scheibe <name>` liest nur seine Zeile. Die Dateien hinter „liest" liegen in `docs/konzept/`.
Hintergrund zu den Etappen und zum Server: `docs/konzept/40-fahrplan.md`.

## Etappe 0: Fundament
- [x] `fundament` · liest: 01-prototyp.md, 02-tempo.md · Projekt mit React, TypeScript, Vite und Tailwind; Git; `npm run dev`; `npm run pruefen` mit Typen, Stil und Tests, das nur Fehler ausgibt · Fertig, wenn: die leere App am PC und am Handy startet und der Prüfbefehl nichts meldet
- [x] `werte-und-bausteine` · liest: 05-design.md · Werte-Datei mit den Glut-Farben und Inter; Design Tinte als zweite Werte-Datei; Bausteine Knopf und Fläche; Bausteine-Seite; Prüfung, dass keine Farbe und kein Abstand außerhalb der Werte-Datei steht · Fertig, wenn: die Bausteine-Seite alle Spielarten in Glut und Tinte zeigt
- [x] `attrappe-und-tempo` · liest: 01-prototyp.md, 02-tempo.md · Vertrag mit den Grundfeldern eines Eintrags; Attrappe mit Mock Service Worker, die sich Änderungen merkt; `npm run sicht`; Tempo-Grenzen im Prüfbefehl · Fertig, wenn: eine Beispielliste aus der Attrappe kommt, eine Änderung das Neuladen übersteht und eine verletzte Grenze den Prüfbefehl scheitern lässt

## Etappe 1: Gerüst
- [x] `geruest-seitenleiste` · liest: 03-geruest.md · Seitenleiste mit Symbolen oder Namen, ziehbare Breite mit Einrasten, Logo führt zu Heute, alle Bereiche als leere Seiten, jeder Bereich lädt erst beim Öffnen · Fertig, wenn: alle Seiten am PC erreichbar sind und der Wechsel unter 0,1 Sekunden bleibt
- [x] `geruest-zweite-ebene` · liest: 03-geruest.md · zweite Ebene je Bereich; am Handy das zweispaltige Menü mit Punkt am Menü-Knopf · Fertig, wenn: jeder Bereich am Handy und am PC seine zweite Ebene zeigt
- [x] `aktionen-und-knoepfe` · liest: 03-geruest.md · Liste der Aktionen; belegbare Knöpfe in der Kopfzeile, oben rechts am Handy und in der unteren Leiste; Tastenkürzel · Fertig, wenn: ein Knopf-Platz sich umbelegen lässt und die Belegung das Neuladen übersteht
- [x] `einstellungen-liste` · liest: 20-einstellungen.md · zentrale Liste der Einstellungen, gespeichert je Nutzer und Geräteart; die Einstellungsseite entsteht daraus, mit Suche und Zurücksetzen · Fertig, wenn: eine neue Option mit einer Zeile auf der Seite erscheint
- [x] `hintergrund` · liest: 05-design.md · Hintergrund mit Sonne, Mond und Wellen hinter der ganzen App; Bahnen Bogen und Echt; echte Auf- und Untergangszeiten, Mondphase; rückt einmal pro Minute weiter · Fertig, wenn: beide Bahnen umschaltbar sind und im Ruhezustand keine Animation läuft
- [x] `kacheln` · liest: 04-kacheln.md · Versuch mit react-grid-layout und gridstack.js auf dem Handy des Nutzers; danach Bearbeiten-Modus mit langem Druck, Griffpunkten, Rechtsklick-Menü, Speichern je Seite und Geräteart, Zurücksetzen · Fertig, wenn: fünf Kacheln sich am Handy und am PC verschieben und in der Größe ändern lassen

## Etappe 2: Gezeitenkurve und Heute
- [x] `kurve-grund` · liest: 06-gezeitenkurve.md · Kurve aus dem Tag im 5-Minuten-Raster, endloses Scrollen, folgt der Uhrzeit, „Zu jetzt", Stundenleiste, sichtbare Stunden 3 bis 8, „Ganzer Tag"; die gezeigte Uhrzeit steuert den Hintergrund · Fertig, wenn: die Kurve den Beispieltag zeigt und im Ruhezustand nichts rechnet
- [x] `kurve-eintraege` · liest: 06-gezeitenkurve.md · Punkte mit Karte, Bänder hinter der Kurve, Bündeln, Überschneidung markieren, Treibgut, Termine im 15-Minuten-Raster ziehen mit Rückgängig, Wetterzeile · Fertig, wenn: ein gezogener Termin sich zurücknehmen lässt
- [ ] `kurve-ebbe-und-meldungen` · liest: 06-gezeitenkurve.md, 03-geruest.md · Ebbe-Modus und Ebbe-Fenster, neue Meldung fließt ein, Meldungen falten sich in die Glocke, sichtbar je Seite, Lage und Größe am Handy · Fertig, wenn: die Kurve je Seite abschaltbar ist und dabei keine Meldung erscheint
- [ ] `heute` · liest: 10-heute.md · Heute am PC und am Handy: Begrüßung, Als Nächstes, Uhr, Wochenleiste mit Monat, Notiz und Wochenrückblick, Braucht dich als schmale Kachel mit Auffächern · Fertig, wenn: der Nutzer die Seite am Handy und am PC als einladend abnimmt
- [ ] `heute-uhr-und-wetter` · liest: 10-heute.md · Karte hinter der Uhr mit Weltzeit und Fakt zur Stunde; Wetter als Zeile, aufgeklappt mit allen Werten aus dem Konzept · Fertig, wenn: jeder Fakt aus einem berechneten Wert stammt und einen Test hat

## Etappe 3: Postfach
- [ ] `postfach-ordner` · liest: 11-postfach.md · Systemordner, eigene Ordner mit Unterordnern, Farben, Anheften und Ziehen, intelligente Ordner, Zähler für Ungelesenes · Fertig, wenn: ein Ordner sich verschachteln lässt und der Zähler stimmt
- [ ] `postfach-liste` · liest: 11-postfach.md · Liste mit Suche, Filter, Mehrfachauswahl, Angeheftetem, Etiketten und Hinweis je Mail; Mails in Ordner ziehen · Fertig, wenn: 500 Beispielmails flüssig scrollen
- [ ] `postfach-leser` · liest: 11-postfach.md · Leser mit allen Aktionen, jede mit Rückgängig; ziehbare Trennlinien · Fertig, wenn: jede Aktion sich zurücknehmen lässt
- [ ] `postfach-schreiben` · liest: 11-postfach.md · Antworten unter der Mail, neue Mail, Signatur je Konto, sofort oder geplant senden, fünf Sekunden rückholbar · Fertig, wenn: ein Entwurf das Neuladen übersteht
- [ ] `postfach-regeln` · liest: 11-postfach.md · Regel-Editor mit react-querybuilder im Tide-Aussehen, Auswertung mit json-logic-js, Probelauf, „Jetzt ausführen" mit Rückgängig, Regel aus dem Rechtsklick · Fertig, wenn: eine Regel sich anlegen, proben, ausführen und zurücknehmen lässt
- [ ] `postfach-erkannt-und-handy` · liest: 11-postfach.md · Erkannt-Kasten für Rechnung, Termin, Sendung und Frist; Kategorien, Signaturen, Abwesenheit, Blockiert; Handy-Ansicht mit Wisch-Aktionen · Fertig, wenn: das Postfach am Handy ohne die frühere Wisch-Leiste bedienbar ist

## Etappe 4: Kalender und Arbeit
- [ ] `kalender-monat` · liest: 12-kalender.md · Monat mit sechs Wochen, Tages-Kachel rechts, Kalenderwoche, Feiertage aus date-holidays, Termin per Rechtsklick oder langem Druck · Fertig, wenn: die Kalenderwoche an jeder Zeile und in der Kopfzeile steht
- [ ] `kalender-woche` · liest: 12-kalender.md · Wochenansicht, Versuch mit Schedule-X, Wechsel per Knopf und Wischen, Blättern nach oben und unten · Fertig, wenn: Monat und Woche sich per Wischen wechseln lassen
- [ ] `kalender-handy` · liest: 12-kalender.md · Handy: Monat mit Punkten über der Terminliste, Sprung zum Tag; Termin anlegen mit Warnung bei Schicht · Fertig, wenn: ein Termin in einer Schicht schon im Eingabefenster warnt
- [ ] `arbeit-rhythmus` · liest: 17-arbeit.md · Schichtarten, Wochenmuster, Abfolge, Startdatum, Ausnahmen, Vorschau über acht Wochen; reine Logik mit Tests · Fertig, wenn: jede Zeile der Rhythmus-Tabelle ihren Test besteht
- [ ] `arbeit-seite` · liest: 17-arbeit.md · Seite Arbeit: Wochenleiste, Schichtplan mit Baukasten, Arbeitszeit, Hinweise zum Plan · Fertig, wenn: ein geänderter Rhythmus sofort Kalender und Gezeitenkurve ändert
- [ ] `arbeit-urlaub-und-wissen` · liest: 17-arbeit.md · Urlaubsplaner als kleine Kachel mit Planer dahinter; Wissen als Notizen im Raum Arbeit · Fertig, wenn: der Planer für das nächste Jahr Vorschläge um jeden Feiertag zeigt

## Etappe 5: To-dos und Notizen
- [ ] `todos-liste` · liest: 13-todos.md · zweite Ebene nach Herkunft, Liste nach Fälligkeit gruppiert, Ziehen ändert die Frist, Eingabezeile versteht „heute" und „morgen" · Fertig, wenn: ein To-do sich zwischen den Gruppen ziehen lässt
- [ ] `todos-funktionen` · liest: 13-todos.md · Suche mit markierten Treffern, Archiv mit Frist, Quelle und verknüpft erledigen, Irgendwann-Wecker, hartnäckige To-dos · Fertig, wenn: ein erledigtes To-do im Archiv liegt und seine Mail mit erledigt ist
- [ ] `notizen-kacheln` · liest: 18-notizen.md, 04-kacheln.md · Notizen als Kacheln mit Größe, Platz und Farbe; Ordner mit Unterordnern; Suche und „Neue Notiz" · Fertig, wenn: eine Notiz sich groß ziehen und in einen Ordner ziehen lässt
- [ ] `notizen-editor` · liest: 18-notizen.md · großes Fenster zum Lesen und Schreiben mit einem fertigen Markdown-Editor, sofortiges Speichern, Verknüpfen mit Termin, Mail oder Rezept · Fertig, wenn: der Rohtext als Markdown erhalten bleibt

## Etappe 6: Einkauf und Kochen
- [ ] `einkauf-liste` · liest: 14-einkauf.md · Liste nach Gängen mit Preisen und Summe, Ladenwahl, Ladenvergleich, geteilte Liste mit letzter Änderung · Fertig, wenn: der Ladenwechsel Preise und Reihenfolge ändert
- [ ] `einkauf-modus` · liest: 14-einkauf.md · Einkaufsmodus am Handy mit großen Zeilen, „Im Wagen", laufender Summe, Bildschirm bleibt an, Bilanz; lernende Reihenfolge je Laden mit Tests · Fertig, wenn: ein Einkauf nur mit dem Handy gelingt
- [ ] `kochen-rezepte` · liest: 15-kochen.md, 04-kacheln.md · Gerichte und Getränke als Kacheln, Rezept mit Portionen-Rechner und Kosten je Portion, neues Gericht anlegen · Fertig, wenn: ein Rezept sich anlegen und umrechnen lässt
- [ ] `kochen-zur-einkaufsliste` · liest: 15-kochen.md · „Zur Einkaufsliste" mit angehakter Zutatenliste, „Alles" und „Auswahl"; Wochenplan mit schnellen Gerichten an Spätschicht-Tagen · Fertig, wenn: ausgewählte Zutaten auf der Einkaufsliste stehen
- [ ] `kochen-modus` · liest: 15-kochen.md, 06-gezeitenkurve.md · Kochmodus mit einem Schritt je Bildschirm, Timer-Knöpfe aus Zeitangaben per Muster, Timer in der Gezeitenkurve · Fertig, wenn: ein laufender Timer auf jeder Seite in der Kurve sichtbar ist

## Etappe 7: Finanzen
- [ ] `finanzen-uebersicht` · liest: 16-finanzen.md · Kacheln Frei verfügbar, Offene Rechnungen mit „Bezahlt", Abos und Fixkosten · Fertig, wenn: „Bezahlt" die Zahl Frei verfügbar ändert
- [ ] `finanzen-verlauf` · liest: 16-finanzen.md · Kacheln Ausgaben nach Kategorie, Verträge und Fristen, Verlauf · Fertig, wenn: die Beispielzahlen über alle sechs Kacheln stimmig sind
- [ ] `finanzen-ebene-und-sperre` · liest: 16-finanzen.md · zweite Ebene mit Rechnungen, Abos und Verträgen; erneute Entsperrung nach einigen Minuten, im Prototyp als Attrappe · Fertig, wenn: der Bereich sich nach Ablauf der Zeit sperrt

## Etappe 8: Einstellungen und Übergreifendes
- [ ] `einstellungen-seite` · liest: 20-einstellungen.md · alle Abschnitte aus dem Konzept vollständig, zweite Ebene, Suche · Fertig, wenn: jede Option aus den Bereichen auffindbar ist
- [ ] `konten` · liest: 20-einstellungen.md · Konten an einem Ort: Liste mit Zustand, Reihenfolge per Ziehen, alle Einstellungen je Konto, „bewusst nicht verbunden", Hinzufügen als Attrappe · Fertig, wenn: die Reihenfolge der Konten in Postfach und Kalender folgt
- [ ] `suche` · liest: 21-uebergreifend.md · Suche über alles mit MiniSearch, Treffer nach Herkunft gruppiert und markiert, Aktionen in derselben Suche · Fertig, wenn: ein Wort aus einer Mail, einer Notiz und einem Rezept in einer Suche gefunden wird
- [ ] `gesten` · liest: 21-uebergreifend.md · alle Wischgesten aus der Tabelle, belegbare Wisch-Aktionen, Zurück-Reihenfolge · Fertig, wenn: keine zwei Gesten sich auf dem Handy des Nutzers in die Quere kommen
- [ ] `diktat-pruefen-abnahme` · liest: 21-uebergreifend.md, 01-prototyp.md · Diktat-Knopf mit Hinweis, wohin der Ton geht; Knopf „Prüfen" mit Attrappe; Abnahme des ganzen Prototyps · Fertig, wenn: der Nutzer den Prototyp abnimmt. Danach gilt der Design-Stopp
