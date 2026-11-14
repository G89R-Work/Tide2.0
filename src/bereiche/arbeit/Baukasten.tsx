import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Auswahl } from '../../bausteine/Auswahl'
import { Eingabe } from '../../bausteine/Eingabe'
import { Knopf } from '../../bausteine/Knopf'
import { cn } from '../../bausteine/cn'
import { aendereRhythmusMitSchritt } from '../../geruest/daten'
import { tagKurz } from '../../geruest/format'
import { neueId, ohneArt, ohneMuster, vorschau, type Rhythmus } from '../../logik/rhythmus'
import { tagSchluessel } from '../../logik/zeit'
import { rhythmusSchema } from '../../vertrag/arbeit'
import { ordnerFarben } from '../../werte/ordner'
import { Farbpunkt, Farbwahl } from '../../geruest/Farbwahl'

/** Wochen der Vorschau vor dem Speichern (Konzept). */
const VORSCHAU_WOCHEN = 8
const wochentage = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

/** Ersetzt das Element mit `id` durch `neu(alt)`. */
const ersetze = <T extends { id: string }>(liste: readonly T[], id: string, neu: (alt: T) => T) => liste.map((x) => (x.id === id ? neu(x) : x))

// Rhythmus-Baukasten (docs/konzept/17-arbeit.md): Schichtarten, Wochenmuster, Abfolge und Start bearbeiten; die Vorschau zeigt acht Wochen vor dem Speichern.
export default function Baukasten({ rhythmus, jetzt, fertig }: { rhythmus: Rhythmus; jetzt: Date; fertig: () => void }) {
  const [r, setR] = useState(rhythmus)
  const pruefung = rhythmusSchema.safeParse(r)
  const geaendert = JSON.stringify(r) !== JSON.stringify(rhythmus)
  const speichern = async () => {
    if (await aendereRhythmusMitSchritt(rhythmus, r, 'Rhythmus geändert')) fertig()
  }

  const neueArt = () => {
    const id = neueId(r.arten.map((a) => a.id), 'schicht')
    setR({ ...r, arten: [...r.arten, { id, name: 'Neue Schicht', beginn: '08:00', ende: '16:00', farbe: 'sand', pause: 30 }] })
  }
  const neuesMuster = () => {
    const id = neueId(r.muster.map((m) => m.id), 'muster')
    setR({ ...r, muster: [...r.muster, { id, name: 'Neues Muster', tage: [null, null, null, null, null, null, null] }] })
  }

  return (
    <section id="arbeit-rhythmus" aria-label="Rhythmus" className="flaeche-kachel flex flex-col gap-4 p-4">
      <h2 className="text-lg font-semibold">Rhythmus</h2>

      <Teil titel="Schichtarten">
        {r.arten.map((a) => (
          <div key={a.id} className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Farbwahl aria-label={`Farbe ${a.name}`} wert={a.farbe} className={cn('w-28', ordnerFarben[a.farbe].klasse)} aendern={(farbe) => setR({ ...r, arten: ersetze(r.arten, a.id, (x) => ({ ...x, farbe })) })} />
              <Eingabe aria-label="Name" value={a.name} className="min-w-0 flex-1" onChange={(e) => setR({ ...r, arten: ersetze(r.arten, a.id, (x) => ({ ...x, name: e.target.value })) })} />
              <Knopf art="symbol" groesse="klein" aria-label={`${a.name} entfernen`} onClick={() => setR(ohneArt(r, a.id))}>
                <X aria-hidden className="size-4" />
              </Knopf>
            </div>
            <div className="flex items-center gap-2">
              <Eingabe aria-label={`Beginn ${a.name}`} type="time" value={a.beginn} className="min-w-0 flex-1 lg:w-28 lg:flex-none" onChange={(e) => setR({ ...r, arten: ersetze(r.arten, a.id, (x) => ({ ...x, beginn: e.target.value })) })} />
              <Eingabe aria-label={`Ende ${a.name}`} type="time" value={a.ende} className="min-w-0 flex-1 lg:w-28 lg:flex-none" onChange={(e) => setR({ ...r, arten: ersetze(r.arten, a.id, (x) => ({ ...x, ende: e.target.value })) })} />
              <label className="flex items-center gap-1 text-sm text-text-gedaempft">
                <Eingabe aria-label={`Pause ${a.name}`} type="number" min={0} step={5} value={a.pause} className="w-16" onChange={(e) => setR({ ...r, arten: ersetze(r.arten, a.id, (x) => ({ ...x, pause: Math.max(0, Math.round(Number(e.target.value))) })) })} />
                Min. Pause
              </label>
            </div>
          </div>
        ))}
        <Neu onClick={neueArt}>Schichtart</Neu>
      </Teil>

      <Teil titel="Wochenmuster">
        {r.muster.map((m) => (
          <div key={m.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Eingabe aria-label="Name des Musters" value={m.name} className="min-w-0 flex-1" onChange={(e) => setR({ ...r, muster: ersetze(r.muster, m.id, (x) => ({ ...x, name: e.target.value })) })} />
              <Knopf art="symbol" groesse="klein" aria-label={`${m.name} entfernen`} onClick={() => setR(ohneMuster(r, m.id))}>
                <X aria-hidden className="size-4" />
              </Knopf>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {m.tage.map((t, i) => (
                <Auswahl
                  key={wochentage[i]}
                  aria-label={`${m.name} ${wochentage[i]}`}
                  title={wochentage[i]}
                  value={t ?? ''}
                  className="px-1 text-xs"
                  onChange={(e) => setR({ ...r, muster: ersetze(r.muster, m.id, (x) => ({ ...x, tage: x.tage.map((alt, j) => (j === i ? e.target.value || null : alt)) })) })}
                >
                  <option value="">{wochentage[i]} frei</option>
                  {r.arten.map((a) => (
                    <option key={a.id} value={a.id}>
                      {wochentage[i]} {a.name}
                    </option>
                  ))}
                </Auswahl>
              ))}
            </div>
          </div>
        ))}
        <Neu onClick={neuesMuster}>Wochenmuster</Neu>
      </Teil>

      <Teil titel="Abfolge">
        {r.abfolge.map((ab, i) => (
          // Abschnitte haben keine eigene id; die Stelle in der Abfolge ist ihr Name.
          <div key={`${i}-${ab.muster}`} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-sm text-text-blass tabular-nums">{i + 1}.</span>
            <Auswahl aria-label={`Abschnitt ${i + 1}: Muster`} value={ab.muster} className="min-w-0 flex-1" onChange={(e) => setR({ ...r, abfolge: r.abfolge.map((x, j) => (j === i ? { ...x, muster: e.target.value } : x)) })}>
              {r.muster.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Auswahl>
            <label className="flex items-center gap-1 text-sm text-text-gedaempft">
              <Eingabe aria-label={`Abschnitt ${i + 1}: Wochen`} type="number" min={1} value={ab.wochen} className="w-20" onChange={(e) => setR({ ...r, abfolge: r.abfolge.map((x, j) => (j === i ? { ...x, wochen: Math.max(1, Math.round(Number(e.target.value))) } : x)) })} />
              Wochen
            </label>
            <Knopf art="symbol" groesse="klein" aria-label={`Abschnitt ${i + 1} entfernen`} onClick={() => setR({ ...r, abfolge: r.abfolge.filter((_, j) => j !== i) })}>
              <X aria-hidden className="size-4" />
            </Knopf>
          </div>
        ))}
        {r.muster[0] && <Neu onClick={() => setR({ ...r, abfolge: [...r.abfolge, { muster: r.muster[0]?.id ?? '', wochen: 1 }] })}>Abschnitt</Neu>}
        <label className="flex items-center gap-2 text-sm text-text-gedaempft">
          Start
          <Eingabe aria-label="Start" type="date" value={r.start} className="w-44" onChange={(e) => setR({ ...r, start: e.target.value })} />
        </label>
      </Teil>

      <Teil titel={`Vorschau ${VORSCHAU_WOCHEN} Wochen`}>
        {pruefung.success ? <Vorschau r={pruefung.data} jetzt={jetzt} /> : <p className="text-sm text-warnung">{pruefung.error.issues.map((f) => f.message).join(', ')}</p>}
      </Teil>

      <div className="flex justify-end gap-2">
        <Knopf art="leise" onClick={fertig}>
          Abbrechen
        </Knopf>
        <Knopf art="haupt" disabled={!pruefung.success || !geaendert} onClick={() => void speichern()}>
          Speichern
        </Knopf>
      </div>
    </section>
  )
}

function Teil({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="beschriftung">{titel}</h3>
      {children}
    </div>
  )
}

function Neu({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <Knopf art="leise" groesse="klein" className="self-start" onClick={onClick}>
      <Plus aria-hidden className="size-4" />
      {children}
    </Knopf>
  )
}

/** Acht Wochen ab dieser, je Tag die Farbe der Schicht. */
function Vorschau({ r, jetzt }: { r: Rhythmus; jetzt: Date }) {
  const tage = vorschau(r, jetzt, VORSCHAU_WOCHEN)
  return (
    <div className="grid grid-cols-7 gap-1 text-center text-xs">
      {tage.slice(0, 7).map((t) => (
        <span key={t.tag.getDay()} className="text-text-blass">
          {tagKurz(t.tag)}
        </span>
      ))}
      {tage.map((t) => (
        <span key={tagSchluessel(t.tag)} title={t.schicht?.art.name ?? 'frei'} className="flex min-w-0 items-center justify-center gap-1 rounded-knopf bg-knopf-ton py-1">
          <span className="text-text-gedaempft tabular-nums">{t.tag.getDate()}</span>
          {t.schicht && <Farbpunkt farbe={t.schicht.art.farbe} />}
        </span>
      ))}
    </div>
  )
}
