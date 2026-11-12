import type { KachelPlan } from '../../logik/kacheln'

// Kacheln der Seite Heute ab Werk, je Geräteart (docs/konzept/10-heute.md). Text steht ohne Hintergrund auf dem Himmel.
// null: auf diesem Gerät ab Werk ausgeblendet (die Knöpfe hat das Handy in seiner oberen Leiste).
// Kante: o = oben links, r = oben rechts, u = unten links, ur = unten rechts; x und y zählen von diesen Rändern.
type Kante = 'o' | 'r' | 'u' | 'ur'
type Ort = [x: number, y: number, w: number, h: number, kante?: Kante]
const platz = (o: Ort | null) =>
  o && { x: o[0], y: o[1], w: o[2], h: o[3], ...(o[4]?.startsWith('u') ? { unten: true as const } : {}), ...(o[4]?.endsWith('r') ? { rechts: true as const } : {}) }
const k = (id: string, name: string, pc: Ort | null, handy: Ort | null, frei = false): KachelPlan => ({
  id,
  name,
  titel: false,
  ...(frei ? { hintergrund: false as const } : {}),
  werk: { pc: platz(pc), handy: platz(handy) },
})

// In ganzen Zellen (quadratisch, docs/konzept/04-kacheln.md). PC und Tablet (ab Werk 16 Spalten): links oben Gruß und Als Nächstes,
// rechts oben Uhr, Wetter und Knöpfe; unten Braucht dich und die Wochenleiste (7 Zellen) mit Monat davor, rechts unten Notiz und Rückblick.
// Passt ab 10 Spalten und 5 Reihen; auf größeren Bildschirmen wächst nur der Himmel dazwischen.
// Handy (ab Werk 4 Spalten): oben Gruß, Als Nächstes, Uhr und Wetter; unten Braucht dich und die Woche; Monat und Rückblick darunter.
//                                       PC: x, y, w, h, Kante      Handy: x, y, w, h, Kante   frei
export const werkszustand: readonly KachelPlan[] = [
  k('gruss', 'Gruß', [0, 0, 5, 1], [0, 0, 4, 1], true),
  k('wetter', 'Wetter', [2, 0, 2, 2, 'r'], [2, 2, 2, 2], true),
  k('uhr', 'Uhr', [0, 0, 2, 2, 'r'], [0, 2, 2, 2], true),
  k('naechstes', 'Als Nächstes', [0, 1, 5, 2], [0, 1, 4, 1], true),
  k('knoepfe', 'Knöpfe', [0, 2, 3, 1, 'r'], null, true),
  k('braucht', 'Braucht dich', [0, 1, 5, 1, 'u'], [0, 1, 4, 1, 'u']),
  k('monat', 'Monat', [0, 0, 1, 1, 'u'], [0, 8, 1, 1]),
  k('woche', 'Woche', [1, 0, 7, 1, 'u'], [0, 0, 4, 1, 'u']),
  k('notiz', 'Notiz', [1, 0, 1, 1, 'ur'], null),
  k('rueckblick', 'Wochenrückblick', [0, 0, 1, 1, 'ur'], [1, 8, 1, 1]),
]
