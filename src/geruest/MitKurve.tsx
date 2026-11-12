import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Group, Panel, useDefaultLayout, usePanelRef } from 'react-resizable-panels'
import { cn } from '../bausteine/cn'
import { Trenner } from '../bausteine/Trenner'
import { freierPlatz } from '../logik/freierPlatz'
import { abstaende } from '../werte/abstaende'
import { kurve } from '../werte/kurve'
import { useGeraet, useKurveOben } from './einstellungen'
import { Gezeitenkurve } from './Gezeitenkurve'
import { Glocke } from './Glocke'
import { KurveKopfzeile } from './KurveEintraege'
import { useMeldungen } from './meldungen'
import { useFrischerSchritt } from './rueckgaengig'

// Am Handy: legt die Gezeitenkurve über oder unter den Inhalt, über die volle Breite.
// Der Inhalt läuft über die ganze Höhe durch und scrollt hinter Kurve und `fuss` (untere Leiste) vorbei;
// beide liegen als Lage darüber. Den verdeckten Platz oben und unten bekommt der Inhalt als --frei-oben/--frei-unten
// (Werkzeug `inhalt-frei` in werte.css), damit sich auch der letzte Eintrag ganz freischieben lässt.
// Höhe am Griff zum Inhalt ziehbar, gemerkt im Browser; Doppelklick auf den Griff stellt den Werkszustand her.
// Ist die Kurve auf der Seite aus (`sichtbar`), stehen Hinweise und Glocke am unteren Rand. Antippen macht die Kurve groß
// und wieder klein. Am PC und Tablet liegt die Kurve unter dem Inhalt (Geruest.tsx).

export function MitKurve({ children, fuss, sichtbar }: { children: ReactNode; fuss?: ReactNode; sichtbar: boolean }) {
  const geraet = useGeraet()
  const oben = useKurveOben()
  const hoehe = useDefaultLayout({ id: `tide.kurve-hoehe@${geraet}`, storage: localStorage })
  const kurveRef = usePanelRef()
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
  }, [oben, sichtbar])
  const groesser = () => {
    const k = kurveRef.current
    if (!k) return
    const gross = k.getSize().asPercentage >= parseFloat(kurve.hoeheGross) - 0.5
    k.resize(gross ? kurve.hoehe : kurve.hoeheGross)
  }

  const griff = (
    <Trenner
      richtung="waagrecht"
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
      // Zwischen Kopfzeile und unterer Leiste.
      className={cn('pointer-events-auto', oben ? 'pt-abstand' : 'pb-abstand')}
    >
      <Gezeitenkurve className="mx-rand" onAntippen={groesser} />
    </Panel>
  )

  const platzFrei = freierPlatz({ verdeckt, kurve: sichtbar ? (oben ? 'oben' : 'unten') : 'aus', kopfzeile: true, rand: abstaende.randPx, abstand: abstaende.abstandPx })

  return (
    <div ref={lage} className="relative min-h-0 flex-1">
      <div className="absolute inset-0 flex" style={{ '--frei-oben': platzFrei.oben, '--frei-unten': platzFrei.unten } as CSSProperties}>
        {children}
      </div>
      <div className="pointer-events-none absolute inset-0 flex flex-col">
        {sichtbar ? (
          <Group key={String(oben)} {...hoehe} orientation="vertical" className="min-h-0 flex-1">
            {oben && streifen}
            {oben && griff}
            <Panel id="inhalt">
              <div ref={frei} className="h-full" />
            </Panel>
            {!oben && griff}
            {!oben && streifen}
          </Group>
        ) : (
          <>
            <div ref={frei} className="min-h-0 flex-1" />
            <HinweiseUnten />
          </>
        )}
        {fuss && <div className="pointer-events-auto">{fuss}</div>}
      </div>
    </div>
  )
}

/** Kurve aus: Hinweise und Glocke am unteren Rand, rechts, damit links nichts verdeckt wird. */
export function HinweiseUnten() {
  const schritt = useFrischerSchritt()
  const meldung = useMeldungen().frisch
  const handy = useGeraet() === 'handy'
  return (
    <div className={cn('flex justify-end', handy && 'px-rand pb-abstand')}>
      <div className="flaeche-leiste pointer-events-auto flex min-w-0 items-center gap-2 py-1 pr-1 pl-3">
        {(schritt || meldung) && <KurveKopfzeile schritt={schritt} meldung={meldung} fehler={[]} className="min-w-0" />}
        <Glocke />
      </div>
    </div>
  )
}
