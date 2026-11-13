import { Fragment, Suspense, lazy, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { uhrzeit } from './format'
import { cn } from '../bausteine/cn'
import { Knopf } from '../bausteine/Knopf'
import { MIN_TAG, ausduennen, vonOben } from '../logik/gezeiten'
import { aufRaster, buendeln, gezogen, hoeheBei, schildBreite, verschoben, type Band, type Punkt, type Ziehart } from '../logik/kurveEintraege'
import type { Meldung } from '../logik/meldungen'
import type { Aenderung, Eintrag } from '../vertrag/eintrag'
import type { WetterStunde } from '../vertrag/wetter'
import { rueckgaengig, type Schritt } from './rueckgaengig'
import { kurve } from '../werte/kurve'
import type { Karte } from './KurveKarte'

/** Die Karte lädt nach dem Start nach (Startpaket unter 200 KB). */
const KurveKarte = lazy(() => import('./KurveKarte'))

// Einträge auf der Gezeitenkurve (docs/konzept/06-gezeitenkurve.md): Punkte mit Karte, Bänder dahinter, Bündel,
// Überschneidung, Treibgut an der Jetzt-Linie, Wetterzeile. Termine zieht man im 15-Minuten-Raster, Bänder auch an ihren Enden
// (Dauer); alles lässt sich zurücknehmen.
// Lage von hinten nach vorn ergibt sich aus der Reihenfolge: Wasser (in Gezeitenkurve davor), Bänder, `linie` (Linie,
// Jetzt-Linie, Stundenzahlen), dann Punkte, Beschriftungen, Treibgut und Wetter.
// Liegt im selben Scrollbereich wie die Kurve, dreimal nebeneinander. Per Tastatur bedienbar ist nur die Kopie in der Mitte (`kopie`).

const { fingerPx, schildMaxPx, schildMinPx, schildLueckePx, jetztBreitePx, wetterAbstandPx, ziehAbPx } = kurve

export type Aendere = (e: Eintrag, aenderung: Aenderung, text: string) => Promise<void>

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
  /** Liegt eine Meldung über der oberen Zeile (Handy klein), machen Wetter und Jetzt-Angabe Platz. */
  kopfzeileBelegt: boolean
  /** Schildchen an den Punkten zeigen (nicht in der kleinen Kurve am Handy). */
  schilder: boolean
  /** „Jetzt 23:06“ oben an der Jetzt-Linie. */
  jetztText: string
}) {
  const { punkte, baender, werte, pxProMinute, aendere } = p
  const [zug, setZug] = useState<{ id: string; delta: number; art: Ziehart } | null>(null)
  const [karte, setKarte] = useState<Karte | null>(null)
  const start = useRef<{ x: number; bewegt: boolean } | null>(null)
  const geschoben = useRef(false)

  const verschiebe = (e: Eintrag, delta: number, art: Ziehart = 'lage') => {
    const neu = gezogen(e, art, delta)
    const text = art === 'lage' ? `auf ${uhrzeit(neu.beginn)}` : `jetzt ${uhrzeit(neu.beginn)}–${uhrzeit(neu.ende)}`
    return aendere(e, neu, `„${e.titel}" ${text}`)
  }

  const oeffne = (anker: HTMLElement, art: Karte['art'], ids: string[]) => setKarte({ art, ids, anker })

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
      if (!s.bewegt && Math.abs(dx) < ziehAbPx) return
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
  const gruppen = buendeln(punkte, fingerPx / pxProMinute)
  const breiten = schildBreite(
    gruppen.map((g) => g[0].minute),
    pxProMinute,
    schildMaxPx,
    schildLueckePx,
  )
  const einzeln = gruppen.map((g, i) => ({ g, platz: breiten[i] }))
  // Obere Zeile: Jetzt-Angabe mit Treibgut an der Jetzt-Linie, sonst Wetter; das Wetter weicht der Jetzt-Angabe aus.
  // Abstand nach der Jetzt-Linie, ringförmig über Mitternacht.
  const frei = (minute: number) => {
    const nach = (((minute - p.minuteJetzt) % MIN_TAG) + MIN_TAG) % MIN_TAG
    const luecke = wetterAbstandPx / 2 / pxProMinute
    return nach > (jetztBreitePx + wetterAbstandPx / 2) / pxProMinute && nach < MIN_TAG - luecke
  }
  const schritt = p.marken.length > 1 ? p.marken[1] - p.marken[0] : 1
  const wetterMarken = ausduennen(p.marken, schritt, pxProMinute * 60, wetterAbstandPx)

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
                title={b.titel}
                className={cn(fokus, 'kurve-band kurve-schrift drueck absolute inset-0 flex cursor-grab touch-none items-center px-2 text-left text-text-gedaempft')}
              >
                <span className="truncate">{neu ? `${uhrzeit(neu.beginn)}–${uhrzeit(neu.ende)}` : b.titel}</span>
              </button>
              <span aria-hidden {...ziehen(b.eintrag, 'beginn')} title="Beginn" className="kurve-band-griff left-0 -translate-x-1/2" />
              <span aria-hidden {...ziehen(b.eintrag, 'ende')} title="Ende" className="kurve-band-griff right-0 translate-x-1/2" />
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
          const zeit = uhrzeit(zug?.id === erster.id ? verschoben(erster.eintrag, zug.delta).beginn : erster.eintrag.beginn!)
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
              {p.schilder && platz >= schildMinPx && (
                // Unter dem Punkt, wenn er in der oberen Hälfte liegt, sonst darüber (Vorlage .mk.d / .mk.u).
                <span
                  className={cn('kurve-schild pointer-events-none absolute -translate-x-1/2 text-text', vonOben(hoeheBei(werte, minute)) < 0.5 ? 'mt-3.5' : '-mt-3.5 -translate-y-full')}
                  style={{ ...lage, maxWidth: platz }}
                >
                  <b className="mr-1.5 font-semibold text-akzent tabular-nums">{zeit}</b>
                  {erster.titel}
                </span>
              )}
            </Fragment>
          )
        }),
      )}

      {!p.kopfzeileBelegt &&
        kopien.map((k) => (
          <div key={`jetzt-${k}`} className="absolute top-1 flex -translate-x-1 items-center gap-2" style={{ left: links(k, p.minuteJetzt) }}>
            <span aria-hidden className="kurve-jetzt-punkt" />
            <span className="kurve-schrift font-semibold text-akzent tabular-nums">{p.jetztText}</span>
            {p.treibgut.length > 0 && (
              <button
                type="button"
                tabIndex={k === p.kopie ? 0 : -1}
                aria-hidden={k !== p.kopie || undefined}
                onClick={(ev) => oeffne(ev.currentTarget, 'treibgut', [])}
                className={cn(fokus, 'kurve-schrift drueck cursor-pointer border border-linie bg-knopf-ton px-2 font-semibold text-text hover:text-akzent')}
              >
                {p.treibgut.length} offen treiben mit
              </button>
            )}
          </div>
        ))}

      {p.wetter &&
        !p.kopfzeileBelegt &&
        wetterMarken.map((h) => {
          const w = p.wetter!.get(h % 24)
          if (!w || !frei((h % 24) * 60)) return null
          return (
            <span
              key={h}
              className="kurve-schrift pointer-events-none absolute top-1 -translate-x-1/2 whitespace-nowrap text-text-blass tabular-nums"
              style={{ left: `${(h / 72) * 100}%` }}
            >
              {w.grad}°{w.regenChance > 0 && ` · ${w.regenChance} % Regen`}
            </span>
          )
        })}

      <Suspense>
        <KurveKarte
          karte={karte}
          schliessen={() => setKarte(null)}
          waehle={(id) => setKarte((alt) => alt && { ...alt, ids: [id] })}
          termine={[...punkte, ...baender]}
          treibgut={p.treibgut}
          verschiebe={verschiebe}
          aendere={aendere}
        />
      </Suspense>
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
