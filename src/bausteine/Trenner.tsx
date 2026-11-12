import type { ComponentProps } from 'react'
import { Separator } from 'react-resizable-panels'
import { cn } from './cn'

// Zieh-Griff zwischen zwei Flächen (react-resizable-panels). Unsichtbar, beim Darüberfahren eine feine Linie.
// `richtung`: „senkrecht" trennt links und rechts, „waagrecht" oben und unten.
// `dicke`: „abstand" zwischen zwei Flächen (ab Werk), „rand" wenn der Griff am Bildschirmrand liegt.
const dicken = { abstand: { senkrecht: 'w-abstand', waagrecht: 'h-abstand' }, rand: { senkrecht: 'w-rand', waagrecht: 'h-rand' } } as const

type Props = ComponentProps<typeof Separator> & { richtung?: 'senkrecht' | 'waagrecht'; dicke?: keyof typeof dicken }

export function Trenner({ richtung = 'senkrecht', dicke = 'abstand', className, ...rest }: Props) {
  const senkrecht = richtung === 'senkrecht'
  return (
    <Separator className={cn('group flex items-center justify-center outline-none', dicken[dicke][richtung], className)} {...rest}>
      <div
        className={cn(
          'bg-durchsichtig group-hover:bg-linie-stark group-focus-visible:bg-akzent',
          senkrecht ? 'h-full w-0.5' : 'h-0.5 w-full',
        )}
      />
    </Separator>
  )
}
