// Rechnungen der Seite Heute (docs/konzept/10-heute.md). Zeiten in Ortszeit; „jetzt" kommt immer von außen.
import { addDays, differenceInCalendarDays, isSameDay, startOfDay, startOfMonth, startOfWeek } from 'date-fns'
import { ausSchluessel } from './zeit'

type MitZeit = { titel: string; art: string; beginn?: string; ende?: string }
type MitFrist = { titel: string; art: string; erledigt: boolean; frist?: string }

const minute = 60_000
const nahMinuten = 30
const wachStunden = 16

type Zeit<T> = { e: T; von: Date; bis: Date }

function zeiten<T extends MitZeit>(liste: readonly T[]): Zeit<T>[] {
  return liste.flatMap((e) => {
    if (!e.beginn || !e.ende) return []
    const von = new Date(e.beginn)
    const bis = new Date(e.ende)
    return Number.isNaN(von.getTime()) || Number.isNaN(bis.getTime()) ? [] : [{ e, von, bis }]
  })
}

export type Naechstes = { titel: string; beginn: Date; nah: boolean; wann: string }

/** Der nächste Termin der kommenden 24 Stunden, der noch nicht begonnen hat. Schichten zeigt die Uhr.
 *  `wann` sagt, wie lange es noch dauert („in 25 Minuten“, „in 1 Std. 12 Min.“, „morgen“). */
export function alsNaechstes(termine: readonly MitZeit[], jetzt: Date): Naechstes | null {
  const grenze = jetzt.getTime() + 24 * 60 * minute
  const kommend = zeiten(termine)
    .filter(({ e, von }) => e.art !== 'schicht' && von >= jetzt && von.getTime() <= grenze)
    .sort((a, b) => a.von.getTime() - b.von.getTime())[0]
  if (!kommend) return null
  const { e, von } = kommend
  const minuten = Math.ceil((von.getTime() - jetzt.getTime()) / minute)
  const nah = minuten <= nahMinuten
  const [h, m] = [Math.floor(minuten / 60), minuten % 60]
  let wann = h === 0 ? `in ${minuten} Minuten` : m === 0 ? `in ${h} Std.` : `in ${h} Std. ${m} Min.`
  if (minuten === 0) wann = 'jetzt'
  else if (minuten === 1) wann = 'in 1 Minute'
  else if (differenceInCalendarDays(von, jetzt) === 1) wann = 'morgen'
  return { titel: e.titel, beginn: von, nah, wann }
}

/** Anteil des Tages von Mitternacht bis Mitternacht (0 bis 1), mit der echten Länge des Tages. */
export function anteilTag(jetzt: Date): number {
  const start = startOfDay(jetzt)
  return (jetzt.getTime() - start.getTime()) / (addDays(start, 1).getTime() - start.getTime())
}

export type Schicht = { titel: string; anteil: number; restMinuten: number }

/** Die laufende Schicht mit ihrem Anteil; null außerhalb einer Schicht. */
export function schicht(termine: readonly MitZeit[], jetzt: Date): Schicht | null {
  const laufend = zeiten(termine).find(({ e, von, bis }) => e.art === 'schicht' && von <= jetzt && jetzt < bis)
  if (!laufend) return null
  const { e, von, bis } = laufend
  const t = jetzt.getTime()
  return { titel: e.titel, anteil: (t - von.getTime()) / (bis.getTime() - von.getTime()), restMinuten: Math.round((bis.getTime() - t) / minute) }
}

export type Wochenbeginn = 'montag' | 'sonntag'
const wocheAb = { montag: 1, sonntag: 0 } as const

