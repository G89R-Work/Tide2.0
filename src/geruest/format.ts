// Datumsformate der Seite Heute, einmal angelegt: Intl-Formate neu zu bauen kostet bei jedem Tag spürbar Zeit.
const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('de-DE', o)

const formate = {
  uhrzeit: f({ hour: '2-digit', minute: '2-digit' }),
  datumLang: f({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  tagLang: f({ weekday: 'long', day: 'numeric', month: 'long' }),
  tagKurz: f({ weekday: 'short' }),
  monat: f({ month: 'long' }),
  monatKurz: f({ month: 'short' }),
  monatJahr: f({ month: 'long', year: 'numeric' }),
}

export const uhrzeit = (d: Date) => formate.uhrzeit.format(d)
export const datumLang = (d: Date) => formate.datumLang.format(d)
export const tagLang = (d: Date) => formate.tagLang.format(d)
export const tagKurz = (d: Date) => formate.tagKurz.format(d).replace('.', '')
export const monatName = (d: Date) => formate.monat.format(d)
export const monatKurz = (d: Date) => formate.monatKurz.format(d)
export const monatJahr = (d: Date) => formate.monatJahr.format(d)
