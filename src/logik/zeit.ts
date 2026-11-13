// Die eine Stelle für Datumsrechnung und Zeit-Texte, die auch die Logik braucht (PRUEFUNG E3).
// Gerechnet wird mit date-fns in Ortszeit; Anzeige-Formate für die Oberfläche stehen in `geruest/format.ts`.
import { differenceInCalendarDays, eachDayOfInterval, endOfMonth, format, formatISO, isSameYear, isValid, parse, startOfMonth } from 'date-fns'
import { de } from 'date-fns/locale'

const SCHLUESSEL = 'yyyy-MM-dd'

const zonenUhr = (zone: string) => new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: zone })

/** Uhrzeit als „HH:MM“ (24 Stunden); nimmt Date, ms oder ISO-Text. Mit `zone` (IANA, etwa „Asia/Tokyo“) die Uhrzeit dort. */
export const uhrzeit = (d: Date | number | string, zone?: string) => (zone ? zonenUhr(zone).format(new Date(d)) : format(d, 'HH:mm'))

/** Abstand der Zeitzone zu UTC in Minuten zum Zeitpunkt `d` (mit Sommerzeit), östlich positiv. */
export function versatzMinuten(d: Date, zone: string): number {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' }).formatToParts(d).find((t) => t.type === 'timeZoneName')?.value ?? ''
  const m = /^GMT([+-])(\d\d):(\d\d)$/.exec(name)
  if (!m) return 0 // „GMT“ ohne Zusatz: genau UTC
  return (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]))
}

/** Dauer als „3 Std. 20 Min.“, „2 Std.“ oder „45 Min.“. */
export function dauerText(minuten: number): string {
  const h = Math.floor(minuten / 60)
  const m = minuten % 60
  if (h === 0) return `${m} Min.`
  return m === 0 ? `${h} Std.` : `${h} Std. ${m} Min.`
}

/** Ortstag als „JJJJ-MM-TT“ (`formatISO` statt `format`: achtmal schneller, die Seite Heute braucht ihn oft). */
export const tagSchluessel = (d: Date | number) => formatISO(d, { representation: 'date' })

/** Liest „JJJJ-MM-TT“ als Ortstag (Mitternacht); null, wenn das Datum nicht eindeutig ist. */
export function ausSchluessel(text: string): Date | null {
  const d = parse(text, SCHLUESSEL, new Date())
  return isValid(d) && tagSchluessel(d) === text ? d : null
}

/** Alle Tage des Monats von `d` als Mitternächte. */
export const monatsTage = (d: Date) => eachDayOfInterval({ start: startOfMonth(d), end: endOfMonth(d) })

/** Abstand zweier Uhren als „+8 Std.“, „−4 Std. 30 Min.“ oder „gleiche Zeit“. */
export function versatzText(minuten: number): string {
  if (minuten === 0) return 'gleiche Zeit'
  return `${minuten > 0 ? '+' : '−'}${dauerText(Math.abs(minuten))}`
}

/** „Freitag, 13. November 2026“ (auch im Zitat einer Antwort). */
export const datumLang = (d: Date | string) => format(d, 'EEEE, d. MMMM yyyy', { locale: de })

/** Kurze Zeit einer Mail: heute „HH:MM“, „gestern“, in den letzten sieben Tagen der Wochentag, sonst „7. Nov.“ oder mit Jahr „24.12.25“. */
export function mailZeit(d: Date | string, jetzt: Date): string {
  const tage = differenceInCalendarDays(jetzt, d)
  if (tage <= 0) return format(d, 'HH:mm')
  if (tage === 1) return 'gestern'
  if (tage < 7) return format(d, 'EEEEEE', { locale: de })
  return isSameYear(d, jetzt) ? format(d, 'd. MMM', { locale: de }) : format(d, 'dd.MM.yy')
}
