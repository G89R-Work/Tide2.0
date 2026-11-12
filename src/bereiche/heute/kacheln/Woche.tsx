import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { cn } from '../../../bausteine/cn'
import { fuellstand, monatsTage, tagSchluessel } from '../../../logik/heute'
import type { Eintrag } from '../../../vertrag/eintrag'
import { monatName, tagKurz, tagLang } from '../format'


type Props = { termine: readonly Eintrag[]; monat: Date; fokus: Date; jetzt: Date }

/** Wochenleiste: die Tage des Monats mit Füllstand, sieben sichtbar, wischbar innerhalb des Monats. */
export function Woche({ termine, monat, fokus, jetzt }: Props) {
  const scroller = useRef<HTMLOListElement>(null)
  const tage = monatsTage(monat)
  const heute = tagSchluessel(jetzt)
  const ziel = fokus.getTime()

  // Beim Öffnen und nach einer Wahl im Monatskalender: der gewählte Tag steht vorn.
  useLayoutEffect(() => {
    const el = scroller.current
    const tag = new Date(ziel)
    if (el) el.scrollLeft = (tag.getDate() - 1) * (el.clientWidth / 7)
  }, [ziel])

  return (
    <ol ref={scroller} className="tage-scroller h-full" aria-label={`Tage im ${monatName(monat)}`}>
      {tage.map((t) => {
        const f = fuellstand(termine, t)
        const ist = tagSchluessel(t) === heute
        return (
          <li key={t.getTime()} title={`${tagLang(t)}: ${Math.round(f * 100)} % belegt`} className="p-0.5">
            <div className={cn('flex h-full flex-col items-center justify-center gap-1.5 rounded-knopf', ist && 'border border-akzent bg-knopf-ton')}>
              <span className={cn('text-xs', ist ? 'text-akzent' : 'text-text-gedaempft')}>{tagKurz(t)}</span>
              <span aria-current={ist ? 'date' : undefined} className={cn('font-semibold', ist ? 'text-akzent' : t < jetzt ? 'text-text-gedaempft' : 'text-text')}>
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
  )
}
