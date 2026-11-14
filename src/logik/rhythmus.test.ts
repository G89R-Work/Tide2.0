import { describe, expect, it } from 'vitest'
import { schichtAm, vorschau, type Rhythmus, type Wochenmuster } from './rhythmus'

// Erfundene Schichten wie im Konzept (docs/konzept/17-arbeit.md): Früh 8:00–16:30, Spät 13:00–21:30, Nacht über Mitternacht.
const arten = [
  { id: 'frueh', name: 'Früh', beginn: '08:00', ende: '16:30', farbe: 'blau' },
  { id: 'spaet', name: 'Spät', beginn: '13:00', ende: '21:30', farbe: 'orange' },
  { id: 'nacht', name: 'Nacht', beginn: '22:00', ende: '06:00', farbe: 'lila' },
]

/** Montag bis Freitag dieselbe Schicht, Wochenende frei. */
const werktags = (id: string, art: string): Wochenmuster => ({ id, name: id, tage: [art, art, art, art, art, null, null] })

const rhythmus = (muster: Wochenmuster[], abfolge: Rhythmus['abfolge'], extra: Partial<Rhythmus> = {}): Rhythmus => ({
  arten,
  muster,
  abfolge,
  // Montag, 2. November 2026
  start: '2026-11-02',
  ausnahmen: [],
  ...extra,
})

/** Name der Schicht am Tag (Ortszeit), sonst „frei“. */
const am = (r: Rhythmus, j: number, m: number, t: number) => schichtAm(r, new Date(j, m - 1, t))?.art.name ?? 'frei'

/** Schicht je Montag der ersten Wochen ab dem Start. */
const montage = (r: Rhythmus, wochen: number) => Array.from({ length: wochen }, (_, w) => am(r, 2026, 11, 2 + 7 * w))

describe('Rhythmus-Tabelle', () => {
  it('jede Woche gleich: ein Abschnitt, 1 Woche', () => {
    const r = rhythmus([werktags('a', 'frueh')], [{ muster: 'a', wochen: 1 }])
    expect(montage(r, 4)).toEqual(['Früh', 'Früh', 'Früh', 'Früh'])
    expect(am(r, 2026, 11, 7)).toBe('frei')
  })

  it('Früh und Spät im Wechsel: Früh 1 Woche, Spät 1 Woche', () => {
    const r = rhythmus([werktags('f', 'frueh'), werktags('s', 'spaet')], [{ muster: 'f', wochen: 1 }, { muster: 's', wochen: 1 }])
    expect(montage(r, 4)).toEqual(['Früh', 'Spät', 'Früh', 'Spät'])
  })

  it('Drei-Wochen-Rhythmus: drei Abschnitte mit je 1 Woche', () => {
    const r = rhythmus(
      [werktags('f', 'frueh'), werktags('s', 'spaet'), werktags('n', 'nacht')],
      [{ muster: 'f', wochen: 1 }, { muster: 's', wochen: 1 }, { muster: 'n', wochen: 1 }],
    )
    expect(montage(r, 6)).toEqual(['Früh', 'Spät', 'Nacht', 'Früh', 'Spät', 'Nacht'])
  })

  it('Muster A 2 Wochen, Muster B 1 Woche, Muster C 3 Wochen, dann von vorn', () => {
    const r = rhythmus(
      [werktags('A', 'frueh'), werktags('B', 'spaet'), werktags('C', 'nacht')],
      [{ muster: 'A', wochen: 2 }, { muster: 'B', wochen: 1 }, { muster: 'C', wochen: 3 }],
    )
    expect(montage(r, 8)).toEqual(['Früh', 'Früh', 'Spät', 'Nacht', 'Nacht', 'Nacht', 'Früh', 'Früh'])
  })
})

describe('Startdatum', () => {
  const r = rhythmus([werktags('f', 'frueh'), werktags('s', 'spaet')], [{ muster: 'f', wochen: 1 }, { muster: 's', wochen: 1 }], { start: '2026-11-04' })

  it('vor dem Start gibt es keine Schicht, auch nicht in der Startwoche', () => {
    expect(am(r, 2026, 11, 3)).toBe('frei')
    expect(am(r, 2026, 10, 28)).toBe('frei')
  })

  it('die Startwoche ist die erste Woche der Abfolge, auch wenn der Start mitten in der Woche liegt', () => {
    expect(am(r, 2026, 11, 4)).toBe('Früh')
    expect(am(r, 2026, 11, 9)).toBe('Spät')
    expect(am(r, 2026, 11, 16)).toBe('Früh')
  })
})

