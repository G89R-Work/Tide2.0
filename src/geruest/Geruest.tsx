import { Suspense, useState } from 'react'
import { Group, Panel, useDefaultLayout, usePanelRef } from 'react-resizable-panels'
import { Trenner } from '../bausteine/Trenner'
import { mitteUnten } from '../logik/aktionen'
import { ebeneVon, ortAusMarke, type Ort } from '../logik/ebenen'
import { leiste } from '../werte/leiste'
import { AktionKnopf } from './AktionKnopf'
import { useBelegung } from './belegung'
import { useKurveOben } from './einstellungen'
import { HandyMenue } from './HandyMenue'
import { MitKurve } from './MitKurve'
import { Hintergrund } from './Hintergrund'
import { seiten } from './seiten'
import { Seitenleiste } from './Seitenleiste'
import { useBrauchtDich } from './useBrauchtDich'
import { useSchmal } from './useSchmal'
import { useTastenkuerzel } from './useTastenkuerzel'
import { ZweiteEbene } from './ZweiteEbene'

// Am PC: Seitenleiste mit ziehbarer Breite; unter der Mindestbreite rastet sie auf die Symbole ein, daneben die zweite Ebene und der offene Bereich.
// Am Handy: oben das Menü mit Punkt und die belegbaren Knöpfe, frei ohne Fläche; darunter der Bereich.
export function Geruest({ marke }: { marke: string }) {
  const ort = ortAusMarke(marke)
  const schmal = useSchmal()
  const zahl = useBrauchtDich()
  useTastenkuerzel()
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
    <main className="min-w-0 flex-1">
      <Suspense>
        <Seite />
      </Suspense>
    </main>
  )
}

function Handy({ ort, zahl }: { ort: Ort; zahl: number }) {
  const { oben, unten } = useBelegung()
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
      <MitKurve>
        <div className="flex-1 overflow-auto">
          <Inhalt ort={ort} />
        </div>
      </MitKurve>
      <nav aria-label="Untere Leiste" className="p-2 pt-0">
        <div className="flaeche-leiste grid grid-cols-5 place-items-center p-1">
          {unten.map((id, i) => (
            <AktionKnopf key={i} id={id} art={i === mitteUnten ? 'haupt' : 'symbol'} className={i === mitteUnten ? 'w-11 px-0' : undefined} />
          ))}
        </div>
      </nav>
    </div>
  )
}

function Pc({ ort }: { ort: Ort }) {
  const leisteRef = usePanelRef()
  const gemerkt = useDefaultLayout({ id: 'tide.leiste', storage: localStorage })
  const [breite, setBreite] = useState<number>(leiste.standardPx)
  const hatEbene = ebeneVon(ort.bereich).length > 0
  const kurveOben = useKurveOben()

  // Die Kurve liegt über die volle Breite; die Seitenleiste endet davor (Abstand zur Kurve gibt deren Griff).
  return (
    <div className="flex h-dvh flex-col">
      <MitKurve>
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
            className={kurveOben ? 'pb-2 pl-2' : 'pt-2 pl-2'}
          >
            <Seitenleiste offen={ort.bereich} mitNamen={breite >= leiste.standardPx} />
          </Panel>
          <Trenner
            title="Ziehen ändert die Breite, Doppelklick stellt die Standardbreite her (ein zweiter klappt ein)"
            onDoubleClick={() => (breite === leiste.standardPx ? leisteRef.current?.collapse() : leisteRef.current?.resize(leiste.standard))}
          />
          <Panel id="inhalt" className="flex">
            {hatEbene && (
              <nav aria-label="Zweite Ebene" className={kurveOben ? 'w-52 shrink-0 overflow-y-auto pb-2' : 'w-52 shrink-0 overflow-y-auto pt-2'}>
                <div className="flaeche-leiste min-h-full p-2">
                  <ZweiteEbene bereich={ort.bereich} aktiv={ort.unter} />
                </div>
              </nav>
            )}
            <div className="flex-1 overflow-auto">
              <Inhalt ort={ort} />
            </div>
          </Panel>
        </Group>
      </MitKurve>
    </div>
  )
}
