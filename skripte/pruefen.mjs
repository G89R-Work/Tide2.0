// npm run pruefen: führt alle Prüfungen aus und zeigt nur, was fehlschlägt.
// Neue Prüfung = eine Zeile in der Liste. Neue Seiten hinten an die Tempo-Zeile hängen.
import { spawnSync } from 'node:child_process'

const pruefungen = [
  ['Typen', 'tsc -b --pretty false'],
  ['Stil', 'oxlint --deny-warnings --format unix'],
  ['Tests', 'vitest run --reporter=agent'],
  ['Werte', 'node skripte/werte-pruefen.mjs'],
  ['Tempo', 'node skripte/sicht.mjs start postfach postfach/gesendet kalender todos einkauf kochen finanzen arbeit notizen einstellungen heute bausteine'],
]

let fehler = 0
for (const [name, befehl] of pruefungen) {
  const lauf = spawnSync(befehl, { shell: true, encoding: 'utf8' })
  if (lauf.status !== 0) {
    fehler++
    const text = (lauf.stdout + lauf.stderr).trim()
    // Nie ein Fehler ohne Grund: Schweigt das Werkzeug, sagen wir, wo man nachsieht.
    const grund = text || `Ohne Meldung beendet (Code ${lauf.status ?? lauf.error?.message}). Einzeln ausführen: npx ${befehl}`
    console.log(`✗ ${name}\n${grund}\n`)
  }
}
console.log(fehler ? `${fehler} Prüfung(en) fehlgeschlagen.` : 'Alles grün.')
process.exit(fehler ? 1 : 0)
