// Kacheln: Anordnung je Seite und Geräteart (docs/konzept/04-kacheln.md). Raster wie Samsung One UI:
// quadratische Zellen, jede Kachel belegt ganze Zellen. Eingestellt wird die Zahl der Spalten; Zellgröße und Reihen
// rechnet `zellRaster` aus dem Platz. Zwischen Kacheln bleibt ein fester Anteil der Zelle als Abstand (unsichtbarer Rand je Kachel).
// Plätze sind frei: Eine Kachel bleibt, wo man sie lässt; nichts rückt nach oben. Liegt eine Kachel auf einer anderen,
// weicht die andere nach unten aus. Jede Kachel hängt oben oder unten (`unten`) und links oder rechts (`rechts`);
// auf größeren Bildschirmen wächst nur der Platz dazwischen. Gemerkt wird angedockt, gezeigt und bearbeitet
// wird auf dem Bildschirm, von oben links gezählt (`aufBildschirm`, `verankern`).
import { collides, getFirstCollision, sortLayoutItemsByRowCol } from 'react-grid-layout/core'
import type { Layout, LayoutItem } from 'react-grid-layout'
import type { Geraet } from './einstellungen'

export type Groesse = { w: number; h: number }
/** `unten`: hängt am unteren Rand, `y` zählt dann von dort. `rechts`: hängt am rechten Rand, `x` zählt dann von dort. */
export type Platz = Groesse & { x: number; y: number; unten?: true; rechts?: true }

/** Raster eines Bildschirms: so viele Spalten und Zeilen passen auf eine Bildschirmhöhe. */
export type Raster = { geraet: Geraet; spalten: number; zeilen: number }

export type KachelPlan = {
  id: string
  name: string
  /** Werkszustand; null heißt: auf diesem Gerät ab Werk ausgeblendet. */
  werk: Record<Geraet, Platz | null>
  /** Ab Werk ohne Hintergrund (freier Text auf dem Himmel). Umschaltbar im Menü der Kachel. */
  hintergrund?: false
  /** Ohne Kopfzeile mit dem Namen; im Bearbeiten-Modus greift man sie am Griff. */
  titel?: false
}

/** Ausgeblendete Kacheln haben keinen Platz. `ohneHintergrund` nennt die Kacheln ohne Fläche. */
export type Anordnung = { plaetze: Readonly<Record<string, Platz>>; versteckt: readonly string[]; ohneHintergrund: readonly string[] }

/** Zellraster auf einem sichtbaren Platz `breite` × `hoehe` mit `spalten` Spalten. `anteil`: Abstand zwischen Kacheln als Anteil der Zelle.
 *  `zelle` ist die Teilung (Kachel plus Abstand); eine Kachel aus n Zellen ist sichtbar n · zelle − abstand groß.
 *  Die Zellen bleiben quadratisch; was beim Runden der Reihen übrig bleibt, liegt gleichmäßig als `links`/`oben` am Rand. */
export function zellRaster(breite: number, hoehe: number, spalten: number, anteil: number) {
  const nachBreite = breite / (spalten - anteil)
  const reihen = Math.max(1, Math.round(hoehe / nachBreite + anteil))
  const zelle = hoehe > 0 ? Math.min(nachBreite, hoehe / (reihen - anteil)) : nachBreite
  const abstand = zelle * anteil
  return { zelle, reihen, abstand, links: Math.max(0, (breite - spalten * zelle + abstand) / 2), oben: Math.max(0, (hoehe - reihen * zelle + abstand) / 2) }
}

/** Kleiner wird keine Kachel: eine Zelle. Mindestgrößen je Kachel gibt es nicht. */
export const kleinste: Groesse = { w: 1, h: 1 }

/** Feste Größen im Menü der Kachel, in Zellen; „Breit“ nimmt die ganze Breite.
 *  „Klein“ ist die Standardgröße, mit der eine Kachel ohne Werksplatz kommt. */
