import type { ComponentProps } from 'react'
import { Separator } from 'react-resizable-panels'
import { cn } from './cn'

// Zieh-Griff zwischen zwei Flächen (react-resizable-panels). Unsichtbar, beim Darüberfahren eine feine Linie.
// `richtung`: „senkrecht" trennt links und rechts, „waagrecht" oben und unten.
export function Trenner({ richtung = 'senkrecht', className, ...rest }: ComponentProps<typeof Separator> & { richtung?: 'senkrecht' | 'waagrecht' }) {
  const senkrecht = richtung === 'senkrecht'
  return (
    <Separator className={cn('group flex items-center justify-center outline-none', senkrecht ? 'w-2' : 'h-2', className)} {...rest}>
      <div
        className={cn(
          'bg-durchsichtig group-hover:bg-linie-stark group-focus-visible:bg-akzent',
          senkrecht ? 'h-full w-0.5' : 'h-0.5 w-full',
        )}
      />
    </Separator>
  )
}
