// Kacheln: Anordnung je Seite und Geräteart (docs/konzept/04-kacheln.md).
// Plätze sind frei: Eine Kachel bleibt, wo man sie lässt; nichts rückt nach oben. Liegt eine Kachel auf einer anderen,
// weicht die andere nach unten aus. Das Raster hat am PC 12 und am Handy 2 Spalten, in der Feinheit „doppelt“ 24 und 4.
// Pläne (Werk, Mindestgrößen, feste Größen) stehen im einfachen Raster und werden für „doppelt“ umgerechnet.
import { getFirstCollision, sortLayoutItemsByRowCol } from 'react-grid-layout/core'
import type { Layout, LayoutItem } from 'react-grid-layout'
import type { Geraet } from './einstellungen'

export type Groesse = { w: number; h: number }
export type Platz = Groesse & { x: number; y: number }
/** Wie fein das Raster ist: 1 = einfach (12 / 2 Spalten), 2 = doppelt (24 / 4). */
export type Feinheit = 1 | 2

export type KachelPlan = {
  id: string
  name: string
  /** Kleiner wird die Kachel nicht, damit ihr Inhalt nicht bricht. Im einfachen Raster. */
  min: Record<Geraet, Groesse>
  /** Werkszustand im einfachen Raster; null heißt: auf diesem Gerät ab Werk ausgeblendet. */
  werk: Record<Geraet, Platz | null>
  /** Ab Werk ohne Hintergrund (freier Text auf dem Himmel). Umschaltbar im Menü der Kachel. */
  hintergrund?: false
  /** Ohne Kopfzeile mit dem Namen; im Bearbeiten-Modus greift man sie am Griff. */
  titel?: false
}

/** Ausgeblendete Kacheln haben keinen Platz. `ohneHintergrund` nennt die Kacheln ohne Fläche. `fein`: Raster der Plätze. */
export type Anordnung = { plaetze: Readonly<Record<string, Platz>>; versteckt: readonly string[]; ohneHintergrund: readonly string[]; fein: Feinheit }

const grundSpalten: Record<Geraet, number> = { pc: 12, handy: 2 }

export function spaltenVon(g: Geraet, fein: Feinheit): number {
  return grundSpalten[g] * fein
}

export const festeGroessen = {
  klein: { pc: { w: 3, h: 2 }, handy: { w: 1, h: 2 } },
  mittel: { pc: { w: 4, h: 3 }, handy: { w: 2, h: 2 } },
  gross: { pc: { w: 6, h: 4 }, handy: { w: 2, h: 4 } },
  breit: { pc: { w: 12, h: 2 }, handy: { w: 2, h: 2 } },
  hoch: { pc: { w: 3, h: 5 }, handy: { w: 1, h: 4 } },
} as const satisfies Record<string, Record<Geraet, Groesse>>
export type FesteGroesse = keyof typeof festeGroessen
export const groessenNamen: Record<FesteGroesse, string> = { klein: 'Klein', mittel: 'Mittel', gross: 'Groß', breit: 'Breit', hoch: 'Hoch' }

const ganz = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n)
const istFeinheit = (n: unknown): n is Feinheit => n === 1 || n === 2

/** Breiten und waagrechte Lagen von einer Feinheit in eine andere. Halbieren rundet; Überlappungen löst `aufloesen`. */
function waagrecht<T extends { w: number; x?: number }>(p: T, von: Feinheit, nach: Feinheit): T {
  if (von === nach) return p
  const f = nach / von
  return { ...p, w: Math.max(1, Math.round(p.w * f)), ...(p.x === undefined ? {} : { x: Math.round(p.x * f) }) }
}

const minVon = (k: KachelPlan, g: Geraet, fein: Feinheit): Groesse => waagrecht(k.min[g], 1, fein)

/** Platz in die Grenzen bringen: Mindestgröße, Spaltenzahl, nicht über den Rand. */
function begrenzt(p: Platz, k: KachelPlan, g: Geraet, fein: Feinheit): Platz {
  const min = minVon(k, g, fein)
  const spalten = spaltenVon(g, fein)
  const w = Math.min(spalten, Math.max(min.w, p.w))
  const h = Math.max(min.h, p.h)
  return { x: Math.max(0, Math.min(p.x, spalten - w)), y: Math.max(0, p.y), w, h }
}

