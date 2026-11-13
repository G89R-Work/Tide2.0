// Vertrag: Grundfelder, die jeder Eintrag in Tide hat (Mail, Termin, To-do, Notiz …).
// Gilt für die Attrappe und den späteren Server gleich. Die Typen entstehen aus den Schemas.
import { z } from 'zod'
import { anfrage } from './anfrage'

const zeitpunkt = z.iso.datetime({ offset: true })

export const artSchema = z.enum(['aufgabe', 'notiz', 'termin', 'schicht', 'mail', 'einkauf'])
export type Art = z.infer<typeof artSchema>

export const eintragSchema = z.object({
  id: z.string(),
  art: artSchema,
  titel: z.string(),
  erledigt: z.boolean(),
  /** ISO-Zeitpunkt der Anlage */
  erstellt: zeitpunkt,
  /** ISO-Zeitpunkt der letzten Änderung */
  geaendert: zeitpunkt,
  /** ISO-Zeitpunkt des Beginns, nur bei Einträgen mit Uhrzeit (Termin, Schicht) */
  beginn: zeitpunkt.optional(),
  /** ISO-Zeitpunkt des Endes, gehört zu `beginn` */
  ende: zeitpunkt.optional(),
  /** Fälliger Tag als „JJJJ-MM-TT“ (Ortszeit), nur bei Einträgen mit Frist */
  frist: z.iso.date().optional(),
})
export type Eintrag = z.infer<typeof eintragSchema>
export const eintraegeSchema = z.array(eintragSchema)

/** Was sich an einem Eintrag ändern lässt. Beginn und Ende nur zusammen und nur bei Einträgen mit Uhrzeit. */
export const aenderungSchema = eintragSchema.pick({ titel: true, erledigt: true, beginn: true, ende: true }).partial()
export type Aenderung = z.infer<typeof aenderungSchema>

const adresse = '/api/eintraege'

export function holeEintraege(): Promise<Eintrag[]> {
  return anfrage(eintraegeSchema, 'Einträge holen', adresse)
}

export function aendereEintrag(id: string, aenderung: Aenderung): Promise<Eintrag> {
  return anfrage(eintragSchema, 'Eintrag ändern', `${adresse}/${encodeURIComponent(id)}`, 'PATCH', aenderung)
}

/** Einträge mit Uhrzeit, die den Zeitraum berühren (für Gezeitenkurve und Kalender). */
export function holeTermine(von: Date, bis: Date): Promise<Eintrag[]> {
  const q = new URLSearchParams({ von: von.toISOString(), bis: bis.toISOString() })
  return anfrage(eintraegeSchema, 'Termine holen', `/api/termine?${q}`)
}
