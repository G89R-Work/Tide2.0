import { Suspense, useEffect, useState, type CSSProperties } from 'react'
import { Group, Panel, useDefaultLayout, usePanelRef } from 'react-resizable-panels'
import { cn } from '../bausteine/cn'
import { Trenner } from '../bausteine/Trenner'
import { mitteUnten } from '../logik/aktionen'
import { ebeneVon, ortAusMarke, type Ort } from '../logik/ebenen'
import { leisteLage } from '../logik/leisteLage'
import { kurve } from '../werte/kurve'
import { leiste } from '../werte/leiste'
import { AktionKnopf } from './AktionKnopf'
import { useBelegung } from './belegung'
import { useKurveOben, useKurveSichtbar } from './einstellungen'
import { useErinnerungen, useFalten, useMeldungen } from './meldungen'
import { HandyMenue } from './HandyMenue'
import { MitKurve, type Platz } from './MitKurve'
import { Hintergrund } from './Hintergrund'
import { seiten } from './seiten'
import { Seitenleiste } from './Seitenleiste'
import { useBrauchtDich } from './useBrauchtDich'
import { useSchmal } from './useSchmal'
import { useTastenkuerzel } from './useTastenkuerzel'
import { ZweiteEbene } from './ZweiteEbene'

// Am PC: Seitenleiste mit ziehbarer Breite; unter der Mindestbreite rastet sie auf die Symbole ein, daneben die zweite Ebene und der offene Bereich.
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
    <main className="seiten-rand min-w-0 flex-1">
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
      <header className="p-2 pb-0">
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
          <nav aria-label="Untere Leiste" className="p-2 pt-0">
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

function Pc({ ort }: { ort: Ort }) {
  const leisteRef = usePanelRef()
  const gemerkt = useDefaultLayout({ id: 'tide.leiste', storage: localStorage })
  const [breite, setBreite] = useState<number>(leiste.standardPx)
  const hatEbene = ebeneVon(ort.bereich).length > 0
  const kurveOben = useKurveOben()
  const sichtbar = useKurveSichtbar(ort.bereich)
  const [platz, setPlatz] = useState<Platz>({ hoehe: 0, links: 0 })
  const lage = leisteLage({ leiste: breite, links: platz.links, kurve: sichtbar ? platz.hoehe : 0, griff: kurve.griffPx, rand: leiste.randPx, kurveOben })

  // Die Kurve liegt über die volle Breite. Die Seitenleiste liegt als eigene Lage über ihrer Spalte: Die Spalte (Panel „leiste")
  // gibt die ziehbare Breite vor, die Leiste endet am Kurven-Streifen oder reicht bis zum Rand, wenn die Kurve links Platz lässt.
  return (
    <div className="relative flex h-dvh flex-col">
      <MitKurve onPlatz={setPlatz} sichtbar={sichtbar}>
        <Group {...gemerkt} orientation="horizontal" className="h-full">
          <Panel
            id="leiste"
            panelRef={leisteRef}
            collapsible
            collapsedSize={leiste.symbole}
            minSize={leiste.standard}
            maxSize={leiste.hoechstens}
            defaultSize={leiste.standard}
            // Die gemeldete Größe ist verlässlicher als isCollapsed(), das nach dem Neuladen veraltet sein kann.
            onResize={(groesse) => setBreite(Math.round(groesse.inPixels))}
          />
          <Trenner
            title="Ziehen ändert die Breite, Doppelklick stellt die Standardbreite her (ein zweiter klappt ein)"
            onDoubleClick={() => (breite === leiste.standardPx ? leisteRef.current?.collapse() : leisteRef.current?.resize(leiste.standard))}
          />
          <Panel id="inhalt" className="flex">
            {hatEbene && (
              <nav aria-label="Zweite Ebene" className="inhalt-frei flex w-54 shrink-0 flex-col overflow-y-auto pr-2">
                <div className={cn('flaeche-leiste flex-1 p-2', kurveOben ? 'mb-2' : 'mt-2')}>
                  <ZweiteEbene bereich={ort.bereich} aktiv={ort.unter} />
                </div>
              </nav>
            )}
            <div className="inhalt-frei flex-1 overflow-auto">
              <Inhalt ort={ort} />
            </div>
          </Panel>
        </Group>
      </MitKurve>
      <div className="leiste-lage" style={{ '--breite': breite, '--oben': lage.oben, '--unten': lage.unten } as CSSProperties}>
        <Seitenleiste offen={ort.bereich} mitNamen={breite >= leiste.standardPx} />
      </div>
    </div>
  )
}
