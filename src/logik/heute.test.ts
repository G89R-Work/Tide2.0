import { describe, expect, it } from 'vitest'
import { abweichung, alsNaechstes, anteilTag, brauchtDich, monatsRaster, tagesBelegung, wetterHeute, schicht, seitText, stundenAb, wochenTage, wochenrueckblick } from './heute'

// Erfundene Beispieldaten. Zeiten in Ortszeit, damit die Tests in jeder Zeitzone gleich laufen.
const um = (tag: number, h: number, m = 0, monat = 10) => new Date(2026, monat, tag, h, m)
const termin = (titel: string, von: Date, bis: Date, art: 'termin' | 'schicht' = 'termin') => ({ titel, art, beginn: von.toISOString(), ende: bis.toISOString() })
const aufgabe = (titel: string, frist?: string, erledigt = false) => ({ titel, art: 'aufgabe' as const, erledigt, frist })

describe('alsNaechstes', () => {
  const tag = [termin('Kita bringen', um(12, 7, 45), um(12, 8, 15)), termin('Zahnarzt', um(12, 16, 15), um(12, 16, 45)), termin('Spätschicht', um(12, 13, 30), um(12, 18), 'schicht')]

  it('nimmt den nächsten Termin, der noch nicht begonnen hat', () => {
    expect(alsNaechstes(tag, um(12, 9))?.titel).toBe('Zahnarzt')
  })

  it('ist in den nächsten 30 Minuten nah, weiter weg nicht', () => {
    expect(alsNaechstes(tag, um(12, 15, 50))).toMatchObject({ nah: true, wann: 'in 25 Minuten' })
    expect(alsNaechstes(tag, um(12, 15, 44))).toMatchObject({ nah: false, wann: 'in 31 Minuten' })
    expect(alsNaechstes(tag, um(12, 9))?.wann).toBe('in 7 Std. 15 Min.')
    expect(alsNaechstes(tag, um(12, 15, 15))?.wann).toBe('in 1 Std.')
  })

  it('übergeht Schichten, die zeigt die Uhr', () => {
    expect(alsNaechstes(tag, um(12, 12))?.titel).toBe('Zahnarzt')
  })

  it('nennt einen Termin nach Mitternacht als morgen und schaut höchstens 24 Stunden voraus', () => {
    const spaet = [termin('Kita bringen', um(13, 7, 45), um(13, 8, 15))]
    expect(alsNaechstes(spaet, um(12, 22))?.wann).toBe('morgen')
    expect(alsNaechstes(spaet, um(12, 7))).toBeNull()
  })

  it('sagt in 1 Minute statt in 1 Minuten und jetzt bei Beginn', () => {
    expect(alsNaechstes(tag, um(12, 16, 14))?.wann).toBe('in 1 Minute')
    expect(alsNaechstes(tag, um(12, 16, 15))?.wann).toBe('jetzt')
  })

  it('liefert nichts ohne kommende Termine', () => {
    expect(alsNaechstes([], um(12, 9))).toBeNull()
  })
})

describe('anteilTag', () => {
  it('ist mittags die Hälfte', () => {
    expect(anteilTag(um(12, 12))).toBeCloseTo(0.5)
  })

  it('beginnt um Mitternacht bei null', () => {
    expect(anteilTag(um(12, 0))).toBe(0)
  })

  it('rechnet am Tag der Umstellung mit der echten Länge des Tages', () => {
    // 25. Oktober 2026: Winterzeit, der Tag hat in Deutschland 25 Stunden. In anderen Zonen 24.
    const tag = new Date(2026, 9, 25, 12)
    const laenge = (new Date(2026, 9, 26).getTime() - new Date(2026, 9, 25).getTime()) / 3_600_000
    const vergangen = (tag.getTime() - new Date(2026, 9, 25).getTime()) / 3_600_000
    expect(anteilTag(tag)).toBeCloseTo(vergangen / laenge)
  })
})

describe('schicht', () => {
  const tag = [termin('Spätschicht', um(12, 13, 30), um(12, 18), 'schicht'), termin('Kundentermin', um(12, 14), um(12, 15))]

  it('zeigt den Anteil der laufenden Schicht und die Restzeit', () => {
    expect(schicht(tag, um(12, 15, 45))).toEqual({ titel: 'Spätschicht', anteil: 0.5, restMinuten: 135 })
  })

  it('gibt es nicht vor und nach der Schicht', () => {
    expect(schicht(tag, um(12, 13))).toBeNull()
    expect(schicht(tag, um(12, 18))).toBeNull()
  })

  it('läuft über Mitternacht weiter', () => {
    const nacht = [termin('Nachtdienst', um(12, 22), um(13, 6), 'schicht')]
    expect(schicht(nacht, um(13, 2))?.anteil).toBeCloseTo(0.5)
  })
})

