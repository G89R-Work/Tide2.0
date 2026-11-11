import { useState } from 'react'
import { begruessung } from './logik/tageszeit'

// Leere App aus Etappe 0. Farben und Bausteine kommen mit der Scheibe werte-und-bausteine.
export default function App() {
  // Uhrzeit einmal beim Start lesen; die laufende Uhr kommt mit der Seite Heute.
  const [jetzt] = useState(() => new Date())
  return (
    <main className="grid min-h-dvh place-items-center p-4 text-center">
      <div>
        <h1 className="text-4xl font-semibold">Tide</h1>
        <p className="mt-2">{begruessung(jetzt)}</p>
      </div>
    </main>
  )
}
