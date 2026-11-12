import type { KachelPlan } from '../../logik/kacheln'

// Kacheln der Seite Heute ab Werk, je Geräteart. Gruß, Überschrift, Uhr und „Braucht dich" stehen fest darüber.
export const werkszustand: readonly KachelPlan[] = [
  { id: 'woche', name: 'Woche', min: { pc: { w: 4, h: 3 }, handy: { w: 2, h: 3 } }, werk: { pc: { x: 0, y: 0, w: 7, h: 3 }, handy: { x: 0, y: 0, w: 2, h: 3 } } },
]
