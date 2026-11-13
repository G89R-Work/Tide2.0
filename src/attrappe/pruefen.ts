import { HttpResponse } from 'msw'
import type { z } from 'zod'
import { pruefe } from '../vertrag/anfrage'

// Die Attrappe prüft Anfragen und Gemerktes mit denselben Schemas wie die Oberfläche die Antworten.

/** Gemerktes aus dem Browser lesen. Fehlt es, gilt `ersatz`; ist es unlesbar, auch, mit Warnung samt Grund. */
export function gemerkt<S extends z.ZodType>(schluessel: string, schema: S, ersatz: () => z.output<S>, was: string): z.output<S> {
  const text = localStorage.getItem(schluessel)
  if (!text) return ersatz()
  try {
    return pruefe(schema, JSON.parse(text), `Attrappe: gemerkte ${was}`)
  } catch (f) {
    console.warn(`${String(f)}\nnehme stattdessen den Ausgangsstand`)
    return ersatz()
  }
}

/** Inhalt einer Anfrage prüfen: die Daten, oder eine Antwort 400 mit Grund. */
export async function anfrageInhalt<S extends z.ZodType>(request: Request, schema: S): Promise<z.output<S> | HttpResponse<string>> {
  try {
    return pruefe(schema, await request.json(), 'Anfrage')
  } catch (f) {
    return abgelehnt(f)
  }
}

/** Antwort 400 mit dem Grund des Fehlers. */
export const abgelehnt = (f: unknown) => new HttpResponse<string>(f instanceof Error ? f.message : String(f), { status: 400 })

/** Zeitraum `von`/`bis` aus der Adresse prüfen: beide Zeitpunkte, oder eine Antwort 400 mit Grund. */
export function anfrageZeitraum(request: Request): { von: Date; bis: Date } | HttpResponse<string> {
  const q = new URL(request.url).searchParams
  const von = new Date(q.get('von') ?? '')
  const bis = new Date(q.get('bis') ?? '')
  if (Number.isNaN(von.getTime()) || Number.isNaN(bis.getTime()) || bis <= von) {
    return abgelehnt(`Zeitraum ungültig: von=${q.get('von')} bis=${q.get('bis')}`)
  }
  return { von, bis }
}
