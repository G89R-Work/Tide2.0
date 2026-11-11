# Start

Diese Datei ist für dich, nicht für Claude. Sie führt in neun Schritten vom leeren Ordner zur ersten Sitzung.

## Was du brauchst
- Claude Code, installiert und angemeldet (Anleitung: https://code.claude.com/docs)
- Node.js und Git auf deinem PC
- Ein GitHub-Konto für ein privates Repository. Darüber arbeiten dein PC und die Cloud am selben Stand.

## Die Schritte

1. **Ordner.** Lege einen leeren Ordner `tide` an und entpacke das Startpaket hinein. `CLAUDE.md` muss direkt im Ordner liegen. Der Ordner `.claude` ist versteckt; schalte „Ausgeblendete Elemente" ein, falls du ihn nicht siehst.

2. **Deine allgemeine Anweisung.** Kopiere `fuer-dich/benutzer-CLAUDE.md` nach `~/.claude/CLAUDE.md`. Unter Windows ist das `C:\Users\DEIN-NAME\.claude\CLAUDE.md`. Liegt dort schon eine Datei, ersetze sie. Sie gilt für alle deine Projekte auf diesem PC.

3. **Die Anweisung für den Chat.** Öffne dein Tide-Projekt auf claude.ai und ersetze die Projektanweisung durch den Text aus `fuer-dich/chat-projekt-anweisung.md`. Der Chat ist ab jetzt für Ideen und Entscheidungen da, Claude Code für den Code.

4. **Alter Prototyp, wenn du magst.** Lege „Tide Prototyp 3.html" in den Ordner `vorlage/`. Claude kann ihn dort nicht lesen, und er wird nicht hochgeladen. Er dient nur dir zum Nachsehen.

5. **Claude Code starten.** Öffne ein Terminal im Ordner `tide` und starte `claude`. Schreib als Erstes:
   > Richte Git ein und verbinde ein neues privates GitHub-Repository namens tide. Lade den jetzigen Stand hoch.

6. **ECC schlank einrichten.** Schreib in derselben Sitzung:
   > Lies in START.md den Abschnitt „ECC" und führe ihn für mein System aus. Zeig mir vorher jeden Befehl.

7. **Kontext prüfen.** Tippe `/context`. Dort steht, was wie viel Platz belegt. Belegt ECC mehr als ein Zehntel, sag: „Dünne ECC weiter aus", zuerst den Regelsatz `typescript`.

8. **Zweites Konto.** Melde dich in deinem zweiten Claude-Konto auf claude.ai an und verbinde dort unter Claude Code dasselbe GitHub-Konto. Mehr ist nicht nötig.

9. **Erste Scheibe.** Tippe `/clear` und dann `/scheibe`.

## ECC

Geprüft am 11.11.2026 für ECC 2.2.3. Gibt es eine neuere Version, nimm deren Nummer.

```bash
# 1. Kleinstes Profil, ohne Hooks
npx ecc-universal@2.2.3 install --profile minimal --target claude

# 2. ECC holen, außerhalb des Tide-Ordners
git clone https://github.com/affaan-m/ECC.git
cd ECC

# 3. Nur zwei Skills dazu (Windows: .\install.ps1 statt ./install.sh)
./install.sh --target claude --skills tdd-workflow,security-review

# 4. Zwei Regelsätze in das Tide-Projekt kopieren
mkdir -p /PFAD/ZU/tide/.claude/rules/ecc
cp -R rules/common /PFAD/ZU/tide/.claude/rules/ecc/
cp -R rules/typescript /PFAD/ZU/tide/.claude/rules/ecc/
```

Drei Hinweise dazu:
- Die Anleitung von ECC zeigt Profil und einzelne Skills nur als getrennte Befehle. Ob Schritt 3 nach Schritt 1 etwas doppelt anlegt, siehst du in Schritt 7.
- Installiere ECC nicht zusätzlich als Plugin. Beides zusammen führt laut ECC zu doppelten Einträgen.
- Die Schritte 1 und 3 gelten nur auf diesem PC. In Cloud-Sitzungen wirken nur die Dateien im Projekt, also die Regelsätze aus Schritt 4 und alles aus dem Startpaket.

## Jede weitere Sitzung

1. Neue Sitzung öffnen: am PC `/clear`, in der Cloud oder am Handy eine neue Sitzung in der Seitenleiste.
2. `/scheibe` tippen. Claude nimmt die nächste Scheibe, baut, prüft und sichert alles selbst.
3. Am Ende die 3 bis 5 Punkte aus dem Bericht in der App ausprobieren.

Claude hält nur an, wenn eine wichtige Entscheidung ansteht. Zwischendurch eine Idee: `/idee <ein Satz>`.

## Konto oder Gerät wechseln

Du musst nichts tun. Es arbeitet immer nur ein Konto gleichzeitig.
- **Beim Start** jeder Sitzung holt Tide still den neuesten Stand aus GitHub.
- **Nach jeder Antwort** von Claude wird still gesichert und hochgeladen. Greift ein Limit mitten in der Arbeit, ist höchstens die letzte Antwort verloren.
- **Weiterarbeiten:** Im anderen Konto eine neue Sitzung öffnen und `/scheibe` tippen. Claude merkt am Stand, dass die Scheibe angefangen ist, und macht dort weiter.
- **Am PC** wechselst du das Konto mit `/login`. In der Cloud öffnest du einfach das andere Konto.

Beides läuft über kleine Programme in `.claude/hooks/`, nicht über das Modell, und kostet keine Tokens.

## Was das Paket bewusst festlegt
- **Kein automatisches Gedächtnis.** In `.claude/settings.json` ist es abgeschaltet, weil es je Gerät getrennt wäre. `STATUS.md` liegt im Repository und gilt auf PC und Cloud gleich.
- **Gesperrte Ordner.** Claude liest weder `vorlage/` noch `node_modules/`, `dist/` und die Sperrdatei der Pakete. Das spart am meisten Kontext.
- **Befehle nur auf deinen Aufruf.** Die sechs Befehle belegen keinen Platz, solange du sie nicht startest.
- **Viele kleine Sicherungen.** Im Repository stehen dadurch viele Einträge „Zwischenstand". Das ist gewollt; jede Scheibe endet mit einem Eintrag, der sie benennt.

## Wenn etwas hakt
- Claude läuft in die falsche Richtung: zweimal Esc drücken und zurückspulen, statt Korrekturen anzuhängen.
- Eine Sitzung ist mitten in der Scheibe abgebrochen und du willst sie sauber beenden: `/abschluss`.
- Die Sitzung wird lang: neue Sitzung, `/scheibe`. Der Stand steht in `STATUS.md` und im Repository.
- Einmal pro Woche `/usage` ansehen. Dort steht, was am meisten verbraucht.
