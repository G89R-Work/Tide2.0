import { describe, expect, it } from 'vitest'
import type { Regel } from '../vertrag/postfach'
import { neueRegel, regelAenderungen, regelAusMail, regelFehler, treffer, trifft } from './regeln'
import { testMail as m } from './testMail'

// Bedingungen so, wie react-querybuilder sie als JsonLogic ausgibt.
const enthaelt = (feld: string, wert: string) => ({ in: [wert, { var: feld }] })
const regel = (bedingung: Regel['bedingung'], aktionen: Regel['aktionen'] = [{ art: 'gelesen' }]): Regel => ({ id: 'r', name: 'Probe', an: true, bedingung, aktionen })

describe('trifft', () => {
  it('vergleicht ohne Groß- und Kleinschreibung (wie Sieve)', () => {
    const x = m('a', { von: 'Stadtwerke Kassel', betreff: 'Ihre RECHNUNG' })
    expect(trifft(regel({ and: [enthaelt('betreff', 'Rechnung')] }), x)).toBe(true)
    expect(trifft(regel({ and: [{ '==': [{ var: 'von' }, 'stadtwerke kassel'] }] }), x)).toBe(true)
    expect(trifft(regel({ and: [{ '!': enthaelt('von', 'stadtwerke') }] }), x)).toBe(false)
  })

  it('kennt „beginnt mit“ und den Text der Mail', () => {
    const x = m('a', { betreff: 'Sendung unterwegs', vorschau: 'Ihr Paket kommt morgen' })
    expect(trifft(regel({ and: [{ startsWith: [{ var: 'betreff' }, 'sendung'] }] }), x)).toBe(true)
    expect(trifft(regel({ and: [{ startsWith: [{ var: 'betreff' }, 'unterwegs'] }] }), x)).toBe(false)
    expect(trifft(regel({ and: [enthaelt('text', 'paket')] }), x)).toBe(true)
  })

  it('verknüpft mit „und“ oder „oder“', () => {
    const x = m('a', { von: 'Netflix', betreff: 'Neu' })
    const zwei = [enthaelt('von', 'netflix'), enthaelt('von', 'spotify')]
    expect(trifft(regel({ or: zwei }), x)).toBe(true)
    expect(trifft(regel({ and: zwei }), x)).toBe(false)
  })

  it('eine Regel ohne Bedingung trifft nichts', () => {
    expect(trifft(regel(false), m('a'))).toBe(false)
  })
})

describe('treffer', () => {
  it('liefert die getroffenen Mails in ihrer Reihenfolge', () => {
    const liste = [m('a', { von: 'Bank' }), m('b'), m('c', { von: 'bank' })]
    expect(treffer(regel({ and: [enthaelt('von', 'Bank')] }), liste).map((x) => x.id)).toEqual(['a', 'c'])
  })
})

describe('regelAenderungen', () => {
  const r = regel({ and: [enthaelt('von', 'bank')] }, [{ art: 'verschieben', ordner: 'rechnungen' }, { art: 'kategorie', name: 'Rechnung' }, { art: 'gelesen' }, { art: 'wichtig' }])

  it('fasst alle Aktionen je Mail zusammen', () => {
    expect(regelAenderungen(r, [m('a', { von: 'Bank', ungelesen: true })])).toEqual([{ id: 'a', ordner: 'rechnungen', kategorien: ['Rechnung'], ungelesen: false, wichtig: true }])
  })

  it('lässt weg, was schon so ist, und Mails ohne Treffer', () => {
    const fertig = m('a', { von: 'Bank', ordner: 'rechnungen', kategorien: ['Rechnung'], wichtig: true })
    expect(regelAenderungen(r, [fertig, m('b')])).toEqual([])
    const halb = m('c', { von: 'Bank', kategorien: ['Rechnung', 'Familie'] })
    expect(regelAenderungen(r, [halb])).toEqual([{ id: 'c', ordner: 'rechnungen', wichtig: true }])
  })

  it('kennt Anheften und Nachverfolgen', () => {
    const x = m('a', { von: 'bank' })
    expect(regelAenderungen(regel(true, [{ art: 'anheften' }, { art: 'nachverfolgen' }]), [x])).toEqual([{ id: 'a', angeheftet: true, nachverfolgen: true }])
  })
})

describe('regelFehler', () => {
  it('verlangt Name, eine Bedingung mit Wert und eine Aktion', () => {
    const gut = regel({ and: [enthaelt('von', 'bank')] })
    expect(regelFehler(gut)).toBeUndefined()
    expect(regelFehler({ ...gut, name: '  ' })).toBe('Name fehlt')
    expect(regelFehler({ ...gut, bedingung: false })).toBe('Mindestens eine Bedingung')
    expect(regelFehler({ ...gut, bedingung: { and: [enthaelt('von', ' ')] } })).toBe('Bedingung ohne Wert')
    expect(regelFehler({ ...gut, aktionen: [] })).toBe('Mindestens eine Aktion')
  })
})

describe('regelAusMail', () => {
  it('trifft Mails derselben Adresse und archiviert sie', () => {
    const x = m('a', { von: 'Edeka', adresse: 'Info@Edeka.de' })
    const r = regelAusMail(x, 'r1')
    expect(r).toMatchObject({ id: 'r1', name: 'Mails von Edeka', an: true, aktionen: [{ art: 'verschieben', ordner: 'archiv' }] })
    expect(trifft(r, m('b', { adresse: 'info@edeka.de' }))).toBe(true)
    expect(trifft(r, m('c'))).toBe(false)
    expect(regelFehler(r)).toBeUndefined()
  })
})

describe('neueRegel', () => {
  it('beginnt mit einer leeren Bedingung und Archivieren, ohne Namen', () => {
    const r = neueRegel('r2')
    expect(regelFehler(r)).toBe('Name fehlt')
    expect(regelFehler({ ...r, name: 'X' })).toBe('Bedingung ohne Wert')
    expect(r.aktionen).toEqual([{ art: 'verschieben', ordner: 'archiv' }])
  })
})
