import { describe, expect, it } from 'vitest'
import { tempoVerstoesse } from './tempoGrenzen'

const gut = { blur: 4, animationen: 0, wechselMs: 50, kilobyte: 120 }

describe('tempoVerstoesse', () => {
  it('meldet nichts, wenn alle Grenzen eingehalten sind', () => {
    expect(tempoVerstoesse(gut)).toEqual([])
  })
  it('meldet jede verletzte Grenze mit Wert und Grenze', () => {
    const v = tempoVerstoesse({ blur: 5, animationen: 2, wechselMs: 100, kilobyte: 210 })
    expect(v).toHaveLength(4)
    expect(v[0]).toContain('5')
    expect(v[0]).toContain('4')
  })
  it('prüft fehlende Messwerte nicht', () => {
    expect(tempoVerstoesse({ blur: 1 })).toEqual([])
  })
})
