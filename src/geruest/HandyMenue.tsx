import { Menu, Tags } from 'lucide-react'
import { useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Knopf } from '../bausteine/Knopf'
import { cn } from '../bausteine/cn'
import { PortalZiel } from '../bausteine/portalZiel'
import { bereiche, type BereichId } from '../logik/bereiche'
import { ebeneVon, markeFuer, type Ort } from '../logik/ebenen'
import { symbole, vorladen } from './seiten'
import { ZweiteEbene } from './ZweiteEbene'

// Menü am Handy: oben links der Knopf mit Punkt, darin zwei Spalten.
// Links die Bereiche als Symbole (Schalter blendet Namen ein), rechts die zweite Ebene des gewählten Bereichs.
// Natives dialog: Fokus bleibt im Menü, Zurück-Taste und Esc schließen es.
// Ob die Namen neben den Symbolen stehen, merkt sich der Browser.
const useNamen = create<{ an: boolean }>()(persist((): { an: boolean } => ({ an: false }), { name: 'tide.menue.namen' }))

export function HandyMenue({ ort, zahl }: { ort: Ort; zahl: number }) {
  // Das Dialogfenster; schwebende Karten und Menüs darin hängen sich hier ein (siehe bausteine/portalZiel.ts).
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null)
  const [gewaehlt, setGewaehlt] = useState<BereichId>(ort.bereich)
  const mitNamen = useNamen((s) => s.an)

  const oeffnen = () => {
    setGewaehlt(ort.bereich)
    dialog?.showModal()
  }
  const schliessen = () => dialog?.close()
  const namenUmschalten = () => void useNamen.setState({ an: !mitNamen })

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
        ref={setDialog}
        aria-label="Menü"
        className="menue-links"
        onClick={(e) => e.target === e.currentTarget && schliessen()}
      >
        <PortalZiel value={dialog}>
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
        </PortalZiel>
      </dialog>
    </>
  )
}
