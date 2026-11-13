// Schreiben im Postfach: Antwort, Allen antworten, Weiterleiten und neue Mail vorbereiten, Signatur tauschen,
// Adressen lesen und prüfen, Entwurf als Mail zeigen, geplante Mails verschicken. Gilt für Oberfläche und Attrappe.
import { z } from 'zod'
import type { Entwurf, Konto, Mail, MailInhalt } from '../vertrag/postfach'
import { datumLang, uhrzeit } from './zeit'

export type Antwortart = 'antworten' | 'allen' | 'weiterleiten'

/** Signatur eines Kontos; unbekannt: keine. */
const signaturVon = (konten: readonly Konto[], adresse: string) => konten.find((k) => k.adresse === adresse)?.signatur ?? ''

/** Leerzeilen zum Schreiben, dann Signatur und wahlweise Zitat. */
const rumpf = (signatur: string, zitat?: string) => ['', '', ...(signatur ? [signatur] : []), ...(zitat ? ['', zitat] : [])].join('\n').replace(/^\n\n\n/, '\n\n')

/** Betreff ohne vorangestellte „Re:“, „AW:“, „Wg:“, „Fwd:“. */
const kern = (betreff: string) => betreff.replace(/^((re|aw|wg|fw|fwd)\s*:\s*)+/i, '')

/** „Am Freitag, 13. November 2026 um 09:05 schrieb Lena:“ und jede Zeile mit „> “. */
function zitat(m: Mail, text: string): string {
  return [`Am ${datumLang(m.zeit)} um ${uhrzeit(m.zeit)} schrieb ${m.von}:`, ...text.split('\n').map((z) => `> ${z}`)].join('\n')
}

/** Entwurf einer Antwort, einer Antwort an alle oder einer Weiterleitung, vom Konto, an das die Mail ging. */
export function antwortEntwurf(m: Mail, inhalt: MailInhalt, art: Antwortart, konten: readonly Konto[]): Entwurf {
  const eigen = new Set(konten.map((k) => k.adresse))
  const konto = eigen.has(m.konto) ? m.konto : (konten[0]?.adresse ?? m.konto)
  const text = rumpf(signaturVon(konten, konto), zitat(m, inhalt.text))
  if (art === 'weiterleiten') return { konto, an: [], cc: [], betreff: `Wg: ${kern(m.betreff)}`, text, wichtig: false }
  const fremd = (l: readonly string[]) => l.filter((a) => !eigen.has(a) && a !== m.adresse)
  return {
    konto,
    an: art === 'allen' ? [m.adresse, ...fremd(inhalt.an)] : [m.adresse],
    cc: art === 'allen' ? fremd(inhalt.cc) : [],
    betreff: `Re: ${kern(m.betreff)}`,
    text,
    wichtig: false,
    antwortAuf: m.id,
  }
}

/** Neue, leere Mail vom ersten Konto mit dessen Signatur. */
export function neuerEntwurf(konten: readonly Konto[]): Entwurf {
  const konto = konten[0]?.adresse ?? ''
  return { konto, an: [], cc: [], betreff: '', text: rumpf(signaturVon(konten, konto)), wichtig: false }
}

/** Ersetzt die alte Signatur im Text durch die neue; steht sie nicht (mehr) darin, bleibt der Text, wie er ist. */
export function tauscheSignatur(text: string, alt: string, neu: string): string {
  return alt && text.includes(alt) ? text.replace(alt, neu) : text
}

/** Adressen aus einem Feld: getrennt durch Komma, Strichpunkt oder Leerzeichen. */
export const adressenAus = (text: string) => text.split(/[\s,;]+/).filter(Boolean)
export const adressenText = (l: readonly string[]) => l.join(', ')

const adresse = z.email()

/** Grund, warum sich der Entwurf nicht senden lässt, sonst null. */
export function sendeFehler(e: Entwurf): string | null {
  if (e.an.length === 0) return 'Kein Empfänger'
  const falsch = [...e.an, ...e.cc].find((a) => !adresse.safeParse(a).success)
  return falsch ? `Adresse ungültig: ${falsch}` : null
}

/** Der Entwurf, wie er in der Liste erscheint: Empfänger statt Absender, erste Textzeile als Vorschau. */
export function entwurfAlsMail(id: string, e: Entwurf, jetzt: Date): Mail {
  return {
    id,
    ordner: 'entwuerfe',
    konto: e.konto,
    von: e.an.length ? `An: ${adressenText(e.an)}` : 'Ohne Empfänger',
    adresse: e.an[0] ?? '',
    betreff: e.betreff,
    vorschau: e.text.split('\n').find((z) => z.trim())?.trim() ?? '',
    zeit: jetzt.toISOString(),
    ungelesen: false,
    angeheftet: false,
    wichtig: e.wichtig,
    nachverfolgen: false,
    anhaenge: [],
    kategorien: [],
    brauchtDich: false,
    ...(e.antwortAuf ? { antwortAuf: e.antwortAuf } : {}),
  }
}

/** Geplante Mails, deren Zeit gekommen ist, liegen in „Gesendet“, mit der Sendezeit als Zeit. */
export function abgeschickt(liste: readonly Mail[], jetzt: Date): Mail[] {
  return liste.map((m) => {
    if (m.ordner !== 'geplant' || !m.sendenAm || new Date(m.sendenAm) > jetzt) return m
    const { sendenAm, ...rest } = m
    return { ...rest, ordner: 'gesendet', zeit: sendenAm }
  })
}
