import { describe, expect, it } from 'vitest'
import {
  alsLayout,
  anordnungAusDaten,
  ablegen,
  aufBildschirm,
  ausblenden,
  ausLayout,
  einblenden,
  getroffen,
  stehenLassen,
  groesseAendern,
  hatHintergrund,
  hintergrundUmschalten,
  kleinste,
  linien,
  setzeGroesse,
  verankern,
  verschiebe,
  werkszustand,
  type Anordnung,
  type KachelPlan,
  type Raster,
} from './kacheln'

// Erfundener Plan: PC in 12-px-Linien (sichtbar = Linien × 12 − 12), Handy in 2 Spalten.
const plan: readonly KachelPlan[] = [
  { id: 'a', name: 'A', werk: { pc: { x: 0, y: 0, w: 30, h: 10 }, handy: { x: 0, y: 0, w: 2, h: 3 } } },
  { id: 'b', name: 'B', werk: { pc: { x: 0, y: 0, w: 20, h: 10, rechts: true }, handy: { x: 0, y: 3, w: 1, h: 2 } } },
  { id: 'c', name: 'C', werk: { pc: { x: 0, y: 0, w: 20, h: 5, unten: true }, handy: { x: 1, y: 3, w: 1, h: 2 } } },
]

const pc = (spalten: number, zeilen: number): Raster => ({ geraet: 'pc', spalten, zeilen })
const handy: Raster = { geraet: 'handy', spalten: 2, zeilen: 12 }

const ueberlappt = (a: Anordnung) => {
  const p = Object.values(a.plaetze)
  return p.some((m, i) => p.some((n, j) => i < j && m.x < n.x + n.w && n.x < m.x + m.w && m.y < n.y + n.h && n.y < m.y + m.h))
}

describe('Raster aus Linien', () => {
  it('Die Zahl der Linien wird gerundet, damit die letzte genau am Ende liegt', () => {
    // Tablet: 833 px sichtbar plus ein Abstand = 845 px Raster, 70 Linien zu je 12,07 px.
    expect(linien(845, 12)).toBe(70)
    expect(linien(1285, 12)).toBe(107)
    expect(linien(473, 12)).toBe(39)
  })

  it('Auch ohne Platz gibt es eine Linie', () => {
    expect(linien(0, 12)).toBe(1)
  })

  it('Kleinste Kachel ist am PC 3 Linien (24 px sichtbar), am Handy ein Feld', () => {
    expect(kleinste.pc).toEqual({ w: 3, h: 3 })
    expect(kleinste.handy).toEqual({ w: 1, h: 1 })
  })
})

