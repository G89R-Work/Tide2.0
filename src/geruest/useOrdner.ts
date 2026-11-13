import { useEffect, useState } from 'react'
import { holeOrdner, type Ordner } from '../vertrag/postfach'

/** Ordner des Postfachs, geholt beim Öffnen. Schlägt das Holen fehl, steht der Grund in `fehler`. */
export function useOrdner(): { ordner: Ordner[] | null; fehler?: string } {
  const [ordner, setOrdner] = useState<Ordner[]>()
  const [fehler, setFehler] = useState<string>()
  useEffect(() => {
    let aktuell = true
    holeOrdner()
      .then((l) => aktuell && setOrdner(l))
      .catch((f: unknown) => aktuell && setFehler(`Ordner: ${f instanceof Error ? f.message : String(f)}`))
    return () => {
      aktuell = false
    }
  }, [])
  return { ordner: ordner ?? null, fehler }
}
