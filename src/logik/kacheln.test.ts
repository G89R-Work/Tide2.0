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
  naechsteLuecke,
  stehenLassen,
  groesseAendern,
  hatHintergrund,
  hintergrundUmschalten,
  kleinste,
  setzeGroesse,
  verankern,
  verschiebe,
  werkszustand,
  zellRaster,
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

describe('Raster aus quadratischen Zellen', () => {
  it('Die Zelle ist Breite durch Spalten; sichtbar bleibt zwischen Kacheln ein Fünftel der Zelle', () => {
    // 16 Spalten auf 1200 px: Teilung t mit 16 t − t/5 = 1200, also t = 75,95 px; 12 Reihen passen in 900 px.
    const r = zellRaster(1200, 900, 16, 0.2)
    expect(r.zelle).toBeCloseTo(1200 / 15.8)
    expect(r.reihen).toBe(12)
    expect(r.abstand).toBeCloseTo(r.zelle * 0.2)
    // Die letzte Spalte endet genau am Rand; der Rest der Höhe geht gleichmäßig nach oben und unten.
    expect(r.links).toBeCloseTo(0)
    expect(16 * r.zelle - r.abstand + 2 * r.links).toBeCloseTo(1200)
    expect(r.reihen * r.zelle - r.abstand + 2 * r.oben).toBeCloseTo(900)
    expect(r.oben).toBeGreaterThanOrEqual(0)
  })

  it('Passt die Höhe nicht, wird die Zelle kleiner und bleibt quadratisch; der Rest geht nach links und rechts', () => {
    // Rundet die Zahl der Reihen auf, wäre die letzte zu hoch: dann bestimmt die Höhe die Zelle.
    const r = zellRaster(1000, 470, 16, 0.2)
    expect(r.reihen).toBe(8)
    expect(r.reihen * r.zelle - r.abstand).toBeCloseTo(470)
    expect(r.links).toBeGreaterThan(0)
    expect(16 * r.zelle - r.abstand + 2 * r.links).toBeCloseTo(1000)
  })

  it('Jede Spaltenzahl gibt Quadrate, die den Platz füllen; ohne Platz gibt es eine Reihe', () => {
    for (const s of [4, 12, 16, 22, 30]) {
      const r = zellRaster(1456, 820, s, 0.2)
      expect(r.links).toBeGreaterThanOrEqual(0)
      expect(r.oben).toBeGreaterThanOrEqual(0)
      // Der Rest ist kleiner als eine halbe Zelle.
      expect(Math.min(r.links, r.oben)).toBeLessThan(r.zelle / 2)
    }
    expect(zellRaster(400, 0, 4, 0.2).reihen).toBe(1)
  })

  it('Kleinste Kachel ist eine Zelle', () => {
    expect(kleinste).toEqual({ w: 1, h: 1 })
  })
})

