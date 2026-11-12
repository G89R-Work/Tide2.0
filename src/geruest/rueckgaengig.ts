import { useEffect, useState, useSyncExternalStore } from 'react'
import { MELDUNG_MS } from '../werte/bewegung'

// Der einzige Rückgängig-Speicher von Tide (Regel 6, Regel C): wer etwas ändert, merkt sich hier den Weg zurück.
// Einstellungen, Kacheln, Knöpfe und Kurve melden sich mit `merke`; jeder Rückgängig-Knopf ruft `rueckgaengig()`.
// Aktion „Rückgängig" (Alt+Z) nimmt den letzten Schritt zurück. `zurueck` meldet eigene Fehler selbst.
export type Schritt = { text: string; zurueck: () => Promise<void>; zeit: number; still?: boolean }

let stapel: readonly Schritt[] = []
const hoerer = new Set<() => void>()
const melde = () => hoerer.forEach((h) => h())

/** `still`: lässt sich zurücknehmen, erscheint aber nicht als Meldung (etwa beim Ausblenden der Kurve). */
export function merke(text: string, zurueck: () => Promise<void>, still = false) {
  stapel = [...stapel.slice(-19), { text, zurueck, zeit: Date.now(), still }]
  melde()
}

export function rueckgaengig() {
  const letzter = stapel.at(-1)
  if (!letzter) return
  stapel = stapel.slice(0, -1)
  melde()
  void letzter.zurueck()
}

const abo = (h: () => void) => {
  hoerer.add(h)
  return () => hoerer.delete(h)
}

/** Der letzte Schritt, der sich zurücknehmen lässt. */
export const useLetzterSchritt = () => useSyncExternalStore(abo, () => stapel.at(-1))

/** Gibt es etwas zurückzunehmen? Für die Rückgängig-Knöpfe. */
export const useKannRueckgaengig = () => useSyncExternalStore(abo, () => stapel.length > 0)

/** Der letzte Schritt, solange er frisch ist: sechs Sekunden lang steht er in der Kopfzeile, Alt+Z wirkt auch danach. */
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
