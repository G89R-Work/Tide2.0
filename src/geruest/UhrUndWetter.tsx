import { addDays, startOfDay } from 'date-fns'
import { useId } from 'react'
import { Knopf } from '../bausteine/Knopf'
import { uhrzeit } from './format'
import { Uhr } from './Uhr'
import { useMinute } from './useMinute'
import { useTermine } from './daten'
import { useWetterHeute } from './useWetterHeute'
import { Wetter } from './Wetter'

/** Klein in der Kopfzeile des Gerüsts am PC und Tablet, immer sichtbar: Wetter und Uhrzeit. Ein Klick zeigt die volle Ansicht wie auf Heute. */
export function UhrUndWetter() {
  const jetzt = useMinute()
  const tag = startOfDay(jetzt)
  const termine = useTermine(tag, addDays(tag, 1)).liste ?? []
  const { wetter, Symbol } = useWetterHeute(jetzt)
  const wetterId = useId()
  const uhrId = useId()
  return (
    <>
      {wetter && (
        <Knopf art="leise" groesse="klein" popoverTarget={wetterId} aria-label={`Wetter: ${Math.round(wetter.grad)} Grad`} className="text-sm text-text">
          <Symbol aria-hidden className="size-4" />
          {Math.round(wetter.grad)}°
        </Knopf>
      )}
      <Knopf art="leise" groesse="klein" popoverTarget={uhrId} aria-label={`Uhrzeit ${uhrzeit(jetzt)}`} className="text-sm tabular-nums text-text">
        {uhrzeit(jetzt)}
      </Knopf>
      <div id={wetterId} popover="auto" aria-label="Wetter" className="flaeche-schwebend schwebende-karte p-4">
        <Wetter jetzt={jetzt} />
      </div>
      <div id={uhrId} popover="auto" aria-label="Uhr" className="flaeche-schwebend schwebende-karte p-4">
        <Uhr termine={termine} jetzt={jetzt} />
      </div>
    </>
  )
}
