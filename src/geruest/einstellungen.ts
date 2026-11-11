import { useSyncExternalStore } from 'react'
import { unterschied, wertVon, type Einstellung, type Geraet, type Werte } from '../logik/einstellungen'
import { aendereEinstellungen, holeEinstellungen } from '../vertrag/einstellungen'
import { useSchmal } from './useSchmal'

// Die Einstellungen des Nutzers, geholt und gespeichert über den Vertrag. Änderungen gelten sofort
// und lassen sich rückgängig machen; scheitert das Speichern, gilt wieder der Stand des Servers.
type Zustand = { werte: Werte; geladen: boolean; fehler?: string; kannZurueck: boolean }

let zustand: Zustand = { werte: {}, geladen: false, kannZurueck: false }
const vorher: Werte[] = []
const hoerer = new Set<() => void>()
let geholt = false

function melden(neu: Partial<Zustand>) {
  zustand = { ...zustand, ...neu, kannZurueck: vorher.length > 0 }
  for (const h of hoerer) h()
}

function holen() {
  if (geholt) return
  geholt = true
  holeEinstellungen().then(
    (werte) => melden({ werte, geladen: true }),
    (f: Error) => melden({ geladen: true, fehler: f.message }),
  )
}

const abonnieren = (h: () => void) => {
  holen()
  hoerer.add(h)
  return () => hoerer.delete(h)
}

export function useEinstellungen() {
  return useSyncExternalStore(abonnieren, () => zustand)
}

/** Geräteart dieses Fensters: die Handy-Ansicht zählt als Handy. */
export function useGeraet(): Geraet {
  return useSchmal() ? 'handy' : 'pc'
}

/** Wert einer Einstellung für dieses Gerät, solange nichts geladen ist der Standard. */
export function useEinstellung(e: Einstellung) {
  return wertVon(e, useEinstellungen().werte, useGeraet())
}

async function speichern(alt: Werte, neu: Werte) {
  const aenderung = unterschied(alt, neu)
  if (Object.keys(aenderung).length === 0) return
  melden({ werte: neu, fehler: undefined })
  try {
    melden({ werte: await aendereEinstellungen(aenderung) })
  } catch (f) {
    if (vorher.at(-1) === alt) vorher.pop()
    melden({ werte: alt, fehler: `${(f as Error).message}. Die Änderung wurde nicht übernommen.` })
  }
}

/** Neuer Stand; der alte kommt auf den Stapel für „Rückgängig". */
export function einstellungenAendern(neu: Werte) {
  const alt = zustand.werte
  if (Object.keys(unterschied(alt, neu)).length === 0) return
  vorher.push(alt)
  void speichern(alt, neu)
}

export function einstellungenZurueck() {
  const alt = vorher.pop()
  if (alt) void speichern(zustand.werte, alt)
}