describe('kacheln', () => {
  it('Werkszustand nimmt die Plätze aus dem Plan, nichts ist ausgeblendet', () => {
    const w = werkszustand(plan, 'handy')
    expect(w.plaetze.b).toEqual({ x: 0, y: 3, w: 1, h: 2 })
    expect(w.versteckt).toEqual([])
  })

  it('Gemerkte Daten: Unbekanntes fällt weg, Fehlendes kommt aus dem Werk, Unlesbares ergibt das Werk', () => {
    const a = anordnungAusDaten({ plaetze: { a: { x: 0, y: 0, w: 4, h: 2, rechts: true }, zz: { x: 0, y: 0, w: 1, h: 1 }, b: { x: 'x' } }, versteckt: ['c', 'zz'] }, plan, 'pc')
    expect(a.plaetze.a).toEqual({ x: 0, y: 0, w: 4, h: 2, rechts: true })
    expect(a.plaetze.zz).toBeUndefined()
    expect(a.plaetze.b).toEqual(plan[1].werk.pc)
    expect(a.versteckt).toEqual(['c'])
    expect(anordnungAusDaten('kaputt', plan, 'pc')).toEqual(werkszustand(plan, 'pc'))
    expect(anordnungAusDaten(null, plan, 'pc')).toEqual(werkszustand(plan, 'pc'))
  })

  it('Anordnungen aus dem alten Spalten-Raster (mit `fein`) ergeben das Werk', () => {
    expect(anordnungAusDaten({ plaetze: { a: { x: 0, y: 0, w: 6, h: 3 } }, versteckt: ['b'], fein: 1 }, plan, 'pc')).toEqual(werkszustand(plan, 'pc'))
  })

  it('Auf dem Bildschirm: unten und rechts angedockte Kacheln zählen vom Rand, gezeigt wird von oben links', () => {
    const w = werkszustand(plan, 'pc')
    expect(aufBildschirm(w, plan, pc(70, 39)).plaetze).toEqual({
      a: { x: 0, y: 0, w: 30, h: 10 },
      b: { x: 50, y: 0, w: 20, h: 10 },
      c: { x: 0, y: 34, w: 20, h: 5 },
    })
    // Auf dem großen Bildschirm wächst nur der Platz dazwischen; jede Kachel bleibt gleich groß.
    expect(aufBildschirm(w, plan, pc(147, 76)).plaetze).toEqual({
      a: { x: 0, y: 0, w: 30, h: 10 },
      b: { x: 127, y: 0, w: 20, h: 10 },
      c: { x: 0, y: 71, w: 20, h: 5 },
    })
  })

  it('Auf einem zu kleinen Bildschirm passt sich die Breite an, und was im Weg liegt, rutscht nach unten', () => {
    const w = werkszustand(plan, 'pc')
    const eng = aufBildschirm(w, plan, pc(40, 12))
    expect(eng.plaetze.b).toMatchObject({ x: 20, w: 20 })
    expect(eng.plaetze.a).toMatchObject({ x: 0, w: 30 })
    expect(ueberlappt(eng)).toBe(false)
    expect(aufBildschirm({ ...w, plaetze: { a: { x: 0, y: 0, w: 99, h: 10 } } }, plan, pc(40, 12)).plaetze.a.w).toBe(40)
  })

  it('Verankern: Mitte rechts dockt rechts an, Mitte unten dockt unten an', () => {
    const r = pc(70, 39)
    const bild = aufBildschirm(werkszustand(plan, 'pc'), plan, r)
    expect(verankern(bild, r)).toEqual(werkszustand(plan, 'pc'))
    // Was erst durch Scrollen sichtbar wird, hängt oben.
    expect(verankern({ ...bild, plaetze: { c: { x: 0, y: 39, w: 20, h: 5 } } }, r).plaetze.c).toEqual({ x: 0, y: 39, w: 20, h: 5 })
  })

  it('Bearbeiten verschiebt nichts: verankern und wieder zeigen ergibt denselben Bildschirm', () => {
    for (const r of [pc(70, 39), pc(107, 68), pc(147, 83)]) {
      const bild = aufBildschirm(werkszustand(plan, 'pc'), plan, r)
      const bewegt = verschiebe(bild, plan, r, 'a', 3, 2)
      expect(aufBildschirm(verankern(bewegt, r), plan, r)).toEqual(bewegt)
    }
  })

  it('Eine 24er-Kachel lässt sich anlegen, kleiner geht es nicht', () => {
    const r = pc(70, 39)
    const bild = aufBildschirm(werkszustand(plan, 'pc'), plan, r)
    expect(groesseAendern(bild, plan, r, 'c', -17, -2).plaetze.c).toMatchObject({ w: 3, h: 3 })
    expect(groesseAendern(bild, plan, r, 'c', -30, -9).plaetze.c).toMatchObject({ w: 3, h: 3 })
  })

  it('Umschalt und Pfeiltasten ändern die Größe nur bis zum Rand', () => {
    const r = pc(70, 39)
    const bild = aufBildschirm(werkszustand(plan, 'pc'), plan, r)
    expect(groesseAendern(bild, plan, r, 'b', 1, 0)).toBe(bild)
    expect(groesseAendern(bild, plan, r, 'c', 1, 0).plaetze.c.w).toBe(21)
  })

  it('Feste Größen: Breit nimmt die ganze Breite des Bildschirms', () => {
    const r = pc(70, 39)
    const bild = aufBildschirm(werkszustand(plan, 'pc'), plan, r)
    const breit = setzeGroesse(bild, plan, r, 'a', 'breit')
    expect(breit.plaetze.a).toMatchObject({ x: 0, w: 70 })
    expect(ueberlappt(breit)).toBe(false)
    expect(setzeGroesse(bild, plan, r, 'a', 'klein').plaetze.a).toMatchObject({ w: 5, h: 5 })
  })

  it('Ziehen über eine andere Kachel: getroffen ist nur, wer sich mit der gezogenen überschneidet', () => {
    const layout = [
      { i: 'a', x: 0, y: 0, w: 10, h: 10 },
      { i: 'b', x: 10, y: 0, w: 10, h: 10 },
      { i: 'c', x: 5, y: 5, w: 10, h: 10 },
    ]
    expect(getroffen(layout, 'c')).toEqual(['a', 'b'])
    expect(getroffen(layout, 'a')).toEqual(['c'])
    expect(getroffen([{ i: 'a', x: 0, y: 0, w: 10, h: 10 }, { i: 'b', x: 10, y: 0, w: 5, h: 5 }], 'a')).toEqual([])
    expect(getroffen(layout, 'x')).toEqual([])
  })

  it('Ablegen: die gezogene Kachel bleibt, wo sie losgelassen wird; wer im Weg liegt, weicht nach unten aus', () => {
    const r = pc(70, 39)
    const bild = aufBildschirm(werkszustand(plan, 'pc'), plan, r)
    const layout = alsLayout(bild, plan, 'pc').map((l) => (l.i === 'c' ? { ...l, x: 0, y: 0 } : l))
    const neu = ablegen(bild, plan, r, layout, 'c')
    expect(neu.plaetze.c).toMatchObject({ x: 0, y: 0 })
    expect(neu.plaetze.a.y).toBe(5)
    expect(ueberlappt(neu)).toBe(false)
  })

  it('Beim Ziehen bleiben alle anderen auf ihrem Platz, nur die gezogene bewegt sich', () => {
    const basis = [
      { i: 'a', x: 0, y: 0, w: 10, h: 10 },
      { i: 'b', x: 10, y: 0, w: 10, h: 10 },
    ]
    const geschoben = [
      { i: 'a', x: 5, y: 0, w: 10, h: 10 },
      { i: 'b', x: 10, y: 10, w: 10, h: 10 },
    ]
    expect(stehenLassen(geschoben, basis, 'a')).toEqual([
      { i: 'a', x: 5, y: 0, w: 10, h: 10 },
      { i: 'b', x: 10, y: 0, w: 10, h: 10 },
    ])
    expect(stehenLassen([...geschoben, { i: 'c', x: 0, y: 0, w: 1, h: 1 }], basis, 'a')[2]).toEqual({ i: 'c', x: 0, y: 0, w: 1, h: 1 })
  })

  it('Ablegen am alten Platz oder ohne die Kachel ändert nichts', () => {
    const r = pc(70, 39)
    const bild = aufBildschirm(werkszustand(plan, 'pc'), plan, r)
    expect(ablegen(bild, plan, r, alsLayout(bild, plan, 'pc'), 'c')).toBe(bild)
    expect(ablegen(bild, plan, r, alsLayout(bild, plan, 'pc'), 'x')).toBe(bild)
  })

  it('Pfeiltasten verschieben um eine Linie; wer im Weg liegt, weicht nach unten aus', () => {
    const r = pc(70, 39)
    const bild = aufBildschirm(werkszustand(plan, 'pc'), plan, r)
    expect(verschiebe(bild, plan, r, 'a', 1, 0).plaetze.a).toMatchObject({ x: 1, y: 0 })
    const drauf = verschiebe(bild, plan, r, 'c', 0, -34)
    expect(drauf.plaetze.c).toMatchObject({ y: 0 })
    expect(drauf.plaetze.a.y).toBe(5)
    expect(ueberlappt(drauf)).toBe(false)
  })

  it('Ausblenden und Einblenden', () => {
    const r = pc(70, 39)
    const w = aufBildschirm(werkszustand(plan, 'pc'), plan, r)
    const weg = ausblenden(w, 'b')
    expect(weg.versteckt).toEqual(['b'])
    expect(alsLayout(weg, plan, 'pc').map((l) => l.i)).toEqual(['a', 'c'])
    const da = einblenden(weg, plan, r, 'b')
    expect(da.versteckt).toEqual([])
    expect(da.plaetze.b).toMatchObject({ w: 20, h: 10 })
    expect(ueberlappt(da)).toBe(false)
  })

  it('Layout des Bausteins hin und zurück, mit kleinster Größe', () => {
    const w = werkszustand(plan, 'pc')
    const l = alsLayout(w, plan, 'pc')
    expect(l[0]).toMatchObject({ i: 'a', minW: 3, minH: 3 })
    const neu = ausLayout(w, [{ i: 'a', x: 0, y: 0, w: 8, h: 3 }])
    expect(neu.plaetze.a.w).toBe(8)
    expect(neu.plaetze.b).toEqual(w.plaetze.b)
    expect(ausLayout(w, l)).toBe(w)
  })

  it('Kachel ohne Werksplatz auf einem Gerät ist dort ab Werk ausgeblendet und kommt in Standardgröße zurück', () => {
    const mit: readonly KachelPlan[] = [...plan, { id: 'nurPc', name: 'Nur PC', werk: { pc: { x: 0, y: 20, w: 10, h: 5 }, handy: null } }]
    const w = werkszustand(mit, 'handy')
    expect(w.versteckt).toEqual(['nurPc'])
    expect(w.plaetze.nurPc).toBeUndefined()
    expect(anordnungAusDaten({ plaetze: {}, versteckt: [] }, mit, 'handy').versteckt).toEqual(['nurPc'])
    const da = einblenden(aufBildschirm(w, mit, handy), mit, handy, 'nurPc')
    expect(da.plaetze.nurPc).toMatchObject({ x: 0, w: 1, h: 2 })
    expect(ueberlappt(da)).toBe(false)
    expect(werkszustand(mit, 'pc').versteckt).toEqual([])
  })

  it('Hintergrund: ab Werk aus dem Plan, umschaltbar, gemerkt und wieder gelesen', () => {
    const ohne: readonly KachelPlan[] = [{ ...plan[0], hintergrund: false }, plan[1], plan[2]]
    const w = werkszustand(ohne, 'pc')
    expect(hatHintergrund(w, 'a')).toBe(false)
    expect(hatHintergrund(w, 'b')).toBe(true)
    const neu = hintergrundUmschalten(hintergrundUmschalten(w, 'a'), 'b')
    expect([hatHintergrund(neu, 'a'), hatHintergrund(neu, 'b')]).toEqual([true, false])
    expect(hintergrundUmschalten(neu, 'b')).toEqual({ ...neu, ohneHintergrund: [] })
    const gelesen = anordnungAusDaten({ plaetze: neu.plaetze, versteckt: [], ohneHintergrund: ['b', 'zz', 3] }, ohne, 'pc')
    expect(gelesen.ohneHintergrund).toEqual(['b'])
  })

  it('Daten ohne Angabe zum Hintergrund nehmen den Werkszustand', () => {
    const ohne: readonly KachelPlan[] = [{ ...plan[0], hintergrund: false }, plan[1], plan[2]]
    expect(anordnungAusDaten({ plaetze: {}, versteckt: [] }, ohne, 'pc').ohneHintergrund).toEqual(['a'])
  })
})
