import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import { ordnerFehler } from '../logik/ordner'
import { ordnerStandSchema, type Ordner, type OrdnerStand } from '../vertrag/postfach'
import { abgelehnt, anfrageInhalt, gemerkt } from './pruefen'

// Beispielordner wie in der Vorlage (docs/vorlage-aussehen/bilder/postfach-ordner.jpg), Systemordner wie im Konzept.
// Die Attrappe merkt sich Reihenfolge, Namen, Farben und Anheften im Browser; die Zähler stehen fest, bis es Mails gibt.
const schluessel = 'tide.attrappe.ordner'

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

/** Ungelesenes je Ordner (bei Entwürfen und intelligenten Ordnern alle Treffer); neue Ordner sind leer. */
const zahlen: Record<string, number> = {
  eingang: 7, 'braucht-dich': 6, entwuerfe: 1, junk: 3, rechnungen: 2, auto: 1, haus: 2, schule: 4,
  'suche-newsletter': 2, 'suche-rechnungen': 1, 'suche-versand': 1,
}

const laden = () => gemerkt(schluessel, z.array(ordnerStandSchema), () => ausgang, 'Ordner')
const mitZahlen = (liste: readonly OrdnerStand[]): Ordner[] =>
  liste.map((x) => ({ ...x, zahl: zahlen[x.id] ?? 0, ...(x.id === 'braucht-dich' ? { wichtig: true as const } : {}) }))

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
]
