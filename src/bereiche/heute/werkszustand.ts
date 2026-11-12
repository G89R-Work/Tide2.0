import type { KachelPlan } from '../../logik/kacheln'

// Kacheln der Seite Heute ab Werk, je Geräteart (docs/konzept/10-heute.md). Text steht ohne Hintergrund auf dem Himmel.
// null: auf diesem Gerät ab Werk ausgeblendet (die Knöpfe hat das Handy in seiner oberen Leiste).
const k = (id: string, name: string, minPc: [number, number], minHandy: [number, number], pc: [number, number, number, number] | null, handy: [number, number, number, number] | null, frei = false): KachelPlan => ({
  id,
  name,
  titel: false,
  ...(frei ? { hintergrund: false as const } : {}),
  min: { pc: { w: minPc[0], h: minPc[1] }, handy: { w: minHandy[0], h: minHandy[1] } },
  werk: {
    pc: pc && { x: pc[0], y: pc[1], w: pc[2], h: pc[3] },
    handy: handy && { x: handy[0], y: handy[1], w: handy[2], h: handy[3] },
  },
})

//                 Kennung        Name              min PC  min Handy  PC: x, y, w, h     Handy: x, y, w, h  frei
export const werkszustand: readonly KachelPlan[] = [
  k('gruss', 'Gruß', [3, 1], [2, 1], [0, 0, 6, 1], [0, 0, 2, 1], true),
  k('wetter', 'Wetter', [2, 2], [1, 2], [6, 0, 3, 2], [1, 3, 1, 2], true),
  k('uhr', 'Uhr', [2, 2], [1, 2], [9, 0, 3, 2], [0, 3, 1, 2], true),
  k('naechstes', 'Als Nächstes', [3, 2], [2, 2], [0, 1, 6, 3], [0, 1, 2, 2], true),
  k('knoepfe', 'Knöpfe', [2, 1], [1, 1], [9, 2, 3, 1], null, true),
  k('braucht', 'Braucht dich', [3, 1], [2, 1], [0, 4, 6, 1], [0, 5, 2, 1]),
  k('monat', 'Monat', [1, 2], [1, 1], [0, 5, 1, 2], [0, 8, 1, 1]),
  k('woche', 'Woche', [4, 2], [2, 2], [1, 5, 7, 2], [0, 6, 2, 2]),
  k('notiz', 'Notiz', [1, 2], [1, 1], [8, 5, 1, 2], null),
  k('rueckblick', 'Wochenrückblick', [1, 2], [1, 1], [9, 5, 1, 2], [1, 8, 1, 1]),
]
