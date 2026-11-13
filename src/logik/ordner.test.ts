import { describe, expect, it } from 'vitest'
import type { Ordner, OrdnerStand } from '../vertrag/postfach'
import { anheften, einordnen, loesche, nachkommen, neuerOrdner, ordnerFehler, ordnerListe, stand, verschiebeNach } from './ordner'

// Erfundene Ordner. `zahl` steht für Ungelesenes.
const o = (id: string, art: Ordner['art'], eltern?: string, zahl = 0, angeheftet = true): Ordner => ({
  id,
  name: id,
  art,
  zahl,
  angeheftet,
  ...(eltern ? { eltern } : {}),
  ...(art === 'intelligent' ? { suche: id } : {}),
})
const ids = (l: readonly OrdnerStand[]) => l.map((x) => (x.eltern ? `${x.id}<${x.eltern}` : x.id))
const baum = [o('eingang', 'system'), o('archiv', 'system'), o('a', 'eigen', undefined, 1), o('a1', 'eigen', 'a', 2), o('a11', 'eigen', 'a1', 3), o('b', 'eigen'), o('n', 'intelligent')]

describe('ordnerListe', () => {
  it('teilt nach Art und behält die Reihenfolge', () => {
    const l = ordnerListe([o('eingang', 'system'), o('a', 'eigen'), o('n', 'intelligent'), o('archiv', 'system')])
    expect(l.system.map((x) => x.id)).toEqual(['eingang', 'archiv'])
    expect(l.eigene.map((x) => x.id)).toEqual(['a'])
    expect(l.intelligent.map((x) => x.id)).toEqual(['n'])
  })

  it('stellt Unterordner eingerückt hinter ihren Ordner', () => {
    const l = ordnerListe(baum)
    expect(l.eigene.map((x) => [x.id, x.tiefe, x.kinder])).toEqual([['a', 0, true], ['a1', 1, true], ['a11', 2, false], ['b', 0, false]])
  })

  it('zeigt Ordner mit unbekanntem oder ringförmigem Eltern-Ordner oben', () => {
    const l = ordnerListe([o('x', 'eigen', 'fehlt'), o('p', 'eigen', 'q'), o('q', 'eigen', 'p')])
    expect(l.eigene.map((x) => [x.id, x.tiefe])).toEqual([['x', 0], ['p', 0], ['q', 1]])
  })

  it('rückt System- und intelligente Ordner nie ein', () => {
    const l = ordnerListe([o('s', 'system', 'a'), o('a', 'eigen')])
    expect(l.system[0].tiefe).toBe(0)
  })

  it('ein eingeklappter Ordner zählt das Ungelesene seiner Unterordner mit und verbirgt sie', () => {
    const l = ordnerListe(baum, new Set(['a']))
    expect(l.eigene.map((x) => [x.id, x.zahl, x.zu])).toEqual([['a', 6, true], ['b', 0, false]])
    const tiefer = ordnerListe(baum, new Set(['a1']))
    expect(tiefer.eigene.map((x) => [x.id, x.zahl])).toEqual([['a', 1], ['a1', 5], ['b', 0]])
  })

  it('Ausgeblendetes steht nur in „versteckt“, samt seinen Unterordnern', () => {
    const l = ordnerListe([o('a', 'eigen', undefined, 0, false), o('a1', 'eigen', 'a'), o('b', 'eigen'), o('junk', 'system', undefined, 0, false)])
    expect(l.eigene.map((x) => x.id)).toEqual(['b'])
    expect(l.system).toEqual([])
    expect(l.versteckt.map((x) => x.id)).toEqual(['a', 'junk'])
  })
})

describe('nachkommen', () => {
  it('findet alle Unterordner in jeder Tiefe', () => {
    expect(nachkommen(baum, 'a')).toEqual(['a1', 'a11'])
    expect(nachkommen(baum, 'b')).toEqual([])
  })
})

