import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { Circle, CircleCheck, Plus } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Eingabe } from '../../bausteine/Eingabe'
import { Knopf } from '../../bausteine/Knopf'
import { Menue, MenueAusloeser, MenueInhalt, MenuePunkt, MenueTitel } from '../../bausteine/Menue'
import { cn } from '../../bausteine/cn'
import { aendereEintragMitSchritt, aufgabeMitSchritt, useEintraege, useEintragFehler } from '../../geruest/daten'
import { tagKurz, tagMonat } from '../../geruest/format'
import { RueckgaengigKnoepfe } from '../../geruest/RueckgaengigKnoepfe'
import { Seitenkopf } from '../../geruest/Seitenkopf'
import { useMinute } from '../../geruest/useMinute'
import { useSchmal } from '../../geruest/useSchmal'
import { useSprungmarke } from '../../geruest/useSprungmarke'
import { ebeneVon, ortAusMarke } from '../../logik/ebenen'
import { ausEingabe, fristFuer, gruppen, gruppenIds, gruppenNamen, imUnterpunkt, type GruppeId } from '../../logik/todos'
import { ausSchluessel } from '../../logik/zeit'
import type { Eintrag, Herkunft } from '../../vertrag/eintrag'

const herkunftName: Record<Herkunft, string> = { mail: 'Mail', rueckruf: 'Rückruf', rechnung: 'Rechnung' }

/** Neue Frist mit Rückgängig; `undefined` heißt: diese Gruppe ist kein Ziel. */
function verschiebe(e: Eintrag, gruppe: GruppeId, jetzt: Date) {
  const frist = fristFuer(gruppe, jetzt)
  if (frist === undefined || frist === (e.frist ?? null)) return
  void aendereEintragMitSchritt(e, { frist }, `„${e.titel}“ → ${gruppenNamen[gruppe]}`, 'todos')
}

// To-dos (docs/konzept/13-todos.md): oben die Eingabezeile, darunter die Liste nach Fälligkeit; Ziehen zwischen den Gruppen ändert nur die Frist.
export default function Seite() {
  const jetzt = useMinute()
  const unter = ortAusMarke(useSprungmarke()).unter
  const titel = ebeneVon('todos').find((p) => p.id === unter)?.name ?? 'To-dos'
  const { liste, fehler } = useEintraege()
  const speichernFehler = useEintragFehler()
  const todos = (liste ?? []).filter((e) => imUnterpunkt(e, unter))
  const archiv = unter === 'archiv'

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Seitenkopf titel={titel}>
        <RueckgaengigKnoepfe bereich="todos" nurSymbol={useSchmal()} />
      </Seitenkopf>
      {(fehler ?? speichernFehler) && <p className="text-sm text-warnung">{fehler ?? speichernFehler}</p>}
      <div className="inhalt-frei flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {!archiv && <Eingabezeile unter={unter} jetzt={jetzt} />}
        {liste && todos.length === 0 && <p className="flaeche-kachel p-4 text-sm text-text-gedaempft">{archiv ? 'Nichts erledigt' : 'Keine To-dos'}</p>}
        {archiv ? (
          todos.length > 0 && (
            <ul aria-label="Archiv" className="flaeche-kachel flex flex-col p-2">
              {todos.map((e) => (
                <Zeile key={e.id} e={e} jetzt={jetzt} />
              ))}
            </ul>
          )
        ) : (
          todos.length > 0 && gruppen(todos, jetzt).map((g) => <Gruppe key={g.id} id={g.id} liste={g.liste} alle={todos} jetzt={jetzt} />)
        )}
      </div>
    </div>
  )
}

/** „heute“, „morgen“, „übermorgen“ im Text setzen die Frist; im Unterpunkt Arbeit landet das To-do im Raum Arbeit. */
function Eingabezeile({ unter, jetzt }: { unter: string | null; jetzt: Date }) {
  const [text, setText] = useState('')
  const neu = ausEingabe(text, jetzt)
  // Am PC gleich tippbereit (auch nach der Aktion „Neues To-do“); am Handy nicht, sonst springt die Tastatur auf.
  const sofort = !useSchmal()
  const anlegen = async (ev: FormEvent) => {
    ev.preventDefault()
    if (neu && (await aufgabeMitSchritt(neu.titel, neu.frist, 'todos', unter === 'arbeit' ? { raum: 'arbeit' } : {}))) setText('')
  }
  return (
    <form onSubmit={(ev) => void anlegen(ev)} className="flaeche-kachel flex items-center gap-2 p-2">
      <Eingabe aria-label="Neues To-do" placeholder="Neues To-do" value={text} onChange={(ev) => setText(ev.target.value)} className="min-w-0 flex-1" autoFocus={sofort} />
      {neu?.frist && <span className="shrink-0 text-xs text-akzent tabular-nums">{fristText(neu.frist)}</span>}
      <Knopf type="submit" art="symbol" aria-label="Anlegen" disabled={!neu}>
        <Plus aria-hidden className="size-4" />
      </Knopf>
    </form>
  )
}

