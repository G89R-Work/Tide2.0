// Der eine Weg zu den Daten (PRUEFUNG E1): je Anfrage ein Hook über TanStack Query.
// Gespeichertes zeigt eine Seite sofort; nach einer Minute wird im Hintergrund nachgefragt.
// Änderungen wirken sofort, scheitert das Speichern, rollt der Baustein zurück und der Grund steht im Fehler.
import { MutationObserver, QueryClient, useMutationState, useQuery, type QueryKey } from '@tanstack/react-query'
import { eintragAendern } from '../logik/eintraege'
import { unterschied, type Werte } from '../logik/einstellungen'
import { tagSchluessel } from '../logik/zeit'
import { aendereEinstellungen, holeEinstellungen } from '../vertrag/einstellungen'
import { aendereEintrag, holeEintraege, holeTermine, type Aenderung, type Eintrag } from '../vertrag/eintrag'
import { holeOrdner } from '../vertrag/postfach'
import { holeWetter } from '../vertrag/wetter'
import { merke } from './rueckgaengig'

export const abfragen = new QueryClient({
  // Die Attrappe antwortet sofort; ein zweiter Versuch genügt, dann steht der Fehler da.
  defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } },
})

/** Fehlertext für die Oberfläche: „<was>: <Grund>“. */
const text = (was: string, f: unknown) => `${was}: ${f instanceof Error ? f.message : String(f)}`
const meldung = (was: string, f: Error | null) => (f ? text(was, f) : undefined)

const schluessel = {
  eintraege: ['eintraege'],
  termine: ['termine'],
  wetter: ['wetter'],
  ordner: ['ordner'],
  einstellungen: ['einstellungen'],
  feiertage: ['feiertage'],
} as const satisfies Record<string, QueryKey>

/** Alle Einträge (Aufgaben, Notizen, Mails …). */
export function useEintraege() {
  const q = useQuery({ queryKey: schluessel.eintraege, queryFn: holeEintraege })
  return { liste: q.data, fehler: meldung('Einträge', q.error) }
}

/** Termine, die in den Zeitraum ragen. */
export function useTermine(von: Date, bis: Date) {
  const q = useQuery({ queryKey: [...schluessel.termine, von.getTime(), bis.getTime()], queryFn: () => holeTermine(von, bis) })
  return { liste: q.data, fehler: meldung('Termine', q.error) }
}

/** Wetter je Stunde im Zeitraum; mit `an = false` wird nichts geholt. */
export function useWetter(von: Date, bis: Date, an = true) {
  const q = useQuery({ queryKey: [...schluessel.wetter, von.getTime(), bis.getTime()], queryFn: () => holeWetter(von, bis), enabled: an })
  return { stunden: an ? q.data : undefined, fehler: meldung('Wetter', q.error) }
}

/** Ordner des Postfachs. */
export function useOrdner() {
  const q = useQuery({ queryKey: schluessel.ordner, queryFn: holeOrdner })
  return { ordner: q.data, fehler: meldung('Ordner', q.error) }
}

/** Feiertage vom Vorjahr bis zum Folgejahr; der große Baustein wird erst hier nachgeladen. Bis dahin gibt es keine. */
export function useFeiertage(jahr: number, land: string): (tag: Date) => string | undefined {
  const q = useQuery({
    queryKey: [...schluessel.feiertage, jahr, land],
    queryFn: async () => {
      const { feiertage } = await import('../logik/feiertage')
      return [jahr - 1, jahr, jahr + 1].map((j) => feiertage(j, land))
    },
    staleTime: Infinity,
  })
  if (q.error) console.error(text('Feiertage', q.error))
  const jahre = q.data
  return (tag) => jahre?.[tag.getFullYear() - jahr + 1]?.get(tagSchluessel(tag))
}

// ── Einstellungen: auch außerhalb von React lesbar (Befehle, Tasten), daher direkt am Speicher.

const einstellungenAbfrage = { queryKey: schluessel.einstellungen, queryFn: holeEinstellungen, staleTime: Infinity }

/** Gemerkte Abweichungen vom Standard; leer, solange nichts geladen ist. */
export const einstellungenJetzt = (): Werte => abfragen.getQueryData<Werte>(schluessel.einstellungen) ?? {}

