import { http, HttpResponse } from 'msw'
import type { WetterStunde } from '../vertrag/wetter'

// Erfundenes Novemberwetter: nachts 3 Grad, am frühen Nachmittag 9 Grad, Schauer am späten Nachmittag.
function stunde(zeit: Date): WetterStunde {
  const h = zeit.getHours()
  const grad = Math.round(6 - 3 * Math.cos(((h - 3) / 24) * 2 * Math.PI))
  const regen = h >= 16 && h <= 18 ? [0.4, 1.2, 0.3][h - 16] : 0
  return { zeit: zeit.toISOString(), grad, regen }
}

export const wetterAntworten = [
  http.get('/api/wetter', ({ request }) => {
    const q = new URL(request.url).searchParams
    const von = new Date(q.get('von') ?? '')
    const bis = new Date(q.get('bis') ?? '')
    if (Number.isNaN(von.getTime()) || Number.isNaN(bis.getTime()) || bis <= von) {
      return new HttpResponse(`Zeitraum ungültig: von=${q.get('von')} bis=${q.get('bis')}`, { status: 400 })
    }
    const liste: WetterStunde[] = []
    const d = new Date(von)
    d.setMinutes(0, 0, 0)
    for (; d < bis; d.setHours(d.getHours() + 1)) if (d >= von) liste.push(stunde(new Date(d)))
    return HttpResponse.json(liste)
  }),
]
