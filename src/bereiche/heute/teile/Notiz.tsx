import { NotebookPen } from 'lucide-react'
import { Leistenknopf } from './Leistenknopf'

/** Sprung zu den Notizen. Was der Knopf genau tun soll, ist noch offen (docs/IDEEN.md). */
export function Notiz() {
  return (
    <Leistenknopf symbol={NotebookPen} text="Notiz" href="#notizen" />
  )
}
