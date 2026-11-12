// Dauern der Bewegung, die im Programm (nicht im CSS) gebraucht werden. Einzige Quelle.

/** So lange steht eine neue Meldung oder ein neuer Rückgängig-Schritt da, dann faltet sie sich (docs/konzept/03-geruest.md). */
export const MELDUNG_MS = 6000

/** So lange muss eine gezogene Kachel über einer anderen an derselben Stelle bleiben, bevor die anderen ausweichen
 *  (docs/FAHRPLAN.md, raster-ziehen). Wert wie beim Android-Startbildschirm, auf dem One UI aufbaut (Launcher3 REORDER_TIMEOUT). */
export const VERWEILEN_MS = 650
