import { http, HttpResponse } from 'msw'
import type { Ordner } from '../vertrag/postfach'

// Beispielordner wie in der Vorlage (docs/vorlage-aussehen/bilder/postfach-ordner.jpg).
const ordner: Ordner[] = [
  { id: 'eingang', name: 'Posteingang', art: 'system', zahl: 7 },
  { id: 'braucht-dich', name: 'Braucht dich', art: 'system', zahl: 6, wichtig: true },
  { id: 'entwuerfe', name: 'Entwürfe', art: 'system', zahl: 1 },
  { id: 'gesendet', name: 'Gesendet', art: 'system', zahl: 0 },
  { id: 'erinnerung', name: 'Mit Erinnerung', art: 'system', zahl: 0 },
  { id: 'archiv', name: 'Archiv', art: 'system', zahl: 0 },
  { id: 'papierkorb', name: 'Papierkorb', art: 'system', zahl: 0 },
  { id: 'rechnungen', name: 'Rechnungen', art: 'eigen', zahl: 0 },
  { id: 'versicherung', name: 'Versicherung', art: 'eigen', zahl: 0 },
  { id: 'auto', name: 'Auto', art: 'eigen', eltern: 'versicherung', zahl: 0 },
  { id: 'familie', name: 'Familie', art: 'eigen', zahl: 0 },
  { id: 'newsletter', name: 'Newsletter', art: 'eigen', zahl: 0 },
  { id: 'suche-newsletter', name: 'Newsletter', art: 'intelligent', zahl: 2 },
  { id: 'suche-rechnungen', name: 'Rechnungen', art: 'intelligent', zahl: 1 },
  { id: 'suche-pdf', name: 'Mit PDF', art: 'intelligent', zahl: 0 },
  { id: 'suche-versand', name: 'Versand', art: 'intelligent', zahl: 1 },
]

export const postfachAntworten = [http.get('/api/postfach/ordner', () => HttpResponse.json(ordner))]
