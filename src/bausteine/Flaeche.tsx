import type { ComponentProps } from 'react'
import { cn } from './cn'

// Drei Arten von Flächen, Werte aus src/werte/. Kein Glas in Glas.
const arten = {
  leiste: 'flaeche-leiste',
  kachel: 'flaeche-kachel',
  schwebend: 'flaeche-schwebend',
} as const

type FlaecheProps = ComponentProps<'div'> & { art?: keyof typeof arten }

export function Flaeche({ art = 'kachel', className, ...rest }: FlaecheProps) {
  return <div className={cn(arten[art], className)} {...rest} />
}
