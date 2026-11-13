import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import { CircleAlert, Flag, ListFilter, Paperclip, Pin, Search } from 'lucide-react'
import { memo, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { VList, type VListHandle } from 'virtua'
import { Aufklapp, AufklappInhalt, AufklappKnopf } from '../../bausteine/Aufklapp'
import { Eingabe } from '../../bausteine/Eingabe'
import { Knopf } from '../../bausteine/Knopf'
import { cn } from '../../bausteine/cn'
import { useKategorien, useMailFehler, useMails, useOrdner } from '../../geruest/daten'
import { mailZeit } from '../../geruest/format'
import { mailDaten } from '../../geruest/mailZiehen'
import { useMinute } from '../../geruest/useMinute'
import { seitText } from '../../logik/heute'
import { gezogen, mailFilter, mailSortierung, mailsText, waehle, zeigeMails, type Ansicht, type Auswahl, type MailFilter, type MailSortierung, type Wahl } from '../../logik/mails'
import type { Mail } from '../../vertrag/postfach'
import { ordnerFarben } from '../../werte/ordner'
import { hinweisKlassen, postfach } from '../../werte/postfach'

const keine: Auswahl = { ids: [], anker: null }
const start: Ansicht = { suche: '', filter: 'alle', sortierung: 'neu' }

/** Klick mit Umschalt wählt den Bereich, mit Strg oder Cmd dazu, sonst nur diese Mail. */
const wahlVon = (e: MouseEvent) => (e.shiftKey ? 'bereich' : e.metaKey || e.ctrlKey ? 'dazu' : 'einzeln')

// Mail-Liste eines Ordners wie in der Vorlage: Kopf mit Alle-Häkchen, Name, Zahl, „Ungelesen“ und Filter; Suche;
// darunter die Mails. Nur die sichtbaren Zeilen entstehen (virtua), darum bleibt die Liste bei 500 Mails ruhig.
// Auswahl per Klick, Strg/Cmd, Umschalt, Häkchen und Pfeiltasten; gezogen wird die ganze Auswahl in einen Ordner der Leiste.
/** Ohne `breite` füllt die Liste den Platz (Handy). */
export function MailListe({ ordner, breite }: { ordner: string; breite?: number }) {
  const { mails, fehler } = useMails(ordner)
  const { kategorien } = useKategorien()
  const name = useOrdner().ordner?.find((o) => o.id === ordner)?.name ?? ''
  const aendernFehler = useMailFehler()
  const jetzt = useMinute()
  const [ansicht, setAnsicht] = useState(start)
  const [auswahl, setAuswahl] = useState(keine)
  const liste = useMemo(() => (mails ? zeigeMails(mails, ansicht) : []), [mails, ansicht])
  const reihe = useMemo(() => liste.map((m) => m.id), [liste])
  const gewaehlt = useMemo(() => new Set(auswahl.ids.filter((id) => reihe.includes(id))), [auswahl, reihe])
  const farbe = useMemo(() => new Map(kategorien?.map((k) => [k.name, ordnerFarben[k.farbe].klasse])), [kategorien])
  const vliste = useRef<VListHandle>(null)

  const alleGewaehlt = gewaehlt.size > 0 && gewaehlt.size === reihe.length
  const alleKasten = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (alleKasten.current) alleKasten.current.indeterminate = gewaehlt.size > 0 && !alleGewaehlt
  }, [gewaehlt, alleGewaehlt])

  const klick = (id: string, wahl: Wahl) => setAuswahl((a) => waehle(a, reihe, id, wahl))
  const setze = (x: Partial<Ansicht>) => setAnsicht((a) => ({ ...a, ...x }))

  const tasten = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setAuswahl(keine)
    else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault()
      setAuswahl({ ids: reihe, anker: reihe[0] ?? null })
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const i = reihe.indexOf(auswahl.anker ?? '') + (e.key === 'ArrowDown' ? 1 : -1)
      const n = Math.min(reihe.length - 1, Math.max(0, i))
      const id = reihe[n]
      if (id === undefined) return
      klick(id, 'einzeln')
      vliste.current?.scrollToIndex(n, { align: 'nearest' })
    }
  }

  const gefiltert = ansicht.filter !== 'alle' || ansicht.sortierung !== 'neu'
  const mehrfach = gewaehlt.size > 1

  return (
    <section aria-label={name} className={cn('flaeche-kachel flex min-h-0 flex-col overflow-hidden', breite ? 'shrink-0' : 'flex-1')} style={{ width: breite }}>
      <header className="flex items-center gap-2 px-3 pt-3">
        <input
          ref={alleKasten}
          type="checkbox"
          aria-label="Alle auswählen"
          className="size-4 shrink-0 cursor-pointer accent-akzent"
          checked={alleGewaehlt}
          onChange={() => setAuswahl(alleGewaehlt ? keine : { ids: reihe, anker: reihe[0] ?? null })}
        />
        <h1 className="min-w-0 flex-1 truncate font-semibold">{name}</h1>
        <span className="shrink-0 text-xs text-text-gedaempft tabular-nums">{mehrfach ? `${gewaehlt.size} ausgewählt` : mailsText(liste.length)}</span>
        <Knopf
          groesse="klein"
          aria-pressed={ansicht.filter === 'ungelesen'}
          className={cn(ansicht.filter === 'ungelesen' && 'border-akzent text-akzent')}
          onClick={() => setze({ filter: ansicht.filter === 'ungelesen' ? 'alle' : 'ungelesen' })}
        >
          Ungelesen
        </Knopf>
        <Aufklapp>
          <AufklappKnopf asChild>
            <Knopf art="symbol" groesse="klein" aria-label="Filtern und sortieren" title={`${mailFilter[ansicht.filter]} · ${mailSortierung[ansicht.sortierung]}`} className={cn(gefiltert && 'text-akzent')}>
              <ListFilter aria-hidden className="size-4" />
            </Knopf>
          </AufklappKnopf>
          <AufklappInhalt breite="inhalt" align="end" aria-label="Filtern und sortieren" className="flex w-56 flex-col gap-1 p-2">
            <Wahlen titel="Zeigen" werte={mailFilter} aktiv={ansicht.filter} waehle={(filter: MailFilter) => setze({ filter })} />
            <Wahlen titel="Sortieren" werte={mailSortierung} aktiv={ansicht.sortierung} waehle={(sortierung: MailSortierung) => setze({ sortierung })} />
          </AufklappInhalt>
        </Aufklapp>
      </header>
      <label className="relative mx-3 my-2 flex items-center">
        <Search aria-hidden className="pointer-events-none absolute left-3 size-4 text-text-gedaempft" />
        <Eingabe type="search" aria-label="In Mails suchen" placeholder="In Mails suchen" value={ansicht.suche} onChange={(e) => setze({ suche: e.target.value })} className="h-9 w-full pl-9" />
      </label>
      {(fehler ?? aendernFehler) && <p className="px-3 pb-2 text-sm text-warnung">{fehler ?? aendernFehler}</p>}
      {mails && liste.length === 0 && <p className="border-t border-linie px-3 py-4 text-sm text-text-gedaempft">{ansicht.suche || ansicht.filter !== 'alle' ? 'Keine Treffer' : 'Keine Mails'}</p>}
      <VList
        ref={vliste}
        data={liste}
        itemSize={postfach.zeilePx}
        bufferSize={postfach.vorratPx}
        role="listbox"
        aria-label={`Mails in ${name}`}
        aria-multiselectable
        tabIndex={0}
        onKeyDown={tasten}
        className={cn('min-h-0 flex-1 touch-pan-y overscroll-contain border-t border-linie outline-none focus-visible:ring-2 focus-visible:ring-akzent focus-visible:ring-inset', liste.length === 0 && 'hidden')}
      >
        {(m) => (
          <MailZeile
            key={m.id}
            m={m}
            gewaehlt={gewaehlt.has(m.id)}
            mehrfach={mehrfach}
            mitnehmen={gezogen(auswahl, m.id)}
            aus={ordner}
            farbe={farbe}
            jetzt={jetzt}
            klick={klick}
          />
        )}
      </VList>
    </section>
  )
}

