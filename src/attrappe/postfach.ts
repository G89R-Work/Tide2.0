import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import { echterOrdner, inOrdner, mailsAendern, ordnerZahl, zurueckGekommen } from '../logik/mails'
import { ordnerFehler } from '../logik/ordner'
import { abgeschickt, entwurfAlsMail, sendeFehler } from '../logik/schreiben'
import { abwesenheitSchema, blockiertSchema, entwurfSchema, kategorieSchema, kontoSchema, mailAenderungSchema, mailInhaltSchema, mailSchema, ordnerStandSchema, regelSchema, type Mail, type MailInhalt, type Ordner, type OrdnerStand, type Regel } from '../vertrag/postfach'
import { beispielInhalt, beispielKategorien, beispielKonten, beispielMails } from './mails'
import { abgelehnt, anfrageInhalt, gemerkt } from './pruefen'

// Beispielordner wie in der Vorlage (docs/vorlage-aussehen/bilder/postfach-ordner.jpg), Systemordner wie im Konzept.
// Die Attrappe merkt sich Reihenfolge, Namen, Farben und Anheften im Browser; die Zähler rechnet sie aus den Mails.
const schluessel = 'tide.attrappe.ordner'
const mailSchluessel = 'tide.attrappe.mails'
const inhaltSchluessel = 'tide.attrappe.inhalte'
const regelSchluessel = 'tide.attrappe.regeln'
const kategorienSchluessel = 'tide.attrappe.kategorien'
const kontenSchluessel = 'tide.attrappe.konten'
const abwesenheitSchluessel = 'tide.attrappe.abwesenheit'
const blockiertSchluessel = 'tide.attrappe.blockiert'
/** So lange bleibt eine sofort gesendete Mail in „Geplant“ und lässt sich zurückholen (wie beim echten Server). */
const RUECKHOL_MS = 5000

const ab = (x: Omit<OrdnerStand, 'angeheftet'> & { angeheftet?: boolean }): OrdnerStand => ({ angeheftet: true, ...x })
const ausgang: OrdnerStand[] = [
  ab({ id: 'eingang', name: 'Posteingang', art: 'system' }),
  ab({ id: 'braucht-dich', name: 'Braucht dich', art: 'system' }),
  ab({ id: 'entwuerfe', name: 'Entwürfe', art: 'system' }),
  ab({ id: 'geplant', name: 'Geplant', art: 'system' }),
  ab({ id: 'gesendet', name: 'Gesendet', art: 'system' }),
  ab({ id: 'zurueckgestellt', name: 'Zurückgestellt', art: 'system' }),
  ab({ id: 'archiv', name: 'Archiv', art: 'system' }),
  ab({ id: 'junk', name: 'Junk', art: 'system', angeheftet: false }),
  ab({ id: 'papierkorb', name: 'Papierkorb', art: 'system' }),
  ab({ id: 'rechnungen', name: 'Rechnungen', art: 'eigen', farbe: 'sand' }),
  ab({ id: 'versicherung', name: 'Versicherung', art: 'eigen', farbe: 'meer' }),
  ab({ id: 'auto', name: 'Auto', art: 'eigen', eltern: 'versicherung' }),
  ab({ id: 'haus', name: 'Haus', art: 'eigen', eltern: 'versicherung' }),
  ab({ id: 'familie', name: 'Familie', art: 'eigen', farbe: 'koralle' }),
  ab({ id: 'schule', name: 'Schule', art: 'eigen', eltern: 'familie' }),
  ab({ id: 'newsletter', name: 'Newsletter', art: 'eigen' }),
  ab({ id: 'suche-newsletter', name: 'Newsletter', art: 'intelligent', suche: 'abbestellen' }),
  ab({ id: 'suche-rechnungen', name: 'Rechnungen', art: 'intelligent', suche: 'rechnung' }),
  ab({ id: 'suche-pdf', name: 'Mit PDF', art: 'intelligent', suche: 'anhang:pdf' }),
  ab({ id: 'suche-versand', name: 'Versand', art: 'intelligent', suche: 'sendung' }),
]

