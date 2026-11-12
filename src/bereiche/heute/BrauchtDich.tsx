import { ChevronDown } from 'lucide-react'
import { useId, useState, type CSSProperties } from 'react'
import { Flaeche } from '../../bausteine/Flaeche'
import { Knopf } from '../../bausteine/Knopf'
import { cn } from '../../bausteine/cn'
import { seitText, type BrauchtDich as Daten } from '../../logik/heute'
import type { Eintrag } from '../../vertrag/eintrag'

const gruppen = [
  ['ueberfaellig', 'Überfällig'],
  ['heute', 'Heute'],
  ['morgen', 'Morgen'],
] as const

/** Schmale Kachel unter der Überschrift: Zahl und wichtigster Punkt; ein Klick fächert die Karten auf.
 *  Wartet nichts, verschwindet sie. Die volle Liste steht unter To-dos. */
export function BrauchtDich({ daten, fehler, jetzt }: { daten: Daten<Eintrag> | null; fehler?: string; jetzt: Date }) {
  const [offen, setOffen] = useState(false)
  const id = useId()
  if (fehler) return <Flaeche className="px-4 py-3 text-sm text-warnung">{fehler}</Flaeche>
  if (!daten?.wichtigster) return null
  const w = daten.wichtigster
  const satz = daten.zahl === 1 ? '1 Ding braucht dich.' : `${daten.zahl} Dinge brauchen dich.`
  // Laufende Nummer jeder Karte über alle Gruppen, für das Nacheinander beim Auffächern.
  const vorher = { ueberfaellig: 0, heute: daten.ueberfaellig.length, morgen: daten.ueberfaellig.length + daten.heute.length }

  return (
    <Flaeche className="w-full max-w-xl">
      <Knopf art="leise" aria-expanded={offen} aria-controls={id} onClick={() => setOffen(!offen)} className="h-auto min-h-14 w-full justify-start gap-3 px-4 py-3 text-left whitespace-normal text-text">
        <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-voll bg-akzent text-sm font-semibold text-auf-akzent">
          {daten.zahl}
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-medium">{satz}</span> <span className="text-text-gedaempft">{`${w.titel}, ${seitText(w.frist ?? '', jetzt)}.`}</span>
        </span>
        <ChevronDown aria-hidden className={cn('size-4 shrink-0 drueck', offen && 'rotate-180')} />
      </Knopf>
      {offen && (
        <div id={id} className="grid gap-3 px-4 pb-4">
          {gruppen.map(([schluessel, name]) =>
            daten[schluessel].length === 0 ? null : (
              <section key={schluessel} aria-label={name} className="grid gap-1.5">
                <h2 className="beschriftung">{name}</h2>
                {daten[schluessel].map((e, n) => (
                  <a
                    key={e.id}
                    href="#todos"
                    style={{ '--i': vorher[schluessel] + n } as CSSProperties}
                    className="karte-faechern drueck flex items-center justify-between gap-3 rounded-knopf border border-linie bg-knopf-ton px-3 py-2 text-sm outline-none hover:bg-knopf-ton-hover focus-visible:ring-2 focus-visible:ring-akzent"
                  >
                    <span className="min-w-0 truncate">{e.titel}</span>
                    <span className={cn('shrink-0 text-xs', schluessel === 'ueberfaellig' ? 'text-warnung' : 'text-text-gedaempft')}>{seitText(e.frist ?? '', jetzt)}</span>
                  </a>
                ))}
              </section>
            ),
          )}
          <a href="#todos" className="text-sm text-akzent hover:underline">
            Alle To-dos
          </a>
        </div>
      )}
    </Flaeche>
  )
}
