// Zweite Ebene je Bereich (docs/konzept/03-geruest.md). Erreichbar unter #<bereich>/<unterpunkt>.
// Eigene Ordner sind bis zu ihren Etappen feste Beispiele; danach kommen sie über den Vertrag.
import { bereichAusMarke, type BereichId } from './bereiche'
import { abschnitte } from './einstellungen'

export type Unterpunkt = { id: string; name: string; gruppe?: string }

const u = (gruppe: string | undefined, ...paare: [string, string][]): Unterpunkt[] =>
  paare.map(([id, name]) => (gruppe ? { id, name, gruppe } : { id, name }))

const ebenen: Record<BereichId, Unterpunkt[]> = {
  heute: [],
  postfach: [
    ...u('Ordner', ['eingang', 'Eingang'], ['entwuerfe', 'Entwürfe'], ['gesendet', 'Gesendet'], ['archiv', 'Archiv'], ['papierkorb', 'Papierkorb']),
    ...u('Eigene Ordner', ['familie', 'Familie'], ['rechnungen', 'Rechnungen']),
    ...u('Intelligente Ordner', ['ungelesen', 'Ungelesen'], ['markiert', 'Markiert']),
    ...u('Verwalten', ['regeln', 'Regeln'], ['einstellungen', 'Postfach-Einstellungen']),
  ],
  kalender: [
    ...u('Ansichten', ['woche', 'Woche'], ['tag', 'Tag'], ['monat', 'Monat']),
    ...u('Kalender', ['privat', 'Privat'], ['arbeit', 'Arbeit'], ['feiertage', 'Feiertage']),
  ],
  todos: [
    ...u('Herkunft', ['alle', 'Alle'], ['aus-mails', 'Aus Mails'], ['aus-notizen', 'Aus Notizen']),
    ...u('Listen', ['privat', 'Privat'], ['arbeit', 'Arbeit']),
    ...u(undefined, ['archiv', 'Archiv']),
  ],
  einkauf: u(undefined, ['listen', 'Listen'], ['laeden', 'Läden'], ['ausgaben', 'Ausgaben']),
  kochen: u(undefined, ['gerichte', 'Gerichte'], ['getraenke', 'Getränke'], ['wochenplan', 'Wochenplan']),
  finanzen: u(undefined, ['uebersicht', 'Übersicht'], ['rechnungen', 'Rechnungen'], ['abos', 'Abos'], ['vertraege', 'Verträge']),
  arbeit: u(undefined, ['schichtplan', 'Schichtplan'], ['arbeitszeit', 'Arbeitszeit'], ['urlaub', 'Urlaub'], ['wissen', 'Wissen']),
  notizen: u('Ordner', ['alle', 'Alle Notizen'], ['persoenlich', 'Persönlich'], ['ideen', 'Ideen']),
  einstellungen: abschnitte.map((a) => ({ ...a })),
}

export function ebeneVon(bereich: BereichId): readonly Unterpunkt[] {
  return ebenen[bereich]
}

export type Ort = { bereich: BereichId; unter: string | null }

/** „#postfach/gesendet" → Ort. Fehlt der Unterpunkt oder ist er unbekannt, gilt der erste. */
export function ortAusMarke(marke: string): Ort {
  const [kopf, rest = ''] = marke.split('/', 2)
  const bereich = bereichAusMarke(kopf)
  const ebene = ebenen[bereich]
  const unter = ebene.find((p) => p.id === rest) ?? ebene[0]
  return { bereich, unter: unter?.id ?? null }
}

export function markeFuer(bereich: BereichId, unter?: string): string {
  return unter ? `#${bereich}/${unter}` : `#${bereich}`
}
