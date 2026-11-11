import { describe, expect, it } from 'vitest'
import { begruessung, tageszeit } from './tageszeit'

const um = (stunde: number, minute = 0) => new Date(2026, 10, 11, stunde, minute)

describe('tageszeit', () => {
  it.each([
    [0, 'nacht'],
    [4, 'nacht'],
    [5, 'morgen'],
    [10, 'morgen'],
    [11, 'tag'],
    [17, 'tag'],
    [18, 'abend'],
    [21, 'abend'],
    [22, 'nacht'],
    [23, 'nacht'],
  ] as const)('%i Uhr ist %s', (stunde, erwartet) => {
    expect(tageszeit(um(stunde))).toBe(erwartet)
  })

  it('wechselt genau zur vollen Stunde', () => {
    expect(tageszeit(um(4, 59))).toBe('nacht')
    expect(tageszeit(um(5, 0))).toBe('morgen')
  })
})

describe('begruessung', () => {
  it('passt zur Tageszeit', () => {
    expect(begruessung(um(7))).toBe('Guten Morgen')
    expect(begruessung(um(14))).toBe('Guten Tag')
    expect(begruessung(um(19))).toBe('Guten Abend')
    expect(begruessung(um(2))).toBe('Gute Nacht')
  })
})
