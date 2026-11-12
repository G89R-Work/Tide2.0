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
- **Breite (Stand 2026-11-12, Entscheidung des Nutzers).** Leiste, zweite Ebene, Inhalt und Gezeitenkurve liegen im selben Zellraster wie die Kacheln (docs/konzept/04-kacheln.md) und stehen fest. Die Leiste ist schmal (nur Symbole, eine Zelle) oder breit (mit Namen); das ist eine Einstellung. Eine zweite Einstellung sagt, wer am Rand der Kurve bis zum Bildschirmrand reicht: die Kurve über die ganze Breite oder die Leiste über die ganze Höhe.
- **Logo.** Ein Klick auf das Tide-Logo oder den Namen führt immer zu Heute.
- **Suche.** Das Suchfeld sitzt oben in der Seitenleiste und durchsucht alle Bereiche.
- **Reihenfolge.** Bereiche werden gezogen, nicht mit Pfeilen verschoben. Der Knopf „Anordnen“ entfällt aus der Leiste und liegt in den Einstellungen. Ein langer Druck oder Rechtsklick auf einen Eintrag startet das Verschieben ebenfalls.
- **Gezeitenkurve.** Sie belegt ab Werk unten zwei Reihen über die volle Breite (einstellbar 1 bis 3). Die Seitenleiste endet darüber.
- **Kopfzeile.** Ganz oben eine schmale, feste Zeile mit Uhrzeit und Wetter, immer sichtbar. Die Kopfzeile der Seite hat den Titel links und rechts bis zu drei frei belegbare Knöpfe.

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
