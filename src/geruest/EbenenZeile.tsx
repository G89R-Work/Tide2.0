import type { LucideIcon } from 'lucide-react'
import { Knopf } from '../bausteine/Knopf'
import { cn } from '../bausteine/cn'
import { leiste } from '../werte/leiste'

// Eine Zeile der zweiten Ebene: Symbol (frei oder im Kästchen), Name, rechts eine Zahl; Unterpunkte eingerückt.
export function EbenenZeile({
  href,
  name,
  aktiv,
  Symbol,
  kasten = false,
  zahl = 0,
  wichtig = false,
  tiefe = 0,
  onClick,
}: {
  href: string
  name: string
  aktiv: boolean
  Symbol?: LucideIcon
  kasten?: boolean
  zahl?: number
  wichtig?: boolean
  tiefe?: number
  onClick?: () => void
}) {
  return (
    <li style={tiefe > 0 ? { marginLeft: tiefe * leiste.einzugPx } : undefined}>
      <Knopf alsKind art="leise" className={cn('w-full justify-start', Symbol && 'gap-3 px-2', aktiv && 'bg-knopf-ton text-text')}>
        <a href={href} aria-current={aktiv ? 'page' : undefined} onClick={onClick}>
          {Symbol &&
            (kasten ? (
              <span className="grid size-8 shrink-0 place-items-center rounded-knopf bg-knopf-ton text-akzent">
                <Symbol aria-hidden className="size-4" />
              </span>
            ) : (
              <Symbol aria-hidden className={cn('size-4 shrink-0', aktiv && 'text-akzent')} />
            ))}
          <span className="truncate">{name}</span>
          {zahl > 0 && (
            <span
              className={cn(
                'ml-auto shrink-0 text-xs tabular-nums',
                wichtig ? 'rounded-voll bg-akzent px-2 font-bold text-auf-akzent' : aktiv ? 'text-akzent' : 'text-text-gedaempft',
              )}
            >
              {zahl}
            </span>
          )}
        </a>
      </Knopf>
    </li>
  )
}
