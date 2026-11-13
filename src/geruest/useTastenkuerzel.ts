import { useEffect } from 'react'
import { aktionFuerKuerzel, kuerzelAus } from '../logik/aktionen'
import { fuehreAus } from './befehle'

// Tastenkürzel für jede Aktion mit Kürzel. Noch nicht gebaute Aktionen tun nichts.
export function useTastenkuerzel() {
  useEffect(() => {
    const druck = (e: KeyboardEvent) => {
      const ziel = e.target as HTMLElement | null
      const inFeld = !!ziel?.closest('input, textarea, select, [contenteditable="true"]')
      const kuerzel = kuerzelAus(e, inFeld)
      const a = kuerzel ? aktionFuerKuerzel(kuerzel) : undefined
      if (!a || a.spaeter) return
      e.preventDefault()
      if (a.befehl) fuehreAus(a.id)
      else if (a.ziel) location.hash = a.ziel
    }
    addEventListener('keydown', druck)
    return () => removeEventListener('keydown', druck)
  }, [])
}
