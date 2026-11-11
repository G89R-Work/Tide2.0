// Standard- und Mindestbreite der Seitenleiste in Pixeln (Rechnung siehe unten).
const standardPx = 147

// Seitenleiste am PC: eingeklappt nur Symbole, ausgefahren mit Namen und bis `hoechstens` ziehbar.
export const leiste = {
  symbole: '64px',
  /**
   * Standard- und Mindestbreite: so breit wie der längste Bereichsname („Finanzen", 61 px) mit gleichem Abstand
   * links und rechts (je 25 px): 8 Abstand + 1 Rand + 8 + 16 Knopf + 20 Symbol + 8 Lücke + 61 + 16 + 8 + 1.
   * „Einstellungen" passt nicht und zeigt nur das Zahnrad.
   */
  standard: `${standardPx}px`,
  standardPx,
  /** Weiter lässt sie sich nicht ziehen. */
  hoechstens: '360px',
  /** Unter dieser Fensterbreite gilt die Handy-Ansicht mit Menü statt Seitenleiste. */
  schmalUnter: 768,
} as const