const laden = () => gemerkt(schluessel, z.array(ordnerStandSchema), () => ausgang, 'Ordner')
// Gemerkt wird erst nach der ersten Änderung; bis dahin entstehen die Beispielmails beim Laden neu (Zeiten relativ zu jetzt).
// Zurückgestellte Mails kommen zu ihrer Zeit von selbst zurück, geplante gehen zu ihrer Zeit hinaus, wie beim echten Server.
// Mails blockierter Absender liegen statt im Posteingang in „Junk“, solange die Adresse blockiert ist.
const mailsLaden = () => {
  const jetzt = new Date()
  const blockiert = new Set(blockiertLaden())
  const mails = abgeschickt(zurueckGekommen(gemerkt(mailSchluessel, z.array(mailSchema), () => beispielMails(jetzt), 'Mails'), jetzt), jetzt)
  return mails.map((m) => (m.ordner === 'eingang' && blockiert.has(m.adresse) ? { ...m, ordner: 'junk' } : m))
}
const kategorienLaden = () => gemerkt(kategorienSchluessel, z.array(kategorieSchema), () => beispielKategorien, 'Kategorien')
const kontenLaden = () => gemerkt(kontenSchluessel, z.array(kontoSchema), () => beispielKonten, 'Konten')
const abwesenheitLaden = () => gemerkt(abwesenheitSchluessel, abwesenheitSchema, () => ({ an: false, text: 'Ich bin bis auf Weiteres nicht erreichbar und antworte nach meiner Rückkehr.' }), 'Abwesenheit')
function blockiertLaden() {
  return gemerkt(blockiertSchluessel, blockiertSchema, () => ['spam@gewinn-sofort.example'], 'Blockierte')
}
const mailsMerken = (l: readonly Mail[]) => localStorage.setItem(mailSchluessel, JSON.stringify(l))
// Inhalt geschriebener Mails (Entwürfe); alle anderen entstehen aus der Beispielmail.
const inhalteLaden = () => gemerkt(inhaltSchluessel, z.record(z.string(), mailInhaltSchema), () => ({}), 'Inhalte')
const inhaltVon = (m: Mail): MailInhalt => inhalteLaden()[m.id] ?? beispielInhalt(m)

/** Ersetzt eine Mail (gleiche id) oder stellt sie an den Anfang und merkt die Liste. */
function mailMerken(neu: Mail): Mail {
  const mails = mailsLaden()
  mailsMerken(mails.some((m) => m.id === neu.id) ? mails.map((m) => (m.id === neu.id ? neu : m)) : [neu, ...mails])
  return neu
}
const mitZahlen = (liste: readonly OrdnerStand[]): Ordner[] => {
  const mails = mailsLaden()
  return liste.map((x) => ({ ...x, zahl: ordnerZahl(mails, x), ...(x.id === 'braucht-dich' ? { wichtig: true as const } : {}) }))
}

// Zwei Beispielregeln wie in der Vorlage.
const beispielRegeln: Regel[] = [
  { id: 'regel-rechnungen', name: 'Rechnungen sammeln', an: true, bedingung: { or: [{ in: ['rechnung', { var: 'betreff' }] }, { in: ['abschlag', { var: 'betreff' }] }] }, aktionen: [{ art: 'verschieben', ordner: 'rechnungen' }, { art: 'kategorie', name: 'Rechnung' }] },
  { id: 'regel-newsletter', name: 'Newsletter später', an: false, bedingung: { and: [{ in: ['newsletter', { var: 'text' }] }] }, aktionen: [{ art: 'verschieben', ordner: 'newsletter' }, { art: 'gelesen' }] },
]
const regelnLaden = () => gemerkt(regelSchluessel, z.array(regelSchema), () => beispielRegeln, 'Regeln')

