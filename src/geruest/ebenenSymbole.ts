import { Bell, Download, Mail, Mic, PanelLeft, Shield, SlidersHorizontal, Sun, Users, Waves, type LucideIcon } from 'lucide-react'
import type { BereichId } from '../logik/bereiche'
import type { AbschnittId } from '../logik/einstellungen'
import { symbole } from './seiten'

// Symbole der Zeilen in der zweiten Ebene, wo die Vorlage welche zeigt. Bereiche nutzen ihr Symbol aus der Seitenleiste.
const einstellungen: Record<AbschnittId, LucideIcon> = {
  start: SlidersHorizontal,
  konten: Mail,
  benachrichtigungen: Bell,
  darstellung: Sun,
  navigation: PanelLeft,
  kurve: Waves,
  heute: symbole.heute,
  postfach: symbole.postfach,
  kalender: symbole.kalender,
  todos: symbole.todos,
  einkauf: symbole.einkauf,
  finanzen: symbole.finanzen,
  arbeit: symbole.arbeit,
  notizen: symbole.notizen,
  schreiben: Mic,
  nutzer: Users,
  raeume: Shield,
  daten: Download,
}

const tabellen: Partial<Record<BereichId, Readonly<Record<string, LucideIcon>>>> = { einstellungen }

export const ebenenSymbol = (bereich: BereichId, id: string): LucideIcon | undefined => tabellen[bereich]?.[id]
