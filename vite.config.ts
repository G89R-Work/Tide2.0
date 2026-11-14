import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // host: auch im WLAN erreichbar, damit die App am Handy geöffnet werden kann
  server: { host: true },
  // css: werte.css als Text lesbar (src/werte/abstaende.test.ts prüft die Abstände gegen den Code).
  // env: Tests rechnen in deutscher Zeit, damit Fälle mit Zeitumstellung wirklich greifen (.claude/rules/logik.md).
  test: { include: ['src/**/*.test.ts'], css: { include: [/werte\.css/] }, env: { TZ: 'Europe/Berlin' } },
})
