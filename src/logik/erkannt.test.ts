import { describe, expect, it } from 'vitest'
import { erkenne } from './erkannt'
import { testMail as m } from './testMail'

// Erfundene Mails, eingegangen am Freitag, 13.11.2026, 9 Uhr Ortszeit.
const am = new Date(2026, 10, 13, 9).toISOString()
const mail = (betreff: string, text: string, x: Parameters<typeof m>[1] = {}) => ({ m: m('a', { betreff, zeit: am, ...x }), text })

describe('Rechnung', () => {
  it('erkennt Betrag und Abbuchungstag', () => {
    const { m: x, text } = mail('Ihre Rechnung für November', 'Der Betrag von 44,95 € wird am 20. November abgebucht.')
    expect(erkenne(x, text, [])).toEqual([{ art: 'rechnung', cent: 4495, faellig: '2026-11-20' }])
  })

  it('vergleicht mit der letzten Rechnung desselben Absenders', () => {
    const alt = m('alt', { adresse: 'a@beispiel.de', betreff: 'Rechnung', vorschau: 'Ihre Rechnung über 1.029,99 € steht bereit.', zeit: new Date(2026, 9, 13).toISOString() })
    const { m: x, text } = mail('Rechnung online', 'Ihre aktuelle Rechnung über 1.034,99 € steht bereit.', { adresse: 'a@beispiel.de' })
    expect(erkenne(x, text, [alt])).toEqual([{ art: 'rechnung', cent: 103499, vorher: 102999 }])
  })

  it('ohne Betrag oder ohne Rechnungswort nichts', () => {
    expect(erkenne(mail('Ihre Rechnung', 'Die Rechnung liegt im Postfach.').m, 'Die Rechnung liegt im Postfach.', [])).toEqual([])
    expect(erkenne(mail('Angebot', 'Nur heute 9,99 € sparen!').m, 'Nur heute 9,99 € sparen!', [])).toEqual([])
  })

  it('ein Monat vor der Mail meint das nächste Jahr', () => {
    const { m: x, text } = mail('Rechnung', 'Betrag 12,00 € wird am 5. Januar abgebucht.')
    expect(erkenne(x, text, [])).toEqual([{ art: 'rechnung', cent: 1200, faellig: '2027-01-05' }])
  })
})

describe('Termin', () => {
  it('Wochentag mit Uhrzeit liegt am nächsten solchen Tag nach der Mail', () => {
    const { m: x, text } = mail('Terminbestätigung Dienstag, 9:30 Uhr', 'Blutabnahme am Dienstag um 9:30 Uhr.')
    expect(erkenne(x, text, [])).toEqual([{ art: 'termin', beginn: new Date(2026, 10, 17, 9, 30).toISOString() }])
  })

  it('volle Stunde und Datum mit Monat', () => {
    const { m: x, text } = mail('Einladung', 'Elternabend am 3. Dezember um 19 Uhr.')
    expect(erkenne(x, text, [])).toEqual([{ art: 'termin', beginn: new Date(2026, 11, 3, 19).toISOString() }])
  })

  it('über die Umstellung auf Sommerzeit bleibt die Uhrzeit', () => {
    const { m: x, text } = mail('Termin', 'Wir sehen uns am Montag um 10 Uhr.', { zeit: new Date(2027, 2, 26, 9).toISOString() })
    expect(erkenne(x, text, [])).toEqual([{ art: 'termin', beginn: new Date(2027, 2, 29, 10).toISOString() }])
  })

  it('Uhrzeit ohne Tag ist unsicher', () => {
    expect(erkenne(mail('Kino', 'Ich hab für 20 Uhr reserviert.').m, 'Ich hab für 20 Uhr reserviert.', [])).toEqual([])
  })
})

describe('Sendung', () => {
  it('erkennt Sendungsnummer und „morgen“', () => {
    const { m: x, text } = mail('Ihr Paket kommt morgen', 'Zustellung morgen zwischen 10 und 14 Uhr. Sendungsnummer 0034 0434 5567.')
    expect(erkenne(x, text, [])).toEqual([{ art: 'sendung', nummer: '003404345567', erwartet: '2026-11-14' }])
  })

  it('„übermorgen“ auch ohne Nummer', () => {
    const { m: x, text } = mail('Ihre Sendung ist unterwegs', 'Ihre Sendung kommt voraussichtlich übermorgen an.')
    expect(erkenne(x, text, [])).toEqual([{ art: 'sendung', erwartet: '2026-11-15' }])
  })

  it('ohne Paket oder Sendung nichts', () => {
    expect(erkenne(mail('Treffen', 'Bis morgen!').m, 'Bis morgen!', [])).toEqual([])
  })
})

describe('Frist', () => {
  it('„binnen eines Monats“ zählt ab Eingang', () => {
    const { m: x, text } = mail('Bescheid', 'Einspruch ist binnen eines Monats möglich.')
    expect(erkenne(x, text, [])).toEqual([{ art: 'frist', bis: '2026-12-13', was: 'Einspruch' }])
  })

  it('„innerhalb von 14 Tagen“ und „bis zum 30. November“', () => {
    const a = mail('Mahnung', 'Bitte zahlen Sie innerhalb von 14 Tagen.')
    expect(erkenne(a.m, a.text, [])).toEqual([{ art: 'frist', bis: '2026-11-27', was: 'Mahnung' }])
    const b = mail('Unterlagen', 'Bitte senden Sie die Unterlagen bis zum 30. November.')
    expect(erkenne(b.m, b.text, [])).toEqual([{ art: 'frist', bis: '2026-11-30', was: 'Unterlagen' }])
  })

  it('eine Frist nennt den Grund nach dem Schlüsselwort, sonst den Betreff', () => {
    const { m: x, text } = mail('Abschlag', 'Widerspruch bis 15. Dezember möglich.')
    expect(erkenne(x, text, [])).toEqual([{ art: 'frist', bis: '2026-12-15', was: 'Widerspruch' }])
  })

  it('ohne Dauer oder Datum keine Frist', () => {
    const { m: x, text } = mail('Hallo', 'Einspruch ist möglich. Bis bald!')
    expect(erkenne(x, text, [])).toEqual([])
  })
})
