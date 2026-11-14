import { Play, Plus, Workflow, X } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { QueryBuilder, type RuleGroupType } from 'react-querybuilder'
import { Auswahl } from '../../bausteine/Auswahl'
import { cn } from '../../bausteine/cn'
import { Eingabe } from '../../bausteine/Eingabe'
import { Knopf } from '../../bausteine/Knopf'
import { Schalter } from '../../bausteine/Schalter'
import { aendereRegelnMitSchritt, useKategorien, useMails, useOrdner, useRegeln } from '../../geruest/daten'
import { fuehreRegelAus } from '../../geruest/mailAktionen'
import { regelId, setzeRegelEntwurf, useRegelEntwurf } from '../../geruest/regelEntwurf'
import { echterOrdner, mailsText } from '../../logik/mails'
import { neueRegel, regelFehler, treffer } from '../../logik/regeln'
import type { Regel, RegelAktion } from '../../vertrag/postfach'
import { felder, klassen, steuerung, texte, vergleiche, verknuepfungen, zuAbfrage, zuBedingung } from './regelSteuerung'

/** So viele Treffer nennt der Probelauf mit Namen. */
const PROBE_ZEILEN = 8

// Regeln des Postfachs wie in der Vorlage: links die Liste (an/aus, jetzt ausführen), rechts der Editor mit Probelauf.
// Die Bedingung baut react-querybuilder und gibt sie als JsonLogic aus; jede Änderung lässt sich zurücknehmen.
export default function Regeln() {
  const { regeln, fehler } = useRegeln()
  const entwurf = useRegelEntwurf()
  const [gewaehlt, setGewaehlt] = useState<string | null>(null)
  const offen = entwurf ?? regeln?.find((r) => r.id === gewaehlt) ?? regeln?.[0]

  const waehle = (id: string) => {
    setzeRegelEntwurf(null)
    setGewaehlt(id)
  }
  const schalte = (r: Regel) =>
    regeln &&
    void aendereRegelnMitSchritt(
      regeln,
      regeln.map((x) => (x.id === r.id ? { ...x, an: !x.an } : x)),
      `Regel „${r.name}“ ${r.an ? 'aus' : 'an'}`,
    )

  return (
    <div className="inhalt-frei flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto md:flex-row md:overflow-hidden">
      <section aria-label="Regeln" className="flaeche-kachel flex shrink-0 flex-col md:w-72 md:overflow-y-auto">
        <header className="flex items-center gap-2 px-3 pt-3 pb-2">
          <h1 className="min-w-0 flex-1 truncate font-semibold">Regeln</h1>
          <Knopf groesse="klein" onClick={() => setzeRegelEntwurf(neueRegel(regelId()))}>
            <Plus aria-hidden className="size-4" />
            Neue Regel
          </Knopf>
        </header>
        {fehler && <p className="px-3 pb-2 text-sm text-warnung">{fehler}</p>}
        {regeln?.length === 0 && !entwurf && <p className="border-t border-linie px-3 py-4 text-sm text-text-gedaempft">Keine Regeln</p>}
        <ul className="border-t border-linie">
          {entwurf && !regeln?.some((r) => r.id === entwurf.id) && (
            <li className="mail-zeile flex h-12 items-center px-3 text-sm font-semibold" aria-selected>
              {entwurf.name || 'Neue Regel'}
            </li>
          )}
          {regeln?.map((r) => (
            <li key={r.id} aria-selected={r.id === offen?.id} className="mail-zeile flex items-center gap-2 px-3 py-1.5">
              <Schalter checked={r.an} onChange={() => schalte(r)} aria-label={`${r.name} an`} />
              <button
                type="button"
                onClick={() => waehle(r.id)}
                className={cn('min-w-0 flex-1 cursor-pointer truncate py-2 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-akzent', !r.an && 'text-text-gedaempft')}
              >
                {r.name}
              </button>
              <Knopf art="symbol" groesse="klein" aria-label={`${r.name} jetzt ausführen`} title="Jetzt ausführen" onClick={() => void fuehreRegelAus(r)}>
                <Play aria-hidden className="size-4" />
              </Knopf>
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Regel" className="flaeche-kachel flex shrink-0 flex-col p-5 md:min-h-0 md:flex-1 md:shrink md:overflow-y-auto">
        {offen ? (
          <Editor key={offen.id} regel={offen} neu={!regeln?.some((r) => r.id === offen.id)} regeln={regeln ?? []} gespeichert={setGewaehlt} />
        ) : (
          <Workflow aria-hidden className="m-auto size-10 text-text-blass" />
        )}
      </section>
    </div>
  )
}

type EditorProps = {
  regel: Regel
  neu: boolean
  regeln: readonly Regel[]
  gespeichert: (id: string | null) => void
}

/** Name, „Wenn … zutreffen“ mit Bedingungen, „Dann“ mit Aktionen; darüber der Probelauf gegen den Posteingang. */
function Editor({ regel, neu, regeln, gespeichert }: EditorProps) {
  const [name, setName] = useState(regel.name)
  const [abfrage, setAbfrage] = useState<RuleGroupType>(() => zuAbfrage(regel.bedingung))
  const [aktionen, setAktionen] = useState<RegelAktion[]>(regel.aktionen)
  const [ergebnis, setErgebnis] = useState<string>()
  const jetzt: Regel = {
    ...regel,
    name: name.trim(),
    bedingung: zuBedingung(abfrage),
    aktionen,
  }
  const fehler = regelFehler(jetzt)

  const speichern = async () => {
    const liste = neu ? [...regeln, jetzt] : regeln.map((r) => (r.id === jetzt.id ? jetzt : r))
    if (!(await aendereRegelnMitSchritt(regeln, liste, `Regel „${jetzt.name}“ ${neu ? 'angelegt' : 'gespeichert'}`))) return
    setzeRegelEntwurf(null)
    gespeichert(jetzt.id)
  }
  const loeschen = async () => {
    if (
      !(await aendereRegelnMitSchritt(
        regeln,
        regeln.filter((r) => r.id !== regel.id),
        `Regel „${regel.name}“ gelöscht`,
      ))
    )
      return
    gespeichert(null)
  }
  const verwerfen = () => {
    setzeRegelEntwurf(null)
    if (!neu) {
      setName(regel.name)
      setAbfrage(zuAbfrage(regel.bedingung))
      setAktionen(regel.aktionen)
    }
  }
  const ausfuehren = async () => {
    const n = await fuehreRegelAus(jetzt)
    setErgebnis(n ? `${mailsText(n)} geändert` : 'Keine Mail geändert')
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        void speichern()
      }}
    >
      <h2 className="text-xl font-semibold">{neu ? 'Neue Regel' : regel.name}</h2>
      <Probelauf bedingung={jetzt.bedingung} />
      <label className="flex flex-col gap-1">
        <span className="beschriftung">Name</span>
        <Eingabe value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="flex flex-col gap-2">
        <span className="beschriftung">Wenn</span>
        <QueryBuilder query={abfrage} onQueryChange={setAbfrage} fields={felder} operators={vergleiche} combinators={verknuepfungen} controlElements={steuerung} controlClassnames={klassen} translations={texte} />
      </div>
      <Dann aktionen={aktionen} setAktionen={setAktionen} />
      {fehler && <p className="text-sm text-warnung">{fehler}</p>}
      {ergebnis && <p className="text-sm text-text-gedaempft">{ergebnis}</p>}
      <div className="flex flex-wrap gap-2">
        <Knopf art="haupt" type="submit" disabled={!!fehler}>
          {neu ? 'Regel anlegen' : 'Speichern'}
        </Knopf>
        <Knopf onClick={verwerfen}>Verwerfen</Knopf>
        <Knopf onClick={() => void ausfuehren()} disabled={!!fehler}>
          <Play aria-hidden className="size-4" />
          Jetzt ausführen
        </Knopf>
        {!neu && (
          <Knopf art="leise" className="ml-auto text-warnung" onClick={() => void loeschen()}>
            Löschen
          </Knopf>
        )}
      </div>
    </form>
  )
}

/** Welche Mails im Posteingang die Regel gerade treffen würde. */
function Probelauf({ bedingung }: { bedingung: Regel['bedingung'] }) {
  const { mails } = useMails('eingang')
  const b = useDeferredValue(bedingung)
  const hier = useMemo(() => treffer({ bedingung: b }, mails ?? []), [b, mails])
  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-text-gedaempft">Probelauf: {mailsText(hier.length)} im Posteingang</summary>
      <ul className="mt-1 flex flex-col gap-0.5">
        {hier.slice(0, PROBE_ZEILEN).map((m) => (
          <li key={m.id} className="truncate">
            <b className="font-semibold">{m.von}</b> · {m.betreff}
          </li>
        ))}
        {hier.length > PROBE_ZEILEN && <li className="text-text-gedaempft">und {hier.length - PROBE_ZEILEN} weitere</li>}
      </ul>
    </details>
  )
}

