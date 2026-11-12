import { Ellipsis } from 'lucide-react'
import { useEffect, useState, type KeyboardEvent, type MouseEvent, type ReactNode, type Ref } from 'react'
import { createPortal } from 'react-dom'
import { GridLayout, useContainerWidth } from 'react-grid-layout'
import { noCompactor } from 'react-grid-layout/core'
import type { Layout, ResizeHandleAxis } from 'react-grid-layout'
import { cn } from '../bausteine/cn'
import { Flaeche } from '../bausteine/Flaeche'
import { Knopf } from '../bausteine/Knopf'
import { useGeraet } from '../geruest/einstellungen'
import { useFreieHoehe } from '../geruest/freieHoehe'
import { alsLayout, ausLayout, groesseAendern, hatHintergrund, spaltenVon, verschiebe, zeilenHoehe, type KachelPlan } from '../logik/kacheln'
import { abstaende } from '../werte/abstaende'
import { kachelRaster } from '../werte/kacheln'
import { useAnordnung } from './anordnung'
import { bearbeitenBeenden, meldeZuruecksetzer, useBearbeiten, useBearbeitenOrt } from './bearbeiten'
import { BearbeitenLeiste } from './BearbeitenLeiste'
import { KachelMenue, type MenueOrt } from './KachelMenue'

// Kacheln einer Seite (docs/konzept/04-kacheln.md). Verschieben und Größe ändern macht react-grid-layout;
// hier nur der Bearbeiten-Modus drumherum: Griff, Griffpunkte, Menü der Kachel, Tastatur, Speichern.
// Außerhalb des Modus gibt es weder langen Druck noch Rechtsklick-Menü. Im Modus sieht die Seite genauso aus wie danach:
// das Bedienfeld liegt außerhalb (`BearbeitenOrt`), Rahmen und Griffpunkte liegen innerhalb der Kacheln.
// Eine Bildschirmhöhe fasst immer gleich viele Zeilen (`zeilenHoehe`), die unterste endet einen Abstand vor der Kurve.

const griffKlassen: Partial<Record<ResizeHandleAxis, string>> = { se: 'griff griff-se', e: 'griff griff-e', s: 'griff griff-s' }

const pfeile: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

type Props = {
  seite: string
  /** Werkszustand der Seite; muss gleich bleiben (Konstante im Bereich). */
  kacheln: readonly KachelPlan[]
  /** Inhalt je Kachel-Kennung; null heißt „gerade leer“: die Kachel ist außerhalb des Bearbeiten-Modus unsichtbar. */
  inhalt: Readonly<Record<string, ReactNode>>
}

