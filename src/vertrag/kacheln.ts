// Vertrag: Anordnung der Kacheln je Seite und Geräteart. Gemerkt wird nur, was vom Werkszustand abweicht;
// null heißt „Werkszustand". Geprüft wird beim Lesen in src/logik/kacheln.ts.
import type { Geraet } from '../logik/einstellungen'
import type { Platz } from '../logik/kacheln'

/** `ohneHintergrund`: Kacheln, die ohne Fläche gezeigt werden. Fehlt das Feld, gilt der Werkszustand. */
export type AnordnungDaten = { plaetze: Record<string, Platz>; versteckt: string[]; ohneHintergrund: string[] }

const adresse = (seite: string, geraet: Geraet) => `/api/kacheln/${encodeURIComponent(seite)}/${geraet}`

async function pruefe(r: Response, was: string) {
  if (!r.ok) throw new Error(`${was} fehlgeschlagen: ${r.status} ${await r.text()}`)
}

export async function holeAnordnung(seite: string, geraet: Geraet): Promise<unknown> {
  const r = await fetch(adresse(seite, geraet))
  await pruefe(r, 'Kacheln holen')
  return r.json()
}

export async function speichereAnordnung(seite: string, geraet: Geraet, daten: AnordnungDaten): Promise<void> {
  const r = await fetch(adresse(seite, geraet), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(daten) })
  await pruefe(r, 'Kacheln speichern')
}

/** Zurück auf den Werkszustand. */
export async function loescheAnordnung(seite: string, geraet: Geraet): Promise<void> {
  await pruefe(await fetch(adresse(seite, geraet), { method: 'DELETE' }), 'Kacheln zurücksetzen')
}
