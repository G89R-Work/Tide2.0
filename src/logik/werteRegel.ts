// Regel 2: Farben, Abstände, Glas und Bewegung stehen nur in src/werte/.
// Diese Funktion findet Verstöße in einem Dateitext. Sie liest selbst keine Dateien.

export type Verstoss = { datei: string; zeile: number; meldung: string }

const muster: { art: string; regex: RegExp }[] = [
  { art: 'Farbe', regex: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g },
  { art: 'Farbe', regex: /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(/g },
  { art: 'Freier Wert', regex: /[\w:-]+-\[[^\]\s]+\]/g },
  { art: 'Länge', regex: /\b\d*\.?\d+(?:px|rem|em)\b/g },
]

export function findeVerstoesse(datei: string, text: string): Verstoss[] {
  if (datei.replaceAll('\\', '/').includes('src/werte/')) return []
  const verstoesse: Verstoss[] = []
  text.split('\n').forEach((zeileText, i) => {
    for (const { art, regex } of muster) {
      for (const treffer of zeileText.matchAll(regex)) {
        verstoesse.push({ datei, zeile: i + 1, meldung: `${art} „${treffer[0]}" gehört nach src/werte/` })
      }
    }
  })
  return verstoesse
}
