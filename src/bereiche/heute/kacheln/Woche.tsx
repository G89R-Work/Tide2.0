import { CalendarDays, ChevronLeft, ChevronRight, History, NotebookPen } from 'lucide-react'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Knopf } from '../../../bausteine/Knopf'
import { cn } from '../../../bausteine/cn'
import { useEinstellung } from '../../../geruest/einstellungen'
import { einstellungen } from '../../../logik/einstellungen'
import { fuellstand, kalenderwoche, tagSchluessel, wochenrueckblick, wochenTage, type Wochenbeginn } from '../../../logik/heute'
import type { Eintrag } from '../../../vertrag/eintrag'

const wochenbeginn = einstellungen.find((e) => e.id === 'wochenbeginn')!
const kwZeigen = einstellungen.find((e) => e.id === 'kalenderwoche')!
/** Gezeigte Wochen: eine zurück, die laufende, vier voraus. */
const versaetze = [-1, 0, 1, 2, 3, 4]
const start = versaetze.indexOf(0)

const kurzTag = (d: Date) => d.toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', '')
const langTag = (d: Date) => d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })

type Props = { termine: readonly Eintrag[]; eintraege: readonly Eintrag[] | null; jetzt: Date }

/** Wochenleiste: sieben Tage mit Füllstand, wischbar; daneben Monat, Notiz und Wochenrückblick. */
export function Woche({ termine, eintraege, jetzt }: Props) {
  const beginn = useEinstellung(wochenbeginn) as Wochenbeginn
  const kw = useEinstellung(kwZeigen) === true
  const scroller = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(start)
  const [rueckblick, setRueckblick] = useState(false)
  const wochen = versaetze.map((v) => wochenTage(jetzt, beginn, v))
  const heute = tagSchluessel(jetzt)

  useLayoutEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = start * el.clientWidth
  }, [rueckblick])

  const gehe = (schritt: number) => {
    const el = scroller.current
    if (el) el.scrollTo({ left: (index + schritt) * el.clientWidth, behavior: 'smooth' })
  }
  const woche = wochen[index]
  const mitte = woche[3]
  const titel = `${mitte.toLocaleDateString('de-DE', { month: 'long' })}${kw ? ` · KW ${kalenderwoche(mitte)}` : ''}`
  const rb = wochenrueckblick(termine, eintraege ?? [], wochen[start], jetzt)

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center gap-1">
        <p className="min-w-0 flex-1 truncate text-sm font-medium" aria-live="polite">
          {rueckblick ? 'Diese Woche bisher' : titel}
        </p>
        {!rueckblick && (
          <>
            <Knopf art="symbol" groesse="klein" aria-label="Woche zurück" disabled={index === 0} onClick={() => gehe(-1)}>
              <ChevronLeft aria-hidden className="size-4" />
            </Knopf>
            <Knopf art="symbol" groesse="klein" aria-label="Woche vor" disabled={index === versaetze.length - 1} onClick={() => gehe(1)}>
              <ChevronRight aria-hidden className="size-4" />
            </Knopf>
          </>
        )}
        <Knopf alsKind art="symbol" groesse="klein" title="Monat">
          <a href="#kalender/monat" aria-label="Monat">
            <CalendarDays aria-hidden className="size-4" />
          </a>
        </Knopf>
        <Knopf alsKind art="symbol" groesse="klein" title="Notiz">
          <a href="#notizen" aria-label="Notiz">
            <NotebookPen aria-hidden className="size-4" />
          </a>
        </Knopf>
        <Knopf art="symbol" groesse="klein" title="Wochenrückblick" aria-label="Wochenrückblick" aria-pressed={rueckblick} onClick={() => setRueckblick(!rueckblick)} className={cn(rueckblick && 'bg-knopf-ton text-text')}>
          <History aria-hidden className="size-4" />
        </Knopf>
      </div>
      {rueckblick ? (
        <dl className="grid flex-1 grid-cols-3 items-center gap-2 text-center">
          {[
            [rb.termine, rb.termine === 1 ? 'Termin' : 'Termine'],
            [rb.schichtStunden, 'Std. Schicht'],
            [rb.erledigt, 'erledigt'],
          ].map(([zahl, name]) => (
            <div key={name}>
              <dd className="heute-zeit">{zahl}</dd>
              <dt className="text-xs text-text-gedaempft">{name}</dt>
            </div>
          ))}
        </dl>
      ) : (
        <div ref={scroller} className="wochen-scroller flex-1" onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}>
          {wochen.map((tage, w) => (
            <ol key={w} className="grid grid-cols-7" aria-label={`Woche ab ${langTag(tage[0])}`} inert={w !== index}>
              {tage.map((t) => {
                const f = fuellstand(termine, t)
                const ist = tagSchluessel(t) === heute
                return (
                  <li key={t.getTime()} className="flex flex-col items-center gap-1" title={`${langTag(t)}: ${Math.round(f * 100)} % belegt`}>
                    <span className="text-xs text-text-gedaempft">{kurzTag(t)}</span>
                    <span className="tag-fuellung" style={{ '--anteil': f } as CSSProperties}>
                      <span />
                    </span>
                    <span className={cn('grid size-6 place-items-center rounded-voll text-xs', ist ? 'bg-akzent font-semibold text-auf-akzent' : t < jetzt ? 'text-text-gedaempft' : 'text-text')}>{t.getDate()}</span>
                  </li>
                )
              })}
            </ol>
          ))}
        </div>
      )}
    </div>
  )
}
