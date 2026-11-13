import { einstellung } from '../logik/einstellungen'
import type { Standort } from '../logik/himmel'
import { useEinstellung } from './einstellungen'

const breite = einstellung('ort-breite')
const laenge = einstellung('ort-laenge')

/** Der eingestellte Ort für Sonne, Mond und Wetter. */
export function useOrt(): Standort {
  return { breite: useEinstellung(breite), laenge: useEinstellung(laenge) }
}
