import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useId, useRef } from 'react'
import { Knopf } from '../../../bausteine/Knopf'
import { cn } from '../../../bausteine/cn'
import { monatsRaster, tagSchluessel, wochenTage, type Wochenbeginn } from '../../../logik/heute'
import { monatJahr, monatName, tagKurz, tagLang } from '../../../geruest/format'

const plusMonat = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1)

type Props = { monat: Date; jetzt: Date; beginn: Wochenbeginn; waehle: (tag: Date) => void; blaettern: (monat: Date) => void }

/** Knopf mit dem Monatsnamen; öffnet den Monatskalender. Ein Tag darin zeigt ihn in der Wochenleiste. */
export function Monat({ monat, jetzt, beginn, waehle, blaettern }: Props) {
  const id = useId()
  const karte = useRef<HTMLDivElement>(null)
  const heute = tagSchluessel(jetzt)
  const kopf = wochenTage(monat, beginn, 0).map((t) => tagKurz(t).slice(0, 2))

  return (
    <>
      <Knopf art="leise" popoverTarget={id} className="h-full w-full flex-col text-text">
        <CalendarDays aria-hidden className="size-5" />
        {monatName(monat)}
      </Knopf>
      <div ref={karte} id={id} popover="auto" aria-label="Monatskalender" className="flaeche-schwebend schwebende-karte p-4">
        <div className="mb-3 flex items-center gap-1">
          <p className="flex-1 font-medium">{monatJahr(monat)}</p>
          <Knopf art="symbol" groesse="klein" aria-label="Monat zurück" onClick={() => blaettern(plusMonat(monat, -1))}>
            <ChevronLeft aria-hidden className="size-4" />
          </Knopf>
          <Knopf art="symbol" groesse="klein" aria-label="Monat vor" onClick={() => blaettern(plusMonat(monat, 1))}>
            <ChevronRight aria-hidden className="size-4" />
          </Knopf>
        </div>
        <table className="w-full table-fixed text-center text-sm">
          <thead>
            <tr>
              {kopf.map((k) => (
                <th key={k} scope="col" className="pb-1 text-xs font-normal text-text-gedaempft">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monatsRaster(monat, beginn).map((woche, w) => (
              <tr key={w}>
                {woche.map((t, i) => (
                  <td key={i} className="p-0.5">
                    {t && (
                      <Knopf
                        art="leise"
                        groesse="klein"
                        aria-label={tagLang(t)}
                        aria-current={tagSchluessel(t) === heute ? 'date' : undefined}
                        className={cn('w-full px-0 text-text', tagSchluessel(t) === heute && 'bg-akzent font-semibold text-auf-akzent hover:bg-akzent hover:text-auf-akzent')}
                        onClick={() => {
                          waehle(t)
                          karte.current?.hidePopover()
                        }}
                      >
                        {t.getDate()}
                      </Knopf>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
