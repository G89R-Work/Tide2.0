import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from './cn'

// Der einzige Knopf in Tide (shadcn-Muster). Vier Spielarten, zwei Größen.
const knopfStil = cva(
  'drueck inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-knopf font-medium whitespace-nowrap select-none outline-none focus-visible:ring-2 focus-visible:ring-akzent focus-visible:ring-offset-2 focus-visible:ring-offset-grund disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      art: {
        standard: 'border border-linie-stark bg-knopf-ton text-text hover:bg-knopf-ton-hover',
        haupt: 'akzent-verlauf font-semibold text-auf-akzent hover:brightness-110',
        leise: 'bg-durchsichtig text-text-gedaempft hover:bg-knopf-ton hover:text-text',
        symbol: 'bg-durchsichtig text-text-gedaempft hover:bg-knopf-ton hover:text-text',
      },
      groesse: {
        normal: 'h-11 px-4 text-sm',
        klein: 'h-8 px-3 text-xs',
      },
    },
    compoundVariants: [
      { art: 'symbol', groesse: 'normal', class: 'w-11 px-0' },
      { art: 'symbol', groesse: 'klein', class: 'w-8 px-0' },
    ],
    defaultVariants: { art: 'standard', groesse: 'normal' },
  },
)

type KnopfProps = ComponentProps<'button'> &
  VariantProps<typeof knopfStil> & {
    /** Statt eines button das Kind (z. B. einen Link) als Knopf darstellen. */
    alsKind?: boolean
  }

export function Knopf({ className, art, groesse, alsKind = false, type, ...rest }: KnopfProps) {
  const Element = alsKind ? Slot : 'button'
  return (
    <Element
      type={alsKind ? undefined : (type ?? 'button')}
      className={cn(knopfStil({ art, groesse }), className)}
      {...rest}
    />
  )
}