/** Eine Gruppe von Wahlen im Filter-Menü; die aktive hat ein Häkchen. */
function Wahlen<K extends string>({ titel, werte, aktiv, waehle }: { titel: string; werte: Record<K, string>; aktiv: K; waehle: (k: K) => void }) {
  return (
    <div role="group" aria-label={titel} className="flex flex-col">
      <p className="beschriftung px-3 pt-2 pb-1">{titel}</p>
      {(Object.keys(werte) as K[]).map((k) => (
        <Knopf key={k} art="leise" groesse="klein" aria-pressed={k === aktiv} className="w-full justify-start" onClick={() => waehle(k)}>
          {werte[k]}
          {k === aktiv && <span className="ml-auto text-akzent">✓</span>}
        </Knopf>
      ))}
    </div>
  )
}

type ZeileProps = {
  m: Mail
  gewaehlt: boolean
  mehrfach: boolean
  /** Was beim Ziehen dieser Zeile mitgeht */
  mitnehmen: readonly string[]
  aus: string
  farbe: ReadonlyMap<string, string>
  jetzt: Date
  klick: (id: string, wahl: Wahl) => void
}

/** Eine Mail: Absender, Symbole, Zeit; Betreff; Kategorien, Fälligkeit, Vorschau und Hinweis. Ziehbar in einen Ordner. */
const MailZeile = memo(function MailZeile({ m, gewaehlt, mehrfach, mitnehmen, aus, farbe, jetzt, klick }: ZeileProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [zieht, setZieht] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    return draggable({
      element,
      getInitialData: () => mailDaten({ mails: [...mitnehmen], aus }),
      onGenerateDragPreview: ({ nativeSetDragImage }) =>
        setCustomNativeDragPreview({
          nativeSetDragImage,
          render: ({ container }) => {
            container.className = 'flaeche-schwebend px-3 py-2 text-sm text-text'
            container.textContent = mitnehmen.length > 1 ? mailsText(mitnehmen.length) : m.betreff
          },
        }),
      onDragStart: () => setZieht(true),
      onDrop: () => setZieht(false),
    })
  }, [mitnehmen, aus, m.betreff])

  return (
    <div
      ref={ref}
      role="option"
      aria-selected={gewaehlt}
      data-ungelesen={m.ungelesen || undefined}
      data-mehrfach={(mehrfach && gewaehlt) || undefined}
      data-zieht={zieht || undefined}
      onClick={(e) => klick(m.id, wahlVon(e))}
      className="mail-zeile group flex gap-2 px-3 py-2.5"
      style={{ height: postfach.zeilePx }}
    >
      <input
        type="checkbox"
        aria-label={`${m.betreff} auswählen`}
        tabIndex={-1}
        checked={mehrfach && gewaehlt}
        onClick={(e) => e.stopPropagation()}
        onChange={() => klick(m.id, 'dazu')}
        className={cn('mt-0.5 size-4 shrink-0 cursor-pointer accent-akzent opacity-0 group-hover:opacity-100 focus-visible:opacity-100', mehrfach && 'opacity-100')}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className={cn('min-w-0 flex-1 truncate text-sm', m.ungelesen && 'font-bold')}>{m.von}</span>
          {m.angeheftet && <Pin aria-label="Angeheftet" className="size-3.5 shrink-0 text-akzent" />}
          {m.wichtig && <CircleAlert aria-label="Wichtig" className="size-3.5 shrink-0 text-warnung" />}
          {m.anhaenge.length > 0 && <Paperclip aria-label="Anhang" className="size-3.5 shrink-0 text-text-gedaempft" />}
          {m.nachverfolgen && <Flag aria-label="Nachverfolgen" className="size-3.5 shrink-0 text-warnung" />}
          <time dateTime={m.zeit} className="shrink-0 text-xs text-text-gedaempft tabular-nums">
            {mailZeit(m.zeit, jetzt)}
          </time>
        </div>
        <span className={cn('truncate text-sm', m.ungelesen ? 'font-semibold' : 'text-text-gedaempft')}>{m.betreff}</span>
        <div className="flex min-w-0 items-center gap-1.5">
          {m.kategorien.map((k) => (
            <span key={k} className={cn('schild schild-gefuellt', farbe.get(k) ?? 'text-text-gedaempft')}>
              {k}
            </span>
          ))}
          <span className="min-w-0 flex-1 truncate text-xs text-text-gedaempft">
            {m.faellig && <b className="font-semibold text-warnung">Fällig {seitText(m.faellig, jetzt)} · </b>}
            {m.vorschau}
          </span>
          {m.hinweis && <span className={cn('schild', hinweisKlassen[m.hinweis])}>{m.hinweis}</span>}
        </div>
      </div>
    </div>
  )
})
