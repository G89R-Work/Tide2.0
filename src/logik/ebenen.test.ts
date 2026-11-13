import { describe, expect, it } from 'vitest'
import { bereiche } from './bereiche'
import { ebeneVon, markeFuer, ortAusMarke } from './ebenen'
import { einstellungen } from './einstellungen'

describe('ebeneVon', () => {
  it('Heute hat keine zweite Ebene, jeder andere Bereich eine', () => {
    expect(ebeneVon('heute')).toEqual([])
    for (const b of bereiche.slice(1)) expect(ebeneVon(b.id).length).toBeGreaterThan(0)
  })

  it('hat je Bereich eindeutige Kennungen ohne Schrägstrich', () => {
    for (const b of bereiche) {
      const ids = ebeneVon(b.id).map((u) => u.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('folgt dem Konzept, z. B. Finanzen und Arbeit', () => {
    expect(ebeneVon('finanzen').map((u) => u.name)).toEqual(['Übersicht', 'Rechnungen', 'Abos', 'Verträge'])
    expect(ebeneVon('arbeit').map((u) => u.name)).toEqual(['Schichtplan', 'Arbeitszeit', 'Urlaub', 'Wissen'])
  })
})

describe('ortAusMarke', () => {
  it('liest Bereich und Unterpunkt', () => {
    expect(ortAusMarke('#postfach/gesendet')).toEqual({ bereich: 'postfach', unter: 'gesendet' })
  })

  it('nimmt ohne oder bei unbekanntem Unterpunkt den ersten', () => {
    expect(ortAusMarke('#postfach')).toEqual({ bereich: 'postfach', unter: 'eingang' })
    expect(ortAusMarke('#postfach/gibtsnicht')).toEqual({ bereich: 'postfach', unter: 'eingang' })
    expect(ortAusMarke('#finanzen/')).toEqual({ bereich: 'finanzen', unter: 'uebersicht' })
  })

  it('Heute und Unbekanntes haben keinen Unterpunkt', () => {
    expect(ortAusMarke('')).toEqual({ bereich: 'heute', unter: null })
    expect(ortAusMarke('#heute/eingang')).toEqual({ bereich: 'heute', unter: null })
    expect(ortAusMarke('#gibtsnicht/eingang')).toEqual({ bereich: 'heute', unter: null })
  })
})

describe('markeFuer', () => {
  it('baut die Sprungmarke und lässt sich zurücklesen', () => {
    expect(markeFuer('heute')).toBe('#heute')
    expect(markeFuer('kochen', 'wochenplan')).toBe('#kochen/wochenplan')
    for (const b of bereiche)
      for (const u of ebeneVon(b.id)) expect(ortAusMarke(markeFuer(b.id, u.id))).toEqual({ bereich: b.id, unter: u.id })
  })
})

describe('Einstellungen in der mittleren Spalte', () => {
  const ebene = ebeneVon('einstellungen')
  it('hat die Gruppen der Vorlage in fester Reihenfolge, ohne KI', () => {
    const gruppen = ebene.map((p) => p.gruppe).filter((g, i, a) => g !== a[i - 1])
    expect(gruppen).toEqual(['Allgemein', 'Bereiche', 'Schreiben', 'Personen', 'Daten und Kosten'])
    expect(ebene.some((p) => /\bKI\b/.test(`${p.name} ${p.gruppe}`))).toBe(false)
  })
  it('erreicht jede Einstellung über eine Zeile', () => {
    for (const e of einstellungen) expect(ebene.some((p) => p.id === e.abschnitt), e.id).toBe(true)
  })
})
