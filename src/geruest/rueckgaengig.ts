import { useSyncExternalStore } from 'react'

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
