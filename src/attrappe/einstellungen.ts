import { http, HttpResponse } from 'msw'
import { werteAendern, werteAenderungSchema, werteAusDaten, werteSchema } from '../logik/einstellungen'
import { anfrageInhalt, gemerkt } from './pruefen'

// Die Attrappe merkt sich die Einstellungen im Browser, damit sie das Neuladen überstehen.
const schluessel = 'tide.attrappe.einstellungen'

const laden = () => gemerkt(schluessel, werteSchema, () => ({}), 'Einstellungen')

export const einstellungenAntworten = [
  http.get('/api/einstellungen', () => HttpResponse.json(laden())),
  http.patch('/api/einstellungen', async ({ request }) => {
    const aenderung = await anfrageInhalt(request, werteAenderungSchema)
    if (aenderung instanceof HttpResponse) return aenderung
    // Nur Gültiges übernehmen, wie es der echte Server auch täte.
    const neu = werteAusDaten(werteAendern(laden(), aenderung))
    localStorage.setItem(schluessel, JSON.stringify(neu))
    return HttpResponse.json(neu)
  }),
]
