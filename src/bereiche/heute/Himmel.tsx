import type { CSSProperties } from 'react'
import { Flaeche } from '../../bausteine/Flaeche'
import { alsNaechstes, anteilTag, schicht } from '../../logik/heute'
import type { Eintrag } from '../../vertrag/eintrag'

const prozent = (x: number) => `${Math.round(x * 100)} %`
const dauer = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} Std. ${min % 60} Min.` : `${min} Min.`)

/** Die eine große Überschrift: in den nächsten 30 Minuten groß, weiter weg kleiner. */
export function AlsNaechstes({ termine, jetzt }: { termine: readonly Eintrag[]; jetzt: Date }) {
  const n = alsNaechstes(termine, jetzt)
  if (!n) return <p className="heute-ueberschrift-fern">Der Rest des Tages gehört dir.</p>
  return (
    <div aria-live="polite">
      <p className="beschriftung">Als Nächstes · {n.wann}</p>
      <p className={n.nah ? 'heute-ueberschrift' : 'heute-ueberschrift-fern'}>{n.titel}</p>
    </div>
  )
}

function Anteil({ name, wert, rest }: { name: string; wert: number; rest?: string }) {
  return (
    <div className="grid gap-1">
      <div className="flex justify-between gap-3 text-xs text-text-gedaempft">
        <span>{name}</span>
        <span>{rest ?? prozent(wert)}</span>
      </div>
      <span className="anteil" role="meter" aria-label={name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(wert * 100)} style={{ '--anteil': wert } as CSSProperties}>
        <span />
      </span>
    </div>
  )
}

/** Uhrzeit mit Anteil des Tages und, während einer Schicht, Anteil der Schicht. */
export function Uhr({ termine, jetzt }: { termine: readonly Eintrag[]; jetzt: Date }) {
  const s = schicht(termine, jetzt)
  return (
    <Flaeche className="grid w-full max-w-72 gap-3 px-4 py-3">
      <time className="heute-zeit" dateTime={jetzt.toISOString()}>
        {jetzt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
      </time>
      <Anteil name="Tag" wert={anteilTag(jetzt)} />
      {s && <Anteil name={s.titel} wert={s.anteil} rest={`noch ${dauer(s.restMinuten)}`} />}
    </Flaeche>
  )
}
