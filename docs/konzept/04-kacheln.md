# Kacheln

Stand 2026-11-11 · Teil des Gesamtkonzepts. „Deine Version" meint den alten Prototyp 3, „meine Beispielseite" die Beispielseite vom 10.11.

Jede Seite besteht aus Kacheln, die du wie Widgets in One UI verschiebst und in der Größe änderst. Das Verhalten wird einmal gebaut und gilt dann für alle Seiten.

## So funktioniert es

| Gerät | Bearbeiten starten | Verschieben | Größe ändern |
| --- | --- | --- | --- |
| Handy und Tablet | Lange auf eine Kachel drücken | Mit dem Finger ziehen | An den Griffpunkten ziehen, die am Rand erscheinen |
| PC mit Maus | Rechtsklick, dann „Kachel anpassen“ | An der Kopfzeile der Kachel ziehen | An der Ecke ziehen, oder im Rechtsklick-Menü eine feste Größe wählen |
| Tastatur | Kachel auswählen, Taste drücken | Pfeiltasten | Umschalt und Pfeiltasten |

Für die Maus schlage ich beides vor: das Ziehen an der Ecke für freie Größen und feste Größen im Rechtsklick-Menü für den schnellen Weg. Das Menü bietet Klein, Mittel, Groß, Breit, Hoch, Ausblenden und Zurücksetzen.

Im Bearbeiten-Modus zeigen alle Kacheln der Seite ihre Griffpunkte. „Fertig“ beendet ihn. Außerhalb des Modus verrutscht nichts.

## Regeln

- **Raster.** 12 Spalten am PC, 6 am Tablet im Hochformat, 2 am Handy. Kacheln rasten ein.
- **Gemerkt je Nutzer, Seite und Geräteart.** Dein Handy und dein PC haben getrennte Anordnungen.
- **Mindestgröße je Kachel.** Eine Kachel kann nicht so klein werden, dass ihr Inhalt bricht. Jede Kachel kennt zwei oder drei Darstellungen für klein, mittel und groß.
- **Notizen sind Kacheln.** Eine wichtige Idee ziehst du groß, der Rest bleibt klein.
- **Große Arbeitsflächen bleiben ganz.** Das Postfach mit Liste und Leser oder der Kalender mit Monat und Tag sind je eine Kachel-Gruppe mit ziehbaren Trennlinien, kein Puzzle aus Einzelteilen.
- **Eine Glasebene.** Kacheln sind getönte Flächen. In einer Kachel liegt nie wieder Glas.
- **Zurücksetzen.** Jede Seite hat einen Werkszustand.

## Der Baustein

| Kandidat | Stärke | Schwäche |
| --- | --- | --- |
| [react-grid-layout](https://socket.dev/npm/package/react-grid-layout/overview/2.0.0), Version 2 | Für React gebaut; Ziehen, Größe ändern, getrennte Anordnungen je Bildschirmbreite, Anordnung als Daten speicherbar | Die Seite sagt nichts Ausdrückliches zu Touch und langem Druck |
| [gridstack.js](https://cdn.jsdelivr.net/npm/gridstack@13.0.0/README.md) | Handy-Bedienung laut Beschreibung ohne Zusatz eingebaut, Anordnung als Daten ladbar, keine Abhängigkeiten | Greift selbst in die Seite ein, die React-Anbindung ist neu |

Meine Empfehlung ist react-grid-layout. Die Entscheidung fällt aber in der ersten Etappe an einem kleinen Versuch auf deinem Handy und Tablet: eine Seite mit fünf Kacheln, langer Druck, ziehen, Größe ändern. Der Baustein, der sich dort besser anfühlt, wird genommen.

Selbst gebaut wird nur der Bearbeiten-Modus drumherum: langer Druck, Griffpunkte, das Rechtsklick-Menü und das Speichern.