export function alsLayout(a: Anordnung, plan: readonly KachelPlan[], g: Geraet): LayoutItem[] {
  return plan
    .filter((k) => !a.versteckt.includes(k.id) && a.plaetze[k.id])
    .map((k) => {
      const min = minVon(k, g, a.fein)
      return { i: k.id, ...a.plaetze[k.id], minW: min.w, minH: min.h }
    })
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

/** Überlappungen auflösen, ohne etwas nach oben zu holen: Wer im Weg liegt, rutscht unter das Hindernis.
 *  `zuerst` behält seinen Platz (die gerade bewegte Kachel). */
function aufloesen(a: Anordnung, plan: readonly KachelPlan[], g: Geraet, zuerst?: string): Anordnung {
  const sortiert = sortLayoutItemsByRowCol(alsLayout(a, plan, g))
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

export function werkszustand(plan: readonly KachelPlan[], g: Geraet, fein: Feinheit = 1): Anordnung {
  const plaetze: Record<string, Platz> = {}
  const versteckt: string[] = []
  for (const k of plan) {
    const p = k.werk[g]
    if (p) plaetze[k.id] = waagrecht(p, 1, fein)
    else versteckt.push(k.id)
  }
  return { plaetze, versteckt, ohneHintergrund: ohneHintergrundAbWerk(plan), fein }
}

/** Gemerkte Anordnung lesen und ins Raster `fein` umrechnen. Unbekanntes fällt weg, Fehlendes oder Unlesbares kommt aus dem Werk.
 *  Daten ohne Angabe zur Feinheit stammen aus dem einfachen Raster. */
export function anordnungAusDaten(roh: unknown, plan: readonly KachelPlan[], g: Geraet, fein: Feinheit = 1): Anordnung {
  const d = typeof roh === 'object' && roh !== null ? (roh as Record<string, unknown>) : {}
  const gemerktFein = istFeinheit(d.fein) ? d.fein : 1
  const gemerkt = typeof d.plaetze === 'object' && d.plaetze !== null ? (d.plaetze as Record<string, Record<string, unknown>>) : {}
  const plaetze: Record<string, Platz> = {}
  const ids = new Set(plan.map((k) => k.id))
  const bekannte = (liste: unknown) => (Array.isArray(liste) ? liste.filter((v): v is string => typeof v === 'string' && ids.has(v)) : null)
  const versteckt = bekannte(d.versteckt) ?? []
  for (const k of plan) {
    const p = gemerkt[k.id]
    const gut = p && ganz(p.x) && ganz(p.y) && ganz(p.w) && ganz(p.h)
    const roherPlatz = gut ? waagrecht({ x: p.x as number, y: p.y as number, w: p.w as number, h: p.h as number }, gemerktFein, fein) : k.werk[g] && waagrecht(k.werk[g], 1, fein)
    // Ohne Platz (ab Werk ausgeblendet und nie geholt) bleibt die Kachel ausgeblendet.
    if (roherPlatz) plaetze[k.id] = begrenzt(roherPlatz, k, g, fein)
    else if (!versteckt.includes(k.id)) versteckt.push(k.id)
  }
  const ohneHintergrund = bekannte(d.ohneHintergrund) ?? ohneHintergrundAbWerk(plan)
  return aufloesen({ plaetze, versteckt, ohneHintergrund, fein }, plan, g)
}

/** Dieselbe Anordnung in einem anderen Raster. */
export function umrechnen(a: Anordnung, plan: readonly KachelPlan[], g: Geraet, fein: Feinheit): Anordnung {
  if (a.fein === fein) return a
  const plaetze = Object.fromEntries(
    Object.entries(a.plaetze).map(([id, p]) => {
      const k = plan.find((x) => x.id === id)
      const neu = waagrecht(p, a.fein, fein)
      return [id, k ? begrenzt(neu, k, g, fein) : neu]
    }),
  )
  return aufloesen({ ...a, plaetze, fein }, plan, g)
}

function aendern(a: Anordnung, plan: readonly KachelPlan[], g: Geraet, id: string, neu: (p: Platz) => Platz): Anordnung {
  const k = plan.find((x) => x.id === id)
  const alt = a.plaetze[id]
  if (!k || !alt) return a
  const p = begrenzt(neu(alt), k, g, a.fein)
  if (p.x === alt.x && p.y === alt.y && p.w === alt.w && p.h === alt.h) return a
  return aufloesen({ ...a, plaetze: { ...a.plaetze, [id]: p } }, plan, g, id)
}

export function setzeGroesse(a: Anordnung, plan: readonly KachelPlan[], g: Geraet, id: string, groesse: FesteGroesse): Anordnung {
  return aendern(a, plan, g, id, (p) => ({ ...p, ...waagrecht(festeGroessen[groesse][g], 1, a.fein) }))
}

/** Umschalt und Pfeiltasten: Breite und Höhe um je ein Feld. */
export function groesseAendern(a: Anordnung, plan: readonly KachelPlan[], g: Geraet, id: string, dw: number, dh: number): Anordnung {
  return aendern(a, plan, g, id, (p) => ({ ...p, w: Math.min(p.w + dw, spaltenVon(g, a.fein) - p.x), h: p.h + dh }))
}

/** Pfeiltasten: um ein Feld, wie Ziehen. Kacheln im Weg weichen nach unten aus, Lücken bleiben. */
export function verschiebe(a: Anordnung, plan: readonly KachelPlan[], g: Geraet, id: string, dx: number, dy: number): Anordnung {
  return aendern(a, plan, g, id, (p) => ({ ...p, x: p.x + dx, y: p.y + dy }))
}

export function ausblenden(a: Anordnung, id: string): Anordnung {
  return a.versteckt.includes(id) ? a : { ...a, versteckt: [...a.versteckt, id] }
}

/** Wieder einblenden: kommt in Werksgröße ans Ende der Seite. */
export function einblenden(a: Anordnung, plan: readonly KachelPlan[], g: Geraet, id: string): Anordnung {
  const k = plan.find((x) => x.id === id)
  if (!k || !a.versteckt.includes(id)) return a
  const ende = Math.max(0, ...alsLayout(a, plan, g).map((l) => l.y + l.h))
  const groesse = waagrecht(k.werk[g] ?? k.min[g], 1, a.fein)
  return { ...a, versteckt: a.versteckt.filter((v) => v !== id), plaetze: { ...a.plaetze, [id]: { w: groesse.w, h: groesse.h, x: 0, y: ende } } }
}

export function hatHintergrund(a: Anordnung, id: string): boolean {
  return !a.ohneHintergrund.includes(id)
}

export function hintergrundUmschalten(a: Anordnung, id: string): Anordnung {
  const ohne = a.ohneHintergrund.includes(id) ? a.ohneHintergrund.filter((v) => v !== id) : [...a.ohneHintergrund, id]
  return { ...a, ohneHintergrund: ohne }
}
