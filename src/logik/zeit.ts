// Die eine Stelle für Datumsrechnung und Zeit-Texte, die auch die Logik braucht (PRUEFUNG E3).
// Gerechnet wird mit date-fns in Ortszeit; Anzeige-Formate für die Oberfläche stehen in `geruest/format.ts`.
import { eachDayOfInterval, endOfMonth, format, formatISO, isValid, parse, startOfMonth } from 'date-fns'

const SCHLUESSEL = 'yyyy-MM-dd'

/** Uhrzeit als „HH:MM“ (24 Stunden); nimmt Date, ms oder ISO-Text. */
export const uhrzeit = (d: Date | number | string) => format(d, 'HH:mm')

/** Ortstag als „JJJJ-MM-TT“ (`formatISO` statt `format`: achtmal schneller, die Seite Heute braucht ihn oft). */
export const tagSchluessel = (d: Date | number) => formatISO(d, { representation: 'date' })

/** Liest „JJJJ-MM-TT“ als Ortstag (Mitternacht); null, wenn das Datum nicht eindeutig ist. */
export function ausSchluessel(text: string): Date | null {
  const d = parse(text, SCHLUESSEL, new Date())
  return isValid(d) && tagSchluessel(d) === text ? d : null
}

/** Alle Tage des Monats von `d` als Mitternächte. */
export const monatsTage = (d: Date) => eachDayOfInterval({ start: startOfMonth(d), end: endOfMonth(d) })
