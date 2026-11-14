// Vertrag: Ordner, Mails und Kategorien des Postfachs. Gilt für Attrappe und späteren Server.
import { z } from 'zod'
import { anfrage } from './anfrage'

/** Farben eigener Ordner (Namen wie in der Vorlage). */
export const ordnerFarbeSchema = z.enum(['glut', 'meer', 'flieder', 'sand', 'koralle', 'salbei'])
export type OrdnerFarbe = z.infer<typeof ordnerFarbeSchema>

/** Was Tide an einem Ordner ändern kann; Zähler und Hervorhebung bestimmt der Server. */
export const ordnerStandSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  art: z.enum(['system', 'eigen', 'intelligent']),
  /** Übergeordneter eigener Ordner (nur bei `eigen`) */
  eltern: z.string().optional(),
  /** Nur bei `eigen` */
  farbe: ordnerFarbeSchema.optional(),
  /** Steht in der Ordnerleiste; sonst hinter „Ordner anzeigen“ */
  angeheftet: z.boolean(),
  /** Gespeicherte Suche (nur bei `intelligent`) */
  suche: z.string().optional(),
})
export type OrdnerStand = z.infer<typeof ordnerStandSchema>

export const ordnerSchema = ordnerStandSchema.extend({
  /** Zahl rechts: Ungelesenes, bei Entwürfen und intelligenten Ordnern alle Treffer; 0 zeigt keine Zahl */
  zahl: z.int().nonnegative(),
  /** Hervorgehoben (Braucht dich) */
  wichtig: z.literal(true).optional(),
})
export type Ordner = z.infer<typeof ordnerSchema>
export type OrdnerArt = Ordner['art']

/** Alle Ordner in ihrer Reihenfolge. */
export function holeOrdner(): Promise<Ordner[]> {
  return anfrage(z.array(ordnerSchema), 'Ordner holen', '/api/postfach/ordner')
}

/** Speichert alle Ordner in dieser Reihenfolge (anlegen, ändern, umsortieren, löschen); Antwort mit Zählern. */
export function speichereOrdner(liste: readonly OrdnerStand[]): Promise<Ordner[]> {
  return anfrage(z.array(ordnerSchema), 'Ordner speichern', '/api/postfach/ordner', 'PUT', liste)
}

// ── Mails und Kategorien

/** Hinweis je Mail, was sie von dir will. */
export const hinweisSchema = z.enum(['Antworten', 'Handeln', 'Lesen', 'Später'])
export type Hinweis = z.infer<typeof hinweisSchema>

export const kategorieSchema = z.object({ name: z.string().trim().min(1), farbe: ordnerFarbeSchema })
export type Kategorie = z.infer<typeof kategorieSchema>

export const mailSchema = z.object({
  id: z.string().min(1),
  /** Ordner, in dem die Mail liegt (Systemordner oder eigener Ordner) */
  ordner: z.string().min(1),
  /** Konto, an das die Mail ging */
  konto: z.string(),
  /** Name des Absenders */
  von: z.string(),
  /** Adresse des Absenders */
  adresse: z.string(),
  betreff: z.string(),
  /** Anfang des Textes */
  vorschau: z.string(),
  /** ISO-Zeitpunkt des Eingangs */
  zeit: z.iso.datetime({ offset: true }),
  ungelesen: z.boolean(),
  angeheftet: z.boolean(),
  wichtig: z.boolean(),
  nachverfolgen: z.boolean(),
  /** Fälliger Tag beim Nachverfolgen als „JJJJ-MM-TT“ */
  faellig: z.iso.date().optional(),
  /** Dateinamen der Anhänge */
  anhaenge: z.array(z.string()),
  /** Namen aus den Kategorien */
  kategorien: z.array(z.string()),
  hinweis: hinweisSchema.optional(),
  /** Steht in „Braucht dich“, solange sie im Posteingang liegt */
  brauchtDich: z.boolean(),
  /** ISO-Zeitpunkt, zu dem eine zurückgestellte Mail wieder in den Posteingang kommt */
  erinnernAm: z.iso.datetime({ offset: true }).optional(),
  /** Entwurf oder gesendete Mail: Antwort auf diese Mail */
  antwortAuf: z.string().optional(),
  /** Nur in „Geplant“: ISO-Zeitpunkt, zu dem der Server sie verschickt; bis dahin lässt sie sich zurückholen */
  sendenAm: z.iso.datetime({ offset: true }).optional(),
})
export type Mail = z.infer<typeof mailSchema>

