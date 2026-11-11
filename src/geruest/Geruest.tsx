import { Suspense, useState } from 'react'
import { Group, Panel, Separator, useDefaultLayout, usePanelRef } from 'react-resizable-panels'
import { mitteUnten } from '../logik/aktionen'
import { ebeneVon, ortAusMarke, type Ort } from '../logik/ebenen'
import { leiste } from '../werte/leiste'
import { AktionKnopf } from './AktionKnopf'
import { useBelegung } from './belegung'
import { HandyMenue } from './HandyMenue'
import { seiten } from './seiten'
import { Seitenleiste } from './Seitenleiste'
import { useBrauchtDich } from './useBrauchtDich'
import { useSchmal } from './useSchmal'
import { useTastenkuerzel } from './useTastenkuerzel'
import { ZweiteEbene } from './ZweiteEbene'

// Am PC: Seitenleiste, die sich per Ziehen oder Doppelklick ein- und ausklappen lässt, daneben die zweite Ebene und der offene Bereich.
// Am Handy: oben das Menü mit Punkt und die belegbaren Knöpfe, frei ohne Fläche; darunter der Bereich.
export function Geruest({ marke }: { marke: string }) {
  const ort = ortAusMarke(marke)
  const schmal = useSchmal()
  const zahl = useBrauchtDich()
  useTastenkuerzel()
  return schmal ? <Handy ort={ort} zahl={zahl} /> : <Pc ort={ort} />
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
    <div className="himmel flex h-dvh flex-col">
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
      <div className="flex-1 overflow-auto">
        <Inhalt ort={ort} />
      </div>
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
  const [eingeklappt, setEingeklappt] = useState(false)
  const hatEbene = ebeneVon(ort.bereich).length > 0

  return (
    <div className="himmel h-dvh">
      <Group {...gemerkt} orientation="horizontal" className="h-full">
        <Panel
          id="leiste"
          panelRef={leisteRef}
          collapsible
          collapsedSize={leiste.symbole}
          minSize={leiste.offen}
          maxSize={leiste.offen}
          defaultSize={leiste.offen}
          // Die gemeldete Größe ist verlässlicher als isCollapsed(), das nach dem Neuladen veraltet sein kann.
          onResize={(groesse) => setEingeklappt(groesse.inPixels < parseInt(leiste.offen))}
          className="p-2 pr-0"
        >
          <Seitenleiste offen={ort.bereich} mitNamen={!eingeklappt} />
        </Panel>
        <Separator
          title="Ziehen oder Doppelklick klappt die Leiste ein und aus"
          onDoubleClick={() => (eingeklappt ? leisteRef.current?.resize(leiste.offen) : leisteRef.current?.collapse())}
          className="group flex w-2 items-center justify-center outline-none"
        >
          <div className="h-full w-0.5 bg-durchsichtig group-hover:bg-linie-stark group-focus-visible:bg-akzent" />
        </Separator>
        <Panel id="inhalt" className="flex">
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
        </Panel>
      </Group>
    </div>
  )
}