export const festeGroessen = {
  klein: { w: 1, h: 1 },
  mittel: { w: 2, h: 2 },
  gross: { w: 4, h: 4 },
  breit: { w: Infinity, h: 2 },
  hoch: { w: 2, h: 4 },
} as const satisfies Record<string, Groesse>
export type FesteGroesse = keyof typeof festeGroessen
export const groessenNamen: Record<FesteGroesse, string> = { klein: 'Klein', mittel: 'Mittel', gross: 'Groß', breit: 'Breit', hoch: 'Hoch' }

const ganz = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n)

/** Platz auf dem Bildschirm in die Grenzen bringen: kleinste Größe, Spaltenzahl, nicht über den Rand. */
function begrenzt({ x, y, w, h }: Platz, r: Raster): Platz {
  const breite = Math.min(r.spalten, Math.max(kleinste.w, w))
  return { x: Math.max(0, Math.min(x, r.spalten - breite)), y: Math.max(0, y), w: breite, h: Math.max(kleinste.h, h) }
}

export function alsLayout(a: Anordnung, plan: readonly KachelPlan[]): LayoutItem[] {
  return plan.filter((k) => !a.versteckt.includes(k.id) && a.plaetze[k.id]).map((k) => ({ i: k.id, ...a.plaetze[k.id], minW: kleinste.w, minH: kleinste.h }))
}

/** Stand aus dem Layout des Bausteins übernehmen. Ohne Änderung bleibt das alte Objekt (wichtig für „Rückgängig"). */
export function ausLayout(a: Anordnung, layout: Layout): Anordnung {
  const plaetze = { ...a.plaetze }
  let anders = false
  for (const { i, x, y, w, h } of layout) {
    const alt = plaetze[i]
    if (alt && alt.x === x && alt.y === y && alt.w === w && alt.h === h) continue
    plaetze[i] = { x, y, w, h }
    anders = true
  }
  return anders ? { ...a, plaetze } : a
}

/** Überlappungen auf dem Bildschirm auflösen, ohne etwas nach oben zu holen: Wer im Weg liegt, rutscht unter das Hindernis.
 *  `zuerst` behält seinen Platz (die gerade bewegte Kachel). */
function aufloesen(a: Anordnung, plan: readonly KachelPlan[], zuerst?: string): Anordnung {
  const sortiert = sortLayoutItemsByRowCol(alsLayout(a, plan))
  const reihe = zuerst ? [...sortiert.filter((l) => l.i === zuerst), ...sortiert.filter((l) => l.i !== zuerst)] : sortiert
  const gesetzt: LayoutItem[] = []
  for (const l of reihe) {
    const item = { ...l }
    for (let hindernis = getFirstCollision(gesetzt, item); hindernis; hindernis = getFirstCollision(gesetzt, item)) item.y = hindernis.y + hindernis.h
    gesetzt.push(item)
  }
  return ausLayout(a, gesetzt)
}

const ohneHintergrundAbWerk = (plan: readonly KachelPlan[]) => plan.filter((k) => k.hintergrund === false).map((k) => k.id)

export function werkszustand(plan: readonly KachelPlan[], g: Geraet): Anordnung {
  const plaetze: Record<string, Platz> = {}
  const versteckt: string[] = []
  for (const k of plan) {
    const p = k.werk[g]
    if (p) plaetze[k.id] = p
    else versteckt.push(k.id)
  }
  return { plaetze, versteckt, ohneHintergrund: ohneHintergrundAbWerk(plan) }
}

/** Gemerkte Anordnung lesen. Unbekanntes fällt weg, Fehlendes oder Unlesbares kommt aus dem Werk.
 *  Anordnungen aus älteren Rastern (ohne `raster: 'zellen'`) passen nicht in das Zellraster; für sie gilt das Werk. */
