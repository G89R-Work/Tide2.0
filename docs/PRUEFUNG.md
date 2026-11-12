# Prüfung: Umwege und Eigenbau

Stand 2026-11-12, geprüft: `src/`, `skripte/`, `.claude/settings.json`. Grundlage: Regeln A und B in `CLAUDE.md`.
Noch nichts davon ist umgebaut. Neue Bausteine brauchen das Ja des Nutzers (siehe „Fragen“ unten).

Bewertung: **hoch** = verletzt „eine Quelle der Wahrheit“ oder birgt echte Fehler · **mittel** = deutlich mehr Eigenbau als nötig · **niedrig** = vertretbar, nur beobachten.

## Teil 1: Umwege, Erzwungenes, doppelte Quellen

| # | Fund | Wo | Bewertung | Richtige Lösung an der Quelle |
|---|---|---|---|---|
| U1 | **Vier getrennte Rückgängig-Stapel.** Alt+Z kennt nur einen davon. „Kurve ein/aus“ landet in zwei Stapeln zugleich. | `geruest/rueckgaengig.ts`, `geruest/einstellungen.ts` (`vorher`, `einstellungenZurueck`), `kacheln/anordnung.ts` (`vorher`, `zurueck`), `geruest/belegung.ts` (`vorher`, `belegungZurueck`) | hoch | Ein einziger Stapel in `rueckgaengig.ts`. Die drei anderen rufen nur noch `merke(…)`. Die Rückgängig-Knöpfe in Einstellungen, Bearbeiten-Leiste und Knöpfe-Belegen rufen `rueckgaengig()`. |
| U2 | Die 6 Sekunden für Meldungen stehen zweimal. | `geruest/meldungen.ts:71`, `geruest/rueckgaengig.ts:34` | hoch | Einmal in `src/werte/` (Bewegung), beide lesen dort. |
| U3 | Uhrzeit „HH:MM“ wird an fünf Stellen selbst gebaut. | `geruest/format.ts` (`uhrzeit`), `geruest/Glocke.tsx:8` (`uhr`), `geruest/KurveEintraege.tsx:30` (`zeitText`), `geruest/Gezeitenkurve.tsx:41`, `logik/meldungen.ts:16` | hoch | Nur `format.ts` (bzw. date-fns `format`, siehe E3). |
| U4 | Zwei verschiedene Hooks heißen `useTermine`, zwei heißen `useWetter`, mit unterschiedlichem Verhalten. | `geruest/useTermine.ts` und `geruest/kurveDaten.ts`; `geruest/useWetter.ts` und `geruest/kurveDaten.ts` | hoch | Je ein Hook pro Anfrage (fällt mit E1 von selbst weg). |
| U5 | Tagesbeginn/Mitternacht doppelt gerechnet. | `logik/heute.ts:10` (`mitternacht`), `geruest/Gezeitenkurve.tsx:39` (`tagBeginnVon`) | mittel | Eine Funktion in `src/logik/` (bzw. date-fns `startOfDay`). |
| U6 | Ruhezeit „bis 7:00“ als fester Text, obwohl `RUHE_BIS` in der Logik steht. | `geruest/Glocke.tsx:61` | mittel | Text aus `RUHE_BIS` bilden. |
| U7 | Feste Pixelwerte außerhalb von `src/werte/` (Regel 2); die Werte-Prüfung erkennt Zahlen in TS nicht. | `geruest/Glocke.tsx` (`288`, `296`, `8`), `geruest/KurveEintraege.tsx` (`FINGER = 44`, `BESCHRIFTUNG_MIN = 28`) | mittel | Werte nach `src/werte/`; fällt bei Glocke mit E4 weg. |
| U8 | `einstellungen.find((e) => e.id === '…')!` an 12 Stellen. Das `!` erzwingt, dass es die Einstellung gibt; ein Tippfehler fällt erst beim Start auf. | u. a. `kacheln/bearbeiten.ts`, `kacheln/anordnung.ts`, `geruest/meldungen.ts`, `geruest/useWetter.ts`, `geruest/Gezeitenkurve.tsx`, `geruest/Hintergrund.tsx`, `bereiche/heute/*` | mittel | In `logik/einstellungen.ts` die Liste mit festen Schlüsseln anlegen (`as const`), dann prüft TypeScript jeden Namen. |
| U9 | Erzwungene Typen per `as`: `useEinstellung(x) as Wochenbeginn`, `as Bahn`; Server-Antworten `(await r.json()) as T`, `request.json() as Aenderung`. Was wirklich ankommt, prüft niemand (Regel 9). | `bereiche/heute/Seite.tsx:26`, `geruest/Hintergrund.tsx:42`, `vertrag/eintrag.ts:31`, `vertrag/wetter.ts:17`, `attrappe/*.ts` | mittel | Wert-Typ an der Einstellung selbst festlegen (U8); Antworten mit Schema prüfen (E5). |
| U10 | Escape wird von mehreren globalen Lauschern in der Erfassungsphase verteilt, die sich über `:popover-open` und `defaultPrevented` absprechen. Reihenfolge-abhängig. | `kacheln/Raster.tsx:52`, `kacheln/KachelMenue.tsx:47` | mittel | Folge des Eigenbau-Menüs; mit E4 regelt das der Baustein. |
| U11 | Lage von Menüs und Karten wird von Hand am Fensterrand festgeklemmt. | `kacheln/KachelMenue.tsx:29`, `geruest/Glocke.tsx:26`, `geruest/KurveEintraege.tsx:69` | mittel | E4. |
| U12 | Stil von react-grid-layout von außen überschrieben (`.react-draggable-dragging { z-index }`). | `src/werte/werte.css:358` | niedrig | Vom Baustein so vorgesehen (er liefert keine eigene Ebene). Bleibt. |
| U13 | Lesen in `node_modules` ist gesperrt. `STATUS.md` beschreibt als Ersatz, Schnittstellen über absichtliche Typfehler zu erraten. Das ist selbst ein Umweg und erschwert Regel B. | `.claude/settings.json` | mittel | `Read(./node_modules/**/*.d.ts)` und `README.md` erlauben, Rest gesperrt lassen; oder Doku im Internet lesen. |

