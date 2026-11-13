// Der eine Weg zum Server: jede Antwort wird mit dem Schema ihres Vertrags geprüft.
// Gilt für die Attrappe und den späteren Server gleich.
import { z } from 'zod'
import { de } from 'zod/locales'

z.config(de())

/** Prüft Daten mit einem Schema. Wirft mit Grund und Feld, z. B. „Einträge holen: Antwort ungültig“ und darunter je Fehler Grund und Feld. */
export function pruefe<S extends z.ZodType>(schema: S, daten: unknown, was: string): z.output<S> {
  const ergebnis = schema.safeParse(daten)
  if (!ergebnis.success) throw new Error(`${was} ungültig\n${z.prettifyError(ergebnis.error)}`)
  return ergebnis.data
}

/** Schickt die Anfrage und prüft die Antwort. `daten` geht als JSON mit. */
export async function anfrage<S extends z.ZodType>(
  schema: S,
  was: string,
  adresse: string,
  methode: 'GET' | 'PATCH' | 'PUT' = 'GET',
  daten?: unknown,
): Promise<z.output<S>> {
  const r = await fetch(
    adresse,
    daten === undefined ? { method: methode } : { method: methode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(daten) },
  )
  if (!r.ok) throw new Error(`${was} fehlgeschlagen: ${r.status} ${await r.text()}`)
  return pruefe(schema, await r.json(), `${was}: Antwort`)
}
