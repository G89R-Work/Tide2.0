import { ChevronDown, CircleAlert, Send } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Auswahl } from '../../bausteine/Auswahl'
import { Eingabe, Textfeld } from '../../bausteine/Eingabe'
import { Knopf } from '../../bausteine/Knopf'
import { cn } from '../../bausteine/cn'
import { entwurfSpeichernVon, useEntwurfFehler, useKonten, useMailInhalt, useSendeFehler } from '../../geruest/daten'
import { tagKurz, uhrzeit } from '../../geruest/format'
import { sende, verwerfe } from '../../geruest/mailAktionen'
import { useMinute } from '../../geruest/useMinute'
import { spaeterZeiten } from '../../logik/mails'
import { adressenAus, adressenText, sendeFehler, tauscheSignatur } from '../../logik/schreiben'
import type { Entwurf, Konto, Mail } from '../../vertrag/postfach'
import { postfach } from '../../werte/postfach'
import { MitListe, Wahlliste } from './Wahlliste'

// Schreibfeld für einen Entwurf (neue Mail, Antwort unter der Mail, Weiterleitung) wie in der Vorlage:
// Von, An, Cc, Betreff, Text; darunter Senden (sofort oder später), Wichtig, Verwerfen.
// Jede Änderung speichert sich nach einer Tipp-Pause, spätestens beim Verlassen der Seite: so übersteht der Entwurf das Neuladen.
export function Schreiben({ m }: { m: Mail }) {
  const { inhalt, fehler } = useMailInhalt(m.id)
  const { konten, fehler: kontenFehler } = useKonten()
  if (fehler ?? kontenFehler) return <p className="text-sm text-warnung">{fehler ?? kontenFehler}</p>
  if (!inhalt || !konten) return null
  const start: Entwurf = { konto: m.konto, an: inhalt.an, cc: inhalt.cc, betreff: m.betreff, text: inhalt.text, wichtig: m.wichtig, ...(m.antwortAuf ? { antwortAuf: m.antwortAuf } : {}) }
  return <Formular key={m.id} m={m} start={start} konten={konten} />
}

function Zeile({ name, fuer, children }: { name: string; fuer: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={fuer} className="w-16 shrink-0 text-sm text-text-gedaempft">
        {name}
      </label>
      {children}
    </div>
  )
}

function Formular({ m, start, konten }: { m: Mail; start: Entwurf; konten: readonly Konto[] }) {
  const [e, setE] = useState(start)
  // Die Adressfelder behalten den getippten Text; gespeichert werden die Adressen daraus.
  const [an, setAn] = useState(adressenText(start.an))
  const [cc, setCc] = useState(adressenText(start.cc))
  const [mitCc, setMitCc] = useState(start.cc.length > 0)
  const [versucht, setVersucht] = useState(false)
  const speicherFehler = useEntwurfFehler()
  const sendeFehlerText = useSendeFehler()
  const jetzt = useMinute()
  const speichern = useDebouncedCallback((x: Entwurf) => entwurfSpeichernVon(m.id, x), postfach.entwurfSpeichernMs)

  // Beim Verlassen der Seite und beim Schließen des Felds sofort speichern, was noch wartet.
  useEffect(() => {
    const jetztSpeichern = () => void speichern.flush()
    addEventListener('pagehide', jetztSpeichern)
    return () => {
      removeEventListener('pagehide', jetztSpeichern)
      jetztSpeichern()
    }
  }, [speichern])

  const aendere = (x: Partial<Entwurf>) => {
    const neu = { ...e, ...x }
    setE(neu)
    speichern(neu)
  }
  const signatur = (adresse: string) => konten.find((k) => k.adresse === adresse)?.signatur ?? ''
  const fehler = sendeFehler(e)

  const senden = async (am: Date | null, name?: string) => {
    setVersucht(true)
    if (fehler) return
    await speichern.flush()
    await sende(m, am, name)
  }

  const id = (feld: string) => `${m.id}-${feld}`
  return (
    <form
      aria-label={e.antwortAuf ? 'Antwort' : 'Entwurf'}
      className="flex flex-col gap-2"
      onSubmit={(x) => {
        x.preventDefault()
        void senden(null)
      }}
    >
      <Zeile name="Von" fuer={id('von')}>
        <Auswahl id={id('von')} value={e.konto} onChange={(x) => aendere({ konto: x.target.value, text: tauscheSignatur(e.text, signatur(e.konto), signatur(x.target.value)) })} className="h-9 flex-1">
          {konten.map((k) => (
            <option key={k.adresse} value={k.adresse}>
              {k.name} · {k.adresse}
            </option>
          ))}
        </Auswahl>
      </Zeile>
      <Zeile name="An" fuer={id('an')}>
        <Eingabe
          id={id('an')}
          type="text"
          inputMode="email"
          autoComplete="email"
          autoFocus={start.an.length === 0}
          value={an}
          onChange={(x) => {
            setAn(x.target.value)
            aendere({ an: adressenAus(x.target.value) })
          }}
          className="h-9 flex-1"
        />
        <Knopf art="leise" groesse="klein" aria-expanded={mitCc} onClick={() => setMitCc(!mitCc)}>
          Cc
        </Knopf>
      </Zeile>
      {mitCc && (
        <Zeile name="Cc" fuer={id('cc')}>
          <Eingabe
            id={id('cc')}
            type="text"
            inputMode="email"
            value={cc}
            onChange={(x) => {
              setCc(x.target.value)
              aendere({ cc: adressenAus(x.target.value) })
            }}
            className="h-9 flex-1"
          />
        </Zeile>
      )}
      <Zeile name="Betreff" fuer={id('betreff')}>
        <Eingabe id={id('betreff')} value={e.betreff} onChange={(x) => aendere({ betreff: x.target.value })} className="h-9 flex-1" />
      </Zeile>
      <Textfeld aria-label="Text" rows={10} autoFocus={start.an.length > 0} value={e.text} onChange={(x) => aendere({ text: x.target.value })} className="mt-1" />
      {versucht && fehler && <p className="text-sm text-warnung">{fehler}</p>}
      {(speicherFehler ?? sendeFehlerText) && <p className="text-sm text-warnung">{speicherFehler ?? sendeFehlerText}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex">
          <Knopf type="submit" art="haupt" groesse="klein" className="rounded-r-none">
            <Send aria-hidden className="size-4" /> Senden
          </Knopf>
          <MitListe name="Später senden" Symbol={ChevronDown} nurSymbol haupt className="rounded-l-none border-l border-auf-akzent/30">
            <Wahlliste
              titel="Später senden"
              punkte={spaeterZeiten(jetzt).map((z) => ({
                id: z.name,
                name: (
                  <>
                    {z.name}
                    <span className="ml-auto text-text-gedaempft tabular-nums">
                      {tagKurz(z.zeit)} {uhrzeit(z.zeit)}
                    </span>
                  </>
                ),
                tun: () => void senden(z.zeit, z.name),
              }))}
            />
          </MitListe>
        </div>
        <Knopf groesse="klein" aria-pressed={e.wichtig} className={cn(e.wichtig && 'border-warnung text-warnung')} onClick={() => aendere({ wichtig: !e.wichtig })}>
          <CircleAlert aria-hidden className="size-4" /> Wichtig
        </Knopf>
        <Knopf
          art="leise"
          groesse="klein"
          className="ml-auto"
          onClick={() => {
            speichern.cancel()
            void verwerfe(m)
          }}
        >
          Verwerfen
        </Knopf>
      </div>
    </form>
  )
}
