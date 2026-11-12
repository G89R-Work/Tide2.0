// Bezug Kalender ↔ Arbeit: Ein Termin fällt in eine Schicht (docs/konzept/06-gezeitenkurve.md, „Überschneidung").
// Zeiten in Minuten auf derselben Achse; wer die Achse wählt (etwa ab Mitternacht), entscheidet der Aufrufer.

export type Spanne = { von: number; bis: number }

/** Titel aller Schichten, mit denen sich der Termin überschneidet. Berühren am Rand zählt nicht. */
export function ueberschneidungen(termin: Spanne, schichten: readonly (Spanne & { titel: string })[]): string[] {
  return schichten.filter((s) => termin.von < s.bis && termin.bis > s.von).map((s) => s.titel)
}
