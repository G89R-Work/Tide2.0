# Postfach

Stand 2026-11-11 · Teil des Gesamtkonzepts. „Deine Version" meint den alten Prototyp 3, „meine Beispielseite" die Beispielseite vom 10.11.

Das Postfach kommt mit allen Funktionen aus deiner Version 3. Es sitzt im Gerüst meiner Seite: Ordner in der zweiten Ebene, daneben Liste und Leser mit ziehbaren Trennlinien.

## Ordner

| Art | Inhalt |
| --- | --- |
| Systemordner | Posteingang, Braucht dich, Entwürfe, Geplant, Gesendet, Zurückgestellt, Archiv, Junk, Papierkorb |
| Eigene Ordner | Mit Unterordnern, Farben, frei sortierbar per Ziehen, anheftbar |
| Intelligente Ordner | Gespeicherte Suchen |

Ein eingeklappter Ordner zählt das Ungelesene seiner Unterordner mit. Mails lassen sich in einen Ordner ziehen. Systemordner werden nur umsortiert, nie verschachtelt.

## Liste und Leser

- **Liste:** Suche, Filter, Mehrfachauswahl, angeheftete Mails oben, Kategorie-Etiketten, ein Hinweis je Mail wie Antworten, Handeln oder Lesen.
- **Leser:** Antworten, Allen antworten, Weiterleiten, Nachverfolgen, Erinnern, Verschieben, Archiv, Löschen.
- **Antworten:** direkt unter der Mail, von der Adresse, an die die Mail ging, mit der Signatur dieses Kontos.
- **Senden:** sofort oder geplant, fünf Sekunden lang rückholbar.
- **Jede Aktion** auf einer oder mehreren Mails hat Rückgängig.
- **Abbestellen** mit Nachweis, wie in deiner Version.

## Erkannt statt „Kurz gesagt“

Die Zusammenfassung per KI entfällt vorerst. An ihrer Stelle steht ein Kasten, der nur erscheint, wenn eine Regel etwas sicher erkannt hat: Rechnung mit Betrag, Fälligkeit und Vergleich zum letzten Mal, Termin, Sendung, Frist. Die Knöpfe darin bleiben: Frist eintragen, Als To-do, Erledigt.

## Regeln

Dein Regel-Editor bleibt in seiner Form: Name, „Wenn eine oder alle Bedingungen zutreffen“, Zeilen aus Feld, Vergleich und Wert, darunter „Dann“ mit Aktionen. Dazu der Probelauf gegen vorhandene Mails, „Jetzt ausführen“ mit Rückgängig und die Regel aus dem Rechtsklick auf eine Mail.

Dafür gibt es fertige Bausteine, wie du vermutet hast:

| Teil | Baustein | Was er abnimmt |
| --- | --- | --- |
| Der Editor | [react-querybuilder](https://react-querybuilder.js.org/docs/utils/export) | Bedingungszeilen, Gruppen, „und“ und „oder“, Felder, Vergleiche, Werte |
| Das Format | JsonLogic, das der Editor direkt ausgibt | Eine Regel ist ein Stück Daten |
| Die Auswertung | [json-logic-js](https://npmjs.com/package/json-logic-js) | Prüft eine Regel gegen eine Mail, im Browser und später auf dem Server mit demselben Code |
| Der Standard dahinter | [Sieve](https://rfc-editor.org/rfc/rfc5228), die genormte Sprache für Mailfilter | Vorbild für Felder und Aktionen; später können Regeln dorthin exportiert werden |

Selbst gebaut werden nur dein Aussehen darüber, der Probelauf und die Liste der Aktionen.

## Weitere Postfach-Einstellungen

Kategorien, Signaturen, Abwesenheit, Blockiert und Ordner bleiben wie bei dir und liegen in der zweiten Ebene. Konten liegen nur noch in den Einstellungen.

## Handy

Erst die Liste. Eine angetippte Mail füllt den Bildschirm. Die Ordner stehen im zweispaltigen Menü. Wischen auf einer Zeile löst eine frei belegbare Aktion aus.
