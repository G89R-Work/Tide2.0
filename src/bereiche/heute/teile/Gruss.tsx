import { useEinstellung } from '../../../geruest/einstellungen'
import { einstellungen } from '../../../logik/einstellungen'
import { begruessung } from '../../../logik/tageszeit'
import { datumLang } from '../../../geruest/format'

const name = einstellungen.find((e) => e.id === 'name')!

/** Gruß mit Namen und Datum; die Überschrift der Seite. */
export function Gruss({ jetzt }: { jetzt: Date }) {
  const wer = String(useEinstellung(name)).trim()
  return (
    <div>
      <h1 className="text-2xl leading-none font-semibold">{wer ? `${begruessung(jetzt)}, ${wer}.` : `${begruessung(jetzt)}.`}</h1>
      <p className="mt-1 text-sm leading-tight text-text-gedaempft">{datumLang(jetzt)}</p>
    </div>
  )
}
