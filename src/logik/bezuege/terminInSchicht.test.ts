import { describe, expect, it } from 'vitest'
import type { Eintrag } from '../../vertrag/eintrag'
import { schichtenImTermin, ueberschneidungen } from './terminInSchicht'

const schicht = { titel: 'Spätschicht', von: 810, bis: 1080 }

describe('ueberschneidungen', () => {
  it('Termin in der Schicht wird als Überschneidung gemeldet', () => {
    expect(ueberschneidungen({ von: 840, bis: 900 }, [schicht])).toEqual(['Spätschicht'])
  })
  it('Termin, der in die Schicht hineinragt, wird gemeldet', () => {
    expect(ueberschneidungen({ von: 780, bis: 830 }, [schicht])).toEqual(['Spätschicht'])
  })
  it('Termin, der genau an der Schicht endet oder beginnt, überschneidet sich nicht', () => {
    expect(ueberschneidungen({ von: 750, bis: 810 }, [schicht])).toEqual([])
    expect(ueberschneidungen({ von: 1080, bis: 1110 }, [schicht])).toEqual([])
  })
  it('nennt jede berührte Schicht', () => {
    expect(ueberschneidungen({ von: 0, bis: 1440 }, [schicht, { titel: 'Nacht', von: 1320, bis: 1440 }])).toEqual(['Spätschicht', 'Nacht'])
  })
})

const eintrag = (id: string, art: Eintrag['art'], von: Date, bis: Date): Eintrag => ({
  id, art, titel: id, erledigt: false, erstellt: von.toISOString(), geaendert: von.toISOString(), beginn: von.toISOString(), ende: bis.toISOString(),
})

describe('schichtenImTermin', () => {
  const spaet = eintrag('Spätschicht', 'schicht', new Date(2026, 10, 18, 13, 30), new Date(2026, 10, 18, 18))
  const nacht = eintrag('Nachtschicht', 'schicht', new Date(2026, 10, 18, 22), new Date(2026, 10, 19, 6))
  const termin = eintrag('Zahnarzt', 'termin', new Date(2026, 10, 18, 14), new Date(2026, 10, 18, 15))

  it('neuer Termin in der Schicht nennt die Schicht', () => {
    expect(schichtenImTermin(new Date(2026, 10, 18, 14), new Date(2026, 10, 18, 15), [spaet, termin])).toEqual(['Spätschicht'])
  })
  it('andere Termine sind keine Schicht', () => {
    expect(schichtenImTermin(new Date(2026, 10, 18, 9), new Date(2026, 10, 18, 10), [spaet, termin])).toEqual([])
  })
  it('über Mitternacht: früh am Morgen liegt noch in der Nachtschicht vom Vortag', () => {
    expect(schichtenImTermin(new Date(2026, 10, 19, 5), new Date(2026, 10, 19, 7), [nacht])).toEqual(['Nachtschicht'])
  })
  it('über die Zeitumstellung: 2:30 bis 3:30 am 25. Oktober liegt in der Nachtschicht', () => {
    const umstellung = eintrag('Nacht', 'schicht', new Date(2026, 9, 24, 22), new Date(2026, 9, 25, 6))
    expect(schichtenImTermin(new Date(2026, 9, 25, 2, 30), new Date(2026, 9, 25, 3, 30), [umstellung])).toEqual(['Nacht'])
  })
})
