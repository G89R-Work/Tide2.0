// Zentrale Liste aller Einstellungen (docs/konzept/20-einstellungen.md).
// Neue Option = eine Zeile in `einstellungen`. Seite, Suche und „Auf Standard" entstehen daraus.
// Gemerkt werden nur Abweichungen vom Standard; je Geräteart unter „<id>@pc" bzw. „<id>@handy".
import { bereiche, type BereichId } from './bereiche'

export type Geraet = 'pc' | 'handy'
export type Wert = boolean | number | string
/** Gespeicherte Abweichungen vom Standard. */
export type Werte = Readonly<Record<string, Wert>>
/** Was sich ändert: neuer Wert, oder null für „zurück auf Standard". */
export type WerteAenderung = Readonly<Record<string, Wert | null>>

export const abschnitte = [
  { id: 'start', name: 'Grundlegendes' },
  { id: 'konten', name: 'Konten und Kalender', gruppe: 'Allgemein' },
  { id: 'benachrichtigungen', name: 'Benachrichtigungen', gruppe: 'Allgemein' },
  { id: 'darstellung', name: 'Darstellung', gruppe: 'Allgemein' },
  { id: 'navigation', name: 'Seitenleiste und Leisten', gruppe: 'Allgemein' },
  { id: 'kurve', name: 'Gezeitenkurve', gruppe: 'Allgemein' },
  { id: 'schreiben', name: 'Sprache und Schreiben', gruppe: 'Allgemein' },
  { id: 'raeume', name: 'Privat und Arbeit', gruppe: 'Allgemein' },
  { id: 'daten', name: 'Daten und Sicherung', gruppe: 'Allgemein' },
  { id: 'nutzer', name: 'Nutzer und Räume', gruppe: 'Allgemein' },
  { id: 'heute', name: 'Heute', gruppe: 'Bereiche' },
  { id: 'postfach', name: 'Postfach', gruppe: 'Bereiche' },
  { id: 'kalender', name: 'Kalender', gruppe: 'Bereiche' },
  { id: 'todos', name: 'To-dos', gruppe: 'Bereiche' },
  { id: 'einkauf', name: 'Einkauf und Kochen', gruppe: 'Bereiche' },
  { id: 'finanzen', name: 'Finanzen', gruppe: 'Bereiche' },
  { id: 'arbeit', name: 'Arbeit', gruppe: 'Bereiche' },
  { id: 'notizen', name: 'Notizen', gruppe: 'Bereiche' },
] as const satisfies readonly { id: string; name: string; gruppe?: string }[]

export type AbschnittId = (typeof abschnitte)[number]['id']

type Basis = {
  id: string
  name: string
  abschnitt: Exclude<AbschnittId, 'start'>
  hilfe?: string
  /** Gilt je Geräteart getrennt (Anordnungen, Größen). */
  jeGeraet?: true
  /** Erscheint zusätzlich unter „Grundlegendes". */
  wichtig?: true
  /** Abweichender Standard am Handy; nur mit `jeGeraet`. */
  standardHandy?: Wert
}
export type Einstellung = Basis &
  (
    | { art: 'schalter'; standard: boolean }
    | { art: 'auswahl'; standard: string; optionen: readonly (readonly [wert: string, name: string])[] }
    | { art: 'text'; standard: string; laenge: number }
    | { art: 'zahl'; standard: number; min: number; max: number; einheit?: string; /** Raster, ab Werk 1 (ganze Zahlen). */ schritt?: number }
  )

const bundeslaender = [
  ['bund', 'Nur bundesweite'], ['bw', 'Baden-Württemberg'], ['by', 'Bayern'], ['be', 'Berlin'], ['bb', 'Brandenburg'],
  ['hb', 'Bremen'], ['hh', 'Hamburg'], ['he', 'Hessen'], ['mv', 'Mecklenburg-Vorpommern'], ['ni', 'Niedersachsen'],
  ['nw', 'Nordrhein-Westfalen'], ['rp', 'Rheinland-Pfalz'], ['sl', 'Saarland'], ['sn', 'Sachsen'], ['st', 'Sachsen-Anhalt'],
  ['sh', 'Schleswig-Holstein'], ['th', 'Thüringen'],
] as const

