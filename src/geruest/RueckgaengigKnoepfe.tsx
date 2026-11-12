import { Redo2, Undo2 } from 'lucide-react'
import { Knopf } from '../bausteine/Knopf'
import { rueckgaengig, useKannRueckgaengig, useKannWiederherstellen, wiederherstellen } from './rueckgaengig'

// Rückgängig und Wiederherstellen einer Seite: wirken nur auf Schritte, die auf dieser Seite (`bereich`) entstanden.
// Alt+Z und Alt+Y wirken dagegen auf den letzten Schritt von ganz Tide.
export function RueckgaengigKnoepfe({ bereich, nurSymbol = false }: { bereich: string; nurSymbol?: boolean }) {
  const kannZurueck = useKannRueckgaengig(bereich)
  const kannVor = useKannWiederherstellen(bereich)
  const knoepfe = [
    { name: 'Rückgängig', Symbol: Undo2, kann: kannZurueck, tun: () => rueckgaengig(bereich) },
    { name: 'Wiederherstellen', Symbol: Redo2, kann: kannVor, tun: () => wiederherstellen(bereich) },
  ]
  return knoepfe.map(({ name, Symbol, kann, tun }) =>
    nurSymbol ? (
      <Knopf key={name} art="symbol" groesse="klein" aria-label={name} title={name} disabled={!kann} onClick={tun}>
        <Symbol aria-hidden className="size-4" />
      </Knopf>
    ) : (
      <Knopf key={name} groesse="klein" disabled={!kann} onClick={tun}>
        <Symbol aria-hidden className="size-4" /> {name}
      </Knopf>
    ),
  )
}
