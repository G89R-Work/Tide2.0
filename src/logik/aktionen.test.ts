import { describe, expect, it } from 'vitest'
import { abWerk, aktionen, aktionVon, aktionFuerKuerzel, belege, belegungAusText, kuerzelAus, plaetze } from './aktionen'

const taste = (code: string, mehr: Partial<Parameters<typeof kuerzelAus>[0]> = {}) => ({
  code,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  ...mehr,
})

describe('aktionen', () => {
  it('haben eindeutige Kennungen und eindeutige Kürzel', () => {
    const ids = aktionen.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    const kuerzel = aktionen.flatMap((a) => (a.kuerzel ? [a.kuerzel] : []))
    expect(new Set(kuerzel).size).toBe(kuerzel.length)
  })

  it('führen irgendwohin, führen einen Befehl aus oder sagen, wann sie kommen – genau eins davon', () => {
    for (const a of aktionen) expect([a.ziel, a.befehl, a.spaeter].filter(Boolean)).toHaveLength(1)
    expect(aktionVon('kurve')).toMatchObject({ befehl: true, kuerzel: 'Alt+K' })
  })

  it('enthält je Bereich eine Aktion zum Öffnen', () => {
    expect(aktionVon('bereich-postfach')?.ziel).toBe('#postfach')
    expect(aktionVon('gibt-es-nicht')).toBeUndefined()
  })
})

describe('abWerk', () => {
  it('belegt jeden Platz mit einer bekannten Aktion', () => {
    for (const ort of Object.keys(plaetze) as (keyof typeof plaetze)[]) {
      expect(abWerk[ort]).toHaveLength(plaetze[ort])
      for (const id of abWerk[ort]) expect(id === null || aktionVon(id)).toBeTruthy()
    }
  })

  it('oben rechts am Handy: Kurve, Suche, Einstellungen', () => {
    expect(abWerk.oben).toEqual(['kurve', 'suche', 'bereich-einstellungen'])
  })
})

describe('belegungAusText', () => {
  it('ohne Text gilt die Werkseinstellung', () => {
    expect(belegungAusText(null)).toEqual(abWerk)
  })

  it('unlesbarer Text führt zur Werkseinstellung', () => {
    expect(belegungAusText('{kaputt')).toEqual(abWerk)
    expect(belegungAusText('42')).toEqual(abWerk)
  })

  it('übernimmt Gemerktes und ersetzt Unbekanntes durch die Werkseinstellung', () => {
    const text = JSON.stringify({ pc: ['diktat', null, 'weg'], oben: 'quatsch' })
    const b = belegungAusText(text)
    expect(b.pc).toEqual(['diktat', null, abWerk.pc[2]])
    expect(b.oben).toEqual(abWerk.oben)
    expect(b.unten).toEqual(abWerk.unten)
  })

  it('kürzt zu lange und füllt zu kurze Listen auf', () => {
    const b = belegungAusText(JSON.stringify({ oben: ['diktat', 'diktat', 'diktat', 'diktat'], unten: ['suche'] }))
    expect(b.oben).toEqual(['diktat', 'diktat', 'diktat'])
    expect(b.unten).toEqual(['suche', ...abWerk.unten.slice(1)])
  })
})

describe('belege', () => {
  it('ändert genau einen Platz und lässt das Original unverändert', () => {
    const neu = belege(abWerk, 'oben', 1, 'diktat')
    expect(neu.oben).toEqual(['kurve', 'diktat', 'bereich-einstellungen'])
    expect(abWerk.oben[1]).toBe('suche')
    expect(neu.pc).toBe(abWerk.pc)
  })

  it('leert einen Platz mit null und ignoriert unbekannte Plätze und Aktionen', () => {
    expect(belege(abWerk, 'unten', 0, null).unten[0]).toBeNull()
    expect(belege(abWerk, 'oben', 7, 'diktat')).toBe(abWerk)
    expect(belege(abWerk, 'oben', 0, 'gibt-es-nicht')).toBe(abWerk)
  })
})

describe('kuerzelAus', () => {
  it('liest Alt mit Ziffer oder Buchstabe unabhängig vom Tastaturlayout', () => {
    expect(kuerzelAus(taste('Digit2', { altKey: true }), false)).toBe('Alt+2')
    expect(kuerzelAus(taste('KeyM', { altKey: true }), false)).toBe('Alt+M')
  })

  it('Strg und die Mac-Befehlstaste gelten gleich', () => {
    expect(kuerzelAus(taste('KeyK', { ctrlKey: true }), false)).toBe('Strg+K')
    expect(kuerzelAus(taste('KeyK', { metaKey: true }), false)).toBe('Strg+K')
  })

  it('ohne Zusatztaste, mit AltGr oder Umschalt ist es kein Kürzel', () => {
    expect(kuerzelAus(taste('KeyM'), false)).toBeNull()
    expect(kuerzelAus(taste('KeyM', { altKey: true, ctrlKey: true }), false)).toBeNull()
    expect(kuerzelAus(taste('KeyM', { altKey: true, shiftKey: true }), false)).toBeNull()
    expect(kuerzelAus(taste('Space', { altKey: true }), false)).toBeNull()
  })

  it('beim Schreiben in einem Feld gilt nur Strg', () => {
    expect(kuerzelAus(taste('KeyM', { altKey: true }), true)).toBeNull()
    expect(kuerzelAus(taste('KeyK', { ctrlKey: true }), true)).toBe('Strg+K')
  })
})

describe('aktionFuerKuerzel', () => {
  it('findet die Aktion zum Kürzel', () => {
    expect(aktionFuerKuerzel('Alt+1')?.id).toBe('bereich-heute')
    expect(aktionFuerKuerzel('Alt+0')?.id).toBe('bereich-einstellungen')
    expect(aktionFuerKuerzel('Alt+Q')).toBeUndefined()
  })
})
