// Seitenleiste am PC: Sie endet am Streifen der Gezeitenkurve – außer die Kurve gibt links genug Platz frei,
// dann reicht die Leiste bis zum Rand. Alle Werte in Pixeln.

export type LeisteLageEingabe = {
  /** Breite der Leisten-Spalte */
  leiste: number
  /** Freier Platz links neben der Kurve */
  links: number
  /** Höhe des Kurven-Streifens; 0 = keine Kurve gemessen */
  kurve: number
  /** Höhe des Griffs zwischen Inhalt und Kurve */
  griff: number
  /** Abstand zum Bildschirmrand, wenn nichts dazwischen liegt */
  rand: number
  kurveOben: boolean
}

/** Abstand der Leiste zum oberen und unteren Bildschirmrand. */
export function leisteLage({ leiste, links, kurve, griff, rand, kurveOben }: LeisteLageEingabe) {
  const seite = kurve === 0 || links >= leiste ? rand : kurve + griff
  return kurveOben ? { oben: seite, unten: rand } : { oben: rand, unten: seite }
}
