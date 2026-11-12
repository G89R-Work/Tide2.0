// Maße des Kachel-Rasters in Pixeln (der Baustein rechnet in Zahlen).
export const kachelRaster = {
  /** So viele Zeilen fasst eine Bildschirmhöhe; die Höhe einer Zeile rechnet `zeilenHoehe` daraus (src/logik/kacheln.ts).
   *  PC und Tablet 8 (auch auf niedrigen Tablets passen die Inhalte), Handy 12. */
  zeilenJeBildschirm: { pc: 8, handy: 12 },
  /** Abstand des Kachel-Menüs zum Fensterrand. */
  menueRand: 8,
} as const
