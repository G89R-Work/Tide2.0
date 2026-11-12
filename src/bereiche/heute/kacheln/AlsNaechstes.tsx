import { alsNaechstes } from '../../../logik/heute'
import type { Eintrag } from '../../../vertrag/eintrag'
import { uhrzeit } from '../format'

/** Die eine große Überschrift: in den nächsten 30 Minuten groß, weiter weg kleiner. */
export function AlsNaechstes({ termine, jetzt, fehler }: { termine: readonly Eintrag[]; jetzt: Date; fehler?: string }) {
  if (fehler) return <p className="text-sm text-warnung">{fehler}</p>
  const n = alsNaechstes(termine, jetzt)
  if (!n) return <p className="heute-ueberschrift-fern">Der Rest des Tages gehört dir.</p>
  return (
    <div aria-live="polite">
      <p className={n.nah ? 'heute-ueberschrift' : 'heute-ueberschrift-fern'}>{n.titel}</p>
      <p className="mt-2 text-lg">
        {uhrzeit(n.beginn)} Uhr · {n.wann}
      </p>
    </div>
  )
}
