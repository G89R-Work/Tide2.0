import { useEffect, useState } from 'react'
import { holeTermine, type Eintrag } from '../../vertrag/eintrag'

/** Termine von einer Woche zurück bis fünf Wochen voraus, einmal beim Öffnen geholt. */
export function useTermine(): { termine: Eintrag[]; fehler?: string } {
  const [termine, setTermine] = useState<Eintrag[]>([])
  const [fehler, setFehler] = useState<string>()
  useEffect(() => {
    let aktuell = true
    const heute = new Date()
    const von = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate() - 14)
    const bis = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate() + 42)
    holeTermine(von, bis)
      .then((t) => aktuell && setTermine(t))
      .catch((f: unknown) => aktuell && setFehler(`Termine: ${f instanceof Error ? f.message : String(f)}`))
    return () => {
      aktuell = false
    }
  }, [])
  return { termine, fehler }
}
