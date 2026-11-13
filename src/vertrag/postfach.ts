// Vertrag: Ordner des Postfachs für die zweite Ebene. Gilt für Attrappe und späteren Server.

export type OrdnerArt = 'system' | 'eigen' | 'intelligent'

export type Ordner = {
  id: string
  name: string
  art: OrdnerArt
  /** Übergeordneter eigener Ordner (nur bei `eigen`) */
  eltern?: string
  /** Zahl rechts: Ungelesenes, bei Entwürfen und intelligenten Ordnern alle Treffer; 0 zeigt keine Zahl */
  zahl: number
  /** Hervorgehoben (Braucht dich) */
  wichtig?: true
}

/** Alle Ordner in ihrer Reihenfolge. */
export async function holeOrdner(): Promise<Ordner[]> {
  const r = await fetch('/api/postfach/ordner')
  if (!r.ok) throw new Error(`Ordner holen fehlgeschlagen: ${r.status} ${await r.text()}`)
  return (await r.json()) as Ordner[]
}
