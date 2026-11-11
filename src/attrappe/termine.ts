import { http, HttpResponse } from 'msw'
import { termineImZeitraum } from '../logik/gezeiten'
import type { Eintrag } from '../vertrag/eintrag'

// Beispieltag für die Gezeitenkurve: liegt immer auf dem Tag der Anfrage (gestern, heute, morgen gleich).
const tag: [titel: string, von: string, bis: string][] = [
  ['Kita bringen', '07:45', '08:15'],
  ['Planungsrunde', '09:30', '11:00'],
  ['Mittag mit Jana', '12:30', '13:15'],
  ['Kundentermin', '14:00', '15:30'],
  ['Zahnarzt', '16:15', '16:45'],
  ['Sport', '19:00', '20:30'],
]

function beispieleUm(datum: Date): Eintrag[] {
  const zeit = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number)
    return new Date(datum.getFullYear(), datum.getMonth(), datum.getDate(), h, m).toISOString()
  }
  const t = zeit('00:00')
  return tag.map(([titel, von, bis], i) => ({
    id: `t-${datum.toDateString()}-${i}`, art: 'termin', titel, erledigt: false, erstellt: t, geaendert: t, beginn: zeit(von), ende: zeit(bis),
  }))
}

export const termineAntworten = [
  http.get('/api/termine', ({ request }) => {
    const q = new URL(request.url).searchParams
    const von = new Date(q.get('von') ?? '')
    const bis = new Date(q.get('bis') ?? '')
    if (Number.isNaN(von.getTime()) || Number.isNaN(bis.getTime()) || bis <= von) {
      return new HttpResponse(`Zeitraum ungültig: von=${q.get('von')} bis=${q.get('bis')}`, { status: 400 })
    }
    const tage: Eintrag[] = []
    for (let d = new Date(von.getFullYear(), von.getMonth(), von.getDate() - 1); d < bis; d.setDate(d.getDate() + 1)) {
      tage.push(...beispieleUm(d))
    }
    return HttpResponse.json(termineImZeitraum(tage, von, bis))
  }),
]
