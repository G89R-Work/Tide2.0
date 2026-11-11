import type { ReactNode } from 'react'

// Kopfzeile jeder Seite: Titel links, rechts später bis zu drei belegbare Knöpfe.
export function Seitenkopf({ titel, children }: { titel: string; children?: ReactNode }) {
  return (
    <header className="flex min-h-11 items-center justify-between gap-4">
      <h1 className="truncate text-2xl font-semibold">{titel}</h1>
      {children && <div className="flex gap-2">{children}</div>}
    </header>
  )
}
