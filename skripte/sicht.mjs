// npm run sicht -- <seite> [<seite> …]: baut die App, macht je Seite ein Bild für PC und Handy
// und misst die Tempo-Werte aus docs/konzept/02-tempo.md. Bilder landen in sicht/.
// <seite> ist die Sprungmarke ohne #, z. B. „bausteine"; „start" für die Startseite.
// Ab der zweiten Seite wird auch die Dauer des Wechsels gemessen. npm run pruefen nutzt das.
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

import { tempoGrenzen, tempoVerstoesse } from '../src/logik/tempoGrenzen.ts'

const seiten = process.argv.length > 2 ? process.argv.slice(2) : ['start']
const wurzel = join(import.meta.dirname, '..')

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
const marke = (seite) => (seite === 'start' ? '' : `#${seite}`)

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

// Wechsel per Sprungmarke: Zeit bis zum ersten Bild, auf dem der neue Inhalt steht.
const wechseln = (ziel) =>
  new Promise((fertig) => {
    const wurzelElement = document.getElementById('root')
    const vorher = wurzelElement.innerHTML
    const start = performance.now()
    location.hash = ziel
    const pruefe = () =>
      wurzelElement.innerHTML !== vorher && !wurzelElement.textContent.includes('Lädt')
        ? requestAnimationFrame(() => fertig(Math.round(performance.now() - start)))
        : performance.now() - start > 5000
          ? fertig(Math.round(performance.now() - start))
          : requestAnimationFrame(pruefe)
    requestAnimationFrame(pruefe)
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
    tab.on('console', (m) => ['error', 'warning'].includes(m.type()) && fehler.push(`${name}: Konsole: ${m.text()}`))
    for (const [i, seite] of seiten.entries()) {
      const werte = {}
      if (i === 0) await tab.goto(`http://localhost:${port}/${marke(seite)}`, { waitUntil: 'networkidle' })
      else werte.wechselMs = await tab.evaluate(wechseln, marke(seite) || '#')
      await tab.waitForTimeout(500)
      const bild = join('sicht', `${seite}-${name}.png`)
      await tab.screenshot({ path: join(wurzel, bild), fullPage: true })
      Object.assign(werte, await tab.evaluate(messen))
      console.log(`${name} ${seite}: ${JSON.stringify(werte)} → ${bild}`)
      for (const v of tempoVerstoesse(werte)) fehler.push(`${name} ${seite}: ${v}`)
    }
    await kontext.close()
  }
  await browser.close()
} catch (f) {
  fehler.push(f.message)
} finally {
  beenden()
}

console.log(`Programmcode beim Start, gepackt: ${kilobyte} KB (erlaubt unter ${tempoGrenzen.kilobyte})`)
fehler.push(...tempoVerstoesse({ kilobyte }))
for (const f of fehler) console.log(`✗ ${f}`)
console.log(fehler.length ? `${fehler.length} Grenze(n) oder Fehler.` : 'Tempo-Grenzen eingehalten.')
process.exit(fehler.length ? 1 : 0)
