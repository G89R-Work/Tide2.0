import { Suspense, useState } from 'react'
import { Group, Panel, Separator, useDefaultLayout, usePanelRef } from 'react-resizable-panels'
import { zeigtNamen } from '../logik/bereiche'
import { ebeneVon, ortAusMarke, type Ort } from '../logik/ebenen'
import { leiste } from '../werte/leiste'
import { HandyMenue } from './HandyMenue'
import { seiten } from './seiten'
import { Seitenleiste } from './Seitenleiste'
import { useBrauchtDich } from './useBrauchtDich'
import { useSchmal } from './useSchmal'
import { ZweiteEbene } from './ZweiteEbene'

// Am PC: Seitenleiste mit ziehbarer Kante, daneben die zweite Ebene und der offene Bereich.
// Am Handy: oben das Menü mit Punkt, darunter der Bereich.
export function Geruest({ marke }: { marke: string }) {
  const ort = ortAusMarke(marke)
  const schmal = useSchmal()
  const zahl = useBrauchtDich()
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
  return (
    <div className="himmel flex h-dvh flex-col">
      <header className="p-2 pb-0">
        <div className="flaeche-leiste flex items-center p-1">
          <HandyMenue ort={ort} zahl={zahl} />
        </div>
      </header>
      <div className="flex-1 overflow-auto">
        <Inhalt ort={ort} />
      </div>
    </div>
  )
}

function Pc({ ort }: { ort: Ort }) {
  const leisteRef = usePanelRef()
  const gemerkt = useDefaultLayout({ id: 'tide.leiste', storage: localStorage })
  const [breite, setBreite] = useState<number>()
  const mitNamen = zeigtNamen(breite ?? leiste.namenAb, leiste.namenAb)
  const hatEbene = ebeneVon(ort.bereich).length > 0

  return (
    <div className="himmel h-dvh">
      <Group {...gemerkt} orientation="horizontal" className="h-full">
        <Panel
          id="leiste"
          panelRef={leisteRef}
          collapsible
          collapsedSize={leiste.symbole}
          minSize={leiste.mindest}
          maxSize={leiste.hoechstens}
          defaultSize={leiste.standard}
          onResize={(groesse) => setBreite(groesse.inPixels)}
          className="p-2 pr-0"
        >
          <Seitenleiste offen={ort.bereich} mitNamen={mitNamen} />
        </Panel>
        <Separator
          title="Ziehen ändert die Breite, Doppelklick stellt sie zurück"
          onDoubleClick={() => leisteRef.current?.resize(leiste.standard)}
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
