// Maße des Kachel-Rasters (quadratische Zellen wie bei Samsung One UI; Spalten sind eine Einstellung).
export const kachelRaster = {
  /** Abstand zwischen Kacheln als Anteil der Zelle; jede Kachel hat die Hälfte davon als unsichtbaren Rand. */
  abstandAnteil: 0.2,
  /** Abstand des Kachel-Menüs zum Fensterrand. */
  menueRand: 8,
  /** Erst ab so vielen Pixeln Bewegung beginnt das Ziehen; ein Berühren oder Klicken verschiebt nichts. */
  ziehSchwelle: 8,
  /** Beim Ziehen: Bewegungen innerhalb dieses Umkreises (px) gelten als Verweilen, nicht als neue Absicht. */
  verweilPuffer: 16,
} as const
