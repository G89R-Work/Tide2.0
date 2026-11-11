// Größe der Gezeitenkurve. Die Höhe zieht man am Rand zum Inhalt, die Breite am PC an den Seiten.
// Höhen zählen den Abstand zum Bildschirmrand (8 px) mit: 80 px ergeben 72 px sichtbare Kurve.
export const kurve = {
  /** Höhe ab Werk und nach Doppelklick auf den Griff. */
  hoehe: '80px',
  /** Darunter passen Linie und Stundenleiste nicht mehr. */
  hoeheMin: '56px',
  /** Der Inhalt behält immer mindestens die Hälfte. */
  hoeheMax: '50%',
  /** Schmaler wird sie nie; ab Werk volle Breite. */
  breiteMin: '240px',
  /** Dicke des Zieh-Griffs (Trenner, h-2/w-2) in Pixeln; so weit endet die Seitenleiste vor dem Streifen. */
  griffPx: 8,
} as const
