import { markeFuer } from '../logik/ebenen'
import { kategorieUmschalten, mailsText, umschalten } from '../logik/mails'
import { regelAenderungen, regelAusMail } from '../logik/regeln'
import { antwortEntwurf, neuerEntwurf, type Antwortart } from '../logik/schreiben'
import type { Entwurf, Mail, Ordner, Regel } from '../vertrag/postfach'
import { aendereMailsMitSchritt, eintragAnlegenMitSchritt, kontenJetzt, mailInhaltJetzt, mailsJetzt, neuerEntwurfMitSchritt, sendenMitSchritt } from './daten'
import { mailAuswahlJetzt, waehleMails } from './mailAuswahl'
import { regelId, setzeRegelEntwurf } from './regelEntwurf'

// Jede Aktion auf einer oder mehreren Mails, einmal für Leser, Menü und Tastenkürzel. Jede lässt sich zurücknehmen.

/** „„Betreff““ bei einer Mail, sonst „3 Mails“ – für die Texte der Rückgängig-Schritte. */
const was = (ms: readonly Mail[]) => (ms.length === 1 ? `„${ms[0]?.betreff}“` : mailsText(ms.length))
const mit = (ms: readonly Mail[], aenderung: Omit<Parameters<typeof aendereMailsMitSchritt>[0][number], 'id'>) => ms.map((m) => ({ ...aenderung, id: m.id }))

export function verschiebe(ms: readonly Mail[], ziel: Pick<Ordner, 'id' | 'name'>) {
  return aendereMailsMitSchritt(mit(ms, { ordner: ziel.id }), `${was(ms)} liegt jetzt in „${ziel.name}“`)
}

export const archiviere = (ms: readonly Mail[]) => aendereMailsMitSchritt(mit(ms, { ordner: 'archiv' }), `${was(ms)} archiviert`)
export const loesche = (ms: readonly Mail[]) => aendereMailsMitSchritt(mit(ms, { ordner: 'papierkorb' }), `${was(ms)} gelöscht`)

const schalterText = {
  ungelesen: ['als ungelesen markiert', 'als gelesen markiert'],
  angeheftet: ['angeheftet', 'gelöst'],
  wichtig: ['als wichtig markiert', 'nicht mehr wichtig'],
} as const

/** Schaltet für alle um: sind alle an, gehen alle aus, sonst alle an. */
export function schalte(ms: readonly Mail[], feld: keyof typeof schalterText) {
  const liste = umschalten(ms, feld)
  const an = liste[0]?.[feld] === true
  return aendereMailsMitSchritt(liste, `${was(ms)} ${schalterText[feld][an ? 0 : 1]}`)
}

/** Beim Öffnen gelesen: zurücknehmbar, aber ohne Meldung. */
export const gelesen = (m: Mail) => aendereMailsMitSchritt([{ id: m.id, ungelesen: false }], `${was([m])} gelesen`, true)

export function kategorie(ms: readonly Mail[], name: string) {
  const weg = ms.every((m) => m.kategorien.includes(name))
  return aendereMailsMitSchritt(kategorieUmschalten(ms, name), `${was(ms)} ${weg ? 'ohne' : 'mit'} Kategorie „${name}“`)
}

/** Nachverfolgen bis `faellig` („JJJJ-MM-TT“) oder ohne Datum (`null`); `name` steht im Text. */
export const nachverfolgen = (ms: readonly Mail[], faellig: string | null, name: string) =>
  aendereMailsMitSchritt(mit(ms, { nachverfolgen: true, faellig }), `${was(ms)} nachverfolgen: ${name}`)

export const nichtNachverfolgen = (ms: readonly Mail[]) => aendereMailsMitSchritt(mit(ms, { nachverfolgen: false, faellig: null }), `${was(ms)} erledigt`)

/** Zurückstellen bis `zeit`; dann kommt die Mail wieder in den Posteingang. */
export const erinnere = (ms: readonly Mail[], zeit: Date, name: string) =>
  aendereMailsMitSchritt(mit(ms, { ordner: 'zurueckgestellt', erinnernAm: zeit.toISOString() }), `${was(ms)} zurückgestellt: ${name}`)

