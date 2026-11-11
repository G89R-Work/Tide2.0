# Design

Stand 2026-11-11 · Teil des Gesamtkonzepts. „Deine Version" meint den alten Prototyp 3, „meine Beispielseite" die Beispielseite vom 10.11.

Tide sieht aus wie deine Version: deine Glut-Farben, deine Schrift Inter, dein Hintergrund mit Sonne, Mond und Wellen. Neu ist nur, dass alles aus einer Werte-Datei kommt und deshalb überall gleich aussieht.

## Farben und Schrift

Die Werte stammen unverändert aus deiner Datei.

| Rolle | Wert |
| --- | --- |
| Grund | #1a120e |
| Himmel, oben und unten | #1c1410 und #4a2f22 |
| Sonne und Mond, Schein | #f6e6cf, #f2b878 |
| Wellen, fünf Lagen | #5a3d2e, #45302a, #342521, #251a17, #18110f |
| Text, gedämpft, blass | #f2ebe3, #bcad9e, #7d6e61 |
| Akzent, zweiter Akzent | #e0a15c, #b8673a |
| Zusatzfarben für Kalender und Räume | #8fbcb6, #bba3dc, #dcc08f |
| Warnung, Erfolg | #e58a76, #9cc192 |
| Schrift | Inter in vier Stärken, für Überschriften und Text |

- **Glut** ist der Standard.
- **Tinte** bleibt als zweites Design, weil es dir gefällt.
- **Helle Designs** sind kein Teil des Prototyps. Weil ein Design nur eine Werte-Datei ist, lassen sie sich später ohne Umbau ergänzen.
- Meine Serifenschrift entfällt.

## Der Hintergrund

Sonne, Mond und Wellen liegen hinter der ganzen App und scheinen durch jede Fläche. Das ist der Grund für das Glas. Der Himmelsstreifen aus meiner Beispielseite entfällt.

Der Hintergrund hat zwei Bahnen, umschaltbar in den Einstellungen:

| Bahn | So sieht es aus | Wofür |
| --- | --- | --- |
| Bogen | Ein Halbkreis über die Seite: Aufgang links, mittags oben, Untergang rechts. Wie in deiner Version 3 | Ruhig, jeden Tag gleich, nutzt die ganze Höhe |
| Echt | Die Sonne folgt ihrer wirklichen Bahn für deinen Ort. Im November zieht sie flach und kurz über den unteren Teil des Himmels, im Juni hoch und weit. Der Mond folgt seiner eigenen Bahn und steht manchmal am Tag am Himmel | Die Jahreszeit wird sichtbar |

Bei „Echt“ bestimmt die Himmelsrichtung die Position von links nach rechts und die Höhe über dem Horizont die Position von unten nach oben. Die Wellen sind der Horizont. Was untergeht, verschwindet hinter ihnen.

In beiden Bahnen gilt, was du schon gebaut hast: echte Auf- und Untergangszeiten, echte Mondphase mit geneigter Sichel, und der Schalter „Mond nur nachts“.

Wie „Echt“ wirkt, lässt sich nur am Bildschirm beurteilen. Der Prototyp zeigt beide Bahnen, dann entscheidest du den Standard.

## Glas und Lesbarkeit

- **Text steht immer auf einer Fläche.** Ausnahme ist die große Überschrift auf Heute, die frei über dem Himmel steht.
- **Die Sonne darf hinter Text ziehen.** Flächen sind so dicht getönt, dass Text auch dann lesbar bleibt. In deiner Version 3 hast du das mit „dichterem Glas“ schon begonnen.
- **Drei Arten von Flächen:** Leiste mit echtem Weichzeichner, Kachel mit Tönung, Schwebend für Dialoge und Menüs. Jede besteht aus fünf Werten in der Werte-Datei.
- **Kleine Beschriftungen in Großbuchstaben** bleiben, wie in deiner Version.

## Knöpfe

Es gibt einen Knopf-Baustein mit vier Spielarten: Standard, Hauptaktion mit Akzent-Verlauf, Leise ohne Rahmen, Nur Symbol. Dazu zwei Größen. Kein Bereich bekommt eigene Knöpfe. Der Prüfbefehl schlägt fehl, wenn irgendwo eine Farbe oder ein Abstand außerhalb der Werte-Datei steht.

## Bewegung

Ein Schalter mit drei Stufen, je Nutzer gespeichert:

| Stufe | Was sich bewegt |
| --- | --- |
| Aus | Nichts |
| Rückmeldung, der Standard | Ein Knopf zeigt kurz, dass er gedrückt wurde. Sonst nichts: keine gleitenden Leisten, keine hereinfahrenden Seiten |
| Sanft | Zusätzlich gleitet die Seitenleiste beim Ziehen aus, und Dialoge blenden weich ein |

Unabhängig davon gibt es zwei Schalter für den Hintergrund: „Folgt der Tageszeit“ ist ab Werk an, „Wellen bewegen sich“ ist ab Werk aus.
