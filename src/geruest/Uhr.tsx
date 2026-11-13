import type { CSSProperties } from 'react'
import { anteilTag, schicht } from '../logik/heute'
import type { Eintrag } from '../vertrag/eintrag'
import { dauerText, uhrzeit } from './format'

/** Uhrzeit mit einem Anteil: außerhalb einer Schicht der Anteil des Tages, in einer Schicht der Anteil der Schicht
 *  (mit `tagZeigen` auch dort der Tag). Umschalten und mehr steckt in der Karte (`UhrAufklapp`). */
export function Uhr({ termine, jetzt, tagZeigen = false }: { termine: readonly Eintrag[]; jetzt: Date; tagZeigen?: boolean }) {
  const s = schicht(termine, jetzt)
  const tag = anteilTag(jetzt)
  const zeigeSchicht = s !== null && !tagZeigen
  const wert = zeigeSchicht ? s.anteil : tag
  const text = zeigeSchicht ? `${Math.round(s.anteil * 100)} % ${s.titel} · noch ${dauerText(s.restMinuten)}` : `${Math.round(tag * 100)} % vom Tag`
  return (
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
}
