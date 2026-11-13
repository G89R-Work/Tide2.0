import { useDrag } from '@use-gesture/react'
import { Knopf } from '../bausteine/Knopf'
import { Logo } from '../bausteine/Logo'
import { cn } from '../bausteine/cn'
import { bereiche, type BereichId } from '../logik/bereiche'
import { einstellung } from '../logik/einstellungen'
import { leiste } from '../werte/leiste'
import { setzeHier } from './einstellungen'
import { symbole, vorladen } from './seiten'

const breite = einstellung('leiste-breite')

// Links die Bereiche, von ganz oben bis ganz unten; oben das Logo (führt zu Heute). Schmal nur Symbole (Name als Hinweis),
// breit Symbole mit Namen. Wischen nach rechts macht sie breit, nach links schmal (mit Rückgängig). Unten das Zahnrad.
export function Seitenleiste({ offen, mitNamen }: { offen: BereichId; mitNamen: boolean }) {
  const wischen = useDrag(
    ({ swipe: [x] }) => {
      if (x === 1 && !mitNamen) setzeHier(breite, 'breit', { text: 'Seitenleiste breit' })
      if (x === -1 && mitNamen) setzeHier(breite, 'schmal', { text: 'Seitenleiste schmal' })
    },
    { axis: 'x', filterTaps: true },
  )

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
          draggable={false}
        >
          <Symbol aria-hidden className="size-5 shrink-0" />
          {mitNamen && !nurSymbol ? <span className="truncate">{b.name}</span> : <span className="sr-only">{b.name}</span>}
        </a>
      </Knopf>
    )
  }

  const einstellungen = bereiche.at(-1)!
  return (
    // Oben die Bereiche, bei wenig Höhe scrollbar; unten das Zahnrad, immer sichtbar.
    <nav
      {...wischen()}
      aria-label="Bereiche"
      className="flaeche-leiste leiste-breite flex h-full shrink-0 touch-pan-y flex-col gap-1 overflow-hidden py-3"
      style={{ width: mitNamen ? leiste.breitPx : leiste.schmalPx, paddingInline: leiste.innenPx }}
    >
      {/* Auch die scrollbare Liste nur senkrecht, sonst übernimmt der Browser das Wischen des Fingers. */}
      <div className="flex min-h-0 flex-1 touch-pan-y flex-col gap-1 overflow-y-auto">
        <a
          href="#heute"
          title="Zu Heute"
          draggable={false}
          className="drueck mb-4 flex items-center gap-3 self-start rounded-2xl font-semibold text-text outline-none focus-visible:ring-2 focus-visible:ring-akzent"
        >
          <Logo />
          {mitNamen && <span>Tide</span>}
          <span className="sr-only">Tide, zu Heute</span>
        </a>
        {bereiche.slice(0, -1).map((b) => eintrag(b))}
      </div>
      <div className="shrink-0">{eintrag(einstellungen, true)}</div>
    </nav>
  )
}
