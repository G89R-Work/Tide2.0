import { useEffect, useState, useSyncExternalStore } from 'react'

// Rückgängig für ganz Tide (Regel 6): wer etwas ändert, merkt sich hier den Weg zurück.
// Aktion „Rückgängig" (Alt+Z) nimmt den letzten Schritt zurück. `zurueck` meldet eigene Fehler selbst.
export type Schritt = { text: string; zurueck: () => Promise<void>; zeit: number }

let stapel: readonly Schritt[] = []
const hoerer = new Set<() => void>()
const melde = () => hoerer.forEach((h) => h())

export function merke(text: string, zurueck: () => Promise<void>) {
  stapel = [...stapel.slice(-19), { text, zurueck, zeit: Date.now() }]
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

/** So lange steht ein neuer Schritt als Meldung da (docs: Meldungen falten sich nach 6 Sekunden). */
const MELDUNG_MS = 6000

/** Der letzte Schritt, solange er frisch ist: sechs Sekunden lang steht er in der Kopfzeile, Alt+Z wirkt auch danach. */
export function useFrischerSchritt() {
  const schritt = useLetzterSchritt()
  const [alt, setAlt] = useState<typeof schritt>()
  useEffect(() => {
    if (!schritt) return
    const t = setTimeout(() => setAlt(schritt), Math.max(0, schritt.zeit + MELDUNG_MS - Date.now()))
    return () => clearTimeout(t)
  }, [schritt])
  return schritt && alt !== schritt ? schritt : undefined
}
