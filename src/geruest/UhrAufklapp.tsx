import { useState } from 'react'
import { Aufklapp, AufklappInhalt, AufklappKnopf } from '../bausteine/Aufklapp'
import { Knopf } from '../bausteine/Knopf'
import { einstellung } from '../logik/einstellungen'
import { faktZurStunde } from '../logik/fakten'
import { schicht } from '../logik/heute'
import { versatzMinuten } from '../logik/zeit'
import type { Eintrag } from '../vertrag/eintrag'
import { useEinstellung } from './einstellungen'
import { uhrzeit, versatzText } from './format'
import { Uhr } from './Uhr'
import { useOrt } from './useOrt'

const weltzeiten = [einstellung('weltzeit-1'), einstellung('weltzeit-2'), einstellung('weltzeit-3')] as const

/** Die Uhr als Knopf (`klein`: nur die Uhrzeit, für die Kopfzeile). Ein Klick öffnet die Karte mit Weltzeit und Fakt zur Stunde
 *  (docs/konzept/10-heute.md); in einer Schicht schaltet die Karte zwischen Anteil der Schicht und des Tages um. */
export default function UhrAufklapp({ termine, jetzt, klein = false }: { termine: readonly Eintrag[]; jetzt: Date; klein?: boolean }) {
  const [tagZeigen, setTagZeigen] = useState(false)
  const ort = useOrt()
  const zonen = [useEinstellung(weltzeiten[0]), useEinstellung(weltzeiten[1]), useEinstellung(weltzeiten[2])]
  const hier = -jetzt.getTimezoneOffset()
  const welt = zonen.flatMap((zone, i) => {
    if (zone === 'aus') return []
    const stadt = weltzeiten[i].optionen.find(([w]) => w === zone)?.[1] ?? zone
    return [{ zone, stadt, versatz: versatzMinuten(jetzt, zone) - hier }]
  })
  const s = schicht(termine, jetzt)
  return (
    <Aufklapp>
      <AufklappKnopf asChild>
        {klein ? (
          <Knopf art="leise" groesse="klein" aria-label={`Uhrzeit ${uhrzeit(jetzt)}`} className="text-sm tabular-nums text-text">
            {uhrzeit(jetzt)}
          </Knopf>
        ) : (
          <Knopf art="leise" aria-label={`Uhrzeit ${uhrzeit(jetzt)}`} className="h-auto w-full px-0 py-0 whitespace-normal text-text hover:bg-durchsichtig">
            <Uhr termine={termine} jetzt={jetzt} tagZeigen={tagZeigen} />
          </Knopf>
        )}
      </AufklappKnopf>
      <AufklappInhalt breite="inhalt" align="end" aria-label="Uhr" className="grid w-72 gap-3 p-4 text-sm">
        {klein && <Uhr termine={termine} jetzt={jetzt} tagZeigen={tagZeigen} />}
        {s && (
          <Knopf groesse="klein" onClick={() => setTagZeigen(!tagZeigen)}>
            {tagZeigen ? `Anteil: ${s.titel}` : 'Anteil des Tages'}
          </Knopf>
        )}
        {welt.length > 0 && (
          <ul className="grid gap-1">
            {welt.map((w) => (
              <li key={w.zone} className="flex items-baseline gap-2">
                <span className="min-w-0 flex-1 truncate">{w.stadt}</span>
                <span className="text-text-gedaempft">{versatzText(w.versatz)}</span>
                <span className="font-medium tabular-nums">{uhrzeit(jetzt, w.zone)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-text-gedaempft">{faktZurStunde(jetzt, ort).text}</p>
      </AufklappInhalt>
    </Aufklapp>
  )
}
