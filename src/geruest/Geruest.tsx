import { Suspense, useEffect } from 'react'
import { mitteUnten } from '../logik/aktionen'
import { ebeneVon, ortAusMarke, type Ort } from '../logik/ebenen'
import { einstellungen } from '../logik/einstellungen'
import { kurve } from '../werte/kurve'
import { leiste } from '../werte/leiste'
import { AktionKnopf } from './AktionKnopf'
import { useBelegung } from './belegung'
import { useEinstellung, useKurveEingeklappt, useKurveOben, useKurveSichtbar } from './einstellungen'
import { Gezeitenkurve, KurveRand } from './Gezeitenkurve'
import { useErinnerungen, useFalten, useMeldungen } from './meldungen'
import { HandyMenue } from './HandyMenue'
import { HinweiseUnten, MitKurve } from './MitKurve'
import { Hintergrund } from './Hintergrund'
import { seiten } from './seiten'
import { Seitenleiste } from './Seitenleiste'
import { useBrauchtDich } from './useBrauchtDich'
import { useSchmal } from './useSchmal'
import { useTastenkuerzel } from './useTastenkuerzel'
import { UhrUndWetter } from './UhrUndWetter'
import { ZweiteEbene } from './ZweiteEbene'

// Am PC und Tablet: Seitenleiste (schmal oder breit) und zweite Ebene über die ganze Höhe, daneben Kopfzeile, Bereich und Gezeitenkurve.
// Am Handy: oben das Menü mit Punkt und die belegbaren Knöpfe, frei ohne Fläche; darunter der Bereich, der hinter Kurve und
// unterer Leiste weiterläuft.
export function Geruest({ marke }: { marke: string }) {
  const ort = ortAusMarke(marke)
  const schmal = useSchmal()
  const brauchtDich = useBrauchtDich()
  const zahl = brauchtDich.daten?.zahl ?? 0
  // Ohne Daten bleibt der Punkt weg; der Grund steht in der Konsole.
  useEffect(() => {
    if (brauchtDich.fehler) console.error(brauchtDich.fehler)
  }, [brauchtDich.fehler])
  useTastenkuerzel()
  useErinnerungen()
  useFalten(useMeldungen().frischeIds)
  return (
    <>
      <Hintergrund />
      {schmal ? <Handy ort={ort} zahl={zahl} /> : <Pc ort={ort} />}
    </>
  )
}

function Inhalt({ ort }: { ort: Ort }) {
  const Seite = seiten[ort.bereich]
  return (
    <main className="seiten-rand flex min-w-0 flex-1 flex-col">
      <Suspense>
        <Seite />
      </Suspense>
    </main>
  )
}

function Handy({ ort, zahl }: { ort: Ort; zahl: number }) {
  const { oben, unten } = useBelegung()
  const sichtbar = useKurveSichtbar(ort.bereich)
  return (
    <div className="flex h-dvh flex-col">
      <header className="px-rand pt-rand">
        <div className="flex items-center p-1">
          <HandyMenue ort={ort} zahl={zahl} />
          <div className="ml-auto flex">
            {oben.map((id, i) => (
              <AktionKnopf key={i} id={id} />
            ))}
          </div>
        </div>
      </header>
      <MitKurve
        sichtbar={sichtbar}
        fuss={
          <nav aria-label="Untere Leiste" className="px-rand pb-rand">
            <div className="flaeche-leiste grid grid-cols-5 place-items-center p-1">
              {unten.map((id, i) => (
                <AktionKnopf key={i} id={id} art={i === mitteUnten ? 'haupt' : 'symbol'} className={i === mitteUnten ? 'w-11 px-0' : undefined} />
              ))}
            </div>
          </nav>
        }
      >
        <div className="inhalt-frei flex flex-1 flex-col overflow-auto">
          <Inhalt ort={ort} />
        </div>
      </MitKurve>
    </div>
  )
}

const leisteBreite = einstellungen.find((x) => x.id === 'leiste-breite')!

function Pc({ ort }: { ort: Ort }) {
  const sichtbar = useKurveSichtbar(ort.bereich)
  const mitNamen = useEinstellung(leisteBreite) === 'breit'
  const kurveOben = useKurveOben()
  const pc = useBelegung().pc
  const mitEbene = ebeneVon(ort.bereich).length > 0
  const eingeklappt = useKurveEingeklappt()
  const kurveFeld =
    sichtbar &&
    (eingeklappt ? (
      <KurveRand className="shrink-0" />
    ) : (
      <div className="shrink-0" style={{ height: kurve.hoehePc }}>
        <Gezeitenkurve className="h-full" />
      </div>
    ))

  // Wie in der Vorlage: Seitenleiste und zweite Ebene von ganz oben bis ganz unten; rechts daneben die Kopfzeile
  // (Wetter, Uhr, belegbare Knöpfe; auf Heute keine), der Inhalt und die Kurve. Nur der Inhalt scrollt.
  return (
    <div className="flex h-dvh gap-abstand p-rand">
      <Seitenleiste offen={ort.bereich} mitNamen={mitNamen} />
      {mitEbene && (
        <nav aria-label="Zweite Ebene" className="flaeche-leiste shrink-0 overflow-y-auto p-2" style={{ width: leiste.ebenePx }}>
          <ZweiteEbene bereich={ort.bereich} aktiv={ort.unter} />
        </nav>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-abstand">
        {ort.bereich !== 'heute' && (
          <header className="flex h-9 shrink-0 items-center justify-end gap-1">
            <UhrUndWetter />
            {pc.map((id, i) => (
              <AktionKnopf key={i} id={id} />
            ))}
          </header>
        )}
        {kurveOben && kurveFeld}
        <div className="flex min-h-0 flex-1 flex-col overflow-auto">
          <Inhalt ort={ort} />
        </div>
        {!kurveOben && kurveFeld}
        {!sichtbar && <HinweiseUnten />}
      </div>
    </div>
  )
}
