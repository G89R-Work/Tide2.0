import { X } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Aufklapp, AufklappAnker, AufklappInhalt, AufklappKnopf } from '../../../bausteine/Aufklapp'
import { Flaeche } from '../../../bausteine/Flaeche'
import { Knopf } from '../../../bausteine/Knopf'
import { cn } from '../../../bausteine/cn'
import { schliesseBrauchtDich, useBrauchtDichZu } from '../../../geruest/brauchtDichZu'
import { seitText, type BrauchtDich as Daten } from '../../../logik/heute'
import type { Eintrag } from '../../../vertrag/eintrag'

const gruppen = [
  ['ueberfaellig', 'Überfällig'],
  ['heute', 'Heute'],
  ['morgen', 'Morgen'],
] as const

/** Reiter wie in der Vorlage: Punkt, das Wichtigste mit Frist, „Ansehen“, „+n“ und Schließen.
 *  „Ansehen“ klappt die ganze Liste direkt aus dem Reiter auf. Wartet nichts oder ist er weggeklickt, verschwindet er. */
export function BrauchtDich({ daten, jetzt }: { daten: Daten<Eintrag>; jetzt: Date }) {
  const zu = useBrauchtDichZu()
  const w = daten.wichtigster
  if (!w || zu) return null
  const ueberfaellig = daten.ueberfaellig.length > 0
  // Laufende Nummer jeder Karte über alle Gruppen, für das Nacheinander beim Auffächern.
  const vorher = { ueberfaellig: 0, heute: daten.ueberfaellig.length, morgen: daten.ueberfaellig.length + daten.heute.length }

  return (
    <Aufklapp>
      <AufklappAnker asChild>
        <Flaeche className="flex w-full max-w-sm items-center gap-2.5 py-2.5 pr-2.5 pl-3.5">
          <span aria-hidden className={cn('reiter-punkt', ueberfaellig ? 'text-warnung' : 'text-akzent')} />
          <span className="grid min-w-0 flex-1 leading-tight">
            <b className="truncate text-sm font-semibold">{w.titel}</b>
            <span className="truncate text-xs text-text-gedaempft">{seitText(w.frist ?? '', jetzt)}</span>
          </span>
          <AufklappKnopf asChild>
            <Knopf art="standard" groesse="klein" className="rounded-voll">
              Ansehen
            </Knopf>
          </AufklappKnopf>
          {daten.zahl > 1 && <span className="reiter-mehr">{`+${daten.zahl - 1}`}</span>}
          <Knopf art="symbol" groesse="klein" className="rounded-voll" aria-label="Braucht dich schließen" onClick={schliesseBrauchtDich}>
            <X className="size-4" />
          </Knopf>
        </Flaeche>
      </AufklappAnker>
      <AufklappInhalt side="top" align="start" aria-label="Braucht dich" className="grid gap-3 p-4">
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
      </AufklappInhalt>
    </Aufklapp>
  )
}
