import type { Mail } from '../vertrag/postfach'

/** Erfundene Mail für Tests; alles Ungesagte ist leer oder aus. */
export const testMail = (id: string, x: Partial<Mail> = {}): Mail => ({
  id,
  ordner: 'eingang',
  konto: 'ich@beispiel.de',
  von: `Absender ${id}`,
  adresse: `${id}@beispiel.de`,
  betreff: `Betreff ${id}`,
  vorschau: '',
  zeit: '2026-11-13T08:00:00.000Z',
  ungelesen: false,
  angeheftet: false,
  wichtig: false,
  nachverfolgen: false,
  anhaenge: [],
  kategorien: [],
  brauchtDich: false,
  ...x,
})
