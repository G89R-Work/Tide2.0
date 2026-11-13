// Sonne und Mond für den Hintergrund (docs/konzept/05-design.md, „Der Hintergrund").
// Rechnung über SunCalc 2 (Grad, Richtung ab Norden im Uhrzeigersinn).
// Lage im Bild: x 0 = links, 1 = rechts; y 0 = Horizont (Wellen), 1 = ganz oben.
import * as SunCalc from 'suncalc'

export type Bahn = 'bogen' | 'echt'
export type Standort = { breite: number; laenge: number }
export type Lage = { x: number; y: number; sichtbar: boolean }
export type Mond = Lage & {
  /** Beleuchteter Anteil 0 bis 1. */
  beleuchtet: number
  /** Drehung der hellen Seite im Bild, Grad im Uhrzeigersinn ab oben. */
  neigung: number
  /** Phase 0 bis 1: 0 Neumond, 0,25 erstes Viertel, 0,5 Vollmond, 0,75 letztes Viertel. */
  phase: number
}
export type Himmel = {
  sonne: Lage
  mond: Mond
  aufgang: Date | null
  untergang: Date | null
  /** Höhe der Sonne über dem Horizont in Grad (unter dem Horizont negativ). */
  sonnenHoehe: number
  /** Sonne über dem Horizont. */
  tag: boolean
  /** Helligkeit des Himmels 0 (Nacht) bis 1 (Mittag), mit Dämmerung bis 6° unter dem Horizont. */
  licht: number
  /** Warmes Licht bei Auf- und Untergang, 0 bis 1. */
  waerme: number
  /** Schein des Mondes in der Nacht nach seiner Phase, 0 bis 1. */
  mondLicht: number
}

/** So hell ist der Himmel, wenn die Sonne genau am Horizont steht (Anteil vom Mittag). */
const HELL_AM_HORIZONT = 0.3
/** Dämmerung: ab so viel Grad unter dem Horizont wird es heller (bürgerliche Dämmerung). */
const DAEMMERUNG = 6
/** Am wärmsten bei dieser Sonnenhöhe; bis 12° darüber klingt die Wärme ab. */
const WAERMSTE_HOEHE = 1
const WAERME_BIS = 12

/**
 * Licht des Himmels aus der Sonnenhöhe (Grad), der Höhe zur Mittagszeit des Tages und dem Mond.
 * Mittag ist immer am hellsten, im November wie im Juni; nachts leuchtet nur der Mond nach seiner Phase.
 */
export function himmelsLicht(sonne: number, mittag: number, mond: { hoehe: number; beleuchtet: number }) {
  const hell =
    sonne <= -DAEMMERUNG
      ? 0
      : sonne < 0
        ? (HELL_AM_HORIZONT * (sonne + DAEMMERUNG)) / DAEMMERUNG
        : HELL_AM_HORIZONT + (1 - HELL_AM_HORIZONT) * begrenzt(sonne / Math.max(mittag, 1))
  const abstand = sonne - WAERMSTE_HOEHE
  const waerme = begrenzt(1 - abstand / (abstand < 0 ? DAEMMERUNG + WAERMSTE_HOEHE : WAERME_BIS - WAERMSTE_HOEHE) * Math.sign(abstand))
  return { hell, waerme, mond: mond.hoehe > 0 ? (1 - hell) * begrenzt(mond.beleuchtet) : 0 }
}

const STUNDE = 3_600_000
const begrenzt = (w: number) => Math.min(1, Math.max(0, w))
const gueltig = (d: Date | null | undefined): d is Date => d instanceof Date && !Number.isNaN(d.getTime())

/** Bogen: Anteil der Strecke zwischen Auf- und Untergang, als Halbkreis. */
function aufBogen(zeit: Date, auf: Date, unter: Date): Lage {
  const t = (zeit.getTime() - auf.getTime()) / (unter.getTime() - auf.getTime())
  if (t < 0 || t > 1) return { x: begrenzt(t), y: 0, sichtbar: false }
  return { x: t, y: Math.sin(Math.PI * t), sichtbar: true }
}

