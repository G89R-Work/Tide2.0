import { describe, expect, it } from 'vitest'
import {
  MIN_TAG,
  SCHRITTE,
  ebbeFlut,
  endlos,
  glaetten,
  minutenAmTag,
  naechste,
  scrollFuer,
  stundenSchritt,
  ausduennen,
  tagBreite,
  tagesPfade,
  termineImZeitraum,
  zeitBei,
} from './gezeiten'
import type { Eintrag } from '../vertrag/eintrag'

const tag = new Date(2026, 10, 11)
const um = (h: number, m = 0) => new Date(2026, 10, 11, h, m)

describe('ebbeFlut', () => {
  it('hat 288 Felder zu je 5 Minuten', () => {
    expect(SCHRITTE).toBe(288)
    expect(ebbeFlut([], tag)).toEqual(new Array(288).fill(0))
  })
  it('setzt Felder eines Termins auf 1, angeschnittene Felder zählen', () => {
    const w = ebbeFlut([{ beginn: um(9), ende: um(9, 12) }], tag)
    expect(w.slice(107, 112)).toEqual([0, 1, 1, 1, 0])
    expect(w.reduce((a, b) => a + b)).toBe(3)
  })
  it('schneidet Termine über Mitternacht am Tagesrand ab', () => {
    const w = ebbeFlut([{ beginn: new Date(2026, 10, 10, 23), ende: um(0, 10) }], tag)
    expect(w.slice(0, 3)).toEqual([1, 1, 0])
    expect(w.at(-1)).toBe(0)
  })
  it('ignoriert Termine an anderen Tagen und ohne Dauer', () => {
    expect(ebbeFlut([{ beginn: um(30), ende: um(31) }, { beginn: um(9), ende: um(9) }], tag)).toEqual(new Array(288).fill(0))
  })
})

describe('glaetten', () => {
  it('lässt eine gleichmäßige Linie gleich', () => {
    expect(glaetten([0.5, 0.5, 0.5, 0.5], 1)).toEqual([0.5, 0.5, 0.5, 0.5])
  })
  it('mittelt ringförmig, damit der Übergang über Mitternacht glatt bleibt', () => {
    expect(glaetten([1, 0, 0, 0, 0, 0], 1)).toEqual([1 / 3, 1 / 3, 0, 0, 0, 1 / 3])
  })
  it('bleibt zwischen 0 und 1', () => {
    const w = glaetten(ebbeFlut([{ beginn: um(9), ende: um(12) }], tag), 6)
    expect(Math.max(...w)).toBeLessThanOrEqual(1)
    expect(Math.min(...w)).toBeGreaterThanOrEqual(0)
    expect(w[130]).toBeCloseTo(1)
  })
})

describe('tagesPfade', () => {
  it('liefert Linie und Fläche über genau einen Tag in Minuten', () => {
    const { linie, flaeche } = tagesPfade(new Array(288).fill(0), 100)
    expect(linie.startsWith('M0,')).toBe(true)
    expect(linie).toContain(`${MIN_TAG},`)
    expect(flaeche.endsWith('Z')).toBe(true)
  })
  it('Flut liegt oben, Ebbe unten', () => {
    const hoch = tagesPfade(new Array(288).fill(1), 100).linie
    const tief = tagesPfade(new Array(288).fill(0), 100).linie
    const y = (p: string) => Number(p.split(',')[1].split(/[A-Z]/)[0])
    expect(y(hoch)).toBeLessThan(y(tief))
  })
})

describe('Ausschlag', () => {
  it('Ebbe bis Flut nutzt den Goldenen Schnitt der Höhe (38,2 %), nicht die ganze', () => {
    const y = (p: string) => Number(p.split(',')[1].split(/[A-Z]/)[0])
    const hoch = y(tagesPfade(new Array(288).fill(1), 100).linie)
    const tief = y(tagesPfade(new Array(288).fill(0), 100).linie)
    expect(tief - hoch).toBeCloseTo(38.2, 0)
  })
})

describe('Uhrzeit und Scrollstelle', () => {
  it('Tagesbreite aus sichtbaren Stunden', () => {
    expect(tagBreite(600, 4)).toBe(3600)
    expect(tagBreite(600, 24)).toBe(600)
  })
  it('scrollFuer und zeitBei sind umkehrbar; die Uhrzeit steht in der Mitte', () => {
    const t = tagBreite(600, 4)
    expect(scrollFuer(6 * 60, 600, t)).toBe(t + t / 4 - 300)
    for (const m of [0, 30, 870, 1439]) {
      const s = scrollFuer(m, 600, t)
      expect(s).toBe(endlos(s, t))
      expect(zeitBei(s, 600, t)).toBeCloseTo(m)
    }
  })
  it('zeitBei bleibt im Tag, auch in der ersten und dritten Kopie', () => {
    const t = 3600
    expect(zeitBei(t * 2 + 150 - 300, 600, t)).toBeCloseTo(60)
    expect(zeitBei(t - 150 - 300, 600, t)).toBeCloseTo(MIN_TAG - 60)
  })
  it('endlos springt um einen Tag zurück in die Mitte, ohne die Uhrzeit zu ändern', () => {
    const t = 3600
    expect(endlos(1000, t)).toBe(1000 + t)
    expect(endlos(6000, t)).toBe(6000 - t)
    expect(endlos(3000, t)).toBe(3000)
    expect(zeitBei(endlos(1000, t), 600, t)).toBeCloseTo(zeitBei(1000, 600, t))
  })
  it('naechste nimmt den kürzesten Weg über Mitternacht', () => {
    expect(naechste(1000, 4500, 3600)).toBe(4600)
    expect(naechste(5000, 1500, 3600)).toBe(1400)
    expect(naechste(3000, 2900, 3600)).toBe(3000)
  })
  it('minutenAmTag', () => {
    expect(minutenAmTag(um(14, 30))).toBe(870)
  })
})

describe('stundenSchritt', () => {
  it('beschriftet jede Stunde, wenn Platz ist, sonst jede zweite, dritte …', () => {
    expect(stundenSchritt(150)).toBe(1)
    expect(stundenSchritt(20)).toBe(2)
    expect(stundenSchritt(15)).toBe(3)
    expect(stundenSchritt(1)).toBe(6)
  })
})

describe('termineImZeitraum', () => {
  const e = (id: string, beginn?: string, ende?: string): Eintrag => ({
    id, art: 'termin', titel: id, erledigt: false, erstellt: '', geaendert: '', beginn, ende,
  })
  it('liefert nur Termine mit Zeit, die den Zeitraum berühren', () => {
    const liste = [
      e('davor', um(6).toISOString(), um(7).toISOString()),
      e('drin', um(9).toISOString(), um(10).toISOString()),
      e('ragt', um(7).toISOString(), um(8, 30).toISOString()),
      e('ohne'),
    ]
    expect(termineImZeitraum(liste, um(8), um(12)).map((x) => x.id)).toEqual(['drin', 'ragt'])
  })
})

describe('ausduennen', () => {
  it('nimmt jede n-te Marke, so dass zwischen zwei gezeigten mindestens der Platz liegt', () => {
    // Marken alle 2 Stunden, 30 px je Stunde: 60 px Abstand; 110 px verlangt jede zweite.
    expect(ausduennen([0, 2, 4, 6, 8], 2, 30, 110)).toEqual([0, 4, 8])
  })
  it('lässt alle stehen, wenn genug Platz ist', () => {
    expect(ausduennen([0, 1, 2], 1, 200, 110)).toEqual([0, 1, 2])
  })
})
