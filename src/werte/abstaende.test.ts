import { describe, expect, it } from 'vitest'
import { abstaende } from './abstaende'
import css from './werte.css?raw'

const px = (name: string) => Number(new RegExp(`--spacing-${name}:\\s*(\\d+)px`).exec(css)?.[1])

describe('Abstände', () => {
  it('stehen in werte.css und in abstaende.ts gleich', () => {
    expect(px('rand')).toBe(abstaende.randPx)
    expect(px('abstand')).toBe(abstaende.abstandPx)
  })
})
