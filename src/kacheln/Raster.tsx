import { Ellipsis } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode, type Ref } from 'react'
import { createPortal } from 'react-dom'
import { GridLayout, useContainerWidth } from 'react-grid-layout'
import { noCompactor } from 'react-grid-layout/core'
import type { Layout, ResizeHandleAxis } from 'react-grid-layout'
import { cn } from '../bausteine/cn'
import { Flaeche } from '../bausteine/Flaeche'
import { Knopf } from '../bausteine/Knopf'
import { useEinstellung, useGeraet } from '../geruest/einstellungen'
import { useFreieHoehe } from '../geruest/freieHoehe'
import { einstellungen } from '../logik/einstellungen'
import { ablegen, alsLayout, getroffen, groesseAendern, hatHintergrund, stehenLassen, verschiebe, zellRaster, type KachelPlan } from '../logik/kacheln'
import { VERWEILEN_MS } from '../werte/bewegung'
import { kachelRaster } from '../werte/kacheln'
import { useAnordnung } from './anordnung'
import { bearbeitenBeenden, meldeZuruecksetzer, useBearbeiten, useBearbeitenOrt } from './bearbeiten'
import { BearbeitenLeiste } from './BearbeitenLeiste'
import { KachelMenue, type MenueOrt } from './KachelMenue'

// Kacheln einer Seite (docs/konzept/04-kacheln.md). Verschieben und Größe ändern macht react-grid-layout;
// hier nur der Bearbeiten-Modus drumherum: Griff, Griffpunkte, Menü der Kachel, Tastatur, Speichern.
// Außerhalb des Modus gibt es weder langen Druck noch Rechtsklick-Menü. Im Modus sieht die Seite genauso aus wie danach:
// das Bedienfeld liegt außerhalb (`BearbeitenOrt`), Rahmen und Griffpunkte liegen innerhalb der Kacheln.
// Raster: quadratische Zellen wie bei Samsung One UI, Zahl der Spalten aus der Einstellung (`zellRaster` in src/logik/kacheln.ts).
// Jede Kachel hat rundherum einen halben Abstand unsichtbaren Rand (`kachel-platz`), das Raster selbst keinen; darum ragt es
// rundherum um diesen halben Abstand über den Inhalt hinaus (`raster-ueberstand`). Beides misst `--kachelrand`, das hier gesetzt wird.
// Nur die sichtbare Fläche reagiert. So ist überall genau ein Abstand zu sehen; was beim Runden übrig bleibt, liegt gleichmäßig am Rand.
// Ziehen wie bei One UI: Die gezogene Kachel schwebt, alle anderen bleiben stehen (`stehenLassen` als Compactor des Bausteins);
// wen sie trifft, zeigt seine Grenze. Bleibt der Zeiger `VERWEILEN_MS` lang im Umkreis `verweilPuffer`, weichen die anderen aus,
// sichtbar mit der nächsten Regung des Zeigers oder beim Loslassen (der Baustein ordnet nur bei Bewegung). Kleines Zittern zählt nicht;
// wer über den Umkreis hinaus weiterzieht, beginnt von vorn, und die anderen kehren an ihren Platz zurück.

function punkt(e: Event): { x: number; y: number } | null {
  const p = e instanceof MouseEvent ? e : e instanceof TouchEvent ? e.touches[0] : undefined
  return p ? { x: p.clientX, y: p.clientY } : null
}

const griffKlassen: Partial<Record<ResizeHandleAxis, string>> = { se: 'griff griff-se', e: 'griff griff-e', s: 'griff griff-s' }

