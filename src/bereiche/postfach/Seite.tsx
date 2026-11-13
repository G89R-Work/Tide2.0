import { useMemo } from 'react'
import { Group, Panel, useDefaultLayout, usePanelRef } from 'react-resizable-panels'
import { Trenner } from '../../bausteine/Trenner'
import { useMails, useOrdner } from '../../geruest/daten'
import { LeereSeite } from '../../geruest/LeereSeite'
import { useMailAuswahl } from '../../geruest/mailAuswahl'
import { useSchmal } from '../../geruest/useSchmal'
import { useSprungmarke } from '../../geruest/useSprungmarke'
import { ortAusMarke } from '../../logik/ebenen'
import { postfach } from '../../werte/postfach'
import { Leser } from './Leser'
import { MailListe } from './MailListe'

/** Unterpunkte des Postfachs, die keine Ordner sind. */
const ohneListe = new Set(['einstellungen', 'regeln'])

// Postfach: links die Mail-Liste des gewählten Ordners, rechts der Leser; die Trennlinie dazwischen lässt sich ziehen
// (Breite im Browser gemerkt, Doppelklick stellt sie zurück). Am Handy nur die Liste (Leser folgt mit postfach-erkannt-und-handy).
export default function Seite() {
  const unter = ortAusMarke(useSprungmarke()).unter
  const ordner = useOrdner().ordner
  if (!unter || ohneListe.has(unter)) return <LeereSeite titel="Postfach" namen={ordner} />
  return <Ordner key={unter} ordner={unter} />
}

function Ordner({ ordner }: { ordner: string }) {
  const schmal = useSchmal()
  const breiten = useDefaultLayout({ id: 'tide.postfach.breiten', storage: localStorage })
  const liste = usePanelRef()
  if (schmal) return <MailListe ordner={ordner} />
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
