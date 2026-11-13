// Ordner des Postfachs für die zweite Ebene (docs/konzept/11-postfach.md): Systemordner, eigene als Baum, intelligente.
import type { Ordner } from '../vertrag/postfach'

export type OrdnerZeile = Ordner & { tiefe: number }

/** Teilt nach Art; eigene Ordner stehen als Baum (Unterordner direkt hinter ihrem Ordner, mit Tiefe). */
export function ordnerListe(ordner: readonly Ordner[]): { system: OrdnerZeile[]; eigene: OrdnerZeile[]; intelligent: OrdnerZeile[] } {
  const flach = (art: Ordner['art']) => ordner.filter((x) => x.art === art).map((x) => ({ ...x, tiefe: 0 }))
  const eigen = ordner.filter((x) => x.art === 'eigen')
  const ids = new Set(eigen.map((x) => x.id))
  const gesehen = new Set<string>()
  const eigene: OrdnerZeile[] = []
  const lege = (x: Ordner, tiefe: number) => {
    if (gesehen.has(x.id)) return
    gesehen.add(x.id)
    eigene.push({ ...x, tiefe })
    for (const k of eigen) if (k.eltern === x.id) lege(k, tiefe + 1)
  }
  for (const x of eigen) if (!x.eltern || !ids.has(x.eltern)) lege(x, 0)
  // Was übrig bleibt, hängt in einem Ring: der erste Ordner davon kommt nach oben.
  for (const x of eigen) lege(x, 0)
  return { system: flach('system'), eigene, intelligent: flach('intelligent') }
}
