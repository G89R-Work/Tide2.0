// Kacheln: Anordnung je Seite und Geräteart (docs/konzept/04-kacheln.md).
// Verschieben, Kollisionen und Nachrücken rechnet react-grid-layout; hier nur Regeln, Prüfen und feste Größen.
import { moveElement, verticalCompactor } from 'react-grid-layout/core'
import type { Layout, LayoutItem } from 'react-grid-layout'
import type { Geraet } from './einstellungen'

export type Groesse = { w: number; h: number }
export type Platz = Groesse & { x: number; y: number }

export type KachelPlan = {
  id: string
  name: string
  /** Kleiner wird die Kachel nicht, damit ihr Inhalt nicht bricht. */
  min: Record<Geraet, Groesse>
  /** Werkszustand; null heißt: auf diesem Gerät ab Werk ausgeblendet. */
  werk: Record<Geraet, Platz | null>
  /** Ab Werk ohne Hintergrund (freier Text auf dem Himmel). Umschaltbar im Menü der Kachel. */
  hintergrund?: false
  /** Ohne Kopfzeile mit dem Namen; im Bearbeiten-Modus greift man sie am Griff. */
  titel?: false
}

/** Ausgeblendete Kacheln haben keinen Platz. `ohneHintergrund` nennt die Kacheln ohne Fläche. */
export type Anordnung = { plaetze: Readonly<Record<string, Platz>>; versteckt: readonly string[]; ohneHintergrund: readonly string[] }

export const spalten: Record<Geraet, number> = { pc: 12, handy: 2 }

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

/** Platz in die Grenzen bringen: Mindestgröße, Spaltenzahl, nicht über den Rand. */
function begrenzt(p: Platz, k: KachelPlan, g: Geraet): Platz {
  const w = Math.min(spalten[g], Math.max(k.min[g].w, p.w))
  const h = Math.max(k.min[g].h, p.h)
  return { x: Math.max(0, Math.min(p.x, spalten[g] - w)), y: Math.max(0, p.y), w, h }
}

