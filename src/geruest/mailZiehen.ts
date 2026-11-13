import { z } from 'zod'

// Was beim Ziehen von Mails mitgeht: die ids und der Ordner, aus dem sie kommen.
// Die Mail-Liste schreibt es, die Ordnerleiste liest es; beide nur über diese Datei.
const schema = z.object({ mails: z.array(z.string()).min(1), aus: z.string() })
export type GezogeneMails = z.infer<typeof schema>

export const mailDaten = (d: GezogeneMails): Record<string, unknown> => ({ ...d })

/** Gezogene Mails aus den Daten des Zieh-Bausteins; bei allem anderen (etwa einem Ordner) null. */
export function gezogeneMails(daten: Record<string, unknown>): GezogeneMails | null {
  const r = schema.safeParse(daten)
  return r.success ? r.data : null
}
