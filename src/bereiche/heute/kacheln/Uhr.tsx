import type { CSSProperties } from 'react'
import { anteilTag, schicht } from '../../../logik/heute'
import type { Eintrag } from '../../../vertrag/eintrag'
import { uhrzeit } from '../format'

const dauer = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} Std. ${min % 60} Min.` : `${min} Min.`)

function Anteil({ name, wert, text }: { name: string; wert: number; text: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-sm text-text-gedaempft">{text}</span>
      <span className="anteil" role="meter" aria-label={name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(wert * 100)} style={{ '--anteil': wert } as CSSProperties}>
        <span />
      </span>
    </div>
  )
}

/** Uhrzeit mit Anteil des Tages und, während einer Schicht, Anteil der Schicht. */
export function Uhr({ termine, jetzt }: { termine: readonly Eintrag[]; jetzt: Date }) {
  const s = schicht(termine, jetzt)
  const tag = anteilTag(jetzt)
  return (
    <div className="grid gap-2">
      <time className="heute-zeit" dateTime={jetzt.toISOString()}>
        {uhrzeit(jetzt)}
      </time>
      <Anteil name="Anteil des Tages" wert={tag} text={`${Math.round(tag * 100)} % vom Tag`} />
      {s && <Anteil name={`Anteil: ${s.titel}`} wert={s.anteil} text={`${s.titel} · noch ${dauer(s.restMinuten)}`} />}
    </div>
  )
}
