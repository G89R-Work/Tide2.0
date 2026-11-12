import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../bausteine/cn'
import { Knopf } from '../bausteine/Knopf'
import { einstellungen } from '../logik/einstellungen'
import {
  MIN_TAG,
  ebbeFlut,
  endlos,
  glaetten,
  minutenAmTag,
  naechste,
  scrollFuer,
  stundenSchritt,
  tagBreite,
  tagesPfade,
  zeitBei,
} from '../logik/gezeiten'
import { ordne } from '../logik/kurveEintraege'
import { useEinstellung } from './einstellungen'
import { KurveEintraege, KurveMeldung } from './KurveEintraege'
import { useTermine, useTreibgut, useWetter } from './kurveDaten'
import { setzeGezeigteZeit } from './gezeigteZeit'
import { useMinute } from './useMinute'

// Gezeitenkurve (docs/konzept/06-gezeitenkurve.md). Eine gezeichnete Linie, dreimal nebeneinander; der Browser scrollt sie.
// Folgt der Uhrzeit, bis jemand selbst scrollt; „Zu jetzt" gleitet zurück. Die Mitte zeigt die Uhrzeit, die den Hintergrund steuert.
// Im Ruhezustand läuft nichts: gerechnet wird nur beim Laden, beim Scrollen und einmal pro Minute.
const nach = (id: string) => einstellungen.find((e) => e.id === id)!
const e = { stunden: nach('kurve-stunden'), ganzerTag: nach('kurve-ganzer-tag'), wetter: nach('kurve-wetter') }

const HOEHE = 100
// Zweimal gemittelt über ±30 Minuten: weiche, ruhige Wellen (Wunsch des Nutzers); kurze Termine werden flache Hügel.
const GLAETTEN = 6

const tagBeginnVon = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const zweistellig = (n: number) => String(n).padStart(2, '0')
const uhrzeit = (m: number) => `${zweistellig(Math.floor(m / 60) % 24)}:${zweistellig(Math.floor(m % 60))}`
const leiseGleiten = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth')

