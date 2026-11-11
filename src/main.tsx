import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Prototyp ohne Server: Die Attrappe beantwortet alle Anfragen. Sie wird nachgeladen,
// damit sie nicht im Startpaket steckt (Tempo-Grenze 200 KB).
const { starteAttrappe } = await import('./attrappe/start')
await starteAttrappe()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