export const einstellungen: readonly Einstellung[] = [
  { id: 'morgen-zusammenfassung', name: 'Morgen-Zusammenfassung', abschnitt: 'benachrichtigungen', art: 'schalter', standard: true, wichtig: true, hilfe: 'Am Morgen ein Überblick über den Tag' },
  { id: 'ebbe-modus', name: 'Ebbe-Modus', abschnitt: 'benachrichtigungen', art: 'schalter', standard: false, hilfe: 'Von 22:30 bis 7:00 warten Meldungen bis zum Morgen; Wichtiges kommt sofort' },
  { id: 'design', name: 'Design', abschnitt: 'darstellung', art: 'auswahl', standard: 'glut', optionen: [['glut', 'Glut'], ['tinte', 'Tinte']], wichtig: true },
  { id: 'schriftgroesse', name: 'Schriftgröße', abschnitt: 'darstellung', art: 'auswahl', standard: 'normal', optionen: [['klein', 'Klein'], ['normal', 'Normal'], ['gross', 'Groß']], jeGeraet: true, wichtig: true },
  { id: 'bahn', name: 'Bahn von Sonne und Mond', abschnitt: 'darstellung', art: 'auswahl', standard: 'bogen', optionen: [['bogen', 'Bogen'], ['echt', 'Echt']] },
  { id: 'ort-breite', name: 'Ort: Breite', abschnitt: 'darstellung', art: 'zahl', standard: 51.31, min: -90, max: 90, schritt: 0.01, einheit: '°', hilfe: 'Nord plus, Süd minus' },
  { id: 'ort-laenge', name: 'Ort: Länge', abschnitt: 'darstellung', art: 'zahl', standard: 9.49, min: -180, max: 180, schritt: 0.01, einheit: '°', hilfe: 'Ost plus, West minus' },
  { id: 'mond-nachts', name: 'Mond nur nachts', abschnitt: 'darstellung', art: 'schalter', standard: true },
  { id: 'hintergrund-tageszeit', name: 'Hintergrund folgt der Tageszeit', abschnitt: 'darstellung', art: 'schalter', standard: true },
  { id: 'wellen-hoehe', name: 'Höhe der Wellen', abschnitt: 'darstellung', art: 'auswahl', standard: 'gold', optionen: [['viertel', 'Viertel'], ['drittel', 'Drittel'], ['gold', 'Goldener Schnitt'], ['haelfte', 'Hälfte']], hilfe: 'Anteil der Seitenhöhe' },
  { id: 'wellen', name: 'Wellen', abschnitt: 'darstellung', art: 'schalter', standard: true },
  { id: 'bewegung', name: 'Bewegung', abschnitt: 'darstellung', art: 'schalter', standard: true, hilfe: 'Aus: keine Animationen' },
  { id: 'kurve-stunden', name: 'Sichtbare Stunden', abschnitt: 'kurve', art: 'zahl', standard: 4, standardHandy: 6, min: 3, max: 8, einheit: 'Std.', jeGeraet: true, wichtig: true, hilfe: 'Am Handy ab Werk mehr als am PC' },
  { id: 'kurve-ganzer-tag', name: 'Ganzer Tag', abschnitt: 'kurve', art: 'schalter', standard: false, jeGeraet: true, hilfe: 'Zeigt alle 24 Stunden auf einmal' },
  { id: 'kurve-band-hoehe', name: 'Höhe der Bänder', abschnitt: 'kurve', art: 'zahl', standard: 76, min: 20, max: 100, einheit: '%', jeGeraet: true, hilfe: 'Lange Termine wie Schichten, als Anteil der Kurvenhöhe' },
  { id: 'kurve-eingeklappt', name: 'Eingeklappt', abschnitt: 'kurve', art: 'schalter', standard: false, jeGeraet: true },
  { id: 'kurve-wetter', name: 'Wetter', abschnitt: 'kurve', art: 'schalter', standard: true, jeGeraet: true, hilfe: 'Temperatur und Regen als feine Zeile über der Kurve' },
  { id: 'kurve-lage', name: 'Lage', abschnitt: 'kurve', art: 'auswahl', standard: 'unten', optionen: [['unten', 'Unten'], ['oben', 'Oben']], jeGeraet: true, hilfe: 'Am PC am oberen oder unteren Rand, am Handy über der Leiste' },
  { id: 'leiste-breite', name: 'Breite der Seitenleiste', abschnitt: 'navigation', art: 'auswahl', standard: 'schmal', optionen: [['schmal', 'Schmal, nur Symbole'], ['breit', 'Breit, mit Namen']], wichtig: true, hilfe: 'Am PC und Tablet' },
  // Sichtbar je Seite: ein Schalter je Bereich (docs/konzept/06-gezeitenkurve.md).
  ...bereiche.map((b) => ({ id: `kurve-zeigen-${b.id}`, name: `Zeigen auf ${b.name}`, abschnitt: 'kurve' as const, art: 'schalter' as const, standard: true, jeGeraet: true as const, hilfe: `Kurve auf der Seite ${b.name}; der Knopf „Gezeitenkurve ein/aus“ schaltet die offene Seite` })),
  { id: 'name', name: 'Dein Name', abschnitt: 'nutzer', art: 'text', standard: 'Moritz', laenge: 30, wichtig: true, hilfe: 'Für die Begrüßung auf Heute; leer lässt den Namen weg' },
  { id: 'heute-uhr', name: 'Uhr', abschnitt: 'heute', art: 'schalter', standard: true, jeGeraet: true, hilfe: 'Uhrzeit mit Anteil des Tages und der Schicht' },
  { id: 'rechtschreibung', name: 'Rechtschreibprüfung', abschnitt: 'schreiben', art: 'schalter', standard: true },
  { id: 'wochenbeginn', name: 'Wochenbeginn', abschnitt: 'kalender', art: 'auswahl', standard: 'montag', optionen: [['montag', 'Montag'], ['sonntag', 'Sonntag']], wichtig: true },
  { id: 'kalenderwoche', name: 'Kalenderwoche anzeigen', abschnitt: 'kalender', art: 'schalter', standard: true },
  { id: 'bundesland', name: 'Bundesland für Feiertage', abschnitt: 'kalender', art: 'auswahl', standard: 'bund', optionen: bundeslaender },
  { id: 'archivfrist', name: 'Erledigtes ins Archiv nach', abschnitt: 'todos', art: 'zahl', standard: 30, min: 1, max: 365, einheit: 'Tagen' },
]

