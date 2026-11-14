import { describe, expect, it } from 'vitest'
import type { Eintrag } from '../vertrag/eintrag'
import { eintragAendern } from './eintraege'

const liste: Eintrag[] = [
  { id: 'a', art: 'aufgabe', titel: 'Brot', erledigt: false, erstellt: '2026-11-11T08:00:00Z', geaendert: '2026-11-11T08:00:00Z' },
  { id: 'b', art: 'notiz', titel: 'Idee', erledigt: false, erstellt: '2026-11-11T08:00:00Z', geaendert: '2026-11-11T08:00:00Z' },
]
const jetzt = new Date('2026-11-11T09:00:00Z')

describe('eintragAendern', () => {
  it('ändert nur den genannten Eintrag und setzt den Zeitpunkt', () => {
    const neu = eintragAendern(liste, 'a', { erledigt: true }, jetzt)
    expect(neu.liste[0]).toMatchObject({ erledigt: true, geaendert: '2026-11-11T09:00:00.000Z', titel: 'Brot' })
    expect(neu.liste[1]).toBe(liste[1])
    expect(neu.eintrag).toBe(neu.liste[0])
  })
  it('lässt die alte Liste unverändert', () => {
    eintragAendern(liste, 'a', { titel: 'Milch' }, jetzt)
    expect(liste[0]!.titel).toBe('Brot')
  })
  it('meldet einen unbekannten Eintrag', () => {
    expect(eintragAendern(liste, 'x', { erledigt: true }, jetzt).eintrag).toBeUndefined()
  })
  it('ändert den Text einer Notiz', () => {
    expect(eintragAendern(liste, 'b', { text: '# Ablauf\n- erst A' }, jetzt).eintrag).toMatchObject({ titel: 'Idee', text: '# Ablauf\n- erst A' })
  })
  it('übernimmt nur erlaubte Felder', () => {
    const neu = eintragAendern(liste, 'a', { id: 'z', art: 'mail' } as never, jetzt)
    expect(neu.eintrag).toMatchObject({ id: 'a', art: 'aufgabe' })
  })
  it('verschiebt Beginn und Ende eines Termins', () => {
    const termin: Eintrag = { ...liste[0]!, id: 't', art: 'termin', beginn: '2026-11-11T09:00:00.000Z', ende: '2026-11-11T09:30:00.000Z' }
    const neu = eintragAendern([termin], 't', { beginn: '2026-11-11T10:00:00.000Z', ende: '2026-11-11T10:30:00.000Z' }, jetzt)
    expect(neu.eintrag).toMatchObject({ beginn: '2026-11-11T10:00:00.000Z', ende: '2026-11-11T10:30:00.000Z' })
  })
  it('lehnt eine Zeit ab, die nicht lesbar ist oder vor dem Beginn endet', () => {
    const termin: Eintrag = { ...liste[0]!, id: 't', art: 'termin', beginn: '2026-11-11T09:00:00.000Z', ende: '2026-11-11T09:30:00.000Z' }
    expect(() => eintragAendern([termin], 't', { beginn: 'morgen', ende: '2026-11-11T09:30:00.000Z' }, jetzt)).toThrow(/Zeit/)
    expect(() => eintragAendern([termin], 't', { beginn: '2026-11-11T10:00:00.000Z', ende: '2026-11-11T09:00:00.000Z' }, jetzt)).toThrow(/Ende/)
    expect(() => eintragAendern([termin], 't', { beginn: '2026-11-11T10:00:00.000Z' }, jetzt)).toThrow(/zusammen/)
  })
})
