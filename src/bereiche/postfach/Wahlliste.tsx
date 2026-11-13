import type { ReactNode } from 'react'
import { AufklappZu } from '../../bausteine/Aufklapp'
import { Knopf } from '../../bausteine/Knopf'
import { cn } from '../../bausteine/cn'

export type Punkt = { id: string; name: ReactNode; aktiv?: boolean; tun: () => void }

// Eine Gruppe von Punkten in einer aufklappenden Karte (Filter, Nachverfolgen, Erinnern, Verschieben, Mehr):
// Klick führt aus und schließt die Karte, der aktive Punkt hat ein Häkchen.
export function Wahlliste({ titel, punkte, className }: { titel?: string; punkte: readonly Punkt[]; className?: string }) {
  return (
    <div role="group" aria-label={titel} className={cn('flex flex-col', className)}>
      {titel && <p className="beschriftung px-3 pt-2 pb-1">{titel}</p>}
      {punkte.map((p) => (
        <AufklappZu key={p.id} asChild>
          <Knopf art="leise" groesse="klein" aria-pressed={p.aktiv} className="w-full justify-start" onClick={p.tun}>
            {p.name}
            {p.aktiv && <span className="ml-auto text-akzent">✓</span>}
          </Knopf>
        </AufklappZu>
      ))}
    </div>
  )
}
