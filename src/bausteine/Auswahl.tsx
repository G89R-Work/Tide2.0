import type { ComponentProps } from 'react'
import { cn } from './cn'

// Auswahlfeld: das native select des Geräts, damit Handy und PC ihre gewohnte Liste zeigen.
export function Auswahl({ className, ...rest }: ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-11 min-w-0 cursor-pointer rounded-knopf border border-linie-stark bg-knopf-ton px-3 text-sm text-text outline-none hover:bg-knopf-ton-hover focus-visible:ring-2 focus-visible:ring-akzent',
        className,
      )}
      {...rest}
    />
  )
}