export function alsLayout(a: Anordnung, plan: readonly KachelPlan[], g: Geraet): LayoutItem[] {
  return plan
    .filter((k) => !a.versteckt.includes(k.id) && a.plaetze[k.id])
    .map((k) => ({ i: k.id, ...a.plaetze[k.id], minW: k.min[g].w, minH: k.min[g].h }))
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

/** Überlappungen auflösen und nach oben nachrücken, wie es der Baustein beim Ziehen tut. */
function ordnen(a: Anordnung, plan: readonly KachelPlan[], g: Geraet): Anordnung {
  return ausLayout(a, verticalCompactor.compact(alsLayout(a, plan, g), spalten[g]))
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

/** Gemerkte Anordnung lesen. Unbekanntes fällt weg, Fehlendes oder Unlesbares kommt aus dem Werk. */
export function anordnungAusDaten(roh: unknown, plan: readonly KachelPlan[], g: Geraet): Anordnung {
  const d = typeof roh === 'object' && roh !== null ? (roh as Record<string, unknown>) : {}
  const gemerkt = typeof d.plaetze === 'object' && d.plaetze !== null ? (d.plaetze as Record<string, Record<string, unknown>>) : {}
  const plaetze: Record<string, Platz> = {}
  const ids = new Set(plan.map((k) => k.id))
  const bekannte = (liste: unknown) => (Array.isArray(liste) ? liste.filter((v): v is string => typeof v === 'string' && ids.has(v)) : null)
  const versteckt = bekannte(d.versteckt) ?? []
  for (const k of plan) {
    const p = gemerkt[k.id]
    const gut = p && ganz(p.x) && ganz(p.y) && ganz(p.w) && ganz(p.h)
    const platz = gut ? begrenzt({ x: p.x as number, y: p.y as number, w: p.w as number, h: p.h as number }, k, g) : k.werk[g]
    // Ohne Platz (ab Werk ausgeblendet und nie geholt) bleibt die Kachel ausgeblendet.
    if (platz) plaetze[k.id] = platz
    else if (!versteckt.includes(k.id)) versteckt.push(k.id)
  }
  const ohneHintergrund = bekannte(d.ohneHintergrund) ?? ohneHintergrundAbWerk(plan)
  return ordnen({ plaetze, versteckt, ohneHintergrund }, plan, g)
}

function aendern(a: Anordnung, plan: readonly KachelPlan[], g: Geraet, id: string, neu: (p: Platz) => Platz): Anordnung {
  const k = plan.find((x) => x.id === id)
  const alt = a.plaetze[id]
  if (!k || !alt) return a
  const p = begrenzt(neu(alt), k, g)
  if (p.x === alt.x && p.y === alt.y && p.w === alt.w && p.h === alt.h) return a
  return ordnen({ ...a, plaetze: { ...a.plaetze, [id]: p } }, plan, g)
}

export function setzeGroesse(a: Anordnung, plan: readonly KachelPlan[], g: Geraet, id: string, groesse: FesteGroesse): Anordnung {
  return aendern(a, plan, g, id, (p) => ({ ...p, ...festeGroessen[groesse][g] }))
}

/** Umschalt und Pfeiltasten: Breite und Höhe um je eine Stufe. */
export function groesseAendern(a: Anordnung, plan: readonly KachelPlan[], g: Geraet, id: string, dw: number, dh: number): Anordnung {
  return aendern(a, plan, g, id, (p) => ({ ...p, w: Math.min(p.w + dw, spalten[g] - p.x), h: p.h + dh }))
}

/** Pfeiltasten: wie Ziehen um ein Feld. Kacheln im Weg weichen aus. */
export function verschiebe(a: Anordnung, plan: readonly KachelPlan[], g: Geraet, id: string, dx: number, dy: number): Anordnung {
  const k = plan.find((x) => x.id === id)
  const alt = a.plaetze[id]
  if (!k || !alt) return a
  const ziel = begrenzt({ ...alt, x: alt.x + dx, y: alt.y + dy }, k, g)
  if (ziel.x === alt.x && ziel.y === alt.y) return a
  const layout = alsLayout(a, plan, g)
  const item = layout.find((l) => l.i === id)
  if (!item) return a
  // Nach unten über die Kachel darunter springen, sonst rückt sie gleich wieder nach oben.
  const unten = dy > 0 ? Math.max(ziel.y, ...layout.filter((l) => l.i !== id && l.y === alt.y + alt.h && l.x < alt.x + alt.w && alt.x < l.x + l.w).map((l) => l.y + l.h - alt.h + 1)) : ziel.y
  const bewegt = moveElement(layout, item, ziel.x, unten, true, false, 'vertical', spalten[g])
  return ausLayout(a, verticalCompactor.compact(bewegt, spalten[g]))
}

export function ausblenden(a: Anordnung, id: string): Anordnung {
  return a.versteckt.includes(id) ? a : { ...a, versteckt: [...a.versteckt, id] }
}

/** Wieder einblenden: kommt in Werksgröße ans Ende der Seite. */
export function einblenden(a: Anordnung, plan: readonly KachelPlan[], g: Geraet, id: string): Anordnung {
  const k = plan.find((x) => x.id === id)
  if (!k || !a.versteckt.includes(id)) return a
  const sichtbar = alsLayout(a, plan, g)
  const ende = Math.max(0, ...sichtbar.map((l) => l.y + l.h))
  const groesse = k.werk[g] ?? k.min[g]
  const neu = { ...a, versteckt: a.versteckt.filter((v) => v !== id), plaetze: { ...a.plaetze, [id]: { w: groesse.w, h: groesse.h, x: 0, y: ende } } }
  return ordnen(neu, plan, g)
}

export function hatHintergrund(a: Anordnung, id: string): boolean {
  return !a.ohneHintergrund.includes(id)
}

export function hintergrundUmschalten(a: Anordnung, id: string): Anordnung {
  const ohne = a.ohneHintergrund.includes(id) ? a.ohneHintergrund.filter((v) => v !== id) : [...a.ohneHintergrund, id]
  return { ...a, ohneHintergrund: ohne }
}
