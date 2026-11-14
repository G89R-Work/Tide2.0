import FullCalendar from '@fullcalendar/react'
import type { EventChangeInfo, EventInput } from '@fullcalendar/react'
import interaktion from '@fullcalendar/react/interaction'
import de from '@fullcalendar/react/locales/de'
import zeitraster from '@fullcalendar/react/timegrid'
import '@fullcalendar/react/skeleton.css'
import { addDays, isSameDay } from 'date-fns'
import { useMemo } from 'react'
import { cn } from '../../bausteine/cn'
import { aendereEintragMitSchritt, useFeiertage } from '../../geruest/daten'
import { useEinstellung } from '../../geruest/einstellungen'
import { tagKurz, uhrzeit } from '../../geruest/format'
import { einstellung } from '../../logik/einstellungen'
import { stundenBereich } from '../../logik/kalender'
import type { Eintrag } from '../../vertrag/eintrag'

const bundesland = einstellung('bundesland')
const bausteine = [zeitraster, interaktion]

type Props = {
  tage: readonly Date[]
  gewaehlt: Date
  termine: readonly Eintrag[]
  waehle: (t: Date) => void
}

// Wochenansicht (docs/konzept/12-kalender.md) mit FullCalendar 7: Stundenraster, Schichten als Flächen, Termine als Blöcke.
// Ziehen und Größe ändern speichern mit Rückgängig; die Stunden passen in die Kachel, damit Wischen und Scrollen blättern.
export default function Woche({ tage, gewaehlt, termine, waehle }: Props) {
  const land = useEinstellung(bundesland)
  const feiertag = useFeiertage(gewaehlt.getFullYear(), land)
  const [von, bis] = stundenBereich(termine, tage)
  const erster = tage[0] ?? gewaehlt
  const nachId = useMemo(() => new Map(termine.map((e) => [e.id, e])), [termine])
  const events = useMemo<EventInput[]>(
    () =>
      termine.flatMap((e) =>
        e.beginn && e.ende ? [{ id: e.id, title: e.titel, start: e.beginn, end: e.ende, ...(e.art === 'schicht' ? { display: 'background' } : {}) }] : [],
      ),
    [termine],
  )

  const geaendert = ({ event, revert }: EventChangeInfo) => {
    const e = nachId.get(event.id)
    const { start, end } = event
    if (!e || !start || !end) return revert()
    const text = `„${e.titel}“ ${tagKurz(start)} ${uhrzeit(start)}–${uhrzeit(end)}`
    void aendereEintragMitSchritt(e, { beginn: start.toISOString(), ende: end.toISOString() }, text, 'kalender').then((ok) => ok || revert())
  }

  return (
    <FullCalendar
      plugins={bausteine}
      locale={de}
      initialView="timeGrid"
      visibleRange={{ start: erster, end: addDays(erster, 7) }}
      headerToolbar={false}
      allDaySlot={false}
      height="100%"
      expandRows
      slotMinTime={{ hours: von }}
      slotMaxTime={{ hours: bis }}
      slotDuration={{ hours: 1 }}
      snapDuration={{ minutes: 15 }}
      nowIndicator
      editable
      events={events}
      eventChange={geaendert}
      dateClick={({ date }) => waehle(date)}
      viewClass="text-sm"
      tableHeaderClass="border-b border-linie"
      dayHeaderClass={({ date }) => cn('py-1 text-center text-xs', isSameDay(date, gewaehlt) ? 'text-text' : 'text-text-blass')}
      dayHeaderContent={({ date, isToday }) => (
        <button type="button" onClick={() => waehle(date)} className="flex w-full cursor-pointer flex-col items-center gap-0.5 outline-none focus-visible:ring-2 focus-visible:ring-akzent">
          <span>{tagKurz(date)}</span>
          <span className={cn('rounded-voll px-1.5 text-sm tabular-nums', isToday && 'akzent-verlauf font-semibold text-auf-akzent', !isToday && feiertag(date) && 'text-akzent')}>{date.getDate()}</span>
          {feiertag(date) && <span className="max-w-full truncate text-akzent">{feiertag(date)}</span>}
        </button>
      )}
      slotHeaderClass="pr-2 text-right text-xs text-text-blass tabular-nums align-top"
      slotHeaderContent={({ date }) => uhrzeit(date)}
      slotLaneClass="border-t border-linie"
      dayLaneClass={({ date }) => cn('border-l border-linie', isSameDay(date, gewaehlt) && 'bg-akzent/5')}
      eventClass="drueck cursor-pointer overflow-hidden rounded-knopf bg-akzent/15 px-1 text-xs text-text ring-1 ring-akzent/40"
      eventContent={({ event }) => (
        <span data-termin className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{event.title}</span>
          {event.start && event.end && <span className="truncate text-text-gedaempft tabular-nums">{`${uhrzeit(event.start)}–${uhrzeit(event.end)}`}</span>}
        </span>
      )}
      backgroundEventClass="bg-knopf-ton"
      backgroundEventContent={({ event }) => <span className="block truncate px-1 text-xs text-text-gedaempft">{event.title}</span>}
      nowIndicatorLineClass="border-t-2 border-akzent"
    />
  )
}
