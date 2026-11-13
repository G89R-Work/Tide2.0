import { describe, expect, it } from 'vitest'
import type { Konto, Mail, MailInhalt } from '../vertrag/postfach'
import { abgeschickt, adressenAus, adressenText, antwortEntwurf, entwurfAlsMail, neuerEntwurf, sendeFehler, tauscheSignatur } from './schreiben'

// Erfundene Konten und eine Mail an beide.
const konten: Konto[] = [
  { adresse: 'ich@beispiel.example', name: 'Ich', signatur: 'Viele Grüße\nIch' },
  { adresse: 'familie@beispiel.example', name: 'Familie', signatur: 'Liebe Grüße' },
]
const mail: Mail = {
  id: 'm1',
  ordner: 'eingang',
  konto: 'familie@beispiel.example',
  von: 'Lena',
  adresse: 'lena@beispiel.example',
  betreff: 'AW: Treffen',
  vorschau: 'Passt Samstag?',
  zeit: new Date(2026, 10, 13, 9, 5).toISOString(),
  ungelesen: false,
  angeheftet: false,
  wichtig: false,
  nachverfolgen: false,
  anhaenge: [],
  kategorien: [],
  brauchtDich: false,
}
const inhalt: MailInhalt = { id: 'm1', an: ['familie@beispiel.example', 'tom@beispiel.example'], cc: ['ich@beispiel.example', 'oma@beispiel.example'], text: 'Passt Samstag?\nBis dann' }

describe('Antworten', () => {
  it('antwortet vom Konto, an das die Mail ging, mit dessen Signatur und Zitat', () => {
    const e = antwortEntwurf(mail, inhalt, 'antworten', konten)
    expect(e).toMatchObject({ konto: 'familie@beispiel.example', an: ['lena@beispiel.example'], cc: [], betreff: 'Re: Treffen', wichtig: false, antwortAuf: 'm1' })
    expect(e.text).toBe('\n\nLiebe Grüße\n\nAm Freitag, 13. November 2026 um 09:05 schrieb Lena:\n> Passt Samstag?\n> Bis dann')
  })

  it('schreibt beim Antworten an alle auch die anderen Empfänger an, ohne eigene Konten', () => {
    const e = antwortEntwurf(mail, inhalt, 'allen', konten)
    expect(e.an).toEqual(['lena@beispiel.example', 'tom@beispiel.example'])
    expect(e.cc).toEqual(['oma@beispiel.example'])
  })

  it('leitet ohne Empfänger und mit „Wg:“ weiter', () => {
    const e = antwortEntwurf(mail, inhalt, 'weiterleiten', konten)
    expect(e).toMatchObject({ an: [], betreff: 'Wg: Treffen' })
    expect(e.antwortAuf).toBeUndefined()
  })

  it('nimmt das erste Konto, wenn die Mail an keines ging', () => {
    expect(antwortEntwurf({ ...mail, konto: 'alt@beispiel.example' }, inhalt, 'antworten', konten).konto).toBe('ich@beispiel.example')
  })
})

describe('Neue Mail und Signatur', () => {
  it('beginnt leer mit der Signatur des ersten Kontos', () => {
    expect(neuerEntwurf(konten)).toEqual({ konto: 'ich@beispiel.example', an: [], cc: [], betreff: '', text: '\n\nViele Grüße\nIch', wichtig: false })
  })

  it('tauscht die Signatur beim Wechsel des Kontos, lässt Text ohne Signatur unberührt', () => {
    expect(tauscheSignatur('Hallo\n\nViele Grüße\nIch\n\n> alt', 'Viele Grüße\nIch', 'Liebe Grüße')).toBe('Hallo\n\nLiebe Grüße\n\n> alt')
    expect(tauscheSignatur('Hallo', 'Viele Grüße\nIch', 'Liebe Grüße')).toBe('Hallo')
    expect(tauscheSignatur('Hallo', '', 'Liebe Grüße')).toBe('Hallo')
  })
})

describe('Adressen', () => {
  it('liest Adressen getrennt durch Komma, Strichpunkt oder Leerzeichen und schreibt sie wieder', () => {
    expect(adressenAus(' a@b.de, c@d.de;e@f.de  g@h.de ,')).toEqual(['a@b.de', 'c@d.de', 'e@f.de', 'g@h.de'])
    expect(adressenAus('')).toEqual([])
    expect(adressenText(['a@b.de', 'c@d.de'])).toBe('a@b.de, c@d.de')
  })

  it('sendet nur mit Empfänger und gültigen Adressen', () => {
    const e = neuerEntwurf(konten)
    expect(sendeFehler(e)).toBe('Kein Empfänger')
    expect(sendeFehler({ ...e, an: ['lena'] })).toBe('Adresse ungültig: lena')
    expect(sendeFehler({ ...e, an: ['lena@beispiel.example'], cc: ['x@'] })).toBe('Adresse ungültig: x@')
    expect(sendeFehler({ ...e, an: ['lena@beispiel.example'] })).toBeNull()
  })
})

describe('Entwurf als Mail', () => {
  const jetzt = new Date('2026-11-13T10:00:00.000Z')
  it('zeigt Empfänger als Absender und die erste Textzeile als Vorschau', () => {
    const m = entwurfAlsMail('d1', { ...neuerEntwurf(konten), an: ['lena@beispiel.example'], betreff: 'Hallo', text: '\n\nWie geht es dir?\n\nViele Grüße' }, jetzt)
    expect(m).toMatchObject({ id: 'd1', ordner: 'entwuerfe', von: 'An: lena@beispiel.example', adresse: 'lena@beispiel.example', vorschau: 'Wie geht es dir?', zeit: jetzt.toISOString(), ungelesen: false })
  })

  it('zeigt „Ohne Empfänger“ und behält die Antwort', () => {
    expect(entwurfAlsMail('d1', { ...neuerEntwurf(konten), antwortAuf: 'm1' }, jetzt)).toMatchObject({ von: 'Ohne Empfänger', adresse: '', antwortAuf: 'm1' })
  })

  it('verschickt geplante Mails ab ihrer Zeit nach „Gesendet“', () => {
    const geplant = { ...entwurfAlsMail('d1', neuerEntwurf(konten), jetzt), ordner: 'geplant', sendenAm: '2026-11-13T09:59:00.000Z' }
    const spaeter = { ...geplant, id: 'd2', sendenAm: '2026-11-13T10:01:00.000Z' }
    const [a, b] = abgeschickt([geplant, spaeter], jetzt)
    expect([a?.ordner, a?.zeit, a?.sendenAm]).toEqual(['gesendet', '2026-11-13T09:59:00.000Z', undefined])
    expect(b?.ordner).toBe('geplant')
  })
})
