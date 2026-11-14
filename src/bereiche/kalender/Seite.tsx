import { useDrag, useWheel } from '@use-gesture/react'
import { addDays, addMonths, addWeeks, isSameDay, startOfMonth } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { lazy, Suspense, useMemo, useState, type FormEvent } from 'react'
import { Eingabe } from '../../bausteine/Eingabe'
import { Knopf } from '../../bausteine/Knopf'
import { Menue, MenueAusloeser, MenueInhalt, MenuePunkt } from '../../bausteine/Menue'
import { cn } from '../../bausteine/cn'
import { eintragMitSchritt, useEintragFehler, useFeiertage, useTermine } from '../../geruest/daten'
import { useEinstellung } from '../../geruest/einstellungen'
import { monatName, tagKurz, tagLang, uhrzeit } from '../../geruest/format'
import { AktionKnopf } from '../../geruest/AktionKnopf'
import { fuehreAus } from '../../geruest/befehle'
import { useSprungmarke } from '../../geruest/useSprungmarke'
import { ortAusMarke } from '../../logik/ebenen'
import { RueckgaengigKnoepfe } from '../../geruest/RueckgaengigKnoepfe'
import { Seitenkopf } from '../../geruest/Seitenkopf'
import { useMinute } from '../../geruest/useMinute'
import { einstellung } from '../../logik/einstellungen'
import { monatsRaster, wochenTage } from '../../logik/heute'
import { kalenderwoche, termineAm, wischZiel } from '../../logik/kalender'
import { tagSchluessel } from '../../logik/zeit'
import type { Eintrag } from '../../vertrag/eintrag'
import { WISCH_GRENZE } from '../../werte/bewegung'

const wochenbeginn = einstellung('wochenbeginn')
const kwZeigen = einstellung('kalenderwoche')
const bundesland = einstellung('bundesland')

// Die Woche lädt FullCalendar erst, wenn sie aufgeht.
const Woche = lazy(() => import('./Woche'))

/** So viele Termine stehen als Etikett in einem Tag, der Rest als „+n“. */
const ETIKETTEN = 2

// Kalender (docs/konzept/12-kalender.md): links breit der Monat mit sechs Wochen und Kalenderwoche oder die Woche, rechts schmal der gewählte Tag.
// Wechsel per Knopf oder Wischen nach links und rechts; blättern per ‹ ›, Wischen oder Scrollen nach oben und unten (Monat oder Woche).
// Rechtsklick oder langer Druck auf einen Tag legt einen Termin an.
export default function Seite() {
  const jetzt = useMinute()
  const beginn = useEinstellung(wochenbeginn)
  const ansicht = ortAusMarke(useSprungmarke()).unter === 'woche' ? 'woche' : 'monat'
  const [monat, setMonat] = useState(() => startOfMonth(jetzt))
  const [gewaehlt, setGewaehlt] = useState(jetzt)
  const [neu, setNeu] = useState(false)
  const raster = useMemo(() => monatsRaster(monat, beginn), [monat, beginn])
  const erster = raster[0]?.[0] ?? monat
  const letzter = addDays(raster[5]?.[6] ?? monat, 1)
  const { liste: termine, fehler } = useTermine(erster, letzter)
  const kwGewaehlt = kalenderwoche(raster.find((z) => z.some((t) => isSameDay(t, gewaehlt))) ?? raster[0] ?? [])

  const zuHeute = () => {
    setMonat(startOfMonth(jetzt))
    setGewaehlt(jetzt)
  }
  const waehle = (t: Date, neuerTermin = false) => {
    setGewaehlt(t)
    setNeu(neuerTermin)
    if (t.getMonth() !== monat.getMonth()) setMonat(startOfMonth(t))
  }
  const blaettern = (n: number) => (ansicht === 'monat' ? setMonat((m) => addMonths(m, n)) : waehle(addWeeks(gewaehlt, n)))
  const wischen = useWischen(blaettern)
  const einheit = ansicht === 'monat' ? 'Monat' : 'Woche'

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Seitenkopf titel={`${monatName(monat)} ${monat.getFullYear()}, KW ${kwGewaehlt}`}>
        <RueckgaengigKnoepfe bereich="kalender" />
        <AktionKnopf id="kalender-ansicht" groesse="klein" />
        <Knopf art="symbol" aria-label={`${einheit} zurück`} onClick={() => blaettern(-1)}>
          <ChevronLeft aria-hidden className="size-4" />
        </Knopf>
        <Knopf groesse="klein" onClick={zuHeute}>
          Heute
        </Knopf>
        <Knopf art="symbol" aria-label={`${einheit} vor`} onClick={() => blaettern(1)}>
          <ChevronRight aria-hidden className="size-4" />
        </Knopf>
      </Seitenkopf>
      {fehler && <p className="text-sm text-warnung">{fehler}</p>}
      <div className="inhalt-frei flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto md:flex-row md:overflow-hidden">
        {ansicht === 'monat' ? (
          <Monat raster={raster} monat={monat} jetzt={jetzt} gewaehlt={gewaehlt} termine={termine ?? []} waehle={waehle} wischen={wischen} />
        ) : (
          <section {...wischen()} aria-label="Woche" className="flaeche-kachel flex h-96 min-h-0 shrink-0 touch-none flex-col p-3 select-none md:h-auto md:flex-1 md:shrink">
            <Suspense>
              <Woche tage={wochenTage(gewaehlt, beginn, 0)} gewaehlt={gewaehlt} termine={termine ?? []} waehle={waehle} />
            </Suspense>
          </section>
        )}
        <Tag key={tagSchluessel(gewaehlt)} tag={gewaehlt} termine={termine ?? []} neu={neu} setNeu={setNeu} />
      </div>
    </div>
  )
}

