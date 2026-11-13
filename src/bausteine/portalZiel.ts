import { createContext, useContext } from 'react'

// Wo schwebende Bausteine (Aufklapp, Menue) sich einhängen. Ab Werk am Ende der Seite; in einem nativen
// Dialogfenster (modal) muss es das Fenster selbst sein, sonst ist die Karte gesperrt und schließt sofort.
export const PortalZiel = createContext<HTMLElement | null>(null)

/** Ziel für `container` von Radix-Portalen; `undefined` heißt: am Ende der Seite. */
export const usePortalZiel = () => useContext(PortalZiel) ?? undefined