const aktionNamen: Record<RegelAktion['art'], string> = {
  verschieben: 'In Ordner verschieben',
  kategorie: 'Kategorie zuweisen',
  gelesen: 'Als gelesen markieren',
  wichtig: 'Als wichtig markieren',
  anheften: 'Anheften',
  nachverfolgen: 'Nachverfolgen',
}

/** Aktion mit einem passenden Wert ab Werk. */
const aktionNeu = (art: RegelAktion['art'], kategorie: string): RegelAktion => (art === 'verschieben' ? { art, ordner: 'archiv' } : art === 'kategorie' ? { art, name: kategorie } : { art })

/** „Dann“: je Aktion eine Zeile aus Art und, wo nötig, Ordner oder Kategorie. */
function Dann({ aktionen, setAktionen }: { aktionen: RegelAktion[]; setAktionen: (a: RegelAktion[]) => void }) {
  const ordner = useOrdner().ordner?.filter(echterOrdner) ?? []
  const kategorien = useKategorien().kategorien ?? []
  const erste = kategorien[0]?.name ?? ''
  const setze = (i: number, a: RegelAktion) => setAktionen(aktionen.map((x, j) => (j === i ? a : x)))
  return (
    <div className="flex flex-col gap-2">
      <span className="beschriftung">Dann</span>
      {aktionen.map((a, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <Auswahl aria-label="Aktion" value={a.art} onChange={(e) => setze(i, aktionNeu(e.target.value as RegelAktion['art'], erste))}>
            {Object.entries(aktionNamen).map(([k, n]) => (
              <option key={k} value={k}>
                {n}
              </option>
            ))}
          </Auswahl>
          {a.art === 'verschieben' && (
            <Auswahl aria-label="Ordner" value={a.ordner} onChange={(e) => setze(i, { art: a.art, ordner: e.target.value })}>
              {ordner.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Auswahl>
          )}
          {a.art === 'kategorie' && (
            <Auswahl aria-label="Kategorie" value={a.name} onChange={(e) => setze(i, { art: a.art, name: e.target.value })}>
              {kategorien.map((k) => (
                <option key={k.name} value={k.name}>
                  {k.name}
                </option>
              ))}
            </Auswahl>
          )}
          <Knopf art="symbol" aria-label="Aktion entfernen" title="Aktion entfernen" onClick={() => setAktionen(aktionen.filter((_, j) => j !== i))}>
            <X aria-hidden className="size-4" />
          </Knopf>
        </div>
      ))}
      <Knopf groesse="klein" className="self-start" onClick={() => setAktionen([...aktionen, aktionNeu('gelesen', erste)])}>
        <Plus aria-hidden className="size-4" />
        Aktion
      </Knopf>
    </div>
  )
}
