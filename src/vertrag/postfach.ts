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
})
export type Mail = z.infer<typeof mailSchema>

/** Was sich an einer Mail ändern lässt; jede Zeile nennt ihre Mail. `null` entfernt Fälligkeit oder Erinnerung. */
export const mailAenderungSchema = mailSchema
  .pick({ ordner: true, ungelesen: true, angeheftet: true, wichtig: true, nachverfolgen: true, kategorien: true })
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

/** Kategorien mit Farbe, in ihrer Reihenfolge. */
export function holeKategorien(): Promise<Kategorie[]> {
  return anfrage(z.array(kategorieSchema), 'Kategorien holen', '/api/postfach/kategorien')
}
