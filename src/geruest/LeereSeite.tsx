import { Seitenkopf } from './Seitenkopf'

// Platzhalter, bis ein Bereich gebaut wird.
export function LeereSeite({ titel }: { titel: string }) {
  return (
    <div className="p-6">
      <Seitenkopf titel={titel} />
      <p className="mt-4 text-text-gedaempft">Dieser Bereich entsteht in einer späteren Etappe.</p>
    </div>
  )
}
