import type { OrdnerFarbe } from '../vertrag/postfach'

// Farben eigener Ordner: Name in der Oberfläche und Farbe aus den Designs (keine eigenen Farbcodes).
export const ordnerFarben: Record<OrdnerFarbe, { name: string; klasse: string }> = {
  glut: { name: 'Glut', klasse: 'text-akzent' },
  meer: { name: 'Meer', klasse: 'text-raum-1' },
  flieder: { name: 'Flieder', klasse: 'text-raum-2' },
  sand: { name: 'Sand', klasse: 'text-raum-3' },
  koralle: { name: 'Koralle', klasse: 'text-warnung' },
  salbei: { name: 'Salbei', klasse: 'text-erfolg' },
}
