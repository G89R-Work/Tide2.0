import { addDays, set, startOfDay, subDays } from 'date-fns'
import { http, HttpResponse } from 'msw'
import { eintragAendern } from '../logik/eintraege'
import { termineImZeitraum } from '../logik/gezeiten'
import { z } from 'zod'
import { aenderungSchema, eintragSchema, type Eintrag } from '../vertrag/eintrag'
import { laden as eintraegeLaden } from './eintraege'
import { abgelehnt, anfrageInhalt, anfrageZeitraum, gemerkt } from './pruefen'

// Beispieltag für die Gezeitenkurve: liegt immer auf dem Tag der Anfrage. Die Schicht kommt an vier Werktagen,
// am Wochenende bleiben nur Mittag und Sport (damit die Wochenleiste auf Heute verschiedene Füllstände zeigt).
// Geänderte Termine (verschoben, umbenannt) merkt die Attrappe einzeln im Browser und legt sie über den Beispieltag.
type Wann = 'werktags' | 'schicht' | 'immer'
const tag: [titel: string, von: string, bis: string, wann: Wann][] = [
  ['Kita bringen', '07:45', '08:15', 'werktags'],
  ['Planungsrunde', '09:30', '11:00', 'werktags'],
  ['Mittag mit Jana', '12:30', '13:15', 'immer'],
  ['Spätschicht Praxis', '13:30', '18:00', 'schicht'],
  ['Kundentermin', '14:00', '15:00', 'werktags'],
  ['Zahnarzt', '16:15', '16:45', 'werktags'],
  ['Sport', '19:00', '20:30', 'immer'],
]

/** Montag bis Freitag; die Schicht nicht am Dienstag. */
function kommt(wann: Wann, wochentag: number): boolean {
  if (wann === 'immer') return true
  const werktag = wochentag >= 1 && wochentag <= 5
  return wann === 'werktags' ? werktag : werktag && wochentag !== 2
}

const schluessel = 'tide.attrappe.termine'
const geaendertSchema = z.record(z.string(), eintragSchema)
type Geaendert = z.infer<typeof geaendertSchema>
const geaendert = () => gemerkt(schluessel, geaendertSchema, () => ({}), 'Termine')
// Gelöschte Termine des Beispieltags (ids); Neu-Anlegen mit derselben id holt sie zurück (Rückgängig).
const wegSchluessel = 'tide.attrappe.termine-weg'
const weg = () => new Set(gemerkt(wegSchluessel, z.array(z.string()), () => [], 'gelöschte Termine'))
const wegMerken = (s: ReadonlySet<string>) => localStorage.setItem(wegSchluessel, JSON.stringify([...s]))
const beispielId = /^t-(.+)-\d+$/

function beispieleUm(datum: Date, ueber: Geaendert): Eintrag[] {
  const zeit = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number)
    return set(datum, { hours: h, minutes: m, seconds: 0, milliseconds: 0 }).toISOString()
  }
  const t = zeit('00:00')
  return tag.flatMap(([titel, von, bis, wann], i): Eintrag[] => {
    if (!kommt(wann, datum.getDay())) return []
    const id = `t-${datum.toDateString()}-${i}`
    return [ueber[id] ?? { id, art: wann === 'schicht' ? 'schicht' : 'termin', titel, erledigt: false, erstellt: t, geaendert: t, beginn: zeit(von), ende: zeit(bis) }]
  })
}

/** Der Beispieltag rund um den Zeitraum, mit den gemerkten Änderungen. */
function tageUm(von: Date, bis: Date): Eintrag[] {
  const ueber = geaendert()
  const ohne = weg()
  const tage: Eintrag[] = []
  for (let d = startOfDay(subDays(von, 1)); d <= bis; d = addDays(d, 1)) {
    tage.push(...beispieleUm(d, ueber).filter((e) => !ohne.has(e.id)))
  }
  return tage
}

export const termineAntworten = [
  http.get('/api/termine', ({ request }) => {
    const zeitraum = anfrageZeitraum(request)
    if (zeitraum instanceof HttpResponse) return zeitraum
    const { von, bis } = zeitraum
    return HttpResponse.json(termineImZeitraum([...tageUm(von, bis), ...eintraegeLaden()], von, bis))
  }),
  // Termine des Beispieltags (id „t-…") ändert diese Antwort; alle anderen gehen weiter an src/attrappe/eintraege.ts.
  http.patch('/api/eintraege/:id', async ({ params, request }) => {
    const id = String(params.id)
    const treffer = beispielId.exec(id)
    if (!treffer) return undefined
    const datum = new Date(treffer[1])
    if (Number.isNaN(datum.getTime())) return new HttpResponse(`Termin ${id} gibt es nicht`, { status: 404 })
    const aenderung = await anfrageInhalt(request, aenderungSchema)
    if (aenderung instanceof HttpResponse) return aenderung
    const ueber = geaendert()
    let ergebnis
    try {
      ergebnis = eintragAendern(beispieleUm(datum, ueber), id, aenderung, new Date())
    } catch (f) {
      return abgelehnt(f)
    }
    if (!ergebnis.eintrag) return new HttpResponse(`Termin ${id} gibt es nicht`, { status: 404 })
    localStorage.setItem(schluessel, JSON.stringify({ ...ueber, [id]: ergebnis.eintrag }))
    return HttpResponse.json(ergebnis.eintrag)
  }),
  // Löschen und Wiederanlegen (Rückgängig) eines Termins des Beispieltags; alle anderen gehen weiter an src/attrappe/eintraege.ts.
  http.delete('/api/eintraege/:id', ({ params }) => {
    const id = String(params.id)
    const treffer = beispielId.exec(id)
    if (!treffer) return undefined
    const e = beispieleUm(new Date(treffer[1] ?? ''), geaendert()).find((x) => x.id === id)
    const ohne = weg()
    if (!e || ohne.has(id)) return new HttpResponse(`Termin ${id} gibt es nicht`, { status: 404 })
    wegMerken(ohne.add(id))
    return HttpResponse.json(e)
  }),
  http.post('/api/eintraege', async ({ request }) => {
    const neu = await anfrageInhalt(request.clone(), z.object({ id: z.string() }))
    if (neu instanceof HttpResponse || !beispielId.test(neu.id)) return undefined
    const ohne = weg()
    if (!ohne.delete(neu.id)) return abgelehnt(`Termin ${neu.id} gibt es schon`)
    wegMerken(ohne)
    const e = beispieleUm(new Date(beispielId.exec(neu.id)?.[1] ?? ''), geaendert()).find((x) => x.id === neu.id)
    return e ? HttpResponse.json(e) : new HttpResponse(`Termin ${neu.id} gibt es nicht`, { status: 404 })
  }),
]
