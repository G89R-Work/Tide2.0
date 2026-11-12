import type { Eintrag } from '../vertrag/eintrag'
import { MIN_TAG, RASTER } from './gezeiten'

// Einträge auf der Gezeitenkurve (docs/konzept/06-gezeitenkurve.md): kurze Termine als Punkte, lange als Band dahinter.
// Minuten zählen wie die Kurve selbst ab Mitternacht in echter Zeit, damit Punkt und Welle übereinander liegen.

/** Ab dieser Dauer in Minuten wird ein Termin zum Band (Schicht, Arbeitstag). */
export const BAND_AB = 180
/** Raster beim Ziehen in Minuten. */
export const ZIEH_RASTER = 15

export type Punkt = { id: string; titel: string; minute: number; dauer: number; eintrag: Eintrag; ueberschneidet: string[] }
export type Band = { id: string; titel: string; von: number; bis: number; eintrag: Eintrag }

const minuteVon = (iso: string, tagBeginn: Date) => (new Date(iso).getTime() - tagBeginn.getTime()) / 60_000

/** Teilt die Termine des Tages in Punkte und Bänder; Punkte in einem Band nennen dessen Titel. */
export function ordne(termine: readonly Eintrag[], tagBeginn: Date): { punkte: Punkt[]; baender: Band[] } {
  const mitZeit = termine.filter((e) => e.beginn && e.ende)
  const spanne = (e: Eintrag) => [minuteVon(e.beginn!, tagBeginn), minuteVon(e.ende!, tagBeginn)] as const
  const baender: Band[] = []
  const kurz: Eintrag[] = []
  for (const e of mitZeit) {
    const [von, bis] = spanne(e)
    if (bis - von >= BAND_AB) baender.push({ id: e.id, titel: e.titel, von: Math.max(0, von), bis: Math.min(MIN_TAG, bis), eintrag: e })
    else kurz.push(e)
  }
  const punkte = kurz.map((e): Punkt => {
    const [von, bis] = spanne(e)
    const ueberschneidet = baender.filter((b) => von < b.bis && bis > b.von).map((b) => b.titel)
    return { id: e.id, titel: e.titel, minute: von, dauer: bis - von, eintrag: e, ueberschneidet }
  })
  const nachZeit = <T extends { minute?: number; von?: number }>(a: T, b: T) => (a.minute ?? a.von ?? 0) - (b.minute ?? b.von ?? 0)
  return { punkte: punkte.sort(nachZeit), baender: baender.sort(nachZeit) }
}

/** Fasst nach Zeit sortierte Punkte zu Gruppen, solange der Abstand zum vorigen kleiner als `abstand` Minuten ist. */
export function buendeln<T extends { minute: number }>(punkte: readonly T[], abstand: number): T[][] {
  const gruppen: T[][] = []
  for (const p of punkte) {
    const letzte = gruppen.at(-1)
    if (letzte && p.minute - letzte.at(-1)!.minute < abstand) letzte.push(p)
    else gruppen.push([p])
  }
  return gruppen
}

/** Breite der Beschriftung je Punkt in Pixeln: bis 8 px vor den nächsten Punkt (über Mitternacht weiter), höchstens `max`. */
export function beschriftungsPlatz(minuten: readonly number[], pxProMinute: number, max: number): number[] {
  if (minuten.length < 2) return minuten.map(() => max)
  return minuten.map((m, i) => {
    const naechste = i + 1 < minuten.length ? minuten[i + 1] : minuten[0] + MIN_TAG
    return Math.min(max, (naechste - m) * pxProMinute - 8)
  })
}

/** Rundet eine Verschiebung in Minuten auf das Zieh-Raster. */
export const aufRaster = (minuten: number) => Math.round(minuten / ZIEH_RASTER) * ZIEH_RASTER || 0

/** Beginn und Ende eines Termins, um `minuten` verschoben. */
export function verschoben(e: Eintrag, minuten: number): { beginn: string; ende: string } {
  if (!e.beginn || !e.ende) throw new Error(`Eintrag ${e.id} ist ohne Uhrzeit und lässt sich nicht verschieben`)
  const um = (iso: string) => new Date(new Date(iso).getTime() + minuten * 60_000).toISOString()
  return { beginn: um(e.beginn), ende: um(e.ende) }
}

/** Treibgut: offene Aufgaben ohne Uhrzeit. Sie treiben an der Jetzt-Linie mit. */
export const treibgut = (liste: readonly Eintrag[]) => liste.filter((e) => e.art === 'aufgabe' && !e.erledigt && !e.beginn)

/** Wert der geglätteten Kurve (0 Ebbe bis 1 Flut) an einer Minute, zwischen zwei Rasterfeldern gemittelt, ringförmig. */
export function hoeheBei(werte: readonly number[], minute: number): number {
  const n = werte.length
  const stelle = (((minute / RASTER) % n) + n) % n
  const i = Math.floor(stelle)
  const anteil = stelle - i
  return werte[i] * (1 - anteil) + werte[(i + 1) % n] * anteil
}

export type Ziehart = 'lage' | 'beginn' | 'ende'

/** Beginn und Ende nach dem Ziehen: in der Mitte verschoben, am Rand nur eine Seite. Bleibt mindestens ein Raster lang. */
export function gezogen(e: Eintrag, art: Ziehart, minuten: number): { beginn: string; ende: string } {
  if (art === 'lage') return verschoben(e, minuten)
  if (!e.beginn || !e.ende) throw new Error(`Eintrag ${e.id} ist ohne Uhrzeit und lässt sich nicht ändern`)
  const [b, en] = [new Date(e.beginn).getTime(), new Date(e.ende).getTime()]
  const min = ZIEH_RASTER * 60_000
  const neu = (ms: number) => new Date(ms).toISOString()
  return art === 'beginn'
    ? { beginn: neu(Math.min(b + minuten * 60_000, en - min)), ende: e.ende }
    : { beginn: e.beginn, ende: neu(Math.max(en + minuten * 60_000, b + min)) }
}
