import { AlarmClock, CircleAlert, Ellipsis, Flag, FolderInput, Mail as MailSymbol, Pin } from 'lucide-react'
import { cn } from '../../bausteine/cn'
import { AktionKnopf } from '../../geruest/AktionKnopf'
import { Knopf } from '../../bausteine/Knopf'
import { useKategorien, useMailInhalt, useMails, useOrdner } from '../../geruest/daten'
import { datumLang, tagKurz, uhrzeit } from '../../geruest/format'
import { erinnere, holeZurueck, kategorie, nachverfolgen, nichtNachverfolgen, schalte, verschiebe } from '../../geruest/mailAktionen'
import { useMinute } from '../../geruest/useMinute'
import { seitText } from '../../logik/heute'
import { spaeterZeiten, kannHinein, kuerzel, mailsText, nachverfolgenWahl } from '../../logik/mails'
import type { Mail } from '../../vertrag/postfach'
import { ordnerFarben } from '../../werte/ordner'
import { hinweisKlassen } from '../../werte/postfach'
import { Erkannt } from './Erkannt'
import { Schreiben } from './Schreiben'
import { MitListe, Wahlliste, type Punkt } from './Wahlliste'

// Leser rechts neben der Liste wie in der Vorlage: Knöpfe für alle Aktionen, darunter Kopf und Text einer Mail.
// Sind mehrere Mails gewählt, wirken dieselben Knöpfe auf alle. Jede Aktion lässt sich zurücknehmen (geruest/mailAktionen.ts).
export function Leser({ mails, ordner }: { mails: readonly Mail[]; ordner: string }) {
  const m = mails.length === 1 ? mails[0] : undefined
  return (
    <section aria-label={m ? m.betreff : 'Leser'} className="flaeche-kachel flex h-full min-h-0 flex-col overflow-y-auto p-5">
      {mails.length === 0 ? (
        <MailSymbol aria-hidden className="m-auto size-10 text-text-blass" />
      ) : (
        <>
          {m?.ordner === 'entwuerfe' ? (
            <Schreiben m={m} />
          ) : (
            <>
              {m ? <Kopf m={m} /> : <h2 className="text-xl font-semibold">{mailsText(mails.length)} ausgewählt</h2>}
              <Knoepfe mails={mails} ordner={ordner} einzeln={!!m} />
              {m && m.ordner !== 'gesendet' && <Erkannt m={m} />}
              {m && <Text m={m} />}
              {m && <Antworten m={m} />}
            </>
          )}
        </>
      )}
    </section>
  )
}

