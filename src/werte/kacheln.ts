// Maße des Kachel-Rasters in Pixeln (der Baustein rechnet in Zahlen) und das Gefühl des langen Drucks.
export const kachelRaster = {
  /** Höhe einer Rasterzeile. */
  zeile: 56,
  /** Lücke zwischen Kacheln, waagerecht und senkrecht. */
  abstand: 12,
  /** So lange drücken, bis der Bearbeiten-Modus beginnt (wie bei Widgets auf dem Handy). */
  langerDruckMs: 450,
  /** Wackelt der Finger weiter als das, ist es Scrollen statt langer Druck. */
  wackelPx: 10,
  /** Abstand des Rechtsklick-Menüs zum Fensterrand. */
  menueRand: 8,
} as const
