// Meldungen der Gezeitenkurve (docs/konzept/06-gezeitenkurve.md, 03-geruest.md „Meldungen").
// Eine Meldung kommt an, steht kurz in der Kopfzeile und faltet sich dann in die Glocke.
// Im Ebbe-Modus warten Meldungen aus der Ruhezeit (22:30 bis 7:00) bis zur Flut am Morgen; Wichtiges nie.
import { addDays, set, startOfDay } from 'date-fns'
import type { Eintrag } from '../vertrag/eintrag'
import { uhrzeit as uhr } from './zeit'

export type Meldung = { id: string; text: string; /** ms seit 1970 */ ankunft: number; wichtig?: boolean }

const RUHE_VON = 22 * 60 + 30
const RUHE_BIS = 7 * 60
/** Freie Zeit ab so vielen Minuten heißt Ebbe. */
const EBBE_AB_MIN = 45
/** So viele Minuten vor Beginn meldet sich ein Termin. */
const VORLAUF_MIN = 15
const MIN_MS = 60_000

/** Ende der Ruhezeit am Tag von `d` (Ortszeit, auch an Tagen mit Zeitumstellung). */
const ruheEnde = (d: Date) => set(startOfDay(d), { hours: Math.floor(RUHE_BIS / 60), minutes: RUHE_BIS % 60 })
/** „07:00“: bis dahin warten Meldungen im Ebbe-Modus. */
export const ruheBisText = uhr(ruheEnde(new Date(0)))

export function inRuhezeit(d: Date): boolean {
  const m = d.getHours() * 60 + d.getMinutes()
  return m >= RUHE_VON || m < RUHE_BIS
}

/** Ab wann die Meldung erscheint: sofort, oder im Ebbe-Modus nach der Ruhezeit um 7:00 (Ortszeit). */
export function zeigeAb(m: Meldung, ebbeModus: boolean): number {
  const an = new Date(m.ankunft)
  if (!ebbeModus || m.wichtig || !inRuhezeit(an)) return m.ankunft
  const abends = an.getHours() * 60 + an.getMinutes() >= RUHE_VON
  return ruheEnde(abends ? addDays(an, 1) : an).getTime()
}

/** Angekommene Meldungen, die neueste zuerst. */
export function sichtbare(liste: readonly Meldung[], jetzt: Date, ebbeModus: boolean): Meldung[] {
  return liste
    .filter((m) => zeigeAb(m, ebbeModus) <= jetzt.getTime())
    .sort((a, b) => zeigeAb(b, ebbeModus) - zeigeAb(a, ebbeModus))
}

/** Meldungen, die noch bis zum Morgen warten. */
export function wartende(liste: readonly Meldung[], jetzt: Date, ebbeModus: boolean): Meldung[] {
  return liste.filter((m) => zeigeAb(m, ebbeModus) > jetzt.getTime())
}

/** Zahl an der Glocke: was erschienen ist, seit sie zuletzt geöffnet wurde. */
export function ungelesen(liste: readonly Meldung[], jetzt: Date, ebbeModus: boolean, gelesenBis: number): number {
  return sichtbare(liste, jetzt, ebbeModus).filter((m) => zeigeAb(m, ebbeModus) > gelesenBis).length
}

/** Termine, die in den nächsten 15 Minuten beginnen, als Meldung. Die Kennung hängt am Beginn: verschoben meldet er sich neu. */
export function erinnerungen(termine: readonly Eintrag[], jetzt: Date): Meldung[] {
  return termine.flatMap((t) => {
    if (t.erledigt || !t.beginn) return []
    const beginn = new Date(t.beginn)
    const ankunft = beginn.getTime() - VORLAUF_MIN * MIN_MS
    if (jetzt.getTime() < ankunft || jetzt.getTime() >= beginn.getTime()) return []
    return [{ id: `erinnerung:${t.id}:${t.beginn}`, text: `Gleich: „${t.titel}“ um ${uhr(beginn)}`, ankunft }]
  })
}

/** „Gerade Flut · Ebbe ab 12:00" oder „Gerade Ebbe · Nächste Flut 14:00" (wie die Vorlage): Termine sind Flut, freie Zeit ab 45 Minuten Ebbe. Blickt 24 Stunden voraus. */
export function ebbeFenster(termine: readonly { beginn: Date; ende: Date }[], jetzt: Date): string {
  const t = jetzt.getTime()
  const horizont = t + 24 * 60 * MIN_MS
  // Belegte Zeiten ab jetzt, sortiert und verbunden.
  const belegt: [number, number][] = []
  for (const z of [...termine].sort((a, b) => a.beginn.getTime() - b.beginn.getTime())) {
    const [von, bis] = [z.beginn.getTime(), z.ende.getTime()]
    if (bis <= t || von >= horizont) continue
    const letzte = belegt.at(-1)
    if (letzte && von <= letzte[1]) letzte[1] = Math.max(letzte[1], bis)
    else belegt.push([von, bis])
  }
  // Freie Abschnitte zwischen den belegten; vor dem ersten und nach dem letzten offen.
  const frei: [number, number][] = []
  let ab = -Infinity
  for (const [von, bis] of belegt) {
    if (von > ab) frei.push([ab, von])
    ab = bis
  }
  frei.push([ab, Infinity])
  const lang = (f: [number, number]) => f[1] - Math.max(f[0], t) >= EBBE_AB_MIN * MIN_MS || f[1] === Infinity
  const hier = frei.find(([von, bis]) => von <= t && t < bis)
  if (hier && lang(hier)) return hier[1] === Infinity ? 'Gerade Ebbe' : `Gerade Ebbe · Nächste Flut ${uhr(new Date(hier[1]))}`
  const naechste = frei.find((f) => f[0] > t && lang(f))
  return naechste && naechste[0] < horizont ? `Gerade Flut · Ebbe ab ${uhr(new Date(naechste[0]))}` : 'Gerade Flut'
}
