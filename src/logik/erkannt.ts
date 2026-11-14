// Erkannt statt „Kurz gesagt“ (docs/konzept/11-postfach.md): Rechnung, Termin, Sendung und Frist aus Mustern in Betreff und Text.
// Ohne KI. Was nicht sicher passt, gilt als nicht erkannt; Tage zählen ab dem Eingang der Mail (Ortszeit).
import { addDays, addMonths, addWeeks, getDay, setHours, setMinutes, startOfDay } from 'date-fns'
import type { Mail } from '../vertrag/postfach'
import { tagSchluessel } from './zeit'

export type Erkannt =
  | { art: 'rechnung'; cent: number; faellig?: string; vorher?: number }
  | { art: 'termin'; beginn: string }
  | { art: 'sendung'; nummer?: string; erwartet?: string }
  | { art: 'frist'; bis: string; was: string }

const MONATE = ['januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember']
const TAGE = ['sonntag', 'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag']
const monat = MONATE.join('|')

const BETRAG = /(\d{1,3}(?:\.\d{3})*,\d{2})\s?€/
const RECHNUNG = /rechnung|abschlag|beitrag|betrag/i
const FAELLIG = new RegExp(`am (\\d{1,2})\\. (${monat})\\b[^.?!]*(?:abgebucht|fällig|zahlbar)`, 'i')
const TERMIN = new RegExp(`\\b(?:(${TAGE.join('|')})|(\\d{1,2})\\. (${monat}))\\b[^.?!]*?\\b(\\d{1,2})(?::(\\d{2}))? ?Uhr`, 'i')
const SENDUNG = /paket|sendung/i
const NUMMER = /sendungsnummer:? ?(\d[\d ]{6,}\d)/i
const FRIST_MONAT = /(?:binnen|innerhalb) eines monats/i
const FRIST_DAUER = /(?:binnen|innerhalb von) (\d+) (tagen|wochen)/i
const FRIST_DATUM = new RegExp(`bis (?:zum )?(\\d{1,2})\\. (${monat})\\b`, 'i')
const FRIST_GRUND = /\b(einspruch|widerspruch|kündigung|anmeldung|rückmeldung)\b/i

const cent = (text: string) => {
  const b = BETRAG.exec(text)?.[1]
  return b === undefined ? undefined : Math.round(Number(b.replace(/\./g, '').replace(',', '.')) * 100)
}

/** „20. November“ im Jahr des Eingangs; liegt der Tag davor, im Jahr danach. */
function tagMitMonat(tag: string, name: string, ab: Date): Date {
  const d = new Date(ab.getFullYear(), MONATE.indexOf(name.toLowerCase()), Number(tag))
  return d < startOfDay(ab) ? new Date(ab.getFullYear() + 1, d.getMonth(), d.getDate()) : d
}

/** Der nächste solche Wochentag nach dem Eingangstag. */
function naechster(wochentag: string, ab: Date): Date {
  const ziel = TAGE.indexOf(wochentag.toLowerCase())
  return addDays(startOfDay(ab), ((ziel - getDay(ab) + 6) % 7) + 1)
}

function rechnung(m: Mail, text: string, vorige: readonly Mail[]): Erkannt | undefined {
  const betrag = cent(text)
  if (betrag === undefined || !RECHNUNG.test(text)) return undefined
  const f = FAELLIG.exec(text)
  const alt = vorige
    .filter((x) => x.adresse === m.adresse && x.id !== m.id && x.zeit < m.zeit)
    .sort((a, b) => b.zeit.localeCompare(a.zeit))
    .map((x) => `${x.betreff}. ${x.vorschau}`)
    .find((t) => RECHNUNG.test(t) && cent(t) !== undefined)
  const vorher = alt === undefined ? undefined : cent(alt)
  return {
    art: 'rechnung',
    cent: betrag,
    ...(f?.[1] && f[2] ? { faellig: tagSchluessel(tagMitMonat(f[1], f[2], new Date(m.zeit))) } : {}),
    ...(vorher !== undefined ? { vorher } : {}),
  }
}

function termin(m: Mail, text: string): Erkannt | undefined {
  const t = TERMIN.exec(text)
  if (!t?.[4]) return undefined
  const ab = new Date(m.zeit)
  const tag = t[1] ? naechster(t[1], ab) : t[2] && t[3] ? tagMitMonat(t[2], t[3], ab) : undefined
  if (!tag) return undefined
  return { art: 'termin', beginn: setMinutes(setHours(tag, Number(t[4])), Number(t[5] ?? 0)).toISOString() }
}

function sendung(m: Mail, text: string): Erkannt | undefined {
  if (!SENDUNG.test(text)) return undefined
  const nummer = NUMMER.exec(text)?.[1]?.replace(/ /g, '')
  const tage = /übermorgen/i.test(text) ? 2 : /\bmorgen\b/i.test(text) ? 1 : 0
  if (!nummer && !tage) return undefined
  return { art: 'sendung', ...(nummer ? { nummer } : {}), ...(tage ? { erwartet: tagSchluessel(addDays(new Date(m.zeit), tage)) } : {}) }
}

function frist(m: Mail, text: string): Erkannt | undefined {
  const ab = new Date(m.zeit)
  const dauer = FRIST_DAUER.exec(text)
  const datum = FRIST_DATUM.exec(text)
  const bis = FRIST_MONAT.test(text)
    ? addMonths(ab, 1)
    : dauer?.[1] && dauer[2]
      ? (dauer[2].toLowerCase() === 'wochen' ? addWeeks : addDays)(ab, Number(dauer[1]))
      : datum?.[1] && datum[2]
        ? tagMitMonat(datum[1], datum[2], ab)
        : undefined
  if (!bis) return undefined
  const grund = FRIST_GRUND.exec(text)?.[1]
  return { art: 'frist', bis: tagSchluessel(bis), was: grund ? grund[0].toUpperCase() + grund.slice(1) : m.betreff }
}

/** Was in der Mail sicher erkannt ist; `vorige` sind andere Mails (für den Vergleich mit der letzten Rechnung). */
export function erkenne(m: Mail, text: string, vorige: readonly Mail[]): Erkannt[] {
  const alles = `${m.betreff}. ${text}`
  return [rechnung(m, alles, vorige), termin(m, alles), sendung(m, alles), frist(m, alles)].filter((x) => x !== undefined)
}
