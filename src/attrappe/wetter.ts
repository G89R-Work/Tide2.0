import { http, HttpResponse } from 'msw'
import type { WetterStunde } from '../vertrag/wetter'
import { anfrageZeitraum } from './pruefen'

// Erfundenes Novemberwetter: nachts 3 Grad, am frühen Nachmittag 9 Grad, Schauer am späten Nachmittag.
function stunde(zeit: Date): WetterStunde {
  const h = zeit.getHours()
  const grad = Math.round(6 - 3 * Math.cos(((h - 3) / 24) * 2 * Math.PI))
  const regen = h >= 16 && h <= 18 ? [0.4, 1.2, 0.3][h - 16] : 0
  // Wahrscheinlichkeit steigt zum Schauer hin und fällt danach wieder ab.
  const regenChance = Math.max(0, Math.min(100, Math.round((90 - Math.abs(h - 17) * 15) / 10) * 10))
  return { zeit: zeit.toISOString(), grad, regen, regenChance }
}

export const wetterAntworten = [
  http.get('/api/wetter', ({ request }) => {
    const zeitraum = anfrageZeitraum(request)
    if (zeitraum instanceof HttpResponse) return zeitraum
    const { von, bis } = zeitraum
    const liste: WetterStunde[] = []
    const d = new Date(von)
    d.setMinutes(0, 0, 0)
    for (; d < bis; d.setHours(d.getHours() + 1)) if (d >= von) liste.push(stunde(new Date(d)))
    return HttpResponse.json(liste)
  }),
]
