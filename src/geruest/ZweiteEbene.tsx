import { Knopf } from '../bausteine/Knopf'
import { cn } from '../bausteine/cn'
import type { BereichId } from '../logik/bereiche'
import { ebeneVon, markeFuer } from '../logik/ebenen'

// Die zweite Ebene eines Bereichs: Unterpunkte als Links, nach Gruppen mit Beschriftung.
export function ZweiteEbene({
  bereich,
  aktiv,
  beiWahl,
}: {
  bereich: BereichId
  aktiv: string | null
  beiWahl?: () => void
}) {
  const ebene = ebeneVon(bereich)
  return (
    <ul className="flex flex-col gap-1">
      {ebene.map((p, i) => {
        const istAktiv = p.id === aktiv
        const neueGruppe = p.gruppe !== ebene[i - 1]?.gruppe
        return (
          <li key={p.id}>
            {neueGruppe && (p.gruppe || i > 0) && (
              <p className={cn('beschriftung px-3 pb-1', i > 0 && 'pt-3')}>{p.gruppe ?? ''}</p>
            )}
            <Knopf alsKind art="leise" className={cn('w-full justify-start', istAktiv && 'bg-knopf-ton text-text')}>
              <a href={markeFuer(bereich, p.id)} aria-current={istAktiv ? 'page' : undefined} onClick={beiWahl}>
                <span className="truncate">{p.name}</span>
              </a>
            </Knopf>
          </li>
        )
      })}
    </ul>
  )
}
