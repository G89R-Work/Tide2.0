import { useDrag } from '@use-gesture/react'
import { WISCH_GRENZE } from '../../../werte/bewegung'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { Aufklapp, AufklappInhalt, AufklappKnopf } from '../../../bausteine/Aufklapp'
import { Knopf } from '../../../bausteine/Knopf'
import { cn } from '../../../bausteine/cn'
import { setzeHier, useEinstellung } from '../../../geruest/einstellungen'
import { monatKurz, monatName, tagKurz, tagLang } from '../../../geruest/format'
import { useSchmal } from '../../../geruest/useSchmal'
import { useFeiertage } from '../../../geruest/daten'
import { Leistenknopf } from './Leistenknopf'
import { einstellung } from '../../../logik/einstellungen'
import { monatsRaster, wochenTage, type Wochenbeginn } from '../../../logik/heute'
import { tagSchluessel } from '../../../logik/zeit'
import type { Eintrag } from '../../../vertrag/eintrag'

const bundesland = einstellung('bundesland')
const kuerzel = (land: string) => (land === 'bund' ? 'DE' : land.toUpperCase())
const ersterJahr = 1950
const jahre = Array.from({ length: 151 }, (_, i) => ersterJahr + i)
const monate = Array.from({ length: 12 }, (_, i) => i)

const plusMonat = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1)
const ersterDes = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)

type Props = { monat: Date; gewaehlt: Date; jetzt: Date; beginn: Wochenbeginn; termine: readonly Eintrag[]; waehle: (tag: Date) => void }

/** Monats-Knopf der Wochenleiste; klappt den kleinen Kalender nach oben auf (wie die Vorlage).
 *  Wischen oder ‹ › wechselt den Monat, Jahr und Monat lassen sich aus einer Walze wählen, das Kürzel wählt das Bundesland. */
