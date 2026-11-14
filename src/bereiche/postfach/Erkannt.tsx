import { useMemo } from 'react'
import { Knopf } from '../../bausteine/Knopf'
import { useMailInhalt, useMails } from '../../geruest/daten'
import { euro, tagLang, uhrzeit } from '../../geruest/format'
import { alsAufgabe, erledigt } from '../../geruest/mailAktionen'
import { erkenne, type Erkannt as Treffer } from '../../logik/erkannt'
import { ausSchluessel } from '../../logik/zeit'
import type { Mail } from '../../vertrag/postfach'

const tag = (schluessel: string) => {
  const d = ausSchluessel(schluessel)
  return d ? tagLang(d) : schluessel
}

/** Eine Zeile je Erkanntem: Art und Werte. */
function zeile(e: Treffer): [string, string] {
  switch (e.art) {
    case 'rechnung': {
      const diff = e.vorher === undefined ? '' : e.vorher === e.cent ? ' · wie letztes Mal' : ` · ${e.cent > e.vorher ? '+' : '−'}${euro(Math.abs(e.cent - e.vorher))} zum letzten Mal`
      return ['Rechnung', `${euro(e.cent)}${e.faellig ? ` · fällig ${tag(e.faellig)}` : ''}${diff}`]
    }
    case 'termin':
      return ['Termin', `${tagLang(new Date(e.beginn))}, ${uhrzeit(e.beginn)}`]
    case 'sendung':
      return ['Sendung', [e.nummer, e.erwartet && `kommt ${tag(e.erwartet)}`].filter(Boolean).join(' · ')]
    case 'frist':
      return ['Frist', `${e.was} bis ${tag(e.bis)}`]
  }
}

/** Frist für „Frist eintragen“: die Frist, sonst die Fälligkeit einer Rechnung. */
const fristAus = (l: readonly Treffer[]) => l.find((e) => e.art === 'frist')?.bis ?? l.find((e) => e.art === 'rechnung')?.faellig

// Erkannt statt „Kurz gesagt“: erscheint nur, wenn ein Muster sicher passt. Knöpfe: Frist eintragen, Als To-do, Erledigt.
export function Erkannt({ m }: { m: Mail }) {
  const { inhalt } = useMailInhalt(m.id)
  const { mails } = useMails(m.ordner)
  const liste = useMemo(() => (inhalt ? erkenne(m, inhalt.text, mails ?? []) : []), [m, inhalt, mails])
  if (liste.length === 0) return null
  const frist = fristAus(liste)
  const titel = liste.find((e) => e.art === 'frist')?.was ?? m.betreff
  return (
    <section aria-label="Erkannt" className="mt-4 flex flex-col gap-2 rounded-knopf border border-linie-stark p-3">
      <span className="beschriftung text-akzent">Erkannt</span>
      <dl className="flex flex-col gap-1 text-sm">
        {liste.map((e) => {
          const [art, wert] = zeile(e)
          return (
            <div key={art} className="flex gap-3">
              <dt className="w-20 shrink-0 text-text-gedaempft">{art}</dt>
              <dd className="min-w-0">{wert}</dd>
            </div>
          )
        })}
      </dl>
      <div className="flex flex-wrap gap-2">
        {frist && (
          <Knopf art="haupt" groesse="klein" onClick={() => void alsAufgabe(titel, frist)}>
            Frist eintragen
          </Knopf>
        )}
        <Knopf groesse="klein" onClick={() => void alsAufgabe(m.betreff)}>
          Als To-do
        </Knopf>
        {m.brauchtDich && (
          <Knopf groesse="klein" onClick={() => void erledigt([m])}>
            Erledigt
          </Knopf>
        )}
      </div>
    </section>
  )
}
