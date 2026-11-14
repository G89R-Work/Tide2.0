import { describe, expect, it } from 'vitest'
import type { Eintrag } from '../vertrag/eintrag'
import { arbeitszeit, hinweise, netto } from './arbeit'
import { schichtAm, vorschau, type Rhythmus } from './rhythmus'

// Erfundene Schichten: Früh 6:00–14:30 (30 Min. Pause), Spät 13:00–21:30, Lang 7:00–19:00 ohne Pause.
const rhythmus = (tage: (string | null)[], extra: Partial<Rhythmus> = {}): Rhythmus => ({
  arten: [
    { id: 'frueh', name: 'Früh', beginn: '06:00', ende: '14:30', farbe: 'meer', pause: 30 },
    { id: 'spaet', name: 'Spät', beginn: '13:00', ende: '21:30', farbe: 'glut', pause: 30 },
    { id: 'lang', name: 'Lang', beginn: '07:00', ende: '19:00', farbe: 'flieder', pause: 0 },
  ],
  muster: [{ id: 'w', name: 'Woche', tage }],
  abfolge: [{ muster: 'w', wochen: 1 }],
  // Montag, 2. November 2026
  start: '2026-11-02',
  ausnahmen: [],
  ...extra,
})
const woche = (r: Rhythmus) => vorschau(r, new Date(2026, 10, 2), 1)
const keinFeiertag = () => undefined
const arten = (r: Rhythmus, termine: Eintrag[] = [], feiertag: (t: Date) => string | undefined = keinFeiertag) => hinweise(woche(r), termine, feiertag).map((h) => h.art)

describe('netto', () => {
  it('Dauer ohne Pause in Minuten', () => {
    const s = schichtAm(rhythmus(['frueh', null, null, null, null, null, null]), new Date(2026, 10, 2))
    expect(s && netto(s)).toBe(8 * 60)
  })
})

describe('Hinweise zum Plan', () => {
  it('ein Plan ohne Verstöße gibt keine Hinweise', () => {
    expect(arten(rhythmus(['frueh', 'frueh', 'spaet', 'spaet', null, null, null]))).toEqual([])
  })

  it('weniger als 11 Stunden Ruhe zwischen Spät und Früh', () => {
    const h = hinweise(woche(rhythmus(['spaet', 'frueh', null, null, null, null, null])), [], keinFeiertag)
    expect(h).toHaveLength(1)
    expect(h[0]).toMatchObject({ art: 'ruhe', tag: new Date(2026, 10, 3) })
    expect(h[0]?.text).toContain('8 Std. 30 Min.')
  })

  it('mehr als 10 Stunden Arbeit an einem Tag', () => {
    expect(arten(rhythmus(['lang', null, null, null, null, null, null]))).toContain('lang')
  })

  it('Pausen: über 9 Stunden 45 Minuten, über 6 Stunden 30 Minuten', () => {
    expect(arten(rhythmus(['lang', null, null, null, null, null, null]))).toContain('pause')
    const kurzePause = rhythmus(['frueh', null, null, null, null, null, null])
    const ohnePause = { ...kurzePause, arten: kurzePause.arten.map((a) => ({ ...a, pause: 0 })) }
    expect(arten(ohnePause)).toEqual(['pause'])
    expect(arten(kurzePause)).toEqual([])
  })

  it('Termine, die in eine Schicht fallen', () => {
    const r = rhythmus(['frueh', null, null, null, null, null, null])
    const t = (id: string, art: Eintrag['art'], von: Date, bis: Date): Eintrag => ({ id, art, titel: id, erledigt: false, erstellt: von.toISOString(), geaendert: von.toISOString(), beginn: von.toISOString(), ende: bis.toISOString() })
    const schicht = t('Früh', 'schicht', new Date(2026, 10, 2, 6), new Date(2026, 10, 2, 14, 30))
    const drin = t('Zahnarzt', 'termin', new Date(2026, 10, 2, 9), new Date(2026, 10, 2, 10))
    const danach = t('Sport', 'termin', new Date(2026, 10, 2, 14, 30), new Date(2026, 10, 2, 16))
    const h = hinweise(woche(r), [schicht, drin, danach], keinFeiertag)
    expect(h.map((x) => x.art)).toEqual(['termin'])
    expect(h[0]?.text).toBe('„Zahnarzt“ liegt in Früh')
    const zwei = hinweise(woche(r), [schicht, drin, { ...drin, id: 'Bank', titel: 'Bank' }], keinFeiertag)
    expect(zwei.map((x) => x.text)).toEqual(['„Zahnarzt“, „Bank“ liegen in Früh'])
  })

  it('Schicht an einem gesetzlichen Feiertag', () => {
    const h = hinweise(woche(rhythmus(['frueh', null, null, null, null, null, null])), [], (t) => (t.getDate() === 2 ? 'Testtag' : undefined))
    expect(h).toMatchObject([{ art: 'feiertag', tag: new Date(2026, 10, 2) }])
    expect(h[0]?.text).toContain('Testtag')
  })

  it('sortiert nach Tag', () => {
    const h = hinweise(woche(rhythmus(['lang', 'spaet', 'frueh', null, null, null, null])), [], keinFeiertag)
    expect(h.map((x) => x.tag.getDate())).toEqual([...h.map((x) => x.tag.getDate())].sort((a, b) => a - b))
  })
})

describe('Arbeitszeit', () => {
  // Montag bis Freitag Früh = 8 Std. je Tag, 40 Std. Soll je Woche, 30 Tage Urlaub
  const r = rhythmus(['frueh', 'frueh', 'frueh', 'frueh', 'frueh', null, null], { start: '2026-10-26' })

  it('Soll und Plan im Monat; November 2026 hat 21 Werktage', () => {
    const a = arbeitszeit(r, new Date(2026, 10, 30, 23), 40, 30)
    expect(a.soll).toBe(21 * 8 * 60)
    expect(a.plan).toBe(21 * 8 * 60)
    expect(a.ist).toBe(a.plan)
    expect(a.ueber).toBe(0)
  })

  it('Ist zählt nur beendete Schichten; Soll bis heute ebenso', () => {
    // Mittwoch, 4. November, 12 Uhr: Mo und Di beendet, Mi läuft noch
    const a = arbeitszeit(r, new Date(2026, 10, 4, 12), 40, 30)
    expect(a.ist).toBe(2 * 8 * 60)
    expect(a.ueber).toBe(0)
  })

  it('Zusatzschicht ergibt Überstunden', () => {
    const mit = { ...r, ausnahmen: [{ tag: '2026-11-07', art: 'zusatz' as const, schicht: 'frueh' }] }
    expect(arbeitszeit(mit, new Date(2026, 10, 8), 40, 30).ueber).toBe(8 * 60)
  })

  it('Urlaub und krank zählen wie ein Soll-Tag; Urlaub mindert den Rest des Jahres', () => {
    const mit = {
      ...r,
      ausnahmen: [
        { tag: '2026-11-03', art: 'urlaub' as const },
        { tag: '2026-11-04', art: 'krank' as const },
        { tag: '2026-03-02', art: 'urlaub' as const },
        { tag: '2025-12-29', art: 'urlaub' as const },
      ],
    }
    const a = arbeitszeit(mit, new Date(2026, 10, 8), 40, 30)
    expect(a.ueber).toBe(0)
    expect(a.urlaubRest).toBe(28)
  })
})
