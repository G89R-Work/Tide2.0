import { http, HttpResponse } from 'msw'
import { eintragAendern } from '../logik/eintraege'
import { aenderungSchema, eintraegeSchema } from '../vertrag/eintrag'
import { beispielEintraege } from './beispiele'
import { abgelehnt, anfrageInhalt, gemerkt } from './pruefen'

// Die Attrappe merkt sich Änderungen im Browser, damit sie das Neuladen überstehen.
const schluessel = 'tide.attrappe.eintraege'

const laden = () => gemerkt(schluessel, eintraegeSchema, beispielEintraege, 'Einträge')

export const eintraegeAntworten = [
  http.get('/api/eintraege', () => HttpResponse.json(laden())),
  http.patch('/api/eintraege/:id', async ({ params, request }) => {
    const aenderung = await anfrageInhalt(request, aenderungSchema)
    if (aenderung instanceof HttpResponse) return aenderung
    let ergebnis
    try {
      ergebnis = eintragAendern(laden(), String(params.id), aenderung, new Date())
    } catch (f) {
      return abgelehnt(f)
    }
    const { liste, eintrag } = ergebnis
    if (!eintrag) return new HttpResponse(`Eintrag ${String(params.id)} gibt es nicht`, { status: 404 })
    localStorage.setItem(schluessel, JSON.stringify(liste))
    return HttpResponse.json(eintrag)
  }),
]
