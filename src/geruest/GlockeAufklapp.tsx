import { Bell } from 'lucide-react'
import { cn } from '../bausteine/cn'
import { Aufklapp, AufklappInhalt, AufklappKnopf } from '../bausteine/Aufklapp'
import { Knopf } from '../bausteine/Knopf'
import { ruheBisText } from '../logik/meldungen'
import { uhrzeit } from './format'
import { gelesen, useMeldungen } from './meldungen'

// Glocke (lädt nach dem Start nach, siehe Glocke.tsx): hierhin falten sich Meldungen nach sechs Sekunden. Die Zahl zählt, was seit dem letzten Öffnen dazukam.
// Die Liste klappt am Knopf auf (Esc oder Klick daneben schließt) und nennt oben das Ebbe-Fenster. Öffnen gilt als gelesen.
export default function GlockeAufklapp({ className }: { className?: string }) {
  const { da, wartend, neu, fenster } = useMeldungen()

  const titel = neu ? `Meldungen, ${neu} neu` : 'Meldungen'
  return (
    <Aufklapp onOpenChange={(offen) => offen && gelesen(Date.now())}>
      <AufklappKnopf asChild>
        <Knopf art="symbol" groesse="klein" title={titel} aria-label={titel} className={cn('relative pointer-events-auto', className)}>
          <Bell className="size-4" aria-hidden />
          {neu > 0 && <span className="glocke-zahl">{neu > 9 ? '9+' : neu}</span>}
        </Knopf>
      </AufklappKnopf>
      <AufklappInhalt side="top" align="end" breite="inhalt" aria-label="Meldungen" className="flex max-h-80 w-72 flex-col gap-2 p-3 text-sm">
        {fenster && <p className="font-medium">{fenster}</p>}
        {da.length === 0 && <p className="text-text-gedaempft">Keine Meldungen.</p>}
        {da.length > 0 && (
          <ul className="flex flex-col gap-1">
            {da.map((m) => (
              <li key={m.id} className="flex gap-2">
                <span className="text-text-gedaempft tabular-nums">{uhrzeit(m.ankunft)}</span>
                <span className={cn('min-w-0', m.wichtig && 'text-warnung')}>{m.text}</span>
              </li>
            ))}
          </ul>
        )}
        {wartend > 0 && <p className="text-xs text-text-gedaempft">{wartend === 1 ? 'Eine Meldung wartet' : `${wartend} Meldungen warten`} bis {ruheBisText} (Ebbe-Modus).</p>}
      </AufklappInhalt>
    </Aufklapp>
  )
}
