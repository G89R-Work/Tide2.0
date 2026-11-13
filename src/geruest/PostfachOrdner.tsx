import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { attachInstruction, extractInstruction, type Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item'
import { ChevronDown, ChevronRight, Eye, Folder, ListFilter, Plus, Settings } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Aufklapp, AufklappInhalt, AufklappKnopf } from '../bausteine/Aufklapp'
import { Eingabe } from '../bausteine/Eingabe'
import { Knopf } from '../bausteine/Knopf'
import { Menue, MenueAusloeser, MenueInhalt, MenuePunkt, MenueTitel, MenueTrenner, MenueUnter, MenueUnterInhalt, MenueUnterPunkt } from '../bausteine/Menue'
import { cn } from '../bausteine/cn'
import { aktionVon } from '../logik/aktionen'
import { kannHinein, mailsText } from '../logik/mails'
import { markeFuer } from '../logik/ebenen'
import { anheften, einordnen, loesche, nachkommen, neuerOrdner, ordnerListe, stand, verschiebeNach, type Lage, type OrdnerZeile } from '../logik/ordner'
import type { Ordner, OrdnerFarbe, OrdnerStand } from '../vertrag/postfach'
import { leiste } from '../werte/leiste'
import { ordnerFarben } from '../werte/ordner'
import { aktionSymbole, titelVon } from './aktionSymbole'
import { fuehreAus } from './befehle'
import { aendereMailsMitSchritt, aendereOrdnerMitSchritt, useOrdner, useOrdnerFehler } from './daten'
import { EbenenZeile } from './EbenenZeile'
import { ebenenSymbol } from './ebenenSymbole'
import { gezogeneMails } from './mailZiehen'
import { klappe, useOrdnerZu } from './ordnerZu'

const neueMail = aktionVon('neue-mail')!
const NeuSymbol = aktionSymbole['neue-mail']

/** Hitbox des Bausteins → Lage für `einordnen`. */
const lageVon: Record<Instruction['operation'], Lage> = { 'reorder-before': 'davor', 'reorder-after': 'danach', combine: 'hinein' }

/** Was gerade als Feld bearbeitet wird: ein Name oder ein neuer Ordner (wahlweise in `eltern`, wahlweise intelligent). */
type Bearbeiten = { art: 'name'; id: string } | { art: 'neu'; eltern?: string; intelligent?: boolean }

const neueId = () => `ordner-${crypto.randomUUID().slice(0, 8)}`

