import { getISOWeek } from 'date-fns'
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { cn } from '../../../bausteine/cn'
import { useEinstellung } from '../../../geruest/einstellungen'
import { monatName, tagKurz, tagLang } from '../../../geruest/format'
import { useSchmal } from '../../../geruest/useSchmal'
import { einstellung } from '../../../logik/einstellungen'
import { tagesBelegung } from '../../../logik/heute'
import { monatsTage, tagSchluessel } from '../../../logik/zeit'
import type { Eintrag } from '../../../vertrag/eintrag'

const kwZeigen = einstellung('kalenderwoche')

type Props = {
  termine: readonly Eintrag[]
  monat: Date
  fokus: Date
  jetzt: Date
  /** Name des Feiertags an diesem Tag, sonst undefined. */
  feiertag: (tag: Date) => string | undefined
}

/** Wochenleiste wie die Vorlage: Wochentag, Datum, Füllstand, Buchstabe der Schicht (nur PC und Tablet); sieben sichtbar, wischbar innerhalb des Monats. */
export function Woche({ termine, monat, fokus, jetzt, feiertag }: Props) {
  const scroller = useRef<HTMLOListElement>(null)
  const kw = useEinstellung(kwZeigen)
  // Am Handy ist die Spalte zu schmal für den Buchstaben der Schicht neben dem Wochentag.
  const schichtZeigen = !useSchmal()
  // Gerechnet nur, wenn Monat oder Termine wechseln, nicht bei jedem Scroll-Schritt.
  const monatMs = monat.getTime()
  const { tage, belegung } = useMemo(() => {
    const t = monatsTage(new Date(monatMs))
    return { tage: t, belegung: tagesBelegung(termine, t) }
  }, [monatMs, termine])
  // Erster sichtbarer Tag; nach ihm richtet sich die Kalenderwoche oben links.
  const [vorn, setVorn] = useState(fokus.getDate() - 1)
  const heute = tagSchluessel(jetzt)
  const ziel = fokus.getTime()

  // Beim Öffnen und nach einer Wahl im Monatskalender: der gewählte Tag steht vorn.
  useLayoutEffect(() => {
    const el = scroller.current
    const tag = new Date(ziel)
    if (el) el.scrollLeft = (tag.getDate() - 1) * (el.clientWidth / 7)
  }, [ziel])

  const ersterSichtbar = tage[Math.min(tage.length - 1, Math.max(0, vorn))]
  return (
    <div className="flex h-full flex-col">
      {kw && <p className="beschriftung leading-none">KW {getISOWeek(ersterSichtbar)}</p>}
      <ol
        ref={scroller}
        className="tage-scroller min-h-0 flex-1"
        aria-label={`Tage im ${monatName(monat)}`}
        onScroll={(e) => setVorn(Math.round(e.currentTarget.scrollLeft / (e.currentTarget.clientWidth / 7)))}
      >
        {tage.map((t, i) => {
          const { anteil: f, schicht: buchstabe } = belegung[i]
          const ist = tagSchluessel(t) === heute
          const name = feiertag(t)
          const schicht = schichtZeigen ? buchstabe : null
          return (
            <li key={t.getTime()} title={`${tagLang(t)}${name ? `, ${name}` : ''}: ${Math.round(f * 100)} % belegt`} className="p-0.5">
              <div className={cn('relative flex h-full flex-col items-center justify-center gap-0.5 rounded-knopf border border-durchsichtig', ist && 'tag-heute')}>
                {schicht && (
                  <span aria-label={`Schicht ${schicht}`} className="schicht-buchstabe absolute top-0.5 right-0.5 text-akzent-2">
                    {schicht}
                  </span>
                )}
                <span className="text-xs text-text-gedaempft">{tagKurz(t)}</span>
                <span aria-current={ist ? 'date' : undefined} className={cn('text-sm font-semibold tabular-nums', ist || name ? 'text-akzent' : 'text-text')}>
                  {t.getDate()}
                </span>
                <span className="tag-fuellung" style={{ '--anteil': f } as CSSProperties}>
                  <span />
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
