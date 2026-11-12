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

// PC: in 12-px-Linien, sichtbar ist Linien × 12 − 12 px (5 Linien = 48 px). Links oben Gruß und Als Nächstes, rechts oben Uhr, Wetter
// und Knöpfe; unten Braucht dich und die Wochenleiste, rechts unten Notiz und Rückblick. Passt ab dem Tablet (70 Linien breit);
// auf größeren Bildschirmen wächst nur der Himmel dazwischen.
// Handy: 2 Spalten, 12 Zeilen je Bildschirm; Monat und Rückblick liegen darunter.
//                                       PC: x, y, w, h, Kante      Handy: x, y, w, h, Kante   frei
export const werkszustand: readonly KachelPlan[] = [
  k('gruss', 'Gruß', [0, 0, 34, 5], [0, 0, 2, 2], true),
  k('wetter', 'Wetter', [17, 0, 17, 10, 'r'], [1, 4, 1, 3], true),
  k('uhr', 'Uhr', [0, 0, 17, 10, 'r'], [0, 4, 1, 3], true),
  k('naechstes', 'Als Nächstes', [0, 5, 34, 14], [0, 2, 2, 2], true),
  k('knoepfe', 'Knöpfe', [0, 10, 17, 5, 'r'], null, true),
  k('braucht', 'Braucht dich', [0, 10, 34, 5, 'u'], [0, 3, 2, 2, 'u']),
  k('monat', 'Monat', [0, 0, 8, 10, 'u'], [0, 12, 1, 2]),
  k('woche', 'Woche', [8, 0, 38, 10, 'u'], [0, 0, 2, 3, 'u']),
  k('notiz', 'Notiz', [8, 0, 8, 10, 'ur'], null),
  k('rueckblick', 'Wochenrückblick', [0, 0, 8, 10, 'ur'], [1, 12, 1, 2]),
]
