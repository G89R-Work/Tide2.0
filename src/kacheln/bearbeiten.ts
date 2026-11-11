import { useSyncExternalStore } from 'react'

// Bearbeiten-Modus der sichtbaren Seite. Es gibt immer nur eine Seite mit Kacheln, darum ein Zustand für alle.
let an = false
const hoerer = new Set<() => void>()
/** Das Raster der offenen Seite trägt hier ein, wie es sich zurücksetzt. */
let zuruecksetzer: (() => void) | null = null

function setzen(neu: boolean) {
  if (an === neu) return
  an = neu
  for (const h of hoerer) h()
}

const abonnieren = (h: () => void) => {
  hoerer.add(h)
  return () => hoerer.delete(h)
}

export function useBearbeiten() {
  return useSyncExternalStore(abonnieren, () => an)
}

export const bearbeitenStarten = () => setzen(true)
export const bearbeitenBeenden = () => setzen(false)

export function meldeZuruecksetzer(f: (() => void) | null) {
  zuruecksetzer = f
}

/** Befehl „Kacheln zurücksetzen". Auf Seiten ohne Kacheln gibt es nichts zurückzusetzen. */
export function kachelnZuruecksetzen() {
  zuruecksetzer?.()
}
