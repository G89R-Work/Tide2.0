import { useState } from 'react'
import { Knopf } from '../../bausteine/Knopf'
import { Seitenkopf } from '../../geruest/Seitenkopf'
import { bearbeitenStarten, useBearbeiten } from '../../kacheln/bearbeiten'
import { Raster } from '../../kacheln/Raster'
import { begruessung } from '../../logik/tageszeit'
import { Beispielliste } from './kacheln/Beispielliste'
import { werkszustand } from './werkszustand'

const leise = (text: string) => <p className="text-sm text-text-gedaempft">{text}</p>

export default function Seite() {
  // Uhrzeit einmal beim Öffnen lesen; die laufende Uhr kommt mit der Seite Heute.
  const [jetzt] = useState(() => new Date())
  const bearbeiten = useBearbeiten()
  const inhalt = {
    gruss: <p className="text-lg">{begruessung(jetzt)}</p>,
    liste: <Beispielliste />,
    termine: leise('Kommt mit dem Kalender.'),
    todos: leise('Kommt mit den To-dos.'),
    notiz: leise('Kommt mit den Notizen.'),
  }
  return (
    <div className="p-4 md:p-6">
      <Seitenkopf titel="Heute">
        {!bearbeiten && (
          <Knopf art="leise" groesse="klein" onClick={bearbeitenStarten} title="Kacheln anpassen (Alt+B)">
            Anpassen
          </Knopf>
        )}
        <Knopf alsKind art="leise" groesse="klein">
          <a href="#bausteine">Bausteine</a>
        </Knopf>
      </Seitenkopf>
      <Raster seite="heute" kacheln={werkszustand} inhalt={inhalt} />
    </div>
  )
}
