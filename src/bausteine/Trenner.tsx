import type { ComponentProps } from 'react'
import { Separator } from 'react-resizable-panels'
import { cn } from './cn'

// Zieh-Griff zwischen zwei Flächen (react-resizable-panels). Unsichtbar, beim Darüberfahren eine feine Linie.
// `richtung`: „senkrecht" trennt links und rechts, „waagrecht" oben und unten.
// `dicke`: „abstand" zwischen zwei Flächen (ab Werk), „rand" wenn der Griff am Bildschirmrand liegt.
// `griff`: zeigt mittig einen deutlichen Streifen, damit man ihn mit dem Finger trifft (etwa im Bearbeiten-Modus).
const dicken = { abstand: { senkrecht: 'w-abstand', waagrecht: 'h-abstand' }, rand: { senkrecht: 'w-rand', waagrecht: 'h-rand' } } as const

type Props = ComponentProps<typeof Separator> & { richtung?: 'senkrecht' | 'waagrecht'; dicke?: keyof typeof dicken; griff?: boolean }

export function Trenner({ richtung = 'senkrecht', dicke = 'abstand', griff = false, className, ...rest }: Props) {
  const senkrecht = richtung === 'senkrecht'
  return (
    <Separator className={cn('group flex items-center justify-center outline-none', dicken[dicke][richtung], className)} {...rest}>
      {griff ? (
        <div className={cn('rounded-voll bg-akzent', senkrecht ? 'h-12 w-1.5' : 'h-1.5 w-12')} />
      ) : (
        <div
          className={cn(
            'bg-durchsichtig group-hover:bg-linie-stark group-focus-visible:bg-akzent',
            senkrecht ? 'h-full w-0.5' : 'h-0.5 w-full',
          )}
        />
      )}
    </Separator>
  )
}
