import type { ComponentProps } from 'react'
import { cn } from './cn'

// Eingabefeld für Text, Zahlen und Suche; sieht aus wie die Auswahl.
export function Eingabe({ className, ...rest }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-11 min-w-0 rounded-knopf border border-linie-stark bg-knopf-ton px-3 text-sm text-text outline-none placeholder:text-text-gedaempft focus-visible:ring-2 focus-visible:ring-akzent',
        className,
      )}
      {...rest}
    />
  )
}