describe('einordnen', () => {
  it('legt einen Ordner hinein, davor oder danach', () => {
    expect(ids(einordnen(baum, 'b', 'a1', 'hinein') ?? [])).toContain('b<a1')
    expect(ids(einordnen(baum, 'b', 'a', 'davor') ?? []).filter((x) => !x.includes('<')).slice(2, 4)).toEqual(['b', 'a'])
    expect(ids(einordnen(baum, 'b', 'a11', 'danach') ?? [])).toEqual(['eingang', 'archiv', 'a', 'a1<a', 'a11<a1', 'b<a1', 'n'])
  })

  it('ein Ordner kann nicht in sich selbst oder seine Unterordner', () => {
    expect(einordnen(baum, 'a', 'a', 'hinein')).toBeNull()
    expect(einordnen(baum, 'a', 'a11', 'hinein')).toBeNull()
    expect(einordnen(baum, 'a', 'a1', 'danach')).toBeNull()
  })

  it('Systemordner werden nur umsortiert, nie verschachtelt', () => {
    expect(ids(einordnen(baum, 'archiv', 'eingang', 'davor') ?? []).slice(0, 2)).toEqual(['archiv', 'eingang'])
    expect(einordnen(baum, 'archiv', 'eingang', 'hinein')).toBeNull()
    expect(einordnen(baum, 'a', 'eingang', 'hinein')).toBeNull()
    expect(einordnen(baum, 'b', 'eingang', 'davor')).toBeNull()
  })

  it('intelligente Ordner bleiben unter sich', () => {
    expect(einordnen(baum, 'n', 'a', 'hinein')).toBeNull()
    expect(einordnen(baum, 'n', 'b', 'danach')).toBeNull()
  })
})

describe('verschiebeNach', () => {
  it('hängt einen Ordner mit seinen Unterordnern um oder ganz nach oben', () => {
    expect(ids(verschiebeNach(baum, 'a1', 'b') ?? [])).toEqual(['eingang', 'archiv', 'a', 'a11<a1', 'b', 'n', 'a1<b'])
    expect(ids(verschiebeNach(baum, 'a11', null) ?? [])).toContain('a11')
    expect(verschiebeNach(baum, 'a', 'a11')).toBeNull()
    expect(verschiebeNach(baum, 'eingang', 'a')).toBeNull()
  })
})

describe('anheften', () => {
  it('anheften holt auch die Eltern zurück, ausblenden betrifft nur den Ordner', () => {
    const aus = anheften(baum, 'a', false)
    expect(aus.filter((x) => !x.angeheftet).map((x) => x.id)).toEqual(['a'])
    const zurueck = anheften(anheften(aus, 'a1', false), 'a11', true)
    expect(zurueck.every((x) => x.angeheftet)).toBe(true)
  })
})

describe('neuerOrdner und loesche', () => {
  it('legt einen Unterordner an', () => {
    const neu = neuerOrdner(stand(baum), { id: 'c', name: 'Neu', art: 'eigen', eltern: 'b', angeheftet: true })
    expect(ids(neu ?? []).at(-1)).toBe('c<b')
  })

  it('lehnt einen Unterordner unter einem Systemordner ab', () => {
    expect(neuerOrdner(stand(baum), { id: 'c', name: 'Neu', art: 'eigen', eltern: 'eingang', angeheftet: true })).toBeNull()
  })

  it('löscht einen eigenen Ordner mit allen Unterordnern, Systemordner nie', () => {
    expect(ids(loesche(baum, 'a') ?? [])).toEqual(['eingang', 'archiv', 'b', 'n'])
    expect(loesche(baum, 'eingang')).toBeNull()
  })
})

describe('ordnerFehler', () => {
  it('nimmt einen stimmigen Stand an', () => {
    expect(ordnerFehler(stand(baum))).toBeNull()
  })

  it('nennt den Grund bei doppelter id, Ring, falschem Eltern-Ordner, Farbe oder Suche am falschen Ordner', () => {
    expect(ordnerFehler([...stand(baum), stand(baum)[0]])).toMatch(/doppelt/)
    expect(ordnerFehler(stand([o('p', 'eigen', 'q'), o('q', 'eigen', 'p')]))).toMatch(/in sich selbst/)
    expect(ordnerFehler(stand([o('s', 'system'), o('x', 'eigen', 's')]))).toMatch(/Eltern/)
    expect(ordnerFehler([{ ...stand(baum)[0], farbe: 'glut' }])).toMatch(/Farbe/)
    expect(ordnerFehler([{ id: 'n', name: 'n', art: 'intelligent', angeheftet: true }])).toMatch(/Suche/)
  })
})

describe('stand', () => {
  it('lässt weg, was der Server bestimmt', () => {
    expect(stand([{ ...o('eingang', 'system', undefined, 4), wichtig: true }])).toEqual([{ id: 'eingang', name: 'eingang', art: 'system', angeheftet: true }])
  })
})
