import { describe, expect, it } from 'vitest'
import type { Mail, OrdnerStand } from '../vertrag/postfach'
import { gezogen, inOrdner, kannHinein, mailsAendern, mailsText, ordnerZahl, passt, vorherWerte, waehle, zeigeMails } from './mails'

// Erfundene Mails; `zeit` zählt Minuten ab Mitternacht am 13.11.2026.
const m = (id: string, x: Partial<Mail> = {}): Mail => ({
  id,
  ordner: 'eingang',
  konto: 'ich@beispiel.de',
  von: `Absender ${id}`,
  adresse: `${id}@beispiel.de`,
  betreff: `Betreff ${id}`,
  vorschau: '',
  zeit: '2026-11-13T08:00:00.000Z',
  ungelesen: false,
  angeheftet: false,
  wichtig: false,
  nachverfolgen: false,
  anhaenge: [],
  kategorien: [],
  brauchtDich: false,
  ...x,
})
const o = (id: string, art: OrdnerStand['art'] = 'system', suche?: string): OrdnerStand => ({ id, name: id, art, angeheftet: true, ...(suche ? { suche } : {}) })
const ids = (l: readonly Mail[]) => l.map((x) => x.id)

describe('passt', () => {
  it('findet jedes Wort in Absender, Adresse, Betreff, Vorschau oder Kategorie, ohne Groß und klein', () => {
    const x = m('a', { von: 'Stadtwerke', betreff: 'Neuer Abschlag', kategorien: ['Rechnung'] })
    expect(passt(x, '')).toBe(true)
    expect(passt(x, 'stadtwerke abschlag')).toBe(true)
    expect(passt(x, 'RECHNUNG')).toBe(true)
    expect(passt(x, 'a@beispiel')).toBe(true)
    expect(passt(x, 'stadtwerke kino')).toBe(false)
  })

  it('kennt anhang:<endung>', () => {
    const x = m('a', { anhaenge: ['Rechnung.PDF'] })
    expect(passt(x, 'anhang:pdf')).toBe(true)
    expect(passt(x, 'anhang:jpg')).toBe(false)
    expect(passt(m('b'), 'anhang:pdf')).toBe(false)
  })
})

describe('zeigeMails', () => {
  const liste = [
    m('a', { zeit: '2026-11-13T08:00:00.000Z', von: 'Zora' }),
    m('b', { zeit: '2026-11-13T09:00:00.000Z', von: 'Anna', ungelesen: true }),
    m('c', { zeit: '2026-11-12T09:00:00.000Z', von: 'Max', angeheftet: true, anhaenge: ['x.pdf'] }),
    m('d', { zeit: '2026-11-11T09:00:00.000Z', von: 'Bert', wichtig: true, nachverfolgen: true }),
  ]
  const zeige = (x: Partial<Parameters<typeof zeigeMails>[1]>) => ids(zeigeMails(liste, { suche: '', filter: 'alle', sortierung: 'neu', ...x }))

  it('stellt Angeheftetes immer nach oben', () => {
    expect(zeige({})).toEqual(['c', 'b', 'a', 'd'])
    expect(zeige({ sortierung: 'alt' })).toEqual(['c', 'd', 'a', 'b'])
    expect(zeige({ sortierung: 'absender' })).toEqual(['c', 'b', 'd', 'a'])
    expect(zeige({ sortierung: 'wichtig' })).toEqual(['c', 'd', 'b', 'a'])
  })

  it('filtert und sucht', () => {
    expect(zeige({ filter: 'ungelesen' })).toEqual(['b'])
    expect(zeige({ filter: 'anhang' })).toEqual(['c'])
    expect(zeige({ filter: 'angeheftet' })).toEqual(['c'])
    expect(zeige({ filter: 'wichtig' })).toEqual(['d'])
    expect(zeige({ filter: 'nachverfolgen' })).toEqual(['d'])
    expect(zeige({ suche: 'anna' })).toEqual(['b'])
  })
})

