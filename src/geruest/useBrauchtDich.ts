import { useEffect, useState } from 'react'
import { brauchtDich, type BrauchtDich } from '../logik/heute'
import { holeEintraege, type Eintrag } from '../vertrag/eintrag'
import { useMinute } from './useMinute'

/** Was dich braucht (Überfällig, Heute, Morgen), für die Seite Heute und den Punkt am Menü-Knopf.
 *  Schlägt das Holen fehl, steht der Grund in `fehler`. */
export function useBrauchtDich(): { daten: BrauchtDich<Eintrag> | null; liste: Eintrag[] | null; fehler?: string } {
  const [liste, setListe] = useState<Eintrag[]>()
  const [fehler, setFehler] = useState<string>()
  const jetzt = useMinute()
  useEffect(() => {
    let aktuell = true
    holeEintraege()
      .then((l) => aktuell && setListe(l))
      .catch((f: unknown) => aktuell && setFehler(`Braucht dich: ${f instanceof Error ? f.message : String(f)}`))
    return () => {
      aktuell = false
    }
  }, [])
  return { daten: liste ? brauchtDich(liste, jetzt) : null, liste: liste ?? null, fehler }
}
