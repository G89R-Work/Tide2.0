// Ordner des Postfachs (docs/konzept/11-postfach.md): Systemordner, eigene als Baum, intelligente.
// Anzeige für die zweite Ebene und alle Änderungen als reine Rechnung auf der ganzen Liste (gespeichert wird die ganze Liste).
import type { Ordner, OrdnerStand } from '../vertrag/postfach'

export type OrdnerZeile = Ordner & {
  tiefe: number
  /** Hat sichtbare Unterordner (Knopf zum Ein- und Ausklappen) */
  kinder: boolean
  /** Eingeklappt: `zahl` enthält dann das Ungelesene aller Unterordner */
  zu: boolean
}
export type Lage = 'davor' | 'danach' | 'hinein'

/** Alle Unterordner in jeder Tiefe (ohne Ring-Endlosschleife). */
export function nachkommen(liste: readonly OrdnerStand[], id: string): string[] {
  const gefunden: string[] = []
  const suche = (eltern: string) => {
    for (const x of liste) {
      if (x.eltern === eltern && x.id !== id && !gefunden.includes(x.id)) {
        gefunden.push(x.id)
        suche(x.id)
      }
    }
  }
  suche(id)
  return gefunden
}

/** Für die Ordnerleiste: nach Art geteilt, eigene als Baum mit Tiefe; Eingeklapptes zählt mit, Ausgeblendetes steht in `versteckt`. */
export function ordnerListe(
  ordner: readonly Ordner[],
  zu: ReadonlySet<string> = new Set(),
): { system: OrdnerZeile[]; eigene: OrdnerZeile[]; intelligent: OrdnerZeile[]; versteckt: Ordner[] } {
  const zeile = (x: Ordner, tiefe: number, kinder: boolean, offen: boolean): OrdnerZeile => {
    const eingeklappt = kinder && !offen
    const zahl = eingeklappt ? nachkommen(ordner, x.id).reduce((s, k) => s + (ordner.find((y) => y.id === k)?.zahl ?? 0), x.zahl) : x.zahl
    return { ...x, tiefe, kinder, zu: eingeklappt, zahl }
  }
  const flach = (art: Ordner['art']) => ordner.filter((x) => x.art === art && x.angeheftet).map((x) => zeile(x, 0, false, true))
  const eigen = ordner.filter((x) => x.art === 'eigen')
  const ids = new Set(eigen.map((x) => x.id))
  const gesehen = new Set<string>()
  const eigene: OrdnerZeile[] = []
  const lege = (x: Ordner, tiefe: number) => {
    if (gesehen.has(x.id)) return
    gesehen.add(x.id)
    // Ausgeblendet: mitsamt Unterordnern weg, sonst kämen sie unten als „Ring“ wieder hoch.
    if (!x.angeheftet) return nachkommen(ordner, x.id).forEach((k) => gesehen.add(k))
    const kinder = eigen.filter((k) => k.eltern === x.id && k.angeheftet && !gesehen.has(k.id))
    const offen = !zu.has(x.id)
    eigene.push(zeile(x, tiefe, kinder.length > 0, offen))
    if (offen) for (const k of kinder) lege(k, tiefe + 1)
    else nachkommen(ordner, x.id).forEach((k) => gesehen.add(k))
  }
  for (const x of eigen) if (!x.eltern || !ids.has(x.eltern)) lege(x, 0)
  // Was übrig bleibt, hängt in einem Ring: der erste Ordner davon kommt nach oben.
  for (const x of eigen) if (!gesehen.has(x.id)) lege(x, 0)
  return { system: flach('system'), eigene, intelligent: flach('intelligent'), versteckt: ordner.filter((x) => !x.angeheftet) }
}

/** Hängt einen eigenen Ordner (mit seinen Unterordnern) in `eltern` oder mit `null` ganz nach oben, ans Ende. Null, wenn das nicht geht. */
export function verschiebeNach<T extends OrdnerStand>(liste: readonly T[], id: string, eltern: string | null): T[] | null {
  const x = liste.find((o) => o.id === id)
  if (!x || x.art !== 'eigen') return null
  if (eltern !== null) {
    const ziel = liste.find((o) => o.id === eltern)
    if (!ziel || ziel.art !== 'eigen' || eltern === id || nachkommen(liste, id).includes(eltern)) return null
  }
  const { eltern: _alt, ...rest } = x
  return [...liste.filter((o) => o.id !== id), (eltern === null ? rest : { ...rest, eltern }) as T]
}

