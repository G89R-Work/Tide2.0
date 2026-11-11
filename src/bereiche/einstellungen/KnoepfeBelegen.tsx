import { RotateCcw, Undo2 } from 'lucide-react'
import { Auswahl } from '../../bausteine/Auswahl'
import { Knopf } from '../../bausteine/Knopf'
import { AktionKnopf } from '../../geruest/AktionKnopf'
import { belegungErsetzen, belegungZurueck, platzBelegen, useBelegung, useKannZurueck } from '../../geruest/belegung'
import { abWerk, aktionen, mitteUnten, plaetze, type Ort } from '../../logik/aktionen'

// Einstellungen › Navigation: je Platz eine Zeile mit der Liste aller Aktionen.
const gruppen: { ort: Ort; titel: string; platzName: (i: number) => string }[] = [
  { ort: 'pc', titel: 'Kopfzeile am PC', platzName: (i) => `Knopf ${i + 1}` },
  { ort: 'oben', titel: 'Oben rechts am Handy', platzName: (i) => `Knopf ${i + 1}` },
  { ort: 'unten', titel: 'Untere Leiste am Handy', platzName: (i) => (i === mitteUnten ? 'Mitte' : `Platz ${i < mitteUnten ? i + 1 : i}`) },
]

export function KnoepfeBelegen() {
  const belegung = useBelegung()
  const kannZurueck = useKannZurueck()
  return (
    <div className="mt-6 flex max-w-xl flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <Knopf groesse="klein" disabled={!kannZurueck} onClick={belegungZurueck}>
          <Undo2 aria-hidden className="size-4" /> Rückgängig
        </Knopf>
        <Knopf groesse="klein" art="leise" onClick={() => belegungErsetzen(abWerk)}>
          <RotateCcw aria-hidden className="size-4" /> Ab Werk
        </Knopf>
      </div>
      {gruppen.map((g) => (
        <section key={g.ort} className="flaeche-kachel p-4">
          <h2 className="mb-3 font-semibold">{g.titel}</h2>
          <ul className="flex flex-col gap-2">
            {Array.from({ length: plaetze[g.ort] }, (_, i) => {
              const id = belegung[g.ort][i] ?? null
              const feld = `platz-${g.ort}-${i}`
              return (
                <li key={feld} className="flex items-center gap-3">
                  <span className="hidden w-11 shrink-0 justify-center sm:flex">
                    <AktionKnopf id={id} />
                  </span>
                  <label htmlFor={feld} className="w-16 shrink-0 text-sm text-text-gedaempft sm:w-24">
                    {g.platzName(i)}
                  </label>
                  <Auswahl
                    id={feld}
                    className="flex-1"
                    value={id ?? ''}
                    onChange={(e) => platzBelegen(g.ort, i, e.target.value || null)}
                  >
                    <option value="">Leer</option>
                    {aktionen.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                        {a.kommt ? ' (kommt später)' : ''}
                        {a.kuerzel ? ` · ${a.kuerzel}` : ''}
                      </option>
                    ))}
                  </Auswahl>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
