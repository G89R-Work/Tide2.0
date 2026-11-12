import { describe, expect, it } from 'vitest'
import type { Eintrag } from '../vertrag/eintrag'
import { BAND_AB, aufRaster, gezogen, schildBreite, buendeln, hoeheBei, ordne, treibgut, verschoben } from './kurveEintraege'

const tag = new Date(2026, 10, 12)
const um = (h: number, m = 0) => new Date(2026, 10, 12, h, m).toISOString()
const t = (id: string, von: [number, number], bis: [number, number], art: Eintrag['art'] = 'termin'): Eintrag => ({
  id, art, titel: id, erledigt: false, erstellt: um(0), geaendert: um(0), beginn: um(...von), ende: um(...bis),
})

describe('ordne', () => {
  it('trennt kurze Termine (Punkte) von langen (Bänder) und sortiert nach Beginn', () => {
    const { punkte, baender } = ordne([t('b', [14, 0], [15, 0]), t('schicht', [13, 0], [18, 0]), t('a', [9, 0], [9, 30])], tag)
    expect(punkte.map((p) => p.id)).toEqual(['a', 'b'])
    expect(baender).toEqual([expect.objectContaining({ id: 'schicht', von: 780, bis: 1080 })])
    expect(BAND_AB).toBe(180)
  })
  it('markiert Punkte, die in ein Band fallen', () => {
    const { punkte } = ordne([t('drin', [14, 0], [15, 0]), t('draussen', [18, 0], [18, 30]), t('schicht', [13, 0], [18, 0])], tag)
    expect(punkte.find((p) => p.id === 'drin')!.ueberschneidet).toEqual(['schicht'])
    expect(punkte.find((p) => p.id === 'draussen')!.ueberschneidet).toEqual([])
  })
  it('schneidet Bänder über Mitternacht auf den Tag zu', () => {
    const { baender } = ordne([t('nacht', [22, 0], [23, 59])].map((e) => ({ ...e, ende: new Date(2026, 10, 13, 6).toISOString() })), tag)
    expect(baender[0]).toMatchObject({ von: 1320, bis: 1440 })
  })
})

describe('buendeln', () => {
  const p = (minute: number) => ({ minute })
  it('fasst Punkte zusammen, die näher als der Abstand liegen', () => {
    expect(buendeln([p(0), p(10), p(15), p(60), p(200)], 20).map((g) => g.map((x) => x.minute))).toEqual([[0, 10, 15], [60], [200]])
  })
  it('lässt leere Listen leer', () => {
    expect(buendeln([], 20)).toEqual([])
  })
})

describe('schildBreite', () => {
  it('ein mittiges Schild reicht bis kurz vor die Mitte zum nächsten und vorigen Punkt, ringförmig über Mitternacht', () => {
    // Abstände in px: 60→120 = 120, 120→1400 = 2560, 1400→60 (über Mitternacht) = 200.
    expect(schildBreite([60, 120, 1400], 2, 300)).toEqual([120 - 8, 120 - 8, 200 - 8])
  })
  it('ein einzelner Punkt hat den Höchstwert', () => {
    expect(schildBreite([60], 2, 160)).toEqual([160])
  })
})

describe('aufRaster', () => {
  it('rundet auf 15 Minuten', () => {
    expect([aufRaster(7), aufRaster(8), aufRaster(-8), aufRaster(52)]).toEqual([0, 15, -15, 45])
  })
})

describe('verschoben', () => {
  it('verschiebt Beginn und Ende gleich weit', () => {
    expect(verschoben(t('a', [9, 0], [9, 30]), 45)).toEqual({ beginn: um(9, 45), ende: um(10, 15) })
  })
  it('wirft bei einem Eintrag ohne Uhrzeit', () => {
    expect(() => verschoben({ ...t('a', [9, 0], [9, 30]), beginn: undefined }, 15)).toThrow(/ohne Uhrzeit/)
  })
})

describe('treibgut', () => {
  it('nimmt offene Aufgaben ohne Uhrzeit', () => {
    const offen = { ...t('x', [0, 0], [0, 0], 'aufgabe'), beginn: undefined, ende: undefined }
    const liste = [offen, { ...offen, id: 'fertig', erledigt: true }, t('mitZeit', [9, 0], [10, 0], 'aufgabe'), { ...offen, id: 'n', art: 'notiz' as const }]
    expect(treibgut(liste).map((e) => e.id)).toEqual(['x'])
  })
})

describe('hoeheBei', () => {
  it('liest den Wert im 5-Minuten-Raster und mittelt dazwischen, ringförmig', () => {
    const werte = new Array<number>(288).fill(0)
    werte[2] = 1
    expect(hoeheBei(werte, 10)).toBe(1)
    expect(hoeheBei(werte, 12.5)).toBe(0.5)
    werte[0] = 1
    expect(hoeheBei(werte, 1437.5)).toBe(0.5)
  })
})

describe('gezogen', () => {
  const schicht = t('s', [13, 30], [18, 0])
  it('Ziehen in der Mitte verschiebt den ganzen Termin', () => {
    expect(gezogen(schicht, 'lage', 30)).toEqual({ beginn: um(14, 0), ende: um(18, 30) })
  })
  it('Ziehen am linken Rand ändert nur den Beginn', () => {
    expect(gezogen(schicht, 'beginn', -30)).toEqual({ beginn: um(13, 0), ende: um(18, 0) })
  })
  it('Ziehen am rechten Rand ändert nur das Ende', () => {
    expect(gezogen(schicht, 'ende', 60)).toEqual({ beginn: um(13, 30), ende: um(19, 0) })
  })
  it('ein Termin bleibt mindestens 15 Minuten lang', () => {
    expect(gezogen(schicht, 'ende', -600)).toEqual({ beginn: um(13, 30), ende: um(13, 45) })
    expect(gezogen(schicht, 'beginn', 600)).toEqual({ beginn: um(17, 45), ende: um(18, 0) })
  })
})

