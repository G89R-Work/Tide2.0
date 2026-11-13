// Zentrale Liste aller Einstellungen (docs/konzept/20-einstellungen.md).
// Neue Option = eine Zeile in `einstellungen`, ohne Erklärtext (nur Name, Werte, Abschnitt). Seite, Suche und „Auf Standard" entstehen daraus.
// Gruppen und Reihenfolge der Abschnitte wie die mittlere Spalte der Vorlage (bilder/einstellungen-spalte.jpg).
// Gemerkt werden nur Abweichungen vom Standard; je Geräteart unter „<id>@pc" bzw. „<id>@handy".
import { z } from 'zod'
import { bereiche, type BereichId } from './bereiche'

export type Geraet = 'pc' | 'handy'
export type Wert = boolean | number | string
/** Gespeicherte Abweichungen vom Standard. */
export type Werte = Readonly<Record<string, Wert>>
/** Was sich ändert: neuer Wert, oder null für „zurück auf Standard". */
export type WerteAenderung = Readonly<Record<string, Wert | null>>

export const abschnitte = [
  { id: 'start', name: 'Grundlegendes', gruppe: 'Allgemein' },
  { id: 'konten', name: 'Konten und Kalender', gruppe: 'Allgemein' },
  { id: 'benachrichtigungen', name: 'Benachrichtigungen', gruppe: 'Allgemein' },
  { id: 'darstellung', name: 'Darstellung', gruppe: 'Allgemein' },
  { id: 'navigation', name: 'Seitenleiste und Leisten', gruppe: 'Allgemein' },
  { id: 'kurve', name: 'Gezeitenkurve', gruppe: 'Allgemein' },
  { id: 'heute', name: 'Heute', gruppe: 'Bereiche' },
  { id: 'postfach', name: 'Postfach', gruppe: 'Bereiche' },
  { id: 'kalender', name: 'Kalender', gruppe: 'Bereiche' },
  { id: 'todos', name: 'To-dos', gruppe: 'Bereiche' },
  { id: 'einkauf', name: 'Einkauf und Kochen', gruppe: 'Bereiche' },
  { id: 'finanzen', name: 'Finanzen', gruppe: 'Bereiche' },
  { id: 'arbeit', name: 'Arbeit', gruppe: 'Bereiche' },
  { id: 'notizen', name: 'Notizen', gruppe: 'Bereiche' },
  { id: 'schreiben', name: 'Sprache und Schreiben', gruppe: 'Schreiben' },
  { id: 'nutzer', name: 'Nutzer und Räume', gruppe: 'Personen' },
  { id: 'raeume', name: 'Privat und Arbeit', gruppe: 'Daten und Kosten' },
  { id: 'daten', name: 'Daten und Sicherung', gruppe: 'Daten und Kosten' },
] as const satisfies readonly { id: string; name: string; gruppe: string }[]

export type AbschnittId = (typeof abschnitte)[number]['id']

type Basis<I extends string> = {
  id: I
  name: string
  abschnitt: Exclude<AbschnittId, 'start'>
  /** Gilt je Geräteart getrennt (Anordnungen, Größen). */
  jeGeraet?: true
  /** Erscheint zusätzlich unter „Grundlegendes". */
  wichtig?: true
  /** Abweichender Standard am Handy; nur mit `jeGeraet`. */
  standardHandy?: Wert
}
/** `I`: die erlaubten Namen; ab Werk jeder Text. */
export type Einstellung<I extends string = string> = Basis<I> &
  (
    | { art: 'schalter'; standard: boolean }
    | { art: 'auswahl'; standard: string; optionen: readonly (readonly [wert: string, name: string])[] }
    | { art: 'text'; standard: string; laenge: number }
    | { art: 'zahl'; standard: number; min: number; max: number; einheit?: string; /** Raster, ab Werk 1 (ganze Zahlen). */ schritt?: number }
  )

/** Werttyp einer Einstellung: Auswahl nur ihre Werte, Schalter ja/nein, Zahl, Text. */
export type WertVon<E extends Einstellung> = E extends { art: 'auswahl'; optionen: readonly (readonly [infer W, string])[] }
  ? W
  : E extends { art: 'schalter' }
    ? boolean
    : E extends { art: 'zahl' }
      ? number
      : string

