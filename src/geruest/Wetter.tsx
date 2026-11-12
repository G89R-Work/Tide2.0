import { useWetter } from './useWetter'

/** Wetter als Zeile: Symbol, Temperatur, Spanne des Tages, nächster Regen. Aufklappen kommt mit heute-uhr-und-wetter. */
export function Wetter({ jetzt }: { jetzt: Date }) {
  const { wetter: w, Symbol, fehler } = useWetter(jetzt)
  if (fehler) return <p className="text-sm text-warnung">{fehler}</p>
  if (w === undefined) return <p className="text-sm text-text-gedaempft">Lädt …</p>
  if (w === null) return <p className="text-sm text-text-gedaempft">Für heute liegen keine Werte vor.</p>
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
