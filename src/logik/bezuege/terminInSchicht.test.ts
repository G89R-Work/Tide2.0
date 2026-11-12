import { describe, expect, it } from 'vitest'
import { ueberschneidungen } from './terminInSchicht'

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
