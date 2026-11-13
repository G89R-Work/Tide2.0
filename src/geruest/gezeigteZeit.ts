import { create } from 'zustand'

// Die Uhrzeit, die die Gezeitenkurve gerade zeigt. null heißt: die Kurve folgt der echten Uhrzeit.
// Der Hintergrund richtet Sonne, Mond und Licht danach.
const useGezeigt = create<{ zeit: Date | null }>(() => ({ zeit: null }))

export function setzeGezeigteZeit(zeit: Date | null) {
  if (zeit?.getTime() === useGezeigt.getState().zeit?.getTime()) return
  useGezeigt.setState({ zeit })
}

export const useGezeigteZeit = (): Date | null => useGezeigt((s) => s.zeit)
