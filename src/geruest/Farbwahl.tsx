import type { ComponentProps } from 'react'
import { Auswahl } from '../bausteine/Auswahl'
import { cn } from '../bausteine/cn'
import { ordnerFarbeSchema, type OrdnerFarbe } from '../vertrag/postfach'
import { ordnerFarben } from '../werte/ordner'

// Die Farben aus src/werte/ordner.ts (Ordner, Kategorien, Schichtarten): Auswahl und Punkt.

/** Auswahl einer der Farben. */
export function Farbwahl({ wert, aendern, ...rest }: Omit<ComponentProps<'select'>, 'value' | 'onChange'> & { wert: OrdnerFarbe; aendern: (f: OrdnerFarbe) => void }) {
  return (
    <Auswahl value={wert} onChange={(e) => aendern(ordnerFarbeSchema.parse(e.target.value))} {...rest}>
      {ordnerFarbeSchema.options.map((f) => (
        <option key={f} value={f}>
          {ordnerFarben[f].name}
        </option>
      ))}
    </Auswahl>
  )
}

/** Kleiner runder Punkt in der Farbe. */
export function Farbpunkt({ farbe }: { farbe: OrdnerFarbe }) {
  return <span aria-hidden className={cn('size-2 shrink-0 rounded-voll bg-current', ordnerFarben[farbe].klasse)} />
}
