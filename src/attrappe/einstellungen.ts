import { http, HttpResponse } from 'msw'
import { werteAendern, werteAusDaten, type Werte, type WerteAenderung } from '../logik/einstellungen'

// Die Attrappe merkt sich die Einstellungen im Browser, damit sie das Neuladen überstehen.
const schluessel = 'tide.attrappe.einstellungen'

function laden(): Werte {
  const text = localStorage.getItem(schluessel)
  if (!text) return {}
  try {
    return werteAusDaten(JSON.parse(text))
  } catch (f) {
    console.warn(`Attrappe: gespeicherte Einstellungen unlesbar, nehme Standard (${String(f)})`)
    return {}
  }
}

export const einstellungenAntworten = [
  http.get('/api/einstellungen', () => HttpResponse.json(laden())),
  http.patch('/api/einstellungen', async ({ request }) => {
    const aenderung = (await request.json()) as WerteAenderung
    // Nur Gültiges übernehmen, wie es der echte Server auch täte.
    const neu = werteAusDaten(werteAendern(laden(), aenderung))
    localStorage.setItem(schluessel, JSON.stringify(neu))
    return HttpResponse.json(neu)
  }),
]
