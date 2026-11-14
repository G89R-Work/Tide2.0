import { X } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Auswahl } from '../../bausteine/Auswahl'
import { cn } from '../../bausteine/cn'
import { Eingabe, Textfeld } from '../../bausteine/Eingabe'
import { Knopf } from '../../bausteine/Knopf'
import { Schalter } from '../../bausteine/Schalter'
import {
  aendereAbwesenheitMitSchritt,
  aendereBlockiertMitSchritt,
  aendereKategorienMitSchritt,
  signaturMitSchritt,
  useAbwesenheit,
  useBlockiert,
  useKategorien,
  useKonten,
} from '../../geruest/daten'
import { blockiertSchema, type Abwesenheit, type Konto } from '../../vertrag/postfach'
import { ordnerFarben } from '../../werte/ordner'
import { Farbwahl } from '../../geruest/Farbwahl'

// Postfach-Einstellungen wie in der Vorlage: Kategorien, Signaturen, Abwesenheit, Blockiert. Jede Änderung lässt sich zurücknehmen.
export default function Einstellungen() {
  return (
    <div className="inhalt-frei flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      <Kategorien />
      <Signaturen />
      <AbwesenheitTeil />
      <Blockiert />
    </div>
  )
}

function Teil({ titel, fehler, children }: { titel: string; fehler?: string | undefined; children: ReactNode }) {
  return (
    <section aria-label={titel} className="flaeche-kachel flex shrink-0 flex-col gap-3 p-5">
      <h2 className="text-lg font-semibold">{titel}</h2>
      {fehler && <p className="text-sm text-warnung">{fehler}</p>}
      {children}
    </section>
  )
}

const ohneNeuladen = (tun: () => void) => (e: FormEvent) => {
  e.preventDefault()
  tun()
}

function Kategorien() {
  const { kategorien, fehler } = useKategorien()
  const [neu, setNeu] = useState('')
  const liste = kategorien ?? []
  const doppelt = liste.some((k) => k.name.toLowerCase() === neu.trim().toLowerCase())
  const anlegen = async () => {
    const name = neu.trim()
    if (await aendereKategorienMitSchritt(liste, [...liste, { name, farbe: 'glut' }], `Kategorie „${name}“ angelegt`)) setNeu('')
  }
  return (
    <Teil titel="Kategorien" fehler={fehler}>
      <ul className="flex flex-col gap-2">
        {liste.map((k) => (
          <li key={k.name} className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate">
              <span className={cn('schild schild-gefuellt', ordnerFarben[k.farbe].klasse)}>{k.name}</span>
            </span>
            <Farbwahl
              aria-label={`Farbe von ${k.name}`}
              wert={k.farbe}
              aendern={(farbe) => void aendereKategorienMitSchritt(liste, liste.map((x) => (x.name === k.name ? { ...x, farbe } : x)), `Kategorie „${k.name}“ in ${ordnerFarben[farbe].name}`)}
            />
            <Knopf art="symbol" aria-label={`${k.name} löschen`} title="Löschen" onClick={() => void aendereKategorienMitSchritt(liste, liste.filter((x) => x.name !== k.name), `Kategorie „${k.name}“ gelöscht`)}>
              <X aria-hidden className="size-4" />
            </Knopf>
          </li>
        ))}
      </ul>
      <form className="flex gap-2" onSubmit={ohneNeuladen(() => void anlegen())}>
        <Eingabe aria-label="Neue Kategorie" placeholder="Neue Kategorie" value={neu} onChange={(e) => setNeu(e.target.value)} className="flex-1" />
        <Knopf type="submit" disabled={!neu.trim() || doppelt}>
          Anlegen
        </Knopf>
      </form>
    </Teil>
  )
}

function Signaturen() {
  const { konten, fehler } = useKonten()
  return (
    <Teil titel="Signaturen" fehler={fehler}>
      {konten?.map((k) => <Signatur key={`${k.adresse}:${k.signatur}`} k={k} />)}
    </Teil>
  )
}

