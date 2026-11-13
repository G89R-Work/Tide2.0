import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import { echterOrdner, inOrdner, mailsAendern, ordnerZahl, zurueckGekommen } from '../logik/mails'
import { ordnerFehler } from '../logik/ordner'
import { mailAenderungSchema, mailSchema, ordnerStandSchema, type Mail, type Ordner, type OrdnerStand } from '../vertrag/postfach'
import { beispielInhalt, beispielKategorien, beispielMails } from './mails'
import { abgelehnt, anfrageInhalt, gemerkt } from './pruefen'

// Beispielordner wie in der Vorlage (docs/vorlage-aussehen/bilder/postfach-ordner.jpg), Systemordner wie im Konzept.
// Die Attrappe merkt sich Reihenfolge, Namen, Farben und Anheften im Browser; die Zähler rechnet sie aus den Mails.
const schluessel = 'tide.attrappe.ordner'
const mailSchluessel = 'tide.attrappe.mails'

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
// Zurückgestellte Mails kommen zu ihrer Zeit von selbst zurück, wie beim echten Server.
const mailsLaden = () => zurueckGekommen(gemerkt(mailSchluessel, z.array(mailSchema), () => beispielMails(new Date()), 'Mails'), new Date())
const mitZahlen = (liste: readonly OrdnerStand[]): Ordner[] => {
  const mails = mailsLaden()
  return liste.map((x) => ({ ...x, zahl: ordnerZahl(mails, x), ...(x.id === 'braucht-dich' ? { wichtig: true as const } : {}) }))
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
    localStorage.setItem(mailSchluessel, JSON.stringify(neu))
    const ids = new Set(liste.map((a) => a.id))
    return HttpResponse.json(neu.filter((m) => ids.has(m.id)))
  }),
  http.get('/api/postfach/mails/:id/inhalt', ({ params }) => {
    const m = mailsLaden().find((x) => x.id === params.id)
    return m ? HttpResponse.json(beispielInhalt(m)) : abgelehnt(`Mail unbekannt: ${String(params.id)}`)
  }),
  http.get('/api/postfach/kategorien', () => HttpResponse.json(beispielKategorien)),
]
