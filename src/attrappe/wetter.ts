import { addDays, differenceInCalendarDays, eachDayOfInterval, eachHourOfInterval, startOfDay } from 'date-fns'
import { http, HttpResponse } from 'msw'
import { tagSchluessel } from '../logik/zeit'
import type { WetterStunde, WetterTag } from '../vertrag/wetter'
import { anfrageZeitraum } from './pruefen'

// Erfundenes Novemberwetter: nachts 3 Grad, am frühen Nachmittag 9 Grad, Schauer am späten Nachmittag.
// Jeder Tag liegt etwas anders (`lage`), damit die Vorschau nicht sieben gleiche Tage zeigt.
const lage = (tag: Date) => Math.round(2.5 * Math.sin(differenceInCalendarDays(tag, new Date(2026, 0, 1)) * 1.3))
const rund = (x: number) => Math.round(x * 10) / 10

function stunde(zeit: Date): WetterStunde {
  const h = zeit.getHours()
  const grad = Math.round(6 + lage(zeit) - 3 * Math.cos(((h - 3) / 24) * 2 * Math.PI))
  const regen = h >= 16 && h <= 18 ? [0.4, 1.2, 0.3][h - 16] : 0
  // Wahrscheinlichkeit steigt zum Schauer hin und fällt danach wieder ab.
  const regenChance = Math.max(0, Math.min(100, Math.round((90 - Math.abs(h - 17) * 15) / 10) * 10))
  const wind = Math.round(12 + 8 * Math.sin(((h - 6) / 24) * 2 * Math.PI))
  return {
    zeit: zeit.toISOString(),
    grad,
    gefuehlt: grad - Math.round(wind / 8),
    regen,
    regenChance,
    wind,
    boeen: Math.round(wind * 1.7),
    feuchte: Math.round(85 - 15 * Math.sin(((h - 9) / 24) * 2 * Math.PI)),
    uv: h >= 10 && h <= 14 ? 1 : 0,
    druck: 1012 - lage(zeit),
    // Drei Quellen, der Server meldet ihren mittleren Wert als `grad`.
    quellen: [
      { name: 'DWD', grad },
      { name: 'Open-Meteo', grad: rund(grad - 0.6) },
      { name: 'MET Norway', grad: rund(grad + 0.8) },
    ],
  }
}

function tag(d: Date): WetterTag {
  const stunden = eachHourOfInterval({ start: d, end: addDays(d, 1) }).slice(0, 24).map(stunde)
  const grade = stunden.map((s) => s.grad)
  const tief = Math.min(...grade)
  const hoch = Math.max(...grade)
  return {
    tag: tagSchluessel(d),
    tief,
    hoch,
    regen: rund(stunden.reduce((summe, s) => summe + s.regen, 0)),
    regenChance: Math.max(...stunden.map((s) => s.regenChance)),
    vorjahr: { tief: tief + 2, hoch: hoch + 1 },
    mittel: { tief: 3, hoch: 8 },
  }
}

export const wetterAntworten = [
  http.get('/api/wetter/tage', ({ request }) => {
    const zeitraum = anfrageZeitraum(request)
    if (zeitraum instanceof HttpResponse) return zeitraum
    const tage = eachDayOfInterval({ start: startOfDay(zeitraum.von), end: zeitraum.bis }).filter((d) => d < zeitraum.bis)
    return HttpResponse.json(tage.map(tag))
  }),
  http.get('/api/wetter', ({ request }) => {
    const zeitraum = anfrageZeitraum(request)
    if (zeitraum instanceof HttpResponse) return zeitraum
    const { von, bis } = zeitraum
    const stunden = eachHourOfInterval({ start: von, end: bis }).filter((d) => d >= von && d < bis)
    return HttpResponse.json(stunden.map(stunde))
  }),
]