/** Neuester Fehler einer Art von Änderung, solange die letzte Änderung dieser Art gescheitert ist. */
function useLetzterFehler(art: string): Error | null {
  const zustaende = useMutationState({ filters: { mutationKey: [art] }, select: (m) => m.state })
  const letzter = zustaende[zustaende.length - 1]
  return letzter?.status === 'error' ? letzter.error : null
}

export function useEinstellungen() {
  const q = useQuery(einstellungenAbfrage)
  const speichern = useLetzterFehler('einstellungen')
  return {
    werte: q.data ?? {},
    geladen: !q.isPending,
    fehler: q.error ? q.error.message : speichern ? `${speichern.message}. Die Änderung wurde nicht übernommen.` : undefined,
  }
}

const einstellungenSpeichern = new MutationObserver(abfragen, {
  mutationKey: ['einstellungen'],
  mutationFn: ({ alt, neu }: { alt: Werte; neu: Werte }) => aendereEinstellungen(unterschied(alt, neu)),
  onMutate: async ({ neu }) => {
    await abfragen.cancelQueries({ queryKey: schluessel.einstellungen })
    abfragen.setQueryData(schluessel.einstellungen, neu)
  },
  onSuccess: (werte) => abfragen.setQueryData(schluessel.einstellungen, werte),
  onError: (_f, { alt }) => abfragen.setQueryData(schluessel.einstellungen, alt),
})

/** Speichert `neu` (sofort sichtbar); scheitert es, gilt wieder `alt`. Liefert, ob es geklappt hat. */
export function einstellungenSpeichernVon(alt: Werte, neu: Werte): Promise<boolean> {
  if (Object.keys(unterschied(alt, neu)).length === 0) return Promise.resolve(false)
  return einstellungenSpeichern.mutate({ alt, neu }).then(
    () => true,
    () => false,
  )
}

// ── Einträge ändern (Termine verschieben, Aufgaben erledigen): wirkt in jeder Liste, in der der Eintrag steht.

const mitEintraegen = { predicate: (q: { queryKey: QueryKey }) => q.queryKey[0] === schluessel.termine[0] || q.queryKey[0] === schluessel.eintraege[0] }

const eintragSpeichern = new MutationObserver(abfragen, {
  mutationKey: ['eintrag'],
  mutationFn: ({ id, aenderung }: { id: string; aenderung: Aenderung }) => aendereEintrag(id, aenderung),
  onMutate: async ({ id, aenderung }) => {
    await abfragen.cancelQueries(mitEintraegen)
    const vorher = abfragen.getQueriesData<Eintrag[]>(mitEintraegen)
    const jetzt = new Date()
    abfragen.setQueriesData<Eintrag[]>(mitEintraegen, (l) => l && eintragAendern(l, id, aenderung, jetzt).liste)
    return vorher
  },
  onError: (_f, _v, vorher) => vorher?.forEach(([k, l]) => abfragen.setQueryData(k, l)),
  onSettled: () => abfragen.invalidateQueries(mitEintraegen),
})

/** Ändert einen Eintrag sofort überall; scheitert es, gilt wieder der alte Stand. Liefert, ob es geklappt hat. */
export function eintragSpeichernVon(id: string, aenderung: Aenderung): Promise<boolean> {
  return eintragSpeichern.mutate({ id, aenderung }).then(
    () => true,
    () => false,
  )
}

/** Fehler der letzten Änderung an einem Eintrag, sonst nichts. */
export function useEintragFehler() {
  return meldung('Nicht gespeichert', useLetzterFehler('eintrag'))
}

/** Ändert einen Eintrag; `text` beschreibt den Schritt für „Rückgängig“. Gemerkt wird nur, was gespeichert ist. */
export async function aendereEintragMitSchritt(e: Eintrag, aenderung: Aenderung, text: string): Promise<void> {
  const vorher: Aenderung = Object.fromEntries(Object.keys(aenderung).map((k) => [k, e[k as keyof Aenderung]]))
  const senden = (a: Aenderung) => async () => {
    await eintragSpeichernVon(e.id, a)
  }
  if (await eintragSpeichernVon(e.id, aenderung)) merke({ text, zurueck: senden(vorher), vor: senden(aenderung) })
}
