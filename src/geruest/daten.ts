// Der eine Weg zu den Daten (PRUEFUNG E1): je Anfrage ein Hook über TanStack Query.
// Gespeichertes zeigt eine Seite sofort; nach einer Minute wird im Hintergrund nachgefragt.
// Änderungen wirken sofort, scheitert das Speichern, rollt der Baustein zurück und der Grund steht im Fehler.
import { MutationObserver, QueryClient, useMutationState, useQuery, type QueryKey } from '@tanstack/react-query'
import type { BereichId } from '../logik/bereiche'
import { eintragAendern } from '../logik/eintraege'
import { unterschied, type Werte } from '../logik/einstellungen'
import { mailsAendern, vorherWerte } from '../logik/mails'
import { stand } from '../logik/ordner'
import { tagSchluessel } from '../logik/zeit'
import { aendereEinstellungen, holeEinstellungen } from '../vertrag/einstellungen'
import { aendereEintrag, holeEintraege, holeTermine, legeEintragAn, loescheEintrag, type Aenderung, type Eintrag, type NeuerEintrag } from '../vertrag/eintrag'
import { aendereMails, holeKategorien, holeKonten, holeMailInhalt, holeMails, holeZurueck, sendeMail, speichereEntwurf, type Entwurf, holeOrdner, speichereOrdner, holeRegeln, speichereRegeln, type Regel, holeAbwesenheit, holeBlockiert, speichereAbwesenheit, speichereBlockiert, speichereKategorien, speichereSignatur, type Abwesenheit, type Kategorie, type Konto, type Mail, type MailAenderung, type Ordner, type OrdnerStand } from '../vertrag/postfach'
import { holeWetter, holeWetterTage } from '../vertrag/wetter'
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
  wetterTage: ['wetter', 'tage'],
  ordner: ['ordner'],
  mails: ['mails'],
  kategorien: ['kategorien'],
  mailInhalt: ['mail-inhalt'],
  konten: ['konten'],
  regeln: ['regeln'],
  abwesenheit: ['abwesenheit'],
  blockiert: ['blockiert'],
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

/** Wetter je Ortstag im Zeitraum (Vorschau, Vergleich mit Vorjahr und Mittel). */
export function useWetterTage(von: Date, bis: Date) {
  const q = useQuery({ queryKey: [...schluessel.wetterTage, von.getTime(), bis.getTime()], queryFn: () => holeWetterTage(von, bis) })
  return { tage: q.data, fehler: meldung('Wettervorschau', q.error) }
}

/** Ordner des Postfachs. */
export function useOrdner() {
  const q = useQuery({ queryKey: schluessel.ordner, queryFn: holeOrdner })
  return { ordner: q.data, fehler: meldung('Ordner', q.error) }
}

/** Mails eines Ordners (auch „Braucht dich“ und intelligente Ordner). */
export function useMails(ordner: string) {
  const q = useQuery({ queryKey: [...schluessel.mails, ordner], queryFn: () => holeMails(ordner) })
  return { mails: q.data, fehler: meldung('Mails', q.error) }
}

const inhaltAbfrage = (id: string) => ({ queryKey: [...schluessel.mailInhalt, id], queryFn: () => holeMailInhalt(id), staleTime: Infinity })

/** Empfänger und Text einer Mail; ändert sich nur bei Entwürfen (dann setzt das Speichern ihn neu), darum nur einmal geholt. */
export function useMailInhalt(id: string) {
  const q = useQuery(inhaltAbfrage(id))
  return { inhalt: q.data, fehler: meldung('Mail', q.error) }
}

/** Dasselbe außerhalb von React (etwa um eine Antwort vorzubereiten); holt, was noch fehlt. */
export const mailInhaltJetzt = (id: string) => abfragen.fetchQuery(inhaltAbfrage(id))

const kontenAbfrage = { queryKey: schluessel.konten, queryFn: holeKonten, staleTime: Infinity }

/** Konten, von denen Tide sendet, mit Signatur. */
export function useKonten() {
  const q = useQuery(kontenAbfrage)
  const speichern = useLetzterFehler('signatur')
  return { konten: q.data, fehler: meldung('Konten', q.error) ?? meldung('Signatur nicht gespeichert', speichern) }
}

export const kontenJetzt = () => abfragen.fetchQuery(kontenAbfrage)

/** Die geladenen Mails eines Ordners (für Befehle außerhalb von React); leer, solange nichts geladen ist. */
export const mailsJetzt = (ordner: string): readonly Mail[] => abfragen.getQueryData<Mail[]>([...schluessel.mails, ordner]) ?? []

