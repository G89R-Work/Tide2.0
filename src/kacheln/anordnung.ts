import { useCallback, useSyncExternalStore } from 'react'
import type { Geraet } from '../logik/einstellungen'
import { anordnungAusDaten, werkszustand, type Anordnung, type KachelPlan } from '../logik/kacheln'
import { holeAnordnung, loescheAnordnung, speichereAnordnung } from '../vertrag/kacheln'

// Anordnung je Seite und Geräteart, geholt und gespeichert über den Vertrag.
// Jede Änderung gilt sofort und lässt sich rückgängig machen; scheitert das Speichern, gilt der alte Stand.
type Stand = { anordnung: Anordnung | null; fehler?: string; kannZurueck: boolean }

const staende = new Map<string, Stand>()
const vorher = new Map<string, Anordnung[]>()
const hoerer = new Set<() => void>()
const leer: Stand = { anordnung: null, kannZurueck: false }

function melden(schluessel: string, neu: Partial<Stand>) {
  const alt = staende.get(schluessel) ?? leer
  staende.set(schluessel, { ...alt, ...neu, kannZurueck: (vorher.get(schluessel)?.length ?? 0) > 0 })
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

async function speichern(seite: string, geraet: Geraet, plan: readonly KachelPlan[], alt: Anordnung, neu: Anordnung) {
  const schluessel = `${seite}/${geraet}`
  melden(schluessel, { anordnung: neu, fehler: undefined })
  try {
    // Gleich dem Werkszustand: nichts merken, damit spätere Änderungen am Werk ankommen.
    if (JSON.stringify(neu) === JSON.stringify(werkszustand(plan, geraet))) await loescheAnordnung(seite, geraet)
    else await speichereAnordnung(seite, geraet, { plaetze: { ...neu.plaetze }, versteckt: [...neu.versteckt], ohneHintergrund: [...neu.ohneHintergrund] })
  } catch (f) {
    const stapel = vorher.get(schluessel)
    if (stapel?.at(-1) === alt) stapel.pop()
    melden(schluessel, { anordnung: alt, fehler: `${(f as Error).message}. Die Änderung wurde nicht übernommen.` })
  }
}

const abonnieren = (h: () => void) => {
  hoerer.add(h)
  return () => hoerer.delete(h)
}

export function useAnordnung(seite: string, geraet: Geraet, plan: readonly KachelPlan[]) {
  const schluessel = `${seite}/${geraet}`
  holen(seite, geraet, plan)
  const stand = useSyncExternalStore(abonnieren, () => staende.get(schluessel) ?? leer)

  const aendern = useCallback(
    (neu: Anordnung) => {
      const alt = staende.get(schluessel)?.anordnung
      if (!alt || neu === alt) return
      vorher.set(schluessel, [...(vorher.get(schluessel) ?? []), alt])
      void speichern(seite, geraet, plan, alt, neu)
    },
    [schluessel, seite, geraet, plan],
  )

  const zurueck = useCallback(() => {
    const alt = vorher.get(schluessel)?.pop()
    const jetzt = staende.get(schluessel)?.anordnung
    if (alt && jetzt) void speichern(seite, geraet, plan, jetzt, alt)
  }, [schluessel, seite, geraet, plan])

  const zuruecksetzen = useCallback(() => aendern(werkszustand(plan, geraet)), [aendern, plan, geraet])

  return { ...stand, aendern, zurueck, zuruecksetzen }
}
