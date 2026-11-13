import { addDays, addHours, startOfDay } from 'date-fns'
import { useEffect, useSyncExternalStore } from 'react'
import { einstellung } from '../logik/einstellungen'
import { ebbeFenster, erinnerungen, sichtbare, ungelesen, wartende, type Meldung } from '../logik/meldungen'
import { termineImZeitraum } from '../logik/gezeiten'
import { useTermine } from './daten'
import { useEinstellung } from './einstellungen'
import { useMinute } from './useMinute'
import { MELDUNG_MS } from '../werte/bewegung'

// Meldungen für ganz Tide (docs/konzept/03-geruest.md „Meldungen"). Wer etwas zu melden hat, ruft `melde`.
// Eine neue Meldung steht sechs Sekunden in der Kopfzeile der Kurve (oder am unteren Rand, wenn die Kurve aus ist)
// und faltet sich dann in die Glocke. Im Ebbe-Modus warten Meldungen aus der Ruhezeit bis zum Morgen (src/logik/meldungen.ts).
type Zustand = { liste: readonly Meldung[]; gefaltet: ReadonlySet<string>; gelesenBis: number; fenster?: string }

const GLOCKE = 'tide.glocke'
const gelesenGemerkt = () => {
  try {
    return Number(localStorage.getItem(GLOCKE)) || 0
  } catch {
    return 0
  }
}

let zustand: Zustand = { liste: [], gefaltet: new Set(), gelesenBis: gelesenGemerkt() }
const hoerer = new Set<() => void>()
const setze = (neu: Partial<Zustand>) => {
  zustand = { ...zustand, ...neu }
  hoerer.forEach((h) => h())
}
const abo = (h: () => void) => {
  hoerer.add(h)
  return () => hoerer.delete(h)
}

/** Neue Meldung; dieselbe Kennung kommt nur einmal. */
export function melde(m: Meldung) {
  if (zustand.liste.some((alt) => alt.id === m.id)) return
  setze({ liste: [...zustand.liste.slice(-99), m] })
}

/** Nach sechs Sekunden in die Glocke. */
export const falte = (ids: readonly string[]) => setze({ gefaltet: new Set([...zustand.gefaltet, ...ids]) })

/** Glocke geöffnet: alles bis jetzt gilt als gesehen. */
export function gelesen(bis: number) {
  try {
    localStorage.setItem(GLOCKE, String(bis))
  } catch {
    // Ohne Speicher (privates Fenster) zählt die Glocke nach dem Neuladen wieder; das schadet nicht.
  }
  setze({ gelesenBis: bis })
}

const ebbeModus = einstellung('ebbe-modus')

/** Was gerade gilt: Meldungen in der Glocke, wartende, ungelesene, die frische für die Kopfzeile und das Ebbe-Fenster. */
export function useMeldungen() {
  const z = useSyncExternalStore(abo, () => zustand)
  const jetzt = useMinute()
  const ebbe = useEinstellung(ebbeModus)
  const da = sichtbare(z.liste, jetzt, ebbe)
  const frisch = da.filter((m) => !z.gefaltet.has(m.id))
  return {
    da,
    frisch: frisch[0],
    frischeIds: frisch.map((m) => m.id),
    wartend: wartende(z.liste, jetzt, ebbe).length,
    neu: ungelesen(z.liste, jetzt, ebbe, z.gelesenBis),
    fenster: z.fenster,
  }
}

/** Faltet die frischen Meldungen nach sechs Sekunden in die Glocke. Läuft einmal im Gerüst. */
export function useFalten(frischeIds: readonly string[]) {
  const schluessel = frischeIds.join('|')
  useEffect(() => {
    if (!schluessel) return
    const t = setTimeout(() => falte(schluessel.split('|')), MELDUNG_MS)
    return () => clearTimeout(t)
  }, [schluessel])
}

/** Erinnerungen 15 Minuten vor Terminen und das Ebbe-Fenster der nächsten 24 Stunden, jede Minute neu gerechnet.
 *  Läuft unabhängig von der Kurve, damit auch bei ausgeblendeter Kurve erinnert wird. */
export function useErinnerungen() {
  const jetzt = useMinute()
  const tag = startOfDay(jetzt)
  const { liste, fehler } = useTermine(tag, addDays(tag, 2))
  useEffect(() => {
    if (fehler) melde({ id: `fehler:erinnerungen:${fehler}`, text: `Erinnerungen nicht geladen: ${fehler}`, ankunft: Date.now(), wichtig: true })
  }, [fehler])
  useEffect(() => {
    if (!liste) return
    const termine = termineImZeitraum(liste, jetzt, addHours(jetzt, 24))
    erinnerungen(termine, jetzt).forEach(melde)
    const zeiten = termine.flatMap((t) => (t.beginn && t.ende ? [{ beginn: new Date(t.beginn), ende: new Date(t.ende) }] : []))
    setze({ fenster: ebbeFenster(zeiten, jetzt) })
  }, [liste, jetzt])
}
