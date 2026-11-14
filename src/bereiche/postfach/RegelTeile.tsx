import { Plus, X } from 'lucide-react'
import type { ActionProps, ValueEditorProps, ValueSelectorProps } from 'react-querybuilder'
import { Auswahl } from '../../bausteine/Auswahl'
import { Eingabe } from '../../bausteine/Eingabe'
import { Knopf } from '../../bausteine/Knopf'

// Tide-Aussehen für react-querybuilder: dieselben Bausteine wie überall (Auswahl, Eingabe, Knopf), keine eigenen Stile.
// Alles auf Modulebene, sonst baut der Editor bei jedem Zeichnen neu und das Eingabefeld verliert den Fokus.

export function Wahl({ options, value, handleOnChange, title, disabled }: ValueSelectorProps) {
  return (
    <Auswahl aria-label={title} value={value} disabled={disabled} onChange={(e) => handleOnChange(e.target.value)}>
      {options.map((o) =>
        'options' in o ? null : (
          <option key={o.name} value={o.name}>
            {o.label}
          </option>
        ),
      )}
    </Auswahl>
  )
}

export function Wert({ value, handleOnChange, title, disabled }: ValueEditorProps) {
  return <Eingabe aria-label={title} value={String(value ?? '')} disabled={disabled} onChange={(e) => handleOnChange(e.target.value)} className="flex-1" />
}

export function Dazu({ label, title, handleOnClick, disabled }: ActionProps) {
  return (
    <Knopf groesse="klein" title={title} disabled={disabled} onClick={handleOnClick} className="self-start">
      <Plus aria-hidden className="size-4" />
      {label}
    </Knopf>
  )
}

export function Weg({ title, handleOnClick, disabled }: ActionProps) {
  return (
    <Knopf art="symbol" aria-label={title} title={title} disabled={disabled} onClick={handleOnClick}>
      <X aria-hidden className="size-4" />
    </Knopf>
  )
}
