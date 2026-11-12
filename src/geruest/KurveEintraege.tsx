import { Droplet, ListTodo } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { cn } from '../bausteine/cn'
import { Eingabe } from '../bausteine/Eingabe'
import { Flaeche } from '../bausteine/Flaeche'
import { Knopf } from '../bausteine/Knopf'
import { MIN_TAG, vonOben } from '../logik/gezeiten'
import { ZIEH_RASTER, aufRaster, beschriftungsPlatz, buendeln, hoeheBei, verschoben, type Band, type Punkt } from '../logik/kurveEintraege'
import type { Aenderung, Eintrag } from '../vertrag/eintrag'
import type { WetterStunde } from '../vertrag/wetter'
import { rueckgaengig, useLetzterSchritt } from './rueckgaengig'

// Einträge auf der Gezeitenkurve (docs/konzept/06-gezeitenkurve.md): Punkte mit Karte, Bänder dahinter, Bündel,
// Überschneidung, Treibgut an der Jetzt-Linie, Wetterzeile. Termine zieht man im 15-Minuten-Raster; alles lässt sich zurücknehmen.
// Liegt im selben Scrollbereich wie die Kurve, dreimal nebeneinander. Per Tastatur bedienbar ist nur die Kopie in der Mitte (`kopie`).

/** Kleinster Abstand zweier Punkte in Pixeln, darunter werden sie gebündelt: eine Fingerbreite. */
const FINGER = 44
/** Längste Beschriftung neben einem Punkt in Pixeln; kürzer als 28 px wird sie weggelassen. */
const BESCHRIFTUNG_MAX = 160
const BESCHRIFTUNG_MIN = 28
const MELDUNG_MS = 6000

type Aendere = (e: Eintrag, aenderung: Aenderung, text: string) => Promise<void>
type Karte = { art: 'termine' | 'treibgut'; ids: string[]; x: number; y: number; oben: boolean }

const zweistellig = (n: number) => String(n).padStart(2, '0')
const zeitText = (iso: string) => {
  const d = new Date(iso)
  return `${zweistellig(d.getHours())}:${zweistellig(d.getMinutes())}`
}
const links = (k: number, minute: number) => `${((k * MIN_TAG + minute) / (3 * MIN_TAG)) * 100}%`
const kopien = [0, 1, 2] as const
const fokus = 'rounded-voll outline-none focus-visible:ring-2 focus-visible:ring-akzent'

