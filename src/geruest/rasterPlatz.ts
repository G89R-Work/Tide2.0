import { createContext, useContext } from 'react'

/** Platz für das Kachel-Raster der offenen Seite: Spalten und sichtbare Höhe eines Bildschirms (zwischen Kopf und Kurve).
 *  Am PC und Tablet setzt ihn das Gerüst aus dem Zellraster der ganzen Seite (src/logik/geruestRaster.ts), am Handy `MitKurve`.
 *  Höhe 0, solange nichts gemessen ist. */
export const RasterPlatz = createContext({ spalten: 1, hoehe: 0 })
export const useRasterPlatz = () => useContext(RasterPlatz)
