import { useSyncExternalStore } from 'react'

// Suchtext der Einstellungen. Das Feld steht in der zweiten Ebene, die Treffer zeigt die Seite.
let text = ''
const hoerer = new Set<() => void>()

export function setzeEinstellungenSuche(neu: string) {
  if (neu === text) return
  text = neu
  for (const h of hoerer) h()
}

const abonnieren = (h: () => void) => {
  hoerer.add(h)
  return () => hoerer.delete(h)
}

export function useEinstellungenSuche(): string {
  return useSyncExternalStore(abonnieren, () => text)
}
