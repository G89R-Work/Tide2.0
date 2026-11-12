# Start

Diese Datei ist für dich, nicht für Claude. Sie zeigt, was noch zu tun ist und wie jede Sitzung abläuft.

## Stand (11.11.2026)
Erledigt: Paket im Repository, Zweig `main` angelegt, zweites Konto verbunden. ECC wird bewusst nicht genutzt.

## Was noch zu tun ist
1. **Auf GitHub `main` als Standard setzen:** Repository → Settings → General → Default branch → `main`. Neue Cloud-Sitzungen starten dann vom richtigen Stand.
2. **Nur wenn du am PC mit Claude Code arbeitest:** `fuer-dich/benutzer-CLAUDE.md` nach `~/.claude/CLAUDE.md` kopieren (Windows: `C:\Users\DEIN-NAME\.claude\CLAUDE.md`).
3. **Chat-Projekt auf claude.ai:** Projektanweisung durch den Text aus `fuer-dich/chat-projekt-anweisung.md` ersetzen.
4. **Erste Scheibe:** neue Sitzung, `/scheibe` tippen.

## Jede weitere Sitzung

1. Ist eine Scheibe fertig, sagt Claude Bescheid. Dann `/clear` tippen (oder eine neue Sitzung öffnen). Das spart Tokens.
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
- **Befehle nur auf deinen Aufruf.** Die Befehle belegen keinen Platz, solange du sie nicht startest.
- **Viele kleine Sicherungen.** Im Repository stehen dadurch viele Einträge „Zwischenstand". Das ist gewollt; jede Scheibe endet mit einem Eintrag, der sie benennt.

## Tide im Browser ansehen (GitHub Codespaces)
Auf GitHub: **Code → Codespaces → Create codespace on main**. Der Codespace holt den neuesten Stand, startet Tide und öffnet die Seite von selbst in einem neuen Tab. Danach den Codespace unter **Code → Codespaces** stoppen, das spart freie Stunden. Meldet ein alter Codespace Git-Fehler: löschen (… → Delete) und neu anlegen.

## Wenn etwas hakt
- Claude läuft in die falsche Richtung: zweimal Esc drücken und zurückspulen, statt Korrekturen anzuhängen.
- Eine Sitzung ist mitten in der Scheibe abgebrochen und du willst sie sauber beenden: `/abschluss`.
- Die Sitzung wird lang: neue Sitzung, `/scheibe`. Der Stand steht in `STATUS.md` und im Repository.
- Einmal pro Woche `/usage` ansehen. Dort steht, was am meisten verbraucht.
