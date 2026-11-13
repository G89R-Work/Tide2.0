import { ebeneVon, ortAusMarke } from '../logik/ebenen'
import { Seitenkopf } from './Seitenkopf'
import { useSprungmarke } from './useSprungmarke'

// Platzhalter, bis ein Bereich gebaut wird. Zeigt den gewählten Punkt der zweiten Ebene;
// `namen` ergänzt Unterpunkte, die aus den Daten kommen (Ordner des Postfachs).
export function LeereSeite({ titel, namen = [] }: { titel: string; namen?: readonly { id: string; name: string }[] }) {
  const ort = ortAusMarke(useSprungmarke())
  const unter = [...ebeneVon(ort.bereich), ...namen].find((p) => p.id === ort.unter)?.name
  return (
    <div>
      <Seitenkopf titel={titel} />
      {unter && <p className="mt-1 text-lg text-text-gedaempft">{unter}</p>}
    </div>
  )
}
