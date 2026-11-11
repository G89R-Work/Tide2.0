import { useSyncExternalStore } from 'react'

// Die Uhrzeit, die die Gezeitenkurve gerade zeigt. null heißt: die Kurve folgt der echten Uhrzeit.
// Der Hintergrund richtet Sonne, Mond und Licht danach.
let gezeigt: Date | null = null
const hoerer = new Set<() => void>()

export function setzeGezeigteZeit(zeit: Date | null) {
  if (zeit?.getTime() === gezeigt?.getTime()) return
  gezeigt = zeit
  for (const h of hoerer) h()
}

const abonnieren = (h: () => void) => {
  hoerer.add(h)
  return () => hoerer.delete(h)
}

export function useGezeigteZeit(): Date | null {
  return useSyncExternalStore(abonnieren, () => gezeigt)
}
