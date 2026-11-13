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
  /** Kleinster Abstand zweier Punkte (px), darunter werden sie gebündelt: eine Fingerbreite. */
  fingerPx: 44,
  /** Breitestes Schildchen an einem Punkt (px); schmaler als `schildMinPx` wird es weggelassen. */
  schildMaxPx: 200,
  schildMinPx: 40,
  /** So weit (px) bleibt ein Schild vor der Mitte zum nächsten Punkt, damit sich zwei nie berühren. */
  schildLueckePx: 8,
  /** Platz für „Jetzt 23:06“ und „9 offen treiben mit“ in der oberen Zeile (px). */
  jetztBreitePx: 200,
  /** Kleinster Abstand zweier Wetterangaben („12° · 20 % Regen“) (px). */
  wetterAbstandPx: 120,
  /** Erst ab dieser Strecke (px) wird aus einem Druck ein Ziehen; darunter ist es ein Klick. */
  ziehAbPx: 6,
} as const