export function Gezeitenkurve({ className }: { className?: string }) {
  const jetzt = useMinute()
  const ganzerTag = useEinstellung(e.ganzerTag) === true
  const gewaehlt = Number(useEinstellung(e.stunden))
  const stunden = ganzerTag ? 24 : gewaehlt
  const tagStart = tagBeginnVon(jetzt).getTime()
  const termine = useTermine(tagStart)
  const treibgut = useTreibgut()
  const wetter = useWetter(tagStart, useEinstellung(e.wetter) === true)

  const scroller = useRef<HTMLDivElement>(null)
  const [sichtbar, setSichtbar] = useState(0)
  const [folgt, setFolgt] = useState(true)
  const [kopie, setKopie] = useState(1)
  const [gezeigt, setGezeigt] = useState(() => minutenAmTag(jetzt))
  const gleitet = useRef(false)
  // Für die Effekte: gezeigte Minute ohne neuen Lauf bei jedem Scrollschritt.
  const gezeigtJetzt = useRef(gezeigt)
  const tag = tagBreite(sichtbar, stunden)

  const { pfade, werte, eintraege } = useMemo(() => {
    const liste = termine.liste ?? []
    const zeitraeume = liste.map((t) => ({ beginn: new Date(t.beginn!), ende: new Date(t.ende!) }))
    const werte = glaetten(glaetten(ebbeFlut(zeitraeume, new Date(tagStart)), GLAETTEN), GLAETTEN)
    return { werte, pfade: tagesPfade(werte, HOEHE), eintraege: ordne(liste, new Date(tagStart)) }
  }, [termine.liste, tagStart])

  // Breite des Sichtfelds messen; ändert sich nur bei Größenänderung.
  useLayoutEffect(() => {
    const el = scroller.current!
    const beobachter = new ResizeObserver(() => setSichtbar(el.clientWidth))
    beobachter.observe(el)
    return () => beobachter.disconnect()
  }, [])

  // Uhrzeit festhalten: folgt sie, steht jetzt in der Mitte, sonst die zuletzt gezeigte Uhrzeit (auch nach Größenänderung).
  const minuteJetzt = minutenAmTag(jetzt)
  useLayoutEffect(() => {
    const el = scroller.current
    if (!el || !tag || gleitet.current) return
    el.scrollLeft = scrollFuer(folgt ? minuteJetzt : gezeigtJetzt.current, sichtbar, tag)
  }, [folgt, minuteJetzt, sichtbar, tag])

  // Selbst scrollen beendet das Folgen. Senkrechtes Mausrad scrollt waagrecht.
  useEffect(() => {
    const el = scroller.current!
    const selbst = () => {
      gleitet.current = false
      setFolgt(false)
    }
    const taste = (ereignis: KeyboardEvent) => {
      if (/^(Arrow|Page|Home|End)/.test(ereignis.key)) selbst()
    }
    const rad = (ereignis: WheelEvent) => {
      selbst()
      if (Math.abs(ereignis.deltaY) <= Math.abs(ereignis.deltaX)) return
      ereignis.preventDefault()
      el.scrollLeft += ereignis.deltaY
    }
    const ende = () => {
      if (!gleitet.current) return
      gleitet.current = false
      setFolgt(true)
    }
    el.addEventListener('wheel', rad, { passive: false })
    el.addEventListener('pointerdown', selbst)
    el.addEventListener('keydown', taste)
    el.addEventListener('scrollend', ende)
    return () => {
      el.removeEventListener('wheel', rad)
      el.removeEventListener('pointerdown', selbst)
      el.removeEventListener('keydown', taste)
      el.removeEventListener('scrollend', ende)
    }
  }, [])

  // Hintergrund folgt der gezeigten Uhrzeit, solange die Kurve nicht der echten folgt.
  useEffect(() => {
    setzeGezeigteZeit(folgt ? null : new Date(tagStart + gezeigt * 60_000))
  }, [folgt, gezeigt, tagStart])
  useEffect(() => () => setzeGezeigteZeit(null), [])

  const beimScrollen = () => {
    const el = scroller.current!
    if (!tag) return
    if (!gleitet.current) {
      const neu = endlos(el.scrollLeft, tag)
      if (neu !== el.scrollLeft) el.scrollLeft = neu
    }
    // Welche der drei Kopien gerade in der Mitte steht: nur sie ist per Tastatur bedienbar.
    const k = Math.floor((el.scrollLeft + sichtbar / 2) / tag)
    if (k !== kopie) setKopie(k)
    const m = Math.round(zeitBei(el.scrollLeft, sichtbar, tag))
    gezeigtJetzt.current = m
    if (m !== gezeigt) setGezeigt(m)
  }

  const zuJetzt = () => {
    const el = scroller.current!
    const ziel = naechste(scrollFuer(minuteJetzt, sichtbar, tag), el.scrollLeft, tag)
    // Erst nach dem Gleiten wieder folgen (scrollend); ohne Weg oder ohne scrollend sofort bzw. nach einer Sekunde.
    if (Math.abs(ziel - el.scrollLeft) < 1) return setFolgt(true)
    gleitet.current = true
    el.scrollTo({ left: ziel, behavior: leiseGleiten() })
    setTimeout(() => el.dispatchEvent(new Event('scrollend')), 1000)
  }

  const schritt = stundenSchritt(sichtbar / stunden)
  const marken = useMemo(() => Array.from({ length: (72 / schritt) | 0 }, (_, i) => i * schritt), [schritt])

  return (
    <section aria-label="Gezeitenkurve" className={cn('flaeche-leiste relative h-full overflow-hidden', className)}>
      <div ref={scroller} tabIndex={0} onScroll={beimScrollen} className="kurve-scroller h-full outline-none">
        <div className="relative h-full" style={{ width: tag * 3 }}>
          {tag > 0 && (
            <KurveEintraege
              {...eintraege}
              werte={werte}
              pxProMinute={tag / MIN_TAG}
              minuteJetzt={minuteJetzt}
              kopie={kopie}
              marken={marken}
              aendere={termine.aendere}
              treibgut={treibgut.liste}
              wetter={wetter.stunden}
            />
          )}
          <svg viewBox={`0 0 ${MIN_TAG * 3} ${HOEHE}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <g id="kurve-tag">
                <path d={pfade.flaeche} className="kurve-wasser" />
                <path d={pfade.linie} className="kurve-linie" vectorEffect="non-scaling-stroke" />
              </g>
            </defs>
            {[0, 1, 2].map((k) => (
              <g key={k}>
                <use href="#kurve-tag" x={k * MIN_TAG} />
                <line x1={k * MIN_TAG + minuteJetzt} x2={k * MIN_TAG + minuteJetzt} y1={0} y2={HOEHE} className="kurve-jetzt" vectorEffect="non-scaling-stroke" />
              </g>
            ))}
          </svg>
          {marken.map((h) => (
            <span key={h} className="absolute bottom-1 -translate-x-1/2 text-xs text-text-blass tabular-nums" style={{ left: `${(h / 72) * 100}%` }}>
              {h % 24}
            </span>
          ))}
        </div>
      </div>
      <div className="kurve-mitte" />
      {!folgt && (
        <>
          <span className="pointer-events-none absolute top-0.5 left-1/2 ml-2 rounded-knopf bg-grund px-1 text-xs font-medium text-text tabular-nums">{uhrzeit(gezeigt)}</span>
          <Knopf groesse="klein" className="absolute top-1/2 right-2 -translate-y-1/2" onClick={zuJetzt}>
            Zu jetzt
          </Knopf>
        </>
      )}
      <KurveMeldung />
      {[termine.fehler, treibgut.fehler, wetter.fehler].filter(Boolean).map((f) => (
        <p key={f} role="alert" className="absolute top-1 left-2 rounded-knopf bg-grund px-2 text-xs text-warnung">
          {f}
        </p>
      ))}
    </section>
  )
}
