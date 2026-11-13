import { LeereSeite } from '../../geruest/LeereSeite'
import { useOrdner } from '../../geruest/daten'

export default function Seite() {
  return <LeereSeite titel="Postfach" namen={useOrdner().ordner} />
}
