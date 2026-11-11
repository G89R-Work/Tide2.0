// Die Bereiche von Tide in ihrer Reihenfolge (Entscheidung: neun Bereiche und die Einstellungen).
// Jeder Bereich ist unter #<id> erreichbar.

export const bereiche = [
  { id: 'heute', name: 'Heute' },
  { id: 'postfach', name: 'Postfach' },
  { id: 'kalender', name: 'Kalender' },
  { id: 'todos', name: 'To-dos' },
  { id: 'einkauf', name: 'Einkauf' },
  { id: 'kochen', name: 'Kochen' },
  { id: 'finanzen', name: 'Finanzen' },
  { id: 'arbeit', name: 'Arbeit' },
  { id: 'notizen', name: 'Notizen' },
  { id: 'einstellungen', name: 'Einstellungen' },
] as const

export type BereichId = (typeof bereiche)[number]['id']

const ids: ReadonlySet<string> = new Set(bereiche.map((b) => b.id))

/** Sprungmarke wie „#postfach" → Bereich. Leer oder unbekannt führt zu Heute. */
export function bereichAusMarke(marke: string): BereichId {
  const id = marke.replace(/^#/, '')
  return ids.has(id) ? (id as BereichId) : 'heute'
}

