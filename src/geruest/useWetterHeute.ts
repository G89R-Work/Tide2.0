import { addDays, startOfDay } from 'date-fns'
import { CloudRain, Moon, Sun } from 'lucide-react'
import { einstellung } from '../logik/einstellungen'
import { wetterHeute, type WetterHeute } from '../logik/heute'
import { himmel } from '../logik/himmel'
import { useWetter } from './daten'
import { useEinstellung } from './einstellungen'

const breite = einstellung('ort-breite')
const laenge = einstellung('ort-laenge')

/** Wetter des Tages und das passende Symbol (Sonne oder Mond nach dem Sonnenstand am eingestellten Ort). */
export function useWetterHeute(jetzt: Date): { wetter?: WetterHeute | null; Symbol: typeof Sun; fehler?: string } {
  const ort = { breite: useEinstellung(breite), laenge: useEinstellung(laenge) }
  const tag = startOfDay(jetzt)
  const { stunden, fehler } = useWetter(tag, addDays(tag, 1))
  const wetter = stunden && wetterHeute(stunden, jetzt)
  const Symbol = wetter?.regnet ? CloudRain : himmel(jetzt, ort, 'bogen').tag ? Sun : Moon
  return { wetter, Symbol, fehler }
}
