import { describe, expect, it } from 'vitest'
import { leererVerlauf, merken, wiederholen, zuruecknehmen } from './rueckgaengig'

type S = { text: string; bereich?: string }
const s = (text: string, bereich?: string): S => ({ text, bereich })
const leer = () => leererVerlauf<S>()

describe('Rückgängig-Verlauf', () => {
  it('nimmt ohne Bereich den letzten Schritt von ganz Tide zurück', () => {
    const v = merken(merken(leer(), s('a', 'heute')), s('b', 'einstellungen'))
    const { schritt, verlauf } = zuruecknehmen(v)
    expect(schritt?.text).toBe('b')
    expect(verlauf.zurueck.map((x) => x.text)).toEqual(['a'])
    expect(verlauf.vor.map((x) => x.text)).toEqual(['b'])
  })

  it('nimmt mit Bereich nur Schritte dieser Seite zurück, andere bleiben stehen', () => {
    const v = merken(merken(merken(leer(), s('a', 'heute')), s('b', 'einstellungen')), s('c'))
    const { schritt, verlauf } = zuruecknehmen(v, 'heute')
    expect(schritt?.text).toBe('a')
    expect(verlauf.zurueck.map((x) => x.text)).toEqual(['b', 'c'])
    expect(zuruecknehmen(verlauf, 'heute').schritt).toBeUndefined()
  })

  it('stellt Zurückgenommenes wieder her, auch je Bereich', () => {
    let v = merken(merken(leer(), s('a', 'heute')), s('b', 'einstellungen'))
    v = zuruecknehmen(v).verlauf
    v = zuruecknehmen(v).verlauf
    const heute = wiederholen(v, 'heute')
    expect(heute.schritt?.text).toBe('a')
    expect(heute.verlauf.zurueck.map((x) => x.text)).toEqual(['a'])
    expect(wiederholen(heute.verlauf).schritt?.text).toBe('b')
  })

  it('ein neuer Schritt verwirft das Wiederherstellen nur im eigenen Bereich', () => {
    let v = merken(merken(leer(), s('a', 'heute')), s('b', 'einstellungen'))
    v = zuruecknehmen(zuruecknehmen(v).verlauf).verlauf
    v = merken(v, s('c', 'heute'))
    expect(v.vor.map((x) => x.text)).toEqual(['b'])
  })

  it('behält höchstens 20 Schritte', () => {
    let v = leer()
    for (let i = 0; i < 25; i++) v = merken(v, s(String(i)))
    expect(v.zurueck).toHaveLength(20)
    expect(v.zurueck[0].text).toBe('5')
  })
})