/** Was sich an einer Mail ändern lässt; jede Zeile nennt ihre Mail. `null` entfernt Fälligkeit oder Erinnerung. */
export const mailAenderungSchema = mailSchema
  .pick({ ordner: true, ungelesen: true, angeheftet: true, wichtig: true, nachverfolgen: true, kategorien: true, brauchtDich: true })
  .extend({ faellig: mailSchema.shape.faellig.unwrap().nullable(), erinnernAm: mailSchema.shape.erinnernAm.unwrap().nullable() })
  .partial()
  .extend({ id: z.string().min(1) })
export type MailAenderung = z.infer<typeof mailAenderungSchema>

/** Was nur der Leser braucht: Empfänger und Text. */
export const mailInhaltSchema = z.object({ id: z.string().min(1), an: z.array(z.string()), cc: z.array(z.string()), text: z.string() })
export type MailInhalt = z.infer<typeof mailInhaltSchema>

/** Mails eines Ordners; auch für „Braucht dich“ und intelligente Ordner (der Server wertet die Suche aus). */
export function holeMails(ordner: string): Promise<Mail[]> {
  return anfrage(z.array(mailSchema), 'Mails holen', `/api/postfach/mails?${new URLSearchParams({ ordner })}`)
}

/** Ändert mehrere Mails auf einmal (je Mail eigene Werte, etwa für Rückgängig); Antwort: die geänderten Mails. */
export function aendereMails(liste: readonly MailAenderung[]): Promise<Mail[]> {
  return anfrage(z.array(mailSchema), 'Mails ändern', '/api/postfach/mails', 'PATCH', liste)
}

/** Empfänger und Text einer Mail. */
export function holeMailInhalt(id: string): Promise<MailInhalt> {
  return anfrage(mailInhaltSchema, 'Mail öffnen', `/api/postfach/mails/${encodeURIComponent(id)}/inhalt`)
}

export const kontoSchema = z.object({ adresse: z.string().min(1), name: z.string(), signatur: z.string() })
export type Konto = z.infer<typeof kontoSchema>

/** Was ein Entwurf festhält; daraus macht der Server eine Mail in „Entwürfe“ samt Inhalt. */
export const entwurfSchema = z.object({
  konto: z.string().min(1),
  an: z.array(z.string()),
  cc: z.array(z.string()),
  betreff: z.string(),
  /** Text samt Signatur und Zitat */
  text: z.string(),
  wichtig: z.boolean(),
  antwortAuf: z.string().optional(),
})
export type Entwurf = z.infer<typeof entwurfSchema>

/** Konten, von denen Tide sendet, je mit ihrer Signatur. */
export function holeKonten(): Promise<Konto[]> {
  return anfrage(z.array(kontoSchema), 'Konten holen', '/api/postfach/konten')
}

/** Legt einen Entwurf an oder ändert ihn; Antwort: der Entwurf als Mail. */
export function speichereEntwurf(id: string, entwurf: Entwurf): Promise<Mail> {
  return anfrage(mailSchema, 'Entwurf speichern', `/api/postfach/entwuerfe/${encodeURIComponent(id)}`, 'PUT', entwurf)
}

/** Sendet einen Entwurf: `am` plant ihn, `null` heißt sofort. Er liegt bis zum Versand in „Geplant“ (sofort: noch einige Sekunden). */
export function sendeMail(id: string, am: Date | null): Promise<Mail> {
  return anfrage(mailSchema, 'Senden', `/api/postfach/mails/${encodeURIComponent(id)}/senden`, 'PUT', { am: am?.toISOString() ?? null })
}

/** Gegen-Anfrage zum Senden: holt eine noch nicht verschickte Mail zurück in die Entwürfe. */
export function holeZurueck(id: string): Promise<Mail> {
  return anfrage(mailSchema, 'Zurückholen', `/api/postfach/mails/${encodeURIComponent(id)}/zurueckholen`, 'PUT', {})
}

