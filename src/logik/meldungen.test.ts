import { describe, expect, it } from 'vitest'
import type { Eintrag } from '../vertrag/eintrag'
import { ebbeFenster, erinnerungen, inRuhezeit, sichtbare, ungelesen, wartende, zeigeAb, type Meldung } from './meldungen'

const um = (h: number, m = 0, tag = 12) => new Date(2026, 10, tag, h, m)
const termin = (id: string, von: Date, bis: Date, mehr: Partial<Eintrag> = {}): Eintrag => ({
  id,
  art: 'termin',
  titel: id,
  erledigt: false,
  erstellt: von.toISOString(),
  geaendert: von.toISOString(),
  beginn: von.toISOString(),
  ende: bis.toISOString(),
  ...mehr,
})
const meldung = (id: string, ankunft: Date, wichtig?: boolean): Meldung => ({ id, text: id, ankunft: ankunft.getTime(), wichtig })

describe('Ruhezeit', () => {
  it('reicht von 22:30 bis 7:00', () => {
    expect(inRuhezeit(um(22, 29))).toBe(false)
    expect(inRuhezeit(um(22, 30))).toBe(true)
    expect(inRuhezeit(um(3))).toBe(true)
    expect(inRuhezeit(um(6, 59))).toBe(true)
    expect(inRuhezeit(um(7))).toBe(false)
  })
})

describe('zeigeAb', () => {
  it('zeigt sofort ohne Ebbe-Modus oder außerhalb der Ruhezeit', () => {
    expect(zeigeAb(meldung('a', um(23)), false)).toBe(um(23).getTime())
    expect(zeigeAb(meldung('a', um(12)), true)).toBe(um(12).getTime())
  })
  it('lässt im Ebbe-Modus bis 7:00 warten, auch über Mitternacht', () => {
    expect(zeigeAb(meldung('a', um(23)), true)).toBe(um(7, 0, 13).getTime())
    expect(zeigeAb(meldung('a', um(2)), true)).toBe(um(7).getTime())
  })
  it('wartet bei der Umstellung auf Sommer- und Winterzeit bis 7:00 Ortszeit', () => {
    expect(zeigeAb(meldung('a', new Date(2026, 2, 28, 23)), true)).toBe(new Date(2026, 2, 29, 7).getTime())
    expect(zeigeAb(meldung('a', new Date(2026, 9, 24, 23)), true)).toBe(new Date(2026, 9, 25, 7).getTime())
  })
  it('lässt Wichtiges nie warten', () => {
    expect(zeigeAb(meldung('a', um(23), true), true)).toBe(um(23).getTime())
  })
})

describe('sichtbare, wartende, ungelesen', () => {
  const liste = [meldung('alt', um(9)), meldung('nacht', um(23)), meldung('neu', um(10))]
  it('zeigt Angekommenes, neueste zuerst', () => {
    expect(sichtbare(liste, um(23, 30), false).map((m) => m.id)).toEqual(['nacht', 'neu', 'alt'])
    expect(sichtbare(liste, um(9, 30), false).map((m) => m.id)).toEqual(['alt'])
  })
  it('hält in der Ruhezeit zurück, bis der Morgen kommt', () => {
    expect(sichtbare(liste, um(23, 30), true).map((m) => m.id)).toEqual(['neu', 'alt'])
    expect(wartende(liste, um(23, 30), true).map((m) => m.id)).toEqual(['nacht'])
    expect(sichtbare(liste, um(7, 0, 13), true).map((m) => m.id)).toEqual(['nacht', 'neu', 'alt'])
  })
  it('zählt, was seit dem letzten Öffnen der Glocke dazukam', () => {
    expect(ungelesen(liste, um(23, 30), false, um(9, 30).getTime())).toBe(2)
    expect(ungelesen(liste, um(23, 30), false, um(23, 30).getTime())).toBe(0)
    // Wartet sie bis zum Morgen, zählt sie erst dann – auch wenn die Glocke nachts geöffnet wurde.
    expect(ungelesen(liste, um(7, 0, 13), true, um(23, 30).getTime())).toBe(1)
  })
})

describe('Erinnerungen', () => {
  const zahnarzt = termin('Zahnarzt', um(10), um(11))
  it('melden sich 15 Minuten vor Beginn, bis der Termin beginnt', () => {
    expect(erinnerungen([zahnarzt], um(9, 44))).toEqual([])
    const [e] = erinnerungen([zahnarzt], um(9, 45))
    expect(e).toMatchObject({ text: 'Gleich: „Zahnarzt“ um 10:00', ankunft: um(9, 45).getTime() })
    expect(erinnerungen([zahnarzt], um(9, 59))).toHaveLength(1)
    expect(erinnerungen([zahnarzt], um(10))).toEqual([])
  })
  it('haben eine feste Kennung je Beginn, damit sie nicht doppelt kommen', () => {
    const a = erinnerungen([zahnarzt], um(9, 50))[0].id
    expect(erinnerungen([zahnarzt], um(9, 55))[0].id).toBe(a)
    const verschoben = termin('Zahnarzt', um(10, 30), um(11))
    expect(erinnerungen([verschoben], um(10, 20))[0].id).not.toBe(a)
  })
  it('übergehen Erledigtes und Einträge ohne Uhrzeit', () => {
    expect(erinnerungen([termin('x', um(10), um(11), { erledigt: true })], um(9, 50))).toEqual([])
    expect(erinnerungen([{ ...zahnarzt, beginn: undefined, ende: undefined }], um(9, 50))).toEqual([])
  })
})

describe('Ebbe-Fenster', () => {
  const z = (von: Date, bis: Date) => ({ beginn: von, ende: bis })
  it('nennt während eines Termins die nächste freie Zeit ab 45 Minuten', () => {
    const tag = [z(um(9), um(10)), z(um(10, 30), um(12)), z(um(13), um(14))]
    // 10:00–10:30 ist zu kurz, 12:00–13:00 reicht.
    expect(ebbeFenster(tag, um(9, 15))).toBe('Gerade Flut, Ebbe ab 12:00')
  })
  it('zählt eine kurze Lücke noch zur Flut', () => {
    expect(ebbeFenster([z(um(9), um(10)), z(um(10, 30), um(12))], um(10, 10))).toBe('Gerade Flut, Ebbe ab 12:00')
  })
  it('nennt in freier Zeit, bis wann sie reicht', () => {
    expect(ebbeFenster([z(um(14), um(15))], um(11))).toBe('Gerade Ebbe bis 14:00')
    expect(ebbeFenster([z(um(8), um(9))], um(11))).toBe('Gerade Ebbe')
    expect(ebbeFenster([], um(11))).toBe('Gerade Ebbe')
  })
  it('verbindet überlappende Termine', () => {
    expect(ebbeFenster([z(um(9), um(11)), z(um(10), um(12))], um(9, 30))).toBe('Gerade Flut, Ebbe ab 12:00')
  })
})
