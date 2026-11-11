# Gerüst und Navigation

Stand 2026-11-11 · Teil des Gesamtkonzepts. „Deine Version" meint den alten Prototyp 3, „meine Beispielseite" die Beispielseite vom 10.11.

Jeder Bereich hat zwei Ebenen: links die Bereiche, daneben das, was zum offenen Bereich gehört. Diese eine Regel gilt am PC, am Tablet und am Handy, für das Postfach genauso wie für die Einstellungen.

## Die zwei Ebenen

| Bereich | Zweite Ebene |
| --- | --- |
| Heute | keine |
| Postfach | Ordner, eigene Ordner, intelligente Ordner, Regeln und Postfach-Einstellungen |
| Kalender | Kalender zum Ein- und Ausblenden, Ansichten |
| To-dos | Herkunft und Listen, Archiv |
| Einkauf | Läden, Listen, Ausgaben |
| Kochen | Gerichte, Getränke, Wochenplan |
| Finanzen | Übersicht, Rechnungen, Abos, Verträge |
| Arbeit | Schichtplan, Arbeitszeit, Urlaub, Wissen |
| Notizen | Ordner |
| Einstellungen | Die Abschnitte der Einstellungen |

Die Wisch-Leiste mit Ordnern oben im Postfach am Handy entfällt. Du fandest sie unübersichtlich, und die zweite Ebene ersetzt sie.

## PC und Tablet

- **Seitenleiste.** Sie zeigt die Bereiche als Symbole oder als Symbole mit Namen. Rechts daneben klappt die zweite Ebene auf.
- **Breite ziehen.** Die Kante der Leiste lässt sich mit Maus oder Finger ziehen. Standard- und Mindestbreite ist der längste Bereichsname mit gleichem Abstand links und rechts; „Einstellungen“ zeigt immer nur das Zahnrad, mittig. Unter der Mindestbreite rastet sie auf die Symbol-Leiste ein, ein Doppelklick stellt die Standardbreite her, ein zweiter klappt ein. Dafür gibt es den Baustein [react-resizable-panels](https://cdn.jsdelivr.net/npm/react-resizable-panels@4.7.6/README.md), der Mindestbreite, Einklappen und gemerkte Breiten mitbringt.
- **Logo.** Ein Klick auf das Tide-Logo oder den Namen führt immer zu Heute.
- **Suche.** Das Suchfeld sitzt oben in der Seitenleiste und durchsucht alle Bereiche.
- **Reihenfolge.** Bereiche werden gezogen, nicht mit Pfeilen verschoben. Der Knopf „Anordnen“ entfällt aus der Leiste und liegt in den Einstellungen. Ein langer Druck oder Rechtsklick auf einen Eintrag startet das Verschieben ebenfalls.
- **Gezeitenkurve.** Sie nimmt unten die volle Breite ein. Die Seitenleiste endet darüber.
- **Kopfzeile der Seite.** Titel links, rechts bis zu drei frei belegbare Knöpfe. Die Zeile mit Uhrzeit und Tagesfortschritt gibt es nur noch auf Heute.

## Handy

- **Oben links das Menü.** Der Knopf trägt einen Punkt oder eine Zahl, sobald dich etwas braucht.
- **Das Menü ist zweispaltig.** Links eine schmale Spalte mit den Symbolen der Bereiche, rechts die zweite Ebene des gewählten Bereichs. Ein Schalter blendet die Namen der Bereiche ein. Das Menü ist dadurch schmaler als bisher und führt direkt zu einem Ordner.
- **Oben rechts drei Knöpfe.** Ab Werk: Gezeitenkurve ein- und ausblenden, Suche, Einstellungen. Jeder Platz ist frei belegbar.
- **Unten die Leiste.** Vier Plätze und das Plus in der Mitte, alle frei belegbar.
- **Gezeitenkurve.** Klein über der unteren Leiste, angetippt groß.

## Belegbare Knöpfe

Jede Funktion von Tide ist als Aktion mit Name und Symbol in einer Liste eingetragen: Bereich öffnen, Neue Mail, Neuer Termin, Einkaufsmodus, Kurve ein- und ausblenden, Suche, Diktat. Die Plätze oben rechts, die untere Leiste am Handy und die Kopfzeile am PC wählen aus derselben Liste.

Eine neue Funktion wird einmal eingetragen und ist dann überall belegbar, auch in der Suche und per Tastenkürzel.

## Meldungen

- Beim Ausblenden der Gezeitenkurve kommt keine Meldung.
- Hinweise erscheinen kurz in der Kopfzeile der Kurve und falten sich nach sechs Sekunden in die Glocke, wie in deiner Version 3. Sie verdecken nie eine Überschrift.
- Ist die Kurve ausgeblendet, erscheinen Hinweise am unteren Rand.
