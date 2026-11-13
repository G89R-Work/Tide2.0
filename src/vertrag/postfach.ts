// Vertrag: Ordner des Postfachs für die zweite Ebene. Gilt für Attrappe und späteren Server.
import { z } from 'zod'
import { anfrage } from './anfrage'

/** Farben eigener Ordner (Namen wie in der Vorlage). */
export const ordnerFarbeSchema = z.enum(['glut', 'meer', 'flieder', 'sand', 'koralle', 'salbei'])
export type OrdnerFarbe = z.infer<typeof ordnerFarbeSchema>

/** Was Tide an einem Ordner ändern kann; Zähler und Hervorhebung bestimmt der Server. */
export const ordnerStandSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  art: z.enum(['system', 'eigen', 'intelligent']),
  /** Übergeordneter eigener Ordner (nur bei `eigen`) */
  eltern: z.string().optional(),
  /** Nur bei `eigen` */
  farbe: ordnerFarbeSchema.optional(),
  /** Steht in der Ordnerleiste; sonst hinter „Ordner anzeigen“ */
  angeheftet: z.boolean(),
  /** Gespeicherte Suche (nur bei `intelligent`) */
  suche: z.string().optional(),
})
export type OrdnerStand = z.infer<typeof ordnerStandSchema>

export const ordnerSchema = ordnerStandSchema.extend({
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

/** Speichert alle Ordner in dieser Reihenfolge (anlegen, ändern, umsortieren, löschen); Antwort mit Zählern. */
export function speichereOrdner(liste: readonly OrdnerStand[]): Promise<Ordner[]> {
  return anfrage(z.array(ordnerSchema), 'Ordner speichern', '/api/postfach/ordner', 'PUT', liste)
}
