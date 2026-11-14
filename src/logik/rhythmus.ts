// Rhythmus-Baukasten für den Schichtplan (docs/konzept/17-arbeit.md): Schichtarten, Wochenmuster, Abfolge, Startdatum, Ausnahmen.
// Reine Rechnung in Ortszeit; Tage als „JJJJ-MM-TT“. Eigenbau, weil es nur wenige Zeilen sind (siehe Konzept).
import { addDays, differenceInCalendarDays, set, startOfDay, startOfWeek } from 'date-fns'
import type { Ausnahme, Ausnahmeart, Rhythmus, Schichtart } from '../vertrag/arbeit'
import { ausSchluessel, tagSchluessel } from './zeit'

export type { Abschnitt, Ausnahme, Ausnahmeart, Rhythmus, Schichtart, Wochenmuster } from '../vertrag/arbeit'

export type Schicht = { art: Schichtart; beginn: Date; ende: Date; ausnahme?: Ausnahmeart }
export type VorschauTag = { tag: Date; schicht: Schicht | null; ausnahme?: Ausnahmeart }

const ab = { weekStartsOn: 1 } as const

/** „HH:MM“ an diesem Tag in Ortszeit. */
const um = (tag: Date, hhmm: string) => {
  const [hours = 0, minutes = 0] = hhmm.split(':').map(Number)
  return set(tag, { hours, minutes, seconds: 0, milliseconds: 0 })
}

/** Schichtart laut Abfolge an diesem Tag, ohne Ausnahmen; vor dem Start oder ohne Abfolge nichts. */
function ausAbfolge(r: Rhythmus, tag: Date, start: Date): string | null {
  const summe = r.abfolge.reduce((n, a) => n + a.wochen, 0)
  if (tag < start || summe <= 0) return null
  const woche = differenceInCalendarDays(startOfWeek(tag, ab), startOfWeek(start, ab)) / 7
  let rest = woche % summe
  const abschnitt = r.abfolge.find((a) => (rest -= a.wochen) < 0)
  const muster = r.muster.find((m) => m.id === abschnitt?.muster)
  return muster?.tage[(tag.getDay() + 6) % 7] ?? null
}

/** Der Tag mit Schicht (Beginn, Ende in Ortszeit) und Ausnahme. */
function tagIm(r: Rhythmus, tag: Date): VorschauTag {
  const start = ausSchluessel(r.start)
  if (!start) throw new Error(`Startdatum ${r.start} ist kein Tag (JJJJ-MM-TT)`)
  const ausnahme = r.ausnahmen.find((a) => a.tag === tagSchluessel(tag))
  const id = ausnahme ? (ausnahme.art === 'tausch' || ausnahme.art === 'zusatz' ? (ausnahme.schicht ?? null) : null) : ausAbfolge(r, tag, start)
  const art = id === null ? undefined : r.arten.find((a) => a.id === id)
  if (id !== null && !art) throw new Error(`Schichtart ${id} fehlt im Rhythmus`)
  const mit = ausnahme ? { ausnahme: ausnahme.art } : {}
  if (!art) return { tag, schicht: null, ...mit }
  const beginn = um(tag, art.beginn)
  const ende = um(art.ende > art.beginn ? tag : addDays(tag, 1), art.ende)
  return { tag, schicht: { art, beginn, ende, ...mit }, ...mit }
}

/** Schicht an diesem Tag (Ortszeit) oder `null` für frei. */
export function schichtAm(r: Rhythmus, tag: Date): Schicht | null {
  return tagIm(r, startOfDay(tag)).schicht
}

/** Tag für Tag ab dem Montag der Woche von `ab`, ab Werk acht Wochen (Vorschau vor dem Speichern). */
export function vorschau(r: Rhythmus, abTag: Date, wochen = 8): VorschauTag[] {
  const montag = startOfWeek(abTag, ab)
  return Array.from({ length: wochen * 7 }, (_, i) => tagIm(r, addDays(montag, i)))
}

// ── Bearbeiten im Baukasten: jede Funktion liefert einen neuen Rhythmus, der wieder in sich stimmt.

/** Setzt die Ausnahme an diesem Tag (ersetzt eine vorhandene); `null` entfernt sie. */
export function mitAusnahme(r: Rhythmus, tag: Date, ausnahme: Omit<Ausnahme, 'tag'> | null): Rhythmus {
  const s = tagSchluessel(tag)
  const rest = r.ausnahmen.filter((a) => a.tag !== s)
  return { ...r, ausnahmen: ausnahme ? [...rest, { tag: s, ...ausnahme }] : rest }
}

/** Ohne diese Schichtart: ihre Tage im Muster werden frei, Ausnahmen mit ihr fallen weg. */
export function ohneArt(r: Rhythmus, id: string): Rhythmus {
  return {
    ...r,
    arten: r.arten.filter((a) => a.id !== id),
    muster: r.muster.map((m) => ({ ...m, tage: m.tage.map((t) => (t === id ? null : t)) })),
    ausnahmen: r.ausnahmen.filter((a) => a.schicht !== id),
  }
}

/** Ohne dieses Wochenmuster und seine Abschnitte in der Abfolge. */
export function ohneMuster(r: Rhythmus, id: string): Rhythmus {
  return { ...r, muster: r.muster.filter((m) => m.id !== id), abfolge: r.abfolge.filter((a) => a.muster !== id) }
}

/** `basis`, oder mit Zähler „basis-2“, „basis-3“ …, bis keine der `ids` gleich ist. */
export function neueId(ids: readonly string[], basis: string): string {
  let id = basis
  for (let n = 2; ids.includes(id); n++) id = `${basis}-${n}`
  return id
}
