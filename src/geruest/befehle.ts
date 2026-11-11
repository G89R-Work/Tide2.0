import { aktionen } from '../logik/aktionen'
import { bearbeitenStarten, kachelnZuruecksetzen } from '../kacheln/bearbeiten'

// Was Aktionen mit `befehl` tun. Eine neue Befehls-Aktion braucht hier eine Zeile.
const befehle: Record<string, () => void> = {
  'kacheln-anpassen': bearbeitenStarten,
  'kacheln-zuruecksetzen': kachelnZuruecksetzen,
}

if (import.meta.env.DEV)
  for (const a of aktionen) if (a.befehl && !befehle[a.id]) console.warn(`Aktion ${a.id} hat keinen Befehl (src/geruest/befehle.ts)`)

export function fuehreAus(id: string) {
  const b = befehle[id]
  if (!b) throw new Error(`Aktion ${id} hat keinen Befehl (src/geruest/befehle.ts)`)
  b()
}
