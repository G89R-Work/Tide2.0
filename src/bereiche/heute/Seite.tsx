import { Knopf } from '../../bausteine/Knopf'
import { useEinstellung } from '../../geruest/einstellungen'
import { Seitenkopf } from '../../geruest/Seitenkopf'
import { useBrauchtDich } from '../../geruest/useBrauchtDich'
import { useMinute } from '../../geruest/useMinute'
import { bearbeitenStarten, useBearbeiten } from '../../kacheln/bearbeiten'
import { Raster } from '../../kacheln/Raster'
import { einstellungen } from '../../logik/einstellungen'
import { begruessung } from '../../logik/tageszeit'
import { BrauchtDich } from './BrauchtDich'
import { AlsNaechstes, Uhr } from './Himmel'
import { Woche } from './kacheln/Woche'
import { useTermine } from './useTermine'
import { werkszustand } from './werkszustand'

const name = einstellungen.find((e) => e.id === 'name')!
const uhrZeigen = einstellungen.find((e) => e.id === 'heute-uhr')!

// Heute (docs/konzept/10-heute.md): viel Himmel, wenig Text. Oben Gruß, die große Überschrift und die Uhr,
// darunter „Braucht dich" und die Kacheln.
export default function Seite() {
  const jetzt = useMinute()
  const bearbeiten = useBearbeiten()
  const wer = String(useEinstellung(name)).trim()
  const uhr = useEinstellung(uhrZeigen) === true
  const { termine, fehler } = useTermine()
  const braucht = useBrauchtDich()
  const gruss = wer ? `${begruessung(jetzt)}, ${wer}` : begruessung(jetzt)

  return (
    <div className="p-4 md:p-6">
      <Seitenkopf titel={gruss}>
        {!bearbeiten && (
          <Knopf art="leise" groesse="klein" onClick={bearbeitenStarten} title="Kacheln anpassen (Alt+B)">
            Anpassen
          </Knopf>
        )}
      </Seitenkopf>
      <p className="text-sm text-text-gedaempft">{jetzt.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      <section className="heute-himmel" aria-label="Als Nächstes">
        {fehler ? <p className="text-sm text-warnung">{fehler}</p> : <AlsNaechstes termine={termine} jetzt={jetzt} />}
        {uhr && <Uhr termine={termine} jetzt={jetzt} />}
      </section>
      <BrauchtDich daten={braucht.daten} fehler={braucht.fehler} jetzt={jetzt} />
      <Raster seite="heute" kacheln={werkszustand} inhalt={{ woche: <Woche termine={termine} eintraege={braucht.liste} jetzt={jetzt} /> }} />
    </div>
  )
}
