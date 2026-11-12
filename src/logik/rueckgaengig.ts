// Verlauf für Rückgängig und Wiederherstellen: zwei Listen, die neuesten Schritte hinten.
// `bereich` sagt, auf welcher Seite der Schritt entstand; die Knöpfe einer Seite wirken nur auf ihre eigenen Schritte,
// ohne Bereich (Alt+Z, Alt+Y) wirkt es auf den letzten Schritt von ganz Tide.
export type Verlauf<S> = { zurueck: readonly S[]; vor: readonly S[] }
type MitBereich = { bereich?: string }

const GRENZE = 20

export const leererVerlauf = <S>(): Verlauf<S> => ({ zurueck: [], vor: [] })

/** Neuer Schritt. Was im selben Bereich zum Wiederherstellen bereitlag, gilt danach nicht mehr. */
export function merken<S extends MitBereich>(v: Verlauf<S>, s: S): Verlauf<S> {
  return { zurueck: [...v.zurueck, s].slice(-GRENZE), vor: v.vor.filter((x) => x.bereich !== s.bereich) }
}

/** Index des letzten Schritts in `liste`, der zum Bereich passt (ohne Bereich: der letzte überhaupt). */
function letzter<S extends MitBereich>(liste: readonly S[], bereich?: string) {
  return bereich === undefined ? liste.length - 1 : liste.findLastIndex((x) => x.bereich === bereich)
}

function verschiebe<S extends MitBereich>(von: readonly S[], nach: readonly S[], bereich?: string) {
  const i = letzter(von, bereich)
  if (i < 0) return { schritt: undefined, von, nach }
  return { schritt: von[i], von: von.filter((_, j) => j !== i), nach: [...nach, von[i]] }
}

export function zuruecknehmen<S extends MitBereich>(v: Verlauf<S>, bereich?: string) {
  const r = verschiebe(v.zurueck, v.vor, bereich)
  return { schritt: r.schritt, verlauf: { zurueck: r.von, vor: r.nach } }
}

export function wiederholen<S extends MitBereich>(v: Verlauf<S>, bereich?: string) {
  const r = verschiebe(v.vor, v.zurueck, bereich)
  return { schritt: r.schritt, verlauf: { zurueck: r.nach, vor: r.von } }
}

export const kannZurueck = <S extends MitBereich>(v: Verlauf<S>, bereich?: string) => letzter(v.zurueck, bereich) >= 0
export const kannVor = <S extends MitBereich>(v: Verlauf<S>, bereich?: string) => letzter(v.vor, bereich) >= 0
