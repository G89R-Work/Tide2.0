import { Folder, ListFilter, Settings } from "lucide-react";
import { Knopf } from "../bausteine/Knopf";
import { cn } from "../bausteine/cn";
import { aktionVon } from "../logik/aktionen";
import { markeFuer } from "../logik/ebenen";
import { ordnerListe, type OrdnerZeile } from "../logik/ordner";
import { aktionSymbole } from "./aktionSymbole";
import { EbenenZeile } from "./EbenenZeile";
import { ebenenSymbol } from "./ebenenSymbole";
import { useOrdner } from "./useOrdner";

const neueMail = aktionVon("neue-mail")!;
const NeuSymbol = aktionSymbole["neue-mail"];

// Ordnerleiste des Postfachs wie die Vorlage (bilder/postfach-ordner.jpg): Neue Mail, Systemordner,
// deine Ordner mit Unterordnern, intelligente Ordner, unten Einstellungen.
export function PostfachOrdner({
  aktiv,
  beiWahl,
}: {
  aktiv: string | null;
  beiWahl?: () => void;
}) {
  const { ordner, fehler } = useOrdner();
  const liste = ordner ? ordnerListe(ordner) : null;

  const gruppe = (
    titel: string | undefined,
    zeilen: OrdnerZeile[],
    ersatz: typeof Folder,
  ) =>
    zeilen.length > 0 && (
      <>
        {titel && <p className="beschriftung px-3 pt-3 pb-1">{titel}</p>}
        <ul className="flex flex-col gap-1">
          {zeilen.map((o) => (
            <EbenenZeile
              key={o.id}
              href={markeFuer("postfach", o.id)}
              name={o.name}
              aktiv={o.id === aktiv}
              Symbol={ebenenSymbol("postfach", o.id) ?? ersatz}
              zahl={o.zahl}
              wichtig={o.wichtig}
              tiefe={o.tiefe}
              onClick={beiWahl}
            />
          ))}
        </ul>
      </>
    );

  return (
    <div className="flex min-h-full flex-col">
      <Knopf alsKind art="haupt" className="mb-2 w-full">
        <a href={neueMail.ziel} onClick={beiWahl}>
          <NeuSymbol aria-hidden className="size-4" /> {neueMail.name}
        </a>
      </Knopf>
      {fehler && <p className="px-3 text-sm text-warnung">{fehler}</p>}
      {liste && (
        <>
          {gruppe(undefined, liste.system, Folder)}
          {liste.system.length > 0 && <hr className="mx-3 mt-2 border-linie" />}
          {gruppe("Deine Ordner", liste.eigene, Folder)}
          {gruppe("Intelligente Ordner", liste.intelligent, ListFilter)}
        </>
      )}
      <div className="mt-auto pt-3">
        <Knopf
          alsKind
          className={cn("w-full", aktiv === "einstellungen" && "border-akzent")}
        >
          <a
            href={markeFuer("postfach", "einstellungen")}
            aria-current={aktiv === "einstellungen" ? "page" : undefined}
            onClick={beiWahl}
          >
            <Settings aria-hidden className="size-4" /> Einstellungen
          </a>
        </Knopf>
      </div>
    </div>
  );
}
