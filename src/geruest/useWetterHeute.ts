import { addDays, startOfDay } from 'date-fns'
import { CloudRain, Moon, Sun } from 'lucide-react'
import { wetterHeute, type WetterHeute } from '../logik/heute'
import { himmel } from '../logik/himmel'
import type { WetterStunde } from '../vertrag/wetter'
import { useWetter } from './daten'
import { useOrt } from './useOrt'

/** Wetter des Tages und das passende Symbol (Sonne oder Mond nach dem Sonnenstand am eingestellten Ort). */
export function useWetterHeute(jetzt: Date): { wetter?: WetterHeute<WetterStunde> | null; Symbol: typeof Sun; fehler?: string } {
  const ort = useOrt()
  const tag = startOfDay(jetzt)
  const { stunden, fehler } = useWetter(tag, addDays(tag, 1))
  const wetter = stunden && wetterHeute(stunden, jetzt)
  const Symbol = wetter?.regnet ? CloudRain : himmel(jetzt, ort, 'bogen').tag ? Sun : Moon
  return { wetter, Symbol, fehler }
}
