import { describe, expect, it } from 'vitest'
import { leisteLage } from './leisteLage'

const basis = { leiste: 147, links: 0, kurve: 80, griff: 8, rand: 8, kurveOben: false }

describe('leisteLage', () => {
  it('endet über der Kurve, solange die Kurve unter die Leiste reicht', () => {
    expect(leisteLage(basis)).toEqual({ oben: 8, unten: 88 })
    expect(leisteLage({ ...basis, links: 146 })).toEqual({ oben: 8, unten: 88 })
  })
  it('wächst bis zum Rand, sobald links neben der Kurve Platz für die ganze Leiste ist', () => {
    expect(leisteLage({ ...basis, links: 147 })).toEqual({ oben: 8, unten: 8 })
    expect(leisteLage({ ...basis, links: 400 })).toEqual({ oben: 8, unten: 8 })
  })
  it('liegt die Kurve oben, gilt dasselbe nach oben', () => {
    expect(leisteLage({ ...basis, kurveOben: true })).toEqual({ oben: 88, unten: 8 })
    expect(leisteLage({ ...basis, kurveOben: true, links: 200 })).toEqual({ oben: 8, unten: 8 })
  })
  it('ohne gemessene Kurve (Handy, noch nicht gemessen) bleibt die Leiste ganz', () => {
    expect(leisteLage({ ...basis, kurve: 0 })).toEqual({ oben: 8, unten: 8 })
  })
})
