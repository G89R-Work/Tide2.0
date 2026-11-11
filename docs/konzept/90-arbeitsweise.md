# Arbeiten mit Claude Code

Stand 2026-11-11 · Teil des Gesamtkonzepts. „Deine Version" meint den alten Prototyp 3, „meine Beispielseite" die Beispielseite vom 10.11.

Claude Code liest zu Beginn jeder Sitzung wenige feste Dateien und alles andere erst bei Bedarf. Wer das ausnutzt, spart am meisten: Die feste Datei bleibt winzig, der Rest wird nur geladen, wenn er gebraucht wird. Das Startpaket zu diesem Konzept enthält alle Dateien fertig.

## Die drei Anweisungen, die du wolltest

| Dein Wunsch | Datei | Gilt für |
| --- | --- | --- |
| Die Pflichtdatei | `CLAUDE.md` im Projektordner | Tide, jede Sitzung |
| Projektanweisungen | `.claude/rules/` mit einer Datei je Thema, dazu `docs/konzept/` mit einer Datei je Bereich | Tide, nur wenn das Thema dran ist |
| Die generelle Anweisung | `~/.claude/CLAUDE.md` in deinem Benutzerordner | Alle deine Projekte in Claude Code |
| Zusatz | Eine kurze Anweisung für das Tide-Projekt hier im Chat | Ideen und Entscheidungen, kein Code |

## Was wann geladen wird

