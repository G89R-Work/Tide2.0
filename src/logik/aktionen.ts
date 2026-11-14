// Liste aller Aktionen und die belegbaren Knöpfe (docs/konzept/03-geruest.md, „Belegbare Knöpfe").
// Eine neue Funktion wird hier einmal eingetragen und ist dann auf jedem Platz und per Kürzel wählbar.
import { z } from 'zod'
import { bereiche } from './bereiche'

export type Aktion = {
  id: string
  name: string
  /** Sprungmarke, zu der die Aktion führt. */
  ziel?: string
  /** Führt einen Befehl auf der Seite aus statt zu springen (src/geruest/befehle.ts). */
  befehl?: true
  /** Noch nicht gebaut: der Knopf ist ausgegraut. */
  spaeter?: true
  /** Tastenkürzel wie „Alt+M" oder „Strg+K". */
  kuerzel?: string
}

export const aktionen: readonly Aktion[] = [
  ...bereiche.map((b, i) => ({ id: `bereich-${b.id}`, name: b.name, ziel: `#${b.id}`, kuerzel: `Alt+${(i + 1) % 10}` })),
  { id: 'neue-mail', name: 'Neue Mail', befehl: true, kuerzel: 'Alt+M' },
  { id: 'neuer-termin', name: 'Neuer Termin', ziel: '#kalender', kuerzel: 'Alt+T' },
  { id: 'kalender-ansicht', name: 'Monat oder Woche', befehl: true, kuerzel: 'Alt+V' },
  { id: 'neues-todo', name: 'Neues To-do', ziel: '#todos', kuerzel: 'Alt+N' },
  { id: 'einkaufsmodus', name: 'Einkaufsmodus', ziel: '#einkauf/listen', kuerzel: 'Alt+E' },
  { id: 'knoepfe-belegen', name: 'Knöpfe belegen', ziel: '#einstellungen/navigation' },
  { id: 'rueckgaengig', name: 'Rückgängig', befehl: true, kuerzel: 'Alt+Z' },
  { id: 'wiederherstellen', name: 'Wiederherstellen', befehl: true, kuerzel: 'Alt+Y' },
  { id: 'kurve', name: 'Gezeitenkurve ein/aus', befehl: true, kuerzel: 'Alt+K' },
  { id: 'mail-antworten', name: 'Antworten', befehl: true, kuerzel: 'Alt+R' },
  { id: 'mail-allen-antworten', name: 'Allen antworten', befehl: true },
  { id: 'mail-weiterleiten', name: 'Weiterleiten', befehl: true },
  { id: 'mail-archivieren', name: 'Archivieren', befehl: true, kuerzel: 'Alt+A' },
  { id: 'mail-loeschen', name: 'Löschen', befehl: true, kuerzel: 'Alt+L' },
  { id: 'mail-ungelesen', name: 'Gelesen oder ungelesen', befehl: true, kuerzel: 'Alt+U' },
  { id: 'mail-anheften', name: 'Anheften oder lösen', befehl: true, kuerzel: 'Alt+P' },
  { id: 'mail-wichtig', name: 'Wichtig oder nicht', befehl: true, kuerzel: 'Alt+W' },
  { id: 'mail-regel', name: 'Regel aus Mail', befehl: true },
  { id: 'suche', name: 'Suche', spaeter: true, kuerzel: 'Strg+K' },
  { id: 'diktat', name: 'Diktat', spaeter: true, kuerzel: 'Alt+D' },
]

const nachId = new Map(aktionen.map((a) => [a.id, a]))
const nachKuerzel = new Map(aktionen.flatMap((a) => (a.kuerzel ? [[a.kuerzel, a] as const] : [])))

export function aktionVon(id: string): Aktion | undefined {
  return nachId.get(id)
}

export function aktionFuerKuerzel(kuerzel: string): Aktion | undefined {
  return nachKuerzel.get(kuerzel)
}

/** Plätze: Kopfzeile am PC, oben rechts am Handy, untere Leiste am Handy (Mitte = Plus). */
export const plaetze = { pc: 3, oben: 3, unten: 5 } as const
export type Ort = keyof typeof plaetze
export const mitteUnten = 2

/** Je Platz die Kennung einer Aktion oder null für leer. */
export type Belegung = Record<Ort, readonly (string | null)[]>

export const abWerk: Belegung = {
  pc: ['neues-todo', 'neuer-termin', 'bereich-einstellungen'],
  oben: ['kurve', 'suche', 'bereich-einstellungen'],
  unten: ['bereich-heute', 'bereich-postfach', 'neues-todo', 'bereich-kalender', 'bereich-einkauf'],
}

/** Ein Platz: eine bekannte Aktion oder null für leer. */
const platzSchema = z.union([z.null(), z.string().refine((id) => nachId.has(id), 'unbekannte Aktion')])
const gueltig = (id: unknown): id is string | null => platzSchema.safeParse(id).success

/** Plätze eines Orts: Fehlendes und Unbekanntes ersetzt die Werkseinstellung je Platz, Überzähliges fällt weg. */
const ortSchema = (ort: Ort) =>
  z
    .array(z.unknown())
    .catch([])
    .transform((liste) => abWerk[ort].map((werk, i) => platzSchema.catch(werk).parse(liste[i])))

const belegungSchema: z.ZodType<Belegung> = z.object({ pc: ortSchema('pc'), oben: ortSchema('oben'), unten: ortSchema('unten') })

/** Gemerkte Belegung lesen. Fehlendes, Unbekanntes oder Unlesbares ersetzt die Werkseinstellung je Platz. */
export function belegungAus(daten: unknown): Belegung {
  const b = belegungSchema.safeParse(daten)
  return b.success ? b.data : abWerk
}

/** Einen Platz neu belegen. Unbekannter Platz oder unbekannte Aktion ändert nichts. */
export function belege(b: Belegung, ort: Ort, platz: number, id: string | null): Belegung {
  if (platz < 0 || platz >= plaetze[ort] || !gueltig(id)) return b
  return { ...b, [ort]: b[ort].map((alt, i) => (i === platz ? id : alt)) }
}

type Taste = { code: string; altKey: boolean; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }

/** Tastendruck → Kürzel wie „Alt+M". Liest die Taste (code), nicht das Zeichen, damit es auf jedem Layout gleich ist.
 *  AltGr (Strg+Alt) und Umschalt zählen nicht. Beim Schreiben in einem Feld gilt nur Strg. */
export function kuerzelAus(t: Taste, inFeld: boolean): string | null {
  const strg = t.ctrlKey || t.metaKey
  if (t.shiftKey || strg === t.altKey) return null
  if (inFeld && !strg) return null
  const treffer = /^(?:Digit|Key)([0-9A-Z])$/.exec(t.code)
  if (!treffer) return null
  return `${strg ? 'Strg' : 'Alt'}+${treffer[1]}`
}
