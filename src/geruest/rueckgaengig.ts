import { useEffect, useState, useSyncExternalStore } from 'react'
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
  /** Seite, auf der die Änderung entstand (Bereich, etwa „einstellungen“ oder die Seite der Kacheln). */
  bereich?: string
}

let verlauf: Verlauf<Schritt> = leererVerlauf()
const hoerer = new Set<() => void>()
const setze = (neu: Verlauf<Schritt>) => {
  verlauf = neu
  hoerer.forEach((h) => h())
}

export function merke(schritt: Omit<Schritt, 'zeit'>) {
  setze(merken(verlauf, { ...schritt, zeit: Date.now() }))
}

/** Nimmt den letzten Schritt zurück; mit `bereich` den letzten dieser Seite. */
export function rueckgaengig(bereich?: string) {
  const r = zuruecknehmen(verlauf, bereich)
  if (!r.schritt) return
  setze(r.verlauf)
  void r.schritt.zurueck()
}

/** Stellt den zuletzt zurückgenommenen Schritt wieder her; mit `bereich` den letzten dieser Seite. */
export function wiederherstellen(bereich?: string) {
  const r = wiederholen(verlauf, bereich)
  if (!r.schritt) return
  setze(r.verlauf)
  void r.schritt.vor()
}

const abo = (h: () => void) => {
  hoerer.add(h)
  return () => hoerer.delete(h)
}

/** Der letzte Schritt, der sich zurücknehmen lässt. */
export const useLetzterSchritt = () => useSyncExternalStore(abo, () => verlauf.zurueck.at(-1))

/** Gibt es (auf dieser Seite) etwas zurückzunehmen oder wiederherzustellen? Für die Knöpfe. */
export const useKannRueckgaengig = (bereich?: string) => useSyncExternalStore(abo, () => kannZurueck(verlauf, bereich))
export const useKannWiederherstellen = (bereich?: string) => useSyncExternalStore(abo, () => kannVor(verlauf, bereich))

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
