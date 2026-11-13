import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { abWerk, belege, belegungAus, type Belegung, type Ort } from '../logik/aktionen'
import { merke } from './rueckgaengig'

// Die Belegung der Knöpfe. Gemerkt im Browser und beim Laden geprüft; jede Änderung kommt in den einen Rückgängig-Speicher.
const useStand = create<Belegung>()(persist(() => abWerk, { name: 'tide.knoepfe', merge: (gemerkt) => belegungAus(gemerkt) }))
function setzen(neu: Belegung) {
  void useStand.setState(neu, true)
}

export const useBelegung = () => useStand()

export function platzBelegen(ort: Ort, platz: number, id: string | null) {
  ersetzen(belege(useStand.getState(), ort, platz, id), 'Knopf belegt')
}

export function belegungErsetzen(neu: Belegung) {
  ersetzen(neu, 'Knöpfe ab Werk')
}

function ersetzen(neu: Belegung, text: string) {
  const alt = useStand.getState()
  if (neu === alt) return
  setzen(neu)
  // Knöpfe belegt man in den Einstellungen; deren Rückgängig-Knopf nimmt es zurück.
  merke({ text, bereich: 'einstellungen', zurueck: async () => setzen(alt), vor: async () => setzen(neu) })
}
