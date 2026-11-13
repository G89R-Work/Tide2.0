// Fakt zur Stunde für die Karte hinter der Uhr (docs/konzept/10-heute.md): nur aus berechneten Werten, ohne KI.
import { addDays, differenceInMinutes, getDayOfYear, getISOWeek, set } from 'date-fns'
import { himmel, type Standort } from './himmel'
import { dauerText, uhrzeit } from './zeit'

export type FaktId = 'tageslicht' | 'sonnenhoehe' | 'jahrestag' | 'tageslaenge' | 'vollmond'
export type Fakt = { id: FaktId; text: string }

/** Länge eines synodischen Monats (Neumond bis Neumond) in Tagen. */
const MONDMONAT = 29.530588853

const mittag = (d: Date) => set(d, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 })

/** Minuten zwischen Auf- und Untergang am Tag von `d`; null in Polarnacht und Polartag. */
function tagMinuten(d: Date, ort: Standort): number | null {
  const h = himmel(mittag(d), ort, 'bogen')
  return h.aufgang && h.untergang ? differenceInMinutes(h.untergang, h.aufgang) : null
}

function tageslicht(jetzt: Date, ort: Standort): string | null {
  const { aufgang, untergang } = himmel(jetzt, ort, 'bogen')
  if (!aufgang || !untergang) return null
  if (jetzt < aufgang) return `Die Sonne geht um ${uhrzeit(aufgang)} auf`
  if (jetzt >= untergang) return `Die Sonne ist um ${uhrzeit(untergang)} untergegangen`
  return `Noch ${dauerText(differenceInMinutes(untergang, jetzt))} Tageslicht`
}

function sonnenhoehe(jetzt: Date, ort: Standort): string {
  const grad = Math.round(himmel(jetzt, ort, 'bogen').sonnenHoehe)
  if (grad === 0) return 'Die Sonne steht am Horizont'
  return `Die Sonne steht ${Math.abs(grad)} Grad ${grad > 0 ? 'über' : 'unter'} dem Horizont`
}

function tageslaenge(jetzt: Date, ort: Standort): string | null {
  const heute = tagMinuten(jetzt, ort)
  const gestern = tagMinuten(addDays(jetzt, -1), ort)
  if (heute === null || gestern === null) return null
  const d = heute - gestern
  if (d === 0) return 'Der Tag ist heute so lang wie gestern'
  return `Der Tag ist heute ${Math.abs(d)} ${Math.abs(d) === 1 ? 'Minute' : 'Minuten'} ${d > 0 ? 'länger' : 'kürzer'} als gestern`
}

function vollmond(jetzt: Date): string {
  const phase = himmel(jetzt, { breite: 0, laenge: 0 }, 'bogen').mond.phase
  // Kurz nach Vollmond ergibt die Rechnung fast einen ganzen Mondmonat: dann ist heute Vollmond.
  const tage = Math.round(((0.5 - phase + 1) % 1) * MONDMONAT)
  if (tage === 0 || tage === Math.round(MONDMONAT)) return 'Heute ist Vollmond'
  return tage === 1 ? 'Morgen ist Vollmond' : `In ${tage} Tagen ist Vollmond`
}

/** Alle Fakten, die sich für Zeitpunkt und Ort sicher berechnen lassen. Was nicht geht (etwa in der Polarnacht), fehlt. */
export function fakten(jetzt: Date, ort: Standort): Fakt[] {
  const liste: { id: FaktId; text: string | null }[] = [
    { id: 'tageslicht', text: tageslicht(jetzt, ort) },
    { id: 'sonnenhoehe', text: sonnenhoehe(jetzt, ort) },
    { id: 'jahrestag', text: `Tag ${getDayOfYear(jetzt)} des Jahres, Kalenderwoche ${getISOWeek(jetzt)}` },
    { id: 'tageslaenge', text: tageslaenge(jetzt, ort) },
    { id: 'vollmond', text: vollmond(jetzt) },
  ]
  return liste.filter((f): f is Fakt => f.text !== null)
}

/** Der Fakt der laufenden Stunde: jede Stunde der nächste aus der Liste. */
export function faktZurStunde(jetzt: Date, ort: Standort): Fakt {
  const liste = fakten(jetzt, ort)
  return liste[jetzt.getHours() % liste.length]
}

/** Name der Mondphase (Phase 0 bis 1 wie in `himmel`). */
export function mondphase(phase: number): string {
  const namen: readonly [bis: number, name: string][] = [
    [0.03, 'Neumond'], [0.22, 'Zunehmende Sichel'], [0.28, 'Erstes Viertel'], [0.47, 'Zunehmender Mond'],
    [0.53, 'Vollmond'], [0.72, 'Abnehmender Mond'], [0.78, 'Letztes Viertel'], [0.97, 'Abnehmende Sichel'],
  ]
  return namen.find(([bis]) => phase < bis)?.[1] ?? 'Neumond'
}
