// npm run pruefen: führt alle Prüfungen aus und zeigt nur, was fehlschlägt.
// Neue Prüfung (z. B. Tempo-Grenzen) = eine Zeile in der Liste.
import { spawnSync } from 'node:child_process'

const pruefungen = [
  ['Typen', 'tsc -b --pretty false'],
  ['Stil', 'oxlint --deny-warnings --format unix'],
  ['Tests', 'vitest run --reporter=agent'],
]

let fehler = 0
for (const [name, befehl] of pruefungen) {
  const lauf = spawnSync(befehl, { shell: true, encoding: 'utf8' })
  if (lauf.status !== 0) {
    fehler++
    console.log(`✗ ${name}\n${(lauf.stdout + lauf.stderr).trim()}\n`)
  }
}
console.log(fehler ? `${fehler} Prüfung(en) fehlgeschlagen.` : 'Alles grün.')
process.exit(fehler ? 1 : 0)
