import { aktionen } from '../logik/aktionen'
import { ortAusMarke } from '../logik/ebenen'
import { kurveUmschalten } from './einstellungen'
import { rueckgaengig, wiederherstellen } from './rueckgaengig'
import { bearbeitenUmschalten, kachelnZuruecksetzen } from '../kacheln/bearbeiten'

// Was Aktionen mit `befehl` tun. Eine neue Befehls-Aktion braucht hier eine Zeile.
const befehle: Record<string, () => void> = {
  'kacheln-anpassen': bearbeitenUmschalten,
  'kacheln-zuruecksetzen': kachelnZuruecksetzen,
  rueckgaengig: () => rueckgaengig(),
  wiederherstellen: () => wiederherstellen(),
  kurve: () => kurveUmschalten(ortAusMarke(location.hash).bereich),
}

if (import.meta.env.DEV)
  for (const a of aktionen) if (a.befehl && !befehle[a.id]) console.warn(`Aktion ${a.id} hat keinen Befehl (src/geruest/befehle.ts)`)

export function fuehreAus(id: string) {
  const b = befehle[id]
  if (!b) throw new Error(`Aktion ${id} hat keinen Befehl (src/geruest/befehle.ts)`)
  b()
}
