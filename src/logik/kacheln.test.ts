import { describe, expect, it } from 'vitest'
import {
  alsLayout,
  anordnungAusDaten,
  ausblenden,
  ausLayout,
  einblenden,
  groesseAendern,
  setzeGroesse,
  spalten,
  verschiebe,
  werkszustand,
  type Anordnung,
  type KachelPlan,
} from './kacheln'

const plan: readonly KachelPlan[] = [
  { id: 'a', name: 'A', min: { pc: { w: 3, h: 2 }, handy: { w: 1, h: 2 } }, werk: { pc: { x: 0, y: 0, w: 6, h: 3 }, handy: { x: 0, y: 0, w: 2, h: 3 } } },
  { id: 'b', name: 'B', min: { pc: { w: 2, h: 2 }, handy: { w: 1, h: 2 } }, werk: { pc: { x: 6, y: 0, w: 6, h: 3 }, handy: { x: 0, y: 3, w: 1, h: 2 } } },
  { id: 'c', name: 'C', min: { pc: { w: 2, h: 2 }, handy: { w: 1, h: 2 } }, werk: { pc: { x: 0, y: 3, w: 4, h: 2 }, handy: { x: 1, y: 3, w: 1, h: 2 } } },
]

const ueberlappt = (a: Anordnung) => {
  const p = Object.values(a.plaetze)
  return p.some((m, i) => p.some((n, j) => i < j && m.x < n.x + n.w && n.x < m.x + m.w && m.y < n.y + n.h && n.y < m.y + m.h))
}

describe('kacheln', () => {
  it('Raster hat 12 Spalten am PC und 2 am Handy', () => {
    expect(spalten).toEqual({ pc: 12, handy: 2 })
  })

  it('Werkszustand nimmt die Plätze aus dem Plan, nichts ist ausgeblendet', () => {
    const w = werkszustand(plan, 'handy')
    expect(w.plaetze.b).toEqual({ x: 0, y: 3, w: 1, h: 2 })
    expect(w.versteckt).toEqual([])
  })

  it('gemerkte Daten: Unbekanntes fällt weg, Fehlendes kommt aus dem Werk, Unlesbares ergibt das Werk', () => {
    const a = anordnungAusDaten({ plaetze: { a: { x: 0, y: 0, w: 4, h: 2 }, zz: { x: 0, y: 0, w: 1, h: 1 }, b: { x: 'x' } }, versteckt: ['c', 'zz'] }, plan, 'pc')
    expect(a.plaetze.a).toEqual({ x: 0, y: 0, w: 4, h: 2 })
    expect(a.plaetze.zz).toBeUndefined()
    expect(a.plaetze.b).toEqual(plan[1].werk.pc)
    expect(a.versteckt).toEqual(['c'])
    expect(anordnungAusDaten('kaputt', plan, 'pc')).toEqual(werkszustand(plan, 'pc'))
    expect(anordnungAusDaten(null, plan, 'pc')).toEqual(werkszustand(plan, 'pc'))
  })

  it('gemerkte Daten halten Mindestgröße und Spaltenzahl ein', () => {
    const a = anordnungAusDaten({ plaetze: { a: { x: 11, y: 0, w: 1, h: 1 } }, versteckt: [] }, plan, 'pc')
    expect(a.plaetze.a).toMatchObject({ x: 9, w: 3, h: 2 })
    const h = anordnungAusDaten({ plaetze: { a: { x: 0, y: 0, w: 9, h: 3 } }, versteckt: [] }, plan, 'handy')
    expect(h.plaetze.a.w).toBe(2)
  })

  it('feste Größen: Breit nimmt die ganze Zeile, nichts überlappt danach', () => {
    const a = setzeGroesse(werkszustand(plan, 'pc'), plan, 'pc', 'c', 'breit')
    expect(a.plaetze.c).toMatchObject({ x: 0, w: 12 })
    expect(ueberlappt(a)).toBe(false)
  })

  it('feste Größe unter der Mindestgröße wird angehoben', () => {
    const p: KachelPlan[] = [{ ...plan[0], min: { pc: { w: 5, h: 4 }, handy: { w: 2, h: 3 } } }]
    expect(setzeGroesse(werkszustand(p, 'pc'), p, 'pc', 'a', 'klein').plaetze.a).toMatchObject({ w: 5, h: 4 })
  })

  it('Pfeiltasten verschieben, am Rand bleibt die Kachel stehen', () => {
    const w = werkszustand(plan, 'pc')
    expect(verschiebe(w, plan, 'pc', 'c', 1, 0).plaetze.c.x).toBe(1)
    expect(verschiebe(w, plan, 'pc', 'a', -1, 0)).toBe(w)
    const rechts = verschiebe(w, plan, 'pc', 'b', 1, 0)
    expect(rechts.plaetze.b.x).toBe(6)
  })

  it('nach unten verschieben tauscht mit der Kachel darunter, ohne Überlappung', () => {
    const w = werkszustand(plan, 'handy')
    const a = verschiebe(w, plan, 'handy', 'a', 0, 1)
    expect(a.plaetze.a.y).toBeGreaterThan(0)
    expect(ueberlappt(a)).toBe(false)
  })

  it('Umschalt und Pfeiltasten ändern die Größe innerhalb der Grenzen', () => {
    const w = werkszustand(plan, 'pc')
    expect(groesseAendern(w, plan, 'pc', 'c', 1, 1).plaetze.c).toMatchObject({ w: 5, h: 3 })
    expect(groesseAendern(w, plan, 'pc', 'c', -3, 0).plaetze.c.w).toBe(2)
    expect(groesseAendern(w, plan, 'pc', 'b', 1, 0)).toBe(w)
  })

  it('Ausblenden und Einblenden', () => {
    const w = werkszustand(plan, 'pc')
    const weg = ausblenden(w, 'b')
    expect(weg.versteckt).toEqual(['b'])
    expect(alsLayout(weg, plan, 'pc').map((l) => l.i)).toEqual(['a', 'c'])
    const da = einblenden(weg, plan, 'pc', 'b')
    expect(da.versteckt).toEqual([])
    expect(ueberlappt(da)).toBe(false)
  })

  it('Layout des Bausteins hin und zurück, mit Mindestgröße', () => {
    const w = werkszustand(plan, 'pc')
    const l = alsLayout(w, plan, 'pc')
    expect(l[0]).toMatchObject({ i: 'a', minW: 3, minH: 2 })
    const neu = ausLayout(w, [{ i: 'a', x: 0, y: 0, w: 8, h: 3 }])
    expect(neu.plaetze.a.w).toBe(8)
    expect(neu.plaetze.b).toEqual(w.plaetze.b)
    expect(ausLayout(w, l)).toBe(w)
  })
})
