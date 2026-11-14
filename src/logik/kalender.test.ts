import { describe, expect, it } from 'vitest'
import type { Eintrag } from '../vertrag/eintrag'
import { kalenderwoche, stundenBereich, termineAm, wischZiel } from './kalender'
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

describe('stundenBereich', () => {
  const tage = Array.from({ length: 7 }, (_, i) => new Date(2026, 10, 16 + i))
  it('zeigt ohne Termine die Stunden ab Werk', () => {
    expect(stundenBereich([], tage)).toEqual([7, 20])
  })

  it('weitet sich auf volle Stunden, damit jeder Termin der Woche hineinpasst', () => {
    const frueh = t('frueh', new Date(2026, 10, 17, 5, 30), new Date(2026, 10, 17, 6, 15))
    const spaet = t('spaet', new Date(2026, 10, 18, 20, 0), new Date(2026, 10, 18, 21, 10))
    expect(stundenBereich([frueh, spaet], tage)).toEqual([5, 22])
  })

  it('eine Nachtschicht über Mitternacht braucht den ganzen Tag', () => {
    const nacht = t('nacht', new Date(2026, 10, 19, 22), new Date(2026, 10, 20, 6), 'schicht')
    expect(stundenBereich([nacht], tage)).toEqual([0, 24])
  })

  it('Termine außerhalb der Woche zählen nicht', () => {
    const vorher = t('vorher', new Date(2026, 10, 15, 3), new Date(2026, 10, 15, 4))
    expect(stundenBereich([vorher], tage)).toEqual([7, 20])
  })
})

describe('wischZiel', () => {
  const groesse: [number, number] = [700, 500]
  it('schnelles Wischen nach oben blättert vor, nach unten zurück', () => {
    expect(wischZiel([0, -30], [0, -1], groesse, 0.2)).toBe(1)
    expect(wischZiel([0, 30], [0, 1], groesse, 0.2)).toBe(-1)
  })

  it('langsames Ziehen zählt erst ab der Grenze', () => {
    expect(wischZiel([0, -90], [0, 0], groesse, 0.2)).toBeNull()
    expect(wischZiel([0, -110], [0, 0], groesse, 0.2)).toBe(1)
  })

  it('waagrecht wechselt die Ansicht, in beide Richtungen', () => {
    expect(wischZiel([-30, 5], [-1, 0], groesse, 0.2)).toBe('ansicht')
    expect(wischZiel([150, 20], [0, 0], groesse, 0.2)).toBe('ansicht')
    expect(wischZiel([100, 0], [0, 0], groesse, 0.2)).toBeNull()
  })
})
