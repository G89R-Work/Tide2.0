import { Menu, Tags } from 'lucide-react'
import { useRef, useState } from 'react'
import { Knopf } from '../bausteine/Knopf'
import { cn } from '../bausteine/cn'
import { bereiche, type BereichId } from '../logik/bereiche'
import { ebeneVon, markeFuer, type Ort } from '../logik/ebenen'
import { symbole, vorladen } from './seiten'
import { ZweiteEbene } from './ZweiteEbene'

// Menü am Handy: oben links der Knopf mit Punkt, darin zwei Spalten.
// Links die Bereiche als Symbole (Schalter blendet Namen ein), rechts die zweite Ebene des gewählten Bereichs.
// Natives dialog: Fokus bleibt im Menü, Zurück-Taste und Esc schließen es.
const namenSchluessel = 'tide.menue.namen'

function liesNamen() {
  try {
    return localStorage.getItem(namenSchluessel) === 'ja'
  } catch {
    return false
  }
}

export function HandyMenue({ ort, zahl }: { ort: Ort; zahl: number }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [gewaehlt, setGewaehlt] = useState<BereichId>(ort.bereich)
  const [mitNamen, setMitNamen] = useState(liesNamen)

  const oeffnen = () => {
    setGewaehlt(ort.bereich)
    dialog.current?.showModal()
  }
  const schliessen = () => dialog.current?.close()
  const namenUmschalten = () => {
    const neu = !mitNamen
    setMitNamen(neu)
    try {
      localStorage.setItem(namenSchluessel, neu ? 'ja' : 'nein')
    } catch {
      /* Ohne Speicher gilt der Schalter nur bis zum Neuladen. */
    }
  }

  const eintrag = (b: (typeof bereiche)[number]) => {
    const Symbol = symbole[b.id]
    const ohneEbene = ebeneVon(b.id).length === 0
    const klasse = cn('w-full', mitNamen ? 'justify-start' : 'px-0', b.id === gewaehlt && 'bg-knopf-ton text-text')
    const inhalt = (
      <>
        <Symbol aria-hidden className="size-5 shrink-0" />
        {mitNamen ? <span className="truncate">{b.name}</span> : <span className="sr-only">{b.name}</span>}
      </>
    )
    // Ohne zweite Ebene (Heute) führt das Symbol direkt hin, sonst zeigt es rechts die Unterpunkte.
    return ohneEbene ? (
      <Knopf key={b.id} alsKind art="leise" className={klasse}>
        <a href={markeFuer(b.id)} onClick={schliessen} aria-current={ort.bereich === b.id ? 'page' : undefined}>
          {inhalt}
        </a>
      </Knopf>
    ) : (
      <Knopf
        key={b.id}
        art="leise"
        className={klasse}
        aria-pressed={b.id === gewaehlt}
        onPointerEnter={() => vorladen(b.id)}
        onClick={() => {
          vorladen(b.id)
          setGewaehlt(b.id)
        }}
      >
        {inhalt}
      </Knopf>
    )
  }

  const name = bereiche.find((b) => b.id === gewaehlt)?.name
  return (
    <>
      <Knopf art="symbol" onClick={oeffnen} aria-label={zahl > 0 ? `Menü, ${zahl} brauchen dich` : 'Menü'} className="relative">
        <Menu aria-hidden className="size-5" />
        {zahl > 0 && <span aria-hidden className="absolute top-2 right-2 size-2 rounded-voll bg-akzent" />}
      </Knopf>
      <dialog
        ref={dialog}
        aria-label="Menü"
        className="menue-links"
        onClick={(e) => e.target === e.currentTarget && schliessen()}
      >
        <div className="flaeche-schwebend flex h-full">
          <nav aria-label="Bereiche" className={cn('flex shrink-0 flex-col gap-1 p-2', mitNamen ? 'w-44' : 'w-16')}>
            {bereiche.map(eintrag)}
            <Knopf
              art="leise"
              groesse="klein"
              aria-pressed={mitNamen}
              onClick={namenUmschalten}
              className={cn('mt-auto w-full', !mitNamen && 'px-0')}
              title="Namen der Bereiche zeigen"
            >
              <Tags aria-hidden className="size-4 shrink-0" />
              {mitNamen ? 'Namen aus' : <span className="sr-only">Namen zeigen</span>}
            </Knopf>
          </nav>
          <div className="min-w-0 flex-1 overflow-y-auto border-l border-linie p-2">
            <h2 className="px-3 pt-2 pb-3 text-lg font-semibold">{name}</h2>
            <ZweiteEbene bereich={gewaehlt} aktiv={gewaehlt === ort.bereich ? ort.unter : null} beiWahl={schliessen} />
          </div>
        </div>
      </dialog>
    </>
  )
}
