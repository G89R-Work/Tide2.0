import type { CSSProperties } from 'react'
import { einstellungen } from '../logik/einstellungen'
import { himmel, mondPfad, type Bahn, type Lage } from '../logik/himmel'
import { useEinstellung } from './einstellungen'
import { useMinute } from './useMinute'

// Himmel, Sonne, Mond und Wellen hinter der ganzen App (docs/konzept/05-design.md).
// Rückt einmal pro Minute weiter; dazwischen läuft keine Animation.
const nach = (id: string) => einstellungen.find((e) => e.id === id)!
const e = {
  bahn: nach('bahn'),
  breite: nach('ort-breite'),
  laenge: nach('ort-laenge'),
  mondNachts: nach('mond-nachts'),
  tageszeit: nach('hintergrund-tageszeit'),
}

/** Fünf Wellenlagen, hinten hoch und ruhig, vorne tief. Fläche 1000 × 100, verzerrt auf die Bildbreite. */
const wellen = [0, 1, 2, 3, 4].map((i) => {
  const hoehe = 6 + i * 19
  const stueck = 1000 / (4 + i * 2)
  const ausschlag = 5 - i * 0.6
  let pfad = `M ${-i * 37} ${hoehe} Q ${stueck / 4 - i * 37} ${hoehe - ausschlag} ${stueck / 2 - i * 37} ${hoehe}`
  for (let x = stueck - i * 37; x <= 1000 + stueck; x += stueck / 2) pfad += ` T ${x} ${hoehe}`
  return `${pfad} V 100 H ${-i * 37} Z`
})

const lage = (l: Lage) => ({ '--x': l.x, '--y': l.y }) as CSSProperties

export function Hintergrund() {
  const zeit = useMinute()
  const bahn = useEinstellung(e.bahn) as Bahn
  const ort = { breite: Number(useEinstellung(e.breite)), laenge: Number(useEinstellung(e.laenge)) }
  const mondNachts = useEinstellung(e.mondNachts) === true
  const folgtTageszeit = useEinstellung(e.tageszeit) === true
  const h = himmel(zeit, ort, bahn)
  const mondZeigen = h.mond.sichtbar && !(mondNachts && h.tag)

  return (
    <div aria-hidden className="hintergrund" style={{ '--licht': folgtTageszeit ? h.licht : 1 } as CSSProperties}>
      <div className="nacht" />
      {h.sonne.sichtbar && <div className="himmelskoerper sonne" style={lage(h.sonne)} />}
      {mondZeigen && (
        <svg className="himmelskoerper mond" viewBox="-1 -1 2 2" style={lage(h.mond)}>
          <circle r="1" fill="var(--mond-dunkel)" />
          <path d={mondPfad(h.mond.beleuchtet)} transform={`rotate(${h.mond.neigung.toFixed(1)})`} fill="var(--sonne)" />
        </svg>
      )}
      <svg className="wellen" viewBox="0 0 1000 100" preserveAspectRatio="none">
        {wellen.map((d, i) => (
          <path key={i} d={d} fill={`var(--welle-${i + 1})`} />
        ))}
      </svg>
    </div>
  )
}
