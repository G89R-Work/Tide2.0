import { describe, expect, it } from 'vitest'
import { anordnungAusDaten, werkszustand as werk } from '../../logik/kacheln'
import { werkszustand } from './werkszustand'

describe('Werkszustand von Heute', () => {
  it('liegt so, dass beim Ordnen nichts nachrückt, an PC und Handy', () => {
    for (const g of ['pc', 'handy'] as const) expect(anordnungAusDaten(null, werkszustand, g)).toEqual(werk(werkszustand, g))
  })

  it('zeigt die belegbaren Knöpfe nur am PC und Text ohne Hintergrund', () => {
    expect(werk(werkszustand, 'handy').versteckt).toContain('knoepfe')
    expect(werk(werkszustand, 'pc').ohneHintergrund).toEqual(['gruss', 'wetter', 'uhr', 'naechstes', 'knoepfe'])
  })
})
