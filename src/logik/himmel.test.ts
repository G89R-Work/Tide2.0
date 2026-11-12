import { describe, expect, it } from 'vitest'
import { himmel, himmelsLicht, mondPfad } from './himmel'

const kassel = { breite: 51.31, laenge: 9.49 }
const um = (iso: string) => new Date(iso)

describe('himmel', () => {
  it('Bogen: Sonne mittags oben in der Mitte, nach Untergang unsichtbar', () => {
    const mittag = himmel(um('2026-11-11T11:06:00Z'), kassel, 'bogen')
    expect(mittag.sonne.sichtbar).toBe(true)
    expect(mittag.sonne.x).toBeCloseTo(0.5, 1)
    expect(mittag.sonne.y).toBeCloseTo(1, 1)
    expect(himmel(um('2026-11-11T20:00:00Z'), kassel, 'bogen').sonne.sichtbar).toBe(false)
  })

  it('Bogen: kurz nach Aufgang links unten, kurz vor Untergang rechts unten', () => {
    const frueh = himmel(um('2026-11-11T06:45:00Z'), kassel, 'bogen').sonne
    const spaet = himmel(um('2026-11-11T15:25:00Z'), kassel, 'bogen').sonne
    expect(frueh.x).toBeLessThan(0.1)
    expect(frueh.y).toBeLessThan(0.2)
    expect(spaet.x).toBeGreaterThan(0.9)
  })

  it('Bogen ist jeden Tag gleich hoch, Echt im November flach und im Juni hoch', () => {
    const nov = himmel(um('2026-11-11T11:06:00Z'), kassel, 'echt').sonne
    const jun = himmel(um('2026-06-21T11:20:00Z'), kassel, 'echt').sonne
    expect(nov.y).toBeLessThan(0.3)
    expect(jun.y).toBeGreaterThan(0.6)
    expect(himmel(um('2026-06-21T11:20:00Z'), kassel, 'bogen').sonne.y).toBeCloseTo(1, 1)
  })

  it('Echt: Osten links, Süden Mitte, Westen rechts', () => {
    expect(himmel(um('2026-11-11T07:30:00Z'), kassel, 'echt').sonne.x).toBeLessThan(0.4)
    expect(himmel(um('2026-11-11T11:06:00Z'), kassel, 'echt').sonne.x).toBeCloseTo(0.5, 1)
    expect(himmel(um('2026-11-11T14:30:00Z'), kassel, 'echt').sonne.x).toBeGreaterThan(0.6)
  })

  it('nennt Auf- und Untergang und ob Tag ist', () => {
    const h = himmel(um('2026-11-11T11:00:00Z'), kassel, 'bogen')
    expect(h.aufgang?.toISOString()).toMatch(/^2026-11-11T06:3/)
    expect(h.untergang?.toISOString()).toMatch(/^2026-11-11T15:3/)
    expect(h.tag).toBe(true)
    expect(h.licht).toBeCloseTo(1, 1)
    expect(himmel(um('2026-11-11T22:00:00Z'), kassel, 'bogen').licht).toBe(0)
  })

  it('Mond: Phase und Beleuchtung, Bogen zwischen Auf- und Untergang', () => {
    const h = himmel(um('2026-11-11T12:48:00Z'), kassel, 'bogen')
    expect(h.mond.beleuchtet).toBeCloseTo(0.05, 1)
    expect(h.mond.sichtbar).toBe(true)
    expect(h.mond.x).toBeGreaterThan(0.3)
    expect(h.mond.x).toBeLessThan(0.7)
    expect(himmel(um('2026-11-11T20:00:00Z'), kassel, 'bogen').mond.sichtbar).toBe(false)
  })

  it('Polartag: Sonne bleibt sichtbar, obwohl es keinen Untergang gibt', () => {
    const h = himmel(um('2026-06-21T22:00:00Z'), { breite: 78.2, laenge: 15.6 }, 'bogen')
    expect(h.aufgang).toBeNull()
    expect(h.sonne.sichtbar).toBe(true)
  })

  it('Mond im Bogen stimmt mit seiner echten Höhe überein, auch über Mitternacht', () => {
    for (let s = 0; s < 14 * 24; s++) {
      const zeit = new Date(Date.UTC(2026, 10, 1, s))
      const echt = himmel(zeit, kassel, 'echt').mond
      const bogen = himmel(zeit, kassel, 'bogen').mond
      if (echt.y > 0.03) expect(bogen.sichtbar, zeit.toISOString()).toBe(true)
      if (!echt.sichtbar) expect(bogen.sichtbar, zeit.toISOString()).toBe(false)
    }
  })

  it('Umstellung auf Sommerzeit: mittags um 13:20 deutscher Zeit steht die Sonne oben', () => {
    const h = himmel(um('2026-03-29T13:20:00+02:00'), kassel, 'bogen')
    expect(h.sonne.y).toBeCloseTo(1, 1)
    expect(h.aufgang?.toISOString()).toMatch(/^2026-03-29T05:/)
  })

  it('jede Position bleibt im Bild', () => {
    for (let s = 0; s < 48; s++) {
      const h = himmel(new Date(Date.UTC(2026, 5, 21, 0, s * 30)), kassel, 'echt')
      for (const k of [h.sonne, h.mond]) {
        expect(k.x).toBeGreaterThanOrEqual(0)
        expect(k.x).toBeLessThanOrEqual(1)
        expect(k.y).toBeGreaterThanOrEqual(0)
        expect(k.y).toBeLessThanOrEqual(1)
      }
    }
  })
})