// Ordnerleiste des Postfachs wie die Vorlage (bilder/postfach-ordner.jpg): Neue Mail, Systemordner,
// deine Ordner mit Unterordnern, intelligente Ordner, unten Einstellungen. Lädt erst mit dem Postfach (Ziehen und Menü sind groß).
// Rechtsklick, langer Druck oder Menütaste öffnen das Menü des Ordners; Ziehen legt davor, danach oder hinein.
// Gezogene Mails aus der Liste landen in dem Ordner, über dem sie losgelassen werden.
export default function PostfachOrdner({ aktiv, beiWahl }: { aktiv: string | null; beiWahl?: () => void }) {
  const { ordner, fehler } = useOrdner()
  const speicherFehler = useOrdnerFehler()
  const zuIds = useOrdnerZu()
  const [bearbeiten, setBearbeiten] = useState<Bearbeiten | null>(null)
  const liste = useMemo(() => ordner && ordnerListe(ordner, new Set(zuIds)), [ordner, zuIds])

  if (!ordner || !liste) return <div className="flex min-h-full flex-col">{fehler && <p className="px-3 text-sm text-warnung">{fehler}</p>}</div>

  const aendere = (neu: OrdnerStand[] | null, text: string) => speichere(ordner, neu, text)
  const name = (id: string) => ordner.find((x) => x.id === id)?.name ?? id

  const zeilen = (gruppe: OrdnerZeile[]) =>
    gruppe.map((o) =>
      bearbeiten?.art === 'name' && bearbeiten.id === o.id ? (
        <li key={o.id} style={o.tiefe ? { marginLeft: o.tiefe * leiste.einzugPx } : undefined}>
          <NamenFeld
            start={o.name}
            fertig={(n) => {
              setBearbeiten(null)
              if (n !== o.name) aendere(mit(ordner, o.id, (x) => ({ ...x, name: n })), `„${o.name}“ heißt jetzt „${n}“`)
            }}
            abbrechen={() => setBearbeiten(null)}
          />
        </li>
      ) : (
        <Zeile key={o.id} o={o} ordner={ordner} aktiv={o.id === aktiv} beiWahl={beiWahl} bearbeite={setBearbeiten} />
      ),
    )

  const neuFeld = (intelligent: boolean) =>
    bearbeiten?.art === 'neu' &&
    !!bearbeiten.intelligent === intelligent && (
      <li>
        <NamenFeld
          start=""
          mitSuche={intelligent}
          fertig={(n, suche) => {
            setBearbeiten(null)
            const eltern = bearbeiten.eltern
            const neu: OrdnerStand = intelligent
              ? { id: neueId(), name: n, art: 'intelligent', angeheftet: true, suche: suche ?? '' }
              : { id: neueId(), name: n, art: 'eigen', angeheftet: true, ...(eltern ? { eltern } : {}) }
            if (eltern) klappe(eltern, false)
            aendere(neuerOrdner(stand(ordner), neu), eltern ? `Ordner „${n}“ in „${name(eltern)}“ angelegt` : `Ordner „${n}“ angelegt`)
          }}
          abbrechen={() => setBearbeiten(null)}
        />
      </li>
    )

  const kopf = (titel: string, intelligent: boolean) => (
    <div className="flex items-center justify-between px-3 pt-3 pb-1">
      <p className="beschriftung truncate">{titel}</p>
      <Knopf art="symbol" groesse="klein" aria-label={intelligent ? 'Neuer intelligenter Ordner' : 'Neuer Ordner'} title={intelligent ? 'Neuer intelligenter Ordner' : 'Neuer Ordner'} onClick={() => setBearbeiten({ art: 'neu', intelligent })}>
        <Plus aria-hidden className="size-4" />
      </Knopf>
    </div>
  )

  return (
    <div className="flex min-h-full flex-col">
      <Knopf
        art="haupt"
        className="mb-2 w-full"
        title={titelVon(neueMail)}
        onClick={() => {
          fuehreAus(neueMail.id)
          beiWahl?.()
        }}
      >
        <NeuSymbol aria-hidden className="size-4" /> {neueMail.name}
      </Knopf>
      {fehler && <p className="px-3 text-sm text-warnung">{fehler}</p>}
      {speicherFehler && <p className="px-3 text-sm text-warnung">{speicherFehler}</p>}
      <ul className="flex flex-col gap-1">{zeilen(liste.system)}</ul>
      <hr className="mx-3 mt-2 border-linie" />
      {kopf('Deine Ordner', false)}
      <ul className="flex flex-col gap-1">
        {zeilen(liste.eigene)}
        {bearbeiten?.art === 'neu' && bearbeiten.eltern === undefined && neuFeld(false)}
      </ul>
      {kopf('Intelligente Ordner', true)}
      <ul className="flex flex-col gap-1">
        {zeilen(liste.intelligent)}
        {neuFeld(true)}
      </ul>
      {bearbeiten?.art === 'neu' && bearbeiten.eltern !== undefined && (
        <>
          <p className="beschriftung px-3 pt-3 pb-1">Unterordner in „{name(bearbeiten.eltern)}“</p>
          <ul>{neuFeld(false)}</ul>
        </>
      )}
      <div className="mt-auto flex flex-col gap-2 pt-3">
        {liste.versteckt.length > 0 && (
          <Aufklapp>
            <AufklappKnopf asChild>
              <Knopf art="leise" className="w-full justify-start">
                <Eye aria-hidden className="size-4" /> Ordner anzeigen
                <span className="ml-auto text-xs tabular-nums">{liste.versteckt.length}</span>
              </Knopf>
            </AufklappKnopf>
            <AufklappInhalt side="top" aria-label="Ausgeblendete Ordner" className="flex flex-col gap-1 p-2">
              {liste.versteckt.map((o) => (
                <Knopf key={o.id} art="leise" className="w-full justify-start" onClick={() => aendere(anheften(stand(ordner), o.id, true), `„${o.name}“ steht wieder in der Leiste`)}>
                  {pfad(ordner, o)}
                </Knopf>
              ))}
            </AufklappInhalt>
          </Aufklapp>
        )}
        <Knopf alsKind className={cn('w-full', aktiv === 'einstellungen' && 'border-akzent')}>
          <a href={markeFuer('postfach', 'einstellungen')} aria-current={aktiv === 'einstellungen' ? 'page' : undefined} onClick={beiWahl}>
            <Settings aria-hidden className="size-4" /> Einstellungen
          </a>
        </Knopf>
      </div>
    </div>
  )
}

/** „Versicherung / Auto“ */
function pfad(ordner: readonly Ordner[], o: Ordner): string {
  const eltern = o.eltern ? ordner.find((x) => x.id === o.eltern) : undefined
  return eltern && eltern.id !== o.id ? `${pfad(ordner, eltern)} / ${o.name}` : o.name
}

