// Die Seitenleiste am PC hat zwei Zustände: eingeklappt (nur Symbole) oder ausgefahren (Symbole mit Namen).
export const leiste = {
  symbole: '64px',
  /**
   * Ausgefahren so breit wie der längste Bereichsname („Finanzen", 61 px) mit gleichem Abstand
   * links und rechts (je 25 px): 8 Abstand + 1 Rand + 8 + 16 Knopf + 20 Symbol + 8 Lücke + 61 + 16 + 8 + 1.
   * „Einstellungen" passt nicht und zeigt nur das Zahnrad.
   */
  offen: '147px',
  /** Unter dieser Fensterbreite gilt die Handy-Ansicht mit Menü statt Seitenleiste. */
  schmalUnter: 768,
} as const
