// Prüft Regel 2: keine Farbe, kein freier Wert, keine Länge außerhalb von src/werte/.
// Meldet jeden Verstoß als „Datei:Zeile Grund". Testdateien sind ausgenommen.
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { findeVerstoesse } from '../src/logik/werteRegel.ts'

const wurzel = join(import.meta.dirname, '..')
const dateien = readdirSync(join(wurzel, 'src'), { recursive: true, withFileTypes: true })
  .filter((d) => d.isFile() && /\.(tsx?|css)$/.test(d.name) && !/\.test\.tsx?$/.test(d.name))
  .map((d) => relative(wurzel, join(d.parentPath, d.name)).replaceAll('\\', '/'))

const verstoesse = dateien.flatMap((datei) => findeVerstoesse(datei, readFileSync(join(wurzel, datei), 'utf8')))
for (const v of verstoesse) console.log(`${v.datei}:${v.zeile} ${v.meldung}`)
process.exit(verstoesse.length ? 1 : 0)
