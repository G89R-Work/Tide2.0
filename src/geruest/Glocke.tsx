import { Suspense, lazy } from 'react'

// Die Glocke mit ihrer Liste lädt direkt nach dem Start nach, damit der Popover-Baustein nicht im Startpaket steckt (Tempo-Grenze 200 KB).
const GlockeAufklapp = lazy(() => import('./GlockeAufklapp'))

export function Glocke({ className }: { className?: string }) {
  return (
    <Suspense>
      <GlockeAufklapp className={className} />
    </Suspense>
  )
}
