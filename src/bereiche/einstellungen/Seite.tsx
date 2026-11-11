import { LeereSeite } from '../../geruest/LeereSeite'
import { Seitenkopf } from '../../geruest/Seitenkopf'
import { useSprungmarke } from '../../geruest/useSprungmarke'
import { ortAusMarke } from '../../logik/ebenen'
import { KnoepfeBelegen } from './KnoepfeBelegen'

export default function Seite() {
  const ort = ortAusMarke(useSprungmarke())
  if (ort.unter !== 'navigation') return <LeereSeite titel="Einstellungen" />
  return (
    <div className="p-6">
      <Seitenkopf titel="Einstellungen" />
      <p className="mt-1 text-lg text-text-gedaempft">Navigation · Knöpfe belegen</p>
      <KnoepfeBelegen />
    </div>
  )
}
