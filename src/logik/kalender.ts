// Kalender (docs/konzept/12-kalender.md): Kalenderwoche je Zeile und Termine je Tag. Das Raster selbst ist `monatsRaster` (logik/heute.ts).
import { addDays, getISOWeek, startOfDay } from 'date-fns'
import type { Eintrag } from '../vertrag/eintrag'
import { termineImZeitraum } from './gezeiten'

/** ISO-Kalenderwoche einer Wochenzeile; der Mittwoch liegt bei Montag- wie Sonntag-Beginn sicher in ihr. */
export function kalenderwoche(zeile: readonly Date[]): number {
  const mitte = zeile[3]
  if (!mitte) throw new Error('Wochenzeile braucht sieben Tage')
  return getISOWeek(mitte)
}

/** Termine (mit Uhrzeit), die in den Tag ragen, nach Beginn. */
export function termineAm(liste: readonly Eintrag[], tag: Date): Eintrag[] {
  const von = startOfDay(tag)
  return termineImZeitraum(liste, von, addDays(von, 1)).sort((a, b) => (a.beginn ?? '').localeCompare(b.beginn ?? ''))
}