const bundeslaender = [
  ['bund', 'Nur bundesweite'], ['bw', 'Baden-Württemberg'], ['by', 'Bayern'], ['be', 'Berlin'], ['bb', 'Brandenburg'],
  ['hb', 'Bremen'], ['hh', 'Hamburg'], ['he', 'Hessen'], ['mv', 'Mecklenburg-Vorpommern'], ['ni', 'Niedersachsen'],
  ['nw', 'Nordrhein-Westfalen'], ['rp', 'Rheinland-Pfalz'], ['sl', 'Saarland'], ['sn', 'Sachsen'], ['st', 'Sachsen-Anhalt'],
  ['sh', 'Schleswig-Holstein'], ['th', 'Thüringen'],
] as const

/** Zeitzonen für die Weltzeit hinter der Uhr: IANA-Name und Stadt. */
const zonen = [
  ['aus', 'Aus'], ['Pacific/Honolulu', 'Honolulu'], ['America/Los_Angeles', 'Los Angeles'], ['America/Chicago', 'Chicago'],
  ['America/New_York', 'New York'], ['America/Sao_Paulo', 'São Paulo'], ['UTC', 'UTC'], ['Europe/London', 'London'],
  ['Europe/Berlin', 'Berlin'], ['Europe/Athens', 'Athen'], ['Europe/Istanbul', 'Istanbul'], ['Asia/Dubai', 'Dubai'],
  ['Asia/Kolkata', 'Neu-Delhi'], ['Asia/Bangkok', 'Bangkok'], ['Asia/Shanghai', 'Peking'], ['Asia/Tokyo', 'Tokio'],
  ['Australia/Sydney', 'Sydney'], ['Pacific/Auckland', 'Auckland'],
] as const

