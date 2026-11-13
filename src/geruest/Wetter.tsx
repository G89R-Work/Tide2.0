import type { Sun } from 'lucide-react'
import type { WetterHeute } from '../logik/heute'

/** Wetter als Zeile: Symbol, Temperatur, Spanne des Tages, nächster Regen. Aufgeklappt in `WetterAufklapp`. */
export function Wetter({ wetter: w, Symbol }: { wetter: WetterHeute; Symbol: typeof Sun }) {
  const regen = w.regnet ? 'Regen' : w.regenAb ? `Regen ab ${w.regenAb.getHours()} Uhr` : 'Trocken'
  return (
    <span className="grid gap-1 text-left">
      <span className="flex items-center gap-2">
        <Symbol aria-hidden className="size-7 text-text-gedaempft" />
        <span className="heute-zeit">{Math.round(w.grad)}°</span>
      </span>
      <span className="text-sm text-text-gedaempft">
        {regen} · {Math.round(w.hoch)}° / {Math.round(w.tief)}°
      </span>
    </span>
  )
}
