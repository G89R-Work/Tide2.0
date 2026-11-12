import { useEffect, useState } from 'react'
import { tagSchluessel } from '../logik/heute'

type Nachschlagen = (tag: Date) => string | undefined

const keine: Nachschlagen = () => undefined

/** Feiertage um `jahr` (Vorjahr bis Folgejahr) im Bundesland `land`. Der Baustein ist groß und wird erst hier nachgeladen;
 *  bis dahin gibt es keine. Schlägt das Laden fehl, steht der Grund in der Konsole. */
export function useFeiertage(jahr: number, land: string): Nachschlagen {
  const [nachschlagen, setNachschlagen] = useState<{ fuer: string; f: Nachschlagen }>({ fuer: '', f: keine })
  const fuer = `${jahr}-${land}`
  useEffect(() => {
    let aktuell = true
    import('../logik/feiertage')
      .then(({ feiertage }) => {
        const jahre = [jahr - 1, jahr, jahr + 1].map((j) => feiertage(j, land))
        if (aktuell) setNachschlagen({ fuer, f: (tag) => jahre[tag.getFullYear() - jahr + 1]?.get(tagSchluessel(tag)) })
      })
      .catch((f: unknown) => console.error(`Feiertage: ${f instanceof Error ? f.message : String(f)}`))
    return () => {
      aktuell = false
    }
  }, [jahr, land, fuer])
  return nachschlagen.fuer === fuer ? nachschlagen.f : keine
}
