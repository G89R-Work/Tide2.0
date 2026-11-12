// Maße des Kachel-Rasters. Am PC und Tablet ist eine Linie so lang wie der Abstand (src/werte/abstaende.ts).
export const kachelRaster = {
  /** Am Handy fest: 2 Spalten, eine Bildschirmhöhe fasst 12 Zeilen. */
  handy: { spalten: 2, zeilen: 12 },
  /** Abstand des Kachel-Menüs zum Fensterrand. */
  menueRand: 8,
  /** Erst ab so vielen Pixeln Bewegung beginnt das Ziehen; ein Berühren oder Klicken verschiebt nichts. */
  ziehSchwelle: 8,
  /** Beim Ziehen: Bewegungen innerhalb dieses Umkreises (px) gelten als Verweilen, nicht als neue Absicht. */
  verweilPuffer: 16,
} as const
