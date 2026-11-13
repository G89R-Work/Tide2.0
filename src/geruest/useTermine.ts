import { addDays, subDays } from 'date-fns'
import { useEffect, useState } from 'react'
import { holeTermine, type Eintrag } from '../vertrag/eintrag'

/** Termine von `zurueck` Tagen vor heute bis `voraus` Tage nach heute, geholt beim Öffnen und zum Tageswechsel. */
export function useTermine(zurueck: number, voraus: number, jetzt: Date): { termine: Eintrag[]; fehler?: string } {
  const [termine, setTermine] = useState<Eintrag[]>([])
  const [fehler, setFehler] = useState<string>()
  const tag = jetzt.toDateString()
  useEffect(() => {
    let aktuell = true
    const heute = new Date(tag)
    const von = subDays(heute, zurueck)
    const bis = addDays(heute, voraus)
    holeTermine(von, bis)
      .then((t) => aktuell && setTermine(t))
      .catch((f: unknown) => aktuell && setFehler(`Termine: ${f instanceof Error ? f.message : String(f)}`))
    return () => {
      aktuell = false
    }
  }, [tag, zurueck, voraus])
  return { termine, fehler }
}
