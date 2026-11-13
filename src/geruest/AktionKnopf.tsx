import { Plus } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Knopf } from '../bausteine/Knopf'
import { cn } from '../bausteine/cn'
import { aktionVon } from '../logik/aktionen'
import { aktionSymbole, titelVon } from './aktionSymbole'
import { fuehreAus } from './befehle'

// Ein belegbarer Platz: zeigt die Aktion als Symbol-Knopf. Noch nicht gebaute Aktionen sind ausgegraut und sagen, wann sie kommen.
type Props = { id: string | null; art?: ComponentProps<typeof Knopf>['art']; className?: string }

export function AktionKnopf({ id, art = 'symbol', className }: Props) {
  const a = id ? aktionVon(id) : undefined
  if (!a) return null
  const Symbol = aktionSymbole[a.id] ?? Plus
  const inhalt = <Symbol aria-hidden className="size-5" />
  if (a.ziel)
    return (
      <Knopf alsKind art={art} className={className}>
        <a href={a.ziel} aria-label={a.name} title={titelVon(a)}>
          {inhalt}
        </a>
      </Knopf>
    )
  if (a.befehl)
    return (
      <Knopf art={art} className={className} aria-label={a.name} title={titelVon(a)} onClick={() => fuehreAus(a.id)}>
        {inhalt}
      </Knopf>
    )
  return (
    <Knopf art={art} className={cn('cursor-default opacity-40', className)} aria-disabled aria-label={a.name} title={titelVon(a)}>
      {inhalt}
    </Knopf>
  )
}
