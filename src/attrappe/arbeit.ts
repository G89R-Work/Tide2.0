import { http, HttpResponse } from 'msw'
import { rhythmusSchema, type Rhythmus } from '../vertrag/arbeit'
import { anfrageInhalt, gemerkt } from './pruefen'

// Schichtplan des Beispiels: Spätschicht an vier Werktagen (nicht dienstags), dazu eine Frühschicht und ihr Muster zum Ausprobieren.
const schluessel = 'tide.attrappe.rhythmus'
const beispiel: Rhythmus = {
  arten: [
    { id: 'spaet', name: 'Spätschicht', beginn: '13:30', ende: '18:00', farbe: 'glut', pause: 0 },
    { id: 'frueh', name: 'Frühschicht', beginn: '07:00', ende: '15:30', farbe: 'meer', pause: 30 },
  ],
  muster: [
    { id: 'spaetwoche', name: 'Spätwoche', tage: ['spaet', null, 'spaet', 'spaet', 'spaet', null, null] },
    { id: 'fruehwoche', name: 'Frühwoche', tage: ['frueh', 'frueh', 'frueh', 'frueh', 'frueh', null, null] },
  ],
  abfolge: [{ muster: 'spaetwoche', wochen: 1 }],
  start: '2026-01-05',
  ausnahmen: [],
}

/** Der gemerkte Schichtplan (auch für die Schichten unter /api/termine). */
export const rhythmusLaden = () => gemerkt(schluessel, rhythmusSchema, () => beispiel, 'Schichtplan')

export const arbeitAntworten = [
  http.get('/api/arbeit/rhythmus', () => HttpResponse.json(rhythmusLaden())),
  http.put('/api/arbeit/rhythmus', async ({ request }) => {
    const neu = await anfrageInhalt(request, rhythmusSchema)
    if (neu instanceof HttpResponse) return neu
    localStorage.setItem(schluessel, JSON.stringify(neu))
    return HttpResponse.json(neu)
  }),
]
