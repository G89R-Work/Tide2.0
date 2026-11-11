import { RotateCcw } from 'lucide-react'
import { Auswahl } from '../../bausteine/Auswahl'
import { Eingabe } from '../../bausteine/Eingabe'
import { Knopf } from '../../bausteine/Knopf'
import { Schalter } from '../../bausteine/Schalter'
import { einstellungenAendern } from '../../geruest/einstellungen'
import { istStandard, setze, wertVon, type Einstellung, type Geraet, type Wert, type Werte } from '../../logik/einstellungen'

// Eine Zeile je Einstellung: Name links, Bedienung rechts, daneben „Auf Standard", sobald etwas abweicht.
export function EinstellungZeile({ e, werte, geraet }: { e: Einstellung; werte: Werte; geraet: Geraet }) {
  const wert = wertVon(e, werte, geraet)
  const feld = `einstellung-${e.id}`
  const aendern = (w: Wert) => einstellungenAendern(setze(werte, e, geraet, w))
  const standard = istStandard(e, werte, geraet)

  return (
    <li className="flex min-h-11 items-center gap-3 py-2">
      <div className="min-w-0 flex-1">
        <label htmlFor={feld} className="block">
          {e.name}
        </label>
        {(e.hilfe || e.jeGeraet) && (
          <p className="text-sm text-text-gedaempft">
            {e.hilfe}
            {e.hilfe && e.jeGeraet ? ' · ' : ''}
            {e.jeGeraet ? `Gilt für ${geraet === 'pc' ? 'den PC' : 'das Handy'}` : ''}
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
            inputMode="numeric"
            min={e.min}
            max={e.max}
            defaultValue={String(wert)}
            className="w-20 text-right"
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
      <Knopf
        art="symbol"
        groesse="klein"
        aria-label={`${e.name} auf Standard zurücksetzen`}
        title="Auf Standard zurücksetzen"
        className={standard ? 'invisible' : undefined}
        disabled={standard}
        onClick={() => aendern(e.standard)}
      >
        <RotateCcw aria-hidden className="size-4" />
      </Knopf>
    </li>
  )
}