/** Wischen (nur Finger) und Mausrad auf Monat oder Woche: waagrecht wechselt die Ansicht, senkrecht blättert.
 *  Ein Finger, der auf einem Termin beginnt, gehört dem Ziehen; Touch-Ereignisse behalten das Ziel, auf dem sie begannen. */
function useWischen(blaettern: (n: number) => void) {
  const ziehen = useDrag(
    ({ last, movement, swipe, event }) => {
      if (!last || !('touches' in event) || (event.target instanceof Element && event.target.closest('[data-termin]'))) return
      const el = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
      const ziel = wischZiel(movement, swipe, [el?.clientWidth ?? 1, el?.clientHeight ?? 1], WISCH_GRENZE)
      if (ziel === 'ansicht') fuehreAus('kalender-ansicht')
      else if (ziel) blaettern(ziel)
    },
    { filterTaps: true, pointer: { touch: true } },
  )
  const scrollen = useWheel(({ last, direction: [, dy] }) => last && dy !== 0 && blaettern(Math.sign(dy)))
  return () => ({ ...ziehen(), ...scrollen() })
}

type MonatProps = {
  raster: Date[][]
  monat: Date
  jetzt: Date
  gewaehlt: Date
  termine: readonly Eintrag[]
  waehle: (t: Date, neuerTermin?: boolean) => void
  wischen: ReturnType<typeof useWischen>
}

