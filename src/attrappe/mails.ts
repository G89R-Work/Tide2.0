import { subMinutes } from 'date-fns'
import { tagSchluessel } from '../logik/zeit'
import type { Hinweis, Kategorie, Mail, MailInhalt } from '../vertrag/postfach'

// 500 erfundene Beispielmails für den Prototyp: zuerst einige ausgeschriebene, dann erzeugte aus festen Bausteinen
// (immer dieselben, damit ids und Inhalt beim Neuladen gleich bleiben). Zeiten zählen rückwärts ab dem Laden.
export const ANZAHL_MAILS = 500

export const beispielKategorien: Kategorie[] = [
  { name: 'Wichtig', farbe: 'koralle' },
  { name: 'Rechnung', farbe: 'sand' },
  { name: 'Familie', farbe: 'salbei' },
  { name: 'Zeliha', farbe: 'glut' },
  { name: 'Newsletter', farbe: 'flieder' },
  { name: 'Behörde', farbe: 'meer' },
]

const ich = 'ich@beispiel.example'
const familie = 'familie@beispiel.example'

type Teil = Partial<Mail> & Pick<Mail, 'von' | 'adresse' | 'betreff' | 'vorschau'>

const ausgeschrieben: Teil[] = [
  { von: 'Stadtwerke Pforzheim', adresse: 'service@stadtwerke-pforzheim.example', betreff: 'Ihr neuer Abschlag ab Dezember', vorschau: 'Aufgrund gestiegener Beschaffungskosten passen wir Ihren monatlichen Abschlag zum 1. Dezember an.', ungelesen: true, wichtig: true, kategorien: ['Wichtig'], hinweis: 'Handeln', brauchtDich: true },
  { von: 'Zeliha', adresse: 'zeliha@beispiel.example', konto: familie, betreff: 'Samstag Kino?', vorschau: 'Hast du Samstag Lust auf Kino? Ich hab für 20 Uhr schon zwei Plätze reserviert.', ungelesen: true, angeheftet: true, kategorien: ['Zeliha'], hinweis: 'Antworten', brauchtDich: true },
  { von: 'HUK-Coburg', adresse: 'schaden@huk-coburg.example', betreff: 'Ihr Schadenfall 2026-1187', vorschau: 'Zur Bearbeitung benötigen wir noch ein Foto des Displays sowie die Kaufrechnung.', nachverfolgen: true, hinweis: 'Handeln', brauchtDich: true },
  { von: 'DHL', adresse: 'noreply@dhl.example', betreff: 'Ihr Paket kommt morgen', vorschau: 'Zustellung morgen zwischen 10 und 14 Uhr. Sendungsnummer 0034 0434 5567.', hinweis: 'Lesen' },
  { von: 'Hausarztpraxis Dr. Weber', adresse: 'praxis@dr-weber.example', betreff: 'Terminbestätigung Dienstag, 9:30 Uhr', vorschau: 'Blutabnahme am Dienstag um 9:30 Uhr. Bitte nüchtern erscheinen.', ungelesen: true, hinweis: 'Handeln', brauchtDich: true },
  { von: 'Mama', adresse: 'mama@beispiel.example', konto: familie, betreff: 'Sonntag Essen?', vorschau: 'Kommt ihr Sonntag zum Essen? Papa macht Rouladen.', kategorien: ['Familie'], hinweis: 'Antworten', brauchtDich: true },
  { von: 'Grundschule am Park', adresse: 'sekretariat@gs-park.example', konto: familie, betreff: 'Einladung zum Elternabend', vorschau: 'Wir laden herzlich zum Elternabend am Donnerstag um 19 Uhr ein.', ungelesen: true, kategorien: ['Familie'], anhaenge: ['Einladung.pdf'], hinweis: 'Lesen' },
  { von: 'Finanzamt Pforzheim', adresse: 'poststelle@fa-pforzheim.example', betreff: 'Bescheid für 2025 über Einkommensteuer', vorschau: 'Ihr Bescheid steht im Online-Postfach bereit. Einspruch ist binnen eines Monats möglich.', wichtig: true, kategorien: ['Behörde'], anhaenge: ['Bescheid-2025.pdf'], hinweis: 'Handeln', brauchtDich: true },
  { von: 'Telekom', adresse: 'rechnung@telekom.example', betreff: 'Ihre Rechnung für November', vorschau: 'Der Betrag von 44,95 € wird am 20. November abgebucht.', ordner: 'rechnungen', ungelesen: true, kategorien: ['Rechnung'], anhaenge: ['Rechnung-11-2026.pdf'] },
  { von: 'An: Zeliha', adresse: 'zeliha@beispiel.example', konto: familie, betreff: 'Re: Samstag Kino?', vorschau: 'Klingt gut, ich bin dabei!', ordner: 'entwuerfe' },
]

