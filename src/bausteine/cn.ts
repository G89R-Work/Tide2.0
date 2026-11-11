import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Farbnamen aus src/werte/werte.css, damit z. B. „text-text" eine spätere
// Farbklasse richtig ersetzt und nicht mit der Schriftgröße verwechselt wird.
const farben = [
  'grund', 'stufe-1', 'stufe-2', 'stufe-3', 'text', 'text-gedaempft', 'text-blass',
  'akzent', 'akzent-2', 'auf-akzent', 'warnung', 'erfolg', 'raum-1', 'raum-2', 'raum-3',
  'regen', 'linie', 'linie-stark', 'knopf-ton', 'knopf-ton-hover', 'durchsichtig',
]
const merge = extendTailwindMerge({ extend: { theme: { color: farben, radius: ['knopf', 'voll'] } } })

// Klassen zusammenführen; spätere gewinnen bei Konflikten (shadcn-Muster).
export function cn(...klassen: ClassValue[]) {
  return merge(clsx(klassen))
}
