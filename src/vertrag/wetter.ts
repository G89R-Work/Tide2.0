// Vertrag: Wetter je Stunde für die feine Zeile über der Gezeitenkurve. Gilt für Attrappe und späteren Server.
import { z } from 'zod'
import { anfrage } from './anfrage'

export const wetterStundeSchema = z.object({
  /** ISO-Zeitpunkt der vollen Stunde */
  zeit: z.iso.datetime({ offset: true }),
  /** Temperatur in Grad Celsius */
  grad: z.number(),
  /** Regen in Millimetern in dieser Stunde */
  regen: z.number().nonnegative(),
  /** Wahrscheinlichkeit für Regen in dieser Stunde, 0 bis 100 Prozent */
  regenChance: z.number().min(0).max(100),
})
export type WetterStunde = z.infer<typeof wetterStundeSchema>

/** Je volle Stunde im Zeitraum ein Wert. */
export function holeWetter(von: Date, bis: Date): Promise<WetterStunde[]> {
  const q = new URLSearchParams({ von: von.toISOString(), bis: bis.toISOString() })
  return anfrage(z.array(wetterStundeSchema), 'Wetter holen', `/api/wetter?${q}`)
}
