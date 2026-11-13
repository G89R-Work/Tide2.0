import { describe, expect, it } from 'vitest'
import type { Ordner } from '../vertrag/postfach'
import { ordnerListe } from './ordner'

const o = (id: string, art: Ordner['art'], eltern?: string): Ordner => ({ id, name: id, art, zahl: 0, ...(eltern ? { eltern } : {}) })

describe('ordnerListe', () => {
  it('teilt nach Art und behält die Reihenfolge', () => {
    const l = ordnerListe([o('eingang', 'system'), o('a', 'eigen'), o('n', 'intelligent'), o('archiv', 'system')])
    expect(l.system.map((x) => x.id)).toEqual(['eingang', 'archiv'])
    expect(l.eigene.map((x) => x.id)).toEqual(['a'])
    expect(l.intelligent.map((x) => x.id)).toEqual(['n'])
  })
  it('stellt Unterordner eingerückt hinter ihren Ordner', () => {
    const l = ordnerListe([o('a', 'eigen'), o('b', 'eigen'), o('a1', 'eigen', 'a'), o('a11', 'eigen', 'a1')])
    expect(l.eigene.map((x) => [x.id, x.tiefe])).toEqual([['a', 0], ['a1', 1], ['a11', 2], ['b', 0]])
  })
  it('zeigt Ordner mit unbekanntem oder ringförmigem Eltern-Ordner oben', () => {
    const l = ordnerListe([o('x', 'eigen', 'fehlt'), o('p', 'eigen', 'q'), o('q', 'eigen', 'p')])
    expect(l.eigene.map((x) => [x.id, x.tiefe])).toEqual([['x', 0], ['p', 0], ['q', 1]])
  })
  it('rückt System- und intelligente Ordner nie ein', () => {
    const l = ordnerListe([o('s', 'system', 'a'), o('a', 'eigen')])
    expect(l.system[0].tiefe).toBe(0)
  })
})
