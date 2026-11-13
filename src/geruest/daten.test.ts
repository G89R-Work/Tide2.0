import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Eintrag } from '../vertrag/eintrag'
import { abfragen, einstellungenJetzt, einstellungenSpeichernVon, eintragSpeichernVon } from './daten'

// Erfundene Beispieldaten; der Server wird durch eine gestellte Antwort ersetzt.
const t = '2026-11-13T08:00:00.000Z'
const termin: Eintrag = { id: 'a', art: 'termin', titel: 'Runde', erledigt: false, erstellt: t, geaendert: t, beginn: t, ende: '2026-11-13T09:00:00.000Z' }
const antworte = (status: number, inhalt: unknown) => vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(inhalt), { status })))

afterEach(() => {
  vi.unstubAllGlobals()
  abfragen.clear()
})

describe('Eintrag ändern', () => {
  it('zeigt die Änderung sofort in jeder Liste mit dem Eintrag', async () => {
    abfragen.setQueryData(['termine', 1, 2], [termin])
    abfragen.setQueryData(['eintraege'], [termin])
    let fertig: (r: Response) => void = () => {}
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((f) => (fertig = f))))
    const lauf = eintragSpeichernVon('a', { titel: 'Planung' })
    await vi.waitFor(() => expect(abfragen.getQueryData<Eintrag[]>(['termine', 1, 2])?.[0].titel).toBe('Planung'))
    expect(abfragen.getQueryData<Eintrag[]>(['eintraege'])?.[0].titel).toBe('Planung')
    fertig(new Response(JSON.stringify({ ...termin, titel: 'Planung' })))
    expect(await lauf).toBe(true)
  })

  it('rollt zurück, wenn der Server ablehnt', async () => {
    abfragen.setQueryData(['termine', 1, 2], [termin])
    antworte(500, 'kaputt')
    expect(await eintragSpeichernVon('a', { titel: 'Planung' })).toBe(false)
    expect(abfragen.getQueryData<Eintrag[]>(['termine', 1, 2])?.[0].titel).toBe('Runde')
  })
})

describe('Einstellungen speichern', () => {
  it('übernimmt die Antwort des Servers', async () => {
    abfragen.setQueryData(['einstellungen'], {})
    antworte(200, { design: 'tinte' })
    expect(await einstellungenSpeichernVon({}, { design: 'tinte' })).toBe(true)
    expect(einstellungenJetzt()).toEqual({ design: 'tinte' })
  })

  it('gilt wieder der alte Stand, wenn das Speichern scheitert', async () => {
    abfragen.setQueryData(['einstellungen'], {})
    antworte(500, 'kaputt')
    expect(await einstellungenSpeichernVon({}, { design: 'tinte' })).toBe(false)
    expect(einstellungenJetzt()).toEqual({})
  })

  it('schickt nichts, wenn sich nichts ändert', async () => {
    const f = vi.fn()
    vi.stubGlobal('fetch', f)
    expect(await einstellungenSpeichernVon({ design: 'tinte' }, { design: 'tinte' })).toBe(false)
    expect(f).not.toHaveBeenCalled()
  })
})
