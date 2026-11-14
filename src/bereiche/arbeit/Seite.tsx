import { addDays, addMonths, isSameDay, startOfMonth, startOfWeek } from 'date-fns'
import { ChevronLeft, ChevronRight, Settings2 } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Aufklapp, AufklappInhalt, AufklappKnopf, AufklappZu } from '../../bausteine/Aufklapp'
import { Knopf } from '../../bausteine/Knopf'
import { cn } from '../../bausteine/cn'
import { aendereRhythmusMitSchritt, useFeiertage, useRhythmus, useTermine } from '../../geruest/daten'
import { useEinstellung } from '../../geruest/einstellungen'
import { dauerText, monatName, tagKurz, tagLang, tagMonat, uhrzeit } from '../../geruest/format'
import { RueckgaengigKnoepfe } from '../../geruest/RueckgaengigKnoepfe'
import { Seitenkopf } from '../../geruest/Seitenkopf'
import { useMinute } from '../../geruest/useMinute'
import { useSchmal } from '../../geruest/useSchmal'
import { useSprungmarke } from '../../geruest/useSprungmarke'
import { arbeitszeit, hinweise } from '../../logik/arbeit'
import { ortAusMarke } from '../../logik/ebenen'
import { einstellung } from '../../logik/einstellungen'
import { monatsRaster } from '../../logik/heute'
import { mitAusnahme, vorschau, type Ausnahme, type Ausnahmeart, type Rhythmus, type VorschauTag } from '../../logik/rhythmus'
import { tagSchluessel } from '../../logik/zeit'
import { Farbpunkt } from '../../geruest/Farbwahl'

const bundesland = einstellung('bundesland')
const wochenstunden = einstellung('arbeit-wochenstunden')
const urlaubstage = einstellung('arbeit-urlaubstage')

// Der Baukasten lädt erst, wenn er aufgeht.
const Baukasten = lazy(() => import('./Baukasten'))

/** So viele Wochen ab dieser prüfen die Hinweise. */
const HINWEIS_WOCHEN = 2

const ausnahmeName: Record<Ausnahmeart, string> = { urlaub: 'Urlaub', krank: 'Krank', tausch: 'Tausch', zusatz: 'Zusatzschicht' }

