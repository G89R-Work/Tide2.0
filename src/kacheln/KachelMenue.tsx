import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from 'react'
import { Knopf } from '../bausteine/Knopf'
import type { Geraet } from '../logik/einstellungen'
import { ausblenden, festeGroessen, groessenNamen, setzeGroesse, type Anordnung, type FesteGroesse, type KachelPlan } from '../logik/kacheln'
import { kachelRaster } from '../werte/kacheln'
import { bearbeitenStarten } from './bearbeiten'

// Menü einer Kachel: Rechtsklick oder langer Druck. Natives Popover (oberste Ebene); geschlossen wird es selbst,
// weil das Loslassen von Maus oder Finger sonst schon als „Klick daneben" zählt.
export type MenueOrt = { id: string; x: number; y: number }

type Props = {
  ort: MenueOrt | null
  schliessen: () => void
  anordnung: Anordnung
  plan: readonly KachelPlan[]
  geraet: Geraet
  aendern: (a: Anordnung) => void
  zuruecksetzen: () => void
}

const groessen = Object.keys(festeGroessen) as FesteGroesse[]

export function KachelMenue({ ort, schliessen, anordnung, plan, geraet, aendern, zuruecksetzen }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !ort) return
    if (!el.matches(':popover-open')) el.showPopover()
    // Am Zeiger öffnen, aber nie über den Fensterrand hinaus.
    const rand = kachelRaster.menueRand
    el.style.left = `${Math.max(rand, Math.min(ort.x, innerWidth - el.offsetWidth - rand))}px`
    el.style.top = `${Math.max(rand, Math.min(ort.y, innerHeight - el.offsetHeight - rand))}px`
    el.querySelector('button')?.focus()
  }, [ort])

  useEffect(() => {
    const el = ref.current
    if (!el || !ort) return
    const zu = () => {
      if (el.matches(':popover-open')) el.hidePopover()
      schliessen()
    }
    const daneben = (e: PointerEvent) => !el.contains(e.target as Node) && zu()
    const taste = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      zu()
    }
    addEventListener('pointerdown', daneben, true)
    addEventListener('keydown', taste, true)
    addEventListener('scroll', zu, true)
    return () => {
      removeEventListener('pointerdown', daneben, true)
      removeEventListener('keydown', taste, true)
      removeEventListener('scroll', zu, true)
    }
  }, [ort, schliessen])

  const tun = (f: () => void) => () => {
    f()
    ref.current?.hidePopover()
    schliessen()
  }

  // Pfeiltasten wandern durch die Einträge.
  const taste = (e: KeyboardEvent) => {
    const schritt = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0
    if (!schritt) return
    e.preventDefault()
    const knoepfe = [...(ref.current?.querySelectorAll('button') ?? [])]
    const i = knoepfe.indexOf(document.activeElement as HTMLButtonElement)
    knoepfe[(i + schritt + knoepfe.length) % knoepfe.length]?.focus()
  }

  const id = ort?.id ?? ''
  const eintrag = 'w-full justify-start'
  return (
    <div ref={ref} popover="manual" role="menu" aria-label="Kachel" onKeyDown={taste} className="flaeche-schwebend fixed inset-auto m-0 hidden min-w-48 open:flex flex-col p-1 text-text">
      <Knopf art="leise" groesse="klein" role="menuitem" className={eintrag} onClick={tun(bearbeitenStarten)}>
        Kachel anpassen
      </Knopf>
      <hr className="my-1 border-linie" />
      {groessen.map((g) => (
        <Knopf key={g} art="leise" groesse="klein" role="menuitem" className={eintrag} onClick={tun(() => aendern(setzeGroesse(anordnung, plan, geraet, id, g)))}>
          {groessenNamen[g]}
        </Knopf>
      ))}
      <hr className="my-1 border-linie" />
      <Knopf art="leise" groesse="klein" role="menuitem" className={eintrag} onClick={tun(() => aendern(ausblenden(anordnung, id)))}>
        Ausblenden
      </Knopf>
      <Knopf art="leise" groesse="klein" role="menuitem" className={eintrag} onClick={tun(zuruecksetzen)}>
        Seite zurücksetzen
      </Knopf>
    </div>
  )
}
