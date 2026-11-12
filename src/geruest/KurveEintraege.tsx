import { Droplet, ListTodo } from 'lucide-react'
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { cn } from '../bausteine/cn'
import { Eingabe } from '../bausteine/Eingabe'
import { Flaeche } from '../bausteine/Flaeche'
import { Knopf } from '../bausteine/Knopf'
import { MIN_TAG, vonOben } from '../logik/gezeiten'
import { ZIEH_RASTER, aufRaster, beschriftungsPlatz, buendeln, gezogen, hoeheBei, platzVorHindernissen, verschoben, type Band, type Punkt, type Ziehart } from '../logik/kurveEintraege'
import type { Meldung } from '../logik/meldungen'
import type { Aenderung, Eintrag } from '../vertrag/eintrag'
import type { WetterStunde } from '../vertrag/wetter'
import { rueckgaengig, type Schritt } from './rueckgaengig'

// Einträge auf der Gezeitenkurve (docs/konzept/06-gezeitenkurve.md): Punkte mit Karte, Bänder dahinter, Bündel,
// Überschneidung, Treibgut an der Jetzt-Linie, Wetterzeile. Termine zieht man im 15-Minuten-Raster, Bänder auch an ihren Enden
// (Dauer); alles lässt sich zurücknehmen.
// Lage von hinten nach vorn ergibt sich aus der Reihenfolge: Wasser (in Gezeitenkurve davor), Bänder, `linie` (Linie,
// Jetzt-Linie, Stundenzahlen), dann Punkte, Beschriftungen, Treibgut und Wetter.
// Liegt im selben Scrollbereich wie die Kurve, dreimal nebeneinander. Per Tastatur bedienbar ist nur die Kopie in der Mitte (`kopie`).

