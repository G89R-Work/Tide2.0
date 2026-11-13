import { Search } from 'lucide-react'
import { Eingabe } from '../bausteine/Eingabe'
import { markeFuer } from '../logik/ebenen'
import { setzeEinstellungenSuche, useEinstellungenSuche } from './einstellungenSuche'

// Suche oben in der zweiten Ebene der Einstellungen. Enter zeigt die Treffer (am Handy schließt das Menü).
export function EinstellungenSuchfeld({ beiWahl }: { beiWahl?: () => void }) {
  const text = useEinstellungenSuche()
  return (
    <label className="relative mb-3 block">
      <span className="sr-only">Einstellungen durchsuchen</span>
      <Search aria-hidden className="pointer-events-none absolute top-3.5 left-3 size-4 text-text-gedaempft" />
      <Eingabe
        type="search"
        placeholder="Einstellungen durchsuchen"
        className="w-full pl-9"
        value={text}
        onChange={(x) => setzeEinstellungenSuche(x.currentTarget.value)}
        onKeyDown={(x) => {
          if (x.key === 'Escape') setzeEinstellungenSuche('')
          if (x.key !== 'Enter') return
          x.preventDefault()
          if (!location.hash.startsWith(markeFuer('einstellungen'))) location.hash = markeFuer('einstellungen')
          beiWahl?.()
        }}
      />
    </label>
  )
}
