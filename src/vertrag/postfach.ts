// Vertrag: Ordner des Postfachs für die zweite Ebene. Gilt für Attrappe und späteren Server.
import { z } from 'zod'
import { anfrage } from './anfrage'

export const ordnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  art: z.enum(['system', 'eigen', 'intelligent']),
  /** Übergeordneter eigener Ordner (nur bei `eigen`) */
  eltern: z.string().optional(),
  /** Zahl rechts: Ungelesenes, bei Entwürfen und intelligenten Ordnern alle Treffer; 0 zeigt keine Zahl */
  zahl: z.int().nonnegative(),
  /** Hervorgehoben (Braucht dich) */
  wichtig: z.literal(true).optional(),
})
export type Ordner = z.infer<typeof ordnerSchema>
export type OrdnerArt = Ordner['art']

/** Alle Ordner in ihrer Reihenfolge. */
export function holeOrdner(): Promise<Ordner[]> {
  return anfrage(z.array(ordnerSchema), 'Ordner holen', '/api/postfach/ordner')
}
