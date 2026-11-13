// Vertrag: Wetter je Stunde (Zeile über der Gezeitenkurve, Wetter auf Heute) und je Tag (Vorschau, Vergleich). Gilt für Attrappe und späteren Server.
import { z } from 'zod'
import { anfrage } from './anfrage'

/** Temperatur einer Wetterquelle; der Server liefert drei. */
export const wetterQuelleSchema = z.object({
  name: z.string().min(1),
  /** Temperatur in Grad Celsius */
  grad: z.number(),
})

export const wetterStundeSchema = z.object({
  /** ISO-Zeitpunkt der vollen Stunde */
  zeit: z.iso.datetime({ offset: true }),
  /** Temperatur in Grad Celsius: der mittlere Wert der Quellen */
  grad: z.number(),
  /** Gefühlte Temperatur in Grad Celsius */
  gefuehlt: z.number(),
  /** Regen in Millimetern in dieser Stunde */
  regen: z.number().nonnegative(),
  /** Wahrscheinlichkeit für Regen in dieser Stunde, 0 bis 100 Prozent */
  regenChance: z.number().min(0).max(100),
  /** Wind und Böen in km/h */
  wind: z.number().nonnegative(),
  boeen: z.number().nonnegative(),
  /** Relative Luftfeuchte, 0 bis 100 Prozent */
  feuchte: z.number().min(0).max(100),
  /** UV-Index */
  uv: z.number().nonnegative(),
  /** Luftdruck in Hektopascal */
  druck: z.number().positive(),
  /** Temperatur jeder Quelle */
  quellen: z.array(wetterQuelleSchema),
})
export type WetterStunde = z.infer<typeof wetterStundeSchema>

const spanneSchema = z.object({ tief: z.number(), hoch: z.number() })

export const wetterTagSchema = z.object({
  /** Ortstag „JJJJ-MM-TT“ */
  tag: z.iso.date(),
  tief: z.number(),
  hoch: z.number(),
  /** Regen in Millimetern am ganzen Tag */
  regen: z.number().nonnegative(),
  /** Höchste Wahrscheinlichkeit für Regen am Tag, 0 bis 100 Prozent */
  regenChance: z.number().min(0).max(100),
  /** Derselbe Tag im Vorjahr */
  vorjahr: spanneSchema,
  /** Langjähriges Mittel für diesen Tag */
  mittel: spanneSchema,
})
export type WetterTag = z.infer<typeof wetterTagSchema>

/** Je volle Stunde im Zeitraum ein Wert. */
export function holeWetter(von: Date, bis: Date): Promise<WetterStunde[]> {
  const q = new URLSearchParams({ von: von.toISOString(), bis: bis.toISOString() })
  return anfrage(z.array(wetterStundeSchema), 'Wetter holen', `/api/wetter?${q}`)
}

/** Je Ortstag im Zeitraum ein Wert. */
export function holeWetterTage(von: Date, bis: Date): Promise<WetterTag[]> {
  const q = new URLSearchParams({ von: von.toISOString(), bis: bis.toISOString() })
  return anfrage(z.array(wetterTagSchema), 'Wettervorschau holen', `/api/wetter/tage?${q}`)
}