/** Kategorien mit Farbe, in ihrer Reihenfolge. */
export function holeKategorien(): Promise<Kategorie[]> {
  return anfrage(z.array(kategorieSchema), 'Kategorien holen', '/api/postfach/kategorien')
}

/** Speichert alle Kategorien in dieser Reihenfolge (anlegen, umbenennen, Farbe, löschen). Namen sind eindeutig. */
export function speichereKategorien(liste: readonly Kategorie[]): Promise<Kategorie[]> {
  return anfrage(z.array(kategorieSchema), 'Kategorien speichern', '/api/postfach/kategorien', 'PUT', liste)
}

/** Neue Signatur eines Kontos. */
export function speichereSignatur(konto: string, signatur: string): Promise<Konto> {
  return anfrage(kontoSchema, 'Signatur speichern', `/api/postfach/konten/${encodeURIComponent(konto)}/signatur`, 'PUT', { signatur })
}

// ── Abwesenheit und Blockiert

/** Automatische Antwort: wer schreibt, bekommt sie einmal je Person, solange sie an ist. */
export const abwesenheitSchema = z.object({
  an: z.boolean(),
  /** Letzter Tag als „JJJJ-MM-TT“; danach geht sie von selbst aus */
  bis: z.iso.date().optional(),
  /** Nur für dieses Konto; fehlt es, für alle */
  konto: z.string().optional(),
  text: z.string(),
})
export type Abwesenheit = z.infer<typeof abwesenheitSchema>

export function holeAbwesenheit(): Promise<Abwesenheit> {
  return anfrage(abwesenheitSchema, 'Abwesenheit holen', '/api/postfach/abwesenheit')
}

export function speichereAbwesenheit(a: Abwesenheit): Promise<Abwesenheit> {
  return anfrage(abwesenheitSchema, 'Abwesenheit speichern', '/api/postfach/abwesenheit', 'PUT', a)
}

/** Blockierte Absender-Adressen; ihre Mails landen in „Junk“. */
export const blockiertSchema = z.array(z.email())

export function holeBlockiert(): Promise<string[]> {
  return anfrage(blockiertSchema, 'Blockierte holen', '/api/postfach/blockiert')
}

/** Speichert die ganze Liste. */
export function speichereBlockiert(liste: readonly string[]): Promise<string[]> {
  return anfrage(blockiertSchema, 'Blockierte speichern', '/api/postfach/blockiert', 'PUT', liste)
}

// ── Regeln: eine Regel ist ein Stück Daten. Die Bedingung ist JsonLogic (so gibt sie der Editor aus),
// ausgewertet wird sie mit json-logic-js – im Browser und später auf dem Server mit demselben Code.

/** Was eine Regel mit einer getroffenen Mail tut (Vorbild: Sieve, RFC 5228). Archiv und Löschen sind Verschieben. */
export const regelAktionSchema = z.discriminatedUnion('art', [
  z.object({ art: z.literal('verschieben'), ordner: z.string().min(1) }),
  z.object({ art: z.literal('kategorie'), name: z.string().min(1) }),
  z.object({ art: z.enum(['gelesen', 'wichtig', 'anheften', 'nachverfolgen']) }),
])
export type RegelAktion = z.infer<typeof regelAktionSchema>

export const regelSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  an: z.boolean(),
  /** JsonLogic; Felder über `{"var": …}`: von, adresse, betreff, text, konto. Vergleiche ohne Groß- und Kleinschreibung. */
  bedingung: z.union([z.boolean(), z.record(z.string(), z.json())]),
  aktionen: z.array(regelAktionSchema).min(1),
})
export type Regel = z.infer<typeof regelSchema>

/** Alle Regeln in ihrer Reihenfolge. */
export function holeRegeln(): Promise<Regel[]> {
  return anfrage(z.array(regelSchema), 'Regeln holen', '/api/postfach/regeln')
}

/** Speichert alle Regeln in dieser Reihenfolge (anlegen, ändern, an/aus, löschen). */
export function speichereRegeln(liste: readonly Regel[]): Promise<Regel[]> {
  return anfrage(z.array(regelSchema), 'Regeln speichern', '/api/postfach/regeln', 'PUT', liste)
}
