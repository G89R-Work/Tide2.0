import { lazy, Suspense, useMemo } from 'react'
import { Group, Panel, useDefaultLayout, usePanelRef } from 'react-resizable-panels'
import { ChevronLeft } from 'lucide-react'
import { Knopf } from '../../bausteine/Knopf'
import { Trenner } from '../../bausteine/Trenner'
import { useMails, useOrdner } from '../../geruest/daten'
import { LeereSeite } from '../../geruest/LeereSeite'
import { useMailAuswahl, waehleMails } from '../../geruest/mailAuswahl'
import { useSchmal } from '../../geruest/useSchmal'
import { useSprungmarke } from '../../geruest/useSprungmarke'
import { ortAusMarke } from '../../logik/ebenen'
import { postfach } from '../../werte/postfach'
import { Leser } from './Leser'
import { MailListe } from './MailListe'

// Unterpunkte des Postfachs, die keine Ordner sind; sie laden erst, wenn sie offen sind (der Regel-Editor ist groß).
const ohneListe: Record<string, ReturnType<typeof lazy>> = {
  regeln: lazy(() => import('./Regeln')),
  einstellungen: lazy(() => import('./Einstellungen')),
}

// Postfach: links die Mail-Liste des gewählten Ordners, rechts der Leser; die Trennlinie dazwischen lässt sich ziehen
// (Breite im Browser gemerkt, Doppelklick stellt sie zurück). Am Handy erst die Liste; eine angetippte Mail füllt den Bildschirm.
export default function Seite() {
  const unter = ortAusMarke(useSprungmarke()).unter
  const ordner = useOrdner().ordner
  if (!unter) return <LeereSeite titel="Postfach" namen={ordner} />
  const Unterseite = ohneListe[unter]
  if (Unterseite)
    return (
      <Suspense>
        <Unterseite />
      </Suspense>
    )
  return <Ordner key={unter} ordner={unter} />
}

function Ordner({ ordner }: { ordner: string }) {
  const schmal = useSchmal()
  const breiten = useDefaultLayout({ id: 'tide.postfach.breiten', storage: localStorage })
  const liste = usePanelRef()
  if (schmal) return <Handy ordner={ordner} />
  return (
    <Group {...breiten} orientation="horizontal" className="min-h-0 flex-1">
      <Panel id="liste" panelRef={liste} defaultSize={postfach.liste} minSize={postfach.listeMin} maxSize={postfach.listeMax}>
        <MailListe ordner={ordner} />
      </Panel>
      <Trenner onDoubleClick={() => liste.current?.resize(postfach.liste)} />
      <Panel id="leser" minSize={postfach.leserMin}>
        <GewaehlterLeser ordner={ordner} />
      </Panel>
    </Group>
  )
}

/** Leser mit den gewählten Mails dieses Ordners (aus derselben geladenen Liste). */
function GewaehlterLeser({ ordner }: { ordner: string }) {
  const { mails } = useMails(ordner)
  const { ids } = useMailAuswahl(ordner)
  const gewaehlt = useMemo(() => {
    const set = new Set(ids)
    return (mails ?? []).filter((m) => set.has(m.id))
  }, [mails, ids])
  return <Leser mails={gewaehlt} ordner={ordner} />
}

/** Handy: die Liste, oder genau eine geöffnete Mail mit „Zurück“ (die Zeile bleibt der Anker in der Liste). */
function Handy({ ordner }: { ordner: string }) {
  const { ids } = useMailAuswahl(ordner)
  const offen = ids.length === 1 ? ids[0] : undefined
  if (!offen) return <MailListe ordner={ordner} />
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <Knopf art="leise" className="self-start" onClick={() => waehleMails(ordner, { ids: [], anker: offen })}>
        <ChevronLeft aria-hidden className="size-4" />
        Zurück
      </Knopf>
      <GewaehlterLeser ordner={ordner} />
    </div>
  )
}
