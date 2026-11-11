import { useSyncExternalStore } from 'react'
import { belege, belegungAusText, type Belegung, type Ort } from '../logik/aktionen'

// Die Belegung der Knöpfe. Gemerkt im Browser wie die Breite der Leiste; jede Änderung lässt sich rückgängig machen.
const schluessel = 'tide.knoepfe'

function lesen(): Belegung {
  try {
    return belegungAusText(localStorage.getItem(schluessel))
  } catch {
    return belegungAusText(null)
  }
}

let stand = lesen()
const vorher: Belegung[] = []
const hoerer = new Set<() => void>()

function setzen(neu: Belegung) {
  stand = neu
  try {
    localStorage.setItem(schluessel, JSON.stringify(neu))
  } catch (f) {
    console.warn(`Knöpfe: Belegung nicht gespeichert, gilt nur bis zum Neuladen (${String(f)})`)
  }
  for (const h of hoerer) h()
}

const abonnieren = (h: () => void) => {
  hoerer.add(h)
  return () => hoerer.delete(h)
}

export function useBelegung() {
  return useSyncExternalStore(abonnieren, () => stand)
}

export function useKannZurueck() {
  return useSyncExternalStore(abonnieren, () => vorher.length > 0)
}

export function platzBelegen(ort: Ort, platz: number, id: string | null) {
  const neu = belege(stand, ort, platz, id)
  if (neu === stand) return
  vorher.push(stand)
  setzen(neu)
}

export function belegungErsetzen(neu: Belegung) {
  vorher.push(stand)
  setzen(neu)
}

export function belegungZurueck() {
  const alt = vorher.pop()
  if (alt) setzen(alt)
}