/** Ordnet `id` davor, danach oder in `ziel` ein (Ziehen). Systemordner und intelligente Ordner nur umsortieren, nie verschachteln. */
export function einordnen<T extends OrdnerStand>(liste: readonly T[], id: string, ziel: string, lage: Lage): T[] | null {
  const x = liste.find((o) => o.id === id)
  const z = liste.find((o) => o.id === ziel)
  if (!x || !z || id === ziel || x.art !== z.art) return null
  if (lage === 'hinein') return verschiebeNach(liste, id, ziel)
  if (nachkommen(liste, id).includes(ziel)) return null
  const { eltern: _alt, ...rest } = x
  const neu = (z.eltern ? { ...rest, eltern: z.eltern } : rest) as T
  const ohne = liste.filter((o) => o.id !== id)
  const i = ohne.findIndex((o) => o.id === ziel) + (lage === 'danach' ? 1 : 0)
  return [...ohne.slice(0, i), neu, ...ohne.slice(i)]
}

/** Anheften holt auch alle Eltern in die Leiste; Ausblenden betrifft nur den Ordner (seine Unterordner verschwinden mit ihm). */
export function anheften<T extends OrdnerStand>(liste: readonly T[], id: string, an: boolean): T[] {
  const betroffen = new Set([id])
  if (an) {
    for (let x = liste.find((o) => o.id === id); x?.eltern && !betroffen.has(x.eltern); x = liste.find((o) => o.id === x?.eltern)) betroffen.add(x.eltern)
  }
  return liste.map((o) => (betroffen.has(o.id) ? { ...o, angeheftet: an } : o))
}

/** Hängt einen neuen Ordner ans Ende; null, wenn er nicht stimmig ist (Grund über `ordnerFehler`). */
export function neuerOrdner<T extends OrdnerStand>(liste: readonly T[], ordner: T): T[] | null {
  const neu = [...liste, ordner]
  return ordnerFehler(neu) ? null : neu
}

/** Löscht einen eigenen oder intelligenten Ordner samt Unterordnern; Systemordner nie. */
export function loesche<T extends OrdnerStand>(liste: readonly T[], id: string): T[] | null {
  const x = liste.find((o) => o.id === id)
  if (!x || x.art === 'system') return null
  const weg = new Set([id, ...nachkommen(liste, id)])
  return liste.filter((o) => !weg.has(o.id))
}

/** Prüft einen Stand, wie der Server ihn annimmt; liefert den Grund oder null. */
export function ordnerFehler(liste: readonly OrdnerStand[]): string | null {
  const ids = new Set<string>()
  for (const x of liste) {
    if (ids.has(x.id)) return `Ordner „${x.id}“ doppelt`
    ids.add(x.id)
  }
  for (const x of liste) {
    if (x.eltern !== undefined) {
      const e = liste.find((o) => o.id === x.eltern)
      if (x.art !== 'eigen' || e?.art !== 'eigen') return `Ordner „${x.name}“: Eltern-Ordner geht nur bei eigenen Ordnern`
      if (nachkommen(liste, x.id).includes(x.id) || nachkommen(liste, x.id).includes(x.eltern)) return `Ordner „${x.name}“ liegt in sich selbst`
    }
    if (x.farbe !== undefined && x.art !== 'eigen') return `Ordner „${x.name}“: Farbe geht nur bei eigenen Ordnern`
    if ((x.art === 'intelligent') !== (x.suche !== undefined)) return `Ordner „${x.name}“: Suche gehört genau zu intelligenten Ordnern`
  }
  return null
}

/** Nur was Tide ändern darf (ohne Zähler und Hervorhebung). */
export function stand(liste: readonly Ordner[]): OrdnerStand[] {
  return liste.map(({ zahl: _z, wichtig: _w, ...rest }) => rest)
}
