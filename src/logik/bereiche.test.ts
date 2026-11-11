import { describe, expect, it } from 'vitest'
import { bereiche, bereichAusMarke } from './bereiche'

describe('bereiche', () => {
  it('sind neun Bereiche und die Einstellungen, Heute zuerst, Einstellungen zuletzt', () => {
    expect(bereiche).toHaveLength(10)
    expect(bereiche[0].id).toBe('heute')
    expect(bereiche.at(-1)?.id).toBe('einstellungen')
  })

  it('haben eindeutige Kennungen und Namen', () => {
    expect(new Set(bereiche.map((b) => b.id)).size).toBe(10)
    expect(new Set(bereiche.map((b) => b.name)).size).toBe(10)
  })
})

describe('bereichAusMarke', () => {
  it('erkennt jeden Bereich an seiner Sprungmarke', () => {
    for (const b of bereiche) expect(bereichAusMarke(`#${b.id}`)).toBe(b.id)
  })

  it('führt ohne oder bei unbekannter Marke zu Heute', () => {
    expect(bereichAusMarke('')).toBe('heute')
    expect(bereichAusMarke('#')).toBe('heute')
    expect(bereichAusMarke('#gibtsnicht')).toBe('heute')
    expect(bereichAusMarke('#toString')).toBe('heute')
  })
})
