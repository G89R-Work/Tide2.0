import { Waves } from 'lucide-react'
import type { Ref } from 'react'
import { Knopf } from '../bausteine/Knopf'
import { cn } from '../bausteine/cn'
import { bereiche, type BereichId } from '../logik/bereiche'
import { symbole, vorladen } from './seiten'

// Links die Bereiche. Schmal nur Symbole (Name als Hinweis), breit Symbole mit Namen. Unten liegt im Bearbeiten-Modus
// das Bedienfeld der Kacheln (`bearbeitenRef`, gefüllt vom Raster der offenen Seite).
export function Seitenleiste({ offen, mitNamen, bearbeitenRef }: { offen: BereichId; mitNamen: boolean; bearbeitenRef: Ref<HTMLDivElement> }) {
  const eintrag = (b: (typeof bereiche)[number], nurSymbol = false) => {
    const Symbol = symbole[b.id]
    const aktiv = b.id === offen
    return (
      <Knopf
        key={b.id}
        alsKind
        art="leise"
        className={cn('w-full', mitNamen && !nurSymbol ? 'justify-start' : 'px-0', aktiv && 'bg-knopf-ton text-text')}
      >
        <a
          href={`#${b.id}`}
          aria-current={aktiv ? 'page' : undefined}
          title={mitNamen && !nurSymbol ? undefined : b.name}
          onPointerEnter={() => vorladen(b.id)}
          onFocus={() => vorladen(b.id)}
        >
          <Symbol aria-hidden className="size-5 shrink-0" />
          {mitNamen && !nurSymbol ? <span className="truncate">{b.name}</span> : <span className="sr-only">{b.name}</span>}
        </a>
      </Knopf>
    )
  }

  const einstellungen = bereiche.at(-1)!
  return (
    // Oben die Bereiche, bei wenig Höhe scrollbar; unten Bedienfeld und Zahnrad, die immer sichtbar bleiben.
    <nav aria-label="Bereiche" className="flaeche-leiste flex h-full flex-col gap-1 overflow-hidden p-2">
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        <Knopf
          alsKind
          art="leise"
          className={cn('mb-2 w-full text-text', mitNamen ? 'justify-start text-base' : 'px-0')}
        >
          <a href="#heute" title="Zu Heute">
            <Waves aria-hidden className="size-6 shrink-0 text-akzent" />
            {mitNamen && <span className="font-semibold">Tide</span>}
            <span className="sr-only">Tide, zu Heute</span>
          </a>
        </Knopf>
        {bereiche.slice(0, -1).map((b) => eintrag(b))}
      </div>
      <div ref={bearbeitenRef} className="@container shrink-0" />
      {/* Der Name passt nicht in die Standardbreite: dort immer nur das Zahnrad, mittig. */}
      <div className="shrink-0">{eintrag(einstellungen, true)}</div>
    </nav>
  )
}
