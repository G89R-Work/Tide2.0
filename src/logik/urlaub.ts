// Urlaub planen (docs/konzept/17-arbeit.md): um jeden Feiertag das Fenster, das mit wenigen Urlaubstagen möglichst viele freie Tage am Stück ergibt.
// Eigenbau: geprüft in docs/BAUSTEINE.md (kein bewährter Baustein, keiner kennt einen Dienstplan).
import { addDays, differenceInCalendarDays, isWeekend } from 'date-fns'
import { schichtAm, type Rhythmus } from './rhythmus'
import { ausSchluessel, tagSchluessel } from './zeit'

/** So weit vor und nach dem Feiertag sucht der Planer. */
const SPANNE = 10

export type Vorschlag = { feiertage: string[]; von: Date; bis: Date; urlaub: Date[]; frei: number }

/**
 * Je Feiertag des Jahres der beste Vorschlag: höchstens `maxUrlaub` Urlaubstage, die meisten freien Tage je Urlaubstag, bei Gleichstand mehr freie Tage.
 * `arbeitstag` sagt, ob an einem Tag ohne Feiertag gearbeitet wird (Dienstplan); Feiertage sind frei. Gleiche Fenster stehen nur einmal da.
 */
export function vorschlaege(feiertage: ReadonlyMap<string, string>, arbeitstag: (tag: Date) => boolean, jahr: number, maxUrlaub = 5): Vorschlag[] {
  const frei = (t: Date) => feiertage.has(tagSchluessel(t)) || !arbeitstag(t)
  const liste: Vorschlag[] = []
  for (const [schluessel, name] of [...feiertage].sort(([a], [b]) => a.localeCompare(b))) {
    const tag = ausSchluessel(schluessel)
    if (!tag || tag.getFullYear() !== jahr) continue
    const bester = besterUm(tag, frei, maxUrlaub)
    if (!bester) continue
    const gleich = liste.find((x) => x.von.getTime() === bester.von.getTime() && x.bis.getTime() === bester.bis.getTime())
    if (gleich) gleich.feiertage.push(name)
    else liste.push({ ...bester, feiertage: [name] })
  }
  return liste
}

function besterUm(feiertag: Date, frei: (t: Date) => boolean, maxUrlaub: number): Omit<Vorschlag, 'feiertage'> | null {
  let bester: Omit<Vorschlag, 'feiertage'> | null = null
  const wert = (v: Omit<Vorschlag, 'feiertage'>) => v.frei / v.urlaub.length
  for (let a = -SPANNE; a <= 0; a++) {
    for (let b = 0; b <= SPANNE; b++) {
      let von = addDays(feiertag, a)
      let bis = addDays(feiertag, b)
      // Freie Tage am Rand gehören dazu (Wochenende, weitere Feiertage).
      while (frei(addDays(von, -1))) von = addDays(von, -1)
      while (frei(addDays(bis, 1))) bis = addDays(bis, 1)
      const tage = Array.from({ length: differenceInCalendarDays(bis, von) + 1 }, (_, i) => addDays(von, i))
      const urlaub = tage.filter((t) => !frei(t))
      if (urlaub.length === 0 || urlaub.length > maxUrlaub) continue
      const v = { von, bis, urlaub, frei: tage.length }
      if (!bester || wert(v) > wert(bester) || (wert(v) === wert(bester) && v.frei > bester.frei)) bester = v
    }
  }
  return bester
}

/** Arbeitstag laut Dienstplan (Tag mit Schicht, genommener Urlaub ist frei); vor dem Start oder ohne Abfolge Montag bis Freitag. */
export function arbeitstagNachPlan(r: Rhythmus): (tag: Date) => boolean {
  const start = ausSchluessel(r.start)
  return (tag) => (r.abfolge.length && start && tag >= start ? schichtAm(r, tag) !== null : !isWeekend(tag))
}
