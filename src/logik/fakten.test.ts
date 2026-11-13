import { describe, expect, it } from 'vitest'
import { faktZurStunde, fakten, mondphase } from './fakten'

// Erfundener Ort: Kassel. Zeiten in Ortszeit über UTC fest, damit die Tests in jeder Zeitzone gleich laufen.
const kassel = { breite: 51.31, laenge: 9.49 }
const utc = (monat: number, tag: number, h: number, m = 0) => new Date(Date.UTC(2026, monat, tag, h, m))
const text = (jetzt: Date, id: string) => fakten(jetzt, kassel).find((f) => f.id === id)?.text

describe('fakten', () => {
  it('nennt am Tag das verbleibende Tageslicht bis zum Untergang', () => {
    // 13.11. in Kassel: Untergang gegen 15:40 UTC
    expect(text(utc(10, 13, 12), 'tageslicht')).toMatch(/^Noch 3 Std\. \d+ Min\. Tageslicht$/)
  })

  it('nennt vor dem Aufgang dessen Uhrzeit und nach dem Untergang dessen Uhrzeit', () => {
    expect(text(utc(10, 13, 5), 'tageslicht')).toMatch(/^Die Sonne geht um \d\d:\d\d auf$/)
    expect(text(utc(10, 13, 20), 'tageslicht')).toMatch(/^Die Sonne ist um \d\d:\d\d untergegangen$/)
  })

  it('nennt die Höhe der Sonne über oder unter dem Horizont in Grad', () => {
    expect(text(utc(10, 13, 11), 'sonnenhoehe')).toBe('Die Sonne steht 21 Grad über dem Horizont')
    expect(text(utc(10, 13, 23), 'sonnenhoehe')).toMatch(/^Die Sonne steht \d+ Grad unter dem Horizont$/)
  })

  it('nennt Tag des Jahres und Kalenderwoche', () => {
    expect(text(new Date(2026, 10, 13, 12), 'jahrestag')).toBe('Tag 317 des Jahres, Kalenderwoche 46')
    expect(text(new Date(2027, 0, 1, 12), 'jahrestag')).toBe('Tag 1 des Jahres, Kalenderwoche 53')
  })

  it('vergleicht die Länge des Tages mit gestern', () => {
    expect(text(new Date(2026, 10, 13, 12), 'tageslaenge')).toMatch(/^Der Tag ist heute [34] Minuten kürzer als gestern$/)
    expect(text(new Date(2026, 4, 13, 12), 'tageslaenge')).toMatch(/^Der Tag ist heute \d Minuten länger als gestern$/)
  })

  it('zählt die Tage bis zum nächsten Vollmond', () => {
    expect(text(utc(10, 13, 12), 'vollmond')).toBe('In 11 Tagen ist Vollmond')
    expect(text(utc(0, 3, 10), 'vollmond')).toBe('Heute ist Vollmond')
    expect(text(utc(0, 2, 10), 'vollmond')).toBe('Morgen ist Vollmond')
  })

  it('lässt in der Polarnacht das Tageslicht weg, statt zu raten', () => {
    const tromsoeNord = { breite: 78.2, laenge: 15.6 }
    const ids = fakten(utc(11, 21, 12), tromsoeNord).map((f) => f.id)
    expect(ids).not.toContain('tageslicht')
    expect(ids).toContain('jahrestag')
  })
})

describe('faktZurStunde', () => {
  it('wechselt mit der Stunde und bleibt innerhalb der Stunde gleich', () => {
    const a = faktZurStunde(new Date(2026, 10, 13, 10, 5), kassel)
    expect(faktZurStunde(new Date(2026, 10, 13, 10, 55), kassel).id).toBe(a.id)
    expect(faktZurStunde(new Date(2026, 10, 13, 11, 5), kassel).id).not.toBe(a.id)
  })
})

describe('mondphase', () => {
  it('benennt die Phase', () => {
    expect(mondphase(0)).toBe('Neumond')
    expect(mondphase(0.12)).toBe('Zunehmende Sichel')
    expect(mondphase(0.25)).toBe('Erstes Viertel')
    expect(mondphase(0.4)).toBe('Zunehmender Mond')
    expect(mondphase(0.5)).toBe('Vollmond')
    expect(mondphase(0.6)).toBe('Abnehmender Mond')
    expect(mondphase(0.75)).toBe('Letztes Viertel')
    expect(mondphase(0.9)).toBe('Abnehmende Sichel')
    expect(mondphase(0.99)).toBe('Neumond')
  })
})
