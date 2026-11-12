import { useCallback, useSyncExternalStore } from 'react'
import { useEinstellung } from '../geruest/einstellungen'
import { einstellungen, type Geraet } from '../logik/einstellungen'
import { anordnungAusDaten, umrechnen, werkszustand, type Anordnung, type Feinheit, type KachelPlan } from '../logik/kacheln'
import { holeAnordnung, loescheAnordnung, speichereAnordnung } from '../vertrag/kacheln'

// Anordnung je Seite und Geräteart, geholt und gespeichert über den Vertrag.
// Jede Änderung gilt sofort und lässt sich rückgängig machen; scheitert das Speichern, gilt der alte Stand.
// Gezeigt wird immer im eingestellten Raster (Einstellung „Raster“); gemerkt wird jede Anordnung mit ihrem Raster.
type Stand = { anordnung: Anordnung | null; fehler?: string; kannZurueck: boolean }

const feinheit = einstellungen.find((e) => e.id === 'kacheln-feinheit')!

const staende = new Map<string, Stand>()
const vorher = new Map<string, Anordnung[]>()
const hoerer = new Set<() => void>()
const leer: Stand = { anordnung: null, kannZurueck: false }

function melden(schluessel: string, neu: Partial<Stand>) {
  const alt = staende.get(schluessel) ?? leer
  staende.set(schluessel, { ...alt, ...neu, kannZurueck: (vorher.get(schluessel)?.length ?? 0) > 0 })
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

async function speichern(seite: string, geraet: Geraet, plan: readonly KachelPlan[], alt: Anordnung, neu: Anordnung) {
  const schluessel = `${seite}/${geraet}`
  melden(schluessel, { anordnung: neu, fehler: undefined })
  try {
    // Gleich dem Werkszustand: nichts merken, damit spätere Änderungen am Werk ankommen.
    if (JSON.stringify(neu) === JSON.stringify(werkszustand(plan, geraet, neu.fein))) await loescheAnordnung(seite, geraet)
    else await speichereAnordnung(seite, geraet, { plaetze: { ...neu.plaetze }, versteckt: [...neu.versteckt], ohneHintergrund: [...neu.ohneHintergrund], fein: neu.fein })
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
  const fein: Feinheit = useEinstellung(feinheit) === 'doppelt' ? 2 : 1
  holen(seite, geraet, plan, fein)
  const stand = useSyncExternalStore(abonnieren, () => staende.get(schluessel) ?? leer)
  // Wurde das Raster umgestellt, gilt die Anordnung umgerechnet; gespeichert wird sie bei der nächsten Änderung.
  const anordnung = stand.anordnung && umrechnen(stand.anordnung, plan, geraet, fein)

  const aendern = useCallback(
    (neu: Anordnung) => {
      const gemerkt = staende.get(schluessel)?.anordnung
      if (!gemerkt) return
      const alt = umrechnen(gemerkt, plan, geraet, fein)
      if (neu === alt) return
      vorher.set(schluessel, [...(vorher.get(schluessel) ?? []), gemerkt])
      void speichern(seite, geraet, plan, gemerkt, neu)
    },
    [schluessel, seite, geraet, plan, fein],
  )

  const zurueck = useCallback(() => {
    const alt = vorher.get(schluessel)?.pop()
    const jetzt = staende.get(schluessel)?.anordnung
    if (alt && jetzt) void speichern(seite, geraet, plan, jetzt, alt)
  }, [schluessel, seite, geraet, plan])

  const zuruecksetzen = useCallback(() => aendern(werkszustand(plan, geraet, fein)), [aendern, plan, geraet, fein])

  return { ...stand, anordnung, aendern, zurueck, zuruecksetzen }
}
