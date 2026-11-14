// To-dos (docs/konzept/13-todos.md): Gruppen nach Fälligkeit, Frist beim Ziehen, Eingabezeile, Unterpunkte der zweiten Ebene.
import { addDays, differenceInCalendarDays, endOfWeek, isAfter, startOfDay, startOfWeek } from 'date-fns'
import type { Eintrag } from '../vertrag/eintrag'
import { ausSchluessel, tagSchluessel } from './zeit'

export const gruppenIds = ['ueberfaellig', 'heute', 'woche', 'spaeter', 'irgendwann'] as const
export type GruppeId = (typeof gruppenIds)[number]
export const gruppenNamen: Record<GruppeId, string> = { ueberfaellig: 'Überfällig', heute: 'Heute', woche: 'Diese Woche', spaeter: 'Später', irgendwann: 'Irgendwann' }

const ab = { weekStartsOn: 1 } as const

/** Gruppe eines To-dos am Tag von `jetzt`; „Diese Woche“ reicht bis Sonntag. */
export function gruppeVon(e: Eintrag, jetzt: Date): GruppeId {
  const frist = e.frist ? ausSchluessel(e.frist) : null
  if (!frist) return 'irgendwann'
  const tage = differenceInCalendarDays(frist, jetzt)
  if (tage < 0) return 'ueberfaellig'
  if (tage === 0) return 'heute'
  return isAfter(frist, endOfWeek(jetzt, ab)) ? 'spaeter' : 'woche'
}

/** Alle fünf Gruppen in ihrer Reihenfolge, je nach Frist sortiert (ohne Frist: nach Anlage). */
export function gruppen(liste: readonly Eintrag[], jetzt: Date): { id: GruppeId; liste: Eintrag[] }[] {
  const sortiert = [...liste].sort((a, b) => (a.frist ?? '').localeCompare(b.frist ?? '') || a.erstellt.localeCompare(b.erstellt))
  return gruppenIds.map((id) => ({ id, liste: sortiert.filter((e) => gruppeVon(e, jetzt) === id) }))
}

/** Neue Frist, wenn ein To-do in diese Gruppe gezogen wird: „JJJJ-MM-TT“, `null` für keine, `undefined` wenn die Gruppe kein Ziel ist. */
export function fristFuer(gruppe: GruppeId, jetzt: Date): string | null | undefined {
  const heute = startOfDay(jetzt)
  const morgen = addDays(heute, 1)
  if (gruppe === 'heute') return tagSchluessel(heute)
  if (gruppe === 'woche') return isAfter(morgen, endOfWeek(jetzt, ab)) ? undefined : tagSchluessel(morgen)
  if (gruppe === 'spaeter') return tagSchluessel(addDays(startOfWeek(jetzt, ab), 7))
  if (gruppe === 'irgendwann') return null
  return undefined
}

const fristWoerter: Record<string, number> = { heute: 0, morgen: 1, übermorgen: 2 }
const wortMuster = /(?<![\p{L}\d])(heute|übermorgen|morgen)(?![\p{L}\d])/iu

/** Eingabezeile: „heute“, „morgen“, „übermorgen“ als ganzes Wort setzen die Frist und fallen aus dem Titel. Ohne Titel `null`. */
export function ausEingabe(text: string, jetzt: Date): { titel: string; frist?: string } | null {
  const treffer = wortMuster.exec(text)
  const titel = (treffer ? text.replace(treffer[0], ' ') : text).replace(/\s+/g, ' ').trim()
  if (!titel) return null
  if (!treffer) return { titel }
  return { titel, frist: tagSchluessel(addDays(startOfDay(jetzt), fristWoerter[treffer[1]!.toLowerCase()] ?? 0)) }
}

/** Gehört das To-do in den Unterpunkt der zweiten Ebene? Archiv: nur Erledigtes; sonst nur Offenes. */
export function imUnterpunkt(e: Eintrag, unter: string | null | undefined): boolean {
  if (e.art !== 'aufgabe') return false
  if (unter === 'archiv') return e.erledigt
  if (e.erledigt) return false
  switch (unter) {
    case 'eigene':
      return !e.herkunft
    case 'mails':
      return e.herkunft === 'mail'
    case 'rueckrufe':
      return e.herkunft === 'rueckruf'
    case 'rechnungen':
      return e.herkunft === 'rechnung'
    case 'arbeit':
      return e.raum === 'arbeit'
    case 'privat':
      return e.raum !== 'arbeit'
    default:
      return true
  }
}
