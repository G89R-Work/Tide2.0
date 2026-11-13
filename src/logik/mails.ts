// Mails im Postfach: Suche, Filter, Sortierung, Ordner, Zähler, Ändern und Auswahl.
// Die Suche gilt für das Suchfeld und für intelligente Ordner (die Attrappe wertet sie damit aus).
import type { Mail, MailAenderung, OrdnerStand } from '../vertrag/postfach'

/** Ein Wort der Suche: „anhang:pdf“ sucht Anhänge mit dieser Endung, sonst Text in Absender, Adresse, Betreff, Vorschau, Kategorien. */
function wortPasst(m: Mail, wort: string): boolean {
  if (wort.startsWith('anhang:')) {
    const endung = `.${wort.slice('anhang:'.length)}`
    return m.anhaenge.some((a) => a.toLowerCase().endsWith(endung))
  }
  return [m.von, m.adresse, m.betreff, m.vorschau, ...m.kategorien].some((t) => t.toLowerCase().includes(wort))
}

/** Passt die Mail zur Suche? Jedes Wort muss passen; leere Suche passt immer. */
export function passt(m: Mail, suche: string): boolean {
  return suche.toLowerCase().split(/\s+/).filter(Boolean).every((w) => wortPasst(m, w))
}

export const mailFilter = { alle: 'Alle', ungelesen: 'Ungelesen', nachverfolgen: 'Nachverfolgen', anhang: 'Mit Anhang', angeheftet: 'Angeheftet', wichtig: 'Wichtig' } as const
export type MailFilter = keyof typeof mailFilter

export const mailSortierung = { neu: 'Neueste zuerst', alt: 'Älteste zuerst', absender: 'Absender A–Z', wichtig: 'Wichtige zuerst' } as const
export type MailSortierung = keyof typeof mailSortierung

const filterPasst: Record<MailFilter, (m: Mail) => boolean> = {
  alle: () => true,
  ungelesen: (m) => m.ungelesen,
  nachverfolgen: (m) => m.nachverfolgen,
  anhang: (m) => m.anhaenge.length > 0,
  angeheftet: (m) => m.angeheftet,
  wichtig: (m) => m.wichtig,
}

const neuer = (a: Mail, b: Mail) => b.zeit.localeCompare(a.zeit)
const vergleich: Record<MailSortierung, (a: Mail, b: Mail) => number> = {
  neu: neuer,
  alt: (a, b) => -neuer(a, b),
  absender: (a, b) => a.von.localeCompare(b.von, 'de') || neuer(a, b),
  wichtig: (a, b) => Number(b.wichtig) - Number(a.wichtig) || neuer(a, b),
}

export type Ansicht = { suche: string; filter: MailFilter; sortierung: MailSortierung }

/** Die Liste, wie sie erscheint: gesucht, gefiltert, sortiert; Angeheftetes immer oben. */
export function zeigeMails(liste: readonly Mail[], { suche, filter, sortierung }: Ansicht): Mail[] {
  return liste
    .filter((m) => filterPasst[filter](m) && passt(m, suche))
    .sort((a, b) => Number(b.angeheftet) - Number(a.angeheftet) || vergleich[sortierung](a, b))
}

/** Ordner, in denen intelligente Ordner nicht suchen. */
const ohneSuche = new Set(['papierkorb', 'junk', 'gesendet', 'entwuerfe', 'geplant'])
/** Ordner, die nur Tide selbst füllt (Ausgehendes, Zurückgestellt) oder die nur zeigen. */
const keinZiel = new Set(['braucht-dich', 'entwuerfe', 'geplant', 'gesendet', 'zurueckgestellt'])

/** Steht die Mail in diesem Ordner? „Braucht dich“ zeigt den Posteingang mit Hinweis, intelligente Ordner ihre Suche. */
export function inOrdner(m: Mail, o: OrdnerStand): boolean {
  if (o.art === 'intelligent') return !ohneSuche.has(m.ordner) && passt(m, o.suche ?? '')
  if (o.id === 'braucht-dich') return m.ordner === 'eingang' && m.brauchtDich
  return m.ordner === o.id
}

/** Zahl am Ordner: Ungelesenes; bei Entwürfen, „Braucht dich“ und intelligenten Ordnern alle Treffer. */
export function ordnerZahl(liste: readonly Mail[], o: OrdnerStand): number {
  const alle = o.art === 'intelligent' || o.id === 'entwuerfe' || o.id === 'braucht-dich'
  return liste.filter((m) => inOrdner(m, o) && (alle || m.ungelesen)).length
}

/** Kann eine Mail in diesem Ordner liegen? „Braucht dich“ und intelligente Ordner zeigen nur. */
export const echterOrdner = (o: OrdnerStand) => o.art !== 'intelligent' && o.id !== 'braucht-dich'

/** Lassen sich Mails hierher ziehen? Nicht in Ordner, die nur Tide selbst füllt. */
export const kannHinein = (o: OrdnerStand) => echterOrdner(o) && !keinZiel.has(o.id)

/** Wendet Änderungen an; mit `ordner` (Ordner der Liste) fallen Mails heraus, die in einen anderen Ordner gehen. */
export function mailsAendern(liste: readonly Mail[], aenderungen: readonly MailAenderung[], ordner?: string): Mail[] {
  const nach = new Map(aenderungen.map((a) => [a.id, a]))
  return liste
    .filter((m) => ordner === undefined || (nach.get(m.id)?.ordner ?? ordner) === ordner)
    .map((m) => ({ ...m, ...nach.get(m.id) }))
}

/** Die alten Werte genau der Felder, die sich ändern (für Rückgängig); unbekannte Mails fallen weg. */
export function vorherWerte(liste: readonly Mail[], aenderungen: readonly MailAenderung[]): MailAenderung[] {
  const nach = new Map(liste.map((m) => [m.id, m]))
  return aenderungen.flatMap((a) => {
    const m = nach.get(a.id)
    if (!m) return []
    return [Object.fromEntries(Object.keys(a).map((k) => [k, m[k as keyof MailAenderung]])) as MailAenderung]
  })
}

export type Auswahl = { ids: readonly string[]; anker: string | null }
/** Klick (einzeln), Strg/Cmd-Klick oder Häkchen (dazu), Umschalt-Klick (Bereich ab dem Anker). */
export type Wahl = 'einzeln' | 'dazu' | 'bereich'

/** Neue Auswahl nach einem Klick auf `id`; `reihe` ist die Reihenfolge der sichtbaren Mails. */
export function waehle(a: Auswahl, reihe: readonly string[], id: string, wahl: Wahl): Auswahl {
  if (wahl === 'dazu') return { ids: a.ids.includes(id) ? a.ids.filter((x) => x !== id) : [...a.ids, id], anker: id }
  const von = a.anker === null ? -1 : reihe.indexOf(a.anker)
  const bis = reihe.indexOf(id)
  if (wahl === 'einzeln' || von < 0 || bis < 0) return { ids: [id], anker: id }
  return { ids: reihe.slice(Math.min(von, bis), Math.max(von, bis) + 1), anker: a.anker }
}

/** Was beim Ziehen von `id` mitgeht: die ganze Auswahl, wenn `id` dazugehört, sonst nur diese Mail. */
export const gezogen = (a: Auswahl, id: string): readonly string[] => (a.ids.includes(id) ? a.ids : [id])

/** „1 Mail“, „3 Mails“ */
export const mailsText = (n: number) => `${n} ${n === 1 ? 'Mail' : 'Mails'}`
