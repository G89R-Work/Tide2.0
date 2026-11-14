import { describe, expect, it } from 'vitest'
import type { Eintrag } from '../vertrag/eintrag'
import { kalenderwoche, termineAm } from './kalender'
import { monatsRaster } from './heute'

const t = (id: string, von: Date, bis: Date, art: Eintrag['art'] = 'termin'): Eintrag => ({
  id, art, titel: id, erledigt: false, erstellt: von.toISOString(), geaendert: von.toISOString(), beginn: von.toISOString(), ende: bis.toISOString(),
})

describe('kalenderwoche', () => {
  it('nennt die ISO-Woche jeder Zeile, mit Montag oder Sonntag als Wochenbeginn', () => {
    expect(monatsRaster(new Date(2026, 10, 14), 'montag').map(kalenderwoche)).toEqual([44, 45, 46, 47, 48, 49])
    expect(monatsRaster(new Date(2026, 10, 14), 'sonntag').map(kalenderwoche)).toEqual([45, 46, 47, 48, 49, 50])
  })

  it('über den Jahreswechsel: die Woche mit dem 1. Januar 2027 ist KW 53', () => {
    expect(kalenderwoche(monatsRaster(new Date(2027, 0, 1), 'montag')[0])).toBe(53)
  })
})

describe('termineAm', () => {
  it('liefert die Termine, die in den Tag ragen, nach Beginn, auch über Mitternacht und die Zeitumstellung', () => {
    const nacht = t('nacht', new Date(2026, 9, 24, 22), new Date(2026, 9, 25, 6))
    const frueh = t('frueh', new Date(2026, 9, 25, 8), new Date(2026, 9, 25, 9))
    const morgen = t('morgen', new Date(2026, 9, 26, 8), new Date(2026, 9, 26, 9))
    expect(termineAm([morgen, frueh, nacht], new Date(2026, 9, 25)).map((e) => e.id)).toEqual(['nacht', 'frueh'])
    expect(termineAm([morgen, frueh, nacht], new Date(2026, 9, 24)).map((e) => e.id)).toEqual(['nacht'])
  })

  it('ein Termin, der um Mitternacht endet, gehört nicht zum nächsten Tag', () => {
    const abend = t('abend', new Date(2026, 10, 14, 20), new Date(2026, 10, 15, 0))
    expect(termineAm([abend], new Date(2026, 10, 15))).toEqual([])
  })
})