/** Sechs Wochenzeilen, links je die Kalenderwoche; je Tag Feiertag und Termine als Etiketten. */
function Monat({ raster, monat, jetzt, gewaehlt, termine, waehle, wischen }: MonatProps) {
  const kw = useEinstellung(kwZeigen)
  const land = useEinstellung(bundesland)
  const feiertag = useFeiertage(monat.getFullYear(), land)
  const heute = tagSchluessel(jetzt)
  const gewaehltS = tagSchluessel(gewaehlt)
  return (
    <section aria-label="Monat" className="flaeche-kachel flex min-h-0 shrink-0 flex-col p-3 md:flex-1 md:shrink">
      <div className={cn('grid gap-1 pb-1 text-center text-xs text-text-blass', kw ? 'grid-cols-8' : 'grid-cols-7')}>
        {kw && <span>KW</span>}
        {raster[0]?.map((t) => <span key={t.getDay()}>{tagKurz(t)}</span>)}
      </div>
      <div {...wischen()} role="grid" aria-label={`${monatName(monat)} ${monat.getFullYear()}`} className="flex min-h-0 flex-1 touch-none flex-col gap-1 select-none">
        {raster.map((zeile) => (
          <div key={tagSchluessel(zeile[0] ?? monat)} role="row" className={cn('grid min-h-16 flex-1 gap-1', kw ? 'grid-cols-8' : 'grid-cols-7')}>
            {kw && (
              <span role="rowheader" className="self-center text-center text-xs text-text-blass tabular-nums">
                {kalenderwoche(zeile)}
              </span>
            )}
            {zeile.map((t) => {
              const s = tagSchluessel(t)
              const name = feiertag(t)
              const am = termineAm(termine, t)
              return (
                <Menue key={s}>
                  <MenueAusloeser asChild>
                    <button
                      type="button"
                      role="gridcell"
                      aria-label={name ? `${tagLang(t)}, ${name}` : tagLang(t)}
                      aria-current={s === heute ? 'date' : undefined}
                      aria-selected={s === gewaehltS}
                      onClick={() => waehle(t)}
                      className={cn(
                        'drueck flex min-w-0 cursor-pointer flex-col items-stretch gap-0.5 overflow-hidden rounded-knopf p-1 text-left outline-none hover:bg-knopf-ton focus-visible:ring-2 focus-visible:ring-akzent',
                        t.getMonth() !== monat.getMonth() && 'opacity-50',
                        s === gewaehltS && 'ring-1 ring-akzent ring-inset',
                      )}
                    >
                      <span className={cn('shrink-0 self-start rounded-voll px-1.5 text-sm tabular-nums', s === heute && 'akzent-verlauf font-semibold text-auf-akzent', name && s !== heute && 'text-akzent')}>
                        {t.getDate()}
                      </span>
                      {name && <span className="shrink-0 truncate text-xs text-akzent">{name}</span>}
                      {am.slice(0, ETIKETTEN).map((e) => (
                        <span key={e.id} className={cn('shrink-0 truncate rounded-knopf px-1 text-xs', e.art === 'schicht' ? 'bg-knopf-ton text-text-gedaempft' : 'bg-akzent/15 text-text')}>
                          {e.titel}
                        </span>
                      ))}
                      {am.length > ETIKETTEN && <span className="shrink-0 px-1 text-xs text-text-gedaempft">+{am.length - ETIKETTEN}</span>}
                    </button>
                  </MenueAusloeser>
                  <MenueInhalt>
                    <MenuePunkt onSelect={() => waehle(t, true)}>Neuer Termin</MenuePunkt>
                  </MenueInhalt>
                </Menue>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

const artName: Partial<Record<Eintrag['art'], string>> = { termin: 'Termin', schicht: 'Schicht' }

/** Der gewählte Tag als Liste: Uhrzeit, Titel, Art; löschen mit Rückgängig. Oben „Neuer Termin“. */
function Tag({ tag, termine, neu, setNeu }: { tag: Date; termine: readonly Eintrag[]; neu: boolean; setNeu: (n: boolean) => void }) {
  const am = termineAm(termine, tag)
  const fehler = useEintragFehler()
  return (
    <section aria-label={tagLang(tag)} className="flaeche-kachel flex shrink-0 flex-col gap-3 p-5 md:w-80 md:overflow-y-auto">
      <header className="flex items-center gap-2">
        <h2 className="min-w-0 flex-1 text-lg font-semibold">{tagLang(tag)}</h2>
        <Knopf groesse="klein" onClick={() => setNeu(true)} disabled={neu}>
          <Plus aria-hidden className="size-4" />
          Neuer Termin
        </Knopf>
      </header>
      {fehler && <p className="text-sm text-warnung">{fehler}</p>}
      {neu && <NeuerTermin tag={tag} fertig={() => setNeu(false)} />}
      {am.length === 0 && !neu && <p className="text-sm text-text-gedaempft">Keine Termine</p>}
      <ul className="flex flex-col gap-1">
        {am.map((e) => (
          <li key={e.id} className="flex items-center gap-3 border-b border-linie py-2 text-sm last:border-b-0">
            <span className="w-24 shrink-0 text-text-gedaempft tabular-nums">
              {e.beginn && uhrzeit(e.beginn)}–{e.ende && uhrzeit(e.ende)}
            </span>
            <span className="min-w-0 flex-1 truncate">{e.titel}</span>
            <span className="shrink-0 text-xs text-text-gedaempft">{artName[e.art]}</span>
            <Knopf art="symbol" groesse="klein" aria-label={`${e.titel} löschen`} title="Löschen" onClick={() => void loesche(e)}>
              <X aria-hidden className="size-4" />
            </Knopf>
          </li>
        ))}
      </ul>
    </section>
  )
}

const loesche = (e: Eintrag) => {
  const { id, art, titel, beginn, ende } = e
  return eintragMitSchritt({ id, art, titel, ...(beginn && ende ? { beginn, ende } : {}) }, true, `„${titel}“ gelöscht`, 'kalender')
}

/** Uhrzeit „HH:MM“ an diesem Tag (Ortszeit). */
const um = (tag: Date, hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(':').map(Number)
  return new Date(tag.getFullYear(), tag.getMonth(), tag.getDate(), h, m)
}

function NeuerTermin({ tag, fertig }: { tag: Date; fertig: () => void }) {
  const [titel, setTitel] = useState('')
  const [von, setVon] = useState('09:00')
  const [bis, setBis] = useState('10:00')
  const beginn = um(tag, von)
  const ende = um(tag, bis)
  const gueltig = titel.trim() !== '' && ende > beginn
  const anlegen = async (ev: FormEvent) => {
    ev.preventDefault()
    const ok = await eintragMitSchritt(
      { id: `termin-${crypto.randomUUID().slice(0, 8)}`, art: 'termin', titel: titel.trim(), beginn: beginn.toISOString(), ende: ende.toISOString() },
      false,
      `Termin „${titel.trim()}“ angelegt`,
      'kalender',
    )
    if (ok) fertig()
  }
  return (
    <form className="flex flex-col gap-2" onSubmit={(ev) => void anlegen(ev)}>
      <Eingabe aria-label="Titel" placeholder="Titel" autoFocus value={titel} onChange={(e) => setTitel(e.target.value)} />
      <div className="flex items-center gap-2">
        <Eingabe type="time" aria-label="Von" value={von} onChange={(e) => setVon(e.target.value)} className="flex-1" />
        <span className="text-text-gedaempft">–</span>
        <Eingabe type="time" aria-label="Bis" value={bis} onChange={(e) => setBis(e.target.value)} className="flex-1" />
      </div>
      {!(ende > beginn) && <p className="text-sm text-warnung">Ende muss nach dem Beginn liegen</p>}
      <div className="flex gap-2">
        <Knopf art="haupt" type="submit" disabled={!gueltig}>
          Anlegen
        </Knopf>
        <Knopf onClick={fertig}>Abbrechen</Knopf>
      </div>
    </form>
  )
}
