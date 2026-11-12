// Rechnungen der Seite Heute (docs/konzept/10-heute.md). Zeiten in Ortszeit; „jetzt" kommt immer von außen.

type MitZeit = { titel: string; art: string; beginn?: string; ende?: string }
type MitFrist = { titel: string; art: string; erledigt: boolean; frist?: string }

const minute = 60_000
const nahMinuten = 30
const wachStunden = 16

const mitternacht = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const plusTage = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const uhr = (d: Date) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`

/** Ganze Kalendertage von a nach b (Ortszeit), unabhängig von Zeitumstellungen. */
const tageZwischen = (a: Date, b: Date) => Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86_400_000)

function zeiten<T extends MitZeit>(liste: readonly T[]) {
  return liste.flatMap((e) => {
    if (!e.beginn || !e.ende) return []
    const von = new Date(e.beginn)
    const bis = new Date(e.ende)
    return Number.isNaN(von.getTime()) || Number.isNaN(bis.getTime()) ? [] : [{ e, von, bis }]
  })
}

export function tagSchluessel(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Liest „JJJJ-MM-TT" als Ortstag; null, wenn das Datum nicht eindeutig ist. */
function ausSchluessel(text: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return tagSchluessel(d) === text ? d : null
}

export type Naechstes = { titel: string; beginn: Date; nah: boolean; wann: string }

/** Der nächste Termin der kommenden 24 Stunden, der noch nicht begonnen hat. Schichten zeigt die Uhr. */
export function alsNaechstes(termine: readonly MitZeit[], jetzt: Date): Naechstes | null {
  const grenze = jetzt.getTime() + 24 * 60 * minute
  const kommend = zeiten(termine)
    .filter(({ e, von }) => e.art !== 'schicht' && von >= jetzt && von.getTime() <= grenze)
    .sort((a, b) => a.von.getTime() - b.von.getTime())[0]
  if (!kommend) return null
  const { e, von } = kommend
  const minuten = Math.ceil((von.getTime() - jetzt.getTime()) / minute)
  const nah = minuten <= nahMinuten
  let wann = `um ${uhr(von)}`
  if (minuten === 0) wann = 'jetzt'
  else if (nah) wann = minuten === 1 ? 'in 1 Minute' : `in ${minuten} Minuten`
  else if (tageZwischen(jetzt, von) === 1) wann = `morgen um ${uhr(von)}`
  return { titel: e.titel, beginn: von, nah, wann }
}

/** Anteil des Tages von Mitternacht bis Mitternacht (0 bis 1), mit der echten Länge des Tages. */
export function anteilTag(jetzt: Date): number {
  const start = mitternacht(jetzt).getTime()
  return (jetzt.getTime() - start) / (plusTage(jetzt, 1).getTime() - start)
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

/** Sieben Mitternächte der Woche um „jetzt", verschoben um `versatz` Wochen. */
export function wochenTage(jetzt: Date, beginn: Wochenbeginn, versatz: number): Date[] {
  const erster = beginn === 'montag' ? 1 : 0
  const zurueck = (jetzt.getDay() - erster + 7) % 7
  const start = plusTage(jetzt, -zurueck + 7 * versatz)
  return Array.from({ length: 7 }, (_, i) => plusTage(start, i))
}

/** Belegte Zeit des Tages durch 16 wache Stunden, Überschneidungen einmal gezählt; höchstens 1. */
export function fuellstand(termine: readonly MitZeit[], tag: Date): number {
  const von = mitternacht(tag).getTime()
  const bis = plusTage(tag, 1).getTime()
  const stuecke = zeiten(termine)
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
      return tag ? [{ e, abstand: tageZwischen(jetzt, tag) }] : []
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
  const n = tageZwischen(jetzt, tag)
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
  const ende = Math.min(jetzt.getTime(), plusTage(tage[tage.length - 1], 1).getTime())
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

/** Kalenderwoche nach ISO 8601 (Woche mit dem ersten Donnerstag des Jahres ist Woche 1). */
export function kalenderwoche(d: Date): number {
  const donnerstag = plusTage(d, 3 - ((d.getDay() + 6) % 7))
  const jan4 = new Date(donnerstag.getFullYear(), 0, 4)
  return 1 + Math.round((tageZwischen(jan4, donnerstag) - 3 + ((jan4.getDay() + 6) % 7)) / 7)
}
