import { useEffect, useState } from 'react'

/** Die aktuelle Sprungmarke (#…). Zurück im Browser macht jeden Wechsel rückgängig. */
export function useSprungmarke() {
  const [marke, setMarke] = useState(() => location.hash)
  useEffect(() => {
    const neu = () => setMarke(location.hash)
    addEventListener('hashchange', neu)
    return () => removeEventListener('hashchange', neu)
  }, [])
  return marke
}
