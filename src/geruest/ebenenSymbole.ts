import {
  Archive,
  Bell,
  BellRing,
  Download,
  FileText,
  Inbox,
  Mail,
  Mic,
  Newspaper,
  Package,
  PanelLeft,
  Pencil,
  ReceiptText,
  Send,
  Shield,
  SlidersHorizontal,
  Star,
  Sun,
  Trash2,
  Users,
  Waves,
  type LucideIcon,
} from 'lucide-react'
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

// Postfach: Systemordner und die intelligenten Ordner der Beispieldaten; eigene Ordner zeigen ein Ordner-Symbol.
const postfach: Record<string, LucideIcon> = {
  eingang: Inbox,
  'braucht-dich': Star,
  entwuerfe: Pencil,
  gesendet: Send,
  erinnerung: BellRing,
  archiv: Archive,
  papierkorb: Trash2,
  'suche-newsletter': Newspaper,
  'suche-rechnungen': ReceiptText,
  'suche-pdf': FileText,
  'suche-versand': Package,
}

const tabellen: Partial<Record<BereichId, Readonly<Record<string, LucideIcon>>>> = { einstellungen, postfach }

export const ebenenSymbol = (bereich: BereichId, id: string): LucideIcon | undefined => tabellen[bereich]?.[id]
