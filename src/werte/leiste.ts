// Seitenleiste und zweite Ebene am PC und Tablet. Ihre Breite belegt ganze Zellen (src/logik/geruestRaster.ts);
// diese Werte sagen, wie breit sie mindestens sichtbar sein müssen.
export const leiste = {
  /**
   * Breite Leiste mit Namen: so breit wie der längste Bereichsname („Finanzen", 61 px) mit gleichem Abstand
   * links und rechts: 1 Rand + 8 + 16 Knopf + 20 Symbol + 8 Lücke + 61 + 16 + 8 + 1 = 139 px.
   * „Einstellungen" passt nicht und zeigt nur das Zahnrad.
   */
  namenPx: 139,
  /** Zweite Ebene (Ordner, Listen). */
  ebenePx: 208,
  /** Unter dieser Fensterbreite gilt die Handy-Ansicht mit Menü statt Seitenleiste. */
  schmalUnter: 768,
} as const