describe('wochenTage', () => {
  it('beginnt am Montag oder am Sonntag', () => {
    // Donnerstag, 12. November 2026
    expect(wochenTage(um(12, 9), 'montag', 0)[0].getDate()).toBe(9)
    expect(wochenTage(um(12, 9), 'sonntag', 0)[0].getDate()).toBe(8)
  })

  it('springt mit dem Versatz um ganze Wochen und über den Monat', () => {
    const tage = wochenTage(um(12, 9), 'montag', 3)
    expect(tage.map((t) => t.getDate())).toEqual([30, 1, 2, 3, 4, 5, 6])
    expect(tage[1].getMonth()).toBe(11)
  })

  it('liefert sieben Mitternächte, auch über die Zeitumstellung', () => {
    const tage = wochenTage(new Date(2026, 9, 21, 12), 'montag', 0)
    expect(tage).toHaveLength(7)
    for (const t of tage) expect([t.getHours(), t.getMinutes()]).toEqual([0, 0])
    expect(tage.map((t) => t.getDate())).toEqual([19, 20, 21, 22, 23, 24, 25])
  })
})

describe('tagesBelegung', () => {
  const an = (termine: ReturnType<typeof termin>[], tag: Date) => tagesBelegung(termine, [tag])[0]

  it('teilt die belegte Zeit durch 16 wache Stunden und zählt Überschneidungen einmal', () => {
    const tag = [termin('Schicht', um(12, 8), um(12, 16), 'schicht'), termin('Runde', um(12, 9), um(12, 10))]
    expect(an(tag, um(12, 0)).anteil).toBeCloseTo(0.5)
  })

  it('zählt nur den Teil, der am Tag liegt', () => {
    const nacht = [termin('Nachtdienst', um(11, 20), um(12, 4), 'schicht')]
    expect(an(nacht, um(12, 0)).anteil).toBeCloseTo(4 / 16)
  })

  it('ist höchstens voll', () => {
    expect(an([termin('Messe', um(12, 0), um(13, 0))], um(12, 0)).anteil).toBe(1)
  })

  it('nimmt den ersten Buchstaben der Schicht an diesem Tag', () => {
    const t = [termin('Spätschicht', um(12, 13, 30), um(12, 18), 'schicht'), termin('Zahnarzt', um(13, 9), um(13, 10))]
    expect(tagesBelegung(t, [um(12, 0), um(13, 0)]).map((b) => b.schicht)).toEqual(['S', null])
  })

  it('zählt eine Nachtschicht zum Tag ihres Beginns', () => {
    const t = [termin('nachtdienst', um(12, 22), um(13, 6), 'schicht')]
    expect(tagesBelegung(t, [um(12, 0), um(13, 0)]).map((b) => b.schicht)).toEqual(['N', null])
  })

  it('liefert für jeden Tag einen Wert, auch ohne Termine', () => {
    expect(tagesBelegung([], [um(12, 0), um(13, 0)])).toEqual([{ anteil: 0, schicht: null }, { anteil: 0, schicht: null }])
  })
})

describe('brauchtDich', () => {
  const jetzt = um(12, 9)
  const liste = [
    aufgabe('Rückruf Versicherung', '2026-11-11'),
    aufgabe('Steuer', '2026-11-05'),
    aufgabe('Rezept abholen', '2026-11-12'),
    aufgabe('Geschenk für Jana', '2026-11-13'),
    aufgabe('Urlaub planen', '2026-11-20'),
    aufgabe('Ohne Frist'),
    aufgabe('Erledigt', '2026-11-10', true),
  ]

  it('teilt in Überfällig, Heute und Morgen und lässt Späteres, Erledigtes und Fristloses weg', () => {
    const b = brauchtDich(liste, jetzt)
    expect(b.ueberfaellig.map((e) => e.titel)).toEqual(['Steuer', 'Rückruf Versicherung'])
    expect(b.heute.map((e) => e.titel)).toEqual(['Rezept abholen'])
    expect(b.morgen.map((e) => e.titel)).toEqual(['Geschenk für Jana'])
    expect(b.zahl).toBe(4)
  })

  it('nennt als wichtigsten Punkt den am längsten überfälligen', () => {
    expect(brauchtDich(liste, jetzt).wichtigster?.titel).toBe('Steuer')
  })

  it('ist leer, wenn nichts wartet', () => {
    expect(brauchtDich([aufgabe('Später', '2026-12-01')], jetzt)).toMatchObject({ zahl: 0, wichtigster: null })
  })

  it('wechselt um Mitternacht von Morgen zu Heute', () => {
    expect(brauchtDich([aufgabe('A', '2026-11-13')], um(12, 23, 59)).morgen).toHaveLength(1)
    expect(brauchtDich([aufgabe('A', '2026-11-13')], um(13, 0, 0)).heute).toHaveLength(1)
  })

  it('übergeht eine unlesbare Frist statt zu raten', () => {
    expect(brauchtDich([aufgabe('Kaputt', '13.11.')], jetzt).zahl).toBe(0)
  })
})

