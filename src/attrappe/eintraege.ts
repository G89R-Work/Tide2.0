import { http, HttpResponse } from 'msw'
import { eintragAendern } from '../logik/eintraege'
import { aenderungSchema, eintraegeSchema, neuerEintragSchema, type Eintrag } from '../vertrag/eintrag'
import { beispielEintraege } from './beispiele'
import { abgelehnt, anfrageInhalt, gemerkt } from './pruefen'

// Die Attrappe merkt sich Änderungen im Browser, damit sie das Neuladen überstehen.
const schluessel = 'tide.attrappe.eintraege'

/** Alle gemerkten Einträge (auch selbst angelegte Termine, die `/api/termine` mitliefert). */
export const laden = () => gemerkt(schluessel, eintraegeSchema, beispielEintraege, 'Einträge')

const merken = (l: readonly Eintrag[]) => localStorage.setItem(schluessel, JSON.stringify(l))

export const eintraegeAntworten = [
  http.get('/api/eintraege', () => HttpResponse.json(laden())),
  http.post('/api/eintraege', async ({ request }) => {
    const neu = await anfrageInhalt(request, neuerEintragSchema)
    if (neu instanceof HttpResponse) return neu
    const liste = laden()
    if (liste.some((e) => e.id === neu.id)) return abgelehnt(`Eintrag ${neu.id} gibt es schon`)
    const jetzt = new Date().toISOString()
    const eintrag: Eintrag = { ...neu, erledigt: false, erstellt: jetzt, geaendert: jetzt }
    merken([...liste, eintrag])
    return HttpResponse.json(eintrag)
  }),
  http.delete('/api/eintraege/:id', ({ params }) => {
    const liste = laden()
    const eintrag = liste.find((e) => e.id === params.id)
    if (!eintrag) return new HttpResponse(`Eintrag ${String(params.id)} gibt es nicht`, { status: 404 })
    merken(liste.filter((e) => e !== eintrag))
    return HttpResponse.json(eintrag)
  }),
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
    merken(liste)
    return HttpResponse.json(eintrag)
  }),
]
