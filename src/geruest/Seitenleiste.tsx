import { Waves } from 'lucide-react'
import { Knopf } from '../bausteine/Knopf'
import { cn } from '../bausteine/cn'
import { bereiche, type BereichId } from '../logik/bereiche'
import { symbole, vorladen } from './seiten'

// Links die Bereiche. Schmal nur Symbole (Name als Hinweis), breit Symbole mit Namen.
export function Seitenleiste({ offen, mitNamen }: { offen: BereichId; mitNamen: boolean }) {
  const eintrag = (b: (typeof bereiche)[number]) => {
    const Symbol = symbole[b.id]
    const aktiv = b.id === offen
    return (
      <Knopf
        key={b.id}
        alsKind
        art="leise"
        className={cn('w-full', mitNamen ? 'justify-start' : 'px-0', aktiv && 'bg-knopf-ton text-text')}
      >
        <a
          href={`#${b.id}`}
          aria-current={aktiv ? 'page' : undefined}
          title={mitNamen ? undefined : b.name}
          onPointerEnter={() => vorladen(b.id)}
          onFocus={() => vorladen(b.id)}
        >
          <Symbol aria-hidden className="size-5 shrink-0" />
          {mitNamen ? <span className="truncate">{b.name}</span> : <span className="sr-only">{b.name}</span>}
        </a>
      </Knopf>
    )
  }

  const einstellungen = bereiche.at(-1)!
  return (
    <nav aria-label="Bereiche" className="flaeche-leiste flex h-full flex-col gap-1 overflow-hidden p-2">
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
      {bereiche.slice(0, -1).map(eintrag)}
      <div className="mt-auto">{eintrag(einstellungen)}</div>
    </nav>
  )
}
