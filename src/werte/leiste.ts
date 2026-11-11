// Breiten der Seitenleiste. Darunter rastet sie auf die Symbol-Leiste ein.
export const leiste = {
  symbole: '64px',
  mindest: '180px',
  standard: '232px',
  hoechstens: '360px',
  /** Ab dieser Breite in Pixeln stehen Namen neben den Symbolen. */
  namenAb: 150,
  /** Unter dieser Fensterbreite gilt die Handy-Ansicht mit Menü statt Seitenleiste. */
  schmalUnter: 768,
} as const
