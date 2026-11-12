// Vertrag: Wetter je Stunde für die feine Zeile über der Gezeitenkurve. Gilt für Attrappe und späteren Server.

export type WetterStunde = {
  /** ISO-Zeitpunkt der vollen Stunde */
  zeit: string
  /** Temperatur in Grad Celsius */
  grad: number
  /** Regen in Millimetern in dieser Stunde */
  regen: number
}

/** Je volle Stunde im Zeitraum ein Wert. */
export async function holeWetter(von: Date, bis: Date): Promise<WetterStunde[]> {
  const q = new URLSearchParams({ von: von.toISOString(), bis: bis.toISOString() })
  const r = await fetch(`/api/wetter?${q}`)
  if (!r.ok) throw new Error(`Wetter holen fehlgeschlagen: ${r.status} ${await r.text()}`)
  return (await r.json()) as WetterStunde[]
}
