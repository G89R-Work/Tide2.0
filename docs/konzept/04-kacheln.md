# Kacheln

Stand 2026-11-11 · Teil des Gesamtkonzepts. „Deine Version" meint den alten Prototyp 3, „meine Beispielseite" die Beispielseite vom 10.11.

Jede Seite besteht aus Kacheln, die du wie Widgets in One UI verschiebst und in der Größe änderst. Das Verhalten wird einmal gebaut und gilt dann für alle Seiten.

## So funktioniert es

| Gerät | Bearbeiten starten | Verschieben | Größe ändern |
| --- | --- | --- | --- |
| Handy und Tablet | Einstellungen › Kacheln › „Kacheln bearbeiten“ | Lange drücken, dann ziehen (kurzes Wischen scrollt) | An den Griffpunkten ziehen, die am Rand erscheinen |
| PC mit Maus | Einstellungen › Kacheln › „Kacheln bearbeiten“ | An der Kopfzeile oder am Griff oben ziehen | An der Ecke ziehen, oder im Menü eine feste Größe wählen |
| Tastatur | Alt+B oder der Schalter in den Einstellungen | Pfeiltasten | Umschalt und Pfeiltasten |

Stand 2026-11-12, entschieden vom Nutzer: Bearbeiten beginnt nur über die Einstellungen. Außerhalb des Modus gibt es auf Kacheln weder langen Druck noch Rechtsklick-Menü (langer Druck bleibt den Notizen vorbehalten). Im Modus funktionieren Klicks auf den Inhalt wie gewohnt. Der Modus gilt für alle Seiten des Geräts, bis „Fertig“ ihn beendet.

Das Menü der Kachel öffnet im Modus der Rechtsklick oder der Knopf „…“ oben rechts. Es bietet Hintergrund an/aus, Klein, Mittel, Groß, Breit, Hoch, Ausblenden und Zurücksetzen. Jede Kachel kann ohne Hintergrund stehen; Text auf Heute steht ab Werk so auf dem Himmel.

Im Bearbeiten-Modus zeigen alle Kacheln ihre Griffpunkte. „Fertig“ beendet ihn. Außerhalb des Modus verrutscht nichts.

## Regeln

- **Raster.** 12 Spalten am PC, 2 am Handy; in der Einstellung „Raster: Doppelt“ 24 und 4. Kacheln rasten ein und bleiben, wo man sie lässt: Lücken bleiben, nichts rückt nach oben; liegt eine Kachel im Weg, weicht sie nach unten aus (Stand 2026-11-12, Wunsch des Nutzers). Tablet im Hochformat: siehe docs/IDEEN.md.
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

Selbst gebaut wird nur der Bearbeiten-Modus drumherum: Griff, Griffpunkte, das Menü der Kachel und das Speichern. Das Halten vor dem Ziehen am Handy liefert der Baustein (`allowMobileScroll`).
