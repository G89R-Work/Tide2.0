import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Eingabe, Textfeld } from '../../bausteine/Eingabe'
import { Knopf } from '../../bausteine/Knopf'
import { aendereEintragMitSchritt, eintragMitSchritt, useEintraege, useEintragFehler } from '../../geruest/daten'
import type { Eintrag } from '../../vertrag/eintrag'

// Wissen (docs/konzept/17-arbeit.md): Notizen im Raum Arbeit; sie erscheinen nicht bei den privaten Notizen.
export function Wissen() {
  const { liste, fehler } = useEintraege()
  const speichernFehler = useEintragFehler()
  const [offen, setOffen] = useState<string | null>(null)
  const notizen = (liste ?? []).filter((e) => e.art === 'notiz' && e.raum === 'arbeit')

  const neu = async () => {
    const id = `notiz-${crypto.randomUUID().slice(0, 8)}`
    if (await eintragMitSchritt({ id, art: 'notiz', titel: 'Neue Notiz', raum: 'arbeit', text: '' }, false, 'Notiz angelegt', 'arbeit')) setOffen(id)
  }

  return (
    <section id="arbeit-wissen" aria-label="Wissen" className="flaeche-kachel flex flex-col gap-2 p-4">
      <header className="flex items-center gap-2">
        <h2 className="min-w-0 flex-1 text-lg font-semibold">Wissen</h2>
        <Knopf groesse="klein" onClick={() => void neu()}>
          <Plus aria-hidden className="size-4" />
          Neue Notiz
        </Knopf>
      </header>
      {(fehler ?? speichernFehler) && <p className="text-sm text-warnung">{fehler ?? speichernFehler}</p>}
      {notizen.length === 0 && <p className="text-sm text-text-gedaempft">Keine Notizen</p>}
      <ul className="flex flex-col">
        {notizen.map((n) =>
          offen === n.id ? (
            <li key={n.id} className="border-b border-linie py-2 last:border-b-0">
              <Bearbeiten notiz={n} fertig={() => setOffen(null)} />
            </li>
          ) : (
            <li key={n.id} className="border-b border-linie last:border-b-0">
              <button type="button" onClick={() => setOffen(n.id)} className="drueck flex w-full cursor-pointer flex-col gap-0.5 rounded-knopf px-1 py-2 text-left outline-none hover:bg-knopf-ton focus-visible:ring-2 focus-visible:ring-akzent">
                <span className="truncate text-sm font-medium">{n.titel}</span>
                {n.text && <span className="line-clamp-2 text-xs whitespace-pre-line text-text-gedaempft">{n.text}</span>}
              </button>
            </li>
          ),
        )}
      </ul>
    </section>
  )
}

/** Titel und Text bearbeiten; „Fertig“ speichert beides als einen Schritt. */
function Bearbeiten({ notiz, fertig }: { notiz: Eintrag; fertig: () => void }) {
  const [titel, setTitel] = useState(notiz.titel)
  const [text, setText] = useState(notiz.text ?? '')
  const speichern = async () => {
    const aenderung = { ...(titel !== notiz.titel ? { titel } : {}), ...(text !== (notiz.text ?? '') ? { text } : {}) }
    if (Object.keys(aenderung).length === 0 || (await aendereEintragMitSchritt(notiz, aenderung, `Notiz „${titel}“ geändert`, 'arbeit'))) fertig()
  }
  const loeschen = () => {
    const { id, art, titel: t, raum, text: x } = notiz
    void eintragMitSchritt({ id, art, titel: t, ...(raum ? { raum } : {}), ...(x !== undefined ? { text: x } : {}) }, true, `Notiz „${t}“ gelöscht`, 'arbeit')
  }
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        void speichern()
      }}
    >
      <Eingabe aria-label="Titel" value={titel} onChange={(e) => setTitel(e.target.value)} autoFocus />
      <Textfeld aria-label="Text" value={text} rows={6} onChange={(e) => setText(e.target.value)} />
      <div className="flex justify-end gap-2">
        <Knopf art="symbol" groesse="klein" aria-label="Notiz löschen" title="Löschen" onClick={loeschen}>
          <Trash2 aria-hidden className="size-4" />
        </Knopf>
        <Knopf groesse="klein" type="submit" disabled={!titel.trim()}>
          Fertig
        </Knopf>
      </div>
    </form>
  )
}