describe('Ausnahmen', () => {
  const r = rhythmus([werktags('f', 'frueh')], [{ muster: 'f', wochen: 1 }], {
    ausnahmen: [
      { tag: '2026-11-03', art: 'urlaub' },
      { tag: '2026-11-04', art: 'krank' },
      { tag: '2026-11-05', art: 'tausch', schicht: 'spaet' },
      { tag: '2026-11-07', art: 'zusatz', schicht: 'frueh' },
    ],
  })

  it('Urlaub und krank machen den Tag frei und nennen den Grund', () => {
    expect(schichtAm(r, new Date(2026, 10, 3))).toBeNull()
    expect(schichtAm(r, new Date(2026, 10, 4))).toBeNull()
    const woche = vorschau(r, new Date(2026, 10, 2), 1)
    expect(woche.map((t) => t.ausnahme)).toEqual([undefined, 'urlaub', 'krank', 'tausch', undefined, 'zusatz', undefined])
  })

  it('Tausch setzt eine andere Schicht und ist als Ausnahme erkennbar', () => {
    expect(schichtAm(r, new Date(2026, 10, 5))).toMatchObject({ art: { name: 'Spät' }, ausnahme: 'tausch' })
  })

  it('Zusatzschicht an einem freien Tag', () => {
    expect(schichtAm(r, new Date(2026, 10, 7))).toMatchObject({ art: { name: 'Früh' }, ausnahme: 'zusatz' })
  })

  it('eine Ausnahme überschreibt den Rhythmus nur an ihrem Tag', () => {
    expect(am(r, 2026, 11, 2)).toBe('Früh')
    expect(am(r, 2026, 11, 6)).toBe('Früh')
    expect(am(r, 2026, 11, 10)).toBe('Früh')
    expect(schichtAm(r, new Date(2026, 10, 6))?.ausnahme).toBeUndefined()
  })
})

describe('Uhrzeiten', () => {
  const r = rhythmus([werktags('n', 'nacht'), werktags('f', 'frueh')], [{ muster: 'n', wochen: 1 }, { muster: 'f', wochen: 1 }], { start: '2026-10-19' })

  it('eine Schicht über Mitternacht endet am Folgetag', () => {
    const s = schichtAm(r, new Date(2026, 9, 19))
    expect(s?.beginn).toEqual(new Date(2026, 9, 19, 22))
    expect(s?.ende).toEqual(new Date(2026, 9, 20, 6))
  })

  it('über die Umstellung auf Winterzeit dauert die Nachtschicht vom 24. auf den 25. Oktober eine Stunde länger', () => {
    const r2 = rhythmus([{ id: 'n', name: 'n', tage: [null, null, null, null, null, 'nacht', null] }], [{ muster: 'n', wochen: 1 }], { start: '2026-10-19' })
    const s = schichtAm(r2, new Date(2026, 9, 24))
    expect(s && (s.ende.getTime() - s.beginn.getTime()) / 3_600_000).toBe(9)
  })

  it('über die Umstellung auf Sommerzeit beginnt die Frühschicht trotzdem um 8:00 Ortszeit', () => {
    const r3 = rhythmus([{ id: 'f', name: 'f', tage: [null, null, null, null, null, null, 'frueh'] }], [{ muster: 'f', wochen: 1 }], { start: '2026-03-23' })
    const s = schichtAm(r3, new Date(2026, 2, 29))
    expect(s?.beginn.getHours()).toBe(8)
    expect(s?.beginn).toEqual(new Date(2026, 2, 29, 8))
  })
})

describe('vorschau', () => {
  const r = rhythmus([werktags('f', 'frueh'), werktags('s', 'spaet')], [{ muster: 'f', wochen: 1 }, { muster: 's', wochen: 1 }])

  it('zeigt acht Wochen ab dem Montag der Woche, Tag für Tag', () => {
    const v = vorschau(r, new Date(2026, 11, 2))
    expect(v).toHaveLength(56)
    expect(v[0]?.tag).toEqual(new Date(2026, 10, 30))
    expect(v[55]?.tag).toEqual(new Date(2027, 0, 24))
  })

  it('jeder Tag trägt seine Schicht oder ist frei', () => {
    const v = vorschau(r, new Date(2026, 10, 30), 2)
    const F = 'frueh'
    const S = 'spaet'
    expect(v.map((t) => t.schicht?.art.id ?? 'frei')).toEqual([F, F, F, F, F, 'frei', 'frei', S, S, S, S, S, 'frei', 'frei'])
  })
})