describe('Ordner', () => {
  it('Braucht dich zeigt nur Posteingang mit Hinweis, intelligente Ordner suchen nicht in Papierkorb, Junk und Ausgehendem', () => {
    expect(inOrdner(m('a', { brauchtDich: true }), o('braucht-dich'))).toBe(true)
    expect(inOrdner(m('a', { brauchtDich: true, ordner: 'archiv' }), o('braucht-dich'))).toBe(false)
    expect(inOrdner(m('a', { ordner: 'archiv' }), o('archiv'))).toBe(true)
    expect(inOrdner(m('a', { ordner: 'rechnungen', betreff: 'Rechnung' }), o('s', 'intelligent', 'rechnung'))).toBe(true)
    expect(inOrdner(m('a', { ordner: 'papierkorb', betreff: 'Rechnung' }), o('s', 'intelligent', 'rechnung'))).toBe(false)
  })

  it('zählt Ungelesenes, bei Entwürfen, Braucht dich und intelligenten Ordnern alle Treffer', () => {
    const l = [m('a', { ungelesen: true, brauchtDich: true }), m('b', { brauchtDich: true }), m('c', { ordner: 'entwuerfe' })]
    expect(ordnerZahl(l, o('eingang'))).toBe(1)
    expect(ordnerZahl(l, o('braucht-dich'))).toBe(2)
    expect(ordnerZahl(l, o('entwuerfe'))).toBe(1)
    expect(ordnerZahl(l, o('s', 'intelligent', 'absender'))).toBe(2)
  })

  it('nimmt Mails nur in echte Ordner auf, nicht in Ausgehendes', () => {
    expect(kannHinein(o('archiv'))).toBe(true)
    expect(kannHinein(o('x', 'eigen'))).toBe(true)
    expect(['braucht-dich', 'entwuerfe', 'geplant', 'gesendet', 'zurueckgestellt'].some((id) => kannHinein(o(id)))).toBe(false)
    expect(kannHinein(o('s', 'intelligent', 'x'))).toBe(false)
  })
})

describe('Ändern', () => {
  const l = [m('a', { ungelesen: true }), m('b')]

  it('ändert nur die genannten Felder; mit Ordner der Liste fallen Verschobene heraus', () => {
    expect(mailsAendern(l, [{ id: 'a', ungelesen: false }])[0]).toEqual(m('a'))
    expect(ids(mailsAendern(l, [{ id: 'a', ordner: 'archiv' }], 'eingang'))).toEqual(['b'])
    expect(ids(mailsAendern(l, [{ id: 'a', ordner: 'eingang' }], 'eingang'))).toEqual(['a', 'b'])
  })

  it('merkt den alten Wert jedes geänderten Feldes für Rückgängig', () => {
    expect(vorherWerte(l, [{ id: 'a', ordner: 'archiv', ungelesen: false }, { id: 'x', ordner: 'archiv' }])).toEqual([{ id: 'a', ordner: 'eingang', ungelesen: true }])
  })
})

describe('Auswahl', () => {
  const reihe = ['a', 'b', 'c', 'd']
  const leer = { ids: [], anker: null }

  it('wählt einzeln, dazu und als Bereich ab dem Anker', () => {
    const a = waehle(leer, reihe, 'b', 'einzeln')
    expect(a).toEqual({ ids: ['b'], anker: 'b' })
    expect(waehle(a, reihe, 'd', 'dazu')).toEqual({ ids: ['b', 'd'], anker: 'd' })
    expect(waehle(waehle(a, reihe, 'd', 'dazu'), reihe, 'd', 'dazu')).toEqual({ ids: ['b'], anker: 'd' })
    expect(waehle(a, reihe, 'd', 'bereich')).toEqual({ ids: ['b', 'c', 'd'], anker: 'b' })
    expect(waehle(a, reihe, 'a', 'bereich').ids).toEqual(['a', 'b'])
    expect(waehle(leer, reihe, 'c', 'bereich').ids).toEqual(['c'])
  })

  it('zieht die ganze Auswahl, wenn die gezogene Mail dazugehört', () => {
    expect(gezogen({ ids: ['a', 'c'], anker: 'c' }, 'c')).toEqual(['a', 'c'])
    expect(gezogen({ ids: ['a', 'c'], anker: 'c' }, 'b')).toEqual(['b'])
  })
})

describe('mailsText', () => {
  it('schreibt eine Mail und mehrere Mails', () => {
    expect(mailsText(1)).toBe('1 Mail')
    expect(mailsText(0)).toBe('0 Mails')
    expect(mailsText(3)).toBe('3 Mails')
  })
})
