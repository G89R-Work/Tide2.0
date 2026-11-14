import { setupWorker } from 'msw/browser'
import { arbeitAntworten } from './arbeit'
import { einstellungenAntworten } from './einstellungen'
import { eintraegeAntworten } from './eintraege'
import { postfachAntworten } from './postfach'
import { termineAntworten } from './termine'
import { wetterAntworten } from './wetter'

// Startet die Attrappe. Später wird je Bereich eine Antwortliste entfernt, sobald der echte Server sie liefert.
export function starteAttrappe() {
  return setupWorker(...termineAntworten, ...eintraegeAntworten, ...einstellungenAntworten, ...wetterAntworten, ...postfachAntworten, ...arbeitAntworten).start()
}
