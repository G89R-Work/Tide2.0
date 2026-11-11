// Vertrag: Einstellungen des angemeldeten Nutzers. Der Server merkt nur Abweichungen vom Standard;
// was je Geräteart gilt, steht unter „<id>@pc" bzw. „<id>@handy" (siehe src/logik/einstellungen.ts).
import { werteAusDaten, type Werte, type WerteAenderung } from '../logik/einstellungen'

const adresse = '/api/einstellungen'

async function antwort(lauf: Promise<Response>, was: string): Promise<Werte> {
  const r = await lauf
  if (!r.ok) throw new Error(`${was} fehlgeschlagen: ${r.status} ${await r.text()}`)
  return werteAusDaten(await r.json())
}

export function holeEinstellungen(): Promise<Werte> {
  return antwort(fetch(adresse), 'Einstellungen holen')
}

/** Ändert einzelne Werte; null heißt „zurück auf Standard". Antwort: der ganze neue Stand. */
export function aendereEinstellungen(aenderung: WerteAenderung): Promise<Werte> {
  return antwort(
    fetch(adresse, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(aenderung) }),
    'Einstellungen speichern',
  )
}
