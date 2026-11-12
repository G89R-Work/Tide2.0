import { describe, expect, it } from 'vitest'
import { feiertage } from './feiertage'

describe('feiertage', () => {
  it('kennt die bundesweiten Feiertage', () => {
    const f = feiertage(2026, 'bund')
    expect(f.get('2026-10-03')).toBe('Tag der Deutschen Einheit')
    expect(f.get('2026-12-25')).toBe('1. Weihnachtstag')
    expect(f.has('2026-11-01')).toBe(false)
  })

  it('gibt je Bundesland andere Feiertage', () => {
    expect(feiertage(2026, 'by').has('2026-01-06')).toBe(true)
    expect(feiertage(2026, 'be').has('2026-01-06')).toBe(false)
    expect(feiertage(2026, 'be').has('2026-03-08')).toBe(true)
    expect(feiertage(2026, 'sn').has('2026-11-18')).toBe(true)
    expect(feiertage(2026, 'nw').has('2026-11-18')).toBe(false)
  })

  it('nimmt nur gesetzliche Feiertage, keine Gedenk- oder Brauchtumstage', () => {
    expect(feiertage(2026, 'bund').has('2026-12-24')).toBe(false)
    expect(feiertage(2026, 'bund').has('2026-02-14')).toBe(false)
  })

  it('ergibt bei unbekanntem Kürzel die bundesweiten', () => {
    expect([...feiertage(2026, 'xx').keys()]).toEqual([...feiertage(2026, 'bund').keys()])
  })
})
