import { http, HttpResponse } from 'msw'

// Die Attrappe merkt sich die Anordnungen im Browser: ein Eintrag je „<seite>/<geraet>".
const schluessel = 'tide.attrappe.kacheln'

function laden(): Record<string, unknown> {
  const text = localStorage.getItem(schluessel)
  if (!text) return {}
  try {
    const d: unknown = JSON.parse(text)
    return typeof d === 'object' && d !== null ? (d as Record<string, unknown>) : {}
  } catch (f) {
    console.warn(`Attrappe: gespeicherte Kacheln unlesbar, nehme Werkszustand (${String(f)})`)
    return {}
  }
}

const merken = (alle: Record<string, unknown>) => localStorage.setItem(schluessel, JSON.stringify(alle))
const name = (p: Record<string, string | readonly string[] | undefined>) => `${String(p.seite)}/${String(p.geraet)}`

export const kachelnAntworten = [
  http.get('/api/kacheln/:seite/:geraet', ({ params }) => HttpResponse.json(laden()[name(params)] ?? null)),
  http.put('/api/kacheln/:seite/:geraet', async ({ params, request }) => {
    merken({ ...laden(), [name(params)]: await request.json() })
    return new HttpResponse(null, { status: 204 })
  }),
  http.delete('/api/kacheln/:seite/:geraet', ({ params }) => {
    const { [name(params)]: _, ...rest } = laden()
    merken(rest)
    return new HttpResponse(null, { status: 204 })
  }),
]