/** Speichert einen neuen Stand mit Rückgängig; `null` heißt: geht nicht, nichts tun. */
function speichere(ordner: readonly Ordner[], neu: OrdnerStand[] | null, text: string) {
  if (neu) void aendereOrdnerMitSchritt(ordner, neu, text)
}

/** Ändert einen Ordner im Stand. */
const mit = (ordner: readonly Ordner[], id: string, aenderung: (x: OrdnerStand) => OrdnerStand) => stand(ordner).map((x) => (x.id === id ? aenderung(x) : x))

/** Eine Ordnerzeile: Link, Menü, Ziehen, bei Unterordnern der Knopf zum Ein- und Ausklappen. */
function Zeile({ o, ordner, aktiv, beiWahl, bearbeite }: { o: OrdnerZeile; ordner: readonly Ordner[]; aktiv: boolean; beiWahl?: () => void; bearbeite: (b: Bearbeiten) => void }) {
  const ref = useRef<HTMLLIElement>(null)
  // Gezogen wird am Link (Links sind im Browser von sich aus ziehbar), abgelegt auf der ganzen Zeile.
  const griff = useRef<HTMLAnchorElement>(null)
  const [ziel, setZiel] = useState<Lage | null>(null)
  const [zieht, setZieht] = useState(false)
  const aendere = (neu: OrdnerStand[] | null, text: string) => speichere(ordner, neu, text)

  useEffect(() => {
    const element = ref.current
    const link = griff.current
    if (!element || !link) return
    const lage = (quelle: unknown, l: Lage) => typeof quelle === 'string' && einordnen(stand(ordner), quelle, o.id, l) !== null
    return combine(
      draggable({ element: link, getInitialData: () => ({ ordner: o.id }), onDragStart: () => setZieht(true), onDrop: () => setZieht(false) }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) => {
          const mails = gezogeneMails(source.data)
          if (mails) return kannHinein(o) && mails.aus !== o.id
          return typeof source.data.ordner === 'string' && source.data.ordner !== o.id
        },
        getData: ({ input, element: el, source }) =>
          gezogeneMails(source.data) ? { ordner: o.id } : attachInstruction(
            { ordner: o.id },
            {
              input,
              element: el,
              operations: {
                'reorder-before': lage(source.data.ordner, 'davor') ? 'available' : 'not-available',
                'reorder-after': lage(source.data.ordner, 'danach') ? 'available' : 'not-available',
                combine: lage(source.data.ordner, 'hinein') ? 'available' : 'not-available',
              },
            },
          ),
        onDrag: ({ self, source }) => {
          if (gezogeneMails(source.data)) return setZiel('hinein')
          const i = extractInstruction(self.data)
          setZiel(i && !i.blocked ? lageVon[i.operation] : null)
        },
        onDragLeave: () => setZiel(null),
        onDrop: ({ self, source }) => {
          setZiel(null)
          const mails = gezogeneMails(source.data)
          if (mails) {
            const text = mails.mails.length === 1 ? `Mail liegt jetzt in „${o.name}“` : `${mailsText(mails.mails.length)} liegen jetzt in „${o.name}“`
            return void aendereMailsMitSchritt(mails.mails.map((id) => ({ id, ordner: o.id })), text)
          }
          const i = extractInstruction(self.data)
          const quelle = source.data.ordner
          if (!i || i.blocked || typeof quelle !== 'string') return
          const l = lageVon[i.operation]
          if (l === 'hinein') klappe(o.id, false)
          const gezogen = ordner.find((x) => x.id === quelle)?.name ?? quelle
          const text = l === 'hinein' ? `„${gezogen}“ liegt jetzt in „${o.name}“` : `„${gezogen}“ steht jetzt ${l === 'davor' ? 'vor' : 'nach'} „${o.name}“`
          speichere(ordner, einordnen(stand(ordner), quelle, o.id, l), text)
        },
      }),
    )
  }, [ordner, o])

  const eigen = o.art === 'eigen'
  const Symbol = ebenenSymbol('postfach', o.id) ?? (o.art === 'intelligent' ? ListFilter : Folder)
  // Mögliche neue Eltern: alle eigenen Ordner außer diesem, seinen Unterordnern und dem jetzigen.
  const ausgeschlossen = new Set([o.id, ...nachkommen(ordner, o.id), ...(o.eltern ? [o.eltern] : [])])
  const ziele = ordner.filter((x) => x.art === 'eigen' && !ausgeschlossen.has(x.id))
  const Pfeil = o.zu ? ChevronRight : ChevronDown

  return (
    <Menue>
      <MenueAusloeser asChild>
        <EbenenZeile
          ref={ref}
          linkRef={griff}
          data-ziel={ziel ?? undefined}
          data-zieht={zieht || undefined}
          className="ordner-ziel"
          href={markeFuer('postfach', o.id)}
          name={o.name}
          aktiv={aktiv}
          Symbol={Symbol}
          symbolKlasse={o.farbe && ordnerFarben[o.farbe].klasse}
          zahl={o.zahl}
          wichtig={o.wichtig}
          tiefe={o.tiefe}
          onClick={beiWahl}
          hinten={
            o.kinder ? (
              <Knopf art="symbol" groesse="klein" aria-label={o.zu ? `${o.name} aufklappen` : `${o.name} einklappen`} aria-expanded={!o.zu} onClick={() => klappe(o.id, !o.zu)}>
                <Pfeil aria-hidden className="size-4" />
              </Knopf>
            ) : undefined
          }
        />
      </MenueAusloeser>
      <MenueInhalt>
        <MenueTitel>{pfad(ordner, o)}</MenueTitel>
        {eigen && <MenuePunkt onSelect={() => bearbeite({ art: 'neu', eltern: o.id })}>Neuer Unterordner</MenuePunkt>}
        {o.art !== 'system' && <MenuePunkt onSelect={() => bearbeite({ art: 'name', id: o.id })}>Umbenennen</MenuePunkt>}
        {eigen && (
          <MenueUnter>
            <MenueUnterPunkt>Farbe</MenueUnterPunkt>
            <MenueUnterInhalt>
              {(Object.entries(ordnerFarben) as [OrdnerFarbe, (typeof ordnerFarben)[OrdnerFarbe]][]).map(([f, w]) => (
                <MenuePunkt
                  key={f}
                  onSelect={() => aendere(mit(ordner, o.id, (x) => ({ ...x, farbe: f })), `„${o.name}“ ist jetzt ${w.name}`)}
                >
                  <Folder aria-hidden className={cn('size-4', w.klasse)} /> {w.name}
                  {o.farbe === f && <span className="ml-auto">✓</span>}
                </MenuePunkt>
              ))}
              {o.farbe && (
                <MenuePunkt
                  onSelect={() => aendere(mit(ordner, o.id, ({ farbe: _f, ...x }) => x), `„${o.name}“ ohne Farbe`)}
                >
                  Ohne Farbe
                </MenuePunkt>
              )}
            </MenueUnterInhalt>
          </MenueUnter>
        )}
        {eigen && (
          <MenueUnter>
            <MenueUnterPunkt>Verschieben nach</MenueUnterPunkt>
            <MenueUnterInhalt>
              {o.eltern && <MenuePunkt onSelect={() => aendere(verschiebeNach(stand(ordner), o.id, null), `„${o.name}“ liegt jetzt ganz oben`)}>Ganz oben</MenuePunkt>}
              {ziele.map((z) => (
                <MenuePunkt key={z.id} onSelect={() => aendere(verschiebeNach(stand(ordner), o.id, z.id), `„${o.name}“ liegt jetzt in „${z.name}“`)}>
                  {pfad(ordner, z)}
                </MenuePunkt>
              ))}
            </MenueUnterInhalt>
          </MenueUnter>
        )}
        <MenuePunkt onSelect={() => aendere(anheften(stand(ordner), o.id, false), `„${o.name}“ ausgeblendet`)}>Ausblenden</MenuePunkt>
        {o.art !== 'system' && (
          <>
            <MenueTrenner />
            <MenuePunkt gefahr onSelect={() => aendere(loesche(stand(ordner), o.id), `Ordner „${o.name}“ gelöscht`)}>
              Löschen
            </MenuePunkt>
          </>
        )}
      </MenueInhalt>
    </Menue>
  )
}

/** Feld für einen Namen (und bei intelligenten Ordnern die Suche): Eingabe speichert, Esc oder Klick daneben bricht ab. */
function NamenFeld({ start, mitSuche = false, fertig, abbrechen }: { start: string; mitSuche?: boolean; fertig: (name: string, suche?: string) => void; abbrechen: () => void }) {
  const [text, setText] = useState(start)
  const [suche, setSuche] = useState('')
  const senden = (e: FormEvent) => {
    e.preventDefault()
    const n = text.trim()
    if (!n || (mitSuche && !suche.trim())) return
    fertig(n, mitSuche ? suche.trim() : undefined)
  }
  return (
    <form
      onSubmit={senden}
      onKeyDown={(e) => e.key === 'Escape' && abbrechen()}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && abbrechen()}
      className="flex flex-col gap-1 px-1"
    >
      <Eingabe autoFocus aria-label="Name" placeholder="Name" value={text} onChange={(e) => setText(e.target.value)} className="h-9" />
      {mitSuche && <Eingabe aria-label="Suche" placeholder="Suche" value={suche} onChange={(e) => setSuche(e.target.value)} className="h-9" />}
      {mitSuche && <button type="submit" hidden />}
    </form>
  )
}
