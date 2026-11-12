import { NotebookPen } from 'lucide-react'
import { Knopf } from '../../../bausteine/Knopf'

/** Sprung zu den Notizen. Was der Knopf genau tun soll, ist noch offen (docs/IDEEN.md). */
export function Notiz() {
  return (
    <Knopf alsKind art="leise" className="h-full w-full flex-col text-text">
      <a href="#notizen">
        <NotebookPen aria-hidden className="size-5" />
        Notiz
      </a>
    </Knopf>
  )
}
