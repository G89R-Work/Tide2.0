import type { ComponentProps } from 'react'
import { cn } from './cn'

// Schalter für an/aus: ein natives Kästchen mit role="switch", damit Tastatur und Vorlesen wie gewohnt gehen.
export function Schalter({ className, ...rest }: Omit<ComponentProps<'input'>, 'type'>) {
  return (
    <input
      type="checkbox"
      role="switch"
      className={cn(
        'schalter outline-none focus-visible:ring-2 focus-visible:ring-akzent focus-visible:ring-offset-2 focus-visible:ring-offset-grund disabled:opacity-40',
        className,
      )}
      {...rest}
    />
  )
}
