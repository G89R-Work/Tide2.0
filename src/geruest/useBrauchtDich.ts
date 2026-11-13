import { brauchtDich, type BrauchtDich } from '../logik/heute'
import type { Eintrag } from '../vertrag/eintrag'
import { useEintraege } from './daten'
import { useMinute } from './useMinute'

/** Was dich braucht (Überfällig, Heute, Morgen), für die Seite Heute und den Punkt am Menü-Knopf.
 *  Schlägt das Holen fehl, steht der Grund in `fehler`. */
export function useBrauchtDich(): { daten: BrauchtDich<Eintrag> | null; liste: Eintrag[] | null; fehler?: string } {
  const { liste, fehler } = useEintraege()
  const jetzt = useMinute()
  return { daten: liste ? brauchtDich(liste, jetzt) : null, liste: liste ?? null, fehler }
}
