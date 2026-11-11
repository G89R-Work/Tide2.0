import { useEffect, useState } from 'react'
import { brauchtDich } from '../logik/ebenen'
import { holeEintraege } from '../vertrag/eintrag'

/** Zahl für den Punkt am Menü-Knopf. Schlägt das Holen fehl, bleibt der Punkt weg und der Grund steht in der Konsole. */
export function useBrauchtDich() {
  const [zahl, setZahl] = useState(0)
  useEffect(() => {
    let aktuell = true
    holeEintraege()
      .then((liste) => aktuell && setZahl(brauchtDich(liste)))
      .catch((fehler: unknown) => console.error('Punkt am Menü-Knopf:', fehler))
    return () => {
      aktuell = false
    }
  }, [])
  return zahl
}