/** Betreff, Kategorien, Absender mit Kürzel, Empfänger, Zeit, Ordner und Hinweis. */
function Kopf({ m }: { m: Mail }) {
  const { kategorien } = useKategorien()
  const { inhalt } = useMailInhalt(m.id)
  const ordnerName = useOrdner().ordner?.find((o) => o.id === m.ordner)?.name
  const jetzt = useMinute()
  const zeit = new Date(m.zeit)
  const farbe = (k: string) => {
    const f = kategorien?.find((x) => x.name === k)?.farbe
    return f ? ordnerFarben[f].klasse : 'text-text-gedaempft'
  }
  return (
    <header className="flex flex-col gap-2">
      <h2 className="flex items-start gap-2 text-xl font-semibold">
        {m.angeheftet && <Pin aria-label="Angeheftet" className="mt-1.5 size-4 shrink-0 text-akzent" />}
        {m.wichtig && <CircleAlert aria-label="Wichtig" className="mt-1.5 size-4 shrink-0 text-warnung" />}
        <span className="min-w-0">{m.betreff}</span>
      </h2>
      {m.kategorien.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {m.kategorien.map((k) => (
            <span key={k} className={cn('schild schild-gefuellt', farbe(k))}>
              {k}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-start gap-3">
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-voll bg-knopf-ton font-semibold text-akzent">
          {kuerzel(m.von)}
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <p className="truncate">
            <b>{m.von}</b> <span className="text-text-gedaempft">&lt;{m.adresse}&gt;</span>
          </p>
          <p className="truncate text-text-gedaempft">
            {inhalt && `an ${inhalt.an.join(', ')}${inhalt.cc.length ? ` · cc ${inhalt.cc.join(', ')}` : ''} · `}
            <time dateTime={m.zeit}>
              {datumLang(zeit)}, {uhrzeit(zeit)}
            </time>
            {ordnerName && ` · ${ordnerName}`}
          </p>
          {m.nachverfolgen && <p className="font-semibold text-warnung">Nachverfolgen{m.faellig && ` · fällig ${seitText(m.faellig, jetzt)}`}</p>}
          {m.erinnernAm && (
            <p className="text-text-gedaempft">
              Zurück am {datumLang(new Date(m.erinnernAm))}, {uhrzeit(m.erinnernAm)}
            </p>
          )}
          {m.sendenAm && (
            <p className="flex flex-wrap items-center gap-2 font-semibold text-akzent">
              Wird gesendet am {datumLang(new Date(m.sendenAm))}, {uhrzeit(m.sendenAm)}
              <Knopf groesse="klein" onClick={() => void holeZurueck(m)}>
                Zurückholen
              </Knopf>
            </p>
          )}
        </div>
        {m.hinweis && <span className={cn('schild', hinweisKlassen[m.hinweis])}>{m.hinweis}</span>}
      </div>
    </header>
  )
}

/** Text der Mail; lädt beim ersten Öffnen nach. */
function Text({ m }: { m: Mail }) {
  const { inhalt, fehler } = useMailInhalt(m.id)
  if (fehler) return <p className="mt-4 text-sm text-warnung">{fehler}</p>
  return <div className="mt-5 max-w-prose leading-relaxed whitespace-pre-line">{inhalt?.text}</div>
}

/** Entwürfe von Antworten auf diese Mail, direkt darunter. */
function Antworten({ m }: { m: Mail }) {
  const { mails } = useMails('entwuerfe')
  const antworten = (mails ?? []).filter((x) => x.antwortAuf === m.id)
  return antworten.map((a) => (
    <div key={a.id} className="mt-6 border-t border-linie pt-4">
      <Schreiben m={a} />
    </div>
  ))
}

/** Alle Aktionen für die gewählten Mails; Antworten und Weiterleiten nur bei einer. */
function Knoepfe({ mails, ordner, einzeln }: { mails: readonly Mail[]; ordner: string; einzeln: boolean }) {
  const jetzt = useMinute()
  const alleOrdner = useOrdner().ordner ?? []
  const { kategorien } = useKategorien()
  const alle = (f: (x: Mail) => boolean) => mails.every(f)

  const nach: Punkt[] = [
    ...nachverfolgenWahl(jetzt).map((w) => ({ id: w.name, name: w.name, aktiv: alle((x) => x.nachverfolgen && (x.faellig ?? null) === w.faellig), tun: () => void nachverfolgen(mails, w.faellig, w.name) })),
    ...(mails.some((x) => x.nachverfolgen) ? [{ id: 'erledigt', name: 'Erledigt', tun: () => void nichtNachverfolgen(mails) }] : []),
  ]
  const erinnern: Punkt[] = spaeterZeiten(jetzt).map((z) => ({
    id: z.name,
    name: (
      <>
        {z.name}
        <span className="ml-auto text-text-gedaempft tabular-nums">
          {tagKurz(z.zeit)} {uhrzeit(z.zeit)}
        </span>
      </>
    ),
    tun: () => void erinnere(mails, z.zeit, z.name),
  }))
  const ziele: Punkt[] = alleOrdner.filter((o) => kannHinein(o) && !alle((x) => x.ordner === o.id)).map((o) => ({ id: o.id, name: o.name, tun: () => void verschiebe(mails, o) }))
  const mehr: Punkt[] = [
    { id: 'ungelesen', name: alle((x) => x.ungelesen) ? 'Als gelesen markieren' : 'Als ungelesen markieren', tun: () => void schalte(mails, 'ungelesen') },
    { id: 'anheften', name: alle((x) => x.angeheftet) ? 'Lösen' : 'Anheften', tun: () => void schalte(mails, 'angeheftet') },
    { id: 'wichtig', name: alle((x) => x.wichtig) ? 'Nicht mehr wichtig' : 'Als wichtig markieren', tun: () => void schalte(mails, 'wichtig') },
  ]
  const kat: Punkt[] = (kategorien ?? []).map((k) => ({ id: k.name, name: k.name, aktiv: alle((x) => x.kategorien.includes(k.name)), tun: () => void kategorie(mails, k.name) }))

  return (
    <div role="toolbar" aria-label="Aktionen" className="mt-4 flex flex-wrap items-center gap-2">
      {einzeln && ['mail-antworten', 'mail-allen-antworten', 'mail-weiterleiten'].map((id) => <AktionKnopf key={id} id={id} mitName />)}
      <MitListe name="Nachverfolgen" Symbol={Flag}>
        <Wahlliste punkte={nach} />
      </MitListe>
      <MitListe name="Erinnern" Symbol={AlarmClock}>
        <Wahlliste punkte={erinnern} />
      </MitListe>
      <MitListe name="Verschieben nach" Symbol={FolderInput}>
        <Wahlliste punkte={ziele} />
      </MitListe>
      {ordner !== 'archiv' && <AktionKnopf id="mail-archivieren" groesse="klein" />}
      {ordner !== 'papierkorb' && <AktionKnopf id="mail-loeschen" groesse="klein" />}
      <MitListe name="Mehr" Symbol={Ellipsis} nurSymbol>
        <Wahlliste punkte={mehr} />
        <Wahlliste titel="Kategorie" punkte={kat} />
      </MitListe>
    </div>
  )
}
