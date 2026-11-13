import { Archive, CalendarPlus, CircleAlert, Forward, ListPlus, Mail, Mic, PencilRuler, Pin, Redo2, Reply, ReplyAll, Search, ShoppingBasket, SquarePen, Trash2, Undo2, Waves, type LucideIcon } from 'lucide-react'
import { aktionen, type Aktion } from '../logik/aktionen'
import { bereiche } from '../logik/bereiche'
import { symbole } from './seiten'

// Symbol je Aktion. Bereiche nutzen das Symbol aus der Seitenleiste.
const eigene: Record<string, LucideIcon> = {
  'neue-mail': SquarePen,
  'neuer-termin': CalendarPlus,
  'neues-todo': ListPlus,
  einkaufsmodus: ShoppingBasket,
  'knoepfe-belegen': PencilRuler,
  rueckgaengig: Undo2,
  wiederherstellen: Redo2,
  kurve: Waves,
  suche: Search,
  diktat: Mic,
  'mail-antworten': Reply,
  'mail-allen-antworten': ReplyAll,
  'mail-weiterleiten': Forward,
  'mail-archivieren': Archive,
  'mail-loeschen': Trash2,
  'mail-ungelesen': Mail,
  'mail-anheften': Pin,
  'mail-wichtig': CircleAlert,
}

export const aktionSymbole: Record<string, LucideIcon> = { ...eigene }
for (const b of bereiche) aktionSymbole[`bereich-${b.id}`] = symbole[b.id]

if (import.meta.env.DEV)
  for (const a of aktionen) if (!aktionSymbole[a.id]) console.warn(`Aktion ${a.id} hat kein Symbol (src/geruest/aktionSymbole.ts)`)

export function titelVon(a: Aktion): string {
  return [a.name, a.kuerzel && `(${a.kuerzel})`].filter(Boolean).join(' · ')
}
