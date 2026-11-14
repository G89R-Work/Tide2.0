// Rhythmus-Baukasten für den Schichtplan (docs/konzept/17-arbeit.md): Schichtarten, Wochenmuster, Abfolge, Startdatum, Ausnahmen.
// Reine Rechnung in Ortszeit; Tage als „JJJJ-MM-TT“. Eigenbau, weil es nur wenige Zeilen sind (siehe Konzept).
import { addDays, differenceInCalendarDays, set, startOfDay, startOfWeek } from 'date-fns'
import { ausSchluessel, tagSchluessel } from './zeit'

export type Schichtart = { id: string; name: string; /** „HH:MM“ */ beginn: string; /** „HH:MM“; nicht nach dem Beginn heißt: am Folgetag */ ende: string; farbe: string }
/** Montag bis Sonntag je eine Schichtart (id) oder `null` für frei. */
export type Wochenmuster = { id: string; name: string; tage: readonly (string | null)[] }
/** Ein Wochenmuster läuft so viele Wochen; nach dem letzten Abschnitt beginnt die Abfolge von vorn. */
export type Abschnitt = { muster: string; wochen: number }
export type Ausnahmeart = 'tausch' | 'urlaub' | 'krank' | 'zusatz'
/** Überschreibt den Rhythmus nur an `tag`. Tausch und Zusatzschicht nennen die Schichtart (Tausch ohne: frei). */
export type Ausnahme = { tag: string; art: Ausnahmeart; schicht?: string }
export type Rhythmus = {
  arten: readonly Schichtart[]
  muster: readonly Wochenmuster[]
  abfolge: readonly Abschnitt[]
  /** Erster Tag des Plans; seine Woche ist die erste Woche der Abfolge. */
  start: string
  ausnahmen: readonly Ausnahme[]
}

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
