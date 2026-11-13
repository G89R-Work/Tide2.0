import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Eingeklappte Ordner des Postfachs, im Browser gemerkt. Ansicht, keine Änderung: kein Rückgängig.
type Zu = { ids: readonly string[] }
const useZu = create<Zu>()(persist((): Zu => ({ ids: [] }), { name: 'tide.ordner.zu' }))

export const useOrdnerZu = () => useZu((z) => z.ids)

/** Klappt einen Ordner ein oder aus. */
export function klappe(id: string, zu: boolean) {
  const ids = useZu.getState().ids.filter((x) => x !== id)
  useZu.setState({ ids: zu ? [...ids, id] : ids })
}