/** Absender der erzeugten Mails: Name, Adresse, Betreffe, Vorschau, Kategorie, eigener Ordner, Hinweis, Anhang. */
type Quelle = { von: string; adresse: string; betreffe: string[]; vorschau: string; kategorie?: string; ordner?: string; hinweis?: Hinweis; anhang?: string; konto?: string }
const quellen: Quelle[] = [
  { von: 'Zeit Online', adresse: 'newsletter@zeit.example', betreffe: ['Der Morgen', 'Was jetzt?', 'Die Woche im Rückblick'], vorschau: 'Guten Morgen! Das Wichtigste aus Politik, Wirtschaft und Kultur in fünf Minuten.', kategorie: 'Newsletter', ordner: 'newsletter', hinweis: 'Später' },
  { von: 'Amazon', adresse: 'versand@amazon.example', betreffe: ['Ihre Bestellung wurde versandt', 'Ihre Sendung ist unterwegs', 'Zugestellt: Ihr Paket'], vorschau: 'Ihre Sendung ist unterwegs und kommt voraussichtlich übermorgen an.', hinweis: 'Lesen' },
  { von: 'Sparkasse Pforzheim', adresse: 'info@sparkasse-pforzheim.example', betreffe: ['Neuer Kontoauszug', 'Ihre Mitteilung im Postfach', 'Änderung der Bedingungen'], vorschau: 'In Ihrem elektronischen Postfach liegt ein neues Dokument für Sie bereit.', anhang: 'Kontoauszug.pdf' },
  { von: 'Vodafone', adresse: 'rechnung@vodafone.example', betreffe: ['Ihre Rechnung ist da', 'Rechnung online verfügbar'], vorschau: 'Ihre aktuelle Rechnung über 29,99 € steht für Sie bereit.', kategorie: 'Rechnung', ordner: 'rechnungen', anhang: 'Rechnung.pdf' },
  { von: 'Allianz', adresse: 'kundenservice@allianz.example', betreffe: ['Beitragsrechnung Kfz-Versicherung', 'Ihre Versicherungsunterlagen'], vorschau: 'Anbei erhalten Sie die Unterlagen zu Ihrem Vertrag für das kommende Jahr.', ordner: 'auto', anhang: 'Unterlagen.pdf' },
  { von: 'Wohnbau GmbH', adresse: 'verwaltung@wohnbau.example', betreffe: ['Nebenkostenabrechnung', 'Ankündigung Wartung Heizung', 'Treppenhausreinigung'], vorschau: 'Wir möchten Sie über anstehende Arbeiten im Haus informieren.', ordner: 'haus' },
  { von: 'Lena', adresse: 'lena@beispiel.example', betreffe: ['Fotos vom Wochenende', 'Kurze Frage', 'Treffen nächste Woche?'], vorschau: 'Hey, hier sind die Fotos! Wann hast du nächste Woche Zeit?', hinweis: 'Antworten', konto: familie },
  { von: 'Grundschule am Park', adresse: 'sekretariat@gs-park.example', betreffe: ['Elternbrief', 'Ausflug in den Wildpark', 'Speiseplan'], vorschau: 'Liebe Eltern, anbei finden Sie die Informationen für die kommenden Wochen.', kategorie: 'Familie', ordner: 'schule', anhang: 'Elternbrief.pdf', konto: familie },
  { von: 'GitHub', adresse: 'noreply@github.example', betreffe: ['Neue Anmeldung bei deinem Konto', 'Wöchentliche Zusammenfassung'], vorschau: 'Wir haben eine neue Anmeldung von einem unbekannten Gerät festgestellt.', hinweis: 'Lesen' },
  { von: 'Bahn', adresse: 'buchung@bahn.example', betreffe: ['Ihre Fahrkarte', 'Verspätung Ihrer Verbindung', 'Buchungsbestätigung'], vorschau: 'Vielen Dank für Ihre Buchung. Ihre Fahrkarte finden Sie im Anhang.', anhang: 'Fahrkarte.pdf' },
  { von: 'Kino Rex', adresse: 'info@kino-rex.example', betreffe: ['Programm der Woche', 'Sneak Preview am Montag'], vorschau: 'Diese Woche neu im Programm und alle Spielzeiten auf einen Blick.', kategorie: 'Newsletter', ordner: 'newsletter', hinweis: 'Später' },
  { von: 'Stadt Pforzheim', adresse: 'buergerservice@pforzheim.example', betreffe: ['Ihr Antrag ist eingegangen', 'Abholung Personalausweis'], vorschau: 'Ihr Antrag wurde bearbeitet und kann abgeholt werden.', kategorie: 'Behörde', hinweis: 'Handeln' },
  { von: 'Fitnessstudio Aktiv', adresse: 'team@aktiv-fitness.example', betreffe: ['Neue Kurse im Dezember', 'Deine Mitgliedschaft'], vorschau: 'Ab Dezember gibt es neue Kurse am Abend. Jetzt anmelden!', kategorie: 'Newsletter', hinweis: 'Später' },
  { von: 'Gewinnspiel', adresse: 'spam@gewinn-sofort.example', betreffe: ['Sie haben gewonnen!!!'], vorschau: 'Klicken Sie jetzt, um Ihren Preis abzuholen.', ordner: 'junk' },
]

