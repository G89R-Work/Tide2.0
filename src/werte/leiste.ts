// Seitenleiste und zweite Ebene am PC und Tablet, in Pixeln wie in der Vorlage (docs/vorlage-aussehen/prototyp3.html, `.dock`).
export const leiste = {
  /** Schmale Leiste wie in der Vorlage (Knopf 52 px plus 7 px Innenabstand links und rechts). */
  schmalPx: 66,
  /** Breite Leiste mit Namen: längster Name („Finanzen", 61 px) mit Symbol, Innenabständen und Luft. */
  breitPx: 156,
  /** Innenabstand der Leiste (links und rechts). */
  innenPx: 7,
  /** Zweite Ebene (Ordner, Listen). */
  ebenePx: 208,
  /** Unter dieser Fensterbreite gilt die Handy-Ansicht mit Menü statt Seitenleiste. */
  schmalUnter: 768,
} as const
