// Maße des Kachel-Rasters in Pixeln (der Baustein rechnet in Zahlen).
export const kachelRaster = {
  /** Höhe einer Zeile am PC und Tablet, überall gleich; die Zahl der Zeilen je Bildschirm wird gerundet (`zeilenZahl`). */
  zeilePc: 48,
  /** Am Handy fasst eine Bildschirmhöhe immer so viele Zeilen; die Höhe einer Zeile rechnet `zeilenHoehe` daraus. */
  zeilenHandy: 12,
  /** Abstand des Kachel-Menüs zum Fensterrand. */
  menueRand: 8,
} as const