/** Kleinster Abstand zweier Punkte in Pixeln, darunter werden sie gebündelt: eine Fingerbreite. */
const FINGER = 44
/** Längste Beschriftung neben einem Punkt in Pixeln; kürzer als 28 px wird sie weggelassen. */
const BESCHRIFTUNG_MAX = 160
const BESCHRIFTUNG_MIN = 28

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
  /** Gezeigte Uhrzeit in der Mitte, wenn die Kurve nicht der Uhr folgt; dort steht sie oben als Zahl. */
  mitte: number | null
  marken: number[]
  aendere: Aendere
  treibgut: Eintrag[]
  wetter?: Map<number, WetterStunde>
  /** Linie der Kurve und Stundenleiste: liegen über den Bändern und unter allem anderen. */
  linie: ReactNode
  /** Steht etwas in der Kopfzeile (Meldung, Fehler), machen Wetterzeile und Treibgut-Zähler Platz. */
  kopfzeileBelegt: boolean
}) {
  const { punkte, baender, werte, pxProMinute, aendere } = p
  const [zug, setZug] = useState<{ id: string; delta: number; art: Ziehart } | null>(null)
  const [karte, setKarte] = useState<Karte | null>(null)
  const start = useRef<{ x: number; bewegt: boolean } | null>(null)
  const geschoben = useRef(false)

  const verschiebe = (e: Eintrag, delta: number, art: Ziehart = 'lage') => {
    const neu = gezogen(e, art, delta)
    const text = art === 'lage' ? `auf ${zeitText(neu.beginn)}` : `jetzt ${zeitText(neu.beginn)}–${zeitText(neu.ende)}`
    return aendere(e, neu, `„${e.titel}" ${text}`)
  }

  const oeffne = (el: HTMLElement, art: Karte['art'], ids: string[]) => {
    const r = el.getBoundingClientRect()
    const oben = r.top > innerHeight / 2
    setKarte({ art, ids, oben, x: Math.max(8, Math.min(r.left + r.width / 2 - 144, innerWidth - 296)), y: oben ? r.top - 8 : r.bottom + 8 })
  }

  /** Ziehen mit Maus oder Finger: in der Mitte die Lage, an den Enden eines Bands Beginn oder Ende. */
  const ziehen = (e: Eintrag, art: Ziehart) => ({
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
      setZug({ id: e.id, delta: aufRaster(dx / pxProMinute), art })
    },
    onPointerUp: (ev: React.PointerEvent<HTMLElement>) => {
      const s = start.current
      start.current = null
      if (!s?.bewegt) return
      geschoben.current = true
      const delta = aufRaster((ev.clientX - s.x) / pxProMinute)
      setZug(null)
      if (delta) void verschiebe(e, delta, art)
    },
    onPointerCancel: () => {
      start.current = null
      setZug(null)
    },
  })

  /** Punkt oder Band: ziehen verschiebt, ein Klick ohne Bewegung öffnet die Karte. */
  const griff = (e: Eintrag, k: number) => ({
    ...ziehen(e, 'lage'),
    tabIndex: k === p.kopie ? 0 : -1,
    'aria-hidden': k !== p.kopie || undefined,
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
  // Obere Zeile: Beschriftungen, Treibgut-Zähler, gezeigte Uhrzeit (links der Mitte) und Wetter teilen sie sich.
  // Zähler und Uhrzeit sind feste Hindernisse; Beschriftungen enden davor, das Wetter weicht allem aus.
  // Eine Meldung (kopfzeileBelegt) hat die Zeile für sich: dann zeigt sie nur die Meldung.
  const hindernisse: [number, number][] = []
  if (p.treibgut.length) hindernisse.push([p.minuteJetzt, p.minuteJetzt + FINGER / pxProMinute])
  if (p.mitte !== null) hindernisse.push([p.mitte - FINGER / pxProMinute, p.mitte])
  const einzeln = gruppen.map((g, i) => ({ g, platz: platzVorHindernissen(g[0].minute, plaetze[i], hindernisse, pxProMinute) }))
  const belegt = [
    ...hindernisse,
    ...einzeln.flatMap(({ g, platz }) => (g.length === 1 && platz >= BESCHRIFTUNG_MIN ? [[g[0].minute, g[0].minute + platz / pxProMinute] as [number, number]] : [])),
  ]
  const frei = (minute: number) => belegt.every(([von, bis]) => minute < von - FINGER / 2 / pxProMinute || minute > bis + FINGER / 2 / pxProMinute)

  return (
    <>
      {kopien.map((k) =>
        baender.map((b) => {
          // Beim Ziehen zeigt das Band schon die neue Zeit; gerechnet wie beim Speichern (mindestens 15 Minuten lang).
          const neu = zug?.id === b.id ? gezogen(b.eintrag, zug.art, zug.delta) : undefined
          const um = (alt: string, jetzt?: string) => (jetzt ? (Date.parse(jetzt) - Date.parse(alt)) / 60_000 : 0)
          const von = b.von + um(b.eintrag.beginn!, neu?.beginn)
          const bis = b.bis + um(b.eintrag.ende!, neu?.ende)
          return (
            <div key={`${k}-${b.id}`} className="kurve-band-lage" style={{ left: links(k, von), width: (bis - von) * pxProMinute }}>
              <button
                type="button"
                {...griff(b.eintrag, k)}
                title={`${b.titel} · in der Mitte ziehen verschiebt, an den Enden ändert die Dauer`}
                className={cn(fokus, 'kurve-band kurve-schrift drueck absolute inset-0 flex cursor-grab touch-none items-center px-2 text-left text-text-gedaempft')}
              >
                <span className="truncate">{neu ? `${zeitText(neu.beginn)}–${zeitText(neu.ende)}` : b.titel}</span>
              </button>
              <span aria-hidden {...ziehen(b.eintrag, 'beginn')} title="Ziehen ändert den Beginn" className="kurve-band-griff left-0 -translate-x-1/2" />
              <span aria-hidden {...ziehen(b.eintrag, 'ende')} title="Ziehen ändert das Ende" className="kurve-band-griff right-0 translate-x-1/2" />
            </div>
          )
        }),
      )}

      {p.linie}

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
            <Fragment key={`${k}-${erster.id}`}>
              <button
                type="button"
                {...griff(erster.eintrag, k)}
                aria-label={`${zeit} ${erster.titel}${erster.ueberschneidet.length ? ', überschneidet sich' : ''}`}
                className={cn(fokus, 'absolute grid size-11 -translate-1/2 cursor-grab touch-none place-items-center')}
                style={lage}
              >
                <span className={cn('kurve-punkt', zug?.id === erster.id && 'scale-150', erster.ueberschneidet.length > 0 && 'kurve-punkt-ueberschneidet')} />
              </button>
              {platz >= BESCHRIFTUNG_MIN && !p.kopfzeileBelegt && (
                <span className="kurve-schrift pointer-events-none absolute top-0.5 ml-1 block truncate text-text" style={{ left: lage.left, maxWidth: platz }}>
                  <span className="text-text-gedaempft tabular-nums">{zeit}</span> {erster.titel}
                </span>
              )}
            </Fragment>
          )
        }),
      )}

      {p.treibgut.length > 0 &&
        !p.kopfzeileBelegt &&
        kopien.map((k) => (
          <button
            key={k}
            type="button"
            tabIndex={k === p.kopie ? 0 : -1}
            aria-hidden={k !== p.kopie || undefined}
            aria-label={`${p.treibgut.length} offene Aufgaben ohne Uhrzeit`}
            onClick={(ev) => oeffne(ev.currentTarget, 'treibgut', [])}
            className={cn(fokus, 'kurve-schrift drueck absolute top-0.5 ml-1 flex cursor-pointer items-center gap-0.5 bg-knopf-ton px-1.5 text-text-gedaempft')}
            style={{ left: links(k, p.minuteJetzt) }}
          >
            <ListTodo aria-hidden className="size-3" />
            {p.treibgut.length}
          </button>
        ))}

      {p.wetter &&
        !p.kopfzeileBelegt &&
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
  verschiebe: (e: Eintrag, delta: number, art?: Ziehart) => Promise<void>
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

function TerminKarte({ t, verschiebe, aendere }: { t: Punkt | Band; verschiebe: (e: Eintrag, delta: number, art?: Ziehart) => Promise<void>; aendere: Aendere }) {
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
        <Knopf groesse="klein" onClick={() => void verschiebe(e, ZIEH_RASTER, 'ende')}>
          {ZIEH_RASTER} Min. länger
        </Knopf>
        <Knopf groesse="klein" onClick={() => void verschiebe(e, -ZIEH_RASTER, 'ende')}>
          {ZIEH_RASTER} Min. kürzer
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

/** Kopfzeile der Kurve: Fehler, eine frische Meldung und der frische Schritt mit „Rückgängig". Ohne eigene Fläche; die übrige obere
 *  Zeile macht Platz. Ist die Kurve aus, steht derselbe Inhalt am unteren Rand (`className` setzt dann die Lage). */
export function KurveKopfzeile({ schritt, fehler, meldung, className }: { schritt?: Schritt; fehler: string[]; meldung?: Meldung; className?: string }) {
  return (
    <div className={cn('kurve-schrift pointer-events-none flex min-w-0 items-center gap-3', className ?? 'absolute top-0.5 right-10 left-2')}>
      {fehler.map((f) => (
        <p key={f} role="alert" className="truncate text-warnung">
          {f}
        </p>
      ))}
      {meldung && (
        <p role="status" className={cn('truncate', meldung.wichtig ? 'text-warnung' : 'text-text')}>
          {meldung.text}
        </p>
      )}
      {schritt && (
        <p role="status" className="flex min-w-0 items-center gap-2 text-text">
          <span className="truncate">{schritt.text}</span>
          <Knopf groesse="klein" art="leise" className="pointer-events-auto" onClick={() => rueckgaengig()}>
            Rückgängig
          </Knopf>
        </p>
      )}
    </div>
  )
}
