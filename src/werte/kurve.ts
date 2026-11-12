// Größe der Gezeitenkurve. Am Handy zieht man die Höhe am Rand zum Inhalt; am PC und Tablet ist sie fest (`hoehePc`).
// Handy-Höhen zählen den Abstand zum Bildschirmrand (8 px) mit: 80 px ergeben 72 px sichtbare Kurve.
export const kurve = {
  /** Am PC und Tablet, wie in der Vorlage (`.tline`, ca. 150 px). */
  hoehePc: 150,
  /** Ab dieser Höhe (px) hat die Kurve eine Kopfzeile; darunter (Handy klein) nur Linie und Stunden. */
  kopfAbPx: 120,
  /** Eingeklappt guckt nur dieser Rand (px) hervor; an ihm wischt man sie wieder hoch. */
  randPx: 18,
  /** So weit (px) senkrecht ziehen klappt die Kurve ein oder auf, auch ohne schnelles Wischen. */
  klappPx: 40,
  /** Höhe ab Werk und nach Doppelklick auf den Griff. */
  hoehe: '80px',
  /** Darunter passen Linie und Stundenleiste nicht mehr. */
  hoeheMin: '56px',
  /** Höchstens der Goldene Schnitt (38,2 %) der Fläche aus Inhalt und Kurve; Wunsch des Nutzers. */
  hoeheMax: '38.2%',
  /** Am Handy nach dem Antippen: so groß wie erlaubt. Ein zweites Antippen stellt `hoehe` her. */
  hoeheGross: '38.2%',
} as const
