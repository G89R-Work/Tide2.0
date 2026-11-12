import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useEinstellung } from '../geruest/einstellungen'
import { merke } from '../geruest/rueckgaengig'
import { einstellungen, type Geraet } from '../logik/einstellungen'
import { anordnungAusDaten, aufBildschirm, umrechnen, verankern, werkszustand, type Anordnung, type Feinheit, type KachelPlan } from '../logik/kacheln'
import { holeAnordnung, loescheAnordnung, speichereAnordnung } from '../vertrag/kacheln'

// Anordnung je Seite und Geräteart, geholt und gespeichert über den Vertrag.
// Jede Änderung gilt sofort und kommt in den einen Rückgängig-Speicher; scheitert das Speichern, gilt der alte Stand.
// Gezeigt wird immer im eingestellten Raster (Einstellung „Raster“); gemerkt wird jede Anordnung mit ihrem Raster.
type Stand = { anordnung: Anordnung | null; fehler?: string }

const feinheit = einstellungen.find((e) => e.id === 'kacheln-feinheit')!

const staende = new Map<string, Stand>()
const hoerer = new Set<() => void>()
const leer: Stand = { anordnung: null }

function melden(schluessel: string, neu: Partial<Stand>) {
  const alt = staende.get(schluessel) ?? leer
  staende.set(schluessel, { ...alt, ...neu })
  for (const h of hoerer) h()
}

function holen(seite: string, geraet: Geraet, plan: readonly KachelPlan[], fein: Feinheit) {
  const schluessel = `${seite}/${geraet}`
  if (staende.has(schluessel)) return
  staende.set(schluessel, leer)
  holeAnordnung(seite, geraet).then(
    (roh) => melden(schluessel, { anordnung: anordnungAusDaten(roh, plan, geraet, fein) }),
    (f: Error) => melden(schluessel, { anordnung: werkszustand(plan, geraet, fein), fehler: `${f.message}. Es gilt der Werkszustand.` }),
  )
}

/** Speichert `neu`; scheitert es, gilt wieder `alt`. Liefert, ob es geklappt hat. */
async function speichern(seite: string, geraet: Geraet, plan: readonly KachelPlan[], alt: Anordnung, neu: Anordnung): Promise<boolean> {
  const schluessel = `${seite}/${geraet}`
  melden(schluessel, { anordnung: neu, fehler: undefined })
  try {
    // Gleich dem Werkszustand: nichts merken, damit spätere Änderungen am Werk ankommen.
    if (JSON.stringify(neu) === JSON.stringify(werkszustand(plan, geraet, neu.fein))) await loescheAnordnung(seite, geraet)
    else await speichereAnordnung(seite, geraet, { plaetze: { ...neu.plaetze }, versteckt: [...neu.versteckt], ohneHintergrund: [...neu.ohneHintergrund], fein: neu.fein })
    return true
  } catch (f) {
    melden(schluessel, { anordnung: alt, fehler: `${(f as Error).message}. Die Änderung wurde nicht übernommen.` })
    return false
  }
}

const abonnieren = (h: () => void) => {
  hoerer.add(h)
  return () => hoerer.delete(h)
}

/** Anordnung einer Seite auf dem Bildschirm mit `zeilen` Zeilen. Gezeigt und bearbeitet wird von oben gezählt,
 *  gemerkt angedockt (oben oder unten, `verankern`), damit sie auf jedem Bildschirm passt. */
export function useAnordnung(seite: string, geraet: Geraet, plan: readonly KachelPlan[], zeilen: number) {
  const schluessel = `${seite}/${geraet}`
  const fein: Feinheit = useEinstellung(feinheit) === 'doppelt' ? 2 : 1
  holen(seite, geraet, plan, fein)
  const stand = useSyncExternalStore(abonnieren, () => staende.get(schluessel) ?? leer)
  // Wurde das Raster umgestellt, gilt die Anordnung umgerechnet; gespeichert wird sie bei der nächsten Änderung.
  const gemerkt = stand.anordnung
  const anordnung = useMemo(() => gemerkt && aufBildschirm(umrechnen(gemerkt, plan, geraet, fein), plan, geraet, zeilen), [gemerkt, plan, geraet, fein, zeilen])

  const aendern = useCallback(
    (neu: Anordnung) => {
      const gemerkt = staende.get(schluessel)?.anordnung
      if (!gemerkt || !anordnung || neu === anordnung) return
      const angedockt = verankern(neu, zeilen)
      void speichern(seite, geraet, plan, gemerkt, angedockt).then((ok) => {
        if (!ok) return
        // Zurück und vor setzen den gemerkten Stand; die Knöpfe der Seite wirken nur auf ihre eigenen Kacheln.
        const auf = (ziel: Anordnung) => async () => {
          const jetzt = staende.get(schluessel)?.anordnung
          if (jetzt) await speichern(seite, geraet, plan, jetzt, ziel)
        }
        merke({ text: 'Kacheln geändert', bereich: seite, zurueck: auf(gemerkt), vor: auf(angedockt) })
      })
    },
    [schluessel, seite, geraet, plan, anordnung, zeilen],
  )

  const zuruecksetzen = useCallback(() => aendern(aufBildschirm(werkszustand(plan, geraet, fein), plan, geraet, zeilen)), [aendern, plan, geraet, fein, zeilen])

  return { ...stand, anordnung, aendern, zuruecksetzen }
}
