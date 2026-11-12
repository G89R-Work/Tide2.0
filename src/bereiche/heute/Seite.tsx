import { useState } from 'react'
import { useEinstellung } from '../../geruest/einstellungen'
import { useBrauchtDich } from '../../geruest/useBrauchtDich'
import { useMinute } from '../../geruest/useMinute'
import { Uhr } from '../../geruest/Uhr'
import { useTermine } from '../../geruest/useTermine'
import { Wetter } from '../../geruest/Wetter'
import { Raster } from '../../kacheln/Raster'
import { einstellungen } from '../../logik/einstellungen'
import { wochenrueckblick, wochenTage, type Wochenbeginn } from '../../logik/heute'
import { AlsNaechstes } from './kacheln/AlsNaechstes'
import { BrauchtDich } from './kacheln/BrauchtDich'
import { Gruss } from './kacheln/Gruss'
import { Knoepfe } from './kacheln/Knoepfe'
import { Monat } from './kacheln/Monat'
import { Notiz } from './kacheln/Notiz'
import { Rueckblick } from './kacheln/Rueckblick'
import { Woche } from './kacheln/Woche'
import { werkszustand } from './werkszustand'

const wochenbeginn = einstellungen.find((e) => e.id === 'wochenbeginn')!

// Heute (docs/konzept/10-heute.md): viel Himmel, wenig Text. Alles ist eine Kachel; Text steht ab Werk ohne Hintergrund.
export default function Seite() {
  const jetzt = useMinute()
  const beginn = useEinstellung(wochenbeginn) as Wochenbeginn
  const { termine, fehler } = useTermine(14, 42, jetzt)
  const braucht = useBrauchtDich()
  // Gezeigter Monat der Wochenleiste und der Tag, der vorn steht: ab Werk der Beginn der laufenden Woche, im Monat gehalten.
  const [wahl, setWahl] = useState<{ monat: Date; fokus: Date }>(() => {
    const start = wochenTage(new Date(), beginn, 0)[0]
    const heute = new Date()
    const monat = new Date(heute.getFullYear(), heute.getMonth(), 1)
    return { monat, fokus: start < monat ? monat : start }
  })
  const zeige = (tag: Date) => setWahl({ monat: new Date(tag.getFullYear(), tag.getMonth(), 1), fokus: tag })

  const inhalt = {
    gruss: <Gruss jetzt={jetzt} />,
    wetter: <Wetter jetzt={jetzt} />,
    uhr: <Uhr termine={termine} jetzt={jetzt} />,
    naechstes: <AlsNaechstes termine={termine} jetzt={jetzt} fehler={fehler} />,
    knoepfe: <Knoepfe />,
    braucht: braucht.fehler ? <p className="text-sm text-warnung">{braucht.fehler}</p> : braucht.daten?.wichtigster ? <BrauchtDich daten={braucht.daten} jetzt={jetzt} /> : null,
    monat: <Monat monat={wahl.monat} jetzt={jetzt} beginn={beginn} waehle={zeige} blaettern={(m) => setWahl((w) => ({ ...w, monat: m }))} />,
    woche: <Woche termine={termine} monat={wahl.monat} fokus={wahl.fokus} jetzt={jetzt} />,
    notiz: <Notiz />,
    rueckblick: <Rueckblick zahlen={wochenrueckblick(termine, braucht.liste ?? [], wochenTage(jetzt, beginn, 0), jetzt)} />,
  }

  return (
    <Raster seite="heute" kacheln={werkszustand} inhalt={inhalt} />
  )
}
