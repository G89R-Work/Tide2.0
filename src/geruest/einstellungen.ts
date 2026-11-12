import { useSyncExternalStore } from 'react'
import type { BereichId } from '../logik/bereiche'
import { einstellungen, kurveZeigen, setze, unterschied, werteAendern, wertVon, type Einstellung, type Geraet, type Wert, type Werte } from '../logik/einstellungen'
import { merke } from './rueckgaengig'
import { aendereEinstellungen, holeEinstellungen } from '../vertrag/einstellungen'
import { istSchmal, useSchmal } from './useSchmal'

// Die Einstellungen des Nutzers, geholt und gespeichert über den Vertrag. Änderungen gelten sofort
// und lassen sich über den einen Rückgängig-Speicher zurücknehmen; scheitert das Speichern, gilt wieder der alte Stand.
type Zustand = { werte: Werte; geladen: boolean; fehler?: string }

let zustand: Zustand = { werte: {}, geladen: false }
const hoerer = new Set<() => void>()
let geholt = false

function melden(neu: Partial<Zustand>) {
  zustand = { ...zustand, ...neu }
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

const kurveLage = einstellungen.find((e) => e.id === 'kurve-lage')!

/** Liegt die Gezeitenkurve oben? Der Inhalt braucht dann den Abstand unten statt oben. */
export function useKurveOben() {
  return useEinstellung(kurveLage) === 'oben'
}

/** Ist die Kurve auf dieser Seite eingeblendet? */
export function useKurveSichtbar(bereich: BereichId) {
  return useEinstellung(kurveZeigen(bereich)) === true
}

/** Wert einer Einstellung für dieses Gerät, außerhalb von React (Befehle, Tasten). */
export function wertHier(e: Einstellung): Wert {
  return wertVon(e, zustand.werte, istSchmal() ? 'handy' : 'pc')
}

/** Einstellung für dieses Gerät setzen, außerhalb von React. Für Modi (Bearbeiten): kein Rückgängig-Schritt. */
export function setzeHier(e: Einstellung, wert: Wert) {
  einstellungenAendern(setze(zustand.werte, e, istSchmal() ? 'handy' : 'pc', wert), null)
}

/** Kurve auf der Seite ein- oder ausblenden, für dieses Gerät. Ohne Meldung (docs/konzept/03-geruest.md), aber mit Rückgängig (Alt+Z). */
export function kurveUmschalten(bereich: BereichId) {
  const e = kurveZeigen(bereich)
  const geraet: Geraet = istSchmal() ? 'handy' : 'pc'
  const an = wertVon(e, zustand.werte, geraet) === true
  einstellungenAendern(setze(zustand.werte, e, geraet, !an), `Kurve ${an ? 'aus' : 'ein'}`, true)
}

/** Speichert die Änderung von `alt` nach `neu`; scheitert es, gilt wieder `alt`. Liefert, ob es geklappt hat. */
async function speichern(alt: Werte, neu: Werte): Promise<boolean> {
  const aenderung = unterschied(alt, neu)
  if (Object.keys(aenderung).length === 0) return false
  melden({ werte: neu, fehler: undefined })
  try {
    melden({ werte: await aendereEinstellungen(aenderung) })
    return true
  } catch (f) {
    melden({ werte: alt, fehler: `${(f as Error).message}. Die Änderung wurde nicht übernommen.` })
    return false
  }
}

/**
 * Neuer Stand. Ist er gespeichert, kommt der Weg zurück in den Rückgängig-Speicher: `text` erscheint als Meldung
 * (`still`: nur Alt+Z, keine Meldung); `null` merkt nichts (Modi wie Bearbeiten).
 * Zurückgenommen werden nur die geänderten Einträge, spätere Änderungen an anderen bleiben.
 */
export function einstellungenAendern(neu: Werte, text: string | null = 'Einstellung geändert', still = false) {
  const alt = zustand.werte
  const rueck = unterschied(neu, alt)
  void speichern(alt, neu).then((ok) => {
    if (ok && text !== null) merke(text, async () => {
        await speichern(zustand.werte, werteAendern(zustand.werte, rueck))
      }, still)
  })
}
