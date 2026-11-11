import { useEffect, useState } from 'react'

/** Aktuelle Zeit, neu jeweils zum Minutenwechsel und beim Zurückkehren in den Tab. Sonst steht alles still. */
export function useMinute(): Date {
  const [zeit, setZeit] = useState(() => new Date())
  useEffect(() => {
    let uhr: ReturnType<typeof setTimeout>
    const weiter = () => {
      const jetzt = new Date()
      setZeit(jetzt)
      uhr = setTimeout(weiter, 60_000 - (jetzt.getTime() % 60_000) + 50)
    }
    const sichtbar = () => {
      if (document.visibilityState !== 'visible') return
      clearTimeout(uhr)
      weiter()
    }
    weiter()
    document.addEventListener('visibilitychange', sichtbar)
    return () => {
      clearTimeout(uhr)
      document.removeEventListener('visibilitychange', sichtbar)
    }
  }, [])
  return zeit
}
