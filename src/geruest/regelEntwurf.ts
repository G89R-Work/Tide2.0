import { create } from 'zustand'
import type { Regel } from '../vertrag/postfach'

// Vorbereitete, noch nicht gespeicherte Regel (aus dem Rechtsklick auf eine Mail); die Regel-Seite öffnet sie im Editor.
// Ansicht, keine Änderung: kein Rückgängig, nicht gemerkt.
const useStand = create<{ regel: Regel | null }>(() => ({ regel: null }))

export const useRegelEntwurf = () => useStand((s) => s.regel)
/** Neue id für eine Regel. */
export const regelId = () => `regel-${crypto.randomUUID().slice(0, 8)}`

export const setzeRegelEntwurf = (regel: Regel | null) => useStand.setState({ regel })
