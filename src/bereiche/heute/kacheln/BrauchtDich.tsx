import { useId, type CSSProperties } from 'react'
import { Knopf } from '../../../bausteine/Knopf'
import { cn } from '../../../bausteine/cn'
import { seitText, type BrauchtDich as Daten } from '../../../logik/heute'
import type { Eintrag } from '../../../vertrag/eintrag'

const gruppen = [
  ['ueberfaellig', 'Überfällig'],
  ['heute', 'Heute'],
  ['morgen', 'Morgen'],
] as const

/** Zahl und wichtigster Punkt; ein Klick fächert die Karten in einer schwebenden Karte auf. Die volle Liste steht unter To-dos.
 *  Wartet nichts, gibt die Seite der Kachel keinen Inhalt und sie verschwindet. */
export function BrauchtDich({ daten, jetzt }: { daten: Daten<Eintrag>; jetzt: Date }) {
  const id = useId()
  const w = daten.wichtigster
  if (!w) return null
  const satz = daten.zahl === 1 ? '1 Ding braucht dich.' : `${daten.zahl} Dinge brauchen dich.`
  // Laufende Nummer jeder Karte über alle Gruppen, für das Nacheinander beim Auffächern.
  const vorher = { ueberfaellig: 0, heute: daten.ueberfaellig.length, morgen: daten.ueberfaellig.length + daten.heute.length }

  return (
    <>
      <Knopf art="leise" popoverTarget={id} className="h-full w-full justify-start gap-3 px-1 text-left whitespace-normal text-text">
        <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-voll bg-akzent text-sm font-semibold text-auf-akzent">
          {daten.zahl}
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-medium">{satz}</span> <span className="text-text-gedaempft">{`${w.titel}, ${seitText(w.frist ?? '', jetzt)}.`}</span>
        </span>
      </Knopf>
      <div id={id} popover="auto" aria-label="Braucht dich" className="flaeche-schwebend schwebende-karte p-4">
        <div className="grid gap-3">
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
      </div>
    </>
  )
}