Die Angaben stammen aus der aktuellen Anleitung von Claude Code zu [Gedächtnis](https://code.claude.com/docs/en/memory), [Skills](https://code.claude.com/docs/en/skills) und [Kosten](https://code.claude.com/docs/en/costs).

| Was | Wann es im Kontext liegt | Folge für Tide |
| --- | --- | --- |
| `CLAUDE.md` | Immer und vollständig, auch nach dem Verdichten | Rund 50 Zeilen. Die Anleitung nennt 200 Zeilen als Obergrenze |
| Regel mit Pfadangabe | Erst wenn Claude eine passende Datei liest oder bearbeitet | Design-Regeln laden nur bei Arbeit an der Oberfläche, Test-Regeln nur bei Tests |
| Regel ohne Pfadangabe | Immer | Gibt es im Startpaket nicht |
| Skill | Nur der Aufruf lädt den Inhalt | Lange Abläufe kosten nichts, bis du sie startest |
| Verweis mit @ in `CLAUDE.md` | Sofort beim Start | Spart nichts, deshalb steht keiner drin |
| `docs/konzept/` | Nie von selbst | Der Befehl für eine Scheibe nennt genau die eine Datei, die gelesen wird |

Deshalb wird dieses Konzept zerlegt: Eine Sitzung am Einkauf liest rund 30 Zeilen Einkauf und nicht das ganze Dokument.

## Deine bisherigen Regeln, neu gefasst

Deine persönlichen Regeln sind für den Chat geschrieben. In Claude Code kosten drei davon bei jedem Schritt Tokens. Ich schlage vor, sie so zu ändern:

| Bisher | Was das in Claude Code kostet | Neu |
| --- | --- | --- |
| Vor jeder Umsetzung ganz genau nachfragen | Jede Runde Rückfragen schickt den ganzen Kontext erneut | Einmal je Scheibe ein Plan in höchstens zehn Zeilen. Fragen nur zu dem, was das Konzept offen lässt |
| Permanent erklären, was gerade passiert | Ausgabe kostet je Token ein Mehrfaches der Eingabe | Ein Satz vor jedem größeren Schritt, am Ende ein kurzer Bericht in `STATUS.md` |
| ECC bei jedem Codiervorgang bestätigen | Vollständig installiert bringt ECC über 300 Skills mit, deren Kurzbeschreibungen in jeder Sitzung mitlaufen | ECC schlank installieren, einmal je Scheibe bestätigen |
| Subagenten stark begrenzen | Jeder Subagent beginnt ohne Vorwissen | Bleibt so |

Kritisch mitdenken und Optionen als nummerierte Liste bleiben unverändert.

## ECC: ja, aber schlank

[ECC](https://github.com/affaan-m/ECC) in Version 2.2.3 enthält 71 Agenten und 314 Skills. Für Tide wird ein Bruchteil gebraucht. Mein Vorschlag:

- Das kleinste Profil installieren.
- Dazu die Regelsätze „common“ und „typescript“.
- Dazu zwei Skills: Testen zuerst und Sicherheitsprüfung.
- Nach der Installation zeigt `/context`, wie viel Platz ECC belegt. Ist es mehr als ein Zehntel, wird weiter ausgedünnt.

ECC ist in dieser Chat-Sitzung nicht verfügbar. Die genauen Befehle stehen im Startpaket und werden von dir in Claude Code ausgeführt.

## Die Skills im Startpaket

Jeder Skill ist ein Befehl, den nur du auslöst.

| Befehl | Was er tut |
| --- | --- |
| `/scheibe` | Eine Scheibe von Anfang bis Ende: Stand lesen, die eine Konzeptdatei lesen, Plan zeigen, bauen, prüfen |
| `/abschluss` | Stand und Entscheidungen festhalten, sichern, nächste Scheibe vorschlagen |
| `/baustein` | Vor einem Eigenbau nach einem fertigen Baustein suchen und das Ergebnis festhalten |
| `/bereich` | Einen Bereich nach Schablone anlegen: Seite, Kacheln, Attrappe, Vertrag, Aktionen, Einstellungen |
| `/sichtpruefung` | Eine Seite am PC und am Handy ablichten und gegen Design- und Tempo-Grenzen messen |
| `/idee` | Eine Idee in den Ideenspeicher legen, ohne die laufende Arbeit zu stören |

## So läuft eine Scheibe

1. Du startest Claude Code im Projektordner und tippst zum Beispiel `/scheibe postfach-ordner`.
2. Claude liest den Stand und die Postfach-Datei und zeigt einen Plan.
3. Du sagst Ja oder korrigierst.
4. Claude baut und lässt den Prüfbefehl laufen, bis er grün ist.
5. Du siehst dir das Ergebnis am Handy und am PC an.
6. `/abschluss`, danach `/clear`. Die nächste Scheibe beginnt mit leerem Kontext.

## Zwölf Gewohnheiten, die Tokens sparen

1. **Eine Scheibe je Sitzung, danach `/clear`.** Alter Verlauf wird sonst bei jeder Nachricht mitbezahlt.
2. **`STATUS.md` ist das Gedächtnis,** nicht der Verlauf. Die Datei bleibt unter 40 Zeilen.
3. **Erst planen, dann bauen.** Der Plan-Modus liest nur und ändert nichts. Ein falscher Plan kostet zehn Zeilen, ein falscher Bau eine Sitzung.
4. **Das Standardmodell für fast alles.** Das stärkste Modell nur für drei Stellen: Gezeitenkurve, Bearbeiten-Modus der Kacheln, später der Mail-Abgleich.
5. **Ein Prüfbefehl, der nur Fehler ausgibt.** Hunderte Zeilen „bestanden“ sind bezahlter Lärm.
6. **Dein alter Prototyp wird nie ganz gelesen.** Die Datei ist 634 Kilobyte groß und würde den Kontext allein füllen. Sie ist im Startpaket gesperrt. Was aus ihr gebraucht wird, steht in den Konzeptdateien.
7. **Eine Sperrliste** für Ordner, die Claude nie lesen muss: eingebundene Pakete, fertige Ausgabe, Sperrdateien.
8. **Keine Zusatzdienste, die das Projekt nicht braucht.** Jeder angebundene Dienst belegt Platz. Befehle in der Kommandozeile sind günstiger.
9. **Bei langem Verlauf gezielt verdichten.** In `CLAUDE.md` steht, was dabei erhalten bleiben muss.
10. **Falsche Richtung zurückspulen** statt Korrekturen anzuhängen. Zweimal Esc öffnet die Auswahl.
11. **Bildschirmfotos nur gezielt.** Bilder sind teuer. Der Befehl `/sichtpruefung` macht wenige und kleine.
12. **Einmal pro Woche `/usage` und `/context` ansehen.** Dort steht, was am meisten verbraucht.

## Was ich nicht übernehme

Der Spar-Leitfaden von ECC empfiehlt feste Grenzen für das Nachdenken und früheres automatisches Verdichten. Die Anleitung von Claude Code beschreibt die Grenze für das Nachdenken nur für Modelle mit festem Budget. Für die aktuellen Modelle ist die Stufe über `/effort` der vorgesehene Weg. Früheres Verdichten ersetzt `/clear` nach jeder Scheibe nicht und kann mitten in der Arbeit Wissen kosten. Beides lasse ich deshalb weg.