export function KurveEintraege(p: {
  punkte: Punkt[]
  baender: Band[]
  werte: number[]
  pxProMinute: number
  minuteJetzt: number
  kopie: number
  marken: number[]
  aendere: Aendere
  treibgut: Eintrag[]
  wetter?: Map<number, WetterStunde>
}) {
  const { punkte, baender, werte, pxProMinute, aendere } = p
  const [zug, setZug] = useState<{ id: string; delta: number } | null>(null)
  const [karte, setKarte] = useState<Karte | null>(null)
  const start = useRef<{ x: number; bewegt: boolean } | null>(null)
  const geschoben = useRef(false)

  const verschiebe = (e: Eintrag, delta: number) => {
    const neu = verschoben(e, delta)
    return aendere(e, neu, `„${e.titel}" auf ${zeitText(neu.beginn)}`)
  }

  const oeffne = (el: HTMLElement, art: Karte['art'], ids: string[]) => {
    const r = el.getBoundingClientRect()
    const oben = r.top > innerHeight / 2
    setKarte({ art, ids, oben, x: Math.max(8, Math.min(r.left + r.width / 2 - 144, innerWidth - 296)), y: oben ? r.top - 8 : r.bottom + 8 })
  }

  /** Zieh- und Klick-Verhalten für Punkt und Band. Ein Klick ohne Bewegung öffnet die Karte. */
  const griff = (e: Eintrag, k: number) => ({
    tabIndex: k === p.kopie ? 0 : -1,
    'aria-hidden': k !== p.kopie || undefined,
    onPointerDown: (ev: React.PointerEvent<HTMLElement>) => {
      if (ev.button !== 0) return
      ev.currentTarget.setPointerCapture(ev.pointerId)
      start.current = { x: ev.clientX, bewegt: false }
    },
    onPointerMove: (ev: React.PointerEvent<HTMLElement>) => {
      const s = start.current
      if (!s) return
      const dx = ev.clientX - s.x
      if (!s.bewegt && Math.abs(dx) < 6) return
      s.bewegt = true
      setZug({ id: e.id, delta: aufRaster(dx / pxProMinute) })
    },
    onPointerUp: (ev: React.PointerEvent<HTMLElement>) => {
      const s = start.current
      start.current = null
      if (!s?.bewegt) return
      geschoben.current = true
      const delta = aufRaster((ev.clientX - s.x) / pxProMinute)
      setZug(null)
      if (delta) void verschiebe(e, delta)
    },
    onPointerCancel: () => {
      start.current = null
      setZug(null)
    },
    onClick: (ev: React.MouseEvent<HTMLElement>) => {
      if (geschoben.current) return void (geschoben.current = false)
      oeffne(ev.currentTarget, 'termine', [e.id])
    },
  })

  const versatz = (id: string) => (zug?.id === id ? zug.delta : 0)
  // Gebündelt wird nach der gespeicherten Zeit, damit beim Ziehen nichts umsortiert wird (sonst ginge der Finger verloren).
  const gruppen = buendeln(punkte, FINGER / pxProMinute)
  const plaetze = beschriftungsPlatz(
    gruppen.map((g) => g[0].minute),
    pxProMinute,
    BESCHRIFTUNG_MAX,
  )
  // Wetterzeile weicht den Beschriftungen aus: keine Angabe, wo eine Beschriftung steht (halbe Zahlbreite Puffer).
  const belegt = gruppen.flatMap((g, i) => (g.length === 1 && plaetze[i] >= BESCHRIFTUNG_MIN ? [[g[0].minute, g[0].minute + plaetze[i] / pxProMinute]] : []))
  const frei = (minute: number) => belegt.every(([von, bis]) => minute < von - FINGER / 2 / pxProMinute || minute > bis + FINGER / 2 / pxProMinute)
  const einzeln = gruppen.map((g, i) => ({ g, platz: plaetze[i] }))

  return (
    <>
      {kopien.map((k) =>
        baender.map((b) => {
          const von = b.von + versatz(b.id)
          const breite = (b.bis - b.von) * pxProMinute
          return (
            <div key={`${k}-${b.id}`}>
              <div className="kurve-band pointer-events-none absolute inset-y-0 -z-10" style={{ left: links(k, von), width: breite }} />
              <button
                type="button"
                {...griff(b.eintrag, k)}
                title={`${b.titel} · ziehen zum Verschieben`}
                className={cn(fokus, 'kurve-schrift drueck absolute bottom-5 cursor-grab touch-none truncate px-1 text-left text-text-gedaempft')}
                style={{ left: links(k, von), maxWidth: breite }}
              >
                {zug?.id === b.id ? zeitText(verschoben(b.eintrag, zug.delta).beginn) : b.titel}
              </button>
            </div>
          )
        }),
      )}

      {kopien.map((k) =>
        einzeln.map(({ g, platz }) => {
          const erster = g[0]
          const minute = erster.minute + versatz(erster.id)
          const lage: CSSProperties = { left: links(k, minute), top: `${vonOben(hoeheBei(werte, minute)) * 100}%` }
          if (g.length > 1)
            return (
              <button
                key={`${k}-${erster.id}`}
                type="button"
                tabIndex={k === p.kopie ? 0 : -1}
                aria-hidden={k !== p.kopie || undefined}
                aria-label={`${g.length} Termine, auffächern`}
                onClick={(ev) => oeffne(ev.currentTarget, 'termine', g.map((x) => x.id))}
                className={cn(fokus, 'drueck absolute grid size-11 -translate-1/2 cursor-pointer place-items-center')}
                style={lage}
              >
                <span className={cn('kurve-buendel', g.some((x) => x.ueberschneidet.length) && 'kurve-punkt-ueberschneidet')}>{g.length}</span>
              </button>
            )
          const zeit = zeitText(zug?.id === erster.id ? verschoben(erster.eintrag, zug.delta).beginn : erster.eintrag.beginn!)
          return (
            <div key={`${k}-${erster.id}`} className="absolute" style={lage}>
              <button
                type="button"
                {...griff(erster.eintrag, k)}
                aria-label={`${zeit} ${erster.titel}${erster.ueberschneidet.length ? ', überschneidet sich' : ''}`}
                className={cn(fokus, 'absolute grid size-11 -translate-1/2 cursor-grab touch-none place-items-center')}
              >
                <span className={cn('kurve-punkt', zug?.id === erster.id && 'scale-150', erster.ueberschneidet.length > 0 && 'kurve-punkt-ueberschneidet')} />
              </button>
              {platz >= BESCHRIFTUNG_MIN && (
                <span className="kurve-schrift pointer-events-none absolute bottom-2 left-1 block truncate text-text" style={{ maxWidth: platz }}>
                  <span className="text-text-gedaempft tabular-nums">{zeit}</span> {erster.titel}
                </span>
              )}
            </div>
          )
        }),
      )}

      {p.treibgut.length > 0 &&
        kopien.map((k) => (
          <button
            key={k}
            type="button"
            tabIndex={k === p.kopie ? 0 : -1}
            aria-hidden={k !== p.kopie || undefined}
            aria-label={`${p.treibgut.length} offene Aufgaben ohne Uhrzeit`}
            onClick={(ev) => oeffne(ev.currentTarget, 'treibgut', [])}
            className={cn(fokus, 'kurve-schrift drueck absolute bottom-5 ml-1 flex cursor-pointer items-center gap-0.5 bg-knopf-ton px-1.5 text-text-gedaempft')}
            style={{ left: links(k, p.minuteJetzt) }}
          >
            <ListTodo aria-hidden className="size-3" />
            {p.treibgut.length}
          </button>
        ))}

      {p.wetter &&
        p.marken.map((h) => {
          const w = p.wetter!.get(h % 24)
          if (!w || !frei((h % 24) * 60)) return null
          return (
            <span
              key={h}
              className="kurve-schrift pointer-events-none absolute top-0.5 flex -translate-x-1/2 items-center gap-0.5 text-text-blass tabular-nums"
              style={{ left: `${(h / 72) * 100}%` }}
            >
              {w.grad}°{w.regen >= 0.1 && <Droplet aria-label={`${w.regen} mm Regen`} className="size-2.5 text-regen" />}
            </span>
          )
        })}

      <KarteFenster
        karte={karte}
        schliessen={() => setKarte(null)}
        waehle={(id) => setKarte((alt) => alt && { ...alt, ids: [id] })}
        termine={[...punkte, ...baender]}
        treibgut={p.treibgut}
        verschiebe={verschiebe}
        aendere={aendere}
      />
    </>
  )
}

