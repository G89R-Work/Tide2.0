import { Suspense, useState } from 'react'
import { Group, Panel, Separator, useDefaultLayout, usePanelRef } from 'react-resizable-panels'
import { mitteUnten } from '../logik/aktionen'
import { einstellungen } from '../logik/einstellungen'
import { ebeneVon, ortAusMarke, type Ort } from '../logik/ebenen'
import { leiste } from '../werte/leiste'
import { AktionKnopf } from './AktionKnopf'
import { useBelegung } from './belegung'
import { useEinstellung } from './einstellungen'
import { Gezeitenkurve } from './Gezeitenkurve'
import { HandyMenue } from './HandyMenue'
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

const kurveLage = einstellungen.find((e) => e.id === 'kurve-lage-handy')!

function Handy({ ort, zahl }: { ort: Ort; zahl: number }) {
  const { oben, unten } = useBelegung()
  const kurveOben = useEinstellung(kurveLage) === 'oben'
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
        {kurveOben && <Gezeitenkurve className="mt-1" />}
      </header>
      <div className="flex-1 overflow-auto">
        <Inhalt ort={ort} />
      </div>
      <nav aria-label="Untere Leiste" className="p-2 pt-0">
        {!kurveOben && <Gezeitenkurve className="mb-2" />}
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

  return (
    <div className="h-dvh">
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
          className="p-2 pr-0"
        >
          <Seitenleiste offen={ort.bereich} mitNamen={breite >= leiste.standardPx} />
        </Panel>
        <Separator
          title="Ziehen ändert die Breite, Doppelklick stellt die Standardbreite her (ein zweiter klappt ein)"
          onDoubleClick={() => (breite === leiste.standardPx ? leisteRef.current?.collapse() : leisteRef.current?.resize(leiste.standard))}
          className="group flex w-2 items-center justify-center outline-none"
        >
          <div className="h-full w-0.5 bg-durchsichtig group-hover:bg-linie-stark group-focus-visible:bg-akzent" />
        </Separator>
        <Panel id="inhalt" className="flex flex-col">
          <div className="p-2 pb-0 pl-0">
            <Gezeitenkurve />
          </div>
          <div className="flex min-h-0 flex-1">
            {hatEbene && (
              <nav aria-label="Zweite Ebene" className="w-52 shrink-0 overflow-y-auto py-2">
                <div className="flaeche-leiste min-h-full p-2">
                  <ZweiteEbene bereich={ort.bereich} aktiv={ort.unter} />
                </div>
              </nav>
            )}
            <div className="flex-1 overflow-auto">
              <Inhalt ort={ort} />
            </div>
          </div>
        </Panel>
      </Group>
    </div>
  )
}