const liste = [
  { id: 'morgen-zusammenfassung', name: 'Morgen-Zusammenfassung', abschnitt: 'benachrichtigungen', art: 'schalter', standard: true, wichtig: true },
  { id: 'ebbe-modus', name: 'Ebbe-Modus', abschnitt: 'benachrichtigungen', art: 'schalter', standard: false },
  { id: 'design', name: 'Design', abschnitt: 'darstellung', art: 'auswahl', standard: 'glut', optionen: [['glut', 'Glut'], ['tinte', 'Tinte']], wichtig: true },
  { id: 'schriftgroesse', name: 'Schriftgröße', abschnitt: 'darstellung', art: 'auswahl', standard: 'normal', optionen: [['klein', 'Klein'], ['normal', 'Normal'], ['gross', 'Groß']], jeGeraet: true, wichtig: true },
  { id: 'bahn', name: 'Bahn von Sonne und Mond', abschnitt: 'darstellung', art: 'auswahl', standard: 'bogen', optionen: [['bogen', 'Bogen'], ['echt', 'Echt']] },
  { id: 'ort-breite', name: 'Ort: Breite', abschnitt: 'darstellung', art: 'zahl', standard: 51.31, min: -90, max: 90, schritt: 0.01, einheit: '°' },
  { id: 'ort-laenge', name: 'Ort: Länge', abschnitt: 'darstellung', art: 'zahl', standard: 9.49, min: -180, max: 180, schritt: 0.01, einheit: '°' },
  { id: 'mond-nachts', name: 'Mond nur nachts', abschnitt: 'darstellung', art: 'schalter', standard: true },
  { id: 'hintergrund-tageszeit', name: 'Hintergrund folgt der Tageszeit', abschnitt: 'darstellung', art: 'schalter', standard: true },
  { id: 'wellen-hoehe', name: 'Höhe der Wellen', abschnitt: 'darstellung', art: 'auswahl', standard: 'gold', optionen: [['viertel', 'Viertel'], ['drittel', 'Drittel'], ['gold', 'Goldener Schnitt'], ['haelfte', 'Hälfte']] },
  { id: 'wellen', name: 'Wellen', abschnitt: 'darstellung', art: 'schalter', standard: true },
  { id: 'bewegung', name: 'Bewegung', abschnitt: 'darstellung', art: 'schalter', standard: true },
  { id: 'kurve-stunden', name: 'Sichtbare Stunden', abschnitt: 'kurve', art: 'zahl', standard: 4, standardHandy: 6, min: 3, max: 8, einheit: 'Std.', jeGeraet: true, wichtig: true },
  { id: 'kurve-ganzer-tag', name: 'Ganzer Tag', abschnitt: 'kurve', art: 'schalter', standard: false, jeGeraet: true },
  { id: 'kurve-band-hoehe', name: 'Höhe der Bänder', abschnitt: 'kurve', art: 'zahl', standard: 76, min: 20, max: 100, einheit: '%', jeGeraet: true },
  { id: 'kurve-eingeklappt', name: 'Eingeklappt', abschnitt: 'kurve', art: 'schalter', standard: false, jeGeraet: true },
  { id: 'kurve-wetter', name: 'Wetter', abschnitt: 'kurve', art: 'schalter', standard: true, jeGeraet: true },
  { id: 'kurve-lage', name: 'Lage', abschnitt: 'kurve', art: 'auswahl', standard: 'unten', optionen: [['unten', 'Unten'], ['oben', 'Oben']], jeGeraet: true },
  { id: 'leiste-breite', name: 'Breite der Seitenleiste', abschnitt: 'navigation', art: 'auswahl', standard: 'schmal', optionen: [['schmal', 'Schmal, nur Symbole'], ['breit', 'Breit, mit Namen']], wichtig: true },
  // Sichtbar je Seite: ein Schalter je Bereich (docs/konzept/06-gezeitenkurve.md).
  ...bereiche.map((b) => ({ id: `kurve-zeigen-${b.id}` as const, name: `Zeigen auf ${b.name}`, abschnitt: 'kurve', art: 'schalter', standard: true, jeGeraet: true }) as const),
  { id: 'name', name: 'Dein Name', abschnitt: 'nutzer', art: 'text', standard: 'Moritz', laenge: 30, wichtig: true },
  { id: 'heute-uhr', name: 'Uhr', abschnitt: 'heute', art: 'schalter', standard: true, jeGeraet: true },
  { id: 'weltzeit-1', name: 'Weltzeit 1', abschnitt: 'heute', art: 'auswahl', standard: 'America/New_York', optionen: zonen },
  { id: 'weltzeit-2', name: 'Weltzeit 2', abschnitt: 'heute', art: 'auswahl', standard: 'Asia/Tokyo', optionen: zonen },
  { id: 'weltzeit-3', name: 'Weltzeit 3', abschnitt: 'heute', art: 'auswahl', standard: 'aus', optionen: zonen },
  { id: 'rechtschreibung', name: 'Rechtschreibprüfung', abschnitt: 'schreiben', art: 'schalter', standard: true },
  { id: 'wochenbeginn', name: 'Wochenbeginn', abschnitt: 'kalender', art: 'auswahl', standard: 'montag', optionen: [['montag', 'Montag'], ['sonntag', 'Sonntag']], wichtig: true },
  { id: 'kalenderwoche', name: 'Kalenderwoche anzeigen', abschnitt: 'kalender', art: 'schalter', standard: true },
  { id: 'bundesland', name: 'Bundesland für Feiertage', abschnitt: 'kalender', art: 'auswahl', standard: 'bund', optionen: bundeslaender },
  { id: 'archivfrist', name: 'Erledigtes ins Archiv nach', abschnitt: 'todos', art: 'zahl', standard: 30, min: 1, max: 365, einheit: 'Tagen' },
] as const satisfies readonly Einstellung[]

type Liste = (typeof liste)[number]
/** Name jeder Einstellung; ein Tippfehler ist ein Typfehler. */
export type EinstellungId = Liste['id']
export const einstellungen: readonly Einstellung<EinstellungId>[] = liste
type Nach<I extends EinstellungId, L = Liste> = L extends Liste ? (I extends L['id'] ? L : never) : never

/** Die Einstellung mit diesem Namen, mit ihrer genauen Art und ihren Werten. */
export function einstellung<I extends EinstellungId>(id: I): Nach<I> {
  const e = liste.find((x): x is Nach<I> => x.id === id)
  if (!e) throw new Error(`Einstellung „${id}" steht nicht in der Liste`)
  return e
}

/** Schalter „Kurve zeigen" einer Seite. */
export const kurveZeigen = (bereich: BereichId) => einstellung(`kurve-zeigen-${bereich}`)

export function einstellungenIn(abschnitt: AbschnittId): Einstellung[] {
  return einstellungen.filter((e) => (abschnitt === 'start' ? e.wichtig : e.abschnitt === abschnitt))
}

const schluessel = (e: Einstellung, geraet: Geraet) => (e.jeGeraet ? `${e.id}@${geraet}` : e.id)

const imRaster = (w: number, schritt: number) => Math.abs(w / schritt - Math.round(w / schritt)) < 1e-6

const standardVon = (e: Einstellung, geraet: Geraet): Wert => (geraet === 'handy' && e.standardHandy !== undefined ? e.standardHandy : e.standard)

