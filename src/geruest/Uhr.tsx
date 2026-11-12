import { useState, type CSSProperties } from 'react'
import { Knopf } from '../bausteine/Knopf'
import { anteilTag, schicht } from '../logik/heute'
import type { Eintrag } from '../vertrag/eintrag'
import { uhrzeit } from './format'

const dauer = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} Std. ${min % 60} Min.` : `${min} Min.`)

/** Uhrzeit mit einem Anteil: außerhalb einer Schicht der Anteil des Tages, in einer Schicht der Anteil der Schicht.
 *  Nur in einer Schicht schaltet ein Klick zwischen Schicht und Tag um. */
export function Uhr({ termine, jetzt }: { termine: readonly Eintrag[]; jetzt: Date }) {
  const [tagZeigen, setTagZeigen] = useState(false)
  const s = schicht(termine, jetzt)
  const tag = anteilTag(jetzt)
  const zeigeSchicht = s !== null && !tagZeigen
  const wert = zeigeSchicht ? s.anteil : tag
  const text = zeigeSchicht ? `${Math.round(s.anteil * 100)} % ${s.titel} · noch ${dauer(s.restMinuten)}` : `${Math.round(tag * 100)} % vom Tag`
  const inhalt = (
    <span className="grid w-full gap-1.5 text-left">
      <time className="heute-zeit" dateTime={jetzt.toISOString()}>
        {uhrzeit(jetzt)}
      </time>
      <span className="text-sm text-text-gedaempft">{text}</span>
      <span className="anteil" role="meter" aria-label={zeigeSchicht ? `Anteil: ${s.titel}` : 'Anteil des Tages'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(wert * 100)} style={{ '--anteil': wert } as CSSProperties}>
        <span />
      </span>
    </span>
  )
  if (!s) return inhalt
  return (
    <Knopf art="leise" className="h-auto w-full px-0 py-0 whitespace-normal text-text hover:bg-durchsichtig" title={zeigeSchicht ? 'Zum Anteil des Tages' : 'Zum Anteil der Schicht'} onClick={() => setTagZeigen(!tagZeigen)}>
      {inhalt}
    </Knopf>
  )
}