/** Ordner einer erzeugten Mail: meist Posteingang oder Archiv, jede zehnte im Ordner ihres Absenders. */
function ordnerVon(i: number, q: Quelle): string {
  if (q.ordner === 'junk') return 'junk'
  if (i % 97 === 0) return 'papierkorb'
  if (i % 61 === 0) return 'gesendet'
  const r = i % 10
  if (r === 7 && q.ordner) return q.ordner
  return r >= 4 && r <= 6 ? 'archiv' : r === 9 ? 'archiv' : 'eingang'
}

const leer = { ordner: 'eingang', konto: ich, ungelesen: false, angeheftet: false, wichtig: false, nachverfolgen: false, anhaenge: [], kategorien: [], brauchtDich: false }

/** Alle Beispielmails zum Zeitpunkt `jetzt`, neueste zuerst. */
export function beispielMails(jetzt: Date): Mail[] {
  // Abstände wachsen nach hinten: die ersten Mails sind von heute, die letzten etwa ein Vierteljahr alt.
  const zeit = (i: number) => subMinutes(jetzt, Math.round(7 * (i + 1) ** 1.6)).toISOString()
  return Array.from({ length: ANZAHL_MAILS }, (_, i): Mail => {
    const vorlage = ausgeschrieben[i]
    if (vorlage) {
      const faellig = vorlage.nachverfolgen ? { faellig: tagSchluessel(jetzt) } : {}
      return { ...leer, ...vorlage, ...faellig, id: `m-${i + 1}`, zeit: zeit(i) }
    }
    const q = quellen[(i * 5) % quellen.length]!
    return {
      ...leer,
      id: `m-${i + 1}`,
      ordner: ordnerVon(i, q),
      konto: q.konto ?? ich,
      von: q.von,
      adresse: q.adresse,
      betreff: q.betreffe[i % q.betreffe.length]!,
      vorschau: q.vorschau,
      zeit: zeit(i),
      ungelesen: i < 60 && i % 3 === 0,
      angeheftet: i === 23,
      nachverfolgen: i % 41 === 0,
      anhaenge: q.anhang ? [q.anhang] : [],
      kategorien: q.kategorie ? [q.kategorie] : [],
      ...(q.hinweis ? { hinweis: q.hinweis } : {}),
    }
  })
}

/** Empfänger und Text einer Beispielmail: Anrede, Vorschau als erster Absatz, Gruß. Jede siebte Mail geht auch in Kopie an das zweite Konto. */
export function beispielInhalt(m: Mail): MailInhalt {
  const nr = Number(m.id.replace(/\D/g, ''))
  const aus = m.von.startsWith('An: ')
  return {
    id: m.id,
    an: [aus ? m.adresse : m.konto],
    cc: nr % 7 === 0 ? [m.konto === ich ? familie : ich] : [],
    text: `Hallo,\n\n${m.vorschau}\n\nViele Grüße\n${aus ? 'ich' : m.von}`,
  }
}
