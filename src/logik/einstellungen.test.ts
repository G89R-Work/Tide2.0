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
  kurveZeigen,
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

  it('nimmt beim Ort Nachkommastellen im Raster an, auch südlich und westlich', () => {
    const breite = nach('ort-breite')
    const laenge = nach('ort-laenge')
    expect(setze({}, breite, 'pc', -33.87)).toEqual({ 'ort-breite': -33.87 })
    expect(setze({}, laenge, 'pc', 151.21)).toEqual({ 'ort-laenge': 151.21 })
    expect(setze({}, breite, 'pc', 52.123)).toEqual({})
    expect(setze({}, breite, 'pc', 91)).toEqual({})
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

describe('Standard je Gerät', () => {
  it('Die Kurve zeigt am Handy ab Werk mehr Stunden als am PC', () => {
    expect(wertVon(stunden, {}, 'pc')).toBe(4)
    expect(wertVon(stunden, {}, 'handy')).toBe(6)
  })
  it('Der Handy-Standard gilt als Standard und wird nicht gemerkt', () => {
    expect(istStandard(stunden, {}, 'handy')).toBe(true)
    expect(setze({ 'kurve-stunden@handy': 5 }, stunden, 'handy', 6)).toEqual({})
    expect(setze({}, stunden, 'handy', 4)).toEqual({ 'kurve-stunden@handy': 4 })
  })
  it('Jeder Handy-Standard ist gültig und gilt nur für Einstellungen je Gerät', () => {
    for (const e of einstellungen.filter((e) => e.standardHandy !== undefined)) {
      expect(e.jeGeraet, e.id).toBe(true)
      expect(werteAusDaten({ [`${e.id}@handy`]: e.standardHandy })).toEqual({ [`${e.id}@handy`]: e.standardHandy })
    }
  })
})

describe('Kurve je Seite', () => {
  it('Jeder Bereich hat einen Schalter, ab Werk an', () => {
    for (const b of ['heute', 'postfach', 'einstellungen'] as const) {
      const e = kurveZeigen(b)
      expect(e.abschnitt).toBe('kurve')
      expect(wertVon(e, {}, 'pc')).toBe(true)
    }
  })
  it('Ausgeschaltet gilt nur für diese Seite und dieses Gerät', () => {
    const werte = setze({}, kurveZeigen('postfach'), 'handy', false)
    expect(wertVon(kurveZeigen('postfach'), werte, 'handy')).toBe(false)
    expect(wertVon(kurveZeigen('postfach'), werte, 'pc')).toBe(true)
    expect(wertVon(kurveZeigen('heute'), werte, 'handy')).toBe(true)
  })
  it('Die Suche findet den Schalter einer Seite', () => {
    expect(suche('kurve postfach')).toContain(kurveZeigen('postfach'))
  })
})