/** Echt: Himmelsrichtung von links (Nordost) nach rechts (Nordwest), Höhe von Horizont bis Zenit. */
function echt(azimut: number, hoehe: number): Lage {
  const abSued = (((azimut - 180) % 360) + 540) % 360 - 180
  return { x: begrenzt(0.5 + abSued / 270), y: begrenzt(hoehe / 90), sichtbar: hoehe > -1 }
}

/** Ohne Auf- oder Untergang (Polartag, Polarnacht): nach der Höhe, Mittag in der Mitte. */
function ohneZeiten(zeit: Date, mittag: Date, hoehe: number): Lage {
  const t = begrenzt(0.5 + (zeit.getTime() - mittag.getTime()) / (24 * STUNDE))
  return { x: t, y: hoehe > 0 ? Math.sin(Math.PI * t) : 0, sichtbar: hoehe > 0 }
}

/** Mond im Bogen: letzter Aufgang vor jetzt und der nächste Untergang danach, auch über Mitternacht. */
function mondBogen(zeit: Date, ort: Standort, hoehe: number): Lage {
  const ereignisse: { art: 'auf' | 'unter'; t: number }[] = []
  for (const tage of [-1, 0, 1]) {
    const tag = new Date(zeit.getTime() + tage * 24 * STUNDE)
    const m = SunCalc.getMoonTimes(tag, ort.breite, ort.laenge)
    if (gueltig(m.rise)) ereignisse.push({ art: 'auf', t: m.rise.getTime() })
    if (gueltig(m.set)) ereignisse.push({ art: 'unter', t: m.set.getTime() })
  }
  ereignisse.sort((a, b) => a.t - b.t)
  const jetzt = zeit.getTime()
  const auf = ereignisse.filter((e) => e.art === 'auf' && e.t <= jetzt).at(-1)
  const unter = auf && ereignisse.find((e) => e.art === 'unter' && e.t > auf.t)
  if (!auf || !unter) return { x: 0.5, y: hoehe > 0 ? 0.5 : 0, sichtbar: hoehe > 0 }
  return aufBogen(zeit, new Date(auf.t), new Date(unter.t))
}

export function himmel(zeit: Date, ort: Standort, bahn: Bahn): Himmel {
  const zeiten = SunCalc.getTimes(zeit, ort.breite, ort.laenge)
  const aufgang = gueltig(zeiten.sunrise) ? zeiten.sunrise : null
  const untergang = gueltig(zeiten.sunset) ? zeiten.sunset : null
  const s = SunCalc.getPosition(zeit, ort.breite, ort.laenge)
  const m = SunCalc.getMoonPosition(zeit, ort.breite, ort.laenge)
  const phase = SunCalc.getMoonIllumination(zeit)

  const sonne =
    bahn === 'echt'
      ? echt(s.azimuth, s.altitude)
      : aufgang && untergang
        ? aufBogen(zeit, aufgang, untergang)
        : ohneZeiten(zeit, zeiten.solarNoon, s.altitude)
  const l = himmelsLicht(s.altitude, SunCalc.getPosition(zeiten.solarNoon, ort.breite, ort.laenge).altitude, {
    hoehe: m.altitude,
    beleuchtet: phase.fraction,
  })
  const mondLage = bahn === 'echt' ? echt(m.azimuth, m.altitude) : mondBogen(zeit, ort, m.altitude)

  return {
    sonne,
    mond: { ...mondLage, beleuchtet: phase.fraction, neigung: -(phase.angle - m.parallacticAngle), phase: phase.phase },
    aufgang,
    untergang,
    sonnenHoehe: s.altitude,
    tag: s.altitude > 0,
    licht: l.hell,
    waerme: l.waerme,
    mondLicht: l.mond,
  }
}

const zahl = (w: number) => String(Number(w.toFixed(3)))

/**
 * Umriss des hellen Mondteils im Kreis mit Radius 1 um den Nullpunkt, helle Seite oben.
 * Gedreht wird er im Bild mit `neigung`.
 */
export function mondPfad(beleuchtet: number): string {
  const ry = zahl(Math.abs(1 - 2 * begrenzt(beleuchtet)))
  return `M -1 0 A 1 1 0 0 1 1 0 A 1 ${ry} 0 0 ${beleuchtet < 0.5 ? 0 : 1} -1 0 Z`
}