const fristText = (frist: string) => {
  const tag = ausSchluessel(frist)
  return tag ? `${tagKurz(tag)} ${tagMonat(tag)}` : frist
}

/** Eine Gruppe ist Ablage für gezogene To-dos, wenn sie eine Frist ergibt (nicht Überfällig). */
function Gruppe({ id, liste, alle, jetzt }: { id: GruppeId; liste: readonly Eintrag[]; alle: readonly Eintrag[]; jetzt: Date }) {
  const ref = useRef<HTMLElement>(null)
  const [ziel, setZiel] = useState(false)
  const ablage = fristFuer(id, jetzt) !== undefined

  useEffect(() => {
    const element = ref.current
    if (!element || !ablage) return
    return dropTargetForElements({
      element,
      canDrop: ({ source }) => typeof source.data.todo === 'string',
      onDragEnter: () => setZiel(true),
      onDragLeave: () => setZiel(false),
      onDrop: ({ source }) => {
        setZiel(false)
        const e = alle.find((x) => x.id === source.data.todo)
        if (e) verschiebe(e, id, new Date())
      },
    })
  }, [id, ablage, alle])

  if (liste.length === 0 && !ablage) return null
  return (
    <section ref={ref} aria-label={gruppenNamen[id]} className={cn('flaeche-kachel flex flex-col p-2', ziel && 'ring-2 ring-akzent')}>
      <h2 className={cn('beschriftung px-2 pt-1 pb-1', id === 'ueberfaellig' && 'text-warnung')}>
        {gruppenNamen[id]} <span className="text-text-blass tabular-nums">{liste.length || ''}</span>
      </h2>
      {liste.length === 0 ? (
        <p className="px-2 pb-1 text-sm text-text-blass">–</p>
      ) : (
        <ul className="flex flex-col">
          {liste.map((e) => (
            <Zeile key={e.id} e={e} jetzt={jetzt} />
          ))}
        </ul>
      )}
    </section>
  )
}

/** Ein To-do: abhaken, ziehen; Rechtsklick oder langer Druck verschiebt in eine Gruppe. */
function Zeile({ e, jetzt }: { e: Eintrag; jetzt: Date }) {
  const ref = useRef<HTMLLIElement>(null)
  const [zieht, setZieht] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || e.erledigt) return
    return draggable({ element, getInitialData: () => ({ todo: e.id }), onDragStart: () => setZieht(true), onDrop: () => setZieht(false) })
  }, [e.id, e.erledigt])

  const ziele = gruppenIds.filter((g) => fristFuer(g, jetzt) !== undefined)
  return (
    <Menue>
      <MenueAusloeser asChild>
        <li ref={ref} className={cn('flex min-h-11 cursor-grab items-center gap-2 rounded-knopf px-1 hover:bg-knopf-ton', zieht && 'opacity-40')}>
          <Knopf
            art="symbol"
            groesse="klein"
            aria-label={e.erledigt ? `„${e.titel}“ wieder offen` : `„${e.titel}“ erledigt`}
            onClick={() => void aendereEintragMitSchritt(e, { erledigt: !e.erledigt }, `„${e.titel}“ ${e.erledigt ? 'wieder offen' : 'erledigt'}`, 'todos')}
          >
            {e.erledigt ? <CircleCheck aria-hidden className="size-5 text-akzent" /> : <Circle aria-hidden className="size-5" />}
          </Knopf>
          <span className={cn('min-w-0 flex-1 truncate text-sm', e.erledigt && 'text-text-gedaempft line-through')}>{e.titel}</span>
          {e.herkunft && <span className="shrink-0 text-xs text-text-blass">{herkunftName[e.herkunft]}</span>}
          {e.frist && <span className="shrink-0 text-xs text-text-gedaempft tabular-nums">{fristText(e.frist)}</span>}
        </li>
      </MenueAusloeser>
      {!e.erledigt && (
        <MenueInhalt>
          <MenueTitel>Verschieben nach</MenueTitel>
          {ziele.map((g) => (
            <MenuePunkt key={g} onSelect={() => verschiebe(e, g, jetzt)}>
              {gruppenNamen[g]}
            </MenuePunkt>
          ))}
        </MenueInhalt>
      )}
    </Menue>
  )
}
