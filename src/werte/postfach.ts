import type { Hinweis } from '../vertrag/postfach'

// Postfach: Maße der Mail-Liste und Farben der Hinweise (aus den Designs, keine eigenen Farbcodes).
const zeilePx = 88

export const postfach = {
  /** Breite der Mail-Liste am PC und Tablet ab Werk (Vorlage `.mails`), kleinste und größte beim Ziehen der Trennlinie. */
  liste: '380px',
  listeMin: '280px',
  listeMax: '60%',
  /** Tipp-Pause, nach der ein Entwurf sich speichert. */
  entwurfSpeichernMs: 800,
  /** Kleinste Breite des Lesers. */
  leserMin: '360px',
  /** Feste Höhe einer Mail-Zeile: so rechnet die Liste ohne Messen und scrollt auch bei 500 Mails ruhig. */
  zeilePx,
  /** Platz über und unter dem sichtbaren Teil, in dem Zeilen schon bereitliegen: drei Zeilen. */
  vorratPx: 3 * zeilePx,
} as const

/** Textfarbe je Hinweis; der Rahmen nimmt dieselbe Farbe gedämpft. */
export const hinweisKlassen: Record<Hinweis, string> = {
  Handeln: 'text-warnung',
  Antworten: 'text-akzent',
  Lesen: 'text-raum-3',
  Später: 'text-text-blass',
}
