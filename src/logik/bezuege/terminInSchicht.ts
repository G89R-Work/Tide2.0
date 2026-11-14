// Bezug Kalender ↔ Arbeit: Ein Termin fällt in eine Schicht (docs/konzept/06-gezeitenkurve.md, „Überschneidung").
import type { Eintrag } from '../../vertrag/eintrag'

// Zeiten in Minuten auf derselben Achse; wer die Achse wählt (etwa ab Mitternacht), entscheidet der Aufrufer.

export type Spanne = { von: number; bis: number }

/** Titel aller Schichten, mit denen sich der Termin überschneidet. Berühren am Rand zählt nicht. */
export function ueberschneidungen(termin: Spanne, schichten: readonly (Spanne & { titel: string })[]): string[] {
  return schichten.filter((s) => termin.von < s.bis && termin.bis > s.von).map((s) => s.titel)
}

/** Minuten seit 1970: eine Achse ohne Tagesgrenze und ohne Zeitumstellung. */
const minute = (d: Date | string) => new Date(d).getTime() / 60_000

/** Titel der Schichten aus `liste`, in die ein Termin von `beginn` bis `ende` fällt (für die Warnung beim Anlegen). */
export function schichtenImTermin(beginn: Date, ende: Date, liste: readonly Eintrag[]): string[] {
  const schichten = liste.flatMap((e) => (e.art === 'schicht' && e.beginn && e.ende ? [{ titel: e.titel, von: minute(e.beginn), bis: minute(e.ende) }] : []))
  return ueberschneidungen({ von: minute(beginn), bis: minute(ende) }, schichten)
}