describe('mondPfad', () => {
  it('Sichel wölbt den Schatten nach oben, Dreiviertel nach unten', () => {
    expect(mondPfad(0.2)).toBe('M -1 0 A 1 1 0 0 1 1 0 A 1 0.6 0 0 0 -1 0 Z')
    expect(mondPfad(0.8)).toBe('M -1 0 A 1 1 0 0 1 1 0 A 1 0.6 0 0 1 -1 0 Z')
  })
})

describe('himmelsLicht', () => {
  const ohneMond = { hoehe: -10, beleuchtet: 0 }

  it('Mittag ist am hellsten, auch im November mit flacher Sonne', () => {
    expect(himmelsLicht(20, 20, ohneMond).hell).toBe(1)
    expect(himmelsLicht(62, 62, ohneMond).hell).toBe(1)
  })

  it('Nacht ist dunkel, Dämmerung bis 6 Grad unter dem Horizont wird heller', () => {
    expect(himmelsLicht(-30, 20, ohneMond).hell).toBe(0)
    expect(himmelsLicht(-6, 20, ohneMond).hell).toBe(0)
    const daemmerung = himmelsLicht(-3, 20, ohneMond).hell
    const aufgang = himmelsLicht(0, 20, ohneMond).hell
    expect(daemmerung).toBeGreaterThan(0)
    expect(aufgang).toBeGreaterThan(daemmerung)
    expect(aufgang).toBeLessThan(0.5)
  })

  it('Vormittag liegt zwischen Aufgang und Mittag', () => {
    const vormittag = himmelsLicht(10, 20, ohneMond).hell
    expect(vormittag).toBeGreaterThan(himmelsLicht(0, 20, ohneMond).hell)
    expect(vormittag).toBeLessThan(1)
  })

  it('Wärme ist bei Auf- und Untergang am größten, mittags und nachts null', () => {
    const amHorizont = himmelsLicht(1, 20, ohneMond).waerme
    expect(amHorizont).toBeGreaterThan(0.9)
    expect(himmelsLicht(-3, 20, ohneMond).waerme).toBeGreaterThan(0)
    expect(himmelsLicht(-3, 20, ohneMond).waerme).toBeLessThan(amHorizont)
    expect(himmelsLicht(20, 20, ohneMond).waerme).toBe(0)
    expect(himmelsLicht(-20, 20, ohneMond).waerme).toBe(0)
  })

  it('Mond leuchtet nachts nach seiner Phase, am Tag und unter dem Horizont nicht', () => {
    const voll = himmelsLicht(-30, 20, { hoehe: 30, beleuchtet: 1 }).mond
    const halb = himmelsLicht(-30, 20, { hoehe: 30, beleuchtet: 0.5 }).mond
    expect(voll).toBe(1)
    expect(halb).toBeCloseTo(0.5)
    expect(himmelsLicht(-30, 20, { hoehe: 30, beleuchtet: 0 }).mond).toBe(0)
    expect(himmelsLicht(20, 20, { hoehe: 30, beleuchtet: 1 }).mond).toBe(0)
    expect(himmelsLicht(-30, 20, { hoehe: -5, beleuchtet: 1 }).mond).toBe(0)
  })

  it('himmel liefert den Tagesverlauf: 6, 9, 12, 18, 21 und 0 Uhr deutscher Zeit', () => {
    // 12. November 2026, Winterzeit (UTC+1).
    const um = (stunde: number) => himmel(new Date(Date.UTC(2026, 10, 12, stunde - 1)), kassel, 'bogen')
    const [sechs, neun, zwoelf, achtzehn, einundzwanzig] = [6, 9, 12, 18, 21].map(um)
    const null_ = himmel(new Date(Date.UTC(2026, 10, 12, 23)), kassel, 'bogen')
    expect(zwoelf.licht).toBeGreaterThan(neun.licht)
    expect(neun.licht).toBeGreaterThan(sechs.licht)
    expect(sechs.licht).toBe(0)
    expect(achtzehn.licht).toBe(0)
    expect(einundzwanzig.licht).toBe(0)
    expect(null_.licht).toBe(0)
    expect(zwoelf.waerme).toBe(0)
  })

  it('Sommerzeit: im Juni ist es um halb sechs schon hell und warm, um Mitternacht dunkel', () => {
    // 21. Juni 2026, Sommerzeit (UTC+2).
    const fuenf = himmel(new Date(Date.UTC(2026, 5, 21, 3, 30)), kassel, 'bogen')
    expect(fuenf.licht).toBeGreaterThan(0.25)
    expect(fuenf.waerme).toBeGreaterThan(0.5)
    expect(himmel(new Date(Date.UTC(2026, 5, 20, 22)), kassel, 'bogen').licht).toBe(0)
  })

  it('über Mitternacht bleibt es gleich dunkel', () => {
    const vor = himmel(new Date(Date.UTC(2026, 10, 12, 22, 59)), kassel, 'bogen')
    const nach = himmel(new Date(Date.UTC(2026, 10, 12, 23, 1)), kassel, 'bogen')
    expect(vor.licht).toBe(0)
    expect(nach.licht).toBe(0)
  })
})