/** Sieben Mitternächte der Woche um „jetzt", verschoben um `versatz` Wochen. */
export function wochenTage(jetzt: Date, beginn: Wochenbeginn, versatz: number): Date[] {
  const start = addDays(startOfWeek(jetzt, { weekStartsOn: wocheAb[beginn] }), 7 * versatz)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export type TagesBelegung = { /** belegt durch 16 wache Stunden, höchstens 1 */ anteil: number; /** Buchstabe der Schicht, die an diesem Tag beginnt */ schicht: string | null }

/** Füllstand und Schicht-Buchstabe je Tag; die Termine werden dafür nur einmal gelesen. */
export function tagesBelegung(termine: readonly MitZeit[], tage: readonly Date[]): TagesBelegung[] {
  const z = zeiten(termine)
  return tage.map((tag) => ({ anteil: fuellstand(z, tag), schicht: schichtBuchstabe(z, tag) }))
}

/** Belegte Zeit des Tages durch 16 wache Stunden, Überschneidungen einmal gezählt; höchstens 1. */
function fuellstand(z: readonly Zeit<MitZeit>[], tag: Date): number {
  const beginn = startOfDay(tag)
  const von = beginn.getTime()
  const bis = addDays(beginn, 1).getTime()
  const stuecke = z
    .map((z) => [Math.max(von, z.von.getTime()), Math.min(bis, z.bis.getTime())] as const)
    .filter(([a, b]) => b > a)
    .sort((x, y) => x[0] - y[0])
  let belegt = 0
  let ende = von
  for (const [a, b] of stuecke) {
    if (b <= ende) continue
    belegt += b - Math.max(a, ende)
    ende = b
  }
  return Math.min(1, belegt / (wachStunden * 60 * minute))
}

export type BrauchtDich<T> = { ueberfaellig: T[]; heute: T[]; morgen: T[]; zahl: number; wichtigster: T | null }

/** Offene Einträge mit Frist bis morgen, geteilt in Überfällig, Heute und Morgen. Unlesbare Fristen zählen nicht. */
export function brauchtDich<T extends MitFrist>(eintraege: readonly T[], jetzt: Date): BrauchtDich<T> {
  const mitTag = eintraege
    .flatMap((e) => {
      const tag = !e.erledigt && e.frist ? ausSchluessel(e.frist) : null
      return tag ? [{ e, abstand: differenceInCalendarDays(tag, jetzt) }] : []
    })
    .sort((a, b) => a.abstand - b.abstand)
  const ueberfaellig = mitTag.filter((x) => x.abstand < 0).map((x) => x.e)
  const heute = mitTag.filter((x) => x.abstand === 0).map((x) => x.e)
  const morgen = mitTag.filter((x) => x.abstand === 1).map((x) => x.e)
  const alle = [...ueberfaellig, ...heute, ...morgen]
  return { ueberfaellig, heute, morgen, zahl: alle.length, wichtigster: alle[0] ?? null }
}

/** „seit gestern", „seit 7 Tagen", „heute", „morgen" oder „in 3 Tagen" zu einer Frist; leer, wenn unlesbar. */
export function seitText(frist: string, jetzt: Date): string {
  const tag = ausSchluessel(frist)
  if (!tag) return ''
  const n = differenceInCalendarDays(tag, jetzt)
  if (n === -1) return 'seit gestern'
  if (n < 0) return `seit ${-n} Tagen`
  if (n === 0) return 'heute'
  if (n === 1) return 'morgen'
  return `in ${n} Tagen`
}

export type Rueckblick = { termine: number; schichtStunden: number; erledigt: number }

/** Was in der Woche bis jetzt geschah: Termine, Stunden in Schichten, erledigte Einträge. */
export function wochenrueckblick(termine: readonly MitZeit[], eintraege: readonly { erledigt: boolean; geaendert: string }[], tage: readonly Date[], jetzt: Date): Rueckblick {
  const start = tage[0]
  const ende = Math.min(jetzt.getTime(), addDays(tage[tage.length - 1], 1).getTime())
  const inWoche = (d: Date) => d >= start && d.getTime() < ende
  const z = zeiten(termine)
  const schichtMs = z
    .filter(({ e }) => e.art === 'schicht')
    .reduce((s, { von, bis }) => s + Math.max(0, Math.min(ende, bis.getTime()) - Math.max(start.getTime(), von.getTime())), 0)
  return {
    termine: z.filter(({ e, von }) => e.art !== 'schicht' && inWoche(von)).length,
    schichtStunden: Math.round(schichtMs / 3_600_000),
    erledigt: eintraege.filter((e) => e.erledigt && inWoche(new Date(e.geaendert))).length,
  }
}

/** Monat in sechs Wochenzeilen zu je sieben Tagen, mit den Tagen davor und danach (der Kalender bleibt gleich groß). */
export function monatsRaster(d: Date, beginn: Wochenbeginn): Date[][] {
  const start = startOfWeek(startOfMonth(d), { weekStartsOn: wocheAb[beginn] })
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i)))
}

/** Erster Buchstabe der Schicht, die an diesem Tag beginnt (Großbuchstabe), sonst null. */
function schichtBuchstabe(z: readonly Zeit<MitZeit>[], tag: Date): string | null {
  const s = z.find(({ e, von }) => e.art === 'schicht' && isSameDay(von, tag))
  return s ? s.e.titel.charAt(0).toUpperCase() : null
}

const spurRegen = 0.1

export type WetterHeute = { grad: number; hoch: number; tief: number; regnet: boolean; regenAb: Date | null }

/** Wetterzeile: Temperatur der laufenden Stunde, Spanne des Tages und der nächste Regen ab jetzt (ab 0,1 mm). */
export function wetterHeute(stunden: readonly { zeit: string; grad: number; regen: number }[], jetzt: Date): WetterHeute | null {
  const tag = stunden.map((s) => ({ ...s, d: new Date(s.zeit) })).filter((s) => isSameDay(s.d, jetzt)).sort((a, b) => a.d.getTime() - b.d.getTime())
  if (tag.length === 0) return null
  const laufend = [...tag].reverse().find((s) => s.d <= jetzt) ?? tag[0]
  const grade = tag.map((s) => s.grad)
  const regen = tag.find((s) => s.d.getTime() >= laufend.d.getTime() && s.regen >= spurRegen)
  return {
    grad: laufend.grad,
    hoch: Math.max(...grade),
    tief: Math.min(...grade),
    regnet: regen === laufend,
    regenAb: regen ? regen.d : null,
  }
}
