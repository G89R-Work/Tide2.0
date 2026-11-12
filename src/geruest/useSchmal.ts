import { useSyncExternalStore } from 'react'
import { leiste } from '../werte/leiste'

// Ist das Fenster schmal wie ein Handy? Folgt Drehen und Größenänderung.
const abfrage = matchMedia(`(max-width: ${leiste.schmalUnter - 1}px)`)
const abonnieren = (neu: () => void) => {
  abfrage.addEventListener('change', neu)
  return () => abfrage.removeEventListener('change', neu)
}

export function useSchmal() {
  return useSyncExternalStore(abonnieren, () => abfrage.matches)
}

/** Dasselbe außerhalb von React, etwa für Befehle. */
export const istSchmal = () => abfrage.matches
