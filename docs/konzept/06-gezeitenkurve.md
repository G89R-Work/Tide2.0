# Gezeitenkurve

Stand 2026-11-11 · Teil des Gesamtkonzepts. „Deine Version" meint den alten Prototyp 3, „meine Beispielseite" die Beispielseite vom 10.11.

Die Gezeitenkurve bleibt, wie sie in deiner Version 3 aussieht und funktioniert. Sie wird nachgebaut und um wenige Dinge ergänzt.

## Was aus deiner Version bleibt

| Verhalten | Beschreibung |
| --- | --- |
| Kurve aus dem Tag | Termine heben die Linie zur Flut, freie Zeit senkt sie zur Ebbe. Gerechnet im 5-Minuten-Raster und geglättet |
| Endlos scrollen | Nach 24 Uhr geht es nahtlos bei 0 Uhr weiter |
| Folgt der Uhrzeit | Bis du selbst scrollst. „Zu jetzt“ gleitet zurück |
| Steuert den Hintergrund | Die gezeigte Uhrzeit bestimmt Sonne, Mond und Licht |
| Punkte mit Uhrzeit und Titel | Ein Klick öffnet eine kleine Karte mit Bearbeiten |
| Bänder | Lange Einträge wie Schichten liegen als Band hinter der Kurve, die Beschriftung weicht aus |
| Ebbe-Modus | In der Ruhezeit von 22:30 bis 7:00 warten Meldungen bis zur Flut am Morgen |
| Ebbe-Fenster | Freie Zeit ab 45 Minuten wird als Ebbe benannt: „Gerade Flut, Ebbe ab 23:30“ |
| Treibgut | Offene To-dos ohne Uhrzeit treiben an der Jetzt-Linie mit, statt sich regelmäßig zu melden |
| Termine ziehen | Im 15-Minuten-Raster, mit Rückgängig |
| Wetter | Temperatur und Regen als feine Zeile über der Kurve |

## Was dazukommt

- **Sichtbar je Seite.** Ab Werk ist die Kurve auf jeder Seite eingeblendet. In den Einstellungen steht eine Liste aller Seiten mit je einem Schalter. Der Knopf zum Ausblenden gilt für die aktuelle Seite.
- **Sichtbare Stunden.** Einstellbar von 3 bis 8. Deine Version zeigt am PC etwa 6, du wolltest 3 bis 4. Dazu der Schalter „Ganzer Tag“.
- **Uhrzeiten.** Eine feine Stundenleiste am unteren Rand, wie bei dir. Zwischen den Stunden steht nichts.
- **Bündeln.** Liegen Punkte zu dicht, werden sie zu einer Zahl. Ein Klick fächert sie auf.
- **Überschneidung.** Ein Termin, der in eine Schicht fällt, ist am Punkt markiert.
- **Einfließen.** Eine neue Meldung erscheint als Punkt an der Jetzt-Linie und kurz in der Kopfzeile der Kurve.

## Was sich unter der Haube ändert

- Die Kurve ist eine einzige gezeichnete Linie und scrollt mit dem Scrollen des Browsers. Im Ruhezustand rechnet sie nichts.
- Die Beschriftungen weichen einander per Rechnung beim Aufbau aus, nicht in jedem Bild.
- Das endlose Scrollen bleibt deine Lösung: Der Tag liegt dreimal nebeneinander.

## Handy

Die Kurve liegt klein über der unteren Leiste und zeigt mehr Stunden als am PC. Ein Antippen macht sie groß. In deiner Version liegt sie oben. Die Lage ist eine Einstellung.
