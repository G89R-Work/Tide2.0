import { describe, expect, it } from 'vitest'
import { isWeekend } from 'date-fns'
import type { Rhythmus } from './rhythmus'
import { arbeitstagNachPlan, vorschlaege } from './urlaub'
import { tagSchluessel } from './zeit'

// Erfundene Feiertage 2027 (echte Lage der Wochentage): Do 6. Mai (Himmelfahrt), Fr 1. Januar, Mo 29. März, Sa 25. Dezember.
const feiertage = new Map([
  ['2027-01-01', 'Neujahr'],
  ['2027-03-29', 'Ostermontag'],
  ['2027-05-06', 'Himmelfahrt'],
  ['2027-12-25', 'Weihnachten'],
  ['2027-12-26', 'Zweiter Weihnachtstag'],
])
const werktags = (tag: Date) => !isWeekend(tag)
const tage = (l: readonly Date[]) => l.map(tagSchluessel)

describe('Urlaub planen', () => {
  const v = vorschlaege(feiertage, werktags, 2027)

  it('zeigt um jeden Feiertag einen Vorschlag; gleiche Fenster nur einmal', () => {
    expect(v.map((x) => x.feiertage)).toEqual([['Neujahr'], ['Ostermontag'], ['Himmelfahrt'], ['Weihnachten', 'Zweiter Weihnachtstag']])
  })

  it('Brückentag: Himmelfahrt am Donnerstag, ein Tag Urlaub am Freitag ergibt vier freie Tage', () => {
    const h = v.find((x) => x.feiertage.includes('Himmelfahrt'))
    expect(tage(h?.urlaub ?? [])).toEqual(['2027-05-07'])
    expect(h?.frei).toBe(4)
    expect(tagSchluessel(h?.von ?? 0)).toBe('2027-05-06')
    expect(tagSchluessel(h?.bis ?? 0)).toBe('2027-05-09')
  })

  it('wählt das Fenster mit den meisten freien Tagen je Urlaubstag', () => {
    const o = v.find((x) => x.feiertage.includes('Ostermontag'))
    // Ein Tag (Fr 26.3. oder Di 30.3.) bringt vier freie Tage; vier Tage (bis So 4.4.) nur neun
    expect(o?.urlaub).toHaveLength(1)
    expect(o?.frei).toBe(4)
  })

  it('richtet sich nach dem Dienstplan: wer samstags arbeitet, braucht dort Urlaub', () => {
    const samstags = (tag: Date) => tag.getDay() !== 0
    const h = vorschlaege(new Map([['2027-05-06', 'Himmelfahrt']]), samstags, 2027)[0]
    expect(tage(h?.urlaub ?? [])).toContain('2027-05-07')
    expect(h?.urlaub.length).toBeGreaterThan(1)
  })

  it('höchstens so viele Urlaubstage wie erlaubt', () => {
    expect(vorschlaege(feiertage, werktags, 2027, 2).every((x) => x.urlaub.length <= 2)).toBe(true)
  })

  it('Feiertage anderer Jahre zählen nicht', () => {
    expect(vorschlaege(new Map([['2026-05-14', 'Himmelfahrt']]), werktags, 2027)).toEqual([])
  })
})

describe('arbeitstagNachPlan', () => {
  const r: Rhythmus = {
    arten: [{ id: 's', name: 'Spät', beginn: '13:00', ende: '21:00', farbe: 'glut', pause: 30 }],
    muster: [{ id: 'm', name: 'm', tage: ['s', null, 's', 's', 's', 's', null] }],
    abfolge: [{ muster: 'm', wochen: 1 }],
    start: '2027-01-04',
    ausnahmen: [{ tag: '2027-01-08', art: 'urlaub' }],
  }
  const tag = arbeitstagNachPlan(r)

  it('gearbeitet wird an Tagen mit Schicht, auch samstags; dienstags nicht', () => {
    expect([4, 5, 9].map((d) => tag(new Date(2027, 0, d)))).toEqual([true, false, true])
  })

  it('genommener Urlaub ist schon frei', () => {
    expect(tag(new Date(2027, 0, 8))).toBe(false)
  })

  it('vor dem Start des Plans oder ohne Abfolge gelten Montag bis Freitag', () => {
    expect(tag(new Date(2027, 0, 1))).toBe(true)
    expect(arbeitstagNachPlan({ ...r, abfolge: [] })(new Date(2027, 0, 9))).toBe(false)
  })
})
