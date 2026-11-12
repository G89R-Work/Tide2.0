import { describe, expect, it } from 'vitest'
import { freierPlatz } from './freierPlatz'

const basis = { rand: 8, abstand: 12 }

describe('freierPlatz', () => {
  it('PC ohne Kurve: oben und unten nur der Rand', () => {
    expect(freierPlatz({ ...basis, verdeckt: { oben: 0, unten: 0 }, kurve: 'aus', kopfzeile: false })).toEqual({ oben: 8, unten: 8 })
  })

  it('Kurve unten: unten genau der verdeckte Platz, denn der Griff dazwischen ist schon der Abstand', () => {
    expect(freierPlatz({ ...basis, verdeckt: { oben: 0, unten: 92 }, kurve: 'unten', kopfzeile: false })).toEqual({ oben: 8, unten: 92 })
  })

  it('Kurve oben: oben der verdeckte Platz, unten der Rand', () => {
    expect(freierPlatz({ ...basis, verdeckt: { oben: 92, unten: 0 }, kurve: 'oben', kopfzeile: false })).toEqual({ oben: 92, unten: 8 })
  })

  it('Handy: unter der Kopfzeile und über der unteren Leiste der Abstand', () => {
    expect(freierPlatz({ ...basis, verdeckt: { oben: 0, unten: 60 }, kurve: 'aus', kopfzeile: true })).toEqual({ oben: 12, unten: 72 })
    expect(freierPlatz({ ...basis, verdeckt: { oben: 0, unten: 160 }, kurve: 'unten', kopfzeile: true })).toEqual({ oben: 12, unten: 160 })
    expect(freierPlatz({ ...basis, verdeckt: { oben: 100, unten: 60 }, kurve: 'oben', kopfzeile: true })).toEqual({ oben: 100, unten: 72 })
  })
})
