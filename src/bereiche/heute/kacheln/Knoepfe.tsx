import { AktionKnopf } from '../../../geruest/AktionKnopf'
import { useBelegung } from '../../../geruest/belegung'

/** Die drei belegbaren Knöpfe des PCs als Kachel; auf Heute gibt es keine Kopfzeile. */
export function Knoepfe() {
  const pc = useBelegung().pc
  return (
    <div className="flex h-full items-start justify-end gap-2">
      {pc.map((id, i) => (
        <AktionKnopf key={i} id={id} />
      ))}
    </div>
  )
}
