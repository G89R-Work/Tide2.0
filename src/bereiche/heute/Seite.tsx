import { useState } from 'react'
import { Knopf } from '../../bausteine/Knopf'
import { Seitenkopf } from '../../geruest/Seitenkopf'
import { begruessung } from '../../logik/tageszeit'
import { Beispielliste } from './Beispielliste'

export default function Seite() {
  // Uhrzeit einmal beim Öffnen lesen; die laufende Uhr kommt mit der Seite Heute.
  const [jetzt] = useState(() => new Date())
  return (
    <div className="p-6">
      <Seitenkopf titel="Heute">
        <Knopf alsKind art="leise" groesse="klein">
          <a href="#bausteine">Bausteine</a>
        </Knopf>
      </Seitenkopf>
      <p className="mt-1 text-text-gedaempft">{begruessung(jetzt)}</p>
      <div className="max-w-md">
        <Beispielliste />
      </div>
    </div>
  )
}
