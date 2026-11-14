import { addDays } from 'date-fns'
import { tagSchluessel } from '../logik/zeit'
import type { Eintrag } from '../vertrag/eintrag'

const t = '2026-11-11T08:00:00.000Z'
// Fristen liegen relativ zum Tag des ersten Ladens (−1 = gestern), damit „Braucht dich“ immer etwas zeigt.
const e = (id: string, art: Eintrag['art'], titel: string, fristIn?: number): Eintrag => {
  const eintrag: Eintrag = { id, art, titel, erledigt: false, erstellt: t, geaendert: t }
  if (fristIn !== undefined) eintrag.frist = tagSchluessel(addDays(new Date(), fristIn))
  return eintrag
}

export const beispielEintraege = (): Eintrag[] => [
  e('1', 'aufgabe', 'Steuerunterlagen sortieren', 5),
  e('2', 'einkauf', 'Hafermilch und Brot'),
  e('7', 'aufgabe', 'Rückruf Versicherung', -1),
  e('4', 'mail', 'Antwort an die Hausverwaltung', 0),
  e('6', 'aufgabe', 'Fahrrad zur Werkstatt bringen', 1),
  e('5', 'notiz', 'Ideen für den Urlaub im März'),
  { ...e('w1', 'notiz', 'Übergabe Spätschicht'), raum: 'arbeit', text: '- Kasse zählen\n- Liste für Frühschicht auf den Tresen\n- Fenster im Lager schließen' },
  { ...e('w2', 'notiz', 'Telefonliste Praxis'), raum: 'arbeit', text: 'Empfang: 210\nLabor: 230\nTechnik: 299' },
  { ...e('w3', 'notiz', 'Hygieneplan'), raum: 'arbeit', text: '## Täglich\nFlächen abwischen\n\n## Wöchentlich\nKühlschrank prüfen' },
]
