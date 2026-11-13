import type { BereichId } from '../logik/bereiche'
import { einstellung, kurveZeigen, setze, unterschied, werteAendern, wertVon, type Einstellung, type Geraet, type Wert, type Werte } from '../logik/einstellungen'
import { merke, type Schritt } from './rueckgaengig'
import { einstellungenJetzt, einstellungenSpeichernVon, useEinstellungen } from './daten'
import { istSchmal, useSchmal } from './useSchmal'

// Die Einstellungen des Nutzers, geholt und gespeichert über `daten.ts`. Änderungen gelten sofort
// und lassen sich über den einen Rückgängig-Speicher zurücknehmen; scheitert das Speichern, gilt wieder der alte Stand.

/** Geräteart dieses Fensters: die Handy-Ansicht zählt als Handy. */
export function useGeraet(): Geraet {
  return useSchmal() ? 'handy' : 'pc'
}

/** Wert einer Einstellung für dieses Gerät, solange nichts geladen ist der Standard. */
export function useEinstellung<E extends Einstellung>(e: E) {
  return wertVon(e, useEinstellungen().werte, useGeraet())
}

const kurveLage = einstellung('kurve-lage')

/** Liegt die Gezeitenkurve oben? Der Inhalt braucht dann den Abstand unten statt oben. */
export function useKurveOben() {
  return useEinstellung(kurveLage) === 'oben'
}

const kurveEingeklappt = einstellung('kurve-eingeklappt')

/** Ist die Kurve eingeklappt (nur ein Rand guckt hervor)? Gemerkt je Gerät. */
export function useKurveEingeklappt() {
  return useEinstellung(kurveEingeklappt)
}

/** Kurve ein- oder ausklappen (gemerkt je Gerät, lässt sich zurücknehmen). Ändert nichts, wenn es schon so ist. */
export function klappeKurve(zu: boolean) {
  if (wertHier(kurveEingeklappt) !== zu) setzeHier(kurveEingeklappt, zu, { text: zu ? 'Kurve eingeklappt' : 'Kurve aufgeklappt', still: true })
}

/** Ist die Kurve auf dieser Seite eingeblendet? */
export function useKurveSichtbar(bereich: BereichId) {
  return useEinstellung(kurveZeigen(bereich))
}

/** Wert einer Einstellung für dieses Gerät, außerhalb von React (Befehle, Tasten). */
export function wertHier(e: Einstellung): Wert {
  return wertVon(e, einstellungenJetzt(), istSchmal() ? 'handy' : 'pc')
}

/** Einstellung für dieses Gerät setzen, außerhalb von React. Ohne `schritt` (Modi wie Bearbeiten) kein Rückgängig-Schritt. */
export function setzeHier(e: Einstellung, wert: Wert, schritt: Pick<Schritt, 'text' | 'still' | 'bereich'> | null = null) {
  einstellungenAendern(setze(einstellungenJetzt(), e, istSchmal() ? 'handy' : 'pc', wert), schritt)
}

/** Kurve auf der Seite ein- oder ausblenden, für dieses Gerät. Ohne Meldung (docs/konzept/03-geruest.md), aber mit Rückgängig (Alt+Z). */
export function kurveUmschalten(bereich: BereichId) {
  const e = kurveZeigen(bereich)
  const geraet: Geraet = istSchmal() ? 'handy' : 'pc'
  const an = wertVon(e, einstellungenJetzt(), geraet) === true
  einstellungenAendern(setze(einstellungenJetzt(), e, geraet, !an), { text: `Kurve ${an ? 'aus' : 'ein'}`, still: true })
}

/**
 * Neuer Stand. Ist er gespeichert, kommt er in den Rückgängig-Speicher (`schritt`: Text, Seite, still);
 * `null` merkt nichts (Modi wie Bearbeiten). Zurück und vor wirken nur auf die geänderten Einträge, andere bleiben.
 */
export function einstellungenAendern(neu: Werte, schritt: Pick<Schritt, 'text' | 'still' | 'bereich'> | null) {
  const alt = einstellungenJetzt()
  const hin = unterschied(alt, neu)
  const rueck = unterschied(neu, alt)
  const anwenden = async (a: typeof hin) => {
    await einstellungenSpeichernVon(einstellungenJetzt(), werteAendern(einstellungenJetzt(), a))
  }
  void einstellungenSpeichernVon(alt, neu).then((ok) => {
    if (ok && schritt) merke({ ...schritt, zurueck: () => anwenden(rueck), vor: () => anwenden(hin) })
  })
}
