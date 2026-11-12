import { RotateCcw } from 'lucide-react'
import { Auswahl } from '../../bausteine/Auswahl'
import { Eingabe } from '../../bausteine/Eingabe'
import { Knopf } from '../../bausteine/Knopf'
import { Schalter } from '../../bausteine/Schalter'
import { cn } from '../../bausteine/cn'
import { einstellungenAendern } from '../../geruest/einstellungen'
import { istStandard, setze, wertVon, type Einstellung, type Geraet, type Wert, type Werte } from '../../logik/einstellungen'

// Eine Zeile je Einstellung, immer gleich hoch (zwei Textzeilen, nie mehr): Name links, Bedienung rechts, daneben immer „Auf Standard" (ausgegraut, solange der Standard gilt).
export function EinstellungZeile({ e, werte, geraet }: { e: Einstellung; werte: Werte; geraet: Geraet }) {
  const wert = wertVon(e, werte, geraet)
  const feld = `einstellung-${e.id}`
  const aendern = (w: Wert) => einstellungenAendern(setze(werte, e, geraet, w))
  const standard = istStandard(e, werte, geraet)
  const geraetHinweis = e.jeGeraet ? `Gilt für ${geraet === 'pc' ? 'den PC' : 'das Handy'}` : undefined
  const unterzeile = [e.hilfe, geraetHinweis].filter(Boolean).join(' · ')

  return (
    <li className="flex h-16 items-center gap-3">
      <div className="min-w-0 flex-1">
        <label htmlFor={feld} title={e.name} className={cn('block', unterzeile ? 'line-clamp-1' : 'line-clamp-2')}>
          {e.name}
        </label>
        {unterzeile && (
          <p title={unterzeile} className="line-clamp-1 text-sm text-text-gedaempft">
            {unterzeile}
          </p>
        )}
      </div>
      {e.art === 'schalter' && (
        <Schalter id={feld} checked={wert === true} onChange={(x) => aendern(x.currentTarget.checked)} />
      )}
      {e.art === 'auswahl' && (
        <Auswahl id={feld} className="w-32 sm:w-44" value={String(wert)} onChange={(x) => aendern(x.currentTarget.value)}>
          {e.optionen.map(([w, name]) => (
            <option key={w} value={w}>
              {name}
            </option>
          ))}
        </Auswahl>
      )}
      {e.art === 'zahl' && (
        <span className="flex items-center gap-2 text-sm text-text-gedaempft">
          <Eingabe
            // Neuer Schlüssel bei neuem Wert, damit „Rückgängig" auch das Feld zurückstellt.
            key={String(wert)}
            id={feld}
            type="number"
            inputMode={e.schritt ? 'decimal' : 'numeric'}
            min={e.min}
            max={e.max}
            step={e.schritt}
            defaultValue={String(wert)}
            className={e.schritt ? 'w-24 text-right' : 'w-20 text-right'}
            onBlur={(x) => {
              const zahl = Number(x.currentTarget.value)
              if (setze(werte, e, geraet, zahl) === werte && zahl !== wert) x.currentTarget.value = String(wert)
              else aendern(zahl)
            }}
            onKeyDown={(x) => x.key === 'Enter' && x.currentTarget.blur()}
          />
          {e.einheit}
        </span>
      )}
      {e.art === 'text' && (
        <Eingabe
          key={String(wert)}
          id={feld}
          type="text"
          maxLength={e.laenge}
          defaultValue={String(wert)}
          className="w-32 sm:w-44"
          onBlur={(x) => x.currentTarget.value !== wert && aendern(x.currentTarget.value.trim())}
          onKeyDown={(x) => x.key === 'Enter' && x.currentTarget.blur()}
        />
      )}
      <Knopf
        art="symbol"
        groesse="klein"
        aria-label={`${e.name} auf Standard zurücksetzen`}
        title="Auf Standard zurücksetzen"
        disabled={standard}
        onClick={() => aendern(e.standard)}
      >
        <RotateCcw aria-hidden className="size-4" />
      </Knopf>
    </li>
  )
}
