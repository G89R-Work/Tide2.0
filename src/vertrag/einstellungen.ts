// Vertrag: Einstellungen des angemeldeten Nutzers. Der Server merkt nur Abweichungen vom Standard;
// was je Geräteart gilt, steht unter „<id>@pc" bzw. „<id>@handy" (siehe src/logik/einstellungen.ts).
// Das Schema entsteht aus der Einstellungsliste: unbekannte Schlüssel und ungültige Werte fallen weg.
import { werteSchema, type Werte, type WerteAenderung } from '../logik/einstellungen'
import { anfrage } from './anfrage'

const adresse = '/api/einstellungen'

export function holeEinstellungen(): Promise<Werte> {
  return anfrage(werteSchema, 'Einstellungen holen', adresse)
}

/** Ändert einzelne Werte; null heißt „zurück auf Standard". Antwort: der ganze neue Stand. */
export function aendereEinstellungen(aenderung: WerteAenderung): Promise<Werte> {
  return anfrage(werteSchema, 'Einstellungen speichern', adresse, 'PATCH', aenderung)
}
