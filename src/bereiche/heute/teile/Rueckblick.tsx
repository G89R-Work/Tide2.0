import { History } from 'lucide-react'
import { useId } from 'react'
import { Leistenknopf } from './Leistenknopf'
import type { Rueckblick as Zahlen } from '../../../logik/heute'

/** Knopf „Woche“: öffnet den Rückblick auf die laufende Woche. */
export function Rueckblick({ zahlen }: { zahlen: Zahlen }) {
  const id = useId()
  const werte = [
    [zahlen.termine, zahlen.termine === 1 ? 'Termin' : 'Termine'],
    [zahlen.schichtStunden, 'Std. Schicht'],
    [zahlen.erledigt, 'erledigt'],
  ] as const
  return (
    <>
      <Leistenknopf symbol={History} text="Woche" popoverTarget={id} />
      <div id={id} popover="auto" aria-label="Wochenrückblick" className="flaeche-schwebend schwebende-karte p-4">
        <p className="mb-3 font-medium">Diese Woche bisher</p>
        <dl className="grid grid-cols-3 gap-2 text-center">
          {werte.map(([zahl, name]) => (
            <div key={name}>
              <dd className="heute-zeit">{zahl}</dd>
              <dt className="text-xs text-text-gedaempft">{name}</dt>
            </div>
          ))}
        </dl>
      </div>
    </>
  )
}
