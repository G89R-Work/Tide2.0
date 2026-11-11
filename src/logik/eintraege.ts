import type { Aenderung, Eintrag } from '../vertrag/eintrag'

/** Wendet eine Änderung auf einen Eintrag an. Gibt eine neue Liste zurück; eintrag fehlt, wenn die id unbekannt ist. */
export function eintragAendern(liste: Eintrag[], id: string, aenderung: Aenderung, jetzt: Date) {
  const erlaubt: Aenderung = {}
  if (typeof aenderung.titel === 'string') erlaubt.titel = aenderung.titel
  if (typeof aenderung.erledigt === 'boolean') erlaubt.erledigt = aenderung.erledigt
  let eintrag: Eintrag | undefined
  const neu = liste.map((e) => {
    if (e.id !== id) return e
    eintrag = { ...e, ...erlaubt, geaendert: jetzt.toISOString() }
    return eintrag
  })
  return { liste: neu, eintrag }
}
