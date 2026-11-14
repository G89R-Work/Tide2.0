// Kalender (docs/konzept/12-kalender.md): Kalenderwoche je Zeile, Termine je Tag und die Stunden der Wochenansicht. Das Raster selbst ist `monatsRaster` (logik/heute.ts).
import { addDays, differenceInMinutes, getISOWeek, max, min, startOfDay } from 'date-fns'
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

/** Stunden, die die Woche ohne Termine zeigt: von 7 bis 20 Uhr. */
const STUNDEN_AB_WERK: readonly [number, number] = [7, 20]

/** Erste und letzte Stunde der Wochenansicht: ab Werk 7–20 Uhr, auf volle Stunden geweitet, bis jeder Termin dieser Tage hineinpasst. */
export function stundenBereich(liste: readonly Eintrag[], tage: readonly Date[]): [number, number] {
  let [von, bis] = STUNDEN_AB_WERK
  for (const tag of tage) {
    const anfang = startOfDay(tag)
    const ende = addDays(anfang, 1)
    for (const e of termineAm(liste, tag)) {
      von = Math.min(von, Math.floor(differenceInMinutes(max([new Date(e.beginn ?? anfang), anfang]), anfang) / 60))
      bis = Math.max(bis, Math.ceil(differenceInMinutes(min([new Date(e.ende ?? ende), ende]), anfang) / 60))
    }
  }
  return [von, bis]
}

/** Was ein Wischen in der Monats- oder Wochenkachel bewirkt: waagrecht die Ansicht wechseln, senkrecht blättern (+1 vor, −1 zurück).
 *  Zählt ein schnelles Wischen (`swipe` aus @use-gesture) oder ein Zug weiter als `grenze` mal die Größe der Kachel. */
export function wischZiel(weg: readonly [number, number], swipe: readonly [number, number], groesse: readonly [number, number], grenze: number): 'ansicht' | number | null {
  const waagrecht = Math.abs(weg[0]) > Math.abs(weg[1])
  const i = waagrecht ? 0 : 1
  const richtung = swipe[i] !== 0 ? swipe[i] : Math.abs(weg[i]) > groesse[i] * grenze ? Math.sign(weg[i]) : 0
  if (!richtung) return null
  return waagrecht ? 'ansicht' : -richtung
}