/** Wie der echte Server: jede id einmal, jedes Ziel ein Ordner, in dem Mails liegen können. */
function regelnFehler(liste: readonly Regel[], ordner: readonly OrdnerStand[]): string | undefined {
  if (new Set(liste.map((r) => r.id)).size !== liste.length) return 'Regel doppelt'
  for (const r of liste)
    for (const a of r.aktionen) if (a.art === 'verschieben' && !ordner.some((o) => o.id === a.ordner && echterOrdner(o))) return `Regel „${r.name}“: in „${a.ordner}“ kann keine Mail liegen`
  return undefined
}

const systemIds = (liste: readonly OrdnerStand[]) => liste.filter((x) => x.art === 'system').map((x) => x.id).sort().join(',')

export const postfachAntworten = [
  http.get('/api/postfach/ordner', () => HttpResponse.json(mitZahlen(laden()))),
  http.put('/api/postfach/ordner', async ({ request }) => {
    const neu = await anfrageInhalt(request, z.array(ordnerStandSchema))
    if (neu instanceof HttpResponse) return neu
    // Wie der echte Server: Systemordner bleiben dieselben, der Stand muss stimmig sein.
    if (systemIds(neu) !== systemIds(ausgang)) return abgelehnt('Systemordner lassen sich nicht anlegen oder löschen')
    const fehler = ordnerFehler(neu)
    if (fehler) return abgelehnt(fehler)
    localStorage.setItem(schluessel, JSON.stringify(neu))
    return HttpResponse.json(mitZahlen(neu))
  }),
  http.get('/api/postfach/mails', ({ request }) => {
    const id = new URL(request.url).searchParams.get('ordner')
    const ordner = laden().find((x) => x.id === id)
    if (!ordner) return abgelehnt(`Ordner unbekannt: ${id}`)
    return HttpResponse.json(mailsLaden().filter((m) => inOrdner(m, ordner)))
  }),
  http.patch('/api/postfach/mails', async ({ request }) => {
    const liste = await anfrageInhalt(request, z.array(mailAenderungSchema).min(1))
    if (liste instanceof HttpResponse) return liste
    const mails = mailsLaden()
    const ordner = laden()
    const fehlt = liste.find((a) => !mails.some((m: Mail) => m.id === a.id))
    if (fehlt) return abgelehnt(`Mail unbekannt: ${fehlt.id}`)
    const ziel = liste.find((a) => a.ordner !== undefined && !ordner.some((o) => o.id === a.ordner && echterOrdner(o)))
    if (ziel) return abgelehnt(`In „${ziel.ordner}“ kann keine Mail liegen`)
    const neu = mailsAendern(mails, liste)
    mailsMerken(neu)
    const ids = new Set(liste.map((a) => a.id))
    return HttpResponse.json(neu.filter((m) => ids.has(m.id)))
  }),
  http.get('/api/postfach/mails/:id/inhalt', ({ params }) => {
    const m = mailsLaden().find((x) => x.id === params.id)
    return m ? HttpResponse.json(inhaltVon(m)) : abgelehnt(`Mail unbekannt: ${String(params.id)}`)
  }),
  http.get('/api/postfach/konten', () => HttpResponse.json(kontenLaden())),
  http.put('/api/postfach/konten/:konto/signatur', async ({ params, request }) => {
    const neu = await anfrageInhalt(request, z.object({ signatur: z.string() }))
    if (neu instanceof HttpResponse) return neu
    const konten = kontenLaden()
    const k = konten.find((x) => x.adresse === params.konto)
    if (!k) return abgelehnt(`Konto unbekannt: ${String(params.konto)}`)
    localStorage.setItem(kontenSchluessel, JSON.stringify(konten.map((x) => (x === k ? { ...k, signatur: neu.signatur } : x))))
    return HttpResponse.json({ ...k, signatur: neu.signatur })
  }),
  http.put('/api/postfach/entwuerfe/:id', async ({ params, request }) => {
    const id = String(params.id)
    const e = await anfrageInhalt(request, entwurfSchema)
    if (e instanceof HttpResponse) return e
    const alt = mailsLaden().find((m) => m.id === id)
    if (alt && alt.ordner !== 'entwuerfe') return abgelehnt(`„${alt.betreff}“ ist kein Entwurf mehr`)
    if (!kontenLaden().some((k) => k.adresse === e.konto)) return abgelehnt(`Konto unbekannt: ${e.konto}`)
    localStorage.setItem(inhaltSchluessel, JSON.stringify({ ...inhalteLaden(), [id]: { id, an: e.an, cc: e.cc, text: e.text } }))
    return HttpResponse.json(mailMerken(entwurfAlsMail(id, e, new Date())))
  }),
  http.put('/api/postfach/mails/:id/senden', async ({ params, request }) => {
    const wann = await anfrageInhalt(request, z.object({ am: z.iso.datetime({ offset: true }).nullable() }))
    if (wann instanceof HttpResponse) return wann
    const m = mailsLaden().find((x) => x.id === params.id)
    if (!m || m.ordner !== 'entwuerfe') return abgelehnt(`Kein Entwurf: ${String(params.id)}`)
    const i = inhaltVon(m)
    const fehler = sendeFehler({ konto: m.konto, an: i.an, cc: i.cc, betreff: m.betreff, text: i.text, wichtig: m.wichtig })
    if (fehler) return abgelehnt(fehler)
    const am = wann.am ?? new Date(Date.now() + RUECKHOL_MS).toISOString()
    return HttpResponse.json(mailMerken({ ...m, ordner: 'geplant', sendenAm: am }))
  }),
  http.put('/api/postfach/mails/:id/zurueckholen', ({ params }) => {
    const m = mailsLaden().find((x) => x.id === params.id)
    if (!m || m.ordner !== 'geplant') return abgelehnt('Schon verschickt')
    const { sendenAm: _weg, ...rest } = m
    return HttpResponse.json(mailMerken({ ...rest, ordner: 'entwuerfe' }))
  }),
  http.get('/api/postfach/regeln', () => HttpResponse.json(regelnLaden())),
  http.put('/api/postfach/regeln', async ({ request }) => {
    const neu = await anfrageInhalt(request, z.array(regelSchema))
    if (neu instanceof HttpResponse) return neu
    const fehler = regelnFehler(neu, laden())
    if (fehler) return abgelehnt(fehler)
    localStorage.setItem(regelSchluessel, JSON.stringify(neu))
    return HttpResponse.json(neu)
  }),
  http.get('/api/postfach/kategorien', () => HttpResponse.json(kategorienLaden())),
  http.put('/api/postfach/kategorien', async ({ request }) => {
    const neu = await anfrageInhalt(request, z.array(kategorieSchema))
    if (neu instanceof HttpResponse) return neu
    if (new Set(neu.map((k) => k.name.toLowerCase())).size !== neu.length) return abgelehnt('Kategorie doppelt')
    localStorage.setItem(kategorienSchluessel, JSON.stringify(neu))
    return HttpResponse.json(neu)
  }),
  http.get('/api/postfach/abwesenheit', () => HttpResponse.json(abwesenheitLaden())),
  http.put('/api/postfach/abwesenheit', async ({ request }) => {
    const neu = await anfrageInhalt(request, abwesenheitSchema)
    if (neu instanceof HttpResponse) return neu
    if (neu.konto && !kontenLaden().some((k) => k.adresse === neu.konto)) return abgelehnt(`Konto unbekannt: ${neu.konto}`)
    localStorage.setItem(abwesenheitSchluessel, JSON.stringify(neu))
    return HttpResponse.json(neu)
  }),
  http.get('/api/postfach/blockiert', () => HttpResponse.json(blockiertLaden())),
  http.put('/api/postfach/blockiert', async ({ request }) => {
    const neu = await anfrageInhalt(request, blockiertSchema)
    if (neu instanceof HttpResponse) return neu
    localStorage.setItem(blockiertSchluessel, JSON.stringify([...new Set(neu)]))
    return HttpResponse.json([...new Set(neu)])
  }),
]