/** Schema einer Einstellung: was als Wert gilt. */
function schemaVon(e: Einstellung): z.ZodType<Wert> {
  switch (e.art) {
    case 'schalter':
      return z.boolean()
    case 'auswahl':
      return z.enum(e.optionen.map(([o]) => o))
    case 'text':
      return z.string().max(e.laenge)
    case 'zahl':
      return z.number().min(e.min).max(e.max).refine((w) => imRaster(w, e.schritt ?? 1), 'liegt nicht im Raster')
  }
}

const gueltig = (e: Einstellung, w: unknown): w is Wert => schemaVon(e).safeParse(w).success

export function wertVon<E extends Einstellung>(e: E, werte: Werte, geraet: Geraet): WertVon<E>
export function wertVon(e: Einstellung, werte: Werte, geraet: Geraet): Wert {
  const w = werte[schluessel(e, geraet)]
  return gueltig(e, w) ? w : standardVon(e, geraet)
}

export function istStandard(e: Einstellung, werte: Werte, geraet: Geraet): boolean {
  return wertVon(e, werte, geraet) === standardVon(e, geraet)
}

/** Neuer Stand mit diesem Wert. Ungültiges ändert nichts (gleiches Objekt zurück). */
export function setze(werte: Werte, e: Einstellung, geraet: Geraet, wert: Wert): Werte {
  if (!gueltig(e, wert)) return werte
  const { [schluessel(e, geraet)]: _, ...rest } = werte
  return wert === standardVon(e, geraet) ? rest : { ...rest, [schluessel(e, geraet)]: wert }
}

export function zuruecksetzen(werte: Werte, liste: readonly Einstellung[], geraet: Geraet): Werte {
  const weg = new Set(liste.map((e) => schluessel(e, geraet)))
  return Object.fromEntries(Object.entries(werte).filter(([k]) => !weg.has(k)))
}

const flach = (t: string) =>
  t.toLocaleLowerCase('de').replaceAll('ß', 'ss').normalize('NFD').replace(/\p{Diacritic}/gu, '')

/** Alle Wörter müssen in Name, Abschnitt oder Auswahl vorkommen. */
export function suche(text: string): Einstellung[] {
  const woerter = flach(text).split(/\s+/).filter(Boolean)
  return einstellungen.filter((e) => {
    const abschnitt = abschnitte.find((a) => a.id === e.abschnitt)?.name ?? ''
    const optionen = e.art === 'auswahl' ? e.optionen.map(([, n]) => n).join(' ') : ''
    const heuhaufen = flach(`${e.name} ${abschnitt} ${optionen}`)
    return woerter.every((w) => heuhaufen.includes(w))
  })
}

const geraete: readonly Geraet[] = ['pc', 'handy']

/** Gespeicherte Werte: nur bekannte Schlüssel; ungültige Werte fallen weg (es gilt der Standard). Kein Objekt ist ein Fehler. */
export const werteSchema = z
  .object(
    Object.fromEntries(
      einstellungen.flatMap((e) => (e.jeGeraet ? geraete.map((g) => schluessel(e, g)) : [e.id]).map((k) => [k, schemaVon(e).optional().catch(undefined)])),
    ),
  )
  .transform((w): Werte => Object.fromEntries(Object.entries(w).filter((p): p is [string, Wert] => p[1] !== undefined)))

/** Eine Änderung: je Schlüssel neuer Wert oder null für „zurück auf Standard". Gültig wird sie erst mit `werteAusDaten`. */
export const werteAenderungSchema = z.record(z.string(), z.union([z.boolean(), z.number(), z.string(), z.null()]))

/** Gemerktes lesen: wie `werteSchema`, Unlesbares ergibt den Standard. */
export function werteAusDaten(daten: unknown): Werte {
  return werteSchema.catch({}).parse(daten)
}

export function unterschied(alt: Werte, neu: Werte): WerteAenderung {
  const raus: Record<string, Wert | null> = {}
  for (const k of Object.keys(alt)) if (!(k in neu)) raus[k] = null
  for (const [k, w] of Object.entries(neu)) if (alt[k] !== w) raus[k] = w
  return raus
}

export function werteAendern(werte: Werte, aenderung: WerteAenderung): Werte {
  const raus: Record<string, Wert> = { ...werte }
  for (const [k, w] of Object.entries(aenderung)) {
    if (w === null) delete raus[k]
    else raus[k] = w
  }
  return raus
}