export function anordnungAusDaten(roh: unknown, plan: readonly KachelPlan[], g: Geraet): Anordnung {
  const d = typeof roh === 'object' && roh !== null ? (roh as Record<string, unknown>) : {}
  if (d.raster !== 'zellen') return werkszustand(plan, g)
  const gemerkt = typeof d.plaetze === 'object' && d.plaetze !== null ? (d.plaetze as Record<string, Record<string, unknown>>) : {}
  const plaetze: Record<string, Platz> = {}
  const ids = new Set(plan.map((k) => k.id))
  const bekannte = (liste: unknown) => (Array.isArray(liste) ? liste.filter((v): v is string => typeof v === 'string' && ids.has(v)) : null)
  const versteckt = bekannte(d.versteckt) ?? []
  for (const k of plan) {
    const p = gemerkt[k.id]
    const gut = p && ganz(p.x) && ganz(p.y) && ganz(p.w) && ganz(p.h) && p.w > 0 && p.h > 0
    const platz: Platz | null = gut
      ? { x: p.x as number, y: p.y as number, w: p.w as number, h: p.h as number, ...(p.unten === true ? { unten: true as const } : {}), ...(p.rechts === true ? { rechts: true as const } : {}) }
      : k.werk[g]
    // Ohne Platz (ab Werk ausgeblendet und nie geholt) bleibt die Kachel ausgeblendet.
    if (platz) plaetze[k.id] = platz
    else if (!versteckt.includes(k.id)) versteckt.push(k.id)
  }
  return { plaetze, versteckt, ohneHintergrund: bekannte(d.ohneHintergrund) ?? ohneHintergrundAbWerk(plan) }
}

/** Die gemerkte, angedockte Anordnung auf einem Bildschirm: Unten und rechts hängende Kacheln enden am Rand.
 *  Ist der Bildschirm zu klein, wird zu Breites schmaler und was im Weg liegt, rutscht nach unten. Das Ergebnis zählt von oben links. */
export function aufBildschirm(a: Anordnung, plan: readonly KachelPlan[], r: Raster): Anordnung {
  const plaetze = Object.fromEntries(
    Object.entries(a.plaetze).map(([id, p]) => {
      const w = Math.min(p.w, r.spalten)
      return [id, begrenzt({ x: p.rechts ? r.spalten - w - p.x : p.x, y: p.unten ? r.zeilen - p.h - p.y : p.y, w, h: p.h }, r)]
    }),
  )
  return aufloesen({ ...a, plaetze }, plan)
}

/** Umkehrung von `aufBildschirm` zum Speichern: Liegt die Mitte einer Kachel in der unteren (rechten) Hälfte, hängt sie unten (rechts).
 *  Was ganz oder teilweise unter dem Bildschirm liegt (erst durch Scrollen sichtbar), hängt oben. */
export function verankern(a: Anordnung, r: Raster): Anordnung {
  const plaetze = Object.fromEntries(
    Object.entries(a.plaetze).map(([id, { x, y, w, h }]) => {
      const unten = y + h / 2 >= r.zeilen / 2 && y + h <= r.zeilen
      const rechts = x + w / 2 >= r.spalten / 2 && x + w <= r.spalten
      return [
        id,
        { x: rechts ? r.spalten - w - x : x, y: unten ? r.zeilen - h - y : y, w, h, ...(unten ? { unten: true as const } : {}), ...(rechts ? { rechts: true as const } : {}) },
      ]
    }),
  )
  return { ...a, plaetze }
}

function aendern(a: Anordnung, plan: readonly KachelPlan[], r: Raster, id: string, neu: (p: Platz) => Platz): Anordnung {
  const alt = a.plaetze[id]
  if (!alt || !plan.some((k) => k.id === id)) return a
  const p = begrenzt(neu(alt), r)
  if (p.x === alt.x && p.y === alt.y && p.w === alt.w && p.h === alt.h) return a
  return aufloesen({ ...a, plaetze: { ...a.plaetze, [id]: p } }, plan, id)
}

