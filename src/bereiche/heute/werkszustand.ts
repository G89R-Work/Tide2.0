import type { KachelPlan } from '../../logik/kacheln'

// Kacheln der Seite Heute ab Werk, je Geräteart (docs/konzept/10-heute.md). Text steht ohne Hintergrund auf dem Himmel.
// null: auf diesem Gerät ab Werk ausgeblendet (die Knöpfe hat das Handy in seiner oberen Leiste).
type Ort = [x: number, y: number, w: number, h: number, unten?: 'unten']
const platz = (o: Ort | null) => o && { x: o[0], y: o[1], w: o[2], h: o[3], ...(o[4] ? { unten: true as const } : {}) }
const k = (id: string, name: string, minPc: [number, number], minHandy: [number, number], pc: Ort | null, handy: Ort | null, frei = false): KachelPlan => ({
  id,
  name,
  titel: false,
  ...(frei ? { hintergrund: false as const } : {}),
  min: { pc: { w: minPc[0], h: minPc[1] }, handy: { w: minHandy[0], h: minHandy[1] } },
  werk: { pc: platz(pc), handy: platz(handy) },
})

// Oben hängen Gruß, Wetter, Uhr, Knöpfe und Als Nächstes; unten („unten“, y zählt vom unteren Rand) Braucht dich und die Wochenleiste,
// die so auf jedem Bildschirm genau einen Abstand über der Kurve enden. Dazwischen wächst nur der Himmel.
// Zeilen: am PC etwa 48 px, am Handy 12 je Bildschirm; Monat und Rückblick liegen am Handy darunter.
//                 Kennung        Name              min PC  min Handy  PC: x, y, w, h            Handy: x, y, w, h        frei
export const werkszustand: readonly KachelPlan[] = [
  k('gruss', 'Gruß', [3, 1], [2, 2], [0, 0, 6, 1], [0, 0, 2, 2], true),
  k('wetter', 'Wetter', [2, 2], [1, 2], [6, 0, 3, 2], [1, 4, 1, 3], true),
  k('uhr', 'Uhr', [2, 2], [1, 2], [9, 0, 3, 2], [0, 4, 1, 3], true),
  k('naechstes', 'Als Nächstes', [3, 2], [2, 2], [0, 1, 6, 3], [0, 2, 2, 2], true),
  k('knoepfe', 'Knöpfe', [2, 1], [1, 1], [9, 2, 3, 1], null, true),
  k('braucht', 'Braucht dich', [3, 1], [2, 2], [0, 2, 6, 1, 'unten'], [0, 3, 2, 2, 'unten']),
  k('monat', 'Monat', [1, 2], [1, 2], [0, 0, 1, 2, 'unten'], [0, 12, 1, 2]),
  k('woche', 'Woche', [4, 2], [2, 2], [1, 0, 7, 2, 'unten'], [0, 0, 2, 3, 'unten']),
  k('notiz', 'Notiz', [1, 2], [1, 2], [8, 0, 1, 2, 'unten'], null),
  k('rueckblick', 'Wochenrückblick', [1, 2], [1, 2], [9, 0, 1, 2, 'unten'], [1, 12, 1, 2]),
]
