import { RotateCcw, Search, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { Eingabe } from '../../bausteine/Eingabe'
import { Knopf } from '../../bausteine/Knopf'
import { einstellungenAendern, einstellungenZurueck, useEinstellungen, useGeraet } from '../../geruest/einstellungen'
import { Seitenkopf } from '../../geruest/Seitenkopf'
import { useSprungmarke } from '../../geruest/useSprungmarke'
import { ortAusMarke } from '../../logik/ebenen'
import { abschnitte, einstellungenIn, istStandard, suche, zuruecksetzen, type Einstellung } from '../../logik/einstellungen'
import { EinstellungZeile } from './EinstellungZeile'
import { KnoepfeBelegen } from './KnoepfeBelegen'

// Die Einstellungsseite entsteht aus der zentralen Liste in src/logik/einstellungen.ts.
export default function Seite() {
  const ort = ortAusMarke(useSprungmarke())
  const abschnitt = abschnitte.find((a) => a.id === ort.unter) ?? abschnitte[0]
  const { werte, geladen, fehler, kannZurueck } = useEinstellungen()
  const geraet = useGeraet()
  const [text, setText] = useState('')

  const sucht = text.trim() !== ''
  const sichtbar: Einstellung[] = sucht ? suche(text) : einstellungenIn(abschnitt.id)
  const alleStandard = sichtbar.every((e) => istStandard(e, werte, geraet))
  // Treffer nach Abschnitt, damit man sieht, wo eine Einstellung wohnt.
  const gruppen = sucht
    ? abschnitte
        .map((a) => ({ titel: a.name, liste: sichtbar.filter((e) => e.abschnitt === a.id) }))
        .filter((g) => g.liste.length > 0)
    : [{ titel: undefined, liste: sichtbar }]

  return (
    <div className="p-6">
      <Seitenkopf titel="Einstellungen" />
      <p className="mt-1 text-lg text-text-gedaempft">{sucht ? 'Suche' : abschnitt.name}</p>

      <div className="mt-6 flex max-w-xl flex-col gap-4">
        <label className="relative block">
          <span className="sr-only">Einstellungen durchsuchen</span>
          <Search aria-hidden className="pointer-events-none absolute top-3.5 left-3 size-4 text-text-gedaempft" />
          <Eingabe
            type="search"
            placeholder="Einstellung suchen"
            className="w-full pl-9"
            value={text}
            onChange={(x) => setText(x.currentTarget.value)}
            onKeyDown={(x) => x.key === 'Escape' && setText('')}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <Knopf groesse="klein" disabled={!kannZurueck} onClick={einstellungenZurueck}>
            <Undo2 aria-hidden className="size-4" /> Rückgängig
          </Knopf>
          <Knopf
            groesse="klein"
            art="leise"
            disabled={alleStandard}
            onClick={() => einstellungenAendern(zuruecksetzen(werte, sichtbar, geraet))}
          >
            <RotateCcw aria-hidden className="size-4" /> {sucht ? 'Treffer auf Standard' : 'Abschnitt auf Standard'}
          </Knopf>
        </div>

        {fehler && <p className="text-sm text-warnung">{fehler}</p>}
        {!geladen && <p className="text-sm text-text-gedaempft">Lädt …</p>}

        {sichtbar.length === 0 && (sucht || abschnitt.id !== 'navigation') && (
          <p className="text-text-gedaempft">
            {sucht ? `Keine Einstellung passt zu „${text.trim()}".` : 'Hier gibt es noch nichts einzustellen.'}
          </p>
        )}

        {gruppen.map((g) => (
          <section key={g.titel ?? 'abschnitt'} className="flaeche-kachel px-4 py-2">
            {g.titel && <h2 className="pt-2 font-semibold">{g.titel}</h2>}
            <ul className="divide-y divide-linie">
              {g.liste.map((e) => (
                <EinstellungZeile key={e.id} e={e} werte={werte} geraet={geraet} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {!sucht && abschnitt.id === 'navigation' && <KnoepfeBelegen />}
    </div>
  )
}
