import { addDays, startOfDay } from 'date-fns'
import { Suspense, lazy } from 'react'
import { useMinute } from './useMinute'
import { useTermine } from './daten'

// Die Karten laden direkt nach dem Start nach, damit der Popover-Baustein nicht im Startpaket steckt (Tempo-Grenze 200 KB).
const UhrAufklapp = lazy(() => import('./UhrAufklapp'))
const WetterAufklapp = lazy(() => import('./WetterAufklapp'))

/** Klein in der Kopfzeile des Gerüsts am PC und Tablet, immer sichtbar: Wetter und Uhrzeit. Ein Klick öffnet dieselbe Karte wie auf Heute. */
export function UhrUndWetter() {
  const jetzt = useMinute()
  const tag = startOfDay(jetzt)
  const termine = useTermine(tag, addDays(tag, 1)).liste ?? []
  return (
    <Suspense>
      <WetterAufklapp jetzt={jetzt} klein />
      <UhrAufklapp termine={termine} jetzt={jetzt} klein />
    </Suspense>
  )
}
