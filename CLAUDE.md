# Tide

Persönliche Web-App: Gezeitenkurve (Zeitstrahl), Heute, Postfach, Kalender, To-dos, Einkauf, Kochen, Finanzen, Arbeit, Notizen, Einstellungen.
Zurzeit entsteht der Prototyp: das echte Frontend mit Attrappen-Daten, noch ohne Server.
Der Nutzer programmiert nicht selbst. Antworte auf Deutsch und in einfachen Worten.

## Befehle
- `npm run dev` startet die App.
- `npm run pruefen` prüft Typen, Stil, Tests und Tempo-Grenzen und gibt nur Fehler aus. Muss vor jedem Abschluss grün sein.
- `npm run sicht -- <seite>` macht je ein kleines Bild für PC und Handy und misst die Tempo-Werte.

Die Befehle entstehen in Etappe 0. Fehlt einer, gehört er zur laufenden Scheibe.

## Technik
React, TypeScript (strict), Vite, Tailwind, shadcn/ui, Mock Service Worker.
Alle weiteren Bausteine: `docs/konzept/30-bausteine.md` und `docs/BAUSTEINE.md`.

## Aufbau
- `src/werte/` einzige Quelle für Farben, Schrift, Abstände, Glas, Bewegung
- `src/bausteine/` Knopf, Fläche und die übrigen gemeinsamen Bausteine
- `src/geruest/` Seitenleiste, Menü, Kopfzeile, Hintergrund, Gezeitenkurve
- `src/kacheln/` Raster und Bearbeiten-Modus
- `src/bereiche/<name>/` je Bereich: Seite, Kacheln, Aktionen, Einstellungen
- `src/vertrag/` Typen und Anfragen; gilt für Attrappe und späteren Server
- `src/attrappe/` Antworten und Beispieldaten für den Prototyp
- `src/logik/` reine Funktionen mit Tests

## Arbeitsweise
- Gearbeitet wird in Scheiben über `/scheibe`. Eine Scheibe je Sitzung, von Anfang bis Abschluss ohne Pause.
- Der Nutzer will möglichst wenig zu tun haben. Entscheide selbst nach Konzept und Empfehlung. Halte nur an bei: neuer Abhängigkeit, Änderung am Vertrag, Abweichung vom Konzept, schwer Umkehrbarem, Kosten. Dann alle Fragen auf einmal.
- Zu Beginn nur `STATUS.md` lesen. Aus `docs/konzept/` nur die Dateien, die `docs/FAHRPLAN.md` für die Scheibe nennt. Nie das ganze Konzept.
- Offene Punkte aus `docs/ENTSCHEIDUNGEN.md` (Abschnitt „Offen") entscheidest du nach der dortigen Empfehlung und vermerkst das. Frag nur, wenn der Punkt dort als wichtig markiert ist.
- Es arbeitet immer nur ein Claude-Konto gleichzeitig. Der Stand wird beim Start automatisch geholt und nach jeder Antwort automatisch gesichert.
- ECC: einmal je Scheibe bestätigen: „Ich setze diese Scheibe unter Verwendung von ECC um." Ist ECC in der Sitzung nicht vorhanden, sag das einmal und arbeite ohne.
- Subagenten nur nach Freigabe: wofür, warum nicht direkt, grober Umfang.
- Ein Satz vor jedem größeren Schritt. Code nicht im Chat wiederholen. Abschlussbericht höchstens 6 Zeilen.
- Ideen außerhalb der Scheibe: eine Zeile in `docs/IDEEN.md`, nicht bauen.

## Feste Regeln
1. Baustein vor Eigenbau. Neue Abhängigkeit nur mit Eintrag in `docs/BAUSTEINE.md` und Ja des Nutzers.
2. Farben, Abstände, Glas und Bewegung kommen nur aus `src/werte/`. Kein Bereich hat eigene Knöpfe.
3. Die Oberfläche holt und ändert Daten nur über `src/vertrag/`.
4. Jede Funktion ist eine Aktion in der Aktionsliste, jede Option eine Zeile in der Einstellungsliste.
5. Logik liegt in `src/logik/` als reine Funktion. Der Test entsteht zuerst.
6. Jede Aktion des Nutzers lässt sich rückgängig machen.
7. Tide ruft keine KI auf.
8. Die Tempo-Grenzen aus `docs/konzept/02-tempo.md` gelten immer.
9. Nie sparen durch ungetesteten Code, geratene Schnittstellen oder fehlende Fehlerbehandlung.
10. `vorlage/` enthält den alten Prototyp und wird nie gelesen.

## Compact instructions
Beim Verdichten erhalten: Name und Plan der laufenden Scheibe, geänderte Dateien, offene Fehler aus `npm run pruefen`, getroffene Entscheidungen, was noch fehlt.
Verwerfen: Datei-Inhalte, Suchergebnisse, erledigte Fehlversuche.
