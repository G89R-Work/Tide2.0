import { setupWorker } from 'msw/browser'
import { einstellungenAntworten } from './einstellungen'
import { eintraegeAntworten } from './eintraege'
import { kachelnAntworten } from './kacheln'
import { termineAntworten } from './termine'

// Startet die Attrappe. Später wird je Bereich eine Antwortliste entfernt, sobald der echte Server sie liefert.
export function starteAttrappe() {
  return setupWorker(...eintraegeAntworten, ...einstellungenAntworten, ...kachelnAntworten, ...termineAntworten).start()
}