export function Monat({ monat, gewaehlt, jetzt, beginn, termine, waehle }: Props) {
  const schmal = useSchmal()
  const [offen, setOffen] = useState(false)
  const [zeige, setZeige] = useState({ monat: ersterDes(monat), richtung: 0 })
  const [zug, setZug] = useState(0)
  const land = useEinstellung(bundesland)
  const feiertag = useFeiertage(zeige.monat.getFullYear(), land)
  const heute = tagSchluessel(jetzt)
  const gewaehltS = tagSchluessel(gewaehlt)
  const woche = new Set(wochenTage(gewaehlt, beginn, 0).map(tagSchluessel))
  const kopf = wochenTage(zeige.monat, beginn, 0).map((t) => tagKurz(t).slice(0, 2))
  const raster = monatsRaster(zeige.monat, beginn)

  const blaettern = (n: number) => setZeige((z) => ({ monat: plusMonat(z.monat, n), richtung: n }))
  const springe = (d: Date) => setZeige((z) => ({ monat: ersterDes(d), richtung: Math.sign(d.getTime() - z.monat.getTime()) }))
  const nimm = (tag: Date) => {
    waehle(tag)
    setOffen(false)
  }
  const wischen = useDrag(
    ({ active, movement: [mx], swipe: [sx], event }) => {
      const breite = (event.currentTarget as HTMLElement | null)?.clientWidth ?? 1
      if (active) return setZug(mx)
      setZug(0)
      const n = sx !== 0 ? -sx : Math.abs(mx) > breite * WISCH_GRENZE ? -Math.sign(mx) : 0
      if (n) blaettern(n)
    },
    { axis: 'x', filterTaps: true },
  )

  // Termine je Tag (ohne Schichten), höchstens drei Punkte.
  const punkte = new Map<string, number>()
  for (const t of termine) if (t.art !== 'schicht' && t.beginn) punkte.set(tagSchluessel(new Date(t.beginn)), Math.min(3, (punkte.get(tagSchluessel(new Date(t.beginn))) ?? 0) + 1))
  const imMonat = raster.flat().filter((t) => t.getMonth() === zeige.monat.getMonth() && feiertag(t))
  const fuss = imMonat.length === 0 ? '' : `Feiertage ${kuerzel(land)}: ${imMonat.map((t) => `${t.getDate()}. ${feiertag(t)}`).join(' · ')}`

  return (
    <Aufklapp
      open={offen}
      onOpenChange={(o) => {
        if (o) setZeige({ monat: ersterDes(gewaehlt), richtung: 0 })
        setOffen(o)
      }}
    >
      <AufklappKnopf asChild>
        <Leistenknopf symbol={CalendarDays} text={schmal ? monatKurz(monat) : monatName(monat)} aria-label={monatName(monat)} className={cn(offen && 'text-akzent')} />
      </AufklappKnopf>
      <AufklappInhalt side="top" align="start" breite="inhalt" aria-label="Monatskalender" className="kalender-klein p-4">
        <div className="flex items-center gap-1.5">
          <Knopf art="symbol" groesse="klein" className="rounded-voll" aria-label="Monat zurück" onClick={() => blaettern(-1)}>
            <ChevronLeft aria-hidden className="size-4" />
          </Knopf>
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <Walze name="Jahr wählen" text={String(zeige.monat.getFullYear())} werte={jahre} aktiv={zeige.monat.getFullYear()} beschrift={String} waehle={(j) => springe(new Date(j, zeige.monat.getMonth(), 1))} />
            <Walze name="Monat wählen" text={monatName(zeige.monat)} werte={monate} aktiv={zeige.monat.getMonth()} beschrift={(m) => monatName(new Date(2000, m, 1))} waehle={(m) => springe(new Date(zeige.monat.getFullYear(), m, 1))} />
            <Laender land={land} />
          </div>
          <Knopf art="symbol" groesse="klein" className="rounded-voll" aria-label="Monat vor" onClick={() => blaettern(1)}>
            <ChevronRight aria-hidden className="size-4" />
          </Knopf>
        </div>
        <div {...wischen()} className="mt-2.5 touch-pan-y overflow-hidden select-none">
          <div
            key={tagSchluessel(zeige.monat)}
            role="grid"
            aria-label={`${monatName(zeige.monat)} ${zeige.monat.getFullYear()}`}
            className="monat-rein grid grid-cols-7 gap-1 text-center"
            style={{ '--richtung': zeige.richtung, translate: `${zug}px 0` } as CSSProperties}
          >
            {kopf.map((k) => (
              <span key={k} role="columnheader" className="pb-1 text-xs text-text-blass">
                {k}
              </span>
            ))}
            {raster.flat().map((t) => {
              const s = tagSchluessel(t)
              const name = feiertag(t)
              const ist = s === heute
              const draussen = t.getMonth() !== zeige.monat.getMonth()
              return (
                <button
                  key={s}
                  type="button"
                  role="gridcell"
                  title={name}
                  aria-label={name ? `${tagLang(t)}, ${name}` : tagLang(t)}
                  aria-current={ist ? 'date' : undefined}
                  aria-selected={s === gewaehltS}
                  onClick={() => nimm(t)}
                  className={cn(
                    'drueck relative rounded-knopf pt-2 pb-3 text-sm tabular-nums outline-none hover:bg-knopf-ton focus-visible:ring-2 focus-visible:ring-akzent',
                    draussen && 'text-text-blass',
                    woche.has(s) && !ist && 'bg-knopf-ton',
                    s === gewaehltS && 'ring-1 ring-akzent ring-inset',
                    name && !ist && 'text-akzent',
                    ist && 'akzent-verlauf font-semibold text-auf-akzent',
                  )}
                >
                  {t.getDate()}
                  {!draussen && (
                    <span aria-hidden className="absolute inset-x-0 bottom-1 flex justify-center gap-0.5">
                      {Array.from({ length: punkte.get(s) ?? 0 }, (_, i) => (
                        <span key={i} className={cn('size-1 rounded-voll', ist ? 'bg-auf-akzent' : 'bg-akzent')} />
                      ))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        <div className="mt-2.5 flex h-7 items-center justify-between gap-2.5 text-xs">
          <span title={fuss} className="min-w-0 truncate text-text-gedaempft">
            {fuss}
          </span>
          <Knopf groesse="klein" className="rounded-voll" onClick={() => nimm(new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate()))}>
            Heute
          </Knopf>
        </div>
      </AufklappInhalt>
    </Aufklapp>
  )
}

type WalzeProps = { name: string; text: string; werte: readonly number[]; aktiv: number; beschrift: (w: number) => string; waehle: (w: number) => void }

/** Knopf mit Jahr oder Monat; klappt eine Walze am Knopf auf, die man durchwischt. Der aktive Wert steht beim Öffnen in der Mitte. */
function Walze({ name, text, werte, aktiv, beschrift, waehle }: WalzeProps) {
  const [offen, setOffen] = useState(false)
  return (
    <Aufklapp open={offen} onOpenChange={setOffen}>
      <AufklappKnopf asChild>
        <Knopf art="leise" groesse="klein" aria-label={name} className={cn('px-1.5 text-lg text-text', offen && 'bg-knopf-ton text-akzent')}>
          {text}
        </Knopf>
      </AufklappKnopf>
      <AufklappInhalt
        align="start"
        side="bottom"
        breite="inhalt"
        aria-label={name}
        className="walze p-1.5"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          const knopf = (e.currentTarget as HTMLElement).querySelector<HTMLElement>('[aria-current="true"]')
          knopf?.scrollIntoView({ block: 'center' })
          knopf?.focus({ preventScroll: true })
        }}
      >
        {werte.map((w) => (
          <Knopf
            key={w}
            art="leise"
            groesse="klein"
            aria-current={w === aktiv ? 'true' : undefined}
            className={cn('flex w-full justify-start px-4 text-text', w === aktiv && 'bg-knopf-ton text-akzent')}
            onClick={() => {
              waehle(w)
              setOffen(false)
            }}
          >
            {beschrift(w)}
          </Knopf>
        ))}
      </AufklappInhalt>
    </Aufklapp>
  )
}

/** Kürzel des Bundeslands; klappt die Wahl aller Länder auf. Ändert die Einstellung „Bundesland für Feiertage“ (mit Rückgängig). */
function Laender({ land }: { land: string }) {
  const [offen, setOffen] = useState(false)
  return (
    <Aufklapp open={offen} onOpenChange={setOffen}>
      <AufklappKnopf asChild>
        <Knopf groesse="klein" aria-label={`${bundesland.name}: ${bundesland.optionen.find(([w]) => w === land)?.[1] ?? land}`} className="ml-1 rounded-voll font-semibold text-akzent">
          {kuerzel(land)}
        </Knopf>
      </AufklappKnopf>
      <AufklappInhalt align="start" side="bottom" breite="inhalt" aria-label={bundesland.name} className="kalender-klein grid grid-cols-4 gap-1.5 p-2.5">
        {bundesland.optionen.map(([wert, name]) => (
          <Knopf
            key={wert}
            groesse="klein"
            title={name}
            aria-label={name}
            aria-pressed={wert === land}
            className={cn('px-0', wert === land && 'akzent-verlauf border-durchsichtig text-auf-akzent')}
            onClick={() => {
              setzeHier(bundesland, wert, { text: `${bundesland.name}: ${name}`, bereich: 'heute' })
              setOffen(false)
            }}
          >
            {kuerzel(wert)}
          </Knopf>
        ))}
      </AufklappInhalt>
    </Aufklapp>
  )
}
