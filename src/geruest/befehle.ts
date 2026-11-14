import { aktionen } from '../logik/aktionen'
import { markeFuer, ortAusMarke } from '../logik/ebenen'
import type { Antwortart } from '../logik/schreiben'
import type { Mail } from '../vertrag/postfach'
import { kurveUmschalten } from './einstellungen'
import { rueckgaengig, wiederherstellen } from './rueckgaengig'

type MailAktionen = typeof import('./mailAktionen')

type MailBefehl = (a: MailAktionen, ms: Mail[]) => Promise<void>

/** Antwort oder Weiterleitung: nur, wenn genau eine Mail gewählt ist. */
const antwort =
  (art: Antwortart): MailBefehl =>
  (a, ms) =>
    ms.length === 1 && ms[0] ? a.antworte(ms[0], art) : Promise.resolve()

// Was Aktionen auf Mails tun: auf die gewählten (Knopf, Kürzel) oder auf genannte (Wischen am Handy).
const mailBefehle: Record<string, MailBefehl> = {
  'mail-antworten': antwort('antworten'),
  'mail-allen-antworten': antwort('allen'),
  'mail-weiterleiten': antwort('weiterleiten'),
  'mail-archivieren': (a, ms) => a.archiviere(ms),
  'mail-loeschen': (a, ms) => a.loesche(ms),
  'mail-ungelesen': (a, ms) => a.schalte(ms, 'ungelesen'),
  'mail-anheften': (a, ms) => a.schalte(ms, 'angeheftet'),
  'mail-wichtig': (a, ms) => a.schalte(ms, 'wichtig'),
  'mail-regel': async (a, ms) => (ms.length === 1 && ms[0] ? a.regelVonMail(ms[0]) : undefined),
}

/** Wirkt auf die gewählten Mails, wenn das Postfach offen ist; sonst nichts. Die Aktionen laden erst mit dem ersten Druck. */
const mitMails = (tun: MailBefehl) => async () => {
  const ort = ortAusMarke(location.hash)
  if (ort.bereich !== 'postfach' || !ort.unter) return
  const a = await import('./mailAktionen')
  const ms = a.gewaehlteMails(ort.unter)
  if (ms.length) await tun(a, ms)
}

/** Dieselbe Aktion auf genau diesen Mails (etwa die gewischte Zeile). */
export async function fuehreAusFuer(id: string, ms: Mail[]) {
  const b = mailBefehle[id]
  if (!b) throw new Error(`Aktion ${id} wirkt nicht auf Mails (src/geruest/befehle.ts)`)
  await b(await import('./mailAktionen'), ms)
}

/** Kalender: wechselt zwischen Monat und Woche (Unterpunkt in der Adresse); woanders nichts. */
function kalenderAnsicht() {
  const ort = ortAusMarke(location.hash)
  if (ort.bereich === 'kalender') location.hash = markeFuer('kalender', ort.unter === 'woche' ? 'monat' : 'woche')
}

// Was Aktionen mit `befehl` tun. Eine neue Befehls-Aktion braucht hier eine Zeile.
const befehle: Record<string, () => unknown> = {
  rueckgaengig: () => rueckgaengig(),
  wiederherstellen: () => wiederherstellen(),
  kurve: () => kurveUmschalten(ortAusMarke(location.hash).bereich),
  'kalender-ansicht': kalenderAnsicht,
  'neue-mail': () => void import('./mailAktionen').then((a) => a.neueMail()),
  ...Object.fromEntries(Object.entries(mailBefehle).map(([id, b]) => [id, mitMails(b)])),
}

if (import.meta.env.DEV)
  for (const a of aktionen) if (a.befehl && !befehle[a.id]) console.warn(`Aktion ${a.id} hat keinen Befehl (src/geruest/befehle.ts)`)

export function fuehreAus(id: string) {
  const b = befehle[id]
  if (!b) throw new Error(`Aktion ${id} hat keinen Befehl (src/geruest/befehle.ts)`)
  void b()
}
