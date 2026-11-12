import { cn } from './cn'

// Das Tide-Logo wie in der Vorlage: zwei Wellen unter einer Sonne, hell auf dem Akzent-Verlauf.
export function Logo({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('akzent-verlauf grid size-12.5 shrink-0 place-items-center rounded-2xl text-auf-akzent', className)}>
      <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round">
        <path d="M2 15c3-3 6-3 10 0s7 3 10 0M2 20c3-3 6-3 10 0s7 3 10 0" />
        <circle cx="12" cy="7" r="3" />
      </svg>
    </span>
  )
}
