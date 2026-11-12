import { http, HttpResponse } from 'msw'
import { eintragAendern } from '../logik/eintraege'
import type { Aenderung, Eintrag } from '../vertrag/eintrag'
import { beispielEintraege } from './beispiele'

// Die Attrappe merkt sich Änderungen im Browser, damit sie das Neuladen überstehen.
const schluessel = 'tide.attrappe.eintraege'

function laden(): Eintrag[] {
  const text = localStorage.getItem(schluessel)
  if (!text) return beispielEintraege
  try {
    return JSON.parse(text) as Eintrag[]
  } catch (f) {
    console.warn(`Attrappe: gespeicherte Einträge unlesbar, nehme Beispieldaten (${String(f)})`)
    return beispielEintraege
  }
}

export const eintraegeAntworten = [
  http.get('/api/eintraege', () => HttpResponse.json(laden())),
  http.patch('/api/eintraege/:id', async ({ params, request }) => {
    const aenderung = (await request.json()) as Aenderung
    let ergebnis
    try {
      ergebnis = eintragAendern(laden(), String(params.id), aenderung, new Date())
    } catch (f) {
      return new HttpResponse((f as Error).message, { status: 400 })
    }
    const { liste, eintrag } = ergebnis
    if (!eintrag) return new HttpResponse(`Eintrag ${String(params.id)} gibt es nicht`, { status: 404 })
    localStorage.setItem(schluessel, JSON.stringify(liste))
    return HttpResponse.json(eintrag)
  }),
]
