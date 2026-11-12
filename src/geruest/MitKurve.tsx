import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Group, Panel, useDefaultLayout, usePanelRef } from 'react-resizable-panels'
import { Trenner } from '../bausteine/Trenner'
import { kurve } from '../werte/kurve'
import { useGeraet, useKurveOben } from './einstellungen'
import { Gezeitenkurve } from './Gezeitenkurve'

// Legt die Gezeitenkurve über oder unter den Inhalt, über die volle Breite (PC und Handy gleich).
// Der Inhalt läuft über die ganze Höhe durch und scrollt hinter Kurve und `fuss` (untere Leiste am Handy) vorbei;
// beide liegen als Lage darüber. Den verdeckten Platz oben und unten bekommt der Inhalt als --frei-oben/--frei-unten
// (Werkzeug `inhalt-frei` in werte.css), damit sich auch die letzte Kachel ganz freischieben lässt.
// Höhe am Griff zum Inhalt ziehbar, am PC auch die Breite an beiden Seiten. Gemerkt je Geräteart im Browser,
// Doppelklick auf einen Griff stellt den Werkszustand her. `onPlatz` meldet Höhe des Streifens und freien Platz links
// (für die Seitenleiste, siehe src/logik/leisteLage.ts).
export type Platz = { hoehe: number; links: number }

export function MitKurve({ children, fuss, onPlatz }: { children: ReactNode; fuss?: ReactNode; onPlatz?: (platz: Platz) => void }) {
  const geraet = useGeraet()
  const oben = useKurveOben()
  const hoehe = useDefaultLayout({ id: `tide.kurve-hoehe@${geraet}`, storage: localStorage })
  const kurveRef = usePanelRef()
  const platz = useRef<Platz>({ hoehe: 0, links: 0 })
  const lage = useRef<HTMLDivElement>(null)
  const frei = useRef<HTMLDivElement>(null)
  const [verdeckt, setVerdeckt] = useState({ oben: 0, unten: 0 })

  // Verdeckt ist, was nicht im leeren Feld „inhalt" zwischen Kurve und Rand liegt. Ändert sich nur beim Ziehen und bei Größenänderung.
  useLayoutEffect(() => {
    const feld = frei.current!
    const messen = () => {
      const a = lage.current!.getBoundingClientRect()
      const f = feld.getBoundingClientRect()
      const neu = { oben: Math.round(f.top - a.top), unten: Math.round(a.bottom - f.bottom) }
      setVerdeckt((alt) => (alt.oben === neu.oben && alt.unten === neu.unten ? alt : neu))
    }
    const beobachter = new ResizeObserver(messen)
    beobachter.observe(feld)
    beobachter.observe(lage.current!)
    return () => beobachter.disconnect()
  }, [oben])
  const melde = (neu: Partial<Platz>) => {
    platz.current = { ...platz.current, ...neu }
    onPlatz?.(platz.current)
  }

  const griff = (
    <Trenner
      richtung="waagrecht"
      title="Ziehen ändert die Höhe der Kurve, Doppelklick stellt sie zurück"
      onDoubleClick={() => kurveRef.current?.resize(kurve.hoehe)}
      className="pointer-events-auto"
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
      className={oben ? 'pointer-events-auto pt-2' : 'pointer-events-auto pb-2'}
    >
      {geraet === 'pc' ? <ZiehbareBreite onLinks={(links) => melde({ links })} /> : <Gezeitenkurve className="mx-2" />}
    </Panel>
  )

  return (
    <div ref={lage} className="relative min-h-0 flex-1">
      <div className="absolute inset-0 flex" style={{ '--frei-oben': verdeckt.oben, '--frei-unten': verdeckt.unten } as CSSProperties}>
        {children}
      </div>
      <div className="pointer-events-none absolute inset-0 flex flex-col">
        <Group key={String(oben)} {...hoehe} orientation="vertical" className="min-h-0 flex-1">
          {oben && streifen}
          {oben && griff}
          <Panel id="inhalt">
            <div ref={frei} className="h-full" />
          </Panel>
          {!oben && griff}
          {!oben && streifen}
        </Group>
        {fuss && <div className="pointer-events-auto">{fuss}</div>}
      </div>
    </div>
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
