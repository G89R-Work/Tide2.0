import { describe, expect, it } from 'vitest'
import { ausSchluessel, monatsTage, tagSchluessel, uhrzeit } from './zeit'

describe('uhrzeit', () => {
  it('schreibt Stunden und Minuten zweistellig', () => {
    expect(uhrzeit(new Date(2026, 10, 13, 7, 5))).toBe('07:05')
    expect(uhrzeit(new Date(2026, 10, 13, 23, 59).getTime())).toBe('23:59')
    expect(uhrzeit(new Date(2026, 10, 13, 9, 30).toISOString())).toBe('09:30')
  })
})

describe('tagSchluessel', () => {
  it('schreibt den Ortstag als Jahr-Monat-Tag', () => {
    expect(tagSchluessel(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01')
  })
})

describe('ausSchluessel', () => {
  it('liest einen gültigen Tag als Mitternacht', () => {
    expect(ausSchluessel('2026-11-13')).toEqual(new Date(2026, 10, 13))
  })

  it('lehnt unmögliche und schief geschriebene Tage ab', () => {
    expect(ausSchluessel('2026-02-30')).toBeNull()
    expect(ausSchluessel('2026-1-3')).toBeNull()
    expect(ausSchluessel('morgen')).toBeNull()
  })
})

describe('monatsTage', () => {
  it('liefert alle Tage des Monats als Mitternächte, auch im Februar und über die Zeitumstellung', () => {
    expect(monatsTage(new Date(2026, 10, 12, 9))).toHaveLength(30)
    expect(monatsTage(new Date(2028, 1, 10))).toHaveLength(29)
    const oktober = monatsTage(new Date(2026, 9, 5))
    expect(oktober).toHaveLength(31)
    for (const t of oktober) expect(t.getHours()).toBe(0)
  })
})
