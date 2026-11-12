import * as Popover from '@radix-ui/react-popover'
import type { ComponentProps } from 'react'
import { cn } from './cn'

// Schwebende Karte an einem Knopf oder Anker (shadcn-Popover auf Radix): Lage am Rand, Esc, Klick daneben und Fokus macht Radix.
// `Aufklapp` hält offen/zu, `AufklappKnopf` öffnet, `AufklappAnker` (wahlweise) gibt Lage und Breite vor.
export const Aufklapp = Popover.Root
export const AufklappKnopf = Popover.Trigger
export const AufklappAnker = Popover.Anchor

/** Die Karte selbst: Glas `flaeche-schwebend`, so breit wie der Anker, bei wenig Platz scrollt sie. */
export function AufklappInhalt({ className, sideOffset = 8, collisionPadding = 8, ...rest }: ComponentProps<typeof Popover.Content>) {
  return (
    <Popover.Portal>
      <Popover.Content sideOffset={sideOffset} collisionPadding={collisionPadding} className={cn('flaeche-schwebend aufklapp', className)} {...rest} />
    </Popover.Portal>
  )
}
