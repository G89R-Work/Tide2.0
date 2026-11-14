// Hinweise zum Plan und Arbeitszeit für die Seite Arbeit (docs/konzept/17-arbeit.md). Feste Regeln, keine Rechtsprüfung.
import { differenceInMinutes, eachDayOfInterval, endOfMonth, isWeekend, startOfMonth } from 'date-fns'
import type { Eintrag } from '../vertrag/eintrag'
import { ueberschneidungen } from './bezuege/terminInSchicht'
import { schichtAm, type Rhythmus, type Schicht, type VorschauTag } from './rhythmus'
import { ausSchluessel, dauerText } from './zeit'

// Stundenwerte aus der Datei des Nutzers (Konzept): Ruhe, Höchstdauer, Pausen ab Dauer.
const ruheMin = 11 * 60
const hoechstMin = 10 * 60
const pausen = [
  { ab: 9 * 60, pause: 45 },
  { ab: 6 * 60, pause: 30 },
] as const

export type Hinweisart = 'ruhe' | 'lang' | 'pause' | 'termin' | 'feiertag'
export type Hinweis = { tag: Date; art: Hinweisart; text: string }

/** Arbeitszeit einer Schicht in Minuten: Dauer ohne Pause. */
export const netto = (s: Schicht) => differenceInMinutes(s.ende, s.beginn) - s.art.pause

/** Hinweise für die Tage (in ihrer Reihenfolge): Ruhe, Höchstdauer, Pausen, Termine in Schichten, Schichten an Feiertagen. */
export function hinweise(tage: readonly VorschauTag[], termine: readonly Eintrag[], feiertag: (tag: Date) => string | undefined): Hinweis[] {
  const liste: Hinweis[] = []
  let vorige: Schicht | null = null
  for (const { tag, schicht: s } of tage) {
    if (!s) continue
    const name = s.art.name
    if (vorige) {
      const ruhe = differenceInMinutes(s.beginn, vorige.ende)
      if (ruhe < ruheMin) liste.push({ tag, art: 'ruhe', text: `Nur ${dauerText(ruhe)} Ruhe vor ${name}` })
    }
    vorige = s
    const arbeit = netto(s)
    if (arbeit > hoechstMin) liste.push({ tag, art: 'lang', text: `${name}: ${dauerText(arbeit)} Arbeit` })
    const noetig = pausen.find((p) => arbeit > p.ab)?.pause ?? 0
    if (s.art.pause < noetig) liste.push({ tag, art: 'pause', text: `${name}: ${noetig} Min. Pause nötig` })
    const fest = feiertag(tag)
    if (fest) liste.push({ tag, art: 'feiertag', text: `${name} am Feiertag (${fest})` })
    const drin = termine.filter((t) => t.art === 'termin' && t.beginn && t.ende && ueberschneidungen({ von: Date.parse(t.beginn), bis: Date.parse(t.ende) }, [{ titel: name, von: s.beginn.getTime(), bis: s.ende.getTime() }]).length)
    if (drin.length) liste.push({ tag, art: 'termin', text: `${drin.map((t) => `„${t.titel}“`).join(', ')} ${drin.length > 1 ? 'liegen' : 'liegt'} in ${name}` })
  }
  return liste
}

/** Minuten: Soll im Monat, Plan im Monat, Ist bis jetzt, Überstunden bis jetzt; Resturlaub in Tagen im Jahr. */
export type Arbeitszeit = { soll: number; plan: number; ist: number; ueber: number; urlaubRest: number }

/** Arbeitszeit im Monat von `jetzt`. Soll: Wochenstunden auf Montag bis Freitag verteilt; Urlaub und krank zählen wie ein Soll-Tag. */
export function arbeitszeit(r: Rhythmus, jetzt: Date, wochenStunden: number, urlaubJahr: number): Arbeitszeit {
  const sollTag = (wochenStunden * 60) / 5
  const a: Arbeitszeit = { soll: 0, plan: 0, ist: 0, ueber: 0, urlaubRest: urlaubJahr }
  let sollBisJetzt = 0
  for (const tag of eachDayOfInterval({ start: startOfMonth(jetzt), end: endOfMonth(jetzt) })) {
    const s = schichtAm(r, tag)
    const werktag = !isWeekend(tag)
    const frei = !s && werktag && r.ausnahmen.some((x) => (x.art === 'urlaub' || x.art === 'krank') && ausSchluessel(x.tag)?.getTime() === tag.getTime())
    const minuten = s ? netto(s) : frei ? sollTag : 0
    const vorbei = s ? s.ende <= jetzt : tag < jetzt
    a.soll += werktag ? sollTag : 0
    a.plan += minuten
    if (vorbei) {
      a.ist += minuten
      sollBisJetzt += werktag ? sollTag : 0
    }
  }
  a.ueber = a.ist - sollBisJetzt
  a.urlaubRest = urlaubJahr - r.ausnahmen.filter((x) => x.art === 'urlaub' && x.tag.startsWith(String(jetzt.getFullYear()))).length
  return a
}
