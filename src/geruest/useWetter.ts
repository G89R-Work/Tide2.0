import { CloudRain, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { einstellungen } from '../logik/einstellungen'
import { wetterHeute, type WetterHeute } from '../logik/heute'
import { himmel } from '../logik/himmel'
import { holeWetter, type WetterStunde } from '../vertrag/wetter'
import { useEinstellung } from './einstellungen'

const breite = einstellungen.find((e) => e.id === 'ort-breite')!
const laenge = einstellungen.find((e) => e.id === 'ort-laenge')!

/** Wetter des Tages und das passende Symbol (Sonne oder Mond nach dem Sonnenstand am eingestellten Ort). */
export function useWetter(jetzt: Date): { wetter?: WetterHeute | null; Symbol: typeof Sun; fehler?: string } {
  const [stunden, setStunden] = useState<WetterStunde[]>()
  const [fehler, setFehler] = useState<string>()
  const ort = { breite: Number(useEinstellung(breite)), laenge: Number(useEinstellung(laenge)) }
  const tag = jetzt.toDateString()
  useEffect(() => {
    let aktuell = true
    const d = new Date(tag)
    holeWetter(d, new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))
      .then((s) => aktuell && setStunden(s))
      .catch((f: unknown) => aktuell && setFehler(`Wetter: ${f instanceof Error ? f.message : String(f)}`))
    return () => {
      aktuell = false
    }
  }, [tag])
  const wetter = stunden && wetterHeute(stunden, jetzt)
  const Symbol = wetter?.regnet ? CloudRain : himmel(jetzt, ort, 'bogen').tag ? Sun : Moon
  return { wetter, Symbol, fehler }
}
