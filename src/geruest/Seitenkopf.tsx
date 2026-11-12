import type { ReactNode } from 'react'

// Kopfzeile jeder Seite: Titel links, rechts die eigenen Knöpfe der Seite.
// Uhrzeit, Wetter und die belegbaren Knöpfe stehen am PC in der Kopfzeile des Gerüsts, am Handy oben rechts.
export function Seitenkopf({ titel, children }: { titel: string; children?: ReactNode }) {
  return (
    <header className="flex min-h-11 items-center justify-between gap-4">
      <h1 className="truncate text-2xl font-semibold">{titel}</h1>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  )
}
