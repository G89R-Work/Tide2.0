import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Knopf } from '../../../bausteine/Knopf'
import { cn } from '../../../bausteine/cn'

type Props = Omit<ComponentProps<typeof Knopf>, 'children' | 'alsKind'> & { symbol: LucideIcon; text: string; href?: string }

/** Knopf neben der Wochenleiste (Vorlage .calbtn): Symbol und kleine Beschriftung untereinander; mit `href` ein Link. */
export function Leistenknopf({ symbol: Zeichen, text, href, className, ...rest }: Props) {
  const inhalt = (
    <>
      <Zeichen aria-hidden className="size-5" />
      <span className="max-w-full truncate text-xs">{text}</span>
    </>
  )
  return (
    <Knopf art="leise" alsKind={href !== undefined} className={cn('h-full w-full flex-col gap-1 px-1 text-text', className)} {...rest}>
      {href === undefined ? inhalt : <a href={href}>{inhalt}</a>}
    </Knopf>
  )
}
