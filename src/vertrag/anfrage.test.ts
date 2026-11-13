import { afterEach, describe, expect, it, vi } from 'vitest'
import { holeEinstellungen } from './einstellungen'
import { holeEintraege } from './eintrag'
import { holeWetter } from './wetter'

const antwortet = (daten: unknown, status = 200) =>
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(daten), { status })))

afterEach(() => vi.unstubAllGlobals())

const gut = { id: 'a', art: 'aufgabe', titel: 'Brot', erledigt: false, erstellt: '2026-11-11T08:00:00Z', geaendert: '2026-11-11T08:00:00Z' }

describe('Antworten des Servers', () => {
  it('eine gültige Antwort kommt unverändert an', async () => {
    antwortet([gut])
    await expect(holeEintraege()).resolves.toEqual([gut])
  })

  it('eine kaputte Antwort nennt Anfrage, Feld und Grund auf Deutsch', async () => {
    antwortet([gut, { ...gut, titel: 42, art: 'brief' }])
    const fehler = await holeEintraege().then(
      () => null,
      (f: unknown) => (f instanceof Error ? f.message : String(f)),
    )
    expect(fehler).toMatch(/^Einträge holen: Antwort ungültig/)
    expect(fehler).toMatch(/\[1\]\.titel/)
    expect(fehler).toMatch(/\[1\]\.art/)
    expect(fehler).toMatch(/Ungültige Eingabe/)
  })

  it('eine Antwort ganz ohne Liste ist ein Fehler', async () => {
    antwortet({ fehler: 'weg' })
    await expect(holeWetter(new Date(0), new Date(3_600_000))).rejects.toThrow(/Wetter holen: Antwort ungültig/)
  })

  it('ein Fehler des Servers nennt Status und Text', async () => {
    antwortet('kaputt', 500)
    await expect(holeEintraege()).rejects.toThrow(/Einträge holen fehlgeschlagen: 500/)
  })

  it('Einstellungen: Unbekanntes und Ungültiges fällt weg, kein Objekt ist ein Fehler', async () => {
    antwortet({ design: 'tinte', 'kurve-stunden': 'viel', alt: 1 })
    await expect(holeEinstellungen()).resolves.toEqual({ design: 'tinte' })
    antwortet([1])
    await expect(holeEinstellungen()).rejects.toThrow(/Einstellungen holen: Antwort ungültig/)
  })
})
