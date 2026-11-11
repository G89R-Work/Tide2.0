import { setupWorker } from 'msw/browser'
import { eintraegeAntworten } from './eintraege'

// Startet die Attrappe. Später wird je Bereich eine Antwortliste entfernt, sobald der echte Server sie liefert.
export function starteAttrappe() {
  return setupWorker(...eintraegeAntworten).start()
}