/** Kategorien der Mails mit Farbe. */
export function useKategorien() {
  const q = useQuery({ queryKey: schluessel.kategorien, queryFn: holeKategorien, staleTime: Infinity })
  const speichern = useLetzterFehler('kategorien')
  return { kategorien: q.data, fehler: meldung('Kategorien', q.error) ?? meldung('Kategorien nicht gespeichert', speichern) }
}

/** Regeln des Postfachs in ihrer Reihenfolge. */
export function useRegeln() {
  const q = useQuery({ queryKey: schluessel.regeln, queryFn: holeRegeln })
  const speichern = useLetzterFehler('regeln')
  return { regeln: q.data, fehler: meldung('Regeln', q.error) ?? meldung('Regeln nicht gespeichert', speichern) }
}

/** Automatische Antwort bei Abwesenheit. */
export function useAbwesenheit() {
  const q = useQuery({ queryKey: schluessel.abwesenheit, queryFn: holeAbwesenheit })
  const speichern = useLetzterFehler('abwesenheit')
  return { abwesenheit: q.data, fehler: meldung('Abwesenheit', q.error) ?? meldung('Abwesenheit nicht gespeichert', speichern) }
}

/** Blockierte Absender. */
export function useBlockiert() {
  const q = useQuery({ queryKey: schluessel.blockiert, queryFn: holeBlockiert })
  const speichern = useLetzterFehler('blockiert')
  return { blockiert: q.data, fehler: meldung('Blockierte', q.error) ?? meldung('Blockierte nicht gespeichert', speichern) }
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

const eintragAnlegen = new MutationObserver(abfragen, {
  mutationKey: ['eintrag'],
  mutationFn: ({ neu, weg }: { neu: NeuerEintrag; weg: boolean }) => (weg ? loescheEintrag(neu.id) : legeEintragAn(neu)),
  onSettled: () => abfragen.invalidateQueries(mitEintraegen),
})

/** Legt einen Eintrag an (`loeschen = false`) oder löscht ihn; Rückgängig tut das Gegenteil. Liefert, ob es geklappt hat.
 *  `bereich`: Seite, deren Rückgängig-Knöpfe den Schritt zeigen. */
export async function eintragMitSchritt(neu: NeuerEintrag, loeschen: boolean, text: string, bereich: BereichId): Promise<boolean> {
  const tun = (weg: boolean) => async () => {
    await eintragAnlegen.mutate({ neu, weg }).catch(() => undefined)
  }
  const ok = await eintragAnlegen.mutate({ neu, weg: loeschen }).then(
    () => true,
    () => false,
  )
  if (ok) merke({ text, zurueck: tun(!loeschen), vor: tun(loeschen), bereich })
  return ok
}

// ── Ordner des Postfachs: gespeichert wird immer die ganze Liste (Reihenfolge, Eltern, Name, Farbe, Anheften).

const ordnerSpeichern = new MutationObserver(abfragen, {
  mutationKey: ['ordner'],
  mutationFn: (neu: OrdnerStand[]) => speichereOrdner(neu),
  onMutate: async (neu) => {
    await abfragen.cancelQueries({ queryKey: schluessel.ordner })
    const vorher = abfragen.getQueryData<Ordner[]>(schluessel.ordner)
    // Sofort zeigen; Zähler bleiben, neue Ordner zählen 0, bis der Server antwortet.
    const zahl = new Map(vorher?.map((x) => [x.id, x]))
    abfragen.setQueryData<Ordner[]>(schluessel.ordner, neu.map((x) => ({ ...x, zahl: zahl.get(x.id)?.zahl ?? 0, ...(zahl.get(x.id)?.wichtig ? { wichtig: true as const } : {}) })))
    return vorher
  },
  onSuccess: (liste) => abfragen.setQueryData(schluessel.ordner, liste),
  onError: (_f, _neu, vorher) => abfragen.setQueryData(schluessel.ordner, vorher),
})

/** Fehler der letzten Änderung an den Ordnern, sonst nichts. */
export function useOrdnerFehler() {
  return meldung('Ordner nicht gespeichert', useLetzterFehler('ordner'))
}

/** Speichert den neuen Stand der Ordner; `text` beschreibt den Schritt für „Rückgängig“. Gemerkt wird nur, was gespeichert ist. */
export async function aendereOrdnerMitSchritt(vorher: readonly Ordner[], neu: readonly OrdnerStand[], text: string): Promise<void> {
  const senden = (l: OrdnerStand[]) => async () => {
    await ordnerSpeichern.mutate(l).catch(() => undefined)
  }
  const alt = stand(vorher)
  const ok = await ordnerSpeichern.mutate([...neu]).then(
    () => true,
    () => false,
  )
  if (ok) merke({ text, zurueck: senden(alt), vor: senden([...neu]), bereich: 'postfach' })
}

// ── Ganzer Stand (Regeln, Kategorien, Abwesenheit, Blockierte): sofort zeigen, scheitert es, gilt der alte; mit Rückgängig.

/** Speichert unter `art` (Schlüssel und Art der Änderung) immer den ganzen Stand; `danach` frischt Abhängiges auf. */
function ganzerStand<T>(art: keyof typeof schluessel, speichere: (neu: T) => Promise<T>, danach?: () => Promise<unknown>) {
  const key = schluessel[art]
  const speichern = new MutationObserver(abfragen, {
    mutationKey: [art],
    mutationFn: speichere,
    onMutate: async (neu: T) => {
      await abfragen.cancelQueries({ queryKey: key })
      const vorher = abfragen.getQueryData<T>(key)
      abfragen.setQueryData(key, neu)
      return vorher
    },
    onSuccess: (x) => abfragen.setQueryData(key, x),
    onError: (_f, _neu, vorher) => abfragen.setQueryData(key, vorher),
    ...(danach ? { onSettled: danach } : {}),
  })
  /** Speichert `neu`; `text` beschreibt den Schritt für „Rückgängig“. Gemerkt wird nur, was gespeichert ist. Liefert, ob es geklappt hat. */
  return async (vorher: T, neu: T, text: string): Promise<boolean> => {
    const senden = (x: T) => async () => {
      await speichern.mutate(x).catch(() => undefined)
    }
    const ok = await speichern.mutate(neu).then(
      () => true,
      () => false,
    )
    if (ok) merke({ text, zurueck: senden(vorher), vor: senden(neu), bereich: 'postfach' })
    return ok
  }
}

const mailsUndOrdnerNeu = () => Promise.all([abfragen.invalidateQueries({ queryKey: schluessel.mails }), abfragen.invalidateQueries({ queryKey: schluessel.ordner })])

export const aendereRegelnMitSchritt = ganzerStand<readonly Regel[]>('regeln', (l) => speichereRegeln(l))
export const aendereKategorienMitSchritt = ganzerStand<readonly Kategorie[]>('kategorien', (l) => speichereKategorien(l), mailsUndOrdnerNeu)
export const aendereAbwesenheitMitSchritt = ganzerStand<Abwesenheit>('abwesenheit', speichereAbwesenheit)
export const aendereBlockiertMitSchritt = ganzerStand<readonly string[]>('blockiert', (l) => speichereBlockiert(l), mailsUndOrdnerNeu)

const signaturSpeichern = new MutationObserver(abfragen, {
  mutationKey: ['signatur'],
  mutationFn: ({ konto, signatur }: { konto: string; signatur: string }) => speichereSignatur(konto, signatur),
  onSuccess: (k) => abfragen.setQueryData<Konto[]>(schluessel.konten, (l) => l?.map((x) => (x.adresse === k.adresse ? k : x))),
})

/** Neue Signatur eines Kontos mit Rückgängig. */
export async function signaturMitSchritt(k: Konto, signatur: string, text: string): Promise<void> {
  const tun = (s: string) => async () => {
    await signaturSpeichern.mutate({ konto: k.adresse, signatur: s }).catch(() => undefined)
  }
  const ok = await signaturSpeichern.mutate({ konto: k.adresse, signatur }).then(
    () => true,
    () => false,
  )
  if (ok) merke({ text, zurueck: tun(k.signatur), vor: tun(signatur), bereich: 'postfach' })
}

// ── Mails ändern (verschieben, gelesen, anheften): wirkt sofort in jeder geladenen Liste; Zähler der Ordner danach neu.

const mailListen = { queryKey: schluessel.mails }

const mailsSpeichern = new MutationObserver(abfragen, {
  mutationKey: ['mails'],
  mutationFn: (liste: MailAenderung[]) => aendereMails(liste),
  onMutate: async (liste) => {
    await abfragen.cancelQueries(mailListen)
    const vorher = abfragen.getQueriesData<Mail[]>(mailListen)
    // Der Schlüssel nennt den Ordner der Liste: Verschobenes fällt dort sofort heraus.
    vorher.forEach(([k, l]) => l && abfragen.setQueryData(k, mailsAendern(l, liste, String(k[1]))))
    return vorher
  },
  onError: (_f, _l, vorher) => vorher?.forEach(([k, l]) => abfragen.setQueryData(k, l)),
  onSettled: () => Promise.all([abfragen.invalidateQueries(mailListen), abfragen.invalidateQueries({ queryKey: schluessel.ordner })]),
})

/** Fehler der letzten Änderung an Mails, sonst nichts. */
export function useMailFehler() {
  return meldung('Mails nicht geändert', useLetzterFehler('mails'))
}

/** Ändert Mails; `text` beschreibt den Schritt für „Rückgängig“. Den Stand davor kennen die geladenen Listen. Gemerkt wird nur, was gespeichert ist.
 *  `still`: lässt sich zurücknehmen, erscheint aber nicht als Meldung (etwa „gelesen“ beim Öffnen). */
export async function aendereMailsMitSchritt(liste: readonly MailAenderung[], text: string, still = false): Promise<void> {
  const geladen = abfragen.getQueriesData<Mail[]>(mailListen).flatMap(([, l]) => l ?? [])
  const vorher = vorherWerte(geladen, liste)
  const senden = (l: MailAenderung[]) => async () => {
    await mailsSpeichern.mutate(l).catch(() => undefined)
  }
  const ok = await mailsSpeichern.mutate([...liste]).then(
    () => true,
    () => false,
  )
  if (ok) merke({ text, zurueck: senden(vorher), vor: senden([...liste]), bereich: 'postfach', ...(still ? { still } : {}) })
}

// ── Schreiben: Entwürfe speichern sich beim Tippen (ohne Rückgängig-Schritt je Taste); Senden lässt sich zurückholen.

const mailsNeu = () => Promise.all([abfragen.invalidateQueries(mailListen), abfragen.invalidateQueries({ queryKey: schluessel.ordner })])

const entwurfSpeichern = new MutationObserver(abfragen, {
  mutationKey: ['entwurf'],
  mutationFn: ({ id, entwurf }: { id: string; entwurf: Entwurf }) => speichereEntwurf(id, entwurf),
  onSuccess: (_m, { id, entwurf }) => abfragen.setQueryData([...schluessel.mailInhalt, id], { id, an: entwurf.an, cc: entwurf.cc, text: entwurf.text }),
  onSettled: mailsNeu,
})

/** Speichert einen Entwurf; liefert, ob es geklappt hat (der Grund steht dann in `useEntwurfFehler`). */
export function entwurfSpeichernVon(id: string, entwurf: Entwurf): Promise<boolean> {
  return entwurfSpeichern.mutate({ id, entwurf }).then(
    () => true,
    () => false,
  )
}

export function useEntwurfFehler() {
  return meldung('Entwurf nicht gespeichert', useLetzterFehler('entwurf'))
}

/** Legt einen neuen Entwurf an; Rückgängig legt ihn in den Papierkorb. Liefert, ob es geklappt hat. */
export async function neuerEntwurfMitSchritt(id: string, entwurf: Entwurf, text: string): Promise<boolean> {
  if (!(await entwurfSpeichernVon(id, entwurf))) return false
  const nach = (ordner: string) => async () => {
    await mailsSpeichern.mutate([{ id, ordner }]).catch(() => undefined)
  }
  merke({ text, zurueck: nach('papierkorb'), vor: nach('entwuerfe'), bereich: 'postfach' })
  return true
}

const senden = new MutationObserver(abfragen, {
  mutationKey: ['senden'],
  mutationFn: ({ id, am, zurueck }: { id: string; am: Date | null; zurueck: boolean }) => (zurueck ? holeZurueck(id) : sendeMail(id, am)),
  onSettled: mailsNeu,
})

export function useSendeFehler() {
  return meldung('Nicht gesendet', useLetzterFehler('senden'))
}

/** Sendet (`zurueck = false`; sofort mit `am = null` oder geplant) oder holt eine geplante Mail zurück (`true`).
 *  Rückgängig tut jeweils das Gegenteil; zurückholen lässt sich nur, was noch nicht verschickt ist. */
export async function sendenMitSchritt(id: string, am: Date | null, zurueck: boolean, text: string): Promise<boolean> {
  const tun = (z: boolean) => async () => {
    await senden.mutate({ id, am, zurueck: z }).catch(() => undefined)
  }
  const ok = await senden.mutate({ id, am, zurueck }).then(
    () => true,
    () => false,
  )
  if (ok) merke({ text, zurueck: tun(!zurueck), vor: tun(zurueck), bereich: 'postfach' })
  return ok
}
