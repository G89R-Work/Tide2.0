import { lazy, Suspense } from 'react'
import { Geruest } from './geruest/Geruest'
import { useSprungmarke } from './geruest/useSprungmarke'

// Bausteine-Seite (#bausteine) liegt außerhalb des Gerüsts und lädt erst beim Öffnen.
const BausteineSeite = lazy(() => import('./bereiche/bausteine/BausteineSeite'))

export default function App() {
  const marke = useSprungmarke()
  if (marke === '#bausteine') {
    return (
      <Suspense>
        <BausteineSeite />
      </Suspense>
    )
  }
  return <Geruest marke={marke} />
}
