export type Tageszeit = 'morgen' | 'tag' | 'abend' | 'nacht'

/** Ordnet eine Uhrzeit einer Tageszeit zu: 5–10 Morgen, 11–17 Tag, 18–21 Abend, sonst Nacht. */
export function tageszeit(zeit: Date): Tageszeit {
  const stunde = zeit.getHours()
  if (stunde >= 5 && stunde < 11) return 'morgen'
  if (stunde >= 11 && stunde < 18) return 'tag'
  if (stunde >= 18 && stunde < 22) return 'abend'
  return 'nacht'
}

const gruss: Record<Tageszeit, string> = {
  morgen: 'Guten Morgen',
  tag: 'Guten Tag',
  abend: 'Guten Abend',
  nacht: 'Gute Nacht',
}

export function begruessung(zeit: Date): string {
  return gruss[tageszeit(zeit)]
}
