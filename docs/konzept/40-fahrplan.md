# Fahrplan

Stand 2026-11-11 · Teil des Gesamtkonzepts. „Deine Version" meint den alten Prototyp 3, „meine Beispielseite" die Beispielseite vom 10.11.

Erst der Prototyp in neun Etappen, dann der Server in sechs. Die riskantesten Teile kommen zuerst: Kacheln auf dem Handy, Gezeitenkurve und Tempo. Scheitert dort etwas, wissen wir es nach wenigen Sitzungen.

## Prototyp

Die Zahl der Scheiben ist meine Schätzung. Eine Scheibe ist eine Sitzung.

| Etappe | Inhalt | Fertig, wenn | Scheiben |
| --- | --- | --- | --- |
| 0 Fundament | Projekt, Startpaket, Werte-Datei mit deinen Farben und Inter, Bausteine für Knopf und Fläche, Attrappe mit Vertrag, Prüfbefehl mit Tempo-Grenzen | Eine leere App startet am Handy und am PC, der Prüfbefehl ist grün | 3 |
| 1 Gerüst | Seitenleiste mit ziehbarer Breite, zweite Ebene, zweispaltiges Menü, belegbare Knöpfe, Liste der Aktionen, Liste der Einstellungen, Hintergrund mit beiden Bahnen, Versuch und Bearbeiten-Modus der Kacheln | Alle Seiten sind leer erreichbar. Kacheln lassen sich auf deinem Handy verschieben und in der Größe ändern | 6 |
| 2 Gezeitenkurve und Heute | Kurve mit allem aus Version 3, sichtbar je Seite, Heute für PC und Handy, Braucht dich, Uhr-Karte, Wetter | Du entscheidest die Bahn von Sonne und Mond und die Lage der Kurve am Handy | 5 |
| 3 Postfach | Ordner, Liste, Leser, Schreiben, Regeln mit Probelauf, Erkannt-Kasten, Handy-Ansicht | Eine Regel lässt sich anlegen, proben, ausführen und zurücknehmen | 6 |
| 4 Kalender und Arbeit | Monat und Woche, Tages-Kachel, Kalenderwoche, Feiertage, Handy-Monat; Schichtarten, Rhythmus, Hinweise, Arbeitszeit, Urlaub | Alle Rhythmen aus der Tabelle bestehen ihre Tests | 6 |
| 5 To-dos und Notizen | Liste mit Gruppen, Suche, Archiv, Quellen; Notiz-Kacheln, Ordner, Editor | Eine Notiz lässt sich groß ziehen, ein To-do wandert ins Archiv | 4 |
| 6 Einkauf und Kochen | Liste, Ladenvergleich, Einkaufsmodus mit lernender Reihenfolge; Rezepte, Zur Einkaufsliste, Kochmodus mit Timern | Ein Einkauf im Laden gelingt nur mit dem Handy | 5 |
| 7 Finanzen | Die sechs Kacheln, zweite Ebene, Entsperrung | Die Seite zeigt deine Beispielzahlen stimmig | 3 |
| 8 Einstellungen und Übergreifendes | Alle Abschnitte, Konten an einem Ort, Suche über alles, Wischgesten, Diktat-Knopf, Prüfen-Knopf | Abnahme des Prototyps, danach Design-Stopp | 5 |

Die Liste der Einstellungen entsteht in Etappe 1. Jeder Bereich trägt seine Zeilen selbst ein, Etappe 8 vervollständigt nur die Seite.

## Server

| Etappe | Inhalt |
| --- | --- |
| S1 Grundlage | Server, Datenbank, Anmeldung per Passkey, Nutzer. Einstellungen und Anordnungen wandern vom Browser auf den Server |
| S2 Eigene Daten | To-dos, Notizen, Einkauf, Kochen, Arbeit, Finanzen. Hier wird nur die Attrappe ausgetauscht |
| S3 Kalender | Abgleich mit deinen Kalender-Konten |
| S4 Postfach | Mail-Abgleich, Regeln auf echten Mails, Erkennung, Suche über alles |
| S5 Teilen | Räume, weitere Nutzer, geteilte Listen und Kalender |
| S6 Betrieb | Benachrichtigungen, Wetter-Quellen, eigener LanguageTool-Server, Sicherung, Erreichbarkeit über deine Domain |

Architektur und Sicherheit dafür stehen im ersten Konzept und gelten weiter.

## Die nächsten drei Schritte

1. Du entscheidest die Punkte im Abschnitt „Offene Entscheidungen“.
2. Du legst einen leeren Projektordner an, entpackst das Startpaket hinein und führst die Schritte aus der Datei `START.md` aus.
3. Die erste Sitzung in Claude Code beginnt mit `/scheibe fundament`.
