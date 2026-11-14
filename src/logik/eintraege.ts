import type { Aenderung, Eintrag } from '../vertrag/eintrag'

/** Wendet eine Änderung auf einen Eintrag an. Gibt eine neue Liste zurück; eintrag fehlt, wenn die id unbekannt ist. */
export function eintragAendern(liste: Eintrag[], id: string, aenderung: Aenderung, jetzt: Date) {
  const erlaubt: Aenderung = {}
  if (typeof aenderung.titel === 'string') erlaubt.titel = aenderung.titel
  if (typeof aenderung.erledigt === 'boolean') erlaubt.erledigt = aenderung.erledigt
  if (typeof aenderung.text === 'string') erlaubt.text = aenderung.text
  if (aenderung.beginn !== undefined || aenderung.ende !== undefined) Object.assign(erlaubt, zeitraum(aenderung))
  let eintrag: Eintrag | undefined
  const neu = liste.map((e) => {
    if (e.id !== id) return e
    if (erlaubt.beginn && !e.beginn) throw new Error(`Eintrag ${id} hat keine Uhrzeit, die sich verschieben ließe`)
    eintrag = { ...e, ...erlaubt, geaendert: jetzt.toISOString() }
    return eintrag
  })
  return { liste: neu, eintrag }
}

/** Prüft neue Uhrzeiten: beide zusammen, lesbar, Ende nach Beginn. Wirft mit Grund. */
function zeitraum({ beginn, ende }: Aenderung): { beginn: string; ende: string } {
  if (typeof beginn !== 'string' || typeof ende !== 'string') throw new Error('Beginn und Ende kommen nur zusammen')
  const [b, e] = [Date.parse(beginn), Date.parse(ende)]
  if (Number.isNaN(b) || Number.isNaN(e)) throw new Error(`Zeit nicht lesbar: ${beginn} bis ${ende}`)
  if (e <= b) throw new Error(`Ende ${ende} liegt nicht nach dem Beginn ${beginn}`)
  return { beginn: new Date(b).toISOString(), ende: new Date(e).toISOString() }
}
