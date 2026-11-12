import { createContext, useContext } from 'react'
import { setzeHier, useEinstellung, wertHier } from '../geruest/einstellungen'
import { einstellungen } from '../logik/einstellungen'

// Bearbeiten-Modus der Kacheln: eine Einstellung je Gerät (Einstellungen › Kacheln). Er gilt für jede Seite,
// bis „Fertig“ ihn beendet; Klicks auf den Inhalt wirken darin wie gewohnt.
const bearbeiten = einstellungen.find((e) => e.id === 'kacheln-bearbeiten')!

/** Das Raster der offenen Seite trägt hier ein, wie es sich zurücksetzt. */
let zuruecksetzer: (() => void) | null = null

export function useBearbeiten(): boolean {
  return useEinstellung(bearbeiten) === true
}

export const bearbeitenBeenden = () => setzeHier(bearbeiten, false)

/** Befehl „Kacheln bearbeiten“: schaltet den Modus ein oder aus. */
export const bearbeitenUmschalten = () => setzeHier(bearbeiten, wertHier(bearbeiten) !== true)

/** Ort des Bedienfelds im Bearbeiten-Modus: am PC unten in der Seitenleiste, am Handy über der unteren Leiste.
 *  Das Gerüst stellt ihn bereit, das Raster legt sein Bedienfeld dort hinein. So verschiebt sich im Modus nichts. */
export const BearbeitenOrt = createContext<HTMLElement | null>(null)
export const useBearbeitenOrt = () => useContext(BearbeitenOrt)

export function meldeZuruecksetzer(f: (() => void) | null) {
  zuruecksetzer = f
}

/** Befehl „Kacheln zurücksetzen". Auf Seiten ohne Kacheln gibt es nichts zurückzusetzen. */
export function kachelnZuruecksetzen() {
  zuruecksetzer?.()
}
