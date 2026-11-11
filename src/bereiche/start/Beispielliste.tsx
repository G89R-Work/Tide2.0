import { useEffect, useState } from 'react'
import { Flaeche } from '../../bausteine/Flaeche'
import { Knopf } from '../../bausteine/Knopf'
import { aendereEintrag, holeEintraege, type Eintrag } from '../../vertrag/eintrag'

// Beweis für Vertrag und Attrappe: Liste kommt über den Vertrag, Abhaken übersteht das Neuladen.
// Rückgängig: derselbe Eintrag noch einmal antippen.
export function Beispielliste() {
  const [liste, setListe] = useState<Eintrag[]>()
  const [fehler, setFehler] = useState<string>()

  useEffect(() => {
    holeEintraege().then(setListe, (f: Error) => setFehler(f.message))
  }, [])

  async function umschalten(e: Eintrag) {
    setFehler(undefined)
    try {
      const neu = await aendereEintrag(e.id, { erledigt: !e.erledigt })
      setListe((alt) => alt?.map((x) => (x.id === neu.id ? neu : x)))
    } catch (f) {
      setFehler((f as Error).message)
    }
  }

  return (
    <Flaeche className="mt-8 w-full max-w-sm p-2 text-left">
      {fehler && <p className="p-2 text-sm text-warnung">{fehler}</p>}
      {!liste && !fehler && <p className="p-2 text-sm text-text-gedaempft">Lädt …</p>}
      <ul>
        {liste?.map((e) => (
          <li key={e.id}>
            <Knopf
              art="leise"
              aria-pressed={e.erledigt}
              onClick={() => umschalten(e)}
              className="w-full justify-start text-text"
            >
              <span
                aria-hidden
                className={`grid size-5 place-items-center rounded-voll border border-linie-stark text-xs ${e.erledigt ? 'bg-erfolg text-auf-akzent' : ''}`}
              >
                {e.erledigt ? '✓' : ''}
              </span>
              <span className={e.erledigt ? 'text-text-blass line-through' : ''}>{e.titel}</span>
            </Knopf>
          </li>
        ))}
      </ul>
    </Flaeche>
  )
}
