import { Suspense, useEffect, useLayoutEffect, useRef, useState, type Ref } from 'react'
import { BearbeitenOrt } from '../kacheln/bearbeiten'
import { mitteUnten } from '../logik/aktionen'
import { ebeneVon, ortAusMarke, type Ort } from '../logik/ebenen'
import { einstellungen } from '../logik/einstellungen'
import { flaeche, geruestRaster } from '../logik/geruestRaster'
import { kachelRaster } from '../werte/kacheln'
import { leiste } from '../werte/leiste'
import { AktionKnopf } from './AktionKnopf'
import { useBelegung } from './belegung'
import { useEinstellung, useKurveOben, useKurveSichtbar } from './einstellungen'
import { Gezeitenkurve } from './Gezeitenkurve'
import { useErinnerungen, useFalten, useMeldungen } from './meldungen'
import { HandyMenue } from './HandyMenue'
import { HinweiseUnten, MitKurve } from './MitKurve'
import { RasterPlatz } from './rasterPlatz'
import { Hintergrund } from './Hintergrund'
import { seiten } from './seiten'
import { Seitenleiste } from './Seitenleiste'
import { useBrauchtDich } from './useBrauchtDich'
import { useSchmal } from './useSchmal'
import { useTastenkuerzel } from './useTastenkuerzel'
import { UhrUndWetter } from './UhrUndWetter'
import { ZweiteEbene } from './ZweiteEbene'

// Am PC und Tablet: oben eine schmale Kopfzeile mit Uhrzeit und Wetter, darunter alles im Zellraster: Seitenleiste (schmal oder breit),
// zweite Ebene, der offene Bereich und die Gezeitenkurve.
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
  const [bearbeitenOrt, setBearbeitenOrt] = useState<HTMLElement | null>(null)
  return (
    <BearbeitenOrt.Provider value={bearbeitenOrt}>
      <Hintergrund />
      {schmal ? <Handy ort={ort} zahl={zahl} bearbeitenRef={setBearbeitenOrt} /> : <Pc ort={ort} bearbeitenRef={setBearbeitenOrt} />}
    </BearbeitenOrt.Provider>
  )
}

function Inhalt({ ort }: { ort: Ort }) {
  const Seite = seiten[ort.bereich]
  return (
    <main className="seiten-rand min-w-0 flex-1">
      <Suspense>
        <Seite />
      </Suspense>
    </main>
  )
}

function Handy({ ort, zahl, bearbeitenRef }: { ort: Ort; zahl: number; bearbeitenRef: Ref<HTMLDivElement> }) {
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
          <nav aria-label="Untere Leiste" className="relative px-rand pb-rand">
            {/* Bedienfeld im Bearbeiten-Modus: schwebt über der Leiste und ändert ihre Höhe nicht. */}
            <div ref={bearbeitenRef} className="absolute inset-x-rand bottom-full mb-abstand" />
            <div className="flaeche-leiste grid grid-cols-5 place-items-center p-1">
              {unten.map((id, i) => (
                <AktionKnopf key={i} id={id} art={i === mitteUnten ? 'haupt' : 'symbol'} className={i === mitteUnten ? 'w-11 px-0' : undefined} />
              ))}
            </div>
          </nav>
        }
      >
        <div className="inhalt-frei flex-1 overflow-auto">
          <Inhalt ort={ort} />
        </div>
      </MitKurve>
    </div>
  )
}

const e = {
  spalten: einstellungen.find((x) => x.id === 'kacheln-spalten')!,
  leiste: einstellungen.find((x) => x.id === 'leiste-breite')!,
  vorrang: einstellungen.find((x) => x.id === 'leiste-vorrang')!,
  kurve: einstellungen.find((x) => x.id === 'kurve-reihen')!,
}

function Pc({ ort, bearbeitenRef }: { ort: Ort; bearbeitenRef: Ref<HTMLDivElement> }) {
  const sichtbar = useKurveSichtbar(ort.bereich)
  const leisteBreite = useEinstellung(e.leiste) as 'schmal' | 'breit'
  const kurveReihen = useEinstellung(e.kurve) as number
  const spalten = useEinstellung(e.spalten) as number
  const vorrang = useEinstellung(e.vorrang) as 'kurve' | 'leiste'
  const kurveOben = useKurveOben()
  const feld = useRef<HTMLDivElement>(null)
  const [platz, setPlatz] = useState({ breite: 0, hoehe: 0 })
  useLayoutEffect(() => {
    const beobachter = new ResizeObserver(([f]) => setPlatz({ breite: f.contentRect.width, hoehe: f.contentRect.height }))
    beobachter.observe(feld.current!)
    return () => beobachter.disconnect()
  }, [])
  const g = geruestRaster({
    ...platz,
    spalten,
    anteil: kachelRaster.abstandAnteil,
    leiste: leisteBreite,
    leisteNamenPx: leiste.namenPx,
    ebenePx: ebeneVon(ort.bereich).length > 0 ? leiste.ebenePx : 0,
    kurve: sichtbar ? kurveReihen : 0,
    kurveOben,
    vorrang,
  })
  const inhalt = flaeche(g, g.inhalt)

  // Unter der Kopfzeile ein Zellraster über die ganze Seite: Leiste, zweite Ebene, Inhalt und Kurve belegen ganze Zellen
  // (src/logik/geruestRaster.ts). Nur der Inhalt scrollt; Leiste und Kurve stehen fest.
  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-9 shrink-0 items-center justify-end gap-1 px-rand">
        <UhrUndWetter />
      </header>
      <div ref={feld} className="relative mx-rand mb-rand min-h-0 flex-1">
        {platz.breite > 0 && (
          <>
            <div className="absolute" style={flaeche(g, g.leiste)}>
              <Seitenleiste offen={ort.bereich} mitNamen={leisteBreite === 'breit'} bearbeitenRef={bearbeitenRef} />
            </div>
            {g.ebene && (
              <nav aria-label="Zweite Ebene" className="flaeche-leiste absolute overflow-y-auto p-2" style={flaeche(g, g.ebene)}>
                <ZweiteEbene bereich={ort.bereich} aktiv={ort.unter} />
              </nav>
            )}
            <div className="absolute overflow-auto" style={inhalt}>
              <RasterPlatz.Provider value={{ spalten: g.inhalt.w, hoehe: inhalt.height }}>
                <Inhalt ort={ort} />
              </RasterPlatz.Provider>
            </div>
            {g.kurve && (
              <div className="absolute" style={flaeche(g, g.kurve)}>
                <Gezeitenkurve className="h-full" />
              </div>
            )}
          </>
        )}
        {!sichtbar && (
          <div className="absolute inset-x-0 bottom-0">
            <HinweiseUnten />
          </div>
        )}
      </div>
    </div>
  )
}
