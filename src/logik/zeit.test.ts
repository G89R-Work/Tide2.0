import { describe, expect, it } from 'vitest'
import { ausSchluessel, dauerText, monatsTage, tagSchluessel, uhrzeit, versatzMinuten, versatzText } from './zeit'

describe('uhrzeit', () => {
  it('schreibt Stunden und Minuten zweistellig', () => {
    expect(uhrzeit(new Date(2026, 10, 13, 7, 5))).toBe('07:05')
    expect(uhrzeit(new Date(2026, 10, 13, 23, 59).getTime())).toBe('23:59')
    expect(uhrzeit(new Date(2026, 10, 13, 9, 30).toISOString())).toBe('09:30')
  })

  it('zeigt die Uhrzeit in einer anderen Zeitzone', () => {
    const t = new Date(Date.UTC(2026, 10, 13, 23, 5))
    expect(uhrzeit(t, 'America/New_York')).toBe('18:05')
    expect(uhrzeit(t, 'Asia/Tokyo')).toBe('08:05')
    expect(uhrzeit(t, 'Asia/Kolkata')).toBe('04:35')
  })
})

describe('versatzMinuten', () => {
  it('nennt den Abstand einer Zeitzone zu UTC, mit Sommerzeit', () => {
    expect(versatzMinuten(new Date(Date.UTC(2026, 10, 13, 12)), 'America/New_York')).toBe(-300)
    expect(versatzMinuten(new Date(Date.UTC(2026, 6, 13, 12)), 'America/New_York')).toBe(-240)
    expect(versatzMinuten(new Date(Date.UTC(2026, 10, 13, 12)), 'Asia/Kolkata')).toBe(330)
    expect(versatzMinuten(new Date(Date.UTC(2026, 10, 13, 12)), 'UTC')).toBe(0)
  })

  it('folgt der Umstellung in Deutschland', () => {
    expect(versatzMinuten(new Date(Date.UTC(2026, 2, 29, 0, 59)), 'Europe/Berlin')).toBe(60)
    expect(versatzMinuten(new Date(Date.UTC(2026, 2, 29, 1, 0)), 'Europe/Berlin')).toBe(120)
  })
})

describe('dauerText', () => {
  it('schreibt Minuten, Stunden oder beides', () => {
    expect(dauerText(45)).toBe('45 Min.')
    expect(dauerText(120)).toBe('2 Std.')
    expect(dauerText(200)).toBe('3 Std. 20 Min.')
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

describe('versatzText', () => {
  it('schreibt den Abstand mit Vorzeichen', () => {
    expect(versatzText(0)).toBe('gleiche Zeit')
    expect(versatzText(480)).toBe('+8 Std.')
    expect(versatzText(-270)).toBe('−4 Std. 30 Min.')
  })
})
