import { Knopf } from '../bausteine/Knopf'
import { cn } from '../bausteine/cn'
import type { BereichId } from '../logik/bereiche'
import { ebeneVon, markeFuer } from '../logik/ebenen'
import { ebenenSymbol } from './ebenenSymbole'
import { EinstellungenSuchfeld } from './EinstellungenSuchfeld'
import { setzeEinstellungenSuche } from './einstellungenSuche'

// Die zweite Ebene eines Bereichs: Unterpunkte als Links, nach Gruppen mit Beschriftung; wo vorhanden mit Symbol.
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
  const einstellungen = bereich === 'einstellungen'
  const waehlen = () => {
    if (einstellungen) setzeEinstellungenSuche('')
    beiWahl?.()
  }
  return (
    <>
      {einstellungen && <EinstellungenSuchfeld beiWahl={beiWahl} />}
      <ul className="flex flex-col gap-1">
        {ebene.map((p, i) => {
          const istAktiv = p.id === aktiv
          const neueGruppe = p.gruppe !== ebene[i - 1]?.gruppe
          const Symbol = ebenenSymbol(bereich, p.id)
          return (
            <li key={p.id}>
              {neueGruppe && (p.gruppe || i > 0) && (
                <p className={cn('beschriftung px-3 pb-1', i > 0 && 'pt-3')}>{p.gruppe ?? ''}</p>
              )}
              <Knopf
                alsKind
                art="leise"
                className={cn('w-full justify-start', Symbol && 'gap-3 px-2', istAktiv && 'bg-knopf-ton text-text')}
              >
                <a href={markeFuer(bereich, p.id)} aria-current={istAktiv ? 'page' : undefined} onClick={waehlen}>
                  {Symbol && (
                    <span className="grid size-8 shrink-0 place-items-center rounded-knopf bg-knopf-ton text-akzent">
                      <Symbol aria-hidden className="size-4" />
                    </span>
                  )}
                  <span className="truncate">{p.name}</span>
                </a>
              </Knopf>
            </li>
          )
        })}
      </ul>
    </>
  )
}
