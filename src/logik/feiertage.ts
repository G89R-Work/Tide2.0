import Holidays from 'date-holidays'

// Gesetzliche Feiertage in Deutschland je Bundesland (Baustein date-holidays, Daten CC-BY-SA 4.0).
// `land` ist das Kürzel der Einstellung „Bundesland“ (`bw`, `by`, …) oder `bund` für nur bundesweite.
const merker = new Map<string, Map<string, string>>()

/** Feiertage eines Jahres als „JJJJ-MM-TT“ (Tag in Deutschland) → Name. Ein unbekanntes Kürzel ergibt die bundesweiten. */
export function feiertage(jahr: number, land: string): Map<string, string> {
  const schluessel = `${jahr}-${land}`
  const fertig = merker.get(schluessel)
  if (fertig) return fertig
  const opts = { types: ['public' as const], languages: 'de' }
  const mitLand = land !== 'bund' && land.toUpperCase() in new Holidays().getStates('DE')
  const h = mitLand ? new Holidays('DE', land.toUpperCase(), opts) : new Holidays('DE', opts)
  const liste = new Map(h.getHolidays(jahr, 'de').map((f) => [f.date.slice(0, 10), f.name]))
  merker.set(schluessel, liste)
  return liste
}
