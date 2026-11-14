// Mail-Regeln (docs/konzept/11-postfach.md): die Bedingung ist JsonLogic aus dem Editor, ausgewertet mit json-logic-js.
// Vergleiche ohne Groß- und Kleinschreibung wie in Sieve (RFC 5228, „i;ascii-casemap“): Mail und Regel werden klein geschrieben.
import jsonLogic from 'json-logic-js'
import type { Mail, MailAenderung, Regel } from '../vertrag/postfach'

/** Felder, die eine Bedingung prüfen kann (Namen wie in `{"var": …}`). */
export const regelFelder = [
  { name: 'von', label: 'Absender' },
  { name: 'adresse', label: 'Absender-Adresse' },
  { name: 'betreff', label: 'Betreff' },
  { name: 'text', label: 'Text der Mail' },
  { name: 'konto', label: 'Empfangen über Konto' },
] as const

/** Vergleiche mit den Namen, die react-querybuilder kennt; jeder ergibt Standard-JsonLogic außer „beginnt mit“ (`startsWith`). */
export const regelVergleiche = [
  { name: 'contains', label: 'enthält' },
  { name: 'doesNotContain', label: 'enthält nicht' },
  { name: '=', label: 'ist genau' },
  { name: 'beginsWith', label: 'beginnt mit' },
] as const

// So gibt react-querybuilder „beginnt mit“ aus; json-logic-js kennt es nicht von selbst.
jsonLogic.add_operation('startsWith', (text: unknown, anfang: unknown) => String(text).startsWith(String(anfang)))

type Json = Regel['bedingung'] | string | number | null | Json[] | { [k: string]: Json }

/** Jeder Text klein geschrieben, sonst unverändert. */
function klein<J extends Json>(x: J): J
function klein(x: Json): Json {
  if (typeof x === 'string') return x.toLowerCase()
  if (Array.isArray(x)) return x.map(klein)
  if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, klein(v)]))
  return x
}

/** Alle Texte, mit denen die Bedingung vergleicht (ohne Feldnamen). */
function werte(x: Json): string[] {
  if (typeof x === 'string') return [x]
  if (Array.isArray(x)) return x.flatMap(werte)
  if (x && typeof x === 'object') return Object.entries(x).flatMap(([k, v]) => (k === 'var' ? [] : werte(v)))
  return []
}

const daten = (m: Mail) => klein({ von: m.von, adresse: m.adresse, betreff: m.betreff, text: m.vorschau, konto: m.konto })

export function trifft(regel: Pick<Regel, 'bedingung'>, m: Mail): boolean {
  return jsonLogic.truthy(jsonLogic.apply(klein(regel.bedingung), daten(m)))
}

export const treffer = (regel: Pick<Regel, 'bedingung'>, mails: readonly Mail[]) => mails.filter((m) => trifft(regel, m))

/** Was die Regel an den getroffenen Mails ändert, je Mail eine Zeile; schon Erledigtes fällt weg. */
export function regelAenderungen(regel: Pick<Regel, 'bedingung' | 'aktionen'>, mails: readonly Mail[]): MailAenderung[] {
  return treffer(regel, mails).flatMap((m) => {
    const a: Omit<MailAenderung, 'id'> = {}
    const kategorien = [...m.kategorien]
    for (const x of regel.aktionen) {
      if (x.art === 'verschieben' && m.ordner !== x.ordner) a.ordner = x.ordner
      if (x.art === 'kategorie' && !kategorien.includes(x.name)) kategorien.push(x.name)
      if (x.art === 'gelesen' && m.ungelesen) a.ungelesen = false
      if (x.art === 'wichtig' && !m.wichtig) a.wichtig = true
      if (x.art === 'anheften' && !m.angeheftet) a.angeheftet = true
      if (x.art === 'nachverfolgen' && !m.nachverfolgen) a.nachverfolgen = true
    }
    if (kategorien.length > m.kategorien.length) a.kategorien = kategorien
    return Object.keys(a).length ? [{ id: m.id, ...a }] : []
  })
}

/** Warum sich die Regel nicht speichern lässt, sonst nichts. */
export function regelFehler(regel: Pick<Regel, 'name' | 'bedingung' | 'aktionen'>): string | undefined {
  if (!regel.name.trim()) return 'Name fehlt'
  const vergleiche = werte(regel.bedingung)
  if (typeof regel.bedingung === 'boolean' || vergleiche.length === 0) return 'Mindestens eine Bedingung'
  if (vergleiche.some((w) => !w.trim())) return 'Bedingung ohne Wert'
  if (regel.aktionen.length === 0) return 'Mindestens eine Aktion'
  return undefined
}

/** Neue, leere Regel: eine Bedingung „Absender enthält …“, dann ins Archiv. */
export function neueRegel(id: string): Regel {
  return { id, name: '', an: true, bedingung: { and: [{ in: ['', { var: 'von' }] }] }, aktionen: [{ art: 'verschieben', ordner: 'archiv' }] }
}

/** Vorbereitete Regel aus einer Mail (Rechtsklick): Mails derselben Adresse ins Archiv. */
export function regelAusMail(m: Mail, id: string): Regel {
  return { id, name: `Mails von ${m.von}`, an: true, bedingung: { and: [{ '==': [{ var: 'adresse' }, m.adresse] }] }, aktionen: [{ art: 'verschieben', ordner: 'archiv' }] }
}
