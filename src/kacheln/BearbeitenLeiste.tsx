import { Plus, RotateCcw } from 'lucide-react'
import { Knopf } from '../bausteine/Knopf'
import { RueckgaengigKnoepfe } from '../geruest/RueckgaengigKnoepfe'
import { useSchmal } from '../geruest/useSchmal'
import type { Geraet } from '../logik/einstellungen'
import { einblenden, type Anordnung, type KachelPlan } from '../logik/kacheln'
import { bearbeitenBeenden } from './bearbeiten'

// Leiste im Bearbeiten-Modus: ausgeblendete Kacheln zurückholen, Rückgängig und Wiederherstellen (nur diese Seite), Zurücksetzen, Fertig.
type Props = {
  seite: string
  versteckt: readonly KachelPlan[]
  anordnung: Anordnung
  plan: readonly KachelPlan[]
  geraet: Geraet
  aendern: (a: Anordnung) => void
  zuruecksetzen: () => void
}

export function BearbeitenLeiste({ seite, versteckt, anordnung, plan, geraet, aendern, zuruecksetzen }: Props) {
  const schmal = useSchmal()
  return (
    <div className="flaeche-schwebend sticky top-2 z-10 mb-3 flex flex-wrap items-center gap-2 p-2" role="toolbar" aria-label="Kacheln bearbeiten">
      <span className="px-2 text-sm text-text-gedaempft">{schmal ? 'Lange drücken und ziehen, Griffpunkte für die Größe' : 'Am Griff ziehen, Griffpunkte für die Größe, Rechtsklick für das Menü'}</span>
      {versteckt.map((k) => (
        <Knopf key={k.id} art="standard" groesse="klein" onClick={() => aendern(einblenden(anordnung, plan, geraet, k.id))}>
          <Plus aria-hidden className="size-4" />
          {k.name}
        </Knopf>
      ))}
      <div className="ml-auto flex items-center gap-1">
        <RueckgaengigKnoepfe bereich={seite} nurSymbol />
        <Knopf art="symbol" groesse="klein" aria-label="Seite zurücksetzen" title="Seite zurücksetzen" onClick={zuruecksetzen}>
          <RotateCcw aria-hidden className="size-4" />
        </Knopf>
        <Knopf art="haupt" groesse="klein" onClick={bearbeitenBeenden}>
          Fertig
        </Knopf>
      </div>
    </div>
  )
}
