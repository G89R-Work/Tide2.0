import { lazy, Suspense, useEffect, useState } from 'react'
import { Knopf } from './bausteine/Knopf'
import { begruessung } from './logik/tageszeit'

// Bereiche laden erst beim Öffnen (Tempo-Regel 4).
const BausteineSeite = lazy(() => import('./bereiche/bausteine/BausteineSeite'))

function useSprungmarke() {
  const [marke, setMarke] = useState(() => location.hash)
  useEffect(() => {
    const neu = () => setMarke(location.hash)
    addEventListener('hashchange', neu)
    return () => removeEventListener('hashchange', neu)
  }, [])
  return marke
}

// Vorläufiger Einstieg bis zum Gerüst; die Bausteine-Seite liegt unter #bausteine.
export default function App() {
  const marke = useSprungmarke()
  // Uhrzeit einmal beim Start lesen; die laufende Uhr kommt mit der Seite Heute.
  const [jetzt] = useState(() => new Date())

  if (marke === '#bausteine') {
    return (
      <Suspense>
        <BausteineSeite />
      </Suspense>
    )
  }
  return (
    <main className="himmel grid min-h-dvh place-items-center p-4 text-center">
      <div>
        <h1 className="text-4xl font-semibold">Tide</h1>
        <p className="mt-2 text-text-gedaempft">{begruessung(jetzt)}</p>
        <Knopf alsKind className="mt-6">
          <a href="#bausteine">Bausteine ansehen</a>
        </Knopf>
      </div>
    </main>
  )
}
