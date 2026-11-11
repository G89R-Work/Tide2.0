import { lazy, type ComponentType } from 'react'
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  ChefHat,
  ListTodo,
  Mail,
  Settings,
  ShoppingCart,
  Sun,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { BereichId } from '../logik/bereiche'

// Je Bereich: Symbol und die Seite. Seiten laden erst beim Öffnen (Tempo-Regel 4);
// vorladen() holt sie schon, wenn der Zeiger über dem Eintrag liegt.
type Lader = () => Promise<{ default: ComponentType }>

const lader: Record<BereichId, Lader> = {
  heute: () => import('../bereiche/heute/Seite'),
  postfach: () => import('../bereiche/postfach/Seite'),
  kalender: () => import('../bereiche/kalender/Seite'),
  todos: () => import('../bereiche/todos/Seite'),
  einkauf: () => import('../bereiche/einkauf/Seite'),
  kochen: () => import('../bereiche/kochen/Seite'),
  finanzen: () => import('../bereiche/finanzen/Seite'),
  arbeit: () => import('../bereiche/arbeit/Seite'),
  notizen: () => import('../bereiche/notizen/Seite'),
  einstellungen: () => import('../bereiche/einstellungen/Seite'),
}

export const seiten = {} as Record<BereichId, ComponentType>
for (const id of Object.keys(lader) as BereichId[]) seiten[id] = lazy(lader[id])

export function vorladen(id: BereichId) {
  // Fehler zeigt erst das Öffnen der Seite; hier nur nicht unbehandelt lassen.
  lader[id]().catch(() => {})
}

export const symbole: Record<BereichId, LucideIcon> = {
  heute: Sun,
  postfach: Mail,
  kalender: CalendarDays,
  todos: ListTodo,
  einkauf: ShoppingCart,
  kochen: ChefHat,
  finanzen: Wallet,
  arbeit: Briefcase,
  notizen: BookOpen,
  einstellungen: Settings,
}
