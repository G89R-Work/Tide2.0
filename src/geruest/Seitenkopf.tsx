import type { ReactNode } from 'react'

// Kopfzeile jeder Seite: Titel links, rechts die eigenen Knöpfe der Seite.
// Uhrzeit, Wetter und die belegbaren Knöpfe stehen am PC in der Kopfzeile des Gerüsts, am Handy oben rechts.
export function Seitenkopf({ titel, children }: { titel: string; children?: ReactNode }) {
  return (
    <header className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <h1 className="truncate text-2xl font-semibold">{titel}</h1>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </header>
  )
}