export function setzeGroesse(a: Anordnung, plan: readonly KachelPlan[], r: Raster, id: string, groesse: FesteGroesse): Anordnung {
  return aendern(a, plan, r, id, (p) => ({ ...p, ...festeGroessen[groesse] }))
}

/** Beim Ziehen: Kennungen der Kacheln, mit denen sich `id` gerade überschneidet (sie zeigen ihre Grenze). */
export function getroffen(layout: Layout, id: string): string[] {
  const gezogen = layout.find((l) => l.i === id)
  return gezogen ? layout.filter((l) => l.i !== id && collides(l, gezogen)).map((l) => l.i) : []
}

/** Beim Ziehen: Alle außer `id` stehen, wo sie in `basis` stehen (vor dem Ziehen oder nach dem Ausweichen); nichts wird weggeschoben. */
export function stehenLassen(layout: Layout, basis: Layout, id: string): Layout {
  const platz = new Map(basis.map((l) => [l.i, l]))
  return layout.map((l) => {
    const b = platz.get(l.i)
    return l.i === id || !b ? l : { ...l, x: b.x, y: b.y, w: b.w, h: b.h }
  })
}

/** Ziehen oder Größe ändern beendet (oder lange genug verweilt): `id` bleibt, wo sie im Layout des Bausteins steht;
 *  wer im Weg liegt, weicht nach unten aus. Ohne Änderung bleibt das alte Objekt. */
export function ablegen(a: Anordnung, plan: readonly KachelPlan[], r: Raster, layout: Layout, id: string): Anordnung {
  const l = layout.find((x) => x.i === id)
  const rest = ausLayout(a, layout.filter((x) => x.i !== id))
  return l ? aendern(rest, plan, r, id, () => ({ x: l.x, y: l.y, w: l.w, h: l.h })) : rest
}

/** Umschalt und Pfeiltasten: Breite und Höhe um je eine Linie, nach rechts nur bis zum Rand. */
export function groesseAendern(a: Anordnung, plan: readonly KachelPlan[], r: Raster, id: string, dw: number, dh: number): Anordnung {
  return aendern(a, plan, r, id, (p) => ({ ...p, w: Math.min(p.w + dw, r.spalten - p.x), h: p.h + dh }))
}

/** Pfeiltasten: um eine Linie, wie Ziehen. Kacheln im Weg weichen nach unten aus, Lücken bleiben. */
export function verschiebe(a: Anordnung, plan: readonly KachelPlan[], r: Raster, id: string, dx: number, dy: number): Anordnung {
  return aendern(a, plan, r, id, (p) => ({ ...p, x: p.x + dx, y: p.y + dy }))
}

export function ausblenden(a: Anordnung, id: string): Anordnung {
  return a.versteckt.includes(id) ? a : { ...a, versteckt: [...a.versteckt, id] }
}

/** Wieder einblenden: kommt in Werksgröße (sonst Standardgröße) ans Ende der Seite. */
export function einblenden(a: Anordnung, plan: readonly KachelPlan[], r: Raster, id: string): Anordnung {
  const k = plan.find((x) => x.id === id)
  if (!k || !a.versteckt.includes(id)) return a
  const ende = Math.max(0, ...alsLayout(a, plan).map((l) => l.y + l.h))
  const { w, h } = k.werk[r.geraet] ?? festeGroessen.klein
  return { ...a, versteckt: a.versteckt.filter((v) => v !== id), plaetze: { ...a.plaetze, [id]: begrenzt({ x: 0, y: ende, w, h }, r) } }
}

export function hatHintergrund(a: Anordnung, id: string): boolean {
  return !a.ohneHintergrund.includes(id)
}

export function hintergrundUmschalten(a: Anordnung, id: string): Anordnung {
  const ohne = a.ohneHintergrund.includes(id) ? a.ohneHintergrund.filter((v) => v !== id) : [...a.ohneHintergrund, id]
  return { ...a, ohneHintergrund: ohne }
}
