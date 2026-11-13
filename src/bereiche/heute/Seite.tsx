import { useState } from 'react'
import { Flaeche } from '../../bausteine/Flaeche'
import { cn } from '../../bausteine/cn'
import { useEinstellung } from '../../geruest/einstellungen'
import { useFeiertage } from '../../geruest/useFeiertage'
import { useBrauchtDich } from '../../geruest/useBrauchtDich'
import { useMinute } from '../../geruest/useMinute'
import { Uhr } from '../../geruest/Uhr'
import { useTermine } from '../../geruest/useTermine'
import { useSchmal } from '../../geruest/useSchmal'
import { Wetter } from '../../geruest/Wetter'
import { einstellung } from '../../logik/einstellungen'
import { wochenrueckblick, wochenTage } from '../../logik/heute'
import { AlsNaechstes } from './teile/AlsNaechstes'
import { BrauchtDich } from './teile/BrauchtDich'
import { Gruss } from './teile/Gruss'
import { Knoepfe } from './teile/Knoepfe'
import { Monat } from './teile/Monat'
import { Notiz } from './teile/Notiz'
import { Rueckblick } from './teile/Rueckblick'
import { Woche } from './teile/Woche'

const wochenbeginn = einstellung('wochenbeginn')
const bundesland = einstellung('bundesland')
const heuteUhr = einstellung('heute-uhr')

// Heute (docs/konzept/10-heute.md): viel Himmel, wenig Text, fester Aufbau ohne Kopfzeile.
export default function Seite() {
  const jetzt = useMinute()
  const beginn = useEinstellung(wochenbeginn)
  const { termine, fehler } = useTermine(14, 42, jetzt)
  const braucht = useBrauchtDich()
  const schmal = useSchmal()
  const uhrZeigen = useEinstellung(heuteUhr)
  // Gezeigter Monat der Wochenleiste und der Tag, der vorn steht: ab Werk der Beginn der laufenden Woche, im Monat gehalten.
  const [wahl, setWahl] = useState<{ monat: Date; fokus: Date }>(() => {
    const start = wochenTage(new Date(), beginn, 0)[0]
    const heute = new Date()
    const monat = new Date(heute.getFullYear(), heute.getMonth(), 1)
    return { monat, fokus: start < monat ? monat : start }
  })
  const land = useEinstellung(bundesland)
  const feiertag = useFeiertage(wahl.monat.getFullYear(), land)
  // Knöpfe neben der Wochenleiste: am Handy schmal wie in der Vorlage, damit alles in eine Reihe passt.
  const knopfBreite = schmal ? 'w-14 shrink-0' : 'min-w-20'
  const zeige = (tag: Date) => setWahl({ monat: new Date(tag.getFullYear(), tag.getMonth(), 1), fokus: tag })

  const brauchtInhalt = braucht.fehler ? (
    <Flaeche className="w-full max-w-sm px-4 py-2">
      <p className="text-sm text-warnung">{braucht.fehler}</p>
    </Flaeche>
  ) : braucht.daten ? (
    <BrauchtDich daten={braucht.daten} jetzt={jetzt} />
  ) : null

  // Oben links Gruß und Als Nächstes, rechts Wetter und Uhr, darunter (am PC) die drei belegbaren Knöpfe. Dazwischen Himmel.
  // Unten Braucht dich und die Wochenleiste mit Monat, Notiz und Rückblick. Text ohne Fläche, Bedienteile auf Kacheln.
  return (
    <div className="flex flex-1 flex-col gap-abstand">
      <div className="flex flex-wrap items-start justify-between gap-abstand">
        <div className="flex min-w-0 flex-col gap-abstand">
          <Gruss jetzt={jetzt} />
          <AlsNaechstes termine={termine} jetzt={jetzt} fehler={fehler} />
        </div>
        <div className={cn('flex flex-col gap-abstand', schmal ? 'w-full' : 'items-end')}>
          <div className={cn('flex items-start gap-abstand', schmal && 'grid grid-cols-2')}>
            <Wetter jetzt={jetzt} />
            {uhrZeigen && <Uhr termine={termine} jetzt={jetzt} />}
          </div>
          {!schmal && <Knoepfe />}
        </div>
      </div>
      <div className="flex-1" />
      {brauchtInhalt}
      <div className={cn('flex items-stretch', schmal ? 'gap-2' : 'gap-abstand')}>
        <Flaeche className={cn('h-24', knopfBreite)}>
          <Monat monat={wahl.monat} gewaehlt={wahl.fokus} jetzt={jetzt} beginn={beginn} termine={termine} waehle={zeige} />
        </Flaeche>
        <Flaeche className={cn('h-24 py-1.5', schmal ? 'min-w-0 flex-1 px-1.5' : 'w-full max-w-xl px-4')}>
          <Woche termine={termine} monat={wahl.monat} fokus={wahl.fokus} jetzt={jetzt} feiertag={feiertag} />
        </Flaeche>
        <div className={cn('ml-auto flex', schmal ? 'gap-2' : 'gap-abstand')}>
          {!schmal && (
            <Flaeche className={cn('h-24', knopfBreite)}>
              <Notiz />
            </Flaeche>
          )}
          <Flaeche className={cn('h-24', knopfBreite)}>
            <Rueckblick zahlen={wochenrueckblick(termine, braucht.liste ?? [], wochenTage(jetzt, beginn, 0), jetzt)} />
          </Flaeche>
        </div>
      </div>
    </div>
  )
}
