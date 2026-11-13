import { aktionen } from '../logik/aktionen'
import { ortAusMarke } from '../logik/ebenen'
import type { Antwortart } from '../logik/schreiben'
import type { Mail } from '../vertrag/postfach'
import { kurveUmschalten } from './einstellungen'
import { rueckgaengig, wiederherstellen } from './rueckgaengig'

type MailAktionen = typeof import('./mailAktionen')

/** Wirkt auf die gewählten Mails, wenn das Postfach offen ist; sonst nichts. Die Aktionen laden erst mit dem ersten Druck. */
const mitMails = (tun: (a: MailAktionen, ms: Mail[]) => Promise<void>) => async () => {
  const ort = ortAusMarke(location.hash)
  if (ort.bereich !== 'postfach' || !ort.unter) return
  const a = await import('./mailAktionen')
  const ms = a.gewaehlteMails(ort.unter)
  if (ms.length) await tun(a, ms)
}

/** Antwort oder Weiterleitung: nur, wenn genau eine Mail gewählt ist. */
const antwort = (art: Antwortart) => mitMails((a, ms) => (ms.length === 1 && ms[0] ? a.antworte(ms[0], art) : Promise.resolve()))

// Was Aktionen mit `befehl` tun. Eine neue Befehls-Aktion braucht hier eine Zeile.
const befehle: Record<string, () => unknown> = {
  rueckgaengig: () => rueckgaengig(),
  wiederherstellen: () => wiederherstellen(),
  kurve: () => kurveUmschalten(ortAusMarke(location.hash).bereich),
  'neue-mail': () => void import('./mailAktionen').then((a) => a.neueMail()),
  'mail-antworten': antwort('antworten'),
  'mail-allen-antworten': antwort('allen'),
  'mail-weiterleiten': antwort('weiterleiten'),
  'mail-archivieren': mitMails((a, ms) => a.archiviere(ms)),
  'mail-loeschen': mitMails((a, ms) => a.loesche(ms)),
  'mail-ungelesen': mitMails((a, ms) => a.schalte(ms, 'ungelesen')),
  'mail-anheften': mitMails((a, ms) => a.schalte(ms, 'angeheftet')),
  'mail-wichtig': mitMails((a, ms) => a.schalte(ms, 'wichtig')),
}

if (import.meta.env.DEV)
  for (const a of aktionen) if (a.befehl && !befehle[a.id]) console.warn(`Aktion ${a.id} hat keinen Befehl (src/geruest/befehle.ts)`)

export function fuehreAus(id: string) {
  const b = befehle[id]
  if (!b) throw new Error(`Aktion ${id} hat keinen Befehl (src/geruest/befehle.ts)`)
  void b()
}