describe('kacheln', () => {
  it('Werkszustand nimmt die Plätze aus dem Plan, nichts ist ausgeblendet', () => {
    const w = werkszustand(plan, 'handy')
    expect(w.plaetze.b).toEqual({ x: 0, y: 3, w: 1, h: 2 })
    expect(w.versteckt).toEqual([])
  })

  it('Gemerkte Daten: Unbekanntes fällt weg, Fehlendes kommt aus dem Werk, Unlesbares ergibt das Werk', () => {
    const a = anordnungAusDaten({ raster: 'zellen', plaetze: { a: { x: 0, y: 0, w: 4, h: 2, rechts: true }, zz: { x: 0, y: 0, w: 1, h: 1 }, b: { x: 'x' } }, versteckt: ['c', 'zz'] }, plan, 'pc')
    expect(a.plaetze.a).toEqual({ x: 0, y: 0, w: 4, h: 2, rechts: true })
    expect(a.plaetze.zz).toBeUndefined()
    expect(a.plaetze.b).toEqual(plan[1].werk.pc)
    expect(a.versteckt).toEqual(['c'])
    expect(anordnungAusDaten('kaputt', plan, 'pc')).toEqual(werkszustand(plan, 'pc'))
    expect(anordnungAusDaten(null, plan, 'pc')).toEqual(werkszustand(plan, 'pc'))
  })

  it('Anordnungen aus einem älteren Raster (ohne `raster: zellen`) ergeben das Werk', () => {
    expect(anordnungAusDaten({ plaetze: { a: { x: 0, y: 0, w: 6, h: 3 } }, versteckt: ['b'], fein: 1 }, plan, 'pc')).toEqual(werkszustand(plan, 'pc'))
    expect(anordnungAusDaten({ plaetze: { a: { x: 0, y: 0, w: 6, h: 3 } }, versteckt: ['b'] }, plan, 'pc')).toEqual(werkszustand(plan, 'pc'))
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

  it('Eine Kachel aus einer Zelle lässt sich anlegen, kleiner geht es nicht', () => {
    const r = pc(70, 39)
    const bild = aufBildschirm(werkszustand(plan, 'pc'), plan, r)
    expect(groesseAendern(bild, plan, r, 'c', -19, -4).plaetze.c).toMatchObject({ w: 1, h: 1 })
    expect(groesseAendern(bild, plan, r, 'c', -30, -9).plaetze.c).toMatchObject({ w: 1, h: 1 })
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
    expect(setzeGroesse(bild, plan, r, 'a', 'klein').plaetze.a).toMatchObject({ w: 1, h: 1 })
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
    const layout = alsLayout(bild, plan).map((l) => (l.i === 'c' ? { ...l, x: 0, y: 0 } : l))
    const neu = ablegen(bild, plan, r, layout, 'c', true)
    expect(neu.plaetze.c).toMatchObject({ x: 0, y: 0 })
    expect(neu.plaetze.a.y).toBe(5)
    expect(ueberlappt(neu)).toBe(false)
  })

  it('Loslassen ohne Verweilen auf Besetztem: die Kachel kommt in die nächste freie Lücke, die anderen bleiben stehen', () => {
    const r = pc(10, 6)
    const a: Anordnung = { plaetze: { a: { x: 0, y: 0, w: 4, h: 2 }, b: { x: 6, y: 0, w: 2, h: 2 } }, versteckt: [], ohneHintergrund: [] }
    const zwei: readonly KachelPlan[] = plan.slice(0, 2)
    // b wird auf a gezogen (x 1, y 0): am nächsten frei ist es direkt unter a (2 Zellen), rechts neben a wären es 3.
    expect(naechsteLuecke(a, zwei, r, 'b', { x: 1, y: 0, w: 2, h: 2 })).toEqual({ x: 1, y: 2, w: 2, h: 2 })
    expect(naechsteLuecke(a, zwei, pc(10, 2), 'b', { x: 1, y: 0, w: 2, h: 2 })).toEqual({ x: 4, y: 0, w: 2, h: 2 })
    const layout = [{ i: 'a', x: 0, y: 0, w: 4, h: 2 }, { i: 'b', x: 1, y: 0, w: 2, h: 2 }]
    const neu = ablegen(a, zwei, r, layout, 'b', false)
    expect(neu.plaetze.a).toEqual({ x: 0, y: 0, w: 4, h: 2 })
    expect(neu.plaetze.b).toEqual({ x: 1, y: 2, w: 2, h: 2 })
  })

  it('Gibt es keine freie Lücke, springt die Kachel an ihren alten Platz zurück', () => {
    const r = pc(4, 2)
    const a: Anordnung = { plaetze: { a: { x: 0, y: 0, w: 2, h: 2 }, b: { x: 2, y: 0, w: 2, h: 2 } }, versteckt: [], ohneHintergrund: [] }
    const zwei: readonly KachelPlan[] = plan.slice(0, 2)
    // Der eigene alte Platz ist die einzige Lücke.
    expect(naechsteLuecke(a, zwei, r, 'b', { x: 0, y: 0, w: 2, h: 2 })).toEqual({ x: 2, y: 0, w: 2, h: 2 })
    expect(naechsteLuecke({ ...a, plaetze: { ...a.plaetze, a: { x: 0, y: 0, w: 4, h: 2 } } }, zwei, r, 'b', { x: 0, y: 0, w: 2, h: 2 })).toBeNull()
    expect(ablegen(a, zwei, r, [{ i: 'a', x: 0, y: 0, w: 2, h: 2 }, { i: 'b', x: 0, y: 0, w: 2, h: 2 }], 'b', false)).toBe(a)
  })

  it('Nach dem Verweilen rückt, wer im Weg liegt, in die nächste freie Lücke; nur ohne Lücke rutscht er nach unten', () => {
    const r = pc(10, 3)
    const zwei: readonly KachelPlan[] = plan.slice(0, 2)
    const a: Anordnung = { plaetze: { a: { x: 0, y: 2, w: 7, h: 1 }, b: { x: 8, y: 2, w: 1, h: 1 } }, versteckt: [], ohneHintergrund: [] }
    // b auf die Mitte von a: a passt eine Reihe darüber, statt unter den Bildschirm zu rutschen.
    const neu = ablegen(a, zwei, r, [{ i: 'a', x: 0, y: 2, w: 7, h: 1 }, { i: 'b', x: 3, y: 2, w: 1, h: 1 }], 'b', true)
    expect(neu.plaetze.b).toEqual({ x: 3, y: 2, w: 1, h: 1 })
    expect(neu.plaetze.a).toEqual({ x: 0, y: 1, w: 7, h: 1 })
    // Ist der Bildschirm sonst voll, rutscht a nach unten.
    const voll = ablegen(a, zwei, pc(7, 1), [{ i: 'a', x: 0, y: 0, w: 7, h: 1 }, { i: 'b', x: 3, y: 0, w: 1, h: 1 }], 'b', true)
    expect(voll.plaetze.a.y).toBe(1)
  })

  it('Nach dem Verweilen weichen die anderen aus; in keinem Fall bleibt eine Überlappung', () => {
    const r = pc(70, 39)
    const bild = aufBildschirm(werkszustand(plan, 'pc'), plan, r)
    for (const ausweichen of [true, false])
      for (const [x, y] of [[0, 0], [5, 3], [60, 0], [10, 34]]) {
        const layout = alsLayout(bild, plan).map((l) => (l.i === 'c' ? { ...l, x, y } : l))
        expect(ueberlappt(ablegen(bild, plan, r, layout, 'c', ausweichen))).toBe(false)
      }
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
    expect(ablegen(bild, plan, r, alsLayout(bild, plan), 'c', false)).toBe(bild)
    expect(ablegen(bild, plan, r, alsLayout(bild, plan), 'x', false)).toBe(bild)
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
    expect(alsLayout(weg, plan).map((l) => l.i)).toEqual(['a', 'c'])
    const da = einblenden(weg, plan, r, 'b')
    expect(da.versteckt).toEqual([])
    expect(da.plaetze.b).toMatchObject({ w: 20, h: 10 })
    expect(ueberlappt(da)).toBe(false)
  })

  it('Layout des Bausteins hin und zurück, mit kleinster Größe', () => {
    const w = werkszustand(plan, 'pc')
    const l = alsLayout(w, plan)
    expect(l[0]).toMatchObject({ i: 'a', minW: 1, minH: 1 })
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
    expect(anordnungAusDaten({ raster: 'zellen', plaetze: {}, versteckt: [] }, mit, 'handy').versteckt).toEqual(['nurPc'])
    const da = einblenden(aufBildschirm(w, mit, handy), mit, handy, 'nurPc')
    expect(da.plaetze.nurPc).toMatchObject({ x: 0, w: 1, h: 1 })
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
    const gelesen = anordnungAusDaten({ raster: 'zellen', plaetze: neu.plaetze, versteckt: [], ohneHintergrund: ['b', 'zz', 3] }, ohne, 'pc')
    expect(gelesen.ohneHintergrund).toEqual(['b'])
  })

  it('Daten ohne Angabe zum Hintergrund nehmen den Werkszustand', () => {
    const ohne: readonly KachelPlan[] = [{ ...plan[0], hintergrund: false }, plan[1], plan[2]]
    expect(anordnungAusDaten({ raster: 'zellen', plaetze: {}, versteckt: [] }, ohne, 'pc').ohneHintergrund).toEqual(['a'])
  })
})
