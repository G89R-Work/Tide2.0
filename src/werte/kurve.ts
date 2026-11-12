// Größe der Gezeitenkurve. Am Handy zieht man die Höhe am Rand zum Inhalt; am PC und Tablet ist sie fest (`hoehePc`).
// Handy-Höhen zählen den Abstand zum Bildschirmrand (8 px) mit: 80 px ergeben 72 px sichtbare Kurve.
export const kurve = {
  /** Am PC und Tablet, wie in der Vorlage (`.tline`, ca. 150 px). */
  hoehePc: 150,
  /** Höhe ab Werk und nach Doppelklick auf den Griff. */
  hoehe: '80px',
  /** Darunter passen Linie und Stundenleiste nicht mehr. */
  hoeheMin: '56px',
  /** Höchstens der Goldene Schnitt (38,2 %) der Fläche aus Inhalt und Kurve; Wunsch des Nutzers. */
  hoeheMax: '38.2%',
  /** Am Handy nach dem Antippen: so groß wie erlaubt. Ein zweites Antippen stellt `hoehe` her. */
  hoeheGross: '38.2%',
} as const
