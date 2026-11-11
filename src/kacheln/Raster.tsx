import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type Ref } from 'react'
import { GridLayout, useContainerWidth } from 'react-grid-layout'
import type { Layout, ResizeHandleAxis } from 'react-grid-layout'
import { cn } from '../bausteine/cn'
import { Flaeche } from '../bausteine/Flaeche'
import { useGeraet } from '../geruest/einstellungen'
import { alsLayout, ausLayout, groesseAendern, spalten, verschiebe, type KachelPlan } from '../logik/kacheln'
import { kachelRaster } from '../werte/kacheln'
import { useAnordnung } from './anordnung'
import { bearbeitenBeenden, bearbeitenStarten, meldeZuruecksetzer, useBearbeiten } from './bearbeiten'
import { BearbeitenLeiste } from './BearbeitenLeiste'
import { KachelMenue, type MenueOrt } from './KachelMenue'

// Kacheln einer Seite (docs/konzept/04-kacheln.md). Verschieben und Größe ändern macht react-grid-layout;
// hier nur der Bearbeiten-Modus drumherum: langer Druck, Griffpunkte, Rechtsklick-Menü, Tastatur, Speichern.

const griffKlassen: Partial<Record<ResizeHandleAxis, string>> = { se: 'griff griff-se', e: 'griff griff-e', s: 'griff griff-s' }

const pfeile: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

type Props = {
  seite: string
  /** Werkszustand der Seite; muss gleich bleiben (Konstante im Bereich). */
  kacheln: readonly KachelPlan[]
  /** Inhalt je Kachel-Kennung. */
  inhalt: Readonly<Record<string, ReactNode>>
}

