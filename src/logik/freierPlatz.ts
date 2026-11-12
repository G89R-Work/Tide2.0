// Platz über und unter dem Inhalt, der hinter Kurve und Leisten durchläuft (src/geruest/MitKurve.tsx).
// Zum äußersten Bildschirmrand gilt der Rand, zu allem anderen der Abstand. Liegt die Kurve daneben,
// ist ihr Griff schon so dick wie der Abstand und im verdeckten Platz enthalten.

export type FreierPlatzEingabe = {
  /** Was Kurve, Griff und untere Leiste oben und unten verdecken, in Pixeln. */
  verdeckt: { oben: number; unten: number }
  kurve: 'oben' | 'unten' | 'aus'
  /** Liegt über dem Inhalt eine Kopfzeile (Handy)? */
  kopfzeile: boolean
  rand: number
  abstand: number
}

export function freierPlatz({ verdeckt, kurve, kopfzeile, rand, abstand }: FreierPlatzEingabe): { oben: number; unten: number } {
  const oben = kurve === 'oben' ? verdeckt.oben : verdeckt.oben + (kopfzeile ? abstand : rand)
  const unten = kurve === 'unten' ? verdeckt.unten : verdeckt.unten + (verdeckt.unten > 0 ? abstand : rand)
  return { oben, unten }
}
