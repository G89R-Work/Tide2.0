import { cn } from '../bausteine/cn'
import type { BereichId } from '../logik/bereiche'
import { ebeneVon, markeFuer } from '../logik/ebenen'
import { EbenenZeile } from './EbenenZeile'
import { ebenenSymbol } from './ebenenSymbole'
import { EinstellungenSuchfeld } from './EinstellungenSuchfeld'
import { setzeEinstellungenSuche } from './einstellungenSuche'
import { PostfachOrdner } from './PostfachOrdner'

// Die zweite Ebene eines Bereichs: Unterpunkte als Links, nach Gruppen mit Beschriftung; wo vorhanden mit Symbol.
// Das Postfach zeigt seine Ordner aus den Daten.
export function ZweiteEbene({
  bereich,
  aktiv,
  beiWahl,
}: {
  bereich: BereichId
  aktiv: string | null
  beiWahl?: () => void
}) {
  if (bereich === 'postfach') return <PostfachOrdner aktiv={aktiv} beiWahl={beiWahl} />
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
          const neueGruppe = p.gruppe !== ebene[i - 1]?.gruppe
          return [
            neueGruppe && (p.gruppe || i > 0) && (
              <li key={`gruppe-${p.id}`} aria-hidden={!p.gruppe}>
                <p className={cn('beschriftung px-3 pb-1', i > 0 && 'pt-3')}>{p.gruppe ?? ''}</p>
              </li>
            ),
            <EbenenZeile
              key={p.id}
              href={markeFuer(bereich, p.id)}
              name={p.name}
              aktiv={p.id === aktiv}
              Symbol={ebenenSymbol(bereich, p.id)}
              kasten
              onClick={waehlen}
            />,
          ]
        })}
      </ul>
    </>
  )
}
