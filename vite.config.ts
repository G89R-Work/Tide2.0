import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // host: auch im WLAN erreichbar, damit die App am Handy geöffnet werden kann
  server: { host: true },
  test: { include: ['src/**/*.test.ts'] },
})
