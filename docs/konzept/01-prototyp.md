# Prototyp zuerst

Stand 2026-11-11 · Teil des Gesamtkonzepts. „Deine Version" meint den alten Prototyp 3, „meine Beispielseite" die Beispielseite vom 10.11.

Deine Idee ist richtig, mit einer Bedingung: Der Prototyp wird als das echte Frontend gebaut und mit Attrappen-Daten gefüttert. Dann wird später nichts weggeworfen.

## Der Unterschied

|  | Wegwerf-Prototyp | Prototyp als echtes Frontend |
| --- | --- | --- |
| Form | Eine große HTML-Datei, wie bisher | Dasselbe Projekt, dieselben Bausteine wie die spätere App |
| Daten | Fest im Code | Kommen über dieselbe Schnittstelle wie später, nur aus einer Attrappe |
| Danach | Alles wird neu geschrieben | Die Attrappe wird Stück für Stück durch den echten Server ersetzt |
| Kosten | Zweimal bezahlt | Einmal bezahlt |

Dein bisheriger Prototyp ist die erste Art. Deshalb müssen wir jetzt neu anfangen. Das soll kein zweites Mal passieren.

## So funktioniert die Attrappe

1. **Ein Vertrag.** Für jede Art von Eintrag steht einmal fest, welche Felder sie hat und welche Anfragen es gibt: Mails holen, Mail archivieren, Regel speichern. Dieser Vertrag ist eine Datei mit Typen.
2. **Eine Attrappe.** Der Baustein [Mock Service Worker](https://github.com/mswjs/mswjs.io/blob/f089c360f7b5b9b9a89cc6fad0f08f8c1223fe39/src/content/docs/integrations/browser.mdx) fängt die Anfragen im Browser ab und beantwortet sie aus Beispieldaten. Die Oberfläche merkt keinen Unterschied.
3. **Echtes Verhalten.** Die Attrappe merkt sich Änderungen. Eine archivierte Mail ist weg, eine Regel bleibt gespeichert, Rückgängig funktioniert.
4. **Der Austausch.** Später beantwortet der echte Server dieselben Anfragen. Je Bereich wird die Attrappe abgeschaltet. An der Oberfläche ändert sich nichts.

Dein Satz „für jeden Knopf nur noch die Backend-Funktion hinzufügen“ stimmt damit wörtlich.

## Was der Prototyp kann und was nicht

| Im Prototyp fertig | Kommt erst mit dem Server |
| --- | --- |
| Jede Seite, jede Kachel, jedes Menü, jeder Dialog | Echte Mails und Kalender abgleichen |
| Alle Einstellungen, gespeichert im Browser | Anmeldung und mehrere Nutzer |
| Regeln anlegen, Probelauf gegen Beispielmails | Regeln laufen auf echten Mails |
| Gezeitenkurve, Hintergrund, Sonne und Mond | Benachrichtigungen aufs Handy |
| Suche über alle Beispieldaten | Suche über Jahre an Mails |
| Schichtplan mit Rhythmus und Hinweisen | Rechtschreibprüfung, Bons auslesen |

## Drei Schutzregeln

- **Abnahme je Bereich.** Jeder Bereich hat eine kurze Liste, wann er fertig ist. Ohne sie baut man ewig weiter.
- **Design-Stopp.** Nach der letzten Prototyp-Etappe wird das Aussehen eingefroren. Neue Wünsche wandern in den Ideenspeicher.
- **Kein Sonderweg.** Was im Prototyp gebaut wird, hält sich an dieselben Regeln wie später: Bausteine, Design-Werte, Tempo-Grenzen, Tests für Logik.

## Ist das teurer?

Nein. Der Prototyp ist rund zwei Drittel der gesamten Oberflächen-Arbeit, die ohnehin anfällt. Teuer wäre nur, erst das Backend zu bauen und danach festzustellen, dass die Oberfläche anders aussehen soll.
