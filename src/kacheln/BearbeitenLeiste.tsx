import { Check, Plus, RotateCcw } from 'lucide-react'
import { Knopf } from '../bausteine/Knopf'
import { cn } from '../bausteine/cn'
import { RueckgaengigKnoepfe } from '../geruest/RueckgaengigKnoepfe'
import { einblenden, type Anordnung, type KachelPlan, type Raster } from '../logik/kacheln'
import { bearbeitenBeenden } from './bearbeiten'

// Bedienfeld im Bearbeiten-Modus: liegt nicht über den Kacheln, sondern am PC unten in der Seitenleiste und am Handy
// schwebend über der unteren Leiste (Ort aus `BearbeitenOrt`). So sieht die Seite im Modus aus wie danach.
// Inhalt: „Bearbeiten aktiv“ (Hinweis zur Bedienung als Tooltip), ausgeblendete Kacheln zurückholen, Rückgängig und Wiederherstellen (nur diese Seite), Zurücksetzen, Fertig.
// In der schmalen Seitenleiste (nur Symbole) bleiben nur die Symbole.
type Props = {
  seite: string
  versteckt: readonly KachelPlan[]
  anordnung: Anordnung
  plan: readonly KachelPlan[]
  raster: Raster
  aendern: (a: Anordnung) => void
  zuruecksetzen: () => void
}

const text = '@max-mit-namen:sr-only'

export function BearbeitenLeiste({ seite, versteckt, anordnung, plan, raster, aendern, zuruecksetzen }: Props) {
  const handy = raster.geraet === 'handy'
  return (
    <div
      role="toolbar"
      aria-label="Kacheln bearbeiten"
      className={cn('flex gap-2', handy ? 'flaeche-schwebend flex-wrap items-center p-2' : 'mb-2 flex-col border-t border-linie pt-2')}
    >
      <p className={cn('beschriftung px-2 text-akzent', !handy && text)} title={handy ? 'Lange drücken und ziehen, die Punkte ändern die Größe' : 'Ziehen verschiebt, die Punkte ändern die Größe, Rechtsklick öffnet das Menü'}>
        Bearbeiten aktiv
      </p>
      {versteckt.map((k) => (
        <Knopf key={k.id} groesse="klein" title={`${k.name} einblenden`} className={cn(!handy && 'justify-start')} onClick={() => aendern(einblenden(anordnung, plan, raster, k.id))}>
          <Plus aria-hidden className="size-4 shrink-0" />
          <span className={cn('truncate', !handy && text)}>{k.name}</span>
        </Knopf>
      ))}
      <div className={cn('flex flex-wrap items-center gap-1', handy ? 'ml-auto' : 'justify-center')}>
        <RueckgaengigKnoepfe bereich={seite} nurSymbol />
        <Knopf art="symbol" groesse="klein" aria-label="Seite zurücksetzen" title="Seite zurücksetzen" onClick={zuruecksetzen}>
          <RotateCcw aria-hidden className="size-4" />
        </Knopf>
      </div>
      <Knopf art="haupt" groesse="klein" title="Bearbeiten beenden" onClick={bearbeitenBeenden}>
        <Check aria-hidden className="size-4 shrink-0" />
        <span className={cn(!handy && text)}>Fertig</span>
      </Knopf>
    </div>
  )
}
