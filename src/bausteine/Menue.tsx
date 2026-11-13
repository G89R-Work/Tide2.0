import * as Kontext from '@radix-ui/react-context-menu'
import { ChevronRight } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from './cn'
import { usePortalZiel } from './portalZiel'

// Menü an einem Element (shadcn Context Menu auf Radix): Rechtsklick, langer Druck und Menütaste öffnen dasselbe Menü.
// Lage am Rand, Pfeiltasten, Esc und Fokus macht Radix. `MenueUnter` für Untermenüs (Farbe, Verschieben nach).
export const Menue = Kontext.Root
export const MenueAusloeser = Kontext.Trigger
export const MenueUnter = Kontext.Sub

export function MenueInhalt({ className, collisionPadding = 8, ...rest }: ComponentProps<typeof Kontext.Content>) {
  return (
    <Kontext.Portal container={usePortalZiel()}>
      <Kontext.Content collisionPadding={collisionPadding} className={cn('flaeche-schwebend menue', className)} {...rest} />
    </Kontext.Portal>
  )
}

export function MenueUnterInhalt({ className, collisionPadding = 8, ...rest }: ComponentProps<typeof Kontext.SubContent>) {
  return (
    <Kontext.Portal container={usePortalZiel()}>
      <Kontext.SubContent collisionPadding={collisionPadding} className={cn('flaeche-schwebend menue', className)} {...rest} />
    </Kontext.Portal>
  )
}

/** Ein Punkt; `gefahr` färbt ihn als Warnung (Löschen). */
export function MenuePunkt({ className, gefahr = false, ...rest }: ComponentProps<typeof Kontext.Item> & { gefahr?: boolean }) {
  return <Kontext.Item className={cn('menue-punkt', gefahr && 'text-warnung', className)} {...rest} />
}

export function MenueUnterPunkt({ className, children, ...rest }: ComponentProps<typeof Kontext.SubTrigger>) {
  return (
    <Kontext.SubTrigger className={cn('menue-punkt', className)} {...rest}>
      {children}
      <ChevronRight aria-hidden className="ml-auto size-4" />
    </Kontext.SubTrigger>
  )
}

export function MenueTitel({ className, ...rest }: ComponentProps<typeof Kontext.Label>) {
  return <Kontext.Label className={cn('beschriftung truncate px-3 pt-2 pb-1', className)} {...rest} />
}

export function MenueTrenner({ className, ...rest }: ComponentProps<typeof Kontext.Separator>) {
  return <Kontext.Separator className={cn('mx-2 my-1 border-t border-linie', className)} {...rest} />
}