export function Raster({ seite, kacheln, inhalt }: Props) {
  const geraet = useGeraet()
  const handy = geraet === 'handy'
  const { anordnung, fehler, aendern, zuruecksetzen } = useAnordnung(seite, geraet, kacheln)
  const bearbeiten = useBearbeiten()
  const bedienOrt = useBearbeitenOrt()
  const zeile = zeilenHoehe(useFreieHoehe(), kachelRaster.zeilenJeBildschirm[geraet], abstaende.abstandPx)
  const { width, containerRef, mounted } = useContainerWidth()
  const [menue, setMenue] = useState<MenueOrt | null>(null)

  // Zurücksetzen per Aktion wirkt auf diese Seite.
  useEffect(() => {
    meldeZuruecksetzer(zuruecksetzen)
    return () => meldeZuruecksetzer(null)
  }, [zuruecksetzen])

  useEffect(() => {
    if (!bearbeiten) return
    // Escape schließt zuerst eine offene schwebende Karte (Popover); erst danach beendet es den Modus.
    // Darum vor dem Browser prüfen (Erfassungsphase), ob eine offen ist.
    const taste = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && !e.defaultPrevented && !document.querySelector(':popover-open') && bearbeitenBeenden()
    addEventListener('keydown', taste, true)
    return () => removeEventListener('keydown', taste, true)
  }, [bearbeiten])

  if (!anordnung) return <div ref={containerRef} />

  const uebernehmen = (layout: Layout) => aendern(ausLayout(anordnung, layout))

  const taste = (e: KeyboardEvent, id: string) => {
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
    <div>
      {bearbeiten &&
        bedienOrt &&
        createPortal(
          <BearbeitenLeiste
            seite={seite}
            versteckt={kacheln.filter((k) => anordnung.versteckt.includes(k.id))}
            anordnung={anordnung}
            plan={kacheln}
            geraet={geraet}
            aendern={aendern}
            zuruecksetzen={zuruecksetzen}
          />,
          bedienOrt,
        )}
      {fehler && <p className="mb-2 text-sm text-warnung">{fehler}</p>}
      <div ref={containerRef}>
        {mounted && zeile > 0 && (
          <GridLayout
            width={width}
            layout={alsLayout(anordnung, kacheln, geraet)}
            // Freie Plätze: nichts rückt nach oben; wer im Weg liegt, weicht nach unten aus.
            compactor={noCompactor}
            gridConfig={{ cols: spaltenVon(geraet, anordnung.fein), rowHeight: zeile, margin: [abstaende.abstandPx, abstaende.abstandPx], containerPadding: [0, 0] }}
            // Am PC greift man den Kopf oder Griff; Klicks auf den Inhalt bleiben Klicks. Am Handy hebt langer Druck die ganze Kachel an,
            // auch auf Knöpfen; kurzes Antippen bleibt ein Klick, kurzes Wischen scrollt (allowMobileScroll).
            dragConfig={{ enabled: bearbeiten, handle: handy ? undefined : '.kachel-griff', cancel: '.griff, .kachel-menue-knopf', threshold: 3, allowMobileScroll: true }}
            resizeConfig={{
              enabled: bearbeiten,
              handles: bearbeiten ? ['e', 's', 'se'] : [],
              handleComponent: (achse: ResizeHandleAxis, ref: Ref<HTMLElement>) => <span ref={ref as Ref<HTMLSpanElement>} className={griffKlassen[achse]} aria-hidden />,
            }}
            onDragStop={uebernehmen}
            onResizeStop={uebernehmen}
          >
            {sichtbar.map((k) => {
              // Gerade leer (inhalt null): unsichtbar, behält aber den Platz, damit nichts nachrückt. Im Bearbeiten-Modus greifbar.
              if (inhalt[k.id] === null && !bearbeiten) return <div key={k.id} aria-hidden />
              const flaeche = hatHintergrund(anordnung, k.id)
              const kachel = (
                <>
                  {k.titel !== false ? (
                    <div className={cn('kachel-kopf beschriftung px-4 pt-3 pb-2', bearbeiten && 'kachel-griff')}>{k.name}</div>
                  ) : (
                    bearbeiten && <span className="kachel-griff kachel-griff-leiste" aria-hidden />
                  )}
                  <div className={cn('min-h-0 flex-1 overflow-auto', flaeche && (k.titel === false ? 'px-4 py-2' : 'px-4 pb-4'))}>
                    {inhalt[k.id] ?? <p className="text-sm text-text-gedaempft">Gerade leer, darum sonst unsichtbar</p>}
                  </div>
                  {bearbeiten && (
                    <Knopf
                      art="symbol"
                      groesse="klein"
                      aria-label={`Menü der Kachel ${k.name}`}
                      title="Menü"
                      className="kachel-menue-knopf"
                      onClick={(e) => {
                        const r = e.currentTarget.getBoundingClientRect()
                        setMenue({ id: k.id, x: r.left, y: r.bottom })
                      }}
                    >
                      <Ellipsis aria-hidden className="size-4" />
                    </Knopf>
                  )}
                </>
              )
              const gemeinsam = {
                id: `kachel-${seite}-${k.id}`,
                role: 'group',
                'aria-label': bearbeiten ? `${k.name}. Pfeiltasten verschieben, Umschalt und Pfeiltasten ändern die Größe, Eingabe beendet.` : k.name,
                tabIndex: bearbeiten ? 0 : -1,
                className: cn('relative flex h-full flex-col', flaeche && 'overflow-hidden', bearbeiten ? 'kachel-bearbeiten focus-visible:kachel-gewaehlt' : 'outline-none'),
                onKeyDown: bearbeiten ? (e: KeyboardEvent) => taste(e, k.id) : undefined,
                onContextMenu: bearbeiten
                  ? (e: MouseEvent) => {
                      e.preventDefault()
                      setMenue({ id: k.id, x: e.clientX, y: e.clientY })
                    }
                  : undefined,
              }
              return (
                <div key={k.id}>
                  {flaeche ? <Flaeche {...gemeinsam}>{kachel}</Flaeche> : <div {...gemeinsam}>{kachel}</div>}
                </div>
              )
            })}
          </GridLayout>
        )}
      </div>
      <KachelMenue ort={menue} schliessen={() => setMenue(null)} anordnung={anordnung} plan={kacheln} geraet={geraet} aendern={aendern} zuruecksetzen={zuruecksetzen} />
    </div>
  )
}
