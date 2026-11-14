// Tempo-Grenzen aus docs/konzept/02-tempo.md. Einzige Quelle für npm run sicht und npm run pruefen.
export const tempoGrenzen = { blur: 4, animationen: 0, wechselMs: 100, kilobyte: 210 } as const

export type TempoWerte = Partial<Record<keyof typeof tempoGrenzen, number>>

/** Liefert je verletzter Grenze einen Satz; leer heißt alles eingehalten. */
export function tempoVerstoesse(w: TempoWerte): string[] {
  const g = tempoGrenzen
  const v: string[] = []
  if (w.blur !== undefined && w.blur > g.blur) v.push(`${w.blur} Flächen mit Weichzeichner sichtbar, erlaubt höchstens ${g.blur}`)
  if (w.animationen !== undefined && w.animationen > g.animationen)
    v.push(`${w.animationen} laufende Animationen im Ruhezustand, erlaubt ${g.animationen}`)
  if (w.wechselMs !== undefined && w.wechselMs >= g.wechselMs)
    v.push(`Seitenwechsel dauert ${w.wechselMs} ms, erlaubt unter ${g.wechselMs}`)
  if (w.kilobyte !== undefined && w.kilobyte >= g.kilobyte)
    v.push(`Programmcode beim Start ${w.kilobyte} KB, erlaubt unter ${g.kilobyte}`)
  return v
}
