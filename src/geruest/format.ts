// Anzeige von Datum und Uhrzeit für die Oberfläche, alles über date-fns auf Deutsch.
// Rechnungen und Zeit-Texte der Logik stehen in `logik/zeit.ts`; `uhrzeit` kommt von dort.
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export { datumLang, dauerText, mailZeit, uhrzeit, versatzText } from '../logik/zeit'

const f = (muster: string) => (d: Date) => format(d, muster, { locale: de })

export const tagLang = f('EEEE, d. MMMM')
export const tagKurz = f('EEEEEE')
export const stundeKurz = f('HH')
export const monatName = f('LLLL')
export const monatKurz = f('LLL')

const zahlFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 })
/** Zahl auf Deutsch mit höchstens einer Nachkommastelle: „6,4“. */
export const zahl = (x: number) => zahlFormat.format(x)
