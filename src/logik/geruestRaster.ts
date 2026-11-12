// Gerüst am PC und Tablet im Zellraster der ganzen Seite (docs/konzept/04-kacheln.md, Fahrplan `raster-geruest`):
// Seitenleiste links, Gezeitenkurve unten (oder oben), zweite Ebene neben der Leiste, im Rest der Inhalt mit seinen Kacheln.
// Alles belegt ganze Zellen; so fluchten Leiste, Kurve und Kacheln. Rechnung der Zellen: `zellRaster`.
import { zellRaster } from './kacheln'

/** Ein Feld in ganzen Zellen, von oben links gezählt. */
export type Feld = { x: number; y: number; w: number; h: number }

export type GeruestEingabe = {
  /** Sichtbarer Platz unter der Kopfzeile, ohne Rand zum Bildschirm. */
  breite: number
  hoehe: number
  spalten: number
  /** Abstand zwischen Feldern als Anteil der Zelle. */
  anteil: number
  leiste: 'schmal' | 'breit'
  /** So breit muss die Leiste mit Namen mindestens sichtbar sein. */
  leisteNamenPx: number
  /** Breite der zweiten Ebene; 0 = keine. */
  ebenePx: number
  /** Reihen der Kurve; 0 = aus. */
  kurve: number
  kurveOben: boolean
  /** Wer unten (oder oben) über die ganze Breite geht: die Kurve oder die Leiste. */
  vorrang: 'kurve' | 'leiste'
}

/** Zellen, die mindestens `px` sichtbar breit sind. */
const zellenFuer = (px: number, zelle: number, abstand: number) => Math.max(1, Math.ceil((px + abstand) / zelle - 1e-9))

export function geruestRaster(e: GeruestEingabe) {
  const z = zellRaster(e.breite, e.hoehe, e.spalten, e.anteil)
  const kurveH = Math.min(e.kurve, z.reihen - 1)
  const lw = Math.min(e.leiste === 'schmal' ? 1 : Math.max(2, zellenFuer(e.leisteNamenPx, z.zelle, z.abstand)), e.spalten - 1)
  const ew = e.ebenePx > 0 ? Math.min(zellenFuer(e.ebenePx, z.zelle, z.abstand), e.spalten - lw - 1) : 0
  // Reihen ohne Kurve; die Kurve liegt am oberen oder unteren Rand.
  const y0 = e.kurveOben ? kurveH : 0
  const h = z.reihen - kurveH
  const leisteGanz = e.vorrang === 'leiste'
  const kurveY = e.kurveOben ? 0 : h
  return {
    ...z,
    spalten: e.spalten,
    leiste: leisteGanz ? { x: 0, y: 0, w: lw, h: z.reihen } : { x: 0, y: y0, w: lw, h },
    ebene: ew > 0 ? { x: lw, y: y0, w: ew, h } : null,
    kurve: kurveH > 0 ? (leisteGanz ? { x: lw, y: kurveY, w: e.spalten - lw, h: kurveH } : { x: 0, y: kurveY, w: e.spalten, h: kurveH }) : null,
    inhalt: { x: lw + ew, y: y0, w: e.spalten - lw - ew, h },
  } satisfies Record<string, unknown>
}

/** Sichtbare Fläche eines Feldes in Pixeln, bezogen auf den Platz der Eingabe. Die erste Zelle beginnt sichtbar am Rand
 *  (plus dem Rest `links`/`oben`); zwischen zwei Feldern liegt der Abstand. */
export function flaeche(z: { zelle: number; abstand: number; links: number; oben: number }, f: Feld) {
  return {
    left: z.links + f.x * z.zelle,
    top: z.oben + f.y * z.zelle,
    width: f.w * z.zelle - z.abstand,
    height: f.h * z.zelle - z.abstand,
  }
}