Nicht gefunden: `!important`, `@ts-ignore`, `@ts-expect-error`, `as any`, abgeschaltete Stilregeln, übersprungene Tests (`.skip`), verschluckte Fehler in den Skripten. `setTimeout` kommt nur für echte Wartezeiten vor (Minute, 6 Sekunden), nicht gegen Zeitprobleme.

## Teil 2: Eigenbau, wo ein Baustein klüger wäre

| # | Selbst gebaut | Wo | Baustein | Nutzen | Bewertung |
|---|---|---|---|---|---|
| E1 | Daten holen, Fehler, „noch aktiv?“-Merker, sofort zeigen und bei Fehler zurückrollen – sieben Mal von Hand | `geruest/kurveDaten.ts`, `useTermine.ts`, `useWetter.ts`, `meldungen.ts` (`useErinnerungen`), `einstellungen.ts`, `kacheln/anordnung.ts` | **TanStack Query** (`@tanstack/react-query`) | Zwischenspeicher, doppelte Anfragen fallen weg, Neuladen beim Zurückkehren, Optimistic Update mit Zurückrollen eingebaut. Löst U4. Ist der Standard für genau das. | hoch |
| E2 | Fünf eigene Speicher mit `useSyncExternalStore` und Hörer-Liste, dazu `localStorage` mit try/catch | `rueckgaengig.ts`, `meldungen.ts`, `einstellungen.ts`, `anordnung.ts`, `belegung.ts` | **Zustand** (mit `persist`) | Ein Muster statt fünf; Speichern im Browser fertig. Nach E1 bleiben nur Meldungen, Rückgängig, Belegung. | mittel |
| E3 | Datumsrechnung: Mitternacht, Tage addieren, Tage zwischen, ISO-Kalenderwoche, Tage des Monats, Wochenbeginn, „JJJJ-MM-TT“, zweistellige Zahlen | `logik/heute.ts`, `logik/meldungen.ts`, `attrappe/termine.ts`, `bereiche/heute/*`, `Gezeitenkurve.tsx` | **date-fns** (`startOfDay`, `addDays`, `differenceInCalendarDays`, `getISOWeek`, `eachDayOfInterval`, `startOfWeek`, `format` mit `de`) | Bewährt bei Sommerzeit und Jahreswechsel; eigene Tests dafür fallen weg. Löst U3, U5. | hoch |
| E4 | Menüs und schwebende Karten: eigenes Schließen, Pfeiltasten, Fokus, Lage am Rand | `kacheln/KachelMenue.tsx`, `geruest/Glocke.tsx`, `KurveEintraege.tsx` (`KarteFenster`) | **shadcn/ui DropdownMenu und Popover** (Radix) | Tastatur, Fokus, Esc, Lage, Vorlesen fertig. Löst U7, U10, U11. Hinweis: 2026-11-11 wurde Radix *ContextMenu* wegen langem Druck auf iOS abgelehnt; ein *DropdownMenu* mit gesteuertem `open` und Anker am Fingerpunkt hat das Problem nicht. | mittel |
| E5 | Gespeicherte Daten von Hand prüfen (`typeof … === 'object'`, Ersatzwerte) | `logik/kacheln.ts` (`anordnungAusDaten`), `logik/aktionen.ts` (`belegungAusText`), `logik/einstellungen.ts` | **Zod** oder **Valibot** | Ein Schema je Vertrag prüft Attrappe, Server und Gemerktes gleich; Ersatzwerte per `.catch()`. Löst U9. | mittel |
| E6 | Tastenkürzel lesen und verteilen | `geruest/useTastenkuerzel.ts`, `logik/aktionen.ts` (`kuerzelAus`) | react-hotkeys-hook oder tinykeys | Weniger Code; die Regel „in Feldern nur Strg“ bringen beide mit. Klein und getestet, darum geringer Gewinn. | niedrig |
| E7 | Sprungmarken-Navigation | `geruest/useSprungmarke.ts` | wouter (`useHashLocation`) | Erst lohnend, wenn Unterseiten und Parameter dazukommen. | niedrig |
| E8 | Termine auf der Kurve ziehen (Pointer-Capture von Hand) | `geruest/KurveEintraege.tsx:76` | @use-gesture/react | Kurz und eng an die Kurve gebunden; beobachten, ob weitere Zieh-Stellen kommen. | niedrig |
| E9 | Schalter, Eingabe, Auswahl als native Felder | `src/bausteine/` | shadcn Switch/Input/Select | Nativ ist zugänglich und schnell; vertretbar. | niedrig |

Gut gelöst (bleibt): react-grid-layout, react-resizable-panels, SunCalc, d3-shape, MSW, lucide, shadcn-Knopf, `Intl` für Datumsnamen, natives `dialog` im Handy-Menü, `useMinute`, `useSchmal`, endloses Scrollen der Kurve (kein passender Baustein).

## Empfohlene Reihenfolge
1. U1 (ein Rückgängig-Stapel) – kein neuer Baustein nötig, größter Fehler.
2. E3 date-fns – löst U3, U5.
3. E1 TanStack Query – löst U4 und den Großteil von E2.
4. E4 shadcn DropdownMenu/Popover – löst U7, U10, U11.
5. E5 Zod – mit U8, U9.
6. Rest bei Gelegenheit.

## Antwort des Nutzers (2026-11-12)
Alles umsetzen, aber getrennt in Scheiben vor `heute-uhr-und-wetter`. Plan: `docs/FAHRPLAN.md`, Zwischenetappe „Aufräumen“. Alle genannten Bausteine sind freigegeben. Neue Regel C (alles nur einmal) steht in `CLAUDE.md`. U13 (Lesesperre) wartet noch auf eine eigene Bestätigung.
