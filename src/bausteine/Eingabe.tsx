import type { ComponentProps } from 'react'
import { cn } from './cn'

/** Aussehen jedes Eingabefelds (einzeilig und mehrzeilig); wie die Auswahl. */
const feld = 'min-w-0 rounded-knopf border border-linie-stark bg-knopf-ton px-3 text-sm text-text outline-none placeholder:text-text-gedaempft focus-visible:ring-2 focus-visible:ring-akzent'

// Eingabefeld für Text, Zahlen und Suche.
export function Eingabe({ className, ...rest }: ComponentProps<'input'>) {
  return <input className={cn('h-11', feld, className)} {...rest} />
}

// Mehrzeiliges Feld für längere Texte (Mail, Notiz); wächst nicht von selbst, scrollt innen.
export function Textfeld({ className, ...rest }: ComponentProps<'textarea'>) {
  return <textarea className={cn('resize-y py-2 leading-relaxed', feld, className)} {...rest} />
}
