import { Plus } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Knopf } from '../bausteine/Knopf'
import { cn } from '../bausteine/cn'
import { aktionVon } from '../logik/aktionen'
import { aktionSymbole, titelVon } from './aktionSymbole'
import { fuehreAus } from './befehle'

// Ein belegbarer Platz: zeigt die Aktion als Symbol-Knopf. Noch nicht gebaute Aktionen sind ausgegraut und sagen, wann sie kommen.
// `mitName`: kleiner Knopf mit Symbol und Namen (etwa im Leser des Postfachs).
type KnopfStil = ComponentProps<typeof Knopf>
type Props = { id: string | null; art?: KnopfStil['art']; groesse?: KnopfStil['groesse']; mitName?: boolean; className?: string }

export function AktionKnopf({ id, art, groesse, mitName = false, className }: Props) {
  const a = id ? aktionVon(id) : undefined
  if (!a) return null
  const Symbol = aktionSymbole[a.id] ?? Plus
  const inhalt = mitName ? (
    <>
      <Symbol aria-hidden className="size-4" /> {a.name}
    </>
  ) : (
    <Symbol aria-hidden className={groesse === 'klein' ? 'size-4' : 'size-5'} />
  )
  const stil = { art: art ?? (mitName ? 'standard' : 'symbol'), groesse: groesse ?? (mitName ? 'klein' : 'normal') }
  if (a.ziel)
    return (
      <Knopf alsKind {...stil} className={className}>
        <a href={a.ziel} aria-label={a.name} title={titelVon(a)}>
          {inhalt}
        </a>
      </Knopf>
    )
  if (a.befehl)
    return (
      <Knopf {...stil} className={className} aria-label={a.name} title={titelVon(a)} onClick={() => fuehreAus(a.id)}>
        {inhalt}
      </Knopf>
    )
  return (
    <Knopf {...stil} className={cn('cursor-default opacity-40', className)} aria-disabled aria-label={a.name} title={titelVon(a)}>
      {inhalt}
    </Knopf>
  )
}