/** Die gewählten Mails im Ordner `offen` (für Tastenkürzel); gehört die Auswahl zu einem anderen Ordner, keine. */
export function gewaehlteMails(offen: string): Mail[] {
  const { ordner, ids } = mailAuswahlJetzt()
  if (ordner !== offen) return []
  const set = new Set(ids)
  return mailsJetzt(ordner).filter((m) => set.has(m.id))
}

// ── Schreiben

/** Legt einen Entwurf an. Antworten bleiben unter ihrer Mail, alles andere öffnet sich in „Entwürfe“. */
async function entwerfe(entwurf: Entwurf, text: string) {
  const id = `entwurf-${crypto.randomUUID().slice(0, 8)}`
  if (!(await neuerEntwurfMitSchritt(id, entwurf, text)) || entwurf.antwortAuf) return
  location.hash = markeFuer('postfach', 'entwuerfe')
  waehleMails('entwuerfe', { ids: [id], anker: id })
}

const antwortText: Record<Antwortart, string> = { antworten: 'Antwort', allen: 'Antwort an alle', weiterleiten: 'Weiterleitung' }

/** Antwort, Antwort an alle oder Weiterleitung als Entwurf, vom Konto, an das die Mail ging. */
export async function antworte(m: Mail, art: Antwortart) {
  const [konten, inhalt] = await Promise.all([kontenJetzt(), mailInhaltJetzt(m.id)])
  await entwerfe(antwortEntwurf(m, inhalt, art, konten), `${antwortText[art]} auf ${was([m])} angelegt`)
}

export async function neueMail() {
  await entwerfe(neuerEntwurf(await kontenJetzt()), 'Neue Mail angelegt')
}

export const verwerfe = (m: Mail) => aendereMailsMitSchritt([{ id: m.id, ordner: 'papierkorb' }], `Entwurf ${was([m])} verworfen`)

/** Senden: sofort (`am = null`, kurz rückholbar) oder geplant; `name` beschreibt die Zeit („Morgen früh“). */
export const sende = (m: Mail, am: Date | null, name?: string) => sendenMitSchritt(m.id, am, false, am ? `${was([m])} geplant: ${name ?? ''}` : `${was([m])} gesendet`)

/** Holt eine geplante Mail zurück in die Entwürfe. */
export const holeZurueck = (m: Mail) => sendenMitSchritt(m.id, m.sendenAm ? new Date(m.sendenAm) : null, true, `${was([m])} zurückgeholt`)

// ── Regeln

/** Öffnet eine vorbereitete Regel für Mails dieser Adresse im Editor; gespeichert wird erst dort. */
export function regelVonMail(m: Mail) {
  setzeRegelEntwurf(regelAusMail(m, regelId()))
  location.hash = markeFuer('postfach', 'regeln')
}

/** Führt die Regel jetzt auf dem Posteingang aus (ein Schritt für „Rückgängig“); liefert die Zahl geänderter Mails. */
export async function fuehreRegelAus(r: Pick<Regel, 'name' | 'bedingung' | 'aktionen'>): Promise<number> {
  const liste = regelAenderungen(r, mailsJetzt('eingang'))
  if (liste.length) await aendereMailsMitSchritt(liste, `„${r.name}“ ausgeführt: ${mailsText(liste.length)}`)
  return liste.length
}

// ── Aus dem Erkannt-Kasten

/** Nicht mehr in „Braucht dich“. */
export const erledigt = (ms: readonly Mail[]) => aendereMailsMitSchritt(mit(ms, { brauchtDich: false }), `${was(ms)} erledigt`)

/** Aufgabe aus der Mail, mit Frist („JJJJ-MM-TT“) oder ohne; Rückgängig löscht sie. */
export const alsAufgabe = (titel: string, frist?: string) =>
  eintragAnlegenMitSchritt({ id: `aufgabe-${crypto.randomUUID().slice(0, 8)}`, art: 'aufgabe', titel, ...(frist ? { frist } : {}) }, frist ? `Frist „${titel}“ eingetragen` : `To-do „${titel}“ angelegt`)
