// Vertrag: Grundfelder, die jeder Eintrag in Tide hat (Mail, Termin, To-do, Notiz …).
// Gilt für die Attrappe und den späteren Server gleich.

export type Art = 'aufgabe' | 'notiz' | 'termin' | 'mail' | 'einkauf'

export type Eintrag = {
  id: string
  art: Art
  titel: string
  erledigt: boolean
  /** ISO-Zeitpunkt der Anlage */
  erstellt: string
  /** ISO-Zeitpunkt der letzten Änderung */
  geaendert: string
  /** ISO-Zeitpunkt des Beginns, nur bei Einträgen mit Uhrzeit (Termin, Schicht) */
  beginn?: string
  /** ISO-Zeitpunkt des Endes, gehört zu `beginn` */
  ende?: string
}

/** Was sich an einem Eintrag ändern lässt. Beginn und Ende nur zusammen und nur bei Einträgen mit Uhrzeit. */
export type Aenderung = Partial<Pick<Eintrag, 'titel' | 'erledigt' | 'beginn' | 'ende'>>

const adresse = '/api/eintraege'

async function antwort<T>(lauf: Promise<Response>, was: string): Promise<T> {
  const r = await lauf
  if (!r.ok) throw new Error(`${was} fehlgeschlagen: ${r.status} ${await r.text()}`)
  return (await r.json()) as T
}

export function holeEintraege(): Promise<Eintrag[]> {
  return antwort(fetch(adresse), 'Einträge holen')
}

export function aendereEintrag(id: string, aenderung: Aenderung): Promise<Eintrag> {
  return antwort(
    fetch(`${adresse}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aenderung),
    }),
    'Eintrag ändern',
  )
}

/** Einträge mit Uhrzeit, die den Zeitraum berühren (für Gezeitenkurve und Kalender). */
export function holeTermine(von: Date, bis: Date): Promise<Eintrag[]> {
  const q = new URLSearchParams({ von: von.toISOString(), bis: bis.toISOString() })
  return antwort(fetch(`/api/termine?${q}`), 'Termine holen')
}
