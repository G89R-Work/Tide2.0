// Anzeige von Datum und Uhrzeit für die Oberfläche, alles über date-fns auf Deutsch.
// Rechnungen und Zeit-Texte der Logik stehen in `logik/zeit.ts`; `uhrzeit` kommt von dort.
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export { uhrzeit } from '../logik/zeit'

const f = (muster: string) => (d: Date) => format(d, muster, { locale: de })

export const datumLang = f('EEEE, d. MMMM yyyy')
export const tagLang = f('EEEE, d. MMMM')
export const tagKurz = f('EEEEEE')
export const monatName = f('LLLL')
export const monatKurz = f('LLL')
