import { area, curveBasis, line } from 'd3-shape'
import type { Eintrag } from '../vertrag/eintrag'

// Gezeitenkurve (docs/konzept/06-gezeitenkurve.md): Termine heben die Linie zur Flut, freie Zeit senkt sie zur Ebbe.
// Gerechnet im 5-Minuten-Raster, ringförmig geglättet, damit 24 Uhr nahtlos in 0 Uhr übergeht.
// Die Kurve liegt dreimal nebeneinander; gescrollt wird in der mittleren Kopie, die gezeigte Uhrzeit steht in der Mitte.

export const MIN_TAG = 24 * 60
export const RASTER = 5
export const SCHRITTE = MIN_TAG / RASTER

export type Zeitraum = { beginn: Date; ende: Date }

/** Je 5-Minuten-Feld des Tages 1 (Termin) oder 0 (frei). Angeschnittene Felder zählen als Termin. */
export function ebbeFlut(termine: readonly Zeitraum[], tagBeginn: Date): number[] {
  const werte = new Array<number>(SCHRITTE).fill(0)
  const null0 = tagBeginn.getTime()
  for (const { beginn, ende } of termine) {
    const von = Math.max(0, Math.floor((beginn.getTime() - null0) / 60_000 / RASTER))
    const bis = Math.min(SCHRITTE, Math.ceil((ende.getTime() - null0) / 60_000 / RASTER))
    for (let i = von; i < bis; i++) werte[i] = 1
  }
  return werte
}

/** Gleitender Mittelwert über ±radius Felder, ringförmig. */
export function glaetten(werte: readonly number[], radius: number): number[] {
  const n = werte.length
  return werte.map((_, i) => {
    let summe = 0
    for (let d = -radius; d <= radius; d++) summe += werte[(((i + d) % n) + n) % n]
    return summe / (2 * radius + 1)
  })
}

/** Ebbe und Flut als Anteil der Höhe, von oben gemessen. Die Ebbe liegt über der Stundenleiste;
 *  der Ausschlag nutzt nur den Goldenen Schnitt der Höhe (38,2 %), damit die Kurve ruhig bleibt. */
const EBBE = 0.68
const AUSSCHLAG = 0.382
const FLUT = EBBE - AUSSCHLAG
/** Lage der Linie als Anteil der Höhe von oben, für w von 0 (Ebbe) bis 1 (Flut). */
export const vonOben = (w: number) => EBBE + (FLUT - EBBE) * w

/** SVG-Pfade für einen Tag: x in Minuten (0 bis 1440), y in 0 bis hoehe. Der letzte Punkt wiederholt den ersten. */
export function tagesPfade(werte: readonly number[], hoehe: number) {
  const punkte: [number, number][] = [...werte, werte[0]].map((w, i) => [i * RASTER, hoehe * vonOben(w)])
  const runden = (x: number) => Math.round(x * 10) / 10
  const p = punkte.map(([x, y]) => [runden(x), runden(y)] as [number, number])
  return {
    linie: line().curve(curveBasis)(p) ?? '',
    flaeche: area().curve(curveBasis).y0(hoehe)(p) ?? '',
  }
}

/** Breite eines ganzen Tages in Pixeln, wenn `stunden` Stunden in `sichtbar` Pixel passen. */
export const tagBreite = (sichtbar: number, stunden: number) => (sichtbar * 24) / stunden

/** Scrollstelle im mittleren Bereich, an der diese Minute in der Mitte des Sichtfelds steht. */
export const scrollFuer = (minuten: number, sichtbar: number, tag: number) => endlos(tag + (minuten / MIN_TAG) * tag - sichtbar / 2, tag)

/** Von ziel, ziel − tag und ziel + tag die Stelle, die am nächsten an `aktuell` liegt: kürzester Weg beim Gleiten. */
export const naechste = (ziel: number, aktuell: number, tag: number) =>
  [ziel - tag, ziel, ziel + tag].reduce((a, b) => (Math.abs(b - aktuell) < Math.abs(a - aktuell) ? b : a))

/** Minute des Tages (0 bis unter 1440), die bei dieser Scrollstelle in der Mitte steht. */
export function zeitBei(scroll: number, sichtbar: number, tag: number): number {
  const m = ((scroll + sichtbar / 2) / tag) * MIN_TAG
  return ((m % MIN_TAG) + MIN_TAG) % MIN_TAG
}

/** Hält die Scrollstelle zwischen einem halben und anderthalb Tagen: springt um genau einen Tag, die Uhrzeit bleibt gleich. */
export function endlos(scroll: number, tag: number): number {
  if (scroll < tag / 2) return scroll + tag
  if (scroll > (tag * 3) / 2) return scroll - tag
  return scroll
}

export const minutenAmTag = (d: Date) => d.getHours() * 60 + d.getMinutes()

/** Jede wievielte Stunde beschriftet wird, damit Zahlen mindestens 32 Pixel Abstand haben. Teiler von 24. */
export function stundenSchritt(pxProStunde: number): number {
  return [1, 2, 3, 4, 6].find((s) => s * pxProStunde >= 32) ?? 6
}

/** Termine mit Uhrzeit, die den Zeitraum berühren. */
export function termineImZeitraum(liste: readonly Eintrag[], von: Date, bis: Date): Eintrag[] {
  return liste.filter((e) => e.beginn && e.ende && new Date(e.beginn) < bis && new Date(e.ende) > von)
}
