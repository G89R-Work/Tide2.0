# Was dieses Dokument ist

Stand 2026-11-11 · Teil des Gesamtkonzepts. „Deine Version" meint den alten Prototyp 3, „meine Beispielseite" die Beispielseite vom 10.11.

Dieses Dokument ist der aktuelle Stand von Tide in einem Stück. Es ersetzt die Produktteile der beiden früheren Konzepte und enthält alles aus deinen zwei Texten und aus deiner Datei „Tide Prototyp 3“.

## Meine Korrektur an deiner Idee

Du wolltest ein Konzept, das nur das Neue enthält. Davon rate ich ab. Claude Code müsste dann drei Dokumente lesen und bei jedem Widerspruch raten, welches gilt. Das kostet Tokens und erzeugt Fehler.

Besser ist ein einziger gültiger Stand. Er wird für Claude Code in kleine Dateien je Bereich zerlegt. Eine Sitzung am Postfach liest dann nur die Postfach-Datei.

| Früheres Dokument | Was daraus wird |
| --- | --- |
| Konzept für den Neustart | Architektur, Mail-Abgleich und Sicherheit gelten weiter und werden erst nach dem Prototyp gebraucht |
| Produktkonzept | Durch dieses Dokument ersetzt |
| Beispielseite | Grundgerüst der Seiten, wie von dir entschieden |
| Dein Prototyp 3 | Vorlage für Funktionen, Farben, Schrift, Kacheln und Gezeitenkurve; sein Code wird nicht übernommen |

## Die Entscheidungen, auf denen alles aufbaut

Das hast du festgelegt:

- Meine Seiten sind das Grundgerüst, deine Funktionen kommen hinein.
- Aus deiner Version kommen das Postfach mit Regeln und Ordnern, das Kachel-Design, deine Farben und deine Schrift.
- Tempo geht vor Effekt. Animationen sind ab Werk aus, bis auf die Rückmeldung beim Drücken, und je Nutzer einstellbar.
- Die Gezeitenkurve ist überall eingeblendet und je Seite abschaltbar.
- Erst einmal ohne KI.
- Für alles, was es fertig gibt, wird ein Baustein genommen.
- Zuerst entsteht ein Prototyp, bei dem jeder Knopf sein Menü öffnet.

## Was du in deiner Version 3 schon gelöst hast

Beim letzten Mal kannte ich nur deine ältere Datei. In Version 3 sind mehrere meiner Vorschläge bereits umgesetzt, und zwar gut:

- Die Kurve folgt deinem Tag. Termine heben sie zur Flut, freie Zeit senkt sie zur Ebbe. Mein Einwand zur festen Welle ist damit erledigt.
- Sonnenauf- und Sonnenuntergang sowie der Mond sind für den Standort berechnet.
- Lange Einträge wie Schichten liegen als Band hinter der Kurve.
- Der Ebbe-Modus hält Meldungen in der Ruhezeit zurück.
- Die Arbeit prüft Ruhezeiten und Pausen nach dem Arbeitszeitgesetz.

Diese Teile werden nicht neu erfunden, sondern sauber nachgebaut.
