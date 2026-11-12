import { http, HttpResponse } from 'msw'
import { eintragAendern } from '../logik/eintraege'
import { termineImZeitraum } from '../logik/gezeiten'
import type { Aenderung, Eintrag } from '../vertrag/eintrag'

// Beispieltag für die Gezeitenkurve: liegt immer auf dem Tag der Anfrage (gestern, heute, morgen gleich).
// Geänderte Termine (verschoben, umbenannt) merkt die Attrappe einzeln im Browser und legt sie über den Beispieltag.
const tag: [titel: string, von: string, bis: string][] = [
  ['Kita bringen', '07:45', '08:15'],
  ['Planungsrunde', '09:30', '11:00'],
  ['Mittag mit Jana', '12:30', '13:15'],
  ['Spätschicht Praxis', '13:30', '18:00'],
  ['Kundentermin', '14:00', '15:00'],
  ['Zahnarzt', '16:15', '16:45'],
  ['Sport', '19:00', '20:30'],
]

const schluessel = 'tide.attrappe.termine'
type Geaendert = Record<string, Eintrag>

function geaendert(): Geaendert {
  const text = localStorage.getItem(schluessel)
  if (!text) return {}
  try {
    return JSON.parse(text) as Geaendert
  } catch (f) {
    console.warn(`Attrappe: gespeicherte Termine unlesbar, nehme den Beispieltag (${String(f)})`)
    return {}
  }
}

function beispieleUm(datum: Date, ueber: Geaendert): Eintrag[] {
  const zeit = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number)
    return new Date(datum.getFullYear(), datum.getMonth(), datum.getDate(), h, m).toISOString()
  }
  const t = zeit('00:00')
  return tag.map(([titel, von, bis], i): Eintrag => {
    const id = `t-${datum.toDateString()}-${i}`
    return ueber[id] ?? { id, art: 'termin', titel, erledigt: false, erstellt: t, geaendert: t, beginn: zeit(von), ende: zeit(bis) }
  })
}

/** Der Beispieltag rund um den Zeitraum, mit den gemerkten Änderungen. */
function tageUm(von: Date, bis: Date): Eintrag[] {
  const ueber = geaendert()
  const tage: Eintrag[] = []
  for (let d = new Date(von.getFullYear(), von.getMonth(), von.getDate() - 1); d <= bis; d.setDate(d.getDate() + 1)) {
    tage.push(...beispieleUm(d, ueber))
  }
  return tage
}

export const termineAntworten = [
  http.get('/api/termine', ({ request }) => {
    const q = new URL(request.url).searchParams
    const von = new Date(q.get('von') ?? '')
    const bis = new Date(q.get('bis') ?? '')
    if (Number.isNaN(von.getTime()) || Number.isNaN(bis.getTime()) || bis <= von) {
      return new HttpResponse(`Zeitraum ungültig: von=${q.get('von')} bis=${q.get('bis')}`, { status: 400 })
    }
    return HttpResponse.json(termineImZeitraum(tageUm(von, bis), von, bis))
  }),
  // Termine des Beispieltags (id „t-…") ändert diese Antwort; alle anderen gehen weiter an src/attrappe/eintraege.ts.
  http.patch('/api/eintraege/:id', async ({ params, request }) => {
    const id = String(params.id)
    const treffer = /^t-(.+)-\d+$/.exec(id)
    if (!treffer) return undefined
    const datum = new Date(treffer[1])
    if (Number.isNaN(datum.getTime())) return new HttpResponse(`Termin ${id} gibt es nicht`, { status: 404 })
    const ueber = geaendert()
    let ergebnis
    try {
      ergebnis = eintragAendern(beispieleUm(datum, ueber), id, (await request.json()) as Aenderung, new Date())
    } catch (f) {
      return new HttpResponse((f as Error).message, { status: 400 })
    }
    if (!ergebnis.eintrag) return new HttpResponse(`Termin ${id} gibt es nicht`, { status: 404 })
    localStorage.setItem(schluessel, JSON.stringify({ ...ueber, [id]: ergebnis.eintrag }))
    return HttpResponse.json(ergebnis.eintrag)
  }),
]