const spaltenEinstellung = einstellungen.find((e) => e.id === 'kacheln-spalten')!

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
  // Gemessen wird der sichtbare Platz: Breite des Inhalts, Höhe eines Bildschirms (zwischen Kopf und Kurve).
  const hoehe = useFreieHoehe()
  const { width, containerRef, mounted } = useContainerWidth()
  const spalten = useEinstellung(spaltenEinstellung) as number
  const zellen = zellRaster(width, hoehe, spalten, kachelRaster.abstandAnteil)
  const zeilen = zellen.reihen
  const { anordnung, raster, fehler, aendern, zuruecksetzen } = useAnordnung(seite, geraet, kacheln, spalten, zeilen)
  const bearbeiten = useBearbeiten()
  const bedienOrt = useBearbeitenOrt()
  const [menue, setMenue] = useState<MenueOrt | null>(null)
  // Beim Ziehen: getroffene Kacheln und, nach dem Verweilen, das Layout, in dem die anderen ausgewichen sind.
  const [grenze, setGrenze] = useState<readonly string[]>([])
  const verweilen = useRef<ReturnType<typeof setTimeout>>(undefined)
  const anker = useRef<{ x: number; y: number } | null>(null)
  const gezogen = useRef<string | null>(null)
  // Wo die anderen beim Ziehen stehen: vor dem Ziehen, oder nach dem Verweilen ausgewichen.
  const basis = useRef<Layout>([])
  const layout = useMemo(() => anordnung && alsLayout(anordnung, kacheln), [anordnung, kacheln])
  const ordnen = useMemo(() => ({ ...noCompactor, compact: (l: Layout) => (gezogen.current ? stehenLassen(l, basis.current, gezogen.current) : l) }), [])
  useEffect(() => () => clearTimeout(verweilen.current), [])

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

  if (!anordnung || !layout) return <div ref={containerRef} />

  const begonnen = (id: string) => {
    gezogen.current = id
    basis.current = layout
    anker.current = null
  }

  const bewegt = (jetzt: Layout, id: string, e: Event) => {
    const p = punkt(e)
    const a = anker.current
    if (!p || (a && Math.hypot(p.x - a.x, p.y - a.y) <= kachelRaster.verweilPuffer)) return
    anker.current = p
    clearTimeout(verweilen.current)
    basis.current = layout
    const hier = stehenLassen(jetzt, layout, id)
    const treffer = getroffen(hier, id)
    setGrenze(treffer)
    if (treffer.length === 0) return
    verweilen.current = setTimeout(() => {
      basis.current = alsLayout(ablegen(anordnung, kacheln, raster, hier, id), kacheln)
      setGrenze([])
    }, VERWEILEN_MS)
  }

  const losgelassen = (jetzt: Layout, id: string) => {
    clearTimeout(verweilen.current)
    gezogen.current = null
    anker.current = null
    setGrenze([])
    aendern(ablegen(anordnung, kacheln, raster, jetzt, id))
  }

  const taste = (e: KeyboardEvent, id: string) => {
    if (e.target !== e.currentTarget) return
    const p = pfeile[e.key]
    if (p) {
      e.preventDefault()
      aendern(e.shiftKey ? groesseAendern(anordnung, kacheln, raster, id, p[0], p[1]) : verschiebe(anordnung, kacheln, raster, id, p[0], p[1]))
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
            raster={raster}
            aendern={aendern}
            zuruecksetzen={zuruecksetzen}
          />,
          bedienOrt,
        )}
      {fehler && <p className="mb-2 text-sm text-warnung">{fehler}</p>}
      {/* Gemessen wird der äußere Kasten; der Rest beim Runden liegt innen als Rand, damit die Messung ihn nicht mitzählt. */}
      <div ref={containerRef} style={{ '--kachelrand': `${zellen.abstand / 2}px` } as CSSProperties}>
        {mounted && hoehe > 0 && (
          <div style={{ paddingLeft: zellen.links, paddingTop: zellen.oben }}>
          <GridLayout
            className="raster-ueberstand"
            width={spalten * zellen.zelle}
            layout={layout}
            compactor={ordnen}
            gridConfig={{ cols: spalten, rowHeight: zellen.zelle, margin: [0, 0], containerPadding: [0, 0] }}
            // Am PC greift man den Kopf oder Griff; Klicks auf den Inhalt bleiben Klicks. Am Handy hebt langer Druck die ganze Kachel an,
            // auch auf Knöpfen; kurzes Antippen bleibt ein Klick, kurzes Wischen scrollt (allowMobileScroll).
            dragConfig={{ enabled: bearbeiten, handle: handy ? undefined : '.kachel-griff', cancel: '.griff, .kachel-menue-knopf', threshold: kachelRaster.ziehSchwelle, allowMobileScroll: true }}
            resizeConfig={{
              enabled: bearbeiten,
              handles: bearbeiten ? ['e', 's', 'se'] : [],
              handleComponent: (achse: ResizeHandleAxis, ref: Ref<HTMLElement>) => <span ref={ref as Ref<HTMLSpanElement>} className={griffKlassen[achse]} aria-hidden />,
            }}
            onDragStart={(_jetzt, _alt, neu) => neu && begonnen(neu.i)}
            onResizeStart={(_jetzt, _alt, neu) => neu && begonnen(neu.i)}
            onDrag={(jetzt, _alt, neu, _platz, e) => neu && bewegt(jetzt, neu.i, e)}
            onResize={(jetzt, _alt, neu, _platz, e) => neu && bewegt(jetzt, neu.i, e)}
            onDragStop={(jetzt, _alt, neu) => neu && losgelassen(jetzt, neu.i)}
            onResizeStop={(jetzt, _alt, neu) => neu && losgelassen(jetzt, neu.i)}
          >
            {sichtbar.map((k) => {
              // Gerade leer (inhalt null): unsichtbar, behält aber den Platz, damit nichts nachrückt. Im Bearbeiten-Modus greifbar.
              if (inhalt[k.id] === null && !bearbeiten) return <div key={k.id} className="kachel-platz" aria-hidden />
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
                'data-grenze': grenze.includes(k.id) || undefined,
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
                <div key={k.id} className="kachel-platz">
                  {flaeche ? <Flaeche {...gemeinsam}>{kachel}</Flaeche> : <div {...gemeinsam}>{kachel}</div>}
                </div>
              )
            })}
          </GridLayout>
          </div>
        )}
      </div>
      <KachelMenue ort={menue} schliessen={() => setMenue(null)} anordnung={anordnung} plan={kacheln} raster={raster} aendern={aendern} zuruecksetzen={zuruecksetzen} />
    </div>
  )
}
