import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { merke } from '../geruest/rueckgaengig'
import type { Geraet } from '../logik/einstellungen'
import { anordnungAusDaten, aufBildschirm, verankern, werkszustand, type Anordnung, type KachelPlan, type Raster } from '../logik/kacheln'
import { holeAnordnung, loescheAnordnung, speichereAnordnung } from '../vertrag/kacheln'

// Anordnung je Seite und Geräteart, geholt und gespeichert über den Vertrag.
// Jede Änderung gilt sofort und kommt in den einen Rückgängig-Speicher; scheitert das Speichern, gilt der alte Stand.
type Stand = { anordnung: Anordnung | null; fehler?: string }

const staende = new Map<string, Stand>()
const hoerer = new Set<() => void>()
const leer: Stand = { anordnung: null }

function melden(schluessel: string, neu: Partial<Stand>) {
  const alt = staende.get(schluessel) ?? leer
  staende.set(schluessel, { ...alt, ...neu })
  for (const h of hoerer) h()
}

function holen(seite: string, geraet: Geraet, plan: readonly KachelPlan[]) {
  const schluessel = `${seite}/${geraet}`
  if (staende.has(schluessel)) return
  staende.set(schluessel, leer)
  holeAnordnung(seite, geraet).then(
    (roh) => melden(schluessel, { anordnung: anordnungAusDaten(roh, plan, geraet) }),
    (f: Error) => melden(schluessel, { anordnung: werkszustand(plan, geraet), fehler: `${f.message}. Es gilt der Werkszustand.` }),
  )
}

/** Speichert `neu`; scheitert es, gilt wieder `alt`. Liefert, ob es geklappt hat. */
async function speichern(seite: string, geraet: Geraet, plan: readonly KachelPlan[], alt: Anordnung, neu: Anordnung): Promise<boolean> {
  const schluessel = `${seite}/${geraet}`
  melden(schluessel, { anordnung: neu, fehler: undefined })
  try {
    // Gleich dem Werkszustand: nichts merken, damit spätere Änderungen am Werk ankommen.
    if (JSON.stringify(neu) === JSON.stringify(werkszustand(plan, geraet))) await loescheAnordnung(seite, geraet)
    else await speichereAnordnung(seite, geraet, { plaetze: { ...neu.plaetze }, versteckt: [...neu.versteckt], ohneHintergrund: [...neu.ohneHintergrund] })
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

/** Anordnung einer Seite auf dem Bildschirm mit dem Raster `spalten` × `zeilen`. Gezeigt und bearbeitet wird von oben links gezählt,
 *  gemerkt angedockt (oben oder unten, links oder rechts, `verankern`), damit sie auf jedem Bildschirm passt. */
export function useAnordnung(seite: string, geraet: Geraet, plan: readonly KachelPlan[], spalten: number, zeilen: number) {
  const schluessel = `${seite}/${geraet}`
  holen(seite, geraet, plan)
  const stand = useSyncExternalStore(abonnieren, () => staende.get(schluessel) ?? leer)
  const raster: Raster = useMemo(() => ({ geraet, spalten, zeilen }), [geraet, spalten, zeilen])
  const gemerkt = stand.anordnung
  const anordnung = useMemo(() => gemerkt && aufBildschirm(gemerkt, plan, raster), [gemerkt, plan, raster])

  const aendern = useCallback(
    (neu: Anordnung) => {
      const gemerkt = staende.get(schluessel)?.anordnung
      if (!gemerkt || !anordnung || neu === anordnung) return
      const angedockt = verankern(neu, raster)
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
    [schluessel, seite, geraet, plan, anordnung, raster],
  )

  const zuruecksetzen = useCallback(() => aendern(aufBildschirm(werkszustand(plan, geraet), plan, raster)), [aendern, plan, geraet, raster])

  return { ...stand, anordnung, raster, aendern, zuruecksetzen }
}
