import { LayoutDashboard } from 'lucide-react'
import { useId, useRef } from 'react'
import { Knopf } from '../bausteine/Knopf'
import { bearbeitenStarten } from './bearbeiten'

// Knopf in der Seitenleiste neben dem Zahnrad: öffnet eine kleine Rückfrage, erst „Bearbeiten starten“ schaltet den Modus ein.
// So verschiebt man nichts aus Versehen. Die Rückfrage ist ein Popover des Browsers (schließt mit Escape und Tipp daneben)
// und hängt rechts neben dem Knopf (CSS-Anker; ohne Anker-Unterstützung steht sie mittig).
export function BearbeitenStarten() {
  const id = useId()
  const frage = useRef<HTMLDivElement>(null)
  return (
    <>
      <Knopf art="leise" className="anker-bearbeiten w-full px-0" aria-label="Kacheln bearbeiten" title="Kacheln bearbeiten" popoverTarget={id}>
        <LayoutDashboard aria-hidden className="size-5" />
      </Knopf>
      <div ref={frage} id={id} popover="auto" role="dialog" aria-label="Bearbeiten starten" className="flaeche-schwebend schwebt-am-anker w-64 p-4 text-text">
        <p className="font-semibold">Kacheln bearbeiten?</p>
        <p className="mt-1 text-sm text-text-gedaempft">Danach lassen sich Kacheln und Gezeitenkurve verschieben und in der Größe ändern, bis du „Fertig“ drückst.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Knopf groesse="klein" art="leise" popoverTarget={id} popoverTargetAction="hide">
            Abbrechen
          </Knopf>
          <Knopf
            groesse="klein"
            art="haupt"
            onClick={() => {
              frage.current?.hidePopover()
              bearbeitenStarten()
            }}
          >
            Bearbeiten starten
          </Knopf>
        </div>
      </div>
    </>
  )
}
