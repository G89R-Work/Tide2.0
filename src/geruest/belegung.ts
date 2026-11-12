import { useSyncExternalStore } from 'react'
import { belege, belegungAusText, type Belegung, type Ort } from '../logik/aktionen'
import { merke } from './rueckgaengig'

// Die Belegung der Knöpfe. Gemerkt im Browser wie der Zustand der Leiste; jede Änderung kommt in den einen Rückgängig-Speicher.
const schluessel = 'tide.knoepfe'

function lesen(): Belegung {
  try {
    return belegungAusText(localStorage.getItem(schluessel))
  } catch {
    return belegungAusText(null)
  }
}

let stand = lesen()
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

export function platzBelegen(ort: Ort, platz: number, id: string | null) {
  const neu = belege(stand, ort, platz, id)
  ersetzen(neu, 'Knopf belegt')
}

export function belegungErsetzen(neu: Belegung) {
  ersetzen(neu, 'Knöpfe ab Werk')
}

function ersetzen(neu: Belegung, text: string) {
  if (neu === stand) return
  const alt = stand
  setzen(neu)
  // Knöpfe belegt man in den Einstellungen; deren Rückgängig-Knopf nimmt es zurück.
  merke({ text, bereich: 'einstellungen', zurueck: async () => setzen(alt), vor: async () => setzen(neu) })
}
