import { useOrdner } from '../../geruest/daten'
import { LeereSeite } from '../../geruest/LeereSeite'
import { useSchmal } from '../../geruest/useSchmal'
import { useSprungmarke } from '../../geruest/useSprungmarke'
import { ortAusMarke } from '../../logik/ebenen'
import { postfach } from '../../werte/postfach'
import { MailListe } from './MailListe'

/** Unterpunkte des Postfachs, die keine Ordner sind. */
const ohneListe = new Set(['einstellungen', 'regeln'])

// Postfach: links die Mail-Liste des gewählten Ordners, rechts entsteht der Leser (Scheibe postfach-leser).
// Am Handy füllt die Liste die Breite. Wechselt der Ordner, beginnen Auswahl, Suche und Filter neu.
export default function Seite() {
  const unter = ortAusMarke(useSprungmarke()).unter
  const ordner = useOrdner().ordner
  const schmal = useSchmal()
  if (!unter || ohneListe.has(unter)) return <LeereSeite titel="Postfach" namen={ordner} />
  return (
    <div className="flex min-h-0 flex-1 gap-abstand">
      <MailListe key={unter} ordner={unter} breite={schmal ? undefined : postfach.listePx} />
    </div>
  )
}
