# Kalender

Stand 2026-11-11 · Teil des Gesamtkonzepts. „Deine Version" meint den alten Prototyp 3, „meine Beispielseite" die Beispielseite vom 10.11.

Der Kalender besteht aus zwei Kacheln: links breit der Monat oder die Woche, rechts schmal der gewählte Tag.

## Die linke Kachel

- **Monat** aus deiner Version: immer sechs Wochen, damit die Kachel gleich groß bleibt. Termine als kleine Etiketten.
- **Woche** aus meiner Version: Stundenraster mit Schichten als Flächen und Terminen als Blöcken.
- **Wechsel zwischen Monat und Woche:** per Knopf oder durch Wischen nach links und rechts.
- **Blättern:** Wischen oder Scrollen nach oben und unten wechselt den Monat, in der Wochenansicht die Woche.
- **Kalenderwoche:** Links neben jeder Wochenzeile steht ihre Nummer. In der Kopfzeile steht die aktuelle: „November 2026, KW 46“.
- **Feiertage** für dein Bundesland, aus dem Baustein [date-holidays](https://cdn.jsdelivr.net/npm/date-holidays@3.28.0/README.md), der alle 16 Bundesländer kennt.
- **Rechtsklick oder langer Druck** auf einen Tag legt einen Termin an.

## Die rechte Kachel

Der gewählte Tag als Liste: Uhrzeit, Titel, Art. Jeder Eintrag lässt sich bearbeiten und löschen. Oben der Knopf für einen neuen Termin und das Diktat. Diese Kachel bleibt bei jeder Ansicht stehen.

## Logik

- Ein Termin in einer Schicht warnt schon im Eingabefenster und legt auf Wunsch eine Erinnerung zum Prüfen an.
- Der Urlaubsplaner ist vom Kalender aus erreichbar und wohnt im Bereich Arbeit.

## Handy

Die Terminliste aus meiner Beispielseite bleibt. Neu ist die Monatsansicht darüber, mit Punkten je Tag wie in deiner Version. Ein angetippter Tag springt zu seinen Terminen. Wischen nach links und rechts wechselt zwischen Monat und Woche, nach oben und unten den Monat.

## Bausteine

Der Monat ist ein einfaches Raster und wird selbst gezeichnet. Für die Wochenansicht mit ziehbaren Terminen gibt es fertige Kalender-Bausteine wie [Schedule-X](https://v2.schedule-x.dev). Ob einer davon dein Kachel-Aussehen annimmt, zeigt ein kurzer Versuch in der Kalender-Etappe. Wiederholungen von Terminen rechnet ein fertiger Baustein nach dem Kalender-Standard.
