import type { CSSProperties } from 'react'
import { einstellung } from '../logik/einstellungen'
import { himmel, mondPfad, type Lage } from '../logik/himmel'
import { useEinstellung } from './einstellungen'
import { useGezeigteZeit } from './gezeigteZeit'
import { useMinute } from './useMinute'
import { useOrt } from './useOrt'

// Himmel, Sonne, Mond und Wellen hinter der ganzen App (docs/konzept/05-design.md).
// Rückt einmal pro Minute weiter oder mit der gezeigten Uhrzeit der Gezeitenkurve; dazwischen läuft keine Animation.
const e = {
  bahn: einstellung('bahn'),
  mondNachts: einstellung('mond-nachts'),
  tageszeit: einstellung('hintergrund-tageszeit'),
  wellenHoehe: einstellung('wellen-hoehe'),
}

/**
 * Fünf Wellenlagen, hinten lang und flach, vorne kürzer. Fläche 1000 × 260, das Seitenverhältnis am PC.
 * In der Breite darf sie gedehnt werden, schmaler als dieses Verhältnis wird sie nie: Am Handy und bei großer Höhe
 * wird sie stattdessen links und rechts abgeschnitten (Breite in `werte.css`, Hilfsmittel `wellen`).
 */
const HOEHE = 260
const wellen = [0, 1, 2, 3, 4].map((i) => {
  const hoehe = Math.round((10 + i * 18) * 2.6)
  const stueck = 1000 / (1.4 + i * 0.5)
  const ausschlag = Math.round((12 - i * 1.5) * 2.6)
  const start = -Math.round(stueck * ((i * 0.37) % 1))
  let pfad = `M ${start} ${hoehe} Q ${Math.round(start + stueck / 4)} ${hoehe - ausschlag} ${Math.round(start + stueck / 2)} ${hoehe}`
  for (let x = start + stueck; x <= 1000 + stueck; x += stueck / 2) pfad += ` T ${Math.round(x)} ${hoehe}`
  return `${pfad} V ${HOEHE} H ${start} Z`
})

const lage = (l: Lage) => ({ '--x': l.x, '--y': l.y }) as CSSProperties

export function Hintergrund() {
  const minute = useMinute()
  // Scrollt jemand in der Gezeitenkurve, gilt deren Uhrzeit.
  const zeit = useGezeigteZeit() ?? minute
  const bahn = useEinstellung(e.bahn)
  const ort = useOrt()
  const mondNachts = useEinstellung(e.mondNachts)
  const folgtTageszeit = useEinstellung(e.tageszeit)
  const wellenHoehe = useEinstellung(e.wellenHoehe)
  const h = himmel(zeit, ort, bahn)
  const mondZeigen = h.mond.sichtbar && !(mondNachts && h.tag)
  // Ohne „Folgt der Tageszeit“ bleibt der Himmel wie mittags.
  const licht = (
    folgtTageszeit ? { '--licht': h.licht, '--waerme': h.waerme, '--mond-licht': h.mondLicht } : { '--licht': 1, '--waerme': 0, '--mond-licht': 0 }
  ) as CSSProperties

  return (
    <div aria-hidden className="hintergrund" data-wellen={wellenHoehe} style={licht}>
      {h.sonne.sichtbar && <div className="himmelskoerper lichthof" style={lage(h.sonne)} />}
      <div className="nacht" />
      <div className="daemmerung" />
      {mondZeigen && <div className="himmelskoerper mondschein" style={lage(h.mond)} />}
      {h.sonne.sichtbar && <div className="himmelskoerper sonne" style={lage(h.sonne)} />}
      {mondZeigen && (
        <svg className="himmelskoerper mond" viewBox="-1 -1 2 2" style={lage(h.mond)}>
          <circle r="1" fill="var(--mond-dunkel)" />
          <path d={mondPfad(h.mond.beleuchtet)} transform={`rotate(${h.mond.neigung.toFixed(1)})`} fill="var(--sonne)" />
        </svg>
      )}
      <svg className="wellen" viewBox={`0 0 1000 ${HOEHE}`} preserveAspectRatio="none">
        {wellen.map((d, i) => (
          <path key={i} d={d} fill={`var(--welle-${i + 1})`} />
        ))}
      </svg>
    </div>
  )
}
