// npm run sicht -- <seite>: baut die App, macht je ein Bild für PC und Handy
// und misst die Tempo-Werte aus docs/konzept/02-tempo.md. Bilder landen in sicht/.
// <seite> ist die Sprungmarke ohne #, z. B. „bausteine"; „start" für die Startseite.
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const seite = process.argv[2] ?? 'start'
const wurzel = join(import.meta.dirname, '..')
const grenzen = { blur: 4, animationen: 0, kilobyte: 200 }

let playwright
try {
  playwright = createRequire(join(wurzel, 'package.json'))('playwright')
} catch (fehler) {
  console.log(`✗ Playwright fehlt (${fehler.message}). In der Cloud ist es vorinstalliert; lokal: npm i -D playwright`)
  process.exit(1)
}

const bau = spawnSync('npx vite build --logLevel error', { shell: true, encoding: 'utf8', cwd: wurzel })
if (bau.status !== 0) {
  console.log(`✗ Bauen fehlgeschlagen\n${(bau.stdout + bau.stderr).trim()}`)
  process.exit(1)
}

// Programmcode beim ersten Laden: nur die Skripte, die index.html direkt nennt.
const html = readFileSync(join(wurzel, 'dist/index.html'), 'utf8')
const startSkripte = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.js)"/g)].map((t) => t[1])
const kilobyte = Math.round(
  startSkripte.reduce((summe, d) => summe + gzipSync(readFileSync(join(wurzel, 'dist', d))).length, 0) / 1024,
)

const port = 4179
const server = spawn(`npx vite preview --port ${port} --strictPort`, { shell: true, cwd: wurzel, detached: true })
const beenden = () => {
  try {
    process.kill(-server.pid)
  } catch {
    /* Server schon beendet */
  }
}
let serverText = ''
server.stdout.on('data', (d) => (serverText += d))
server.stderr.on('data', (d) => (serverText += d))
const adresse = `http://localhost:${port}/${seite === 'start' ? '' : `#${seite}`}`

async function warteAufServer() {
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(`http://localhost:${port}/`)
      return
    } catch {
      await new Promise((r) => setTimeout(r, 200))
    }
  }
  throw new Error(`Vorschau-Server startet nicht:\n${serverText}`)
}

const messen = () =>
  new Promise((fertig) => {
    const alle = [...document.querySelectorAll('*')]
    const blur = alle.filter((el) => {
      const s = getComputedStyle(el)
      const filter = s.backdropFilter || s.webkitBackdropFilter
      const r = el.getBoundingClientRect()
      return filter && filter !== 'none' && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth
    }).length
    let bilder = 0
    const start = performance.now()
    const zaehle = () => (performance.now() - start < 1000 ? (bilder++, requestAnimationFrame(zaehle)) : null)
    requestAnimationFrame(zaehle)
    setTimeout(
      () => fertig({ blur, animationen: document.getAnimations().length, elemente: alle.length, bilderProSekunde: bilder }),
      1100,
    )
  })

const fehler = []
try {
  await warteAufServer()
  mkdirSync(join(wurzel, 'sicht'), { recursive: true })
  const browser = await playwright.chromium.launch()
  const geraete = [
    ['pc', { viewport: { width: 1280, height: 800 } }],
    ['handy', playwright.devices['iPhone 13']],
  ]
  for (const [name, geraet] of geraete) {
    const kontext = await browser.newContext({ ...geraet, ...(name === 'pc' ? { deviceScaleFactor: 1 } : {}) })
    const tab = await kontext.newPage()
    tab.on('pageerror', (f) => fehler.push(`${name}: Fehler auf der Seite: ${f.message}`))
    tab.on('console', (m) => m.type() === 'error' && fehler.push(`${name}: Konsole: ${m.text()}`))
    await tab.goto(adresse, { waitUntil: 'networkidle' })
    await tab.waitForTimeout(500)
    const bild = join('sicht', `${seite}-${name}.png`)
    await tab.screenshot({ path: join(wurzel, bild), fullPage: true })
    const werte = await tab.evaluate(messen)
    console.log(`${name}: ${JSON.stringify(werte)} → ${bild}`)
    if (werte.blur > grenzen.blur) fehler.push(`${name}: ${werte.blur} Flächen mit Weichzeichner sichtbar, erlaubt ${grenzen.blur}`)
    if (werte.animationen > grenzen.animationen) fehler.push(`${name}: ${werte.animationen} laufende Animationen im Ruhezustand, erlaubt 0`)
    await kontext.close()
  }
  await browser.close()
} catch (f) {
  fehler.push(f.message)
} finally {
  beenden()
}

console.log(`Programmcode beim Start, gepackt: ${kilobyte} KB (erlaubt unter ${grenzen.kilobyte})`)
if (kilobyte >= grenzen.kilobyte) fehler.push(`Programmcode ${kilobyte} KB, erlaubt unter ${grenzen.kilobyte}`)
for (const f of fehler) console.log(`✗ ${f}`)
console.log(fehler.length ? `${fehler.length} Grenze(n) oder Fehler.` : 'Tempo-Grenzen eingehalten.')
process.exit(fehler.length ? 1 : 0)
