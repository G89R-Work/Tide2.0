import * as Popover from '@radix-ui/react-popover'
import type { ComponentProps } from 'react'
import { cn } from './cn'
import { usePortalZiel } from './portalZiel'

// Schwebende Karte an einem Knopf oder Anker (shadcn-Popover auf Radix): Lage am Rand, Esc, Klick daneben und Fokus macht Radix.
// `Aufklapp` hält offen/zu, `AufklappKnopf` öffnet, `AufklappAnker` (wahlweise) gibt Lage und Breite vor.
export const Aufklapp = Popover.Root
export const AufklappKnopf = Popover.Trigger
export const AufklappAnker = Popover.Anchor

type InhaltProps = ComponentProps<typeof Popover.Content> & {
  /** `anker`: so breit wie Anker oder Knopf; `inhalt`: so breit wie der Inhalt (Breite dann über `className`). */
  breite?: 'anker' | 'inhalt'
}

/** Die Karte selbst: Glas `flaeche-schwebend`, bei wenig Platz scrollt sie. */
export function AufklappInhalt({ className, breite = 'anker', sideOffset = 8, collisionPadding = 8, ...rest }: InhaltProps) {
  return (
    <Popover.Portal container={usePortalZiel()}>
      <Popover.Content sideOffset={sideOffset} collisionPadding={collisionPadding} className={cn('flaeche-schwebend aufklapp', breite === 'anker' && 'aufklapp-anker', className)} {...rest} />
    </Popover.Portal>
  )
}