describe('seitText', () => {
  const jetzt = um(12, 9)
  it('sagt seit gestern, seit 7 Tagen, heute und morgen', () => {
    expect(seitText('2026-11-11', jetzt)).toBe('seit gestern')
    expect(seitText('2026-11-05', jetzt)).toBe('seit 7 Tagen')
    expect(seitText('2026-11-12', jetzt)).toBe('heute')
    expect(seitText('2026-11-13', jetzt)).toBe('morgen')
  })

  it('zählt über die Zeitumstellung ganze Tage', () => {
    expect(seitText('2026-10-24', new Date(2026, 9, 26, 9))).toBe('seit 2 Tagen')
  })
})

describe('wochenrueckblick', () => {
  it('zählt Termine, Stunden in Schichten und erledigte Aufgaben der Woche bis jetzt', () => {
    const tage = wochenTage(um(12, 9), 'montag', 0)
    const termine = [
      termin('Runde', um(9, 9), um(9, 10)),
      termin('Schicht', um(10, 8), um(10, 16), 'schicht'),
      termin('Später', um(14, 9), um(14, 10)),
      termin('Letzte Woche', um(5, 9), um(5, 10)),
    ]
    const eintraege = [
      { ...aufgabe('A', undefined, true), geaendert: um(11, 10).toISOString() },
      { ...aufgabe('B', undefined, true), geaendert: um(2, 10).toISOString() },
      { ...aufgabe('C'), geaendert: um(11, 10).toISOString() },
    ]
    expect(wochenrueckblick(termine, eintraege, tage, um(12, 9))).toEqual({ termine: 1, schichtStunden: 8, erledigt: 1 })
  })
})

describe('monatsRaster', () => {
  it('zeigt immer sechs Wochen mit den Tagen davor und danach', () => {
    // November 2026 beginnt an einem Sonntag.
    const raster = monatsRaster(um(12, 9), 'montag')
    expect(raster).toHaveLength(6)
    expect(raster.every((w) => w.length === 7)).toBe(true)
    expect(raster[0][0]).toEqual(new Date(2026, 9, 26))
    expect(raster[0][6]).toEqual(new Date(2026, 10, 1))
    expect(raster[5][6]).toEqual(new Date(2026, 11, 6))
    expect(monatsRaster(um(12, 9), 'sonntag')[0][0]).toEqual(new Date(2026, 10, 1))
  })
})

describe('wetterHeute', () => {
  const stunde = (h: number, grad: number, regen = 0) => ({ zeit: um(12, h).toISOString(), grad, regen })
  const tag = [stunde(6, 4), stunde(9, 7), stunde(12, 12), stunde(13, 13), stunde(15, 11, 0.4), stunde(18, 8, 1.2), stunde(23, 5)]

  it('nimmt die Temperatur der laufenden Stunde und die Spanne des Tages', () => {
    expect(wetterHeute(tag, um(12, 13, 40))).toMatchObject({ grad: 13, hoch: 13, tief: 4 })
    expect(wetterHeute(tag, um(12, 13, 40))?.stunde).toBe(tag[3])
  })

  it('nennt den ersten Regen ab jetzt und übergeht Nieselspuren', () => {
    expect(wetterHeute(tag, um(12, 13, 40))?.regenAb?.getHours()).toBe(15)
    expect(wetterHeute([stunde(14, 10, 0.05)], um(12, 13))?.regenAb).toBeNull()
    expect(wetterHeute(tag, um(12, 23, 30))?.regenAb).toBeNull()
  })

  it('regnet es gerade, gilt jetzt als Beginn', () => {
    expect(wetterHeute(tag, um(12, 15, 30))?.regnet).toBe(true)
  })

  it('liefert nichts ohne Werte für heute', () => {
    expect(wetterHeute([], um(12, 9))).toBeNull()
  })
})

describe('abweichung', () => {
  it('nennt wärmer, kälter oder gleich in ganzen Grad', () => {
    expect(abweichung(9, 7)).toBe('2° wärmer')
    expect(abweichung(6.6, 8)).toBe('1° kälter')
    expect(abweichung(8.2, 8)).toBe('gleich warm')
  })
})

describe('stundenAb', () => {
  const stunde = (h: number, tag = 12) => ({ zeit: um(tag, h).toISOString() })
  const liste = [stunde(22, 11), stunde(9), stunde(10), stunde(11), stunde(23), stunde(0, 13), stunde(1, 13)]

  it('beginnt mit der laufenden Stunde, sortiert und begrenzt', () => {
    expect(stundenAb(liste, um(12, 10, 30), 3).map((s) => s.zeit)).toEqual([stunde(10), stunde(11), stunde(23)].map((s) => s.zeit))
  })

  it('läuft über Mitternacht weiter', () => {
    expect(stundenAb(liste, um(12, 23, 10), 5)).toHaveLength(3)
  })
})