/** Karte als natives Popover: liegt über allem, Esc oder Klick daneben schließt sie. */
function KarteFenster(p: {
  karte: Karte | null
  schliessen: () => void
  waehle: (id: string) => void
  termine: (Punkt | Band)[]
  treibgut: Eintrag[]
  verschiebe: (e: Eintrag, delta: number) => Promise<void>
  aendere: Aendere
}) {
  const fenster = useRef<HTMLDivElement>(null)
  const { karte, schliessen } = p

  useLayoutEffect(() => {
    const el = fenster.current!
    if (karte && !el.matches(':popover-open')) el.showPopover()
    if (!karte && el.matches(':popover-open')) el.hidePopover()
  }, [karte])
  useEffect(() => {
    const el = fenster.current!
    const zu = (ev: Event) => (ev as ToggleEvent).newState === 'closed' && schliessen()
    el.addEventListener('toggle', zu)
    return () => el.removeEventListener('toggle', zu)
  }, [schliessen])

  const gewaehlt = karte?.art === 'termine' ? p.termine.filter((t) => karte.ids.includes(t.id)) : []
  return (
    <div
      ref={fenster}
      popover="auto"
      className={cn('kurve-karte', karte?.oben && '-translate-y-full')}
      style={{ '--x': karte?.x ?? 0, '--y': karte?.y ?? 0 } as CSSProperties}
    >
      {karte && (
        <Flaeche art="schwebend" className="flex flex-col gap-2 p-3 text-sm text-text">
          {karte.art === 'treibgut' && (
            <>
              <p className="text-xs text-text-gedaempft">Offen, ohne Uhrzeit</p>
              <ul className="flex flex-col gap-1">
                {p.treibgut.map((e) => (
                  <li key={e.id}>{e.titel}</li>
                ))}
              </ul>
            </>
          )}
          {gewaehlt.length > 1 && (
            <>
              <p className="text-xs text-text-gedaempft">{gewaehlt.length} Termine</p>
              {gewaehlt.map((t) => (
                <Knopf key={t.id} art="leise" className="justify-start text-text" onClick={() => p.waehle(t.id)}>
                  <span className="text-text-gedaempft tabular-nums">{zeitText(t.eintrag.beginn!)}</span>
                  <span className="truncate">{t.titel}</span>
                </Knopf>
              ))}
            </>
          )}
          {gewaehlt.length === 1 && <TerminKarte key={gewaehlt[0].id} t={gewaehlt[0]} verschiebe={p.verschiebe} aendere={p.aendere} />}
          {karte.art === 'termine' && gewaehlt.length === 0 && <p className="text-text-gedaempft">Der Termin ist nicht mehr da.</p>}
        </Flaeche>
      )}
    </div>
  )
}

