import { useState, type FormEvent } from 'react'
import { Aufklapp, AufklappAnker, AufklappInhalt } from '../bausteine/Aufklapp'
import { Eingabe } from '../bausteine/Eingabe'
import { Knopf } from '../bausteine/Knopf'
import { ZIEH_RASTER, type Band, type Punkt, type Ziehart } from '../logik/kurveEintraege'
import type { Eintrag } from '../vertrag/eintrag'
import { uhrzeit } from './format'
import type { Aendere } from './KurveEintraege'

// Karte zu Punkten, Bündeln und Treibgut der Gezeitenkurve. Lädt nach dem Start nach (KurveEintraege), damit der
// Popover-Baustein nicht im Startpaket steckt (Tempo-Grenze 200 KB).

/** Offene Karte: was sie zeigt und woran sie hängt (Punkt, Band, Bündel oder Treibgut). */
export type Karte = { art: 'termine' | 'treibgut'; ids: string[]; anker: HTMLElement }

/** Karte am Punkt (Popover-Baustein): liegt über allem, folgt dem Punkt, Esc oder Klick daneben schließt sie. */
export default function KurveKarte(p: {
  karte: Karte | null
  schliessen: () => void
  waehle: (id: string) => void
  termine: (Punkt | Band)[]
  treibgut: Eintrag[]
  verschiebe: (e: Eintrag, delta: number, art?: Ziehart) => Promise<void>
  aendere: Aendere
}) {
  const { karte, schliessen } = p
  const gewaehlt = karte?.art === 'termine' ? p.termine.filter((t) => karte.ids.includes(t.id)) : []
  return (
    <Aufklapp open={karte !== null} onOpenChange={(offen) => !offen && schliessen()}>
      {karte && <AufklappAnker virtualRef={{ current: karte.anker }} />}
      {karte && (
        <AufklappInhalt side="top" breite="inhalt" aria-label={karte.art === 'treibgut' ? 'Treibgut' : 'Termine'} className="flex w-72 flex-col gap-2 p-3 text-sm">
          {karte.art === 'treibgut' && (
            <>
              <p className="text-xs text-text-gedaempft">Offen, ohne Uhrzeit</p>
              <ul className="flex flex-col gap-1">
                {p.treibgut.map((e) => (
                  <li key={e.id}>{e.titel}</li>
                ))}
              </ul>
            </>
          )}
          {gewaehlt.length > 1 && (
            <>
              <p className="text-xs text-text-gedaempft">{gewaehlt.length} Termine</p>
              {gewaehlt.map((t) => (
                <Knopf key={t.id} art="leise" className="justify-start text-text" onClick={() => p.waehle(t.id)}>
                  <span className="text-text-gedaempft tabular-nums">{uhrzeit(t.eintrag.beginn!)}</span>
                  <span className="truncate">{t.titel}</span>
                </Knopf>
              ))}
            </>
          )}
          {gewaehlt.length === 1 && <TerminKarte key={gewaehlt[0].id} t={gewaehlt[0]} verschiebe={p.verschiebe} aendere={p.aendere} />}
          {karte.art === 'termine' && gewaehlt.length === 0 && <p className="text-text-gedaempft">Der Termin ist nicht mehr da.</p>}
        </AufklappInhalt>
      )}
    </Aufklapp>
  )
}

function TerminKarte({ t, verschiebe, aendere }: { t: Punkt | Band; verschiebe: (e: Eintrag, delta: number, art?: Ziehart) => Promise<void>; aendere: Aendere }) {
  const [bearbeiten, setBearbeiten] = useState(false)
  const e = t.eintrag
  const ueberschneidet = 'ueberschneidet' in t ? t.ueberschneidet : []

  const sichern = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const titel = String(new FormData(ev.currentTarget).get('titel') ?? '').trim()
    setBearbeiten(false)
    if (titel && titel !== e.titel) void aendere(e, { titel }, `„${e.titel}" umbenannt`)
  }

  return (
    <>
      <p className="text-xs text-text-gedaempft tabular-nums">
        {uhrzeit(e.beginn!)} – {uhrzeit(e.ende!)}
      </p>
      {bearbeiten ? (
        <form onSubmit={sichern} className="flex gap-2">
          <Eingabe name="titel" defaultValue={e.titel} aria-label="Titel" autoFocus className="flex-1" />
          <Knopf type="submit" art="haupt">
            Sichern
          </Knopf>
        </form>
      ) : (
        <p className="font-medium">{e.titel}</p>
      )}
      {ueberschneidet.length > 0 && <p className="text-xs text-warnung">Überschneidet sich mit {ueberschneidet.join(', ')}</p>}
      <div className="flex flex-wrap gap-1">
        <Knopf groesse="klein" onClick={() => void verschiebe(e, -ZIEH_RASTER)}>
          {ZIEH_RASTER} Min. früher
        </Knopf>
        <Knopf groesse="klein" onClick={() => void verschiebe(e, ZIEH_RASTER)}>
          {ZIEH_RASTER} Min. später
        </Knopf>
        <Knopf groesse="klein" onClick={() => void verschiebe(e, ZIEH_RASTER, 'ende')}>
          {ZIEH_RASTER} Min. länger
        </Knopf>
        <Knopf groesse="klein" onClick={() => void verschiebe(e, -ZIEH_RASTER, 'ende')}>
          {ZIEH_RASTER} Min. kürzer
        </Knopf>
        {!bearbeiten && (
          <Knopf groesse="klein" art="leise" onClick={() => setBearbeiten(true)}>
            Bearbeiten
          </Knopf>
        )}
      </div>
    </>
  )
}
