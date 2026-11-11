import type { ReactNode } from 'react'
import { AktionKnopf } from './AktionKnopf'
import { useBelegung } from './belegung'
import { useSchmal } from './useSchmal'

// Kopfzeile jeder Seite: Titel links, rechts die eigenen Knöpfe der Seite und am PC bis zu drei belegbare Knöpfe.
export function Seitenkopf({ titel, children }: { titel: string; children?: ReactNode }) {
  const pc = useBelegung().pc
  const schmal = useSchmal()
  return (
    <header className="flex min-h-11 items-center justify-between gap-4">
      <h1 className="truncate text-2xl font-semibold">{titel}</h1>
      <div className="flex items-center gap-2">
        {children}
        {!schmal && pc.map((id, i) => <AktionKnopf key={i} id={id} />)}
      </div>
    </header>
  )
}
