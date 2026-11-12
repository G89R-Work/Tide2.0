import { describe, expect, it } from 'vitest'
import { flaeche, geruestRaster, type GeruestEingabe } from './geruestRaster'

// Tablet quer ohne Kopfzeile und Rand: 1464 × 852 px, 16 Spalten.
const tablet: GeruestEingabe = { breite: 1464, hoehe: 852, spalten: 16, anteil: 0.2, leiste: 'breit', leisteNamenPx: 140, ebenePx: 0, kurve: 2, kurveOben: false, vorrang: 'kurve' }

describe('Gerüst im Zellraster', () => {
  it('Kurve über die ganze Breite unten, Leiste links darüber, Inhalt im Rest', () => {
    const g = geruestRaster(tablet)
    expect(g.reihen).toBe(9)
    expect(g.kurve).toEqual({ x: 0, y: 7, w: 16, h: 2 })
    expect(g.leiste).toEqual({ x: 0, y: 0, w: 2, h: 7 })
    expect(g.ebene).toBeNull()
    expect(g.inhalt).toEqual({ x: 2, y: 0, w: 14, h: 7 })
  })

  it('Seitenleiste bis ganz unten: die Kurve beginnt rechts neben ihr', () => {
    const g = geruestRaster({ ...tablet, vorrang: 'leiste' })
    expect(g.leiste).toEqual({ x: 0, y: 0, w: 2, h: 9 })
    expect(g.kurve).toEqual({ x: 2, y: 7, w: 14, h: 2 })
    expect(g.inhalt).toEqual({ x: 2, y: 0, w: 14, h: 7 })
  })

  it('Schmale Leiste ist eine Zelle; die breite so viele, dass die Namen passen', () => {
    expect(geruestRaster({ ...tablet, leiste: 'schmal' }).leiste.w).toBe(1)
    // Bei 30 Spalten ist eine Zelle 49 px: für 140 px Namen braucht es 4 Zellen (4 · 49 − 10 = 186 ≥ 140, 3 Zellen wären 137).
    expect(geruestRaster({ ...tablet, spalten: 30 }).leiste.w).toBe(4)
  })

  it('Zweite Ebene liegt neben der Leiste, der Inhalt rückt nach', () => {
    const g = geruestRaster({ ...tablet, ebenePx: 220 })
    expect(g.ebene).toEqual({ x: 2, y: 0, w: 3, h: 7 })
    expect(g.inhalt).toEqual({ x: 5, y: 0, w: 11, h: 7 })
  })

  it('Kurve oben, oder aus: dann gehört ihr Platz dem Inhalt', () => {
    const oben = geruestRaster({ ...tablet, kurveOben: true })
    expect(oben.kurve).toEqual({ x: 0, y: 0, w: 16, h: 2 })
    expect(oben.leiste).toEqual({ x: 0, y: 2, w: 2, h: 7 })
    expect(oben.inhalt).toEqual({ x: 2, y: 2, w: 14, h: 7 })
    const aus = geruestRaster({ ...tablet, kurve: 0 })
    expect(aus.kurve).toBeNull()
    expect(aus.inhalt).toEqual({ x: 2, y: 0, w: 14, h: 9 })
  })

  it('Dem Inhalt bleibt immer mindestens eine Reihe und eine Spalte', () => {
    const g = geruestRaster({ ...tablet, hoehe: 200, kurve: 3, spalten: 4, ebenePx: 500 })
    expect(g.inhalt.h).toBeGreaterThanOrEqual(1)
    expect(g.inhalt.w).toBeGreaterThanOrEqual(1)
  })

  it('Fläche in Pixeln: Feld aus n Zellen ist n · Zelle − Abstand groß; das letzte endet genau am Rand', () => {
    const g = geruestRaster(tablet)
    const f = flaeche(g, { x: 2, y: 0, w: 14, h: 7 })
    expect(f.width).toBeCloseTo(14 * g.zelle - g.abstand)
    expect(f.height).toBeCloseTo(7 * g.zelle - g.abstand)
    expect(f.left).toBeCloseTo(g.links + 2 * g.zelle)
    expect(f.top).toBeCloseTo(g.oben)
    const k = flaeche(g, g.kurve!)
    expect(k.top + k.height + g.oben).toBeCloseTo(tablet.hoehe)
    expect(f.left + f.width + g.links).toBeCloseTo(tablet.breite)
  })
})
