import type { Eintrag } from '../vertrag/eintrag'

const t = '2026-11-11T08:00:00.000Z'
const e = (id: string, art: Eintrag['art'], titel: string): Eintrag => ({ id, art, titel, erledigt: false, erstellt: t, geaendert: t })

export const beispielEintraege: Eintrag[] = [
  e('1', 'aufgabe', 'Steuerunterlagen sortieren'),
  e('2', 'einkauf', 'Hafermilch und Brot'),
  e('3', 'termin', 'Zahnarzt, Donnerstag 9 Uhr'),
  e('4', 'mail', 'Antwort an die Hausverwaltung'),
  e('6', 'aufgabe', 'Fahrrad zur Werkstatt bringen'),
  e('5', 'notiz', 'Ideen für den Urlaub im März'),
]
