import { describe, expect, it } from 'vitest'
import { findeVerstoesse } from './werteRegel'

describe('findeVerstoesse', () => {
  it('meldet Farbwerte mit Zeile und Grund', () => {
    const text = 'const a = 1\nconst farbe = "#e0a15c"\n'
    expect(findeVerstoesse('src/x.ts', text)).toEqual([
      { datei: 'src/x.ts', zeile: 2, meldung: 'Farbe „#e0a15c" gehört nach src/werte/' },
    ])
  })

  it('meldet rgb, rgba, hsl und oklch', () => {
    const text = 'a: rgb(1,2,3); b: rgba(0,0,0,.5); c: hsl(1 2% 3%); d: oklch(0.5 0.1 20)'
    expect(findeVerstoesse('src/x.css', text)).toHaveLength(4)
  })

  it('meldet freie Werte in Tailwind-Klassen', () => {
    const text = '<div className="p-[13px] bg-[#fff] text-text" />'
    const meldungen = findeVerstoesse('src/x.tsx', text).map((v) => v.meldung)
    expect(meldungen).toContain('Freier Wert „p-[13px]" gehört nach src/werte/')
    expect(meldungen).toContain('Freier Wert „bg-[#fff]" gehört nach src/werte/')
  })

  it('meldet Längen in px, rem und em', () => {
    const text = "style={{ padding: '12px', margin: '1.5rem' }}"
    expect(findeVerstoesse('src/x.tsx', text)).toHaveLength(2)
  })

  it('lässt Klassen aus der Skala und Sprungmarken in Ruhe', () => {
    const text = '<a href="#bausteine" className="p-4 gap-2 rounded-knopf bg-akzent" />'
    expect(findeVerstoesse('src/x.tsx', text)).toEqual([])
  })

  it('erlaubt alles in src/werte/', () => {
    expect(findeVerstoesse('src/werte/glut.css', '--grund: #1a120e; --x: 12px;')).toEqual([])
  })
})
