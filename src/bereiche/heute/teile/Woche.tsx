import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "../../../bausteine/cn";
import { useEinstellung } from "../../../geruest/einstellungen";
import { einstellungen } from "../../../logik/einstellungen";
import {
  fuellstand,
  kalenderwoche,
  monatsTage,
  tagSchluessel,
} from "../../../logik/heute";
import type { Eintrag } from "../../../vertrag/eintrag";
import { monatName, tagKurz, tagLang } from "../../../geruest/format";

const kwZeigen = einstellungen.find((e) => e.id === "kalenderwoche")!;

type Props = {
  termine: readonly Eintrag[];
  monat: Date;
  fokus: Date;
  jetzt: Date;
};

/** Wochenleiste: die Tage des Monats mit Füllstand, sieben sichtbar, wischbar innerhalb des Monats. */
export function Woche({ termine, monat, fokus, jetzt }: Props) {
  const scroller = useRef<HTMLOListElement>(null);
  const kw = useEinstellung(kwZeigen) === true;
  const tage = monatsTage(monat);
  // Erster sichtbarer Tag; nach ihm richtet sich die Kalenderwoche oben links.
  const [vorn, setVorn] = useState(fokus.getDate() - 1);
  const heute = tagSchluessel(jetzt);
  const ziel = fokus.getTime();

  // Beim Öffnen und nach einer Wahl im Monatskalender: der gewählte Tag steht vorn.
  useLayoutEffect(() => {
    const el = scroller.current;
    const tag = new Date(ziel);
    if (el) el.scrollLeft = (tag.getDate() - 1) * (el.clientWidth / 7);
  }, [ziel]);

  const ersterSichtbar = tage[Math.min(tage.length - 1, Math.max(0, vorn))];
  return (
    <div className="flex h-full flex-col">
      {kw && <p className="beschriftung">KW {kalenderwoche(ersterSichtbar)}</p>}
      <ol
        ref={scroller}
        className="tage-scroller min-h-0 flex-1"
        aria-label={`Tage im ${monatName(monat)}`}
        onScroll={(e) =>
          setVorn(
            Math.round(
              e.currentTarget.scrollLeft / (e.currentTarget.clientWidth / 7),
            ),
          )
        }
      >
        {tage.map((t) => {
          const f = fuellstand(termine, t);
          const ist = tagSchluessel(t) === heute;
          return (
            <li
              key={t.getTime()}
              title={`${tagLang(t)}: ${Math.round(f * 100)} % belegt`}
              className="p-0.5"
            >
              <div
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1.5 rounded-knopf",
                  ist && "border border-akzent bg-knopf-ton",
                )}
              >
                <span
                  className={cn(
                    "text-xs",
                    ist ? "text-akzent" : "text-text-gedaempft",
                  )}
                >
                  {tagKurz(t)}
                </span>
                <span
                  aria-current={ist ? "date" : undefined}
                  className={cn(
                    "font-semibold",
                    ist
                      ? "text-akzent"
                      : t < jetzt
                        ? "text-text-gedaempft"
                        : "text-text",
                  )}
                >
                  {t.getDate()}
                </span>
                <span
                  className="tag-fuellung"
                  style={{ "--anteil": f } as CSSProperties}
                >
                  <span />
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
