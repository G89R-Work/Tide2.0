// Liste aller Aktionen und die belegbaren Knöpfe (docs/konzept/03-geruest.md, „Belegbare Knöpfe").
// Eine neue Funktion wird hier einmal eingetragen und ist dann auf jedem Platz und per Kürzel wählbar.
import { bereiche } from './bereiche'

export type Aktion = {
  id: string
  name: string
  /** Sprungmarke, zu der die Aktion führt. */
  ziel?: string
  /** Führt einen Befehl auf der Seite aus statt zu springen (src/geruest/befehle.ts). */
  befehl?: true
  /** Noch nicht gebaut: womit die Funktion kommt. Der Knopf ist dann ausgegraut. */
  kommt?: string
  /** Tastenkürzel wie „Alt+M" oder „Strg+K". */
  kuerzel?: string
}

export const aktionen: readonly Aktion[] = [
  ...bereiche.map((b, i) => ({ id: `bereich-${b.id}`, name: b.name, ziel: `#${b.id}`, kuerzel: `Alt+${(i + 1) % 10}` })),
  { id: 'neue-mail', name: 'Neue Mail', ziel: '#postfach/entwuerfe', kuerzel: 'Alt+M' },
  { id: 'neuer-termin', name: 'Neuer Termin', ziel: '#kalender', kuerzel: 'Alt+T' },
  { id: 'neues-todo', name: 'Neues To-do', ziel: '#todos', kuerzel: 'Alt+N' },
  { id: 'einkaufsmodus', name: 'Einkaufsmodus', ziel: '#einkauf/listen', kuerzel: 'Alt+E' },
  { id: 'knoepfe-belegen', name: 'Knöpfe belegen', ziel: '#einstellungen/navigation' },
  { id: 'kacheln-anpassen', name: 'Kacheln bearbeiten', befehl: true, kuerzel: 'Alt+B' },
  { id: 'kacheln-zuruecksetzen', name: 'Kacheln zurücksetzen', befehl: true },
  { id: 'rueckgaengig', name: 'Rückgängig', befehl: true, kuerzel: 'Alt+Z' },
  { id: 'kurve', name: 'Gezeitenkurve ein/aus', befehl: true, kuerzel: 'Alt+K' },
  { id: 'suche', name: 'Suche', kommt: 'Kommt mit der Suche', kuerzel: 'Strg+K' },
  { id: 'diktat', name: 'Diktat', kommt: 'Kommt mit dem Diktat', kuerzel: 'Alt+D' },
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

const orte = Object.keys(plaetze) as Ort[]
const gueltig = (id: unknown): id is string | null => id === null || (typeof id === 'string' && nachId.has(id))

/** Gemerkte Belegung lesen. Fehlendes, Unbekanntes oder Unlesbares ersetzt die Werkseinstellung je Platz. */
export function belegungAusText(text: string | null): Belegung {
  let roh: unknown = null
  try {
    roh = text ? JSON.parse(text) : null
  } catch {
    roh = null
  }
  const daten = typeof roh === 'object' && roh !== null ? (roh as Record<string, unknown>) : {}
  const b = {} as Record<Ort, (string | null)[]>
  for (const ort of orte) {
    const liste = Array.isArray(daten[ort]) ? (daten[ort] as unknown[]) : []
    b[ort] = abWerk[ort].map((werk, i) => (i < liste.length && gueltig(liste[i]) ? (liste[i] as string | null) : werk))
  }
  return b
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
