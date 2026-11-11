---
name: sichtpruefung
description: Eine Seite von Tide am PC und am Handy ablichten und gegen Design- und Tempo-Grenzen messen.
argument-hint: "[seite]"
disable-model-invocation: true
---

Seite: $0

1. `npm run sicht -- $0` ausführen. Der Befehl liefert zwei kleine Bilder (PC 1280 Pixel breit, Handy 390 Pixel breit) und eine Zeile Messwerte.
2. Sieh dir beide Bilder an und prüfe:
   - Nichts überlappt, nichts ist abgeschnitten, kein Text läuft aus seiner Fläche.
   - Text steht auf einer Fläche und ist lesbar, auch wenn die Sonne dahinter steht.
   - Knöpfe und Flächen sehen aus wie auf der Bausteine-Seite.
   - Am Handy liegt alles Häufige in der unteren Bildschirmhälfte.
3. Vergleiche die Messwerte mit den Grenzen:
   - sichtbare Flächen mit Weichzeichner: höchstens 4
   - laufende Animationen im Ruhezustand: 0
   - Wechsel zwischen zwei Bereichen: unter 0,1 Sekunden
4. Antworte als kurze Liste: bestanden oder nicht, und je Befund eine Zeile mit der Stelle im Bild.
5. Behebe nichts von selbst. Frag, welche Befunde behoben werden sollen.

Mach keine weiteren Bilder als diese zwei. Für einen bestimmten Zustand (Dialog offen, Menü offen) nimm den Zusatz, den `npm run sicht -- --hilfe` nennt.
