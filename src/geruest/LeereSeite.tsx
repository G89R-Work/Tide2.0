import { ebeneVon, ortAusMarke } from '../logik/ebenen'
import { Seitenkopf } from './Seitenkopf'
import { useSprungmarke } from './useSprungmarke'

// Platzhalter, bis ein Bereich gebaut wird. Zeigt den gewählten Punkt der zweiten Ebene.
export function LeereSeite({ titel }: { titel: string }) {
  const ort = ortAusMarke(useSprungmarke())
  const unter = ebeneVon(ort.bereich).find((p) => p.id === ort.unter)?.name
  return (
    <div>
      <Seitenkopf titel={titel} />
      {unter && <p className="mt-1 text-lg text-text-gedaempft">{unter}</p>}
      <p className="mt-4 text-text-gedaempft">Dieser Bereich entsteht in einer späteren Etappe.</p>
    </div>
  )
}
