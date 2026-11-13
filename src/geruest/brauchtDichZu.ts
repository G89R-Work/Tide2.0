import { create } from 'zustand'
import { merke } from './rueckgaengig'

// Ist der Reiter „Braucht dich“ auf Heute weggeklickt? Gilt bis zum Neuladen, damit er beim Seitenwechsel nicht wiederkommt.
const useZu = create<{ zu: boolean }>(() => ({ zu: false }))
const setze = (zu: boolean) => useZu.setState({ zu })

export const useBrauchtDichZu = (): boolean => useZu((s) => s.zu)

/** Blendet den Reiter aus; lässt sich zurücknehmen. */
export function schliesseBrauchtDich() {
  setze(true)
  merke({ text: 'Braucht dich ausgeblendet', bereich: 'heute', zurueck: async () => setze(false), vor: async () => setze(true) })
}
