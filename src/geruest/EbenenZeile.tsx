import type { LucideIcon } from 'lucide-react'
import type { ComponentProps, ReactNode, Ref } from 'react'
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
  symbolKlasse,
  hinten,
  linkRef,
  onClick,
  className,
  style,
  ...li
}: Omit<ComponentProps<'li'>, 'onClick'> & {
  href: string
  name: string
  aktiv: boolean
  Symbol?: LucideIcon
  kasten?: boolean
  zahl?: number
  wichtig?: boolean
  tiefe?: number
  /** Farbe des Symbols (eigene Ordner) */
  symbolKlasse?: string
  /** Rechts neben der Zeile, etwa der Knopf zum Ein- und Ausklappen */
  hinten?: ReactNode
  /** Der Link selbst, etwa als Griff zum Ziehen */
  linkRef?: Ref<HTMLAnchorElement>
  onClick?: () => void
}) {
  return (
    <li {...li} className={cn(hinten !== undefined && 'flex items-center gap-1', className)} style={{ ...style, ...(tiefe > 0 ? { marginLeft: tiefe * leiste.einzugPx } : {}) }}>
      <Knopf alsKind art="leise" className={cn('w-full min-w-0 flex-1 justify-start', Symbol && 'gap-3 px-2', aktiv && 'bg-knopf-ton text-text')}>
        <a ref={linkRef} href={href} aria-current={aktiv ? 'page' : undefined} onClick={onClick}>
          {Symbol &&
            (kasten ? (
              <span className="grid size-8 shrink-0 place-items-center rounded-knopf bg-knopf-ton text-akzent">
                <Symbol aria-hidden className="size-4" />
              </span>
            ) : (
              <Symbol aria-hidden className={cn('size-4 shrink-0', symbolKlasse ?? (aktiv && 'text-akzent'))} />
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
      {hinten}
    </li>
  )
}
