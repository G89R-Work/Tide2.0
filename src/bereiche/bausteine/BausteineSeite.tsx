import { Aufklapp, AufklappInhalt, AufklappKnopf } from '../../bausteine/Aufklapp'
import { Flaeche } from '../../bausteine/Flaeche'
import { Group, Panel } from 'react-resizable-panels'
import { Trenner } from '../../bausteine/Trenner'
import { Knopf } from '../../bausteine/Knopf'

// Schaufenster: alle Spielarten von Knopf und Fläche, je Design eine Spalte.
const designs = [
  { id: 'glut', name: 'Glut' },
  { id: 'tinte', name: 'Tinte' },
] as const
const arten = ['standard', 'haupt', 'leise', 'symbol'] as const
const groessen = ['normal', 'klein'] as const
const farben = [
  'bg-akzent', 'bg-akzent-2', 'bg-warnung', 'bg-erfolg', 'bg-raum-1', 'bg-raum-2', 'bg-raum-3', 'bg-regen',
]

function Plus() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

function Spalte({ id, name }: (typeof designs)[number]) {
  return (
    <section data-design={id} className="himmel relative isolate overflow-hidden p-4 sm:p-6">
      <div className="akzent-verlauf absolute top-16 right-8 -z-10 size-40 rounded-voll opacity-70" />
      <h2 className="text-2xl font-semibold">{name}</h2>

      <p className="beschriftung mt-6 mb-2">Knopf</p>
      <Flaeche className="grid gap-4 p-4">
        {groessen.map((groesse) => (
          <div key={groesse} className="flex flex-wrap items-center gap-2">
            {arten.map((art) =>
              art === 'symbol' ? (
                <Knopf key={art} art={art} groesse={groesse} aria-label="Neu">
                  <Plus />
                </Knopf>
              ) : (
                <Knopf key={art} art={art} groesse={groesse}>
                  {art === 'haupt' ? 'Speichern' : art === 'leise' ? 'Abbrechen' : 'Bearbeiten'}
                </Knopf>
              ),
            )}
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2">
          <Knopf disabled>Gesperrt</Knopf>
          <Knopf art="haupt" disabled>
            Gesperrt
          </Knopf>
          <Knopf alsKind art="leise">
            <a href="#">Als Link</a>
          </Knopf>
        </div>
      </Flaeche>

      <p className="beschriftung mt-6 mb-2">Fläche</p>
      <div className="grid gap-3">
        <Flaeche art="leiste" className="p-4">
          <p className="font-medium">Leiste</p>
          <p className="text-sm text-text-gedaempft">Echter Weichzeichner, für Seitenleiste und Kurve.</p>
        </Flaeche>
        <Flaeche art="kachel" className="p-4">
          <p className="font-medium">Kachel</p>
          <p className="text-sm text-text-gedaempft">Dichte Tönung ohne Weichzeichner.</p>
        </Flaeche>
        <Flaeche art="schwebend" className="p-4">
          <p className="font-medium">Schwebend</p>
          <p className="text-sm text-text-gedaempft">Für Dialoge und Menüs.</p>
          <div className="mt-3 flex justify-end gap-2">
            <Knopf art="leise" groesse="klein">Abbrechen</Knopf>
            <Knopf art="haupt" groesse="klein">Übernehmen</Knopf>
          </div>
        </Flaeche>
      </div>

      <p className="beschriftung mt-6 mb-2">Trenner</p>
      <Flaeche className="h-24 overflow-hidden">
        <Group orientation="horizontal" className="h-full">
          <Panel id="links" minSize="20%" className="flex items-center justify-center text-sm text-text-gedaempft">
            Ziehen
          </Panel>
          <Trenner title="Ziehen ändert die Breite" />
          <Panel id="rechts" minSize="20%" className="flex items-center justify-center text-sm text-text-gedaempft">
            Für Seitenleiste und Kurve
          </Panel>
        </Group>
      </Flaeche>

      <p className="beschriftung mt-6 mb-2">Aufklapp</p>
      <Aufklapp>
        <AufklappKnopf asChild>
          <Knopf>Öffnen</Knopf>
        </AufklappKnopf>
        <AufklappInhalt align="start" className="p-4 text-sm">
          Karte am Knopf
        </AufklappInhalt>
      </Aufklapp>

      <p className="beschriftung mt-6 mb-2">Text und Farben</p>
      <Flaeche className="p-4">
        <p>Text hell</p>
        <p className="text-text-gedaempft">Text gedämpft</p>
        <p className="text-text-blass">Text blass</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {farben.map((farbe) => (
            <span key={farbe} title={farbe} className={`size-6 rounded-voll ${farbe}`} />
          ))}
        </div>
      </Flaeche>
    </section>
  )
}

export default function BausteineSeite() {
  return (
    <main className="grid min-h-dvh md:grid-cols-2">
      {designs.map((d) => (
        <Spalte key={d.id} {...d} />
      ))}
    </main>
  )
}