export function Raster({ seite, kacheln, inhalt }: Props) {
  const geraet = useGeraet()
  const handy = geraet === 'handy'
  const { anordnung, fehler, kannZurueck, aendern, zurueck, zuruecksetzen } = useAnordnung(seite, geraet, kacheln)
  const bearbeiten = useBearbeiten()
  const { width, containerRef, mounted } = useContainerWidth()
  const [menue, setMenue] = useState<MenueOrt | null>(null)
  const druck = useRef<{ zeit: number; x: number; y: number } | null>(null)

  // Zurücksetzen per Aktion wirkt auf diese Seite. Beim Verlassen endet der Bearbeiten-Modus.
  useEffect(() => {
    meldeZuruecksetzer(zuruecksetzen)
    return () => meldeZuruecksetzer(null)
  }, [zuruecksetzen])
  useEffect(() => bearbeitenBeenden, [])

  useEffect(() => {
    if (!bearbeiten) return
    const taste = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && !e.defaultPrevented && bearbeitenBeenden()
    addEventListener('keydown', taste)
    return () => removeEventListener('keydown', taste)
  }, [bearbeiten])

  if (!anordnung) return <div ref={containerRef} />

  const uebernehmen = (layout: Layout) => aendern(ausLayout(anordnung, layout))

  const drueckEnde = () => {
    if (druck.current) clearTimeout(druck.current.zeit)
    druck.current = null
  }
  const drueckStart = (e: PointerEvent, id: string) => {
    drueckEnde()
    if (e.pointerType === 'mouse' || bearbeiten) return
    const { clientX: x, clientY: y } = e
    // Langer Druck: Bearbeiten-Modus und dasselbe Menü wie beim Rechtsklick.
    const zeit = window.setTimeout(() => {
      navigator.vibrate?.(10)
      bearbeitenStarten()
      setMenue({ id, x, y })
    }, kachelRaster.langerDruckMs)
    druck.current = { zeit, x, y }
  }
  const drueckWeg = (e: PointerEvent) => {
    const d = druck.current
    if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > kachelRaster.wackelPx) drueckEnde()
  }

  const taste = (e: KeyboardEvent, id: string) => {
    if (!bearbeiten) {
      if (e.key === 'F2') {
        e.preventDefault()
        bearbeitenStarten()
        document.getElementById(`kachel-${seite}-${id}`)?.focus()
      }
      return
    }
    if (e.target !== e.currentTarget) return
    const p = pfeile[e.key]
    if (p) {
      e.preventDefault()
      aendern(e.shiftKey ? groesseAendern(anordnung, kacheln, geraet, id, p[0], p[1]) : verschiebe(anordnung, kacheln, geraet, id, p[0], p[1]))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      bearbeitenBeenden()
    }
  }

  const sichtbar = kacheln.filter((k) => !anordnung.versteckt.includes(k.id))

  return (
    <div className="mt-4">
      {bearbeiten && (
        <BearbeitenLeiste
          versteckt={kacheln.filter((k) => anordnung.versteckt.includes(k.id))}
          anordnung={anordnung}
          plan={kacheln}
          geraet={geraet}
          aendern={aendern}
          kannZurueck={kannZurueck}
          zurueck={zurueck}
          zuruecksetzen={zuruecksetzen}
        />
      )}
      {fehler && <p className="mb-2 text-sm text-warnung">{fehler}</p>}
      <div ref={containerRef}>
        {mounted && (
          <GridLayout
            width={width}
            layout={alsLayout(anordnung, kacheln, geraet)}
            gridConfig={{ cols: spalten[geraet], rowHeight: kachelRaster.zeile, margin: [kachelRaster.abstand, kachelRaster.abstand], containerPadding: [0, 0] }}
            dragConfig={{ enabled: bearbeiten, handle: handy ? undefined : '.kachel-kopf', cancel: '.griff', threshold: 3 }}
            resizeConfig={{
              enabled: bearbeiten,
              handles: bearbeiten ? ['e', 's', 'se'] : [],
              handleComponent: (achse: ResizeHandleAxis, ref: Ref<HTMLElement>) => <span ref={ref as Ref<HTMLSpanElement>} className={griffKlassen[achse]} aria-hidden />,
            }}
            onDragStop={uebernehmen}
            onResizeStop={uebernehmen}
          >
            {sichtbar.map((k) => (
              <div key={k.id}>
                <Flaeche
                  id={`kachel-${seite}-${k.id}`}
                  role="group"
                  aria-label={bearbeiten ? `${k.name}. Pfeiltasten verschieben, Umschalt und Pfeiltasten ändern die Größe, Eingabe beendet.` : k.name}
                  aria-keyshortcuts={bearbeiten ? undefined : 'F2'}
                  tabIndex={bearbeiten ? 0 : -1}
                  className={cn('flex h-full flex-col overflow-hidden', bearbeiten ? 'kachel-bearbeiten focus-visible:kachel-gewaehlt' : 'outline-none')}
                  onKeyDown={(e) => taste(e, k.id)}
                  onPointerDown={(e) => drueckStart(e, k.id)}
                  onPointerMove={drueckWeg}
                  onPointerUp={drueckEnde}
                  onPointerCancel={drueckEnde}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    // Auf dem Handy meldet der Browser den langen Druck teils zusätzlich als Rechtsklick.
                    if (druck.current) return
                    setMenue({ id: k.id, x: e.clientX, y: e.clientY })
                  }}
                >
                  <div className={cn('kachel-kopf beschriftung px-4 pt-3 pb-2', bearbeiten && !handy && 'cursor-grab')}>{k.name}</div>
                  <div className={cn('min-h-0 flex-1 overflow-auto px-4 pb-4', bearbeiten && 'pointer-events-none')}>{inhalt[k.id]}</div>
                </Flaeche>
              </div>
            ))}
          </GridLayout>
        )}
      </div>
      <KachelMenue ort={menue} schliessen={() => setMenue(null)} anordnung={anordnung} plan={kacheln} geraet={geraet} aendern={aendern} zuruecksetzen={zuruecksetzen} />
    </div>
  )
}
