import { create } from 'zustand'

// Suchtext der Einstellungen. Das Feld steht in der zweiten Ebene, die Treffer zeigt die Seite.
const useSuche = create<{ text: string }>(() => ({ text: '' }))

export const setzeEinstellungenSuche = (text: string) => useSuche.setState({ text })

export const useEinstellungenSuche = (): string => useSuche((s) => s.text)
