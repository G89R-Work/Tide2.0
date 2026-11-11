import { describe, expect, it } from 'vitest'
import {
  abschnitte,
  einstellungen,
  einstellungenIn,
  istStandard,
  setze,
  suche,
  unterschied,
  werteAendern,
  werteAusDaten,
  wertVon,
  zuruecksetzen,
  type Einstellung,
} from './einstellungen'

const nach = (id: string): Einstellung => einstellungen.find((e) => e.id === id)!
const design = nach('design')
const schrift = nach('schriftgroesse') // gilt je Geräteart
const stunden = nach('kurve-stunden')

describe('Liste', () => {
  it('hat eindeutige Namen und gültige Standardwerte in bekannten Abschnitten', () => {
    const ids = new Set(einstellungen.map((e) => e.id))
    expect(ids.size).toBe(einstellungen.length)
    for (const e of einstellungen) {
      expect(abschnitte.some((a) => a.id === e.abschnitt), e.id).toBe(true)
      expect(e.id.includes('@'), e.id).toBe(false)
      expect(wertVon(e, {}, 'pc')).toBe(e.standard)
      const k = e.jeGeraet ? `${e.id}@pc` : e.id
      expect(werteAusDaten({ [k]: e.standard })).toEqual({ [k]: e.standard })
    }
  })
  it('zeigt auf der Startseite die grundlegenden Einstellungen', () => {
    expect(einstellungenIn('start').length).toBeGreaterThan(0)
    expect(einstellungenIn('start').every((e) => e.wichtig)).toBe(true)
    expect(einstellungenIn('darstellung')).toContain(design)
  })
})

describe('setze und wertVon', () => {
  it('merkt nur Abweichungen vom Standard', () => {
    const w = setze({}, design, 'pc', 'tinte')
    expect(w).toEqual({ design: 'tinte' })
    expect(wertVon(design, w, 'handy')).toBe('tinte')
    expect(setze(w, design, 'pc', 'glut')).toEqual({})
  })
  it('trennt Einstellungen je Geräteart', () => {
    const w = setze({}, schrift, 'handy', 'gross')
    expect(w).toEqual({ 'schriftgroesse@handy': 'gross' })
    expect(wertVon(schrift, w, 'handy')).toBe('gross')
    expect(wertVon(schrift, w, 'pc')).toBe(schrift.standard)
    expect(istStandard(schrift, w, 'pc')).toBe(true)
    expect(istStandard(schrift, w, 'handy')).toBe(false)
  })
  it('lehnt ungültige Werte ab und ändert dann nichts', () => {
    const w = {}
    expect(setze(w, design, 'pc', 'lila')).toBe(w)
    expect(setze(w, stunden, 'pc', 0)).toBe(w)
    expect(setze(w, stunden, 'pc', 2.5)).toBe(w)
    expect(setze(w, stunden, 'pc', true)).toBe(w)
  })
  it('lässt die alten Werte unverändert', () => {
    const w = { design: 'tinte' }
    setze(w, design, 'pc', 'glut')
    expect(w).toEqual({ design: 'tinte' })
  })
})

describe('zuruecksetzen', () => {
  it('setzt die genannten Einstellungen nur für diese Geräteart zurück', () => {
    const w = { design: 'tinte', 'schriftgroesse@pc': 'klein', 'schriftgroesse@handy': 'gross', 'kurve-stunden': 6 }
    expect(zuruecksetzen(w, [design, schrift], 'pc')).toEqual({ 'schriftgroesse@handy': 'gross', 'kurve-stunden': 6 })
  })
})

describe('suche', () => {
  it('findet über Name, Hilfe, Abschnitt und Auswahl, ohne auf Groß/klein und Umlaute zu achten', () => {
    expect(suche('SCHRIFT')).toContain(schrift)
    expect(suche('darstellung')).toContain(design)
    expect(suche('tinte')).toContain(design)
    expect(suche('stunden kurve')).toContain(stunden)
    expect(suche('schriftgrosse')).toContain(schrift)
  })
  it('liefert bei leerem Text alles und bei Unsinn nichts', () => {
    expect(suche('  ')).toEqual(einstellungen)
    expect(suche('xyzzy')).toEqual([])
  })
})

describe('Austausch mit dem Server', () => {
  it('werteAusDaten behält nur bekannte, gültige Werte', () => {
    expect(
      werteAusDaten({ design: 'tinte', 'schriftgroesse@handy': 'gross', 'schriftgroesse@tv': 'gross', design2: 1, 'kurve-stunden': 'viel' }),
    ).toEqual({ design: 'tinte', 'schriftgroesse@handy': 'gross' })
    expect(werteAusDaten(null)).toEqual({})
    expect(werteAusDaten([1])).toEqual({})
  })
  it('unterschied nennt Neues und Entferntes (null)', () => {
    expect(unterschied({ a: 1, b: true }, { a: 2, c: 'x' })).toEqual({ a: 2, b: null, c: 'x' })
    expect(unterschied({ a: 1 }, { a: 1 })).toEqual({})
  })
  it('werteAendern wendet einen Unterschied an', () => {
    const alt = { design: 'tinte', 'kurve-stunden': 6 }
    expect(werteAendern(alt, { design: null, 'kurve-stunden': 8 })).toEqual({ 'kurve-stunden': 8 })
    expect(alt).toEqual({ design: 'tinte', 'kurve-stunden': 6 })
  })
})
