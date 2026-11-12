import { createContext, useContext } from 'react'

/** Sichtbare Höhe des Inhalts zwischen dem freien Platz oben und unten, also eine Bildschirmhöhe für das Kachel-Raster.
 *  Gemessen und bereitgestellt von `MitKurve`; 0, solange nichts gemessen ist. */
export const FreieHoehe = createContext(0)
export const useFreieHoehe = () => useContext(FreieHoehe)
