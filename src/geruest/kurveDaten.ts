import { useCallback, useEffect, useState } from 'react'
import { treibgut } from '../logik/kurveEintraege'
import { aendereEintrag, holeEintraege, holeTermine, type Aenderung, type Eintrag } from '../vertrag/eintrag'
import { holeWetter, type WetterStunde } from '../vertrag/wetter'
import { merke } from './rueckgaengig'

// Daten der Gezeitenkurve, alle über den Vertrag. Änderungen wirken sofort und lassen sich zurücknehmen.
const TAG_MS = 24 * 3_600_000

/** Termine des Tages; `aendere` zeigt die Änderung sofort, schickt sie an den Server und merkt den Weg zurück. */
export function useTermine(tagStart: number) {
  const [liste, setListe] = useState<Eintrag[]>()
  const [fehler, setFehler] = useState<string>()

  const laden = useCallback(() => {
    let aktiv = true
    holeTermine(new Date(tagStart), new Date(tagStart + TAG_MS)).then(
      (neu) => aktiv && setListe(neu),
      (f: Error) => aktiv && setFehler(`Termine nicht geladen: ${f.message}`),
    )
    return () => {
      aktiv = false
    }
  }, [tagStart])
  useEffect(laden, [laden])

  const senden = useCallback(
    async (id: string, aenderung: Aenderung) => {
      setFehler(undefined)
      setListe((l) => l?.map((e) => (e.id === id ? { ...e, ...aenderung } : e)))
      try {
        const neu = await aendereEintrag(id, aenderung)
        setListe((l) => l?.map((e) => (e.id === id ? neu : e)))
      } catch (f) {
        setFehler(`Nicht gespeichert: ${(f as Error).message}`)
        laden()
      }
    },
    [laden],
  )

  /** Ändert einen Termin; `text` beschreibt den Schritt für „Rückgängig". */
  const aendere = useCallback(
    async (e: Eintrag, aenderung: Aenderung, text: string) => {
      const vorher: Aenderung = Object.fromEntries(Object.keys(aenderung).map((k) => [k, e[k as keyof Aenderung]]))
      await senden(e.id, aenderung)
      merke(text, () => senden(e.id, vorher))
    },
    [senden],
  )

  return { liste, fehler, aendere }
}

/** Treibgut: offene Aufgaben ohne Uhrzeit. */
export function useTreibgut() {
  const [liste, setListe] = useState<Eintrag[]>([])
  const [fehler, setFehler] = useState<string>()
  useEffect(() => {
    let aktiv = true
    holeEintraege().then(
      (alle) => aktiv && setListe(treibgut(alle)),
      (f: Error) => aktiv && setFehler(`Offene Aufgaben nicht geladen: ${f.message}`),
    )
    return () => {
      aktiv = false
    }
  }, [])
  return { liste, fehler }
}

/** Wetter je Stunde des Tages, nach Stunde (0 bis 23) geordnet. Nur geholt, wenn die Zeile eingeschaltet ist. */
export function useWetter(tagStart: number, an: boolean) {
  const [stunden, setStunden] = useState<Map<number, WetterStunde>>()
  const [fehler, setFehler] = useState<string>()
  useEffect(() => {
    if (!an) return
    let aktiv = true
    holeWetter(new Date(tagStart), new Date(tagStart + TAG_MS)).then(
      (liste) => aktiv && setStunden(new Map(liste.map((w) => [new Date(w.zeit).getHours(), w]))),
      (f: Error) => aktiv && setFehler(`Wetter nicht geladen: ${f.message}`),
    )
    return () => {
      aktiv = false
    }
  }, [tagStart, an])
  return { stunden: an ? stunden : undefined, fehler }
}
