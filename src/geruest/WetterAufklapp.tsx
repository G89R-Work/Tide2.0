import { addDays, startOfDay } from 'date-fns'
import type { ReactNode } from 'react'
import { Aufklapp, AufklappInhalt, AufklappKnopf } from '../bausteine/Aufklapp'
import { Knopf } from '../bausteine/Knopf'
import { mondphase } from '../logik/fakten'
import { abweichung, stundenAb } from '../logik/heute'
import { himmel } from '../logik/himmel'
import { ausSchluessel, tagSchluessel } from '../logik/zeit'
import { useWetter, useWetterTage } from './daten'
import { stundeKurz, tagKurz, uhrzeit, zahl } from './format'
import { useOrt } from './useOrt'
import { useWetterHeute } from './useWetterHeute'
import { Wetter } from './Wetter'

/** So viele Stunden zeigt der Verlauf, so viele Tage die Vorschau. */
const STUNDEN = 12
const TAGE = 7

function Abschnitt({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <section className="grid gap-1.5">
      <h3 className="beschriftung">{titel}</h3>
      {children}
    </section>
  )
}

/** Name und Wert als Zeile einer Werteliste. */
const Wert = ({ name, children }: { name: string; children: ReactNode }) => (
  <div className="flex justify-between gap-2">
    <dt className="text-text-gedaempft">{name}</dt>
    <dd className="tabular-nums">{children}</dd>
  </div>
)

/** Wetter als Knopf (`klein`: Symbol und Grad, für die Kopfzeile). Ein Klick klappt alle Werte aus docs/konzept/10-heute.md auf. */
export default function WetterAufklapp({ jetzt, klein = false }: { jetzt: Date; klein?: boolean }) {
  const { wetter: w, Symbol, fehler } = useWetterHeute(jetzt)
  const ort = useOrt()
  const tag = startOfDay(jetzt)
  const verlauf = useWetter(tag, addDays(tag, 2))
  const vorschau = useWetterTage(tag, addDays(tag, TAGE))

  if (!w) {
    if (klein) return null
    if (fehler) return <p className="text-sm text-warnung">{fehler}</p>
    return <p className="text-sm text-text-gedaempft">{w === null ? 'Für heute liegen keine Werte vor.' : 'Lädt …'}</p>
  }
  const s = w.stunde
  const h = himmel(jetzt, ort, 'bogen')
  const heute = vorschau.tage?.find((t) => t.tag === tagSchluessel(jetzt))
  const stunden = verlauf.stunden ? stundenAb(verlauf.stunden, jetzt, STUNDEN) : []

  return (
    <Aufklapp>
      <AufklappKnopf asChild>
        {klein ? (
          <Knopf art="leise" groesse="klein" aria-label={`Wetter: ${Math.round(w.grad)} Grad`} className="text-sm text-text">
            <Symbol aria-hidden className="size-4" />
            {Math.round(w.grad)}°
          </Knopf>
        ) : (
          <Knopf art="leise" aria-label={`Wetter: ${Math.round(w.grad)} Grad`} className="h-auto px-0 py-0 whitespace-normal text-text hover:bg-durchsichtig">
            <Wetter wetter={w} Symbol={Symbol} />
          </Knopf>
        )}
      </AufklappKnopf>
      <AufklappInhalt breite="inhalt" align="end" aria-label="Wetter" className="grid w-80 gap-4 p-4 text-sm">
        {klein && <Wetter wetter={w} Symbol={Symbol} />}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Wert name="Gefühlt">{Math.round(s.gefuehlt)}°</Wert>
          <Wert name="Feuchte">{Math.round(s.feuchte)} %</Wert>
          <Wert name="Wind">{Math.round(s.wind)} km/h</Wert>
          <Wert name="Böen">{Math.round(s.boeen)} km/h</Wert>
          <Wert name="UV">{zahl(s.uv)}</Wert>
          <Wert name="Druck">{Math.round(s.druck)} hPa</Wert>
        </dl>

        <Abschnitt titel="Quellen">
          <dl className="grid gap-1">
            {s.quellen.map((q) => (
              <Wert key={q.name} name={q.name}>
                {zahl(q.grad)}°
              </Wert>
            ))}
            <Wert name="Mitte">
              <span className="font-medium">{zahl(s.grad)}°</span>
            </Wert>
          </dl>
        </Abschnitt>

        <Abschnitt titel="Stunden">
          {verlauf.fehler && <p className="text-warnung">{verlauf.fehler}</p>}
          <div className="touch-pan-x overflow-x-auto overscroll-x-contain">
            <table className="text-center whitespace-nowrap tabular-nums">
              <tbody>
                <tr className="text-text-gedaempft">
                  <th className="pr-2 text-left font-normal">Uhr</th>
                  {stunden.map((x) => (
                    <td key={x.zeit} className="px-1.5">
                      {stundeKurz(new Date(x.zeit))}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="pr-2 text-left font-normal text-text-gedaempft">Grad</th>
                  {stunden.map((x) => (
                    <td key={x.zeit} className="px-1.5 font-medium">
                      {Math.round(x.grad)}°
                    </td>
                  ))}
                </tr>
                <tr className="text-text-gedaempft">
                  <th className="pr-2 text-left font-normal">Gefühlt</th>
                  {stunden.map((x) => (
                    <td key={x.zeit} className="px-1.5">
                      {Math.round(x.gefuehlt)}°
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="pr-2 text-left font-normal text-text-gedaempft">mm</th>
                  {stunden.map((x) => (
                    <td key={x.zeit} className="px-1.5">
                      {x.regen > 0 ? zahl(x.regen) : '–'}
                    </td>
                  ))}
                </tr>
                <tr className="text-text-gedaempft">
                  <th className="pr-2 text-left font-normal">Regen</th>
                  {stunden.map((x) => (
                    <td key={x.zeit} className="px-1.5">
                      {Math.round(x.regenChance)} %
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Abschnitt>

        <Abschnitt titel="7 Tage">
          {vorschau.fehler && <p className="text-warnung">{vorschau.fehler}</p>}
          <ul className="grid gap-1 tabular-nums">
            {vorschau.tage?.map((t) => (
              <li key={t.tag} className="grid grid-cols-4 gap-2">
                <span>{tagKurz(ausSchluessel(t.tag) ?? jetzt)}</span>
                <span className="text-text-gedaempft">{Math.round(t.tief)}°</span>
                <span>{Math.round(t.hoch)}°</span>
                <span className="text-right text-text-gedaempft">{Math.round(t.regenChance)} %</span>
              </li>
            ))}
          </ul>
        </Abschnitt>

        {heute && (
          <Abschnitt titel="Vergleich">
            <dl className="grid gap-1">
              <Wert name="Vorjahr">{abweichung(heute.hoch, heute.vorjahr.hoch)}</Wert>
              <Wert name="Mittel">{abweichung(heute.hoch, heute.mittel.hoch)}</Wert>
            </dl>
          </Abschnitt>
        )}

        <Abschnitt titel="Sonne und Mond">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
            <Wert name="Aufgang">{h.aufgang ? uhrzeit(h.aufgang) : '–'}</Wert>
            <Wert name="Untergang">{h.untergang ? uhrzeit(h.untergang) : '–'}</Wert>
          </dl>
          <p>{mondphase(h.mond.phase)}</p>
        </Abschnitt>
      </AufklappInhalt>
    </Aufklapp>
  )
}
