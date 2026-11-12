import { Bell } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from '../bausteine/cn'
import { Flaeche } from '../bausteine/Flaeche'
import { Knopf } from '../bausteine/Knopf'
import { gelesen, useMeldungen } from './meldungen'

const zweistellig = (n: number) => String(n).padStart(2, '0')
const uhr = (ms: number) => {
  const d = new Date(ms)
  return `${zweistellig(d.getHours())}:${zweistellig(d.getMinutes())}`
}

// Glocke: hierhin falten sich Meldungen nach sechs Sekunden. Die Zahl zählt, was seit dem letzten Öffnen dazukam.
// Die Liste ist ein natives Popover (Esc oder Klick daneben schließt) und nennt oben das Ebbe-Fenster.
export function Glocke({ className }: { className?: string }) {
  const { da, wartend, neu, fenster } = useMeldungen()
  const liste = useRef<HTMLDivElement>(null)
  const [lage, setLage] = useState({ x: 0, y: 0, oben: true })

  useEffect(() => {
    const el = liste.current!
    const zu = (ev: Event) => (ev as ToggleEvent).newState === 'open' && gelesen(Date.now())
    el.addEventListener('toggle', zu)
    return () => el.removeEventListener('toggle', zu)
  }, [])

  const oeffne = (knopf: HTMLElement) => {
    const r = knopf.getBoundingClientRect()
    const oben = r.top > innerHeight / 2
    setLage({ oben, x: Math.max(8, Math.min(r.right - 288, innerWidth - 296)), y: oben ? r.top - 8 : r.bottom + 8 })
    liste.current!.togglePopover()
  }

  const titel = neu ? `Meldungen, ${neu} neu` : 'Meldungen'
  return (
    <>
      <Knopf art="symbol" groesse="klein" title={titel} aria-label={titel} className={cn('relative pointer-events-auto', className)} onClick={(ev) => oeffne(ev.currentTarget)}>
        <Bell className="size-4" aria-hidden />
        {neu > 0 && <span className="glocke-zahl">{neu > 9 ? '9+' : neu}</span>}
      </Knopf>
      <div
        ref={liste}
        popover="auto"
        className={cn('kurve-karte', lage.oben && '-translate-y-full')}
        style={{ '--x': lage.x, '--y': lage.y } as CSSProperties}
      >
        <Flaeche art="schwebend" className="flex max-h-80 flex-col gap-2 overflow-y-auto p-3 text-sm text-text">
          {fenster && <p className="font-medium">{fenster}</p>}
          {da.length === 0 && <p className="text-text-gedaempft">Keine Meldungen.</p>}
          {da.length > 0 && (
            <ul className="flex flex-col gap-1">
              {da.map((m) => (
                <li key={m.id} className="flex gap-2">
                  <span className="text-text-gedaempft tabular-nums">{uhr(m.ankunft)}</span>
                  <span className={cn('min-w-0', m.wichtig && 'text-warnung')}>{m.text}</span>
                </li>
              ))}
            </ul>
          )}
          {wartend > 0 && <p className="text-xs text-text-gedaempft">{wartend === 1 ? 'Eine Meldung wartet' : `${wartend} Meldungen warten`} bis 7:00 (Ebbe-Modus).</p>}
        </Flaeche>
      </div>
    </>
  )
}
