import { CloudRain, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useEinstellung } from '../../../geruest/einstellungen'
import { einstellungen } from '../../../logik/einstellungen'
import { wetterHeute } from '../../../logik/heute'
import { himmel } from '../../../logik/himmel'
import { holeWetter, type WetterStunde } from '../../../vertrag/wetter'

const breite = einstellungen.find((e) => e.id === 'ort-breite')!
const laenge = einstellungen.find((e) => e.id === 'ort-laenge')!

/** Wetter als Zeile: Symbol, Temperatur, Spanne des Tages, nächster Regen. Aufklappen kommt mit heute-uhr-und-wetter. */
export function Wetter({ jetzt }: { jetzt: Date }) {
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

  if (fehler) return <p className="text-sm text-warnung">{fehler}</p>
  if (!stunden) return <p className="text-sm text-text-gedaempft">Lädt …</p>
  const w = wetterHeute(stunden, jetzt)
  if (!w) return <p className="text-sm text-text-gedaempft">Für heute liegen keine Werte vor.</p>
  // Sonne oder Mond nach dem echten Sonnenstand am eingestellten Ort.
  const Symbol = w.regnet ? CloudRain : himmel(jetzt, ort, 'bogen').tag ? Sun : Moon
  const regen = w.regnet ? 'Regen' : w.regenAb ? `Regen ab ${w.regenAb.getHours()} Uhr` : 'Trocken'
  return (
    <div className="grid gap-1">
      <p className="flex items-center gap-2">
        <Symbol aria-hidden className="size-7 text-text-gedaempft" />
        <span className="heute-zeit">{Math.round(w.grad)}°</span>
      </p>
      <p className="text-sm text-text-gedaempft">
        {regen} · {Math.round(w.hoch)}° / {Math.round(w.tief)}°
      </p>
    </div>
  )
}