function TerminKarte({ t, verschiebe, aendere }: { t: Punkt | Band; verschiebe: (e: Eintrag, delta: number) => Promise<void>; aendere: Aendere }) {
  const [bearbeiten, setBearbeiten] = useState(false)
  const e = t.eintrag
  const ueberschneidet = 'ueberschneidet' in t ? t.ueberschneidet : []

  const sichern = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const titel = String(new FormData(ev.currentTarget).get('titel') ?? '').trim()
    setBearbeiten(false)
    if (titel && titel !== e.titel) void aendere(e, { titel }, `„${e.titel}" umbenannt`)
  }

  return (
    <>
      <p className="text-xs text-text-gedaempft tabular-nums">
        {zeitText(e.beginn!)} – {zeitText(e.ende!)}
      </p>
      {bearbeiten ? (
        <form onSubmit={sichern} className="flex gap-2">
          <Eingabe name="titel" defaultValue={e.titel} aria-label="Titel" autoFocus className="flex-1" />
          <Knopf type="submit" art="haupt">
            Sichern
          </Knopf>
        </form>
      ) : (
        <p className="font-medium">{e.titel}</p>
      )}
      {ueberschneidet.length > 0 && <p className="text-xs text-warnung">Überschneidet sich mit {ueberschneidet.join(', ')}</p>}
      <div className="flex flex-wrap gap-1">
        <Knopf groesse="klein" onClick={() => void verschiebe(e, -ZIEH_RASTER)}>
          {ZIEH_RASTER} Min. früher
        </Knopf>
        <Knopf groesse="klein" onClick={() => void verschiebe(e, ZIEH_RASTER)}>
          {ZIEH_RASTER} Min. später
        </Knopf>
        {!bearbeiten && (
          <Knopf groesse="klein" art="leise" onClick={() => setBearbeiten(true)}>
            Bearbeiten
          </Knopf>
        )}
      </div>
    </>
  )
}

/** Hinweis nach einer Änderung mit „Rückgängig"; verschwindet nach sechs Sekunden, Alt+Z wirkt weiter. */
export function KurveMeldung() {
  const schritt = useLetzterSchritt()
  const [alt, setAlt] = useState<typeof schritt>()
  useEffect(() => {
    if (!schritt) return
    const t = setTimeout(() => setAlt(schritt), Math.max(0, schritt.zeit + MELDUNG_MS - Date.now()))
    return () => clearTimeout(t)
  }, [schritt])
  if (!schritt || alt === schritt) return null
  return (
    <div role="status" className="absolute top-1 left-2 flex items-center gap-2 rounded-knopf bg-grund px-2 text-xs text-text">
      <span className="truncate">{schritt.text}</span>
      <Knopf groesse="klein" art="leise" onClick={rueckgaengig}>
        Rückgängig
      </Knopf>
    </div>
  )
}
