import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { kannVor, kannZurueck, leererVerlauf, merken, wiederholen, zuruecknehmen, type Verlauf } from '../logik/rueckgaengig'
import { MELDUNG_MS } from '../werte/bewegung'

// Der einzige Rückgängig-Speicher von Tide (Regel 6, Regel C): wer etwas ändert, merkt sich hier den Weg zurück und vor.
// Die Knöpfe einer Seite wirken nur auf Schritte mit ihrem `bereich`; Alt+Z und Alt+Y auf den letzten Schritt von ganz Tide.
// `zurueck` und `vor` melden eigene Fehler selbst.
export type Schritt = {
  text: string
  zurueck: () => Promise<void>
  vor: () => Promise<void>
  zeit: number
  /** Lässt sich zurücknehmen, erscheint aber nicht als Meldung (etwa beim Ausblenden der Kurve). */
  still?: boolean
  /** Seite, auf der die Änderung entstand (Bereich, etwa „einstellungen“ oder heute). */
  bereich?: string
}

const useVerlauf = create<Verlauf<Schritt>>(() => leererVerlauf())
const setze = (neu: Verlauf<Schritt>) => useVerlauf.setState(neu, true)

export function merke(schritt: Omit<Schritt, 'zeit'>) {
  setze(merken(useVerlauf.getState(), { ...schritt, zeit: Date.now() }))
}

/** Nimmt den letzten Schritt zurück; mit `bereich` den letzten dieser Seite. */
export function rueckgaengig(bereich?: string) {
  const r = zuruecknehmen(useVerlauf.getState(), bereich)
  if (!r.schritt) return
  setze(r.verlauf)
  void r.schritt.zurueck()
}

/** Stellt den zuletzt zurückgenommenen Schritt wieder her; mit `bereich` den letzten dieser Seite. */
export function wiederherstellen(bereich?: string) {
  const r = wiederholen(useVerlauf.getState(), bereich)
  if (!r.schritt) return
  setze(r.verlauf)
  void r.schritt.vor()
}

/** Der letzte Schritt, der sich zurücknehmen lässt. */
export const useLetzterSchritt = () => useVerlauf((v) => v.zurueck.at(-1))

/** Gibt es (auf dieser Seite) etwas zurückzunehmen oder wiederherzustellen? Für die Knöpfe. */
export const useKannRueckgaengig = (bereich?: string) => useVerlauf((v) => kannZurueck(v, bereich))
export const useKannWiederherstellen = (bereich?: string) => useVerlauf((v) => kannVor(v, bereich))

/** Der letzte Schritt, solange er frisch ist: so lange steht er in der Kopfzeile, Alt+Z wirkt auch danach. */
export function useFrischerSchritt() {
  const schritt = useLetzterSchritt()
  const [alt, setAlt] = useState<typeof schritt>()
  useEffect(() => {
    if (!schritt) return
    const t = setTimeout(() => setAlt(schritt), Math.max(0, schritt.zeit + MELDUNG_MS - Date.now()))
    return () => clearTimeout(t)
  }, [schritt])
  return schritt && !schritt.still && alt !== schritt ? schritt : undefined
}