/** Gespeichert wird beim Verlassen des Feldes, wenn sich etwas geändert hat. */
function Signatur({ k }: { k: Konto }) {
  const [text, setText] = useState(k.signatur)
  return (
    <label className="flex flex-col gap-1">
      <span className="beschriftung">
        {k.name} · {k.adresse}
      </span>
      <Textfeld rows={3} value={text} onChange={(e) => setText(e.target.value)} onBlur={() => text !== k.signatur && void signaturMitSchritt(k, text, `Signatur von ${k.name} geändert`)} />
    </label>
  )
}

function AbwesenheitTeil() {
  const { abwesenheit, fehler } = useAbwesenheit()
  return <Teil titel="Abwesenheit" fehler={fehler}>{abwesenheit && <AbwesenheitForm key={JSON.stringify(abwesenheit)} alt={abwesenheit} />}</Teil>
}

function AbwesenheitForm({ alt }: { alt: Abwesenheit }) {
  const { konten } = useKonten()
  const [a, setA] = useState(alt)
  const setze = (x: Partial<Abwesenheit>) => setA((v) => ({ ...v, ...x }))
  /** Leeres Feld = Wert fehlt (kein Ende, alle Konten). */
  const ohne = (k: 'bis' | 'konto', wert: string): Partial<Abwesenheit> => (wert ? { [k]: wert } : {})
  const speichern = () => void aendereAbwesenheitMitSchritt(alt, a, `Abwesenheitsnotiz ${a.an ? 'an' : 'aus'}`)
  return (
    <form className="flex flex-col gap-3" onSubmit={ohneNeuladen(speichern)}>
      <label className="flex items-center gap-3 text-sm">
        <Schalter checked={a.an} onChange={(e) => setze({ an: e.target.checked })} />
        Abwesenheitsnotiz senden
      </label>
      <div className="flex flex-wrap gap-2">
        <label className="flex flex-col gap-1">
          <span className="beschriftung">Bis</span>
          <Eingabe type="date" value={a.bis ?? ''} onChange={(e) => setA(({ bis: _b, ...v }) => ({ ...v, ...ohne('bis', e.target.value) }))} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="beschriftung">Konto</span>
          <Auswahl value={a.konto ?? ''} onChange={(e) => setA(({ konto: _k, ...v }) => ({ ...v, ...ohne('konto', e.target.value) }))}>
            <option value="">Alle Konten</option>
            {konten?.map((k) => (
              <option key={k.adresse} value={k.adresse}>
                {k.name}
              </option>
            ))}
          </Auswahl>
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="beschriftung">Text</span>
        <Textfeld rows={4} value={a.text} onChange={(e) => setze({ text: e.target.value })} />
      </label>
      <Knopf art="haupt" type="submit" className="self-start" disabled={JSON.stringify(a) === JSON.stringify(alt)}>
        Speichern
      </Knopf>
    </form>
  )
}

function Blockiert() {
  const { blockiert, fehler } = useBlockiert()
  const [neu, setNeu] = useState('')
  const liste = blockiert ?? []
  const adresse = blockiertSchema.element.safeParse(neu.trim().toLowerCase())
  const blockieren = async () => {
    if (adresse.success && (await aendereBlockiertMitSchritt(liste, [...liste, adresse.data], `${adresse.data} blockiert`))) setNeu('')
  }
  return (
    <Teil titel="Blockiert" fehler={fehler}>
      {liste.length === 0 && <p className="text-sm text-text-gedaempft">Niemand blockiert</p>}
      <ul className="flex flex-col gap-2">
        {liste.map((x) => (
          <li key={x} className="flex items-center gap-2 text-sm">
            <span className="min-w-0 flex-1 truncate">{x}</span>
            <Knopf groesse="klein" onClick={() => void aendereBlockiertMitSchritt(liste, liste.filter((y) => y !== x), `${x} freigegeben`)}>
              Freigeben
            </Knopf>
          </li>
        ))}
      </ul>
      <form className="flex gap-2" onSubmit={ohneNeuladen(() => void blockieren())}>
        <Eingabe type="email" aria-label="Adresse blockieren" placeholder="name@beispiel.de" value={neu} onChange={(e) => setNeu(e.target.value)} className="flex-1" />
        <Knopf type="submit" disabled={!adresse.success || liste.includes(adresse.data)}>
          Blockieren
        </Knopf>
      </form>
    </Teil>
  )
}
