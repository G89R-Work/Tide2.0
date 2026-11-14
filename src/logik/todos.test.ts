import { describe, expect, it } from 'vitest'
import type { Eintrag } from '../vertrag/eintrag'
import { ausEingabe, fristFuer, gruppeVon, gruppen, imUnterpunkt } from './todos'

// Mittwoch, 18. November 2026, 10 Uhr
const jetzt = new Date(2026, 10, 18, 10)
const t = (id: string, extra: Partial<Eintrag> = {}): Eintrag => ({ id, art: 'aufgabe', titel: id, erledigt: false, erstellt: '2026-11-01T08:00:00Z', geaendert: '2026-11-01T08:00:00Z', ...extra })

describe('Gruppe nach Fälligkeit', () => {
  it('Überfällig, Heute, Diese Woche (bis Sonntag), Später, Irgendwann', () => {
    expect(gruppeVon(t('a', { frist: '2026-11-17' }), jetzt)).toBe('ueberfaellig')
    expect(gruppeVon(t('b', { frist: '2026-11-18' }), jetzt)).toBe('heute')
    expect(gruppeVon(t('c', { frist: '2026-11-22' }), jetzt)).toBe('woche')
    expect(gruppeVon(t('d', { frist: '2026-11-23' }), jetzt)).toBe('spaeter')
    expect(gruppeVon(t('e'), jetzt)).toBe('irgendwann')
  })

  it('gruppen sortiert je Gruppe nach Frist, leere Gruppen bleiben stehen', () => {
    const g = gruppen([t('spät', { frist: '2026-12-01' }), t('früher', { frist: '2026-11-25' }), t('heute', { frist: '2026-11-18' })], jetzt)
    expect(g.map((x) => x.id)).toEqual(['ueberfaellig', 'heute', 'woche', 'spaeter', 'irgendwann'])
    expect(g[3]?.liste.map((x) => x.id)).toEqual(['früher', 'spät'])
    expect(g[0]?.liste).toEqual([])
  })
})

describe('Frist beim Ziehen in eine Gruppe', () => {
  it('Heute: heute; Diese Woche: morgen; Später: Montag der nächsten Woche; Irgendwann: keine', () => {
    expect(fristFuer('heute', jetzt)).toBe('2026-11-18')
    expect(fristFuer('woche', jetzt)).toBe('2026-11-19')
    expect(fristFuer('spaeter', jetzt)).toBe('2026-11-23')
    expect(fristFuer('irgendwann', jetzt)).toBeNull()
  })

  it('in Überfällig lässt sich nichts ziehen; am Sonntag gibt es kein „Diese Woche“ mehr', () => {
    expect(fristFuer('ueberfaellig', jetzt)).toBeUndefined()
    expect(fristFuer('woche', new Date(2026, 10, 22, 10))).toBeUndefined()
  })

  it('über Mitternacht zählt der neue Tag', () => {
    expect(fristFuer('heute', new Date(2026, 10, 18, 23, 59))).toBe('2026-11-18')
    expect(fristFuer('heute', new Date(2026, 10, 19, 0, 0))).toBe('2026-11-19')
  })

  it('über die Umstellung auf Winterzeit bleibt „morgen“ der nächste Tag', () => {
    expect(fristFuer('woche', new Date(2026, 9, 24, 23, 30))).toBe('2026-10-25')
  })
})

describe('Eingabezeile', () => {
  it('„heute“, „morgen“, „übermorgen“ setzen die Frist und fallen aus dem Titel', () => {
    expect(ausEingabe('Brot kaufen heute', jetzt)).toEqual({ titel: 'Brot kaufen', frist: '2026-11-18' })
    expect(ausEingabe('morgen Oma anrufen', jetzt)).toEqual({ titel: 'Oma anrufen', frist: '2026-11-19' })
    expect(ausEingabe('Übermorgen Reifen wechseln', jetzt)).toEqual({ titel: 'Reifen wechseln', frist: '2026-11-20' })
  })

  it('ohne Wort keine Frist; Wortteile zählen nicht', () => {
    expect(ausEingabe('Steuer machen', jetzt)).toEqual({ titel: 'Steuer machen' })
    expect(ausEingabe('Morgenroutine planen', jetzt)).toEqual({ titel: 'Morgenroutine planen' })
    expect(ausEingabe('  ', jetzt)).toBeNull()
  })

  it('nur das Wort allein ist kein To-do', () => {
    expect(ausEingabe('morgen', jetzt)).toBeNull()
  })
})

describe('Unterpunkte der zweiten Ebene', () => {
  const liste = [
    t('eigen'),
    t('mail', { herkunft: 'mail' }),
    t('rueckruf', { herkunft: 'rueckruf' }),
    t('rechnung', { herkunft: 'rechnung', raum: 'arbeit' }),
    t('erledigt', { erledigt: true }),
    { ...t('notiz'), art: 'notiz' as const },
  ]
  const ids = (unter?: string) => liste.filter((e) => imUnterpunkt(e, unter)).map((e) => e.id)

  it('Alle zeigt offene To-dos, auch ohne Unterpunkt', () => {
    expect(ids('alle')).toEqual(['eigen', 'mail', 'rueckruf', 'rechnung'])
    expect(ids(undefined)).toEqual(ids('alle'))
  })

  it('nach Herkunft und Raum', () => {
    expect(ids('eigene')).toEqual(['eigen'])
    expect(ids('mails')).toEqual(['mail'])
    expect(ids('rueckrufe')).toEqual(['rueckruf'])
    expect(ids('rechnungen')).toEqual(['rechnung'])
    expect(ids('arbeit')).toEqual(['rechnung'])
    expect(ids('privat')).toEqual(['eigen', 'mail', 'rueckruf'])
  })

  it('Archiv zeigt nur Erledigtes', () => {
    expect(ids('archiv')).toEqual(['erledigt'])
  })
})
