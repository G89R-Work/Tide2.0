import { create } from 'zustand'
import type { Auswahl } from '../logik/mails'

// Gewählte Mails des offenen Ordners: Liste, Leser und Befehle (Tastenkürzel) lesen dieselbe Auswahl.
// Ansicht, keine Änderung: kein Rückgängig, nicht gemerkt. Wechselt der Ordner, beginnt sie leer.
type Stand = Auswahl & { ordner: string | null }
const useStand = create<Stand>(() => ({ ordner: null, ids: [], anker: null }))

/** Auswahl im Ordner; gehört sie zu einem anderen Ordner, ist sie leer. */
export const useMailAuswahl = (ordner: string): Auswahl => useStand((s) => (s.ordner === ordner ? s : leer))
const leer: Auswahl = { ids: [], anker: null }

/** Neue Auswahl im Ordner. */
export const waehleMails = (ordner: string, a: Auswahl) => useStand.setState({ ordner, ...a })

/** Für Befehle außerhalb von React. */
export const mailAuswahlJetzt = () => useStand.getState()
