// Die zwei Abstände der Oberfläche, in Pixeln für Bausteine, die in Zahlen rechnen (Raster, Lage der Seitenleiste).
// Dieselben Werte stehen in werte.css als --spacing-rand und --spacing-abstand (Klassen p-rand, gap-abstand …);
// src/werte/abstaende.test.ts prüft, dass beide gleich sind.
export const abstaende = {
  /** Vom äußersten Bildschirmrand bis zur ersten Fläche. */
  randPx: 8,
  /** Zwischen allem anderen: Kacheln, Seitenleiste, zweite Ebene, Inhalt, Kurve, Leisten. */
  abstandPx: 12,
} as const
