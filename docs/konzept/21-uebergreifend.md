# Übergreifend

Stand 2026-11-11 · Teil des Gesamtkonzepts. „Deine Version" meint den alten Prototyp 3, „meine Beispielseite" die Beispielseite vom 10.11.

Fünf Funktionen gelten für alle Bereiche. Für vier davon gibt es fertige Bausteine.

## Suche über alles

Das Suchfeld sitzt in der Seitenleiste, am Handy auf einem der Knöpfe oben. Es durchsucht jede Seite: Mails, Termine, To-dos, Notizen, Einkauf, Rezepte, Finanzen, Arbeit und die Einstellungen.

- Treffer sind nach Herkunft gruppiert, mit der Anzahl je Gruppe.
- Das gesuchte Wort ist im Treffer markiert.
- Dieselbe Eingabe findet auch Aktionen wie „Neue Notiz“ oder „Einkaufsmodus“.

Im Prototyp sucht der Baustein [MiniSearch](https://www.github.com/lucaong/minisearch) im Browser. Im echten Betrieb sucht die Datenbank auf dem Server mit ihrem eingebauten Volltextindex. Die Oberfläche bleibt dieselbe.

## Rechtschreibprüfung

Deine Idee aus Version 3 stimmt: LanguageTool ist der richtige Baustein. Die kostenlose öffentliche Schnittstelle ist aber kein guter Weg.

| Weg | Bedingungen | Bewertung |
| --- | --- | --- |
| Öffentliche Schnittstelle von LanguageTool | [20 Anfragen pro Minute, 20 Kilobyte je Anfrage, 75 Kilobyte je Minute; automatische Anfragen sind nicht erlaubt; der Text geht an fremde Server](https://dev.languagetool.org/public-http-api) | Für den Prototyp zum Zeigen in Ordnung, für den Betrieb nicht |
| Eigener LanguageTool-Server auf deinem Homeserver | Kostenlos, quelloffen, der Text verlässt dein Zuhause nicht | Empfehlung |
| Die Tastatur des Handys | Unterstreicht Tippfehler von allein, ohne Zutun von Tide | Ist immer da |

Die Prüfung läuft nur auf Knopfdruck. Vorher wird kein Zeichen gesendet oder gelesen. Ein Knopf „Prüfen“ steht in jedem größeren Textfeld, vor allem in Mail und Notiz. Der eigene Server braucht dauerhaft Arbeitsspeicher auf dem Homeserver, das wird beim Einrichten gemessen.

## Sprechen

Spracherkennung ist immer ein gelerntes Modell, also im weiten Sinn KI. Sie braucht aber weder Claude noch ein Abo, und es gibt drei Stufen:

1. **Diktat der Tastatur.** Jedes Handy hat ein Mikrofon auf der Tastatur. Das funktioniert in jedem Textfeld von Tide, ohne dass etwas gebaut wird.
2. **Diktat-Knopf in Tide.** Browser bringen eine eingebaute Spracherkennung mit. Mit der Einstellung [processLocally](https://developer.mozilla.org/docs/Web/API/SpeechRecognition/processLocally) muss die Erkennung auf dem Gerät bleiben. Ohne sie darf der Browser den Ton an seinen Hersteller schicken. Welche Browser die Geräte-Variante schon können, prüfen wir an deinen Geräten.
3. **Eigene Erkennung auf dem Homeserver.** Möglich mit einem frei verfügbaren Sprachmodell, als spätere Ausbaustufe.

Empfehlung: Stufe 1 gilt sofort, Stufe 2 kommt in den Prototyp mit einem klaren Hinweis, wohin der Ton geht. Dein Sprechknopf am Logo aus Version 3 kann bleiben.

## Kassenbons vom Foto

Deine drei Fragen der Reihe nach:

- **Gibt es einen fertigen Baustein?** Ja. Tesseract erkennt Text in Bildern und läuft als Tesseract.js sogar im Browser auf dem Handy, das Foto verlässt das Gerät nicht.
- **Kostet es viel Rechenleistung?** Nur in dem Moment, in dem du ein Foto machst. Es läuft nichts dauerhaft.
- **Ist es zuverlässig?** Das ist der schwache Punkt. Bei Bildern hängt das Ergebnis stark von der Vorbereitung ab: Dasselbe Bild kann laut einem [Erfahrungsbericht](https://dev.to/michael_lip_52d5151c3e364/ocr-in-2026-why-tesseract-still-beats-most-commercial-apis-1nd3) 60 oder 95 Prozent Trefferquote ergeben. Ein schräg fotografierter Bon bei schlechtem Licht ist der schwierige Fall.

Empfehlung: Fotos kommen nicht in die erste Fassung. Zuerst zählen Bons, die per Mail als Datei eintreffen. Fotos folgen später als Versuch hinter einem Schalter, mit der Kontrolle, dass die erkannten Zeilen die Bonsumme ergeben. Stimmt die Summe nicht, wird nichts übernommen.

## Wischgesten

Jede Zone hat genau eine Bedeutung für eine Geste. So kommen sich Gesten nie in die Quere.

| Wo | Geste | Wirkung |
| --- | --- | --- |
| Zeile in einer Liste | Nach links oder rechts, kurz oder lang | Vier frei belegbare Aktionen, zum Beispiel erledigen, zurückstellen, archivieren |
| Untere Leiste | Nach links oder rechts | Zum Nachbar-Bereich, wie in deiner Version |
| Kalender-Kachel | Nach links oder rechts | Monat und Woche wechseln |
| Kalender-Kachel | Nach oben oder unten | Monat blättern |
| Gezeitenkurve | Nach links oder rechts | Durch den Tag scrollen |
| Gezeitenkurve | Antippen | Groß und klein |
| Zweispaltiges Menü | Nach links | Schließen |
| Kachel, Eintrag, Ordner | Lange drücken | Dasselbe Menü wie der Rechtsklick |
| Kante der Seitenleiste | Ziehen | Breite ändern |
| Oberes Ende einer Liste | Herunterziehen | Suche in dieser Liste |

Der linke Bildschirmrand bleibt frei, damit die Zurück-Geste von Android funktioniert. Zurück schließt zuerst das oberste Fenster, dann geht es zum vorigen Bereich, erst danach aus der App. Das stammt aus deiner Version.

## Rückgängig

Jede Aktion lässt sich zurücknehmen: verschieben, löschen, erledigen, eine Regel ausführen, einen Termin ziehen. Das ist ein Grundsatz deiner Version und gilt überall.