// Arbeit (docs/konzept/17-arbeit.md): oben die Woche, darunter Schichtplan, Hinweise zum Plan und Arbeitszeit.
// Unterpunkte der zweiten Ebene springen zu ihrer Kachel.
export default function Seite() {
  const jetzt = useMinute()
  const { rhythmus, fehler } = useRhythmus()
  const unter = ortAusMarke(useSprungmarke()).unter
  const [baukasten, setBaukasten] = useState(false)

  useEffect(() => {
    if (unter) document.getElementById(`arbeit-${unter}`)?.scrollIntoView({ block: 'start' })
  }, [unter])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Seitenkopf titel="Arbeit">
        <RueckgaengigKnoepfe bereich="arbeit" nurSymbol={useSchmal()} />
        <Knopf groesse="klein" onClick={() => setBaukasten((b) => !b)} aria-pressed={baukasten}>
          <Settings2 aria-hidden className="size-4" />
          Rhythmus
        </Knopf>
      </Seitenkopf>
      {fehler && <p className="text-sm text-warnung">{fehler}</p>}
      {rhythmus && (
        <div className="inhalt-frei flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          <Wochenleiste tage={vorschau(rhythmus, jetzt, 1)} jetzt={jetzt} />
          {baukasten && (
            <Suspense>
              <Baukasten rhythmus={rhythmus} jetzt={jetzt} fertig={() => setBaukasten(false)} />
            </Suspense>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <Schichtplan rhythmus={rhythmus} jetzt={jetzt} />
            <div className="flex flex-col gap-3">
              <Hinweise rhythmus={rhythmus} jetzt={jetzt} />
              <Arbeitszeit rhythmus={rhythmus} jetzt={jetzt} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Schicht oder „frei“ eines Tages, mit Ausnahme. */
const schichtText = (t: VorschauTag) => [t.schicht ? t.schicht.art.name : 'frei', t.ausnahme && ausnahmeName[t.ausnahme]].filter(Boolean).join(' · ')

/** Sieben Tage dieser Woche mit Schichtart und Zeiten. */
function Wochenleiste({ tage, jetzt }: { tage: readonly VorschauTag[]; jetzt: Date }) {
  return (
    <section aria-label="Diese Woche" className="flaeche-kachel grid shrink-0 grid-cols-7 gap-1 p-2">
      {tage.map((t) => (
        <div key={tagSchluessel(t.tag)} aria-current={isSameDay(t.tag, jetzt) ? 'date' : undefined} className={cn('flex min-w-0 flex-col items-center gap-0.5 rounded-knopf p-1 text-center', isSameDay(t.tag, jetzt) && 'bg-knopf-ton')}>
          <span className="text-xs text-text-blass">
            {tagKurz(t.tag)} {t.tag.getDate()}
          </span>
          <span className="flex max-w-full items-center gap-1 text-sm">
            {t.schicht && <Farbpunkt farbe={t.schicht.art.farbe} />}
            <span className={cn('hidden truncate sm:inline', !t.schicht && 'text-text-gedaempft')}>{schichtText(t)}</span>
            <span className={cn('sm:hidden', !t.schicht && 'text-text-gedaempft')}>{t.schicht ? t.schicht.art.name.slice(0, 1) : '–'}</span>
          </span>
          {t.schicht && <span className="hidden text-xs text-text-gedaempft tabular-nums sm:block">{`${uhrzeit(t.schicht.beginn)}–${uhrzeit(t.schicht.ende)}`}</span>}
        </div>
      ))}
    </section>
  )
}

/** Monat zum Antippen: ein Tag öffnet die Ausnahmen (Urlaub, krank, Tausch, Zusatzschicht). */
function Schichtplan({ rhythmus, jetzt }: { rhythmus: Rhythmus; jetzt: Date }) {
  const [monat, setMonat] = useState(() => startOfMonth(jetzt))
  const tage = new Map(vorschau(rhythmus, monatsRaster(monat, 'montag')[0]?.[0] ?? monat, 6).map((t) => [tagSchluessel(t.tag), t]))
  return (
    <section id="arbeit-schichtplan" aria-label="Schichtplan" className="flaeche-kachel flex flex-col gap-2 p-4">
      <header className="flex items-center gap-2">
        <h2 className="min-w-0 flex-1 text-lg font-semibold">
          {monatName(monat)} {monat.getFullYear()}
        </h2>
        <Knopf art="symbol" groesse="klein" aria-label="Monat zurück" onClick={() => setMonat((m) => addMonths(m, -1))}>
          <ChevronLeft aria-hidden className="size-4" />
        </Knopf>
        <Knopf art="symbol" groesse="klein" aria-label="Monat vor" onClick={() => setMonat((m) => addMonths(m, 1))}>
          <ChevronRight aria-hidden className="size-4" />
        </Knopf>
      </header>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-blass">
        {monatsRaster(monat, 'montag')[0]?.map((t) => <span key={t.getDay()}>{tagKurz(t)}</span>)}
      </div>
      <div role="grid" aria-label={`${monatName(monat)} ${monat.getFullYear()}`} className="grid grid-cols-7 gap-1">
        {[...tage.values()].map((t) => (
          <Tag key={tagSchluessel(t.tag)} t={t} rhythmus={rhythmus} anders={t.tag.getMonth() !== monat.getMonth()} heute={isSameDay(t.tag, jetzt)} />
        ))}
      </div>
    </section>
  )
}

/** Ein Tag im Schichtplan; Antippen öffnet die Ausnahmen. Speichern sofort, mit Rückgängig. */
function Tag({ t, rhythmus, anders, heute }: { t: VorschauTag; rhythmus: Rhythmus; anders: boolean; heute: boolean }) {
  const setze = (a: Omit<Ausnahme, 'tag'> | null, was: string) => void aendereRhythmusMitSchritt(rhythmus, mitAusnahme(rhythmus, t.tag, a), `${tagMonat(t.tag)} ${was}`)
  const schicht = t.schicht
  const andere = rhythmus.arten.filter((a) => a.id !== schicht?.art.id)
  return (
    <Aufklapp>
      <AufklappKnopf
        role="gridcell"
        aria-label={`${tagLang(t.tag)}, ${schichtText(t)}`}
        aria-current={heute ? 'date' : undefined}
        className={cn(
          'drueck flex min-h-12 min-w-0 cursor-pointer flex-col items-center gap-0.5 rounded-knopf p-1 outline-none hover:bg-knopf-ton focus-visible:ring-2 focus-visible:ring-akzent',
          anders && 'opacity-50',
          t.ausnahme && 'ring-1 ring-linie-stark ring-inset',
        )}
      >
        <span className={cn('rounded-voll px-1.5 text-sm tabular-nums', heute && 'akzent-verlauf font-semibold text-auf-akzent')}>{t.tag.getDate()}</span>
        {schicht ? (
          <span className="flex max-w-full items-center gap-1 text-xs">
            <Farbpunkt farbe={schicht.art.farbe} />
            <span className="hidden text-text-gedaempft tabular-nums sm:inline">{uhrzeit(schicht.beginn)}</span>
          </span>
        ) : (
          t.ausnahme && <span className="max-w-full truncate text-xs text-text-gedaempft">{ausnahmeName[t.ausnahme]}</span>
        )}
      </AufklappKnopf>
      <AufklappInhalt breite="inhalt" aria-label={tagLang(t.tag)} className="flex w-56 flex-col gap-1 p-2">
        <p className="beschriftung px-2 pt-1">{tagLang(t.tag)}</p>
        {(['urlaub', 'krank'] as const).map((art) => (
          <AufklappZu key={art} asChild>
            <Knopf art="leise" groesse="klein" className="justify-start" disabled={t.ausnahme === art} onClick={() => setze({ art }, ausnahmeName[art])}>
              {ausnahmeName[art]}
            </Knopf>
          </AufklappZu>
        ))}
        {andere.map((a) => (
          <AufklappZu key={a.id} asChild>
            <Knopf art="leise" groesse="klein" className="justify-start" onClick={() => setze({ art: schicht ? 'tausch' : 'zusatz', schicht: a.id }, `${schicht ? 'Tausch' : 'Zusatzschicht'}: ${a.name}`)}>
              <Farbpunkt farbe={a.farbe} />
              {schicht ? 'Tausch' : 'Zusatzschicht'}: {a.name}
            </Knopf>
          </AufklappZu>
        ))}
        {schicht && (
          <AufklappZu asChild>
            <Knopf art="leise" groesse="klein" className="justify-start" onClick={() => setze({ art: 'tausch' }, 'frei')}>
              Frei
            </Knopf>
          </AufklappZu>
        )}
        {t.ausnahme && (
          <AufklappZu asChild>
            <Knopf art="leise" groesse="klein" className="justify-start" onClick={() => setze(null, 'wie im Rhythmus')}>
              Wie im Rhythmus
            </Knopf>
          </AufklappZu>
        )}
      </AufklappInhalt>
    </Aufklapp>
  )
}

/** Hinweise zum Plan für diese und die nächsten Wochen. */
function Hinweise({ rhythmus, jetzt }: { rhythmus: Rhythmus; jetzt: Date }) {
  const montag = startOfWeek(jetzt, { weekStartsOn: 1 })
  const bis = addDays(montag, HINWEIS_WOCHEN * 7)
  const { liste: termine, fehler } = useTermine(montag, bis)
  const feiertag = useFeiertage(jetzt.getFullYear(), useEinstellung(bundesland))
  const liste = hinweise(vorschau(rhythmus, jetzt, HINWEIS_WOCHEN), termine ?? [], feiertag)
  return (
    <section id="arbeit-hinweise" aria-label="Hinweise zum Plan" className="flaeche-kachel flex flex-col gap-2 p-4">
      <h2 className="text-lg font-semibold">Hinweise zum Plan</h2>
      {fehler && <p className="text-sm text-warnung">{fehler}</p>}
      {liste.length === 0 ? (
        <p className="text-sm text-text-gedaempft">Keine Hinweise</p>
      ) : (
        <ul className="flex flex-col gap-1 text-sm">
          {liste.map((h, i) => (
            <li key={`${h.art}-${tagSchluessel(h.tag)}-${i}`} className="flex gap-3">
              <span className="w-20 shrink-0 whitespace-nowrap text-text-gedaempft tabular-nums">
                {tagKurz(h.tag)} {tagMonat(h.tag)}
              </span>
              <span className="min-w-0 flex-1 text-warnung">{h.text}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Stunden mit Vorzeichen: „+2 Std.“, „−30 Min.“. */
const mitVorzeichen = (min: number) => `${min < 0 ? '−' : '+'}${dauerText(Math.abs(Math.round(min)))}`
const stunden = (min: number) => dauerText(Math.round(min))

/** Soll, Ist, Überstunden, Resturlaub und Monatsziel. */
function Arbeitszeit({ rhythmus, jetzt }: { rhythmus: Rhythmus; jetzt: Date }) {
  const a = arbeitszeit(rhythmus, jetzt, useEinstellung(wochenstunden), useEinstellung(urlaubstage))
  const zeilen: [string, string][] = [
    ['Soll im Monat', stunden(a.soll)],
    ['Geplant', stunden(a.plan)],
    ['Gearbeitet', stunden(a.ist)],
    ['Überstunden', mitVorzeichen(a.ueber)],
    ['Resturlaub', `${a.urlaubRest} Tage`],
  ]
  return (
    <section id="arbeit-arbeitszeit" aria-label="Arbeitszeit" className="flaeche-kachel flex flex-col gap-2 p-4">
      <h2 className="text-lg font-semibold">Arbeitszeit {monatName(jetzt)}</h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {zeilen.map(([name, wert]) => (
          <div key={name} className="contents">
            <dt className="text-text-gedaempft">{name}</dt>
            <dd className="text-right tabular-nums">{wert}</dd>
          </div>
        ))}
      </dl>
      <div role="meter" aria-label="Monatsziel" aria-valuemin={0} aria-valuemax={a.soll} aria-valuenow={a.ist} className="h-2 overflow-hidden rounded-voll bg-knopf-ton">
        <div className="akzent-verlauf h-full" style={{ width: `${Math.min(100, a.soll ? (a.ist / a.soll) * 100 : 0)}%` }} />
      </div>
    </section>
  )
}
