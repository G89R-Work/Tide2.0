import { useSyncExternalStore } from 'react'
import { merke } from './rueckgaengig'

// Ist der Reiter „Braucht dich“ auf Heute weggeklickt? Gilt bis zum Neuladen, damit er beim Seitenwechsel nicht wiederkommt.
let zu = false
const hoerer = new Set<() => void>()

function setze(neu: boolean) {
  zu = neu
  for (const h of hoerer) h()
}

const abonnieren = (h: () => void) => {
  hoerer.add(h)
  return () => hoerer.delete(h)
}

export function useBrauchtDichZu(): boolean {
  return useSyncExternalStore(abonnieren, () => zu)
}

/** Blendet den Reiter aus; lässt sich zurücknehmen. */
export function schliesseBrauchtDich() {
  setze(true)
  merke({ text: 'Braucht dich ausgeblendet', bereich: 'heute', zurueck: async () => setze(false), vor: async () => setze(true) })
}
