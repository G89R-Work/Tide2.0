import { eachDayOfInterval, endOfYear, startOfYear } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Knopf } from '../../bausteine/Knopf'
import { aendereRhythmusMitSchritt, useFeiertage } from '../../geruest/daten'
import { useEinstellung } from '../../geruest/einstellungen'
import { tagKurz, tagMonat } from '../../geruest/format'
import { einstellung } from '../../logik/einstellungen'
import { mitAusnahme, type Rhythmus } from '../../logik/rhythmus'
import { arbeitstagNachPlan, vorschlaege, type Vorschlag } from '../../logik/urlaub'
import { tagSchluessel } from '../../logik/zeit'

const bundesland = einstellung('bundesland')

// Urlaubsplaner (docs/konzept/17-arbeit.md): um jeden Feiertag das Fenster mit den meisten freien Tagen je Urlaubstag, nach Dienstplan.
export default function Planer({ rhythmus, jetzt }: { rhythmus: Rhythmus; jetzt: Date }) {
  const [jahr, setJahr] = useState(jetzt.getFullYear() + 1)
  const feiertag = useFeiertage(jahr, useEinstellung(bundesland))
  const tage = eachDayOfInterval({ start: startOfYear(new Date(jahr, 0, 1)), end: endOfYear(new Date(jahr, 0, 1)) })
  const feiertage = new Map(tage.flatMap((t) => (feiertag(t) ? [[tagSchluessel(t), feiertag(t) ?? '']] : [])))
  const liste = vorschlaege(feiertage, arbeitstagNachPlan(rhythmus), jahr)

  const eintragen = (v: Vorschlag) =>
    void aendereRhythmusMitSchritt(
      rhythmus,
      v.urlaub.reduce((r, t) => mitAusnahme(r, t, { art: 'urlaub' }), rhythmus),
      `Urlaub ${tagMonat(v.von)}–${tagMonat(v.bis)} eingetragen`,
    )

  return (
    <section aria-label="Urlaubsplaner" className="flaeche-kachel flex flex-col gap-3 p-4">
      <header className="flex items-center gap-2">
        <h2 className="min-w-0 flex-1 text-lg font-semibold">Urlaub {jahr}</h2>
        <Knopf art="symbol" groesse="klein" aria-label="Jahr zurück" onClick={() => setJahr((j) => j - 1)}>
          <ChevronLeft aria-hidden className="size-4" />
        </Knopf>
        <Knopf art="symbol" groesse="klein" aria-label="Jahr vor" onClick={() => setJahr((j) => j + 1)}>
          <ChevronRight aria-hidden className="size-4" />
        </Knopf>
      </header>
      {liste.length === 0 ? (
        <p className="text-sm text-text-gedaempft">Keine Vorschläge</p>
      ) : (
        <ul className="flex flex-col">
          {liste.map((v) => (
            <li key={tagSchluessel(v.von)} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-linie py-2 text-sm last:border-b-0">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{v.feiertage.join(', ')}</span>
                <span className="whitespace-nowrap text-text-gedaempft tabular-nums">
                  {tagKurz(v.von)} {tagMonat(v.von)} – {tagKurz(v.bis)} {tagMonat(v.bis)}
                </span>
              </span>
              <span className="text-right tabular-nums">
                {v.urlaub.length} {v.urlaub.length === 1 ? 'Tag' : 'Tage'} Urlaub → <span className="font-semibold text-akzent">{v.frei} frei</span>
              </span>
              <Knopf groesse="klein" title={v.urlaub.map((t) => `${tagKurz(t)} ${tagMonat(t)}`).join(', ')} onClick={() => eintragen(v)}>
                Eintragen
              </Knopf>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
