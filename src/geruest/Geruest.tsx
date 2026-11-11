import { Suspense, useState } from 'react'
import { Group, Panel, Separator, useDefaultLayout, usePanelRef } from 'react-resizable-panels'
import { bereichAusMarke, zeigtNamen } from '../logik/bereiche'
import { leiste } from '../werte/leiste'
import { seiten } from './seiten'
import { Seitenleiste } from './Seitenleiste'

// Seitenleiste mit ziehbarer Kante, daneben der offene Bereich.
// Unter der Mindestbreite rastet die Leiste auf Symbole ein; Doppelklick auf die Kante = Standardbreite.
export function Geruest({ marke }: { marke: string }) {
  const offen = bereichAusMarke(marke)
  const Seite = seiten[offen]
  const leisteRef = usePanelRef()
  const gemerkt = useDefaultLayout({ id: 'tide.leiste', storage: localStorage })
  const schmal = innerWidth < leiste.schmalUnter
  const [breite, setBreite] = useState<number>()
  const mitNamen = zeigtNamen(breite ?? (schmal ? 0 : leiste.namenAb), leiste.namenAb)

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
          defaultSize={schmal ? leiste.symbole : leiste.standard}
          onResize={(groesse) => setBreite(groesse.inPixels)}
          className="p-2 pr-0"
        >
          <Seitenleiste offen={offen} mitNamen={mitNamen} />
        </Panel>
        <Separator
          title="Ziehen ändert die Breite, Doppelklick stellt sie zurück"
          onDoubleClick={() => leisteRef.current?.resize(leiste.standard)}
          className="group flex w-2 items-center justify-center outline-none"
        >
          <div className="h-full w-0.5 bg-durchsichtig group-hover:bg-linie-stark group-focus-visible:bg-akzent" />
        </Separator>
        <Panel id="inhalt" className="overflow-auto">
          <main>
            <Suspense>
              <Seite />
            </Suspense>
          </main>
        </Panel>
      </Group>
    </div>
  )
}
