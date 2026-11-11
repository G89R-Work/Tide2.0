import type { KachelPlan } from '../../logik/kacheln'

// Kacheln der Seite Heute ab Werk, je Geräteart. Die echten Inhalte kommen mit den Scheiben der Seite Heute.
export const werkszustand: readonly KachelPlan[] = [
  { id: 'gruss', name: 'Heute', min: { pc: { w: 3, h: 2 }, handy: { w: 1, h: 2 } }, werk: { pc: { x: 0, y: 0, w: 8, h: 2 }, handy: { x: 0, y: 0, w: 2, h: 2 } } },
  { id: 'liste', name: 'Beispielliste', min: { pc: { w: 3, h: 3 }, handy: { w: 1, h: 3 } }, werk: { pc: { x: 8, y: 0, w: 4, h: 6 }, handy: { x: 0, y: 2, w: 2, h: 5 } } },
  { id: 'termine', name: 'Termine', min: { pc: { w: 2, h: 2 }, handy: { w: 1, h: 2 } }, werk: { pc: { x: 0, y: 2, w: 4, h: 4 }, handy: { x: 0, y: 7, w: 1, h: 3 } } },
  { id: 'todos', name: 'To-dos', min: { pc: { w: 2, h: 2 }, handy: { w: 1, h: 2 } }, werk: { pc: { x: 4, y: 2, w: 4, h: 4 }, handy: { x: 1, y: 7, w: 1, h: 3 } } },
  { id: 'notiz', name: 'Notiz', min: { pc: { w: 2, h: 2 }, handy: { w: 1, h: 2 } }, werk: { pc: { x: 0, y: 6, w: 12, h: 2 }, handy: { x: 0, y: 10, w: 2, h: 2 } } },
]
