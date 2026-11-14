// Vertrag: der Schichtplan als Rhythmus (docs/konzept/17-arbeit.md). Gilt für die Attrappe und den späteren Server gleich.
// Die Rechnung dazu steht in src/logik/rhythmus.ts; die Schichten erscheinen als Einträge der Art „schicht“ unter /api/termine.
import { z } from 'zod'
import { anfrage } from './anfrage'
import { ordnerFarbeSchema } from './postfach'

const uhr = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Uhrzeit als HH:MM')

export const schichtartSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  beginn: uhr,
  /** Nicht nach dem Beginn heißt: am Folgetag. */
  ende: uhr,
  /** Dieselben Farben wie eigene Ordner (src/werte/ordner.ts). */
  farbe: ordnerFarbeSchema,
  /** Pause in Minuten; zählt nicht zur Arbeitszeit. */
  pause: z.number().int().min(0),
})
export type Schichtart = z.infer<typeof schichtartSchema>

/** Montag bis Sonntag je eine Schichtart (id) oder `null` für frei. */
export const wochenmusterSchema = z.object({ id: z.string(), name: z.string().min(1), tage: z.array(z.string().nullable()).length(7) })
export type Wochenmuster = z.infer<typeof wochenmusterSchema>

/** Ein Wochenmuster läuft so viele Wochen; nach dem letzten Abschnitt beginnt die Abfolge von vorn. */
export const abschnittSchema = z.object({ muster: z.string(), wochen: z.number().int().min(1) })
export type Abschnitt = z.infer<typeof abschnittSchema>

export const ausnahmeartSchema = z.enum(['tausch', 'urlaub', 'krank', 'zusatz'])
export type Ausnahmeart = z.infer<typeof ausnahmeartSchema>

/** Überschreibt den Rhythmus nur an `tag`. Tausch und Zusatzschicht nennen die Schichtart (Tausch ohne: frei). */
export const ausnahmeSchema = z.object({ tag: z.iso.date(), art: ausnahmeartSchema, schicht: z.string().optional() })
export type Ausnahme = z.infer<typeof ausnahmeSchema>

export const rhythmusSchema = z
  .object({
    arten: z.array(schichtartSchema),
    muster: z.array(wochenmusterSchema),
    abfolge: z.array(abschnittSchema),
    /** Erster Tag des Plans; seine Woche ist die erste Woche der Abfolge. */
    start: z.iso.date(),
    ausnahmen: z.array(ausnahmeSchema),
  })
  .refine((r) => r.muster.every((m) => m.tage.every((t) => t === null || r.arten.some((a) => a.id === t))), 'Wochenmuster nennt eine unbekannte Schichtart')
  .refine((r) => r.abfolge.every((a) => r.muster.some((m) => m.id === a.muster)), 'Abfolge nennt ein unbekanntes Wochenmuster')
  .refine((r) => r.ausnahmen.every((a) => a.schicht === undefined || r.arten.some((x) => x.id === a.schicht)), 'Ausnahme nennt eine unbekannte Schichtart')
export type Rhythmus = z.infer<typeof rhythmusSchema>

const adresse = '/api/arbeit/rhythmus'

export function holeRhythmus(): Promise<Rhythmus> {
  return anfrage(rhythmusSchema, 'Schichtplan holen', adresse)
}

/** Ersetzt den ganzen Rhythmus; Antwort: der gespeicherte Stand. */
export function speichereRhythmus(r: Rhythmus): Promise<Rhythmus> {
  return anfrage(rhythmusSchema, 'Schichtplan speichern', adresse, 'PUT', r)
}