const zeigen = new Map(bereiche.map((b) => [b.id, einstellungen.find((e) => e.id === `kurve-zeigen-${b.id}`)!]))

/** Schalter „Kurve zeigen" einer Seite. */
export const kurveZeigen = (bereich: BereichId): Einstellung => zeigen.get(bereich)!

export function einstellungenIn(abschnitt: AbschnittId): Einstellung[] {
  return einstellungen.filter((e) => (abschnitt === 'start' ? e.wichtig : e.abschnitt === abschnitt))
}

const schluessel = (e: Einstellung, geraet: Geraet) => (e.jeGeraet ? `${e.id}@${geraet}` : e.id)

const imRaster = (w: number, schritt: number) => Math.abs(w / schritt - Math.round(w / schritt)) < 1e-6

const standardVon = (e: Einstellung, geraet: Geraet): Wert => (geraet === 'handy' && e.standardHandy !== undefined ? e.standardHandy : e.standard)

function gueltig(e: Einstellung, w: unknown): w is Wert {
  switch (e.art) {
    case 'schalter':
      return typeof w === 'boolean'
    case 'auswahl':
      return e.optionen.some(([o]) => o === w)
    case 'text':
      return typeof w === 'string' && w.length <= e.laenge
    case 'zahl':
      return typeof w === 'number' && imRaster(w, e.schritt ?? 1) && w >= e.min && w <= e.max
  }
}

export function wertVon(e: Einstellung, werte: Werte, geraet: Geraet): Wert {
  const w = werte[schluessel(e, geraet)]
  return gueltig(e, w) ? w : standardVon(e, geraet)
}

export function istStandard(e: Einstellung, werte: Werte, geraet: Geraet): boolean {
  return wertVon(e, werte, geraet) === standardVon(e, geraet)
}

/** Neuer Stand mit diesem Wert. Ungültiges ändert nichts (gleiches Objekt zurück). */
export function setze(werte: Werte, e: Einstellung, geraet: Geraet, wert: Wert): Werte {
  if (!gueltig(e, wert)) return werte
  const { [schluessel(e, geraet)]: _, ...rest } = werte
  return wert === standardVon(e, geraet) ? rest : { ...rest, [schluessel(e, geraet)]: wert }
}

export function zuruecksetzen(werte: Werte, liste: readonly Einstellung[], geraet: Geraet): Werte {
  const weg = new Set(liste.map((e) => schluessel(e, geraet)))
  return Object.fromEntries(Object.entries(werte).filter(([k]) => !weg.has(k)))
}

const flach = (t: string) =>
  t.toLocaleLowerCase('de').replaceAll('ß', 'ss').normalize('NFD').replace(/\p{Diacritic}/gu, '')

/** Alle Wörter müssen in Name, Hilfe, Abschnitt oder Auswahl vorkommen. */
export function suche(text: string): Einstellung[] {
  const woerter = flach(text).split(/\s+/).filter(Boolean)
  return einstellungen.filter((e) => {
    const abschnitt = abschnitte.find((a) => a.id === e.abschnitt)?.name ?? ''
    const optionen = e.art === 'auswahl' ? e.optionen.map(([, n]) => n).join(' ') : ''
    const heuhaufen = flach(`${e.name} ${e.hilfe ?? ''} ${abschnitt} ${optionen}`)
    return woerter.every((w) => heuhaufen.includes(w))
  })
}

/** Vom Server Geliefertes prüfen: nur bekannte Schlüssel mit gültigem Wert bleiben. */
export function werteAusDaten(daten: unknown): Werte {
  if (!daten || typeof daten !== 'object' || Array.isArray(daten)) return {}
  const geraete: Geraet[] = ['pc', 'handy']
  const raus: Record<string, Wert> = {}
  for (const e of einstellungen) {
    for (const k of e.jeGeraet ? geraete.map((g) => schluessel(e, g)) : [e.id]) {
      const w = (daten as Record<string, unknown>)[k]
      if (gueltig(e, w)) raus[k] = w
    }
  }
  return raus
}

export function unterschied(alt: Werte, neu: Werte): WerteAenderung {
  const raus: Record<string, Wert | null> = {}
  for (const k of Object.keys(alt)) if (!(k in neu)) raus[k] = null
  for (const [k, w] of Object.entries(neu)) if (alt[k] !== w) raus[k] = w
  return raus
}

export function werteAendern(werte: Werte, aenderung: WerteAenderung): Werte {
  const raus: Record<string, Wert> = { ...werte }
  for (const [k, w] of Object.entries(aenderung)) {
    if (w === null) delete raus[k]
    else raus[k] = w
  }
  return raus
}
