import { useRef, type ReactNode } from 'react'
import { Group, Panel, useDefaultLayout, usePanelRef } from 'react-resizable-panels'
import { Trenner } from '../bausteine/Trenner'
import { kurve } from '../werte/kurve'
import { useGeraet, useKurveOben } from './einstellungen'
import { Gezeitenkurve } from './Gezeitenkurve'

// Legt die Gezeitenkurve über oder unter den Inhalt, über die volle Breite (PC und Handy gleich).
// Höhe am Griff zum Inhalt ziehbar, am PC auch die Breite an beiden Seiten. Gemerkt je Geräteart im Browser,
// Doppelklick auf einen Griff stellt den Werkszustand her. `onPlatz` meldet Höhe des Streifens und freien Platz links
// (für die Seitenleiste, siehe src/logik/leisteLage.ts).
export type Platz = { hoehe: number; links: number }

export function MitKurve({ children, onPlatz }: { children: ReactNode; onPlatz?: (platz: Platz) => void }) {
  const geraet = useGeraet()
  const oben = useKurveOben()
  const hoehe = useDefaultLayout({ id: `tide.kurve-hoehe@${geraet}`, storage: localStorage })
  const kurveRef = usePanelRef()
  const platz = useRef<Platz>({ hoehe: 0, links: 0 })
  const melde = (neu: Partial<Platz>) => {
    platz.current = { ...platz.current, ...neu }
    onPlatz?.(platz.current)
  }

  const griff = (
    <Trenner
      richtung="waagrecht"
      title="Ziehen ändert die Höhe der Kurve, Doppelklick stellt sie zurück"
      onDoubleClick={() => kurveRef.current?.resize(kurve.hoehe)}
    />
  )
  const streifen = (
    <Panel
      id="kurve"
      panelRef={kurveRef}
      minSize={kurve.hoeheMin}
      maxSize={kurve.hoeheMax}
      defaultSize={kurve.hoehe}
      onResize={(g) => melde({ hoehe: Math.round(g.inPixels) })}
      className={oben ? 'pt-2' : 'pb-2'}
    >
      {geraet === 'pc' ? <ZiehbareBreite onLinks={(links) => melde({ links })} /> : <Gezeitenkurve className="mx-2" />}
    </Panel>
  )

  return (
    <Group key={String(oben)} {...hoehe} orientation="vertical" className="min-h-0 flex-1">
      {oben && streifen}
      {oben && griff}
      <Panel id="inhalt" className="flex">
        {children}
      </Panel>
      {!oben && griff}
      {!oben && streifen}
    </Group>
  )
}

/** Links und rechts je eine leere Fläche, ab Werk null breit; die Griffe dazwischen verschieben die Ränder der Kurve. */
function ZiehbareBreite({ onLinks }: { onLinks: (px: number) => void }) {
  const breite = useDefaultLayout({ id: 'tide.kurve-breite', storage: localStorage })
  const links = usePanelRef()
  const rechts = usePanelRef()
  const titel = 'Ziehen ändert die Breite der Kurve, Doppelklick stellt die volle Breite her'
  return (
    <Group {...breite} orientation="horizontal" className="h-full">
      <Panel id="links" panelRef={links} minSize="0%" defaultSize="0%" onResize={(g) => onLinks(Math.round(g.inPixels))} />
      <Trenner title={titel} onDoubleClick={() => links.current?.resize('0%')} />
      <Panel id="kurve" minSize={kurve.breiteMin}>
        <Gezeitenkurve />
      </Panel>
      <Trenner title={titel} onDoubleClick={() => rechts.current?.resize('0%')} />
      <Panel id="rechts" panelRef={rechts} minSize="0%" defaultSize="0%" />
    </Group>
  )
}
